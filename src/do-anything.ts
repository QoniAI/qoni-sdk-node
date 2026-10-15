import { createSensitiveForms } from './sensitive-forms';
import {createGumemNamespace,type GumemRecallContextInput} from "./gumem";
import {validateMemoryContextInput,type MemoryContext} from "./memory-context";
import { QoniError, QoniTaskSubmissionUnknownError, QoniTimeoutError, QoniUnsupportedError, QoniValidationError, type QoniMemoryRunPhase } from "./errors";
import { memoryRunLifecycle } from "./memory-run-lifecycle";
import {
  RunHandle,
  type Artifact,
  type CaptureOptions,
  type RunWireOps,
  type SessionRef,
} from "./run-handle";
import type { DoAnythingEvent } from "./run-events";
import { interactionActionScopes } from "./interactions";
import { KNOWN_SCOPES, QoniScopes } from "./scopes";
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
 * @deprecated No backend source or endpoint exists for this historical shape.
 * Use qoni.doAnything.artifacts() for files and captured screenshot events for images.
 * A structured snapshot of the agent's state at a single step — not just an
 * image. The screenshot is one field (an inline reference/data), alongside the
 * metadata and extracted page state captured at that moment.
 */
export interface OrdinaryTaskProfile {
  values: Record<string,string|number|boolean>;
  missing: string[];
  writable_fields: string[];
  field_types: Record<string,'STRING'|'NUMBER'|'BOOLEAN'>;
}

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

/** @deprecated Historical snapshot image shape; not returned by the artifact file API. */
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

/** @deprecated Historical snapshot action shape; no backend source. */
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

/** 原始 /intervene 参数；其余 wire 字段继续直接透传。 */
export interface DoAnythingInterveneInput extends RuntimeTokenInput, JsonObject {
  runId: string;
  /**
   * 映射为 interaction_id，固定为本次接管轮次的 ID。
   * refresh/release 必须提供；已有活动接管的 take 也必须匹配。
   * 仅首次主动 take 可省略。缺失或旧 ID 由服务端返回 409，SDK 不查询新 ID 重试。
   */
  interactionId?: string;
  /** 原始 wire 别名；与 interactionId 同时提供时必须相同。 */
  interaction_id?: string;
}

/** 新 WA take/refresh 的原始响应；保留 wire 命名，调用者保存本轮 ID。 */
export interface DoAnythingControlResponse {
  interaction_id: string;
  standalone_control_url: string;
  control_token_expires_at?: string;
  status?: string;
}

export type BrowserbaseRegion =
  | "us-west-2"
  | "us-east-1"
  | "eu-central-1"
  | "ap-southeast-1";

export interface BrowserProxyOptions {
  /** Server-side proxy registry id. Credentials never enter the SDK call. */
  proxyId?: string;
  /** `off` uses datacenter egress; `all` proxies all requests; `scoped` uses admin patterns. */
  mode?: "off" | "all" | "scoped";
  /** Browserbase compute region. This is separate from the proxy's IP geography. */
  region?: BrowserbaseRegion;
}

export interface DoAnythingRunOptions {
  signal?: AbortSignal;
  /** Concrete Web Agent scopes requested for this task's original authority.
   * manage is always included; the default requests manage only. GenAuth checks
   * current authorization. Existing product tokens cannot gain authority here. */
  taskScopes?: readonly string[];
  /** Stable caller key for this acceptance. Reuse only with the identical payload.
   * Writes are never retried automatically; read api.getRequest after a lost receipt. */
  requestId?: string;
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
  /**
   * Model for this run: an `items[].value` from `api.listModels()`, e.g.
   * "openai/gpt-5.6-luna". Omit it to use the platform default.
   */
  model?: string;
  /** Applies when this run creates a new Browserbase session. */
  browserProxy?: BrowserProxyOptions;
  keepAlive?: boolean;
  allowedActions?: string[];
  skills?: string[];
  [key: string]: unknown;
}

export interface DoAnythingRunWithMemoryOptions extends DoAnythingRunOptions {
  memory: Omit<GumemRecallContextInput,"token"|"signal">;
  /** Overall recall + Task-start deadline; no automatic write retry. */
  timeoutMs?: number;
}
export interface DoAnythingMemoryRun {
  run: RunHandle<DoAnythingEvent>;
  memory: MemoryContext;
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

/** Original evidence only. This projection never authorizes an action. */
export interface DoAnythingTrace {
  run_id: string;
  session_id: string;
  project_id: string;
  owner_user_id: string;
  run_state: "pending" | "running" | "waiting" | "done" | "failed" | "canceled" | "expired" | "unknown";
  cancel_requested: boolean;
  created_at: string | null;
  ended_at: string | null;
  run_result: "available" | "pending" | "unavailable";
  /** Known requires original approval, bound operation result and original finish ACK. */
  external_result: "unknown" | "pending" | "known";
  /** False only when every tracked original operation has a definitive bound result and finish ACK. */
  reconciliation_required: boolean;
  authorization: {
    state: "recorded" | "missing" | "unavailable";
    business_app_id: string | null;
    agent_id: string | null;
    grant_id: string | null;
    consent_id: string | null;
    consent_epoch: string | null;
    basis: string | null;
  };
  confirmations: Array<{
    interaction_id: string;
    state: string;
    deadline: string | null;
    /** Bare events retain null; only validated server reply/resource binding supplies these. */
    action_digest: string | null;
    operation_id: string | null;
    evidence_kind: "confirmation_card";
    /** Omitted without a trusted, validated reply; a trace never grants approval. */
    approval?: {
      action_id: string;
      action_type: string;
      state: "approved" | "rejected" | "claimed" | "unknown" | "succeeded" | "failed" |
        "not_dispatched" | "withdrawn" | "expired" | "canceled";
      approved_by: { user_id: string; business_app_id: string };
      /** Original fixed epoch milliseconds. */
      expires_at: number;
      claimed_at: number | null;
      evidence_kind: "server_reply";
    };
  }>;
  confirmations_truncated: boolean;
  /** Read-only safe original associations; never mail content or execution authority. */
  operations: Array<{
    action_id: string;
    interaction_id: string;
    action_type: string;
    intent_digest: string;
    /** Original fixed epoch milliseconds. */
    expires_at: number;
    operation_id: string | null;
    state: "pending" | "succeeded" | "failed" | "unknown" | "unavailable";
    resource_state: "accepted" | "pending" | "running" | "succeeded" | "completed" | "failed" | "unknown" | null;
    publication_stop: "finished" | "unknown" | "not_recorded";
    stopped: boolean | null;
    no_effect: boolean | null;
    evidence_kind: "resource_operation" | "approval_only";
    association_state: "recorded" | "unavailable";
    /** Server projects only present, verified original fields; missing/empty binding is null. */
    resource_binding: {
      owner_user_id?: string | null;
      business_app_id?: string | null;
      agent_id?: string | null;
      persona_id?: string | null;
      resource_id?: string | null;
    } | null;
  }>;
  operations_state: "unavailable" | "available" | "partial";
}

// Options the wire create body has no field for — either platform-decided
// server-side (cost ceiling via the internal budget guard, browser egress via
// dynconfig) or retired phantom knobs the backend never consumed and now 422s
// (extra="forbid"). Sending them would be a silent drop or a wire error, so
// `run()` fails loudly up front (contract §4). `model` is a real create field;
// the server canonicalizes it and falls back to `llm.default_model`.
const PLATFORM_DECIDED_RUN_OPTIONS = [
  "proxyCountryCode",
  "callbackUrl",
  "workspaceId",
  "outputSchema",
  "cacheScript",
] as const;

const BROWSERBASE_REGIONS = new Set<BrowserbaseRegion>([
  "us-west-2",
  "us-east-1",
  "eu-central-1",
  "ap-southeast-1",
]);

function validateBrowserProxyOptions(value: unknown): void {
  if (value === undefined) return;
  if (!isJsonObject(value)) {
    throw new QoniValidationError("browserProxy must be an object");
  }
  const allowed = new Set(["proxyId", "mode", "region"]);
  const extras = Object.keys(value).filter((key) => !allowed.has(key));
  if (extras.length > 0) {
    throw new QoniValidationError(
      `browserProxy does not accept ${extras.join(", ")} — credentials stay server-side`,
    );
  }
  if (
    value.proxyId !== undefined &&
    (typeof value.proxyId !== "string" ||
      !/^[a-z0-9][a-z0-9._-]{0,63}$/.test(value.proxyId))
  ) {
    throw new QoniValidationError("browserProxy.proxyId is invalid");
  }
  if (
    value.mode !== undefined &&
    !["off", "all", "scoped"].includes(String(value.mode))
  ) {
    throw new QoniValidationError("browserProxy.mode must be off, all, or scoped");
  }
  if (
    value.region !== undefined &&
    (typeof value.region !== "string" ||
      !BROWSERBASE_REGIONS.has(value.region as BrowserbaseRegion))
  ) {
    throw new QoniValidationError("browserProxy.region is not supported");
  }
}

export function createDoAnythingNamespace(transport: QoniTransport) {
  const forms=createSensitiveForms(transport);
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
    createRun: async <T = unknown>(input: RuntimeTokenInput & JsonObject & {signal?:AbortSignal; taskScopes?:readonly string[]}): Promise<QoniResponse<T>> =>
      transport.webAgentJson("POST", "/do_anything/runs", input.token, {
        body: normalizeDoAnythingRunInput(omit(input, "token", "signal", "taskScopes")),
        signal: input.signal,
        requiredScopes: taskCreationScopes(input),
      }),

    /** A missing receipt is not evidence that submission never reached the server. */
    getRequest: <T = unknown>(input: RuntimeTokenInput & {requestId: string; sessionId?: string; signal?: AbortSignal}): Promise<QoniResponse<T>> =>
      transport.webAgentJson("GET", `/do_anything/requests/${encodeURIComponent(input.requestId)}`, input.token, {
        query: input.sessionId === undefined ? undefined : {session_id: input.sessionId},
        signal: input.signal, requiredScopes: ["webagent.do_anything:read"],
      }),

    getTrace: (input: RuntimeTokenInput & {runId: string; signal?: AbortSignal}): Promise<QoniResponse<DoAnythingTrace>> =>
      transport.webAgentJson("GET", `/do_anything/runs/${encodeURIComponent(input.runId)}/trace`, input.token, {
        signal: input.signal, requiredScopes: ["webagent.do_anything:read"],
      }),

    /** `GET /do_anything/models` — `{ default_model, items: [{ value, label }] }`, the models a run may name. */
    listModels: <T = unknown>(
      input: RuntimeTokenInput & { signal?: AbortSignal },
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson("GET", "/do_anything/models", input.token, {
        signal: input.signal,
        requiredScopes: ["webagent.do_anything:read"],
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

    intervene: async <T = unknown>(
      input: DoAnythingInterveneInput,
    ): Promise<QoniResponse<T>> =>
      transport.webAgentJson(
        "POST",
        `/do_anything/runs/${encodeURIComponent(input.runId)}/intervene`,
        input.token,
        {
          body: normalizeDoAnythingInterveneInput(omit(input, "token", "runId")),
          requiredScopes: [
            input.kind === "take_control" || input.kind === "refresh_control_url" || input.kind === "release_control"
              ? QoniScopes.BROWSER_USE_TAKE_CONTROL
              : QoniScopes.DO_ANYTHING_MANAGE,
          ],
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

    /**
     * @deprecated No backend snapshot read route exists. Fails locally with zero HTTP.
     * Use qoni.doAnything.artifacts()/api.listArtifacts for files, or enable capture.screenshots
     * and consume screenshot events for images. Files are not structured snapshots.
     */
    readArtifacts: async <T = DoAnythingSnapshot>(
      _input: RuntimeTokenInput & { sessionId: string; artifactId: string },
    ): Promise<QoniResponse<T>> => {
      throw new QoniUnsupportedError("doAnything.api.readArtifacts has no backend snapshot endpoint. Use qoni.doAnything.artifacts()/api.listArtifacts for files, or capture.screenshots and screenshot events for images.");
    },

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
      taskLoginRunId: runId,
      submitSensitive: (interaction, values, options) => {
        if(!token) throw new QoniValidationError("Original user token required for protected input");
        return forms.submit({token,runId,interaction,values,...options});
      },
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
      postAction: async (action, body, options) =>
        (
          await transport.webAgentJson(
            (action.method || "POST") as QoniHttpMethod,
            action.endpoint,
            token,
            {
              ...(body !== undefined ? { body } : {}),
              requiredScopes: options?.requiredScopes ?? interactionActionScopes(action, "webagent.do_anything:manage"),
            },
          )
        ).data,
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

  const namespace = {
    /** The immutable formal Agent's own bound mailbox; server checks original Task authority. */
    mail: {
      list: (input: {runId:string;token:string;after?:number;limit?:number}) =>
        transport.webAgentJson<TaskMailList>('POST',`/do_anything/runs/${encodeURIComponent(input.runId)}/mail/read`,input.token,
          {body:{mail_action:'list',...(input.after!==undefined?{after_ms:input.after}:{}),...(input.limit!==undefined?{limit:input.limit}:{})},requiredScopes:[QoniScopes.DO_ANYTHING_READ]}),
      message: (input: {runId:string;token:string;messageId:string}) =>
        transport.webAgentJson<TaskMailMessage>('POST',`/do_anything/runs/${encodeURIComponent(input.runId)}/mail/read`,input.token,
          {body:{mail_action:'message',message_id:input.messageId},requiredScopes:[QoniScopes.DO_ANYTHING_READ]}),
      codes: (input: {runId:string;token:string;messageId:string;after:number;fromAddress:string;pattern:string;subjectContains?:string}) =>
        transport.webAgentJson<TaskMailCode>('POST',`/do_anything/runs/${encodeURIComponent(input.runId)}/mail/read`,input.token,
          {body:{mail_action:'codes',message_id:input.messageId,after_ms:input.after,from_address:input.fromAddress,code_pattern:input.pattern,...(input.subjectContains!==undefined?{subject_contains:input.subjectContains}:{})},requiredScopes:[QoniScopes.DO_ANYTHING_READ]}),
      /** Prepare the exact encrypted message and its original-person approval card. This returns pending approval, not send completion; never retries. */
      send: (input: {runId:string;token:string;to:string;subject:string;text:string}) =>
        transport.webAgentJson<TaskMailSend>('POST',`/do_anything/runs/${encodeURIComponent(input.runId)}/mail/send`,input.token,
          {body:{to:input.to,subject:input.subject,text:input.text},requiredScopes:[QoniScopes.DO_ANYTHING_MANAGE]}),
    },
    forms,
    /** Ordinary profile of this Task's original person. Current caller cannot replace its source. */
    profile: {
      read: (input: {runId: string; token: string; fields: string[]}) =>
        transport.webAgentJson<OrdinaryTaskProfile>('POST', `/do_anything/runs/${encodeURIComponent(input.runId)}/profile/read`,
          input.token, {body:{fields: input.fields},requiredScopes:[QoniScopes.DO_ANYTHING_READ]}),
      update: (input: {runId: string; token: string; values: Record<string, string | number | boolean>}) =>
        transport.webAgentJson<OrdinaryTaskProfile>('POST', `/do_anything/runs/${encodeURIComponent(input.runId)}/profile/update`,
          input.token, {body:{values: input.values},requiredScopes:[QoniScopes.DO_ANYTHING_MANAGE]}),
    },
    /** Start a run. Returns a handle — see `RunHandle` for the run lifecycle. */
    run: async (input: DoAnythingRunOptions): Promise<RunHandle<DoAnythingEvent>> => {
      const { token, prompt, capture, limits, session, signal, ...rest } = input;
      signal?.throwIfAborted();
      if (!prompt || typeof prompt !== "string") {
        throw new QoniValidationError("doAnything.run requires a prompt string");
      }
      validateBrowserProxyOptions(rest.browserProxy);

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
        signal,
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
  return {...namespace,
    runWithMemory: async (input:DoAnythingRunWithMemoryOptions):Promise<DoAnythingMemoryRun> => {
      let phase: QoniMemoryRunPhase = "recall";
      let dispatched = false;
      let rejected = false;
      const {memory,signal,timeoutMs=30_000,...runInput}=input;
      const ctl = new AbortController();
      const cancel = () => ctl.abort(signal?.reason);
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        if (!memory || Object.hasOwn(memory,"token") || Object.hasOwn(memory,"signal"))
          throw new QoniValidationError("Memory uses the original run delegation source");
        validateMemoryContextInput(memory);
        if (typeof runInput.prompt!=="string" || !runInput.prompt || typeof runInput.token!=="string" || !runInput.token ||
            runInput.prompt.includes(runInput.token) || !Number.isSafeInteger(timeoutMs) || timeoutMs<1 || timeoutMs>60_000)
          throw new QoniValidationError("Memory run requires a prompt, original token and 1..60000ms timeout");
        if (PLATFORM_DECIDED_RUN_OPTIONS.some(key=>runInput[key]!==undefined))
          throw new QoniValidationError("Memory run contains platform-decided options");
        validateBrowserProxyOptions(runInput.browserProxy);
        taskCreationScopes(runInput);
        signal?.throwIfAborted();
        signal?.addEventListener("abort",cancel,{once:true});
        timer=setTimeout(()=>ctl.abort(new QoniTimeoutError("Memory run deadline exceeded",{retryable:false})),timeoutMs);
        const recalled=await createGumemNamespace(transport).recallContext({...memory,token:runInput.token,signal:ctl.signal});
        ctl.signal.throwIfAborted();
        const prompt=recalled.data.referenceText ? runInput.prompt+"\n\n"+recalled.data.referenceText : runInput.prompt;
        phase = "task_permission";
        // Reuse run's validation, wire body and handle. Only this call's Task POST
        // carries the private observer; later handle operations and ordinary run do not.
        const scopedTransport: QoniTransport = {
          ...transport,
          webAgentJson: (method, path, token, payload) => transport.webAgentJson(method, path, token,
            method === "POST" && path === "/do_anything/runs" ? {
              ...payload,
              [memoryRunLifecycle]: {
                onDispatch: () => { dispatched = true; phase = "task_submit"; },
                onRejected: (httpStatus) => {
                  // An HTTP 5xx may follow an upstream commit. Only 4xx or a
                  // parsed rejection envelope over successful HTTP is definitive.
                  rejected = (httpStatus >= 400 && httpStatus < 500) ||
                    (httpStatus >= 200 && httpStatus < 300);
                },
              },
            } : payload),
        };
        const run=await createDoAnythingNamespace(scopedTransport).run({...runInput,prompt,signal:ctl.signal} as DoAnythingRunOptions);
        return {run,memory:recalled.data};
      } catch (error) {
        if (dispatched && !rejected) throw new QoniTaskSubmissionUnknownError();
        // An AbortSignal reason may be an arbitrary caller object, including secrets.
        const failure = signal?.aborted && !rejected
          ? new QoniError("Memory run aborted", {code:"request.aborted",retryable:false})
          : error instanceof QoniError ? error
          : new QoniError("Memory run failed", {retryable:false});
        if (failure.status === undefined) {
          delete (failure as Error & {cause?: unknown}).cause;
        }
        Object.assign(failure, {phase, submissionUnknown:false});
        throw failure;
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort",cancel);
      }
    },
  };
}

// Additional task authority must be explicit and re-enter the normal exchange.
function taskCreationScopes(input: JsonObject): string[] {
  if (Object.hasOwn(input, "task_scopes")) {
    throw new QoniValidationError("Use taskScopes, not task_scopes; task authority is requested through token exchange");
  }
  const value = input.taskScopes;
  const scopes = new Set<string>([QoniScopes.DO_ANYTHING_MANAGE]);
  if (value === undefined) return [...scopes];
  if (!Array.isArray(value) || value.length > 128) {
    throw new QoniValidationError("taskScopes must be an array of concrete Web Agent scopes (at most 128)");
  }
  for (let i = 0; i < value.length; i++) {
    const scope: unknown = value[i];
    if (!Object.hasOwn(value, i) || typeof scope !== "string" || scope.length > 256 ||
        !scope.startsWith("webagent.") || !KNOWN_SCOPES.includes(scope)) {
      throw new QoniValidationError("taskScopes accepts known concrete webagent.* scopes; wildcards and other products are not supported");
    }
    scopes.add(scope);
  }
  if (scopes.size > 128) throw new QoniValidationError("taskScopes including manage must contain at most 128 scopes");
  return [...scopes].sort();
}

// camelCase conveniences → the snake_case fields of the wire create body
// (CreateDoAnythingRunRequest). Keys already in wire shape pass through.
function normalizeDoAnythingRunInput(input: JsonObject): JsonObject {
  for (const key of ["requestId", "request_id"] as const) {
    if (input[key] !== undefined && (typeof input[key] !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input[key] as string))) {
      throw new QoniValidationError(`${key} must be a stable 1-128 character identifier`);
    }
  }
  if (input.requestId !== undefined && input.request_id !== undefined && input.requestId !== input.request_id) {
    throw new QoniValidationError("requestId and request_id must match");
  }
  const body = renameKeys(input, {
    requestId: "request_id",
    sessionId: "session_id",
    profileId: "profile_id",
    keepAlive: "keep_alive",
    allowedActions: "allowed_actions",
    maxDurationMinutes: "max_duration_minutes",
    browserProxy: "browser_proxy",
  });
  const browserProxy = body.browser_proxy;
  if (isJsonObject(browserProxy)) {
    body.browser_proxy = renameKeys(browserProxy, { proxyId: "proxy_id" });
  }
  return body;
}

function normalizeDoAnythingInterveneInput(input: JsonObject): JsonObject {
  for (const alias of ["interactionId", "interaction_id"] as const) {
    const value = input[alias];
    if (value !== undefined && (typeof value !== "string" || value.length === 0)) {
      throw new QoniValidationError(`${alias} 必须是非空字符串`);
    }
  }
  if (input.interactionId !== undefined && input.interaction_id !== undefined &&
    input.interactionId !== input.interaction_id) {
    throw new QoniValidationError("interactionId 与 interaction_id 必须相同，不能覆盖接管轮次 ID");
  }
  const body = renameKeys(input, { requestId: "input_request_id", interactionId: "interaction_id" });
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

export interface TaskMailBase {agentId:string;mailbox:{mailboxId:string;address:string};}
export interface TaskMailList extends TaskMailBase {items:Array<{messageId:string;subject:string|null;contentStatus:string;[key:string]:unknown}>;}
export interface TaskMailMessage extends TaskMailBase {message:{messageId:string;subject:string|null;text:string|null;[key:string]:unknown};}
export interface TaskMailCode extends TaskMailBase {messageId:string;state:'matched'|'ambiguous'|'unavailable';code?:string;}
export interface TaskMailSend {action_id:string;interaction_id:string;intent_digest:string;expires_at:number;state:"pending_approval"|"approved"|"claimed"|"succeeded"|"unknown"|"failed"|"not_dispatched"|"expired"|"canceled"|"superseded"|"withdrawn";outcome?:Record<string,unknown>;draftRef:string;intent:Record<string,unknown>;}
