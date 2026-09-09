import { describe, expect, it } from "vitest";
import { Qoni, QoniValidationError } from "../src";
import { InteractionHandle, interactionScopes, normalizeInteraction } from "../src/interactions";
import type { Action, Interaction } from "../src/interactions";
import { normalizeRunEvent } from "../src/run-events";
import type { QoniEvent } from "../src/types";

// A wire `run.interaction` SSE event (double envelope, snake_case payload).
function interactionEvent(payload: Record<string, unknown>): QoniEvent<unknown> {
  return {
    id: "1",
    event: "run.interaction",
    data: {
      id: "1",
      type: "run.interaction",
      task_id: "run_1",
      session_id: "sess_1",
      occurred_at: "2026-06-12T08:00:01+00:00",
      data: payload,
    },
  } as unknown as QoniEvent<unknown>;
}

describe("normalizeInteraction", () => {
  it("normalizes a site_login object (snake → camel, nested sites + actions)", () => {
    const ix = normalizeInteraction({
      id: "ix_1",
      type: "site_login",
      status: "pending",
      created_at: "2026-06-12T08:00:01+00:00",
      expires_at: "2026-06-12T08:10:01+00:00",
      title: "Agent needs you to sign in",
      prompt: "Sign in to continue",
      evidence_artifact_id: "art_9",
      sites: [
        { site_id: "xhs", display_name: "Xiaohongshu", login_url: "https://xhs.test/login" },
      ],
      monitor_id: "mon_3",
      actions: [
        {
          kind: "open_login",
          label: "Open login",
          method: "POST",
          endpoint: "/do_anything/runs/run_1/interactions/ix_1/open_login",
        },
        {
          kind: "confirm_signed_in",
          label: "I signed in",
          method: "POST",
          endpoint: "/do_anything/runs/run_1/interactions/ix_1/confirm_signed_in",
        },
      ],
    });

    expect(ix).not.toBeNull();
    const i = ix as Interaction<"site_login">;
    expect(i.type).toBe("site_login");
    expect(i.status).toBe("pending");
    expect(i.id).toBe("ix_1");
    expect(i.expiresAt).toBe("2026-06-12T08:10:01+00:00");
    expect(i.prompt).toBe("Sign in to continue");
    expect(i.evidence).toEqual({ artifactId: "art_9" });
    expect(i.payload.sites).toEqual([
      { siteId: "xhs", displayName: "Xiaohongshu", loginUrl: "https://xhs.test/login" },
    ]);
    expect(i.payload.monitorId).toBe("mon_3");
    expect(i.actions.map((a) => a.kind)).toEqual(["open_login", "confirm_signed_in"]);
  });

  it("narrows the clarification / confirmation / take_control / wait payloads", () => {
    const clar = normalizeInteraction({
      id: "c",
      type: "clarification",
      status: "active",
      created_at: "t",
      title: "?",
      question: "Which size?",
      input_type: "choice",
      actions: [],
    }) as Interaction<"clarification">;
    expect(clar.payload).toEqual({ question: "Which size?", inputType: "choice" });

    const conf = normalizeInteraction({
      id: "cf",
      type: "confirmation",
      status: "pending",
      created_at: "t",
      title: "Confirm",
      summary: "Delete 3 files",
      actions: [],
    }) as Interaction<"confirmation">;
    expect(conf.payload).toEqual({ summary: "Delete 3 files" });

    const tc = normalizeInteraction({
      id: "tc",
      type: "take_control",
      status: "active",
      created_at: "t",
      title: "Take over",
      live_url: "https://live.test/x",
      surface: "browser",
      reason: "captcha",
      actions: [],
    }) as Interaction<"take_control">;
    expect(tc.payload).toEqual({
      liveUrl: "https://live.test/x",
      surface: "browser",
      reason: "captcha",
    });

    const wait = normalizeInteraction({
      id: "w",
      type: "wait",
      status: "active",
      created_at: "t",
      title: "Waiting",
      wait_kind: "rate_limit",
      until: "2026-06-12T09:00:00+00:00",
      retryable: true,
      actions: [],
    }) as Interaction<"wait">;
    expect(wait.payload).toEqual({
      waitKind: "rate_limit",
      until: "2026-06-12T09:00:00+00:00",
      retryable: true,
    });
  });

  it("returns null for a payload without a recognized type", () => {
    expect(normalizeInteraction({ id: "x", status: "pending" })).toBeNull();
    expect(normalizeInteraction("nonsense")).toBeNull();
  });
});

describe("browser handoff results", () => {
  it.each([
    ["open_login", "webagent.workspace:write"],
    ["connect_control", "webagent.browser:control"],
    ["refresh_control", "webagent.browser:control"],
    ["release_control", undefined],
    ["answer", undefined],
  ])("requests only the additional grant required by %s", (kind, extra) => {
    const action = { kind, endpoint: "/interaction", method: "POST", label: "" } as Action;
    expect(interactionScopes(action, "webagent.do_anything:manage")).toEqual(
      extra ? ["webagent.do_anything:manage", extra] : ["webagent.do_anything:manage"],
    );
  });

  const login = {
    profile_id: "profile-1", site_id: "example", session_id: "login-1",
    live_url: "https://www.browserbase.com/live?token=synthetic",
  };
  const control = {
    standalone_control_url: "https://www.browserbase.com/live?token=synthetic",
    control_token_expires_at: "2026-09-10T00:00:00Z", status: "active",
  };

  function make(sites = ["example"], result: unknown = login) {
    const posted: unknown[] = [];
    const interaction = normalizeInteraction({
      id: "login-request", type: "site_login",
      sites: sites.map((site_id) => ({ site_id })),
      actions: [{ kind: "open_login", endpoint: "/profiles/login" }],
    })!;
    return {
      posted,
      handle: new InteractionHandle(interaction, async (action, body) => {
        posted.push({ endpoint: action.endpoint, body });
        return result;
      }),
    };
  }

  it("sends the offered site and existing Profile and returns the Viewer", async () => {
    const { handle, posted } = make();
    const result = await handle.openLogin({ profileId: "profile-1" });
    expect(result).toEqual({ profileId: "profile-1", siteId: "example", sessionId: "login-1", liveUrl: login.live_url });
    expect(posted).toEqual([{ endpoint: "/profiles/login", body: { site_id: "example", profile_id: "profile-1" } }]);
  });

  it("requires selection for multiple sites and rejects unoffered sites without posting", async () => {
    const { handle, posted } = make(["example", "second"]);
    await expect(handle.openLogin()).rejects.toThrow("siteId");
    await expect(handle.openLogin({ siteId: "third" })).rejects.toThrow("siteId");
    expect(posted).toEqual([]);
    await expect(handle.openLogin({ siteId: "example" })).resolves.toMatchObject({ siteId: "example" });
  });

  it.each([undefined, {}, { ...login, live_url: "" }, { ...login, profile_id: "other" }, { ...login, site_id: "other" }])("rejects incomplete or mismatched responses without retrying", async (response) => {
    const { handle, posted } = make(["example"], response ?? {});
    await expect(handle.openLogin({ profileId: "profile-1" })).rejects.toBeInstanceOf(QoniValidationError);
    expect(posted).toHaveLength(1);
  });

  it.each(["connect_control", "refresh_control"])("preserves %s responses", async (kind) => {
    const interaction = normalizeInteraction({ id: "control-1", type: "take_control", actions: [{ kind, endpoint: `/control/${kind}` }] })!;
    const handle = new InteractionHandle(interaction, async () => control);
    const result = kind === "connect_control" ? await handle.connectControl() : await handle.refreshControl();
    expect(result).toEqual({ standaloneControlUrl: control.standalone_control_url, controlTokenExpiresAt: control.control_token_expires_at, status: "active" });
  });

  it("does not discard the response inside the Do Anything transport", async () => {
    const token = `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({ webagent_tenant_id: "tenant-1" })).toString('base64url')}.`;
    const bodies: unknown[] = [];
    const client = new Qoni({ accessKey: "ak_test", secretKey: "sk_test", webAgentBaseUrl: "https://api.example", fetch: async (_url, init) => {
      if (init?.method === "POST") bodies.push(JSON.parse(String(init.body)));
      return new Response(JSON.stringify(init?.method === "POST" ? login : { id: "run-1", session_id: "session-1", status: "waiting" }), { headers: { "content-type": "application/json" } });
    } });
    const run = await client.doAnything.attach("run-1", { token });
    const interaction = make().handle.interaction;
    await expect(run.interactionHandle(interaction).openLogin({ profileId: "profile-1" })).resolves.toMatchObject({ liveUrl: login.live_url });
    expect(bodies).toEqual([{ site_id: "example", profile_id: "profile-1" }]);
  });

  it.each(["take_control", "refresh_control_url", "release_control"])("exchanges the correct grant for %s", async (kind) => {
    const jwt = (claims: unknown) => `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.`;
    const token = jwt({ token_type: "eak_delegation_token" });
    const product = jwt({ webagent_tenant_id: "tenant-1" });
    const scopes: unknown[] = [];
    const client = new Qoni({ accessKey: "ak_test", secretKey: "sk_test", webAgentBaseUrl: "https://api.example", fetch: async (url, init) => {
      if (String(url).endsWith("/token-exchange")) {
        scopes.push(JSON.parse(String(init?.body)).scopes);
        return new Response(JSON.stringify({ data: { accessToken: product, expiresIn: 300 } }));
      }
      return new Response(JSON.stringify(control));
    } });
    const result = await client.doAnything.api.intervene({ token, runId: "run-1", kind });
    expect(result.data).toEqual(control);
    expect(scopes).toEqual([kind === "release_control"
      ? ["webagent.do_anything:manage"]
      : ["webagent.browser:control", "webagent.do_anything:manage"]]);
  });
});

describe("normalizeRunEvent → interaction", () => {
  it("maps run.interaction to an `interaction` event carrying the typed object", () => {
    const event = normalizeRunEvent(
      interactionEvent({
        id: "ix_2",
        type: "confirmation",
        status: "pending",
        created_at: "2026-06-12T08:00:01+00:00",
        title: "Confirm",
        summary: "proceed?",
        actions: [
          { kind: "confirm", label: "Yes", method: "POST", endpoint: "/x/confirm" },
        ],
      }),
      { topRunId: "run_1" },
    );

    expect(event?.type).toBe("interaction");
    expect(event?.isTerminal).toBe(false);
    if (event?.type !== "interaction") throw new Error("expected interaction");
    expect(event.data.id).toBe("ix_2");
    expect(event.data.type).toBe("confirmation");
    expect(event.runId).toBe("run_1");
  });

  it("degrades a run.interaction without a type to progress (fail-safe)", () => {
    const event = normalizeRunEvent(interactionEvent({ id: "broken", status: "pending" }), {
      topRunId: "run_1",
    });
    // No usable type → falls through to WIRE_TO_SEMANTIC default; run.interaction
    // isn't listed there, so it degrades to progress (or null if empty).
    expect(event === null || event.type === "progress").toBe(true);
  });
});

describe("InteractionHandle", () => {
  function make(actions: Action[]) {
    const posted: Array<{ action: Action; body: unknown }> = [];
    const interaction: Interaction<"clarification"> = {
      id: "ix",
      type: "clarification",
      status: "pending",
      createdAt: "t",
      title: "Pick",
      actions,
      payload: { question: "?" },
    };
    const handle = new InteractionHandle(interaction, async (action, body) => {
      posted.push({ action, body });
    });
    return { handle, posted };
  }

  it("answer() posts { response } to the declared answer endpoint", async () => {
    const { handle, posted } = make([
      { kind: "answer", label: "Answer", method: "POST", endpoint: "/x/answer" },
    ]);
    expect(handle.can("answer")).toBe(true);
    await handle.answer("blue");
    expect(posted).toEqual([
      {
        action: { kind: "answer", label: "Answer", method: "POST", endpoint: "/x/answer" },
        body: { response: "blue" },
      },
    ]);
  });

  it("throws when calling a method the interaction did not declare (no dead affordance)", async () => {
    const { handle, posted } = make([
      { kind: "skip", label: "Skip", method: "POST", endpoint: "/x/skip" },
    ]);
    expect(handle.can("confirm")).toBe(false);
    await expect(handle.confirm()).rejects.toBeInstanceOf(QoniValidationError);
    expect(posted).toEqual([]); // nothing posted
  });
});
