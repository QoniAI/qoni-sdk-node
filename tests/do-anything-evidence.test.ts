import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { EAKEvent, RunEvent, RunResult, RunStatus } from "../src";
import {
  assertCompleteDoAnythingEvidence,
  createDoAnythingEvidenceRecorder,
} from "./helpers/do-anything-evidence";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const dir of temporaryDirectories.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("Do Anything live evidence recorder", () => {
  it("writes the full SDK invocation, wire trace, semantic trace, screenshots and metrics", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eak-do-anything-evidence-"));
    temporaryDirectories.push(dir);
    const recorder = createDoAnythingEvidenceRecorder({
      dir,
      runId: "run_1",
      prompt: "Configured public browser task",
      request: {
        capture: { screenshots: true },
        limits: { maxDurationMinutes: 5 },
        token: "must-never-be-serialized",
      },
      startedAt: "2026-08-14T01:00:00.000Z",
    });

    const events = [
      wire(1, "run.message", {
        message_id: "message_1",
        role: "ai",
        text: "I will inspect the page.",
        type: "assistant_message",
        model: "kimi-k2.5",
        input_tokens: 100,
        output_tokens: 20,
        total_tokens: 120,
      }),
      wire(2, "run.action.started", {
        action_id: "write_1",
        kind: "agent_core.write",
        label: "write",
        params: {
          path: "browser-tools/task.py",
          content: "from agent_helpers import get_browser\n",
        },
      }),
      wire(3, "run.action.completed", {
        action_id: "write_1",
        kind: "agent_core.write",
        label: "write",
        params: { path: "browser-tools/task.py" },
        result: { ok: true, summary: "wrote browser script" },
      }),
      wire(4, "run.action.started", {
        action_id: "bash_1",
        kind: "agent_core.bash",
        label: "bash",
        params: { command: "browser-harness run browser-tools/task.py" },
      }),
      wire(5, "run.action.completed", {
        action_id: "bash_1",
        kind: "agent_core.bash",
        label: "bash",
        params: { command: "browser-harness run browser-tools/task.py" },
        result: {
          ok: true,
          summary: "browser script completed",
          browser_script: { path: "browser-tools/task.py", sha256: "abc123" },
        },
      }),
      wire(6, "run.screenshot", {
        artifact_id: "shot_1",
        page_url: "https://public-source.invalid/result",
        step: 1,
      }),
      wire(7, "run.completed", {
        terminal_reason: "done",
        is_task_successful: true,
        output: "Configured public result",
      }),
    ];
    for (const event of events) recorder.recordWireEvent(event);

    recorder.recordSemanticEvent(semanticMessage(events[0]));
    recorder.recordSemanticEvent(semanticDone(events[6]));
    recorder.recordScreenshot(
      {
        bytes: new Uint8Array(Buffer.from("jpeg-bytes")),
        mime: "image/jpeg",
        pageUrl: "https://public-source.invalid/result",
        step: 1,
      },
      0,
    );
    recorder.recordInitialStatus(status("running"));
    recorder.recordResult(result());
    recorder.recordRecording({ session_id: "sess_1", frames: 1 });
    const summary = recorder.finalize("2026-08-14T01:00:10.000Z");

    expect(summary).toMatchObject({
      runId: "run_1",
      durationMs: 10_000,
      rawEventCount: 7,
      semanticEventCount: 2,
      assistantMessageCount: 1,
      toolCallCount: 2,
      toolResultCount: 2,
      failedToolCount: 0,
      browserHarnessAuthoringCount: 1,
      browserHarnessExecutionCount: 1,
      screenshotCount: 1,
      stepCount: 2,
      inputTokens: 100,
      outputTokens: 20,
      totalTokens: 120,
      totalCostUsd: "0.42",
      terminalStatus: "succeeded",
    });
    expect(summary.toolPairsComplete).toBe(true);
    expect(summary.models).toEqual(["kimi-k2.5"]);
    expect(summary.wireEventTypes).toMatchObject({
      "run.action.started": 2,
      "run.action.completed": 2,
      "run.message": 1,
      "run.screenshot": 1,
      "run.completed": 1,
    });
    expect(fs.existsSync(path.join(dir, "events.raw.jsonl"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "events.semantic.jsonl"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "screenshots", "0001.jpg"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "result.json"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "recording.json"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "metrics.json"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "agent-messages.json"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "tools.json"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "browser-harness.json"))).toBe(true);

    const invocation = JSON.parse(fs.readFileSync(path.join(dir, "invocation.json"), "utf8"));
    expect(invocation.prompt).toBe("Configured public browser task");
    expect(invocation.request.capture).toEqual({ screenshots: true });
    expect(invocation.request).not.toHaveProperty("token");
    expect(fs.readFileSync(path.join(dir, "events.raw.jsonl"), "utf8")).toContain(
      "browser-harness run browser-tools/task.py",
    );
    const messages = JSON.parse(fs.readFileSync(path.join(dir, "agent-messages.json"), "utf8"));
    expect(messages).toMatchObject([
      { role: "ai", text: "I will inspect the page.", model: "kimi-k2.5" },
    ]);
    const tools = JSON.parse(fs.readFileSync(path.join(dir, "tools.json"), "utf8"));
    expect(tools).toHaveLength(2);
    expect(tools[0]).toMatchObject({
      actionId: "write_1",
      kind: "agent_core.write",
      params: { path: "browser-tools/task.py" },
      outcome: "completed",
    });
    expect(tools[1]).toMatchObject({
      actionId: "bash_1",
      kind: "agent_core.bash",
      params: { command: "browser-harness run browser-tools/task.py" },
      outcome: "completed",
    });
    const harness = JSON.parse(fs.readFileSync(path.join(dir, "browser-harness.json"), "utf8"));
    expect(harness.authoring[0]).toMatchObject({
      actionId: "write_1",
      path: "browser-tools/task.py",
      code: "from agent_helpers import get_browser\n",
    });
    expect(harness.executions[0]).toMatchObject({
      actionId: "bash_1",
      command: "browser-harness run browser-tools/task.py",
      result: { browser_script: { path: "browser-tools/task.py" } },
    });
    expect(() => assertCompleteDoAnythingEvidence(summary)).not.toThrow();
  });

  it("rejects evidence that cannot prove Browser Harness authoring and execution", () => {
    expect(() =>
      assertCompleteDoAnythingEvidence({
        runId: "run_1",
        terminalStatus: "succeeded",
        rawEventCount: 3,
        semanticEventCount: 2,
        assistantMessageCount: 1,
        llmCallCount: 0,
        toolCallCount: 1,
        toolResultCount: 1,
        failedToolCount: 0,
        toolPairsComplete: true,
        browserHarnessAuthoringCount: 0,
        browserHarnessExecutionCount: 0,
        screenshotCount: 1,
        reconnectCount: 0,
        durationMs: 1_000,
        timeToFirstMessageMs: 100,
        timeToFirstToolCallMs: 200,
        timeToFirstScreenshotMs: 500,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        totalTokens: 0,
        models: [],
        wireEventTypes: {},
        semanticEventTypes: {},
        hasFinalOutput: true,
        initialStatusPresent: true,
        recordingPresent: true,
      }),
    ).toThrow(/Browser Harness script authoring/i);
  });

  it("preserves Browser Harness authoring when the backend redacts the local path", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eak-do-anything-redacted-path-"));
    temporaryDirectories.push(dir);
    const recorder = createDoAnythingEvidenceRecorder({
      dir,
      runId: "run_redacted_path",
      prompt: "Configured public browser task",
      request: { capture: { screenshots: true } },
      startedAt: "2026-08-14T01:00:00.000Z",
    });

    recorder.recordWireEvent(wire(1, "run.action.started", {
      action_id: "write_redacted",
      kind: "agent_core.write",
      label: "write",
      params: {
        path: "[LOCAL_PATH]",
        content: "from agent_helpers import get_browser\n",
      },
    }));
    const summary = recorder.finalize("2026-08-14T01:00:01.000Z");

    expect(summary.browserHarnessAuthoringCount).toBe(1);
    const harness = JSON.parse(fs.readFileSync(path.join(dir, "browser-harness.json"), "utf8"));
    expect(harness.authoring).toEqual([
      {
        actionId: "write_redacted",
        path: "[LOCAL_PATH]",
        pathRedacted: true,
        code: "from agent_helpers import get_browser\n",
      },
    ]);
  });

  it("preserves the original failure details for partial live evidence", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eak-do-anything-error-"));
    temporaryDirectories.push(dir);
    const recorder = createDoAnythingEvidenceRecorder({
      dir,
      runId: "run_failed",
      prompt: "Open the site.",
      request: { capture: { screenshots: true } },
      startedAt: "2026-08-14T01:00:00.000Z",
    });
    recorder.recordError(new Error("backend unavailable", { cause: new Error("ECONNRESET") }));
    recorder.finalize("2026-08-14T01:00:01.000Z");

    const error = JSON.parse(fs.readFileSync(path.join(dir, "error.json"), "utf8"));
    expect(error).toMatchObject({
      name: "Error",
      message: "backend unavailable",
      cause: { name: "Error", message: "ECONNRESET" },
    });
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
    expect(manifest.files.error).toBe("error.json");
  });
});

function wire(id: number, type: string, data: Record<string, unknown>): EAKEvent<unknown> {
  return {
    id: String(id),
    data: {
      id: String(id),
      type,
      task_id: "run_1",
      session_id: "sess_1",
      occurred_at: `2026-08-14T01:00:0${id}.000Z`,
      data,
    },
  };
}

function semanticMessage(raw: EAKEvent<unknown>): RunEvent {
  return {
    runId: "run_1",
    at: "2026-08-14T01:00:01.000Z",
    raw,
    type: "message",
    data: { role: "ai", text: "I will inspect the page." },
    isTerminal: false,
  };
}

function semanticDone(raw: EAKEvent<unknown>): RunEvent {
  return {
    runId: "run_1",
    at: "2026-08-14T01:00:07.000Z",
    raw,
    type: "done",
    data: {
      output: "Universally unique identifier",
      succeeded: true,
      terminalReason: "done",
    },
    isTerminal: true,
  };
}

function status(value: string): RunStatus {
  return { id: "run_1", status: value, sessionId: "sess_1", raw: { status: value } };
}

function result(): RunResult {
  return {
    runId: "run_1",
    status: "succeeded",
    output: "Universally unique identifier",
    artifacts: [],
    terminalReason: "done",
    isTaskSuccessful: true,
    raw: {
      status: "succeeded",
      output: "Universally unique identifier",
      step_count: 2,
      total_cost_usd: "0.42",
    },
  };
}
