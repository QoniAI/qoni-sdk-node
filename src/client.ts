import { memoryRunLifecycle } from "./memory-run-lifecycle";
import { performJsonRequest, readBody, readJson, urlWithBasePath, normalizePath, isConnectTimeoutError } from "./json-transport";
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

const DEFAULT_QONI_HOST = "https://dashboard.qoni.ai";

export class Qoni {
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly sseMaxRetries: number;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly host: string;
  private runtimeConfigPromise?: Promise<ResolvedRuntimeConfig>;
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
      delegateTokenFor: (input) => this.delegateToken(input),
      signedPost: (pathname, body, signal) => this.signedPost(pathname, body, signal),
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
    const runtimeToken = await this.productTokenFor("gumem", token, payload.requiredScopes, payload.signal);
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
    payload.signal?.throwIfAborted();
    const runtimeToken = await this.productTokenFor("webagent", token, payload.requiredScopes, payload.signal);
    payload.signal?.throwIfAborted();
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
    payload.signal?.throwIfAborted();
    const runtimeToken = await this.productTokenFor("webagent", token, payload.requiredScopes);
    payload.signal?.throwIfAborted();
    const baseUrl = await this.baseUrlFor("webagent");
    return this.fetchWithTimeout(
      urlWithBasePath(baseUrl, this.webAgentPath(runtimeToken, path), payload.query),
      {
        method: "GET",
        headers: {
          accept: "*/*",
          authorization: `Bearer ${runtimeToken}`,
          ...(payload.headers || {}),
        },
      },
      async (response, signal) => {
        if (!response.ok) {
          throw errorFromPayload(
            response.status,
            await readJson(response, signal),
            `Qoni request failed with HTTP ${response.status}`,
          );
        }
        return {
          bytes: await readBody(response, signal),
          mime: response.headers.get("content-type") || "application/octet-stream",
        };
      },
      payload.signal,
    );
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

  private async signedPost<T>(pathname: string, body: object, signal?: AbortSignal): Promise<QoniResponse<T>> {
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
      signal,
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
    return performJsonRequest<T>(baseUrl, pathname, options,
      (url, init, consume, signal) => this.fetchWithTimeout(url, init, consume, signal, {
        beforeFetch: options[memoryRunLifecycle]?.onDispatch,
      }));
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
    let cleanup: (() => void) | undefined;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    const onAbort = () => { void reader?.cancel(options.signal?.reason).catch(() => undefined); };
    const decoder = new TextDecoder();
    let buffer = "";
    try {
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
        async (response, signal) => {
          if (!response.ok) {
            throw errorFromPayload(
              response.status,
              await readJson(response, signal),
              `Qoni stream failed with HTTP ${response.status}`,
            );
          }
          return response;
        },
        options.signal,
        { streamCleanup: (dispose) => { cleanup = dispose; } },
      );
      if (!response.body) {
        throw errorFromPayload(502, undefined, "Qoni stream response has no body");
      }

      reader = response.body.getReader();
      options.signal?.addEventListener("abort", onAbort, { once: true });
      while (true) {
        // Belt and braces: even if abort → reader rejection plumbing fails,
        // notice the aborted signal at the next delivered chunk/heartbeat.
        options.signal?.throwIfAborted();
        const { done, value } = await reader.read();
        options.signal?.throwIfAborted();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split(/\r?\n\r?\n/);
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          options.signal?.throwIfAborted();
          const event = parseSSEEvent<T>(chunk);
          if (event) yield event;
        }
      }
      const finalEvent = parseSSEEvent<T>(buffer);
      if (finalEvent) yield finalEvent;
    } finally {
      cleanup?.();
      options.signal?.removeEventListener("abort", onAbort);
      // `break`ing out of `for await` runs this block without ever aborting the
      // signal, so the abort path above never fires. Releasing the lock alone
      // leaves the response body open and its socket checked out of the pool —
      // enough leaked SSE streams and every later request to the same origin
      // queues until it times out. Cancel the body first; the lock goes with it.
      void reader?.cancel().catch(() => undefined);
      try {
        reader?.releaseLock();
      } catch {
        // Already released by cancel() — nothing to do.
      }
    }
  }

  private async fetchWithTimeout<T>(
    input: URL,
    init: RequestInit,
    consume: (response: Response, signal: AbortSignal) => Promise<T>,
    signal?: AbortSignal,
    opts?: { streamCleanup?: (dispose: () => void) => void; beforeFetch?: () => void },
  ): Promise<T> {
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
    let response: Response | undefined;
    try {
      response = await new Promise<Response>((resolve, reject) => {
        const onAbort = () => reject(controller.signal.reason);
        controller.signal.addEventListener("abort", onAbort, { once: true });
        Promise.resolve().then(() => {
          controller.signal.throwIfAborted();
          opts?.beforeFetch?.();
          return this.fetchImpl(resolved.url, { ...requestInit, signal: controller.signal });
        }).then((response) => {
          if (controller.signal.aborted) {
            void response.body?.cancel(controller.signal.reason).catch(() => undefined);
            reject(controller.signal.reason);
          } else {
            resolve(response);
          }
        }, reject).finally(() => controller.signal.removeEventListener("abort", onAbort));
      });
      const result = await consume(response, controller.signal);
      controller.signal.throwIfAborted();
      return result;
    } catch (error) {
      void response?.body?.cancel().catch(() => undefined);
      if (signal?.aborted) throw signal.reason;
      if (didTimeout || isConnectTimeoutError(error)) {
        throw timeoutError(error);
      }
      if (isFetchNetworkError(error)) throw networkError(error);
      throw error;
    } finally {
      clearTimeout(timeout);
      const cleanup = () => signal?.removeEventListener("abort", abortFromSignal);
      if (opts?.streamCleanup) opts.streamCleanup(cleanup);
      else cleanup();
    }
  }

  private async baseUrlFor(service: QoniService): Promise<string> {
    const explicit = this.explicitBaseUrlFor(service);
    if (explicit) return explicit;
    // AK/SK signatures are scoped to the configured control-plane endpoint.
    // Keep signed Qoni calls on that trusted boundary: following a cross-origin
    // runtime URL can strip Authorization on redirect or disclose credentials.
    // Resolved before the discovery fetch below, so a Qoni call never depends
    // on a document it does not read — otherwise an unavailable runtime-config
    // takes down every Qoni request with it.
    if (service === "qoni") return this.host;
    const runtime = await this.runtimeConfig();
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
    const { response, payload } = await this.fetchWithTimeout(
      urlWithBasePath(this.host, pathname),
      {
        method: "GET",
        headers: {
          accept: "application/json",
          ...headers,
        },
      },
      async (response, signal) => ({ response, payload: await readJson(response, signal) }),
    );
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
    signal?: AbortSignal,
  ): Promise<string> {
    signal?.throwIfAborted();
    const runtimeToken = requiredRuntimeToken(token);
    if (!isQoniDelegationToken(runtimeToken)) return runtimeToken;

    // Every SDK operation must re-enter GenAuth's policy check. A cached
    // product token can outlive a change to the access key's allowed scopes.
    const scopes = [...(requiredScopes || [])].sort();

    const response = await this.signedPost<unknown>("/api/v3/eak/token-exchange", {
      subjectToken: runtimeToken,
      resource: service === "gumem" ? "gumem" : "webagent",
      scopes,
    }, signal);
    signal?.throwIfAborted();
    const payload = response.data;
    const accessToken = readAccessToken(payload);
    if (!accessToken) {
      throw errorFromPayload(
        502,
        payload,
        "Qoni product token exchange response did not include an access token",
      );
    }

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
  if (input.mode !== undefined && input.mode !== "silent" && input.mode !== "interactive") {
    throw new QoniValidationError('delegateToken: mode must be "silent" or "interactive"');
  }
  const body = toRecord(input);
  if (input.agentId !== undefined && (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).test(input.agentId) || input.agent !== undefined || input.agentKey !== undefined)) {
    throw new QoniValidationError('delegateToken: formal agentId must be a UUID and cannot be combined with an audit label');
  }
  if (input.deniedScopes !== undefined) {
    throw new QoniValidationError(
      "delegateToken: deniedScopes is not supported by the delegation service. " +
        "Do not rely on this field to prevent mailbox or browser actions.",
    );
  }
  if (input.agent !== undefined && input.agentKey !== undefined && input.agent !== input.agentKey) {
    throw new QoniValidationError("delegateToken: agent and agentKey must identify the same Agent");
  }
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
        "(or the top-level `userId`). Interactive mode (`mode: \"interactive\"`) " +
        "does not need one.",
    );
  }
  if (input.agentId === undefined) body.agent = input.agent ?? input.agentKey ?? "sdk";
  delete body.agentKey;
  if (input.expiresIn !== undefined) body.expiresIn = delegationDurationSeconds(input.expiresIn);
  if (input.scopes !== undefined && (!Array.isArray(input.scopes) || input.scopes.some(scope => typeof scope !== "string"))) {
    throw new QoniValidationError("delegateToken: scopes must be an array of strings");
  }
  if (input.scopes?.includes("*")) {
    if (input.scopes.length !== 1 || typeof input.agentId !== "string" || input.mode === "interactive" || input.products !== undefined) {
      throw new QoniValidationError('delegateToken: ["*"] requires a formal agentId in silent mode and cannot be mixed with scopes or products');
    }
    // The server resolves current approved authority; the SDK never expands or caches it.
    body.scopes = ["*"];
  } else {
    body.scopes = resolveDelegationScopes(input.scopes, input.products);
  }
  if (input.agentId === undefined && (body.scopes as string[]).some(scope => scope.startsWith('agent.mail:'))) throw new QoniValidationError('delegateToken: personal mailbox scopes require a verified formal agentId');
  delete body.products;
  if (input.mode === "interactive") {
    delete body.user;
    delete body.userId;
  }
  return body;
}

function delegationDurationSeconds(value: string | number): number {
  let seconds = value;
  if (typeof value === "string") {
    const duration = /^(\d+)(s|m|h|d)?$/.exec(value);
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    seconds = duration ? Number(duration[1]) * units[duration[2] ?? "s"] : NaN;
  }
  if (typeof seconds !== "number" || !Number.isInteger(seconds) || seconds < 60 || seconds > 86400) {
    throw new QoniValidationError(
      'delegateToken: expiresIn must be 60–86400 integer seconds or a whole-number duration such as "15m"',
    );
  }
  return seconds;
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
  if (scope.startsWith("mailbox.") || scope === "web.search" || scope === "web.extract") {
    throw new QoniValidationError(
      `delegateToken: legacy action scope "${scope}" has no enforced mapping in this delegation service. ` +
        "It will not be expanded into broader product permissions.",
    );
  }
  if (KNOWN_SCOPES.includes(scope)) return;
  // A known scope minus its service prefix — the most common mistake. Name
  // every match: "profile:read" fits both gumem.profile:read and user.profile:read.
  const prefixed = KNOWN_SCOPES.filter((known) => known.endsWith(`.${scope}`));
  if (prefixed.length > 0) {
    throw new QoniValidationError(
      `delegateToken: scope "${scope}" is missing its service prefix — write ` +
        prefixed.map((known) => `"${known}"`).join(" or "),
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
    if (e.status === 408) return true;
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


function isFetchNetworkError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const message = error.message.toLowerCase();
  return message.includes("fetch failed") || message.includes("network");
}
