import { describe, expect, it } from "vitest";
import {
  parseQueryMatrix,
  selectQueryMatrixCase,
  type QueryMatrixDocument,
} from "./helpers/query-matrix";
import {
  assertQueryMatrixOutput,
  assertSuccessfulRun,
  findTrackRun,
  searchResultItems,
} from "./helpers/query-matrix-runner";

function validDocument(): QueryMatrixDocument {
  return {
    schemaVersion: 1,
    runtime: {
      eakHost: "https://gateway.invalid",
      webAgentBaseUrl: "https://webagent.invalid",
    },
    cases: Array.from({ length: 10 }, (_, index) => ({
      id: `public-case-${index + 1}`,
      title: `Public case ${index + 1}`,
      function: index < 4
        ? "doAnything.run" as const
        : index < 7
          ? "webSearch.run" as const
          : index < 9
            ? "deepResearch.run" as const
            : "track.create" as const,
      publicSources: ["https://example.com/"],
      input: {
        prompt: `Read public source ${index + 1}`,
      },
      assertions: {
        expectedText: ["example"],
      },
    })),
  };
}

describe("query matrix local configuration", () => {
  it("accepts 10-20 public cases across multiple SDK functions", () => {
    const parsed = parseQueryMatrix(validDocument());

    expect(parsed.cases).toHaveLength(10);
    expect(new Set(parsed.cases.map((item) => item.function)).size).toBe(4);
  });

  it("rejects endpoint details embedded in individual cases", () => {
    const document = validDocument();
    document.cases[0].input = {
      prompt: "Read a public page",
      baseUrl: "https://runtime.invalid",
    };

    expect(() => parseQueryMatrix(document)).toThrow(/runtime routing.*runtime/i);
  });

  it("rejects credential-like fields anywhere in the local manifest", () => {
    const document = validDocument();
    document.cases[0].input = {
      prompt: "Read a public page",
      nested: { accessToken: "must-not-live-in-the-case-file" },
    };

    expect(() => parseQueryMatrix(document)).toThrow(/credential/i);
  });

  it("rejects private and loopback sources", () => {
    const document = validDocument();
    document.cases[0].publicSources = ["http://localhost/private"];

    expect(() => parseQueryMatrix(document)).toThrow(/publicSources/i);
  });

  it("rejects duplicate ids and matrices outside the requested size", () => {
    const duplicate = validDocument();
    duplicate.cases[1].id = duplicate.cases[0].id;
    expect(() => parseQueryMatrix(duplicate)).toThrow(/duplicate/i);

    const tooSmall = validDocument();
    tooSmall.cases = tooSmall.cases.slice(0, 9);
    expect(() => parseQueryMatrix(tooSmall)).toThrow(/10 and 20/i);
  });

  it("selects focused live cases without embedding Query data in test code", () => {
    const document = parseQueryMatrix(validDocument());

    expect(selectQueryMatrixCase(document, "webSearch.run").id).toBe("public-case-5");
    expect(selectQueryMatrixCase(document, "deepResearch.run", "public-case-8").id).toBe(
      "public-case-8",
    );
    expect(() =>
      selectQueryMatrixCase(document, "doAnything.run", "public-case-8"),
    ).toThrow(/not doAnything\.run/);
  });
});

describe("query matrix result assertions", () => {
  it("checks semantic output text, size and result count", () => {
    const item = validDocument().cases[4];
    item.assertions = {
      expectedText: ["expected public marker"],
      minOutputChars: 20,
      minResults: 1,
    };
    const output = {
      results: [{ title: "Expected public marker in a result", url: "https://example.com" }],
    };

    const results = searchResultItems(output);
    expect(() => assertQueryMatrixOutput(item, output, { resultCount: results.length })).not.toThrow();
  });

  it("fails when a case returns the wrong public result", () => {
    const item = validDocument().cases[0];
    item.assertions = { expectedText: ["expected public fact"] };

    expect(() => assertQueryMatrixOutput(item, { answer: "different" })).toThrow(
      /expected public fact/,
    );
  });

  it("surfaces the backend failure detail before output assertions", () => {
    const item = validDocument().cases[7];

    expect(() => assertSuccessfulRun(item, {
      runId: "failed-research-run",
      status: "failed",
      output: null,
      artifacts: [],
      terminalReason: "failed",
      raw: {
        failure_reason: "harness_llm_error",
        failure_detail: "PLAN response did not match the outline contract",
      },
    })).toThrow(/harness_llm_error.*outline contract/);
  });
});

describe("query matrix Track correlation", () => {
  it("selects the run returned by runNow instead of a newer scheduled run", () => {
    const runs = [
      { id: "scheduled-run", state: "running", summary: null },
      { id: "run-now-target", state: "completed", summary: "Example Domain" },
    ];

    expect(findTrackRun(runs, "run-now-target")).toEqual(runs[1]);
  });
});
