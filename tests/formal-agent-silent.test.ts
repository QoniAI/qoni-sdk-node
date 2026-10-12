import { describe, expect, it } from "vitest";
import { Qoni, QoniError, QoniValidationError } from "../src/index";

const agentId = "01234567-89ab-4cde-8f01-23456789abcd";
const host = "https://control.synthetic.invalid";
const silentInput = { agentId, userId: "synthetic-user", scopes: ["agent.mail:read"], expiresIn: "30m" };
// These are transport fixtures, not evidence of backend consent/token issuance.
const granted = { statusCode: 200, data: {
  mode: "silent", tokenType: "Bearer", token: "synthetic-delegation-token", expiresIn: 1800,
  grantId: "synthetic-grant", auditId: "synthetic-audit",
} };
const needsAuthorization = {
  statusCode: 403, code: "eak.delegation.needs_authorization",
  message: "Delegation consent rejected: needs_authorization", details: { reason: "needs_authorization" },
};

function transport(payload: unknown = granted, status = 200, failure?: Error) {
  const calls: { url: string; method: string | undefined; body: Record<string, unknown> }[] = [];
  const q = new Qoni({ accessKey: "synthetic-ak", secretKey: "synthetic-sk", host,
    fetch: (async (url, init) => {
      calls.push({ url: String(url), method: init?.method, body: JSON.parse(String(init?.body)) });
      if (failure) throw failure;
      return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
    }) as typeof fetch,
  });
  return { q, calls };
}

describe("formal Agent silent is a single delegation request, not an authorization workflow", () => {
  for (const mode of [undefined, "silent"] as const) {
    const label = mode === undefined ? "default silent" : "explicit silent";
    const input = { ...silentInput, ...(mode ? { mode } : {}) };
    it(`${label} reaches the signed transport once with the formal UUID and user`, async () => {
      const { q, calls } = transport();
      const result = await q.genauth.delegateAgent(input as any);
      expect(result).toMatchObject({ mode: "silent", token: "synthetic-delegation-token", grantId: "synthetic-grant", auditId: "synthetic-audit" });
      expect(calls).toEqual([{ url: `${host}/api/v3/eak/delegations`, method: "POST", body: {
        agentId, userId: "synthetic-user", scopes: ["agent.mail:read"], expiresIn: 1800,
        ...(mode ? { mode: "silent" } : {}),
      } }]);
      expect(calls[0].body).not.toHaveProperty("agent");
      expect(calls[0].body).not.toHaveProperty("agentKey");
      expect(calls[0].body).not.toHaveProperty("redirectUri");
    });
    it(`${label} preserves needs_authorization and never requests interactive/renewal`, async () => {
      const { q, calls } = transport(needsAuthorization, 403);
      const error = await q.genauth.delegateAgent(input as any).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(QoniError);
      expect(error).toMatchObject({ status: 403, code: "eak.delegation.needs_authorization", retryable: false, body: needsAuthorization });
      expect(calls).toEqual([{ url: `${host}/api/v3/eak/delegations`, method: "POST", body: {
        agentId, userId: "synthetic-user", scopes: ["agent.mail:read"], expiresIn: 1800,
        ...(mode ? { mode: "silent" } : {}),
      } }]);
    });
  }

  it("root delegateToken preserves its response envelope for formal default silent", async () => {
    const { q, calls } = transport();
    const result = await q.delegateToken(silentInput as any);
    expect(result.data).toMatchObject({ mode: "silent", token: "synthetic-delegation-token" });
    expect(calls).toHaveLength(1);
    expect(calls[0].body.agentId).toBe(agentId);
  });

  it.each([
    ["HTTP 503", { statusCode: 503, code: "eak.delegation.source_unknown", message: "Synthetic source unknown" }, 503, undefined],
    ["network outcome unknown", undefined, 200, new TypeError("Synthetic transport failure")],
  ] as const)("%s is surfaced after one dispatch without mutation retries", async (_label, payload, status, failure) => {
    const { q, calls } = transport(payload, status, failure);
    const error = await q.genauth.delegateAgent({ ...silentInput, mode: "silent" } as any).catch((e: unknown) => e);
    // Preserve the existing transport exception contract; do not add error wrapping.
    if (failure) expect(error).toBe(failure);
    else expect(error).toBeInstanceOf(QoniError);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`${host}/api/v3/eak/delegations`);
    expect(calls[0].body.mode).toBe("silent");
  });

  it.each([
    ["non UUID", { agentId: "not-an-iam-uuid" }],
    ["UUID plus agent label", { agent: "legacy-label" }],
    ["UUID plus agentKey label", { agentKey: "legacy-label" }],
    ["missing default-silent user", { userId: undefined }],
    ["missing explicit-silent user", { userId: undefined, mode: "silent" }],
    ["empty user", { userId: "" }],
    ["mixed wildcard remains unsupported", { scopes: ["*", "agent.mail:read"] }],
    ["malformed scope", { scopes: ["profile:read"] }],
    ["empty scopes", { scopes: [] }],
    ["TTL below minimum", { expiresIn: 59 }],
    ["TTL above maximum", { expiresIn: 86401 }],
    ["fractional TTL", { expiresIn: 60.5 }],
    ["malformed TTL", { expiresIn: "0.5h" }],
    ["unsupported deniedScopes", { deniedScopes: ["agent.mail:send"] }],
  ])("%s still fails locally with zero transport calls", async (_label, overrides) => {
    const { q, calls } = transport();
    await expect(q.genauth.delegateAgent({ ...silentInput, ...overrides } as any)).rejects.toBeInstanceOf(QoniValidationError);
    expect(calls).toHaveLength(0);
  });

  it("a legacy audit label never gains formal mailbox scope", async () => {
    const { q, calls } = transport();
    await expect(q.genauth.delegateAgent({ mode: "silent", userId: "synthetic-user", agent: "legacy-label", scopes: ["agent.mail:read"] })).rejects.toBeInstanceOf(QoniValidationError);
    expect(calls).toHaveLength(0);
  });

  it("interactive remains interactive and sends no caller userId or synthetic label", async () => {
    const { q, calls } = transport({ statusCode: 200, data: { mode: "interactive", grantId: "synthetic-grant", grantState: "synthetic-G", authorizationUrl: `${host}/delegations/synthetic-grant/authorize` } });
    const result = await q.genauth.delegateAgent({ agentId, mode: "interactive", redirectUri: "https://app.synthetic.invalid/callback", state: "synthetic-D", scopes: ["agent.mail:read"], expiresIn: "30m" });
    expect(result).toMatchObject({ mode: "interactive", grantId: "synthetic-grant", grantState: "synthetic-G" });
    expect(calls).toEqual([{ url: `${host}/api/v3/eak/delegations`, method: "POST", body: {
      agentId, mode: "interactive", redirectUri: "https://app.synthetic.invalid/callback", state: "synthetic-D", scopes: ["agent.mail:read"], expiresIn: 1800,
    } }]);
  });
});
