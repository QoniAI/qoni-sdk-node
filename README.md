# @qoniai/qoni

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)](https://www.typescriptlang.org/)
[![Package manager](https://img.shields.io/badge/package%20manager-pnpm-f69220)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Unified Node.js SDK for Qoni Agent delegation, GenAuth user management, GUMem memory, WebAgent automation, web search, and monitoring.

`@qoniai/qoni` gives a trusted server one compact way to use Qoni AK/SK. For runtime product calls, your service verifies the GenAuth user, requests short-lived delegation with `delegateToken`, and then uses the returned token in GUMem, WebAgent, Do Anything, Web Search, and Track calls. For GenAuth user management, the SDK exchanges AK/SK for a standard GenAuth management token internally and calls GenAuth v3 users APIs with that token.

AK/SK credentials must stay on a trusted server. Do not ship them to browsers, mobile apps, public CLI config, or untrusted Agent runtimes.

English | [中文](./README.zh-CN.md)

[Browser handoff and embedded login (unreleased)](./docs/browser-handoff.md)

## Why Qoni

Agents that perform real work need more than a backend API key. They need a user boundary, explicit scopes, expiry, observable execution, and audit metadata that explains what happened later.

Qoni keeps that model small:

- One SDK entry: `new Qoni({ accessKey, secretKey })`.
- One discovery path: `host` can override the Qoni Console/SDK gateway for private or local deployments, and the SDK reads downstream runtime URLs from `/api/v3/eak/runtime-config`.
- One delegation entry: call `delegateToken`; silent mode returns `data.token`, while interactive mode returns an authorization URL and later completes on your server.
- One management path: call `genauth.users.*`, and the SDK exchanges AK/SK for a GenAuth management token before calling GenAuth v3 users APIs.
- Capability-first namespaces: `genauth`, `gumem`, `webSearch`, `doAnything`, and `track`.
- Readable scope strings for least-privilege authorization.
- Typed errors with `requestId`, `traceId`, `auditId`, and `retryable`.

The public package and API use the Qoni brand. The deployed server protocol has
not migrated yet, so internal signed routes remain under `/api/v3/eak/*`, the
delegation token claim remains `eak_delegation_token`, and existing `eak.*`
backend error codes are surfaced unchanged. Existing wire claims such as
`eak_tenant_id` also remain unchanged. Applications should use the public
Qoni API and must not construct these internal wire values themselves.

## Installation

```bash
npm install @qoniai/qoni
# or
pnpm add @qoniai/qoni
# or
yarn add @qoniai/qoni
```

Requirements:

- Node.js 18 or later.
- A server-side runtime with `fetch`.
- Qoni `accessKey` and `secretKey` created in Qoni Console.
- For silent runtime product calls, a real GenAuth user id from the userpool bound to the Qoni credential. For smoke tests, pass it as `QONI_USER_ID` or call `qoni.resolveAnyBoundUser()` to grab the first bound user; in application code, resolve it with `currentUser` or your existing server-side user session. Interactive delegation can start without `user` or `userId` because the Qoni Console/BFF resolves the GenAuth login during authorization.
- For `genauth.users.*` management calls, `QONI_USER_ID` is not required. The SDK uses AK/SK to request a GenAuth management token from Qoni.
- Optional `host` for private or local Qoni deployments. Leave it unset for hosted Qoni.

You do not pass `tenantId` during normal SDK initialization. The AK/SK is already bound to the tenant and application boundary in Qoni.

The package ships both ESM and CommonJS builds with TypeScript types, so either
import style works:

```ts
import { Qoni } from "@qoniai/qoni";        // ESM / TypeScript
const { Qoni } = require("@qoniai/qoni");    // CommonJS
```

## AI Skill

Qoni can also be exposed to AI coding tools through a Skill package, so Codex, Claude Code, or internal Agents can follow the same authorization model.

Install the Qoni Skill:

```bash
npx skills add https://github.com/QONIAI/qoni-sdk-node --skill qoni-sdk
```

If you only want to install it for Claude Code, specify the Agent:

```bash
npx skills add https://github.com/QONIAI/qoni-sdk-node --agent claude-code --skill qoni-sdk
```

The npm package includes the `skills/` directory, but the recommended Skill install path is still the GitHub repository command above so agents receive the repository-local skill metadata.

## Quick Start

Start with a server-side SDK instance. AK/SK stays on your trusted server for both management-plane calls and runtime product delegation.

```ts
import fs from "node:fs";
import { Qoni } from "@qoniai/qoni";

const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
});
```

### GenAuth User Management

`genauth.users.*` is a management-plane capability. It does not need `QONI_USER_ID` or `delegateToken`; the SDK signs `POST /api/v3/eak/genauth/admin-token` with `{}` internally, receives a GenAuth management token plus `userPoolId`, and then calls GenAuth v3 users APIs.

```ts
const users = await qoni.genauth.users.list({
  page: 1,
  limit: 20,
});

console.log("GenAuth users:", users.data);

const created = await qoni.genauth.users.create<{ userId: string }>({
  username: `sdk-demo-${Date.now()}`,
  password: process.env.GENAUTH_DEMO_USER_PASSWORD!,
});

const profile = await qoni.genauth.users.get<{ userId: string }>({
  userId: created.data.userId,
});

await qoni.genauth.users.update({
  userId: profile.data.userId,
  nickname: "SDK demo user",
});

// Optional smoke-test cleanup:
// await qoni.genauth.users.deleteBatch({ userIds: [profile.data.userId] });
```

### Runtime Product Delegation

GUMem, WebAgent, Do Anything, Web Search, and Track act for an end user. Silent delegation calls need a real GenAuth user id from the userpool bound to the Qoni credential, then a `delegateToken` result.

```ts
const userId = process.env.QONI_USER_ID!;
if (!userId) {
  throw new Error("QONI_USER_ID must be a real GenAuth user id from the credential-bound userpool");
}

// `products` is per-product authorization sugar; `agent` defaults to "sdk".
const { token } = (
  await qoni.delegateToken({
    user: { id: userId },
    products: ["doAnything"],
  })
).data;

const run = await qoni.doAnything.run({
  token, // passed once — the handle holds it; handle methods never take a token
  prompt: "Open https://en.wikipedia.org/wiki/Singapore and summarize the country's key facts.",
  capture: { screenshots: true },
});

const result = await run.wait({
  onScreenshot: (img, i) => fs.writeFileSync(`step-${i}.jpg`, img.bytes),
  onInteraction: (i) => {                 // login / clarify / confirm / take-control
    if (i.can("confirm_signed_in")) return i.confirmSignedIn();
    if (i.can("confirm")) return i.confirm();
  },
});
console.log(result.output);
```

`run()` returns a `RunHandle` typed to the product: `qoni.deepResearch.run()` is a `RunHandle<DeepResearchEvent>`, so its events are narrowed to what Deep Research actually emits. `capture: { screenshots: true }` opts into per-step screenshots, decoded to bytes for you. `wait()` drives the run to its terminal state and settles the result (`result.raw` carries cost, step counts, token usage).

Undecodable or empty screenshot data URIs never interrupt `wait()` or invoke `onScreenshot`, regardless of capture settings. They follow the existing progress fallback when a human-readable message is available; `onWireEvent` always retains the original payload, including frames with no progress text.

> **Best practice — match `event.type` against the `QoniEventTypes` constants.**
> Each product handle is typed to its own event set, so in TypeScript a case
> for another product's event is a compile error and autocomplete shows only
> the right ones. All the internal churn (supervisor planning, individual
> clicks/keystrokes, telemetry) folds into `QoniEventTypes.Progress`; once you
> match a `case`, `event.data` has a fixed shape — a bare value for simple
> events (`progress` → a string line, `resultsReady` → a number) and a small
> object for rich ones (`done` → `{ output, succeeded, terminalReason }`). The
> raw wire types are not exported.

```ts
import { QoniEventTypes } from "@qoniai/qoni";

const run = await qoni.deepResearch.run({ token, prompt: "State of EU battery recycling, 2026 update" }); // RunHandle<DeepResearchEvent>

for await (const event of run.events()) {
  switch (event.type) {
    case QoniEventTypes.Progress:      console.log(event.data); break; // data IS the line (string)
    case QoniEventTypes.Phase:         console.log(event.data); break; // data IS the phase name (string)
    case QoniEventTypes.SectionReady:  console.log(event.data); break; // data IS the section title (string)
    case QoniEventTypes.Message:       console.log(event.data.text); break; // rich → { text, role }
    case QoniEventTypes.Interaction: {                                      // rich → the typed Interaction object
      const i = run.interactionHandle(event.data);                         // e.g. an outline-approval confirmation
      if (i.can("confirm")) await i.confirm();
      break;
    }
    case QoniEventTypes.Done:          console.log(event.data.output); break;  // rich → terminal
    // case QoniEventTypes.ResultsReady — Web Search only → compile error here
  }
  // event.runId / event.at / event.isTerminal / event.raw (escape hatch)
}
// The iterator ends automatically at the terminal (QoniEventTypes.Done) event.
```

> **JS note:** the per-product compile-time narrowing is a TypeScript feature.
> In plain JavaScript there's no type checking, so a wrong-product `case` just
> never fires (it's not an error). Use TypeScript for the compile-time guard.

Power users can match the exact internal wire type via `event.raw.event` (a
raw string like `"run.action.started"`) — e.g. to tell a specific browser
action apart inside `progress`. That's the escape hatch, not the everyday API.

```ts
await run.cancel("user stopped the task"); // idempotent — safe on a finished run
const followUp = await qoni.doAnything.run({
  token,
  prompt: "Now open the Wikipedia page for Malaysia and compare its population with Singapore's.",
  session: run.sessionRef, // reuse the same browser session
});
const reattached = await qoni.doAnything.attach(run.id, { token }); // re-attach by run id alone
```

## Authorization Model

### Runtime Discovery

`host` points to the Qoni Console/SDK gateway, not directly to GenAuth, GUMem, or WebAgent. Hosted integrations normally leave `host` unset; private and local deployments can pass their own gateway.

The SDK signs a request to:

```text
GET /api/v3/eak/runtime-config
```

This path is an intentional compatibility boundary with the current server; it
is not the public SDK brand or JavaScript namespace.

The response provides runtime base URLs for Qoni, GenAuth, GUMem, and WebAgent. Application code should not configure those product URLs separately for normal usage.

### Server-Side AK/SK

`accessKey` and `secretKey` identify the tenant and application boundary configured in Qoni Console. The SDK uses them to sign trusted server-side Qoni requests, including delegation and product-token exchange.

### Delegation Token

In silent mode, `delegateToken` binds four things:

- the current user id
- the Agent id
- the requested scopes
- the token expiry and audit context

Silent product calls receive `token: delegation.data.token`. If that token is an Qoni delegation token, the SDK exchanges it internally for the correct GUMem or WebAgent product access token before calling the downstream service.

**Input shape.** `delegateToken` is discriminated by `mode`:

- **Silent** (`mode: "silent"`, the default) — acts for one end user, so a user
  is **required**: pass `user: { id: <genauthUserId> }` (preferred) or the
  deprecated top-level `userId`. Omitting it throws `QoniValidationError`
  locally before any request. Authorize with the `products` sugar and/or
  explicit `scopes`.
- **Interactive** (`mode: "interactive"`) — pass `redirectUri`, `state`,
  `agent`, `scopes` and **no** user (Qoni Console resolves the login during
  authorization). Returns `data.authorizationUrl`, not a token; complete it
  server-side with `completeDelegateToken({ grantId, code, state })`.

`agent` is optional and defaults to `"sdk"`.

```ts
const delegation = await qoni.delegateToken({
  userId,
  agent: "research-assistant",
  scopes: ["gumem.memory:read"],
  mode: "silent",
});

await qoni.gumem.recall({
  token: delegation.data.token,
  query: "research preferences",
});
```

In interactive mode, your server still starts with `delegateToken`, but it does not receive a token:

```ts
const grant = await qoni.delegateToken({
  mode: "interactive",
  redirectUri: "https://app.example.com/qoni/callback",
  state: "business-csrf-state",
  agent: "research-assistant",
  scopes: ["gumem.memory:read", "webagent.do_anything:manage"],
});

redirectUserTo(grant.data.authorizationUrl);
```

The user visits `authorizationUrl` in Qoni Console/BFF. If they are not logged in, Console/BFF sends them through GenAuth login, confirms authorization, completes the grant internally, then redirects back to your `redirectUri` with a one-time `code`, your `state`, and `grant_state`/`grantId`. The browser never receives a delegation token.

Your callback handler runs on the server and exchanges the callback fields with AK/SK:

```ts
const completed = await qoni.completeDelegateToken({
  grantId: String(req.query.grantId ?? req.query.grant_id),
  code: String(req.query.code),
  state: String(req.query.state),
});

await qoni.gumem.recall({
  token: completed.data.token,
  query: "research preferences",
});
```

`completeDelegateToken` is the recommended server callback helper. `delegateAgent` and `completeDelegateAgent` remain as deprecated compatibility names, but the current callback contract is `{ grantId, code, state }`; old `{ code, state }` completion is not supported.

## Choosing Scopes

Each WebAgent product exposes exactly two scopes: `read` (observe — status, events, artifacts) and `manage` (anything that changes execution state — run, cancel, respond, messages, monitor CRUD). The full set is the 8 scopes `webagent.{do_anything, web_search, deep_research, track}:{read, manage}`. The simplest authorization is the `products` sugar — each product name expands to its `read` + `manage` pair:

```ts
await qoni.delegateToken({
  user: { id: userId },
  products: ["doAnything", "webSearch", "deepResearch", "track"],
  scopes: ["gumem.memory:read"], // fine-grained scopes can be mixed in
});
```

Scope strings are validated locally before any request: a scope missing its service prefix (e.g. `do_anything:manage` instead of `webagent.do_anything:manage`) throws `QoniValidationError` immediately with the correct form in the message.

Use explicit scope strings when the requested permission boundary should be visible in code.

| Scenario | Useful scopes | User-facing meaning |
| --- | --- | --- |
| Read user memory | `gumem.memory:read` | Agent can read relevant historical preferences. |
| Create a GUMem session and recall context | `gumem.memory:read`, `gumem.memory:write`, `gumem.message:write` | Agent can create a memory session, write messages, and recall context for the current user. |
| Write task results | `gumem.message:write`, `gumem.action:write` | Agent can write this task's confirmed result back to GUMem. |
| Search public web | `webagent.web_search:read`, `webagent.web_search:manage` | Agent can search public pages and read search results. |
| Run a bounded web task | `webagent.do_anything:read`, `webagent.do_anything:manage` | Agent can run a visible web task, read progress, stop it, and intervene when needed. |
| Create a monitor | `webagent.track:read`, `webagent.track:manage` | Agent can configure monitors, read events, run checks, and stop monitors. |

Silent mode is usually appropriate for low-risk actions such as reading current-user memory, writing a confirmed summary, or searching public web pages.

Interactive mode is recommended for higher-risk actions such as browser takeover, external site login, long-running monitoring, form submission, or access to sensitive artifacts and recordings.

The SDK also exports a GUMem-oriented bundle for the common session/write/recall path:

```ts
QoniScopeBundles.GUMEM_SESSION_RECALL
```

## Capability Examples

### GUMem

```ts
await qoni.gumem.createSession({
  token,
  userId,
  sessionId: "daily-assistant",
  title: "Daily assistant memory",
});

// Your application has already collected and confirmed this preference with the user.
const confirmedPreference =
  "Please keep daily planning suggestions concise and include only the next action.";

await qoni.gumem.addMessages({
  token,
  sessionId: "daily-assistant",
  messages: [
    {
      role: "user",
      content: confirmedPreference,
    },
    {
      role: "assistant",
      content: `Saved confirmed user preference: ${confirmedPreference}`,
    },
  ],
});

const context = await qoni.gumem.recall({
  token,
  sessionId: "daily-assistant",
  query: "What confirmed preferences should I consider for this user's next task?",
  details: true,
});

// Pass context.data into your own assistant response composer or task planner.
// The SDK example stops here because application orchestration is product-specific.
```

### Do Anything

```ts
const run = await qoni.doAnything.run({
  token,
  prompt: "Open https://en.wikipedia.org/wiki/Solid-state_battery and summarize its key advantages over lithium-ion.",
  browserProxy: {
    proxyId: "sg-static", // server-side registry id; never pass credentials here
    mode: "scoped",       // off | all | scoped
    region: "ap-southeast-1",
  },
});

const status = await run.status(); // refresh the run's current state
await run.cancel("User stopped the task"); // idempotent
```

`browserProxy` affects only newly created Browserbase sessions. `region` selects
Browserbase compute, while the registered proxy controls network egress. The SDK
accepts only a proxy ID, mode, and region; operators manage proxy credentials in
OpsConsole.

### Web Search

```ts
const search = await qoni.webSearch.run({
  token,
  prompt: "EU battery recycling regulations 2026",
  maxResultsPerQuery: 5,
});

const result = await search.wait();
console.log(result.output); // search results
```

### Deep Research

```ts
const research = await qoni.deepResearch.run({
  token,
  prompt: "State of EU battery recycling, 2026 update",
  depth: "standard", // light | standard | deep — the main research knob
  limits: { maxDurationMinutes: 120 }, // wall-clock cap; the run self-terminates past it
});

const report = await research.wait();
for (const artifact of report.artifacts) {
  fs.writeFileSync(artifact.name ?? artifact.id, await artifact.content());
}

// Follow-up research that inherits the prior run's context:
const followUp = await qoni.deepResearch.run({
  token,
  prompt: "Now compare against the 2025 numbers.",
  session: research.sessionRef,
});
```

### Track

```ts
const monitor = await qoni.track.create({
  token,
  prompt: "Monitor the price of Bitcoin every minute.",
});

// A new monitor starts in `pending_clarification` while the backend aligns
// the intent into a concrete spec, then flips to `active` (usually a few
// seconds; it may emit an `interaction` first if the intent is ambiguous).
// runNow()/refine() require `active`, so wait for it before acting:
for await (const event of monitor.events()) {
  if (event.type === "interaction") {
    const i = monitor.interactionHandle(event.data); // e.g. a needs-reauth site_login
    if (i.can("confirm")) await i.confirm();
    continue;
  }
  const { status } = await monitor.get();
  if (status === "active") break;
}

await monitor.runNow();                     // trigger an immediate tick
const ticks = await monitor.runs({ limit: 10 }); // read-only tick run views

// Change the definition with refine() (any subset of: schedule / targetUrls /
// extractionSchema / triggerDsl / stopConditionDsl / notifyChannel). `schedule`
// is { kind: "cron", expr } or { kind: "interval", intervalSeconds }. The
// natural-language intent isn't refinable — create a new monitor to change it:
await monitor.refine({ schedule: { kind: "cron", expr: "0 9 * * *" } });
await monitor.pause();   // stop scheduled ticks without deleting
await monitor.resume();
await monitor.delete();

// Reconnect later from a stored id:
const sameMonitor = await qoni.track.attach(monitor.id, { token });
```

### GenAuth User Context and Management

```ts
const client = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
});

const profile = await client.genauth.userInfo({
  accessToken: process.env.GENAUTH_ACCESS_TOKEN!,
});

const users = await client.genauth.users.list({
  page: 1,
  limit: 20,
});

const created = await client.genauth.users.create({
  username: "sdk-demo-user",
  password: process.env.GENAUTH_DEMO_USER_PASSWORD!,
});
```

`currentUser` and `genauth.userInfo` use a GenAuth access token because they read the logged-in user's identity. `genauth.users.*` is a management-plane capability, but application code still authenticates the SDK with Qoni AK/SK: the SDK signs `POST /api/v3/eak/genauth/admin-token` with an empty JSON body `{}`, receives a standard GenAuth management token plus `userPoolId`, then calls GenAuth v3 user management APIs with `Authorization: Bearer ...` and `x-authing-userpool-id`. It does not send `resource`, `actions`, `expiresIn`, or `QONI_USER_ID`. Runtime capability calls such as GUMem/WebAgent use `delegateToken` output instead.

## API Surface

### Client

```ts
const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
  timeoutMs: 30_000,
});
```

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `accessKey` | `string` | Yes | Qoni access key from Qoni Console. |
| `secretKey` | `string` | Yes | Qoni secret key from Qoni Console. |
| `host` | `string` | No | Optional Qoni Console/SDK gateway override for private or local deployments. |
| `fetch` | `typeof fetch` | No | Custom transport implementation. |
| `timeoutMs` | `number` | No | Per-request timeout (connect + headers + body for one-shot requests; headers only for successful SSE connections). Defaults to `30000`. |

> **`timeoutMs` does not bound a long-running run.** It applies to individual
> one-shot HTTP requests (delegation, `status()`, a single POST). The live
> event stream (`events()` / `wait()`) is **not** cut off by it — once the
> stream's response headers arrive the per-request timer is cleared, so a
> Deep Research run that takes an hour streams fine under the default 30s
> client timeout. To bound how long you wait, pass `wait({ timeoutMs })` —
> with no value, `wait()` runs until the run reaches a terminal state. A
> `wait()` timeout does not stop the run; it keeps executing server-side and
> you can `attach()` to it again.

### Namespaces

| Namespace | Methods |
| --- | --- |
| Delegation | `delegateToken`, `completeDelegateToken`, deprecated aliases `delegateAgent`, `completeDelegateAgent` |
| GenAuth | `userInfo`, `jwks`, `discovery`, `introspectDelegationToken`, `users.list`, `users.get`, `users.getBatch`, `users.create`, `users.createBatch`, `users.update`, `users.deleteBatch` |
| GUMem | `createSession`, `addMessages`, `recall`, `uploadResource`, `actions.record`, `actions.recall`, `actions.stream` |
| Do Anything | `run`, `attach` → `RunHandle` |
| Deep Research | `run`, `attach` → `RunHandle` |
| Web Search | `run`, `attach` → `RunHandle` |
| Track | `create`, `attach` → `MonitorHandle` |

The three run products share one handle shape:

```ts
run.id
run.sessionRef                          // pass back to run({ session }) to reuse the session
await run.status()                      // refresh and return the current state
run.events({ onWireEvent?, onReconnect?, ...opts }) // semantic events + optional raw telemetry
await run.wait({ timeoutMs?, onEvent?, onWireEvent?, onReconnect?, onInteraction?, onScreenshot? })
run.interactionHandle(interaction)      // typed HITL handle (see Interactions below)
await run.cancel(reason?)               // idempotent
```

`await run.wait(...)` settles to a `RunResult`:

The run-detail response must confirm a terminal state. Detail read errors propagate
unchanged; `wait()` never substitutes an SSE completion payload for the authoritative
result. A nonterminal or incomplete detail rejects with a retryable `upstream.failed`
error; use `status()` or re-attach to recover.

`timeoutMs` and `signal` stop waiting for detail/artifact reads and promises returned
by `onEvent`, `onWireEvent`, `onInteraction`, and `onScreenshot`. They cannot preempt
synchronous JavaScript or stop work already started inside a callback. `onReconnect`
is synchronous telemetry: its return value is not awaited and returned promise
rejections are not handled. Do not pass an async callback there; synchronous throws
propagate. Reconnect backoff remains abortable and subject to the wait deadline.

Detail/artifact-list GETs receive the wait signal: aborting or timing out a wait aborts
the request and cancels its body reader. The client's per-request timer also covers
complete JSON/NDJSON and binary body reads, including HTTP error bodies. A late response
from a custom fetch that ignores abort has its body canceled and cannot resume settlement
or start subsequent run requests. Custom transports must honor `RequestInit.signal` to
stop their own in-flight network work. Stopping a wait neither cancels the server-side
run nor creates a replacement task; use `cancel()` explicitly to stop the existing run.

```ts
interface RunResult {
  runId: string;
  status: "succeeded" | "failed" | "canceled";  // delivery status of the run
  output?: unknown;            // final answer / payload (shape is task-specific)
  artifacts: Artifact[];       // deliverables — deepResearch reports; [] for the others
  isTaskSuccessful?: boolean;  // did the task achieve its goal (distinct from `status`)
  terminalReason?: string;
  raw: JsonObject;             // full wire envelope — cost, step counts, token usage
}
```

Each `Artifact` exposes `id`, `name?`, `mime?`, `sizeBytes?`, `createdAt?`, and
`content(): Promise<Uint8Array>` (lazy byte download). Every other method returns the `QoniResponse<T>` envelope below; `T`
is the typed payload for that call (e.g. `genauth.users.list` → a paged user
list on `.data`). The exact `T` shapes live in the bundled `.d.ts` and follow
the backend contract.

`MonitorHandle` (Track) exposes `id`, `get()`, `pause()`, `resume()`, `refine(patch)`, `runNow()`, `events()`, `interactionHandle()`, `runs()`, `run(runId)`, and `delete()`. `runNow()` and `refine()` require the monitor to be `active` — a freshly created monitor is briefly `pending_clarification` first (see the Track example).

### Interactions (HITL)

When a run needs the user — sign in to a site, answer a clarification, approve a
plan, take over the browser, or wait — it emits an `interaction` event whose
`event.data` is a typed `Interaction` (discriminated by `type`: `site_login` /
`clarification` / `confirmation` / `take_control` / `wait`). Wrap it in a handle
and call the action methods; each posts to the endpoint the backend declared in
the interaction's `actions[]`, so you never hard-code a route:

```ts
for await (const event of run.events()) {
  if (event.type === "interaction") {
    const i = run.interactionHandle(event.data);   // event.data is the Interaction
    if (i.type === "clarification" && i.can("answer")) await i.answer("the blue button");
    else if (i.can("confirm")) await i.confirm();
    else if (i.can("confirm_signed_in")) await i.confirmSignedIn();
    else if (i.can("release_control")) await i.releaseControl();
  }
}
```

Methods: `answer(text)`, `skip()`, `confirm()`, `reject()`, `openLogin()`,
`confirmSignedIn()`, `connectControl()`, `refreshControl()`, `releaseControl()`,
`retry()`, `switchProfile()`. `i.can(kind)` reports whether the interaction
currently offers that action; calling a method the backend did NOT declare
throws (so a "recovery" button only exists when it actually works).

The discriminant strings used above are also exported as constants so you can
avoid bare literals: `InteractionTypes` (`site_login` / `clarification` /
`confirmation` / `take_control` / `wait`), `InteractionStatuses`, and
`ActionKinds` (the `i.can(...)` action names). Authorization scope strings have
the same treatment — `QoniScopes` (every individual scope), `QoniProductScopes`
(the per-product `read`+`manage` pairs the `products` sugar expands to), and
`QoniScopeBundles` (curated bundles). Use them in place of hand-typed strings:

```ts
import { InteractionTypes, ActionKinds, QoniScopes } from "@qoniai/qoni";

if (i.type === InteractionTypes.Clarification && i.can(ActionKinds.answer)) {
  await i.answer("the blue button");
}
```

### Wire-Level Escape Hatch

The 1:1 low-level methods live under `qoni.<product>.api.*` (e.g. `qoni.doAnything.api.createSession`, `qoni.deepResearch.api.followUp`, `qoni.track.api.createMonitor`). These mirror the backend HTTP contract directly — snake_case fields, double-envelope events, single-ID `/{product}/runs/{run_id}` addressing for run operations — and their shapes may evolve with the API. They are not part of the frozen public contract.

`event.raw.event` is the **raw wire event type** — an internal transport name (`run.action.started`, `run.section_completed`, …) whose naming is historical and inconsistent, exposed as a plain string. This is an implementation detail, not the product API: developers match on the curated `event.type` above. The full wire-type catalog is intentionally NOT exported — reach for `event.raw.event` (a string) only when you need an exact wire match the curated layer folds into `progress` (e.g. telling a specific browser action apart).

Browser Use and Site Login scopes are reserved until their product runtime SDK methods are exported.

### Response Shape

Most SDK methods return:

```ts
type QoniResponse<T> = {
  data: T;
  meta: {
    requestId?: string;
    traceId?: string;
    auditId?: string;
    service?: "qoni" | "genauth" | "gumem" | "webagent";
  };
};
```

Handle event streams (`run.events()`, `monitor.events()`) yield a discriminated
`RunEvent` — once you match `event.type`, `event.data` is the fixed shape for
that type:

```ts
// event.type → event.data:
//   SIMPLE events — event.data IS the value (no field to remember):
//     "progress"       string   — a human-readable line of what's happening
//     "phase"          string   — the Deep Research phase name
//     "sectionReady"   string   — the Deep Research section title
//     "resultsReady"   number   — Web Search count of unique results
//     "monitorCreated" string   — Track monitor id
//     "triggered"      string   — Track change summary
//     "checkCompleted" boolean  — Track: did the scheduled check find a change
//   RICH events — event.data is a small object:
//     "message"        { text, role }
//     "interaction"    the typed Interaction object (HITL) — see Interactions
//     "screenshot"     { pageUrl?, step? }   + the decoded image on event.image
//     "done"           { output, succeeded, terminalReason }
// Common to every event: runId, at (ISO 8601), isTerminal (true only for "done"),
// raw (the original wire event — escape hatch).
```

Each product handle is typed to its own subset:

| Product | `event.type` set |
|---|---|
| Do Anything | core: `progress` / `message` / `interaction` / `screenshot` / `done` |
| Web Search | core + `resultsReady` |
| Deep Research | core + `phase` / `sectionReady` (the outline gate arrives as an `interaction`) |
| Track (`MonitorHandle`) | core + `monitorCreated` / `triggered` / `checkCompleted` |

Dropped connections reconnect automatically with `Last-Event-ID` catch-up; the iterator ends at the run's terminal (`done`) event.
For complete audit/observability capture, `onWireEvent` receives every original
SSE frame before semantic normalization or filtering; `onReconnect` receives
the retry attempt and last event id. Keep application behavior on the curated
`RunEvent` stream and use the wire callback only as evidence/diagnostics.

Wire-level streaming methods (`qoni.<product>.api.events`) return `AsyncIterable<QoniEvent<T>>`:

```ts
type QoniEvent<T = unknown> = {
  id?: string;
  event?: string;
  data: T;
};
```

## Error Handling

All SDK errors inherit from `QoniError` and expose `code`, `status`, `requestId`, `traceId`, `auditId`, `retryable`, and the original response `body` when available. `code` is typed as `QoniErrorCode` (the known SDK / backend codes plus `(string & {})`), so you get literal autocomplete and can `switch (err.code)` over the known set while still tolerating new backend codes.

All error classes are exported and can be matched with `instanceof`:

| Class | Fires when | Typical recovery |
| --- | --- | --- |
| `QoniValidationError` | Local input check failed before any request (bad scope string, silent delegation missing a user). | Fix the call — the message states the correct form. |
| `QoniAuthError` | AK/SK signing rejected by Qoni (bad/rotated credentials). | Check `accessKey` / `secretKey`. |
| `QoniPermissionDeniedError` | The delegation token lacks a required scope (403). | Re-`delegateToken` with the missing scope. |
| `QoniTokenExpiredError` | The delegation / product token expired. | Mint a fresh token and retry. |
| `QoniDelegationRequiredError` | A product call was made without `token`, or with a raw token the gateway won't accept directly. | Pass `delegation.data.token` to the product call. |
| `QoniRateLimitError` | Rate limited (429). | Back off and retry (`retryable === true`). |
| `QoniTimeoutError` | A request (or `wait({ timeoutMs })`) timed out. | Retry; the run keeps executing server-side — `attach()` to it. |
| `QoniUpstreamError` | A downstream service failed (5xx / upstream exchange failure). | Back off and retry when `retryable`. |
| `QoniError` | Base class / any other code. | Inspect `err.code`. |

The SDK does **not** auto-retry. `err.retryable` tells you whether a retry could
succeed; you own the backoff.

```ts
import {
  QoniDelegationRequiredError,
  QoniPermissionDeniedError,
  QoniRateLimitError,
  QoniTimeoutError,
  QoniTokenExpiredError,
  QoniUpstreamError,
} from "@qoniai/qoni";

try {
  await qoni.webSearch.run({ token, prompt: "Qoni SDK" });
} catch (error) {
  if (
    error instanceof QoniPermissionDeniedError ||
    error instanceof QoniTokenExpiredError ||
    error instanceof QoniDelegationRequiredError
  ) {
    // Re-mint a delegation token (add the missing scope / refresh expiry) and retry.
  }

  if (
    error instanceof QoniRateLimitError ||
    error instanceof QoniTimeoutError ||
    error instanceof QoniUpstreamError
  ) {
    // Transient — back off and retry when `error.retryable` is true.
  }

  throw error;
}
```

Common first-run errors:

| Error | Meaning | Next step |
| --- | --- | --- |
| `agent must be a string` | The online delegation API currently expects `agent` to be a string id. | Pass `agent: "memory-agent"` rather than an object. |
| `eak.delegation.user_not_bound` | The `userId` is not in the GenAuth userpool bound to this Qoni credential. | Use a real user id from `currentUser` or from the same bound userpool. |
| `eak.genauth.userpool_binding_missing` | The AK/SK is not bound to a GenAuth userpool, so `genauth.users.*` cannot obtain a management token. | Bind the Qoni credential to the target GenAuth userpool before calling user management APIs. |
| `eak.genauth.userpool_owner_missing` | The bound GenAuth userpool has no resolvable owner user for management-token signing. | Fix the GenAuth userpool owner data or binding. |
| `eak.token_exchange.upstream_failed` with `unauthorized_client` or `grant_type is not enabled` | Delegation succeeded, but the managed delegation app is missing token-exchange grant support or has drifted from the tenant binding. | Repair the managed delegation app binding before calling GUMem or WebAgent product capabilities. |
| `delegation.required` | A GUMem/WebAgent call was made without `token`. | Pass `delegation.data.token` to the product namespace call. |
| `direct delegation token deprecated` | Application code is calling a product service directly with an Qoni delegation token. | Call the product through the SDK so token exchange is handled internally. |

## Security Notes

- Keep Qoni AK/SK on trusted servers only.
- Do not expose delegation tokens to untrusted clients.
- Request the smallest useful scope set for each Agent action.
- Product methods exchange the delegation token on every call, so a change to
  the access key's allowed scopes is checked before the next SDK operation.
  Product tokens already obtained outside the SDK remain valid until expiry.
- Prefer `interactive` mode for browser control, site login, long-running monitors, and sensitive artifacts.
- Store `auditId`, `requestId`, and `traceId` with product logs when later investigation matters.
- Rotate AK/SK through Qoni Console if a credential might have been exposed.

## License

MIT

## Do Anything file artifacts

After `wait()`, `result.artifacts` contains this run's persisted files, including when using `attach()` after reconnecting. Screenshots and recordings remain on their dedicated APIs. Temporary S3 URLs expire 900 seconds after signing; do not put them in public logs. Refreshing a link requires a valid delegation token with `webagent.do_anything:read`. Stored files remain subject to project retention.

```ts
const result = await run.wait();
for (const artifact of result.artifacts) {
  let url = artifact.downloadUrl;
  url = await artifact.refreshDownloadUrl?.();
  const data = await artifact.content(); // Uint8Array, authenticated download
}
const artifacts = await client.doAnything.artifacts({ token, runId: run.id });
```

Wire methods: `client.doAnything.api.listArtifacts(...)` and `artifactDownloadUrl(...)`.
