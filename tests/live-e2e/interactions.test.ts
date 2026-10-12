import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type {
  ActionKind,
  QoniEvent,
  Interaction,
  InteractionHandle,
  JsonObject,
  RunEvent,
  RunHandle,
} from "../../src";
import { ActionKinds, QoniValidationError } from "../../src";
import { normalizeRunEvent } from "../../src/run-events";
import { loadQueryMatrix, selectQueryMatrixCase } from "../helpers/query-matrix";
import {
  delegateLiveToken,
  doAnythingScopes,
  liveClient,
  liveE2EEnabled,
} from "./helpers";

/**
 * Live coverage of the INTERACTION surface (axis B of the interaction model):
 * the typed `InteractionHandle` and the `interactionHandle()` factory on a run.
 *
 * WHAT IS REAL HERE AND WHAT IS NOT — read before extending this file.
 *
 * `InteractionHandle` cannot be exercised against a fabricated object: its
 * `invoke()` looks the requested kind up in `interaction.actions[]`, which only
 * the BACKEND populates. So every `Interaction` used below is one the live
 * backend actually emitted on a run's `run.interaction` wire event and the SDK
 * normalized — nothing here is hand-built.
 *
 * On this deployment the only `run.interaction` the backend emits for
 * DoAnything is the RESOLVED clarification record it writes when an
 * `intervene` answer is posted (`status: "resolved"`, `actions: []`). Probing
 * for a PENDING interaction that declares actions found none — see the
 * "induction" test at the bottom, which records exactly what was tried and what
 * the backend did instead. Consequently:
 *
 *   - `interactionHandle()`, `can()`, and the property accessors are covered on
 *     their real, positive path.
 *   - the 11 action methods are covered on their GUARD path: called against a
 *     real interaction that declares no actions, each must reject with the
 *     "dead recovery affordance" error. Their HTTP POST path stays uncovered
 *     and is listed as blocked in the delivery report. Do NOT "fix" that by
 *     synthesizing an `actions[]` array — that would test nothing.
 */

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;
const matrix = liveE2EEnabled ? loadQueryMatrix() : undefined;

const ALL_ACTION_KINDS = Object.values(ActionKinds) as ActionKind[];

// The carrier run's task text comes from the ignored local Case document — the
// subject of this file is HITL, not the task, so any configured browser Case
// will do.
const carrierCase = matrix
  ? selectQueryMatrixCase(matrix, "doAnything.run", process.env.QONI_INTERACTION_CASE_ID)
  : undefined;

describeLiveE2E("live e2e: interactions (InteractionHandle + run.interactionHandle)", () => {
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let run: RunHandle | undefined;
  const requestId = `sdk-live-interaction-${Date.now()}`;

  let observedInteraction: Interaction | undefined;
  let handleFromWait: InteractionHandle | undefined;
  let semanticEventTypes: string[] = [];

  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    token = (await delegateLiveToken(client, doAnythingScopes)).token;
  }, 120_000);

  afterAll(async () => {
    await run?.cancel("sdk live e2e cleanup").catch(() => undefined);
  });

  it(
    "a real backend interaction reaches run.wait({ onInteraction }) as an InteractionHandle",
    async () => {
      if (!carrierCase) throw new Error("Focused Do Anything Case was not loaded");
      run = await client.doAnything.run({
        ...(carrierCase.input as JsonObject & { prompt: string }),
        token,
      });
      expect(run.id).toBeTruthy();

      const events: RunEvent[] = [];
      const waiting = run.wait({
        timeoutMs: 300_000,
        onEvent: (event) => {
          events.push(event);
        },
        onInteraction: (handle, event) => {
          // `wait()` builds this handle through RunHandle.interactionHandle().
          handleFromWait ??= handle;
          // `onInteraction` types `event` as the whole RunEvent union, so
          // re-narrow before reading the typed payload.
          if (event.type === "interaction") observedInteraction ??= event.data;
        },
      });

      // Post an answer on the wire while the semantic stream is open. The
      // backend records it and publishes the resulting interaction object on
      // `run.interaction` — that publication is what we are observing.
      await new Promise((resolve) => setTimeout(resolve, 4_000));
      const posted = await client.doAnything.api.intervene<JsonObject>({
        token,
        runId: run.id,
        requestId,
        response: "sdk live e2e interaction probe",
      });
      expect(posted.data.run_id ?? posted.data.id).toBe(run.id);

      const result = await waiting;
      expect(["succeeded", "failed", "canceled"]).toContain(result.status);

      semanticEventTypes = events.map((event) => event.type);
      expect(
        semanticEventTypes,
        "the backend must publish the interaction on the semantic stream",
      ).toContain("interaction");

      const interactionEvent = events.find((event) => event.type === "interaction");
      expect(interactionEvent?.runId).toBe(run.id);
      // The wire envelope the normalizer consumed is preserved.
      expect(String(interactionEvent?.raw.event ?? "")).toBe("run.interaction");

      expect(observedInteraction, "onInteraction must receive the Interaction").toBeTruthy();
      expect(handleFromWait, "onInteraction must receive an InteractionHandle").toBeTruthy();

      // Domain content: this is OUR interaction, typed and normalized.
      expect(observedInteraction!.id).toBe(requestId);
      expect(observedInteraction!.type).toBe("ask_user");
      expect(observedInteraction!.status).toBe("resolved");
      expect(observedInteraction!.createdAt).toBeTruthy();
      expect(observedInteraction!.resolvedAt).toBeTruthy();
      // The backend declares no actions on an already-resolved interaction.
      expect(observedInteraction!.actions).toEqual([]);
    },
    360_000,
  );

  it("run.interactionHandle() wraps the backend's Interaction with matching identity", async () => {
    expect(observedInteraction, "the previous test must have captured an interaction").toBeTruthy();
    const handle = run!.interactionHandle(observedInteraction!);
    // The typed accessors read straight off the backend's object.
    expect(handle.id).toBe(observedInteraction!.id);
    expect(handle.type).toBe(observedInteraction!.type);
    expect(handle.status).toBe(observedInteraction!.status);
    expect(handle.actions).toEqual(observedInteraction!.actions);
    // Same construction path `wait()` used internally.
    expect(handleFromWait!.id).toBe(handle.id);
  });

  it("can() reports exactly the actions the backend declared", async () => {
    const handle = run!.interactionHandle(observedInteraction!);
    const declared = new Set(observedInteraction!.actions.map((action) => action.kind));
    for (const kind of ALL_ACTION_KINDS) {
      expect(handle.can(kind), `can(${kind})`).toBe(declared.has(kind));
    }
    // On this deployment the resolved interaction declares none — assert that
    // explicitly so the test starts failing (and this file gets revisited) the
    // day the backend begins declaring actions.
    expect(declared.size).toBe(0);
  });

  it("every action method refuses an action the backend did not declare", async () => {
    const handle = run!.interactionHandle(observedInteraction!);
    // One entry per typed method on InteractionHandle. Each must reject with
    // the structural guard, naming the kind it could not find — proving the
    // method is wired to its ActionKind and that no request is sent for an
    // affordance the backend never offered.
    const calls: Array<[ActionKind, () => Promise<unknown>]> = [
      [ActionKinds.answer, () => handle.answer("sdk live e2e")],
      [ActionKinds.skip, () => handle.skip()],
      [ActionKinds.confirm, () => handle.confirm()],
      [ActionKinds.reject, () => handle.reject()],
      [ActionKinds.openLogin, () => handle.openLogin()],
      [ActionKinds.confirmSignedIn, () => handle.confirmSignedIn()],
      [ActionKinds.connectControl, () => handle.connectControl()],
      [ActionKinds.refreshControl, () => handle.refreshControl()],
      [ActionKinds.releaseControl, () => handle.releaseControl()],
      [ActionKinds.retry, () => handle.retry()],
      [ActionKinds.switchProfile, () => handle.switchProfile()],
    ];
    expect(calls.length, "every ActionKind must have a method under test").toBe(
      ALL_ACTION_KINDS.length,
    );

    for (const [kind, call] of calls) {
      let caught: unknown;
      try {
        await call();
      } catch (error) {
        caught = error;
      }
      // Promise-based rejection, not a synchronous throw (contract).
      expect(caught, `${kind} must reject`).toBeInstanceOf(QoniValidationError);
      const error = caught as QoniValidationError;
      expect(error.message).toContain(`"${kind}"`);
      expect(error.message).toContain(observedInteraction!.id);
      expect(error.message).toContain(observedInteraction!.type);
      expect(error.message).toContain("the backend declared: none");
    }
  });

  it(
    "induction attempt: no PENDING interaction with declared actions is reachable here",
    async () => {
      // Honest record of what was tried, so the blocked-list claim is testable
      // rather than anecdotal. A page that cannot be read without an account is
      // the canonical `site_login` trigger, and the prompt explicitly asks the
      // agent to stop and ask. If this deployment ever starts raising a real
      // pending interaction, this test fails and the action methods above can
      // be upgraded from guard-path to POST-path coverage.
      const gated = await client.doAnything.run({
        token,
        prompt:
          "Open https://github.com/settings/profile, which cannot be read without a signed-in " +
          "account. If you are not signed in, stop and ask me to sign in before continuing, " +
          "then read the display name field.",
        limits: { maxDurationMinutes: 5 },
      });
      try {
        const seen: Interaction[] = [];
        const result = await gated.wait({
          timeoutMs: 300_000,
          onInteraction: (_handle, event) => {
            if (event.type === "interaction") seen.push(event.data);
          },
        });
        const pendingWithActions = seen.filter(
          (interaction) => interaction.status !== "resolved" && interaction.actions.length > 0,
        );
        console.log(
          `induction: run ${gated.id} settled ${result.status}; ` +
            `${seen.length} interaction(s), ${pendingWithActions.length} actionable; ` +
            `output=${JSON.stringify(result.output).slice(0, 400)}`,
        );
        // The observed behaviour: the run walks into the sign-in wall, reports
        // it in the terminal output (in whatever language the model picks) and
        // finishes — WITHOUT ever raising a typed interaction. Assert that
        // structurally rather than on the prose, so the test only starts
        // failing when the backend's HITL behaviour actually changes.
        expect(pendingWithActions.length).toBe(0);
        expect(seen.length).toBe(0);
        expect(["succeeded", "failed"]).toContain(result.status);
        expect(JSON.stringify(result.output ?? "").length).toBeGreaterThan(20);
      } finally {
        await gated.cancel("sdk live e2e cleanup").catch(() => undefined);
      }
    },
    360_000,
  );
});

// Track has no interaction/events endpoint. Historical alignment live tests
// are retired; local unsupported guards live in gray-track-contract.test.ts.
