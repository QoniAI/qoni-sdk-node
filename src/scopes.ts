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

  // Interactive site login (`InteractionHandle.openLogin()` on a `site_login`
  // interaction). Not part of any product bundle: the AccessKey policy must
  // allow it, and the delegation must request it explicitly.
  SITE_LOGIN_REQUEST: "webagent.site_login:request",
  // Persist that login into the browser profile (`InteractionHandle.confirmSignedIn()`
  // after `openLogin()`).
  SITE_LOGIN_CONFIRM: "webagent.site_login:confirm",
  // 用户接管浏览器的独立权限；产品 manage 不包含连接、刷新或交还。
  BROWSER_USE_TAKE_CONTROL: "webagent.browser_use:take_control",

  // The delegating user's own data and the Agent's own mailbox (Personal
  // Agent guide). Not part of any product bundle: request them explicitly;
  // the AccessKey policy must allow them.
  // Read the user's Profile (name, phone, shipping address, card brand + last 4).
  USER_PROFILE_READ: "user.profile:read",
  // Write answers back into the user's Profile.
  USER_PROFILE_WRITE: "user.profile:write",
  // Use the user's saved payment card once the user approves a payment.
  USER_PAYMENT_USE: "user.payment:use",
  // Read mail received by the Agent's own mailbox (for example verification codes).
  AGENT_MAIL_READ: "agent.mail:read",
  // Send mail from the Agent's own mailbox.
  AGENT_MAIL_SEND: "agent.mail:send",
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

/** Every scope string the SDK knows about (gumem + webagent + user + agent). */
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
