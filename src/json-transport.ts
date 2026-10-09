import { memoryRunLifecycle } from "./memory-run-lifecycle";
import { QoniUpstreamError, errorFromPayload } from "./errors";
import { isJsonObject, type JsonObject, type QoniResponse, type QoniService, type QoniHttpMethod, type RequestPayload } from "./types";

// 从 Qoni 私有 JSON 请求抽取；未在 package index 导出任何 transport 能力。
type JsonOptions = RequestPayload & { method: QoniHttpMethod; token?: string; service: QoniService; signed?: boolean };
type JsonExecutor = <T>(input: URL, init: RequestInit, consume: (response: Response, signal: AbortSignal) => Promise<T>, signal?: AbortSignal) => Promise<T>;

export async function performJsonRequest<T>(
  baseUrl: string, pathname: string, options: JsonOptions, execute: JsonExecutor, strict = false,
): Promise<QoniResponse<T>> {
  const { response, payload } = await execute(
    urlWithBasePath(baseUrl, pathname, options.query),
    { method: options.method, headers: requestHeaders(options), body: requestBody(options.body) },
    async (response, signal) => ({ response, payload: await readJson(response, signal) }),
    options.signal,
  );
  if (!response.ok) {
    options[memoryRunLifecycle]?.onRejected(response.status);
    throw errorFromPayload(response.status, payload, `Qoni request failed with HTTP ${response.status}`);
  }
  const envelopeStatus = errorEnvelopeStatus(payload);
  if (envelopeStatus !== undefined) {
    options[memoryRunLifecycle]?.onRejected(response.status);
    throw errorFromPayload(envelopeStatus, payload, `Qoni request failed with statusCode ${envelopeStatus}`);
  }
  if (strict) validateTaskEnvelope(payload);
  return normalizeResponse<T>(payload, options.service);
}

function validateTaskEnvelope(payload: unknown): void {
  if (!isJsonObject(payload)) throw new QoniUpstreamError("Qoni task response is not a JSON object");
  for (const key of ["code", "statusCode"] as const) {
    const code = payload[key];
    if (code === undefined) continue;
    if (typeof code !== "number" || !Number.isInteger(code) || (code !== 0 && (code < 200 || code >= 300))) {
      if (typeof code === "number" && code >= 400 && code <= 599) throw errorFromPayload(code, payload, "Qoni task request failed");
      throw new QoniUpstreamError("Qoni task response has an unknown envelope");
    }
  }
  if ("meta" in payload && !isJsonObject(payload.meta)) throw new QoniUpstreamError("Qoni task response has invalid metadata");
}

export function requestHeaders(
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


export function requestBody(body: RequestPayload["body"]): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (isBodyInit(body)) return body;
  return JSON.stringify(body);
}


export function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof ArrayBuffer ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams
  );
}


export async function readBody(response: Response, signal: AbortSignal): Promise<Uint8Array> {
  if (!response.body) {
    signal.throwIfAborted();
    return new Uint8Array();
  }
  const reader = response.body.getReader();
  const onAbort = () => { void reader.cancel(signal.reason).catch(() => undefined); };
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      chunks.push(value);
      size += value.byteLength;
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes;
  } finally {
    signal.removeEventListener("abort", onAbort);
    void reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}


export async function readJson(response: Response, signal: AbortSignal): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  const body = new TextDecoder().decode(await readBody(response, signal));
  try {
    if (contentType.includes("ndjson") || contentType.includes("jsonl")) {
      if (!body.trim()) return [];
      return body
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));
    }
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}


export function normalizeResponse<T>(payload: unknown, _service: QoniService): QoniResponse<T> {
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


export function topLevelMeta(payload: JsonObject): JsonObject {
  const meta: JsonObject = {};
  for (const key of ["requestId", "traceId", "auditId"]) {
    if (typeof payload[key] === "string") meta[key] = payload[key];
  }
  return meta;
}


export function urlWithQuery(baseUrl: string, pathname: string, query?: JsonObject): URL {
  const url = new URL(normalizePath(pathname), baseUrl);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url;
}


export function urlWithBasePath(baseUrl: string, pathname: string, query?: JsonObject): URL {
  const base = new URL(baseUrl);
  const basePath = base.pathname === "/" ? "" : base.pathname.replace(/\/+$/, "");
  const normalizedPath = normalizePath(pathname);
  const fullPath =
    basePath && (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`))
      ? normalizedPath
      : `${basePath}${normalizedPath}`;
  return urlWithQuery(base.origin, fullPath, query);
}


export function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}


export function errorEnvelopeStatus(payload: unknown): number | undefined {
  if (!isJsonObject(payload)) return undefined;
  const statusCode = payload.statusCode;
  if (typeof statusCode !== "number" || statusCode < 400) return undefined;
  if ("data" in payload && payload.data !== undefined) return undefined;
  return statusCode;
}


export function isConnectTimeoutError(error: unknown): boolean {
  const cause = errorCause(error);
  return (
    errorCode(cause) === "UND_ERR_CONNECT_TIMEOUT" ||
    errorName(cause) === "ConnectTimeoutError"
  );
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

