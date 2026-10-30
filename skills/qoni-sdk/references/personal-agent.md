# Personal Agent Features

A personal agent gives each person their own agent: it chats, works in its own
cloud computer and browser, asks the person to sign in or confirm, lets them
take over the browser, follows up later, watches pages on a schedule and keeps
files. This reference covers the SDK calls behind each of those, one feature at
a time, with what goes wrong when they are used wrong. How your app stores
state, signs people in, deploys and presents all this is your app's design.

`personal-agent-calls.ts` next to this file has one function per call below. It
is compiled against the SDK on every build, so names and fields in it are exact.
Each section ends with the functions it covers.

## Contents

- [Who holds what](#who-holds-what)
- [Pool users](#pool-users)
- [Per-person tokens](#per-person-tokens)
- [Sessions and runs](#sessions-and-runs)
- [Following a run](#following-a-run)
- [Cards](#cards)
- [Sign-in rounds](#sign-in-rounds)
- [Screens and live views](#screens-and-live-views)
- [Files](#files)
- [Credits](#credits)
- [Follow-ups](#follow-ups)
- [Track](#track)
- [Troubleshooting](#troubleshooting)

## Who holds what

- **The AccessKey** acts as any person in the workspace's user pool, reads every
  pool user and spends the workspace's credits. It lives in one server process
  (`new Qoni({ accessKey, secretKey })`) and is never sent anywhere.
- **A token** acts for one person only (WebAgent scopes, about 14 days). A client
  built with `new Qoni({ webAgentHost })` and no keys runs everything below
  except creating pool users and tokens, on a server or in a page (bundlers pick
  the `browser` build; WebAgent accepts token calls from any origin).
- **The person** a token is for always comes from your own session, never from a
  request body, query string or header the client controls.

Code: `qoni`, `tokenClient()`

## Pool users

Qoni issues tokens only for users of the pool bound to the AccessKey's
workspace. Anyone else fails with 403 `userId is not valid for this Qoni
credential` (or `eak.delegation.user_not_bound`). If people sign in with your own
accounts, create one pool user per account and store its id:

```ts
const created = await qoni.genauth.users.create({ username: `pa_${accountId}`, externalId: `pa:${accountId}` });
const poolUserId = created.data.userId;
```

- Give it no email and no password: it must not sign in anywhere, and must not
  take an email another pool member owns.
- It is how Qoni tells people apart: website sign-ins, files, follow-ups and
  Tracks belong to it. Two accounts never share one; one person keeps theirs.
- If people sign in through Qoni's hosted pages (`genauth.auth.createLoginUrl`),
  `user.id` is already a pool user; skip this.

Code: `createPoolUser()`

## Per-person tokens

```ts
const grant = await qoni.webAgentGrant({
  userId: poolUserId,
  products: ["doAnything", "track"],
  scopes: [QoniScopes.SITE_LOGIN_REQUEST, QoniScopes.SITE_LOGIN_CONFIRM, QoniScopes.BROWSER_USE_TAKE_CONTROL],
  agent: "my-app", // when one AccessKey serves several apps
});
// { token, expiresAt, webAgentHost, userId, scopes }
```

- **One constant set.** `products` expands to each product's `read` + `manage`;
  the three concrete scopes are in no bundle and let the agent ask for a site
  sign-in and the person take over the browser. Use the same set for every grant
  of every person; the AccessKey policy must allow all of it
  (`eak.delegation.scope_not_allowed` otherwise).
- **A broader grant ends older tokens.** When a grant asks a person for scopes
  beyond what they had, every earlier token of theirs stops working. Runs started
  with one fail within seconds: `status: "failed"`, `terminalReason: "expired"`,
  `failureReason: "subagent_failed"`, `failureDetail` containing "original
  authority closed". Grants with the same or fewer scopes change nothing. On that
  signature: drop the cached token, grant again, re-run once (a new session with
  the old token does not help). Two systems granting the same person different
  sets keep ending each other's tokens.
- **`agent` names an app.** When one AccessKey serves several apps, pass one
  constant `agent` per app: WebAgent then shows each app only the sessions it made
  for a person, with their runs, files, Tracks, follow-ups and notifications.
  Website sign-ins stay the person's own in every app. Without `agent` the grant
  is `"sdk"`, shared by every app that names none. Changing `agent` does not end
  older tokens.
- **Renew early.** Cache one token per person and renew it a day before
  `expiresAt` (epoch ms): a run's cards are answered with the token the run
  started with, and a person may answer hours later.

Code: `PRODUCTS`, `TASK_SCOPES`, `grantFor()`, `needsRenewal()`, `isAuthorityClosed()`

## Sessions and runs

A session is one cloud computer with its files, browsers and the agent's memory
of the conversation. A run is one turn in it.

```ts
const run = await client.doAnything.run({
  token,
  prompt,
  taskScopes: TASK_SCOPES,                       // or it can never ask for a sign-in or hand over its browser
  session: sessionId ? { sessionId } : undefined, // continue a conversation
});
// store run.id and run.sessionRef.sessionId before anything else
```

- **Prewarm.** `doAnything.sessions.prewarm({ token })` when the person opens a new
  conversation or starts typing: the next new run takes over a computer that is
  already up (hosted Qoni, 2026-10-29: first words after about 6 s, against 10–18 s).
- **`taskScopes`.** A token that holds the three concrete scopes is not enough; the
  run itself must be created with them.
- **One conversation, one session.** Continue a finished session with
  `session: { sessionId }`. Do not start a second run in a session whose run is
  still going or waiting for the person. Right after a run ends, a new one may get
  `409 task_in_progress` while the session settles: retry after 1.5, 3 and 4.5 s.
  Start a new session only on a real failure.
- **Credits.** An error whose code or message contains `insufficient_credits`
  (at start, or as `failureReason` at the end) is never retried.
- **Model.** Omit `model` for the platform default, or pass a `value` from
  `doAnything.api.listModels({ token })`. Unknown option keys go to the backend
  as they are; drop an optional one a 422 names.

Code: `prewarm()`, `startRun()`, `retryWhileSettling()`, `isOutOfCredits()`, `models()`

## Following a run

`run.wait({ onEvent, onInteraction, onWireEvent })` or `run.events()` deliver the
run's events until it ends.

- **Messages.** A streamed reply arrives many times with the same `id`, and `text`
  is the whole reply so far: upsert by `runId:id`. Never keep only `final`
  messages: a reply streamed before a tool call never becomes final. `done` with a
  `stopReason` starting with `tool` means the agent is about to work again.
- **The answer.** If the agent never spoke, the answer is only in
  `result.output.answer` (or the string output).
- **Screens.** The `browsers` event lists every open browser (the lead's
  `id: "main"` first). An empty list does not mean the computer is gone.
- **Restarts.** A run keeps going at Qoni when your process stops. Attach again
  with `doAnything.attach(runId, { token, session: { sessionId } })`: its events
  replay from the start, so stable message ids and card ids make the replay
  harmless.

Code: `followRun()`, `answerOf()`, `attachRun()`

## Cards

When a run needs the person it emits an interaction; `onInteraction` hands you an
`InteractionHandle`. Act only on `status === "pending"`, and only through the
handle's declared actions (`handle.can(kind)`).

| `type` | Shows | Person's action → method |
| --- | --- | --- |
| `ask_user` | a question (`payload.answerType`: text, number, boolean, single/multiple choice) | `answer(value)` or `skip()` |
| `fill_form` | `payload.fields` | `submit(values)` with exact field names |
| `confirmation` | `payload.summary` (an email to send: `payload.mail`) | `confirm()` / `reject()` |
| `site_login` | the site, `payload.sites[0]` | `openLogin()` → `liveUrl`; `confirmSignedIn()` or `skip()` |
| `take_control` | "take over" | `connectControl()` → `{ liveUrl, expiresAt }`; `refreshControl()`; `releaseControl()` |
| `wait` | nothing | — |

- The same interaction is delivered again on every status change and on replays:
  store it by `id`, never act twice.
- A 409 on any action means the card is no longer current (answered elsewhere,
  replaced, or the run ended). Close it; never look up another id and retry.
- Qoni's "resolved" update can arrive before your call returns.
- Text the person types while a text question is open is the answer to it:
  `answer(text)`, not a new run.
- Questions and confirmations are never answered automatically.
- Refresh a take-over URL shortly before `expiresAt`.

Code: `act()`, `isStaleCard()`

## Sign-in rounds

- `confirmSignedIn()` works only on the handle (same process) whose `openLogin()`
  started the sign-in. After a restart and re-attach, the person opens the
  sign-in again.
- `openLogin()` hands the person the agent's browser through a `take_control`
  round that `onInteraction` never shows (it belongs to the sign-in card). Track
  those rounds from `onWireEvent` (`run.interaction`, `data.type ===
  "take_control"`, pending only) and, after `confirmSignedIn()` or `skip()`, call
  `run.interactionHandle(payload).releaseControl()` for each (409 = already handed
  back). Otherwise the run can sit waiting for its browser long after the person
  moved on.
- If the person signs in inside the live view and never confirms or skips, the
  agent does not notice and waits until its wait budget runs out.

Code: `SignInRounds`

## Screens and live views

- `browsers[].url` and every `liveUrl` are fully interactive and carry their own
  credential: show them only to their person, never log or forward them.
- `fit=1` on a full-screen phone view makes the browser take the view's shape
  (sites show their mobile layout). It changes the one browser the agent uses:
  keep the plain URL for thumbnails, and switch fitted views back (then wait about
  0.4 s) before the next run.
- An open live view counts as someone watching and keeps the computer awake (and
  billed).
- `doAnything.browsers.list({ token, sessionId })`: the screens of a conversation
  with none recorded; empty while the computer sleeps.
- A helper browser with `need` (`login` / `help`) is paused for the person: show
  its `url`, then `browsers.control({ …, action: "done" | "skip" })`. `take` is
  only for stepping into a helper that is still working (then `release`). The
  lead's sign-ins are always cards; `browserId: "main"` is rejected. There is no
  call to take over the lead's browser at an arbitrary moment.

Code: `fittedUrl()`, `screens()`, `helperDone()`

## Files

- `doAnything.files.list({ token, sessionId, path, depth })` returns `{ source:
  "live" | "saved" | null, items, truncated, savedAt }`. While the computer sleeps
  it answers from the copy saved after the last turn; it never wakes it.
- `files.read({ token, sessionId, path })` returns the bytes. Reject `..` in paths
  you pass through.
- `files.watch` reports `created` / `changed` / `removed` within about two seconds
  and ends when the computer goes to sleep.

Code: `listFiles()`, `readFile()`

## Credits

- Every person's runs spend the workspace's credits.
- `doAnything.sessions.credits({ token, sessionId })` →
  `{ metered, runs: [{ runId, credits, status }] }`: `credits` is a decimal
  string and `status` goes `pending` → `estimated` → `current`, a few minutes
  after the run ends. `metered: false`: the workspace has only been used through
  tokens; opening its WebAgent page in the console once binds it.
- `workspace.credits({ token })` → `{ available }`.

Code: `runCosts()`

## Follow-ups

The agent schedules a follow-up itself when the person asks it to check again.

- `proactive.list({ token, limit })` lists them; `proactive.cancel` and
  `proactive.runNow` act on one.
- A check that is running (or ran) is a run in its conversation's session: attach
  to it to see what it says.
- Cancel a conversation's scheduled follow-ups when the person deletes the
  conversation, or they wake up later anyway.

Code: `followUps()`

## Track

```ts
await client.track.create({
  token, prompt, title,
  schedule: { kind: "interval", intervalSeconds: 3600 }, // ≥ 600
  // or { kind: "daily", at: "09:00", tz: "Asia/Singapore" }
});
```

- `track.list({ token })` can be slow on large workspaces; give the client a
  longer `timeoutMs` than the 30 s default if lists time out.
- `track.api.listRuns({ token, monitorId, limit })` returns wire (snake_case)
  checks: `run_id`, `created_at`, `ended_at`, `outcome`, `headline`, `step`.
- `track.attach(id, { token }).events()` replays old checks first: ignore events
  older than the newest check you know. `progress` text mixes tool names and
  reasoning; show a check's `step` instead.
- Pause/resume `track.api.updateMonitor({ …, status })`; run now
  `track.api.runNow` (409 = a check is running); delete `track.api.deleteMonitor`;
  mark read `notifications.markRead({ token, trackId })`.
- A 403 or a consent error means the token cannot use Track; a 404 on the list
  means this deployment has no Track.

Code: `createTrack()`, `tracks()`, `trackChecks()`

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Every run fails in seconds: `expired`, `subagent_failed`, "original authority closed" | A broader grant for the same person ended the token | Constant scopes; drop the token, grant again, re-run once |
| 403 `userId is not valid for this Qoni credential` / `eak.delegation.user_not_bound` | Not a user of the workspace's pool | Create the pool user; use only the stored id |
| `eak.delegation.scope_not_allowed` | The AccessKey policy does not allow a scope | Allow it in the console, or drop it from the set |
| Runs on a new AccessKey rejected with "original authority closed" from the first run | The key is not bound to the workspace's business App or wallet | Bind them in the console |
| A run never asks for a sign-in or a take-over | Created without `taskScopes` | Pass the three concrete scopes as `taskScopes` |
| `409 task_in_progress` on a continue | The session's last run is still settling | Retry after 1.5, 3, 4.5 s |
| After "Skip" or "signed in", the run waits a long time | The sign-in browser was never handed back | `SignInRounds` |
| `confirmSignedIn()` fails after a restart | Sign-in sessions live in the handle that opened them | Open the sign-in again |
| Replies missing or doubled | Only `final` messages kept, or unstable ids | Upsert by `runId:id` |
| One conversation has many computers | A new session on every busy or failed continue | One session per conversation; retry 409 |
| The agent browses in a phone layout | A `fit=1` view is still open | Switch it back before the next run |
| The screen vanishes after a run | Cleared on an empty `browsers` list | Keep the last screens |
| Track shows tool names or old checks | `progress` text shown; replay not filtered | Show `step`; skip older checks |
| `sessions.credits` says `metered: false` | Workspace only used through tokens | Open its WebAgent page in the console once |
| Another app's conversations show up for the same person | Both apps grant without `agent` (or with the same one) | One `agent` per app |
