/**
 * Redaction primitives for the live-e2e HTTP evidence recorder.
 *
 * Everything captured by the recorder is meant to end up in an EXTERNAL report,
 * so redaction is a hard gate, not a nicety. The design is deliberately
 * defence-in-depth and **allow-list first**:
 *
 *   1. URLs      — only the pathname survives. Scheme/host/port are replaced by
 *                  a stable alias ("eak" / "webagent" / "external"), so no
 *                  deployment hostname, EC2 DNS name or IP can leak.
 *   2. Headers   — allow-list. Anything not on `KEPT_HEADERS` is dropped
 *                  entirely (not stringified with a placeholder), so an
 *                  `authorization` / `cookie` / `x-genauth-token` header never
 *                  appears in the output at all.
 *   3. Bodies    — recursive walk. A key that looks like a credential has its
 *                  value replaced by `<redacted>`; the ORIGINAL value is fed
 *                  back into the secret ledger so the same string can never
 *                  surface elsewhere (a path segment, a query value, free text).
 *   4. Final pass— the serialized record is scrubbed against (a) the learned
 *                  secret ledger and (b) structural patterns (JWT, Bearer,
 *                  IPv4, EC2 DNS, Browserbase URLs, local absolute paths).
 *
 * Layer 4 exists because layers 1-3 are schema-aware and schemas drift. No
 * single layer is trusted on its own.
 */

export const REDACTED = "<redacted>";

/**
 * Keys whose VALUE is a credential. Matched case-insensitively against the
 * key with `-`/`_` normalised away.
 *
 * Deliberately does NOT match `sessionId` / `session_id` / `taskId`: those are
 * correlation identifiers that the report needs in order to be checkable, and
 * they are not credentials. `session_token` IS matched.
 */
const CREDENTIAL_KEYS = new Set(
  [
    "accesskey",
    "accesskeyid",
    "accesskeysecret",
    "accesstoken",
    "apikey",
    "auth",
    "authorization",
    "bearer",
    "clientsecret",
    "cookie",
    "credential",
    "credentials",
    "delegatedtoken",
    "delegationtoken",
    "idtoken",
    "jwt",
    "password",
    "passwd",
    "privatekey",
    "pwd",
    "refreshtoken",
    "secret",
    "secretkey",
    "sessiontoken",
    "setcookie",
    "signature",
    "subjecttoken",
    "token",
    "usertoken",
    "xgenauthtoken",
    "genauthtoken",
  ].map((key) => key.toLowerCase()),
);

/** Suffix match, so `foo_access_token` / `gumemToken` are caught as well. */
const CREDENTIAL_KEY_SUFFIXES = [
  "accesskey",
  "accesstoken",
  "apikey",
  "authorization",
  "password",
  "refreshtoken",
  "secret",
  "secretkey",
  "sessiontoken",
  "signature",
  "token",
];

export function normalizeKey(key: string): string {
  return key.replace(/[-_\s]/g, "").toLowerCase();
}

export function isCredentialKey(key: string): boolean {
  const normalized = normalizeKey(key);
  if (CREDENTIAL_KEYS.has(normalized)) return true;
  return CREDENTIAL_KEY_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

/**
 * Response/request headers kept verbatim. Everything else is dropped; the
 * count of dropped headers is reported separately so the evidence still shows
 * that (for example) an auth header was present without naming or valuing it.
 */
export const KEPT_HEADERS = new Set(["content-type", "accept", "x-request-id", "x-eak-request-id"]);

export interface HeaderEvidence {
  kept: Record<string, string>;
  droppedCount: number;
}

export function redactHeaders(headers: Iterable<[string, string]> | undefined): HeaderEvidence {
  const kept: Record<string, string> = {};
  let droppedCount = 0;
  for (const [rawKey, value] of headers || []) {
    const key = rawKey.toLowerCase();
    if (KEPT_HEADERS.has(key) && !isCredentialKey(key)) kept[key] = value;
    else droppedCount++;
  }
  return { kept, droppedCount };
}

/**
 * Structural patterns scrubbed from the FINAL serialized record. Order matters:
 * the more specific patterns run first so their match is not eaten by a
 * broader one.
 */
const STRUCTURAL_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  // JSON Web Tokens — every delegated/product/GenAuth token on this deployment.
  [/\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]*/g, "<redacted:jwt>"],
  // `Bearer <anything>` regardless of where it shows up.
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer <redacted>"],
  // Browserbase live/debug session URLs handed out by the WebAgent harness.
  [/\b(?:wss?|https?):\/\/[A-Za-z0-9.-]*browserbase\.com[^\s"'\\)]*/gi, "<redacted:browserbase-url>"],
  [/\b[A-Za-z0-9-]+\.browserbase\.com\b/gi, "<redacted:browserbase-host>"],
  // EC2 public DNS + AWS internal hostnames.
  [/\bec2(?:-\d{1,3}){4}\.[A-Za-z0-9.-]*amazonaws\.com\b/gi, "<redacted:host>"],
  [/\bip-(?:\d{1,3}-){3}\d{1,3}(?:\.[A-Za-z0-9.-]+)?\b/gi, "<redacted:host>"],
  [/\b[A-Za-z0-9-]+\.compute(?:-\d+)?\.(?:internal|amazonaws\.com)\b/gi, "<redacted:host>"],
  // Bare IPv4 literals (deployment addresses).
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "<redacted:ip>"],
  // Local absolute paths and the OS user name embedded in them.
  [/(?:\/Users|\/home|\/root)\/[A-Za-z0-9._-]+(?:\/[^\s"',:;)\]}\\]*)*/g, "<redacted:path>"],
];

export interface SecretLedger {
  /** Register a literal string that must never appear in the output. */
  learn(value: unknown): void;
  /** Scrub literals + structural patterns out of an already-serialized record. */
  scrub(text: string): string;
  size(): number;
}

/** Literals shorter than this are too generic to scrub safely (e.g. "1", "ok"). */
const MIN_SECRET_LENGTH = 8;

export function createSecretLedger(initial: Iterable<unknown> = []): SecretLedger {
  const literals = new Set<string>();

  function learn(value: unknown): void {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed.length < MIN_SECRET_LENGTH) return;
    literals.add(trimmed);
    // A base URL leaks through its hostname too ("https://x.example" → "x.example").
    try {
      const url = new URL(trimmed);
      if (url.hostname.length >= MIN_SECRET_LENGTH) literals.add(url.hostname);
      if (url.host !== url.hostname) literals.add(url.host);
    } catch {
      /* not a URL — the literal itself is enough */
    }
  }

  for (const value of initial) learn(value);

  return {
    learn,
    size: () => literals.size,
    scrub(text: string): string {
      let output = text;
      // Longest first, so a hostname inside a base URL does not break the
      // longer literal into a partially-scrubbed fragment.
      for (const literal of [...literals].sort((a, b) => b.length - a.length)) {
        if (!literal) continue;
        output = output.split(literal).join(REDACTED);
        // JSON escaping turns `/` into `\/` in some producers, and `"` into `\"`.
        const escaped = JSON.stringify(literal).slice(1, -1);
        if (escaped !== literal) output = output.split(escaped).join(REDACTED);
      }
      for (const [pattern, replacement] of STRUCTURAL_PATTERNS) {
        output = output.replace(pattern, replacement);
      }
      return output;
    },
  };
}

/**
 * Keys whose value is a DEPLOYMENT ENDPOINT. `GET /api/v3/eak/runtime-config`
 * answers with every base URL the SDK will then talk to, so without this the
 * very first recorded response would hand the reader the real EAK / GenAuth /
 * GUMem / WebAgent hostnames.
 *
 * The value is replaced AND learned, which retroactively protects every later
 * record: once the ledger knows a hostname, the final pass strips it wherever
 * it appears (artifact links, SSE payloads, error messages).
 *
 * Deliberately narrow — `url` is NOT here, because Web Search / Deep Research
 * evidence is largely public result URLs and redacting those would destroy it.
 */
const ENDPOINT_KEY_SUFFIXES = ["baseurl", "baseuri", "endpoint"];
const ENDPOINT_KEYS = new Set(["host", "hostname", "origin"]);

export function isEndpointKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return ENDPOINT_KEYS.has(normalized) || ENDPOINT_KEY_SUFFIXES.some((s) => normalized.endsWith(s));
}

export const REDACTED_ENDPOINT = "<redacted:endpoint>";

export interface RedactBodyOptions {
  ledger?: SecretLedger;
  maxDepth?: number;
  maxArrayItems?: number;
  /** Called for every endpoint-keyed value, so the recorder can alias the host. */
  onEndpoint?: (key: string, value: string) => void;
}

/**
 * Recursively redact a decoded JSON payload. Credential-keyed values are
 * replaced and simultaneously LEARNED, so the same token cannot resurface in
 * another position of the same or a later record.
 */
export function redactBody(value: unknown, options: RedactBodyOptions = {}): unknown {
  const maxDepth = options.maxDepth ?? 12;
  const maxArrayItems = options.maxArrayItems ?? 50;

  function walk(node: unknown, depth: number): unknown {
    if (depth > maxDepth) return "<truncated:depth>";
    if (node === null || typeof node !== "object") return node;
    if (Array.isArray(node)) {
      const items = node.slice(0, maxArrayItems).map((item) => walk(item, depth + 1));
      if (node.length > maxArrayItems) items.push(`<truncated:${node.length - maxArrayItems} more items>`);
      return items;
    }
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(node as Record<string, unknown>)) {
      if (isCredentialKey(key)) {
        options.ledger?.learn(item);
        output[key] = REDACTED;
        continue;
      }
      if (isEndpointKey(key) && typeof item === "string" && item.trim()) {
        options.onEndpoint?.(key, item);
        options.ledger?.learn(item);
        output[key] = REDACTED_ENDPOINT;
        continue;
      }
      output[key] = walk(item, depth + 1);
    }
    return output;
  }

  return walk(value, 0);
}

/**
 * Key/value redaction for payloads we can only see as TEXT: SSE frames,
 * ndjson, and JSON bodies too large to parse before truncation.
 *
 * `redactBody()` cannot help there (no object to walk) and the final structural
 * pass only catches shaped secrets (JWT / Bearer / hostnames). A backend that
 * returns an opaque `"session_token": "st_9f..."` inside an SSE frame would
 * otherwise slip through, so match the key in the raw text as well.
 */
const JSON_PAIR_RE = /"([A-Za-z0-9_.-]+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;

export function redactJsonishText(text: string, options: RedactBodyOptions = {}): string {
  return text.replace(JSON_PAIR_RE, (match, key: string, value: string) => {
    if (isCredentialKey(key)) {
      options.ledger?.learn(value);
      return `"${key}":"${REDACTED}"`;
    }
    if (isEndpointKey(key) && value.trim()) {
      options.onEndpoint?.(key, value);
      options.ledger?.learn(value);
      return `"${key}":"${REDACTED_ENDPOINT}"`;
    }
    return match;
  });
}

export interface UrlEvidence {
  hostAlias: string;
  path: string;
  query: Record<string, string>;
}

/**
 * Reduce a request URL to alias + path + redacted query. The tenant/project id
 * that `webAgentPath()` splices into the data-plane route is replaced by a
 * placeholder: it identifies the deployment's tenant and adds nothing the
 * report needs.
 */
export function redactUrl(
  rawUrl: string,
  hostAliases: ReadonlyMap<string, string>,
  ledger?: SecretLedger,
): UrlEvidence {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { hostAlias: "unknown", path: "<unparsable-url>", query: {} };
  }

  const hostAlias = hostAliases.get(url.origin) ?? hostAliases.get(url.host) ?? "external";
  const path = url.pathname.replace(
    /\/api\/v1\/projects\/[^/]+/,
    "/api/v1/projects/<tenantId>",
  );

  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (isCredentialKey(key)) {
      ledger?.learn(value);
      query[key] = REDACTED;
    } else {
      query[key] = value;
    }
  }
  return { hostAlias, path, query };
}

export interface TruncatedText {
  text: string;
  truncated: boolean;
  originalChars: number;
}

export function truncateText(text: string, maxChars: number): TruncatedText {
  if (text.length <= maxChars) return { text, truncated: false, originalChars: text.length };
  return {
    text: `${text.slice(0, maxChars)}…<truncated ${text.length - maxChars} chars>`,
    truncated: true,
    originalChars: text.length,
  };
}

/**
 * Serialize + scrub in one step. This is the ONLY function the recorder uses to
 * turn a record into a JSONL line, so nothing can bypass the final pass.
 */
export function serializeRedacted(record: unknown, ledger: SecretLedger): string {
  return ledger.scrub(JSON.stringify(record));
}
