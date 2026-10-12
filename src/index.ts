export { buildAuthorization, buildSignature, buildStringToSign } from "./signature";
export { Qoni } from "./client";
export {
  QoniAuthError,
  QoniDelegationRequiredError,
  QoniError,
  QoniPermissionDeniedError,
  QoniRateLimitError,
  QoniTimeoutError,
  QoniTokenExpiredError,
  QoniUpstreamError,
  QoniValidationError,
} from "./errors";
export type { QoniErrorCode, QoniErrorOptions } from "./errors";
// `QoniEventTypes` (the curated `event.type` values) is exported from
// run-events.ts below. The raw 45-entry wire catalog (WireEventTypes) stays
// internal (events.ts) — it backs the wire→curated mapping + drift tests.
export { QoniProductScopes, QoniScopeBundles, QoniScopes } from "./scopes";
export type { QoniProduct } from "./scopes";
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
export { QoniEventTypes } from "./run-events";
export type {
  QoniEventType,
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
  RunBrowserLiveUrlChangedData,
  RunDoneData,
} from "./run-events";
// --- Interaction model (axis B) — the typed HITL surface (run.interaction). ---
// InteractionTypes / InteractionType are the curated five abstract types +
// wait; the wire's `clarification` is presented as `ask_user`.
export { InteractionHandle, InteractionTypes } from "./interactions";
export {
  InteractionStatuses,
  ActionKinds,
} from "./generated/interaction-types";
export type {
  InteractionStatus,
  ActionKind,
} from "./generated/interaction-types";
export type {
  InteractionType,
  Interaction,
  InteractionBase,
  TypedInteraction,
  Action,
  InteractionEvidence,
  InteractionSite,
  SiteLoginPayload,
  AskUserPayload,
  AskUserOption,
  AskUserAnswer,
  AskUserAnswerType,
  ClarificationPayload,
  ConfirmationPayload,
  TakeControlPayload,
  WaitPayload,
  WaitKind,
  InteractionPayloadByType,
  OpenLoginOptions,
  OpenLoginResult,
  ConfirmLoginOptions,
  ConfirmLoginResult,
  ControlSession,
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
  BrowserProxyOptions,
  BrowserbaseRegion,
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
  QoniEvent,
  QoniMeta,
  QoniOptions,
  QoniResponse,
  QoniProductName,
  QoniRuntimeConfig,
  QoniSSEEvent,
  InteractiveDelegationResponse,
  JsonObject,
  RawRequestInput,
  RuntimeTokenInput,
  TokenInput,
} from "./types";

export type { GenAuthManagementRequestOptions } from "./genauth-management";
export type * from "./generated/genauth-management-types";

export type * from './genauth-communication-types';
export type * from './generated/genauth-communication-types';
export type { GenAuthAgentMailClient, GenAuthAgentPhoneClient } from './genauth-communication';

export { PersonalAgentCreateError } from './genauth';
export type {
  CreateLoginUrlInput, ExchangeLoginCodeInput, LoginSession, LoginUrl, SignedInUser,
  AgentProvisioning, CreatePersonalAgentInput, CreatePersonalAgentPageInput,
  GetPersonalAgentInput, PersonalAgentProvisioning, PersonalAgentReady,
  BindPersonalAgentUserInput, PersonalAgentBinding,
} from './genauth';
