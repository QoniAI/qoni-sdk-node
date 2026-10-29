# Building A Personal Agent App On Qoni

A personal agent app gives each of its users their own agent: it chats, opens
websites in its own cloud browser, asks the person to sign in or confirm,
lets them take over the browser, follows up later, watches pages on a schedule
and keeps files. This guide is the integration of a production app of that
kind (phone-first web app, Node.js backend, `@qoniai/qoni` 0.10.x), with the
mistakes it made along the way turned into rules.

`personal-agent-server.ts` next to this file is the same integration as
compilable code. It is checked against the SDK on every build, so method names
and fields in it are exact. Comments there cite the rule numbers below.

## The Shape

```
browser / phone app ──(your session cookie)──▶ your backend ──(AccessKey, per-person tokens)──▶ Qoni
         ▲                                          │
         └──────── your own event stream ◀──────────┘  (messages, cards, screens, follow-ups)
```

- **One long-lived Node.js process holds the AccessKey** and talks to Qoni. It
  keeps run streams open for minutes, re-attaches after restarts and polls
  follow-ups, so it cannot be a set of stateless functions unless you move all
  of that state into a database and a queue.
- **The browser sees only your session cookie and your own API.** It never
  receives the AccessKey, a Qoni token, or the Qoni user id of anyone.
- **Your database keeps**: accounts and sessions, which Qoni user each account
  is, one cached token per person, conversations and their messages, every
  run (id, session id, status), cards (interactions), screens, follow-ups and
  Track rows you mirror. Put it on persistent storage.
- **Qoni keeps**: the agent's computers and their files, each person's website
  sign-ins, follow-ups and Tracks, and run history.

## Before You Start

In the Qoni console, for the workspace your app will bill:

1. Create an AccessKey. Its permission policy must allow every product and
   scope you will grant (see rule 4): `doAnything`, `track`, and the concrete
   scopes `webagent.site_login:request`, `webagent.site_login:confirm`,
   `webagent.browser_use:take_control`. A scope the policy does not allow fails
   the grant with `eak.delegation.scope_not_allowed`.
2. Make sure the workspace is bound to a user pool. Every person who uses your
   app becomes a user in that pool (rule 3).
3. Open the workspace's WebAgent page in the console once. A workspace that is
   only ever used through tokens can report `metered: false` for its runs until
   it has been opened there (see Troubleshooting).
4. Keep `QONI_ACCESS_KEY` and `QONI_SECRET_KEY` in the server's secret store.
   Never in the repository, the frontend bundle, logs, or error messages.

## Identity And Tokens

### Rule 1. The AccessKey stays in one server process

The AccessKey can act as any person in the pool, read every pool user's
profile, and spend the workspace's credits. Construct one `Qoni` per process
from server environment variables; never construct it in browser or mobile
code, and never send it anywhere.

### Rule 2. Sign people in with your own accounts; resolve them from your session

Most consumer apps should own sign-in (email + password, phone code, social
login) and never send people to a third-party page. The person a token is for
always comes from **your** server session, never from a request body, query
string or header the client controls.

If you sign people in with passwords: hash with scrypt or argon2, return the
same error for unknown email and wrong password, compare in constant time,
rate-limit failures per account, and rate-limit sign-ups per source **and**
globally, because every sign-up creates a user in the pool (rule 3). Count the
source from `X-Forwarded-For` only behind a proxy that overwrites it.

Alternative: Qoni's hosted sign-in (`genauth.auth.createLoginUrl` /
`exchangeLoginCode`, see SKILL.md "Hosted Sign-Up And Sign-In") signs people
straight into the pool, so `user.id` is already a pool user and rule 3 is not
needed. You must register your callback on the business App, store and check
`state` yourself (the SDK does not), and your domain must be allowed by the
hosted page's bot protection or verification codes are blocked. Most apps
choose their own sign-in.

### Rule 3. Each account is one user in the workspace's user pool

Qoni only issues tokens for users of the user pool bound to the AccessKey's
workspace. A token for anyone else fails with 403 `userId is not valid for this
Qoni credential` (or `eak.delegation.user_not_bound`). So when your sign-up
creates an account, create its pool user and store the returned id:

```ts
const created = await qoni.genauth.users.create({
  username: `pa_${accountId}`,       // unique, not guessable from the email
  externalId: `pa:${accountId}`,     // lets you find your users in the pool
});
const poolUserId = created.data.userId;
```

- Give it **no email and no password**. It must not sign in anywhere, and it
  must not take an email another pool member owns.
- Reserve the account first, create the pool user, then attach it. If the pool
  call fails, release the reservation so the person can retry.
- This user is how Qoni tells people apart: website sign-ins, files,
  follow-ups and Tracks belong to it. Two of your accounts must never share
  one pool user, and one person should keep the same pool user forever.

### Rule 4. Grant every person the same products and scopes, every time

```ts
const grant = await qoni.webAgentGrant({
  userId: person.poolUserId,
  products: ["doAnything", "track"],
  scopes: [
    QoniScopes.SITE_LOGIN_REQUEST,
    QoniScopes.SITE_LOGIN_CONFIRM,
    QoniScopes.BROWSER_USE_TAKE_CONTROL,
  ],
});
// grant: { token, expiresAt, webAgentHost, userId, scopes }
```

Decide the set once, as a constant, and use it for every grant of every person.
`products` expands to each product's `read` + `manage` scopes; the three
concrete scopes are not part of any product bundle and are what lets the agent
ask the person to sign in to a site and lets the person take over the browser.
Add `deepResearch` or `webSearch` to the constant only if you use them, and
then for everyone from that release on (see rule 5 for what changing it does).

### Rule 5. A broader grant kills a person's older tokens

When a grant for a person asks for scopes beyond what that person has had
before, every token issued to them earlier stops working. Runs started with an
old token fail within seconds with:

- `result.status === "failed"`, `terminalReason === "expired"`
- `failureReason === "subagent_failed"` (it is not a browser problem)
- `failureDetail` contains `Execution/wait budget or original authority closed`

Grants that ask for the same or fewer scopes do not invalidate anything.

- Never vary scopes per feature or per request; one constant set (rule 4).
- When you do widen the set in a release, expect each person's first run to
  hit this once: on that exact signature, drop the cached token, grant again,
  and re-run the turn **once**. Starting a new session with the same token
  does not help.
- Two systems issuing tokens for the same pool user with different scope sets
  will keep killing each other's tokens. One owner issues tokens per person.

### Rule 6. Cache one token per person; renew early

The token is accepted for about 14 days (`expiresAt`, epoch ms). Cache it per
person on the server and renew when less than a day remains. A run's cards are
answered with the token the run started with, and a person may answer a card
hours later.

## Runs

### Starting a turn

Prewarm first: when the person opens a new conversation or starts typing in
one, call `qoni.doAnything.sessions.prewarm({ token })` (with `model` if the
first run will not use the default). Their computer boots while they type and
the first run takes it over: on hosted Qoni the first words of a new
conversation came after about 6 s with a prewarm, against 10–18 s without.

```ts
const run = await qoni.doAnything.run({
  token,
  prompt,
  taskScopes: TASK_SCOPES,                  // same three concrete scopes
  session: previous ? { sessionId } : undefined,
});
// run.id, run.sessionRef.sessionId — store both before doing anything else
```

- **`taskScopes`**: a run can only ask for a sign-in or hand over its browser
  if it was created with these scopes. A delegation that contains them is not
  enough on its own.
- **Model**: omit `model` to use the platform default, or pass a `value` from
  `qoni.doAnything.api.listModels({ token })`. Do not hard-code model ids you
  have not seen in that list.
- Unknown option keys are sent to the backend as-is. If you send an optional
  backend field the SDK does not type (for example `reasoning_effort`), handle a
  422 that names it by starting the run again without it.

### Rule 7. One conversation, one session; do not spawn extras

A Qoni session is one cloud computer with its files, browsers and memory of the
conversation. Map each of your conversations to the session of its latest run:

- Last run finished (succeeded, failed, canceled): continue it with
  `session: { sessionId }`.
- Last run still running or waiting for the person: either queue the message,
  route it to the run's open question (rule 9), or start a new session
  deliberately. Do not fire a second run into a busy session.
- `409 task_in_progress` right after a run ends means the session is still
  settling: retry after 1.5, 3 and 4.5 seconds. Start a new session only on a
  real failure, and log it; one conversation quietly growing six computers is
  how this goes wrong.
- `insufficient_credits` (code or message) is never retried.
- Title conversations from the person's first message, not from Qoni's session
  title (which starts with your preface, rule 12).

### Rule 8. Render messages by id; the final answer may only be in the output

```ts
await run.wait({
  onEvent: (event) => {
    if (event.type === QoniEventTypes.Message && event.data.role === "ai") {
      upsert(`${run.id}:${event.data.id}`, event.data.text, event.data.done);
    }
  },
  ...
});
```

- A streamed reply arrives many times with the same `id`; `text` is the whole
  reply so far. Upsert by id. Derive your message id from the run id and the
  event id so a replay after reconnect or re-attach overwrites instead of
  duplicating.
- Do not render only `final` messages: a reply the agent streamed before a
  tool call never becomes final, and you lose it.
- Use `done` and `stopReason` for the typing indicator: `done` with a
  `stopReason` that starts with `tool` means it is about to work again; any
  other `done` means it has finished talking. A run keeps wrapping up for
  several seconds after its last sentence, so do not wait for the run's end to
  stop the indicator.
- If the agent never spoke, show `result.output.answer` (or the string output).
- On failure, show one plain sentence from `failureReason` (for example
  `insufficient_credits` → "Out of credits for now") unless the agent already
  explained the failure in its own words.

### Rule 9. Cards: store by id, render by status, answer from the handle

When a run needs the person it emits an interaction; `wait({ onInteraction })`
gives you an `InteractionHandle`. Store it in memory by `interaction.id` and the
card in your database; render by `status`.

| `type` | Show | The person's actions → handle method |
| --- | --- | --- |
| `ask_user` | the question in the chat (chips for `boolean` / `single_choice`) | `answer(value)` typed by `payload.answerType`, or `skip()` |
| `fill_form` | a form from `payload.fields` | `submit(values)` with exact field names |
| `confirmation` | `payload.summary`; if `payload.mail` exists, lay it out as the email `{to, subject, text}` | `confirm()` / `reject()` |
| `site_login` | the site from `payload.sites[0]` and "Open sign-in" | `openLogin()` → show `liveUrl`; "I've signed in" → `confirmSignedIn()`; "Skip" → `skip()` |
| `take_control` | "Take over" | `connectControl()` → `{ liveUrl, expiresAt }`; `refreshControl()`; `releaseControl()` |
| `wait` | nothing | — |

- The same interaction is delivered again on every status change and on stream
  replays. Dedupe by id; never act twice.
- When the person types while a text question is open, that text is the
  answer: call `answer(text)` instead of starting a new run.
- Questions and confirmations are never answered automatically.
- A 409 on any action means the card is no longer current (answered elsewhere,
  replaced, or the run ended). Close it in the UI; never look up another id
  and retry.
- Qoni's own "resolved" update can arrive before your action call returns.
  Let a late update fill in the outcome of a card you already closed.
- When the run ends, mark its still-pending cards expired.
- Refresh a take-over view's URL shortly before `expiresAt` (the reference app
  refreshes 60 seconds before).

### Rule 10. Hand the sign-in browser back after "signed in" or "skip"

`openLogin()` gives the person the agent's browser through a `take_control`
round that the SDK does not pass to `onInteraction` (it belongs to the sign-in
card). Track those rounds from `onWireEvent` (`run.interaction` whose
`data.type === "take_control"`, by `data.id`, pending only), and after
`confirmSignedIn()` or `skip()` call
`run.interactionHandle(payload).releaseControl()` for each, ignoring 409
(already handed back). Without this, a run can sit waiting for its browser
long after the person moved on. Skip ids that you are showing as cards: those
the person releases themselves.

### Rule 11. Sign-in confirmation needs the handle that opened it

`confirmSignedIn()` works only on the same `RunHandle` (same process) whose
`openLogin()` started the sign-in. After your server restarts and re-attaches
(rule 13), the person has to tap "Open sign-in" again before "I've signed in".

Make "I've signed in" impossible to miss: if the person signs in inside the
live view and never taps it (or "Skip"), the agent does not notice and keeps
waiting until its wait budget runs out.

### Rule 12. The first prompt of a session carries a short preface

Send it only with the first prompt of a new session (continuing a session
reuses the context):

- who the agent is and whose agent it is, and **today's date with the weekday**
  (without it the agent treats recent events as the future);
- answer briefly, in the language the person writes in;
- use its question, form, confirmation and sign-in tools instead of asking in
  plain text (otherwise you get questions you cannot render as cards);
- put the answer in the reply, never write it to a file and reply with a path;
- any conventions your UI relies on (see Files below).

Greeting run after sign-up: say hello in a sentence or two, say what it can do,
ask what to do first, and "Do not call any tools."

### Rule 13. Runs outlive your process

On shutdown, abort your `wait()`s; the runs keep going at Qoni. On start, for
every run your database still has as running or waiting:

```ts
const handle = await qoni.doAnything.attach(runId, { token, session: { sessionId } });
// then wait() on it exactly as for a new run
```

Events replay from the start, which is why message ids must be stable (rule 8)
and cards deduped by id (rule 9). If attaching fails, mark the run stopped.
What a restart loses: in-memory sign-in sessions (rule 11) and anything else you
kept only in memory. Deploying while people wait on cards interrupts them; check
for running and waiting runs before you deploy.

## The Cloud Computer

### Rule 14. A live view URL is a credential

`browsers[].url`, `site_login` and `take_control` `liveUrl`s are fully
interactive and carry their own credential. Show them only to the person they
belong to, inside an iframe (`allow="clipboard-read; clipboard-write;
fullscreen"`), and never log, store in analytics, or forward them.

On phones, append `fit=1` to the URL of a **full-screen** view (watching, signing
in, taking over): the browser lays itself out in the view's shape, so sites show
their mobile layout. It changes the one browser the agent is using, so:

- use the plain URL for thumbnails and small in-chat previews;
- before sending the next message (or running a Track now), switch open fitted
  views back to the plain URL and wait about 0.4 s, so the agent starts on a
  desktop-sized page.

### Rule 15. Screens: from the run, then from `browsers.list`

During a run, the `browsers` event gives every open browser: the lead agent's
(`id: "main"`) first, then each helper's with `label`, `status`, `activity`,
`need` and `userInControl`. An **empty list does not mean the computer is gone**;
keep the last screens after a run ends and only clear `need` / `userInControl`.
When the app opens on a conversation with no recorded screen, call
`qoni.doAnything.browsers.list({ token, sessionId })` once (empty while the
computer sleeps).

A helper with `need` (`login` / `help`) is already paused for the person: show
its `url`, and when they are done call
`browsers.control({ token, sessionId, browserId, action: "done" | "skip" })`.
`take` is only for stepping into a helper that is still working, and must be
followed by `release`. The lead's sign-ins are always run interactions
(rule 9), never `browsers.control` (`browserId: "main"` is rejected).

There is no API to take over the lead agent's browser at an arbitrary moment;
show "Take over" only when a card asks for it.

### Rule 16. Watching costs

An open live view counts as someone watching, which keeps the computer awake
(and billed). Show live previews only while a browser is working or waiting for
the person, close iframes the person cannot see, and prefer file listings
(which never wake a sleeping computer) to opening a view.

## Credits

### Rule 17. One workspace wallet; one plain sentence when it runs out

Every person's runs spend the workspace's credits. Starting a run can fail with
an error whose code or message contains `insufficient_credits`, and a running
run can end with `failureReason === "insufficient_credits"`. Never retry those.
Most consumer apps show one plain sentence and no workspace name, balance or
top-up page; per-person limits are yours to build.

Per-run cost: `qoni.doAnything.sessions.credits({ token, sessionId })` returns
`{ metered, runs: [{ runId, credits, status }] }` (`credits` is a decimal
string; `status` goes `pending` → `estimated` → `current`). It settles a few
minutes after a run ends; the reference app reads it 3, 15, 60 and 180 seconds
after the run and stops at `current`. `metered: false` means the workspace is
not metered (see Troubleshooting).

## Follow-ups And Track

### Rule 18. Follow-ups are scheduled by the agent; you mirror them

When the person says "check again tomorrow", the agent schedules a follow-up
itself. Your app:

- syncs `qoni.proactive.list({ token, limit: 50 })` when the person opens the
  app and about once a minute while it is open;
- for each check that is running (or ran recently) whose run you do not know,
  attaches to its run (`doAnything.attach(runId, { token, session })`) and puts
  what it says into the conversation of that session;
- offers cancel (`proactive.cancel`) and run now (`proactive.runNow`);
- cancels a conversation's scheduled follow-ups when the person deletes it,
  or they wake up somewhere else later;
- shows the follow-up's `note` as its title, and tells the agent in the preface
  to write the note as the thing to check ("Price of the blue sofa at Store X"),
  not as "come back to look".

### Rule 19. Track

Create with an explicit schedule:

```ts
await qoni.track.create({
  token, prompt, title,
  schedule: { kind: "interval", intervalSeconds: 3600 },     // ≥ 600
  // or { kind: "daily", at: "09:00", tz: "Asia/Singapore" }
});
```

- List with `qoni.track.list({ token })`. It can be slow on large workspaces;
  give the client a longer `timeoutMs` than the 30 s default if lists time out.
- Recent checks: `qoni.track.api.listRuns({ token, monitorId, limit: 10 })`
  returns wire (snake_case) items: `run_id`, `created_at`, `ended_at`,
  `outcome`, `headline`, `step`.
- Live progress: `qoni.track.attach(id, { token }).events({ signal })`. The
  stream **replays old checks first**: ignore events older than the newest
  check you know. Do not show `progress` text to people (it mixes tool names and
  reasoning); on progress, re-read `listRuns` (throttled) and show the check's
  `step`. On `done`, sync. Stop following after a while (the reference app: 30
  minutes) and fall back to polling.
- Pause/resume: `track.api.updateMonitor({ token, monitorId, status })`; run now:
  `track.api.runNow` (409 = a check is already running); delete:
  `track.api.deleteMonitor`; mark read: `qoni.notifications.markRead({ token,
  trackId })`.
- A 403 or a consent error means the person's token cannot use Track: show a
  re-authorize state. A 404 on the list means this deployment has no Track.

## Files

### Rule 20. Files never wake the computer; serve them through your backend

- `qoni.doAnything.files.list({ token, sessionId, path: "", depth: 5 })` returns
  `{ source: "live" | "saved" | null, items, truncated, savedAt }`. While the
  computer sleeps it answers from the copy saved after the last turn.
- `files.read({ token, sessionId, path })` returns the bytes; serve them from
  your own route (reject `..` in paths, set the content type from the
  extension).
- `files.watch` reports `created` / `changed` / `removed` within about two
  seconds and ends when the computer goes to sleep.
- Conventions travel in the preface. Example: "When the person wants a small
  tool or app, build it as one self-contained HTML file designed for a phone,
  save it in `~/widgets/` with a short `<title>`." After each run, list
  `widgets`, read new or changed `.html` files, and show them in a sandboxed
  iframe **without** `allow-same-origin`; give them storage through
  `postMessage` to your backend, never your origin's cookies or storage.

## Deployment Checklist

- One long-lived process; database on persistent storage.
- New conversations prewarm (`doAnything.sessions.prewarm`) when the person starts typing.
- Secrets only in the server environment; the key file mounted read-only.
- Session cookie: `HttpOnly`, `SameSite=Lax`, `Secure` on https.
- Every route other than sign-in and health returns 401 without a session.
- No "demo user" or auth bypass switch reachable in production.
- Sign-up and sign-in rate limits; shared storage for them if you run several
  instances.
- Log error codes, not request bodies, tokens, codes, `state` values or live
  URLs.
- Your client event stream: server ping every ~15 s, client reconnect with the
  last sequence number after ~45 s of silence.
- Before deploying: no runs running or waiting on cards.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Every run fails in seconds: `expired`, `subagent_failed`, "original authority closed" | A broader grant for the same person invalidated the token | Rule 5: constant scopes; drop the cached token, grant again, re-run once |
| 403 `userId is not valid for this Qoni credential` / `eak.delegation.user_not_bound` | The id is not a user of the workspace's pool | Rule 3: create the pool user at sign-up; only use the stored id |
| `eak.delegation.scope_not_allowed` | The AccessKey policy does not allow a requested scope | Allow it in the console, or remove it from the constant |
| Runs on a new AccessKey rejected with "original authority closed" from the first run | The key is not bound to the workspace's business App or wallet | Bind them in the console |
| `sessions.credits` says `metered: false` | The workspace has only been used through tokens | Open its WebAgent page in the console once |
| After "Skip" or "I've signed in", the run waits a long time | The sign-in browser was never handed back | Rule 10 |
| `confirmSignedIn()` fails after a deploy | Sign-in sessions live in the handle that opened them | Rule 11: open the sign-in again |
| The agent waits forever after the person signed in | Nobody tapped "I've signed in" | Rule 11: make the button prominent |
| Replies missing or doubled | Rendering only final messages / unstable ids | Rule 8 |
| One conversation has many computers | New session on every busy or failed continue | Rule 7 |
| The agent browses in a phone layout | A `fit=1` view is still open | Rule 14 |
| The screen vanishes after a run | Clearing on an empty `browsers` list | Rule 15 |
| Track shows tool names or old checks | Showing `progress` text; not filtering the replay | Rule 19 |
| The agent says a date in this year is "in the future" | No date in the preface | Rule 12 |
| Answers come back as a file path | The agent wrote the result to a file | Rule 12 |
