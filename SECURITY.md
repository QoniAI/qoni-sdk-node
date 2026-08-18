# Security Policy

`@qoniai/qoni` handles server-side credentials and short-lived tokens. Treat issues
in credential handling, token exchange, scope enforcement, or runtime discovery
as security-sensitive.

## Supported Versions

| Version | Supported |
| --- | --- |
| `0.4.x` | Yes |

## Reporting a Vulnerability

Report suspected vulnerabilities privately through the project issue tracker or
the internal security response channel used by the Qoni team. Do not include live
AK/SK values, access tokens, delegation tokens, product tokens, customer data, or
recordings in public issues.

Please include:

- affected SDK version
- affected method or namespace
- expected security boundary
- observed behavior
- minimal reproduction without real credentials
- request IDs, trace IDs, or audit IDs when available

## Credential Handling

- Keep Qoni `accessKey` and `secretKey` on trusted servers only.
- Do not ship AK/SK to browsers, mobile apps, public CLIs, or untrusted Agent
  runtimes.
- Do not log AK/SK, delegation tokens, or exchanged product access tokens.
- Rotate credentials if they may have been exposed.
- Prefer narrow scopes and short token lifetimes for Agent actions.
- Preserve `auditId`, `requestId`, and `traceId` in product logs when incident
  investigation matters.

## Dependency Updates

Security dependency updates should include the normal verification set:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm pack --dry-run
```
