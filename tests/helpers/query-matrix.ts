import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import type { JsonObject } from "../../src";

export const QUERY_MATRIX_MIN_CASES = 10;
export const QUERY_MATRIX_MAX_CASES = 20;
export const DEFAULT_QUERY_MATRIX_FILE = path.join(
  process.cwd(),
  ".secrets",
  "query-matrix",
  "cases.local.json",
);

export type QueryMatrixFunction =
  | "doAnything.run"
  | "webSearch.run"
  | "deepResearch.run"
  | "track.create";

export interface QueryMatrixRuntime {
  /** EAK control-plane base URL. Kept in the ignored local document. */
  eakHost?: string;
  /** WebAgent data-plane base URL. Kept in the ignored local document. */
  webAgentBaseUrl: string;
  timeoutMs?: number;
}

export interface QueryMatrixAssertions {
  /** Case-insensitive substrings expected in the final output/evidence. */
  expectedText?: string[];
  minOutputChars?: number;
  minResults?: number;
  requireScreenshots?: boolean;
  requireBrowserHarness?: boolean;
}

export interface QueryMatrixCase {
  id: string;
  title: string;
  function: QueryMatrixFunction;
  /** Public HTTPS sources that make the case independently reproducible. */
  publicSources: string[];
  /** Exact SDK function input except for the delegated token. */
  input: JsonObject & { prompt: string | string[] };
  assertions: QueryMatrixAssertions;
  timeoutMs?: number;
}

export interface QueryMatrixDocument {
  schemaVersion: 1;
  runtime: QueryMatrixRuntime;
  cases: QueryMatrixCase[];
}

export function loadQueryMatrix(
  file = process.env.EAK_QUERY_MATRIX_FILE || DEFAULT_QUERY_MATRIX_FILE,
): QueryMatrixDocument {
  if (!fs.existsSync(file)) {
    throw new Error(
      `Query matrix file not found: ${file}. Create the ignored local file described in tests/live-e2e/README.md.`,
    );
  }
  return parseQueryMatrix(JSON.parse(fs.readFileSync(file, "utf8")) as unknown);
}

export function parseQueryMatrix(value: unknown): QueryMatrixDocument {
  const document = record(value, "query matrix");
  if (document.schemaVersion !== 1) {
    throw new Error("Query matrix schemaVersion must be 1");
  }

  const runtimeRecord = record(document.runtime, "query matrix runtime");
  const runtime: QueryMatrixRuntime = {
    webAgentBaseUrl: validRuntimeUrl(runtimeRecord.webAgentBaseUrl, "webAgentBaseUrl"),
    ...(runtimeRecord.eakHost === undefined
      ? {}
      : { eakHost: validRuntimeUrl(runtimeRecord.eakHost, "eakHost") }),
    ...(runtimeRecord.timeoutMs === undefined
      ? {}
      : { timeoutMs: positiveInteger(runtimeRecord.timeoutMs, "runtime.timeoutMs") }),
  };

  if (!Array.isArray(document.cases)) {
    throw new Error("Query matrix cases must be an array");
  }
  if (
    document.cases.length < QUERY_MATRIX_MIN_CASES ||
    document.cases.length > QUERY_MATRIX_MAX_CASES
  ) {
    throw new Error(
      `Query matrix must contain between ${QUERY_MATRIX_MIN_CASES} and ${QUERY_MATRIX_MAX_CASES} cases`,
    );
  }

  const cases = document.cases.map((item, index) => parseCase(item, index));
  const ids = new Set<string>();
  for (const item of cases) {
    if (ids.has(item.id)) throw new Error(`Query matrix contains duplicate id: ${item.id}`);
    ids.add(item.id);
  }
  if (new Set(cases.map((item) => item.function)).size < 2) {
    throw new Error("Query matrix must exercise at least two SDK functions");
  }

  return { schemaVersion: 1, runtime, cases };
}

function parseCase(value: unknown, index: number): QueryMatrixCase {
  const item = record(value, `cases[${index}]`);
  const id = nonEmptyString(item.id, `cases[${index}].id`);
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(id)) {
    throw new Error(`cases[${index}].id must match ^[a-z][a-z0-9-]{2,63}$`);
  }
  const title = nonEmptyString(item.title, `cases[${index}].title`);
  const functionName = nonEmptyString(item.function, `cases[${index}].function`);
  if (!isQueryMatrixFunction(functionName)) {
    throw new Error(`cases[${index}].function is not a supported SDK function`);
  }

  if (!Array.isArray(item.publicSources) || item.publicSources.length === 0) {
    throw new Error(`cases[${index}].publicSources must contain public HTTPS URLs`);
  }
  const publicSources = item.publicSources.map((source, sourceIndex) =>
    publicSource(source, `cases[${index}].publicSources[${sourceIndex}]`),
  );

  const input = record(item.input, `cases[${index}].input`);
  rejectUnsafeKeys(input, `cases[${index}].input`);
  const prompt = input.prompt;
  if (!(
    (typeof prompt === "string" && prompt.trim()) ||
    (Array.isArray(prompt) && prompt.length > 0 && prompt.every((part) => typeof part === "string" && part.trim()))
  )) {
    throw new Error(`cases[${index}].input.prompt must be a string or non-empty string array`);
  }
  if (functionName !== "webSearch.run" && typeof prompt !== "string") {
    throw new Error(`${functionName} requires input.prompt to be a string`);
  }

  const assertionsRecord = record(item.assertions, `cases[${index}].assertions`);
  const assertions = parseAssertions(assertionsRecord, index);

  return {
    id,
    title,
    function: functionName,
    publicSources,
    input: input as QueryMatrixCase["input"],
    assertions,
    ...(item.timeoutMs === undefined
      ? {}
      : { timeoutMs: positiveInteger(item.timeoutMs, `cases[${index}].timeoutMs`) }),
  };
}

function parseAssertions(value: JsonObject, index: number): QueryMatrixAssertions {
  const out: QueryMatrixAssertions = {};
  if (value.expectedText !== undefined) {
    if (!Array.isArray(value.expectedText) || value.expectedText.length === 0) {
      throw new Error(`cases[${index}].assertions.expectedText must be a non-empty array`);
    }
    out.expectedText = value.expectedText.map((part, textIndex) =>
      nonEmptyString(part, `cases[${index}].assertions.expectedText[${textIndex}]`),
    );
  }
  if (value.minOutputChars !== undefined) {
    out.minOutputChars = positiveInteger(
      value.minOutputChars,
      `cases[${index}].assertions.minOutputChars`,
    );
  }
  if (value.minResults !== undefined) {
    out.minResults = positiveInteger(value.minResults, `cases[${index}].assertions.minResults`);
  }
  if (value.requireScreenshots !== undefined) {
    out.requireScreenshots = boolean(value.requireScreenshots, "requireScreenshots");
  }
  if (value.requireBrowserHarness !== undefined) {
    out.requireBrowserHarness = boolean(value.requireBrowserHarness, "requireBrowserHarness");
  }
  if (Object.keys(out).length === 0) {
    throw new Error(`cases[${index}].assertions must define at least one assertion`);
  }
  return out;
}

function rejectUnsafeKeys(value: unknown, label: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectUnsafeKeys(item, `${label}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (/^(?:access[_-]?token|refresh[_-]?token|authorization|password|secret|secret[_-]?key|access[_-]?key|api[_-]?key|cookie)$/i.test(key)) {
      throw new Error(`${label}.${key} is credential-like; credentials must come from environment variables`);
    }
    if (/^(?:base[_-]?url|endpoint|host|port)$/i.test(key)) {
      throw new Error(
        `${label}.${key} contains runtime routing; keep endpoint and port configuration under document.runtime`,
      );
    }
    rejectUnsafeKeys(item, `${label}.${key}`);
  }
}

function publicSource(value: unknown, label: string): string {
  const source = nonEmptyString(value, label);
  let url: URL;
  try {
    url = new URL(source);
  } catch {
    throw new Error(`${label} must contain a valid public HTTPS URL`);
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    net.isIP(hostname) !== 0 ||
    !hostname.includes(".")
  ) {
    throw new Error(`${label} must contain a public HTTPS URL`);
  }
  return url.toString();
}

function validRuntimeUrl(value: unknown, label: string): string {
  const text = nonEmptyString(value, `runtime.${label}`);
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`runtime.${label} must be an HTTP(S) URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`runtime.${label} must be an HTTP(S) URL`);
  }
  return url.toString().replace(/\/$/, "");
}

function isQueryMatrixFunction(value: string): value is QueryMatrixFunction {
  return ["doAnything.run", "webSearch.run", "deepResearch.run", "track.create"].includes(value);
}

function record(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as JsonObject;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a string`);
  return value.trim();
}

function positiveInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return Number(value);
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
  return value;
}
