import fs from "node:fs";
import path from "node:path";
import type {
  EAKEvent,
  JsonObject,
  RunEvent,
  RunImage,
  RunReconnectInfo,
  RunResult,
  RunStatus,
} from "../../src";

export interface DoAnythingEvidenceSummary {
  runId: string;
  terminalStatus: string;
  rawEventCount: number;
  semanticEventCount: number;
  assistantMessageCount: number;
  llmCallCount: number;
  toolCallCount: number;
  toolResultCount: number;
  failedToolCount: number;
  toolPairsComplete: boolean;
  browserHarnessAuthoringCount: number;
  browserHarnessExecutionCount: number;
  screenshotCount: number;
  reconnectCount: number;
  stepCount?: number;
  durationMs: number;
  timeToFirstMessageMs?: number;
  timeToFirstToolCallMs?: number;
  timeToFirstScreenshotMs?: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  totalCostUsd?: string;
  models: string[];
  wireEventTypes: Record<string, number>;
  semanticEventTypes: Record<string, number>;
  hasFinalOutput: boolean;
  initialStatusPresent: boolean;
  recordingPresent: boolean;
}

export interface DoAnythingEvidenceRecorder {
  readonly dir: string;
  recordWireEvent(event: EAKEvent<unknown>): void;
  recordSemanticEvent(event: RunEvent): void;
  recordReconnect(info: RunReconnectInfo): void;
  recordScreenshot(image: RunImage, index: number): void;
  recordInitialStatus(status: RunStatus): void;
  recordResult(result: RunResult): void;
  recordRecording(recording: unknown): void;
  recordError(error: unknown): void;
  finalize(endedAt?: string): DoAnythingEvidenceSummary;
}

export function createDoAnythingEvidenceRecorder(input: {
  dir: string;
  runId: string;
  prompt: string;
  request: Record<string, unknown>;
  startedAt?: string;
}): DoAnythingEvidenceRecorder {
  const startedAt = input.startedAt || new Date().toISOString();
  const startedMs = Date.parse(startedAt);
  const screenshotsDir = path.join(input.dir, "screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });
  const rawFile = path.join(input.dir, "events.raw.jsonl");
  const semanticFile = path.join(input.dir, "events.semantic.jsonl");
  const reconnectFile = path.join(input.dir, "reconnects.jsonl");
  fs.writeFileSync(rawFile, "");
  fs.writeFileSync(semanticFile, "");
  fs.writeFileSync(reconnectFile, "");
  fs.writeFileSync(path.join(input.dir, "screenshots.jsonl"), "");
  writeJson(path.join(input.dir, "invocation.json"), {
    schemaVersion: 1,
    runId: input.runId,
    prompt: input.prompt,
    request: withoutSecretFields(input.request),
    startedAt,
  });

  const wireEventTypes: Record<string, number> = {};
  const semanticEventTypes: Record<string, number> = {};
  const activeTools = new Set<string>();
  const models = new Set<string>();
  const messages: JsonObject[] = [];
  const tools: JsonObject[] = [];
  const toolById = new Map<string, JsonObject>();
  const authoring: JsonObject[] = [];
  const executions: JsonObject[] = [];
  const executionById = new Map<string, JsonObject>();
  let rawEventCount = 0;
  let semanticEventCount = 0;
  let assistantMessageCount = 0;
  let llmCallCount = 0;
  let toolCallCount = 0;
  let toolResultCount = 0;
  let failedToolCount = 0;
  let browserHarnessAuthoringCount = 0;
  let browserHarnessExecutionCount = 0;
  let screenshotCount = 0;
  let reconnectCount = 0;
  let stepCount: number | undefined;
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;
  let cacheWriteTokens = 0;
  let totalTokens = 0;
  let totalCostUsd: string | undefined;
  let timeToFirstMessageMs: number | undefined;
  let timeToFirstToolCallMs: number | undefined;
  let timeToFirstScreenshotMs: number | undefined;
  let terminalStatus = "";
  let hasFinalOutput = false;
  let initialStatusPresent = false;
  let recordingPresent = false;

  return {
    dir: input.dir,
    recordWireEvent(event) {
      rawEventCount++;
      appendJsonLine(rawFile, { receivedAt: new Date().toISOString(), ...event });
      const envelope = asRecord(event.data);
      const type = event.event || text(envelope.type) || "unknown";
      const payload = asRecord(envelope.data);
      wireEventTypes[type] = (wireEventTypes[type] || 0) + 1;
      const elapsed = elapsedFrom(startedMs, text(envelope.occurred_at));

      if (type === "run.message" && isAssistantRole(payload.role)) {
        assistantMessageCount++;
        messages.push(payload);
        if (timeToFirstMessageMs === undefined) timeToFirstMessageMs = elapsed;
        if (text(payload.llm_call_id)) llmCallCount++;
        const model = text(payload.model);
        if (model) models.add(model);
        inputTokens += nonNegativeInt(payload.input_tokens);
        outputTokens += nonNegativeInt(payload.output_tokens);
        cacheReadTokens += nonNegativeInt(payload.cache_read_tokens);
        cacheWriteTokens += nonNegativeInt(payload.cache_write_tokens);
        totalTokens += nonNegativeInt(payload.total_tokens);
      }
      if (type === "run.cost_update" && typeof payload.total_cost_usd === "string") {
        totalCostUsd = payload.total_cost_usd;
      }
      if (type === "run.action.started") {
        toolCallCount++;
        if (timeToFirstToolCallMs === undefined) timeToFirstToolCallMs = elapsed;
        const actionId = text(payload.action_id);
        if (actionId) activeTools.add(actionId);
        const tool: JsonObject = {
          actionId,
          kind: payload.kind,
          label: payload.label,
          params: payload.params,
          startedAt: envelope.occurred_at,
          outcome: "running",
        };
        tools.push(tool);
        if (actionId) toolById.set(actionId, tool);
        const authored = browserHarnessAuthoring(payload);
        if (authored) {
          browserHarnessAuthoringCount++;
          authoring.push({ actionId, ...authored });
        }
        const command = browserHarnessExecutionCommand(payload);
        if (command) {
          browserHarnessExecutionCount++;
          const execution: JsonObject = { actionId, command };
          executions.push(execution);
          if (actionId) executionById.set(actionId, execution);
        }
      }
      if (type === "run.action.completed" || type === "run.action.failed") {
        toolResultCount++;
        const actionId = text(payload.action_id);
        if (actionId) activeTools.delete(actionId);
        if (type === "run.action.failed") failedToolCount++;
        const tool = toolById.get(actionId);
        if (tool) {
          tool.outcome = type === "run.action.completed" ? "completed" : "failed";
          tool.finishedAt = envelope.occurred_at;
          if (type === "run.action.completed") tool.result = payload.result;
          else tool.error = payload.error;
        }
        const execution = executionById.get(actionId);
        if (execution) {
          if (type === "run.action.completed") execution.result = payload.result;
          else execution.error = payload.error;
        }
      }
    },
    recordSemanticEvent(event) {
      semanticEventCount++;
      semanticEventTypes[event.type] = (semanticEventTypes[event.type] || 0) + 1;
      appendJsonLine(semanticFile, serializableSemanticEvent(event));
    },
    recordReconnect(info) {
      reconnectCount++;
      appendJsonLine(reconnectFile, {
        at: new Date().toISOString(),
        attempt: info.attempt,
        lastEventId: info.lastEventId,
        error: errorSummary(info.error),
      });
    },
    recordScreenshot(image, index) {
      screenshotCount++;
      if (timeToFirstScreenshotMs === undefined) {
        timeToFirstScreenshotMs = Math.max(0, Date.now() - startedMs);
      }
      const filename = `${String(index + 1).padStart(4, "0")}.${imageExtension(image.mime)}`;
      fs.writeFileSync(path.join(screenshotsDir, filename), image.bytes);
      appendJsonLine(path.join(input.dir, "screenshots.jsonl"), {
        index,
        filename,
        mime: image.mime,
        byteLength: image.bytes.byteLength,
        pageUrl: image.pageUrl,
        step: image.step,
      });
    },
    recordInitialStatus(status) {
      initialStatusPresent = true;
      writeJson(path.join(input.dir, "status.initial.json"), status);
    },
    recordResult(result) {
      terminalStatus = result.status;
      hasFinalOutput = hasContent(result.output);
      stepCount = optionalNonNegativeInt(result.raw.step_count);
      if (totalCostUsd === undefined) {
        totalCostUsd = optionalDecimal(result.raw.total_cost_usd);
      }
      writeJson(path.join(input.dir, "result.json"), {
        ...result,
        artifacts: result.artifacts.map(({ content: _content, ...metadata }) => metadata),
      });
    },
    recordRecording(recording) {
      recordingPresent = recording !== undefined && recording !== null;
      writeJson(path.join(input.dir, "recording.json"), recording);
    },
    recordError(error) {
      writeJson(path.join(input.dir, "error.json"), errorDetails(error));
    },
    finalize(endedAt = new Date().toISOString()) {
      const summary: DoAnythingEvidenceSummary = {
        runId: input.runId,
        terminalStatus,
        rawEventCount,
        semanticEventCount,
        assistantMessageCount,
        llmCallCount,
        toolCallCount,
        toolResultCount,
        failedToolCount,
        toolPairsComplete: activeTools.size === 0 && toolCallCount === toolResultCount,
        browserHarnessAuthoringCount,
        browserHarnessExecutionCount,
        screenshotCount,
        reconnectCount,
        stepCount,
        durationMs: Math.max(0, Date.parse(endedAt) - startedMs),
        timeToFirstMessageMs,
        timeToFirstToolCallMs,
        timeToFirstScreenshotMs,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        cacheWriteTokens,
        totalTokens,
        totalCostUsd,
        models: [...models].sort(),
        wireEventTypes,
        semanticEventTypes,
        hasFinalOutput,
        initialStatusPresent,
        recordingPresent,
      };
      writeJson(path.join(input.dir, "metrics.json"), summary);
      writeJson(path.join(input.dir, "agent-messages.json"), messages);
      writeJson(path.join(input.dir, "tools.json"), tools);
      writeJson(path.join(input.dir, "browser-harness.json"), { authoring, executions });
      writeJson(path.join(input.dir, "manifest.json"), {
        schemaVersion: 1,
        runId: input.runId,
        startedAt,
        endedAt,
        files: {
          invocation: "invocation.json",
          rawEvents: "events.raw.jsonl",
          semanticEvents: "events.semantic.jsonl",
          reconnects: "reconnects.jsonl",
          screenshots: "screenshots/",
          screenshotIndex: "screenshots.jsonl",
          initialStatus: "status.initial.json",
          result: "result.json",
          recording: "recording.json",
          error: fs.existsSync(path.join(input.dir, "error.json")) ? "error.json" : null,
          metrics: "metrics.json",
          agentMessages: "agent-messages.json",
          tools: "tools.json",
          browserHarness: "browser-harness.json",
        },
      });
      return summary;
    },
  };
}

export function assertCompleteDoAnythingEvidence(summary: DoAnythingEvidenceSummary): void {
  const missing: string[] = [];
  if (summary.terminalStatus !== "succeeded") missing.push("successful terminal result");
  if (!summary.hasFinalOutput) missing.push("final Agent output");
  if (!summary.initialStatusPresent) missing.push("initial run status");
  if (!summary.recordingPresent) missing.push("session recording");
  if (summary.rawEventCount < 1) missing.push("raw SSE events");
  if (summary.semanticEventCount < 1) missing.push("semantic SDK events");
  if (summary.assistantMessageCount < 1) missing.push("Agent messages");
  if (summary.toolCallCount < 1) missing.push("tool calls");
  if (summary.toolResultCount < 1) missing.push("tool results");
  if (!summary.toolPairsComplete) missing.push("paired tool call/results");
  if (summary.failedToolCount > 0) missing.push("zero failed tools");
  if (summary.browserHarnessAuthoringCount < 1) missing.push("Browser Harness script authoring");
  if (summary.browserHarnessExecutionCount < 1) missing.push("Browser Harness script execution");
  if (summary.screenshotCount < 1) missing.push("decoded browser screenshots");
  if (missing.length) {
    throw new Error(`Do Anything E2E evidence is incomplete: ${missing.join(", ")}`);
  }
}

function browserHarnessAuthoring(payload: JsonObject): JsonObject | undefined {
  const kind = text(payload.kind).toLowerCase();
  const params = asRecord(payload.params);
  const file = text(params.path || params.file_path || params.filePath);
  if (!(
    (kind.endsWith(".write") || kind.endsWith(".write_file")) &&
    /^browser-tools\/[A-Za-z][A-Za-z0-9_-]{0,63}\.py$/.test(file) &&
    typeof params.content === "string" &&
    params.content.length > 0
  )) return undefined;
  return { path: file, code: params.content };
}

function browserHarnessExecutionCommand(payload: JsonObject): string | undefined {
  const command = text(asRecord(payload.params).command);
  return /\bbrowser-harness\s+run\s+browser-tools\/[A-Za-z][A-Za-z0-9_-]{0,63}\.py\b/.test(command)
    ? command
    : undefined;
}

function serializableSemanticEvent(event: RunEvent): Record<string, unknown> {
  const base = {
    runId: event.runId,
    at: event.at,
    type: event.type,
    data: event.data,
    isTerminal: event.isTerminal,
    rawEventId: event.raw.id,
  };
  if (event.type !== "screenshot") return base;
  return {
    ...base,
    image: {
      mime: event.image.mime,
      byteLength: event.image.bytes.byteLength,
      pageUrl: event.image.pageUrl,
      step: event.image.step,
    },
  };
}

function withoutSecretFields(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (/^(?:token|authorization|accessKey|secretKey|password)$/i.test(key)) continue;
    out[key] = item;
  }
  return out;
}

function asRecord(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nonNegativeInt(value: unknown): number {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : 0;
}

function optionalNonNegativeInt(value: unknown): number | undefined {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : undefined;
}

function optionalDecimal(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  return typeof value === "number" && Number.isFinite(value) ? String(value) : undefined;
}

function hasContent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function isAssistantRole(value: unknown): boolean {
  return value === "ai" || value === "assistant";
}

function elapsedFrom(startedMs: number, occurredAt?: string): number {
  const occurredMs = occurredAt ? Date.parse(occurredAt) : Number.NaN;
  return Number.isFinite(occurredMs)
    ? Math.max(0, occurredMs - startedMs)
    : Math.max(0, Date.now() - startedMs);
}

function imageExtension(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function errorSummary(error: unknown): Record<string, unknown> {
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { message: String(error) };
}

function errorDetails(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { value: error };
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...("cause" in error && error.cause !== undefined ? { cause: errorDetails(error.cause) } : {}),
  };
}

function appendJsonLine(file: string, value: unknown): void {
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`);
}

function writeJson(file: string, value: unknown): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
