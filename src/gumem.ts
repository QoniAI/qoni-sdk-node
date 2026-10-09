import type { QoniResponse, QoniTransport, JsonObject, RuntimeTokenInput } from "./types";
import { isJsonObject } from "./types";
import { QoniValidationError } from "./errors";
import {projectMemoryContext,validateMemoryContextInput,type MemoryContext,type MemoryContextLimits} from "./memory-context";

export interface GumemCreateSessionInput extends RuntimeTokenInput {
  userId?: string;
  sessionId?: string;
  /** @deprecated Use userId. */
  user_id?: string;
  /** @deprecated Use sessionId. */
  session_id?: string;
  title?: string;
  metadata?: JsonObject;
}

export interface GumemAddMessagesInput extends RuntimeTokenInput {
  sessionId: string;
  messages: JsonObject[];
  sync?: boolean;
  userId?: string;
  /** @deprecated Use userId. */
  user_id?: string;
}

export interface GumemRecallInput extends RuntimeTokenInput {
  signal?: AbortSignal;
  sessionId?: string;
  query?: string;
  details?: boolean;
  /** 保留后端配置键；metadataFilters / metadata_filters 会归一到嵌套过滤条件。 */
  recallConfig?: JsonObject;
  /** 嵌入 recall_config.metadata_filters；同名不同值或系统保留字段在请求前拒绝。 */
  metadataFilters?: JsonObject;
  /** @deprecated Use recallConfig. */
  recall_config?: JsonObject;
  /** @deprecated Use metadataFilters. */
  metadata_filters?: JsonObject;
}

export interface GumemRecallContextInput extends Omit<GumemRecallInput,"details">, MemoryContextLimits {
  sessionId: string;
}

export interface GumemUploadResourceInput extends RuntimeTokenInput {
  userId?: string;
  sessionId?: string;
  /** @deprecated Use userId. */
  user_id?: string;
  /** @deprecated Use sessionId. */
  session_id?: string;
  file: Blob | File;
  filename?: string;
  contentType?: string;
}

export function createGumemNamespace(transport: Pick<QoniTransport, "gumemJson">) {
  return {
    createSession: <T = unknown>(input: GumemCreateSessionInput): Promise<QoniResponse<T>> =>
      transport.gumemJson("POST", "/api/sessions", input.token, {
        body: gumemBody(omit(input, "token")),
        requiredScopes: ["gumem.memory:write"],
      }),

    addMessages: <T = unknown>(input: GumemAddMessagesInput): Promise<QoniResponse<T>> =>
      transport.gumemJson(
        "POST",
        `/api/sessions/${encodeURIComponent(input.sessionId)}/messages`,
        input.token,
        {
          body: gumemBody(omit(input, "token", "sessionId")),
          requiredScopes: ["gumem.memory:write"],
        },
      ),

    recall: async <T = unknown>(input: GumemRecallInput): Promise<QoniResponse<T>> =>
      transport.gumemJson(
        "POST",
        `/api/sessions/${encodeURIComponent(input.sessionId || "default")}/context`,
        input.token,
        {
          signal: input.signal,
          query: { query: input.query || "", details: input.details ?? false },
          body: gumemRecallBody(input),
          requiredScopes: ["gumem.memory:read"],
        },
      ),

    recallContext: async (input:GumemRecallContextInput):Promise<QoniResponse<MemoryContext>> => {
      const limits=validateMemoryContextInput(input);
      input.signal?.throwIfAborted();
      const {maxItems:_items,maxContextBytes:_bytes,...recall}=input;
      const response=await transport.gumemJson<unknown>("POST",`/api/sessions/${encodeURIComponent(input.sessionId)}/context`,input.token,{
        signal:input.signal,query:{query:input.query??"",details:true},
        body:gumemRecallBody(recall),requiredScopes:["gumem.memory:read"],
      });
      input.signal?.throwIfAborted();
      return {...response,data:projectMemoryContext(response.data,input.sessionId,limits,input.token)};
    },

    uploadResource: <T = unknown>(input: GumemUploadResourceInput): Promise<QoniResponse<T>> => {
      const form = new FormData();
      form.set("file", input.file, input.filename);
      const userId = input.userId ?? input.user_id;
      const sessionId = input.sessionId ?? input.session_id;
      if (userId) form.set("user_id", userId);
      if (sessionId) form.set("session_id", sessionId);
      if (input.contentType) form.set("content_type", input.contentType);
      return transport.gumemJson("POST", "/api/resources", input.token, {
        body: form,
        requiredScopes: ["gumem.memory:write"],
      });
    },

    actions: {
      record: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
        transport.gumemJson("POST", "/api/user/actions", input.token, {
          body: omit(input, "token"),
          requiredScopes: ["gumem.action:write"],
        }),

      recall: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
        transport.gumemJson("GET", "/api/user/actions/query", input.token, {
          query: omit(input, "token"),
          requiredScopes: ["gumem.action:read"],
        }),

      stream: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
        transport.gumemJson("GET", "/api/user/actions/stream", input.token, {
          query: omit(input, "token"),
          requiredScopes: ["gumem.action:read"],
        }),
    },
  };
}

function omit(value: object, ...keys: string[]): JsonObject {
  const skipped = new Set(keys);
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    if (!skipped.has(key) && item !== undefined) out[key] = item;
  }
  return out;
}

// 来自实际召回的身份/范围条件及有效性限制，SDK 防护不替代后端隔离校验。
const RECALL_RESERVED_FIELDS = new Set([
  "project_id", "group_id", "user_id", "thread_id", "session_id", "scope", "expired_at", "validity",
]);

function gumemRecallBody(input: GumemRecallInput): JsonObject {
  const body = omit(input, "token", "signal", "sessionId", "query", "details",
    "recallConfig", "recall_config", "metadataFilters", "metadata_filters");
  rejectRecallReservedFields(body, "recall");
  const config: JsonObject = Object.create(null);
  const filters: JsonObject = Object.create(null);
  let hasConfig = false;
  let hasFilters = false;

  for (const alias of ["recallConfig", "recall_config"] as const) {
    if (input[alias] === undefined) continue;
    hasConfig = true;
    const source = recallObject(input[alias], alias);
    rejectRecallReservedFields(source, alias);
    for (const [key, value] of Object.entries(source)) {
      if (key !== "metadataFilters" && key !== "metadata_filters" && value !== undefined) {
        mergeRecallEntry(config, key, value, alias);
      }
    }
    for (const filterAlias of ["metadataFilters", "metadata_filters"] as const) {
      if (source[filterAlias] === undefined) continue;
      hasFilters = true;
      mergeRecallFilters(filters, source[filterAlias], `${alias}.${filterAlias}`);
    }
  }
  for (const alias of ["metadataFilters", "metadata_filters"] as const) {
    if (input[alias] === undefined) continue;
    hasFilters = true;
    mergeRecallFilters(filters, input[alias], alias);
  }
  if (hasFilters) config.metadata_filters = filters;
  if (hasConfig || hasFilters) body.recall_config = config;
  return body;
}

function recallObject(value: unknown, path: string): JsonObject {
  if (!isJsonObject(value)) throw new QoniValidationError(`${path} 必须是对象`);
  return value;
}

function rejectRecallReservedFields(value: JsonObject, path: string): void {
  for (const key of Object.keys(value)) {
    const normalized = key.trim().replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
    if (RECALL_RESERVED_FIELDS.has(normalized)) {
      throw new QoniValidationError(`${path}.${key} 是系统保留字段，召回条件不能覆盖它`);
    }
  }
}

function mergeRecallFilters(target: JsonObject, value: unknown, path: string): void {
  const source = recallObject(value, path);
  rejectRecallReservedFields(source, path);
  for (const [rawKey, entry] of Object.entries(source)) {
    // 与后端 RecallConfig 的空白键归一规则一致。
    const key = rawKey.trim();
    if (!key) continue;
    if (!(typeof entry === "string" || typeof entry === "boolean" ||
      (typeof entry === "number" && Number.isFinite(entry)))) {
      throw new QoniValidationError(`${path}.${key} 只允许字符串、有限数字或布尔过滤值`);
    }
    mergeRecallEntry(target, key, entry, path);
  }
}

function mergeRecallEntry(target: JsonObject, key: string, value: unknown, path: string): void {
  // 同值重复可以合并；任何不同值冲突都拒绝，既不选别名优先级，也不静默覆盖。
  if (Object.hasOwn(target, key) && !sameRecallValue(target[key], value)) {
    throw new QoniValidationError(`${path}.${key} 与另一处召回参数冲突`);
  }
  target[key] = value;
}

function sameRecallValue(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => sameRecallValue(value, right[index]));
  }
  if (isJsonObject(left) && isJsonObject(right)) {
    const entries = Object.entries(left);
    return entries.length === Object.keys(right).length && entries.every(([key, value]) =>
      Object.hasOwn(right, key) && sameRecallValue(value, right[key]));
  }
  return false;
}

function gumemBody(value: JsonObject): JsonObject {
  return renameKeys(value, {
    userId: "user_id",
    sessionId: "session_id",
    recallConfig: "recall_config",
    metadataFilters: "metadata_filters",
  });
}

function renameKeys(value: JsonObject, mapping: Record<string, string>): JsonObject {
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    const target = mapping[key] || key;
    if (out[target] === undefined) out[target] = item;
  }
  return out;
}
