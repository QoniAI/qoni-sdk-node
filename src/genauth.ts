import type {
  QoniResponse, QoniTransport, JsonObject, DelegateTokenInput,
  DelegateTokenSilentInput, DelegateTokenInteractiveInput,
  DelegateTokenSilentResponse, InteractiveDelegationResponse, DelegateAgentResponse,
} from "./types";
import { QoniValidationError, QoniUpstreamError } from "./errors";
import { createGenAuthManagement, requestGenAuthManagement } from "./genauth-management";
import type { GenAuthAdminTokenOverrideInput, GenAuthAdminTokenProvider, GenAuthManagementRequestOptions } from "./genauth-management";
import type { GenAuthSdkUserDto, GenAuthListUsersInput, GenAuthGetUserInput, GenAuthGetUserBatchInput, GenAuthCreateUserInput, GenAuthUpdateUserInput, GenAuthManagementOperations } from "./generated/genauth-management-types";
export type { GenAuthAdminToken, GenAuthAdminTokenProvider, GenAuthAdminTokenOverrideInput } from "./genauth-management";

import { createGenAuthCommunication } from './genauth-communication';
import type { GenAuthCommunicationCredentials } from './genauth-communication-types';

export interface GenAuthAccessTokenInput {
  accessToken: string;
}

export interface GenAuthDelegationIntrospectionInput {
  token?: string;
  /** @deprecated Use token. */
  delegateAgentToken?: string;
}

export type GenAuthUserListInput = GenAuthAdminTokenOverrideInput & GenAuthListUsersInput & {
  page?: number;
  limit?: number;
  options?: JsonObject & { pagination?: JsonObject };
} & JsonObject;
export type GenAuthUserGetInput = GenAuthAdminTokenOverrideInput & GenAuthGetUserInput & { userId: string };
export type GenAuthUserGetBatchInput = GenAuthAdminTokenOverrideInput & GenAuthGetUserBatchInput;
export type GenAuthUserCreateInput = GenAuthAdminTokenOverrideInput & GenAuthCreateUserInput & JsonObject;
export type GenAuthUserCreateBatchInput = GenAuthAdminTokenOverrideInput & {
  users?: JsonObject[];
  list?: JsonObject[];
  options?: JsonObject;
};
export type GenAuthUserUpdateInput = GenAuthAdminTokenOverrideInput & GenAuthUpdateUserInput & { userId: string } & JsonObject;
export type GenAuthUserDeleteBatchInput = GenAuthAdminTokenOverrideInput & { userIds: string[] };

export function createGenAuthNamespace(
  transport: QoniTransport,
  options: {
    adminTokenFor?: GenAuthAdminTokenProvider;
    communicationCredentials?: GenAuthCommunicationCredentials;
    delegateTokenFor?: (input: DelegateTokenInput) => Promise<QoniResponse<DelegateAgentResponse>>;
  } = {},
) {
  // The compatibility entry returns the grant itself; root delegateToken keeps
  // the existing QoniResponse envelope, including its transport metadata.
  function delegateAgent(input: DelegateTokenSilentInput): Promise<DelegateTokenSilentResponse>;
  function delegateAgent(input: DelegateTokenInteractiveInput): Promise<InteractiveDelegationResponse>;
  function delegateAgent(input: DelegateTokenInput): Promise<DelegateAgentResponse>;
  async function delegateAgent(input: DelegateTokenInput): Promise<DelegateAgentResponse> {
    if (!options.delegateTokenFor) {
      throw new QoniValidationError("GenAuth delegateAgent requires a Qoni delegation provider");
    }
    return (await options.delegateTokenFor(input)).data;
  }
  const management = createGenAuthManagement(transport, options.adminTokenFor);
  return {
    ...management,
    ...createGenAuthCommunication(transport, options.adminTokenFor, options.communicationCredentials),
    delegateAgent,
    userInfo: <T = unknown>(input: GenAuthAccessTokenInput): Promise<QoniResponse<T>> =>
      transport.genauthJson("GET", "/oidc/me", input.accessToken),

    jwks: <T = unknown>(): Promise<QoniResponse<T>> =>
      transport.genauthJson("GET", "/oidc/.well-known/jwks.json"),

    discovery: <T = unknown>(): Promise<QoniResponse<T>> =>
      transport.genauthJson("GET", "/oidc/.well-known/openid-configuration"),

    introspectDelegationToken: <T = unknown>(
      input: GenAuthDelegationIntrospectionInput,
    ): Promise<QoniResponse<T>> =>
      transport.genauthJson("POST", "/api/v3/eak/delegations/introspect", undefined, {
        body: { token: requiredDelegationToken(input) },
      }),

    users: {
      ...management.users,
      /** Stream all matching users without holding the full userpool in memory. */
      iterate: async function* (input: GenAuthUserListInput = {}, requestOptions?: GenAuthManagementRequestOptions): AsyncIterable<GenAuthSdkUserDto> {
        const pagination = input.options?.pagination;
        const limit = input.limit ?? pagination?.limit ?? 50;
        let page = input.page ?? pagination?.page ?? 1;
        if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 50 || typeof page !== 'number' || !Number.isInteger(page) || page < 1) {
          throw new QoniValidationError('GenAuth users.iterate requires page >= 1 and limit between 1 and 50');
        }
        for (;;) {
          const response = await requestGenAuthManagement<GenAuthManagementOperations['listUsers']['result']>(
            transport, options.adminTokenFor, 'listUsers', listUsersBodyWithAuth({ ...input, page, limit }), requestOptions,
          );
          if (!response.data || !Array.isArray(response.data.list)) throw new QoniUpstreamError('GenAuth users.iterate expected a paginated list-users response', { status: 502 });
          for (const user of response.data.list) {
            requestOptions?.signal?.throwIfAborted();
            yield user;
          }
          if (response.data.list.length < limit || (typeof response.data.totalCount === 'number' && (page - 1) * limit + response.data.list.length >= response.data.totalCount)) return;
          page++;
        }
      },
      list: async <T = GenAuthManagementOperations['listUsers']['result']>(input: GenAuthUserListInput = {}, requestOptions?: GenAuthManagementRequestOptions): Promise<QoniResponse<T>> =>
        requestGenAuthManagement(transport, options.adminTokenFor, 'listUsers', listUsersBodyWithAuth(input), requestOptions),
      get: <T = GenAuthManagementOperations['getUser']['result']>(input: GenAuthUserGetInput, requestOptions?: GenAuthManagementRequestOptions): Promise<QoniResponse<T>> =>
        requestGenAuthManagement(transport, options.adminTokenFor, 'getUser', { ...input }, requestOptions),
      getBatch: <T = GenAuthManagementOperations['getUserBatch']['result']>(input: GenAuthUserGetBatchInput, requestOptions?: GenAuthManagementRequestOptions): Promise<QoniResponse<T>> =>
        requestGenAuthManagement(transport, options.adminTokenFor, 'getUserBatch', { ...input }, requestOptions),
      create: <T = GenAuthManagementOperations['createUser']['result']>(input: GenAuthUserCreateInput, requestOptions?: GenAuthManagementRequestOptions): Promise<QoniResponse<T>> =>
        requestGenAuthManagement(transport, options.adminTokenFor, 'createUser', input, requestOptions),
      createBatch: async <T = GenAuthManagementOperations['createUsersBatch']['result']>(input: GenAuthUserCreateBatchInput, requestOptions?: GenAuthManagementRequestOptions): Promise<QoniResponse<T>> =>
        requestGenAuthManagement(transport, options.adminTokenFor, 'createUsersBatch', { ...createUsersBatchBody(input), adminToken: input.adminToken, userPoolId: input.userPoolId }, requestOptions),
      update: <T = GenAuthManagementOperations['updateUser']['result']>(input: GenAuthUserUpdateInput, requestOptions?: GenAuthManagementRequestOptions): Promise<QoniResponse<T>> =>
        requestGenAuthManagement(transport, options.adminTokenFor, 'updateUser', input, requestOptions),
      deleteBatch: <T = GenAuthManagementOperations['deleteUsersBatch']['result']>(input: GenAuthUserDeleteBatchInput, requestOptions?: GenAuthManagementRequestOptions): Promise<QoniResponse<T>> =>
        requestGenAuthManagement(transport, options.adminTokenFor, 'deleteUsersBatch', { ...input }, requestOptions),
    },
  };
}

function requiredDelegationToken(input: GenAuthDelegationIntrospectionInput): string {
  const token = input.token ?? input.delegateAgentToken;
  if (token?.trim()) return token;
  throw new QoniValidationError("GenAuth delegation introspection requires token");
}

function omit(value: object, ...keys: string[]): JsonObject {
  const skipped = new Set(keys);
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    if (!skipped.has(key) && item !== undefined) out[key] = item;
  }
  return out;
}

function listUsersBodyWithAuth(input: GenAuthUserListInput): JsonObject {
  const body = omit(input, "page", "limit");
  for (const [key, value] of Object.entries({ page: input.page, limit: input.limit })) {
    if (value !== undefined && (!Number.isInteger(value) || value < 1)) throw new QoniValidationError(`GenAuth users.list: ${key} must be a positive integer`);
  }
  if (input.page === undefined && input.limit === undefined) return body;
  const options = isJsonObject(body.options) ? { ...body.options } : {};
  const pagination = isJsonObject(options.pagination) ? { ...options.pagination } : {};
  if (input.page !== undefined) pagination.page = input.page;
  if (input.limit !== undefined) pagination.limit = input.limit;
  options.pagination = pagination;
  body.options = options;
  return body;
}

function createUsersBatchBody(input: GenAuthUserCreateBatchInput): JsonObject {
  const body = omit(input, "adminToken", "userPoolId", "users");
  if (input.users && !body.list) body.list = input.users;
  return body;
}

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
