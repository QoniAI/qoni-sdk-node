import type { GenAuthMailPersona, GenAuthMailResource, GenAuthMailExternalAccount, GenAuthMailMatchConditions, GenAuthMailExtractRule } from './generated/genauth-communication-types';

/** Native GenAuth keys select one userpool; these are separate from Qoni AK/SK. */
export type GenAuthCommunicationCredentials =
  | { accessKeyId: string; accessKeySecret: string; userPoolId: string }
  | { accessToken: string; userPoolId: string };
export interface GenAuthCommunicationAuthInput { accessToken?: string; userPoolId?: string }
export interface GenAuthCommunicationAdminInput { adminToken?: string; userPoolId?: string }
export interface GenAuthCommunicationRequestOptions { signal?: AbortSignal }
export interface GenAuthCommunicationWaitOptions extends GenAuthCommunicationRequestOptions {
  /** Total deadline, including HTTP requests and sleeps. Default 120000. */
  timeoutMs?: number;
  /** Minimum interval. Default 1000; server suggestions may increase it. */
  pollIntervalMs?: number;
}
export type GenAuthCommunicationRecord = Record<string, unknown>;
export interface GenAuthItems<T> { items: T[] }
export interface GenAuthCursorInput { cursor?: string; limit?: number }
export interface GenAuthCursorPage<T> extends GenAuthItems<T> { nextCursor: string | null }
export type GenAuthPersonaStatus = 'Activated' | 'Suspended' | 'Resigned' | 'Archived' | 'Deactivated';
export type GenAuthMailAdminAction = 'agent_mail.read' | 'agent_mail.providers' | 'agent_mail.templates' | 'agent_mail.personas' | 'agent_mail.reconcile' | 'agent_mail.delete' | 'agent_mail.retained' | 'agent_mail.audit' | 'agent_mail.permissions';
export type GenAuthMailRetainedPersona = GenAuthMailPersona & { deletedAt: string | null };
export interface GenAuthMailDeletionJob { id:string;personaId:string;requestedBy:string;deleteMode:'retain_mailboxes'|'delete_mailboxes';status:string;resourceProgress:Record<string,GenAuthCommunicationRecord>;requestedRevision:number;leaseUntil:number|null;errorCode:string|null;createdAt:number;updatedAt:number }
export interface GenAuthMailAuditEvent { id:string;actorType:string;actorId:string;action:string;objectType:string;objectId:string;requestId:string;outcome:string;errorCode:string|null;details:GenAuthCommunicationRecord;createdAt:number;updatedAt:number }
export interface GenAuthMailEvent { eventId:string;configId:string;type:string;status:string;errorCode:string|null;observedAt:string|null }
export interface GenAuthMailProviderSettings {
  allowedDomains: string[]; defaultDomain: string;
  capabilities: ('mailbox.create' | 'mail.receive' | 'mail.send')[];
  timeoutMs?: number; concurrency?: number; requestsPerMinute?: number;
  syncIntervalSeconds?: number; maxPending?: number;
}
export interface GenAuthMailProviderCreate {
  name: string; providerType: 'agentmail'; providerAccountKey: string; namespaceKey: string;
  settings: GenAuthMailProviderSettings; apiKey: string; webhookSecret?: string;
}
export interface GenAuthMailProviderUpdate { name?: string; settings?: GenAuthMailProviderSettings; acceptNewMailboxes?: boolean; serviceEnabled?: boolean }
export interface GenAuthMailProviderConfig extends Omit<GenAuthMailProviderCreate, 'apiKey' | 'webhookSecret'> {
  configId: string; webhookConfigured: boolean; acceptNewMailboxes: boolean; serviceEnabled: boolean; revision: number;
}
export interface GenAuthMailTemplateInput { name: string; platformKey: string; match: GenAuthMailMatchConditions; extract: GenAuthMailExtractRule; enabled?: boolean; version?: number }
/** Admin template responses are stored entities: rules use matchRule/extractRule. */
export interface GenAuthMailTemplate { id: string; name: string; platformKey: string; matchRule: GenAuthMailMatchConditions; extractRule: GenAuthMailExtractRule; enabled: boolean; version: number; createdAt: number; updatedAt: number }
export interface GenAuthMailTemplateTest { match: GenAuthMailMatchConditions; extract: GenAuthMailExtractRule; sender: string; subject: string; text: string }
export type GenAuthMailAdminPersona = GenAuthMailPersona & { deletedAt: string | null; activeLifecycleJobId: string | null; resources: GenAuthMailResource[]; accounts: GenAuthMailExternalAccount[] };

export interface GenAuthPhoneCost { amount: string; currency: string }
export interface GenAuthPhonePurchaseInput { quoteId: string; maxCost: GenAuthPhoneCost }
export interface GenAuthPhoneSendInput { to: string; body: string; maxCost: GenAuthPhoneCost }
export interface GenAuthPhoneQuoteInput { kind: 'number' | 'activation'; providerConfigId: string; spec: { country?: string; phone?: string; service?: string } }
export interface GenAuthPhoneVerificationInput { resourceId: string; service: string; timeoutSeconds?: number; rules: { pattern: string; sender?: string } }
export interface GenAuthPhoneNumberListInput { q?: string; state?: string; page?: number; limit?: number }
export interface GenAuthPhonePersona { id: string; displayName: string; status: GenAuthPersonaStatus; externalRef?: string | null; revision?: number }
export interface GenAuthPhoneNumber {
  id: string; personaId: string; personaName: string; phone: string | null; label: string | null;
  source: string; state: string; country?: string | null; numberType: string;
  capabilities: { smsReceive: string; smsSend: string; thirdPartyOtp: string };
  revision: number; providerConfigId: string | null;
  lease: { id: string; generation: number; state: string; startsAt: number; endsAt: number | null; nextBillingAt: number | null; details: { billingMode?: unknown } } | null;
}
export interface GenAuthPhoneNumberPage extends GenAuthItems<GenAuthPhoneNumber> { total: number; page: number; limit: number }
export interface GenAuthPhoneMessage { id: string; direction: string; from: string; to: string; status: string; createdAt: number | null; contentAvailable: boolean; cost: GenAuthCommunicationRecord | null }
export interface GenAuthPhoneVerification { id: string; personaId: string; resourceId: string; service: string; status: string; readyAt: number; expiresAt: number; candidateIds: string[]; revision: number }
export interface GenAuthPhoneActivation { id: string; personaId: string; providerConfigId: string; country: string; service: string; phone: string | null; status: string; resultState: string; costState: string; expiresAt: number; nextPollAt: number | null; revision: number; operationId: string; price: GenAuthPhoneCost; candidateIds: string[] }
export interface GenAuthPhoneOperation {
  id: string; action: string; personaId: string | null; resourceId: string | null; taskId: string | null; providerConfigId: string | null;
  status: string; stage: string; errorCode: string | null; result: GenAuthCommunicationRecord | null;
  revision: number; createdAt: number; updatedAt: number; nextAttemptAt: number;
  cost: { currency: string | null; reserved: string | null; settled: boolean };
}
export interface GenAuthPhoneResult { candidateId: string; value: string; [key: string]: unknown }
export interface GenAuthPhoneResultPage extends GenAuthItems<GenAuthPhoneResult> { expiresAt: number }
export interface GenAuthPhoneBindings extends GenAuthItems<{ accountId: string; platformKey: string; username: string | null; purposes: string[]; isCurrent: boolean }> {}
export interface GenAuthPhoneCandidate { phone:string;country:string;numberType:string;smsReceive:string;smsSend:string;thirdPartyOtp:string }
export interface GenAuthPhoneCatalogEntry { service:string;offers:{operator:string;count:number;amount:string;currency:string}[] }
/** Quotes are server-created, valid for two minutes, and scoped to the creating actor/persona. */
export interface GenAuthPhoneQuote { id: string; personaId: string; kind: 'number' | 'activation'; providerConfigId: string; amount: string; currency: string; expiresAt: number; configRevision: number; [key: string]: unknown }
export interface GenAuthPhoneProviderSettings {
  countries: string[]; services: string[]; currency: string; dailyLimit: string; pricingVerified: boolean;
  verifiedRoutes: ('phone.acquire' | 'sms.send' | 'activation.create')[];
  pricingEvidence?: string; numberMonthlyCap?: string; setupPriceCap?: string; smsSegmentCap?: string; maxSmsSegments?: number;
}
export type GenAuthPhoneProviderCreate = { name: string; settings: GenAuthPhoneProviderSettings } & (
  | { provider: 'twilio'; credentials: { accountSid: string; authToken: string; apiKeySid?: string; apiKeySecret?: string } }
  | { provider: '5sim'; credentials: { token: string } }
);
export interface GenAuthPhoneProviderUpdate { name?: string; settings?: GenAuthPhoneProviderSettings; enabled?: boolean; credentials?: { accountSid: string; authToken: string; apiKeySid?: string; apiKeySecret?: string } | { token: string } }
export interface GenAuthPhoneProvider { id: string; name: string; provider: 'twilio' | '5sim'; settings: GenAuthPhoneProviderSettings; enabled: boolean; revision: number; credentialVersion: number; credentialsConfigured: boolean; health: GenAuthCommunicationRecord & { state: string; fresh: boolean }; healthValidUntil: number | null; lastCheckedAt: number | null }
export type GenAuthPhoneAction = 'phone.read' | 'phone.manual.manage' | 'phone.acquire' | 'phone.release' | 'sms.read' | 'sms.content.read' | 'sms.send' | 'verification.read' | 'verification.create' | 'verification.cancel' | 'verification.consume' | 'activation.read' | 'activation.create' | 'activation.cancel' | 'activation.finish' | 'activation.consume' | 'phone.provider.read' | 'phone.provider.test' | 'phone.provider.manage' | 'phone.policy.manage' | 'phone.operation.read' | 'phone.reconcile' | 'phone.persona.manage';
export interface GenAuthPhonePolicyInput { actorId: string; actorType: 'admin' | 'key'; personaIds: string[]; resourceIds: string[]; actions: GenAuthPhoneAction[]; enabled: boolean; limits?: { maxCost?: string }; expiresAt?: number }
export interface GenAuthPhonePolicy extends Omit<GenAuthPhonePolicyInput, 'expiresAt'> { id: string; revision: number; createdAt: number; updatedAt: number; expiresAt: number | null }
