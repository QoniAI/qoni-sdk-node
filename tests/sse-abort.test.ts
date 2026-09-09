import { getEventListeners } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { QoniTimeoutError, Qoni } from "../src";

// Regression: aborting the caller-supplied AbortSignal must terminate an SSE
// iteration even AFTER the connection is established. The transport used to
// detach the user signal from the fetch controller as soon as response
// headers arrived, so an abort during body streaming was a no-op and the
// iterator only ended on a terminal event — `wait({ timeoutMs })` and the
// live-e2e stream recorders hung on long-running runs.

const encoder = new TextEncoder();

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

const TOKEN = jwt({ webagent_tenant_id: "tenant_1" });

function heartbeatChunk(id: number): Uint8Array {
  const envelope = {
    id: String(id),
    type: "stream.heartbeat",
    task_id: "run_1",
    session_id: "sess_1",
    occurred_at: "2026-06-12T08:00:00+00:00",
    data: {},
  };
  return encoder.encode(`id: ${id}\ndata: ${JSON.stringify(envelope)}\n\n`);
}

function makeStreamingClient(opts?: {
  jsonDetail?: unknown;
  onCancel?: () => void;
  streamResponse?: () => Response;
  sseMaxRetries?: number;
  timeoutMs?: number;
}) {
  // Mimics real fetch semantics: the response body errors with AbortError
  // when (and only when) the REQUEST's own signal aborts. If the SDK severs
  // the user signal → request signal chain after connect, a user abort never
  // reaches this stream.
  const client = new Qoni({
    accessKey: "ak_test",
    secretKey: "sk_test",
    host: "https://qoni.example.com",
    genauthBaseUrl: "https://qoni.example.com",
    webAgentBaseUrl: "https://qoni.example.com",
    sseMaxRetries: opts?.sseMaxRetries,
    timeoutMs: opts?.timeoutMs,
    fetch: (async (_url: URL | RequestInfo, init?: RequestInit) => {
      const wantsStream = new Headers(init?.headers).get("accept") === "text/event-stream";
      if (!wantsStream) {
        return new Response(
          JSON.stringify(opts?.jsonDetail ?? { data: { id: "run_1", status: "running" } }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      if (opts?.streamResponse) return opts.streamResponse();
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(heartbeatChunk(1));
          init?.signal?.addEventListener(
            "abort",
            () => {
              try {
                controller.error(new DOMException("Aborted", "AbortError"));
              } catch {
                // already closed/errored
              }
            },
            { once: true },
          );
        },
        cancel() {
          opts?.onCancel?.();
        },
      });
      return new Response(body, {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      });
    }) as typeof fetch,
  });
  return client;
}

describe("SSE abort propagation", () => {
  it("aborts an idle SSE reader even when the custom fetch does not wire the request signal", async () => {
    vi.useFakeTimers();
    try {
      const cancel = vi.fn();
      const response = new Response(new ReadableStream<Uint8Array>({ cancel }));
      const client = makeStreamingClient({ streamResponse: () => response });
      const run = await client.webSearch.attach("run_1", { token: TOKEN });
      const outcome = run.wait({ timeoutMs: 50 }).catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(51);
      expect(await Promise.race([outcome, Promise.resolve("pending")])).toBeInstanceOf(QoniTimeoutError);
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(response.body?.locked).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not hang on a pending source cancellation after the consumer breaks", async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const response = new Response(new ReadableStream<Uint8Array>({
      start(body) { body.enqueue(heartbeatChunk(1)); },
      cancel,
    }));
    const client = makeStreamingClient({ streamResponse: () => response });
    const consume = (async () => {
      for await (const event of client.deepResearch.api.events({ token: TOKEN, runId: "run_1" })) {
        expect(event.id).toBe("1");
        break;
      }
      return "closed";
    })();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await Promise.race([consume, Promise.resolve("pending")])).toBe("closed");
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
  });

  it("times out and releases a stalled SSE HTTP error body", async () => {
    vi.useFakeTimers();
    try {
      const cancel = vi.fn();
      const response = new Response(new ReadableStream<Uint8Array>({
        start(body) { body.enqueue(encoder.encode('{"detail":')); },
        cancel,
      }), { status: 503 });
      const client = makeStreamingClient({ streamResponse: () => response, timeoutMs: 50, sseMaxRetries: 0 });
      const outcome = (async () => {
        for await (const event of client.deepResearch.api.events({ token: TOKEN, runId: "run_1" })) {
          throw new Error(`Unexpected event: ${event.id}`);
        }
      })().catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(51);
      expect(await Promise.race([outcome, Promise.resolve("pending")])).toBeInstanceOf(QoniTimeoutError);
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(response.body?.locked).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not apply the request deadline to an established SSE body", async () => {
    vi.useFakeTimers();
    try {
      const client = makeStreamingClient({ timeoutMs: 50 });
      const controller = new AbortController();
      const outcome = (async () => {
        for await (const event of client.deepResearch.api.events({
          token: TOKEN, runId: "run_1", signal: controller.signal,
        })) expect(event.id).toBe("1");
      })().catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(100);
      expect(await Promise.race([outcome, Promise.resolve("pending")])).toBe("pending");
      controller.abort();
      await expect(outcome).resolves.toMatchObject({ name: "AbortError" });
      expect(getEventListeners(controller.signal, "abort")).toHaveLength(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each(["break", "close", "http-error"])("releases the caller abort listener after %s", async (exit) => {
    const controller = new AbortController();
    const client = makeStreamingClient({
      sseMaxRetries: 0,
      streamResponse: () => new Response(exit === "http-error" ? "{}" : new TextDecoder().decode(heartbeatChunk(1)), {
        status: exit === "http-error" ? 403 : 200,
      }),
    });
    const consume = async () => {
      for await (const event of client.deepResearch.api.events({
        token: TOKEN, runId: "run_1", signal: controller.signal,
      })) {
        expect(event.id).toBe("1");
        if (exit === "break") break;
      }
    };
    if (exit === "http-error") await expect(consume()).rejects.toMatchObject({ status: 403 });
    else await consume();
    expect(getEventListeners(controller.signal, "abort")).toHaveLength(0);
  });

  it("does not yield buffered frames after the caller aborts", async () => {
    const controller = new AbortController();
    const client = makeStreamingClient({
      streamResponse: () => new Response(
        new TextDecoder().decode(heartbeatChunk(1)) + new TextDecoder().decode(heartbeatChunk(2)),
      ),
    });
    const ids: Array<string | undefined> = [];
    const consume = async () => {
      for await (const event of client.deepResearch.api.events({
        token: TOKEN, runId: "run_1", signal: controller.signal,
      })) {
        ids.push(event.id);
        controller.abort();
      }
    };
    await expect(consume()).rejects.toMatchObject({ name: "AbortError" });
    expect(ids).toEqual(["1"]);
  });

  it("retries HTTP 408 stream failures within the configured retry budget", async () => {
    vi.useFakeTimers();
    try {
      let requests = 0;
      const client = makeStreamingClient({
        sseMaxRetries: 1,
        streamResponse: () => {
          requests++;
          return requests === 1
            ? new Response("{}", { status: 408 })
            : new Response(new TextDecoder().decode(heartbeatChunk(1)));
        },
      });
      const outcome = (async () => {
        const ids = [];
        for await (const event of client.deepResearch.api.events({ token: TOKEN, runId: "run_1" })) {
          ids.push(event.id);
        }
        return ids;
      })().catch((error: unknown) => error);
      await vi.runAllTimersAsync();
      expect(await outcome).toEqual(["1"]);
      expect(requests).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  // Regression: leaving the iterator early via `break` — the natural way to
  // read "the first N events" — runs the generator's finally block without
  // ever aborting a signal. Releasing the reader lock alone leaves the body
  // open and its socket checked out, so enough abandoned streams stall every
  // later request to the same origin until it times out. Observed live as
  // 120s timeouts on cancel()/attach() after an events() call that broke out.
  it("breaking out of an event stream cancels the response body", async () => {
    let canceled = false;
    const client = makeStreamingClient({ onCancel: () => { canceled = true; } });

    for await (const _ev of client.deepResearch.api.events({
      token: TOKEN,
      runId: "run_1",
    })) {
      break; // no abort — just stop consuming
    }

    expect(
      canceled,
      "abandoning the iterator must cancel the SSE body, not just release the reader",
    ).toBe(true);
  });

  it("aborting the caller signal terminates an in-flight wire event stream", async () => {
    const client = makeStreamingClient();
    const controller = new AbortController();

    const iteration = (async () => {
      for await (const _ev of client.deepResearch.api.events({
        token: TOKEN,
        runId: "run_1",
        signal: controller.signal,
      })) {
        // consume heartbeats until the stream dies
      }
    })();

    // Let the first heartbeat arrive so we abort an ESTABLISHED stream.
    await new Promise((resolve) => setTimeout(resolve, 25));
    controller.abort();

    const outcome = await Promise.race([
      iteration.then(
        () => "ended",
        (error: unknown) =>
          error instanceof Error && error.name === "AbortError"
            ? "aborted"
            : `threw: ${String(error)}`,
      ),
      new Promise<string>((resolve) => setTimeout(() => resolve("hung"), 500)),
    ]);

    expect(outcome).toBe("aborted");
  });

  it("wait({ timeoutMs }) on a never-terminating stream rejects with QoniTimeoutError", async () => {
    const client = makeStreamingClient();
    const run = await client.webSearch.attach("run_1", { token: TOKEN });

    const outcome = await Promise.race([
      run.wait({ timeoutMs: 120 }).then(
        () => "settled",
        (error: unknown) => (error instanceof QoniTimeoutError ? "timeout-error" : `threw: ${String(error)}`),
      ),
      new Promise<string>((resolve) => setTimeout(() => resolve("hung"), 1_000)),
    ]);

    expect(outcome).toBe("timeout-error");
  });
});
