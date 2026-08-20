import { buildSignedHeaders } from "./auth";
import { createDeepResearchNamespace } from "./deep-research";
import { createDoAnythingNamespace } from "./do-anything";
import { createQoniNamespace } from "./qoni";
import {
  QoniError,
  QoniDelegationRequiredError,
  QoniValidationError,
  errorFromPayload,
  networkError,
  timeoutError,
} from "./errors";
import { QoniProductScopes, KNOWN_SCOPES, type QoniProduct } from "./scopes";
import { createGenAuthNamespace } from "./genauth";
import { createGumemNamespace } from "./gumem";
import { createTrackNamespace } from "./track";
import {
  isJsonObject,
  type CompleteDelegateAgentInput,
  type CompleteDelegateTokenInput,
  type DelegateAgentInput,
  type DelegateAgentResponse,
  type DelegateTokenInteractiveInput,
  type DelegateTokenInput,
  type QoniEvent,
  type QoniHttpMethod,
  type QoniOptions,
  type QoniResponse,
  type QoniRuntimeConfig,
  type QoniService,
  type QoniTransport,
  type DelegateTokenResponse,
  type DelegateTokenSilentResponse,
  type DelegateTokenSilentInput,
  type InteractiveDelegationResponse,
  type JsonObject,
  type RawRequestInput,
  type RequestPayload,
} from "./types";
import type { GenAuthAccessTokenInput } from "./genauth";
import { createWebSearchNamespace } from "./web-search";

const DEFAULT_QONI_HOST = "https://anima.eazo.ai/dashboard";

export class Qoni {
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly sseMaxRetries: number;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly host: string;
  private runtimeConfigPromise?: Promise<ResolvedRuntimeConfig>;
  private readonly productTokenCache = new Map<string, { token: string; expiresAt: number }>();
  private genAuthAdminTokenCache?: { accessToken: string; userPoolId: string; expiresAt: number };

  readonly gumem: ReturnType<typeof createGumemNamespace>;
  readonly genauth: ReturnType<typeof createGenAuthNamespace>;
  readonly qoni: ReturnType<typeof createQoniNamespace>;
  readonly webSearch: ReturnType<typeof createWebSearchNamespace>;
  readonly doAnything: ReturnType<typeof createDoAnythingNamespace>;
  readonly track: ReturnType<typeof createTrackNamespace>;
  readonly deepResearch: ReturnType<typeof createDeepResearchNamespace>;

  constructor(private readonly options: QoniOptions) {
    const accessKey = options.accessKey ?? options.accessKeyId;
    const secretKey = options.secretKey ?? options.accessKeySecret;
    const host = options.host ?? options.qoniBaseUrl ?? options.genauthBaseUrl ?? DEFAULT_QONI_HOST;
    if (!accessKey || !secretKey) {
      throw new Error("Qoni requires accessKey and secretKey");
    }
    this.accessKey = accessKey ?? "";
    this.secretKey = secretKey ?? "";
    this.host = normalizeBaseUrl(host);
    this.fetchImpl = options.fetch ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.sseMaxRetries = options.sseMaxRetries ?? 5;
    const transport: QoniTransport = {
      qoniJson: (...args) => this.qoniJson(...args),
      genauthJson: (...args) => this.genauthJson(...args),
      gumemJson: (...args) => this.gumemJson(...args),
      gumemSSE: (...args) => this.gumemSSE(...args),
      webAgentJson: (...args) => this.webAgentJson(...args),
      webAgentBytes: (...args) => this.webAgentBytes(...args),
      webAgentSSE: (...args) => this.webAgentSSE(...args),
    };
    this.genauth = createGenAuthNamespace(transport, {
      adminTokenFor: () => this.genauthAdminTokenFor(),
    });
    this.qoni = createQoniNamespace(
      transport,
      this.delegateToken.bind(this),
      (input) => this.completeDelegateToken(input),
    );
    this.gumem = createGumemNamespace(transport);
    this.webSearch = createWebSearchNamespace(transport);
    this.doAnything = createDoAnythingNamespace(transport);
    this.track = createTrackNamespace(transport);
    this.deepResearch = createDeepResearchNamespace(transport);
  }

  delegateToken(
    input: DelegateTokenInteractiveInput,
  ): Promise<QoniResponse<InteractiveDelegationResponse>>;
  delegateToken(input: DelegateTokenSilentInput): Promise<QoniResponse<DelegateTokenSilentResponse>>;
  delegateToken(input: DelegateTokenInput): Promise<QoniResponse<DelegateAgentResponse>>;
  delegateToken(input: DelegateTokenInput): Promise<QoniResponse<DelegateAgentResponse>> {
    // Scope pre-validation + products expansion happen BEFORE any request, so
    // format mistakes fail locally with the correct form in the message.
    let body: JsonObject;
    try {
      body = normalizeDelegateTokenInput(input);
    } catch (err) {
      return Promise.reject(err);
    }
    return this.signedPost<DelegateAgentResponse>(
      "/api/v3/eak/delegations",
      body,
    ).then(normalizeDelegateAgentTokenResponse);
  }

  /** @deprecated Use delegateToken. */
  delegateAgent(input: DelegateAgentInput): Promise<QoniResponse<DelegateAgentResponse>> {
    return this.delegateToken(input);
  }

  completeDelegateToken(
    input: CompleteDelegateTokenInput,
  ): Promise<QoniResponse<DelegateTokenResponse>> {
    return this.signedPost<DelegateTokenResponse>(
      "/api/v3/eak/delegations/complete",
      input,
    ).then(
      normalizeDelegateAgentTokenResponse,
    );
  }

  /** @deprecated Use completeDelegateToken. */
  completeDelegateAgent(
    input: CompleteDelegateAgentInput,
  ): Promise<QoniResponse<DelegateTokenResponse>> {
    return this.completeDelegateToken(input);
  }

  currentUser<T = unknown>(input: GenAuthAccessTokenInput): Promise<QoniResponse<T>> {
    return this.genauth.userInfo<T>(input);
  }

  /**
   * Resolve a real GenAuth user id from the userpool bound to this AK/SK, by
   * listing users and returning the first one. Convenience for demos / smoke
   * tests so `delegateToken` has a valid `userId` without hardcoding one. In
   * application code, resolve the actual logged-in user via `currentUser`
   * instead of picking an arbitrary userpool member.
   */
  async resolveAnyBoundUser(): Promise<string> {
    const res = await this.genauth.users.list<unknown>({ page: 1, limit: 1 });
    const userId = firstBoundUserId(res.data);
    if (!userId) {
      throw new QoniError(
        "resolveAnyBoundUser: the credential-bound GenAuth userpool returned no users. " +
          "Create a user in the userpool, or pass a real userId to delegateToken.",
        { code: "eak.genauth.no_bound_users" },
      );
    }
    return userId;
  }

  request<T = unknown>(input: RawRequestInput): Promise<QoniResponse<T>> {
    return this.unstableRequest<T>(input);
  }

  unstableRequest<T = unknown>(input: RawRequestInput): Promise<QoniResponse<T>> {
    if (!input.token) {
      const pathname = normalizePath(input.path);
      const signaturePayload =
        input.method === "GET" ? (input.query || {}) : (input.body || {});
      const signedHeaders = buildSignedHeaders(
        {
          accessKey: this.accessKey,
          secretKey: this.secretKey,
        },
        input.method,
        pathname,
        signaturePayload,
      );
      return this.baseUrlFor("qoni").then((baseUrl) => this.jsonRequest<T>(baseUrl, pathname, {
        method: input.method,
        query: input.query,
        body: input.body,
        headers: {
          ...nonSignatureHeaders(input.headers),
          ...signedHeaders,
        },
        service: "qoni",
        signed: true,
      }));
    }
    return this.baseUrlFor("qoni").then((baseUrl) => this.jsonRequest<T>(baseUrl, input.path, {
      method: input.method,
      token: input.token,
      query: input.query,
      body: input.body,
      headers: input.headers,
      service: "qoni",
    }));
  }

  private qoniJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload: RequestPayload = {},
  ): Promise<QoniResponse<T>> {
    return this.baseUrlFor("qoni").then((baseUrl) => this.jsonRequest<T>(baseUrl, path, {
      ...payload,
      method,
      token,
      service: "qoni",
    }));
  }

  private genauthJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload: RequestPayload = {},
  ): Promise<QoniResponse<T>> {
    return this.baseUrlFor("genauth").then((baseUrl) => this.jsonRequest<T>(baseUrl, path, {
      ...payload,
      method,
      token,
      service: "genauth",
    }));
  }

  private async gumemJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload: RequestPayload = {},
  ): Promise<QoniResponse<T>> {
    const runtimeToken = await this.productTokenFor("gumem", token, payload.requiredScopes);
    const baseUrl = await this.baseUrlFor("gumem");
    return this.jsonRequest<T>(baseUrl, path, {
      ...payload,
      method,
      token: runtimeToken,
      service: "gumem",
    });
  }

  private async *gumemSSE<T>(
    path: string,
    token?: string,
    payload: RequestPayload & { lastEventId?: string; signal?: AbortSignal } = {},
  ): AsyncIterable<QoniEvent<T>> {
    const runtimeToken = await this.productTokenFor("gumem", token, payload.requiredScopes);
    const baseUrl = await this.baseUrlFor("gumem");
    for await (const event of this.sseRequest<T>(baseUrl, path, {
      ...payload,
      token: runtimeToken,
      service: "gumem",
    })) {
      yield event;
    }
  }

  private async webAgentJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload: RequestPayload = {},
  ): Promise<QoniResponse<T>> {
    const runtimeToken = await this.productTokenFor("webagent", token, payload.requiredScopes);
    const baseUrl = await this.baseUrlFor("webagent");
    return this.jsonRequest<T>(
      baseUrl,
      this.webAgentPath(runtimeToken, path),
      { ...payload, method, token: runtimeToken, service: "webagent" },
    );
  }

  // Binary GET against the WebAgent API — artifact content downloads. JSON
  // error payloads still map to typed QoniErrors.
  private async webAgentBytes(
    path: string,
    token?: string,
    payload: RequestPayload = {},
  ): Promise<{ bytes: Uint8Array; mime: string }> {
    const runtimeToken = await this.productTokenFor("webagent", token, payload.requiredScopes);
    const baseUrl = await this.baseUrlFor("webagent");
    const response = await this.fetchWithTimeout(
      urlWithBasePath(baseUrl, this.webAgentPath(runtimeToken, path), payload.query),
      {
        method: "GET",
        headers: {
          accept: "*/*",
          authorization: `Bearer ${runtimeToken}`,
          ...(payload.headers || {}),
        },
      },
    );
    if (!response.ok) {
      throw errorFromPayload(
        response.status,
        await readJson(response),
        `Qoni request failed with HTTP ${response.status}`,
      );
    }
    const buffer = await response.arrayBuffer();
    return {
      bytes: new Uint8Array(buffer),
      mime: response.headers.get("content-type") || "application/octet-stream",
    };
  }

  private async *webAgentSSE<T>(
    path: string,
    token?: string,
    payload: RequestPayload & {
      lastEventId?: string;
      signal?: AbortSignal;
      onReconnect?: (info: { attempt: number; lastEventId?: string; error: unknown }) => void;
    } = {},
  ): AsyncIterable<QoniEvent<T>> {
    const runtimeToken = await this.productTokenFor("webagent", token, payload.requiredScopes);
    const baseUrl = await this.baseUrlFor("webagent");
    for await (const event of this.sseRequest<T>(
      baseUrl,
      this.webAgentPath(runtimeToken, path),
      {
        ...payload,
        token: runtimeToken,
        service: "webagent",
        // Re-resolve the product token before each reconnect (refreshes if the
        // cached one expired); the tenant — and therefore the path — is stable.
        refreshToken: () => this.productTokenFor("webagent", token, payload.requiredScopes),
      },
    )) {
      // WebAgent run streams carry no SSE `event:` line — the wire event type
      // lives in the envelope's `type` field. Surface it as `event.event` so
      // callers can match against QoniEventTypes (e.g. RUN_COMPLETED) instead of
      // reaching into the payload. `data` is left intact (envelope with
      // `type` / `task_id` / `session_id` / `data`).
      yield normalizeWebAgentEvent(event);
    }
  }

  private async signedPost<T>(pathname: string, body: object): Promise<QoniResponse<T>> {
    const payload = toRecord(body);
    const headers = buildSignedHeaders(
      {
        accessKey: this.accessKey,
        secretKey: this.secretKey,
      },
      "POST",
      pathname,
      payload,
    );
    return this.jsonRequest<T>(await this.baseUrlFor("qoni"), pathname, {
      method: "POST",
      body: payload,
      headers,
      service: "qoni",
      signed: true,
    });
  }

  private async jsonRequest<T>(
    baseUrl: string,
    pathname: string,
    options: RequestPayload & {
      method: QoniHttpMethod;
      token?: string;
      service: QoniService;
      signed?: boolean;
    },
  ): Promise<QoniResponse<T>> {
    const response = await this.fetchWithTimeout(
      urlWithBasePath(baseUrl, pathname, options.query),
      {
        method: options.method,
        headers: requestHeaders(options),
        body: requestBody(options.body),
      },
    );
    const payload = await readJson(response);
    if (!response.ok) {
      throw errorFromPayload(
        response.status,
        payload,
        `Qoni request failed with HTTP ${response.status}`,
      );
    }
    const envelopeStatus = errorEnvelopeStatus(payload);
    if (envelopeStatus !== undefined) {
      throw errorFromPayload(
        envelopeStatus,
        payload,
        `Qoni request failed with statusCode ${envelopeStatus}`,
      );
    }
    return normalizeResponse<T>(payload, options.service);
  }

  // Reconnecting wrapper: yields events from a fresh connection, and on a
  // dropped stream (network/5xx, not a clean close or a user abort) reconnects
  // with `last-event-id` so the backend replays from where we left off. Each
  // attempt re-issues the GET with the same Bearer product token (no per-call
  // AK/SK signature, so no gateway nonce replay). Caps at `sseMaxRetries`.
  private async *sseRequest<T>(
    baseUrl: string,
    pathname: string,
    options: RequestPayload & {
      token: string;
      service: QoniService;
      lastEventId?: string;
      signal?: AbortSignal;
      // Re-resolved before every (re)connect so a long stream survives product
      // token expiry — the dominant cause of a reconnect failing with 401.
      refreshToken?: () => Promise<string>;
      // Observability: called before each reconnect attempt (not the first).
      onReconnect?: (info: { attempt: number; lastEventId?: string; error: unknown }) => void;
    },
  ): AsyncIterable<QoniEvent<T>> {
    let lastEventId = options.lastEventId;
    let attempt = 0;
    for (;;) {
      const token = options.refreshToken ? await options.refreshToken() : options.token;
      try {
        for await (const event of this.sseConnectOnce<T>(baseUrl, pathname, {
          ...options,
          token,
          lastEventId,
        })) {
          if (event.id) lastEventId = event.id;
          attempt = 0; // a delivered event proves the connection is healthy
          yield event;
        }
        return; // server closed the stream cleanly — the run is over
      } catch (err) {
        if (options.signal?.aborted) throw err; // user abort — never retry
        // 401/403 on a reconnect is usually an expired product token; with a
        // refreshToken the next attempt re-resolves it, so allow the retry.
        const canRetry =
          isRetryableStreamError(err) || (!!options.refreshToken && isAuthError(err));
        if (attempt >= this.sseMaxRetries || !canRetry) throw err;
        attempt++;
        options.onReconnect?.({ attempt, lastEventId, error: err });
        await sleepWithAbort(sseBackoffMs(attempt), options.signal);
      }
    }
  }

  private async *sseConnectOnce<T>(
    baseUrl: string,
    pathname: string,
    options: RequestPayload & {
      token: string;
      service: QoniService;
      lastEventId?: string;
      signal?: AbortSignal;
    },
  ): AsyncIterable<QoniEvent<T>> {
    const response = await this.fetchWithTimeout(
      urlWithBasePath(baseUrl, pathname, options.query),
      {
        method: "GET",
        headers: {
          accept: "text/event-stream",
          authorization: `Bearer ${options.token}`,
          ...(options.headers || {}),
          ...(options.lastEventId ? { "last-event-id": options.lastEventId } : {}),
        },
      },
      options.signal,
      { streamBody: true },
    );
    if (!response.ok) {
      throw errorFromPayload(
        response.status,
        await readJson(response),
        `Qoni stream failed with HTTP ${response.status}`,
      );
    }
    if (!response.body) {
      throw errorFromPayload(502, undefined, "Qoni stream response has no body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        // Belt and braces: even if abort → reader rejection plumbing fails,
        // notice the aborted signal at the next delivered chunk/heartbeat.
        if (options.signal?.aborted) {
          await reader.cancel().catch(() => undefined);
          throw options.signal.reason || new DOMException("Aborted", "AbortError");
        }
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split(/\r?\n\r?\n/);
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          const event = parseSSEEvent<T>(chunk);
          if (event) yield event;
        }
      }
      const finalEvent = parseSSEEvent<T>(buffer);
      if (finalEvent) yield finalEvent;
    } finally {
      reader.releaseLock();
    }
  }

  private async fetchWithTimeout(
    input: URL,
    init: RequestInit,
    signal?: AbortSignal,
    opts?: { streamBody?: boolean },
  ): Promise<Response> {
    if (signal?.aborted) throw signal.reason || new DOMException("Aborted", "AbortError");
    const controller = new AbortController();
    const resolved = resolveLocalGenauthRequest(input);
    const requestInit = resolved.hostHeader
      ? {
          ...init,
          headers: withHostHeader(init.headers, resolved.hostHeader),
        }
      : init;
    let didTimeout = false;
    const abortFromSignal = () => controller.abort(signal?.reason);
    signal?.addEventListener("abort", abortFromSignal, { once: true });
    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, this.timeoutMs);
    try {
      return await this.fetchImpl(resolved.url, { ...requestInit, signal: controller.signal });
    } catch (error) {
      if ((isAbortError(error) && didTimeout) || isConnectTimeoutError(error)) {
        throw timeoutError(error);
      }
      if (isFetchNetworkError(error)) throw networkError(error);
      throw error;
    } finally {
      clearTimeout(timeout);
      // For one-shot requests the body is consumed before we return, so the
      // user-signal → request-controller link can be dropped here. For SSE the
      // body outlives this call — keep the link so a later abort still kills
      // the stream (the listener is once:true and the controller is per-call,
      // so nothing accumulates beyond the connection's lifetime).
      if (!opts?.streamBody) signal?.removeEventListener("abort", abortFromSignal);
    }
  }

  private async baseUrlFor(service: QoniService): Promise<string> {
    const explicit = this.explicitBaseUrlFor(service);
    if (explicit) return explicit;
    const runtime = await this.runtimeConfig();
    // AK/SK signatures are scoped to the configured control-plane endpoint.
    // Keep signed Qoni calls on that trusted boundary: following a cross-origin
    // runtime URL can strip Authorization on redirect or disclose credentials.
    if (service === "qoni") return this.host;
    const hostOrigin = originBaseUrl(this.host);
    if (service === "genauth") return runtime.genauthBaseUrl ?? hostOrigin;
    if (service === "gumem") return runtime.gumemBaseUrl ?? hostOrigin;
    return runtime.webAgentBaseUrl ?? hostOrigin;
  }

  private explicitBaseUrlFor(service: QoniService): string | undefined {
    if (service === "qoni") {
      const value = this.options.qoniBaseUrl ?? this.options.genauthBaseUrl;
      return value ? normalizeBaseUrl(value) : undefined;
    }
    if (service === "genauth" && this.options.genauthBaseUrl) {
      return normalizeBaseUrl(this.options.genauthBaseUrl);
    }
    if (service === "genauth") {
      const value = serviceHostOption(this.options, "genauth");
      return value ? normalizeBaseUrl(value) : undefined;
    }
    if (service === "gumem" && this.options.gumemBaseUrl) {
      return normalizeBaseUrl(this.options.gumemBaseUrl);
    }
    if (service === "gumem") {
      const value = serviceHostOption(this.options, "gumem");
      return value ? normalizeBaseUrl(value) : undefined;
    }
    if (service === "webagent" && this.options.webAgentBaseUrl) {
      return normalizeBaseUrl(this.options.webAgentBaseUrl);
    }
    if (service === "webagent") {
      const value = serviceHostOption(this.options, "webagent");
      return value ? normalizeBaseUrl(value) : undefined;
    }
    return undefined;
  }

  private runtimeConfig(): Promise<ResolvedRuntimeConfig> {
    this.runtimeConfigPromise ??= this.fetchRuntimeConfig();
    return this.runtimeConfigPromise;
  }

  private async fetchRuntimeConfig(): Promise<ResolvedRuntimeConfig> {
    const pathname = "/api/v3/eak/runtime-config";
    const headers = buildSignedHeaders(
      {
        accessKey: this.accessKey,
        secretKey: this.secretKey,
      },
      "GET",
      pathname,
      {},
    );
    const response = await this.fetchWithTimeout(
      urlWithBasePath(this.host, pathname),
      {
        method: "GET",
        headers: {
          accept: "application/json",
          ...headers,
        },
      },
    );
    const payload = await readJson(response);
    if (!response.ok) {
      throw errorFromPayload(
        response.status,
        payload,
        `Qoni runtime config request failed with HTTP ${response.status}`,
      );
    }
    return normalizeRuntimeConfig(payload);
  }

  private webAgentPath(token: string, path: string): string {
    const normalized = normalizePath(path);
    if (normalized.startsWith("/api/v1/projects/")) return normalized;
    // The tenant is carried by the delegation token (a JWT).
    const tenantId = requiredWebAgentTenantId(token);
    return `/api/v1/projects/${encodeURIComponent(tenantId)}${normalized}`;
  }

  private async productTokenFor(
    service: "gumem" | "webagent",
    token: string | undefined,
    requiredScopes: readonly string[] | undefined,
  ): Promise<string> {
    const runtimeToken = requiredRuntimeToken(token);
    if (!isQoniDelegationToken(runtimeToken)) return runtimeToken;

    const scopes = [...(requiredScopes || [])].sort();
    const cacheKey = [service, runtimeToken, scopes.join(" ")].join(":");
    const cached = this.productTokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

    const response = await this.signedPost<unknown>("/api/v3/eak/token-exchange", {
      subjectToken: runtimeToken,
      resource: service === "gumem" ? "gumem" : "webagent",
      scopes,
    });
    const payload = response.data;
    const accessToken = readAccessToken(payload);
    if (!accessToken) {
      throw errorFromPayload(
        502,
        payload,
        "Qoni product token exchange response did not include an access token",
      );
    }

    this.productTokenCache.set(cacheKey, {
      token: accessToken,
      expiresAt: Date.now() + Math.max(0, readExpiresIn(payload) ?? 3600) * 1000,
    });
    return accessToken;
  }

  private async genauthAdminTokenFor(): Promise<{ accessToken: string; userPoolId: string }> {
    const cached = this.genAuthAdminTokenCache;
    if (cached && cached.expiresAt > Date.now() + 30_000) {
      return { accessToken: cached.accessToken, userPoolId: cached.userPoolId };
    }

    const response = await this.signedPost<unknown>("/api/v3/eak/genauth/admin-token", {});
    const payload = response.data;
    const accessToken = readAccessToken(payload);
    const userPoolId =
      readString(payload, "userPoolId") ??
      readString(payload, "userpoolId") ??
      readString(payload, "user_pool_id");
    if (!accessToken || !userPoolId) {
      throw errorFromPayload(
        502,
        payload,
        "Qoni GenAuth admin-token response did not include accessToken and userPoolId",
      );
    }

    this.genAuthAdminTokenCache = {
      accessToken,
      userPoolId,
      expiresAt: Date.now() + Math.max(0, readExpiresIn(payload) ?? 3600) * 1000,
    };
    return { accessToken, userPoolId };
  }
}

interface ResolvedRuntimeConfig {
  eakBaseUrl?: string;
  genauthBaseUrl?: string;
  gumemBaseUrl?: string;
  webAgentBaseUrl?: string;
}

function requestHeaders(
  options: RequestPayload & { token?: string; signed?: boolean },
): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/json",
    ...(options.headers || {}),
  };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  if (options.body !== undefined && !isBodyInit(options.body) && !headers["content-type"]) {
    headers["content-type"] = "application/json";
  }
  return headers;
}

function nonSignatureHeaders(
  headers: Record<string, string> | undefined,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers || {}).filter(([key]) => {
      const normalized = key.toLowerCase();
      return (
        normalized !== "authorization" &&
        normalized !== "content-type" &&
        normalized !== "date" &&
        !normalized.startsWith("x-authing-")
      );
    }),
  );
}

function requestBody(body: RequestPayload["body"]): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (isBodyInit(body)) return body;
  return JSON.stringify(body);
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof ArrayBuffer ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams
  );
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  if (contentType.includes("ndjson") || contentType.includes("jsonl")) {
    const body = await response.text();
    if (!body.trim()) return [];
    try {
      return body
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));
    } catch {
      return undefined;
    }
  }
  return response.json().catch(() => undefined);
}

function normalizeResponse<T>(payload: unknown, _service: QoniService): QoniResponse<T> {
  if (isJsonObject(payload) && ("data" in payload || "meta" in payload)) {
    return {
      data: ("data" in payload ? payload.data : payload) as T,
      meta: {
        ...(isJsonObject(payload.meta) ? payload.meta : {}),
        ...topLevelMeta(payload),
      },
    };
  }
  return { data: payload as T, meta: {} };
}

function topLevelMeta(payload: JsonObject): JsonObject {
  const meta: JsonObject = {};
  for (const key of ["requestId", "traceId", "auditId"]) {
    if (typeof payload[key] === "string") meta[key] = payload[key];
  }
  return meta;
}

function urlWithQuery(baseUrl: string, pathname: string, query?: JsonObject): URL {
  const url = new URL(normalizePath(pathname), baseUrl);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url;
}

function urlWithBasePath(baseUrl: string, pathname: string, query?: JsonObject): URL {
  const base = new URL(baseUrl);
  const basePath = base.pathname === "/" ? "" : base.pathname.replace(/\/+$/, "");
  const normalizedPath = normalizePath(pathname);
  const fullPath =
    basePath && (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`))
      ? normalizedPath
      : `${basePath}${normalizedPath}`;
  return urlWithQuery(base.origin, fullPath, query);
}

function resolveLocalGenauthRequest(input: URL): { url: URL; hostHeader?: string } {
  const url = new URL(input.toString());
  if (
    process.env.QONI_LOCAL_GENAUTH_REWRITE === "false" ||
    url.protocol !== "http:" ||
    !url.hostname.endsWith(".genauth.localhost")
  ) {
    return { url };
  }

  const hostHeader = url.host;
  url.hostname = process.env.QONI_LOCAL_GENAUTH_TARGET_HOST || "127.0.0.1";
  return { url, hostHeader };
}

function withHostHeader(headers: HeadersInit | undefined, hostHeader: string): Record<string, string> {
  const out: Record<string, string> = {};
  new Headers(headers).forEach((value, key) => {
    out[key] = value;
  });
  out.Host = hostHeader;
  return out;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function normalizeBaseUrl(host: string): string {
  const withProtocol = /^https?:\/\//i.test(host) ? host : `https://${host}`;
  return withProtocol.replace(/\/+$/, "");
}

function originBaseUrl(host: string): string {
  return new URL(host).origin;
}

function serviceHostOption(
  options: QoniOptions,
  service: Exclude<QoniService, "qoni">,
): string | undefined {
  if (service === "genauth") {
    return options.genauthHost;
  }
  if (service === "gumem") {
    return options.gumemHost;
  }
  return options.webAgentHost;
}

function normalizeRuntimeConfig(payload: unknown): ResolvedRuntimeConfig {
  const data = envelopeData(payload);
  if (!isJsonObject(data)) return {};
  const config = data as QoniRuntimeConfig;
  return {
    eakBaseUrl: runtimeServiceUrl(config, "eak", "eakBaseUrl"),
    genauthBaseUrl: runtimeServiceUrl(config, "genauth", "genauthBaseUrl"),
    gumemBaseUrl: runtimeServiceUrl(config, "gumem", "gumemBaseUrl"),
    webAgentBaseUrl:
      runtimeServiceUrl(config, "webAgent", "webAgentBaseUrl") ??
      runtimeServiceUrl(config, "webagent", "webAgentBaseUrl"),
  };
}

function envelopeData(payload: unknown): unknown {
  if (isJsonObject(payload) && "data" in payload) return payload.data;
  return payload;
}

function runtimeServiceUrl(
  config: QoniRuntimeConfig,
  service: keyof NonNullable<QoniRuntimeConfig["services"]>,
  topLevelKey: keyof QoniRuntimeConfig,
): string | undefined {
  const topLevel = config[topLevelKey];
  if (typeof topLevel === "string" && topLevel.trim()) return normalizeBaseUrl(topLevel);
  const serviceValue = config.services?.[service];
  if (typeof serviceValue === "string" && serviceValue.trim()) {
    return normalizeBaseUrl(serviceValue);
  }
  if (isJsonObject(serviceValue)) {
    for (const key of ["baseUrl", "url", "host"] as const) {
      const value = serviceValue[key];
      if (typeof value === "string" && value.trim()) return normalizeBaseUrl(value);
    }
  }
  return undefined;
}

function toRecord(value: object): JsonObject {
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) out[key] = item;
  }
  return out;
}

function normalizeDelegateTokenInput(input: DelegateTokenInput): JsonObject {
  const body = toRecord(input);
  if (!body.userId && isJsonObject(input.user) && typeof input.user.id === "string") {
    body.userId = input.user.id;
  }
  // Silent delegation acts for a specific end user, so a user id is required.
  // Fail locally with a precise message instead of letting an un-attributed
  // request reach the gateway and come back as a confusing signing/auth error
  // (interactive mode is exempt — the Qoni Console resolves the login during
  // authorization). The TS overloads already enforce this; the guard is for
  // plain-JS callers where types don't apply.
  if (input.mode !== "interactive" && !body.userId) {
    throw new QoniValidationError(
      "delegateToken: silent mode requires a user — pass `user: { id: <genauthUserId> }` " +
        "(or the deprecated top-level `userId`). Interactive mode (`mode: \"interactive\"`) " +
        "does not need one.",
    );
  }
  body.agent = input.agent ?? "sdk";
  body.scopes = resolveDelegationScopes(input.scopes, input.products);
  delete body.products;
  return body;
}

/**
 * Merge explicit scopes with the `products` sugar expansion, pre-validating
 * scope formats locally so typos fail before any request is made.
 */
function resolveDelegationScopes(
  scopes: readonly string[] | undefined,
  products: readonly string[] | undefined,
): string[] {
  const resolved = new Set<string>();
  for (const product of products ?? []) {
    const expansion = QoniProductScopes[product as QoniProduct];
    if (!expansion) {
      throw new QoniValidationError(
        `delegateToken: unknown product "${product}" — expected one of ` +
          `${Object.keys(QoniProductScopes).join(", ")}`,
      );
    }
    for (const scope of expansion) resolved.add(scope);
  }
  for (const scope of scopes ?? []) {
    validateScopeFormat(scope);
    resolved.add(scope);
  }
  if (resolved.size === 0) {
    throw new QoniValidationError(
      "delegateToken requires at least one scope — pass scopes (e.g. " +
        '["webagent.do_anything:manage"]) and/or products (e.g. ["doAnything"])',
    );
  }
  return [...resolved];
}

function validateScopeFormat(scope: string): void {
  if (KNOWN_SCOPES.includes(scope)) return;
  // A known scope minus its service prefix — the most common mistake.
  const prefixed = KNOWN_SCOPES.find((known) => known.endsWith(`.${scope}`) || known === `webagent.${scope}`);
  if (prefixed) {
    throw new QoniValidationError(
      `delegateToken: scope "${scope}" is missing its service prefix — write "${prefixed}"`,
    );
  }
  // Unknown scopes are allowed if well-formed (the server is the authority on
  // newly added scopes); malformed ones fail locally with the correct form.
  if (!/^[a-z0-9_]+(\.[a-z0-9_]+)+:[a-z0-9_]+$/.test(scope)) {
    throw new QoniValidationError(
      `delegateToken: malformed scope "${scope}" — scopes look like ` +
        '"<service>.<resource>:<action>", e.g. "webagent.do_anything:manage"',
    );
  }
}

function errorEnvelopeStatus(payload: unknown): number | undefined {
  if (!isJsonObject(payload)) return undefined;
  const statusCode = payload.statusCode;
  if (typeof statusCode !== "number" || statusCode < 400) return undefined;
  if ("data" in payload && payload.data !== undefined) return undefined;
  return statusCode;
}

function decodeJwtPayload(token: string): JsonObject {
  const [, payload] = token.split(".");
  if (!payload) throw new Error("token is not a JWT");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JsonObject;
}

function safeDecodeJwtPayload(token: string): JsonObject | undefined {
  try {
    return decodeJwtPayload(token);
  } catch {
    return undefined;
  }
}

function isQoniDelegationToken(token: string): boolean {
  return safeDecodeJwtPayload(token)?.token_type === "eak_delegation_token";
}

function readAccessToken(payload: unknown): string | undefined {
  if (!isJsonObject(payload)) return undefined;
  for (const key of ["accessToken", "access_token", "token"]) {
    const token = payload[key];
    if (typeof token === "string" && token.trim()) return token;
  }
  return undefined;
}

function readExpiresIn(payload: unknown): number | undefined {
  if (!isJsonObject(payload)) return undefined;
  const expiresIn = payload.expiresIn ?? payload.expires_in;
  if (typeof expiresIn === "number" && Number.isFinite(expiresIn)) return expiresIn;
  if (typeof expiresIn === "string" && expiresIn.trim()) {
    const parsed = Number(expiresIn);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readString(payload: unknown, key: string): string | undefined {
  if (!isJsonObject(payload)) return undefined;
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function requiredWebAgentTenantId(token: string): string {
  const payload = decodeJwtPayload(token);
  const productResource = payload.product_resource;
  if (isJsonObject(productResource) && productResource.type === "webagent_tenant") {
    const id = productResource.id;
    if (typeof id === "string" && id.trim()) return id;
  }
  const resourceBindingTenantId = nestedString(payload, [
    "resource_bindings",
    "webagent",
    "tenant_id",
  ]);
  if (resourceBindingTenantId) return resourceBindingTenantId;
  const tenantId = payload.webagent_tenant_id;
  if (typeof tenantId === "string" && tenantId.trim()) return tenantId;
  const projectId = payload.webagent_project_id;
  if (typeof projectId === "string" && projectId.trim()) return projectId;
  throw new Error("token is missing WebAgent tenant binding");
}

function nestedString(value: unknown, path: readonly string[]): string | undefined {
  let cursor = value;
  for (const segment of path) {
    if (!isJsonObject(cursor)) return undefined;
    cursor = cursor[segment];
  }
  return typeof cursor === "string" && cursor.trim() ? cursor : undefined;
}

// WebAgent run events arrive as `id: <n>\ndata: <envelope>` with no SSE
// `event:` line; the type is the envelope's `type` field. Lift it to
// `event.event` so callers can match QoniEventTypes. Non-record / typed events
// pass through unchanged.
function normalizeWebAgentEvent<T>(event: QoniEvent<T>): QoniEvent<T> {
  if (event.event) return event;
  const data = event.data as { type?: unknown } | null | undefined;
  if (data && typeof data === "object" && typeof data.type === "string") {
    return { ...event, event: data.type };
  }
  return event;
}

// Retry on connection drops (ECONNRESET, fetch network errors) and transient
// 5xx / 408 / 429. Never retry on user abort or terminal 4xx (auth / not found).
function isRetryableStreamError(err: unknown): boolean {
  if (err && typeof err === "object") {
    const e = err as { name?: string; retryable?: boolean; status?: number };
    if (e.name === "AbortError") return false;
    if (typeof e.retryable === "boolean") return e.retryable;
    if (typeof e.status === "number") {
      return e.status >= 500 || e.status === 408 || e.status === 429;
    }
  }
  return true; // unknown / network read error — reconnect
}

// 401/403 — retryable only when a token refresh is available (the next attempt
// re-resolves the product token); never retryable on its own.
function isAuthError(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status;
  return status === 401 || status === 403;
}

function sseBackoffMs(attempt: number): number {
  const base = Math.min(500 * 2 ** (attempt - 1), 10_000);
  return base + Math.floor(Math.random() * 250); // jitter
}

function sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The operation was aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(new DOMException("The operation was aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// Pull the first user id out of a genauth.users.list response, tolerating the
// various envelope shapes (array, { list }, { users }, { data: [...] }) and id
// field names the userpool may use.
function firstBoundUserId(data: unknown): string | undefined {
  const arrays = [data, (data as { list?: unknown })?.list, (data as { users?: unknown })?.users,
    (data as { data?: unknown })?.data, (data as { items?: unknown })?.items];
  for (const candidate of arrays) {
    if (Array.isArray(candidate) && candidate.length) {
      const u = candidate[0] as Record<string, unknown>;
      for (const key of ["userId", "id", "user_id", "sub", "username"]) {
        const v = u?.[key];
        if (typeof v === "string" && v) return v;
      }
    }
  }
  return undefined;
}

function parseSSEEvent<T>(chunk: string): QoniEvent<T> | null {
  const lines = chunk.split(/\r?\n/);
  let id: string | undefined;
  let event: string | undefined;
  const data: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    const index = line.indexOf(":");
    const field = index >= 0 ? line.slice(0, index) : line;
    const value = index >= 0 ? line.slice(index + 1).replace(/^ /, "") : "";
    if (field === "id") id = value;
    if (field === "event") event = value;
    if (field === "data") data.push(value);
  }
  if (!id && !event && !data.length) return null;
  return { id, event, data: parseEventData<T>(data.join("\n")) };
}

function parseEventData<T>(raw: string): T {
  if (!raw) return undefined as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as T;
  }
}

function requiredRuntimeToken(token: string | undefined): string {
  if (token && token.trim()) return token;
  throw new QoniDelegationRequiredError(
    "Product capability calls require an explicit token in the token field",
  );
}

function normalizeDelegateAgentTokenResponse<T extends DelegateAgentResponse>(
  response: QoniResponse<T>,
): QoniResponse<T> {
  if (!isJsonObject(response.data)) return response;
  const grantState =
    typeof response.data.grantState === "string"
      ? response.data.grantState
      : typeof response.data.state === "string"
        ? response.data.state
        : typeof response.data.grantId === "string"
          ? response.data.grantId
          : undefined;
  if (typeof response.data.authorizationUrl === "string" && grantState) {
    return {
      ...response,
      data: {
        ...response.data,
        grantState,
        state: grantState,
      } as T,
    };
  }
  const token =
    typeof response.data.delegateAgentToken === "string"
      ? response.data.delegateAgentToken
      : typeof response.data.delegationToken === "string"
        ? response.data.delegationToken
        : typeof response.data.token === "string"
          ? response.data.token
          : undefined;
  if (!token) return response;
  return {
    ...response,
    data: {
      ...response.data,
      token,
      delegateAgentToken: token,
    } as T,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isConnectTimeoutError(error: unknown): boolean {
  const cause = errorCause(error);
  return (
    errorCode(cause) === "UND_ERR_CONNECT_TIMEOUT" ||
    errorName(cause) === "ConnectTimeoutError"
  );
}

function isFetchNetworkError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const message = error.message.toLowerCase();
  return message.includes("fetch failed") || message.includes("network");
}

function errorCause(error: unknown): unknown {
  return error && typeof error === "object" ? (error as { cause?: unknown }).cause : undefined;
}

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object" && typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : undefined;
}

function errorName(error: unknown): string | undefined {
  return error && typeof error === "object" && typeof (error as { name?: unknown }).name === "string"
    ? (error as { name: string }).name
    : undefined;
}
