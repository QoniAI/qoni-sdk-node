import { QoniError } from '@qoniai/qoni';
import type { Qoni } from '@qoniai/qoni';

/** Safe structured diagnostics; never serialize raw Error/body/cause/tokens. */
export function errorCategory(error: unknown) {
  if (!(error instanceof QoniError)) return { category: 'unclassified' as const };
  return { category: 'qoni_error' as const, status: error.status, retryable: error.retryable };
}

export async function readKnownRun(qoni: Qoni, originalToken: string, runId: string) {
  // For timeout after a known Task ID, reattach/read; never call run() again.
  const run = await qoni.doAnything.attach(runId, { token: originalToken });
  return run.status();
}

/** Application hook, NOT an SDK revoke method and NOT a server stop receipt. */
export function stopLocalWaitingAfterConsentChange(localWait: AbortController) {
  localWait.abort(new Error('Permissions changed; stop scheduling affected calls'));
  // Use the supported user permission UI for narrowing/revocation. Respect
  // backend denial; do not silently regrant removed scopes or switch identity.
}
