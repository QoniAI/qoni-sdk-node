# Changelog

## Unreleased — next version: 0.10.0

These public API changes require **0.10.0**, not a 0.9.x patch. This work does
not bump the packaged version, publish, or release it.

### Candidate integration documentation

- Document the corrected `runWithMemory` phase/submissionUnknown contract and `QoniTaskSubmissionUnknownError` (`task.submit_unknown`, non-retryable). Other run APIs retain existing error types; unknown writes must never be blindly replayed.

- Clarify that this local candidate is not the npm release, despite retaining version 0.9.0. Add typed hosted-login, exact-interaction, ordinary Profile, opt-in memory and Agent provisioning examples.
- Correct `recallContext()` to `QoniResponse<MemoryContext>` and the ordinary Profile field boundary. `runWithMemory()` still returns `{ run, memory }`; ordinary `run()` never opts into recall.
- Separate accepted/pending/unknown writes from success; no automatic POST replay or permission expansion after consent changes. Agent provisioning remains pending backend business validation, and open execution isolation and complete one-hour waiting remain unverified.

### Pre-run memory context

- Add explicit `doAnything.runWithMemory()` and typed `gumem.recallContext()`
  using the original delegation source and existing resource exchanges. Recall
  must succeed before Task creation; empty recall preserves the prompt, with
  bounded quoted reference data, cancellation/deadline support and no write retry.
- Keep actual history message IDs and optional safe stored `metadata.source_url`;
  never forward arbitrary metadata or infer fact URLs from text. Flattened GUM
  facts/summary explicitly report unavailable provenance until backend projection.
- Keep ordinary `run()` defaults, package version and released history unchanged.


### Ordinary structured forms

- Add `InteractionTypes.FillForm`, narrowed `FillFormPayload`/`FormHandle`, `FormField`, `FormAddress`, `FormValues`, and `InteractionHandle.submit(values)` using the declared submit route.
- Preserve ordinary field names and JSON values; check required fields, types, option values, NUL and finite numbers before transport. The matching W4 backend validates its current durable card again. Existing typed `answer()` and login/control lifecycle stay compatible.
- Task-only collection: sensitive fields, payment cards and Profile writes remain unavailable. Package version and released 0.9.0 history are unchanged; final W6 synthesis/provider acceptance is separate.

### Fixed

- Internal task facade run/message IDs reject all C1 controls, including NEL,
  before permission or HTTP. Message role/content reject unpaired surrogates
  without normalizing valid strings, using a Node 18 compatible check. Whole
  batches bind IDs on synchronous submission, including batches not yet sent;
  provider rejection or timeout before HTTP keeps that binding, and the original
  content can be explicitly retried. Invalid batches bind no IDs.

### Added

- `genauth.auth.createLoginUrl({ redirectUri, state, screen? })` and
  `genauth.auth.exchangeLoginCode({ code, redirectUri })` send users to the
  Qoni-hosted GenAuth sign-up/sign-in page for the AccessKey's registered
  business app and exchange the callback code on the server. `expiresAt` is the
  server deadline fixed at creation (600 seconds); a URL completes at most once
  and a code is exchanged at most once, with no automatic retry. `isNewUser`
  comes from the actual registration in that sign-in. The app keeps and checks
  `state` itself. Inputs reject undeclared fields (client ID, secret, issuer,
  token URL) before HTTP, and responses are validated without invented
  defaults.
- Internal Pi hosts can use `createTaskClient` without AK/SK to create the fixed
  run Session and append immutable identified messages. The entry reuses GUMem
  mappings and JSON transport, checks current permission per call, bounds provider
  and HTTP with one timeout/abort, refuses redirects and never retries POST.
  Stable ordered batches use an internal request ID for existing usage-outbox
  deduplication. Runtime/type allowlists reject identity/token/header/path overrides;
  responses and typed errors exclude private raw payloads. Resource-server run
  isolation, G6/WA issuance, durable Pi recovery and offline acceptance remain
  dependencies. This local task facade build is separate from the frozen current-task
  integration archive; version and released history remain unchanged.

### Breaking

- Declared DoAnything task-login actions now use the unreleased `current_task`
  policy. `openLogin()` uses the existing task browser and requires
  SITE_LOGIN_REQUEST + BROWSER_USE_TAKE_CONTROL; `confirmSignedIn()` requires
  SITE_LOGIN_CONFIRM + BROWSER_USE_TAKE_CONTROL + DO_ANYTHING_MANAGE. Enable
  these AccessKey policies and obtain user consent before the coordinated cutover
  below. Product `manage` cannot replace login or control permission.
  The SDK binds the original login question L and open's control round C
  (`session_id === control_interaction_id`), then makes one declared confirm
  POST `{login_session_id:C}` for reliable save, release and reply. It does not
  call Profile confirm or send another recheck. `login.confirm()` shares that
  same request. A saved result is `state: "saved", active: false,
  probeResult: "agent_pending"`; the agent must still verify the page.
  Missing/unknown mode or mismatched L/C fails closed. Confirmation requires a
  successful open on this run/interaction; 409 remains a failure, including
  `no_pending_login`, without ID replacement or reopening. Save failures and
  uncertain/invalid responses permit an explicit retry of the original L/C;
  only the backend's exact successful history can acknowledge a lost response.
  Legacy `/profiles/login` and Profile confirm retain their paths, single scopes
  and result semantics. Update application UI that treats `active: false` as
  always signed out: current-task `saved/agent_pending` means persistence only.
- Raw `doAnything.api.intervene()` refresh/release calls must carry this
  control round's `interactionId` (wire alias `interaction_id`). A first
  user-initiated take may omit it only when no marker is active; reconnecting
  to an active round must match its ID. Save `interaction_id` from the new
  Web Agent take/refresh response. Missing, ended, expired or mismatched IDs
  return server HTTP 409 without side effects; never fetch a current ID and
  retry an old action. Card methods keep their declared path ID and old
  `ControlSession` objects are not rebound to new cards. Conflicting aliases
  and explicit non-string/empty IDs fail SDK validation; omission still reaches
  the server. `requestId` remains the separate input-question identifier.
- Browser connection, refresh and release now require the independent
  `webagent.browser_use:take_control` scope
  (`QoniScopes.BROWSER_USE_TAKE_CONTROL`). Product `manage`, `products` bundles,
  and legacy control scopes do not grant it. Existing AccessKeys and user
  delegations must migrate; permissions are not automatically expanded.
- Migration: first prepare GenAuth scope registration and Console's browser-control
  and site-login policies; enable the required policies on the AccessKey. Then
  explicitly request the new scope and obtain new user consent through interactive
  delegation. Updating the allowlist or renewing an old grant must not add the
  new permission silently. Request `webagent.site_login:request` and
  `webagent.site_login:confirm` separately when login is needed.
- Coordinate the Web Agent and SDK cutover in a maintenance window after finishing
  or draining existing browser-control tasks. The old Web Agent release endpoint
  checks product `manage`, while the new SDK requests `take_control` for release;
  the new Web Agent rejects `manage` as a substitute. A simple sequential upgrade
  does not guarantee uninterrupted existing sessions. Do not introduce a `manage`
  compatibility bypass. Verify connect, refresh and release with the new consent,
  plus rejection when the scope is missing or only legacy control scopes are present.
  The new Console lists permissions not covered by selected policies separately,
  including legacy, unknown and partial policy entries. It preserves them by
  default; removal requires selecting “Remove these permissions when saving”. Inspect the saved
  allowlist. Preserving a legacy control scope does not grant the independent scope.
- Raw input answer/skip calls now require the current persisted input ID, waiting
  state and declared action. Stale or undeclared actions return server 409 without
  SDK ID replacement or retry. Use declared confirmation/sign-in actions for those
  interactions; ordinary answer/skip must not stand in for approval or sign-in.
- Card connect returns a pending round; OBO/API-key `surface` input cannot claim
  an active Console connection. Releasing it does not resolve a pending login ask.
  Console active release also leaves current_task login/credential asks unanswered;
  both are `site_login` cards that end only through `confirmSignedIn()` after
  reliable save, a declared explicit `skip()`, or expiry. Only legacy `secure_input`
  asks receive a recheck reply on Console active release, which proves neither
  sign-in nor persistence. Clarification and confirmation are never answered
  automatically. Task-login confirmation
  above is a separate save/release/reply operation; deployment remains pending.
- Deployment and publication await a separate Owner instruction. The released
  `0.9.0` history below is unchanged.

### Fixed

- Normalize recall metadata filter aliases into `recall_config.metadata_filters`
  without mutating the input. Matching duplicate values merge; conflicts,
  null/non-scalar/non-finite values and system-reserved fields throw a local
  `QoniValidationError`. Other recall configuration keys pass through unchanged.
  This SDK validation does not fix backend isolation or verify cross-task recall.

### Track and artifact compatibility — Breaking

- `track.create` requires an explicit schedule. Migrate to an integer
  `{ kind: "interval", intervalSeconds: 600..2592000 }` or an explicit
  `{ kind: "daily", at: "HH:MM", tz }`; daily starts up to 30 minutes early.
  Cron is locally unsupported and is never automatically converted.
- Interval `tz` and old targetUrls/extractionSchema/triggerDsl/
  stopConditionDsl/notifyChannel/url fields have no wire equivalent. Remove
  them; put watched URLs explicitly in prompt instructions. Optional undefined
  fields are still omitted; defined unsupported fields raise typed local errors.
- `refine` accepts title/schedule only. Create a new Track to change the original
  prompt/intent; the raw updateMonitor wire API supports explicit instructions.
- `runNow` returns only `{ trackId, sessionId, runId }`, a 202 acceptance
  reference. TrackTaskRef is a type alias and remains assignable to JsonObject.
  Read the exact recent check for its real `done/failed/expired/canceled`
  status; this differs from RunResult's `succeeded`. Create already starts a
  first look: wait for the original lastTaskId before one explicit runNow.
- `runs` and `run(id)` search only the newest 50 checks; no extracted/diffs/
  snapshot fields are synthesized. Replace old tick/snapshot consumers with
  the actual check fields; a missing run raises local not_found with its range.
- Track events/interactionHandle/api.events/api.intervene and DoAnything
  readArtifacts now raise local QoniUnsupportedError with zero HTTP. Their
  deprecated exports remain; use Track checks, separately authorized DoAnything
  interactions, real file artifacts(), or captured screenshot events instead.
- Pause/delete stop future scheduling and keep an in-flight check running.

### Track and artifact compatibility — Changed

- Track now maps supported operations to `/track/tracks`: prompt → instructions,
  explicit integer intervals of 600–2592000 seconds or daily at/tz (starts
  0–30 minutes before target), real status PATCH, empty DELETE204, recent 50
  checks with local pagination, and runNow task references. Refine is limited
  to title/schedule. Deletion does not cancel a running task.
- Cron, old extraction/DSL/URL/channel options, Track events/intervene and
  interactionHandle fail locally. Deprecated methods/types remain exported.
- `doAnything.api.readArtifacts` and snapshot types are deprecated with local
  `QoniUnsupportedError` (`unsupported.operation`), zero HTTP. Use actual file
  artifacts or captured screenshot events. File APIs are unchanged.
- Live coverage metadata retires old monitor/snapshot success claims; current
  Track mapping is locally verified, with live acceptance pending.

## 0.9.0 - 2026-10-07

DoAnything interactions are now typed by what the user has to do, never by
business: `site_login`, `take_control`, `ask_user`, `confirmation`, plus the
system `wait`.

### Changed

- `Interaction` is a union distributed over `type`: `switch (interaction.type)`
  narrows `payload` in each branch, including `handle.interaction` inside
  `onInteraction`. `Interaction<"site_login">` still picks one member.
  `TypedInteraction` names the union. Because it is now a type alias, not an
  interface, `interface X extends Interaction` no longer compiles (TS2312):
  use `type X = Interaction & { ... }`. Code that builds an `Interaction` from a
  separate `type` and `payload` must narrow them together or cast the object.
- The wire's `clarification` is presented as `ask_user`, with payload
  `{ question, answerType, options? }`. `answerType` is `text`, `number`,
  `boolean`, `single_choice` or `multiple_choice`, and options are
  `{ value, label }`. A clarification with choices becomes `single_choice`; one
  without choices is `text`. A native `ask_user` keeps the `answer_type` it
  sends, and every string option value is kept, including `""`.
  Migration: compare `type` with `"ask_user"` instead of `"clarification"`
  (TypeScript no longer compiles the old comparison); read
  `payload.answerType` / `payload.options` instead of `payload.inputType`
  (removed) or the answer action's `inputSchema` enum.
  `InteractionTypes.Clarification` is deprecated and now equals
  `InteractionTypes.AskUser`: it still matches interactions the SDK hands out,
  but not a raw wire `type` or a `"clarification"` string you stored.
  `ClarificationPayload` is a deprecated alias of `AskUserPayload`, which
  requires `answerType`.
- `InteractionHandle.answer(value)` accepts the structured value its
  `answerType` names (string, number, boolean, one option value, or an array of
  option values) and throws `QoniValidationError` before sending a value that
  does not fit.
- `InteractionHandle.confirmSignedIn()` saves the login opened by `openLogin()`
  on the same interaction (`POST /profiles/{profileId}/confirm`, scope
  `webagent.site_login:confirm`), then tells the agent to recheck. Sign-in is
  `openLogin()` → `confirmSignedIn()`:
  - It saves once and rechecks once per login session, however many handles
    or concurrent calls ask; the deprecated `OpenLoginResult.confirm()` shares
    the same save.
  - A user who is not signed in yet, or 409 `no_pending_login`, still gets a
    recheck: the agent raises a new `site_login` when needed.
  - When the backend keeps the session but could not save it
    (`probeResult: "release_failed"`), it throws a retryable `QoniError` coded
    `site_login.save_failed` and does not tell the agent to go on; calling it
    again saves again. Any other save failure is thrown as well.
  - When `openLogin()` calls overlap, the latest call that succeeds owns the
    session, whichever response arrives last.
  - Reopening that returns the same backend session shares its save; when a
    newer backend session replaces it, `confirm()` on the old result throws
    `QoniValidationError` instead of saving. If the login is reopened while a
    `confirmSignedIn()` is still saving, that call throws a retryable
    `QoniError` coded `site_login.session_replaced` without telling the agent
    to go on; call it again to save the newer login.
  - Handles from the same `RunHandle` or `MonitorHandle` share the login
    session, so a handle from a later callback saves it too. A RunHandle from
    another `attach()` or process does not.
- `connectControl()` and `refreshControl()` resolve to a `ControlSession`
  (`{ liveUrl, expiresAt?, status?, raw }`, the signed URL of the browser the
  user now controls) instead of `void`. `await handle.connectControl()` is
  unaffected; code that returns the call where `Promise<void>` is expected,
  such as `const cb: () => Promise<void> = () => handle.connectControl()`, no
  longer compiles (TS2322) — wrap it: `async () => { await handle.connectControl(); }`.
- `run.events()`, `wait({ onInteraction })` and `monitor.events()` keep an
  interaction's type and content when the backend settles it with an empty
  shell (a resolve labelled `clarification` with an empty question, or a
  `site_login` with one empty site): only `status`, `resolvedAt` and `actions`
  change. A settled update with content of its own, such as an expired
  take-over with its reason, replaces the card as before. Run and monitor
  handles keep about 256 interactions, forgetting settled cards first, and
  logins once they are saved or their interaction ended; a pending card or a
  login still in progress is never dropped.

### Added

- `QoniScopes.USER_PROFILE_READ` (`user.profile:read`), `USER_PROFILE_WRITE`
  (`user.profile:write`), `USER_PAYMENT_USE` (`user.payment:use`),
  `AGENT_MAIL_READ` (`agent.mail:read`) and `AGENT_MAIL_SEND`
  (`agent.mail:send`). They belong to no product bundle: request them
  explicitly, and allow them in the AccessKey policy. The constants only name
  the scopes; requesting them does not by itself enable Profile, payment or
  mailbox access in a run.
- Exported types `AskUserPayload`, `AskUserOption`, `AskUserAnswer`,
  `AskUserAnswerType`, `InteractionBase`, `TypedInteraction` and
  `ControlSession`.

### Fixed

- A scope written without its service prefix names every matching scope:
  `profile:read` suggests both `gumem.profile:read` and `user.profile:read`.

### Deprecated

- `user` / `userId` on interactive delegation input: the authorization page
  identifies the signed-in user, and the delegation service ignores them.
- `DelegateTokenResponse.grantedScopes`: the delegation service does not return
  it. Read `qoni.genauth.introspectDelegationToken({ token }).data.scope`.
- `OpenLoginResult.confirm()`: `confirmSignedIn()` saves the login itself.

## 0.8.0 - 2026-10-04

### Added

- `qoni.genauth.delegateAgent(input)` returns the grant directly (`grant.token`),
  or an interactive authorization request, through the existing signed endpoint.
- `agentKey` is an alias for `agent`. Existing root and `qoni.qoni` entries keep
  their `QoniResponse` envelopes. Conflicting Agent labels are rejected;
  the existing top-level `userId` precedence is unchanged.

### Fixed

- Expiry strings such as `"15m"` are converted to integer seconds; valid
  durations are 60–86400 seconds, matching the GenAuth DTO.
- Unsupported `deniedScopes` is rejected rather than forwarding an unenforced
  deny policy. Legacy `mailbox.*`, `web.search`, and `web.extract` scopes are rejected without mapping to product scopes.

### Changed

- Expiry validation now happens locally before signing. Invalid formats and
  values outside 60–86400 seconds throw `QoniValidationError`; numeric seconds
  strings are sent as integers.

## 0.7.0 - 2026-10-02

### Changed

- `InteractionHandle.openLogin()` now resolves to an `OpenLoginResult`
  (`{ profileId, siteId, sessionId, liveUrl, raw, confirm() }`) instead of
  `void`. TypeScript code that stores the method as `() => Promise<void>` needs
  to widen that type; runtime callers that ignore the result are unaffected.

### Added

- `OpenLoginResult.confirm()` persists the login into the profile
  (`POST /profiles/{profileId}/confirm`) and reports `active`. Call
  `confirmSignedIn()` once it is active (or when `probeResult` is
  `no_session`), otherwise reopen the session with
  `openLogin({ siteId, profileId })`.
- `QoniScopes.SITE_LOGIN_REQUEST` (`webagent.site_login:request`) and
  `QoniScopes.SITE_LOGIN_CONFIRM` (`webagent.site_login:confirm`). They are not
  part of any product bundle: delegate them explicitly and allow them in the
  AccessKey policy.

### Fixed

- `openLogin()` now starts a working login session. It sends the `site_id` the
  backend's `/profiles/login` route requires (the only site listed on the
  `site_login` interaction, or `openLogin({ siteId })`; pass `profileId` to
  re-login an existing profile) and requests the site-login scope instead of the
  product's manage scope. Previously the backend always rejected it. This
  covers `site_login` interactions on Do Anything and Deep Research runs; Track
  monitor re-login (`monitor.needs_login`, backend `/track/monitors/{id}/re_auth`)
  is not wrapped by the SDK yet.
- `run.wait()` retries a transient failure of the reads it makes after the run
  finished (run detail, artifact list) up to twice. A dropped connection or a
  timed-out token exchange no longer fails a run that already succeeded. Only
  `retryable` errors are retried; aborts and the `timeoutMs` deadline stop it.
- `track.create()` sends `{ kind: "interval", intervalSeconds }` as
  `interval_seconds`, as `refine()` already did. The backend previously ignored
  the camelCase field and fell back to its default 60-second interval. Other
  schedule fields such as `tz` pass through unchanged, for `create()` and
  `refine()` alike. Malformed interval or cron schedules are rejected locally.
- Monitor and tick reads keep user-defined keys verbatim: `extractionSchema`,
  `baselineExtracted`, a tick's `extracted`, and the `before` / `after` /
  `added` / `removed` / `sampleUnchanged` values in `diffs` no longer rename
  `source_url` to `sourceUrl`. Protocol fields are still camelCased.

## 0.6.0 - 2026-09-23

### Added

- Deliver `browserLiveUrlChanged` on semantic run streams when the browser
  viewer URL changes. Applications can follow the active tab instead of
  remaining on the initial blank page. The event includes the live viewer URL
  and refresh hint, without exposing the private CDP URL in `event.data`.

## 0.5.2 - 2026-09-23

### Fixed

- Keep permission errors concise instead of appending every known scope.
- Explain how to enable a permission policy when an AccessKey has no allowed
  scopes. Preserve the backend error code and request ID for diagnosis.

## 0.5.1 - 2026-09-23

### Fixed

- Recheck access-key scope policy at token exchange before every SDK product
  operation, including repeated calls with the same delegation token. Removing
  a scope now blocks the next SDK operation instead of leaving a cached product
  token usable until expiry.

## 0.5.0 - 2026-09-17

### Added

- Let Do Anything callers select a server-managed Browserbase proxy by ID, choose
  `off`, `all`, or `scoped` routing, and select a supported Browserbase compute
  region with `browserProxy`.

### Security

- Reject proxy URLs, usernames, passwords, and any unknown proxy option locally.
  Proxy credentials remain in the backend's private registry and never cross the
  public SDK API.

## 0.4.4

- Populate Do Anything `result.artifacts` from durable run files, including attached runs.
- Expose signed download URLs, per-file link refresh, and explicit file listing.

All notable changes to `@qoniai/qoni` are documented in this file.

This project follows semantic versioning. Before `1.0.0`, minor versions may
include SDK API changes, while patch versions are reserved for backward
compatible fixes.

## 0.4.3 - 2026-09-09

### Fixed

- Treat malformed or empty screenshot data URIs as undecodable instead of
  emitting invalid screenshot bytes or interrupting `wait()`. Preserve the
  existing progress/raw fallback with screenshot capture enabled or disabled.
- Keep valid padded, unpadded, whitespace-containing and URL-safe base64
  screenshots compatible.

## 0.4.2 - 2026-09-09

### Fixed

- Require authoritative run details when settling `wait()`: preserve detail
  errors and reject unconfirmed terminal states instead of inventing success.
- Reuse terminal details read after a clean stream close and resume from every
  wire event cursor, including frames filtered from semantic events.
- Propagate wait cancellation to detail and artifact-list GETs. Bound complete
  JSON, NDJSON, binary, and HTTP error body reads by the request timeout, cancel
  stalled readers, and discard late responses without starting replacement runs.
- Clean up wait timers and SSE abort listeners. Cancel idle SSE readers directly
  and release their locks without waiting indefinitely for source cancellation.
- Retry HTTP 408 stream failures within the configured reconnect budget and stop
  delivering buffered events after cancellation.

### Added

- Optional abort signals on product run-detail and artifact-list wire reads;
  existing calls without a signal remain compatible.

## Earlier changes

### Breaking

- Rename the public SDK constructor from its previous longer name to `Qoni`.
  The previous constructor export has been removed.

### Changed

- The default Qoni host is now `https://dashboard.qoni.ai`.
  Callers that never passed an explicit `host`
  reach a different control plane after upgrading. Note that the new default has
  no `/dashboard` path segment — pass `host` explicitly for private or local
  deployments.
- Service resolution no longer fetches the runtime-config document to answer a
  Qoni base URL. It never read the result for that service, but it did require
  the fetch to succeed, so an unavailable discovery endpoint failed every Qoni
  call. Discovery is still fetched lazily for `genauth` / `gumem` / `webagent`,
  which do read it.
- Signed Qoni requests always stay on the configured control-plane host. Service
  resolution no longer follows `eakBaseUrl` from the runtime config for the
  Qoni service, because AK/SK signatures are scoped to that endpoint and a
  cross-origin runtime URL can strip `Authorization` on redirect or disclose
  credentials to an unintended origin.
- `unstableRequest()` without a `token` now signs the call with AK/SK instead of
  sending it unauthenticated. Caller-supplied `authorization`, `content-type`,
  `date` and `x-authing-*` headers are dropped so they cannot corrupt the
  signature.

### Fixed

- The previous default host was unreachable for SDK API calls. A client created
  as `new Qoni({ accessKey, secretKey })` now reaches the live control plane.
- Abandoning an event iterator no longer leaks its connection. Leaving
  `for await (const event of run.events())` through a `break` now cancels the
  response body before releasing the reader lock, returning the socket to the
  connection pool.

### Added

- `RunHandle.events()` and `wait()` accept `onWireEvent` and `onReconnect`
  observability callbacks. The former receives every original SSE frame before
  semantic filtering; the latter exposes resumable-stream retry details.
- The focused Do Anything live E2E gate records the complete Agent/tool trace,
  Browser Harness script source and execution, screenshots, recording, final
  result, reconnects, and report-ready latency/token/cost metrics under the
  ignored local evidence directory.

## 0.4.0 - 2026-08-18

### Breaking

- Rename the package from its previous product name to `@qoniai/qoni`.
- Rename the primary constructor and all branded exports to `Qoni` and the
  corresponding `Qoni*` types, constants, and error classes.
- Rename the product namespace to `client.qoni` and environment variables to
  `QONI_*`. The current server wire contract remains unchanged: SDK gateway
  routes stay under `/api/v3/eak/*`, delegation tokens retain
  `eak_delegation_token` and `eak_tenant_id`, and backend `eak.*` error codes
  pass through as-is.
- Rename the bundled integration skill to `qoni-sdk` and update repository,
  package publishing, smoke-test, and runtime-discovery metadata.

## 0.3.4 - 2026-06-18

### Fixed

- `refine()` no longer accepts `prompt`. It mapped to `patch.intent`, but the
  backend `RefinePatch` is `extra="forbid"` with no `intent` field, so
  `refine({ prompt })` 422'd with `validation_error` (while `schedule` /
  `targetUrls` / etc. worked). The monitor's natural-language intent drives
  URL/schema/DSL generation and is deliberately not refinable — create a new
  monitor to change it. Removed `prompt` from `MonitorRefinePatch`; README and
  types updated to match.

## 0.3.3 - 2026-06-18

### Changed

- `MonitorHandle.update(input)` is replaced by intent-revealing methods that
  match the backend's monitor FSM: `pause()`, `resume()`, and `refine(patch)`.
  The old passthrough sent a body with no `action` discriminator, so the
  backend always rejected it with `validation_error` — it never worked as
  documented, so no functioning code relied on it. `refine()` takes a
  camelCase `MonitorRefinePatch` and normalizes `schedule`
  (`{ kind: "cron", expr }` / `{ kind: "interval", intervalSeconds }`).

### Fixed

- `RunResult.terminalReason` is now populated from the terminal `done` event
  when the run-detail envelope omits it (previously `undefined` even though
  the stream delivered the reason).

### Documentation

- Track example: document the `pending_clarification` → `active` lifecycle —
  `runNow()` / `refine()` require `active`, so a freshly created monitor must
  reach `active` first (the old `create()` → `runNow()` snippet raced it).
- Replace the wrong `update({ schedule: "0 9 * * *" })` with
  `refine({ schedule: { kind: "cron", expr: "0 9 * * *" } })`.

## 0.3.2 - 2026-06-18

### Fixed

- `delegateToken` in silent mode now fails locally with `QoniValidationError`
  when no `user` / `userId` is given, instead of letting an un-attributed
  request reach the gateway and surface as a confusing signing error. The TS
  overloads already enforced this; the guard covers plain-JS callers.

### Documentation

README pass driven by an external review:

- Document all exported error classes (`QoniAuthError`, `QoniTokenExpiredError`,
  `QoniUpstreamError`, `QoniDelegationRequiredError`, …), not just three; note
  that the SDK does not auto-retry and `retryable` is yours to act on.
- Clarify that `client.timeoutMs` bounds individual requests, not the live
  run stream — long runs stream fine; bound waiting with `wait({ timeoutMs })`.
- Spell out the `delegateToken` input shape (silent requires `user: { id }`;
  interactive needs none).
- Point at the exported constants (`InteractionTypes`, `InteractionStatuses`,
  `ActionKinds`, `QoniScopes`, `QoniProductScopes`) instead of bare literals.
- Document the `RunResult` / `Artifact` shapes returned by `wait()`.
- Note the dual ESM/CommonJS builds; remove stray Chinese from the English README.

## 0.3.1 - 2026-06-18

Documentation-only release; no SDK code changes.

### Fixed

- README delegation examples passed `user: { subject: userId }`, but `UserRef`
  requires `id` and the SDK only reads `user.id` — as written the silent
  delegation throws `eak.delegation.user_id_required`. Corrected to
  `user: { id: userId }` in both README.md and README.zh-CN.md.
- Replaced non-runnable placeholder example prompts (an undefined "customer
  website", a literal `…`, a fake `example.com/pricing`) with concrete,
  live-verified prompts so copy-pasted examples actually execute.

## 0.3.0 - 2026-06-18

Semantic-layer public surface per the frozen contract. **Breaking** — the
WebAgent product namespaces are reorganized around handles; the 1:1 wire
methods moved (no compatibility aliases).

### Breaking

- `doAnything.run` / `webSearch.run` / `deepResearch.run` now return a
  `RunHandle` (`id`, `sessionRef`, `status()`, `events()`, `wait()`,
  `respond()`, idempotent `cancel()`) instead of a wire envelope.
  `attach(runId, { token })` reconnects to an existing run (doAnything
  additionally needs `session`). `doAnything.runAndWait` is replaced by
  `run()` + `wait()`.
- `track.createMonitor/getMonitor/updateMonitor/deleteMonitor/runNow/events`
  are replaced by `track.create` / `track.attach` returning a `MonitorHandle`
  (`get()`, `update()`, `runNow()`, `events()`, `respond()`, `runs()`,
  `run(runId)`, `delete()`). Monitor HITL answers (`respond`) and tick-run
  read views (`runs` / `run`) are newly exposed.
- The 1:1 wire-level methods moved to `qoni.<product>.api.*` (e.g.
  `qoni.doAnything.api.createSession`, `qoni.deepResearch.api.followUp`); their
  shapes may evolve with the API and are no longer the documented mainline.
- Handle event streams yield semantic `RunEvent`s (`type` / `runId` / `at` /
  `isTerminal` / camelCase `data` / `raw`), end automatically at the terminal
  event, and decode screenshot data URIs to `event.image.bytes`. The
  `capture: { screenshots, videoFrames }` switch replaces hand-built
  `stream.events` subscriptions; core events are always subscribed.
- `delegateToken`: `agent` is optional (default `"sdk"`), `products` sugar
  expands to per-product scope sets, and scope strings are validated locally —
  malformed scopes throw `QoniValidationError` before any request.

### Added

- `result.artifacts` on `wait()` results — deepResearch deliverables with lazy
  `content()` byte downloads; empty for other products.
- Server permission errors now append the known scope set to the message.

## 0.2.0 - 2026-06-10

Run-event handling now matches the live WebAgent backend, plus resilient
streaming. **Breaking** — see below.

### Breaking

- `QoniEventTypes` now holds the real backend wire event names (`run.*`, e.g.
  `RUN_COMPLETED = "run.completed"`, `RUN_ACTION_STARTED`, `RUN_INPUT_REQUEST`,
  `RUN_BROWSER_LIVE_URL_CHANGED`), replacing the previous placeholder constants
  (`DO_ANYTHING_FINAL = "final"`, `DO_ANYTHING_ACTION = "action"`, …) that never
  matched a real run stream. Match `event.event` against the new constants;
  `RUN_COMPLETED` is the terminal event.

### Fixed

- `doAnything.events()` (and the other product `events()` iterators) now surface
  the wire event type on `event.event`. Backend run frames carry no SSE `event:`
  line — the type lives in the envelope's `type` field — so `event.event` was
  previously always `undefined`. The envelope still rides on `event.data`
  (`event.data.data` is the payload; `event.data.task_id` identifies the run).
- `doAnything.run()` returns a typed `DoAnythingRunResult` with canonical
  snake_case `run_id` / `session_id` (no more `id` / `sessionId` guessing).

### Added

- Automatic SSE reconnect: `events()` resumes a dropped stream from the last
  event id (network / 5xx). Configure with the `sseMaxRetries` client option
  (default 5, `0` disables). User aborts and terminal 4xx are never retried.
  Each reconnect re-resolves the product token, so a long stream survives token
  expiry — a `401` on reconnect is treated as retryable and recovered with a
  fresh token instead of throwing.
- `doAnything.events({ onlyTopLevel: true })` drops internal sub-run events
  (matched on `event.data.task_id`) and yields only the addressed run's events.
- `doAnything.runAndWait` gains an `onCostUpdate` hook (live `run.cost_update`),
  filters to the top-level run, and settles from the `getRun` envelope so
  `result.raw` always carries `total_cost_usd` / `step_count` / token counts
  (the `run.completed` event payload omits them).
- `doAnything.runAndWait({ instruction, onAction, onScreenshot, onInputRequest,
  timeoutMs, signal, ... })` — high-level helper that starts a run, drives its
  event stream to a terminal state, and resolves a settled
  `{ status, output, terminalReason, isTaskSuccessful, runId, sessionId }`.
  Falls back to `getRun` if the stream closes without a terminal event.
- `qoni.resolveAnyBoundUser()` — returns a real user id from the credential-bound
  GenAuth userpool, for demos / smoke tests that need a `userId` for silent
  `delegateToken` without hardcoding one.
- Onboarding hints: errors for `eak.delegation.user_not_bound` and
  `eak.genauth.userpool_binding_missing` now append a one-line, actionable hint
  to the message (e.g. pointing at `resolveAnyBoundUser` / `currentUser`).
- `QoniError.code` is now typed as `QoniErrorCode` — a union of the known SDK /
  backend codes plus `(string & {})` — so you get literal autocomplete and can
  write an exhaustive `switch (err.code)` while still tolerating new backend
  codes. Exported as `QoniErrorCode`.

## 0.1.0 - 2026-06-02

Initial public release of `@qoniai/qoni`.

### What ships

- Server-side `Qoni` constructor for Qoni Agent delegation and product
  runtime calls.
- Runtime service discovery from the Qoni Console gateway through
  `GET /api/v3/eak/runtime-config`.
- One-step `delegateToken` flow for binding a GenAuth user, Agent identity,
  scope list, expiry, and audit metadata.
- Automatic product-token exchange before GUMem and WebAgent runtime requests,
  so integrations can pass the delegation token returned by `delegateToken`.
- Capability namespaces for `qoni`, `genauth`, `gumem`, `webSearch`,
  `doAnything`, and `track`.
- Typed SDK errors with request, trace, audit, retry, service, and HTTP status
  metadata.
- Exported scope constants, scope bundles, and event constants for common Agent
  workflows.
- English and Chinese README files, open-source repository metadata, examples,
  and readiness checks.

### Compatibility

- `Qoni` is the public SDK constructor.
- `delegateAgent` and `completeDelegateAgent` remain available as deprecated
  aliases for older integrations, but new integrations should use
  `delegateToken`.
