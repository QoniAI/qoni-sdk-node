import { describe, expect, it } from "vitest";
import { Qoni, QoniValidationError } from "../src";

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const delegationToken = jwt({
  token_type: "eak_delegation_token",
  aud: "genauth:token-exchange",
  eak_tenant_id: "tenant_1",
});
const productExp = 1_900_000_000;
const productToken = jwt({
  aud: "webagent",
  sub: "user_1",
  exp: productExp,
  scope: "webagent.do_anything:manage webagent.do_anything:read webagent.site_login:request",
  product_resource: { type: "webagent_tenant", id: "proj_1" },
});

type Call = { url: string; init?: RequestInit; body?: unknown };

function platformClient(calls: Call[]) {
  return new Qoni({
    accessKey: "ak_test",
    secretKey: "sk_test",
    host: "https://qoni.example.com",
    webAgentHost: "https://webagent.example.com",
    fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ url: String(url), init, body });
      if (String(url).endsWith("/api/v3/eak/delegations")) {
        return jsonResponse({
          data: {
            mode: "silent",
            tokenType: "Bearer",
            token: delegationToken,
            expiresIn: 3600,
            grantId: "grant_1",
            auditId: "audit_1",
          },
        });
      }
      if (String(url).endsWith("/api/v3/eak/token-exchange")) {
        return jsonResponse({ data: { accessToken: productToken, tokenType: "Bearer" } });
      }
      return jsonResponse({ error: "unexpected" }, 500);
    }) as typeof fetch,
  });
}

describe("webAgentGrant", () => {
  it("delegates silently for one user and returns that user's WebAgent token", async () => {
    const calls: Call[] = [];
    const grant = await platformClient(calls).webAgentGrant({
      userId: " user_1 ",
      products: ["doAnything"],
      scopes: ["webagent.site_login:request"],
    });

    expect(calls.map((call) => call.url)).toEqual([
      "https://qoni.example.com/api/v3/eak/delegations",
      "https://qoni.example.com/api/v3/eak/token-exchange",
    ]);
    expect(calls[0].body).toMatchObject({
      mode: "silent",
      userId: "user_1",
      agent: "sdk",
      scopes: ["webagent.do_anything:read", "webagent.do_anything:manage", "webagent.site_login:request"],
    });
    expect(calls[1].body).toEqual({
      subjectToken: delegationToken,
      resource: "webagent",
      scopes: ["webagent.do_anything:manage", "webagent.do_anything:read", "webagent.site_login:request"],
    });
    for (const call of calls) {
      expect((call.init?.headers as Record<string, string>).authorization).toMatch(/^authing ak_test:/);
    }
    expect(grant).toEqual({
      token: productToken,
      expiresAt: productExp * 1000,
      webAgentHost: "https://webagent.example.com",
      userId: "user_1",
      scopes: ["webagent.do_anything:manage", "webagent.do_anything:read", "webagent.site_login:request"],
    });
  });

  it("requires a user and at least one WebAgent scope before any request", async () => {
    const calls: Call[] = [];
    const client = platformClient(calls);
    await expect(client.webAgentGrant({ userId: "", products: ["doAnything"] })).rejects.toThrow(
      /userId is required/,
    );
    await expect(client.webAgentGrant({ userId: "user_1" })).rejects.toThrow(/pass scopes and\/or products/);
    await expect(
      client.webAgentGrant({ userId: "user_1", scopes: ["gumem.memory:read"] }),
    ).rejects.toThrow(/only WebAgent scopes can be granted; remove gumem.memory:read/);
    expect(calls).toEqual([]);
  });
});

describe("Qoni without an AccessKey", () => {
  it("runs WebAgent calls with a granted token and never signs", async () => {
    const calls: Call[] = [];
    const app = new Qoni({
      webAgentHost: "https://webagent.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        return jsonResponse({ available: 42 });
      }) as typeof fetch,
    });

    const credits = await app.workspace.credits({ token: productToken });

    expect(credits).toEqual({ available: 42 });
    expect(calls.map((call) => call.url)).toEqual([
      "https://webagent.example.com/api/v1/projects/proj_1/billing/credits",
    ]);
    expect((calls[0].init?.headers as Record<string, string>).authorization).toBe(`Bearer ${productToken}`);
  });

  it("refuses AccessKey work with one clear error and sends nothing", async () => {
    const calls: Call[] = [];
    const app = new Qoni({
      webAgentHost: "https://webagent.example.com",
      fetch: (async (url: URL | RequestInfo) => {
        calls.push({ url: String(url) });
        return jsonResponse({});
      }) as typeof fetch,
    });

    await expect(app.webAgentGrant({ userId: "user_1", products: ["doAnything"] })).rejects.toBeInstanceOf(
      QoniValidationError,
    );
    await expect(app.delegateToken({ userId: "user_1", products: ["doAnything"] })).rejects.toThrow(
      /needs the AccessKey\. This client was created with only webAgentHost/,
    );
    await expect(app.workspace.credits({ token: delegationToken })).rejects.toThrow(
      /Exchanging a delegation token needs the AccessKey/,
    );
    await expect(app.gumem.recall({ token: productToken, sessionId: "s", query: "q" })).rejects.toThrow(
      /needs the AccessKey/,
    );
    await expect(app.genauth.users.list()).rejects.toThrow(/GenAuth management needs the AccessKey/);
    await expect(app.unstableRequest({ method: "GET", path: "/api/v3/eak/runtime-config" })).rejects.toThrow(
      /A signed request needs the AccessKey/,
    );
    expect(calls).toEqual([]);
  });

  it("still requires both keys, or webAgentHost, at construction", () => {
    expect(() => new Qoni({})).toThrow(/requires accessKey and secretKey/);
    expect(() => new Qoni({ accessKey: "ak_only", webAgentHost: "https://webagent.example.com" })).toThrow(
      /requires accessKey and secretKey/,
    );
    expect(() => new Qoni({ webAgentBaseUrl: "https://webagent.example.com" })).not.toThrow();
  });
});
