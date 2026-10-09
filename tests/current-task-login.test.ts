import { describe, expect, it } from "vitest";
import { Qoni, QoniScopes, QoniValidationError } from "../src";
import { normalizeInteraction } from "../src/interactions";

const RUN_ID = "run_1";
const L = "login_L";
const C = "control_C";
const BASE = `/do_anything/runs/${RUN_ID}/interactions/${L}`;
const jwt = (payload: object) => `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.`;
const TOKEN = jwt({ token_type: "eak_delegation_token", aud: "genauth:token-exchange", eak_tenant_id: "tenant_1" });
const PRODUCT_TOKEN = jwt({ webagent_tenant_id: "tenant_1", aud: "webagent" });
const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
const opened = (sessionId = C) => ({
  login_mode: "current_task", profile_id: "trusted_profile", site_id: "unseeded.sub.alias.invalid",
  session_id: sessionId, interaction_id: L, control_interaction_id: sessionId,
  browser_session_id: "existing_browser", live_url: "https://live.example.test/current", expires_at: "2026-10-08T00:00:00Z",
});
const saved = (sessionId = C) => ({
  login_mode: "current_task", saved: true, interaction_id: L, session_id: sessionId,
  state: "saved", verification: "agent_pending",
});
function card() {
  return {
    id: L, type: "site_login", status: "pending", created_at: "2026-10-07T00:00:00Z", title: "Sign in",
    sites: [{ site_id: "unseeded.sub.alias.invalid", display_name: "Current site", login_url: "https://unseeded.sub.alias.invalid" }],
    actions: [
      { kind: "open_login", label: "Sign in", method: "POST", endpoint: `${BASE}/open_login` },
      { kind: "confirm_signed_in", label: "I've signed in", method: "POST", endpoint: `${BASE}/confirm_signed_in` },
    ],
  };
}
interface Call { path: string; method: string; body?: Record<string, unknown> }
type Reply = (call: Call, n: number) => Response | Promise<Response>;
async function harness(opts: { open?: Reply; confirm?: Reply; exchange?: Reply; wire?: ReturnType<typeof card> } = {}) {
  const calls: Call[] = [];
  let opens = 0, confirms = 0, exchanges = 0;
  const client = new Qoni({
    accessKey: "ak_test", secretKey: "sk_test", host: "https://qoni.example.test",
    genauthBaseUrl: "https://qoni.example.test", webAgentBaseUrl: "https://qoni.example.test",
    fetch: (async (url, init) => {
      const call: Call = { path: new URL(String(url)).pathname, method: init?.method ?? "GET", body: init?.body ? JSON.parse(String(init.body)) : undefined };
      calls.push(call);
      if (call.path === "/api/v3/eak/token-exchange") return opts.exchange?.(call, ++exchanges) ?? json({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.path.endsWith("/open_login") || call.path.endsWith("/profiles/login")) return opts.open?.(call, ++opens) ?? json(opened());
      if (call.path.endsWith("/confirm_signed_in")) return opts.confirm?.(call, ++confirms) ?? json(saved());
      if (call.method === "GET" && call.path.endsWith(`/runs/${RUN_ID}`)) return json({ data: { run_id: RUN_ID, session_id: "sess_1", status: "waiting" } });
      throw new Error(`unexpected HTTP ${call.method} ${call.path}`);
    }) as typeof fetch,
  });
  const run = await client.doAnything.attach(RUN_ID, { token: TOKEN });
  const handle = run.interactionHandle(normalizeInteraction(opts.wire ?? card())!);
  return { client, run, handle, calls };
}
const posts = (calls: Call[]) => calls.filter((c) => c.method === "POST" && c.path !== "/api/v3/eak/token-exchange");
const confirms = (calls: Call[]) => posts(calls).filter((c) => c.path.endsWith("/confirm_signed_in"));
const requestedScopes = (calls: Call[], call: Call) => calls[calls.indexOf(call) - 1].body?.scopes;
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

describe("current_task login: declared original L and fixed C", () => {
  it("requests exact open/confirm scopes and saves/releases/replies with one confirm HTTP", async () => {
    const { handle, calls } = await harness();
    const login = await handle.openLogin();
    expect(login.sessionId).toBe(C);
    expect(login.raw.browser_session_id).toBe("existing_browser");
    const result = await login.confirm();
    await handle.confirmSignedIn();
    expect(result).toEqual({ profileId: "trusted_profile", active: false, state: "saved", probeResult: "agent_pending", raw: saved() });
    expect(posts(calls).map((c) => [c.path, c.body])).toEqual([
      [`/api/v1/projects/tenant_1${BASE}/open_login`, { site_id: "unseeded.sub.alias.invalid" }],
      [`/api/v1/projects/tenant_1${BASE}/confirm_signed_in`, { login_session_id: C }],
    ]);
    expect(requestedScopes(calls, posts(calls)[0])).toEqual([QoniScopes.BROWSER_USE_TAKE_CONTROL, QoniScopes.SITE_LOGIN_REQUEST].sort());
    expect(requestedScopes(calls, posts(calls)[1])).toEqual([QoniScopes.SITE_LOGIN_CONFIRM, QoniScopes.BROWSER_USE_TAKE_CONTROL, QoniScopes.DO_ANYTHING_MANAGE].sort());
  });

  it("shares one confirmation across both methods and handles", async () => {
    const gate = deferred<Response>();
    const entered = deferred<void>();
    const { run, handle, calls } = await harness({ confirm: () => { entered.resolve(); return gate.promise; } });
    const login = await handle.openLogin();
    const later = run.interactionHandle(normalizeInteraction(card())!);
    const pending = Promise.all([login.confirm(), handle.confirmSignedIn(), later.confirmSignedIn()]);
    await entered.promise;
    expect(confirms(calls)).toHaveLength(1);
    gate.resolve(json(saved()));
    await pending;
    await later.confirmSignedIn();
    expect(confirms(calls)).toHaveLength(1);
  });

  it("rejects confirmation before open locally instead of sending an empty recheck", async () => {
    const { handle, calls } = await harness();
    await expect(handle.confirmSignedIn()).rejects.toBeInstanceOf(QoniValidationError);
    expect(posts(calls)).toEqual([]);
  });

  it.each([
    ["another run", `${BASE.replace(RUN_ID, "other_run")}/open_login`, `${BASE}/confirm_signed_in`, "POST"],
    ["another L", `${BASE.replace(L, "other_L")}/open_login`, `${BASE}/confirm_signed_in`, "POST"],
    ["another confirm run", `${BASE}/open_login`, `${BASE.replace(RUN_ID, "other_run")}/confirm_signed_in`, "POST"],
    ["another confirm L", `${BASE}/open_login`, `${BASE.replace(L, "other_L")}/confirm_signed_in`, "POST"],
    ["absolute route", `https://qoni.example.test${BASE}/open_login`, `${BASE}/confirm_signed_in`, "POST"],
    ["query route", `${BASE}/open_login?other=1`, `${BASE}/confirm_signed_in`, "POST"],
    ["non POST", `${BASE}/open_login`, `${BASE}/confirm_signed_in`, "GET"],
  ])("fails closed before HTTP for %s declarations", async (_name, openEndpoint, confirmEndpoint, method) => {
    const wire = card();
    wire.actions[0].endpoint = openEndpoint;
    wire.actions[0].method = method;
    wire.actions[1].endpoint = confirmEndpoint;
    const { handle, calls } = await harness({ wire });
    await expect(handle.openLogin()).rejects.toBeInstanceOf(QoniValidationError);
    expect(posts(calls)).toEqual([]);
  });

  it("requires a declared original confirm action before opening", async () => {
    const wire = card(); wire.actions.pop();
    const { handle, calls } = await harness({ wire });
    await expect(handle.openLogin()).rejects.toBeInstanceOf(QoniValidationError);
    expect(posts(calls)).toEqual([]);
  });

  it.each([
    ["missing mode", { login_mode: undefined }], ["unknown mode", { login_mode: "future" }],
    ["null mode", { login_mode: null }], ["wrong L", { interaction_id: "other_L" }],
    ["empty L", { interaction_id: "" }], ["empty C", { control_interaction_id: "" }],
    ["blank C", { control_interaction_id: "  ", session_id: "  " }],
    ["wrong session/C", { session_id: "browser_id" }], ["wrong site", { site_id: "other_site" }],
  ])("rejects %s open responses without registering a profile fallback", async (_name, extra) => {
    const { handle, calls } = await harness({ open: () => json({ ...opened(), ...extra }) });
    await expect(handle.openLogin()).rejects.toBeInstanceOf(QoniValidationError);
    await expect(handle.confirmSignedIn()).rejects.toBeInstanceOf(QoniValidationError);
    expect(posts(calls)).toHaveLength(1);
  });

  it("does not accept an explicit current_task mode on a legacy Profile declaration", async () => {
    const wire = card(); wire.actions[0].endpoint = "/profiles/login";
    const { handle, calls } = await harness({ wire });
    await expect(handle.openLogin()).rejects.toBeInstanceOf(QoniValidationError);
    expect(posts(calls)).toHaveLength(1);
  });

  it.each([
    ["missing", undefined], ["empty", ""], ["whitespace", " \t\n "], ["null", null],
    ["number", 0], ["boolean", false], ["array", []], ["object", {}],
  ])("rejects a %s trusted profile without caller fallback or a confirmable slot", async (_name, profileId) => {
    const { handle, calls } = await harness({ open: () => json({ ...opened(), profile_id: profileId }) });
    await expect(handle.openLogin({ profileId: "caller_profile" })).rejects.toBeInstanceOf(QoniValidationError);
    await expect(handle.confirmSignedIn()).rejects.toBeInstanceOf(QoniValidationError);
    expect(confirms(calls)).toEqual([]);
    expect(posts(calls)).toHaveLength(1);
  });

  it("keeps the open card's confirm endpoint when a later card or its action object changes", async () => {
    const { handle, run, calls } = await harness();
    const login = await handle.openLogin();
    handle.actions[1].endpoint = `${BASE.replace(L, "new_L")}/confirm_signed_in`;
    const wire = card(); wire.actions[1].endpoint = `${BASE.replace(L, "another_L")}/confirm_signed_in`;
    await run.interactionHandle(normalizeInteraction(wire)!).confirmSignedIn();
    await login.confirm();
    expect(confirms(calls)[0].path).toBe(`/api/v1/projects/tenant_1${BASE}/confirm_signed_in`);
    expect(confirms(calls)).toHaveLength(1);
  });

  it.each([
    ["not saved", { saved: false }], ["wrong L", { interaction_id: "new_L" }],
    ["wrong C", { session_id: "new_C" }], ["unknown mode", { login_mode: "future" }],
    ["missing mode", { login_mode: undefined }], ["not complete", { state: "pending_login" }],
    ["unknown verification", { verification: undefined }],
  ])("does not mark %s 2xx confirmation complete, and retries original L/C", async (_name, extra) => {
    const { handle, calls } = await harness({ confirm: (_call, n) => json(n === 1 ? { ...saved(), ...extra } : saved()) });
    const login = await handle.openLogin();
    await expect(handle.confirmSignedIn()).rejects.toMatchObject({ code: "site_login.invalid_response", retryable: true });
    await login.confirm();
    await handle.confirmSignedIn();
    expect(confirms(calls).map((c) => c.body)).toEqual([{ login_session_id: C }, { login_session_id: C }]);
  });

  it.each([[503, "login_save_failed"], [409, "interaction_conflict"], [409, "no_pending_login"], [403, "insufficient_scope"]])(
    "surfaces HTTP %i %s without recheck or ID switching and permits an explicit same-C retry", async (status, code) => {
      const { handle, calls } = await harness({ confirm: (_call, n) => n === 1 ? json({ detail: { code, detail: "rejected" } }, status) : json(saved()) });
      await handle.openLogin();
      await expect(handle.confirmSignedIn()).rejects.toMatchObject({ status, code });
      expect(confirms(calls)).toHaveLength(1);
      await handle.confirmSignedIn();
      expect(confirms(calls).map((c) => c.body)).toEqual([{ login_session_id: C }, { login_session_id: C }]);
    },
  );

  it("retries the original C after a successful response is lost; it does not invent completion", async () => {
    const { handle, calls } = await harness({ confirm: (_call, n) => {
      if (n === 1) throw new TypeError("response lost after server commit");
      return json(saved());
    } });
    await handle.openLogin();
    await expect(handle.confirmSignedIn()).rejects.toThrow();
    await handle.confirmSignedIn();
    expect(posts(calls).map((c) => c.body)).toEqual([{ site_id: "unseeded.sub.alias.invalid" }, { login_session_id: C }, { login_session_id: C }]);
  });

  it.each(["eak.delegation.scope_not_allowed", "consent_cancelled"])("surfaces token-exchange %s without a confirm HTTP", async (code) => {
    const { handle, calls } = await harness({ exchange: (call) => {
      const scopes = call.body?.scopes as string[];
      return scopes.includes(QoniScopes.SITE_LOGIN_CONFIRM) ? json({ code, message: "denied" }, 403) : json({ data: { accessToken: PRODUCT_TOKEN } });
    } });
    await handle.openLogin();
    await expect(handle.confirmSignedIn()).rejects.toMatchObject({ status: 403, code });
    expect(confirms(calls)).toEqual([]);
  });

  it("reuses the same backend C without repeating a save", async () => {
    const { handle, calls } = await harness();
    const first = await handle.openLogin();
    await handle.openLogin();
    await Promise.all([first.confirm(), handle.confirmSignedIn()]);
    expect(confirms(calls)).toHaveLength(1);
  });

  it("rejects a superseded result and confirms only the new C", async () => {
    const { handle, calls } = await harness({ open: (_call, n) => json(opened(n === 1 ? C : "new_C")), confirm: () => json(saved("new_C")) });
    const old = await handle.openLogin();
    await handle.openLogin();
    await expect(old.confirm()).rejects.toBeInstanceOf(QoniValidationError);
    await handle.confirmSignedIn();
    expect(confirms(calls).map((c) => c.body)).toEqual([{ login_session_id: "new_C" }]);
  });

  it("does not complete a newer round when the older confirmation responds late", async () => {
    const gate = deferred<Response>(); const entered = deferred<void>();
    const { handle, calls } = await harness({ open: (_call, n) => json(opened(n === 1 ? C : "new_C")), confirm: (_call, n) => {
      if (n === 1) { entered.resolve(); return gate.promise; }
      return json(saved("new_C"));
    } });
    await handle.openLogin();
    const pending = expect(handle.confirmSignedIn()).rejects.toMatchObject({ code: "site_login.session_replaced", retryable: true });
    await entered.promise;
    await handle.openLogin();
    gate.resolve(json(saved()));
    await pending;
    await handle.confirmSignedIn();
    expect(confirms(calls).map((c) => c.body)).toEqual([{ login_session_id: C }, { login_session_id: "new_C" }]);
  });

  it("keeps latest successful call ownership when open responses arrive out of order", async () => {
    const gates = [deferred<Response>(), deferred<Response>()];
    const entered = [deferred<void>(), deferred<void>()];
    const { handle, calls } = await harness({ open: (_call, n) => { entered[n - 1].resolve(); return gates[n - 1].promise; }, confirm: () => json(saved("new_C")) });
    const oldOpening = handle.openLogin(); const newOpening = handle.openLogin();
    await Promise.all(entered.map((g) => g.promise));
    gates[1].resolve(json(opened("new_C"))); await newOpening;
    gates[0].resolve(json(opened())); const old = await oldOpening;
    await expect(old.confirm()).rejects.toBeInstanceOf(QoniValidationError);
    await handle.confirmSignedIn();
    expect(confirms(calls)[0].body).toEqual({ login_session_id: "new_C" });
  });
});
