# SDK live E2E gate

This suite validates the published SDK against real EAK, GenAuth, GUMem, and
WebAgent services. Mock tests prove request shaping; these tests prove that the
same public calls work end to end and return domain evidence.

## Profiles

- `pnpm test:e2e` is the normal live suite. It requires real AK/SK and agent
  credentials. `currentUser` is visibly skipped when no logged-in user access
  token is supplied.
- `pnpm test:e2e:release` is the release gate. It additionally requires
  `EAK_USER_ACCESS_TOKEN`, so every listed capability must execute.
- Environment limitations are failures by default. For diagnosis only,
  `EAK_LIVE_ALLOW_ENV_CONSTRAINTS=1` may accept known credit, concurrency, or
  media-storage constraints; a run using that flag is not release evidence.

Required variables are `EAK_ACCESS_KEY`, `EAK_SECRET_KEY`, and `EAK_AGENT_ID`.
The release profile also requires `EAK_USER_ACCESS_TOKEN`. Optional routing and
budget variables are documented alongside the tests in `helpers.ts`.

## Capability matrix

| Area | Real behavior asserted | Test file |
| --- | --- | --- |
| Delegation and identity | silent delegation, OIDC discovery, JWKS, delegation introspection, current user | `auth-gumem.test.ts` |
| GenAuth users | list/get/batch/create/update/delete, with mutation read-back | `genauth-users.test.ts` |
| GUMem | session, synchronous message persistence and recall, resource upload, action record/recall/stream | `auth-gumem.test.ts` |
| Do Anything | create/status/events/wait, real browser content, screenshots, attach, cancel, wire escape hatch | `do-anything.test.ts` |
| Web Search | create/status/events/wait, real domain-filtered results, attach, cancel, wire escape hatch | `web-search.test.ts` |
| Deep Research | create/status/events/wait, substantive report/artifact, attach, cancel, feedback escape hatch | `deep-research.test.ts` |
| Track | create/get/refine/pause/resume/events/run-now, recurring scheduler cadence, run history/detail, attach, delete | `track.test.ts` |

Interactive delegation completion and human-in-the-loop actions need a browser
or operator to complete the user gesture. They are covered by deterministic
contract tests in this repository and belong in the central `webagent-e2e`
browser/SDK matrix for a real release environment; they must not be simulated
and called live E2E.

All live cases use unique data prefixes and clean up mutable GenAuth users and
Track monitors. Raw run evidence is written only under the ignored `.secrets/`
tree (or `EAK_OUT_DIR`) and must never be committed.
