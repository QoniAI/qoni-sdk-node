import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { EazoAgentKit } from "../../src";
import {
  DEFAULT_QUERY_MATRIX_FILE,
  loadQueryMatrix,
  type QueryMatrixFunction,
} from "../helpers/query-matrix";
import {
  runQueryMatrixCase,
  type QueryMatrixCaseResult,
} from "../helpers/query-matrix-runner";
import {
  deepResearchScopes,
  delegateLiveToken,
  doAnythingScopes,
  liveClient,
  trackScopes,
  webSearchScopes,
} from "./helpers";

const matrixEnabled =
  process.env.EAK_LIVE_E2E === "1" && process.env.EAK_QUERY_MATRIX === "1";
const describeMatrix = matrixEnabled ? describe : describe.skip;
const matrix = matrixEnabled ? loadQueryMatrix() : undefined;
const batchId = `query-matrix-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const evidenceDir = path.join(process.cwd(), ".secrets", "query-matrix", "runs", batchId);

describeMatrix("live e2e: local public Query matrix", () => {
  let client: EazoAgentKit;
  const tokenByFunction = new Map<QueryMatrixFunction, Promise<string>>();
  const results: QueryMatrixCaseResult[] = [];

  beforeAll(() => {
    if (!matrix) throw new Error("Query matrix was not loaded");
    fs.mkdirSync(evidenceDir, { recursive: true });
    client = liveClient({
      host: matrix.runtime.eakHost,
      webAgentBaseUrl: matrix.runtime.webAgentBaseUrl,
      timeoutMs: matrix.runtime.timeoutMs,
    });
  });

  afterAll(() => {
    if (!matrix) return;
    const passed = results.filter((item) => item.status === "passed").length;
    const summary = {
      schemaVersion: 1,
      batchId,
      caseFile: process.env.EAK_QUERY_MATRIX_FILE || DEFAULT_QUERY_MATRIX_FILE,
      generatedAt: new Date().toISOString(),
      total: matrix.cases.length,
      completed: results.length,
      passed,
      failed: results.filter((item) => item.status === "failed").length,
      byFunction: Object.fromEntries(
        [...new Set(matrix.cases.map((item) => item.function))].map((functionName) => {
          const functionResults = results.filter((item) => item.function === functionName);
          return [
            functionName,
            {
              planned: matrix.cases.filter((item) => item.function === functionName).length,
              passed: functionResults.filter((item) => item.status === "passed").length,
              failed: functionResults.filter((item) => item.status === "failed").length,
            },
          ];
        }),
      ),
      results,
    };
    fs.writeFileSync(
      path.join(evidenceDir, "summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    console.log(`Query matrix evidence: ${evidenceDir}`);
  });

  it.each(matrix?.cases ?? [])(
    "$id [$function]",
    async (item) => {
      const token = await tokenFor(item.function);
      try {
        const result = await runQueryMatrixCase({
          client,
          token,
          item,
          evidenceDir,
        });
        results.push(result);
        expect(result.status).toBe("passed");
      } catch (error) {
        const failed = (error as { queryMatrixResult?: QueryMatrixCaseResult })
          .queryMatrixResult;
        if (failed) results.push(failed);
        throw error;
      }
    },
    900_000,
  );

  function tokenFor(functionName: QueryMatrixFunction): Promise<string> {
    const existing = tokenByFunction.get(functionName);
    if (existing) return existing;
    const scopes = {
      "doAnything.run": doAnythingScopes,
      "webSearch.run": webSearchScopes,
      "deepResearch.run": deepResearchScopes,
      "track.create": trackScopes,
    }[functionName];
    const delegated = delegateLiveToken(client, scopes).then(({ token }) => token);
    tokenByFunction.set(functionName, delegated);
    return delegated;
  }
});
