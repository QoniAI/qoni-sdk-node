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
  /**
   * Receives every original SSE frame before semantic normalization/filtering.
   * Use this for audit logs and observability evidence that must retain internal
   * Agent/tool lifecycle payloads. Some frames do not become semantic events.
   */
  onWireEvent?: (event: QoniEvent<unknown>) => void | Promise<void>;
  /** Called whenever the SDK reconnects a dropped SSE stream. */
  onReconnect?: (info: RunReconnectInfo) => void;
}

export interface RunReconnectInfo {
  attempt: number;
  lastEventId?: string;
  error: unknown;
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
  /** Temporary signed storage URL; refresh after expiry. */
  downloadUrl?: string;
  expiresIn?: number;
  refreshDownloadUrl?(): Promise<string>;
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
  /** Every original SSE frame, including frames filtered from the semantic stream. */
  onWireEvent?: (event: QoniEvent<unknown>) => void | Promise<void>;
  /** Reconnect telemetry for the underlying resumable SSE stream. */
  onReconnect?: (info: RunReconnectInfo) => void;
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
  getDetail(signal?: AbortSignal): Promise<JsonObject>;
  streamEvents(opts: RunEventsOptions): AsyncIterable<QoniEvent<unknown>>;
  /**
   * Invoke an interaction action by posting to its declared endpoint. The
   * Interaction model's `actions[]` carry the endpoint + method, so the SDK
   * never hard-codes a HITL route — it forwards what the backend declared.
   */
  postAction(action: Action, body: JsonObject | undefined): Promise<void>;
  cancel(reason?: string): Promise<JsonObject>;
  /** Products without artifacts leave this undefined → `result.artifacts` is []. */
  listArtifacts?(signal?: AbortSignal): Promise<Artifact[]>;
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
      await opts.onWireEvent?.(wire);
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
    const { signal, timedOut, dispose } = withTimeout(opts.signal, opts.timeoutMs);
    let lastEventId: string | undefined;
    let eventIdAtLastClose: string | undefined;
    let sawCleanClose = false;
    let terminalDetail: JsonObject | undefined;
    let terminalDoneReason: string | undefined;
    let screenshotIndex = 0;

    try {
      settled: for (;;) {
        for await (const event of this.events({
          signal,
          lastEventId,
          onWireEvent: (wire) => waitWithSignal(() => {
            if (wire.id !== undefined) lastEventId = wire.id;
            return opts.onWireEvent?.(wire);
          }, signal),
          onReconnect: opts.onReconnect,
        })) {
          await waitWithSignal(() => opts.onEvent?.(event), signal);
          if (event.type === "screenshot") {
            await waitWithSignal(() => opts.onScreenshot?.(event.image, screenshotIndex++), signal);
          } else if (event.type === "interaction") {
            await waitWithSignal(() => opts.onInteraction?.(this.interactionHandle(event.data), event), signal);
          }
          if (event.isTerminal) {
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
        const detail = await waitWithSignal(() => this.ops.getDetail(signal), signal);
        if (isTerminalRunStatus(normalizeRunStatus(this.id, detail).status)) {
          terminalDetail = detail;
          break;
        }
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

      const detail = terminalDetail ?? await waitWithSignal(() => this.ops.getDetail(signal), signal);
      this.#adoptSessionRef(detail);
      const result = settleRunResult(this.id, detail, [], terminalDoneReason);
      result.artifacts = this.ops.listArtifacts
        ? await waitWithSignal(() => this.ops.listArtifacts!(signal), signal)
        : [];
      return result;
    } catch (err) {
      if (timedOut() && !opts.signal?.aborted) {
        throw new QoniTimeoutError(
          `run.wait timed out after ${opts.timeoutMs} ms — the run keeps executing ` +
            "server-side; attach() to it again or cancel() it",
          { cause: err },
        );
      }
      throw err;
    } finally {
      dispose();
    }
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
  const status = normalizeRunStatus(runId, detail).status;
  if (!isTerminalRunStatus(status)) {
    throw new QoniError(
      "run detail did not confirm a terminal state — re-attach or poll status()",
      { code: "upstream.failed", retryable: true, body: detail },
    );
  }
  return {
    runId,
    status: status as RunResult["status"],
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
): { signal?: AbortSignal; timedOut: () => boolean; dispose: () => void } {
  if (!timeoutMs) return { signal, timedOut: () => false, dispose: () => {} };
  const controller = new AbortController();
  let fired = false;
  const timer = setTimeout(() => {
    fired = true;
    controller.abort();
  }, timeoutMs);
  const onAbort = () => controller.abort(signal?.reason);
  const dispose = () => {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  };
  controller.signal.addEventListener("abort", dispose, { once: true });
  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  return { signal: controller.signal, timedOut: () => fired, dispose };
}

function waitWithSignal<T>(operation: () => T | PromiseLike<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return Promise.resolve().then(operation);
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve().then(() => {
      signal.throwIfAborted();
      return operation();
    }).then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}
