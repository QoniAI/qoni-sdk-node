import { describe, expect, it } from "vitest";
import { EazoAgentKit, MonitorHandle, RunHandle } from "../src";

// Anti-drift guard for the frozen public contract
// (wa/docs/eak-sdk-public-surface.md §2-§9). The sets below are asserted with
// EXACT equality on purpose: removing a contract method fails, and so does
// adding one that the contract doesn't define. If this test is red, either
// the change is a contract violation, or the contract document was amended
// first and this pin must be updated in the same commit.

const client = new EazoAgentKit({
  accessKey: "ak_test",
  secretKey: "sk_test",
  host: "https://eak.example.com",
});

function publicKeys(value: object): string[] {
  return Object.keys(value).sort();
}

function prototypeMethods(ctor: { prototype: object }): string[] {
  return Object.getOwnPropertyNames(ctor.prototype)
    .filter((name) => name !== "constructor")
    .sort();
}

describe("frozen contract surface", () => {
  it("run products expose exactly run / attach / api (contract §4, §9)", () => {
    for (const product of ["doAnything", "webSearch", "deepResearch"] as const) {
      expect(publicKeys(client[product]), product).toEqual(["api", "attach", "run"]);
    }
  });

  it("deepResearch has no product-specific handle ops at the top level (contract §4)", () => {
    const top = client.deepResearch as Record<string, unknown>;
    expect(top.followUp).toBeUndefined();
    expect(top.feedback).toBeUndefined();
    // ...they live in the escape hatch instead.
    const api = top.api as Record<string, unknown>;
    expect(typeof api.followUp).toBe("function");
    expect(typeof api.feedback).toBe("function");
  });

  it("track exposes exactly create / attach / api (contract §6, §9)", () => {
    expect(publicKeys(client.track)).toEqual(["api", "attach", "create"]);
  });

  it("RunHandle has exactly the contract §4 lifecycle methods", () => {
    expect(prototypeMethods(RunHandle)).toEqual(
      ["cancel", "events", "interactionHandle", "status", "wait"].sort(),
    );
  });

  it("MonitorHandle has exactly the contract §6 methods", () => {
    expect(prototypeMethods(MonitorHandle)).toEqual(
      [
        "delete",
        "events",
        "get",
        "interactionHandle",
        "pause",
        "refine",
        "resume",
        "run",
        "runNow",
        "runs",
      ].sort(),
    );
  });
});
