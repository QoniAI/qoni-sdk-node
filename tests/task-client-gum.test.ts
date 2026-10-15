import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createTaskClient } from "../dist/index.js";

// 独立本机命令显式选择已安装 GUM venv/干净源码；常规 SDK 测试不依赖这些绝对路径。
const configured = Boolean(process.env.SDK_TASK_GUM_ROOT && process.env.SDK_TASK_GUM_PYTHON);
describe.skipIf(!configured)("真实构建包 → 原 GUM TCP/SQLite 兼容", () => {
  it("固定 session、顺序相同批次请求 ID 与真实 raw/outbox/trigger 不重复", async () => {
    const child = spawn(process.env.SDK_TASK_GUM_PYTHON!, [resolve("tests/fixtures/task-gum-server.py")], {
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1", QONI_LIVE_E2E: "0" }, stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    const ended = once(child, "close");
    let result: any;
    try {
      const ready = await new Promise<{ port: number }>((resolveReady, reject) => {
        const timer = setTimeout(() => reject(new Error("隔离 GUM fixture 未就绪")), 15_000);
        child.once("exit", () => { clearTimeout(timer); reject(new Error(`隔离 fixture 提前退出：${stderr}`)); });
        child.stdout.on("data", () => {
          const line = stdout.split("\n").find(line => line.startsWith('{"ready":'));
          if (line) { clearTimeout(timer); resolveReady(JSON.parse(line)); }
        });
      });
      const options = { productHosts: { gumem: `http://127.0.0.1:${ready.port}` }, runId: "sdk-fixture-run", tokenProvider: async () => ({ accessToken: "sdk-task-gum-synthetic", expiresAt: Date.now() + 60_000 }) };
      const task = createTaskClient(options);
      expect((await task.memory.createSession()).data.session_id).toBe("qoni-run-sdk-fixture-run");
      expect((await createTaskClient(options).memory.createSession()).data.session_id).toBe("qoni-run-sdk-fixture-run");
      const messages = [{ id: "pi-session:entry-one", role: "user", content: "已获准的合成消息" }];
      const first = await task.memory.addMessages({ messages });
      const replay = await createTaskClient(options).memory.addMessages({ messages });
      expect(first.data).toEqual(replay.data);
      expect(first.data.message_count).toBe(1);
      expect(first.data.request_id).toMatch(/^qoni-task-[a-f0-9]{64}$/);
      // Unicode + query/hash 字符需要实际路由解码，禁止绕过真实 API 的形状限制。
      const encoded = createTaskClient({ ...options, runId: "运行?b#c%" });
      await encoded.memory.createSession();
      await encoded.memory.addMessages({ messages: [{ id: "other-entry", role: "system", content: "" }] });
      // 原 ASGI router 在路由匹配前解码 %2F；Session ID 不能包含路径分隔符。
      const slash = await fetch(`http://127.0.0.1:${ready.port}/api/sessions/qoni-run-fixture%2Fpath/messages`, {
        method: "POST", headers: { authorization: "Bearer sdk-task-gum-synthetic", "content-type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      expect(slash.status).toBe(404);
    } finally {
      child.kill("SIGTERM");
      await ended;
      const line = stdout.split("\n").find(line => line.startsWith('{"fixture_result":'));
      if (line) result = JSON.parse(line);
      const evidence = process.env.SDK_TASK_GUM_EVIDENCE;
      if (evidence) {
        await writeFile(resolve(evidence, "sdk-task-facade-gum-fixture-result.json"), JSON.stringify(result ?? { stdout, stderr }, null, 2) + "\n");
        await writeFile(resolve(evidence, "sdk-task-facade-gum-fixture-stderr.log"), stderr);
      }
    }
    expect(result).toBeDefined();
    expect(result.source_mismatches).toEqual([]);
    expect(result.gum_status_before).toBe("");
    expect(result.gum_status_after).toBe("");
    expect(result.temporary_database_removed).toBe(true);
    expect(result.requests).toHaveLength(3);
    expect(result.requests[0]).toEqual(result.requests[1]);
    expect(result.requests[1]).toMatchObject({ raw: 1, usage_outbox: 1, triggers: 3, statuses: [{ working_status: "done", episodic_status: "done", sentiment_status: "done" }] });
    expect(result.requests[2]).toMatchObject({ raw: 2, usage_outbox: 2 });
  }, 20_000);
});
