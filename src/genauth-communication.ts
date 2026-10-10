import { QoniError, QoniValidationError, QoniTimeoutError, QoniUpstreamError } from './errors';
import type { JsonObject, QoniResponse, QoniTransport } from './types';
import type { GenAuthAdminToken, GenAuthAdminTokenProvider } from './genauth-management';
import type { GenAuthCommunicationCredentials, GenAuthCommunicationRequestOptions, GenAuthCommunicationWaitOptions } from './genauth-communication-types';
import type { GenAuthCommunicationClient, GenAuthAgentMailOperationsGetInput, GenAuthAgentMailOperationsGetResult, GenAuthAgentMailVerificationsGetInput, GenAuthAgentMailVerificationsGetResult, GenAuthAgentPhoneOperationsGetInput, GenAuthAgentPhoneOperationsGetResult, GenAuthAgentPhoneVerificationsGetInput, GenAuthAgentPhoneVerificationsGetResult, GenAuthAgentPhoneAdminOperationsGetInput, GenAuthAgentPhoneAdminOperationsGetResult, GenAuthAgentPhoneAdminVerificationsGetInput, GenAuthAgentPhoneAdminVerificationsGetResult } from './generated/genauth-communication-types';
import { genAuthCommunicationRoutes } from './generated/genauth-communication-routes';

type Wait<I, R> = (input: I, options?: GenAuthCommunicationWaitOptions) => Promise<QoniResponse<R>>;
export type GenAuthAgentMailClient = GenAuthCommunicationClient['agentMail'] & {
  withCredentials(credentials: GenAuthCommunicationCredentials): GenAuthAgentMailClient;
  operations: GenAuthCommunicationClient['agentMail']['operations'] & { wait: Wait<GenAuthAgentMailOperationsGetInput, GenAuthAgentMailOperationsGetResult> };
  verifications: GenAuthCommunicationClient['agentMail']['verifications'] & { wait: Wait<GenAuthAgentMailVerificationsGetInput, GenAuthAgentMailVerificationsGetResult> };
};
export type GenAuthAgentPhoneClient = GenAuthCommunicationClient['agentPhone'] & {
  withCredentials(credentials: GenAuthCommunicationCredentials): GenAuthAgentPhoneClient;
  admin: GenAuthCommunicationClient['agentPhone']['admin'] & {
    operations: GenAuthCommunicationClient['agentPhone']['admin']['operations'] & { wait: Wait<GenAuthAgentPhoneAdminOperationsGetInput, GenAuthAgentPhoneAdminOperationsGetResult> };
    verifications: GenAuthCommunicationClient['agentPhone']['admin']['verifications'] & { wait: Wait<GenAuthAgentPhoneAdminVerificationsGetInput, GenAuthAgentPhoneAdminVerificationsGetResult> };
  };
  operations: GenAuthCommunicationClient['agentPhone']['operations'] & { wait: Wait<GenAuthAgentPhoneOperationsGetInput, GenAuthAgentPhoneOperationsGetResult> };
  verifications: GenAuthCommunicationClient['agentPhone']['verifications'] & { wait: Wait<GenAuthAgentPhoneVerificationsGetInput, GenAuthAgentPhoneVerificationsGetResult> };
};
type Route = (typeof genAuthCommunicationRoutes)[number];
const authKeys = ['accessToken', 'adminToken', 'userPoolId'];
const headerKeys = ['idempotencyKey', 'revision'];

export function createGenAuthCommunication(transport: QoniTransport, adminProvider?: GenAuthAdminTokenProvider, credentials?: GenAuthCommunicationCredentials): { agentMail: GenAuthAgentMailClient; agentPhone: GenAuthAgentPhoneClient } {
  const runtimeProvider = nativeTokenProvider(transport, credentials);
  const result: Record<string, any> = {};
  for (const route of genAuthCommunicationRoutes) {
    let group = result;
    const parts = route.name.split('.');
    for (const part of parts.slice(0, -1)) group = group[part] ??= {};
    group[parts.at(-1)!] = (input: JsonObject = {}, options: GenAuthCommunicationRequestOptions = {}) => request(route, input, options);
  }
  async function request(route: Route, input: JsonObject, options: GenAuthCommunicationRequestOptions) {
    options.signal?.throwIfAborted();
    validate(route, input);
    const admin = route.name.includes('.admin.');
    const override = input[admin ? 'adminToken' : 'accessToken'];
    const provider = admin ? adminProvider : runtimeProvider;
    if (override !== undefined && (typeof override !== 'string' || !override.trim() || typeof input.userPoolId !== 'string' || !input.userPoolId.trim())) throw new QoniValidationError('GenAuth token override requires a non-empty token and userPoolId');
    if (override === undefined && input.userPoolId !== undefined) throw new QoniValidationError('GenAuth userPoolId override requires an explicit token');
    if (override === undefined && !provider) throw new QoniValidationError('Agent Mail/Phone runtime requires genauthCommunicationCredentials with native GenAuth AK/SK or accessToken; Qoni management tokens cannot be used for runtime calls');
    const auth = override === undefined ? await abortable(provider!(), options.signal) : { accessToken: override as string, userPoolId: input.userPoolId as string };
    const invoke = (token: GenAuthAdminToken) => {
      options.signal?.throwIfAborted();
      const headers: Record<string,string> = { 'x-authing-userpool-id': token.userPoolId };
      if (admin && route.method !== 'GET') headers[route.name.startsWith('agentMail.') ? 'x-agent-mail-admin' : 'x-agent-phone-admin'] = '1';
      if (input.idempotencyKey !== undefined) headers['Idempotency-Key'] = String(input.idempotencyKey);
      if (input.revision !== undefined) headers['If-Match'] = `"${input.revision}"`;
      const pathKeys: readonly string[] = route.pathKeys;
      const queryKeys: readonly string[] = route.queryKeys;
      const path = route.path.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(String(input[key])));
      const entries = Object.entries(input).filter(([key,value]) => value !== undefined && !authKeys.includes(key) && !headerKeys.includes(key) && !pathKeys.includes(key));
      const query = Object.fromEntries(entries.filter(([key]) => route.method === 'GET' || queryKeys.includes(key)));
      const body = Object.fromEntries(entries.filter(([key]) => !queryKeys.includes(key)));
      return transport.genauthJson(route.method, path, token.accessToken, { headers, ...(route.method === 'GET' ? { query } : { body, ...(queryKeys.length ? { query } : {}) }), signal: options.signal });
    };
    try { return await invoke(auth); }
    catch (error) {
      // Only a rejected credential is refreshed. Ambiguous/failed vendor writes never replay.
      if (override !== undefined || (!admin && credentials && 'accessToken' in credentials) || !provider || !(error instanceof QoniError) || error.status !== 401) throw error;
      const refreshed = await abortable(provider(auth.accessToken), options.signal);
      return invoke(refreshed);
    }
  }
  for (const ns of ['agentMail','agentPhone']) {
    result[ns].withCredentials = (value: GenAuthCommunicationCredentials) => { validateCredentials(value); return createGenAuthCommunication(transport, adminProvider, value)[ns as 'agentMail' | 'agentPhone']; };
    result[ns].operations.wait = (input: JsonObject, options: GenAuthCommunicationWaitOptions = {}) => poll(result[ns].operations.get, input, options, new Set(['pending','running','queued']));
    result[ns].verifications.wait = (input: JsonObject, options: GenAuthCommunicationWaitOptions = {}) => poll(result[ns].verifications.get, input, options, new Set(['pending','waiting']));
  }
  result.agentPhone.admin.operations.wait = (input: JsonObject, options: GenAuthCommunicationWaitOptions = {}) => poll(result.agentPhone.admin.operations.get, input, options, new Set(['pending','running','queued']));
  result.agentPhone.admin.verifications.wait = (input: JsonObject, options: GenAuthCommunicationWaitOptions = {}) => poll(result.agentPhone.admin.verifications.get, input, options, new Set(['pending','waiting']));
  return result as { agentMail: GenAuthAgentMailClient; agentPhone: GenAuthAgentPhoneClient };
}

function nativeTokenProvider(transport: QoniTransport, credentials?: GenAuthCommunicationCredentials): GenAuthAdminTokenProvider | undefined {
  if (!credentials) return undefined;
  validateCredentials(credentials);
  // Copy configured secrets once so mutation of the caller's options cannot switch cached identity.
  const config = { ...credentials };
  if ('accessToken' in config) return async () => ({ accessToken: config.accessToken, userPoolId: config.userPoolId });
  let cached: (GenAuthAdminToken & { expiresAt: number }) | undefined;
  let pending: Promise<GenAuthAdminToken> | undefined;
  return async (rejected?: string) => {
    if (rejected && cached?.accessToken === rejected) cached = undefined;
    if (cached && cached.expiresAt > Date.now() + 30_000) return cached;
    if (pending) return pending;
    pending = (async () => {
      const { data } = await transport.genauthJson<{ access_token: string; expires_in: number }>('POST', '/api/v3/get-management-token', undefined, { body: { accessKeyId: config.accessKeyId, accessKeySecret: config.accessKeySecret }, headers: { 'x-authing-userpool-id': config.userPoolId } });
      if (!data || typeof data.access_token !== 'string' || !data.access_token.trim() || typeof data.expires_in !== 'number' || !Number.isFinite(data.expires_in) || data.expires_in <= 0) throw new QoniUpstreamError('GenAuth native management-token response is invalid', { retryable: false });
      cached = { accessToken: data.access_token, userPoolId: config.userPoolId, expiresAt: Date.now() + data.expires_in * 1000 };
      return cached;
    })();
    try { return await pending; } finally { pending = undefined; }
  };
}
function validateCredentials(c: GenAuthCommunicationCredentials): void {
  if (!c || typeof c !== 'object' || typeof c.userPoolId !== 'string' || !c.userPoolId.trim() || ('accessToken' in c ? typeof c.accessToken !== 'string' || !c.accessToken.trim() || 'accessKeyId' in c || 'accessKeySecret' in c : typeof c.accessKeyId !== 'string' || !c.accessKeyId.trim() || typeof c.accessKeySecret !== 'string' || !c.accessKeySecret.trim())) throw new QoniValidationError('GenAuth communication credentials require userPoolId and either accessToken or native accessKeyId/accessKeySecret');
}
function validate(route: Route, input: JsonObject): void {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new QoniValidationError(`${route.name} requires an input object`);
  const fields: readonly { name: string; required: boolean; kind?: string }[] = route.inputFields;
  for (const field of fields) {
    const v = input[field.name];
    if (v === undefined) { if (field.required) throw new QoniValidationError(`${route.name} requires ${field.name}`); continue; }
    if (field.kind === 'string' && (typeof v !== 'string') || field.kind === 'number' && (typeof v !== 'number' || !Number.isFinite(v)) || field.kind === 'boolean' && typeof v !== 'boolean' || field.kind === 'array' && !Array.isArray(v) || field.kind === 'object' && (!v || typeof v !== 'object' || Array.isArray(v))) throw new QoniValidationError(`${route.name}: invalid ${field.name}`);
  }
  for (const key of route.pathKeys) if (typeof input[key] !== 'string' || !(input[key] as string).trim() || (input[key] as string).length > 128) throw new QoniValidationError(`${route.name}: invalid path field ${key}`);
  for (const key of Object.keys(input)) if (!fields.some(f => f.name === key)) throw new QoniValidationError(`${route.name}: unknown input field ${key}`);
  if (input.idempotencyKey !== undefined && (typeof input.idempotencyKey !== 'string' || !/^[a-zA-Z0-9_.:-]{1,128}$/.test(input.idempotencyKey))) throw new QoniValidationError('idempotencyKey must contain 1–128 letters, digits, dots, underscores, colons or hyphens');
  if (input.revision !== undefined && (typeof input.revision !== 'number' || !Number.isInteger(input.revision) || input.revision < 1 || input.revision > 9_999_999_999)) throw new QoniValidationError('revision must be a positive integer with at most 10 digits');
  for (const k of ['page','limit']) if (input[k] !== undefined && (typeof input[k] !== 'number' || !Number.isInteger(input[k]) || (input[k] as number) < 1 || k === 'limit' && (input[k] as number) > 100)) throw new QoniValidationError(`${k} must be a positive integer${k === 'limit' ? ' up to 100' : ''}`);
  if (input.maxCost !== undefined) {
    const cost = input.maxCost as {amount?: unknown; currency?: unknown};
    if (!cost || typeof cost !== 'object' || typeof cost.amount !== 'string' || !/^(0|[1-9][0-9]{0,6})(\.[0-9]{1,6})?$/.test(cost.amount) || typeof cost.currency !== 'string' || !/^[A-Z]{3}$/.test(cost.currency)) throw new QoniValidationError('maxCost requires a decimal-string amount and uppercase three-letter currency');
  }
  if (route.name === 'agentMail.verifications.create') {
    const template = input.templateId !== undefined;
    if (template ? input.match !== undefined || input.extract !== undefined : !input.match || !input.extract) throw new QoniValidationError('Mail verification requires either templateId or match/extract');
  }
}
function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return new Promise((resolve,reject) => {
    const aborted = () => reject(signal.reason);
    signal.addEventListener('abort',aborted,{once:true});
    if (signal.aborted) aborted();
    promise.then(resolve,reject).finally(() => signal.removeEventListener('abort',aborted));
  });
}
async function poll(get: (input: JsonObject, options: GenAuthCommunicationRequestOptions) => Promise<QoniResponse<JsonObject>>, input: JsonObject, options: GenAuthCommunicationWaitOptions, active: Set<string>): Promise<QoniResponse<JsonObject>> {
  const timeoutMs = options.timeoutMs ?? 120_000, interval = options.pollIntervalMs ?? 1000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isFinite(interval) || interval <= 0) throw new QoniValidationError('wait timeoutMs and pollIntervalMs must be positive finite numbers');
  options.signal?.throwIfAborted();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new QoniTimeoutError('GenAuth communication wait timed out')), timeoutMs);
  const cancel = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', cancel, {once:true});
  try {
    for (;;) {
      const response = await get(input,{signal:controller.signal});
      if (!response.data || typeof response.data.status !== 'string') throw new QoniUpstreamError('GenAuth wait expected a status in the response', { retryable:false });
      if (!active.has(response.data.status)) return response;
      const hint = response.data.pollAfterSeconds;
      const delay = Math.max(interval, typeof hint === 'number' && Number.isFinite(hint) && hint > 0 ? hint*1000 : 0);
      await new Promise<void>((resolve,reject) => {
        const timer=setTimeout(() => { controller.signal.removeEventListener('abort',abort); resolve(); },delay);
        const abort=() => {clearTimeout(timer);controller.signal.removeEventListener('abort',abort);reject(controller.signal.reason);};
        controller.signal.addEventListener('abort',abort,{once:true});
        if(controller.signal.aborted) abort();
      });
    }
  } finally { clearTimeout(timeout); options.signal?.removeEventListener('abort', cancel); }
}
