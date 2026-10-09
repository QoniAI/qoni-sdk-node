import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createTaskClient, QoniValidationError } from "../dist/index.js";

const configured = Boolean(process.env.SDK_TASK_GUM_ROOT && process.env.SDK_TASK_GUM_PYTHON && process.env.SDK_TASK_GUM_REVIEW_INPUT);
describe.skipIf(!configured)("r2 构建包 → 原 GUM Unicode 副作用", () => {
  it("reviewer 原始 NEL run 在 SDK 入口拒绝，真实库在合法 run 创建前为空", async () => {
    // 读取只读复制的实际反例，不能用更换 expected hash 代替实际路径。
    const driver = await readFile(resolve(process.env.SDK_TASK_GUM_REVIEW_INPUT!, "gum-probe-driver.mjs"), "utf8");
    const literal = driver.match(/client\(("nel\\u0085")\)/)?.[1];
    expect(literal).toBeDefined();
    const badRun: string = JSON.parse(literal!);
    const child = spawn(process.env.SDK_TASK_GUM_PYTHON!, [resolve("tests/fixtures/task-gum-server.py")], {
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1", QONI_LIVE_E2E: "0" }, stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    const ended = once(child, "close");
    const readLine = <T>(prefix: string): Promise<T> => new Promise((resolveLine, reject) => {
      const inspect = () => {
        const line = stdout.split("\n").find(value => value.startsWith(prefix));
        if (line) { cleanup(); resolveLine(JSON.parse(line)); }
      };
      const failed = () => { cleanup(); reject(new Error(`fixture 提前退出：${stderr}`)); };
      const timer = setTimeout(() => { cleanup(); reject(new Error("fixture 未返回收据")); }, 15_000);
      const cleanup = () => { clearTimeout(timer); child.stdout.off("data", inspect); child.off("exit", failed); };
      child.stdout.on("data", inspect); child.once("exit", failed); inspect();
    });
    const snapshot = (id: string) => {
      const pending = readLine<any>(`{"fixture_snapshot": "${id}"`);
      child.stdin.write(JSON.stringify({ command: "snapshot", id }) + "\n");
      return pending;
    };
    let result: any, exit: unknown, before: any, afterBad: any, afterLegal: any;
    let badError: unknown;
    let permissions = 0, requests = 0;
    let rejectedCounts: unknown;
    try {
      const ready = await readLine<{ port: number }>('{"ready":');
      const options = {
        productHosts: { gumem: `http://127.0.0.1:${ready.port}` }, runId: badRun,
        tokenProvider: async () => { permissions++; return { accessToken: "sdk-task-gum-synthetic", expiresAt: Date.now() + 60_000 }; },
        fetch: ((...args: Parameters<typeof fetch>) => { requests++; return fetch(...args); }) as typeof fetch,
      };
      before = await snapshot("before");
      try { await createTaskClient(options).memory.createSession(); } catch (error) { badError = error; }
      rejectedCounts = { permissions, requests };
      afterBad = await snapshot("after-bad");
      const task = createTaskClient({ ...options, runId: "nel" });
      expect((await task.memory.createSession()).data.session_id).toBe("qoni-run-nel");
      afterLegal = await snapshot("after-legal");
      await task.memory.addMessages({ messages: [{ id: "pair😀", role: "system", content: "\t合法😀\n " }] });
    } finally {
      child.kill("SIGTERM");
      exit = await ended;
      const line = stdout.split("\n").find(value => value.startsWith('{"fixture_result":'));
      if (line) result = JSON.parse(line);
      if (process.env.SDK_TASK_GUM_EVIDENCE) {
        await mkdir(process.env.SDK_TASK_GUM_EVIDENCE, { recursive: true });
        await writeFile(resolve(process.env.SDK_TASK_GUM_EVIDENCE, "sdk-task-facade-r2-gum-fixture-result.json"),
          JSON.stringify({ fixture: result, exit, before, afterBad, afterLegal, rejectedCounts,
            badError: badError instanceof Error ? badError.name : undefined }, null, 2) + "\n");
        await writeFile(resolve(process.env.SDK_TASK_GUM_EVIDENCE, "sdk-task-facade-r2-gum-fixture-stderr.log"), stderr);
      }
    }
    expect(exit).toEqual([0, null]);
    expect(result?.fixture_result).toBe(true);
    expect(result.source_mismatches).toEqual([]);
    expect(Object.keys(result.loaded_source_hashes)).toHaveLength(184);
    expect(result.gum_status_before).toBe("");
    expect(result.gum_status_after).toBe("");
    expect(result.temporary_database_removed).toBe(true);
    expect(badError).toBeInstanceOf(QoniValidationError);
    expect(rejectedCounts).toEqual({ permissions: 0, requests: 0 });
    expect(before).toMatchObject({ sessions: [], raw_count: 0, usage_outbox_count: 0 });
    expect(afterBad).toMatchObject({ sessions: [], raw_count: 0, usage_outbox_count: 0 });
    expect(afterLegal.sessions).toHaveLength(1);
    expect(afterLegal.sessions[0].thread_id).toBe("qoni-run-nel");
    expect(afterLegal).toMatchObject({ raw_count: 0, usage_outbox_count: 0 });
    expect(result.requests).toHaveLength(1);
    expect(result.requests[0]).toMatchObject({ raw: 1, usage_outbox: 1, triggers: 3 });
  }, 20_000);
});
