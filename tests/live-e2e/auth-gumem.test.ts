import { beforeAll, describe, expect, it } from "vitest";
import {
  allowLiveEnvironmentConstraint,
  delegateLiveToken,
  gumemScopes,
  liveE2EEnabled,
  liveClient,
  livePrefix,
} from "./helpers";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;

describeLiveE2E("live e2e: auth and GUMem", () => {
  let client: ReturnType<typeof liveClient>;
  let delegated:
    | Promise<Awaited<ReturnType<typeof delegateLiveToken>>>
    | undefined;
  let sessionReady: Promise<void> | undefined;
  const sessionId = `${livePrefix}-gumem`;

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
        metadata: { source: "qoni-sdk-node-live-e2e", livePrefix },
      });
    })();
    return sessionReady;
  }

  it("delegateToken({ mode: silent, user, agent, scopes, expiresIn })", async () => {
    const { token, userId } = await ensureDelegation();
    expect(token).toBeTruthy();
    expect(userId).toBeTruthy();
  });

  it("currentUser({ accessToken })", async () => {
    if (!process.env.QONI_USER_ACCESS_TOKEN) {
      expect("QONI_USER_ACCESS_TOKEN not configured").toBeTruthy();
      return;
    }
    const user = await client.currentUser({ accessToken: process.env.QONI_USER_ACCESS_TOKEN });
    expect(user.data).toBeTruthy();
  });

  it("gumem.createSession({ userId, sessionId, title, metadata })", async () => {
    await ensureSession();
    expect(sessionId).toBeTruthy();
  });

  it("gumem.addMessages({ sync, messages })", async () => {
    await ensureSession();
    const { token, userId } = await ensureDelegation();
    await client.gumem.addMessages({
      token,
      userId,
      sessionId,
      sync: true,
      messages: [{ role: "user", content: `${livePrefix} live e2e message` }],
    });
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
      metadataFilters: { source: "qoni-sdk-node-live-e2e" },
    });
    expect(recall.data).toBeTruthy();
  });

  it("gumem.uploadResource({ file, filename, contentType })", async () => {
    await ensureSession();
    const { token, userId } = await ensureDelegation();
    await allowLiveEnvironmentConstraint(
      client.gumem.uploadResource({
        token,
        userId,
        sessionId,
        file: new Blob([`${livePrefix} live e2e resource`], { type: "text/plain" }),
        filename: `${livePrefix}.txt`,
        contentType: "text/plain",
      }),
    );
  });

  it("gumem.actions.record({ user_id, session_id, event_type, timestamp, content })", async () => {
    await ensureSession();
    const { token, userId } = await ensureDelegation();
    await client.gumem.actions.record({
      token,
      user_id: userId,
      session_id: sessionId,
      event_type: "sdk_live_e2e",
      timestamp: new Date().toISOString(),
      content: `${livePrefix} action`,
    });
  });

  it("gumem.actions.recall({ user_id, query })", async () => {
    const { token, userId } = await ensureDelegation();
    await client.gumem.actions.recall({ token, user_id: userId, query: livePrefix });
  });

  it("gumem.actions.stream({ user_id, limit })", async () => {
    const { token, userId } = await ensureDelegation();
    await client.gumem.actions.stream({ token, user_id: userId, limit: 1 });
  });
});
