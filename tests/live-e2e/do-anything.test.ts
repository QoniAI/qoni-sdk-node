import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { JsonObject, RunHandle, RunResult } from "../../src";
import {
  allowLiveEnvironmentConstraint,
  collectRunEvents,
  delegateLiveToken,
  doAnythingScopes,
  liveE2EEnabled,
  liveClient,
} from "./helpers";
import type { DoAnythingEvidenceSummary } from "../helpers/do-anything-evidence";
import {
  assertCompleteDoAnythingEvidence,
  createDoAnythingEvidenceRecorder,
} from "../helpers/do-anything-evidence";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;

// The exact Wikipedia article title the browsing task below must surface.
const EXPECTED_TITLE_RE = new RegExp(
  process.env.EAK_DO_ANYTHING_EXPECTED_PATTERN || "universally unique identifier",
  "i",
);

// A real Browserbase navigation can exceed the suite's 120s default testTimeout,
// so the wait test
// carries its own budget like the deep-research one does.
const WAIT_TIMEOUT_MS = Number(process.env.EAK_LIVE_WAIT_TIMEOUT_MS || 360_000);
const PROMPT =
  process.env.EAK_DO_ANYTHING_PROMPT ||
  "Open https://en.wikipedia.org/wiki/Universally_unique_identifier in the browser " +
    "and report the article's exact title.";
const RUN_OPTIONS = {
  capture: { screenshots: true },
  limits: { maxDurationMinutes: 5 },
} as const;

// Live coverage of the frozen contract's mainline (public-surface doc §2/§4):
// run() → RunHandle → wait(), token passed once at the entry call, screenshots
// via the semantic capture switch, domain content asserted from result.output.
describeLiveE2E("live e2e: Do Anything (semantic surface)", () => {
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let runReady: Promise<RunHandle | undefined> | undefined;
  let resultReady: Promise<RunResult | undefined> | undefined;
  let evidenceSummary: DoAnythingEvidenceSummary | undefined;
  let recordedDir: string | undefined;
  let runStartedAt: string | undefined;

  beforeAll(async () => {
    client = liveClient();
    token = (await delegateLiveToken(client, doAnythingScopes)).token;
  });

  afterAll(async () => {
    // Semantic cancel is idempotent — safe even when the run already settled.
    await runReady?.then((run) => run?.cancel("sdk live e2e cleanup")).catch(() => undefined);
  });

  // One run shared across the file: token passed ONCE at the entry call,
  // every later operation goes through the run.
  function ensureRun() {
    runReady ??= (async () => {
      runStartedAt = new Date().toISOString();
      const run = await allowLiveEnvironmentConstraint(
        client.doAnything.run({
          token,
          // A task that REQUIRES browsing (search box interaction): plain
          // URL-fetch phrasings get routed to the fetch/textify agents, which
          // never produce screenshots. The answer is still deterministic —
          // the article's exact title.
          prompt: PROMPT,
          ...RUN_OPTIONS,
        }),
      );
      return run ?? undefined;
    })();
    return runReady;
  }

  // One wait() shared across the file. The SDK exposes BOTH layers here:
  // `onWireEvent` receives the unfiltered SSE trace (Agent messages, tool
  // params/results, LLM usage, Browser Harness authoring/execution), while
  // `onEvent` receives the curated semantic stream. Media and the final REST
  // snapshots are stored beside those streams for a self-contained report.
  function ensureResult() {
    resultReady ??= (async () => {
      const run = await ensureRun();
      if (!run) return undefined;
      const dir =
        process.env.EAK_OUT_DIR ||
        path.join(process.cwd(), ".secrets", "runs", `do_anything-${run.id}`);
      const recorder = createDoAnythingEvidenceRecorder({
        dir,
        runId: run.id,
        prompt: PROMPT,
        request: RUN_OPTIONS,
        startedAt: runStartedAt,
      });
      recordedDir = recorder.dir;
      console.log(`recording run ${run.id} → ${recorder.dir}`);
      try {
        recorder.recordInitialStatus(await run.status());
        const result = await run.wait({
          timeoutMs: WAIT_TIMEOUT_MS,
          onWireEvent: (event) => recorder.recordWireEvent(event),
          onEvent: (event) => recorder.recordSemanticEvent(event),
          onReconnect: (info) => recorder.recordReconnect(info),
          onScreenshot: (image, index) => {
            expect(image.bytes.byteLength).toBeGreaterThan(0);
            expect(image.mime).toMatch(/^image\//);
            recorder.recordScreenshot(image, index);
          },
        });
        recorder.recordResult(result);
        if (!run.sessionRef?.sessionId) {
          throw new Error("Do Anything E2E run did not expose a session id for recording");
        }
        const recording = await client.doAnything.api.readRecording({
          token,
          sessionId: run.sessionRef.sessionId,
        });
        recorder.recordRecording(recording.data);
        evidenceSummary = recorder.finalize();
        assertCompleteDoAnythingEvidence(evidenceSummary);
        console.log(`complete Do Anything evidence → ${recorder.dir}`);
        console.log(JSON.stringify(evidenceSummary, null, 2));
        return result;
      } catch (error) {
        recorder.recordError(error);
        evidenceSummary = recorder.finalize();
        console.error(`partial Do Anything evidence → ${recorder.dir}`);
        throw error;
      }
    })();
    return resultReady;
  }

  it("doAnything.run({ token, instruction, capture, limits }) returns a run", async () => {
    const run = await ensureRun();
    if (!run) return;
    expect(run.id).toBeTruthy();
    expect(run.sessionRef?.sessionId).toBeTruthy();
  });

  it("run.status() refreshes the run without re-passing token or ids", async () => {
    const run = await ensureRun();
    if (!run) return;
    const status = await run.status();
    expect(status.id).toBe(run.id);
    expect(status.status).toBeTruthy();
  });

  it("run.events() yields normalized semantic events", async () => {
    const run = await ensureRun();
    if (!run) return;
    const events = await collectRunEvents((signal) => run.events({ signal }), {
      label: "doAnything run.events",
      minEvents: 2,
    });
    expect(events.some((event) => event.runId === run.id)).toBe(true);
  });

  it(
    "run.wait() returns the article title, raw events and screenshots on disk",
    async () => {
      const result = await ensureResult();
      if (!result) return;

      // Real domain content, not a status echo: the answer must contain the
      // expected task result (override the pattern with the prompt when needed).
      expect(result.status).toBe("succeeded");
      expect(JSON.stringify(result.output ?? "")).toMatch(EXPECTED_TITLE_RE);

      // A release-valid Browser Harness run must leave complete local evidence.
      expect(evidenceSummary?.screenshotCount).toBeGreaterThan(0);
      expect(evidenceSummary?.rawEventCount).toBeGreaterThan(0);
      expect(evidenceSummary?.assistantMessageCount).toBeGreaterThan(0);
      expect(evidenceSummary?.browserHarnessAuthoringCount).toBeGreaterThan(0);
      expect(evidenceSummary?.browserHarnessExecutionCount).toBeGreaterThan(0);
      expect(recordedDir && fs.existsSync(path.join(recordedDir, "events.raw.jsonl"))).toBe(true);
      expect(recordedDir && fs.existsSync(path.join(recordedDir, "metrics.json"))).toBe(true);
    },
    WAIT_TIMEOUT_MS + 60_000,
  );

  it("run.cancel() is idempotent on a settled run", async () => {
    const run = await ensureRun();
    if (!run) return;
    await ensureResult();
    // The contract makes cancel idempotent: cancelling a terminal run returns
    // its terminal state instead of throwing a wire 4xx.
    const status = await run.cancel("sdk live e2e cleanup");
    expect(["succeeded", "failed", "canceled"]).toContain(status.status);
  });

  it("doAnything.attach() reconnects to the run by id alone", async () => {
    const run = await ensureRun();
    if (!run) return;
    const reattached = await client.doAnything.attach(run.id, { token });
    expect(reattached.id).toBe(run.id);
    const status = await reattached.status();
    expect(status.id).toBe(run.id);
    // sessionRef is adopted from the run detail envelope.
    expect(reattached.sessionRef?.sessionId).toBeTruthy();
  });

  // Escape-hatch smoke: the wire layer (api.*) must keep working for advanced
  // users, but it appears ONLY here — everything above is semantic. The
  // session recording read has no semantic counterpart by design (§9 keeps
  // readRecording wire-level).
  it("escape hatch: api.getRun / api.readRecording still speak wire", async () => {
    const run = await ensureRun();
    if (!run?.sessionRef) return;
    const sessionId = run.sessionRef.sessionId;
    const wire = await client.doAnything.api.getRun<JsonObject>({
      token,
      runId: run.id,
    });
    expect(wire.data).toBeTruthy();
    expect(typeof wire.data.status).toBe("string");
    const recording = await client.doAnything.api.readRecording({ token, sessionId });
    expect(recording.data).toBeTruthy();
  });
});
