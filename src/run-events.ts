import { normalizeInteraction, type Interaction } from "./interactions";
import { isJsonObject, type QoniEvent, type JsonObject } from "./types";

/**
 * Semantic run events — the public event surface for doAnything / webSearch /
 * deepResearch run handles and Track monitor handles. Wire envelopes
 * (`{ type, task_id, session_id, occurred_at, data }`, snake_case payloads,
 * data-URI screenshots) are normalized here; the original wire event stays
 * reachable on `event.raw`.
 */
/**
 * `QoniEventTypes` — the complete set of `event.type` values, as named
 * constants. This is THE thing a developer matches on. Import it for
 * autocomplete + typo-safety instead of hand-typing strings:
 *
 *     import { QoniEventTypes } from "@qoniai/qoni";
 *     for await (const event of run.events()) {
 *       switch (event.type) {
 *         case QoniEventTypes.Results: …
 *         case QoniEventTypes.Done: …
 *       }
 *     }
 *
 * The raw wire types (supervisor orchestration, sub-agent execution, protocol
 * markers) are internal: all that churn folds into `QoniEventTypes.Progress`,
 * and only the handful a developer reacts to get a distinct value. The exact
 * wire string is on `event.raw.event` if ever needed.
 */
export const QoniEventTypes = {
  // --- Core (any product run can emit these) ---
  /** The agent is working — folds ALL internal steps (actions, plan/subtask, sections, telemetry, take-control, …); `event.data` is a best-effort human-readable line (string). */
  Progress: "progress",
  /** The agent produced a user-facing chat message. */
  Message: "message",
  /** HITL — a typed interaction needs the user (login / clarification / confirmation / take-control / wait); `event.data` is the full {@link Interaction} object. Act on it via the action methods (`run.interactionHandle(event.data).answer(…)` etc). */
  Interaction: "interaction",
  /** A live screenshot frame (opt in with `capture: { screenshots: true }`); image on `event.image`. */
  Screenshot: "screenshot",
  /** Terminal — the run finished; outcome + output in `event.data` (cost is on the `RunResult`). */
  Done: "done",
  // --- Web Search ---
  /** Web Search results are ready; `event.data` is the count (the list is in `done.output`). */
  ResultsReady: "resultsReady",
  // --- Deep Research ---
  /** Deep Research coarse phase changed (brief → gather → synthesize …). */
  Phase: "phase",
  /** A Deep Research outline section was completed (stream sections as they finish). */
  SectionReady: "sectionReady",
  // --- Track (monitor) ---
  /** A Track monitor was created (e.g. Do Anything handed a recurring request to Track). */
  MonitorCreated: "monitorCreated",
  /** A monitor detected a change worth acting on (the Track signal you react to). */
  Triggered: "triggered",
  /** A monitor's scheduled check finished (`event.data` is whether it found a change). */
  CheckCompleted: "checkCompleted",
} as const;

/** Every `event.type` value. Derived from {@link QoniEventTypes} — the single source. */
export type QoniEventType = (typeof QoniEventTypes)[keyof typeof QoniEventTypes];

/**
 * Categories WIRE_TO_SEMANTIC maps to. Excludes the out-of-band cases the
 * normalizer shapes directly (screenshot / done / interaction) — those don't
 * go through the generic `shapeData`.
 */
export type RunProgressType = Exclude<QoniEventType, "screenshot" | "done" | "interaction">;

/** A decoded screenshot frame. `bytes` are the raw image bytes. */
export interface RunImage {
  bytes: Uint8Array;
  mime: string;
  pageUrl?: string;
  step?: number;
}

interface RunEventBase {
  /** The run this event belongs to. */
  runId: string;
  /** ISO 8601 timestamp of when the event occurred. */
  at: string;
  /** The original wire event (escape hatch — shape may evolve with the API). */
  raw: QoniEvent<unknown>;
}

// `event.data` shape per `event.type`. Simple events: `event.data` IS the value
// (a string / number / boolean) — no field name to remember, `console.log(event.data)`
// prints it directly. Rich events: `event.data` is a small object with
// human-named fields. The full raw wire payload is always on `event.raw`.

/** `message` — an assistant/user chat message. */
export interface RunMessageData { text: string; role: string }
/** `screenshot` — page metadata; the decoded image is on `event.image`. */
export interface RunScreenshotData { pageUrl?: string; step?: number }
/** `done` — terminal outcome + final output. (Total cost is on the `RunResult`.) */
export interface RunDoneData { output?: unknown; succeeded: boolean | null; terminalReason: string }

export type RunEvent =
  // Core — any product run.
  // `progress` — `event.data` is a human-readable line (string; may be "").
  | (RunEventBase & { type: "progress"; data: string; isTerminal: false })
  | (RunEventBase & { type: "message"; data: RunMessageData; isTerminal: false })
  | (RunEventBase & { type: "interaction"; data: Interaction; isTerminal: false })
  | (RunEventBase & { type: "screenshot"; data: RunScreenshotData; image: RunImage; isTerminal: false })
  | (RunEventBase & { type: "done"; data: RunDoneData; isTerminal: true })
  // Web Search — `event.data` is the count of unique results (number).
  | (RunEventBase & { type: "resultsReady"; data: number; isTerminal: false })
  // Deep Research — `event.data` is the phase name / section title (string).
  | (RunEventBase & { type: "phase"; data: string; isTerminal: false })
  | (RunEventBase & { type: "sectionReady"; data: string; isTerminal: false })
  // Track (monitor) — monitorId / change-summary (string), or "changed" (boolean).
  | (RunEventBase & { type: "monitorCreated"; data: string; isTerminal: false })
  | (RunEventBase & { type: "triggered"; data: string; isTerminal: false })
  | (RunEventBase & { type: "checkCompleted"; data: boolean; isTerminal: false });

// ---------------------------------------------------------------------------
// Per-product event types (分型). Each product's handle is typed to ONLY the
// events that product emits, so `switch (event.type)` autocompletes just those
// and a wrong-product case is a compile error. The runtime is the same
// normalizer; these narrow the public surface per product.
// ---------------------------------------------------------------------------

/** Events any product run can emit. */
export type CoreRunEvent = Extract<
  RunEvent,
  { type: "progress" | "message" | "interaction" | "screenshot" | "done" }
>;
/** Do Anything — core events only. */
export type DoAnythingEvent = CoreRunEvent;
/** Web Search — core + `resultsReady`. */
export type WebSearchEvent = CoreRunEvent | Extract<RunEvent, { type: "resultsReady" }>;
/** Deep Research — core + `phase` / `sectionReady`. */
export type DeepResearchEvent =
  | CoreRunEvent
  | Extract<RunEvent, { type: "phase" | "sectionReady" }>;
/** Track monitor — core + `monitorCreated` / `triggered` / `checkCompleted`. */
export type MonitorEvent =
  | CoreRunEvent
  | Extract<RunEvent, { type: "monitorCreated" | "triggered" | "checkCompleted" }>;

export function isTerminalRunStatus(status: unknown): boolean {
  return status === "succeeded" || status === "failed" || status === "canceled";
}

/** Convert a snake_case key to camelCase. Keys without underscores pass through. */
function camelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

/**
 * Recursively camelCase the keys of a wire payload. Values are untouched;
 * arrays are mapped element-wise.
 */
export function camelizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelizeKeys);
  if (!isJsonObject(value)) return value;
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    out[camelKey(key)] = camelizeKeys(item);
  }
  return out;
}

export function camelizeRecord(value: unknown): JsonObject {
  const out = camelizeKeys(value);
  return isJsonObject(out) ? out : {};
}

/** Decode a `data:` URI into bytes + mime. Returns undefined for non-data URLs. */
export function decodeDataUri(uri: string): { bytes: Uint8Array; mime: string } | undefined {
  const match = /^data:([^;,]*)?(;base64)?,(.*)$/s.exec(uri);
  if (!match) return undefined;
  const [, mime, isBase64, body] = match;
  const bytes = isBase64
    ? new Uint8Array(Buffer.from(body, "base64"))
    : new TextEncoder().encode(decodeURIComponent(body));
  return { bytes, mime: mime || "application/octet-stream" };
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function decodeScreenshotImage(payload: JsonObject): RunImage | undefined {
  const url = asString(payload.screenshot_url);
  if (!url) return undefined;
  const decoded = decodeDataUri(url);
  if (!decoded) return undefined;
  return {
    ...decoded,
    pageUrl: asString(payload.page_url) ?? asString(payload.url),
    step: asNumber(payload.step) ?? asNumber(payload.step_index),
  };
}

// Wire types handled out-of-band by the normalizer (not in the table below):
//   stream.heartbeat  → null (transport keep-alive, no run event)
//   run.screenshot    → "screenshot" (or "progress" if the image won't decode)
//   run.completed     → "done" (terminal; sub-runs demote to progress)
//   run.interaction   → "interaction" (carries the typed Interaction object)
const HEARTBEAT = "stream.heartbeat";
const SCREENSHOT = "run.screenshot";
const TERMINAL = "run.completed";
const INTERACTION = "run.interaction";

/**
 * Explicit wire-type → curated `event.type` map. Most wire types are internal
 * supervisor orchestration or sub-agent execution detail and deliberately fold
 * into `progress` — that's the product-level "the agent is working" signal.
 * Only the handful a developer reacts to get a distinct category. The mapping
 * is EXPLICIT for every catalog entry (coverage-tested in
 * tests/event-catalog.test.ts) so adding a backend event forces a deliberate
 * "headline or progress?" decision rather than a silent default. A wire type
 * NOT in the catalog (an unsynced backend addition) still degrades to
 * "progress" at runtime so a new server event never breaks a consumer's stream.
 */
export const WIRE_TO_SEMANTIC: Readonly<Record<string, RunProgressType>> = {
  // --- Headline events a developer reacts to ---
  "run.message": "message",
  "search.results_ready": "resultsReady",
  "run.phase_changed": "phase", // Deep Research coarse phase
  "run.section_completed": "sectionReady", // Deep Research section finished
  "run.monitor_created": "monitorCreated", // Do Anything → Track handoff
  // NB: `run.interaction` is NOT here — it's an out-of-band case in the
  // normalizer (→ "interaction", carrying the typed Interaction object), like
  // screenshot/done. The old `run.input_request` / `run.take_control_*` family
  // it replaces is being removed backend-side; while the backend still lists
  // them in the catalog (dual-emit window) they fold to progress below — the
  // SDK no longer has an `inputRequired` surface (clean break).

  // --- Internal churn → progress (raw type stays on event.raw.event) ---
  // supervisor lifecycle / planning
  "run.status_changed": "progress",
  "run.input_request": "progress", // superseded by run.interaction
  "run.input_request_resolved": "progress",
  "run.cost_update": "progress", // cost is surfaced on RunResult, not as an event
  "run.plan_ready": "progress",
  "run.plan_finalized": "progress",
  "run.subtask_started": "progress",
  "run.subtask_graded": "progress",
  "run.subtask_status": "progress",
  "run.todos_updated": "progress",
  // sub-agent execution (actions + browser-agent telemetry)
  "run.action.started": "progress",
  "run.action.completed": "progress",
  "run.action.failed": "progress",
  "run.action.progress": "progress",
  "run.action_result": "progress",
  "run.browser_agent.config_applied": "progress",
  "run.browser_agent.summary": "progress",
  "run.browser_agent.vision_decision": "progress",
  "run.browser_agent.observe": "progress",
  "run.browser_agent.page_gate": "progress",
  // web search / deep research intermediate progress
  "search.progress": "progress",
  "search.summarize_progress": "progress",
  "search.done": "progress", // run ends on run.completed → "done"
  "run.section_started": "progress",
  "run.section_failed": "progress",
  "run.replan_started": "progress",
  "run.crosscheck_done": "progress",
  "run.synthesize_progress": "progress",
  // take-control / recording / live-url protocol
  "run.take_control_pending": "progress",
  "run.take_control_expired": "progress",
  "run.user_paused": "progress",
  "run.user_released": "progress",
  "run.recording_started": "progress",
  "run.recording_paused": "progress",
  "run.recording_finalized": "progress",
  "run.browser_live_url_changed": "progress",
  // side-channel
  "run.feedback_submitted": "progress",
};

// Track monitor stream uses its own wire vocabulary (NOT the run-event catalog).
// Handled out-of-band in the normalizer → curated Track event types.
const MONITOR_TRIGGERED = "monitor.triggered";
const MONITOR_LIFECYCLE = "monitor.lifecycle_changed";

/** Best-effort human-readable line for a `progress` event (may be ""). */
function pickNote(c: JsonObject): string {
  return (
    asString(c.note) ??
    asString(c.summary) ??
    asString(c.lastStepSummary) ??
    asString(c.label) ??
    asString(c.text) ??
    asString(c.kind) ?? // action events: "click" / "input" / "navigate" / …
    asString(c.toPhase) ??
    asString(c.status) ??
    asString(c.to) ??
    asString(c.reason) ??
    ""
  );
}

/**
 * Reshape the camelized wire payload into the fixed per-`event.type` data. This
 * is the whole point of the curated surface: once a consumer matches
 * `event.type`, `event.data` has a known shape. Caller wraps the result with
 * runId / at / raw / isTerminal.
 */
function shapeData(type: RunProgressType, c: JsonObject): RunEvent["data"] {
  switch (type) {
    // Simple events: event.data IS the value.
    case "progress":
      return pickNote(c); // a human-readable line (string)
    case "resultsReady":
      return asNumber(c.totalUniqueResults) ?? asNumber(c.count) ?? 0; // count
    case "phase":
      return asString(c.toPhase) ?? asString(c.phase) ?? ""; // phase name
    case "sectionReady":
      return asString(c.title) ?? asString(c.sectionTitle) ?? ""; // section title
    case "monitorCreated":
      return asString(c.monitorId) ?? ""; // monitor id
    case "triggered":
      return asString(c.summary) ?? asString(c.note) ?? ""; // change summary
    case "checkCompleted":
      return c.changed === true; // whether a change was found
    // Rich events: event.data is a small object.
    case "message":
      return { text: asString(c.text) ?? "", role: asString(c.role) ?? "" };
  }
}

export interface NormalizeRunEventOptions {
  /**
   * The id of the run the stream was opened for. Terminal events of OTHER
   * runs on the same stream (internal sub-runs on a doAnything session) are
   * demoted to `progress` so they never end the caller's iterator. Pass
   * undefined for streams without a single top-level run (Track monitors).
   */
  topRunId?: string;
}

/**
 * Normalize one wire SSE event into a semantic `RunEvent`.
 *
 * Returns null for frames that carry no run event (heartbeats / comments).
 * The wire type → semantic `type` mapping is explicit (WIRE_TO_SEMANTIC, plus
 * the three out-of-band cases handled here); the original wire event stays on
 * `event.raw` so you can match `event.raw.event` against `QoniEventTypes`.
 */
export function normalizeRunEvent(
  wire: QoniEvent<unknown>,
  options: NormalizeRunEventOptions = {},
): RunEvent | null {
  const envelope = isJsonObject(wire.data) ? wire.data : undefined;
  const wireType = wire.event ?? asString(envelope?.type);
  if (!wireType) return null;
  // Heartbeats are a transport keep-alive, not a run event.
  if (wireType === HEARTBEAT) return null;

  const payload = isJsonObject(envelope?.data) ? (envelope.data as JsonObject) : {};
  const taskId = asString(envelope?.task_id);
  const runId = taskId ?? options.topRunId ?? "";
  const at =
    asString(envelope?.occurred_at) ??
    asString(payload.occurred_at) ??
    asString(payload.timestamp) ??
    new Date().toISOString();
  const c = camelizeRecord(payload);
  const base = { runId, at, raw: wire };
  const isSubRun = Boolean(options.topRunId && taskId && taskId !== options.topRunId);

  if (wireType === SCREENSHOT) {
    const image = decodeScreenshotImage(payload);
    // A screenshot whose image couldn't be inlined (storage hiccup) degrades to
    // progress below — the `screenshot` type guarantees `image`.
    if (image) {
      const sData: RunScreenshotData = {};
      const pageUrl = asString(c.pageUrl) ?? asString(c.url);
      const step = asNumber(c.step) ?? asNumber(c.stepIndex);
      if (pageUrl !== undefined) sData.pageUrl = pageUrl;
      if (step !== undefined) sData.step = step;
      return { ...base, type: "screenshot", data: sData, image, isTerminal: false };
    }
  }

  // Typed interaction lifecycle (axis B): the whole Interaction object rides
  // in the payload; normalizeInteraction camelizes + narrows it. A payload
  // without a recognized `type` degrades to progress below.
  if (wireType === INTERACTION) {
    const interaction = normalizeInteraction(payload);
    if (interaction) {
      return { ...base, type: "interaction", data: interaction, isTerminal: false };
    }
  }

  // Single terminal event (sub-run terminals fall through to "progress" so they
  // never end the top-level stream).
  if (wireType === TERMINAL && !isSubRun) {
    const dData: RunDoneData = {
      output: c.output,
      succeeded: typeof c.isTaskSuccessful === "boolean" ? c.isTaskSuccessful : null,
      terminalReason: asString(c.terminalReason) ?? "",
    };
    return { ...base, type: "done", data: dData, isTerminal: true };
  }

  // Resolve the curated type, then shape `data` to match it. Monitor-stream
  // wire types are their own vocabulary (not the run catalog); everything else
  // comes from WIRE_TO_SEMANTIC, with an unsynced backend addition degrading to
  // "progress" (fail-safe). The cast is safe: shapeData returns the data shape
  // that pairs with `type`, but TS can't narrow a dynamically-resolved type.
  let type: RunProgressType;
  if (wireType === MONITOR_TRIGGERED) type = "triggered";
  else if (wireType === MONITOR_LIFECYCLE) type = "checkCompleted";
  else type = WIRE_TO_SEMANTIC[wireType] ?? "progress";

  const data = shapeData(type, c);
  // Drop empty `progress` — these are pure internal telemetry (per-step
  // browser-agent observe / page_gate, etc.) that carry no human-readable line,
  // so they'd surface as a content-less tick. Real progress (a note, an action
  // kind, a status) still comes through.
  if (type === "progress" && data === "") return null;

  return { ...base, type, data, isTerminal: false } as RunEvent;
}
