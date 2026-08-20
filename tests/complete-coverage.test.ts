import {
  describe,
  expect,
  it,
} from "vitest";
import {
  QoniAuthError,
  QoniDelegationRequiredError,
  QoniPermissionDeniedError,
  QoniRateLimitError,
  QoniScopes,
  QoniTimeoutError,
  QoniTokenExpiredError,
  QoniUpstreamError,
  Qoni,
} from "../src";

type CapturedCall = {
  url: string;
  pathname: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
};

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.`;
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

function createHarness() {
  const calls: CapturedCall[] = [];
  const fetchImpl = (async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = new URL(String(input));
    const call: CapturedCall = {
      url: String(url),
      pathname: url.pathname,
      method: init?.method || "GET",
      headers: normalizeHeaders(init?.headers),
      query: Object.fromEntries(url.searchParams.entries()),
      body: await parseBody(init?.body),
    };
    calls.push(call);

    if (url.pathname.endsWith("/api/v3/eak/runtime-config")) {
      return jsonResponse({
        data: {
          eakBaseUrl: "https://qoni.example.com",
          genauthBaseUrl: "https://genauth.example.com",
          gumemBaseUrl: "https://gumem.example.com",
          webAgentBaseUrl: "https://webagent.example.com",
        },
      });
    }

    if (url.pathname.endsWith("/api/v3/eak/token-exchange")) {
      const body = call.body as { resource?: string; scopes?: string[] };
      return jsonResponse({
        data: {
          accessToken: jwt({
            aud: body.resource,
            scope: body.scopes?.join(" ") || "",
            webagent_tenant_id: "tenant_matrix",
            product_resource:
              body.resource === "webagent"
                ? { type: "webagent_tenant", id: "tenant_matrix" }
                : { type: "gumem_project", id: "gumem_matrix" },
          }),
          expiresIn: 3600,
          tokenType: "Bearer",
        },
      });
    }

    if (url.pathname.endsWith("/api/v3/eak/genauth/admin-token")) {
      return jsonResponse({
        data: { accessToken: "genauth-admin-token", userPoolId: "pool_matrix", expiresIn: 3600 },
      });
    }

    if (url.pathname.endsWith("/api/user/actions/stream")) {
      return new Response(
        '{"content":"first action"}\n{"content":"second action"}\n',
        { status: 200, headers: { "content-type": "application/x-ndjson" } },
      );
    }

    if (url.pathname === "/oidc/me") {
      return jsonResponse({ data: { id: "user_matrix", name: "Matrix User" } });
    }

    if (url.pathname.endsWith("/events")) {
      return sseResponse(
        'id: evt_1\nevent: run.message\ndata: {"type":"run.message","task_id":"run_matrix","data":{"text":"hi","role":"ai"}}\n\n',
      );
    }

    if (url.pathname.endsWith("/do_anything/runs") && call.method === "POST") {
      return jsonResponse({ data: { run_id: "run_matrix", session_id: "sess_matrix" } });
    }

    if (url.pathname.endsWith("/do_anything/sessions")) {
      return jsonResponse({ data: { id: "sess_matrix", session_id: "sess_matrix" } });
    }

    if (url.pathname.includes("/do_anything/") && url.pathname.includes("/runs/run_matrix")) {
      return jsonResponse({
        data: {
          run_id: "run_matrix",
          session_id: "sess_matrix",
          status: "succeeded",
          terminal_reason: "done",
        },
      });
    }

    if (url.pathname.endsWith("/api/v3/eak/delegations") && call.method === "POST") {
      const body = call.body as { mode?: string; scopes?: string[] };
      if (body.mode === "interactive") {
        return jsonResponse({
          data: {
            mode: "interactive",
            authorizationUrl: "https://qoni.example.com/authorize?grant_id=grant_matrix",
            grantId: "grant_matrix",
            grantState: "state_matrix",
            requestedScopes: body.scopes,
          },
        });
      }
      return jsonResponse({
        data: {
          mode: "silent",
          tokenType: "Bearer",
          token: jwt({
            token_type: "eak_delegation_token",
            sub: "user_matrix",
            webagent_tenant_id: "tenant_matrix",
          }),
          expiresIn: 3600,
          grantId: "grant_matrix",
          auditId: "audit_matrix",
          grantedScopes: body.scopes,
        },
      });
    }

    if (url.pathname.endsWith("/api/v3/eak/delegations/complete")) {
      return jsonResponse({
        data: {
          mode: "interactive",
          tokenType: "Bearer",
          token: jwt({ token_type: "eak_delegation_token", webagent_tenant_id: "tenant_matrix" }),
          expiresIn: 3600,
          grantId: "grant_matrix",
          auditId: "audit_matrix",
        },
      });
    }

    return jsonResponse({ data: { ok: true, id: "id_matrix", path: url.pathname } });
  }) as typeof fetch;

  const client = new Qoni({
    accessKey: "ak_matrix",
    secretKey: "sk_matrix",
    host: "https://qoni.example.com/dashboard",
    timeoutMs: 500,
    fetch: fetchImpl,
  });

  return {
    client,
    calls,
    byPath: (path: string) =>
      calls.filter((call) => call.pathname === path || call.pathname.endsWith(path)),
    last: () => calls.at(-1),
  };
}

async function parseBody(body: BodyInit | null | undefined): Promise<unknown> {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return JSON.parse(body);
  if (body instanceof FormData) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of body.entries()) {
      if (value instanceof Blob) {
        out[key] = { type: value.type, size: value.size };
      } else {
        out[key] = value;
      }
    }
    return out;
  }
  return String(body);
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  new Headers(headers).forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function delegationToken(): string {
  return jwt({
    token_type: "eak_delegation_token",
    sub: "user_matrix",
    webagent_tenant_id: "tenant_matrix",
  });
}

describe("complete public method coverage matrix", () => {
  describe("constructor/auth/runtime-config/delegation/currentUser/raw request", () => {
    describe("qoni namespace", () => {
      it("only exposes delegation helpers and does not expose Qoni management-plane helpers", () => {
        const h = createHarness();

        expect(h.client.qoni).toHaveProperty("delegateToken");
        expect(h.client.qoni).toHaveProperty("completeDelegateToken");
        expect(h.client.qoni).not.toHaveProperty("workspaces");
        expect(h.client.qoni).not.toHaveProperty("credentials");
      });
    });

    describe("delegateToken", () => {
      it("sends silent mode required and optional parameters with signed AK/SK headers", async () => {
        const h = createHarness();

        const result = await h.client.delegateToken({
          mode: "silent",
          user: { id: "user_matrix", email: "user@example.com" },
          userId: "legacy_user_matrix",
          agent: "agent_matrix",
          scopes: [QoniScopes.GUMEM_MEMORY_READ],
          expiresIn: "3600",
          idempotencyKey: "idem_matrix",
          redirectUri: "https://app.example.com/callback",
          state: "business_state",
        });

        const call = h.byPath("/api/v3/eak/delegations")[0];
        expect(call.method).toBe("POST");
        expect(call.headers.authorization).toMatch(/^authing ak_matrix:/);
        expect(call.body).toMatchObject({
          mode: "silent",
          user: { id: "user_matrix", email: "user@example.com" },
          userId: "legacy_user_matrix",
          agent: "agent_matrix",
          scopes: [QoniScopes.GUMEM_MEMORY_READ],
          expiresIn: "3600",
          idempotencyKey: "idem_matrix",
          redirectUri: "https://app.example.com/callback",
          state: "business_state",
        });
        expect(result.data.token).toBeTruthy();
      });
    });

    describe("completeDelegateToken", () => {
      it("sends grantId, code, and state to the completion endpoint", async () => {
        const h = createHarness();

        await h.client.completeDelegateToken({
          grantId: "grant_matrix",
          code: "code_matrix",
          state: "state_matrix",
        });

        expect(h.byPath("/api/v3/eak/delegations/complete")[0].body).toEqual({
          grantId: "grant_matrix",
          code: "code_matrix",
          state: "state_matrix",
        });
      });
    });

    describe("request", () => {
      it("passes method, path, query, body, headers, and bearer token through the Qoni host", async () => {
        const h = createHarness();

        await h.client.request({
          method: "PATCH",
          path: "/api/custom/resource",
          token: "custom-token",
          query: { page: 1, enabled: true },
          body: { name: "matrix" },
          headers: { "x-custom": "yes" },
        });

        expect(h.last()).toMatchObject({
          pathname: "/dashboard/api/custom/resource",
          method: "PATCH",
          query: { page: "1", enabled: "true" },
          headers: { authorization: "Bearer custom-token", "x-custom": "yes" },
          body: { name: "matrix" },
        });
      });
    });
  });

  describe("genauth", () => {
    describe("userInfo/jwks/discovery/introspectDelegationToken", () => {
      it("routes identity helpers and delegation introspection", async () => {
        const h = createHarness();
        await h.client.genauth.userInfo({ accessToken: "user-access" });
        await h.client.genauth.jwks();
        await h.client.genauth.discovery();
        await h.client.genauth.introspectDelegationToken({ delegateAgentToken: "legacy-token" });

        expect(h.calls.slice(-4)).toMatchObject([
          { pathname: "/oidc/me", method: "GET", headers: { authorization: "Bearer user-access" } },
          { pathname: "/oidc/.well-known/jwks.json", method: "GET" },
          { pathname: "/oidc/.well-known/openid-configuration", method: "GET" },
          {
            pathname: "/api/v3/eak/delegations/introspect",
            method: "POST",
            body: { token: "legacy-token" },
          },
        ]);
      });
    });

    describe("users.list/get/getBatch/create/createBatch/update/deleteBatch", () => {
      it("covers admin-token exchange, override parameters, pagination, batch aliases, and userPool headers", async () => {
        const h = createHarness();

        await h.client.genauth.users.list({ page: 2, limit: 10, filter: { status: "active" } });
        await h.client.genauth.users.get({
          adminToken: "override-admin",
          userPoolId: "override-pool",
          userId: "user_matrix",
        });
        await h.client.genauth.users.getBatch({
          adminToken: "override-admin",
          userPoolId: "override-pool",
          userIds: ["user_matrix"],
        });
        await h.client.genauth.users.create({
          adminToken: "override-admin",
          userPoolId: "override-pool",
          username: "sdk_matrix",
          email: "sdk-matrix@example.com",
        });
        await h.client.genauth.users.createBatch({
          adminToken: "override-admin",
          userPoolId: "override-pool",
          users: [{ username: "sdk_matrix_batch" }],
          options: { keepPassword: true },
        });
        await h.client.genauth.users.update({
          adminToken: "override-admin",
          userPoolId: "override-pool",
          userId: "user_matrix",
          nickname: "Matrix",
        });
        await h.client.genauth.users.deleteBatch({
          adminToken: "override-admin",
          userPoolId: "override-pool",
          userIds: ["user_matrix"],
        });

        expect(h.byPath("/api/v3/eak/genauth/admin-token")).toHaveLength(1);
        expect(h.calls.slice(-7)).toMatchObject([
          {
            pathname: "/api/v3/list-users",
            method: "POST",
            headers: { authorization: "Bearer genauth-admin-token", "x-authing-userpool-id": "pool_matrix" },
            body: {
              filter: { status: "active" },
              options: { pagination: { page: 2, limit: 10 } },
            },
          },
          {
            pathname: "/api/v3/get-user",
            method: "GET",
            headers: { authorization: "Bearer override-admin", "x-authing-userpool-id": "override-pool" },
            query: { userId: "user_matrix" },
          },
          {
            pathname: "/api/v3/get-user-batch",
            method: "GET",
            query: { userIds: "user_matrix" },
          },
          {
            pathname: "/api/v3/create-user",
            method: "POST",
            body: { username: "sdk_matrix", email: "sdk-matrix@example.com" },
          },
          {
            pathname: "/api/v3/create-users-batch",
            method: "POST",
            body: { list: [{ username: "sdk_matrix_batch" }], options: { keepPassword: true } },
          },
          {
            pathname: "/api/v3/update-user",
            method: "POST",
            body: { userId: "user_matrix", nickname: "Matrix" },
          },
          {
            pathname: "/api/v3/delete-users-batch",
            method: "POST",
            body: { userIds: ["user_matrix"] },
          },
        ]);
      });
    });
  });

  describe("gumem", () => {
    describe("createSession/addMessages/recall/uploadResource/actions", () => {
      it("covers camelCase aliases, deprecated snake_case aliases, form upload, query parameters, and action methods", async () => {
        const h = createHarness();
        const token = delegationToken();

        await h.client.gumem.createSession({
          token,
          userId: "user_matrix",
          user_id: "legacy_user",
          sessionId: "sess_matrix",
          session_id: "legacy_session",
          title: "Matrix Session",
          metadata: { source: "coverage" },
        });
        await h.client.gumem.addMessages({
          token,
          sessionId: "sess_matrix",
          userId: "user_matrix",
          user_id: "legacy_user",
          sync: true,
          messages: [{ role: "user", content: "hello" }],
        });
        await h.client.gumem.recall({
          token,
          sessionId: "sess_matrix",
          query: "hello",
          details: true,
          recallConfig: { topK: 3 },
          metadataFilters: { source: "coverage" },
        });
        await h.client.gumem.uploadResource({
          token,
          userId: "user_matrix",
          sessionId: "sess_matrix",
          file: new Blob(["hello"], { type: "text/plain" }),
          filename: "hello.txt",
          contentType: "text/plain",
        });
        await h.client.gumem.actions.record({ token, user_id: "user_matrix", event_type: "view" });
        await h.client.gumem.actions.recall({ token, user_id: "user_matrix", query: "view" });
        const streamed = await h.client.gumem.actions.stream<{ content: string }[]>({
          token,
          user_id: "user_matrix",
          limit: 3,
        });
        expect(streamed.data).toEqual([
          { content: "first action" },
          { content: "second action" },
        ]);

        const gumemCalls = h.calls.filter((call) => call.url.startsWith("https://gumem.example.com"));
        expect(gumemCalls).toMatchObject([
          {
            pathname: "/api/sessions",
            method: "POST",
            body: {
              user_id: "user_matrix",
              session_id: "sess_matrix",
              title: "Matrix Session",
              metadata: { source: "coverage" },
            },
          },
          {
            pathname: "/api/sessions/sess_matrix/messages",
            method: "POST",
            body: {
              user_id: "user_matrix",
              sync: true,
              messages: [{ role: "user", content: "hello" }],
            },
          },
          {
            pathname: "/api/sessions/sess_matrix/context",
            method: "POST",
            query: { query: "hello", details: "true" },
            body: {
              recall_config: { topK: 3 },
              metadata_filters: { source: "coverage" },
            },
          },
          {
            pathname: "/api/resources",
            method: "POST",
            body: {
              user_id: "user_matrix",
              session_id: "sess_matrix",
              content_type: "text/plain",
              file: { type: "text/plain", size: 5 },
            },
          },
          {
            pathname: "/api/user/actions",
            method: "POST",
            body: { user_id: "user_matrix", event_type: "view" },
          },
          {
            pathname: "/api/user/actions/query",
            method: "GET",
            query: { user_id: "user_matrix", query: "view" },
          },
          {
            pathname: "/api/user/actions/stream",
            method: "GET",
            query: { user_id: "user_matrix", limit: "3" },
          },
        ]);
      });
    });
  });

  describe("webSearch/doAnything/track/deepResearch", () => {
    describe("webSearch.run/get/events/cancel", () => {
      it("covers escape-hatch run and all follow-up methods", async () => {
        const h = createHarness();
        const token = delegationToken();

        await h.client.webSearch.api.run({
          token,
          queries: ["qoni sdk"],
          maxResultsPerQuery: 5,
          siteWhitelist: ["eazo.ai"],
          siteBlacklist: ["example.net"],
        });
        await h.client.webSearch.api.get({ token, runId: "run_matrix" });
        for await (const _event of h.client.webSearch.api.events({ token, runId: "run_matrix", lastEventId: "0" })) {
          break;
        }
        await h.client.webSearch.api.cancel({ token, runId: "run_matrix", reason: "test cleanup" });

        const webSearchCalls = h.calls.filter((call) => call.pathname.includes("/web_search/"));
        expect(webSearchCalls).toMatchObject([
          {
            pathname: "/api/v1/projects/tenant_matrix/web_search/runs",
            method: "POST",
            body: {
              queries: ["qoni sdk"],
              max_results_per_query: 5,
              site_whitelist: ["eazo.ai"],
              site_blacklist: ["example.net"],
            },
          },
          { pathname: "/api/v1/projects/tenant_matrix/web_search/runs/run_matrix", method: "GET" },
          {
            pathname: "/api/v1/projects/tenant_matrix/web_search/runs/run_matrix/events",
            method: "GET",
            headers: expect.objectContaining({ "last-event-id": "0" }),
          },
          {
            pathname: "/api/v1/projects/tenant_matrix/web_search/runs/run_matrix/cancel",
            method: "POST",
            body: { reason: "test cleanup" },
          },
        ]);
      });
    });

    describe("doAnything.run/attach + api.createSession/createRun/getRun/events/intervene/cancel/readArtifacts/readRecording", () => {
      it("covers high-level and low-level Do Anything parameters and callbacks", async () => {
        const h = createHarness();
        const token = delegationToken();
        const observed: string[] = [];

        const handle = await h.client.doAnything.run({
          token,
          prompt: "open eazo.ai",
          profileId: "profile_matrix",
          keepAlive: true,
          allowedActions: ["navigate"],
          limits: { maxDurationMinutes: 1 },
        });
        expect(handle.id).toBe("run_matrix");
        expect(handle.sessionRef).toEqual({ sessionId: "sess_matrix" });
        await handle.wait({
          timeoutMs: 5_000,
          onEvent: () => {
            observed.push("event");
          },
        });
        await h.client.doAnything.api.getRun({ token, runId: "run_matrix" });
        await h.client.doAnything.api.intervene({
          token,
          runId: "run_matrix",
          requestId: "input_matrix",
          response: "approve",
        });
        await h.client.doAnything.api.cancel({
          token,
          runId: "run_matrix",
          reason: "cleanup",
        });
        await h.client.doAnything.api.readArtifacts({
          token,
          sessionId: "sess_matrix",
          artifactId: "artifact_matrix",
        });
        await h.client.doAnything.api.readRecording({ token, sessionId: "sess_matrix" });

        expect(observed).toContain("event");
        // Every knob — session-level included — rides on the single create
        // body; there is no separate session create and no write-time
        // `stream` event subscription.
        expect(
          h.calls.find((call) => call.pathname.endsWith("/do_anything/runs"))?.body,
        ).toEqual({
          instructions: "open eazo.ai",
          profile_id: "profile_matrix",
          keep_alive: true,
          allowed_actions: ["navigate"],
          max_duration_minutes: 1,
        });
        expect(h.calls.map((call) => `${call.method} ${call.pathname}`)).toEqual(
          expect.arrayContaining([
            "POST /api/v1/projects/tenant_matrix/do_anything/runs",
            "GET /api/v1/projects/tenant_matrix/do_anything/runs/run_matrix",
            "POST /api/v1/projects/tenant_matrix/do_anything/runs/run_matrix/intervene",
            "POST /api/v1/projects/tenant_matrix/do_anything/runs/run_matrix/cancel",
            "GET /api/v1/projects/tenant_matrix/do_anything/sessions/sess_matrix/artifacts/artifact_matrix",
            "GET /api/v1/projects/tenant_matrix/do_anything/sessions/sess_matrix/recording",
          ]),
        );
        expect(
          h.calls.find((call) =>
            call.pathname.endsWith("/do_anything/runs/run_matrix/intervene"),
          )?.body,
        ).toEqual({
          kind: "answer_input_request",
          input_request_id: "input_matrix",
          response: "approve",
        });
      });
    });

    describe("track.createMonitor/getMonitor/runNow/events/updateMonitor/deleteMonitor", () => {
      it("covers the full Track monitor lifecycle", async () => {
        const h = createHarness();
        const token = delegationToken();

        await h.client.track.api.createMonitor({ token, url: "https://eazo.ai", instructions: "watch" });
        await h.client.track.api.getMonitor({ token, monitorId: "monitor_matrix" });
        await h.client.track.api.runNow({ token, monitorId: "monitor_matrix" });
        for await (const _event of h.client.track.api.events({ token, monitorId: "monitor_matrix", lastEventId: "1" })) {
          break;
        }
        await h.client.track.api.updateMonitor({
          token,
          monitorId: "monitor_matrix",
          schedule: "0 9 * * *",
        });
        await h.client.track.api.deleteMonitor({ token, monitorId: "monitor_matrix" });

        expect(h.calls.filter((call) => call.pathname.includes("/track/"))).toMatchObject([
          {
            pathname: "/api/v1/projects/tenant_matrix/track/monitors",
            method: "POST",
            body: { url: "https://eazo.ai", instructions: "watch" },
          },
          { pathname: "/api/v1/projects/tenant_matrix/track/monitors/monitor_matrix", method: "GET" },
          { pathname: "/api/v1/projects/tenant_matrix/track/monitors/monitor_matrix/run_now", method: "POST", body: {} },
          {
            pathname: "/api/v1/projects/tenant_matrix/track/monitors/monitor_matrix/events",
            method: "GET",
            headers: expect.objectContaining({ "last-event-id": "1" }),
          },
          {
            pathname: "/api/v1/projects/tenant_matrix/track/monitors/monitor_matrix",
            method: "PATCH",
            body: { schedule: "0 9 * * *" },
          },
          { pathname: "/api/v1/projects/tenant_matrix/track/monitors/monitor_matrix", method: "DELETE" },
        ]);
      });
    });

    describe("deepResearch.run/get/events/followUp/cancel/feedback/listArtifacts/getArtifact", () => {
      it("covers all Deep Research parameters and routes", async () => {
        const h = createHarness();
        const token = delegationToken();

        await h.client.deepResearch.api.run({
          token,
          topic: "battery recycling",
          outputFormat: "report",
          targetAudience: "investors",
          maxDurationMinutes: 30,
          callbackUrl: "https://app.example.com/hooks/deep",
          domainWhitelist: ["eazo.ai"],
          domainBlacklist: ["example.net"],
        });
        await h.client.deepResearch.api.get({ token, runId: "deep_matrix" });
        for await (const _event of h.client.deepResearch.api.events({ token, runId: "deep_matrix", lastEventId: "2" })) {
          break;
        }
        await h.client.deepResearch.api.followUp({ token, runId: "deep_matrix", text: "add risks" });
        await h.client.deepResearch.api.cancel({ token, runId: "deep_matrix" });
        await h.client.deepResearch.api.feedback({
          token,
          runId: "deep_matrix",
          rating: 5,
          feedbackText: "useful",
        });
        await h.client.deepResearch.api.listArtifacts({ token, runId: "deep_matrix" });
        await h.client.deepResearch.api.getArtifact({
          token,
          runId: "deep_matrix",
          artifactId: "artifact_matrix",
        });

        expect(h.calls.filter((call) => call.pathname.includes("/deep_research/"))).toMatchObject([
          {
            pathname: "/api/v1/projects/tenant_matrix/deep_research/runs",
            method: "POST",
            body: {
              topic: "battery recycling",
              output_format: "report",
              target_audience: "investors",
              max_duration_minutes: 30,
              callback_url: "https://app.example.com/hooks/deep",
              domain_whitelist: ["eazo.ai"],
              domain_blacklist: ["example.net"],
            },
          },
          { pathname: "/api/v1/projects/tenant_matrix/deep_research/runs/deep_matrix", method: "GET" },
          {
            pathname: "/api/v1/projects/tenant_matrix/deep_research/runs/deep_matrix/events",
            method: "GET",
            headers: expect.objectContaining({ "last-event-id": "2" }),
          },
          {
            pathname: "/api/v1/projects/tenant_matrix/deep_research/runs/deep_matrix/messages",
            method: "POST",
            body: { text: "add risks" },
          },
          {
            pathname: "/api/v1/projects/tenant_matrix/deep_research/runs/deep_matrix/cancel",
            method: "POST",
            body: {},
          },
          {
            pathname: "/api/v1/projects/tenant_matrix/deep_research/runs/deep_matrix/feedback",
            method: "POST",
            body: { rating: 5, feedback_text: "useful" },
          },
          { pathname: "/api/v1/projects/tenant_matrix/deep_research/runs/deep_matrix/artifacts", method: "GET" },
          {
            pathname: "/api/v1/projects/tenant_matrix/deep_research/runs/deep_matrix/artifacts/artifact_matrix",
            method: "GET",
          },
        ]);
      });
    });
  });

  describe("stable error behavior", () => {
    it("maps HTTP and envelope errors to typed SDK errors", async () => {
      const cases = [
        { status: 401, code: "eak.auth.invalid", klass: QoniAuthError },
        { status: 403, code: "delegation.required", klass: QoniDelegationRequiredError },
        { status: 403, code: "scope is not allowed", klass: QoniPermissionDeniedError },
        { status: 401, code: "token expired", klass: QoniTokenExpiredError },
        { status: 429, code: "rate_limit", klass: QoniRateLimitError },
        { status: 502, code: "upstream unavailable", klass: QoniUpstreamError },
      ] as const;

      for (const item of cases) {
        const client = new Qoni({
          accessKey: "ak_matrix",
          secretKey: "sk_matrix",
          host: "https://qoni.example.com",
          fetch: (async () =>
            jsonResponse({ statusCode: item.status, message: item.code, apiCode: item.code })) as typeof fetch,
        });

        await expect(
          client.delegateToken({
            userId: "user_matrix",
            agent: "agent_matrix",
            scopes: ["gumem.memory:read"],
          }),
        ).rejects.toBeInstanceOf(item.klass);
      }
    });

    it("wraps request timeouts in QoniTimeoutError", async () => {
      const client = new Qoni({
        accessKey: "ak_matrix",
        secretKey: "sk_matrix",
        host: "https://qoni.example.com",
        timeoutMs: 1,
        fetch: ((_url: URL | RequestInfo, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener(
              "abort",
              () => reject(new DOMException("Aborted", "AbortError")),
              { once: true },
            );
          })) as typeof fetch,
      });

      await expect(
        client.delegateToken({
          userId: "user_matrix",
          agent: "agent_matrix",
          scopes: ["gumem.memory:read"],
        }),
      ).rejects.toBeInstanceOf(QoniTimeoutError);
    });

    it("wraps fetch connect timeouts in QoniTimeoutError", async () => {
      const fetchError = new TypeError("fetch failed");
      (fetchError as Error & { cause?: unknown }).cause = {
        name: "ConnectTimeoutError",
        code: "UND_ERR_CONNECT_TIMEOUT",
      };
      const client = new Qoni({
        accessKey: "ak_matrix",
        secretKey: "sk_matrix",
        host: "https://qoni.example.com",
        fetch: (async () => {
          throw fetchError;
        }) as typeof fetch,
      });

      await expect(
        client.delegateToken({
          userId: "user_matrix",
          agent: "agent_matrix",
          scopes: ["gumem.memory:read"],
        }),
      ).rejects.toBeInstanceOf(QoniTimeoutError);
    });

    it("wraps fetch network failures in retryable QoniUpstreamError", async () => {
      const client = new Qoni({
        accessKey: "ak_matrix",
        secretKey: "sk_matrix",
        host: "https://qoni.example.com",
        fetch: (async () => {
          throw new TypeError("fetch failed");
        }) as typeof fetch,
      });

      await expect(
        client.delegateToken({
          userId: "user_matrix",
          agent: "agent_matrix",
          scopes: ["gumem.memory:read"],
        }),
      ).rejects.toMatchObject({
        name: "QoniUpstreamError",
        code: "upstream.failed",
        retryable: true,
      });
    });
  });
});
