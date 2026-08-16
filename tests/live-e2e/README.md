# SDK live E2E gate

This suite validates the published SDK against real EAK, GenAuth, GUMem, and
WebAgent services. Mock tests prove request shaping; these tests prove that the
same public calls work end to end and return domain evidence.

## Profiles

- `pnpm test:e2e` is the normal live suite. It requires real AK/SK and agent
  credentials plus the ignored local Query matrix described below.
  `currentUser` is visibly skipped when no logged-in user access token is
  supplied.
- `pnpm test:e2e:release` is the release gate. It additionally requires
  `EAK_USER_ACCESS_TOKEN`, so every listed capability must execute.
- `pnpm test:e2e:do-anything:release` runs the focused Browser Harness gate.
  It executes one real `doAnything` task and fails unless the SDK captures the
  complete Agent/tool trace, Browser Harness script authoring + execution,
  screenshots, recording, final output, and observability metrics.
- `pnpm test:e2e:matrix` runs 10-20 local, public, reproducible Queries through
  multiple SDK functions. Exact Queries and deployment routing stay in an
  ignored local document; only the reusable runner, schema, assertions, and
  evidence contract live in the repository.
- Environment limitations are failures by default. For diagnosis only,
  `EAK_LIVE_ALLOW_ENV_CONSTRAINTS=1` may accept known credit, concurrency, or
  media-storage constraints; a run using that flag is not release evidence.

Required variables are `EAK_ACCESS_KEY`, `EAK_SECRET_KEY`, and `EAK_AGENT_ID`.
The release profile also requires `EAK_USER_ACCESS_TOKEN`. Exact Query text,
expected public results, runtime URLs, ports, and per-Case budgets come only
from the ignored local matrix file. They must not be copied into test source.

## Per-function HTTP evidence (opt-in)

`EAK_LIVE_EVIDENCE_DIR=<dir>` turns on a recorder that wraps the SDK's
injectable `fetch` and appends one JSONL record per real HTTP round trip, tagged
with the vitest test that caused it (`expect.getState().currentTestName`).
It is **off by default**: with the variable unset, `liveClient()` passes no
`fetch` override and the suite behaves exactly as it did before.

```bash
EAK_LIVE_E2E=1 EAK_LIVE_EVIDENCE_DIR=/tmp/eak-evidence \
  vitest run --coverage=false --fileParallelism=false --maxWorkers=1 \
    --reporter=json --outputFile=/tmp/eak-evidence/vitest.json tests/live-e2e/
```

- `evidence.ts` — the recorder. It records in two phases (`kind:"call"` when the
  response headers arrive, `kind:"body"` when the body ends, joined on `id`), so
  a long-lived SSE stream still leaves evidence if the process dies mid-stream.
  One file per PID, because vitest uses a worker process per test file.
- `redact.ts` — allow-list redaction. URLs keep only their pathname plus a host
  alias, headers are allow-listed, bodies are walked recursively with
  credential-keyed values replaced and *learned*, and the serialized line gets a
  final structural pass (JWT / Bearer / IPv4 / EC2 DNS / Browserbase URLs /
  local absolute paths). Captured records are meant to be publishable, so
  redaction is a gate, not a nicety.
- `function-map.ts` — generated mapping from every catalogued public function to
  the `describe > it` blocks that cover it. Attributing a recorded call to a
  function is a join on that mapping, never a fuzzy match on the test title.
- `../live-evidence.test.ts` (mock suite) — asserts the mapping covers all 94
  catalogued functions, that every referenced test resolves to a real block in
  the live sources, and that redaction removes planted credentials both at the
  unit level and across a full recorded round trip.

Tuning: `EAK_LIVE_EVIDENCE_MAX_BODY_CHARS` (default 4000) and
`EAK_LIVE_EVIDENCE_MAX_STREAM_CHARS` (default 8000) cap what is stored;
`responseBytes` always reports the untruncated size.

## Capability matrix

| Area | Real behavior asserted | Test file |
| --- | --- | --- |
| Delegation and identity | silent delegation, OIDC discovery, JWKS, delegation introspection, current user/userinfo, bound-user resolution, configured signed raw requests | `auth-gumem.test.ts` |
| GenAuth users | list/get/batch/create/update/delete, with mutation read-back | `genauth-users.test.ts` |
| GUMem | session, synchronous message persistence and recall, resource upload, action record/recall/stream | `auth-gumem.test.ts` |
| Do Anything | create/status/events/wait, real browser content, screenshots, attach, cancel, wire escape hatch | `do-anything.test.ts` |
| Web Search | create/status/events/wait, real domain-filtered results, attach, cancel, wire escape hatch | `web-search.test.ts` |
| Deep Research | create/status/events/wait, substantive report/artifact, attach, cancel, feedback escape hatch | `deep-research.test.ts` |
| Track | create/get/refine/pause/resume/events/run-now, recurring scheduler cadence, run history/detail, attach, delete | `track.test.ts` |
| Wire escape hatch | every `<product>.api.*` method: snake_case create/read envelopes, raw SSE streams, tick history, session artifacts/recording, report artifacts, and the documented refusal codes for state-illegal calls | `wire-api.test.ts` |
| Delegation | silent delegation via both entry points and both `eak.*` aliases, token claims, interactive authorization grant, and the exchange route's refusal without a human-approved code | `delegation.test.ts` |
| Interactions (HITL) | a backend-emitted `run.interaction` reaching `wait({ onInteraction })`, `run.interactionHandle()`, `can()`, and the dead-affordance guard on all 11 action methods | `interactions.test.ts` |

> The action methods on `InteractionHandle` are covered on their **guard** path
> only: this deployment never emits a *pending* interaction that declares
> actions, so the HTTP POST behind `answer()` / `confirmSignedIn()` / … stays
> unverified. `interactions.test.ts` records what was tried to induce one.

## Do Anything: real SDK call and evidence

The focused gate selects a `doAnything.run` Case from the ignored local matrix
and passes that Case's actual input to the public SDK. The delegated token is
kept in memory and is never written to evidence files. The code stays generic;
the local evidence contains the exact invocation that actually ran.

```ts
const { token } = await client.delegateToken({
  mode: "silent",
  user: { id: userId },
  agent: process.env.EAK_AGENT_ID,
  scopes: ["webagent.do_anything:read", "webagent.do_anything:manage"],
});

const matrix = loadQueryMatrix();
const testCase = selectQueryMatrixCase(matrix, "doAnything.run");
const run = await client.doAnything.run({ token, ...testCase.input });

const result = await run.wait({
  timeoutMs: testCase.timeoutMs ?? matrix.runtime.timeoutMs,
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

Set `EAK_DO_ANYTHING_CASE_ID` to choose a specific local `doAnything.run` Case;
otherwise the first matching Case is used. Web Search, Deep Research, and Track
follow the same rule with their product-specific `EAK_*_CASE_ID` selector.

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

## Local public Query matrix

The matrix deliberately separates reusable product code from local runtime
details:

| Repository contains | Ignored `.secrets/query-matrix/` contains |
| --- | --- |
| SDK function adapters | Exact public Query text |
| Function input schema | Deployment host, URL, and port |
| Semantic result assertions | Per-run raw events, outputs, screenshots, and artifacts |
| Browser Harness evidence gate | Batch and case result files |

Create `.secrets/query-matrix/cases.local.json` (or point
`EAK_QUERY_MATRIX_FILE` at another ignored JSON file). Credentials are never
valid matrix fields: `EAK_ACCESS_KEY`, `EAK_SECRET_KEY`, and `EAK_AGENT_ID`
continue to come from the environment or ignored `.env.local`.

The local document accepts between 10 and 20 cases and at least two of these
public SDK entry functions:

| `function` | Public input represented by each case | Evidence and checks |
| --- | --- | --- |
| `doAnything.run` | `prompt`, `capture`, `limits`, and other documented run options | status/wait/attach/cancel, complete raw + semantic streams, Agent messages, tool parameters/results, Browser Harness authored code + execution, screenshots, recording, output |
| `webSearch.run` | `prompt`, `maxResultsPerQuery`, site allow/deny lists | status/wait/attach/cancel, raw + semantic streams, complete result items |
| `deepResearch.run` | `prompt`, depth, output format, audience, domain lists, limits | status/wait/attach/cancel, raw + semantic streams, final report and downloaded artifacts; set `requireComplete` to reject declared partial sections |
| `track.create` | `prompt`, schedule, extraction schema, tick instructions, trigger/notification options | create/get/attach/runNow/events/runs/run/delete and the completed tick detail |

Use only public HTTPS pages in `publicSources`. A minimal shape is shown below;
placeholders are intentional so repository history never contains a deployment
address or a real test Case:

```json
{
  "schemaVersion": 1,
  "runtime": {
    "eakHost": "<control-plane-base-url>",
    "webAgentBaseUrl": "<webagent-base-url>",
    "rawRequestPath": "<safe-control-plane-path>",
    "timeoutMs": 120000
  },
  "cases": [
    {
      "id": "<stable-public-case-id>",
      "title": "<human-readable-purpose>",
      "function": "doAnything.run",
      "publicSources": ["https://<public-source>/"],
      "input": {
        "prompt": "<public-reproducible-query>",
        "capture": { "screenshots": true },
        "limits": { "maxDurationMinutes": 5 }
      },
      "assertions": {
        "expectedText": ["<deterministic-public-result>"],
        "requireScreenshots": true,
        "requireBrowserHarness": true
      },
      "timeoutMs": 360000
    }
  ]
}
```

Run the matrix sequentially (to respect browser concurrency limits):

```bash
pnpm test:e2e:matrix
```

Each batch is written to
`.secrets/query-matrix/runs/query-matrix-<timestamp>/`. `summary.json` reports
pass/fail by SDK function; every child directory contains the exact local Case,
actual invocation result, raw SSE frames, semantic events, function touchpoints,
and any screenshots/artifacts. None of these files belong in a commit.
