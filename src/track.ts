import { QoniError, QoniUnsupportedError, QoniValidationError } from "./errors";
import type { Interaction, InteractionHandle } from "./interactions";
import { camelizeKeys, type MonitorEvent } from "./run-events";
import {
  isJsonObject,
  type QoniEvent,
  type QoniResponse,
  type QoniTransport,
  type JsonObject,
  type RuntimeTokenInput,
} from "./types";

export interface TrackCreateOptions {
  /** Delegation token — passed once here; the returned handle holds it. */
  token: string;
  /** Mapped verbatim to the track's instructions. Include any URLs in the prompt. */
  prompt: string;
  /** Required explicit cadence; there is no SDK default. */
  schedule: MonitorSchedule;
  title?: string;
  /** Legacy keys remain source-compatible but unsupported keys fail locally. */
  [key: string]: unknown;
}

export interface TrackAttachOptions { token: string }
/** @deprecated Track has no events endpoint. Retained for source compatibility. */
export interface MonitorEventsOptions { lastEventId?: string; signal?: AbortSignal }
/** Pagination within the most recent 50 checks, newest first; applied locally. */
export interface MonitorRunsOptions { limit?: number; offset?: number }

export type MonitorSchedule =
  | { kind: "interval"; intervalSeconds: number }
  /** Daily runs start 0–30 minutes before at in this time zone. */
  | { kind: "daily"; at: string; tz: string }
  /** @deprecated Arbitrary cron has no equivalent. Use an explicit daily schedule. */
  | { kind: "cron"; expr: string; tz?: string };

/** The high-level API never rewrites instructions; create a new track for a new intent. */
export interface MonitorRefinePatch {
  schedule?: MonitorSchedule;
  title?: string;
  /** @deprecated No corresponding Track field. */
  targetUrls?: string[];
  /** @deprecated No corresponding Track field. */
  extractionSchema?: JsonObject;
  /** @deprecated No corresponding Track field. */
  triggerDsl?: JsonObject;
  /** @deprecated No corresponding Track field. */
  stopConditionDsl?: JsonObject;
  /** @deprecated No corresponding Track field. */
  notifyChannel?: JsonObject | null;
  [key: string]: unknown;
}

/** A 202 acceptance reference, not a completed check or a monitor definition. */
export type TrackTaskRef = { trackId: string; sessionId: string; runId: string };

interface MonitorWireOps {
  get(): Promise<JsonObject>;
  update(input: JsonObject): Promise<JsonObject>;
  runNow(): Promise<JsonObject>;
  listRuns(opts: MonitorRunsOptions): Promise<JsonObject>;
  getRun(runId: string): Promise<JsonObject>;
  delete(): Promise<void>;
}

/** A Track resource handle. The historical class name is retained. */
export class MonitorHandle {
  constructor(private readonly ops: MonitorWireOps, readonly id: string) {}

  async get(): Promise<JsonObject> { return normalizeTrack(await this.ops.get()); }
  /** Pause future scheduled checks. Running tasks continue. */
  async pause(): Promise<JsonObject> { return normalizeTrack(await this.ops.update({ status: "paused" })); }
  async resume(): Promise<JsonObject> { return normalizeTrack(await this.ops.update({ status: "active" })); }
  /** Change only title or cadence. Instructions are immutable through this helper. */
  async refine(patch: MonitorRefinePatch): Promise<JsonObject> {
    assertFields(patch, ["title", "schedule"], "track.refine");
    const body = omit(patch);
    if (Object.keys(body).length === 0) throw new QoniValidationError("track.refine requires title or schedule");
    if (body.title !== undefined) validateText(body.title, "title", 120, false);
    if (body.schedule !== undefined) body.schedule = publicScheduleToWire(body.schedule);
    return normalizeTrack(await this.ops.update(body));
  }
  async runNow(): Promise<TrackTaskRef> {
    const data = await this.ops.runNow();
    return {
      trackId: responseId(data.track_id, "runNow track_id"),
      sessionId: responseId(data.session_id, "runNow session_id"),
      runId: responseId(data.run_id, "runNow run_id"),
    };
  }
  /** @deprecated No Track SSE endpoint. Use runs()/run() for checks. */
  async *events(_opts: MonitorEventsOptions = {}): AsyncIterable<MonitorEvent> {
    throw unsupported("MonitorHandle.events", "Use runs()/run() to read recent checks.");
  }
  /** @deprecated No Track interaction endpoint. Cannot authorize DoAnything actions. */
  interactionHandle(_interaction: Interaction): InteractionHandle {
    throw unsupported("MonitorHandle.interactionHandle", "DoAnything interactions require a separately authorized DoAnything handle.");
  }
  /** Read only the most recent 50 checks; limit/offset slice that window locally. */
  async runs(opts: MonitorRunsOptions = {}): Promise<JsonObject[]> {
    return checkItems(await this.ops.listRuns(opts)).map(normalizeCheck);
  }
  /** Find an exact run_id in the most recent 50 checks; never falls back to DoAnything. */
  async run(runId: string): Promise<JsonObject> { return normalizeCheck(await this.ops.getRun(runId)); }
  /** Soft-delete the track and stop future scheduling. Does not cancel an in-flight task. */
  async delete(): Promise<void> { await this.ops.delete(); }
}

export function createTrackNamespace(transport: QoniTransport) {
  const root = "/track/tracks";
  const path = (id: string) => `${root}/${encodeURIComponent(responseId(id, "track id"))}`;
  const api = {
    /** Historical name; POST /track/tracks with instructions/title and a wire schedule. */
    createMonitor: async <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> => {
      assertFields(input, ["token", "instructions", "title", "schedule"], "track.api.createMonitor");
      validateText(input.instructions, "instructions", 4000, false);
      if (input.title !== undefined) validateText(input.title, "title", 120, true);
      const schedule = validateWireSchedule(input.schedule);
      return transport.webAgentJson("POST", root, input.token, {
        body: { ...omit(input, "token"), schedule }, requiredScopes: ["webagent.track:manage"],
      });
    },
    getMonitor: async <T = unknown>(input: RuntimeTokenInput & { monitorId: string }): Promise<QoniResponse<T>> =>
      transport.webAgentJson("GET", path(input.monitorId), input.token, { requiredScopes: ["webagent.track:read"] }),
    runNow: async <T = unknown>(input: RuntimeTokenInput & { monitorId: string }): Promise<QoniResponse<T>> =>
      transport.webAgentJson("POST", `${path(input.monitorId)}/run_now`, input.token, { body: {}, requiredScopes: ["webagent.track:manage"] }),
    /** @deprecated No Track SSE endpoint; fails locally on iteration, with zero HTTP. */
    async *events<T = unknown>(_input: RuntimeTokenInput & { monitorId: string; lastEventId?: string; signal?: AbortSignal }): AsyncIterable<QoniEvent<T>> {
      throw unsupported("track.api.events", "Use listRuns/getRun for recent checks.");
    },
    /** @deprecated No Track intervene endpoint; fails locally with zero HTTP. */
    intervene: async <T = unknown>(_input: RuntimeTokenInput & { monitorId: string } & JsonObject): Promise<QoniResponse<T>> => {
      throw unsupported("track.api.intervene", "DoAnything actions require separate DoAnything authorization.");
    },
    /** GET checks, then slice limit/offset locally within the most recent 50. */
    listRuns: async <T = unknown>(input: RuntimeTokenInput & { monitorId: string; limit?: number; offset?: number }): Promise<QoniResponse<T>> => {
      validatePagination(input);
      const response = await transport.webAgentJson<JsonObject>("GET", `${path(input.monitorId)}/checks`, input.token, { requiredScopes: ["webagent.track:read"] });
      const items = checkItems(response.data);
      const offset = input.offset ?? 0;
      return { ...response, data: { ...response.data, items: items.slice(offset, input.limit === undefined ? undefined : offset + input.limit) } as T };
    },
    /** Exact lookup inside GET checks; not an unbounded historical detail endpoint. */
    getRun: async <T = unknown>(input: RuntimeTokenInput & { monitorId: string; runId: string }): Promise<QoniResponse<T>> => {
      responseId(input.runId, "run id");
      const response = await api.listRuns<{ items: JsonObject[] }>({ token: input.token, monitorId: input.monitorId });
      const row = response.data.items.find(item => item.run_id === input.runId);
      if (!row) throw new QoniError(`Run ${input.runId} was not found in track ${input.monitorId}'s recent 50 checks; older history is outside this endpoint's range.`, { code: "not_found" });
      return { ...response, data: row as T };
    },
    /** PATCH real fields. Unlike refine(), the wire API also accepts instructions. */
    updateMonitor: async <T = unknown>(input: RuntimeTokenInput & { monitorId: string } & JsonObject): Promise<QoniResponse<T>> => {
      assertFields(input, ["token", "monitorId", "title", "instructions", "schedule", "status"], "track.api.updateMonitor");
      const body = omit(input, "token", "monitorId");
      if (Object.keys(body).length === 0) throw new QoniValidationError("track update requires at least one field");
      for (const key of ["title", "instructions"]) {
        if (body[key] !== undefined) validateText(body[key], key, key === "title" ? 120 : 4000, false);
      }
      if (body.status !== undefined && body.status !== "active" && body.status !== "paused") throw new QoniValidationError("track status must be active or paused");
      if (body.schedule !== undefined) body.schedule = validateWireSchedule(body.schedule);
      return transport.webAgentJson("PATCH", path(input.monitorId), input.token, { body, requiredScopes: ["webagent.track:manage"] });
    },
    /** DELETE 204 soft-deletes; it does not cancel the track's current task. */
    deleteMonitor: async <T = unknown>(input: RuntimeTokenInput & { monitorId: string }): Promise<QoniResponse<T>> =>
      transport.webAgentJson("DELETE", path(input.monitorId), input.token, { requiredScopes: ["webagent.track:manage"] }),
  };

  function ops(token: string | undefined, monitorId: string): MonitorWireOps {
    return {
      get: async () => record((await api.getMonitor({ token, monitorId })).data),
      update: async body => record((await api.updateMonitor({ token, monitorId, ...body })).data),
      runNow: async () => record((await api.runNow({ token, monitorId })).data),
      listRuns: async opts => record((await api.listRuns({ token, monitorId, ...opts })).data),
      getRun: async runId => record((await api.getRun({ token, monitorId, runId })).data),
      delete: async () => { await api.deleteMonitor({ token, monitorId }); },
    };
  }
  return {
    create: async (input: TrackCreateOptions): Promise<MonitorHandle> => {
      assertFields(input, ["token", "prompt", "schedule", "title"], "track.create");
      validateText(input.prompt, "prompt", 4000, false);
      const schedule = publicScheduleToWire(input.schedule);
      const response = await api.createMonitor({ token: input.token, instructions: input.prompt, schedule, ...(input.title === undefined ? {} : { title: input.title }) });
      const id = responseId(record(response.data).id, "track create id");
      return new MonitorHandle(ops(input.token, id), id);
    },
    attach: async (monitorId: string, options: TrackAttachOptions): Promise<MonitorHandle> => {
      responseId(monitorId, "track id");
      const handle = new MonitorHandle(ops(options.token, monitorId), monitorId);
      await handle.get();
      return handle;
    },
    api,
  };
}

function unsupported(method: string, alternative: string): QoniUnsupportedError {
  return new QoniUnsupportedError(`${method} is unsupported by the current Track API. ${alternative}`);
}
function assertFields(value: unknown, allowed: string[], method: string): asserts value is JsonObject {
  if (!isJsonObject(value)) throw new QoniValidationError(`${method} requires an object`);
  const unknown = Object.keys(value).filter(key => value[key] !== undefined && !allowed.includes(key));
  if (unknown.length) throw unsupported(method, `Unsupported fields: ${unknown.join(", ")}. Use prompt instructions and an explicit schedule.`);
}
function validateText(value: unknown, name: string, max: number, empty: boolean): void {
  if (typeof value !== "string" || (!empty && !value.trim()) || [...value].length > max) throw new QoniValidationError(`track ${name} must be ${empty ? "a" : "a nonempty"} string of at most ${max} characters`);
}
function responseId(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new QoniValidationError(`${label} must be a nonempty string`);
  return value;
}
function record(value: unknown): JsonObject {
  if (!isJsonObject(value)) throw new QoniValidationError("Track response must be an object");
  return value;
}
function checkItems(value: unknown): JsonObject[] {
  const data = record(value);
  if (!Array.isArray(data.items) || data.items.some(item => !isJsonObject(item) || typeof item.run_id !== "string" || !item.run_id)) throw new QoniValidationError("Track checks response requires items with run_id");
  return data.items as JsonObject[];
}
function normalizeCheck(value: JsonObject): JsonObject {
  return { ...camelizeKeys(value) as JsonObject, id: responseId(value.run_id, "check run_id") };
}
function normalizeTrack(value: JsonObject): JsonObject {
  responseId(value.id, "track response id");
  const normalized = camelizeKeys(value) as JsonObject;
  // Server-owned schedules are read without SDK input validation. A write may
  // already have committed, and Python ZoneInfo need not match Node Intl.
  if (value.schedule !== undefined) normalized.schedule = scheduleFromWire(value.schedule);
  return normalized;
}
function scheduleFromWire(value: unknown): unknown {
  if (!isJsonObject(value)) return value;
  const keys = Object.keys(value);
  if (keys.length === 1 && keys[0] === "every_seconds" && typeof value.every_seconds === "number") {
    return { kind: "interval", intervalSeconds: value.every_seconds };
  }
  if (keys.length === 2 && keys.includes("daily_at") && keys.includes("tz") &&
      typeof value.daily_at === "string" && typeof value.tz === "string") {
    return { kind: "daily", at: value.daily_at, tz: value.tz };
  }
  // Unknown/incomplete wire shapes stay verbatim: no guessed cadence, tz, or kind.
  return value;
}
function publicScheduleToWire(value: unknown): JsonObject {
  if (!isJsonObject(value)) throw new QoniValidationError("track requires an explicit interval or daily schedule");
  const schedule = omit(value);
  if (schedule.kind === "cron") throw unsupported("track cron schedule", 'Use { kind: "daily", at: "HH:MM", tz: "Area/City" } explicitly for a daily cadence; arbitrary cron is not converted.');
  if (schedule.kind === "interval") {
    if (Object.keys(schedule).some(k => !["kind", "intervalSeconds", "interval_seconds"].includes(k))) throw new QoniValidationError("track interval accepts only kind and intervalSeconds");
    if (schedule.intervalSeconds !== undefined && schedule.interval_seconds !== undefined && schedule.intervalSeconds !== schedule.interval_seconds) throw new QoniValidationError("conflicting intervalSeconds and interval_seconds");
    return validateWireSchedule({ every_seconds: schedule.intervalSeconds ?? schedule.interval_seconds });
  }
  if (schedule.kind === "daily") {
    if (Object.keys(schedule).some(k => !["kind", "at", "tz"].includes(k)) || typeof schedule.tz !== "string" || !schedule.tz) throw new QoniValidationError("track daily requires kind, at and tz");
    return validateWireSchedule({ daily_at: schedule.at, tz: schedule.tz });
  }
  throw new QoniValidationError("track schedule kind must be interval or daily");
}
function validateWireSchedule(value: unknown): JsonObject {
  if (!isJsonObject(value)) throw new QoniValidationError("track schedule is required and must be an object");
  const schedule = omit(value);
  if (schedule.kind === "cron") throw unsupported("track wire cron schedule", 'Use { daily_at: "HH:MM", tz: "Area/City" } (SDK kind: "daily") explicitly; arbitrary cron is not converted.');
  const keys = Object.keys(schedule);
  if (keys.length === 1 && keys[0] === "every_seconds") {
    const n = schedule.every_seconds;
    if (typeof n !== "number" || !Number.isInteger(n) || n < 600 || n > 2592000) throw new QoniValidationError("track every_seconds must be an integer between 600 and 2592000 seconds");
    return { every_seconds: n };
  }
  if (keys.includes("daily_at") && keys.every(k => ["daily_at", "tz"].includes(k))) {
    if (typeof schedule.daily_at !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(schedule.daily_at)) throw new QoniValidationError("track daily_at must be HH:MM (24-hour)");
    const tz = schedule.tz ?? "UTC";
    if (typeof tz !== "string" || !tz) throw new QoniValidationError("track tz must be a time zone name");
    try { new Intl.DateTimeFormat("en", { timeZone: tz }); }
    catch { throw new QoniValidationError(`unknown track time zone: ${tz}`); }
    return { daily_at: schedule.daily_at, tz };
  }
  throw new QoniValidationError('track wire schedule must be { every_seconds: N } or { daily_at: "HH:MM", tz: "Area/City" }');
}
function validatePagination(value: MonitorRunsOptions): void {
  for (const key of ["limit", "offset"] as const) {
    const n = value[key];
    if (n !== undefined && (typeof n !== "number" || !Number.isSafeInteger(n) || n < 0)) throw new QoniValidationError(`track ${key} must be a nonnegative integer within the recent 50 checks`);
  }
}
function omit(value: object, ...keys: string[]): JsonObject {
  return Object.fromEntries(Object.entries(value).filter(([key, item]) => !keys.includes(key) && item !== undefined));
}
