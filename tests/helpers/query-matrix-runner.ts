import fs from "node:fs";
import path from "node:path";
import type {
  QoniEvent,
  Qoni,
  JsonObject,
  MonitorHandle,
  TrackCreateOptions,
  RunEvent,
  RunHandle,
  RunImage,
  RunResult,
} from "../../src";
import {
  assertCompleteDoAnythingEvidence,
  createDoAnythingEvidenceRecorder,
} from "./do-anything-evidence";
import type { QueryMatrixCase } from "./query-matrix";

export interface QueryMatrixCaseResult {
  caseId: string;
  title: string;
  function: QueryMatrixCase["function"];
  status: "passed" | "failed";
  resourceId?: string;
  durationMs: number;
  methods: string[];
  evidenceDir: string;
  output?: unknown;
  error?: { name: string; message: string; stack?: string };
}

export async function runQueryMatrixCase(input: {
  client: Qoni;
  token: string;
  item: QueryMatrixCase;
  evidenceDir: string;
}): Promise<QueryMatrixCaseResult> {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const caseDir = path.join(input.evidenceDir, input.item.id);
  fs.mkdirSync(caseDir, { recursive: true });
  writeJson(path.join(caseDir, "case.json"), input.item);

  try {
    const execution = await executeCase(input.client, input.token, input.item, caseDir, startedAt);
    const result: QueryMatrixCaseResult = {
      caseId: input.item.id,
      title: input.item.title,
      function: input.item.function,
      status: "passed",
      resourceId: execution.resourceId,
      durationMs: Date.now() - startedMs,
      methods: execution.methods,
      evidenceDir: caseDir,
      output: execution.output,
    };
    writeJson(path.join(caseDir, "case-result.json"), result);
    return result;
  } catch (error) {
    const details = errorDetails(error);
    const result: QueryMatrixCaseResult = {
      caseId: input.item.id,
      title: input.item.title,
      function: input.item.function,
      status: "failed",
      durationMs: Date.now() - startedMs,
      methods: [],
      evidenceDir: caseDir,
      error: details,
    };
    writeJson(path.join(caseDir, "case-result.json"), result);
    throw Object.assign(error instanceof Error ? error : new Error(String(error)), {
      queryMatrixResult: result,
    });
  }
}

export function assertQueryMatrixOutput(
  item: QueryMatrixCase,
  output: unknown,
  extras: { resultCount?: number } = {},
): void {
  const text = JSON.stringify(output ?? "");
  if (
    item.assertions.minOutputChars !== undefined &&
    text.length < item.assertions.minOutputChars
  ) {
    throw new Error(
      `${item.id}: output has ${text.length} chars, expected at least ${item.assertions.minOutputChars}`,
    );
  }
  for (const expected of item.assertions.expectedText ?? []) {
    if (!text.toLowerCase().includes(expected.toLowerCase())) {
      throw new Error(`${item.id}: output did not contain expected text ${JSON.stringify(expected)}`);
    }
  }
  if (
    item.assertions.minResults !== undefined &&
    (extras.resultCount ?? 0) < item.assertions.minResults
  ) {
    throw new Error(
      `${item.id}: returned ${extras.resultCount ?? 0} results, expected at least ${item.assertions.minResults}`,
    );
  }
  if (item.assertions.requireComplete) {
    const incomplete = findIncompleteDeliverable(output);
    if (incomplete) {
      throw new Error(`${item.id}: partial or incomplete deliverable — ${incomplete}`);
    }
  }
}

function findIncompleteDeliverable(value: unknown, seen = new Set<unknown>()): string | undefined {
  if (!value || typeof value !== "object" || seen.has(value)) return undefined;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findIncompleteDeliverable(item, seen);
      if (nested) return nested;
    }
    return undefined;
  }

  const object = value as JsonObject;
  if (object.isComplete === false || object.is_complete === false) {
    return "is_complete=false";
  }
  const partial = object.partialSections ?? object.partial_sections;
  if (Array.isArray(partial) && partial.length > 0) {
    return partial.map((section) => {
      if (!isRecord(section)) return JSON.stringify(section);
      const id = section.sectionId ?? section.section_id ?? "unknown-section";
      const reason = section.reason ?? "unspecified reason";
      return `${String(id)}: ${String(reason)}`;
    }).join(", ");
  }
  for (const nested of Object.values(object)) {
    const incomplete = findIncompleteDeliverable(nested, seen);
    if (incomplete) return incomplete;
  }
  return undefined;
}

export function searchResultItems(output: unknown): JsonObject[] {
  if (Array.isArray(output)) return output.filter(isRecord);
  if (isRecord(output) && Array.isArray(output.results)) {
    return output.results.filter(isRecord);
  }
  return [];
}

export function assertSuccessfulRun(item: QueryMatrixCase, result: RunResult): void {
  if (result.status === "succeeded" && result.isTaskSuccessful !== false) return;
  const reason = [
    result.terminalReason,
    typeof result.raw.failure_reason === "string" ? result.raw.failure_reason : undefined,
    typeof result.raw.failure_detail === "string" ? result.raw.failure_detail : undefined,
    typeof result.raw.error === "string" ? result.raw.error : undefined,
  ].filter((part): part is string => Boolean(part));
  throw new Error(
    `${item.id}: run ${result.status}${reason.length ? ` — ${reason.join(": ")}` : ""}`,
  );
}

async function executeCase(
  client: Qoni,
  token: string,
  item: QueryMatrixCase,
  caseDir: string,
  startedAt: string,
): Promise<{ resourceId: string; methods: string[]; output: unknown }> {
  switch (item.function) {
    case "doAnything.run":
      return executeDoAnything(client, token, item, caseDir, startedAt);
    case "webSearch.run":
      return executeWebSearch(client, token, item, caseDir);
    case "deepResearch.run":
      return executeDeepResearch(client, token, item, caseDir);
    case "track.create":
      return executeTrack(client, token, item, caseDir);
  }
}

async function executeDoAnything(
  client: Qoni,
  token: string,
  item: QueryMatrixCase,
  caseDir: string,
  startedAt: string,
): Promise<{ resourceId: string; methods: string[]; output: unknown }> {
  const request = item.input as JsonObject & { prompt: string };
  const run = await client.doAnything.run({ token, ...request });
  const recorder = createDoAnythingEvidenceRecorder({
    dir: caseDir,
    runId: run.id,
    prompt: request.prompt,
    request,
    startedAt,
  });
  const methods = ["doAnything.run", "RunHandle.status", "RunHandle.wait"];
  try {
    recorder.recordInitialStatus(await run.status());
    const result = await run.wait({
      timeoutMs: item.timeoutMs,
      onWireEvent: (event) => recorder.recordWireEvent(event),
      onEvent: (event) => recorder.recordSemanticEvent(event),
      onReconnect: (info) => recorder.recordReconnect(info),
      onScreenshot: (image, index) => recorder.recordScreenshot(image, index),
    });
    recorder.recordResult(result);

    if (!run.sessionRef?.sessionId) {
      throw new Error(`${item.id}: Do Anything did not return a reusable session id`);
    }
    recorder.recordRecording(
      (await client.doAnything.api.readRecording({ token, sessionId: run.sessionRef.sessionId })).data,
    );
    methods.push("doAnything.api.readRecording");

    const attached = await client.doAnything.attach(run.id, { token });
    await attached.status();
    methods.push("doAnything.attach");
    await run.cancel("query matrix settled-run cleanup");
    methods.push("RunHandle.cancel");

    const summary = recorder.finalize();
    if (item.assertions.requireBrowserHarness) assertCompleteDoAnythingEvidence(summary);
    if (item.assertions.requireScreenshots && summary.screenshotCount < 1) {
      throw new Error(`${item.id}: expected at least one browser screenshot`);
    }
    assertQueryMatrixOutput(item, result.output);
    return { resourceId: run.id, methods, output: result.output };
  } catch (error) {
    recorder.recordError(error);
    recorder.finalize();
    await run.cancel("query matrix failure cleanup").catch(() => undefined);
    throw error;
  }
}

async function executeWebSearch(
  client: Qoni,
  token: string,
  item: QueryMatrixCase,
  caseDir: string,
): Promise<{ resourceId: string; methods: string[]; output: unknown }> {
  const run = await client.webSearch.run({ token, ...item.input });
  return settleGenericRun({
    item,
    caseDir,
    run,
    methods: ["webSearch.run"],
    attach: (runId) => client.webSearch.attach(runId, { token }),
    resultAssertion(result) {
      const items = searchResultItems(result.output);
      writeJson(path.join(caseDir, "search-results.json"), items);
      assertQueryMatrixOutput(item, result.output, { resultCount: items.length });
    },
  });
}

async function executeDeepResearch(
  client: Qoni,
  token: string,
  item: QueryMatrixCase,
  caseDir: string,
): Promise<{ resourceId: string; methods: string[]; output: unknown }> {
  const run = await client.deepResearch.run({
    token,
    ...(item.input as JsonObject & { prompt: string }),
  });
  return settleGenericRun({
    item,
    caseDir,
    run,
    methods: ["deepResearch.run"],
    attach: (runId) => client.deepResearch.attach(runId, { token }),
    async resultAssertion(result) {
      assertQueryMatrixOutput(item, result.output);
      const artifactsDir = path.join(caseDir, "artifacts");
      fs.mkdirSync(artifactsDir, { recursive: true });
      const index: JsonObject[] = [];
      for (const [artifactIndex, artifact] of result.artifacts.entries()) {
        const filename = `${String(artifactIndex + 1).padStart(2, "0")}-${safeFilename(artifact.name || artifact.id || "artifact")}`;
        const bytes = await artifact.content();
        fs.writeFileSync(path.join(artifactsDir, filename), bytes);
        index.push({
          id: artifact.id,
          name: artifact.name,
          mime: artifact.mime,
          sizeBytes: bytes.byteLength,
          filename,
        });
      }
      writeJson(path.join(artifactsDir, "index.json"), index);
    },
  });
}

async function settleGenericRun(input: {
  item: QueryMatrixCase;
  caseDir: string;
  run: RunHandle;
  methods: string[];
  attach: (runId: string) => Promise<RunHandle>;
  resultAssertion: (result: RunResult) => void | Promise<void>;
}): Promise<{ resourceId: string; methods: string[]; output: unknown }> {
  const evidence = createGenericRunEvidence(input.caseDir);
  try {
    writeJson(path.join(input.caseDir, "status.initial.json"), await input.run.status());
    input.methods.push("RunHandle.status", "RunHandle.wait");
    const result = await input.run.wait({
      timeoutMs: input.item.timeoutMs,
      onWireEvent: evidence.recordWire,
      onEvent: evidence.recordSemantic,
      onScreenshot: evidence.recordScreenshot,
    });
    writeSerializableResult(path.join(input.caseDir, "result.json"), result);
    assertSuccessfulRun(input.item, result);
    await input.resultAssertion(result);
    const attached = await input.attach(input.run.id);
    await attached.status();
    input.methods.push(`${input.item.function.split(".")[0]}.attach`, "RunHandle.cancel");
    await input.run.cancel("query matrix settled-run cleanup");
    writeJson(path.join(input.caseDir, "metrics.json"), evidence.metrics());
    return { resourceId: input.run.id, methods: input.methods, output: result.output };
  } catch (error) {
    writeJson(path.join(input.caseDir, "error.json"), errorDetails(error));
    writeJson(path.join(input.caseDir, "metrics.json"), evidence.metrics());
    await input.run.cancel("query matrix failure cleanup").catch(() => undefined);
    throw error;
  }
}

async function executeTrack(
  client: Qoni,
  token: string,
  item: QueryMatrixCase,
  caseDir: string,
): Promise<{ resourceId: string; methods: string[]; output: unknown }> {
  const monitor = await client.track.create({
    token,
    ...(item.input as Omit<TrackCreateOptions, "token">),
  } as TrackCreateOptions);
  const methods = ["track.create"];
  let deleted = false;
  try {
    const initial = await monitor.get();
    writeJson(path.join(caseDir, "monitor.initial.json"), initial);
    methods.push("MonitorHandle.get");

    const attached = await client.track.attach(monitor.id, { token });
    await attached.get();
    methods.push("track.attach");

    const firstRunId = initial.lastTaskId;
    if (typeof firstRunId !== "string" || !firstRunId) throw new Error("Track initial response did not contain lastTaskId");
    const firstLook = await waitForTrackRun(monitor, firstRunId, item.timeoutMs ?? 180_000);
    writeJson(path.join(caseDir, "first-look.json"), firstLook);
    const triggered = await monitor.runNow();
    writeJson(path.join(caseDir, "run-now.json"), triggered);
    methods.push("MonitorHandle.runNow");

    const triggeredRunId = typeof triggered.runId === "string" ? triggered.runId : undefined;
    if (!triggeredRunId) throw new Error("Track runNow response did not contain runId");
    await waitForTrackRun(monitor, triggeredRunId, item.timeoutMs ?? 180_000);
    const runs = await monitor.runs({ limit: 10 });
    writeJson(path.join(caseDir, "runs.json"), runs);
    methods.push("MonitorHandle.runs");
    const detail = await monitor.run(triggeredRunId);
    methods.push("MonitorHandle.run");
    writeJson(path.join(caseDir, "run-detail.json"), detail);
    if (detail.status !== "done") throw new Error(`Track check ${triggeredRunId} ${String(detail.status)}: ${String(detail.failure ?? "no failure detail")}`);
    assertQueryMatrixOutput(item, detail);

    await monitor.delete();
    deleted = true;
    methods.push("MonitorHandle.delete");
    return { resourceId: monitor.id, methods, output: detail };
  } finally {
    if (!deleted) await monitor.delete().catch(() => undefined);
  }
}

function createGenericRunEvidence(dir: string): {
  recordWire(event: QoniEvent<unknown>): void;
  recordSemantic(event: RunEvent): void;
  recordScreenshot(image: RunImage, index: number): void;
  metrics(): JsonObject;
} {
  const rawFile = path.join(dir, "events.raw.jsonl");
  const semanticFile = path.join(dir, "events.semantic.jsonl");
  const screenshotsDir = path.join(dir, "screenshots");
  fs.writeFileSync(rawFile, "");
  fs.writeFileSync(semanticFile, "");
  fs.mkdirSync(screenshotsDir, { recursive: true });
  let rawEventCount = 0;
  let semanticEventCount = 0;
  let screenshotCount = 0;
  return {
    recordWire(event) {
      rawEventCount++;
      appendJsonLine(rawFile, { receivedAt: new Date().toISOString(), ...event });
    },
    recordSemantic(event) {
      semanticEventCount++;
      appendJsonLine(semanticFile, {
        runId: event.runId,
        at: event.at,
        type: event.type,
        data: event.data,
        isTerminal: event.isTerminal,
        rawEventId: event.raw.id,
      });
    },
    recordScreenshot(image, index) {
      screenshotCount++;
      fs.writeFileSync(
        path.join(screenshotsDir, `${String(index + 1).padStart(4, "0")}.${imageExtension(image.mime)}`),
        image.bytes,
      );
    },
    metrics: () => ({ rawEventCount, semanticEventCount, screenshotCount }),
  };
}

async function waitForTrackRun(
  monitor: MonitorHandle,
  runId: string,
  timeoutMs: number,
): Promise<JsonObject> {
  const deadline = Date.now() + timeoutMs;
  do {
    const runs = await monitor.runs();
    const target = findTrackRun(runs, runId);
    if (target && isTerminalTrackRun(target)) return target;
    await new Promise((resolve) => setTimeout(resolve, Math.min(1_000, Math.max(0, deadline - Date.now()))));
  } while (Date.now() < deadline);
  throw new Error(`Track run ${runId} did not reach a terminal state within ${timeoutMs} ms`);
}

export function findTrackRun(runs: JsonObject[], runId: string): JsonObject | undefined {
  return runs.find((run) => run.id === runId);
}

function isTerminalTrackRun(run: JsonObject): boolean {
  return ["done", "failed", "expired", "canceled"].includes(String(run.status));
}

function writeSerializableResult(file: string, result: RunResult): void {
  writeJson(file, {
    ...result,
    artifacts: result.artifacts.map(({ content: _content, ...metadata }) => metadata),
  });
}

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function safeFilename(value: string): string {
  const safe = value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (safe || "artifact").slice(0, 100);
}

function imageExtension(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function errorDetails(error: unknown): { name: string; message: string; stack?: string } {
  if (!(error instanceof Error)) return { name: "Error", message: String(error) };
  return { name: error.name, message: error.message, stack: error.stack };
}

function appendJsonLine(file: string, value: unknown): void {
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`);
}

function writeJson(file: string, value: unknown): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
