import { browserFromWire, type AgentBrowser } from "./browsers";
import { QoniValidationError } from "./errors";
import type { RunFailureReason } from "./run-handle";
import { QoniScopes } from "./scopes";
import { isJsonObject, type JsonObject, type QoniTransport } from "./types";

/**
 * A person's conversations with their agent (Do Anything sessions), the browsers
 * each has open, and the files on each one's computer.
 *
 * Every session has its own computer. While it runs, files are read from it;
 * while it sleeps, from the copy kept after each turn — looking never wakes it.
 * Changing a file wakes it, and it sleeps again once idle.
 */

/** A conversation. */
export interface SessionSummary {
  id: string;
  title: string | null;
  status: "created" | "idle" | "running" | "stopped" | "timed_out" | "error";
  /** Its latest run; `doAnything.attach(latestRunId, …)` follows it. */
  latestRunId: string | null;
  /** Why its latest run failed, when it did. */
  failureReason: RunFailureReason | null;
  createdAt: string;
  updatedAt: string;
  /** The wire session (escape hatch; shape may evolve with the API). */
  raw: JsonObject;
}

/** What each run of a session cost, in Credits (decimal strings). */
export interface SessionCredits {
  /** False when the workspace is not metered. */
  metered: boolean;
  runs: Array<{
    runId: string;
    credits: string | null;
    /** pending: not yet known; estimated: still settling; current: final; unavailable. */
    status: "pending" | "estimated" | "current" | "unavailable";
  }>;
}

export interface ComputerFile {
  /** Path under the computer's home folder, e.g. "workspace/outputs/report.pdf". */
  path: string;
  name: string;
  type: "file" | "directory";
  /** null for a directory. */
  sizeBytes: number | null;
  modifiedAt: string | null;
}

export interface ComputerFiles {
  /** live: read from the running computer. saved: from the copy kept after its last turn
   *  (the computer sleeps). null: the session has no files yet. */
  source: "live" | "saved" | null;
  items: ComputerFile[];
  /** More entries exist than were listed (2,000 at most). */
  truncated: boolean;
  /** When the saved copy was taken (source "saved"). */
  savedAt: string | null;
}

/** One change on the running computer. A move is a removal and a creation. */
export interface FileChange {
  type: "created" | "changed" | "removed";
  path: string;
}

/** One conversation's kept files, from `files.listAll()`. */
export interface SessionFiles {
  sessionId: string;
  title: string | null;
  savedAt: string | null;
  items: ComputerFile[];
  truncated: boolean;
}

/** Addresses one session as its person: their delegation token and the session id. */
export interface SessionInput { token: string; sessionId: string; signal?: AbortSignal }

const READ = [QoniScopes.DO_ANYTHING_READ];
const MANAGE = [QoniScopes.DO_ANYTHING_MANAGE];
// A watch that ends without saying the computer slept is opened again, this many times in a
// row, a second apart.
const WATCH_REOPENS = 5;
const WATCH_REOPEN_MS = 1_000;

export function createComputerNamespaces(transport: QoniTransport) {
  const at = (sessionId: string, tail = "") =>
    `/do_anything/sessions/${encodeURIComponent(id(sessionId, "sessionId"))}${tail}`;

  const sessions = {
    /** The person's conversations, newest first. */
    list: async (input: { token: string; limit?: number; signal?: AbortSignal }): Promise<SessionSummary[]> => {
      const { data } = await transport.webAgentJson<JsonObject>("GET", "/do_anything/sessions", input.token, {
        query: input.limit === undefined ? undefined : { limit: input.limit },
        signal: input.signal, requiredScopes: READ,
      });
      return items(data).map(sessionFromWire);
    },
    get: async (input: SessionInput): Promise<SessionSummary> => {
      const { data } = await transport.webAgentJson<JsonObject>("GET", at(input.sessionId), input.token, {
        signal: input.signal, requiredScopes: READ,
      });
      return sessionFromWire(data);
    },
    /** What each run of the session cost. */
    credits: async (input: SessionInput): Promise<SessionCredits> => {
      const { data } = await transport.webAgentJson<JsonObject>("GET", at(input.sessionId, "/credits"), input.token, {
        signal: input.signal, requiredScopes: READ,
      });
      const runs = Array.isArray(data?.runs) ? data.runs.filter(isJsonObject) : [];
      return {
        metered: data?.enabled === true,
        runs: runs.map((run) => ({
          runId: String(run.run_id),
          credits: typeof run.credits === "string" ? run.credits : null,
          status: (typeof run.status === "string" ? run.status : "unavailable") as SessionCredits["runs"][number]["status"],
        })),
      };
    },
  };

  const browsers = {
    /**
     * The browsers the session has open now, the lead agent's first; none while its
     * computer sleeps. During a run the `browsers` event carries the same list live.
     */
    list: async (input: SessionInput): Promise<AgentBrowser[]> => {
      const { data } = await transport.webAgentJson<JsonObject>("GET", at(input.sessionId, "/browsers"), input.token, {
        signal: input.signal, requiredScopes: READ,
      });
      return items(data).map(browserFromWire);
    },
    /**
     * Act on a sub-agent's browser: `take` it over, hand it back (`release`), say you
     * are `done` (signed in, or did what it asked), or `skip` (it carries on without).
     */
    control: async (input: SessionInput & {
      browserId: string;
      action: "take" | "release" | "done" | "skip";
    }): Promise<void> => {
      if (input.browserId === "main") {
        throw new QoniValidationError("browsers.control acts on a sub-agent's browser; the lead's sign-ins are its run's interactions");
      }
      if (!["take", "release", "done", "skip"].includes(input.action)) {
        throw new QoniValidationError("browsers.control action must be take, release, done or skip");
      }
      await transport.webAgentJson("POST",
        at(input.sessionId, `/subagents/${encodeURIComponent(id(input.browserId, "browserId"))}/control`),
        input.token, { body: { action: input.action }, signal: input.signal, requiredScopes: MANAGE });
    },
  };

  const files = {
    /** A folder of the computer ("" for the home folder), `depth` levels down (1–5). */
    list: async (input: SessionInput & { path?: string; depth?: number }): Promise<ComputerFiles> => {
      const query: JsonObject = { path: input.path ?? "" };
      if (input.depth !== undefined) query.depth = input.depth;
      const { data } = await transport.webAgentJson<JsonObject>("GET", at(input.sessionId, "/files"), input.token, {
        query, signal: input.signal, requiredScopes: READ,
      });
      return {
        source: data?.source === "live" || data?.source === "saved" ? data.source : null,
        items: items(data).map(fileFromWire),
        truncated: data?.truncated === true,
        savedAt: typeof data?.saved_at === "string" ? data.saved_at : null,
      };
    },
    /** One file's bytes, from the running computer or its kept copy. */
    read: async (input: SessionInput & { path: string }): Promise<Uint8Array> =>
      (await transport.webAgentBytes(at(input.sessionId, "/files/blob"), input.token, {
        query: { path: path(input.path) }, signal: input.signal, requiredScopes: READ,
      })).bytes,
    /**
     * Each change on the running computer, within about two seconds. Ends when the
     * computer sleeps (and at once if it is asleep); abort `signal` to stop sooner.
     */
    watch: async function* (input: SessionInput): AsyncIterable<FileChange> {
      for (let reopens = 0; reopens <= WATCH_REOPENS; reopens++) {
        let changed = false;
        for await (const event of transport.webAgentSSE<JsonObject>(at(input.sessionId, "/files/watch"), input.token, {
          signal: input.signal, requiredScopes: READ,
        })) {
          const frame = isJsonObject(event.data) ? event.data : {};
          if (frame.type === "asleep") return;
          if ((frame.type === "created" || frame.type === "changed" || frame.type === "removed") &&
              typeof frame.path === "string") {
            changed = true;
            yield { type: frame.type, path: frame.path };
          }
        }
        if (input.signal?.aborted) return;
        if (changed) reopens = 0;
        await pause(WATCH_REOPEN_MS, input.signal);
      }
    },
    /** Put a new file on the computer (up to 100 MB); it never replaces one already there. */
    upload: async (input: SessionInput & { path: string; content: Uint8Array | ArrayBuffer | Blob | string }): Promise<ComputerFile> => {
      const body = input.content instanceof Uint8Array ? new Blob([new Uint8Array(input.content)]) : input.content;
      const { data } = await transport.webAgentJson<JsonObject>("PUT", at(input.sessionId, "/files"), input.token, {
        query: { path: path(input.path) }, body, signal: input.signal, requiredScopes: MANAGE,
        headers: { "content-type": "application/octet-stream" },
      });
      return fileFromWire(data);
    },
    /** Delete a file, or a folder with everything in it. */
    delete: async (input: SessionInput & { path: string }): Promise<void> => {
      await transport.webAgentJson("DELETE", at(input.sessionId, "/files"), input.token, {
        query: { path: path(input.path) }, signal: input.signal, requiredScopes: MANAGE,
      });
    },
    /** Rename or move a file or folder; never over something already there. */
    move: async (input: SessionInput & { from: string; to: string }): Promise<ComputerFile> => {
      const { data } = await transport.webAgentJson<JsonObject>("POST", at(input.sessionId, "/files/move"), input.token, {
        body: { from: path(input.from), to: path(input.to) }, signal: input.signal, requiredScopes: MANAGE,
      });
      return fileFromWire(data);
    },
    /** Create a folder and its parents; fine when it is already there. */
    mkdir: async (input: SessionInput & { path: string }): Promise<ComputerFile> => {
      const { data } = await transport.webAgentJson<JsonObject>("POST", at(input.sessionId, "/files/folders"), input.token, {
        body: { path: path(input.path) }, signal: input.signal, requiredScopes: MANAGE,
      });
      return fileFromWire(data);
    },
    /** Every recent conversation's kept files (files only), newest conversation first. */
    listAll: async (input: { token: string; limit?: number; signal?: AbortSignal }): Promise<SessionFiles[]> => {
      const { data } = await transport.webAgentJson<JsonObject>("GET", "/do_anything/files", input.token, {
        query: input.limit === undefined ? undefined : { limit: input.limit },
        signal: input.signal, requiredScopes: READ,
      });
      return items(data).map((kept) => ({
        sessionId: String(kept.session_id),
        title: typeof kept.title === "string" ? kept.title : null,
        savedAt: typeof kept.saved_at === "string" ? kept.saved_at : null,
        items: items(kept).map(fileFromWire),
        truncated: kept.truncated === true,
      }));
    },
  };

  return { sessions, browsers, files };
}

function sessionFromWire(value: unknown): SessionSummary {
  const raw = isJsonObject(value) ? value : {};
  return {
    id: String(raw.id ?? ""),
    title: typeof raw.title === "string" ? raw.title : null,
    status: String(raw.status ?? "") as SessionSummary["status"],
    latestRunId: typeof raw.latest_run_id === "string" ? raw.latest_run_id : null,
    failureReason: typeof raw.failure_reason === "string" ? raw.failure_reason as RunFailureReason : null,
    createdAt: String(raw.created_at ?? ""),
    updatedAt: String(raw.updated_at ?? ""),
    raw,
  };
}

function fileFromWire(value: unknown): ComputerFile {
  const item = isJsonObject(value) ? value : {};
  return {
    path: String(item.path ?? ""),
    name: String(item.name ?? ""),
    type: item.type === "directory" ? "directory" : "file",
    sizeBytes: typeof item.size_bytes === "number" ? item.size_bytes : null,
    modifiedAt: typeof item.modified_at === "string" ? item.modified_at : null,
  };
}

function items(value: unknown): JsonObject[] {
  return isJsonObject(value) && Array.isArray(value.items) ? value.items.filter(isJsonObject) : [];
}

function id(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new QoniValidationError(`${label} must be a nonempty string`);
  return value;
}

/** A path under the home folder; the server refuses hidden or escaping ones. */
function path(value: unknown): string {
  if (typeof value !== "string" || !value || value.startsWith("/") || value.includes("\0")) {
    throw new QoniValidationError("path must be relative to the computer's home folder, e.g. workspace/report.md");
  }
  return value;
}

function pause(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timer = setTimeout(done, ms);
    signal?.addEventListener("abort", done, { once: true });
    function done() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", done);
      resolve();
    }
  });
}
