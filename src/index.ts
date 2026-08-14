export { buildAuthorization, buildSignature, buildStringToSign } from "./signature";
export { EAK, EazoAgentKit } from "./client";
export {
  EAKAuthError,
  EAKDelegationRequiredError,
  EAKError,
  EAKPermissionDeniedError,
  EAKRateLimitError,
  EAKTimeoutError,
  EAKTokenExpiredError,
  EAKUpstreamError,
  EAKValidationError,
} from "./errors";
export type { EAKErrorCode, EAKErrorOptions } from "./errors";
// `EAKEventTypes` (the curated `event.type` values) is exported from
// run-events.ts below. The raw 45-entry wire catalog (WireEventTypes) stays
// internal (events.ts) — it backs the wire→curated mapping + drift tests.
export { EAKProductScopes, EAKScopeBundles, EAKScopes } from "./scopes";
export type { EAKProduct } from "./scopes";
export { RunHandle } from "./run-handle";
export type {
  Artifact,
  CaptureOptions,
  RunEventsOptions,
  RunReconnectInfo,
  RunResult,
  RunStatus,
  RunWaitOptions,
  SessionRef,
} from "./run-handle";
export { EAKEventTypes } from "./run-events";
export type {
  EAKEventType,
  RunEvent,
  RunImage,
  // Per-product event types (分型) — each product handle is typed to these.
  CoreRunEvent,
  DoAnythingEvent,
  WebSearchEvent,
  DeepResearchEvent,
  MonitorEvent,
  // Rich-event `event.data` object shapes (simple events' data is a scalar).
  RunMessageData,
  RunScreenshotData,
  RunDoneData,
} from "./run-events";
// --- Interaction model (axis B) — the typed HITL surface (run.interaction). ---
export { InteractionHandle } from "./interactions";
export {
  InteractionTypes,
  InteractionStatuses,
  ActionKinds,
} from "./generated/interaction-types";
export type {
  InteractionType,
  InteractionStatus,
  ActionKind,
} from "./generated/interaction-types";
export type {
  Interaction,
  Action,
  InteractionEvidence,
  InteractionSite,
  SiteLoginPayload,
  ClarificationPayload,
  ConfirmationPayload,
  TakeControlPayload,
  WaitPayload,
  WaitKind,
  InteractionPayloadByType,
} from "./interactions";
export { MonitorHandle } from "./track";
export type {
  MonitorEventsOptions,
  MonitorRunsOptions,
  TrackAttachOptions,
  TrackCreateOptions,
} from "./track";
export type {
  DoAnythingAttachOptions,
  DoAnythingRunOptions,
  DoAnythingSnapshot,
  RunLimits,
  SnapshotImage,
  SnapshotAction,
} from "./do-anything";
export type { WebSearchAttachOptions, WebSearchRunOptions } from "./web-search";
export type { DeepResearchAttachOptions, DeepResearchRunOptions } from "./deep-research";
export type {
  GenAuthAccessTokenInput,
  GenAuthAdminToken,
  GenAuthAdminTokenOverrideInput,
  GenAuthDelegationIntrospectionInput,
  GenAuthUserCreateBatchInput,
  GenAuthUserCreateInput,
  GenAuthUserDeleteBatchInput,
  GenAuthUserGetBatchInput,
  GenAuthUserGetInput,
  GenAuthUserListInput,
  GenAuthUserUpdateInput,
} from "./genauth";
export type {
  CompleteDelegateAgentInput,
  CompleteDelegateTokenInput,
  DelegateAgentInput,
  DelegateAgentResponse,
  DelegateAgentTokenResponse,
  DelegateTokenInteractiveInput,
  DelegateTokenInput,
  DelegateTokenResponse,
  DelegateTokenResult,
  DelegateTokenSilentInput,
  DelegateTokenSilentResponse,
  DelegationMode,
  DelegationTokenResponse,
  EAKEvent,
  EAKMeta,
  EAKOptions,
  EAKResponse,
  EAKProductName,
  EAKRuntimeConfig,
  EAKSSEEvent,
  InteractiveDelegationResponse,
  JsonObject,
  RawRequestInput,
  RuntimeTokenInput,
  TokenInput,
} from "./types";
