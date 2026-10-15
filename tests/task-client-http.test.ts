import { createServer, type IncomingMessage, type ServerResponse, type Server } from "node:http";
import { once } from "node:events";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";
import * as built from "../dist/index.js";
import type { TaskClientOptions, TaskTokenProvider } from "../src/index";

const servers: Server[] = [];
const disposers: Array<() => void> = [];
afterEach(async () => {
  disposers.splice(0).forEach(fn => fn());
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => {
    server.close(() => resolve());
    server.closeAllConnections();
  })));
});
type Wire = { path: string; method?: string; headers: IncomingMessage["headers"]; body: any; raw: string };
const secret = "synthetic-loopback-token-A";
const provider: TaskTokenProvider = async () => ({ accessToken: secret, expiresAt: Date.now() + 60_000 });
const msg = (id = "pi:entry-a", content = "获准合成内容") => ({ id, role: "user", content });
const send = (res: ServerResponse, payload: unknown, status = 200) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
};
const success = (res: ServerResponse, wire: Wire) => send(res, { code: 0, message: "success", data: wire.body.session_id
  ? { session_id: wire.body.session_id, title: null, created_at: "2026-10-08T00:00:00Z" }
  : { request_id: wire.headers["x-request-id"], message_count: wire.body.messages.length, messages: wire.body.messages },
});
async function http(handler: (wire: Wire, res: ServerResponse) => void = (wire, res) => success(res, wire)) {
  const seen: Wire[] = [];
  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const wire: Wire = { path: req.url!, method: req.method, headers: req.headers, body: raw ? JSON.parse(raw) : undefined, raw };
    seen.push(wire);
    handler(wire, res);
  });
  servers.push(server);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as { port: number };
  const host = `http://127.0.0.1:${address.port}/base`;
  const client = (overrides: Partial<TaskClientOptions> = {}) => built.createTaskClient({ productHosts: { gumem: host }, runId: "run-http", tokenProvider: provider, ...overrides });
  return { client, seen, host, server };
}
const pause = (ms: number) => new Promise(resolve => { const timer = setTimeout(resolve, ms); disposers.push(() => clearTimeout(timer)); });

describe("构建包真 TCP loopback task facade", () => {
  it("ESM/CJS 都只有两种本 run 能力并发送真实 Bearer/body，无 AK/SK 路由", async () => {
    const require = createRequire(import.meta.url);
    const cjs = require("../dist/index.cjs") as typeof built;
    const f = await http();
    for (const exports of [built, cjs]) {
      const task = exports.createTaskClient({ productHosts: { gumem: f.host }, runId: "run-http", tokenProvider: provider });
      expect(Object.keys(task)).toEqual(["memory"]);
      expect(Object.keys(task.memory)).toEqual(["createSession", "addMessages"]);
      const session = await task.memory.createSession();
      expect(session.data.session_id).toBe("qoni-run-run-http");
      const result = await task.memory.addMessages({ messages: [msg()] });
      expect(result.data.message_count).toBe(1);
      expect(result.data).not.toHaveProperty("messages");
      expect(JSON.stringify(task).includes(secret)).toBe(false);
    }
    expect(f.seen.map(w => w.path)).toEqual(["/base/api/sessions", "/base/api/sessions/qoni-run-run-http/messages", "/base/api/sessions", "/base/api/sessions/qoni-run-run-http/messages"]);
    expect(f.seen.every(w => w.method === "POST" && w.headers.authorization === `Bearer ${secret}`)).toBe(true);
    expect(f.seen.every(w => Object.keys(w.headers).every(k => !k.startsWith("x-authing") && k !== "date"))).toBe(true);
    expect(f.seen[0].body).toEqual({ user_id: "", session_id: "qoni-run-run-http" });
    expect(f.seen[1].body).toEqual({ messages: [msg()] });
    expect(f.seen[1].headers["x-request-id"]).toBe(f.seen[3].headers["x-request-id"]);
  });

  it("每次显式请求拿当前 token；撤销/到期/拒绝后不发送 POST", async () => {
    const f = await http();
    let current = secret;
    let revoked = false;
    let expired = false;
    let permits = 0;
    const task = f.client({ tokenProvider: async () => {
      permits++;
      if (revoked) throw new Error("synthetic-private-refusal");
      return { accessToken: current, expiresAt: expired ? Date.now() - 1 : Date.now() + 30_000 };
    } });
    await task.memory.createSession();
    current = "synthetic-loopback-token-B";
    await task.memory.addMessages({ messages: [msg()] });
    expect(f.seen[0].headers.authorization === `Bearer ${secret}`).toBe(true);
    expect(f.seen[1].headers.authorization === `Bearer ${current}`).toBe(true);
    expired = true;
    await expect(task.memory.addMessages({ messages: [msg()] })).rejects.toBeInstanceOf(built.QoniTokenExpiredError);
    expired = false; revoked = true;
    await expect(task.memory.addMessages({ messages: [msg()] })).rejects.toBeInstanceOf(built.QoniAuthError);
    expect(f.seen).toHaveLength(2);
    expect(permits).toBe(4);
    revoked = false;
    await task.memory.addMessages({ messages: [msg()] });
    expect(f.seen).toHaveLength(3);
  });

  it("固定有序批次跨客户端/更换 token request ID 一致，run/内容/顺序不同则不同", async () => {
    const f = await http();
    const messages = [msg("one", "A"), msg("two", "B")];
    await f.client().memory.addMessages({ messages });
    await f.client({ tokenProvider: async () => ({ accessToken: "synthetic-rotated", expiresAt: Date.now() + 30_000 }) }).memory.addMessages({ messages });
    await f.client().memory.addMessages({ messages: [...messages].reverse() });
    await f.client().memory.addMessages({ messages: [msg("one", "C"), messages[1]] });
    await f.client({ runId: "other-run" }).memory.addMessages({ messages });
    const ids = f.seen.map(w => w.headers["x-request-id"]);
    expect(typeof ids[0]).toBe("string");
    expect(ids[0]).toMatch(/^qoni-task-[a-f0-9]{64}$/);
    expect(ids[0]).toBe(ids[1]);
    expect(new Set([ids[0], ...ids.slice(2)]).size).toBe(4);
    expect(f.seen[0].raw).toBe(f.seen[1].raw);
  });

  it("共享 provider 并发不同 run 不串 token/session，provider scopes 不可被修改", async () => {
    const f = await http();
    const calls: string[] = [];
    const shared: TaskTokenProvider = async (product, scopes, run, signal) => {
      expect(product).toBe("gumem");
      expect([...scopes]).toEqual(["gumem.memory:write"]);
      expect(Object.isFrozen(scopes)).toBe(true);
      expect(signal.aborted).toBe(false);
      calls.push(run);
      await pause(run === "left" ? 30 : 5);
      return { accessToken: `synthetic-${run}`, expiresAt: Date.now() + 30_000 };
    };
    const left = f.client({ runId: "left", tokenProvider: shared });
    const right = f.client({ runId: "right", tokenProvider: shared });
    await Promise.all([left.memory.createSession(), right.memory.createSession()]);
    expect(new Set(calls)).toEqual(new Set(["left", "right"]));
    expect(f.seen.every(w => w.headers.authorization === `Bearer synthetic-${w.body.session_id.slice(9)}`)).toBe(true);
  });

  it("host base path 保留，run 中 path/query/hash 字符只进入编码 Session 段", async () => {
    const f = await http();
    const task = f.client({ runId: "run?b#c%" });
    await task.memory.createSession();
    await task.memory.addMessages({ messages: [msg()] });
    expect(f.seen[1].path).toBe("/base/api/sessions/qoni-run-run%3Fb%23c%25/messages");
    expect(f.seen[0].body.session_id).toBe("qoni-run-run?b#c%");
  });

  it("服务配置对象变更不能改绑 origin/run/provider", async () => {
    const f = await http();
    const hosts = { gumem: f.host };
    const settings: TaskClientOptions = { productHosts: hosts, runId: "run-http", tokenProvider: provider };
    const task = built.createTaskClient(settings);
    hosts.gumem = "http://127.0.0.1:1/other";
    Object.assign(settings, { runId: "other", tokenProvider: async () => { throw new Error("must not run"); } });
    await task.memory.createSession();
    expect(f.seen[0].body.session_id).toBe("qoni-run-run-http");
  });

  it.each([301, 302, 303, 307, 308])("Bearer %i 重定向不跟随，不抵达第二 origin", async status => {
    const target = await http();
    const f = await http((_wire, res) => { res.writeHead(status, { location: target.host + "/capture" }); res.end(); });
    await expect(f.client().memory.createSession()).rejects.toBeInstanceOf(built.QoniUpstreamError);
    expect(f.seen).toHaveLength(1);
    expect(target.seen).toHaveLength(0);
  });

  it("provider 等待与 HTTP 共用一个总 timeout，HTTP body 超时取消", async () => {
    const f = await http((_wire, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.write('{"data":');
    });
    let providerSignal!: AbortSignal;
    const task = f.client({ timeoutMs: 120, tokenProvider: async (p, s, r, signal) => {
      providerSignal = signal;
      await pause(60);
      return provider(p, s, r, signal);
    } });
    const started = Date.now();
    await expect(task.memory.createSession()).rejects.toBeInstanceOf(built.QoniTimeoutError);
    expect(Date.now() - started).toBeLessThan(230);
    expect(providerSignal.aborted).toBe(true);
    expect(f.seen).toHaveLength(1);
  });

  it("provider 不合作的 abort 有界退出，迟到许可不抵达服务器", async () => {
    const f = await http();
    const ctl = new AbortController();
    let entered!: () => void;
    const start = new Promise<void>(r => { entered = r; });
    let finish!: (value: { accessToken: string; expiresAt: number }) => void;
    const task = f.client({ tokenProvider: async () => { entered(); return new Promise(r => { finish = r; }); } });
    const pending = task.memory.createSession({ signal: ctl.signal }).catch(e => e);
    await start;
    ctl.abort(new Error(secret));
    const error = await pending;
    expect(error.name).toBe("AbortError");
    expect(String(error).includes(secret)).toBe(false);
    finish({ accessToken: secret, expiresAt: Date.now() + 60_000 });
    await pause(30);
    expect(f.seen).toHaveLength(0);
  });

  it("HTTP 等待时 caller abort 不重试，下一次显式请求成功", async () => {
    let entered!: () => void;
    const arrived = new Promise<void>(r => { entered = r; });
    const f = await http((wire, res) => { if (wire.body.session_id) { entered(); return; } success(res, wire); });
    const ctl = new AbortController();
    const task = f.client();
    const pending = task.memory.createSession({ signal: ctl.signal }).catch(e => e);
    await arrived; ctl.abort();
    expect((await pending).name).toBe("AbortError");
    await task.memory.addMessages({ messages: [msg()] });
    expect(f.seen).toHaveLength(2);
  });

  it.each([401, 403, 500])("HTTP %i 不盲重试，秘密与 SQL 错误不外泄", async status => {
    const f = await http((_wire, res) => send(res, { detail: { code: status === 401 ? "token.expired" : "denied", message: secret, headers: { authorization: `Bearer ${secret}` }, params: "SQL private message" } }, status));
    const task = f.client();
    const error = await task.memory.createSession().catch(e => e);
    const Type = status === 401 ? built.QoniTokenExpiredError : status === 403 ? built.QoniPermissionDeniedError : built.QoniUpstreamError;
    expect(error).toBeInstanceOf(Type);
    expect(error.status).toBe(status);
    expect(f.seen).toHaveLength(1);
    expect(String(error).includes(secret)).toBe(false);
    expect(JSON.stringify(error).includes(secret)).toBe(false);
    expect(error.cause).toBeUndefined();
    expect(error.body).toBeUndefined();
  });

  it("断网只有一次 POST，包装为既有网络错误且不带 fetch 私密 cause", async () => {
    const f = await http((_wire, res) => res.socket!.destroy());
    const error = await f.client().memory.createSession().catch(e => e);
    expect(error).toBeInstanceOf(built.QoniUpstreamError);
    expect(error.code).toBe("upstream.failed");
    expect(error.cause).toBeUndefined();
    expect(f.seen).toHaveLength(1);
  });

  it.each(["not-json", "null", "[]", "{}", '{"data":null}', '{"code":123,"data":{"session_id":"qoni-run-run-http"}}', '{"statusCode":503,"data":{"session_id":"qoni-run-run-http"}}'])("未知 JSON/envelope 失败关闭 %#", async raw => {
    const f = await http((_wire, res) => { res.writeHead(200, { "content-type": "application/json" }); res.end(raw); });
    await expect(f.client().memory.createSession()).rejects.toBeInstanceOf(built.QoniUpstreamError);
    expect(f.seen).toHaveLength(1);
  });

  it("Session/结果里的额外 token/header/meta 不被 facade 返回", async () => {
    const f = await http((wire, res) => send(res, { data: { session_id: wire.body.session_id, token: secret, authorization: `Bearer ${secret}` }, meta: { token: secret, headers: { authorization: secret }, requestId: secret } }));
    const result = await f.client().memory.createSession();
    expect(result.data).toEqual({ session_id: "qoni-run-run-http" });
    expect(JSON.stringify(result).includes(secret)).toBe(false);
    expect(result.meta).not.toHaveProperty("headers");
  });

  it("总 deadline 对不合作 fetch 和挂起 reader 同样有界，迟到 Response 被取消", async () => {
    const f = await http();
    let finish!: (value: Response) => void;
    const task = f.client({ timeoutMs: 20, fetch: (async () => new Promise(r => { finish = r; })) as typeof fetch });
    await expect(task.memory.createSession()).rejects.toBeInstanceOf(built.QoniTimeoutError);
    let cancelled = false;
    finish(new Response(new ReadableStream({ cancel() { cancelled = true; } })));
    await pause(10);
    expect(cancelled).toBe(true);
    expect(f.seen).toHaveLength(0);
  });
});
