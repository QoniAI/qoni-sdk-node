import { KNOWN_SCOPES } from "./scopes";
import { isJsonObject, type JsonObject } from "./types";

/**
 * Known `QoniError.code` values. The SDK assigns the `*.*` codes; the `qoni.*`
 * codes are backend apiCodes surfaced verbatim. The trailing `(string & {})`
 * keeps `code` assignable from any string (the backend may add new codes)
 * while still giving literal autocomplete and letting you write an exhaustive
 * `switch (err.code)` over the known set.
 */
export type QoniErrorCode =
  | "qoni_error"
  | "auth.failed"
  | "delegation.required"
  | "permission_denied"
  | "token.expired"
  | "validation.failed"
  | "rate_limit.exceeded"
  | "upstream.failed"
  | "timeout"
  | "not_found"
  | "conflict"
  | "qoni.delegation.user_not_bound"
  | "qoni.genauth.userpool_binding_missing"
  | "qoni.genauth.userpool_owner_missing"
  | "qoni.genauth.no_bound_users"
  | "qoni.token_exchange.upstream_failed"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export interface QoniErrorOptions {
  code?: QoniErrorCode;
  status?: number;
  requestId?: string;
  traceId?: string;
  auditId?: string;
  retryable?: boolean;
  body?: unknown;
  cause?: unknown;
}

export class QoniError extends Error {
  readonly code: QoniErrorCode;
  readonly status?: number;
  readonly requestId?: string;
  readonly traceId?: string;
  readonly auditId?: string;
  readonly retryable: boolean;
  readonly body?: unknown;

  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message);
    this.name = "QoniError";
    this.code = options.code || "qoni_error";
    this.status = options.status;
    this.requestId = options.requestId;
    this.traceId = options.traceId;
    this.auditId = options.auditId;
    this.retryable = options.retryable ?? false;
    this.body = options.body;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export class QoniAuthError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "auth.failed", ...options });
    this.name = "QoniAuthError";
  }
}

export class QoniDelegationRequiredError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "delegation.required", ...options });
    this.name = "QoniDelegationRequiredError";
  }
}

export class QoniPermissionDeniedError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "permission_denied", ...options });
    this.name = "QoniPermissionDeniedError";
  }
}

export class QoniTokenExpiredError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "token.expired", ...options });
    this.name = "QoniTokenExpiredError";
  }
}

export class QoniValidationError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "validation.failed", ...options });
    this.name = "QoniValidationError";
  }
}

export class QoniRateLimitError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "rate_limit.exceeded", retryable: true, ...options });
    this.name = "QoniRateLimitError";
  }
}

export class QoniUpstreamError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "upstream.failed", retryable: true, ...options });
    this.name = "QoniUpstreamError";
  }
}

export class QoniTimeoutError extends QoniError {
  constructor(message: string, options: QoniErrorOptions = {}) {
    super(message, { code: "timeout", retryable: true, ...options });
    this.name = "QoniTimeoutError";
  }
}

export function errorFromPayload(
  status: number,
  payload: unknown,
  fallbackMessage: string,
): QoniError {
  const detail = isJsonObject(payload) ? payload.detail : undefined;
  const detailObject = isJsonObject(detail) ? detail : undefined;
  const source = detailObject || (isJsonObject(payload) ? payload : {});
  const code =
    stringField(source, "code") ||
    stringField(source, "apiCode") ||
    statusCodeToCode(status);
  const rawMessage =
    stringField(source, "message") ||
    stringField(source, "detail") ||
    fallbackMessage;
  const message = appendOnboardingHint(
    appendDeniedScopes(appendUpstreamDescription(rawMessage, source), source),
    code,
  );
  const options: QoniErrorOptions = {
    code,
    status,
    requestId: stringField(payload, "requestId") || stringField(source, "requestId"),
    traceId: stringField(payload, "traceId") || stringField(source, "traceId"),
    auditId: stringField(payload, "auditId") || stringField(source, "auditId"),
    retryable: status === 429 || status >= 500,
    body: payload,
  };

  if (isTokenExpired(code, message)) return new QoniTokenExpiredError(message, options);
  if (isDelegationRequired(code)) return new QoniDelegationRequiredError(message, options);
  if (status === 401) return new QoniAuthError(message, options);
  if (status === 403 || isPermissionDenied(code)) {
    // Server permission errors pass through with the known scope set appended
    // so callers can see what a valid grant looks like without leaving the
    // stack trace.
    return new QoniPermissionDeniedError(appendKnownScopes(message), options);
  }
  if (status === 400 || status === 422) return new QoniValidationError(message, options);
  if (status === 429) return new QoniRateLimitError(message, options);
  if (status >= 500) return new QoniUpstreamError(message, options);
  return new QoniError(message, options);
}

export function timeoutError(cause: unknown): QoniTimeoutError {
  return new QoniTimeoutError("Qoni request timed out", { cause });
}

export function networkError(cause: unknown): QoniUpstreamError {
  return new QoniUpstreamError("Qoni network request failed", { cause });
}

function stringField(value: unknown, key: string): string | undefined {
  if (!isJsonObject(value)) return undefined;
  const field = (value as JsonObject)[key];
  return typeof field === "string" && field ? field : undefined;
}

// Surface denied/missing scopes inline so they aren't hidden behind a nested
// `[Array]` in the error object — e.g. `scope_not_delegated` carries
// `details.deniedScopes`. The caller sees exactly which scope to add.
function appendDeniedScopes(message: string, source: unknown): string {
  const details = isJsonObject(source) ? source.details : undefined;
  const raw =
    (isJsonObject(details) ? details.deniedScopes : undefined) ??
    (isJsonObject(source) ? source.deniedScopes : undefined);
  if (!Array.isArray(raw) || raw.length === 0) return message;
  const scopes = raw.filter((s): s is string => typeof s === "string");
  if (scopes.length === 0 || message.includes(scopes[0])) return message;
  return `${message} (scopes not granted: ${scopes.join(", ")})`;
}

function appendUpstreamDescription(message: string, source: unknown): string {
  const details = isJsonObject(source) ? source.details : undefined;
  const upstream = isJsonObject(details) ? details.upstream : undefined;
  const description =
    stringField(upstream, "error_description") ||
    stringField(upstream, "message") ||
    stringField(upstream, "error");
  if (!description || message.includes(description)) return message;
  return `${message}: ${description}`;
}

// Common first-run pitfalls get an actionable, one-line hint appended to the
// error message so integrators aren't left guessing where to look.
const ONBOARDING_HINTS: Record<string, string> = {
  "qoni.delegation.user_not_bound":
    "Hint: the userId is not in the GenAuth userpool bound to this credential. " +
    "Resolve a real user with qoni.resolveAnyBoundUser() (demo/smoke) or qoni.currentUser({ accessToken }).",
  "qoni.genauth.userpool_binding_missing":
    "Hint: bind the Qoni credential to a GenAuth userpool before calling genauth.users.*.",
};

function appendOnboardingHint(message: string, code: string): string {
  const hint = ONBOARDING_HINTS[code];
  if (!hint || message.includes(hint)) return message;
  return `${message} ${hint}`;
}

function appendKnownScopes(message: string): string {
  if (message.includes("Known scopes:")) return message;
  return `${message} (Known scopes: ${KNOWN_SCOPES.join(", ")})`;
}

function statusCodeToCode(status: number): string {
  if (status === 401) return "auth.failed";
  if (status === 403) return "permission_denied";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation.failed";
  if (status === 429) return "rate_limit.exceeded";
  if (status >= 500) return "upstream.failed";
  return "qoni_error";
}

function isPermissionDenied(code: string): boolean {
  return code.includes("permission") || code.includes("insufficient_scope");
}

function isDelegationRequired(code: string): boolean {
  return code.includes("interactive_required") || code.includes("delegation.required");
}

function isTokenExpired(code: string, message: string): boolean {
  return code.includes("expired") || /token expired/i.test(message);
}
