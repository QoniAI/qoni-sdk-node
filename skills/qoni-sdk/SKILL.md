---
name: qoni-sdk
description: Use when building, testing, debugging, or documenting Node.js integrations with @qoniai/qoni, the Qoni constructor, AK/SK credentials, delegateToken, GenAuth hosted sign-up/sign-in (genauth.auth.createLoginUrl/exchangeLoginCode), currentUser/userInfo/introspection/Authing v3 management, Qoni runtime-config discovery, GUMem, WebAgent, Web Search, Do Anything, Deep Research, Track, OBO product token exchange, or local .genauth.localhost SDK flows.
---

# Qoni SDK

> This guide documents `@qoniai/qoni` 0.10.1: `run()`/`create()` return handles
> (`RunHandle` / `MonitorHandle`), events are normalized (`event.type`, camelCase
> `data`), and 1:1 wire methods live under `qoni.<product>.api.*`. Install
> `@qoniai/qoni@^0.10.1`; older versions do not match the code below.

## Limits To Respect

- JSON POSTs are not retried automatically. `retryable` is not replay permission, and 202/pending does not mean completed. Read the original resource or run back where supported; do not replace an unknown write with a new key, card or Task.
- `doAnything.runWithMemory()` returns `{ run, memory }` and explicitly opts into recall; ordinary `run()` never recalls. Its errors carry `phase` (`recall`, `task_permission`, `task_submit`); once the Task POST is dispatched without a definitive answer it raises `QoniTaskSubmissionUnknownError` (`task.submit_unknown`, `submissionUnknown: true`, `retryable: false`). Never replay it automatically.
- After a user narrows or revokes consent, stop scheduling calls that need the removed scopes and respect the denial. Never silently broaden a grant, swap identity/App, or invent `genauth.consents.revoke()`. Stopping a local wait does not stop server work.

## Core Contract

Use `@qoniai/qoni` from trusted server-side Node.js code. Keep AK/SK on the server and create one reusable `Qoni`. For silent runtime product calls, resolve a real GenAuth user id from the credential-bound userpool, call `delegateToken`, then pass `delegation.data.token` explicitly to every product capability call. For interactive runtime authorization, call `delegateToken({ mode: "interactive", redirectUri, state, agent, scopes })` from the server without exposing AK/SK; redirect the user to `authorizationUrl`, then handle the business callback server-side with `completeDelegateToken({ grantId, code, state })` to receive the token. For GenAuth management, use `qoni.genauth` domain namespaces (such as `users`, `roles`, `groups`, `organizations`, `applications`) or the Authing-name migration entry `qoni.genauth.management`; the SDK exchanges AK/SK for a standard GenAuth management token internally and does not require `QONI_USER_ID`.

```ts
import { Qoni, QoniScopes } from "@qoniai/qoni";

const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
  host: process.env.QONI_HOST, // Qoni Console/SDK gateway; optional in hosted Qoni.
});

const user = await qoni.currentUser<{ id: string; subject?: string; name?: string }>({
  accessToken: genauthAccessToken,
});

// `products` expands to each product's scope set; `agent` defaults to "sdk".
// Scope strings are pre-validated locally — a missing service prefix throws
// QoniValidationError with the correct form before any request is sent.
const delegation = await qoni.delegateToken({
  user: user.data,
  products: ["doAnything"],
  scopes: [QoniScopes.GUMEM_MEMORY_READ, QoniScopes.GUMEM_MEMORY_WRITE],
  mode: "silent",
});

if ("authorizationUrl" in delegation.data) {
  throw new Error("This server flow requires silent delegation");
}

const token = delegation.data.token;

await qoni.gumem.createSession({
  token,
  userId: String(user.data.id),
  sessionId: "account-research",
});

const memory = await qoni.gumem.recall({
  token,
  sessionId: "account-research",
  query: "What should the assistant remember?",
});

// run() returns a RunHandle; the token is held by the handle from here on.
const run = await qoni.doAnything.run({
  token,
  prompt: "Open the target site and summarize product changes.",
});
const result = await run.wait({
  onInteraction: (handle) => handleInteraction(handle), // see "Do Anything Interactions"
});
console.log(result.output);
```

For explicit authorization, the Qoni Console/BFF owns GenAuth login and grant completion before it redirects back to the business `redirectUri`. The redirect only carries one-time callback fields: `code`, `grant_state`, and your business `state` when you supplied one. It does not carry `grantId`; load the `grantId` you saved by `grant_state`. Never design an API that exposes a delegation token to browser code.

```ts
const grant = await qoni.delegateToken({
  mode: "interactive",
  redirectUri: "https://app.example.com/qoni/callback",
  state: "business-csrf-state",
  agent: "research-assistant",
  scopes: [QoniScopes.GUMEM_MEMORY_READ],
});

// The callback carries code, state (your business state) and grant_state, but no grantId.
await savePendingGrant(grant.data.grantState, { grantId: grant.data.grantId, businessState: "business-csrf-state" });
redirectUserTo(grant.data.authorizationUrl);

// Callback handler: look up by grant_state, check the business state, then exchange.
const pending = await loadPendingGrant(callback.grant_state);
if (!pending || callback.state !== pending.businessState) throw new Error("Invalid delegation callback");
const completed = await qoni.completeDelegateToken({
  grantId: pending.grantId,
  code: callback.code,
  state: callback.grant_state,
});
```

`delegateAgent` and `completeDelegateAgent` remain deprecated compatibility names. Use `completeDelegateToken` for interactive callbacks; the current callback contract is `{ grantId, code, state }`, not the old `{ code, state }` shape.

## Runtime Discovery

- `host` points to the Qoni Console/SDK gateway, not directly to GenAuth, GUMem, or WebAgent.
- The SDK signs `GET /api/v3/eak/runtime-config` with AK/SK, caches returned service URLs, and routes downstream calls internally.
- Signed routes live under `/api/v3/eak/*`, and some wire values keep their original names (`eak_delegation_token`, `eak_tenant_id`, `eak.*` error codes). Do not teach callers to construct these values.
- Do not configure `genauthBaseUrl`, `gumemBaseUrl`, `webAgentBaseUrl`, or `qoniBaseUrl` in normal integrations. The one exception is an app without the AccessKey: it passes `webAgentHost` from `webAgentGrant` (see below).
- Product namespaces require an explicit `token` field. The SDK does not read a constructor-level token or `delegateAgent` config.
- The online delegation API currently expects `agent` to be a string id, for example `agent: "memory-agent"`. Do not teach object-shaped Agent metadata unless the backend API has been updated to accept it.

## Token Roles

- GenAuth access token: proves the logged-in user to `currentUser` and `genauth.userInfo`.
- Qoni-derived GenAuth management token: produced internally by SDK-managed `POST /api/v3/eak/genauth/admin-token` with body `{}` for `genauth.users.*`; application code should not supply or persist it in normal flows.
- Qoni delegation token: returned directly by silent `delegateToken`, or by server-side `completeDelegateToken({ grantId, code, state })` after an interactive grant; pass it as `token` to GUMem/WebAgent/Web Search/Do Anything/Track calls.
- Product access token: produced by the SDK through `/api/v3/eak/token-exchange` when a raw Qoni delegation token is used for a product call. Do not hand-roll this exchange in application code.
- Direct product token: acceptable only when a product service already issued it or a test is intentionally bypassing delegation.

## Apps That Hold No AccessKey

When a platform serves many apps, keep the AccessKey on the platform server and give each app only the token of the person using it. On the server that keeps the AccessKey, after its own sign-in has confirmed the person:

```ts
const grant = await qoni.webAgentGrant({
  userId, // a user in the user pool bound to this workspace
  products: ["doAnything"],
  scopes: [QoniScopes.SITE_LOGIN_REQUEST, QoniScopes.SITE_LOGIN_CONFIRM, QoniScopes.BROWSER_USE_TAKE_CONTROL],
});
// { token, expiresAt, webAgentHost, userId, scopes } — hand it to the app
```

In the app, build the client without keys and pass the granted token to each call:

```ts
const app = new Qoni({ webAgentHost: grant.webAgentHost });
const run = await app.doAnything.run({ token: grant.token, prompt });
```

- Delegation is silent (no consent page); the person must already be in the workspace's user pool, and the AccessKey policy must allow every requested scope (`eak.delegation.scope_not_allowed` otherwise).
- Only `webagent.*` scopes can be granted. The token is accepted until `expiresAt` (about 14 days); issue a new grant before then. Runs it starts are billed to the workspace.
- The keyless client runs `doAnything`, `webSearch`, `deepResearch`, `track`, `proactive`, `notifications` and `workspace`. Delegation, token exchange, GenAuth management and GUMem throw `QoniValidationError` locally, before any request.
- Never call `webAgentGrant` with a user id the app sent you; resolve the person from the platform's own session.

## Management Plane Vs Runtime

Use AK/SK-backed `genauth.users.*` for GenAuth management-plane user CRUD. This is not a GUMem/WebAgent runtime capability and does not use `delegateToken` or `QONI_USER_ID`. The SDK exchanges AK/SK through Qoni for a standard GenAuth management token, then attaches `Authorization` and `x-authing-userpool-id` automatically:

```ts
await qoni.genauth.users.list({ page: 1, limit: 20 });

await qoni.genauth.users.create({
  username: "sdk-demo-user",
  password: process.env.GENAUTH_DEMO_USER_PASSWORD!,
});
```

## Hosted Sign-Up And Sign-In

For end-user sign-up/sign-in, call `qoni.genauth.auth.createLoginUrl({ redirectUri, state, screen? })` on the server, keep `state` in your own session, and redirect the browser to `url`. In the callback, compare `state` yourself before calling `qoni.genauth.auth.exchangeLoginCode({ code, redirectUri })`; the SDK never validates `state`. The AccessKey must be bound to a registered business app whose redirect URIs contain `redirectUri` exactly.

- Do not pass `clientId`, client secrets, issuer or token URLs: undeclared fields are rejected before HTTP. Secrets, PKCE verifier and nonce stay in GenAuth.
- `expiresAt` is fixed at creation (600 seconds) and is not extended by reopening, MFA or new sessions. Each URL completes once and each code exchanges once; on any exchange failure or unknown outcome, start a new `createLoginUrl`. The SDK does not retry.
- `user.isNewUser` comes from the actual registration in this sign-in (true only when the account was registered in the same hosted-page window that completes it); never derive it from timestamps or `screen`. `error=access_denied` on the callback means start again.
- GA business errors are HTTP 200 envelopes (for example `eak.hosted_login.code_invalid`, `eak.credential.binding_mismatch`, `eak.hosted_login.unavailable` when the server is not configured) and surface as typed `QoniError`s.

Use `delegateToken` output for runtime capability namespaces:

- `gumem.createSession`, `gumem.addMessages`, `gumem.recall`, `gumem.recallContext`, `gumem.actions.*`
- `webSearch.run/attach` → `RunHandle`
- `doAnything.run/attach` → `RunHandle`; `doAnything.sessions.*`, `doAnything.browsers.*`, `doAnything.files.*`
- `deepResearch.run/attach` → `RunHandle`
- `track.create/attach/list` → `MonitorHandle`
- `proactive.*` (follow-ups), `notifications.*`, `workspace.credits` / `workspace.billingUrl`
- Wire-level escape hatch: `qoni.<product>.api.*` (1:1 backend HTTP methods; shapes may evolve with the API)

## Run Handles (doAnything / webSearch / deepResearch)

`run(input)` returns a `RunHandle` — the same shape for all three products. The token is passed once at the entry call; handle methods never take a token or ids.

```ts
const run = await qoni.doAnything.run({
  token,
  prompt: "Open https://example.com and summarize the page, then finish.",
  limits: { maxDurationMinutes: 10 },
  // session: prior.sessionRef,            // reuse a session / DR follow-up run
});

run.id;
run.sessionRef;                            // pass back to run({ session })
await run.status();                        // refresh current state
run.interactionHandle(event.data);         // wrap an interaction event; answer via its methods
await run.cancel(reason?);                 // idempotent — safe on a finished run

const result = await run.wait({
  timeoutMs: 180_000,                      // throws QoniTimeoutError on elapse; run keeps going server-side
  onEvent: (e) => console.log(e.type),
  onWireEvent: (e) => appendRawEvidence(e), // every SSE frame before semantic filtering
  onReconnect: (info) => logReconnect(info.attempt, info.lastEventId),
  onInteraction: (handle) => handleInteraction(handle), // typed InteractionHandle
});
// result: { runId, status: "succeeded"|"failed"|"canceled", output?, artifacts,
//           terminalReason?, isTaskSuccessful?, raw }
// result.raw is the full run-detail envelope — total_cost_usd, step_count, tokens.
// result.artifacts: deepResearch deliverables (id/name/mime, content() fetches bytes lazily);
// empty array for the other products.

const sameRun = await qoni.doAnything.attach(run.id, { token, session: run.sessionRef });
// webSearch / deepResearch attach without session: qoni.deepResearch.attach(runId, { token })
```

### Semantic events

`run.events()` is an `AsyncIterable<RunEvent>` that ends automatically at the terminal event and reconnects dropped streams internally (`Last-Event-ID` catch-up; tune with `sseMaxRetries`, default 5).

```ts
import { QoniEventTypes } from "@qoniai/qoni";

for await (const event of run.events()) {
  // event.type ∈ QoniEventTypes (curated): Progress | Message | Interaction
  //   | Browsers | BrowserLiveUrlChanged | Done (core, any product)
  //   + ResultsReady (web search) + Phase | SectionReady (deep research).
  //   Each product handle is typed to its own subset. Internal wire types fold
  //   into Progress; the raw wire string is event.raw.event.
  //   event.data per type: simple events → the value itself (progress=string,
  //   resultsReady=number); rich events → a small object: message =
  //   { id, role, text, delta, done, final, stopReason? } (a streamed reply's
  //   pieces share id and text is the whole reply so far),
  //   done = { output, succeeded, terminalReason }.
  event.type;
  event.runId;
  event.at;         // ISO 8601
  event.isTerminal; // true only for Done
  event.data;       // flat camelCase payload, narrowed by type
  event.raw;        // original wire event (escape hatch)
}
```

- Unmapped wire event types surface as `progress` (nothing is silently dropped); the wire shape stays on `event.raw`.
- Terminal events of internal sub-runs are demoted to `progress`, so they never end your iterator; only YOUR run's terminal ends it.
- The terminal event payload is lean — `wait()` settles from the run-detail envelope, so prefer `result.raw` for `total_cost_usd` / `step_count` / token counts.
- For a complete Agent/tool audit trail, pass `onWireEvent` to `events()` or
  `wait()`. It receives every original SSE frame before semantic filtering;
  `onReconnect` exposes resumable-stream retry telemetry. Never serialize the
  delegation token alongside that evidence.

### Wire-level stream (escape hatch)

`qoni.doAnything.api.events({ token, sessionId, runId, signal?, lastEventId?, onlyTopLevel? })` yields raw `{ id?, event, data }` wire events: the type is a raw string on `event.event` (e.g. `"run.status_changed"`), the payload is `event.data.data` (snake_case), and `event.data.task_id` identifies the run. `run.status_changed` payloads carry the new status in `.to` (NOT `.status`). Terminal detection is `event.event === "run.completed"`. Wire names are internal and may evolve — prefer the high-level `run.events()` + `event.type` instead.

## Track and deprecated snapshot reads

Use `track.create({ token, prompt, schedule, title? })` with an explicit
`{ kind: "interval", intervalSeconds: N }` (integer 600–2592000 seconds) or
`{ kind: "daily", at: "HH:MM", tz: "Area/City" }`. Daily starts 0–30 minutes
before the target. Prompt maps to instructions; include URLs there. No default
schedule is inferred, and arbitrary cron is rejected with a daily alternative.

The historical `MonitorHandle` name remains. `get()` normalizes the real Track
record: known schedule shapes convert without write-bound/Intl revalidation;
unknown/incomplete wire schedules stay verbatim. Input validation remains strict.
`pause()`/`resume()` PATCH status; pause keeps any started check running.
`refine()` accepts title/schedule only and cannot change instructions.
`runNow()` returns `{ trackId, sessionId, runId }` (202 acceptance); it can
surface 409 task_in_progress. `runs({ limit?, offset? })` slices the newest 50
checks locally; `run(id)` searches that exact window and reports its range on
not_found. Keep real status/outcome/headline/answer/failure, never invent
extracted/diffs/snapshotId. `delete()` soft-deletes without cancelling a running task.

Create starts a first_look immediately. Capture the original initial lastTaskId,
wait for that exact check to terminate, then call runNow once; never retry 409
implicitly or substitute another check. Checks keep `running/done/failed/expired/
canceled`; success is done, distinct from RunResult.status succeeded. A missing
check in the recent window is local not_found without an HTTP status; a missing
Track is backend 404 track_not_found.

The example uses the reusable qoni client and delegated token from Core Contract:

```ts
import type { MonitorSchedule } from "@qoniai/qoni";

const monitor = await qoni.track.create({
  token,
  prompt: "Watch https://example.com/policy and report changes.",
  title: "Policy changes",
  schedule: { kind: "interval", intervalSeconds: 3600 },
}); // create immediately starts a first_look check
const initial = await monitor.get();
const firstRunId = initial.lastTaskId; // capture this original ID once
if (typeof firstRunId !== "string" || !firstRunId) throw new Error("Missing initial lastTaskId");
const sameMonitor = await qoni.track.attach(monitor.id, { token });

async function waitForCheck(runId: string) {
  const deadline = Date.now() + 300_000;
  do {
    const check = await monitor.run(runId); // exact ID in the recent 50 checks
    if (["done", "failed", "expired", "canceled"].includes(String(check.status))) {
      if (check.status !== "done") throw new Error(`Check ${runId} ${String(check.status)}: ${String(check.failure ?? "")}`);
      return check;
    }
    await new Promise(resolve => setTimeout(resolve, Math.min(1000, Math.max(0, deadline - Date.now()))));
  } while (Date.now() < deadline);
  throw new Error(`Check ${runId} timed out`);
}

try {
  await monitor.pause(); // pause future scheduling; the first look continues
  await waitForCheck(firstRunId);
  await monitor.refine({ schedule: initial.schedule as MonitorSchedule }); // our known, validated input roundtrips
  await monitor.refine({ schedule: { kind: "daily", at: "09:00", tz: "Asia/Singapore" } });
  const task = await monitor.runNow(); // one explicit manual check while scheduling is paused
  const check = await waitForCheck(task.runId); // 202 acceptance is not completion
  const checks = await monitor.runs({ limit: 10, offset: 0 });
  await monitor.resume();
} finally {
  await monitor.delete(); // soft-delete; any in-flight check continues
}
```

Wire API mapping (all supported routes use `/track/tracks`, not `/monitors`):

| Method | Contract |
| --- | --- |
| createMonitor / getMonitor | POST / GET Track; create uses instructions/title and wire schedule every_seconds or daily_at/tz. |
| updateMonitor | PATCH title/instructions/schedule/status; raw instructions is supported, high-level refine is stricter. |
| runNow / deleteMonitor | POST run_now returns track_id/session_id/run_id; DELETE returns empty 204. |
| listRuns / getRun | GET checks, local pagination/exact lookup within the recent 50. |
| api.events / MonitorHandle.events | Stream the track's checks live from its own session; each check is a run ending with its `done`. |
| api.intervene / interactionHandle | Deprecated; local QoniUnsupportedError, zero HTTP. No Track scope authorizes DoAnything actions. |

Legacy targetUrls/extractionSchema/triggerDsl/stopConditionDsl/notifyChannel
(including snake_case) and url are unsupported local errors, never folded into
instructions. Cron and legacy event/option types remain exported, deprecated.
Invalid or missing input schedules raise QoniValidationError before HTTP.
Optional undefined keys keep their original omission behavior; defined
unsupported values (including null) are still local errors. Interval tz, when
specified, is an invalid schedule and raises QoniValidationError.

`doAnything.api.readArtifacts` and DoAnythingSnapshot/SnapshotImage/SnapshotAction
are deprecated: no backend snapshot route/source exists. The method raises
local QoniUnsupportedError (`unsupported.operation`), zero HTTP. Read actual
files with `qoni.doAnything.artifacts({ token, runId })` / api.listArtifacts and download via
artifact.content()/api.artifactDownloadUrl. A text artifact is not a
snapshot. Deprecated unsupported negatives never count as positive capability coverage.

## Do Anything Interactions (human handoff)

When a run needs the user it pauses and emits one `interaction` event per request (`event.data` is a typed `Interaction`; `wait({ onInteraction })` hands you an `InteractionHandle`). Interactions are typed by what the user must do, never by business: `site_login`, `take_control`, `ask_user`, `confirmation`, `fill_form`, plus the system `wait`. `switch (handle.interaction.type)` narrows `payload` per branch.

- Act only on `status === "pending"` and dedupe by `interaction.id`: creation, status changes and reconnect replays all call back again with the same `id` and `type`. Updates with real content replace the card (an `active` take-over carries a new `liveUrl`); only empty settling shells keep the original `payload`.
- Follow each interaction's declared actions and current state. A pending input question may coexist with a browser-control round. A sign-in ask ends only when `confirmSignedIn()` has saved the login, the user calls the declared `skip()`, or it expires; handing the browser back does not answer it. Questions and confirmations are never answered automatically.
- `site_login`: `openLogin()` → show `liveUrl` → after the user signs in, `confirmSignedIn()`. Do NOT call the deprecated `login.confirm()` first. The login is saved for this user's later tasks and the agent checks the page before it continues. Opening needs `SITE_LOGIN_REQUEST` + `BROWSER_USE_TAKE_CONTROL`; confirming needs `SITE_LOGIN_CONFIRM` + `BROWSER_USE_TAKE_CONTROL` + `DO_ANYTHING_MANAGE`. A 409 (including `no_pending_login`) means the card is no longer current: show the newer interaction, never fetch or swap IDs.
- `fill_form`: render `payload.fields` and call `submit(values)` only when declared. Keep exact field names and option values, finite numbers, and ordinary address objects `{line1,line2?,city?,region?,postalCode?,country?}`. Required text/address.line1 must be nonempty; `0` and optional empty text are valid. Forms never collect passwords or payment details; the user enters those in the live browser.
- `ask_user`: `answer(value)` with the type `payload.answerType` names (`text` string, `number`, `boolean`, `single_choice` option value, `multiple_choice` array of option values), or `skip()`. The wire's `clarification` arrives as `ask_user`; never switch on `"clarification"`.
- `take_control`: `connectControl()` only when `handle.can("connect_control")`; it resolves to `{ liveUrl, expiresAt }` (show that URL, else `payload.liveUrl`) → `releaseControl()`. `refreshControl()` returns a fresh URL. Explicitly delegate `QoniScopes.BROWSER_USE_TAKE_CONTROL` (`webagent.browser_use:take_control`) for all three methods; product `manage` and `products` bundles exclude it. Allow it in the AccessKey policy and request it in the delegation before creating the run whose token this handler uses.
- `confirmation`: `confirm()` or `reject()` after showing `payload.summary`.
- Only call methods `handle.can(kind)` reports; an undeclared action throws.

For a task that may initiate human control, create it with `taskScopes: [QoniScopes.BROWSER_USE_TAKE_CONTROL]` in `doAnything.run()` (or `api.createRun()` / `runWithMemory()`). Add specific site-login scopes only when required and already authorized. Default task creation requests manage only; delegation scope alone does not enlarge the task's original authority. `taskScopes` is SDK-only and requires known concrete Web Agent scopes. Direct product tokens cannot gain authority through it.

For raw `doAnything.api.intervene()` control calls, pass `interactionId` (wire alias `interaction_id`) captured for that round. Refresh/release require it; a first user-initiated take may omit it only without an active marker, while reconnecting to an active round requires its exact ID. Take and refresh responses contain `data.interaction_id`; use the exported `DoAnythingControlResponse` type and save that field. Missing or stale IDs reach the server and return 409; do not fetch the current ID and retry, and do not rebind an old `ControlSession` to a new card. Invalidate the stale UI and wait for a separate user action on a new interaction. Card methods already carry their declared path ID. `requestId` is for input questions, not control rounds. Conflicting aliases or explicit non-string/empty IDs fail SDK validation before HTTP; omission is forwarded for server enforcement.

Raw input answer/skip calls must target the current persisted pending request and its declared action; stale or undeclared actions return 409. Use the declared confirmation/sign-in methods, not ordinary answers or skips as substitutes.

Recall filters: `metadataFilters` is sent inside `recall_config.metadata_filters`. Matching aliases merge; conflicts, null/non-scalar/non-finite values and normalized system keys (`project_id`, `group_id`, `user_id`, `thread_id`, `session_id`, `scope`, `expired_at`, `validity`) throw `QoniValidationError` before HTTP. Other config keys pass through unchanged.

```ts
const result = await run.wait({
  onInteraction: async (handle) => {
    const request = handle.interaction;
    if (request.status !== "pending" || handled.has(request.id)) return;
    handled.add(request.id);
    switch (request.type) {
      case "site_login": {
        const login = await handle.openLogin();
        await showToUser(login.liveUrl);       // resolves when the user says "I'm signed in"
        await handle.confirmSignedIn();
        break;
      }
      case "ask_user":
        await handle.answer(await askUser(request.payload));
        break;
      case "confirmation":
        await handle.confirm();
        break;
    }
  },
});
```

## Run Lifecycle & State Machine

A run's `status` (on `status` events and `run.status()`) moves through:

```
pending → running → (running ⇄ awaiting_input)* → succeeded | failed | canceled
```

- `pending` — accepted, not started.
- `running` — the agent is working.
- `awaiting_input` — parked. The `waiting_reason` (`human_intervention`,
  `confirmation_required`, `user_paused`, `sleep_until`, `external_signal`) is
  informational; do NOT branch your control flow on it.
- `succeeded` / `failed` / `canceled` — terminal (`run.completed`; outcome in
  `terminal_reason` / `is_task_successful`).

**Client action is event-driven, not status-driven.** The only thing that needs
you is an `interaction` event (see Do Anything Interactions). A run flapping
`running ⇄ awaiting_input` (e.g. `waiting_reason=confirmation_required` during
internal pacing) is expected — do NOT poll; act only on pending interactions.

### Parent & sub-tasks

One `run()` can spawn internal sub-runs (planning / grading). The semantic
stream demotes sub-run terminals to `progress` and reports each event's owner
on `event.runId`, so your iterator only ends on YOUR run's terminal. On the
wire-level stream (`api.events`), each event's run id is `event.data.task_id`;
filter `event.data.task_id === run_id` (or pass `onlyTopLevel: true`) to keep
only your run's events. A run envelope's `parent_run_id` / `depth` identify
where it sits in the hierarchy.

## Local GenAuth And Docker

For local stacks, first pin the real service boundary:

1. `QONI_HOST` should normally be the local Qoni Console/BFF gateway, for example `http://127.0.0.1:3100`.
2. Confirm `GET /api/v3/eak/runtime-config` returns the GenAuth userpool issuer plus GUMem/WebAgent URLs that the product services validate.
3. If a request URL ends with `.genauth.localhost`, the SDK rewrites it to `127.0.0.1` and preserves the original `Host` header. Set `QONI_LOCAL_GENAUTH_TARGET_HOST=host.docker.internal` when the target must be reached from a containerized product service. Set `QONI_LOCAL_GENAUTH_REWRITE=false` only when DNS already resolves correctly.
4. If runtime-config works but `delegateToken` returns 403, inspect user binding, scope/resource binding, tenant binding, and any `apiCode` such as `eak.delegation.user_not_bound`.
5. If GUMem/WebAgent says `direct delegation token deprecated`, the integration is bypassing the SDK-managed product token exchange or calling the product service with a raw delegation token directly.

## Common Mistakes

- Do not put `delegateAgent`, user ids, or product tokens in the constructor.
- Do not call `qoni.gumem.*`, `qoni.webSearch.*`, `qoni.doAnything.*`, or `qoni.track.*` without `token`.
- Do not pass Agent metadata objects to `delegateToken`. Use a string Agent id such as `agent: "memory-agent"`; scopes and resource bindings carry permission.
- Do not invent `user.id`. Silent mode needs a real GenAuth user or the value returned by `currentUser`; interactive mode can omit `user`/`userId` because Console/BFF resolves the user through GenAuth login.
- Do not pass a long-lived GenAuth admin token to `genauth.users.*` in normal server integrations. Use AK/SK and let SDK call Qoni's admin-token endpoint with body `{}`.
- Do not add `resource`, `actions`, `expiresIn`, or `QONI_USER_ID` to the GenAuth admin-token exchange.
- Do not expose AK/SK or delegated tokens to untrusted browser/mobile/public CLI code. Interactive callbacks exchange only `grantId`, `code`, and `state` on the business server.
- Do not commit real AK/SK, GenAuth access tokens, product tokens, cookies, or LLM keys.

## Real Smoke Inputs

For a real hosted GUMem smoke, require:

- `QONI_ACCESS_KEY` and `QONI_SECRET_KEY` — the only mandatory inputs.
- Optional `QONI_USER_ID`, a real user from the GenAuth userpool bound to the Qoni credential. A delegation token is always bound to a real user, but you do not have to supply this: with only AK/SK, call `qoni.resolveAnyBoundUser()` (lists the bound userpool and returns the first user id) — that is exactly what a smoke needs. Set `QONI_USER_ID` only to pin a specific user or skip the lookup. A placeholder like `user_1` fails with `eak.delegation.user_not_bound` (the SDK appends a hint pointing at `resolveAnyBoundUser` / `currentUser`). In real app code, resolve the actual logged-in user via `currentUser` instead of picking the first userpool member.
- Optional `QONI_HOST`; use it only for private or local Qoni deployments.
- Optional `QONI_AGENT_ID`; default examples can use `memory-agent`, but the credential and product binding must allow the requested scopes.

If the first real request fails:

| Error | Meaning | Next step |
| --- | --- | --- |
| `agent must be a string` | The online delegation API expects a string Agent id. | Use `agent: "memory-agent"`. |
| `eak.delegation.user_not_bound` | The user id is not in the credential-bound userpool. | Resolve the real user via `currentUser` or the same GenAuth userpool. |
| `eak.genauth.userpool_binding_missing` | The AK/SK is not bound to a GenAuth userpool. | Bind the Qoni credential to the target GenAuth userpool before `genauth.users.*`. |
| `eak.genauth.userpool_owner_missing` | The bound userpool owner cannot be resolved. | Fix the GenAuth userpool owner data or binding. |
| `eak.token_exchange.upstream_failed` with `unauthorized_client` or `grant_type is not enabled` | Delegation succeeded, but the managed delegation app is missing token-exchange grant support or has drifted from the tenant binding. | Repair the managed delegation app binding before calling GUMem or WebAgent product capabilities. |
| `delegation.required` | A product namespace call omitted `token`. | Pass `delegation.data.token`. |
| `direct delegation token deprecated` | The app bypassed SDK-managed token exchange. | Call GUMem/WebAgent through the SDK namespace. |

## Testing And Verification

For SDK changes, run in the SDK repo:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm pack --dry-run
```

For skill or docs changes that teach integration, also validate from a fresh consumer project:

1. Pack the current SDK into a temporary directory with `pnpm pack --pack-destination <tmp-dir>`.
2. Create a clean Node.js 18+ TypeScript project outside the SDK repo.
3. Install the packed tarball.
4. Add a small mocked integration that imports from `@qoniai/qoni`, constructs `Qoni`, returns runtime-config from `host`, calls `delegateToken`, passes `delegation.data.token` to GUMem/WebAgent calls, and asserts product token exchange plus WebAgent tenant routing. Also cover `genauth.users.list()` by mocking `POST /api/v3/eak/genauth/admin-token` with body `{}` and a returned `userPoolId`.
5. Run the consumer project's typecheck and test command.

Prefer mocked fetch-based tests for normal verification. Use real GenAuth/GUMem/WebAgent services only for explicit smoke tests, and never hard-code real secrets in repository files.

## Authing v3 management additions

The SDK provides 591 typed JSON management methods in 35 namespaces, aligned with the official Authing Node SDK 4.0.2 (496 JSON methods) plus GenAuth extensions and compatibility names. Read `docs/genauth-management.md` and `docs/genauth-management-api.md` for exact methods, aliases, inputs and deployment-dependent rules. Preserve the Qoni management-token exchange; do not use a delegated runtime token for management calls.

- Use `genauth.users.iterate` for paginated user processing (limit 1-50); pass cancellation in the optional second argument.
- Roles and resources belong to an existing permission namespace. Resource action names use `resourceCode:action`; newer permission deployments require `apiIdentifier` for API resources.
- `customFields.set` requires `dataType` for both create and update. `customFields.list` defaults the subject to `USER`.
- HTTP-200 business errors throw typed Qoni errors, including numeric Authing API codes as strings. Do not replay writes after network or business failures.
- Respect employment rules: resign a user only when departure is intended. The SDK never automatically resigns users to make deletion succeed.
- Filtered user queries depend on the GenAuth search index. A successful `get` or batch lookup does not prove that a newly created user is searchable. Keep search acceptance failures visible and diagnose the server index separately.
- Run `pnpm test:e2e:genauth` using an isolated test userpool; cleanup failures fail the suite. Generated contract coverage does not imply live acceptance of every operation.
