import { QoniError, QoniTaskSubmissionUnknownError } from '@qoniai/qoni';
import type { DoAnythingRunWithMemoryOptions, Qoni } from '@qoniai/qoni';

/** Corrected candidate only. This handler never resubmits and never logs errors. */
export async function startMemoryRunOnce(qoni: Qoni, input: DoAnythingRunWithMemoryOptions) {
  try {
    return { state: 'task_handle_returned' as const, result: await qoni.doAnything.runWithMemory(input) };
  } catch (error) {
    if (error instanceof QoniTaskSubmissionUnknownError) {
      return { state: 'submission_unknown' as const, phase: error.phase,
        code: error.code, submissionUnknown: error.submissionUnknown, retryable: false as const };
    }
    if (error instanceof QoniError) {
      // Keep the original class/code in the caller if needed. The display below
      // uses no body, cause, raw message or token and never infers success.
      return { state: 'request_failed' as const, phase: error.phase,
        code: error.code, status: error.status, submissionUnknown: error.submissionUnknown,
        retryable: error.retryable };
    }
    throw error; // No automatic retry, including unclassified failures.
  }
}
