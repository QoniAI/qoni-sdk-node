import { afterEach, describe, expect, it, vi } from "vitest";
import { Qoni } from "../src";
import { base64Bytes, utf8Length } from "../src/encoding";

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

const token = jwt({
  aud: "webagent",
  sub: "user_1",
  exp: 1_900_000_000,
  // Non-ASCII in a claim: base64url output then uses `-` and `_`.
  name: "测试用户 ✓",
  scope: "webagent.do_anything:read webagent.do_anything:manage",
  product_resource: { type: "webagent_tenant", id: "proj_1" },
});

/** A browser's `fetch`: called with any receiver but `window` it throws. */
function windowFetch(calls: string[]) {
  return function fetch(this: unknown, url: URL | RequestInfo): Promise<Response> {
    if (this !== undefined && this !== globalThis) {
      throw new TypeError("Failed to execute 'fetch' on 'Window': Illegal invocation");
    }
    calls.push(String(url));
    return Promise.resolve(new Response(JSON.stringify({ items: [], total: 0, has_more: false }), {
      headers: { "content-type": "application/json" },
    }));
  } as typeof fetch;
}

describe("a keyless client in a browser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Without Buffer: the browser build runs in a Buffer-less process in
  // tests/package-surface.test.ts (vitest itself needs Buffer).
  it("runs with the page's own fetch", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", windowFetch(calls));

    const app = new Qoni({ webAgentHost: "https://webagent.example.com" });
    expect(await app.doAnything.sessions.list({ token })).toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatch(/^https:\/\/webagent\.example\.com\/api\/v1\/projects\/proj_1\/do_anything\/sessions/);
  });

  it("calls a fetch it was handed without binding it to the client", async () => {
    const calls: string[] = [];
    const app = new Qoni({ webAgentHost: "https://webagent.example.com", fetch: windowFetch(calls) });
    expect(await app.doAnything.sessions.list({ token })).toEqual([]);
    expect(calls).toHaveLength(1);
  });
});

describe("encoding without Node", () => {
  it("decodes base64 and base64url exactly as Node does", () => {
    for (let length = 0; length < 70; length++) {
      const bytes = Uint8Array.from({ length }, (_, i) => (i * 97 + length * 31) % 256);
      const buffer = Buffer.from(bytes);
      expect(base64Bytes(buffer.toString("base64"))).toEqual(bytes);
      expect(base64Bytes(buffer.toString("base64url"))).toEqual(bytes);
    }
  });

  it("counts UTF-8 bytes as Node does, unpaired surrogates included", () => {
    for (const text of ["", "abc", "测试 ✓", "😀", "\uD800", "a\uDC00b"]) {
      expect(utf8Length(text)).toBe(Buffer.byteLength(text, "utf8"));
    }
  });
});
