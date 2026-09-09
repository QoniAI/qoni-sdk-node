import { QoniValidationError } from "./errors";
import {
  RunHandle,
  type Artifact,
  type CaptureOptions,
  type RunWireOps,
  type SessionRef,
} from "./run-handle";
import type { DeepResearchEvent } from "./run-events";
import type { RunLimits } from "./do-anything";
import {
  isJsonObject,
  type QoniEvent,
  type QoniHttpMethod,
  type QoniResponse,
  type QoniTransport,
  type JsonObject,
  type RuntimeTokenInput,
} from "./types";

export interface DeepResearchRunOptions {
  /** Delegation token — passed once here; the returned handle holds it. */
  token: string;
  /** The research topic. */
  prompt: string;
  capture?: CaptureOptions;
  limits?: RunLimits;
  /**
   * Reuse an existing research session — a follow-up run that inherits the
   * prior run's context. Pass `prior.sessionRef`.
   */
  session?: SessionRef;
  // Product-specific options stay camelCase.
  depth?: "light" | "standard" | "deep";
  outputFormat?: string;
  targetAudience?: string;
  domainWhitelist?: string[];
  domainBlacklist?: string[];
  [key: string]: unknown;
}

export interface DeepResearchAttachOptions {
  token: string;
  capture?: CaptureOptions;
}

/**
 * DeepResearch capability namespace — runs are created with a research
 * `topic`, gated by an optional HITL outline approval, then stream events
 * until a cited report is produced. Mirrors the backend contract at
 * `/api/v1/projects/{tenant}/deep_research/...`.
 */
export function createDeepResearchNamespace(transport: QoniTransport) {
  /**
   * Wire-level escape hatch — 1:1 with the backend HTTP contract. Shapes
   * here may evolve with the API and are not covered by the frozen public
   * contract. `followUp` (terminal-run messages) and `feedback` (report
   * rating) live only here.
   */
  const api = {
    run: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
      transport.webAgentJson("POST", "/deep_research/runs", input.token, {
        body: normalizeDeepResearchRunInput(omit(input, "token")),
        requiredScopes: ["webagent.deep_research:manage"],
      }),

    get: <T = unknown>(input: RuntimeTokenInput & { runId: string; signal?: AbortSignal }): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/deep_research/runs/${encodeURIComponent(input.runId)}`,
        input.token,
        {
          signal: input.signal,
          requiredScopes: ["webagent.deep_research:read"],
        },
      ),

    events: <T = unknown>(
      input: RuntimeTokenInput & {
        runId: string;
        lastEventId?: string;
        signal?: AbortSignal;
        onReconnect?: (info: { attempt: number; lastEventId?: string; error: unknown }) => void;
      },
    ): AsyncIterable<QoniEvent<T>> =>
      transport.webAgentSSE(
        `/deep_research/runs/${encodeURIComponent(input.runId)}/events`,
        input.token,
        {
          lastEventId: input.lastEventId,
          requiredScopes: ["webagent.deep_research:read"],
          signal: input.signal,
          onReconnect: input.onReconnect,
        },
      ),

    followUp: <T = unknown>(
      input: RuntimeTokenInput & { runId: string; text: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/deep_research/runs/${encodeURIComponent(input.runId)}/messages`,
        input.token,
        {
          body: omit(input, "token", "runId"),
          requiredScopes: ["webagent.deep_research:manage"],
        },
      ),

    cancel: <T = unknown>(
      input: RuntimeTokenInput & { runId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/deep_research/runs/${encodeURIComponent(input.runId)}/cancel`,
        input.token,
        {
          body: {},
          requiredScopes: ["webagent.deep_research:manage"],
        },
      ),

    feedback: <T = unknown>(
      input: RuntimeTokenInput & { runId: string } & JsonObject,
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/deep_research/runs/${encodeURIComponent(input.runId)}/feedback`,
        input.token,
        {
          body: renameKeys(omit(input, "token", "runId"), { feedbackText: "feedback_text" }),
          requiredScopes: ["webagent.deep_research:manage"],
        },
      ),

    listArtifacts: <T = unknown>(
      input: RuntimeTokenInput & { runId: string; signal?: AbortSignal },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/deep_research/runs/${encodeURIComponent(input.runId)}/artifacts`,
        input.token,
        {
          signal: input.signal,
          requiredScopes: ["webagent.deep_research:read"],
        },
      ),

    getArtifact: <T = unknown>(
      input: RuntimeTokenInput & { runId: string; artifactId: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/deep_research/runs/${encodeURIComponent(input.runId)}/artifacts/${encodeURIComponent(input.artifactId)}`,
        input.token,
        {
          requiredScopes: ["webagent.deep_research:read"],
        },
      ),
  };

  function buildOps(token: string | undefined, runId: string): RunWireOps {
    return {
      getDetail: async (signal) => asRecord((await api.get<unknown>({ token, runId, signal })).data),
      streamEvents: (opts) =>
        api.events({
          token,
          runId,
          lastEventId: opts.lastEventId,
          signal: opts.signal,
          onReconnect: opts.onReconnect,
        }),
      postAction: async (action, body) => {
        await transport.webAgentJson(
          (action.method || "POST") as QoniHttpMethod,
          action.endpoint,
          token,
          {
            ...(body !== undefined ? { body } : {}),
            requiredScopes: ["webagent.deep_research:manage"],
          },
        );
      },
      cancel: async () => asRecord((await api.cancel<unknown>({ token, runId })).data),
      listArtifacts: async (signal) => {
        const res = await api.listArtifacts<{ items?: unknown }>({ token, runId, signal });
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        return items.filter(isJsonObject).map((item) => toArtifact(item, token, runId));
      },
    };
  }

  function toArtifact(item: JsonObject, token: string | undefined, runId: string): Artifact {
    const id = typeof item.id === "string" ? item.id : "";
    return {
      id,
      name: typeof item.name === "string" && item.name ? item.name : undefined,
      mime: typeof item.mime_type === "string" ? item.mime_type : undefined,
      sizeBytes: typeof item.size_bytes === "number" ? item.size_bytes : undefined,
      createdAt: typeof item.created_at === "string" ? item.created_at : undefined,
      content: async () =>
        (
          await transport.webAgentBytes(
            `/deep_research/runs/${encodeURIComponent(runId)}/artifacts/${encodeURIComponent(id)}`,
            token,
            { requiredScopes: ["webagent.deep_research:read"] },
          )
        ).bytes,
    };
  }

  return {
    /**
     * Start a research run. Pass `session: prior.sessionRef` to start a
     * follow-up run that inherits the prior run's context.
     */
    run: async (input: DeepResearchRunOptions): Promise<RunHandle<DeepResearchEvent>> => {
      const { token, prompt, capture, limits, session, ...rest } = input;
      if (!prompt) {
        throw new QoniValidationError("deepResearch.run requires a prompt");
      }

      const run = await api.run<{ run_id?: string; id?: string }>({
        token,
        topic: prompt,
        ...rest,
        ...(limits?.maxDurationMinutes !== undefined
          ? { maxDurationMinutes: limits.maxDurationMinutes }
          : {}),
        ...(session ? { session_id: session.sessionId } : {}),
      });
      const runId = run.data.run_id || run.data.id;
      if (!runId) {
        throw new QoniValidationError("deepResearch run create did not return a run id");
      }
      return new RunHandle<DeepResearchEvent>(buildOps(token, runId), {
        id: runId,
        sessionRef: session,
        capture,
      });
    },

    /** Reconnect to an existing run. Verifies the run exists before returning. */
    attach: async (
      runId: string,
      opts: DeepResearchAttachOptions,
    ): Promise<RunHandle<DeepResearchEvent>> => {
      const handle = new RunHandle<DeepResearchEvent>(buildOps(opts.token, runId), {
        id: runId,
        capture: opts.capture,
      });
      await handle.status();
      return handle;
    },

    api,
  };
}

function normalizeDeepResearchRunInput(input: JsonObject): JsonObject {
  return renameKeys(input, {
    outputFormat: "output_format",
    targetAudience: "target_audience",
    maxDurationMinutes: "max_duration_minutes",
    callbackUrl: "callback_url",
    domainWhitelist: "domain_whitelist",
    domainBlacklist: "domain_blacklist",
  });
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
