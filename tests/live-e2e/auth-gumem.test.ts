import { beforeAll, describe, expect, it } from "vitest";
import {
  allowLiveEnvironmentConstraint,
  delegateLiveToken,
  gumemScopes,
  liveE2EEnabled,
  liveClient,
  liveRequireAll,
  liveRuntime,
  livePrefix,
} from "./helpers";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;
const itWithUserAccessToken = process.env.EAK_USER_ACCESS_TOKEN ? it : it.skip;
const rawRequestPath = liveRuntime?.rawRequestPath;
const itWithRawRequestPath = rawRequestPath || liveRequireAll ? it : it.skip;

describeLiveE2E("live e2e: auth and GUMem", () => {
  let client: ReturnType<typeof liveClient>;
  let delegated:
    | Promise<Awaited<ReturnType<typeof delegateLiveToken>>>
    | undefined;
  let sessionReady: Promise<void> | undefined;
  const sessionId = `${livePrefix}-gumem`;
  const messageContent = `${livePrefix} live e2e message`;
  const actionContent = `${livePrefix} action`;

  beforeAll(() => {
    client = liveClient();
  });

  function ensureDelegation() {
    delegated ??= delegateLiveToken(client, gumemScopes);
    return delegated;
  }

  function ensureSession() {
    sessionReady ??= (async () => {
      const { token, userId } = await ensureDelegation();
      await client.gumem.createSession({
        token,
        userId,
        sessionId,
        title: `${livePrefix} GUMem live e2e`,
        metadata: { source: "eak-sdk-node-live-e2e", livePrefix },
      });
    })();
    return sessionReady;
  }

  it("delegateToken({ mode: silent, user, agent, scopes, expiresIn })", async () => {
    const { token, userId } = await ensureDelegation();
    expect(token).toBeTruthy();
    expect(userId).toBeTruthy();
  });

  it("genauth.discovery() exposes an OpenID configuration", async () => {
    const discovery = await client.genauth.discovery<Record<string, unknown>>();
    expect(discovery.data).toBeTruthy();
    expect(JSON.stringify(discovery.data)).toMatch(/issuer|jwks/i);
  });

  it("genauth.jwks() exposes signing keys", async () => {
    const jwks = await client.genauth.jwks<{ keys?: unknown[] }>();
    expect(Array.isArray(jwks.data.keys)).toBe(true);
    expect(jwks.data.keys?.length).toBeGreaterThan(0);
  });

  it("genauth.introspectDelegationToken({ token }) recognizes the delegated token", async () => {
    const { token } = await ensureDelegation();
    const introspection = await client.genauth.introspectDelegationToken<Record<string, unknown>>({
      token,
    });
    expect(introspection.data).toBeTruthy();
    expect(JSON.stringify(introspection.data)).not.toBe("{}");
  });

  itWithUserAccessToken("currentUser({ accessToken }) resolves a logged-in user", async () => {
    const accessToken = process.env.EAK_USER_ACCESS_TOKEN!;
    const user = await client.currentUser({ accessToken });
    expect(user.data).toBeTruthy();
  });

  itWithUserAccessToken("genauth.userInfo({ accessToken }) resolves the same login", async () => {
    const accessToken = process.env.EAK_USER_ACCESS_TOKEN!;
    const user = await client.genauth.userInfo<Record<string, unknown>>({ accessToken });
    expect(user.data).toBeTruthy();
  });

  it("resolveAnyBoundUser() resolves a real userpool member", async () => {
    await expect(client.resolveAnyBoundUser()).resolves.toMatch(/\S/);
  });

  itWithRawRequestPath("request({ method, path }) executes a configured signed request", async () => {
    if (!rawRequestPath) throw new Error("runtime.rawRequestPath is required for strict live E2E");
    const response = await client.request({ method: "GET", path: rawRequestPath });
    expect(response.data).toBeTruthy();
  });

  itWithRawRequestPath("unstableRequest({ method, path }) remains a working alias", async () => {
    if (!rawRequestPath) throw new Error("runtime.rawRequestPath is required for strict live E2E");
    const response = await client.unstableRequest({ method: "GET", path: rawRequestPath });
    expect(response.data).toBeTruthy();
  });

  it("gumem.createSession({ userId, sessionId, title, metadata })", async () => {
    await ensureSession();
    expect(sessionId).toBeTruthy();
  });

  it("gumem.addMessages({ sync, messages })", async () => {
    await ensureSession();
    const { token, userId } = await ensureDelegation();
    const added = await client.gumem.addMessages({
      token,
      userId,
      sessionId,
      sync: true,
      messages: [{ role: "user", content: messageContent }],
    });
    expect(added.data).toBeDefined();
  });

  it("gumem.recall({ query, details, recallConfig, metadataFilters })", async () => {
    await ensureSession();
    const { token } = await ensureDelegation();
    const recall = await client.gumem.recall({
      token,
      sessionId,
      query: `${livePrefix} live e2e`,
      details: true,
      recallConfig: { topK: 3 },
      metadataFilters: { source: "eak-sdk-node-live-e2e" },
    });
    expect(recall.data).toBeTruthy();
    expect(JSON.stringify(recall.data)).toContain(livePrefix);
  });

  it("gumem.uploadResource({ file, filename, contentType })", async () => {
    await ensureSession();
    const { token, userId } = await ensureDelegation();
    const uploaded = await allowLiveEnvironmentConstraint(
      client.gumem.uploadResource({
        token,
        userId,
        sessionId,
        file: new Blob([`${livePrefix} live e2e resource`], { type: "text/plain" }),
        filename: `${livePrefix}.txt`,
        contentType: "text/plain",
      }),
    );
    if (uploaded) expect(uploaded.data).toBeDefined();
  });

  it("gumem.actions.record({ user_id, session_id, event_type, timestamp, content })", async () => {
    await ensureSession();
    const { token, userId } = await ensureDelegation();
    const recorded = await client.gumem.actions.record({
      token,
      user_id: userId,
      session_id: sessionId,
      event_type: "sdk_live_e2e",
      timestamp: new Date().toISOString(),
      content: actionContent,
    });
    expect(recorded.data).toBeDefined();
  });

  it("gumem.actions.recall({ user_id, query })", async () => {
    const { token, userId } = await ensureDelegation();
    const recalled = await client.gumem.actions.recall({
      token,
      user_id: userId,
      query: livePrefix,
    });
    expect(JSON.stringify(recalled.data)).toContain(livePrefix);
  });

  it("gumem.actions.stream({ user_id, limit })", async () => {
    const { token, userId } = await ensureDelegation();
    const streamed = await client.gumem.actions.stream({ token, user_id: userId, limit: 20 });
    expect(JSON.stringify(streamed.data)).toContain(livePrefix);
  });
});
