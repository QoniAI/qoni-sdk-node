import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const publicExports = [
  "Qoni",
  "QoniScopes",
  "QoniScopeBundles",
  "QoniEventTypes",
  "InteractionHandle",
  "InteractionTypes",
  "InteractionStatuses",
  "ActionKinds",
  "QoniError",
  "QoniAuthError",
  "QoniDelegationRequiredError",
  "QoniPermissionDeniedError",
  "QoniTokenExpiredError",
  "QoniValidationError",
  "QoniUnsupportedError",
  "QoniRateLimitError",
  "QoniUpstreamError",
  "QoniTimeoutError",
  "QoniTaskSubmissionUnknownError",
  "buildAuthorization",
  "buildSignature",
  "buildStringToSign",
] as const;
const removedConstructorExport = ["Qoni", "Agent", "Kit"].join("");

describe("built package surface", () => {
  it("exports the public API from the ESM build", async () => {
    const esm = await import("../dist/index.js");

    for (const key of publicExports) {
      expect(esm, `missing ESM export ${key}`).toHaveProperty(key);
    }
    expect(esm.Qoni.name).toBe("Qoni");
    expect(esm).not.toHaveProperty(removedConstructorExport);
  });

  it("exports the public API from the CommonJS build", () => {
    const require = createRequire(import.meta.url);
    const cjs = require("../dist/index.cjs") as Record<string, unknown>;

    for (const key of publicExports) {
      expect(cjs, `missing CJS export ${key}`).toHaveProperty(key);
    }
    expect((cjs.Qoni as { name?: string }).name).toBe("Qoni");
    expect(cjs).not.toHaveProperty(removedConstructorExport);
  });

  it("exposes the GenAuth management namespaces in both package formats", async () => {
    const esm = await import("../dist/index.js");
    const require = createRequire(import.meta.url);
    const cjs = require("../dist/index.cjs");
    for (const pkg of [esm, cjs]) {
      const client = new pkg.Qoni({ accessKey: "test", secretKey: "test" });
      expect(client.genauth.management.createRole).toBeTypeOf("function");
      expect(client.genauth.roles.assign).toBeTypeOf("function");
      expect(client.genauth.groups.addMembers).toBeTypeOf("function");
      expect(client.genauth.departments.create).toBeTypeOf("function");
      expect(client.genauth.agentMail.messages.send).toBeTypeOf("function");
      expect(client.genauth.agentMail.admin.providers.rotateCredentials).toBeTypeOf("function");
      expect(client.genauth.agentPhone.numbers.acquire).toBeTypeOf("function");
      expect(client.genauth.agentPhone.admin.policies.create).toBeTypeOf("function");
      expect(client.genauth.agentPhone.operations.wait).toBeTypeOf("function");
      expect(client.genauth.users.iterate).toBeTypeOf("function");
      expect(client.genauth.customFields.set).toBeTypeOf("function");
    }
  });

  it("does NOT export the raw internal wire-type catalog (developers use QoniEventTypes / event.type)", async () => {
    const esm = await import("../dist/index.js");
    expect(esm).not.toHaveProperty("WireEventTypes");
    expect(esm).not.toHaveProperty("WIRE_EVENT_TYPE_VALUES");
  });
});

describe("browser build", () => {
  it("is what bundlers pick for a page", () => {
    const pkg = createRequire(import.meta.url)("../package.json") as {
      browser: string;
      exports: Record<string, Record<string, string>>;
    };
    expect(pkg.browser).toBe("./dist/browser.js");
    expect(Object.keys(pkg.exports["."])).toEqual(["types", "browser", "import", "require"]);
    expect(pkg.exports["."].browser).toBe("./dist/browser.js");
  });

  it("imports no Node.js built-in and touches no Buffer or process", () => {
    const source = readFileSync(new URL("../dist/browser.js", import.meta.url), "utf8");
    expect(source).not.toMatch(/^\s*import\b[^;]*?\bfrom\s*["'][^"'.][^"']*["']/m);
    expect(source).not.toMatch(/\bBuffer\b/);
    expect(source).not.toMatch(/\bprocess\.(env|versions|platform)\b/);
  });

  it("runs a keyless client where there is no Buffer and fetch needs the window as receiver", () => {
    const browser = new URL("../dist/browser.js", import.meta.url).href;
    const script = `
      // Node's own fetch and Response use Buffer; only the SDK must not.
      const NodeBuffer = globalThis.Buffer;
      Object.defineProperty(globalThis, "Buffer", { configurable: true, get() {
        const caller = (new Error().stack ?? "").split("\\n")[2] ?? "";
        if (/browser\\.js/.test(caller)) throw new ReferenceError("Buffer is not defined");
        return NodeBuffer;
      } });
      const calls = [];
      globalThis.fetch = function (url) {
        if (this !== undefined && this !== globalThis) throw new TypeError("Illegal invocation");
        calls.push(String(url));
        return Promise.resolve(new Response(JSON.stringify({ items: [] }), { headers: { "content-type": "application/json" } }));
      };
      const b64url = (value) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
        .replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
      const token = b64url({ alg: "none" }) + "." + b64url({ aud: "webagent", name: "测试 ✓",
        product_resource: { type: "webagent_tenant", id: "proj_1" } }) + ".";
      const { Qoni, QoniUnsupportedError } = await import(${JSON.stringify(browser)});
      const app = new Qoni({ webAgentHost: "https://webagent.example.com" });
      const sessions = await app.doAnything.sessions.list({ token });
      const keyed = new Qoni({ accessKey: "ak", secretKey: "sk", host: "https://qoni.example.com" });
      let refused = "";
      try { await keyed.delegateToken({ userId: "u", products: ["doAnything"] }); }
      catch (error) { refused = error instanceof QoniUnsupportedError ? "unsupported" : String(error); }
      console.log(JSON.stringify({ sessions, calls, refused }));
    `;
    const out = execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      encoding: "utf8",
      env: { PATH: process.env.PATH ?? "" },
    });
    const result = JSON.parse(out.trim().split("\n").at(-1) ?? "{}");
    expect(result.sessions).toEqual([]);
    expect(result.calls).toHaveLength(1);
    expect(result.calls[0]).toMatch(/\/api\/v1\/projects\/proj_1\/do_anything\/sessions/);
    expect(result.refused).toBe("unsupported");
  });
});
