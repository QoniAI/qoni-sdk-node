import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { QoniEvent, JsonObject } from "../../src";
import { QoniError } from "../../src";
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
function envelope(event: QoniEvent<unknown>): JsonObject {
  return isRecord(event.data) ? event.data : {};
}

function envelopeType(event: QoniEvent<unknown>): string {
  return String(envelope(event).type ?? event.event ?? "");
}

function envelopePayload(event: QoniEvent<unknown>): JsonObject {
  const inner = envelope(event).data;
  return isRecord(inner) ? inner : {};
}

/**
 * Drain a WIRE event stream (`api.events`) until `until` matches or the budget
 * runs out. Returns every envelope seen so the caller can assert on the real
 * wire types, not just on "something arrived".
 */
async function drainWireEvents(
  factory: (signal: AbortSignal) => AsyncIterable<QoniEvent<unknown>>,
  options: { timeoutMs: number; until: (event: QoniEvent<unknown>) => boolean; label: string },
): Promise<{ events: QoniEvent<unknown>[]; matched: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  const events: QoniEvent<unknown>[] = [];
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
): Promise<QoniError> {
  let caught: unknown;
  try {
    await operation;
  } catch (error) {
    caught = error;
  }
  expect(caught, `${label} should be rejected by the backend`).toBeInstanceOf(QoniError);
  const error = caught as QoniError;
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
// track.api — supported createMonitor / getMonitor / runNow /
//             listRuns / getRun / updateMonitor / deleteMonitor
// ---------------------------------------------------------------------------

describeLiveE2E("live e2e: wire escape hatch — track.api", () => {
  const focusedCase = matrix ? selectQueryMatrixCase(matrix, "track.create") : undefined;
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let monitorId = "";
  let sessionId = "";
  let deleted = false;
  let manualRunId = "";
  let firstRunId = "";
  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    token = (await delegateLiveToken(client, trackScopes)).token;
  });
  afterAll(async () => { if (monitorId && !deleted) await client.track.api.deleteMonitor({ token, monitorId }).catch(() => undefined); });
  async function waitForCheck(runId: string) {
    const deadline = Date.now() + (focusedCase?.timeoutMs ?? 220_000);
    do {
      const checks = await client.track.api.listRuns<{ items: JsonObject[] }>({ token, monitorId });
      const row = checks.data.items.find(r => r.run_id === runId);
      if (row && ["done", "failed", "expired", "canceled"].includes(String(row.status))) {
        expect(row.status, String(row.failure ?? "Check failed")).toBe("done");
        assertQueryMatrixOutput(focusedCase!, row);
        return row;
      }
      await new Promise(resolve => setTimeout(resolve, 1_000));
    } while (Date.now() < deadline);
    throw new Error("Track check timed out");
  }
  it("api.createMonitor creates a real Track with instructions and a wire schedule", async () => {
    if (!focusedCase) throw new Error("Focused Track Case was not loaded");
    const { prompt, schedule, ...rest } = focusedCase.input;
    const spec = schedule as JsonObject;
    let wireSchedule: JsonObject;
    if (spec?.kind === "interval") wireSchedule = { every_seconds: spec.intervalSeconds };
    else if (spec?.kind === "daily") wireSchedule = { daily_at: spec.at, tz: spec.tz };
    else throw new Error("Track Case must provide an explicit interval or daily schedule");
    const created = await client.track.api.createMonitor<JsonObject>({ token, ...rest, instructions: prompt, schedule: wireSchedule });
    monitorId = String(created.data.id);
    sessionId = String(created.data.session_id);
    if (typeof created.data.last_task_id !== "string" || !created.data.last_task_id) throw new Error("Track create response lacks last_task_id");
    firstRunId = created.data.last_task_id;
    expect(created.data).toMatchObject({ instructions: prompt, schedule: wireSchedule, status: "active" });
    expect(monitorId).toBeTruthy(); expect(sessionId).toBeTruthy();
  });
  it("api.getMonitor reads the real Track by id", async () => {
    expect((await client.track.api.getMonitor<JsonObject>({ token, monitorId })).data).toMatchObject({ id: monitorId, instructions: focusedCase!.input.prompt });
  });
  it("api.updateMonitor PATCHes real paused and active statuses", async () => {
    expect((await client.track.api.updateMonitor<JsonObject>({ token, monitorId, status: "paused" })).data.status).toBe("paused");
    expect((await client.track.api.getMonitor<JsonObject>({ token, monitorId })).data.status).toBe("paused");
    expect((await client.track.api.updateMonitor<JsonObject>({ token, monitorId, status: "active" })).data.status).toBe("active");
  });
  it("api.runNow returns only a real task reference and waits for its exact check", async () => {
    await waitForCheck(firstRunId);
    const task = await client.track.api.runNow<JsonObject>({ token, monitorId });
    expect(task.data).toEqual({ track_id: monitorId, session_id: sessionId, run_id: expect.any(String) });
    manualRunId = String(task.data.run_id);
    await waitForCheck(manualRunId);
  }, (focusedCase?.timeoutMs ?? 220_000) * 2 + 5_000);
  it("api.listRuns and getRun return recent checks without snapshot fields", async () => {
    const page = await client.track.api.listRuns<{ items: JsonObject[] }>({ token, monitorId, limit: 5 });
    expect(page.data.items.length).toBeLessThanOrEqual(5);
    const exact = await client.track.api.getRun<JsonObject>({ token, monitorId, runId: manualRunId });
    expect(exact.data).toMatchObject({ run_id: manualRunId, status: "done", kind: "manual" });
    for (const key of ["diffs", "extracted", "snapshot_id"]) expect(exact.data).not.toHaveProperty(key);
  });
  it("api.deleteMonitor accepts empty 204 and the deleted Track reads as 404", async () => {
    await client.track.api.deleteMonitor({ token, monitorId }); deleted = true;
    await expect(client.track.api.getMonitor({ token, monitorId })).rejects.toMatchObject({ status: 404 });
  });
});
// Unsupported events/intervene are local guards; they are not live successes.

// ---------------------------------------------------------------------------
// doAnything.api — createSession / createRun / getRun / events / intervene /
//                  cancel / readArtifacts / readRecording
// ---------------------------------------------------------------------------

const DA_WAIT_MS = 300_000;

describeLiveE2E("live e2e: wire escape hatch — doAnything.api", () => {
  const focusedCase = matrix
    ? selectQueryMatrixCase(matrix, "doAnything.run", process.env.QONI_WIRE_DO_ANYTHING_CASE_ID)
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

  // Deprecated readArtifacts has no route/source. Its zero-HTTP typed guard
  // is covered locally, not counted as a live 404 or a positive artifact read.

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
