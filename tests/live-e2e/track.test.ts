import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { JsonObject, MonitorHandle } from "../../src";
import {
  allowLiveEnvironmentConstraint,
  collectRunEvents,
  delegateLiveToken,
  liveE2EEnabled,
  liveClient,
  openRawEventRecorder,
  trackScopes,
} from "./helpers";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;

describeLiveE2E("live e2e: Track (semantic surface)", () => {
  let client: ReturnType<typeof liveClient>;
  let token: string;
  let monitorReady: Promise<MonitorHandle | undefined> | undefined;
  let deleted = false;

  beforeAll(async () => {
    client = liveClient();
    token = (await delegateLiveToken(client, trackScopes)).token;
  });

  afterAll(async () => {
    if (!deleted) {
      await monitorReady?.then((monitor) => monitor?.delete()).catch(() => undefined);
    }
  });

  // One monitor shared across the file: token passed ONCE at track.create,
  // every later operation goes through the MonitorHandle.
  function ensureMonitor() {
    monitorReady ??= (async () => {
      const monitor = await allowLiveEnvironmentConstraint(
        client.track.create({
          token,
          // Plain natural-language intent — no nonce: the intent feeds LLM
          // alignment, and traceability comes from monitor.id.
          // 60s is the backend minimum interval; the price moves every tick,
          // so the change trigger fires on real scheduled ticks.
          // No target_urls: the agent-driven tick path finds the price from
          // the instructions alone. Direct mode skips the alignment dialogue,
          // so the fields alignment would derive must be supplied here:
          // extractionSchema (else ticks extract {}) and tickInstructions
          // (else ticks fall back to the legacy scrape path, which needs URLs).
          // Top-level keys are camelCase (the SDK snake-cases them); nested
          // values are wire-shaped passthrough.
          prompt: "Monitor the live Bitcoin price and notify on any change",
          notifyChannel: { kind: "console_inbox" },
          schedule: { kind: "interval", interval_seconds: 60 },
          extractionSchema: { btc_price_usd: "number" },
          tickInstructions:
            "Find the current Bitcoin price in USD from a public price page and report it as btc_price_usd.",
          triggerDsl: { on: "change" },
        }),
      );
      return monitor ?? undefined;
    })();
    return monitorReady;
  }

  it("track.create({ token, intent, schedule, ... }) returns a monitor monitor", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    expect(monitor.id).toBeTruthy();
  });

  it("monitor.get() returns the normalized monitor definition", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    const data = await monitor.get();
    // Domain content: the monitor we created, not just a 200.
    expect(JSON.stringify(data)).toContain("Bitcoin");
    // Normalized camelCase — no snake_case keys at the top level.
    expect(Object.keys(data).some((key) => key.includes("_"))).toBe(false);
  });

  it("track.attach() reconnects to the monitor", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    const attached = await client.track.attach(monitor.id, { token });
    expect(attached.id).toBe(monitor.id);
    expect(JSON.stringify(await attached.get())).toContain("Bitcoin");
  });

  it("monitor.refine() is observable on monitor.events()", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    const eventsPromise = collectRunEvents((signal) => monitor.events({ signal }), {
      label: "track monitor.events",
      timeoutMs: 45_000,
      until: (event) => event.raw.event === "monitor.lifecycle_changed",
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await monitor.refine({
      schedule: { kind: "interval", intervalSeconds: 5400 },
      triggerDsl: { on: "change" },
    });
    await eventsPromise;
  });

  it("monitor.pause() / resume() control scheduled execution", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    const paused = await monitor.pause();
    expect(JSON.stringify(paused)).toMatch(/pause/i);
    const resumed = await monitor.resume();
    expect(JSON.stringify(resumed)).toMatch(/active|resume/i);
  });

  it("monitor.runNow() triggers an immediate tick", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    await allowLiveEnvironmentConstraint(monitor.runNow());
  });

  // Raw-recording test, implemented via the semantic stream: every normalized
  // event carries the original wire envelope on `event.raw`, which is what
  // gets persisted under .secrets/runs/track-<monitorId>/ (EAK_OUT_DIR
  // overrides).
  //
  // This must witness the SCHEDULE actually RECURRING, not just "a tick fired".
  // A single tick proves nothing about timing: an interval monitor's first tick
  // typically fires immediately on (re)registration, so its started_at is also
  // "after the recording began". The only thing that proves a timer cadence is
  // the GAP between two consecutive scheduled ticks. So: tighten the interval to
  // the backend minimum (60s), never call runNow, collect TWO fresh ticks (whose
  // started_at falls after recording began — replayed history and earlier manual
  // ticks don't count), and assert the inter-tick gap is ~interval, which is
  // impossible to satisfy if ticks fired back-to-back instead of on a timer.
  const INTERVAL_SECONDS = 60;
  it("records a RECURRING scheduler-driven cadence to disk via event.raw", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    await monitor.refine({
      schedule: { kind: "interval", intervalSeconds: INTERVAL_SECONDS },
      triggerDsl: { on: "change" },
    });

    const recorder = openRawEventRecorder(`track-${monitor.id}`);
    const startedAfter = Date.now();
    console.log(
      `recording monitor ${monitor.id} (waiting for TWO scheduled ticks @ ${INTERVAL_SECONDS}s) → ${recorder.dir}`,
    );

    // tickN -> completion timestamp (ms) for every SCHEDULER-driven tick whose
    // completion lands after we began recording. The backend does not emit a
    // `monitor.tick_started` event, so cadence is measured from consecutive
    // `monitor.tick_completed` envelope timestamps (`event.raw.data.ts`); the
    // baseline tick that fires immediately on (re)registration is excluded via
    // its `is_first_tick` flag so it can't masquerade as a timed tick.
    const freshTickCompletedAt = new Map<number, number>();
    const completedFreshTicks: number[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      // First fresh tick can arrive within seconds (immediate on re-register);
      // the second only after a full interval. Budget ~3 intervals of headroom.
      Number(process.env.EAK_LIVE_TRACK_TICK_TIMEOUT_MS || 220_000),
    );
    try {
      // Monitor streams have no terminal event — the caller decides when to
      // stop. The tick wire events (monitor.tick_completed) aren't part of the
      // curated MonitorEvent surface, so read their raw envelope (snake_case)
      // off event.raw: `ts` is the completion timestamp, `data` the payload.
      for await (const event of monitor.events({ signal: controller.signal })) {
        recorder.record(event);
        const wireType = String(event.raw.event || "");
        const envelope = event.raw.data as
          | { ts?: unknown; data?: Record<string, unknown> }
          | undefined;
        const inner = envelope?.data ?? {};
        if (wireType === "monitor.tick_completed") {
          // The immediate baseline tick carries no cadence signal — skip it.
          if (inner.is_first_tick === true) continue;
          const completedAt = Date.parse(String(envelope?.ts ?? ""));
          const tickN = Number(inner.tick_n);
          if (
            Number.isFinite(completedAt) &&
            completedAt > startedAfter &&
            Number.isFinite(tickN) &&
            !freshTickCompletedAt.has(tickN)
          ) {
            freshTickCompletedAt.set(tickN, completedAt);
            completedFreshTicks.push(tickN);
          }
        }
        // Stop once two distinct fresh ticks have completed — that's the minimum
        // needed to measure one real scheduling interval.
        if (completedFreshTicks.length >= 2) break;
      }
    } catch (error) {
      if (!controller.signal.aborted) throw error;
    } finally {
      clearTimeout(timeout);
      controller.abort();
    }

    // Two consecutive fresh ticks → the actual interval the scheduler waited.
    const [firstTickN, secondTickN] = completedFreshTicks;
    const gapSeconds =
      completedFreshTicks.length >= 2
        ? (freshTickCompletedAt.get(secondTickN)! - freshTickCompletedAt.get(firstTickN)!) / 1000
        : undefined;
    console.log(
      `recorded ${recorder.count()} events; fresh ticks completed=[${completedFreshTicks.join(
        ", ",
      )}]${gapSeconds !== undefined ? `, gap=${gapSeconds.toFixed(1)}s` : ""} → ${recorder.file}`,
    );

    // Witnessed two scheduler-driven ticks (no runNow involved).
    expect(completedFreshTicks.length).toBeGreaterThanOrEqual(2);
    expect(fs.existsSync(recorder.file)).toBe(true);
    // The cadence assertion: the gap must be close to the configured interval.
    // Lower bound is the real test — it's impossible to satisfy unless the timer
    // genuinely waited an interval (an immediate / back-to-back tick gaps ~0s).
    // Upper bound stays lenient: a slow tick run can push the next started_at out.
    expect(gapSeconds).toBeGreaterThanOrEqual(INTERVAL_SECONDS * 0.75);
    expect(gapSeconds).toBeLessThanOrEqual(INTERVAL_SECONDS * 3);
  }, 260_000);

  it("monitor.runs() / monitor.run() expose tick runs read-only", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    // By now at least one tick has completed (the recording test witnessed one).
    const runs = await monitor.runs({ limit: 10 });
    expect(runs.length).toBeGreaterThan(0);
    const first = runs[0] as JsonObject;
    expect(typeof first.id).toBe("string");
    const detail = await monitor.run(String(first.id));
    expect(detail.id).toBe(first.id);
  });

  // Escape-hatch smoke: the wire layer (api.*) must keep working for advanced
  // users, but it appears ONLY here — everything above is semantic.
  it("escape hatch: api.getMonitor({ token, monitorId }) still speaks wire", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    const wire = await client.track.api.getMonitor<JsonObject>({ token, monitorId: monitor.id });
    expect(wire.data).toBeTruthy();
  });

  it("monitor.delete() removes the monitor", async () => {
    const monitor = await ensureMonitor();
    if (!monitor) return;
    await monitor.delete();
    deleted = true;
  });
});
