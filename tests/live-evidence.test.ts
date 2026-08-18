/**
 * Gate tests for the live-e2e evidence layer. These run in the MOCK suite (no
 * network, no credentials) because both properties they protect must hold
 * before anything is ever recorded against production:
 *
 *   1. FUNCTION_TEST_MAP covers all 94 catalogued public functions, and every
 *      test reference in it resolves to a real `describe > it` in the live
 *      sources. Without this, per-function attribution is guesswork.
 *   2. Redaction actually removes credentials. The captured records go into an
 *      external report, so a leak here is a security incident, not a bug.
 */

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "./live-e2e/function-catalog.json";
import { FUNCTION_TEST_MAP, type FunctionMapEntry } from "./live-e2e/function-map";
import { createEvidenceRecorder } from "./live-e2e/evidence";
import {
  REDACTED,
  REDACTED_ENDPOINT,
  createSecretLedger,
  isCredentialKey,
  isEndpointKey,
  redactBody,
  redactHeaders,
  redactJsonishText,
  redactUrl,
  serializeRedacted,
  truncateText,
} from "./live-e2e/redact";

const LIVE_DIR = path.join(__dirname, "live-e2e");

function readLive(file: string): string[] {
  return fs.readFileSync(path.join(LIVE_DIR, file), "utf8").split(/\r?\n/);
}

describe("live evidence: function → test map", () => {
  const byId = new Map(FUNCTION_TEST_MAP.map((entry) => [entry.id, entry]));

  it("covers every catalogued public function", () => {
    const missing = catalog
      .filter((fn) => !byId.has(fn.id))
      .map((fn) => `${fn.id} (${fn.name})`);
    expect(missing, "catalog functions missing from FUNCTION_TEST_MAP").toEqual([]);
    expect(FUNCTION_TEST_MAP).toHaveLength(catalog.length);
    expect(catalog).toHaveLength(94);
  });

  it("does not invent functions the catalog does not declare", () => {
    const catalogIds = new Set(catalog.map((fn) => fn.id));
    expect(FUNCTION_TEST_MAP.filter((entry) => !catalogIds.has(entry.id)).map((e) => e.id)).toEqual(
      [],
    );
    for (const fn of catalog) {
      expect(byId.get(fn.id)!.name).toBe(fn.name);
    }
  });

  it("gives every function either a live test or a stated reason", () => {
    const silent = FUNCTION_TEST_MAP.filter(
      (entry) => entry.tests.length === 0 && !entry.noLiveTest,
    );
    expect(silent.map((e) => e.name), "functions with neither tests nor a reason").toEqual([]);
  });

  it("resolves every referenced test to a real describe > it in the live sources", () => {
    const unresolved: string[] = [];
    const seen = new Set<string>();
    for (const entry of FUNCTION_TEST_MAP) {
      for (const ref of entry.tests) {
        const key = `${ref.file}:${ref.line}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const lines = readLive(ref.file);
        const declaration = lines[ref.line - 1] ?? "";
        // The recorded line must actually open a test block.
        if (!/^\s*(?:it|it[A-Z][A-Za-z0-9_]*|test)(?:\.[A-Za-z0-9_]+)*\s*\(/.test(declaration)) {
          unresolved.push(`${key}: not an it(...) declaration → ${declaration.trim()}`);
          continue;
        }
        const segments = ref.name.split(" > ");
        const title = segments[segments.length - 1];
        const block = lines.slice(ref.line - 1, ref.endLine).join("\n");
        if (!ref.dynamic && !block.includes(title)) {
          unresolved.push(`${key}: block does not contain the mapped title "${title}"`);
        }
        // Every describe segment must exist earlier in the same file.
        for (const ancestor of segments.slice(0, -1)) {
          if (!lines.slice(0, ref.line).some((line) => line.includes(ancestor))) {
            unresolved.push(`${key}: describe "${ancestor}" not found above the test`);
          }
        }
      }
    }
    expect(unresolved).toEqual([]);
  });

  it("keeps the map's tiers consistent with the recorded verdicts", () => {
    const tiers = new Set(["VERIFIED", "GUARD_ONLY", "BLOCKED", "MOCK_ONLY"]);
    for (const entry of FUNCTION_TEST_MAP as readonly FunctionMapEntry[]) {
      expect(tiers.has(entry.tier), `${entry.name} has an unknown tier ${entry.tier}`).toBe(true);
    }
  });
});

describe("live evidence: redaction", () => {
  it("classifies credential-shaped keys without eating correlation ids", () => {
    for (const key of [
      "token",
      "access_token",
      "accessToken",
      "refresh-token",
      "session_token",
      "secretKey",
      "QONI_SECRET_KEY",
      "authorization",
      "Cookie",
      "x-genauth-token",
      "password",
      "api_key",
      "signature",
      "subjectToken",
    ]) {
      expect(isCredentialKey(key), `${key} should be treated as a credential`).toBe(true);
    }
    for (const key of ["session_id", "sessionId", "task_id", "run_id", "monitor_id", "keywords", "tokens_used"]) {
      expect(isCredentialKey(key), `${key} should NOT be redacted`).toBe(false);
    }
  });

  it("removes every planted credential from a realistic payload", () => {
    const ledger = createSecretLedger([
      "AK-live-0123456789abcdef",
      "SK-live-fedcba9876543210",
      "https://qoni.internal.example.com/dashboard",
    ]);
    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInRlbmFudCI6InQtOSJ9.s3cr3tS1gnatur3";
    const payload = {
      data: {
        token: jwt,
        access_token: jwt,
        session_id: "sess-42",
        user: { id: "u-1", password: "hunter2hunter2", nickname: "live" },
        nested: [{ secretKey: "SK-live-fedcba9876543210" }, { note: `Bearer ${jwt}` }],
        debugUrl: "https://connect.browserbase.com/devtools/page/abc123",
        artifact: "/Users/someone/stellarkey/report/out.json",
        host: "ec2-12-34-56-78.us-west-2.compute.amazonaws.com",
        node: "ip-172-31-4-5.us-west-2.compute.internal",
        addr: "203.0.113.77",
        akEcho: "AK-live-0123456789abcdef",
        endpoint: "https://qoni.internal.example.com/dashboard/api/v3/eak/delegations",
      },
    };

    const line = serializeRedacted(redactBody(payload, { ledger }), ledger);

    for (const secret of [
      jwt,
      "s3cr3tS1gnatur3",
      "hunter2hunter2",
      "AK-live-0123456789abcdef",
      "SK-live-fedcba9876543210",
      "qoni.internal.example.com",
      "browserbase.com",
      "ec2-12-34-56-78",
      "ip-172-31-4-5",
      "203.0.113.77",
      "/Users/someone",
    ]) {
      expect(line, `redacted output still contains ${secret}`).not.toContain(secret);
    }
    // Correlation ids survive — the evidence has to stay checkable.
    expect(line).toContain("sess-42");
    expect(line).toContain("nickname");
    expect(line).toContain(REDACTED);
  });

  it("keeps only allow-listed headers and drops credential headers entirely", () => {
    const headers = new Headers({
      authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.sig",
      cookie: "session=abc; theme=dark",
      "x-genauth-token": "gat-secret-value",
      "content-type": "application/json",
      accept: "text/event-stream",
    });
    const { kept, droppedCount } = redactHeaders(headers.entries());
    expect(Object.keys(kept).sort()).toEqual(["accept", "content-type"]);
    expect(droppedCount).toBe(3);
    expect(JSON.stringify(kept)).not.toMatch(/authorization|cookie|genauth/i);
  });

  it("redacts the runtime-config endpoint fan-out and learns those hosts", () => {
    for (const key of ["qoniBaseUrl", "genauthBaseUrl", "gumemBaseUrl", "webAgentBaseUrl", "host", "endpoint"]) {
      expect(isEndpointKey(key), `${key} should be treated as an endpoint`).toBe(true);
    }
    // Public result URLs must survive, otherwise Web Search evidence is useless.
    for (const key of ["url", "sourceUrl", "link", "photo"]) {
      expect(isEndpointKey(key), `${key} should NOT be redacted`).toBe(false);
    }

    const ledger = createSecretLedger();
    const seen: Array<[string, string]> = [];
    const runtimeConfig = {
      data: {
        qoniBaseUrl: "https://qoni.deployment.example/dashboard",
        genauthBaseUrl: "https://abcdefgh.genauth.example",
        gumemBaseUrl: "https://gum.deployment.example/api",
        webAgentBaseUrl: "https://webagent.deployment.example",
      },
    };
    const redacted = redactBody(runtimeConfig, {
      ledger,
      onEndpoint: (key, value) => seen.push([key, value]),
    });
    expect(seen.map(([key]) => key)).toEqual([
      "qoniBaseUrl",
      "genauthBaseUrl",
      "gumemBaseUrl",
      "webAgentBaseUrl",
    ]);
    expect(JSON.stringify(redacted)).not.toMatch(/deployment\.example|genauth\.example/);
    expect(JSON.stringify(redacted)).toContain(REDACTED_ENDPOINT);

    // Learned hosts are stripped from every LATER record too.
    const later = serializeRedacted(
      { note: "artifact at https://webagent.deployment.example/api/v1/files/9" },
      ledger,
    );
    expect(later).not.toContain("webagent.deployment.example");
  });

  it("redacts credential keys inside raw SSE / ndjson text", () => {
    const ledger = createSecretLedger();
    const frame =
      'data: {"type":"run.started","task_id":"t-1","session_token":"st_opaque_not_a_jwt",' +
      '"webAgentBaseUrl":"https://webagent.deployment.example","output":"hello"}\n\n';
    const redacted = redactJsonishText(frame, { ledger });
    expect(redacted).not.toContain("st_opaque_not_a_jwt");
    expect(redacted).not.toContain("webagent.deployment.example");
    expect(redacted).toContain('"task_id":"t-1"');
    expect(redacted).toContain('"output":"hello"');
    // The opaque token was learned, so it cannot resurface elsewhere either.
    expect(serializeRedacted({ echo: "st_opaque_not_a_jwt" }, ledger)).not.toContain(
      "st_opaque_not_a_jwt",
    );
  });

  it("reduces a URL to alias + path and placeholders the tenant", () => {
    const ledger = createSecretLedger();
    const aliases = new Map([["https://webagent.internal.example.com", "webagent"]]);
    const evidence = redactUrl(
      "https://webagent.internal.example.com/api/v1/projects/proj_9f8e/do_anything/runs?access_token=abc123456&limit=5",
      aliases,
      ledger,
    );
    expect(evidence.hostAlias).toBe("webagent");
    expect(evidence.path).toBe("/api/v1/projects/<tenantId>/do_anything/runs");
    expect(evidence.query).toEqual({ access_token: REDACTED, limit: "5" });
    expect(JSON.stringify(evidence)).not.toContain("webagent.internal.example.com");
    expect(JSON.stringify(evidence)).not.toContain("proj_9f8e");
  });

  it("truncates oversized bodies and reports the original size", () => {
    const big = "x".repeat(500);
    const result = truncateText(big, 100);
    expect(result.truncated).toBe(true);
    expect(result.originalChars).toBe(500);
    expect(result.text).toContain("truncated 400 chars");
    expect(truncateText("small", 100)).toEqual({
      text: "small",
      truncated: false,
      originalChars: 5,
    });
  });
});

describe("live evidence: recorder", () => {
  it("is off unless QONI_LIVE_EVIDENCE_DIR is set", async () => {
    const previous = process.env.QONI_LIVE_EVIDENCE_DIR;
    delete process.env.QONI_LIVE_EVIDENCE_DIR;
    const { evidenceRecorder, resetEvidenceRecorderForTests } = await import("./live-e2e/evidence");
    resetEvidenceRecorderForTests();
    expect(evidenceRecorder()).toBeUndefined();
    resetEvidenceRecorderForTests();
    if (previous !== undefined) process.env.QONI_LIVE_EVIDENCE_DIR = previous;
  });

  it("records a real round trip with nothing sensitive left on disk", async () => {
    const dir = fs.mkdtempSync(path.join(process.cwd(), ".secrets-evidence-test-"));
    try {
      process.env.QONI_LIVE_EVIDENCE_TEST_SECRET = "AK-unit-0123456789abcdef";
      const recorder = createEvidenceRecorder(dir);
      recorder.registerHost("https://webagent.internal.example.com", "webagent");

      const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJ0LTkifQ.unit-signature-value";
      const fakeFetch = (async () =>
        new Response(
          JSON.stringify({
            data: { access_token: jwt, session_id: "sess-7", debug: "https://x.browserbase.com/s/1" },
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "set-cookie": "sid=super-secret-cookie; Path=/",
            },
          },
        )) as unknown as typeof fetch;

      const wrapped = recorder.wrapFetch(fakeFetch);
      const response = await wrapped(
        new URL("https://webagent.internal.example.com/api/v1/projects/proj_1/do_anything/runs"),
        {
          method: "POST",
          headers: { authorization: `Bearer ${jwt}`, "content-type": "application/json" },
          body: JSON.stringify({ prompt: "hello", token: jwt }),
        },
      );
      // The SDK still sees an intact, parseable body.
      const parsed = (await response.json()) as { data: { session_id: string } };
      expect(parsed.data.session_id).toBe("sess-7");

      const written = fs.readFileSync(recorder.file, "utf8");
      expect(written.trim().split("\n")).toHaveLength(2); // call + body
      for (const secret of [
        jwt,
        "unit-signature-value",
        "super-secret-cookie",
        "webagent.internal.example.com",
        "browserbase.com",
        "proj_1",
      ]) {
        expect(written, `recorded JSONL still contains ${secret}`).not.toContain(secret);
      }
      expect(written).toContain('"hostAlias":"webagent"');
      expect(written).toContain('"path":"/api/v1/projects/<tenantId>/do_anything/runs"');
      expect(written).toContain('"sess-7"');
      expect(written).toContain(REDACTED);
    } finally {
      delete process.env.QONI_LIVE_EVIDENCE_TEST_SECRET;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
