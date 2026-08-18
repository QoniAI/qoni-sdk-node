# Changelog

All notable changes to `@qoniai/qoni` are documented in this file.

This project follows semantic versioning. Before `1.0.0`, minor versions may
include SDK API changes, while patch versions are reserved for backward
compatible fixes.

## Unreleased

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
- Rename the primary constructor and all branded exports to `QoniAgentKit`,
  `Qoni`, and the corresponding `Qoni*` types, constants, and error classes.
- Rename the product namespace to `client.qoni`, environment variables to
  `QONI_*`, and SDK gateway routes to `/api/v3/qoni/*`.
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
  delegation throws `qoni.delegation.user_id_required`. Corrected to
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
- Onboarding hints: errors for `qoni.delegation.user_not_bound` and
  `qoni.genauth.userpool_binding_missing` now append a one-line, actionable hint
  to the message (e.g. pointing at `resolveAnyBoundUser` / `currentUser`).
- `QoniError.code` is now typed as `QoniErrorCode` — a union of the known SDK /
  backend codes plus `(string & {})` — so you get literal autocomplete and can
  write an exhaustive `switch (err.code)` while still tolerating new backend
  codes. Exported as `QoniErrorCode`.

## 0.1.0 - 2026-06-02

Initial public release of `@qoniai/qoni`.

### What ships

- Server-side `QoniAgentKit` constructor for Qoni Agent delegation and product
  runtime calls.
- Runtime service discovery from the Qoni Console gateway through
  `GET /api/v3/qoni/runtime-config`.
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

- `Qoni` remains available as a short constructor alias.
- `delegateAgent` and `completeDelegateAgent` remain available as deprecated
  aliases for older integrations, but new integrations should use
  `delegateToken`.
