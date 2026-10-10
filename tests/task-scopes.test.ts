import { describe, expect, it } from "vitest";
import { Qoni, QoniValidationError } from "../src";

const MANAGE = "webagent.do_anything:manage";
const CONTROL = "webagent.browser_use:take_control";
const READ = "webagent.do_anything:read";
const jwt = (value: unknown) => `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify(value)).toString('base64url')}.`;
const product = jwt({ aud: "webagent", sub: "owned-user", product_resource: { type: "webagent_tenant", id: "owned-project" } });
const delegation = jwt({ token_type: "eak_delegation_token", sub: "owned-user", aud: "qoni", resource_bindings: { webagent: { tenant_id: "owned-project" } } });

function setup(failure?: "denied" | "lost") {
  const calls: { path: string; body: Record<string, unknown>; authorization: string | null }[] = [];
  const client = new Qoni({
    accessKey: "synthetic-ak", secretKey: "synthetic-sk", host: "https://qoni.invalid",
    gumemHost: "https://gum.invalid", webAgentBaseUrl: "https://wa.invalid", genauthBaseUrl: "https://ga.invalid",
    fetch: (async (url, init) => {
      const path = new URL(String(url)).pathname;
      const body = JSON.parse(String(init?.body ?? "{}"));
      calls.push({ path, body, authorization: new Headers(init?.headers).get("authorization") });
      if (path === "/api/v3/eak/token-exchange") {
        if (failure === "denied") return Response.json({ code: "insufficient_scope", message: "denied" }, { status: 403 });
        return Response.json({ data: { accessToken: body.resource === "gumem" ? jwt({ aud: "gumem", sub: "owned-user" }) : product } });
      }
      if (path === "/api/sessions/owned-memory/context") return Response.json({ code: 0, data: { context: null } });
      if (path.endsWith("/do_anything/runs")) {
        if (failure === "lost") throw new TypeError("synthetic receipt lost");
        return Response.json({ data: { run_id: "run-owned", session_id: "session-owned" } }, { status: 202 });
      }
      throw new Error("Unexpected request: " + path);
    }) as typeof fetch,
  });
  return { client, calls };
}

describe("Task creation scope ceiling", () => {
  it("preserves the manage-only default", async () => {
    const { client, calls } = setup();
    await client.doAnything.run({ token: delegation, prompt: "Read an owned test page" });
    expect(calls.map(c => c.path.endsWith("/token-exchange") ? c.body.scopes : c.body.taskScopes)).toEqual([[MANAGE], undefined]);
    expect(calls).toHaveLength(2);
  });

  for (const api of [false, true]) it(`requests explicit control in the original task exchange (${api ? "api" : "run"})`, async () => {
    const { client, calls } = setup();
    const taskScopes = [CONTROL, MANAGE, CONTROL, READ];
    if (api) await client.doAnything.api.createRun({ token: delegation, instructions: "Ask for control", taskScopes });
    else await client.doAnything.run({ token: delegation, prompt: "Ask for control", taskScopes });
    expect(calls).toHaveLength(2);
    expect(calls[0].body).toEqual({ subjectToken: delegation, resource: "webagent", scopes: [CONTROL, MANAGE, READ].sort() });
    expect(calls[0].authorization).toMatch(/^authing synthetic-ak:/);
    expect(calls[1].authorization).toBe("Bearer " + product);
    expect(calls[1].body).not.toHaveProperty("taskScopes");
    expect(calls[1].body).not.toHaveProperty("task_scopes");
    expect(taskScopes).toEqual([CONTROL, MANAGE, CONTROL, READ]);
  });

  for (const invalid of [null, "*", new Set([CONTROL]), ["*"], ["webagent.browser_use:*"], ["gumem.memory:read"], ["agent.mail:read"], [" " + CONTROL], [CONTROL, undefined], [[CONTROL]], new Array(1), Array(129).fill(CONTROL)]) {
    it(`rejects invalid task scopes before HTTP: ${String(invalid)}`, async () => {
      const { client, calls } = setup();
      await expect(client.doAnything.run({ token: delegation, prompt: "test", taskScopes: invalid as unknown as readonly string[] })).rejects.toBeInstanceOf(QoniValidationError);
      expect(calls).toEqual([]);
    });
  }

  it("adds manage to explicit scopes and permits an empty list without expansion", async () => {
    for (const taskScopes of [[], [CONTROL]]) {
      const { client, calls } = setup();
      await client.doAnything.run({ token: delegation, prompt: "test", taskScopes });
      expect(calls[0].body.scopes).toEqual([...new Set([MANAGE, ...taskScopes])].sort());
    }
  });

  it("does not create a task or broaden the request after an authorization denial", async () => {
    const { client, calls } = setup("denied");
    await expect(client.doAnything.run({ token: delegation, prompt: "test", taskScopes: [CONTROL] })).rejects.toThrow();
    expect(calls).toHaveLength(1);
    expect(calls[0].body.scopes).toEqual([CONTROL, MANAGE].sort());
  });

  it("does not repeat creation after a lost receipt", async () => {
    const { client, calls } = setup("lost");
    await expect(client.doAnything.run({ token: delegation, prompt: "test", taskScopes: [CONTROL], requestId: "owned-request" })).rejects.toThrow();
    expect(calls).toHaveLength(2);
    expect(calls[1].body.request_id).toBe("owned-request");
  });

  it("passes an existing product token unchanged; taskScopes cannot mint more authority", async () => {
    const { client, calls } = setup();
    const token = jwt({ sub: "owned-user", aud: "webagent", scope: MANAGE, product_resource: { type: "webagent_tenant", id: "owned-project" } });
    await client.doAnything.api.createRun({ token, instructions: "test", taskScopes: [CONTROL] });
    expect(calls).toHaveLength(1);
    expect(calls[0].authorization).toBe("Bearer " + token);
    expect(calls[0].body).not.toHaveProperty("taskScopes");
  });

  it("rejects invalid runWithMemory scopes before even a memory read", async () => {
    const { client, calls } = setup();
    await expect(client.doAnything.runWithMemory({ token: delegation, prompt: "test", memory: { sessionId: "owned-memory" }, taskScopes: ["*"] })).rejects.toMatchObject({ code: "validation.failed", phase: "recall", submissionUnknown: false });
    expect(calls).toEqual([]);
  });

  it("carries explicit scopes through runWithMemory without expanding GUM authority", async () => {
    const { client, calls } = setup();
    await client.doAnything.runWithMemory({ token: delegation, prompt: "test", memory: { sessionId: "owned-memory" }, taskScopes: [CONTROL] });
    expect(calls).toHaveLength(4);
    expect(calls[0].body).toEqual({ subjectToken: delegation, resource: "gumem", scopes: ["gumem.memory:read"] });
    expect(calls[2].body).toEqual({ subjectToken: delegation, resource: "webagent", scopes: [CONTROL, MANAGE].sort() });
    expect(calls[3].body).not.toHaveProperty("taskScopes");
    expect(calls[3].body).not.toHaveProperty("task_scopes");
  });

  for (const scopes of [["webagent.browser_use:takecontrol"], ["webagent.future:authority"]]) it(`rejects unknown scopes: ${scopes}`, async () => {
    const { client, calls } = setup();
    await expect(client.doAnything.run({ token: delegation, prompt: "test", taskScopes: scopes })).rejects.toBeInstanceOf(QoniValidationError);
    expect(calls).toEqual([]);
  });

  for (const entry of ["api", "run", "memory"] as const) it(`rejects wire-spelled task_scopes before HTTP: ${entry}`, async () => {
    const { client, calls } = setup();
    const input = { token: delegation, prompt: "test", instructions: "test", task_scopes: [CONTROL] };
    const call = entry === "api" ? client.doAnything.api.createRun(input) : entry === "run" ? client.doAnything.run(input) : client.doAnything.runWithMemory({ ...input, memory: { sessionId: "owned-memory" } });
    await expect(call).rejects.toBeInstanceOf(QoniValidationError);
    expect(calls).toEqual([]);
  });
});
