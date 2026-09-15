import { afterEach, describe, expect, it, vi } from "vitest";
import { getEventListeners } from "node:events";
import {
  QoniError,
  QoniPermissionDeniedError,
  QoniValidationError,
  QoniTimeoutError,
  RunHandle,
  Qoni,
} from "../src";
import type { RunEvent } from "../src";
import type { RunWireOps } from "../src/run-handle";
import { decodeDataUri } from "../src/run-events";

// ---------------------------------------------------------------------------
// Harness: realistic wire-shaped fixtures (double envelope, snake_case),
// mocked transport via the fetch option.
// ---------------------------------------------------------------------------

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

const TOKEN = jwt({ webagent_tenant_id: "tenant_1" });

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
}

function sseResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

/** One wire SSE frame: `id: <n>\ndata: <envelope json>\n\n` (no `event:` line). */
function frame(id: number, type: string, data: Record<string, unknown>, extra: Record<string, unknown> = {}): string {
  const envelope = {
    id: String(id),
    type,
    task_id: "run_1",
    session_id: "sess_1",
    project_id: "tenant_1",
    occurred_at: `2026-06-12T08:00:0${id}+00:00`,
    ...extra,
    data,
  };
  return `id: ${id}\ndata: ${JSON.stringify(envelope)}\n\n`;
}

interface Captured {
  url: string;
  pathname: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal | null;
}

function makeClient(routes: (call: Captured) => Response | Promise<Response>, options: { timeoutMs?: number; emptyArtifacts?: boolean } = {}) {
  const calls: Captured[] = [];
  const client = new Qoni({
    accessKey: "ak_test",
    secretKey: "sk_test",
    host: "https://qoni.example.com",
    genauthBaseUrl: "https://qoni.example.com",
    webAgentBaseUrl: "https://qoni.example.com",
    ...options,
    fetch: (async (url: URL | RequestInfo, init?: RequestInit) => {
      const headers: Record<string, string> = {};
      new Headers(init?.headers).forEach((value, key) => {
        headers[key] = value;
      });
      const call: Captured = {
        url: String(url),
        pathname: new URL(String(url)).pathname,
        method: init?.method || "GET",
        headers,
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
        signal: init?.signal,
      };
      calls.push(call);
      if (options.emptyArtifacts !== false && /\/do_anything\/runs\/[^/]+\/artifacts$/.test(call.pathname)) return jsonResponse({ items: [] });
      return routes(call);
    }) as typeof fetch,
  });
  return { client, calls };
}

const IMAGE_BYTES = Buffer.from("fake-jpeg-bytes");
const SCREENSHOT_DATA_URI = `data:image/jpeg;base64,${IMAGE_BYTES.toString("base64")}`;

describe("screenshot data URI decoding", () => {
  it.each([
    ["data:image/jpeg;base64,aGk=", "hi"],
    ["data:image/jpeg;base64,aGk", "hi"],
    ["data:image/jpeg;base64,YQ==", "a"],
    ["data:image/jpeg;base64,YQ", "a"],
    ["data:image/jpeg;base64, aG\nk=\r\n", "hi"],
    ["data:image/jpeg;base64,SGVsbG8_", "Hello?"],
    ["data:image/jpeg;base64,SGVsbG8-", "Hello>"],
    ["data:text/plain,hello%20world", "hello world"],
  ])("preserves supported nonempty decoding for %s", (uri, expected) => {
    expect(Buffer.from(decodeDataUri(uri)!.bytes).toString()).toBe(expected);
  });

  describe.each([false, true])("capture.screenshots=%s", (screenshots) => {
    it.each([
      "data:image/jpeg;base64,!!!!",
      "data:image/jpeg;base64,aGk=!!",
      "data:image/jpeg;base64,",
      "data:image/jpeg;base64, \n",
      "data:image/jpeg;base64,A",
      "data:image/jpeg;base64,aGk===",
      "data:image/jpeg;base64,a=Gk",
      "data:image/jpeg,%",
      "data:image/jpeg,%GG",
      "data:image/jpeg,%E0%A4%A",
      "data:image/jpeg,%FF",
      "data:image/jpeg,",
    ])("degrades malformed screenshot %s to progress and still settles wait", async (screenshotUrl) => {
      const payload = { screenshot_url: screenshotUrl, note: "Screenshot unavailable" };
      const { client, calls } = makeClient((call) => {
        if (call.pathname.endsWith("/events")) {
          return sseResponse(
            frame(1, "run.screenshot", payload) +
            frame(2, "run.completed", { terminal_reason: "done", output: "lean" }),
          );
        }
        return jsonResponse({ data: { run_id: "run_1", status: "succeeded", output: "canonical" } });
      });
      const run = await client.doAnything.attach("run_1", { token: TOKEN, capture: { screenshots } });
      const events: RunEvent[] = [];
      const wireEvents: RunEvent["raw"][] = [];
      const onScreenshot = vi.fn();
      await expect(run.wait({
        onEvent: (event) => { events.push(event); },
        onWireEvent: (wire) => { wireEvents.push(wire); },
        onScreenshot,
      })).resolves.toMatchObject({ status: "succeeded", output: "canonical" });
      expect(events.map((event) => event.type)).toEqual(["progress", "done"]);
      expect(events[0].data).toBe("Screenshot unavailable");
      expect(events[0].raw).toBe(wireEvents[0]);
      expect(wireEvents[0].data).toMatchObject({ data: payload });
      expect(onScreenshot).not.toHaveBeenCalled();
      expect(calls.map((call) => call.method)).toEqual(["GET", "GET", "GET", "GET"]);
      expect(calls.at(-1)?.pathname).toMatch(/\/runs\/run_1\/artifacts$/);
    });

    it("retains undecodable screenshots without progress text in the raw stream", async () => {
      const payload = { screenshot_url: "data:image/jpeg,%" };
      const { client } = makeClient((call) => call.pathname.endsWith("/events")
        ? sseResponse(frame(1, "run.screenshot", payload) + frame(2, "run.completed", { terminal_reason: "done" }))
        : jsonResponse({ data: { run_id: "run_1", status: "succeeded", output: "canonical" } }));
      const run = await client.doAnything.attach("run_1", { token: TOKEN, capture: { screenshots } });
      const events: RunEvent[] = [];
      const wireEvents: RunEvent["raw"][] = [];
      const onScreenshot = vi.fn();
      await expect(run.wait({
        onEvent: (event) => { events.push(event); },
        onWireEvent: (wire) => { wireEvents.push(wire); },
        onScreenshot,
      })).resolves.toMatchObject({ status: "succeeded", output: "canonical" });
      expect(events.map((event) => event.type)).toEqual(["done"]);
      expect(wireEvents.map((wire) => wire.event)).toEqual(["run.screenshot", "run.completed"]);
      expect(wireEvents[0].data).toMatchObject({ data: payload });
      expect(onScreenshot).not.toHaveBeenCalled();
    });
  });
});

describe("run wait failure boundaries", () => {
  function makeRun(overrides: Partial<RunWireOps> = {}) {
    const ops: RunWireOps = {
      getDetail: vi.fn(async () => ({ status: "succeeded", output: "canonical" })),
      streamEvents: async function* () {
        yield {
          id: "1",
          event: "run.completed",
          data: { task_id: "run_1", data: { terminal_reason: "done", output: "lean" } },
        };
      },
      postAction: vi.fn(),
      cancel: vi.fn(),
      ...overrides,
    };
    return { run: new RunHandle(ops, { id: "run_1" }), ops };
  }

  afterEach(() => vi.useRealTimers());

  it.each(["done", "failed", "canceled"])(
    "preserves a detail read error after a %s terminal event",
    async (reason) => {
      const error = new QoniError("detail unavailable", { status: 503, retryable: true });
      const { run } = makeRun({
        getDetail: async () => { throw error; },
        streamEvents: async function* () {
          yield {
            event: "run.completed",
            data: { task_id: "run_1", data: { terminal_reason: reason, is_task_successful: false } },
          };
        },
      });
      await expect(run.wait()).rejects.toBe(error);
    },
  );

  it.each([{}, { status: "running" }, { status: "awaiting_input" }, { status: "running", terminal_reason: "done" }])(
    "does not invent success from a nonterminal detail %j",
    async (detail) => {
      const { run } = makeRun({ getDetail: async () => detail });
      await expect(run.wait()).rejects.toMatchObject({ code: "upstream.failed", retryable: true });
    },
  );

  it.each(["succeeded", "failed", "canceled"])("keeps canonical %s status and result fields", async (status) => {
    const detail = {
      status, output: "canonical", is_task_successful: false,
      terminal_reason: "canonical reason", total_cost_usd: "0.12",
    };
    const { run } = makeRun({ getDetail: async () => detail });
    await expect(run.wait()).resolves.toEqual({
      runId: "run_1", status, output: "canonical", isTaskSuccessful: false,
      terminalReason: "canonical reason", artifacts: [], raw: detail,
    });
  });

  it.each([
    ["done", "succeeded"], ["failed", "failed"], ["expired", "failed"], ["canceled", "canceled"],
  ])("accepts a canonical legacy terminal reason %s without status", async (terminalReason, status) => {
    const { run } = makeRun({ getDetail: async () => ({ terminal_reason: terminalReason }) });
    await expect(run.wait()).resolves.toMatchObject({ status, terminalReason });
  });

  it("settles using the terminal detail already read after a clean close", async () => {
    const detail = { status: "failed", output: "canonical", session_id: "sess_1" };
    const getDetail = vi.fn().mockResolvedValueOnce(detail).mockRejectedValue(new Error("read twice"));
    const { run } = makeRun({ getDetail, streamEvents: async function* () {} });
    await expect(run.wait()).resolves.toMatchObject({ status: "failed", raw: detail });
    expect(getDetail).toHaveBeenCalledTimes(1);
    expect(run.sessionRef).toEqual({ sessionId: "sess_1" });
  });

  it.each(["stream.heartbeat", "run.cost_update", "run.screenshot"])(
    "resumes cleanly closed streams after filtered %s frames",
    async (type) => {
      const cursors: Array<string | undefined> = [];
      const wireIds: Array<string | undefined> = [];
      const { run } = makeRun({
        getDetail: async () => ({ status: cursors.length < 3 ? "running" : "succeeded" }),
        streamEvents: async function* (opts) {
          cursors.push(opts.lastEventId);
          yield {
            id: String(cursors.length),
            event: cursors.length < 3 ? type : "run.completed",
            data: { task_id: "run_1", data: { screenshot_url: SCREENSHOT_DATA_URI } },
          };
        },
      });
      await expect(run.wait({ onWireEvent: (wire) => { wireIds.push(wire.id); } }))
        .resolves.toMatchObject({ status: "succeeded" });
      expect(cursors).toEqual([undefined, "1", "2"]);
      expect(wireIds).toEqual(["1", "2", "3"]);
    },
  );

  it("stops clean-close retries when no wire cursor advances", async () => {
    let streams = 0;
    const { run } = makeRun({
      getDetail: async () => ({ status: "running" }),
      streamEvents: async function* () { streams++; },
    });
    await expect(run.wait()).rejects.toMatchObject({ code: "upstream.failed", retryable: true });
    expect(streams).toBe(2);
  });

  it.each(["detail", "clean-close-detail", "artifacts", "callback", "wire-callback"])("bounds a pending %s by the wait deadline", async (stage) => {
    vi.useFakeTimers();
    const pending = () => new Promise<never>(() => {});
    const { run } = makeRun({
      ...(stage === "detail" || stage === "clean-close-detail" ? { getDetail: pending } : {}),
      ...(stage === "clean-close-detail" ? { streamEvents: async function* () {} } : {}),
      ...(stage === "artifacts" ? { listArtifacts: pending } : {}),
    });
    const outcome = run.wait({
      timeoutMs: 50,
      ...(stage === "callback" ? { onEvent: pending } : {}),
      ...(stage === "wire-callback" ? { onWireEvent: pending } : {}),
    })
      .then(() => "settled", (error: unknown) => error);
    await vi.advanceTimersByTimeAsync(51);
    expect(await Promise.race([outcome, Promise.resolve("pending")])).toBeInstanceOf(QoniTimeoutError);
  });

  it("does not continue settlement after a timed-out detail read finishes", async () => {
    vi.useFakeTimers();
    let finishDetail!: (detail: { status: string }) => void;
    const listArtifacts = vi.fn(async () => []);
    const { run } = makeRun({
      getDetail: () => new Promise((resolve) => { finishDetail = resolve; }),
      listArtifacts,
    });
    const outcome = run.wait({ timeoutMs: 50 }).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(51);
    expect(await outcome).toBeInstanceOf(QoniTimeoutError);
    finishDetail({ status: "succeeded" });
    await vi.advanceTimersByTimeAsync(0);
    expect(listArtifacts).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([false, true])("immediately removes abort listeners while detail never settles (timeout=%s)", async (timeout) => {
    vi.useFakeTimers();
    const controller = new AbortController();
    let waitSignal: AbortSignal | undefined;
    let detailStarted!: () => void;
    const started = new Promise<void>((resolve) => { detailStarted = resolve; });
    const { run, ops } = makeRun({
      getDetail: () => {
        detailStarted();
        return new Promise<never>(() => {});
      },
      streamEvents: async function* (opts) {
        waitSignal = opts.signal;
        yield { event: "run.completed", data: { task_id: "run_1", data: {} } };
      },
    });
    const outcome = run.wait({ signal: controller.signal, ...(timeout ? { timeoutMs: 50 } : {}) })
      .catch((error: unknown) => error);
    await started;
    expect(getEventListeners(waitSignal!, "abort").length).toBeGreaterThan(0);
    if (timeout) vi.advanceTimersByTime(51);
    else controller.abort(new Error("stop waiting"));
    expect(getEventListeners(waitSignal!, "abort")).toHaveLength(0);
    expect(getEventListeners(controller.signal, "abort")).toHaveLength(0);
    if (timeout) expect(await outcome).toBeInstanceOf(QoniTimeoutError);
    else expect(await outcome).toBe(controller.signal.reason);
    expect(ops.cancel).not.toHaveBeenCalled();
  });

  it.each((["doAnything", "webSearch", "deepResearch"] as const).flatMap((product) =>
    (product === "deepResearch"
      ? ["detail-headers", "detail-body", "artifact-headers", "artifact-body"]
      : ["detail-headers", "detail-body"]
    ).flatMap((stage) => [false, true].map((timeout) => ({ product, stage, timeout }))),
  ))("aborts $product $stage resources without subsequent requests (timeout=$timeout)",
    async ({ product, stage, timeout }) => {
      vi.useFakeTimers();
      const controller = new AbortController();
      const reason = new Error("stop waiting");
      let blockedCall: Captured | undefined;
      let blockedResponse: Response | undefined;
      let canceled = false;
      let completeRead!: () => void;
      let markStarted!: () => void;
      const started = new Promise<void>((resolve) => { markStarted = resolve; });
      let detailReads = 0;
      const { client, calls } = makeClient((call) => {
        if (call.pathname.endsWith("/events")) {
          return sseResponse(frame(1, "run.completed", { terminal_reason: "done" }));
        }
        const isArtifactRead = call.pathname.endsWith("/artifacts");
        if (!isArtifactRead) detailReads++;
        if (detailReads === 1) return jsonResponse({ data: { status: "running" } });
        const data = isArtifactRead ? { items: [] } : { status: "succeeded" };
        if (isArtifactRead !== stage.startsWith("artifact")) return jsonResponse({ data });
        blockedCall = call;
        const response = new Response(new ReadableStream<Uint8Array>({
          start(body) {
            body.enqueue(new TextEncoder().encode('{"data":'));
            completeRead = () => {
              if (canceled) return;
              body.enqueue(new TextEncoder().encode(JSON.stringify(data) + "}"));
              body.close();
            };
          },
          cancel() { canceled = true; },
        }));
        blockedResponse = response;
        markStarted();
        if (stage.endsWith("headers")) {
          return new Promise<Response>((resolve) => { completeRead = () => resolve(response); });
        }
        return response;
      });
      const run = await client[product].attach("run_1", { token: TOKEN });
      const outcome = run.wait({ signal: controller.signal, ...(timeout ? { timeoutMs: 50 } : {}) })
        .catch((error: unknown) => error);
      await started;
      await vi.advanceTimersByTimeAsync(0);
      const requestCount = calls.length;
      if (timeout) await vi.advanceTimersByTimeAsync(51);
      else controller.abort(reason);
      if (timeout) expect(await outcome).toBeInstanceOf(QoniTimeoutError);
      else expect(await outcome).toBe(reason);
      expect(blockedCall?.signal?.aborted).toBe(true);
      expect(calls).toHaveLength(requestCount);
      completeRead();
      await vi.advanceTimersByTimeAsync(0);
      expect(canceled).toBe(true);
      expect(blockedResponse?.body?.locked).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
      expect(calls).toHaveLength(requestCount);
      expect(calls.every((call) => call.method === "GET")).toBe(true);
    },
  );

  it.each([200, 503].flatMap((status) => ["application/json", "application/x-ndjson"].map((contentType) => ({ status, contentType }))))(
    "bounds stalled HTTP $status $contentType bodies by the request timeout",
    async ({ status, contentType }) => {
      vi.useFakeTimers();
      let requestSignal: AbortSignal | null | undefined;
      const cancel = vi.fn();
      const response = new Response(new ReadableStream<Uint8Array>({
        start(body) { body.enqueue(new TextEncoder().encode('{"data":')); },
        cancel,
      }), { status, headers: { "content-type": contentType } });
      const { client, calls } = makeClient((call) => {
        requestSignal = call.signal;
        return response;
      }, { timeoutMs: 50 });
      const outcome = client.webSearch.attach("run_1", { token: TOKEN }).catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(51);
      expect(await Promise.race([outcome, Promise.resolve("pending")])).toBeInstanceOf(QoniTimeoutError);
      expect(requestSignal?.aborted).toBe(true);
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(response.body?.locked).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
      expect(calls).toHaveLength(1);
    },
  );

  it("times out reconnect backoff even when a telemetry callback returns a pending promise", async () => {
    vi.useFakeTimers();
    const { client, calls } = makeClient((call) => call.pathname.endsWith("/events")
      ? jsonResponse({}, { status: 503 })
      : jsonResponse({ data: { status: "running" } }));
    const run = await client.webSearch.attach("run_1", { token: TOKEN });
    const onReconnect = vi.fn(() => new Promise<never>(() => {}));
    const outcome = run.wait({ timeoutMs: 50, onReconnect }).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(51);
    expect(await outcome).toBeInstanceOf(QoniTimeoutError);
    expect(onReconnect).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(calls).toHaveLength(2);
    expect(calls.every((call) => call.method === "GET")).toBe(true);
  });

  it("times out and releases a stalled binary artifact download", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const response = new Response(new ReadableStream<Uint8Array>({
      start(body) { body.enqueue(new Uint8Array([1, 2, 3])); },
      cancel,
    }));
    const { client, calls } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) return sseResponse(frame(1, "run.completed", {}));
      if (call.pathname.endsWith("/artifacts/art_1")) return response;
      if (call.pathname.endsWith("/artifacts")) return jsonResponse({ data: { items: [{ id: "art_1" }] } });
      return jsonResponse({ data: { status: "succeeded" } });
    }, { timeoutMs: 50 });
    const run = await client.deepResearch.attach("run_1", { token: TOKEN });
    const result = await run.wait();
    const outcome = result.artifacts[0].content().catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(51);
    expect(await Promise.race([outcome, Promise.resolve("pending")])).toBeInstanceOf(QoniTimeoutError);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(calls.every((call) => call.method === "GET")).toBe(true);
  });

  it("propagates body read failures rather than returning an empty detail", async () => {
    const error = new Error("body disconnected");
    const response = new Response(new ReadableStream<Uint8Array>({
      start(body) { body.error(error); },
    }));
    const { client } = makeClient(() => response);
    await expect(client.webSearch.attach("run_1", { token: TOKEN })).rejects.toBe(error);
    expect(response.body?.locked).toBe(false);
  });

  it("times out fetching headers and cancels a late response without starting another GET", async () => {
    vi.useFakeTimers();
    let deliver!: (response: Response) => void;
    const cancel = vi.fn();
    const { client, calls } = makeClient(() => new Promise<Response>((resolve) => { deliver = resolve; }), { timeoutMs: 50 });
    const outcome = client.webSearch.attach("run_1", { token: TOKEN }).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(51);
    expect(await Promise.race([outcome, Promise.resolve("pending")])).toBeInstanceOf(QoniTimeoutError);
    expect(calls[0].signal?.aborted).toBe(true);
    deliver(new Response(new ReadableStream<Uint8Array>({ cancel })));
    await vi.advanceTimersByTimeAsync(0);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("times out a stalled discovery JSON body before issuing a run request", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const fetchMock = vi.fn(async () => new Response(new ReadableStream<Uint8Array>({ cancel })));
    const client = new Qoni({
      accessKey: "ak_test", secretKey: "sk_test", host: "https://qoni.example.com",
      timeoutMs: 50, fetch: fetchMock as typeof fetch,
    });
    const outcome = client.webSearch.attach("run_1", { token: TOKEN }).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(51);
    expect(await Promise.race([outcome, Promise.resolve("pending")])).toBeInstanceOf(QoniTimeoutError);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("propagates a synchronous reconnect callback error without retrying or creating a task", async () => {
    const error = new Error("telemetry failed");
    const { client, calls } = makeClient((call) => call.pathname.endsWith("/events")
      ? jsonResponse({}, { status: 503 })
      : jsonResponse({ data: { status: "running" } }));
    const run = await client.webSearch.attach("run_1", { token: TOKEN });
    await expect(run.wait({ onReconnect: () => { throw error; } })).rejects.toBe(error);
    expect(calls).toHaveLength(2);
    expect(calls.every((call) => call.method === "GET")).toBe(true);
  });

  it.each([false, true])("releases wait timers and abort listeners on exit (failure=%s)", async (fails) => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const { run } = makeRun();
    const error = new Error("callback failed");
    const outcome = run.wait({
      timeoutMs: 60_000,
      signal: controller.signal,
      onEvent: () => { if (fails) throw error; },
    });
    if (fails) await expect(outcome).rejects.toBe(error);
    else await expect(outcome).resolves.toMatchObject({ status: "succeeded" });
    expect(vi.getTimerCount()).toBe(0);
    expect(getEventListeners(controller.signal, "abort")).toHaveLength(0);
  });

  it("preserves caller abort reasons while reading terminal detail", async () => {
    const controller = new AbortController();
    const reason = new Error("caller stopped waiting");
    const { run } = makeRun({
      getDetail: async () => {
        controller.abort(reason);
        return { status: "succeeded" };
      },
    });
    await expect(run.wait({ signal: controller.signal })).rejects.toBe(reason);
  });

  it.each(["doAnything", "webSearch", "deepResearch"] as const)(
    "%s attach propagates lookup errors without opening SSE",
    async (product) => {
      const { client, calls } = makeClient(() => jsonResponse({ detail: "not found" }, { status: 404 }));
      await expect(client[product].attach("run_1", { token: TOKEN })).rejects.toMatchObject({ status: 404 });
      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("GET");
    },
  );

  it.each([401, 403, 404, 503])("attach then wait preserves terminal detail HTTP %s", async (status) => {
    let detailReads = 0;
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(frame(1, "run.completed", { terminal_reason: "done" }));
      }
      detailReads++;
      return detailReads === 1
        ? jsonResponse({ data: { status: "running" } })
        : jsonResponse({ detail: { message: "detail unavailable", requestId: "req_test" } }, { status });
    });
    const run = await client.webSearch.attach("run_1", { token: TOKEN });
    await expect(run.wait()).rejects.toMatchObject({ status, requestId: "req_test" });
  });
});

// ---------------------------------------------------------------------------
// delegateToken: products sugar, agent default, local scope pre-validation
// ---------------------------------------------------------------------------

describe("delegateToken semantic enhancements", () => {
  it("expands products to the product scope sets, merges explicit scopes, defaults agent to sdk", async () => {
    const { client, calls } = makeClient(() =>
      jsonResponse({
        data: { token: "t", tokenType: "Bearer", expiresIn: 3600, grantId: "g", auditId: "a" },
      }),
    );

    await client.delegateToken({
      user: { id: "user_1" },
      products: ["doAnything", "track"],
      scopes: ["gumem.memory:read"],
    });

    const body = calls.find((c) => c.pathname.endsWith("/delegations"))?.body as {
      agent: string;
      scopes: string[];
    };
    expect(body.agent).toBe("sdk");
    expect([...body.scopes].sort()).toEqual(
      [
        "webagent.do_anything:read",
        "webagent.do_anything:manage",
        "webagent.track:read",
        "webagent.track:manage",
        "gumem.memory:read",
      ].sort(),
    );
    expect((body as Record<string, unknown>).products).toBeUndefined();
  });

  it("rejects a scope missing its service prefix BEFORE any request, naming the correct form", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: {} }));

    await expect(
      client.delegateToken({ user: { id: "user_1" }, scopes: ["do_anything:manage"] }),
    ).rejects.toMatchObject({
      name: "QoniValidationError",
      message: expect.stringContaining("webagent.do_anything:manage"),
    });
    expect(calls).toHaveLength(0); // failed locally — nothing hit the wire
  });

  it("rejects malformed scopes locally but lets well-formed unknown scopes through", async () => {
    const { client, calls } = makeClient(() =>
      jsonResponse({
        data: { token: "t", tokenType: "Bearer", expiresIn: 3600, grantId: "g", auditId: "a" },
      }),
    );

    await expect(
      client.delegateToken({ user: { id: "user_1" }, scopes: ["not a scope"] }),
    ).rejects.toBeInstanceOf(QoniValidationError);
    expect(calls).toHaveLength(0);

    // Forward-compat: the server is the authority on newly added scopes.
    await client.delegateToken({ user: { id: "user_1" }, scopes: ["webagent.new_thing:zap"] });
    expect(calls).toHaveLength(1);
  });

  it("requires at least one of scopes / products", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: {} }));
    await expect(client.delegateToken({ user: { id: "user_1" } })).rejects.toBeInstanceOf(
      QoniValidationError,
    );
    expect(calls).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// doAnything RunHandle
// ---------------------------------------------------------------------------

describe("doAnything.run → RunHandle", () => {
  it("creates the run in one call and maps every knob onto the single create body", async () => {
    const { client, calls } = makeClient(() =>
      jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "pending" } }),
    );

    const run = await client.doAnything.run({
      token: TOKEN,
      prompt: "open the docs",
      profileId: "profile_1",
      limits: { maxDurationMinutes: 7 },
      capture: { screenshots: true },
    });

    expect(run.id).toBe("run_1");
    // The create response IS the run envelope — session_id is the reuse handle.
    expect(run.sessionRef).toEqual({ sessionId: "sess_1" });

    expect(calls.map((c) => `${c.method} ${c.pathname}`)).toEqual([
      "POST /api/v1/projects/tenant_1/do_anything/runs",
    ]);
    // Exact body: no session create call, no write-time `stream` subscription.
    expect(calls[0].body).toEqual({
      instructions: "open the docs",
      profile_id: "profile_1",
      max_duration_minutes: 7,
    });
  });

  it("capture.screenshots flips read-time filtering on the events stream", async () => {
    const { client, calls } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(frame(1, "run.completed", { terminal_reason: "done" }));
      }
      return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1" } });
    });

    const withoutCapture = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    for await (const event of withoutCapture.events()) void event;
    expect(calls.at(-1)?.url).toContain("include_screenshots=false");

    const withCapture = await client.doAnything.run({
      token: TOKEN,
      prompt: "go",
      capture: { screenshots: true },
    });
    for await (const event of withCapture.events()) void event;
    expect(calls.at(-1)?.url).not.toContain("include_screenshots");
  });

  it("run({ session }) creates a follow-up run via session_id in the create body", async () => {
    const { client, calls } = makeClient(() =>
      jsonResponse({ data: { run_id: "run_2", session_id: "sess_prior" } }),
    );

    const run = await client.doAnything.run({
      token: TOKEN,
      prompt: "follow up",
      session: { sessionId: "sess_prior" },
    });

    expect(run.id).toBe("run_2");
    expect(run.sessionRef).toEqual({ sessionId: "sess_prior" });
    expect(calls.map((c) => `${c.method} ${c.pathname}`)).toEqual([
      "POST /api/v1/projects/tenant_1/do_anything/runs",
    ]);
    expect(calls[0].body).toEqual({ instructions: "follow up", session_id: "sess_prior" });
  });

  it("fails loudly on platform-decided knobs the wire create body cannot carry", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: { run_id: "run_1" } }));

    for (const options of [
      { proxyCountryCode: "US" },
      { model: "some-model" },
      { callbackUrl: "https://app.example.com/hook" },
    ]) {
      await expect(
        client.doAnything.run({ token: TOKEN, prompt: "go", ...options }),
      ).rejects.toBeInstanceOf(QoniValidationError);
    }
    expect(calls).toHaveLength(0); // rejected locally — nothing was silently dropped
  });

  it("normalizes events: semantic types, camelCase data, raw escape hatch, terminal auto-end", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(
          frame(1, "run.status_changed", { status: "running" }) +
            frame(2, "run.action.started", { kind: "navigate", target_url: "https://x.dev" }) +
            frame(3, "run.cost_update", { total_cost_usd: "0.10" }) +
            frame(4, "run.take_control_pending", { live_url: "https://live" }) +
            frame(5, "run.completed", { terminal_reason: "done", output: "hi" }) +
            // After-terminal frame must never be yielded.
            frame(6, "run.action.started", { kind: "click" }),
        );
      }
      return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1" } });
    });

    const run = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    const events: RunEvent[] = [];
    for await (const event of run.events()) events.push(event);

    expect(events.map((e) => e.type)).toEqual([
      "progress", // run.status_changed → note = status ("running")
      "progress", // run.action.started → note = kind ("navigate")
      // run.cost_update + run.take_control_pending → empty note → DROPPED
      "done", // run.completed → single terminal "done"
    ]);
    expect(events.map((e) => e.isTerminal)).toEqual([false, false, true]);
    // action.started folds to progress; data IS the line — here the action kind.
    expect(events[1].data).toBe("navigate");
    expect(events[1].runId).toBe("run_1");
    expect(events[1].at).toBe("2026-06-12T08:00:02+00:00");
    // Raw escape hatch keeps the wire envelope intact.
    expect((events[1].raw.data as { data: { target_url: string } }).data.target_url).toBe(
      "https://x.dev",
    );
    const terminal = events[2];
    expect(terminal.type).toBe("done");
    if (terminal.type === "done") expect(terminal.data.terminalReason).toBe("done");
  });

  it("exposes every wire frame to observability callbacks before semantic filtering", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(
          frame(1, "run.cost_update", { total_cost_usd: "0.10" }) +
            frame(2, "run.action.started", {
              action_id: "action_1",
              kind: "agent_core.bash",
              params: { command: "browser-harness run browser-tools/task.py" },
            }) +
            frame(3, "run.completed", { terminal_reason: "done", output: "ok" }),
        );
      }
      if (call.method === "GET" && call.pathname.endsWith("/runs/run_1")) {
        return jsonResponse({
          data: { run_id: "run_1", session_id: "sess_1", status: "succeeded", output: "ok" },
        });
      }
      return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1" } });
    });

    const run = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    const wireTypes: string[] = [];
    const semanticTypes: string[] = [];
    await run.wait({
      onWireEvent: (event) => {
        const envelope = event.data as { type?: string };
        wireTypes.push(event.event || envelope.type || "");
      },
      onEvent: (event) => {
        semanticTypes.push(event.type);
      },
    });

    expect(wireTypes).toEqual([
      "run.cost_update", // semantically empty but still required in the raw trace
      "run.action.started",
      "run.completed",
    ]);
    expect(semanticTypes).toEqual(["progress", "done"]);
  });

  it("decodes screenshot data URIs into event.image and filters them without capture", async () => {
    const sse =
      frame(1, "run.screenshot", {
        screenshot_url: SCREENSHOT_DATA_URI,
        page_url: "https://x.dev/page",
        step: 3,
      }) + frame(2, "run.completed", { terminal_reason: "done" });
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) return sseResponse(sse);
      return jsonResponse({ data: { run_id: "run_1" } });
    });

    const withCapture = await client.doAnything.run({
      token: TOKEN,
      prompt: "go",
      capture: { screenshots: true },
    });
    const seen: RunEvent[] = [];
    for await (const event of withCapture.events()) seen.push(event);
    expect(seen[0].type).toBe("screenshot");
    if (seen[0].type !== "screenshot") throw new Error("unreachable");
    expect(Buffer.from(seen[0].image.bytes)).toEqual(IMAGE_BYTES);
    expect(seen[0].image.mime).toBe("image/jpeg");
    expect(seen[0].image.pageUrl).toBe("https://x.dev/page");
    expect(seen[0].image.step).toBe(3);

    const withoutCapture = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    const types: string[] = [];
    for await (const event of withoutCapture.events()) types.push(event.type);
    expect(types).toEqual(["done"]); // screenshot filtered out
  });

  it("folds internal events into progress; surfaces headline types + done", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(
          frame(1, "run.phase_changed", { to_phase: "gather" }) + // → phase
            frame(2, "run.section_completed", { title: "intro" }) + // → sectionReady
            frame(3, "search.results_ready", { total_unique_results: 3 }) + // → resultsReady
            frame(4, "run.completed", { terminal_reason: "done", output: "ok" }),
        );
      }
      if (call.method === "GET" && call.pathname.endsWith("/runs/run_1")) {
        return jsonResponse({ data: { run_id: "run_1", status: "succeeded", output: "ok" } });
      }
      return jsonResponse({ data: { run_id: "run_1" } });
    });

    const run = await client.deepResearch.run({ token: TOKEN, prompt: "x" });
    const events: RunEvent[] = [];
    let doneOutput: unknown;
    await run.wait({
      onEvent: (e) => {
        events.push(e);
        if (e.type === "done") doneOutput = e.data.output;
      },
    });
    expect(events.map((e) => e.type)).toEqual(["phase", "sectionReady", "resultsReady", "done"]);
    expect(doneOutput).toBe("ok");
  });

  it("demotes sub-run terminal events to progress so they never end the stream", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(
          // `summary` gives the demoted sub-run progress a non-empty note so it
          // survives the empty-progress filter (proving it became progress, not
          // a terminal that ends the stream).
          frame(1, "run.completed", { terminal_reason: "done", summary: "sub done" }, { task_id: "sub_1" }) +
            frame(2, "run.completed", { terminal_reason: "done" }, { task_id: "run_1" }),
        );
      }
      return jsonResponse({ data: { run_id: "run_1" } });
    });

    const run = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    const events: RunEvent[] = [];
    for await (const event of run.events()) events.push(event);
    expect(events.map((e) => [e.type, e.runId])).toEqual([
      ["progress", "sub_1"],
      ["done", "run_1"],
    ]);
  });

  it("wait() drives callbacks and settles from the run detail envelope", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(
          frame(1, "run.interaction", {
            id: "ix_1",
            type: "clarification",
            status: "pending",
            created_at: "2026-06-12T08:00:01+00:00",
            title: "Which size?",
            question: "Which screen size?",
            actions: [
              {
                kind: "answer",
                label: "Answer",
                method: "POST",
                endpoint: "/do_anything/runs/run_1/interactions/ix_1/answer",
              },
            ],
          }) +
            frame(2, "run.screenshot", { screenshot_url: SCREENSHOT_DATA_URI, step: 1 }) +
            frame(3, "run.completed", { terminal_reason: "done", output: "lean" }),
        );
      }
      if (call.method === "GET" && call.pathname.endsWith("/runs/run_1")) {
        return jsonResponse({
          data: {
            run_id: "run_1",
            session_id: "sess_1",
            status: "succeeded",
            output: "the full answer",
            total_cost_usd: "0.42",
          },
        });
      }
      return jsonResponse({ data: { run_id: "run_1", session_id: "sess_1" } });
    });

    const run = await client.doAnything.run({
      token: TOKEN,
      prompt: "go",
      capture: { screenshots: true },
    });
    const shots: Array<{ index: number; bytes: number }> = [];
    const interactions: Array<{ id: string; type: string; canAnswer: boolean }> = [];
    const result = await run.wait({
      onScreenshot: (image, index) => {
        shots.push({ index, bytes: image.bytes.length });
      },
      onInteraction: (interaction) => {
        interactions.push({
          id: interaction.id,
          type: interaction.type,
          canAnswer: interaction.can("answer"),
        });
      },
    });

    expect(shots).toEqual([{ index: 0, bytes: IMAGE_BYTES.length }]);
    expect(interactions).toEqual([{ id: "ix_1", type: "clarification", canAnswer: true }]);
    expect(result.status).toBe("succeeded");
    expect(result.output).toBe("the full answer"); // settled from detail, not the lean event
    expect(result.artifacts).toEqual([]);
    expect(result.raw.total_cost_usd).toBe("0.42");
  });

  it("events() auto-reconnects with Last-Event-ID after a dropped stream", async () => {
    let eventsCall = 0;
    const lastEventIds: Array<string | undefined> = [];
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        eventsCall += 1;
        lastEventIds.push(call.headers["last-event-id"]);
        if (eventsCall === 1) {
          let pulls = 0;
          const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
              pulls += 1;
              if (pulls === 1) {
                controller.enqueue(
                  new TextEncoder().encode(frame(1, "run.action.started", { kind: "navigate" })),
                );
              } else {
                controller.error(new Error("ECONNRESET"));
              }
            },
          });
          return new Response(stream, {
            status: 200,
            headers: { "content-type": "text/event-stream" },
          });
        }
        return sseResponse(frame(2, "run.completed", { terminal_reason: "done" }));
      }
      return jsonResponse({ data: { run_id: "run_1" } });
    });

    const run = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    const types: string[] = [];
    const reconnects: Array<{ attempt: number; lastEventId?: string }> = [];
    for await (const event of run.events({
      onReconnect: ({ attempt, lastEventId }) => reconnects.push({ attempt, lastEventId }),
    })) types.push(event.type);

    expect(types).toEqual(["progress", "done"]); // action.started folds to progress
    expect(eventsCall).toBe(2);
    expect(lastEventIds).toEqual([undefined, "1"]); // resumed where we left off
    expect(reconnects).toEqual([{ attempt: 1, lastEventId: "1" }]);
  });

  it("cancel() is idempotent: a 4xx on an already-terminal run returns the terminal state", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/cancel")) {
        return jsonResponse(
          { detail: { code: "conflict", message: "run already terminal" } },
          { status: 409 },
        );
      }
      if (call.method === "GET" && call.pathname.endsWith("/runs/run_1")) {
        return jsonResponse({
          data: { run_id: "run_1", session_id: "sess_1", status: "succeeded", output: "done" },
        });
      }
      return jsonResponse({ data: { run_id: "run_1" } });
    });

    const run = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    const status = await run.cancel("no longer needed");
    expect(status.status).toBe("succeeded");
  });

  it("cancel() still throws on permission errors", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/cancel")) {
        return jsonResponse(
          { detail: { code: "permission_denied", message: "missing scope" } },
          { status: 403 },
        );
      }
      return jsonResponse({ data: { run_id: "run_1" } });
    });

    const run = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    await expect(run.cancel()).rejects.toBeInstanceOf(QoniPermissionDeniedError);
  });

  it("interaction action methods post to the action's declared endpoint", async () => {
    const posts: Array<{ method: string; pathname: string; body: unknown }> = [];
    const { client } = makeClient((call) => {
      if (call.pathname.includes("/interactions/")) {
        posts.push({ method: call.method, pathname: call.pathname, body: call.body });
        return jsonResponse({ data: { ok: true } });
      }
      if (call.pathname.endsWith("/events")) {
        return sseResponse(
          frame(1, "run.interaction", {
            id: "ix_1",
            type: "clarification",
            status: "pending",
            created_at: "2026-06-12T08:00:01+00:00",
            title: "Pick one",
            question: "Which button?",
            actions: [
              {
                kind: "answer",
                label: "Answer",
                method: "POST",
                endpoint: "/do_anything/runs/run_1/interactions/ix_1/answer",
              },
              {
                kind: "skip",
                label: "Skip",
                method: "POST",
                endpoint: "/do_anything/runs/run_1/interactions/ix_1/skip",
              },
            ],
          }) + frame(2, "run.completed", { terminal_reason: "done" }),
        );
      }
      return jsonResponse({ data: { run_id: "run_1" } });
    });

    const run = await client.doAnything.run({ token: TOKEN, prompt: "go" });
    let handle: Awaited<ReturnType<typeof run.interactionHandle>> | undefined;
    for await (const event of run.events()) {
      if (event.type === "interaction") {
        handle = run.interactionHandle(event.data);
      }
    }
    if (!handle) throw new Error("expected an interaction event");

    await handle.answer("use the blue button");
    await handle.skip();
    // The interaction did NOT declare a confirm action — calling it must throw,
    // not silently post (closes off "dead recovery affordances").
    expect(handle.can("confirm")).toBe(false);
    await expect(handle.confirm()).rejects.toBeInstanceOf(QoniValidationError);

    expect(posts).toEqual([
      {
        method: "POST",
        pathname: "/api/v1/projects/tenant_1/do_anything/runs/run_1/interactions/ix_1/answer",
        body: { response: "use the blue button" },
      },
      {
        method: "POST",
        pathname: "/api/v1/projects/tenant_1/do_anything/runs/run_1/interactions/ix_1/skip",
        body: undefined,
      },
    ]);
  });

  it("attach() resolves by run id alone, verifies the run, and adopts its sessionRef", async () => {
    const { client, calls } = makeClient(() =>
      jsonResponse({ data: { run_id: "run_1", session_id: "sess_1", status: "running" } }),
    );

    const run = await client.doAnything.attach("run_1", { token: TOKEN });
    expect(run.id).toBe("run_1");
    expect(run.sessionRef).toEqual({ sessionId: "sess_1" }); // adopted from the detail
    expect(calls.map((c) => `${c.method} ${c.pathname}`)).toEqual([
      "GET /api/v1/projects/tenant_1/do_anything/runs/run_1",
    ]);

    // A caller that still holds a sessionRef may pass it — accepted, not required.
    const withSession = await client.doAnything.attach("run_1", {
      token: TOKEN,
      session: { sessionId: "sess_1" },
    });
    expect(withSession.sessionRef).toEqual({ sessionId: "sess_1" });
  });
});

// ---------------------------------------------------------------------------
// webSearch RunHandle
// ---------------------------------------------------------------------------

describe("webSearch.run → RunHandle", () => {
  it("maps query sugar to queries and returns a handle", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: { run_id: "ws_1" } }));

    const run = await client.webSearch.run({ token: TOKEN, prompt: "qoni sdk" });
    expect(run.id).toBe("ws_1");
    expect(calls[0].body).toEqual({ queries: ["qoni sdk"] });
  });

  it("attach() verifies the run and adopts its sessionRef from the detail", async () => {
    const { client } = makeClient(() =>
      jsonResponse({ data: { run_id: "ws_1", session_id: "sess_ws", status: "running" } }),
    );
    const run = await client.webSearch.attach("ws_1", { token: TOKEN });
    expect(run.sessionRef).toEqual({ sessionId: "sess_ws" });
  });

  it("an interaction action fails loudly — webSearch runs never request interaction", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: { run_id: "ws_1" } }));
    const run = await client.webSearch.run({ token: TOKEN, prompt: "x" });
    const before = calls.length;
    // Synthetic interaction (webSearch never emits one) — invoking its action
    // surfaces a clean error rather than a confusing 404.
    const handle = run.interactionHandle({
      id: "ix_x",
      type: "clarification",
      status: "pending",
      createdAt: "2026-06-12T08:00:01+00:00",
      title: "t",
      actions: [
        { kind: "answer", label: "Answer", method: "POST", endpoint: "/web_search/runs/ws_1/x" },
      ],
      payload: { question: "?" },
    });
    await expect(handle.answer("answer")).rejects.toBeInstanceOf(QoniError);
    expect(calls.length).toBe(before); // failed locally, no wire call
  });
});

// ---------------------------------------------------------------------------
// deepResearch RunHandle
// ---------------------------------------------------------------------------

describe("deepResearch.run → RunHandle", () => {
  it("maps limits and session reuse onto the wire create body", async () => {
    const { client, calls } = makeClient(() => jsonResponse({ data: { run_id: "dr_2" } }));

    const run = await client.deepResearch.run({
      token: TOKEN,
      prompt: "battery recycling, 2026 update",
      limits: { maxDurationMinutes: 120 },
      session: { sessionId: "sess_dr" }, // follow-up run in an existing session
    });

    expect(run.id).toBe("dr_2");
    expect(run.sessionRef).toEqual({ sessionId: "sess_dr" });
    expect(calls[0].body).toEqual({
      topic: "battery recycling, 2026 update",
      max_duration_minutes: 120,
      session_id: "sess_dr",
    });
  });

  it("a confirmation interaction's confirm() posts to its declared endpoint", async () => {
    const posts: Array<{ pathname: string; body: unknown }> = [];
    const { client } = makeClient((call) => {
      if (call.pathname.includes("/interactions/")) {
        posts.push({ pathname: call.pathname, body: call.body });
        return jsonResponse({ data: { ok: true } });
      }
      return jsonResponse({ data: { run_id: "dr_1" } });
    });

    const run = await client.deepResearch.run({ token: TOKEN, prompt: "t" });
    const handle = run.interactionHandle({
      id: "ix_dr",
      type: "confirmation",
      status: "pending",
      createdAt: "2026-06-12T08:00:01+00:00",
      title: "Approve outline?",
      actions: [
        {
          kind: "confirm",
          label: "Approve",
          method: "POST",
          endpoint: "/deep_research/runs/dr_1/interactions/ix_dr/confirm",
        },
      ],
      payload: { summary: "outline" },
    });
    await handle.confirm();

    expect(posts).toEqual([
      {
        pathname: "/api/v1/projects/tenant_1/deep_research/runs/dr_1/interactions/ix_dr/confirm",
        body: undefined,
      },
    ]);
  });

  it("wait() populates result.artifacts with lazy content fetching", async () => {
    const { client, calls } = makeClient((call) => {
      if (call.pathname.endsWith("/events")) {
        return sseResponse(frame(1, "run.completed", { terminal_reason: "done" }));
      }
      if (call.pathname.endsWith("/artifacts")) {
        return jsonResponse({
          data: {
            run_id: "dr_1",
            items: [
              {
                id: "art_1",
                name: "report.md",
                mime_type: "text/markdown",
                size_bytes: 5,
                created_at: "2026-06-12T08:01:00+00:00",
              },
            ],
          },
        });
      }
      if (call.pathname.endsWith("/artifacts/art_1")) {
        return new Response("hello", {
          status: 200,
          headers: { "content-type": "text/markdown" },
        });
      }
      if (call.method === "GET" && call.pathname.endsWith("/runs/dr_1")) {
        return jsonResponse({
          data: { run_id: "dr_1", session_id: "sess_dr", status: "succeeded", result: "report" },
        });
      }
      return jsonResponse({ data: { run_id: "dr_1" } });
    });

    const run = await client.deepResearch.run({ token: TOKEN, prompt: "t" });
    const result = await run.wait();

    expect(result.status).toBe("succeeded");
    expect(result.output).toBe("report"); // DR wire names it `result`
    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0]).toMatchObject({
      id: "art_1",
      name: "report.md",
      mime: "text/markdown",
      sizeBytes: 5,
    });
    // Content is lazy: nothing fetched the blob yet.
    expect(calls.some((c) => c.pathname.endsWith("/artifacts/art_1"))).toBe(false);
    const bytes = await result.artifacts[0].content();
    expect(Buffer.from(bytes).toString("utf8")).toBe("hello");
    expect(calls.at(-1)?.pathname).toBe(
      "/api/v1/projects/tenant_1/deep_research/runs/dr_1/artifacts/art_1",
    );
  });
});

// ---------------------------------------------------------------------------
// track MonitorHandle
// ---------------------------------------------------------------------------

describe("track.create → MonitorHandle", () => {
  function monitorClient() {
    const harness = makeClient((call) => {
      if (call.pathname.endsWith("/track/monitors") && call.method === "POST") {
        return jsonResponse({ data: { id: "mon_1", status: "active" } });
      }
      if (call.pathname.endsWith("/monitors/mon_1/events")) {
        return sseResponse(
          frame(1, "run.status_changed", { status: "running" }, { task_id: "tick_1" }) +
            frame(2, "run.completed", { terminal_reason: "done" }, { task_id: "tick_1" }),
        );
      }
      if (call.pathname.endsWith("/monitors/mon_1/runs")) {
        return jsonResponse({
          data: {
            items: [
              { run_id: "tick_1", status: "succeeded", started_at: "2026-06-12T08:00:00+00:00" },
            ],
            total: 1,
          },
        });
      }
      if (call.pathname.endsWith("/monitors/mon_1/runs/tick_1")) {
        return jsonResponse({ data: { run_id: "tick_1", status: "succeeded" } });
      }
      return jsonResponse({ data: { id: "mon_1", check_interval_minutes: 30 } });
    });
    return harness;
  }

  it("create() snakeifies the definition and returns a handle with the id", async () => {
    const { client, calls } = monitorClient();
    const monitor = await client.track.create({
      token: TOKEN,
      prompt: "monitor the pricing page for changes",
      url: "https://eazo.ai/pricing",
      checkIntervalMinutes: 30,
    });
    expect(monitor.id).toBe("mon_1");
    expect(calls[0].body).toEqual({
      intent: "monitor the pricing page for changes",
      url: "https://eazo.ai/pricing",
      check_interval_minutes: 30,
    });
  });

  it("handle methods address the monitor without re-passing token or id", async () => {
    const { client, calls } = monitorClient();
    const monitor = await client.track.create({
      token: TOKEN,
      prompt: "monitor the page for changes",
      url: "https://eazo.ai",
    });

    const detail = await monitor.get();
    expect(detail.checkIntervalMinutes).toBe(30); // camelCase normalization

    await monitor.refine({ schedule: { kind: "interval", intervalSeconds: 3600 } });
    await monitor.runNow();
    await monitor.delete();

    expect(calls.slice(1).map((c) => `${c.method} ${c.pathname}`)).toEqual([
      "GET /api/v1/projects/tenant_1/track/monitors/mon_1",
      "PATCH /api/v1/projects/tenant_1/track/monitors/mon_1",
      "POST /api/v1/projects/tenant_1/track/monitors/mon_1/run_now",
      "DELETE /api/v1/projects/tenant_1/track/monitors/mon_1",
    ]);
    expect(calls[2].body).toEqual({
      action: "refine",
      patch: { schedule: { kind: "interval", interval_seconds: 3600 } },
    });
  });

  it("pause/resume/refine send the action-shaped PATCH body the backend FSM expects", async () => {
    const { client, calls } = monitorClient();
    const monitor = await client.track.create({
      token: TOKEN,
      prompt: "monitor the page for changes",
      url: "https://eazo.ai",
    });

    await monitor.pause();
    await monitor.resume();
    await monitor.refine({ targetUrls: ["https://eazo.ai/pricing"] });

    const patchBodies = calls.filter((c) => c.method === "PATCH").map((c) => c.body);
    expect(patchBodies).toEqual([
      { action: "pause" },
      { action: "resume" },
      { action: "refine", patch: { target_urls: ["https://eazo.ai/pricing"] } },
    ]);

    // A refine with nothing to change fails locally, before any request.
    const before = calls.length;
    await expect(monitor.refine({})).rejects.toMatchObject({ name: "QoniValidationError" });
    expect(calls.length).toBe(before);
  });

  it("a monitor interaction's action posts to its declared endpoint", async () => {
    const { client, calls } = monitorClient();
    const monitor = await client.track.create({
      token: TOKEN,
      prompt: "monitor the page for changes",
      url: "https://eazo.ai",
    });

    // monitor.needs_login surfaces as a site_login interaction on the stream;
    // confirmSignedIn() posts to the endpoint the backend declared.
    const handle = monitor.interactionHandle({
      id: "ix_m",
      type: "site_login",
      status: "active",
      createdAt: "2026-06-12T08:00:01+00:00",
      title: "Re-sign in",
      actions: [
        {
          kind: "confirm_signed_in",
          label: "I signed in",
          method: "POST",
          endpoint: "/track/monitors/mon_1/interactions/ix_m/confirm_signed_in",
        },
      ],
      payload: { sites: [], monitorId: "mon_1" },
    });
    await handle.confirmSignedIn();

    const action = calls.filter((c) => c.pathname.includes("/interactions/"));
    expect(action.map((c) => `${c.method} ${c.pathname}`)).toEqual([
      "POST /api/v1/projects/tenant_1/track/monitors/mon_1/interactions/ix_m/confirm_signed_in",
    ]);
  });

  it("runs() / run() expose read-only normalized tick runs", async () => {
    const { client, calls } = monitorClient();
    const monitor = await client.track.create({
      token: TOKEN,
      prompt: "monitor the page for changes",
      url: "https://eazo.ai",
    });

    const runs = await monitor.runs({ limit: 5 });
    expect(runs).toEqual([
      { id: "tick_1", runId: "tick_1", status: "succeeded", startedAt: "2026-06-12T08:00:00+00:00" },
    ]);
    expect(calls.at(-1)?.url).toContain("/monitors/mon_1/runs?limit=5");

    const single = await monitor.run("tick_1");
    expect(single).toEqual({ id: "tick_1", runId: "tick_1", status: "succeeded" });
    // Read-only views carry no operations.
    expect((single as Record<string, unknown>).cancel).toBeUndefined();
  });

  it("events() yields normalized events without auto-ending on tick run terminals", async () => {
    const { client } = monitorClient();
    const monitor = await client.track.create({
      token: TOKEN,
      prompt: "monitor the page for changes",
      url: "https://eazo.ai",
    });

    const types: string[] = [];
    for await (const event of monitor.events()) types.push(event.type);
    // The terminal `done` of a tick run is yielded, and the iterator only
    // ends because the mocked stream closes — not because of the terminal.
    // (status_changed folds into progress.)
    expect(types).toEqual(["progress", "done"]);
  });

  it("attach() verifies the monitor exists", async () => {
    const { client, calls } = monitorClient();
    const monitor = await client.track.attach("mon_1", { token: TOKEN });
    expect(monitor.id).toBe("mon_1");
    expect(calls.map((c) => `${c.method} ${c.pathname}`)).toEqual([
      "GET /api/v1/projects/tenant_1/track/monitors/mon_1",
    ]);
  });
});

// ---------------------------------------------------------------------------
// errors
// ---------------------------------------------------------------------------

describe("permission errors", () => {
  it("appends the known scope set to server permission errors", async () => {
    const { client } = makeClient(() =>
      jsonResponse(
        { detail: { code: "permission_denied", message: "missing scope" } },
        { status: 403 },
      ),
    );

    await expect(
      client.webSearch.api.get({ token: TOKEN, runId: "ws_1" }),
    ).rejects.toMatchObject({
      name: "QoniPermissionDeniedError",
      message: expect.stringContaining("Known scopes: gumem.session:create"),
    });
  });
});


describe("Do Anything durable artifacts", () => {
  it("returns files after attach, with signed links, refresh and binary content", async () => {
    const { client } = makeClient((call) => {
      if (call.pathname.endsWith("/download-url")) return jsonResponse({ download_url: "https://storage.example.test/file?sig=fresh", expires_in: 900 });
      if (call.pathname.endsWith("/blob")) return new Response("{}");
      if (call.pathname.endsWith("/artifacts")) return jsonResponse({ items: [{ id: "file-1", name: "result.json", mime_type: "application/json", size_bytes: 2, download_url: "https://storage.example.test/file?sig=initial", expires_in: 900 }] });
      if (call.pathname.endsWith("/events")) return sseResponse(frame(1, "run.completed", { terminal_reason: "done" }));
      if (call.pathname.endsWith("/runs/run_1")) return jsonResponse({ run_id: "run_1", session_id: "sess_1", status: "succeeded" });
      throw new Error("Unexpected request " + call.pathname);
    }, { emptyArtifacts: false });
    const run = await client.doAnything.attach("run_1", { token: TOKEN });
    const result = await run.wait();
    expect(result.artifacts).toHaveLength(1);
    const artifact = result.artifacts[0];
    expect(artifact.downloadUrl).toContain("sig=initial");
    expect(artifact.expiresIn).toBe(900);
    expect(Buffer.from(await artifact.content()).toString()).toBe("{}");
    expect(await artifact.refreshDownloadUrl!()).toContain("sig=fresh");
    expect(artifact.downloadUrl).toContain("sig=fresh");
    expect(await client.doAnything.artifacts({ token: TOKEN, runId: "run_1" })).toHaveLength(1);
  });
});
