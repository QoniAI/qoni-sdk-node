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

/** Wire `options`: plain strings (today's clarification) or `{ value, label }` objects. */
function normalizeOptions(value: unknown): AskUserOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw): AskUserOption[] => {
    if (typeof raw === "string" && raw) return [{ value: raw, label: raw }];
    if (!isJsonObject(raw)) return [];
    const optionValue = asString(raw.value);
    return optionValue ? [{ value: optionValue, label: asString(raw.label) ?? optionValue }] : [];
  });
}

/**
 * `ask_user` from either wire shape. A native `ask_user` names its
 * `answer_type`; a `clarification` only hints with `input_type: "choice"` when
 * it carries options. A choice without any option degrades to free text, so the
 * app never renders an empty picker.
 */
function askUserPayload(c: JsonObject): AskUserPayload {
  const options = normalizeOptions(c.options);
  const declared = asString(c.answerType) ?? asString(c.inputType);
  let answerType: AskUserAnswerType = "text";
  if (declared && ANSWER_TYPES.has(declared as AskUserAnswerType)) answerType = declared as AskUserAnswerType;
  else if (declared === "choice" || (!declared && options.length > 0)) answerType = "single_choice";
  if ((answerType === "single_choice" || answerType === "multiple_choice") && options.length === 0) {
    answerType = "text";
  }
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
 * Fold a lifecycle update onto the card already seen for the same `id`. A
 * settling update (resolved / expired / canceled) carries no new card content
 * — the backend sends a minimal shell, and today labels every resolve
 * `clarification` — so it only moves `status`, `resolvedAt` and `actions`.
 * The same holds for any update whose type disagrees with the original: an
 * interaction never changes type, so a card keyed by `id` stays type-stable.
 */
export function foldInteraction(previous: Interaction | undefined, next: Interaction): Interaction {
  if (!previous || previous.id !== next.id) return next;
  if (previous.type === next.type && !SETTLED_INTERACTION_STATUSES.has(next.status)) return next;
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
   * session and closes its browser, whatever the outcome:
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
   * - `active: false` with any other `probeResult` — the user was not signed
   *   in. Start a new session with `openLogin({ siteId, profileId })` and show
   *   its new `liveUrl`; the old one no longer works.
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
  /** Settles once the login is saved (or the session already ended). */
  saving?: Promise<void>;
}

/** Login sessions by interaction id, shared by the handles of one run. */
export type LoginSessionStore = Map<string, LoginSession>;

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
   * @param loginSessions Login sessions opened on this run's interactions, by
   *   interaction id. A run shares one store across the handles it hands out,
   *   so `confirmSignedIn()` finds the login `openLogin()` opened even on the
   *   handle of a later event.
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
    const response = await this.invoke(ActionKinds.openLogin, body);
    const raw = isJsonObject(response) ? response : {};
    const fields = camelizeRecord(raw);
    const profileId = asString(fields.profileId) ?? "";
    const siteId = asString(fields.siteId) ?? String(body.site_id);
    // A new session replaces any earlier one on this interaction: only the
    // latest live browser holds the login confirmSignedIn() should save.
    const session: LoginSession = { profileId, siteId };
    if (profileId) this.loginSessions.set(this.id, session);
    return {
      profileId,
      siteId,
      sessionId: asString(fields.sessionId) ?? "",
      liveUrl: asString(fields.liveUrl) ?? "",
      raw,
      confirm: async (confirmOptions: ConfirmLoginOptions = {}) => {
        if (!profileId) {
          throw new QoniValidationError("openLogin response did not include a profileId to confirm");
        }
        const result = await this.#confirmLogin(session, confirmOptions);
        // Confirming ends the session whatever the outcome; confirmSignedIn()
        // must not try to save it a second time.
        session.saving = Promise.resolve();
        return result;
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
    const session = this.loginSessions.get(this.id);
    if (session) {
      session.saving ??= this.#saveLogin(session).catch((err: unknown) => {
        session.saving = undefined; // let a retry save again
        throw err;
      });
      await session.saving;
    }
    await this.post(action, undefined);
  }
  /** Connect to the live browser for a take_control interaction. */
  async connectControl(): Promise<void> {
    await this.invoke(ActionKinds.connectControl);
  }
  /** Refresh the live control surface / live url. */
  async refreshControl(): Promise<void> {
    await this.invoke(ActionKinds.refreshControl);
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

  /**
   * Save the login for confirmSignedIn(). Whatever the probe says, the agent
   * rechecks next, so only a failed request matters — except 409
   * `no_pending_login`: the backend already saved or dropped the session.
   */
  async #saveLogin(session: LoginSession): Promise<void> {
    try {
      await this.#confirmLogin(session);
    } catch (err) {
      if (err instanceof QoniError && err.status === 409 && err.code === "no_pending_login") return;
      throw err;
    }
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
