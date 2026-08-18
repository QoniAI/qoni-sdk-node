/**
 * INTERNAL — raw wire event types.
 *
 * `WireEventTypes` is GENERATED (from the vendored catalog, a copy of the
 * backend `EventType` enum) by `scripts/gen-event-types.mjs`. These are the
 * raw transport names (`run.action.started`, `run.section_completed`, …) — an
 * implementation detail, NOT a public export. They back the wire→curated
 * mapping (run-events.ts `WIRE_TO_SEMANTIC`), the `event.raw.event` escape
 * hatch, and the drift tests (SDK `tests/event-catalog.test.ts` + the
 * webagent-e2e contract suite vs the live backend enum).
 *
 * The developer-facing event vocabulary is `QoniEventTypes` (the curated
 * `event.type` values) — see run-events.ts.
 */
export {
  WireEventTypes,
  WIRE_EVENT_TYPE_VALUES,
  type WireEventType,
} from "./generated/event-types";
