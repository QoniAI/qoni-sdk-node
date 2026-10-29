import { describe, expect, it } from "vitest";
import { Qoni, MonitorHandle, RunHandle } from "../src";

// Anti-drift guard for the frozen public contract
// (wa/docs/qoni-sdk-public-surface.md §2-§9), plus the approved ordinary-profile
// extension in docs/ordinary-task-profile.md. The sets below are asserted with
// EXACT equality on purpose: removing a contract method fails, and so does
// adding one that the contract doesn't define. If this test is red, either
// the change is a contract violation, or the contract document was amended
// first and this pin must be updated in the same commit.

const client = new Qoni({
  accessKey: "ak_test",
  secretKey: "sk_test",
  host: "https://qoni.example.com",
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
  it("run products expose lifecycle operations and Do Anything file listing/profile", () => {
    for (const product of ["doAnything", "webSearch", "deepResearch"] as const) {
      // 0.10.0 adds a person's conversations, their browsers and their computer's files.
      expect(publicKeys(client[product]), product).toEqual(product === "doAnything" ? ["api", "artifacts", "attach", "browsers", "files", "forms", "mail", "profile", "run", "runWithMemory", "sessions"] : ["api", "attach", "run"]);
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

  it("track exposes exactly create / attach / list / api (contract §6, §9; list since 0.10.0)", () => {
    expect(publicKeys(client.track)).toEqual(["api", "attach", "create", "list"]);
  });

  it("the personal agent's follow-ups, notifications and workspace credits (0.10.0; sessions.prewarm since 0.10.2)", () => {
    expect(publicKeys(client.proactive)).toEqual(["cancel", "create", "get", "list", "runNow"]);
    expect(publicKeys(client.notifications)).toEqual(["list", "markRead"]);
    expect(publicKeys(client.workspace)).toEqual(["billingUrl", "credits"]);
    expect(publicKeys(client.doAnything.sessions)).toEqual(["credits", "get", "list", "prewarm"]);
    expect(publicKeys(client.doAnything.browsers)).toEqual(["control", "list"]);
    expect(publicKeys(client.doAnything.files)).toEqual(["delete", "list", "listAll", "mkdir", "move", "read", "upload", "watch"]);
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
