import { QoniError, QoniValidationError } from "./errors";
import { camelizeRecord } from "./run-events";
import {
  ActionKinds,
  type ActionKind,
  type InteractionStatus,
} from "./generated/interaction-types";
import { QoniScopes } from "./scopes";
import { isJsonObject, type JsonObject } from "./types";

/**
 * Curated interaction surface (axis B of the interaction model, see
 * webagentbackend/docs/qoni-interaction-model.md §2.3). A single wire event
 * `run.interaction` carries the complete, typed object across its whole
 * lifecycle (created / updated / resolved), discriminated by `type` and driven
 * by a backend-authoritative `status`. This replaces the old `run.input_request`
 * + `run.take_control_*` family — consumers no longer rebuild a state machine
 * from an event sequence.
 *
 * Wire is snake_case; this layer is camelCase. The `actions[]` contract carries
 * each action's endpoint, so the typed methods on {@link InteractionHandle}
 * post to the right route without the consumer hard-coding any path — and a
 * button/method only exists when the backend declared the action (structurally
 * closing off "dead recovery affordances").
 */

/**
 * The interaction types a consumer handles. DoAnything asks for the user in
 * five abstract ways — by what the user has to do, never by business — plus
 * the system `wait`:
 *
 * - `site_login`: sign in to a site in the live browser.
 * - `take_control`: operate the browser by hand (captcha, 2FA, …).
 * - `ask_user`: answer a question, shaped by `answerType` / `options`.
 * - `confirmation`: allow or reject an action.
 * - `wait`: the system is waiting (rate limit, external event); no decision.
 *
 * The wire may still say `clarification`; the SDK presents it as `ask_user`.
 */
export const InteractionTypes = {
  SiteLogin: "site_login",
  TakeControl: "take_control",
  AskUser: "ask_user",
  Confirmation: "confirmation",
  Wait: "wait",
  /** @deprecated `clarification` is presented as `ask_user`; use `InteractionTypes.AskUser`. */
  Clarification: "ask_user",
} as const;

export type InteractionType = "site_login" | "take_control" | "ask_user" | "confirmation" | "wait";

/** A declared action a consumer can take on an interaction. */
export interface Action {
  /** What this action does — maps to a typed method on {@link InteractionHandle}. */
  kind: ActionKind;
  /** Human-readable button label. */
  label: string;
  /** HTTP method to invoke the endpoint with (defaults to POST on the wire). */
  method: string;
  /** Endpoint to invoke (run-relative path); the consumer never hard-codes it. */
  endpoint: string;
  /** JSON schema for the action's input body, when the action needs one. */
  inputSchema?: JsonObject | null;
}

/** Optional evidence image attached to an interaction. */
export interface InteractionEvidence {
  artifactId: string;
}

// ---- type-specific payloads -----------------------------------------------

/** A site the agent needs the user to sign in to (`site_login`). */
export interface InteractionSite {
  siteId: string;
  displayName: string;
  loginUrl: string;
}

export interface SiteLoginPayload {
  sites: InteractionSite[];
  /** Set when the login is for a Track monitor (monitor.needs_login reuse). */
  monitorId?: string;
}

/** How an `ask_user` answer is shaped; decides which control the app renders. */
export type AskUserAnswerType = "text" | "number" | "boolean" | "single_choice" | "multiple_choice";

export interface AskUserOption {
  /** What `answer()` submits. */
  value: string;
  /** What the user sees. */
  label: string;
}

export interface AskUserPayload {
  /** The question to show the user. */
  question: string;
  /** `text` → string, `number` → number, `boolean` → boolean, `single_choice` → one option value, `multiple_choice` → option values. */
  answerType: AskUserAnswerType;
  /** Candidates for `single_choice` / `multiple_choice`. */
  options?: AskUserOption[];
}

/** An `ask_user` answer; its type follows the payload's `answerType`. */
export type AskUserAnswer = string | number | boolean | string[];

/** @deprecated `clarification` is presented as `ask_user`; use {@link AskUserPayload}. */
export type ClarificationPayload = AskUserPayload;

export interface ConfirmationPayload {
  summary: string;
}

export interface TakeControlPayload {
  liveUrl: string;
  surface?: string;
  reason?: string;
}

export type WaitKind = "rate_limit" | "external" | "sleep";

export interface WaitPayload {
  waitKind: WaitKind;
  /** ISO 8601 — when the wait is expected to end. */
  until?: string;
  retryable?: boolean;
}

/** Maps each interaction `type` to its narrowed payload shape. */
export interface InteractionPayloadByType {
  site_login: SiteLoginPayload;
  take_control: TakeControlPayload;
  ask_user: AskUserPayload;
  confirmation: ConfirmationPayload;
  wait: WaitPayload;
}

/** Fields every interaction carries, whatever its type. */
export interface InteractionBase {
  /** Stable identity across the interaction's lifecycle. */
  id: string;
  /** Backend-authoritative lifecycle status. */
  status: InteractionStatus;
  createdAt: string;
  resolvedAt?: string | null;
  expiresAt?: string | null;
  /** Human-readable title (e.g. "Agent needs you to sign in"). */
  title: string;
  /** Detail / question text. */
  prompt?: string | null;
  /** Optional evidence image. */
  evidence?: InteractionEvidence | null;
  /** Declared actions — drives the typed methods + UI buttons. */
  actions: Action[];
}

/**
 * A typed interaction object, distributed over `type`: the bare `Interaction`
 * is a union, so `switch (interaction.type)` narrows `payload` in each branch.
 * `Interaction<"site_login">` picks one member.
 */
export type Interaction<T extends InteractionType = InteractionType> = T extends InteractionType
  ? InteractionBase & {
      /** The discriminator — the single field a consumer switches on. */
      type: T;
      /** Type-specific fields. */
      payload: InteractionPayloadByType[T];
    }
  : never;

/** The interaction union `onInteraction` hands out; same as the bare {@link Interaction}. */
export type TypedInteraction = Interaction;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function asBool(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeActions(value: unknown): Action[] {
  if (!Array.isArray(value)) return [];
  const out: Action[] = [];
  for (const item of value) {
    if (!isJsonObject(item)) continue;
    const kind = asString(item.kind);
    if (!kind) continue;
    const action: Action = {
      kind: kind as ActionKind,
      label: asString(item.label) ?? "",
      method: asString(item.method) ?? "POST",
      endpoint: asString(item.endpoint) ?? "",
    };
    if (isJsonObject(item.inputSchema)) action.inputSchema = item.inputSchema;
    out.push(action);
  }
  return out;
}

function normalizeEvidence(c: JsonObject): InteractionEvidence | undefined {
  // Wire is `evidence_artifact_id` (camelized to `evidenceArtifactId`); the
  // curated surface nests it under a small object.
  const artifactId =
    asString(c.evidenceArtifactId) ??
    (isJsonObject(c.evidence) ? asString((c.evidence as JsonObject).artifactId) : undefined);
  return artifactId ? { artifactId } : undefined;
}

const ANSWER_TYPES = new Set<AskUserAnswerType>([
  "text",
  "number",
  "boolean",
  "single_choice",
  "multiple_choice",
]);

/**
 * Wire `options`: plain strings (today's clarification) or `{ value, label }`
 * objects. Every string is a legal value, including the empty string.
 */
function normalizeOptions(value: unknown): AskUserOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw): AskUserOption[] => {
    if (typeof raw === "string") return [{ value: raw, label: raw }];
    if (!isJsonObject(raw) || typeof raw.value !== "string") return [];
    return [{ value: raw.value, label: typeof raw.label === "string" ? raw.label : raw.value }];
  });
}

function isAnswerType(value: string | undefined): value is AskUserAnswerType {
  return value !== undefined && ANSWER_TYPES.has(value as AskUserAnswerType);
}

/**
 * `ask_user` from either wire shape. A native `ask_user` names its
 * `answer_type`, which is kept as sent. A `clarification` only hints: with
 * options it is a single choice (`input_type: "choice"`); without any option it
 * is free text, so the app never renders an empty picker.
 */
function askUserPayload(c: JsonObject): AskUserPayload {
  const options = normalizeOptions(c.options);
  const native = asString(c.answerType);
  const hint = asString(c.inputType);
  let answerType: AskUserAnswerType;
  if (isAnswerType(native)) answerType = native;
  else if (isAnswerType(hint) && hint !== "single_choice" && hint !== "multiple_choice") answerType = hint;
  else answerType = options.length > 0 ? (hint === "multiple_choice" ? "multiple_choice" : "single_choice") : "text";
  const payload: AskUserPayload = { question: asString(c.question) ?? "", answerType };
  if (options.length > 0) payload.options = options;
  return payload;
}

// Fields every interaction object carries; the rest belong to the payload.
const BASE_FIELDS = new Set([
  "id", "type", "status", "createdAt", "resolvedAt", "expiresAt", "title", "prompt",
  "evidence", "evidenceArtifactId", "actions",
]);

function shapePayload(type: string, c: JsonObject): JsonObject {
  switch (type) {
    case "site_login": {
      const sites: InteractionSite[] = Array.isArray(c.sites)
        ? c.sites.flatMap((raw) => {
            if (!isJsonObject(raw)) return [];
            return [
              {
                siteId: asString(raw.siteId) ?? "",
                displayName: asString(raw.displayName) ?? "",
                loginUrl: asString(raw.loginUrl) ?? "",
              },
            ];
          })
        : [];
      const payload: SiteLoginPayload = { sites };
      const monitorId = asString(c.monitorId);
      if (monitorId) payload.monitorId = monitorId;
      return { ...payload };
    }
    case "ask_user":
      return { ...askUserPayload(c) };
    case "confirmation":
      return { summary: asString(c.summary) ?? "" };
    case "take_control": {
      const payload: TakeControlPayload = { liveUrl: asString(c.liveUrl) ?? "" };
      const surface = asString(c.surface);
      const reason = asString(c.reason);
      if (surface) payload.surface = surface;
      if (reason) payload.reason = reason;
      return { ...payload };
    }
    case "wait": {
      const payload: WaitPayload = {
        waitKind: (asString(c.waitKind) as WaitKind) ?? "external",
      };
      const until = asString(c.until);
      const retryable = asBool(c.retryable);
      if (until) payload.until = until;
      if (retryable !== undefined) payload.retryable = retryable;
      return { ...payload };
    }
    default: {
      // A type outside the five (a newer backend's addition): pass its own
      // fields through untouched rather than inventing a shape for it.
      const payload: JsonObject = {};
      for (const [key, value] of Object.entries(c)) if (!BASE_FIELDS.has(key)) payload[key] = value;
      return payload;
    }
  }
}

/**
 * Normalize a `run.interaction` wire payload into a curated {@link Interaction}.
 * `payload` is the camelized interaction object carried in the event envelope's
 * `data` field. Returns null when the object lacks a recognized `type`.
 * A wire `clarification` comes out as `ask_user`.
 */
export function normalizeInteraction(payload: unknown): Interaction | null {
  const c = camelizeRecord(payload);
  const wireType = asString(c.type);
  if (!wireType) return null;
  const type = wireType === "clarification" ? "ask_user" : wireType;
  const interaction = {
    id: asString(c.id) ?? "",
    type,
    status: (asString(c.status) as InteractionStatus) ?? "pending",
    createdAt: asString(c.createdAt) ?? "",
    title: asString(c.title) ?? "",
    actions: normalizeActions(c.actions),
    payload: shapePayload(type, c),
  } as unknown as Interaction;
  const resolvedAt = asString(c.resolvedAt);
  const expiresAt = asString(c.expiresAt);
  const prompt = asString(c.prompt);
  const evidence = normalizeEvidence(c);
  if (resolvedAt) interaction.resolvedAt = resolvedAt;
  if (expiresAt) interaction.expiresAt = expiresAt;
  if (prompt) interaction.prompt = prompt;
  if (evidence) interaction.evidence = evidence;
  return interaction;
}

const SETTLED_INTERACTION_STATUSES = new Set<string>(["resolved", "expired", "canceled"]);

/**
 * The backend settles an interaction with a minimal shell: no actions and the
 * type-specific fields blanked (a resolve is labelled `clarification` with an
 * empty question, or `site_login` with one empty site). It carries no card
 * content of its own.
 */
function isSettlingShell(next: Interaction): boolean {
  if (!SETTLED_INTERACTION_STATUSES.has(next.status) || next.actions.length > 0) return false;
  switch (next.type) {
    case "ask_user":
      return next.payload.question === "";
    case "site_login":
      return next.payload.sites.every((site) => !site.siteId);
    case "confirmation":
      return next.payload.summary === "";
    default:
      return false;
  }
}

/**
 * Fold a lifecycle update onto the card already seen for the same `id`. Only a
 * settling shell is folded: it keeps the card's type, payload, title and
 * creation time, and moves `status`, `resolvedAt` and `actions`. Any update
 * with real content — including a settled one, such as an expired take-over
 * with its own reason — replaces the card, so a full card replayed after a
 * shell repairs it.
 */
export function foldInteraction(previous: Interaction | undefined, next: Interaction): Interaction {
  if (!previous || previous.id !== next.id || !isSettlingShell(next)) return next;
  const folded = { ...previous, status: next.status, actions: next.actions } as Interaction;
  if (next.resolvedAt) folded.resolvedAt = next.resolvedAt;
  return folded;
}

/**
 * Posts an interaction action to its declared endpoint. The product namespace
 * supplies this (token + run addressing already bound); the handle below uses
 * it to invoke `action.endpoint` without the consumer touching HTTP.
 */
export type InteractionActionPoster = (
  action: Action,
  body: JsonObject | undefined,
  options?: { requiredScopes?: readonly string[] },
) => Promise<unknown>;

/**
 * Scopes the product token must carry to invoke `action`. `open_login` starts
 * an interactive login session on the profiles route, which the backend guards
 * with `webagent.site_login:request`; every other action resolves the
 * interaction inside the product run and needs the product's manage scope.
 */
export function interactionActionScopes(action: Action, productManageScope: string): string[] {
  return action.kind === ActionKinds.openLogin
    ? [QoniScopes.SITE_LOGIN_REQUEST]
    : [productManageScope];
}

/** Options for {@link InteractionHandle.openLogin}. */
export interface OpenLoginOptions {
  /**
   * Site to sign in to — one of `interaction.payload.sites[].siteId`. May be
   * omitted when the interaction lists exactly one site.
   */
  siteId?: string;
  /** Re-login an existing browser profile in place instead of creating one. */
  profileId?: string;
}

/** Interactive login session started by {@link InteractionHandle.openLogin}. */
export interface OpenLoginResult {
  profileId: string;
  siteId: string;
  /** Login browser session the user signs in through. */
  sessionId: string;
  /** Live view URL of the login browser to show to the user. */
  liveUrl: string;
  /** Unmodified response body (escape hatch — shape may evolve with the API). */
  raw: JsonObject;
  /**
   * @deprecated {@link InteractionHandle.confirmSignedIn} saves the login
   * itself; call it once the user has signed in, without `confirm()`.
   *
   * Persist the login into the profile after the user signs in
   * (`POST /profiles/{profileId}/confirm`). Confirming ends this login
   * session and closes its browser, except when the backend could not save
   * it yet (`release_failed`, below):
   *
   * - `active: true` — the login is saved; call
   *   {@link InteractionHandle.confirmSignedIn}.
   * - `active: false` with `probeResult: "no_session"` — the backend no longer
   *   holds the session (it may already have saved the login automatically, or
   *   restarted). Call `confirmSignedIn()`: the agent rechecks the site and
   *   raises a new `site_login` interaction if it is still signed out.
   * - Rejects with a `QoniError` whose `code` is `no_pending_login` (HTTP 409)
   *   when the backend has no pending login for this profile: the session
   *   already ended on providers that report it this way, or the profile no
   *   longer exists for this user. Handle it like `no_session`: call
   *   `confirmSignedIn()`, and the agent asks again if it is still signed out.
   * - `active: false` with `probeResult: "release_failed"` — the backend kept
   *   the session but could not save it yet; call `confirm()` again.
   * - `active: false` with any other `probeResult` — the user was not signed
   *   in. Start a new session with `openLogin({ siteId, profileId })` and show
   *   its new `liveUrl`; the old one no longer works.
   * - Throws `QoniValidationError` when a newer `openLogin()` replaced this
   *   backend session; confirm the newer result instead.
   *
   * Requires `QoniScopes.SITE_LOGIN_CONFIRM`.
   */
  confirm(options?: ConfirmLoginOptions): Promise<ConfirmLoginResult>;
}

/** Options for {@link OpenLoginResult.confirm}. */
export interface ConfirmLoginOptions {
  /** Optional human-readable label stored on the profile. */
  displayLabel?: string;
}

/** Result of {@link OpenLoginResult.confirm}. */
export interface ConfirmLoginResult {
  profileId: string;
  /** True only when the profile is now `active` (the login was captured). */
  active: boolean;
  /** Profile state after confirmation: `active`, or `pending_login` when no signed-in session was detected. */
  state: string;
  /** Outcome of the backend's signed-in probe, for example `no_session`. */
  probeResult: string;
  /** Unmodified response body (escape hatch — shape may evolve with the API). */
  raw: JsonObject;
}

/** A login session `openLogin()` opened on one interaction. */
export interface LoginSession {
  profileId: string;
  siteId: string;
  /** The backend's login session; reopening may return the same one. */
  sessionId: string;
  /** Latest `openLogin()` call on the interaction that returned it (1, 2, …). */
  call: number;
  /** A newer backend session took over: this one can no longer be saved. */
  replaced?: boolean;
  /** Saved and rechecked: nothing left to do for this session. */
  completed?: boolean;
  /** The save in flight or done; cleared when it fails so a retry saves again. */
  save?: Promise<ConfirmLoginResult>;
  /** `confirmSignedIn()` in flight or done: one save and one recheck per session. */
  done?: Promise<void>;
}

/** Per interaction: how many `openLogin()` calls were made, and the session of the latest call that succeeded. */
export interface LoginSessionSlot {
  calls: number;
  /** `openLogin()` calls still waiting for the backend. */
  inflight: number;
  /** The interaction settled (resolved, expired or canceled): nothing will confirm this login any more. */
  ended?: boolean;
  session?: LoginSession;
}

/**
 * A login slot may be forgotten only when no `openLogin()` is in flight and
 * its login is done: saved and rechecked, or its interaction already ended.
 */
export function loginSlotIdle(slot: LoginSessionSlot): boolean {
  return slot.inflight === 0 && (!slot.session || slot.ended === true || slot.session.completed === true);
}

/** Note that `interaction` settled, so its login slot can be reclaimed once nothing is in flight. */
export function markLoginEnded(store: LoginSessionStore, interaction: Interaction): void {
  if (!SETTLED_INTERACTION_STATUSES.has(interaction.status)) return;
  const slot = store.get(interaction.id);
  if (slot) slot.ended = true;
}

/** Login sessions by interaction id, shared by the handles one RunHandle / MonitorHandle hands out. */
export type LoginSessionStore = Map<string, LoginSessionSlot>;

/** The backend kept the login session but could not save it yet (Browserbase release failed). */
const SAVE_RETRY_PROBES = new Set(["release_failed"]);

function isNoPendingLogin(err: unknown): boolean {
  return err instanceof QoniError && err.status === 409 && err.code === "no_pending_login";
}

/** How many interactions a long-lived handle remembers (cards, login sessions). */
export const INTERACTION_MEMORY_LIMIT = 256;

/**
 * Set `key` as the newest entry and, beyond `limit`, drop the oldest entries
 * that `evictable` allows, so caches on long-lived handles (a Track monitor
 * never ends) stay bounded. Entries still in use are never dropped: when none
 * can go, the map grows rather than forgetting work in progress.
 */
export function rememberBounded<K, V>(
  map: Map<K, V>,
  key: K,
  value: V,
  limit = INTERACTION_MEMORY_LIMIT,
  evictable: (value: V) => boolean = () => true,
): void {
  map.delete(key);
  map.set(key, value);
  if (map.size <= limit) return;
  for (const [candidate, entry] of map) {
    if (map.size <= limit) break;
    if (candidate !== key && evictable(entry)) map.delete(candidate);
  }
}

/** Settled cards can be forgotten first; pending ones may still be folded. */
export function interactionSettled(interaction: Interaction): boolean {
  return SETTLED_INTERACTION_STATUSES.has(interaction.status);
}

/** A control session returned by `connectControl()` / `refreshControl()`. */
export interface ControlSession {
  /** Signed URL of the browser the user now controls; show it only to that user. */
  liveUrl: string;
  /** When `liveUrl` stops working; call `refreshControl()` for a new one. */
  expiresAt?: string;
  status?: string;
  /** Unmodified response body (escape hatch — shape may evolve with the API). */
  raw: JsonObject;
}

function controlSession(response: unknown): ControlSession {
  const raw = isJsonObject(response) ? response : {};
  const fields = camelizeRecord(raw);
  const session: ControlSession = { liveUrl: asString(fields.standaloneControlUrl) ?? asString(fields.liveUrl) ?? "", raw };
  const expiresAt = asString(fields.controlTokenExpiresAt) ?? asString(fields.expiresAt);
  const status = asString(fields.status);
  if (expiresAt) session.expiresAt = expiresAt;
  if (status) session.status = status;
  return session;
}

function describeOptions(payload: AskUserPayload): string {
  return (payload.options ?? []).map((option) => option.value).join(", ");
}

/**
 * Check an answer against the question's answerType. Messages name what would
 * fit, never the rejected value: answers can be personal.
 */
function checkAnswer(payload: AskUserPayload, value: unknown): void {
  const fail = (expected: string): never => {
    throw new QoniValidationError(`answer() for a ${payload.answerType} question expects ${expected}`);
  };
  const values = new Set((payload.options ?? []).map((option) => option.value));
  switch (payload.answerType) {
    case "text":
      if (typeof value !== "string") fail("a string");
      return;
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value)) fail("a finite number");
      return;
    case "boolean":
      if (typeof value !== "boolean") fail("a boolean");
      return;
    case "single_choice":
      if (typeof value !== "string" || (values.size > 0 && !values.has(value))) {
        fail(`one option value: ${describeOptions(payload)}`);
      }
      return;
    case "multiple_choice":
      if (!Array.isArray(value)) fail(`an array of option values: ${describeOptions(payload)}`);
      if ((value as unknown[]).some((item) => typeof item !== "string" || (values.size > 0 && !values.has(item)))) {
        fail(`option values only: ${describeOptions(payload)}`);
      }
      return;
  }
}

/**
 * Typed wrapper over an {@link Interaction} that exposes one method per
 * action kind. Each method finds the matching declared action and posts to its
 * endpoint; calling a method whose action the backend did NOT declare throws
 * (so "dead recovery affordances" are impossible — if you can call it, the
 * backend offered it).
 */
export class InteractionHandle<T extends InteractionType = InteractionType> {
  readonly interaction: Interaction<T>;

  /**
   * @param loginSessions Login sessions opened on interactions, by interaction
   *   id. A RunHandle / MonitorHandle shares one store across the handles it
   *   hands out, so `confirmSignedIn()` finds the login `openLogin()` opened
   *   even on the handle of a later event.
   */
  constructor(
    interaction: Interaction<T>,
    private readonly post: InteractionActionPoster,
    private readonly loginSessions: LoginSessionStore = new Map(),
  ) {
    this.interaction = interaction;
  }

  get id(): string {
    return this.interaction.id;
  }
  get type(): T {
    return this.interaction.type as T;
  }
  get status(): InteractionStatus {
    return this.interaction.status;
  }
  get actions(): Action[] {
    return this.interaction.actions;
  }

  /** Whether the backend declared an action of this kind on the interaction. */
  can(kind: ActionKind): boolean {
    return this.interaction.actions.some((a) => a.kind === kind);
  }

  /**
   * Answer an `ask_user` question. The value follows `payload.answerType`:
   * `text` → string, `number` → number, `boolean` → boolean, `single_choice` →
   * one option `value`, `multiple_choice` → an array of option values. A value
   * that does not fit throws `QoniValidationError` before anything is sent.
   */
  async answer(value: AskUserAnswer): Promise<void> {
    const action = this.#declaredAction(ActionKinds.answer);
    if (this.interaction.type === "ask_user") {
      checkAnswer(this.interaction.payload as AskUserPayload, value);
    }
    await this.post(action, { response: value });
  }
  /** Skip / dismiss the interaction (proceed without acting on it). */
  async skip(): Promise<void> {
    await this.invoke(ActionKinds.skip);
  }
  /** Confirm a pending confirmation (approve the plan / destructive op). */
  async confirm(): Promise<void> {
    await this.invoke(ActionKinds.confirm);
  }
  /** Reject a pending confirmation. */
  async reject(): Promise<void> {
    await this.invoke(ActionKinds.reject);
  }
  /**
   * Start an interactive login session for a `site_login` interaction. The
   * backend needs the site to sign in to: pass `siteId`, or omit it when the
   * interaction lists exactly one site. Show `liveUrl` to the user; when they
   * say they are signed in, call {@link confirmSignedIn}, which saves the login
   * and lets the agent continue.
   * The delegation must include `QoniScopes.SITE_LOGIN_REQUEST` and
   * `QoniScopes.SITE_LOGIN_CONFIRM`; the AccessKey policy must allow both.
   */
  async openLogin(options: OpenLoginOptions = {}): Promise<OpenLoginResult> {
    // Undeclared action first: same contract as every other method.
    this.#declaredAction(ActionKinds.openLogin);
    const body: JsonObject = { site_id: this.#loginSiteId(options.siteId) };
    if (options.profileId !== undefined) {
      if (typeof options.profileId !== "string" || !options.profileId) {
        throw new QoniValidationError("openLogin profileId must be a non-empty string");
      }
      body.profile_id = options.profileId;
    }
    // Number the call before awaiting: when calls overlap, the latest call that
    // succeeds owns the session, whichever response arrives last.
    const slot = this.#loginSlot();
    const call = ++slot.calls;
    slot.inflight += 1;
    let response: unknown;
    try {
      response = await this.invoke(ActionKinds.openLogin, body);
    } finally {
      slot.inflight -= 1;
    }
    const raw = isJsonObject(response) ? response : {};
    const fields = camelizeRecord(raw);
    const profileId = asString(fields.profileId) ?? "";
    const siteId = asString(fields.siteId) ?? String(body.site_id);
    const sessionId = asString(fields.sessionId) ?? "";
    const current = slot.session;
    // Reopening can hand back the very same backend session: share its save.
    const reused =
      current !== undefined && sessionId !== "" && current.sessionId === sessionId &&
      current.profileId === profileId && current.siteId === siteId;
    const session: LoginSession = reused ? current : { profileId, siteId, sessionId, call };
    if (reused) {
      current.call = Math.max(current.call, call);
    } else if (profileId && (current?.call ?? 0) < call) {
      if (current) current.replaced = true;
      slot.session = session;
    } else {
      session.replaced = true; // an older call answered late: a newer session owns the interaction
    }
    return {
      profileId,
      siteId,
      sessionId,
      liveUrl: asString(fields.liveUrl) ?? "",
      raw,
      confirm: async (confirmOptions: ConfirmLoginOptions = {}) => {
        if (!profileId) {
          throw new QoniValidationError("openLogin response did not include a profileId to confirm");
        }
        if (session.replaced) {
          throw new QoniValidationError(
            "this login session was replaced by a newer openLogin(); confirm the newer one " +
              "(or call confirmSignedIn(), which saves the current session)",
          );
        }
        // Shares the save with confirmSignedIn(): never two saves for one session.
        return this.#saveOnce(session, confirmOptions);
      },
    };
  }
  /**
   * The user finished signing in through the live browser `openLogin()`
   * opened. Saves that login (so later tasks reuse it), then tells the agent
   * to recheck the site and continue. If the user is not signed in after all,
   * the agent raises a new `site_login` interaction.
   *
   * Saving needs `QoniScopes.SITE_LOGIN_CONFIRM` on the delegation; without
   * `openLogin()` on this interaction, only the recheck is sent.
   */
  async confirmSignedIn(): Promise<void> {
    const action = this.#declaredAction(ActionKinds.confirmSignedIn);
    const session = this.loginSessions.get(this.id)?.session;
    if (!session) {
      await this.post(action, undefined);
      return;
    }
    // One save and one recheck per session, however many handles or calls ask.
    session.done ??= this.#saveThenRecheck(session, action).catch((err: unknown) => {
      session.done = undefined; // let a retry run again
      throw err;
    });
    await session.done;
  }
  /**
   * Take over the live browser for a take_control interaction. Resolves to the
   * signed control URL to show the user (`liveUrl`) and when it expires.
   */
  async connectControl(): Promise<ControlSession> {
    return controlSession(await this.invoke(ActionKinds.connectControl));
  }
  /** Get a fresh control URL when the current one expired. */
  async refreshControl(): Promise<ControlSession> {
    return controlSession(await this.invoke(ActionKinds.refreshControl));
  }
  /** Hand control back to the agent. */
  async releaseControl(): Promise<void> {
    await this.invoke(ActionKinds.releaseControl);
  }
  /** Retry a wait interaction now. */
  async retry(): Promise<void> {
    await this.invoke(ActionKinds.retry);
  }
  /** Switch the profile a wait/login interaction is bound to. */
  async switchProfile(): Promise<void> {
    await this.invoke(ActionKinds.switchProfile);
  }

  /** `POST /profiles/{profileId}/confirm` — persist the login of `session`. */
  async #confirmLogin(session: LoginSession, options: ConfirmLoginOptions = {}): Promise<ConfirmLoginResult> {
    const confirmBody: JsonObject = { site_id: session.siteId };
    if (options.displayLabel !== undefined) confirmBody.display_label = options.displayLabel;
    // The confirm route is not a declared interaction action; it belongs to
    // the login session openLogin() started, on the same profiles router.
    const response = await this.post(
      {
        kind: ActionKinds.openLogin,
        label: "Confirm login",
        method: "POST",
        endpoint: `/profiles/${encodeURIComponent(session.profileId)}/confirm`,
      },
      confirmBody,
      { requiredScopes: [QoniScopes.SITE_LOGIN_CONFIRM] },
    );
    const raw = isJsonObject(response) ? response : {};
    const fields = camelizeRecord(raw);
    const state = asString(fields.state) ?? "";
    return {
      profileId: asString(fields.profileId) ?? session.profileId,
      active: state === "active",
      state,
      probeResult: asString(fields.probeResult) ?? "",
      raw,
    };
  }

  /** The save for `session`, started once; a failed attempt is forgotten so a retry saves again. */
  #saveOnce(session: LoginSession, options?: ConfirmLoginOptions): Promise<ConfirmLoginResult> {
    session.save ??= this.#confirmLogin(session, options).then(
      (result) => {
        if (SAVE_RETRY_PROBES.has(result.probeResult)) session.save = undefined;
        return result;
      },
      (err: unknown) => {
        // 409 no_pending_login is final: the backend already saved or dropped it.
        if (!isNoPendingLogin(err)) session.save = undefined;
        throw err;
      },
    );
    return session.save;
  }

  /**
   * Save the login, then let the agent recheck. A user who is not signed in
   * yet still gets a recheck (the agent asks again), and so does 409
   * `no_pending_login`. A save the backend could not complete (`release_failed`)
   * throws a retryable error instead of telling the agent to go on.
   */
  async #saveThenRecheck(session: LoginSession, action: Action): Promise<void> {
    let result: ConfirmLoginResult | undefined;
    try {
      result = await this.#saveOnce(session);
    } catch (err) {
      if (!isNoPendingLogin(err)) throw err;
    }
    if (result && SAVE_RETRY_PROBES.has(result.probeResult)) {
      throw new QoniError(
        `the login could not be saved yet (probeResult "${result.probeResult}"); ` +
          "the login browser is kept — call confirmSignedIn() again to retry",
        { code: "site_login.save_failed", retryable: true },
      );
    }
    // The user reopened the login while this one was being saved: the newer
    // session is not saved yet, so do not tell the agent to go on.
    if (session.replaced) {
      throw new QoniError(
        "the login was reopened while it was being saved; call confirmSignedIn() again to save the newer login",
        { code: "site_login.session_replaced", retryable: true },
      );
    }
    await this.post(action, undefined);
    session.completed = true;
  }

  #loginSlot(): LoginSessionSlot {
    let slot = this.loginSessions.get(this.id);
    if (!slot) {
      slot = { calls: 0, inflight: 0 };
      rememberBounded(this.loginSessions, this.id, slot, INTERACTION_MEMORY_LIMIT, loginSlotIdle);
    }
    return slot;
  }

  /** Resolve the site for `openLogin`: explicit, or the only listed site. */
  #loginSiteId(requested: string | undefined): string {
    const payload = this.interaction.payload as Partial<SiteLoginPayload> | undefined;
    const listed = Array.isArray(payload?.sites)
      ? payload.sites.map((site) => site.siteId).filter((id) => typeof id === "string" && id.length > 0)
      : [];
    if (requested !== undefined) {
      if (typeof requested !== "string" || !requested) {
        throw new QoniValidationError("openLogin siteId must be a non-empty string");
      }
      if (listed.length > 0 && !listed.includes(requested)) {
        throw new QoniValidationError(
          `openLogin siteId "${requested}" is not one of the sites this interaction asks for: ${listed.join(", ")}`,
        );
      }
      return requested;
    }
    if (listed.length === 1) return listed[0];
    throw new QoniValidationError(
      listed.length === 0
        ? "openLogin needs a siteId: this interaction does not list the site to sign in to"
        : `openLogin needs a siteId: choose one of ${listed.join(", ")}`,
    );
  }

  /**
   * Invoke an action by kind with an optional body. `async` so a missing-action
   * error surfaces as a rejected promise (not a synchronous throw), keeping the
   * method contract uniformly promise-based.
   */
  private async invoke(kind: ActionKind, body?: JsonObject): Promise<unknown> {
    return this.post(this.#declaredAction(kind), body);
  }

  /** The declared action of `kind`; throws when the backend did not offer it. */
  #declaredAction(kind: ActionKind): Action {
    const action = this.interaction.actions.find((a) => a.kind === kind);
    if (!action) {
      const offered = this.interaction.actions.map((a) => a.kind).join(", ") || "none";
      throw new QoniValidationError(
        `interaction "${this.interaction.id}" (${this.interaction.type}) does not offer the ` +
          `"${kind}" action — the backend declared: ${offered}. ` +
          "Only call methods whose action the interaction currently offers.",
      );
    }
    return action;
  }
}
