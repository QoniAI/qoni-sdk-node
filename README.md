# @qoniai/qoni

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)](https://www.typescriptlang.org/)
[![Package manager](https://img.shields.io/badge/package%20manager-pnpm-f69220)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Unified Node.js SDK for Qoni Agent delegation, GenAuth user management, GUMem memory, WebAgent automation, web search, and monitoring.

`@qoniai/qoni` gives a trusted server one compact way to use Qoni AK/SK. For runtime product calls, your service verifies the GenAuth user, requests short-lived delegation with `delegateToken`, and then uses the returned token in GUMem, WebAgent, Do Anything, Web Search, and Track calls. For GenAuth user management, the SDK exchanges AK/SK for a standard GenAuth management token internally and calls GenAuth v3 users APIs with that token.

AK/SK credentials must stay on a trusted server. Do not ship them to browsers, mobile apps, public CLI config, or untrusted Agent runtimes.

English | [中文](./README.zh-CN.md)

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

> **Unreleased candidate:** hosted login, current-task login, ordinary forms/Profile,
> pre-run memory and Personal Agent provisioning below require the matching local
> candidate package and backend. `npm install @qoniai/qoni` does not select this
> candidate; its source version is 0.10.0-rc.20261010.1. Install the exact reviewed
> tarball for validation. See the [typed examples](./docs/delivery-examples/README.md).

> This unified local candidate combines those interfaces, the corrected memory
> error contract, original-key receipt reads and the A1 r2 memory projection.
> It remains unreleased; use its fixed archive/DTS and matching backend contract.

The current candidate's Personal Agent, formal delegation, wildcard and recovery boundaries are documented in the [Quickstart v5 contract](./docs/quickstart-v5-contract.md).

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
  onInteraction: (i) => {                 // site_login / take_control / ask_user / confirmation
    if (i.can("confirm_signed_in")) return i.confirmSignedIn();
    if (i.can("confirm")) return i.confirm();
  },
});
console.log(result.output);
```

This public-page example requests only the product's `read` + `manage` pair. Before using the [browser-control handler below](#interactions-hitl), explicitly add `scopes: [QoniScopes.BROWSER_USE_TAKE_CONTROL]` when requesting its run token, allow that scope in the AccessKey policy, and obtain the user's consent. The site-login handler separately needs `QoniScopes.SITE_LOGIN_REQUEST` and `QoniScopes.SITE_LOGIN_CONFIRM`. Use interactive delegation for these permissions; the `products` shorthand does not request them.

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
  top-level `userId`. Omitting it throws `QoniValidationError`
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

// The callback will not carry grantId: save it with your business state, keyed by grantState.
await savePendingGrant(grant.data.grantState, {
  grantId: grant.data.grantId,
  businessState: "business-csrf-state",
});
redirectUserTo(grant.data.authorizationUrl);
```

The user visits `authorizationUrl` in Qoni Console/BFF. If they are not logged in, Console/BFF sends them through GenAuth login, confirms authorization, completes the grant internally, then redirects back to your `redirectUri` with a one-time `code`, your `state`, and `grant_state`. The callback does **not** carry `grantId`, so look up the record you saved by `grant_state`. The browser never receives a delegation token.

Your callback handler runs on the server and exchanges the callback fields with AK/SK:

```ts
const pending = await loadPendingGrant(String(req.query.grant_state));
// Your business state comes back unchanged; reject forged or mixed-up callbacks.
if (!pending || req.query.state !== pending.businessState) throw new Error("Invalid delegation callback");

const completed = await qoni.completeDelegateToken({
  grantId: pending.grantId,
  code: req.query.code,
  state: String(req.query.grant_state), // grant_state, not your business state
});

await qoni.gumem.recall({
  token: completed.data.token,
  query: "research preferences",
});
```

`completeDelegateToken` is the recommended server callback helper. Root `qoni.delegateAgent` and `qoni.completeDelegateAgent` remain as deprecated compatibility names, but the current callback contract is `{ grantId, code, state }`; old `{ code, state }` completion is not supported.

## Original delegation style (0.8.0+)

```ts
const grant = await qoni.genauth.delegateAgent({
  userId: process.env.QONI_USER_ID!, // The current user's GenAuth ID
  agentKey: "email-assistant", // Agent audit label; alias for agent
  scopes: [
    "webagent.do_anything:read", // Read status, events, and artifacts
    "webagent.do_anything:manage", // Start/cancel tasks and respond to ordinary interactions; excludes browser control
  ],
  expiresIn: "15m", // Converted to 900 seconds before signing
});
console.log(grant.grantId, grant.auditId);
```

This entry returns the grant directly; root `delegateToken` still returns
`QoniResponse`, with the token in `response.data.token`. Interactive mode returns
the authorization request directly; use `completeDelegateToken()` in the server
callback after consent. `agentKey` aliases `agent`; both labels must agree when
supplied together. Top-level `userId` retains precedence over `user.id`.
Expiry accepts integer seconds or whole-number
`s/m/h/d` durations, between 60 and 86400 seconds. These additions are available
in the published `@qoniai/qoni@0.8.0` release.

Legacy `mailbox.*`, `web.search`, and `web.extract` scopes, and `deniedScopes`, are unsupported and rejected.
They are never expanded into broader product permissions. Product scopes do not
prohibit email sending or deletion; a prompt is not an enforced deny policy.

## Choosing Scopes

Each WebAgent product exposes two product scopes: `read` (status, events, artifacts) and `manage` (run, cancel, ordinary interaction responses, messages, monitor CRUD). Product `manage` does not include browser connection, refresh or release. The 8 product scopes are `webagent.{do_anything, web_search, deep_research, track}:{read, manage}`. Browser control additionally requires `QoniScopes.BROWSER_USE_TAKE_CONTROL` (`webagent.browser_use:take_control`); interactive site login requires `QoniScopes.SITE_LOGIN_REQUEST` and `QoniScopes.SITE_LOGIN_CONFIRM`. Request these independent permissions explicitly in `scopes`. Each name in the `products` shorthand expands only to its product's `read` + `manage` pair:

```ts
await qoni.delegateToken({
  user: { id: userId },
  products: ["doAnything", "webSearch", "deepResearch", "track"],
  scopes: ["gumem.memory:read"], // fine-grained scopes can be mixed in
});
```

Scope strings are validated locally before any request: a scope missing its service prefix (e.g. `do_anything:manage` instead of `webagent.do_anything:manage`) throws `QoniValidationError` immediately with the correct form in the message — every candidate when the short form is ambiguous (`profile:read` → `gumem.profile:read` or `user.profile:read`).

The browser-control, site-login, user Profile, payment and Agent mailbox scopes (`QoniScopes.BROWSER_USE_TAKE_CONTROL`, `SITE_LOGIN_*`, `USER_PROFILE_READ`, `USER_PROFILE_WRITE`, `USER_PAYMENT_USE`, `AGENT_MAIL_READ`, `AGENT_MAIL_SEND`) belong to no product bundle: request them explicitly in `scopes`, and allow them in the AccessKey policy. The corresponding Console changes add separate browser-control and site-login policies; confirm that GenAuth and Console support them before requesting a new grant. The user Profile, payment and Agent mailbox constants only name the scopes; requesting them does not by itself enable Profile, payment or mailbox access in a run.

Use explicit scope strings when the requested permission boundary should be visible in code.

| Scenario | Useful scopes | User-facing meaning |
| --- | --- | --- |
| Read user memory | `gumem.memory:read` | Agent can read relevant historical preferences. |
| Create a GUMem session and recall context | `gumem.memory:read`, `gumem.memory:write`, `gumem.message:write` | Agent can create a memory session, write messages, and recall context for the current user. |
| Write task results | `gumem.message:write`, `gumem.action:write` | Agent can write this task's confirmed result back to GUMem. |
| Search public web | `webagent.web_search:read`, `webagent.web_search:manage` | Agent can search public pages and read search results. |
| Run a bounded web task | `webagent.do_anything:read`, `webagent.do_anything:manage` | Agent can run a visible web task, read progress, stop it, and respond to ordinary interactions. Browser control requires its separate scope. |
| Create a monitor | `webagent.track:read`, `webagent.track:manage` | Agent can configure monitors, read events, run checks, and stop monitors. |
| Sign in to sites during a run | `webagent.site_login:request`, `webagent.site_login:confirm` | The user signs in through a live browser; the login is saved for later tasks. |
| Human browser control | `webagent.browser_use:take_control` | The user connects, refreshes, and releases the current browser. Request this explicitly; product manage does not include it. |
| Use the user's Profile | `user.profile:read`, `user.profile:write` | The ordinary Task adapter reads/saves permitted name/address and supported nonencrypted primitive custom fields. Phone/email verification, payment/card data and other sensitive fields are excluded. |
| Pay with the user's saved card | `user.payment:use` | After the user approves a payment, the saved card is filled in for them. |
| Use the Agent's own mailbox | `agent.mail:read`, `agent.mail:send` | Agent can read mail sent to its own address (such as verification codes) and send mail from it. |

Silent mode is usually appropriate for low-risk actions such as reading current-user memory, writing a confirmed summary, or searching public web pages.

Browser control uses `QoniScopes.BROWSER_USE_TAKE_CONTROL`, outside the `products` shorthand. When upgrading to the corresponding backend, both the AccessKey policy and user delegation must explicitly include it. Legacy `webagent.do_anything:control`, `webagent.deep_research:control`, and `webagent.browser:control` scopes are not automatically converted. Refresh and release require this permission too. This scope adaptation does not establish stale-card protection or durable login persistence.

### Migrating browser-control permissions

This is an unreleased breaking change. It requires a coordinated cutover: the old Web Agent release endpoint requires product `manage`, whereas the new SDK requests only `webagent.browser_use:take_control` for release; the new Web Agent rejects `manage` as a substitute. Upgrading Web Agent and the SDK one at a time does not guarantee uninterrupted control sessions.

1. Prepare GenAuth's scope registration and Console's **WebAgent Browser Control** and **WebAgent Site Login** policies first. Enable the permissions actually needed on the AccessKey; the site-login policy contains `webagent.site_login:request` and `webagent.site_login:confirm`.
2. Request `QoniScopes.BROWSER_USE_TAKE_CONTROL` explicitly and obtain new user consent through interactive delegation. Add the site-login scopes only when needed. Updating the AccessKey policy or renewing an existing delegation must not silently add permissions to that user's grant.
3. During a maintenance window, stop admitting new browser-control tasks and finish or drain existing control sessions with the old versions. Then coordinate the Web Agent and SDK cutover; do not add a `manage` compatibility bypass.
4. Verify connect, refresh and release with the newly consented scope, and verify that delegations lacking it or carrying only legacy control scopes are rejected. The new Console lists permissions not covered by the selected policies separately, including legacy, unknown and partial policy entries. It preserves them by default and removes them only when the user selects “Remove these permissions when saving”. Inspect the saved AccessKey allowlist. Preserving an old control scope does not grant `webagent.browser_use:take_control`; migrate callers to the independent scope.

Deployment and publication still require a separate Owner instruction. This migration guide does not authorize them.

### Raw browser-control calls

After the policy and consent migration, `doAnything.api.intervene()` accepts `interactionId` (wire alias `interaction_id`). Refresh and release must send the ID captured for that control round. A first user-initiated `take_control` may omit it only when no control marker is active; reconnecting to an active round must send its exact ID. The new Web Agent take/refresh response includes `interaction_id`; keep the raw response field, rather than deriving an ID from a URL or fetching a newer card.

```ts
import type { DoAnythingControlResponse } from "@qoniai/qoni";

// Only for a first user-initiated take when no control round is active.
const first = await qoni.doAnything.api.intervene<DoAnythingControlResponse>({
  token, runId: run.id, kind: "take_control",
});
const interactionId = first.data.interaction_id;
if (!interactionId) throw new Error("This backend did not return the control-round ID; stop and complete the migration");

// When this round's URL needs refreshing:
await qoni.doAnything.api.intervene({ token, runId: run.id, kind: "refresh_control_url", interactionId });
// When the user hands this round back:
await qoni.doAnything.api.intervene({ token, runId: run.id, kind: "release_control", interactionId });
```

Missing, ended, expired or mismatched IDs are rejected by Web Agent with HTTP 409 before side effects. The SDK preserves that rejection and does not fetch a current ID or retry with another one. Invalidate the old UI and let the user act on a newly received interaction separately; keep old `ControlSession` objects and handles bound to their original card. Card methods continue to use the ID in the declared action path. `requestId` identifies an input question, not a browser-control round. Supplying conflicting `interactionId` and `interaction_id`, or an explicit non-string/empty ID, throws `QoniValidationError` before HTTP; omission is forwarded so the server can enforce its state-dependent rule.

Interactive mode is recommended for higher-risk actions such as browser takeover, external site login, long-running monitoring, form submission, or access to sensitive artifacts and recordings.

Raw `answer_input_request` and `skip_input_request` calls must identify the current pending input with `requestId` (wire `input_request_id`). Web Agent checks the persisted request, waiting state, expiry and declared action before accepting it. A stale or undeclared action returns 409; the SDK does not replace the ID or retry. Use the declared confirmation and sign-in methods for those interactions instead of treating a raw answer or skip as approval or successful login.

In this backend change, card `connect_control` returns a pending control round. OBO/API-key callers cannot make it an active Console connection by sending `surface: "console_inline"`. Releasing such a pending round leaves a pending login/credential question unresolved. The unreleased task-login policy below uses declared `open_login` and `confirm_signed_in` for reliable save/release/reply; a connect-only card cannot substitute for that flow. The agent still verifies actual sign-in; deployment requires a separate Owner instruction.

The SDK also exports a GUMem-oriented bundle for the common session/write/recall path:

```ts
QoniScopeBundles.GUMEM_SESSION_RECALL
```

## Capability Examples

### Internal Pi host memory entry (Unreleased)

The local build adds `createTaskClient` for the existing Pi host. Application
Quickstart code still uses DoAnything and its interactions; it does not call
memory or Profile directly. Select the new task facade archive explicitly;
the frozen current-task integration package remains a separate input.

```ts
import { createTaskClient } from "@qoniai/qoni";

const task = createTaskClient({
  productHosts: { gumem: trustedHosts.gumem },
  runId: trustedRunId,
  tokenProvider: getCurrentRunPermission,
});
await task.memory.createSession();
await task.memory.addMessages({
  messages: [{ id: `${piSessionId}:${entry.id}`, role: entry.role, content: entry.content }],
});
```

The host supplies trusted service configuration, a stable run ID and
`getCurrentRunPermission(product, requiredScopes, runId, signal)`. The provider
returns `{ accessToken, expiresAt }` with expiry in Unix milliseconds, and must
check current permission on every request. This entry needs no AK/SK and only
exposes `memory.createSession` and `memory.addMessages` for `qoni-run-<runId>`.
Run IDs keep their complete value, allow at most 55 Unicode characters and
reject path separators; run and message IDs reject C0/C1 controls and DEL.
Messages require a stable nonempty `id`, a nonempty GUM string `role` and string
`content`. Role and content must be well-formed Unicode; valid pairs, whitespace,
newlines and empty content are preserved. No identity/token/header/path overrides
are accepted, including at runtime. Once a whole batch passes synchronous validation,
its IDs are submitted and bound on that client, including batches not yet sent.
Provider rejection or timeout before HTTP does not release the binding: changed
content or role fails locally; the original content can be explicitly retried.
An invalid batch binds no IDs.

`timeoutMs` (default 30 seconds) covers provider, HTTP and response body;
optional per-call `signal` cancels all stages. HTTPS is required except for
loopback HTTP fixtures; service base paths are preserved and redirects are
refused. Every call obtains current permission. No POST is automatically
retried. Ordered immutable batches receive a stable internal `X-Request-ID`
for existing usage-outbox deduplication; changed or overlapping batches do not
prove exactly-once processing. The facade returns `QoniResponse` with only
Session fields or `{ request_id, message_count }`, and typed Qoni errors without
raw private provider/HTTP payloads.

This method boundary is not resource-server authorization. Trusted G6/WA token
issuance and GUM run/session enforcement, durable Pi cursors, recovery and real
Pi/E2B/offline acceptance remain dependencies; provider/loopback tests do not
prove reliable background memory.

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

**Unreleased recall mapping:** `metadataFilters` is sent inside `recall_config.metadata_filters`. Top-level and nested camel/snake aliases merge only when duplicate values agree; conflicting values throw `QoniValidationError` before HTTP. Filter values must be strings, finite numbers or booleans; null, object and array values are rejected. System fields (`project_id`, `group_id`, `user_id`, `thread_id`, `session_id`, `scope`, `expired_at`, `validity`, including normalized aliases) are reserved. Other recall configuration keys pass through unchanged. This validation protects SDK calls; it does not fix server-side isolation or verify cross-task recall.

### Recall before starting a task (Unreleased)

Use `runWithMemory` to opt into bounded GUM context before a Do Anything task.
Keep the original delegation token with both `gumem.memory:read` and
`webagent.do_anything:manage` permissions. Each resource performs its existing
exchange; a WA-only product token cannot grant memory access.

```ts
const { run, memory } = await qoni.doAnything.runWithMemory({
  token: delegationToken,
  prompt: "Plan my next trip using my confirmed preferences.",
  memory: {
    sessionId: "daily-assistant", // existing GUM session, not a WA session ID
    query: "confirmed travel preferences",
    metadataFilters: { namespace: "travel" },
    maxItems: 12,
    maxContextBytes: 8192,
  },
  timeoutMs: 30_000,
  // signal: abortController.signal,
});
console.log(run.id, memory.items, memory.truncated);

// For an application that composes its own input:
const { data: context } = await qoni.gumem.recallContext({
  token: delegationToken,
  sessionId: "daily-assistant",
  query: "confirmed travel preferences",
});
```

Ordinary `run()` stays unchanged. An empty recall keeps the original prompt.
A failed recall, invalid context, timeout or cancellation before submission
prevents the Task POST. The combined deadline defaults to 30 seconds and accepts
1..60000 ms; writes are never automatically retried. A failure after the Task
POST can have an unknown commit outcome. `runWithMemory` errors expose `phase`
(`recall`, `task_permission`, or `task_submit`) and `submissionUnknown`. Once the
Task POST is dispatched, a timeout, disconnect, cancellation or unusable success
response raises `QoniTaskSubmissionUnknownError` with `code: "task.submit_unknown"`,
`phase: "task_submit"`, `submissionUnknown: true`, and `retryable: false`. The error
contains no original cause or request body. Reconcile the original request with
the server; do not blindly submit again. Before dispatch, `submissionUnknown` is
`false`; caller cancellation uses the safe `request.aborted` code instead of
returning the arbitrary signal reason. HTTP 4xx responses and explicit business rejections inside a successful HTTP response retain their original typed error, code, status and retryable flag; actual HTTP 5xx responses after dispatch are submission unknown and nonretryable.
Once fetch is invoked, even connection refusal is conservatively unknown; this
does not prove that the server received or created a Task and never permits an automatic retry. Cancellation here does not cancel an
already created Task.

`recallContext()` returns `QoniResponse<MemoryContext>`; read `.data` for
`origin`, typed `items`, bounded
`referenceText`, and `truncated`. Defaults are 12 items / 8192 UTF8 bytes;
allowed limits are 1..32 items / 512..16384 bytes. Only facts, summary and user or
assistant history text become quoted reference data. Working memory,
`formatted_context`, tool channels and arbitrary metadata are excluded.
Authorization-shaped values are omitted; the references confer no permission or
approval and quoting is not a model prompt-injection guarantee.

History sources contain the returned message `id` and GUM `sessionId`, with an
optional exact stored `metadata.source_url` if it is a bounded safe HTTP(S) URL.
It is caller-stored message evidence, not verified fact provenance. No URL is
inferred from content, and `resource_urls` remain media-resource references.
With the matching A1 r2 backend projection, facts/summary items can carry
`recordId`, `engine` and `raw_input` sources (`id`, `sessionId`, `messageId`,
`createdAt`, optional stored `url`), with `sourceStatus: "record_id"`.
`memory_records_coverage` must confirm complete coverage before typed records
replace a nonempty legacy section. Missing coverage keeps the complete legacy
section with `sources: []` and `sourceStatus: "unavailable"`; text equality never
attaches a source. Content has priority within the item/byte budget: omitted
source sets, identities or content set `truncated`; sources are kept as whole
sets or omitted. Older backends still return source-less facts/summary.
User-level semantic recall retains its project/user/scope=user path. Missing
stored URLs cannot be repaired by a response field. Local GA/HTTP/PG/Qdrant evidence does not imply hosted-vector,
extraction-worker, Pi/cloud or production acceptance; existing GUM expiration
filter limitations remain separate.

The corrected-candidate markers above apply only to `runWithMemory`; ordinary
`run()` and older packages may lack them. Absence of these fields never makes a
write safe to replay. See the [corrected memory-error example](./docs/delivery-examples/m2-r2/README.md).

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

`doAnything.api.readArtifacts()` and the exported `DoAnythingSnapshot`,
`SnapshotImage`, and `SnapshotAction` types are deprecated. There has never been
a backend endpoint/source for that structured snapshot contract. The method
raises local `QoniUnsupportedError` (`code: "unsupported.operation"`) with zero
HTTP. Use `qoni.doAnything.artifacts({ token, runId })` / `api.listArtifacts()` for files, including
`artifact.content()` or `api.artifactDownloadUrl()` for downloads. Use
`capture: { screenshots: true }` and screenshot events for images. A text file
artifact is not a snapshot; the real file APIs are unchanged.

### Track

Track uses `/track/tracks`. `prompt` maps to `instructions`; include watched URLs
in that text. An explicit schedule is required: an integer interval of
600–2592000 seconds, or a daily time with a time zone. A daily check starts
0–30 minutes before the target time, rather than exactly at that time.

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

Create immediately starts a `first_look` check. Capture its initial `lastTaskId`
and wait for that same check before one explicit `runNow()`. A concurrent run
can still cause 409; the SDK surfaces it and never retries. Pause stops future
scheduled checks and keeps any started check running.

Track check `status` is `running`, `done`, `failed`, `expired`, or `canceled`;
`done` is the successful terminal value. It is kept verbatim and differs from
one-shot `RunResult.status: "succeeded"`. Known wire schedule shapes are read
without revalidating server values against SDK write bounds or Intl time zones;
unknown/incomplete shapes remain verbatim. Writing a schedule stays strict, so
validate/choose supported input rather than casting every server value back.

`runs()` retrieves the backend's newest 50 checks and applies `limit`/`offset`
locally. `run(id)` searches that same bounded window; a missing ID raises
`QoniError` with local `code: "not_found"` (no HTTP status) and explains the range. A missing Track itself is the backend 404 `track_not_found`. Checks expose the
actual status, outcome, headline, answer and failure; no extraction, diffs or
snapshot IDs are synthesized. `runNow()` can return the backend's 409
`task_in_progress` while an earlier task is working. It returns a task reference
on 202; read checks to observe completion.

| Retained surface | Current behavior |
| --- | --- |
| `track.create`, `track.attach`, `MonitorHandle.get` | Create/read the real Track resource; get converts known wire schedules; unknown shapes stay verbatim. |
| `MonitorHandle.pause`, `resume` | PATCH `status: paused` / `active`; pause keeps an in-flight check running. |
| `MonitorHandle.refine` | PATCH title/schedule only; changing prompt/instructions/intent requires a new track. |
| `MonitorHandle.runNow` | POST `run_now`; returns the actual task reference. |
| `MonitorHandle.runs`, `run` | Read recent checks with Track read scope only; no DoAnything fallback. |
| `MonitorHandle.delete` | DELETE 204; soft deletion stops scheduling and does not cancel running work. |
| `track.api.createMonitor`, `getMonitor` | Historical names retained; use real `instructions`, `title`, and wire schedule `{ every_seconds: N }` or `{ daily_at: "HH:MM", tz }`. |
| `track.api.updateMonitor` | PATCH real title/instructions/schedule/status fields; wire API permits instructions, while high-level refine does not. |
| `track.api.runNow`, `deleteMonitor` | Real `run_now` / DELETE; raw task reference / empty 204. |
| `track.api.listRuns`, `getRun` | Raw checks, local limit/offset, exact lookup within recent 50. |
| `MonitorHandle.events`, `interactionHandle`, `track.api.events`, `intervene` | Deprecated; no backend endpoint. Local `QoniUnsupportedError`, zero HTTP or token exchange. |
| `targetUrls`, `extractionSchema`, `triggerDsl`, `stopConditionDsl`, `notifyChannel` (including snake_case aliases), legacy `url` | No backend equivalent; rejected locally with `QoniUnsupportedError`. Put URLs in the prompt explicitly. |
| Cron schedule | Deprecated and rejected locally with a daily alternative. Arbitrary cron is never silently converted. |

A missing schedule, malformed input, invalid interval/time/zone, or invalid
pagination raises `QoniValidationError` before HTTP. `MonitorSchedule` retains
the deprecated cron branch; optional undefined fields retain omission behavior, while specified unsupported fields fail; historical event and option types remain exported
for source compatibility. Unsupported methods are not successful capability tests.

### The original Task user's ordinary Profile (Unreleased)

`doAnything.profile.read({ runId, token, fields })` and
`doAnything.profile.update({ runId, token, values })` return `QoniResponse<OrdinaryTaskProfile>`.
Read `.data.values`, `.data.missing`, `.data.writable_fields` and `.data.field_types`.
Request `user.profile:read` and, only for explicit saves, `user.profile:write` in
the original delegation together with the required Web Agent scopes. A newer
token cannot broaden the original Task authorization. This is the original
Task owner's ordinary Profile, not admin user management or browser login state.

Use the [field allowlist and write limits](./docs/ordinary-task-profile.md).
Unknown writes require readback of the original run; do not replay the update.
Ordinary form submission alone does not save Profile fields.

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

### GenAuth User Sign-Up and Sign-In (Unreleased)

Send users to the Qoni-hosted GenAuth sign-up/sign-in page and exchange the callback code on your server. The AccessKey must be bound to a registered business app in Qoni Console; the business app, its client secret, PKCE verifier and nonce stay on the server and never appear in the URL.

```ts
// 1. Start: store `state` in your own session, then redirect the browser.
const state = crypto.randomUUID();
session.loginState = state;
const { url, expiresAt } = await qoni.genauth.auth.createLoginUrl({
  redirectUri: "https://app.example.com/auth/callback", // registered on the business app (exact match)
  state,
  screen: "signup", // optional; default "login"
});
res.redirect(url);

// 2. Callback: verify `state` yourself first — the SDK does not check it for you.
if (typeof req.query.state !== "string" || !session.loginState ||
    req.query.state !== session.loginState || req.query.error !== undefined ||
    typeof req.query.code !== "string" || !req.query.code) return res.status(400).end();
// Use session-scoped atomic match-and-consume storage in a multi-replica app;
// see the typed hosted-login example. Never exchange this state/code twice.
delete session.loginState;
const login = await qoni.genauth.auth.exchangeLoginCode({
  code: req.query.code,
  redirectUri: "https://app.example.com/auth/callback",
});
// login.user: { id, email?, phone?, name?, isNewUser }
// login.accessToken / login.idToken / login.expiresIn
```

- `expiresAt` is the server-side deadline fixed when the URL is created (600 seconds). Reopening or refreshing the page, multi-factor steps and new browser sessions do not extend it; after it passes, the page shows an error or the callback carries `error=access_denied`.
- A URL completes at most once, and a code is exchanged at most once. If an exchange fails, times out or its response is lost, the code is not reusable: start again with `createLoginUrl`. The SDK never retries these calls.
- `isNewUser` is decided by GenAuth from the actual registration in this sign-in: it is `true` only when the account was registered in the same hosted-page window that completes the sign-in (same browser session, business app, user pool and final user), including after a page refresh, multi-factor step or signing in again in that window. Signing in to the same account in another window, a reused session or an existing account is `false`. If the server cannot match a registration in this browser session to a window, the callback carries `error=access_denied` instead of guessing.
- Errors arrive as typed `QoniError`s: GA business failures are HTTP 200 with an error envelope (for example `eak.hosted_login.code_invalid`, `eak.hosted_login.binding_mismatch`, `eak.credential.binding_mismatch`, `eak.hosted_login.business_app_unbound`, or `eak.hosted_login.unavailable` when the server is not configured for hosted login), and the SDK raises them rather than returning data. Use `login.accessToken` with `genauth.userInfo` to read the same user again.

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
| GenAuth | `userInfo`, `jwks`, `discovery`, `introspectDelegationToken`, `auth.createLoginUrl`, `auth.exchangeLoginCode`, `agents.create/get/bind` (Unreleased), `users.list`, `users.get`, `users.getBatch`, `users.create`, `users.createBatch`, `users.update`, `users.deleteBatch` |
| GUMem | `createSession`, `addMessages`, `recall`, `recallContext`, `uploadResource`, `actions.record`, `actions.recall`, `actions.stream` |
| Do Anything | `run`, `attach` → `RunHandle`; opt-in `runWithMemory`; `profile.read/update` (Unreleased) |
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
  artifacts: Artifact[];       // persisted DoAnything files / deepResearch reports
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

`MonitorHandle` (Track) provides `id`, `get()`, `pause()`, `resume()`, `refine(patch)`, `runNow()`, `runs()`, `run(runId)`, and `delete()`. Its deprecated `events()` and `interactionHandle()` methods fail locally; see Track above for the complete mapping.

### Interactions (HITL)

When a run needs the user, it pauses and emits an `interaction` event whose
`event.data` is a typed `Interaction`. Interactions are typed by what the user
has to do, never by business, so one handler covers every task:

| `type` | The user… | Methods |
| --- | --- | --- |
| `site_login` | signs in to a site in the live browser | `openLogin()`, `confirmSignedIn()` |
| `take_control` | operates the browser by hand (captcha, 2FA, …) | `connectControl()`, `refreshControl()`, `releaseControl()` |
| `fill_form` (Unreleased) | completes ordinary fields for this task | `submit(values)`, `skip()` |
| `ask_user` | answers a question shaped by `answerType` / `options` | `answer()`, `skip()` |
| `confirmation` | allows or rejects an action | `confirm()`, `reject()` |
| `wait` | nothing — the system is waiting (rate limit, external event) | `retry()` |

A confirmation records the decision for that card; it does not establish
forced approval of all final actions through open browser/bash/harness paths.
Ordinary forms are not a channel for payment secrets or isolated sensitive entry.

`Interaction` is a union distributed over `type`, so `switch (request.type)`
narrows `request.payload` in each branch. Each method posts to the endpoint the
backend declared in the interaction's `actions[]`, so you never hard-code a route:

Create the token for this handler with `products: ["doAnything"]` plus explicit `scopes: [QoniScopes.BROWSER_USE_TAKE_CONTROL, QoniScopes.SITE_LOGIN_REQUEST, QoniScopes.SITE_LOGIN_CONFIRM]` after AccessKey policy preparation and user consent. The product permissions supply DoAnything manage; omit the site-login scopes when the task does not need login. `products: ["doAnything"]` alone cannot authorize `connectControl()`, `refreshControl()` or `releaseControl()`; follow the migration steps above before switching versions.

```ts
import type { InteractionHandle } from "@qoniai/qoni";

const handled = new Set<string>();

async function handleInteraction(handle: InteractionHandle) {
  const request = handle.interaction;
  // Creation, status updates and replays all call back: act once per pending id.
  if (request.status !== "pending" || handled.has(request.id)) return;
  handled.add(request.id);

  switch (request.type) {
    case "site_login": {
      const login = await handle.openLogin();   // { liveUrl, ... } of a live login browser
      await showToUser(login.liveUrl);          // resolves when the user clicks "I'm signed in"
      await handle.confirmSignedIn();           // saves the login, then the agent rechecks and continues
      break;
    }
    case "take_control": {
      // connectControl() resolves to the signed control URL, when the backend offers it
      const control = handle.can("connect_control") ? await handle.connectControl() : undefined;
      await showToUser(control?.liveUrl ?? request.payload.liveUrl);
      await handle.releaseControl();            // hand the browser back
      break;
    }
    case "ask_user":                            // payload: { question, answerType, options? }
      await handle.answer(await askUser(request.payload));
      break;
    case "confirmation":                        // payload: { summary }
      if (await approve(request.payload.summary)) await handle.confirm();
      else await handle.reject();
      break;
  }
}

const result = await run.wait({ onInteraction: handleInteraction });
```

Follow each card's declared actions and current state. A pending input question
may coexist with a control round. Releasing a control round — SDK/OBO pending or
Console active — never answers a login/credential ask; in current_task both are
`site_login` cards that end only through `confirmSignedIn()` after reliable save,
a declared explicit `skip()`, or expiry. Only legacy `secure_input` asks receive
a recheck reply on Console active release, which proves neither sign-in nor
persistence. Clarification and confirmation are never answered automatically.
The same interaction calls back again on every status change and on
reconnect replays, always with the same `id` and `type` — key your UI cards by
`request.id`. An update with content of its own replaces the card (a take-over
that became `active` carries its new `liveUrl`); when the backend settles an
interaction with an empty shell, the card keeps its original `payload`. A
`take_control` that arrives already `active` was started by the user, for
example from Console; show it if your UI offers control there. Methods: `answer(value)`, `skip()`, `confirm()`,
`reject()`, `openLogin({ siteId?, profileId? })`, `confirmSignedIn()`,
`connectControl()`, `refreshControl()`, `releaseControl()`, `retry()`,
`switchProfile()`. `connectControl()` and `refreshControl()` resolve to
`{ liveUrl, expiresAt?, status?, raw }`, where `liveUrl` is the browser-control URL
to show the user. `handle.can(kind)` reports whether the interaction currently
offers that action; calling a method the backend did NOT declare throws (so a
"recovery" button only exists when it actually works).

### Ordinary forms (Unreleased)

`fill_form` collects ordinary details for the current task. Render `payload.fields` using the exported `FormField` type, then call `handle.submit(values)` when the card declares `submit`. Keys are the exact `field.name`; select answers use option `value`, numbers stay numbers, and an address is `{ line1, line2?, city?, region?, postalCode?, country? }`. Required text/address values must be nonempty; optional text may be empty and `0` is valid. Unknown fields, wrong types/options, NUL and nonfinite numbers are rejected before transport and again by the backend on the current durable card.

```ts
if (handle.interaction.type === "fill_form" && handle.can("submit")) {
  await handle.submit({
    count: 0,
    method: "ship",
    address: { line1: "Synthetic road", city: "Singapore" },
  });
}
```

This is task-only collection. Sensitive fields, payment cards and `profileField` writes are unavailable here; passwords use browser sign-in/take-control. Use this locally built SDK with the matching W4 backend. This addition is unreleased; the source version is 0.10.0-rc.20261010.1. Final W6 synthesis and provider acceptance are separate.

**`ask_user` answers are structured.** `answer()` takes the value matching
`payload.answerType` — `text` → string, `number` → number, `boolean` → boolean,
`single_choice` → one `options[].value`, `multiple_choice` → an array of option
values — and throws `QoniValidationError` before sending anything that does not
fit. The wire still calls this type `clarification`; the SDK presents it as
`ask_user` (choices arrive as `{ value, label }` options).

**Sign-in takes two SDK calls.** Pass a `siteId` from `payload.sites[].siteId` to
`openLogin()`, or omit it when one site is listed; show its `liveUrl` only to the
current user. After the user signs in, call `confirmSignedIn()`.

For the **unreleased `current_task` policy**, the backend declares open/confirm
endpoints on the same DoAnything run and original login question L. Opening uses
the existing task browser, without navigating or opening a separate browser;
`login.sessionId` is the fixed control round C, also returned in
`raw.control_interaction_id`, while `raw.browser_session_id` identifies the browser.
Opening requests SITE_LOGIN_REQUEST + BROWSER_USE_TAKE_CONTROL; confirmation
requests SITE_LOGIN_CONFIRM + BROWSER_USE_TAKE_CONTROL + DO_ANYTHING_MANAGE.
Allow these policies on the AccessKey and obtain explicit user consent before
the coordinated migration above; `manage` cannot replace login/control permission.

One confirm HTTP `{login_session_id:C}` on the original declared endpoint saves
reliably, releases C and replies to L. The SDK sends neither Profile confirm nor
a second recheck. The deprecated `login.confirm()` shares this same request and
returns `state: "saved", active: false, probeResult: "agent_pending"` with the
unmodified response in `raw`. Saved does not mean verified: the agent must check
the page before continuing. Unknown/missing mode or mismatched L/C fails closed;
confirmation without a successful open fails locally. A 409 (including
`no_pending_login`) remains an error, with no ID replacement or automatic reopen.
503 save errors, timeout/lost responses and `site_login.invalid_response` leave
the original L/C available for an explicit retry; a lost success is acknowledged
only by the backend's exact saved history.

The legacy `/profiles/login` policy retains its single request/confirm scopes,
Profile save followed by the agent recheck, and existing `active/probeResult`
semantics, including the legacy `no_pending_login` recheck behavior. Shared slots,
concurrent calls and replacement guards apply to both policies: an old result
cannot confirm a newer round. Handles from the same RunHandle/MonitorHandle share
the session; a RunHandle from another `attach()` does not. Use
`openLogin()` → `confirmSignedIn()`; calling `login.confirm()` first is unnecessary.

The discriminant strings are also exported as constants so you can avoid bare
literals: `InteractionTypes` (`SiteLogin` / `TakeControl` / `AskUser` /
`Confirmation` / `Wait`; the deprecated `Clarification` now equals `AskUser`),
`InteractionStatuses`, and `ActionKinds` (the `handle.can(...)` action names).
Authorization scope strings have the same treatment — `QoniScopes` (every
individual scope), `QoniProductScopes` (the per-product `read`+`manage` pairs the
`products` sugar expands to), and `QoniScopeBundles` (curated bundles). Use them in
place of hand-typed strings:

```ts
import { InteractionTypes, ActionKinds, QoniScopes } from "@qoniai/qoni";

if (handle.type === InteractionTypes.AskUser && handle.can(ActionKinds.answer)) {
  await handle.answer("the blue button");
}
```

### Wire-Level Escape Hatch

Supported low-level methods live under `qoni.<product>.api.*` (e.g. `qoni.doAnything.api.createSession`, `qoni.deepResearch.api.followUp`, `qoni.track.api.createMonitor`). These mirror the backend HTTP contract directly — snake_case fields, double-envelope events, single-ID `/{product}/runs/{run_id}` addressing for run operations — and their shapes may evolve with the API. They are not part of the frozen public contract.

`event.raw.event` is the **raw wire event type** — an internal transport name (`run.action.started`, `run.section_completed`, …) whose naming is historical and inconsistent, exposed as a plain string. This is an implementation detail, not the product API: developers match on the curated `event.type` above. The full wire-type catalog is intentionally NOT exported — reach for `event.raw.event` (a string) only when you need an exact wire match the curated layer folds into `progress` (e.g. telling a specific browser action apart).

`QoniScopes.BROWSER_USE_TAKE_CONTROL` authorizes the browser-control interaction methods and raw take/refresh/release calls described above. Site Login scopes (`QoniScopes.SITE_LOGIN_REQUEST`, `QoniScopes.SITE_LOGIN_CONFIRM`) back `InteractionHandle.openLogin()` and `confirmSignedIn()` on run interactions.

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
//     "monitorCreated" string   — deprecated legacy monitor wire type
//     "triggered"      string   — deprecated legacy monitor wire type
//     "checkCompleted" boolean  — deprecated legacy monitor wire type
//   RICH events — event.data is a small object:
//     "message"        { text, role }
//     "interaction"    the typed Interaction object (HITL) — see Interactions
//     "screenshot"     { pageUrl?, step? }   + the decoded image on event.image
//     "browserLiveUrlChanged" { liveUrl, supportsLivePump, forceViewerReload, providerSessionId? }
//     "done"           { output, succeeded, terminalReason }
// Common to every event: runId, at (ISO 8601), isTerminal (true only for "done"),
// raw (the original wire event — escape hatch).
```

Each product handle is typed to its own subset:

| Product | `event.type` set |
|---|---|
| Do Anything | core: `progress` / `message` / `interaction` / `screenshot` / `browserLiveUrlChanged` / `done` |
| Web Search | core + `resultsReady` |
| Deep Research | core + `phase` / `sectionReady` (the outline gate arrives as an `interaction`) |
| Track (`MonitorHandle`) | No SSE endpoint; historical MonitorEvent types are deprecated. Read checks with runs()/run(). |

For a live browser preview, listen for `browserLiveUrlChanged` and show
`event.data.liveUrl` in your viewer. A run can switch browser tabs after its
first URL arrives, so update the viewer on later events too. Remount an
existing viewer when `forceViewerReload` is true. The URL grants access to the
browser view; keep it out of public logs.

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
| `QoniUnsupportedError` | Retained surface has no backend operation (code: `unsupported.operation`); zero HTTP. | Use the alternative named in the error. |
| `QoniValidationError` | Local input check failed before any request (bad scope string, silent delegation missing a user). | Fix the call — the message states the correct form. |
| `QoniAuthError` | AK/SK signing rejected by Qoni (bad/rotated credentials). | Check `accessKey` / `secretKey`. |
| `QoniPermissionDeniedError` | The AccessKey or delegation token lacks a required scope (403). | Check the AccessKey permission policy and request the missing scope with `delegateToken`. |
| `QoniTokenExpiredError` | The delegation / product token expired. | Re-establish only currently permitted access; do not expand the old grant or replay an uncertain write. |
| `QoniDelegationRequiredError` | A product call was made without `token`, or with a raw token the gateway won't accept directly. | Pass `delegation.data.token` to the product call. |
| `QoniRateLimitError` | Rate limited (429). | Back off for a safe read; reconcile any uncertain write before an explicit retry. |
| `QoniTimeoutError` | A request (or `wait({ timeoutMs })`) timed out. | For an existing run, `attach()`/read status. A timed-out creation may have committed; do not submit a replacement automatically. |
| `QoniTaskSubmissionUnknownError` (corrected candidate) | `runWithMemory` dispatched a Task POST without a definitive outcome. | `task.submit_unknown`, `submissionUnknown: true`, `retryable: false`; reconcile the original request, never automatically resubmit. |
| `QoniUpstreamError` | A downstream service failed (5xx / upstream exchange failure). | Reconcile writes first; `retryable` does not prove that a side effect was rolled back. |
| `QoniError` | Base class / any other code. | Inspect `err.code`. |

JSON requests are **not** automatically retried. `err.retryable` describes an
error category, not permission to replay a write; SSE reconnect is separate.
A 202/`ready: false` response means accepted or pending, not completed. Keep the
original run/provisioning/operation ID. Read it back when supported; a missing
receipt, 404 or elapsed time does not prove the first write had no effect.

When the user narrows or revokes consent in the supported user permission UI,
stop scheduling calls that need the removed scopes and respect backend denial.
Do not silently recreate a wider grant, switch user/App or refresh into extra
permissions. This candidate exposes no `genauth.consents.revoke()` SDK method.
Stopping a local wait does not itself stop a server Task or prove an external
operation has stopped. [Failure handling examples](./docs/delivery-examples/README.md)
keep these outcomes separate.

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
    // Stop this operation. Obtain explicit consent only if the user wants
    // additional permissions; never broaden the existing Task/grant silently.
  }

  if (
    error instanceof QoniRateLimitError ||
    error instanceof QoniTimeoutError ||
    error instanceof QoniUpstreamError
  ) {
    // Do not repeat run creation or another write here. Read the original
    // operation when its ID is known; otherwise preserve the unknown outcome.
  }

  throw error;
}
```

Common first-run errors:

| Error | Meaning | Next step |
| --- | --- | --- |
| `agent must be a string` | The online delegation API currently expects `agent` to be a string id. | Pass `agent: "memory-agent"` rather than an object. |
| `eak.delegation.user_not_bound` | The `userId` is not in the GenAuth userpool bound to this Qoni credential. | Use a real user id from `currentUser` or from the same bound userpool. |
| `eak.delegation.no_allowed_scopes` | The AccessKey has no permission scopes enabled. | In Qoni Console, open its Permission scope settings and enable the policy required by this call. |
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

Structured Pi questions and ordinary forms in this unreleased phase use the main agent entry; subagents explicitly reject parameters they cannot forward.

Configuring a longer run duration does not establish uninterrupted one-hour
waiting across credentials, browser and provider lifetimes. Confirmation cards
and ordinary forms also do not enforce approval or secret isolation across
open browser/bash/harness channels. Those full-business guarantees remain unavailable.

### Personal Agent provisioning and optional mailbox (Unreleased)

This candidate interface is available for local integration. Backend business validation is still incomplete; this example does not establish
external mailbox-provider support.

`genauth.agents.create/get/bind` use the existing signed transport. Persist the first `idempotencyKey` and complete request before creation; reuse both for retries. A `ready: false` receipt describes accepted or recoverable work, not completed creation. Never replace an uncertain request with a new key. With a requested mailbox, `ready: true` requires the original Mail operation to succeed, its resource to be active, and IAM to confirm readiness.

```ts
const request = { displayName: "My assistant", mailboxLocalPart: "my-assistant", idempotencyKey: savedRequestKey };
let result = await qoni.genauth.agents.create(request);
// Persist provisioningId, then resume this same operation later.
result = await qoni.genauth.agents.get({ provisioningId: result.provisioningId });
if (result.state === "ready" && result.ready) {
  result = await qoni.genauth.agents.bind({ provisioningId: result.provisioningId, accessToken: currentUserAccessToken });
}
```

Binding requires the current person's valid GenAuth user token and matching pool/App authority; a browser-provided owner ID is not accepted. Never-bound Agents are reclaimed seven days after IAM readiness; binding clears that deadline. Definitive failures are compensated promptly; uncertain provider results retain their original operation for reconciliation. Inspect `state/errorCode`; the SDK does not automatically replay uncertain writes. Keep tokens and management credentials on a trusted application server and out of logs. This feature is off by default and requires provisioning, the existing Mail worker, and IAM service authentication.

### Recover a Do Anything acceptance receipt

This additive W11 interface requires a Web Agent deployment with the matching
request acceptance API. Keep one stable `requestId` and the original payload for
each submission. The SDK does not retry writes automatically.

```ts
const requestId = "checkout-task-20261009-001";
const run = await qoni.doAnything.run({ token, prompt, requestId });
// If the create response was lost, read the original key. Do not create another
// task and guess which one is the original.
const receipt = await qoni.doAnything.api.getRequest<{ id: string }>({ token, requestId });
const trace = await qoni.doAnything.api.getTrace({ token, runId: receipt.data.id });
```

`getRequest` returns the usual run envelope (use a response generic when reading
its fields in TypeScript). Include the original `sessionId` for a follow-up.
Keys are isolated by the authenticated project, user, App/credential, Agent and
initial/follow-up session. A different canonical payload for the same key returns
`409 request_payload_conflict`. `409 request_in_progress` and a missing receipt
are not proof that submission failed: read the original key first. If the
original request never reached the server, that lookup can keep returning 404.
You may explicitly resubmit task acceptance with the **same requestId and
identical payload**, including the original sessionId for a follow-up, under
the same authenticated identity namespace. An accepted request returns its
original Task; no new key should be generated to guess the outcome. The SDK
does not automatically retry POST requests. This does not authorize repeating
an external action whose result is unknown. Canceling or expiring a run does
not free its key.

Calling `runWithMemory` again recalls memory again and may change the actual `instructions`, so after an unknown outcome prefer `api.getRequest`/`api.getTrace` readback using the original request key and returned run ID, and never treat newly recalled content as the original payload to resubmit.

Runs with acceptance keys retain their Task/Event receipts. Hard-deleting their
session returns `409 request_receipt_retained`; cancellation remains available.
Supporting erasure while retaining deduplication needs a separate retention
model. Operational database erasure is outside this receipt guarantee.

Trace contains only original identity references and safe states. Missing grant,
consent or operation evidence stays missing. A completed run is distinct from an
external operation result: `external_result: "unknown"` requires checking the
original website/service. Acceptance deduplication does not guarantee that a
website order or email never repeats, and trace is never an approval credential.

### Protected form input (local candidate)

A trusted application UI can use `run.interactionHandle(card).submitSensitive(values)` for a current `fill_form` whose protected text field is named `qoni_sensitive_<customData key>`. Use the original Web Agent product access token that created the Task; a delegation token or a fresh token exchange cannot replace that source. The SDK sends each protected value directly to the configured GenAuth endpoint and sends only its opaque reference in the original Web Agent reply. Ordinary `submit()` rejects these fields. Do not call this API from a model or an open browser tool.

For explicit recovery, use `qoni.doAnything.forms.prepare({ token, runId, interactionId, fieldName })`, then `intake({ token, ref, value })`, `status({ token, ref })`, or `cancel({ token, ref })`. Prepare preserves the original reference and deadline; it does not authorize another intake. Persistence additionally requires the server allowlisted non-security-code definition `cardNumber`, explicit `persist: true` (or `persistFields` on `submitSensitive`), current UDF write permission and existing AES encryption. Every other or ambiguous custom key is transient-only; caller labels/types cannot authorize storage. CVC/CVV is always transient, cannot be persisted, and has no digest. Missing or unsupported UDF configuration fails closed.

`intake`, cancellation and reference-reply uncertainty use `submissionUnknown: true` and `retryable: false`; no POST is automatically retried and no raw response body is retained in these errors. Read the original reference/Task after a missing response. Explicit cancel removes the temporary value only when acknowledged. GA revocation denies access; next authenticated access attempts cleanup, while the fixed Redis TTL independently reclaims the value. This is not a claim of instantaneous erase at revocation or deployed backup isolation. The original card deadline (`card_deadline`) remains unchanged, including the default hour. GenAuth records `value_deadline` once as the earliest of that deadline, the original run/source deadline and issue time plus five minutes; `expires_at` is its compatibility alias. All three fields use epoch milliseconds. The value expires independently while the card may still be waiting. Only an unexpired `awaiting` reference accepts one intake; `writing`, `unknown`, `consumed` and `expired` cannot be resubmitted or replaced on the same card. Prepare/status never slide the deadline or create a replacement reference. A read of `ready` resolves the original intake only after its SQL commit was confirmed and its Redis ready transition completed; it does not authorize another POST. Production sensitive release remains disabled until the target platform's isolation is demonstrated; this candidate does not claim automatic fill, payment or external delivery.
