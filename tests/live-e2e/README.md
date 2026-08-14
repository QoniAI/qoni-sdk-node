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
- `pnpm test:e2e:do-anything:release` runs the focused Browser Harness gate.
  It executes one real `doAnything` task and fails unless the SDK captures the
  complete Agent/tool trace, Browser Harness script authoring + execution,
  screenshots, recording, final output, and observability metrics.
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

## Do Anything: real SDK call and evidence

The focused gate uses the public SDK path below. The prompt and run options are
real values. The delegated token is intentionally kept in memory and is never
written to evidence files.

```ts
const { token } = await client.delegateToken({
  mode: "silent",
  user: { id: userId },
  agent: process.env.EAK_AGENT_ID,
  scopes: ["webagent.do_anything:read", "webagent.do_anything:manage"],
});

const run = await client.doAnything.run({
  token,
  prompt:
    "Open https://en.wikipedia.org/wiki/Universally_unique_identifier in the browser " +
    "and report the article's exact title.",
  capture: { screenshots: true },
  limits: { maxDurationMinutes: 5 },
});

const result = await run.wait({
  timeoutMs: 360_000,
  onWireEvent: (event) => recorder.recordWireEvent(event),
  onEvent: (event) => recorder.recordSemanticEvent(event),
  onReconnect: (info) => recorder.recordReconnect(info),
  onScreenshot: (image, index) => recorder.recordScreenshot(image, index),
});
```

Run it with:

```bash
pnpm test:e2e:do-anything:release
```

The default task can be changed with `EAK_DO_ANYTHING_PROMPT`; when changing it,
set `EAK_DO_ANYTHING_EXPECTED_PATTERN` to a case-insensitive regular expression
that must match the final Agent output.

Each run writes a self-contained evidence directory under
`.secrets/runs/do_anything-<run-id>/` (or exactly `EAK_OUT_DIR`):

- `invocation.json` — actual prompt and run options; credentials omitted.
- `events.raw.jsonl` — every original SSE frame before SDK filtering.
- `events.semantic.jsonl` — the curated `RunEvent` stream consumed by apps.
- `result.json` and `status.initial.json` — complete REST run envelopes.
- `recording.json` — session recording returned by the SDK wire escape hatch.
- `error.json` — original error name, message, stack, and cause when the run fails.
- `agent-messages.json` — complete projected Agent/LLM messages and usage fields.
- `tools.json` — paired tool inputs, outputs/errors, timestamps, and outcomes.
- `browser-harness.json` — authored Python source plus the matching
  `browser-harness run ...` command and execution result.
- `screenshots/` + `screenshots.jsonl` — decoded images and page/step index.
- `reconnects.jsonl` — resumable SSE reconnect attempts.
- `metrics.json` — event counts, message/tool counts, Browser Harness proof,
  latency-to-first-event metrics, model/token usage, cost, failures, and terminal
  status.
- `manifest.json` — stable file index for the HTML report generator.

The focused release gate rejects runs that cannot prove all of the following:

1. successful terminal result with non-empty Agent output;
2. Agent messages plus paired tool-call/tool-result lifecycle;
3. a newly authored `browser-tools/*.py` file with its actual code;
4. execution through `browser-harness run browser-tools/*.py`;
5. at least one decoded browser screenshot and a readable session recording;
6. no failed tool lifecycle events.

Interactive delegation completion and human-in-the-loop actions need a browser
or operator to complete the user gesture. They are covered by deterministic
contract tests in this repository and belong in the central `webagent-e2e`
browser/SDK matrix for a real release environment; they must not be simulated
and called live E2E.

All live cases use unique data prefixes and clean up mutable GenAuth users and
Track monitors. Raw run evidence is written only under the ignored `.secrets/`
tree (or `EAK_OUT_DIR`) and must never be committed.
