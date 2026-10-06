import { describe, expect, it } from "vitest";
import { QoniValidationError } from "../src";
import { InteractionHandle, normalizeInteraction } from "../src/interactions";
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

  it("narrows the ask_user (wire clarification) / confirmation / take_control / wait payloads", () => {
    const ask = normalizeInteraction({
      id: "c",
      type: "clarification",
      status: "active",
      created_at: "t",
      title: "?",
      question: "Which size?",
      input_type: "choice",
      options: ["13-inch", "15-inch"],
      actions: [],
    }) as Interaction<"ask_user">;
    expect(ask.type).toBe("ask_user");
    expect(ask.payload).toEqual({
      question: "Which size?",
      answerType: "single_choice",
      options: [
        { value: "13-inch", label: "13-inch" },
        { value: "15-inch", label: "15-inch" },
      ],
    });

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
    const interaction: Interaction<"ask_user"> = {
      id: "ix",
      type: "ask_user",
      status: "pending",
      createdAt: "t",
      title: "Pick",
      actions,
      payload: { question: "?", answerType: "text" },
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
