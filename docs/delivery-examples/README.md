# Candidate SDK examples

These examples show how to use the candidate SDK without confusing pending work, saved login state or an uncertain write with business success. They target an **unreleased local package**, not the npm release that happens to share version 0.9.0. [中文](./README.zh-CN.md)

## Before you start

Use Node.js 18+ with fetch, the exact candidate tarball supplied for your integration and a separate writable example directory. In an application, keep AK/SK and user tokens on a trusted server. The functions below accept an existing `Qoni` client; importing them sends no requests.

The local consumer uses only synthetic credentials and a temporary loopback HTTP server. It does not contact GenAuth, Web Agent, GUMem, a browser provider or a mail provider. HTTP responses stand in for those backends; this verifies SDK usage, not production authorization or backend business readiness.

## Run the local examples

Copy the contents of this example directory to a new writable directory outside the SDK checkout. Install the **specific candidate archive**, not an unpinned npm package:

```bash
npm install --ignore-scripts /absolute/path/to/reviewed-qoni-candidate.tgz
npm run smoke
```

The private example package installs TypeScript and Node types along with the archive. `smoke` compiles all five `.ts` files against the installed package's public DTS, checks ESM and CommonJS imports and runs the loopback consumer. It records the installed ESM/CJS hashes in `local-results.json`; all 12 cases must be PASS and `resources.server_closed` must be true. The fixture contains no real purchase or email send.

## Integrate one function at a time

| File | Purpose | Required application responsibility |
| --- | --- | --- |
| [hosted-login.ts](./hosted-login.ts) | Create a hosted URL and exchange one callback code after state validation | Supply browser-session-scoped storage with atomic state match-and-consume. Register the exact redirect URI. Store returned tokens server-side; never log them. |
| [interactions.ts](./interactions.ts) | Keep the original login/control handle and submit declared ordinary fields | Pass the handle from the current run's `onInteraction`; render only to the original user. Preserve its ID. Handle errors without replacing the card or automatically retrying. |
| [profile-memory.ts](./profile-memory.ts) | Read/save the original Task user's ordinary Profile; opt into memory | Obtain only the original required scopes and current user permission. Read Profile/recall results from `.data`; `runWithMemory` instead returns `{run,memory}`. |
| [agents.ts](./agents.ts) | Create, read back and bind the same Personal Agent provisioning receipt | Persist the full initial request/idempotencyKey before create and the provisioningId after receiving it. Bind only `state: ready, ready: true` with the current human accessToken. |
| [failure-handling.ts](./failure-handling.ts) | Read a known run, stop local waiting and classify errors without secret payloads | Handle consent changes through the supported user permission UI. A local abort is not a server cancel receipt; no SDK consent-revoke method is invented here. |

`signInOnOriginalCard` waits for your UI callback, then calls `confirmSignedIn()` on that same handle. For the backend-declared `current_task` strategy, this keeps the original L/C and performs one save/release/reply. The returned example state is `awaiting_agent_verification`; it is not proof of a signed-in page. Do not call deprecated `login.confirm()` first. The SDK also retains its legacy login strategy where declared by the backend.

`submitOrdinaryForm` takes values rendered from the original `payload.fields`: preserve field names and select option values, keep numbers as numbers and use an address object. An ordinary form does not write Profile fields. Profile's actual allowlist is documented in [ordinary-task-profile.md](../ordinary-task-profile.md); payment/card data, sensitive values and phone/email verification are outside that adapter.

`startWithMemory` needs the original delegation to cover both GUM read and Do Anything manage. Ordinary `run()` still performs no recall. A failed recall prevents Task creation; after a Task POST starts, a timeout can mean the write committed. The unified candidate can project per-record sources from a matching A1 r2 backend with complete coverage. Missing coverage retains source-less legacy facts/summary; empty `sources` must stay empty. Content takes priority over source metadata in the byte budget; omitted source sets are marked unavailable and `truncated`. A stored history URL is not a verified fact citation.

Agent provisioning is a candidate API whose backend business validation is incomplete. `creating`/`mail_pending` and `ready: false` are pending, not successful binding or provider acceptance. There is no public provisioning state called `unknown`; response loss and errors can still leave an unknown outcome. Keep the original key/receipt and use `get` when the original ID is known. Do not create a replacement with a new key. Optional mailbox provisioning does not establish a public mail-send SDK method or supplier support.

## Failures and the next step

No example automatically retries a POST. `error.retryable` does not prove a write was rolled back. A hosted code with unknown exchange outcome needs a new hosted-login attempt; a known Profile/run/provisioning write requires its own original-resource readback. A 409 from an old control ID remains a 409. Extra permissions require explicit user consent; do not regrant removed scopes after narrowing or revocation.

These examples do not establish full one-hour credential/browser/provider continuity, universal action approval, or sensitive-value isolation across open browser/bash/harness channels. Read the matching backend prerequisites before integrating into your application. Keep the published version separate from this exact candidate; typed source fields require the matching backend projection.
