// AUTO-GENERATED — do not edit by hand.
// Source: src/generated/event-catalog.json (vendored from the backend's
// domain.event.types.EventType). Regenerate with `pnpm gen:event-types`
// after re-syncing the catalog. Drift is guarded by tests/event-catalog.test.ts
// (SDK side) and the webagent-e2e contract suite (vs the live backend enum).

/**
 * INTERNAL — the raw wire event types (the complete mirror of the backend
 * `EventType` enum, in canonical order). NOT a public export. Developers use
 * the curated `QoniEventTypes` / `event.type` (run-events.ts); these raw wire
 * names back the wire→curated mapping, `event.raw.event`, and the drift tests.
 */
export const WireEventTypes = {
  RUN_STATUS_CHANGED: "run.status_changed",
  RUN_INPUT_REQUEST: "run.input_request",
  RUN_INPUT_REQUEST_RESOLVED: "run.input_request_resolved",
  RUN_MESSAGE: "run.message",
  RUN_ACTION_STARTED: "run.action.started",
  RUN_ACTION_COMPLETED: "run.action.completed",
  RUN_ACTION_FAILED: "run.action.failed",
  RUN_ACTION_PROGRESS: "run.action.progress",
  RUN_SCREENSHOT: "run.screenshot",
  RUN_COST_UPDATE: "run.cost_update",
  RUN_FEEDBACK_SUBMITTED: "run.feedback_submitted",
  RUN_PLAN_READY: "run.plan_ready",
  RUN_SUBTASK_STARTED: "run.subtask_started",
  RUN_SUBTASK_GRADED: "run.subtask_graded",
  RUN_PLAN_FINALIZED: "run.plan_finalized",
  RUN_SUBTASK_STATUS: "run.subtask_status",
  RUN_TODOS_UPDATED: "run.todos_updated",
  RUN_ACTION_RESULT: "run.action_result",
  RUN_COMPLETED: "run.completed",
  STREAM_HEARTBEAT: "stream.heartbeat",
  SEARCH_PROGRESS: "search.progress",
  SEARCH_RESULTS_READY: "search.results_ready",
  SEARCH_SUMMARIZE_PROGRESS: "search.summarize_progress",
  SEARCH_DONE: "search.done",
  RUN_PHASE_CHANGED: "run.phase_changed",
  RUN_SECTION_STARTED: "run.section_started",
  RUN_SECTION_COMPLETED: "run.section_completed",
  RUN_SECTION_FAILED: "run.section_failed",
  RUN_REPLAN_STARTED: "run.replan_started",
  RUN_CROSSCHECK_DONE: "run.crosscheck_done",
  RUN_SYNTHESIZE_PROGRESS: "run.synthesize_progress",
  RUN_TAKE_CONTROL_PENDING: "run.take_control_pending",
  RUN_USER_PAUSED: "run.user_paused",
  RUN_USER_RELEASED: "run.user_released",
  RUN_TAKE_CONTROL_EXPIRED: "run.take_control_expired",
  RUN_RECORDING_STARTED: "run.recording_started",
  RUN_RECORDING_PAUSED: "run.recording_paused",
  RUN_RECORDING_FINALIZED: "run.recording_finalized",
  RUN_BROWSER_LIVE_URL_CHANGED: "run.browser_live_url_changed",
  RUN_BROWSER_AGENT_CONFIG_APPLIED: "run.browser_agent.config_applied",
  RUN_BROWSER_AGENT_SUMMARY: "run.browser_agent.summary",
  RUN_BROWSER_AGENT_VISION_DECISION: "run.browser_agent.vision_decision",
  RUN_BROWSER_AGENT_OBSERVE: "run.browser_agent.observe",
  RUN_BROWSER_AGENT_PAGE_GATE: "run.browser_agent.page_gate",
  RUN_MONITOR_CREATED: "run.monitor_created",
  RUN_INTERACTION: "run.interaction",
} as const;

export type WireEventType = (typeof WireEventTypes)[keyof typeof WireEventTypes];

/** The wire catalog as a flat, ordered list — used by the drift tests. */
export const WIRE_EVENT_TYPE_VALUES: readonly WireEventType[] =
  Object.values(WireEventTypes);
