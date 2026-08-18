import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { WireEventTypes, WIRE_EVENT_TYPE_VALUES } from "../src/events";
import { WIRE_TO_SEMANTIC, QoniEventTypes } from "../src/run-events";
import {
  InteractionTypes,
  InteractionStatuses,
  ActionKinds,
} from "../src/generated/interaction-types";

// Out-of-band wire types the normalizer handles outside WIRE_TO_SEMANTIC.
const OUT_OF_BAND = new Set([
  "stream.heartbeat", // → null
  "run.screenshot", // → "screenshot"
  "run.completed", // → "done"
  "run.interaction", // → "interaction" (carries the typed Interaction object)
]);

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const catalog = JSON.parse(
  readFileSync(join(repo, "src", "generated", "event-catalog.json"), "utf8"),
) as {
  version: number;
  event_types: string[];
  interaction_types: string[];
  interaction_status: string[];
  action_kinds: string[];
};

// ---------------------------------------------------------------------------
// WireEventTypes (internal) is generated from the vendored catalog, a verbatim
// copy of the backend's published artifact. These tests pin the SDK half of
// the drift chain: catalog (vendored) ↔ WireEventTypes. The backend half
// (catalog ↔ live EventType enum) is pinned by the backend's
// test_catalog_export.py; the cross-repo half (vendored catalog ↔ live enum)
// by the webagent-e2e contract suite.
// ---------------------------------------------------------------------------

describe("WireEventTypes ↔ vendored catalog", () => {
  it("covers every catalog event type, in catalog order", () => {
    expect([...WIRE_EVENT_TYPE_VALUES]).toEqual(catalog.event_types);
  });

  it("has no extra constants the catalog doesn't list", () => {
    expect(new Set(Object.values(WireEventTypes))).toEqual(
      new Set(catalog.event_types),
    );
  });

  it("includes the families the old hand-copied subset dropped", () => {
    // Regression guard: these were entirely missing before the generated
    // catalog (web search + deep research families).
    const v = new Set<string>(Object.values(WireEventTypes));
    for (const wire of [
      "search.progress",
      "search.results_ready",
      "search.summarize_progress",
      "search.done",
      "run.phase_changed",
      "run.section_started",
      "run.section_completed",
      "run.crosscheck_done",
      "run.synthesize_progress",
      "run.monitor_created",
    ]) {
      expect(v.has(wire)).toBe(true);
    }
  });

  it("every catalog wire type is explicitly classified (no silent default)", () => {
    // The whole point of the rebuild: a backend event can't land in the
    // generic "progress" bucket by accident. Each catalog entry is either in
    // WIRE_TO_SEMANTIC or one of the three out-of-band cases.
    const unclassified = catalog.event_types.filter(
      (w) => !OUT_OF_BAND.has(w) && !(w in WIRE_TO_SEMANTIC),
    );
    expect(unclassified).toEqual([]);
  });

  it("WIRE_TO_SEMANTIC has no entries the catalog doesn't list", () => {
    const stale = Object.keys(WIRE_TO_SEMANTIC).filter(
      (w) => !catalog.event_types.includes(w),
    );
    expect(stale).toEqual([]);
  });

  it("surfaces the curated headline types; folds internal churn to progress", () => {
    // Headlines a developer reacts to:
    expect(WIRE_TO_SEMANTIC["run.message"]).toBe("message");
    expect(WIRE_TO_SEMANTIC["search.results_ready"]).toBe("resultsReady");
    expect(WIRE_TO_SEMANTIC["run.phase_changed"]).toBe("phase");
    expect(WIRE_TO_SEMANTIC["run.section_completed"]).toBe("sectionReady");
    expect(WIRE_TO_SEMANTIC["run.monitor_created"]).toBe("monitorCreated");
    // Internal supervisor / sub-agent churn folds into progress:
    for (const wire of [
      "run.action.started",
      "run.action_result",
      "run.plan_finalized",
      "run.subtask_graded",
      "run.section_started",
      "run.crosscheck_done",
      "run.browser_agent.observe",
      "run.take_control_pending",
      "run.status_changed",
      "run.cost_update", // cost is on RunResult, not an event
      "search.done", // run ends on run.completed
      "run.recording_finalized",
      // The old HITL family run.interaction replaces folds to progress while
      // the backend still dual-emits it (the SDK has no `inputRequired` surface).
      "run.input_request",
      "run.input_request_resolved",
      "run.take_control_expired",
      "run.user_paused",
      "run.user_released",
    ]) {
      expect(WIRE_TO_SEMANTIC[wire]).toBe("progress");
    }
  });

  it("QoniEventTypes constants are exactly the produced event.type values", () => {
    // QoniEventTypes is the developer-facing vocabulary; it must cover precisely
    // the set of event.type values the normalizer can emit: WIRE_TO_SEMANTIC
    // values + out-of-band "screenshot"/"done"/"interaction" + the Track
    // monitor-stream types (triggered/checkCompleted, produced by the monitor.*
    // special cases).
    const produced = new Set<string>([
      ...Object.values(WIRE_TO_SEMANTIC),
      "screenshot",
      "done",
      "interaction",
      "triggered",
      "checkCompleted",
    ]);
    expect(new Set(Object.values(QoniEventTypes))).toEqual(produced);
    // no duplicate values
    const vals = Object.values(QoniEventTypes);
    expect(vals.length).toBe(new Set(vals).size);
  });

  it("generated file is up to date (pnpm gen:event-types)", () => {
    // Fails loudly if someone re-synced the catalog but forgot to regen,
    // or hand-edited the generated file.
    expect(() =>
      execFileSync("node", ["scripts/gen-event-types.mjs", "--check"], {
        cwd: repo,
        stdio: "pipe",
      }),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Interaction discriminators (catalog v2) — the generated InteractionTypes /
// InteractionStatuses / ActionKinds must mirror the vendored catalog's enums
// exactly (the SDK half of the drift chain for axis B).
// ---------------------------------------------------------------------------

describe("interaction discriminators ↔ vendored catalog (v2)", () => {
  it("catalog is v2 and carries the three interaction enums", () => {
    expect(catalog.version).toBe(2);
    expect(Array.isArray(catalog.interaction_types)).toBe(true);
    expect(Array.isArray(catalog.interaction_status)).toBe(true);
    expect(Array.isArray(catalog.action_kinds)).toBe(true);
    expect(catalog.event_types).toContain("run.interaction");
  });

  it("InteractionTypes covers exactly the catalog interaction_types", () => {
    expect(new Set(Object.values(InteractionTypes))).toEqual(
      new Set(catalog.interaction_types),
    );
  });

  it("InteractionStatuses covers exactly the catalog interaction_status", () => {
    expect(new Set(Object.values(InteractionStatuses))).toEqual(
      new Set(catalog.interaction_status),
    );
  });

  it("ActionKinds covers exactly the catalog action_kinds", () => {
    expect(new Set(Object.values(ActionKinds))).toEqual(
      new Set(catalog.action_kinds),
    );
  });

  it("the five core interaction types are present", () => {
    const t = new Set<string>(Object.values(InteractionTypes));
    for (const type of ["site_login", "clarification", "confirmation", "take_control", "wait"]) {
      expect(t.has(type)).toBe(true);
    }
  });
});
