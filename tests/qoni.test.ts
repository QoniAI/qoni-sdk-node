import { describe, expect, it, vi } from "vitest";
import {
  Qoni,
  QoniPermissionDeniedError,
  QoniScopes,
  QoniScopeBundles,
  QoniAgentKit,
  buildStringToSign,
} from "../src";
// Raw wire-type catalog is internal (not a public export) — import via the
// internal module for the wire-shape fixtures/assertions in this file.
import { WireEventTypes } from "../src/events";
import { buildSignedHeaders } from "../src/auth";
import type { QoniOptions } from "../src";
import * as sdk from "../src";

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
}

function sseResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

describe("QoniAgentKit", () => {
  it("generates unique signatures for identical requests in the same millisecond", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    try {
      const credentials = { accessKey: "ak_test", secretKey: "sk_test" };
      const first = buildSignedHeaders(credentials, "GET", "/api/v3/qoni/runtime-config", {});
      const second = buildSignedHeaders(credentials, "GET", "/api/v3/qoni/runtime-config", {});

      expect(Number(second["x-authing-date"])).toBeGreaterThan(
        Number(first["x-authing-date"]),
      );
      expect(second.authorization).not.toBe(first.authorization);
    } finally {
      now.mockRestore();
    }
  });

  it("keeps QoniAgentKit as the public constructor and Qoni as its alias", () => {
    expect(QoniAgentKit.name).toBe("QoniAgentKit");
    expect(Qoni).toBe(QoniAgentKit);
    expect("QnoiAgentKit" in sdk).toBe(false);
  });

  it("signs delegateToken requests with accessKey/secretKey and returns token", async () => {
    const seen: { url?: string; init?: RequestInit; body?: unknown } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      genauthBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.init = init;
        seen.body = JSON.parse(String(init?.body));
        return jsonResponse({
          data: {
            mode: "silent",
            tokenType: "Bearer",
            delegateAgentToken: "token",
            expiresIn: 3600,
            grantId: "grant",
            auditId: "audit",
          },
          meta: { requestId: "req_1" },
        });
      }) as typeof fetch,
    });

    const result = await client.delegateToken({
      user: { id: "user_1", subject: "user_1", name: "Test User" },
      agent: "research-assistant",
      scopes: QoniScopeBundles.DO_ANYTHING,
      mode: "silent",
    });

    expect(seen.url).toBe("https://qoni.example.com/api/v3/qoni/delegations");
    expect(seen.init?.method).toBe("POST");
    const headers = seen.init?.headers as Record<string, string>;
    expect(headers.authorization).toMatch(/^authing ak_test:/);
    expect(headers["x-authing-signature-method"]).toBe("HMAC-SHA1");
    expect(seen.body).toMatchObject({
      user: { id: "user_1", subject: "user_1", name: "Test User" },
      agent: "research-assistant",
    });
    expect(result.data).toMatchObject({ token: "token", delegateAgentToken: "token" });
    expect(result.meta).toEqual({ requestId: "req_1" });
  });

  it("can initialize with only Qoni AK/SK and exposes currentUser at the top level", async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.init = init;
        return jsonResponse({
          data: {
            id: "user_1",
            subject: "user_1",
            name: "Test User",
          },
        });
      }) as typeof fetch,
    });

    const user = await client.currentUser({ accessToken: "genauth-access-token" });

    expect(seen.url).toBe("https://anima.eazo.ai/oidc/me");
    expect((seen.init?.headers as Record<string, string>).authorization).toBe(
      "Bearer genauth-access-token",
    );
    expect(user.data).toMatchObject({ id: "user_1", subject: "user_1" });
  });

  it("uses the dashboard base path for default runtime discovery", async () => {
    const calls: string[] = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      fetch: (async (url: URL | RequestInfo) => {
        calls.push(String(url));
        if (String(url) === "https://anima.eazo.ai/dashboard/api/v3/qoni/runtime-config") {
          return jsonResponse({
            data: {
              qoniBaseUrl: "https://qoni-runtime.example.com",
            },
          });
        }
        return jsonResponse({
          data: {
            token: "token",
            tokenType: "Bearer",
            expiresIn: 3600,
            grantId: "grant",
            auditId: "audit",
          },
        });
      }) as typeof fetch,
    });

    await client.delegateToken({
      userId: "user_1",
      agent: "support-assistant",
      scopes: ["gumem.memory:read"],
      mode: "silent",
    });

    expect(calls).toEqual([
      "https://anima.eazo.ai/dashboard/api/v3/qoni/runtime-config",
      "https://anima.eazo.ai/dashboard/api/v3/qoni/delegations",
    ]);
  });

  it("preserves the configured base path for signed JSON requests", async () => {
    const calls: string[] = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com/dashboard",
      fetch: (async (url: URL | RequestInfo) => {
        calls.push(String(url));
        if (String(url) === "https://qoni.example.com/dashboard/api/v3/qoni/runtime-config") {
          return jsonResponse({
            data: {
              qoniBaseUrl: "https://qoni-runtime.example.com/sdk",
            },
          });
        }
        return jsonResponse({
          data: {
            token: "token",
            tokenType: "Bearer",
            expiresIn: 3600,
            grantId: "grant",
            auditId: "audit",
          },
        });
      }) as typeof fetch,
    });

    await client.delegateToken({
      userId: "user_1",
      agent: "support-assistant",
      scopes: ["gumem.memory:read"],
      mode: "silent",
    });

    expect(calls).toEqual([
      "https://qoni.example.com/dashboard/api/v3/qoni/runtime-config",
      "https://qoni.example.com/dashboard/api/v3/qoni/delegations",
    ]);
  });

  it("exposes delegateToken through the Qoni namespace", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse({
          data: {
            token: "namespace-token",
            tokenType: "Bearer",
            expiresIn: 3600,
            grantId: "grant",
            auditId: "audit",
          },
        })) as typeof fetch,
    });

    const result = await client.qoni.delegateToken({
      user: { id: "user_1" },
      agent: "support-assistant",
      scopes: [QoniScopes.GUMEM_MEMORY_READ],
      mode: "silent",
    });

    expect(result.data).toMatchObject({
      token: "namespace-token",
      delegateAgentToken: "namespace-token",
    });
  });

  it("creates interactive delegateToken grants without user or userId", async () => {
    const seen: { url?: string; init?: RequestInit; body?: unknown } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.init = init;
        seen.body = JSON.parse(String(init?.body));
        return jsonResponse({
          data: {
            mode: "interactive",
            authorizationUrl: "https://qoni.example.com/authorize?grant_id=grant_interactive",
            grantId: "grant_interactive",
            grantState: "grant_state_1",
            requestedScopes: ["gumem.memory:read", "webagent.do_anything:manage"],
          },
          meta: { requestId: "req_interactive" },
        });
      }) as typeof fetch,
    });

    const result = await client.delegateToken({
      mode: "interactive",
      redirectUri: "https://app.example.com/qoni/callback",
      state: "business_state_1",
      agent: "research-assistant",
      scopes: ["gumem.memory:read", "webagent.do_anything:manage"],
    });

    expect(seen.url).toBe("https://qoni.example.com/api/v3/qoni/delegations");
    expect(seen.init?.method).toBe("POST");
    expect(seen.body).toEqual({
      mode: "interactive",
      redirectUri: "https://app.example.com/qoni/callback",
      state: "business_state_1",
      agent: "research-assistant",
      scopes: ["gumem.memory:read", "webagent.do_anything:manage"],
    });
    expect(result.data).toMatchObject({
      mode: "interactive",
      authorizationUrl: "https://qoni.example.com/authorize?grant_id=grant_interactive",
      grantId: "grant_interactive",
      grantState: "grant_state_1",
      state: "grant_state_1",
      requestedScopes: ["gumem.memory:read", "webagent.do_anything:manage"],
    });
  });

  it("rejects a silent delegateToken with no user locally, before any request", async () => {
    let fetched = false;
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      fetch: (async () => {
        fetched = true;
        return jsonResponse({ data: {}, meta: {} });
      }) as typeof fetch,
    });

    await expect(
      // No `user` / `userId` and not interactive — must fail locally.
      (client.delegateToken as (input: unknown) => Promise<unknown>)({
        products: ["doAnything"],
      }),
    ).rejects.toMatchObject({
      name: "QoniValidationError",
      message: expect.stringContaining("silent mode requires a user"),
    });
    expect(fetched).toBe(false);
  });

  it("normalizes interactive delegateToken state into grantState and state", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse({
          data: {
            mode: "interactive",
            authorizationUrl: "https://qoni.example.com/authorize?grant_id=grant_interactive",
            grantId: "grant_interactive",
            state: "legacy_state_1",
          },
        })) as typeof fetch,
    });

    const result = await client.delegateToken({
      mode: "interactive",
      redirectUri: "https://app.example.com/qoni/callback",
      state: "business_state_1",
      agent: "research-assistant",
      scopes: ["gumem.memory:read"],
    });

    expect(result.data).toMatchObject({
      authorizationUrl: "https://qoni.example.com/authorize?grant_id=grant_interactive",
      grantId: "grant_interactive",
      grantState: "legacy_state_1",
      state: "legacy_state_1",
    });
  });

  it("falls back interactive delegateToken state fields to grantId when upstream omits state", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse({
          data: {
            mode: "interactive",
            authorizationUrl: "https://qoni.example.com/authorize?grant_id=grant_without_state",
            grantId: "grant_without_state",
          },
        })) as typeof fetch,
    });

    const result = await client.delegateToken({
      mode: "interactive",
      redirectUri: "https://app.example.com/qoni/callback",
      state: "business_state_1",
      agent: "research-assistant",
      scopes: ["gumem.memory:read"],
    });

    expect(result.data).toMatchObject({
      grantId: "grant_without_state",
      grantState: "grant_without_state",
      state: "grant_without_state",
    });
  });

  it("returns mode-specific delegateToken result types", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse({
          data: {
            mode: "interactive",
            authorizationUrl: "https://qoni.example.com/authorize?grant_id=grant_type",
            grantId: "grant_type",
          },
        })) as typeof fetch,
    });

    const interactive = await client.delegateToken({
      mode: "interactive",
      redirectUri: "https://app.example.com/qoni/callback",
      state: "business_state_1",
      agent: "research-assistant",
      scopes: ["gumem.memory:read"],
    });

    const authorizationUrl: string = interactive.data.authorizationUrl;
    const grantState: string = interactive.data.grantState;
    const interactiveMode: "interactive" = interactive.data.mode;
    expect(authorizationUrl).toContain("grant_type");
    expect(grantState).toBe("grant_type");
    expect(interactiveMode).toBe("interactive");

    if (false) {
      const silent = await client.delegateToken({
        userId: "user_1",
        agent: "research-assistant",
        scopes: ["gumem.memory:read"],
      });
      const silentMode: "silent" = silent.data.mode;
      expect(silentMode).toBe("silent");
    }

    if (false) {
      // @ts-expect-error silent mode requires user or userId
      client.delegateToken({
        agent: "research-assistant",
        scopes: ["gumem.memory:read"],
        mode: "silent",
      });
      // @ts-expect-error omitted mode is silent and still requires user or userId
      client.delegateToken({
        agent: "research-assistant",
        scopes: ["gumem.memory:read"],
      });
      // @ts-expect-error interactive mode requires redirectUri and state
      client.delegateToken({
        mode: "interactive",
        agent: "research-assistant",
        scopes: ["gumem.memory:read"],
      });
      client.delegateToken({
        userId: "user_1",
        // @ts-expect-error agent must be a string id for the GenAuth delegation DTO
        agent: { id: "research-assistant", name: "Research Assistant" },
        scopes: ["gumem.memory:read"],
      });
    }
  });

  it("treats GenAuth statusCode error envelopes as SDK errors", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse({
          statusCode: 403,
          message: "scope is not allowed",
          requestId: "req_denied",
        })) as typeof fetch,
    });

    await expect(
      client.delegateToken({
        user: { id: "user_1" },
        agent: "do_anything",
        scopes: [QoniScopes.GUMEM_MEMORY_READ],
        mode: "silent",
      }),
    ).rejects.toMatchObject({
      name: "QoniPermissionDeniedError",
      status: 403,
      requestId: "req_denied",
    });
  });

  it("preserves GenAuth apiCode fields from statusCode error envelopes", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse({
          statusCode: 403,
          apiCode: "qoni.delegation.user_not_bound",
          message: "userId is not valid for this Qoni credential",
          requestId: "req_user_not_bound",
        })) as typeof fetch,
    });

    await expect(
      client.delegateToken({
        user: { id: "missing_user" },
        agent: "memory_agent",
        scopes: [QoniScopes.GUMEM_MEMORY_READ],
        mode: "silent",
      }),
    ).rejects.toMatchObject({
      name: "QoniPermissionDeniedError",
      code: "qoni.delegation.user_not_bound",
      // The backend message is preserved, with an actionable onboarding hint appended.
      message: expect.stringContaining("userId is not valid for this Qoni credential"),
      status: 403,
      requestId: "req_user_not_bound",
    });
    await expect(
      client.delegateToken({
        user: { id: "missing_user" },
        agent: "memory_agent",
        scopes: [QoniScopes.GUMEM_MEMORY_READ],
        mode: "silent",
      }),
    ).rejects.toThrow(/resolveAnyBoundUser/);
  });

  it("keeps delegateAgent and completeDelegateAgent as deprecated compatibility aliases", async () => {
    const seen: { bodies: unknown[] } = { bodies: [] };
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      genauthBaseUrl: "https://qoni.example.com",
      fetch: (async (_url: URL | RequestInfo, init?: RequestInit) => {
        seen.bodies.push(JSON.parse(String(init?.body)));
        return jsonResponse({
          data: {
            mode: "interactive",
            tokenType: "Bearer",
            token: "token_interactive",
            expiresIn: 3600,
            grantId: "grant_1",
            auditId: "audit_1",
          },
        });
      }) as typeof fetch,
    });

    const result = await client.completeDelegateAgent({
      grantId: "grant_1",
      code: "code_1",
      state: "state_1",
    });
    const alias = client.delegateAgent({
      user: { id: "user_1" },
      agent: "compat_agent",
      scopes: [QoniScopes.GUMEM_MEMORY_READ],
      mode: "silent",
    });

    expect(seen.bodies[0]).toEqual({ grantId: "grant_1", code: "code_1", state: "state_1" });
    expect(result.data).toMatchObject({
      token: "token_interactive",
      delegateAgentToken: "token_interactive",
    });
    await expect(alias).resolves.toMatchObject({
      data: { token: "token_interactive", delegateAgentToken: "token_interactive" },
    });
  });

  it("exposes completeDelegateToken as the recommended callback helper", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
        return jsonResponse({
          data: {
            token: `token_${calls.length}`,
            tokenType: "Bearer",
            expiresIn: 3600,
            grantId: "grant_1",
            auditId: "audit_1",
          },
        });
      }) as typeof fetch,
    });

    const result = await client.completeDelegateToken({
      grantId: "grant_1",
      code: "code_1",
      state: "state_1",
    });
    const namespaceResult = await client.qoni.completeDelegateToken({
      grantId: "grant_2",
      code: "code_2",
      state: "state_2",
    });

    expect(calls).toEqual([
      {
        url: "https://qoni.example.com/api/v3/qoni/delegations/complete",
        body: { grantId: "grant_1", code: "code_1", state: "state_1" },
      },
      {
        url: "https://qoni.example.com/api/v3/qoni/delegations/complete",
        body: { grantId: "grant_2", code: "code_2", state: "state_2" },
      },
    ]);
    expect(result.data).toMatchObject({
      token: "token_1",
      delegateAgentToken: "token_1",
    });
    expect(namespaceResult.data).toMatchObject({
      token: "token_2",
      delegateAgentToken: "token_2",
    });

    if (false) {
      // @ts-expect-error current callback contract requires grantId
      client.completeDelegateToken({ code: "code_1", state: "state_1" });
    }
  });

  it("exposes GenAuth helpers through the Qoni gateway host", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      genauthBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.genauth.userInfo({ accessToken: "genauth-access-token" });
    await client.genauth.introspectDelegationToken({ token: "delegate-token" });

    expect(calls.map((call) => call.url)).toEqual([
      "https://qoni.example.com/oidc/me",
      "https://qoni.example.com/api/v3/qoni/delegations/introspect",
    ]);
    expect(calls[0].init?.method).toBe("GET");
    expect((calls[0].init?.headers as Record<string, string>).authorization).toBe(
      "Bearer genauth-access-token",
    );
    expect(calls[1].init?.method).toBe("POST");
    expect(JSON.parse(String(calls[1].init?.body))).toEqual({
      token: "delegate-token",
    });
  });

  it("exchanges AK/SK for a GenAuth admin token before listing users", async () => {
    const calls: Array<{ url: string; init?: RequestInit; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      genauthBaseUrl: "https://tenant-a.genauth.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        const body = init?.body ? JSON.parse(String(init.body)) : undefined;
        calls.push({ url: String(url), init, body });
        if (String(url) === "https://qoni.example.com/api/v3/qoni/genauth/admin-token") {
          return jsonResponse({
            data: {
              accessToken: "genauth-admin-token",
              tokenType: "Bearer",
              userPoolId: "up_1",
            },
          });
        }
        return jsonResponse({ data: { list: [{ userId: "user_1" }], totalCount: 1 } });
      }) as typeof fetch,
    });

    const result = await client.genauth.users.list({ page: 1, limit: 20 });

    expect(result.data).toMatchObject({ totalCount: 1 });
    expect(calls.map((call) => call.url)).toEqual([
      "https://qoni.example.com/api/v3/qoni/genauth/admin-token",
      "https://tenant-a.genauth.example.com/api/v3/list-users",
    ]);
    expect(calls[0].body).toEqual({});
    expect((calls[0].init?.headers as Record<string, string>).authorization).toMatch(
      /^authing ak_test:/,
    );
    expect(calls[1].init?.method).toBe("POST");
    expect((calls[1].init?.headers as Record<string, string>).authorization).toBe(
      "Bearer genauth-admin-token",
    );
    expect((calls[1].init?.headers as Record<string, string>)["x-authing-userpool-id"]).toBe(
      "up_1",
    );
    expect(calls[1].body).toEqual({ options: { pagination: { page: 1, limit: 20 } } });
  });

  it("maps GenAuth user CRUD helpers to v3 management endpoints", async () => {
    const calls: Array<{ url: string; init?: RequestInit; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      genauthBaseUrl: "https://tenant-a.genauth.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        const body = init?.body ? JSON.parse(String(init.body)) : undefined;
        calls.push({ url: String(url), init, body });
        if (String(url) === "https://qoni.example.com/api/v3/qoni/genauth/admin-token") {
          return jsonResponse({
            data: {
              accessToken: "genauth-admin-token",
              userPoolId: "up_1",
            },
          });
        }
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.genauth.users.get({ userId: "user_1" });
    await client.genauth.users.create({ username: "alice", password: "P@ssw0rd!" });
    await client.genauth.users.createBatch({
      users: [{ username: "bob", password: "P@ssw0rd!" }],
    });
    await client.genauth.users.update({ userId: "user_1", nickname: "Alice" });
    await client.genauth.users.deleteBatch({ userIds: ["user_1"] });

    expect(calls.map((call) => call.url)).toEqual([
      "https://qoni.example.com/api/v3/qoni/genauth/admin-token",
      "https://tenant-a.genauth.example.com/api/v3/get-user?userId=user_1",
      "https://tenant-a.genauth.example.com/api/v3/create-user",
      "https://tenant-a.genauth.example.com/api/v3/create-users-batch",
      "https://tenant-a.genauth.example.com/api/v3/update-user",
      "https://tenant-a.genauth.example.com/api/v3/delete-users-batch",
    ]);
    expect(calls[0].body).toEqual({});
    expect(calls[2].body).toEqual({ username: "alice", password: "P@ssw0rd!" });
    expect(calls[3].body).toEqual({
      list: [{ username: "bob", password: "P@ssw0rd!" }],
    });
    expect(calls[4].body).toEqual({ userId: "user_1", nickname: "Alice" });
    expect(calls[5].body).toEqual({ userIds: ["user_1"] });
  });

  it("caches one GenAuth management token for all user management helpers", async () => {
    const calls: string[] = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      genauthBaseUrl: "https://tenant-a.genauth.example.com",
      fetch: (async (url: URL | RequestInfo) => {
        calls.push(String(url));
        if (String(url) === "https://qoni.example.com/api/v3/qoni/genauth/admin-token") {
          return jsonResponse({
            data: {
              token: "cached-genauth-admin-token",
              userPoolId: "up_1",
            },
          });
        }
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.genauth.users.list();
    await client.genauth.users.list({ page: 2 });

    expect(calls).toEqual([
      "https://qoni.example.com/api/v3/qoni/genauth/admin-token",
      "https://tenant-a.genauth.example.com/api/v3/list-users",
      "https://tenant-a.genauth.example.com/api/v3/list-users",
    ]);
  });

  it("discovers runtime service URLs from the configured host and routes calls to returned services", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://console.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        if (String(url) === "https://console.example.com/api/v3/qoni/runtime-config") {
          return jsonResponse({
            data: {
              qoniBaseUrl: "https://qoni-runtime.example.com",
              genauthBaseUrl: "https://tenant-a.genauth.example.com",
              gumemBaseUrl: "https://gumem.example.com/api",
              webAgentBaseUrl: "https://webagent.example.com",
            },
          });
        }
        if (String(url) === "https://console.example.com/api/v3/qoni/delegations") {
          return jsonResponse({
            data: {
              mode: "silent",
              tokenType: "Bearer",
              delegateAgentToken: token,
              expiresIn: 3600,
              grantId: "grant",
              auditId: "audit",
            },
          });
        }
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.delegateToken({
      user: { id: "user_1" },
      agent: "do_anything",
      scopes: [QoniScopes.GUMEM_MEMORY_READ],
      mode: "silent",
    });
    await client.gumem.recall({ token, sessionId: "default", query: "memory" });
    await client.doAnything.api.createSession({ token });

    expect(calls.map((call) => call.url)).toEqual([
      "https://console.example.com/api/v3/qoni/runtime-config",
      "https://console.example.com/api/v3/qoni/delegations",
      "https://gumem.example.com/api/sessions/default/context?query=memory&details=false",
      "https://webagent.example.com/api/v1/projects/tenant_1/do_anything/sessions",
    ]);
    expect((calls[1].init?.headers as Record<string, string>).authorization).toMatch(
      /^authing ak_test:/,
    );
    expect((calls[1].init?.headers as Record<string, string>)["x-authing-date"]).toEqual(
      expect.any(String),
    );
  });

  it("signs tokenless raw Qoni requests on the configured host after discovery", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://console.example.com/dashboard",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        if (String(url) === "https://console.example.com/dashboard/api/v3/qoni/runtime-config") {
          return jsonResponse({
            data: {
              qoniBaseUrl: "https://qoni-runtime.example.com/dashboard",
              genauthBaseUrl: "https://tenant-a.genauth.example.com",
              gumemBaseUrl: "https://gumem.example.com/api",
              webAgentBaseUrl: "https://webagent.example.com",
            },
          });
        }
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.request({
      method: "GET",
      path: "/api/v3/qoni/runtime-config",
      headers: { "x-custom": "kept" },
    });

    expect(calls.map((call) => call.url)).toEqual([
      "https://console.example.com/dashboard/api/v3/qoni/runtime-config",
      "https://console.example.com/dashboard/api/v3/qoni/runtime-config",
    ]);
    const headers = calls[1].init?.headers as Record<string, string>;
    expect(headers.authorization).toMatch(/^authing ak_test:/);
    expect(headers["x-authing-date"]).toEqual(expect.any(String));
    expect(headers["x-authing-signature-method"]).toBe("HMAC-SHA1");
    expect(headers["x-custom"]).toBe("kept");
  });

  it("uses configured service hosts instead of runtime-config service URLs", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://console.example.com",
      genauthHost: "https://configured.genauth.example.com",
      gumemHost: "https://configured.gumem.example.com/api",
      webAgentHost: "https://configured.webagent.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        if (String(url) === "https://console.example.com/api/v3/qoni/runtime-config") {
          return jsonResponse({
            data: {
              qoniBaseUrl: "https://qoni-runtime.example.com",
              genauthBaseUrl: "https://runtime.genauth.example.com",
              gumemBaseUrl: "https://runtime.gumem.example.com/api",
              webAgentBaseUrl: "https://runtime.webagent.example.com",
            },
          });
        }
        if (String(url) === "https://console.example.com/api/v3/qoni/delegations") {
          return jsonResponse({
            data: {
              mode: "silent",
              tokenType: "Bearer",
              delegateAgentToken: token,
              expiresIn: 3600,
              grantId: "grant",
              auditId: "audit",
            },
          });
        }
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.delegateToken({
      user: { id: "user_1" },
      agent: "do_anything",
      scopes: [QoniScopes.GUMEM_MEMORY_READ],
      mode: "silent",
    });
    await client.currentUser({ accessToken: "genauth-access-token" });
    await client.gumem.recall({
      token: jwt({ aud: "gumem" }),
      sessionId: "default",
      query: "memory",
    });
    await client.doAnything.api.createSession({ token });

    expect(calls.map((call) => call.url)).toEqual([
      "https://console.example.com/api/v3/qoni/runtime-config",
      "https://console.example.com/api/v3/qoni/delegations",
      "https://configured.genauth.example.com/oidc/me",
      "https://configured.gumem.example.com/api/sessions/default/context?query=memory&details=false",
      "https://configured.webagent.example.com/api/v1/projects/tenant_1/do_anything/sessions",
    ]);
  });

  it("types service host overrides with a single camelCase spelling", () => {
    const options = {
      accessKey: "ak_test",
      secretKey: "sk_test",
      genauthHost: "https://configured.genauth.example.com",
      gumemHost: "https://configured.gumem.example.com/api",
      webAgentHost: "https://configured.webagent.example.com",
    } satisfies QoniOptions;

    expect(options.webAgentHost).toBe("https://configured.webagent.example.com");

    ({
      accessKey: "ak_test",
      secretKey: "sk_test",
      // @ts-expect-error service host overrides use camelCase names.
      GenauthHost: "https://configured.genauth.example.com",
    } satisfies QoniOptions);
  });

  it("exchanges Qoni delegation tokens before calling Gumem", async () => {
    const delegationToken = jwt({
      token_type: "qoni_delegation_token",
      aud: "genauth:token-exchange",
      qoni_tenant_id: "qoni_tnt_1",
    });
    const productToken = jwt({
      aud: "gumem",
      product_resource: { type: "gumem_project", id: "proj_1" },
    });
    const calls: Array<{ url: string; init?: RequestInit; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      gumemBaseUrl: "https://gumem.example.com/api",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        const body = init?.body
          ? init.body instanceof URLSearchParams
            ? Object.fromEntries(init.body.entries())
            : JSON.parse(String(init.body))
          : undefined;
        calls.push({ url: String(url), init, body });
        if (String(url) === "https://qoni.example.com/api/v3/qoni/token-exchange") {
          return jsonResponse({
            data: {
              accessToken: productToken,
              access_token: productToken,
              expiresIn: 3600,
              expires_in: 3600,
              tokenType: "Bearer",
              token_type: "Bearer",
            },
          });
        }
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.gumem.recall({ token: delegationToken, sessionId: "default", query: "memory" });

    expect(calls.map((call) => call.url)).toEqual([
      "https://qoni.example.com/api/v3/qoni/token-exchange",
      "https://gumem.example.com/api/sessions/default/context?query=memory&details=false",
    ]);
    expect(calls[0].body).toEqual({
      subjectToken: delegationToken,
      resource: "gumem",
      scopes: ["gumem.memory:read"],
    });
    expect((calls[0].init?.headers as Record<string, string>).authorization).toMatch(
      /^authing ak_test:/,
    );
    expect((calls[1].init?.headers as Record<string, string>).authorization).toBe(
      `Bearer ${productToken}`,
    );
  });

  it("surfaces upstream token exchange configuration errors in the thrown message", async () => {
    const delegationToken = jwt({
      token_type: "qoni_delegation_token",
      aud: "genauth:token-exchange",
      qoni_tenant_id: "qoni_tnt_1",
    });
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      gumemBaseUrl: "https://gumem.example.com/api",
      fetch: (async () =>
        jsonResponse({
          statusCode: 400,
          code: "qoni.token_exchange.upstream_failed",
          message: "OIDC token exchange failed",
          requestId: "req_token_exchange",
          details: {
            reason: "upstream_failed",
            upstreamStatus: 400,
            upstream: {
              error: "unauthorized_client",
              error_description: "grant_type is not enabled",
            },
          },
        })) as typeof fetch,
    });

    await expect(
      client.gumem.recall({ token: delegationToken, sessionId: "default", query: "memory" }),
    ).rejects.toMatchObject({
      name: "QoniValidationError",
      code: "qoni.token_exchange.upstream_failed",
      status: 400,
      requestId: "req_token_exchange",
      message: expect.stringContaining("grant_type is not enabled"),
    });
  });

  it("sends product access tokens directly to Gumem", async () => {
    const token = jwt({ aud: "gumem" });
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      gumemBaseUrl: "https://gumem.example.com/api",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.gumem.recall({ token, sessionId: "default", query: "memory" });

    expect(calls.map((call) => call.url)).toEqual([
      "https://gumem.example.com/api/sessions/default/context?query=memory&details=false",
    ]);
    expect((calls[0].init?.headers as Record<string, string>).authorization).toBe(`Bearer ${token}`);
  });

  it("routes local Qoni token exchanges through the Qoni endpoint", async () => {
    const delegationToken = jwt({ token_type: "qoni_delegation_token" });
    const productToken = jwt({ aud: "gumem" });
    const calls: Array<{ url: string; init?: RequestInit; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "http://core.genauth.localhost:3000",
      qoniBaseUrl: "http://core.genauth.localhost:3000",
      gumemBaseUrl: "https://gumem.example.com/api",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        const body = init?.body ? JSON.parse(String(init.body)) : undefined;
        calls.push({ url: String(url), init, body });
        if (String(url) === "http://127.0.0.1:3000/api/v3/qoni/token-exchange") {
          return jsonResponse({ data: { accessToken: productToken, expiresIn: 3600 } });
        }
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.gumem.recall({ token: delegationToken, sessionId: "default", query: "memory" });

    expect(calls[0].url).toBe("http://127.0.0.1:3000/api/v3/qoni/token-exchange");
    expect((calls[0].init?.headers as Record<string, string>).Host).toBe(
      "core.genauth.localhost:3000",
    );
    expect(calls[0].body).toEqual({
      subjectToken: delegationToken,
      resource: "gumem",
      scopes: ["gumem.memory:read"],
    });
  });

  it("requires product capability calls to receive an explicit token", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      gumemBaseUrl: "https://gumem.example.com/api",
      fetch: (async () => jsonResponse({ data: { ok: true } })) as typeof fetch,
    });

    await expect(
      client.gumem.recall({ sessionId: "default", query: "memory" } as any),
    ).rejects.toMatchObject({
      name: "QoniDelegationRequiredError",
      code: "delegation.required",
      message: expect.stringContaining("token"),
    });
  });

  it("sends delegateToken output directly to WebAgent and derives the tenant from it", async () => {
    const token = jwt({
      aud: ["gumem", "webagent"],
      resource_bindings: { webagent: { tenant_id: "web_tnt_1" } },
    });
    const calls: Array<{ url: string; init?: RequestInit; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://webagent.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        const body = init?.body
          ? init.body instanceof URLSearchParams
            ? Object.fromEntries(init.body.entries())
            : JSON.parse(String(init.body))
          : undefined;
        calls.push({ url: String(url), init, body });
        return jsonResponse({ data: { id: "sess_1" } });
      }) as typeof fetch,
    });

    await client.doAnything.api.createSession({ token, instructions: "open docs" });

    expect(calls.map((call) => call.url)).toEqual([
      "https://webagent.example.com/api/v1/projects/web_tnt_1/do_anything/sessions",
    ]);
    expect((calls[0].init?.headers as Record<string, string>).authorization).toBe(
      `Bearer ${token}`,
    );
  });

  it("matches GenAuth canonical string shape", () => {
    expect(
      buildStringToSign(
        "POST",
        "/api/v3/qoni/delegations",
        {
          "x-authing-date": "1",
          "x-authing-signature-method": "HMAC-SHA1",
          "x-authing-signature-version": "1.0",
        },
        { b: "2", a: "1" },
      ),
    ).toBe(
      "POST\nx-authing-date:1\nx-authing-signature-method:HMAC-SHA1\nx-authing-signature-version:1.0\n/api/v3/qoni/delegations?a=1&b=2",
    );
  });

  it("exports stable scope and event constants", () => {
    expect(QoniScopes.GUMEM_MEMORY_READ).toBe("gumem.memory:read");
    expect("GENAUTH_USER_LIST" in QoniScopes).toBe(false);
    expect(QoniScopes.DO_ANYTHING_READ).toBe("webagent.do_anything:read");
    expect(QoniScopes.DO_ANYTHING_MANAGE).toBe("webagent.do_anything:manage");
    expect(QoniScopes.WEB_SEARCH_READ).toBe("webagent.web_search:read");
    expect(QoniScopes.WEB_SEARCH_MANAGE).toBe("webagent.web_search:manage");
    expect(QoniScopes.DEEP_RESEARCH_READ).toBe("webagent.deep_research:read");
    expect(QoniScopes.DEEP_RESEARCH_MANAGE).toBe("webagent.deep_research:manage");
    expect(QoniScopes.TRACK_READ).toBe("webagent.track:read");
    expect(QoniScopes.TRACK_MANAGE).toBe("webagent.track:manage");
    // Legacy verb constants are gone — read/manage is the whole model.
    expect("DO_ANYTHING_RUN" in QoniScopes).toBe(false);
    expect("DO_ANYTHING_STOP" in QoniScopes).toBe(false);
    expect("DO_ANYTHING_CONTROL" in QoniScopes).toBe(false);
    expect("WEB_SEARCH_RUN" in QoniScopes).toBe(false);
    expect("WEB_SEARCH_STOP" in QoniScopes).toBe(false);
    expect("DEEP_RESEARCH_RUN" in QoniScopes).toBe(false);
    expect("DEEP_RESEARCH_STOP" in QoniScopes).toBe(false);
    expect("DEEP_RESEARCH_CONTROL" in QoniScopes).toBe(false);
    expect("TRACK_RUN" in QoniScopes).toBe(false);
    expect("TRACK_STOP" in QoniScopes).toBe(false);
    expect("WEBAGENT_TASK_RUN" in QoniScopes).toBe(false);
    expect("WEBAGENT_DO_ANYTHING_EVENTS" in QoniScopes).toBe(false);
    expect(QoniScopeBundles.GUMEM_SESSION_RECALL).toEqual([
      QoniScopes.GUMEM_MEMORY_READ,
      QoniScopes.GUMEM_MEMORY_WRITE,
      QoniScopes.GUMEM_MESSAGE_WRITE,
    ]);
    expect("GENAUTH_USER_ADMIN" in QoniScopeBundles).toBe(false);
    expect(QoniScopeBundles.DO_ANYTHING).toEqual([
      QoniScopes.DO_ANYTHING_READ,
      QoniScopes.DO_ANYTHING_MANAGE,
    ]);
    expect(QoniScopeBundles.WEB_SEARCH).toEqual([
      QoniScopes.WEB_SEARCH_READ,
      QoniScopes.WEB_SEARCH_MANAGE,
    ]);
    expect(QoniScopeBundles.DEEP_RESEARCH).toEqual([
      QoniScopes.DEEP_RESEARCH_READ,
      QoniScopes.DEEP_RESEARCH_MANAGE,
    ]);
    expect(QoniScopeBundles.TRACK).toEqual([
      QoniScopes.TRACK_READ,
      QoniScopes.TRACK_MANAGE,
    ]);
    expect(WireEventTypes.RUN_COMPLETED).toBe("run.completed");
  });

  it("uses canonical WebAgent scopes when exchanging delegation tokens", async () => {
    const delegationToken = jwt({
      token_type: "qoni_delegation_token",
      aud: "genauth:token-exchange",
      qoni_tenant_id: "qoni_tnt_1",
    });
    const productToken = jwt({
      aud: "webagent",
      product_resource: { type: "webagent_tenant", id: "web_tnt_1" },
    });
    const exchanges: unknown[] = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      webAgentBaseUrl: "https://webagent.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        if (String(url) === "https://qoni.example.com/api/v3/qoni/token-exchange") {
          exchanges.push(JSON.parse(String(init?.body)));
          return jsonResponse({
            data: { accessToken: productToken, expiresIn: 3600 },
          });
        }
        return jsonResponse({ data: { id: "ok" } });
      }) as typeof fetch,
    });

    await client.doAnything.api.createRun({ token: delegationToken, instruction: "open docs" });
    await client.doAnything.api.getRun({ token: delegationToken, runId: "run_1" });
    await client.doAnything.api.cancel({ token: delegationToken, runId: "run_1" });
    await client.doAnything.api.intervene({ token: delegationToken, runId: "run_1", text: "continue" });
    await client.webSearch.api.run({ token: delegationToken, query: "Qoni" });
    await client.webSearch.api.get({ token: delegationToken, runId: "search_1" });
    await client.webSearch.api.cancel({ token: delegationToken, runId: "search_1" });
    await client.deepResearch.api.run({ token: delegationToken, topic: "Qoni" });
    await client.deepResearch.api.get({ token: delegationToken, runId: "research_1" });
    await client.deepResearch.api.cancel({ token: delegationToken, runId: "research_1" });
    await client.deepResearch.api.followUp({ token: delegationToken, runId: "research_1", text: "more" });
    await client.track.api.createMonitor({ token: delegationToken, url: "https://example.com" });
    await client.track.api.getMonitor({ token: delegationToken, monitorId: "monitor_1" });
    await client.track.api.runNow({ token: delegationToken, monitorId: "monitor_1" });
    await client.track.api.deleteMonitor({ token: delegationToken, monitorId: "monitor_1" });
    await client.track.api.updateMonitor({ token: delegationToken, monitorId: "monitor_1", title: "updated" });

    // Each product exchanges once per distinct scope set. With the two-verb
    // model every state-changing call shares the product's `manage` token, so
    // cancel / intervene / followUp / runNow / deleteMonitor / updateMonitor
    // all reuse the cached token from the first `manage` exchange.
    expect(exchanges).toEqual([
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.do_anything:manage"] },
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.do_anything:read"] },
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.web_search:manage"] },
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.web_search:read"] },
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.deep_research:manage"] },
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.deep_research:read"] },
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.track:manage"] },
      { subjectToken: delegationToken, resource: "webagent", scopes: ["webagent.track:read"] },
    ]);
  });

  it("uses webagent_tenant_id from token for WebAgent calls", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { url?: string; init?: RequestInit } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.init = init;
        return jsonResponse({ data: { id: "run_1" } });
      }) as typeof fetch,
    });

    await client.doAnything.api.createRun({
      token,
      instructions: "open the site",
    });

    expect(seen.url).toBe(
      "https://qoni.example.com/api/v1/projects/tenant_1/do_anything/runs",
    );
    expect((seen.init?.headers as Record<string, string>).authorization).toBe(`Bearer ${token}`);
    expect(JSON.parse(String(seen.init?.body))).toEqual({ instructions: "open the site" });
  });

  it("posts doAnything.intervene to the backend /intervene route", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { url?: string; init?: RequestInit } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.init = init;
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    await client.doAnything.api.intervene({
      token,
      runId: "run_1",
      requestId: "input_1",
      response: "please confirm",
    });

    expect(seen.url).toBe(
      "https://qoni.example.com/api/v1/projects/tenant_1/do_anything/runs/run_1/intervene",
    );
    expect(seen.init?.method).toBe("POST");
    expect(JSON.parse(String(seen.init?.body))).toEqual({
      kind: "answer_input_request",
      input_request_id: "input_1",
      response: "please confirm",
    });
  });

  it("reads doAnything artifacts from the session-scoped /sessions/{id}/artifacts/{id} route", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { url?: string; init?: RequestInit } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.init = init;
        return jsonResponse({ data: { id: "artifact_1" } });
      }) as typeof fetch,
    });

    await client.doAnything.api.readArtifacts({ token, sessionId: "session_1", artifactId: "artifact_1" });

    expect(seen.url).toBe(
      "https://qoni.example.com/api/v1/projects/tenant_1/do_anything/sessions/session_1/artifacts/artifact_1",
    );
    expect(seen.init?.method).toBe("GET");
  });

  it("offers a doAnything.run helper that creates the run in a single call", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const urls: string[] = [];
    const bodies: unknown[] = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        urls.push(String(url));
        bodies.push(init?.body ? JSON.parse(String(init.body)) : undefined);
        return jsonResponse({ data: { run_id: "run_auto", session_id: "sess_auto" } });
      }) as typeof fetch,
    });

    const run = await client.doAnything.run({
      token,
      prompt: "open the docs",
      capture: { screenshots: true },
    });

    expect(run.id).toBe("run_auto");
    expect(run.sessionRef).toEqual({ sessionId: "sess_auto" });
    expect(urls).toEqual([
      "https://qoni.example.com/api/v1/projects/tenant_1/do_anything/runs",
    ]);
    // No write-time `stream` subscription — capture is read-time filtering.
    expect(bodies[0]).toEqual({ instructions: "open the docs" });
  });

  it("passes webSearch queries through to the backend contract", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { body?: unknown } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (_url: URL | RequestInfo, init?: RequestInit) => {
        seen.body = JSON.parse(String(init?.body));
        return jsonResponse({ data: { run_id: "run_1" } });
      }) as typeof fetch,
    });

    await client.webSearch.api.run({
      token,
      queries: ["Qoni SDK"],
      maxResultsPerQuery: 3,
      siteWhitelist: ["eazo.ai"],
    });

    expect(seen.body).toEqual({
      queries: ["Qoni SDK"],
      max_results_per_query: 3,
      site_whitelist: ["eazo.ai"],
    });
  });

  it("parses SSE events including JSON, text, and last-event-id", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { headers?: Record<string, string>; url?: string } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com/workspace",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.headers = init?.headers as Record<string, string>;
        return sseResponse(
          'id: 1\nevent: browser_video_frame\ndata: {"frame":"https://frame"}\n\nid: 2\nevent: final\ndata: done\n\n',
        );
      }) as typeof fetch,
    });

    const events = [];
    for await (const event of client.doAnything.api.events({
      token,
      runId: "run_1",
      lastEventId: "0",
    })) {
      events.push(event);
    }

    expect(seen.url).toBe(
      "https://qoni.example.com/workspace/api/v1/projects/tenant_1/do_anything/runs/run_1/events",
    );
    expect(seen.headers?.["last-event-id"]).toBe("0");
    expect(events).toEqual([
      { id: "1", event: "browser_video_frame", data: { frame: "https://frame" } },
      { id: "2", event: "final", data: "done" },
    ]);
  });

  it("normalizes WebAgent run events: lifts envelope `type` to event.event", async () => {
    // Real backend frames carry no SSE `event:` line — the type is in the
    // envelope's `type` field. The SDK surfaces it as event.event.
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async () =>
        sseResponse(
          'id: 1\ndata: {"type":"run.action.started","task_id":"run_1","data":{"kind":"navigate"}}\n\n' +
            'id: 2\ndata: {"type":"run.completed","task_id":"run_1","data":{"output":"hi","terminal_reason":"done"}}\n\n',
        )) as typeof fetch,
    });

    const events = [];
    for await (const event of client.doAnything.api.events({
      token,
      runId: "run_1",
    })) {
      events.push(event);
    }

    expect(events.map((e) => e.event)).toEqual([
      WireEventTypes.RUN_ACTION_STARTED,
      WireEventTypes.RUN_COMPLETED,
    ]);
    // data stays the full envelope (type / task_id / data all reachable).
    expect((events[1].data as { type: string }).type).toBe("run.completed");
    expect((events[1].data as { data: { output: string } }).data.output).toBe("hi");
  });

  it("auto-reconnects a dropped SSE stream and resumes from last-event-id", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const lastEventIds: (string | undefined)[] = [];
    let call = 0;
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      sseMaxRetries: 3,
      fetch: (async (_url: URL | RequestInfo, init?: RequestInit) => {
        const headers = (init?.headers || {}) as Record<string, string>;
        lastEventIds.push(headers["last-event-id"]);
        call += 1;
        if (call === 1) {
          // First connection: deliver one frame, then drop mid-stream. `pull`
          // (vs synchronous start) guarantees the frame is consumed before the
          // error, matching a real ECONNRESET after some events arrived.
          let pulls = 0;
          const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
              pulls += 1;
              if (pulls === 1) {
                controller.enqueue(
                  new TextEncoder().encode(
                    'id: 1\ndata: {"type":"run.action.started","data":{}}\n\n',
                  ),
                );
              } else {
                controller.error(new Error("ECONNRESET"));
              }
            },
          });
          return new Response(stream, {
            status: 200,
            headers: { "content-type": "text/event-stream" },
          });
        }
        // Reconnect: resume and complete.
        return sseResponse(
          'id: 2\ndata: {"type":"run.completed","data":{"output":"done"}}\n\n',
        );
      }) as typeof fetch,
    });

    const events = [];
    for await (const event of client.doAnything.api.events({
      token,
      runId: "run_1",
    })) {
      events.push(event);
    }

    expect(call).toBe(2); // reconnected once
    expect(lastEventIds).toEqual([undefined, "1"]); // resumed from last id
    expect(events.map((e) => e.event)).toEqual([
      WireEventTypes.RUN_ACTION_STARTED,
      WireEventTypes.RUN_COMPLETED,
    ]);
  });

  it("events({ onlyTopLevel: true }) drops sub-run events", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async () =>
        sseResponse(
          'id: 1\ndata: {"type":"run.action.started","task_id":"run_1","data":{}}\n\n' +
            'id: 2\ndata: {"type":"run.subtask_started","task_id":"sub_1","data":{}}\n\n' +
            'id: 3\ndata: {"type":"run.action.started","task_id":"sub_1","data":{}}\n\n' +
            'id: 4\ndata: {"type":"run.completed","task_id":"run_1","data":{}}\n\n',
        )) as typeof fetch,
    });

    const ids: (string | undefined)[] = [];
    for await (const event of client.doAnything.api.events({
      token,
      runId: "run_1",
      onlyTopLevel: true,
    })) {
      ids.push(event.id);
    }
    // Only the top-level run_1 events (1, 4) survive; sub_1 events (2, 3) dropped.
    expect(ids).toEqual(["1", "4"]);
  });

  it("reconnect recovers from a 401 by retrying with a refreshed token", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    let call = 0;
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      sseMaxRetries: 3,
      fetch: (async () => {
        call += 1;
        if (call === 1) {
          // deliver one frame, then drop mid-stream
          let pulls = 0;
          const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
              pulls += 1;
              if (pulls === 1) {
                controller.enqueue(
                  new TextEncoder().encode('id: 1\ndata: {"type":"run.action.started","data":{}}\n\n'),
                );
              } else controller.error(new Error("ECONNRESET"));
            },
          });
          return new Response(stream, {
            status: 200,
            headers: { "content-type": "text/event-stream" },
          });
        }
        if (call === 2) {
          // reconnect hits an expired-token 401 — retryable because a refresh is available
          return jsonResponse({ message: "token expired" }, { status: 401 });
        }
        // next reconnect (token refreshed) completes
        return sseResponse('id: 2\ndata: {"type":"run.completed","data":{}}\n\n');
      }) as typeof fetch,
    });

    const events = [];
    for await (const event of client.doAnything.api.events({
      token,
      runId: "run_1",
    })) {
      events.push(event.event);
    }

    expect(call).toBe(3); // RST → reconnect(401) → reconnect(ok)
    expect(events).toEqual([WireEventTypes.RUN_ACTION_STARTED, WireEventTypes.RUN_COMPLETED]);
  });

  it("run().wait() drives a run to terminal and settles from the run-detail envelope", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const actions: unknown[] = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        const u = String(url);
        if (u.endsWith("/do_anything/runs") && init?.method === "POST") {
          return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1" } });
        }
        // getRun (GET run-detail): the canonical envelope with cost / steps.
        if (u.endsWith("/do_anything/runs/run_1")) {
          return jsonResponse({
            data: {
              run_id: "run_1",
              session_id: "sess_1",
              status: "succeeded",
              terminal_reason: "done",
              is_task_successful: true,
              output: "the title",
              total_cost_usd: "0.42",
              step_count: 7,
            },
          });
        }
        // events SSE: one action, then terminal completion (leaner payload).
        return sseResponse(
          'id: 1\ndata: {"type":"run.action.started","task_id":"run_1","data":{"kind":"navigate"}}\n\n' +
            'id: 2\ndata: {"type":"run.completed","task_id":"run_1","data":{"terminal_reason":"done","output":"the title"}}\n\n',
        );
      }) as typeof fetch,
    });

    const run = await client.doAnything.run({
      token,
      prompt: "open the page and read the title",
    });
    const result = await run.wait({
      onEvent: (event) => {
        // Action steps fold into "progress"; the kind lives on the raw wire
        // payload (not the curated event.data).
        if (event.raw.event === "run.action.started") {
          const inner = (event.raw.data as { data?: { kind?: unknown } } | undefined)?.data;
          if (inner?.kind !== undefined) actions.push(inner.kind);
        }
      },
    });

    expect(result).toMatchObject({
      runId: "run_1",
      status: "succeeded",
      terminalReason: "done",
      isTaskSuccessful: true,
      output: "the title",
      artifacts: [],
    });
    // Cost / steps are missing from the run.completed event but present on
    // result.raw because wait() settles from the getRun envelope.
    expect(result.raw?.total_cost_usd).toBe("0.42");
    expect(result.raw?.step_count).toBe(7);
    expect(actions).toEqual(["navigate"]);
  });

  it("resolveAnyBoundUser returns the first user from the bound userpool", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      qoniBaseUrl: "https://qoni.example.com",
      genauthBaseUrl: "https://tenant-a.genauth.example.com",
      fetch: (async (url: URL | RequestInfo) => {
        if (String(url) === "https://qoni.example.com/api/v3/qoni/genauth/admin-token") {
          return jsonResponse({ data: { accessToken: "admin", userPoolId: "up_1" } });
        }
        return jsonResponse({ data: { list: [{ userId: "user_real_1" }], totalCount: 1 } });
      }) as typeof fetch,
    });

    expect(await client.resolveAnyBoundUser()).toBe("user_real_1");
  });

  it("maps permission errors to typed SDK errors", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      gumemBaseUrl: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse(
          {
            detail: {
              code: "permission_denied",
              message: "missing scope",
              auditId: "audit_1",
            },
            requestId: "req_1",
          },
          { status: 403 },
        )) as typeof fetch,
    });

    await expect(
      client.gumem.recall({ token: "token", sessionId: "sess_1", query: "hello" }),
    ).rejects.toMatchObject({
      name: "QoniPermissionDeniedError",
      code: "permission_denied",
      status: 403,
      requestId: "req_1",
      auditId: "audit_1",
      retryable: false,
    } satisfies Partial<QoniPermissionDeniedError>);
  });

  it("surfaces denied scopes inline in the error message", async () => {
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      gumemBaseUrl: "https://qoni.example.com",
      fetch: (async () =>
        jsonResponse(
          {
            detail: {
              code: "scope_not_delegated",
              message: "One or more scopes were not granted",
              details: { deniedScopes: ["webagent.deep_research:read"] },
            },
          },
          { status: 403 },
        )) as typeof fetch,
    });

    await expect(
      client.gumem.recall({ token: "token", sessionId: "sess_1", query: "hello" }),
    ).rejects.toThrow(/scopes not granted: webagent\.deep_research:read/);
  });

  it("supports unstable raw requests through Qoni host without exposing service selection", async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.init = init;
        return jsonResponse({ data: { ok: true } });
      }) as typeof fetch,
    });

    const result = await client.unstableRequest({
      method: "POST",
      path: "/api/webagent/deep_research/runs",
      token: "delegate-agent-token",
      body: { query: "research" },
    });

    expect(result.data).toEqual({ ok: true });
    expect(seen.url).toBe("https://qoni.example.com/api/webagent/deep_research/runs");
    expect((seen.init?.headers as Record<string, string>).authorization).toBe(
      "Bearer delegate-agent-token",
    );
  });

  it("accepts camelCase GUMem input while sending the existing backend field names", async () => {
    const seen: { body?: unknown } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      gumemBaseUrl: "https://qoni.example.com",
      fetch: (async (_url: URL | RequestInfo, init?: RequestInit) => {
        seen.body = JSON.parse(String(init?.body));
        return jsonResponse({ data: { id: "sess_1" } });
      }) as typeof fetch,
    });

    await client.gumem.createSession({
      token: "delegate-agent-token",
      userId: "user_1",
      sessionId: "default",
    });

    expect(seen.body).toEqual({ user_id: "user_1", session_id: "default" });
  });

  it("snakeifies camelCase fields on the DoAnything escape-hatch create", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { body?: unknown } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (_url: URL | RequestInfo, init?: RequestInit) => {
        seen.body = JSON.parse(String(init?.body));
        return jsonResponse({ data: { id: "run_1" } });
      }) as typeof fetch,
    });

    await client.doAnything.api.createRun({
      token,
      sessionId: "sess_1",
      instructions: "open the site",
    });

    // `sessionId` is a body field on the single-ID create (follow-up mode).
    expect(seen.body).toEqual({ instructions: "open the site", session_id: "sess_1" });
  });

  // -------------------------------------------------------------------------
  // WebSearch
  // -------------------------------------------------------------------------

  it("routes webSearch read/cancel to the project-scoped run endpoints", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const calls: Array<{ url: string; method?: string; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({
          url: String(url),
          method: init?.method,
          body: init?.body ? JSON.parse(String(init.body)) : undefined,
        });
        return jsonResponse({ data: { run_id: "run_1" } });
      }) as typeof fetch,
    });

    await client.webSearch.api.get({ token, runId: "run_1" });
    await client.webSearch.api.cancel({ token, runId: "run_1", reason: "duplicate" });

    const base = "https://qoni.example.com/api/v1/projects/tenant_1/web_search/runs/run_1";
    expect(calls).toEqual([
      { url: base, method: "GET", body: undefined },
      { url: `${base}/cancel`, method: "POST", body: { reason: "duplicate" } },
    ]);
  });

  it("streams webSearch run events over SSE from the project-scoped endpoint", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { url?: string; headers?: Record<string, string> } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.headers = init?.headers as Record<string, string>;
        return sseResponse(
          'id: 1\nevent: web_search_result\ndata: {"url":"https://eazo.ai"}\n\nid: 2\nevent: final\ndata: done\n\n',
        );
      }) as typeof fetch,
    });

    const events = [];
    for await (const event of client.webSearch.api.events({
      token,
      runId: "run_1",
      lastEventId: "0",
    })) {
      events.push(event);
    }

    expect(seen.url).toBe(
      "https://qoni.example.com/api/v1/projects/tenant_1/web_search/runs/run_1/events",
    );
    expect(seen.headers?.["last-event-id"]).toBe("0");
    expect(events).toEqual([
      { id: "1", event: "web_search_result", data: { url: "https://eazo.ai" } },
      { id: "2", event: "final", data: "done" },
    ]);
  });

  // -------------------------------------------------------------------------
  // Track
  // -------------------------------------------------------------------------

  it("maps the full Track monitor lifecycle to the backend monitors contract", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const calls: Array<{ url: string; method?: string; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({
          url: String(url),
          method: init?.method,
          body: init?.body ? JSON.parse(String(init.body)) : undefined,
        });
        return jsonResponse({ data: { id: "mon_1" } });
      }) as typeof fetch,
    });

    await client.track.api.createMonitor({
      token,
      url: "https://eazo.ai/pricing",
      instructions: "alert me when the price changes",
    });
    await client.track.api.getMonitor({ token, monitorId: "mon_1" });
    await client.track.api.runNow({ token, monitorId: "mon_1" });
    await client.track.api.updateMonitor({ token, monitorId: "mon_1", schedule: "0 9 * * *" });
    await client.track.api.deleteMonitor({ token, monitorId: "mon_1" });

    const monitors = "https://qoni.example.com/api/v1/projects/tenant_1/track/monitors";
    expect(calls).toEqual([
      {
        url: monitors,
        method: "POST",
        body: {
          url: "https://eazo.ai/pricing",
          instructions: "alert me when the price changes",
        },
      },
      { url: `${monitors}/mon_1`, method: "GET", body: undefined },
      { url: `${monitors}/mon_1/run_now`, method: "POST", body: {} },
      { url: `${monitors}/mon_1`, method: "PATCH", body: { schedule: "0 9 * * *" } },
      { url: `${monitors}/mon_1`, method: "DELETE", body: undefined },
    ]);
  });

  it("streams Track monitor events over SSE", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { url?: string; headers?: Record<string, string> } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.headers = init?.headers as Record<string, string>;
        return sseResponse('id: 7\nevent: track_change\ndata: {"changed":true}\n\n');
      }) as typeof fetch,
    });

    const events = [];
    for await (const event of client.track.api.events({
      token,
      monitorId: "mon_1",
      lastEventId: "6",
    })) {
      events.push(event);
    }

    expect(seen.url).toBe(
      "https://qoni.example.com/api/v1/projects/tenant_1/track/monitors/mon_1/events",
    );
    expect(seen.headers?.["last-event-id"]).toBe("6");
    expect(events).toEqual([{ id: "7", event: "track_change", data: { changed: true } }]);
  });

  // -------------------------------------------------------------------------
  // DeepResearch
  // -------------------------------------------------------------------------

  it("creates a DeepResearch run and maps camelCase sugar to the backend contract", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { url?: string; method?: string; body?: unknown } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.method = init?.method;
        seen.body = JSON.parse(String(init?.body));
        return jsonResponse({ data: { id: "dr_run_1" } }, { status: 202 });
      }) as typeof fetch,
    });

    const run = await client.deepResearch.api.run<{ id: string }>({
      token,
      topic: "state of EU battery recycling 2026",
      depth: "deep",
      outputFormat: "report",
      targetAudience: "investors",
      maxDurationMinutes: 120,
      callbackUrl: "https://app.example.com/hooks/dr",
      domainWhitelist: ["eazo.ai"],
    });

    expect(run.data).toMatchObject({ id: "dr_run_1" });
    expect(seen.url).toBe(
      "https://qoni.example.com/api/v1/projects/tenant_1/deep_research/runs",
    );
    expect(seen.method).toBe("POST");
    expect(seen.body).toEqual({
      topic: "state of EU battery recycling 2026",
      depth: "deep",
      output_format: "report",
      target_audience: "investors",
      max_duration_minutes: 120,
      callback_url: "https://app.example.com/hooks/dr",
      domain_whitelist: ["eazo.ai"],
    });
  });

  it("routes DeepResearch run read/followUp/cancel/feedback to backend endpoints", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const calls: Array<{ url: string; method?: string; body?: unknown }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({
          url: String(url),
          method: init?.method,
          body: init?.body ? JSON.parse(String(init.body)) : undefined,
        });
        return jsonResponse({ data: { id: "dr_run_1" } });
      }) as typeof fetch,
    });

    await client.deepResearch.api.get({ token, runId: "dr_run_1" });
    await client.deepResearch.api.followUp({
      token,
      runId: "dr_run_1",
      text: "also compare against 2025",
    });
    await client.deepResearch.api.cancel({ token, runId: "dr_run_1" });
    await client.deepResearch.api.feedback({
      token,
      runId: "dr_run_1",
      thumbs: "up",
      rating: 5,
      feedbackText: "thorough",
    });

    const base = "https://qoni.example.com/api/v1/projects/tenant_1/deep_research/runs/dr_run_1";
    expect(calls).toEqual([
      { url: base, method: "GET", body: undefined },
      {
        url: `${base}/messages`,
        method: "POST",
        body: { text: "also compare against 2025" },
      },
      { url: `${base}/cancel`, method: "POST", body: {} },
      {
        url: `${base}/feedback`,
        method: "POST",
        body: { thumbs: "up", rating: 5, feedback_text: "thorough" },
      },
    ]);
  });

  it("reads DeepResearch artifacts from the project-scoped artifact endpoints", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const calls: Array<{ url: string; method?: string }> = [];
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        calls.push({ url: String(url), method: init?.method });
        return jsonResponse({ data: { items: [] } });
      }) as typeof fetch,
    });

    await client.deepResearch.api.listArtifacts({ token, runId: "dr_run_1" });
    await client.deepResearch.api.getArtifact({
      token,
      runId: "dr_run_1",
      artifactId: "art_1",
    });

    const base = "https://qoni.example.com/api/v1/projects/tenant_1/deep_research/runs/dr_run_1";
    expect(calls).toEqual([
      { url: `${base}/artifacts`, method: "GET" },
      { url: `${base}/artifacts/art_1`, method: "GET" },
    ]);
  });

  it("streams DeepResearch run events over SSE", async () => {
    const token = jwt({ webagent_tenant_id: "tenant_1" });
    const seen: { url?: string; headers?: Record<string, string> } = {};
    const client = new QoniAgentKit({
      accessKey: "ak_test",
      secretKey: "sk_test",
      host: "https://qoni.example.com",
      webAgentBaseUrl: "https://qoni.example.com",
      fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
        seen.url = String(url);
        seen.headers = init?.headers as Record<string, string>;
        return sseResponse(
          'id: 1\nevent: run.status_changed\ndata: {"phase":"gather"}\n\nid: 2\nevent: final\ndata: done\n\n',
        );
      }) as typeof fetch,
    });

    const events = [];
    for await (const event of client.deepResearch.api.events({
      token,
      runId: "dr_run_1",
      lastEventId: "0",
    })) {
      events.push(event);
    }

    expect(seen.url).toBe(
      "https://qoni.example.com/api/v1/projects/tenant_1/deep_research/runs/dr_run_1/events",
    );
    expect(seen.headers?.["last-event-id"]).toBe("0");
    expect(events).toEqual([
      { id: "1", event: "run.status_changed", data: { phase: "gather" } },
      { id: "2", event: "final", data: "done" },
    ]);
  });
});
