export const QoniScopes = {
  GUMEM_SESSION_CREATE: "gumem.session:create",
  GUMEM_MESSAGE_WRITE: "gumem.message:write",
  GUMEM_MEMORY_READ: "gumem.memory:read",
  GUMEM_MEMORY_WRITE: "gumem.memory:write",
  GUMEM_MEMORY_DELETE: "gumem.memory:delete",
  GUMEM_SEARCH_RUN: "gumem.search:run",
  GUMEM_ADMIN_MANAGE: "gumem.admin:manage",
  GUMEM_RESOURCE_WRITE: "gumem.resource:write",
  GUMEM_ACTION_WRITE: "gumem.action:write",
  GUMEM_ACTION_READ: "gumem.action:read",
  GUMEM_PROFILE_READ: "gumem.profile:read",

  // WebAgent products: exactly two verbs per product — `read` (observe) and
  // `manage` (anything that changes execution state). See
  // wa/docs/qoni-sdk-public-surface.md §3.
  DO_ANYTHING_READ: "webagent.do_anything:read",
  DO_ANYTHING_MANAGE: "webagent.do_anything:manage",
  WEB_SEARCH_READ: "webagent.web_search:read",
  WEB_SEARCH_MANAGE: "webagent.web_search:manage",
  DEEP_RESEARCH_READ: "webagent.deep_research:read",
  DEEP_RESEARCH_MANAGE: "webagent.deep_research:manage",
  TRACK_READ: "webagent.track:read",
  TRACK_MANAGE: "webagent.track:manage",
  WORKSPACE_WRITE: "webagent.workspace:write",
  BROWSER_CONTROL: "webagent.browser:control",
} as const;

export type QoniScope = (typeof QoniScopes)[keyof typeof QoniScopes];

/** Product names accepted by `delegateToken({ products })`. */
export type QoniProduct = "doAnything" | "webSearch" | "deepResearch" | "track";

/**
 * Scope sets granted by the `delegateToken({ products })` sugar — each
 * product expands to its full verb pair: `read` + `manage`.
 */
export const QoniProductScopes: Record<QoniProduct, readonly QoniScope[]> = {
  doAnything: [
    QoniScopes.DO_ANYTHING_READ,
    QoniScopes.DO_ANYTHING_MANAGE,
  ],
  webSearch: [
    QoniScopes.WEB_SEARCH_READ,
    QoniScopes.WEB_SEARCH_MANAGE,
  ],
  deepResearch: [
    QoniScopes.DEEP_RESEARCH_READ,
    QoniScopes.DEEP_RESEARCH_MANAGE,
  ],
  track: [
    QoniScopes.TRACK_READ,
    QoniScopes.TRACK_MANAGE,
  ],
} as const;

/** Every scope string the SDK knows about (gumem + webagent). */
export const KNOWN_SCOPES: readonly string[] = Object.values(QoniScopes);

export const QoniScopeBundles = {
  GUMEM_READONLY: [QoniScopes.GUMEM_MEMORY_READ, QoniScopes.GUMEM_PROFILE_READ],
  GUMEM_SESSION_RECALL: [
    QoniScopes.GUMEM_MEMORY_READ,
    QoniScopes.GUMEM_MEMORY_WRITE,
    QoniScopes.GUMEM_MESSAGE_WRITE,
  ],
  GUMEM_WRITE: [
    QoniScopes.GUMEM_SESSION_CREATE,
    QoniScopes.GUMEM_MESSAGE_WRITE,
    QoniScopes.GUMEM_ACTION_WRITE,
  ],
  // One bundle per WebAgent product = [read, manage].
  DO_ANYTHING: [
    QoniScopes.DO_ANYTHING_READ,
    QoniScopes.DO_ANYTHING_MANAGE,
  ],
  WEB_SEARCH: [
    QoniScopes.WEB_SEARCH_READ,
    QoniScopes.WEB_SEARCH_MANAGE,
  ],
  DEEP_RESEARCH: [
    QoniScopes.DEEP_RESEARCH_READ,
    QoniScopes.DEEP_RESEARCH_MANAGE,
  ],
  TRACK: [
    QoniScopes.TRACK_READ,
    QoniScopes.TRACK_MANAGE,
  ],
} as const;
