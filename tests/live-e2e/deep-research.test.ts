import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { JsonObject, RunHandle, RunResult } from "../../src";
import {
  allowLiveEnvironmentConstraint,
  collectRunEvents,
  deepResearchScopes,
  delegateLiveToken,
  liveE2EEnabled,
  liveClient,
  openRawEventRecorder,
} from "./helpers";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;

// A deepResearch run takes 3-7 real minutes (PLAN flows straight to GATHER —
// there is no outline-approval gate), so it gets a budget independent of the
// generic stream timeout the other products use.
const DR_WAIT_TIMEOUT_MS = Number(
  process.env.EAK_LIVE_DEEP_RESEARCH_WAIT_TIMEOUT_MS || 600_000,
);

describeLiveE2E("live e2e: Deep Research (semantic surface)", () => {
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let runReady: Promise<RunHandle | undefined> | undefined;
  let resultReady: Promise<RunResult | undefined> | undefined;
  let recordedEvents = 0;
  let recordedFile: string | undefined;

  beforeAll(async () => {
    client = liveClient();
    token = (await delegateLiveToken(client, deepResearchScopes)).token;
  });

  afterAll(async () => {
    // Semantic cancel is idempotent — safe even when the run already settled.
    await runReady?.then((run) => run?.cancel("sdk live e2e cleanup")).catch(() => undefined);
  });

  // One run shared across the file: token passed ONCE at the entry call,
  // every later operation goes through the run.
  function ensureRun() {
    runReady ??= (async () => {
      const run = await allowLiveEnvironmentConstraint(
        client.deepResearch.run({
          token,
          // Plain researchable topic — no nonce: the topic fans out into real
          // web searches where a nonce only adds noise; run traceability
          // comes from run.id.
          prompt: "simply summarize the public example.com page in one paragraph",
          // "light" shrinks the outline section count and the per-section
          // gather budget — standard depth fans this trivial topic into a
          // multi-section plan that runs well past any sane test budget.
          depth: "light",
          outputFormat: "report",
          targetAudience: "SDK maintainers",
          limits: {
            maxDurationMinutes: Number(
              process.env.EAK_LIVE_DEEP_RESEARCH_MAX_DURATION_MINUTES || 10,
            ),
          },
          domainWhitelist: ["example.com"],
        }),
      );
      return run ?? undefined;
    })();
    return runReady;
  }

  // One wait() shared across the file — this is the contract's §2 mainline.
  // PLAN flows straight to GATHER (no outline-approval gate), so the run runs
  // to completion without any human intervention. The recorder persists every
  // original wire envelope (event.raw) under
  // .secrets/runs/deep_research-<runId>/ (EAK_OUT_DIR overrides).
  function ensureResult() {
    resultReady ??= (async () => {
      const run = await ensureRun();
      if (!run) return undefined;
      const recorder = openRawEventRecorder(`deep_research-${run.id}`);
      recordedFile = recorder.file;
      console.log(`recording run ${run.id} → ${recorder.dir}`);
      const result = await run.wait({
        timeoutMs: DR_WAIT_TIMEOUT_MS,
        onEvent: (event) => recorder.record(event),
      });
      recordedEvents = recorder.count();
      console.log(`recorded ${recordedEvents} events → ${recorder.file}`);
      return result;
    })();
    return resultReady;
  }

  it("deepResearch.run({ token, topic, depth, limits, ... }) returns a run", async () => {
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

  it("deepResearch.attach() reconnects to the run", async () => {
    const run = await ensureRun();
    if (!run) return;
    const attached = await client.deepResearch.attach(run.id, { token });
    expect(attached.id).toBe(run.id);
    expect((await attached.status()).id).toBe(run.id);
  });

  it("run.events() yields normalized semantic events", async () => {
    const run = await ensureRun();
    if (!run) return;
    const events = await collectRunEvents((signal) => run.events({ signal }), {
      label: "deepResearch run.events",
    });
    expect(events.some((event) => event.runId === run.id)).toBe(true);
  });

  it(
    "run.wait() settles with a real cited report",
    async () => {
      const result = await ensureResult();
      if (!result) return;

      expect(result.status).toBe("succeeded");
      // Domain content: a report, not a status flip. The settled output must
      // be substantial prose about the researched page.
      const reportText = JSON.stringify(result.output ?? "");
      expect(reportText.length).toBeGreaterThan(200);
      expect(reportText.toLowerCase()).toContain("example");

      // Deliverables ride on the settled result (contract §4): deepResearch
      // produces artifacts; content is fetched lazily through the run.
      expect(Array.isArray(result.artifacts)).toBe(true);
      if (result.artifacts.length > 0) {
        const first = result.artifacts[0];
        expect(first.id).toBeTruthy();
        const bytes = await first.content();
        expect(bytes.byteLength).toBeGreaterThan(0);
      } else {
        console.log("note: run settled with zero artifacts — report only in output");
      }

      expect(recordedEvents).toBeGreaterThan(0);
      expect(recordedFile && fs.existsSync(recordedFile)).toBe(true);
    },
    DR_WAIT_TIMEOUT_MS + 60_000,
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

  // Escape-hatch smoke: the wire layer (api.*) must keep working for advanced
  // users, but it appears ONLY here — everything above is semantic. Report
  // feedback is an application-level capability that exists only on the wire
  // (contract §9), so it is exercised here rather than via the run.
  it("escape hatch: api.get / api.feedback still speak wire", async () => {
    const run = await ensureRun();
    if (!run) return;
    await ensureResult();
    const wire = await client.deepResearch.api.get<JsonObject>({ token, runId: run.id });
    expect(wire.data).toBeTruthy();
    expect(typeof wire.data.status).toBe("string");
    await client.deepResearch.api.feedback({
      token,
      runId: run.id,
      rating: 5,
      feedbackText: "SDK live e2e feedback",
    });
  });
});
