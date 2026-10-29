/**
 * Reference server for a personal agent app on @qoniai/qoni (0.10.x).
 *
 * This is the integration layer of a production app, reduced to its Qoni calls.
 * It is framework-free: wire `PersonalAgent` methods to your HTTP routes and
 * implement `Store` with your database. Read personal-agent.md first; every
 * rule cited in a comment ("rule N") is explained there.
 *
 * Runs on a long-lived Node.js server that holds the AccessKey. Nothing here
 * may run in a browser or mobile app.
 */
import {
  Qoni,
  QoniError,
  QoniEventTypes,
  QoniScopes,
  type AgentBrowser,
  type InteractionHandle,
  type RunHandle,
  type RunResult,
} from "@qoniai/qoni";

// ---------------------------------------------------------------------------
// One client per process. Keys come from the server environment only (rule 1).
// ---------------------------------------------------------------------------

export const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
});

/**
 * The one grant every person gets, always the same (rule 4). Asking a person
 * for more scopes later invalidates every token they already hold.
 * The three concrete scopes let the agent ask for a site sign-in and let the
 * person take over the browser; product bundles never include them.
 */
const PRODUCTS = ["doAnything", "track"] as const;
const TASK_SCOPES = [
  QoniScopes.SITE_LOGIN_REQUEST,
  QoniScopes.SITE_LOGIN_CONFIRM,
  QoniScopes.BROWSER_USE_TAKE_CONTROL,
];

// ---------------------------------------------------------------------------
// What the app stores. Persist all of it: runs outlive your process (rule 13).
// ---------------------------------------------------------------------------

export interface Person {
  id: string;
  /** The user created for this person in the workspace's user pool (rule 3). */
  poolUserId: string;
  agentName: string;
  displayName: string;
}

export interface RunRecord {
  runId: string;
  sessionId: string;
  conversationId: string;
  personId: string;
  status: "running" | "waiting" | "done" | "failed" | "stopped";
}

export interface Store {
  person(id: string): Promise<Person | null>;
  savePerson(p: Person): Promise<void>;
  cachedToken(personId: string): Promise<{ token: string; expiresAt: number } | null>;
  saveToken(personId: string, t: { token: string; expiresAt: number } | null): Promise<void>;
  latestRun(conversationId: string): Promise<RunRecord | null>;
  saveRun(r: RunRecord): Promise<void>;
  unfinishedRuns(): Promise<RunRecord[]>;
  /** Upsert by id: a streamed reply arrives many times with the same id (rule 8). */
  upsertMessage(m: { id: string; conversationId: string; role: "agent" | "person"; text: string; done: boolean }): Promise<void>;
  saveScreens(runId: string, screens: AgentBrowser[]): Promise<void>;
  saveCard(card: { id: string; runId: string; type: string; status: string; payload: unknown }): Promise<void>;
}

// ---------------------------------------------------------------------------
// Sign-up: your own account + one pool user per account (rules 2, 3)
// ---------------------------------------------------------------------------

/**
 * Call after your own sign-up has created the account (email + password, phone,
 * whatever you use). The pool user carries no email and no password: it cannot
 * sign in anywhere and never collides with another pool member's email. It only
 * tells Qoni which person a token belongs to: browser sign-ins, files and
 * follow-ups are kept per pool user.
 */
export async function createPoolUser(appAccountId: string): Promise<string> {
  const handle = `pa_${appAccountId}`;
  const created = await qoni.genauth.users.create({ username: handle, externalId: `pa:${appAccountId}` });
  const userId = (created.data as { userId?: unknown } | undefined)?.userId;
  if (typeof userId !== "string" || !userId) throw new Error("users.create returned no userId");
  return userId;
}

// ---------------------------------------------------------------------------
// Tokens: one per person, cached, renewed before expiry (rules 4, 6)
// ---------------------------------------------------------------------------

export class PersonalAgent {
  /** Live run handles, by run id. Sign-in sessions live inside a handle (rule 11). */
  private readonly live = new Map<string, RunHandle>();
  private readonly interactions = new Map<string, { handle: InteractionHandle; runId: string }>();
  /** Per run: the open text question, so a typed reply answers it (rule 9). */
  private readonly openQuestion = new Map<string, string>();
  /** Per run: browser hand-overs the SDK does not give you as cards, by interaction id (rule 10). */
  private readonly hiddenControls = new Map<string, Map<string, Record<string, unknown>>>();

  constructor(private readonly store: Store) {}

  /** The person comes from YOUR session, never from a request body (rule 2). */
  async token(person: Person): Promise<string> {
    const cached = await this.store.cachedToken(person.id);
    // Renew a day early: a run's cards are answered with the token it started
    // with, and a person may answer hours later.
    if (cached && cached.expiresAt - Date.now() > 86_400_000) return cached.token;
    const grant = await qoni.webAgentGrant({ userId: person.poolUserId, products: [...PRODUCTS], scopes: TASK_SCOPES });
    await this.store.saveToken(person.id, { token: grant.token, expiresAt: grant.expiresAt });
    return grant.token;
  }

  // -------------------------------------------------------------------------
  // A turn: continue the conversation's session, or start one (rule 7)
  // -------------------------------------------------------------------------

  /**
   * The person opened a new conversation or started typing in one: boot its
   * computer now, so the first run takes it over instead of booting one.
   */
  async prewarm(person: Person): Promise<void> {
    await qoni.doAnything.sessions.prewarm({ token: await this.token(person) });
  }

  async send(person: Person, conversationId: string, text: string): Promise<RunRecord> {
    const token = await this.token(person);
    const previous = await this.store.latestRun(conversationId);
    // The agent asked something and the person just typed: that is the answer,
    // not a new task (rule 9).
    const question = previous ? this.openQuestion.get(previous.runId) : undefined;
    if (previous && question) {
      await this.act(question, "answer", text);
      return previous;
    }
    // Reuse the conversation's computer only when its last run is over;
    // otherwise this message would wait behind it.
    const continuing = previous && (previous.status === "done" || previous.status === "failed" || previous.status === "stopped")
      ? previous.sessionId
      : undefined;
    const prompt = continuing ? text : `${preface(person)}\n\n${text}`;

    let handle: RunHandle;
    try {
      handle = await this.startRun(token, prompt, continuing);
    } catch (error) {
      if (isCreditsError(error)) throw error; // never retry: nothing will change (rule 17)
      if (!continuing) throw error;
      // A session can refuse a new run briefly while its last one settles.
      handle = await retryOn409(() => this.startRun(token, prompt, continuing));
    }
    const record: RunRecord = {
      runId: handle.id,
      sessionId: handle.sessionRef?.sessionId ?? continuing ?? "",
      conversationId,
      personId: person.id,
      status: "running",
    };
    await this.store.saveRun(record);
    void this.watch(handle, record);
    return record;
  }

  private startRun(token: string, prompt: string, sessionId?: string): Promise<RunHandle> {
    return qoni.doAnything.run({
      token,
      prompt,
      // A run can only ask the person for a sign-in or hand over the browser if
      // it was created with these scopes; delegation alone is not enough.
      taskScopes: TASK_SCOPES,
      ...(sessionId ? { session: { sessionId } } : {}),
    });
  }

  // -------------------------------------------------------------------------
  // Streaming one run into your conversation (rules 8, 9, 10)
  // -------------------------------------------------------------------------

  private async watch(handle: RunHandle, record: RunRecord): Promise<void> {
    this.live.set(handle.id, handle);
    let spoke = false;
    let result: RunResult;
    try {
      result = await handle.wait({
        onWireEvent: (wire) => {
          // The browser openLogin() hands to the person is a take_control round
          // the SDK keeps out of onInteraction. Track it to hand it back (rule 10).
          const envelope = (wire.data ?? {}) as { type?: string; data?: Record<string, unknown> };
          const type = wire.event ?? envelope.type;
          const ix = envelope.data ?? {};
          if (type !== "run.interaction" || ix.type !== "take_control" || typeof ix.id !== "string") return;
          const controls = this.hiddenControls.get(handle.id) ?? new Map<string, Record<string, unknown>>();
          if (ix.status === "pending") controls.set(ix.id, ix);
          else controls.delete(ix.id);
          this.hiddenControls.set(handle.id, controls);
        },
        onEvent: async (event) => {
          if (event.type === QoniEventTypes.Message) {
            const m = event.data;
            if (m.role !== "ai" || !m.text) return;
            spoke = true;
            await this.store.upsertMessage({ id: `${record.runId}:${m.id}`, conversationId: record.conversationId, role: "agent", text: m.text, done: m.done });
          } else if (event.type === QoniEventTypes.Browsers) {
            // An empty list does not mean the computer is gone (rule 15).
            if (event.data.length > 0) await this.store.saveScreens(record.runId, event.data);
          }
        },
        onInteraction: async (ix) => {
          const i = ix.interaction;
          if (i.type === "wait") return;
          this.interactions.set(i.id, { handle: ix as InteractionHandle, runId: record.runId });
          if (i.type === "ask_user" && i.status === "pending" && i.payload.answerType === "text") this.openQuestion.set(record.runId, i.id);
          else if (this.openQuestion.get(record.runId) === i.id) this.openQuestion.delete(record.runId);
          // The same card is delivered again on status changes and replays:
          // store by id, render by status (rule 9).
          await this.store.saveCard({ id: i.id, runId: record.runId, type: i.type, status: i.status, payload: i.payload });
          if (record.status !== "waiting" && i.status === "pending") {
            record.status = "waiting";
            await this.store.saveRun(record);
          }
        },
      });
    } catch (error) {
      // Your process is shutting down, or the stream broke: the run keeps
      // going at Qoni. resume() attaches to it again (rule 13).
      this.live.delete(handle.id);
      throw error;
    }
    this.live.delete(handle.id);
    this.hiddenControls.delete(handle.id);
    this.openQuestion.delete(handle.id);
    await this.finish(record, result, spoke);
  }

  private async finish(record: RunRecord, result: RunResult, spoke: boolean): Promise<void> {
    record.status = result.status === "succeeded" ? "done" : result.status === "canceled" ? "stopped" : "failed";
    await this.store.saveRun(record);
    // If the agent never spoke, the answer is only in the output (rule 8).
    const output = result.output as { answer?: unknown } | string | undefined;
    const answer = typeof output === "string" ? output : typeof output?.answer === "string" ? output.answer : "";
    if (!spoke && answer) {
      await this.store.upsertMessage({ id: `${record.runId}:final`, conversationId: record.conversationId, role: "agent", text: answer, done: true });
    }
    if (result.status === "failed" && authorityClosed(result)) {
      // The token this run used was invalidated (rule 5). Drop it; the next
      // send() gets a fresh grant. Re-run the turn once if you keep its text.
      const person = await this.store.person(record.personId);
      if (person) await this.store.saveToken(person.id, null);
    }
  }

  // -------------------------------------------------------------------------
  // The person answers a card (rules 9, 10, 11)
  // -------------------------------------------------------------------------

  async act(interactionId: string, action: string, value?: unknown): Promise<{ liveUrl?: string; expiresAt?: string }> {
    const entry = this.interactions.get(interactionId);
    // No live handle: the run ended, or this process restarted since the card
    // was shown. Tell the person the card is gone; never guess another id.
    if (!entry) throw new Error("interaction_gone");
    const ix = entry.handle;
    switch (action) {
      case "open-login": {
        const opened = await ix.openLogin();
        return { liveUrl: opened.liveUrl };
      }
      case "signed-in":
        await ix.confirmSignedIn();
        await this.handBack(entry.runId);
        return {};
      case "skip":
        await ix.skip();
        await this.handBack(entry.runId);
        return {};
      case "connect": {
        const control = await ix.connectControl();
        return { liveUrl: control.liveUrl, expiresAt: control.expiresAt };
      }
      case "refresh": {
        const control = await ix.refreshControl();
        return { liveUrl: control.liveUrl, expiresAt: control.expiresAt };
      }
      case "release":
        await ix.releaseControl();
        return {};
      case "confirm":
        await ix.confirm();
        return {};
      case "reject":
        await ix.reject();
        return {};
      case "answer":
        await ix.answer(value as never);
        return {};
      case "submit":
        await ix.submit(value as never);
        return {};
      default:
        throw new Error(`unknown action ${action}`);
    }
  }

  /** Hand back this run's sign-in browser so the run does not sit waiting (rule 10). */
  private async handBack(runId: string): Promise<void> {
    const run = this.live.get(runId);
    const controls = this.hiddenControls.get(runId);
    if (!run || !controls) return;
    for (const [id, payload] of controls) {
      // A take_control the agent asked for openly is a card; the person releases it.
      if (this.interactions.has(id)) continue;
      controls.delete(id);
      try {
        await run.interactionHandle(payload as never).releaseControl();
      } catch (error) {
        if (!(error instanceof QoniError && error.status === 409)) throw error; // 409: already handed back
      }
    }
  }

  // -------------------------------------------------------------------------
  // After a restart: attach to every run that was still going (rule 13)
  // -------------------------------------------------------------------------

  async resume(): Promise<void> {
    for (const record of await this.store.unfinishedRuns()) {
      const person = await this.store.person(record.personId);
      if (!person) continue;
      try {
        const token = await this.token(person);
        const handle = await qoni.doAnything.attach(record.runId, { token, session: { sessionId: record.sessionId } });
        void this.watch(handle, record);
      } catch {
        record.status = "stopped";
        await this.store.saveRun(record);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Screens, files, follow-ups, Track, cost (rules 14–20)
  // -------------------------------------------------------------------------

  /** The browsers on a conversation's computer right now; empty while it sleeps. */
  async screens(person: Person, sessionId: string): Promise<AgentBrowser[]> {
    return qoni.doAnything.browsers.list({ token: await this.token(person), sessionId });
  }

  /** A sub-agent waiting for the person: the person helped in its browser; let it go on. */
  async helperDone(person: Person, sessionId: string, browserId: string, skipped: boolean): Promise<void> {
    await qoni.doAnything.browsers.control({ token: await this.token(person), sessionId, browserId, action: skipped ? "skip" : "done" });
  }

  /** Files never wake a sleeping computer: they come from the copy saved after the last turn. */
  async files(person: Person, sessionId: string) {
    return qoni.doAnything.files.list({ token: await this.token(person), sessionId, path: "", depth: 5 });
  }

  async readFile(person: Person, sessionId: string, path: string) {
    if (path.split("/").includes("..")) throw new Error("bad path");
    return qoni.doAnything.files.read({ token: await this.token(person), sessionId, path });
  }

  /** Follow-ups the agent scheduled itself. Each one that ran is a run to attach to. */
  async followUps(person: Person) {
    return qoni.proactive.list({ token: await this.token(person), limit: 50 });
  }

  async createTrack(person: Person, prompt: string, schedule: { kind: "interval"; intervalSeconds: number } | { kind: "daily"; at: string; tz: string }, title?: string) {
    const monitor = await qoni.track.create({ token: await this.token(person), prompt, schedule, ...(title ? { title } : {}) });
    return monitor.id;
  }

  async tracks(person: Person) {
    return qoni.track.list({ token: await this.token(person) });
  }

  /** What each run of a conversation cost; settles a few minutes after the run ends. */
  async cost(person: Person, sessionId: string) {
    return qoni.doAnything.sessions.credits({ token: await this.token(person), sessionId });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sent only with the first prompt of a session: who the agent is and today's date (rule 12). */
function preface(p: Person): string {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return [
    `(You are ${p.agentName}, ${p.displayName}'s personal agent. Today is ${today}.`,
    "Be concise and answer in the language the person writes in.",
    "When you need the person to decide, choose, fill something in or sign in, use your question, form, confirmation and sign-in tools instead of asking in plain text.",
    "Put your answer in your reply; never write it to a file and reply with a path.)",
  ].join(" ");
}

async function retryOn409<T>(start: () => Promise<T>): Promise<T> {
  for (const delay of [1500, 3000, 4500]) {
    await new Promise((r) => setTimeout(r, delay));
    try {
      return await start();
    } catch (error) {
      if (!(error instanceof QoniError && error.status === 409)) throw error;
    }
  }
  return start();
}

function isCreditsError(error: unknown): boolean {
  return error instanceof QoniError && /insufficient_credits/.test(`${String(error.code)} ${error.message}`);
}

/** The signature of a token invalidated by a broader grant for the same person (rule 5). */
function authorityClosed(result: RunResult): boolean {
  return result.terminalReason === "expired" && /original authority closed/i.test(result.failureDetail ?? "");
}
