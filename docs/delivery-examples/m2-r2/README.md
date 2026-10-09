# Corrected memory-run error handling

Use [memory-outcome.ts](./memory-outcome.ts) only with the corrected candidate that exports `QoniTaskSubmissionUnknownError`, `QoniMemoryRunPhase` and `QoniError.phase/submissionUnknown`. [中文](./README.zh-CN.md)

The parent examples and this error example can use the same unified local candidate archive; older separate archives remain historical inputs. This additive error contract does not change `runWithMemory` inputs or its successful `{run,memory}` result, and does not retrofit ordinary `run()` errors.

`startMemoryRunOnce` submits at most once. `task_handle_returned` means a handle was returned, not that the Task completed. `submission_unknown` means the actual Task fetch was invoked but no definitive outcome was available: preserve the original request, do not automatically create a replacement and reconcile with the server where possible. It never claims the Task was definitely created.

`request_failed` preserves the SDK code/status, phase and retryable flag for explicit failures; that flag is not permission to repeat a write. `recall` and `task_permission` failures with `submissionUnknown: false` mean no Task POST was dispatched; explicit server rejection can also be `task_submit` with false. No body/cause/raw message is logged by this helper.

Install the corrected local archive in a separate consumer directory and compile against its real public DTS. Do not add a handwritten declaration or assume the original 0.9.0 candidate/npm package contains the new class. Backend/cloud validation remains separate.

Copy this subdirectory to its own writable consumer directory, then run:

```bash
npm install --ignore-scripts /absolute/path/to/reviewed-m2-corrected-candidate.tgz
npm run smoke
```

The local consumer uses synthetic loopback responses only. It checks nine cases: new ESM/CJS export, recall rejection, permission rejection, lost response, timeout, unusable success, explicit Task rejection, successful handle and omitted raw error payload. `results.json` must contain nine PASS results and a closed server. This is separate from the parent directory's 12 baseline cases.
