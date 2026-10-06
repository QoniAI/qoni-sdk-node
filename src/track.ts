import { QoniValidationError } from "./errors";
import {
  InteractionHandle,
  foldInteraction,
  rememberBounded,
  interactionActionScopes,
  type Interaction,
  type LoginSessionStore,
} from "./interactions";
import { camelizeKeys, normalizeRunEvent, type MonitorEvent } from "./run-events";
import {
  isJsonObject,
  type QoniEvent,
  type QoniHttpMethod,
  type QoniResponse,
  type QoniTransport,
  type JsonObject,
  type RuntimeTokenInput,
} from "./types";
import type { Action } from "./interactions";

export interface TrackCreateOptions {
  /** Delegation token — passed once here; the returned handle holds it. */
  token: string;
  /** Natural-language description of what to monitor. */
  prompt: string;
  /** Rest of the monitor definition (url, schedule, …) — camelCase keys. */
  [key: string]: unknown;
}

export interface TrackAttachOptions {
  token: string;
}

export interface MonitorEventsOptions {
  lastEventId?: string;
  signal?: AbortSignal;
}

export interface MonitorRunsOptions {
  limit?: number;
  offset?: number;
}

/** A monitor's check cadence. */
export type MonitorSchedule =
  | { kind: "cron"; expr: string; /** IANA time zone for the cron expression. */ tz?: string }
  | { kind: "interval"; intervalSeconds: number; tz?: string };

/**
 * Fields to change on a monitor via {@link MonitorHandle.refine}. Pass any
 * subset; at least one is required. The monitor's natural-language `intent`
 * is NOT refinable — it drives URL/schema/DSL generation, so changing it means
 * creating a new monitor.
 */
export interface MonitorRefinePatch {
  schedule?: MonitorSchedule;
  targetUrls?: string[];
  extractionSchema?: JsonObject;
  triggerDsl?: JsonObject;
  stopConditionDsl?: JsonObject;
  notifyChannel?: JsonObject | null;
  [key: string]: unknown;
}

interface MonitorWireOps {
  get(): Promise<JsonObject>;
  update(input: JsonObject): Promise<JsonObject>;
  runNow(): Promise<JsonObject>;
  streamEvents(opts: MonitorEventsOptions): AsyncIterable<QoniEvent<unknown>>;
  postAction(
    action: Action,
    body: JsonObject | undefined,
    options?: { requiredScopes?: readonly string[] },
  ): Promise<unknown>;
  listRuns(opts: MonitorRunsOptions): Promise<JsonObject>;
  getRun(runId: string): Promise<JsonObject>;
  delete(): Promise<void>;
}

/**
 * Handle to a Track monitor — a resident resource (unlike a one-shot run).
 * Holds the delegation token and monitor id internally; no method takes a
 * token or an id.
 */
export class MonitorHandle {
  readonly id: string;
  /** Login sessions opened on this monitor's interactions — see {@link interactionHandle}. */
  readonly #loginSessions: LoginSessionStore = new Map();
  /** Latest card per interaction id, so settling shells fold onto it. */
  readonly #interactions = new Map<string, Interaction>();

  constructor(private readonly ops: MonitorWireOps, id: string) {
    this.id = id;
  }

  /** Refresh and return the monitor (normalized camelCase fields). */
  async get(): Promise<JsonObject> {
    return normalizeMonitorRecord(await this.ops.get());
  }

  /**
   * Pause the monitor — stops scheduled ticks until {@link resume}. The
   * monitor stays addressable; this is the way to "stop monitoring" without
   * deleting.
   */
  async pause(): Promise<JsonObject> {
    return normalizeMonitorRecord(await this.ops.update({ action: "pause" }));
  }

  /** Resume a paused monitor. */
  async resume(): Promise<JsonObject> {
    return normalizeMonitorRecord(await this.ops.update({ action: "resume" }));
  }

  /**
   * Change the monitor definition. Pass any subset of fields (at least one);
   * `schedule` is `{ kind: "cron", expr }` or `{ kind: "interval", intervalSeconds }`.
   * The backend re-validates the trigger DSL against the schema, so a bad
   * change is rejected, not applied. The natural-language intent is not
   * refinable — create a new monitor to change it.
   */
  async refine(patch: MonitorRefinePatch): Promise<JsonObject> {
    const { schedule, ...rest } = patch;
    const body: JsonObject = snakeifyKeys(rest as JsonObject);
    if (schedule) body.schedule = normalizeSchedule(schedule);
    if (Object.keys(body).length === 0) {
      throw new QoniValidationError(
        "track refine requires at least one field to change (schedule / targetUrls / " +
          "extractionSchema / triggerDsl / stopConditionDsl / notifyChannel)",
      );
    }
    return normalizeMonitorRecord(await this.ops.update({ action: "refine", patch: body }));
  }

  /** Trigger an immediate tick outside the schedule. */
  async runNow(): Promise<JsonObject> {
    return normalizeMonitorRecord(await this.ops.runNow());
  }

  /**
   * Stream semantic monitor events. Monitors are resident, so the stream has
   * no terminal event — it ends only when closed by the caller or the server.
   */
  async *events(opts: MonitorEventsOptions = {}): AsyncIterable<MonitorEvent> {
    for await (const wire of this.ops.streamEvents(opts)) {
      let event = normalizeRunEvent(wire);
      if (event?.type === "interaction") {
        const card = foldInteraction(this.#interactions.get(event.data.id), event.data);
        rememberBounded(this.#interactions, card.id, card);
        event = { ...event, data: card };
      }
      // The monitor stream only carries core + Track events; the cast narrows
      // the full RunEvent union to that subset.
      if (event) yield event as MonitorEvent;
    }
  }

  /**
   * Wrap an {@link Interaction} (from `event.data` of an `interaction` event on
   * the monitor stream — e.g. a `site_login` to unlock a `needs_reauth` park)
   * in a typed {@link InteractionHandle}. The handle's action methods post to
   * the endpoint the backend declared for that action. Handles of one
   * MonitorHandle share the login sessions `openLogin()` opens.
   */
  interactionHandle(interaction: Interaction): InteractionHandle {
    return new InteractionHandle(
      interaction,
      (action, body, options) => this.ops.postAction(action, body, options),
      this.#loginSessions,
    );
  }

  /**
   * Read-only list of the runs the monitor's ticks produced. Tick runs are
   * owned by the scheduler — to stop monitoring use `pause()` / `delete()`.
   */
  async runs(opts: MonitorRunsOptions = {}): Promise<JsonObject[]> {
    const data = await this.ops.listRuns(opts);
    const items = Array.isArray(data.items) ? data.items : Array.isArray(data.runs) ? data.runs : [];
    return items.filter(isJsonObject).map(normalizeMonitorRun);
  }

  /** Read-only detail of a single tick run. */
  async run(runId: string): Promise<JsonObject> {
    return normalizeMonitorRun(await this.ops.getRun(runId));
  }

  /** Delete the monitor. */
  async delete(): Promise<void> {
    await this.ops.delete();
  }
}

export function createTrackNamespace(transport: QoniTransport) {
  /**
   * Wire-level escape hatch — 1:1 with the backend HTTP contract. Shapes
   * here may evolve with the API and are not covered by the frozen public
   * contract.
   */
  const api = {
    createMonitor: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
      transport.webAgentJson("POST", "/track/monitors", input.token, {
        body: omit(input, "token"),
        requiredScopes: ["webagent.track:manage"],
      }),

    getMonitor: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/track/monitors/${encodeURIComponent(input.monitorId)}`,
        input.token,
        {
          requiredScopes: ["webagent.track:read"],
        },
      ),

    runNow: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/track/monitors/${encodeURIComponent(input.monitorId)}/run_now`,
        input.token,
        {
          body: {},
          requiredScopes: ["webagent.track:manage"],
        },
      ),

    events: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string; lastEventId?: string; signal?: AbortSignal },
    ): AsyncIterable<QoniEvent<T>> =>
      transport.webAgentSSE(
        `/track/monitors/${encodeURIComponent(input.monitorId)}/events`,
        input.token,
        {
          lastEventId: input.lastEventId,
          requiredScopes: ["webagent.track:read"],
          signal: input.signal,
        },
      ),

    intervene: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string } & JsonObject,
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/track/monitors/${encodeURIComponent(input.monitorId)}/intervene`,
        input.token,
        {
          body: normalizeTrackInterveneInput(omit(input, "token", "monitorId")),
          requiredScopes: ["webagent.track:manage"],
        },
      ),

    listRuns: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string; limit?: number; offset?: number },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/track/monitors/${encodeURIComponent(input.monitorId)}/runs`,
        input.token,
        {
          query: omit(input, "token", "monitorId"),
          requiredScopes: ["webagent.track:read"],
        },
      ),

    getRun: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string; runId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/track/monitors/${encodeURIComponent(input.monitorId)}/runs/${encodeURIComponent(input.runId)}`,
        input.token,
        {
          requiredScopes: ["webagent.track:read"],
        },
      ),

    updateMonitor: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string } & JsonObject,
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "PATCH",
        `/track/monitors/${encodeURIComponent(input.monitorId)}`,
        input.token,
        {
          body: omit(input, "token", "monitorId"),
          requiredScopes: ["webagent.track:manage"],
        },
      ),

    deleteMonitor: <T = unknown>(
      input: RuntimeTokenInput & { monitorId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "DELETE",
        `/track/monitors/${encodeURIComponent(input.monitorId)}`,
        input.token,
        {
          // Backend DELETE /track/monitors/{id} requires track:manage
          // (see api/v1/track/monitors.py:delete_monitor).
          requiredScopes: ["webagent.track:manage"],
        },
      ),
  };

  function buildOps(token: string | undefined, monitorId: string): MonitorWireOps {
    return {
      get: async () => asRecord((await api.getMonitor<unknown>({ token, monitorId })).data),
      update: async (input) =>
        asRecord((await api.updateMonitor<unknown>({ token, monitorId, ...input })).data),
      runNow: async () => asRecord((await api.runNow<unknown>({ token, monitorId })).data),
      streamEvents: (opts) =>
        api.events({ token, monitorId, lastEventId: opts.lastEventId, signal: opts.signal }),
      postAction: async (action, body, options) =>
        (
          await transport.webAgentJson(
            (action.method || "POST") as QoniHttpMethod,
            action.endpoint,
            token,
            {
              ...(body !== undefined ? { body } : {}),
              requiredScopes: options?.requiredScopes ?? interactionActionScopes(action, "webagent.track:manage"),
            },
          )
        ).data,
      listRuns: async (opts) =>
        asRecord((await api.listRuns<unknown>({ token, monitorId, ...opts })).data),
      getRun: async (runId) =>
        asRecord((await api.getRun<unknown>({ token, monitorId, runId })).data),
      delete: async () => {
        await api.deleteMonitor({ token, monitorId });
      },
    };
  }

  return {
    /** Create a monitor. Returns a handle — see `MonitorHandle`. */
    create: async (input: TrackCreateOptions): Promise<MonitorHandle> => {
      const { token, prompt, ...rest } = input;
      if (!prompt || typeof prompt !== "string") {
        throw new QoniValidationError("track.create requires a prompt string");
      }
      const body = snakeifyKeys(rest);
      // Same wire shape as refine(): `{ kind: "interval", intervalSeconds }`
      // must reach the backend as `interval_seconds`, or it falls back to its
      // default interval.
      if (body.schedule !== undefined) body.schedule = normalizeSchedule(body.schedule);
      const created = await api.createMonitor<{ id?: string; monitor_id?: string }>({
        token,
        intent: prompt,
        ...body,
      });
      const monitorId = created.data.id || created.data.monitor_id;
      if (!monitorId) {
        throw new QoniValidationError("track monitor create did not return a monitor id");
      }
      return new MonitorHandle(buildOps(token, monitorId), monitorId);
    },

    /** Reconnect to an existing monitor. Verifies it exists before returning. */
    attach: async (monitorId: string, opts: TrackAttachOptions): Promise<MonitorHandle> => {
      const handle = new MonitorHandle(buildOps(opts.token, monitorId), monitorId);
      await handle.get();
      return handle;
    },

    api,
  };
}

// Tick runs are read-only views — normalize to camelCase and guarantee a
// uniform `id` regardless of which wire field carried it.
function normalizeMonitorRun(item: JsonObject): JsonObject {
  const normalized = normalizeMonitorRecord(item);
  if (typeof normalized.id !== "string" || !normalized.id) {
    const id = normalized.runId ?? normalized.snapshotId;
    if (typeof id === "string" && id) normalized.id = id;
  }
  return normalized;
}

function normalizeTrackInterveneInput(input: JsonObject): JsonObject {
  return renameKeys(input, { requestId: "request_id" });
}

// Wire fields whose keys are user-defined (the extraction schema's field names
// and the values extracted for them). camelCase normalization stops at these
// keys: `{ source_url: "string" }` must read back as `source_url`.
const USER_KEYED_FIELDS = new Set(["extraction_schema", "baseline_extracted", "extracted"]);
// Inside each `diffs[]` entry, these carry extracted values keyed by the user's
// field names (field_diff before/after) or list items keyed the same way
// (list_diff added/removed/sample_unchanged). fingerprint_diff carries hashes only.
const USER_KEYED_DIFF_FIELDS = new Set(["before", "after", "added", "removed", "sample_unchanged"]);

/** camelCase a monitor / tick record, leaving user-keyed field contents verbatim. */
function normalizeMonitorRecord(value: JsonObject): JsonObject {
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    if (USER_KEYED_FIELDS.has(key)) out[camelKey(key)] = item;
    else if (key === "diffs" && Array.isArray(item)) out.diffs = item.map(normalizeDiff);
    else out[camelKey(key)] = camelizeKeys(item);
  }
  return out;
}

function normalizeDiff(entry: unknown): unknown {
  if (!isJsonObject(entry)) return camelizeKeys(entry);
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(entry)) {
    out[camelKey(key)] = USER_KEYED_DIFF_FIELDS.has(key) ? item : camelizeKeys(item);
  }
  return out;
}

function camelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

/**
 * Normalize a {@link MonitorSchedule} to the backend's wire shape
 * (`{ kind, expr | interval_seconds, tz }`). Only `intervalSeconds` is renamed;
 * every other field (such as `tz`) passes through unchanged. Accepts an already
 * snake_case `interval_seconds`; kinds other than interval/cron pass through for
 * the backend to validate.
 */
function normalizeSchedule(schedule: unknown): unknown {
  if (!isJsonObject(schedule)) return schedule;
  if (schedule.kind === "interval") {
    const { intervalSeconds, interval_seconds, ...rest } = schedule;
    const seconds = intervalSeconds ?? interval_seconds;
    if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
      throw new QoniValidationError(
        'track interval schedule needs a positive number: { kind: "interval", intervalSeconds }',
      );
    }
    return { ...rest, interval_seconds: seconds };
  }
  if (schedule.kind === "cron" && (typeof schedule.expr !== "string" || !schedule.expr.trim())) {
    throw new QoniValidationError('track cron schedule needs an expression: { kind: "cron", expr }');
  }
  return schedule;
}

/** Shallow camelCase → snake_case for wire bodies; nested values untouched. */
function snakeifyKeys(value: JsonObject): JsonObject {
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined) continue;
    out[key.replace(/([A-Z])/g, (_, ch: string) => `_${ch.toLowerCase()}`)] = item;
  }
  return out;
}

function asRecord(value: unknown): JsonObject {
  return isJsonObject(value) ? value : {};
}

function omit(value: object, ...keys: string[]): JsonObject {
  const skipped = new Set(keys);
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    if (!skipped.has(key) && item !== undefined) out[key] = item;
  }
  return out;
}

function renameKeys(value: JsonObject, mapping: Record<string, string>): JsonObject {
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    const target = mapping[key] || key;
    if (out[target] === undefined) out[target] = item;
  }
  return out;
}
