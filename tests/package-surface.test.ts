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
  "QoniRateLimitError",
  "QoniUpstreamError",
  "QoniTimeoutError",
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
