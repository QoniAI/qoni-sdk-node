import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { JsonObject, RunHandle, RunResult, WebSearchRunOptions } from "../../src";
import {
  loadQueryMatrix,
  selectQueryMatrixCase,
} from "../helpers/query-matrix";
import { assertQueryMatrixOutput } from "../helpers/query-matrix-runner";
import {
  allowLiveEnvironmentConstraint,
  collectRunEvents,
  delegateLiveToken,
  liveE2EEnabled,
  liveClient,
  openRawEventRecorder,
  webSearchScopes,
} from "./helpers";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;
const focusedMatrix = liveE2EEnabled ? loadQueryMatrix() : undefined;
const focusedCase = focusedMatrix
  ? selectQueryMatrixCase(focusedMatrix, "webSearch.run", process.env.EAK_WEB_SEARCH_CASE_ID)
  : undefined;
const runInput = focusedCase?.input as
  | (JsonObject & {
      prompt: string | string[];
      maxResultsPerQuery?: number;
      siteWhitelist?: string[];
    })
  | undefined;
const waitTimeoutMs = focusedCase?.timeoutMs ?? focusedMatrix?.runtime.timeoutMs ?? 120_000;

// The settled `result.output` for webSearch is the wire output object
// ({ engines, queries, results: [...] }). Dig the result items out without
// assuming which level carries the array.
function searchResultItems(output: unknown): JsonObject[] {
  if (Array.isArray(output)) return output.filter(isRecord);
  if (isRecord(output) && Array.isArray(output.results)) {
    return output.results.filter(isRecord);
  }
  return [];
}

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

describeLiveE2E("live e2e: Web Search (semantic surface)", () => {
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let runReady: Promise<RunHandle | undefined> | undefined;
  let resultReady: Promise<RunResult | undefined> | undefined;
  let recordedEvents = 0;
  let recordedFile: string | undefined;

  beforeAll(async () => {
    client = liveClient(focusedMatrix?.runtime);
    token = (await delegateLiveToken(client, webSearchScopes)).token;
  });

  afterAll(async () => {
    // Semantic cancel is idempotent — safe even when the run already settled.
    await runReady?.then((run) => run?.cancel("sdk live e2e cleanup")).catch(() => undefined);
  });

  // One run shared across the file: token passed ONCE at the entry call,
  // every later operation goes through the run.
  function ensureRun() {
    runReady ??= (async () => {
      if (!runInput) throw new Error("Focused Web Search Case was not loaded");
      const run = await allowLiveEnvironmentConstraint(
        client.webSearch.run({
          token,
          ...runInput,
        } as WebSearchRunOptions),
      );
      return run ?? undefined;
    })();
    return runReady;
  }

  // One wait() shared across the file. Records the raw wire stream to disk
  // while waiting — every semantic event carries the original wire event on
  // `event.raw`, so the recorder needs no api.* access.
  function ensureResult() {
    resultReady ??= (async () => {
      const run = await ensureRun();
      if (!run) return undefined;
      const recorder = openRawEventRecorder(`web_search-${run.id}`);
      recordedFile = recorder.file;
      console.log(`recording run ${run.id} → ${recorder.dir}`);
      const result = await run.wait({
        timeoutMs: waitTimeoutMs,
        onEvent: (event) => recorder.record(event),
      });
      recordedEvents = recorder.count();
      console.log(`recorded ${recordedEvents} events → ${recorder.file}`);
      return result;
    })();
    return resultReady;
  }

  it("webSearch.run({ token, query, maxResultsPerQuery, siteWhitelist }) returns a run", async () => {
    const run = await ensureRun();
    if (!run) return;
    expect(run.id).toBeTruthy();
  });

  it("run.status() refreshes the run without re-passing token or id", async () => {
    const run = await ensureRun();
    if (!run) return;
    const status = await run.status();
    expect(status.id).toBe(run.id);
    expect(status.status).toBeTruthy();
  });

  it("webSearch.attach() reconnects to the run", async () => {
    const run = await ensureRun();
    if (!run) return;
    const attached = await client.webSearch.attach(run.id, { token });
    expect(attached.id).toBe(run.id);
    expect((await attached.status()).id).toBe(run.id);
  });

  it("run.events() yields normalized semantic events", async () => {
    const run = await ensureRun();
    if (!run) return;
    const events = await collectRunEvents((signal) => run.events({ signal }), {
      label: "webSearch run.events",
    });
    expect(events.some((event) => event.runId === run.id)).toBe(true);
  });

  it("run.wait() settles with on-whitelist results and records the raw stream", async () => {
    const result = await ensureResult();
    if (!result) return;

    expect(result.status).toBe("succeeded");
    expect(result.artifacts).toEqual([]);

    if (!focusedCase || !runInput) throw new Error("Focused Web Search Case was not loaded");
    const items = searchResultItems(result.output);
    assertQueryMatrixOutput(focusedCase, result.output, { resultCount: items.length });
    const queryCount = Array.isArray(runInput.prompt) ? runInput.prompt.length : 1;
    if (runInput.maxResultsPerQuery !== undefined) {
      expect(items.length).toBeLessThanOrEqual(runInput.maxResultsPerQuery * queryCount);
    }
    for (const item of items) {
      expect(typeof item.url, "result.url").toBe("string");
      expect(typeof item.title, "result.title").toBe("string");
      expect(String(item.title).length).toBeGreaterThan(0);
      if (runInput.siteWhitelist?.length) {
        const host = new URL(String(item.url)).hostname.toLowerCase();
        expect(
          runInput.siteWhitelist.some((domain) =>
            host === domain.toLowerCase() || host.endsWith(`.${domain.toLowerCase()}`)
          ),
          `result host is outside the configured whitelist`,
        ).toBe(true);
      }
    }

    // The recorder ran inside wait() — raw wire envelopes are on disk.
    expect(recordedEvents).toBeGreaterThan(0);
    expect(recordedFile && fs.existsSync(recordedFile)).toBe(true);
  });

  it("run.cancel() is idempotent on a settled run", async () => {
    const run = await ensureRun();
    if (!run) return;
    await ensureResult();
    // The contract makes cancel idempotent: cancelling a terminal run returns
    // its terminal state instead of throwing a wire 4xx.
    const status = await run.cancel("sdk live e2e cleanup");
    expect(["succeeded", "failed", "canceled"]).toContain(status.status);
  });

  // Escape-hatch smoke: the wire layer (api.*) must keep working for advanced
  // users, but it appears ONLY here — everything above is semantic.
  it("escape hatch: api.get({ token, runId }) still speaks wire", async () => {
    const run = await ensureRun();
    if (!run) return;
    const wire = await client.webSearch.api.get<JsonObject>({ token, runId: run.id });
    expect(wire.data).toBeTruthy();
    expect(typeof wire.data.status).toBe("string");
  });
});
