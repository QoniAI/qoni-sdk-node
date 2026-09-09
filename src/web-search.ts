import { QoniError, QoniValidationError } from "./errors";
import {
  RunHandle,
  type CaptureOptions,
  type RunWireOps,
  type SessionRef,
} from "./run-handle";
import type { WebSearchEvent } from "./run-events";
import type { RunLimits } from "./do-anything";
import {
  isJsonObject,
  type QoniEvent,
  type QoniResponse,
  type QoniTransport,
  type JsonObject,
  type RuntimeTokenInput,
} from "./types";

export interface WebSearchRunOptions {
  /** Delegation token — passed once here; the returned handle holds it. */
  token: string;
  /** What to search for — one query, or several for a multi-query search. */
  prompt: string | string[];
  capture?: CaptureOptions;
  /** Not supported by webSearch yet — passing it throws locally. */
  limits?: RunLimits;
  /** Not supported by webSearch — searches don't run in reusable sessions. */
  session?: SessionRef;
  // Product-specific options stay camelCase.
  maxResultsPerQuery?: number;
  siteWhitelist?: string[];
  siteBlacklist?: string[];
  [key: string]: unknown;
}

export interface WebSearchAttachOptions {
  token: string;
  capture?: CaptureOptions;
}

export function createWebSearchNamespace(transport: QoniTransport) {
  /**
   * Wire-level escape hatch — 1:1 with the backend HTTP contract. Shapes
   * here may evolve with the API and are not covered by the frozen public
   * contract.
   */
  const api = {
    run: <T = unknown>(input: RuntimeTokenInput & JsonObject): Promise<QoniResponse<T>> =>
      transport.webAgentJson("POST", "/web_search/runs", input.token, {
        body: normalizeWebSearchRunInput(omit(input, "token")),
        requiredScopes: ["webagent.web_search:manage"],
      }),

    get: <T = unknown>(input: RuntimeTokenInput & { runId: string; signal?: AbortSignal }): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "GET",
        `/web_search/runs/${encodeURIComponent(input.runId)}`,
        input.token,
        {
          signal: input.signal,
          requiredScopes: ["webagent.web_search:read"],
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
        `/web_search/runs/${encodeURIComponent(input.runId)}/events`,
        input.token,
        {
          lastEventId: input.lastEventId,
          requiredScopes: ["webagent.web_search:read"],
          signal: input.signal,
          onReconnect: input.onReconnect,
        },
      ),

    cancel: <T = unknown>(
      input: RuntimeTokenInput & { runId: string; reason?: string },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/web_search/runs/${encodeURIComponent(input.runId)}/cancel`,
        input.token,
        {
          body: omit(input, "token", "runId"),
          requiredScopes: ["webagent.web_search:manage"],
        },
      ),
  };

  function buildOps(
    token: string | undefined,
    runId: string,
  ): RunWireOps {
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
      postAction: async () => {
        // webSearch runs never emit interactions; failing loudly beats a
        // confusing 404.
        throw new QoniError(
          "webSearch runs never request interaction — there is no action to invoke",
          { code: "validation.failed" },
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
    /** Start a search run. Returns a handle — see `RunHandle` for the run lifecycle. */
    run: async (input: WebSearchRunOptions): Promise<RunHandle<WebSearchEvent>> => {
      const { token, prompt, capture, limits, session, ...rest } = input;
      if (session) {
        throw new QoniValidationError(
          "webSearch runs do not execute in reusable sessions — drop the session option",
        );
      }
      if (limits) {
        throw new QoniValidationError(
          "webSearch does not support limits yet — drop the limits option",
        );
      }
      const resolvedQueries = Array.isArray(prompt) ? prompt : prompt ? [prompt] : undefined;
      if (!resolvedQueries || resolvedQueries.length === 0) {
        throw new QoniValidationError("webSearch.run requires a prompt");
      }

      const run = await api.run<{ run_id?: string; id?: string }>({
        token,
        queries: resolvedQueries,
        ...rest,
      });
      const runId = run.data.run_id || run.data.id;
      if (!runId) {
        throw new QoniValidationError("webSearch run create did not return a run id");
      }
      return new RunHandle<WebSearchEvent>(buildOps(token, runId), { id: runId, capture });
    },

    /** Reconnect to an existing run. Verifies the run exists before returning. */
    attach: async (
      runId: string,
      opts: WebSearchAttachOptions,
    ): Promise<RunHandle<WebSearchEvent>> => {
      const handle = new RunHandle<WebSearchEvent>(buildOps(opts.token, runId), {
        id: runId,
        capture: opts.capture,
      });
      await handle.status();
      return handle;
    },

    api,
  };
}

function normalizeWebSearchRunInput(input: JsonObject): JsonObject {
  const body = renameKeys(input, {
    maxResultsPerQuery: "max_results_per_query",
    siteWhitelist: "site_whitelist",
    siteBlacklist: "site_blacklist",
  });
  return body;
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
