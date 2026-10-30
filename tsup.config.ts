import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const browserCrypto = fileURLToPath(new URL("./src/crypto.browser.ts", import.meta.url));

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
  },
  {
    // The `browser` export: the same SDK with no Node.js built-ins, for pages
    // that call WebAgent with a person's token (new Qoni({ webAgentHost })).
    entry: { browser: "src/index.ts" },
    format: ["esm"],
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    removeNodeProtocol: false,
    esbuildPlugins: [
      {
        name: "browser-crypto",
        setup(build) {
          build.onResolve({ filter: /^(node:)?crypto$/ }, () => ({ path: browserCrypto }));
        },
      },
    ],
  },
]);
