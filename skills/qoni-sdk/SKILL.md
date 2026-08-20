---
name: qoni-sdk
description: Use when building, testing, debugging, or documenting Node.js integrations with @qoniai/qoni, the Qoni constructor, AK/SK credentials, delegateToken, GenAuth currentUser/userInfo/introspection/user management, Qoni runtime-config discovery, GUMem, WebAgent, Web Search, Do Anything, Deep Research, Track, OBO product token exchange, or local .genauth.localhost SDK flows.
---

# Qoni SDK

> **Requires `@qoniai/qoni` ≥ 0.4.0.** This guide documents the semantic-layer
> surface: `run()`/`create()` return handles (`RunHandle` / `MonitorHandle`),
> events are normalized (`event.type`, camelCase `data`, decoded screenshots),
> and the 1:1 wire methods live under `qoni.<product>.api.*`. If the consumer
> resolves an older version from npm, install this repo's local build instead
> (`npm install <path-to-qoni-sdk-node>` or a `pnpm pack` tarball) — otherwise
> the code below will not match the installed SDK.

## Core Contract

Use `@qoniai/qoni` from trusted server-side Node.js code. Keep AK/SK on the server and create one reusable `Qoni`. For silent runtime product calls, resolve a real GenAuth user id from the credential-bound userpool, call `delegateToken`, then pass `delegation.data.token` explicitly to every product capability call. For interactive runtime authorization, call `delegateToken({ mode: "interactive", redirectUri, state, agent, scopes })` from the server without exposing AK/SK; redirect the user to `authorizationUrl`, then handle the business callback server-side with `completeDelegateToken({ grantId, code, state })` to receive the token. For GenAuth user management, call `qoni.genauth.users.*`; the SDK exchanges AK/SK for a standard GenAuth management token internally and does not require `QONI_USER_ID`.

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
  capture: { screenshots: true },
});
const result = await run.wait({
  onScreenshot: (img, i) => saveImage(`step-${i}.jpg`, img.bytes),
  onInputRequest: (req) => openForUser(req.liveUrl),
});
console.log(result.output);
```

For explicit authorization, the Qoni Console/BFF owns GenAuth login and grant completion before it redirects back to the business `redirectUri`. The redirect only carries one-time callback fields such as `code`, `state`, and `grant_state`/`grantId`; never design an API that exposes a delegation token to browser code.

```ts
const grant = await qoni.delegateToken({
  mode: "interactive",
  redirectUri: "https://app.example.com/qoni/callback",
  state: "business-csrf-state",
  agent: "research-assistant",
  scopes: [QoniScopes.GUMEM_MEMORY_READ],
});

redirectUserTo(grant.data.authorizationUrl);

const completed = await qoni.completeDelegateToken({
  grantId,
  code,
  state,
});
```

`delegateAgent` and `completeDelegateAgent` remain deprecated compatibility names. Use `completeDelegateToken` for interactive callbacks; the current callback contract is `{ grantId, code, state }`, not the old `{ code, state }` shape.

## Runtime Discovery

- `host` points to the Qoni Console/SDK gateway, not directly to GenAuth, GUMem, or WebAgent.
- The SDK signs `GET /api/v3/eak/runtime-config` with AK/SK, caches returned service URLs, and routes downstream calls internally.
- Public package/API identifiers use Qoni, but the deployed server wire contract has not migrated. Keep `/api/v3/eak/*`, `eak_delegation_token`, `eak_tenant_id`, and backend `eak.*` error codes unchanged; do not teach callers to construct these internal values.
- Do not configure `genauthBaseUrl`, `gumemBaseUrl`, `webAgentBaseUrl`, or `qoniBaseUrl` in normal integrations. Use those only for focused tests or migration debugging.
- Product namespaces require an explicit `token` field. The SDK does not read a constructor-level token or `delegateAgent` config.
- The online delegation API currently expects `agent` to be a string id, for example `agent: "memory-agent"`. Do not teach object-shaped Agent metadata unless the backend API has been updated to accept it.

## Token Roles

- GenAuth access token: proves the logged-in user to `currentUser` and `genauth.userInfo`.
- Qoni-derived GenAuth management token: produced internally by SDK-managed `POST /api/v3/eak/genauth/admin-token` with body `{}` for `genauth.users.*`; application code should not supply or persist it in normal flows.
- Qoni delegation token: returned directly by silent `delegateToken`, or by server-side `completeDelegateToken({ grantId, code, state })` after an interactive grant; pass it as `token` to GUMem/WebAgent/Web Search/Do Anything/Track calls.
- Product access token: produced by the SDK through `/api/v3/eak/token-exchange` when a raw Qoni delegation token is used for a product call. Do not hand-roll this exchange in application code.
- Direct product token: acceptable only when a product service already issued it or a test is intentionally bypassing delegation.

## Management Plane Vs Runtime

Use AK/SK-backed `genauth.users.*` for GenAuth management-plane user CRUD. This is not a GUMem/WebAgent runtime capability and does not use `delegateToken` or `QONI_USER_ID`. The SDK exchanges AK/SK through Qoni for a standard GenAuth management token, then attaches `Authorization` and `x-authing-userpool-id` automatically:

```ts
await qoni.genauth.users.list({ page: 1, limit: 20 });

await qoni.genauth.users.create({
  username: "sdk-demo-user",
  password: process.env.GENAUTH_DEMO_USER_PASSWORD!,
});
```

Use `delegateToken` output for runtime capability namespaces:

- `gumem.createSession`, `gumem.addMessages`, `gumem.recall`, `gumem.uploadResource`, `gumem.actions.*`
- `webSearch.run/attach` → `RunHandle`
- `doAnything.run/attach` → `RunHandle`
- `deepResearch.run/attach` → `RunHandle`
- `track.create/attach` → `MonitorHandle`
- Wire-level escape hatch: `qoni.<product>.api.*` (1:1 backend HTTP methods; shapes may evolve with the API)

## Run Handles (doAnything / webSearch / deepResearch)

`run(input)` returns a `RunHandle` — the same shape for all three products. The token is passed once at the entry call; handle methods never take a token or ids.

```ts
const run = await qoni.doAnything.run({
  token,
  prompt: "Open https://example.com and summarize the page, then finish.",
  capture: { screenshots: true },          // opt-in media; core events are always on
  limits: { maxDurationMinutes: 10 },
  // session: prior.sessionRef,            // reuse a session / DR follow-up run
});

run.id;
run.sessionRef;                            // pass back to run({ session })
await run.status();                        // refresh current state
await run.respond(requestId, response?);   // HITL answer; omit response to skip
await run.cancel(reason?);                 // idempotent — safe on a finished run

const result = await run.wait({
  timeoutMs: 180_000,                      // throws QoniTimeoutError on elapse; run keeps going server-side
  onEvent: (e) => console.log(e.type),
  onWireEvent: (e) => appendRawEvidence(e), // every SSE frame before semantic filtering
  onReconnect: (info) => logReconnect(info.attempt, info.lastEventId),
  onInputRequest: (req) => openForUser(req.liveUrl),
  onScreenshot: (img, i) => saveImage(`step-${i}.jpg`, img.bytes),
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
  // event.type ∈ QoniEventTypes (curated): Progress | Message | InputRequired
  //   | Screenshot | Done (core, any product) + ResultsReady (web search)
  //   + Phase | SectionReady (deep research) + MonitorCreated | Triggered
  //   | CheckCompleted (track). Each product handle is typed to its own subset.
  //   Internal wire types fold into Progress; the raw wire string is event.raw.event.
  //   event.data per type: simple events → the value itself (progress=string,
  //   resultsReady=number, checkCompleted=boolean); rich events → a small
  //   object (message={text,role}, done={output,succeeded,terminalReason}).
  event.type;
  event.runId;
  event.at;         // ISO 8601
  event.isTerminal; // true only for Done
  event.data;       // flat camelCase payload, narrowed by type
  event.raw;        // original wire event (escape hatch)
  if (event.type === QoniEventTypes.Screenshot) {
    event.image;    // { bytes: Uint8Array; mime; pageUrl?; step? } — data URI already decoded
  }
}
```

- Unmapped wire event types surface as `progress` (nothing is silently dropped); the wire shape stays on `event.raw`.
- Terminal events of internal sub-runs are demoted to `progress`, so they never end your iterator; only YOUR run's terminal ends it.
- `capture: { screenshots, videoFrames }` controls media events. Without `capture.screenshots`, screenshot events are neither subscribed nor delivered.
- The terminal event payload is lean — `wait()` settles from the run-detail envelope, so prefer `result.raw` for `total_cost_usd` / `step_count` / token counts.
- For a complete Agent/tool audit trail, pass `onWireEvent` to `events()` or
  `wait()`. It receives every original SSE frame before semantic filtering;
  `onReconnect` exposes resumable-stream retry telemetry. Never serialize the
  delegation token alongside that evidence.

### Wire-level stream (escape hatch)

`qoni.doAnything.api.events({ token, sessionId, runId, signal?, lastEventId?, onlyTopLevel? })` yields raw `{ id?, event, data }` wire events: the type is a raw string on `event.event` (e.g. `"run.status_changed"`), the payload is `event.data.data` (snake_case), and `event.data.task_id` identifies the run. `run.status_changed` payloads carry the new status in `.to` (NOT `.status`). Terminal detection is `event.event === "run.completed"`. Wire names are internal and may evolve — prefer the high-level `run.events()` + `event.type` instead.

## Do Anything Login Wall (human handoff)

A web task often hits a page only the end user can log in to. The agent parks and emits an **`inputRequest`** event. The live-browser URL arrives on the request payload (`event.data.liveUrl`; live-url changes also stream as `progress` events with `data.liveUrl`). The client's ONLY job is to surface that URL so the human can sign in — login detection is the BACKEND's job; it re-probes and resumes the run automatically.

- Open `liveUrl` ONCE in a real browser when you see `inputRequest`. Do NOT poll, do NOT call `respond`, do NOT wait on the window closing.
- Keep iterating (or stay inside `wait()`); the run progresses past the wall and reaches its terminal event on its own once the user is signed in.
- The first login is unavoidable; later runs reuse persisted login state and never reach this wall.

```ts
const result = await run.wait({
  onInputRequest: (req) => {
    if (req.liveUrl) openBrowserForUser(String(req.liveUrl)); // pop once; the backend resumes by itself
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
you is the `inputRequest` event (surface `liveUrl` so a human can log in /
confirm — see Login Wall). Everything else, including login walls, the backend
re-probes and resumes on its own. A run flapping `running ⇄ awaiting_input`
(e.g. `waiting_reason=confirmation_required` during internal pacing) is
expected — do NOT poll or call `respond`. Only call `respond` to answer an
actual `inputRequest`.

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
