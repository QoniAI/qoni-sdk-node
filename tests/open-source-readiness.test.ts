import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as Record<string, unknown>;
}

function expectFile(path: string): void {
  expect(statSync(join(root, path)).isFile()).toBe(true);
}

function expectNoFile(path: string): void {
  expect(existsSync(join(root, path))).toBe(false);
}

function readText(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("open-source readiness", () => {
  it("keeps maintainer-facing repository files in place", () => {
    [
      "CHANGELOG.md",
      "CONTRIBUTING.md",
      "SECURITY.md",
      "docs/open-source-readiness.md",
    ].forEach(expectFile);
    expectNoFile(".github/workflows/ci.yml");
  });

  it("publishes package metadata expected from an open SDK", () => {
    const pkg = readJson("package.json");
    expect(pkg.repository).toEqual({
      type: "git",
      url: "git+https://github.com/QONIAI/qoni-sdk-node.git",
    });
    expect(pkg.bugs).toEqual({
      url: "https://github.com/QONIAI/qoni-sdk-node/issues",
    });
    expect(pkg.homepage).toBe(
      "https://github.com/QONIAI/qoni-sdk-node#readme",
    );
    expect(pkg.publishConfig).toEqual({ access: "public" });
    expect(pkg.scripts).toMatchObject({
      "check:brand": "node scripts/check-brand.mjs",
      "test:mock": "vitest run --coverage=false tests/qoni.test.ts tests/semantic-surface.test.ts tests/open-source-readiness.test.ts tests/complete-coverage.test.ts tests/event-catalog.test.ts tests/interactions.test.ts tests/contract-surface.test.ts tests/sse-abort.test.ts tests/do-anything-evidence.test.ts tests/query-matrix.test.ts tests/live-evidence.test.ts tests/site-login-settle-track.test.ts",
      "test:e2e": "QONI_LIVE_E2E=1 vitest run --coverage=false --fileParallelism=false --maxWorkers=1 --testTimeout=120000 tests/live-e2e/*.test.ts",
      "test:e2e:do-anything": "QONI_LIVE_E2E=1 vitest run --coverage=false --fileParallelism=false --maxWorkers=1 --testTimeout=120000 tests/live-e2e/do-anything.test.ts",
      "test:e2e:do-anything:release": "QONI_LIVE_E2E=1 QONI_LIVE_ALLOW_ENV_CONSTRAINTS=0 vitest run --coverage=false --fileParallelism=false --maxWorkers=1 --testTimeout=120000 tests/live-e2e/do-anything.test.ts",
      "test:e2e:matrix": "QONI_LIVE_E2E=1 QONI_QUERY_MATRIX=1 QONI_LIVE_ALLOW_ENV_CONSTRAINTS=0 vitest run --coverage=false --fileParallelism=false --maxWorkers=1 tests/live-e2e/query-matrix.test.ts",
      "test:e2e:release": "QONI_LIVE_E2E=1 QONI_LIVE_REQUIRE_ALL=1 QONI_LIVE_ALLOW_ENV_CONSTRAINTS=0 vitest run --coverage=false --fileParallelism=false --maxWorkers=1 --testTimeout=120000 tests/live-e2e/*.test.ts",
      "test:package": "vitest run --coverage=false tests/package-surface.test.ts",
      "test:ci": "pnpm test:mock && pnpm test:package",
      "pack:dry-run": "pnpm build && pnpm pack --dry-run",
      prepack: "pnpm build",
    });
    expect(pkg.scripts).not.toHaveProperty("typecheck:examples");
    expect(pkg.files).toEqual([
      "dist",
      "README.md",
      "README.zh-CN.md",
      "CHANGELOG.md",
      "LICENSE",
      "docs",
      "skills",
    ]);
    expect(pkg.directories).toEqual({
      doc: "docs",
      test: "tests",
    });
  });

  it("keeps the published skill instructions aligned with the real skill name and agent shape", () => {
    const readme = readText("README.md");
    const zhReadme = readText("README.zh-CN.md");
    const skill = readText("skills/qoni-sdk/SKILL.md");

    expect(readme).toContain("--skill qoni-sdk");
    expect(readme).not.toContain("--skill qoni\n");
    expect(zhReadme).toContain("--skill qoni-sdk");
    expect(zhReadme).not.toContain("--skill qoni\n");

    [readme, zhReadme, skill].forEach((text) => {
      expect(text).not.toMatch(/agent:\s*\{\s*id:/);
    });

    expect(readme).toContain("agent must be a string");
    expect(readme).toContain("eak.delegation.user_not_bound");
    expect(readme).toContain("eak.token_exchange.upstream_failed");
    expect(readme).toContain("grant_type is not enabled");
    expect(readme).toContain("QONI_USER_ID");
    expect(readme).not.toContain('userId: "user_1"');
    expect(readme).toContain("genauth.users.list");
    expect(readme).toContain("/api/v3/eak/genauth/admin-token");
    expect(zhReadme).toContain("agent must be a string");
    expect(zhReadme).toContain("eak.delegation.user_not_bound");
    expect(zhReadme).toContain("eak.token_exchange.upstream_failed");
    expect(zhReadme).toContain("grant_type is not enabled");
    expect(zhReadme).toContain("QONI_USER_ID");
    expect(zhReadme).not.toContain('userId: "user_1"');
    expect(zhReadme).toContain("genauth.users.list");
    expect(zhReadme).toContain("/api/v3/eak/genauth/admin-token");
    expect(skill).toContain("QONI_USER_ID");
    expect(skill).toContain("eak.token_exchange.upstream_failed");
    expect(skill).toContain("grant_type is not enabled");
    expect(skill).toContain("genauth.users.*");
    expect(skill).toContain("/api/v3/eak/genauth/admin-token");

    [readme, zhReadme, skill].forEach((text) => {
      expect(text).toContain("new Qoni(");
    });
  });

  it("keeps the public Qoni API on the currently deployed server wire contract", () => {
    const client = readText("src/client.ts");
    const types = readText("src/types.ts");
    const smoke = readText("scripts/qoni-auth-gum-smoke.mjs");

    [client, smoke].forEach((text) => {
      expect(text).toContain("/api/v3/eak/runtime-config");
      expect(text).toContain("/api/v3/eak/delegations");
      expect(text).toContain("eak_delegation_token");
      expect(text).not.toContain("/api/v3/qoni/");
      expect(text).not.toContain("qoni_delegation_token");
      expect(text).not.toContain("qoni_tenant_id");
    });
    expect(types).toContain("eakBaseUrl?: string");
    expect(types).toContain("eak?: string | { baseUrl?: string; url?: string; host?: string }");
    expect(smoke).toContain("eak_tenant_id");
  });

  it("allows manual releases without repository sync jobs", () => {
    const ci = readText(".gitlab-ci.yml");

    expect(ci).toContain('if: \'$CI_COMMIT_BRANCH == "main"\'');
    expect(ci).toContain("if: '$CI_COMMIT_TAG =~ /^v/'");
    expect(ci).not.toContain("GITHUB_REPOSITORY");
    expect(ci).not.toContain("git push");
    expect(ci).not.toMatch(/^sync(?:_\w+)?:/m);
    expect(ci).toContain("npm whoami");
    expect(ci).toContain('test -n "$QONI_NPM_TOKEN"');
    expect(ci).toContain('"$QONI_NPM_TOKEN" > .npmrc');
    expect(ci).not.toMatch(/\$NPM_TOKEN\b/);
    expect(ci).toContain("npm org ls qoniai --json");
    expect(ci).not.toContain("typecheck:examples");
  });
});
