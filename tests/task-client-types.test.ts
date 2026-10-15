import { mkdtemp, mkdir, cp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("独立 TypeScript package 消费者", () => {
  it("经 exports/types 使用精确 task 入口，越权属性/保留参数编译失败", async () => {
    const work = await mkdtemp(join(tmpdir(), "qoni-task-consumer-"));
    try {
      const packageDir = join(work, "node_modules/@qoniai/qoni");
      await mkdir(packageDir, { recursive: true });
      await cp(resolve("dist"), join(packageDir, "dist"), { recursive: true });
      await cp(resolve("package.json"), join(packageDir, "package.json"));
      await writeFile(join(work, "package.json"), JSON.stringify({ type: "module" }));
      await writeFile(join(work, "consumer.ts"), `
import { createTaskClient, type TaskClient, type TaskTokenProvider, type TaskClientOptions, type QoniResponse, type TaskSessionData, type TaskMessagesData } from "@qoniai/qoni";
const provider: TaskTokenProvider = async (product, scopes, runId, signal) => {
  const productCheck: "gumem" = product;
  const signalCheck: AbortSignal = signal;
  // @ts-expect-error scopes 不允许宿主修改
  scopes.push("admin");
  return { accessToken: "synthetic", expiresAt: Date.now() + 1000 };
};
const opts: TaskClientOptions = { productHosts: { gumem: "https://memory.test" }, runId: "trusted-run", tokenProvider: provider };
const task: TaskClient = createTaskClient(opts);
const created: Promise<QoniResponse<TaskSessionData>> = task.memory.createSession({ signal: new AbortController().signal });
const added: Promise<QoniResponse<TaskMessagesData>> = task.memory.addMessages({ messages: [{ id: "pi:entry", role: "toolResult", content: "approved" }] });
// @ts-expect-error 无管理面
task.genauth.users.list({});
// @ts-expect-error 无 Qoni/AK/SK 入口
task.qoni.delegateToken({});
// @ts-expect-error 无任意 raw request
task.request({ path: "/elsewhere" });
// @ts-expect-error 无 recall
task.memory.recall({});
// @ts-expect-error 无 upload
task.memory.uploadResource({});
// @ts-expect-error 不返回 token/provider
task.tokenProvider;
// @ts-expect-error Session 不能指定
task.memory.createSession({ sessionId: "another" });
// @ts-expect-error 用户不能指定
task.memory.addMessages({ messages: [], userId: "another" });
// @ts-expect-error headers 不能指定
task.memory.addMessages({ messages: [], headers: { authorization: "injected" } });
// @ts-expect-error token 不能指定
task.memory.addMessages({ messages: [], token: "injected" });
// @ts-expect-error path 不能指定
task.memory.addMessages({ messages: [], path: "/elsewhere" });
// @ts-expect-error scope 不能指定
task.memory.addMessages({ messages: [], scopes: ["admin"] });
// @ts-expect-error 消息 id 必填
task.memory.addMessages({ messages: [{ role: "user", content: "x" }] });
// @ts-expect-error 不能注入处理状态
task.memory.addMessages({ messages: [{ id: "entry", role: "user", content: "x", status: "done" }] });
// @ts-expect-error 配置不接受 AK
createTaskClient({ ...opts, accessKey: "injected" });
// @ts-expect-error 不接受其它 product host
createTaskClient({ ...opts, productHosts: { gumem: "https://m.test", webagent: "https://w.test" } });
// @ts-expect-error provider 结果必须有 expiresAt
createTaskClient({ ...opts, tokenProvider: async () => ({ accessToken: "x" }) });
// @ts-expect-error 只读能力不能覆盖
task.memory = {};
const retained = { messages: [{ id: "entry", role: "user", content: "x" }], token: "injected" };
// @ts-expect-error 已有变量中的保留参数也不能伪造
task.memory.addMessages(retained);
const poisonedMessage = { messages: [{ id: "entry", role: "user", content: "x", user_id: "another" }] };
// @ts-expect-error 已有变量中的消息保留参数也不能伪造
task.memory.addMessages(poisonedMessage);
const poisonedOptions = { ...opts, secretKey: "injected" };
// @ts-expect-error 已有配置变量也不能带 AK/SK
createTaskClient(poisonedOptions);
void [created, added];
`);
      const output = spawnSync(process.execPath, [resolve("node_modules/typescript/bin/tsc"), "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", join(work, "consumer.ts")], { encoding: "utf8", cwd: work });
      expect(output.stdout + output.stderr).toBe("");
      expect(output.status).toBe(0);
    } finally { await rm(work, { recursive: true, force: true }); }
  });
});
