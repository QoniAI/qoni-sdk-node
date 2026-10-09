import { randomUUID } from 'node:crypto';
import type { Qoni } from '@qoniai/qoni';

export interface LoginAttempt {
  state: string;
  redirectUri: string;
  expiresAt: string;
}
/** Application-owned storage scoped to the original browser session.
 * consume must atomically match/remove this session's state. Never use a global
 * shared state value or let a caller choose another user's session namespace.
 */
export interface LoginAttemptStore {
  save(attempt: LoginAttempt): Promise<void>;
  consume(state: string): Promise<LoginAttempt | undefined>;
}

export async function beginHostedLogin(qoni: Qoni, store: LoginAttemptStore, redirectUri: string) {
  const state = randomUUID();
  const page = await qoni.genauth.auth.createLoginUrl({ redirectUri, state, screen: 'signup' });
  await store.save({ state, redirectUri, expiresAt: page.expiresAt });
  return page; // Redirect only the original browser to page.url; do not log it.
}

export async function finishHostedLogin(
  qoni: Qoni, store: LoginAttemptStore,
  callback: { state?: unknown; code?: unknown; error?: unknown },
) {
  if (typeof callback.state !== 'string' || !callback.state) throw new Error('Invalid login state');
  const attempt = await store.consume(callback.state);
  if (!attempt || !Number.isFinite(Date.parse(attempt.expiresAt)) || Date.now() >= Date.parse(attempt.expiresAt)) {
    throw new Error('Login attempt is missing or expired');
  }
  if (callback.error !== undefined || typeof callback.code !== 'string' || !callback.code) {
    throw new Error('Login was not completed');
  }
  // State is consumed before this one write. On failure/unknown, start a new
  // hosted login; do not replay this code. Save tokens in the server session.
  return qoni.genauth.auth.exchangeLoginCode({ code: callback.code, redirectUri: attempt.redirectUri });
}
