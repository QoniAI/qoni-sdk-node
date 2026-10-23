import { BrowserBoard } from "./browsers";
import { normalizeRunEvent, type RunEvent, type RunMessageData } from "./run-events";
import { isJsonObject, type JsonObject, type QoniEvent } from "./types";

/**
 * Folds a run's wire events into semantic events, carrying what spans several
 * of them: a reply the model streams in pieces, and the browsers the run has
 * open. One folder per event stream.
 *
 * Messages. A streamed reply arrives as many chunks with one stable id; every
 * `message` event for it carries that `id`, the whole `text` so far and the
 * `delta` it added. The model call's end closes it (`done`, with `stopReason`:
 * a "tool…" reason means the agent goes on to use tools, anything else that it
 * finished speaking). The run's answer comes last with `final`; when the reply
 * already shown is that answer, the event reuses its id instead of repeating it.
 * The model's private reasoning and receipts are not messages.
 *
 * Browsers. Whenever the browsers the run has open change, a `browsers` event
 * carries the whole list, by the same rules as `doAnything.browsers.list()`.
 */
export class RunEventFolder {
  #stream: { id: string; text: string } | null = null;
  /** The last reply shown, and why its model call stopped (none when cut off). */
  #said: { id: string; text: string; stopReason?: string } | null = null;
  readonly #board = new BrowserBoard();
  #shown = "[]";

  constructor(private readonly topRunId?: string) {}

  feed(wire: QoniEvent<unknown>): RunEvent[] {
    const envelope = isJsonObject(wire.data) ? wire.data : undefined;
    const type = wire.event ?? (typeof envelope?.type === "string" ? envelope.type : undefined);
    if (!type) return [];
    const payload = isJsonObject(envelope?.data) ? envelope.data : {};
    const runId = typeof envelope?.task_id === "string" ? envelope.task_id : null;
    const at = typeof envelope?.occurred_at === "string" ? envelope.occurred_at : new Date().toISOString();
    const base = { runId: runId ?? this.topRunId ?? "", at, raw: wire };

    const out: RunEvent[] = [];
    if (BrowserBoard.concerns(type)) {
      this.#board.feed(type, payload, runId, at);
      const now = this.#board.list();
      const shown = JSON.stringify(now);
      if (shown !== this.#shown) {
        this.#shown = shown;
        out.push({ ...base, type: "browsers", data: now, isTerminal: false });
      }
    }
    if (type === "run.message") return [...out, ...this.#message(payload, base)];

    const event = normalizeRunEvent(wire, { topRunId: this.topRunId });
    if (event?.isTerminal) out.push(...this.#close(base));
    if (event) out.push(event);
    return out;
  }

  #message(p: JsonObject, base: Base): RunEvent[] {
    const id = text(p.message_id) ?? "";
    const said = typeof p.text === "string" ? p.text : "";
    if (p.type === "planning") {
      // The end of one model call, with why it stopped; or the model's own reasoning.
      if (p.summary === "Agent reply") return this.#endReply(id, said, p.hidden === true, text(p.stop_reason), base);
      return said.trim() ? [{ ...base, type: "progress", data: said, isTerminal: false }] : [];
    }
    if (p.role === "human" || p.type === "user_message") {
      return said.trim() ? [message(base, { id, role: "human", text: said, delta: said, done: true, final: false })] : [];
    }
    if (p.type !== "assistant_message") {
      return said.trim() ? [{ ...base, type: "progress", data: said, isTerminal: false }] : [];
    }
    if (p.final === true) {
      const out = this.#close(base);
      if (!said.trim()) return out;
      // The run's answer: the reply just shown when it is that answer, otherwise new.
      const shown = this.#said;
      const same = shown && (sameSpeech(shown.text, said) ||
        (shown.stopReason !== undefined && !/^tool/i.test(shown.stopReason)));
      this.#said = { id: same ? shown.id : id, text: said };
      return [...out, message(base, {
        id: same ? shown.id : id, role: "ai", text: said, delta: same ? "" : said, done: true, final: true,
      })];
    }
    if (p.summary === "Streaming") {
      const out = this.#stream && this.#stream.id !== id ? this.#close(base) : [];
      this.#stream = { id, text: (this.#stream?.id === id ? this.#stream.text : "") + said };
      return [...out, message(base, { id, role: "ai", text: this.#stream.text, delta: said, done: false, final: false })];
    }
    // A whole message, not streamed.
    const out = this.#close(base);
    if (!said.trim()) return out;
    this.#said = { id, text: said };
    return [...out, message(base, { id, role: "ai", text: said, delta: said, done: true, final: false })];
  }

  #endReply(id: string, said: string, hidden: boolean, stopReason: string | undefined, base: Base): RunEvent[] {
    const streamed = this.#stream;
    if (streamed) {
      this.#stream = null;
      this.#said = { ...streamed, stopReason };
      return [message(base, { id: streamed.id, role: "ai", text: streamed.text, delta: "", done: true, final: false, stopReason })];
    }
    if (hidden || !said.trim()) return []; // a model call that only used tools
    this.#said = { id, text: said, stopReason };
    return [message(base, { id, role: "ai", text: said, delta: said, done: true, final: false, stopReason })];
  }

  /** A streamed reply cut off without its model call's end (the run stopped). */
  #close(base: Base): RunEvent[] {
    const streamed = this.#stream;
    if (!streamed) return [];
    this.#stream = null;
    this.#said = streamed;
    return [message(base, { id: streamed.id, role: "ai", text: streamed.text, delta: "", done: true, final: false })];
  }
}

type Base = { runId: string; at: string; raw: QoniEvent<unknown> };

function message(base: Base, data: RunMessageData): RunEvent {
  if (data.stopReason === undefined) delete data.stopReason;
  return { ...base, type: "message", data, isTerminal: false };
}

/** The same words, or one cut short of the other (a stream stopped early, a final full stop). */
function sameSpeech(a: string, b: string): boolean {
  const x = a.trim();
  const y = b.trim();
  return x === y || x.startsWith(y) || y.startsWith(x);
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
