import { QoniValidationError } from "./errors";
import { QoniScopes } from "./scopes";
import { isJsonObject, type JsonObject, type QoniTransport } from "./types";

/**
 * What keeps a personal agent going between conversations: follow-ups it
 * scheduled (proactive checks), the findings it left the person (notifications),
 * and what the workspace can still spend (credits).
 */

/** A follow-up: the agent wakes in its conversation at `dueAt` and looks again. */
export interface ProactiveCheck {
  id: string;
  sessionId: string;
  /** scheduled → running → notified (it told the person) or quiet (nothing to tell); or failed / canceled. */
  status: "scheduled" | "running" | "notified" | "quiet" | "failed" | "canceled";
  /** What to look at, in the agent's words. */
  note: string;
  dueAt: string;
  /** The agent scheduled it, or an app through the API. */
  createdBy: "agent" | "api";
  /** The run that scheduled it, and the run that carried it out. */
  sourceRunId: string | null;
  runId: string | null;
  /** What it found, in one line. */
  headline: string | null;
  error: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A finding a track or a follow-up left the person. */
export interface Notification {
  id: string;
  title: string;
  body: string;
  sessionId: string | null;
  trackId: string | null;
  proactiveId: string | null;
  read: boolean;
  createdAt: string;
}

export function createProactiveNamespace(transport: QoniTransport) {
  const root = "/proactive/checks";
  const at = (checkId: string) => `${root}/${encodeURIComponent(nonempty(checkId, "checkId"))}`;
  const one = async (method: "GET" | "POST", path: string, token: string, body?: JsonObject, manage = false) =>
    checkFromWire((await transport.webAgentJson<JsonObject>(method, path, token, {
      ...(body ? { body } : {}),
      requiredScopes: [manage ? QoniScopes.DO_ANYTHING_MANAGE : QoniScopes.DO_ANYTHING_READ],
    })).data);
  return {
    /** Schedule a follow-up in a conversation: at `dueAt` (ISO 8601), or `delaySeconds` from now. */
    create: async (input: { token: string; sessionId: string; note: string; dueAt?: string; delaySeconds?: number }) => {
      if ((input.dueAt === undefined) === (input.delaySeconds === undefined)) {
        throw new QoniValidationError("proactive.create takes dueAt or delaySeconds, one of them");
      }
      return one("POST", root, input.token, {
        session_id: nonempty(input.sessionId, "sessionId"), note: nonempty(input.note, "note"),
        ...(input.dueAt !== undefined ? { due_at: input.dueAt } : { delay_seconds: input.delaySeconds }),
      }, true);
    },
    /** The person's follow-ups, optionally one conversation's or in one status. */
    list: async (input: { token: string; sessionId?: string; status?: ProactiveCheck["status"]; limit?: number }): Promise<ProactiveCheck[]> => {
      const query: JsonObject = {};
      if (input.sessionId !== undefined) query.session_id = input.sessionId;
      if (input.status !== undefined) query.status = input.status;
      if (input.limit !== undefined) query.limit = input.limit;
      const { data } = await transport.webAgentJson<JsonObject>("GET", root, input.token, {
        query, requiredScopes: [QoniScopes.DO_ANYTHING_READ],
      });
      return (isJsonObject(data) && Array.isArray(data.items) ? data.items : []).map(checkFromWire);
    },
    get: (input: { token: string; checkId: string }) => one("GET", at(input.checkId), input.token),
    cancel: (input: { token: string; checkId: string }) => one("POST", `${at(input.checkId)}/cancel`, input.token, {}, true),
    /** Carry it out now instead of at its time. */
    runNow: (input: { token: string; checkId: string }) => one("POST", `${at(input.checkId)}/run_now`, input.token, {}, true),
  };
}

export function createNotificationsNamespace(transport: QoniTransport) {
  return {
    /** The newest findings first, and how many are unread. Needs `webagent.track:read`. */
    list: async (input: { token: string; limit?: number }): Promise<{ items: Notification[]; unread: number }> => {
      const { data } = await transport.webAgentJson<JsonObject>("GET", "/notifications", input.token, {
        query: input.limit === undefined ? undefined : { limit: input.limit },
        requiredScopes: [QoniScopes.TRACK_READ],
      });
      return {
        items: (isJsonObject(data) && Array.isArray(data.items) ? data.items : []).map(notificationFromWire),
        unread: isJsonObject(data) && typeof data.unread === "number" ? data.unread : 0,
      };
    },
    /** Mark read: the given ones, one track's, or (with neither) all. Needs `webagent.track:manage`. */
    markRead: async (input: { token: string; ids?: string[]; trackId?: string }): Promise<{ unread: number }> => {
      const body: JsonObject = {};
      if (input.ids !== undefined) body.ids = input.ids;
      if (input.trackId !== undefined) body.track_id = input.trackId;
      const { data } = await transport.webAgentJson<JsonObject>("POST", "/notifications/read", input.token, {
        body, requiredScopes: [QoniScopes.TRACK_MANAGE],
      });
      return { unread: isJsonObject(data) && typeof data.unread === "number" ? data.unread : 0 };
    },
  };
}

export function createWorkspaceNamespace(transport: QoniTransport, consoleUrl: string) {
  return {
    /**
     * The Qoni console page that opens the workspace's billing on Top up (or Plan):
     * where to send people when `credits()` runs out. The person's delegation token
     * names the workspace.
     */
    billingUrl: (input: { token: string; section?: "topup" | "plan" }): string => {
      const section = input.section ?? "topup";
      if (section !== "topup" && section !== "plan") throw new QoniValidationError("billingUrl section must be topup or plan");
      const workspace = tokenClaims(input.token)?.eak_tenant_id;
      if (typeof workspace !== "string" || !workspace) {
        throw new QoniValidationError("billingUrl needs the person's delegation token: it names their workspace");
      }
      return `${consoleUrl}/workspaces/${encodeURIComponent(workspace)}?billing=${section}`;
    },
    /**
     * Whole Credits the workspace's runs can still spend: the number every model call
     * is checked against. `available` is null when the workspace is not metered.
     */
    credits: async (input: { token: string; signal?: AbortSignal }): Promise<{ available: number | null }> => {
      const { data } = await transport.webAgentJson<JsonObject>("GET", "/billing/credits", input.token, {
        signal: input.signal, requiredScopes: [QoniScopes.DO_ANYTHING_READ],
      });
      return { available: isJsonObject(data) && typeof data.available === "number" ? data.available : null };
    },
  };
}

function tokenClaims(token: string): JsonObject | undefined {
  try {
    const claims: unknown = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
    return isJsonObject(claims) ? claims : undefined;
  } catch {
    return undefined;
  }
}

function checkFromWire(value: unknown): ProactiveCheck {
  const c = isJsonObject(value) ? value : {};
  const s = (key: string) => (typeof c[key] === "string" ? (c[key] as string) : null);
  return {
    id: String(c.id ?? ""),
    sessionId: String(c.session_id ?? ""),
    status: String(c.status ?? "") as ProactiveCheck["status"],
    note: String(c.note ?? ""),
    dueAt: String(c.due_at ?? ""),
    createdBy: (c.created_by === "agent" ? "agent" : "api"),
    sourceRunId: s("source_run_id"),
    runId: s("run_id"),
    headline: s("headline"),
    error: s("error"),
    finishedAt: s("finished_at"),
    createdAt: String(c.created_at ?? ""),
    updatedAt: String(c.updated_at ?? ""),
  };
}

function notificationFromWire(value: unknown): Notification {
  const n = isJsonObject(value) ? value : {};
  const s = (key: string) => (typeof n[key] === "string" ? (n[key] as string) : null);
  return {
    id: String(n.id ?? ""),
    title: String(n.title ?? ""),
    body: String(n.body ?? ""),
    sessionId: s("session_id"),
    trackId: s("track_id"),
    proactiveId: s("proactive_id"),
    read: n.read === true,
    createdAt: String(n.created_at ?? ""),
  };
}

function nonempty(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new QoniValidationError(`${label} must be a nonempty string`);
  return value;
}
