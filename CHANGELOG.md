# Changelog

All notable changes to `@qoniai/qoni` are documented in this file.

This project follows semantic versioning. Before `1.0.0`, minor versions may
include SDK API changes, while patch versions are reserved for backward
compatible fixes.

## 0.5.0 - 2026-09-17

### Added

- Let Do Anything callers select a server-managed Browserbase proxy by ID, choose
  `off`, `all`, or `scoped` routing, and select a supported Browserbase compute
  region with `browserProxy`.
- Populate Do Anything `result.artifacts` from durable run files, including attached runs.
- Expose signed download URLs, per-file link refresh, and explicit file listing.

- Return typed login and control tickets instead of discarding action responses.
- Send an explicitly selected site and optional existing Profile when opening login.
- Exchange the additional login/control scopes only for the actions that need them;
  ordinary product delegation bundles remain unchanged.
- Document server-side controllers, embedded Live View, and the separate persistent
  Profile lifecycle. Existing `Promise<void>` wrappers around login/control methods
  must accept the new result type. This requires a minor-version release.

### Security

- Reject proxy URLs, usernames, passwords, and any unknown proxy option locally.
  Proxy credentials remain in the backend's private registry and never cross the
  public SDK API.

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

## Unreleased

### Breaking

- Rename the public SDK constructor from its previous longer name to `Qoni`.
  The previous constructor export has been removed.

### Changed

- The default Qoni host is now `https://dashboard.qoni.ai` (was
  `https://anima.eazo.ai/dashboard`). Callers that never passed an explicit `host`
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
