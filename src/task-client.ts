import { createHash } from "node:crypto";
import { createGumemNamespace } from "./gumem";
import { performJsonRequest, isConnectTimeoutError } from "./json-transport";
import {
  QoniAuthError, QoniError, QoniTimeoutError, QoniTokenExpiredError, QoniUpstreamError, QoniValidationError,
  QoniPermissionDeniedError, QoniDelegationRequiredError, QoniRateLimitError,
} from "./errors";
import { isJsonObject, type QoniResponse, type QoniMeta, type JsonObject, type RequestPayload } from "./types";

export interface TaskAccessToken {
  readonly accessToken: string;
  /** Unix 毫秒；取到时必须是未来的有限值。 */
  readonly expiresAt: number;
}
export type TaskTokenProvider = (
  product: "gumem", requiredScopes: readonly string[], runId: string, signal: AbortSignal,
) => Promise<TaskAccessToken>;
export interface TaskClientOptions {
  readonly productHosts: { readonly gumem: string };
  readonly runId: string;
  readonly tokenProvider: TaskTokenProvider;
  readonly fetch?: typeof fetch;
  /** provider + HTTP + response body 的总期限，默认 30_000ms。 */
  readonly timeoutMs?: number;
}
export interface TaskRequestOptions { readonly signal?: AbortSignal }
export interface TaskMemoryMessage {
  readonly id: string;
  /** 沿用 GUM Message.role 的字符串 schema，无角色枚举。 */
  readonly role: string;
  readonly content: string;
}
export interface TaskAddMessagesInput extends TaskRequestOptions { readonly messages: readonly TaskMemoryMessage[] }
// TS 的结构赋值允许已有变量带额外字段；公开函数同样收窄这些变量。
type OnlyKeys<Input, Shape> = Input & Record<Exclude<keyof Input, keyof Shape>, never>;
type TaskConfiguration<Input extends TaskClientOptions> = OnlyKeys<Input, TaskClientOptions> & {
  productHosts: OnlyKeys<Input["productHosts"], TaskClientOptions["productHosts"]>;
};
type TaskMessageInput<Input extends TaskAddMessagesInput> = OnlyKeys<Input, TaskAddMessagesInput> & {
  messages: readonly OnlyKeys<Input["messages"][number], TaskMemoryMessage>[];
};
export interface TaskSessionData {
  readonly session_id: string;
  readonly title?: string | null;
  readonly created_at?: string;
}
export interface TaskMessagesData {
  readonly request_id: string;
  readonly message_count: number;
}
export interface TaskClient {
  readonly memory: {
    readonly createSession: <Input extends TaskRequestOptions = TaskRequestOptions>(options?: OnlyKeys<Input, TaskRequestOptions>) => Promise<QoniResponse<TaskSessionData>>;
    readonly addMessages: <Input extends TaskAddMessagesInput>(input: TaskMessageInput<Input>) => Promise<QoniResponse<TaskMessagesData>>;
  };
}

/** 既有 Pi 宿主的内部入口；方法限制不替代 GUM 的资源端鉴权。 */
export function createTaskClient<Input extends TaskClientOptions>(options: TaskConfiguration<Input>): TaskClient {
  if (arguments.length !== 1) throw new QoniValidationError("Task createTaskClient 必须只传服务配置");
  const settings = allowedRecord(options, ["productHosts", "runId", "tokenProvider", "fetch", "timeoutMs"]);
  const hosts = allowedRecord(settings.productHosts, ["gumem"]);
  const baseUrl = taskHost(hosts.gumem);
  const rawRunId = settings.runId;
  // 实际 GUM ThreadRepository 的 thread_id 为 String(64)，不截断可信 run ID。
  if (!validId(rawRunId) || [...rawRunId].length > 55 || /[\\/]/.test(rawRunId)) {
    throw new QoniValidationError("Task runId 必须是 1–55 字符的稳定 ID，不能含路径分隔符");
  }
  const runId: string = rawRunId;
  const sessionId = `qoni-run-${runId}`;
  const tokenProvider = settings.tokenProvider as TaskTokenProvider;
  if (typeof tokenProvider !== "function") throw new QoniValidationError("Task tokenProvider 必须是函数");
  const fetchImpl = (settings.fetch === undefined ? globalThis.fetch : settings.fetch) as typeof fetch;
  if (typeof fetchImpl !== "function") throw new QoniValidationError("Task fetch 必须是函数");
  const timeoutMs = settings.timeoutMs === undefined ? 30_000 : settings.timeoutMs;
  if (typeof timeoutMs !== "number" || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new QoniValidationError("Task timeoutMs 必须是有效的正整数毫秒");
  }
  // 只保留已提交 ID 的内容摘要（包括尚未发出的批次），正文和许可不挂到返回对象上。
  const messageBindings = new Map<string, string>();

  async function request<T>(operation: "create" | "add", messages: JsonObject[] | undefined, signal?: AbortSignal): Promise<QoniResponse<T>> {
    return withDeadline(timeoutMs as number, signal, async (deadlineSignal) => {
      let accessToken: string | undefined;
      try {
        const namespace = createGumemNamespace({
          gumemJson: async <R>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, _token?: string, payload: RequestPayload = {}) => {
            // scope/path/body 都由原 namespace 产生；无调用方 raw 入口。
            const scopes = Object.freeze([...(payload.requiredScopes ?? [])]);
            let permission: unknown;
            try {
              permission = await abortable(deadlineSignal, () => tokenProvider("gumem", scopes, runId, deadlineSignal));
            } catch {
              deadlineSignal.throwIfAborted();
              throw new QoniAuthError("Qoni task permission provider rejected the request");
            }
            deadlineSignal.throwIfAborted();
            const grant = allowedRecord(permission, ["accessToken", "expiresAt"]);
            if (typeof grant.accessToken !== "string" || !/^[a-zA-Z0-9\-._~+/]+=*$/.test(grant.accessToken)) {
              throw new QoniAuthError("Qoni task permission provider returned an invalid token");
            }
            if (typeof grant.expiresAt !== "number" || !Number.isFinite(grant.expiresAt) || grant.expiresAt <= Date.now()) {
              throw new QoniTokenExpiredError("Qoni task permission has expired or invalid expiresAt");
            }
            accessToken = grant.accessToken;
            // 请求 ID 是幂等上下文，既不是授权证明，也不覆盖重叠批次。
            const requestId = `qoni-task-${digest(["task-memory-v1", runId, sessionId, method, path, payload.body])}`;
            return performJsonRequest<R>(baseUrl, path, {
              ...payload, method, token: accessToken, service: "gumem", signal: deadlineSignal,
              headers: { "X-Request-ID": requestId },
            }, async (url, init, consume) => {
              const response = await abortable(deadlineSignal, () => fetchImpl(url, { ...init, redirect: "error", signal: deadlineSignal }),
                late => { void late.body?.cancel().catch(() => undefined); });
              try {
                return await abortable(deadlineSignal, () => consume(response, deadlineSignal));
              } finally {
                if (deadlineSignal.aborted) void response.body?.cancel().catch(() => undefined);
              }
            }, true);
          },
        });
        const response = operation === "create"
          // 当前 schema 要求 user_id；空值由原 delegated_user_id 使用已验 OBO 用户。
          ? await namespace.createSession<unknown>({ sessionId, userId: "" })
          : await namespace.addMessages<unknown>({ sessionId, messages: messages! });
        deadlineSignal.throwIfAborted();
        const data = operation === "create" ? sessionData(response.data, sessionId, accessToken!) : messagesData(response.data, accessToken!);
        return { data: data as T, meta: safeMeta(response.meta, accessToken!) };
      } catch (error) {
        deadlineSignal.throwIfAborted();
        // 原始 provider/fetch/后端 body/cause 可能带 token 或 SQL 参数，均不外传。
        throw safeError(error, accessToken);
      }
    });
  }

  return Object.freeze({ memory: Object.freeze({
    createSession: async (...args: [TaskRequestOptions?]) => {
      if (args.length > 1) throw new QoniValidationError("Task createSession 不接受额外参数");
      const input = allowedRecord(args[0] === undefined ? {} : args[0], ["signal"]);
      return request<TaskSessionData>("create", undefined, taskSignal(input.signal));
    },
    addMessages: async (...args: [TaskAddMessagesInput]) => {
      if (args.length !== 1) throw new QoniValidationError("Task addMessages 必须只传消息批次");
      const input = allowedRecord(args[0], ["messages", "signal"]);
      const signal = taskSignal(input.signal);
      if (signal?.aborted) throw abortedError();
      const messages = snapshotMessages(input.messages, messageBindings);
      return request<TaskMessagesData>("add", messages, signal);
    },
  }) });
}

function allowedRecord(value: unknown, keys: readonly string[]): JsonObject {
  if (!isJsonObject(value) || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    throw new QoniValidationError("Task 参数必须是普通对象");
  }
  const out: JsonObject = {};
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    if (typeof key !== "string" || !keys.includes(key) || !("value" in descriptor)) {
      throw new QoniValidationError("Task 参数含未知、保留或非数据属性");
    }
    out[key] = descriptor.value;
  }
  return out;
}

function validId(value: unknown): value is string {
  if (typeof value !== "string" || !value.length || value.trim() !== value || /[\x00-\x1f\x7f-\x9f]/.test(value)) return false;
  try { encodeURIComponent(value); return true; } catch { return false; }
}

// Node18 兼容：不依赖 Node20 才有的 String.isWellFormed，也不替换或规整原字符串。
function wellFormed(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const unit = value.charCodeAt(i);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return false;
  }
  return true;
}

function taskHost(value: unknown): string {
  if (typeof value !== "string" || !value || value.trim() !== value || /[\s\\]/.test(value)) {
    throw new QoniValidationError("Task gumem host 必须是有效服务 URL");
  }
  let url: URL;
  try { url = new URL(/^[a-zA-Z][\w+.-]*:\/\//.test(value) || /^(?:https?|file|ftp|data):/i.test(value) ? value : `https://${value}`); }
  catch { throw new QoniValidationError("Task gumem host 必须是有效服务 URL"); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || value.includes("#") || value.includes("?") || url.pathname.startsWith("//") ||
    (url.protocol === "http:" && !["127.0.0.1", "[::1]", "localhost"].includes(url.hostname))) {
    throw new QoniValidationError("Task host 只接受无凭据/query/fragment 的 HTTPS 或 loopback HTTP");
  }
  return url.href.replace(/\/+$/, "");
}

function taskSignal(value: unknown): AbortSignal | undefined {
  if (value === undefined) return undefined;
  if (!(value instanceof AbortSignal)) throw new QoniValidationError("Task signal 必须是 AbortSignal");
  return value;
}

function snapshotMessages(value: unknown, bindings: Map<string, string>): JsonObject[] {
  if (!Array.isArray(value) || !value.length || Reflect.ownKeys(value).some(key => key !== "length" &&
    (typeof key !== "string" || !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length))) {
    throw new QoniValidationError("Task messages 必须是非空消息数组");
  }
  const entries = new Map<string, string>();
  const messages: JsonObject[] = [];
  for (let i = 0; i < value.length; i++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
    if (!descriptor || !("value" in descriptor)) throw new QoniValidationError("Task messages 不接受稀疏或 getter 数组");
    const message = allowedRecord(descriptor.value, ["id", "role", "content"]);
    if (!validId(message.id) || typeof message.role !== "string" || !message.role.trim() || !wellFormed(message.role) ||
      typeof message.content !== "string" || !wellFormed(message.content)) {
      throw new QoniValidationError("Task message 必须包含非空稳定 id/role，role/content 必须是完整 Unicode 字符串");
    }
    const fingerprint = digest([message.role, message.content]);
    if (entries.has(message.id) || (bindings.has(message.id) && bindings.get(message.id) !== fingerprint)) {
      throw new QoniValidationError("Task message id 重复或与已提交内容冲突（包括尚未发出的批次）");
    }
    entries.set(message.id, fingerprint);
    messages.push({ id: message.id, role: message.role, content: message.content });
  }
  // 全批同步校验通过即绑定；provider 拒绝/发出前超时仍已提交，坏批次不绑定。
  for (const [id, fingerprint] of entries) bindings.set(id, fingerprint);
  return messages;
}

function digest(value: unknown): string { return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex"); }
function abortedError(): DOMException { return new DOMException("Qoni task request aborted", "AbortError"); }

async function withDeadline<T>(timeoutMs: number, signal: AbortSignal | undefined, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
  if (signal?.aborted) throw abortedError();
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort(abortedError());
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try { return await abortable(controller.signal, () => work(controller.signal)); }
  catch (error) {
    if (timedOut) throw new QoniTimeoutError("Qoni task request timed out");
    if (controller.signal.aborted) throw abortedError();
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}

async function abortable<T>(signal: AbortSignal, work: () => Promise<T>, late?: (value: T) => void): Promise<T> {
  signal.throwIfAborted();
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => { signal.removeEventListener("abort", onAbort); reject(abortedError()); };
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve().then(() => { signal.throwIfAborted(); return work(); }).then(value => {
      signal.removeEventListener("abort", onAbort);
      if (signal.aborted) { late?.(value); reject(abortedError()); } else resolve(value);
    }, error => { signal.removeEventListener("abort", onAbort); reject(error); });
  });
}

function safeError(error: unknown, token?: string): QoniError {
  if (isConnectTimeoutError(error)) return new QoniTimeoutError("Qoni request timed out");
  if (!(error instanceof QoniError)) return new QoniUpstreamError("Qoni network request failed");
  const code = safeString(error.code, token);
  // 从原 typed error 投影最少元信息，保留相同类别/code/status，不保留私密 body/cause/message。
  const Type = [QoniTokenExpiredError, QoniAuthError, QoniDelegationRequiredError, QoniPermissionDeniedError,
    QoniValidationError, QoniRateLimitError, QoniTimeoutError, QoniUpstreamError].find(type => error instanceof type) ?? QoniError;
  return new Type("Qoni task request failed", {
    code, status: error.status, retryable: error.retryable,
    requestId: safeString(error.requestId, token), traceId: safeString(error.traceId, token), auditId: safeString(error.auditId, token),
  });
}

function safeString(value: unknown, token?: string): string | undefined {
  const secrets = token ? [token, encodeURIComponent(token), encodeURI(token)] : [];
  return typeof value === "string" && value.length && !secrets.some(secret => value.includes(secret)) && !/bearer\s/i.test(value) ? value : undefined;
}
function safeMeta(meta: QoniMeta, token: string): QoniMeta {
  const safe: QoniMeta = {};
  for (const key of ["requestId", "traceId", "auditId"] as const) {
    const value = safeString(meta[key], token);
    if (value) safe[key] = value;
  }
  return safe;
}
function sessionData(value: unknown, sessionId: string, token: string): TaskSessionData {
  if (!isJsonObject(value) || value.session_id !== sessionId || !safeString(sessionId, token)) throw new QoniUpstreamError("Qoni task response has an unbound Session");
  const data: { session_id: string; title?: string | null; created_at?: string } = { session_id: sessionId };
  if (value.title === null) data.title = null;
  else if (safeString(value.title, token)) data.title = value.title as string;
  if (safeString(value.created_at, token)) data.created_at = value.created_at as string;
  return data;
}
function messagesData(value: unknown, token: string): TaskMessagesData {
  if (!isJsonObject(value) || !safeString(value.request_id, token) || typeof value.message_count !== "number" ||
    !Number.isInteger(value.message_count) || value.message_count < 0) throw new QoniUpstreamError("Qoni task response has an invalid message result");
  return { request_id: value.request_id as string, message_count: value.message_count };
}
