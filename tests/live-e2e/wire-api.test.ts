import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { EAKEvent, JsonObject } from "../../src";
import { EAKError } from "../../src";
import { loadQueryMatrix, selectQueryMatrixCase } from "../helpers/query-matrix";
import { assertQueryMatrixOutput } from "../helpers/query-matrix-runner";
import {
  deepResearchScopes,
  delegateLiveToken,
  doAnythingScopes,
  liveClient,
  liveE2EEnabled,
  trackScopes,
  webSearchScopes,
} from "./helpers";

/**
 * Live coverage of the WIRE ESCAPE HATCH (`<product>.api.*`).
 *
 * The per-product semantic suites (web-search / do-anything / track /
 * deep-research) deliberately keep exactly ONE `api.*` smoke test each — their
 * subject is the curated surface. This file is the counterpart: it drives every
 * `api.*` method against the real backend and asserts the WIRE contract those
 * methods exist to expose — snake_case envelopes, the run/monitor identity the
 * route echoes back, and the documented error codes when an operation is not
 * legal in the resource's current state.
 *
 * Nothing here goes through RunHandle / MonitorHandle: that is the point.
 */

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;
const matrix = liveE2EEnabled ? loadQueryMatrix() : undefined;

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

/** The wire event envelope: `{ id, event, data: { type, run_id, data } }`. */
function envelope(event: EAKEvent<unknown>): JsonObject {
  return isRecord(event.data) ? event.data : {};
}

function envelopeType(event: EAKEvent<unknown>): string {
  return String(envelope(event).type ?? event.event ?? "");
}

function envelopePayload(event: EAKEvent<unknown>): JsonObject {
  const inner = envelope(event).data;
  return isRecord(inner) ? inner : {};
}

/**
 * Drain a WIRE event stream (`api.events`) until `until` matches or the budget
 * runs out. Returns every envelope seen so the caller can assert on the real
 * wire types, not just on "something arrived".
 */
async function drainWireEvents(
  factory: (signal: AbortSignal) => AsyncIterable<EAKEvent<unknown>>,
  options: { timeoutMs: number; until: (event: EAKEvent<unknown>) => boolean; label: string },
): Promise<{ events: EAKEvent<unknown>[]; matched: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  const events: EAKEvent<unknown>[] = [];
  let matched = false;
  try {
    for await (const event of factory(controller.signal)) {
      if (envelopeType(event) === "stream.heartbeat") continue;
      events.push(event);
      if (options.until(event)) {
        matched = true;
        break;
      }
    }
  } catch (error) {
    if (!controller.signal.aborted) throw error;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
  expect(events.length, `${options.label} should deliver wire events`).toBeGreaterThan(0);
  return { events, matched };
}

/** Assert an operation fails with the backend's documented code, not a generic 5xx. */
async function expectWireError(
  operation: Promise<unknown>,
  expected: { status: number; code: string },
  label: string,
): Promise<EAKError> {
  let caught: unknown;
  try {
    await operation;
  } catch (error) {
    caught = error;
  }
  expect(caught, `${label} should be rejected by the backend`).toBeInstanceOf(EAKError);
  const error = caught as EAKError;
  expect(error.status, `${label} status`).toBe(expected.status);
  expect(error.code, `${label} code`).toBe(expected.code);
  return error;
}

// ---------------------------------------------------------------------------
// webSearch.api — run / get / events / cancel
// ---------------------------------------------------------------------------

describeLiveE2E("live e2e: wire escape hatch — webSearch.api", () => {
  const focusedCase = matrix ? selectQueryMatrixCase(matrix, "webSearch.run") : undefined;
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let runId = "";

  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    token = (await delegateLiveToken(client, webSearchScopes)).token;
  });

  afterAll(async () => {
    if (runId) await client.webSearch.api.cancel({ token, runId }).catch(() => undefined);
  });

  it("api.run() posts the wire create body and returns the snake_case run envelope", async () => {
    if (!focusedCase) throw new Error("Focused Web Search Case was not loaded");
    const input = focusedCase.input as JsonObject & { prompt: string | string[] };
    const queries = Array.isArray(input.prompt) ? input.prompt : [input.prompt];
    const created = await client.webSearch.api.run<JsonObject>({
      token,
      queries,
      engines: input.engines,
      // camelCase in, snake_case on the wire — normalizeWebSearchRunInput's job.
      maxResultsPerQuery: input.maxResultsPerQuery,
      siteWhitelist: input.siteWhitelist,
    });
    runId = String(created.data.run_id ?? created.data.id ?? "");
    expect(runId, "wire create must return run_id").toBeTruthy();
    // The wire layer is NOT normalized: the raw snake_case fields are visible.
    expect(created.data.run_id).toBe(runId);
    expect(created.data.session_id).toBeTruthy();
    expect(["pending", "running"]).toContain(String(created.data.status));
    // The backend echoes the queries it accepted — proof the body reached it.
    expect(created.data.queries).toEqual(queries);
  });

  it("api.get() addresses the run by id and returns the same wire envelope", async () => {
    const wire = await client.webSearch.api.get<JsonObject>({ token, runId });
    expect(wire.data.run_id).toBe(runId);
    expect(wire.data.id).toBe(runId);
    expect(typeof wire.data.status).toBe("string");
    // Wire envelopes keep the fields the curated RunStatus drops.
    expect(Object.keys(wire.data)).toEqual(expect.arrayContaining(["terminal_reason", "created_at"]));
  });

  it("api.events() streams raw SSE envelopes through to search.results_ready", async () => {
    if (!focusedCase) throw new Error("Focused Web Search Case was not loaded");
    const { events, matched } = await drainWireEvents(
      (signal) => client.webSearch.api.events<unknown>({ token, runId, signal }),
      {
        timeoutMs: 90_000,
        label: "webSearch api.events",
        until: (event) => envelopeType(event) === "run.completed",
      },
    );
    expect(matched, "the wire stream must carry the run to run.completed").toBe(true);
    const types = events.map(envelopeType);
    // Product-specific wire event names the curated stream renames away.
    expect(types).toContain("search.results_ready");
    expect(types).toContain("run.status_changed");
    // Every envelope is addressed to the run we asked for.
    for (const event of events) {
      expect(envelope(event).run_id, "envelope.run_id").toBe(runId);
    }
    const resultsReady = events.find((event) => envelopeType(event) === "search.results_ready");
    expect(Number(envelopePayload(resultsReady!).total_unique_results)).toBeGreaterThan(0);

    // Domain content on the terminal envelope: the searched queries and real
    // on-whitelist hits, straight off the wire.
    const completed = events[events.length - 1];
    const payload = envelopePayload(completed);
    expect(payload.terminal_reason).toBe("done");
    const output = isRecord(payload.output) ? payload.output : {};
    const items = (Array.isArray(output.results) ? output.results : []).filter(isRecord);
    expect(items.length).toBeGreaterThan(0);
    const whitelist = (focusedCase.input as JsonObject & { siteWhitelist?: string[] }).siteWhitelist;
    for (const item of items) {
      expect(typeof item.url).toBe("string");
      expect(String(item.title).length).toBeGreaterThan(0);
      if (whitelist?.length) {
        const host = new URL(String(item.url)).hostname.toLowerCase();
        expect(
          whitelist.some((domain) => host === domain || host.endsWith(`.${domain}`)),
          "wire results must honour the configured whitelist",
        ).toBe(true);
      }
    }
  });

  it("api.cancel() on a settled run returns its terminal wire state", async () => {
    const canceled = await client.webSearch.api.cancel<JsonObject>({
      token,
      runId,
      reason: "sdk live e2e wire cancel",
    });
    expect(canceled.data.run_id).toBe(runId);
    expect(["succeeded", "failed", "canceled"]).toContain(String(canceled.data.status));
  });
});

// ---------------------------------------------------------------------------
// track.api — createMonitor / getMonitor / runNow / events / intervene /
//             listRuns / getRun / updateMonitor / deleteMonitor
// ---------------------------------------------------------------------------

describeLiveE2E("live e2e: wire escape hatch — track.api", () => {
  const focusedCase = matrix ? selectQueryMatrixCase(matrix, "track.create") : undefined;
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let monitorId = "";
  let deleted = false;
  let intent = "";

  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    token = (await delegateLiveToken(client, trackScopes)).token;
  });

  afterAll(async () => {
    if (monitorId && !deleted) {
      await client.track.api.deleteMonitor({ token, monitorId }).catch(() => undefined);
    }
  });

  it("api.createMonitor() returns the snake_case monitor definition", async () => {
    if (!focusedCase) throw new Error("Focused Track Case was not loaded");
    const { prompt, ...rest } = focusedCase.input as JsonObject & { prompt: string };
    intent = prompt;
    const created = await client.track.api.createMonitor<JsonObject>({
      token,
      // The wire body is snake_case and calls the natural-language field `intent`.
      intent: prompt,
      target_urls: rest.targetUrls,
      notify_channel: rest.notifyChannel,
      schedule: rest.schedule,
      extraction_schema: rest.extractionSchema,
    });
    monitorId = String(created.data.id ?? created.data.monitor_id ?? "");
    expect(monitorId).toBeTruthy();
    // Domain content: the backend stored the configured intent and targets.
    expect(created.data.intent_text).toBe(prompt);
    expect(created.data.target_urls).toEqual(rest.targetUrls);
    expect(created.data.extraction_schema).toEqual(rest.extractionSchema);
    // Wire shape: snake_case keys the curated MonitorHandle.get() camelizes away.
    expect(Object.keys(created.data)).toEqual(
      expect.arrayContaining(["project_id", "end_user_id", "status_reason", "last_tick_n"]),
    );
  });

  it("api.getMonitor() re-reads the monitor by id", async () => {
    const wire = await client.track.api.getMonitor<JsonObject>({ token, monitorId });
    expect(wire.data.id).toBe(monitorId);
    expect(wire.data.intent_text).toBe(intent);
  });

  it("api.updateMonitor() applies pause/resume through the PATCH route", async () => {
    const paused = await client.track.api.updateMonitor<JsonObject>({
      token,
      monitorId,
      action: "pause",
    });
    expect(paused.data.id).toBe(monitorId);
    expect(paused.data.status).toBe("paused");
    expect(paused.data.status_reason).toBe("user_paused");

    const resumed = await client.track.api.updateMonitor<JsonObject>({
      token,
      monitorId,
      action: "resume",
    });
    expect(resumed.data.status).toBe("active");
  });

  it("api.runNow() fires an immediate tick and returns the tick record", async () => {
    const tick = await client.track.api.runNow<JsonObject>({ token, monitorId });
    expect(tick.data.monitor_id).toBe(monitorId);
    expect(tick.data.run_id).toBeTruthy();
    expect(typeof tick.data.tick_n).toBe("number");
    // The first tick establishes the baseline snapshot, by contract.
    expect(tick.data.is_first_tick).toBe(true);
    expect(tick.data.outcome).toBe("baseline");
  });

  it("api.listRuns() / api.getRun() expose the tick runs at wire level", async () => {
    const listed = await client.track.api.listRuns<JsonObject>({ token, monitorId, limit: 5 });
    const items = Array.isArray(listed.data.items) ? listed.data.items : [];
    expect(items.length, "the tick fired by runNow must be listed").toBeGreaterThan(0);
    // Wire pagination envelope — the curated `runs()` returns only the array.
    expect(typeof listed.data.total).toBe("number");
    expect(typeof listed.data.has_more).toBe("boolean");

    const first = items[0] as JsonObject;
    expect(first.monitor_id).toBe(monitorId);
    const detail = await client.track.api.getRun<JsonObject>({
      token,
      monitorId,
      runId: String(first.id),
    });
    expect(detail.data.id).toBe(first.id);
    expect(detail.data.monitor_id).toBe(monitorId);
    expect(detail.data.state).toBe("completed");
    // snake_case tick fields the curated normalizer camelizes.
    expect(Object.keys(detail.data)).toEqual(
      expect.arrayContaining(["tick_n", "started_at", "finished_at", "is_first_tick"]),
    );
  });

  it("api.events() streams the monitor's raw lifecycle envelopes", async () => {
    // A monitor stream has no terminal event, so stop on the first tick
    // lifecycle envelope the scheduler emits after runNow re-registers it.
    const eventsPromise = drainWireEvents(
      (signal) => client.track.api.events<unknown>({ token, monitorId, signal }),
      {
        timeoutMs: 60_000,
        label: "track api.events",
        until: (event) => envelopeType(event) === "monitor.lifecycle_changed",
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    await client.track.api.updateMonitor({ token, monitorId, action: "pause" });
    await client.track.api.updateMonitor({ token, monitorId, action: "resume" });
    const { events, matched } = await eventsPromise;
    expect(matched, "pause/resume must surface on the wire monitor stream").toBe(true);
    for (const event of events) {
      expect(String(envelope(event).monitor_id ?? monitorId)).toBe(monitorId);
    }
  });

  it("api.intervene() is refused with monitor_not_in_alignment on an active monitor", async () => {
    // Track's intervene route is the ALIGNMENT channel: it only accepts an
    // answer while the monitor sits in `pending_clarification`. A fully
    // specified, active monitor is therefore expected to refuse it — asserting
    // that specific 409 (rather than the 422 an unrecognized body would give)
    // proves the SDK's normalization (`requestId` -> `request_id`) reached the
    // alignment handler. The accepting path is covered by the next test.
    const error = await expectWireError(
      client.track.api.intervene({
        token,
        monitorId,
        requestId: `${monitorId}-alignment`,
        response: "sdk live e2e wire intervene",
      }),
      { status: 409, code: "monitor_not_in_alignment" },
      "track.api.intervene on an active monitor",
    );
    expect(error.message).toContain("pending_clarification");
  });

  it(
    "api.intervene() answers a real alignment question and drives the monitor to active",
    async () => {
      if (!focusedCase) throw new Error("Focused Track Case was not loaded");
      const targetUrl = String(
        (focusedCase.input as JsonObject & { targetUrls?: string[] }).targetUrls?.[0] ?? "",
      );
      expect(targetUrl, "the configured Track Case must carry a target url").toBeTruthy();

      // An under-specified intent parks the monitor in `pending_clarification`
      // and the backend asks for the missing piece on the monitor stream. The
      // question is generic ("what should I watch?") — the answer comes from
      // the ignored local Case document, not from this source file.
      const vague = await client.track.api.createMonitor<JsonObject>({
        token,
        intent: "Tell me when it changes.",
      });
      const vagueId = String(vague.data.id);
      expect(vague.data.status).toBe("pending_clarification");
      expect(vague.data.target_urls).toEqual([]);

      try {
        // Which alignment question the backend asks (and how many rounds it
        // needs) is model-driven, so answer whatever it asks until the monitor
        // leaves the park — the invariant under test is that a real answer,
        // addressed to a real request id, is what unblocks it.
        const answeredIds = new Set<string>();
        const answer =
          `Monitor the page at ${targetUrl}. Extract the visible H1 heading text from that ` +
          "page, check once per hour, and notify me when that heading text changes.";
        let aligned: JsonObject | undefined;
        let asks = 0;

        for (let round = 0; round < 4 && !aligned; round++) {
          // The monitor stream replays its history, so take the newest ask that
          // has not been answered yet.
          const { events } = await drainWireEvents(
            (signal) => client.track.api.events<unknown>({ token, monitorId: vagueId, signal }),
            {
              timeoutMs: 30_000,
              label: "track alignment stream",
              until: (event) =>
                envelopeType(event) === "monitor.alignment_progress" &&
                !answeredIds.has(String(envelopePayload(event).request_id)),
            },
          );
          const ask = [...events]
            .reverse()
            .find(
              (event) =>
                envelopeType(event) === "monitor.alignment_progress" &&
                !answeredIds.has(String(envelopePayload(event).request_id)),
            );
          if (!ask) break;
          asks++;
          const question = envelopePayload(ask);
          // The ask is a real, attributable question — not an empty envelope.
          expect(String(question.reason).length).toBeGreaterThan(0);
          expect(String(question.prompt).length).toBeGreaterThan(0);
          expect(question.expected_response_kind).toBeTruthy();
          const requestId = String(question.request_id);
          expect(requestId).toBeTruthy();

          // The real answer, addressed to the real request id.
          const accepted = await client.track.api.intervene<JsonObject>({
            token,
            monitorId: vagueId,
            requestId,
            response: answer,
          });
          expect(accepted.data.id).toBe(vagueId);
          answeredIds.add(requestId);

          // The answer is consumed asynchronously.
          for (let attempt = 0; attempt < 8; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 4_000));
            const current = await client.track.api.getMonitor<JsonObject>({
              token,
              monitorId: vagueId,
            });
            if (current.data.status !== "pending_clarification") {
              aligned = current.data;
              break;
            }
          }
        }

        expect(asks, "the backend must ask at least one alignment question").toBeGreaterThan(0);
        console.log(
          `track alignment: ${answeredIds.size} answer(s) accepted, ` +
            `${aligned ? `monitor became ${String(aligned.status)}` : "still aligning"}`,
        );

        // How many turns an LLM-driven alignment needs is not deterministic, so
        // the invariant asserted here is CONSUMPTION: after our answer the
        // backend either releases the monitor from the park, or asks a NEW
        // question (a fresh request id). Either outcome is impossible unless
        // the answer we posted actually reached the alignment loop.
        expect(
          Boolean(aligned) || answeredIds.size >= 2,
          "the answered monitor must either leave pending_clarification or ask a follow-up",
        ).toBe(true);

        if (aligned) {
          expect(aligned.status).toBe("active");
          // Domain content: the alignment turned our free-text answer into a
          // real monitor definition.
          expect(aligned.target_urls).toEqual([targetUrl]);
          expect(isRecord(aligned.schedule) && Object.keys(aligned.schedule).length).toBeTruthy();
        }
      } finally {
        await client.track.api.deleteMonitor({ token, monitorId: vagueId }).catch(() => undefined);
      }
    },
    300_000,
  );

  it("api.deleteMonitor() retires the monitor", async () => {
    const removed = await client.track.api.deleteMonitor<JsonObject>({ token, monitorId });
    deleted = true;
    // DELETE answers 204 with no body — the SDK surfaces that as an empty
    // envelope rather than inventing a payload.
    expect(removed.data).toBeUndefined();

    // The delete is a soft retire: the record stays readable but moves to a
    // terminal status, so the honest post-conditions are "canceled" and
    // "no longer schedulable" rather than "404 on GET".
    const after = await client.track.api.getMonitor<JsonObject>({ token, monitorId });
    expect(after.data.status).toBe("canceled");
    expect(after.data.status_reason).toBe("user_canceled");
    const error = await expectWireError(
      client.track.api.runNow({ token, monitorId }),
      { status: 409, code: "invalid_state_transition" },
      "runNow after delete",
    );
    expect(error.message).toContain("canceled");
  });
});

// ---------------------------------------------------------------------------
// doAnything.api — createSession / createRun / getRun / events / intervene /
//                  cancel / readArtifacts / readRecording
// ---------------------------------------------------------------------------

const DA_WAIT_MS = 300_000;

describeLiveE2E("live e2e: wire escape hatch — doAnything.api", () => {
  const focusedCase = matrix
    ? selectQueryMatrixCase(matrix, "doAnything.run", process.env.EAK_WIRE_DO_ANYTHING_CASE_ID)
    : undefined;
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let runId = "";
  let sessionId = "";
  let attachmentArtifactId: string | undefined;

  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    token = (await delegateLiveToken(client, doAnythingScopes)).token;
  });

  afterAll(async () => {
    if (runId) {
      await client.doAnything.api.cancel({ token, runId, reason: "sdk live e2e cleanup" })
        .catch(() => undefined);
    }
  });

  it("api.createSession() creates a do_anything session shell", async () => {
    const created = await client.doAnything.api.createSession<JsonObject>({ token });
    const standaloneSessionId = String(created.data.id ?? created.data.session_id ?? "");
    expect(standaloneSessionId).toBeTruthy();
    // Domain content: this really is a do_anything session, not a generic task.
    expect(created.data.supervisor_kind).toBe("do_anything");
    expect(created.data.status).toBe("created");
    expect(created.data.instructions).toBeNull();
    expect(created.data.step_count).toBe(0);
    expect(created.data.project_id).toBeTruthy();

    // A standalone session is addressable by the session-scoped routes even
    // though no run has been created in it yet.
    const recording = await client.doAnything.api.readRecording<JsonObject>({
      token,
      sessionId: standaloneSessionId,
    });
    expect(recording.data.session_id).toBe(standaloneSessionId);
    expect(recording.data.recording_url).toBeNull();
  });

  it("api.createRun() creates the run and its session in one call", async () => {
    if (!focusedCase) throw new Error("Focused Do Anything Case was not loaded");
    // The task text comes from the ignored local Case document, never from
    // this source file. `capture` is a semantic-only switch with no wire field,
    // so it is dropped rather than sent as an unknown key.
    const { prompt, capture: _capture, limits, ...rest } = focusedCase.input as JsonObject & {
      prompt: string;
      limits?: { maxDurationMinutes?: number };
    };
    const created = await client.doAnything.api.createRun<JsonObject>({
      token,
      // The wire create body calls the task field `instructions`.
      instructions: prompt,
      ...rest,
      // camelCase in, snake_case on the wire — normalizeDoAnythingRunInput's job.
      maxDurationMinutes: limits?.maxDurationMinutes,
    });
    runId = String(created.data.run_id ?? created.data.id ?? "");
    sessionId = String(created.data.session_id ?? "");
    expect(runId).toBeTruthy();
    expect(sessionId).toBeTruthy();
    expect(["pending", "running"]).toContain(String(created.data.status));
  });

  it("api.getRun() addresses the run by run_id alone", async () => {
    const wire = await client.doAnything.api.getRun<JsonObject>({ token, runId });
    expect(wire.data.run_id ?? wire.data.id).toBe(runId);
    expect(wire.data.session_id).toBe(sessionId);
    expect(typeof wire.data.status).toBe("string");
    // Wire-only run fields the curated RunStatus does not carry.
    expect(Object.keys(wire.data)).toEqual(
      expect.arrayContaining([
        "total_cost_usd",
        "step_count",
        "pending_message_count",
        "parent_run_id",
        "depth",
      ]),
    );
  });

  it("api.intervene() posts an answer through the run's intervene route", async () => {
    // `requestId` is renamed to `input_request_id` and `kind` is derived
    // (`answer_input_request`, because a `response` is present) by
    // normalizeDoAnythingInterveneInput. The backend accepts the envelope and
    // returns the run — asserting the returned run identity proves the request
    // reached the intervene handler for THIS run.
    const wire = await client.doAnything.api.intervene<JsonObject>({
      token,
      runId,
      requestId: `${runId}-wire-probe`,
      response: "sdk live e2e wire intervene",
    });
    expect(wire.data.run_id ?? wire.data.id).toBe(runId);
    expect(wire.data.session_id).toBe(sessionId);
    expect(typeof wire.data.status).toBe("string");
  });

  it(
    "api.events() streams the raw browser-harness envelopes to run.completed",
    async () => {
      const { events, matched } = await drainWireEvents(
        (signal) =>
          client.doAnything.api.events<unknown>({
            token,
            runId,
            signal,
            // Wire-only knobs with no curated counterpart.
            includeScreenshots: true,
            onlyTopLevel: true,
          }),
        {
          timeoutMs: DA_WAIT_MS,
          label: "doAnything api.events",
          until: (event) => envelopeType(event) === "run.completed",
        },
      );
      expect(matched, "the wire stream must carry the run to run.completed").toBe(true);
      const types = events.map(envelopeType);
      // Browser-harness envelopes every run emits.
      expect(types).toContain("run.status_changed");
      expect(types).toContain("run.action.started");
      expect(types).toContain("run.action_result");
      expect(types).toContain("run.browser_live_url_changed");
      // onlyTopLevel drops sub-run envelopes: every event belongs to this run.
      for (const event of events) {
        expect(envelope(event).run_id).toBe(runId);
        expect(envelope(event).task_id).toBe(runId);
      }

      const completed = events[events.length - 1];
      const payload = envelopePayload(completed);
      expect(payload.terminal_reason).toBe("done");
      expect(payload.is_task_successful).toBe(true);
      // Domain content: the configured Case's expected answer, straight off
      // the terminal wire envelope.
      assertQueryMatrixOutput(focusedCase!, payload.output);

      // Whether the agent screenshots a page is its own decision (the wire
      // create body has no capture switch — `capture` is a client-side filter),
      // so screenshot rows are asserted CONDITIONALLY: when the run produced
      // one, `includeScreenshots: true` must have kept the inline image in the
      // stream and the terminal envelope must advertise it as an attachment.
      const screenshot = events.find((event) => envelopeType(event) === "run.screenshot");
      const attachments = (Array.isArray(payload.attachments) ? payload.attachments : [])
        .filter(isRecord);
      if (screenshot) {
        expect(String(envelopePayload(screenshot).screenshot_url)).toMatch(/^data:image\//);
        expect(attachments.length, "a screenshot run must attach an artifact").toBeGreaterThan(0);
        const first = attachments[0];
        expect(first.kind).toBe("screenshot");
        expect(String(first.page_url)).toContain(new URL(focusedCase!.publicSources[0]).hostname);
        attachmentArtifactId = String(first.artifact_id);
        expect(attachmentArtifactId).toBeTruthy();
      } else {
        console.log(`note: run ${runId} took no screenshot — attachment assertions skipped`);
      }
    },
    DA_WAIT_MS + 60_000,
  );

  it("api.readRecording() reads the session recording envelope", async () => {
    const recording = await client.doAnything.api.readRecording<JsonObject>({ token, sessionId });
    expect(recording.data.session_id).toBe(sessionId);
    // The field is always present (null when recording was not enabled).
    expect(Object.keys(recording.data)).toEqual(
      expect.arrayContaining(["recording_url", "recording_started_at"]),
    );
  });

  it("api.readArtifacts() reaches the session artifact route and 404s an unknown id", async () => {
    // NOTE (env constraint, see the delivery report): on this deployment the
    // session artifact route serves NO object at all — including for the very
    // screenshot artifact ids a run's own `run.completed` attachments
    // advertise (verified by rewriting the request onto every plausible
    // run-scoped / session-scoped / bare artifact path; all 404). So the only
    // honest live assertion available is the negative one: the route is
    // reachable under the delegated token and the SDK surfaces the backend's
    // 404 code rather than swallowing it.
    await expectWireError(
      client.doAnything.api.readArtifacts({
        token,
        sessionId,
        artifactId: "00000000000000000000000000000000",
      }),
      { status: 404, code: "not_found" },
      "doAnything.api.readArtifacts with an unknown id",
    );
    if (attachmentArtifactId) {
      // The documented gap: even the run's OWN advertised artifact 404s here.
      await expectWireError(
        client.doAnything.api.readArtifacts({
          token,
          sessionId,
          artifactId: attachmentArtifactId,
        }),
        { status: 404, code: "not_found" },
        "doAnything.api.readArtifacts with the run's own attachment id",
      );
    }
  });

  it("api.cancel() on a settled run returns its terminal wire state", async () => {
    const canceled = await client.doAnything.api.cancel<JsonObject>({
      token,
      runId,
      reason: "sdk live e2e wire cancel",
    });
    expect(canceled.data.run_id ?? canceled.data.id).toBe(runId);
    expect(["succeeded", "failed", "canceled"]).toContain(String(canceled.data.status));
  });
});

// ---------------------------------------------------------------------------
// deepResearch.api — run / get / events / followUp / cancel /
//                    listArtifacts / getArtifact
// ---------------------------------------------------------------------------

const DR_WAIT_MS = 900_000;

describeLiveE2E("live e2e: wire escape hatch — deepResearch.api", () => {
  const focusedCase = matrix ? selectQueryMatrixCase(matrix, "deepResearch.run") : undefined;
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let runId = "";
  let artifacts: JsonObject[] = [];

  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    token = (await delegateLiveToken(client, deepResearchScopes)).token;
  });

  afterAll(async () => {
    if (runId) await client.deepResearch.api.cancel({ token, runId }).catch(() => undefined);
  });

  it("api.run() posts the wire create body and returns the run envelope", async () => {
    if (!focusedCase) throw new Error("Focused Deep Research Case was not loaded");
    const { prompt, limits, ...rest } = focusedCase.input as JsonObject & { prompt: string };
    const created = await client.deepResearch.api.run<JsonObject>({
      token,
      // The wire create body calls the research subject `topic`.
      topic: prompt,
      ...rest,
      maxDurationMinutes: (limits as { maxDurationMinutes?: number } | undefined)
        ?.maxDurationMinutes,
    });
    runId = String(created.data.run_id ?? created.data.id ?? "");
    expect(runId).toBeTruthy();
    expect(created.data.session_id).toBeTruthy();
    expect(["pending", "running"]).toContain(String(created.data.status));
    // DeepResearch's wire envelope carries the pipeline phase; the curated
    // RunStatus does not expose it.
    expect(created.data.phase).toBe("brief");
  });

  it("api.get() addresses the run by id", async () => {
    const wire = await client.deepResearch.api.get<JsonObject>({ token, runId });
    expect(wire.data.run_id).toBe(runId);
    expect(typeof wire.data.status).toBe("string");
    expect(typeof wire.data.phase).toBe("string");
  });

  it("api.followUp() is refused with task_in_progress while the run is live", async () => {
    // Follow-up messages are a terminal-run capability. Asserting the exact
    // 409 proves the SDK reached the messages route on the LIVE run rather
    // than silently no-op'ing.
    await expectWireError(
      client.deepResearch.api.followUp({ token, runId, text: "in-flight follow-up" }),
      { status: 409, code: "task_in_progress" },
      "deepResearch.api.followUp while running",
    );
  });

  it(
    "api.events() streams the research pipeline to run.completed",
    async () => {
      const { events, matched } = await drainWireEvents(
        (signal) => client.deepResearch.api.events<unknown>({ token, runId, signal }),
        {
          timeoutMs: DR_WAIT_MS,
          label: "deepResearch api.events",
          until: (event) => envelopeType(event) === "run.completed",
        },
      );
      expect(matched, "the wire stream must carry the run to run.completed").toBe(true);
      const types = events.map(envelopeType);
      // Product-specific wire event names.
      expect(types).toContain("run.phase_changed");
      expect(types).toContain("run.action.progress");
      for (const event of events) {
        expect(envelope(event).run_id).toBe(runId);
      }
      const completed = events[events.length - 1];
      const payload = envelopePayload(completed);
      expect(payload.terminal_reason).toBe("done");
      const output = isRecord(payload.output) ? payload.output : {};
      // Domain content: a cited markdown report, not just a 200.
      expect(String(output.final_md)).toContain("## References");
      expect(String(output.final_md).length).toBeGreaterThan(500);
    },
    DR_WAIT_MS + 60_000,
  );

  it("api.listArtifacts() lists the report deliverables", async () => {
    const listed = await client.deepResearch.api.listArtifacts<JsonObject>({ token, runId });
    expect(listed.data.run_id).toBe(runId);
    artifacts = (Array.isArray(listed.data.items) ? listed.data.items : []).filter(isRecord);
    expect(artifacts.length, "a completed report must expose artifacts").toBeGreaterThan(0);
    // Deliverable kinds the DeepResearch pipeline always emits.
    const kinds = artifacts.map((item) => String(item.kind));
    expect(kinds).toContain("final");
    expect(kinds).toContain("citations");
    for (const item of artifacts) {
      expect(String(item.id)).toMatch(/^art_/);
      expect(typeof item.name).toBe("string");
      expect(typeof item.mime_type).toBe("string");
      expect(Number(item.size_bytes)).toBeGreaterThan(0);
    }
  });

  it("api.getArtifact() reads a single artifact by id", async () => {
    const citations = artifacts.find((item) => String(item.kind) === "citations");
    expect(citations, "the report must expose a citations artifact").toBeTruthy();
    const wire = await client.deepResearch.api.getArtifact<JsonObject>({
      token,
      runId,
      artifactId: String(citations!.id),
    });
    // citations.json is application/json, so the wire layer hands back the
    // parsed document — a real count of the sources the report cited.
    expect(isRecord(wire.data)).toBe(true);
    expect(Number(wire.data.count)).toBeGreaterThan(0);

    await expectWireError(
      client.deepResearch.api.getArtifact({ token, runId, artifactId: "art_does_not_exist" }),
      { status: 404, code: "task_not_found" },
      "deepResearch.api.getArtifact with an unknown id",
    );
  });

  it("api.followUp() is accepted once the run is terminal", async () => {
    const wire = await client.deepResearch.api.followUp<JsonObject>({
      token,
      runId,
      text: "sdk live e2e wire follow-up",
    });
    expect(wire.data.run_id).toBe(runId);
    expect(["succeeded", "failed", "canceled"]).toContain(String(wire.data.status));
  });

  it("api.cancel() on a settled run returns its terminal wire state", async () => {
    const canceled = await client.deepResearch.api.cancel<JsonObject>({ token, runId });
    expect(canceled.data.run_id).toBe(runId);
    expect(["succeeded", "failed", "canceled"]).toContain(String(canceled.data.status));
  });
});
