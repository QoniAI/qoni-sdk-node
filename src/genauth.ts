import type {
  QoniResponse, QoniTransport, JsonObject, DelegateTokenInput,
  DelegateTokenSilentInput, DelegateTokenInteractiveInput,
  DelegateTokenSilentResponse, InteractiveDelegationResponse, DelegateAgentResponse,
} from "./types";
import { QoniUpstreamError, QoniValidationError } from "./errors";
import { isJsonObject as isPlainJsonObject } from "./types";

/** Qoni 托管注册/登录页地址入参。state 由 App 自己生成并在回调时核对。 */
export type CreateLoginUrlInput = {
  redirectUri: string;
  /** App 生成的 CSRF state；回调时由 App 自行核对，SDK 不替 App 校验。 */
  state: string;
  /** 默认 'login'；托管页内两者可互相切换。 */
  screen?: "login" | "signup";
};

export type LoginUrl = {
  url: string;
  /** 服务端创建时起算的实际绝对期限（ISO 8601）。 */
  expiresAt: string;
};

export type ExchangeLoginCodeInput = {
  code: string;
  redirectUri: string;
};

export type SignedInUser = {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  /** 本次登录事务内是否发生了新注册（服务端按实际注册分支判定）。 */
  isNewUser: boolean;
};

export type LoginSession = {
  user: SignedInUser;
  /** 用户登录态；为用户绑定 Agent 时用它证明用户本人在场。 */
  accessToken: string;
  idToken: string;
  expiresIn: number;
};

export type AgentProvisioning = {
  provisioningId:string;state:'creating'|'mail_pending'|'ready'|'bound'|'compensating'|'compensated'|'reclaiming'|'reclaimed'|'archived_external';ready:boolean;
  agentId:string|null;readyAt:number|null;unboundExpiresAt:number|null;boundUserId:string|null;boundAt:number|null;mailboxResourceId:string|null;errorCode:string|null;
};
export type CreatePersonalAgentInput = {displayName:string;idempotencyKey:string;mailboxLocalPart?:string};

type SignedPost = <T>(pathname: string, body: JsonObject) => Promise<QoniResponse<T>>;

const LOGIN_URL_PATH = "/api/v3/eak/genauth/auth/login-url";
const EXCHANGE_LOGIN_CODE_PATH = "/api/v3/eak/genauth/auth/exchange-login-code";

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
  options: {
    adminTokenFor?: GenAuthAdminTokenProvider;
    delegateTokenFor?: (input: DelegateTokenInput) => Promise<QoniResponse<DelegateAgentResponse>>;
    /** 既有 Qoni AK/SK 签名 POST（只发往配置的 Qoni host）。 */
    signedPost?: SignedPost;
  } = {},
) {
  const auth = {
    /**
     * 生成 Qoni 托管注册/登录页地址。只发送声明的字段；不接受 clientId、secret、issuer 或 token URL。
     * `expiresAt` 是服务端保存的实际期限；`state` 由 App 自己存储并在回调时核对。
     */
    async createLoginUrl(input: CreateLoginUrlInput): Promise<LoginUrl> {
      const body = createLoginUrlBody(input);
      const response = await requiredSignedPost(options.signedPost)<unknown>(LOGIN_URL_PATH, body);
      return parseLoginUrl(response.data);
    },
    /**
     * 回调时用授权码换取用户与登录态。只发送 {code, redirectUri}；失败一律抛错且不自动重试
     * （授权码最多兑换一次，结果未知时需要重新 createLoginUrl）。SDK 不替 App 校验 state。
     */
    async exchangeLoginCode(input: ExchangeLoginCodeInput): Promise<LoginSession> {
      const body = exchangeLoginCodeBody(input);
      const response = await requiredSignedPost(options.signedPost)<unknown>(EXCHANGE_LOGIN_CODE_PATH, body);
      return parseLoginSession(response.data);
    },
  };

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
  return {
    delegateAgent,
    auth,
    agents: {
      /** Receipts are not success until ready=true. Unknown results: repeat the original request key, never create a replacement. */
      create: async(input:CreatePersonalAgentInput):Promise<AgentProvisioning>=>{
        const body=assertDeclaredFields('genauth.agents.create',input,['displayName','idempotencyKey','mailboxLocalPart']);
        opaqueField('genauth.agents.create','displayName',body.displayName);opaqueField('genauth.agents.create','idempotencyKey',body.idempotencyKey);
        if(body.mailboxLocalPart!==undefined)opaqueField('genauth.agents.create','mailboxLocalPart',body.mailboxLocalPart);
        return parseProvisioning((await requiredSignedPost(options.signedPost)<unknown>('/api/v3/eak/agents/create',body as JsonObject)).data);
      },
      get: async(input:{provisioningId:string}):Promise<AgentProvisioning>=>{
        const body=assertDeclaredFields('genauth.agents.get',input,['provisioningId']);opaqueField('genauth.agents.get','provisioningId',body.provisioningId);
        return parseProvisioning((await requiredSignedPost(options.signedPost)<unknown>('/api/v3/eak/agents/get',body as JsonObject)).data);
      },
      bind: async(input:{provisioningId:string;accessToken:string}):Promise<AgentProvisioning>=>{
        const body=assertDeclaredFields('genauth.agents.bind',input,['provisioningId','accessToken']);opaqueField('genauth.agents.bind','provisioningId',body.provisioningId);if(typeof body.accessToken!=='string'||!body.accessToken||body.accessToken.length>16384||CONTROL_CHARACTERS.test(body.accessToken))throw new QoniValidationError('genauth.agents.bind: accessToken must be a current user token');
        const result=parseProvisioning((await requiredSignedPost(options.signedPost)<unknown>('/api/v3/eak/agents/bind',body as JsonObject)).data);
        if(result.state!=='bound'||!result.boundUserId||!result.boundAt)throw new QoniUpstreamError('Agent binding result is unknown',{retryable:false});return result;
      },
    },
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

// --- genauth.auth：托管登录输入/输出的严格校验 ---

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;
const MAX_FIELD_LENGTH = 2048;

function requiredSignedPost(post: SignedPost | undefined): SignedPost {
  if (!post) throw new QoniValidationError("genauth.auth requires the Qoni signed transport");
  return post;
}

function assertDeclaredFields(method: string, input: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!isPlainJsonObject(input)) throw new QoniValidationError(`${method}: input must be an object`);
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length) {
    throw new QoniValidationError(`${method}: unsupported field(s): ${unknown.join(", ")}`);
  }
  return input as Record<string, unknown>;
}

function redirectUriField(method: string, value: unknown): string {
  if (typeof value !== "string" || !value || value.trim() !== value || value.length > MAX_FIELD_LENGTH || value.includes("#")) {
    throw new QoniValidationError(`${method}: redirectUri must be an absolute http(s) URL without surrounding whitespace or fragment`);
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new QoniValidationError(`${method}: redirectUri must be an absolute http(s) URL`);
  }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
    throw new QoniValidationError(`${method}: redirectUri must be an absolute http(s) URL without credentials`);
  }
  return value;
}

function opaqueField(method: string, name: string, value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > MAX_FIELD_LENGTH || CONTROL_CHARACTERS.test(value)) {
    throw new QoniValidationError(`${method}: ${name} must be a non-blank string of at most ${MAX_FIELD_LENGTH} characters without control characters`);
  }
  return value;
}

function createLoginUrlBody(input: CreateLoginUrlInput): JsonObject {
  const method = "genauth.auth.createLoginUrl";
  const fields = assertDeclaredFields(method, input, ["redirectUri", "state", "screen"]);
  const body: JsonObject = {
    redirectUri: redirectUriField(method, fields.redirectUri),
    state: opaqueField(method, "state", fields.state),
  };
  if (fields.screen !== undefined) {
    if (fields.screen !== "login" && fields.screen !== "signup") {
      throw new QoniValidationError(`${method}: screen must be 'login' or 'signup'`);
    }
    body.screen = fields.screen;
  }
  return body;
}

function exchangeLoginCodeBody(input: ExchangeLoginCodeInput): JsonObject {
  const method = "genauth.auth.exchangeLoginCode";
  const fields = assertDeclaredFields(method, input, ["code", "redirectUri"]);
  return {
    code: opaqueField(method, "code", fields.code),
    redirectUri: redirectUriField(method, fields.redirectUri),
  };
}

function upstreamShapeError(what: string): QoniUpstreamError {
  return new QoniUpstreamError(`Qoni hosted login response is invalid: ${what}`, { retryable: false });
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function parseLoginUrl(data: unknown): LoginUrl {
  if (!isPlainJsonObject(data)) throw upstreamShapeError("missing data");
  if (!isHttpUrl(data.url)) throw upstreamShapeError("url");
  const expiresAt = data.expiresAt;
  if (typeof expiresAt !== "string" || !Number.isFinite(Date.parse(expiresAt))) throw upstreamShapeError("expiresAt");
  return { url: data.url, expiresAt };
}

function optionalString(user: JsonObject, key: "email" | "phone" | "name", out: SignedInUser): void {
  const value = user[key];
  if (value === undefined || value === null) return;
  if (typeof value !== "string") throw upstreamShapeError(`user.${key}`);
  out[key] = value;
}

function parseLoginSession(data: unknown): LoginSession {
  if (!isPlainJsonObject(data)) throw upstreamShapeError("missing data");
  const user = data.user;
  if (!isPlainJsonObject(user)) throw upstreamShapeError("user");
  if (typeof user.id !== "string" || !user.id) throw upstreamShapeError("user.id");
  // isNewUser 必须来自服务端的实际判定；缺失或类型不对时不替它补 false/true。
  if (typeof user.isNewUser !== "boolean") throw upstreamShapeError("user.isNewUser");
  const isNewUser = user.isNewUser;
  const signedIn = { id: user.id } as SignedInUser;
  optionalString(user, "email", signedIn);
  optionalString(user, "phone", signedIn);
  optionalString(user, "name", signedIn);
  signedIn.isNewUser = isNewUser;
  if (typeof data.accessToken !== "string" || !data.accessToken) throw upstreamShapeError("accessToken");
  if (typeof data.idToken !== "string" || !data.idToken) throw upstreamShapeError("idToken");
  const expiresIn = data.expiresIn;
  if (typeof expiresIn !== "number" || !Number.isInteger(expiresIn) || expiresIn <= 0) throw upstreamShapeError("expiresIn");
  return { user: signedIn, accessToken: data.accessToken, idToken: data.idToken, expiresIn };
}

function parseProvisioning(value:unknown):AgentProvisioning{
 if(!isPlainJsonObject(value))throw new QoniUpstreamError('Agent provisioning response is unknown',{retryable:false});
 const states=['creating','mail_pending','ready','bound','compensating','compensated','reclaiming','reclaimed','archived_external'];
 if(typeof value.provisioningId!=='string'||!value.provisioningId||!states.includes(value.state as string)||value.ready!==(['ready','bound'].includes(value.state as string))||(['ready','bound'].includes(value.state as string)&&typeof value.agentId!=='string'))throw new QoniUpstreamError('Agent provisioning response is unknown',{retryable:false});
 for(const key of ['readyAt','unboundExpiresAt','boundAt'])if(value[key]!==null&&!Number.isSafeInteger(value[key]))throw new QoniUpstreamError('Agent provisioning response is unknown',{retryable:false});
 for(const key of ['agentId','boundUserId','mailboxResourceId','errorCode'])if(value[key]!==null&&typeof value[key]!=='string')throw new QoniUpstreamError('Agent provisioning response is unknown',{retryable:false});
 if((value.boundUserId===null)!==(value.boundAt===null)||(value.readyAt===null?(value.unboundExpiresAt!==null||value.boundUserId!==null):(value.boundUserId===null?value.unboundExpiresAt!==(value.readyAt as number)+604800000:value.unboundExpiresAt!==null))||(value.state==='ready'&&(value.readyAt===null||value.boundUserId!==null))||(value.state==='bound'&&(value.readyAt===null||value.boundUserId===null||!value.boundUserId)))throw new QoniUpstreamError('Agent provisioning response is unknown',{retryable:false});
 return {provisioningId:value.provisioningId,state:value.state,ready:value.ready,agentId:value.agentId,readyAt:value.readyAt,unboundExpiresAt:value.unboundExpiresAt,boundUserId:value.boundUserId,boundAt:value.boundAt,mailboxResourceId:value.mailboxResourceId,errorCode:value.errorCode} as AgentProvisioning;
}
