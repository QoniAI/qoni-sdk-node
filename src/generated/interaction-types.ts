// AUTO-GENERATED — do not edit by hand.
// Source: src/generated/event-catalog.json (vendored from the backend's
// domain.event.types, catalog v2). Regenerate with `pnpm gen:event-types`
// after re-syncing the catalog. Drift is guarded by tests/event-catalog.test.ts
// (SDK side) and the webagent-e2e contract suite (vs the live backend enums).
//
// These are the interaction discriminators (run.interaction): the `type`,
// `status`, and action `kind` enums. The curated Interaction surface
// (src/interactions.ts) builds its typed union on top of these.

/**
 * The interaction `type` discriminator — the single field a consumer
 * switches on to pick a card / typed handle.
 */
export const InteractionTypes = {
  SiteLogin: "site_login",
  Clarification: "clarification",
  FillForm: "fill_form",
  Confirmation: "confirmation",
  TakeControl: "take_control",
  Wait: "wait",
} as const;

export type InteractionType = (typeof InteractionTypes)[keyof typeof InteractionTypes];

/** Flat, ordered list of every InteractionType wire value — used by drift tests. */
export const INTERACTION_TYPE_VALUES: readonly InteractionType[] =
  Object.values(InteractionTypes);

/**
 * Interaction lifecycle status (backend-authoritative):
 * pending → active → resolved | expired | canceled.
 */
export const InteractionStatuses = {
  Pending: "pending",
  Active: "active",
  Resolved: "resolved",
  Expired: "expired",
  Canceled: "canceled",
} as const;

export type InteractionStatus = (typeof InteractionStatuses)[keyof typeof InteractionStatuses];

/** Flat, ordered list of every InteractionStatus wire value — used by drift tests. */
export const INTERACTION_STATUS_VALUES: readonly InteractionStatus[] =
  Object.values(InteractionStatuses);

/**
 * Action-contract kinds — what a consumer can do to an interaction.
 * Each maps to a typed method on InteractionHandle.
 */
export const ActionKinds = {
  answer: "answer",
  submit: "submit",
  skip: "skip",
  confirm: "confirm",
  reject: "reject",
  openLogin: "open_login",
  confirmSignedIn: "confirm_signed_in",
  connectControl: "connect_control",
  refreshControl: "refresh_control",
  releaseControl: "release_control",
  retry: "retry",
  switchProfile: "switch_profile",
} as const;

export type ActionKind = (typeof ActionKinds)[keyof typeof ActionKinds];

/** Flat, ordered list of every ActionKind wire value — used by drift tests. */
export const ACTION_KIND_VALUES: readonly ActionKind[] =
  Object.values(ActionKinds);
