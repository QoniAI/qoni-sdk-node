import type { FormValues, InteractionHandle, Qoni } from '@qoniai/qoni';

export async function signInOnOriginalCard(
  handle: InteractionHandle, showToOriginalUser: (liveUrl: string) => Promise<void>,
) {
  if (handle.type !== 'site_login' || handle.status !== 'pending' ||
      !handle.can('open_login') || !handle.can('confirm_signed_in')) {
    throw new Error('The original card does not offer this sign-in flow');
  }
  const interactionId = handle.id;
  const login = await handle.openLogin();
  await showToOriginalUser(login.liveUrl); // Resolves only after this user's confirmation.
  await handle.confirmSignedIn(); // Same handle/L/C, no lookup/reopen/Profile fallback.
  return { interactionId, state: 'awaiting_agent_verification' as const };
}

export async function submitOrdinaryForm(handle: InteractionHandle, values: FormValues) {
  if (handle.type !== 'fill_form' || handle.status !== 'pending' || !handle.can('submit')) {
    throw new Error('The original card cannot accept this form');
  }
  // Render the original payload.fields; keys/options must match that card.
  // Ordinary fields only. This submission does not save a Profile.
  await handle.submit(values);
}

export async function releaseOriginalControl(qoni: Qoni, token: string, runId: string, interactionId: string) {
  // Capture interactionId from the original control response/card. A 409 is
  // propagated unchanged: never fetch a newer ID and retry this release.
  return qoni.doAnything.api.intervene({ token, runId, interactionId, action: 'release_control' });
}
