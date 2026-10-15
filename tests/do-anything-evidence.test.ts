import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import type { QoniEvent, RunEvent, RunResult, RunStatus } from "../src";
import { Qoni, QoniValidationError } from "../src";
import type { DoAnythingControlResponse } from "../src";
import { normalizeInteraction } from "../src/interactions";
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
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qoni-do-anything-evidence-"));
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
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qoni-do-anything-redacted-path-"));
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
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qoni-do-anything-error-"));
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

function wire(id: number, type: string, data: Record<string, unknown>): QoniEvent<unknown> {
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

function semanticMessage(raw: QoniEvent<unknown>): RunEvent {
  return {
    runId: "run_1",
    at: "2026-08-14T01:00:01.000Z",
    raw,
    type: "message",
    data: { role: "ai", text: "I will inspect the page." },
    isTerminal: false,
  };
}

function semanticDone(raw: QoniEvent<unknown>): RunEvent {
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

describe("W1 原始 intervene 的本轮接管 ID", () => {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = encode({ alg: "none" }) + "." + encode({ aud: "webagent", webagent_tenant_id: "tenant_w1" }) + ".";
  const runId = "run_w1";
  const kinds = ["take_control", "refresh_control_url", "release_control"];
  function clientWithResponse(status = 200) {
    const calls: { method: string; pathname: string; body: unknown }[] = [];
    const client = new Qoni({ accessKey: "local-ak", secretKey: "local-sk", host: "https://qoni.example",
      webAgentBaseUrl: "https://wa.example", fetch: (async (url, init) => {
        calls.push({ method: init?.method || "GET", pathname: new URL(String(url)).pathname, body: JSON.parse(String(init?.body)) });
        return new Response(JSON.stringify(status === 409
          ? { detail: { code: "interaction_conflict", message: "接管轮次已失效" } }
          : { interaction_id: "tc-old", standalone_control_url: "https://browser.example/old" }),
        { status, headers: { "content-type": "application/json" } });
      }) as typeof fetch });
    return { client, calls };
  }

  describe.each(kinds)("%s 的参数映射", (kind) => {
    it.each(["interactionId", "interaction_id"])("%s 精确映射且不改变输入或响应 ID", async (alias) => {
      const { client, calls } = clientWithResponse();
      const input = Object.freeze({ token, runId, kind, [alias]: "tc-old" });
      const before = structuredClone(input);
      const response = await client.doAnything.api.intervene<DoAnythingControlResponse>(input);
      expect(calls).toEqual([{ method: "POST", pathname: "/api/v1/projects/tenant_w1/do_anything/runs/run_w1/intervene",
        body: { kind, interaction_id: "tc-old" } }]);
      expect(response.data.interaction_id).toBe("tc-old");
      expect(input).toEqual(before);
    });
  });

  it("首次主动 take 不带 ID 时不生成或查询一个 ID", async () => {
    const { client, calls } = clientWithResponse();
    const response = await client.doAnything.api.intervene<DoAnythingControlResponse>({ token, runId, kind: "take_control" });
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual({ kind: "take_control" });
    expect(response.data.interaction_id).toBe("tc-old");
  });

  it("双别名同值只发送一个 wire ID", async () => {
    const { client, calls } = clientWithResponse();
    await client.doAnything.api.intervene({ token, runId, kind: "release_control", interactionId: "tc-old", interaction_id: "tc-old" });
    expect(calls[0].body).toEqual({ kind: "release_control", interaction_id: "tc-old" });
  });

  it.each([
    { interactionId: "tc-old", interaction_id: "tc-new" },
    { interaction_id: "tc-new", interactionId: "tc-old" },
  ])("冲突 ID 别名在 HTTP 前拒绝，不能选择新轮次", async (ids) => {
    const { client, calls } = clientWithResponse();
    await expect(Promise.resolve().then(() => client.doAnything.api.intervene({ token, runId, kind: "release_control", ...ids })))
      .rejects.toBeInstanceOf(QoniValidationError);
    expect(calls).toHaveLength(0);
  });

  describe.each(["interactionId", "interaction_id"])("%s 的输入边界", (alias) => {
    it.each([null, 42, ""])("拒绝显式无效 ID %j", async (value) => {
      const { client, calls } = clientWithResponse();
      await expect(Promise.resolve().then(() => client.doAnything.api.intervene({ token, runId, kind: "release_control", [alias]: value })))
        .rejects.toBeInstanceOf(QoniValidationError);
      expect(calls).toHaveLength(0);
    });
  });

  describe.each(kinds)("%s 的 409 行为", (kind) => {
    it.each([undefined, "tc-old"])("缺失或旧 ID %s 仍由服务端拒绝，不读取当前 ID 自动重试", async (id) => {
      const { client, calls } = clientWithResponse(409);
      await expect(client.doAnything.api.intervene({ token, runId, kind, ...(id === undefined ? {} : { interaction_id: id }) }))
        .rejects.toMatchObject({ code: "interaction_conflict", status: 409, retryable: false });
      expect(calls).toHaveLength(1);
      expect(calls[0]).toMatchObject({ method: "POST", body: { kind, ...(id === undefined ? {} : { interaction_id: id }) } });
    });
  });

  it("旧 ControlSession 和卡片 handle 不升级到新卡 ID，409 后没有补读或重试", async () => {
    const calls: { method: string; pathname: string }[] = [];
    let currentId = "tc-old";
    const client = new Qoni({ accessKey: "local-ak", secretKey: "local-sk", host: "https://qoni.example",
      webAgentBaseUrl: "https://wa.example", fetch: (async (url, init) => {
        const pathname = new URL(String(url)).pathname;
        calls.push({ method: init?.method || "GET", pathname });
        const stale = pathname.includes("/interactions/tc-old/") && currentId !== "tc-old";
        return new Response(JSON.stringify(stale ? { detail: { code: "interaction_conflict" } }
          : pathname.endsWith("/connect_control")
            ? { interaction_id: "tc-old", standalone_control_url: "https://browser.example/old" }
            : { run_id: runId, status: "running" }),
        { status: stale ? 409 : 200, headers: { "content-type": "application/json" } });
      }) as typeof fetch });
    const run = await client.doAnything.attach(runId, { token });
    const handle = run.interactionHandle(normalizeInteraction({ id: "tc-old", type: "take_control", status: "pending",
      created_at: "2026-10-07T08:00:00Z", live_url: "https://browser.example/old",
      actions: ["connect_control", "refresh_control", "release_control"].map((kind) => ({
        kind, label: kind, method: "POST", endpoint: "/do_anything/runs/run_w1/interactions/tc-old/" + kind,
      })) })!);
    const control = await handle.connectControl();
    currentId = "tc-new";
    const before = calls.length;
    await expect(handle.refreshControl()).rejects.toMatchObject({ code: "interaction_conflict", status: 409, retryable: false });
    await expect(handle.releaseControl()).rejects.toMatchObject({ code: "interaction_conflict", status: 409, retryable: false });
    expect(calls.slice(before)).toEqual([
      { method: "POST", pathname: "/api/v1/projects/tenant_w1/do_anything/runs/run_w1/interactions/tc-old/refresh_control" },
      { method: "POST", pathname: "/api/v1/projects/tenant_w1/do_anything/runs/run_w1/interactions/tc-old/release_control" },
    ]);
    expect(control.raw.interaction_id).toBe("tc-old");
    expect(control.liveUrl).toBe("https://browser.example/old");
    expect(handle.interaction.id).toBe("tc-old");
  });

  it("默认 fetch 通过真实本地 HTTP 捕获首次响应 ID，后续动作保持本轮 ID", async () => {
    let marker: string | undefined;
    let round = 0;
    const requests: { method?: string; body: Record<string, unknown> }[] = [];
    const server = createServer(async (request, response) => {
      let text = "";
      for await (const chunk of request) text += chunk;
      const body = JSON.parse(text) as Record<string, unknown>;
      requests.push({ method: request.method, body });
      const stale = marker ? body.interaction_id !== marker : body.kind !== "take_control";
      response.writeHead(stale ? 409 : 200, { "content-type": "application/json" });
      if (stale) return response.end(JSON.stringify({ detail: { code: "interaction_conflict", message: "旧接管 ID" } }));
      if (!marker) marker = "tc-" + ++round;
      const id = marker;
      if (body.kind === "release_control") marker = undefined;
      response.end(JSON.stringify({ interaction_id: id, standalone_control_url: "https://browser.example/" + id }));
    });
    await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("本地 HTTP server 未获得 TCP 地址");
      const baseUrl = "http://127.0.0.1:" + address.port;
      const client = new Qoni({ accessKey: "local-ak", secretKey: "local-sk", host: baseUrl, webAgentBaseUrl: baseUrl, timeoutMs: 2000 });
      const first = await client.doAnything.api.intervene<DoAnythingControlResponse>({ token, runId, kind: "take_control" });
      const interactionId = first.data.interaction_id;
      expect(interactionId).toBe("tc-1");
      for (const kind of kinds) await client.doAnything.api.intervene({ token, runId, kind, interactionId });
      const next = await client.doAnything.api.intervene<DoAnythingControlResponse>({ token, runId, kind: "take_control" });
      expect(next.data.interaction_id).toBe("tc-2");
      for (const kind of kinds) {
        const before = requests.length;
        await expect(client.doAnything.api.intervene({ token, runId, kind, interactionId }))
          .rejects.toMatchObject({ code: "interaction_conflict", status: 409, retryable: false });
        expect(requests).toHaveLength(before + 1);
        expect(requests.at(-1)).toEqual({ method: "POST", body: { kind, interaction_id: "tc-1" } });
      }
      expect(first.data.interaction_id).toBe("tc-1");
      expect(marker).toBe("tc-2");
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
