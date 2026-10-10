import { QoniError, QoniValidationError, QoniTokenExpiredError } from './errors';
import type { JsonObject, QoniResponse, QoniTransport } from './types';
import { genAuthManagementRoutes } from './generated/genauth-management-routes';
import type { GenAuthManagementClient, GenAuthManagementNamespaces } from './generated/genauth-management-types';

export interface GenAuthAdminToken {
  accessToken: string;
  userPoolId: string;
}

/** Passing a rejected token invalidates only that cached token, preserving a newer refresh. */
export type GenAuthAdminTokenProvider = (rejectedAccessToken?: string) => Promise<GenAuthAdminToken>;

export interface GenAuthAdminTokenOverrideInput {
  /** Use with userPoolId to bypass the Qoni management-token exchange. */
  adminToken?: string;
  userPoolId?: string;
}

export interface GenAuthManagementRequestOptions {
  signal?: AbortSignal;
}

type Operation = keyof typeof genAuthManagementRoutes;

export function createGenAuthManagement(
  transport: QoniTransport,
  provider?: GenAuthAdminTokenProvider,
): GenAuthManagementNamespaces & { management: GenAuthManagementClient } {
  const management: Record<string, unknown> = {};
  const namespaces: Record<string, Record<string, unknown>> = {};
  for (const [operation, route] of Object.entries(genAuthManagementRoutes)) {
    const method = <T = unknown>(input: JsonObject = {}, options: GenAuthManagementRequestOptions = {}) =>
      requestGenAuthManagement<T>(transport, provider, operation as Operation, input, options);
    management[operation] = method;
    const namespace = namespaces[route.namespace] ??= {};
    namespace[operation] = method;
    if ('alias' in route) namespace[route.alias] = method;
  }
  return { ...namespaces, management } as unknown as GenAuthManagementNamespaces & { management: GenAuthManagementClient };
}

/** Shared by the typed management catalog and the existing user convenience methods. */
export async function requestGenAuthManagement<T>(
  transport: QoniTransport,
  provider: GenAuthAdminTokenProvider | undefined,
  operation: Operation,
  input: JsonObject,
  options: GenAuthManagementRequestOptions = {},
): Promise<QoniResponse<T>> {
  options.signal?.throwIfAborted();
  const route = genAuthManagementRoutes[operation];
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new QoniValidationError(`GenAuth ${operation} requires an input object`);
  const normalized: JsonObject = { ...('defaults' in route ? route.defaults : {}) };
  for (const [key, value] of Object.entries(input)) if (value !== undefined) normalized[key] = value;
  if ('queryAliases' in route) {
    for (const [alias, key] of Object.entries(route.queryAliases)) {
      if (normalized[alias] !== undefined) {
        if (normalized[key] !== undefined && normalized[key] !== normalized[alias]) throw new QoniValidationError(`GenAuth ${operation}: conflicting ${alias} and ${key}`);
        normalized[key] = normalized[alias];
        delete normalized[alias];
      }
    }
  }
  validateInput(operation, normalized, route.required);
  const { adminToken, userPoolId, ...body } = normalized;
  if ((route.path === '/api/v3/list-custom-fields' || route.path === '/api/v3/list-user-base-fields') && body.targetType === undefined) body.targetType = 'USER';
  const manual = adminToken !== undefined;
  if (manual && (typeof adminToken !== 'string' || !adminToken.trim() || typeof userPoolId !== 'string' || !userPoolId.trim())) {
    throw new QoniValidationError('GenAuth adminToken override requires a non-empty adminToken and userPoolId');
  }
  if (!manual && userPoolId !== undefined) {
    throw new QoniValidationError('GenAuth userPoolId override requires adminToken; Qoni AK/SK already selects its bound userpool');
  }
  if (!manual && !provider) throw new QoniValidationError('GenAuth management requires Qoni AK/SK admin token exchange');
  const auth = manual
    ? { accessToken: adminToken as string, userPoolId: userPoolId as string }
    : await waitForAuth(provider!(), options.signal);
  const invoke = (credentials: GenAuthAdminToken) => {
    options.signal?.throwIfAborted();
    const queryKeys: readonly string[] = 'queryKeys' in route ? route.queryKeys : [];
    const pathKeys: readonly string[] = 'pathKeys' in route ? route.pathKeys : [];
    const path = route.path.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(String(body[key])));
    const payload = Object.fromEntries(Object.entries(body).filter(([key]) => !pathKeys.includes(key)));
    const query = route.method === 'GET' ? payload : Object.fromEntries(Object.entries(payload).filter(([key]) => queryKeys.includes(key)));
    const requestBody = Object.fromEntries(Object.entries(payload).filter(([key]) => !queryKeys.includes(key)));
    return transport.genauthJson<T>(route.method, path, credentials.accessToken, {
      ...(route.method === 'GET' ? { query: serializeQuery(query) } : { body: requestBody, ...(queryKeys.length ? { query: serializeQuery(query) } : {}) }),
      headers: { 'x-authing-userpool-id': credentials.userPoolId },
      signal: options.signal,
    });
  };
  try {
    return await invoke(auth);
  } catch (error) {
    // A rejected management credential has not passed the server auth gate.
    // Refresh once; permission, validation, timeout and network failures never replay writes.
    const tokenRejected = error instanceof QoniError && (error.status === 401 || (error instanceof QoniTokenExpiredError && (/token/i.test(error.code) || /token expired/i.test(error.message))));
    if (manual || !tokenRejected) throw error;
    options.signal?.throwIfAborted();
    const refreshed = await waitForAuth(provider!(auth.accessToken), options.signal);
    return invoke(refreshed);
  }
}

function serializeQuery(input: JsonObject): JsonObject {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined).map(([key, value]) => [
    key,
    Array.isArray(value) ? value.join(',') : value !== null && typeof value === 'object' ? JSON.stringify(value) : value,
  ]));
}

function validateInput(operation: string, input: JsonObject, fields: readonly { name: string; kind: string; minItems?: number }[]): void {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new QoniValidationError(`GenAuth ${operation} requires an input object`);
  for (const field of fields) {
    const value = input[field.name];
    if (value === undefined || value === null || (field.kind === 'string' && (typeof value !== 'string' || !value.trim())) ||
        (field.kind === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) ||
        (field.kind === 'array' && (!Array.isArray(value) || value.length < (field.minItems ?? 0)))) {
      throw new QoniValidationError(`GenAuth ${operation} requires ${field.name} (${field.kind}${field.minItems ? `, at least ${field.minItems} item(s)` : ''})`);
    }
  }
  for (const key of ['page', 'limit']) {
    const value = input[key];
    if (value !== undefined && (typeof value !== 'number' || !Number.isInteger(value) || value < 1)) {
      throw new QoniValidationError(`GenAuth ${operation}: ${key} must be a positive integer`);
    }
  }
}

function waitForAuth(promise: Promise<GenAuthAdminToken>, signal?: AbortSignal): Promise<GenAuthAdminToken> {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}
