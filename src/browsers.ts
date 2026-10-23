import { isJsonObject, type JsonObject } from "./types";

/**
 * A browser open in a run: the lead agent's, or one of its sub-agents'.
 * The same list `doAnything.browsers.list()` returns and the `browsers` run
 * event carries, built by the rules the Qoni Console's canvas draws by.
 */
export interface AgentBrowser {
  /** `"main"` for the lead agent's browser, otherwise the sub-agent's id. */
  id: string;
  /** The sub-agent's job, e.g. "比价 · Amazon"; null for the lead. */
  label: string | null;
  /** The browser's interactive live view: embed it in an iframe. */
  url: string;
  /** The sub-agent's state; null for the lead (its state is the run's). */
  status: SubagentStatus | null;
  /** What the sub-agent is doing now. */
  activity: string | null;
  /** What the sub-agent waits for the person to do here; act with `browsers.control()`. */
  need: BrowserNeed | null;
  /** The person holds this browser; the sub-agent waits. */
  userInControl: boolean;
  /** When the sub-agent started (ISO 8601); null for the lead. */
  startedAt: string | null;
}

export type SubagentStatus = "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled";

export interface BrowserNeed {
  /** `login`: sign in on this browser. `help`: do what `prompt` asks on it. */
  kind: "login" | "help";
  site: string | null;
  prompt: string | null;
}

const LEAD_EVENT = "run.browser_live_url_changed";
const CHILD_PREFIX = "run.subagent.";
const RUN_ENDED = "run.completed";
const SETTLED = new Set(["completed", "failed", "cancelled"]);
// An internal id is not a name for a person.
const RAW_ID = /^(?:c-)?(?:[0-9a-f]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

interface Card {
  label: string | null;
  status: string;
  activity: string | null;
  url: string | null;
  need: BrowserNeed | null;
  userInControl: boolean;
  startedAt: string | null;
  runId: string | null;
}

/**
 * The browsers a run has open, folded from its events one at a time:
 * - the lead's browser is the last `run.browser_live_url_changed` (an empty URL: closed);
 * - a sub-agent's card follows its `run.subagent.*` events, each stating its status,
 *   activity and need (an event without a need clears it); `live_url_changed` with no
 *   URL closes its browser and `closed` removes the card;
 * - a run that ends settles its unfinished sub-agents: failed when it failed, else cancelled;
 * - only browsers with an address are listed.
 */
export class BrowserBoard {
  #lead: string | null = null;
  readonly #cards = new Map<string, Card>();

  /** Whether a wire event type can change the board. */
  static concerns(type: string): boolean {
    return type === LEAD_EVENT || type === RUN_ENDED || type.startsWith(CHILD_PREFIX);
  }

  feed(type: string, data: JsonObject, runId: string | null, at: string | null): void {
    if (type === LEAD_EVENT) {
      this.#lead = viewer(data.live_url);
      return;
    }
    if (type === RUN_ENDED) {
      const failed = data.terminal_reason === "failed";
      for (const card of this.#cards.values()) {
        if (SETTLED.has(card.status) || (card.runId && runId && card.runId !== runId)) continue;
        card.status = failed ? "failed" : "cancelled";
        card.need = null;
      }
      return;
    }
    const child = typeof data.child_id === "string" && data.child_id ? data.child_id : null;
    if (!type.startsWith(CHILD_PREFIX) || !child) return;
    const phase = type.slice(CHILD_PREFIX.length);
    if (phase === "closed") {
      this.#cards.delete(child);
      return;
    }
    const previous: Card = this.#cards.get(child) ?? {
      label: null, status: "running", activity: null, url: null, need: null,
      userInControl: false, startedAt: at, runId,
    };
    const status = text(data.status) ?? (
      phase === "live_url_changed" ? previous.status
        : phase === "started" || phase === "progress" ? "running" : phase
    );
    const released = phase === "live_url_changed" && data.live_url === null;
    const holding = typeof data.user_in_control === "boolean" ? data.user_in_control : undefined;
    const need = data.need === "login" || data.need === "help" ? data.need : null;
    this.#cards.set(child, {
      label: name(data.label, child) ?? previous.label,
      status,
      activity: text(data.activity) ?? text(data.error) ?? previous.activity,
      url: released ? null : viewer(data.live_url) ?? previous.url,
      need: need && !SETTLED.has(status)
        ? { kind: need, site: text(data.site) ?? null, prompt: text(data.prompt) ?? null }
        : null,
      userInControl: released ? false : holding ?? previous.userInControl,
      startedAt: previous.startedAt,
      runId: previous.runId,
    });
  }

  list(): AgentBrowser[] {
    const browsers: AgentBrowser[] = this.#lead ? [{
      id: "main", label: null, url: this.#lead, status: null, activity: null, need: null,
      userInControl: false, startedAt: null,
    }] : [];
    for (const [id, card] of this.#cards) {
      if (!card.url) continue;
      browsers.push({
        id, label: card.label, url: card.url, status: card.status as SubagentStatus,
        activity: card.activity, need: card.need, userInControl: card.userInControl,
        startedAt: card.startedAt,
      });
    }
    return browsers;
  }
}

/** One browser item from `GET /sessions/{sid}/browsers`. */
export function browserFromWire(value: unknown): AgentBrowser {
  const item = isJsonObject(value) ? value : {};
  const need = isJsonObject(item.need) && (item.need.kind === "login" || item.need.kind === "help")
    ? { kind: item.need.kind as BrowserNeed["kind"], site: text(item.need.site) ?? null, prompt: text(item.need.prompt) ?? null }
    : null;
  return {
    id: String(item.id ?? ""),
    label: text(item.label) ?? null,
    url: String(item.url ?? ""),
    status: (text(item.status) ?? null) as SubagentStatus | null,
    activity: text(item.activity) ?? null,
    need,
    userInControl: item.user_in_control === true,
    startedAt: text(item.started_at) ?? null,
  };
}

/** A real viewer address; a redacted placeholder is not one. */
function viewer(value: unknown): string | null {
  return typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;
}

function name(value: unknown, child: string): string | null {
  if (typeof value !== "string" || !value.trim() || value === child || RAW_ID.test(value)) return null;
  return value.trim();
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
