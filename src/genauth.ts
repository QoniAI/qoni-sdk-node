import type { QoniResponse, QoniTransport, JsonObject } from "./types";

export interface GenAuthAccessTokenInput {
  accessToken: string;
}

export interface GenAuthDelegationIntrospectionInput {
  token?: string;
  /** @deprecated Use token. */
  delegateAgentToken?: string;
}

export interface GenAuthAdminToken {
  accessToken: string;
  userPoolId: string;
}

export type GenAuthAdminTokenProvider = () => Promise<GenAuthAdminToken>;

export interface GenAuthAdminTokenOverrideInput {
  adminToken?: string;
  userPoolId?: string;
}

export type GenAuthUserListInput = GenAuthAdminTokenOverrideInput & {
  page?: number;
  limit?: number;
  options?: JsonObject & { pagination?: JsonObject };
} & JsonObject;
export type GenAuthUserGetInput = GenAuthAdminTokenOverrideInput & { userId: string };
export type GenAuthUserGetBatchInput = GenAuthAdminTokenOverrideInput & { userIds: string[] };
export type GenAuthUserCreateInput = GenAuthAdminTokenOverrideInput & JsonObject;
export type GenAuthUserCreateBatchInput = GenAuthAdminTokenOverrideInput & {
  users?: JsonObject[];
  list?: JsonObject[];
  options?: JsonObject;
};
export type GenAuthUserUpdateInput = GenAuthAdminTokenOverrideInput & { userId: string } & JsonObject;
export type GenAuthUserDeleteBatchInput = GenAuthAdminTokenOverrideInput & { userIds: string[] };

export function createGenAuthNamespace(
  transport: QoniTransport,
  options: { adminTokenFor?: GenAuthAdminTokenProvider } = {},
) {
  return {
    userInfo: <T = unknown>(input: GenAuthAccessTokenInput): Promise<QoniResponse<T>> =>
      transport.genauthJson("GET", "/oidc/me", input.accessToken),

    jwks: <T = unknown>(): Promise<QoniResponse<T>> =>
      transport.genauthJson("GET", "/oidc/.well-known/jwks.json"),

    discovery: <T = unknown>(): Promise<QoniResponse<T>> =>
      transport.genauthJson("GET", "/oidc/.well-known/openid-configuration"),

    introspectDelegationToken: <T = unknown>(
      input: GenAuthDelegationIntrospectionInput,
    ): Promise<QoniResponse<T>> =>
      transport.genauthJson("POST", "/api/v3/qoni/delegations/introspect", undefined, {
        body: { token: requiredDelegationToken(input) },
      }),

    users: {
      list: async <T = unknown>(input: GenAuthUserListInput = {}): Promise<QoniResponse<T>> => {
        const auth = await adminAuthFor(options.adminTokenFor, input);
        return transport.genauthJson("POST", "/api/v3/list-users", auth.accessToken, {
          body: listUsersBody(input),
          headers: userPoolHeaders(auth.userPoolId),
        });
      },

      get: async <T = unknown>(input: GenAuthUserGetInput): Promise<QoniResponse<T>> => {
        const auth = await adminAuthFor(options.adminTokenFor, input);
        return transport.genauthJson("GET", "/api/v3/get-user", auth.accessToken, {
          query: omit(input, "adminToken", "userPoolId"),
          headers: userPoolHeaders(auth.userPoolId),
        });
      },

      getBatch: async <T = unknown>(
        input: GenAuthUserGetBatchInput,
      ): Promise<QoniResponse<T>> => {
        const auth = await adminAuthFor(options.adminTokenFor, input);
        return transport.genauthJson("GET", "/api/v3/get-user-batch", auth.accessToken, {
          query: omit(input, "adminToken", "userPoolId"),
          headers: userPoolHeaders(auth.userPoolId),
        });
      },

      create: async <T = unknown>(input: GenAuthUserCreateInput): Promise<QoniResponse<T>> => {
        const auth = await adminAuthFor(options.adminTokenFor, input);
        return transport.genauthJson("POST", "/api/v3/create-user", auth.accessToken, {
          body: omit(input, "adminToken", "userPoolId"),
          headers: userPoolHeaders(auth.userPoolId),
        });
      },

      createBatch: async <T = unknown>(
        input: GenAuthUserCreateBatchInput,
      ): Promise<QoniResponse<T>> => {
        const auth = await adminAuthFor(options.adminTokenFor, input);
        return transport.genauthJson("POST", "/api/v3/create-users-batch", auth.accessToken, {
          body: createUsersBatchBody(input),
          headers: userPoolHeaders(auth.userPoolId),
        });
      },

      update: async <T = unknown>(input: GenAuthUserUpdateInput): Promise<QoniResponse<T>> => {
        const auth = await adminAuthFor(options.adminTokenFor, input);
        return transport.genauthJson("POST", "/api/v3/update-user", auth.accessToken, {
          body: omit(input, "adminToken", "userPoolId"),
          headers: userPoolHeaders(auth.userPoolId),
        });
      },

      deleteBatch: async <T = unknown>(
        input: GenAuthUserDeleteBatchInput,
      ): Promise<QoniResponse<T>> => {
        const auth = await adminAuthFor(options.adminTokenFor, input);
        return transport.genauthJson("POST", "/api/v3/delete-users-batch", auth.accessToken, {
          body: omit(input, "adminToken", "userPoolId"),
          headers: userPoolHeaders(auth.userPoolId),
        });
      },
    },
  };
}

function requiredDelegationToken(input: GenAuthDelegationIntrospectionInput): string {
  const token = input.token ?? input.delegateAgentToken;
  if (token?.trim()) return token;
  throw new Error("GenAuth delegation introspection requires token");
}

async function adminAuthFor(
  provider: GenAuthAdminTokenProvider | undefined,
  input: GenAuthAdminTokenOverrideInput,
): Promise<GenAuthAdminToken> {
  if (input.adminToken?.trim()) {
    if (!input.userPoolId?.trim()) {
      throw new Error("GenAuth adminToken override requires userPoolId");
    }
    return { accessToken: input.adminToken, userPoolId: input.userPoolId };
  }
  if (!provider) throw new Error("GenAuth user management requires Qoni AK/SK admin token exchange");
  return provider();
}

function userPoolHeaders(userPoolId: string): Record<string, string> {
  return { "x-authing-userpool-id": userPoolId };
}

function omit(value: object, ...keys: string[]): JsonObject {
  const skipped = new Set(keys);
  const out: JsonObject = {};
  for (const [key, item] of Object.entries(value)) {
    if (!skipped.has(key) && item !== undefined) out[key] = item;
  }
  return out;
}

function listUsersBody(input: GenAuthUserListInput): JsonObject {
  const body = omit(input, "adminToken", "userPoolId", "page", "limit");
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
