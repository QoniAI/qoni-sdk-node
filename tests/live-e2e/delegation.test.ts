import { beforeAll, describe, expect, it } from "vitest";
import type { InteractiveDelegationResponse, JsonObject } from "../../src";
import { QoniError } from "../../src";
import { requiredEnv } from "../helpers/env";
import { loadQueryMatrix } from "../helpers/query-matrix";
import {
  delegateLiveToken,
  liveClient,
  liveE2EEnabled,
  resolveLiveUserId,
  webSearchScopes,
} from "./helpers";

/**
 * Live coverage of the DELEGATION entry points on the client and on the `qoni.*`
 * namespace, including the deprecated aliases that ship in the public surface.
 *
 * Two distinct flows live here:
 *
 *  - SILENT delegation (`delegateToken` / `delegateAgent`): the AK/SK holder
 *    mints a scoped token for a bound GenAuth user with no human in the loop.
 *    Fully live — every alias is exercised against the real gateway and the
 *    minted token is proved to be a working credential.
 *
 *  - INTERACTIVE delegation (`delegateToken({ mode: "interactive" })` +
 *    `completeDelegateToken`): the gateway issues an authorization URL that a
 *    HUMAN must open and approve in the Qoni Console; the resulting `code` is
 *    what `completeDelegateToken` exchanges. The grant creation half is fully
 *    live. The exchange half CANNOT be completed from a test process — see the
 *    comment on the exchange test — so it is covered on its real rejection
 *    path: the request is genuinely sent to `/api/v3/qoni/delegations/complete`
 *    and the backend's documented refusal is asserted. No code is fabricated.
 */

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;
const matrix = liveE2EEnabled ? loadQueryMatrix() : undefined;

/** A redirect target that is a real public HTTPS URL but receives nothing. */
const REDIRECT_URI = "https://example.com/qoni/delegation/callback";

/** Decode a JWT's payload claims without verifying (the gateway signs it). */
function jwtClaims(token: string): JsonObject {
  const [, payload] = token.split(".");
  expect(payload, "a delegation token must be a JWT").toBeTruthy();
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JsonObject;
}

/** Assert a minted delegation token really is a scoped token for `userId`. */
function expectDelegationToken(token: string, userId: string, agent: string): void {
  const claims = jwtClaims(token);
  expect(claims.token_type).toBe("qoni_delegation_token");
  expect(claims.sub, "the token is minted for the delegated user").toBe(userId);
  expect(claims.agent_id, "the audit label rides in the token").toBe(agent);
  expect(claims.scope, "the granted scopes are the requested ones").toEqual([...webSearchScopes]);
  expect(Number(claims.exp)).toBeGreaterThan(Math.floor(Date.now() / 1000));
}

describeLiveE2E("live e2e: delegation (silent, interactive, and the qoni.* aliases)", () => {
  let client: ReturnType<typeof liveClient>;
  let userId: string;
  let agent: string;

  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    agent = requiredEnv("QONI_AGENT_ID");
    userId = await resolveLiveUserId(client);
  });

  const silentInput = () => ({
    mode: "silent" as const,
    user: { id: userId },
    agent,
    scopes: [...webSearchScopes],
    expiresIn: 600,
  });

  it("delegateAgent() (deprecated alias) mints the same silent token as delegateToken()", async () => {
    const viaAlias = await client.delegateAgent(silentInput());
    const data = viaAlias.data as { token: string; mode: string; tokenType: string; grantId?: string };
    expect(data.mode).toBe("silent");
    expect(data.tokenType).toBe("Bearer");
    expectDelegationToken(data.token, userId, agent);
    // The gateway attributes the call — a real audited request, not a stub.
    expect(viaAlias.meta.requestId).toBeTruthy();

    // The deprecated alias forwards to delegateToken: same claims, same shape.
    const viaCanonical = await client.delegateToken(silentInput());
    const canonical = viaCanonical.data as { token: string };
    expect(jwtClaims(canonical.token).scope).toEqual(jwtClaims(data.token).scope);
    expect(jwtClaims(canonical.token).sub).toBe(jwtClaims(data.token).sub);
  });

  it("qoni.delegateToken() / qoni.delegateAgent() mint working credentials", async () => {
    const viaNamespace = await client.qoni.delegateToken(silentInput());
    const namespaceToken = (viaNamespace.data as { token: string }).token;
    expectDelegationToken(namespaceToken, userId, agent);

    const viaNamespaceAlias = await client.qoni.delegateAgent(silentInput());
    const aliasToken = (viaNamespaceAlias.data as { token: string }).token;
    expectDelegationToken(aliasToken, userId, agent);

    // Proof the minted token is a real credential and not just a well-shaped
    // JWT: it authorizes a scoped WebAgent read. An unauthorized token would
    // come back 401/403 here; an unknown run comes back 404, which is exactly
    // what "authorized, but that run does not exist" looks like.
    let status: number | undefined;
    try {
      await client.webSearch.api.get({
        token: namespaceToken,
        runId: "00000000-0000-4000-8000-000000000000",
      });
    } catch (error) {
      status = (error as QoniError).status;
    }
    expect(status, "the delegated token must pass authorization").toBe(404);
  });

  it("delegateToken({ mode: 'interactive' }) returns a real authorization grant", async () => {
    const response = await client.delegateToken({
      mode: "interactive",
      redirectUri: REDIRECT_URI,
      state: `sdk-live-${Date.now()}`,
      user: { id: userId },
      agent,
      scopes: [...webSearchScopes],
      expiresIn: 600,
    });
    const grant = response.data as InteractiveDelegationResponse;
    expect(grant.mode).toBe("interactive");
    expect(grant.grantId).toBeTruthy();
    // Interactive delegation issues NO token — that is the whole point.
    expect((grant as unknown as { token?: string }).token).toBeUndefined();

    // The authorization URL is the human-facing consent page; assert it really
    // encodes this grant, this redirect target and these scopes.
    const url = new URL(grant.authorizationUrl);
    expect(url.protocol).toBe("https:");
    expect(url.pathname).toContain(grant.grantId);
    expect(url.searchParams.get("grant_id")).toBe(grant.grantId);
    expect(url.searchParams.get("redirect_uri")).toBe(REDIRECT_URI);
    expect(url.searchParams.get("grant_state")).toBe(grant.grantState);
    expect(url.searchParams.get("scope")?.split(" ").sort()).toEqual([...webSearchScopes].sort());
    // The SDK mirrors the server's grant state onto `state` so a consumer can
    // round-trip a single value through the browser redirect.
    expect(grant.state).toBe(grant.grantState);
  });

  it(
    "completeDelegateToken() and its aliases reach the exchange route and are refused without a human-approved code",
    async () => {
      // WHY THIS IS A NEGATIVE-PATH TEST (not a fabricated success):
      // `POST /api/v3/qoni/delegations/complete` exchanges an authorization
      // `code` that ONLY the Qoni Console issues after a signed-in end user
      // clicks approve on `authorizationUrl`. Verified against this deployment:
      //   * `POST /api/v3/qoni/delegations/{grantId}/approve` exists, but it
      //     307s to `/delegations/{grantId}/login` for every non-browser
      //     credential we hold (AK/SK signature, `QONI_USER_ACCESS_TOKEN` as
      //     Bearer, as `x-genauth-token`, and as a session cookie).
      //   * There is no API that returns a code for a grant.
      // So a green "exchange succeeded" here could only come from inventing a
      // code, which would test nothing. Instead the real request is sent with
      // the REAL grant id and state and the backend's documented refusal is
      // asserted — which does prove the SDK's path, signing, body and error
      // normalization for all four entry points.
      const grant = (
        await client.delegateToken({
          mode: "interactive",
          redirectUri: REDIRECT_URI,
          state: `sdk-live-${Date.now()}`,
          user: { id: userId },
          agent,
          scopes: [...webSearchScopes],
          expiresIn: 600,
        })
      ).data as InteractiveDelegationResponse;

      // The grant was never approved, so no code exists for it. Send a value
      // that is transparently not an issued code.
      const unapproved = {
        grantId: grant.grantId,
        code: "sdk-live-e2e-never-issued",
        state: grant.state,
      };

      const entryPoints: Array<[string, () => Promise<unknown>]> = [
        ["completeDelegateToken", () => client.completeDelegateToken(unapproved)],
        ["completeDelegateAgent", () => client.completeDelegateAgent(unapproved)],
        ["qoni.completeDelegateToken", () => client.qoni.completeDelegateToken(unapproved)],
        ["qoni.completeDelegateAgent", () => client.qoni.completeDelegateAgent(unapproved)],
      ];

      for (const [label, call] of entryPoints) {
        let caught: unknown;
        try {
          await call();
        } catch (error) {
          caught = error;
        }
        expect(caught, `${label} must be refused by the backend`).toBeInstanceOf(QoniError);
        const error = caught as QoniError;
        // The exact backend contract — not a generic transport failure.
        expect(error.status, `${label} status`).toBe(400);
        expect(error.code, `${label} code`).toBe("qoni.delegation.grant_invalid_or_expired");
        expect(error.message).toContain("delegation grant is invalid or expired");
      }
    },
  );

  it("the shared live helper's delegateToken() path still yields a usable token", async () => {
    // helpers.delegateLiveToken is what every other live suite depends on;
    // exercising it here keeps that dependency honest.
    const delegated = await delegateLiveToken(client, webSearchScopes);
    expect(delegated.userId).toBe(userId);
    expectDelegationToken(delegated.token, userId, agent);
  });
});
