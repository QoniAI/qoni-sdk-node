import type { AgentProvisioning, CreatePersonalAgentInput, Qoni } from '@qoniai/qoni';

/** The app must persist this exact request and key before calling create.
 * Candidate interface only: external mailbox-provider readiness is unverified.
 */
export async function createPersonalAgent(qoni: Qoni, savedRequest: CreatePersonalAgentInput) {
  return qoni.genauth.agents.create(savedRequest); // One write; no automatic retry.
}

export async function readOriginalProvisioning(qoni: Qoni, provisioningId: string) {
  return qoni.genauth.agents.get({ provisioningId }); // Same original receipt.
}

export async function bindReadyPersonalAgent(qoni: Qoni, receipt: AgentProvisioning, currentUserAccessToken: string) {
  if (receipt.state !== 'ready' || !receipt.ready) throw new Error('Agent is not ready for binding');
  return qoni.genauth.agents.bind({ provisioningId: receipt.provisioningId, accessToken: currentUserAccessToken });
}

export function provisioningProgress(receipt: AgentProvisioning) {
  if (receipt.state === 'bound' && receipt.ready) return 'bound';
  if (receipt.state === 'ready' && receipt.ready) return 'ready_to_bind';
  if (receipt.state === 'creating' || receipt.state === 'mail_pending') return 'pending';
  return 'inspect_original_operation';
  // There is no public state='unknown' in this DTS. A lost/invalid response is
  // still unknown; do not invent another Agent/key or call a pending receipt ready.
}
