import { createHmac } from "node:crypto";
import { expect, it } from "vitest";
import { Qoni, QoniValidationError, type DelegateTokenInteractiveInput } from "../src/index";

const agentId = "01234567-89ab-4cde-8f01-23456789abcd";
const host = "https://control.synthetic.invalid";
const path = "/api/v3/eak/delegations";
const redirectUri = "https://app.synthetic.invalid/callback";
const interactiveBody = { agentId, mode: "interactive", redirectUri, state: "synthetic-D", scopes: ["agent.mail:read"], expiresIn: 1800 };

function client(responseMode = "interactive") {
  const calls: { url: string; method?: string; body: Record<string, unknown>; headers: Headers }[] = [];
  const q = new Qoni({ accessKey: "synthetic-ak", secretKey: "synthetic-sk", host,
    fetch: (async (url, init) => {
      calls.push({ url: String(url), method: init?.method, body: JSON.parse(String(init?.body)), headers: new Headers(init?.headers) });
      const data = responseMode === "interactive"
        ? { mode: "interactive", grantId: "synthetic-grant", grantState: "synthetic-G", authorizationUrl: `${host}/delegations/synthetic-grant/authorize` }
        : { mode: "silent", tokenType: "Bearer", token: "synthetic-token", expiresIn: 1800, grantId: "synthetic-grant", auditId: "synthetic-audit" };
      return new Response(JSON.stringify({ statusCode: 200, data }), { headers: { "content-type": "application/json" } });
    }) as typeof fetch,
  });
  return { q, calls };
}

it.each(["interactve", "", null, 0, false, {}])("invalid JS mode %j fails locally before any transport", async mode => {
  const { q, calls } = client();
  const error = await q.delegateToken({ agentId, mode, userId: "synthetic-user", scopes: ["agent.mail:read"] } as any).catch((e: unknown) => e);
  expect(calls).toHaveLength(0);
  expect(error).toBeInstanceOf(QoniValidationError);
});

it("invalid JS mode also fails for a legacy-label request", async () => {
  const { q, calls } = client();
  const error = await q.delegateToken({ agent: "legacy-label", mode: "interactve", userId: "synthetic-user", scopes: ["gumem.memory:read"] } as any).catch((e: unknown) => e);
  expect(calls).toHaveLength(0);
  expect(error).toBeInstanceOf(QoniValidationError);
});

const deprecatedUsers = [
  ["user ref only", { user: { id: "synthetic-ref-user" } }],
  ["userId only", { userId: "synthetic-id-user" }],
  ["both same", { user: { id: "synthetic-same-user" }, userId: "synthetic-same-user" }],
  ["malicious different users", { user: { id: "synthetic-ref-victim" }, userId: "synthetic-other-victim" }],
] as const;
for (const [label, fields] of deprecatedUsers) {
  it(`interactive ${label}: signs and sends no user/userId, with one original interactive POST`, async () => {
    const { q, calls } = client();
    // Deprecated types remain accepted. The caller's object must remain untouched.
    const input: DelegateTokenInteractiveInput = Object.freeze({
      agentId, mode: "interactive", redirectUri, state: "synthetic-D", scopes: ["agent.mail:read"], expiresIn: "30m", ...fields,
    });
    const before = JSON.stringify(input);
    const result = await q.genauth.delegateAgent(input);
    expect(result.mode).toBe("interactive");
    expect(calls.map(({ headers: _headers, ...wire }) => wire)).toEqual([{ url: host + path, method: "POST", body: interactiveBody }]);
    expect(calls[0].body).not.toHaveProperty("user");
    expect(calls[0].body).not.toHaveProperty("userId");
    expect(JSON.stringify(input)).toBe(before);

    // Independent verification of the actual signature against the hand-derived
    // user-free body. This does not use the SDK's signature builder.
    const headers = calls[0].headers;
    const canonicalHeaders = [...headers.keys()]
      .filter(key => key.startsWith("x-authing-") || key === "date").sort()
      .map(key => `${key}:${headers.get(key)!.replace(/[\t\n\r\f]/g, " ").trim()}\n`).join("");
    const resource = path + `?agentId=${agentId}&expiresIn=1800&mode=interactive&redirectUri=${redirectUri}&scopes=["agent.mail:read"]&state=synthetic-D`;
    const expectedSignature = createHmac("sha1", "synthetic-sk").update("POST\n" + canonicalHeaders + resource, "utf8").digest("base64");
    // Only assert a boolean so an assertion never prints the Authorization header.
    expect(headers.get("authorization")?.endsWith(":" + expectedSignature)).toBe(true);
  });
}

for (const mode of [undefined, "silent"] as const) {
  it(`${mode === undefined ? "default" : "explicit"} silent keeps the explicit target userId despite a conflicting ref`, async () => {
    const { q, calls } = client("silent");
    const result = await q.genauth.delegateAgent({ agentId, userId: "synthetic-real-target", user: { id: "synthetic-different-ref" }, scopes: ["agent.mail:read"], ...(mode ? { mode } : {}) });
    expect(result.mode).toBe("silent");
    expect(calls).toHaveLength(1);
    expect(calls[0].body.userId).toBe("synthetic-real-target");
    expect(calls[0].body.mode).toBe(mode);
    expect(calls[0].url).toBe(host + path);
  });
}
