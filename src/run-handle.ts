import { QoniError, QoniTimeoutError } from "./errors";
import {
  InteractionHandle,
  type Action,
  type Interaction,
} from "./interactions";
import {
  isTerminalRunStatus,
  normalizeRunEvent,
  type RunEvent,
  type RunImage,
} from "./run-events";
import { isJsonObject, type QoniEvent, type JsonObject } from "./types";

/** Opaque reference to a backend browser/context session a run executed in. */
export interface SessionRef {
  sessionId: string;
}

/** Semantic capture switch — controls which media events the stream delivers. */
export interface CaptureOptions {
  screenshots?: boolean;
  videoFrames?: boolean;
}

export interface RunEventsOptions {
  lastEventId?: string;
  signal?: AbortSignal;
}

/** A refreshed snapshot of a run's state, as returned by `run.status()`. */
export interface RunStatus {
  id: string;
  /** pending | running | awaiting_input | succeeded | failed | canceled */
  status: string;
  sessionId?: string;
  output?: unknown;
  /** Full wire run envelope (escape hatch — shape may evolve with the API). */
  raw: JsonObject;
}

/** A deliverable produced by a run. Content is fetched lazily via `content()`. */
export interface Artifact {
  id: string;
  name?: string;
  mime?: string;
  sizeBytes?: number;
  createdAt?: string;
  content(): Promise<Uint8Array>;
}

/** Settled outcome of `run.wait()`. */
export interface RunResult {
  runId: string;
  status: "succeeded" | "failed" | "canceled";
  /** Final answer / output payload (shape is task-specific). */
  output?: unknown;
  /** Deliverables (deepResearch reports etc). Empty array for products without artifacts. */
  artifacts: Artifact[];
  terminalReason?: string;
  isTaskSuccessful?: boolean;
  /** Full wire run envelope (escape hatch — shape may evolve with the API). */
  raw: JsonObject;
}

export interface RunWaitOptions {
  /** Client-side wall-clock cap. On elapse, `wait` throws `QoniTimeoutError`; the run keeps executing server-side. */
  timeoutMs?: number;
  signal?: AbortSignal;
  onEvent?: (event: RunEvent) => void | Promise<void>;
  /**
   * Fires on `event.type === "interaction"` (HITL). The handle exposes typed
   * action methods (`interaction.answer(…)` / `confirmSignedIn()` /
   * `releaseControl()` / …) that post to the action's declared endpoint.
   */
  onInteraction?: (
    interaction: InteractionHandle,
    event: RunEvent,
  ) => void | Promise<void>;
  onScreenshot?: (image: RunImage, index: number) => void | Promise<void>;
}

/**
 * Product-specific wire operations a `RunHandle` is built on. Each product
 * namespace constructs one of these from its `api.*` escape-hatch methods
 * with the token + run addressing already bound.
 */
export interface RunWireOps {
  getDetail(): Promise<JsonObject>;
  streamEvents(opts: RunEventsOptions): AsyncIterable<QoniEvent<unknown>>;
  /**
   * Invoke an interaction action by posting to its declared endpoint. The
   * Interaction model's `actions[]` carry the endpoint + method, so the SDK
   * never hard-codes a HITL route — it forwards what the backend declared.
   */
  postAction(action: Action, body: JsonObject | undefined): Promise<void>;
  cancel(reason?: string): Promise<JsonObject>;
  /** Products without artifacts leave this undefined → `result.artifacts` is []. */
  listArtifacts?(): Promise<Artifact[]>;
}

// Wire statuses cancel() treats as "may already be terminal" — it then
// refreshes the run and returns the terminal state instead of throwing.
// Auth / permission / 5xx errors always rethrow.
const CANCEL_IDEMPOTENT_STATUSES = new Set([400, 404, 409, 410, 422]);

/**
 * Handle to a single run. Generic over the product's event set (分型): a
 * `RunHandle<DeepResearchEvent>` only ever yields Deep Research events, so
 * `switch (event.type)` autocompletes just that product's events and a
 * wrong-product case is a compile error. The runtime is identical across
 * products; the generic only narrows the public type surface.
 */
export class RunHandle<E extends RunEvent = RunEvent> {
  readonly id: string;
  /** Pass back to `run({ session })` to reuse the same backend session. */
  sessionRef?: SessionRef;
  private readonly capture: CaptureOptions;

  constructor(
    private readonly ops: RunWireOps,
    init: { id: string; sessionRef?: SessionRef; capture?: CaptureOptions },
  ) {
    this.id = init.id;
    this.sessionRef = init.sessionRef;
    this.capture = init.capture ?? {};
  }

  /** Refresh and return the run's current state. */
  async status(): Promise<RunStatus> {
    const detail = await this.ops.getDetail();
    this.#adoptSessionRef(detail);
    return normalizeRunStatus(this.id, detail);
  }

  /**
   * Stream semantic events. Ends automatically at the run's terminal event.
   * Reconnects with `Last-Event-ID` catch-up are handled internally.
   */
  async *events(opts: RunEventsOptions = {}): AsyncIterable<E> {
    for await (const wire of this.ops.streamEvents(opts)) {
      const event = normalizeRunEvent(wire, { topRunId: this.id });
      if (!event) continue;
      if (event.type === "screenshot" && !this.capture.screenshots) continue;
      if (isVideoFrame(wire) && !this.capture.videoFrames) continue;
      // The normalizer yields the full RunEvent union; this product handle only
      // receives its own subset, so the narrowing cast is sound.
      yield event as E;
      if (event.isTerminal) return;
    }
  }

  /** Drive the run to a terminal state and return the settled result. */
  async wait(opts: RunWaitOptions = {}): Promise<RunResult> {
    const { signal, timedOut } = withTimeout(opts.signal, opts.timeoutMs);
    let lastEventId: string | undefined;
    let eventIdAtLastClose: string | undefined;
    let sawCleanClose = false;
    let terminalPayload: JsonObject | undefined;
    let terminalDoneReason: string | undefined;
    let screenshotIndex = 0;

    try {
      settled: for (;;) {
        for await (const event of this.events({ signal, lastEventId })) {
          if (event.raw.id) lastEventId = event.raw.id;
          await opts.onEvent?.(event);
          if (event.type === "screenshot") {
            await opts.onScreenshot?.(event.image, screenshotIndex++);
          } else if (event.type === "interaction") {
            await opts.onInteraction?.(this.interactionHandle(event.data), event);
          }
          if (event.isTerminal) {
            // Fallback only (used if the canonical getDetail() read below
            // fails): the raw wire envelope, not the trimmed `done` data.
            terminalPayload = isJsonObject(event.raw.data)
              ? (event.raw.data as JsonObject)
              : undefined;
            // The `done` event carries terminalReason even when the detail
            // envelope omits it — keep it as a fallback so RunResult isn't
            // missing a reason the stream already delivered.
            if (event.type === "done") terminalDoneReason = event.data.terminalReason || undefined;
            break settled;
          }
        }
        // The server closed the stream without a terminal event. If the run
        // detail says terminal we are done; otherwise resume the stream from
        // the last seen event id — but only if the stream made progress since
        // the previous clean close, so a server that keeps closing an idle
        // stream cannot spin us in a tight reconnect loop.
        const detail = await this.ops.getDetail();
        if (isTerminalRunStatus(detail.status)) break;
        if (sawCleanClose && lastEventId === eventIdAtLastClose) {
          throw new QoniError(
            "run event stream ended before a terminal event while the run is " +
              `still "${String(detail.status)}" — re-attach or poll status()`,
            { code: "upstream.failed", retryable: true },
          );
        }
        sawCleanClose = true;
        eventIdAtLastClose = lastEventId;
      }
    } catch (err) {
      if (timedOut() && !opts.signal?.aborted) {
        throw new QoniTimeoutError(
          `run.wait timed out after ${opts.timeoutMs} ms — the run keeps executing ` +
            "server-side; attach() to it again or cancel() it",
          { cause: err },
        );
      }
      throw err;
    }

    // Settle from the run-detail envelope (canonical shape: costs, tokens,
    // step counts) — the terminal event payload is leaner and only used as
    // a fallback if the detail read fails right after completion.
    let detail: JsonObject;
    try {
      detail = await this.ops.getDetail();
    } catch (err) {
      if (!terminalPayload) throw err;
      detail = terminalPayload;
    }
    this.#adoptSessionRef(detail);
    const artifacts = this.ops.listArtifacts ? await this.ops.listArtifacts() : [];
    return settleRunResult(this.id, detail, artifacts, terminalDoneReason);
  }

  /**
   * Wrap an {@link Interaction} (from `event.data` of an `interaction` event)
   * in a typed {@link InteractionHandle} bound to this run. The handle's action
   * methods (`answer` / `confirmSignedIn` / `releaseControl` / …) post to the
   * endpoint the backend declared for that action.
   */
  interactionHandle(interaction: Interaction): InteractionHandle {
    return new InteractionHandle(interaction, (action, body) =>
      this.ops.postAction(action, body),
    );
  }

  /**
   * Cancel the run. Idempotent: cancelling an already-terminal run returns
   * its terminal state instead of throwing.
   */
  async cancel(reason?: string): Promise<RunStatus> {
    try {
      const data = await this.ops.cancel(reason);
      this.#adoptSessionRef(data);
      return normalizeRunStatus(this.id, data);
    } catch (err) {
      if (err instanceof QoniError && CANCEL_IDEMPOTENT_STATUSES.has(err.status ?? 0)) {
        let snapshot: RunStatus;
        try {
          snapshot = await this.status();
        } catch {
          throw err;
        }
        if (isTerminalRunStatus(snapshot.status)) return snapshot;
      }
      throw err;
    }
  }

  #adoptSessionRef(detail: JsonObject): void {
    const sessionId = typeof detail.session_id === "string" ? detail.session_id : undefined;
    if (sessionId && !this.sessionRef) this.sessionRef = { sessionId };
  }
}

export function normalizeRunStatus(id: string, detail: JsonObject): RunStatus {
  return {
    id,
    status: typeof detail.status === "string" ? detail.status : inferStatus(detail),
    sessionId: typeof detail.session_id === "string" ? detail.session_id : undefined,
    output: runOutput(detail),
    raw: detail,
  };
}

function settleRunResult(
  runId: string,
  detail: JsonObject,
  artifacts: Artifact[],
  fallbackTerminalReason?: string,
): RunResult {
  const terminalReason =
    (typeof detail.terminal_reason === "string" ? detail.terminal_reason : undefined) ??
    fallbackTerminalReason;
  const isTaskSuccessful =
    typeof detail.is_task_successful === "boolean" ? detail.is_task_successful : undefined;
  let status: RunResult["status"];
  if (isTerminalRunStatus(detail.status)) {
    status = detail.status as RunResult["status"];
  } else if (terminalReason === "canceled") {
    status = "canceled";
  } else if (
    terminalReason === "failed" ||
    terminalReason === "expired" ||
    isTaskSuccessful === false
  ) {
    status = "failed";
  } else {
    status = "succeeded";
  }
  return {
    runId,
    status,
    output: runOutput(detail),
    artifacts,
    terminalReason,
    isTaskSuccessful,
    raw: detail,
  };
}

// Product run envelopes name their output differently today (doAnything
// `output`, deepResearch `result`, webSearch `results`) — one field out.
function runOutput(detail: JsonObject): unknown {
  return detail.output ?? detail.result ?? detail.results;
}

function inferStatus(detail: JsonObject): string {
  const reason = typeof detail.terminal_reason === "string" ? detail.terminal_reason : undefined;
  if (reason === "canceled") return "canceled";
  if (reason === "failed" || reason === "expired") return "failed";
  if (reason === "done") return "succeeded";
  return "";
}

function isVideoFrame(wire: QoniEvent<unknown>): boolean {
  const type = wire.event ?? (isJsonObject(wire.data) ? wire.data.type : undefined);
  return type === "browser_video_frame" || type === "run.browser_video_frame";
}

// Combine an optional user signal with an optional wall-clock timeout into one
// signal (Node 18 has no AbortSignal.any). `timedOut()` reports whether OUR
// timer fired (vs the user aborting), so the caller can distinguish them.
export function withTimeout(
  signal: AbortSignal | undefined,
  timeoutMs: number | undefined,
): { signal?: AbortSignal; timedOut: () => boolean } {
  if (!timeoutMs) return { signal, timedOut: () => false };
  const controller = new AbortController();
  let fired = false;
  const timer = setTimeout(() => {
    fired = true;
    controller.abort();
  }, timeoutMs);
  controller.signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return { signal: controller.signal, timedOut: () => fired };
}
