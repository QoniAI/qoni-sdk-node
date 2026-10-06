import { describe, expect, it } from "vitest";
import { Qoni, QoniScopes, QoniValidationError } from "../src";

// SDK 0.7.0 site-login, wait() settle and Track fixes, each pinned against
// the wire contract observed live on 2026-10-01:
//  1. InteractionHandle.openLogin() sends the site to sign in to and requests
//     the scope the backend's /profiles/login route enforces.
//  2. wait() survives a transient failure of its settle reads (run detail and
//     artifact list) after the run already finished.
//  3. track.create() normalizes `schedule`, and monitor/tick reads keep
//     user-defined keys (extraction schema fields, extracted values) verbatim.

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

const TOKEN = jwt({ webagent_tenant_id: "tenant_1" });
const DELEGATION_TOKEN = jwt({
  token_type: "eak_delegation_token",
  aud: "genauth:token-exchange",
  eak_tenant_id: "tenant_1",
});
const PRODUCT_TOKEN = jwt({ webagent_tenant_id: "tenant_1", aud: "webagent" });

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
}

function sseResponse(body: string): Response {
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

function frame(id: number, type: string, data: Record<string, unknown>): string {
  const envelope = {
    id: String(id), type, task_id: "run_1", session_id: "sess_1", project_id: "tenant_1",
    occurred_at: `2026-10-01T08:00:0${id}+00:00`, data,
  };
  return `id: ${id}\ndata: ${JSON.stringify(envelope)}\n\n`;
}

interface Captured {
  pathname: string;
  method: string;
  body?: unknown;
}

function makeClient(routes: (call: Captured) => Response | Promise<Response>) {
  const calls: Captured[] = [];
  const client = new Qoni({
    accessKey: "ak_test",
    secretKey: "sk_test",
    host: "https://qoni.example.com",
    genauthBaseUrl: "https://qoni.example.com",
    webAgentBaseUrl: "https://qoni.example.com",
    fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
      const call: Captured = {
        pathname: new URL(String(url)).pathname,
        method: init?.method || "GET",
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      };
      calls.push(call);
      return routes(call);
    }) as typeof fetch,
  });
  return { client, calls };
}

const LOGIN_ACTIONS = [
  { kind: "open_login", label: "Sign in", method: "POST", endpoint: "/profiles/login" },
  { kind: "confirm_signed_in", label: "I've signed in", method: "POST",
    endpoint: "/do_anything/runs/run_1/interactions/ix_1/confirm_signed_in" },
];

function siteLogin(sites: Array<{ site_id: string; display_name: string; login_url: string }>) {
  return {
    id: "ix_1", type: "site_login", status: "pending", created_at: "2026-10-01T08:00:00Z",
    title: "Sign in", sites, actions: LOGIN_ACTIONS,
  };
}

async function loginHandle(sites: Parameters<typeof siteLogin>[0]) {
  const harness = makeClient((call) => {
    if (call.pathname === "/api/v3/eak/token-exchange") {
      return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
    }
    if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
      return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
    }
    if (/\/profiles\/[^/]+\/confirm$/.test(call.pathname)) {
      return jsonResponse({ profile_id: "prof_1", state: "active", probe_result: "signed_in" });
    }
    if (call.pathname.endsWith("/profiles/login")) {
      return jsonResponse({
        profile_id: "prof_1", site_id: (call.body as { site_id: string }).site_id,
        bb_context_id: null, session_id: "login_sess_1", live_url: "https://live.example.com/v/1",
      }, { status: 201 });
    }
    return jsonResponse({ data: {} });
  });
  const run = await harness.client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "sign in" });
  // The SDK normalizes the wire interaction the same way the event stream does.
  const { normalizeInteraction } = await import("../src/interactions");
  const handle = run.interactionHandle(normalizeInteraction(siteLogin(sites))!);
  return { ...harness, handle };
}

const XHS = { site_id: "xiaohongshu", display_name: "Xiaohongshu", login_url: "https://www.xiaohongshu.com" };
const GMAIL = { site_id: "gmail", display_name: "Gmail", login_url: "https://mail.google.com" };

describe("InteractionHandle.openLogin()", () => {
  it("defaults to the only listed site and posts { site_id } with the site-login scope", async () => {
    const { handle, calls } = await loginHandle([XHS]);
    const result = await handle.openLogin();

    expect(result).toMatchObject({
      profileId: "prof_1", siteId: "xiaohongshu", sessionId: "login_sess_1",
      liveUrl: "https://live.example.com/v/1",
    });
    const login = calls.find((call) => call.pathname.endsWith("/profiles/login"))!;
    expect(login.pathname).toBe("/api/v1/projects/tenant_1/profiles/login");
    expect(login.body).toEqual({ site_id: "xiaohongshu" });
    // The token exchange right before the login call must ask for the scope
    // /profiles/login enforces, not the do_anything manage scope.
    const exchange = calls[calls.indexOf(login) - 1];
    expect(exchange.pathname).toBe("/api/v3/eak/token-exchange");
    expect((exchange.body as { scopes: string[] }).scopes).toEqual([QoniScopes.SITE_LOGIN_REQUEST]);
  });

  it("confirm() persists the login on the profile with the site-login confirm scope", async () => {
    const { handle, calls } = await loginHandle([XHS]);
    const login = await handle.openLogin();
    const confirmed = await login.confirm({ displayLabel: "Work account" });

    expect(confirmed).toMatchObject({ profileId: "prof_1", active: true, state: "active", probeResult: "signed_in" });
    const confirm = calls.find((call) => call.pathname.endsWith("/confirm"))!;
    expect(confirm.pathname).toBe("/api/v1/projects/tenant_1/profiles/prof_1/confirm");
    expect(confirm.body).toEqual({ site_id: "xiaohongshu", display_label: "Work account" });
    const exchange = calls[calls.indexOf(confirm) - 1];
    expect((exchange.body as { scopes: string[] }).scopes).toEqual([QoniScopes.SITE_LOGIN_CONFIRM]);
  });

  it("openLogin()/confirm() expose the unmodified response bodies as raw", async () => {
    const { handle } = await loginHandle([XHS]);
    const login = await handle.openLogin();
    expect(login.raw).toEqual({ profile_id: "prof_1", site_id: "xiaohongshu", bb_context_id: null,
      session_id: "login_sess_1", live_url: "https://live.example.com/v/1" });
    const confirmed = await login.confirm();
    expect(confirmed.raw).toEqual({ profile_id: "prof_1", state: "active", probe_result: "signed_in" });
  });

  it("confirm() surfaces 409 no_pending_login as a QoniError with that code instead of inventing a state", async () => {
    let confirmStatus = 409;
    let opens = 0;
    const { client } = makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/do_anything/runs")) return jsonResponse({ data: { run_id: "run_1", status: "running" } });
      if (call.pathname.endsWith("/profiles/login")) {
        // A new backend session per open, so each result has its own save.
        return jsonResponse({ profile_id: "prof_1", site_id: "xiaohongshu", session_id: `s${++opens}`, live_url: "https://live" }, { status: 201 });
      }
      if (call.pathname.endsWith("/profiles/prof_1/confirm")) {
        return confirmStatus === 409
          ? jsonResponse({ detail: { code: "no_pending_login", detail: "profile is in state 'active'" } }, { status: 409 })
          : jsonResponse({ detail: { code: "agent_core_profile_import_failed", detail: "boom" } }, { status: 502 });
      }
      return jsonResponse({ data: {} });
    });
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "t" });
    const { normalizeInteraction } = await import("../src/interactions");
    const login = await run.interactionHandle(normalizeInteraction(siteLogin([XHS]))!).openLogin();
    await expect(login.confirm()).rejects.toMatchObject({ status: 409, code: "no_pending_login" });
    // Since 0.9.0 a session is saved at most once and 409 is final for it, so
    // the other error needs a session of its own.
    confirmStatus = 502;
    const next = await run.interactionHandle(normalizeInteraction(siteLogin([XHS]))!).openLogin();
    await expect(next.confirm()).rejects.toMatchObject({ status: 502 });
  });

  it("confirm() reports active: false while the backend has not captured the login", async () => {
    const { client, calls } = makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/do_anything/runs")) return jsonResponse({ data: { run_id: "run_1", status: "running" } });
      if (call.pathname.endsWith("/profiles/login")) {
        return jsonResponse({ profile_id: "prof_1", site_id: "xiaohongshu", session_id: "s", live_url: "https://live" }, { status: 201 });
      }
      if (call.pathname.endsWith("/profiles/prof_1/confirm")) {
        return jsonResponse({ profile_id: "prof_1", state: "pending_login", probe_result: "logged_out" });
      }
      return jsonResponse({ data: {} });
    });
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "t" });
    const { normalizeInteraction } = await import("../src/interactions");
    const login = await run.interactionHandle(normalizeInteraction(siteLogin([XHS]))!).openLogin();
    expect(await login.confirm()).toMatchObject({ active: false, state: "pending_login", probeResult: "logged_out" });
    expect(calls.some((call) => call.pathname.endsWith("/confirm_signed_in"))).toBe(false);

    // Recovery: confirm() ended that session, so open a new one for the same profile.
    const handle = run.interactionHandle(normalizeInteraction(siteLogin([XHS]))!);
    await handle.openLogin({ siteId: login.siteId, profileId: login.profileId });
    const logins = calls.filter((call) => call.pathname.endsWith("/profiles/login"));
    expect(logins.map((call) => call.body)).toEqual([
      { site_id: "xiaohongshu" },
      { site_id: "xiaohongshu", profile_id: "prof_1" },
    ]);
  });

  it("deepResearch interactions route the site-login scope the same way", async () => {
    const { client, calls } = makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/deep_research/runs")) return jsonResponse({ data: { run_id: "dr_1", status: "running" } });
      if (call.pathname.endsWith("/profiles/login")) {
        return jsonResponse({ profile_id: "prof_2", site_id: "xiaohongshu", session_id: "s2", live_url: "https://live/2" }, { status: 201 });
      }
      return jsonResponse({ data: {} });
    });
    const run = await client.deepResearch.run({ token: DELEGATION_TOKEN, prompt: "t" });
    const { normalizeInteraction } = await import("../src/interactions");
    const login = await run.interactionHandle(normalizeInteraction(siteLogin([XHS]))!).openLogin();
    expect(login).toMatchObject({ profileId: "prof_2", liveUrl: "https://live/2" });
    const request = calls.find((call) => call.pathname.endsWith("/profiles/login"))!;
    expect((calls[calls.indexOf(request) - 1].body as { scopes: string[] }).scopes).toEqual([QoniScopes.SITE_LOGIN_REQUEST]);
  });

  it("sends an explicit siteId and profileId for a multi-site interaction", async () => {
    const { handle, calls } = await loginHandle([XHS, GMAIL]);
    await handle.openLogin({ siteId: "gmail", profileId: "prof_9" });
    const login = calls.find((call) => call.pathname.endsWith("/profiles/login"))!;
    expect(login.body).toEqual({ site_id: "gmail", profile_id: "prof_9" });
  });

  it("refuses to guess between several sites, or to sign in to an unlisted site", async () => {
    const { handle, calls } = await loginHandle([XHS, GMAIL]);
    const before = calls.length;
    await expect(handle.openLogin()).rejects.toThrow(/choose one of xiaohongshu, gmail/);
    await expect(handle.openLogin({ siteId: "bank" })).rejects.toThrow(/not one of the sites/);
    await expect(handle.openLogin({ siteId: "" })).rejects.toBeInstanceOf(QoniValidationError);
    await expect(handle.openLogin({ siteId: "gmail", profileId: "" })).rejects.toBeInstanceOf(QoniValidationError);
    expect(calls.length).toBe(before);
  });

  it("keeps the undeclared-action contract ahead of site validation", async () => {
    const { client } = makeClient(() => jsonResponse({ data: { run_id: "run_1", status: "running" } }));
    const run = await client.doAnything.run({ token: TOKEN, prompt: "t" });
    const { normalizeInteraction } = await import("../src/interactions");
    const handle = run.interactionHandle(normalizeInteraction({
      id: "ix_2", type: "site_login", status: "resolved", created_at: "2026-10-01T08:00:00Z",
      title: "done", sites: [], actions: [],
    })!);
    await expect(handle.openLogin()).rejects.toThrow(/does not offer the "open_login" action — the backend declared: none/);
  });

  it("still requests the product manage scope for every other action", async () => {
    const { handle, calls } = await loginHandle([XHS]);
    await handle.confirmSignedIn();
    const confirm = [...calls].reverse().find((call) => call.pathname.endsWith("/confirm_signed_in"))!;
    const exchange = calls[calls.indexOf(confirm) - 1];
    expect((exchange.body as { scopes: string[] }).scopes).toEqual(["webagent.do_anything:manage"]);
  });
});

describe("RunHandle.wait() settle reads", () => {
  function settleClient(detailFailures: Array<() => Response | Promise<Response>>) {
    let detailCalls = 0;
    const harness = makeClient((call) => {
      if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
      }
      if (call.pathname.endsWith("/runs/run_1/events")) {
        return sseResponse(frame(1, "run.completed", { terminal_reason: "done", output: { answer: "ok" } }));
      }
      if (call.method === "GET" && call.pathname.endsWith("/runs/run_1")) {
        const failure = detailFailures[detailCalls++];
        if (failure) return failure();
        return jsonResponse({ data: { run_id: "run_1", status: "succeeded", output: { answer: "ok" } } });
      }
      if (call.pathname.endsWith("/runs/run_1/artifacts")) return jsonResponse({ items: [] });
      return jsonResponse({ data: {} });
    });
    return { ...harness, detailCalls: () => detailCalls };
  }
  const networkDrop = () => { throw new TypeError("fetch failed"); };

  it("retries a transient run-detail failure and settles the finished run", async () => {
    const { client, detailCalls } = settleClient([networkDrop]);
    const run = await client.doAnything.run({ token: TOKEN, prompt: "t" });
    const result = await run.wait({ timeoutMs: 10_000 });
    expect(result.status).toBe("succeeded");
    expect(result.output).toEqual({ answer: "ok" });
    expect(detailCalls()).toBe(2);
  });

  it("gives up after two retries and surfaces the retryable error", async () => {
    const { client, detailCalls } = settleClient([networkDrop, networkDrop, networkDrop]);
    const run = await client.doAnything.run({ token: TOKEN, prompt: "t" });
    await expect(run.wait({ timeoutMs: 10_000 })).rejects.toMatchObject({ retryable: true });
    expect(detailCalls()).toBe(3);
  });

  it("does not retry a non-retryable failure", async () => {
    const { client, detailCalls } = settleClient([
      () => jsonResponse({ error: { code: "permission_denied", message: "denied" } }, { status: 403 }),
    ]);
    const run = await client.doAnything.run({ token: TOKEN, prompt: "t" });
    await expect(run.wait({ timeoutMs: 10_000 })).rejects.toMatchObject({ status: 403 });
    expect(detailCalls()).toBe(1);
  });

  it("retries a transient artifact-list failure the same way", async () => {
    let artifactCalls = 0;
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
      }
      if (call.pathname.endsWith("/runs/run_1/events")) {
        return sseResponse(frame(1, "run.completed", { terminal_reason: "done", output: { answer: "ok" } }));
      }
      if (call.pathname.endsWith("/runs/run_1/artifacts")) {
        if (artifactCalls++ === 0) throw new TypeError("fetch failed");
        return jsonResponse({ items: [] });
      }
      return jsonResponse({ data: { run_id: "run_1", status: "succeeded", output: { answer: "ok" } } });
    });
    const run = await client.doAnything.run({ token: TOKEN, prompt: "t" });
    const result = await run.wait({ timeoutMs: 10_000 });
    expect(result.status).toBe("succeeded");
    expect(result.artifacts).toEqual([]);
    expect(artifactCalls).toBe(2);
  });

  it("reports wait()'s own timeout when it elapses during a retry backoff", async () => {
    const { client, detailCalls } = settleClient([networkDrop, networkDrop, networkDrop]);
    const run = await client.doAnything.run({ token: TOKEN, prompt: "t" });
    const started = Date.now();
    await expect(run.wait({ timeoutMs: 400 })).rejects.toMatchObject({ name: "QoniTimeoutError" });
    expect(Date.now() - started).toBeLessThan(1_000);
    expect(detailCalls()).toBe(2);
  });

  it("stops retrying when the caller aborts during backoff", async () => {
    const { client, detailCalls } = settleClient([networkDrop, networkDrop, networkDrop]);
    const run = await client.doAnything.run({ token: TOKEN, prompt: "t" });
    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error("caller aborted")), 100);
    await expect(run.wait({ signal: controller.signal })).rejects.toThrow(/caller aborted/);
    expect(detailCalls()).toBe(1);
  });
});

describe("track schedule and user-keyed fields", () => {
  function trackClient() {
    return makeClient((call) => {
      if (call.pathname.endsWith("/track/monitors") && call.method === "POST") {
        return jsonResponse({ data: { id: "mon_1", status: "active" } });
      }
      if (call.pathname.endsWith("/monitors/mon_1/runs/tick_1")) {
        return jsonResponse({ data: {
          run_id: "tick_1", tick_n: 1, state: "completed", is_first_tick: true,
          extracted: { source_url: "https://example.com/policy", page_title: "Policy" },
          diffs: [
            { kind: "field_diff", changed_fields: ["page_title"],
              before: { page_title: "Old" }, after: { page_title: "Policy" } },
            { kind: "list_diff", field: "news_items", key: "item_url", added: [{ item_url: "https://example.com/a" }],
              removed: [], unchanged_count: 1, sample_unchanged: [{ item_url: "https://example.com/b" }] },
            { kind: "fingerprint_diff", before_hash: "h1", after_hash: "h2", similarity_score: 0.9 },
          ],
        } });
      }
      return jsonResponse({ data: {
        id: "mon_1", status: "active", status_reason: null,
        schedule: { kind: "interval", interval_seconds: 3600 },
        extraction_schema: { source_url: "string", page_title: "string" },
        baseline_extracted: { source_url: "https://example.com/policy", page_title: "Policy" },
        trigger_dsl: { on: "change", throttle: { max_per_hour: 1 } },
      } });
    });
  }

  it("create() sends interval schedules as interval_seconds, like refine()", async () => {
    const { client, calls } = trackClient();
    await client.track.create({
      token: TOKEN, prompt: "watch the policy page",
      targetUrls: ["https://example.com/policy"],
      extractionSchema: { source_url: "string" },
      schedule: { kind: "interval", intervalSeconds: 3600 },
    });
    expect(calls[0].body).toEqual({
      intent: "watch the policy page",
      target_urls: ["https://example.com/policy"],
      extraction_schema: { source_url: "string" },
      schedule: { kind: "interval", interval_seconds: 3600 },
    });
  });

  it("schedule normalization keeps every other field, such as tz, for create() and refine()", async () => {
    const { client, calls } = trackClient();
    const monitor = await client.track.create({ token: TOKEN, prompt: "p",
      schedule: { kind: "cron", expr: "0 9 * * *", tz: "Asia/Shanghai" } });
    expect((calls[0].body as { schedule: unknown }).schedule).toEqual({ kind: "cron", expr: "0 9 * * *", tz: "Asia/Shanghai" });
    await monitor.refine({ schedule: { kind: "interval", intervalSeconds: 600, tz: "UTC" } });
    expect(calls.at(-1)!.body).toEqual({ action: "refine", patch: { schedule: { kind: "interval", interval_seconds: 600, tz: "UTC" } } });
    await client.track.create({ token: TOKEN, prompt: "p", schedule: { kind: "interval", interval_seconds: 120 } });
    expect((calls.at(-1)!.body as { schedule: unknown }).schedule).toEqual({ kind: "interval", interval_seconds: 120 });
  });

  it("create() keeps cron schedules and rejects malformed ones before any request", async () => {
    const { client, calls } = trackClient();
    await client.track.create({ token: TOKEN, prompt: "p", schedule: { kind: "cron", expr: "0 * * * *" } });
    expect((calls[0].body as { schedule: unknown }).schedule).toEqual({ kind: "cron", expr: "0 * * * *" });
    const before = calls.length;
    await expect(client.track.create({ token: TOKEN, prompt: "p", schedule: { kind: "interval", intervalSeconds: 0 } }))
      .rejects.toBeInstanceOf(QoniValidationError);
    await expect(client.track.create({ token: TOKEN, prompt: "p", schedule: { kind: "cron", expr: " " } }))
      .rejects.toBeInstanceOf(QoniValidationError);
    expect(calls.length).toBe(before);
  });

  it("get() and run() keep user-defined keys while camelizing protocol fields", async () => {
    const { client } = trackClient();
    const monitor = await client.track.create({ token: TOKEN, prompt: "p" });
    const detail = await monitor.get();
    expect(detail.statusReason).toBeNull();
    expect(detail.schedule).toEqual({ kind: "interval", intervalSeconds: 3600 });
    expect(detail.extractionSchema).toEqual({ source_url: "string", page_title: "string" });
    expect(detail.baselineExtracted).toEqual({ source_url: "https://example.com/policy", page_title: "Policy" });
    expect(detail.triggerDsl).toEqual({ on: "change", throttle: { maxPerHour: 1 } });

    const tick = await monitor.run("tick_1");
    expect(tick).toMatchObject({ id: "tick_1", tickN: 1, isFirstTick: true });
    expect(tick.extracted).toEqual({ source_url: "https://example.com/policy", page_title: "Policy" });
    // changedFields names the user's field; before/after must be readable by that same name.
    expect(tick.diffs).toEqual([
      { kind: "field_diff", changedFields: ["page_title"], before: { page_title: "Old" }, after: { page_title: "Policy" } },
      { kind: "list_diff", field: "news_items", key: "item_url", added: [{ item_url: "https://example.com/a" }],
        removed: [], unchangedCount: 1, sampleUnchanged: [{ item_url: "https://example.com/b" }] },
      { kind: "fingerprint_diff", beforeHash: "h1", afterHash: "h2", similarityScore: 0.9 },
    ]);
  });
});
