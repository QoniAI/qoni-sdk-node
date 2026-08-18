/**
 * Per-function HTTP evidence recorder for the live e2e suite.
 *
 * DEFAULT OFF. It only activates when `QONI_LIVE_EVIDENCE_DIR` is set; with the
 * variable unset `createEvidenceRecorder()` returns `undefined`, `liveClient()`
 * passes no `fetch` override, and the suite behaves exactly as before.
 *
 * When on, it wraps the SDK's injectable `fetch` and appends one JSONL record
 * per real HTTP round-trip, tagged with the vitest test that caused it
 * (`expect.getState().currentTestName`). Attribution to a PUBLIC FUNCTION is
 * done afterwards by joining on that test name through
 * `tests/live-e2e/function-map.ts` — the recorder never guesses.
 *
 * Records are written in two phases because a WebAgent SSE body can stay open
 * for minutes:
 *   `{"kind":"call", ...}`  — emitted as soon as response headers arrive.
 *   `{"kind":"body", ...}`  — emitted when the body ends / is cancelled / errors.
 * The two are joined on `id`. If the process dies mid-stream the `call` record
 * still survives, which is the point.
 *
 * Every line goes through `serializeRedacted()`; see `redact.ts`.
 */

import fs from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import {
  createSecretLedger,
  normalizeKey,
  redactBody,
  redactHeaders,
  redactJsonishText,
  redactUrl,
  serializeRedacted,
  truncateText,
  type SecretLedger,
} from "./redact";

/** Environment variables whose VALUES are credentials on this deployment. */
const SECRET_ENV_VARS = [
  "QONI_ACCESS_KEY",
  "QONI_SECRET_KEY",
  "QONI_USER_ACCESS_TOKEN",
  "QONI_AGENT_ID",
  "QONI_LIVE_TEST_USER_PASSWORD",
  "GENAUTH_DEMO_USER_PASSWORD",
  "E2E_API_KEY",
  "E2E_OPS_ADMIN_EMAIL",
  "E2E_OPS_ADMIN_PASSWORD",
  "E2E_PROJECT_ID",
  "LT_API_KEY",
  "MONITOR_API_KEY_DEV",
  "PROVISION_OPS_ADMIN_EMAIL",
  "PROVISION_OPS_ADMIN_PASSWORD",
  "PROVISION_SIGNUP_EMAIL",
  "PROVISION_SIGNUP_PASSWORD",
] as const;

/** Environment variables whose values are deployment endpoints (host leak). */
const ENDPOINT_ENV_VARS = [
  "QONI_HOST",
  "QONI_BASE_URL",
  "QONI_WEBAGENT_BASE_URL",
  "E2E_BASE_URL",
  "LT_BASE_URL",
  "PROVISION_CONSOLE_URL",
  "PROVISION_OPS_URL",
  "HOSTNAME",
] as const;

export interface EvidenceRecorder {
  readonly dir: string;
  readonly file: string;
  /** Wrap the runtime `fetch` the SDK client will use. */
  wrapFetch(base: typeof fetch): typeof fetch;
  /** Teach the recorder which base URLs map to which stable alias. */
  registerHost(baseUrl: string | undefined, alias: string): void;
  callCount(): number;
}

let singleton: EvidenceRecorder | undefined | null = null;

/**
 * Process-wide recorder. `undefined` when `QONI_LIVE_EVIDENCE_DIR` is unset —
 * this is the "zero impact when off" contract.
 */
export function evidenceRecorder(): EvidenceRecorder | undefined {
  if (singleton !== null) return singleton ?? undefined;
  const dir = process.env.QONI_LIVE_EVIDENCE_DIR;
  singleton = dir ? createEvidenceRecorder(dir) : undefined;
  return singleton ?? undefined;
}

export function createEvidenceRecorder(dir: string): EvidenceRecorder {
  fs.mkdirSync(dir, { recursive: true });
  // One file per process: vitest runs each test file in its own worker, and
  // interleaved appends from several processes would corrupt lines.
  const file = path.join(dir, `http-calls.${process.pid}.jsonl`);
  fs.writeFileSync(file, "");

  const maxBodyChars = Number(process.env.QONI_LIVE_EVIDENCE_MAX_BODY_CHARS || 4000);
  const maxStreamChars = Number(process.env.QONI_LIVE_EVIDENCE_MAX_STREAM_CHARS || 8000);

  const ledger: SecretLedger = createSecretLedger([
    ...SECRET_ENV_VARS.map((name) => process.env[name]),
    ...ENDPOINT_ENV_VARS.map((name) => process.env[name]),
    process.env.USER,
    process.env.LOGNAME,
    process.env.HOME,
  ]);

  const hostAliases = new Map<string, string>();
  let seq = 0;
  let calls = 0;

  function registerHostAlias(baseUrl: string | undefined, alias: string): void {
    if (!baseUrl) return;
    try {
      const url = new URL(baseUrl);
      hostAliases.set(url.origin, alias);
      hostAliases.set(url.host, alias);
    } catch {
      /* not a URL — nothing to alias, but still worth learning below */
    }
    ledger.learn(baseUrl);
  }

  function write(record: Record<string, unknown>): void {
    fs.appendFileSync(file, `${serializeRedacted(record, ledger)}\n`);
  }

  function testContext(): { test: string | null; testFile: string | null } {
    try {
      const state = expect.getState();
      return {
        test: state.currentTestName || null,
        // basename only — the absolute path is an EC2 path.
        testFile: state.testPath ? path.basename(state.testPath) : null,
      };
    } catch {
      return { test: null, testFile: null };
    }
  }

  // `GET /api/v3/eak/runtime-config` answers with every downstream base URL.
  // Feeding those back in gives later records a meaningful `hostAlias` AND —
  // more importantly — teaches the ledger the real hostnames so they are
  // scrubbed everywhere else.
  function onEndpoint(key: string, value: string): void {
    const alias = normalizeKey(key)
      .replace(/(?:baseurl|baseuri|endpoint)$/, "")
      .replace(/^webagent$/, "webagent");
    registerHostAlias(value, alias || "service");
  }

  const redactOptions = { ledger, onEndpoint } as const;

  function decodeRequestBody(body: BodyInit | null | undefined): unknown {
    if (body === undefined || body === null) return undefined;
    if (typeof body === "string") {
      const { text, truncated, originalChars } = truncateText(body, maxBodyChars);
      if (!truncated) {
        try {
          return redactBody(JSON.parse(body) as unknown, redactOptions);
        } catch {
          /* fall through to text */
        }
      }
      return {
        ...(truncated ? { _truncated: true, _originalChars: originalChars } : {}),
        text: redactJsonishText(text, redactOptions),
      };
    }
    return `<non-string body: ${body.constructor?.name || typeof body}>`;
  }

  function decodeResponseBody(text: string, contentType: string, limit: number): unknown {
    const { text: clipped, truncated, originalChars } = truncateText(text, limit);
    if (/json/i.test(contentType) && !/ndjson/i.test(contentType) && !truncated) {
      try {
        return redactBody(JSON.parse(text) as unknown, redactOptions);
      } catch {
        /* fall through to text */
      }
    }
    // SSE / ndjson / oversized JSON: no object to walk, so redact by key in the
    // raw text before it is stored.
    return {
      ...(truncated ? { _truncated: true, _originalChars: originalChars } : {}),
      text: redactJsonishText(clipped, redactOptions),
    };
  }

  /**
   * Replace the response body with a pass-through stream so the SDK still gets
   * every byte while we observe a capped prefix. A tee/clone would double-buffer
   * a long-lived SSE stream; a pass-through cannot.
   */
  function instrumentBody(
    response: Response,
    onDone: (info: { text: string; bytes: number; endedBy: string; ms: number }) => void,
  ): Response {
    if (!response.body) {
      onDone({ text: "", bytes: 0, endedBy: "no-body", ms: 0 });
      return response;
    }
    const startedAt = Date.now();
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let captured = "";
    let bytes = 0;
    let finished = false;
    const finish = (endedBy: string) => {
      if (finished) return;
      finished = true;
      onDone({ text: captured, bytes, endedBy, ms: Date.now() - startedAt });
    };

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            finish("closed");
            controller.close();
            return;
          }
          bytes += value.byteLength;
          if (captured.length < maxStreamChars) {
            captured += decoder.decode(value, { stream: true });
          }
          controller.enqueue(value);
        } catch (error) {
          finish(`error: ${(error as Error)?.name || "unknown"}`);
          controller.error(error);
        }
      },
      cancel(reason) {
        finish("cancelled");
        return reader.cancel(reason);
      },
    });

    // `content-encoding` / `content-length` describe the ORIGINAL wire body;
    // the stream we hand back is already decoded, so keeping them would make a
    // downstream `.json()` mis-parse.
    const headers = new Headers(response.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return {
    dir,
    file,
    callCount: () => calls,

    registerHost: registerHostAlias,

    wrapFetch(base: typeof fetch): typeof fetch {
      return async function recordedFetch(input, init) {
        const id = `${process.pid}-${++seq}`;
        const rawUrl =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : (input as Request).url;
        const method = (init?.method || (input as Request)?.method || "GET").toUpperCase();
        const { test, testFile } = testContext();
        const url = redactUrl(rawUrl, hostAliases, ledger);
        const requestHeaders = redactHeaders(
          new Headers((init?.headers as HeadersInit | undefined) || {}).entries(),
        );
        const requestBody = decodeRequestBody(init?.body);
        const startedAt = Date.now();

        let response: Response;
        try {
          response = await base(input, init);
        } catch (error) {
          calls++;
          write({
            kind: "call",
            id,
            at: new Date(startedAt).toISOString(),
            test,
            testFile,
            method,
            hostAlias: url.hostAlias,
            path: url.path,
            query: url.query,
            requestHeaders: requestHeaders.kept,
            requestHeadersDropped: requestHeaders.droppedCount,
            requestBody,
            status: 0,
            error: `${(error as Error)?.name || "Error"}: ${(error as Error)?.message || String(error)}`,
            durationMs: Date.now() - startedAt,
          });
          throw error;
        }

        calls++;
        const headerMs = Date.now() - startedAt;
        const contentType = response.headers.get("content-type") || "";
        const responseHeaders = redactHeaders(response.headers.entries());
        const streaming = /event-stream|ndjson|octet-stream/i.test(contentType);

        write({
          kind: "call",
          id,
          at: new Date(startedAt).toISOString(),
          test,
          testFile,
          method,
          hostAlias: url.hostAlias,
          path: url.path,
          query: url.query,
          requestHeaders: requestHeaders.kept,
          requestHeadersDropped: requestHeaders.droppedCount,
          requestBody,
          status: response.status,
          statusText: response.statusText,
          contentType,
          responseHeaders: responseHeaders.kept,
          responseHeadersDropped: responseHeaders.droppedCount,
          streaming,
          durationMs: headerMs,
        });

        return instrumentBody(response, ({ text, bytes, endedBy, ms }) => {
          write({
            kind: "body",
            id,
            test,
            testFile,
            streaming,
            endedBy,
            responseBytes: bytes,
            bodyDurationMs: ms,
            totalDurationMs: headerMs + ms,
            responseBody: decodeResponseBody(
              text,
              contentType,
              streaming ? maxStreamChars : maxBodyChars,
            ),
          });
        });
      } as typeof fetch;
    },
  };
}

/** Test-only reset so unit tests can exercise both the on and off paths. */
export function resetEvidenceRecorderForTests(): void {
  singleton = null;
}
