import { QoniValidationError } from "./errors";
import {
  RunHandle,
  type Artifact,
  type CaptureOptions,
  type RunWireOps,
  type SessionRef,
} from "./run-handle";
import type { DoAnythingEvent } from "./run-events";
import {
  isJsonObject,
  type QoniEvent,
  type QoniHttpMethod,
  type QoniResponse,
  type QoniTransport,
  type JsonObject,
  type RuntimeTokenInput,
} from "./types";

/**
 * A structured snapshot of the agent's state at a single step — not just an
 * image. The screenshot is one field (an inline reference/data), alongside the
 * metadata and extracted page state captured at that moment.
 */
export interface DoAnythingSnapshot {
  /** When the snapshot was captured (ISO 8601). */
  capturedAt?: string;
  /** Which step of the run this snapshot belongs to. */
  stepIndex?: number;
  /** The page the agent was on. */
  url?: string;
  /** Title of the page, if known. */
  title?: string;
  /** The screenshot image — carried in JSON (base64) and/or by reference. */
  image?: SnapshotImage;
  /** What the agent was doing at this step. */
  action?: SnapshotAction;
}

export interface SnapshotImage {
  /** Base64-encoded image bytes (no data: prefix). */
  base64?: string;
  /** MIME type, e.g. "image/jpeg". */
  contentType?: string;
  /** Direct URL to the image, when the backend exposes one. */
  url?: string;
  /** Artifact id, when the image is stored as an artifact. */
  artifactId?: string;
  width?: number;
  height?: number;
}

export interface SnapshotAction {
  /** "navigate" | "click" | "type" | ... */
  kind?: string;
  /** The element/URL/value the action targeted. */
  target?: string;
  /** Human-readable summary of the action. */
  summary?: string;
}

export interface RunLimits {
  maxDurationMinutes?: number;
}

export interface DoAnythingRunOptions {
  /** Delegation token — passed once here; the returned handle holds it. */
  token: string;
  /** Natural-language task for the agent to carry out. */
  prompt: string;
  capture?: CaptureOptions;
  limits?: RunLimits;
  /**
   * Reuse an existing browser session (follow-up run); a new one is created
   * around the run by default. Maps to `session_id` on the wire create body.
   */
  session?: SessionRef;
  // Product-specific options stay camelCase.
  profileId?: string;
  keepAlive?: boolean;
  allowedActions?: string[];
  skills?: string[];
  [key: string]: unknown;
}

export interface DoAnythingAttachOptions {
  token: string;
  /**
   * Optional — runs are addressed by `run_id` alone; resolution happens via
   * `GET /do_anything/runs/{run_id}`. Accepted for callers that already hold
   * a `sessionRef`; otherwise it is adopted from the run detail envelope.
   */
  session?: SessionRef;
  capture?: CaptureOptions;
}

// Options the wire create body has no field for — either platform-decided
// server-side (model via `llm.default_model`, cost ceiling via the internal
// budget guard, browser egress via dynconfig) or retired phantom knobs the
// backend never consumed and now 422s (extra="forbid"). Sending them would
// be a silent drop or a wire error, so `run()` fails loudly up front
// (contract §4).
const PLATFORM_DECIDED_RUN_OPTIONS = [
  "model",
  "proxyCountryCode",
  "callbackUrl",
  "workspaceId",
  "outputSchema",
  "cacheScript",
] as const;

export function createDoAnythingNamespace(transport: QoniTransport) {
  /**
   * Wire-level escape hatch — 1:1 with the backend HTTP contract
   * (snake_case fields). Run-scoped methods use the single-ID route family
   * `/do_anything/runs/{run_id}` (qoni-sdk-public-surface.md §12.1); session
   * endpoints stay session-scoped. Shapes here may evolve with the API and
   * are not covered by the frozen public contract.
   */
  const api = {
    createSession: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
      transport.webAgentJson("POST", "/do_anything/sessions", input.token, {
        body: omit(input, "token"),
        requiredScopes: ["webagent.do_anything:manage"],
      }),

    /**
     * `POST /do_anything/runs` — one call creates the run. Without
     * `session_id` a fresh session is created around the run; with it the
     * run is a follow-up in that session (409 while the prior run is
     * non-terminal).
     */
    createRun: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
      transport.webAgentJson("POST", "/do_anything/runs", input.token, {
        body: normalizeDoAnythingRunInput(omit(input, "token")),
        requiredScopes: ["webagent.do_anything:manage"],
      }),

    getRun: <T = unknown>(
      input: RuntimeTokenInput & { runId: string; signal?: AbortSignal },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/do_anything/runs/${encodeURIComponent(input.runId)}`,
        input.token,
        {
          signal: input.signal,
          requiredScopes: ["webagent.do_anything:read"],
        },
      ),

    events: async function* <T = unknown>(
      input: RuntimeTokenInput & {
        runId: string;
        lastEventId?: string;
        signal?: AbortSignal;
        /**
         * Forwarded as the `include_screenshots` query flag — set false to
         * skip `run.screenshot` rows in the replay/backfill window.
         */
        includeScreenshots?: boolean;
        /**
         * Drop events for internal sub-runs (planning / grading) and yield only
         * the top-level run's events. Matches on `event.data.task_id`.
         * Default false.
         */
        onlyTopLevel?: boolean;
        onReconnect?: (info: { attempt: number; lastEventId?: string; error: unknown }) => void;
      },
    ): AsyncIterable<QoniEvent<T>> {
      const path = `/do_anything/runs/${encodeURIComponent(input.runId)}/events`;
      const stream = transport.webAgentSSE<T>(path, input.token, {
        lastEventId: input.lastEventId,
        requiredScopes: ["webagent.do_anything:read"],
        signal: input.signal,
        onReconnect: input.onReconnect,
        ...(input.includeScreenshots === undefined
          ? {}
          : { query: { include_screenshots: input.includeScreenshots } }),
      });
      for await (const event of stream) {
        if (input.onlyTopLevel) {
          const taskId = envelopeTaskId(event);
          if (taskId && taskId !== input.runId) continue; // skip sub-run events
        }
        yield event;
      }
    },

    intervene: <T = unknown>(
      input: RuntimeTokenInput & { runId: string } & JsonObject,
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/do_anything/runs/${encodeURIComponent(input.runId)}/intervene`,
        input.token,
        {
          body: normalizeDoAnythingInterveneInput(omit(input, "token", "runId")),
          requiredScopes: ["webagent.do_anything:manage"],
        },
      ),

    cancel: <T = unknown>(
      input: RuntimeTokenInput & { runId: string; reason?: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/do_anything/runs/${encodeURIComponent(input.runId)}/cancel`,
        input.token,
        {
          body: omit(input, "token", "runId"),
          requiredScopes: ["webagent.do_anything:manage"],
        },
      ),

    readArtifacts: <T = DoAnythingSnapshot>(
      input: RuntimeTokenInput & { sessionId: string; artifactId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/do_anything/sessions/${encodeURIComponent(input.sessionId)}/artifacts/${encodeURIComponent(input.artifactId)}`,
        input.token,
        {
          requiredScopes: ["webagent.do_anything:read"],
        },
      ),

    listArtifacts: <T = { items: JsonObject[] }>(
      input: RuntimeTokenInput & { runId: string; signal?: AbortSignal },
    ): Promise<QoniResponse<T>> => transport.webAgentJson(
      "GET", `/do_anything/runs/${encodeURIComponent(input.runId)}/artifacts`, input.token,
      { signal: input.signal, requiredScopes: ["webagent.do_anything:read"] },
    ),

    artifactDownloadUrl: (
      input: RuntimeTokenInput & { artifactId: string },
    ): Promise<QoniResponse<{ download_url: string; expires_in: number }>> => transport.webAgentJson(
      "GET", `/do_anything/artifacts/${encodeURIComponent(input.artifactId)}/download-url`, input.token,
      { requiredScopes: ["webagent.do_anything:read"] },
    ),

    readRecording: <T = unknown>(
      input: RuntimeTokenInput & { sessionId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/do_anything/sessions/${encodeURIComponent(input.sessionId)}/recording`,
        input.token,
        {
          requiredScopes: ["webagent.do_anything:read"],
        },
      ),
  };

  /** Durable files for one run; also usable after reconnect without replaying SSE. */
  async function artifacts(input: RuntimeTokenInput & { runId: string; signal?: AbortSignal }): Promise<Artifact[]> {
    const { data } = await api.listArtifacts(input);
    if (!isJsonObject(data) || !Array.isArray(data.items)) {
      throw new QoniValidationError("artifact list response requires items");
    }
    return data.items.map((item) => {
      if (!isJsonObject(item) || typeof item.id !== "string" || !item.id) {
        throw new QoniValidationError("artifact requires a nonempty id");
      }
      const id = item.id;
      const artifact: Artifact = {
        id,
        name: typeof item.name === "string" ? item.name : undefined,
        mime: typeof item.mime_type === "string" ? item.mime_type : undefined,
        sizeBytes: typeof item.size_bytes === "number" ? item.size_bytes : undefined,
        createdAt: typeof item.created_at === "string" ? item.created_at : undefined,
        downloadUrl: typeof item.download_url === "string" ? item.download_url : undefined,
        expiresIn: typeof item.expires_in === "number" ? item.expires_in : undefined,
        content: async () => (await transport.webAgentBytes(
          `/do_anything/artifacts/${encodeURIComponent(id)}/blob`, input.token,
          { requiredScopes: ["webagent.do_anything:read"] },
        )).bytes,
        refreshDownloadUrl: async () => {
          const { data: link } = await api.artifactDownloadUrl({ token: input.token, artifactId: id });
          artifact.downloadUrl = link.download_url;
          artifact.expiresIn = link.expires_in;
          return link.download_url;
        },
      };
      return artifact;
    });
  }

  function buildOps(
    token: string | undefined,
    runId: string,
    capture: CaptureOptions | undefined,
  ): RunWireOps {
    return {
      listArtifacts: (signal) => artifacts({ token, runId, signal }),
      getDetail: async (signal) => asRecord((await api.getRun<unknown>({ token, runId, signal })).data),
      streamEvents: (opts) =>
        api.events({
          token,
          runId,
          lastEventId: opts.lastEventId,
          signal: opts.signal,
          onReconnect: opts.onReconnect,
          // Skip screenshot rows in backfill when the caller did not opt in.
          includeScreenshots: capture?.screenshots ? undefined : false,
        }),
      postAction: async (action, body) => {
        await transport.webAgentJson(
          (action.method || "POST") as QoniHttpMethod,
          action.endpoint,
          token,
          {
            ...(body !== undefined ? { body } : {}),
            requiredScopes: ["webagent.do_anything:manage"],
          },
        );
      },
      cancel: async (reason) =>
        asRecord(
          (
            await api.cancel<unknown>({
              token,
              runId,
              ...(reason === undefined ? {} : { reason }),
            })
          ).data,
        ),
    };
  }

  return {
    /** Start a run. Returns a handle — see `RunHandle` for the run lifecycle. */
    run: async (input: DoAnythingRunOptions): Promise<RunHandle<DoAnythingEvent>> => {
      const { token, prompt, capture, limits, session, ...rest } = input;
      if (!prompt || typeof prompt !== "string") {
        throw new QoniValidationError("doAnything.run requires a prompt string");
      }

      // Fail loudly on options the wire create body cannot carry — a silent
      // drop would let callers believe a knob took effect when it never
      // reached the backend.
      const unsupported: string[] = PLATFORM_DECIDED_RUN_OPTIONS.filter(
        (key) => rest[key] !== undefined,
      );
      if (unsupported.length > 0) {
        throw new QoniValidationError(
          `doAnything.run does not support ${unsupported.join(", ")} — the wire create body ` +
            "has no such field (the platform decides these server-side), so the value would " +
            "be silently dropped. Remove it from the call.",
        );
      }

      const created = await api.createRun<{ run_id?: string; id?: string; session_id?: string }>({
        token,
        instructions: prompt,
        ...rest,
        ...(session?.sessionId ? { sessionId: session.sessionId } : {}),
        ...(limits?.maxDurationMinutes !== undefined
          ? { maxDurationMinutes: limits.maxDurationMinutes }
          : {}),
      });
      const runId = created.data.run_id || created.data.id;
      if (!runId) {
        throw new QoniValidationError("doAnything run create did not return a run id");
      }
      const sessionId =
        typeof created.data.session_id === "string" && created.data.session_id
          ? created.data.session_id
          : session?.sessionId;

      return new RunHandle<DoAnythingEvent>(buildOps(token, runId, capture), {
        id: runId,
        sessionRef: sessionId ? { sessionId } : undefined,
        capture,
      });
    },

    /**
     * Reconnect to an existing run by id. Verifies the run exists before
     * returning; `sessionRef` is adopted from the run detail envelope when
     * not supplied.
     */
    attach: async (
      runId: string,
      opts: DoAnythingAttachOptions,
    ): Promise<RunHandle<DoAnythingEvent>> => {
      const sessionId = opts.session?.sessionId;
      const handle = new RunHandle<DoAnythingEvent>(buildOps(opts.token, runId, opts.capture), {
        id: runId,
        sessionRef: sessionId ? { sessionId } : undefined,
        capture: opts.capture,
      });
      await handle.status();
      return handle;
    },

    artifacts,
    api,
  };
}

// camelCase conveniences → the snake_case fields of the wire create body
// (CreateDoAnythingRunRequest). Keys already in wire shape pass through.
function normalizeDoAnythingRunInput(input: JsonObject): JsonObject {
  const body = renameKeys(input, {
    sessionId: "session_id",
    profileId: "profile_id",
    keepAlive: "keep_alive",
    allowedActions: "allowed_actions",
    maxDurationMinutes: "max_duration_minutes",
  });
  return body;
}

function normalizeDoAnythingInterveneInput(input: JsonObject): JsonObject {
  const body = renameKeys(input, { requestId: "input_request_id" });
  if (body.input_request_id !== undefined && body.kind === undefined) {
    body.kind = body.response === undefined ? "skip_input_request" : "answer_input_request";
  }
  return body;
}

// The run/task id on a WebAgent run event envelope (`event.data.task_id`) —
// used to tell a top-level run's events from its internal sub-runs.
function envelopeTaskId(event: QoniEvent): string | undefined {
  const env = event.data as { task_id?: unknown } | null | undefined;
  return env && typeof env === "object" && typeof env.task_id === "string"
    ? env.task_id
    : undefined;
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
