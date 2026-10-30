/**
 * Personal agent features of @qoniai/qoni, one call at a time.
 *
 * Each export is one capability, independent of the others: copy the ones you
 * use. personal-agent.md explains each next to the section that names it. How
 * your app stores state, signs people in and shows things is up to the app.
 *
 * `qoni` holds the AccessKey and runs only on a server. Everything that takes a
 * `client` also runs with a token-only client, on a server or in a page.
 */
import {
  Qoni,
  QoniError,
  QoniEventTypes,
  QoniScopes,
  type AgentBrowser,
  type InteractionHandle,
  type RunEvent,
  type RunHandle,
  type RunResult,
} from "@qoniai/qoni";

export const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
});

// ---------------------------------------------------------------------------
// Pool users and per-person tokens
// ---------------------------------------------------------------------------

/** One constant grant for every person (a broader one ends their older tokens). */
export const PRODUCTS = ["doAnything", "track"] as const;
export const TASK_SCOPES = [
  QoniScopes.SITE_LOGIN_REQUEST,
  QoniScopes.SITE_LOGIN_CONFIRM,
  QoniScopes.BROWSER_USE_TAKE_CONTROL,
];

/** A user in the workspace's pool for one of your accounts: no email, no password. */
export async function createPoolUser(accountId: string): Promise<string> {
  const created = await qoni.genauth.users.create({ username: `pa_${accountId}`, externalId: `pa:${accountId}` });
  const userId = (created.data as { userId?: unknown } | undefined)?.userId;
  if (typeof userId !== "string" || !userId) throw new Error("users.create returned no userId");
  return userId;
}

/**
 * A token for one person. `agent` names your app when one AccessKey serves
 * several: each app then sees only the sessions it made for that person.
 */
export async function grantFor(poolUserId: string, agent?: string) {
  const grant = await qoni.webAgentGrant({
    userId: poolUserId,
    products: [...PRODUCTS],
    scopes: TASK_SCOPES,
    ...(agent ? { agent } : {}),
  });
  return { token: grant.token, expiresAt: grant.expiresAt, webAgentHost: grant.webAgentHost };
}

/** Renew a day before `expiresAt`: a card may be answered hours after its run started. */
export function needsRenewal(expiresAt: number, now = Date.now()): boolean {
  return expiresAt - now < 86_400_000;
}

/** A run failed because a broader grant for the same person ended its token. */
export function isAuthorityClosed(result: RunResult): boolean {
  return result.terminalReason === "expired" && /original authority closed/i.test(result.failureDetail ?? "");
}

/** The client an app (or a page) uses with only a person's token. */
export function tokenClient(webAgentHost: string): Qoni {
  return new Qoni({ webAgentHost });
}

// ---------------------------------------------------------------------------
// Sessions and runs
// ---------------------------------------------------------------------------

/** Boot the computer of the person's next new conversation while they type. */
export async function prewarm(client: Qoni, token: string): Promise<void> {
  await client.doAnything.sessions.prewarm({ token });
}

/** A run that can ask for sign-ins and hand over its browser; `sessionId` continues a conversation. */
export function startRun(client: Qoni, token: string, prompt: string, sessionId?: string): Promise<RunHandle> {
  return client.doAnything.run({
    token,
    prompt,
    taskScopes: TASK_SCOPES,
    ...(sessionId ? { session: { sessionId } } : {}),
  });
}

/** A session refuses a new run (409) for a moment after its last one ends. */
export async function retryWhileSettling<T>(start: () => Promise<T>): Promise<T> {
  for (const delay of [1500, 3000, 4500]) {
    try {
      return await start();
    } catch (error) {
      if (!(error instanceof QoniError && error.status === 409)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return start();
}

/** Out of credits, when starting or as a run's end: never retried. */
export function isOutOfCredits(error: unknown): boolean {
  return error instanceof QoniError && /insufficient_credits/.test(`${String(error.code)} ${error.message}`);
}

/** Models a run may name; omit `model` to use the platform default. */
export function models(client: Qoni, token: string) {
  return client.doAnything.api.listModels({ token });
}

// ---------------------------------------------------------------------------
// Following a run
// ---------------------------------------------------------------------------

export interface RunCallbacks {
  /** A streamed reply arrives many times with the same `id`; `text` is the whole reply so far. */
  message(id: string, text: string, done: boolean, stopReason?: string): void | Promise<void>;
  screens?(browsers: AgentBrowser[]): void | Promise<void>;
  card?(handle: InteractionHandle): void | Promise<void>;
}

/** Follow a run to its end. Message ids are `runId:eventId`, stable across replays. */
export function followRun(run: RunHandle, on: RunCallbacks, rounds?: SignInRounds): Promise<RunResult> {
  return run.wait({
    onWireEvent: rounds ? (wire) => rounds.see(wire) : undefined,
    onEvent: async (event: RunEvent) => {
      if (event.type === QoniEventTypes.Message && event.data.role === "ai" && event.data.text) {
        await on.message(`${run.id}:${event.data.id}`, event.data.text, event.data.done, event.data.stopReason);
      } else if (event.type === QoniEventTypes.Browsers && event.data.length > 0) {
        await on.screens?.(event.data);
      }
    },
    onInteraction: async (handle) => {
      if (handle.interaction.type !== "wait") await on.card?.(handle);
    },
  });
}

/** The answer of a run whose agent never spoke: it is only in the output. */
export function answerOf(result: RunResult): string {
  const output = result.output as { answer?: unknown } | string | undefined;
  return typeof output === "string" ? output : typeof output?.answer === "string" ? output.answer : "";
}

/** A run outlives your process: attach again after a restart; its events replay from the start. */
export function attachRun(client: Qoni, token: string, runId: string, sessionId: string): Promise<RunHandle> {
  return client.doAnything.attach(runId, { token, session: { sessionId } });
}

// ---------------------------------------------------------------------------
// Cards (interactions)
// ---------------------------------------------------------------------------

export type CardAction =
  | { kind: "answer"; value: unknown }
  | { kind: "skip" }
  | { kind: "submit"; values: Record<string, unknown> }
  | { kind: "confirm" }
  | { kind: "reject" }
  | { kind: "open-login" }
  | { kind: "signed-in" }
  | { kind: "connect" }
  | { kind: "refresh" }
  | { kind: "release" };

/**
 * The person's action on a card, through the handle the run delivered. A 409
 * means the card is no longer current: close it; never retry with another id.
 */
export async function act(handle: InteractionHandle, action: CardAction): Promise<{ liveUrl?: string; expiresAt?: string }> {
  switch (action.kind) {
    case "answer":
      await handle.answer(action.value as never);
      return {};
    case "skip":
      await handle.skip();
      return {};
    case "submit":
      await handle.submit(action.values as never);
      return {};
    case "confirm":
      await handle.confirm();
      return {};
    case "reject":
      await handle.reject();
      return {};
    case "open-login":
      return { liveUrl: (await handle.openLogin()).liveUrl };
    case "signed-in":
      await handle.confirmSignedIn();
      return {};
    case "connect":
    case "refresh": {
      const control = action.kind === "connect" ? await handle.connectControl() : await handle.refreshControl();
      return { liveUrl: control.liveUrl, expiresAt: control.expiresAt };
    }
    case "release":
      await handle.releaseControl();
      return {};
  }
}

/** True when the request failed because the card is no longer current. */
export function isStaleCard(error: unknown): boolean {
  return error instanceof QoniError && error.status === 409;
}

/**
 * Browser hand-overs that `openLogin()` starts. The SDK keeps them out of
 * `onInteraction` (they belong to the sign-in card); after `confirmSignedIn()`
 * or `skip()` hand each one back, or the run sits waiting for its browser.
 */
export class SignInRounds {
  private readonly open = new Map<string, Record<string, unknown>>();

  see(wire: { event?: string; data?: unknown }): void {
    const envelope = (wire.data ?? {}) as { type?: string; data?: Record<string, unknown> };
    const ix = envelope.data ?? {};
    if ((wire.event ?? envelope.type) !== "run.interaction" || ix.type !== "take_control" || typeof ix.id !== "string") return;
    if (ix.status === "pending") this.open.set(ix.id, ix);
    else this.open.delete(ix.id);
  }

  /** `shownAsCards`: take-over cards the person releases themselves. */
  async handBack(run: RunHandle, shownAsCards: ReadonlySet<string> = new Set()): Promise<void> {
    for (const [id, payload] of this.open) {
      if (shownAsCards.has(id)) continue;
      this.open.delete(id);
      try {
        await run.interactionHandle(payload as never).releaseControl();
      } catch (error) {
        if (!isStaleCard(error)) throw error; // already handed back
      }
    }
  }
}

// ---------------------------------------------------------------------------
// The computer: screens, live views, files
// ---------------------------------------------------------------------------

/** A full-screen phone view lays the browser out in its own shape; switch back before the next run. */
export function fittedUrl(liveUrl: string): string {
  const url = new URL(liveUrl);
  url.searchParams.set("fit", "1");
  return url.toString();
}

/** The browsers on a conversation's computer; empty while it sleeps (not gone). */
export function screens(client: Qoni, token: string, sessionId: string): Promise<AgentBrowser[]> {
  return client.doAnything.browsers.list({ token, sessionId });
}

/** A helper browser paused for the person (`need`): they are done in it, or skip it. */
export async function helperDone(client: Qoni, token: string, sessionId: string, browserId: string, skipped: boolean): Promise<void> {
  await client.doAnything.browsers.control({ token, sessionId, browserId, action: skipped ? "skip" : "done" });
}

/** Files never wake a sleeping computer: they come from the copy saved after the last turn. */
export function listFiles(client: Qoni, token: string, sessionId: string) {
  return client.doAnything.files.list({ token, sessionId, path: "", depth: 5 });
}

export function readFile(client: Qoni, token: string, sessionId: string, path: string) {
  if (path.split("/").includes("..")) throw new Error("bad path");
  return client.doAnything.files.read({ token, sessionId, path });
}

// ---------------------------------------------------------------------------
// Credits, follow-ups, Track
// ---------------------------------------------------------------------------

/** What each run of a session cost; `status` settles pending → estimated → current. */
export function runCosts(client: Qoni, token: string, sessionId: string) {
  return client.doAnything.sessions.credits({ token, sessionId });
}

/** Follow-ups the agent scheduled itself; each one that ran is a run to attach to. */
export function followUps(client: Qoni, token: string) {
  return client.proactive.list({ token, limit: 50 });
}

export async function createTrack(
  client: Qoni,
  token: string,
  prompt: string,
  schedule: { kind: "interval"; intervalSeconds: number } | { kind: "daily"; at: string; tz: string },
  title?: string,
): Promise<string> {
  const monitor = await client.track.create({ token, prompt, schedule, ...(title ? { title } : {}) });
  return monitor.id;
}

export function tracks(client: Qoni, token: string) {
  return client.track.list({ token });
}

/** A track's recent checks (wire shape: run_id, created_at, ended_at, outcome, headline, step). */
export function trackChecks(client: Qoni, token: string, monitorId: string) {
  return client.track.api.listRuns({ token, monitorId, limit: 10 });
}
