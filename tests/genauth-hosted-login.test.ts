import { describe, expect, expectTypeOf, it } from "vitest";
import {
  Qoni,
  QoniError,
  QoniTimeoutError,
  QoniUpstreamError,
  QoniValidationError,
  type CreateLoginUrlInput,
  type ExchangeLoginCodeInput,
  type LoginSession,
  type LoginUrl,
  type SignedInUser,
} from "../src";

// G2-B：genauth.auth.createLoginUrl / exchangeLoginCode。
// 只经既有签名 POST 到 Qoni host；严格输入（未声明字段、空白、畸形回调在 HTTP 之前拒绝）；
// 严格输出（缺 isNewUser 等不补默认值）；GA wire 200 + envelope 失败、HTTP 非 2xx、超时都抛错且不重试。

const HOST = "https://qoni.example.test";
const LOGIN_URL_PATH = "/api/v3/eak/genauth/auth/login-url";
const EXCHANGE_PATH = "/api/v3/eak/genauth/auth/exchange-login-code";
const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });

interface Call { url: URL; method: string; headers: Record<string, string>; body?: Record<string, unknown> }

function harness(reply: (call: Call, n: number) => Response | Promise<Response>, options: { timeoutMs?: number } = {}) {
  const calls: Call[] = [];
  const client = new Qoni({
    accessKey: "ak_test",
    secretKey: "sk_test",
    host: HOST,
    timeoutMs: options.timeoutMs,
    fetch: (async (url, init) => {
      const call: Call = {
        url: new URL(String(url)),
        method: init?.method ?? "GET",
        headers: Object.fromEntries(Object.entries((init?.headers ?? {}) as Record<string, string>)),
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      };
      calls.push(call);
      return reply(call, calls.length);
    }) as typeof fetch,
  });
  return { client, calls };
}

const okUrl = () => json({ statusCode: 200, message: "", data: { url: "https://pool.example.test/api/v3/eak/genauth/auth/login/ref_123", expiresAt: "2026-10-08T03:10:00.000Z" } });
const session = (overrides: Record<string, unknown> = {}, user: Record<string, unknown> = {}) => ({
  statusCode: 200,
  data: {
    user: { id: "user_1", email: "a@example.test", name: "A", isNewUser: true, ...user },
    accessToken: "at", idToken: "it", expiresIn: 1209600, ...overrides,
  },
});

describe("genauth.auth.createLoginUrl", () => {
  it("signs one POST to the Qoni host with exactly the declared fields and returns {url, expiresAt}", async () => {
    const { client, calls } = harness(() => okUrl());
    const out = await client.genauth.auth.createLoginUrl({ redirectUri: "https://app.example.test/callback", state: "csrf-1" });
    expect(out).toEqual({ url: "https://pool.example.test/api/v3/eak/genauth/auth/login/ref_123", expiresAt: "2026-10-08T03:10:00.000Z" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url.origin + calls[0].url.pathname).toBe(HOST + LOGIN_URL_PATH);
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toEqual({ redirectUri: "https://app.example.test/callback", state: "csrf-1" });
    expect(calls[0].headers.authorization).toMatch(/^authing ak_test:/);
    expect(calls[0].headers["x-authing-date"]).toMatch(/^\d+$/);
    expect(JSON.stringify(calls[0])).not.toContain("sk_test");
  });

  it("passes screen through only when given", async () => {
    const { client, calls } = harness(() => okUrl());
    await client.genauth.auth.createLoginUrl({ redirectUri: "http://127.0.0.1:3000/cb", state: "s", screen: "signup" });
    await client.genauth.auth.createLoginUrl({ redirectUri: "http://127.0.0.1:3000/cb", state: "s", screen: "login" });
    expect(calls.map((c) => c.body)).toEqual([
      { redirectUri: "http://127.0.0.1:3000/cb", state: "s", screen: "signup" },
      { redirectUri: "http://127.0.0.1:3000/cb", state: "s", screen: "login" },
    ]);
  });

  const badInputs: Array<[string, unknown]> = [
    ["not an object", "https://app.example.test/cb"],
    ["missing redirectUri", { state: "s" }],
    ["blank redirectUri", { redirectUri: "   ", state: "s" }],
    ["relative redirectUri", { redirectUri: "/callback", state: "s" }],
    ["non-http redirectUri", { redirectUri: "javascript:alert(1)", state: "s" }],
    ["redirectUri with fragment", { redirectUri: "https://app.example.test/cb#x", state: "s" }],
    ["redirectUri with surrounding whitespace", { redirectUri: " https://app.example.test/cb", state: "s" }],
    ["redirectUri with credentials", { redirectUri: "https://u:p@app.example.test/cb", state: "s" }],
    ["missing state", { redirectUri: "https://app.example.test/cb" }],
    ["blank state", { redirectUri: "https://app.example.test/cb", state: " \t " }],
    ["non-string state", { redirectUri: "https://app.example.test/cb", state: 42 }],
    ["state with control characters", { redirectUri: "https://app.example.test/cb", state: "a\u0000b" }],
    ["overlong state", { redirectUri: "https://app.example.test/cb", state: "x".repeat(2049) }],
    ["unknown screen", { redirectUri: "https://app.example.test/cb", state: "s", screen: "admin" }],
    ["clientId", { redirectUri: "https://app.example.test/cb", state: "s", clientId: "evil" }],
    ["clientSecret", { redirectUri: "https://app.example.test/cb", state: "s", clientSecret: "x" }],
    ["issuer", { redirectUri: "https://app.example.test/cb", state: "s", issuer: "https://evil.test" }],
    ["tokenUrl", { redirectUri: "https://app.example.test/cb", state: "s", tokenUrl: "https://evil.test/token" }],
    ["nonce", { redirectUri: "https://app.example.test/cb", state: "s", nonce: "n" }],
  ];
  for (const [name, input] of badInputs) {
    it(`rejects ${name} before any HTTP`, async () => {
      const { client, calls } = harness(() => okUrl());
      await expect(client.genauth.auth.createLoginUrl(input as CreateLoginUrlInput)).rejects.toBeInstanceOf(QoniValidationError);
      expect(calls).toHaveLength(0);
    });
  }

  for (const [name, data] of [
    ["missing url", { expiresAt: "2026-10-08T03:10:00.000Z" }],
    ["non-http url", { url: "javascript:alert(1)", expiresAt: "2026-10-08T03:10:00.000Z" }],
    ["missing expiresAt", { url: "https://pool.example.test/x" }],
    ["unparseable expiresAt", { url: "https://pool.example.test/x", expiresAt: "soon" }],
  ] as const) {
    it(`treats a success envelope with ${name} as an upstream error`, async () => {
      const { client, calls } = harness(() => json({ statusCode: 200, data }));
      await expect(client.genauth.auth.createLoginUrl({ redirectUri: "https://app.example.test/cb", state: "s" })).rejects.toBeInstanceOf(QoniUpstreamError);
      expect(calls).toHaveLength(1);
    });
  }

  it("drops undeclared response fields", async () => {
    const { client } = harness(() => json({ statusCode: 200, data: { url: "https://pool.example.test/x", expiresAt: "2026-10-08T03:10:00.000Z", txId: "leak", clientSecret: "leak" } }));
    const out = await client.genauth.auth.createLoginUrl({ redirectUri: "https://app.example.test/cb", state: "s" });
    expect(Object.keys(out).sort()).toEqual(["expiresAt", "url"]);
  });
});

describe("genauth.auth.exchangeLoginCode", () => {
  it("signs one POST with {code, redirectUri} and returns the contract shape", async () => {
    const { client, calls } = harness(() => json(session({ refreshToken: "rt", scope: "openid" }, { phone: "+15550001111", extra: "x" })));
    const out = await client.genauth.auth.exchangeLoginCode({ code: "code_1", redirectUri: "https://app.example.test/callback" });
    expect(out).toEqual({
      user: { id: "user_1", email: "a@example.test", phone: "+15550001111", name: "A", isNewUser: true },
      accessToken: "at", idToken: "it", expiresIn: 1209600,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].url.pathname).toBe(EXCHANGE_PATH);
    expect(calls[0].body).toEqual({ code: "code_1", redirectUri: "https://app.example.test/callback" });
    expect(calls[0].headers.authorization).toMatch(/^authing ak_test:/);
  });

  it("keeps isNewUser=false and omits absent optional profile fields", async () => {
    const { client } = harness(() => json(session({}, { email: undefined, name: null, isNewUser: false })));
    const out = await client.genauth.auth.exchangeLoginCode({ code: "c", redirectUri: "https://app.example.test/cb" });
    expect(out.user).toEqual({ id: "user_1", isNewUser: false });
  });

  for (const [name, data] of [
    ["missing isNewUser", session({}, { isNewUser: undefined }).data],
    ["string isNewUser", session({}, { isNewUser: "true" }).data],
    ["missing user id", session({}, { id: "" }).data],
    ["missing accessToken", session({ accessToken: undefined }).data],
    ["missing idToken", session({ idToken: "" }).data],
    ["non-integer expiresIn", session({ expiresIn: 1.5 }).data],
    ["non-positive expiresIn", session({ expiresIn: 0 }).data],
    ["non-string email", session({}, { email: 7 }).data],
  ] as const) {
    it(`rejects a success envelope with ${name} (no defaults are invented)`, async () => {
      const { client } = harness(() => json({ statusCode: 200, data }));
      await expect(client.genauth.auth.exchangeLoginCode({ code: "c", redirectUri: "https://app.example.test/cb" })).rejects.toBeInstanceOf(QoniUpstreamError);
    });
  }

  for (const [name, input] of [
    ["blank code", { code: "  ", redirectUri: "https://app.example.test/cb" }],
    ["non-string code", { code: 1, redirectUri: "https://app.example.test/cb" }],
    ["missing redirectUri", { code: "c" }],
    ["malformed redirectUri", { code: "c", redirectUri: "not a url" }],
    ["codeVerifier", { code: "c", redirectUri: "https://app.example.test/cb", codeVerifier: "v" }],
    ["clientId", { code: "c", redirectUri: "https://app.example.test/cb", clientId: "x" }],
    ["state", { code: "c", redirectUri: "https://app.example.test/cb", state: "s" }],
  ] as const) {
    it(`rejects ${name} before any HTTP`, async () => {
      const { client, calls } = harness(() => json(session()));
      await expect(client.genauth.auth.exchangeLoginCode(input as unknown as ExchangeLoginCodeInput)).rejects.toBeInstanceOf(QoniValidationError);
      expect(calls).toHaveLength(0);
    });
  }

  it("surfaces GA wire-200 envelope failures as typed errors with the backend code, without retry", async () => {
    const { client, calls } = harness(() => json({ statusCode: 409, code: "eak.credential.binding_mismatch", message: "binding changed", requestId: "req_1", details: { reason: "binding_mismatch" } }));
    const error = await client.genauth.auth.exchangeLoginCode({ code: "c", redirectUri: "https://app.example.test/cb" }).catch((e) => e);
    expect(error).toBeInstanceOf(QoniError);
    expect(error.code).toBe("eak.credential.binding_mismatch");
    expect(error.status).toBe(409);
    expect(error.requestId).toBe("req_1");
    expect(calls).toHaveLength(1);
  });

  it("surfaces envelope 403 and 400 codes from the hosted-login entry", async () => {
    for (const [statusCode, code] of [[403, "eak.hosted_login.binding_mismatch"], [400, "eak.hosted_login.code_invalid"]] as const) {
      const { client, calls } = harness(() => json({ statusCode, code, message: "x" }));
      const error = await client.genauth.auth.exchangeLoginCode({ code: "c", redirectUri: "https://app.example.test/cb" }).catch((e) => e);
      expect(error.code).toBe(code);
      expect(error.status).toBe(statusCode);
      expect(calls).toHaveLength(1);
    }
  });

  it("treats non-2xx HTTP (including OAuth-shaped bodies) as errors, without retry", async () => {
    for (const [status, body] of [[500, { message: "boom" }], [502, undefined], [400, { error: "invalid_grant" }]] as const) {
      const { client, calls } = harness(() => new Response(body === undefined ? "bad gateway" : JSON.stringify(body), { status }));
      await expect(client.genauth.auth.exchangeLoginCode({ code: "c", redirectUri: "https://app.example.test/cb" })).rejects.toBeInstanceOf(QoniError);
      expect(calls).toHaveLength(1);
    }
  });

  it("times out once and does not retry the exchange", async () => {
    const { client, calls } = harness(() => new Promise<Response>(() => undefined), { timeoutMs: 20 });
    await expect(client.genauth.auth.exchangeLoginCode({ code: "c", redirectUri: "https://app.example.test/cb" })).rejects.toBeInstanceOf(QoniTimeoutError);
    expect(calls).toHaveLength(1);
  });

  it("reports network failures once without retry", async () => {
    const { client, calls } = harness(() => { throw new TypeError("fetch failed"); });
    await expect(client.genauth.auth.exchangeLoginCode({ code: "c", redirectUri: "https://app.example.test/cb" })).rejects.toBeInstanceOf(QoniUpstreamError);
    expect(calls).toHaveLength(1);
  });
});

describe("public types", () => {
  it("match the design contract shapes", () => {
    expectTypeOf<CreateLoginUrlInput>().toEqualTypeOf<{ redirectUri: string; state: string; screen?: "login" | "signup" }>();
    expectTypeOf<LoginUrl>().toEqualTypeOf<{ url: string; expiresAt: string }>();
    expectTypeOf<ExchangeLoginCodeInput>().toEqualTypeOf<{ code: string; redirectUri: string }>();
    expectTypeOf<SignedInUser>().toEqualTypeOf<{ id: string; email?: string; phone?: string; name?: string; isNewUser: boolean }>();
    expectTypeOf<LoginSession>().toEqualTypeOf<{ user: SignedInUser; accessToken: string; idToken: string; expiresIn: number }>();
    expectTypeOf<Qoni["genauth"]["auth"]["createLoginUrl"]>().toEqualTypeOf<(input: CreateLoginUrlInput) => Promise<LoginUrl>>();
    expectTypeOf<Qoni["genauth"]["auth"]["exchangeLoginCode"]>().toEqualTypeOf<(input: ExchangeLoginCodeInput) => Promise<LoginSession>>();
  });
});
