import { describe, expect, it } from "vitest";
import * as sdk from "../src/index";
import { createTaskClient, type TaskClientOptions, type TaskTokenProvider } from "../src/index";

// 只替换外部 HTTP/许可来源，断言公开 facade 的业务行为。
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json" },
});
const grant: TaskTokenProvider = async () => ({ accessToken: "synthetic-test-only", expiresAt: Date.now() + 60_000 });
const options = (overrides: Partial<TaskClientOptions> = {}): TaskClientOptions => ({
  productHosts: { gumem: "https://memory.example.test/base" }, runId: "run-one", tokenProvider: grant,
  fetch: (async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    return reply({ data: body.session_id ? { session_id: body.session_id } : { request_id: "stable-request", message_count: body.messages.length } });
  }) as typeof fetch,
  ...overrides,
});
const message = (id = "pi:one", content = "获准合成内容") => ({ id, role: "user", content });
const invalidCall = (fn: (...args: any[]) => unknown, ...args: unknown[]) =>
  Promise.resolve().then(() => fn(...args));

describe("内部 task facade", () => {
  it("公开入口独立于 AK/SK constructor", () => {
    expect(sdk).toHaveProperty("createTaskClient");
    expect(() => new sdk.Qoni({})).toThrow("accessKey and secretKey");
    const client = createTaskClient(options());
    expect(Object.keys(client)).toEqual(["memory"]);
    expect(Object.keys(client.memory)).toEqual(["createSession", "addMessages"]);
    expect(Object.isFrozen(client)).toBe(true);
    expect(Object.isFrozen(client.memory)).toBe(true);
  });

  it("固定 run 映射到本 session，scope/path/body 取现有 namespace", async () => {
    const calls: Array<{ url: string; body: unknown; headers: Headers; redirect?: RequestRedirect }> = [];
    const permissions: unknown[] = [];
    const client = createTaskClient(options({
      runId: "运行?b#c%",
      tokenProvider: async (product, scopes, run, signal) => {
        permissions.push({ product, scopes: [...scopes], run, aborted: signal.aborted });
        return grant(product, scopes, run, signal);
      },
      fetch: (async (url, init) => {
        const body = JSON.parse(String(init?.body));
        calls.push({ url: String(url), body, headers: new Headers(init?.headers), redirect: init?.redirect });
        return reply({ code: 0, message: "success", data: body.session_id ? { session_id: body.session_id } : { request_id: "stable-request", message_count: 1 } });
      }) as typeof fetch,
    }));
    await client.memory.createSession();
    await client.memory.addMessages({ messages: [message()] });
    expect(calls[0].url).toBe("https://memory.example.test/base/api/sessions");
    expect(calls[0].body).toEqual({ user_id: "", session_id: "qoni-run-运行?b#c%" });
    expect(calls[1].url).toBe("https://memory.example.test/base/api/sessions/qoni-run-%E8%BF%90%E8%A1%8C%3Fb%23c%25/messages");
    expect(calls[1].body).toEqual({ messages: [message()] });
    expect(permissions).toEqual([0, 1].map(() => ({ product: "gumem", scopes: ["gumem.memory:write"], run: "运行?b#c%", aborted: false })));
    expect(calls.every(c => c.redirect === "error")).toBe(true);
  });

  it.each(["", " ", "run ", " run", "a\n", "\ud800", "a".repeat(56), "path/run", "path\\run"])("非法 runId 在 provider 前拒绝 %#", runId => {
    expect(() => createTaskClient(options({ runId }))).toThrow(sdk.QoniValidationError);
  });

  it("不截断长 run 的尾部，支持最大合法长度", async () => {
    const prefix = "a".repeat(54);
    const left = await createTaskClient(options({ runId: prefix + "x" })).memory.createSession();
    const right = await createTaskClient(options({ runId: prefix + "y" })).memory.createSession();
    expect(left.data.session_id).not.toBe(right.data.session_id);
  });

  const c1 = Array.from({ length: 32 }, (_, n) => String.fromCharCode(0x80 + n));
  const atEachPosition = (value: string) => [value + "id", "i" + value + "d", "id" + value];

  it.each(c1)("全部 C1 runId 在前中后位置均拒绝且不查询许可/HTTP %#", control => {
    let permissions = 0, requests = 0;
    for (const runId of atEachPosition(control)) {
      expect(() => createTaskClient(options({
        runId,
        tokenProvider: async (...args) => { permissions++; return grant(...args); },
        fetch: (async () => { requests++; return reply({}); }) as typeof fetch,
      }))).toThrow(sdk.QoniValidationError);
    }
    expect(permissions).toBe(0);
    expect(requests).toBe(0);
  });

  it.each(c1)("全部 C1 message id 在前中后位置均拒绝且不查询许可/HTTP %#", async control => {
    let permissions = 0, requests = 0;
    const client = createTaskClient(options({
      tokenProvider: async (...args) => { permissions++; return grant(...args); },
      fetch: (async () => { requests++; return reply({}); }) as typeof fetch,
    }));
    for (const id of atEachPosition(control)) {
      await expect(invalidCall(client.memory.addMessages, { messages: [message(id)] })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    }
    expect(permissions).toBe(0);
    expect(requests).toBe(0);
  });

  const malformedStrings = ["\ud800ok", "o\ud800k", "ok\ud800", "\udfffok", "o\udfffk", "ok\udfff"];
  const malformedMessages = (["role", "content"] as const).flatMap(field =>
    malformedStrings.map(value => ({ field, value })));

  it.each(malformedMessages)("$field 未配对 surrogate 同步拒绝，全批未绑定 %#", async ({ field, value }) => {
    let permissions = 0;
    const bodies: unknown[] = [];
    const client = createTaskClient(options({
      tokenProvider: async (...args) => { permissions++; return grant(...args); },
      fetch: (async (_url, init) => {
        bodies.push(JSON.parse(String(init?.body)));
        return reply({ request_id: "valid-batch", message_count: 1 });
      }) as typeof fetch,
    }));
    await expect(invalidCall(client.memory.addMessages, {
      messages: [message("first", "未绑定内容"), { ...message("bad"), [field]: value }],
    })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    expect(permissions).toBe(0);
    expect(bodies).toEqual([]);
    // 坏批次中较早的合法 ID 以及坏消息 ID 均能以有效新内容重新提交。
    await client.memory.addMessages({ messages: [message("first", "有效新内容")] });
    await client.memory.addMessages({ messages: [message("bad", "修正后内容")] });
    expect(permissions).toBe(2);
    expect(bodies).toEqual([{ messages: [message("first", "有效新内容")] }, { messages: [message("bad", "修正后内容")] }]);
  });

  it.each(["😀前", "中😀间", "末😀"])("合法 pair、非 BMP 与原 whitespace/newline 按字面量发送 %#", async pair => {
    const messages = [{ id: "标识😀", role: ` \n${pair}\t `, content: `\t${pair}\n ` }, { id: "empty", role: "system", content: "" }];
    let body: unknown;
    const client = createTaskClient(options({
      runId: "😀".repeat(55),
      fetch: (async (_url, init) => {
        body = JSON.parse(String(init?.body));
        return reply({ request_id: "unicode-preserved", message_count: 2 });
      }) as typeof fetch,
    }));
    await client.memory.addMessages({ messages });
    expect(body).toEqual({ messages });
    expect(() => createTaskClient(options({ runId: "😀".repeat(56) }))).toThrow(sdk.QoniValidationError);
  });

  it("合法批次提交后 provider 拒绝仍绑定 ID，原内容可以显式重试", async () => {
    let permissions = 0;
    const bodies: unknown[] = [];
    const client = createTaskClient(options({
      tokenProvider: async (...args) => {
        if (++permissions === 1) throw new Error("synthetic refusal");
        return grant(...args);
      },
      fetch: (async (_url, init) => {
        bodies.push(JSON.parse(String(init?.body)));
        return reply({ request_id: "explicit-retry", message_count: 1 });
      }) as typeof fetch,
    }));
    await expect(client.memory.addMessages({ messages: [message()] })).rejects.toBeInstanceOf(sdk.QoniAuthError);
    expect(bodies).toEqual([]);
    await expect(invalidCall(client.memory.addMessages, { messages: [message("pi:one", "换内容")] })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    await expect(invalidCall(client.memory.addMessages, { messages: [{ ...message(), role: "toolResult" }] })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    expect(permissions).toBe(1);
    await client.memory.addMessages({ messages: [message()] });
    expect(permissions).toBe(2);
    expect(bodies).toEqual([{ messages: [message()] }]);
  });

  it("合法批次在 provider 阶段超时仍绑定，原内容显式重试且迟到许可不发 HTTP", async () => {
    let permissions = 0;
    let resolveLate!: (value: Awaited<ReturnType<TaskTokenProvider>>) => void;
    const bodies: unknown[] = [];
    const client = createTaskClient(options({
      timeoutMs: 30,
      tokenProvider: async (...args) => {
        if (++permissions === 1) return new Promise(resolve => { resolveLate = resolve; });
        return grant(...args);
      },
      fetch: (async (_url, init) => {
        bodies.push(JSON.parse(String(init?.body)));
        return reply({ request_id: "explicit-retry", message_count: 1 });
      }) as typeof fetch,
    }));
    await expect(client.memory.addMessages({ messages: [message()] })).rejects.toBeInstanceOf(sdk.QoniTimeoutError);
    expect(bodies).toEqual([]);
    await expect(invalidCall(client.memory.addMessages, { messages: [message("pi:one", "换内容")] })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    expect(permissions).toBe(1);
    resolveLate(await grant("gumem", [], "run-one", new AbortController().signal));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(bodies).toEqual([]);
    await client.memory.addMessages({ messages: [message()] });
    expect(permissions).toBe(2);
    expect(bodies).toEqual([{ messages: [message()] }]);
  });

  it.each([
    "https://user:secret@example.test", "https://example.test/#fragment", "https://example.test?x=1",
    "http://example.test", "file:///tmp/memory", "ftp://example.test", "http://127.0.0.1.evil.test", "https://",
  ])("host 边界在网络前拒绝 %#", gumem => {
    expect(() => createTaskClient(options({ productHosts: { gumem } }))).toThrow(sdk.QoniValidationError);
  });

  it("host 双斜杠 base path 不能被原 URL helper 解释成另一 origin", () => {
    expect(() => createTaskClient(options({ productHosts: { gumem: "https://memory.example.test//elsewhere.test" } }))).toThrow(sdk.QoniValidationError);
  });

  it("无 scheme 的服务名/端口默认 HTTPS，原 base path 可验证", async () => {
    let url = "";
    const client = createTaskClient(options({ productHosts: { gumem: "memory.example.test:8443/root/" }, fetch: (async (input, init) => {
      url = String(input);
      return reply({ data: { session_id: JSON.parse(String(init?.body)).session_id } });
    }) as typeof fetch }));
    await client.memory.createSession();
    expect(url).toBe("https://memory.example.test:8443/root/api/sessions");
  });

  it.each([0, -1, NaN, Infinity, 1.5, 2_147_483_648])("非法总 timeout 在网络前拒绝 %#", timeoutMs => {
    expect(() => createTaskClient(options({ timeoutMs }))).toThrow(sdk.QoniValidationError);
  });

  it("显式 null 配置与 factory 额外位置参数失败关闭", () => {
    expect(() => createTaskClient({ ...options(), timeoutMs: null } as unknown as TaskClientOptions)).toThrow(sdk.QoniValidationError);
    expect(() => createTaskClient({ ...options(), fetch: null } as unknown as TaskClientOptions)).toThrow(sdk.QoniValidationError);
    expect(() => (createTaskClient as (...args: any[]) => unknown)(options(), { token: "injected" })).toThrow(sdk.QoniValidationError);
  });

  it("配置不接受任意身份、headers 或其它产品", () => {
    for (const key of ["accessKey", "secretKey", "userId", "sessionId", "token", "headers", "path", "scopes", "product"]) {
      expect(() => createTaskClient({ ...options(), [key]: "injected" } as TaskClientOptions)).toThrow(sdk.QoniValidationError);
    }
    expect(() => createTaskClient({ ...options(), productHosts: { gumem: "https://m.test", webagent: "https://w.test" } } as TaskClientOptions)).toThrow(sdk.QoniValidationError);
  });

  it("create/add/message 各层运行期 allowlist 拒绝额外属性且不污染下一次", async () => {
    let sent = 0;
    const client = createTaskClient(options({ fetch: (async (_url, init) => {
      sent++;
      const body = JSON.parse(String(init?.body));
      return reply(body.session_id ? { session_id: body.session_id } : { request_id: "stable-request", message_count: body.messages.length });
    }) as typeof fetch }));
    for (const key of ["sessionId", "session_id", "userId", "user_id", "token", "headers", "path", "scopes", "product", "raw", "sync", "metadata"]) {
      await expect(invalidCall(client.memory.createSession, { [key]: "injected" })).rejects.toBeInstanceOf(sdk.QoniValidationError);
      await expect(invalidCall(client.memory.addMessages, { messages: [message()], [key]: "injected" })).rejects.toBeInstanceOf(sdk.QoniValidationError);
      await expect(invalidCall(client.memory.addMessages, { messages: [{ ...message(), [key]: "injected" }] })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    }
    expect(sent).toBe(0);
    await client.memory.createSession();
    await client.memory.addMessages({ messages: [message()] });
    expect(sent).toBe(2);
  });

  it("非 own data 属性、symbol、toJSON、额外位置参数不能绕过", async () => {
    const client = createTaskClient(options());
    for (const input of [null, [], Object.create({ sessionId: "elsewhere" }), { [Symbol("token")]: "injected" }, { get signal() { throw new Error("getter must not run"); } }, { toJSON: () => ({ sessionId: "elsewhere" }) }]) {
      await expect(invalidCall(client.memory.createSession, input)).rejects.toBeInstanceOf(sdk.QoniValidationError);
    }
    await expect(invalidCall(client.memory.createSession, {}, { headers: {} })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    await expect(invalidCall(client.memory.addMessages, { messages: [message()] }, { token: "injected" })).rejects.toBeInstanceOf(sdk.QoniValidationError);
  });

  it.each([
    [], [null], [{ role: "user", content: "x" }], [message("")], [message(" ")], [{ ...message(), role: "" }],
    [{ ...message(), content: [] }], [{ ...message(), role: 1 }], [{ ...message(), id: 1 }], [message(), message()],
    [{ ...message(), status: "done" }], [{ ...message(), turn_id: "injected" }], [{ ...message(), resource_urls: ["http://remote.test"] }],
  ].map(messages => ({ messages })))("非法消息批次在 provider 前拒绝 %#", async ({ messages }) => {
    const client = createTaskClient(options());
    await expect(invalidCall(client.memory.addMessages, { messages })).rejects.toBeInstanceOf(sdk.QoniValidationError);
  });

  it("role 按原 GUM 字符串 schema，不自造枚举或空 content 限制", async () => {
    const client = createTaskClient(options());
    await expect(client.memory.addMessages({ messages: [{ id: "system:entry", role: "system", content: "" }, { id: "tool:entry", role: "toolResult", content: "工具合成结果" }] })).resolves.toMatchObject({ data: { message_count: 2 } });
  });

  it("实际 GUM messages 路由只回 request_id/message_count，没有 episode_id", async () => {
    const client = createTaskClient(options({ fetch: (async () => reply({ code: 0, message: "success", data: { request_id: "stable-request", message_count: 1 } })) as typeof fetch }));
    await expect(client.memory.addMessages({ messages: [message()] })).resolves.toEqual({ data: { request_id: "stable-request", message_count: 1 }, meta: {} });
  });

  it("同 ID 内容/role 不可变，整批校验失败不绑定新 ID", async () => {
    const client = createTaskClient(options());
    await client.memory.addMessages({ messages: [message()] });
    await expect(client.memory.addMessages({ messages: [message("next", "first"), message("pi:one", "changed")] })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    await client.memory.addMessages({ messages: [message("next", "second")] });
    await expect(client.memory.addMessages({ messages: [{ ...message(), role: "assistant" }] })).rejects.toBeInstanceOf(sdk.QoniValidationError);
    await client.memory.addMessages({ messages: [message()] });
  });

  it("provider 等待期间原始对象被改动也只发送调用时快照", async () => {
    let resolve!: (value: Awaited<ReturnType<TaskTokenProvider>>) => void;
    const gate = new Promise<Awaited<ReturnType<TaskTokenProvider>>>(r => { resolve = r; });
    let body: any;
    const client = createTaskClient(options({ tokenProvider: async () => gate, fetch: (async (_url, init) => {
      body = JSON.parse(String(init?.body));
      return reply({ request_id: "stable-request", message_count: 1 });
    }) as typeof fetch }));
    const messages = [message()];
    const pending = client.memory.addMessages({ messages });
    messages[0].content = "修改后";
    messages.push(message("next"));
    resolve({ accessToken: "synthetic-test-only", expiresAt: Date.now() + 60_000 });
    await pending;
    expect(body).toEqual({ messages: [message()] });
  });

  it.each([
    {}, { accessToken: "", expiresAt: Date.now() + 60_000 }, { accessToken: " \t", expiresAt: Date.now() + 60_000 },
    { accessToken: "x\r\ninjected", expiresAt: Date.now() + 60_000 }, { accessToken: "x", expiresAt: Infinity },
    { accessToken: "x", expiresAt: NaN }, { accessToken: "x", expiresAt: "99999999999999" }, { accessToken: "x", expiresAt: 1 },
  ])("provider 非法/过期许可不发送 HTTP %#", async value => {
    let sent = false;
    const client = createTaskClient(options({ tokenProvider: (async () => value) as TaskTokenProvider, fetch: (async () => { sent = true; return reply({}); }) as typeof fetch }));
    await expect(client.memory.createSession()).rejects.toBeInstanceOf(sdk.QoniError);
    expect(sent).toBe(false);
  });

  it("不合作 provider 总 timeout 有界退出，迟到许可不发 HTTP", async () => {
    let resolve!: (value: Awaited<ReturnType<TaskTokenProvider>>) => void;
    let sent = false;
    let providerSignal!: AbortSignal;
    const client = createTaskClient(options({ timeoutMs: 20, tokenProvider: async (_p, _s, _r, signal) => {
      providerSignal = signal;
      return new Promise(r => { resolve = r; });
    }, fetch: (async () => { sent = true; return reply({}); }) as typeof fetch }));
    await expect(client.memory.createSession()).rejects.toBeInstanceOf(sdk.QoniTimeoutError);
    expect(providerSignal.aborted).toBe(true);
    resolve({ accessToken: "synthetic-test-only", expiresAt: Date.now() + 60_000 });
    await new Promise(r => setTimeout(r, 20));
    expect(sent).toBe(false);
  });

  it("底层 connect timeout 仍是既有 QoniTimeoutError，不暴露私密 cause", async () => {
    let calls = 0;
    const client = createTaskClient(options({ fetch: (async () => {
      calls++;
      throw new TypeError("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT", privateToken: "synthetic-private-connect-marker" } });
    }) as typeof fetch }));
    const error = await client.memory.createSession().catch(e => e);
    expect(error).toBeInstanceOf(sdk.QoniTimeoutError);
    expect(error.code).toBe("timeout");
    expect(error.cause).toBeUndefined();
    expect(JSON.stringify(error).includes("synthetic-private-connect-marker")).toBe(false);
    expect(calls).toBe(1);
  });

  it("provider 抛私密错误不出现在 cause/message/body/序列化中", async () => {
    const secret = "synthetic-private-provider-marker";
    const client = createTaskClient(options({ tokenProvider: async () => { throw new Error(secret); } }));
    const error = await client.memory.createSession().catch(e => e);
    expect(error).toBeInstanceOf(sdk.QoniAuthError);
    expect(String(error).includes(secret)).toBe(false);
    expect(JSON.stringify(error).includes(secret)).toBe(false);
    expect(error.cause).toBeUndefined();
    expect(error.body).toBeUndefined();
    expect(JSON.stringify(client).includes(secret)).toBe(false);
  });

  it("成功投影不回传等于 token 的 Session 或 URL 编码 token 元信息", async () => {
    const client = createTaskClient(options({ tokenProvider: async () => ({ accessToken: "qoni-run-run-one", expiresAt: Date.now() + 60_000 }) }));
    await expect(client.memory.createSession()).rejects.toBeInstanceOf(sdk.QoniUpstreamError);
    const encodedSecret = "synthetic/private+token=";
    const safe = createTaskClient(options({ tokenProvider: async () => ({ accessToken: encodedSecret, expiresAt: Date.now() + 60_000 }),
      fetch: (async () => reply({ data: { session_id: "qoni-run-run-one" }, meta: { requestId: encodeURIComponent(encodedSecret) } })) as typeof fetch,
    }));
    const result = await safe.memory.createSession();
    expect(JSON.stringify(result).includes(encodeURIComponent(encodedSecret))).toBe(false);
  });

  it("预 abort 不调 provider，私密 reason 不回传；下次合法调用独立", async () => {
    let calls = 0;
    const client = createTaskClient(options({ tokenProvider: async (...args) => { calls++; return grant(...args); } }));
    const controller = new AbortController();
    controller.abort(new Error("synthetic-secret-reason"));
    const error = await client.memory.createSession({ signal: controller.signal }).catch(e => e);
    expect(error.name).toBe("AbortError");
    expect(String(error).includes("synthetic-secret-reason")).toBe(false);
    expect(calls).toBe(0);
    await client.memory.createSession();
    expect(calls).toBe(1);
  });

  it.each([{ session_id: "other" }, { session_id: "" }, { sessionId: "qoni-run-run-one" }, null, [], "unknown"])("Session 响应不能重绑定 %#", async data => {
    const client = createTaskClient(options({ fetch: (async () => reply({ data })) as typeof fetch }));
    await expect(client.memory.createSession()).rejects.toBeInstanceOf(sdk.QoniUpstreamError);
  });

  it("HTTP 401/403/500 与失败 envelope 走 typed error、每次只发一个 POST", async () => {
    for (const [status, payload, Type] of [
      [401, { detail: "denied" }, sdk.QoniAuthError], [403, { detail: "denied" }, sdk.QoniPermissionDeniedError],
      [500, { message: "SQL and private input" }, sdk.QoniUpstreamError],
      [200, { statusCode: 403, message: "denied" }, sdk.QoniPermissionDeniedError],
      [200, { code: 500, message: "SQL and private input", data: null }, sdk.QoniUpstreamError],
    ] as const) {
      let calls = 0;
      const client = createTaskClient(options({ fetch: (async () => { calls++; return reply(payload, status); }) as typeof fetch }));
      const error = await client.memory.createSession().catch(e => e);
      expect(error).toBeInstanceOf(Type);
      expect(calls).toBe(1);
      expect(error.body).toBeUndefined();
      expect(error.cause).toBeUndefined();
      expect(String(error).includes("SQL")).toBe(false);
    }
  });
});
