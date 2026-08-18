# Contributing

Thanks for working on `@qoniai/qoni`. This SDK is a server-side TypeScript package,
so changes should keep runtime behavior explicit, typed, and easy to audit.

## Local Setup

```bash
pnpm install
pnpm typecheck
pnpm check:brand
pnpm test
pnpm build
pnpm pack --dry-run
```

The package requires Node.js 18 or later and uses pnpm.

## Development Rules

- Keep Qoni AK/SK and delegation tokens out of browser, mobile, and public CLI
  runtimes.
- Preserve `QoniAgentKit` as the primary constructor.
- Keep `Qoni` compatible as the short constructor alias.
- Prefer `delegateToken` in new examples and docs.
- Treat `delegateAgent` and `completeDelegateAgent` as compatibility APIs.
- Keep `host` as the Qoni Console or SDK gateway address; product services are
  discovered through runtime config.
- Do not require app code to configure GenAuth, GUMem, or WebAgent URLs for the
  normal hosted path.
- Add or update tests for behavior changes.
- Update `README.md`, `README.zh-CN.md`, and `CHANGELOG.md` when public behavior
  changes.

## Pull Request Checklist

- `pnpm typecheck` passes.
- `pnpm check:brand` confirms no legacy brand identifiers remain.
- `pnpm test` passes.
- `pnpm build` passes.
- `pnpm test:package` passes for ESM and CommonJS consumers.
- `pnpm pack --dry-run` shows only intended package files.
- New or changed public APIs are documented.
- Security-sensitive changes explain token, scope, audience, and audit behavior.

## Release Checklist

1. Update `CHANGELOG.md`.
2. Confirm `package.json` version.
3. Run `pnpm typecheck && pnpm test && pnpm build`.
4. Run `pnpm pack --dry-run` and inspect the package file list.
5. Publish from a clean working tree.
