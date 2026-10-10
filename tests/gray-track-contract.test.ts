import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runQueryMatrixCase, assertQueryMatrixOutput } from "./helpers/query-matrix-runner";
import ts from "typescript";
import { createServer, type Server } from "node:http";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Qoni, QoniError, QoniUnsupportedError, QoniValidationError, type Interaction, type JsonObject, type TrackTaskRef } from "../src";

// Fixed source: WA 596310a3 backend/src/api/v1/track.py and services/track.py.
// This local HTTP fixture implements their wire shapes; it does not run WA/PG/GA.
const jwt = (p: object) => `e30.${Buffer.from(JSON.stringify(p)).toString("base64url")}.`;
const product = jwt({ webagent_tenant_id: "fixture_project", aud: "webagent" });
const delegation = jwt({ token_type: "eak_delegation_token", aud: "genauth:token-exchange" });
const base = "/api/v1/projects/fixture_project/track/tracks";
const interval = { kind: "interval" as const, intervalSeconds: 600 };
const track = {
  id: "track_1", origin_session_id: null, session_id: "session_1", title: "Policy", instructions: "Watch policy",
  schedule: { every_seconds: 600 }, status: "active", next_run_at: "2026-10-09T00:00:00Z",
  last_run_at: null, last_task_id: "run_0", last_outcome: null, last_headline: null,
  checking: true, check_count: 1, unread_count: null, created_at: "2026-10-08T00:00:00Z",
  updated_at: "2026-10-08T00:00:00Z",
};
interface Check {
  run_id: string; kind: string; status: string; created_at: string; ended_at: string | null;
  outcome: string | null; headline: string | null; answer: string | null; step: string | null; failure: string | null;
}
const checks: Check[] = Array.from({ length: 50 }, (_, i) => ({
  run_id: `run_${i}`, kind: i === 0 ? "manual" : "scheduled", status: i === 0 ? "failed" : "done",
  created_at: "2026-10-08T00:00:00Z", ended_at: "2026-10-08T00:01:00Z",
  outcome: i === 0 ? null : "same", headline: i === 0 ? null : "No change",
  answer: i === 0 ? null : "Policy has not changed", step: null,
  failure: i === 0 ? "upstream error" : null,
}));
interface Call { path: string; method: string; body?: Record<string, unknown>; authorization?: string }
let server: Server;
let client: Qoni;
let calls: Call[];
let responseOverride: { status: number; body?: unknown } | undefined;
let exchangeDenied: boolean;
let checkFixture: Check[];
let firstCheckCompletionAfterReads: number | undefined;
let firstCheckReadCount: number;
let manualCheckStatus: string;
let concurrentCheckBeforeRunNow: boolean;
let replaceLastTaskOnResume: boolean;
let servedCheckStates: Array<{ runId: string; status: string }>;
let currentTrack: Record<string, unknown>;
const finishFirstCheck = () => { checkFixture.find(row => row.run_id === "run_0")!.status = "done"; };
beforeEach(async () => {
  calls = []; responseOverride = undefined; exchangeDenied = false;
  currentTrack = { ...track }; manualCheckStatus = "running"; concurrentCheckBeforeRunNow = false; replaceLastTaskOnResume = false;
  firstCheckReadCount = 0; firstCheckCompletionAfterReads = undefined; servedCheckStates = [];
  checkFixture = [{ ...checks[0], kind: "first_look", status: "running", ended_at: null, failure: null }];
  server = createServer(async (req, res) => {
    const parts = []; for await (const part of req) parts.push(part);
    const raw = Buffer.concat(parts).toString();
    const call = { path: req.url!, method: req.method!, body: raw ? JSON.parse(raw) : undefined, authorization: req.headers.authorization };
    calls.push(call);
    let status = 200; let body: unknown;
    if (call.path === "/api/v3/eak/token-exchange") {
      status = exchangeDenied ? 403 : 200;
      body = exchangeDenied ? { code: "permission_denied", message: "missing track scope" } : { data: { accessToken: product, expiresIn: 3600 } };
    } else if (responseOverride) {
      ({ status, body } = responseOverride);
      if (call.method === "PATCH" && body && typeof body === "object") currentTrack = { ...currentTrack, ...call.body, ...body };
    } else if (call.path === base && call.method === "POST") {
      status = 201; currentTrack = { ...currentTrack, ...call.body };
      body = { ...currentTrack, checking: false, check_count: null };
    } else if (call.path === `${base}/track_1/checks`) {
      firstCheckReadCount++;
      if (firstCheckCompletionAfterReads !== undefined && firstCheckReadCount >= firstCheckCompletionAfterReads) finishFirstCheck();
      servedCheckStates.push(...checkFixture.map(row => ({ runId: row.run_id, status: row.status })));
      body = { items: checkFixture };
    } else if (call.path === `${base}/track_1/run_now`) {
      if (concurrentCheckBeforeRunNow) {
        currentTrack.last_task_id = "run_concurrent";
        checkFixture = [{ ...checks[0], run_id: "run_concurrent", kind: "manual", status: "running", ended_at: null, failure: null }, ...checkFixture];
      }
      if (!["done", "failed", "expired", "canceled"].includes(checkFixture[0]?.status)) {
        status = 409; body = { code: "task_in_progress", detail: "the track's session is still working on an earlier run", extra: {} };
      } else {
        status = 202; body = { track_id: "track_1", session_id: "session_1", run_id: "run_manual" };
        currentTrack.last_task_id = "run_manual";
        checkFixture = [{ ...checks[0], run_id: "run_manual", kind: "manual", status: manualCheckStatus,
          answer: "Policy result", failure: manualCheckStatus === "failed" ? "fixed failure" : null }, ...checkFixture];
      }
    } else if (call.path === `${base}/track_1`) {
      if (call.method === "DELETE") { status = 204; currentTrack.status = "deleted"; }
      else if (currentTrack.status === "deleted") { status = 404; body = { code: "track_not_found", detail: "track not found", extra: {} }; }
      else {
        currentTrack = { ...currentTrack, ...call.body };
        if (replaceLastTaskOnResume && call.body?.status === "active") {
          checkFixture[0].status = "failed"; checkFixture[0].failure = "original first look failure";
          checkFixture = [{ ...checks[1], run_id: "run_new_done", kind: "manual" }, ...checkFixture];
          currentTrack.last_task_id = "run_new_done";
        }
        body = { ...currentTrack, checking: call.method === "GET" && checkFixture.some(row => row.run_id === currentTrack.last_task_id && row.status === "running"), check_count: call.method === "GET" ? checkFixture.length : null };
      }
    } else if (call.path.endsWith("/do_anything/runs/run_0/artifacts")) {
      body = { items: [{ id: "file_1", name: "report.txt", mime_type: "text/plain", size_bytes: 12, created_at: "2026-10-08T00:00:00Z", download_url: "http://fixture.invalid/report.txt", expires_in: 900 }] };
    } else if (call.path.endsWith("/do_anything/artifacts/file_1/blob")) {
      res.writeHead(200, { "content-type": "text/plain" }); res.end("Policy file"); return;
    } else { status = 404; body = { code: "not_found", detail: "No such route" }; }
    res.writeHead(status, { "content-type": "application/json" });
    res.end(status === 204 ? undefined : JSON.stringify(body));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  const host = `http://127.0.0.1:${address.port}`;
  client = new Qoni({ accessKey: "fixture_ak", secretKey: "fixture_sk", host, genauthBaseUrl: host, webAgentBaseUrl: host });
});
afterEach(async () => { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); });
const create = () => client.track.create({ token: product, prompt: "Watch policy", title: "Policy", schedule: interval });
const consume = async (stream: AsyncIterable<unknown>) => { for await (const _ of stream) { /* exhaust */ } };

it("maps prompt to instructions, explicit interval to every_seconds, and roundtrips get/refine", async () => {
  const handle = await create();
  expect(handle.id).toBe("track_1");
  expect(calls[0]).toMatchObject({ path: base, method: "POST", body: { instructions: "Watch policy", title: "Policy", schedule: { every_seconds: 600 } }, authorization: `Bearer ${product}` });
  expect(calls[0].body).not.toHaveProperty("intent");
  const detail = await handle.get();
  expect(detail).toMatchObject({ instructions: "Watch policy", schedule: interval, sessionId: "session_1", checking: true, lastOutcome: null });
  expect(detail).not.toHaveProperty("extracted");
  await handle.refine({ schedule: detail.schedule as typeof interval });
  expect(calls.at(-1)?.body).toEqual({ schedule: { every_seconds: 600 } });
});
it("maps daily at/tz both ways without introducing a default cadence", async () => {
  const schedule = { kind: "daily" as const, at: "09:30", tz: "Asia/Singapore" };
  const h = await client.track.create({ token: product, prompt: "Watch policy", schedule });
  expect(calls[0].body).toEqual({ instructions: "Watch policy", schedule: { daily_at: "09:30", tz: "Asia/Singapore" } });
  responseOverride = { status: 200, body: { ...track, schedule: { daily_at: "09:30", tz: "Asia/Singapore" } } };
  expect((await h.get()).schedule).toEqual(schedule);
  await h.refine({ schedule });
  expect(calls.at(-1)?.body).toEqual({ schedule: { daily_at: "09:30", tz: "Asia/Singapore" } });
});
it("pause/resume PATCH real statuses, runNow returns a task reference, DELETE accepts empty 204", async () => {
  const h = await create();
  expect((await h.pause()).status).toBe("paused");
  expect((await h.resume()).status).toBe("active");
  finishFirstCheck();
  expect(await h.runNow()).toEqual({ trackId: "track_1", sessionId: "session_1", runId: "run_manual" });
  await h.refine({ title: "New title" });
  await h.delete();
  expect(calls.slice(1).map(c => [c.method, c.path, c.body])).toEqual([
    ["PATCH", `${base}/track_1`, { status: "paused" }], ["PATCH", `${base}/track_1`, { status: "active" }],
    ["POST", `${base}/track_1/run_now`, {}], ["PATCH", `${base}/track_1`, { title: "New title" }],
    ["DELETE", `${base}/track_1`, undefined],
  ]);
});
it("slices the recent 50 checks locally and finds run_id exactly without synthesizing snapshot data", async () => {
  const h = await create();
  checkFixture = checks.map(row => ({ ...row }));
  const rows = await h.runs({ limit: 2, offset: 1 });
  expect(rows.map(r => r.id)).toEqual(["run_1", "run_2"]);
  expect(calls.at(-1)?.path).toBe(`${base}/track_1/checks`);
  const row = await h.run("run_0");
  const { run_id, created_at, ended_at, ...rest } = checks[0];
  expect(row).toEqual({ ...rest, id: run_id, runId: run_id, createdAt: created_at, endedAt: ended_at });
  for (const key of ["diffs", "extracted", "snapshotId", "tickN"]) expect(row).not.toHaveProperty(key);
});
it("reports an exact run not found within the recent 50 checks, with no DA fallback", async () => {
  const h = await create();
  await expect(h.run("run_0_extra")).rejects.toMatchObject({ code: "not_found", message: expect.stringMatching(/recent 50 checks/) });
  expect(calls.at(-1)?.path).toBe(`${base}/track_1/checks`);
  expect(calls.some(c => c.path.includes("do_anything"))).toBe(false);
});

const obsolete = ["targetUrls", "extractionSchema", "triggerDsl", "stopConditionDsl", "notifyChannel", "target_urls", "extraction_schema", "trigger_dsl", "stop_condition_dsl", "notify_channel", "url"];
it.each(obsolete)("rejects create legacy %s locally before token exchange", async (key) => {
  await expect(client.track.create({ token: delegation, prompt: "Watch policy", schedule: interval, [key]: null })).rejects.toMatchObject({ code: "unsupported.operation" });
  expect(calls).toEqual([]);
});
it.each([undefined, null, {}, "0 9 * * *", { kind: "interval", intervalSeconds: 599 }, { kind: "interval", intervalSeconds: 2592001 }, { kind: "interval", intervalSeconds: 600.1 }, { kind: "interval", intervalSeconds: NaN }, { kind: "interval", intervalSeconds: true }, { kind: "interval", intervalSeconds: 600, tz: "UTC" }, { kind: "daily", at: "24:00", tz: "UTC" }, { kind: "daily", at: "9:00", tz: "UTC" }, { kind: "daily", at: "09:00" }, { kind: "daily", at: "09:00", tz: "Fake/Zone" }, { kind: "daily", at: "09:00", tz: 1 }, { kind: "weekly", at: "09:00", tz: "UTC" }])("rejects invalid or absent schedule %j before HTTP", async (schedule) => {
  await expect(client.track.create({ token: delegation, prompt: "Watch policy", schedule: schedule as unknown as import("../src").MonitorSchedule })).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toEqual([]);
});
it("explicitly rejects cron with a daily alternative and zero HTTP", async () => {
  await expect(client.track.create({ token: delegation, prompt: "Watch policy", schedule: { kind: "cron", expr: "0 9 * * *" } })).rejects.toMatchObject({ code: "unsupported.operation", message: expect.stringContaining('kind: "daily"') });
  expect(calls).toEqual([]);
});
it.each([600, 2592000])("accepts exact integer interval boundary %s", async (seconds) => {
  await client.track.create({ token: product, prompt: "Watch policy", schedule: { kind: "interval", intervalSeconds: seconds } });
  expect(calls[0].body?.schedule).toEqual({ every_seconds: seconds });
});
it.each(["", "   ", 1, "x".repeat(4001)])("rejects invalid instructions from prompt before HTTP", async (prompt) => {
  await expect(client.track.create({ token: delegation, prompt: prompt as string, schedule: interval })).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toEqual([]);
});
it.each([...obsolete, "instructions", "intent", "prompt", "status"])("refine refuses %s without rewriting original intent", async (key) => {
  const h = await create(); calls.length = 0;
  await expect(h.refine({ [key]: "replacement" })).rejects.toBeInstanceOf(QoniError);
  expect(calls).toEqual([]);
});
it.each([{ limit: -1 }, { offset: -1 }, { limit: 1.1 }, { offset: NaN }])("rejects invalid local pagination %j", async (opts) => {
  const h = await create(); calls.length = 0;
  await expect(h.runs(opts)).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toEqual([]);
});
it("keeps unsupported events/intervene/interactionHandle and snapshot read as local typed failures", async () => {
  const h = await create(); calls.length = 0;
  const card = { id: "i", type: "ask_user", actions: [{ endpoint: "/do_anything/runs/other/intervene", kind: "answer" }] } as unknown as Interaction;
  expect(() => h.interactionHandle(card)).toThrow(QoniUnsupportedError);
  for (const work of [consume(h.events()), consume(client.track.api.events({ token: delegation, monitorId: h.id })), client.track.api.intervene({ token: delegation, monitorId: h.id }), client.doAnything.api.readArtifacts({ token: delegation, sessionId: "s", artifactId: "a" })]) {
    await expect(work).rejects.toMatchObject({ name: "QoniUnsupportedError", code: "unsupported.operation" });
  }
  expect(calls).toEqual([]);
});
it("low-level methods use the real wire contract and retain recent-check pagination", async () => {
  const api = client.track.api;
  const made = await api.createMonitor({ token: product, instructions: "Watch policy", schedule: { every_seconds: 600 } });
  expect(made.data).toMatchObject({ id: "track_1", schedule: { every_seconds: 600 } });
  await api.updateMonitor({ token: product, monitorId: "track_1", status: "paused", instructions: "New instructions" });
  expect(calls.at(-1)?.body).toEqual({ status: "paused", instructions: "New instructions" });
  checkFixture = checks.map(row => ({ ...row }));
  const page = await api.listRuns<{ items: unknown[] }>({ token: product, monitorId: "track_1", limit: 1, offset: 49 });
  expect(page.data.items).toEqual([checks[49]]);
  expect((await api.getRun({ token: product, monitorId: "track_1", runId: "run_0" })).data).toEqual(checks[0]);
});
it("delegation token exchange requests only Track scopes and forwards the product bearer/project", async () => {
  const h = await client.track.create({ token: delegation, prompt: "Watch policy", schedule: interval });
  await h.get(); await h.runs(); await h.run("run_0"); await h.pause(); await h.resume(); await h.refine({ title: "Title" }); finishFirstCheck(); await h.runNow(); await h.delete();
  const scopes = calls.filter(c => c.path.includes("token-exchange")).map(c => c.body?.scopes);
  expect(scopes).toEqual([...["manage", "read", "read", "read", "manage", "manage", "manage", "manage", "manage"].map(s => [`webagent.track:${s}`])]);
  expect(calls.filter(c => !c.path.includes("token-exchange")).every(c => c.authorization === `Bearer ${product}` && c.path.startsWith(base))).toBe(true);
});
it("missing token and denied exchange make no product request", async () => {
  await expect(client.track.api.getMonitor({ monitorId: "track_1" })).rejects.toMatchObject({ code: "delegation.required" });
  expect(calls).toEqual([]);
  exchangeDenied = true;
  await expect(client.track.api.getMonitor({ token: delegation, monitorId: "track_1" })).rejects.toMatchObject({ status: 403 });
  expect(calls.map(c => c.path)).toEqual(["/api/v3/eak/token-exchange"]);
});
it.each([401, 403, 404, 409, 422])("preserves backend status %s without fabricating successful state", async (status) => {
  responseOverride = { status, body: { code: "fixture_failure", detail: "fixed backend failure" } };
  await expect(client.track.attach("track_1", { token: product })).rejects.toMatchObject({ status, code: "fixture_failure" });
  expect(calls).toHaveLength(1);
});
it.each([{}, { id: "" }, { id: 1 }, null])("rejects malformed successful create response %j", async (body) => {
  responseOverride = { status: 201, body };
  await expect(create()).rejects.toBeInstanceOf(QoniValidationError);
});
it("retains the real file artifacts endpoint without labeling a text file as a snapshot", async () => {
  const r = await client.doAnything.api.listArtifacts({ token: product, runId: "run_0" });
  expect(r.data.items[0]).toMatchObject({ id: "file_1", name: "report.txt", mime_type: "text/plain" });
  expect(calls[0].path).toBe("/api/v1/projects/fixture_project/do_anything/runs/run_0/artifacts");
});

it.each(["done", "failed", "expired", "canceled"])("query matrix waits for actual check status %s without Track SSE", async (status) => {
  firstCheckCompletionAfterReads = 1; manualCheckStatus = status;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdk-track-matrix-"));
  try {
    const execution = runQueryMatrixCase({ client, token: product, evidenceDir: dir, item: {
      id: "track-case", title: "Track check", function: "track.create", publicSources: ["https://example.com"],
      input: { prompt: "Watch policy", schedule: interval }, assertions: { expectedText: ["Policy result"] }, timeoutMs: 50,
    } });
    if (status === "done") {
      const result = await execution;
      expect(result.status).toBe("passed");
      expect(result.methods).not.toContain("MonitorHandle.events");
    } else await expect(execution).rejects.toMatchObject({ message: expect.stringContaining(status), queryMatrixResult: { status: "failed" } });
    expect(calls.every(c => !c.path.includes("/events") && !c.path.includes("do_anything"))).toBe(true);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

it("snapshot rejection names the existing doAnything.artifacts alternative, which still reads actual files", async () => {
  await expect(client.doAnything.api.readArtifacts({ token: delegation, sessionId: "s", artifactId: "file_1" })).rejects.toMatchObject({ message: expect.stringContaining("doAnything.artifacts") });
  expect(calls).toEqual([]);
  const files = await client.doAnything.artifacts({ token: delegation, runId: "run_0" });
  expect(files[0]).toMatchObject({ id: "file_1", name: "report.txt", mime: "text/plain", sizeBytes: 12 });
  expect(Buffer.from(await files[0].content()).toString()).toBe("Policy file");
  expect(calls.filter(c => c.path.includes("token-exchange")).map(c => c.body?.scopes)).toEqual([["webagent.do_anything:read"], ["webagent.do_anything:read"]]);
});
it("raw cron input is explicitly unsupported with a daily alternative before token exchange", async () => {
  await expect(client.track.api.createMonitor({ token: delegation, instructions: "Watch", schedule: { kind: "cron", expr: "0 9 * * *" } })).rejects.toMatchObject({ code: "unsupported.operation", message: expect.stringMatching(/daily/) });
  expect(calls).toEqual([]);
});
it.each(obsolete)("raw create rejects legacy %s before HTTP", async key => {
  await expect(client.track.api.createMonitor({ token: delegation, instructions: "Watch", schedule: { every_seconds: 600 }, [key]: null })).rejects.toMatchObject({ code: "unsupported.operation" });
  expect(calls).toEqual([]);
});
it.each([{}, { status: "deleted" }, { schedule: { every_seconds: 600.5 } }, { instructions: "" }, { title: "" }, { action: "pause" }, { schedule: null }])("raw update rejects unsupported/invalid body %j before HTTP", async body => {
  await expect(client.track.api.updateMonitor({ token: delegation, monitorId: "track_1", ...body })).rejects.toBeInstanceOf(QoniError);
  expect(calls).toEqual([]);
});
it.each([{}, { track_id: "track_1", run_id: "r" }, { track_id: "track_1", session_id: "s", run_id: 1 }])("does not fabricate a task reference from malformed run_now response %j", async body => {
  const h = await create(); responseOverride = { status: 202, body };
  await expect(h.runNow()).rejects.toBeInstanceOf(QoniValidationError);
});
it.each([{}, { items: [{}] }, { items: "wrong" }, { items: [{ run_id: "" }] }])("does not turn malformed checks response %j into a successful empty list", async body => {
  const h = await create(); responseOverride = { status: 200, body };
  await expect(h.runs()).rejects.toBeInstanceOf(QoniValidationError);
});
it("runNow surfaces backend task_in_progress 409 and never retries or changes resource", async () => {
  const h = await create(); calls.length = 0;
  await expect(h.runNow()).rejects.toMatchObject({ status: 409, code: "task_in_progress" });
  expect(calls.map(c => c.path)).toEqual([`${base}/track_1/run_now`]);
});
it("zero limit and offset outside the 50-check window are applied locally", async () => {
  const h = await create();
  expect(await h.runs({ limit: 0 })).toEqual([]);
  expect(await h.runs({ offset: 50, limit: 10 })).toEqual([]);
  expect(calls.slice(1).map(c => c.path)).toEqual([`${base}/track_1/checks`, `${base}/track_1/checks`]);
});

it("Track fixture statuses belong to fixed WA TaskStatus and never serialize done as succeeded", async () => {
  const taskStatuses = new Set(["pending", "running", "waiting", "done", "failed", "canceled", "expired"]);
  expect(checks.every(row => taskStatuses.has(row.status))).toBe(true);
  const h = await create();
  checkFixture = [{ ...checks[1], run_id: "run_done", status: "done" }];
  expect((await h.run("run_done")).status).toBe("done");
});

it("query matrix waits for the same first-look lastTaskId before exactly one runNow", async () => {
  firstCheckCompletionAfterReads = 2; manualCheckStatus = "done";
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdk-track-first-look-"));
  try {
    const result = await runQueryMatrixCase({ client, token: product, evidenceDir: dir, item: {
      id: "first-look-case", title: "Wait first look", function: "track.create", publicSources: ["https://example.com"],
      input: { prompt: "Watch policy", schedule: interval }, assertions: { expectedText: ["Policy result"] }, timeoutMs: 2500,
    } });
    expect(result.status).toBe("passed");
    expect(servedCheckStates.filter(row => row.runId === "run_0").map(row => row.status).slice(0, 2)).toEqual(["running", "done"]);
    const manual = calls.filter(c => c.path.endsWith("/run_now"));
    expect(manual).toHaveLength(1);
    const manualAt = calls.indexOf(manual[0]);
    expect(calls.slice(0, manualAt).filter(c => c.path.endsWith("/checks"))).toHaveLength(2);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
it("fixture create starts first look, reports exact create defaults and runNow really returns 409", async () => {
  const made = await client.track.api.createMonitor<Record<string, unknown>>({ token: product, instructions: "Watch policy", schedule: { every_seconds: 600 } });
  expect(made.data).toMatchObject({ last_task_id: "run_0", origin_session_id: null, checking: false, check_count: null });
  const rows = await client.track.api.listRuns<{ items: Check[] }>({ token: product, monitorId: "track_1" });
  expect(rows.data.items[0]).toMatchObject({ run_id: "run_0", kind: "first_look", status: "running" });
  await expect(client.track.api.runNow({ token: product, monitorId: "track_1" })).rejects.toMatchObject({ code: "task_in_progress", status: 409, retryable: false, body: { extra: {} } });
  expect(calls.filter(c => c.path.endsWith("/run_now"))).toHaveLength(1);
});

it.each(["README.md", "README.zh-CN.md", "skills/qoni-sdk/SKILL.md"])("F3 %s Track example executes against a running first look and real 409 fixture", async file => {
  firstCheckCompletionAfterReads = 2; manualCheckStatus = "done";
  const doc = fs.readFileSync(path.join(process.cwd(), file), "utf8");
  const section = file.endsWith("SKILL.md") ? "## Track and deprecated snapshot reads" : "### Track";
  const tail = doc.slice(doc.indexOf(section));
  const nextSection = tail.indexOf(file.endsWith("SKILL.md") ? "\n## " : "\n### ");
  const sectionText = nextSection < 0 ? tail : tail.slice(0, nextSection);
  const sample = sectionText.match(/^[`]{3}ts\n([\s\S]*?)^[`]{3}/m)?.[1];
  expect(sample, "document needs an executable Track sample").toBeTruthy();
  const compiled = ts.transpileModule(sample!, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  await new Function("qoni", "token", "exports", `return (async () => {${compiled}})()`)(client, product, {});
  expect(calls.filter(c => c.path.endsWith("/run_now"))).toHaveLength(1);
  expect(servedCheckStates.filter(row => row.runId === "run_0").map(row => row.status).slice(0, 2)).toEqual(["running", "done"]);
}, 10_000);
it("F4 TrackTaskRef remains assignable to JsonObject", async () => {
  const h = await create(); finishFirstCheck();
  const reference: TrackTaskRef = await h.runNow();
  const record: JsonObject = reference;
  expect(record).toEqual({ trackId: "track_1", sessionId: "session_1", runId: "run_manual" });
});
it.each(["Factory", "posixrules", "localtime"])("F5 read and committed PATCH keep server timezone %s even when Intl rejects it", async tz => {
  const h = await create();
  const schedule = { daily_at: "09:00", tz };
  responseOverride = { status: 200, body: { ...track, schedule } };
  expect((await h.get()).schedule).toEqual({ kind: "daily", at: "09:00", tz });
  responseOverride = { status: 200, body: { ...track, status: "paused", schedule } };
  expect((await h.pause()).schedule).toEqual({ kind: "daily", at: "09:00", tz });
  expect(currentTrack.status).toBe("paused");
  responseOverride = { status: 200, body: { ...track, status: "active", schedule } };
  expect((await h.resume()).schedule).toEqual({ kind: "daily", at: "09:00", tz });
  responseOverride = { status: 200, body: { ...track, title: "Server timezone retained", schedule } };
  expect((await h.refine({ title: "Server timezone retained" })).schedule).toEqual({ kind: "daily", at: "09:00", tz });
  expect(currentTrack.title).toBe("Server timezone retained");
  responseOverride = undefined;
  expect((await h.get()).schedule).toEqual({ kind: "daily", at: "09:00", tz });
  const before = calls.length;
  await expect(h.refine({ schedule: { kind: "daily", at: "09:00", tz } })).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toHaveLength(before); // input validation remains strict before HTTP
});
it("F5 reads known interval shape without imposing SDK write bounds after a committed pause", async () => {
  const h = await create();
  responseOverride = { status: 200, body: { ...track, status: "paused", schedule: { every_seconds: 300 } } };
  expect((await h.pause()).schedule).toEqual({ kind: "interval", intervalSeconds: 300 });
  expect(currentTrack.status).toBe("paused");
  const before = calls.length;
  await expect(h.refine({ schedule: { kind: "interval", intervalSeconds: 300 } })).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toHaveLength(before);
});
it.each([{ weekly_at: "09:00", opaque_field: { user_key: "x" } }, { every_seconds: 600, future_field: true }, { daily_at: "09:00" }, { every_seconds: "600" }, null])("F5 preserves unknown or incomplete response schedule %j without inventing a kind", async schedule => {
  const h = await create();
  responseOverride = { status: 200, body: { ...track, schedule } };
  expect((await h.get()).schedule).toEqual(schedule);
});
it.each(["getMonitor", "runNow", "deleteMonitor"] as const)("F6 api.%s rejects invalid id through a Promise with zero HTTP", async method => {
  let promise: Promise<unknown> | undefined;
  expect(() => { promise = client.track.api[method]({ token: delegation, monitorId: "" }); }).not.toThrow();
  expect(promise).toBeInstanceOf(Promise);
  const settled = await Promise.allSettled([promise!]);
  expect(settled[0]).toMatchObject({ status: "rejected", reason: { name: "QoniValidationError" } });
  expect(calls).toEqual([]);
});
it.each(obsolete)("F7 optional undefined create/refine %s keeps original omission behavior while defined values fail", async key => {
  const h = await client.track.create({ token: product, prompt: "Watch policy", schedule: interval, [key]: undefined });
  expect(calls[0].body).toEqual({ instructions: "Watch policy", schedule: { every_seconds: 600 } });
  await h.refine({ title: "New title", [key]: undefined });
  expect(calls.at(-1)?.body).toEqual({ title: "New title" });
  const before = calls.length;
  await expect(h.refine({ title: "Bad", [key]: null })).rejects.toBeInstanceOf(QoniUnsupportedError);
  expect(calls).toHaveLength(before);
});
it("F7 undefined interval tz is omitted but a specified tz remains invalid", async () => {
  await client.track.create({ token: product, prompt: "Watch policy", schedule: { kind: "interval", intervalSeconds: 600, tz: undefined } as unknown as import("../src").MonitorSchedule });
  expect(calls[0].body?.schedule).toEqual({ every_seconds: 600 });
  const before = calls.length;
  await expect(client.track.create({ token: product, prompt: "Watch policy", schedule: { kind: "interval", intervalSeconds: 600, tz: "UTC" } as unknown as import("../src").MonitorSchedule })).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toHaveLength(before);
});
it("F7 raw optional undefined fields are omitted, required schedule remains required", async () => {
  await client.track.api.createMonitor({ token: product, instructions: "Watch policy", schedule: { every_seconds: 600 }, url: undefined });
  expect(calls[0].body).toEqual({ instructions: "Watch policy", schedule: { every_seconds: 600 } });
  await client.track.api.updateMonitor({ token: product, monitorId: "track_1", title: "New title", targetUrls: undefined });
  expect(calls.at(-1)?.body).toEqual({ title: "New title" });
  const before = calls.length;
  await expect(client.track.create({ token: product, prompt: "Watch policy", schedule: undefined } as unknown as import("../src").TrackCreateOptions)).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toHaveLength(before);
});

it("F7 wire schedules omit undefined optional keys without accepting defined unknown keys", async () => {
  await client.track.api.createMonitor({ token: product, instructions: "Watch", schedule: { every_seconds: 600, tz: undefined } });
  expect(calls[0].body?.schedule).toEqual({ every_seconds: 600 });
  const before = calls.length;
  await expect(client.track.api.createMonitor({ token: product, instructions: "Watch", schedule: { every_seconds: 600, tz: "UTC" } })).rejects.toBeInstanceOf(QoniValidationError);
  expect(calls).toHaveLength(before);
});

it("F2 runner surfaces a real post-wait concurrent 409 with exactly one runNow and no retry", async () => {
  firstCheckCompletionAfterReads = 1; concurrentCheckBeforeRunNow = true;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdk-track-concurrent-"));
  try {
    await expect(runQueryMatrixCase({ client, token: product, evidenceDir: dir, item: {
      id: "concurrent-case", title: "Concurrent check", function: "track.create", publicSources: ["https://example.com"],
      input: { prompt: "Watch policy", schedule: interval }, assertions: {}, timeoutMs: 500,
    } })).rejects.toMatchObject({ code: "task_in_progress", status: 409, queryMatrixResult: { status: "failed" } });
    expect(servedCheckStates.some(row => row.runId === "run_0" && row.status === "done")).toBe(true);
    expect(calls.filter(c => c.path.endsWith("/run_now"))).toHaveLength(1);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// Execute the actual live test body offline, retaining its helpers and assertions.
// Only registration, client/token setup and case discovery are supplied locally;
// no QONI_LIVE_E2E, ignored case files, remote endpoints, or cloud tasks are used.
async function runLiveTrackSuite(file: string) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(process.cwd(), "tests/live-e2e", file), "utf8"), ts.ScriptTarget.ES2022, true);
  const suite = source.statements.find(statement => ts.isExpressionStatement(statement) && ts.isCallExpression(statement.expression) &&
    statement.expression.expression.getText(source) === "describeLiveE2E" && statement.expression.arguments[0]?.getText(source).includes(file === "track.test.ts" ? "Track (semantic surface)" : "track.api"));
  expect(suite, "the actual Track live suite must exist").toBeTruthy();
  const setup: Array<() => Promise<unknown>> = [], teardown: Array<() => Promise<unknown>> = [], cases: Array<() => Promise<unknown>> = [];
  const focusedCase = { input: { prompt: "Watch policy", schedule: interval }, assertions: {}, timeoutMs: 2500 };
  const runtime = {
    describeLiveE2E: (_title: string, body: () => void) => body(),
    beforeAll: (fn: () => Promise<unknown>) => setup.push(fn),
    afterAll: (fn: () => Promise<unknown>) => teardown.push(fn),
    it: (_title: string, fn: () => Promise<unknown>) => cases.push(fn),
    expect, liveClient: () => client, delegateLiveToken: async () => ({ token: product }), trackScopes: [],
    focusedCase, matrix: { runtime: undefined }, timeoutMs: 2500, assertQueryMatrixOutput,
    selectQueryMatrixCase: () => focusedCase,
  };
  const compiled = ts.transpileModule(suite!.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  new Function(...Object.keys(runtime), compiled)(...Object.values(runtime));
  try { for (const fn of setup) await fn(); for (const fn of cases) await fn(); }
  finally { for (const fn of teardown) await fn(); }
}
it("F2 semantic live suite keeps the original first-look id when resumed metadata changes", async () => {
  replaceLastTaskOnResume = true; manualCheckStatus = "done";
  await expect(runLiveTrackSuite("track.test.ts")).rejects.toThrow(/failed|original first look/);
  expect(calls.filter(c => c.path.endsWith("/run_now"))).toHaveLength(0);
});
it.each(["track.test.ts", "wire-api.test.ts"])("F1 F2 actual %s Track live suite runs offline with done and a busy first look", async file => {
  firstCheckCompletionAfterReads = 2; manualCheckStatus = "done";
  await runLiveTrackSuite(file);
  expect(servedCheckStates.filter(row => row.runId === "run_0").map(row => row.status).slice(0, 2)).toEqual(["running", "done"]);
  expect(calls.filter(c => c.path.endsWith("/run_now"))).toHaveLength(1);
}, 10_000);
