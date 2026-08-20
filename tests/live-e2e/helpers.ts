import fs from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import {
  QoniError,
  QoniRateLimitError,
  QoniScopes,
  QoniValidationError,
  Qoni,
} from "../../src";
import type { JsonObject, RunEvent } from "../../src";
import { loadDotEnvLocal, requiredEnv } from "../helpers/env";
import { loadQueryMatrix } from "../helpers/query-matrix";
import { evidenceRecorder } from "./evidence";

loadDotEnvLocal();

export const liveE2EEnabled = process.env.QONI_LIVE_E2E === "1";
export const liveRequireAll = process.env.QONI_LIVE_REQUIRE_ALL === "1";
export const livePrefix = `sdk-live-${Date.now()}`;
export const liveRuntime = liveE2EEnabled ? loadQueryMatrix().runtime : undefined;

export function liveClient(overrides: {
  host?: string;
  webAgentBaseUrl?: string;
  timeoutMs?: number;
} = {}): Qoni {
  if (liveRequireAll) requiredEnv("QONI_USER_ACCESS_TOKEN");
  const host = overrides.host || liveRuntime?.qoniHost;
  const webAgentBaseUrl = overrides.webAgentBaseUrl || liveRuntime?.webAgentBaseUrl;
  // Off unless QONI_LIVE_EVIDENCE_DIR is set: with the variable unset this is
  // `undefined`, no `fetch` override is passed, and the client is built exactly
  // as it was before the recorder existed.
  const recorder = evidenceRecorder();
  recorder?.registerHost(host, "qoni");
  recorder?.registerHost(webAgentBaseUrl, "webagent");
  return new Qoni({
    accessKey: requiredEnv("QONI_ACCESS_KEY"),
    secretKey: requiredEnv("QONI_SECRET_KEY"),
    ...(host ? { host } : {}),
    ...(webAgentBaseUrl ? { webAgentBaseUrl } : {}),
    ...(recorder ? { fetch: recorder.wrapFetch(fetch) } : {}),
    timeoutMs: overrides.timeoutMs ?? liveRuntime?.timeoutMs ?? 120_000,
  });
}

export async function resolveLiveUserId(client: Qoni): Promise<string> {
  const listed = await client.genauth.users.list({ page: 1, limit: 1 });
  const userId = firstUserId(listed.data);
  if (userId) return userId;
  throw new Error("Qoni live e2e could not resolve a real GenAuth user from users.list");
}

export async function delegateLiveToken(
  client: Qoni,
  scopes: readonly string[],
): Promise<{ token: string; userId: string }> {
  const userId = await resolveLiveUserId(client);
  const delegated = await client.delegateToken({
    mode: "silent",
    user: { id: userId },
    agent: requiredEnv("QONI_AGENT_ID"),
    scopes,
    expiresIn: Number(process.env.QONI_DELEGATION_EXPIRES_IN || 3600),
  });
  return { token: delegated.data.token, userId };
}

export const gumemScopes = [
  QoniScopes.GUMEM_MEMORY_READ,
  QoniScopes.GUMEM_MEMORY_WRITE,
  QoniScopes.GUMEM_MESSAGE_WRITE,
  QoniScopes.GUMEM_ACTION_READ,
  QoniScopes.GUMEM_ACTION_WRITE,
  QoniScopes.GUMEM_RESOURCE_WRITE,
] as const;

export const webSearchScopes = [
  QoniScopes.WEB_SEARCH_READ,
  QoniScopes.WEB_SEARCH_MANAGE,
] as const;

export const doAnythingScopes = [
  QoniScopes.DO_ANYTHING_READ,
  QoniScopes.DO_ANYTHING_MANAGE,
] as const;

export const trackScopes = [
  QoniScopes.TRACK_READ,
  QoniScopes.TRACK_MANAGE,
] as const;

export const deepResearchScopes = [
  QoniScopes.DEEP_RESEARCH_READ,
  QoniScopes.DEEP_RESEARCH_MANAGE,
] as const;

export function extractId(data: unknown, label: string): string {
  const value = findString(data, [
    "id",
    "userId",
    "user_id",
    "runId",
    "run_id",
    "sessionId",
    "session_id",
    "monitorId",
    "monitor_id",
    "artifactId",
    "artifact_id",
  ]);
  if (value) return value;
  throw new Error(`Qoni live e2e could not read ${label} id from ${JSON.stringify(data)}`);
}

/**
 * Collect events from a SEMANTIC stream (`run.events()` / `monitor.events()`)
 * until `minEvents` are seen (and `until` matched, when given) or the timeout
 * elapses. Asserts the normalized `RunEvent` invariants on every event:
 * a `type`, an `at` timestamp, an object `data` payload, and the original
 * wire event on `raw`.
 */
export async function collectRunEvents(
  factory: (signal: AbortSignal) => AsyncIterable<RunEvent>,
  options: {
    label?: string;
    minEvents?: number;
    timeoutMs?: number;
    /** Keep collecting until an event matches (asserted to have been seen). */
    until?: (event: RunEvent) => boolean;
  } = {},
): Promise<RunEvent[]> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? Number(process.env.QONI_LIVE_STREAM_TIMEOUT_MS || 15_000),
  );
  const events: RunEvent[] = [];
  let matched = !options.until;
  try {
    for await (const event of factory(controller.signal)) {
      events.push(event);
      if (options.until?.(event)) matched = true;
      if (matched && events.length >= (options.minEvents || 1)) break;
    }
  } catch (error) {
    if (!controller.signal.aborted || !isAbortError(error)) throw error;
  } finally {
    clearTimeout(timeout);
  }

  const label = options.label || "semantic events";
  expect(events.length, `${label} should emit events`).toBeGreaterThanOrEqual(
    options.minEvents || 1,
  );
  for (const event of events) {
    expect(typeof event.type, `${label} event.type should be a string`).toBe("string");
    expect(event.at, `${label} event.at should be set`).toBeTruthy();
    // `event.data` follows the per-type contract (run-events.ts): rich events
    // carry a small object, but `progress`/`phase`/`sectionReady`/… are a string,
    // `resultsReady` a number, `checkCompleted` a boolean. So assert only that
    // the normalizer set SOMETHING (defined, incl. the empty-string progress
    // line) — not that it is always an object.
    expect(
      event.data !== undefined,
      `${label} event.data should be set`,
    ).toBe(true);
    expect(event.raw, `${label} event.raw should carry the wire event`).toBeTruthy();
  }
  if (options.until) {
    expect(matched, `${label} should include the awaited event`).toBe(true);
  }
  return events;
}

/**
 * On-disk raw event recorder. Resolves the output directory
 * (`QONI_OUT_DIR` or `.secrets/runs/<label>`), truncates `events.jsonl`, and
 * appends every event's ORIGINAL wire envelope (`event.raw`) as it arrives —
 * the semantic stream carries the wire event along, so recording does not
 * need the `api.*` escape hatch.
 */
export function openRawEventRecorder(label: string): {
  dir: string;
  file: string;
  count: () => number;
  record: (event: RunEvent) => void;
} {
  const dir = process.env.QONI_OUT_DIR || path.join(process.cwd(), ".secrets", "runs", label);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "events.jsonl");
  fs.writeFileSync(file, ""); // truncate any prior run's log
  let count = 0;
  return {
    dir,
    file,
    count: () => count,
    record(event) {
      count++;
      fs.appendFileSync(
        file,
        JSON.stringify({ receivedAt: new Date().toISOString(), ...event.raw }) + "\n",
      );
      const type = String(event.raw.event || event.type);
      console.log(`  [${type}] ${JSON.stringify(event.raw.data ?? {}).slice(0, 110)}`);
    },
  };
}

export function livePassword(): string {
  return (
    process.env.QONI_LIVE_TEST_USER_PASSWORD ||
    process.env.GENAUTH_DEMO_USER_PASSWORD ||
    `SdkLive!${Date.now()}Aa1`
  );
}

const liveConstraintMessages = [
  "Out of Credits",
  "concurrent task limit",
  "media object storage is not configured",
] as const;

export function isLiveEnvironmentConstraint(error: unknown): error is QoniError {
  return (
    error instanceof QoniError &&
    liveConstraintMessages.some((message) => error.message.includes(message)) &&
    (error instanceof QoniRateLimitError ||
      error instanceof QoniValidationError ||
      error.name === "QoniError")
  );
}

export async function allowLiveEnvironmentConstraint<T>(
  operation: Promise<T>,
): Promise<T | undefined> {
  try {
    return await operation;
  } catch (error) {
    if (!isLiveEnvironmentConstraint(error)) throw error;
    if (process.env.QONI_LIVE_ALLOW_ENV_CONSTRAINTS !== "1") throw error;
    expect(error.message).toBeTruthy();
    expect(error.code).toBeTruthy();
    console.warn(`live e2e accepted an environment constraint: ${error.message}`);
    return undefined;
  }
}

export function firstUserId(data: unknown): string | undefined {
  const arrays = [
    data,
    asRecord(data)?.list,
    asRecord(data)?.users,
    asRecord(data)?.items,
    asRecord(data)?.data,
  ];
  for (const candidate of arrays) {
    if (Array.isArray(candidate) && candidate.length) {
      const id = findString(candidate[0], ["userId", "id", "user_id", "sub", "username"]);
      if (id) return id;
    }
  }
  return findString(data, ["userId", "id", "user_id", "sub", "username"]);
}

function findString(value: unknown, keys: readonly string[]): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return undefined;
}

function asRecord(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { name?: unknown }).name === "AbortError");
}
