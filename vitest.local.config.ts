import {defineConfig} from "vitest/config";

export default defineConfig({
  cacheDir: "node_modules/.cache/vitest",
  test: {
    setupFiles: ["./tests/helpers/personal-offline-setup.ts"],
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
  },
});
