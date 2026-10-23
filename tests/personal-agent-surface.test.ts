import { describe, expect, it, vi } from "vitest";
import { activateAgent } from "../src/agent-activation";
import { createComputerNamespaces } from "../src/computer";
import { createDoAnythingNamespace } from "../src/do-anything";
import { errorFromPayload, QoniAuthError, QoniConsentRequiredError, QoniPermissionDeniedError, QoniValidationError } from "../src/errors";
import { normalizeInteraction } from "../src/interactions";
import { createNotificationsNamespace, createProactiveNamespace, createWorkspaceNamespace } from "../src/personal";
import { RunEventFolder } from "../src/run-stream";
import { createTrackNamespace } from "../src/track";
import type { QoniEvent } from "../src/types";

// Wire events as the WebAgent run stream delivers them.
let seq = 0;
function wire(type: string, data: Record<string, unknown>, taskId = "run_1"): QoniEvent<unknown> {
  seq += 1;
  return { id: String(seq), event: type, data: { type, task_id: taskId, occurred_at: `2026-10-23T08:00:${String(seq % 60).padStart(2, "0")}Z`, data } };
}
const say = (text: string, id = "s1") => wire("run.message", { role: "ai", type: "assistant_message", text, message_id: id, summary: "Streaming", final: false });
const reply = (stopReason: string, text = "", hidden = true) => wire("run.message", { role: "ai", type: "planning", summary: "Agent reply", text, hidden, stop_reason: stopReason, message_id: `llm-${seq}` });
const answer = (text: string) => wire("run.message", { role: "ai", type: "assistant_message", text, final: true, message_id: `final-${seq}` });

function fold(events: QoniEvent<unknown>[]) {
  const folder = new RunEventFolder("run_1");
  return events.flatMap((event) => folder.feed(event));
}
const messages = (events: QoniEvent<unknown>[]) =>
  fold(events).filter((event) => event.type === "message").map((event) => event.data);

describe("a streamed reply is one message", () => {
  it("chunks share an id and carry the whole text; the model call's end completes it; the answer reuses it", () => {
    const got = messages([say("我打开"), say("了 X。"), reply("stop"), answer("我打开了 X。")]);
    expect(got).toEqual([
      { id: "s1", role: "ai", text: "我打开", delta: "我打开", done: false, final: false },
      { id: "s1", role: "ai", text: "我打开了 X。", delta: "了 X。", done: false, final: false },
      { id: "s1", role: "ai", text: "我打开了 X。", delta: "", done: true, final: false, stopReason: "stop" },
      { id: "s1", role: "ai", text: "我打开了 X。", delta: "", done: true, final: true },
    ]);
  });

  it("a reply before tools is not the answer: the answer after them is a new message", () => {
    const got = messages([say("我先去看看。"), reply("toolUse"), wire("run.action.started", { action_id: "a", kind: "browser_open", label: "打开 x.com" }), answer("X 上现在显示登录页。")]);
    expect(got.map((m) => [m.id, m.text, m.done, m.final, m.stopReason])).toEqual([
      ["s1", "我先去看看。", false, false, undefined],
      ["s1", "我先去看看。", true, false, "toolUse"],
      [expect.stringMatching(/^final-/), "X 上现在显示登录页。", true, true, undefined],
    ]);
  });

  it("reasoning and tool-only model calls are not messages; the person's words are", () => {
    const events = fold([
      wire("run.message", { role: "ai", type: "planning", summary: "Reasoning", text: "Let me check the price." }),
      reply("toolUse"),
      wire("run.message", { role: "human", type: "user_message", text: "再快一点", message_id: "h1" }),
    ]);
    expect(events.map((event) => event.type)).toEqual(["progress", "message"]);
    expect(events[1]?.data).toEqual({ id: "h1", role: "human", text: "再快一点", delta: "再快一点", done: true, final: false });
  });

  it("a stream cut off by the run's end is completed before done", () => {
    const events = fold([say("正在"), wire("run.completed", { terminal_reason: "canceled" })]);
    expect(events.map((event) => [event.type, event.type === "message" ? event.data.done : null])).toEqual([
      ["message", false], ["message", true], ["done", null],
    ]);
  });
});

describe("browsers, by the same rules as the server's list", () => {
  const LEAD = "https://7900-sbx.e2b.app/screen/1?token=t";
  const A1 = "https://7900-sbx.e2b.app/screen/2?token=t";
  const A2 = "https://7900-sbx.e2b.app/screen/3?token=t";
  const browsers = (events: QoniEvent<unknown>[]) => {
    const lists = fold(events).filter((event) => event.type === "browsers").map((event) => event.data);
    return lists.at(-1) ?? [];
  };

  it("only agents with a browser, the lead first; an event only when the list changes", () => {
    const events = [
      wire("run.subagent.started", { child_id: "a1", label: "Reddit 讨论", live_url: null }),
      wire("run.subagent.started", { child_id: "a2", label: "a2", live_url: null }),
      wire("run.subagent.live_url_changed", { child_id: "a2", live_url: A2 }),
      wire("run.browser_live_url_changed", { live_url: LEAD, cdp_url: "" }),
    ];
    expect(fold(events).filter((event) => event.type === "browsers")).toHaveLength(2);
    expect(browsers(events).map((b) => [b.id, b.label, b.url, b.status])).toEqual([
      ["main", null, LEAD, null], ["a2", null, A2, "running"],
    ]);
  });

  it("a card states its work and need until it settles; closing its browser or card removes it", () => {
    const asking = [
      wire("run.subagent.started", { child_id: "a1", label: "比价 · Amazon", live_url: A1 }),
      wire("run.subagent.waiting", { child_id: "a1", status: "waiting", need: "login", site: "amazon.com", activity: "等你登录", user_in_control: true }),
    ];
    expect(browsers(asking)[0]).toMatchObject({
      status: "waiting", activity: "等你登录", userInControl: true,
      need: { kind: "login", site: "amazon.com", prompt: null },
    });
    const done = [...asking, wire("run.subagent.completed", { child_id: "a1", status: "completed", need: "login", live_url: null })];
    expect(browsers(done)[0]).toMatchObject({ status: "completed", need: null, url: A1 });
    expect(browsers([...done, wire("run.subagent.live_url_changed", { child_id: "a1", live_url: null })])).toEqual([]);
    expect(browsers([...done, wire("run.subagent.closed", { child_id: "a1" })])).toEqual([]);
  });

  it("a run ending settles only its own unfinished sub-agents; the lead closes on an empty address", () => {
    const events = [
      wire("run.subagent.started", { child_id: "a1", live_url: A1 }, "run_1"),
      wire("run.subagent.started", { child_id: "a2", live_url: A2, need: "help", prompt: "过验证码" }, "run_2"),
      wire("run.completed", { terminal_reason: "failed" }, "run_2"),
    ];
    expect(browsers(events).map((b) => [b.id, b.status, b.need])).toEqual([["a1", "running", null], ["a2", "failed", null]]);
    expect(browsers([
      wire("run.browser_live_url_changed", { live_url: LEAD }),
      wire("run.browser_live_url_changed", { live_url: "" }),
      wire("run.subagent.live_url_changed", { child_id: "x", live_url: "[redacted]" }),
    ])).toEqual([]);
  });
});

function transport() {
  const webAgentJson = vi.fn().mockResolvedValue({ data: {} });
  const webAgentBytes = vi.fn().mockResolvedValue({ bytes: new Uint8Array([1, 2]), mime: "text/plain" });
  const webAgentSSE = vi.fn();
  return { webAgentJson, webAgentBytes, webAgentSSE } as any;
}
const READ = { requiredScopes: ["webagent.do_anything:read"] };
const MANAGE = { requiredScopes: ["webagent.do_anything:manage"] };

describe("a session's computer, conversations and browsers", () => {
  it("lists and reads files with the person's token, and changes them with manage", async () => {
    const t = transport();
    const { files } = createComputerNamespaces(t);
    t.webAgentJson.mockResolvedValueOnce({ data: { source: "saved", saved_at: "2026-10-23T08:00:00Z", truncated: false, items: [
      { path: "workspace/r.md", name: "r.md", type: "file", size_bytes: 3, modified_at: "2026-10-23T07:00:00Z" },
      { path: "workspace", name: "workspace", type: "directory", size_bytes: null, modified_at: null },
    ] } });
    expect(await files.list({ token: "tok", sessionId: "s/1", path: "workspace", depth: 2 })).toEqual({
      source: "saved", savedAt: "2026-10-23T08:00:00Z", truncated: false, items: [
        { path: "workspace/r.md", name: "r.md", type: "file", sizeBytes: 3, modifiedAt: "2026-10-23T07:00:00Z" },
        { path: "workspace", name: "workspace", type: "directory", sizeBytes: null, modifiedAt: null },
      ],
    });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("GET", "/do_anything/sessions/s%2F1/files", "tok", { query: { path: "workspace", depth: 2 }, signal: undefined, ...READ });
    expect(await files.read({ token: "tok", sessionId: "s", path: "workspace/r.md" })).toEqual(new Uint8Array([1, 2]));
    expect(t.webAgentBytes).toHaveBeenLastCalledWith("/do_anything/sessions/s/files/blob", "tok", { query: { path: "workspace/r.md" }, signal: undefined, ...READ });

    t.webAgentJson.mockResolvedValueOnce({ data: { path: "notes/a.txt", name: "a.txt", type: "file", size_bytes: 2 } });
    await files.upload({ token: "tok", sessionId: "s", path: "notes/a.txt", content: new Uint8Array([104, 105]) });
    const [method, path, , upload] = t.webAgentJson.mock.lastCall;
    expect([method, path, upload.query, upload.headers, upload.requiredScopes]).toEqual(["PUT", "/do_anything/sessions/s/files", { path: "notes/a.txt" }, { "content-type": "application/octet-stream" }, MANAGE.requiredScopes]);
    expect(await (upload.body as Blob).text()).toBe("hi");

    await files.move({ token: "tok", sessionId: "s", from: "a.txt", to: "b.txt" });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("POST", "/do_anything/sessions/s/files/move", "tok", { body: { from: "a.txt", to: "b.txt" }, signal: undefined, ...MANAGE });
    await files.mkdir({ token: "tok", sessionId: "s", path: "notes/sub" });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("POST", "/do_anything/sessions/s/files/folders", "tok", { body: { path: "notes/sub" }, signal: undefined, ...MANAGE });
    await files.delete({ token: "tok", sessionId: "s", path: "notes" });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("DELETE", "/do_anything/sessions/s/files", "tok", { query: { path: "notes" }, signal: undefined, ...MANAGE });
    const calls = t.webAgentJson.mock.calls.length;
    await expect(files.read({ token: "tok", sessionId: "s", path: "/etc/passwd" })).rejects.toBeInstanceOf(QoniValidationError);
    expect(t.webAgentJson.mock.calls.length).toBe(calls);
  });

  it("watches changes until the computer sleeps, and opens the watch again when it just ended", async () => {
    vi.useFakeTimers();
    try {
      const t = transport();
      const frames = [
        [{ type: "live" }, { type: "created", path: "workspace/a.md" }],
        [{ type: "live" }, { type: "removed", path: "workspace/a.md" }, { type: "asleep" }],
      ];
      t.webAgentSSE.mockImplementation(async function* () { for (const data of frames.shift() ?? []) yield { data }; });
      const changes: unknown[] = [];
      const done = (async () => { for await (const change of createComputerNamespaces(t).files.watch({ token: "tok", sessionId: "s" })) changes.push(change); })();
      await vi.runAllTimersAsync();
      await done;
      expect(changes).toEqual([{ type: "created", path: "workspace/a.md" }, { type: "removed", path: "workspace/a.md" }]);
      expect(t.webAgentSSE).toHaveBeenCalledTimes(2);
      expect(t.webAgentSSE).toHaveBeenLastCalledWith("/do_anything/sessions/s/files/watch", "tok", { signal: undefined, ...READ });
    } finally {
      vi.useRealTimers();
    }
  });

  it("maps conversations, their costs, every conversation's files and the browsers", async () => {
    const t = transport();
    const { sessions, browsers, files } = createComputerNamespaces(t);
    t.webAgentJson.mockResolvedValueOnce({ data: { items: [{ id: "s1", title: "比价", status: "idle", latest_run_id: "r1", failure_reason: "insufficient_credits", created_at: "c", updated_at: "u" }] } });
    expect(await sessions.list({ token: "tok", limit: 5 })).toMatchObject([{ id: "s1", title: "比价", status: "idle", latestRunId: "r1", failureReason: "insufficient_credits" }]);
    expect(t.webAgentJson).toHaveBeenLastCalledWith("GET", "/do_anything/sessions", "tok", { query: { limit: 5 }, signal: undefined, ...READ });
    t.webAgentJson.mockResolvedValueOnce({ data: { enabled: true, runs: [{ run_id: "r1", credits: "12.5", status: "current" }] } });
    expect(await sessions.credits({ token: "tok", sessionId: "s1" })).toEqual({ metered: true, runs: [{ runId: "r1", credits: "12.5", status: "current" }] });
    t.webAgentJson.mockResolvedValueOnce({ data: { items: [{ session_id: "s1", title: "比价", saved_at: "t", truncated: false, items: [{ path: "workspace/r.md", name: "r.md", type: "file", size_bytes: 3, modified_at: "m" }] }] } });
    expect(await files.listAll({ token: "tok" })).toEqual([{ sessionId: "s1", title: "比价", savedAt: "t", truncated: false, items: [{ path: "workspace/r.md", name: "r.md", type: "file", sizeBytes: 3, modifiedAt: "m" }] }]);
    t.webAgentJson.mockResolvedValueOnce({ data: { items: [{ id: "a1", label: "Amazon", url: "https://x/screen/2", status: "waiting", activity: null, need: { kind: "login", site: "amazon.com", prompt: null }, user_in_control: false, started_at: "t0" }] } });
    expect(await browsers.list({ token: "tok", sessionId: "s1" })).toEqual([{ id: "a1", label: "Amazon", url: "https://x/screen/2", status: "waiting", activity: null, need: { kind: "login", site: "amazon.com", prompt: null }, userInControl: false, startedAt: "t0" }]);
    await browsers.control({ token: "tok", sessionId: "s1", browserId: "a1", action: "done" });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("POST", "/do_anything/sessions/s1/subagents/a1/control", "tok", { body: { action: "done" }, signal: undefined, ...MANAGE });
    await expect(browsers.control({ token: "tok", sessionId: "s1", browserId: "main", action: "take" })).rejects.toBeInstanceOf(QoniValidationError);
  });

  it("is part of doAnything", () => {
    const api: any = createDoAnythingNamespace(transport());
    expect(typeof api.sessions.list).toBe("function");
    expect(typeof api.browsers.list).toBe("function");
    expect(typeof api.files.watch).toBe("function");
  });
});

describe("follow-ups, notifications and the workspace's credits", () => {
  it("speak the wire with the right scopes", async () => {
    const t = transport();
    const check = { id: "p1", session_id: "s1", status: "scheduled", note: "看看价格", due_at: "d", created_by: "api", source_run_id: null, run_id: null, headline: null, error: null, finished_at: null, created_at: "c", updated_at: "u" };
    t.webAgentJson.mockResolvedValue({ data: check });
    const proactive = createProactiveNamespace(t);
    expect(await proactive.create({ token: "tok", sessionId: "s1", note: "看看价格", delaySeconds: 3600 })).toMatchObject({ id: "p1", sessionId: "s1", status: "scheduled", createdBy: "api" });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("POST", "/proactive/checks", "tok", { body: { session_id: "s1", note: "看看价格", delay_seconds: 3600 }, ...MANAGE });
    await proactive.runNow({ token: "tok", checkId: "p1" });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("POST", "/proactive/checks/p1/run_now", "tok", { body: {}, ...MANAGE });
    await expect(proactive.create({ token: "tok", sessionId: "s1", note: "n" })).rejects.toBeInstanceOf(QoniValidationError);

    t.webAgentJson.mockResolvedValueOnce({ data: { items: [{ id: "n1", title: "降价了", body: "…", session_id: "s1", track_id: "t1", proactive_id: null, read: false, created_at: "c" }], unread: 1 } });
    expect(await createNotificationsNamespace(t).list({ token: "tok" })).toEqual({ unread: 1, items: [{ id: "n1", title: "降价了", body: "…", sessionId: "s1", trackId: "t1", proactiveId: null, read: false, createdAt: "c" }] });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("GET", "/notifications", "tok", { query: undefined, requiredScopes: ["webagent.track:read"] });

    t.webAgentJson.mockResolvedValueOnce({ data: { available: 123 } });
    expect(await createWorkspaceNamespace(t).credits({ token: "tok" })).toEqual({ available: 123 });
    expect(t.webAgentJson).toHaveBeenLastCalledWith("GET", "/billing/credits", "tok", { signal: undefined, ...READ });
  });

  it("lists tracks and streams a track's checks without ending at one", async () => {
    const t = transport();
    t.webAgentJson.mockResolvedValueOnce({ data: { items: [{ id: "k1", session_id: "s9", schedule: { every_seconds: 600 }, checking: true }] } });
    const track = createTrackNamespace(t);
    expect(await track.list({ token: "tok" })).toEqual([{ id: "k1", sessionId: "s9", schedule: { kind: "interval", intervalSeconds: 600 }, checking: true }]);
    t.webAgentJson.mockResolvedValue({ data: { id: "k1", session_id: "s9" } });
    t.webAgentSSE.mockImplementation(async function* () {
      yield wire("run.completed", { terminal_reason: "done" }, "check_1");
      yield wire("run.message", { role: "ai", type: "assistant_message", text: "降价了", message_id: "m2" }, "check_2");
    });
    const handle = await track.attach("k1", { token: "tok" });
    const events = [];
    for await (const event of handle.events()) events.push(event);
    expect(events.map((event) => [event.type, event.runId])).toEqual([["done", "check_1"], ["message", "check_2"]]);
    expect(t.webAgentSSE).toHaveBeenLastCalledWith("/do_anything/sessions/s9/events", "tok", { lastEventId: undefined, signal: undefined, ...READ });
  });
});

describe("the agent's own email on its confirmation", () => {
  it("is laid out from the card, not parsed out of its prompt", () => {
    const card = normalizeInteraction({
      id: "c1", type: "confirmation", status: "pending", created_at: "2026-10-23T08:00:00Z", title: "Send?",
      summary: "发送这封邮件？", mail: { to: "owner@person.test", subject: "Order", text: "Ships tomorrow." }, actions: [],
    });
    expect(card?.type === "confirmation" && card.payload).toEqual({
      summary: "发送这封邮件？", mail: { to: "owner@person.test", subject: "Order", text: "Ships tomorrow." },
    });
    const plain = normalizeInteraction({ id: "c2", type: "confirmation", status: "pending", created_at: "2026-10-23T08:00:00Z", title: "OK?", summary: "Pay?", actions: [] });
    expect(plain?.type === "confirmation" && plain.payload).toEqual({ summary: "Pay?" });
  });
});

describe("errors an app acts on", () => {
  it("a missing or withdrawn consent is its own error, and still a permission denial", () => {
    const denial = errorFromPayload(403, { code: "eak.delegation.needs_authorization", message: "Delegation consent rejected" }, "x");
    expect(denial).toBeInstanceOf(QoniConsentRequiredError);
    expect(denial).toBeInstanceOf(QoniPermissionDeniedError);
    expect(denial).toMatchObject({ code: "eak.delegation.needs_authorization", status: 403 });
    expect(errorFromPayload(403, { code: "permission_denied", message: "scope missing" }, "x")).not.toBeInstanceOf(QoniConsentRequiredError);
    expect(errorFromPayload(401, { message: "needs_authorization" }, "x")).toBeInstanceOf(QoniAuthError);
  });
});

describe("activating a personal agent", () => {
  it("approves, credentials and syncs it, with a key per step, never the console credential route", async () => {
    const calls: Array<[string, string, Record<string, string> | undefined]> = [];
    let synced = false;
    const t = {
      genauthJson: vi.fn(async (method: string, path: string, _token: string, payload: { headers?: Record<string, string> }) => {
        calls.push([method, path, payload.headers]);
        if (path.endsWith("/authorization")) return { data: { data: { active_grant: synced ? { status: "active", permission_sync_status: "synced" } : null } } };
        if (path.endsWith("/capability-grant/draft")) return { data: { data: { version: 3 } } };
        if (path === "/api/v3/agent-identity/approvals") return { data: { data: [{ id: "ap1", agent_id: "agent-1", status: "pending", version: 4 }] } };
        if (path.endsWith("/data-permissions/sync")) synced = true;
        return { data: { data: {} } };
      }),
    } as any;
    const admin = async () => ({ accessToken: "admin", userPoolId: "pool" });
    const result = await activateAgent(t, admin, { agentId: "agent-1", userId: "user-1", audience: "app-1", dataPolicyIds: ["p1"] });
    expect(result).toMatchObject({ agentId: "agent-1", ready: true });
    expect(calls.map(([method, path]) => `${method} ${path}`)).toEqual([
      "POST /api/v3/authorize-data-policies",
      "GET /api/v3/agent-identity/agents/agent-1/authorization",
      "PUT /api/v3/agent-identity/agents/agent-1/capability-grant/draft",
      "POST /api/v3/agent-identity/agents/agent-1/capability-grant/submit",
      "GET /api/v3/agent-identity/approvals",
      "POST /api/v3/agent-identity/approvals/ap1/approve",
      "POST /api/v3/agent-identity/agents/agent-1/credentials",
      "POST /api/v3/agent-identity/agents/agent-1/data-permissions/sync",
      "GET /api/v3/agent-identity/agents/agent-1/authorization",
    ]);
    expect(calls.find(([, path]) => path.endsWith("/submit"))?.[2]?.["Idempotency-Key"]).toBe("qoni-activate-submit-agent-1");
    expect(calls.some(([, path]) => path.endsWith("/credential"))).toBe(false);

    calls.length = 0;
    expect(await activateAgent(t, admin, { agentId: "agent-1", userId: "user-1", audience: "app-1", dataPolicyIds: ["p1"] })).toMatchObject({ ready: true });
    expect(calls.map(([method, path]) => `${method} ${path}`)).toEqual([
      "POST /api/v3/authorize-data-policies", "GET /api/v3/agent-identity/agents/agent-1/authorization",
    ]);
  });
});
