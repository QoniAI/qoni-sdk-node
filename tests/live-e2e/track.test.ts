import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { JsonObject, MonitorHandle, TrackCreateOptions } from "../../src";
import { loadQueryMatrix, selectQueryMatrixCase } from "../helpers/query-matrix";
import { assertQueryMatrixOutput } from "../helpers/query-matrix-runner";
import { delegateLiveToken, liveE2EEnabled, liveClient, trackScopes } from "./helpers";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;
const matrix = liveE2EEnabled ? loadQueryMatrix() : undefined;
const focusedCase = matrix ? selectQueryMatrixCase(matrix, "track.create", process.env.QONI_TRACK_CASE_ID) : undefined;
const timeoutMs = focusedCase?.timeoutMs ?? matrix?.runtime.timeoutMs ?? 220_000;

describeLiveE2E("live e2e: Track (semantic surface)", () => {
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let monitor: MonitorHandle;
  let deleted = false;
  let manualRunId = "";
  let firstRunId = "";
  beforeAll(async () => {
    client = liveClient(matrix?.runtime);
    token = (await delegateLiveToken(client, trackScopes)).token;
  });
  afterAll(async () => { if (monitor && !deleted) await monitor.delete().catch(() => undefined); });

  async function waitForCheck(runId: string): Promise<JsonObject> {
    const deadline = Date.now() + timeoutMs;
    do {
      const rows = await monitor.runs();
      const row = rows.find(r => r.runId === runId);
      if (row && ["done", "failed", "expired", "canceled"].includes(String(row.status))) {
        expect(row.status, String(row.failure ?? "Check failed")).toBe("done");
        if (focusedCase) assertQueryMatrixOutput(focusedCase, row);
        return row;
      }
      await new Promise(resolve => setTimeout(resolve, 1_000));
    } while (Date.now() < deadline);
    throw new Error(`Track check ${runId} did not complete in ${timeoutMs}ms`);
  }
  it("track.create returns an active Track from explicit prompt/schedule", async () => {
    if (!focusedCase) throw new Error("Focused Track case is missing");
    monitor = await client.track.create({ token, ...focusedCase.input } as TrackCreateOptions);
    expect(monitor.id).toBeTruthy();
    const initial = await monitor.get();
    expect(initial.status).toBe("active");
    if (typeof initial.lastTaskId !== "string" || !initial.lastTaskId) throw new Error("Track initial response lacks lastTaskId");
    firstRunId = initial.lastTaskId;
  });
  it("monitor.get returns real instructions and a roundtrippable schedule", async () => {
    const data = await monitor.get();
    expect(data.instructions).toBe(focusedCase!.input.prompt);
    expect(data.schedule).toEqual(focusedCase!.input.schedule);
    expect(Object.keys(data).some(k => k.includes("_"))).toBe(false);
  });
  it("track.attach reconnects to the real Track", async () => {
    const attached = await client.track.attach(monitor.id, { token });
    expect((await attached.get()).instructions).toBe(focusedCase!.input.prompt);
  });
  it("monitor.refine updates title and preserves instructions", async () => {
    const title = "SDK Track contract check";
    await monitor.refine({ title });
    expect(await monitor.get()).toMatchObject({ title, instructions: focusedCase!.input.prompt });
  });
  it("monitor.pause and resume persist the actual statuses", async () => {
    expect((await monitor.pause()).status).toBe("paused");
    expect((await monitor.get()).status).toBe("paused");
    expect((await monitor.resume()).status).toBe("active");
    expect((await monitor.get()).status).toBe("active");
  });
  it("monitor.runNow returns a task reference whose exact check reaches a successful terminal state", async () => {
    await waitForCheck(firstRunId); // this exact first look must finish before run_now; no hidden SDK retry
    const task = await monitor.runNow();
    manualRunId = task.runId;
    expect(task.trackId).toBe(monitor.id);
    expect(task.sessionId).toBe((await monitor.get()).sessionId);
    expect(task).not.toHaveProperty("snapshotId");
    await waitForCheck(manualRunId);
  }, timeoutMs * 2 + 5_000);
  it("monitor.runs and run read only real recent check fields", async () => {
    const rows = await monitor.runs({ limit: 10 });
    expect(rows.length).toBeGreaterThan(0);
    const exact = await monitor.run(manualRunId);
    expect(exact).toMatchObject({ runId: manualRunId, status: "done", kind: "manual" });
    for (const key of ["diffs", "extracted", "snapshotId"]) expect(exact).not.toHaveProperty(key);
  });
  it("escape hatch getMonitor still returns the actual wire record", async () => {
    const wire = await client.track.api.getMonitor<JsonObject>({ token, monitorId: monitor.id });
    expect(wire.data).toMatchObject({ id: monitor.id, instructions: focusedCase!.input.prompt });
    expect(wire.data).toHaveProperty("session_id");
  });
  it("monitor.delete soft-deletes and later reads return not found", async () => {
    await monitor.delete(); deleted = true;
    await expect(monitor.get()).rejects.toMatchObject({ status: 404 });
  });
});
// No Track SSE/interaction or recurring-cadence claim: neither is exercised here.
// Local unsupported guards are tested in gray-track-contract.test.ts.
