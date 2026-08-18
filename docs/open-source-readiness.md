# Open Source Readiness

Use this checklist before publishing or mirroring `@qoniai/qoni` as an open SDK.

## Consumer Surface

- `README.md` explains installation, quick start, authorization model, scopes,
  namespaces, response shape, errors, security notes, and development commands.
- `README.zh-CN.md` stays aligned with the English README for the primary SDK
  flow.
- `CHANGELOG.md` records public behavior changes.
- `LICENSE` is included and matches `package.json`.

## Maintainer Surface

- `CONTRIBUTING.md` defines setup, verification, API compatibility, and release
  checklist.
- `SECURITY.md` defines vulnerability reporting and credential handling.
- CI runs typecheck, tests, build, and package dry-run.
- `tests/open-source-readiness.test.ts` guards required project files and package
  metadata.

## Package Surface

- `package.json` has `main`, `module`, `types`, and conditional `exports`.
- `package.json.files` includes only package artifacts and useful docs.
- `pnpm pack --dry-run` is inspected before publish.
- `prepack` runs `pnpm build`.
- Published code is generated from `src/index.ts` through `tsup`.

## Security Review

- AK/SK must stay server-side.
- Delegation tokens and product tokens must not be logged or exposed to
  untrusted clients.
- Documentation snippets should use environment variables and placeholders only.
- New product namespaces must document scopes, token audience, and audit fields.

## Verification

Run the full local gate before publishing:

```bash
pnpm typecheck
pnpm check:brand
pnpm test
pnpm build
pnpm pack --dry-run
git diff --check
```
