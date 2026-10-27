import type { GenAuthCommunicationCredentials } from './genauth-communication-types';
import { memoryRunLifecycle, type MemoryRunLifecycle } from "./memory-run-lifecycle";
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = Record<string, unknown>;

export type DelegationMode = "silent" | "interactive";
export type QoniService = "qoni" | "genauth" | "gumem" | "webagent";
export type QoniHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface QoniOptions {
  accessKey?: string;
  secretKey?: string;
  host?: string;
  /** Overrides the GenAuth URL returned by runtime-config. Prefer host for normal discovery. */
  genauthHost?: string;
  /** Overrides the GUMem URL returned by runtime-config. Prefer host for normal discovery. */
  gumemHost?: string;
  /** Overrides the WebAgent URL returned by runtime-config. Prefer host for normal discovery. */
  webAgentHost?: string;
  /** @deprecated Use accessKey. */
  accessKeyId?: string;
  /** @deprecated Use secretKey. */
  accessKeySecret?: string;
  /** @deprecated Prefer host runtime discovery for normal Qoni Console gateway access. */
  qoniBaseUrl?: string;
  /** @deprecated Use host for normal Qoni Gateway access. */
  genauthBaseUrl?: string;
  /** @deprecated Use host for normal Qoni Gateway access. */
  gumemBaseUrl?: string;
  /** @deprecated Use host for normal Qoni Gateway access. */
  webAgentBaseUrl?: string;
  /** Native GenAuth AK/SK (or standard management bearer) for Agent Mail/Phone runtime. */
  genauthCommunicationCredentials?: GenAuthCommunicationCredentials;
  fetch?: typeof fetch;
  timeoutMs?: number;
  /**
   * Max automatic reconnect attempts for SSE streams (`events()`) after a
   * dropped connection. Each reconnect resumes from the last seen event id
   * via the `last-event-id` header. Defaults to 5; set 0 to disable.
   */
  sseMaxRetries?: number;
}

export interface QoniRuntimeConfig {
  /** Current control-plane wire field. Keep until the server contract migrates. */
  eakBaseUrl?: string;
  genauthBaseUrl?: string;
  gumemBaseUrl?: string;
  webAgentBaseUrl?: string;
  services?: {
    eak?: string | { baseUrl?: string; url?: string; host?: string };
    genauth?: string | { baseUrl?: string; url?: string; host?: string };
    gumem?: string | { baseUrl?: string; url?: string; host?: string };
    webAgent?: string | { baseUrl?: string; url?: string; host?: string };
    webagent?: string | { baseUrl?: string; url?: string; host?: string };
  };
}

export interface QoniMeta {
  /** Response ETag, including quotes, when supplied by GenAuth. */
  etag?: string;
  httpStatus?: number;
  requestId?: string;
  traceId?: string;
  auditId?: string;
  service?: QoniService;
  [key: string]: unknown;
}

export interface QoniResponse<T = unknown> {
  data: T;
  meta: QoniMeta;
}

export interface UserRef {
  id: string;
  subject?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

interface DelegateTokenBaseInput {
  /** Canonical personal IAM Agent UUID. The server verifies authorization for the selected mode; mutually exclusive with audit labels. */
  agentId?: string;
  /** Audit label for this delegation. Defaults to "sdk". */
  agent?: string;
  /** Compatibility alias for agent. Supplying conflicting labels is an error. */
  agentKey?: string;
  /** Fine-grained scopes. May be combined with `products`. */
  scopes?: readonly string[];
  /** Per-product authorization sugar — expands to the product's scope set. */
  products?: readonly QoniProductName[];
  /** Integer seconds (60–86400), or a whole-number duration such as "15m". */
  expiresIn?: string | number;
  /** Not supported: the delegation service does not enforce a deny policy. */
  deniedScopes?: never;
  idempotencyKey?: string;
}

/**
 * Product names accepted by `delegateToken({ products })`. Mirrors
 * `QoniProduct` in scopes.ts (duplicated to keep this module import-free).
 */
export type QoniProductName = "doAnything" | "webSearch" | "deepResearch" | "track";

export type DelegateTokenSilentInput = DelegateTokenBaseInput & {
  mode?: "silent";
  redirectUri?: string;
  state?: string;
} & (
  | {
      user: UserRef;
      /** Alternative to user.id. A nonempty userId takes precedence. */
      userId?: string;
    }
  | {
      user?: UserRef;
      /** Alternative to user.id. A nonempty userId takes precedence. */
      userId: string;
    }
);

export interface DelegateTokenInteractiveInput extends DelegateTokenBaseInput {
  mode: "interactive";
  redirectUri: string;
  state: string;
  /**
   * @deprecated The authorization page identifies the signed-in user; the
   * delegation service ignores a user sent with an interactive request.
   */
  user?: UserRef;
  /**
   * @deprecated The authorization page identifies the signed-in user; the
   * delegation service ignores a user id sent with an interactive request.
   */
  userId?: string;
}

export type DelegateTokenInput =
  | DelegateTokenSilentInput
  | DelegateTokenInteractiveInput;

/** @deprecated Use DelegateTokenInput. */
export type DelegateAgentInput = DelegateTokenInput;

export interface CompleteDelegateTokenInput {
  grantId: string;
  code: string;
  state: string;
}

/** @deprecated Use CompleteDelegateTokenInput. */
export type CompleteDelegateAgentInput = CompleteDelegateTokenInput;

export interface DelegateTokenResponse {
  mode: DelegationMode;
  tokenType: "Bearer";
  token: string;
  /** @deprecated Use token. */
  delegateAgentToken: string;
  /** @deprecated Use token. */
  delegationToken?: string;
  expiresIn: number;
  grantId: string;
  auditId: string;
  /**
   * @deprecated The delegation service does not return the granted scopes.
   * Read them from `qoni.genauth.introspectDelegationToken({ token }).data.scope`.
   */
  grantedScopes?: string[];
}

export type DelegateTokenSilentResponse = DelegateTokenResponse & { mode: "silent" };

/** @deprecated Use DelegateTokenResponse. */
export type DelegateAgentTokenResponse = DelegateTokenResponse;

/** @deprecated Use DelegateTokenResponse. */
export type DelegationTokenResponse = DelegateTokenResponse;

export interface InteractiveDelegationResponse {
  mode: "interactive";
  authorizationUrl: string;
  grantId: string;
  grantState: string;
  state: string;
  requestedScopes?: string[];
}

export type DelegateAgentResponse =
  | DelegateTokenResponse
  | InteractiveDelegationResponse;

export type DelegateTokenResult = DelegateAgentResponse;

export interface WebAgentGrantInput {
  /** The person to act for: a user id in the user pool bound to this AccessKey's workspace. */
  userId: string;
  /** WebAgent scopes the token carries, e.g. site login or browser takeover. May be combined with `products`. */
  scopes?: readonly string[];
  /** Product sugar, as in `delegateToken`; each product expands to its read and manage scopes. */
  products?: readonly QoniProductName[];
  /** Audit label recorded with the delegation. Defaults to "sdk". */
  agent?: string;
  signal?: AbortSignal;
}

/** One person's WebAgent token, issued by `webAgentGrant` for an app that holds no AccessKey. */
export interface WebAgentGrant {
  /** Pass as `token` to doAnything, webSearch, deepResearch, track, proactive, notifications and workspace calls. */
  token: string;
  /** Epoch milliseconds after which WebAgent rejects the token; issue a new grant before then. */
  expiresAt: number;
  /** Where the token is accepted: give it to `new Qoni({ webAgentHost })` in the app. */
  webAgentHost: string;
  /** The person the token acts for. */
  userId: string;
  /** Scopes the token carries. */
  scopes: string[];
}

export interface TokenInput {
  /** Delegation/runtime token to authorize the call with. */
  token?: string;
}

export type RuntimeTokenInput = TokenInput;

export interface RawRequestInput extends TokenInput {
  method: QoniHttpMethod;
  path: string;
  query?: JsonObject;
  body?: JsonObject;
  headers?: Record<string, string>;
}

export interface RequestPayload {
  /** @internal Only runWithMemory installs this request-local observer. */
  [memoryRunLifecycle]?: MemoryRunLifecycle;
  signal?: AbortSignal;
  query?: JsonObject;
  body?: JsonObject | BodyInit;
  headers?: Record<string, string>;
  requiredScopes?: readonly string[];
}

export interface QoniEvent<T = unknown> {
  id?: string;
  event?: string;
  data: T;
}

export type QoniSSEEvent<T = unknown> = QoniEvent<T>;

export interface QoniTransport {
  qoniJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload?: RequestPayload,
  ): Promise<QoniResponse<T>>;
  genauthJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload?: RequestPayload,
  ): Promise<QoniResponse<T>>;
  gumemJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload?: RequestPayload,
  ): Promise<QoniResponse<T>>;
  gumemSSE<T>(
    path: string,
    token?: string,
    payload?: RequestPayload & { lastEventId?: string; signal?: AbortSignal },
  ): AsyncIterable<QoniEvent<T>>;
  webAgentJson<T>(
    method: QoniHttpMethod,
    path: string,
    token?: string,
    payload?: RequestPayload,
  ): Promise<QoniResponse<T>>;
  /** Binary GET — used for artifact content downloads. */
  webAgentBytes(
    path: string,
    token?: string,
    payload?: RequestPayload,
  ): Promise<{ bytes: Uint8Array; mime: string }>;
  webAgentSSE<T>(
    path: string,
    token?: string,
    payload?: RequestPayload & {
      lastEventId?: string;
      signal?: AbortSignal;
      onReconnect?: (info: { attempt: number; lastEventId?: string; error: unknown }) => void;
    },
  ): AsyncIterable<QoniEvent<T>>;
}

export function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
