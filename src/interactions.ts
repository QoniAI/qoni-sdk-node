import { QoniValidationError } from "./errors";
import { QoniScopes } from "./scopes";
import { camelizeRecord } from "./run-events";
import {
  ActionKinds,
  type ActionKind,
  type InteractionStatus,
  type InteractionType,
} from "./generated/interaction-types";
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

export interface ClarificationPayload {
  question: string;
  /** Hint for how the answer should be collected (e.g. "text", "choice"). */
  inputType?: string;
}

export interface ConfirmationPayload {
  summary: string;
}

export interface TakeControlPayload {
  liveUrl: string;
  surface?: string;
  reason?: string;
}

export interface OpenLoginOptions {
  siteId?: string;
  profileId?: string;
}

export interface LoginSession {
  profileId: string;
  siteId: string;
  sessionId: string;
  liveUrl: string;
}

export interface BrowserControl {
  standaloneControlUrl: string;
  controlTokenExpiresAt: string;
  status: string;
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
  clarification: ClarificationPayload;
  confirmation: ConfirmationPayload;
  take_control: TakeControlPayload;
  wait: WaitPayload;
}

/**
 * A typed interaction object. Generic over `type` so the `payload` narrows to
 * the matching shape; the bare `Interaction` (T = InteractionType) is the union
 * a consumer switches on.
 */
export interface Interaction<T extends InteractionType = InteractionType> {
  /** Stable identity across the interaction's lifecycle. */
  id: string;
  /** The discriminator — the single field a consumer switches on. */
  type: T;
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
  /** Type-specific fields. */
  payload: InteractionPayloadByType[T];
}

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

function shapePayload(type: InteractionType, c: JsonObject): Interaction["payload"] {
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
      return payload;
    }
    case "clarification": {
      const payload: ClarificationPayload = { question: asString(c.question) ?? "" };
      const inputType = asString(c.inputType);
      if (inputType) payload.inputType = inputType;
      return payload;
    }
    case "confirmation":
      return { summary: asString(c.summary) ?? "" };
    case "take_control": {
      const payload: TakeControlPayload = { liveUrl: asString(c.liveUrl) ?? "" };
      const surface = asString(c.surface);
      const reason = asString(c.reason);
      if (surface) payload.surface = surface;
      if (reason) payload.reason = reason;
      return payload;
    }
    case "wait": {
      const payload: WaitPayload = {
        waitKind: (asString(c.waitKind) as WaitKind) ?? "external",
      };
      const until = asString(c.until);
      const retryable = asBool(c.retryable);
      if (until) payload.until = until;
      if (retryable !== undefined) payload.retryable = retryable;
      return payload;
    }
  }
}

/**
 * Normalize a `run.interaction` wire payload into a curated {@link Interaction}.
 * `payload` is the camelized interaction object carried in the event envelope's
 * `data` field. Returns null when the object lacks a recognized `type`.
 */
export function normalizeInteraction(payload: unknown): Interaction | null {
  const c = camelizeRecord(payload);
  const type = asString(c.type) as InteractionType | undefined;
  if (!type) return null;
  const interaction: Interaction = {
    id: asString(c.id) ?? "",
    type,
    status: (asString(c.status) as InteractionStatus) ?? "pending",
    createdAt: asString(c.createdAt) ?? "",
    title: asString(c.title) ?? "",
    actions: normalizeActions(c.actions),
    payload: shapePayload(type, c),
  };
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

/**
 * Posts an interaction action to its declared endpoint. The product namespace
 * supplies this (token + run addressing already bound); the handle below uses
 * it to invoke `action.endpoint` without the consumer touching HTTP.
 */
export type InteractionActionPoster = (
  action: Action,
  body: JsonObject | undefined,
) => Promise<unknown>;

export function interactionScopes(action: Action, productScope: string): string[] {
  if (action.kind === ActionKinds.openLogin) return [productScope, QoniScopes.WORKSPACE_WRITE];
  if (action.kind === ActionKinds.connectControl || action.kind === ActionKinds.refreshControl) {
    return [productScope, QoniScopes.BROWSER_CONTROL];
  }
  return [productScope];
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

  constructor(
    interaction: Interaction<T>,
    private readonly post: InteractionActionPoster,
  ) {
    this.interaction = interaction;
  }

  get id(): string {
    return this.interaction.id;
  }
  get type(): T {
    return this.interaction.type;
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

  /** Answer a clarification ask. */
  async answer(text: string): Promise<void> {
    await this.invoke(ActionKinds.answer, { response: text });
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
  /** Open the login surface for a site_login interaction. */
  async openLogin(options: OpenLoginOptions = {}): Promise<LoginSession> {
    if (!this.can(ActionKinds.openLogin)) await this.invoke(ActionKinds.openLogin);
    const sites = this.type === "site_login"
      ? (this.interaction.payload as SiteLoginPayload).sites : [];
    const siteId = options.siteId ?? (sites.length === 1 ? sites[0].siteId : undefined);
    if (!siteId || !sites.some((site) => site.siteId === siteId)) {
      throw new QoniValidationError("openLogin requires a siteId offered by this interaction");
    }
    const result = camelizeRecord(await this.invoke(ActionKinds.openLogin, {
      site_id: siteId,
      ...(options.profileId === undefined ? {} : { profile_id: options.profileId }),
    }));
    const session = {
      profileId: requiredResultString(result, "profileId"),
      siteId: requiredResultString(result, "siteId"),
      sessionId: requiredResultString(result, "sessionId"),
      liveUrl: requiredResultString(result, "liveUrl"),
    };
    if (session.siteId !== siteId || (options.profileId !== undefined && session.profileId !== options.profileId)) {
      throw new QoniValidationError("login response does not match the requested site/Profile; do not retry automatically");
    }
    return session;
  }
  /** Tell the agent the user has finished signing in. */
  async confirmSignedIn(): Promise<void> {
    await this.invoke(ActionKinds.confirmSignedIn);
  }
  /** Connect to the live browser for a take_control interaction. */
  async connectControl(): Promise<BrowserControl> {
    return controlResult(await this.invoke(ActionKinds.connectControl));
  }
  /** Refresh the live control surface / live url. */
  async refreshControl(): Promise<BrowserControl> {
    return controlResult(await this.invoke(ActionKinds.refreshControl));
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

  /**
   * Invoke an action by kind with an optional body. `async` so a missing-action
   * error surfaces as a rejected promise (not a synchronous throw), keeping the
   * method contract uniformly promise-based.
   */
  private async invoke(kind: ActionKind, body?: JsonObject): Promise<unknown> {
    const action = this.interaction.actions.find((a) => a.kind === kind);
    if (!action) {
      const offered = this.interaction.actions.map((a) => a.kind).join(", ") || "none";
      throw new QoniValidationError(
        `interaction "${this.interaction.id}" (${this.interaction.type}) does not offer the ` +
          `"${kind}" action — the backend declared: ${offered}. ` +
          "Only call methods whose action the interaction currently offers.",
      );
    }
    return this.post(action, body);
  }
}

function requiredResultString(result: JsonObject, key: string): string {
  const value = asString(result[key]);
  if (!value) throw new QoniValidationError(`interaction response is missing ${key}; do not retry a state-changing action automatically`);
  return value;
}

function controlResult(value: unknown): BrowserControl {
  const result = camelizeRecord(value);
  return {
    standaloneControlUrl: requiredResultString(result, "standaloneControlUrl"),
    controlTokenExpiresAt: requiredResultString(result, "controlTokenExpiresAt"),
    status: requiredResultString(result, "status"),
  };
}
