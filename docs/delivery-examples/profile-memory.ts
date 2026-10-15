import type { Qoni } from '@qoniai/qoni';

export async function readOriginalUserProfile(qoni: Qoni, token: string, runId: string) {
  const { data } = await qoni.doAnything.profile.read({ token, runId, fields: ['name', 'address'] });
  return data; // Current user's authorized UI only; do not log private profile values.
}

export async function saveExplicitOrdinaryName(qoni: Qoni, token: string, runId: string, name: string) {
  // Caller has explicitly chosen to save and obtained original user.profile:write.
  // Backend checks the original Task and current field permission. One write only.
  const { data } = await qoni.doAnything.profile.update({ token, runId, values: { name } });
  return data;
}

export async function recallForDisplay(qoni: Qoni, token: string, sessionId: string) {
  const { data: context } = await qoni.gumem.recallContext({
    token, sessionId, query: 'confirmed preferences', maxItems: 8, maxContextBytes: 4096,
  });
  // facts/summary can have sources=[] and sourceStatus='unavailable'.
  // Stored history URLs are message metadata, not verified fact citations.
  return context;
}

export async function startWithMemory(qoni: Qoni, originalDelegationToken: string, sessionId: string) {
  return qoni.doAnything.runWithMemory({
    token: originalDelegationToken, prompt: 'Use my confirmed preferences to plan a synthetic itinerary.',
    memory: { sessionId, query: 'confirmed preferences', maxItems: 8, maxContextBytes: 4096 },
    timeoutMs: 30_000,
  }); // { run, memory }; does not opt ordinary run() into recall.
}
