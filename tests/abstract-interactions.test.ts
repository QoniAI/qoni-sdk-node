import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  InteractionTypes,
  Qoni,
  QoniProductScopes,
  QoniScopeBundles,
  QoniScopes,
  QoniValidationError,
  type AskUserAnswerType,
  type Interaction,
  type InteractionHandle,
  type RunEvent,
  type TypedInteraction,
} from "../src";
import { InteractionHandle as InteractionHandleClass, normalizeInteraction } from "../src/interactions";
import type { Action } from "../src/interactions";

// SDK 0.9.0 — DoAnything's five abstract interaction types, pinned against the
// Web Agent wire observed on origin/main 2026-10-06:
//  1. The backend still emits `clarification` (with `input_type: "choice"` and
//     string `options` when the agent offers fixed choices). The SDK presents it
//     as `ask_user` with a structured `answerType` / `{ value, label }` options.
//  2. `answer()` sends structured values (`response: Any` on the wire) after
//     checking them against the payload's answerType locally.
//  3. `confirmSignedIn()` saves the login opened by `openLogin()` itself
//     (`POST /profiles/{id}/confirm`) before telling the agent to recheck.
//  4. A resolve event reuses `type: "clarification"` for every interaction; the
//     run handle keeps the original type and payload so cards stay type-stable.
//  5. New delegatable scope constants for the Personal Agent guide.

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

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
    occurred_at: `2026-10-07T08:00:0${id}+00:00`, data,
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

/** Scopes requested by the token exchange made right before `call`. */
function exchangeScopesBefore(calls: Captured[], call: Captured): string[] {
  const exchange = calls[calls.indexOf(call) - 1];
  expect(exchange.pathname).toBe("/api/v3/eak/token-exchange");
  return (exchange.body as { scopes: string[] }).scopes;
}

const RUN = "/do_anything/runs/run_1/interactions/ix_1";

function wireAsk(extra: Record<string, unknown>) {
  return {
    id: "ix_1", type: "clarification", status: "pending", created_at: "2026-10-07T08:00:00Z",
    title: "Agent has a question", prompt: "Which color?", question: "Which color?",
    actions: [
      { kind: "answer", label: "Answer", method: "POST", endpoint: `${RUN}/answer` },
      { kind: "skip", label: "Skip", method: "POST", endpoint: `${RUN}/skip` },
    ],
    ...extra,
  };
}

function wireSiteLogin() {
  return {
    id: "ix_1", type: "site_login", status: "pending", created_at: "2026-10-07T08:00:00Z",
    title: "Sign in",
    sites: [{ site_id: "amazon", display_name: "Amazon", login_url: "https://www.amazon.com/ap/signin" }],
    actions: [
      { kind: "open_login", label: "Sign in", method: "POST", endpoint: "/profiles/login" },
      { kind: "confirm_signed_in", label: "I've signed in", method: "POST", endpoint: `${RUN}/confirm_signed_in` },
      { kind: "skip", label: "Skip", method: "POST", endpoint: `${RUN}/skip` },
    ],
  };
}

describe("ask_user: the backend's clarification, presented as a structured question", () => {
  it("normalizes a free-text clarification to ask_user with answerType text", () => {
    const ix = normalizeInteraction(wireAsk({}))!;
    expect(ix.type).toBe("ask_user");
    expect(ix.payload).toEqual({ question: "Which color?", answerType: "text" });
  });

  it("turns input_type choice + string options into single_choice with { value, label } options", () => {
    const ix = normalizeInteraction(wireAsk({ input_type: "choice", options: ["Space Gray", "Silver"] }))!;
    expect(ix.type).toBe("ask_user");
    expect(ix.payload).toEqual({
      question: "Which color?",
      answerType: "single_choice",
      options: [
        { value: "Space Gray", label: "Space Gray" },
        { value: "Silver", label: "Silver" },
      ],
    });
  });

  it("reads a native ask_user object with answer_type and { value, label } options", () => {
    const ix = normalizeInteraction({
      ...wireAsk({}),
      type: "ask_user",
      answer_type: "multiple_choice",
      options: [{ value: "space-gray", label: "深空灰" }, { value: "silver" }],
    })!;
    expect(ix.payload).toEqual({
      question: "Which color?",
      answerType: "multiple_choice",
      options: [
        { value: "space-gray", label: "深空灰" },
        { value: "silver", label: "silver" },
      ],
    });
  });

  it("falls back to text when a choice question arrives without any options", () => {
    const ix = normalizeInteraction(wireAsk({ input_type: "choice" }))!;
    expect(ix.payload).toEqual({ question: "Which color?", answerType: "text" });
  });

  it("keeps the deprecated InteractionTypes.Clarification working by pointing it at ask_user", () => {
    expect(InteractionTypes.AskUser).toBe("ask_user");
    expect(InteractionTypes.Clarification).toBe(InteractionTypes.AskUser);
    expect(Object.values(InteractionTypes)).not.toContain("clarification");
  });
});

describe("answer(): structured values checked against answerType", () => {
  function handleFor(answerType: AskUserAnswerType, options?: string[]) {
    const posted: Array<{ action: Action; body: unknown }> = [];
    const wire = wireAsk({ type: "ask_user", answer_type: answerType, ...(options ? { options } : {}) });
    const handle = new InteractionHandleClass(normalizeInteraction(wire)!, async (action, body) => {
      posted.push({ action, body });
    });
    return { handle, posted };
  }

  it("posts each answer type's value unchanged as { response }", async () => {
    const cases: Array<[AskUserAnswerType, string[] | undefined, string | number | boolean | string[]]> = [
      ["text", undefined, "the blue one"],
      ["single_choice", ["space-gray", "silver"], "space-gray"],
      ["multiple_choice", ["space-gray", "silver"], ["space-gray", "silver"]],
      ["number", undefined, 2],
      ["boolean", undefined, false],
    ];
    for (const [answerType, options, value] of cases) {
      const { handle, posted } = handleFor(answerType, options);
      await handle.answer(value);
      expect(posted).toEqual([{ action: expect.objectContaining({ kind: "answer" }), body: { response: value } }]);
    }
  });

  it("rejects a value that does not fit the answerType, naming what fits, and posts nothing", async () => {
    const cases: Array<[AskUserAnswerType, string[] | undefined, unknown, string]> = [
      ["text", undefined, 3, "string"],
      ["single_choice", ["space-gray", "silver"], "gold", "space-gray, silver"],
      ["multiple_choice", ["space-gray", "silver"], "silver", "array"],
      ["multiple_choice", ["space-gray", "silver"], ["silver", "gold"], "space-gray, silver"],
      ["number", undefined, "2", "number"],
      ["number", undefined, Number.NaN, "number"],
      ["boolean", undefined, "yes", "boolean"],
    ];
    for (const [answerType, options, value, hint] of cases) {
      const { handle, posted } = handleFor(answerType, options);
      const error = await handle.answer(value as string).catch((err: unknown) => err);
      expect(error, `${answerType} ← ${JSON.stringify(value)}`).toBeInstanceOf(QoniValidationError);
      expect((error as Error).message).toContain(hint);
      expect(posted).toEqual([]);
    }
  });
});

describe("site_login: openLogin() → confirmSignedIn() saves the login automatically", () => {
  function loginClient(confirmResponse: () => Response = () =>
    jsonResponse({ profile_id: "u-1", state: "active", probe_result: "signed_in" })) {
    return makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") {
        return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      }
      if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
      }
      if (call.pathname.endsWith("/profiles/login")) {
        return jsonResponse({
          profile_id: "u-1", site_id: "amazon", session_id: "login_1", live_url: "https://live.example.com/v/1",
        }, { status: 201 });
      }
      if (/\/profiles\/[^/]+\/confirm$/.test(call.pathname)) return confirmResponse();
      return jsonResponse({ data: {} });
    });
  }

  async function loginHandle(confirmResponse?: () => Response) {
    const harness = loginClient(confirmResponse);
    const run = await harness.client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    return { ...harness, run, handle };
  }

  const saved = (calls: Captured[]) => calls.filter((call) => /\/profiles\/[^/]+\/confirm$/.test(call.pathname));
  const signedIn = (calls: Captured[]) => calls.filter((call) => call.pathname.endsWith("/confirm_signed_in"));

  it("saves the login with the site-login confirm scope, then tells the agent to recheck", async () => {
    const { handle, calls } = await loginHandle();
    const login = await handle.openLogin();
    expect(login.liveUrl).toBe("https://live.example.com/v/1");
    await handle.confirmSignedIn();

    const [save] = saved(calls);
    const [recheck] = signedIn(calls);
    expect(save.pathname).toBe("/api/v1/projects/tenant_1/profiles/u-1/confirm");
    expect(save.body).toEqual({ site_id: "amazon" });
    expect(exchangeScopesBefore(calls, save)).toEqual([QoniScopes.SITE_LOGIN_CONFIRM]);
    expect(recheck.pathname).toBe(`/api/v1/projects/tenant_1${RUN}/confirm_signed_in`);
    expect(exchangeScopesBefore(calls, recheck)).toEqual([QoniScopes.DO_ANYTHING_MANAGE]);
    expect(calls.indexOf(save)).toBeLessThan(calls.indexOf(recheck));
  });

  it("only tells the agent to recheck when openLogin() was never called on this interaction", async () => {
    const { handle, calls } = await loginHandle();
    await handle.confirmSignedIn();
    expect(saved(calls)).toEqual([]);
    expect(signedIn(calls)).toHaveLength(1);
  });

  it("still lets the agent recheck when the backend no longer holds the login (409 no_pending_login)", async () => {
    const { handle, calls } = await loginHandle(() =>
      jsonResponse({ detail: { code: "no_pending_login", detail: "profile is in state 'active'" } }, { status: 409 }));
    await handle.openLogin();
    await handle.confirmSignedIn();
    expect(saved(calls)).toHaveLength(1);
    expect(signedIn(calls)).toHaveLength(1);
  });

  it("still lets the agent recheck when the user was not signed in yet — the agent asks again if needed", async () => {
    const { handle, calls } = await loginHandle(() =>
      jsonResponse({ profile_id: "u-1", state: "pending_login", probe_result: "logged_out" }));
    await handle.openLogin();
    await handle.confirmSignedIn();
    expect(saved(calls)).toHaveLength(1);
    expect(signedIn(calls)).toHaveLength(1);
  });

  it("surfaces any other save failure (for example a missing scope) and does not tell the agent to recheck", async () => {
    const { handle, calls } = await loginHandle(() =>
      jsonResponse({ detail: { code: "insufficient_scope", detail: "missing webagent.site_login:confirm" } }, { status: 403 }));
    await handle.openLogin();
    await expect(handle.confirmSignedIn()).rejects.toMatchObject({ status: 403 });
    expect(signedIn(calls)).toEqual([]);
  });

  it("does not save twice when the app already called the deprecated login.confirm()", async () => {
    const { handle, calls } = await loginHandle();
    const login = await handle.openLogin();
    await login.confirm();
    await handle.confirmSignedIn();
    expect(saved(calls)).toHaveLength(1);
    expect(signedIn(calls)).toHaveLength(1);
  });

  it("remembers the login across handles of the same run, as onInteraction hands out a new handle per event", async () => {
    const { run, handle, calls } = await loginHandle();
    await handle.openLogin();
    const later = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    await later.confirmSignedIn();
    expect(saved(calls)).toHaveLength(1);
    expect(signedIn(calls)).toHaveLength(1);
  });

  it("checks that confirm_signed_in is offered before saving anything", async () => {
    const { run, calls } = await loginHandle();
    const wire = wireSiteLogin();
    wire.actions = wire.actions.filter((action) => action.kind !== "confirm_signed_in");
    const handle = run.interactionHandle(normalizeInteraction(wire)!);
    await handle.openLogin();
    await expect(handle.confirmSignedIn()).rejects.toBeInstanceOf(QoniValidationError);
    expect(saved(calls)).toEqual([]);
  });
});

describe("run handle: an interaction keeps its type across created → resolved", () => {
  const resolveShell = {
    id: "ix_1", type: "clarification", status: "resolved", created_at: "2026-10-07T08:05:00Z",
    resolved_at: "2026-10-07T08:05:00Z", title: "Resolved", question: "", actions: [],
  };

  function streamingClient(frames: string) {
    return makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") {
        return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      }
      if (call.pathname.endsWith("/events")) return sseResponse(frames);
      if (call.pathname.endsWith("/artifacts")) return jsonResponse({ data: { items: [] } });
      if (call.method === "GET" && call.pathname.endsWith("/runs/run_1")) {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "succeeded" } });
      }
      return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1" } });
    });
  }

  it("events() folds the resolve onto the original card: same type and payload, new status", async () => {
    const { client } = streamingClient(
      frame(1, "run.interaction", wireSiteLogin()) +
        frame(2, "run.interaction", resolveShell) +
        frame(3, "run.completed", { terminal_reason: "done" }),
    );
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const seen: Interaction[] = [];
    for await (const event of run.events()) if (event.type === "interaction") seen.push(event.data);

    expect(seen.map((ix) => [ix.type, ix.status])).toEqual([
      ["site_login", "pending"],
      ["site_login", "resolved"],
    ]);
    expect(seen[1]).toMatchObject({
      createdAt: "2026-10-07T08:00:00Z",
      resolvedAt: "2026-10-07T08:05:00Z",
      title: "Sign in",
      actions: [],
      payload: { sites: [{ siteId: "amazon", displayName: "Amazon", loginUrl: "https://www.amazon.com/ap/signin" }] },
    });
  });

  it("wait() hands onInteraction the folded card, so a confirmation stays a confirmation", async () => {
    const confirmation = {
      id: "ix_1", type: "confirmation", status: "pending", created_at: "2026-10-07T08:00:00Z",
      title: "Confirm", summary: "Pay $1,299.00", actions: [
        { kind: "confirm", label: "Confirm", method: "POST", endpoint: `${RUN}/confirm` },
        { kind: "reject", label: "Reject", method: "POST", endpoint: `${RUN}/reject` },
      ],
    };
    const { client } = streamingClient(
      frame(1, "run.interaction", confirmation) +
        frame(2, "run.interaction", resolveShell) +
        frame(3, "run.completed", { terminal_reason: "done" }),
    );
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const seen: Array<[string, string, string]> = [];
    await run.wait({
      onInteraction: (handle) => {
        const request = handle.interaction;
        if (request.type === "confirmation") seen.push([request.type, request.status, request.payload.summary]);
        else seen.push([request.type, request.status, ""]);
      },
    });
    expect(seen).toEqual([
      ["confirmation", "pending", "Pay $1,299.00"],
      ["confirmation", "resolved", "Pay $1,299.00"],
    ]);
  });

  it("wait() leaves a sign-in's own take_control to its site_login card", async () => {
    // openLogin() opens the browser through a take_control (reason site_login).
    // Handed out as a second card, an App following the docs took it over after
    // confirmSignedIn() had closed it, got 409, and the rejected handler ended wait().
    const loginControl = (status: string) => ({
      id: "tc_login", type: "take_control", status, created_at: "2026-10-07T08:01:00Z", title: "Take over",
      live_url: "https://live/login", reason: "site_login", actions: [],
    });
    const captcha = {
      id: "tc_captcha", type: "take_control", status: "pending", created_at: "2026-10-07T08:02:00Z", title: "Take over",
      live_url: "https://live/captcha", reason: "captcha_required", actions: [],
    };
    const { client } = streamingClient(
      frame(1, "run.interaction", wireSiteLogin()) +
        frame(2, "run.interaction", loginControl("pending")) +
        frame(3, "run.interaction", loginControl("resolved")) +
        frame(4, "run.interaction", captcha) +
        frame(5, "run.completed", { terminal_reason: "done" }),
    );
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handed: string[] = [];
    const seen: string[] = [];
    await run.wait({
      onEvent: (event) => { if (event.type === "interaction") seen.push(event.data.id); },
      onInteraction: (handle) => { handed.push(`${handle.interaction.type}/${handle.interaction.id}`); },
    });
    expect(handed).toEqual(["site_login/ix_1", "take_control/tc_captcha"]);
    expect(seen).toContain("tc_login");
  });

  it("a new interaction id is never folded onto an earlier one", async () => {
    const { client } = streamingClient(
      frame(1, "run.interaction", wireSiteLogin()) +
        frame(2, "run.interaction", { ...wireAsk({}), id: "ix_2" }) +
        frame(3, "run.completed", { terminal_reason: "done" }),
    );
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const types: string[] = [];
    for await (const event of run.events()) if (event.type === "interaction") types.push(event.data.type);
    expect(types).toEqual(["site_login", "ask_user"]);
  });
});

describe("typing: switch (interaction.type) narrows the payload", () => {
  it("narrows each branch and rejects the retired clarification type", () => {
    // Compile-time assertions: `pnpm typecheck` fails if narrowing regresses.
    function render(handle: InteractionHandle, _event?: RunEvent): string {
      const request = handle.interaction;
      expectTypeOf(request).toEqualTypeOf<TypedInteraction>();
      switch (request.type) {
        case "site_login":
          return request.payload.sites.map((site) => site.loginUrl).join();
        case "take_control":
          return request.payload.liveUrl;
        case "ask_user":
          expectTypeOf(request.payload.answerType).toEqualTypeOf<AskUserAnswerType>();
          return `${request.payload.question}:${(request.payload.options ?? []).map((o) => o.value).join()}`;
        case "fill_form":
          return request.payload.fields.map((field) => field.name).join();
        case "confirmation":
          return request.payload.summary;
        case "wait":
          return request.payload.waitKind;
        // @ts-expect-error clarification is normalized to ask_user and is no longer a type
        case "clarification":
          return "";
        default: {
          const exhausted: never = request;
          return exhausted;
        }
      }
    }
    expect(typeof render).toBe("function");
    expectTypeOf<Interaction<"site_login">["payload"]["sites"]>().items.toHaveProperty("siteId");
  });
});

describe("scopes for the Personal Agent guide", () => {
  it("exports the user profile, payment and Agent mailbox scopes with their wire strings", () => {
    expect(QoniScopes).toMatchObject({
      USER_PROFILE_READ: "user.profile:read",
      USER_PROFILE_WRITE: "user.profile:write",
      USER_PAYMENT_USE: "user.payment:use",
      AGENT_MAIL_READ: "agent.mail:read",
      AGENT_MAIL_SEND: "agent.mail:send",
    });
  });

  it("keeps them out of every product bundle: they are always requested explicitly", () => {
    const bundled = new Set<string>([
      ...Object.values(QoniProductScopes).flat(),
      ...Object.values(QoniScopeBundles).flat(),
    ]);
    for (const scope of ["user.profile:read", "user.profile:write", "user.payment:use", "agent.mail:read", "agent.mail:send"]) {
      expect(bundled.has(scope)).toBe(false);
    }
  });

  it("sends explicit personal scopes with a formal agentId through interactive delegation", async () => {
    const { client, calls } = makeClient(() =>
      jsonResponse({ data: { mode: "interactive", grantId: "g", grantState: "pending", authorizationUrl: "https://qoni.example.com/delegations/g/authorize" } }));
    const grant = await client.genauth.delegateAgent({
      agentId: "01234567-89ab-4cde-8f01-23456789abcd",
      mode: "interactive",
      redirectUri: "https://app.example.test/callback",
      state: "csrf-personal-agent",
      scopes: [QoniScopes.USER_PROFILE_READ, QoniScopes.USER_PAYMENT_USE, QoniScopes.AGENT_MAIL_READ],
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual({
      agentId: "01234567-89ab-4cde-8f01-23456789abcd",
      mode: "interactive",
      redirectUri: "https://app.example.test/callback",
      state: "csrf-personal-agent",
      scopes: ["user.profile:read", "user.payment:use", "agent.mail:read"],
    });
    expect(grant).toMatchObject({ mode: "interactive", grantId: "g", grantState: "pending" });
  });

  it("rejects personal mailbox scope requests made with a legacy agent label before HTTP", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: {} }));
    await expect(client.genauth.delegateAgent({
      userId: "user_1",
      agent: "shopper",
      scopes: [QoniScopes.USER_PROFILE_READ, QoniScopes.USER_PAYMENT_USE, QoniScopes.AGENT_MAIL_READ],
    })).rejects.toBeInstanceOf(QoniValidationError);
    expect(calls).toHaveLength(0);
  });

  it("names every candidate when a scope without its service prefix is ambiguous", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: {} }));
    const error = await client.delegateToken({ userId: "user_1", scopes: ["profile:read"] }).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(QoniValidationError);
    expect((error as Error).message).toContain("gumem.profile:read");
    expect((error as Error).message).toContain("user.profile:read");
    expect(calls).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Review round 1 (codex-reviewer, 2026-10-07): edge cases the first cut missed.
// ---------------------------------------------------------------------------

describe("ask_user options keep every legal value", () => {
  it("keeps an empty-string option and accepts it as an answer", async () => {
    const posted: unknown[] = [];
    const ix = normalizeInteraction(wireAsk({ input_type: "choice", options: ["", "Yes"] }))!;
    expect(ix.payload).toEqual({
      question: "Which color?",
      answerType: "single_choice",
      options: [{ value: "", label: "" }, { value: "Yes", label: "Yes" }],
    });
    await new InteractionHandleClass(ix, async (_action, body) => { posted.push(body); }).answer("");
    expect(posted).toEqual([{ response: "" }]);
  });

  it("keeps a native answer_type even when it arrives without options", async () => {
    const posted: unknown[] = [];
    const ix = normalizeInteraction({ ...wireAsk({}), type: "ask_user", answer_type: "multiple_choice", options: [] })!;
    expect(ix.payload).toEqual({ question: "Which color?", answerType: "multiple_choice" });
    await new InteractionHandleClass(ix, async (_action, body) => { posted.push(body); }).answer([]);
    expect(posted).toEqual([{ response: [] }]);
  });
});

describe("folding keeps real updates and repairs only shells", () => {
  const takeControl = (status: string, extra: Record<string, unknown>) => ({
    id: "ix_tc", type: "take_control", status, created_at: "2026-10-07T08:00:00Z", title: "Take over",
    actions: [], ...extra,
  });

  async function cardsFrom(frames: Array<Record<string, unknown>>, startAt?: string) {
    const body = frames.map((data, i) => frame(i + 1, "run.interaction", data)).join("") +
      frame(frames.length + 1, "run.completed", { terminal_reason: "done" });
    const { client } = makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/events")) return sseResponse(body);
      return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1" } });
    });
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const cards: Interaction[] = [];
    for await (const event of run.events({ lastEventId: startAt })) if (event.type === "interaction") cards.push(event.data);
    return cards;
  }

  it("a settled update with real content of the same type replaces the card", async () => {
    const cards = await cardsFrom([
      takeControl("pending", { live_url: "https://live/old", reason: "captcha" }),
      takeControl("active", { live_url: "https://live/new", reason: "captcha" }),
      takeControl("expired", { live_url: "", reason: "control_expired", expires_at: "2026-10-07T08:09:00Z" }),
    ]);
    expect(cards.at(-1)).toMatchObject({
      type: "take_control",
      status: "expired",
      expiresAt: "2026-10-07T08:09:00Z",
      payload: { liveUrl: "", reason: "control_expired" },
    });
  });

  it("a same-type resolve shell (site_login login_cleared) keeps the original sites and title", async () => {
    const cards = await cardsFrom([
      wireSiteLogin(),
      { id: "ix_1", type: "site_login", status: "resolved", created_at: "2026-10-07T08:05:00Z",
        resolved_at: "2026-10-07T08:05:00Z", title: "Resolved", actions: [],
        sites: [{ site_id: "", display_name: "", login_url: "" }] },
    ]);
    expect(cards.at(-1)).toMatchObject({
      type: "site_login", status: "resolved", title: "Sign in", createdAt: "2026-10-07T08:00:00Z",
      payload: { sites: [{ siteId: "amazon" }] },
    });
  });

  it("a full card arriving after a shell (replay order) repairs the cached type", async () => {
    const shell = {
      id: "ix_1", type: "clarification", status: "resolved", created_at: "2026-10-07T08:05:00Z",
      resolved_at: "2026-10-07T08:05:00Z", title: "Resolved", question: "", actions: [],
    };
    const cards = await cardsFrom([shell, wireSiteLogin()]);
    expect(cards.map((ix) => [ix.type, ix.status])).toEqual([
      ["ask_user", "resolved"],
      ["site_login", "pending"],
    ]);
    expect(cards[1].payload).toMatchObject({ sites: [{ siteId: "amazon" }] });
  });
});

describe("confirmSignedIn(): one save, one recheck, honest failures", () => {
  function loginHarness(confirm: () => Response | Promise<Response>, open?: () => Response | Promise<Response>) {
    return makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
      }
      if (call.pathname.endsWith("/profiles/login")) {
        return open?.() ?? jsonResponse({ profile_id: "u-1", site_id: "amazon", session_id: "login_1", live_url: "https://live/1" }, { status: 201 });
      }
      if (/\/profiles\/[^/]+\/confirm$/.test(call.pathname)) return confirm();
      return jsonResponse({ data: {} });
    });
  }
  const saves = (calls: Captured[]) => calls.filter((call) => /\/profiles\/[^/]+\/confirm$/.test(call.pathname));
  const rechecks = (calls: Captured[]) => calls.filter((call) => call.pathname.endsWith("/confirm_signed_in"));
  const SAVED = () => jsonResponse({ profile_id: "u-1", state: "active", probe_result: "alive" });

  it("treats release_failed as a retryable save failure: no recheck, and a retry saves again", async () => {
    let attempt = 0;
    const { client, calls } = loginHarness(() => (++attempt === 1
      ? jsonResponse({ profile_id: "u-1", state: "pending_login", probe_result: "release_failed" })
      : SAVED()));
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    await handle.openLogin();
    await expect(handle.confirmSignedIn()).rejects.toMatchObject({ code: "site_login.save_failed", retryable: true });
    expect(rechecks(calls)).toEqual([]);
    await handle.confirmSignedIn();
    expect(saves(calls)).toHaveLength(2);
    expect(rechecks(calls)).toHaveLength(1);
  });

  it("concurrent confirmSignedIn() calls from two handles save once and recheck once", async () => {
    const { client, calls } = loginHarness(SAVED);
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const first = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    const second = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    await first.openLogin();
    await Promise.all([first.confirmSignedIn(), second.confirmSignedIn()]);
    expect(saves(calls)).toHaveLength(1);
    expect(rechecks(calls)).toHaveLength(1);
  });

  it("the deprecated login.confirm() and confirmSignedIn() share one save, even when concurrent", async () => {
    const { client, calls } = loginHarness(SAVED);
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    const login = await handle.openLogin();
    const [result] = await Promise.all([login.confirm(), handle.confirmSignedIn()]);
    expect(result).toMatchObject({ active: true });
    expect(saves(calls)).toHaveLength(1);
    expect(rechecks(calls)).toHaveLength(1);
  });

  it("the latest openLogin() call wins even when an older call returns later", async () => {
    const pending: Array<() => void> = [];
    let opened = 0;
    const { client, calls } = loginHarness(SAVED, () => new Promise<Response>((resolve) => {
      const n = ++opened;
      pending.push(() => resolve(jsonResponse({ profile_id: `u-${n}`, site_id: "amazon", session_id: `login_${n}`, live_url: `https://live/${n}` }, { status: 201 })));
    }));
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    const older = handle.openLogin();
    const newer = handle.openLogin();
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]();
    await newer;
    pending[0]();
    await older;
    await handle.confirmSignedIn();
    expect(saves(calls).map((call) => call.pathname)).toEqual(["/api/v1/projects/tenant_1/profiles/u-2/confirm"]);
  });

  it("when the newer overlapping openLogin() fails, the older successful call still owns the session", async () => {
    const pending: Array<(ok: boolean) => void> = [];
    let opened = 0;
    const { client, calls } = loginHarness(SAVED, () => new Promise<Response>((resolve) => {
      const n = ++opened;
      pending.push((ok) => resolve(ok
        ? jsonResponse({ profile_id: `u-${n}`, site_id: "amazon", session_id: `login_${n}`, live_url: `https://live/${n}` }, { status: 201 })
        : jsonResponse({ detail: { code: "agent_core_profile_login_failed", detail: "boom" } }, { status: 502 })));
    }));
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    const older = handle.openLogin();
    const newer = handle.openLogin();
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1](false);
    await expect(newer).rejects.toMatchObject({ status: 502 });
    pending[0](true);
    await older;
    await handle.confirmSignedIn();
    expect(saves(calls).map((call) => call.pathname)).toEqual(["/api/v1/projects/tenant_1/profiles/u-1/confirm"]);
  });

  it("Track interactionHandle rejects declared DoAnything actions without using their authority", async () => {
    const { client, calls } = makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      return jsonResponse({ id: "mon_1", status: "active" });
    });
    const monitor = await client.track.attach("mon_1", { token: DELEGATION_TOKEN });
    const before = calls.length;
    expect(() => monitor.interactionHandle(normalizeInteraction(wireSiteLogin())!)).toThrow(/unsupported/);
    expect(calls).toHaveLength(before);
  });
});

// ---------------------------------------------------------------------------
// Review round 2 (codex-reviewer, 2026-10-07).
// ---------------------------------------------------------------------------

describe("take_control: the control URL comes back from the action", () => {
  it.each(["take_control", "refresh_control_url", "release_control"])("底层 intervene 的 %s 也使用独立接管权限", async (kind) => {
    const { client, calls } = makeClient((call) => call.pathname === "/api/v3/eak/token-exchange"
      ? jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } })
      : jsonResponse({ data: {} }));
    await client.doAnything.api.intervene({ token: DELEGATION_TOKEN, runId: "run_1", kind });
    expect((calls[0].body as { scopes: string[] }).scopes).toEqual(["webagent.browser_use:take_control"]);
  });

  const takeOver = {
    id: "ix_tc", type: "take_control", status: "pending", created_at: "2026-10-07T08:00:00Z", title: "Take over",
    live_url: "https://live/view", reason: "captcha_required",
    actions: ["connect_control", "refresh_control", "release_control"].map((kind) => ({
      kind, label: kind, method: "POST", endpoint: `/do_anything/runs/run_1/interactions/ix_tc/${kind}`,
    })),
  };

  it("接管的连接、刷新和交还只换取独立接管权限", async () => {
    const { client, calls } = makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/do_anything/runs")) return jsonResponse({ data: { run_id: "run_1", status: "running" } });
      return jsonResponse({ data: { standalone_control_url: "https://live/control", status: "active" } });
    });
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "test" });
    const handle = run.interactionHandle(normalizeInteraction(takeOver)!);
    await handle.connectControl();
    await handle.refreshControl();
    await handle.releaseControl();
    const exchanges = calls.filter((call) => call.pathname === "/api/v3/eak/token-exchange");
    expect(exchanges.map((call) => (call.body as { scopes: string[] }).scopes)).toEqual([
      ["webagent.do_anything:manage"],
      ["webagent.browser_use:take_control"],
      ["webagent.browser_use:take_control"],
      ["webagent.browser_use:take_control"],
    ]);
  });

  it("connectControl() and refreshControl() return the signed control URL and its expiry", async () => {
    let n = 0;
    const handle = new InteractionHandleClass(normalizeInteraction(takeOver)!, async (action) =>
      action.kind === "release_control"
        ? { released_at: "2026-10-07T08:05:00Z" }
        : { standalone_control_url: `https://live/control/${++n}`, control_token_expires_at: "2026-10-07T09:00:00Z", status: "active" });
    await expect(handle.connectControl()).resolves.toMatchObject({
      liveUrl: "https://live/control/1", expiresAt: "2026-10-07T09:00:00Z", status: "active",
    });
    await expect(handle.refreshControl()).resolves.toMatchObject({ liveUrl: "https://live/control/2" });
    await expect(handle.releaseControl()).resolves.toBeUndefined();
  });
});

describe("login sessions follow the backend's session identity", () => {
  function harness(sessions: string[]) {
    let opened = 0;
    return makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
      }
      if (call.pathname.endsWith("/profiles/login")) {
        const session = sessions[Math.min(opened++, sessions.length - 1)];
        return jsonResponse({ profile_id: "u-1", site_id: "amazon", session_id: session, live_url: `https://live/${session}` }, { status: 201 });
      }
      if (/\/profiles\/[^/]+\/confirm$/.test(call.pathname)) return jsonResponse({ profile_id: "u-1", state: "active", probe_result: "alive" });
      return jsonResponse({ data: {} });
    });
  }
  const saves = (calls: Captured[]) => calls.filter((call) => /\/profiles\/[^/]+\/confirm$/.test(call.pathname));

  it("reopening the same backend session shares one save between the old result and confirmSignedIn()", async () => {
    const { client, calls } = harness(["login_1"]);
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    const first = await handle.openLogin();
    await handle.openLogin();
    await Promise.all([first.confirm(), handle.confirmSignedIn()]);
    expect(saves(calls)).toHaveLength(1);
  });

  it("a result whose backend session was replaced can no longer save", async () => {
    const { client, calls } = harness(["login_1", "login_2"]);
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    const stale = await handle.openLogin();
    await handle.openLogin();
    await expect(stale.confirm()).rejects.toBeInstanceOf(QoniValidationError);
    expect(saves(calls)).toEqual([]);
    await handle.confirmSignedIn();
    expect(saves(calls)).toHaveLength(1);
  });
});

describe("long-lived handles keep their caches bounded", () => {
  it("rememberBounded() keeps the newest entries and refreshes re-inserted keys", async () => {
    const { rememberBounded } = await import("../src/interactions");
    const map = new Map<string, number>();
    rememberBounded(map, "a", 1, 2);
    rememberBounded(map, "b", 2, 2);
    rememberBounded(map, "a", 3, 2);
    rememberBounded(map, "c", 4, 2);
    expect([...map.entries()]).toEqual([["a", 3], ["c", 4]]);
  });
});

// ---------------------------------------------------------------------------
// Review round 3 (codex-reviewer, 2026-10-07).
// ---------------------------------------------------------------------------

describe("a replaced login session never moves the interaction on", () => {
  it("a save that finishes after a newer openLogin() does not send the recheck", async () => {
    let releaseSave!: () => void;
    const held = new Promise<void>((resolve) => { releaseSave = resolve; });
    let opened = 0;
    const { client, calls } = makeClient(async (call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
      }
      if (call.pathname.endsWith("/profiles/login")) {
        const n = ++opened;
        return jsonResponse({ profile_id: "u-1", site_id: "amazon", session_id: `login_${n}`, live_url: `https://live/${n}` }, { status: 201 });
      }
      if (/\/profiles\/[^/]+\/confirm$/.test(call.pathname)) {
        if (opened === 1) await held;
        return jsonResponse({ profile_id: "u-1", state: "active", probe_result: "alive" });
      }
      return jsonResponse({ data: {} });
    });
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const handle = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    await handle.openLogin();
    const first = handle.confirmSignedIn();
    await vi.waitFor(() => expect(calls.some((call) => call.pathname.endsWith("/confirm"))).toBe(true));
    await handle.openLogin(); // the user reopened the login while the first save was in flight
    releaseSave();
    await expect(first).rejects.toMatchObject({ code: "site_login.session_replaced", retryable: true });
    await expect(first).rejects.not.toBeInstanceOf(QoniValidationError);
    expect(calls.filter((call) => call.pathname.endsWith("/confirm_signed_in"))).toEqual([]);
    await handle.confirmSignedIn(); // saves the newer session, then rechecks
    expect(calls.filter((call) => /\/profiles\/[^/]+\/confirm$/.test(call.pathname))).toHaveLength(2);
    expect(calls.filter((call) => call.pathname.endsWith("/confirm_signed_in"))).toHaveLength(1);
  });
});

describe("bounded caches keep what is still in use", () => {
  it("rememberBounded() evicts only entries the predicate allows and otherwise lets the map grow", async () => {
    const { rememberBounded } = await import("../src/interactions");
    const map = new Map<string, { busy: boolean }>();
    const idle = (value: { busy: boolean }) => !value.busy;
    rememberBounded(map, "busy", { busy: true }, 2, idle);
    rememberBounded(map, "a", { busy: false }, 2, idle);
    rememberBounded(map, "b", { busy: false }, 2, idle);
    expect([...map.keys()]).toEqual(["busy", "b"]);
    rememberBounded(map, "busy-2", { busy: true }, 2, idle);
    expect([...map.keys()]).toEqual(["busy", "busy-2"]);
    rememberBounded(map, "busy-3", { busy: true }, 2, idle);
    expect([...map.keys()]).toEqual(["busy", "busy-2", "busy-3"]);
  });

  it("an open login survives hundreds of later logins on other interactions", async () => {
    const { client, calls } = makeClient((call) => {
      if (call.pathname === "/api/v3/eak/token-exchange") return jsonResponse({ data: { accessToken: PRODUCT_TOKEN, expiresIn: 3600 } });
      if (call.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
        return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } });
      }
      if (call.pathname.endsWith("/profiles/login")) {
        return jsonResponse({ profile_id: "u-1", site_id: "amazon", session_id: `login_${calls.length}`, live_url: "https://live" }, { status: 201 });
      }
      if (/\/profiles\/[^/]+\/confirm$/.test(call.pathname)) return jsonResponse({ profile_id: "u-1", state: "active", probe_result: "alive" });
      return jsonResponse({ data: {} });
    });
    const run = await client.doAnything.run({ token: DELEGATION_TOKEN, prompt: "buy" });
    const first = run.interactionHandle(normalizeInteraction(wireSiteLogin())!);
    await first.openLogin();
    for (let i = 0; i < 300; i++) {
      await run.interactionHandle(normalizeInteraction({ ...wireSiteLogin(), id: `ix_other_${i}` })!).openLogin();
    }
    await first.confirmSignedIn();
    expect(calls.filter((call) => /\/profiles\/[^/]+\/confirm$/.test(call.pathname))).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Review round 4 (codex-reviewer, 2026-10-07).
// ---------------------------------------------------------------------------

describe("login state of an ended interaction can be reclaimed", () => {
  it("markLoginEnded() lets an idle login slot go once its interaction settled, but never one still in flight", async () => {
    const { markLoginEnded, rememberBounded, loginSlotIdle } = await import("../src/interactions");
    const store = new Map<string, { calls: number; inflight: number; ended?: boolean; session?: { profileId: string; siteId: string; sessionId: string; call: number } }>();
    const opened = { calls: 1, inflight: 0, session: { profileId: "u-1", siteId: "amazon", sessionId: "s1", call: 1 } };
    const opening = { calls: 1, inflight: 1 };
    store.set("ix_open", opened);
    store.set("ix_opening", opening);
    expect(loginSlotIdle(opened)).toBe(false); // opened, never confirmed: still work in progress

    markLoginEnded(store, { id: "ix_open", status: "pending" } as never);
    expect(loginSlotIdle(opened)).toBe(false); // a pending update is not an ending
    markLoginEnded(store, { id: "ix_open", status: "resolved" } as never);
    markLoginEnded(store, { id: "ix_opening", status: "expired" } as never);
    expect(loginSlotIdle(opened)).toBe(true);
    expect(loginSlotIdle(opening)).toBe(false); // an openLogin() still in flight is never dropped

    rememberBounded(store, "ix_new", { calls: 0, inflight: 0 }, 2, loginSlotIdle);
    expect([...store.keys()]).toEqual(["ix_opening", "ix_new"]);
  });
});
