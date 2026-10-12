// Generated from Authing/authing-node-sdk 4.0.2 (cc9f6ed7e0f41542d94d2634fb4fa8a35a622a86) and GenAuth extensions.
// Upstream contract copyright (c) 2019-present Authing; MIT, see docs/authing-sdk-LICENSE.txt.
// Do not edit by hand. Authing wire names are intentionally preserved.
import type { QoniResponse } from '../types';
import type { GenAuthAdminTokenOverrideInput, GenAuthManagementRequestOptions } from '../genauth-management';

export interface GenAuthAuthorizeResourcesDto {
  "namespace"?: string;
  /** 授权资源列表 */
  "list": (GenAuthAuthorizeResourceItem)[];
}

export interface GenAuthIsSuccessDto {
  /** 操作是否成功 */
  "success": boolean;
}

export interface GenAuthGetAuthorizedResourcesDto {
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifier": string;
  "namespace"?: string;
  /** 限定资源类型，如数据、API、按钮、菜单 */
  "resourceType"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 限定查询的资源列表，如果指定，只会返回所指定的资源列表。  resourceList 参数支持前缀匹配，例如： - 授权了一个资源为 `books:123`，可以通过 `books:*` 来匹配； - 授权了一个资源为 `books:fictions_123`，可以通过 `books:fictions_` 来匹配；  */
  "resourceList"?: (string)[];
  /** 是否获取被拒绝的资源 */
  "withDenied"?: boolean;
}

export interface GenAuthAuthorizedResourcePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthAuthorizedResourceDto)[];
}

export interface GenAuthIsActionAllowedDto {
  "namespace"?: string;
  /** 用户 ID */
  "userId": string;
  /** 资源对应的操作 */
  "action": string;
  /** 资源标识符 */
  "resource": string;
}

export interface GenAuthIsActionAllowedDataDto {
  /** 是否允许 */
  "allowed": boolean;
}

export interface GenAuthGetResourceAuthorizedTargetsDto {
  /** 资源 */
  "resource": string;
  /** 权限分组 */
  "namespace"?: string;
  "targetType"?: "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthGetResourceAuthorizedTargetDataDto {
  /** 总数 */
  "totalCount": number;
  /** 元素列表 */
  "list": (GenAuthResourceAuthorizedTargetDto)[];
}

export interface GenAuthCreateNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组名称 */
  "name": string;
  /** 权限分组描述信息 */
  "description"?: string;
}

export interface GenAuthNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组名称 */
  "name": string;
  /** 权限分组描述信息 */
  "description"?: string;
}

export interface GenAuthCreateNamespacesBatchDto {
  /** 权限分组列表 */
  "list": (GenAuthCreateNamespacesBatchItemDto)[];
}

export interface GenAuthGetNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
}

export interface GenAuthGetNamespacesBatchDto {
  /** 权限分组 code 列表，批量可以使用逗号分隔 */
  "codeList": (string)[];
}

export interface GenAuthUpdateNamespaceDto {
  /** 权限分组名称 */
  "name"?: string;
  /** 权限分组新的唯一标志符 */
  "newCode"?: string;
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组描述信息 */
  "description"?: string;
}

export interface GenAuthDeleteNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
}

export interface GenAuthDeleteNamespacesBatchDto {
  /** 权限分组 code 列表 */
  "codeList": (string)[];
}

export interface GenAuthListNamespacesDto {
  "page"?: number;
  "limit"?: number;
  /** 搜索权限分组 Code */
  "keywords"?: string;
}

export interface GenAuthNamespaceListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthNamespacesListRespDto)[];
}

export interface GenAuthListNamespaceRolesDto {
  "page"?: number;
  "limit"?: number;
  /** 权限分组唯一标志符 */
  "code": string;
  /** 角色 Code 或者名称 */
  "keywords"?: string;
}

export interface GenAuthNamespaceRolesListRespDto {
  /** 角色 ID */
  "id": string;
  /** 角色名称 */
  "name": string;
  /** 角色 Code */
  "code": string;
  /** 角色 描述信息 */
  "description": string;
  /** 权限分组 Code */
  "namespace": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthListAuthorizeDto {
  "page"?: number;
  "limit"?: number;
  /** 查询条件 */
  "targetKeyword"?: string;
  /** 权限空间code列表 */
  "namespaceList"?: (string)[];
}

export interface GenAuthAuthorizePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthAuthorizeDto)[];
  /** 业务状态码，可以通过此状态码判断操作是否成功，200 表示成功。 */
  "statusCode": number;
  /** 描述信息 */
  "message": string;
  /** 细分错误码，可通过此错误码得到具体的错误类型（成功请求不返回）。详细错误码列表请见：[API Code 列表](https://api-explorer.authing.cn/?tag=group/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87#tag/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87/%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86/apiCode) */
  "apiCode"?: number;
  /** 请求 ID。当请求失败时会返回。 */
  "requestId"?: number;
}

export interface GenAuthDeleteAuthorizeDto {
  /** 删除数据 */
  "authorizeDto"?: (GenAuthAuthorizeDto2)[];
}

export interface GenAuthCreateResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源名称 */
  "name"?: string;
  /** 资源描述 */
  "description"?: string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  "namespace"?: string;
  /** 资源定义的操作类型 */
  "actions"?: (GenAuthResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: string;
}

export interface GenAuthResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源描述 */
  "description"?: string;
  /** 资源名称 */
  "name"?: string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源定义的操作类型 */
  "actions"?: (GenAuthResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: string;
  "namespace"?: string;
  /** 租户应用是否关联自建应用资源 */
  "linkedToTenant"?: boolean;
}

export interface GenAuthCreateResourcesBatchDto {
  "namespace"?: string;
  /** 资源列表 */
  "list": (GenAuthCreateResourceBatchItemDto)[];
}

export interface GenAuthGetResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  "namespace"?: string;
}

export interface GenAuthGetResourcesBatchDto {
  /** 资源 code 列表，批量可以使用逗号分隔 */
  "codeList": (string)[];
  "namespace"?: string;
}

export interface GenAuthCommonListResourceDto {
  "page"?: number;
  "limit"?: number;
  /** 查询条件 */
  "keyword"?: string;
  /** 权限空间列表 */
  "namespaceCodeList"?: (string)[];
}

export interface GenAuthCommonResourcePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthCommonResourceDto)[];
  /** 业务状态码，可以通过此状态码判断操作是否成功，200 表示成功。 */
  "statusCode": number;
  /** 描述信息 */
  "message": string;
  /** 细分错误码，可通过此错误码得到具体的错误类型（成功请求不返回）。详细错误码列表请见：[API Code 列表](https://api-explorer.authing.cn/?tag=group/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87#tag/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87/%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86/apiCode) */
  "apiCode"?: number;
  /** 请求 ID。当请求失败时会返回。 */
  "requestId"?: number;
}

export interface GenAuthListResourcesDto {
  /** 资源类型 */
  "type"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  "page"?: number;
  "limit"?: number;
  "tenantId"?: string;
  "namespace"?: string;
}

export interface GenAuthResourcePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthResourceDto)[];
  /** 业务状态码，可以通过此状态码判断操作是否成功，200 表示成功。 */
  "statusCode": number;
  /** 描述信息 */
  "message": string;
  /** 细分错误码，可通过此错误码得到具体的错误类型（成功请求不返回）。详细错误码列表请见：[API Code 列表](https://api-explorer.authing.cn/?tag=group/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87#tag/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87/%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86/apiCode) */
  "apiCode"?: number;
  /** 请求 ID。当请求失败时会返回。 */
  "requestId"?: number;
}

export interface GenAuthUpdateResourceDto {
  /** 资源类型，如数据、API、按钮、菜单 */
  "type"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源唯一标志符 */
  "code": string;
  /** 资源名称 */
  "name"?: string;
  /** 资源描述 */
  "description"?: string;
  "namespace"?: string;
  /** 资源定义的操作类型 */
  "actions"?: (GenAuthResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: string;
}

export interface GenAuthDeleteResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  "namespace"?: string;
}

export interface GenAuthDeleteResourcesBatchDto {
  /** 资源 Code 列表 */
  "codeList"?: (string)[];
  /** 资源 Id 列表 */
  "ids"?: (string)[];
  "namespace"?: string;
}

export interface GenAuthDeleteCommonResourcesBatchDto {
  /** 资源 id 列表 */
  "ids": (string)[];
}

export interface GenAuthAssociateTenantResourceDto {
  /** 资源 Code */
  "code": string;
  /** 是否关联应用资源 */
  "association": boolean;
  /** 应用 ID */
  "appId"?: string;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthListAccessKeyDto {
  /** 密钥类型 */
  "type"?: "admin" | "userpool" | "co-admin" | "tenant" | "tenant-co-admin" | "multi-tenant" | "eak" | "agent-mail-client";
  /** AccessKey 状态，activated：已激活，staging：分级（可轮换），revoked：已撤销 */
  "status"?: (string)[];
  /** 密钥所属用户 ID */
  "userId"?: string;
  /** 密钥所属租户 ID */
  "tenantId"?: string;
}

export interface GenAuthListAccessKeyRespDto {
  /** 用户所拥有的 accessKeyId */
  "accessKeyId": string;
  /** 用户所拥有的 accessKeySecret */
  "accessKeySecret": string;
  /** 用户 ID */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** accessKeyId 状态 */
  "status": string;
  /** 最后使用时间 */
  "lastDate": string;
  /** accessKeyId 所在用户池 */
  "userPoolId": string;
  /** 密钥是否启用 */
  "enable": boolean;
}

export interface GenAuthGetAccessKeyDto {
  /** 用户 ID */
  "userId": string;
  /** accessKeyId */
  "accessKeyId": string;
}

export interface GenAuthGetAccessKeyRespDto {
  /** 用户所拥有的 accessKeyId */
  "accessKeyId": string;
  /** 用户所拥有的 accessKeySecret */
  "accessKeySecret": string;
  /** 用户 ID */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** accessKeyId 状态 */
  "status": string;
  /** 最后使用时间 */
  "lastDate": string;
  /** accessKeyId 所在用户池 */
  "userPoolId": string;
  /** 密钥是否启用 */
  "enable": boolean;
}

export interface GenAuthCreateAccessKeyDto {
  /** 密钥类型 */
  "type": "admin" | "userpool" | "co-admin" | "tenant" | "tenant-co-admin" | "multi-tenant" | "eak" | "agent-mail-client";
  /** 密钥所属用户 ID */
  "userId"?: string;
  /** 密钥所属租户 ID */
  "tenantId"?: string;
  /** Qoni SDK AK/SK 绑定的产品租户与授权边界 */
  "eakBinding"?: Record<string, unknown>;
}

export interface GenAuthCreateAccessKeyRespDto {
  /** 用户所拥有的 accessKeyId */
  "accessKeyId": string;
  /** 用户所拥有的 accessKeySecret */
  "accessKeySecret": string;
  /** 用户 ID */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** accessKeyId 状态 */
  "status": string;
  /** 最后使用时间 */
  "lastDate": string;
  /** accessKeyId 所在用户池 */
  "userPoolId": string;
  /** 密钥是否启用 */
  "enable": boolean;
}

export interface GenAuthDeleteAccessKeyDto {
  /** accessKeyId */
  "accessKeyId": string;
}

export interface GenAuthUpdateAccessKeyDto {
  /** AccessKey ID */
  "accessKeyId": string;
  /** 密钥是否生效 */
  "enable": boolean;
}

export interface GenAuthGetApplicationDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthApplicationDto {
  /** 应用 ID */
  "appId": string;
  /** 应用唯一标志 */
  "appIdentifier": string;
  /** 应用名称 */
  "appName": string;
  /** 应用 Logo 链接 */
  "appLogo": string;
  /** 应用描述信息 */
  "appDescription": string;
  /** GUMem 事件采集配置 */
  "gumemEventConfig"?: GenAuthGUMemEventConfigDto;
  /** 应用类型 */
  "appType": "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 用户池 ID */
  "userPoolId": string;
  /** 是否为集成应用 */
  "isIntegrateApp": boolean;
  /** 默认应用协议类型 */
  "defaultProtocol": "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris": (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris": (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri": string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled": boolean;
  /** 开启 SSO 单点登录的时间 */
  "ssoEnabledAt": boolean;
  /** 登录配置 */
  "loginConfig": GenAuthApplicationLoginConfigDto;
  /** 注册配置 */
  "registerConfig": GenAuthApplicationRegisterConfig;
  /** 品牌化配置 */
  "brandingConfig": GenAuthApplicationBrandingConfig;
  "informationCompletionConfig": GenAuthApplicationInformationCompletionConfig;
  /** OIDC 协议配置 */
  "oidcConfig": GenAuthOIDCConfig;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled": boolean;
  /** SAML 协议配置 */
  "samlConfig": GenAuthSamlIdpConfig;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled": boolean;
  /** OAuth2.0 协议配置 */
  "oauthConfig"?: GenAuthOauthIdpConfig;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled": boolean;
  /** CAS 协议配置 */
  "casConfig"?: GenAuthCasIdPConfig;
  /** 是否自定义本应用的登录框，默认走全局的登录框配置。 */
  "customBrandingEnabled": boolean;
  /** 是否自定义本应用的安全规则，默认走全局的安全配置。 */
  "customSecurityEnabled": boolean;
  /** 集成应用的模版类型 */
  "template"?: string;
}

export interface GenAuthGetSubjectAuthDetailDto {
  /** 主体 id */
  "targetId": string;
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  "appId": string;
}

export interface GenAuthGetSubjectAuthDataDto {
  "appId": string;
  /** 应用名称 */
  "appName": string;
  /** 请求的主体id */
  "reqTargetId": string;
  /** 请求的主体名称 */
  "reqTargetName": string;
  /** 请求的主体类型 */
  "reqTargetType"?: "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 目标主体类型 */
  "targetType"?: "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 目标主体名称 */
  "targetName"?: string;
  /** 授权类型 */
  "authType"?: "DEFAULT" | "ALL" | "SELF" | "SUBJECT";
}

export interface GenAuthListAuthSubjectDto {
  /** 主体 id */
  "targetId": string;
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 应用名称 */
  "appName"?: string;
  /** 应用类型列表 */
  "appTypeList"?: ("INTEGRATED" | "SELFBUILT" | "APP_PANEL")[];
  /** 操作类型列表 */
  "effect"?: ("ALLOW" | "DENY")[];
  /** 开关 */
  "enabled"?: boolean;
}

export interface GenAuthListApplicationSubjectDataListDto {
  /** 列表数据 */
  "list": (GenAuthListApplicationSubjectDataDto)[];
}

export interface GenAuthListApplicationAuthDto {
  "page"?: number;
  "limit"?: number;
  "appId": string;
  /** 主体名称 */
  "targetName"?: string;
  /** 主体类型列表, USER/ORG/ROLE/GROUP */
  "targetTypeList"?: ("USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK")[];
  /** 操作，ALLOW/DENY */
  "effect"?: ("ALLOW" | "DENY")[];
  /** 授权是否生效开关, */
  "enabled"?: boolean;
}

export interface GenAuthListApplicationAuthPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthListApplicationAuthDataDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthUpdateAuthEnabledDto {
  /** 授权 ID */
  "id": string;
  /** 授权是否生效开关, */
  "enabled": boolean;
}

export interface GenAuthDeleteBatchApplicationAuthDto {
  /** 授权 ID */
  "authIds": (string)[];
}

export interface GenAuthListApplicationsDto {
  "page"?: number;
  "limit"?: number;
  /** 是否为集成应用 */
  "isIntegrateApp"?: boolean;
  /** 是否为自建应用 */
  "isSelfBuiltApp"?: boolean;
  /** 是否开启单点登录 */
  "ssoEnabled"?: boolean;
  /** 模糊搜索字符串 */
  "keywords"?: string;
  /** 搜索应用，true：搜索所有应用, 默认为 false */
  "all"?: boolean;
}

export interface GenAuthApplicationPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthApplicationDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthGetApplicationSimpleInfoDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthApplicationSimpleInfoDto {
  /** 应用是否已启用 client_credentials 授权模式 */
  "clientCredentialsEnabled": boolean;
  /** 应用 ID */
  "appId": string;
  /** 应用唯一标志 */
  "appIdentifier": string;
  /** 应用名称 */
  "appName": string;
  /** 应用 Logo 链接 */
  "appLogo": string;
  /** 应用描述信息 */
  "appDescription": string;
  /** 应用类型 */
  "appType": "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 是否为集成应用 */
  "isIntegrateApp": boolean;
}

export interface GenAuthListApplicationSimpleInfoDto {
  "page"?: number;
  "limit"?: number;
  /** 是否为集成应用 */
  "isIntegrateApp"?: boolean;
  /** 是否为自建应用 */
  "isSelfBuiltApp"?: boolean;
  /** 是否开启单点登录 */
  "ssoEnabled"?: boolean;
  /** 模糊搜索字符串 */
  "keywords"?: string;
}

export interface GenAuthApplicationSimpleInfoPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthApplicationSimpleInfoDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthCreateApplicationDto {
  /** 应用名称 */
  "appName": string;
  /** 集成应用模版类型，**集成应用必填**。集成应用只需要填 `template` 和 `templateData` 两个字段，其他的字段将被忽略。 */
  "template"?: string;
  /** 集成应用配置信息，**集成应用必填**。 */
  "templateData"?: unknown;
  /** 应用唯一标志，**自建应用必填**。 */
  "appIdentifier"?: string;
  /** 应用 Logo 链接 */
  "appLogo"?: string;
  /** 应用描述信息 */
  "appDescription"?: string;
  /** 应用类型 */
  "appType"?: "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 默认应用协议类型 */
  "defaultProtocol"?: "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris"?: (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris"?: (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri"?: string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled"?: boolean;
  /** OIDC 协议配置 */
  "oidcConfig"?: GenAuthOIDCConfig;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled"?: boolean;
  /** SAML 协议配置 */
  "samlConfig"?: GenAuthSamlIdpConfig;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled"?: boolean;
  /** OAuth2.0 协议配置。【重要提示】不再推荐使用 OAuth2.0，建议切换到 OIDC。 */
  "oauthConfig"?: GenAuthOauthIdpConfig;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled"?: boolean;
  /** CAS 协议配置 */
  "casConfig"?: GenAuthCasIdPConfig;
  /** 登录配置 */
  "loginConfig"?: GenAuthApplicationLoginConfigInputDto;
  /** 注册配置 */
  "registerConfig"?: GenAuthApplicationRegisterConfigInputDto;
  /** 品牌化配置 */
  "brandingConfig"?: GenAuthApplicationBrandingConfigInputDto;
}

export interface GenAuthCreateApplicationRespDataDto {
  /** 应用 ID */
  "appId": string;
  /** 应用唯一标志 */
  "appIdentifier": string;
  /** 应用名称 */
  "appName": string;
  /** 应用 Logo 链接 */
  "appLogo": string;
  /** 应用描述信息 */
  "appDescription": string;
  /** GUMem 事件采集配置 */
  "gumemEventConfig"?: GenAuthGUMemEventConfigDto;
  /** 应用类型 */
  "appType": "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 用户池 ID */
  "userPoolId": string;
  /** 是否为集成应用 */
  "isIntegrateApp": boolean;
  /** 默认应用协议类型 */
  "defaultProtocol": "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris": (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris": (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri": string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled": boolean;
  /** 开启 SSO 单点登录的时间 */
  "ssoEnabledAt": boolean;
  /** 登录配置 */
  "loginConfig": GenAuthApplicationLoginConfigDto;
  /** 注册配置 */
  "registerConfig": GenAuthApplicationRegisterConfig;
  /** 品牌化配置 */
  "brandingConfig": GenAuthApplicationBrandingConfig;
  "informationCompletionConfig": GenAuthApplicationInformationCompletionConfig;
  /** OIDC 协议配置 */
  "oidcConfig": GenAuthOIDCConfig;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled": boolean;
  /** SAML 协议配置 */
  "samlConfig": GenAuthSamlIdpConfig;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled": boolean;
  /** OAuth2.0 协议配置 */
  "oauthConfig"?: GenAuthOauthIdpConfig;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled": boolean;
  /** CAS 协议配置 */
  "casConfig"?: GenAuthCasIdPConfig;
  /** 是否自定义本应用的登录框，默认走全局的登录框配置。 */
  "customBrandingEnabled": boolean;
  /** 是否自定义本应用的安全规则，默认走全局的安全配置。 */
  "customSecurityEnabled": boolean;
  /** 集成应用的模版类型 */
  "template"?: string;
}

export interface GenAuthCreateAuthFlowAppConfigDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthEnabledAuthFlowAppConfigDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthUpdateApplicationDto {
  /** 应用 ID */
  "appId": string;
  /** 应用名称 */
  "appName"?: string;
  /** 集成应用配置信息 */
  "templateData"?: unknown;
  /** 应用唯一标志 */
  "appIdentifier"?: string;
  /** 应用 Logo 链接 */
  "appLogo"?: string;
  /** 应用描述信息 */
  "appDescription"?: string;
  /** 默认应用协议类型 */
  "defaultProtocol"?: "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris"?: (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris"?: (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri"?: string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled"?: boolean;
  /** OIDC 协议配置 */
  "oidcConfig"?: GenAuthOIDCConfig;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled"?: boolean;
  /** SAML 协议配置 */
  "samlConfig"?: GenAuthSamlIdpConfig;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled"?: boolean;
  /** OAuth2.0 协议配置。【重要提示】不再推荐使用 OAuth2.0，建议切换到 OIDC。 */
  "oauthConfig"?: GenAuthOauthIdpConfig;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled"?: boolean;
  /** CAS 协议配置 */
  "casConfig"?: GenAuthCasIdPConfig;
  /** 登录配置 */
  "loginConfig"?: GenAuthUpdateApplicationLoginConfigInputDto;
  /** GUMem 事件采集配置 */
  "gumemEventConfig"?: GenAuthGUMemEventConfigInputDto;
  /** 注册配置 */
  "registerConfig"?: GenAuthApplicationRegisterConfigInputDto;
  /** 品牌化配置 */
  "brandingConfig"?: GenAuthApplicationBrandingConfigInputDto;
  /** 未授权用户是否可以在应用面板中看到该应用 */
  "ssoShowLaunchpad"?: boolean;
  /** 是否开启可申请权限，另外应用必须开启 SSO 单点登录和未授权用户可以在应用面板中看到该应用配置 */
  "enablePermissionApply"?: boolean;
}

export interface GenAuthDeleteApplicationDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthGetApplicationSecretDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthGetApplicationSecretDataDto {
  /** 应用密钥 */
  "secret": string;
}

export interface GenAuthRefreshApplicationSecretDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthRefreshApplicationSecretDataDto {
  /** 新的应用密钥 */
  "secret": string;
}

export interface GenAuthListApplicationActiveUsersDto {
  /** 应用 ID */
  "appId": string;
  /** 可选项 */
  "options"?: GenAuthListApplicationActiveUsersOptionsDto;
}

export interface GenAuthUserPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthUserDto)[];
}

export interface GenAuthGetApplicationPermissionStrategyDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthGetApplicationPermissionStrategyDataDto {
  /** 应用访问授权策略 */
  "permissionStrategy": string;
}

export interface GenAuthUpdateApplicationPermissionStrategyDataDto {
  /** 应用 ID */
  "appId": string;
  /** 应用访问授权策略 */
  "permissionStrategy": "ALLOW_ALL" | "DENY_ALL";
}

export interface GenAuthAuthorizeApplicationAccessDto {
  /** 应用 ID */
  "appId": string;
  /** 授权主体列表，最多 10 条 */
  "list": (GenAuthApplicationPermissionRecordItem)[];
}

export interface GenAuthRevokeApplicationAccessDto {
  /** 应用 ID */
  "appId": string;
  /** 授权主体列表，最多 10 条 */
  "list": (GenAuthDeleteApplicationPermissionRecordItem)[];
}

export interface GenAuthCheckDomainAvailable {
  /** 域名 */
  "domain": string;
}

export interface GenAuthCheckDomainAvailableDataDto {
  /** 是否可用 */
  "available": boolean;
}

export interface GenAuthGetTenantApplicationListDto {
  /** 获取应用列表的页码 */
  "page"?: number;
  /** 每页获取的应用数量 */
  "limit"?: number;
  /** 搜索关键字 */
  "keywords"?: string;
  /** 应用是否加入单点登录 */
  "sso_enabled"?: string;
}

export interface GenAuthTenantApplicationListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthTenantApplicationDto)[];
}

export interface GenAuthTenantQuery {
  "tenantId"?: string;
}

export interface GenAuthUpdateLoginConfigDto {
  "appId": string;
  /** 应用登录配置更新内容 */
  "update": GenAuthUpdateLoginConfig;
}

export interface GenAuthUserPoolTenantConfigDto {
  /** UserPool ID */
  "userPoolId": string;
  /** 用户池是否作为租户 */
  "isUserPoolAsTenant": boolean;
  /** 允许切换的类型 */
  "enableSwitchType": ("tenant-console" | "tenant-app" | "tenant-launpad")[];
  /** 自定义 CSS */
  "css": string;
  /** 是否启用自定义 CSS */
  "cssEnabled": boolean;
  /** 自定义 Loading */
  "customLoading": string;
  /** 是否开启 Guard 切换 */
  "enableGuardVersionSwitch": boolean;
  /** 使用 Guard 的版本 */
  "guardVersion": "v1" | "v2";
  /** 自定义 Loading 背景 */
  "loadingBackground": string;
  /** 是否允许创建租户 */
  "enableCreateTenant": boolean;
  /** 允许创建租户的场景 */
  "createTenantScenes": (string)[];
  /** 是否允许加入租户 */
  "enableJoinTenant": boolean;
  /** 允许创建加入的场景 */
  "joinTenantScenes": (string)[];
  /** 是否校验企业域名 */
  "enableVerifyDomain": boolean;
  /** 校验企业域名的场景 */
  "verifyDomainScenes": ("join-tenant" | "tenant-console" | "tenant-app" | "tenant-launchpad")[];
  /** 页面自定义配置 */
  "ssoPageCustomizationSettings": GenAuthISsoPageCustomizationSettingsDto;
  /** 是否允许选择门户登录 */
  "enableMultipleTenantPortal": boolean;
  /** 登录配置 */
  "loginConfig": GenAuthApplicationLoginConfigDto;
}

export interface GenAuthUpdateUserPoolTenantLoginConfigDto {
  /** 应用登录配置更新内容 */
  "update": GenAuthUpdateLoginConfig;
}

export interface GenAuthUpdateTenantAppqrcodeState {
  /** 是否允许开启扫码登录 */
  "enabled": boolean;
}

export interface GenAuthChangeUserPoolTenantExtIdpConnDto {
  /** 身份源连接 ID */
  "connIds": (string)[];
  /** 是否开启身份源连接 */
  "enabled": boolean;
}

export interface GenAuthUpdateApplicationMfaSettingsDto {
  "appId": string;
  /** 开启的 MFA 认证因素列表 */
  "enabledFactors"?: ("OTP" | "SMS" | "EMAIL" | "FACE")[];
  /** 关闭的 MFA 认证因素列表 */
  "disabledFactors"?: ("OTP" | "SMS" | "EMAIL" | "FACE")[];
}

export interface GenAuthMFASettingsDto {
  /** 开启的 MFA 认证因素列表 */
  "enabledFactors": ("OTP" | "SMS" | "EMAIL" | "FACE")[];
}

export interface GenAuthGetMfaInfoDto {
  "appId": string;
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthGetMfaInfoDataDto {
  /** MFA Token */
  "mfaToken": string;
  /** MFA 绑定的手机号 */
  "mfaPhone"?: string;
  /** MFA 绑定的手机区号 */
  "mfaPhoneCountryCode"?: string;
  /** MFA 绑定的邮箱 */
  "mfaEmail"?: string;
  /** 用户昵称 */
  "nickname"?: string;
  /** 用户名 */
  "username"?: string;
  /** 用户手机号 */
  "phone"?: string;
  /** 用户手机区号 */
  "phoneCountryCode"?: string;
  /** 人脸校验是否开启 */
  "faceMfaEnabled"?: boolean;
  /** OTP 校验是否开启 */
  "totpMfaEnabled"?: boolean;
  /** MFA Factor 列表 */
  "applicationMfa": (GenAuthApplicationMfaDto)[];
}

export interface GenAuthGetApplicationAccessControlUserListDto {
  /** 应用 ID */
  "appId": string;
  /** 是否查询直属用户 */
  "isDirectUser": boolean;
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: boolean;
}

export interface GenAuthCreateAsaAccountDto {
  "appId": string;
  "accountInfo": Record<string, unknown>;
}

export interface GenAuthAsaAccountDto {
  "appId": string;
  "accountId": string;
  "accountInfo": string;
}

export interface GenAuthCreateAsaAccountsBatchDto {
  "appId": string;
  /** 账号列表 */
  "list": (GenAuthCreateAsaAccountsBatchItemDto)[];
}

export interface GenAuthUpdateAsaAccountDto {
  "appId": string;
  /** ASA 账号 ID */
  "accountId": string;
  "accountInfo": Record<string, unknown>;
}

export interface GenAuthListAsaAccountDto {
  "appId": string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthAsaAccountPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthAsaAccountDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthGetAsaAccountDto {
  "appId": string;
  /** ASA 账号 ID */
  "accountId": string;
}

export interface GenAuthGetAsaAccountBatchDto {
  "appId": string;
  /** ASA 账号 ID 列表 */
  "accountIds": (string)[];
}

export interface GenAuthDeleteAsaAccountDto {
  "appId": string;
  /** ASA 账号 ID */
  "accountId": string;
}

export interface GenAuthDeleteAsaAccountBatchDto {
  "appId": string;
  /** ASA 账号 ID 列表 */
  "accountIds": (string)[];
}

export interface GenAuthAssignAsaAccountsDto {
  "appId": string;
  /** 要关联的账号 ID */
  "accountId": string;
  /** 关联对象列表 */
  "targets": (GenAuthAssignAsaAccountItem)[];
}

export interface GenAuthGetAsaAccountAssignmentsDto {
  "appId": string;
  /** ASA 账号 ID */
  "accountId": string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthGetAsaAccountAssignedTargetDataDto {
  /** 总数 */
  "totalCount": number;
  /** 主体列表 */
  "list": (GenAuthAsaAccountTargetDto)[];
}

export interface GenAuthAssignedAsaAccountReqDto {
  "appId": string;
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifier": string;
}

export interface GenAuthListProgrammaticAccessAccountRequestDto {
  "appId": string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthProgrammaticAccessAccountPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthProgrammaticAccessAccountDto)[];
}

export interface GenAuthCreateProgrammaticAccessAccountRequestDto {
  "appId": string;
  "tokenLifetime": number;
  "remarks"?: string;
}

export interface GenAuthProgrammaticAccessAccountDto {
  "appId": string;
  "accessKey": string;
  "secretKey": string;
  "enabled": boolean;
  "tokenLifetime": number;
  "remarks"?: string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthResetProgrammaticAccessAccountSecretRequestDto {
  "appId": string;
  "accessKey": string;
}

export interface GenAuthDisableOrEnableProgrammaticAccessAccountRequestDto {
  "appId": string;
  "accessKey": string;
}

export interface GenAuthDeleteProgrammaticAccessAccountRequestDto {
  "appId": string;
  "accessKey": string;
}

export interface GenAuthGetAdminAuditLogsDto {
  /** 请求 ID */
  "requestId"?: string;
  /** 客户端 IP */
  "clientIp"?: string;
  /** 操作类型，例如 create、update、delete、login 等 */
  "operationType"?: string;
  /** 资源类型，例如 DATA、API、BUTTON 等 */
  "resourceType"?: string;
  /** 管理员用户 ID */
  "userId"?: string;
  /** 请求是否成功 */
  "success"?: boolean;
  /** 开始时间戳 */
  "start"?: number;
  /** 结束时间戳 */
  "end"?: number;
  /** 分页 */
  "pagination"?: GenAuthListWebhooksDto;
}

export interface GenAuthAdminAuditLogRespData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthAdminAuditLogDto)[];
}

export interface GenAuthGetUserActionLogsDto {
  /** 请求 ID */
  "requestId"?: string;
  /** 客户端 IP */
  "clientIp"?: string;
  /** 事件类型，用户的一系列操作，比如 login、logout、register、verifyMfa 等 */
  "eventType"?: string;
  /** 用户 ID */
  "userId"?: string;
  /** 应用 ID */
  "appId"?: string;
  /** 开始时间戳 */
  "start"?: number;
  /** 结束时间戳 */
  "end"?: number;
  /** 请求是否成功 */
  "success"?: boolean;
  /** 分页 */
  "pagination"?: GenAuthListWebhooksDto;
}

export interface GenAuthUserActionLogRespData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthUserActionLogDto)[];
}

export interface GenAuthCustomFieldDto {
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 创建时间，只针对自定义字段有效，内置字段没有创建时间。 */
  "createdAt": string;
  /** 数据类型，**设置之后将不能进行修改**。 - `STRING`: 字符串类型 - `NUMBER`: 数字类型 - `DATETIME`: 日期类型 - `BOOLEAN`: 布尔类型 - `ENUM`: 枚举值类型      */
  "dataType": "STRING" | "NUMBER" | "DATETIME" | "BOOLEAN" | "ENUM";
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
  /** 显示名称 */
  "label": string;
  /** 详细描述信息 */
  "description"?: string;
  /** 是否加密存储。开启后，该字段的**新增数据**将被加密，此参数一旦设置不可更改。 */
  "encrypted"?: boolean;
  /** 是否为唯一字段，开启之后，当前字段上报的值将进行唯一校验。此参数只针对数据类型为字符串和数字的字段有效。 */
  "isUnique"?: boolean;
  /** 用户是否可编辑，如果是手机号、邮箱等特殊字段，用户不能直接修改，需要先通过验证码等方式进行验证。 */
  "userEditable"?: boolean;
  /** 是否需要在 Authing 控制台中进行显示： - 如果是用户自定义字段，控制是否在用户详情展示； - 如果是部门自定义字段，控制是否在部门详情中展示； - 如果是角色扩展字段，控制是否在角色详情中展示。      */
  "visibleInAdminConsole"?: boolean;
  /** 是否在用户个人中心展示（此参数不控制 API 接口是否返回）。 */
  "visibleInUserCenter"?: boolean;
  /** 多语言显示名称 */
  "i18n"?: GenAuthCustomFieldI18n;
  /** 枚举值类型选择项 */
  "options"?: (GenAuthCustomFieldSelectOption)[];
}

export interface GenAuthListCustomFieldsReqDto {
  /** 租户 ID */
  "tenantId"?: string;
  "targetType"?: "NODE" | "USER" | "USERPOOL" | "ROLE" | "DEPARTMENT" | "PERMISSION" | "APPLICATION" | "RESOURCE" | "TENANT_USER" | "TENANT_DEPARTMENT";
  /** 字段类型 */
  "dataType"?: "STRING" | "NUMBER" | "DATETIME" | "BOOLEAN" | "OBJECT" | "SELECT";
  "page"?: number;
  "limit"?: number;
  /** 用户是否可见 */
  "userVisible"?: boolean;
  /** 管理员是否可见 */
  "adminVisible"?: boolean;
  /** 访问控制 */
  "accessControl"?: boolean;
  /** 搜索关键词 */
  "keyword"?: string;
  /** 搜索语言 */
  "lang"?: string;
}

export interface GenAuthListCustomFieldsDto {
  /** 分页计数 */
  "count": GenAuthCountCustomFieldsDto;
  /** 响应数据 */
  "list": (GenAuthCustomFieldDto)[];
}

export interface GenAuthSetUserBaseFieldsReqDto {
  /** 自定义字段列表 */
  "list": (GenAuthSetUserBaseFieldDto)[];
}

export interface GenAuthGetUserDefinedFieldsDto {
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthSetCustomFieldsReqDto {
  /** 自定义字段列表 */
  "list": (GenAuthSetCustomFieldDto)[];
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthDeleteCustomFieldsReqDto {
  /** 自定义字段列表 */
  "list": (GenAuthDeleteCustomFieldDto)[];
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthSetCustomDataReqDto {
  /** 租户 ID */
  "tenantId"?: string;
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifier": string;
  /** 所属权限分组的 code，当 target_type 为角色的时候需要填写，否则可以忽略 */
  "namespace"?: string;
  /** 自定义数据列表 */
  "list": (GenAuthSetCustomDataDto)[];
}

export interface GenAuthGetCustomDataDto {
  /** 租户 ID */
  "tenantId"?: string;
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifier": string;
  /** 所属权限分组的 code，当 targetType 为角色的时候需要填写，否则可以忽略 */
  "namespace"?: string;
}

export interface GenAuthGetUserPermissionListDto {
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 权限空间 Code 列表 */
  "namespaceCodes"?: (string)[];
}

export interface GenAuthGetUserPermissionListDataDto {
  /** 用户权限列表 */
  "userPermissionList": (GenAuthUserPermissionListDto)[];
}

export interface GenAuthCheckPermissionDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 用户 ID */
  "userId": string;
  /** 数据资源权限操作, read、get、write 等动作 */
  "action": string;
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
  /** 是否开启条件判断，默认 false 不开启 */
  "judgeConditionEnabled"?: boolean;
  /** 条件环境属性，若开启条件判断则使用 */
  "authEnvParams"?: GenAuthAuthEnvParams;
}

export interface GenAuthCheckPermissionDataDto {
  /** 检查结果列表 */
  "checkResultList": (GenAuthCheckPermissionsRespDto)[];
}

export interface GenAuthCheckExternalUserPermissionDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 外部用户 ID */
  "externalId": string;
  /** 数据资源权限操作, read、get、write 等动作 */
  "action": string;
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
  /** 是否开启条件判断，默认 true 开启 */
  "judgeConditionEnabled"?: boolean;
  /** 条件环境属性，若开启条件判断则使用 */
  "authEnvParams"?: GenAuthAuthEnvParams;
}

export interface GenAuthCheckExternalUserPermissionDataDto {
  /** 检查结果列表 */
  "checkResultList": (GenAuthCheckExternalUserPermissionsRespDto)[];
}

export interface GenAuthGetUserResourcePermissionListDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 用户 ID */
  "userId": string;
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
}

export interface GenAuthGetUserResourcePermissionListDataDto {
  /** 权限列表 */
  "permissionList": (GenAuthGetUserResourcePermissionList)[];
}

export interface GenAuthListResourceTargetsDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 数据策略所属的数据资源路径列表 */
  "resources": (string)[];
}

export interface GenAuthListResourceTargetsDataDto {
  /** 用户授权列表 */
  "authUserList": (GenAuthListResourceTargetsDtoResp)[];
}

export interface GenAuthGetUserResourceStructDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 用户 ID  */
  "userId": string;
  /** 数据资源 Code */
  "resourceCode": string;
}

export interface GenAuthGetUserResourceStructDataDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源 Code */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrResourceAuthAction - `ARRAY`: 数组类型 ArrResourceAuthAction - `TREE`: 树类型 TreeResourceAuthAction  */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 字符串资源授权 */
  "strResourceAuthAction"?: GenAuthStrResourceAuthAction;
  /** 数组资源授权 */
  "arrResourceAuthAction"?: GenAuthArrResourceAuthAction;
  /** 树资源授权 */
  "treeResourceAuthAction"?: GenAuthTreeResourceAuthAction;
}

export interface GenAuthGetExternalUserResourceStructDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 外部用户 ID */
  "externalId": string;
  /** 资源 Code */
  "resourceCode": string;
}

export interface GenAuthGetExternalUserResourceStructDataDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源 Code */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrResourceAuthAction - `ARRAY`: 数组类型 ArrResourceAuthAction - `TREE`: 树类型 TreeResourceAuthAction  */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 字符串资源授权 */
  "strResourceAuthAction"?: GenAuthStrResourceAuthAction2;
  /** 数组资源授权 */
  "arrResourceAuthAction"?: GenAuthArrResourceAuthAction2;
  /** 树资源授权 */
  "treeResourceAuthAction"?: GenAuthTreeResourceAuthAction2;
}

export interface GenAuthCheckUserSameLevelPermissionDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 用户 ID */
  "userId": string;
  /** 数据资源权限操作 */
  "action": string;
  /** 树资源路径,允许多层级路径，示例如下所示 - treeResourceCode - treeResourceCode/structCode - treeResourceCode/structCode/struct1Code - treeResourceCode/.../structCode */
  "resource": string;
  /** 当前树资源路径子节点 Code */
  "resourceNodeCodes": (string)[];
  /** 是否开启条件判断，默认 false 不开启 */
  "judgeConditionEnabled"?: boolean;
  /** 条件环境属性，若开启条件判断则使用 */
  "authEnvParams"?: GenAuthAuthEnvParams;
}

export interface GenAuthCheckUserSameLevelPermissionDataDto {
  /** 响应结果列表 */
  "checkLevelResultList": (GenAuthCheckUserSameLevelPermissionRespDto)[];
}

export interface GenAuthGetM2MPermissionListDto {
  /** 编程访问账号的 accessKeyId */
  "accessKeyId": string;
}

export interface GenAuthGetM2mPermissionListDataDto {
  /** 用户权限列表 */
  "m2mPermissionList": (GenAuthM2mPermissionListDto)[];
}

export interface GenAuthCheckM2mPermissionDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** m2m accessKeyID */
  "accessKeyId": string;
  /** 数据资源权限操作, read、get、write 等动作 */
  "action": string;
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
}

export interface GenAuthGetM2mResourcePermissionListDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** m2m Access Key ID */
  "accessKeyId": string;
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
}

export interface GenAuthGetM2mResourcePermissionListDataDto {
  /** 权限列表 */
  "permissionList": (GenAuthGetUserResourcePermissionList)[];
}

export interface GenAuthGetM2mResourceStructDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** m2m  ID  */
  "accessKeyId": string;
  /** 数据资源 Code */
  "resourceCode": string;
}

export interface GenAuthGetM2mResourceStructDataDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源 Code */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrResourceAuthAction - `ARRAY`: 数组类型 ArrResourceAuthAction - `TREE`: 树类型 TreeResourceAuthAction  */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 字符串资源授权 */
  "strResourceAuthAction"?: GenAuthStrResourceAuthAction3;
  /** 数组资源授权 */
  "arrResourceAuthAction"?: GenAuthArrResourceAuthAction3;
  /** 树资源授权 */
  "treeResourceAuthAction"?: GenAuthTreeResourceAuthAction3;
}

export interface GenAuthCheckM2mSameLevelPermissionDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** m2m accessKeyID */
  "accessKeyId": string;
  /** 数据资源权限操作 */
  "action": string;
  /** 树资源路径,允许多层级路径，示例如下所示 - treeResourceCode - treeResourceCode/structCode - treeResourceCode/structCode/struct1Code - treeResourceCode/.../structCode */
  "resource": string;
  /** 当前树资源路径子节点 Code */
  "resourceNodeCodes": (string)[];
}

export interface GenAuthListPermissionViewDto {
  "page"?: number;
  "limit"?: number;
  /** 关键字搜索,可以支持 userName 搜索 */
  "keyword"?: string;
}

export interface GenAuthListPermissionViewPaginatedRespDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthListPermissionViewRespDto)[];
}

export interface GenAuthCreateDataPolicyDto {
  "policyName": string;
  /** 数据权限列表，策略下数据资源权限列表 */
  "statementList": (GenAuthDataStatementPermissionDto)[];
  "description"?: string;
}

export interface GenAuthCreateDataPolicyRespDto {
  "policyId": string;
  "policyName"?: string;
  "description"?: string;
  /** 数据策略创建时间 */
  "createdAt": string;
  /** 数据策略更新时间 */
  "updatedAt": string;
}

export interface GenAuthListDataPolicyDto {
  "page"?: number;
  "limit"?: number;
  /** 数据策略名称关键字搜索 */
  "query"?: string;
}

export interface GenAuthDataPoliciesPaginatedRespDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthListDataPoliciesRespDto)[];
}

export interface GenAuthDataPoliciesSimplePaginatedRespDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthListSimpleDataPoliciesRespDto)[];
}

export interface GenAuthGetDataPolicyDto {
  "policyId": string;
}

export interface GenAuthGetDataPolicyRespDto {
  "policyId": string;
  "policyName"?: string;
  "description"?: string;
  /** 数据策略创建时间 */
  "createdAt": string;
  /** 数据策略更新时间 */
  "updatedAt": string;
}

export interface GenAuthUpdateDataPolicyDto {
  "policyId": string;
  "policyName"?: string;
  "description"?: string;
  /** 数据权限列表，每个策略下所有的数据权限 */
  "statementList"?: (GenAuthDataStatementPermissionDto)[];
}

export interface GenAuthUpdateDataPolicyRespDto {
  "policyId": string;
  "policyName"?: string;
  "description"?: string;
  /** 数据策略创建时间 */
  "createdAt": string;
  /** 数据策略更新时间 */
  "updatedAt": string;
}

export interface GenAuthDeleteDataPolicyDto {
  "policyId": string;
}

export interface GenAuthCheckParamDataPolicyDto {
  "policyName": string;
}

export interface GenAuthCheckParamsDataPolicyRespDto {
  /** 数据策略名称校验是否有效 */
  "isValid": boolean;
  /** 数据策略名称校验失败提示信息,如果校验成功, message 不返回 */
  "message"?: string;
}

export interface GenAuthListDataPolicySubjectDto {
  "policyId": string;
  "page"?: number;
  "limit"?: number;
  /** 主体名称 */
  "query"?: string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 */
  "targetType"?: (0 | 1 | 2 | 3 | 4)[];
}

export interface GenAuthListDataPolicySubjectPageDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthDataSubjectRespDto)[];
}

export interface GenAuthCreateAuthorizeDataPolicyDto {
  /** 数据策略 id 列表 */
  "policyIds": (string)[];
  /** 数据权限列表，每个策略下所有的数据权限 */
  "targetList": (GenAuthSubjectDto)[];
}

export interface GenAuthDeleteAuthorizeDataPolicyDto {
  "policyId": string;
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID、编程访问账号 ID */
  "targetIdentifier": string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG、PROGRAMMATIC_ACCOUNT 五种类型 */
  "targetType": 0 | 1 | 2 | 3 | 4;
}

export interface GenAuthCreateDataResourceDto {
  "namespaceCode": string;
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | (GenAuthDataResourceTreeStructs)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  "description"?: string;
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: (GenAuthExtendField)[];
}

export interface GenAuthCreateDataResourceRespDto {
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | (GenAuthDataResourceTreeStructs)[];
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: (GenAuthExtendField)[];
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  "description"?: string;
}

export interface GenAuthCreateStringDataResourceDto {
  "namespaceCode": string;
  "resourceName": string;
  "resourceCode": string;
  /** 字符串数据资源节点 */
  "struct": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  "description"?: string;
}

export interface GenAuthCreateStringDataResourceRespDto {
  /** 字符串数据资源节点 */
  "struct": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  "description"?: string;
}

export interface GenAuthCreateArrayDataResourceDto {
  "namespaceCode": string;
  "resourceName": string;
  "resourceCode": string;
  /** 数组数据资源节点 */
  "struct": (string)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  "description"?: string;
}

export interface GenAuthCreateArrayDataResourceRespDto {
  /** 数组数据资源节点 */
  "struct": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  "description"?: string;
}

export interface GenAuthCreateTreeDataResourceDto {
  "namespaceCode": string;
  "resourceName": string;
  "resourceCode": string;
  /** 树数据资源节点 */
  "struct": (GenAuthDataResourceTreeStructs)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  "description"?: string;
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: (GenAuthExtendField)[];
}

export interface GenAuthCreateTreeDataResourceRespDto {
  /** 树数据资源节点 */
  "struct": (GenAuthDataResourceTreeStructs)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: (GenAuthExtendField)[];
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  "description"?: string;
}

export interface GenAuthListDataResourcesDto {
  "page"?: number;
  "limit"?: number;
  /** 关键字搜索，可以是数据资源名称或者数据资源 Code */
  "query"?: string;
  /** 权限数据所属权限空间 Code 列表 */
  "namespaceCodes"?: (string)[];
}

export interface GenAuthDataResourcesPaginatedRespDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthListDataResourcesRespDto)[];
}

export interface GenAuthGetDataResourceDto {
  "namespaceCode": string;
  "resourceCode": string;
}

export interface GenAuthGetDataResourceRespDto {
  "namespaceCode": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: (GenAuthExtendField)[];
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | (GenAuthDataResourceTreeStructs)[];
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  "description"?: string;
}

export interface GenAuthUpdateDataResourceDto {
  "namespaceCode": string;
  "resourceCode": string;
  "resourceName"?: string;
  "description"?: string;
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct"?: string | (string)[] | (GenAuthDataResourceTreeStructs)[];
  /** 数据资源权限操作列表 */
  "actions"?: (string)[];
}

export interface GenAuthUpdateDataResourceRespDto {
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | (GenAuthDataResourceTreeStructs)[];
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: (GenAuthExtendField)[];
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  "description"?: string;
}

export interface GenAuthDeleteDataResourceDto {
  "namespaceCode": string;
  "resourceCode": string;
}

export interface GenAuthCheckParamsDataResourceDto {
  "namespaceCode": string;
  "resourceName"?: string;
  "resourceCode"?: string;
}

export interface GenAuthCheckParamsDataResourceRespDto {
  /** 数据资源名称或者 Code 校验是否有效 */
  "isValid": boolean;
  /** 数据资源名称或者 Code 校验失败提示信息,如果校验成功, message 不返回 */
  "message"?: string;
}

export interface GenAuthCreateDnefReq {
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
  /** 字段值类型 */
  "valueType": "STRING" | "SELECT";
  /** 描述 */
  "description"?: string;
  /** 展示名称 */
  "label": string;
  /** 字段配置，当 valueType=SELECT 时，此参数必传，否则可不传 */
  "config"?: GenAuthConfig;
  "namespaceCode": string;
  "resourceCode": string;
}

export interface GenAuthBatchCreateDnefReq {
  /** 字段列表 */
  "fieldList"?: (GenAuthExtendField)[];
  "namespaceCode": string;
  "resourceCode": string;
}

export interface GenAuthDeleteDnefReq {
  "namespaceCode": string;
  "resourceCode": string;
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
}

export interface GenAuthUpdateDnefReq {
  /** 描述 */
  "description"?: string;
  /** 展示名称 */
  "label"?: string;
  /** 字段配置，当 valueType=SELECT 时，此参数必传，否则可不传 */
  "config"?: GenAuthConfig;
  "namespaceCode": string;
  "resourceCode": string;
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
}

export interface GenAuthListDnefReq {
  /** 起始索引，默认为 1，即从第 1 条开始 */
  "startIndex"?: number;
  /** 单次查询最大条数，最大不能超过 50，默认为 10 */
  "maxSize"?: number;
  /** 关键字搜索，可以是字段唯一标识、展示名称 */
  "query"?: string;
  "namespaceCode": string;
  "resourceCode": string;
}

export interface GenAuthDnefPaginatedRespDto {
  /** 下一页开始的索引，当最后一页时返回 -1 */
  "nextStartIndex": number;
  /** 是否被截断，true 表示可以查询下一页，false 表示是最后一页数据 */
  "truncated": boolean;
  /** 响应数据 */
  "list": (GenAuthExtendField)[];
}

export interface GenAuthCreatePermissionNamespaceDto {
  /** 权限空间 Code */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述 */
  "description"?: string;
}

export interface GenAuthCreatePermissionNamespaceRespDto {
  /** 权限空间唯一标志符 */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述信息 */
  "description"?: string;
}

export interface GenAuthCreatePermissionNamespacesBatchDto {
  /** 权限空间列表 */
  "list": (GenAuthCreatePermissionNamespacesBatchItemDto)[];
}

export interface GenAuthGetPermissionNamespaceDto {
  /** 权限空间 Code */
  "code": string;
}

export interface GenAuthGetPermissionNamespaceRespDto {
  /** 权限空间唯一标志符 */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述信息 */
  "description"?: string;
}

export interface GenAuthGetPermissionNamespacesBatchDto {
  /** 权限空间 code 列表，批量可以使用逗号分隔 */
  "codes": (string)[];
}

export interface GenAuthGetPermissionNamespaceRespDto2 {
  /** 权限空间唯一标志符 */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述信息 */
  "description"?: string;
}

export interface GenAuthListPermissionNamespacesDto {
  "page"?: number;
  "limit"?: number;
  /** 权限空间 name */
  "query"?: string;
}

export interface GenAuthPermissionNamespaceListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthPermissionNamespacesListRespDto)[];
}

export interface GenAuthUpdatePermissionNamespaceDto {
  /** 权限分组老的唯一标志符 Code */
  "code": string;
  /** 权限空间名称 */
  "name"?: string;
  /** 权限分组新的唯一标志符 Code */
  "newCode"?: string;
  /** 权限空间描述 */
  "description"?: string;
}

export interface GenAuthUpdatePermissionNamespaceRespDto {
  /** 权限空间唯一标志符 */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述信息 */
  "description"?: string;
}

export interface GenAuthDeletePermissionNamespaceDto {
  /** 权限空间 Code */
  "code": string;
}

export interface GenAuthDeletePermissionNamespacesBatchDto {
  /** 权限分组 code 列表 */
  "codes": (string)[];
}

export interface GenAuthCheckPermissionNamespaceExistsDto {
  /** 权限空间 Code */
  "code"?: string;
  /** 权限空间名称 */
  "name"?: string;
}

export interface GenAuthCheckPermissionNamespaceExistsRespDto {
  /** 校验权限空间名称或者权限空间名称 Code 是否有效 */
  "isValid": boolean;
  /** 权限空间名称或权限空间 Code 校验失败提示信息,如果校验成功, Message 不返回 */
  "message"?: string;
}

export interface GenAuthListPermissionNamespaceRolesDto {
  "page"?: number;
  "limit"?: number;
  /** 权限分组唯一标志符 Code */
  "code": string;
  /** 角色 Code 或者名称 */
  "query"?: string;
}

export interface GenAuthPermissionNamespaceRolesListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthPermissionNamespaceRolesListRespDto)[];
}

export interface GenAuthCreateDynamicGroupDto {
  /** 分组名称 */
  "name": string;
  /** 分组唯一标识符 */
  "code": string;
  /** 分组描述 */
  "description"?: string;
  /** 匹配规则 */
  "match"?: GenAuthMatch;
}

export interface GenAuthDynamicGroupDto {
  /** 分组 id */
  "id": string;
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description"?: string;
  /** 匹配规则 */
  "match": GenAuthMatch;
  /** 最后一次执行匹配的时间 */
  "lastMatchTime"?: string;
  /** 动态分组规则运行结果 */
  "status"?: "running" | "finish" | "failed" | "waiting";
  /** 分组类型 */
  "type": "static" | "dynamic";
}

export interface GenAuthGetDynamicGroupMatchDto {
  /** 动态分组 id */
  "dynamicGroupId": string;
}

export interface GenAuthDynamicGroupMatchDto {
  /** 部门 id */
  "dynamicGroupId": string;
  /** 匹配规则 */
  "match": GenAuthMatch;
  /** 最后一次执行匹配的时间 */
  "lastMatchTime"?: string;
  /** 动态分组规则运行结果 */
  "status"?: "running" | "finish" | "failed" | "waiting";
}

export interface GenAuthUpdateDynamicGroupDto {
  /** 分组 id */
  "id": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description": string;
  /** 匹配规则 */
  "match": GenAuthMatch;
}

export interface GenAuthPreviewDynamicGroupDto {
  /** 匹配规则 */
  "match"?: GenAuthMatch;
  "page"?: number;
  "limit"?: number;
  /** 用户模糊搜索 */
  "keywords"?: string;
}

export interface GenAuthDynamicGroupSearchPartDto {
  /** 部门模糊搜索 */
  "keywords"?: string;
}

export interface GenAuthPartListDto {
  /** 响应数据 */
  "list": (GenAuthPartDto)[];
}

export interface GenAuthGetTenantIdDto {
  /** 租户 ID */
  "tenantId"?: string;
  /** 应用 ID */
  "appId"?: string;
}

export interface GenAuthExtIdpListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthExtIdpDto)[];
}

export interface GenAuthGetExtIdpDto {
  /** 身份源 ID */
  "id": string;
  /** 身份源类型 */
  "type"?: "social" | "enterprise";
  /** 租户 ID */
  "tenantId"?: string;
  /** 应用 ID */
  "appId"?: string;
}

export interface GenAuthExtIdpDetail {
  /** 身份源的连接列表 */
  "connections": (GenAuthExtIdpConnDetail)[];
  /** 租户场景下自动加入 */
  "autoJoin"?: boolean;
  /** 身份源 id */
  "id": string;
  /** 身份源名称 */
  "name": string;
  /** 身份源的 Logo */
  "logo"?: string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 身份源类型 */
  "type": string;
}

export interface GenAuthCreateExtIdpDto {
  /** 身份源名称 */
  "name": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark";
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthExtIdpDto {
  /** 身份源 id */
  "id": string;
  /** 身份源名称 */
  "name": string;
  /** 身份源的 Logo */
  "logo"?: string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 身份源类型 */
  "type": string;
  "connections"?: (GenAuthExtIdpConnDto)[];
}

export interface GenAuthUpdateExtIdpDto {
  /** 名称 */
  "name": string;
  /** 身份源 ID */
  "id": string;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthDeleteExtIdpDto {
  /** 身份源 ID */
  "id": string;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthCreateExtIdpConnDto {
  /** 身份源连接 ID */
  "extIdpId": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:genauth:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark:miniprogram:default";
  /** 身份源连接标识 */
  "identifier": string;
  /** 是否只支持登录 */
  "loginOnly"?: boolean;
  /** 身份源图标 */
  "logo"?: string;
  /** 连接在登录页的显示名称 */
  "displayName": string;
  /** 连接的自定义配置信息 */
  "fields": Record<string, unknown>;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthExtIdpConnDetail {
  /** 是否只支持登录 */
  "loginOnly": boolean;
  /** 账号关联模式 */
  "associationMode": "none" | "field" | "challenge";
  /** 账号绑定方式 */
  "challengeBindingMethods"?: ("email-password" | "username-password" | "phone-password" | "phone-code" | "email-code")[];
  /** 身份源连接 id */
  "id": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:genauth:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark:miniprogram:default";
  /** 身份源 ID */
  "extIdpId": string;
  /** 身份源连接图标 */
  "logo": string;
  /** 身份源连接标识 */
  "identifier": string;
  /** 身份源连接在登录页的显示名称 */
  "displayName": string;
}

export interface GenAuthUpdateExtIdpConnDto {
  /** 身份源连接 ID */
  "id": string;
  /** 身份源连接显示名称 */
  "displayName"?: string;
  /** 身份源连接自定义参数（增量修改） */
  "fields": Record<string, unknown>;
  /** 身份源连接的图标 */
  "logo"?: string;
  /** 是否只支持登录 */
  "loginOnly"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthDeleteExtIdpConnDto {
  /** 身份源连接 ID */
  "id": string;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthChangeExtIdpConnStateDto {
  /** 身份源连接 ID */
  "id": string;
  /** 是否开启身份源连接 */
  "enabled": boolean;
  /** 应用 ID */
  "appId"?: string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 应用 ID 列表 */
  "appIds"?: (string)[];
}

export interface GenAuthChangeExtIdpAssociationStateDto {
  /** 身份源连接 ID */
  "id": string;
  /** 是否关联身份源 */
  "association": boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthListTenantExtIdp {
  /** 租户 ID */
  "tenantId"?: string;
  /** 应用 ID */
  "appId"?: string;
  /** 身份源类型 */
  "type"?: "social" | "enterprise";
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthGetWechatAccessTokenDto {
  /** 微信小程序或微信公众号的 AppId */
  "appId": string;
  /** 微信小程序或微信公众号的 AppSecret */
  "appSecret": string;
}

export interface GenAuthGetWechatAccessTokenDataDto {
  /** Authing 服务器缓存的微信 Access Token */
  "accessToken": string;
  /** Access Token 到期时间，为单位为秒的时间戳 */
  "expiresAt": string;
}

export interface GenAuthListExtIdpConnDto {
  /** 身份源 ID */
  "id": string;
}

export interface GenAuthExtIdpConnDetailWithFieldsDto {
  /** 自定义参数 */
  "fields": Record<string, unknown>;
  /** 是否只支持登录 */
  "loginOnly": boolean;
  /** 账号关联模式 */
  "associationMode": "none" | "field" | "challenge";
  /** 账号绑定方式 */
  "challengeBindingMethods"?: ("email-password" | "username-password" | "phone-password" | "phone-code" | "email-code")[];
  /** 身份源连接 id */
  "id": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:genauth:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark:miniprogram:default";
  /** 身份源 ID */
  "extIdpId": string;
  /** 身份源连接图标 */
  "logo": string;
  /** 身份源连接标识 */
  "identifier": string;
  /** 身份源连接在登录页的显示名称 */
  "displayName": string;
}

export interface GenAuthListExtIdpConnByAppDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthGetGroupDto {
  /** 分组 code */
  "code": string;
  /** 是否获取自定义数据 */
  "withCustomData"?: boolean;
}

export interface GenAuthGroupDto {
  /** 分组 ID */
  "id": string;
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description"?: string;
  /** 分组类型 */
  "type"?: "static" | "dynamic";
  /** 分组元数据信息 */
  "metadataSource"?: (GenAuthSystemModelMetadataSourceItem)[];
  /** 成员列表 */
  "members"?: (unknown)[];
}

export interface GenAuthListGroupsDto {
  /** 搜索分组 code 或分组名称 */
  "keywords"?: string;
  "page"?: number;
  "limit"?: number;
  /** 是否展示元数据内容 */
  "withMetadata"?: boolean;
  /** 是否获取自定义数据 */
  "withCustomData"?: boolean;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: boolean;
}

export interface GenAuthGroupPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthResGroupDto)[];
}

export interface GenAuthGetAllGroupsDto {
  /** 是否获取成员列表 */
  "fetchMembers"?: boolean;
  /** 是否获取自定义数据 */
  "withCustomData"?: boolean;
}

export interface GenAuthCreateGroupReqDto {
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description"?: string;
  /** 分组类型 */
  "type"?: "static" | "dynamic";
}

export interface GenAuthCreateOrUpdateGroupReqDto {
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description"?: string;
  /** 分组类型 */
  "type"?: "static" | "dynamic";
}

export interface GenAuthCreateOrUpdateGroupDataDto {
  /** 是否创建 */
  "created": boolean;
  /** 群组信息 */
  "data": GenAuthGroupDto;
}

export interface GenAuthCreateGroupBatchReqDto {
  /** 批量分组 */
  "list": (GenAuthCreateGroupReqDto)[];
}

export interface GenAuthUpdateGroupReqDto {
  /** 分组名称 */
  "name"?: string;
  /** 分组新的 code */
  "newCode"?: string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
  /** 分组 code */
  "code": string;
  /** 分组描述 */
  "description"?: string;
}

export interface GenAuthDeleteGroupsReqDto {
  /** 分组 code 列表 */
  "codeList": (string)[];
}

export interface GenAuthAddGroupMembersReqDto {
  "userIds": (string)[];
  /** 分组 code */
  "code": string;
}

export interface GenAuthRemoveGroupMembersReqDto {
  "userIds": (string)[];
  /** 分组 code */
  "code": string;
}

export interface GenAuthListGroupMembersDto {
  /** 分组 code */
  "code": string;
  "page"?: number;
  "limit"?: number;
  "withCustomData"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: boolean;
}

export interface GenAuthGetGroupAuthorizedResourcesDto {
  "namespace"?: string;
  /** 资源类型 */
  "resourceType"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 分组 code */
  "code": string;
}

export interface GenAuthAuthorizedResourceDto {
  /** 资源描述符 */
  "resourceCode": string;
  /** 资源描述信息 */
  "description": string;
  /** 策略 Condition */
  "condition": (GenAuthPolicyCondition)[];
  /** 资源类型 */
  "resourceType": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** API URL */
  "apiIdentifier": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 授权的操作列表 */
  "actions": (string)[];
  /** 允许还是拒绝 */
  "effect": "ALLOW" | "DENY";
}

export interface GenAuthGetDepartmentReqDto {
  /** 组织 code */
  "organizationCode"?: string;
  /** 部门 ID，根部门传 `root`。departmentId 和 departmentCode 必传其一。 */
  "departmentId"?: string;
  /** 部门 code。departmentId 和 departmentCode 必传其一。 */
  "departmentCode"?: string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  "withCustomData"?: boolean;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthDepartmentDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 部门创建时间 */
  "createdAt": string;
  /** 修改时间 */
  "updatedAt": string;
  /** 自定义部门 ID，用于存储自定义的 ID */
  "openDepartmentId"?: string;
  /** 部门名称 */
  "name": string;
  /** 部门负责人 ID */
  "leaderUserIds"?: (string)[];
  /** 部门描述 */
  "description"?: string;
  /** 父部门 id，如果是根部门，传 root */
  "parentDepartmentId": string;
  /** 部门识别码 */
  "code"?: string;
  /** 父部门 code */
  "parentDepartmentCode": string;
  /** 部门人数（仅包含直属成员） */
  "membersCount": number;
  /** 是否包含子部门 */
  "hasChildren": boolean;
  /** 是否是虚拟部门 */
  "isVirtualNode"?: boolean;
  /** 多语言设置 */
  "i18n"?: GenAuthDepartmentI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: Record<string, unknown>;
  /** 部门关联的岗位 */
  "posts"?: (GenAuthPostDto)[];
  /** 岗位 id 列表 */
  "postIdList"?: (string)[];
  /** 部门状态 */
  "status"?: boolean;
  /** 访问限制 */
  "allow"?: (string)[];
  "departmentNamePath"?: (string)[];
}

export interface GenAuthGetDepartmentByIdReqDto {
  /** 部门 ID */
  "departmentId": string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 应用类型列表 */
  "appTypeList"?: ("INTEGRATED" | "SELFBUILT" | "APP_PANEL")[];
  "withCustomData"?: boolean;
}

export interface GenAuthCreateDepartmentReqDto {
  /** 此次调用中使用的父部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 岗位 id 列表 */
  "postIdList"?: (string)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 元数据信息 */
  "metadata"?: Record<string, unknown>;
  /** 部门识别码 */
  "code"?: string;
  /** 部门名称 */
  "name": string;
  /** 部门描述 */
  "description"?: string;
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 父部门 id，如果是根部门，传 root */
  "parentDepartmentId": string;
  /** 自定义部门 ID，用于存储自定义的 ID */
  "openDepartmentId"?: string;
  /** 多语言设置 */
  "i18n"?: GenAuthDepartmentI18nDto;
  /** 是否是虚拟部门 */
  "isVirtualNode"?: boolean;
  /** 部门的扩展字段数据 */
  "customData"?: Record<string, unknown>;
}

export interface GenAuthUpdateDepartmentReqDto {
  /** 部门名称 */
  "name"?: string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 父部门 id，如果是根部门，传 root */
  "parentDepartmentId"?: string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
  /** 元数据信息 */
  "metadata"?: Record<string, unknown>;
  /** 岗位 id 列表 */
  "postIdList"?: (string)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 部门识别码 */
  "code"?: string;
  /** 部门描述 */
  "description"?: string;
  /** 部门状态 */
  "status"?: boolean;
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 多语言设置 */
  "i18n"?: GenAuthDepartmentI18nDto;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 部门负责人 ID */
  "leaderUserIds"?: (string)[];
}

export interface GenAuthDeleteDepartmentReqDto {
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 租户 ID */
  "tenantId"?: string;
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
}

export interface GenAuthSearchDepartmentsReqDto {
  /** 搜索关键词，如组织名称等 */
  "keywords": string;
  "withCustomData"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
  /** 组织 code */
  "organizationCode": string;
}

export interface GenAuthSearchDepartmentsListReqDto {
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  "page"?: number;
  "limit"?: number;
  /** 高级搜索 */
  "advancedFilter"?: (GenAuthSearchDepartmentsFilterItemDto)[];
  /** 排序依据，如 更新时间或创建时间 */
  "sortBy"?: "updatedAt" | "createdAt";
  /** 增序或降序 */
  "orderBy"?: "ASC" | "DESC";
  /** 排序设置，可以设置多项按照多个字段进行排序 */
  "sort"?: (GenAuthDepartmentSortingDto)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 组织 code */
  "organizationCode": string;
}

export interface GenAuthListChildrenDepartmentsReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 需要获取的部门 ID */
  "departmentId": string;
  /** 部门的状态 */
  "status"?: boolean;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 是否要排除虚拟组织 */
  "excludeVirtualNode"?: string;
  /** 是否只包含虚拟组织 */
  "onlyVirtualNode"?: string;
  "withCustomData"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthDepartmentPagingDto {
  /** 总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthDepartmentDto)[];
}

export interface GenAuthGetAllDepartmentsDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID，不填写默认为 `root` 根部门 ID */
  "departmentId"?: string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id";
  "withCustomData"?: boolean;
  "withPost"?: boolean;
}

export interface GenAuthListDepartmentMembersReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root` */
  "departmentId": string;
  /** 排序依据 */
  "sortBy"?: "Default" | "JoinDepartmentAt" | "userId" | "createAt" | "updatedAt";
  /** 增序还是倒序 */
  "orderBy"?: "Asc" | "Desc";
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 是否包含子部门的成员 */
  "includeChildrenDepartments"?: boolean;
  "page"?: number;
  "limit"?: number;
  "withCustomData"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthListDepartmentMemberIdsDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root` */
  "departmentId"?: string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthSearchDepartmentMembersDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root` */
  "departmentId": string;
  /** 搜索关键词，如成员名称 */
  "keywords": string;
  "page"?: number;
  "limit"?: number;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 是否包含子部门的成员 */
  "includeChildrenDepartments"?: boolean;
  "withCustomData"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthAddDepartmentMembersReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
}

export interface GenAuthRemoveDepartmentMembersReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
}

export interface GenAuthGetParentDepartmentReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID */
  "departmentId"?: string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  "withCustomData"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthIsUserInDepartmentReqDto {
  "userId": string;
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root`。departmentId 和 departmentCode 必传其一。 */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 是否包含子部门 */
  "includeChildrenDepartments"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthIsUserInDepartmentDataDto {
  /** 是否在此部门内 */
  "inDepartment": boolean;
}

export interface GenAuthCreateDepartmentTreeReqDto {
  /** 部门名称 */
  "name": string;
  /** 子部门 */
  "children"?: (GenAuthCreateDepartmentTreeReqDto)[];
  /** 部门成员 */
  "members"?: (GenAuthUserInfoDto)[];
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthResult {
  /** 新增用户数 */
  "addUser": number;
  /** 更新用户数 */
  "updateUser": number;
  /** 新增部门数 */
  "addDepartment": number;
  /** 更新部门数 */
  "updateDepartment": number;
}

export interface GenAuthGetDepartmentSyncRelationsReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root`。departmentId 和 departmentCode 必传其一。 */
  "departmentId"?: string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  "withCustomData"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthUserSyncRelationDto {
  /** 外部身份源类型，如： - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `lark`: 飞书 - `welink`: Welink - `ldap`: LDAP - `active-directory`: Windows AD - `italent`: 北森 - `xiaoshouyi`: 销售易 - `maycur`: 每刻报销 - `scim`: SCIM - `moka`: Moka HR      */
  "provider": string;
  /** 在外部身份源中的 ID */
  "userIdInIdp": string;
  /** 用户在第三方中的身份信息 */
  "userInfoInIdp": Record<string, unknown>;
}

export interface GenAuthDeleteDepartmentSyncRelationReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root` */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 外部身份源类型，如： - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `lark`: 飞书 - `welink`: Welink - `ldap`: LDAP - `active-directory`: Windows AD - `italent`: 北森 - `xiaoshouyi`: 销售易 - `maycur`: 每刻报销 - `scim`: SCIM - `moka`: Moka HR      */
  "provider": string;
}

export interface GenAuthUpdateDepartmentStatusReqDto {
  /** 需要获取的部门 ID */
  "departmentId": string;
  /** 部门状态 */
  "status": boolean;
}

export interface GenAuthNode {
  "userPoolId": string;
  "openDepartmentId": string;
  "orgId": string;
  "name": string;
  "nameI18n"?: Record<string, unknown>;
  "description"?: string;
  "descriptionI18n"?: Record<string, unknown>;
  "order"?: number;
  "sort"?: number;
  "i18n": GenAuthDepartmentI18nDto;
  "code"?: string;
  "isVirtualNode": boolean;
  "leaderUserId"?: string;
  "__id"?: string;
  "__parentid"?: string;
  "__groupid": string;
  "status"?: boolean;
  "connections": (GenAuthDeepPartial)[];
  "root"?: boolean;
  "depth"?: number;
  "children"?: (string)[] | (GenAuthNode)[];
  "path": (string)[];
  "fullPath": unknown;
  "members"?: (GenAuthUser)[];
  "idPath"?: (string)[];
  "namePath"?: (string)[];
  "codePath"?: (string)[];
  "hasChildren"?: boolean;
  "parentDepartmentId"?: string;
  "parentDepartmentCode"?: string;
  "customData"?: Record<string, unknown>;
  "organizationCode": string;
  "membersCount"?: number;
  "postIdList"?: (string)[];
  "isOrg"?: boolean;
  "leaderUserIds"?: (string)[];
  "metadataSource"?: (GenAuthSystemModelMetadataSourceItem)[];
  "memberNum": number;
  "id": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthIsDepartmentInDepartmentReqDto {
  /** 部门 ID */
  "departmentId": string;
  /** 组织 code */
  "organizationCode": string;
  /** 父部门 ID，根部门传 `root`。departmentId 和 departmentCode 必传其一。 */
  "parentDepartmentId": string;
  /** 此次调用中使用的父部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthIsDepartmentInDepartmentDataDto {
  /** 是否在此部门内 */
  "inDepartment": boolean;
}

export interface GenAuthGetOrganizationDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthOrganizationDto {
  /** 组织 code */
  "organizationCode": string;
  /** 组织名称 */
  "organizationName": string;
  /** 组织描述信息 */
  "description"?: string;
  /** 创建时间 */
  "createdAt": string;
  /** 修改时间 */
  "updatedAt": string;
  /** 根节点 ID */
  "departmentId": string;
  /** 根节点自定义 ID */
  "openDepartmentId"?: string;
  /** 是否包含子节点 */
  "hasChildren": boolean;
  /** 部门负责人 ID */
  "leaderUserIds"?: (string)[];
  /** 部门人数 */
  "membersCount": number;
  /** 是否是虚拟部门 */
  "isVirtualNode": boolean;
  /** 多语言设置 */
  "i18n"?: GenAuthOrganizationNameI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: Record<string, unknown>;
  /** 租户 ID */
  "tenantId"?: string;
  /** 岗位 id 列表 */
  "postIdList"?: (string)[];
  /** 状态 */
  "status"?: boolean;
  /** 访问限制 */
  "allow"?: (string)[];
}

export interface GenAuthGetOrganizationBatchDto {
  /** 组织 Code（organizationCode）列表 */
  "organizationCodeList": (string)[];
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthListOrganizationsDto {
  "page"?: number;
  "limit"?: number;
  /** 拉取所有 */
  "fetchAll"?: boolean;
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
  /** 组织的状态 */
  "status"?: boolean;
}

export interface GenAuthOrganizationPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthOrganizationDto)[];
}

export interface GenAuthCreateOrganizationReqDto {
  /** 岗位 id 列表 */
  "postIdList"?: (string)[];
  /** 元数据信息 */
  "metadata"?: Record<string, unknown>;
  /** 组织描述信息 */
  "description"?: string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 组织 code */
  "organizationCode": string;
  /** 根节点自定义 ID */
  "openDepartmentId"?: string;
  /** 多语言设置 */
  "i18n"?: GenAuthOrganizationNameI18nDto;
  /** 组织名称 */
  "organizationName": string;
}

export interface GenAuthUpdateOrganizationReqDto {
  /** 新组织 code */
  "organizationNewCode"?: string;
  /** 组织名称 */
  "organizationName"?: string;
  /** 部门描述 */
  "description"?: string;
  /** 岗位 id 列表 */
  "postIdList"?: (string)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 组织 code */
  "organizationCode": string;
  /** 根节点自定义 ID */
  "openDepartmentId"?: string;
  /** 多语言设置 */
  "i18n"?: GenAuthOrganizationNameI18nDto;
  /** 部门负责人 ID */
  "leaderUserIds"?: (string)[];
}

export interface GenAuthDeleteOrganizationReqDto {
  /** 租户 ID */
  "tenantId"?: string;
  /** 组织 code */
  "organizationCode": string;
}

export interface GenAuthSearchOrganizationsDto {
  /** 搜索关键词，如组织机构名称 */
  "keywords": string;
  "page"?: number;
  "limit"?: number;
  "withCustomData"?: boolean;
  /** 租户 ID */
  "tenantId"?: string;
}

export interface GenAuthUpdateOrganizationStatusReqDto {
  /** 状态 */
  "status"?: boolean;
  /** 组织 id */
  "rootNodeId": string;
}

export interface GenAuthCreatePipelineFunctionDto {
  /** 函数名称 */
  "funcName": string;
  /** 函数描述 */
  "funcDescription"?: string;
  /** 函数 app */
  "appId"?: string;
  /** 函数的触发场景： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前      */
  "scene": "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY" | "AUTH_FLOW_FUNCTION";
  /** 函数源代码 */
  "sourceCode": string;
  /** 是否异步执行。设置为异步执行的函数不会阻塞整个流程的执行，适用于异步通知的场景，比如飞书群通知、钉钉群通知等。 */
  "isAsynchronous"?: boolean;
  /** 函数运行超时时间，要求必须为整数，最短为 1 秒，最长为 60 秒，默认为 3 秒。 */
  "timeout"?: number;
  /** 如果函数运行超时，是否终止整个流程，默认为否。 */
  "terminateOnTimeout"?: boolean;
  /** 是否启用此 Pipeline */
  "enabled"?: boolean;
}

export interface GenAuthPipelineFunctionDto {
  /** 函数 ID */
  "funcId": string;
  /** 函数名称 */
  "funcName": string;
  /** 函数描述 */
  "funcDescription": string;
  /** 函数的触发场景： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前      */
  "scene": "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY" | "AUTH_FLOW_FUNCTION";
  /** 函数创建时间 */
  "createdAt": string;
  /** 函数修改时间 */
  "updatedAt": string;
  /** 是否异步执行。设置为异步执行的函数不会阻塞整个流程的执行，适用于异步通知的场景，比如飞书群通知、钉钉群通知等。 */
  "isAsynchronous": boolean;
  /** 函数运行超时时间，最短为 1 秒，最长为 60 秒，默认为 3 秒。 */
  "timeout": number;
  /** 如果函数运行超时，是否终止整个流程，默认为否。 */
  "terminateOnTimeout": boolean;
  /** 函数源代码 */
  "sourceCode": string;
  /** 函数当前状态： - `uploading`: 上传中 - `success`: 上传成功 - `failed`: 上传失败      */
  "status": "uploading" | "success" | "failed";
  /** 上传失败的错误提示 */
  "uploadErrMsg": string;
  /** 此 Pipeline 是否被启用 */
  "enabled": boolean;
  /** 是否为云函数 */
  "isCloud": boolean;
  /** 最后执行状态 */
  "lastExecuteStatus": GenAuthLastExecuteStatus;
}

export interface GenAuthGetPipelineFunctionDto {
  /** Pipeline 函数 ID */
  "funcId": string;
}

export interface GenAuthUpdatePipelineFunctionDto {
  /** Pipeline 函数 ID */
  "funcId": string;
  /** 函数名称 */
  "funcName"?: string;
  /** 函数描述 */
  "funcDescription"?: string;
  /** 函数 app */
  "appId"?: string;
  /** 函数源代码。如果修改之后，函数会重新上传。 */
  "sourceCode"?: string;
  /** 是否异步执行。设置为异步执行的函数不会阻塞整个流程的执行，适用于异步通知的场景，比如飞书群通知、钉钉群通知等。 */
  "isAsynchronous"?: boolean;
  /** 函数运行超时时间，最短为 1 秒，最长为 60 秒，默认为 3 秒。 */
  "timeout"?: number;
  /** 如果函数运行超时，是否终止整个流程，默认为否。 */
  "terminateOnTimeout"?: boolean;
  /** 是否启用此 Pipeline */
  "enabled"?: boolean;
}

export interface GenAuthDeletePipelineFunctionDto {
  /** Pipeline 函数 ID */
  "funcId": string;
}

export interface GenAuthReUploadPipelineFunctionDto {
  /** Pipeline 函数 ID */
  "funcId": string;
}

export interface GenAuthUpdatePipelineOrderDto {
  /** 函数的触发场景： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前      */
  "scene": "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY" | "AUTH_FLOW_FUNCTION";
  /** 新的排序方式，按照函数 ID 的先后顺序进行排列。 */
  "order": (string)[];
}

export interface GenAuthListPipelineFunctionsDto {
  /** 通过函数的触发场景进行筛选（可选，默认返回所有）： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前      */
  "scene"?: "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY" | "AUTH_FLOW_FUNCTION";
}

export interface GenAuthPipelineFunctionPagingDto {
  /** 总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthPipelineFunctionDto)[];
}

export interface GenAuthGetPipelineLogsDto {
  /** Pipeline 函数 ID */
  "funcId": string;
  "page"?: number;
  "limit"?: number;
  "filters"?: Record<string, unknown>;
}

export interface GenAuthGetRoleDto {
  /** 权限分组(权限空间)内角色的唯一标识符 */
  "code": string;
  "namespace"?: string;
}

export interface GenAuthRoleDto {
  /** 角色 ID */
  "id": string;
  /** 权限分组(权限空间)内角色的唯一标识符 Code */
  "code": string;
  /** 权限分组(权限空间)内角色名称 */
  "name"?: string;
  /** 角色描述 */
  "description": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace": string;
  /** 所属权限分组(权限空间)的名称 */
  "namespaceName"?: string;
  /** 角色状态，ENABLE-表示正常，DISABLE-表示禁止 */
  "status"?: "ENABLE" | "DISABLE";
  /** 角色自动禁止时间，单位毫秒, 如果传null表示永久有效 */
  "disableTime"?: number;
  /** 是否开启可申请权限，另外应用必须开启 SSO 单点登录和未授权用户可以在应用面板中看到该应用配置 */
  "enablePermissionApply"?: boolean;
}

export interface GenAuthAssignRoleDto {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 主体过期时间毫秒值, 为 null 时永久有效 */
  "endTime"?: number;
  /** 主体加入时间毫秒值, 为 null 时立即加入 */
  "enableTime"?: number;
  /** 所属权限分组的 code */
  "namespace"?: string;
  /** 目标对象 */
  "targets": (GenAuthTargetDto)[];
}

export interface GenAuthAssignRoleBatchDto {
  /** 角色信息列表 */
  "roles": (GenAuthRoleCodeDto)[];
  /** 分配角色的目标列表 */
  "targets": (GenAuthTargetDto)[];
}

export interface GenAuthRevokeRoleDto {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组的 code */
  "namespace"?: string;
  /** 移除角色的目标 */
  "targets": (GenAuthTargetDto)[];
}

export interface GenAuthRevokeRoleBatchDto {
  /** 角色信息列表 */
  "roles": (GenAuthRoleCodeDto)[];
  /** 移除角色的目标列表 */
  "targets": (GenAuthTargetDto)[];
}

export interface GenAuthRoleAuthorizedResourcesDto {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组的 code */
  "namespace"?: string;
  /** 资源类型，如 数据、API、按钮、菜单 */
  "resourceType"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthRoleAuthorizedResourcePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthRoleAuthorizedResourcesRespDto)[];
}

export interface GenAuthListRoleMemberDto {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组的 code */
  "namespace"?: string;
  "page"?: number;
  "limit"?: number;
  "withCustomData"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
}

export interface GenAuthListRoleDepartmentDto {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组的 code */
  "namespace"?: string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthRoleDepartmentListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthRoleDepartmentRespDto)[];
}

export interface GenAuthCreateRoleDto {
  /** 权限分组（权限空间）内角色的唯一标识符 */
  "code": string;
  /** 权限分组（权限空间）内角色名称 */
  "name"?: string;
  "namespace"?: string;
  /** 角色描述 */
  "description"?: string;
  /** 角色自动禁止时间，单位毫秒, 如果传null表示永久有效 */
  "disableTime"?: number;
  "tenantId"?: string;
}

export interface GenAuthListRoleDto {
  "page"?: number;
  "limit"?: number;
  /** 用于根据角色的 code 或者名称进行模糊搜索，可选。 */
  "keywords"?: string;
  "namespace"?: string;
}

export interface GenAuthRolePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthRoleDto)[];
}

export interface GenAuthDeleteRoleDto {
  /** 角色 code 列表 */
  "codeList": (string)[];
  "namespace"?: string;
}

export interface GenAuthCreateRolesBatch {
  /** 角色列表 */
  "list": (GenAuthRoleListItem)[];
}

export interface GenAuthUpdateRoleDto {
  /** 权限分组(权限空间）内角色的唯一标识符 */
  "code": string;
  /** 角色新的权限分组（权限空间）内唯一识别码 */
  "newCode"?: string;
  /** 权限分组（权限空间）角色名称 */
  "name"?: string;
  "namespace"?: string;
  /** 角色描述 */
  "description"?: string;
  /** 角色状态，ENABLE-表示正常，DISABLE-表示禁止 */
  "status"?: "ENABLE" | "DISABLE";
  /** 角色自动禁止时间，单位毫秒, 如果传null表示永久有效 */
  "disableTime"?: number;
  /** 是否开启可申请权限，另外应用必须开启 SSO 单点登录和未授权用户可以在应用面板中看到该应用配置 */
  "enablePermissionApply"?: boolean;
}

export interface GenAuthDeleteRoleBatchDto {
  /** 角色 Code 和 namespace 列表 */
  "roleList": (GenAuthRoleCodeAndNamespaceDto)[];
}

export interface GenAuthCheckRoleParamsDto {
  /** 所属权限分组(权限空间)的 Code，不传使用默认权限分组。 */
  "namespace": string;
  /** 权限分组（权限空间）内角色的唯一标识符 */
  "code"?: string;
  /** 权限分组（权限空间）内角色名称 */
  "name"?: string;
}

export interface GenAuthCheckRoleParamsRespDto {
  /** 权限空间名称或者权限空间 Code 校验是否有效 */
  "isValid": boolean;
  /** 权限空间名称或权限空间 Code 校验失败提示信息,如果校验成功, Message 不返回 */
  "message"?: string;
}

export interface GenAuthListRoleAssignmentsDto {
  "page"?: number;
  "limit"?: number;
  /** 按角色 Code 或者角色名称查询 */
  "query"?: string;
  "roleCode": string;
  /** 权限空间code */
  "namespaceCode"?: string;
  /** 目标类型，接受用户，部门 */
  "targetType"?: ("USER" | "ORG")[];
}

export interface GenAuthRoleListPageDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "data": (GenAuthRolePermissionListDto)[];
}

export interface GenAuthCreateAdminRoleDto {
  /** 管理员角色的唯一标识符 */
  "code": string;
  /** 管理员角色名称 */
  "name": string;
  /** 角色描述 */
  "description"?: string;
}

export interface GenAuthDeleteAdminRoleDto {
  /** 角色 code 列表 */
  "codeList": (string)[];
}

export interface GenAuthCheckRoleMutualExclusionReqDto {
  /** 角色信息列表 */
  "roles": (GenAuthRoleCodeDto)[];
}

export interface GenAuthCheckRoleMutualExclusionResultDto {
  /** 角色列表中是否存在互斥关系 */
  "existMutuallyExclusive": boolean;
}

export interface GenAuthListRoleAllMembersDto {
  /** 权限分组内角色的唯一标识符 */
  "roleCode": string;
  /** 所属权限空间的 code */
  "namespaceCode": string;
  "withCustomData"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
}

export interface GenAuthGetRoleDataPolicyDto {
  "page"?: number;
  "limit"?: number;
  /** 策略名称 */
  "keyword"?: string;
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 角色所属的权限空间 Code */
  "namespaceCode": string;
}

export interface GenAuthGetRoleDataPolicyListPageDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "data": (GenAuthGetRoleDataPolicyListDto)[];
}

export interface GenAuthSecuritySettingsDto {
  /** 安全域（CORS） */
  "allowedOrigins"?: string;
  /** Authing Token 有效时间（秒） */
  "genauthTokenExpiresIn": number;
  /** 验证码长度。包含短信验证码、邮件验证码和图形验证码。 */
  "verifyCodeLength": number;
  /** 验证码尝试次数。在一个验证码有效周期内（默认为 60 s），用户输入验证码错误次数超过此阈值之后，将会导致当前验证码失效，需要重新发送。 */
  "verifyCodeMaxAttempts": number;
  /** 用户修改邮箱的安全策略 */
  "changeEmailStrategy": GenAuthChangeEmailStrategyDto;
  /** 用户修改手机号的安全策略 */
  "changePhoneStrategy": GenAuthChangePhoneStrategyDto;
  /** Cookie 过期时间设置 */
  "cookieSettings"?: GenAuthCookieSettingsDto;
  /** 是否禁止用户注册，开启之后，用户将无法自主注册，只能管理员为其创建账号。针对 B2B 和 B2E 类型用户池，默认开启。 */
  "registerDisabled": boolean;
  /** 频繁注册检测配置 */
  "registerAnomalyDetection": GenAuthRegisterAnomalyDetectionConfigDto;
  /** 验证码注册后是否要求用户设置密码（仅针对 Authing 登录页和 Guard 有效，不针对 API 调用）。 */
  "completePasswordAfterPassCodeLogin": boolean;
  /** 登录防暴破配置 */
  "loginAnomalyDetection": GenAuthLoginAnomalyDetectionConfigDto;
  /** 当使用邮箱登录时，未验证的邮箱登录时是否禁止登录并发送认证邮件。当用户收到邮件并完成验证之后，才能进行登录。 */
  "loginRequireEmailVerified": boolean;
  /** 用户自助解锁配置。注：只有绑定了手机号/邮箱的用户才可以自助解锁 */
  "selfUnlockAccount": GenAuthSelfUnlockAccountConfigDto;
  /** Authing 登录页面是否开启登录账号选择 */
  "enableLoginAccountSwitch": boolean;
  /** APP 扫码登录安全配置 */
  "qrcodeLoginStrategy": GenAuthQrcodeLoginStrategyDto;
}

export interface GenAuthUpdateSecuritySettingsDto {
  /** 安全域（CORS） */
  "allowedOrigins"?: (string)[];
  /** Authing Token 有效时间（秒） */
  "genauthTokenExpiresIn"?: number;
  /** 验证码长度。包含短信验证码、邮件验证码和图形验证码。 */
  "verifyCodeLength"?: number;
  /** 验证码尝试次数。在一个验证码有效周期内（默认为 60 s），用户输入验证码错误次数超过此阈值之后，将会导致当前验证码失效，需要重新发送。 */
  "verifyCodeMaxAttempts"?: number;
  /** 用户修改邮箱的安全策略 */
  "changeEmailStrategy"?: GenAuthChangeEmailStrategyDto;
  /** 用户修改手机号的安全策略 */
  "changePhoneStrategy"?: GenAuthChangePhoneStrategyDto;
  /** Cookie 过期时间设置 */
  "cookieSettings"?: GenAuthCookieSettingsDto;
  /** 是否禁止用户注册，开启之后，用户将无法自主注册，只能管理员为其创建账号。针对 B2B 和 B2E 类型用户池，默认开启。 */
  "registerDisabled"?: boolean;
  /** 频繁注册检测配置 */
  "registerAnomalyDetection"?: GenAuthRegisterAnomalyDetectionConfigDto;
  /** 验证码注册后是否要求用户设置密码（仅针对 Authing 登录页和 Guard 有效，不针对 API 调用）。 */
  "completePasswordAfterPassCodeLogin"?: boolean;
  /** 登录防暴破配置 */
  "loginAnomalyDetection"?: GenAuthLoginAnomalyDetectionConfigDto;
  /** 当使用邮箱登录时，未验证的邮箱登录时是否禁止登录并发送认证邮件。当用户收到邮件并完成验证之后，才能进行登录。 */
  "loginRequireEmailVerified"?: boolean;
  /** 用户自助解锁配置。注：只有绑定了手机号/邮箱的用户才可以自助解锁 */
  "selfUnlockAccount"?: GenAuthSelfUnlockAccountConfigDto;
  /** Authing 登录页面是否开启登录账号选择 */
  "enableLoginAccountSwitch"?: boolean;
  /** APP 扫码登录安全配置 */
  "qrcodeLoginStrategy"?: GenAuthQrcodeLoginStrategyDto;
}

export interface GenAuthMFADisableSettingsDto {
  /** 关闭的 MFA 认证因素列表 */
  "disableFactors": ("OTP" | "SMS" | "EMAIL" | "FACE")[];
}

export interface GenAuthPaginationSessionRequestDto {
  /** 支持搜索 Session ID */
  "keywords"?: string;
  "userId"?: string;
  "appId"?: string;
  "deviceId"?: string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthSessionManagementPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSessionManagementDto)[];
}

export interface GenAuthListSessionsDetailByViewRequestDto {
  /** 模糊搜索，可选:  - `USER`: 使用应用名称、设备、Session ID进行搜索 - `APP`: 使用用户名称(姓名、用户名、邮箱、手机号)、设备、Session ID进行搜索 - `DEVICE`: 使用用户名称(姓名、用户名、邮箱、手机号)、应用名称、Session ID进行搜索 */
  "keywords"?: string;
  /** 视图类别: - `USER`: 用户视图 - `APP`: 应用视图 - `DEVICE`: 设备视图 */
  "type": "USER" | "APP" | "DEVICE";
  /** 视图 ID: - type=`USER`: 用户 ID - type=`APP`: 应用 ID - type=`DEVICE`: 设备 ID */
  "viewId": string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthListSessionManagementByUserViewDto {
  /** 使用用户名称(姓名、用户名、邮箱、手机号)、用户 ID进行模糊搜索，可选。 */
  "keywords"?: string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthSessionManagementByUserPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSessionManagementByUserDto)[];
}

export interface GenAuthListSessionManagementByAppViewDto {
  /** 使用应用名称、应用 ID进行模糊搜索，可选。 */
  "keywords"?: string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthSessionManagementByAppPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSessionManagementByAppDto)[];
}

export interface GenAuthListSessionManagementByDeviceViewDto {
  /** 使用搜索设备、设备唯一标识进行模糊搜索，可选。 */
  "keywords"?: string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthSessionManagementByDevicePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSessionManagementByDeviceDto)[];
}

export interface GenAuthDeactivateSessionsRequestDto {
  /** Session 管理 ID 列表 */
  "sessionIds": (string)[];
}

export interface GenAuthDeactivateAllSessionsByViewRequestDto {
  /** 停用类别: - `USER`: 按用户停用 - `APP`: 按应用停用 - `DEVICE`: 按设备停用 */
  "type": "USER" | "APP" | "DEVICE";
  "userIds"?: (string)[];
  "appIds"?: (string)[];
  "deviceIds"?: (string)[];
}

export interface GenAuthGetSyncTaskDto {
  /** 同步任务 ID */
  "syncTaskId": number;
}

export interface GenAuthSyncTaskDto {
  /** 同步任务 ID */
  "syncTaskId": number;
  "createdAt": string;
  "updatedAt": string;
  /** 同步任务名称 */
  "syncTaskName": string;
  /** 同步任务类型: - `lark`: 飞书 - `lark-international`: 飞书国际版 - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `active-directory`: Windows AD - `ldap`: LDAP - `italent`: 北森 - `maycur`: 每刻报销 - `moka`: Moka - `fxiaoke`: 纷享销客 - `xiaoshouyi`: 销售易 - `kayang`: 嘉扬 HR - `scim`: 自定义同步源      */
  "syncTaskType": "lark" | "lark-international" | "wechatwork" | "dingtalk" | "active-directory" | "italent" | "maycur" | "ldap" | "moka" | "fxiaoke" | "scim" | "xiaoshouyi" | "kayang" | "custom";
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统      */
  "syncFlow": "upstream" | "downstream";
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发  */
  "syncTrigger": "manually" | "timed" | "automatic";
  /** 最近一次同步错误信息 */
  "lastSyncMessage": string;
  /** 最近一次同步进度 */
  "lastSyncRate": number;
  /** 最近一次同步状态: - `free`: 空闲状态，从未执行 - `pending`: 等待系统执行 - `onProgress`: 正在执行 - `success`: 成功 - `failed`: 失败      */
  "lastSyncStatus": "free" | "pending" | "onProgress" | "success" | "failed";
  /** 最近一次同步时间 */
  "lastSyncTime": string;
  /** 此同步任务绑定的组织机构。针对上游同步，需执行一次同步任务之后才会绑定组织机构；针对下游同步，创建同步任务的时候就需要设置。 */
  "organizationCode": string;
  /** 同步范围，**只针对下游同步任务有效**。为空表示同步整个组织机构。 */
  "provisioningScope": GenAuthSyncTaskProvisioningScope;
  /** 字段映射配置 */
  "fieldMapping": (GenAuthSyncTaskFieldMapping)[];
  /** 定时同步时间设置 */
  "timedScheduler": GenAuthSyncTaskTimedScheduler;
}

export interface GenAuthListSyncTasksDto {
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthSyncTaskPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSyncTaskDto)[];
}

export interface GenAuthCreateSyncTaskDto {
  /** 同步任务名称 */
  "syncTaskName": string;
  /** 同步任务类型: - `lark`: 飞书 - `lark-international`: 飞书国际版 - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `active-directory`: Windows AD - `ldap`: LDAP - `italent`: 北森 - `maycur`: 每刻报销 - `moka`: Moka - `fxiaoke`: 纷享销客 - `xiaoshouyi`: 销售易 - `kayang`: 嘉扬 HR - `scim`: 自定义同步源      */
  "syncTaskType": "lark" | "lark-international" | "wechatwork" | "dingtalk" | "active-directory" | "italent" | "maycur" | "ldap" | "moka" | "fxiaoke" | "scim" | "xiaoshouyi" | "kayang" | "custom";
  /** 同步任务配置信息 */
  "clientConfig": GenAuthSyncTaskClientConfig;
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统      */
  "syncTaskFlow": "upstream" | "downstream";
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发  */
  "syncTaskTrigger": "manually" | "timed" | "automatic";
  /** 此同步任务绑定的组织机构。针对上游同步，需执行一次同步任务之后才会绑定组织机构；针对下游同步，创建同步任务的时候就需要设置。 */
  "organizationCode"?: string;
  /** 同步范围，**只针对下游同步任务有效**。为空表示同步整个组织机构。 */
  "provisioningScope": GenAuthSyncTaskProvisioningScope;
  /** 字段映射配置 */
  "fieldMapping": (GenAuthSyncTaskFieldMapping)[];
  /** 定时同步时间设置 */
  "timedScheduler": GenAuthSyncTaskTimedScheduler;
}

export interface GenAuthUpdateSyncTaskDto {
  /** 同步任务 ID */
  "syncTaskId": number;
  /** 同步任务名称 */
  "syncTaskName"?: string;
  /** 同步任务类型: - `lark`: 飞书 - `lark-international`: 飞书国际版 - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `active-directory`: Windows AD - `ldap`: LDAP - `italent`: 北森 - `maycur`: 每刻报销 - `moka`: Moka - `fxiaoke`: 纷享销客 - `xiaoshouyi`: 销售易 - `kayang`: 嘉扬 HR - `scim`: 自定义同步源      */
  "syncTaskType"?: "lark" | "lark-international" | "wechatwork" | "dingtalk" | "active-directory" | "italent" | "maycur" | "ldap" | "moka" | "fxiaoke" | "scim" | "xiaoshouyi" | "kayang" | "custom";
  /** 同步任务配置信息 */
  "clientConfig"?: GenAuthSyncTaskClientConfig;
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统      */
  "syncTaskFlow"?: "upstream" | "downstream";
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发  */
  "syncTaskTrigger"?: "manually" | "timed" | "automatic";
  /** 此同步任务绑定的组织机构。针对上游同步，需执行一次同步任务之后才会绑定组织机构；针对下游同步，创建同步任务的时候就需要设置。 */
  "organizationCode"?: string;
  /** 同步范围，**只针对下游同步任务有效**。为空表示同步整个组织机构。 */
  "provisioningScope"?: GenAuthSyncTaskProvisioningScope;
  /** 字段映射配置 */
  "fieldMapping"?: (GenAuthSyncTaskFieldMapping)[];
  /** 定时同步时间设置 */
  "timedScheduler"?: GenAuthSyncTaskTimedScheduler;
}

export interface GenAuthTriggerSyncTaskDto {
  /** 同步任务 ID */
  "syncTaskId": number;
}

export interface GenAuthTriggerSyncTaskDataDto {
  /** 此次执行同步任务的同步作业 ID */
  "syncJobId": number;
}

export interface GenAuthGetSyncJobDto {
  /** 同步作业 ID */
  "syncJobId": number;
}

export interface GenAuthSyncJobDto {
  /** 同步作业 ID */
  "syncJobId": number;
  /** 此同步作业对应的同步任务 ID */
  "syncTaskId": number;
  "createdAt": string;
  "updatedAt": string;
  /** 当前同步状态: - `free`: 空闲状态，从未执行 - `pending`: 等待系统执行 - `onProgress`: 正在执行 - `success`: 成功 - `failed`: 失败      */
  "syncStatus": "free" | "pending" | "onProgress" | "success" | "failed";
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统      */
  "syncFlow": "upstream" | "downstream";
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发  */
  "syncTrigger": "manually" | "timed" | "automatic";
  /** 需要同步的部门个数 */
  "departmentCountAll": number;
  /** 成功同步的部门个数 */
  "departmentCountSucc": number;
  /** 需要更新的部门个数 */
  "departmentUpdateCountAll": number;
  /** 成功更新的部门个数 */
  "departmentUpdateCountSucc": number;
  /** 需要同步的用户个数 */
  "accountCountAll": number;
  /** 成功同步的用户个数 */
  "accountCountSucc": number;
  /** 需要更新的用户个数 */
  "accountUpdateCountAll": number;
  /** 成功更新的用户个数 */
  "accountUpdateCountSucc": number;
  /** 错误信息 */
  "errMsg"?: string;
}

export interface GenAuthListSyncJobDto {
  /** 同步任务 ID */
  "syncTaskId": number;
  "page"?: number;
  "limit"?: number;
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发  */
  "syncTrigger"?: "manually" | "timed" | "automatic";
}

export interface GenAuthSyncJobPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSyncJobDto)[];
}

export interface GenAuthListSyncJobLogsDto {
  /** 同步作业 ID */
  "syncJobId": number;
  "page"?: number;
  "limit"?: number;
  /** 根据是否操作成功进行筛选 */
  "success"?: boolean;
  /** 根据操作类型进行筛选： - `CreateUser`: 创建用户 - `UpdateUser`: 修改用户信息 - `DeleteUser`: 删除用户 - `UpdateUserIdentifier`: 修改用户唯一标志符 - `ChangeUserDepartment`: 修改用户部门 - `CreateDepartment`: 创建部门 - `UpdateDepartment`: 修改部门信息 - `DeleteDepartment`: 删除部门 - `MoveDepartment`: 移动部门 - `UpdateDepartmentLeader`: 同步部门负责人 - `CreateGroup`: 创建分组 - `UpdateGroup`: 修改分组 - `DeleteGroup`: 删除分组 - `Updateless`: 无更新      */
  "action"?: "CreateUser" | "UpdateUser" | "DeleteUser" | "UpdateUserIdentifier" | "ChangeUserDepartment" | "CreateDepartment" | "UpdateDepartment" | "DeleteDepartment" | "MoveDepartment" | "UpdateDepartmentLeader" | "CreateGroup" | "UpdateGroup" | "DeleteGroup" | "Updateless";
  /** 操作对象类型: - `department`: 部门 - `user`: 用户      */
  "objectType"?: "DEPARTMENT" | "USER";
}

export interface GenAuthListSyncRiskOperationsDto {
  /** 同步任务 ID */
  "syncTaskId": number;
  "page"?: number;
  "limit"?: number;
  /** 根据执行状态筛选 */
  "status"?: ("PENDING" | "SUCCESS" | "FAILED" | "CANCELED" | "EXECUTING")[];
  /** 根据操作对象类型，默认获取所有类型的记录： - `department`: 部门 - `user`: 用户      */
  "objectType"?: ("DEPARTMENT" | "USER")[];
}

export interface GenAuthSyncRiskOperationPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSyncRiskOperationDto)[];
}

export interface GenAuthTriggerSyncRiskOperationDto {
  /** 同步任务风险操作 ID */
  "syncRiskOperationIds": string;
}

export interface GenAuthTriggerSyncRiskOperationsDataDto {
  /** 成功执行的风险操作任务 */
  "successList": (number)[];
  /** 执行失败的风险操作任务 */
  "faildList": (number)[];
}

export interface GenAuthCancelSyncRiskOperationDto {
  /** 同步任务风险操作 ID */
  "syncRiskOperationIds": string;
}

export interface GenAuthCancelSyncRiskOperationsDataDto {
  /** 成功取消的风险操作任务 */
  "successList": (number)[];
  /** 取消失败的风险操作任务 */
  "faildList": (number)[];
}

export interface GenAuthAddTenantDepartmentMembersReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 关联的用户池级别的用户 ID */
  "linkUserIds"?: (string)[];
  /** 租户成员 ID */
  "memberIds"?: (string)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
}

export interface GenAuthRemoveTenantDepartmentMembersReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 关联的用户池级别的用户 ID */
  "linkUserIds"?: (string)[];
  /** 租户成员 ID */
  "memberIds"?: (string)[];
  /** 租户 ID */
  "tenantId"?: string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
}

export interface GenAuthSendInviteTenantUserEmailDto {
  "recordIds": (string)[];
}

export interface GenAuthAddTenantUsersDto {
  /** 租户 ID */
  "tenantId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserIds": (string)[];
}

export interface GenAuthRemoveTenantUsersDto {
  /** 租户 ID */
  "tenantId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserIds"?: (string)[];
  /** 租户成员 ID */
  "memberIds"?: (string)[];
}

export interface GenAuthUpdateTenantUserDto {
  /** 租户 ID */
  "tenantId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserId"?: string;
  /** 租户成员 ID */
  "memberId"?: string;
  /** 要更新的租户成员信息 */
  "updates": Record<string, unknown>;
}

export interface GenAuthCreateTenantUserReqDto {
  /** 可选参数 */
  "options"?: GenAuthCreateTenantUserOptionsDto;
  "name"?: string;
  /** 租户 ID */
  "tenantId": string;
  "username"?: string;
  "nickname"?: string;
  "email"?: string;
  "phone"?: string;
  "phoneCountryCode"?: string;
  "address"?: string;
  "birthdate"?: string;
  "photo"?: string;
  "gender"?: "M" | "F" | "U";
  "givenName"?: string;
  "familyName"?: string;
  "country"?: string;
  "city"?: string;
  "province"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  "middleName"?: string;
  "preferredUsername"?: string;
  "password"?: string;
  "salt"?: string;
}

export interface GenAuthTenantUserDto {
  /** 用户池 ID */
  "userPoolId": string;
  /** 租户 ID */
  "tenantId": string;
  /** 租户成员 ID */
  "memberId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserId": string;
  /** 是否为租户管理员 */
  "isTenantAdmin": boolean;
  "password"?: string;
  "salt"?: string;
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: (string)[];
  "name"?: string;
  "username"?: string;
  "nickname"?: string;
  "email"?: string;
  "phone"?: string;
  "phoneCountryCode"?: string;
  "address"?: string;
  "birthdate"?: string;
  "photo"?: string;
  "gender"?: "M" | "F" | "U";
  "givenName"?: string;
  "familyName"?: string;
  "country"?: string;
  "city"?: string;
  "province"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  "middleName"?: string;
  "preferredUsername"?: string;
  "lastIp"?: string;
  "lastLoginApp"?: string;
  "loginsCount"?: number;
}

export interface GenAuthListTenantUserDto {
  /** 租户 ID */
  "tenantId"?: string;
  /** 搜索关键字 */
  "keywords"?: string;
  /** 可选项 */
  "options"?: GenAuthListTenantUsersOptionsDto;
}

export interface GenAuthTenantUserListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthTenantUserDto)[];
}

export interface GenAuthGetTenantUserDto {
  /** 租户 ID */
  "tenantId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserId"?: string;
  /** 租户成员 ID */
  "memberId"?: string;
}

export interface GenAuthCreateTenantDto {
  /** 租户名 */
  "name": string;
  /** 租户关联的应用 ID */
  "appIds": (string)[];
  /** 租户 logo */
  "logo"?: string;
  /** 租户描述 */
  "description"?: string;
  "autoJoin"?: boolean;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId"?: string;
  /** 企业邮箱域名 */
  "enterpriseDomains"?: (string)[];
  /** 租户过期时间 */
  "expireTime"?: string;
  /** 租户 MAU 上限 */
  "mauAmount"?: number;
  /** 租户成员上限 */
  "memberAmount"?: number;
  /** 租户管理员上限 */
  "adminAmount"?: number;
}

export interface GenAuthTenantDto {
  "id"?: string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 用户池 ID */
  "userPoolId": string;
  /** 租户名 */
  "name"?: string;
  /** 租户描述 */
  "description"?: string;
  /** 租户 logo */
  "logo": string;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: string;
  /** 租户关联的应用 ID */
  "appIds": (string)[];
  /** 创建者用户的 ID */
  "creator": string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId"?: string;
  /** 租户来源 */
  "source": "console" | "app" | "import" | "sdk" | "tenant-console";
  /** 租户 Code */
  "code": string;
  /** 租户地址 */
  "host"?: string;
  /** 租户配置的企业域名 */
  "enterpriseDomains"?: string;
}

export interface GenAuthUpdateTenantDto {
  /** 租户 ID */
  "tenantId": string;
  /** 租户名 */
  "name"?: string;
  /** 租户关联的应用 ID */
  "appIds"?: (string)[];
  /** 租户 logo */
  "logo"?: string;
  /** 租户描述 */
  "description"?: string;
  "autoJoin"?: boolean;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId"?: string;
}

export interface GenAuthDeleteTenantDto {
  /** 租户 ID */
  "tenantId": string;
}

export interface GenAuthListTenantsDto {
  /** 搜索关键字 */
  "keywords"?: string;
  /** 是否增加返回租户成员统计 */
  "withMembersCount"?: boolean;
  /** 增加返回租户下 app 简单信息 */
  "withAppDetail"?: boolean;
  /** 增加返回租户下创建者简单信息 */
  "withCreatorDetail"?: boolean;
  /** 增加返回租户下来源 app 简单信息 */
  "withSourceAppDetail"?: boolean;
  /** 页码 */
  "page"?: number;
  /** 每页获取的数据量 */
  "limit"?: number;
  /** 租户来源 */
  "source"?: "console" | "app" | "import" | "sdk" | "tenant-console" | ("console" | "app" | "import" | "sdk" | "tenant-console")[];
}

export interface GenAuthTenantListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthTenantRespDto)[];
}

export interface GenAuthGetTenantDto {
  /** 租户 ID */
  "tenantId": string;
  /** 是否增加返回租户成员统计 */
  "withMembersCount"?: boolean;
  /** 增加返回租户关联应用简单信息 */
  "withAppDetail"?: boolean;
  /** 增加返回租户下创建者简单信息 */
  "withCreatorDetail"?: boolean;
  /** 增加返回租户来源应用简单信息 */
  "withSourceAppDetail"?: boolean;
}

export interface GenAuthTenantRespDto {
  /** 创建者基本信息 */
  "creatorDetail"?: GenAuthObject;
  /** 来源 app 基本信息 */
  "sourceAppDetail": GenAuthObject2;
  /** 租户内成员数 */
  "membersCount": number;
  "id"?: string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 用户池 ID */
  "userPoolId": string;
  /** 租户名 */
  "name"?: string;
  /** 租户描述 */
  "description"?: string;
  /** 租户 logo */
  "logo": string;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: string;
  /** 租户关联的应用 ID */
  "appIds": (string)[];
  /** 创建者用户的 ID */
  "creator": string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId"?: string;
  /** 租户来源 */
  "source": "console" | "app" | "import" | "sdk" | "tenant-console";
  /** 租户 Code */
  "code": string;
  /** 租户地址 */
  "host"?: string;
  /** 租户配置的企业域名 */
  "enterpriseDomains"?: string;
}

export interface GenAuthImportTenantDto {
  /** excel path 地址 */
  "excelUrl": string;
}

export interface GenAuthImportTenantDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthImportTenantHistoryDto {
  /** 页码 */
  "page"?: number;
  /** 每页获取的数据量 */
  "limit"?: number;
}

export interface GenAuthImportTenantHistoryDataDto {
  /** 总数 */
  "totalCount": number;
  /** 记录条数 */
  "list": (unknown)[];
}

export interface GenAuthImportTenantNotifyUserDto {
  /** 导入记录 id */
  "importId"?: string;
  /** 页码 */
  "page"?: number;
  /** 每页获取的数据量 */
  "limit"?: number;
}

export interface GenAuthImportTenantNotifyUseDataDto {
  /** 总数 */
  "totalCount": number;
  /** 记录条数 */
  "list": (unknown)[];
}

export interface GenAuthSendManyTenantEmailDto {
  /** 需要邮件通知的管理员 */
  "users": (string)[];
  /** 导入 id */
  "importId": number;
  /** 管理员名 */
  "adminName"?: string;
}

export interface GenAuthSendManyTenantSmsDto {
  /** 需要短信通知的管理员 */
  "users": (string)[];
  /** 导入 id */
  "importId": number;
  /** 管理员名 */
  "adminName"?: string;
}

export interface GenAuthSendSmsBatchDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthListTenantAdminDto {
  /** 租户 ID */
  "tenantId"?: string;
  /** 搜索关键字 */
  "keywords"?: string;
  /** 页码 */
  "page"?: number;
  /** 每页获取的数据量 */
  "limit"?: number;
}

export interface GenAuthGenerateInviteTenantUserLink {
  /** 应用 ID */
  "appId": string;
  /** 租户 ID */
  "tenantId"?: string;
  /** 要邀请的用户邮箱 */
  "emails"?: (string)[];
  /** 链接有效期 */
  "validityTerm": string;
}

export interface GenAuthInviteTenantUsersDto {
  /** 错误的邮箱提示 */
  "errMsgs"?: (GenAutherrorEmailMsg)[];
  /** 邀请用户信息返回值 */
  "list"?: (GenAuthInviteTenantUserRecord)[];
}

export interface GenAuthGetInviteTenantUserRecords {
  /** 搜索关键字 */
  "keywords"?: string;
  /** 页码 */
  "page"?: number;
  /** 每页获取的数据量 */
  "limit"?: number;
}

export interface GenAuthInviteTenantUserRecordListDto {
  /** 记录总数 */
  "totalCount"?: number;
  /** 邀请用户历史记录 */
  "list": (GenAuthInviteTenantUserRecord)[];
}

export interface GenAuthListMultipleTenantAdminDto {
  /** 搜索关键字 */
  "keywords"?: string;
  /** 页码 */
  "page"?: number;
  /** 每页获取的数据量 */
  "limit"?: number;
}

export interface GenAuthMultipleTenantAdminListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthMultipleTenantAdminDto)[];
}

export interface GenAuthCreateMultipleTenantAdminDto {
  /** 用户 ID */
  "userId": string;
  /** 租户 ID */
  "tenantIds": (string)[];
  /** 是否授权 */
  "apiAuthorized"?: boolean;
  /** SMS 通知 */
  "sendPhoneNotification"?: boolean;
  /** Email 通知 */
  "sendEmailNotification"?: boolean;
}

export interface GenAuthGetMultipleTenantAdminDto {
  /** 用户 ID */
  "userId": string;
}

export interface GenAuthUpdateMultipleTenantAdminDto {
  /** 租户 ID */
  "tenantIds": (string)[];
  /** 是否授权 */
  "apiAuthorized"?: boolean;
}

export interface GenAuthDeleteMultipleTenantAdminDto {
  /** 用户 ID（请使用 body 中的 userId） */
  "userId"?: string;
}

export interface GenAuthDeleteMultipleTenantAdminBodyDto {
  /** 用户 ID */
  "userId"?: string;
}

export interface GenAuthListTenantCooperatorDto {
  /** 搜索关键字 */
  "keywords"?: string;
  /** 是否外部 */
  "external"?: boolean;
  /** 页码 */
  "page"?: number;
  /** 每页获取的数据量 */
  "limit"?: number;
}

export interface GenAuthTenantCooperatorListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthTenantCooperatorDto)[];
}

export interface GenAuthGetTenantCooperatorDto {
  /** 用户 ID */
  "userId": string;
}

export interface GenAuthTenantCooperatorSingleDto {
  /** 菜单 */
  "list": (GenAuthMenuBase)[];
  /** 策略 */
  "authorizedPoliciesCode": (string)[];
}

export interface GenAuthCreateTenantCooperatorDto {
  /** 用户 ID */
  "userId": string;
  /** 是否授权 API */
  "apiAuthorized"?: boolean;
  /** 策略 */
  "policies": (string)[];
  /** SMS 通知 */
  "sendPhoneNotification"?: boolean;
  /** Email 通知 */
  "sendEmailNotification"?: boolean;
}

export interface GenAuthUpdateTenantCooperatorDto {
  /** 是否授权 API */
  "apiAuthorized": boolean;
  /** 策略 */
  "policies": (string)[];
}

export interface GenAuthDeleteTenantCooperatorDto {
  /** 用户 ID（请使用 body 中的 userId） */
  "userId"?: string;
}

export interface GenAuthDeleteTenantCooperatorBodyDto {
  /** 用户 ID */
  "userId"?: string;
}

export interface GenAuthGetTenantByCodeDto {
  /** 租户 Code */
  "code": string;
}

export interface GenAuthCreateTenantEnterpriseCertificationBodyDto {
  /** 企业名称 */
  "businessName": string;
  /** 营业执照 */
  "businessLicense": string;
  /** 工商登记名称 */
  "businessRegistrationName": string;
  /** 统一社会信用代码 */
  "unifiedSocialCredit": string;
  /** 法定代表人姓名 */
  "legalRepresentativeName": string;
  /** 身份证号 */
  "nationalIdentificationNumber": string;
  /** 个人银行卡号 */
  "personalBankCardNumber": string;
  /** 银行预留手机号 */
  "bankReservedPhone": string;
  /** 租户 ID */
  "tenantId": string;
}

export interface GenAuthReviewTenantEnterpriseCertificationBodyDto {
  /** 租户 id */
  "tenantId": string;
  /** 审核结果 */
  "enterpriseCertificationStatus": -1 | 0 | 1 | 2;
  /** 审核原因 */
  "reviewReason"?: string;
}

export interface GenAuthListUsersRequestDto {
  /** 模糊搜索关键字 */
  "keywords"?: string;
  /** 高级搜索 */
  "advancedFilter"?: (GenAuthListUsersAdvancedFilterItemDto)[];
  /** 使用 ES 查询语句执行搜索命令 */
  "searchQuery"?: Record<string, unknown>;
  /** 可选项 */
  "options"?: GenAuthListUsersOptionsDto;
}

export interface GenAuthGetUserDto {
  /** 用户 ID */
  "userId"?: string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 是否拍平扩展字段 */
  "flatCustomData"?: boolean;
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  "withTenantIds"?: boolean;
  "phone"?: string;
  "email"?: string;
  "username"?: string;
  "externalId"?: string;
}

export interface GenAuthUserDto {
  "userId": string;
  "createdAt": string;
  "updatedAt": string;
  "status": "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  "workStatus": "Closed" | "Active";
  "externalId"?: string;
  "email"?: string;
  "phone"?: string;
  "phoneCountryCode"?: string;
  "username"?: string;
  "name"?: string;
  "nickname"?: string;
  "photo"?: string;
  "loginsCount"?: number;
  "lastLogin"?: string;
  "lastIp"?: string;
  "gender"?: "M" | "F" | "U";
  "emailVerified"?: boolean;
  "phoneVerified"?: boolean;
  "passwordLastSetAt"?: string;
  "birthdate"?: string;
  "country"?: string;
  "province"?: string;
  "city"?: string;
  "address"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  "company"?: string;
  "browser"?: string;
  "device"?: string;
  "givenName"?: string;
  "familyName"?: string;
  "middleName"?: string;
  "profile"?: string;
  "preferredUsername"?: string;
  "website"?: string;
  "zoneinfo"?: string;
  "locale"?: string;
  "formatted"?: string;
  "region"?: string;
  "userSourceType"?: "excel" | "register" | "adminCreated" | "sync";
  "userSourceId"?: string;
  "lastLoginApp"?: string;
  "mainDepartmentId"?: string;
  "lastMfaTime"?: string;
  "passwordSecurityLevel"?: number;
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: boolean;
  /** 注册方式 */
  "registerSource"?: (string)[];
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: (string)[];
  /** 外部身份源 */
  "identities"?: (GenAuthIdentityDto)[];
  "identityNumber"?: string;
  /** 用户的扩展字段数据 */
  "customData"?: Record<string, unknown>;
  /** 用户的数据对象扩展字段数据 */
  "metadataSource"?: Record<string, unknown>;
  /** 用户关联的部门 Id */
  "postIdList"?: (string)[];
  /** 用户状态上次修改时间 */
  "statusChangedAt"?: string;
  "tenantId"?: string;
  "tenantIds"?: string;
  "signedUp"?: string;
}

export interface GenAuthGetUserBatchDto {
  /** 用户 ID 数组(单次不能超过 50 个) */
  "userIds": (string)[];
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  "withCustomData"?: boolean;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  "withTenantIds"?: boolean;
}

export interface GenAuthUserFieldDecryptReqDto {
  /** 私钥，通过控制台安全设置-数据安全-数据加密获取 */
  "privateKey": string;
  /** 用户需要解密的属性列表 */
  "data": (GenAuthUserFieldDecryptReqItemDto)[];
}

export interface GenAuthUserFieldDecryptRespItemDto {
  /** 用户唯一标志，可以是用户 ID、用户名、邮箱、手机号、外部 ID、在外部身份源的 ID。 */
  "userId": string;
  /** 字段的key名称，例如 username/phone */
  "fieldName": string;
  /** 字段解密后的内容 */
  "decryptedContent": string;
}

export interface GenAuthCreateUserReqDto {
  /** 可选参数 */
  "options"?: GenAuthCreateUserOptionsDto;
  /** 账户当前状态 */
  "status"?: "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  "email"?: string;
  "phone"?: string;
  "phoneCountryCode"?: string;
  "username"?: string;
  "externalId"?: string;
  "name"?: string;
  "nickname"?: string;
  "photo"?: string;
  /** 性别 */
  "gender"?: "M" | "F" | "U";
  /** 邮箱是否验证 */
  "emailVerified"?: boolean;
  /** 手机号是否验证 */
  "phoneVerified"?: boolean;
  "birthdate"?: string;
  "country"?: string;
  "province"?: string;
  "city"?: string;
  "address"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  "company"?: string;
  "browser"?: string;
  "device"?: string;
  "givenName"?: string;
  "familyName"?: string;
  "middleName"?: string;
  "profile"?: string;
  "preferredUsername"?: string;
  "website"?: string;
  "zoneinfo"?: string;
  "locale"?: string;
  "formatted"?: string;
  "region"?: string;
  "password"?: string;
  "salt"?: string;
  /** 租户 ID */
  "tenantIds"?: (string)[];
  /** 用户的 OTP 验证器 */
  "otp"?: GenAuthCreateUserOtpDto;
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: (string)[];
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
  /** 数据对象数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "metadataSource"?: unknown;
  /** 第三方身份源（建议调用绑定接口进行绑定） */
  "identities"?: (GenAuthCreateIdentityDto)[];
  "identityNumber"?: string;
}

export interface GenAuthCreateUserBatchReqDto {
  /** 用户列表 */
  "list": (GenAuthCreateUserInfoDto)[];
  /** 可选参数 */
  "options"?: GenAuthCreateUserOptionsDto;
}

export interface GenAuthUpdateUserReqDto {
  /** 可选参数 */
  "options"?: GenAuthUpdateUserOptionsDto;
  "userId": string;
  "phoneCountryCode"?: string;
  "name"?: string;
  "nickname"?: string;
  "photo"?: string;
  "externalId"?: string;
  /** 账户当前状态 */
  "status"?: "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱是否验证 */
  "emailVerified"?: boolean;
  /** 手机号是否验证 */
  "phoneVerified"?: boolean;
  "birthdate"?: string;
  "country"?: string;
  "province"?: string;
  "city"?: string;
  "address"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  /** 性别 */
  "gender"?: "M" | "F" | "U";
  "username"?: string;
  "email"?: string;
  "phone"?: string;
  "password"?: string;
  "company"?: string;
  "browser"?: string;
  "device"?: string;
  "givenName"?: string;
  "familyName"?: string;
  "middleName"?: string;
  "profile"?: string;
  "preferredUsername"?: string;
  "website"?: string;
  "zoneinfo"?: string;
  "locale"?: string;
  "formatted"?: string;
  "region"?: string;
  "identityNumber"?: string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
  /** 数据对象数据，传入的对象中的 key 必须先在用户数据对象相关自定义字段 */
  "metadata"?: Record<string, unknown>;
}

export interface GenAuthUpdateUserBatchReqDto {
  /** 用户列表 */
  "list": (GenAuthUpdateUserInfoDto)[];
  /** 可选参数 */
  "options"?: GenAuthUpdateUserBatchOptionsDto;
}

export interface GenAuthDeleteUsersBatchDto {
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 可选参数 */
  "options"?: GenAuthDeleteUsersBatchOptionsDto;
}

export interface GenAuthGetUserIdentitiesDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthIdentityDto {
  /** 身份源 ID */
  "identityId": string;
  /** 身份源连接 ID */
  "extIdpId": string;
  /** 外部身份源类型： - `wechat`: 微信 - `qq`: QQ - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `weibo`: 微博 - `github`: GitHub - `alipay`: 支付宝 - `baidu`: 百度 - `lark`: 飞书 - `welink`: Welink - `yidun`: 网易易盾 - `qingcloud`: 青云 - `google`: Google - `gitlab`: GitLab - `gitee`: Gitee - `twitter`: Twitter - `facebook`: Facebook - `slack`: Slack - `linkedin`: Linkedin - `instagram`: Instagram - `oidc`: OIDC 型企业身份源 - `oauth2`: OAuth2 型企业身份源 - `saml`: SAML 型企业身份源 - `ldap`: LDAP 型企业身份源 - `ad`: AD 型企业身份源 - `cas`: CAS 型企业身份源 - `azure-ad`: Azure AD 型企业身份源      */
  "provider": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark";
  /** Identity 类型，如 unionid, openid, primary */
  "type": string;
  /** 在外部身份源中的 ID */
  "userIdInIdp": string;
  /** 用户在 idp 中的身份信息 */
  "userInfoInIdp": Record<string, unknown>;
  /** 在外部身份源中的 Access Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "accessToken": string;
  /** 在外部身份源中的 Refresh Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "refreshToken": string;
  /** 身份来自的身份源连接 ID 列表 */
  "originConnIds": (string)[];
}

export interface GenAuthGetUserRolesDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  "namespace"?: string;
}

export interface GenAuthGetUserPrincipalAuthenticationInfoDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthPrincipalAuthenticationInfoPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthPrincipalAuthenticationInfoDto)[];
}

export interface GenAuthResetUserPrincipalAuthenticationInfoDto {
  "userId": string;
  /** 可选参数 */
  "options"?: GenAuthResetUserPrincipalAuthenticationInfoOptionsDto;
}

export interface GenAuthGetUserDepartmentsDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  "page"?: number;
  "limit"?: number;
  "withCustomData"?: boolean;
  "withDepartmentPaths"?: boolean;
  /** 排序依据，如 部门创建时间、加入部门时间、部门名称、部门标志符 */
  "sortBy"?: "DepartmentCreatedAt" | "JoinDepartmentAt" | "DepartmentName" | "DepartmemtCode";
  /** 增序或降序 */
  "orderBy"?: "Asc" | "Desc";
}

export interface GenAuthUserDepartmentPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthUserDepartmentRespDto)[];
}

export interface GenAuthSetUserDepartmentsDto {
  "userId": string;
  /** 部门信息 */
  "departments": (GenAuthSetUserDepartmentDto)[];
  /** 可选参数 */
  "options"?: GenAuthSetUserDepartmentsOptionsDto;
}

export interface GenAuthGetUserGroupsDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthGetUserMfaInfoDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthUserMfaRespDto {
  /** 是否绑定了 TOTP，可选值 enabled, disabled */
  "totpStatus": "enabled" | "disabled";
  /** 是否绑定了人脸 MFA，可选值 enabled, disabled */
  "faceMfaStatus": "enabled" | "disabled";
  /** 是否绑定了 SMS MFA，可选值 enabled, disabled */
  "smsMfaStatus": "enabled" | "disabled";
  /** 是否绑定了 EMAIL MFA，可选值 enabled, disabled */
  "emailMfaStatus": "enabled" | "disabled";
}

export interface GenAuthListArchivedUsersDto {
  "page"?: number;
  "limit"?: number;
  /** 开始时间，为精确到秒的 UNIX 时间戳，默认不指定 */
  "startAt"?: number;
}

export interface GenAuthArchivedUsersListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthListArchivedUsersRespDto)[];
}

export interface GenAuthKickUsersDto {
  /** 用户 ID */
  "userId": string;
  /** APP ID 列表 */
  "appIds"?: (string)[];
  /** 可选参数 */
  "options"?: GenAuthKickUsersOptionsDto;
}

export interface GenAuthIsUserExistsReqDto {
  "username"?: string;
  "email"?: string;
  "phone"?: string;
  "externalId"?: string;
}

export interface GenAuthIsUserExistsDto {
  /** 用户是否存在 */
  "exists": boolean;
}

export interface GenAuthGetUserAccessibleAppsReqDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthAppDto {
  "appId": string;
  "appName": string;
  "appLogo": string;
  "appLoginUrl": string;
  "appDefaultLoginStrategy": string;
}

export interface GenAuthHasAnyRoleReqDto {
  "userId": string;
  /** 角色列表 */
  "roles": (GenAuthHasRoleRolesDto)[];
  /** 可选参数 */
  "options"?: GenAuthHasAnyRoleOptionsDto;
}

export interface GenAuthHasAnyRoleDto {
  /** 是否拥有其中某一个角色 */
  "hasAnyRole": boolean;
}

export interface GenAuthGetUserLoginHistoryDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 应用 ID */
  "appId": string;
  /** 客户端 IP */
  "clientIp"?: string;
  /** 开始时间戳（毫秒） */
  "start"?: number;
  /** 结束时间戳（毫秒） */
  "end": number;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthUserLoginHistoryPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthUserLoginHistoryDto)[];
}

export interface GenAuthGetUserLoggedInAppsReqDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthUserLoggedInAppsDto {
  "appId": string;
  "appName": string;
  "appLogo": string;
  "appLoginUrl": string;
}

export interface GenAuthGetUserLoggedInIdentitiesReqDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthUserLoggedInIdentitiesDto {
  /** Identity ID */
  "identityId": string;
  /** 身份源名称 */
  "idpName": string;
  /** Identity provider name */
  "idpNameEn": string;
  /** 身份源 logo */
  "idpLogo": string;
  /** 身份源 id */
  "idpId": string;
}

export interface GenAuthResignUserReqDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthResignUserDataDto {
  /** 操作是否成功 */
  "success": boolean;
}

export interface GenAuthResignUserBatchReqDto {
  "userIds": (string)[];
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthGetUserAuthorizedResourcesDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  "namespace"?: string;
  /** 资源类型，如 数据、API、菜单、按钮 */
  "resourceType"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthCheckSessionStatusDto {
  "userId": string;
  "appId": string;
}

export interface GenAuthCheckSessionStatusDataDto {
  /** 是否具有登录态 */
  "active": boolean;
}

export interface GenAuthImportOtpReqDto {
  /** 参数列表 */
  "list": (GenAuthImportOtpItemDto)[];
}

export interface GenAuthListUsersLagacyDto {
  "page"?: number;
  "limit"?: number;
  /** 账户当前状态，如 已停用、已离职、正常状态、已归档 */
  "status"?: "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 用户创建、修改开始时间，为精确到秒的 UNIX 时间戳；支持获取从某一段时间之后的增量数据 */
  "updatedAtStart"?: number;
  /** 用户创建、修改终止时间，为精确到秒的 UNIX 时间戳；支持获取某一段时间内的增量数据。默认为当前时间 */
  "updatedAtEnd"?: number;
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  "withUserPasswordExpireTime"?: boolean;
}

export interface GenAuthGetOtpSecretDto {
  /** 用户 ID */
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthOtpSecretRespDto {
  /** MFA OTP 秘钥 */
  "secret": string;
}

export interface GenAuthGetUserPasswordCiphertextDto {
  /** 用户 ID */
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthGetUserPasswordCiphertextDataDto {
  /** 用户密码加密的密文 */
  "ciphertext": string;
}

export interface GenAuthLinkIdentityDto {
  "identifier": string;
  /** 必传，身份源 ID，用于指定该身份属于哪个身份源。 */
  "extIdpId": string;
  /** 必传，进行绑定操作的 Authing 用户 ID。 */
  "userId": string;
  /** 非必传，表示该条身份的具体类型，可从用户身份信息的 type 字段中获取。如果不传，默认为 generic */
  "type"?: string;
  /** 必传，用户在该外部身份源的唯一标识，需要从外部身份源的认证返回值中获取。 */
  "userIdInIdp": string;
  /** 可选，用户在该外部身份源的用户信息。 */
  "userInfoInIdp"?: Record<string, unknown>;
  /** 已废弃，可任意传入，未来将移除该字段。 */
  "isSocial"?: unknown;
}

export interface GenAuthLinkIdentityDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthUnlinkIdentity {
  "identifier"?: string;
  /** 必传，身份源 ID，用于指定该身份属于哪个身份源。 */
  "extIdpId": string;
  /** 必传，进行绑定操作的 Authing 用户 ID。 */
  "userId": string;
  /** 非必传，表示该条身份的具体类型，可从用户身份信息的 type 字段中获取。如果不传，默认为 generic */
  "type"?: string;
  /** 已废弃，可任意传入，未来将移除该字段。 */
  "isSocial"?: unknown;
}

export interface GenAuthUnlinkIdentityDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthSetMfaStatusDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** MFA Factor 列表 */
  "mfaTriggerData": GenAuthGetMfaInfoDataDto;
}

export interface GenAuthGetMfaStatusDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthGetUserSyncRelationsDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthDeleteUserSyncRelationReqDto {
  /** 用户 ID */
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 外部身份源类型，如： - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `lark`: 飞书 - `welink`: Welink - `ldap`: LDAP - `active-directory`: Windows AD - `italent`: 北森 - `xiaoshouyi`: 销售易 - `maycur`: 每刻报销 - `scim`: SCIM - `moka`: Moka HR      */
  "provider": string;
}

export interface GenAuthGetUserEncryptPasswordBatchDto {
  /** 用户 ID 数组 */
  "userIds": (string)[];
}

export interface GenAuthGetUserEncryptPasswordBatchDataDto {
  /** 用户 id */
  "userId": string;
  /** 用户密文密码 */
  "encryptedPassword": string;
}

export interface GenAuthSendUserResetPasswordRequestDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 过期时间，单位是分钟 */
  "expiredTime"?: number;
}

export interface GenAuthSendUserResetPasswordDto {
  /** 重置密码的 token */
  "passwordResetToken": string;
  /** token 过期时间 */
  "tokenExpiresIn": number;
}

export interface GenAuthSetUserMfaBindSmsEmailDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** mfa 类型,枚举类型 */
  "mfaType": "sms" | "email";
  /** 用户 mfa 绑定手机号，当 mfaType 为 sms 时必填 */
  "phone"?: string;
  /** 用户 mfa 绑定手机号的国家码，当 mfaType 为 sms 时，国内用户选填 */
  "phoneCountryCode"?: string;
  /** 用户 mfa 绑定邮箱，当 mfaType 为 email 时必填 */
  "email"?: string;
}

export interface GenAuthSendUserResetPasswordEmailLinkBatchReqDto {
  /** 用户列表 */
  "users": (GenAuthSendUserResetPasswordEmailLinkDto)[];
}

export interface GenAuthSendUserResetPasswordEmailLinkBatchDto {
  /** 用户ID */
  "userId": string;
  /** 是否成功 */
  "success": boolean;
  /** 错误信息 */
  "error"?: string;
}

export interface GenAuthCreateWebhookDto {
  /** Webhook 名称 */
  "name": string;
  /** Webhook 回调地址 */
  "url": string;
  /** 事件 */
  "events": ("test" | "register" | "login" | "logout" | "mfa:verified" | "kick" | "user:created" | "user:password-changed" | "user:updated" | "user:email-verified" | "user:archived" | "user:unarchived" | "user:blocked" | "user:unblocked" | "user:deleted" | "user:register-whitelist-added" | "user:register-whitelist-deleted" | "user:udv-changed" | "user:link-account" | "user:password-update-remind" | "user:organization-node-update" | "permission:revoke" | "permission:add" | "resource:created" | "resource:delete" | "resource:updated" | "role:created" | "role:updated" | "role:deleted" | "role:disable" | "role:assigned" | "subject:remove" | "role:unassigned" | "role:udv-changed" | "application:mfa:enabled" | "application:mfa:disabled" | "group:created" | "group:updated" | "group:deleted" | "group:member-added" | "group:member-removed" | "organization:created" | "organization:imported" | "organization:deleted" | "organization:node-added" | "organization:node-updated" | "organization:tree-updated" | "organization:node-deleted" | "organization:node-moved" | "organization:member-added" | "organization:member-removed" | "organization:udv-changed" | "privilege-namespace:created" | "privilege-namespace:updated" | "privilege-namespace:deleted" | "user-pool:cooperator-added" | "user-pool:cooperator-removed" | "user-pool:secret-refreshed" | "user-pool:updated" | "user-pool:udf-added" | "user-pool:udf-deleted" | "user-pool:env-added" | "user-pool:env-deleted" | "user-pool:env-updated" | "user-pool:launchpad-app-installed" | "user-pool:launchpad-app-uninstalled" | "application:created" | "application:updated" | "application:deleted" | "application:secret-refreshed" | "data-resource:created" | "data-resource:updated" | "data-resource:deleted" | "data-strategy-permission:revoke" | "data-strategy-permission:add" | "unusual-location:login" | "refresh-token" | "m2m-token-generated" | "sms-verification-code:sent")[];
  /** 请求数据格式 */
  "contentType": "application/json" | "application/x-www-form-urlencoded";
  /** 是否启用 */
  "enabled"?: boolean;
  /** 请求密钥 */
  "secret"?: string;
  /** 失败重试配置 */
  "retryConfig"?: GenAuthWebhookRetryConfigV3Dto;
}

export interface GenAuthWebhookDto {
  /** Webhook ID */
  "webhookId": string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** Webhook 名称 */
  "name": string;
  /** Webhook 回调地址 */
  "url": string;
  /** 请求数据格式 */
  "contentType": "application/json" | "application/x-www-form-urlencoded";
  /** 是否启用 */
  "enabled": boolean;
  /** 用户真实名称，不具备唯一性。 示例值: 张三 */
  "events"?: ("test" | "register" | "login" | "logout" | "mfa:verified" | "kick" | "user:created" | "user:password-changed" | "user:updated" | "user:email-verified" | "user:archived" | "user:unarchived" | "user:blocked" | "user:unblocked" | "user:deleted" | "user:register-whitelist-added" | "user:register-whitelist-deleted" | "user:udv-changed" | "user:link-account" | "user:password-update-remind" | "user:organization-node-update" | "permission:revoke" | "permission:add" | "resource:created" | "resource:delete" | "resource:updated" | "role:created" | "role:updated" | "role:deleted" | "role:disable" | "role:assigned" | "subject:remove" | "role:unassigned" | "role:udv-changed" | "application:mfa:enabled" | "application:mfa:disabled" | "group:created" | "group:updated" | "group:deleted" | "group:member-added" | "group:member-removed" | "organization:created" | "organization:imported" | "organization:deleted" | "organization:node-added" | "organization:node-updated" | "organization:tree-updated" | "organization:node-deleted" | "organization:node-moved" | "organization:member-added" | "organization:member-removed" | "organization:udv-changed" | "privilege-namespace:created" | "privilege-namespace:updated" | "privilege-namespace:deleted" | "user-pool:cooperator-added" | "user-pool:cooperator-removed" | "user-pool:secret-refreshed" | "user-pool:updated" | "user-pool:udf-added" | "user-pool:udf-deleted" | "user-pool:env-added" | "user-pool:env-deleted" | "user-pool:env-updated" | "user-pool:launchpad-app-installed" | "user-pool:launchpad-app-uninstalled" | "application:created" | "application:updated" | "application:deleted" | "application:secret-refreshed" | "data-resource:created" | "data-resource:updated" | "data-resource:deleted" | "data-strategy-permission:revoke" | "data-strategy-permission:add" | "unusual-location:login" | "refresh-token" | "m2m-token-generated" | "sms-verification-code:sent")[];
  /** 请求密钥 */
  "secret"?: string;
  /** 失败重试配置 */
  "retryConfig"?: GenAuthWebhookRetryConfigV3Dto;
}

export interface GenAuthListWebhooksDto {
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthGetWebhooksData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthWebhookDto)[];
}

export interface GenAuthUpdateWebhookDto {
  /** Webhook ID */
  "webhookId": string;
  /** Webhook 名称 */
  "name"?: string;
  /** Webhook 回调地址 */
  "url"?: string;
  /** 事件 */
  "events"?: ("test" | "register" | "login" | "logout" | "mfa:verified" | "kick" | "user:created" | "user:password-changed" | "user:updated" | "user:email-verified" | "user:archived" | "user:unarchived" | "user:blocked" | "user:unblocked" | "user:deleted" | "user:register-whitelist-added" | "user:register-whitelist-deleted" | "user:udv-changed" | "user:link-account" | "user:password-update-remind" | "user:organization-node-update" | "permission:revoke" | "permission:add" | "resource:created" | "resource:delete" | "resource:updated" | "role:created" | "role:updated" | "role:deleted" | "role:disable" | "role:assigned" | "subject:remove" | "role:unassigned" | "role:udv-changed" | "application:mfa:enabled" | "application:mfa:disabled" | "group:created" | "group:updated" | "group:deleted" | "group:member-added" | "group:member-removed" | "organization:created" | "organization:imported" | "organization:deleted" | "organization:node-added" | "organization:node-updated" | "organization:tree-updated" | "organization:node-deleted" | "organization:node-moved" | "organization:member-added" | "organization:member-removed" | "organization:udv-changed" | "privilege-namespace:created" | "privilege-namespace:updated" | "privilege-namespace:deleted" | "user-pool:cooperator-added" | "user-pool:cooperator-removed" | "user-pool:secret-refreshed" | "user-pool:updated" | "user-pool:udf-added" | "user-pool:udf-deleted" | "user-pool:env-added" | "user-pool:env-deleted" | "user-pool:env-updated" | "user-pool:launchpad-app-installed" | "user-pool:launchpad-app-uninstalled" | "application:created" | "application:updated" | "application:deleted" | "application:secret-refreshed" | "data-resource:created" | "data-resource:updated" | "data-resource:deleted" | "data-strategy-permission:revoke" | "data-strategy-permission:add" | "unusual-location:login" | "refresh-token" | "m2m-token-generated" | "sms-verification-code:sent")[];
  /** 请求数据格式 */
  "contentType"?: "application/json" | "application/x-www-form-urlencoded";
  /** 是否启用 */
  "enabled"?: boolean;
  /** 请求密钥 */
  "secret"?: string;
  /** 失败重试配置 */
  "retryConfig"?: GenAuthWebhookRetryConfigV3Dto;
}

export interface GenAuthDeleteWebhookDto {
  /** webhookId 数组 */
  "webhookIds": (string)[];
}

export interface GenAuthListWebhookLogs {
  /** Webhook ID */
  "webhookId": string;
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthListWebhookLogsData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthWebhookLogDto)[];
}

export interface GenAuthTriggerWebhookDto {
  /** Webhook ID */
  "webhookId": string;
  /** 请求头 */
  "requestHeaders"?: Record<string, unknown>;
  /** 请求体 */
  "requestBody"?: Record<string, unknown>;
}

export interface GenAuthTriggerWebhookData {
  /** 原来接口返回的 response 数据 */
  "response": unknown;
}

export interface GenAuthGetWebhookDto {
  /** Webhook ID */
  "webhookId": string;
}

export interface GenAuthWebhookEventListData {
  /** 分类列表 */
  "categories": (GenAuthWebhookCategoryDto)[];
  /** 事件列表 */
  "events": (GenAuthWebhookEventDto)[];
}

export interface GenAuthAddWhitelistOfAppDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** 类型参数 */
  "list"?: (string)[];
  /** APP ID */
  "appId": string;
}

export interface GenAuthWhitelistRespDto {
  /** 数据 */
  "value": string;
  /** 创建时间 */
  "createdAt": string;
}

export interface GenAuthListWhitelistOfAppDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** APP ID */
  "appId": string;
}

export interface GenAuthDeleteWhitelistOfAppDto {
  /** APP ID */
  "appId": string;
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** 类型参数 */
  "list"?: (string)[];
}

export interface GenAuthAddWhitelistDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** 类型参数 */
  "list"?: (string)[];
}

export interface GenAuthListWhitelistDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
}

export interface GenAuthDeleteWhitelistDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** 类型参数 */
  "list"?: (string)[];
}

export interface GenAuthAuthorizeResourceItem {
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifiers": (string)[];
  /** 授权的资源列表 */
  "resources": (GenAuthResourceItemDto)[];
}

export interface GenAuthResourceAuthorizedTargetDto {
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 主体唯一标志符 */
  "targetIdentifier": string;
  /** 操作列表 */
  "actions": (string)[];
}

export interface GenAuthCreateNamespacesBatchItemDto {
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组名称 */
  "name": string;
  /** 权限分组描述信息 */
  "description"?: string;
}

export interface GenAuthNamespacesListRespDto {
  /** 权限分组 名称 */
  "name": string;
  /** 权限分组 Code */
  "code": string;
  /** 权限分组描述信息 */
  "description": string;
  /** 权限分组状态：0 -> 关闭、1 -> 开启 */
  "status": number;
}

export interface GenAuthAuthorizeDto {
  /** 策略code */
  "policies": string;
  /** 主体标识，用户和组织机构为id，角色和用户组为code */
  "targetIdentifier": string;
  /** 主体名称 */
  "targetName": string;
  /** 主体类型：USER/ROLE/GROUP/ORG */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 资源名称列表 */
  "resourceName": (string)[];
  /** 权限空间id */
  "namespaceId": number;
  /** 权限空间code */
  "namespace": string;
  /** 权限空间名称 */
  "namespaceName": string;
}

export interface GenAuthAuthorizeDto2 {
  /** 权限空间code */
  "namespace"?: string;
  /** 策略code */
  "policies"?: string;
  /** 主体标识，角色和用户组为code，其它类型为id */
  "targetIdentifier"?: string;
  /** 主体类型 */
  "targetType"?: "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
}

export interface GenAuthResourceAction {
  /** 资源操作名称 */
  "name": string;
  /** 资源操作描述 */
  "description": string;
}

export interface GenAuthCreateResourceBatchItemDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源名称 */
  "name"?: string;
  /** 资源描述 */
  "description"?: string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源定义的操作类型 */
  "actions"?: (GenAuthResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: string;
}

export interface GenAuthCommonResourceDto {
  /** 资源id */
  "id": string;
  /** 权限应用id */
  "namespaceId": number;
  /** 权限应用名称 */
  "namespaceName": string;
  "userPoolId": string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 资源唯一标志符 */
  "code": string;
  /** 资源描述 */
  "description"?: string;
  /** 资源名称 */
  "name"?: string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type"?: "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源定义的操作类型 */
  "actions"?: (GenAuthResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: string;
  "namespace"?: string;
  /** 租户应用是否关联自建应用资源 */
  "linkedToTenant"?: boolean;
}

export interface GenAuthGUMemEventConfigDto {
  /** 是否开启 GUMem 推送 */
  "enabled"?: boolean;
  /** GUMem API Key */
  "apiKey"?: string;
}

export interface GenAuthApplicationLoginConfigDto {
  /** 是否开启登录注册合并 */
  "mergeLoginAndRegisterPage": boolean;
  /** 开启的基础登录方式 */
  "enabledBasicLoginMethods": ("PHONE_CODE" | "EMAIL_CODE" | "PHONE_PASSWORD" | "EMAIL_PASSWORD" | "USERNAME_PASSWORD" | "SELF_BUILT_APP_QRCODE")[];
  /** 应用默认登录方式（不包含社会化登录和企业身份源登录） */
  "defaultLoginMethod": GenAuthApplicationDefaultLoginMethod;
  /** 开启的外部身份源连接 */
  "enabledExtIdpConns": (GenAuthApplicationEnabledExtIdpConnDto)[];
  /** 是否展示用户授权页面 */
  "showAuthorizationPage": boolean;
}

export interface GenAuthApplicationRegisterConfig {
  /** 开启的注册方式 */
  "enabledBasicRegisterMethods": ("PHONE_CODE" | "EMAIL_CODE" | "EMAIL_PASSWORD")[];
  /** 默认的注册类型     - `PASSWORD`: 密码类型，支持邮箱 + 密码进行登录     - `PASSCODE`: 验证码类型，取决于你开启的注册方式，支持手机号/邮箱 + 验证码进行登录          */
  "defaultRegisterMethod": "PASSCODE" | "PASSWORD";
}

export interface GenAuthApplicationBrandingConfig {
  /** 是否开启自定义 CSS */
  "customCSSEnabled": boolean;
  /** 自定义 CSS 内容 */
  "customCSS": string;
  /** Guard 版本： - `Advanced`: 高级版 - `Classical`: 经典版      */
  "guardVersion": "Advanced" | "Classical";
  /** 自定义加载图标，当登录框加载时会展示 */
  "customLoadingImage": string;
  /** 自定义登录页背景，示例： - 图片背景：`url(https://files.authing.co/user-contents/photos/6c6b3726-4a04-4ba7-b686-1a275f81a47a.png) center/cover` - 纯色背景：`rgba(37,49,122,1)`      */
  "customBackground": string;
  /** 是否显示切换语言按钮 */
  "showChangeLanguageButton": boolean;
  /** 默认语言: - `zh-CN`: 简体中文 - `zh-TW`: 繁体中文 - `en-US`: 英文 - `ja-JP`: 日语      */
  "defaultLanguage": "zh-CN" | "en-US" | "zh-TW" | "ja-JP";
  /** 是否显示忘记密码按钮 */
  "showForgetPasswordButton": boolean;
  /** 是否显示企业身份源登录方式 */
  "showEnterpriseConnections": boolean;
  /** 是否显示社会化登录方式 */
  "showSocialConnections": boolean;
  /** 是否展示登录注册协议 */
  "showAgreement": boolean;
  /** 展示的登录注册协议列表 */
  "agreements": (GenAuthApplicationAgreementDto)[];
}

export interface GenAuthApplicationInformationCompletionConfig {
  "extendsFieldsEnabled": boolean;
  "complateFiledsPlace": (string)[];
  "skipComplateFileds": boolean;
  "extendsFields": (GenAuthInternalExtendsField | GenAuthUserExtendsField | GenAuthUserMetadataField)[];
  "extendsFieldsI18n": Record<string, GenAuthLangObject>;
}

export interface GenAuthOIDCConfig {
  "application_type"?: "web" | "native";
  "client_id"?: string;
  "redirect_uris"?: (string)[];
  "grant_types"?: (string)[];
  "response_types"?: ("none" | "code" | "token" | "id_token token" | "id_token" | "code token" | "code id_token token" | "code id_token")[];
  "client_secret"?: string;
  "jwks_uri"?: string;
  "jwks"?: GenAuthJSONWebKeySet;
  "post_logout_redirect_uris"?: (string)[];
  "scope"?: string;
  "token_endpoint_auth_method"?: "client_secret_basic" | "client_secret_post" | "none";
  "introspection_endpoint_auth_method"?: "client_secret_basic" | "client_secret_post" | "none";
  "revocation_endpoint_auth_method"?: "client_secret_basic" | "client_secret_post" | "none";
  "frontchannel_logout_uri"?: string;
  "id_token_signed_response_alg"?: "RS256" | "HS256";
  "id_token_encrypted_response_alg"?: "ECDH-ES" | "RSA-OAEP";
  "id_token_encrypted_response_enc"?: "A128CBC-HS256" | "A128GCM" | "A256CBC-HS512" | "A256GCM";
  "web_message_uris"?: (string)[];
  "cas_expire"?: number;
  "refresh_token_expire"?: number;
  "access_token_expire"?: number;
  "id_token_expire"?: number;
  "authorization_code_expire"?: number;
  "skip_consent": boolean;
  "skip_implicit_flow_rules": boolean;
  "rotate_refresh_token"?: boolean;
  "refresh_duration_when_rotate_refresh_token"?: boolean;
  "display_prompt_page"?: boolean;
}

export interface GenAuthSamlIdpConfig {
  "enabled": boolean;
  "acs": string;
  "_acs": (GenAuthISamlACSConfig)[];
  "sloConfig"?: GenAuthISamlSLOConfig;
  "emailDomainSubstitution": string;
  "samlRequestSigningCert": string;
  "samlResponseSigningCert": string;
  "samlResponseSigningCertFingerprint": string;
  "enabledKeyInfoList": boolean;
  "samlKeyInfoList": (GenAuthSamlKeyInfoList)[];
  "wantSignedRequest": boolean;
  "samlResponseSigningKey": string;
  "nameIdentifierFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:transient" | "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent" | "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" | "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified" | "urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName" | "urn:oasis:names:tc:SAML:1.1:nameid-format:WindowsDomainQualifiedName" | "urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos" | "urn:oasis:names:tc:SAML:2.0:nameid-format:entity";
  "signResponse": boolean;
  "verifyRequest": boolean;
  "lifetimeInSeconds": number;
  "authnContextClassRef": "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport";
  "digestAlgorithm": "http://www.w3.org/2000/09/xmldsig#sha1" | "http://www.w3.org/2001/04/xmlenc#sha256" | "http://www.w3.org/2001/04/xmlenc#sha512";
  "signatureAlgorithm": "http://www.w3.org/2000/09/xmldsig#rsa-sha1" | "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" | "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
  "mappings": Record<string, string>;
  "spEntityID": string;
  "destination": string;
  "recipient": string;
  "audience": string;
  "customAttributes": (GenAuthICustomAttribute)[];
  "customAttributesValueSeparator"?: string;
  "nameID"?: string;
  "entityId": string;
}

export interface GenAuthOauthIdpConfig {
  "id": string;
  "client_secret": string;
  "redirect_uris"?: (string)[];
  "grants": (string)[];
  "access_token_lifetime"?: number;
  "refresh_token_lifetime"?: number;
  "introspection_endpoint_auth_method"?: string;
  "revocation_endpoint_auth_method"?: string;
}

export interface GenAuthCasIdPConfig {
  "allowedServices": (string)[];
  "allowedTargetServices": (string)[];
  "stLifetime": number;
  "ptLifetime": number;
  "customAttributes": Record<string, string>;
  "casUserIdentifier"?: string;
}

export interface GenAuthListApplicationSubjectDataDto {
  "appId": string;
  /** 应用 logo */
  "logo": string;
  "ext": string;
  "template": string;
  /** 应用类型：集成应用/自建应用 */
  "appType": "INTEGRATED" | "SELFBUILT" | "APP_PANEL";
  /** 允许/拒绝 */
  "effect": "ALLOW" | "DENY";
}

export interface GenAuthListApplicationAuthDataDto {
  /** 授权 id */
  "id": string;
  /** 主体 id */
  "targetId": string;
  /** 主体名称 */
  "targetName": string;
  /** 主体类型，USER/ORG/GROUP/ROLE */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 主体类型，ALLOW/DENY */
  "effect": "ALLOW" | "DENY";
  /** 授权开关 */
  "enabled": boolean;
  /** 授权类型, ALL:所有人 SUBJECT:主体 */
  "permissionType"?: "ALL" | "SUBJECT";
}

export interface GenAuthApplicationLoginConfigInputDto {
  /** 是否开启登录注册合并 */
  "mergeLoginAndRegisterPage"?: boolean;
  /** 开启的基础登录方式 */
  "enabledBasicLoginMethods"?: ("PHONE_CODE" | "EMAIL_CODE" | "PHONE_PASSWORD" | "EMAIL_PASSWORD" | "USERNAME_PASSWORD" | "SELF_BUILT_APP_QRCODE")[];
  /** 应用默认登录方式（不包含社会化登录和企业身份源登录） */
  "defaultLoginMethod"?: GenAuthApplicationDefaultLoginMethodInput;
  /** 开启的外部身份源连接 */
  "enabledExtIdpConnIds"?: (string)[];
  /** 开启所有的外部身份源连接 */
  "enabledAllExtIdpConns"?: boolean;
  /** 是否展示用户授权页面 */
  "showAuthorizationPage"?: boolean;
}

export interface GenAuthApplicationRegisterConfigInputDto {
  /** 开启的注册方式 */
  "enabledBasicRegisterMethods"?: ("PHONE_CODE" | "EMAIL_CODE" | "EMAIL_PASSWORD")[];
  /** 默认的注册类型 - `PASSWORD`: 密码类型，支持邮箱 + 密码进行登录 - `PASSCODE`: 验证码类型，取决于你开启的注册方式，支持手机号/邮箱 + 验证码进行登录          */
  "defaultRegisterMethod"?: "PASSCODE" | "PASSWORD";
}

export interface GenAuthApplicationBrandingConfigInputDto {
  /** 是否开启自定义 CSS */
  "customCSSEnabled"?: boolean;
  /** 自定义 CSS 内容 */
  "customCSS"?: string;
  /** Guard 版本： - `Advanced`: 高级版 - `Classical`: 经典版      */
  "guardVersion"?: "Advanced" | "Classical";
  /** 自定义加载图标，当登录框加载时会展示 */
  "customLoadingImage"?: string;
  /** 自定义登录页背景，示例： - 图片背景：`url(https://files.authing.co/user-contents/photos/6c6b3726-4a04-4ba7-b686-1a275f81a47a.png) center/cover` - 纯色背景：`rgba(37,49,122,1)`      */
  "customBackground"?: string;
  /** 是否显示切换语言按钮 */
  "showChangeLanguageButton"?: boolean;
  /** 展示的默认语言： - `zh-CN`: 简体中文 - `zh-TW`: 繁体中文 - `en-US`: 英文 - `ja-JP`: 日语  默认情况下，Authing 登录页会根据用户浏览器语言自动渲染。      */
  "defaultLanguage"?: "zh-CN" | "en-US" | "zh-TW" | "ja-JP";
  /** 是否显示忘记密码按钮 */
  "showForgetPasswordButton"?: boolean;
  /** 是否显示企业身份源登录方式 */
  "showEnterpriseConnections"?: boolean;
  /** 是否显示社会化登录方式 */
  "showSocialConnections"?: boolean;
}

export interface GenAuthUpdateApplicationLoginConfigInputDto {
  /** 是否开启登录注册合并 */
  "mergeLoginAndRegisterPage"?: boolean;
  /** 开启的基础登录方式 */
  "enabledBasicLoginMethods"?: ("PHONE_CODE" | "EMAIL_CODE" | "PHONE_PASSWORD" | "EMAIL_PASSWORD" | "USERNAME_PASSWORD" | "SELF_BUILT_APP_QRCODE")[];
  /** 应用默认登录方式（不包含社会化登录和企业身份源登录） */
  "defaultLoginMethod"?: GenAuthApplicationDefaultLoginMethodInput;
  /** 是否展示用户授权页面 */
  "showAuthorizationPage"?: boolean;
}

export interface GenAuthGUMemEventConfigInputDto {
  /** 是否开启 GUMem 推送 */
  "enabled"?: boolean;
  /** GUMem API Key */
  "apiKey"?: string;
}

export interface GenAuthListApplicationActiveUsersOptionsDto {
  /** 分页配置 */
  "pagination"?: GenAuthPaginationDto;
  "withCustomData"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
}

export interface GenAuthApplicationPermissionRecordItem {
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG";
  /** 权限分组 code，当主体类型为 "ROLE" 时必传 */
  "namespaceCode"?: string;
  /** 当主体类型为 "ORG" 时，授权是否被子节点继承 */
  "inheritByChildren"?: boolean;
  /** 主体标识列表，当主体类型为 "USER" 时，值应为用户 ID；当主体类型为 "GROUP" 时，值应为分组 code；当主体类型为 "ROLE" 时，值应为角色 code；当主体类型为 "ORG" 时，值应为组织节点 ID。最多 50 条。 */
  "targetIdentifier": (string)[];
  /** 授权作用，允许或拒绝 */
  "effect": "ALLOW" | "DENY";
}

export interface GenAuthDeleteApplicationPermissionRecordItem {
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG";
  /** 权限分组 code，当主体类型为 "ROLE" 时必传 */
  "namespaceCode"?: string;
  /** 主体标识列表，当主体类型为 "USER" 时，值应为用户 ID；当主体类型为 "GROUP" 时，值应为分组 code；当主体类型为 "ROLE" 时，值应为角色 code；当主体类型为 "ORG" 时，值应为组织节点 ID。最多 50 条。 */
  "targetIdentifier": (string)[];
}

export interface GenAuthTenantApplicationDto {
  "userPoolId": string;
  "tenantAppId": string;
  "name": string;
  "description": string;
  "logo": string;
  "applicationType": string;
  "ssoEnabled": boolean;
  "appId"?: string;
}

export interface GenAuthUpdateLoginConfig {
  "loginTabs"?: (string)[];
  "registerTabs"?: (string)[];
  "defaultLoginTab"?: string;
  "defaultRegisterTab"?: string;
  "autoRegisterThenLogin"?: boolean;
  "autoJoin"?: boolean;
  "enableMultipleTenantPortal"?: boolean;
  "isUserPoolAsTenant"?: boolean;
  "enableSwitchType"?: ("tenant-console" | "tenant-app" | "tenant-launpad")[];
  "tabMethodsSortConfig"?: GenAuthApplicationTabMethodsSortConfigDto;
  "qrCodeSortConfig"?: GenAuthApplicationTabMethodsSortConfigDto;
  "css"?: string;
  "cssEnabled"?: boolean;
  "customLoading"?: string;
  "enableGuardVersionSwitch"?: boolean;
  "guardVersion"?: "v1" | "v2";
  "loadingBackground"?: string;
  "ssoPageCustomizationSettings"?: GenAuthISsoPageCustomizationSettingsDto;
  "passwordTabConfig"?: GenAuthTabConfigDto;
  "verifyCodeTabConfig"?: GenAuthTabConfigDto;
  "config"?: GenAuthLanguageCoinfigDto;
  /** 是否允许创建租户 */
  "enableCreateTenant"?: boolean;
  /** 允许创建租户的场景 */
  "createTenantScenes"?: (string)[];
  /** 是否允许加入租户 */
  "enableJoinTenant"?: boolean;
  /** 允许创建加入的场景 */
  "joinTenantScenes"?: (string)[];
  /** 是否校验企业域名 */
  "enableVerifyDomain"?: boolean;
  /** 是否自动关联租户应用 */
  "enableAutoConnectTenantApp"?: unknown;
  /** 校验企业域名的场景 */
  "verifyDomainScenes"?: ("join-tenant" | "tenant-console" | "tenant-app" | "tenant-launchpad")[];
}

export interface GenAuthISsoPageCustomizationSettingsDto {
  "hideIdp": boolean;
  "hideForgetPassword": boolean;
  "autoRegisterThenLogin"?: boolean;
  "hideSocialLogin": boolean;
  "hideLoginByPhoneCode"?: boolean;
  "hideRegister"?: boolean;
  "hideUserPasswordLogin"?: boolean;
  "hideWxMpScanLogin"?: boolean;
  "hideRegisterByPhone"?: boolean;
  "hideRegisterByEmail"?: boolean;
}

export interface GenAuthApplicationMfaDto {
  /** MFA 类型 */
  "mfaPolicy": string;
  /** MFA 状态 */
  "status": number;
  /** MFA 排序 */
  "sort": number;
}

export interface GenAuthCreateAsaAccountsBatchItemDto {
  "accountInfo": Record<string, unknown>;
}

export interface GenAuthAssignAsaAccountItem {
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifiers": (string)[];
}

export interface GenAuthAsaAccountTargetDto {
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifier": string;
}

export interface GenAuthAdminAuditLogDto {
  /** 管理员的用户 ID */
  "adminUserId": string;
  /** 管理员用户头像 */
  "adminUserAvatar": string;
  /** 管理员用户显示名称，按照以下用户字段顺序进行展示：nickname > username > name > givenName > familyName -> email -> phone -> id */
  "adminUserDisplayName": string;
  /** 客户端 IP，可根据登录时的客户端 IP 进行筛选。默认不传获取所有登录 IP 的登录历史。 */
  "clientIp": string;
  /** 操作类型： - `create`: 创建 - `delete`: 删除 - `import`: 导入 - `export`: 导出 - `update`: 修改 - `refresh`: 刷新 - `sync`: 同步 - `invite`: 邀请 - `resign`: 离职 - `recover`: 恢复 - `disable`: 禁用 - `userEnable`: 启用      */
  "operationType": "all" | "create" | "delete" | "import" | "export" | "update" | "refresh" | "sync" | "invite" | "resign" | "recover" | "disable" | "enable" | "activate" | "deactivate" | "add" | "remove" | "query" | "sendInvitation" | "revertInvitation" | "approval" | "reject";
  /** 事件类型： - `user`: 用户 - `userpool`: 用户池 - `tenant`: 租户 - `userLoginState`: 用户登录态 - `userAccountState`: 用户账号状态 - `userGroup`: 用户分组 - `fieldEncryptState`: 字段加密状态 - `syncTask`: 同步任务 - `socialConnection`: 社会化身份源 - `enterpriseConnection`: 社会化身份源 - `customDatabase`: 自定义数据库 - `org`: 组织机构 - `cooperator`: 协作管理员 - `application`: 应用 - `resourceNamespace`: 权限分组 - `resource`: 资源 - `role`: 角色 - `roleAssign`: 角色授权 - `policy`: 策略      */
  "resourceType": "all" | "user" | "userpool" | "tenant" | "userLoginState" | "userAccountState" | "userGroup" | "fieldEncryptState" | "syncTask" | "socialConnection" | "enterpriseConnection" | "customDatabase" | "org" | "cooperator" | "application" | "resourceNamespace" | "resource" | "role" | "roleAssign" | "policy" | "customDomain" | "permitSpace" | "generalResource" | "generalResourceAuthorization" | "roleSubject" | "subjectOfRole" | "dataResource" | "dataPolicy" | "authorization" | "userAuthorization" | "adminPermissionRole" | "adminPermissionAdmin" | "adminPermissionPolicy" | "universalInvitation" | "policyInvitation" | "invitationRoster" | "invitationUser" | "invitationPolicy" | "applicant";
  /** 事件详情 */
  "eventDetails": string;
  /** 事件状态 */
  "eventResultCode": string;
  /** 事件信息 */
  "eventResultMsg": string;
  /** 具体的操作参数 */
  "operationParam": string;
  /** 原始值 */
  "originValue": string;
  /** 新值 */
  "targetValue": string;
  /** 是否成功 */
  "success": boolean;
  /** User Agent */
  "userAgent": string;
  /** 解析过后的 User Agent */
  "ua": GenAuthParsedUserAgent;
  /** 地理位置 */
  "geoip": GenAuthGeoIp;
  /** 时间 */
  "timestamp": string;
  /** 请求 ID */
  "requestId": string;
}

export interface GenAuthUserActionLogDto {
  /** 用户 ID */
  "userId": string;
  /** 用户头像 */
  "userAvatar": string;
  /** 用户显示名称，按照以下用户字段顺序进行展示：nickname > username > name > givenName > familyName -> email -> phone -> id */
  "userDisplayName": string;
  /** 用户登录次数 */
  "userLoginsCount": number;
  /** 应用 ID */
  "appId": string;
  /** 应用名称 */
  "appName": string;
  /** 客户端 IP，可根据登录时的客户端 IP 进行筛选。默认不传获取所有登录 IP 的登录历史。 */
  "clientIp": string;
  /** 事件类型： - `login`: 登录 - `logout`: 登出 - `register`: 注册 - `verifyMfa`: 验证 MFA - `updateUserProfile`: 修改用户信息 - `updateUserPassword`: 修改密码 - `updateUserEmail`: 修改邮箱 - `updateUserPhone`: 修改手机号 - `bindMfa`: 绑定 MFA - `bindEmail`: 绑定邮箱 - `bindPhone`: 绑定手机号 - `unbindPhone`: 解绑手机号 - `unbindEmail`: 解绑邮箱 - `unbindMFA`: 解绑 MFA - `deleteAccount`: 注销账号 - `verifyFirstLogin`: 首次登录验证       */
  "eventType": "login" | "logout" | "register" | "verifyMfa" | "updateUserPrefile" | "updateUserPassword" | "updateUserEmail" | "updateUserPhone" | "bindMfa" | "bindEmail" | "bindPhone" | "unbindPhone" | "unbindEmail" | "unbindMFA" | "refreshUserTokenBySelf" | "deleteAccount" | "verifyFirstLogin" | "securityResourceAccess";
  /** 事件详情 */
  "eventDetail": string;
  /** 事件详情 */
  "eventDetails": string;
  /** 事件状态 */
  "eventResultCode": string;
  /** 事件信息 */
  "eventResultMsg": string;
  /** 是否成功 */
  "success": boolean;
  /** 应用登录地址 */
  "appLoginUrl": string;
  /** 应用 Logo */
  "appLogo": string;
  /** User Agent */
  "userAgent": string;
  /** 解析过后的 User Agent */
  "parsedUserAgent": GenAuthParsedUserAgent;
  /** 地理位置 */
  "geoip": GenAuthGeoIp;
  /** 时间 */
  "timestamp": string;
  /** 请求 ID */
  "requestId": string;
  "operationParam": string;
  "operationMode": string;
  "operationType": string;
}

export interface GenAuthCustomFieldI18n {
  /** 支持多语言的字段 */
  "label": GenAuthLangObject;
}

export interface GenAuthCustomFieldSelectOption {
  /** 枚举值 value */
  "value": string;
  /** 枚举值 label */
  "label": string;
}

export interface GenAuthCountCustomFieldsDto {
  /** 记录总数 */
  "all": number;
  /** 计数 */
  "userVisible": number;
  /** 计数 */
  "adminVisible": number;
}

export interface GenAuthSetUserBaseFieldDto {
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
  /** 显示名称 */
  "label"?: string;
  /** 详细描述信息 */
  "description"?: string;
  /** 用户是否可编辑 */
  "userEditable"?: boolean;
  /** 是否需要在 Authing 控制台中进行显示： - 如果是用户自定义字段，控制是否在用户详情展示； - 如果是部门自定义字段，控制是否在部门详情中展示； - 如果是角色扩展字段，控制是否在角色详情中展示。      */
  "visibleInAdminConsole"?: boolean;
  /** 是否在用户个人中心展示（此参数不控制 API 接口是否返回）。 */
  "visibleInUserCenter"?: boolean;
  /** 多语言显示名称 */
  "i18n"?: GenAuthCustomFieldI18n;
}

export interface GenAuthSetCustomFieldDto {
  /** 主体类型，目前支持用户、角色、分组和部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
  /** 数据类型，**设置之后将不能进行修改**。 - `STRING`: 字符串类型 - `NUMBER`: 数字类型 - `DATETIME`: 日期类型 - `BOOLEAN`: 布尔类型 - `ENUM`: 枚举值类型      */
  "dataType": "STRING" | "NUMBER" | "DATETIME" | "BOOLEAN" | "ENUM";
  /** 显示名称 */
  "label"?: string;
  /** 详细描述信息 */
  "description"?: string;
  /** 是否加密存储。开启后，该字段的**新增数据**将被加密，此参数一旦设置不可更改。 */
  "encrypted"?: boolean;
  /** 是否为唯一字段，开启之后，当前字段上报的值将进行唯一校验。此参数只针对 */
  "isUnique"?: boolean;
  /** 用户是否可编辑 */
  "userEditable"?: boolean;
  /** 是否需要在 Authing 控制台中进行显示： - 如果是用户自定义字段，控制是否在用户详情展示； - 如果是部门自定义字段，控制是否在部门详情中展示； - 如果是角色扩展字段，控制是否在角色详情中展示。      */
  "visibleInAdminConsole"?: boolean;
  /** 是否在用户个人中心展示（此参数不控制 API 接口是否返回）。 */
  "visibleInUserCenter"?: boolean;
  /** 校验规则 */
  "validateRules"?: (GenAuthUDFvalidateValue)[];
  /** App Id 列表 */
  "appIds"?: (string)[];
  /** 脱敏 */
  "desensitization"?: boolean;
  /** 枚举值类型选择项 */
  "options"?: (GenAuthCustomFieldSelectOption)[];
  /** 多语言显示名称 */
  "i18n"?: GenAuthCustomFieldI18n;
}

export interface GenAuthDeleteCustomFieldDto {
  /** 主体类型，目前支持用户、角色、分组和部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
}

export interface GenAuthSetCustomDataDto {
  /** 租户 ID */
  "tenantId"?: string;
  /** 字段 key，不能和内置字段的 key 冲突 */
  "key": string;
  /** 自定义数据，可以为任意类型，但是必须和创建时定义的自定义字段类型匹配，否则将设置失败 */
  "value": unknown;
}

export interface GenAuthUserPermissionListDto {
  /** 数据策略授权的用户 ID */
  "userId": string;
  /** 数据策略授权的权限空间 Code */
  "namespaceCode": string;
  /** 用户在权限空间下所有的数据策略资源列表 */
  "resourceList": (GenAuthOpenResource)[];
}

export interface GenAuthAuthEnvParams {
  /** ip */
  "ip"?: string;
  /** 城市 */
  "city"?: string;
  /** 省份 */
  "province"?: string;
  /** 国家 */
  "country"?: string;
  /** 设备类型：PC/Mobile */
  "deviceType"?: "PC" | "Mobile";
  /** 操作类型：Windows、Android、iOS、MacOS */
  "systemType"?: "Windows" | "MacOS" | "Android" | "iOS";
  /** 浏览器类型：IE/Chrome/Firefox */
  "browserType"?: "IE" | "Chrome" | "Firefox" | "Safari" | "Edge" | "Opera" | "Safe360" | "QQBrowser";
  /** 请求时间 */
  "requestDate"?: string;
}

export interface GenAuthCheckPermissionsRespDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源权限操作 */
  "action": string;
  /** 资源路径 */
  "resource": string;
  /** 用户在某个权限空间下是否具有该数据资源的某个操作 */
  "enabled": boolean;
}

export interface GenAuthCheckExternalUserPermissionsRespDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源权限操作 */
  "action": string;
  /** 资源路径 */
  "resource": string;
  /** 用户在某个权限空间下是否具有该数据资源的某个操作 */
  "enabled": boolean;
}

export interface GenAuthGetUserResourcePermissionList {
  /** 权限空间 code */
  "namespaceCode": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 资源路径 */
  "resource": string;
}

export interface GenAuthListResourceTargetsDtoResp {
  /** 资源路径 */
  "resource": string;
  /** 数据资源权限操作列表 */
  "actionAuthList": (GenAuthActionAuth)[];
}

export interface GenAuthStrResourceAuthAction {
  /** 字符串数据资源的 Value */
  "value"?: string;
  /** 字符串数据资源的 actions */
  "actions"?: (string)[];
}

export interface GenAuthArrResourceAuthAction {
  /** 数组数据资源的 values */
  "values"?: (string)[];
  /** 数组数据资源的 actions */
  "actions"?: (string)[];
}

export interface GenAuthTreeResourceAuthAction {
  /** 树结构节点列表 */
  "nodeAuthActionList"?: (GenAuthTreeStructs)[];
}

export interface GenAuthStrResourceAuthAction2 {
  /** 字符串数据资源的 Value */
  "value"?: string;
  /** 字符串数据资源的 actions */
  "actions"?: (string)[];
}

export interface GenAuthArrResourceAuthAction2 {
  /** 数组数据资源的 values */
  "values"?: (string)[];
  /** 数组数据资源的 actions */
  "actions"?: (string)[];
}

export interface GenAuthTreeResourceAuthAction2 {
  /** 树结构节点列表 */
  "nodeAuthActionList"?: (GenAuthTreeStructs2)[];
}

export interface GenAuthCheckUserSameLevelPermissionRespDto {
  /** 数据资源权限操作 */
  "action": string;
  /** 树资源节点code */
  "resourceNodeCode": string;
  /** 是否拥有 action 权限 */
  "enabled": boolean;
}

export interface GenAuthM2mPermissionListDto {
  /** 数据策略授权的编程访问账号 ID */
  "accessKeyId": string;
  /** 数据策略授权的权限空间 Code */
  "namespaceCode": string;
  /** 用户在权限空间下所有的数据策略资源列表 */
  "resourceList": (GenAuthOpenResource2)[];
}

export interface GenAuthStrResourceAuthAction3 {
  /** 字符串数据资源的 Value */
  "value"?: string;
  /** 字符串数据资源的 actions */
  "actions"?: (string)[];
}

export interface GenAuthArrResourceAuthAction3 {
  /** 数组数据资源的 values */
  "values"?: (string)[];
  /** 数组数据资源的 actions */
  "actions"?: (string)[];
}

export interface GenAuthTreeResourceAuthAction3 {
  /** 树结构节点列表 */
  "nodeAuthActionList"?: (GenAuthTreeStructs3)[];
}

export interface GenAuthListPermissionViewRespDto {
  "userId": string;
  "username": string;
  /** 权限空间 id */
  "namespaceId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 权限空间名称 */
  "namespaceName": string;
  /** 数据资源 id */
  "dataResourceId": string;
  /** 数据资源 Code */
  "dataResourceCode": string;
  /** 数据资源 名称 */
  "dataResourceName": string;
  /** 数据策略列表 */
  "dataPolicyList": (GenAuthPolicyBo)[];
  /** 角色列表 */
  "roleList"?: (GenAuthRoleBo)[];
  /** 用户组列表 */
  "groupList"?: (GenAuthGroupBo)[];
  /** 组织机构列表 */
  "nodeList"?: (GenAuthNodeBo)[];
}

export interface GenAuthDataStatementPermissionDto {
  /** 数据资源权限操作：ALLOW（允许）/DENY（拒绝） */
  "effect": 0 | 1;
  /** 资源权限列表，字符串数据资源和数组数据资源，没有 path 路径 */
  "permissions": (string)[];
}

export interface GenAuthListDataPoliciesRespDto {
  "policyId": string;
  /** 主体对象列表,包含数据策略下所有的主体对象,包括 USER、GROUP、ROLE、ORG */
  "targetList": (GenAuthSubjectRespDto)[];
  /** 数据策略更新时间 */
  "updatedAt": string;
  "policyName"?: string;
  "description"?: string;
  /** 数据权限列表，每个策略下所有的数据资源 ID 和名称 */
  "resourceList": (GenAuthDataResourceSimpleRespDto)[];
}

export interface GenAuthListSimpleDataPoliciesRespDto {
  "policyId": string;
  "policyName": string;
  "description"?: string;
}

export interface GenAuthDataSubjectRespDto {
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID */
  "targetIdentifier": string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 */
  "targetType": 0 | 1 | 2 | 3 | 4;
  /** 主体名称，包含用户名称、用户组名称、角色名称、组织机构名称 */
  "targetName": string;
  /** 主体对象被授权时间 */
  "authorizationTime": string;
}

export interface GenAuthSubjectDto {
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID，编程访问账号 ID */
  "id": string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG、PROGRAMMATIC_ACCOUNT 五种类型 */
  "type": 0 | 1 | 2 | 3 | 4;
  /** 主体名称，包含用户名称、用户组名称、角色名称、组织机构名称、编程访问账号不选 */
  "name"?: string;
}

export interface GenAuthDataResourceTreeStructs {
  /** 数据资源节点 Code, 同层级唯一 */
  "code": string;
  /** 数据资源节点名称 ，同层级唯一 */
  "name": string;
  /** 数据资源节点 Value */
  "value"?: string;
  /** 数据资源节点的子节点,子节点层级最多支持五个层级 */
  "children"?: (Record<string, unknown>)[];
  /** 扩展字段值, 以 key:value 形式存储 */
  "extendFieldValue"?: Record<string, unknown>;
}

export interface GenAuthExtendField {
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
  /** 字段值类型 */
  "valueType": "STRING" | "SELECT";
  /** 描述 */
  "description"?: string;
  /** 展示名称 */
  "label": string;
  /** 字段配置，当 valueType=SELECT 时，此参数必传，否则可不传 */
  "config"?: GenAuthConfig;
}

export interface GenAuthListDataResourcesRespDto {
  "namespaceCode": string;
  "namespaceName": string;
  /** 数据资源关联授权的数量 */
  "authorizationNum": number;
  "updatedAt": string;
  "resourceName": string;
  "resourceCode": string;
  "type": "TREE" | "STRING" | "ARRAY";
  "description"?: string;
}

export interface GenAuthConfig {
  /** 选项列表 */
  "options": (GenAuthOption)[];
}

export interface GenAuthCreatePermissionNamespacesBatchItemDto {
  /** 权限空间 Code */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述 */
  "description"?: string;
}

export interface GenAuthPermissionNamespacesListRespDto {
  /** 权限空间 名称 */
  "name": string;
  /** 权限空间 Code */
  "code": string;
  /** 权限空间描述信息 */
  "description"?: string;
  /** 权限空间状态：0 -> 关闭、1 -> 开启 */
  "status"?: number;
}

export interface GenAuthPermissionNamespaceRolesListRespDto {
  /** 角色名称 */
  "name": string;
  /** 角色 Code */
  "code": string;
  /** 角色 描述信息 */
  "description": string;
  /** 权限空间 Code */
  "namespace": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthMatch {
  "conditions"?: (GenAuthObject3)[];
  "conjunction": "and" | "or";
  "groups": (GenAuthMatch)[];
}

export interface GenAuthPartDto {
  /** 部门 id */
  "id": string;
  /** 部门名称 */
  "name": string;
  /** 部门路径 */
  "namePath": (string)[];
}

export interface GenAuthExtIdpConnDto {
  /** 身份源连接 id */
  "id": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:genauth:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark:miniprogram:default";
  /** 身份源 ID */
  "extIdpId": string;
  /** 身份源连接图标 */
  "logo": string;
  /** 身份源连接标识 */
  "identifier": string;
  /** 身份源连接在登录页的显示名称 */
  "displayName": string;
}

export interface GenAuthSystemModelMetadataSourceItem {
  "fieldId": string;
  "value": string | (string)[];
  "key": string;
}

export interface GenAuthResGroupDto {
  /** 分组 ID */
  "id": string;
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description"?: string;
  /** 分组类型 */
  "type"?: "static" | "dynamic";
  /** 分组元数据信息 */
  "metadataSource"?: (GenAuthSystemModelMetadataSourceItem)[];
  /** 成员列表 */
  "members"?: (unknown)[];
}

export interface GenAuthPolicyCondition {
  /** Condition Param */
  "param": "UserPoolId" | "AppId" | "RequestFrom" | "UserId" | "UserArn" | "CurrentTime" | "EpochTime" | "SourceIp" | "User" | "MultiFactorAuthPresent" | "MultiFactorAuthAge" | "UserAgent" | "Referer" | "Device" | "OS" | "Country" | "Province" | "City" | "DeviceChanged" | "DeviceUntrusted" | "ProxyUntrusted" | "LoggedInApps" | "Namespace";
  /** Condition Operator */
  "operator": "Bool" | "DateEquals" | "DateNotEquals" | "DateLessThan" | "DateLessThanEquals" | "DateGreaterThan" | "DateGreaterThanEquals" | "IpAddress" | "NotIpAddress" | "NumericEquals" | "NumericNotEquals" | "NumericLessThan" | "NumericLessThanEquals" | "NumericGreaterThan" | "NumericGreaterThanEquals" | "StringEquals" | "StringNotEquals" | "StringEqualsIgnoreCase" | "StringNotEqualsIgnoreCase" | "StringLike" | "StringNotLike" | "ListContains";
  /** Condition Value */
  "value": string;
}

export interface GenAuthDepartmentI18nDto {
  /** 支持多语言的字段 */
  "name": GenAuthLangObject;
}

export interface GenAuthPostDto {
  /** 岗位 ID */
  "id"?: string;
  /** 岗位 code */
  "code": string;
  /** 岗位名称 */
  "name": string;
  /** 岗位描述 */
  "description"?: string;
}

export interface GenAuthSearchDepartmentsFilterItemDto {
  /** 高级搜索指定的部门字段： - `updatedAt`: 更新时间，高级搜索请用时间戳 - `createdAt`: 创建时间，高级搜索请用时间戳 - `name`: 部门名称  */
  "field": string;
  /** 运算符，可选值为： - `EQUAL`: 全等，适用于数字和字符串的全等匹配 - `IN`: 为某个数组中的元素 - `GREATER`: 大于或等于，适用于数字、日期类型数据的比较 - `LESSER`: 小于或等于，适用于数字、日期类型数据的比较 - `BETWEEN`: 介于什么什么之间，适用于数字、日期类型数据的比较 - `CONTAINS`: 字符串包含      */
  "operator": "BETWEEN" | "EQUAL" | "IN" | "LESSER" | "GREATER" | "CONTAINS";
  /** 搜索值，不同的 `field` 对应的 `value` 类型可能不一样 */
  "value": unknown;
}

export interface GenAuthDepartmentSortingDto {
  /** 进行排序的字段，可选值为： - `updatedAt`: 创建时间 - `createdAt`: 修改时间 - `name`: 邮箱  */
  "field": "updatedAt" | "createdAt" | "name";
  /** 排序顺序： - `desc`: 按照从大到小降序。 - `asc`: 按照从小到大升序。      */
  "order": "desc" | "asc";
}

export interface GenAuthUserInfoDto {
  "username"?: string;
  "email"?: string;
  "phone"?: string;
  "phoneCountryCode"?: string;
  "name"?: string;
  /** 性别 */
  "gender"?: "M" | "F" | "U";
  "country"?: string;
  "province"?: string;
  "city"?: string;
  "password"?: string;
}

export interface GenAuthDeepPartial {
  "id"?: number;
  "createdAt"?: string | GenAuthDeepPartial2;
  "updatedAt"?: string | GenAuthDeepPartial2;
  "userPoolId"?: string;
  "providerType"?: "lark" | "wechatwork" | "dingtalk" | "active-directory" | "italent";
  "orgId"?: string;
  "nodeId"?: string;
  "thirdPartyDepartmentId"?: string;
  "thirdPartyParentDepartmentId"?: string;
  "syncIdentityProviderId"?: number;
  "syncIdentityProviderCode"?: string;
}

export interface GenAuthUser {
  "userPoolId": string;
  "isRoot": boolean;
  "status": "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  "workStatus": "Closed" | "Active";
  "statusChangedAt": string;
  "thirdPartyIdentity"?: GenAuthThirdPartyIdentity;
  "oauth": string;
  "email": string;
  "phone": string;
  "username": string;
  "unionid": string;
  "openid": string;
  "nickname": string;
  "company": string;
  "photo": string;
  "browser": string;
  "device": string;
  "password": string;
  "passwordLastSetAt": number;
  "salt": string;
  "token": string;
  "tokenExpiredAt": string;
  "loginsCount": number;
  "lastIp": string;
  "name": string;
  "givenName": string;
  "familyName": string;
  "middleName": string;
  "profile": string;
  "preferredUsername": string;
  "website": string;
  "gender": "M" | "F" | "U";
  "birthdate": string;
  "zoneinfo": string;
  "locale": string;
  "address": string;
  "formatted": string;
  "streetAddress": string;
  "locality": string;
  "region": string;
  "postalCode": string;
  "city": string;
  "province": string;
  "country": string;
  "registerSource": (string)[];
  "secretInfo": unknown;
  "emailVerified": boolean;
  "phoneVerified": boolean;
  "lastLogin": string;
  "lastLoginApp": string;
  "blocked": boolean;
  "isDeleted": boolean;
  "sendSmsCount": number;
  "sendSmsLimitCount": number;
  "encryptedPassword": string;
  "userSourceType": "excel" | "sync" | "register" | "adminCreated" | "universalInvitation" | "policyInvitation";
  "userSourceId": string;
  "customData": Record<string, unknown>;
  "customDataOnce": Record<string, unknown>;
  "idToken": Record<string, unknown>;
  "customAccessTokenClaims": Record<string, unknown>;
  "decryptedToken": Record<string, unknown>;
  "metaData": Record<string, unknown>;
  "excelRow": (unknown)[];
  "identities": (GenAuthPartial)[];
  "identity": GenAuthIdentity;
  "identitiesLinkedThisTime": (GenAuthPartial & GenAuthObject4)[];
  "federationIdentityId": string;
  "rawPassword": string;
  "userPasswordExpireTime": string;
  "arn": string;
  "signedUp": string;
  "externalId"?: string;
  "mainDepartmentId": string;
  "mainDepartmentCode": string;
  "lastMfaTime": string;
  "passwordSecurityLevel": number;
  "resetPasswordOnFirstLogin": boolean;
  "resetPasswordOnNextLogin": boolean;
  "resetedPassword": boolean;
  "syncExtInfo": Record<string, unknown>;
  "phoneCountryCode"?: string;
  "identityNumber"?: string;
  "mfaTriggerData"?: string;
  "lastLoginRegion": GenAuthLastLoginRegion;
  "usertype": "1" | "2";
  "remoteLoginMfaConfig": GenAuthRemoteLoginMfaConfig;
  "expiredAt"?: string;
  "directManagement"?: string;
  "displayName": string;
  "userIdInIdp": string;
  "accessToken": string;
  "refreshToken": string;
  "provider": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark";
  "recoveryCode": string;
  "positions": (GenAuthObject5)[];
  "lastIP": string;
  "udv": (GenAuthObject6)[];
  "metadata": Record<string, unknown>;
  "departments"?: GenAuthPaginatedDepartments;
  "departmentIds"?: (string)[];
  "tenantId"?: string;
  "tenantIds"?: (string)[];
  "newlyCreated"?: boolean;
  "lastLoginAppName"?: string;
  "lastLoginAppLogo"?: string;
  "userSource"?: string;
  "userSourceLogo"?: string;
  "hasPassword"?: boolean;
  "roles": (GenAuthRole)[];
  "groups": (GenAuthGroup)[];
  "apps"?: (GenAuthApplication)[];
  "postId"?: string;
  "postIdList"?: (string)[];
  "post"?: GenAuthPost;
  "posts": (GenAuthPost)[];
  "metadataSource"?: (GenAuthSystemModelMetadataSourceItem)[];
  "metadataRelation"?: Record<string, (string)[]>;
  "id": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthOrganizationNameI18nDto {
  /** 支持多语言的字段 */
  "organizationName": GenAuthLangObject;
}

export interface GenAuthLastExecuteStatus {
  "status": "success" | "failed";
  "type"?: "timeout" | "error" | "custom";
  "error"?: GenAuthObject7;
}

export interface GenAuthTargetDto {
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  "targetIdentifier": string;
}

export interface GenAuthRoleCodeDto {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组的 code */
  "namespace"?: string;
}

export interface GenAuthRoleAuthorizedResourcesRespDto {
  /** 资源描述符 */
  "resourceCode": string;
  /** 资源类型 */
  "resourceType": string;
  /** 被授权的操作列表 */
  "actions": (string)[];
  /** 资源对应的 API Identifier */
  "apiIdentifier": string;
}

export interface GenAuthRoleDepartmentRespDto {
  /** 部门 ID */
  "id": string;
  /** 部门 code */
  "code": string;
  /** 部门名称 */
  "name": string;
  /** 部门描述信息 */
  "description": string;
}

export interface GenAuthRoleListItem {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 权限分组内角色名称 */
  "name"?: string;
  /** 角色描述 */
  "description"?: string;
  "namespace"?: string;
}

export interface GenAuthRoleCodeAndNamespaceDto {
  /** 权限分组（权限空间）内角色的唯一标识符 */
  "code": string;
  "namespace": string;
}

export interface GenAuthRolePermissionListDto {
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 角色 ID */
  "roleId": string;
  /** 主体状态，DISABLE-未加入角色，ENABLE-已经加入了角色 */
  "status": string;
  /** 主体加入时间毫秒值 */
  "enableTime": number;
  /** 主体失效时间毫秒值，为 null 表示用不失效 */
  "endTime": number;
  "userPoolId": string;
  "roleName": string;
  "roleCode": string;
  "description"?: string;
}

export interface GenAuthGetRoleDataPolicyListDto {
  /** 数据权限策略ID */
  "policyId": string;
  /** 数据权限策略名称 */
  "policyName": string;
  /** 数据权限策略描述 */
  "description"?: string;
  /** 目标对象列表 */
  "targetList": (GenAuthTargetItemDto)[];
  /** 数据权限资源列表 */
  "resourceList": (GenAuthDateResourceItemDto)[];
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthChangeEmailStrategyDto {
  /** 修改邮箱时是否验证旧邮箱 */
  "verifyOldEmail": boolean;
}

export interface GenAuthChangePhoneStrategyDto {
  /** 修改手机号时是否验证旧手机号 */
  "verifyOldPhone": boolean;
}

export interface GenAuthCookieSettingsDto {
  /** Cookie 有效时间：用户登录状态的有效时间（默认为 1209600 秒/ 14 天），过期后用户需要重新登录。对于应用面板及已加入应用面板的应用，将使用此 cookie  过期时间。 */
  "cookieExpiresIn": number;
  /** Cookie 过期时间基于浏览器会话：当前浏览器关闭后立即过期，下次打开需重新登录。 */
  "cookieExpiresOnBrowserSession": boolean;
}

export interface GenAuthRegisterAnomalyDetectionConfigDto {
  /** 是否开启频繁注册限制 */
  "enabled": boolean;
  /** 在一定时间周期内，对于同一个 IP，最多只能注册多少次。 */
  "limit": number;
  /** 限定周期时间长度，单位为秒。 */
  "timeInterval": number;
}

export interface GenAuthLoginAnomalyDetectionConfigDto {
  "loginFailStrategy": "captcha" | "block-account";
  /** 人机验证（验证码）策略。可选值，disable（不开启）/condition_set（条件开启）/always_enable （始终开启） */
  "robotVerify": string;
  /** 账号锁定策略。可选值，disable（不开启）/condition_set（条件开启） */
  "accountLock": string;
  /** 登录失败次数限制：当用户登录输入信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。 */
  "loginFailCheck": GenAuthLoginFailCheckConfigDto;
  /** 登录密码错误限制：当用户登录输入密码信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。此字段被标志为过时，见 accountLockLoginPasswordFailCheck/ robotVerifyLoginPasswordFailCheck */
  "loginPasswordFailCheck": GenAuthLoginPassowrdFailCheckConfigDto;
  /** 账号锁定-登录密码错误限制：当用户登录输入密码信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。 */
  "accountLockLoginPasswordFailCheck": GenAuthLoginPassowrdFailCheckConfigDto;
  /** 人机验证（验证码）-登录密码错误限制：当用户登录输入密码信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。 */
  "robotVerifyLoginPasswordFailCheck": GenAuthLoginPassowrdFailCheckConfigDto;
  /** 人机验证（验证码）- ip 白名单：当登录者 ip 不在白名单会触发人机验证。 */
  "robotVerifyLoginIpWhitelistCheck": GenAuthLoginIpWhitelistCheckConfigDto;
  /** 是否开启登录时间限制 */
  "robotVerifyLoginTimeCheckEnable": boolean;
  /** 登录时间限制周几+起始时间数组 */
  "robotVerifyloginWeekStartEndTime": (GenAuthLoginWeekStartEndTimeCheckDto)[];
}

export interface GenAuthSelfUnlockAccountConfigDto {
  /** 是否允许用户自助解锁账号。 */
  "enabled": boolean;
  /** 自助解锁方式，目前支持原密码 + 验证码和验证码两种方式。 */
  "strategy": "captcha" | "password-captcha";
}

export interface GenAuthQrcodeLoginStrategyDto {
  /** 二维码有效时间，单位秒 */
  "qrcodeExpiresIn": number;
  /** 时间长度单位，Second/Minute/Hour/Day，仅做显示用 */
  "qrcodeExpiresInUnit": string;
  /** ticket 有效时间，单位秒 */
  "ticketExpiresIn": number;
  /** 时间长度单位，Second/Minute/Hour/Day，仅作显示用 */
  "ticketExpiresInUnit": string;
  /** Web 轮询接口返回完整用户信息，详情见此文档：Web 轮询接口返回完整用户信息 */
  "allowExchangeUserInfoFromBrowser": boolean;
  /** 允许在浏览器使用 ticket 换取用户信息，详情见此文档：Web 轮询接口返回完整用户信息 */
  "returnFullUserInfo": boolean;
}

export interface GenAuthSessionManagementDto {
  "sessionId": string;
  /** Session 类型: - `COOKIE`: cookie - `TOKEN`: token */
  "sessionType": "cookie" | "token";
  "user": GenAuthUserBasicInfo;
  "device": GenAuthDeviceBasicInfo;
  "app": GenAuthAppBasicInfo;
  "ip": string;
  "loginAt": string;
  "accessTokenExpiredAt": string;
  "idTokenExpiredAt": string;
  "cookieExpiredAt": string;
}

export interface GenAuthSessionManagementByUserDto {
  "user": GenAuthUserBasicInfo;
  /** 设备列表 */
  "deviceList": (GenAuthDeviceBasicInfo)[];
  "deviceCount": number;
  /** APP 列表 */
  "appList": (GenAuthAppBasicInfo)[];
  "appCount": number;
}

export interface GenAuthSessionManagementByAppDto {
  "app": GenAuthAppBasicInfo;
  /** 用户列表 */
  "userList": (GenAuthUserBasicInfo)[];
  "userCount": number;
  /** 设备列表 */
  "deviceList": (GenAuthDeviceBasicInfo)[];
  "deviceCount": number;
}

export interface GenAuthSessionManagementByDeviceDto {
  "device": GenAuthDeviceBasicInfo;
  /** 用户列表 */
  "userList": (GenAuthUserBasicInfo)[];
  "userCount": number;
  "appList": (GenAuthAppBasicInfo)[];
  "appCount": number;
}

export interface GenAuthSyncTaskProvisioningScope {
  /** 是否同步所选组织机构下的所有用户和部门 */
  "all": boolean;
  "orgId": string;
  /** 是否包含新增的用户 */
  "includeNewUsers": boolean;
}

export interface GenAuthSyncTaskFieldMapping {
  /** 源字段 */
  "expression": string;
  /** 转换后的字段 */
  "targetKey": string;
}

export interface GenAuthSyncTaskTimedScheduler {
  /** 定时周期： - `month`: 每个月执行一次 - `week`: 每周执行一次 - `days`: 每天执行一次 - `sixHours`: 每六小时执行一次 - `twoHours`: 每两小时执行一次      */
  "cycle": "month" | "week" | "days" | "sixHours" | "twoHours";
  /** 开始时间 */
  "startTime": number;
}

export interface GenAuthSyncTaskClientConfig {
  /** 飞书同步任务配置 */
  "larkConfig": GenAuthSyncTaskLarkClientConfig;
  /** 飞书(国际版)同步任务配置 */
  "larkInternationalConfig": GenAuthSyncTaskLarkClientConfig;
  /** 企业微信同步任务配置 */
  "wechatworkConfig": GenAuthSyncTaskWechatworkClientConfig;
  /** 钉钉同步任务配置 */
  "dingtalkConfig": GenAuthSyncTaskDingtalkClientConfig;
  /** Moka 同步任务配置 */
  "mokaConfig": GenAuthSyncTaskMokaClientConfig;
  /** 自定义同步源同步任务配置 */
  "scimConfig": GenAuthSyncTaskScimClientConfig;
  /** Windows AD 同步任务配置 */
  "activeDirectoryConfig": GenAuthSyncTaskActiveDirectoryClientConfig;
  /** LDAP 同步任务配置 */
  "ldapConfig": GenAuthSyncTaskLdapClientConfig;
  /** 北森同步任务配置 */
  "italentConfig": GenAuthSyncTaskItalentClientConfig;
  /** 每刻报销同步任务配置 */
  "maycurConfig": GenAuthSyncTaskMaycurClientConfig;
  /** 纷享销客同步任务配置 */
  "fxiaokeConfig": GenAuthSyncTaskFxiaokeClientConfig;
  /** 销售易同步任务配置 */
  "xiaoshouyiConfig": GenAuthSyncTaskXiaoshouyiClientConfig;
  /** 嘉扬同步任务配置 */
  "kayangConfig": GenAuthSyncTaskKayangClientConfig;
}

export interface GenAuthSyncRiskOperationDto {
  /** 同步任务风险操作 ID */
  "syncRiskOperationId": string;
  /** 同步任务 ID */
  "syncTaskId": number;
  "createdAt": string;
  "updatedAt": string;
  /** 执行状态: - `PENDING`: 待执行 - `SUCCESS`: 成功 - `FAILED`: 失败 - `CANCELED`: 已取消 - `EXECUTING`: 执行中      */
  "status": "PENDING" | "SUCCESS" | "FAILED" | "CANCELED" | "EXECUTING";
  /** 优先级，数字越小表示优先级越高。 */
  "level": number;
  /** 操作对象类型: - `department`: 部门 - `user`: 用户      */
  "objectType": "DEPARTMENT" | "USER";
  /** 操作对象（用户、分组、部门）名称 */
  "objectName": string;
  /** 操作对象 ID */
  "objectId": string;
  /** 执行失败的错误信息 */
  "errMsg"?: string;
}

export interface GenAuthCreateTenantUserOptionsDto {
  /** 该参数一般在迁移旧有用户数据到 Authing 的时候会设置。开启这个开关，password 字段会直接写入 Authing 数据库，Authing 不会再次加密此字段。如果你的密码不是明文存储，你应该保持开启，并编写密码函数计算。 */
  "keepPassword"?: boolean;
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: boolean;
  /** 是否强制要求用户在第一次的时候重置密码 */
  "resetPasswordOnFirstLogin"?: boolean;
  "passwordEncryptType"?: "sm2" | "rsa" | "none";
}

export interface GenAuthListTenantUsersOptionsDto {
  /** 分页配置 */
  "pagination"?: GenAuthPaginationDto2;
  "withDepartmentIds"?: boolean;
}

export interface GenAuthObject {
  "name"?: string;
  "username"?: string;
  "nickname"?: string;
  "photo"?: string;
}

export interface GenAuthObject2 {
  "name"?: string;
  "logo"?: string;
}

export interface GenAutherrorEmailMsg {
  /** 邮箱地址 */
  "email": string;
  /** 错误信息描述 */
  "message": string;
}

export interface GenAuthInviteTenantUserRecord {
  /** 邀请记录编号 */
  "recordId": number;
  /** 邀请账号 */
  "inviteAccount"?: string;
  /** 账号激活状态 */
  "verifiedStatus"?: string;
  /** 邀请链接 */
  "inviteLink": string;
  "createdAt": string;
  /** 账号激活时间 */
  "activatedAt"?: string;
}

export interface GenAuthMultipleTenantAdminDto {
  /** 用户唯一 ID */
  "userId": string;
  /** 用户名称 */
  "name": string;
  /** 用户手机号 */
  "phone": string;
  /** 用户邮箱 */
  "email": string;
  /** 授权 API */
  "apiAuthorized"?: boolean;
  /** 最后登录时间 */
  "lastLogin": string;
  "loginsCount": number;
  "tenants"?: (GenAuthSimpleTenantDto)[];
}

export interface GenAuthTenantCooperatorDto {
  /** 用户唯一 ID */
  "userId": string;
  /** 类型 */
  "type": string;
  /** 是否external */
  "external": boolean;
  /** 用户 */
  "user": GenAuthUserDto2;
  /** 租户用户 */
  "tenantUser"?: GenAuthTenantUserDto;
}

export interface GenAuthMenuBase {
  "key": string;
  "path"?: string;
  "titleKey": string;
  "titleCN": string;
  "titleEN": string;
  "icon"?: string;
  "defaultIcon"?: string;
  "groupId"?: number;
  "attrs"?: GenAuthObject8;
  "children"?: (GenAuthMenuBase)[];
  "isBeta"?: boolean;
  "isAlpha"?: boolean;
  "isNew"?: boolean;
  "event": string;
  "query"?: string;
  "onlyKey"?: string;
  "showChildren"?: boolean;
  "permissionResourceType"?: string;
  "isMetaDataTab"?: boolean;
  "isMainBody"?: boolean;
  "isEmpty"?: boolean;
  "rootOnly"?: boolean;
}

export interface GenAuthListUsersAdvancedFilterItemDto {
  /** 高级搜索指定的用户字段： - `id`: 用户 ID - `phone`: 手机号    - `email`: 邮箱 - `username`: 用户名 - `externalId`: 用户在外部系统的 ID - `name`: 姓名 - `status`: 用户状态，可选值为 `Activated` 和 `Suspended` - `gender`: 用户性别，可选值为 `M`（男性）、`F`（女性） 和 `U`（未知） - `birthdate`: 出生日期 - `givenName`: 名 - `familyName`: 姓 - `preferredUsername`: Preferred Username - `profile`: 个人资料 - `country`: 国家 - `province`: 省份 - `zoneinfo`: 时区 - `website`: 个人网站 - `address`: 地址 - `streetAddress`: 街道地址 - `company`: 公司 - `postalCode`: 邮政编码 - `formatted`: 格式化的地址 - `signedUp`: 注册时间 - `locale`: 语言信息 - `lastLogin`: 上次登录时间，为时间戳类型 - `loginsCount`: 登录次数，为数字类型 - `lastLoginApp`: 上次登录的应用 ID - `userSource`: 用户来源，具体使用见示例 - `department`: 用户部门，具体使用见示例 - `loggedInApps`: 曾经登录过的应用，具体使用见示例 - `identity`: 用户外部身份源信息，具体使用见示例 - ... 其他自定义字段  */
  "field": string;
  /** 运算符，可选值为： - `EQUAL`: 全等，适用于数字和字符串的全等匹配 - `NOT_EQUAL`: 不等于，适用于数字和字符串的匹配 - `CONTAINS`: 字符串包含 - `NOT_CONTAINS`: 字符串不包含 - `IS_NULL`: 为空 - `NOT_NULL`: 不为空 - `IN`: 为某个数组中的元素 - `GREATER`: 大于或等于，适用于数字、日期类型数据的比较 - `LESSER`: 小于或等于，适用于数字、日期类型数据的比较 - `BETWEEN`: 介于什么什么之间，适用于数字、日期类型数据的比较      */
  "operator": "EQUAL" | "NOT_EQUAL" | "CONTAINS" | "NOT_CONTAINS" | "IS_NULL" | "NOT_NULL" | "IN" | "GREATER" | "LESSER" | "BETWEEN";
  /** 搜索值，不同的 `field` 对应的 `value` 类型可能不一样，详情见示例。 */
  "value": unknown;
}

export interface GenAuthListUsersOptionsDto {
  /** 分页配置 */
  "pagination"?: GenAuthPaginationDto;
  /** 排序设置，可以设置多项按照多个字段进行排序 */
  "sort"?: (GenAuthSortingDto)[];
  /** 模糊搜索匹配的用户字段，可选值为： - `phone`: 用户手机号，不能包含手机号区号，默认包含 - `email`: 用户邮箱，默认包含 - `name`: 用户名称，默认包含 - `username`: 用户名，默认包含 - `nickname`: 用户昵称，默认包含 - `id`: 用户 ID - `company`: 公司 - `givenName`: 名 - `familyName`: 姓 - `middleName`: 中间名 - `preferredUsername`: Preferred Username - `profile`: 个人资料 - `website`: 个人网站 - `address`: 地址 - `formatted`: 格式化地址 - `streetAddress`: 街道地址 - `postalCode`: 邮编号码  */
  "fuzzySearchOn"?: (string)[];
  "withCustomData"?: boolean;
  "withPost"?: boolean;
  "withIdentities"?: boolean;
  "withDepartmentIds"?: boolean;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: boolean;
  "withTenantIds"?: boolean;
}

export interface GenAuthUserFieldDecryptReqItemDto {
  /** 用户唯一标志，可以是用户 ID、用户名、邮箱、手机号、外部 ID、在外部身份源的 ID。 */
  "userId": string;
  /** 字段的key名称，例如 username/phone */
  "fieldName": string;
  /** 字段加密后的内容 */
  "encryptedContent": string;
}

export interface GenAuthCreateUserOptionsDto {
  /** 该参数一般在迁移旧有用户数据到 Authing 的时候会设置。开启这个开关，password 字段会直接写入 Authing 数据库，Authing 不会再次加密此字段。如果你的密码不是明文存储，你应该保持开启，并编写密码函数计算。 */
  "keepPassword"?: boolean;
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: boolean;
  /** 是否强制要求用户在第一次的时候重置密码 */
  "resetPasswordOnFirstLogin"?: boolean;
  /** 此次调用中使用的父部门 ID 的类型 */
  "departmentIdType"?: "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 重置密码发送邮件和手机号选项 */
  "sendNotification"?: GenAuthSendCreateAccountNotificationDto;
  "passwordEncryptType"?: "sm2" | "rsa" | "none";
}

export interface GenAuthCreateUserOtpDto {
  /** OTP 密钥 */
  "secret": string;
  /** OTP Recovery Code */
  "recoveryCode"?: string;
}

export interface GenAuthCreateIdentityDto {
  /** Identity 类型，如 unionid, openid, primary */
  "type": string;
  /** 身份源连接 ID */
  "extIdpId": string;
  /** 外部身份源类型： - `wechat`: 微信 - `qq`: QQ - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `weibo`: 微博 - `github`: GitHub - `alipay`: 支付宝 - `baidu`: 百度 - `lark`: 飞书 - `welink`: Welink - `yidun`: 网易易盾 - `qingcloud`: 青云 - `google`: Google - `gitlab`: GitLab - `gitee`: Gitee - `twitter`: Twitter - `facebook`: Facebook - `slack`: Slack - `linkedin`: Linkedin - `instagram`: Instagram - `oidc`: OIDC 型企业身份源 - `oauth2`: OAuth2 型企业身份源 - `saml`: SAML 型企业身份源 - `ldap`: LDAP 型企业身份源 - `ad`: AD 型企业身份源 - `cas`: CAS 型企业身份源 - `azure-ad`: Azure AD 型企业身份源      */
  "provider": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark";
  /** 在外部身份源中的 ID */
  "userIdInIdp": string;
  /** 用户在 idp 中的身份信息 */
  "userInfoInIdp": Record<string, unknown>;
  /** 在外部身份源中的 Access Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "accessToken": string;
  /** 在外部身份源中的 Refresh Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "refreshToken": string;
  /** 身份来自的身份源连接 ID 列表 */
  "originConnIds": (string)[];
}

export interface GenAuthCreateUserInfoDto {
  /** 账户当前状态 */
  "status"?: "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  "email"?: string;
  "phone"?: string;
  "phoneCountryCode"?: string;
  "username"?: string;
  "externalId"?: string;
  "name"?: string;
  "nickname"?: string;
  "photo"?: string;
  /** 性别 */
  "gender"?: "M" | "F" | "U";
  /** 邮箱是否验证 */
  "emailVerified"?: boolean;
  /** 手机号是否验证 */
  "phoneVerified"?: boolean;
  "birthdate"?: string;
  "country"?: string;
  "province"?: string;
  "city"?: string;
  "address"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  "company"?: string;
  "browser"?: string;
  "device"?: string;
  "givenName"?: string;
  "familyName"?: string;
  "middleName"?: string;
  "profile"?: string;
  "preferredUsername"?: string;
  "website"?: string;
  "zoneinfo"?: string;
  "locale"?: string;
  "formatted"?: string;
  "region"?: string;
  "password"?: string;
  "salt"?: string;
  /** 租户 ID */
  "tenantIds"?: (string)[];
  /** 用户的 OTP 验证器 */
  "otp"?: GenAuthCreateUserOtpDto;
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: (string)[];
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
  /** 数据对象数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "metadataSource"?: unknown;
  /** 第三方身份源（建议调用绑定接口进行绑定） */
  "identities"?: (GenAuthCreateIdentityDto)[];
  "identityNumber"?: string;
}

export interface GenAuthUpdateUserOptionsDto {
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 设置用户首次登录要求重置密码 */
  "resetPasswordOnFirstLogin"?: boolean;
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: boolean;
  "passwordEncryptType"?: "sm2" | "rsa" | "none";
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: boolean;
  /** 重置密码发送邮件和手机号选项 */
  "sendPasswordResetedNotification"?: GenAuthSendResetPasswordNotificationDto;
}

export interface GenAuthUpdateUserInfoDto {
  "userId": string;
  "phoneCountryCode"?: string;
  "name"?: string;
  "nickname"?: string;
  "photo"?: string;
  "externalId"?: string;
  /** 账户当前状态 */
  "status"?: "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱是否验证 */
  "emailVerified"?: boolean;
  /** 手机号是否验证 */
  "phoneVerified"?: boolean;
  "birthdate"?: string;
  "country"?: string;
  "province"?: string;
  "city"?: string;
  "address"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  /** 性别 */
  "gender"?: "M" | "F" | "U";
  "username"?: string;
  "email"?: string;
  "phone"?: string;
  "password"?: string;
  "company"?: string;
  "browser"?: string;
  "device"?: string;
  "givenName"?: string;
  "familyName"?: string;
  "middleName"?: string;
  "profile"?: string;
  "preferredUsername"?: string;
  "website"?: string;
  "zoneinfo"?: string;
  "locale"?: string;
  "formatted"?: string;
  "region"?: string;
  "identityNumber"?: string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
  /** 数据对象数据，传入的对象中的 key 必须先在用户数据对象相关自定义字段 */
  "metadata"?: Record<string, unknown>;
}

export interface GenAuthUpdateUserBatchOptionsDto {
  /** 该参数一般在迁移旧有用户数据到 Authing 的时候会设置。开启这个开关，password 字段会直接写入 Authing 数据库，Authing 不会再次加密此字段。如果你的密码不是明文存储，你应该保持开启，并编写密码函数计算。 */
  "keepPassword"?: boolean;
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: boolean;
  "passwordEncryptType"?: "sm2" | "rsa" | "none";
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: boolean;
  /** 重置密码发送邮件和手机号选项 */
  "sendPasswordResetedNotification"?: GenAuthSendResetPasswordNotificationDto;
}

export interface GenAuthDeleteUsersBatchOptionsDto {
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthPrincipalAuthenticationInfoDto {
  /** 是否进行认证 */
  "authenticated": boolean;
  /** 用户 ID */
  "principalType": string;
  /** 认证主体证件号码 */
  "principalCode": string;
  /** 认证主体名称 */
  "principalName": string;
  /** 认证时间，标准时间字符串 */
  "authenticatedAt": string;
}

export interface GenAuthResetUserPrincipalAuthenticationInfoOptionsDto {
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthUserDepartmentRespDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门 ID */
  "departmentId": string;
  /** 是否为根部门 */
  "isRoot": boolean;
  /** 部门创建时间 */
  "createdAt": string;
  /** 部门名称 */
  "name": string;
  /** 部门描述 */
  "description": string;
  /** 自定义部门 ID，用于存储自定义的 ID */
  "openDepartmentId"?: string;
  /** 是否是部门 Leader */
  "isLeader": boolean;
  /** 部门识别码 */
  "code": string;
  /** 是否是主部门 */
  "isMainDepartment": boolean;
  /** 加入部门时间 */
  "joinedAt": string;
  /** 是否是虚拟部门 */
  "isVirtualNode": boolean;
  /** 多语言设置 */
  "i18n"?: GenAuthDepartmentI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: Record<string, unknown>;
  /** 部门 ID 路径 */
  "departmentIdPath"?: (string)[];
  /** 部门 Code 路径 */
  "departmentCodePath"?: (string)[];
  /** 部门名路径 */
  "departmentNamePath"?: (string)[];
}

export interface GenAuthSetUserDepartmentDto {
  /** 部门 id */
  "departmentId": string;
  /** 是否是部门 leader */
  "isLeader": boolean;
  /** 是否是主部门 */
  "isMainDepartment": boolean;
}

export interface GenAuthSetUserDepartmentsOptionsDto {
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthListArchivedUsersRespDto {
  /** 用户 ID */
  "userId": string;
  /** 归档时间 */
  "archivedAt": string;
  "originalProfile": GenAuthOriginalProfile;
}

export interface GenAuthKickUsersOptionsDto {
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthHasRoleRolesDto {
  "namespace"?: string;
  /** 角色 code */
  "code": string;
}

export interface GenAuthHasAnyRoleOptionsDto {
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthUserLoginHistoryDto {
  "appId": string;
  "appName": string;
  "appLogo": string;
  "appLoginUrl": string;
  /** 客户端 IP */
  "clientIp"?: string;
  /** 登录时使用的 user agent */
  "userAgent": string;
  /** 登录时间 */
  "time": string;
}

export interface GenAuthImportOtpItemDto {
  /** 用户 ID */
  "userId": string;
  /** OTP 数据 */
  "otp": GenAuthImportOtpItemDataDto;
}

export interface GenAuthSendUserResetPasswordEmailLinkDto {
  "userId": string;
  "userIdType"?: "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthWebhookRetryConfigV3Dto {
  /** 是否开启失败重试 */
  "enabled": boolean;
  /** 失败重试次数 */
  "count"?: number;
  /** 失败重试时间间隔 */
  "delay"?: number;
  /** 失败重试时间间隔单位 */
  "delayUnit"?: "Second" | "Minute" | "Hour" | "Day";
}

export interface GenAuthWebhookLogDto {
  /** Webhook ID */
  "webhookId": string;
  /** Webhook 事件名称 */
  "eventName": string;
  /** Webhook 请求体 */
  "requestBody": Record<string, unknown>;
  /** Webhook 请求头 */
  "requestHeaders": Record<string, unknown>;
  /** Webhook 响应码 */
  "responseStatusCode": number;
  /** Webhook 响应头 */
  "responseHeaders": Record<string, unknown>;
  /** Webhook 响应体 */
  "responseBody": Record<string, unknown>;
  /** 时间戳 */
  "timestamp": string;
  /** 是否请求成功 */
  "success": boolean;
  /** 请求失败时返回的错误信息 */
  "errorMessage"?: string;
}

export interface GenAuthWebhookCategoryDto {
  /** Webhook 类型名称 */
  "name": string;
  /** Webhook 类型英文名称 */
  "nameEn": string;
  /** Webhook 类型 */
  "value": string;
}

export interface GenAuthWebhookEventDto {
  /** Webhook 名称 */
  "name": string;
  /** Webhook 英文名称 */
  "nameEn": string;
  /** Webhook 事件 */
  "value": string;
  /** Webhook 事件分类 */
  "category": string;
}

export interface GenAuthResourceItemDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源定义的操作类型 */
  "actions": (string)[];
  /** 资源类型，如数据、API、按钮、菜单 */
  "resourceType": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthApplicationDefaultLoginMethod {
  /** 默认的登录类型   - `PASSWORD`: 密码类型，取决于你开启的基础登录方式，支持手机号/邮箱/用户名 + 密码进行登录   - `PASSCODE`: 验证码类型，取决于你开启的基础登录方式，支持手机号/邮箱 + 验证码进行登录   - `QRCODE`: 扫码登录类型，目前包含自建 APP 扫码登录、关注微信公众号扫码登录、微信小程序扫码登录三种类型        */
  "connectionType": "PASSCODE" | "PASSWORD" | "QRCODE" | "LDAP" | "AD";
  /** 当 `connectionType` 为 `QRCODE` 时，此参数表示二维码类型。 - `SELF_BUILT_APP`: 自建 APP 扫码 - `WECHAT_OFFICIAL_ACCOUNT`: 扫码关注微信公众号登录 - `WECHAT_MINI_PROGRAM`: 微信小程序扫码登录      */
  "qrcodeType"?: "SELF_BUILT_APP" | "WECHAT_OFFICIAL_ACCOUNT" | "WECHAT_MINI_PROGRAM";
  /** 当 `connectionType` 为 `QRCODE` 时，你需要通过此参数指定具体的扫码登录身份源连接的 ID。 */
  "qrcodeExtIdpConnId"?: string;
  /** 当 `connectionType` 为 `AD` 时，你需要通过此参数指定具体的 AD 身份源连接的 ID。 */
  "adExtIdpConnId"?: string;
  /** 当 `connectionType` 为 `LDAP` 时，你需要通过此参数指定具体的 LDAP 身份源连接的 ID。 */
  "ldapExtIdpConnId"?: string;
}

export interface GenAuthApplicationEnabledExtIdpConnDto {
  /** 是否为社会化登录身份源连接 */
  "isSocial": boolean;
  /** 身份源 ID */
  "extIdpId": string;
  /** 身份源类型 */
  "extIdpType": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark";
  /** 身份源连接 ID */
  "extIdpConnId": string;
  /** 身份源连接类型 */
  "extIdpConnType": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:genauth:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark:miniprogram:default";
  /** 身份源连接可读唯一标志 */
  "extIdpConnIdentifier": string;
  /** 微信 */
  "extIdpConnDisplayName": string;
  /** 身份源连接 Logo */
  "extIdpConnLogo": string;
  /** 是否允许身份源连接 */
  "enabled"?: boolean;
}

export interface GenAuthApplicationAgreementDto {
  /** 展示的页面（可多选）： - `LoginPage`: 登录页面 - `RegisterPage`: 注册页面      */
  "displayAt": ("LoginPage" | "RegisterPage")[];
  /** 是否要求必须勾选 */
  "isRequired": boolean;
  /** 此协议针对什么语言有效: - `zh-CN`: 简体中文 - `zh-TW`: 繁体中文 - `en-US`: 英文 - `ja-JP`: 日语      */
  "lang": "zh-CN" | "en-US" | "zh-TW" | "ja-JP";
  /** 此协议针对什么语言有效 */
  "content": string;
}

export interface GenAuthInternalExtendsField {
  "type": "internal";
  "name": string;
  "label": string;
  "inputType": "image" | "number" | "date" | "dateTime" | "datetime" | "select" | "dropdown" | "boolean" | "string" | "text" | "gender" | "country" | "username" | "phone" | "email";
  "required"?: boolean;
  "validateRules"?: (GenAuthAppValidateRule)[];
}

export interface GenAuthUserExtendsField {
  "type": "user";
  "id": string;
  "name": string;
  "label": string;
  "inputType": "image" | "number" | "date" | "dateTime" | "datetime" | "select" | "dropdown" | "boolean" | "string" | "text" | "gender" | "country" | "username" | "phone" | "email";
  "required"?: boolean;
  "validateRules"?: (GenAuthAppValidateRule)[];
}

export interface GenAuthUserMetadataField {
  "type": "metadata";
  "id": string;
  "name": string;
  "label": string;
  "validateRules"?: (GenAuthAppValidateRule)[];
  "inputType": "image" | "number" | "date" | "dateTime" | "datetime" | "select" | "dropdown" | "boolean" | "string" | "text" | "gender" | "country" | "username" | "phone" | "email";
  "required"?: boolean;
}

export interface GenAuthLangObject {
  /** 多语言的中文内容 */
  "zh-CN"?: GenAuthLangUnit;
  /** 多语言的英文内容 */
  "en-US"?: GenAuthLangUnit;
  /** 多语言的繁体中文内容 */
  "zh-TW"?: GenAuthLangUnit;
  /** 多语言的日语内容 */
  "ja-JP"?: GenAuthLangUnit;
}

export interface GenAuthJSONWebKeySet {
  "keys": (GenAuthJWKRSAKey | GenAuthJWKOKPKey | GenAuthJWKECKey | GenAuthJWKOctKey)[];
}

export interface GenAuthISamlACSConfig {
  "index": number;
  "url": string;
  "cert": string;
  "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" | "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" | "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact" | "urn:oasis:names:tc:SAML:2.0:bindings:SOAP" | "urn:oasis:names:tc:SAML:2.0:bindings:PAOS" | "urn:oasis:names:tc:SAML:1.0:bindings:SOAP-binding" | "urn:oasis:names:tc:SAML:2.0:bindings:URI";
}

export interface GenAuthISamlSLOConfig {
  "url": string;
  "responseUrl"?: string;
  "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" | "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" | "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact" | "urn:oasis:names:tc:SAML:2.0:bindings:SOAP" | "urn:oasis:names:tc:SAML:2.0:bindings:PAOS" | "urn:oasis:names:tc:SAML:1.0:bindings:SOAP-binding" | "urn:oasis:names:tc:SAML:2.0:bindings:URI";
}

export interface GenAuthSamlKeyInfoList {
  "samlCert": string;
  "samlKey": string;
  "samlFingerprint": string;
  "keyUseEnum": "signing" | "encryption";
}

export interface GenAuthICustomAttribute {
  "name": string;
  "nameFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified" | "urn:oasis:names:tc:SAML:2.0:attrname-format:uri" | "urn:oasis:names:tc:SAML:2.0:attrname-format:basic";
  "valueXsiType": string;
  "value": string;
}

export interface GenAuthApplicationDefaultLoginMethodInput {
  /** 默认的登录类型   - `PASSWORD`: 密码类型，取决于你开启的基础登录方式，支持手机号/邮箱/用户名 + 密码进行登录   - `PASSCODE`: 验证码类型，取决于你开启的基础登录方式，支持手机号/邮箱 + 验证码进行登录   - `QRCODE`: 扫码登录类型，目前包含自建 APP 扫码登录、关注微信公众号扫码登录、微信小程序扫码登录三种类型        */
  "connectionType": "PASSCODE" | "PASSWORD" | "QRCODE" | "LDAP" | "AD";
  /** 当 `connectionType` 为 `QRCODE` 时，此参数表示二维码类型。 - `SELF_BUILT_APP`: 自建 APP 扫码 - `WECHAT_OFFICIAL_ACCOUNT`: 扫码关注微信公众号登录 - `WECHAT_MINI_PROGRAM`: 微信小程序扫码登录      */
  "qrcodeType"?: "SELF_BUILT_APP" | "WECHAT_OFFICIAL_ACCOUNT" | "WECHAT_MINI_PROGRAM";
  /** 当 `connectionType` 为 `QRCODE` 时，你需要通过此参数指定具体的扫码登录身份源连接的 ID。 */
  "qrcodeExtIdpConnId"?: string;
  /** 当 `connectionType` 为 `AD` 时，你需要通过此参数指定具体的 AD 身份源连接的 ID。 */
  "adExtIdpConnId"?: string;
  /** 当 `connectionType` 为 `LDAP` 时，你需要通过此参数指定具体的 LDAP 身份源连接的 ID。 */
  "ldapExtIdpConnId"?: string;
}

export interface GenAuthPaginationDto {
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthApplicationTabMethodsSortConfigDto {
  "loginMethodsSort": (string)[];
}

export interface GenAuthTabConfigDto {
  "enabledLoginMethods": (string)[];
  "validLoginMethods": (string)[];
  "validRegisterMethods": (string)[];
}

export interface GenAuthLanguageCoinfigDto {
  "global": GenAuthLanguageCoinfigGlobalDto;
}

export interface GenAuthParsedUserAgent {
  /** 使用的设备类型 */
  "device": string;
  /** 浏览器名称 */
  "name": string;
  /** 操作系统 */
  "os": string;
}

export interface GenAuthGeoIp {
  /** 地理位置 */
  "location": GenAuthGeoIp;
  /** Country Name */
  "country_name": string;
  /** Country Code 2 */
  "country_code2": string;
  /** Country Code 3 */
  "country_code3": string;
  /** Region Name */
  "region_name": string;
  /** Region Code */
  "region_code": string;
  /** 城市名称 */
  "city_name": string;
  /** Continent Code */
  "continent_code": string;
  /** 时区 */
  "timezone": string;
}

export interface GenAuthUDFvalidateValue {
  "type": "UNIQUE";
  "content": string;
  "error": string;
}

export interface GenAuthOpenResource {
  /** 数据策略下所授权的数据资源 Code */
  "resourceCode": string;
  /** 数据策略下所授权的数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrAuthorize - `ARRAY`: 数组类型 ArrayAuthorize - `TREE`: 树类型 TreeAuthorize  */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 数据策略的字符串资源 */
  "strAuthorize"?: GenAuthStrAuthorize;
  /** 数据策略的数组资源 */
  "arrAuthorize"?: GenAuthArrayAuthorize;
  /** 数据策略的树资源 */
  "treeAuthorize"?: GenAuthTreeAuthorize;
}

export interface GenAuthActionAuth {
  /** 数据策略授权用户 ID 列表 */
  "userIds": (string)[];
  /** 数据资源权限操作 */
  "action": string;
}

export interface GenAuthTreeStructs {
  /** 树资源节点 Code, 同层级唯一 */
  "code": string;
  /** 树资源节点名称 ，同层级唯一 */
  "name": string;
  /** 树资源节点 Value */
  "value"?: string;
  /** 树数据资源策略节点 actions  */
  "actions"?: (string)[];
  /** 扩展字段值, 以 key:value 形式存储 */
  "extendFieldValue"?: unknown;
  /** 子节点数据,子节点数据最多五个层级 */
  "children": (GenAuthTreeStructs)[];
}

export interface GenAuthTreeStructs2 {
  /** 树资源节点 Code, 同层级唯一 */
  "code": string;
  /** 树资源节点名称 ，同层级唯一 */
  "name": string;
  /** 树资源节点 Value */
  "value"?: string;
  /** 树数据资源策略节点 actions  */
  "actions"?: (string)[];
  /** 子节点数据,子节点数据最多五个层级 */
  "children": (GenAuthTreeStructs2)[];
  /** 扩展字段值, 以 key:value 形式存储 */
  "extendFieldValue"?: unknown;
}

export interface GenAuthOpenResource2 {
  /** 数据策略下所授权的数据资源 Code */
  "resourceCode": string;
  /** 数据策略下所授权的数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrAuthorize - `ARRAY`: 数组类型 ArrayAuthorize - `TREE`: 树类型 TreeAuthorize  */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 数据策略的字符串资源 */
  "strAuthorize"?: GenAuthStrAuthorize2;
  /** 数据策略的数组资源 */
  "arrAuthorize"?: GenAuthArrayAuthorize2;
  /** 数据策略的树资源 */
  "treeAuthorize"?: GenAuthTreeAuthorize2;
}

export interface GenAuthTreeStructs3 {
  /** 树资源节点 Code, 同层级唯一 */
  "code": string;
  /** 树资源节点名称 ，同层级唯一 */
  "name": string;
  /** 树资源节点 Value */
  "value"?: string;
  /** 树数据资源策略节点 actions  */
  "actions"?: (string)[];
  /** 扩展字段值, 以 key:value 形式存储 */
  "extendFieldValue"?: unknown;
  /** 子节点数据,子节点数据最多五个层级 */
  "children": (GenAuthTreeStructs3)[];
}

export interface GenAuthPolicyBo {
  /** 数据策略 id */
  "dataPolicyId": string;
  /** 数据策略名称名称 */
  "dataPolicyName": string;
}

export interface GenAuthRoleBo {
  /** 角色 id */
  "roleId": string;
  /** 角色名称 */
  "roleName": string;
  /** 角色 Code */
  "roleCode": string;
}

export interface GenAuthGroupBo {
  /** 用户组 id */
  "groupId": string;
  /** 用户组名称 */
  "groupName": string;
  /** 用户组 Code */
  "groupCode": string;
}

export interface GenAuthNodeBo {
  /** 组织机构 id */
  "nodeId": string;
  /** 组织机构名称 */
  "nodeName": string;
  /** 组织机构 Code */
  "nodeCode": string;
}

export interface GenAuthSubjectRespDto {
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID */
  "id": string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 */
  "type": 0 | 1 | 2 | 3 | 4;
  /** 主体名称，包含用户名称、用户组名称、角色名称、组织机构名称 */
  "name": string;
}

export interface GenAuthDataResourceSimpleRespDto {
  /** 数据权限所属的数据资源 ID */
  "resourceId": string;
  /** 数据权限所属的数据资源名称 */
  "resourceName": string;
}

export interface GenAuthOption {
  /** 值 */
  "value": string;
}

export interface GenAuthObject3 {
  "key"?: string;
  "value"?: string;
  "idList": (GenAuthObject9)[];
  "operator": "eq" | "ne" | "co" | "nco" | "gt" | "lt" | "in" | "nin" | "empty" | "nempty";
  "type": "user" | "userDefinedField" | "userMetadataField" | "part" | "partId" | "partDefinedField";
}

export interface GenAuthDeepPartial2 {
  "toString"?: unknown | Record<string, unknown>;
  "toDateString"?: unknown | Record<string, unknown>;
  "toTimeString"?: unknown | Record<string, unknown>;
  "toLocaleString"?: unknown | Record<string, unknown>;
  "toLocaleDateString"?: unknown | Record<string, unknown>;
  "toLocaleTimeString"?: unknown | Record<string, unknown>;
  "valueOf"?: unknown | Record<string, unknown>;
  "getTime"?: unknown | Record<string, unknown>;
  "getFullYear"?: unknown | Record<string, unknown>;
  "getUTCFullYear"?: unknown | Record<string, unknown>;
  "getMonth"?: unknown | Record<string, unknown>;
  "getUTCMonth"?: unknown | Record<string, unknown>;
  "getDate"?: unknown | Record<string, unknown>;
  "getUTCDate"?: unknown | Record<string, unknown>;
  "getDay"?: unknown | Record<string, unknown>;
  "getUTCDay"?: unknown | Record<string, unknown>;
  "getHours"?: unknown | Record<string, unknown>;
  "getUTCHours"?: unknown | Record<string, unknown>;
  "getMinutes"?: unknown | Record<string, unknown>;
  "getUTCMinutes"?: unknown | Record<string, unknown>;
  "getSeconds"?: unknown | Record<string, unknown>;
  "getUTCSeconds"?: unknown | Record<string, unknown>;
  "getMilliseconds"?: unknown | Record<string, unknown>;
  "getUTCMilliseconds"?: unknown | Record<string, unknown>;
  "getTimezoneOffset"?: unknown | Record<string, unknown>;
  "setTime"?: unknown | Record<string, unknown>;
  "setMilliseconds"?: unknown | Record<string, unknown>;
  "setUTCMilliseconds"?: unknown | Record<string, unknown>;
  "setSeconds"?: unknown | Record<string, unknown>;
  "setUTCSeconds"?: unknown | Record<string, unknown>;
  "setMinutes"?: unknown | Record<string, unknown>;
  "setUTCMinutes"?: unknown | Record<string, unknown>;
  "setHours"?: unknown | Record<string, unknown>;
  "setUTCHours"?: unknown | Record<string, unknown>;
  "setDate"?: unknown | Record<string, unknown>;
  "setUTCDate"?: unknown | Record<string, unknown>;
  "setMonth"?: unknown | Record<string, unknown>;
  "setUTCMonth"?: unknown | Record<string, unknown>;
  "setFullYear"?: unknown | Record<string, unknown>;
  "setUTCFullYear"?: unknown | Record<string, unknown>;
  "toUTCString"?: unknown | Record<string, unknown>;
  "toISOString"?: unknown | Record<string, unknown>;
  "toJSON"?: unknown | Record<string, unknown>;
}

export interface GenAuthThirdPartyIdentity {
  "provider": string;
  "refreshToken": string;
  "accessToken": string;
  "scope"?: string;
  "expiresIn"?: number;
  "updatedAt"?: string;
}

export interface GenAuthPartial {
  "userPoolId"?: string;
  "provider"?: string;
  "isSocial"?: boolean;
  "extIdpId"?: string;
  "userId"?: string;
  "origianlProfile"?: GenAuthObject10;
  "userIdInIdp"?: string;
  "type"?: string;
  "userInfoInIdp"?: GenAuthPartial2;
  "openid"?: string;
  "accessToken"?: string;
  "refreshToken"?: string;
  "syncIdentityProviderId"?: number;
  "originConnIds"?: (string)[];
  "id"?: string;
  "createdAt"?: string;
  "updatedAt"?: string;
}

export interface GenAuthIdentity {
  "userPoolId": string;
  "provider": string;
  "isSocial": boolean;
  "extIdpId": string;
  "userId": string;
  "origianlProfile": GenAuthObject10;
  "userIdInIdp": string;
  "type": string;
  "userInfoInIdp": GenAuthPartial2;
  "openid": string;
  "accessToken": string;
  "refreshToken": string;
  "syncIdentityProviderId": number;
  "originConnIds"?: (string)[];
  "id": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthObject4 {
  "identityId"?: string;
}

export interface GenAuthLastLoginRegion {
  "city": string;
  "province": string;
  "country": string;
}

export interface GenAuthRemoteLoginMfaConfig {
  "enable": boolean;
  "mfa": (string)[];
}

export interface GenAuthObject5 {
  "id": string;
  "name": string;
}

export interface GenAuthObject6 {
  "key": string;
  "value": string;
}

export interface GenAuthPaginatedDepartments {
  "list": (GenAuthUserDepartment)[];
  "totalCount": number;
}

export interface GenAuthRole {
  "userPoolId": string;
  "code": string;
  "description": string;
  "enDescription"?: string;
  "parentCode": string;
  "isSystem": boolean;
  "namespaceId": number;
  "namespace"?: string;
  "namespaceName"?: string;
  "name"?: string;
  "enName"?: string;
  "status": "ENABLE" | "DISABLE";
  "disableTime": number;
  "creatorId": string;
  "enablePermissionApply"?: boolean;
  "arn": string;
  "id": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthGroup {
  "userPoolId": string;
  "code": string;
  "name": string;
  "type": "static" | "dynamic";
  "description": string;
  "members"?: (GenAuthUser)[];
  "metadataSource"?: (GenAuthSystemModelMetadataSourceItem)[];
  "metadataRelation"?: Record<string, (string)[]>;
  "id": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthApplication {
  "userPoolId": string;
  "protocol": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "scim" | "db" | "asa" | "asad" | "http" | "ws-fed";
  "isOfficial": boolean;
  "isDeleted": boolean;
  "isDefault": boolean;
  "isDemo"?: boolean;
  "isTenantDefault"?: boolean;
  "isTenantConsole"?: boolean;
  "ssoMfaEnable"?: boolean;
  "name": string;
  "description": string;
  "whitelist": GenAuthRegisterWhiteList;
  "secret": string;
  "identifier": string;
  "jwks": GenAuthJSONWebKeySet2;
  "ssoPageCustomizationSettings": GenAuthISsoPageCustomizationSettings;
  "logo": string;
  "redirectUris": (string)[];
  "errorRedirectUrl": string;
  "logoutRedirectUris": (string)[];
  "initLoginUrl": string;
  "oidcProviderEnabled": boolean;
  "oauthProviderEnabled": boolean;
  "samlProviderEnabled": boolean;
  "casProviderEnabled": boolean;
  "wsFedProviderEnabled": boolean;
  "registerDisabled": boolean;
  "loginTabs": (string)[];
  "appVersion": number;
  "enabledPPRegisterValid": boolean;
  "enabledMailPwdRegisterValid"?: boolean;
  "passwordTabConfig": GenAuthApplicationPasswordTabConfig;
  "verifyCodeTabConfig": GenAuthApplicationVerifyCodeTabConfig;
  "authingOtpPushTabConfig": GenAuthAuthingOtpPushTabConfig;
  "defaultLoginTab": string;
  "registerTabs": ("email" | "emailCode" | "phone")[];
  "defaultRegisterTab": "email" | "emailCode" | "phone";
  "extendsFieldsEnabled": boolean;
  "extendsFields": (GenAuthInternalExtendsField | GenAuthUserExtendsField | GenAuthUserMetadataField)[];
  "complateFiledsPlace": (string)[];
  "skipComplateFileds": boolean;
  "newAccountByModifyUsername": boolean;
  "ext": unknown;
  "css": string;
  "cssEnabled": boolean;
  "qrcodeScanning"?: GenAuthApplicationQRCodeScanning;
  "appLoginStrategy"?: GenAuthAPPLoginStrategy;
  "oidcConfig": GenAuthOIDCConfig;
  "oidcJWEConfig": GenAuthIOidcJWEConfig;
  "samlConfig": GenAuthSamlIdpConfig;
  "wsFedConfig": GenAuthWsFedIdpConfig;
  "oauthConfig": GenAuthOauthIdpConfig;
  "casConfig": GenAuthCasIdPConfig;
  "asaConfig": GenAuthIAsaConfig;
  "asadConfig": GenAuthIAsadConfig;
  "showAuthorizationPage": boolean;
  "permissionStrategy": GenAuthApplicationConfig;
  "enableSubAccount": boolean;
  "enableDeviceMutualExclusion": boolean;
  "loginRequireEmailVerified": boolean;
  "agreementEnabled": boolean;
  "isIntegrate": boolean;
  "ssoEnabled": boolean;
  "ssoShowLaunchpad": boolean;
  "ssoOpenAt": string;
  "template": string;
  "skipMfa": boolean;
  "casExpireBaseBrowser": boolean;
  "isAsa": boolean;
  "appType": "INDIVIDUAL" | "TENANT" | "BOTH";
  "applicationType": "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  "applicationInvisibilityType": ("web" | "mobile")[];
  "mfaType"?: "simple" | "workflow";
  "guardVersion": "v1" | "v2";
  "customLoading": string;
  "loadingBackground": string;
  "customSecurityEnabled": boolean;
  "customWhitelistEnabled": boolean;
  "loginFailStrategy": string;
  "loginFailCheck"?: GenAuthLoginFailCheck;
  "loginPasswordFailCheck"?: GenAuthLoginPasswordFailCheck;
  "robotVerify": string;
  "robotVerifyLoginPasswordFailCheck"?: GenAuthRobotVerifyLoginPasswordFailCheck;
  "robotVerifyLoginIpWhitelistCheck"?: GenAuthRobotVerifyLoginIpWhitelistCheck;
  "robotVerifyLoginTimeCheckEnable": boolean;
  "robotVerifyloginWeekStartEndTime": (GenAuthLoginWeekStartEndTime)[];
  "loginSmsConfig": GenAuthSmsConfig;
  "registerSmsConfig": GenAuthSmsConfig;
  "forgetPasswordSmsConfig"?: GenAuthSmsConfig;
  "accountLock": string;
  "accountLockLoginPasswordFailCheck"?: GenAuthAccountLockLoginPasswordFailCheck;
  "frequentRegisterCheck"?: GenAuthRegisterFrequencyCheck;
  "emailVerifiedDefault": boolean;
  "customBrandingEnabled": boolean;
  "qrcodeLoginStrategy"?: GenAuthQRCodeLoginStrategy;
  "sendWelcomeEmail": boolean;
  "uploadedApn": boolean;
  "autoRegisterThenLogin": boolean;
  "enableCompletePassword": boolean;
  "enableLoginAccountSwitch": boolean;
  "enableGuardVersionSwitch": boolean;
  "resetPwdLoadingBackground": string;
  "resetPwdCustomLogo": string;
  "enableAppLogin": boolean;
  "enableFaceLogin": boolean;
  "enableFingerprintLogin": boolean;
  "passkeyEnabled": boolean;
  "livingAuthSortConfig": (string)[];
  "tabMethodsSortConfig": GenAuthApplicationTabMethodsSortConfig;
  "qrCodeSortConfig": GenAuthApplicationTabMethodsSortConfig;
  "adAndPasswordLoginMixedConfig"?: GenAuthAdAndPasswordLoginMixedConfig;
  "selfServiceCancellationSettings"?: GenAuthSelfServiceCancellationSettings;
  "selectPublicAccountsAfterLoggingInEnabled": boolean;
  "creator": string;
  "creatorName": string;
  "gateways": (string)[];
  "gatewayLoginSettings": GenAuthGatewayLoginConfig;
  "gatewayConsole": string;
  "gatewayId": string;
  "enablePermissionApply"?: boolean;
  "enabledAuthFlow"?: boolean;
  "defaultMfa"?: "SMS" | "EMAIL" | "OTP" | "FACE" | "FINGERPRINT" | "PASSKEY";
  "customSMSSettingsEnabled"?: boolean;
  "customSMSProvider"?: GenAuthCustomSMSProvider;
  "gumemEventConfig"?: GenAuthGUMemEventConfig;
  "resetPwdTipsConfig"?: GenAuthResetPasswordComponentI18nConfig;
  "noticePwdCustomLogo"?: string;
  "noticePwdTipsConfig"?: GenAuthUpdatePasswordComponentI18nConfig;
  "resetPwdLinkCustomLogo"?: string;
  "resetPwdLinkTipsConfig"?: GenAuthResetPasswordLinkComponentI18nConfig;
  "id": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthPost {
  "userPoolId": string;
  "name": string;
  "description": string;
  "code": string;
  "metadataSource"?: (GenAuthSystemModelMetadataSourceItem)[];
  "metadataRelation"?: Record<string, (string)[]>;
  "id": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface GenAuthObject7 {
  "message": string;
}

export interface GenAuthTargetItemDto {
  /** 目标对象ID */
  "id": string;
  /** 目标对象类型 */
  "type": string;
  /** 目标对象名称 */
  "name": string;
}

export interface GenAuthDateResourceItemDto {
  /** 数据权限资源ID */
  "resourceId": string;
  /** 数据权限名称 */
  "resourceName": string;
}

export interface GenAuthLoginFailCheckConfigDto {
  /** 是否开启登录失败次数限制。 */
  "enabled": boolean;
  /** 在一定时间周期内，对于同一个 IP，最多登录失败多少次后会触发安全策略。 */
  "limit": number;
  /** 限定周期时间长度，单位为秒。 */
  "timeInterval": number;
  /** 时间长度单位。Second/Minute/Hour/Day，仅仅做显示，timeInterval的单位还是秒 */
  "unit": string;
}

export interface GenAuthLoginPassowrdFailCheckConfigDto {
  /** 是否开启登录密码错误限制 */
  "enabled": boolean;
  /** 密码错误次数最大限制 */
  "limit": number;
  /** 限定周期时间长度，单位为秒。 */
  "timeInterval": number;
  /** 时间长度单位。Second/Minute/Hour/Day，仅仅做显示，timeInterval的单位还是秒 */
  "unit": string;
}

export interface GenAuthLoginIpWhitelistCheckConfigDto {
  /** 是否开启登录 ip 白名单验证 */
  "enabled": boolean;
  /** 人机验证 ip 白名单 */
  "ipWhitelist": string;
}

export interface GenAuthLoginWeekStartEndTimeCheckDto {
  /** 每天触发人机验证时间段开始，为相对于当天 0 点的时间戳，单位为毫秒 */
  "loginStartTime": number;
  /** 每天触发人机验证时间段结束，为相对于当天 0 点的时间戳，单位为毫秒 */
  "loginEndTime": number;
  /** 登录时间限制，周几限制，例如 "2,5,6,7" 代表 星期2,5,6,7会触发人机验证 */
  "loginWeek": string;
}

export interface GenAuthUserBasicInfo {
  "userId": string;
  /** 用于显示的用户名称 */
  "displayName"?: string;
  /** 用户头像 */
  "photo"?: string;
  /** 用户类型：1 个人用户，2 公共账号 */
  "usertype": "1" | "2";
}

export interface GenAuthDeviceBasicInfo {
  /** 设备记录 Id */
  "rawId": string;
  "deviceId": string;
  "deviceName": string;
}

export interface GenAuthAppBasicInfo {
  "appId": string;
  "appName": string;
  /** 是否是应用面版应用 */
  "isDefault": boolean;
  /** App Logo */
  "logo"?: string;
}

export interface GenAuthSyncTaskLarkClientConfig {
  /** 飞书应用 App ID */
  "app_id": string;
  /** 飞书应用 App Secret */
  "app_secret": string;
  /** 飞书事件订阅的 Encrypt Key，可以在飞书开放平台应用详情的「事件订阅」页面获取。如果你需要开启实时同步，此参数必填。 */
  "encrypt_key"?: string;
  /** 飞书事件订阅的 Verification Token，可以在飞书开放平台应用详情的「事件订阅」页面获取。如果你需要开启实时同步，此参数必填。 */
  "verification_token"?: string;
}

export interface GenAuthSyncTaskWechatworkClientConfig {
  /** 企业 ID（CorpId） */
  "corpID": string;
  /** 企业微信通讯录密钥 Secret */
  "secret": string;
  /** 通讯录事件同步 Token */
  "token": string;
  /** 通讯录事件同步 EncodingAESKey */
  "encodingAESKey": string;
  /** 代理地址 */
  "agentUrl": string;
}

export interface GenAuthSyncTaskDingtalkClientConfig {
  /** 企业 ID（CorpId） */
  "corpId": string;
  /** 钉钉应用的 AppKey */
  "appKey": string;
  /** 钉钉应用的 AppSecret */
  "appSecret": string;
  /** 加密 aes_key */
  "aes_key": string;
  /** 签名 token */
  "token": string;
}

export interface GenAuthSyncTaskMokaClientConfig {
  /** User Name */
  "userName": string;
  /** Ent Code */
  "entCode": string;
  /** Api Code Employee */
  "apiCode_employee": string;
  /** Api Code Department */
  "apiCode_department": string;
  /** Private Key */
  "privateKey": string;
}

export interface GenAuthSyncTaskScimClientConfig {
  /** Group Url */
  "org_url": string;
  /** User Url */
  "user_url": string;
  /** Token */
  "token": string;
  /** Root Department Id */
  "root_department_id": string;
  /** Parent Department */
  "parent_department": string;
  /** Department */
  "department": string;
}

export interface GenAuthSyncTaskActiveDirectoryClientConfig {
  /** 身份源唯一标志 */
  "syncIdentityProviderCode": string;
  /** Provisioning Ticket Url */
  "ticket_url": string;
}

export interface GenAuthSyncTaskLdapClientConfig {
  /** LDAP 链接 */
  "url": string;
  /** Bind DN */
  "bindDn": string;
  /** Bind DN 密码 */
  "bindCredentials": string;
  /** Users Base DN */
  "usersBaseDn": string;
  /** Groups Base Dn */
  "groupsBaseDn": string;
  /** 用户查询条件 */
  "userQueryCriteria": string;
  /** 部门查询条件 */
  "departmentQueryCriteria": string;
}

export interface GenAuthSyncTaskItalentClientConfig {
  /** Tenant Id */
  "tenant_id": string;
  /** App Key */
  "app_key": string;
  /** App Secret */
  "app_secret": string;
}

export interface GenAuthSyncTaskMaycurClientConfig {
  /** App Code */
  "app_code": string;
  /** App Secret */
  "app_secret": string;
  /** 登录域名 */
  "endpoint": string;
}

export interface GenAuthSyncTaskFxiaokeClientConfig {
  /** App Id */
  "appId": string;
  /** App Secret */
  "appSecret": string;
  /** Permanent Code */
  "permanentCode": string;
  /** Current Open User Id */
  "currentOpenUserId": string;
}

export interface GenAuthSyncTaskXiaoshouyiClientConfig {
  /** 销售易应用的 ClientId */
  "client_id": string;
  /** 销售易应用的 ClientSecret */
  "client_secret": string;
  /** 销售易应用的 UserName */
  "username": string;
  /** 销售易应用的 Password */
  "password": string;
}

export interface GenAuthSyncTaskKayangClientConfig {
  /** Endpoint */
  "endpoint": string;
  /** Account */
  "account": string;
  /** Password */
  "password": string;
}

export interface GenAuthPaginationDto2 {
  "page"?: number;
  "limit"?: number;
}

export interface GenAuthSimpleTenantDto {
  /** 租户 ID */
  "tenantId": string;
  /** 租户名称 */
  "name": string;
  /** 租户 Logo */
  "logo": string;
  /** 是否授权 */
  "enabled"?: boolean;
}

export interface GenAuthUserDto2 {
  "userId": string;
  "createdAt": string;
  "status": "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  "email"?: string;
  "phone"?: string;
  "phoneCountryCode"?: string;
  "username"?: string;
  "name"?: string;
  "nickname"?: string;
  "photo"?: string;
  "loginsCount"?: number;
  "lastLogin"?: string;
  "lastIp"?: string;
  "gender"?: "M" | "F" | "U";
  "emailVerified"?: boolean;
  "phoneVerified"?: boolean;
  "birthdate"?: string;
  "country"?: string;
  "province"?: string;
  "city"?: string;
  "address"?: string;
  "streetAddress"?: string;
  "postalCode"?: string;
  "externalId"?: string;
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: (string)[];
  /** 外部身份源 */
  "identities"?: (GenAuthIdentityDto2)[];
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: Record<string, unknown>;
}

export interface GenAuthObject8 {
  "data-novice-focus": string;
}

export interface GenAuthSortingDto {
  /** 进行排序的字段，可选值为： - `id`: 用户 id - `createdAt`: 创建时间 - `updatedAt`: 修改时间 - `email`: 邮箱 - `phone`: 手机号 - `username`: 用户名 - `externalId`: 外部 ID - `status`: 用户状态 - `statusChangedAt`: 状态修改时间 - `passwordLastSetAt`: 密码修改时间 - `loginsCount`: 登录次数 - `gender`: 性别 - `lastLogin`: 上次登录时间 - `userSourceType`: 用户注册来源 - `lastMfaTime`: 上次 MFA 认证时间 - `passwordSecurityLevel`: 密码安全等级 - `phoneCountryCode`: 手机区号 - `lastIp`: 上次登录时使用的 IP  */
  "field": "id" | "createdAt" | "updatedAt" | "email" | "username" | "externalId" | "phone" | "status" | "statusChangedAt" | "passwordLastSetAt" | "loginsCount" | "gender" | "lastLogin" | "userSourceType" | "lastMfaTime" | "passwordSecurityLevel" | "phoneCountryCode" | "lastIp";
  /** 排序顺序： - `desc`: 按照从大到小降序。 - `asc`: 按照从小到大升序。      */
  "order": "desc" | "asc";
}

export interface GenAuthSendCreateAccountNotificationDto {
  /** 创建账号之后，是否发送邮件通知 */
  "sendEmailNotification"?: boolean;
  /** 创建账号之后，是否发送短信通知 */
  "sendPhoneNotification"?: boolean;
  /** 发送登录地址时，指定的应用 id，会将此应用的登录地址发送给用户的邮箱或者手机号。默认为用户池应用面板的登录地址。 */
  "appId"?: string;
}

export interface GenAuthSendResetPasswordNotificationDto {
  /** 重置密码之后，是否发送用户默认邮件通知 */
  "sendDefaultEmailNotification"?: boolean;
  /** 重置密码之后，是否发送用户默认短信通知 */
  "sendDefaultPhoneNotification"?: boolean;
  /** 当用户密码修改之后，输入发送邮箱 */
  "inputSendEmailNotification"?: string;
  /** 当用户密码修改之后，输入发送手机号 */
  "inputSendPhoneNotification"?: string;
  /** 发送登录地址时，指定的应用 id，会将此应用的登录地址发送给用户的邮箱或者手机号。默认为用户池应用面板的登录地址。 */
  "appId"?: string;
}

export interface GenAuthOriginalProfile {
  "cooperatorRelation": [];
  "groupUser": [];
  "identities": [];
  "nodeMember": [];
  "policyAssignment": [];
  "roleAssignment": [];
  "subAccount": [];
  "udv": [];
}

export interface GenAuthImportOtpItemDataDto {
  /** OTP 密钥 */
  "secret": string;
  /** OTP Recovery Code */
  "recoveryCode"?: string;
}

export interface GenAuthAppValidateRule {
  "type": "None" | "regExp" | "phone" | "email" | "isNumber";
  "content": string;
  "error": string;
  "errorMessage": string;
  "i18n"?: unknown;
}

export interface GenAuthLangUnit {
  /** 是否已开启。若开启，且控制台选择该语言，则展示该内容。（默认关闭） */
  "enabled": boolean;
  /** 多语言内容 */
  "value"?: string;
}

export interface GenAuthJWKRSAKey {
  "kty": "RSA";
  "e": string;
  "n": string;
  "d"?: string;
  "p"?: string;
  "q"?: string;
  "dp"?: string;
  "dq"?: string;
  "qi"?: string;
  "x5c"?: (string)[];
  "x5t"?: string;
  "x5t#S256"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthJWKOKPKey {
  "kty": "OKP";
  "crv": "Ed25519" | "Ed448" | "X25519" | "X448";
  "x": string;
  "d"?: string;
  "x5c"?: (string)[];
  "x5t"?: string;
  "x5t#S256"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthJWKECKey {
  "kty": "EC";
  "crv": "P-256" | "secp256k1" | "P-384" | "P-521";
  "x": string;
  "y": string;
  "d"?: string;
  "x5c"?: (string)[];
  "x5t"?: string;
  "x5t#S256"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthJWKOctKey {
  "kty": "oct";
  "k"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthLanguageCoinfigGlobalDto {
  "showChangeLanguage": boolean;
  "defaultLanguage": string;
}

export interface GenAuthStrAuthorize {
  /** 字符串资源 Value */
  "value": string;
  /** 字符串资源操作列表 */
  "actions": (string)[];
}

export interface GenAuthArrayAuthorize {
  /** 数组资源 Value 列表 */
  "values": (string)[];
  /** 数组资源操作列表 */
  "actions": (string)[];
}

export interface GenAuthTreeAuthorize {
  /** 树资源授权列表 */
  "authList": (GenAuthTreeAuthBo)[];
}

export interface GenAuthStrAuthorize2 {
  /** 字符串资源 Value */
  "value": string;
  /** 字符串资源操作列表 */
  "actions": (string)[];
}

export interface GenAuthArrayAuthorize2 {
  /** 数组资源 Value 列表 */
  "values": (string)[];
  /** 数组资源操作列表 */
  "actions": (string)[];
}

export interface GenAuthTreeAuthorize2 {
  /** 树资源授权列表 */
  "authList": (GenAuthTreeAuthBo2)[];
}

export interface GenAuthObject9 {
  "id": string;
  "includeChild": boolean;
}

export interface GenAuthObject10 {
  "id": string;
}

export interface GenAuthPartial2 {
  "userPoolId"?: string;
  "isRoot"?: boolean;
  "status"?: "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  "workStatus"?: "Closed" | "Active";
  "statusChangedAt"?: string;
  "thirdPartyIdentity"?: GenAuthThirdPartyIdentity;
  "oauth"?: string;
  "email"?: string;
  "phone"?: string;
  "username"?: string;
  "unionid"?: string;
  "openid"?: string;
  "nickname"?: string;
  "company"?: string;
  "photo"?: string;
  "browser"?: string;
  "device"?: string;
  "password"?: string;
  "passwordLastSetAt"?: number;
  "salt"?: string;
  "token"?: string;
  "tokenExpiredAt"?: string;
  "loginsCount"?: number;
  "lastIp"?: string;
  "name"?: string;
  "givenName"?: string;
  "familyName"?: string;
  "middleName"?: string;
  "profile"?: string;
  "preferredUsername"?: string;
  "website"?: string;
  "gender"?: "M" | "F" | "U";
  "birthdate"?: string;
  "zoneinfo"?: string;
  "locale"?: string;
  "address"?: string;
  "formatted"?: string;
  "streetAddress"?: string;
  "locality"?: string;
  "region"?: string;
  "postalCode"?: string;
  "city"?: string;
  "province"?: string;
  "country"?: string;
  "registerSource"?: (string)[];
  "secretInfo"?: unknown;
  "emailVerified"?: boolean;
  "phoneVerified"?: boolean;
  "lastLogin"?: string;
  "lastLoginApp"?: string;
  "blocked"?: boolean;
  "isDeleted"?: boolean;
  "sendSmsCount"?: number;
  "sendSmsLimitCount"?: number;
  "encryptedPassword"?: string;
  "userSourceType"?: "excel" | "sync" | "register" | "adminCreated" | "universalInvitation" | "policyInvitation";
  "userSourceId"?: string;
  "customData"?: Record<string, unknown>;
  "customDataOnce"?: Record<string, unknown>;
  "idToken"?: Record<string, unknown>;
  "customAccessTokenClaims"?: Record<string, unknown>;
  "decryptedToken"?: Record<string, unknown>;
  "metaData"?: Record<string, unknown>;
  "excelRow"?: (unknown)[];
  "identities"?: (GenAuthPartial)[];
  "identity"?: GenAuthIdentity;
  "identitiesLinkedThisTime"?: (GenAuthPartial & GenAuthObject4)[];
  "federationIdentityId"?: string;
  "rawPassword"?: string;
  "userPasswordExpireTime"?: string;
  "arn"?: string;
  "signedUp"?: string;
  "externalId"?: string;
  "mainDepartmentId"?: string;
  "mainDepartmentCode"?: string;
  "lastMfaTime"?: string;
  "passwordSecurityLevel"?: number;
  "resetPasswordOnFirstLogin"?: boolean;
  "resetPasswordOnNextLogin"?: boolean;
  "resetedPassword"?: boolean;
  "syncExtInfo"?: Record<string, unknown>;
  "phoneCountryCode"?: string;
  "identityNumber"?: string;
  "mfaTriggerData"?: string;
  "lastLoginRegion"?: GenAuthLastLoginRegion;
  "usertype"?: "1" | "2";
  "remoteLoginMfaConfig"?: GenAuthRemoteLoginMfaConfig;
  "expiredAt"?: string;
  "directManagement"?: string;
  "displayName"?: string;
  "userIdInIdp"?: string;
  "accessToken"?: string;
  "refreshToken"?: string;
  "provider"?: "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5" | "aws-marketplace" | "quark";
  "recoveryCode"?: string;
  "positions"?: (GenAuthObject5)[];
  "lastIP"?: string;
  "udv"?: (GenAuthObject6)[];
  "metadata"?: Record<string, unknown>;
  "departments"?: GenAuthPaginatedDepartments;
  "departmentIds"?: (string)[];
  "tenantId"?: string;
  "tenantIds"?: (string)[];
  "newlyCreated"?: boolean;
  "lastLoginAppName"?: string;
  "lastLoginAppLogo"?: string;
  "userSource"?: string;
  "userSourceLogo"?: string;
  "hasPassword"?: boolean;
  "roles"?: (GenAuthRole)[];
  "groups"?: (GenAuthGroup)[];
  "apps"?: (GenAuthApplication)[];
  "postId"?: string;
  "postIdList"?: (string)[];
  "post"?: GenAuthPost;
  "posts"?: (GenAuthPost)[];
  "metadataSource"?: (GenAuthSystemModelMetadataSourceItem)[];
  "metadataRelation"?: Record<string, (string)[]>;
  "id"?: string;
  "createdAt"?: string;
  "updatedAt"?: string;
}

export interface GenAuthUserDepartment {
  "department": GenAuthNode;
  "isMainDepartment": boolean;
  "joinedAt"?: string;
}

export interface GenAuthRegisterWhiteList {
  "phoneEnabled": boolean;
  "emailEnabled": boolean;
  "usernameEnabled": boolean;
}

export interface GenAuthJSONWebKeySet2 {
  "keys": (GenAuthJWKRSAKey2 | GenAuthJWKOKPKey2 | GenAuthJWKECKey2 | GenAuthJWKOctKey2)[];
}

export interface GenAuthISsoPageCustomizationSettings {
  "hideIdp": boolean;
  "hideForgetPassword": boolean;
  "autoRegisterThenLogin"?: boolean;
  "hideSocialLogin": boolean;
  "hideLoginByPhoneCode"?: boolean;
  "hideRegister"?: boolean;
  "hideUserPasswordLogin"?: boolean;
  "hideWxMpScanLogin"?: boolean;
  "hideRegisterByPhone"?: boolean;
  "hideRegisterByEmail"?: boolean;
  "loginMethodsI18nDisplaySettings"?: GenAuthILoginMethodsI18nDisplaySettings;
  "idpLayout"?: GenAuthIdpConnLayoutSettings;
}

export interface GenAuthApplicationPasswordTabConfig {
  "enabledLoginMethods": (string)[];
  "validLoginMethods": (string)[];
  "validRegisterMethods": (string)[];
}

export interface GenAuthApplicationVerifyCodeTabConfig {
  "enabledLoginMethods": (string)[];
  "validLoginMethods": (string)[];
  "validRegisterMethods": (string)[];
}

export interface GenAuthAuthingOtpPushTabConfig {
  "enabledLoginMethods": (string)[];
  "validLoginMethods": (string)[];
  "validRegisterMethods": (string)[];
}

export interface GenAuthApplicationQRCodeScanning {
  "redirect"?: boolean;
  "interval"?: number;
}

export interface GenAuthAPPLoginStrategy {
  "expiresAfter"?: number;
  "expiresAfterUnit": string;
  "loginLimitSwitch": boolean;
  "loginLimitFrequency"?: number;
  "loginLimitFrequencyExpiresAfter"?: number;
  "loginLimitFrequencyExpiresAfterUnit": string;
}

export interface GenAuthIOidcJWEConfig {
  "enabled": boolean;
  "alg": "ECDH-ES" | "RSA-OAEP";
  "enc": "A128CBC-HS256" | "A128GCM" | "A256CBC-HS512" | "A256GCM";
  "publicKey": string;
}

export interface GenAuthWsFedIdpConfig {
  "enabled": boolean;
  "acs": string;
  "_acs": (GenAuthIWsFedEndpointConfig)[];
  "samlResponseSigningCert": string;
  "samlResponseSigningCertThumbprint": string;
  "samlResponseSigningKey": string;
  "lifetimeInSeconds": number;
  "digestAlgorithm": "http://www.w3.org/2000/09/xmldsig#sha1" | "http://www.w3.org/2001/04/xmlenc#sha256" | "http://www.w3.org/2001/04/xmlenc#sha512";
  "signatureAlgorithm": "http://www.w3.org/2000/09/xmldsig#rsa-sha1" | "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" | "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
  "audience": string;
  "customAttributes": (GenAuthIWsFedCustomAttribute)[];
}

export interface GenAuthIAsaConfig {
  "accountIdentifierFn": string;
  "startPage": string;
  "asaAutoSteps": (GenAuthAsaAutoFormStep)[];
  "createAccountSteps": (GenAuthAsaCreateAccStep)[];
}

export interface GenAuthIAsadConfig {
  "accountIdentifierFn": string;
  "startPage": string;
  "asadAutoSteps": (GenAuthAsadAutoFormStep)[];
  "createAccountSteps": (GenAuthAsadCreateAccStep)[];
}

export interface GenAuthApplicationConfig {
  "permissionType": "ALL" | "SUBJECT";
  "enabled": boolean;
  "defaultStrategy": "ALLOW_ALL" | "DENY_ALL";
  "allowPolicyId": string;
  "denyPolicyId": string;
}

export interface GenAuthLoginFailCheck {
  "timeInterval"?: number;
  "limit": number;
  "enabled": boolean;
  "unit": string;
}

export interface GenAuthLoginPasswordFailCheck {
  "timeInterval"?: number;
  "limit": number;
  "enabled": boolean;
}

export interface GenAuthRobotVerifyLoginPasswordFailCheck {
  "timeInterval"?: number;
  "limit": number;
  "enabled": boolean;
  "unit": string;
}

export interface GenAuthRobotVerifyLoginIpWhitelistCheck {
  "enabled": boolean;
  "ipWhitelist": string;
}

export interface GenAuthLoginWeekStartEndTime {
  "loginStartTime": number;
  "loginEndTime": number;
  "loginWeek": string;
}

export interface GenAuthSmsConfig {
  "robot": GenAuthSmsConfigItem;
  "limit": GenAuthSmsConfigItem;
}

export interface GenAuthAccountLockLoginPasswordFailCheck {
  "timeInterval"?: number;
  "limit": number;
  "enabled": boolean;
  "unit": string;
}

export interface GenAuthRegisterFrequencyCheck {
  "timeInterval": number;
  "limit": number;
  "enabled": boolean;
  "unit": string;
}

export interface GenAuthQRCodeLoginStrategy {
  "qrcodeExpiresAfter"?: number;
  "qrcodeExpiresAfterUnit": string;
  "returnFullUserInfo": boolean;
  "allowExchangeUserInfoFromBrowser": boolean;
  "ticketExpiresAfter"?: number;
  "ticketExpiresAfterUnit": string;
}

export interface GenAuthApplicationTabMethodsSortConfig {
  "loginMethodsSort": (string)[];
}

export interface GenAuthAdAndPasswordLoginMixedConfig {
  "showSettings": boolean;
  "enabled": boolean;
  "byPasswordMatch": boolean;
}

export interface GenAuthSelfServiceCancellationSettings {
  "cancellationEnabled"?: boolean;
}

export interface GenAuthGatewayLoginConfig {
  "targetAppURL"?: string;
  "hostHeader"?: "targetHost" | "proxyHost";
  "proxyHost"?: string;
  "loginPagePath"?: string;
  "logoutPagePath"?: string;
  "loginAPIsSetting"?: (GenAuthGatewayLoginAPIsConfig)[];
  "writeLocalStorages"?: (GenAuthObject11)[];
  "loginSuccessRedirectUrl"?: string;
  "routeIds"?: (string)[];
  "appIdInGateway"?: number;
  "needVisitLoginPageFirst"?: boolean;
  "forbiddenUrls"?: (GenAuthObject12)[];
  "enableForbiddenUrl"?: boolean;
}

export interface GenAuthCustomSMSProvider {
  "enabled": boolean;
  "provider": "custom" | "253" | "ali" | "tencent" | "huawei" | "aliInt" | "volcengine";
  "config": GenAuthSMSConfig253 | GenAuthSMSConfigAli | GenAuthSMSConfigAliInt | GenAuthSMSConfigHuawei | GenAuthSMSConfigCustom | GenAuthSMSConfigTencent;
}

export interface GenAuthGUMemEventConfig {
  "enabled"?: boolean;
  "apiKey"?: string;
}

export interface GenAuthResetPasswordComponentI18nConfig {
  "title": GenAuthI18nDisplay;
  "desc": GenAuthI18nDisplay;
}

export interface GenAuthUpdatePasswordComponentI18nConfig {
  "title": GenAuthI18nDisplay;
  "desc": GenAuthI18nDisplay;
}

export interface GenAuthResetPasswordLinkComponentI18nConfig {
  "title": GenAuthI18nDisplay;
  "desc"?: GenAuthI18nDisplay;
}

export interface GenAuthIdentityDto2 {
  /** Identity ID */
  "identityId": string;
  /** 外部身份源的 ID */
  "extIdpId": string;
  /** 外部身份源类型，如 lark, wechat */
  "provider": string;
  /** Identity 类型，如 unionid, openid, primary */
  "type": string;
  /** 在外部身份源的 id */
  "userIdInIdp": string;
}

export interface GenAuthTreeAuthBo {
  /** 树资源节点路径 */
  "nodePath": string;
  /** 树资源节点名称 */
  "nodeName": string;
  /** 树资源节点操作权限列表 */
  "nodeActions": (string)[];
  /** 树资源节点 Value */
  "nodeValue"?: string;
  /** 树资源节点扩展字段值 */
  "nodeExtendFieldValue"?: Record<string, unknown>;
}

export interface GenAuthTreeAuthBo2 {
  /** 树资源节点路径 */
  "nodePath": string;
  /** 树资源节点名称 */
  "nodeName": string;
  /** 树资源节点操作权限列表 */
  "nodeActions": (string)[];
  /** 树资源节点 Value */
  "nodeValue"?: string;
  /** 树资源节点扩展字段值 */
  "nodeExtendFieldValue"?: Record<string, unknown>;
}

export interface GenAuthJWKRSAKey2 {
  "kty": "RSA";
  "e": string;
  "n": string;
  "d"?: string;
  "p"?: string;
  "q"?: string;
  "dp"?: string;
  "dq"?: string;
  "qi"?: string;
  "x5c"?: (string)[];
  "x5t"?: string;
  "x5t#S256"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthJWKOKPKey2 {
  "kty": "OKP";
  "crv": "Ed25519" | "Ed448" | "X25519" | "X448";
  "x": string;
  "d"?: string;
  "x5c"?: (string)[];
  "x5t"?: string;
  "x5t#S256"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthJWKECKey2 {
  "kty": "EC";
  "crv": "P-256" | "secp256k1" | "P-384" | "P-521";
  "x": string;
  "y": string;
  "d"?: string;
  "x5c"?: (string)[];
  "x5t"?: string;
  "x5t#S256"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthJWKOctKey2 {
  "kty": "oct";
  "k"?: string;
  "alg"?: string;
  "use"?: "sig" | "enc";
  "kid"?: string;
  "key_ops"?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey")[];
}

export interface GenAuthILoginMethodsI18nDisplaySettings {
  "password": GenAuthPasswordMethodI18n;
  "verifyCode": GenAuthVerifyCodeMethodI18n;
  "ad": GenAuthADMethodI18n;
  "ldap": GenAuthLDAPMethodI18n;
}

export interface GenAuthIdpConnLayoutSettings {
  "maxConns": number;
  "customMoreI18n": GenAuthI18nDisplay;
  "topLastUsed": boolean;
}

export interface GenAuthIWsFedEndpointConfig {
  "url": string;
  "isDefault": boolean;
  "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" | "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" | "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact" | "urn:oasis:names:tc:SAML:2.0:bindings:SOAP" | "urn:oasis:names:tc:SAML:2.0:bindings:PAOS" | "urn:oasis:names:tc:SAML:1.0:bindings:SOAP-binding" | "urn:oasis:names:tc:SAML:2.0:bindings:URI";
}

export interface GenAuthIWsFedCustomAttribute {
  "attributeName": string;
  "attributeNamespace": string;
  "value": string;
}

export interface GenAuthAsaAutoFormStep {
  "action": "type" | "click" | "selectFrame";
  "target": string;
  "value"?: string;
}

export interface GenAuthAsaCreateAccStep {
  "requireEncryption": boolean;
  "label": string;
  "labelI18n": GenAuthRecord;
  "key": string;
  "placeholder": string;
  "placeholderI18n": GenAuthRecord;
  "type": "input" | "custom" | "password" | "radio" | "select" | "switch" | "textarea";
  "rules": (Record<string, unknown>)[];
}

export interface GenAuthAsadAutoFormStep {
  "action": "type" | "click" | "selectFrame";
  "target": string;
  "value"?: string;
}

export interface GenAuthAsadCreateAccStep {
  "requireEncryption": boolean;
  "label": string;
  "labelI18n": GenAuthRecord;
  "key": string;
  "placeholder": string;
  "placeholderI18n": GenAuthRecord;
  "type": "input" | "custom" | "password" | "radio" | "select" | "switch" | "textarea";
  "rules": (Record<string, unknown>)[];
}

export interface GenAuthSmsConfigItem {
  "switch": string;
  "durations": (Record<string, unknown>)[];
}

export interface GenAuthGatewayLoginAPIsConfig {
  "methods": "GET" | "POST" | "DELETE" | "PUT";
  "path": string;
  "params": Record<string, string>;
  "headers": Record<string, string>;
  "body": Record<string, string>;
}

export interface GenAuthObject11 {
  "key": string;
  "value": string;
}

export interface GenAuthObject12 {
  "url": string;
  "redirect_url"?: string;
}

export interface GenAuthSMSConfig253 {
  "sendSmsApi": string;
  "appId": string;
  "key": string;
  "template": string;
  "ttl": number;
}

export interface GenAuthSMSConfigAli {
  "SignName": string;
  "TemplateCode": string;
  "RegionId": string;
  "accessKeyId": string;
  "accessKeySecret": string;
  "ttl": number;
  "template": string;
}

export interface GenAuthSMSConfigAliInt {
  "From": string;
  "Message": string;
  "RegionId": string;
  "accessKeyId": string;
  "accessKeySecret": string;
  "ttl": number;
}

export interface GenAuthSMSConfigHuawei {
  "appKey": string;
  "appSecret": string;
  "endPoint": string;
  "passNumber": string;
  "templateId": string;
  "sign": string;
  "ttl": number;
}

export interface GenAuthSMSConfigCustom {
  "funcId": string;
  "ttl": string;
}

export interface GenAuthSMSConfigTencent {
  "Sign": string;
  "TemplateID": string;
  "region": string;
  "SmsSdkAppid": string;
  "secretKey": string;
  "secretId": string;
  "ttl": number;
  "templateEnableTtl": boolean;
  "scenarios": GenAuthSmsScenarioTemplateMapping;
}

export interface GenAuthI18nDisplay {
  "default": string;
  "i18n": GenAuthLangObject;
}

export interface GenAuthPasswordMethodI18n {
  "tab": GenAuthI18nDisplay;
}

export interface GenAuthVerifyCodeMethodI18n {
  "tab": GenAuthI18nDisplay;
}

export interface GenAuthADMethodI18n {
  "tab": GenAuthI18nDisplay;
}

export interface GenAuthLDAPMethodI18n {
  "tab": GenAuthI18nDisplay;
}

export interface GenAuthRecord {
  "zh-CN": unknown;
  "en-US": unknown;
  "zh-TW": unknown;
  "ja-JP": unknown;
}

export interface GenAuthSmsScenarioTemplateMapping {
  "verify-code": unknown;
  "first-login": unknown;
  "send-account-password": unknown;
  "invite-internal-admin": unknown;
  "invite-tenant-admin": unknown;
  "send-admin-reset-user-account-password": unknown;
  "remote-login-alarm-user": unknown;
  "remote-login-alarm-admin": unknown;
  "password-expire-remind": unknown;
}

export interface GenAuthSdkObject {
  /** 搜索岗位 code 或名称 * */
  "keywords"?: undefined | string;
  /** 是否统计岗位关联的部门数和用户数 * */
  "skipCount"?: undefined | false | true;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否展示元数据内容 * */
  "withMetadata"?: undefined | false | true;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否拍平扩展字段 * */
  "flatCustomData"?: undefined | false | true;
  /** 是否不显示 metadata 的 fieldId 字段 * */
  "metadataNoFieldId"?: undefined | false | true;
  /** 创建时间在此时间之后的岗位 * */
  "createdAfter"?: undefined | number;
  /** 创建时间在此时间之前的岗位 * */
  "createdBefore"?: undefined | number;
  /** 更新时间在此时间之后的岗位 * */
  "updatedAfter"?: undefined | number;
  /** 更新时间在此时间之前的岗位 * */
  "updatedBefore"?: undefined | number;
}

export interface GenAuthSdkPostPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkPostItemDto)[];
}

export interface GenAuthSdkListPostBatchDto {
  /** 搜索岗位 code 或名称 */
  "keywords"?: undefined | string;
  /** 是否统计岗位关联的部门数和用户数 */
  "skipCount"?: undefined | false | true;
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 是否展示元数据内容 */
  "withMetadata"?: undefined | false | true;
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: undefined | false | true;
  /** 是否不显示 metadata 的 fieldId 字段 */
  "metadataNoFieldId"?: undefined | false | true;
  /** 创建时间在此时间之后的岗位 */
  "createdAfter"?: undefined | number;
  /** 创建时间在此时间之前的岗位 */
  "createdBefore"?: undefined | number;
  /** 更新时间在此时间之后的岗位 */
  "updatedAfter"?: undefined | number;
  /** 更新时间在此时间之前的岗位 */
  "updatedBefore"?: undefined | number;
  /** 岗位 code 数组 */
  "postCodes"?: undefined | (string)[];
}

export interface GenAuthSdkObject2 {
  /** 岗位 code * */
  "code": string;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkCreatePostDto {
  /** 岗位 code */
  "code": string;
  /** 岗位名称 */
  "name": string;
  /** 岗位 ID */
  "id"?: undefined | string;
  /** 岗位描述 */
  "description"?: undefined | string;
  /** 部门 id 列表 */
  "departmentIdList"?: undefined | string;
}

export interface GenAuthSdkObject3 {
  /** 用户 id * */
  "userId": string;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkPostDto {
  /** 岗位 ID */
  "id"?: undefined | string;
  /** 岗位 code */
  "code": string;
  /** 岗位名称 */
  "name": string;
  /** 岗位描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkObject4 {
  /** 用户 id * */
  "userId": string;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkGetPostByIdListDto {
  /** 部门 id 列表 */
  "idList"?: undefined | string;
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkPostInfoDto {
  /** 岗位 ID */
  "id"?: undefined | string;
  /** 岗位 code */
  "code": string;
  /** 岗位名称 */
  "name": string;
  /** 岗位描述 */
  "description"?: undefined | string;
  /** 岗位关联部门数 */
  "departmentIdList": (string)[];
}

export interface GenAuthSdkRemovePostDto {
  /** 分组 code */
  "code": string;
}

export interface GenAuthSdkCommonResponseDto {
  /** 业务状态码，可以通过此状态码判断操作是否成功，200 表示成功。 */
  "statusCode": number;
  /** 描述信息 */
  "message": string;
  /** 细分错误码，可通过此错误码得到具体的错误类型（成功请求不返回）。详细错误码列表请见：[API Code 列表](https://api-explorer.authing.cn/?tag=group/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87#tag/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87/%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86/apiCode) */
  "apiCode"?: undefined | number;
  /** 请求 ID。当请求失败时会返回。 */
  "requestId"?: undefined | string;
}

export interface GenAuthSdkSetUserPostsDto {
  /** 岗位 id 列表 */
  "postIds": (string)[];
  /** 用户 id */
  "userId": string;
}

export interface GenAuthSdkUserConnectionPostDto {
  /** 用户 id */
  "userId": string;
  /** 部门 id */
  "postId": string;
}

export interface GenAuthSdkFilterDto {
  /** 功能 id */
  "modelId": string;
  /** 关键字 */
  "keywords"?: undefined | string;
  /** 多个搜索条件的关系： - and: 且 - or:  或 */
  "conjunction"?: undefined | string;
  /** 搜索条件 */
  "conditions"?: undefined | (GenAuthSdkCondition)[];
  /** 排序条件 */
  "sort"?: undefined | (unknown)[];
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 是否不分页返回所有（仅支持树形结构获取子节点的场景） */
  "fetchAll"?: undefined | false | true;
  /** 是否返回节点的全路径（仅支持树形结构） */
  "withPath"?: undefined | false | true;
  /** 返回结果中是否使用字段 id 作为 key */
  "showFieldId"?: undefined | false | true;
  /** 返回结果中是包含关联数据的预览（前三个） */
  "previewRelation"?: undefined | false | true;
  /** 是否返回关联数据的详细用户信息，当前只支持用户。 */
  "getRelationFieldDetail"?: undefined | false | true;
  /** 限定检索范围为被某个功能关联的部分 */
  "scope"?: undefined | GenAuthSdkScopeDto;
  /** 过滤指定关联数据 */
  "filterRelation"?: undefined | GenAuthSdkScopeDto;
  /** 获取对应关联数据的详细字段 */
  "expand"?: undefined | (GenAuthSdkExpand)[];
  /** 是否返回嵌套的关联数据 */
  "getNestData"?: undefined | false | true;
}

export interface GenAuthSdkFunctionModelValueListDto {
  /** 总行数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (unknown)[];
}

export interface GenAuthSdkObject5 {
  /** 功能 id * */
  "modelId": string;
  /** 行 id * */
  "rowId": string;
  /** 返回结果中是否使用字段 id 作为 key * */
  "showFieldId"?: undefined | string;
}

export interface GenAuthSdkRowDto {
  /** 行 id */
  "rowId": string;
  /** 单元格列表 */
  "cellList": (GenAuthSdkCellDto)[];
}

export interface GenAuthSdkObject6 {
  /** 功能 id * */
  "modelId": string;
  /** 字段 key * */
  "key": string;
  /** 字段值 * */
  "value": string;
  /** 返回结果中是否使用字段 id 作为 key * */
  "showFieldId"?: undefined | string;
}

export interface GenAuthSdkGetRowBatchDto {
  /** 行 id 列表 */
  "rowIds": (string)[];
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkCreateRowDto {
  /** 数据内容 */
  "data": unknown;
  /** 功能 id */
  "modelId": string;
  /** 自定义行 id，默认自动生成。最长只允许 32 位。 */
  "rowId"?: undefined | string;
}

export interface GenAuthSdkUpdateRowDto {
  /** 数据内容 */
  "data": unknown;
  /** 行 id */
  "rowId": string;
  /** 功能 id */
  "modelId": string;
  /** 响应中键是否为 FieldId */
  "showFieldId"?: undefined | false | true;
}

export interface GenAuthSdkRemoveRowDto {
  /** 行 id */
  "rowIdList": (string)[];
  /** 功能 id */
  "modelId": string;
  /** 如果当前行有子节点，是否递归删除，默认为 false。当为 false 时，如果有子节点，会提示错误。 */
  "recursive"?: undefined | false | true;
}

export interface GenAuthSdkCreateFunctionModelDto {
  /** 父级菜单 */
  "parentKey": string;
  /** 功能是否启用: - true: 启用 - false: 不启用 */
  "enable": null | false | true;
  /** 功能类型： - user: 用户 - post: 岗位 - group: 用户组 - ueba: ueba - department: 树状结构数据 - organization: 组织 - device: 设备 - custom: 自定义 */
  "type": "ueba" | "user" | "post" | "group" | "department" | "organization" | "device" | "device_rely" | "custom";
  /** 功能描述 */
  "description": null | string;
  /** 功能名称 */
  "name": string;
  /** 数据类型： - list: 列表类型数据 - tree: 树状结构数据 */
  "dataType"?: undefined | "list" | "tree";
}

export interface GenAuthSdkFunctionModelDto {
  /** 功能 id */
  "id": string;
  /** 用户池 id */
  "userPoolId": string;
  /** 功能名称 */
  "name": string;
  /** 功能描述 */
  "description": string;
  /** 数据类型： - list: 列表类型数据。 - tree: 树状结构数据。 */
  "dataType": "list" | "tree";
  /** 功能是否启用: - true: 启用 - false: 不启用 */
  "enable": boolean;
  /** 父级菜单 */
  "parentKey": string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 功能类型： - user: 用户 - post: 岗位 - group: 用户组 - ueba: ueba - department: 树状结构数据 - organization: 组织 - device: 设备 - device_rely: 设备 - custom: 自定义 */
  "type": "ueba" | "user" | "post" | "group" | "department" | "organization" | "device" | "device_rely" | "custom";
  /** 字段排序 */
  "fieldOrder": string;
  /** 详情页配置 */
  "config": unknown;
}

export interface GenAuthSdkObject7 {
  /** 功能 id 可以从控制台页面获取 * */
  "id": string;
}

export interface GenAuthSdkFunctionModelListDto {
  /** 业务状态码，可以通过此状态码判断操作是否成功，200 表示成功。 */
  "statusCode": number;
  /** 描述信息 */
  "message": string;
  /** 细分错误码，可通过此错误码得到具体的错误类型（成功请求不返回）。详细错误码列表请见：[API Code 列表](https://api-explorer.authing.cn/?tag=group/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87#tag/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87/%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86/apiCode) */
  "apiCode"?: undefined | number;
  /** 请求 ID。当请求失败时会返回。 */
  "requestId"?: undefined | string;
  /** 响应数据 */
  "list": (GenAuthSdkFunctionModelDto)[];
}

export interface GenAuthSdkFunctionModelIdDto {
  /** 功能 id 可以从控制台页面获取 */
  "id": string;
}

export interface GenAuthSdkUpdateFunctionModelDto {
  /** 展示字段 key */
  "showFieldKey": string;
  /** 详情页配置 */
  "config": unknown;
  /** 字段序 */
  "fieldOrder": string;
  /** 功能类型 */
  "type": "ueba" | "user" | "post" | "group" | "department" | "organization" | "device" | "device_rely" | "custom";
  /** 父级菜单 */
  "parentKey": string;
  /** 功能是否启用 */
  "enable": boolean;
  /** 功能描述 */
  "description": null | string;
  /** 功能名称 */
  "name": string;
  /** 功能 id */
  "id": string;
}

export interface GenAuthSdkCreateFunctionModelFieldDto {
  /** 用户中心是否显示，仅在 user 模块下有意义: - true: 用户中心展示 - false: 用户中心不展示 */
  "userVisible": boolean;
  /** 关联数据可选范围 */
  "relationOptionalRange": GenAuthSdkCondition;
  /** 关联数据要展示的属性 */
  "relationShowKey": string;
  /** 关联关系是否为 1-N: - true: 是 1-N 的关系 - false: 不是 1-N 的关系 */
  "relationMultiple": boolean;
  /** 关联类型 */
  "relationType": string;
  /** 是否可用于登录，仅在 user 模块下有意义: - true: 用于登录 - false: 不用于登录 */
  "forLogin": boolean;
  /** 是否支持模糊搜索: - true: 支持模糊搜索 - false: 不支持模糊搜索 */
  "fuzzySearch": boolean;
  /** 下拉菜单选项 */
  "dropDown": GenAuthSdkDropDownItemDto;
  /** 前端格式化显示规则: */
  "format": number;
  /** 字符串的校验匹配规则 */
  "regexp": string;
  /** 如果类型是数字表示数字下限，如果类型是日期表示开始日期 */
  "min": number;
  /** 如果类型是数字表示数字上限，如果类型是日期表示结束日期 */
  "max": number;
  /** 字符串长度限制 */
  "maxLength": number;
  /** 是否唯一: - true: 唯一 - false: 不唯一 */
  "unique": boolean;
  /** 是否必填: - true: 必填 - false: 不必填 */
  "require": boolean;
  /** 默认值 */
  "default": unknown;
  /** 帮助说明 */
  "help": string;
  /** 是否可编辑: - true: 可编辑 - false: 不可编辑 */
  "editable": boolean;
  /** 是否展示: - true: 展示 - false: 不展示 */
  "show": boolean;
  /** 字段类型: - 1: 单行文本 - 2: 多行文本 - 3: 数字 - 4: 布尔类型 - 5: 日期 - 6: 枚举 - 7: 关联类型 - 8: 反向关联数据展示 */
  "type": "Text" | "Textarea" | "Number" | "Boolean" | "Date" | "Enum" | "Relation" | "ReverseRelation" | "Array";
  /** 字段属性名 */
  "key": string;
  /** 字段名称 */
  "name": string;
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkFunctionModelFieldDto {
  /** 字段 id */
  "id": string;
  /** 功能 id */
  "modelId": string;
  /** 字段名称 */
  "name": string;
  /** 字段属性名 */
  "key": string;
  /** 字段类型: - 1: 单行文本 - 2: 多行文本 - 3: 数字 - 4: 布尔类型 - 5: 日期 - 6: 枚举 - 7: 关联类型 - 8: 反向关联数据展示 */
  "type": number;
  /** 是否展示: - true: 展示 - false: 不展示 */
  "show": boolean;
  /** 是否可编辑: - true: 可编辑 - false: 不可编辑 */
  "editable": boolean;
  /** 帮助说明 */
  "help": string;
  /** 默认值 */
  "default": string;
  /** 是否必填: - true: 必填 - false: 不必填 */
  "require": boolean;
  /** 是否唯一: - true: 唯一 - false: 不唯一 */
  "unique": boolean;
  /** 字符串长度限制 */
  "maxLength": number;
  /** 如果类型是数字表示数字上限，如果类型是日期表示结束日期 */
  "max": number;
  /** 如果类型是数字表示数字下限，如果类型是日期表示开始日期 */
  "min": number;
  /** 字符串的校验匹配规则 */
  "regexp": string;
  /** 前端格式化显示规则: */
  "format": number;
  /** 下拉菜单选项 */
  "dropDown": number;
  /** 关联数据要展示的属性 */
  "relationType": string;
  /** 关联关系是否为 1-N: - true: 是 1-N 的关系 - false: 不是 1-N 的关系 */
  "relationMultiple": boolean;
  /** 关联数据要展示的属性 */
  "relationShowKey": string;
  /** 关联数据可选范围 */
  "relationOptionalRange": GenAuthSdkRelationOptionalRange;
  /** 用户中心是否显示，仅在 user 模块下有意义: - true: 用户中心展示 - false: 用户中心不展示 */
  "userVisible": boolean;
}

export interface GenAuthSdkUpdateFunctionModelFieldDto {
  /** 用户中心是否显示，仅在 user 模块下有意义: - true: 用户中心展示 - false: 用户中心不展示 */
  "userVisible": boolean;
  /** 关联数据可选范围 */
  "relationOptionalRange": GenAuthSdkRelationOptionalRange;
  /** 关联数据要展示的属性 */
  "relationShowKey": string;
  /** 是否可用于登录，仅在 user 模块下有意义: - true: 用于登录 - false: 不用于登录 */
  "forLogin": boolean;
  /** 是否支持模糊搜索: - true: 支持模糊搜索 - false: 不支持模糊搜索 */
  "fuzzySearch": boolean;
  /** 下拉菜单选项 */
  "dropDown": (string)[];
  /** 前端格式化规则 */
  "format": number;
  /** 字符串的校验匹配规则 */
  "regexp": string;
  /** 如果类型是数字表示数字下限，如果类型是日期表示开始日期 */
  "min": number;
  /** 如果类型是数字表示数字上限，如果类型是日期表示结束日期 */
  "max": number;
  /** 字符串长度限制 */
  "maxLength": number;
  /** 是否唯一: - true: 唯一 - false: 不唯一 */
  "unique": boolean;
  /** 是否必填: - true: 必填 - false: 不必填 */
  "require": boolean;
  /** 默认值 */
  "default": unknown;
  /** 帮助说明 */
  "help": string;
  /** 是否可编辑: - true: 可编辑 - false: 不可编辑 */
  "editable": boolean;
  /** 是否展示: - true: 展示 - false: 不展示 */
  "show": boolean;
  /** 字段名称 */
  "name": string;
  /** 功能 id */
  "modelId": string;
  /** 字段 id */
  "id": string;
}

export interface GenAuthSdkFunctionModelFieldIdDto {
  /** 功能 id */
  "modelId": string;
  /** 功能字段 id */
  "id": string;
}

export interface GenAuthSdkObject8 {
  /** 功能 id * */
  "modelId": string;
  /** 请求来源 * */
  "from": string;
}

export interface GenAuthSdkExportModelDto {
  /** 导出范围 */
  "idList": (string)[];
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkImportModelDto {
  /** 导入的 excel 文件地址 */
  "file": string;
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkObject9 {
  /** 功能 id * */
  "modelId": string;
}

export interface GenAuthSdkCreateOperateModelDto {
  /** 是否展示: - true: 展示 - true: 不展示 */
  "show": boolean;
  /** 图标 */
  "icon": string;
  /** 操作配置 */
  "config": unknown;
  /** 操作名称 */
  "operateName": string;
  /** 操作类型: - openPage: 打开一个网页 */
  "operateKey": string;
  /** modelId */
  "modelId": string;
}

export interface GenAuthSdkFunctionModelOperateIdDto {
  /** 执行时自定义参数 */
  "customConfig": unknown;
  /** 功能 id */
  "modelId": string;
  /** 自定义操作 id */
  "id": string;
  /** 字段 id */
  "fieldId"?: undefined | string;
}

export interface GenAuthSdkObject10 {
  /** model Id * */
  "modelId": string;
  /** 搜索功能名称 * */
  "keywords"?: undefined | string;
  /** 关联字段 id * */
  "fieldId"?: undefined | string;
  /** 是否返回用户创建的操作，仅在传了 fieldId 时有效 * */
  "showCreated"?: undefined | string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkOperateModelDto {
  /** 操作 id */
  "id": string;
  /** 用户池 id */
  "userPoolId": string;
  /** 功能 id */
  "modelId": string;
  /** 操作名称 */
  "operateName": string;
  /** 操作方法 key */
  "operateKey": string;
  /** 是否展示: - true: 展示 - false: 不展示 */
  "show": boolean;
  /** 是否为默认操作: - true 是默认操作 - fasle 不是默认操作 */
  "isDefault": boolean;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkObject11 {
  /** model Id * */
  "modelId": string;
}

export interface GenAuthSdkUpdateOperateModelDto {
  /** 图标 */
  "icon": string;
  /** 操作配置 */
  "config": unknown;
  /** 操作名称 */
  "operateName": string;
  /** 操作 Key 值 */
  "operateKey": string;
  /** 是否展示: - true: 展示 - true: 不展示 */
  "show": boolean;
  /** modelId */
  "modelId": string;
  /** id */
  "id": string;
  /** 关联字段 id */
  "fieldId"?: undefined | string;
}

export interface GenAuthSdkGetRelationInfoDto {
  /** 关联 id 列表 */
  "idList": (string)[];
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkCreateRelationValueDto {
  /** 关联数据 */
  "valueList": (string)[];
  /** 行 id */
  "rowId": string;
  /** 字段 id */
  "fieldId": string;
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkObject12 {
  /** 功能 id * */
  "modelId": string;
  /** 字段 id * */
  "fieldId": string;
  /** 行 id * */
  "rowId": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkRelationValueListDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (string)[];
}

export interface GenAuthSdkRemoveRelationValueDto {
  /** 关联数据 */
  "value": string;
  /** 字段 id */
  "fieldIds": (string)[];
  /** 行 id */
  "rowId": string;
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkExportMetadataDto {
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkImportMetadataDto {
  /** 导入的 json 文件地址 */
  "file": string;
}

export interface GenAuthSdkGetAllRowDto {
  /** 功能 id */
  "modelId": string;
  /** 多个搜索条件的关系： - and: 且 - or:  或 */
  "conjunction"?: undefined | string;
  /** 搜索条件 */
  "conditions"?: undefined | (GenAuthSdkCondition)[];
}

export interface GenAuthSdkRelationSearchDto {
  /** 关联字段 id */
  "fieldId": string;
  /** 功能 id */
  "modelId": string;
  /** 关键字 */
  "keywords"?: undefined | string;
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 返回结果中是否使用字段 id 作为 key */
  "showFieldId"?: undefined | false | true;
}

export interface GenAuthSdkCopyRowRelationDto {
  /** 复制后关联的行 id */
  "relationRowId": string;
  /** 被复制的行 id */
  "rowId": string;
  /** 功能 id */
  "modelId": string;
}

export interface GenAuthSdkGetAllRowVyScrollidDto {
  /** 每次获取数据的数量 默认 500，最多 5000 */
  "size": number;
  /** 功能 id */
  "modelId": string;
  /** 分页查询滚动 id */
  "scrollId"?: undefined | string;
  /** 查询的数据 id */
  "id"?: undefined | string;
  /** 根据特定字段查询数据 */
  "query"?: unknown;
  /** 是否返回关联字段详情 默认 false */
  "getRelationDetails"?: undefined | false | true;
}

export interface GenAuthSdkGetAllRowByScrollidDto {
  /** 分页查询 scrollId */
  "scrollId": string;
  /** 响应数据 */
  "list": (string)[];
}

export interface GenAuthSdkMetadataGroupDto {
  /** 群组 id */
  "groupId": string;
  /** 关键字 */
  "keyword"?: undefined | string;
  /** 排序条件 */
  "sort"?: undefined | (unknown)[];
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 是否返回嵌套的关联数据 */
  "getNestData"?: undefined | false | true;
}

export interface GenAuthSdkCreateUEBADto {
  /** 数据内容 */
  "data": unknown;
  /** 功能 id，如果不存在则会使用数据库中查到的第一个 type 为 ueba 的功能 */
  "modelId"?: undefined | string;
}

export interface GenAuthSdkDeleteTerminalUserDto {
  /** 用户 ID */
  "userId": string;
  /** 数据行 id，创建设备时返回的 `id` */
  "id": string;
}

export interface GenAuthSdkSuspendTerminalUserDto {
  /** 挂起到期时间，时间戳(毫秒) */
  "endTime": string;
  /** 用户 ID */
  "userId": string;
  /** 数据行 id，创建设备时返回的 `id` */
  "id": string;
}

export interface GenAuthSdkUpdateTerminalUserDto {
  /** 数据行 id，创建设备时返回的 `id` */
  "id": string;
  /** 用户 ID */
  "userId": string;
}

export interface GenAuthSdkTerminalBaseDto {
  /** 数据行 id，创建设备时返回的 `id` */
  "id": string;
}

export interface GenAuthSdkDeviceStatusResponseDataDto {
  /** 设备状态: - `activated`: 使用中 - `suspended`: 挂起 - `deactivated`: 停用 */
  "status": "activated" | "suspended" | "deactivated";
  /** 设备挂起时的剩余秒数 */
  "diffTime"?: undefined | number;
}

export interface GenAuthSdkListPublicAccountsRequestDto {
  /** 模糊搜索关键字 */
  "keywords"?: undefined | string;
  /** 高级搜索 */
  "advancedFilter"?: undefined | (GenAuthSdkListPublicAccountsAdvancedFilterItemDto)[];
  /** 使用 ES 查询语句执行搜索命令 */
  "searchQuery"?: unknown;
  /** 可选项 */
  "options"?: undefined | GenAuthSdkListPublicAccountsOptionsDto;
}

export interface GenAuthSdkPublicAccountPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkPublicAccountDto)[];
}

export interface GenAuthSdkObject13 {
  /** 公共账号用户 ID * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
}

export interface GenAuthSdkPublicAccountDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 账户当前状态： - Activated: 正常状态 - Suspended: 已停用 - Deactivated: 已禁用 - Resigned: 已离职 - Archived: 已归档 */
  "status": "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 账户当前工作状态 */
  "workStatus": "Closed" | "Active";
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 历史总登录次数 */
  "loginsCount"?: undefined | number;
  /** 上次登录时间 */
  "lastLogin"?: undefined | string;
  /** 上次登录 IP */
  "lastIp"?: undefined | string;
  /** 性别: - `M`: 男性，`male` - `F`: 女性，`female` - `U`: 未知，`unknown` */
  "gender": "M" | "F" | "U";
  /** 邮箱是否验证 */
  "emailVerified": boolean;
  /** 手机号是否验证 */
  "phoneVerified": boolean;
  /** 用户上次密码修改时间 */
  "passwordLastSetAt"?: undefined | string;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 来源类型: - `excel`: 通过 excel 导入 - `register`: 用户自主注册 - `adminCreated`: 管理员后台手动创建（包含使用管理 API 创建用户 ） - `syncTask`: 同步中心的同步任务 */
  "userSourceType": "excel" | "register" | "adminCreated" | "sync";
  /** 应用 ID 或者同步任务 ID */
  "userSourceId"?: undefined | string;
  /** 用户上次登录的应用 ID */
  "lastLoginApp"?: undefined | string;
  /** 用户主部门 ID */
  "mainDepartmentId"?: undefined | string;
  /** 用户上次进行 MFA 认证的时间 */
  "lastMfaTime"?: undefined | string;
  /** 用户密码安全强度等级 */
  "passwordSecurityLevel"?: undefined | number;
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: undefined | false | true;
  /** 注册方式 */
  "registerSource"?: undefined | (string)[];
  /** 公共账号所属部门 ID 列表 */
  "departmentIds"?: undefined | (string)[];
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 公共账号的扩展字段数据 */
  "customData"?: unknown;
  /** 公共账号状态上次修改时间 */
  "statusChangedAt"?: undefined | string;
  /** 用户租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject14 {
  /** 公共账号用户 ID 数组 * */
  "userIds": (string)[];
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
}

export interface GenAuthSdkCreatePublicAccountReqDto {
  /** 账户当前状态 */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 邮箱是否验证 */
  "emailVerified"?: undefined | false | true;
  /** 手机号是否验证 */
  "phoneVerified"?: undefined | false | true;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 加密用户密码的盐 */
  "salt"?: undefined | string;
  /** 公共账号的 OTP 验证器 */
  "otp"?: undefined | GenAuthSdkCreatePublicAccountOtpDto;
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: undefined | (string)[];
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkCreatePublicAccountOptionsDto;
}

export interface GenAuthSdkCreatePublicAccountBatchReqDto {
  /** 公共账号列表 */
  "list": (GenAuthSdkCreatePublicAccountReqDto)[];
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkCreatePublicAccountOptionsDto;
}

export interface GenAuthSdkUpdatePublicAccountReqDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 账户当前状态 */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱是否验证 */
  "emailVerified"?: undefined | false | true;
  /** 手机号是否验证 */
  "phoneVerified"?: undefined | false | true;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkUpdatePublicAccountOptionsDto;
}

export interface GenAuthSdkUpdatePublicAccountBatchReqDto {
  /** 公共账号列表 */
  "list": (GenAuthSdkUpdatePublicAccountInfoDto)[];
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkUpdatePublicAccountBatchOptionsDto;
}

export interface GenAuthSdkDeletePublicAccountsBatchDto {
  /** 公共账号用户 ID 列表 */
  "userIds": (string)[];
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkDeletePublicAccountsBatchOptionsDto;
}

export interface GenAuthSdkIsSuccessDto {
  /** 操作是否成功 */
  "success": boolean;
}

export interface GenAuthSdkKickPublicAccountsDto {
  /** APP ID 列表 */
  "appIds": (string)[];
  /** 公共账号 ID */
  "userId": string;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkKickPublicAccountsOptionsDto;
}

export interface GenAuthSdkCreatePublicAccountFromUserDto {
  /** 公共账号 rowId */
  "userId": string;
}

export interface GenAuthSdkObject15 {
  /** 用户 ID * */
  "userId": string;
}

export interface GenAuthSdkObject16 {
  /** 公共账号 ID * */
  "publicAccountId": string;
}

export interface GenAuthSdkSetPublicAccountBatchReqDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "publicAccountId": string;
  /** 用户 ID 数组 */
  "userIds": (string)[];
}

export interface GenAuthSdkSetUserOfPublicAccountBatchReqDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 用户 ID 数组 */
  "publicAccountIds": (string)[];
}

export interface GenAuthSdkUnbindPublicAccountBatchReqDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "publicAccountId": string;
}

export interface GenAuthSdkObject17 {
  /** 组织 Code（organizationCode） * */
  "organizationCode": string;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 部门信息 * */
  "withPost"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkOrganizationDto {
  /** 组织 code */
  "organizationCode": string;
  /** 组织名称 */
  "organizationName": string;
  /** 组织描述信息 */
  "description"?: undefined | string;
  /** 创建时间 */
  "createdAt"?: undefined | string;
  /** 修改时间 */
  "updatedAt"?: undefined | string;
  /** 根节点 ID */
  "departmentId": string;
  /** 根节点自定义 ID */
  "openDepartmentId"?: undefined | string;
  /** 是否包含子节点 */
  "hasChildren": boolean;
  /** 部门负责人 ID */
  "leaderUserIds"?: undefined | (string)[];
  /** 部门人数 */
  "membersCount": number;
  /** 是否是虚拟部门 */
  "isVirtualNode": boolean;
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkOrganizationNameI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: unknown;
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 岗位 id 列表 */
  "postIdList"?: undefined | (string)[];
  /** 状态 */
  "status"?: undefined | string;
  /** 访问限制 */
  "allow"?: undefined | string;
}

export interface GenAuthSdkObject18 {
  /** 组织 Code（organizationCode）列表 * */
  "organizationCodeList": (string)[];
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 部门信息 * */
  "withPost"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject19 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 拉取所有 * */
  "fetchAll"?: undefined | false | true;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 部门信息 * */
  "withPost"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 组织的状态 * */
  "status"?: undefined | false | true;
}

export interface GenAuthSdkOrganizationPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkOrganizationDto)[];
}

export interface GenAuthSdkCreateOrganizationReqDto {
  /** 元数据信息 */
  "metadata": unknown;
  /** 组织名称 */
  "organizationName": string;
  /** 组织 code */
  "organizationCode": string;
  /** 组织描述信息 */
  "description"?: undefined | string;
  /** 根节点自定义 ID */
  "openDepartmentId"?: undefined | string;
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkOrganizationNameI18nDto;
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 岗位 id 列表 */
  "postIdList"?: undefined | (string)[];
}

export interface GenAuthSdkUpdateOrganizationReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门描述 */
  "description"?: undefined | string;
  /** 根节点自定义 ID */
  "openDepartmentId"?: undefined | string;
  /** 部门负责人 ID */
  "leaderUserIds"?: undefined | (string)[];
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkOrganizationNameI18nDto;
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 新组织 code */
  "organizationNewCode"?: undefined | string;
  /** 组织名称 */
  "organizationName"?: undefined | string;
  /** 岗位 id 列表 */
  "postIdList"?: undefined | (string)[];
}

export interface GenAuthSdkDeleteOrganizationReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject20 {
  /** 搜索关键词，如组织机构名称 * */
  "keywords": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkUpdateOrganizationStatusReqDto {
  /** 组织 id */
  "rootNodeId": string;
  /** 状态 */
  "status"?: undefined | string;
}

export interface GenAuthSdkObject21 {
  /** 组织 code * */
  "organizationCode"?: undefined | string;
  /** 部门 ID，根部门传 `root`。departmentId 和 departmentCode 必传其一。 * */
  "departmentId"?: undefined | string;
  /** 部门 code。departmentId 和 departmentCode 必传其一。 * */
  "departmentCode"?: undefined | string;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否拍平扩展字段 * */
  "flatCustomData"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkDepartmentDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 部门创建时间 */
  "createdAt": string;
  /** 修改时间 */
  "updatedAt"?: undefined | string;
  /** 自定义部门 ID，用于存储自定义的 ID */
  "openDepartmentId"?: undefined | string;
  /** 部门名称 */
  "name": string;
  /** 部门负责人 ID */
  "leaderUserIds"?: undefined | (string)[];
  /** 部门描述 */
  "description"?: undefined | string;
  /** 父部门 id，如果是根部门，传 root */
  "parentDepartmentId": string;
  /** 部门识别码 */
  "code"?: undefined | string;
  /** 父部门 code */
  "parentDepartmentCode": string;
  /** 部门人数（仅包含直属成员） */
  "membersCount": number;
  /** 是否包含子部门 */
  "hasChildren": boolean;
  /** 是否是虚拟部门 */
  "isVirtualNode"?: undefined | false | true;
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkDepartmentI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: unknown;
  /** 部门关联的岗位 */
  "posts"?: undefined | (string)[];
  /** 岗位 id 列表 */
  "postIdList"?: undefined | (string)[];
  /** 部门状态 */
  "status"?: undefined | false | true;
  /** 访问限制 */
  "allow"?: undefined | string;
}

export interface GenAuthSdkGetDepartmentByIdReqDto {
  /** 部门 ID */
  "departmentId": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 应用类型列表 */
  "appTypeList"?: undefined | (string)[];
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkCreateDepartmentReqDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门名称 */
  "name": string;
  /** 父部门 id，如果是根部门，传 root */
  "parentDepartmentId": string;
  /** 元数据信息 */
  "metadata": unknown;
  /** 自定义部门 ID，用于存储自定义的 ID */
  "openDepartmentId"?: undefined | string;
  /** 部门描述 */
  "description"?: undefined | string;
  /** 部门识别码 */
  "code"?: undefined | string;
  /** 是否是虚拟部门 */
  "isVirtualNode"?: undefined | false | true;
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkDepartmentI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: unknown;
  /** 此次调用中使用的父部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 岗位 id 列表 */
  "postIdList"?: undefined | (string)[];
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkUpdateDepartmentReqDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 元数据信息 */
  "metadata": unknown;
  /** 部门负责人 ID */
  "leaderUserIds"?: undefined | (string)[];
  /** 部门描述 */
  "description"?: undefined | string;
  /** 部门识别码 */
  "code"?: undefined | string;
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkDepartmentI18nDto;
  /** 部门状态 */
  "status"?: undefined | false | true;
  /** 部门名称 */
  "name"?: undefined | string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 父部门 id，如果是根部门，传 root */
  "parentDepartmentId"?: undefined | string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
  /** 岗位 id 列表 */
  "postIdList"?: undefined | (string)[];
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkDeleteDepartmentReqDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkSearchDepartmentsReqDto {
  /** 搜索关键词，如组织名称等 */
  "keywords": string;
  /** 组织 code */
  "organizationCode": string;
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkSearchDepartmentsListReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 部门信息 */
  "withPost"?: undefined | false | true;
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 高级搜索 */
  "advancedFilter"?: undefined | (GenAuthSdkSearchDepartmentsFilterItemDto)[];
  /** 排序依据，如 更新时间或创建时间 */
  "sortBy"?: undefined | "updatedAt" | "createdAt";
  /** 增序或降序 */
  "orderBy"?: undefined | "ASC" | "DESC";
  /** 排序设置，可以设置多项按照多个字段进行排序 */
  "sort"?: undefined | (GenAuthSdkDepartmentSortingDto)[];
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject22 {
  /** 组织 code * */
  "organizationCode": string;
  /** 需要获取的部门 ID * */
  "departmentId": string;
  /** 部门的状态 * */
  "status"?: undefined | false | true;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 是否要排除虚拟组织 * */
  "excludeVirtualNode"?: undefined | false | true;
  /** 是否只包含虚拟组织 * */
  "onlyVirtualNode"?: undefined | false | true;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkDepartmentPagingDto {
  /** 总数 */
  "totalCount": boolean;
  /** 响应数据 */
  "list": (GenAuthSdkDepartmentDto)[];
}

export interface GenAuthSdkObject23 {
  /** 组织 code * */
  "organizationCode": string;
  /** 部门 ID，不填写默认为 `root` 根部门 ID * */
  "departmentId"?: undefined | string;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "department_id" | "open_department_id";
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkObject24 {
  /** 组织 code * */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root` * */
  "departmentId": string;
  /** 排序依据 * */
  "sortBy"?: undefined | "Default" | "JoinDepartmentAt" | "userId" | "createAt" | "updatedAt";
  /** 增序还是倒序 * */
  "orderBy"?: undefined | "Asc" | "Desc";
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 是否包含子部门的成员 * */
  "includeChildrenDepartments"?: undefined | false | true;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 identities * */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkUserPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkUserDto)[];
}

export interface GenAuthSdkObject25 {
  /** 组织 code * */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root` * */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject26 {
  /** 组织 code * */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root` * */
  "departmentId": string;
  /** 搜索关键词，如成员名称 * */
  "keywords": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 是否包含子部门的成员 * */
  "includeChildrenDepartments"?: undefined | false | true;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 identities * */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkAddDepartmentMembersReqDto {
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 组织 code */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkRemoveDepartmentMembersReqDto {
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 组织 code */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject27 {
  /** 组织 code * */
  "organizationCode": string;
  /** 部门 ID * */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject28 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 组织 code * */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root`。departmentId 和 departmentCode 必传其一。 * */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 是否包含子部门 * */
  "includeChildrenDepartments"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkIsUserInDepartmentDataDto {
  /** 是否在此部门内 */
  "inDepartment": boolean;
}

export interface GenAuthSdkObject29 {
  /** 部门 ID * */
  "departmentId": string;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 应用类型列表 * */
  "appTypeList"?: undefined | (string)[];
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkCreateDepartmentTreeReqDto {
  /** 部门名称 */
  "name": string;
  /** 子部门 */
  "children"?: undefined | (string)[];
  /** 部门成员 */
  "members"?: undefined | GenAuthSdkUserInfoDto;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkResult {
  /** 新增用户数 */
  "addUser": number;
  /** 更新用户数 */
  "updateUser": number;
  /** 新增部门数 */
  "addDepartment": number;
  /** 更新部门数 */
  "updateDepartment": number;
}

export interface GenAuthSdkObject30 {
  /** 组织 code * */
  "organizationCode": string;
  /** 部门 ID，根部门传 `root`。departmentId 和 departmentCode 必传其一。 * */
  "departmentId"?: undefined | string;
  /** 此次调用中使用的部门 ID 的类型 * */
  "departmentIdType"?: undefined | "sync_relation" | "custom_field" | "department_id" | "open_department_id" | "code";
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkUserSyncRelationDto {
  /** 外部身份源类型，如： - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `lark`: 飞书 - `welink`: Welink - `ldap`: LDAP - `active-directory`: Windows AD - `italent`: 北森 - `xiaoshouyi`: 销售易 - `maycur`: 每刻报销 - `scim`: SCIM - `moka`: Moka HR */
  "provider": string;
  /** 在外部身份源中的 ID */
  "userIdInIdp": string;
  /** 用户在第三方中的身份信息 */
  "userInfoInIdp": Record<string, unknown>;
}

export interface GenAuthSdkDeleteDepartmentSyncRelationReqDto {
  /** 外部身份源类型，如： - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `lark`: 飞书 - `welink`: Welink - `ldap`: LDAP - `active-directory`: Windows AD - `italent`: 北森 - `xiaoshouyi`: 销售易 - `maycur`: 每刻报销 - `scim`: SCIM - `moka`: Moka HR */
  "provider": string;
  /** 部门 ID，根部门传 `root` */
  "departmentId": string;
  /** 组织 code */
  "organizationCode": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
}

export interface GenAuthSdkUpdateDepartmentStatusReqDto {
  /** 部门状态 */
  "status": boolean;
  /** 需要获取的部门 ID */
  "departmentId": string;
}

export interface GenAuthSdkListUsersRequestDto {
  /** 模糊搜索关键字 */
  "keywords"?: undefined | string;
  /** 高级搜索 */
  "advancedFilter"?: undefined | (GenAuthSdkListUsersAdvancedFilterItemDto)[];
  /** 使用 ES 查询语句执行搜索命令 */
  "searchQuery"?: unknown;
  /** 可选项 */
  "options"?: undefined | GenAuthSdkListUsersOptionsDto;
}

export interface GenAuthSdkObject31 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 账户当前状态，如 已停用、已离职、正常状态、已归档 * */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 用户创建、修改开始时间，为精确到秒的 UNIX 时间戳；支持获取从某一段时间之后的增量数据 * */
  "updatedAtStart"?: undefined | number;
  /** 用户创建、修改终止时间，为精确到秒的 UNIX 时间戳；支持获取某一段时间内的增量数据。默认为当前时间 * */
  "updatedAtEnd"?: undefined | number;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 部门信息 * */
  "withPost"?: undefined | false | true;
  /** 是否获取 identities * */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
  /** 是否获取用户密码过期时间 * */
  "withUserPasswordExpireTime"?: undefined | false | true;
}

export interface GenAuthSdkObject32 {
  /** 用户 ID * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 是否拍平扩展字段 * */
  "flatCustomData"?: undefined | false | true;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 部门信息 * */
  "withPost"?: undefined | false | true;
  /** 是否获取 identities * */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
}

export interface GenAuthSdkUserDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 账户当前状态： - Activated: 正常状态 - Suspended: 已停用 - Deactivated: 已禁用 - Resigned: 已离职 - Archived: 已归档 */
  "status": "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 账户当前工作状态 */
  "workStatus": "Closed" | "Active";
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 历史总登录次数 */
  "loginsCount"?: undefined | number;
  /** 上次登录时间 */
  "lastLogin"?: undefined | string;
  /** 上次登录 IP */
  "lastIp"?: undefined | string;
  /** 性别: - `M`: 男性，`male` - `F`: 女性，`female` - `U`: 未知，`unknown` */
  "gender": "M" | "F" | "U";
  /** 邮箱是否验证 */
  "emailVerified": boolean;
  /** 手机号是否验证 */
  "phoneVerified": boolean;
  /** 用户上次密码修改时间 */
  "passwordLastSetAt"?: undefined | string;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 来源类型: - `excel`: 通过 excel 导入 - `register`: 用户自主注册 - `adminCreated`: 管理员后台手动创建（包含使用管理 API 创建用户 ） - `syncTask`: 同步中心的同步任务 */
  "userSourceType": "excel" | "register" | "adminCreated" | "sync";
  /** 应用 ID 或者同步任务 ID */
  "userSourceId"?: undefined | string;
  /** 用户上次登录的应用 ID */
  "lastLoginApp"?: undefined | string;
  /** 用户主部门 ID */
  "mainDepartmentId"?: undefined | string;
  /** 用户上次进行 MFA 认证的时间 */
  "lastMfaTime"?: undefined | string;
  /** 用户密码安全强度等级 */
  "passwordSecurityLevel"?: undefined | number;
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: undefined | false | true;
  /** 注册方式 */
  "registerSource"?: undefined | (string)[];
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: undefined | (string)[];
  /** 外部身份源 */
  "identities"?: undefined | (GenAuthSdkIdentityDto)[];
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 用户的扩展字段数据 */
  "customData"?: unknown;
  /** 用户的数据对象扩展字段数据 */
  "metadataSource"?: unknown;
  /** 用户关联的部门 Id */
  "postIdList"?: undefined | (string)[];
  /** 用户状态上次修改时间 */
  "statusChangedAt"?: undefined | string;
  /** 用户租户 ID */
  "tenantId"?: undefined | string;
  /** 用户注册时间 */
  "signedUp"?: undefined | string;
}

export interface GenAuthSdkObject33 {
  /** 用户 ID 数组 * */
  "userIds": (string)[];
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否拍平扩展字段 * */
  "flatCustomData"?: undefined | false | true;
  /** 是否获取 identities * */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
}

export interface GenAuthSdkUserFieldDecryptReqDto {
  /** 用户需要解密的属性列表 */
  "data": (GenAuthSdkUserFieldDecryptReqItemDto)[];
  /** 私钥，通过控制台安全设置-数据安全-数据加密获取 */
  "privateKey": string;
}

export interface GenAuthSdkUserFieldDecryptRespItemDto {
  /** 用户唯一标志，可以是用户 ID、用户名、邮箱、手机号、外部 ID、在外部身份源的 ID。 */
  "userId"?: undefined | string;
  /** 字段的key名称，例如 username/phone */
  "fieldName"?: undefined | string;
  /** 字段解密后的内容 */
  "decryptedContent": string;
}

export interface GenAuthSdkCreateUserReqDto {
  /** 账户当前状态 */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 邮箱是否验证 */
  "emailVerified"?: undefined | false | true;
  /** 手机号是否验证 */
  "phoneVerified"?: undefined | false | true;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 加密用户密码的盐 */
  "salt"?: undefined | string;
  /** 租户 ID */
  "tenantIds"?: undefined | (string)[];
  /** 用户的 OTP 验证器 */
  "otp"?: undefined | GenAuthSdkCreateUserOtpDto;
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: undefined | (string)[];
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
  /** 数据对象数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "metadataSource"?: unknown;
  /** 第三方身份源（建议调用绑定接口进行绑定） */
  "identities"?: undefined | (GenAuthSdkCreateIdentityDto)[];
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkCreateUserOptionsDto;
}

export interface GenAuthSdkCreateUserBatchReqDto {
  /** 用户列表 */
  "list": (GenAuthSdkCreateUserInfoDto)[];
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkCreateUserOptionsDto;
}

export interface GenAuthSdkUpdateUserReqDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 账户当前状态 */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱是否验证 */
  "emailVerified"?: undefined | false | true;
  /** 手机号是否验证 */
  "phoneVerified"?: undefined | false | true;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
  /** 数据对象数据，传入的对象中的 key 必须先在用户数据对象相关自定义字段 */
  "metadata"?: unknown;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkUpdateUserOptionsDto;
}

export interface GenAuthSdkUpdateUserBatchReqDto {
  /** 用户列表 */
  "list": (GenAuthSdkUpdateUserInfoDto)[];
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkUpdateUserBatchOptionsDto;
}

export interface GenAuthSdkDeleteUsersBatchDto {
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkDeleteUsersBatchOptionsDto;
}

export interface GenAuthSdkObject34 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkIdentityDto {
  /** 身份源 ID */
  "identityId": string;
  /** 身份源连接 ID */
  "extIdpId": string;
  /** 外部身份源类型： - `wechat`: 微信 - `qq`: QQ - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `weibo`: 微博 - `github`: GitHub - `alipay`: 支付宝 - `baidu`: 百度 - `lark`: 飞书 - `welink`: Welink - `yidun`: 网易易盾 - `qingcloud`: 青云 - `google`: Google - `gitlab`: GitLab - `gitee`: Gitee - `twitter`: Twitter - `facebook`: Facebook - `slack`: Slack - `linkedin`: Linkedin - `instagram`: Instagram - `oidc`: OIDC 型企业身份源 - `oauth2`: OAuth2 型企业身份源 - `saml`: SAML 型企业身份源 - `ldap`: LDAP 型企业身份源 - `ad`: AD 型企业身份源 - `cas`: CAS 型企业身份源 - `azure-ad`: Azure AD 型企业身份源 */
  "provider": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5";
  /** Identity 类型，如 unionid, openid, primary */
  "type": string;
  /** 在外部身份源中的 ID */
  "userIdInIdp": string;
  /** 用户在 idp 中的身份信息 */
  "userInfoInIdp": unknown;
  /** 在外部身份源中的 Access Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "accessToken"?: undefined | string;
  /** 在外部身份源中的 Refresh Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "refreshToken"?: undefined | string;
  /** 身份来自的身份源连接 ID 列表 */
  "originConnIds": (string)[];
}

export interface GenAuthSdkObject35 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkRolePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkRoleDto)[];
}

export interface GenAuthSdkObject36 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkPrincipalAuthenticationInfoPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkPrincipalAuthenticationInfoDto)[];
}

export interface GenAuthSdkResetUserPrincipalAuthenticationInfoDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkResetUserPrincipalAuthenticationInfoOptionsDto;
}

export interface GenAuthSdkObject37 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取部门路径 * */
  "withDepartmentPaths"?: undefined | false | true;
  /** 排序依据，如 部门创建时间、加入部门时间、部门名称、部门标志符 * */
  "sortBy"?: undefined | "JoinDepartmentAt" | "DepartmentCreatedAt" | "DepartmentName" | "DepartmemtCode";
  /** 增序或降序 * */
  "orderBy"?: undefined | "Asc" | "Desc";
}

export interface GenAuthSdkUserDepartmentPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkUserDepartmentRespDto)[];
}

export interface GenAuthSdkSetUserDepartmentsDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 部门信息 */
  "departments": (GenAuthSdkSetUserDepartmentDto)[];
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkSetUserDepartmentsOptionsDto;
}

export interface GenAuthSdkObject38 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkGroupPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkResGroupDto)[];
}

export interface GenAuthSdkObject39 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkUserMfaRespDto {
  /** 是否绑定了 TOTP，可选值 enabled, disabled */
  "totpStatus": string;
  /** 是否绑定了人脸 MFA，可选值 enabled, disabled */
  "faceMfaStatus": string;
  /** 是否绑定了 SMS MFA，可选值 enabled, disabled */
  "smsMfaStatus": string;
  /** 是否绑定了 EMAIL MFA，可选值 enabled, disabled */
  "emailMfaStatus": string;
}

export interface GenAuthSdkObject40 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 开始时间，为精确到秒的 UNIX 时间戳，默认不指定 * */
  "startAt"?: undefined | number;
}

export interface GenAuthSdkArchivedUsersListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkListArchivedUsersRespDto)[];
}

export interface GenAuthSdkKickUsersDto {
  /** APP ID 列表 */
  "appIds": (string)[];
  /** 用户 ID */
  "userId": string;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkKickUsersOptionsDto;
}

export interface GenAuthSdkIsUserExistsReqDto {
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
}

export interface GenAuthSdkIsUserExistsDto {
  /** 用户是否存在 */
  "exists": boolean;
}

export interface GenAuthSdkObject41 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkAppDto {
  /** App ID */
  "appId": string;
  /** App 名称 */
  "appName": string;
  /** App Logo */
  "appLogo": string;
  /** App 登录地址 */
  "appLoginUrl": string;
  /** App 默认的登录策略 */
  "appDefaultLoginStrategy": "ALLOW_ALL" | "DENY_ALL";
}

export interface GenAuthSdkObject42 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkHasAnyRoleReqDto {
  /** 角色列表 */
  "roles": (GenAuthSdkHasRoleRolesDto)[];
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkHasAnyRoleOptionsDto;
}

export interface GenAuthSdkHasAnyRoleDto {
  /** 是否拥有其中某一个角色 */
  "hasAnyRole": boolean;
}

export interface GenAuthSdkObject43 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 应用 ID * */
  "appId"?: undefined | string;
  /** 客户端 IP * */
  "clientIp"?: undefined | string;
  /** 开始时间戳（毫秒） * */
  "start"?: undefined | number;
  /** 结束时间戳（毫秒） * */
  "end"?: undefined | number;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkUserLoginHistoryPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkUserLoginHistoryDto)[];
}

export interface GenAuthSdkObject44 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkUserLoggedInAppsDto {
  /** App ID */
  "appId": string;
  /** App 名称 */
  "appName": string;
  /** App Logo */
  "appLogo": string;
  /** App 登录地址 */
  "appLoginUrl": string;
}

export interface GenAuthSdkObject45 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkUserLoggedInIdentitiesDto {
  /** Identity ID */
  "identityId": string;
  /** 身份源名称 */
  "idpName": string;
  /** Identity provider name */
  "idpNameEn": string;
  /** 身份源 logo */
  "idpLogo": string;
  /** 身份源 id */
  "idpId": string;
}

export interface GenAuthSdkResignUserReqDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkResignUserDataDto {
  /** 操作是否成功 */
  "success": boolean;
}

export interface GenAuthSdkResignUserBatchReqDto {
  /** 用户 ID 数组 */
  "userIds": (string)[];
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkObject46 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
  /** 资源类型，如 数据、API、菜单、按钮 * */
  "resourceType"?: undefined | "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthSdkAuthorizedResourcePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkAuthorizedResourceDto)[];
}

export interface GenAuthSdkCheckSessionStatusDto {
  /** App ID */
  "appId": string;
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
}

export interface GenAuthSdkCheckSessionStatusDataDto {
  /** 是否具有登录态 */
  "active": boolean;
}

export interface GenAuthSdkImportOtpReqDto {
  /** 参数列表 */
  "list": (GenAuthSdkImportOtpItemDto)[];
}

export interface GenAuthSdkObject47 {
  /** 用户 ID * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkOtpSecretRespDto {
  /** MFA OTP 秘钥 */
  "secret": string;
}

export interface GenAuthSdkGetUserPasswordCiphertextDto {
  /** 用户 ID */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkGetUserPasswordCiphertextDataDto {
  /** 用户密码加密的密文 */
  "ciphertext": string;
}

export interface GenAuthSdkLinkIdentityDto {
  /** 必传，用户在该外部身份源的唯一标识，需要从外部身份源的认证返回值中获取。 */
  "userIdInIdp": string;
  /** 必传，进行绑定操作的 Authing 用户 ID。 */
  "userId": string;
  /** 必传，身份源 ID，用于指定该身份属于哪个身份源。 */
  "extIdpId": string;
  /** 非必传，表示该条身份的具体类型，可从用户身份信息的 type 字段中获取。如果不传，默认为 generic */
  "type"?: undefined | string;
  /** 已废弃，可任意传入，未来将移除该字段。 */
  "isSocial"?: undefined | false | true;
}

export interface GenAuthSdkLinkIdentityDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthSdkUnlinkIdentity {
  /** 必传，进行绑定操作的 Authing 用户 ID。 */
  "userId": string;
  /** 必传，身份源 ID，用于指定该身份属于哪个身份源。 */
  "extIdpId": string;
  /** 非必传，表示该条身份的具体类型，可从用户身份信息的 type 字段中获取。如果不传，默认为 generic */
  "type"?: undefined | string;
  /** 已废弃，可任意传入，未来将移除该字段。 */
  "isSocial"?: undefined | false | true;
}

export interface GenAuthSdkUnlinkIdentityDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthSdkSetMfaStatusDto {
  /** MFA Factor 列表 */
  "mfaTriggerData": GenAuthSdkGetMfaInfoDataDto;
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkObject48 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkGetMfaInfoDataDto {
  /** MFA Token */
  "mfaToken": string;
  /** MFA 绑定的手机号 */
  "mfaPhone"?: undefined | string;
  /** MFA 绑定的手机区号 */
  "mfaPhoneCountryCode"?: undefined | string;
  /** MFA 绑定的邮箱 */
  "mfaEmail"?: undefined | string;
  /** 用户昵称 */
  "nickname"?: undefined | string;
  /** 用户名 */
  "username"?: undefined | string;
  /** 用户手机号 */
  "phone"?: undefined | string;
  /** 用户手机区号 */
  "phoneCountryCode"?: undefined | string;
  /** 人脸校验是否开启 */
  "faceMfaEnabled"?: undefined | false | true;
  /** OTP 校验是否开启 */
  "totpMfaEnabled"?: undefined | false | true;
  /** MFA Factor 列表 */
  "applicationMfa": (GenAuthSdkApplicationMfaDto)[];
}

export interface GenAuthSdkObject49 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkDeleteUserSyncRelationReqDto {
  /** 外部身份源类型，如： - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `lark`: 飞书 - `welink`: Welink - `ldap`: LDAP - `active-directory`: Windows AD - `italent`: 北森 - `xiaoshouyi`: 销售易 - `maycur`: 每刻报销 - `scim`: SCIM - `moka`: Moka HR */
  "provider": string;
  /** 用户 ID */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkGetUserEncryptPasswordBatchDto {
  /** 用户 ID 数组 */
  "userIds": (string)[];
}

export interface GenAuthSdkGetUserEncryptPasswordBatchDataDto {
  /** 用户 id */
  "userId": string;
  /** 用户密文密码 */
  "encryptedPassword": string;
}

export interface GenAuthSdkObject50 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 所属权限分组(权限空间)的 code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkObject51 {
  /** 角色 ID * */
  "roleId": string;
}

export interface GenAuthSdkSetUserRolesDto {
  /** 角色 IDs */
  "roleIds": (string)[];
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
}

export interface GenAuthSdkObject52 {
  /** 分组 ID * */
  "groupId": string;
}

export interface GenAuthSdkObject53 {
  /** 用户唯一标志，可以是用户 ID、用户名、邮箱、手机号、外部 ID、在外部身份源的 ID。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkSetUserGroupsDto {
  /** 群组 ID 列表 */
  "groupIds": (string)[];
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
}

export interface GenAuthSdkObject54 {
  /** 部门 ID * */
  "departmentId": string;
}

export interface GenAuthSdkObject55 {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取部门路径 * */
  "withDepartmentPaths"?: undefined | false | true;
  /** 排序依据，如 部门创建时间、加入部门时间、部门名称、部门标志符 * */
  "sortBy"?: undefined | "JoinDepartmentAt" | "DepartmentCreatedAt" | "DepartmentName" | "DepartmemtCode";
  /** 增序或降序 * */
  "orderBy"?: undefined | "Asc" | "Desc";
}

export interface GenAuthSdkObject56 {
  /** 用户 id * */
  "userId": string;
}

export interface GenAuthSdkObject57 {
  /** 岗位 ID * */
  "postId": string;
}

export interface GenAuthSdkObject58 {
  /** 同步任务 ID * */
  "syncTaskId": number;
}

export interface GenAuthSdkSyncTaskDto {
  /** 同步任务 ID */
  "syncTaskId": number;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 同步任务名称 */
  "syncTaskName": string;
  /** 同步任务类型: - `lark`: 飞书 - `lark-international`: 飞书国际版 - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `active-directory`: Windows AD - `ldap`: LDAP - `italent`: 北森 - `maycur`: 每刻报销 - `moka`: Moka - `fxiaoke`: 纷享销客 - `xiaoshouyi`: 销售易 - `kayang`: 嘉扬 HR - `scim`: 自定义同步源 */
  "syncTaskType": "lark" | "lark-international" | "wechatwork" | "dingtalk" | "active-directory" | "italent" | "maycur" | "ldap" | "moka" | "fxiaoke" | "scim" | "xiaoshouyi" | "kayang" | "custom";
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统 */
  "syncFlow": "upstream" | "downstream";
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发 */
  "syncTrigger": "manually" | "timed" | "automatic";
  /** 最近一次同步错误信息 */
  "lastSyncMessage"?: undefined | string;
  /** 最近一次同步进度 */
  "lastSyncRate"?: undefined | number;
  /** 最近一次同步状态: - `free`: 空闲状态，从未执行 - `pending`: 等待系统执行 - `onProgress`: 正在执行 - `success`: 成功 - `failed`: 失败 */
  "lastSyncStatus"?: undefined | "free" | "pending" | "onProgress" | "success" | "failed";
  /** 最近一次同步时间 */
  "lastSyncTime"?: undefined | string;
  /** 此同步任务绑定的组织机构。针对上游同步，需执行一次同步任务之后才会绑定组织机构；针对下游同步，创建同步任务的时候就需要设置。 */
  "organizationCode"?: undefined | string;
  /** 同步范围，**只针对下游同步任务有效**。为空表示同步整个组织机构。 */
  "provisioningScope"?: undefined | GenAuthSdkSyncTaskProvisioningScope;
  /** 字段映射配置 */
  "fieldMapping": (GenAuthSdkSyncTaskFieldMapping)[];
  /** 定时同步时间设置 */
  "timedScheduler"?: undefined | GenAuthSdkSyncTaskTimedScheduler;
}

export interface GenAuthSdkObject59 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkSyncTaskPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkSyncTaskDto)[];
}

export interface GenAuthSdkCreateSyncTaskDto {
  /** 字段映射配置 */
  "fieldMapping": (GenAuthSdkSyncTaskFieldMapping)[];
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发 */
  "syncTaskTrigger": "manually" | "timed" | "automatic";
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统 */
  "syncTaskFlow": "upstream" | "downstream";
  /** 同步任务配置信息 */
  "clientConfig": GenAuthSdkSyncTaskClientConfig;
  /** 同步任务类型: - `lark`: 飞书 - `lark-international`: 飞书国际版 - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `active-directory`: Windows AD - `ldap`: LDAP - `italent`: 北森 - `maycur`: 每刻报销 - `moka`: Moka - `fxiaoke`: 纷享销客 - `xiaoshouyi`: 销售易 - `kayang`: 嘉扬 HR - `scim`: 自定义同步源 */
  "syncTaskType": "lark" | "lark-international" | "wechatwork" | "dingtalk" | "active-directory" | "italent" | "maycur" | "ldap" | "moka" | "fxiaoke" | "scim" | "xiaoshouyi" | "kayang" | "custom";
  /** 同步任务名称 */
  "syncTaskName": string;
  /** 此同步任务绑定的组织机构。针对上游同步，需执行一次同步任务之后才会绑定组织机构；针对下游同步，创建同步任务的时候就需要设置。 */
  "organizationCode"?: undefined | string;
  /** 同步范围，**只针对下游同步任务有效**。为空表示同步整个组织机构。 */
  "provisioningScope"?: undefined | GenAuthSdkSyncTaskProvisioningScope;
  /** 定时同步时间设置 */
  "timedScheduler"?: undefined | GenAuthSdkSyncTaskTimedScheduler;
}

export interface GenAuthSdkUpdateSyncTaskDto {
  /** 同步任务 ID */
  "syncTaskId": number;
  /** 同步任务名称 */
  "syncTaskName"?: undefined | string;
  /** 同步任务类型: - `lark`: 飞书 - `lark-international`: 飞书国际版 - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `active-directory`: Windows AD - `ldap`: LDAP - `italent`: 北森 - `maycur`: 每刻报销 - `moka`: Moka - `fxiaoke`: 纷享销客 - `xiaoshouyi`: 销售易 - `kayang`: 嘉扬 HR - `scim`: 自定义同步源 */
  "syncTaskType"?: undefined | "lark" | "lark-international" | "wechatwork" | "dingtalk" | "active-directory" | "italent" | "maycur" | "ldap" | "moka" | "fxiaoke" | "scim" | "xiaoshouyi" | "kayang" | "custom";
  /** 同步任务配置信息 */
  "clientConfig"?: undefined | GenAuthSdkSyncTaskClientConfig;
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统 */
  "syncTaskFlow"?: undefined | "upstream" | "downstream";
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发 */
  "syncTaskTrigger"?: undefined | "manually" | "timed" | "automatic";
  /** 此同步任务绑定的组织机构。针对上游同步，需执行一次同步任务之后才会绑定组织机构；针对下游同步，创建同步任务的时候就需要设置。 */
  "organizationCode"?: undefined | string;
  /** 同步范围，**只针对下游同步任务有效**。为空表示同步整个组织机构。 */
  "provisioningScope"?: undefined | GenAuthSdkSyncTaskProvisioningScope;
  /** 字段映射配置 */
  "fieldMapping"?: undefined | (GenAuthSdkSyncTaskFieldMapping)[];
  /** 定时同步时间设置 */
  "timedScheduler"?: undefined | GenAuthSdkSyncTaskTimedScheduler;
}

export interface GenAuthSdkTriggerSyncTaskDto {
  /** 同步任务 ID */
  "syncTaskId": number;
}

export interface GenAuthSdkTriggerSyncTaskDataDto {
  /** 此次执行同步任务的同步作业 ID */
  "syncJobId": number;
}

export interface GenAuthSdkObject60 {
  /** 同步作业 ID * */
  "syncJobId": number;
}

export interface GenAuthSdkSyncJobDto {
  /** 同步作业 ID */
  "syncJobId": number;
  /** 此同步作业对应的同步任务 ID */
  "syncTaskId": number;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 当前同步状态: - `free`: 空闲状态，从未执行 - `pending`: 等待系统执行 - `onProgress`: 正在执行 - `success`: 成功 - `failed`: 失败 */
  "syncStatus": "free" | "pending" | "onProgress" | "success" | "failed";
  /** 同步任务数据流向： - `upstream`: 作为上游，将数据同步到 Authing - `downstream`: 作为下游，将 Authing 数据同步到此系统 */
  "syncFlow": "upstream" | "downstream";
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发 */
  "syncTrigger": "manually" | "timed" | "automatic";
  /** 需要同步的部门个数 */
  "departmentCountAll": number;
  /** 成功同步的部门个数 */
  "departmentCountSucc": number;
  /** 需要更新的部门个数 */
  "departmentUpdateCountAll": number;
  /** 成功更新的部门个数 */
  "departmentUpdateCountSucc": number;
  /** 需要同步的用户个数 */
  "accountCountAll": number;
  /** 成功同步的用户个数 */
  "accountCountSucc": number;
  /** 需要更新的用户个数 */
  "accountUpdateCountAll": number;
  /** 成功更新的用户个数 */
  "accountUpdateCountSucc": number;
  /** 错误信息 */
  "errMsg"?: undefined | string;
}

export interface GenAuthSdkObject61 {
  /** 同步任务 ID * */
  "syncTaskId": number;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 同步任务触发类型： - `manually`: 手动触发执行 - `timed`: 定时触发 - `automatic`: 根据事件自动触发 * */
  "syncTrigger"?: undefined | "manually" | "timed" | "automatic";
}

export interface GenAuthSdkSyncJobPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkSyncJobDto)[];
}

export interface GenAuthSdkObject62 {
  /** 同步作业 ID * */
  "syncJobId": number;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 根据是否操作成功进行筛选 * */
  "success"?: undefined | false | true;
  /** 根据操作类型进行筛选： - `CreateUser`: 创建用户 - `UpdateUser`: 修改用户信息 - `DeleteUser`: 删除用户 - `UpdateUserIdentifier`: 修改用户唯一标志符 - `ChangeUserDepartment`: 修改用户部门 - `CreateDepartment`: 创建部门 - `UpdateDepartment`: 修改部门信息 - `DeleteDepartment`: 删除部门 - `MoveDepartment`: 移动部门 - `UpdateDepartmentLeader`: 同步部门负责人 - `CreateGroup`: 创建分组 - `UpdateGroup`: 修改分组 - `DeleteGroup`: 删除分组 - `Updateless`: 无更新 * */
  "action"?: undefined | "CreateUser" | "UpdateUser" | "DeleteUser" | "UpdateUserIdentifier" | "ChangeUserDepartment" | "CreateDepartment" | "UpdateDepartment" | "DeleteDepartment" | "MoveDepartment" | "UpdateDepartmentLeader" | "CreateGroup" | "UpdateGroup" | "DeleteGroup" | "Updateless";
  /** 操作对象类型: - `department`: 部门 - `user`: 用户 * */
  "objectType"?: undefined | "USER" | "DEPARTMENT";
}

export interface GenAuthSdkObject63 {
  /** 同步任务 ID * */
  "syncTaskId": number;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 根据执行状态筛选 * */
  "status"?: undefined | ("PENDING" | "SUCCESS" | "FAILED" | "CANCELED" | "EXECUTING")[];
  /** 根据操作对象类型，默认获取所有类型的记录： - `department`: 部门 - `user`: 用户 * */
  "objectType"?: undefined | ("USER" | "DEPARTMENT")[];
}

export interface GenAuthSdkSyncRiskOperationPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkSyncRiskOperationDto)[];
}

export interface GenAuthSdkTriggerSyncRiskOperationDto {
  /** 同步任务风险操作 ID */
  "syncRiskOperationIds": (number)[];
}

export interface GenAuthSdkTriggerSyncRiskOperationsDataDto {
  /** 成功执行的风险操作任务 */
  "successList": (number)[];
  /** 执行失败的风险操作任务 */
  "faildList": (number)[];
}

export interface GenAuthSdkCancelSyncRiskOperationDto {
  /** 同步任务风险操作 ID */
  "syncRiskOperationIds": (number)[];
}

export interface GenAuthSdkCancelSyncRiskOperationsDataDto {
  /** 成功取消的风险操作任务 */
  "successList": (number)[];
  /** 取消失败的风险操作任务 */
  "faildList": (number)[];
}

export interface GenAuthSdkObject64 {
  /** 是否获取所选部门的详细信息 * */
  "withDepartmentDetail"?: undefined | false | true;
}

export interface GenAuthSdkGetUniversalInvitationDto {
  /** 管理员邀请配置 */
  "adminInvitationConfig"?: undefined | GenAuthSdkInvitationConfigDto;
  /** 成员邀请配置 */
  "memberInvitationConfig"?: undefined | GenAuthSdkInvitationConfigDto;
  /** 允许用户池成员使用链接邀请新成员加入 */
  "enabledMemberInvitation"?: undefined | false | true;
}

export interface GenAuthSdkUpdateUniversalInvitationDto {
  /** 管理员邀请配置 */
  "adminInvitationConfig"?: undefined | false | true;
  /** 成员邀请配置 */
  "memberInvitationConfig"?: undefined | false | true;
  /** 允许用户池成员使用链接邀请新成员加入 */
  "enabledMemberInvitation"?: undefined | false | true;
}

export interface GenAuthSdkGenerateInvitationLinkDto {
  /** 邀请链接地址 */
  "link": string;
}

export interface GenAuthSdkPaginationUniversalInvitationApplicantQueryDto {
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 用于根据申请人名称、手机号或邮箱进行模糊搜索，可选。 */
  "keywords"?: undefined | string;
  /** 复杂筛选条件 */
  "filter"?: undefined | GenAuthSdkCombineFiltersBaseDto;
  /** 是否返回邀请人详情 */
  "withInvitorDetail"?: undefined | false | true;
  /** 是否返回审批人详情 */
  "withOperatorDetail"?: undefined | false | true;
}

export interface GenAuthSdkPaginationUniversalInvitationApplicantDataDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkUniversalInvitationApplicantData)[];
}

export interface GenAuthSdkApprovalUniversalInvitationApplicantDto {
  /** 通用邀请的申请 ID */
  "applicantIds": (string)[];
}

export interface GenAuthSdkPaginationInvitationPolicyQueryDto {
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 用于根据策略的名称或 ID 进行模糊搜索，可选。 */
  "keywords"?: undefined | string;
  /** 复杂筛选条件 */
  "filter"?: undefined | GenAuthSdkCombineFiltersBaseDto;
  /** 是否返回创建者详情 */
  "withCreatorDetail"?: undefined | false | true;
}

export interface GenAuthSdkPaginationInvitationPolicyDataDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkGetInvitationPolicyDto)[];
}

export interface GenAuthSdkCreateInvitationPolicyDto {
  /** 邀请策略名称 */
  "name": string;
  /** 邀请方式: - `email`: 邮箱 */
  "inviteMethod"?: undefined | "email";
  /** 邀请链接配置 */
  "inviteLinkConfig"?: undefined | GenAuthSdkInvitationLinkConfigDto;
  /** 初始化密码配置 */
  "defaultPasswordConfig"?: undefined | GenAuthSdkDefaultPasswordConfigDto;
  /** 邀请邮件是否展示密码 */
  "showPasswordInInviteEmail"?: undefined | false | true;
  /** 是否开启身份验证码 */
  "enabledIdentifierVerify"?: undefined | false | true;
  /** 发送身份验证码的方式: - `priorityEmail`: 优先邮箱 - `prioritySMS`: 优先短信 */
  "sendVerifyCodeMethod"?: undefined | "prioritySMS" | "priorityEmail";
  /** 是否开启信息补全 */
  "enabledInfoFill"?: undefined | false | true;
  /** 信息补全页面提示 */
  "registerInfoFillMsg"?: undefined | string;
  /** 是否开启第三方身份源绑定 */
  "enabledExtIdp"?: undefined | false | true;
  /** 是否允许跳过第三方身份源绑定 */
  "allowSkipBindExtIdp"?: undefined | false | true;
  /** 身份源绑定提示信息 */
  "extIdpBindMsg"?: undefined | string;
  /** 支持绑定的身份源 ID 列表 */
  "extIdpConnIds"?: undefined | (string)[];
  /** 注册信息补全字段列表配置 */
  "extendsFields"?: undefined | (string)[];
}

export interface GenAuthSdkGetInvitationPolicyDto {
  /** 策略 ID */
  "policyId"?: unknown;
  /** 名单 ID，根据名单 ID 获取关联的策略详情，在名单发送邀请时会给策略生成快照，若在名单发送邀请后，需要获取发送时对应的策略配置，应该携带此参数 */
  "rosterId"?: unknown;
  /** 是否返回创建者详情 */
  "withCreatorDetail"?: unknown;
}

export interface GenAuthSdkObject65 {
  /** 策略 ID * */
  "policyId": string;
  /** 名单 ID，根据名单 ID 获取关联的策略详情，在名单发送邀请时会给策略生成快照，若在名单发送邀请后，需要获取发送时对应的策略配置，应该携带此参数 * */
  "rosterId"?: undefined | string;
  /** 是否返回创建者详情 * */
  "withCreatorDetail"?: undefined | false | true;
}

export interface GenAuthSdkCopyInvitationPolicyDto {
  /** 策略 ID */
  "policyId": string;
}

export interface GenAuthSdkUpdateInvitationPolicyDto {
  /** 策略 ID */
  "policyId": string;
  /** 邀请策略名称 */
  "name"?: undefined | string;
  /** 邀请方式: - `email`: 邮箱 */
  "inviteMethod"?: undefined | "email";
  /** 邀请链接配置 */
  "inviteLinkConfig"?: undefined | GenAuthSdkInvitationLinkConfigDto;
  /** 初始化密码配置 */
  "defaultPasswordConfig"?: undefined | GenAuthSdkDefaultPasswordConfigDto;
  /** 邀请邮件是否展示密码 */
  "showPasswordInInviteEmail"?: undefined | false | true;
  /** 是否开启身份验证码 */
  "enabledIdentifierVerify"?: undefined | false | true;
  /** 发送身份验证码的方式 - `priorityEmail`: 优先邮箱 - `prioritySMS`: 优先短信 */
  "sendVerifyCodeMethod"?: undefined | "prioritySMS" | "priorityEmail";
  /** 是否开启信息补全 */
  "enabledInfoFill"?: undefined | false | true;
  /** 信息补全页面提示 */
  "registerInfoFillMsg"?: undefined | string;
  /** 是否开启第三方身份源绑定 */
  "enabledExtIdp"?: undefined | false | true;
  /** 是否允许跳过第三方身份源绑定 */
  "allowSkipBindExtIdp"?: undefined | false | true;
  /** 身份源绑定提示信息 */
  "extIdpBindMsg"?: undefined | string;
  /** 支持绑定的身份源 ID 列表 */
  "extIdpConnIds"?: undefined | (string)[];
  /** 注册信息补全字段列表配置 */
  "extendsFields"?: undefined | (string)[];
  /** 邀请邮件模板类型 */
  "inviteEmailTemplateType"?: undefined | string;
  /** 欢迎邮件模板类型 */
  "welcomeEmailTemplateType"?: undefined | string;
}

export interface GenAuthSdkObject66 {
  /** 策略 ID * */
  "policyId": string;
  /** 名单 ID，根据名单 ID 获取关联的策略详情，在名单发送邀请时会给策略生成快照，若在名单发送邀请后，需要获取发送时对应的策略配置，应该携带此参数 * */
  "rosterId"?: undefined | string;
}

export interface GenAuthSdkGetExtendsFieldsDto {
  /** 字段信息列表 */
  "extendsFields"?: undefined | (GenAuthSdkExtendsFieldDto)[];
}

export interface GenAuthSdkPolicyExtendsFieldsDto {
  /** 字段信息 */
  "extendsField": GenAuthSdkUpdateExtendsFieldDto;
  /** 操作类型 - `add`: 新增 - `update`: 更新 - `delete`: 删除 - `reorder`: 排序 */
  "action": string;
  /** 策略 ID */
  "policyId": string;
  /** 字段排序 */
  "newOrder"?: undefined | (string)[];
}

export interface GenAuthSdkDeleteInvitationPolicyByIdsDto {
  /** 策略 ID 数组 */
  "policyIds": (string)[];
}

export interface GenAuthSdkObject67 {
  /** 归属关联记录 ID * */
  "id": string;
  /** 是否返回关联对象详情 * */
  "withTargetDetail"?: undefined | false | true;
  /** 当关联对象是部门时，是否返回部门其他详细信息，包括 namePath, codePath, idPath * */
  "withDepartmentExtInfo"?: undefined | false | true;
}

export interface GenAuthSdkUserAttributionDto {
  /** 归属关联记录 ID */
  "id": string;
  /** 策略 ID */
  "policyId": string;
  /** 关联对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` - 如果是岗位，为岗位的 code，如 `leader` */
  "targetIdentifier": string;
  /** 角色所在权限空间 code，若 targetType 是 role，此参数必传 */
  "namespace"?: undefined | string;
  /** 关联对象类型 */
  "targetType": "department" | "post" | "role" | "group";
  /** 关联对象详情 */
  "targetDetail"?: undefined | GenAuthSdkGroupDto | GenAuthSdkRoleDto | GenAuthSdkInvitationDepartmentRespDto | GenAuthSdkInvitationPostRespDto;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkObject68 {
  /** 策略 ID * */
  "policyId": string;
  /** 关联对象类型 * */
  "targetType": "department" | "post" | "role" | "group";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否返回关联对象详情 * */
  "withTargetDetail"?: undefined | false | true;
  /** 当关联对象是部门时，是否返回部门其他详细信息，包括 namePath, codePath, idPath * */
  "withDepartmentExtInfo"?: undefined | false | true;
}

export interface GenAuthSdkUserAttributionPaginationDto {
  /** 记录总数 */
  "totalCount"?: undefined | number;
  /** 列表数据 */
  "list": (GenAuthSdkUserAttributionDto)[];
}

export interface GenAuthSdkAddInvitationPolicyUserAttributionDto {
  /** 关联对象类型 */
  "targetType": "department" | "post" | "role" | "group";
  /** 关联对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` - 如果是岗位，为岗位的 code，如 `leader` */
  "targetIdentifier": string;
  /** 策略 ID */
  "policyId": string;
  /** 角色所在权限空间 code，若 targetType 是 role，此参数必传 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkAddInvitationPolicyUserAttributionsBatchDto {
  /** 关联对象列表 */
  "targets": (GenAuthSdkInvitationPolicyUserAttributionListDto)[];
  /** 策略 ID */
  "policyId": string;
}

export interface GenAuthSdkSetInvitationPolicyUserAttributionMainDepartmentDto {
  /** 策略 ID */
  "policyId": string;
  /** 部门 ID */
  "departmentId": string;
}

export interface GenAuthSdkRemoveInvitationPolicyUserAttributionMainDepartmentDto {
  /** 策略 ID */
  "policyId": string;
}

export interface GenAuthSdkObject69 {
  /** 策略 ID * */
  "policyId": string;
  /** 是否返回主部门详情 * */
  "withDepartmentDetail"?: undefined | false | true;
}

export interface GenAuthSdkUserAttributionMainDepartmentDto {
  /** 策略 ID */
  "policyId": string;
  /** 主部门 ID */
  "departmentId": null | string;
  /** 主部门详情 */
  "departmentDetail"?: undefined | GenAuthSdkInvitationDepartmentRespDto;
}

export interface GenAuthSdkRemoveInvitationPolicyUserAttributionDto {
  /** 关联对象类型 */
  "targetType": "department" | "post" | "role" | "group";
  /** 关联对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` - 如果是岗位，为岗位的 code，如 `leader` */
  "targetIdentifier": string;
  /** 策略 ID */
  "policyId": string;
  /** 角色所在权限空间 code，若 targetType 是 role，此参数必传 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkRemoveInvitationPolicyUserAttributionsBatchDto {
  /** 关联对象列表 */
  "targets": (GenAuthSdkInvitationPolicyUserAttributionListDto)[];
  /** 策略 ID */
  "policyId": string;
}

export interface GenAuthSdkEmailTemplateQueryDto {
  /** 邀请策略邮件场景: - `INVITE`: 邀请邮件 - `WELCOME`: 欢迎邮件 */
  "scene": "INVITE" | "WELCOME";
  /** 策略 ID */
  "policyId": string;
  /** 名单 ID，根据名单 ID 获取关联的策略详情，在名单发送邀请时会给策略生成快照，若在名单发送邀请后，需要获取发送时对应的策略配置，应该携带此参数 */
  "rosterId"?: undefined | string;
  /** 邮件模版类型，可选，可获取支持的指定类型的邮件模板 */
  "templateType"?: undefined | string;
}

export interface GenAuthSdkEmailTemplateDto {
  /** 是否启用自定义模版 */
  "customizeEnabled": boolean;
  /** 模版类型: - `WELCOME_EMAIL`: 欢迎邮件 - `FIRST_CREATED_USER`: 首次创建用户通知 - `REGISTER_VERIFY_CODE`: 注册验证码 - `LOGIN_VERIFY_CODE`: 登录验证码 - `MFA_VERIFY_CODE`: MFA 验证码 - `INFORMATION_COMPLETION_VERIFY_CODE`: 注册信息补全验证码 - `FIRST_EMAIL_LOGIN_VERIFY`: 首次邮箱登录验证 - `CONSOLE_CONDUCTED_VERIFY`: 在控制台发起邮件验证 - `USER_PASSWORD_UPDATE_REMIND`: 用户到期提醒 - `ADMIN_RESET_USER_PASSWORD_NOTIFICATION`: 管理员重置用户密码成功通知 - `USER_PASSWORD_RESET_NOTIFICATION`: 用户密码重置成功通知 - `RESET_PASSWORD_VERIFY_CODE`: 重置密码验证码 - `SELF_UNLOCKING_VERIFY_CODE`: 自助解锁验证码 - `EMAIL_BIND_VERIFY_CODE`: 绑定邮箱验证码 - `EMAIL_UNBIND_VERIFY_CODE`: 解绑邮箱验证码 */
  "type": "WELCOME_EMAIL" | "FIRST_CREATED_USER" | "REGISTER_VERIFY_CODE" | "LOGIN_VERIFY_CODE" | "MFA_VERIFY_CODE" | "INFORMATION_COMPLETION_VERIFY_CODE" | "FIRST_EMAIL_LOGIN_VERIFY" | "CONSOLE_CONDUCTED_VERIFY" | "USER_PASSWORD_UPDATE_REMIND" | "ADMIN_RESET_USER_PASSWORD_NOTIFICATION" | "USER_PASSWORD_RESET_NOTIFICATION" | "RESET_PASSWORD_VERIFY_CODE" | "SELF_UNLOCKING_VERIFY_CODE" | "EMAIL_BIND_VERIFY_CODE" | "EMAIL_UNBIND_VERIFY_CODE";
  /** 邮件模版名称 */
  "name": string;
  /** 邮件主题 */
  "subject": string;
  /** 邮件发件人名称 */
  "sender": string;
  /** 邮件内容模版 */
  "content": string;
  /** 验证码/邮件有效时间，只有验证类邮件才有有效时间。 */
  "expiresIn"?: undefined | number;
  /** 完成邮件验证之后跳转到的地址，只针对 `FIRST_EMAIL_LOGIN_VERIFY` 和 `CONSOLE_CONDUCTED_VERIFY` 类型的模版有效。 */
  "redirectTo"?: undefined | string;
  /** 模版渲染引擎。Authing 邮件模版目前支持两种渲染引擎： - `handlebar`: 详细使用方法请见：[handlebars 官方文档](https://handlebarsjs.com/) - `ejs`: 详细使用方法请见：[ejs 官方文档](https://ejs.co/)  默认将使用 `handlerbar` 作为模版渲染引擎。 */
  "tplEngine"?: undefined | "handlebar" | "ejs";
}

export interface GenAuthSdkUpdateEmailTemplateDto {
  /** 模版类型: - `WELCOME_EMAIL`: 欢迎邮件 - `FIRST_CREATED_USER`: 首次创建用户通知 - `REGISTER_VERIFY_CODE`: 注册验证码 - `LOGIN_VERIFY_CODE`: 登录验证码 - `MFA_VERIFY_CODE`: MFA 验证码 - `INFORMATION_COMPLETION_VERIFY_CODE`: 注册信息补全验证码 - `FIRST_EMAIL_LOGIN_VERIFY`: 首次邮箱登录验证 - `CONSOLE_CONDUCTED_VERIFY`: 在控制台发起邮件验证 - `USER_PASSWORD_UPDATE_REMIND`: 用户到期提醒 - `ADMIN_RESET_USER_PASSWORD_NOTIFICATION`: 管理员重置用户密码成功通知 - `USER_PASSWORD_RESET_NOTIFICATION`: 用户密码重置成功通知 - `RESET_PASSWORD_VERIFY_CODE`: 重置密码验证码 - `SELF_UNLOCKING_VERIFY_CODE`: 自助解锁验证码 - `EMAIL_BIND_VERIFY_CODE`: 绑定邮箱验证码 - `EMAIL_UNBIND_VERIFY_CODE`: 解绑邮箱验证码 */
  "type": "WELCOME_EMAIL" | "FIRST_CREATED_USER" | "REGISTER_VERIFY_CODE" | "LOGIN_VERIFY_CODE" | "MFA_VERIFY_CODE" | "INFORMATION_COMPLETION_VERIFY_CODE" | "FIRST_EMAIL_LOGIN_VERIFY" | "CONSOLE_CONDUCTED_VERIFY" | "USER_PASSWORD_UPDATE_REMIND" | "ADMIN_RESET_USER_PASSWORD_NOTIFICATION" | "USER_PASSWORD_RESET_NOTIFICATION" | "RESET_PASSWORD_VERIFY_CODE" | "SELF_UNLOCKING_VERIFY_CODE" | "EMAIL_BIND_VERIFY_CODE" | "EMAIL_UNBIND_VERIFY_CODE";
  /** 是否启用自定义模版 */
  "customizeEnabled": boolean;
  /** 邮件模版名称 */
  "name": string;
  /** 邮件主题 */
  "subject": string;
  /** 邮件发件人名称 */
  "sender": string;
  /** 邮件内容模版 */
  "content": string;
  /** 验证码/邮件有效时间，只有验证类邮件才有有效时间。 */
  "expiresIn"?: undefined | number;
  /** 完成邮件验证之后跳转到的地址，只针对 `FIRST_EMAIL_LOGIN_VERIFY` 和 `CONSOLE_CONDUCTED_VERIFY` 类型的模版有效。 */
  "redirectTo"?: undefined | string;
  /** 模版渲染引擎。Authing 邮件模版目前支持两种渲染引擎： - `handlebar`: 详细使用方法请见：[handlebars 官方文档](https://handlebarsjs.com/) - `ejs`: 详细使用方法请见：[ejs 官方文档](https://ejs.co/)  默认将使用 `handlerbar` 作为模版渲染引擎。 */
  "tplEngine"?: undefined | "handlebar" | "ejs";
}

export interface GenAuthSdkListInvitationRosterDto {
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 用于根据名单的名称或 ID 进行模糊搜索，可选。 */
  "keywords"?: undefined | string;
  /** 高级筛选条件 */
  "filter"?: undefined | GenAuthSdkCombineFiltersBaseDto;
  /** 是否返回创建者详情 */
  "withCreatorDetail"?: undefined | false | true;
  /** 是否返回名单关联的用户数量，可选。 */
  "withUserCount"?: undefined | false | true;
  /** 是否返回名单关联的策略，可选。 */
  "withAssignedPolicy"?: undefined | false | true;
}

export interface GenAuthSdkInvitationRosterPaginationDto {
  /** 记录总数 */
  "totalCount"?: undefined | number;
  /** 列表数据 */
  "list": (GenAuthSdkInvitationRosterDto)[];
}

export interface GenAuthSdkListInvitationRosterByPolicyIdDto {
  /** 策略 ID。 */
  "policyId": string;
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 用于根据名单的名称或 ID 进行模糊搜索，可选。 */
  "keywords"?: undefined | string;
  /** 高级筛选条件 */
  "filter"?: undefined | GenAuthSdkCombineFiltersBaseDto;
  /** 是否返回创建者详情 */
  "withCreatorDetail"?: undefined | false | true;
  /** 是否返回名单关联的用户数量，可选。 */
  "withUserCount"?: undefined | false | true;
  /** 是否返回名单关联的策略，可选。 */
  "withAssignedPolicy"?: undefined | false | true;
}

export interface GenAuthSdkObject70 {
  /** 名单 ID * */
  "rosterId": string;
  /** 是否返回创建者详情 * */
  "withCreatorDetail"?: undefined | false | true;
  /** 是否返回名单关联的用户数量，可选。 * */
  "withUserCount"?: undefined | false | true;
  /** 是否返回名单关联的策略，可选。 * */
  "withAssignedPolicy"?: undefined | false | true;
}

export interface GenAuthSdkInvitationRosterDto {
  /** 名单 ID */
  "rosterId": string;
  /** 名单名称 */
  "name": string;
  /** 关联的策略 ID */
  "policyId"?: undefined | string;
  /** 名单状态 */
  "status": "editing" | "invited";
  /** 创建者 ID */
  "creatorId": string;
  /** 创建者详情 */
  "creatorDetail"?: undefined | GenAuthSdkCommonUserDto;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 关联用户数量 */
  "userCount": number;
  /** 关联策略 */
  "assignedPolicy": GenAuthSdkGetInvitationPolicyDto;
}

export interface GenAuthSdkCreateInvitationRosterDto {
  /** 名单名称 */
  "name": string;
}

export interface GenAuthSdkBatchBindPolicy {
  /** 名单 ID 列表 */
  "rosterIds": (string)[];
  /** 策略 ID */
  "policyId": string;
}

export interface GenAuthSdkBatchUnbindPolicy {
  /** 名单 ID 列表 */
  "rosterIds": (string)[];
  /** 策略 ID */
  "policyId": string;
}

export interface GenAuthSdkUpdateInvitationRosterDto {
  /** 名单 ID */
  "rosterId": string;
  /** 名单名称 */
  "name"?: undefined | string;
  /** 关联的策略 ID */
  "policyId"?: undefined | string;
}

export interface GenAuthSdkDeleteInvitationRosterDto {
  /** 名单 ID */
  "id": string;
}

export interface GenAuthSdkDeleteInvitationRosterBatchDto {
  /** 名单 ID 列表 */
  "ids": (string)[];
}

export interface GenAuthSdkSendRosterInvitationDto {
  /** 名单 ID */
  "rosterId": string;
}

export interface GenAuthSdkSendRosterInvitationBatchDto {
  /** 受邀人 ID 列表 */
  "inviteeIds": (string)[];
  /** 名单 ID */
  "rosterId": string;
}

export interface GenAuthSdkRevertRosterInvitationDto {
  /** 受邀人 ID */
  "inviteeId": string;
  /** 名单 ID */
  "rosterId": string;
}

export interface GenAuthSdkRevertRosterInvitationBatchDto {
  /** 受邀人 ID 列表 */
  "inviteeIds": (string)[];
}

export interface GenAuthSdkQuickFilterInvitationUserDto {
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 用于根据名单的名称或受邀人 ID 进行模糊搜索，可选。 */
  "keywords"?: undefined | string;
  /** 高级筛选条件 */
  "filter"?: undefined | GenAuthSdkCombineFiltersBaseDto;
}

export interface GenAuthSdkQuickFilterInviteePaginationDto {
  /** 记录总数 */
  "totalCount"?: undefined | number;
  /** 列表数据 */
  "list": (GenAuthSdkQuickFilterInviteeRecordDto)[];
}

export interface GenAuthSdkListInvitationUserDto {
  /** 邀请名单 ID */
  "rosterId": string;
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 用于根据名单的名称或受邀人 ID 进行模糊搜索，可选。 */
  "keywords"?: undefined | string;
  /** 高级筛选条件 */
  "filter"?: undefined | GenAuthSdkCombineFiltersBaseDto;
  /** 是否返回创建者详情 */
  "withCreatorDetail"?: undefined | false | true;
}

export interface GenAuthSdkInvitationUserPaginationDto {
  /** 记录总数 */
  "totalCount"?: undefined | number;
  /** 列表数据 */
  "list": (GenAuthSdkInvitationUserDto)[];
}

export interface GenAuthSdkDeleteRosterUsersDto {
  /** 受邀人 ID 列表 */
  "inviteeIds": (string)[];
  /** 名单 ID */
  "rosterId": string;
}

export interface GenAuthSdkImportExportTemplateRespDto {
  /** 文件路径地址 */
  "key": string;
  /** 文件地址 */
  "url": string;
}

export interface GenAuthSdkImportUsersDto {
  /** 名单 ID */
  "rosterId": string;
  /** 文件 */
  "file": string;
}

export interface GenAuthSdkImportInviteeDto {
  /** 操作是否成功 */
  "success": boolean;
  /** 操作结果 */
  "msg"?: undefined | false | true;
  /** 数据检查结果 */
  "failed"?: undefined | (unknown)[];
  /** 数据导入结果 */
  "insertRes"?: undefined | (unknown)[];
}

export interface GenAuthSdkExportUsersDto {
  /** 名单 ID */
  "rosterId": string;
}

export interface GenAuthSdkObject71 {
  /** 分组 code * */
  "code": string;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkGroupDto {
  /** 分组 ID */
  "id": string;
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description": string;
  /** 分组类型 */
  "type": string;
  /** 分组元数据信息 */
  "metadataSource": (string)[];
  /** 成员列表 */
  "members": (GenAuthSdkUserDto)[];
}

export interface GenAuthSdkObject72 {
  /** 搜索分组 code 或分组名称 * */
  "keywords"?: undefined | string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否展示元数据内容 * */
  "withMetadata"?: undefined | false | true;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否拍平扩展字段 * */
  "flatCustomData"?: undefined | false | true;
}

export interface GenAuthSdkObject73 {
  /** 是否获取成员列表 * */
  "fetchMembers"?: undefined | false | true;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
}

export interface GenAuthSdkCreateGroupReqDto {
  /** 分组类型 */
  "type": string;
  /** 分组描述 */
  "description": string;
  /** 分组名称 */
  "name": string;
  /** 分组 code */
  "code": string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
}

export interface GenAuthSdkCreateOrUpdateGroupReqDto {
  /** 分组类型 */
  "type": string;
  /** 分组描述 */
  "description": string;
  /** 分组名称 */
  "name": string;
  /** 分组 code */
  "code": string;
}

export interface GenAuthSdkCreateOrUpdateGroupDataDto {
  /** 是否创建 */
  "created": boolean;
  /** 群组信息 */
  "data": GenAuthSdkGroupDto;
}

export interface GenAuthSdkCreateGroupBatchReqDto {
  /** 批量分组 */
  "list": (GenAuthSdkCreateGroupReqDto)[];
}

export interface GenAuthSdkUpdateGroupReqDto {
  /** 分组描述 */
  "description": string;
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name"?: undefined | string;
  /** 分组新的 code */
  "newCode"?: undefined | string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
}

export interface GenAuthSdkDeleteGroupsReqDto {
  /** 分组 code 列表 */
  "codeList": (string)[];
}

export interface GenAuthSdkAddGroupMembersReqDto {
  /** 用户 ID 数组 */
  "userIds": (string)[];
  /** 分组 code */
  "code": string;
}

export interface GenAuthSdkRemoveGroupMembersReqDto {
  /** 用户 ID 数组 */
  "userIds": (string)[];
  /** 分组 code */
  "code": string;
}

export interface GenAuthSdkObject74 {
  /** 分组 code * */
  "code": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 identities * */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
  /** 是否拍平扩展字段 * */
  "flatCustomData"?: undefined | false | true;
}

export interface GenAuthSdkObject75 {
  /** 分组 code * */
  "code": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
  /** 资源类型 * */
  "resourceType"?: undefined | "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthSdkAuthorizedResourceDto {
  /** 资源描述符 */
  "resourceCode": string;
  /** 资源描述信息 */
  "description"?: undefined | string;
  /** 策略 Condition */
  "condition"?: undefined | (GenAuthSdkPolicyCondition)[];
  /** 资源类型 */
  "resourceType": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** API URL */
  "apiIdentifier": string;
  /** 授权的操作列表 */
  "actions": (string)[];
  /** 允许还是拒绝 */
  "effect": "ALLOW" | "DENY";
}

export interface GenAuthSdkObject76 {
  /** 权限分组(权限空间)内角色的唯一标识符 * */
  "code": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkRoleDto {
  /** 角色 ID */
  "id": string;
  /** 权限分组(权限空间)内角色的唯一标识符 Code */
  "code": string;
  /** 权限分组(权限空间)内角色名称 */
  "name": string;
  /** 角色描述 */
  "description": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace": string;
  /** 所属权限分组(权限空间)的名称 */
  "namespaceName": string;
  /** 角色状态，ENABLE-表示正常，DISABLE-表示禁止 */
  "status"?: undefined | string;
  /** 角色自动禁止时间，单位毫秒, 如果传null表示永久有效 */
  "disableTime"?: undefined | number;
  /** 是否开启可申请权限，另外应用必须开启 SSO 单点登录和未授权用户可以在应用面板中看到该应用配置 */
  "enablePermissionApply"?: undefined | false | true;
}

export interface GenAuthSdkAssignRoleDto {
  /** 目标对象 */
  "targets": (GenAuthSdkTargetDto)[];
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 主体过期时间毫秒值, 为 null 时永久有效 */
  "endTime"?: undefined | number;
  /** 主体加入时间毫秒值, 为 null 时立即加入 */
  "enableTime"?: undefined | number;
  /** 所属权限分组的 code */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkAssignRoleBatchDto {
  /** 分配角色的目标列表 */
  "targets": (GenAuthSdkTargetDto)[];
  /** 角色信息列表 */
  "roles": (GenAuthSdkRoleCodeDto)[];
}

export interface GenAuthSdkRevokeRoleDto {
  /** 移除角色的目标 */
  "targets": (GenAuthSdkTargetDto)[];
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组的 code */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkRevokeRoleBatchDto {
  /** 移除角色的目标列表 */
  "targets": (GenAuthSdkTargetDto)[];
  /** 角色信息列表 */
  "roles": (GenAuthSdkRoleCodeDto)[];
}

export interface GenAuthSdkObject77 {
  /** 权限分组内角色的唯一标识符 * */
  "code": string;
  /** 所属权限分组的 code * */
  "namespace"?: undefined | string;
  /** 资源类型，如 数据、API、按钮、菜单 * */
  "resourceType"?: undefined | "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthSdkRoleAuthorizedResourcePagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthSdkRoleAuthorizedResourcesRespDto)[];
}

export interface GenAuthSdkObject78 {
  /** 权限分组内角色的唯一标识符 * */
  "code": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否获取自定义数据 * */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 identities * */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 * */
  "withDepartmentIds"?: undefined | false | true;
  /** 所属权限分组的 code * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkObject79 {
  /** 权限分组内角色的唯一标识符 * */
  "code": string;
  /** 所属权限分组的 code * */
  "namespace"?: undefined | string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkRoleDepartmentListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthSdkRoleDepartmentRespDto)[];
}

export interface GenAuthSdkCreateRoleDto {
  /** 权限分组（权限空间）内角色的唯一标识符 */
  "code": string;
  /** 权限分组（权限空间）内角色名称 */
  "name"?: undefined | string;
  /** 所属权限分组(权限空间)的 code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
  /** 角色描述 */
  "description"?: undefined | string;
  /** 角色自动禁止时间，单位毫秒, 如果传null表示永久有效 */
  "disableTime"?: undefined | string;
}

export interface GenAuthSdkObject80 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 用于根据角色的 code 或者名称进行模糊搜索，可选。 * */
  "keywords"?: undefined | string;
  /** 所属权限分组(权限空间)的 code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkDeleteRoleDto {
  /** 角色 code 列表 */
  "codeList": (string)[];
  /** 所属权限分组(权限空间)的 code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkCreateRolesBatch {
  /** 角色列表 */
  "list": (GenAuthSdkRoleListItem)[];
}

export interface GenAuthSdkUpdateRoleDto {
  /** 权限分组（权限空间）角色名称 */
  "name": string;
  /** 角色新的权限分组（权限空间）内唯一识别码 */
  "newCode": string;
  /** 权限分组(权限空间）内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组(权限空间)的 code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
  /** 角色描述 */
  "description"?: undefined | string;
  /** 角色状态，ENABLE-表示正常，DISABLE-表示禁止 */
  "status"?: undefined | string;
  /** 角色自动禁止时间，单位毫秒, 如果传null表示永久有效 */
  "disableTime"?: undefined | string;
  /** 是否开启可申请权限，另外应用必须开启 SSO 单点登录和未授权用户可以在应用面板中看到该应用配置 */
  "enablePermissionApply"?: undefined | false | true;
}

export interface GenAuthSdkDeleteRoleBatchDto {
  /** 角色 Code 和 namespace 列表 */
  "roleList": (GenAuthSdkRoleCodeAndNamespaceDto)[];
}

export interface GenAuthSdkCheckRoleParamsDto {
  /** 权限分组（权限空间）内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组(权限空间)的 Code，不传使用默认权限分组。 */
  "namespace": string;
  /** 权限分组（权限空间）内角色名称 */
  "name"?: undefined | string;
}

export interface GenAuthSdkCheckRoleParamsRespDto {
  /** 权限空间名称或者权限空间 Code 校验是否有效 */
  "isValid": boolean;
  /** 权限空间名称或权限空间 Code 校验失败提示信息,如果校验成功, Message 不返回 */
  "message": boolean;
}

export interface GenAuthSdkObject81 {
  /** 角色 code,只能使用字母、数字和 -_，最多 50 字符 * */
  "roleCode": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 按角色 Code 或者角色名称查询 * */
  "query"?: undefined | string;
  /** 权限空间code * */
  "namespaceCode"?: undefined | string;
  /** 目标类型，接受用户，部门 * */
  "targetType"?: undefined | ("USER" | "ORG")[];
}

export interface GenAuthSdkRoleListPageDto {
  /** 记录总数 */
  "totalCount"?: undefined | number;
  /** 响应数据 */
  "data": (GenAuthSdkRolePermissionListDto)[];
}

export interface GenAuthSdkCreateAdminRoleDto {
  /** 管理员角色名称 */
  "name": string;
  /** 管理员角色的唯一标识符 */
  "code": string;
  /** 角色描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkDeleteAdminRoleDto {
  /** 角色 code 列表 */
  "codeList": (string)[];
}

export interface GenAuthSdkCheckRoleMutualExclusionReqDto {
  /** 角色信息列表 */
  "roles": (GenAuthSdkRoleCodeDto)[];
}

export interface GenAuthSdkCheckRoleMutualExclusionResultDto {
  /** 角色列表中是否存在互斥关系 */
  "existMutuallyExclusive": boolean;
}

export interface GenAuthSdkObject82 {
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 应用 ID * */
  "appId"?: undefined | string;
}

export interface GenAuthSdkExtIdpListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkExtIdpDto)[];
}

export interface GenAuthSdkObject83 {
  /** 身份源 ID * */
  "id": string;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 应用 ID * */
  "appId"?: undefined | string;
  /** 身份源类型 * */
  "type"?: undefined | "social" | "enterprise";
}

export interface GenAuthSdkExtIdpDetail {
  /** 身份源 id */
  "id": string;
  /** 身份源名称 */
  "name": string;
  /** 身份源的 Logo */
  "logo": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 身份源类型 */
  "type": string;
  /** 身份源的连接列表 */
  "connections": unknown;
  /** 租户场景下自动加入 */
  "autoJoin": boolean;
}

export interface GenAuthSdkCreateExtIdpDto {
  /** 身份源名称 */
  "name": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5";
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkExtIdpDto {
  /** 身份源 id */
  "id": string;
  /** 身份源名称 */
  "name": string;
  /** 身份源的 Logo */
  "logo": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 身份源类型 */
  "type": string;
}

export interface GenAuthSdkUpdateExtIdpDto {
  /** 名称 */
  "name": string;
  /** 身份源 ID */
  "id": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkDeleteExtIdpDto {
  /** 身份源 ID */
  "id": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkCreateExtIdpConnDto {
  /** 身份源连接 ID */
  "extIdpId": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:authing:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5";
  /** 身份源连接标识 */
  "identifier": string;
  /** 连接在登录页的显示名称 */
  "displayName": string;
  /** 连接的自定义配置信息 */
  "fields": unknown;
  /** 是否只支持登录 */
  "loginOnly"?: undefined | false | true;
  /** 身份源图标 */
  "logo"?: undefined | string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkExtIdpConnDetail {
  /** 身份源连接 id */
  "id": string;
  /** 身份源连接类型 */
  "type": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:authing:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5";
  /** 身份源 ID */
  "extIdpId": string;
  /** 身份源连接图标 */
  "logo": string;
  /** 身份源连接标识 */
  "identifier"?: undefined | string;
  /** 身份源连接在登录页的显示名称 */
  "displayName"?: undefined | string;
  /** 是否只支持登录 */
  "loginOnly": boolean;
  /** 账号关联模式 */
  "associationMode": "none" | "field" | "challenge";
  /** 账号绑定方式 */
  "challengeBindingMethods": (string)[];
}

export interface GenAuthSdkUpdateExtIdpConnDto {
  /** 身份源连接 ID */
  "id": string;
  /** 身份源连接显示名称 */
  "displayName": string;
  /** 身份源连接自定义参数（增量修改） */
  "fields": unknown;
  /** 身份源连接的图标 */
  "logo"?: undefined | string;
  /** 是否只支持登录 */
  "loginOnly"?: undefined | false | true;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkDeleteExtIdpConnDto {
  /** 身份源连接 ID */
  "id": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkChangeExtIdpConnStateDto {
  /** 身份源连接 ID */
  "id": string;
  /** 是否开启身份源连接 */
  "enabled": boolean;
  /** 应用 ID */
  "appId": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 应用 ID 列表 */
  "appIds"?: undefined | (string)[];
}

export interface GenAuthSdkChangeExtIdpAssociationStateDto {
  /** 身份源连接 ID */
  "id": string;
  /** 是否关联身份源 */
  "association": boolean;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject84 {
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 应用 ID * */
  "appId"?: undefined | string;
  /** 身份源类型 * */
  "type"?: undefined | "social" | "enterprise";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkObject85 {
  /** 身份源 ID * */
  "id": string;
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 应用 ID * */
  "appId"?: undefined | string;
  /** 身份源类型 * */
  "type"?: undefined | "social" | "enterprise";
}

export interface GenAuthSdkGetWechatAccessTokenDto {
  /** 微信小程序或微信公众号的 AppId */
  "appId": string;
  /** 微信小程序或微信公众号的 AppSecret */
  "appSecret": string;
}

export interface GenAuthSdkGetWechatAccessTokenDataDto {
  /** Authing 服务器缓存的微信 Access Token */
  "accessToken": string;
  /** Access Token 到期时间，为单位为秒的时间戳 */
  "expiresAt": string;
}

export interface GenAuthSdkCustomFieldDto {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 创建时间，只针对自定义字段有效，内置字段没有创建时间。 */
  "createdAt"?: undefined | string;
  /** 数据类型，**设置之后将不能进行修改**。 - `STRING`: 字符串类型 - `NUMBER`: 数字类型 - `DATETIME`: 日期类型 - `BOOLEAN`: 布尔类型 - `ENUM`: 枚举值类型 */
  "dataType": "STRING" | "NUMBER" | "DATETIME" | "BOOLEAN" | "ENUM";
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
  /** 显示名称 */
  "label": string;
  /** 详细描述信息 */
  "description"?: undefined | string;
  /** 是否加密存储。开启后，该字段的**新增数据**将被加密，此参数一旦设置不可更改。 */
  "encrypted"?: undefined | false | true;
  /** 是否为唯一字段，开启之后，当前字段上报的值将进行唯一校验。此参数只针对数据类型为字符串和数字的字段有效。 */
  "isUnique": boolean;
  /** 用户是否可编辑，如果是手机号、邮箱等特殊字段，用户不能直接修改，需要先通过验证码等方式进行验证。 */
  "userEditable"?: undefined | false | true;
  /** 是否需要在 Authing 控制台中进行显示： - 如果是用户自定义字段，控制是否在用户详情展示； - 如果是部门自定义字段，控制是否在部门详情中展示； - 如果是角色扩展字段，控制是否在角色详情中展示。 */
  "visibleInAdminConsole": boolean;
  /** 是否在用户个人中心展示（此参数不控制 API 接口是否返回）。 */
  "visibleInUserCenter"?: undefined | false | true;
  /** 多语言显示名称 */
  "i18n"?: undefined | GenAuthSdkCustomFieldI18n;
  /** 枚举值类型选择项 */
  "options"?: undefined | (GenAuthSdkCustomFieldSelectOption)[];
}

export interface GenAuthSdkObject86 {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 ;该接口暂不支持分组(GROUP) * */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 字段类型 * */
  "dataType": "STRING" | "NUMBER" | "DATETIME" | "BOOLEAN" | "OBJECT" | "SELECT";
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 用户是否可见 * */
  "userVisible"?: undefined | false | true;
  /** 管理员是否可见 * */
  "adminVisible"?: undefined | false | true;
  /** 访问控制 * */
  "accessControl"?: undefined | false | true;
  /** 搜索关键词 * */
  "keyword"?: undefined | string;
  /** 搜索语言 * */
  "lang"?: undefined | string;
}

export interface GenAuthSdkListCustomFieldsDto {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 ;该接口暂不支持分组(GROUP) */
  "targetType"?: unknown;
  /** 字段类型 */
  "dataType"?: unknown;
  /** 租户 ID */
  "tenantId"?: unknown;
  /** 当前页数，从 1 开始 */
  "page"?: unknown;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: unknown;
  /** 用户是否可见 */
  "userVisible"?: unknown;
  /** 管理员是否可见 */
  "adminVisible"?: unknown;
  /** 访问控制 */
  "accessControl"?: unknown;
  /** 搜索关键词 */
  "keyword"?: unknown;
  /** 搜索语言 */
  "lang"?: unknown;
}

export interface GenAuthSdkSetUserBaseFieldsReqDto {
  /** 自定义字段列表 */
  "list": (GenAuthSdkSetUserBaseFieldDto)[];
}

export interface GenAuthSdkObject87 {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 ;该接口暂不支持分组(GROUP) * */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 租户 ID * */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkObject88 {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 ;该接口暂不支持分组(GROUP) * */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 字段类型 * */
  "dataType": "STRING" | "NUMBER" | "DATETIME" | "BOOLEAN" | "OBJECT" | "SELECT";
  /** 租户 ID * */
  "tenantId"?: undefined | string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 用户是否可见 * */
  "userVisible"?: undefined | false | true;
  /** 管理员是否可见 * */
  "adminVisible"?: undefined | false | true;
  /** 访问控制 * */
  "accessControl"?: undefined | false | true;
  /** 搜索关键词 * */
  "keyword"?: undefined | string;
  /** 搜索语言 * */
  "lang"?: undefined | string;
}

export interface GenAuthSdkSetCustomFieldsReqDto {
  /** 自定义字段列表 */
  "list": (GenAuthSdkSetCustomFieldDto)[];
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkDeleteCustomFieldsReqDto {
  /** 租户 ID */
  "tenantId": string;
  /** 自定义字段列表 */
  "list": (GenAuthSdkDeleteCustomFieldDto)[];
}

export interface GenAuthSdkSetCustomDataReqDto {
  /** 自定义数据列表 */
  "list": (GenAuthSdkSetCustomDataDto)[];
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` */
  "targetIdentifier": string;
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 所属权限分组的 code，当 target_type 为角色的时候需要填写，否则可以忽略 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkObject89 {
  /** 租户 ID * */
  "tenantId": string;
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 * */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` * */
  "targetIdentifier": string;
  /** 所属权限分组的 code，当 targetType 为角色的时候需要填写，否则可以忽略 * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkCreateResourceDto {
  /** 资源类型，如数据、API、按钮、菜单 */
  "type": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源唯一标志符 */
  "code": string;
  /** 资源描述 */
  "description"?: undefined | string;
  /** 资源名称 */
  "name"?: undefined | string;
  /** 资源定义的操作类型 */
  "actions"?: undefined | (GenAuthSdkResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: undefined | string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源描述 */
  "description"?: undefined | string;
  /** 资源名称 */
  "name"?: undefined | string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源定义的操作类型 */
  "actions"?: undefined | (GenAuthSdkResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: undefined | string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
  /** 租户应用是否关联自建应用资源 */
  "linkedToTenant"?: undefined | false | true;
}

export interface GenAuthSdkCreateResourcesBatchDto {
  /** 资源列表 */
  "list": (GenAuthSdkCreateResourceBatchItemDto)[];
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkObject90 {
  /** 资源唯一标志符 * */
  "code": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkObject91 {
  /** 资源 code 列表，批量可以使用逗号分隔 * */
  "codeList": (string)[];
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkObject92 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 查询条件 * */
  "keyword"?: undefined | string;
  /** 权限空间列表 * */
  "namespaceCodeList"?: undefined | string;
}

export interface GenAuthSdkCommonResourcePagingDto {
  /** 业务状态码，可以通过此状态码判断操作是否成功，200 表示成功。 */
  "statusCode": number;
  /** 描述信息 */
  "message": string;
  /** 细分错误码，可通过此错误码得到具体的错误类型（成功请求不返回）。详细错误码列表请见：[API Code 列表](https://api-explorer.authing.cn/?tag=group/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87#tag/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87/%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86/apiCode) */
  "apiCode"?: undefined | number;
  /** 请求 ID。当请求失败时会返回。 */
  "requestId"?: undefined | string;
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthSdkCommonResourceDto)[];
}

export interface GenAuthSdkObject93 {
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
  /** 资源类型 * */
  "type"?: undefined | "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkResourcePagingDto {
  /** 业务状态码，可以通过此状态码判断操作是否成功，200 表示成功。 */
  "statusCode": number;
  /** 描述信息 */
  "message": string;
  /** 细分错误码，可通过此错误码得到具体的错误类型（成功请求不返回）。详细错误码列表请见：[API Code 列表](https://api-explorer.authing.cn/?tag=group/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87#tag/%E5%BC%80%E5%8F%91%E5%87%86%E5%A4%87/%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86/apiCode) */
  "apiCode"?: undefined | number;
  /** 请求 ID。当请求失败时会返回。 */
  "requestId"?: undefined | string;
  /** 记录总数 */
  "totalCount": number;
  /** 数据 */
  "list": (GenAuthSdkResourceDto)[];
}

export interface GenAuthSdkUpdateResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源描述 */
  "description"?: undefined | string;
  /** 资源名称 */
  "name"?: undefined | string;
  /** 资源定义的操作类型 */
  "actions"?: undefined | (GenAuthSdkResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: undefined | string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type"?: undefined | "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthSdkDeleteResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkDeleteResourcesBatchDto {
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
  /** 资源 Code 列表 */
  "codeList"?: undefined | (string)[];
  /** 资源 Id 列表 */
  "ids"?: undefined | (string)[];
}

export interface GenAuthSdkDeleteCommonResourcesBatchDto {
  /** 资源 id 列表 */
  "ids": (string)[];
}

export interface GenAuthSdkAssociateTenantResourceDto {
  /** 资源 Code */
  "code": string;
  /** 是否关联应用资源 */
  "association": boolean;
  /** 应用 ID */
  "appId": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkCreateNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组名称 */
  "name"?: undefined | string;
  /** 权限分组描述信息 */
  "description"?: undefined | string;
}

export interface GenAuthSdkNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组名称 */
  "name"?: undefined | string;
  /** 权限分组描述信息 */
  "description"?: undefined | string;
}

export interface GenAuthSdkCreateNamespacesBatchDto {
  /** 权限分组列表 */
  "list": (GenAuthSdkCreateNamespacesBatchItemDto)[];
}

export interface GenAuthSdkObject94 {
  /** 权限分组唯一标志符 * */
  "code": string;
}

export interface GenAuthSdkObject95 {
  /** 权限分组 code 列表，批量可以使用逗号分隔 * */
  "codeList": (string)[];
}

export interface GenAuthSdkUpdateNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组描述信息 */
  "description"?: undefined | string;
  /** 权限分组名称 */
  "name"?: undefined | string;
  /** 权限分组新的唯一标志符 */
  "newCode"?: undefined | string;
}

export interface GenAuthSdkDeleteNamespaceDto {
  /** 权限分组唯一标志符 */
  "code": string;
}

export interface GenAuthSdkDeleteNamespacesBatchDto {
  /** 权限分组 code 列表 */
  "codeList": (string)[];
}

export interface GenAuthSdkObject96 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 搜索权限分组 Code * */
  "keywords"?: undefined | string;
}

export interface GenAuthSdkNamespaceListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkNamespacesListRespDto)[];
}

export interface GenAuthSdkObject97 {
  /** 权限分组唯一标志符 * */
  "code": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 角色 Code 或者名称 * */
  "keywords"?: undefined | string;
}

export interface GenAuthSdkNamespaceRolesListRespDto {
  /** 角色 ID */
  "id": string;
  /** 角色名称 */
  "name": string;
  /** 角色 Code */
  "code": string;
  /** 角色 描述信息 */
  "description"?: undefined | string;
  /** 权限分组 Code */
  "namespace": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkAuthorizeResourcesDto {
  /** 授权资源列表 */
  "list": (GenAuthSdkAuthorizeResourceItem)[];
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkObject98 {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 * */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` * */
  "targetIdentifier": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 * */
  "namespace"?: undefined | string;
  /** 限定资源类型，如数据、API、按钮、菜单 * */
  "resourceType"?: undefined | "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 限定查询的资源列表，如果指定，只会返回所指定的资源列表。  resourceList 参数支持前缀匹配，例如： - 授权了一个资源为 `books:123`，可以通过 `books:*` 来匹配； - 授权了一个资源为 `books:fictions_123`，可以通过 `books:fictions_` 来匹配； * */
  "resourceList"?: undefined | (string)[];
  /** 是否获取被拒绝的资源 * */
  "withDenied"?: undefined | false | true;
}

export interface GenAuthSdkIsActionAllowedDto {
  /** 用户 ID */
  "userId": string;
  /** 资源对应的操作 */
  "action": string;
  /** 资源标识符 */
  "resource": string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkIsActionAllowedDataDto {
  /** 是否允许 */
  "allowed": boolean;
}

export interface GenAuthSdkGetResourceAuthorizedTargetsDto {
  /** 资源 */
  "resource": string;
  /** 权限分组 */
  "namespace"?: undefined | string;
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 */
  "targetType"?: undefined | "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
}

export interface GenAuthSdkGetResourceAuthorizedTargetDataDto {
  /** 总数 */
  "totalCount": number;
  /** 元素列表 */
  "list": (GenAuthSdkResourceAuthorizedTargetDto)[];
}

export interface GenAuthSdkGetUserActionLogsDto {
  /** 请求 ID */
  "requestId"?: undefined | string;
  /** 客户端 IP */
  "clientIp"?: undefined | string;
  /** 事件类型，用户的一系列操作，比如 login、logout、register、verifyMfa 等 */
  "eventType"?: undefined | string;
  /** 用户 ID */
  "userId"?: undefined | string;
  /** 应用 ID */
  "appId"?: undefined | string;
  /** 开始时间戳 */
  "start"?: undefined | number;
  /** 结束时间戳 */
  "end"?: undefined | number;
  /** 请求是否成功 */
  "success"?: undefined | false | true;
  /** 分页 */
  "pagination"?: undefined | GenAuthSdkListWebhooksDto;
}

export interface GenAuthSdkUserActionLogRespData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthSdkUserActionLogDto)[];
}

export interface GenAuthSdkGetAdminAuditLogsDto {
  /** 请求 ID */
  "requestId"?: undefined | string;
  /** 客户端 IP */
  "clientIp"?: undefined | string;
  /** 操作类型，例如 create、update、delete、login 等 */
  "operationType"?: undefined | string;
  /** 资源类型，例如 DATA、API、BUTTON 等 */
  "resourceType"?: undefined | string;
  /** 管理员用户 ID */
  "userId"?: undefined | string;
  /** 请求是否成功 */
  "success"?: undefined | false | true;
  /** 开始时间戳 */
  "start"?: undefined | number;
  /** 结束时间戳 */
  "end"?: undefined | number;
  /** 分页 */
  "pagination"?: undefined | GenAuthSdkListWebhooksDto;
}

export interface GenAuthSdkAdminAuditLogRespData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthSdkAdminAuditLogDto)[];
}

export interface GenAuthSdkGetEmailTemplatesDataDto {
  /** 模版列表 */
  "templates": (GenAuthSdkEmailTemplateDto)[];
  /** 模版类型列表 */
  "categories": (GenAuthSdkEmailTemplateCategoryDto)[];
}

export interface GenAuthSdkPreviewEmailTemplateDto {
  /** 模版类型: - `WELCOME_EMAIL`: 欢迎邮件 - `FIRST_CREATED_USER`: 首次创建用户通知 - `REGISTER_VERIFY_CODE`: 注册验证码 - `LOGIN_VERIFY_CODE`: 登录验证码 - `MFA_VERIFY_CODE`: MFA 验证码 - `INFORMATION_COMPLETION_VERIFY_CODE`: 注册信息补全验证码 - `FIRST_EMAIL_LOGIN_VERIFY`: 首次邮箱登录验证 - `CONSOLE_CONDUCTED_VERIFY`: 在控制台发起邮件验证 - `USER_PASSWORD_UPDATE_REMIND`: 用户到期提醒 - `ADMIN_RESET_USER_PASSWORD_NOTIFICATION`: 管理员重置用户密码成功通知 - `USER_PASSWORD_RESET_NOTIFICATION`: 用户密码重置成功通知 - `RESET_PASSWORD_VERIFY_CODE`: 重置密码验证码 - `SELF_UNLOCKING_VERIFY_CODE`: 自助解锁验证码 - `EMAIL_BIND_VERIFY_CODE`: 绑定邮箱验证码 - `EMAIL_UNBIND_VERIFY_CODE`: 解绑邮箱验证码 */
  "type": "WELCOME_EMAIL" | "FIRST_CREATED_USER" | "REGISTER_VERIFY_CODE" | "LOGIN_VERIFY_CODE" | "MFA_VERIFY_CODE" | "INFORMATION_COMPLETION_VERIFY_CODE" | "FIRST_EMAIL_LOGIN_VERIFY" | "CONSOLE_CONDUCTED_VERIFY" | "USER_PASSWORD_UPDATE_REMIND" | "ADMIN_RESET_USER_PASSWORD_NOTIFICATION" | "USER_PASSWORD_RESET_NOTIFICATION" | "RESET_PASSWORD_VERIFY_CODE" | "SELF_UNLOCKING_VERIFY_CODE" | "EMAIL_BIND_VERIFY_CODE" | "EMAIL_UNBIND_VERIFY_CODE";
  /** 邮件内容模版，可选，如果不传默认使用用户池配置的邮件模版进行渲染。 */
  "content"?: undefined | string;
  /** 邮件主题，可选，如果不传默认使用用户池配置的邮件模版进行渲染。 */
  "subject"?: undefined | string;
  /** 邮件发件人名称，可选，如果不传默认使用用户池配置的邮件模版进行渲染。 */
  "sender"?: undefined | string;
  /** 验证码/邮件有效时间，只有验证类邮件才有有效时间。可选，如果不传默认使用用户池配置的邮件模版进行渲染。 */
  "expiresIn"?: undefined | number;
  /** 模版渲染引擎。Authing 邮件模版目前支持两种渲染引擎： - `handlebar`: 详细使用方法请见：[handlebars 官方文档](https://handlebarsjs.com/) - `ejs`: 详细使用方法请见：[ejs 官方文档](https://ejs.co/)  默认将使用 `handlerbar` 作为模版渲染引擎。 */
  "tplEngine"?: undefined | "handlebar" | "ejs";
}

export interface GenAuthSdkPreviewEmailTemplateDataDto {
  /** 预览的邮件主体内容，为 html 格式文本 */
  "content": string;
  /** 预览的邮件主题内容 */
  "subject": string;
  /** 预览的邮件发件人内容 */
  "sender": string;
}

export interface GenAuthSdkEmailProviderDto {
  /** 是否启用，如果不启用，将默认使用 Authing 内置的邮件服务 */
  "enabled": boolean;
  /** 第三方邮件服务商类型: - `custom`: 自定义 SMTP 邮件服务 - `ali`: [阿里企业邮箱](https://www.ali-exmail.cn/Land/) - `qq`: [腾讯企业邮箱](https://work.weixin.qq.com/mail/) - `sendgrid`: [SendGrid 邮件服务](https://sendgrid.com/) */
  "type"?: undefined | "ali" | "qq" | "sendgrid" | "custom";
  /** SMTP 邮件服务配置 */
  "smtpConfig"?: undefined | GenAuthSdkSMTPEmailProviderConfig;
  /** SendGrid 邮件服务配置 */
  "sendGridConfig"?: undefined | GenAuthSdkSendGridEmailProviderConfig;
  /** 阿里企业邮件服务配置 */
  "aliExmailConfig"?: undefined | GenAuthSdkAliExmailEmailProviderConfig;
  /** 腾讯企业邮件服务配置 */
  "tencentExmailConfig"?: undefined | GenAuthSdkTencentExmailEmailProviderConfig;
}

export interface GenAuthSdkConfigEmailProviderDto {
  /** 第三方邮件服务商类型: - `custom`: 自定义 SMTP 邮件服务 - `ali`: [阿里企业邮箱](https://www.ali-exmail.cn/Land/) - `qq`: [腾讯企业邮箱](https://work.weixin.qq.com/mail/) - `sendgrid`: [SendGrid 邮件服务](https://sendgrid.com/) */
  "type": "ali" | "qq" | "sendgrid" | "custom";
  /** 是否启用，如果不启用，将默认使用 Authing 内置的邮件服务 */
  "enabled": boolean;
  /** SMTP 邮件服务配置 */
  "smtpConfig"?: undefined | GenAuthSdkSMTPEmailProviderConfigInput;
  /** SendGrid 邮件服务配置 */
  "sendGridConfig"?: undefined | GenAuthSdkSendGridEmailProviderConfigInput;
  /** 阿里企业邮件服务配置 */
  "aliExmailConfig"?: undefined | GenAuthSdkAliExmailEmailProviderConfigInput;
  /** 腾讯企业邮件服务配置 */
  "tencentExmailConfig"?: undefined | GenAuthSdkTencentExmailEmailProviderConfigInput;
}

export interface GenAuthSdkObject99 {
  /** 应用 ID * */
  "appId": string;
}

export interface GenAuthSdkApplicationDto {
  /** 应用 ID */
  "appId": string;
  /** 应用唯一标志 */
  "appIdentifier": string;
  /** 应用名称 */
  "appName": string;
  /** 应用 Logo 链接 */
  "appLogo": string;
  /** 应用描述信息 */
  "appDescription"?: undefined | string;
  /** 应用类型 */
  "appType": "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 用户池 ID */
  "userPoolId": string;
  /** 是否为集成应用 */
  "isIntegrateApp": boolean;
  /** 默认应用协议类型 */
  "defaultProtocol": "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris": (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris": (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri": string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled": boolean;
  /** 开启 SSO 单点登录的时间 */
  "ssoEnabledAt"?: undefined | string;
  /** 登录配置 */
  "loginConfig": GenAuthSdkApplicationLoginConfigDto;
  /** 注册配置 */
  "registerConfig": GenAuthSdkApplicationRegisterConfig;
  /** 品牌化配置 */
  "brandingConfig": GenAuthSdkApplicationBrandingConfig;
  /** OIDC 协议配置 */
  "oidcConfig": Record<string, unknown>;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled": boolean;
  /** SAML 协议配置 */
  "samlConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled": boolean;
  /** OAuth2.0 协议配置 */
  "oauthConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled": boolean;
  /** CAS 协议配置 */
  "casConfig"?: undefined | Record<string, unknown>;
  /** 是否自定义本应用的登录框，默认走全局的登录框配置。 */
  "customBrandingEnabled": boolean;
  /** 是否自定义本应用的安全规则，默认走全局的安全配置。 */
  "customSecurityEnabled": boolean;
  /** 集成应用的模版类型 */
  "template"?: undefined | string;
}

export interface GenAuthSdkObject100 {
  /** 主体 id * */
  "targetId": string;
  /** 主体类型 * */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 应用 ID * */
  "appId": string;
}

export interface GenAuthSdkGetSubjectAuthDataDto {
  /** 应用 ID */
  "appId": string;
  /** 应用名称 */
  "appName": string;
  /** 请求的主体id */
  "reqTargetId": string;
  /** 请求的主体名称 */
  "reqTargetName": string;
  /** 请求的主体类型 */
  "reqTargetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 目标主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 目标主体名称 */
  "targetName": string;
  /** 授权类型 */
  "authType": "DEFAULT" | "ALL" | "SELF" | "SUBJECT";
}

export interface GenAuthSdkListAuthSubjectDto {
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 主体 id */
  "targetId": string;
  /** 应用名称 */
  "appName"?: undefined | string;
  /** 应用类型列表 */
  "appTypeList"?: undefined | (string)[];
  /** 操作类型列表 */
  "effect"?: undefined | (string)[];
  /** 开关 */
  "enabled"?: undefined | false | true;
}

export interface GenAuthSdkListApplicationSubjectDataListDto {
  /** 列表数据 */
  "list": (GenAuthSdkListApplicationSubjectDataDto)[];
}

export interface GenAuthSdkListApplicationAuthDto {
  /** 应用 ID */
  "appId": string;
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 主体名称 */
  "targetName"?: undefined | string;
  /** 主体类型列表, USER/ORG/ROLE/GROUP */
  "targetTypeList"?: undefined | (string)[];
  /** 操作，ALLOW/DENY */
  "effect"?: undefined | "ALLOW" | "DENY";
  /** 授权是否生效开关, */
  "enabled"?: undefined | false | true;
}

export interface GenAuthSdkListApplicationAuthPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthSdkListApplicationAuthDataDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthSdkUpdateAuthEnabledDto {
  /** 授权是否生效开关, */
  "enabled": boolean;
  /** 授权 ID */
  "id": string;
}

export interface GenAuthSdkObject101 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否为集成应用 * */
  "isIntegrateApp"?: undefined | false | true;
  /** 是否为自建应用 * */
  "isSelfBuiltApp"?: undefined | false | true;
  /** 是否开启单点登录 * */
  "ssoEnabled"?: undefined | false | true;
  /** 模糊搜索字符串 * */
  "keywords"?: undefined | string;
  /** 搜索应用，true：搜索所有应用, 默认为 false * */
  "all"?: undefined | false | true;
}

export interface GenAuthSdkApplicationPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthSdkApplicationDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthSdkObject102 {
  /** 应用 ID * */
  "appId": string;
}

export interface GenAuthSdkApplicationSimpleInfoDto {
  /** 应用 ID */
  "appId": string;
  /** 应用唯一标志 */
  "appIdentifier": string;
  /** 应用名称 */
  "appName": string;
  /** 应用 Logo 链接 */
  "appLogo": string;
  /** 应用描述信息 */
  "appDescription"?: undefined | string;
  /** 应用类型 */
  "appType": "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 是否为集成应用 */
  "isIntegrateApp": boolean;
}

export interface GenAuthSdkObject103 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 是否为集成应用 * */
  "isIntegrateApp"?: undefined | false | true;
  /** 是否为自建应用 * */
  "isSelfBuiltApp"?: undefined | false | true;
  /** 是否开启单点登录 * */
  "ssoEnabled"?: undefined | false | true;
  /** 模糊搜索字符串 * */
  "keywords"?: undefined | string;
}

export interface GenAuthSdkApplicationSimpleInfoPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthSdkApplicationSimpleInfoDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthSdkCreateApplicationDto {
  /** 应用名称 */
  "appName": string;
  /** 集成应用模版类型，**集成应用必填**。集成应用只需要填 `template` 和 `templateData` 两个字段，其他的字段将被忽略。 */
  "template"?: undefined | string;
  /** 集成应用配置信息，**集成应用必填**。 */
  "templateData"?: unknown;
  /** 应用唯一标志，**自建应用必填**。 */
  "appIdentifier"?: undefined | string;
  /** 应用 Logo 链接 */
  "appLogo"?: undefined | string;
  /** 应用描述信息 */
  "appDescription"?: undefined | string;
  /** 应用类型 */
  "appType"?: undefined | "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 默认应用协议类型 */
  "defaultProtocol"?: undefined | "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris"?: undefined | (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris"?: undefined | (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri"?: undefined | string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled"?: undefined | false | true;
  /** OIDC 协议配置 */
  "oidcConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled"?: undefined | false | true;
  /** SAML 协议配置 */
  "samlConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled"?: undefined | false | true;
  /** OAuth2.0 协议配置。【重要提示】不再推荐使用 OAuth2.0，建议切换到 OIDC。 */
  "oauthConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled"?: undefined | false | true;
  /** CAS 协议配置 */
  "casConfig"?: undefined | Record<string, unknown>;
  /** 登录配置 */
  "loginConfig"?: undefined | GenAuthSdkApplicationLoginConfigInputDto;
  /** 注册配置 */
  "registerConfig"?: undefined | GenAuthSdkApplicationRegisterConfigInputDto;
  /** 品牌化配置 */
  "brandingConfig"?: undefined | GenAuthSdkApplicationBrandingConfigInputDto;
}

export interface GenAuthSdkCreateApplicationRespDataDto {
  /** 应用 ID */
  "appId": string;
  /** 应用唯一标志 */
  "appIdentifier": string;
  /** 应用名称 */
  "appName": string;
  /** 应用 Logo 链接 */
  "appLogo": string;
  /** 应用描述信息 */
  "appDescription"?: undefined | string;
  /** 应用类型 */
  "appType": "web" | "spa" | "native" | "api" | "mfa" | "mini-program" | "gateway-app" | "gateway-agent";
  /** 用户池 ID */
  "userPoolId": string;
  /** 是否为集成应用 */
  "isIntegrateApp": boolean;
  /** 默认应用协议类型 */
  "defaultProtocol": "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris": (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris": (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri": string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled": boolean;
  /** 开启 SSO 单点登录的时间 */
  "ssoEnabledAt"?: undefined | string;
  /** 登录配置 */
  "loginConfig": GenAuthSdkApplicationLoginConfigDto;
  /** 注册配置 */
  "registerConfig": GenAuthSdkApplicationRegisterConfig;
  /** 品牌化配置 */
  "brandingConfig": GenAuthSdkApplicationBrandingConfig;
  /** OIDC 协议配置 */
  "oidcConfig": Record<string, unknown>;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled": boolean;
  /** SAML 协议配置 */
  "samlConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled": boolean;
  /** OAuth2.0 协议配置 */
  "oauthConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled": boolean;
  /** CAS 协议配置 */
  "casConfig"?: undefined | Record<string, unknown>;
  /** 是否自定义本应用的登录框，默认走全局的登录框配置。 */
  "customBrandingEnabled": boolean;
  /** 是否自定义本应用的安全规则，默认走全局的安全配置。 */
  "customSecurityEnabled": boolean;
  /** 集成应用的模版类型 */
  "template"?: undefined | string;
}

export interface GenAuthSdkUpdateApplicationDto {
  /** 应用 ID */
  "appId": string;
  /** 应用名称 */
  "appName"?: undefined | string;
  /** 集成应用配置信息 */
  "templateData"?: unknown;
  /** 应用唯一标志 */
  "appIdentifier"?: undefined | string;
  /** 应用 Logo 链接 */
  "appLogo"?: undefined | string;
  /** 应用描述信息 */
  "appDescription"?: undefined | string;
  /** 默认应用协议类型 */
  "defaultProtocol"?: undefined | "oidc" | "oauth" | "saml" | "cas" | "asa";
  /** 应用登录回调地址 */
  "redirectUris"?: undefined | (string)[];
  /** 应用退出登录回调地址 */
  "logoutRedirectUris"?: undefined | (string)[];
  /** 发起登录地址：在 Authing 应用详情点击「体验登录」或在应用面板点击该应用图标时，会跳转到此 URL，默认为 Authing 登录页。 */
  "initLoginUri"?: undefined | string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled"?: undefined | false | true;
  /** OIDC 协议配置 */
  "oidcConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 SAML 身份提供商 */
  "samlProviderEnabled"?: undefined | false | true;
  /** SAML 协议配置 */
  "samlConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 OAuth 身份提供商 */
  "oauthProviderEnabled"?: undefined | false | true;
  /** OAuth2.0 协议配置。【重要提示】不再推荐使用 OAuth2.0，建议切换到 OIDC。 */
  "oauthConfig"?: undefined | Record<string, unknown>;
  /** 是否开启 CAS 身份提供商 */
  "casProviderEnabled"?: undefined | false | true;
  /** CAS 协议配置 */
  "casConfig"?: undefined | Record<string, unknown>;
  /** 登录配置 */
  "loginConfig"?: undefined | GenAuthSdkUpdateApplicationLoginConfigInputDto;
  /** 注册配置 */
  "registerConfig"?: undefined | GenAuthSdkApplicationRegisterConfigInputDto;
  /** 品牌化配置 */
  "brandingConfig"?: undefined | GenAuthSdkApplicationBrandingConfigInputDto;
  /** 未授权用户是否可以在应用面板中看到该应用 */
  "ssoShowLaunchpad"?: undefined | false | true;
  /** 是否开启可申请权限，另外应用必须开启 SSO 单点登录和未授权用户可以在应用面板中看到该应用配置 */
  "enablePermissionApply"?: undefined | false | true;
}

export interface GenAuthSdkDeleteApplicationDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthSdkObject104 {
  /** 应用 ID * */
  "appId": string;
}

export interface GenAuthSdkGetApplicationSecretDataDto {
  /** 应用密钥 */
  "secret": string;
}

export interface GenAuthSdkRefreshApplicationSecretDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthSdkRefreshApplicationSecretDataDto {
  /** 新的应用密钥 */
  "secret": string;
}

export interface GenAuthSdkListApplicationActiveUsersDto {
  /** 应用 ID */
  "appId": string;
  /** 可选项 */
  "options"?: undefined | GenAuthSdkListApplicationActiveUsersOptionsDto;
}

export interface GenAuthSdkObject105 {
  /** 应用 ID * */
  "appId": string;
}

export interface GenAuthSdkGetApplicationPermissionStrategyDataDto {
  /** 应用访问授权策略 */
  "permissionStrategy": "ALLOW_ALL" | "DENY_ALL";
}

export interface GenAuthSdkUpdateApplicationPermissionStrategyDataDto {
  /** 应用访问授权策略 */
  "permissionStrategy": "ALLOW_ALL" | "DENY_ALL";
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthSdkAuthorizeApplicationAccessDto {
  /** 应用 ID */
  "appId": string;
  /** 授权主体列表，最多 10 条 */
  "list": (GenAuthSdkApplicationPermissionRecordItem)[];
}

export interface GenAuthSdkRevokeApplicationAccessDto {
  /** 应用 ID */
  "appId": string;
  /** 授权主体列表，最多 10 条 */
  "list": (GenAuthSdkDeleteApplicationPermissionRecordItem)[];
}

export interface GenAuthSdkCheckDomainAvailable {
  /** 域名 */
  "domain": string;
}

export interface GenAuthSdkCheckDomainAvailableDataDto {
  /** 是否可用 */
  "available": boolean;
}

export interface GenAuthSdkObject106 {
  /** 获取应用列表的页码 * */
  "page": string;
  /** 每页获取的应用数量 * */
  "limit": string;
  /** 搜索关键字 * */
  "keywords": string;
  /** 应用是否加入单点登录 * */
  "ssoEnabled": boolean;
}

export interface GenAuthSdkTenantApplicationListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkTenantApplicationDto)[];
}

export interface GenAuthSdkUpdateLoginConfigDto {
  /** 应用登录配置更新内容 */
  "update": GenAuthSdkUpdateLoginConfig;
}

export interface GenAuthSdkUserPoolTenantConfigDto {
  /** UserPool ID */
  "userPoolId": string;
  /** 用户池是否作为租户 */
  "isUserPoolAsTenant": boolean;
  /** 允许切换的类型 */
  "enableSwitchType": "tenant-console" | "tenant-app" | "tenant-launpad";
  /** 自定义 CSS */
  "css": string;
  /** 是否启用自定义 CSS */
  "cssEnabled": boolean;
  /** 自定义 Loading */
  "customLoading": string;
  /** 是否开启 Guard 切换 */
  "enableGuardVersionSwitch": boolean;
  /** 使用 Guard 的版本 */
  "guardVersion": string;
  /** 自定义 Loading 背景 */
  "loadingBackground": string;
  /** 是否允许创建租户 */
  "enableCreateTenant": boolean;
  /** 允许创建租户的场景 */
  "createTenantScenes": (string)[];
  /** 是否允许加入租户 */
  "enableJoinTenant": boolean;
  /** 允许创建加入的场景 */
  "joinTenantScenes": (string)[];
  /** 是否校验企业域名 */
  "enableVerifyDomain": boolean;
  /** 校验企业域名的场景 */
  "verifyDomainScenes": (string)[];
  /** 页面自定义配置 */
  "ssoPageCustomizationSettings": Record<string, unknown>;
  /** 是否允许选择门户登录 */
  "enableMultipleTenantPortal": boolean;
  /** 登录配置 */
  "loginConfig": GenAuthSdkApplicationLoginConfigDto;
}

export interface GenAuthSdkUpdateUserPoolTenantLoginConfigDto {
  /** 应用登录配置更新内容 */
  "update": GenAuthSdkUpdateLoginConfig;
}

export interface GenAuthSdkUpdateTenantAppqrcodeState {
  /** 是否允许开启扫码登录 */
  "enabled": boolean;
}

export interface GenAuthSdkChangeUserPoolTenantExtIdpConnDto {
  /** 是否开启身份源连接 */
  "enabled": boolean;
  /** 身份源连接 ID */
  "connIds": (string)[];
}

export interface GenAuthSdkUpdateApplicationMfaSettingsDto {
  /** 所属应用 ID */
  "appId": string;
  /** 开启的 MFA 认证因素列表 */
  "enabledFactors"?: undefined | ("OTP" | "SMS" | "EMAIL" | "FACE")[];
  /** 关闭的 MFA 认证因素列表 */
  "disabledFactors"?: undefined | ("OTP" | "SMS" | "EMAIL" | "FACE")[];
}

export interface GenAuthSdkMFASettingsDto {
  /** 开启的 MFA 认证因素列表 */
  "enabledFactors": ("OTP" | "SMS" | "EMAIL" | "FACE")[];
}

export interface GenAuthSdkObject107 {
  /** 所属应用 ID * */
  "appId": string;
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 * */
  "userId": string;
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 * */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkCreateAsaAccountDto {
  /** 账号信息，一般为包含 "account", "password" key 的键值对 */
  "accountInfo": unknown;
  /** 所属应用 ID */
  "appId": string;
}

export interface GenAuthSdkAsaAccountDto {
  /** 所属应用 ID */
  "appId": string;
  /** 账号 ID */
  "accountId": string;
  /** 账号信息，一般为包含 "account", "password" key 的键值对 */
  "accountInfo": unknown;
}

export interface GenAuthSdkCreateAsaAccountsBatchDto {
  /** 账号列表 */
  "list": (GenAuthSdkCreateAsaAccountsBatchItemDto)[];
  /** 所属应用 ID */
  "appId": string;
}

export interface GenAuthSdkUpdateAsaAccountDto {
  /** 账号信息，一般为包含 "account", "password" key 的键值对 */
  "accountInfo": unknown;
  /** ASA 账号 ID */
  "accountId": string;
  /** 所属应用 ID */
  "appId": string;
}

export interface GenAuthSdkObject108 {
  /** 所属应用 ID * */
  "appId": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkAsaAccountPaginatedDataDto {
  /** 列表数据 */
  "list": (GenAuthSdkAsaAccountDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthSdkObject109 {
  /** 所属应用 ID * */
  "appId": string;
  /** ASA 账号 ID * */
  "accountId": string;
}

export interface GenAuthSdkGetAsaAccountBatchDto {
  /** ASA 账号 ID 列表 */
  "accountIds": (string)[];
  /** 所属应用 ID */
  "appId": string;
}

export interface GenAuthSdkDeleteAsaAccountDto {
  /** ASA 账号 ID */
  "accountId": string;
  /** 所属应用 ID */
  "appId": string;
}

export interface GenAuthSdkDeleteAsaAccountBatchDto {
  /** ASA 账号 ID 列表 */
  "accountIds": (string)[];
  /** 所属应用 ID */
  "appId": string;
}

export interface GenAuthSdkAssignAsaAccountsDto {
  /** 所属应用 ID */
  "appId": string;
  /** 要关联的账号 ID */
  "accountId": string;
  /** 关联对象列表 */
  "targets": (GenAuthSdkAssignAsaAccountItem)[];
}

export interface GenAuthSdkObject110 {
  /** 所属应用 ID * */
  "appId": string;
  /** ASA 账号 ID * */
  "accountId": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkGetAsaAccountAssignedTargetDataDto {
  /** 总数 */
  "totalCount": number;
  /** 主体列表 */
  "list": (GenAuthSdkAsaAccountTargetDto)[];
}

export interface GenAuthSdkObject111 {
  /** 所属应用 ID * */
  "appId": string;
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 * */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` * */
  "targetIdentifier": string;
}

export interface GenAuthSdkSecuritySettingsDto {
  /** 安全域（CORS） */
  "allowedOrigins"?: undefined | string;
  /** Authing Token 有效时间（秒） */
  "authingTokenExpiresIn": number;
  /** 验证码长度。包含短信验证码、邮件验证码和图形验证码。 */
  "verifyCodeLength": number;
  /** 验证码尝试次数。在一个验证码有效周期内（默认为 60 s），用户输入验证码错误次数超过此阈值之后，将会导致当前验证码失效，需要重新发送。 */
  "verifyCodeMaxAttempts": number;
  /** 用户修改邮箱的安全策略 */
  "changeEmailStrategy": GenAuthSdkChangeEmailStrategyDto;
  /** 用户修改手机号的安全策略 */
  "changePhoneStrategy": GenAuthSdkChangePhoneStrategyDto;
  /** Cookie 过期时间设置 */
  "cookieSettings"?: undefined | GenAuthSdkCookieSettingsDto;
  /** 是否禁止用户注册，开启之后，用户将无法自主注册，只能管理员为其创建账号。针对 B2B 和 B2E 类型用户池，默认开启。 */
  "registerDisabled": boolean;
  /** 频繁注册检测配置 */
  "registerAnomalyDetection": GenAuthSdkRegisterAnomalyDetectionConfigDto;
  /** 验证码注册后是否要求用户设置密码（仅针对 Authing 登录页和 Guard 有效，不针对 API 调用）。 */
  "completePasswordAfterPassCodeLogin": boolean;
  /** 登录防暴破配置 */
  "loginAnomalyDetection": GenAuthSdkLoginAnomalyDetectionConfigDto;
  /** 当使用邮箱登录时，未验证的邮箱登录时是否禁止登录并发送认证邮件。当用户收到邮件并完成验证之后，才能进行登录。 */
  "loginRequireEmailVerified": boolean;
  /** 用户自助解锁配置。注：只有绑定了手机号/邮箱的用户才可以自助解锁 */
  "selfUnlockAccount": GenAuthSdkSelfUnlockAccountConfigDto;
  /** Authing 登录页面是否开启登录账号选择 */
  "enableLoginAccountSwitch": boolean;
  /** APP 扫码登录安全配置 */
  "qrcodeLoginStrategy": GenAuthSdkQrcodeLoginStrategyDto;
}

export interface GenAuthSdkUpdateSecuritySettingsDto {
  /** 安全域（CORS） */
  "allowedOrigins"?: undefined | (string)[];
  /** Authing Token 有效时间（秒） */
  "authingTokenExpiresIn"?: undefined | number;
  /** 验证码长度。包含短信验证码、邮件验证码和图形验证码。 */
  "verifyCodeLength"?: undefined | number;
  /** 验证码尝试次数。在一个验证码有效周期内（默认为 60 s），用户输入验证码错误次数超过此阈值之后，将会导致当前验证码失效，需要重新发送。 */
  "verifyCodeMaxAttempts"?: undefined | number;
  /** 用户修改邮箱的安全策略 */
  "changeEmailStrategy"?: undefined | GenAuthSdkChangeEmailStrategyDto;
  /** 用户修改手机号的安全策略 */
  "changePhoneStrategy"?: undefined | GenAuthSdkChangePhoneStrategyDto;
  /** Cookie 过期时间设置 */
  "cookieSettings"?: undefined | GenAuthSdkCookieSettingsDto;
  /** 是否禁止用户注册，开启之后，用户将无法自主注册，只能管理员为其创建账号。针对 B2B 和 B2E 类型用户池，默认开启。 */
  "registerDisabled"?: undefined | false | true;
  /** 频繁注册检测配置 */
  "registerAnomalyDetection"?: undefined | GenAuthSdkRegisterAnomalyDetectionConfigDto;
  /** 验证码注册后是否要求用户设置密码（仅针对 Authing 登录页和 Guard 有效，不针对 API 调用）。 */
  "completePasswordAfterPassCodeLogin"?: undefined | false | true;
  /** 登录防暴破配置 */
  "loginAnomalyDetection"?: undefined | GenAuthSdkLoginAnomalyDetectionConfigDto;
  /** 当使用邮箱登录时，未验证的邮箱登录时是否禁止登录并发送认证邮件。当用户收到邮件并完成验证之后，才能进行登录。 */
  "loginRequireEmailVerified"?: undefined | false | true;
  /** 用户自助解锁配置。注：只有绑定了手机号/邮箱的用户才可以自助解锁 */
  "selfUnlockAccount"?: undefined | GenAuthSdkSelfUnlockAccountConfigDto;
  /** Authing 登录页面是否开启登录账号选择 */
  "enableLoginAccountSwitch"?: undefined | false | true;
  /** APP 扫码登录安全配置 */
  "qrcodeLoginStrategy"?: undefined | GenAuthSdkQrcodeLoginStrategyDto;
}

export interface GenAuthSdkMFADisableSettingsDto {
  /** 关闭的 MFA 认证因素列表 */
  "disableFactors": ("OTP" | "SMS" | "EMAIL" | "FACE")[];
}

export interface GenAuthSdkCreateTenantDto {
  /** 租户名 */
  "name": string;
  /** 租户关联的应用 ID */
  "appIds": (string)[];
  /** 租户 logo */
  "logo"?: undefined | (string)[];
  /** 租户描述 */
  "description"?: undefined | string;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: undefined | string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId"?: undefined | string;
  /** 企业邮箱域名 */
  "enterpriseDomains"?: undefined | (string)[];
  /** 租户过期时间 */
  "expireTime"?: undefined | string;
  /** 租户 MAU 上限 */
  "mauAmount"?: undefined | number;
  /** 租户成员上限 */
  "memberAmount"?: undefined | number;
  /** 租户管理员上限 */
  "adminAmount"?: undefined | number;
}

export interface GenAuthSdkTenantDto {
  /** 租户 ID */
  "tenantId": string;
  /** 用户池 ID */
  "userPoolId": string;
  /** 租户名 */
  "name": string;
  /** 租户描述 */
  "description"?: undefined | string;
  /** 租户 logo */
  "logo": string;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: undefined | string;
  /** 租户关联的应用 ID */
  "appIds": (string)[];
  /** 创建者用户的 ID */
  "creator": string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId": string;
  /** 租户来源 */
  "source": string;
  /** 租户 Code */
  "code": string;
  /** 租户地址 */
  "host": string;
  /** 租户配置的企业域名 */
  "enterpriseDomains": (string)[];
}

export interface GenAuthSdkUpdateTenantDto {
  /** 租户 ID */
  "tenantId": string;
  /** 租户名 */
  "name"?: undefined | string;
  /** 租户关联的应用 ID */
  "appIds"?: undefined | (string)[];
  /** 租户 logo */
  "logo"?: undefined | (string)[];
  /** 租户描述 */
  "description"?: undefined | string;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: undefined | string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId"?: undefined | string;
}

export interface GenAuthSdkDeleteTenantDto {
  /** 租户 ID */
  "tenantId": string;
}

export interface GenAuthSdkObject112 {
  /** 搜索关键字 * */
  "keywords"?: undefined | string;
  /** 是否增加返回租户成员统计 * */
  "withMembersCount"?: undefined | false | true;
  /** 增加返回租户下 app 简单信息 * */
  "withAppDetail"?: undefined | false | true;
  /** 增加返回租户下创建者简单信息 * */
  "withCreatorDetail"?: undefined | false | true;
  /** 增加返回租户下来源 app 简单信息 * */
  "withSourceAppDetail"?: undefined | false | true;
  /** 页码 * */
  "page"?: undefined | string;
  /** 每页获取的数据量 * */
  "limit"?: undefined | string;
  /** 租户来源 * */
  "source"?: unknown;
}

export interface GenAuthSdkTenantListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkTenantRespDto)[];
}

export interface GenAuthSdkObject113 {
  /** 租户 ID * */
  "tenantId": string;
  /** 是否增加返回租户成员统计 * */
  "withMembersCount"?: undefined | false | true;
  /** 增加返回租户关联应用简单信息 * */
  "withAppDetail"?: undefined | false | true;
  /** 增加返回租户下创建者简单信息 * */
  "withCreatorDetail"?: undefined | false | true;
  /** 增加返回租户来源应用简单信息 * */
  "withSourceAppDetail"?: undefined | false | true;
}

export interface GenAuthSdkTenantRespDto {
  /** 租户 ID */
  "tenantId": string;
  /** 用户池 ID */
  "userPoolId": string;
  /** 租户名 */
  "name": string;
  /** 租户描述 */
  "description"?: undefined | string;
  /** 租户 logo */
  "logo": string;
  /** 用户被租户拒绝登录时显示的提示文案 */
  "rejectHint"?: undefined | string;
  /** 租户关联的应用 ID */
  "appIds": (string)[];
  /** 创建者用户的 ID */
  "creator": string;
  /** 租户来源的应用 ID，该值不存在时代表租户来源为 Authing 控制台 */
  "sourceAppId": string;
  /** 租户来源 */
  "source": string;
  /** 租户 Code */
  "code": string;
  /** 租户地址 */
  "host": string;
  /** 租户配置的企业域名 */
  "enterpriseDomains": (string)[];
  /** 创建者基本信息 */
  "creatorDetail"?: unknown;
  /** 来源 app 基本信息 */
  "sourceAppDetail"?: unknown;
  /** 租户内成员数 */
  "membersCount"?: undefined | number;
}

export interface GenAuthSdkObject114 {
  /** 租户 ID * */
  "tenantId": string;
  /** 是否增加返回租户成员统计 * */
  "withMembersCount"?: undefined | false | true;
  /** 增加返回租户关联应用简单信息 * */
  "withAppDetail"?: undefined | false | true;
  /** 增加返回租户下创建者简单信息 * */
  "withCreatorDetail"?: undefined | false | true;
  /** 增加返回租户来源应用简单信息 * */
  "withSourceAppDetail"?: undefined | false | true;
}

export interface GenAuthSdkImportTenantDto {
  /** excel path 地址 */
  "excelUrl": string;
}

export interface GenAuthSdkImportTenantDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthSdkObject115 {
  /** 页码 * */
  "page"?: undefined | string;
  /** 每页获取的数据量 * */
  "limit"?: undefined | string;
}

export interface GenAuthSdkImportTenantHistoryDataDto {
  /** 总数 */
  "totalCount": number;
  /** 记录条数 */
  "list": (unknown)[];
}

export interface GenAuthSdkObject116 {
  /** 导入记录 id * */
  "importId": string;
  /** 页码 * */
  "page"?: undefined | string;
  /** 每页获取的数据量 * */
  "limit"?: undefined | string;
}

export interface GenAuthSdkImportTenantNotifyUseDataDto {
  /** 总数 */
  "totalCount": number;
  /** 记录条数 */
  "list": (unknown)[];
}

export interface GenAuthSdkSendManyTenantEmailDto {
  /** 管理员名 */
  "adminName": string;
  /** 导入 id */
  "importId": number;
  /** 需要邮件通知的管理员 */
  "users": (GenAuthSdkSendTenantEmailDto)[];
}

export interface GenAuthSdkSendEmailBatchDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthSdkSendManyTenantSmsDto {
  /** 管理员名 */
  "adminName": string;
  /** 导入 id */
  "importId": number;
  /** 需要短信通知的管理员 */
  "users": (GenAuthSdkSendTenantSmsDto)[];
}

export interface GenAuthSdkSendSmsBatchDataDto {
  /** 是否操作成功 */
  "success": boolean;
}

export interface GenAuthSdkListTenantAdminDto {
  /** 租户 ID */
  "tenantId": string;
  /** 搜索关键字 */
  "keywords"?: undefined | string;
  /** 页码 */
  "page"?: undefined | string;
  /** 每页获取的数据量 */
  "limit"?: undefined | string;
}

export interface GenAuthSdkTenantUserListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkTenantUserDto)[];
}

export interface GenAuthSdkRemoveTenantUsersDto {
  /** 租户 ID */
  "tenantId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserIds"?: undefined | (string)[];
  /** 租户成员 ID */
  "memberIds"?: undefined | (string)[];
}

export interface GenAuthSdkGetTenantUserDto {
  /** 租户 ID */
  "tenantId"?: unknown;
  /** 关联的用户池级别的用户 ID */
  "linkUserId"?: unknown;
  /** 租户成员 ID */
  "memberId"?: unknown;
}

export interface GenAuthSdkGenerateInviteTenantUserLink {
  /** 链接有效期 */
  "validityTerm": string;
  /** 要邀请的用户邮箱 */
  "emails": (string)[];
  /** 应用 ID */
  "appId": string;
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkInviteTenantUsersDto {
  /** 错误的邮箱提示 */
  "errMsgs": (GenAuthSdkerrorEmailMsg)[];
  /** 邀请用户信息返回值 */
  "list": (GenAuthSdkInviteTenantUserRecord)[];
}

export interface GenAuthSdkObject117 {
  /** 搜索关键字 * */
  "keywords": string;
  /** 页码 * */
  "page": string;
  /** 每页获取的数据量 * */
  "limit": string;
}

export interface GenAuthSdkInviteTenantUserRecordListDto {
  /** 记录总数 */
  "totalCount": number;
  /** 邀请用户历史记录 */
  "list": (GenAuthSdkInviteTenantUserRecord)[];
}

export interface GenAuthSdkObject118 {
  /** 搜索关键字 * */
  "keywords"?: undefined | string;
  /** 页码 * */
  "page"?: undefined | string;
  /** 每页获取的数据量 * */
  "limit"?: undefined | string;
}

export interface GenAuthSdkMultipleTenantAdminListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkMultipleTenantAdminDto)[];
}

export interface GenAuthSdkCreateMultipleTenantAdminDto {
  /** 租户 ID */
  "tenantIds": (string)[];
  /** 用户 ID */
  "userId": string;
  /** 是否授权 */
  "apiAuthorized"?: undefined | false | true;
  /** SMS 通知 */
  "sendPhoneNotification"?: undefined | false | true;
  /** Email 通知 */
  "sendEmailNotification"?: undefined | false | true;
}

export interface GenAuthSdkObject119 {
  /** 用户 ID * */
  "userId": string;
}

export interface GenAuthSdkObject120 {
  /** 搜索关键字 * */
  "keywords"?: undefined | string;
  /** 是否外部 * */
  "external"?: undefined | false | true;
  /** 页码 * */
  "page"?: undefined | string;
  /** 每页获取的数据量 * */
  "limit"?: undefined | string;
}

export interface GenAuthSdkTenantCooperatorListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkTenantCooperatorDto)[];
}

export interface GenAuthSdkObject121 {
  /** 用户 ID * */
  "userId": string;
}

export interface GenAuthSdkTenantCooperatorSingleDto {
  /** 菜单 */
  "list": (string)[];
  /** 策略 */
  "authorizedPoliciesCode": (string)[];
}

export interface GenAuthSdkObject122 {
  /** 用户 ID * */
  "userId": string;
}

export interface GenAuthSdkCreateTenantCooperatorDto {
  /** 策略 */
  "policies": (string)[];
  /** 用户 ID */
  "userId": string;
  /** 是否授权 API */
  "apiAuthorized"?: undefined | false | true;
  /** SMS 通知 */
  "sendPhoneNotification"?: undefined | false | true;
  /** Email 通知 */
  "sendEmailNotification"?: undefined | false | true;
}

export interface GenAuthSdkObject123 {
  /** 租户 Code * */
  "code": string;
}

export interface GenAuthSdkCreateTenantEnterpriseCertificationBodyDto {
  /** 企业名称 */
  "businessName": string;
  /** 营业执照 */
  "businessLicense": string;
  /** 工商登记名称 */
  "businessRegistrationName": string;
  /** 统一社会信用代码 */
  "unifiedSocialCredit": string;
  /** 法定代表人姓名 */
  "legalRepresentativeName": string;
  /** 身份证号 */
  "nationalIdentificationNumber": string;
  /** 个人银行卡号 */
  "personalBankCardNumber": string;
  /** 银行预留手机号 */
  "bankReservedPhone": string;
  /** 租户 ID */
  "tenantId": string;
}

export interface GenAuthSdkReviewTenantEnterpriseCertificationBodyDto {
  /** 租户 id */
  "tenantId": string;
  /** 审核结果 */
  "enterpriseCertificationStatus": "not_submit" | "reviewing" | "pass" | -1;
  /** 审核原因 */
  "reviewReason": string;
}

export interface GenAuthSdkObject124 {
  "tenantId": string;
}

export interface GenAuthSdkTenantEnterpriseCertificationRespDto {
  /** 企业名称 */
  "businessName"?: undefined | string;
  /** 营业执照 */
  "businessLicense"?: undefined | string;
  /** 更新时间 */
  "updatedAt"?: undefined | string;
  /** 工商登记名称 */
  "businessRegistrationName"?: undefined | string;
  /** 统一社会信用代码 */
  "unifiedSocialCredit"?: undefined | string;
  /** 法定代表人姓名 */
  "legalRepresentativeName"?: undefined | string;
  /** 身份证号 */
  "nationalIdentificationNumber"?: undefined | string;
  /** 个人银行卡号 */
  "personalBankCardNumber"?: undefined | string;
  /** 银行预留手机号 */
  "bankReservedPhone"?: undefined | string;
  /** 审核原因 */
  "reviewReason"?: undefined | string;
  /** 企业认证状态 */
  "enterpriseCertificationStatus"?: undefined | "not_submit" | "reviewing" | "pass" | -1;
}

export interface GenAuthSdkAddTenantUsersDto {
  /** 关联的用户池级别的用户 ID */
  "linkUserIds": (string)[];
  /** 租户 ID */
  "tenantId": string;
}

export interface GenAuthSdkUpdateTenantUserDto {
  /** 要更新的租户成员信息 */
  "updates": unknown;
  /** 租户 ID */
  "tenantId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserId"?: undefined | string;
  /** 租户成员 ID */
  "memberId"?: undefined | string;
}

export interface GenAuthSdkCreateTenantUserReqDto {
  /** 租户 ID */
  "tenantId": string;
  /** 性别: - `M`: 男性，`male` - `F`: 女性，`female` - `U`: 未知，`unknown` */
  "gender": "M" | "F" | "U";
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 加密用户密码的盐 */
  "salt"?: undefined | string;
  /** 可选参数 */
  "options"?: undefined | GenAuthSdkCreateTenantUserOptionsDto;
}

export interface GenAuthSdkTenantUserDto {
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 历史总登录次数 */
  "loginsCount"?: undefined | number;
  /** 上次登录 IP */
  "lastIp"?: undefined | string;
  /** 性别: - `M`: 男性，`male` - `F`: 女性，`female` - `U`: 未知，`unknown` */
  "gender": "M" | "F" | "U";
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户上次登录的应用 ID */
  "lastLoginApp"?: undefined | string;
  /** 用户池 ID */
  "userPoolId": string;
  /** 租户 ID */
  "tenantId": string;
  /** 租户成员 ID */
  "memberId": string;
  /** 关联的用户池级别的用户 ID */
  "linkUserId": string;
  /** 是否为租户管理员 */
  "isTenantAdmin": boolean;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 加密用户密码的盐 */
  "salt"?: undefined | string;
}

export interface GenAuthSdkListTenantUserDto {
  /** 租户 ID */
  "tenantId": string;
  /** 搜索关键字 */
  "keywords"?: undefined | string;
  /** 可选项 */
  "options"?: undefined | GenAuthSdkListTenantUsersOptionsDto;
}

export interface GenAuthSdkObject125 {
  /** 租户 ID * */
  "tenantId": string;
  /** 关联的用户池级别的用户 ID * */
  "linkUserId"?: undefined | string;
  /** 租户成员 ID * */
  "memberId"?: undefined | string;
}

export interface GenAuthSdkAddTenantDepartmentMembersReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 关联的用户池级别的用户 ID */
  "linkUserIds"?: undefined | (string)[];
  /** 租户成员 ID */
  "memberIds"?: undefined | (string)[];
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkRemoveTenantDepartmentMembersReqDto {
  /** 组织 code */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 此次调用中使用的部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 关联的用户池级别的用户 ID */
  "linkUserIds"?: undefined | (string)[];
  /** 租户成员 ID */
  "memberIds"?: undefined | (string)[];
  /** 租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkCreatePermissionNamespaceDto {
  /** 权限空间名称 */
  "name": string;
  /** 权限空间 Code */
  "code": string;
  /** 权限空间描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkCreatePermissionNamespaceRespDto {
  /** 权限空间唯一标志符 */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述信息 */
  "description"?: undefined | string;
}

export interface GenAuthSdkCreatePermissionNamespacesBatchDto {
  /** 权限空间列表 */
  "list": (GenAuthSdkCreatePermissionNamespacesBatchItemDto)[];
}

export interface GenAuthSdkObject126 {
  /** 权限空间 Code * */
  "code": string;
}

export interface GenAuthSdkGetPermissionNamespaceRespDto {
  /** 权限空间唯一标志符 */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述信息 */
  "description"?: undefined | string;
}

export interface GenAuthSdkObject127 {
  /** 权限空间 code 列表，批量可以使用逗号分隔 * */
  "codes": (string)[];
}

export interface GenAuthSdkObject128 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 权限空间 name * */
  "query"?: undefined | string;
}

export interface GenAuthSdkPermissionNamespaceListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkPermissionNamespacesListRespDto)[];
}

export interface GenAuthSdkUpdatePermissionNamespaceDto {
  /** 权限分组老的唯一标志符 Code */
  "code": string;
  /** 权限空间名称 */
  "name"?: undefined | string;
  /** 权限分组新的唯一标志符 Code */
  "newCode"?: undefined | string;
  /** 权限空间描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkUpdatePermissionNamespaceRespDto {
  /** 权限空间唯一标志符 */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述信息 */
  "description"?: undefined | string;
}

export interface GenAuthSdkDeletePermissionNamespaceDto {
  /** 权限空间 Code */
  "code": string;
}

export interface GenAuthSdkDeletePermissionNamespacesBatchDto {
  /** 权限分组 code 列表 */
  "codes": (string)[];
}

export interface GenAuthSdkCheckPermissionNamespaceExistsDto {
  /** 权限空间 Code */
  "code"?: undefined | string;
  /** 权限空间名称 */
  "name"?: undefined | string;
}

export interface GenAuthSdkCheckPermissionNamespaceExistsRespDto {
  /** 校验权限空间名称或者权限空间名称 Code 是否有效 */
  "isValid": boolean;
  /** 权限空间名称或权限空间 Code 校验失败提示信息,如果校验成功, Message 不返回 */
  "message"?: undefined | string;
}

export interface GenAuthSdkObject129 {
  /** 权限分组唯一标志符 Code * */
  "code": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 角色 Code 或者名称 * */
  "query"?: undefined | string;
}

export interface GenAuthSdkPermissionNamespaceRolesListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkPermissionNamespaceRolesListRespDto)[];
}

export interface GenAuthSdkCreateDataResourceDto {
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | GenAuthSdkDataResourceTreeStructs;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: undefined | (GenAuthSdkExtendField)[];
}

export interface GenAuthSdkCreateDataResourceRespDto {
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | GenAuthSdkDataResourceTreeStructs;
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: undefined | (GenAuthSdkExtendField)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkCreateStringDataResourceDto {
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 字符串数据资源节点 */
  "struct": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据策略所在的权限空间 Code */
  "namespaceCode": string;
  /** 数据资源描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkCreateStringDataResourceRespDto {
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 字符串数据资源节点 */
  "struct": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkCreateArrayDataResourceDto {
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 数组数据资源节点 */
  "struct": (string)[];
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据策略所在的权限空间 Code */
  "namespaceCode": string;
  /** 数据资源描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkCreateArrayDataResourceRespDto {
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 数组数据资源节点 */
  "struct": (string)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkCreateTreeDataResourceDto {
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 树数据资源节点 */
  "struct": (GenAuthSdkDataResourceTreeStructs)[];
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据策略所在的权限空间 Code */
  "namespaceCode": string;
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: undefined | (GenAuthSdkExtendField)[];
}

export interface GenAuthSdkCreateTreeDataResourceRespDto {
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 树数据资源节点 */
  "struct": (GenAuthSdkDataResourceTreeStructs)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: undefined | (GenAuthSdkExtendField)[];
}

export interface GenAuthSdkObject130 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 关键字搜索，可以是数据资源名称或者数据资源 Code * */
  "query"?: undefined | string;
  /** 权限数据所属权限空间 Code 列表 * */
  "namespaceCodes"?: undefined | (string)[];
}

export interface GenAuthSdkDataResourcesPaginatedRespDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkListDataResourcesRespDto)[];
}

export interface GenAuthSdkObject131 {
  /** 数据资源所属的权限空间 Code * */
  "namespaceCode": string;
  /** 数据资源 Code, 权限空间内唯一 * */
  "resourceCode": string;
}

export interface GenAuthSdkGetDataResourceRespDto {
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | GenAuthSdkDataResourceTreeStructs;
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: undefined | (GenAuthSdkExtendField)[];
  /** 数据策略所在的权限空间 Code */
  "namespaceCode": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkUpdateDataResourceDto {
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName"?: undefined | string;
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct"?: undefined | string | (string)[] | GenAuthSdkDataResourceTreeStructs;
  /** 数据资源权限操作列表 */
  "actions"?: undefined | (string)[];
}

export interface GenAuthSdkUpdateDataResourceRespDto {
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 数据资源结构，支持字符串（STRING）、树结构（TREE）和数组结构（ARRAY）。 */
  "struct": string | (string)[] | GenAuthSdkDataResourceTreeStructs;
  /** 扩展字段列表，目前只支持树类型资源 */
  "extendFieldList"?: undefined | (GenAuthSdkExtendField)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkDeleteDataResourceDto {
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
}

export interface GenAuthSdkObject132 {
  /** 数据资源所属的权限空间 Code * */
  "namespaceCode": string;
  /** 数据资源名称, 权限空间内唯一 * */
  "resourceName"?: undefined | string;
  /** 数据资源 Code, 权限空间内唯一 * */
  "resourceCode"?: undefined | string;
}

export interface GenAuthSdkCheckParamsDataResourceRespDto {
  /** 数据资源名称或者 Code 校验是否有效 */
  "isValid": boolean;
  /** 数据资源名称或者 Code 校验失败提示信息,如果校验成功, message 不返回 */
  "message"?: undefined | string;
}

export interface GenAuthSdkCreateDnefReq {
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
  /** 展示名称 */
  "label": string;
  /** 字段值类型 */
  "valueType": "STRING" | "SELECT";
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
  /** 描述 */
  "description"?: undefined | string;
  /** 字段配置，当 valueType=SELECT 时，此参数必传，否则可不传 */
  "config"?: undefined | GenAuthSdkConfig;
}

export interface GenAuthSdkBatchCreateDnefReq {
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
  /** 字段列表 */
  "fieldList": (GenAuthSdkExtendField)[];
}

export interface GenAuthSdkDeleteDnefReq {
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
}

export interface GenAuthSdkUpdateDnefReq {
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
  /** 描述 */
  "description"?: undefined | string;
  /** 展示名称 */
  "label"?: undefined | string;
  /** 字段配置，当 valueType=SELECT 时，此参数必传，否则可不传 */
  "config"?: undefined | GenAuthSdkConfig;
}

export interface GenAuthSdkObject133 {
  /** 数据资源所属的权限空间 Code * */
  "namespaceCode": string;
  /** 数据资源 Code, 权限空间内唯一 * */
  "resourceCode": string;
  /** 起始索引，默认为 1，即从第 1 条开始 * */
  "startIndex"?: undefined | number;
  /** 单次查询最大条数，最大不能超过 50，默认为 10 * */
  "maxSize"?: undefined | number;
  /** 关键字搜索，可以是字段唯一标识、展示名称 * */
  "query"?: undefined | string;
}

export interface GenAuthSdkDnefPaginatedRespDto {
  /** 下一页开始的索引，当最后一页时返回 -1 */
  "nextStartIndex": number;
  /** 是否被截断，true 表示可以查询下一页，false 表示是最后一页数据 */
  "truncated": boolean;
  /** 响应数据 */
  "list": (GenAuthSdkExtendField)[];
}

export interface GenAuthSdkCreateDataPolicyDto {
  /** 数据权限列表，策略下数据资源权限列表 */
  "statementList": (GenAuthSdkDataStatementPermissionDto)[];
  /** 数据策略名称，用户池唯一 */
  "policyName": string;
  /** 数据策略描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkCreateDataPolicyRespDto {
  /** 数据策略 ID */
  "policyId": string;
  /** 数据策略名称，用户池唯一 */
  "policyName": string;
  /** 数据策略描述 */
  "description"?: undefined | string;
  /** 数据策略创建时间 */
  "createdAt": string;
  /** 数据策略更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkObject134 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 数据策略名称关键字搜索 * */
  "query"?: undefined | string;
}

export interface GenAuthSdkDataPoliciesPaginatedRespDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkListDataPoliciesRespDto)[];
}

export interface GenAuthSdkObject135 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 数据策略名称关键字搜索 * */
  "query"?: undefined | string;
}

export interface GenAuthSdkDataPoliciesSimplePaginatedRespDto {
  /** 记录总数 */
  "totalCount"?: undefined | number;
  /** 响应数据 */
  "list": (GenAuthSdkListSimpleDataPoliciesRespDto)[];
}

export interface GenAuthSdkObject136 {
  /** 数据策略 ID * */
  "policyId": string;
}

export interface GenAuthSdkGetDataPolicyRespDto {
  /** 数据策略 ID */
  "policyId": string;
  /** 数据策略名称，用户池唯一 */
  "policyName": string;
  /** 数据策略描述 */
  "description"?: undefined | string;
  /** 数据策略创建时间 */
  "createdAt": string;
  /** 数据策略更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkUpdateDataPolicyDto {
  /** 数据策略 ID */
  "policyId": string;
  /** 数据策略名称，用户池唯一 */
  "policyName"?: undefined | string;
  /** 数据策略描述 */
  "description"?: undefined | string;
  /** 数据权限列表，每个策略下所有的数据权限 */
  "statementList"?: undefined | (GenAuthSdkDataStatementPermissionDto)[];
}

export interface GenAuthSdkUpdateDataPolicyRespDto {
  /** 数据策略 ID */
  "policyId": string;
  /** 数据策略名称，用户池唯一 */
  "policyName": string;
  /** 数据策略描述 */
  "description"?: undefined | string;
  /** 数据策略创建时间 */
  "createdAt": string;
  /** 数据策略更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkDeleteDataPolicyDto {
  /** 数据策略 ID */
  "policyId": string;
}

export interface GenAuthSdkObject137 {
  /** 数据策略名称，用户池唯一 * */
  "policyName": string;
}

export interface GenAuthSdkCheckParamsDataPolicyRespDto {
  /** 数据策略名称校验是否有效 */
  "isValid": boolean;
  /** 数据策略名称校验失败提示信息,如果校验成功, message 不返回 */
  "message"?: undefined | string;
}

export interface GenAuthSdkObject138 {
  /** 数据策略 ID * */
  "policyId": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 主体名称 * */
  "query"?: undefined | string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 * */
  "targetType"?: undefined | ("USER" | "ROLE" | "GROUP" | "ORG")[];
}

export interface GenAuthSdkListDataPolicySubjectPageDto {
  /** 记录总数 */
  "totalCount"?: undefined | number;
  /** 响应数据 */
  "list": (GenAuthSdkDataSubjectRespDto)[];
}

export interface GenAuthSdkCreateAuthorizeDataPolicyDto {
  /** 数据权限列表，每个策略下所有的数据权限 */
  "targetList": (GenAuthSdkSubjectDto)[];
  /** 数据策略 id 列表 */
  "policyIds": (string)[];
}

export interface GenAuthSdkDeleteAuthorizeDataPolicyDto {
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 */
  "targetType": "USER" | "ORG" | "GROUP" | "ROLE";
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID */
  "targetIdentifier": string;
  /** 数据策略 ID */
  "policyId": string;
}

export interface GenAuthSdkGetUserPermissionListDto {
  /** 用户 ID 列表 */
  "userIds": (string)[];
  /** 权限空间 Code 列表 */
  "namespaceCodes"?: undefined | (string)[];
}

export interface GenAuthSdkGetUserPermissionListDataDto {
  /** 用户权限列表 */
  "userPermissionList": (GenAuthSdkUserPermissionListDto)[];
}

export interface GenAuthSdkCheckPermissionDto {
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
  /** 数据资源权限操作, read、get、write 等动作 */
  "action": string;
  /** 用户 ID */
  "userId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 是否开启条件判断，默认 false 不开启 */
  "judgeConditionEnabled"?: undefined | false | true;
  /** 条件环境属性，若开启条件判断则使用 */
  "authEnvParams"?: undefined | GenAuthSdkAuthEnvParams;
}

export interface GenAuthSdkCheckPermissionDataDto {
  /** 检查结果列表 */
  "checkResultList": (GenAuthSdkCheckPermissionsRespDto)[];
}

export interface GenAuthSdkCheckExternalUserPermissionDto {
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
  /** 数据资源权限操作, read、get、write 等动作 */
  "action": string;
  /** 外部用户 ID */
  "externalId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 是否开启条件判断，默认 true 开启 */
  "judgeConditionEnabled"?: undefined | false | true;
  /** 条件环境属性，若开启条件判断则使用 */
  "authEnvParams"?: undefined | GenAuthSdkAuthEnvParams;
}

export interface GenAuthSdkCheckExternalUserPermissionDataDto {
  /** 检查结果列表 */
  "checkResultList": (GenAuthSdkCheckExternalUserPermissionsRespDto)[];
}

export interface GenAuthSdkGetUserResourcePermissionListDto {
  /** 资源路径列表,**树资源需到具体树节点** */
  "resources": (string)[];
  /** 用户 ID */
  "userId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
}

export interface GenAuthSdkGetUserResourcePermissionListDataDto {
  /** 权限列表 */
  "permissionList": (GenAuthSdkGetUserResourcePermissionList)[];
}

export interface GenAuthSdkListResourceTargetsDto {
  /** 数据策略所属的数据资源路径列表 */
  "resources": (string)[];
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 权限空间 Code */
  "namespaceCode": string;
}

export interface GenAuthSdkListResourceTargetsDataDto {
  /** 用户授权列表 */
  "authUserList": (GenAuthSdkListResourceTargetsDtoResp)[];
}

export interface GenAuthSdkGetUserResourceStructDto {
  /** 数据资源 Code */
  "resourceCode": string;
  /** 用户 ID */
  "userId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
}

export interface GenAuthSdkGetUserResourceStructDataDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源 Code */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrResourceAuthAction - `ARRAY`: 数组类型 ArrResourceAuthAction - `TREE`: 树类型 TreeResourceAuthAction */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 字符串资源授权 */
  "strResourceAuthAction"?: undefined | GenAuthSdkStrResourceAuthAction;
  /** 数组资源授权 */
  "arrResourceAuthAction"?: undefined | GenAuthSdkArrResourceAuthAction;
  /** 树资源授权 */
  "treeResourceAuthAction"?: undefined | GenAuthSdkTreeResourceAuthAction;
}

export interface GenAuthSdkGetExternalUserResourceStructDto {
  /** 资源 Code */
  "resourceCode": string;
  /** 外部用户 ID */
  "externalId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
}

export interface GenAuthSdkGetExternalUserResourceStructDataDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源 Code */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrResourceAuthAction - `ARRAY`: 数组类型 ArrResourceAuthAction - `TREE`: 树类型 TreeResourceAuthAction */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 字符串资源授权 */
  "strResourceAuthAction"?: undefined | GenAuthSdkStrResourceAuthAction;
  /** 数组资源授权 */
  "arrResourceAuthAction"?: undefined | GenAuthSdkArrResourceAuthAction;
  /** 树资源授权 */
  "treeResourceAuthAction"?: undefined | GenAuthSdkTreeResourceAuthAction;
}

export interface GenAuthSdkCheckUserSameLevelPermissionDto {
  /** 当前树资源路径子节点 Code */
  "resourceNodeCodes": (string)[];
  /** 树资源路径,允许多层级路径，示例如下所示 - treeResourceCode - treeResourceCode/structCode - treeResourceCode/structCode/struct1Code - treeResourceCode/.../structCode */
  "resource": string;
  /** 数据资源权限操作 */
  "action": string;
  /** 用户 ID */
  "userId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 是否开启条件判断，默认 false 不开启 */
  "judgeConditionEnabled"?: undefined | false | true;
  /** 条件环境属性，若开启条件判断则使用 */
  "authEnvParams"?: undefined | GenAuthSdkAuthEnvParams;
}

export interface GenAuthSdkCheckUserSameLevelPermissionDataDto {
  /** 响应结果列表 */
  "checkLevelResultList": (GenAuthSdkCheckUserSameLevelPermissionRespDto)[];
}

export interface GenAuthSdkListPermissionViewDto {
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
  /** 关键字搜索,可以支持 userName 搜索 */
  "keyword"?: undefined | string;
}

export interface GenAuthSdkListPermissionViewPaginatedRespDto {
  /** 记录总数 */
  "totalCount": number;
  /** 响应数据 */
  "list": (GenAuthSdkListPermissionViewRespDto)[];
}

export interface GenAuthSdkCostCurrentPackageInfo {
  /** 套餐包编码 */
  "code": string;
  /** 套餐结束时间 */
  "endTime": string;
  /** 套餐逾期天数 */
  "overdueDays": string;
  /** 套餐包信息 */
  "goodsPackage": GenAuthSdkGoodsPackageDto;
}

export interface GenAuthSdkCurrentUsageRespDto {
  /** 当前用量实体 */
  "usages": (GenAuthSdkCurrentUsageDto)[];
}

export interface GenAuthSdkObject139 {
  /** 起始时间（年月日） * */
  "startTime": string;
  /** 截止时间（年月日） * */
  "endTime": string;
}

export interface GenAuthSdkMauPeriodUsageHistory {
  /** 响应数据 */
  "records": (GenAuthSdkMauPeriodUsageHistoryDto)[];
}

export interface GenAuthSdkRightItemRes {
  /** 响应数据 */
  "rightsItems": (GenAuthSdkRightItemDto)[];
}

export interface GenAuthSdkObject140 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkGetOrdersRes {
  /** 总数 */
  "totalCount": string;
  /** 响应数据 */
  "list": (GenAuthSdkOrderItem)[];
}

export interface GenAuthSdkObject141 {
  /** 订单号 * */
  "orderNo": string;
}

export interface GenAuthSdkOrderItem {
  /** 订单号 */
  "orderNo": string;
  /** 套餐包名中文 */
  "goodsName": string;
  /** 套餐包名英文 */
  "goodsNameEn": string;
  /** 单价 */
  "goodsUnitPrice": string;
  /** 数量 */
  "quantity": string;
  /** 实际金额 */
  "actualAmount": string;
  /** 订单状态 */
  "status": string;
  /** 订单类型 */
  "orderType": string;
  /** 创建时间 */
  "createTime": string;
  /** Licence：license 订单，Offline：线下交易，Eadmin：后台开通，SelfHelp：自助下单，Cdkey：Cdkey 活动兑换 */
  "source": string;
}

export interface GenAuthSdkObject142 {
  /** 订单号 * */
  "orderNo": string;
}

export interface GenAuthSdkCostGetOrderPayDetail {
  /** 订单号 */
  "orderNo": string;
  /** 渠道订单号 */
  "channelOrderNo": string;
  /** 渠道订单号 */
  "paidAmount": string;
  /** 支付时间 */
  "paidTime": string;
  /** 支付账号 */
  "paidAccountNo": string;
  /** 支付状态 */
  "payStatus": string;
  /** 创建时间 */
  "createTime": string;
  /** 支付方式 */
  "payType": string;
}

export interface GenAuthSdkCreateEventAppDto {
  /** 应用 logo */
  "logo": string;
  /** 应用名称 */
  "name": string;
  /** 应用唯一标志 */
  "identifier": string;
}

export interface GenAuthSdkEventAppPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkEventAppDto)[];
}

export interface GenAuthSdkObject143 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
  /** 应用类型 * */
  "app"?: undefined | string;
}

export interface GenAuthSdkOpenEventPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkOpenEventDto)[];
}

export interface GenAuthSdkDefineEventDto {
  /** 事件描述 */
  "eventDescription": string;
  /** 事件类型 */
  "eventType": string;
}

export interface GenAuthSdkPubEventDto {
  /** 事件类型 */
  "eventType": string;
  /** 事件体 */
  "eventData": unknown;
}

export interface GenAuthSdkPubEventRespDataDto {
  /** 发送是否成功 */
  "success": boolean;
  /** 发送失败的错误提示 */
  "errMsg"?: undefined | false | true;
}

export interface GenAuthSdkAddWhitelistOfAppDto {
  /** APP ID */
  "appId": string;
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** 类型参数 */
  "list"?: undefined | (string)[];
}

export interface GenAuthSdkWhitelistRespDto {
  /** 数据 */
  "value": string;
  /** 创建时间 */
  "createdAt": string;
}

export interface GenAuthSdkObject144 {
  /** 白名单类型 * */
  "type": "EMAIL" | "USERNAME" | "PHONE";
  /** APP ID * */
  "appId": string;
}

export interface GenAuthSdkDeleteWhitelistOfAppDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** APP ID */
  "appId": string;
  /** 类型参数 */
  "list"?: undefined | (string)[];
}

export interface GenAuthSdkAddWhitelistDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** 类型参数 */
  "list"?: undefined | (string)[];
}

export interface GenAuthSdkObject145 {
  /** 白名单类型 * */
  "type": "EMAIL" | "USERNAME" | "PHONE";
}

export interface GenAuthSdkDeleteWhitelistDto {
  /** 白名单类型 */
  "type": "USERNAME" | "EMAIL" | "PHONE";
  /** 类型参数 */
  "list"?: undefined | (string)[];
}

export interface GenAuthSdkObject146 {
  /** IP 类型 * */
  "ipType": "BLACK" | "WHITE";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkIpListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkIpListRespDto)[];
}

export interface GenAuthSdkIpListCreateDto {
  /** 添加时间 */
  "expireAt": string;
  /** 限制类型，FORBID_LOGIN-禁止登录，FORBID_REGISTER-禁止注册，SKIP_MFA-跳过 MFA */
  "limitList": (string)[];
  /** 删除类型，MANUAL-手动，SCHEDULE-策略删除 */
  "removeType": string;
  /** 添加类型，MANUAL-手动，SCHEDULE-策略添加 */
  "addType": string;
  /** ip类型，WHITE-白名单，BLACK-黑名单 */
  "ipType": string;
  /** ip, 多个IP以逗号分割 */
  "ips": string;
}

export interface GenAuthSdkObject147 {
  /** IP 类型 * */
  "userListType": "BLACK" | "WHITE";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkUserListPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkRiskListItemDto)[];
}

export interface GenAuthSdkUserListCreateDto {
  /** 过期时间 */
  "expireAt": number;
  /** 限制类型，FORBID_LOGIN-禁止登录，FORBID_REGISTER-禁止注册，SKIP_MFA-跳过 MFA */
  "limitList": (string)[];
  /** 删除类型，MANUAL-手动，SCHEDULE-策略删除 */
  "removeType": string;
  /** 添加类型，MANUAL-手动，SCHEDULE-策略添加 */
  "addType": string;
  /** 用户名单类型，WHITE-白名单，BLACK-黑名单 */
  "userListType": string;
  /** userId, 多个 userId 以逗号分割 */
  "userIds": (string)[];
}

export interface GenAuthSdkObject148 {
  /** 策略操作对象，目前只有 ip * */
  "optObject": "USER" | "IP";
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkRiskListPolicyPagingDto {
  /** 记录总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkRiskListPolicyRespDto)[];
}

export interface GenAuthSdkRiskListPolicyCreateDto {
  /** 限制类型列表,FORBID_LOGIN-禁止登录，FORBID_REGISTER-禁止注册 */
  "limitList": "FORBID_LOGIN" | "FORBID_REGISTER";
  /** 策略动作, ADD_IP_BLACK_LIST-添加IP黑名单，ADD_USER_BLACK_LIST-添加用户黑名单 */
  "action": "ADD_IP_BLACK_LIST" | "ADD_USER_BLACK_LIST";
  /** 移除类型，MANUAL-手动，SCHEDULE-策略, 目前只有手动 */
  "removeType": "MANUAL" | "SCHEDULE";
  /** 事件状态类型，password_wrong-密码错误，account_wrong-账号错误 */
  "eventStateType": "password_wrong" | "account_wrong";
  /** 次数阈值 */
  "countThr": number;
  /** 时间范围，最近多少分钟 */
  "timeRange": number;
  /** IP条件, NO_LIMIT-不限制，ONE-单个用户，与 ipCond 二者取一个 */
  "userCond": "NO_LIMIT" | "ONE";
  /** IP条件, NO_LIMIT-不限制，ONE-单个IP，与 userCond 二者取一个 */
  "ipCond": "NO_LIMIT" | "ONE";
  /** 操作USER的范围, ALL-所有，NOT_IN_WHITE_LIST-不在白名单中，与 ipRange 二者取一个 */
  "userRange": "ALL" | "NOT_IN_WHITE_LIST";
  /** 操作IP的范围, ALL-所有，NOT_IN_WHITE_LIST-不在白名单中，与 userRange 二者取一个 */
  "ipRange": "ALL" | "NOT_IN_WHITE_LIST";
  /** 策略操作对象，目前只有 ip */
  "optObject": "IP" | "USER";
}

export interface GenAuthSdkGetDeviceExclusiveRuleDataDto {
  /** 设备互斥规则条件配置： - `disable`: 不启用 - `condition:device`: 按「设备唯一标识」条件触发 - `condition:ip`: 按「最近登录 IP」条件触发 */
  "rule": "disable" | "condition:device" | "condition:ip";
  /** 「设备唯一标识」同时在线数量上限 */
  "deviceRule"?: undefined | GenAuthSdkDeviceRuleDto;
  /** 「最近登录 IP」同时在线数量上限 */
  "ipRule"?: undefined | GenAuthSdkIPRuleDto;
}

export interface GenAuthSdkUpdateDeviceExclusiveRuleDto {
  /** 设备互斥规则条件配置： - `disable`: 不启用 - `condition:device`: 按「设备唯一标识」条件触发 - `condition:ip`: 按「最近登录 IP」条件触发 */
  "rule": "disable" | "condition:device" | "condition:ip";
  /** 「设备唯一标识」同时在线数量上限 */
  "deviceRule"?: undefined | GenAuthSdkDeviceRuleDto;
  /** 「最近登录 IP」同时在线数量上限 */
  "ipRule"?: undefined | GenAuthSdkIPRuleDto;
}

export interface GenAuthSdkGetDeviceExclusiveValidScopeDataDto {
  /** 应用 ID */
  "appId": string;
  /** 应用名称 */
  "appName"?: undefined | string;
  /** 应用 logo */
  "appLogo"?: undefined | string;
  /** 添加时间 */
  "createdAt": string;
  /** 是否默认应用 */
  "isDefault"?: undefined | false | true;
}

export interface GenAuthSdkObject149 {
  "keyword": string;
}

export interface GenAuthSdkDeviceExclusiveValidScopeAppDataDto {
  /** 应用 ID */
  "appId": string;
  /** 应用名称 */
  "appName"?: undefined | string;
  /** 应用 logo */
  "appLogo"?: undefined | string;
  /** 应用 logo */
  "isDefault"?: undefined | string;
}

export interface GenAuthSdkSaveDeviceExclusiveValidScopeSettingsDto {
  /** 应用列表 */
  "appIds": (string)[];
}

export interface GenAuthSdkDeleteDeviceExclusiveValidScopeSettingsByIdsDto {
  /** 应用 ID */
  "appId": string;
}

export interface GenAuthSdkGetDeviceExclusiveWhiteListDataDto {
  /** 主体名称 */
  "name"?: undefined | string;
  /** 权限空间 Code */
  "namePath"?: undefined | string;
  /** 主体类型： - `USER`: 用户 - `GROUP`: 用户组 - `ROLE`: 角色 */
  "targetType": "USER" | "GROUP" | "ROLE";
  /** 主体 ID */
  "targetId": string;
  /** 图片 */
  "photo"?: undefined | string;
  /** 添加时间 */
  "createdAt": string;
}

export interface GenAuthSdkApprovalProcessReq {
  /** 审批编号 */
  "number": string;
  /** 是否同意，默认为 false */
  "isAgreed"?: undefined | false | true;
}

export interface GenAuthSdkApprovalBatchProcessReq {
  /** 审批编号列表 */
  "numbers": (number)[];
  /** 是否同意，默认为 false */
  "isAgreed"?: undefined | false | true;
}

export interface GenAuthSdkObject150 {
  /** 审批编号 * */
  "number": string;
}

export interface GenAuthSdkApprovalDetailDto {
  /** 审批 ID */
  "approvalId": number;
  /** 审批编号 */
  "number": string;
  /** 审批状态 */
  "status": "PENDING" | "AGREED" | "REFUSED";
  /** 提交时间 */
  "submitTime": string;
  /** 办结时间 */
  "closedTime"?: undefined | string;
  /** 发起审批对象类型，目前支持：应用权限申请（APP_PERMISSION_APPLY）、角色权限申请（ROLE_PERMISSION_APPLY） */
  "objectType": "APP_PERMISSION_APPLY" | "ROLE_PERMISSION_APPLY";
  /** 审批对象（数组） */
  "approvalObjectList": GenAuthSdkRolePermissionApplyApprovalObject | GenAuthSdkApplicationPermissionApplyApprovalObject;
  /** 额外参数，目前仅支持：角色权限申请（ROLE_PERMISSION_APPLY） */
  "extraParams"?: undefined | GenAuthSdkExtraParams;
}

export interface GenAuthSdkObject151 {
  /** 当前页数，从 1 开始 * */
  "pageNo"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "pageSize"?: undefined | number;
  /** 发起审批对象类型，目前支持：应用权限申请（APP_PERMISSION_APPLY）、角色权限申请（ROLE_PERMISSION_APPLY） * */
  "objectType"?: undefined | "APP_PERMISSION_APPLY" | "ROLE_PERMISSION_APPLY";
  /** 用于根据审批编号或者发起人名称进行模糊搜索，可选。 * */
  "keyword"?: undefined | string;
}

export interface GenAuthSdkApprovalPageList {
  /** 已发起审批列表 */
  "list": (GenAuthSdkApprovalDetailDto)[];
  /** 记录总数 */
  "totalCount": number;
}

export interface GenAuthSdkObject152 {
  /** 当前页数，从 1 开始 * */
  "pageNo"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "pageSize"?: undefined | number;
  /** 发起审批对象类型，目前支持：应用权限申请（APP_PERMISSION_APPLY）、角色权限申请（ROLE_PERMISSION_APPLY） * */
  "objectType"?: undefined | "APP_PERMISSION_APPLY" | "ROLE_PERMISSION_APPLY";
  /** 用于根据审批编号或者发起人名称进行模糊搜索，可选。 * */
  "keyword"?: undefined | string;
}

export interface GenAuthSdkObject153 {
  /** 当前页数，从 1 开始 * */
  "pageNo"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "pageSize"?: undefined | number;
  /** 发起审批对象类型，目前支持：应用权限申请（APP_PERMISSION_APPLY）、角色权限申请（ROLE_PERMISSION_APPLY） * */
  "objectType"?: undefined | "APP_PERMISSION_APPLY" | "ROLE_PERMISSION_APPLY";
  /** 用于根据审批编号、发起人名称、审批对象名称进行模糊搜索，可选。 * */
  "keyword"?: undefined | string;
}

export interface GenAuthSdkCreateTerminalDto {
  /** 自定义数据, 自定义数据的属性对应在元数据里自定义的字段 */
  "customData": unknown;
  /** 设备类型 */
  "type": "Browser" | "Mobile" | "Desktop";
  /** 设备唯一标识 */
  "deviceUniqueId": string;
  /** 设备名称 */
  "name"?: undefined | string;
  /** 系统版本 */
  "version"?: undefined | string;
  /** 硬件存储秘钥 */
  "hks"?: undefined | string;
  /** 磁盘加密 */
  "fde"?: undefined | string;
  /** 硬件越狱 */
  "hor"?: undefined | false | true;
  /** 设备序列号 */
  "sn"?: undefined | string;
  /** 制造商 */
  "producer"?: undefined | string;
  /** 设备模组 */
  "mod"?: undefined | string;
  /** 设备系统 */
  "os"?: undefined | string;
  /** 国际识别码 */
  "imei"?: undefined | string;
  /** 设备识别码 */
  "meid"?: undefined | string;
  /** 设备描述 */
  "description"?: undefined | string;
  /** 设备语言 */
  "language"?: undefined | string;
  /** 是否开启 Cookies */
  "cookie"?: undefined | false | true;
  /** 用户代理 */
  "userAgent"?: undefined | string;
}

export interface GenAuthSdkTerminalInfoDto {
  /** 主键 ID */
  "id": string;
  /** 设备唯一标识 */
  "deviceUniqueId": string;
}

export interface GenAuthSdkQueryTerminalAppsDto {
  /** 设备唯一标识列表 */
  "deviceIds": (string)[];
  /** 用户 ID */
  "userId"?: undefined | string;
}

export interface GenAuthSdkCreatePipelineFunctionDto {
  /** 函数源代码 */
  "sourceCode": string;
  /** 函数的触发场景： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前 */
  "scene": "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY";
  /** 函数名称 */
  "funcName": string;
  /** 函数描述 */
  "funcDescription"?: undefined | string;
  /** 是否异步执行。设置为异步执行的函数不会阻塞整个流程的执行，适用于异步通知的场景，比如飞书群通知、钉钉群通知等。 */
  "isAsynchronous"?: undefined | false | true;
  /** 函数运行超时时间，要求必须为整数，最短为 1 秒，最长为 60 秒，默认为 3 秒。 */
  "timeout"?: undefined | number;
  /** 如果函数运行超时，是否终止整个流程，默认为否。 */
  "terminateOnTimeout"?: undefined | false | true;
  /** 是否启用此 Pipeline */
  "enabled"?: undefined | false | true;
}

export interface GenAuthSdkPipelineFunctionDto {
  /** 函数 ID */
  "funcId": string;
  /** 函数名称 */
  "funcName": string;
  /** 函数描述 */
  "funcDescription"?: undefined | string;
  /** 函数的触发场景： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前 */
  "scene": "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY";
  /** 函数创建时间 */
  "createdAt": string;
  /** 函数修改时间 */
  "updatedAt": string;
  /** 是否异步执行。设置为异步执行的函数不会阻塞整个流程的执行，适用于异步通知的场景，比如飞书群通知、钉钉群通知等。 */
  "isAsynchronous": boolean;
  /** 函数运行超时时间，最短为 1 秒，最长为 60 秒，默认为 3 秒。 */
  "timeout": number;
  /** 如果函数运行超时，是否终止整个流程，默认为否。 */
  "terminateOnTimeout": boolean;
  /** 函数源代码 */
  "sourceCode": string;
  /** 函数当前状态： - `uploading`: 上传中 - `success`: 上传成功 - `failed`: 上传失败 */
  "status": "uploading" | "success" | "failed";
  /** 上传失败的错误提示 */
  "uploadErrMsg"?: undefined | string;
  /** 此 Pipeline 是否被启用 */
  "enabled": boolean;
  /** 是否为云函数 */
  "isCloud": boolean;
  /** 最后执行状态 */
  "lastExecuteStatus": Record<string, unknown>;
}

export interface GenAuthSdkObject154 {
  /** Pipeline 函数 ID * */
  "funcId": string;
}

export interface GenAuthSdkReUploadPipelineFunctionDto {
  /** Pipeline 函数 ID */
  "funcId": string;
}

export interface GenAuthSdkUpdatePipelineFunctionDto {
  /** Pipeline 函数 ID */
  "funcId": string;
  /** 函数名称 */
  "funcName"?: undefined | string;
  /** 函数描述 */
  "funcDescription"?: undefined | string;
  /** 函数源代码。如果修改之后，函数会重新上传。 */
  "sourceCode"?: undefined | string;
  /** 是否异步执行。设置为异步执行的函数不会阻塞整个流程的执行，适用于异步通知的场景，比如飞书群通知、钉钉群通知等。 */
  "isAsynchronous"?: undefined | false | true;
  /** 函数运行超时时间，最短为 1 秒，最长为 60 秒，默认为 3 秒。 */
  "timeout"?: undefined | number;
  /** 如果函数运行超时，是否终止整个流程，默认为否。 */
  "terminateOnTimeout"?: undefined | false | true;
  /** 是否启用此 Pipeline */
  "enabled"?: undefined | false | true;
}

export interface GenAuthSdkUpdatePipelineOrderDto {
  /** 新的排序方式，按照函数 ID 的先后顺序进行排列。 */
  "order": (string)[];
  /** 函数的触发场景： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前 */
  "scene": "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY";
}

export interface GenAuthSdkDeletePipelineFunctionDto {
  /** Pipeline 函数 ID */
  "funcId": string;
}

export interface GenAuthSdkObject155 {
  /** 通过函数的触发场景进行筛选（可选，默认返回所有）： - `PRE_REGISTER`: 注册前 - `POST_REGISTER`: 注册后 - `PRE_AUTHENTICATION`: 认证前 - `POST_AUTHENTICATION`: 认证后 - `PRE_OIDC_ID_TOKEN_ISSUED`: OIDC ID Token 签发前 - `PRE_OIDC_ACCESS_TOKEN_ISSUED`: OIDC Access Token 签发前 - `PRE_COMPLETE_USER_INFO`: 补全用户信息前 * */
  "scene": "PRE_REGISTER" | "POST_REGISTER" | "PRE_AUTHENTICATION" | "POST_AUTHENTICATION" | "PRE_OIDC_ID_TOKEN_ISSUED" | "PRE_OIDC_ACCESS_TOKEN_ISSUED" | "PRE_COMPLETE_USER_INFO" | "PRE_MFA_VERIFY" | "POST_MFA_VERIFY";
}

export interface GenAuthSdkPipelineFunctionPagingDto {
  /** 总数 */
  "totalCount": number;
  /** 数据列表 */
  "list": (GenAuthSdkPipelineFunctionDto)[];
}

export interface GenAuthSdkObject156 {
  /** Pipeline 函数 ID * */
  "funcId": string;
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkCreateWebhookDto {
  /** 请求数据格式 */
  "contentType": "application/json" | "application/x-www-form-urlencoded";
  /** 事件 */
  "events": ("test" | "register" | "login" | "mfa:verified" | "kick" | "user:created" | "user:password-changed" | "user:updated" | "user:email-verified" | "user:archived" | "user:unarchived" | "user:blocked" | "user:unblocked" | "user:deleted" | "user:register-whitelist-added" | "user:register-whitelist-deleted" | "user:udv-changed" | "user:link-account" | "user:password-update-remind" | "user:organization-node-update" | "permission:revoke" | "permission:add" | "resource:created" | "resource:delete" | "resource:updated" | "role:created" | "role:updated" | "role:deleted" | "role:disable" | "role:assigned" | "subject:remove" | "role:unassigned" | "role:udv-changed" | "application:mfa:enabled" | "application:mfa:disabled" | "group:created" | "group:updated" | "group:deleted" | "group:member-added" | "group:member-removed" | "organization:created" | "organization:imported" | "organization:deleted" | "organization:node-added" | "organization:node-updated" | "organization:tree-updated" | "organization:node-deleted" | "organization:node-moved" | "organization:member-added" | "organization:member-removed" | "organization:udv-changed" | "privilege-namespace:created" | "privilege-namespace:updated" | "privilege-namespace:deleted" | "user-pool:cooperator-added" | "user-pool:cooperator-removed" | "user-pool:secret-refreshed" | "user-pool:updated" | "user-pool:udf-added" | "user-pool:udf-deleted" | "user-pool:env-added" | "user-pool:env-deleted" | "user-pool:env-updated" | "user-pool:launchpad-app-installed" | "user-pool:launchpad-app-uninstalled" | "application:created" | "application:updated" | "application:deleted" | "application:secret-refreshed" | "data-resource:created" | "data-resource:updated" | "data-resource:deleted" | "data-strategy-permission:revoke" | "data-strategy-permission:add" | "unusual-location:login" | "refresh-token")[];
  /** Webhook 回调地址 */
  "url": string;
  /** Webhook 名称 */
  "name": string;
  /** 是否启用 */
  "enabled"?: undefined | false | true;
  /** 请求密钥 */
  "secret"?: undefined | string;
  /** 失败重试配置 */
  "retryConfig"?: undefined | GenAuthSdkWebhookRetryConfigV3Dto;
}

export interface GenAuthSdkWebhookDto {
  /** Webhook ID */
  "webhookId": string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** Webhook 名称 */
  "name": string;
  /** Webhook 回调地址 */
  "url": string;
  /** 请求数据格式 */
  "contentType": "application/json" | "application/x-www-form-urlencoded";
  /** 是否启用 */
  "enabled": boolean;
  /** 用户真实名称，不具备唯一性。 示例值: 张三 */
  "events"?: undefined | ("test" | "register" | "login" | "mfa:verified" | "kick" | "user:created" | "user:password-changed" | "user:updated" | "user:email-verified" | "user:archived" | "user:unarchived" | "user:blocked" | "user:unblocked" | "user:deleted" | "user:register-whitelist-added" | "user:register-whitelist-deleted" | "user:udv-changed" | "user:link-account" | "user:password-update-remind" | "user:organization-node-update" | "permission:revoke" | "permission:add" | "resource:created" | "resource:delete" | "resource:updated" | "role:created" | "role:updated" | "role:deleted" | "role:disable" | "role:assigned" | "subject:remove" | "role:unassigned" | "role:udv-changed" | "application:mfa:enabled" | "application:mfa:disabled" | "group:created" | "group:updated" | "group:deleted" | "group:member-added" | "group:member-removed" | "organization:created" | "organization:imported" | "organization:deleted" | "organization:node-added" | "organization:node-updated" | "organization:tree-updated" | "organization:node-deleted" | "organization:node-moved" | "organization:member-added" | "organization:member-removed" | "organization:udv-changed" | "privilege-namespace:created" | "privilege-namespace:updated" | "privilege-namespace:deleted" | "user-pool:cooperator-added" | "user-pool:cooperator-removed" | "user-pool:secret-refreshed" | "user-pool:updated" | "user-pool:udf-added" | "user-pool:udf-deleted" | "user-pool:env-added" | "user-pool:env-deleted" | "user-pool:env-updated" | "user-pool:launchpad-app-installed" | "user-pool:launchpad-app-uninstalled" | "application:created" | "application:updated" | "application:deleted" | "application:secret-refreshed" | "data-resource:created" | "data-resource:updated" | "data-resource:deleted" | "data-strategy-permission:revoke" | "data-strategy-permission:add" | "unusual-location:login" | "refresh-token")[];
  /** 请求密钥 */
  "secret"?: undefined | string;
  /** 失败重试配置 */
  "retryConfig"?: undefined | GenAuthSdkWebhookRetryConfigV3Dto;
}

export interface GenAuthSdkObject157 {
  /** 当前页数，从 1 开始 * */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 * */
  "limit"?: undefined | number;
}

export interface GenAuthSdkGetWebhooksData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthSdkWebhookDto)[];
}

export interface GenAuthSdkUpdateWebhookDto {
  /** Webhook ID */
  "webhookId": string;
  /** Webhook 名称 */
  "name"?: undefined | string;
  /** Webhook 回调地址 */
  "url"?: undefined | string;
  /** 事件 */
  "events"?: undefined | ("test" | "register" | "login" | "mfa:verified" | "kick" | "user:created" | "user:password-changed" | "user:updated" | "user:email-verified" | "user:archived" | "user:unarchived" | "user:blocked" | "user:unblocked" | "user:deleted" | "user:register-whitelist-added" | "user:register-whitelist-deleted" | "user:udv-changed" | "user:link-account" | "user:password-update-remind" | "user:organization-node-update" | "permission:revoke" | "permission:add" | "resource:created" | "resource:delete" | "resource:updated" | "role:created" | "role:updated" | "role:deleted" | "role:disable" | "role:assigned" | "subject:remove" | "role:unassigned" | "role:udv-changed" | "application:mfa:enabled" | "application:mfa:disabled" | "group:created" | "group:updated" | "group:deleted" | "group:member-added" | "group:member-removed" | "organization:created" | "organization:imported" | "organization:deleted" | "organization:node-added" | "organization:node-updated" | "organization:tree-updated" | "organization:node-deleted" | "organization:node-moved" | "organization:member-added" | "organization:member-removed" | "organization:udv-changed" | "privilege-namespace:created" | "privilege-namespace:updated" | "privilege-namespace:deleted" | "user-pool:cooperator-added" | "user-pool:cooperator-removed" | "user-pool:secret-refreshed" | "user-pool:updated" | "user-pool:udf-added" | "user-pool:udf-deleted" | "user-pool:env-added" | "user-pool:env-deleted" | "user-pool:env-updated" | "user-pool:launchpad-app-installed" | "user-pool:launchpad-app-uninstalled" | "application:created" | "application:updated" | "application:deleted" | "application:secret-refreshed" | "data-resource:created" | "data-resource:updated" | "data-resource:deleted" | "data-strategy-permission:revoke" | "data-strategy-permission:add" | "unusual-location:login" | "refresh-token")[];
  /** 请求数据格式 */
  "contentType"?: undefined | "application/json" | "application/x-www-form-urlencoded";
  /** 是否启用 */
  "enabled"?: undefined | false | true;
  /** 请求密钥 */
  "secret"?: undefined | string;
  /** 失败重试配置 */
  "retryConfig"?: undefined | GenAuthSdkWebhookRetryConfigV3Dto;
}

export interface GenAuthSdkDeleteWebhookDto {
  /** webhookId 数组 */
  "webhookIds": (string)[];
}

export interface GenAuthSdkListWebhookLogs {
  /** Webhook ID */
  "webhookId": string;
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
}

export interface GenAuthSdkListWebhookLogsData {
  /** 记录总数 */
  "totalCount": number;
  /** 返回列表 */
  "list": (GenAuthSdkWebhookLogDto)[];
}

export interface GenAuthSdkTriggerWebhookDto {
  /** Webhook ID */
  "webhookId": string;
  /** 请求头 */
  "requestHeaders"?: unknown;
  /** 请求体 */
  "requestBody"?: unknown;
}

export interface GenAuthSdkTriggerWebhookData {
  /** 原来接口返回的 response 数据 */
  "response": Record<string, unknown>;
}

export interface GenAuthSdkObject158 {
  /** Webhook ID * */
  "webhookId": string;
}

export interface GenAuthSdkWebhookEventListData {
  /** 分类列表 */
  "categories": (GenAuthSdkWebhookCategoryDto)[];
  /** 事件列表 */
  "events": (GenAuthSdkWebhookEventDto)[];
}

export interface GenAuthSdkLdapConfigInfoDto {
  /** ID */
  "id"?: undefined | string;
  /** LDAP 服务是否开启1 是、2 否 */
  "enabled": number;
  /** 用户池 ID */
  "userPoolId": string;
  /** LDAP host */
  "linkUrl": string;
  /** LDAPS host */
  "ldapsLinkUrl": string;
  /** 是否是私有化的 LDAP Server 1 是、2 否 */
  "enablePrivatization": number;
  /** 根据 domain 生成的 bindDN */
  "bindDn": string;
  /** LDAP 域名，用于生成 baseDN */
  "ldapDomain": string;
  /** 私有化时是否开启 SSL 1 是、2 否 */
  "enableSsl"?: undefined | number;
  /** dc=ibm,dc=com,o=authing */
  "baseDn": string;
  /** 加密存储的 bindDn 密码(16位) */
  "bindPwd": string;
  /** 组织机构可见范围，值为组织节点 ID，用逗号分隔 */
  "visibleOrgNodes": unknown;
  /** 用户基础字段可见范围 */
  "visibleFields": unknown;
  /** 用户拓展字段映射到的 LDAP 字段，存储为 JSON 字符串 */
  "udfMapping": unknown;
}

export interface GenAuthSdkLdapUpdateDto {
  /** bindDn 密码 */
  "bindPwd"?: undefined | string;
}

export interface GenAuthSdkLdapSaveDto {
  /** LDAP 域名 */
  "ldapDomain": string;
  /** LDAP host */
  "linkUrl"?: undefined | string;
}

export interface GenAuthSdkLdapSetEnabledFlagDto {
  /** 开关是否开启 */
  "enabled": boolean;
}

export interface GenAuthSdkObject159 {
  /** 类型：1 访问日志，2 错误日志 * */
  "type": number;
  /** 当前页,从 1 开始 * */
  "page": number;
  /** 每页条数 * */
  "limit": number;
  /** 连接标识 * */
  "connection"?: undefined | number;
  /** 操作码 * */
  "operationNumber"?: undefined | number;
  /** 错误码 * */
  "errorCode"?: undefined | number;
  /** 消息内容 * */
  "message"?: undefined | string;
  /** 开始时间-时间戳 * */
  "startTime"?: undefined | number;
  /** 结束时间-时间戳 * */
  "endTime"?: undefined | number;
}

export interface GenAuthSdkLdapLogDto {
  /** 总数 */
  "totalCount": number;
  /** 记录数据 */
  "list": unknown;
}

export interface GenAuthSdkObject160 {
  /** 当前页,从 1 开始 * */
  "page": number;
  /** 每页条数 * */
  "limit": number;
  /** 当前 DN * */
  "dn"?: undefined | string;
}

export interface GenAuthSdkObject161 {
  /** 密钥所属用户 ID * */
  "userId"?: undefined | string;
  /** 密钥所属租户 ID * */
  "tenantId"?: undefined | string;
  /** 密钥类型 * */
  "type"?: undefined | string;
  /** AccessKey 状态，activated：已激活，staging：分级（可轮换），revoked：已撤销 * */
  "status"?: undefined | (string)[];
}

export interface GenAuthSdkListAccessKeyRespDto {
  /** 用户所拥有的 accessKeyId */
  "accessKeyId": string;
  /** 用户所拥有的 accessKeySecret */
  "accessKeySecret": string;
  /** 用户 ID */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** accessKeyId 状态 */
  "status": string;
  /** 最后使用时间 */
  "lastDate": string;
  /** accessKeyId 所在用户池 */
  "userPoolId": string;
  /** 密钥是否启用 */
  "enable": boolean;
}

export interface GenAuthSdkObject162 {
  /** 用户 ID * */
  "userId": string;
  /** accessKeyId * */
  "accessKeyId": string;
}

export interface GenAuthSdkGetAccessKeyRespDto {
  /** 用户所拥有的 accessKeyId */
  "accessKeyId": string;
  /** 用户所拥有的 accessKeySecret */
  "accessKeySecret": string;
  /** 用户 ID */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** accessKeyId 状态 */
  "status": string;
  /** 最后使用时间 */
  "lastDate": string;
  /** accessKeyId 所在用户池 */
  "userPoolId": string;
  /** 密钥是否启用 */
  "enable": boolean;
}

export interface GenAuthSdkCreateAccessKeyDto {
  /** 密钥类型 */
  "type": string;
  /** 密钥所属用户 ID */
  "userId"?: undefined | string;
  /** 密钥所属租户 ID */
  "tenantId"?: undefined | string;
}

export interface GenAuthSdkCreateAccessKeyRespDto {
  /** 用户所拥有的 accessKeyId */
  "accessKeyId": string;
  /** 用户所拥有的 accessKeySecret */
  "accessKeySecret": string;
  /** 用户 ID */
  "userId": string;
  /** 创建时间 */
  "createdAt": string;
  /** accessKeyId 状态 */
  "status": string;
  /** 最后使用时间 */
  "lastDate": string;
  /** accessKeyId 所在用户池 */
  "userPoolId": string;
  /** 密钥是否启用 */
  "enable": boolean;
}

export interface GenAuthSdkDeleteAccessKeyDto {
  /** accessKeyId */
  "accessKeyId": string;
}

export interface GenAuthSdkUpdateAccessKeyDto {
  /** 密钥是否生效 */
  "enable": boolean;
  /** AccessKey ID */
  "accessKeyId": string;
}

export interface GenAuthSdkObject163 {
  /** 搜索关键字 * */
  "keywords"?: undefined | string;
}

export interface GenAuthSdkPostItemDto {
  /** 岗位 ID */
  "id"?: undefined | string;
  /** 岗位 code */
  "code": string;
  /** 岗位名称 */
  "name": string;
  /** 岗位描述 */
  "description"?: undefined | string;
  /** 岗位关联用户数，只有在 skipCount 不为 true 时才存在 */
  "userCount": number;
  /** 岗位关联部门数，只有在 skipCount 不为 true 时才存在 */
  "departmentCount": number;
  /** 岗位元数据信息 */
  "metadataSource": (string)[];
}

export interface GenAuthSdkCondition {
  /** 搜索字段的 key */
  "key": string;
  /** 搜索值 */
  "value": unknown;
  /** 操作类型： - eq: 等于 - ne: 不等于 - co: 包含 - gt: 大于 - lt: 小于 - lte: 小于等于 - gte: 大于等于 - in: 数组包含 */
  "operator": string;
}

export interface GenAuthSdkScopeDto {
  /** 功能 id */
  "modelId": string;
  /** 行 id */
  "id": string;
  /** 字段 id */
  "fieldId": string;
}

export interface GenAuthSdkExpand {
  /** 关联的字段 key */
  "field": string;
  /** 展开哪些关联字段 */
  "select": (string)[];
}

export interface GenAuthSdkCellDto {
  /** 字段 id */
  "fieldId": string;
  /** 数据内容 */
  "value": unknown;
}

export interface GenAuthSdkDropDownItemDto {
  /** 选项 id */
  "key": string;
  /** 选项名称 */
  "label": string;
}

export interface GenAuthSdkRelationOptionalRange {
  /** 多个搜索条件的关系： - and: 且 - or:  或 */
  "conjunction": string;
  /** 搜索条件 */
  "conditions": GenAuthSdkCondition;
}

export interface GenAuthSdkListPublicAccountsAdvancedFilterItemDto {
  /** 高级搜索指定的公共账号字段： - `id`: 公共账号 ID - `phone`: 手机号 - `email`: 邮箱 - `username`: 用户名 - `externalId`: 公共账号在外部系统的 ID - `name`: 姓名 - `status`: 公共账号状态，可选值为 `Activated` 和 `Suspended` - `gender`: 公共账号性别，可选值为 `M`（男性）、`F`（女性） 和 `U`（未知） - `birthdate`: 出生日期 - `givenName`: 名 - `familyName`: 姓 - `preferredUsername`: Preferred Username - `profile`: 个人资料 - `country`: 国家 - `province`: 省份 - `zoneinfo`: 时区 - `website`: 个人网站 - `address`: 地址 - `streetAddress`: 街道地址 - `company`: 公司 - `postalCode`: 邮政编码 - `formatted`: 格式化的地址 - `signedUp`: 注册时间 - `locale`: 语言信息 - `lastLogin`: 上次登录时间，为时间戳类型 - `loginsCount`: 登录次数，为数字类型 - `lastLoginApp`: 上次登录的应用 ID - `userSource`: 公共账号来源，具体使用见示例 - `department`: 公共账号部门，具体使用见示例 - `loggedInApps`: 曾经登录过的应用，具体使用见示例 - ... 其他自定义字段 */
  "field": string;
  /** 运算符，可选值为： - `EQUAL`: 全等，适用于数字和字符串的全等匹配 - `NOT_EQUAL`: 不等于，适用于数字和字符串的匹配 - `CONTAINS`: 字符串包含 - `NOT_CONTAINS`: 字符串不包含 - `IS_NULL`: 为空 - `NOT_NULL`: 不为空 - `IN`: 为某个数组中的元素 - `GREATER`: 大于或等于，适用于数字、日期类型数据的比较 - `LESSER`: 小于或等于，适用于数字、日期类型数据的比较 - `BETWEEN`: 介于什么什么之间，适用于数字、日期类型数据的比较 */
  "operator": "EQUAL" | "NOT_EQUAL" | "CONTAINS" | "NOT_CONTAINS" | "IS_NULL" | "NOT_NULL" | "IN" | "GREATER" | "LESSER" | "BETWEEN";
  /** 搜索值，不同的 `field` 对应的 `value` 类型可能不一样，详情见示例。 */
  "value"?: unknown;
}

export interface GenAuthSdkListPublicAccountsOptionsDto {
  /** 分页配置 */
  "pagination"?: undefined | GenAuthSdkPaginationDto;
  /** 排序设置，可以设置多项按照多个字段进行排序 */
  "sort"?: undefined | (GenAuthSdkSortingDto)[];
  /** 模糊搜索匹配的公共账号字段，可选值为： - `phone`: 公共账号手机号，不能包含手机号区号，默认包含 - `email`: 公共账号邮箱，默认包含 - `name`: 公共账号名称，默认包含 - `username`: 用户名，默认包含 - `nickname`: 公共账号昵称，默认包含 - `id`: 公共账号 ID - `company`: 公司 - `givenName`: 名 - `familyName`: 姓 - `middleName`: 中间名 - `preferredUsername`: Preferred Username - `profile`: 个人资料 - `website`: 个人网站 - `address`: 地址 - `formatted`: 格式化地址 - `streetAddress`: 街道地址 - `postalCode`: 邮编号码 */
  "fuzzySearchOn"?: undefined | ("phone" | "email" | "username" | "id" | "name" | "externalId" | "nickname" | "company" | "givenName" | "familyName" | "middleName" | "profile" | "preferredUsername" | "website" | "address" | "formatted" | "streetAddress" | "postalCode" | "identityNumber")[];
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
  /** 是否获取部门 ID 列表 */
  "withDepartmentIds"?: undefined | false | true;
}

export interface GenAuthSdkCreatePublicAccountOtpDto {
  /** OTP 密钥 */
  "secret": string;
  /** OTP Recovery Code */
  "recoveryCode"?: undefined | string;
}

export interface GenAuthSdkCreatePublicAccountOptionsDto {
  /** 该参数一般在迁移旧有用户数据到 Authing 的时候会设置。开启这个开关，password 字段会直接写入 Authing 数据库，Authing 不会再次加密此字段。如果你的密码不是明文存储，你应该保持开启，并编写密码函数计算。 */
  "keepPassword"?: undefined | false | true;
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: undefined | false | true;
  /** 是否强制要求用户在第一次的时候重置密码 */
  "resetPasswordOnFirstLogin"?: undefined | false | true;
  /** 此次调用中使用的父部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 重置密码发送邮件和手机号选项 */
  "sendNotification"?: undefined | GenAuthSdkSendCreateAccountNotificationDto;
  /** 密码加密类型，支持使用 RSA256 和国密 SM2 算法进行加密。默认为 `none` 不加密。 - `none`: 不对密码进行加密，使用明文进行传输。 - `rsa`: 使用 RSA256 算法对密码进行加密，需要使用 Authing 服务的 RSA 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 RSA256 公钥。 - `sm2`: 使用 [国密 SM2 算法](https://baike.baidu.com/item/SM2/15081831) 对密码进行加密，需要使用 Authing 服务的 SM2 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 SM2 公钥。 */
  "passwordEncryptType"?: undefined | "sm2" | "rsa" | "none";
}

export interface GenAuthSdkUpdatePublicAccountOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 设置用户首次登录要求重置密码 */
  "resetPasswordOnFirstLogin"?: undefined | false | true;
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: undefined | false | true;
  /** 密码加密类型，支持使用 RSA256 和国密 SM2 算法进行加密。默认为 `none` 不加密。 - `none`: 不对密码进行加密，使用明文进行传输。 - `rsa`: 使用 RSA256 算法对密码进行加密，需要使用 Authing 服务的 RSA 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 RSA256 公钥。 - `sm2`: 使用 [国密 SM2 算法](https://baike.baidu.com/item/SM2/15081831) 对密码进行加密，需要使用 Authing 服务的 SM2 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 SM2 公钥。 */
  "passwordEncryptType"?: undefined | "sm2" | "rsa" | "none";
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: undefined | false | true;
  /** 重置密码发送邮件和手机号选项 */
  "sendPasswordResetedNotification"?: undefined | GenAuthSdkSendResetPasswordNotificationDto;
}

export interface GenAuthSdkUpdatePublicAccountInfoDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 账户当前状态 */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱是否验证 */
  "emailVerified"?: undefined | false | true;
  /** 手机号是否验证 */
  "phoneVerified"?: undefined | false | true;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
}

export interface GenAuthSdkUpdatePublicAccountBatchOptionsDto {
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: undefined | false | true;
  /** 密码加密类型，支持使用 RSA256 和国密 SM2 算法进行加密。默认为 `none` 不加密。 - `none`: 不对密码进行加密，使用明文进行传输。 - `rsa`: 使用 RSA256 算法对密码进行加密，需要使用 Authing 服务的 RSA 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 RSA256 公钥。 - `sm2`: 使用 [国密 SM2 算法](https://baike.baidu.com/item/SM2/15081831) 对密码进行加密，需要使用 Authing 服务的 SM2 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 SM2 公钥。 */
  "passwordEncryptType"?: undefined | "sm2" | "rsa" | "none";
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: undefined | false | true;
  /** 重置密码发送邮件和手机号选项 */
  "sendPasswordResetedNotification"?: undefined | GenAuthSdkSendResetPasswordNotificationDto;
}

export interface GenAuthSdkDeletePublicAccountsBatchOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkKickPublicAccountsOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkOrganizationNameI18nDto {
  /** 支持多语言的字段 */
  "organizationName": GenAuthSdkLangObject;
}

export interface GenAuthSdkDepartmentI18nDto {
  /** 支持多语言的字段 */
  "name": GenAuthSdkLangObject;
}

export interface GenAuthSdkSearchDepartmentsFilterItemDto {
  /** 高级搜索指定的部门字段： - `updatedAt`: 更新时间，高级搜索请用时间戳 - `createdAt`: 创建时间，高级搜索请用时间戳 - `name`: 部门名称 */
  "field": string;
  /** 运算符，可选值为： - `EQUAL`: 全等，适用于数字和字符串的全等匹配 - `IN`: 为某个数组中的元素 - `GREATER`: 大于或等于，适用于数字、日期类型数据的比较 - `LESSER`: 小于或等于，适用于数字、日期类型数据的比较 - `BETWEEN`: 介于什么什么之间，适用于数字、日期类型数据的比较 - `CONTAINS`: 字符串包含 */
  "operator": "BETWEEN" | "EQUAL" | "IN" | "LESSER" | "GREATER" | "CONTAINS";
  /** 搜索值，不同的 `field` 对应的 `value` 类型可能不一样 */
  "value"?: unknown;
}

export interface GenAuthSdkDepartmentSortingDto {
  /** 进行排序的字段，可选值为： - `updatedAt`: 创建时间 - `createdAt`: 修改时间 - `name`: 邮箱 */
  "field": "updatedAt" | "createdAt" | "name";
  /** 排序顺序： - `desc`: 按照从大到小降序。 - `asc`: 按照从小到大升序。 */
  "order": "desc" | "asc";
}

export interface GenAuthSdkUserInfoDto {
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
}

export interface GenAuthSdkListUsersAdvancedFilterItemDto {
  /** 高级搜索指定的用户字段： - `id`: 用户 ID - `phone`: 手机号 - `email`: 邮箱 - `username`: 用户名 - `externalId`: 用户在外部系统的 ID - `name`: 姓名 - `status`: 用户状态，可选值为 `Activated` 和 `Suspended` - `gender`: 用户性别，可选值为 `M`（男性）、`F`（女性） 和 `U`（未知） - `birthdate`: 出生日期 - `givenName`: 名 - `familyName`: 姓 - `preferredUsername`: Preferred Username - `profile`: 个人资料 - `country`: 国家 - `province`: 省份 - `zoneinfo`: 时区 - `website`: 个人网站 - `address`: 地址 - `streetAddress`: 街道地址 - `company`: 公司 - `postalCode`: 邮政编码 - `formatted`: 格式化的地址 - `signedUp`: 注册时间 - `locale`: 语言信息 - `lastLogin`: 上次登录时间，为时间戳类型 - `loginsCount`: 登录次数，为数字类型 - `lastLoginApp`: 上次登录的应用 ID - `userSource`: 用户来源，具体使用见示例 - `department`: 用户部门，具体使用见示例 - `loggedInApps`: 曾经登录过的应用，具体使用见示例 - `identity`: 用户外部身份源信息，具体使用见示例 - ... 其他自定义字段 */
  "field": string;
  /** 运算符，可选值为： - `EQUAL`: 全等，适用于数字和字符串的全等匹配 - `NOT_EQUAL`: 不等于，适用于数字和字符串的匹配 - `CONTAINS`: 字符串包含 - `NOT_CONTAINS`: 字符串不包含 - `IS_NULL`: 为空 - `NOT_NULL`: 不为空 - `IN`: 为某个数组中的元素 - `GREATER`: 大于或等于，适用于数字、日期类型数据的比较 - `LESSER`: 小于或等于，适用于数字、日期类型数据的比较 - `BETWEEN`: 介于什么什么之间，适用于数字、日期类型数据的比较 */
  "operator": "EQUAL" | "NOT_EQUAL" | "CONTAINS" | "NOT_CONTAINS" | "IS_NULL" | "NOT_NULL" | "IN" | "GREATER" | "LESSER" | "BETWEEN";
  /** 搜索值，不同的 `field` 对应的 `value` 类型可能不一样，详情见示例。 */
  "value"?: unknown;
}

export interface GenAuthSdkListUsersOptionsDto {
  /** 分页配置 */
  "pagination"?: undefined | GenAuthSdkPaginationDto;
  /** 排序设置，可以设置多项按照多个字段进行排序 */
  "sort"?: undefined | (GenAuthSdkSortingDto)[];
  /** 模糊搜索匹配的用户字段，可选值为： - `phone`: 用户手机号，不能包含手机号区号，默认包含 - `email`: 用户邮箱，默认包含 - `name`: 用户名称，默认包含 - `username`: 用户名，默认包含 - `nickname`: 用户昵称，默认包含 - `id`: 用户 ID - `company`: 公司 - `givenName`: 名 - `familyName`: 姓 - `middleName`: 中间名 - `preferredUsername`: Preferred Username - `profile`: 个人资料 - `website`: 个人网站 - `address`: 地址 - `formatted`: 格式化地址 - `streetAddress`: 街道地址 - `postalCode`: 邮编号码 */
  "fuzzySearchOn"?: undefined | ("phone" | "email" | "username" | "id" | "name" | "externalId" | "nickname" | "company" | "givenName" | "familyName" | "middleName" | "profile" | "preferredUsername" | "website" | "address" | "formatted" | "streetAddress" | "postalCode" | "identityNumber")[];
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 部门信息 */
  "withPost"?: undefined | false | true;
  /** 是否获取 identities */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 */
  "withDepartmentIds"?: undefined | false | true;
  /** 是否拍平扩展字段 */
  "flatCustomData"?: undefined | false | true;
}

export interface GenAuthSdkUserFieldDecryptReqItemDto {
  /** 用户唯一标志，可以是用户 ID、用户名、邮箱、手机号、外部 ID、在外部身份源的 ID。 */
  "userId"?: undefined | string;
  /** 字段的key名称，例如 username/phone */
  "fieldName"?: undefined | string;
  /** 字段加密后的内容 */
  "encryptedContent": string;
}

export interface GenAuthSdkCreateUserOtpDto {
  /** OTP 密钥 */
  "secret": string;
  /** OTP Recovery Code */
  "recoveryCode"?: undefined | string;
}

export interface GenAuthSdkCreateIdentityDto {
  /** 身份源连接 ID */
  "extIdpId": string;
  /** 外部身份源类型： - `wechat`: 微信 - `qq`: QQ - `wechatwork`: 企业微信 - `dingtalk`: 钉钉 - `weibo`: 微博 - `github`: GitHub - `alipay`: 支付宝 - `baidu`: 百度 - `lark`: 飞书 - `welink`: Welink - `yidun`: 网易易盾 - `qingcloud`: 青云 - `google`: Google - `gitlab`: GitLab - `gitee`: Gitee - `twitter`: Twitter - `facebook`: Facebook - `slack`: Slack - `linkedin`: Linkedin - `instagram`: Instagram - `oidc`: OIDC 型企业身份源 - `oauth2`: OAuth2 型企业身份源 - `saml`: SAML 型企业身份源 - `ldap`: LDAP 型企业身份源 - `ad`: AD 型企业身份源 - `cas`: CAS 型企业身份源 - `azure-ad`: Azure AD 型企业身份源 */
  "provider": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5";
  /** Identity 类型，如 unionid, openid, primary */
  "type": string;
  /** 在外部身份源中的 ID */
  "userIdInIdp": string;
  /** 用户在 idp 中的身份信息 */
  "userInfoInIdp": unknown;
  /** 在外部身份源中的 Access Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "accessToken"?: undefined | string;
  /** 在外部身份源中的 Refresh Token（此参数只会在用户主动获取时返回，管理侧接口不会返回）。 */
  "refreshToken"?: undefined | string;
  /** 身份来自的身份源连接 ID 列表 */
  "originConnIds": (string)[];
}

export interface GenAuthSdkCreateUserOptionsDto {
  /** 该参数一般在迁移旧有用户数据到 Authing 的时候会设置。开启这个开关，password 字段会直接写入 Authing 数据库，Authing 不会再次加密此字段。如果你的密码不是明文存储，你应该保持开启，并编写密码函数计算。 */
  "keepPassword"?: undefined | false | true;
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: undefined | false | true;
  /** 是否强制要求用户在第一次的时候重置密码 */
  "resetPasswordOnFirstLogin"?: undefined | false | true;
  /** 此次调用中使用的父部门 ID 的类型 */
  "departmentIdType"?: undefined | "department_id" | "open_department_id" | "sync_relation" | "custom_field" | "code";
  /** 重置密码发送邮件和手机号选项 */
  "sendNotification"?: undefined | GenAuthSdkSendCreateAccountNotificationDto;
  /** 密码加密类型，支持使用 RSA256 和国密 SM2 算法进行加密。默认为 `none` 不加密。 - `none`: 不对密码进行加密，使用明文进行传输。 - `rsa`: 使用 RSA256 算法对密码进行加密，需要使用 Authing 服务的 RSA 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 RSA256 公钥。 - `sm2`: 使用 [国密 SM2 算法](https://baike.baidu.com/item/SM2/15081831) 对密码进行加密，需要使用 Authing 服务的 SM2 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 SM2 公钥。 */
  "passwordEncryptType"?: undefined | "sm2" | "rsa" | "none";
}

export interface GenAuthSdkCreateUserInfoDto {
  /** 账户当前状态 */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 邮箱是否验证 */
  "emailVerified"?: undefined | false | true;
  /** 手机号是否验证 */
  "phoneVerified"?: undefined | false | true;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 加密用户密码的盐 */
  "salt"?: undefined | string;
  /** 租户 ID */
  "tenantIds"?: undefined | (string)[];
  /** 用户的 OTP 验证器 */
  "otp"?: undefined | GenAuthSdkCreateUserOtpDto;
  /** 用户所属部门 ID 列表 */
  "departmentIds"?: undefined | (string)[];
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
  /** 数据对象数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "metadataSource"?: unknown;
  /** 第三方身份源（建议调用绑定接口进行绑定） */
  "identities"?: undefined | (GenAuthSdkCreateIdentityDto)[];
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
}

export interface GenAuthSdkUpdateUserOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
  /** 设置用户首次登录要求重置密码 */
  "resetPasswordOnFirstLogin"?: undefined | false | true;
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: undefined | false | true;
  /** 密码加密类型，支持使用 RSA256 和国密 SM2 算法进行加密。默认为 `none` 不加密。 - `none`: 不对密码进行加密，使用明文进行传输。 - `rsa`: 使用 RSA256 算法对密码进行加密，需要使用 Authing 服务的 RSA 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 RSA256 公钥。 - `sm2`: 使用 [国密 SM2 算法](https://baike.baidu.com/item/SM2/15081831) 对密码进行加密，需要使用 Authing 服务的 SM2 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 SM2 公钥。 */
  "passwordEncryptType"?: undefined | "sm2" | "rsa" | "none";
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: undefined | false | true;
  /** 重置密码发送邮件和手机号选项 */
  "sendPasswordResetedNotification"?: undefined | GenAuthSdkSendResetPasswordNotificationDto;
}

export interface GenAuthSdkUpdateUserInfoDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 手机区号，中国大陆手机号可不填。Authing 短信服务暂不内置支持国际手机号，你需要在 Authing 控制台配置对应的国际短信服务。完整的手机区号列表可参阅 https://en.wikipedia.org/wiki/List_of_country_calling_codes。 */
  "phoneCountryCode"?: undefined | string;
  /** 用户真实名称，不具备唯一性 */
  "name"?: undefined | string;
  /** 昵称 */
  "nickname"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
  /** 第三方外部 ID */
  "externalId"?: undefined | string;
  /** 账户当前状态 */
  "status"?: undefined | "Suspended" | "Resigned" | "Activated" | "Archived" | "Deactivated";
  /** 邮箱是否验证 */
  "emailVerified"?: undefined | false | true;
  /** 手机号是否验证 */
  "phoneVerified"?: undefined | false | true;
  /** 出生日期 */
  "birthdate"?: undefined | string;
  /** 所在国家 */
  "country"?: undefined | string;
  /** 所在省份 */
  "province"?: undefined | string;
  /** 所在城市 */
  "city"?: undefined | string;
  /** 所处地址 */
  "address"?: undefined | string;
  /** 所处街道地址 */
  "streetAddress"?: undefined | string;
  /** 邮政编码号 */
  "postalCode"?: undefined | string;
  /** 性别 */
  "gender"?: undefined | "M" | "F" | "U";
  /** 用户名，用户池内唯一 */
  "username"?: undefined | string;
  /** 邮箱，不区分大小写 */
  "email"?: undefined | string;
  /** 手机号，不带区号。如果是国外手机号，请在 phoneCountryCode 参数中指定区号。 */
  "phone"?: undefined | string;
  /** 用户密码，默认为明文。我们使用 HTTPS 协议对密码进行安全传输，可以在一定程度上保证安全性。如果你还需要更高级别的安全性，我们还支持 RSA256 和国密 SM2 两种方式对密码进行加密。详情见 `passwordEncryptType` 参数。 */
  "password"?: undefined | string;
  /** 所在公司 */
  "company"?: undefined | string;
  /** 最近一次登录时使用的浏览器 UA */
  "browser"?: undefined | string;
  /** 最近一次登录时使用的设备 */
  "device"?: undefined | string;
  /** 名 */
  "givenName"?: undefined | string;
  /** 姓 */
  "familyName"?: undefined | string;
  /** 中间名 */
  "middleName"?: undefined | string;
  /** Preferred Username */
  "profile"?: undefined | string;
  /** Preferred Username */
  "preferredUsername"?: undefined | string;
  /** 用户个人网页 */
  "website"?: undefined | string;
  /** 用户时区信息 */
  "zoneinfo"?: undefined | string;
  /** Locale */
  "locale"?: undefined | string;
  /** 标准的完整地址 */
  "formatted"?: undefined | string;
  /** 用户所在区域 */
  "region"?: undefined | string;
  /** 用户身份证号码 */
  "identityNumber"?: undefined | string;
  /** 自定义数据，传入的对象中的 key 必须先在用户池定义相关自定义字段 */
  "customData"?: unknown;
  /** 数据对象数据，传入的对象中的 key 必须先在用户数据对象相关自定义字段 */
  "metadata"?: unknown;
}

export interface GenAuthSdkUpdateUserBatchOptionsDto {
  /** 下次登录要求重置密码 */
  "resetPasswordOnNextLogin"?: undefined | false | true;
  /** 密码加密类型，支持使用 RSA256 和国密 SM2 算法进行加密。默认为 `none` 不加密。 - `none`: 不对密码进行加密，使用明文进行传输。 - `rsa`: 使用 RSA256 算法对密码进行加密，需要使用 Authing 服务的 RSA 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 RSA256 公钥。 - `sm2`: 使用 [国密 SM2 算法](https://baike.baidu.com/item/SM2/15081831) 对密码进行加密，需要使用 Authing 服务的 SM2 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 SM2 公钥。 */
  "passwordEncryptType"?: undefined | "sm2" | "rsa" | "none";
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: undefined | false | true;
  /** 重置密码发送邮件和手机号选项 */
  "sendPasswordResetedNotification"?: undefined | GenAuthSdkSendResetPasswordNotificationDto;
}

export interface GenAuthSdkDeleteUsersBatchOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkPrincipalAuthenticationInfoDto {
  /** 是否进行认证 */
  "authenticated": boolean;
  /** 用户 ID */
  "principalType": string;
  /** 认证主体证件号码 */
  "principalCode": string;
  /** 认证主体名称 */
  "principalName": string;
  /** 认证时间，标准时间字符串 */
  "authenticatedAt": string;
}

export interface GenAuthSdkResetUserPrincipalAuthenticationInfoOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkUserDepartmentRespDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门 ID */
  "departmentId": string;
  /** 是否为根部门 */
  "isRoot": boolean;
  /** 部门创建时间 */
  "createdAt": string;
  /** 部门名称 */
  "name": string;
  /** 部门描述 */
  "description": string;
  /** 自定义部门 ID，用于存储自定义的 ID */
  "openDepartmentId"?: undefined | string;
  /** 是否是部门 Leader */
  "isLeader": boolean;
  /** 部门识别码 */
  "code": string;
  /** 是否是主部门 */
  "isMainDepartment": boolean;
  /** 加入部门时间 */
  "joinedAt": string;
  /** 是否是虚拟部门 */
  "isVirtualNode": boolean;
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkDepartmentI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: unknown;
  /** 部门 ID 路径 */
  "departmentIdPath"?: undefined | (string)[];
  /** 部门 Code 路径 */
  "departmentCodePath"?: undefined | (string)[];
  /** 部门名路径 */
  "departmentNamePath"?: undefined | (string)[];
}

export interface GenAuthSdkSetUserDepartmentDto {
  /** 部门 id */
  "departmentId": string;
  /** 是否是部门 leader */
  "isLeader"?: undefined | false | true;
  /** 是否是主部门 */
  "isMainDepartment"?: undefined | false | true;
}

export interface GenAuthSdkSetUserDepartmentsOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkResGroupDto {
  /** 分组 ID */
  "id": string;
  /** 分组 code */
  "code": string;
  /** 分组名称 */
  "name": string;
  /** 分组描述 */
  "description": string;
  /** 分组类型 */
  "type": string;
  /** 分组元数据信息 */
  "metadataSource": (string)[];
  /** 成员列表 */
  "members": (GenAuthSdkUserDto)[];
}

export interface GenAuthSdkListArchivedUsersRespDto {
  /** 用户 ID */
  "userId": string;
  /** 归档时间 */
  "archivedAt": string;
}

export interface GenAuthSdkKickUsersOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkHasRoleRolesDto {
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
  /** 角色 code */
  "code": string;
}

export interface GenAuthSdkHasAnyRoleOptionsDto {
  /** 用户 ID 类型，默认值为 `user_id`，可选值为： - `user_id`: Authing 用户 ID，如 `6319a1504f3xxxxf214dd5b7` - `phone`: 用户手机号 - `email`: 用户邮箱 - `username`: 用户名 - `external_id`: 用户在外部系统的 ID，对应 Authing 用户信息的 `externalId` 字段 - `identity`: 用户的外部身份源信息，格式为 `<extIdpId>:<userIdInIdp>`，其中 `<extIdpId>` 为 Authing 身份源的 ID，`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`62f20932716fbcc10d966ee5:ou_8bae746eac07cd2564654140d2a9ac61`。 - `sync_relation`: 用户的外部身份源信息，格式为 `<provier>:<userIdInIdp>`，其中 `<provier>` 为同步身份源类型，如 wechatwork, lark；`<userIdInIdp>` 为用户在外部身份源的 ID。 示例值：`lark:ou_8bae746eac07cd2564654140d2a9ac61`。 */
  "userIdType"?: undefined | "user_id" | "external_id" | "phone" | "email" | "username" | "identity" | "sync_relation" | "custom_field";
}

export interface GenAuthSdkUserLoginHistoryDto {
  /** App ID */
  "appId": string;
  /** App 名称 */
  "appName": string;
  /** App Logo */
  "appLogo": string;
  /** App 登录地址 */
  "appLoginUrl": string;
  /** 客户端 IP */
  "clientIp": string;
  /** 登录时使用的 user agent */
  "userAgent"?: undefined | string;
  /** 登录时间 */
  "time": string;
}

export interface GenAuthSdkImportOtpItemDto {
  /** 用户 ID */
  "userId": string;
  /** OTP 数据 */
  "otp": GenAuthSdkImportOtpItemDataDto;
}

export interface GenAuthSdkApplicationMfaDto {
  /** MFA 类型 */
  "mfaPolicy": string;
  /** MFA 状态 */
  "status": number;
  /** MFA 排序 */
  "sort": number;
}

export interface GenAuthSdkSyncTaskProvisioningScope {
  /** 是否同步所选组织机构下的所有用户和部门 */
  "all": boolean;
  /** 是否包含新增的用户 */
  "includeNewUsers": boolean;
}

export interface GenAuthSdkSyncTaskFieldMapping {
  /** 源字段 */
  "expression": string;
  /** 转换后的字段 */
  "targetKey": string;
}

export interface GenAuthSdkSyncTaskTimedScheduler {
  /** 定时周期： - `month`: 每个月执行一次 - `week`: 每周执行一次 - `days`: 每天执行一次 - `sixHours`: 每六小时执行一次 - `twoHours`: 每两小时执行一次 */
  "cycle": "month" | "week" | "days" | "sixHours" | "twoHours";
  /** 开始时间 */
  "startTime": number;
}

export interface GenAuthSdkSyncTaskClientConfig {
  /** 飞书同步任务配置 */
  "larkConfig"?: undefined | GenAuthSdkSyncTaskLarkClientConfig;
  /** 飞书(国际版)同步任务配置 */
  "larkInternationalConfig"?: undefined | GenAuthSdkSyncTaskLarkClientConfig;
  /** 企业微信同步任务配置 */
  "wechatworkConfig"?: undefined | GenAuthSdkSyncTaskWechatworkClientConfig;
  /** 钉钉同步任务配置 */
  "dingtalkConfig"?: undefined | GenAuthSdkSyncTaskDingtalkClientConfig;
  /** Moka 同步任务配置 */
  "mokaConfig"?: undefined | GenAuthSdkSyncTaskMokaClientConfig;
  /** 自定义同步源同步任务配置 */
  "scimConfig"?: undefined | GenAuthSdkSyncTaskScimClientConfig;
  /** Windows AD 同步任务配置 */
  "activeDirectoryConfig"?: undefined | GenAuthSdkSyncTaskActiveDirectoryClientConfig;
  /** LDAP 同步任务配置 */
  "ldapConfig"?: undefined | GenAuthSdkSyncTaskLdapClientConfig;
  /** 北森同步任务配置 */
  "italentConfig"?: undefined | GenAuthSdkSyncTaskItalentClientConfig;
  /** 每刻报销同步任务配置 */
  "maycurConfig"?: undefined | GenAuthSdkSyncTaskMaycurClientConfig;
  /** 纷享销客同步任务配置 */
  "fxiaokeConfig"?: undefined | GenAuthSdkSyncTaskFxiaokeClientConfig;
  /** 销售易同步任务配置 */
  "xiaoshouyiConfig"?: undefined | GenAuthSdkSyncTaskXiaoshouyiClientConfig;
  /** 嘉扬同步任务配置 */
  "kayangConfig"?: undefined | GenAuthSdkSyncTaskKayangClientConfig;
}

export interface GenAuthSdkSyncRiskOperationDto {
  /** 同步任务风险操作 ID */
  "syncRiskOperationId": number;
  /** 同步任务 ID */
  "syncTaskId": number;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
  /** 执行状态: - `PENDING`: 待执行 - `SUCCESS`: 成功 - `FAILED`: 失败 - `CANCELED`: 已取消 - `EXECUTING`: 执行中 */
  "status": "PENDING" | "SUCCESS" | "FAILED" | "CANCELED" | "EXECUTING";
  /** 优先级，数字越小表示优先级越高。 */
  "level": number;
  /** 操作对象类型: - `department`: 部门 - `user`: 用户 */
  "objectType": "DEPARTMENT" | "USER";
  /** 操作对象（用户、分组、部门）名称 */
  "objectName": string;
  /** 操作对象 ID */
  "objectId": string;
  /** 执行失败的错误信息 */
  "errMsg"?: undefined | string;
}

export interface GenAuthSdkInvitationConfigDto {
  /** 有效期(天)，-1 永久有效 */
  "expiredTimeOfDay": number;
  /** 是否加入邀请人相同部门 */
  "joinSameDepartment": boolean;
  /** 确认邀请后，加入的部门列表 */
  "departmentIds"?: undefined | (string)[];
  /** 是否需要管理员确认 */
  "enabledAdminConsent"?: undefined | false | true;
}

export interface GenAuthSdkCombineFiltersBaseDto {
  /** 条件组合方式 */
  "type": "and" | "or";
  /** 筛选条件 */
  "filters": (GenAuthSdkCombineFilterItemDto)[];
}

export interface GenAuthSdkUniversalInvitationApplicantData {
  /** 申请 ID */
  "id": string;
  /** 申请人 */
  "applicant": string;
  /** 邮箱 */
  "email": string;
  /** 邀请人 ID */
  "inviterId": string;
  /** 审批人 ID */
  "operatorId"?: undefined | string;
  /** 审批状态: - `PENDING`: 待审批 - `PASSED`: 已通过 - `REJECTED`: 已拒绝 */
  "status": "PENDING" | "PASSED" | "REJECTED";
  /** 加入方式: - `MANUAL`: 人工审批 - `AUTO`: 自动加入 */
  "channel": "MANUAL" | "AUTO";
  /** 邀请人详情 */
  "inviterDetail"?: undefined | GenAuthSdkCommonUserDto;
  /** 审批人详情 */
  "operatorDetail"?: undefined | GenAuthSdkCommonUserDto;
}

export interface GenAuthSdkInvitationLinkConfigDto {
  /** 链接失效规则 - `period`: 有效期内始终有效 - `afterFirstClick`: 第一次点击后失效 */
  "inviteLinkDisuseRule": "period" | "afterFirstClick";
  /** 链接过期时间单位 */
  "linkExpiredTimeUnit": "forever" | "day" | "hour" | "minute";
  /** 链接过期时间秒数 */
  "linkExpiredTimeOfSecond": number;
  /** 邀请页面信息填写的失效时间单位 */
  "pageExpiredTimeUnit": "minute" | "hour" | "day";
  /** 邀请页面信息填写的失效时间秒数，最大 2592000 秒(30 天) */
  "pageExpiredTimeOfSecond": number;
}

export interface GenAuthSdkDefaultPasswordConfigDto {
  /** 秘密初始化方式 - `random`: 系统随机 - `custom`: 指定固定值 */
  "type": "random" | "custom";
  /** 初始密码固定值 */
  "custom"?: undefined | string;
}

export interface GenAuthSdkExtendsFieldDto {
  /** 字段类型 - `internal`: 用户内置字段 - `user`: 用户扩展字段 */
  "type": "user" | "internal";
  /** 字段 ID, 如果字段类型是 `user` 和 `metadata` 时，必填 */
  "id": string;
  /** 字段名 */
  "name": string;
  /** 字段显示名称 */
  "label": string;
  /** 是否显示 */
  "show": boolean;
  /** 是否允许用户覆写 */
  "allowRewrite": boolean;
  /** 字段数据类型(具体参考扩展字段配置) - `number`: 数组 - `datetime`: 日期 - `select`: 枚举 - `boolean`: 布尔值 - `string`: 字符串 */
  "inputType": "image" | "number" | "date" | "dateTime" | "datetime" | "select" | "dropdown" | "boolean" | "string" | "text" | "gender" | "country" | "username" | "phone" | "email";
  /** 是否必填 */
  "required"?: undefined | false | true;
  /** 校验规则 */
  "validateRules"?: undefined | GenAuthSdkAppValidateRuleDto;
  /** 字段来源 */
  "source": "preset" | "manual_add";
  /** 多语言显示名称 */
  "i18n"?: undefined | GenAuthSdkCustomFieldI18n;
}

export interface GenAuthSdkUpdateExtendsFieldDto {
  /** 字段类型 - `internal`: 用户内置字段 - `user`: 用户扩展字段 */
  "type": "user" | "internal";
  /** 字段 ID, 如果字段类型是 `user` 和 `metadata` 时，必填 */
  "id": string;
  /** 字段名 */
  "name": string;
  /** 字段显示名称 */
  "label": string;
  /** 是否显示 */
  "show": boolean;
  /** 是否允许用户覆写 */
  "allowRewrite": boolean;
  /** 字段数据类型(具体参考扩展字段配置) - `number`: 数组 - `datetime`: 日期 - `select`: 枚举 - `boolean`: 布尔值 - `string`: 字符串 */
  "inputType": "image" | "number" | "date" | "dateTime" | "datetime" | "select" | "dropdown" | "boolean" | "string" | "text" | "gender" | "country" | "username" | "phone" | "email";
  /** 是否必填 */
  "required"?: undefined | false | true;
  /** 校验规则 */
  "validateRules"?: undefined | GenAuthSdkAppValidateRuleDto;
  /** 多语言显示名称 */
  "i18n"?: undefined | GenAuthSdkCustomFieldI18n;
}

export interface GenAuthSdkInvitationDepartmentRespDto {
  /** 组织 Code（organizationCode） */
  "organizationCode": string;
  /** 部门系统 ID（为 Authing 系统自动生成，不可修改） */
  "departmentId": string;
  /** 部门创建时间 */
  "createdAt": string;
  /** 修改时间 */
  "updatedAt"?: undefined | string;
  /** 自定义部门 ID，用于存储自定义的 ID */
  "openDepartmentId"?: undefined | string;
  /** 部门名称 */
  "name": string;
  /** 部门负责人 ID */
  "leaderUserIds"?: undefined | (string)[];
  /** 部门描述 */
  "description"?: undefined | string;
  /** 父部门 id，如果是根部门，传 root */
  "parentDepartmentId": string;
  /** 部门识别码 */
  "code"?: undefined | string;
  /** 父部门 code */
  "parentDepartmentCode": string;
  /** 部门人数（仅包含直属成员） */
  "membersCount": number;
  /** 是否包含子部门 */
  "hasChildren": boolean;
  /** 是否是虚拟部门 */
  "isVirtualNode"?: undefined | false | true;
  /** 多语言设置 */
  "i18n"?: undefined | GenAuthSdkDepartmentI18nDto;
  /** 部门的扩展字段数据 */
  "customData"?: unknown;
  /** 部门关联的岗位 */
  "posts"?: undefined | (string)[];
  /** 岗位 id 列表 */
  "postIdList"?: undefined | (string)[];
  /** 部门状态 */
  "status"?: undefined | false | true;
  /** 访问限制 */
  "allow"?: undefined | string;
  /** 部门 ID */
  "id": string;
  /** 从顶层部门到当前部门的 ID 路径 */
  "idPath"?: undefined | (string)[];
  /** 从顶层部门到当前部门的部门名路径 */
  "namePath"?: undefined | (string)[];
  /** 从顶层部门到当前部门的部门 code 路径 */
  "codePath"?: undefined | null | string;
}

export interface GenAuthSdkInvitationPostRespDto {
  /** 岗位 ID */
  "id": string;
  /** 岗位 code */
  "code": string;
  /** 岗位名称 */
  "name": string;
  /** 岗位描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkInvitationPolicyUserAttributionListDto {
  /** 关联对象的唯一标志符： - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` - 如果是岗位，为岗位的 code，如 `leader` - 如果是租户，为租户的 ID，如 `6343b98b7cfxxx9366e9b7c` */
  "targetIdentifiers": (string)[];
  /** 角色所在权限空间 code，若 targetType 是 role，此参数必传 */
  "namespace"?: undefined | string;
  /** 关联对象类型 */
  "targetType": "department" | "post" | "role" | "group";
}

export interface GenAuthSdkCommonUserDto {
  /** ID */
  "id": string;
  /** 显示名称 */
  "displayName"?: undefined | string;
  /** 头像链接 */
  "photo"?: undefined | string;
}

export interface GenAuthSdkQuickFilterInviteeRecordDto {
  /** 名单 ID */
  "rosterId": string;
  /** 名单名称 */
  "rosterName": string;
  /** 受邀人 ID */
  "inviteeId": string;
  /** 受邀人名称 */
  "inviteeName": string;
  /** 受邀人手机号国际区码 */
  "inviteePhoneCountryCode"?: undefined | string;
  /** 受邀人手机号 */
  "inviteePhone"?: undefined | string;
  /** 受邀人邮箱，不区分大小写 */
  "inviteeEmail": string;
  /** 受邀人状态 */
  "inviteeStatus": "invited" | "registering" | "registered" | "reverted" | "notInvited" | "expired" | "invitationSendFail" | "joinedByOther";
  /** 受邀人来源 */
  "inviteeSource": "manualCreate" | "fileImport";
}

export interface GenAuthSdkInvitationUserDto {
  /** 名单 ID */
  "rosterId": string;
  /** 受邀人 ID */
  "inviteeId": string;
  /** 受邀人名称 */
  "name": string;
  /** 受邀人手机号国际区码 */
  "phoneCountryCode"?: undefined | string;
  /** 受邀人手机号 */
  "phone"?: undefined | string;
  /** 受邀人邮箱，不区分大小写 */
  "email": string;
  /** 受邀人状态 */
  "status": "invited" | "registering" | "registered" | "reverted" | "notInvited" | "expired" | "invitationSendFail" | "joinedByOther";
  /** 受邀人来源 */
  "source": "manualCreate" | "fileImport";
  /** 创建者 ID */
  "creatorId": string;
  /** 创建者详情 */
  "creatorDetail"?: undefined | GenAuthSdkCommonUserDto;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkPolicyCondition {
  /** Condition Param */
  "param": "UserPoolId" | "AppId" | "RequestFrom" | "UserId" | "UserArn" | "CurrentTime" | "EpochTime" | "SourceIp" | "User" | "MultiFactorAuthPresent" | "MultiFactorAuthAge" | "UserAgent" | "Referer" | "Device" | "OS" | "Country" | "Province" | "City" | "DeviceChanged" | "DeviceUntrusted" | "ProxyUntrusted" | "LoggedInApps" | "Namespace";
  /** Condition Operator */
  "operator": "Bool" | "DateEquals" | "DateNotEquals" | "DateLessThan" | "DateLessThanEquals" | "DateGreaterThan" | "DateGreaterThanEquals" | "IpAddress" | "NotIpAddress" | "NumericEquals" | "NumericNotEquals" | "NumericLessThan" | "NumericLessThanEquals" | "NumericGreaterThan" | "NumericGreaterThanEquals" | "StringEquals" | "StringNotEquals" | "StringEqualsIgnoreCase" | "StringNotEqualsIgnoreCase" | "StringLike" | "StringNotLike" | "ListContains";
  /** Condition Value */
  "value": string;
}

export interface GenAuthSdkTargetDto {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` */
  "targetIdentifier": string;
}

export interface GenAuthSdkRoleCodeDto {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组的 code */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkRoleAuthorizedResourcesRespDto {
  /** 资源描述符 */
  "resourceCode": string;
  /** 资源类型 */
  "resourceType": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 被授权的操作列表 */
  "actions": (string)[];
  /** 资源对应的 API Identifier */
  "apiIdentifier": string;
}

export interface GenAuthSdkRoleDepartmentRespDto {
  /** 部门 ID */
  "id": string;
  /** 部门 code */
  "code": string;
  /** 部门名称 */
  "name": string;
  /** 部门描述信息 */
  "description": string;
}

export interface GenAuthSdkRoleListItem {
  /** 权限分组内角色的唯一标识符 */
  "code": string;
  /** 权限分组内角色名称 */
  "name"?: undefined | string;
  /** 角色描述 */
  "description"?: undefined | string;
  /** 所属权限分组(权限空间)的 code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
}

export interface GenAuthSdkRoleCodeAndNamespaceDto {
  /** 权限分组（权限空间）内角色的唯一标识符 */
  "code": string;
  /** 所属权限分组(权限空间)的 code */
  "namespace": string;
}

export interface GenAuthSdkRolePermissionListDto {
  /** 角色 ID */
  "roleId": string;
  /** 主体状态，DISABLE-未加入角色，ENABLE-已经加入了角色 */
  "status": string;
  /** 主体加入时间毫秒值 */
  "enableTime"?: undefined | number;
  /** 主体失效时间毫秒值，为 null 表示用不失效 */
  "endTime"?: undefined | number;
  /** 所属用户池 ID */
  "userPoolId": string;
  /** 角色名称，最多 50 字符 */
  "roleName": string;
  /** 角色 code,只能使用字母、数字和 -_，最多 50 字符 */
  "roleCode": string;
  /** 角色描述信息,最多两百字符 */
  "description"?: undefined | string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkCustomFieldI18n {
  /** 支持多语言的字段 */
  "label": GenAuthSdkLangObject;
}

export interface GenAuthSdkCustomFieldSelectOption {
  /** 枚举值 value */
  "value": string;
  /** 枚举值 label */
  "label": string;
}

export interface GenAuthSdkSetUserBaseFieldDto {
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
  /** 显示名称 */
  "label"?: undefined | string;
  /** 详细描述信息 */
  "description"?: undefined | string;
  /** 用户是否可编辑 */
  "userEditable"?: undefined | false | true;
  /** 是否需要在 Authing 控制台中进行显示： - 如果是用户自定义字段，控制是否在用户详情展示； - 如果是部门自定义字段，控制是否在部门详情中展示； - 如果是角色扩展字段，控制是否在角色详情中展示。 */
  "visibleInAdminConsole"?: undefined | false | true;
  /** 是否在用户个人中心展示（此参数不控制 API 接口是否返回）。 */
  "visibleInUserCenter"?: undefined | false | true;
  /** 多语言显示名称 */
  "i18n"?: undefined | GenAuthSdkCustomFieldI18n;
}

export interface GenAuthSdkSetCustomFieldDto {
  /** 主体类型，目前支持用户、角色、分组和部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
  /** 数据类型，**设置之后将不能进行修改**。 - `STRING`: 字符串类型 - `NUMBER`: 数字类型 - `DATETIME`: 日期类型 - `BOOLEAN`: 布尔类型 - `ENUM`: 枚举值类型 */
  "dataType"?: undefined | "STRING" | "NUMBER" | "DATETIME" | "BOOLEAN" | "ENUM";
  /** 显示名称 */
  "label"?: undefined | string;
  /** 详细描述信息 */
  "description"?: undefined | string;
  /** 是否加密存储。开启后，该字段的**新增数据**将被加密，此参数一旦设置不可更改。 */
  "encrypted"?: undefined | false | true;
  /** 是否为唯一字段，开启之后，当前字段上报的值将进行唯一校验。此参数只针对 */
  "isUnique"?: undefined | false | true;
  /** 用户是否可编辑 */
  "userEditable"?: undefined | false | true;
  /** 是否需要在 Authing 控制台中进行显示： - 如果是用户自定义字段，控制是否在用户详情展示； - 如果是部门自定义字段，控制是否在部门详情中展示； - 如果是角色扩展字段，控制是否在角色详情中展示。 */
  "visibleInAdminConsole"?: undefined | false | true;
  /** 是否在用户个人中心展示（此参数不控制 API 接口是否返回）。 */
  "visibleInUserCenter"?: undefined | false | true;
  /** 校验规则 */
  "validateRules"?: unknown;
  /** App Id 列表 */
  "appIds"?: undefined | (string)[];
  /** 脱敏 */
  "desensitization"?: undefined | false | true;
  /** 枚举值类型选择项 */
  "options"?: undefined | (GenAuthSdkCustomFieldSelectOption)[];
  /** 多语言显示名称 */
  "i18n"?: undefined | GenAuthSdkCustomFieldI18n;
}

export interface GenAuthSdkDeleteCustomFieldDto {
  /** 主体类型，目前支持用户、角色、分组和部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 字段 key，不能和内置字段的 key 冲突，**设置之后将不能进行修改**。 */
  "key": string;
}

export interface GenAuthSdkSetCustomDataDto {
  /** 租户 ID */
  "tenantId"?: undefined | string;
  /** 字段 key，不能和内置字段的 key 冲突 */
  "key": string;
  /** 自定义数据，可以为任意类型，但是必须和创建时定义的自定义字段类型匹配，否则将设置失败 */
  "value": string;
}

export interface GenAuthSdkResourceAction {
  /** 资源操作名称 */
  "name": string;
  /** 资源操作描述 */
  "description": string;
}

export interface GenAuthSdkCreateResourceBatchItemDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源描述 */
  "description"?: undefined | string;
  /** 资源名称 */
  "name"?: undefined | string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源定义的操作类型 */
  "actions"?: undefined | (GenAuthSdkResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: undefined | string;
}

export interface GenAuthSdkCommonResourceDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源描述 */
  "description"?: undefined | string;
  /** 资源名称 */
  "name"?: undefined | string;
  /** 资源类型，如数据、API、按钮、菜单 */
  "type": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
  /** 资源定义的操作类型 */
  "actions"?: undefined | (GenAuthSdkResourceAction)[];
  /** API 资源的 URL 标识 */
  "apiIdentifier"?: undefined | string;
  /** 所属权限分组(权限空间)的 Code，不传获取默认权限分组。 */
  "namespace"?: undefined | string;
  /** 租户应用是否关联自建应用资源 */
  "linkedToTenant"?: undefined | false | true;
  /** 资源id */
  "id": string;
  /** 权限应用id */
  "namespaceId": number;
  /** 权限应用名称 */
  "namespaceName": string;
  /** UserPool ID */
  "userPoolId": string;
  /** 创建时间 */
  "createdAt": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkCreateNamespacesBatchItemDto {
  /** 权限分组唯一标志符 */
  "code": string;
  /** 权限分组名称 */
  "name"?: undefined | string;
  /** 权限分组描述信息 */
  "description"?: undefined | string;
}

export interface GenAuthSdkNamespacesListRespDto {
  /** 权限分组 名称 */
  "name": string;
  /** 权限分组 Code */
  "code": string;
  /** 权限分组描述信息 */
  "description"?: undefined | string;
  /** 权限分组状态：0 -> 关闭、1 -> 开启 */
  "status"?: undefined | number;
}

export interface GenAuthSdkAuthorizeResourceItem {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` */
  "targetIdentifiers": (string)[];
  /** 授权的资源列表 */
  "resources": (GenAuthSdkResourceItemDto)[];
}

export interface GenAuthSdkResourceAuthorizedTargetDto {
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 主体唯一标志符 */
  "targetIdentifier": string;
  /** 操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkListWebhooksDto {
  /** 当前页数，从 1 开始 */
  "page"?: unknown;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: unknown;
}

export interface GenAuthSdkUserActionLogDto {
  /** 用户 ID */
  "userId": string;
  /** 用户头像 */
  "userAvatar": string;
  /** 用户显示名称，按照以下用户字段顺序进行展示：nickname > username > name > givenName > familyName -> email -> phone -> id */
  "userDisplayName": string;
  /** 用户登录次数 */
  "userLoginsCount": number;
  /** 应用 ID */
  "appId": string;
  /** 应用名称 */
  "appName": string;
  /** 客户端 IP，可根据登录时的客户端 IP 进行筛选。默认不传获取所有登录 IP 的登录历史。 */
  "clientIp"?: undefined | string;
  /** 事件类型： - `login`: 登录 - `logout`: 登出 - `register`: 注册 - `verifyMfa`: 验证 MFA - `updateUserProfile`: 修改用户信息 - `updateUserPassword`: 修改密码 - `updateUserEmail`: 修改邮箱 - `updateUserPhone`: 修改手机号 - `bindMfa`: 绑定 MFA - `bindEmail`: 绑定邮箱 - `bindPhone`: 绑定手机号 - `unbindPhone`: 解绑手机号 - `unbindEmail`: 解绑邮箱 - `unbindMFA`: 解绑 MFA - `deleteAccount`: 注销账号 - `verifyFirstLogin`: 首次登录验证 */
  "eventType": "login" | "logout" | "register" | "verifyMfa" | "updateUserPrefile" | "updateUserPassword" | "updateUserEmail" | "updateUserPhone" | "bindMfa" | "bindEmail" | "bindPhone" | "unbindPhone" | "unbindEmail" | "unbindMFA" | "refreshUserTokenBySelf" | "deleteAccount" | "verifyFirstLogin" | "securityResourceAccess";
  /** 事件详情 */
  "eventDetail"?: undefined | string;
  /** 是否成功 */
  "success": boolean;
  /** 应用登录地址 */
  "appLoginUrl": string;
  /** 应用 Logo */
  "appLogo": string;
  /** User Agent */
  "userAgent": string;
  /** 解析过后的 User Agent */
  "parsedUserAgent": GenAuthSdkParsedUserAgent;
  /** 地理位置 */
  "geoip": GenAuthSdkGeoIp;
  /** 时间 */
  "timestamp": string;
  /** 请求 ID */
  "requestId": string;
}

export interface GenAuthSdkAdminAuditLogDto {
  /** 管理员的用户 ID */
  "adminUserId": string;
  /** 管理员用户头像 */
  "adminUserAvatar": string;
  /** 管理员用户显示名称，按照以下用户字段顺序进行展示：nickname > username > name > givenName > familyName -> email -> phone -> id */
  "adminUserDisplayName": string;
  /** 客户端 IP，可根据登录时的客户端 IP 进行筛选。默认不传获取所有登录 IP 的登录历史。 */
  "clientIp"?: undefined | string;
  /** 操作类型： - `create`: 创建 - `delete`: 删除 - `import`: 导入 - `export`: 导出 - `update`: 修改 - `refresh`: 刷新 - `sync`: 同步 - `invite`: 邀请 - `resign`: 离职 - `recover`: 恢复 - `disable`: 禁用 - `userEnable`: 启用 */
  "operationType": "all" | "create" | "delete" | "import" | "export" | "update" | "refresh" | "sync" | "invite" | "resign" | "recover" | "disable" | "enable" | "activate" | "deactivate" | "add" | "remove" | "query" | "sendInvitation" | "revertInvitation" | "approval" | "reject";
  /** 事件类型： - `user`: 用户 - `userpool`: 用户池 - `tenant`: 租户 - `userLoginState`: 用户登录态 - `userAccountState`: 用户账号状态 - `userGroup`: 用户分组 - `fieldEncryptState`: 字段加密状态 - `syncTask`: 同步任务 - `socialConnection`: 社会化身份源 - `enterpriseConnection`: 社会化身份源 - `customDatabase`: 自定义数据库 - `org`: 组织机构 - `cooperator`: 协作管理员 - `application`: 应用 - `resourceNamespace`: 权限分组 - `resource`: 资源 - `role`: 角色 - `roleAssign`: 角色授权 - `policy`: 策略 */
  "resourceType": "all" | "user" | "userpool" | "tenant" | "userLoginState" | "userAccountState" | "userGroup" | "fieldEncryptState" | "syncTask" | "socialConnection" | "enterpriseConnection" | "customDatabase" | "org" | "cooperator" | "application" | "resourceNamespace" | "resource" | "role" | "roleAssign" | "policy" | "customDomain" | "permitSpace" | "generalResource" | "generalResourceAuthorization" | "roleSubject" | "subjectOfRole" | "dataResource" | "dataPolicy" | "authorization" | "userAuthorization" | "adminPermissionRole" | "adminPermissionAdmin" | "adminPermissionPolicy" | "universalInvitation" | "policyInvitation" | "invitationRoster" | "invitationUser" | "invitationPolicy" | "applicant";
  /** 事件详情 */
  "eventDetails"?: undefined | string;
  /** 具体的操作参数 */
  "operationParam"?: undefined | string;
  /** 原始值 */
  "originValue"?: undefined | string;
  /** 新值 */
  "targetValue"?: undefined | string;
  /** 是否成功 */
  "success": boolean;
  /** User Agent */
  "userAgent": string;
  /** 解析过后的 User Agent */
  "ua": GenAuthSdkParsedUserAgent;
  /** 地理位置 */
  "geoip": GenAuthSdkGeoIp;
  /** 时间 */
  "timestamp": string;
  /** 请求 ID */
  "requestId": string;
}

export interface GenAuthSdkEmailTemplateCategoryDto {
  /** 类别名称 */
  "title": string;
  /** 类别英文名称 */
  "titleEn": string;
  /** 描述 */
  "desc": string;
  /** 英文描述 */
  "descEn": string;
}

export interface GenAuthSdkSMTPEmailProviderConfig {
  /** SMTP 地址 */
  "smtp_host": string;
  /** SMTP 端口 */
  "smtp_port": number;
  /** 用户名 */
  "sender": string;
  /** 密码 */
  "senderPass": string;
  /** 是否启用 SSL */
  "secure": boolean;
}

export interface GenAuthSdkSendGridEmailProviderConfig {
  /** 用户名 */
  "sender": string;
  /** SendGrid API Key，详情请见 [SendGrid 文档](https://docs.sendgrid.com/ui/account-and-settings/api-keys)。 */
  "apikey": string;
}

export interface GenAuthSdkAliExmailEmailProviderConfig {
  /** 用户名 */
  "sender": string;
  /** 密码 */
  "senderPass": string;
}

export interface GenAuthSdkTencentExmailEmailProviderConfig {
  /** 用户名 */
  "sender": string;
  /** 密码 */
  "senderPass": string;
}

export interface GenAuthSdkSMTPEmailProviderConfigInput {
  /** SMTP 地址 */
  "smtp_host": string;
  /** SMTP 端口 */
  "smtp_port": number;
  /** 用户名 */
  "sender"?: undefined | string;
  /** 密码 */
  "senderPass": string;
  /** 是否启用 SSL */
  "secure"?: undefined | false | true;
}

export interface GenAuthSdkSendGridEmailProviderConfigInput {
  /** 用户名 */
  "sender": string;
  /** SendGrid API Key，详情请见 [SendGrid 文档](https://docs.sendgrid.com/ui/account-and-settings/api-keys)。 */
  "apikey": string;
}

export interface GenAuthSdkAliExmailEmailProviderConfigInput {
  /** 用户名 */
  "sender": string;
  /** 密码 */
  "senderPass": string;
}

export interface GenAuthSdkTencentExmailEmailProviderConfigInput {
  /** 用户名 */
  "sender": string;
  /** 密码 */
  "senderPass": string;
}

export interface GenAuthSdkApplicationLoginConfigDto {
  /** 是否开启登录注册合并 */
  "mergeLoginAndRegisterPage": boolean;
  /** 开启的基础登录方式 */
  "enabledBasicLoginMethods": ("PHONE_CODE" | "EMAIL_CODE" | "PHONE_PASSWORD" | "EMAIL_PASSWORD" | "USERNAME_PASSWORD" | "SELF_BUILT_APP_QRCODE")[];
  /** 应用默认登录方式（不包含社会化登录和企业身份源登录） */
  "defaultLoginMethod": GenAuthSdkApplicationDefaultLoginMethod;
  /** 开启的外部身份源连接 */
  "enabledExtIdpConns": (GenAuthSdkApplicationEnabledExtIdpConnDto)[];
  /** 是否展示用户授权页面 */
  "showAuthorizationPage": boolean;
}

export interface GenAuthSdkApplicationRegisterConfig {
  /** 开启的注册方式 */
  "enabledBasicRegisterMethods": ("PHONE_CODE" | "EMAIL_CODE" | "EMAIL_PASSWORD")[];
  /** 默认的注册类型 - `PASSWORD`: 密码类型，支持邮箱 + 密码进行登录 - `PASSCODE`: 验证码类型，取决于你开启的注册方式，支持手机号/邮箱 + 验证码进行登录 */
  "defaultRegisterMethod": "PASSCODE" | "PASSWORD";
}

export interface GenAuthSdkApplicationBrandingConfig {
  /** 是否开启自定义 CSS */
  "customCSSEnabled": boolean;
  /** 自定义 CSS 内容 */
  "customCSS"?: undefined | string;
  /** Guard 版本： - `Advanced`: 高级版 - `Classical`: 经典版 */
  "guardVersion": "Advanced" | "Classical";
  /** 自定义加载图标，当登录框加载时会展示 */
  "customLoadingImage"?: undefined | string;
  /** 自定义登录页背景，示例： - 图片背景：`url(https://files.authing.co/user-contents/photos/6c6b3726-4a04-4ba7-b686-1a275f81a47a.png) center/cover` - 纯色背景：`rgba(37,49,122,1)` */
  "customBackground"?: undefined | string;
  /** 是否显示切换语言按钮 */
  "showChangeLanguageButton": boolean;
  /** 默认语言: - `zh-CN`: 简体中文 - `zh-TW`: 繁体中文 - `en-US`: 英文 - `ja-JP`: 日语 */
  "defaultLanguage": "zh-CN" | "en-US" | "zh-TW" | "ja-JP";
  /** 是否显示忘记密码按钮 */
  "showForgetPasswordButton": boolean;
  /** 是否显示企业身份源登录方式 */
  "showEnterpriseConnections": boolean;
  /** 是否显示社会化登录方式 */
  "showSocialConnections": boolean;
  /** 是否展示登录注册协议 */
  "showAgreement": boolean;
  /** 展示的登录注册协议列表 */
  "agreements": (GenAuthSdkApplicationAgreementDto)[];
}

export interface GenAuthSdkListApplicationSubjectDataDto {
  /** 应用 ID */
  "appId": string;
  /** 应用 logo */
  "logo": string;
  "ext": string;
  "template": string;
  /** 应用类型：集成应用/自建应用 */
  "appType": "INTEGRATED" | "SELFBUILT" | "APP_PANEL";
  /** 允许/拒绝 */
  "effect": "ALLOW" | "DENY";
}

export interface GenAuthSdkListApplicationAuthDataDto {
  /** 授权 id */
  "id": string;
  /** 主体 id */
  "targetId": string;
  /** 主体名称 */
  "targetName": string;
  /** 主体类型，USER/ORG/GROUP/ROLE */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG" | "AK_SK";
  /** 主体类型，ALLOW/DENY */
  "effect": "ALLOW" | "DENY";
  /** 授权开关 */
  "enabled": boolean;
  /** 授权类型, ALL:所有人 SUBJECT:主体 */
  "permissionType": "ALL" | "SUBJECT";
}

export interface GenAuthSdkApplicationLoginConfigInputDto {
  /** 是否开启登录注册合并 */
  "mergeLoginAndRegisterPage"?: undefined | false | true;
  /** 开启的基础登录方式 */
  "enabledBasicLoginMethods"?: undefined | ("PHONE_CODE" | "EMAIL_CODE" | "PHONE_PASSWORD" | "EMAIL_PASSWORD" | "USERNAME_PASSWORD" | "SELF_BUILT_APP_QRCODE")[];
  /** 应用默认登录方式（不包含社会化登录和企业身份源登录） */
  "defaultLoginMethod"?: undefined | GenAuthSdkApplicationDefaultLoginMethodInput;
  /** 开启的外部身份源连接 */
  "enabledExtIdpConnIds"?: undefined | (GenAuthSdkApplicationEnabledExtIdpConnInputDto)[];
  /** 开启所有的外部身份源连接 */
  "enabledAllExtIdpConns"?: undefined | false | true;
  /** 是否展示用户授权页面 */
  "showAuthorizationPage": boolean;
}

export interface GenAuthSdkApplicationRegisterConfigInputDto {
  /** 开启的注册方式 */
  "enabledBasicRegisterMethods": ("PHONE_CODE" | "EMAIL_CODE" | "EMAIL_PASSWORD")[];
  /** 默认的注册类型 - `PASSWORD`: 密码类型，支持邮箱 + 密码进行登录 - `PASSCODE`: 验证码类型，取决于你开启的注册方式，支持手机号/邮箱 + 验证码进行登录 */
  "defaultRegisterMethod": "PASSCODE" | "PASSWORD";
}

export interface GenAuthSdkApplicationBrandingConfigInputDto {
  /** 是否开启自定义 CSS */
  "customCSSEnabled"?: undefined | false | true;
  /** 自定义 CSS 内容 */
  "customCSS"?: undefined | string;
  /** Guard 版本： - `Advanced`: 高级版 - `Classical`: 经典版 */
  "guardVersion"?: undefined | "Advanced" | "Classical";
  /** 自定义加载图标，当登录框加载时会展示 */
  "customLoadingImage"?: undefined | string;
  /** 自定义登录页背景，示例： - 图片背景：`url(https://files.authing.co/user-contents/photos/6c6b3726-4a04-4ba7-b686-1a275f81a47a.png) center/cover` - 纯色背景：`rgba(37,49,122,1)` */
  "customBackground"?: undefined | string;
  /** 是否显示切换语言按钮 */
  "showChangeLanguageButton"?: undefined | false | true;
  /** 展示的默认语言： - `zh-CN`: 简体中文 - `zh-TW`: 繁体中文 - `en-US`: 英文 - `ja-JP`: 日语  默认情况下，Authing 登录页会根据用户浏览器语言自动渲染。 */
  "defaultLanguage"?: undefined | "zh-CN" | "en-US" | "zh-TW" | "ja-JP";
  /** 是否显示忘记密码按钮 */
  "showForgetPasswordButton"?: undefined | false | true;
  /** 是否显示企业身份源登录方式 */
  "showEnterpriseConnections"?: undefined | false | true;
  /** 是否显示社会化登录方式 */
  "showSocialConnections"?: undefined | false | true;
}

export interface GenAuthSdkUpdateApplicationLoginConfigInputDto {
  /** 是否开启登录注册合并 */
  "mergeLoginAndRegisterPage"?: undefined | false | true;
  /** 开启的基础登录方式 */
  "enabledBasicLoginMethods"?: undefined | ("PHONE_CODE" | "EMAIL_CODE" | "PHONE_PASSWORD" | "EMAIL_PASSWORD" | "USERNAME_PASSWORD" | "SELF_BUILT_APP_QRCODE")[];
  /** 应用默认登录方式（不包含社会化登录和企业身份源登录） */
  "defaultLoginMethod"?: undefined | GenAuthSdkApplicationDefaultLoginMethodInput;
  /** 是否展示用户授权页面 */
  "showAuthorizationPage": boolean;
}

export interface GenAuthSdkListApplicationActiveUsersOptionsDto {
  /** 分页配置 */
  "pagination"?: undefined | GenAuthSdkPaginationDto;
  /** 是否获取自定义数据 */
  "withCustomData"?: undefined | false | true;
  /** 是否获取 identities */
  "withIdentities"?: undefined | false | true;
  /** 是否获取部门 ID 列表 */
  "withDepartmentIds"?: undefined | false | true;
}

export interface GenAuthSdkApplicationPermissionRecordItem {
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG";
  /** 权限分组 code，当主体类型为 "ROLE" 时必传 */
  "namespaceCode"?: undefined | string;
  /** 当主体类型为 "ORG" 时，授权是否被子节点继承 */
  "inheritByChildren"?: undefined | false | true;
  /** 主体标识列表，当主体类型为 "USER" 时，值应为用户 ID；当主体类型为 "GROUP" 时，值应为分组 code；当主体类型为 "ROLE" 时，值应为角色 code；当主体类型为 "ORG" 时，值应为组织节点 ID。最多 50 条。 */
  "targetIdentifier": (string)[];
  /** 授权作用，允许或拒绝 */
  "effect": "ALLOW" | "DENY";
}

export interface GenAuthSdkDeleteApplicationPermissionRecordItem {
  /** 主体类型 */
  "targetType": "USER" | "ROLE" | "GROUP" | "ORG";
  /** 权限分组 code，当主体类型为 "ROLE" 时必传 */
  "namespaceCode"?: undefined | string;
  /** 主体标识列表，当主体类型为 "USER" 时，值应为用户 ID；当主体类型为 "GROUP" 时，值应为分组 code；当主体类型为 "ROLE" 时，值应为角色 code；当主体类型为 "ORG" 时，值应为组织节点 ID。最多 50 条。 */
  "targetIdentifier": (string)[];
}

export interface GenAuthSdkTenantApplicationDto {
  /** UserPool ID */
  "userPoolId": string;
  /** App ID */
  "tenantAppId": string;
  /** App 名称 */
  "name": string;
  /** 应用描述信息 */
  "description"?: undefined | string;
  /** App Logo */
  "logo": string;
  /** 应用类型 */
  "applicationType": string;
  /** 是否开启 SSO 单点登录 */
  "ssoEnabled": boolean;
  /** App ID */
  "appId": string;
}

export interface GenAuthSdkUpdateLoginConfig {
  "tabMethodsSortConfig": Record<string, unknown>;
  "qrCodeSortConfig": Record<string, unknown>;
  "ssoPageCustomizationSettings": Record<string, unknown>;
  "passwordTabConfig": Record<string, unknown>;
  "verifyCodeTabConfig": Record<string, unknown>;
  "config": GenAuthSdkLanguageCoinfigDto;
  /** 是否允许创建租户 */
  "enableCreateTenant": boolean;
  /** 允许创建租户的场景 */
  "createTenantScenes": (string)[];
  /** 是否允许加入租户 */
  "enableJoinTenant": boolean;
  /** 允许创建加入的场景 */
  "joinTenantScenes": (string)[];
  /** 是否校验企业域名 */
  "enableVerifyDomain": boolean;
  /** 是否自动关联租户应用 */
  "enableAutoConnectTenantApp": boolean;
  /** 校验企业域名的场景 */
  "verifyDomainScenes": (string)[];
}

export interface GenAuthSdkCreateAsaAccountsBatchItemDto {
  /** 账号信息，一般为包含 "account", "password" key 的键值对 */
  "accountInfo": unknown;
}

export interface GenAuthSdkAssignAsaAccountItem {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` */
  "targetIdentifiers": (string)[];
}

export interface GenAuthSdkAsaAccountTargetDto {
  /** 目标对象类型： - `USER`: 用户 - `ROLE`: 角色 - `GROUP`: 分组 - `DEPARTMENT`: 部门 */
  "targetType": "USER" | "ROLE" | "GROUP" | "DEPARTMENT";
  /** 目标对象的唯一标志符： - 如果是用户，为用户的 ID，如 `6343b98b7cfxxx9366e9b7c` - 如果是角色，为角色的 code，如 `admin` - 如果是分组，为分组的 code，如 `developer` - 如果是部门，为部门的 ID，如 `6343bafc019xxxx889206c4c` */
  "targetIdentifier": string;
}

export interface GenAuthSdkChangeEmailStrategyDto {
  /** 修改邮箱时是否验证旧邮箱 */
  "verifyOldEmail": boolean;
}

export interface GenAuthSdkChangePhoneStrategyDto {
  /** 修改手机号时是否验证旧手机号 */
  "verifyOldPhone": boolean;
}

export interface GenAuthSdkCookieSettingsDto {
  /** Cookie 有效时间：用户登录状态的有效时间（默认为 1209600 秒/ 14 天），过期后用户需要重新登录。对于应用面板及已加入应用面板的应用，将使用此 cookie  过期时间。 */
  "cookieExpiresIn": number;
  /** Cookie 过期时间基于浏览器会话：当前浏览器关闭后立即过期，下次打开需重新登录。 */
  "cookieExpiresOnBrowserSession": boolean;
}

export interface GenAuthSdkRegisterAnomalyDetectionConfigDto {
  /** 是否开启频繁注册限制 */
  "enabled": boolean;
  /** 在一定时间周期内，对于同一个 IP，最多只能注册多少次。 */
  "limit": number;
  /** 限定周期时间长度，单位为秒。 */
  "timeInterval": number;
}

export interface GenAuthSdkLoginAnomalyDetectionConfigDto {
  /** 登录安全策略。当用户触发登录失败频率检测时，采用什么策略。目前支持验证码和锁定账号两种策略。当选择账号锁定策略的时候，只可以开启「登录密码错误限制」。此字段标志为过时，但是此字段还是必传的，如果使用新版本逻辑可以默认写一个。新版本账号锁定使用 accountLock，验证码使用 robotVerify */
  "loginFailStrategy": "captcha" | "block-account";
  /** 人机验证（验证码）策略。可选值，disable（不开启）/condition_set（条件开启）/always_enable （始终开启） */
  "robotVerify": string;
  /** 账号锁定策略。可选值，disable（不开启）/condition_set（条件开启） */
  "accountLock": string;
  /** 登录失败次数限制：当用户登录输入信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。 */
  "loginFailCheck": GenAuthSdkLoginFailCheckConfigDto;
  /** 登录密码错误限制：当用户登录输入密码信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。此字段被标志为过时，见 accountLockLoginPasswordFailCheck/ robotVerifyLoginPasswordFailCheck */
  "loginPasswordFailCheck": GenAuthSdkLoginPassowrdFailCheckConfigDto;
  /** 账号锁定-登录密码错误限制：当用户登录输入密码信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。 */
  "accountLockLoginPasswordFailCheck"?: undefined | GenAuthSdkLoginPassowrdFailCheckConfigDto;
  /** 人机验证（验证码）-登录密码错误限制：当用户登录输入密码信息错误的时候会被按照「登录安全策略」规则触发相对应的策略。 */
  "robotVerifyLoginPasswordFailCheck": GenAuthSdkLoginPassowrdFailCheckConfigDto;
  /** 人机验证（验证码）- ip 白名单：当登录者 ip 不在白名单会触发人机验证。 */
  "robotVerifyLoginIpWhitelistCheck": GenAuthSdkLoginIpWhitelistCheckConfigDto;
  /** 是否开启登录时间限制 */
  "robotVerifyLoginTimeCheckEnable": boolean;
  /** 登录时间限制周几+起始时间数组 */
  "robotVerifyloginWeekStartEndTime": (string)[];
}

export interface GenAuthSdkSelfUnlockAccountConfigDto {
  /** 是否允许用户自助解锁账号。 */
  "enabled": boolean;
  /** 自助解锁方式，目前支持原密码 + 验证码和验证码两种方式。 */
  "strategy": "captcha" | "password-captcha";
}

export interface GenAuthSdkQrcodeLoginStrategyDto {
  /** 二维码有效时间，单位秒 */
  "qrcodeExpiresIn": number;
  /** 时间长度单位，Second/Minute/Hour/Day，仅做显示用 */
  "qrcodeExpiresInUnit"?: undefined | string;
  /** ticket 有效时间，单位秒 */
  "ticketExpiresIn": number;
  /** 时间长度单位，Second/Minute/Hour/Day，仅作显示用 */
  "ticketExpiresInUnit"?: undefined | string;
  /** Web 轮询接口返回完整用户信息，详情见此文档：Web 轮询接口返回完整用户信息 */
  "allowExchangeUserInfoFromBrowser": boolean;
  /** 允许在浏览器使用 ticket 换取用户信息，详情见此文档：Web 轮询接口返回完整用户信息 */
  "returnFullUserInfo": boolean;
}

export interface GenAuthSdkSendTenantEmailDto {
  /** 管理员名字 */
  "adminName": string;
  /** 用户名 */
  "userName": string;
  /** 管理员邮箱 */
  "email": string;
  /** 租户域名 */
  "identifier": string;
  /** 租户 id */
  "tenantId": string;
  /** 租户名 */
  "tenantName": string;
}

export interface GenAuthSdkSendTenantSmsDto {
  /** 管理员名字 */
  "adminName": string;
  /** 用户名 */
  "userName": string;
  /** 用户唯一标识 */
  "identifier": string;
  /** 管理员手机 */
  "phone": string;
  /** 管理员手机地区号 */
  "phoneCountryCode": string;
  /** 租户 id */
  "tenantId": string;
  /** 租户名 */
  "tenantName": string;
}

export interface GenAuthSdkerrorEmailMsg {
  /** 邮箱地址 */
  "email": string;
  /** 错误信息描述 */
  "message": string;
}

export interface GenAuthSdkInviteTenantUserRecord {
  /** 邀请记录编号 */
  "recordId": number;
  /** 邀请账号 */
  "inviteAccount": string;
  /** 账号激活状态 */
  "verifiedStatus": string;
  /** 邀请链接 */
  "inviteLink": string;
  /** 创建时间 */
  "createdAt": string;
  /** 账号激活时间 */
  "activatedAt": string;
}

export interface GenAuthSdkMultipleTenantAdminDto {
  /** 用户唯一 ID */
  "userId": string;
  /** 用户名称 */
  "name": string;
  /** 用户手机号 */
  "phone": string;
  /** 用户邮箱 */
  "email": string;
  /** 授权 API */
  "apiAuthorized"?: undefined | false | true;
  /** 最后登录时间 */
  "lastLogin": string;
}

export interface GenAuthSdkTenantCooperatorDto {
  /** 用户唯一 ID */
  "userId": string;
  /** 类型 */
  "type": string;
  /** 是否external */
  "external": boolean;
  /** 用户 */
  "user": GenAuthSdkUserDto;
  /** 租户用户 */
  "tenantUser"?: undefined | GenAuthSdkTenantUserDto;
}

export interface GenAuthSdkCreateTenantUserOptionsDto {
  /** 该参数一般在迁移旧有用户数据到 Authing 的时候会设置。开启这个开关，password 字段会直接写入 Authing 数据库，Authing 不会再次加密此字段。如果你的密码不是明文存储，你应该保持开启，并编写密码函数计算。 */
  "keepPassword"?: undefined | false | true;
  /** 是否自动生成密码 */
  "autoGeneratePassword"?: undefined | false | true;
  /** 是否强制要求用户在第一次的时候重置密码 */
  "resetPasswordOnFirstLogin"?: undefined | false | true;
  /** 密码加密类型，支持使用 RSA256 和国密 SM2 算法进行加密。默认为 `none` 不加密。 - `none`: 不对密码进行加密，使用明文进行传输。 - `rsa`: 使用 RSA256 算法对密码进行加密，需要使用 Authing 服务的 RSA 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 RSA256 公钥。 - `sm2`: 使用 [国密 SM2 算法](https://baike.baidu.com/item/SM2/15081831) 对密码进行加密，需要使用 Authing 服务的 SM2 公钥进行加密，请阅读**介绍**部分了解如何获取 Authing 服务的 SM2 公钥。 */
  "passwordEncryptType"?: undefined | "sm2" | "rsa" | "none";
}

export interface GenAuthSdkListTenantUsersOptionsDto {
  /** 分页配置 */
  "pagination"?: undefined | GenAuthSdkPaginationDto;
}

export interface GenAuthSdkCreatePermissionNamespacesBatchItemDto {
  /** 权限空间 Code */
  "code": string;
  /** 权限空间名称 */
  "name": string;
  /** 权限空间描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkPermissionNamespacesListRespDto {
  /** 权限空间 名称 */
  "name": string;
  /** 权限空间 Code */
  "code": string;
  /** 权限空间描述信息 */
  "description"?: undefined | string;
  /** 权限空间状态：0 -> 关闭、1 -> 开启 */
  "status"?: undefined | number;
}

export interface GenAuthSdkPermissionNamespaceRolesListRespDto {
  /** 角色名称 */
  "name": string;
  /** 角色 Code */
  "code": string;
  /** 角色 描述信息 */
  "description"?: undefined | string;
  /** 权限空间 Code */
  "namespace": string;
  /** 更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkDataResourceTreeStructs {
  /** 数据资源节点 Code, 同层级唯一 */
  "code": string;
  /** 数据资源节点名称 ，同层级唯一 */
  "name": string;
  /** 数据资源节点 Value */
  "value"?: undefined | string;
  /** 数据资源节点的子节点,子节点层级最多支持五个层级 */
  "children"?: undefined | (unknown)[];
  /** 扩展字段值, 以 key:value 形式存储 */
  "extendFieldValue"?: unknown;
}

export interface GenAuthSdkExtendField {
  /** 字段唯一标识，长度为 1-64 位，只允许包含英文字母、数字、下划线 _、金钱符 $ */
  "key": string;
  /** 字段值类型 */
  "valueType": "STRING" | "SELECT";
  /** 描述 */
  "description"?: undefined | string;
  /** 展示名称 */
  "label": string;
  /** 字段配置，当 valueType=SELECT 时，此参数必传，否则可不传 */
  "config"?: undefined | GenAuthSdkConfig;
}

export interface GenAuthSdkListDataResourcesRespDto {
  /** 数据资源名称, 权限空间内唯一 */
  "resourceName": string;
  /** 数据资源 Code, 权限空间内唯一 */
  "resourceCode": string;
  /** 数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY） */
  "type": "TREE" | "STRING" | "ARRAY";
  /** 数据资源描述 */
  "description"?: undefined | string;
  /** 数据资源所属的权限空间 Code */
  "namespaceCode": string;
  /** 数据资源所属的权限空间名称 */
  "namespaceName": string;
  /** 数据资源关联授权的数量 */
  "authorizationNum": number;
  /** 数据资源更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkConfig {
  /** 选项列表 */
  "options": (GenAuthSdkOption)[];
}

export interface GenAuthSdkDataStatementPermissionDto {
  /** 数据资源权限操作：ALLOW（允许）/DENY（拒绝） */
  "effect": "DENY" | "ALLOW";
  /** 资源权限列表，字符串数据资源和数组数据资源，没有 path 路径 */
  "permissions": (string)[];
}

export interface GenAuthSdkListDataPoliciesRespDto {
  /** 数据策略名称，用户池唯一 */
  "policyName": string;
  /** 数据策略描述 */
  "description"?: undefined | string;
  /** 数据权限列表，每个策略下所有的数据资源 ID 和名称 */
  "resourceList": (GenAuthSdkDataResourceSimpleRespDto)[];
  /** 数据策略 ID */
  "policyId": string;
  /** 主体对象列表,包含数据策略下所有的主体对象,包括 USER、GROUP、ROLE、ORG */
  "targetList": (GenAuthSdkSubjectRespDto)[];
  /** 数据策略更新时间 */
  "updatedAt": string;
}

export interface GenAuthSdkListSimpleDataPoliciesRespDto {
  /** 数据策略 ID */
  "policyId": string;
  /** 数据策略名称，用户池唯一 */
  "policyName": string;
  /** 数据策略描述 */
  "description"?: undefined | string;
}

export interface GenAuthSdkDataSubjectRespDto {
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID */
  "targetIdentifier": string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 */
  "targetType": "USER" | "ORG" | "GROUP" | "ROLE";
  /** 主体名称，包含用户名称、用户组名称、角色名称、组织机构名称 */
  "targetName": string;
  /** 主体对象被授权时间 */
  "authorizationTime": string;
}

export interface GenAuthSdkSubjectDto {
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID */
  "id": string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 */
  "type": "USER" | "ORG" | "GROUP" | "ROLE";
  /** 主体名称，包含用户名称、用户组名称、角色名称、组织机构名称 */
  "name"?: undefined | string;
}

export interface GenAuthSdkUserPermissionListDto {
  /** 数据策略授权的用户 ID */
  "userId": string;
  /** 数据策略授权的权限空间 Code */
  "namespaceCode": string;
  /** 用户在权限空间下所有的数据策略资源列表 */
  "resourceList"?: undefined | (GenAuthSdkOpenResource)[];
}

export interface GenAuthSdkAuthEnvParams {
  /** ip */
  "ip"?: undefined | string;
  /** 城市 */
  "city"?: undefined | string;
  /** 省份 */
  "province"?: undefined | string;
  /** 国家 */
  "country"?: undefined | string;
  /** 设备类型：PC/Mobile */
  "deviceType"?: undefined | "PC" | "Mobile";
  /** 操作类型：Windows、Android、iOS、MacOS */
  "systemType"?: undefined | "Windows" | "MacOS" | "Android" | "iOS";
  /** 浏览器类型：IE/Chrome/Firefox */
  "browserType"?: undefined | "IE" | "Chrome" | "Firefox" | "Safari" | "Edge" | "Opera" | "Safe360" | "QQBrowser";
  /** 请求时间 */
  "requestDate"?: undefined | string;
}

export interface GenAuthSdkCheckPermissionsRespDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源权限操作 */
  "action": string;
  /** 资源路径 */
  "resource": string;
  /** 用户在某个权限空间下是否具有该数据资源的某个操作 */
  "enabled": boolean;
}

export interface GenAuthSdkCheckExternalUserPermissionsRespDto {
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 数据资源权限操作 */
  "action": string;
  /** 资源路径 */
  "resource": string;
  /** 用户在某个权限空间下是否具有该数据资源的某个操作 */
  "enabled": boolean;
}

export interface GenAuthSdkGetUserResourcePermissionList {
  /** 权限空间 code */
  "namespaceCode": string;
  /** 数据资源权限操作列表 */
  "actions": (string)[];
  /** 资源路径 */
  "resource": string;
}

export interface GenAuthSdkListResourceTargetsDtoResp {
  /** 资源路径 */
  "resource": string;
  /** 数据资源权限操作列表 */
  "actionAuthList": (GenAuthSdkActionAuth)[];
}

export interface GenAuthSdkStrResourceAuthAction {
  /** 字符串数据资源的 Value */
  "value"?: undefined | string;
  /** 字符串数据资源的 actions */
  "actions"?: undefined | (string)[];
}

export interface GenAuthSdkArrResourceAuthAction {
  /** 数组数据资源的 values */
  "values"?: undefined | (string)[];
  /** 数组数据资源的 actions */
  "actions"?: undefined | (string)[];
}

export interface GenAuthSdkTreeResourceAuthAction {
  /** 树结构节点列表 */
  "nodeAuthActionList"?: undefined | (GenAuthSdkTreeStructs)[];
}

export interface GenAuthSdkCheckUserSameLevelPermissionRespDto {
  /** 数据资源权限操作 */
  "action": string;
  /** 树资源节点code */
  "resourceNodeCode": string;
  /** 是否拥有 action 权限 */
  "enabled": boolean;
}

export interface GenAuthSdkListPermissionViewRespDto {
  /** 用户的唯一标志，可以是用户 ID、用户名、邮箱、手机号、externalId、在外部身份源的 ID，详情见 userIdType 字段的说明。默认为用户 id 。 */
  "userId": string;
  /** 用户真实名称，不具备唯一性 */
  "username"?: undefined | string;
  /** 权限空间 id */
  "namespaceId": string;
  /** 权限空间 Code */
  "namespaceCode": string;
  /** 权限空间名称 */
  "namespaceName": string;
  /** 数据资源 id */
  "dataResourceId": string;
  /** 数据资源 Code */
  "dataResourceCode": string;
  /** 数据资源 名称 */
  "dataResourceName": string;
  /** 数据策略列表 */
  "dataPolicyList": (GenAuthSdkPolicyBo)[];
  /** 角色列表 */
  "roleList": (GenAuthSdkRoleBo)[];
  /** 用户组列表 */
  "groupList": (GenAuthSdkGroupBo)[];
  /** 组织机构列表 */
  "nodeList": (GenAuthSdkNodeBo)[];
}

export interface GenAuthSdkGoodsPackageDto {
  /** 套餐包名称 name */
  "name": string;
  /** 套餐包名称 nameEn */
  "nameEn": string;
  /** 套餐包单价 */
  "unitPrice": string;
  /** 套餐包编码 code */
  "code": string;
  /** 套餐包版本 */
  "group": string;
  /** 套餐包场景编码 */
  "sceneCode": string;
  /** 套餐包 MAU 数量 */
  "amount": string;
}

export interface GenAuthSdkCurrentUsageDto {
  /** 权益总量 */
  "amount": string;
  /** 权益当前使用量 */
  "current": string;
  /** 是否是体验期权益 */
  "experience": boolean;
  /** 权益编码 */
  "modelCode": string;
  /** 权益名称 */
  "modelName": string;
}

export interface GenAuthSdkMauPeriodUsageHistoryDto {
  /** 周期开始时间(年月日) */
  "periodStartTime": string;
  /** 周期结束时间(年月日) */
  "periodEndTime": string;
  /** 当前周期使用的 mau 总数量 */
  "amount": string;
  /** 当前周期使用的 mau 数量 */
  "current": string;
}

export interface GenAuthSdkRightItemDto {
  /** 权益编码 */
  "rightsModelCode": string;
  /** 权益名称 */
  "rightsModelName": string;
  /** 权益数据类型 */
  "dataType": string;
  /** 权益值 */
  "dataValue": string;
}

export interface GenAuthSdkEventAppDto {
  /** 唯一标识 */
  "identifier": string;
  /** 应用名称 */
  "name": string;
  /** 应用 logo */
  "logo": string;
}

export interface GenAuthSdkOpenEventDto {
  /** 事件 ID */
  "id": string;
  /** 事件标志 */
  "code": string;
  /** 事件 Topic */
  "topic": string;
  /** 事件名称 */
  "name": string;
  /** 事件描述 */
  "desc": string;
}

export interface GenAuthSdkIpListRespDto {
  /** ID */
  "id": string;
  /** ip */
  "ip": string;
  /** ip类型，WHITE-白名单，BLACK-黑名单 */
  "ipType": string;
  /** 添加类型，MANUAL-手动，SCHEDULE-策略添加 */
  "addType": string;
  /** 删除类型，MANUAL-手动，SCHEDULE-策略删除 */
  "removeType": string;
  /** 限制类型，FORBID_LOGIN-禁止登录，FORBID_REGISTER-禁止注册，SKIP_MFA-跳过 MFA */
  "limitList": (string)[];
}

export interface GenAuthSdkRiskListItemDto {
  /** ID */
  "id": string;
  /** userId */
  "userId": string;
  /** 添加类型，MANUAL-手动，SCHEDULE-策略添加 */
  "addType": string;
  /** ip类型，WHITE-白名单，BLACK-黑名单 */
  "userListType": string;
  /** 删除类型，MANUAL-手动，SCHEDULE-策略删除 */
  "removeType": string;
  /** 限制类型，FORBID_LOGIN-禁止登录，FORBID_REGISTER-禁止注册，SKIP_MFA-跳过 MFA */
  "limitList": (string)[];
  /** 添加时间 */
  "addAt": string;
}

export interface GenAuthSdkRiskListPolicyRespDto {
  /** ID */
  "id": string;
  /** 策略操作对象，目前只有 ip */
  "optObject": "IP" | "USER";
  /** 操作IP的范围, ALL-所有，NOT_IN_WHITE_LIST-不在白名单中，与 userRange 二者取一个 */
  "ipRange": "ALL" | "NOT_IN_WHITE_LIST";
  /** 操作USER的范围, ALL-所有，NOT_IN_WHITE_LIST-不在白名单中，与 ipRange 二者取一个 */
  "userRange": "ALL" | "NOT_IN_WHITE_LIST";
  /** IP条件, NO_LIMIT-不限制，ONE-单个IP，与 userCond 二者取一个 */
  "ipCond": "NO_LIMIT" | "ONE";
  /** IP条件, NO_LIMIT-不限制，ONE-单个用户，与 ipCond 二者取一个 */
  "userCond": "NO_LIMIT" | "ONE";
  /** 时间范围，最近多少分钟 */
  "timeRange": number;
  /** 次数阈值 */
  "countThr": number;
  /** 事件状态类型，password_wrong-密码错误，account_wrong-账号错误 */
  "eventStateType": "password_wrong" | "account_wrong";
  /** 移除类型，MANUAL-手动，SCHEDULE-策略, 目前只有手动 */
  "removeType": "MANUAL" | "SCHEDULE";
  /** 策略动作, ADD_IP_BLACK_LIST-添加IP黑名单，ADD_USER_BLACK_LIST-添加用户黑名单 */
  "action": "ADD_IP_BLACK_LIST" | "ADD_USER_BLACK_LIST";
  /** 限制类型列表,FORBID_LOGIN-禁止登录，FORBID_REGISTER-禁止注册 */
  "limitList": "FORBID_LOGIN" | "FORBID_REGISTER";
  /** 创建时间， */
  "createdAt": string;
}

export interface GenAuthSdkDeviceRuleDto {
  /** 最大同时在线设备数 */
  "maxOnlineDevices": number;
}

export interface GenAuthSdkIPRuleDto {
  /** 最大同时在线 IP 数 */
  "maxOnlineIPs": number;
}

export interface GenAuthSdkRolePermissionApplyApprovalObject {
  /** 角色 ID */
  "objectId": string;
  /** 角色名称 */
  "objectName": string;
  /** 角色 Code */
  "roleCode": string;
  /** 权限分组 ID */
  "namespaceId": number;
  /** 权限分组 Code，即应用 ID */
  "namespaceCode": string;
}

export interface GenAuthSdkApplicationPermissionApplyApprovalObject {
  /** 应用 ID */
  "objectId": string;
  /** 应用名称 */
  "objectName": string;
  /** 应用 Logo 地址 */
  "logo": string;
}

export interface GenAuthSdkExtraParams {
  /** 角色主体过期时间毫秒值, 为 null 时永久有效 */
  "endTime"?: undefined | number;
  /** 角色主体加入时间毫秒值, 为 null 时立即加入 */
  "enableTime"?: undefined | number;
}

export interface GenAuthSdkWebhookRetryConfigV3Dto {
  /** 是否开启失败重试 */
  "enabled": boolean;
  /** 失败重试次数 */
  "count"?: undefined | number;
  /** 失败重试时间间隔 */
  "delay"?: undefined | number;
  /** 失败重试时间间隔单位 */
  "delayUnit"?: undefined | "Second" | "Minute" | "Hour" | "Day";
}

export interface GenAuthSdkWebhookLogDto {
  /** Webhook ID */
  "webhookId": string;
  /** Webhook 事件名称 */
  "eventName": string;
  /** Webhook 请求体 */
  "requestBody": unknown;
  /** Webhook 请求头 */
  "requestHeaders": unknown;
  /** Webhook 响应码 */
  "responseStatusCode": number;
  /** Webhook 响应头 */
  "responseHeaders": unknown;
  /** Webhook 响应体 */
  "responseBody": unknown;
  /** 时间戳 */
  "timestamp": string;
  /** 是否请求成功 */
  "success": boolean;
  /** 请求失败时返回的错误信息 */
  "errorMessage"?: undefined | string;
}

export interface GenAuthSdkWebhookCategoryDto {
  /** Webhook 类型名称 */
  "name": string;
  /** Webhook 类型英文名称 */
  "nameEn": string;
  /** Webhook 类型 */
  "value": string;
}

export interface GenAuthSdkWebhookEventDto {
  /** Webhook 名称 */
  "name": string;
  /** Webhook 英文名称 */
  "nameEn": string;
  /** Webhook 事件 */
  "value": string;
  /** Webhook 事件分类 */
  "category": string;
}

export interface GenAuthSdkPaginationDto {
  /** 当前页数，从 1 开始 */
  "page"?: undefined | number;
  /** 每页数目，最大不能超过 50，默认为 10 */
  "limit"?: undefined | number;
}

export interface GenAuthSdkSortingDto {
  /** 进行排序的字段，可选值为： - `createdAt`: 创建时间 - `updatedAt`: 修改时间 - `email`: 邮箱 - `phone`: 手机号 - `username`: 用户名 - `externalId`: 外部 ID - `status`: 公共账号状态 - `statusChangedAt`: 状态修改时间 - `passwordLastSetAt`: 密码修改时间 - `loginsCount`: 登录次数 - `gender`: 性别 - `lastLogin`: 上次登录时间 - `userSourceType`: 公共账号注册来源 - `lastMfaTime`: 上次 MFA 认证时间 - `passwordSecurityLevel`: 密码安全等级 - `phoneCountryCode`: 手机区号 - `lastIp`: 上次登录时使用的 IP */
  "field": "id" | "createdAt" | "updatedAt" | "email" | "username" | "externalId" | "phone" | "status" | "statusChangedAt" | "passwordLastSetAt" | "loginsCount" | "gender" | "lastLogin" | "userSourceType" | "lastMfaTime" | "passwordSecurityLevel" | "phoneCountryCode" | "lastIp";
  /** 排序顺序： - `desc`: 按照从大到小降序。 - `asc`: 按照从小到大升序。 */
  "order": "desc" | "asc";
}

export interface GenAuthSdkSendCreateAccountNotificationDto {
  /** 创建账号之后，是否发送邮件通知 */
  "sendEmailNotification"?: undefined | false | true;
  /** 创建账号之后，是否发送短信通知 */
  "sendPhoneNotification"?: undefined | false | true;
  /** 发送登录地址时，指定的应用 id，会将此应用的登录地址发送给用户的邮箱或者手机号。默认为用户池应用面板的登录地址。 */
  "appId"?: undefined | string;
}

export interface GenAuthSdkSendResetPasswordNotificationDto {
  /** 重置密码之后，是否发送用户默认邮件通知 */
  "sendDefaultEmailNotification"?: undefined | false | true;
  /** 重置密码之后，是否发送用户默认短信通知 */
  "sendDefaultPhoneNotification"?: undefined | false | true;
  /** 当用户密码修改之后，输入发送邮箱 */
  "inputSendEmailNotification"?: undefined | string;
  /** 当用户密码修改之后，输入发送手机号 */
  "inputSendPhoneNotification"?: undefined | string;
  /** 发送登录地址时，指定的应用 id，会将此应用的登录地址发送给用户的邮箱或者手机号。默认为用户池应用面板的登录地址。 */
  "appId"?: undefined | string;
}

export interface GenAuthSdkLangObject {
  /** 多语言的中文内容 */
  "zh-CN": GenAuthSdkLangUnit;
  /** 多语言的英文内容 */
  "en-US": GenAuthSdkLangUnit;
  /** 多语言的繁体中文内容 */
  "zh-TW": GenAuthSdkLangUnit;
  /** 多语言的日语内容 */
  "ja-JP": GenAuthSdkLangUnit;
}

export interface GenAuthSdkImportOtpItemDataDto {
  /** OTP 密钥 */
  "secret": string;
  /** OTP Recovery Code */
  "recoveryCode"?: undefined | string;
}

export interface GenAuthSdkSyncTaskLarkClientConfig {
  /** 飞书应用 App ID */
  "app_id": string;
  /** 飞书应用 App Secret */
  "app_secret": string;
  /** 飞书事件订阅的 Encrypt Key，可以在飞书开放平台应用详情的「事件订阅」页面获取。如果你需要开启实时同步，此参数必填。 */
  "encrypt_key"?: undefined | string;
  /** 飞书事件订阅的 Verification Token，可以在飞书开放平台应用详情的「事件订阅」页面获取。如果你需要开启实时同步，此参数必填。 */
  "verification_token"?: undefined | string;
}

export interface GenAuthSdkSyncTaskWechatworkClientConfig {
  /** 企业 ID（CorpId） */
  "corpID": string;
  /** 企业微信通讯录密钥 Secret */
  "secret": string;
  /** 通讯录事件同步 Token */
  "token"?: undefined | string;
  /** 通讯录事件同步 EncodingAESKey */
  "encodingAESKey"?: undefined | string;
  /** 代理地址 */
  "agentUrl"?: undefined | string;
}

export interface GenAuthSdkSyncTaskDingtalkClientConfig {
  /** 企业 ID（CorpId） */
  "corpId": string;
  /** 钉钉应用的 AppKey */
  "appKey": string;
  /** 钉钉应用的 AppSecret */
  "appSecret": string;
  /** 加密 aes_key */
  "aes_key"?: undefined | string;
  /** 签名 token */
  "token"?: undefined | string;
}

export interface GenAuthSdkSyncTaskMokaClientConfig {
  /** User Name */
  "userName": string;
  /** Ent Code */
  "entCode": string;
  /** Api Code Employee */
  "apiCode_employee": string;
  /** Api Code Department */
  "apiCode_department": string;
  /** Private Key */
  "privateKey": string;
}

export interface GenAuthSdkSyncTaskScimClientConfig {
  /** Group Url */
  "org_url"?: undefined | string;
  /** User Url */
  "user_url": string;
  /** Token */
  "token": string;
  /** Root Department Id */
  "root_department_id"?: undefined | string;
  /** Parent Department */
  "parent_department"?: undefined | string;
  /** Department */
  "department"?: undefined | string;
}

export interface GenAuthSdkSyncTaskActiveDirectoryClientConfig {
  /** 身份源唯一标志 */
  "syncIdentityProviderCode"?: undefined | string;
  /** Provisioning Ticket Url */
  "ticket_url"?: undefined | string;
}

export interface GenAuthSdkSyncTaskLdapClientConfig {
  /** LDAP 链接 */
  "url": string;
  /** Bind DN */
  "bindDn": string;
  /** Bind DN 密码 */
  "bindCredentials": string;
  /** Users Base DN */
  "usersBaseDn": string;
  /** Groups Base Dn */
  "groupsBaseDn": string;
  /** 用户查询条件 */
  "userQueryCriteria": string;
  /** 部门查询条件 */
  "departmentQueryCriteria": string;
}

export interface GenAuthSdkSyncTaskItalentClientConfig {
  /** Tenant Id */
  "tenant_id": string;
  /** App Key */
  "app_key": string;
  /** App Secret */
  "app_secret": string;
}

export interface GenAuthSdkSyncTaskMaycurClientConfig {
  /** App Code */
  "app_code": string;
  /** App Secret */
  "app_secret": string;
  /** 登录域名 */
  "endpoint": string;
}

export interface GenAuthSdkSyncTaskFxiaokeClientConfig {
  /** App Id */
  "appId": string;
  /** App Secret */
  "appSecret": string;
  /** Permanent Code */
  "permanentCode": string;
  /** Current Open User Id */
  "currentOpenUserId": string;
}

export interface GenAuthSdkSyncTaskXiaoshouyiClientConfig {
  /** 销售易应用的 ClientId */
  "client_id": string;
  /** 销售易应用的 ClientSecret */
  "client_secret": string;
  /** 销售易应用的 UserName */
  "username": string;
  /** 销售易应用的 Password */
  "password": string;
}

export interface GenAuthSdkSyncTaskKayangClientConfig {
  /** Endpoint */
  "endpoint": string;
  /** Account */
  "account": string;
  /** Password */
  "password": string;
}

export interface GenAuthSdkCombineFilterItemDto {
  /** 筛选条件的 key */
  "type": string;
  /** 条件操作符 */
  "operator": "EQUAL" | "NOT_EQUAL" | "CONTAINS" | "NOT_CONTAINS" | "IS_NULL" | "NOT_NULL" | "IN" | "NOT_IN" | "GREATER" | "LESSER" | "BETWEEN";
  /** 条件值 */
  "value": string | number;
}

export interface GenAuthSdkAppValidateRuleDto {
  /** 字段类型 - `None`: 不校验 - `regExp`: 正则 - `phone`: 手机号校验框 - `email`: 邮箱校验框 - `isNumber`: 必须为数字 */
  "type": "None" | "regExp" | "phone" | "email" | "isNumber";
  /** 正则表达式 */
  "content": "None" | "regExp" | "phone" | "email" | "isNumber";
  /** 错误信息提示 */
  "errorMessage"?: undefined | string;
  /** 多语言显示 */
  "i18n"?: undefined | GenAuthSdkErrMsgI18nDto;
}

export interface GenAuthSdkResourceItemDto {
  /** 资源唯一标志符 */
  "code": string;
  /** 资源定义的操作类型 */
  "actions": (string)[];
  /** 资源类型，如数据、API、按钮、菜单 */
  "resourceType": "DATA" | "API" | "MENU" | "BUTTON" | "UI";
}

export interface GenAuthSdkParsedUserAgent {
  /** 使用的设备类型 */
  "device": string;
  /** 浏览器名称 */
  "name": string;
  /** 操作系统 */
  "os": string;
}

export interface GenAuthSdkGeoIp {
  /** 地理位置 */
  "location": GenAuthSdkGeoIpLocation;
  /** Country Name */
  "country_name": string;
  /** Country Code 2 */
  "country_code2": string;
  /** Country Code 3 */
  "country_code3": string;
  /** Region Name */
  "region_name": string;
  /** Region Code */
  "region_code": string;
  /** 城市名称 */
  "city_name": string;
  /** Continent Code */
  "continent_code": string;
  /** 时区 */
  "timezone": string;
}

export interface GenAuthSdkApplicationDefaultLoginMethod {
  /** 默认的登录类型 - `PASSWORD`: 密码类型，取决于你开启的基础登录方式，支持手机号/邮箱/用户名 + 密码进行登录 - `PASSCODE`: 验证码类型，取决于你开启的基础登录方式，支持手机号/邮箱 + 验证码进行登录 - `QRCODE`: 扫码登录类型，目前包含自建 APP 扫码登录、关注微信公众号扫码登录、微信小程序扫码登录三种类型 */
  "connectionType": "PASSCODE" | "PASSWORD" | "QRCODE" | "LDAP" | "AD";
  /** 当 `connectionType` 为 `QRCODE` 时，此参数表示二维码类型。 - `SELF_BUILT_APP`: 自建 APP 扫码 - `WECHAT_OFFICIAL_ACCOUNT`: 扫码关注微信公众号登录 - `WECHAT_MINI_PROGRAM`: 微信小程序扫码登录 */
  "qrcodeType": "SELF_BUILT_APP" | "WECHAT_OFFICIAL_ACCOUNT" | "WECHAT_MINI_PROGRAM";
  /** 当 `connectionType` 为 `QRCODE` 时，你需要通过此参数指定具体的扫码登录身份源连接的 ID。 */
  "qrcodeExtIdpConnId": string;
  /** 当 `connectionType` 为 `AD` 时，你需要通过此参数指定具体的 AD 身份源连接的 ID。 */
  "adExtIdpConnId": string;
  /** 当 `connectionType` 为 `LDAP` 时，你需要通过此参数指定具体的 LDAP 身份源连接的 ID。 */
  "ldapExtIdpConnId": string;
}

export interface GenAuthSdkApplicationEnabledExtIdpConnDto {
  /** 是否为社会化登录身份源连接 */
  "isSocial": boolean;
  /** 身份源 ID */
  "extIdpId": string;
  /** 身份源类型 */
  "extIdpType": "oidc" | "oauth2" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "wechat" | "google" | "qq" | "wechatwork" | "dingtalk" | "weibo" | "github" | "alipay" | "apple" | "baidu" | "lark" | "gitlab" | "twitter" | "facebook" | "slack" | "linkedin" | "yidun" | "qingcloud" | "gitee" | "instagram" | "welink" | "huawei" | "honor" | "xiaomi" | "oppo" | "aws" | "amazon" | "douyin" | "kuaishou" | "line" | "sdbz" | "zjzwfw" | "zzding" | "seeyona8v5";
  /** 身份源连接 ID */
  "extIdpConnId": string;
  /** 身份源连接类型 */
  "extIdpConnType": "oidc" | "oauth" | "saml" | "ldap" | "ad" | "cas" | "azure-ad" | "alipay" | "facebook" | "facebook:mobile" | "twitter" | "google:mobile" | "google" | "wechat:pc" | "wechat:mobile" | "wechat:webpage-authorization" | "wechatmp-qrcode" | "wechat:miniprogram:default" | "wechat:miniprogram:qrconnect" | "wechat:miniprogram:app-launch" | "github" | "github:mobile" | "qq" | "qq:mobile" | "wechatwork:corp:qrconnect" | "wechatwork:agency:qrconnect" | "wechatwork:service-provider:qrconnect" | "wechatwork:mobile" | "wechatwork:agency:mobile" | "dingtalk" | "dingtalk:mobile" | "dingtalk:provider" | "weibo" | "weibo:mobile" | "apple" | "apple:web" | "baidu" | "baidu:mobile" | "lark-internal" | "lark-public" | "lark-block" | "gitlab" | "gitlab:mobile" | "linkedin" | "linkedin:mobile" | "slack" | "slack:mobile" | "yidun" | "qingcloud" | "gitee" | "gitee:mobile" | "instagram" | "welink" | "ad-kerberos" | "huawei" | "huawei:mobile" | "honor" | "xiaomi" | "xiaomi:mobile" | "aws" | "amazon" | "amazon:mobile" | "douyin:mobile" | "douyin:miniprogram:default" | "kuaishou:mobile" | "line:mobile" | "oppo:mobile" | "wechatwork:qrconnect:of:authing:agency" | "sdbz" | "zjzwfw-qrcode" | "zzding" | "seeyona8v5";
  /** 身份源连接可读唯一标志 */
  "extIdpConnIdentifier": string;
  /** 微信 */
  "extIdpConnDisplayName": string;
  /** 身份源连接 Logo */
  "extIdpConnLogo": string;
  /** 是否允许身份源连接 */
  "enabled"?: undefined | false | true;
}

export interface GenAuthSdkApplicationAgreementDto {
  /** 展示的页面（可多选）： - `LoginPage`: 登录页面 - `RegisterPage`: 注册页面 */
  "displayAt": ("LoginPage" | "RegisterPage")[];
  /** 是否要求必须勾选 */
  "isRequired": boolean;
  /** 此协议针对什么语言有效: - `zh-CN`: 简体中文 - `zh-TW`: 繁体中文 - `en-US`: 英文 - `ja-JP`: 日语 */
  "lang": "zh-CN" | "en-US" | "zh-TW" | "ja-JP";
  /** 此协议针对什么语言有效 */
  "content": string;
}

export interface GenAuthSdkApplicationDefaultLoginMethodInput {
  /** 默认的登录类型 - `PASSWORD`: 密码类型，取决于你开启的基础登录方式，支持手机号/邮箱/用户名 + 密码进行登录 - `PASSCODE`: 验证码类型，取决于你开启的基础登录方式，支持手机号/邮箱 + 验证码进行登录 - `QRCODE`: 扫码登录类型，目前包含自建 APP 扫码登录、关注微信公众号扫码登录、微信小程序扫码登录三种类型 */
  "connectionType": "PASSCODE" | "PASSWORD" | "QRCODE" | "LDAP" | "AD";
  /** 当 `connectionType` 为 `QRCODE` 时，此参数表示二维码类型。 - `SELF_BUILT_APP`: 自建 APP 扫码 - `WECHAT_OFFICIAL_ACCOUNT`: 扫码关注微信公众号登录 - `WECHAT_MINI_PROGRAM`: 微信小程序扫码登录 */
  "qrcodeType"?: undefined | "SELF_BUILT_APP" | "WECHAT_OFFICIAL_ACCOUNT" | "WECHAT_MINI_PROGRAM";
  /** 当 `connectionType` 为 `QRCODE` 时，你需要通过此参数指定具体的扫码登录身份源连接的 ID。 */
  "qrcodeExtIdpConnId"?: undefined | string;
  /** 当 `connectionType` 为 `AD` 时，你需要通过此参数指定具体的 AD 身份源连接的 ID。 */
  "adExtIdpConnId"?: undefined | string;
  /** 当 `connectionType` 为 `LDAP` 时，你需要通过此参数指定具体的 LDAP 身份源连接的 ID。 */
  "ldapExtIdpConnId"?: undefined | string;
}

export interface GenAuthSdkApplicationEnabledExtIdpConnInputDto {
  /** 身份源连接 ID */
  "extIdpConnId": string;
}

export interface GenAuthSdkLanguageCoinfigDto {
  "global": Record<string, unknown>;
}

export interface GenAuthSdkLoginFailCheckConfigDto {
  /** 是否开启登录失败次数限制。 */
  "enabled": boolean;
  /** 在一定时间周期内，对于同一个 IP，最多登录失败多少次后会触发安全策略。 */
  "limit": number;
  /** 限定周期时间长度，单位为秒。 */
  "timeInterval": number;
  /** 时间长度单位。Second/Minute/Hour/Day，仅仅做显示，timeInterval的单位还是秒 */
  "unit"?: undefined | string;
}

export interface GenAuthSdkLoginPassowrdFailCheckConfigDto {
  /** 是否开启登录密码错误限制 */
  "enabled": boolean;
  /** 密码错误次数最大限制 */
  "limit": number;
  /** 限定周期时间长度，单位为秒。 */
  "timeInterval": number;
  /** 时间长度单位。Second/Minute/Hour/Day，仅仅做显示，timeInterval的单位还是秒 */
  "unit"?: undefined | string;
}

export interface GenAuthSdkLoginIpWhitelistCheckConfigDto {
  /** 是否开启登录 ip 白名单验证 */
  "enabled": boolean;
  /** 人机验证 ip 白名单 */
  "ipWhitelist": string;
}

export interface GenAuthSdkOption {
  /** 值 */
  "value": string;
}

export interface GenAuthSdkDataResourceSimpleRespDto {
  /** 数据权限所属的数据资源 ID */
  "resourceId": string;
  /** 数据权限所属的数据资源名称 */
  "resourceName": string;
}

export interface GenAuthSdkSubjectRespDto {
  /** 主体 ID ，包含用户 ID、用户组 ID、角色 ID、组织机构 ID */
  "id": string;
  /** 主体类型,包括 USER、GROUP、ROLE、ORG 四种类型 */
  "type": "USER" | "ORG" | "GROUP" | "ROLE";
  /** 主体名称，包含用户名称、用户组名称、角色名称、组织机构名称 */
  "name": string;
}

export interface GenAuthSdkOpenResource {
  /** 数据策略下所授权的数据资源 Code */
  "resourceCode": string;
  /** 数据策略下所授权的数据资源类型，目前支持树结构（TREE）、字符串（STRING）、数组（ARRAY）三种类型，根据不同的类型返回不同的结构。 - `STRING`: 字符串类型结果 StrAuthorize - `ARRAY`: 数组类型 ArrayAuthorize - `TREE`: 树类型 TreeAuthorize */
  "resourceType": "TREE" | "STRING" | "ARRAY";
  /** 数据策略的字符串资源 */
  "strAuthorize"?: undefined | GenAuthSdkStrAuthorize;
  /** 数据策略的数组资源 */
  "arrAuthorize"?: undefined | GenAuthSdkArrayAuthorize;
  /** 数据策略的树资源 */
  "treeAuthorize"?: undefined | GenAuthSdkTreeAuthorize;
}

export interface GenAuthSdkActionAuth {
  /** 数据策略授权用户 ID 列表 */
  "userIds": (string)[];
  /** 数据资源权限操作 */
  "action": string;
}

export interface GenAuthSdkTreeStructs {
  /** 树资源节点 Code, 同层级唯一 */
  "code": string;
  /** 树资源节点名称 ，同层级唯一 */
  "name": string;
  /** 树资源节点 Value */
  "value"?: undefined | string;
  /** 树数据资源策略节点 actions */
  "actions"?: undefined | (string)[];
  /** 子节点数据,子节点数据最多五个层级 */
  "children"?: undefined | (GenAuthSdkTreeStructs)[];
}

export interface GenAuthSdkPolicyBo {
  /** 数据策略 id */
  "dataPolicyId": string;
  /** 数据策略名称名称 */
  "dataPolicyName": string;
}

export interface GenAuthSdkRoleBo {
  /** 角色 id */
  "roleId": string;
  /** 角色名称 */
  "roleName": string;
  /** 角色 Code */
  "roleCode": string;
}

export interface GenAuthSdkGroupBo {
  /** 用户组 id */
  "groupId": string;
  /** 用户组名称 */
  "groupName": string;
  /** 用户组 Code */
  "groupCode": string;
}

export interface GenAuthSdkNodeBo {
  /** 组织机构 id */
  "nodeId": string;
  /** 组织机构名称 */
  "nodeName": string;
  /** 组织机构 Code */
  "nodeCode": string;
}

export interface GenAuthSdkLangUnit {
  /** 是否已开启。若开启，且控制台选择该语言，则展示该内容。（默认关闭） */
  "enabled": boolean;
  /** 多语言内容 */
  "value": string;
}

export interface GenAuthSdkErrMsgI18nDto {
  /** 错误信息多语言提示 */
  "errorMessage"?: undefined | GenAuthSdkLangUnit;
}

export interface GenAuthSdkGeoIpLocation {
  /** 经度 */
  "lon": number;
  /** 纬度 */
  "lat": number;
}

export interface GenAuthSdkStrAuthorize {
  /** 字符串资源 Value */
  "value": string;
  /** 字符串资源操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkArrayAuthorize {
  /** 数组资源 Value 列表 */
  "values": (string)[];
  /** 数组资源操作列表 */
  "actions": (string)[];
}

export interface GenAuthSdkTreeAuthorize {
  /** 树资源授权列表 */
  "authList": (GenAuthSdkTreeAuthBo)[];
}

export interface GenAuthSdkTreeAuthBo {
  /** 树资源节点路径 */
  "nodePath": string;
  /** 树资源节点名称 */
  "nodeName": string;
  /** 树资源节点操作权限列表 */
  "nodeActions": (string)[];
  /** 树资源节点 Value */
  "nodeValue"?: undefined | string;
  /** 树资源节点扩展字段值 */
  "nodeExtendFieldValue"?: unknown;
}

/** 创建 ip 名单 */
export type GenAuthAddInput = GenAuthSdkIpListCreateDto;
export type GenAuthAddResult = GenAuthSdkCommonResponseDto;

/** 部门下添加成员 */
export type GenAuthAddDepartmentMembersInput = (GenAuthSdkAddDepartmentMembersReqDto) | (GenAuthAddDepartmentMembersReqDto);
export type GenAuthAddDepartmentMembersResult = GenAuthSdkIsSuccessDto;

/** 新增设备 */
export type GenAuthAddDeviceInput = GenAuthSdkCreateTerminalDto;
export type GenAuthAddDeviceResult = GenAuthSdkTerminalInfoDto;

/** 添加分组成员 */
export type GenAuthAddGroupMembersInput = (GenAuthSdkAddGroupMembersReqDto) | (GenAuthAddGroupMembersReqDto);
export type GenAuthAddGroupMembersResult = GenAuthSdkIsSuccessDto;

/** 添加邀请策略用户归属 */
export type GenAuthAddPolicyUserAttributionInput = GenAuthSdkAddInvitationPolicyUserAttributionDto;
export type GenAuthAddPolicyUserAttributionResult = GenAuthSdkUserAttributionDto;

/** 批量添加邀请策略用户归属 */
export type GenAuthAddPolicyUserAttributionsBatchInput = GenAuthSdkAddInvitationPolicyUserAttributionsBatchDto;
export type GenAuthAddPolicyUserAttributionsBatchResult = GenAuthSdkIsSuccessDto;

/** 创建风险策略 */
export type GenAuthAddRiskListPolicyInput = GenAuthSdkRiskListPolicyCreateDto;
export type GenAuthAddRiskListPolicyResult = GenAuthSdkCommonResponseDto;

/** 租户部门下添加成员 */
export type GenAuthAddTenantDepartmentMembersInput = (GenAuthSdkAddTenantDepartmentMembersReqDto) | (GenAuthAddTenantDepartmentMembersReqDto);
export type GenAuthAddTenantDepartmentMembersResult = GenAuthSdkIsSuccessDto;

/** 添加租户成员 */
export type GenAuthAddTenantUsersInput = (GenAuthSdkAddTenantUsersDto) | (GenAuthAddTenantUsersDto);
export type GenAuthAddTenantUsersResult = GenAuthSdkIsSuccessDto;

/** 创建用户名单 */
export type GenAuthAddUserInput = GenAuthSdkUserListCreateDto;
export type GenAuthAddUserResult = GenAuthSdkCommonResponseDto;

/** 创建注册白名单 */
export type GenAuthAddWhitelistInput = (GenAuthSdkAddWhitelistDto) | (GenAuthAddWhitelistDto);
export type GenAuthAddWhitelistResult = GenAuthSdkWhitelistRespDto;

/** 创建应用注册白名单 */
export type GenAuthAddWhitelistOfAppInput = (GenAuthSdkAddWhitelistOfAppDto) | (GenAuthAddWhitelistOfAppDto);
export type GenAuthAddWhitelistOfAppResult = GenAuthSdkWhitelistRespDto;

/** 批量通过通用邀请的申请 */
export type GenAuthApprovalInput = GenAuthSdkApprovalUniversalInvitationApplicantDto;
export type GenAuthApprovalResult = GenAuthSdkIsSuccessDto;

/** 分配 ASA 账号 */
export type GenAuthAssignAsaAccountInput = (GenAuthSdkAssignAsaAccountsDto) | (GenAuthAssignAsaAccountsDto);
export type GenAuthAssignAsaAccountResult = GenAuthSdkIsSuccessDto;

/** 单个角色批量授权 */
export type GenAuthAssignRoleInput = (GenAuthSdkAssignRoleDto) | (GenAuthAssignRoleDto);
export type GenAuthAssignRoleResult = GenAuthSdkIsSuccessDto;

/** 批量分配角色 */
export type GenAuthAssignRoleBatchInput = (GenAuthSdkAssignRoleBatchDto) | (GenAuthAssignRoleBatchDto);
export type GenAuthAssignRoleBatchResult = GenAuthSdkIsSuccessDto;

/** 关联/取消关联应用资源到租户 */
export type GenAuthAssociateTenantResourceInput = (GenAuthSdkAssociateTenantResourceDto) | (GenAuthAssociateTenantResourceDto);
export type GenAuthAssociateTenantResourceResult = GenAuthSdkIsSuccessDto;

/** 授权应用访问权限 */
export type GenAuthAuthorizeApplicationAccessInput = (GenAuthSdkAuthorizeApplicationAccessDto) | (GenAuthAuthorizeApplicationAccessDto);
export type GenAuthAuthorizeApplicationAccessResult = GenAuthSdkIsSuccessDto;

/** 授权数据策略 */
export type GenAuthAuthorizeDataPoliciesInput = (GenAuthSdkCreateAuthorizeDataPolicyDto) | (GenAuthCreateAuthorizeDataPolicyDto);
export type GenAuthAuthorizeDataPoliciesResult = GenAuthSdkCommonResponseDto;

/** 授权资源 */
export type GenAuthAuthorizeResourcesInput = (GenAuthSdkAuthorizeResourcesDto) | (GenAuthAuthorizeResourcesDto);
export type GenAuthAuthorizeResourcesResult = GenAuthSdkIsSuccessDto;

/** 批量删除应用授权 */
export type GenAuthBatchApplicationsAuthInput = GenAuthDeleteBatchApplicationAuthDto;
export type GenAuthBatchApplicationsAuthResult = GenAuthIsSuccessDto;

/** 更新邀请名单，批量关联邀请策略 */
export type GenAuthBatchBindPolicyInput = GenAuthSdkBatchBindPolicy;
export type GenAuthBatchBindPolicyResult = GenAuthSdkIsSuccessDto;

/** 批量创建树类型资源的扩展字段 */
export type GenAuthBatchCreateDnefInput = (GenAuthSdkBatchCreateDnefReq) | (GenAuthBatchCreateDnefReq);
export type GenAuthBatchCreateDnefResult = GenAuthSdkIsSuccessDto;

/** 批量删除资源 */
export type GenAuthBatchDeleteCommonResourceInput = GenAuthSdkDeleteCommonResourcesBatchDto;
export type GenAuthBatchDeleteCommonResourceResult = GenAuthSdkIsSuccessDto;

/** 批量删除邀请策略 */
export type GenAuthBatchDeleteInvitationPoliciesInput = GenAuthSdkDeleteInvitationPolicyByIdsDto;
export type GenAuthBatchDeleteInvitationPoliciesResult = GenAuthSdkIsSuccessDto;

/** 批量获取用户密码密文 */
export type GenAuthBatchGetUserEncryptPasswordInput = GenAuthGetUserEncryptPasswordBatchDto;
export type GenAuthBatchGetUserEncryptPasswordResult = GenAuthGetUserEncryptPasswordBatchDataDto;

/** 批量处理审批 */
export type GenAuthBatchProcessApprovalInput = GenAuthSdkApprovalBatchProcessReq;
export type GenAuthBatchProcessApprovalResult = GenAuthSdkIsSuccessDto;

/** 更新邀请名单，根据策略 Id 批量解除关联 */
export type GenAuthBatchUnbindPolicyInput = GenAuthSdkBatchUnbindPolicy;
export type GenAuthBatchUnbindPolicyResult = GenAuthSdkIsSuccessDto;

/** 公共账号绑定批量角色 */
export type GenAuthBindPublicAccountOfRolesInput = GenAuthSdkSetUserRolesDto;
export type GenAuthBindPublicAccountOfRolesResult = GenAuthSdkIsSuccessDto;

/** 公共账号绑定批量用户 */
export type GenAuthBindUsersPublicAccountInput = GenAuthSdkSetPublicAccountBatchReqDto;
export type GenAuthBindUsersPublicAccountResult = GenAuthSdkIsSuccessDto;

/** 取消同步风险操作 */
export type GenAuthCancelSyncRiskOperationInput = (GenAuthSdkCancelSyncRiskOperationDto) | (GenAuthCancelSyncRiskOperationDto);
export type GenAuthCancelSyncRiskOperationResult = GenAuthSdkCancelSyncRiskOperationsDataDto;

/** UEBA 上传 */
export type GenAuthCaptureInput = GenAuthSdkCreateUEBADto;
export type GenAuthCaptureResult = unknown;

/** 租户关联身份源 */
export type GenAuthChangeExtIdpConnAssociationStateInput = (GenAuthSdkChangeExtIdpAssociationStateDto) | (GenAuthChangeExtIdpAssociationStateDto);
export type GenAuthChangeExtIdpConnAssociationStateResult = GenAuthSdkIsSuccessDto;

/** 身份源连接开关 */
export type GenAuthChangeExtIdpConnStateInput = (GenAuthSdkChangeExtIdpConnStateDto) | (GenAuthChangeExtIdpConnStateDto);
export type GenAuthChangeExtIdpConnStateResult = GenAuthSdkIsSuccessDto;

/** 个人账号转换为公共账号 */
export type GenAuthChangeIntoPublicAccountInput = GenAuthSdkCreatePublicAccountFromUserDto;
export type GenAuthChangeIntoPublicAccountResult = GenAuthSdkIsSuccessDto;

/** 设置用户池多租户身份源连接 */
export type GenAuthChangeUserpoolTenanExtIdpConnStateInput = GenAuthSdkChangeUserPoolTenantExtIdpConnDto;
export type GenAuthChangeUserpoolTenanExtIdpConnStateResult = GenAuthSdkIsSuccessDto;

/** 设置用户池多租户身份源连接 */
export type GenAuthChangeUserpoolTenantExtIdpConnStateInput = GenAuthChangeUserPoolTenantExtIdpConnDto;
export type GenAuthChangeUserpoolTenantExtIdpConnStateResult = GenAuthIsSuccessDto;

/** 检查数据策略名称是否可用 */
export type GenAuthCheckDataPolicyExistsInput = (GenAuthSdkObject137) | (GenAuthCheckParamDataPolicyDto);
export type GenAuthCheckDataPolicyExistsResult = GenAuthSdkCheckParamsDataPolicyRespDto;

/** 检查数据资源 Code 或者名称是否可用 */
export type GenAuthCheckDataResourceExistsInput = (GenAuthSdkObject132) | (GenAuthCheckParamsDataResourceDto);
export type GenAuthCheckDataResourceExistsResult = GenAuthSdkCheckParamsDataResourceRespDto;

/** 检测域名是否可用 */
export type GenAuthCheckDomainAvailableInput = (GenAuthSdkCheckDomainAvailable) | (GenAuthCheckDomainAvailable);
export type GenAuthCheckDomainAvailableResult = GenAuthSdkCheckDomainAvailableDataDto;

/** 判断外部用户权限 */
export type GenAuthCheckExternalUserPermissionInput = (GenAuthSdkCheckExternalUserPermissionDto) | (GenAuthCheckExternalUserPermissionDto);
export type GenAuthCheckExternalUserPermissionResult = GenAuthSdkCheckExternalUserPermissionDataDto;

/** 判断 m2m 权限 */
export type GenAuthCheckM2mPermissionInput = GenAuthCheckM2mPermissionDto;
export type GenAuthCheckM2mPermissionResult = GenAuthCheckPermissionDataDto;

/** 判断 m2m 在树资源同层级下的权限（推荐） */
export type GenAuthCheckM2mSameLevelPermissionInput = GenAuthCheckM2mSameLevelPermissionDto;
export type GenAuthCheckM2mSameLevelPermissionResult = GenAuthCheckUserSameLevelPermissionDataDto;

/** 检测角色互斥 */
export type GenAuthCheckMutualExclusionInput = GenAuthSdkCheckRoleMutualExclusionReqDto;
export type GenAuthCheckMutualExclusionResult = GenAuthSdkCheckRoleMutualExclusionResultDto;

/** 校验角色 Code 或者名称是否可用 */
export type GenAuthCheckParamsNamespaceInput = GenAuthSdkCheckRoleParamsDto;
export type GenAuthCheckParamsNamespaceResult = GenAuthSdkCheckRoleParamsRespDto;

/** 判断用户权限（重点） */
export type GenAuthCheckPermissionInput = (GenAuthSdkCheckPermissionDto) | (GenAuthCheckPermissionDto);
export type GenAuthCheckPermissionResult = GenAuthSdkCheckPermissionDataDto;

/** 校验权限空间 Code 或者名称是否可用 */
export type GenAuthCheckPermissionNamespaceExistsInput = (GenAuthSdkCheckPermissionNamespaceExistsDto) | (GenAuthCheckPermissionNamespaceExistsDto);
export type GenAuthCheckPermissionNamespaceExistsResult = GenAuthSdkCheckPermissionNamespaceExistsRespDto;

/** 检测角色互斥 */
export type GenAuthCheckRoleMutualExclusionInput = GenAuthCheckRoleMutualExclusionReqDto;
export type GenAuthCheckRoleMutualExclusionResult = GenAuthCheckRoleMutualExclusionResultDto;

/** 校验角色 Code 或者名称是否可用 */
export type GenAuthCheckRoleParamsInput = GenAuthCheckRoleParamsDto;
export type GenAuthCheckRoleParamsResult = GenAuthCheckRoleParamsRespDto;

/** 检查某个用户在应用下是否具备 Session 登录态 */
export type GenAuthCheckSessionStatusInput = (GenAuthSdkCheckSessionStatusDto) | (GenAuthCheckSessionStatusDto);
export type GenAuthCheckSessionStatusResult = GenAuthSdkCheckSessionStatusDataDto;

/** 判断用户在树资源同层级下的权限（推荐） */
export type GenAuthCheckUserSameLevelPermissionInput = (GenAuthSdkCheckUserSameLevelPermissionDto) | (GenAuthCheckUserSameLevelPermissionDto);
export type GenAuthCheckUserSameLevelPermissionResult = GenAuthSdkCheckUserSameLevelPermissionDataDto;

/** 获取已办审批列表 */
export type GenAuthClosedListInput = GenAuthSdkObject152;
export type GenAuthClosedListResult = GenAuthSdkApprovalPageList;

/** 关闭全局多因素认证配置 */
export type GenAuthCloseGlobalMfaSettingsInput = GenAuthSdkMFADisableSettingsDto;
export type GenAuthCloseGlobalMfaSettingsResult = GenAuthSdkMFASettingsDto;

/** 配置第三方邮件服务 */
export type GenAuthConfigEmailProviderInput = GenAuthSdkConfigEmailProviderDto;
export type GenAuthConfigEmailProviderResult = GenAuthSdkEmailProviderDto;

/** 复制编排配置 */
export type GenAuthCopyAuthFlowConfigInput = { "fromAppId": string } & { "flowId": string } & { "targetAppId": string };
export type GenAuthCopyAuthFlowConfigResult = GenAuthAsaAccountDto;

/** 创建邀请策略副本 */
export type GenAuthCopyInvitationPolicyByIdInput = GenAuthSdkCopyInvitationPolicyDto;
export type GenAuthCopyInvitationPolicyByIdResult = GenAuthSdkGetInvitationPolicyDto;

/** 复制自定义操作 */
export type GenAuthCopyOperateInput = GenAuthSdkFunctionModelOperateIdDto;
export type GenAuthCopyOperateResult = GenAuthSdkCommonResponseDto;

/** 复制行关联关系 */
export type GenAuthCopyRowRelationInput = GenAuthSdkCopyRowRelationDto;
export type GenAuthCopyRowRelationResult = GenAuthSdkRelationValueListDto;

/** 创建协作管理员的 AK/SK */
export type GenAuthCreateAccessKeyInput = (GenAuthSdkCreateAccessKeyDto) | (GenAuthCreateAccessKeyDto);
export type GenAuthCreateAccessKeyResult = (GenAuthSdkCreateAccessKeyRespDto)[];

/** 创建管理员角色 */
export type GenAuthCreateAdminRoleInput = (GenAuthSdkCreateAdminRoleDto) | (GenAuthCreateAdminRoleDto);
export type GenAuthCreateAdminRoleResult = GenAuthSdkCheckRoleParamsRespDto;

/** 创建应用 */
export type GenAuthCreateApplicationInput = (GenAuthSdkCreateApplicationDto) | (GenAuthCreateApplicationDto);
export type GenAuthCreateApplicationResult = GenAuthSdkCreateApplicationRespDataDto;

/** 创建数组数据资源 */
export type GenAuthCreateArrayDataResourceInput = GenAuthCreateArrayDataResourceDto;
export type GenAuthCreateArrayDataResourceResult = GenAuthCreateArrayDataResourceRespDto;

/** 创建 ASA 账号 */
export type GenAuthCreateAsaAccountInput = (GenAuthSdkCreateAsaAccountDto) | (GenAuthCreateAsaAccountDto);
export type GenAuthCreateAsaAccountResult = GenAuthSdkAsaAccountDto;

/** 批量创建 ASA 账号 */
export type GenAuthCreateAsaAccountBatchInput = GenAuthSdkCreateAsaAccountsBatchDto;
export type GenAuthCreateAsaAccountBatchResult = GenAuthSdkIsSuccessDto;

/** 批量创建 ASA 账号 */
export type GenAuthCreateAsaAccountsBatchInput = GenAuthCreateAsaAccountsBatchDto;
export type GenAuthCreateAsaAccountsBatchResult = GenAuthIsSuccessDto;

/** 创建应用认证配置 */
export type GenAuthCreateAuthFlowAppConfigInput = GenAuthCreateAuthFlowAppConfigDto;
export type GenAuthCreateAuthFlowAppConfigResult = GenAuthCreateApplicationRespDataDto;

/** 创建 AuthFlowFunction 函数 */
export type GenAuthCreateAuthFlowFunctionInput = GenAuthCreatePipelineFunctionDto;
export type GenAuthCreateAuthFlowFunctionResult = GenAuthPipelineFunctionDto;

/** 创建数据策略（重点） */
export type GenAuthCreateDataPolicyInput = (GenAuthSdkCreateDataPolicyDto) | (GenAuthCreateDataPolicyDto);
export type GenAuthCreateDataPolicyResult = GenAuthSdkCreateDataPolicyRespDto;

/** 创建数据资源（推荐、重点） */
export type GenAuthCreateDataResourceInput = (GenAuthSdkCreateDataResourceDto) | (GenAuthCreateDataResourceDto);
export type GenAuthCreateDataResourceResult = GenAuthSdkCreateDataResourceRespDto;

/** 创建数组数据资源 */
export type GenAuthCreateDataResourceByArrayInput = GenAuthSdkCreateArrayDataResourceDto;
export type GenAuthCreateDataResourceByArrayResult = GenAuthSdkCreateArrayDataResourceRespDto;

/** 创建字符串数据资源 */
export type GenAuthCreateDataResourceByStringInput = GenAuthSdkCreateStringDataResourceDto;
export type GenAuthCreateDataResourceByStringResult = GenAuthSdkCreateStringDataResourceRespDto;

/** 创建树数据资源 */
export type GenAuthCreateDataResourceByTreeInput = GenAuthSdkCreateTreeDataResourceDto;
export type GenAuthCreateDataResourceByTreeResult = GenAuthSdkCreateTreeDataResourceRespDto;

/** 创建部门 */
export type GenAuthCreateDepartmentInput = (GenAuthSdkCreateDepartmentReqDto) | (GenAuthCreateDepartmentReqDto);
export type GenAuthCreateDepartmentResult = GenAuthSdkDepartmentDto;

/** 根据组织树批量创建部门 */
export type GenAuthCreateDepartmentTreeInput = (GenAuthSdkCreateDepartmentTreeReqDto) | (GenAuthCreateDepartmentTreeReqDto);
export type GenAuthCreateDepartmentTreeResult = GenAuthSdkResult;

/** 新增设备 */
export type GenAuthCreateDeviceInput = GenAuthSdkCreateTerminalDto;
export type GenAuthCreateDeviceResult = GenAuthSdkTerminalInfoDto;

/** 创建树类型资源的扩展字段 */
export type GenAuthCreateDnefInput = (GenAuthSdkCreateDnefReq) | (GenAuthCreateDnefReq);
export type GenAuthCreateDnefResult = GenAuthSdkIsSuccessDto;

/** 创建动态分组 */
export type GenAuthCreateDynamicGroupInput = GenAuthCreateDynamicGroupDto;
export type GenAuthCreateDynamicGroupResult = GenAuthDynamicGroupDto;

/** 创建自定义事件应用 */
export type GenAuthCreateEventAppInput = GenAuthSdkCreateEventAppDto;
export type GenAuthCreateEventAppResult = GenAuthSdkCommonResponseDto;

/** 创建身份源 */
export type GenAuthCreateExtIdpInput = (GenAuthSdkCreateExtIdpDto) | (GenAuthCreateExtIdpDto);
export type GenAuthCreateExtIdpResult = GenAuthSdkExtIdpDto;

/** 在某个已有身份源下创建新连接 */
export type GenAuthCreateExtIdpConnInput = (GenAuthSdkCreateExtIdpConnDto) | (GenAuthCreateExtIdpConnDto);
export type GenAuthCreateExtIdpConnResult = GenAuthSdkExtIdpConnDetail;

/** 创建数据对象的字段 */
export type GenAuthCreateFieldInput = GenAuthSdkCreateFunctionModelFieldDto;
export type GenAuthCreateFieldResult = GenAuthSdkFunctionModelFieldDto;

/** 创建分组 */
export type GenAuthCreateGroupInput = (GenAuthSdkCreateGroupReqDto) | (GenAuthCreateGroupReqDto);
export type GenAuthCreateGroupResult = GenAuthSdkGroupDto;

/** 批量创建分组 */
export type GenAuthCreateGroupsBatchInput = (GenAuthSdkCreateGroupBatchReqDto) | (GenAuthCreateGroupBatchReqDto);
export type GenAuthCreateGroupsBatchResult = (GenAuthSdkGroupDto)[];

/** 创建邀请策略 */
export type GenAuthCreateInvitationPolicyInput = GenAuthSdkCreateInvitationPolicyDto;
export type GenAuthCreateInvitationPolicyResult = GenAuthSdkGetInvitationPolicyDto;

/** 创建邀请名单 */
export type GenAuthCreateInvitationRosterInput = GenAuthSdkCreateInvitationRosterDto;
export type GenAuthCreateInvitationRosterResult = GenAuthSdkInvitationRosterDto;

/** 创建数据对象 */
export type GenAuthCreateModelInput = GenAuthSdkCreateFunctionModelDto;
export type GenAuthCreateModelResult = GenAuthSdkFunctionModelDto;

/** 创建多租户管理员用户 */
export type GenAuthCreateMultipleTenantAdminInput = (GenAuthSdkCreateMultipleTenantAdminDto) | (GenAuthCreateMultipleTenantAdminDto);
export type GenAuthCreateMultipleTenantAdminResult = GenAuthSdkCommonResponseDto;

/** 创建权限分组 */
export type GenAuthCreateNamespaceInput = (GenAuthSdkCreateNamespaceDto) | (GenAuthCreateNamespaceDto);
export type GenAuthCreateNamespaceResult = GenAuthSdkNamespaceDto;

/** 批量创建权限分组 */
export type GenAuthCreateNamespacesBatchInput = (GenAuthSdkCreateNamespacesBatchDto) | (GenAuthCreateNamespacesBatchDto);
export type GenAuthCreateNamespacesBatchResult = GenAuthSdkIsSuccessDto;

/** 创建自定义操作 */
export type GenAuthCreateOperateInput = GenAuthSdkCreateOperateModelDto;
export type GenAuthCreateOperateResult = GenAuthSdkCommonResponseDto;

/** 创建组织机构 */
export type GenAuthCreateOrganizationInput = (GenAuthSdkCreateOrganizationReqDto) | (GenAuthCreateOrganizationReqDto);
export type GenAuthCreateOrganizationResult = GenAuthSdkOrganizationDto;

/** 创建或修改分组 */
export type GenAuthCreateOrUpdateGroupInput = (GenAuthSdkCreateOrUpdateGroupReqDto) | (GenAuthCreateOrUpdateGroupReqDto);
export type GenAuthCreateOrUpdateGroupResult = GenAuthSdkCreateOrUpdateGroupDataDto;

/** 创建权限空间 */
export type GenAuthCreatePermissionNamespaceInput = (GenAuthSdkCreatePermissionNamespaceDto) | (GenAuthCreatePermissionNamespaceDto);
export type GenAuthCreatePermissionNamespaceResult = GenAuthSdkCreatePermissionNamespaceRespDto;

/** 批量创建权限空间 */
export type GenAuthCreatePermissionNamespacesBatchInput = (GenAuthSdkCreatePermissionNamespacesBatchDto) | (GenAuthCreatePermissionNamespacesBatchDto);
export type GenAuthCreatePermissionNamespacesBatchResult = GenAuthSdkIsSuccessDto;

/** 创建 Pipeline 函数 */
export type GenAuthCreatePipelineFunctionInput = (GenAuthSdkCreatePipelineFunctionDto) | (GenAuthCreatePipelineFunctionDto);
export type GenAuthCreatePipelineFunctionResult = GenAuthSdkPipelineFunctionDto;

/** 创建岗位 */
export type GenAuthCreatePostInput = GenAuthSdkCreatePostDto;
export type GenAuthCreatePostResult = GenAuthSdkPostInfoDto;

/** 创建编程访问账号 */
export type GenAuthCreateProgrammaticAccessAccountInput = GenAuthCreateProgrammaticAccessAccountRequestDto;
export type GenAuthCreateProgrammaticAccessAccountResult = GenAuthProgrammaticAccessAccountDto;

/** 创建公共账号 */
export type GenAuthCreatePublicAccountInput = GenAuthSdkCreatePublicAccountReqDto;
export type GenAuthCreatePublicAccountResult = GenAuthSdkPublicAccountDto;

/** 批量创建公共账号 */
export type GenAuthCreatePublicAccountsBatchInput = GenAuthSdkCreatePublicAccountBatchReqDto;
export type GenAuthCreatePublicAccountsBatchResult = (GenAuthSdkPublicAccountDto)[];

/** 创建资源 */
export type GenAuthCreateResourceInput = (GenAuthSdkCreateResourceDto) | (GenAuthCreateResourceDto);
export type GenAuthCreateResourceResult = GenAuthSdkResourceDto;

/** 批量创建资源 */
export type GenAuthCreateResourcesBatchInput = (GenAuthSdkCreateResourcesBatchDto) | (GenAuthCreateResourcesBatchDto);
export type GenAuthCreateResourcesBatchResult = GenAuthSdkIsSuccessDto;

/** 创建角色 */
export type GenAuthCreateRoleInput = (GenAuthSdkCreateRoleDto) | (GenAuthCreateRoleDto);
export type GenAuthCreateRoleResult = GenAuthSdkRoleDto;

/** 批量创建角色 */
export type GenAuthCreateRolesBatchInput = (GenAuthSdkCreateRolesBatch) | (GenAuthCreateRolesBatch);
export type GenAuthCreateRolesBatchResult = GenAuthSdkIsSuccessDto;

/** 添加行 */
export type GenAuthCreateRowInput = GenAuthSdkCreateRowDto;
export type GenAuthCreateRowResult = GenAuthSdkRowDto;

/** 创建行关联数据 */
export type GenAuthCreateRowRelationInput = GenAuthSdkCreateRelationValueDto;
export type GenAuthCreateRowRelationResult = GenAuthSdkCommonResponseDto;

/** 创建字符串数据资源 */
export type GenAuthCreateStringDataResourceInput = GenAuthCreateStringDataResourceDto;
export type GenAuthCreateStringDataResourceResult = GenAuthCreateStringDataResourceRespDto;

/** 创建同步任务 */
export type GenAuthCreateSyncTaskInput = (GenAuthSdkCreateSyncTaskDto) | (GenAuthCreateSyncTaskDto);
export type GenAuthCreateSyncTaskResult = GenAuthSdkSyncTaskPagingDto;

/** 创建租户 */
export type GenAuthCreateTenantInput = (GenAuthSdkCreateTenantDto) | (GenAuthCreateTenantDto);
export type GenAuthCreateTenantResult = GenAuthSdkTenantDto;

/** 创建协调管理员 */
export type GenAuthCreateTenantCooperatorInput = (GenAuthSdkCreateTenantCooperatorDto) | (GenAuthCreateTenantCooperatorDto);
export type GenAuthCreateTenantCooperatorResult = GenAuthSdkCommonResponseDto;

/** 创建租户企业认证 */
export type GenAuthCreateTenantEnterpriseCertificationInput = (GenAuthSdkCreateTenantEnterpriseCertificationBodyDto) | (GenAuthCreateTenantEnterpriseCertificationBodyDto);
export type GenAuthCreateTenantEnterpriseCertificationResult = GenAuthSdkIsSuccessDto;

/** 创建租户成员 */
export type GenAuthCreateTenantUserInput = (GenAuthSdkCreateTenantUserReqDto) | (GenAuthCreateTenantUserReqDto);
export type GenAuthCreateTenantUserResult = GenAuthSdkTenantUserDto;

/** 创建树数据资源 */
export type GenAuthCreateTreeDataResourceInput = GenAuthCreateTreeDataResourceDto;
export type GenAuthCreateTreeDataResourceResult = GenAuthCreateTreeDataResourceRespDto;

/** 创建用户 */
export type GenAuthCreateUserInput = (GenAuthSdkCreateUserReqDto) | (GenAuthCreateUserReqDto);
export type GenAuthCreateUserResult = GenAuthSdkUserDto;

/** 批量创建用户 */
export type GenAuthCreateUsersBatchInput = (GenAuthSdkCreateUserBatchReqDto) | (GenAuthCreateUserBatchReqDto);
export type GenAuthCreateUsersBatchResult = (GenAuthSdkUserDto)[];

/** 新增 verify 设备 */
export type GenAuthCreateVerifyDeviceInput = GenAuthSdkCreateTerminalDto;
export type GenAuthCreateVerifyDeviceResult = GenAuthSdkTerminalInfoDto;

/** 创建 Webhook */
export type GenAuthCreateWebhookInput = (GenAuthSdkCreateWebhookDto) | (GenAuthCreateWebhookDto);
export type GenAuthCreateWebhookResult = GenAuthSdkWebhookDto;

/** 停用全部 Session */
export type GenAuthDeactivateAllSessionsInput = GenAuthDeactivateAllSessionsByViewRequestDto;
export type GenAuthDeactivateAllSessionsResult = GenAuthIsSuccessDto;

/** 批量停用 Session */
export type GenAuthDeactivateSessionsBatchInput = GenAuthDeactivateSessionsRequestDto;
export type GenAuthDeactivateSessionsBatchResult = GenAuthIsSuccessDto;

/** 定义自定义事件 */
export type GenAuthDefineEventInput = GenAuthSdkDefineEventDto;
export type GenAuthDefineEventResult = GenAuthSdkCommonResponseDto;

/** 删除协作管理员的 AK/SK */
export type GenAuthDeleteAccessKeyInput = (GenAuthSdkDeleteAccessKeyDto) | (GenAuthDeleteAccessKeyDto);
export type GenAuthDeleteAccessKeyResult = GenAuthSdkCommonResponseDto;

/** 删除管理员自定义角色 */
export type GenAuthDeleteAdminRolesInput = GenAuthDeleteAdminRoleDto;
export type GenAuthDeleteAdminRolesResult = GenAuthIsSuccessDto;

/** 删除管理员自定义角色 */
export type GenAuthDeleteAdminRolesBatchInput = GenAuthSdkDeleteAdminRoleDto;
export type GenAuthDeleteAdminRolesBatchResult = GenAuthSdkIsSuccessDto;

/** 删除应用 */
export type GenAuthDeleteApplicationInput = (GenAuthSdkDeleteApplicationDto) | (GenAuthDeleteApplicationDto);
export type GenAuthDeleteApplicationResult = GenAuthSdkIsSuccessDto;

/** 删除 ASA 账号 */
export type GenAuthDeleteAsaAccountInput = (GenAuthSdkDeleteAsaAccountDto) | (GenAuthDeleteAsaAccountDto);
export type GenAuthDeleteAsaAccountResult = GenAuthSdkIsSuccessDto;

/** 批量删除 ASA 账号 */
export type GenAuthDeleteAsaAccountBatchInput = GenAuthSdkDeleteAsaAccountBatchDto;
export type GenAuthDeleteAsaAccountBatchResult = GenAuthSdkIsSuccessDto;

/** 批量删除 ASA 账号 */
export type GenAuthDeleteAsaAccountsBatchInput = GenAuthDeleteAsaAccountBatchDto;
export type GenAuthDeleteAsaAccountsBatchResult = GenAuthIsSuccessDto;

/** 批量删除应用授权 */
export type GenAuthDeleteAuthInput = { "authIds": (string)[] };
export type GenAuthDeleteAuthResult = GenAuthSdkIsSuccessDto;

/** 删除编排配置 */
export type GenAuthDeleteAuthFlowConfigInput = Record<string, unknown>;
export type GenAuthDeleteAuthFlowConfigResult = GenAuthAsaAccountDto;

/** 删除 AuthFlowFunction 函数 */
export type GenAuthDeleteAuthFlowFunctionInput = GenAuthDeletePipelineFunctionDto;
export type GenAuthDeleteAuthFlowFunctionResult = unknown;

/** 删除 ip 名单 */
export type GenAuthDeleteByIdInput = { "id": string };
export type GenAuthDeleteByIdResult = GenAuthSdkCommonResponseDto;

/** 批量删除常规资源授权列表 */
export type GenAuthDeleteCommonAuthorizeBatchInput = GenAuthDeleteAuthorizeDto;
export type GenAuthDeleteCommonAuthorizeBatchResult = GenAuthIsSuccessDto;

/** 批量删除资源 */
export type GenAuthDeleteCommonResourcesBatchInput = GenAuthDeleteCommonResourcesBatchDto;
export type GenAuthDeleteCommonResourcesBatchResult = GenAuthIsSuccessDto;

/** 删除自定义字段定义 */
export type GenAuthDeleteCustomFieldsInput = (GenAuthSdkDeleteCustomFieldsReqDto) | (GenAuthDeleteCustomFieldsReqDto);
export type GenAuthDeleteCustomFieldsResult = GenAuthSdkIsSuccessDto;

/** 删除数据策略 */
export type GenAuthDeleteDataPolicyInput = (GenAuthSdkDeleteDataPolicyDto) | (GenAuthDeleteDataPolicyDto);
export type GenAuthDeleteDataPolicyResult = GenAuthSdkCommonResponseDto;

/** 删除数据资源 */
export type GenAuthDeleteDataResourceInput = (GenAuthSdkDeleteDataResourceDto) | (GenAuthDeleteDataResourceDto);
export type GenAuthDeleteDataResourceResult = GenAuthSdkCommonResponseDto;

/** 删除部门 */
export type GenAuthDeleteDepartmentInput = (GenAuthSdkDeleteDepartmentReqDto) | (GenAuthDeleteDepartmentReqDto);
export type GenAuthDeleteDepartmentResult = GenAuthSdkIsSuccessDto;

/** 删除部门和子部门 */
export type GenAuthDeleteDepartmentAndChildsInput = GenAuthDeleteDepartmentReqDto;
export type GenAuthDeleteDepartmentAndChildsResult = GenAuthIsSuccessDto;

/** 删除部门同步关联关系 */
export type GenAuthDeleteDepartmentSyncRelationsInput = (GenAuthSdkDeleteDepartmentSyncRelationReqDto) | (GenAuthDeleteDepartmentSyncRelationReqDto);
export type GenAuthDeleteDepartmentSyncRelationsResult = GenAuthSdkIsSuccessDto;

/** 移除绑定(用户详情页) */
export type GenAuthDeleteDeviceInput = GenAuthSdkDeleteTerminalUserDto;
export type GenAuthDeleteDeviceResult = GenAuthSdkCommonResponseDto;

/** 删除树类型资源的扩展字段 */
export type GenAuthDeleteDnefInput = (GenAuthSdkDeleteDnefReq) | (GenAuthDeleteDnefReq);
export type GenAuthDeleteDnefResult = GenAuthSdkIsSuccessDto;

/** 删除身份源 */
export type GenAuthDeleteExtIdpInput = (GenAuthSdkDeleteExtIdpDto) | (GenAuthDeleteExtIdpDto);
export type GenAuthDeleteExtIdpResult = GenAuthSdkIsSuccessDto;

/** 删除身份源连接 */
export type GenAuthDeleteExtIdpConnInput = (GenAuthSdkDeleteExtIdpConnDto) | (GenAuthDeleteExtIdpConnDto);
export type GenAuthDeleteExtIdpConnResult = GenAuthSdkIsSuccessDto;

/** 批量删除分组 */
export type GenAuthDeleteGroupsBatchInput = (GenAuthSdkDeleteGroupsReqDto) | (GenAuthDeleteGroupsReqDto);
export type GenAuthDeleteGroupsBatchResult = GenAuthSdkIsSuccessDto;

/** 删除邀请名单 */
export type GenAuthDeleteInvitationRosterInput = GenAuthSdkDeleteInvitationRosterDto;
export type GenAuthDeleteInvitationRosterResult = GenAuthSdkIsSuccessDto;

/** 批量删除邀请名单 */
export type GenAuthDeleteInvitationRosterBatchInput = GenAuthSdkDeleteInvitationRosterBatchDto;
export type GenAuthDeleteInvitationRosterBatchResult = GenAuthSdkIsSuccessDto;

/** 批量删除名单中的受邀人 */
export type GenAuthDeleteInviteesInput = GenAuthSdkDeleteRosterUsersDto;
export type GenAuthDeleteInviteesResult = GenAuthSdkIsSuccessDto;

/** 删除多租户管理员用户 */
export type GenAuthDeleteMultipleTenantAdminInput = GenAuthDeleteMultipleTenantAdminDto & GenAuthDeleteMultipleTenantAdminBodyDto;
export type GenAuthDeleteMultipleTenantAdminResult = unknown;

/** 删除权限分组信息 */
export type GenAuthDeleteNamespaceInput = (GenAuthSdkDeleteNamespaceDto) | (GenAuthDeleteNamespaceDto);
export type GenAuthDeleteNamespaceResult = GenAuthSdkIsSuccessDto;

/** 批量删除权限分组 */
export type GenAuthDeleteNamespacesBatchInput = (GenAuthSdkDeleteNamespacesBatchDto) | (GenAuthDeleteNamespacesBatchDto);
export type GenAuthDeleteNamespacesBatchResult = GenAuthSdkIsSuccessDto;

/** 删除组织机构 */
export type GenAuthDeleteOrganizationInput = (GenAuthSdkDeleteOrganizationReqDto) | (GenAuthDeleteOrganizationReqDto);
export type GenAuthDeleteOrganizationResult = GenAuthSdkIsSuccessDto;

/** 删除权限空间 */
export type GenAuthDeletePermissionNamespaceInput = (GenAuthSdkDeletePermissionNamespaceDto) | (GenAuthDeletePermissionNamespaceDto);
export type GenAuthDeletePermissionNamespaceResult = GenAuthSdkIsSuccessDto;

/** 批量删除权限空间 */
export type GenAuthDeletePermissionNamespacesBatchInput = (GenAuthSdkDeletePermissionNamespacesBatchDto) | (GenAuthDeletePermissionNamespacesBatchDto);
export type GenAuthDeletePermissionNamespacesBatchResult = GenAuthSdkIsSuccessDto;

/** 删除 Pipeline 函数 */
export type GenAuthDeletePipelineFunctionInput = (GenAuthSdkDeletePipelineFunctionDto) | (GenAuthDeletePipelineFunctionDto);
export type GenAuthDeletePipelineFunctionResult = GenAuthSdkCommonResponseDto;

/** 删除编程访问账号 */
export type GenAuthDeleteProgrammaticAccessAccountInput = GenAuthDeleteProgrammaticAccessAccountRequestDto;
export type GenAuthDeleteProgrammaticAccessAccountResult = GenAuthIsSuccessDto;

/** 批量删除公共账号 */
export type GenAuthDeletePublicAccountsBatchInput = GenAuthSdkDeletePublicAccountsBatchDto;
export type GenAuthDeletePublicAccountsBatchResult = GenAuthSdkIsSuccessDto;

/** 删除资源 */
export type GenAuthDeleteResourceInput = (GenAuthSdkDeleteResourceDto) | (GenAuthDeleteResourceDto);
export type GenAuthDeleteResourceResult = GenAuthSdkIsSuccessDto;

/** 批量删除资源 */
export type GenAuthDeleteResourcesBatchInput = (GenAuthSdkDeleteResourcesBatchDto) | (GenAuthDeleteResourcesBatchDto);
export type GenAuthDeleteResourcesBatchResult = GenAuthSdkIsSuccessDto;

/** 删除风险策略 */
export type GenAuthDeleteRiskListPolicyByIdInput = { "id": string };
export type GenAuthDeleteRiskListPolicyByIdResult = GenAuthSdkCommonResponseDto;

/** 跨权限分组（空间）删除角色 */
export type GenAuthDeleteRolesInput = GenAuthSdkDeleteRoleBatchDto;
export type GenAuthDeleteRolesResult = GenAuthSdkIsSuccessDto;

/** 单个权限分组（权限空间）内删除角色 */
export type GenAuthDeleteRolesBatchInput = (GenAuthSdkDeleteRoleDto) | (GenAuthDeleteRoleDto);
export type GenAuthDeleteRolesBatchResult = GenAuthSdkIsSuccessDto;

/** 删除租户 */
export type GenAuthDeleteTenantInput = (GenAuthSdkDeleteTenantDto) | (GenAuthDeleteTenantDto);
export type GenAuthDeleteTenantResult = GenAuthSdkIsSuccessDto;

/** 取消设置租户管理员 */
export type GenAuthDeleteTenantAdminInput = (GenAuthSdkGetTenantUserDto) | (GenAuthGetTenantUserDto);
export type GenAuthDeleteTenantAdminResult = GenAuthSdkCommonResponseDto;

/** 删除协调管理员 */
export type GenAuthDeleteTenantCooperatorInput = GenAuthDeleteTenantCooperatorDto & GenAuthDeleteTenantCooperatorBodyDto;
export type GenAuthDeleteTenantCooperatorResult = unknown;

/** 批量移除租户成员 */
export type GenAuthDeleteTenantUserInput = (GenAuthSdkRemoveTenantUsersDto) | (GenAuthRemoveTenantUsersDto);
export type GenAuthDeleteTenantUserResult = GenAuthSdkCommonResponseDto;

/** 删除用户名单 */
export type GenAuthDeleteUserListByIdInput = { "id": string };
export type GenAuthDeleteUserListByIdResult = GenAuthSdkCommonResponseDto;

/** 批量删除用户 */
export type GenAuthDeleteUsersBatchInput = (GenAuthSdkDeleteUsersBatchDto) | (GenAuthDeleteUsersBatchDto);
export type GenAuthDeleteUsersBatchResult = GenAuthSdkIsSuccessDto;

/** 删除用户同步关联关系 */
export type GenAuthDeleteUserSyncRelationsInput = (GenAuthSdkDeleteUserSyncRelationReqDto) | (GenAuthDeleteUserSyncRelationReqDto);
export type GenAuthDeleteUserSyncRelationsResult = GenAuthSdkIsSuccessDto;

/** 删除 Webhook */
export type GenAuthDeleteWebhookInput = (GenAuthSdkDeleteWebhookDto) | (GenAuthDeleteWebhookDto);
export type GenAuthDeleteWebhookResult = GenAuthSdkIsSuccessDto;

/** 删除注册白名单 */
export type GenAuthDeleteWhitelistInput = (GenAuthSdkDeleteWhitelistDto) | (GenAuthDeleteWhitelistDto);
export type GenAuthDeleteWhitelistResult = GenAuthSdkIsSuccessDto;

/** 删除应用注册白名单 */
export type GenAuthDeleteWhitelistOfAppInput = (GenAuthSdkDeleteWhitelistOfAppDto) | (GenAuthDeleteWhitelistOfAppDto);
export type GenAuthDeleteWhitelistOfAppResult = GenAuthSdkIsSuccessDto;

/** 主体授权详情 */
export type GenAuthDetailAuthSubjectInput = GenAuthSdkObject100;
export type GenAuthDetailAuthSubjectResult = GenAuthSdkGetSubjectAuthDataDto;

/** 关闭编排 */
export type GenAuthDisabledAuthFlowAppInput = GenAuthCreateAuthFlowAppConfigDto;
export type GenAuthDisabledAuthFlowAppResult = GenAuthCreateApplicationRespDataDto;

/** 停用设备(用户详情页) */
export type GenAuthDisableDeviceInput = GenAuthSdkUpdateTerminalUserDto;
export type GenAuthDisableDeviceResult = GenAuthSdkCommonResponseDto;

/** 关闭全局多因素认证配置 */
export type GenAuthDisableGlobalMfaSettingsInput = GenAuthMFADisableSettingsDto;
export type GenAuthDisableGlobalMfaSettingsResult = GenAuthMFASettingsDto;

/** 关闭 LDAP server 服务，关闭前必须先初始化 */
export type GenAuthDisableLdapServerInput = GenAuthSdkLdapSetEnabledFlagDto;
export type GenAuthDisableLdapServerResult = boolean;

/** 禁用编程访问账号 */
export type GenAuthDisableProgrammaticAccessAccountInput = GenAuthDisableOrEnableProgrammaticAccessAccountRequestDto;
export type GenAuthDisableProgrammaticAccessAccountResult = GenAuthProgrammaticAccessAccountDto;

/** 部门模糊查询 */
export type GenAuthDynamicGroupSearchPartInput = GenAuthDynamicGroupSearchPartDto;
export type GenAuthDynamicGroupSearchPartResult = GenAuthPartListDto;

/** 更新授权开关 */
export type GenAuthEnabledAuthInput = GenAuthSdkUpdateAuthEnabledDto;
export type GenAuthEnabledAuthResult = GenAuthSdkIsSuccessDto;

/** 开启编排 */
export type GenAuthEnabledAuthFlowAppInput = GenAuthEnabledAuthFlowAppConfigDto;
export type GenAuthEnabledAuthFlowAppResult = GenAuthCreateApplicationRespDataDto;

/** 启用设备(用户详情页) */
export type GenAuthEnableDeviceInput = GenAuthSdkUpdateTerminalUserDto;
export type GenAuthEnableDeviceResult = GenAuthSdkCommonResponseDto;

/** 启用编程访问账号 */
export type GenAuthEnableProgrammaticAccessAccountInput = GenAuthDisableOrEnableProgrammaticAccessAccountRequestDto;
export type GenAuthEnableProgrammaticAccessAccountResult = GenAuthProgrammaticAccessAccountDto;

/** 执行自定义操作 */
export type GenAuthExecuteOperateInput = GenAuthSdkFunctionModelOperateIdDto;
export type GenAuthExecuteOperateResult = GenAuthSdkCommonResponseDto;

/** 导出全部数据 */
export type GenAuthExportMetadataInput = GenAuthSdkExportModelDto;
export type GenAuthExportMetadataResult = GenAuthSdkCommonResponseDto;

/** 导出数据对象 */
export type GenAuthExportModelInput = GenAuthSdkExportMetadataDto;
export type GenAuthExportModelResult = GenAuthSdkCommonResponseDto;

/** 导出名单内受邀人 */
export type GenAuthExportUsersInput = GenAuthSdkExportUsersDto;
export type GenAuthExportUsersResult = GenAuthSdkImportExportTemplateRespDto;

/** 身份源下应用的连接详情 */
export type GenAuthExtIdpConnAppsInput = GenAuthGetExtIdpDto;
export type GenAuthExtIdpConnAppsResult = GenAuthExtIdpListPagingDto;

/** 身份源下应用的连接详情 */
export type GenAuthExtIdpConnStateByAppsInput = GenAuthSdkObject85;
export type GenAuthExtIdpConnStateByAppsResult = GenAuthSdkExtIdpListPagingDto;

/** 查询通用邀请申请列表 */
export type GenAuthFilterInput = GenAuthSdkPaginationUniversalInvitationApplicantQueryDto;
export type GenAuthFilterResult = GenAuthSdkPaginationUniversalInvitationApplicantDataDto;

/** 查看名单内受邀人 */
export type GenAuthFilterUsersInput = GenAuthSdkListInvitationUserDto;
export type GenAuthFilterUsersResult = GenAuthSdkInvitationUserPaginationDto;

/** 获取支持设备互斥生效范围的应用列表 */
export type GenAuthFindAppListsInput = GenAuthSdkObject149;
export type GenAuthFindAppListsResult = (GenAuthSdkDeviceExclusiveValidScopeAppDataDto)[];

/** 获取 ip 列表 */
export type GenAuthFindIpListInput = GenAuthSdkObject146;
export type GenAuthFindIpListResult = GenAuthSdkIpListPagingDto;

/** 最近登录应用 */
export type GenAuthFindLastLoginAppsByDeviceIdsInput = GenAuthSdkQueryTerminalAppsDto;
export type GenAuthFindLastLoginAppsByDeviceIdsResult = GenAuthSdkCommonResponseDto;

/** 最近登录应用 */
export type GenAuthFindLastLoginAppsByDeviceIdsV2Input = GenAuthSdkQueryTerminalAppsDto;
export type GenAuthFindLastLoginAppsByDeviceIdsV2Result = GenAuthSdkCommonResponseDto;

/** 获取风险策略列表 */
export type GenAuthFindRiskListPolicyInput = GenAuthSdkObject148;
export type GenAuthFindRiskListPolicyResult = GenAuthSdkRiskListPolicyPagingDto;

/** 获取风险名单用户列表 */
export type GenAuthFindUserListInput = GenAuthSdkObject147;
export type GenAuthFindUserListResult = GenAuthSdkUserListPagingDto;

/** 生成一个邀请租户成员的链接 */
export type GenAuthGenerateInviteTenantUserLinkInput = (GenAuthSdkGenerateInviteTenantUserLink) | (GenAuthGenerateInviteTenantUserLink);
export type GenAuthGenerateInviteTenantUserLinkResult = GenAuthSdkInviteTenantUsersDto;

/** 生成通用邀请链接 */
export type GenAuthGenerateUniversalInvitationInput = Record<never, never>;
export type GenAuthGenerateUniversalInvitationResult = GenAuthSdkGenerateInvitationLinkDto;

/** 获取协作管理员 AK/SK 详细信息 */
export type GenAuthGetAccessKeyInput = (GenAuthSdkObject162) | (GenAuthGetAccessKeyDto);
export type GenAuthGetAccessKeyResult = (GenAuthSdkGetAccessKeyRespDto)[];

/** 获取协作管理员 AK/SK 列表 */
export type GenAuthGetAccessKeyListInput = GenAuthSdkObject161;
export type GenAuthGetAccessKeyListResult = (GenAuthSdkListAccessKeyRespDto)[];

/** 获取管理员操作日志 */
export type GenAuthGetAdminAuditLogsInput = (GenAuthSdkGetAdminAuditLogsDto) | (GenAuthGetAdminAuditLogsDto);
export type GenAuthGetAdminAuditLogsResult = GenAuthSdkAdminAuditLogRespData;

/** 获取所有部门列表 */
export type GenAuthGetAllDepartmentsInput = (GenAuthSdkObject23) | (GenAuthGetAllDepartmentsDto);
export type GenAuthGetAllDepartmentsResult = GenAuthSdkDepartmentPagingDto;

/** 获取所有分组 */
export type GenAuthGetAllGroupsInput = (GenAuthSdkObject73) | (GenAuthGetAllGroupsDto);
export type GenAuthGetAllGroupsResult = (GenAuthSdkGroupDto)[];

/** 获取全部数据对象数据 */
export type GenAuthGetAllMetadataInput = GenAuthSdkGetAllRowDto;
export type GenAuthGetAllMetadataResult = GenAuthSdkFunctionModelValueListDto;

/** 获取全部元数据行信息 */
export type GenAuthGetAllMetadataRowInput = GenAuthSdkGetAllRowVyScrollidDto;
export type GenAuthGetAllMetadataRowResult = GenAuthSdkGetAllRowByScrollidDto;

/** 获取所有权益 */
export type GenAuthGetAllRightsItemInput = Record<never, never>;
export type GenAuthGetAllRightsItemResult = GenAuthSdkRightItemRes;

/** 获取设备互斥生效范围配置 */
export type GenAuthGetAllValidScopeSettingsInput = Record<never, never>;
export type GenAuthGetAllValidScopeSettingsResult = (GenAuthSdkGetDeviceExclusiveValidScopeDataDto)[];

/** 获取设备互斥白名单配置 */
export type GenAuthGetAllWhiteListSettingsInput = Record<never, never>;
export type GenAuthGetAllWhiteListSettingsResult = (GenAuthSdkGetDeviceExclusiveWhiteListDataDto)[];

/** 获取应用详情 */
export type GenAuthGetApplicationInput = (GenAuthSdkObject99) | (GenAuthGetApplicationDto);
export type GenAuthGetApplicationResult = GenAuthSdkApplicationDto;

/** 获取应用访问控制用户列表 */
export type GenAuthGetApplicationAccessControlUserListInput = GenAuthGetApplicationAccessControlUserListDto;
export type GenAuthGetApplicationAccessControlUserListResult = GenAuthUserPagingDto;

/** 获取应用默认访问授权策略 */
export type GenAuthGetApplicationPermissionStrategyInput = (GenAuthSdkObject105) | (GenAuthGetApplicationPermissionStrategyDto);
export type GenAuthGetApplicationPermissionStrategyResult = GenAuthSdkGetApplicationPermissionStrategyDataDto;

/** 获取应用密钥 */
export type GenAuthGetApplicationSecretInput = (GenAuthSdkObject104) | (GenAuthGetApplicationSecretDto);
export type GenAuthGetApplicationSecretResult = GenAuthSdkGetApplicationSecretDataDto;

/** 获取应用简单信息 */
export type GenAuthGetApplicationSimpleInfoInput = (GenAuthSdkObject102) | (GenAuthGetApplicationSimpleInfoDto);
export type GenAuthGetApplicationSimpleInfoResult = GenAuthSdkApplicationSimpleInfoDto;

/** 获取 ASA 账号 */
export type GenAuthGetAsaAccountInput = (GenAuthSdkObject109) | (GenAuthGetAsaAccountDto);
export type GenAuthGetAsaAccountResult = GenAuthSdkAsaAccountDto;

/** 获取 ASA 账号分配的主体列表 */
export type GenAuthGetAsaAccountAssignedTargetsInput = (GenAuthSdkObject110) | (GenAuthGetAsaAccountAssignmentsDto);
export type GenAuthGetAsaAccountAssignedTargetsResult = GenAuthSdkGetAsaAccountAssignedTargetDataDto;

/** 批量获取 ASA 账号 */
export type GenAuthGetAsaAccountBatchInput = GenAuthSdkGetAsaAccountBatchDto;
export type GenAuthGetAsaAccountBatchResult = (GenAuthSdkAsaAccountDto)[];

/** 批量获取 ASA 账号 */
export type GenAuthGetAsaAccountsBatchInput = GenAuthGetAsaAccountBatchDto;
export type GenAuthGetAsaAccountsBatchResult = (GenAuthAsaAccountDto)[];

/** 获取主体被分配的 ASA 账号 */
export type GenAuthGetAssignedAccountInput = (GenAuthSdkObject111) | (GenAuthAssignedAsaAccountReqDto);
export type GenAuthGetAssignedAccountResult = GenAuthSdkAsaAccountDto;

/** 获取指定编排配置 */
export type GenAuthGetAuthFlowConfigInput = { "flowId": string } & { "appId": string };
export type GenAuthGetAuthFlowConfigResult = GenAuthAsaAccountDto;

/** 获取应用编排配置列表 */
export type GenAuthGetAuthFlowConfigByAppIdInput = { "appId": string } & { "page"?: number } & { "limit"?: number };
export type GenAuthGetAuthFlowConfigByAppIdResult = GenAuthAsaAccountDto;

/** 获取 AuthFlowFunction 函数详情 */
export type GenAuthGetAuthFlowFunctionInput = GenAuthGetPipelineFunctionDto;
export type GenAuthGetAuthFlowFunctionResult = GenAuthPipelineFunctionDto;

/** 获取某个主体被授权的资源列表 */
export type GenAuthGetAuthorizedResourcesInput = (GenAuthSdkObject98) | (GenAuthGetAuthorizedResourcesDto);
export type GenAuthGetAuthorizedResourcesResult = GenAuthSdkAuthorizedResourcePagingDto;

/** 生成 LDAP Server 管理员密码 */
export type GenAuthGetBindPwdInput = Record<never, never>;
export type GenAuthGetBindPwdResult = string;

/** 获取当前编排配置 */
export type GenAuthGetCurrentAuthFlowConfigInput = { "appId": string };
export type GenAuthGetCurrentAuthFlowConfigResult = GenAuthAsaAccountDto;

/** 获取套餐详情 */
export type GenAuthGetCurrentPackageInfoInput = Record<never, never>;
export type GenAuthGetCurrentPackageInfoResult = GenAuthSdkCostCurrentPackageInfo;

/** 获取用户、分组、角色、组织机构的自定义字段值 */
export type GenAuthGetCustomDataInput = (GenAuthSdkObject89) | (GenAuthGetCustomDataDto);
export type GenAuthGetCustomDataResult = unknown;

/** 获取自定义字段列表 */
export type GenAuthGetCustomFieldsInput = (GenAuthSdkObject87) | (GenAuthGetUserDefinedFieldsDto);
export type GenAuthGetCustomFieldsResult = (GenAuthSdkCustomFieldDto)[];

/** 获取数据策略详情 */
export type GenAuthGetDataPolicyInput = (GenAuthSdkObject136) | (GenAuthGetDataPolicyDto);
export type GenAuthGetDataPolicyResult = GenAuthSdkGetDataPolicyRespDto;

/** 获取数据资源详情 */
export type GenAuthGetDataResourceInput = (GenAuthSdkObject131) | (GenAuthGetDataResourceDto);
export type GenAuthGetDataResourceResult = GenAuthSdkGetDataResourceRespDto;

/** 获取部门信息 */
export type GenAuthGetDepartmentInput = (GenAuthSdkObject21) | (GenAuthGetDepartmentReqDto);
export type GenAuthGetDepartmentResult = GenAuthSdkDepartmentDto;

/** 部门被授权的应用列表 */
export type GenAuthGetDepartmentAllAppInput = GenAuthSdkGetDepartmentByIdReqDto;
export type GenAuthGetDepartmentAllAppResult = GenAuthSdkDepartmentDto;

/** 部门被授权的应用列表 */
export type GenAuthGetDepartmentAvailableAppInput = GenAuthGetDepartmentByIdReqDto;
export type GenAuthGetDepartmentAvailableAppResult = GenAuthDepartmentDto;

/** 根据部门id查询部门 */
export type GenAuthGetDepartmentByIdInput = (GenAuthSdkObject29) | (GenAuthGetDepartmentByIdReqDto);
export type GenAuthGetDepartmentByIdResult = GenAuthSdkDepartmentDto;

/** 获取部门绑定的第三方同步关系 */
export type GenAuthGetDepartmentSyncRelationsInput = (GenAuthSdkObject30) | (GenAuthGetDepartmentSyncRelationsReqDto);
export type GenAuthGetDepartmentSyncRelationsResult = (GenAuthSdkUserSyncRelationDto)[];

/** 获取审批详情 */
export type GenAuthGetDetailInput = GenAuthSdkObject150;
export type GenAuthGetDetailResult = GenAuthSdkApprovalDetailDto;

/** 获取设备状态 */
export type GenAuthGetDeviceStatusInput = GenAuthSdkTerminalBaseDto;
export type GenAuthGetDeviceStatusResult = undefined | GenAuthSdkDeviceStatusResponseDataDto;

/** 查询动态分组匹配规则 */
export type GenAuthGetDynamicGroupMatchInput = GenAuthGetDynamicGroupMatchDto;
export type GenAuthGetDynamicGroupMatchResult = GenAuthDynamicGroupMatchDto;

/** 获取第三方邮件服务配置 */
export type GenAuthGetEmailProviderInput = Record<never, never>;
export type GenAuthGetEmailProviderResult = GenAuthSdkEmailProviderDto;

/** 获取邮件模版列表 */
export type GenAuthGetEmailTemplatesInput = Record<never, never>;
export type GenAuthGetEmailTemplatesResult = GenAuthSdkGetEmailTemplatesDataDto;

/** 获取外部用户拥有指定资源的权限及资源结构信息 */
export type GenAuthGetExternalUserResourceStructInput = (GenAuthSdkGetExternalUserResourceStructDto) | (GenAuthGetExternalUserResourceStructDto);
export type GenAuthGetExternalUserResourceStructResult = GenAuthSdkGetExternalUserResourceStructDataDto;

/** 获取身份源详情 */
export type GenAuthGetExtIdpInput = (GenAuthSdkObject83) | (GenAuthGetExtIdpDto);
export type GenAuthGetExtIdpResult = GenAuthSdkExtIdpDetail;

/** 获取全局多因素认证配置 */
export type GenAuthGetGlobalMfaSettingsInput = (Record<never, never>) | (Record<never, never>);
export type GenAuthGetGlobalMfaSettingsResult = GenAuthSdkMFASettingsDto;

/** 获取分组详情 */
export type GenAuthGetGroupInput = (GenAuthSdkObject71) | (GenAuthGetGroupDto);
export type GenAuthGetGroupResult = GenAuthSdkGroupDto;

/** 获取分组被授权的资源列表 */
export type GenAuthGetGroupAuthorizedResourcesInput = (GenAuthSdkObject75) | (GenAuthGetGroupAuthorizedResourcesDto);
export type GenAuthGetGroupAuthorizedResourcesResult = (GenAuthSdkAuthorizedResourceDto)[];

/** 获取公共账号分组列表 */
export type GenAuthGetGroupsOfPublicAccountInput = GenAuthSdkObject53;
export type GenAuthGetGroupsOfPublicAccountResult = GenAuthSdkGroupPagingDto;

/** 获取导入模板 */
export type GenAuthGetImportTemplateInput = GenAuthSdkObject9;
export type GenAuthGetImportTemplateResult = GenAuthSdkRowDto;

/** 获取邀请名单详情 */
export type GenAuthGetInvitationRosterInput = GenAuthSdkObject70;
export type GenAuthGetInvitationRosterResult = GenAuthSdkInvitationRosterDto;

/** 获取邀请策略邮件模板 */
export type GenAuthGetInviteEmailTemplateInput = GenAuthSdkEmailTemplateQueryDto;
export type GenAuthGetInviteEmailTemplateResult = GenAuthSdkEmailTemplateDto;

/** 获取 m2m 权限列表 */
export type GenAuthGetM2mPermissionListInput = GenAuthGetM2MPermissionListDto;
export type GenAuthGetM2mPermissionListResult = GenAuthGetM2mPermissionListDataDto;

/** 获取m2m拥有某些资源的权限列表（推荐） */
export type GenAuthGetM2mResourcePermissionListInput = GenAuthGetM2mResourcePermissionListDto;
export type GenAuthGetM2mResourcePermissionListResult = GenAuthGetM2mResourcePermissionListDataDto;

/** 获取m2m拥有指定资源的权限及资源结构信息 */
export type GenAuthGetM2mResourceStructInput = GenAuthGetM2mResourceStructDto;
export type GenAuthGetM2mResourceStructResult = GenAuthGetM2mResourceStructDataDto;

/** 获取 MAU 使用记录 */
export type GenAuthGetMauPeriodUsageHistoryInput = GenAuthSdkObject139;
export type GenAuthGetMauPeriodUsageHistoryResult = GenAuthSdkMauPeriodUsageHistory;

/** 获取元数据关联群组信息 */
export type GenAuthGetMetadataGroupListInput = GenAuthSdkMetadataGroupDto;
export type GenAuthGetMetadataGroupListResult = GenAuthSdkFunctionModelValueListDto;

/** 获取用户 MFA 状态 */
export type GenAuthGetMfaStatusInput = GenAuthGetMfaStatusDto;
export type GenAuthGetMfaStatusResult = GenAuthGetMfaInfoDataDto;

/** 获取应用下用户 MFA 触发数据 */
export type GenAuthGetMfaTriggerDataInput = (GenAuthSdkObject107) | (GenAuthGetMfaInfoDto);
export type GenAuthGetMfaTriggerDataResult = GenAuthSdkGetMfaInfoDataDto;

/** 获取数据对象详情 */
export type GenAuthGetModelInput = GenAuthSdkObject7;
export type GenAuthGetModelResult = GenAuthSdkFunctionModelDto;

/** 获取多租户管理员用户列表 */
export type GenAuthGetMultipleTenantAdminInput = (GenAuthSdkObject119) | (GenAuthGetMultipleTenantAdminDto);
export type GenAuthGetMultipleTenantAdminResult = GenAuthSdkMultipleTenantAdminListPagingDto;

/** 获取权限分组详情 */
export type GenAuthGetNamespaceInput = (GenAuthSdkObject94) | (GenAuthGetNamespaceDto);
export type GenAuthGetNamespaceResult = GenAuthSdkNamespaceDto;

/** 批量获取权限分组详情 */
export type GenAuthGetNamespacesBatchInput = (GenAuthSdkObject95) | (GenAuthGetNamespacesBatchDto);
export type GenAuthGetNamespacesBatchResult = (GenAuthSdkNamespaceDto)[];

/** 获取订单详情 */
export type GenAuthGetOrderDetailInput = GenAuthSdkObject141;
export type GenAuthGetOrderDetailResult = GenAuthSdkOrderItem;

/** 获取订单支付明细 */
export type GenAuthGetOrderPayDetailInput = GenAuthSdkObject142;
export type GenAuthGetOrderPayDetailResult = GenAuthSdkCostGetOrderPayDetail;

/** 获取订单列表 */
export type GenAuthGetOrdersInput = GenAuthSdkObject140;
export type GenAuthGetOrdersResult = GenAuthSdkGetOrdersRes;

/** 获取组织机构详情 */
export type GenAuthGetOrganizationInput = (GenAuthSdkObject17) | (GenAuthGetOrganizationDto);
export type GenAuthGetOrganizationResult = GenAuthSdkOrganizationDto;

/** 批量获取组织机构详情 */
export type GenAuthGetOrganizationBatchInput = GenAuthGetOrganizationBatchDto;
export type GenAuthGetOrganizationBatchResult = (GenAuthOrganizationDto)[];

/** 批量获取组织机构详情 */
export type GenAuthGetOrganizationsBatchInput = GenAuthSdkObject18;
export type GenAuthGetOrganizationsBatchResult = (GenAuthSdkOrganizationDto)[];

/** 获取用户绑定 OTP 的秘钥 */
export type GenAuthGetOtpSecretByUserInput = (GenAuthSdkObject47) | (GenAuthGetOtpSecretDto);
export type GenAuthGetOtpSecretByUserResult = GenAuthSdkOtpSecretRespDto;

/** 获取父部门信息 */
export type GenAuthGetParentDepartmentInput = (GenAuthSdkObject27) | (GenAuthGetParentDepartmentReqDto);
export type GenAuthGetParentDepartmentResult = GenAuthSdkDepartmentDto;

/** 获取权限空间详情 */
export type GenAuthGetPermissionNamespaceInput = (GenAuthSdkObject126) | (GenAuthGetPermissionNamespaceDto);
export type GenAuthGetPermissionNamespaceResult = GenAuthSdkGetPermissionNamespaceRespDto;

/** 批量获取权限空间详情列表 */
export type GenAuthGetPermissionNamespacesBatchInput = (GenAuthSdkObject127) | (GenAuthGetPermissionNamespacesBatchDto);
export type GenAuthGetPermissionNamespacesBatchResult = (GenAuthSdkGetPermissionNamespaceRespDto)[];

/** 获取 Pipeline 函数详情 */
export type GenAuthGetPipelineFunctionInput = (GenAuthSdkObject154) | (GenAuthGetPipelineFunctionDto);
export type GenAuthGetPipelineFunctionResult = GenAuthSdkPipelineFunctionDto;

/** 获取 Pipeline 日志 */
export type GenAuthGetPipelineLogsInput = (GenAuthSdkObject156) | (GenAuthGetPipelineLogsDto);
export type GenAuthGetPipelineLogsResult = GenAuthSdkPipelineFunctionPagingDto;

/** 获取邀请策略详情 */
export type GenAuthGetPolicyDetailByIdInput = GenAuthSdkObject65;
export type GenAuthGetPolicyDetailByIdResult = GenAuthSdkGetInvitationPolicyDto;

/** 获取邀请策略用户归属详情 */
export type GenAuthGetPolicyUserAttributionDetailInput = GenAuthSdkObject67;
export type GenAuthGetPolicyUserAttributionDetailResult = GenAuthSdkUserAttributionDto;

/** 获取岗位 */
export type GenAuthGetPostInput = GenAuthSdkObject2;
export type GenAuthGetPostResult = GenAuthSdkCreatePostDto;

/** 获取岗位信息 */
export type GenAuthGetPostByIdInput = GenAuthSdkGetPostByIdListDto;
export type GenAuthGetPostByIdResult = GenAuthSdkPostDto;

/** 获取公共账号的岗位 */
export type GenAuthGetPostOfPublicUserInput = GenAuthSdkObject56;
export type GenAuthGetPostOfPublicUserResult = GenAuthSdkCreatePostDto;

/** 获取公共账号信息 */
export type GenAuthGetPublicAccountInput = GenAuthSdkObject13;
export type GenAuthGetPublicAccountResult = GenAuthSdkPublicAccountDto;

/** 批量获取公共账号信息 */
export type GenAuthGetPublicAccountBatchInput = GenAuthSdkObject14;
export type GenAuthGetPublicAccountBatchResult = (GenAuthSdkPublicAccountDto)[];

/** 获取公共账号的部门列表 */
export type GenAuthGetPublicAccountDepartmentsInput = GenAuthSdkObject55;
export type GenAuthGetPublicAccountDepartmentsResult = GenAuthSdkUserDepartmentPagingDto;

/** 公共账号添加批量分组 */
export type GenAuthGetPublicAccountOfGroupsInput = GenAuthSdkSetUserGroupsDto;
export type GenAuthGetPublicAccountOfGroupsResult = GenAuthSdkIsSuccessDto;

/** 获取公共账号的角色列表 */
export type GenAuthGetPublicAccountRolesInput = GenAuthSdkObject50;
export type GenAuthGetPublicAccountRolesResult = GenAuthSdkPublicAccountPagingDto;

/** 获取部门的公共账号列表 */
export type GenAuthGetPublicAccountsOfDepartmentInput = GenAuthSdkObject54;
export type GenAuthGetPublicAccountsOfDepartmentResult = GenAuthSdkPublicAccountPagingDto;

/** 获取分组的公共账号列表 */
export type GenAuthGetPublicAccountsOfGroupInput = GenAuthSdkObject52;
export type GenAuthGetPublicAccountsOfGroupResult = GenAuthSdkPublicAccountPagingDto;

/** 获取岗位的公共账号列表 */
export type GenAuthGetPublicAccountsOfPostInput = GenAuthSdkObject57;
export type GenAuthGetPublicAccountsOfPostResult = GenAuthSdkPublicAccountPagingDto;

/** 获取角色的公共账号列表 */
export type GenAuthGetPublicAccountsOfRoleInput = GenAuthSdkObject51;
export type GenAuthGetPublicAccountsOfRoleResult = GenAuthSdkPublicAccountPagingDto;

/** 获取用户的公共账号列表 */
export type GenAuthGetPublicAccountsOfUserInput = GenAuthSdkObject15;
export type GenAuthGetPublicAccountsOfUserResult = GenAuthSdkPublicAccountPagingDto;

/** 获取行关联数据 */
export type GenAuthGetRelationDetailsInput = Record<never, never>;
export type GenAuthGetRelationDetailsResult = GenAuthSdkRelationValueListDto;

/** 获取关联数据详情 */
export type GenAuthGetRelationInfoInput = GenAuthSdkGetRelationInfoDto;
export type GenAuthGetRelationInfoResult = GenAuthSdkCommonResponseDto;

/** 获取行关联数据 */
export type GenAuthGetRelationValueInput = GenAuthSdkObject12;
export type GenAuthGetRelationValueResult = GenAuthSdkRelationValueListDto;

/** 获取资源详情 */
export type GenAuthGetResourceInput = (GenAuthSdkObject90) | (GenAuthGetResourceDto);
export type GenAuthGetResourceResult = GenAuthSdkResourceDto;

/** 获取资源被授权的主体 */
export type GenAuthGetResourceAuthorizedTargetsInput = (GenAuthSdkGetResourceAuthorizedTargetsDto) | (GenAuthGetResourceAuthorizedTargetsDto);
export type GenAuthGetResourceAuthorizedTargetsResult = GenAuthSdkGetResourceAuthorizedTargetDataDto;

/** 批量获取资源详情 */
export type GenAuthGetResourcesBatchInput = (GenAuthSdkObject91) | (GenAuthGetResourcesBatchDto);
export type GenAuthGetResourcesBatchResult = (GenAuthSdkResourceDto)[];

/** 获取角色详情 */
export type GenAuthGetRoleInput = (GenAuthSdkObject76) | (GenAuthGetRoleDto);
export type GenAuthGetRoleResult = GenAuthSdkRoleDto;

/** 获取角色被授权的资源列表 */
export type GenAuthGetRoleAuthorizedResourcesInput = (GenAuthSdkObject77) | (GenAuthRoleAuthorizedResourcesDto);
export type GenAuthGetRoleAuthorizedResourcesResult = GenAuthSdkRoleAuthorizedResourcePagingDto;

/** 获取角色下所拥有的数据策略列表 */
export type GenAuthGetRolePolicyListInput = GenAuthGetRoleDataPolicyDto;
export type GenAuthGetRolePolicyListResult = GenAuthGetRoleDataPolicyListPageDto;

/** 获取数据对象行信息 */
export type GenAuthGetRowInput = GenAuthSdkObject5;
export type GenAuthGetRowResult = GenAuthSdkRowDto;

/** 批量获取行信息 */
export type GenAuthGetRowBatchInput = GenAuthSdkGetRowBatchDto;
export type GenAuthGetRowBatchResult = (GenAuthSdkRowDto)[];

/** 根据属性值获取数据对象行信息 */
export type GenAuthGetRowByValueInput = GenAuthSdkObject6;
export type GenAuthGetRowByValueResult = GenAuthSdkRowDto;

/** 获取设备互斥规则配置 */
export type GenAuthGetRuleSettingsInput = Record<never, never>;
export type GenAuthGetRuleSettingsResult = GenAuthSdkGetDeviceExclusiveRuleDataDto;

/** 获取安全配置 */
export type GenAuthGetSecuritySettingsInput = (Record<never, never>) | (Record<never, never>);
export type GenAuthGetSecuritySettingsResult = GenAuthSdkSecuritySettingsDto;

/** 主体授权详情 */
export type GenAuthGetSubjectAuthDetailInput = GenAuthGetSubjectAuthDetailDto;
export type GenAuthGetSubjectAuthDetailResult = GenAuthGetSubjectAuthDataDto;

/** 获取同步作业详情 */
export type GenAuthGetSyncJobInput = (GenAuthSdkObject60) | (GenAuthGetSyncJobDto);
export type GenAuthGetSyncJobResult = GenAuthSdkSyncJobDto;

/** 获取同步任务详情 */
export type GenAuthGetSyncTaskInput = (GenAuthSdkObject58) | (GenAuthGetSyncTaskDto);
export type GenAuthGetSyncTaskResult = GenAuthSdkSyncTaskDto;

/** 获取租户详情 */
export type GenAuthGetTenantInput = (GenAuthSdkObject114) | (GenAuthGetTenantDto);
export type GenAuthGetTenantResult = GenAuthSdkTenantRespDto;

/** 获取租户详情 */
export type GenAuthGetTenantByCodeInput = (GenAuthSdkObject123) | (GenAuthGetTenantByCodeDto);
export type GenAuthGetTenantByCodeResult = GenAuthSdkTenantRespDto;

/** 获取一个协调管理员 */
export type GenAuthGetTenantCooperatorInput = (GenAuthSdkObject121) | (GenAuthGetTenantCooperatorDto);
export type GenAuthGetTenantCooperatorResult = GenAuthSdkTenantCooperatorSingleDto;

/** 获取一个协调管理员拥有的列表 */
export type GenAuthGetTenantCooperatorMenuInput = (GenAuthSdkObject122) | (GenAuthGetTenantCooperatorDto);
export type GenAuthGetTenantCooperatorMenuResult = GenAuthSdkTenantCooperatorSingleDto;

/** 获取租户企业认证信息 */
export type GenAuthGetTenantEnterpriseCertificationInput = (GenAuthSdkObject124) | ({ "tenant_id": string });
export type GenAuthGetTenantEnterpriseCertificationResult = GenAuthSdkTenantEnterpriseCertificationRespDto;

/** 获取租户一点点的信息 */
export type GenAuthGetTenantLittleInfoInput = (GenAuthSdkObject113) | (GenAuthGetTenantDto);
export type GenAuthGetTenantLittleInfoResult = GenAuthSdkTenantRespDto;

/** 获取单个租户成员 */
export type GenAuthGetTenantUserInput = (GenAuthSdkObject125) | (GenAuthGetTenantUserDto);
export type GenAuthGetTenantUserResult = GenAuthSdkTenantUserDto;

/** 获取通用邀请配置 */
export type GenAuthGetUniversalInvitationInput = GenAuthSdkObject64;
export type GenAuthGetUniversalInvitationResult = GenAuthSdkGetUniversalInvitationDto;

/** 获取用量详情 */
export type GenAuthGetUsageInfoInput = Record<never, never>;
export type GenAuthGetUsageInfoResult = GenAuthSdkCurrentUsageRespDto;

/** 获取用户信息 */
export type GenAuthGetUserInput = (GenAuthSdkObject32) | (GenAuthGetUserDto);
export type GenAuthGetUserResult = GenAuthSdkUserDto;

/** 获取用户可访问的应用 */
export type GenAuthGetUserAccessibleAppsInput = (GenAuthSdkObject41) | (GenAuthGetUserAccessibleAppsReqDto);
export type GenAuthGetUserAccessibleAppsResult = (GenAuthSdkAppDto)[];

/** 获取用户行为日志 */
export type GenAuthGetUserActionLogsInput = (GenAuthSdkGetUserActionLogsDto) | (GenAuthGetUserActionLogsDto);
export type GenAuthGetUserActionLogsResult = GenAuthSdkUserActionLogRespData;

/** 获取设置的用户归属主部门 */
export type GenAuthGetUserAttributionMainDepartmentInput = GenAuthSdkObject69;
export type GenAuthGetUserAttributionMainDepartmentResult = (GenAuthSdkUserAttributionMainDepartmentDto)[];

/** 获取用户授权的应用 */
export type GenAuthGetUserAuthorizedAppsInput = (GenAuthSdkObject42) | (GenAuthGetUserAccessibleAppsReqDto);
export type GenAuthGetUserAuthorizedAppsResult = (GenAuthSdkAppDto)[];

/** 获取用户被授权的所有资源 */
export type GenAuthGetUserAuthorizedResourcesInput = (GenAuthSdkObject46) | (GenAuthGetUserAuthorizedResourcesDto);
export type GenAuthGetUserAuthorizedResourcesResult = GenAuthSdkAuthorizedResourcePagingDto;

/** 获取用户内置字段列表 */
export type GenAuthGetUserBaseFieldsInput = (Record<never, never>) | (Record<string, unknown>);
export type GenAuthGetUserBaseFieldsResult = (GenAuthSdkCustomFieldDto)[];

/** 批量获取用户信息 */
export type GenAuthGetUserBatchInput = (GenAuthSdkObject33) | (GenAuthGetUserBatchDto);
export type GenAuthGetUserBatchResult = (GenAuthSdkUserDto)[];

/** 获取用户部门列表 */
export type GenAuthGetUserDepartmentsInput = (GenAuthSdkObject37) | (GenAuthGetUserDepartmentsDto);
export type GenAuthGetUserDepartmentsResult = GenAuthSdkUserDepartmentPagingDto;

/** 批量获取用户密码密文 */
export type GenAuthGetUserEncryptPasswordBatchInput = GenAuthSdkGetUserEncryptPasswordBatchDto;
export type GenAuthGetUserEncryptPasswordBatchResult = GenAuthSdkGetUserEncryptPasswordBatchDataDto;

/** 获取用户分组列表 */
export type GenAuthGetUserGroupsInput = (GenAuthSdkObject38) | (GenAuthGetUserGroupsDto);
export type GenAuthGetUserGroupsResult = GenAuthSdkGroupPagingDto;

/** 获取用户的外部身份源 */
export type GenAuthGetUserIdentitiesInput = (GenAuthSdkObject34) | (GenAuthGetUserIdentitiesDto);
export type GenAuthGetUserIdentitiesResult = (GenAuthSdkIdentityDto)[];

/** 获取用户曾经登录过的应用 */
export type GenAuthGetUserLoggedinAppsInput = (GenAuthSdkObject44) | (GenAuthGetUserLoggedInAppsReqDto);
export type GenAuthGetUserLoggedinAppsResult = (GenAuthSdkUserLoggedInAppsDto)[];

/** 获取用户曾经登录过的身份源 */
export type GenAuthGetUserLoggedinIdentitiesInput = GenAuthSdkObject45;
export type GenAuthGetUserLoggedinIdentitiesResult = (GenAuthSdkUserLoggedInIdentitiesDto)[];

/** 获取用户曾经登录过的身份源 */
export type GenAuthGetUserLoggedInIdentitiesInput = GenAuthGetUserLoggedInIdentitiesReqDto;
export type GenAuthGetUserLoggedInIdentitiesResult = (GenAuthUserLoggedInIdentitiesDto)[];

/** 获取用户的登录历史记录 */
export type GenAuthGetUserLoginHistoryInput = (GenAuthSdkObject43) | (GenAuthGetUserLoginHistoryDto);
export type GenAuthGetUserLoginHistoryResult = GenAuthSdkUserLoginHistoryPagingDto;

/** 获取用户 MFA 绑定信息 */
export type GenAuthGetUserMfaInfoInput = (GenAuthSdkObject39) | (GenAuthGetUserMfaInfoDto);
export type GenAuthGetUserMfaInfoResult = GenAuthSdkUserMfaRespDto;

/** 获取用户 MFA 状态 */
export type GenAuthGetUserMfaStatusInput = GenAuthSdkObject48;
export type GenAuthGetUserMfaStatusResult = GenAuthSdkGetMfaInfoDataDto;

/** 获取用户自定义加密的密码 */
export type GenAuthGetUserPasswordCiphertextInput = (GenAuthSdkGetUserPasswordCiphertextDto) | (GenAuthGetUserPasswordCiphertextDto);
export type GenAuthGetUserPasswordCiphertextResult = GenAuthSdkGetUserPasswordCiphertextDataDto;

/** 获取用户权限列表 */
export type GenAuthGetUserPermissionListInput = (GenAuthSdkGetUserPermissionListDto) | (GenAuthGetUserPermissionListDto);
export type GenAuthGetUserPermissionListResult = GenAuthSdkGetUserPermissionListDataDto;

/** 获取用户关联岗位 */
export type GenAuthGetUserPostInput = GenAuthSdkObject4;
export type GenAuthGetUserPostResult = GenAuthSdkCreatePostDto;

/** 获取用户关联岗位 */
export type GenAuthGetUserPostsInput = GenAuthSdkObject3;
export type GenAuthGetUserPostsResult = (GenAuthSdkPostDto)[];

/** 获取用户实名认证信息 */
export type GenAuthGetUserPrincipalAuthenticationInfoInput = (GenAuthSdkObject36) | (GenAuthGetUserPrincipalAuthenticationInfoDto);
export type GenAuthGetUserPrincipalAuthenticationInfoResult = GenAuthSdkPrincipalAuthenticationInfoPagingDto;

/** 获取用户拥有某些资源的权限列表（推荐） */
export type GenAuthGetUserResourcePermissionListInput = (GenAuthSdkGetUserResourcePermissionListDto) | (GenAuthGetUserResourcePermissionListDto);
export type GenAuthGetUserResourcePermissionListResult = GenAuthSdkGetUserResourcePermissionListDataDto;

/** 获取用户拥有指定资源的权限及资源结构信息 */
export type GenAuthGetUserResourceStructInput = (GenAuthSdkGetUserResourceStructDto) | (GenAuthGetUserResourceStructDto);
export type GenAuthGetUserResourceStructResult = GenAuthSdkGetUserResourceStructDataDto;

/** 获取用户角色列表 */
export type GenAuthGetUserRolesInput = (GenAuthSdkObject35) | (GenAuthGetUserRolesDto);
export type GenAuthGetUserRolesResult = GenAuthSdkRolePagingDto;

/** 公共账号的用户列表 */
export type GenAuthGetUsersOfPublicAccountInput = GenAuthSdkObject16;
export type GenAuthGetUsersOfPublicAccountResult = GenAuthSdkPublicAccountPagingDto;

/** 获取用户绑定的第三方同步关系 */
export type GenAuthGetUserSyncRelationsInput = (GenAuthSdkObject49) | (GenAuthGetUserSyncRelationsDto);
export type GenAuthGetUserSyncRelationsResult = (GenAuthSdkUserSyncRelationDto)[];

/** 获取 verify-config-app 列表 */
export type GenAuthGetVerifyConfigAppInput = GenAuthSdkObject163;
export type GenAuthGetVerifyConfigAppResult = GenAuthSdkApplicationDto;

/** 获取 Webhook 详情 */
export type GenAuthGetWebhookInput = (GenAuthSdkObject158) | (GenAuthGetWebhookDto);
export type GenAuthGetWebhookResult = GenAuthSdkWebhookDto;

/** 获取 Webhook 事件列表 */
export type GenAuthGetWebhookEventListInput = (Record<never, never>) | (Record<never, never>);
export type GenAuthGetWebhookEventListResult = GenAuthSdkWebhookEventListData;

/** 获取 Webhook 日志 */
export type GenAuthGetWebhookLogsInput = (GenAuthSdkListWebhookLogs) | (GenAuthListWebhookLogs);
export type GenAuthGetWebhookLogsResult = GenAuthSdkListWebhookLogsData;

/** 获取微信小程序、公众号 Access Token */
export type GenAuthGetWechatMpAccessTokenInfoInput = GenAuthSdkGetWechatAccessTokenDto;
export type GenAuthGetWechatMpAccessTokenInfoResult = GenAuthSdkGetWechatAccessTokenDataDto;

/** 获取微信小程序、公众号 Access Token */
export type GenAuthGetWeixinAccessTokenInput = GenAuthGetWechatAccessTokenDto;
export type GenAuthGetWeixinAccessTokenResult = GenAuthGetWechatAccessTokenDataDto;

/** 判断用户是否有某个角色 */
export type GenAuthHasAnyRoleInput = (GenAuthSdkHasAnyRoleReqDto) | (GenAuthHasAnyRoleReqDto);
export type GenAuthHasAnyRoleResult = GenAuthSdkHasAnyRoleDto;

/** 导入数据 */
export type GenAuthImportMetadataInput = GenAuthSdkImportModelDto;
export type GenAuthImportMetadataResult = GenAuthSdkCommonResponseDto;

/** 导入数据对象 */
export type GenAuthImportModelInput = GenAuthSdkImportMetadataDto;
export type GenAuthImportModelResult = GenAuthSdkCommonResponseDto;

/** 导入用户的 OTP */
export type GenAuthImportOtpInput = (GenAuthSdkImportOtpReqDto) | (GenAuthImportOtpReqDto);
export type GenAuthImportOtpResult = GenAuthSdkCommonResponseDto;

/** 获取导入名单受邀人的模板 */
export type GenAuthImportTemplateInput = Record<never, never>;
export type GenAuthImportTemplateResult = GenAuthSdkImportExportTemplateRespDto;

/** 导入租户 */
export type GenAuthImportTenantInput = (GenAuthSdkImportTenantDto) | (GenAuthImportTenantDto);
export type GenAuthImportTenantResult = GenAuthSdkImportTenantDataDto;

/** 导入租户历史 */
export type GenAuthImportTenantHistoryInput = (GenAuthSdkObject115) | (GenAuthImportTenantHistoryDto);
export type GenAuthImportTenantHistoryResult = GenAuthSdkImportTenantHistoryDataDto;

/** 导入租户通知用户列表 */
export type GenAuthImportTenantNotifyUserInput = (GenAuthSdkObject116) | (GenAuthImportTenantNotifyUserDto);
export type GenAuthImportTenantNotifyUserResult = GenAuthSdkImportTenantNotifyUseDataDto;

/** 导入名单受邀人 */
export type GenAuthImportUsersInput = GenAuthSdkImportUsersDto;
export type GenAuthImportUsersResult = GenAuthSdkImportInviteeDto;

/** 判断用户是否对某个资源的某个操作有权限 */
export type GenAuthIsActionAllowedInput = (GenAuthSdkIsActionAllowedDto) | (GenAuthIsActionAllowedDto);
export type GenAuthIsActionAllowedResult = GenAuthSdkIsActionAllowedDataDto;

/** 判断部门是否在某个部门下 */
export type GenAuthIsDepartmentInDepartmentInput = GenAuthIsDepartmentInDepartmentReqDto;
export type GenAuthIsDepartmentInDepartmentResult = GenAuthIsDepartmentInDepartmentDataDto;

/** 判断用户是否存在 */
export type GenAuthIsUserExistsInput = (GenAuthSdkIsUserExistsReqDto) | (GenAuthIsUserExistsReqDto);
export type GenAuthIsUserExistsResult = GenAuthSdkIsUserExistsDto;

/** 判断用户是否在某个部门下 */
export type GenAuthIsUserInDepartmentInput = (GenAuthSdkObject28) | (GenAuthIsUserInDepartmentReqDto);
export type GenAuthIsUserInDepartmentResult = GenAuthSdkIsUserInDepartmentDataDto;

/** 强制下线公共账号 */
export type GenAuthKickPublicAccountsInput = GenAuthSdkKickPublicAccountsDto;
export type GenAuthKickPublicAccountsResult = GenAuthSdkIsSuccessDto;

/** 强制下线用户 */
export type GenAuthKickUsersInput = (GenAuthSdkKickUsersDto) | (GenAuthKickUsersDto);
export type GenAuthKickUsersResult = GenAuthSdkIsSuccessDto;

/** 给用户绑定一个身份信息 */
export type GenAuthLinkIdentityInput = (GenAuthSdkLinkIdentityDto) | (GenAuthLinkIdentityDto);
export type GenAuthLinkIdentityResult = GenAuthSdkLinkIdentityDataDto;

/** 获取协作管理员 AK/SK 列表 */
export type GenAuthListAccessKeyInput = GenAuthListAccessKeyDto;
export type GenAuthListAccessKeyResult = (GenAuthListAccessKeyRespDto)[];

/** 获取应用当前登录用户 */
export type GenAuthListApplicationActiveUsersInput = (GenAuthSdkListApplicationActiveUsersDto) | (GenAuthListApplicationActiveUsersDto);
export type GenAuthListApplicationActiveUsersResult = GenAuthSdkUserPagingDto;

/** 获取应用列表 */
export type GenAuthListApplicationsInput = (GenAuthSdkObject101) | (GenAuthListApplicationsDto);
export type GenAuthListApplicationsResult = GenAuthSdkApplicationPaginatedDataDto;

/** 应用授权列表 */
export type GenAuthListApplicationsAuthInput = GenAuthListApplicationAuthDto;
export type GenAuthListApplicationsAuthResult = GenAuthListApplicationAuthPaginatedDataDto;

/** 获取应用简单信息列表 */
export type GenAuthListApplicationSimpleInfoInput = (GenAuthSdkObject103) | (GenAuthListApplicationSimpleInfoDto);
export type GenAuthListApplicationSimpleInfoResult = GenAuthSdkApplicationSimpleInfoPaginatedDataDto;

/** 获取已归档的用户列表 */
export type GenAuthListArchivedUsersInput = (GenAuthSdkObject40) | (GenAuthListArchivedUsersDto);
export type GenAuthListArchivedUsersResult = GenAuthSdkArchivedUsersListPagingDto;

/** 获取 ASA 账号列表 */
export type GenAuthListAsaAccountInput = GenAuthSdkObject108;
export type GenAuthListAsaAccountResult = GenAuthSdkAsaAccountPaginatedDataDto;

/** 获取 ASA 账号列表 */
export type GenAuthListAsaAccountsInput = GenAuthListAsaAccountDto;
export type GenAuthListAsaAccountsResult = GenAuthAsaAccountPaginatedDataDto;

/** 应用授权列表 */
export type GenAuthListAuthApplicationInput = GenAuthSdkListApplicationAuthDto;
export type GenAuthListAuthApplicationResult = GenAuthSdkListApplicationAuthPaginatedDataDto;

/** 主体授权列表 */
export type GenAuthListAuthSubjectInput = GenAuthSdkListAuthSubjectDto;
export type GenAuthListAuthSubjectResult = GenAuthSdkListApplicationSubjectDataListDto;

/** 获取子部门列表 */
export type GenAuthListChildrenDepartmentsInput = (GenAuthSdkObject22) | (GenAuthListChildrenDepartmentsReqDto);
export type GenAuthListChildrenDepartmentsResult = GenAuthSdkDepartmentPagingDto;

/** 常规资源授权列表 */
export type GenAuthListCommonAuthorizeInput = GenAuthListAuthorizeDto;
export type GenAuthListCommonAuthorizeResult = GenAuthAuthorizePagingDto;

/** 分页获取常规资源列表 */
export type GenAuthListCommonResourceInput = (GenAuthSdkObject92) | (GenAuthCommonListResourceDto);
export type GenAuthListCommonResourceResult = GenAuthSdkCommonResourcePagingDto;

/** 获取自定义字段列表 */
export type GenAuthListCustFieldsInput = GenAuthSdkObject88;
export type GenAuthListCustFieldsResult = GenAuthSdkListCustomFieldsDto;

/** 获取自定义字段列表 */
export type GenAuthListCustomFieldsInput = GenAuthListCustomFieldsReqDto;
export type GenAuthListCustomFieldsResult = GenAuthListCustomFieldsDto;

/** 获取数据策略列表 */
export type GenAuthListDataPolicesInput = GenAuthSdkObject134;
export type GenAuthListDataPolicesResult = GenAuthSdkDataPoliciesPaginatedRespDto;

/** 获取数据策略列表 */
export type GenAuthListDataPoliciesInput = GenAuthListDataPolicyDto;
export type GenAuthListDataPoliciesResult = GenAuthDataPoliciesPaginatedRespDto;

/** 获取数据策略授权的主体列表 */
export type GenAuthListDataPolicyTargetsInput = (GenAuthSdkObject138) | (GenAuthListDataPolicySubjectDto);
export type GenAuthListDataPolicyTargetsResult = GenAuthSdkListDataPolicySubjectPageDto;

/** 获取数据资源列表 */
export type GenAuthListDataResourcesInput = (GenAuthSdkObject130) | (GenAuthListDataResourcesDto);
export type GenAuthListDataResourcesResult = GenAuthSdkDataResourcesPaginatedRespDto;

/** 获取部门直属成员 ID 列表 */
export type GenAuthListDepartmentMemberIdsInput = (GenAuthSdkObject25) | (GenAuthListDepartmentMemberIdsDto);
export type GenAuthListDepartmentMemberIdsResult = (string)[];

/** 获取部门成员列表 */
export type GenAuthListDepartmentMembersInput = (GenAuthSdkObject24) | (GenAuthListDepartmentMembersReqDto);
export type GenAuthListDepartmentMembersResult = GenAuthSdkUserPagingDto;

/** 获取树类型资源的扩展字段列表 */
export type GenAuthListDnefInput = (GenAuthSdkObject133) | (GenAuthListDnefReq);
export type GenAuthListDnefResult = GenAuthSdkDnefPaginatedRespDto;

/** 根据应用 id 获取应用已启用的身份源连接列表 */
export type GenAuthListEnabledExtIdpConnsByAppInput = GenAuthListExtIdpConnByAppDto;
export type GenAuthListEnabledExtIdpConnsByAppResult = (GenAuthExtIdpConnDetailWithFieldsDto)[];

/** 获取事件应用列表 */
export type GenAuthListEventAppsInput = Record<never, never>;
export type GenAuthListEventAppsResult = GenAuthSdkEventAppPagingDto;

/** 获取事件列表 */
export type GenAuthListEventsInput = GenAuthSdkObject143;
export type GenAuthListEventsResult = GenAuthSdkOpenEventPagingDto;

/** 获取身份源列表 */
export type GenAuthListExtIdpInput = (GenAuthSdkObject82) | (GenAuthGetTenantIdDto);
export type GenAuthListExtIdpResult = GenAuthSdkExtIdpListPagingDto;

/** 获取身份源连接列表 */
export type GenAuthListExtIdpConnsInput = GenAuthListExtIdpConnDto;
export type GenAuthListExtIdpConnsResult = (GenAuthExtIdpConnDetailWithFieldsDto)[];

/** 获取数据对象字段列表 */
export type GenAuthListFieldInput = GenAuthSdkObject8;
export type GenAuthListFieldResult = (GenAuthSdkFunctionModelFieldDto)[];

/** 获取分组成员列表 */
export type GenAuthListGroupMembersInput = (GenAuthSdkObject74) | (GenAuthListGroupMembersDto);
export type GenAuthListGroupMembersResult = GenAuthSdkUserPagingDto;

/** 获取分组列表 */
export type GenAuthListGroupsInput = (GenAuthSdkObject72) | (GenAuthListGroupsDto);
export type GenAuthListGroupsResult = GenAuthSdkGroupPagingDto;

/** 获取邀请策略列表 */
export type GenAuthListInvitationPoliciesInput = GenAuthSdkPaginationInvitationPolicyQueryDto;
export type GenAuthListInvitationPoliciesResult = GenAuthSdkPaginationInvitationPolicyDataDto;

/** 获取邀请名单列表 */
export type GenAuthListInvitationRosterInput = GenAuthSdkListInvitationRosterDto;
export type GenAuthListInvitationRosterResult = GenAuthSdkInvitationRosterPaginationDto;

/** 获取未关联策略的邀请名单列表 */
export type GenAuthListInvitationRostersByNonPolicyIdInput = GenAuthSdkListInvitationRosterDto;
export type GenAuthListInvitationRostersByNonPolicyIdResult = GenAuthSdkInvitationRosterPaginationDto;

/** 根据策略 Id 获取邀请名单列表 */
export type GenAuthListInvitationRostersByPolicyIdInput = GenAuthSdkListInvitationRosterByPolicyIdDto;
export type GenAuthListInvitationRostersByPolicyIdResult = GenAuthSdkInvitationRosterPaginationDto;

/** 获取可访问的租户控制台列表 */
export type GenAuthListInviteTenantUserRecordsInput = GenAuthGetInviteTenantUserRecords;
export type GenAuthListInviteTenantUserRecordsResult = GenAuthInviteTenantUserRecordListDto;

/** 获取可访问的租户控制台列表 */
export type GenAuthListInviteTennatUserRecordsInput = GenAuthSdkObject117;
export type GenAuthListInviteTennatUserRecordsResult = GenAuthSdkInviteTenantUserRecordListDto;

/** 获取数据对象列表 */
export type GenAuthListModelInput = Record<never, never>;
export type GenAuthListModelResult = GenAuthSdkFunctionModelListDto;

/** 获取多租户管理员用户列表 */
export type GenAuthListMultipleTenantAdminInput = GenAuthSdkObject118;
export type GenAuthListMultipleTenantAdminResult = GenAuthSdkMultipleTenantAdminListPagingDto;

/** 获取多租户管理员用户列表 */
export type GenAuthListMultipleTenantAdminsInput = GenAuthListMultipleTenantAdminDto;
export type GenAuthListMultipleTenantAdminsResult = GenAuthMultipleTenantAdminListPagingDto;

/** 分页权限分组下所有的角色列表 */
export type GenAuthListNamespaceRolesInput = (GenAuthSdkObject97) | (GenAuthListNamespaceRolesDto);
export type GenAuthListNamespaceRolesResult = GenAuthSdkNamespaceRolesListRespDto;

/** 分页获取权限分组列表 */
export type GenAuthListNamespacesInput = (GenAuthSdkObject96) | (GenAuthListNamespacesDto);
export type GenAuthListNamespacesResult = GenAuthSdkNamespaceListPagingDto;

/** 操作管理列表(分页) */
export type GenAuthListOperateInput = GenAuthSdkObject10;
export type GenAuthListOperateResult = GenAuthSdkOperateModelDto;

/** 全部操作管理列表 */
export type GenAuthListOperateAllInput = GenAuthSdkObject11;
export type GenAuthListOperateAllResult = GenAuthSdkOperateModelDto;

/** 获取组织机构列表 */
export type GenAuthListOrganizationsInput = (GenAuthSdkObject19) | (GenAuthListOrganizationsDto);
export type GenAuthListOrganizationsResult = GenAuthSdkOrganizationPagingDto;

/** 分页查询权限空间下所有的角色列表 */
export type GenAuthListPermissionNamespaceRolesInput = (GenAuthSdkObject129) | (GenAuthListPermissionNamespaceRolesDto);
export type GenAuthListPermissionNamespaceRolesResult = GenAuthSdkPermissionNamespaceRolesListPagingDto;

/** 分页获取权限空间列表 */
export type GenAuthListPermissionNamespacesInput = (GenAuthSdkObject128) | (GenAuthListPermissionNamespacesDto);
export type GenAuthListPermissionNamespacesResult = GenAuthSdkPermissionNamespaceListPagingDto;

/** 获取权限视图数据列表 */
export type GenAuthListPermissionViewInput = GenAuthSdkListPermissionViewDto;
export type GenAuthListPermissionViewResult = GenAuthSdkListPermissionViewPaginatedRespDto;

/** 获取权限视图数据列表 */
export type GenAuthListPermissionViewDataInput = GenAuthListPermissionViewDto;
export type GenAuthListPermissionViewDataResult = GenAuthListPermissionViewPaginatedRespDto;

/** 获取 Pipeline 函数列表 */
export type GenAuthListPipelineFunctionsInput = (GenAuthSdkObject155) | (GenAuthListPipelineFunctionsDto);
export type GenAuthListPipelineFunctionsResult = GenAuthSdkPipelineFunctionPagingDto;

/** 获取邀请策略用户归属列表 */
export type GenAuthListPolicyUserAttributionDetailInput = GenAuthSdkObject68;
export type GenAuthListPolicyUserAttributionDetailResult = (GenAuthSdkUserAttributionPaginationDto)[];

/** 获取编程访问账号列表 */
export type GenAuthListProgrammaticAccessAccountsInput = GenAuthListProgrammaticAccessAccountRequestDto;
export type GenAuthListProgrammaticAccessAccountsResult = GenAuthProgrammaticAccessAccountPagingDto;

/** 获取/搜索公共账号列表 */
export type GenAuthListPublicAccountsInput = GenAuthSdkListPublicAccountsRequestDto;
export type GenAuthListPublicAccountsResult = GenAuthSdkPublicAccountPagingDto;

/** 获取策略流程配置补充信息的字段列表 */
export type GenAuthListRegisterExtendsFieldsInput = GenAuthSdkObject66;
export type GenAuthListRegisterExtendsFieldsResult = GenAuthSdkGetExtendsFieldsDto;

/** 分页获取资源列表 */
export type GenAuthListResourcesInput = (GenAuthSdkObject93) | (GenAuthListResourcesDto);
export type GenAuthListResourcesResult = GenAuthSdkResourcePagingDto;

/** 获取拥有某些资源权限的用户列表 */
export type GenAuthListResourceTargetsInput = (GenAuthSdkListResourceTargetsDto) | (GenAuthListResourceTargetsDto);
export type GenAuthListResourceTargetsResult = GenAuthSdkListResourceTargetsDataDto;

/** 获取角色下所有成员列表 */
export type GenAuthListRoleAllMembersInput = GenAuthListRoleAllMembersDto;
export type GenAuthListRoleAllMembersResult = GenAuthUserPagingDto;

/** 获取角色授权列表 */
export type GenAuthListRoleAssignmentsInput = (GenAuthSdkObject81) | (GenAuthListRoleAssignmentsDto);
export type GenAuthListRoleAssignmentsResult = GenAuthSdkRoleListPageDto;

/** 获取角色的部门列表 */
export type GenAuthListRoleDepartmentsInput = (GenAuthSdkObject79) | (GenAuthListRoleDepartmentDto);
export type GenAuthListRoleDepartmentsResult = GenAuthSdkRoleDepartmentListPagingDto;

/** 获取角色成员列表 */
export type GenAuthListRoleMembersInput = (GenAuthSdkObject78) | (GenAuthListRoleMemberDto);
export type GenAuthListRoleMembersResult = GenAuthSdkUserPagingDto;

/** 获取角色列表 */
export type GenAuthListRolesInput = (GenAuthSdkObject80) | (GenAuthListRoleDto);
export type GenAuthListRolesResult = GenAuthSdkRolePagingDto;

/** 数据对象高级搜索 */
export type GenAuthListRowInput = GenAuthSdkFilterDto;
export type GenAuthListRowResult = GenAuthSdkFunctionModelValueListDto;

/** 获取 Session 列表 */
export type GenAuthListSessionsInput = GenAuthPaginationSessionRequestDto;
export type GenAuthListSessionsResult = GenAuthSessionManagementPagingDto;

/** 视图详情下的 Session 列表 */
export type GenAuthListSessionsDetailByViewInput = GenAuthListSessionsDetailByViewRequestDto;
export type GenAuthListSessionsDetailByViewResult = GenAuthSessionManagementPagingDto;

/** 获取数据策略简略信息列表 */
export type GenAuthListSimpleDataPolicesInput = GenAuthSdkObject135;
export type GenAuthListSimpleDataPolicesResult = GenAuthSdkDataPoliciesSimplePaginatedRespDto;

/** 获取数据策略简略信息列表 */
export type GenAuthListSimpleDataPoliciesInput = GenAuthListDataPolicyDto;
export type GenAuthListSimpleDataPoliciesResult = GenAuthDataPoliciesSimplePaginatedRespDto;

/** 主体授权列表 */
export type GenAuthListSubjectAuthInput = GenAuthListAuthSubjectDto;
export type GenAuthListSubjectAuthResult = GenAuthListApplicationSubjectDataListDto;

/** 获取同步作业详情 */
export type GenAuthListSyncJobLogsInput = (GenAuthSdkObject62) | (GenAuthListSyncJobLogsDto);
export type GenAuthListSyncJobLogsResult = GenAuthSdkTriggerSyncTaskDataDto;

/** 获取同步作业详情 */
export type GenAuthListSyncJobsInput = (GenAuthSdkObject61) | (GenAuthListSyncJobDto);
export type GenAuthListSyncJobsResult = GenAuthSdkSyncJobPagingDto;

/** 获取同步风险操作列表 */
export type GenAuthListSyncRiskOperationsInput = (GenAuthSdkObject63) | (GenAuthListSyncRiskOperationsDto);
export type GenAuthListSyncRiskOperationsResult = GenAuthSdkSyncRiskOperationPagingDto;

/** 获取同步任务列表 */
export type GenAuthListSyncTasksInput = (GenAuthSdkObject59) | (GenAuthListSyncTasksDto);
export type GenAuthListSyncTasksResult = GenAuthSdkSyncTaskPagingDto;

/** 获取租户管理员列表 */
export type GenAuthListTenantAdminInput = (GenAuthSdkListTenantAdminDto) | (GenAuthListTenantAdminDto);
export type GenAuthListTenantAdminResult = GenAuthSdkTenantUserListPagingDto;

/** 获取租户应用列表 */
export type GenAuthListTenantApplicationsInput = (GenAuthSdkObject106) | (GenAuthGetTenantApplicationListDto);
export type GenAuthListTenantApplicationsResult = GenAuthSdkTenantApplicationListPagingDto;

/** 获取协作管理员用户列表 */
export type GenAuthListTenantCooperatorsInput = (GenAuthSdkObject120) | (GenAuthListTenantCooperatorDto);
export type GenAuthListTenantCooperatorsResult = GenAuthSdkTenantCooperatorListPagingDto;

/** 租户控制台获取身份源列表 */
export type GenAuthListTenantExtIdpInput = (GenAuthSdkObject84) | (GenAuthListTenantExtIdp);
export type GenAuthListTenantExtIdpResult = GenAuthSdkExtIdpListPagingDto;

/** 获取/搜索租户列表 */
export type GenAuthListTenantsInput = (GenAuthSdkObject112) | (GenAuthListTenantsDto);
export type GenAuthListTenantsResult = GenAuthSdkTenantListPagingDto;

/** 获取/搜索租户成员列表 */
export type GenAuthListTenantUsersInput = (GenAuthSdkListTenantUserDto) | (GenAuthListTenantUserDto);
export type GenAuthListTenantUsersResult = GenAuthSdkTenantUserListPagingDto;

/** 获取用户内置字段列表 */
export type GenAuthListUserBaseFieldsInput = (GenAuthSdkObject86) | (GenAuthListCustomFieldsReqDto);
export type GenAuthListUserBaseFieldsResult = GenAuthSdkListCustomFieldsDto;

/** 获取/搜索用户列表 */
export type GenAuthListUsersInput = (GenAuthSdkListUsersRequestDto) | (GenAuthListUsersRequestDto);
export type GenAuthListUsersResult = GenAuthSdkUserPagingDto;

/** 获取用户列表 */
export type GenAuthListUsersLegacyInput = (GenAuthSdkObject31) | (GenAuthListUsersLagacyDto);
export type GenAuthListUsersLegacyResult = GenAuthSdkUserPagingDto;

/** 获取 Webhook 列表 */
export type GenAuthListWebhooksInput = (GenAuthSdkObject157) | (GenAuthListWebhooksDto);
export type GenAuthListWebhooksResult = GenAuthSdkGetWebhooksData;

/** 获取注册白名单列表 */
export type GenAuthListWhitelistInput = GenAuthListWhitelistDto;
export type GenAuthListWhitelistResult = (GenAuthWhitelistRespDto)[];

/** 获取应用注册白名单列表 */
export type GenAuthListWhitelistOfAppInput = GenAuthListWhitelistOfAppDto;
export type GenAuthListWhitelistOfAppResult = (GenAuthWhitelistRespDto)[];

/** 获取注册白名单列表 */
export type GenAuthListWhitelistsInput = GenAuthSdkObject145;
export type GenAuthListWhitelistsResult = GenAuthSdkWhitelistRespDto;

/** 获取应用注册白名单列表 */
export type GenAuthListWhitelistsOfAppInput = GenAuthSdkObject144;
export type GenAuthListWhitelistsOfAppResult = GenAuthSdkWhitelistRespDto;

/** 获取审批日志列表 */
export type GenAuthLogListInput = GenAuthSdkObject153;
export type GenAuthLogListResult = GenAuthSdkApprovalPageList;

/** 跨权限分组（空间）删除角色 */
export type GenAuthMultipleNamespaceDeleteRolesBatchInput = GenAuthDeleteRoleBatchDto;
export type GenAuthMultipleNamespaceDeleteRolesBatchResult = GenAuthIsSuccessDto;

/** 获取代办审批列表 */
export type GenAuthPendListInput = GenAuthSdkObject151;
export type GenAuthPendListResult = GenAuthSdkApprovalPageList;

/** 岗位列表 */
export type GenAuthPostListInput = GenAuthSdkObject;
export type GenAuthPostListResult = GenAuthSdkPostPagingDto;

/** 岗位列表 */
export type GenAuthPostListBatchInput = GenAuthSdkListPostBatchDto;
export type GenAuthPostListBatchResult = GenAuthSdkPostPagingDto;

/** 动态分组预览 */
export type GenAuthPreviewDynamicGroupInput = GenAuthPreviewDynamicGroupDto;
export type GenAuthPreviewDynamicGroupResult = GenAuthUserPagingDto;

/** 预览邮件模版 */
export type GenAuthPreviewEmailTemplateInput = GenAuthSdkPreviewEmailTemplateDto;
export type GenAuthPreviewEmailTemplateResult = GenAuthSdkPreviewEmailTemplateDataDto;

/** 处理单个审批 */
export type GenAuthProcessApprovalInput = GenAuthSdkApprovalProcessReq;
export type GenAuthProcessApprovalResult = GenAuthSdkIsSuccessDto;

/** 事件发布 */
export type GenAuthPubInput = { "eventName": string } & { "data": string };
export type GenAuthPubResult = unknown;

/** 认证端推送自定义事件 */
export type GenAuthPubUserEventInput = GenAuthSdkPubEventDto;
export type GenAuthPubUserEventResult = GenAuthSdkPubEventRespDataDto;

/** 获取 LDAP server 配置信息 */
export type GenAuthQueryLdapConfigInfoInput = Record<never, never>;
export type GenAuthQueryLdapConfigInfoResult = GenAuthSdkLdapConfigInfoDto;

/** LDAP server 日志查询 */
export type GenAuthQueryLdapLogInput = GenAuthSdkObject159;
export type GenAuthQueryLdapLogResult = GenAuthSdkLdapLogDto;

/** LDAP server 根据 DN 查询下一级 */
export type GenAuthQueryLdapSubEntriesInput = GenAuthSdkObject160;
export type GenAuthQueryLdapSubEntriesResult = GenAuthSdkLdapLogDto;

/** 快捷查询受邀人列表 */
export type GenAuthQuickFilterInviteeListInput = GenAuthSdkQuickFilterInvitationUserDto;
export type GenAuthQuickFilterInviteeListResult = GenAuthSdkQuickFilterInviteePaginationDto;

/** 刷新应用密钥 */
export type GenAuthRefreshApplicationSecretInput = (GenAuthSdkRefreshApplicationSecretDto) | (GenAuthRefreshApplicationSecretDto);
export type GenAuthRefreshApplicationSecretResult = GenAuthSdkRefreshApplicationSecretDataDto;

/** 刷新编程访问账号密钥 */
export type GenAuthRefreshProgrammaticAccessAccountSecretInput = GenAuthResetProgrammaticAccessAccountSecretRequestDto;
export type GenAuthRefreshProgrammaticAccessAccountSecretResult = GenAuthProgrammaticAccessAccountDto;

/** 批量拒绝通用邀请的申请 */
export type GenAuthRejectInput = GenAuthSdkApprovalUniversalInvitationApplicantDto;
export type GenAuthRejectResult = GenAuthSdkIsSuccessDto;

/** 关联关系模糊查询 */
export type GenAuthRelationSearchInput = GenAuthSdkRelationSearchDto;
export type GenAuthRelationSearchResult = GenAuthSdkRelationValueListDto;

/** 删除数据对象的字段 */
export type GenAuthRemoteFieldInput = GenAuthSdkFunctionModelFieldIdDto;
export type GenAuthRemoteFieldResult = GenAuthSdkCommonResponseDto;

/** 移除设备互斥生效范围配置 */
export type GenAuthRemoveInput = GenAuthSdkDeleteDeviceExclusiveValidScopeSettingsByIdsDto;
export type GenAuthRemoveResult = GenAuthSdkIsSuccessDto;

/** 部门下删除成员 */
export type GenAuthRemoveDepartmentMembersInput = (GenAuthSdkRemoveDepartmentMembersReqDto) | (GenAuthRemoveDepartmentMembersReqDto);
export type GenAuthRemoveDepartmentMembersResult = GenAuthSdkIsSuccessDto;

/** 批量移除分组成员 */
export type GenAuthRemoveGroupMembersInput = (GenAuthSdkRemoveGroupMembersReqDto) | (GenAuthRemoveGroupMembersReqDto);
export type GenAuthRemoveGroupMembersResult = GenAuthSdkIsSuccessDto;

/** 删除数据对象 */
export type GenAuthRemoveModelInput = GenAuthSdkFunctionModelIdDto;
export type GenAuthRemoveModelResult = GenAuthSdkCommonResponseDto;

/** 移除自定义操作 */
export type GenAuthRemoveOperateInput = GenAuthSdkFunctionModelOperateIdDto;
export type GenAuthRemoveOperateResult = GenAuthSdkCommonResponseDto;

/** 删除邀请策略用户归属 */
export type GenAuthRemovePolicyUserAttributionInput = GenAuthSdkRemoveInvitationPolicyUserAttributionDto;
export type GenAuthRemovePolicyUserAttributionResult = GenAuthSdkIsSuccessDto;

/** 批量删除邀请策略用户归属 */
export type GenAuthRemovePolicyUserAttributionsBatchInput = GenAuthSdkRemoveInvitationPolicyUserAttributionsBatchDto;
export type GenAuthRemovePolicyUserAttributionsBatchResult = GenAuthSdkIsSuccessDto;

/** 删除岗位 */
export type GenAuthRemovePostInput = GenAuthSdkRemovePostDto;
export type GenAuthRemovePostResult = GenAuthSdkCommonResponseDto;

/** 删除行关联数据 */
export type GenAuthRemoveRelationValueInput = GenAuthSdkRemoveRelationValueDto;
export type GenAuthRemoveRelationValueResult = GenAuthSdkCommonResponseDto;

/** 删除行 */
export type GenAuthRemoveRowInput = GenAuthSdkRemoveRowDto;
export type GenAuthRemoveRowResult = GenAuthSdkCommonResponseDto;

/** 租户部门下删除成员 */
export type GenAuthRemoveTenantDepartmentMembersInput = (GenAuthSdkRemoveTenantDepartmentMembersReqDto) | (GenAuthRemoveTenantDepartmentMembersReqDto);
export type GenAuthRemoveTenantDepartmentMembersResult = GenAuthSdkIsSuccessDto;

/** 批量移除租户成员 */
export type GenAuthRemoveTenantUsersInput = (GenAuthSdkRemoveTenantUsersDto) | (GenAuthRemoveTenantUsersDto);
export type GenAuthRemoveTenantUsersResult = GenAuthSdkIsSuccessDto;

/** 移除用户归属的主部门设置 */
export type GenAuthRemoveUserAttributionMainDepartmentInput = GenAuthSdkRemoveInvitationPolicyUserAttributionMainDepartmentDto;
export type GenAuthRemoveUserAttributionMainDepartmentResult = GenAuthSdkIsSuccessDto;

/** 删除用户实名认证信息 */
export type GenAuthResetUserPrincipalAuthenticationInfoInput = (GenAuthSdkResetUserPrincipalAuthenticationInfoDto) | (GenAuthResetUserPrincipalAuthenticationInfoDto);
export type GenAuthResetUserPrincipalAuthenticationInfoResult = GenAuthSdkIsSuccessDto;

/** 批量离职用户 */
export type GenAuthResignPublicAccountBatchInput = GenAuthSdkResignUserBatchReqDto;
export type GenAuthResignPublicAccountBatchResult = GenAuthSdkResignUserDataDto;

/** 离职用户 */
export type GenAuthResignUserInput = (GenAuthSdkResignUserReqDto) | (GenAuthResignUserReqDto);
export type GenAuthResignUserResult = GenAuthSdkResignUserDataDto;

/** 批量离职用户 */
export type GenAuthResignUserBatchInput = (GenAuthSdkResignUserBatchReqDto) | (GenAuthResignUserBatchReqDto);
export type GenAuthResignUserBatchResult = GenAuthSdkResignUserDataDto;

/** 重新上传 Pipeline 函数 */
export type GenAuthReuploadPipelineFunctionInput = (GenAuthSdkReUploadPipelineFunctionDto) | (GenAuthReUploadPipelineFunctionDto);
export type GenAuthReuploadPipelineFunctionResult = GenAuthSdkPipelineFunctionDto;

/** 撤回邀请 */
export type GenAuthRevertRosterInvitationInput = GenAuthSdkRevertRosterInvitationDto;
export type GenAuthRevertRosterInvitationResult = GenAuthSdkIsSuccessDto;

/** 撤回邀请 */
export type GenAuthRevertRosterInvitationBatchInput = GenAuthSdkRevertRosterInvitationBatchDto;
export type GenAuthRevertRosterInvitationBatchResult = GenAuthSdkIsSuccessDto;

/** 审核户企业认证 */
export type GenAuthReviewTenantEnterpriseCertificationInput = (GenAuthSdkReviewTenantEnterpriseCertificationBodyDto) | (GenAuthReviewTenantEnterpriseCertificationBodyDto);
export type GenAuthReviewTenantEnterpriseCertificationResult = GenAuthSdkIsSuccessDto;

/** 删除应用访问授权记录 */
export type GenAuthRevokeApplicationAccessInput = (GenAuthSdkRevokeApplicationAccessDto) | (GenAuthRevokeApplicationAccessDto);
export type GenAuthRevokeApplicationAccessResult = GenAuthSdkIsSuccessDto;

/** 删除数据策略授权 */
export type GenAuthRevokeDataPolicyInput = (GenAuthSdkDeleteAuthorizeDataPolicyDto) | (GenAuthDeleteAuthorizeDataPolicyDto);
export type GenAuthRevokeDataPolicyResult = GenAuthSdkCommonResponseDto;

/** 移除分配的角色 */
export type GenAuthRevokeRoleInput = (GenAuthSdkRevokeRoleDto) | (GenAuthRevokeRoleDto);
export type GenAuthRevokeRoleResult = GenAuthSdkIsSuccessDto;

/** 批量移除分配的角色 */
export type GenAuthRevokeRoleBatchInput = (GenAuthSdkRevokeRoleBatchDto) | (GenAuthRevokeRoleBatchDto);
export type GenAuthRevokeRoleBatchResult = GenAuthSdkIsSuccessDto;

/** 创建编排配置 */
export type GenAuthSaveAuthFlowConfigInput = Record<string, unknown>;
export type GenAuthSaveAuthFlowConfigResult = GenAuthAsaAccountDto;

/** 保存设备互斥生效范围配置 */
export type GenAuthSaveInvitationPoliciesInput = GenAuthSdkSaveDeviceExclusiveValidScopeSettingsDto;
export type GenAuthSaveInvitationPoliciesResult = GenAuthSdkIsSuccessDto;

/** 初始化/重启 LDAP server */
export type GenAuthSaveLdapConfigInfoInput = GenAuthSdkLdapSaveDto;
export type GenAuthSaveLdapConfigInfoResult = boolean;

/** 搜索部门下的成员 */
export type GenAuthSearchDepartmentMembersInput = (GenAuthSdkObject26) | (GenAuthSearchDepartmentMembersDto);
export type GenAuthSearchDepartmentMembersResult = GenAuthSdkUserPagingDto;

/** 搜索部门 */
export type GenAuthSearchDepartmentsInput = (GenAuthSdkSearchDepartmentsReqDto) | (GenAuthSearchDepartmentsReqDto);
export type GenAuthSearchDepartmentsResult = (GenAuthSdkDepartmentDto)[];

/** 搜索部门 */
export type GenAuthSearchDepartmentsListInput = (GenAuthSdkSearchDepartmentsListReqDto) | (GenAuthSearchDepartmentsListReqDto);
export type GenAuthSearchDepartmentsListResult = (GenAuthSdkDepartmentDto)[];

/** 搜索组织机构列表 */
export type GenAuthSearchOrganizationsInput = (GenAuthSdkObject20) | (GenAuthSearchOrganizationsDto);
export type GenAuthSearchOrganizationsResult = GenAuthSdkOrganizationPagingDto;

/** 导入租户通知邮箱用户 */
export type GenAuthSendEmailBatchInput = (GenAuthSdkSendManyTenantEmailDto) | (GenAuthSendManyTenantEmailDto);
export type GenAuthSendEmailBatchResult = GenAuthSdkSendEmailBatchDataDto;

/** 发送邀请租户用户邮件 */
export type GenAuthSendInviteTenantUserEmailInput = ({ "requestBody": Record<string, unknown> }) | (GenAuthSendInviteTenantUserEmailDto);
export type GenAuthSendInviteTenantUserEmailResult = GenAuthSdkIsSuccessDto;

/** 根据邀请名单发送邀请 */
export type GenAuthSendRosterInvitationInput = GenAuthSdkSendRosterInvitationDto;
export type GenAuthSendRosterInvitationResult = GenAuthSdkIsSuccessDto;

/** 批量发送邀请 */
export type GenAuthSendRosterInvitationBatchInput = GenAuthSdkSendRosterInvitationBatchDto;
export type GenAuthSendRosterInvitationBatchResult = GenAuthSdkIsSuccessDto;

/** 导入租户短信通知用户 */
export type GenAuthSendSmsBatchInput = (GenAuthSdkSendManyTenantSmsDto) | (GenAuthSendManyTenantSmsDto);
export type GenAuthSendSmsBatchResult = GenAuthSdkSendSmsBatchDataDto;

/** 发送用户忘记密码邮箱链接 */
export type GenAuthSendUserResetPasswordEmailLinkInput = GenAuthSendUserResetPasswordEmailLinkBatchReqDto;
export type GenAuthSendUserResetPasswordEmailLinkResult = (GenAuthSendUserResetPasswordEmailLinkBatchDto)[];

/** 根据用户信息发送重置密码请求 */
export type GenAuthSendUserResetPasswordRequestInput = GenAuthSendUserResetPasswordRequestDto;
export type GenAuthSendUserResetPasswordRequestResult = GenAuthSendUserResetPasswordDto;

/** 设置自定义字段的值 */
export type GenAuthSetCustomDataInput = (GenAuthSdkSetCustomDataReqDto) | (GenAuthSetCustomDataReqDto);
export type GenAuthSetCustomDataResult = GenAuthSdkIsSuccessDto;

/** 创建/修改自定义字段定义 */
export type GenAuthSetCustomFieldsInput = (GenAuthSdkSetCustomFieldsReqDto) | (GenAuthSetCustomFieldsReqDto);
export type GenAuthSetCustomFieldsResult = (GenAuthSdkCustomFieldDto)[];

/** 设置用户 MFA 状态 */
export type GenAuthSetMfaStatusInput = GenAuthSetMfaStatusDto;
export type GenAuthSetMfaStatusResult = GenAuthIsSuccessDto;

/** 设置公共账号所在部门 */
export type GenAuthSetPublicAccountOfDepartmentsInput = GenAuthSdkSetUserDepartmentsDto;
export type GenAuthSetPublicAccountOfDepartmentsResult = GenAuthSdkIsSuccessDto;

/** 设置公共账号的岗位 */
export type GenAuthSetPublicAccountOfnPostInput = GenAuthSdkUserConnectionPostDto;
export type GenAuthSetPublicAccountOfnPostResult = GenAuthSdkIsSuccessDto;

/** 设置租户管理员 */
export type GenAuthSetTenantAdminInput = (GenAuthSdkRemoveTenantUsersDto) | (GenAuthRemoveTenantUsersDto);
export type GenAuthSetTenantAdminResult = GenAuthSdkCommonResponseDto;

/** 设置用户归属的主部门 */
export type GenAuthSetUserAttributionMainDepartmentInput = GenAuthSdkSetInvitationPolicyUserAttributionMainDepartmentDto;
export type GenAuthSetUserAttributionMainDepartmentResult = GenAuthSdkIsSuccessDto;

/** 修改用户内置字段配置 */
export type GenAuthSetUserBaseFieldsInput = (GenAuthSdkSetUserBaseFieldsReqDto) | (GenAuthSetUserBaseFieldsReqDto);
export type GenAuthSetUserBaseFieldsResult = (GenAuthSdkCustomFieldDto)[];

/** 设置用户所在部门 */
export type GenAuthSetUserDepartmentsInput = (GenAuthSdkSetUserDepartmentsDto) | (GenAuthSetUserDepartmentsDto);
export type GenAuthSetUserDepartmentsResult = GenAuthSdkIsSuccessDto;

/** 设置用户 MFA 绑定手机号或者邮箱 */
export type GenAuthSetUserMfaBindSmsEmailInput = GenAuthSetUserMfaBindSmsEmailDto;
export type GenAuthSetUserMfaBindSmsEmailResult = GenAuthIsSuccessDto;

/** 用户绑定批量公共账号 */
export type GenAuthSetuserOfPublicAccountInput = GenAuthSdkSetUserOfPublicAccountBatchReqDto;
export type GenAuthSetuserOfPublicAccountResult = GenAuthSdkIsSuccessDto;

/** 用户设置岗位 */
export type GenAuthSetUserPostsInput = GenAuthSdkSetUserPostsDto;
export type GenAuthSetUserPostsResult = GenAuthSdkCommonResponseDto;

/** 设置用户 MFA 状态 */
export type GenAuthSetUsersMfaStatusInput = GenAuthSdkSetMfaStatusDto;
export type GenAuthSetUsersMfaStatusResult = GenAuthSdkIsSuccessDto;

/** 获取按应用统计的 Session 列表 */
export type GenAuthStatisticSessionsByAppInput = GenAuthListSessionManagementByAppViewDto;
export type GenAuthStatisticSessionsByAppResult = GenAuthSessionManagementByAppPagingDto;

/** 获取按设备统计的 Session 列表 */
export type GenAuthStatisticSessionsByDeviceInput = GenAuthListSessionManagementByDeviceViewDto;
export type GenAuthStatisticSessionsByDeviceResult = GenAuthSessionManagementByDevicePagingDto;

/** 获取按用户统计的 Session 列表 */
export type GenAuthStatisticSessionsByUserInput = GenAuthListSessionManagementByUserViewDto;
export type GenAuthStatisticSessionsByUserResult = GenAuthSessionManagementByUserPagingDto;

/** 挂起设备(用户详情页) */
export type GenAuthSuspendDeviceInput = GenAuthSdkSuspendTerminalUserDto;
export type GenAuthSuspendDeviceResult = GenAuthSdkCommonResponseDto;

/** 切换编排配置 */
export type GenAuthSwitchAuthFlowConfigInput = { "appId": string } & { "flowId": string };
export type GenAuthSwitchAuthFlowConfigResult = GenAuthAsaAccountDto;

/** 执行同步风险操作 */
export type GenAuthTriggerSyncRiskOperationsInput = (GenAuthSdkTriggerSyncRiskOperationDto) | (GenAuthTriggerSyncRiskOperationDto);
export type GenAuthTriggerSyncRiskOperationsResult = GenAuthSdkTriggerSyncRiskOperationsDataDto;

/** 执行同步任务 */
export type GenAuthTriggerSyncTaskInput = (GenAuthSdkTriggerSyncTaskDto) | (GenAuthTriggerSyncTaskDto);
export type GenAuthTriggerSyncTaskResult = GenAuthSdkTriggerSyncTaskDataDto;

/** 手动触发 Webhook 执行 */
export type GenAuthTriggerWebhookInput = (GenAuthSdkTriggerWebhookDto) | (GenAuthTriggerWebhookDto);
export type GenAuthTriggerWebhookResult = GenAuthSdkTriggerWebhookData;

/** 取消分配 ASA 账号 */
export type GenAuthUnassignAsaAccountInput = (GenAuthSdkAssignAsaAccountsDto) | (GenAuthAssignAsaAccountsDto);
export type GenAuthUnassignAsaAccountResult = GenAuthSdkIsSuccessDto;

/** 解绑公共账号关联岗位 */
export type GenAuthUnbindPublicAccountOfPostInput = GenAuthSdkUserConnectionPostDto;
export type GenAuthUnbindPublicAccountOfPostResult = GenAuthSdkIsSuccessDto;

/** 公共账号解绑用户 */
export type GenAuthUnbindUsersPublicAccountInput = GenAuthSdkUnbindPublicAccountBatchReqDto;
export type GenAuthUnbindUsersPublicAccountResult = GenAuthSdkIsSuccessDto;

/** 解除绑定用户在身份源下的所有身份信息 */
export type GenAuthUnlinkIdentityInput = (GenAuthSdkUnlinkIdentity) | (GenAuthUnlinkIdentity);
export type GenAuthUnlinkIdentityResult = GenAuthSdkUnlinkIdentityDataDto;

/** 更新一个管理员 AccessKey */
export type GenAuthUpdateAccessKeyInput = (GenAuthSdkUpdateAccessKeyDto) | (GenAuthUpdateAccessKeyDto);
export type GenAuthUpdateAccessKeyResult = GenAuthSdkIsSuccessDto;

/** 更新应用 */
export type GenAuthUpdateApplicationInput = (GenAuthSdkUpdateApplicationDto) | (GenAuthUpdateApplicationDto);
export type GenAuthUpdateApplicationResult = GenAuthSdkIsSuccessDto;

/** 修改应用多因素认证配置 */
export type GenAuthUpdateApplicationMfaSettingsInput = (GenAuthSdkUpdateApplicationMfaSettingsDto) | (GenAuthUpdateApplicationMfaSettingsDto);
export type GenAuthUpdateApplicationMfaSettingsResult = GenAuthSdkMFASettingsDto;

/** 更新应用默认访问授权策略 */
export type GenAuthUpdateApplicationPermissionStrategyInput = (GenAuthSdkUpdateApplicationPermissionStrategyDataDto) | (GenAuthUpdateApplicationPermissionStrategyDataDto);
export type GenAuthUpdateApplicationPermissionStrategyResult = GenAuthSdkIsSuccessDto;

/** 更新 ASA 账号 */
export type GenAuthUpdateAsaAccountInput = (GenAuthSdkUpdateAsaAccountDto) | (GenAuthUpdateAsaAccountDto);
export type GenAuthUpdateAsaAccountResult = GenAuthSdkAsaAccountDto;

/** 更新授权开关 */
export type GenAuthUpdateAuthEnabledInput = GenAuthUpdateAuthEnabledDto;
export type GenAuthUpdateAuthEnabledResult = GenAuthIsSuccessDto;

/** 更新编排配置 */
export type GenAuthUpdateAuthFlowConfigInput = Record<string, unknown>;
export type GenAuthUpdateAuthFlowConfigResult = GenAuthAsaAccountDto;

/** 修改 AuthFlowFunction 函数 */
export type GenAuthUpdateAuthFlowFunctionInput = GenAuthUpdatePipelineFunctionDto;
export type GenAuthUpdateAuthFlowFunctionResult = GenAuthPipelineFunctionDto;

/** 修改数据策略 */
export type GenAuthUpdateDataPolicyInput = (GenAuthSdkUpdateDataPolicyDto) | (GenAuthUpdateDataPolicyDto);
export type GenAuthUpdateDataPolicyResult = GenAuthSdkUpdateDataPolicyRespDto;

/** 修改数据资源 */
export type GenAuthUpdateDataResourceInput = (GenAuthSdkUpdateDataResourceDto) | (GenAuthUpdateDataResourceDto);
export type GenAuthUpdateDataResourceResult = GenAuthSdkUpdateDataResourceRespDto;

/** 修改部门 */
export type GenAuthUpdateDepartmentInput = (GenAuthSdkUpdateDepartmentReqDto) | (GenAuthUpdateDepartmentReqDto);
export type GenAuthUpdateDepartmentResult = GenAuthSdkDepartmentDto;

/** 更新部门状态 */
export type GenAuthUpdateDepartmentStatusInput = GenAuthUpdateDepartmentStatusReqDto;
export type GenAuthUpdateDepartmentStatusResult = GenAuthNode;

/** 更新树类型资源的扩展字段 */
export type GenAuthUpdateDnefInput = (GenAuthSdkUpdateDnefReq) | (GenAuthUpdateDnefReq);
export type GenAuthUpdateDnefResult = GenAuthSdkIsSuccessDto;

/** 编辑动态分组 */
export type GenAuthUpdateDynamicGroupInput = GenAuthUpdateDynamicGroupDto;
export type GenAuthUpdateDynamicGroupResult = GenAuthDynamicGroupDto;

/** 修改邮件模版 */
export type GenAuthUpdateEmailTemplateInput = GenAuthSdkUpdateEmailTemplateDto;
export type GenAuthUpdateEmailTemplateResult = GenAuthSdkEmailTemplateDto;

/** 更新身份源配置 */
export type GenAuthUpdateExtIdpInput = (GenAuthSdkUpdateExtIdpDto) | (GenAuthUpdateExtIdpDto);
export type GenAuthUpdateExtIdpResult = GenAuthSdkExtIdpDto;

/** 更新身份源连接 */
export type GenAuthUpdateExtIdpConnInput = (GenAuthSdkUpdateExtIdpConnDto) | (GenAuthUpdateExtIdpConnDto);
export type GenAuthUpdateExtIdpConnResult = GenAuthSdkExtIdpConnDetail;

/** 更新数据对象的字段 */
export type GenAuthUpdateFieldInput = GenAuthSdkUpdateFunctionModelFieldDto;
export type GenAuthUpdateFieldResult = GenAuthSdkFunctionModelFieldDto;

/** 修改全局多因素认证配置 */
export type GenAuthUpdateGlobalMfaSettingsInput = (GenAuthSdkMFASettingsDto) | (GenAuthMFASettingsDto);
export type GenAuthUpdateGlobalMfaSettingsResult = GenAuthSdkMFASettingsDto;

/** 修改分组 */
export type GenAuthUpdateGroupInput = (GenAuthSdkUpdateGroupReqDto) | (GenAuthUpdateGroupReqDto);
export type GenAuthUpdateGroupResult = GenAuthSdkGroupDto;

/** 更新邀请策略 */
export type GenAuthUpdateInvitationPolicyInput = GenAuthSdkUpdateInvitationPolicyDto;
export type GenAuthUpdateInvitationPolicyResult = GenAuthSdkGetInvitationPolicyDto;

/** 更新邀请名单 */
export type GenAuthUpdateInvitationRosterInput = GenAuthSdkUpdateInvitationRosterDto;
export type GenAuthUpdateInvitationRosterResult = GenAuthSdkInvitationRosterDto;

/** 获取邀请策略邮件模板 */
export type GenAuthUpdateInviteEmailTemplateInput = GenAuthSdkUpdateEmailTemplateDto;
export type GenAuthUpdateInviteEmailTemplateResult = GenAuthSdkEmailTemplateDto;

/** 更新 LDAP server 配置信息 */
export type GenAuthUpdateLdapConfigInfoInput = GenAuthSdkLdapUpdateDto;
export type GenAuthUpdateLdapConfigInfoResult = boolean;

/** 更新应用登录页配置 */
export type GenAuthUpdateLoginPageConfigInput = (GenAuthSdkUpdateLoginConfigDto) | (GenAuthTenantQuery & GenAuthUpdateLoginConfigDto);
export type GenAuthUpdateLoginPageConfigResult = GenAuthSdkIsSuccessDto;

/** 更新数据对象 */
export type GenAuthUpdateModelInput = GenAuthSdkUpdateFunctionModelDto;
export type GenAuthUpdateModelResult = GenAuthSdkFunctionModelDto;

/** 更新多租户管理员用户 */
export type GenAuthUpdateMultipleTenantAdminInput = GenAuthGetMultipleTenantAdminDto & GenAuthUpdateMultipleTenantAdminDto;
export type GenAuthUpdateMultipleTenantAdminResult = unknown;

/** 修改权限分组信息 */
export type GenAuthUpdateNamespaceInput = (GenAuthSdkUpdateNamespaceDto) | (GenAuthUpdateNamespaceDto);
export type GenAuthUpdateNamespaceResult = GenAuthSdkUpdateNamespaceDto;

/** 更新部门状态 */
export type GenAuthUpdateNodeStatusInput = GenAuthSdkUpdateDepartmentStatusReqDto;
export type GenAuthUpdateNodeStatusResult = Record<string, unknown>;

/** 更新操作管理 */
export type GenAuthUpdateOperateInput = GenAuthSdkUpdateOperateModelDto;
export type GenAuthUpdateOperateResult = GenAuthSdkCommonResponseDto;

/** 修改组织机构 */
export type GenAuthUpdateOrganizationInput = (GenAuthSdkUpdateOrganizationReqDto) | (GenAuthUpdateOrganizationReqDto);
export type GenAuthUpdateOrganizationResult = GenAuthSdkOrganizationDto;

/** 更新组织机构状态 */
export type GenAuthUpdateOrganizationStatusInput = (GenAuthSdkUpdateOrganizationStatusReqDto) | (GenAuthUpdateOrganizationStatusReqDto);
export type GenAuthUpdateOrganizationStatusResult = GenAuthSdkIsSuccessDto;

/** 修改权限空间 */
export type GenAuthUpdatePermissionNamespaceInput = (GenAuthSdkUpdatePermissionNamespaceDto) | (GenAuthUpdatePermissionNamespaceDto);
export type GenAuthUpdatePermissionNamespaceResult = GenAuthSdkUpdatePermissionNamespaceRespDto;

/** 修改 Pipeline 函数 */
export type GenAuthUpdatePipelineFunctionInput = (GenAuthSdkUpdatePipelineFunctionDto) | (GenAuthUpdatePipelineFunctionDto);
export type GenAuthUpdatePipelineFunctionResult = GenAuthSdkPipelineFunctionDto;

/** 修改 Pipeline 函数顺序 */
export type GenAuthUpdatePipelineOrderInput = (GenAuthSdkUpdatePipelineOrderDto) | (GenAuthUpdatePipelineOrderDto);
export type GenAuthUpdatePipelineOrderResult = GenAuthSdkCommonResponseDto;

/** 更新岗位信息 */
export type GenAuthUpdatePostInput = GenAuthSdkCreatePostDto;
export type GenAuthUpdatePostResult = GenAuthSdkPostInfoDto;

/** 修改公共账号资料 */
export type GenAuthUpdatePublicAccountInput = GenAuthSdkUpdatePublicAccountReqDto;
export type GenAuthUpdatePublicAccountResult = GenAuthSdkPublicAccountDto;

/** 批量修改公共账号资料 */
export type GenAuthUpdatePublicAccountBatchInput = GenAuthSdkUpdatePublicAccountBatchReqDto;
export type GenAuthUpdatePublicAccountBatchResult = (GenAuthSdkPublicAccountDto)[];

/** 更新策略流程配置补充信息 */
export type GenAuthUpdateRegisterExtendsFieldsInput = GenAuthSdkPolicyExtendsFieldsDto;
export type GenAuthUpdateRegisterExtendsFieldsResult = GenAuthSdkGetExtendsFieldsDto;

/** 修改资源 */
export type GenAuthUpdateResourceInput = (GenAuthSdkUpdateResourceDto) | (GenAuthUpdateResourceDto);
export type GenAuthUpdateResourceResult = GenAuthSdkResourceDto;

/** 修改角色 */
export type GenAuthUpdateRoleInput = (GenAuthSdkUpdateRoleDto) | (GenAuthUpdateRoleDto);
export type GenAuthUpdateRoleResult = GenAuthSdkIsSuccessDto;

/** 更新行 */
export type GenAuthUpdateRowInput = GenAuthSdkUpdateRowDto;
export type GenAuthUpdateRowResult = GenAuthSdkRowDto;

/** 更新设备互斥规则配置 */
export type GenAuthUpdateRuleSettingsInput = GenAuthSdkUpdateDeviceExclusiveRuleDto;
export type GenAuthUpdateRuleSettingsResult = GenAuthSdkGetDeviceExclusiveRuleDataDto;

/** 修改安全配置 */
export type GenAuthUpdateSecuritySettingsInput = (GenAuthSdkUpdateSecuritySettingsDto) | (GenAuthUpdateSecuritySettingsDto);
export type GenAuthUpdateSecuritySettingsResult = GenAuthSdkSecuritySettingsDto;

/** 修改同步任务 */
export type GenAuthUpdateSyncTaskInput = (GenAuthSdkUpdateSyncTaskDto) | (GenAuthUpdateSyncTaskDto);
export type GenAuthUpdateSyncTaskResult = GenAuthSdkSyncTaskPagingDto;

/** 更新租户数据 */
export type GenAuthUpdateTenantInput = (GenAuthSdkUpdateTenantDto) | (GenAuthUpdateTenantDto);
export type GenAuthUpdateTenantResult = GenAuthSdkIsSuccessDto;

/** 更新协调管理员 */
export type GenAuthUpdateTenantCooperatorInput = GenAuthGetTenantCooperatorDto & GenAuthUpdateTenantCooperatorDto;
export type GenAuthUpdateTenantCooperatorResult = unknown;

/** 修改租户企业认证 */
export type GenAuthUpdateTenantEnterpriseCertificationInput = (GenAuthSdkCreateTenantEnterpriseCertificationBodyDto) | (GenAuthCreateTenantEnterpriseCertificationBodyDto);
export type GenAuthUpdateTenantEnterpriseCertificationResult = GenAuthSdkIsSuccessDto;

/** 更新租户控制台扫码登录状态 */
export type GenAuthUpdateTenantQrCodeStateInput = GenAuthSdkUpdateTenantAppqrcodeState;
export type GenAuthUpdateTenantQrCodeStateResult = GenAuthSdkIsSuccessDto;

/** 更新租户成员 */
export type GenAuthUpdateTenantUserInput = (GenAuthSdkUpdateTenantUserDto) | (GenAuthUpdateTenantUserDto);
export type GenAuthUpdateTenantUserResult = GenAuthSdkIsSuccessDto;

/** 更新通用邀请配置 */
export type GenAuthUpdateUniversalInvitationInput = GenAuthSdkUpdateUniversalInvitationDto;
export type GenAuthUpdateUniversalInvitationResult = GenAuthSdkGetUniversalInvitationDto;

/** 修改用户资料 */
export type GenAuthUpdateUserInput = (GenAuthSdkUpdateUserReqDto) | (GenAuthUpdateUserReqDto);
export type GenAuthUpdateUserResult = GenAuthSdkUserDto;

/** 批量修改用户资料 */
export type GenAuthUpdateUserBatchInput = (GenAuthSdkUpdateUserBatchReqDto) | (GenAuthUpdateUserBatchReqDto);
export type GenAuthUpdateUserBatchResult = (GenAuthSdkUserDto)[];

/** 更新租户控制台扫码登录状态 */
export type GenAuthUpdateUserpoolTenantAppqrcodeStateInput = GenAuthUpdateTenantAppqrcodeState;
export type GenAuthUpdateUserpoolTenantAppqrcodeStateResult = GenAuthIsSuccessDto;

/** 更新用户池租户配置信息 */
export type GenAuthUpdateUserpoolTenantConfigInput = GenAuthUpdateUserPoolTenantLoginConfigDto;
export type GenAuthUpdateUserpoolTenantConfigResult = GenAuthIsSuccessDto;

/** 更新用户池租户配置信息 */
export type GenAuthUpdateUserPoolTenantConfigInput = GenAuthSdkUpdateUserPoolTenantLoginConfigDto;
export type GenAuthUpdateUserPoolTenantConfigResult = GenAuthSdkIsSuccessDto;

/** 修改 Webhook 配置 */
export type GenAuthUpdateWebhookInput = (GenAuthSdkUpdateWebhookDto) | (GenAuthUpdateWebhookDto);
export type GenAuthUpdateWebhookResult = GenAuthSdkWebhookDto;

/** 用户关联岗位 */
export type GenAuthUserConnectionPostInput = GenAuthSdkUserConnectionPostDto;
export type GenAuthUserConnectionPostResult = GenAuthSdkCommonResponseDto;

/** 用户属性解密 */
export type GenAuthUserFieldDecryptInput = GenAuthSdkUserFieldDecryptReqDto;
export type GenAuthUserFieldDecryptResult = (GenAuthSdkUserFieldDecryptRespItemDto)[];

/** 获取用户池租户配置信息 */
export type GenAuthUserpollTenantConfigInput = Record<never, never>;
export type GenAuthUserpollTenantConfigResult = GenAuthSdkUserPoolTenantConfigDto;

/** 获取用户池租户配置信息 */
export type GenAuthUserpoolTenantConfigInput = Record<never, never>;
export type GenAuthUserpoolTenantConfigResult = GenAuthUserPoolTenantConfigDto;

/** 用户属性解密 */
export type GenAuthUsersFieldDecryptInput = GenAuthUserFieldDecryptReqDto;
export type GenAuthUsersFieldDecryptResult = (GenAuthUserFieldDecryptRespItemDto)[];

/** 推送自定义事件 */
export type GenAuthVerifyEventInput = GenAuthSdkPubEventDto;
export type GenAuthVerifyEventResult = GenAuthSdkPubEventRespDataDto;

export interface GenAuthManagementOperations {
  /** 创建 ip 名单 */
  add: { input: GenAuthAddInput; result: GenAuthAddResult; optional: false };
  /** 部门下添加成员 */
  addDepartmentMembers: { input: GenAuthAddDepartmentMembersInput; result: GenAuthAddDepartmentMembersResult; optional: false };
  /** 新增设备 */
  addDevice: { input: GenAuthAddDeviceInput; result: GenAuthAddDeviceResult; optional: false };
  /** 添加分组成员 */
  addGroupMembers: { input: GenAuthAddGroupMembersInput; result: GenAuthAddGroupMembersResult; optional: false };
  /** 添加邀请策略用户归属 */
  addPolicyUserAttribution: { input: GenAuthAddPolicyUserAttributionInput; result: GenAuthAddPolicyUserAttributionResult; optional: false };
  /** 批量添加邀请策略用户归属 */
  addPolicyUserAttributionsBatch: { input: GenAuthAddPolicyUserAttributionsBatchInput; result: GenAuthAddPolicyUserAttributionsBatchResult; optional: false };
  /** 创建风险策略 */
  addRiskListPolicy: { input: GenAuthAddRiskListPolicyInput; result: GenAuthAddRiskListPolicyResult; optional: false };
  /** 租户部门下添加成员 */
  addTenantDepartmentMembers: { input: GenAuthAddTenantDepartmentMembersInput; result: GenAuthAddTenantDepartmentMembersResult; optional: false };
  /** 添加租户成员 */
  addTenantUsers: { input: GenAuthAddTenantUsersInput; result: GenAuthAddTenantUsersResult; optional: false };
  /** 创建用户名单 */
  addUser: { input: GenAuthAddUserInput; result: GenAuthAddUserResult; optional: false };
  /** 创建注册白名单 */
  addWhitelist: { input: GenAuthAddWhitelistInput; result: GenAuthAddWhitelistResult; optional: false };
  /** 创建应用注册白名单 */
  addWhitelistOfApp: { input: GenAuthAddWhitelistOfAppInput; result: GenAuthAddWhitelistOfAppResult; optional: false };
  /** 批量通过通用邀请的申请 */
  approval: { input: GenAuthApprovalInput; result: GenAuthApprovalResult; optional: false };
  /** 分配 ASA 账号 */
  assignAsaAccount: { input: GenAuthAssignAsaAccountInput; result: GenAuthAssignAsaAccountResult; optional: false };
  /** 单个角色批量授权 */
  assignRole: { input: GenAuthAssignRoleInput; result: GenAuthAssignRoleResult; optional: false };
  /** 批量分配角色 */
  assignRoleBatch: { input: GenAuthAssignRoleBatchInput; result: GenAuthAssignRoleBatchResult; optional: false };
  /** 关联/取消关联应用资源到租户 */
  associateTenantResource: { input: GenAuthAssociateTenantResourceInput; result: GenAuthAssociateTenantResourceResult; optional: false };
  /** 授权应用访问权限 */
  authorizeApplicationAccess: { input: GenAuthAuthorizeApplicationAccessInput; result: GenAuthAuthorizeApplicationAccessResult; optional: false };
  /** 授权数据策略 */
  authorizeDataPolicies: { input: GenAuthAuthorizeDataPoliciesInput; result: GenAuthAuthorizeDataPoliciesResult; optional: false };
  /** 授权资源 */
  authorizeResources: { input: GenAuthAuthorizeResourcesInput; result: GenAuthAuthorizeResourcesResult; optional: false };
  /** 批量删除应用授权 */
  batchApplicationsAuth: { input: GenAuthBatchApplicationsAuthInput; result: GenAuthBatchApplicationsAuthResult; optional: false };
  /** 更新邀请名单，批量关联邀请策略 */
  batchBindPolicy: { input: GenAuthBatchBindPolicyInput; result: GenAuthBatchBindPolicyResult; optional: false };
  /** 批量创建树类型资源的扩展字段 */
  batchCreateDnef: { input: GenAuthBatchCreateDnefInput; result: GenAuthBatchCreateDnefResult; optional: false };
  /** 批量删除资源 */
  batchDeleteCommonResource: { input: GenAuthBatchDeleteCommonResourceInput; result: GenAuthBatchDeleteCommonResourceResult; optional: false };
  /** 批量删除邀请策略 */
  batchDeleteInvitationPolicies: { input: GenAuthBatchDeleteInvitationPoliciesInput; result: GenAuthBatchDeleteInvitationPoliciesResult; optional: false };
  /** 批量获取用户密码密文 */
  batchGetUserEncryptPassword: { input: GenAuthBatchGetUserEncryptPasswordInput; result: GenAuthBatchGetUserEncryptPasswordResult; optional: false };
  /** 批量处理审批 */
  batchProcessApproval: { input: GenAuthBatchProcessApprovalInput; result: GenAuthBatchProcessApprovalResult; optional: false };
  /** 更新邀请名单，根据策略 Id 批量解除关联 */
  batchUnbindPolicy: { input: GenAuthBatchUnbindPolicyInput; result: GenAuthBatchUnbindPolicyResult; optional: false };
  /** 公共账号绑定批量角色 */
  bindPublicAccountOfRoles: { input: GenAuthBindPublicAccountOfRolesInput; result: GenAuthBindPublicAccountOfRolesResult; optional: false };
  /** 公共账号绑定批量用户 */
  bindUsersPublicAccount: { input: GenAuthBindUsersPublicAccountInput; result: GenAuthBindUsersPublicAccountResult; optional: false };
  /** 取消同步风险操作 */
  cancelSyncRiskOperation: { input: GenAuthCancelSyncRiskOperationInput; result: GenAuthCancelSyncRiskOperationResult; optional: false };
  /** UEBA 上传 */
  capture: { input: GenAuthCaptureInput; result: GenAuthCaptureResult; optional: false };
  /** 租户关联身份源 */
  changeExtIdpConnAssociationState: { input: GenAuthChangeExtIdpConnAssociationStateInput; result: GenAuthChangeExtIdpConnAssociationStateResult; optional: false };
  /** 身份源连接开关 */
  changeExtIdpConnState: { input: GenAuthChangeExtIdpConnStateInput; result: GenAuthChangeExtIdpConnStateResult; optional: false };
  /** 个人账号转换为公共账号 */
  changeIntoPublicAccount: { input: GenAuthChangeIntoPublicAccountInput; result: GenAuthChangeIntoPublicAccountResult; optional: false };
  /** 设置用户池多租户身份源连接 */
  changeUserpoolTenanExtIdpConnState: { input: GenAuthChangeUserpoolTenanExtIdpConnStateInput; result: GenAuthChangeUserpoolTenanExtIdpConnStateResult; optional: false };
  /** 设置用户池多租户身份源连接 */
  changeUserpoolTenantExtIdpConnState: { input: GenAuthChangeUserpoolTenantExtIdpConnStateInput; result: GenAuthChangeUserpoolTenantExtIdpConnStateResult; optional: false };
  /** 检查数据策略名称是否可用 */
  checkDataPolicyExists: { input: GenAuthCheckDataPolicyExistsInput; result: GenAuthCheckDataPolicyExistsResult; optional: false };
  /** 检查数据资源 Code 或者名称是否可用 */
  checkDataResourceExists: { input: GenAuthCheckDataResourceExistsInput; result: GenAuthCheckDataResourceExistsResult; optional: false };
  /** 检测域名是否可用 */
  checkDomainAvailable: { input: GenAuthCheckDomainAvailableInput; result: GenAuthCheckDomainAvailableResult; optional: false };
  /** 判断外部用户权限 */
  checkExternalUserPermission: { input: GenAuthCheckExternalUserPermissionInput; result: GenAuthCheckExternalUserPermissionResult; optional: false };
  /** 判断 m2m 权限 */
  checkM2mPermission: { input: GenAuthCheckM2mPermissionInput; result: GenAuthCheckM2mPermissionResult; optional: false };
  /** 判断 m2m 在树资源同层级下的权限（推荐） */
  checkM2mSameLevelPermission: { input: GenAuthCheckM2mSameLevelPermissionInput; result: GenAuthCheckM2mSameLevelPermissionResult; optional: false };
  /** 检测角色互斥 */
  checkMutualExclusion: { input: GenAuthCheckMutualExclusionInput; result: GenAuthCheckMutualExclusionResult; optional: false };
  /** 校验角色 Code 或者名称是否可用 */
  checkParamsNamespace: { input: GenAuthCheckParamsNamespaceInput; result: GenAuthCheckParamsNamespaceResult; optional: false };
  /** 判断用户权限（重点） */
  checkPermission: { input: GenAuthCheckPermissionInput; result: GenAuthCheckPermissionResult; optional: false };
  /** 校验权限空间 Code 或者名称是否可用 */
  checkPermissionNamespaceExists: { input: GenAuthCheckPermissionNamespaceExistsInput; result: GenAuthCheckPermissionNamespaceExistsResult; optional: true };
  /** 检测角色互斥 */
  checkRoleMutualExclusion: { input: GenAuthCheckRoleMutualExclusionInput; result: GenAuthCheckRoleMutualExclusionResult; optional: false };
  /** 校验角色 Code 或者名称是否可用 */
  checkRoleParams: { input: GenAuthCheckRoleParamsInput; result: GenAuthCheckRoleParamsResult; optional: false };
  /** 检查某个用户在应用下是否具备 Session 登录态 */
  checkSessionStatus: { input: GenAuthCheckSessionStatusInput; result: GenAuthCheckSessionStatusResult; optional: false };
  /** 判断用户在树资源同层级下的权限（推荐） */
  checkUserSameLevelPermission: { input: GenAuthCheckUserSameLevelPermissionInput; result: GenAuthCheckUserSameLevelPermissionResult; optional: false };
  /** 获取已办审批列表 */
  closedList: { input: GenAuthClosedListInput; result: GenAuthClosedListResult; optional: true };
  /** 关闭全局多因素认证配置 */
  closeGlobalMfaSettings: { input: GenAuthCloseGlobalMfaSettingsInput; result: GenAuthCloseGlobalMfaSettingsResult; optional: false };
  /** 配置第三方邮件服务 */
  configEmailProvider: { input: GenAuthConfigEmailProviderInput; result: GenAuthConfigEmailProviderResult; optional: false };
  /** 复制编排配置 */
  copyAuthFlowConfig: { input: GenAuthCopyAuthFlowConfigInput; result: GenAuthCopyAuthFlowConfigResult; optional: false };
  /** 创建邀请策略副本 */
  copyInvitationPolicyById: { input: GenAuthCopyInvitationPolicyByIdInput; result: GenAuthCopyInvitationPolicyByIdResult; optional: false };
  /** 复制自定义操作 */
  copyOperate: { input: GenAuthCopyOperateInput; result: GenAuthCopyOperateResult; optional: false };
  /** 复制行关联关系 */
  copyRowRelation: { input: GenAuthCopyRowRelationInput; result: GenAuthCopyRowRelationResult; optional: false };
  /** 创建协作管理员的 AK/SK */
  createAccessKey: { input: GenAuthCreateAccessKeyInput; result: GenAuthCreateAccessKeyResult; optional: false };
  /** 创建管理员角色 */
  createAdminRole: { input: GenAuthCreateAdminRoleInput; result: GenAuthCreateAdminRoleResult; optional: false };
  /** 创建应用 */
  createApplication: { input: GenAuthCreateApplicationInput; result: GenAuthCreateApplicationResult; optional: false };
  /** 创建数组数据资源 */
  createArrayDataResource: { input: GenAuthCreateArrayDataResourceInput; result: GenAuthCreateArrayDataResourceResult; optional: false };
  /** 创建 ASA 账号 */
  createAsaAccount: { input: GenAuthCreateAsaAccountInput; result: GenAuthCreateAsaAccountResult; optional: false };
  /** 批量创建 ASA 账号 */
  createAsaAccountBatch: { input: GenAuthCreateAsaAccountBatchInput; result: GenAuthCreateAsaAccountBatchResult; optional: false };
  /** 批量创建 ASA 账号 */
  createAsaAccountsBatch: { input: GenAuthCreateAsaAccountsBatchInput; result: GenAuthCreateAsaAccountsBatchResult; optional: false };
  /** 创建应用认证配置 */
  createAuthFlowAppConfig: { input: GenAuthCreateAuthFlowAppConfigInput; result: GenAuthCreateAuthFlowAppConfigResult; optional: false };
  /** 创建 AuthFlowFunction 函数 */
  createAuthFlowFunction: { input: GenAuthCreateAuthFlowFunctionInput; result: GenAuthCreateAuthFlowFunctionResult; optional: false };
  /** 创建数据策略（重点） */
  createDataPolicy: { input: GenAuthCreateDataPolicyInput; result: GenAuthCreateDataPolicyResult; optional: false };
  /** 创建数据资源（推荐、重点） */
  createDataResource: { input: GenAuthCreateDataResourceInput; result: GenAuthCreateDataResourceResult; optional: false };
  /** 创建数组数据资源 */
  createDataResourceByArray: { input: GenAuthCreateDataResourceByArrayInput; result: GenAuthCreateDataResourceByArrayResult; optional: false };
  /** 创建字符串数据资源 */
  createDataResourceByString: { input: GenAuthCreateDataResourceByStringInput; result: GenAuthCreateDataResourceByStringResult; optional: false };
  /** 创建树数据资源 */
  createDataResourceByTree: { input: GenAuthCreateDataResourceByTreeInput; result: GenAuthCreateDataResourceByTreeResult; optional: false };
  /** 创建部门 */
  createDepartment: { input: GenAuthCreateDepartmentInput; result: GenAuthCreateDepartmentResult; optional: false };
  /** 根据组织树批量创建部门 */
  createDepartmentTree: { input: GenAuthCreateDepartmentTreeInput; result: GenAuthCreateDepartmentTreeResult; optional: false };
  /** 新增设备 */
  createDevice: { input: GenAuthCreateDeviceInput; result: GenAuthCreateDeviceResult; optional: false };
  /** 创建树类型资源的扩展字段 */
  createDnef: { input: GenAuthCreateDnefInput; result: GenAuthCreateDnefResult; optional: false };
  /** 创建动态分组 */
  createDynamicGroup: { input: GenAuthCreateDynamicGroupInput; result: GenAuthCreateDynamicGroupResult; optional: false };
  /** 创建自定义事件应用 */
  createEventApp: { input: GenAuthCreateEventAppInput; result: GenAuthCreateEventAppResult; optional: false };
  /** 创建身份源 */
  createExtIdp: { input: GenAuthCreateExtIdpInput; result: GenAuthCreateExtIdpResult; optional: false };
  /** 在某个已有身份源下创建新连接 */
  createExtIdpConn: { input: GenAuthCreateExtIdpConnInput; result: GenAuthCreateExtIdpConnResult; optional: false };
  /** 创建数据对象的字段 */
  createField: { input: GenAuthCreateFieldInput; result: GenAuthCreateFieldResult; optional: false };
  /** 创建分组 */
  createGroup: { input: GenAuthCreateGroupInput; result: GenAuthCreateGroupResult; optional: false };
  /** 批量创建分组 */
  createGroupsBatch: { input: GenAuthCreateGroupsBatchInput; result: GenAuthCreateGroupsBatchResult; optional: false };
  /** 创建邀请策略 */
  createInvitationPolicy: { input: GenAuthCreateInvitationPolicyInput; result: GenAuthCreateInvitationPolicyResult; optional: false };
  /** 创建邀请名单 */
  createInvitationRoster: { input: GenAuthCreateInvitationRosterInput; result: GenAuthCreateInvitationRosterResult; optional: false };
  /** 创建数据对象 */
  createModel: { input: GenAuthCreateModelInput; result: GenAuthCreateModelResult; optional: false };
  /** 创建多租户管理员用户 */
  createMultipleTenantAdmin: { input: GenAuthCreateMultipleTenantAdminInput; result: GenAuthCreateMultipleTenantAdminResult; optional: false };
  /** 创建权限分组 */
  createNamespace: { input: GenAuthCreateNamespaceInput; result: GenAuthCreateNamespaceResult; optional: false };
  /** 批量创建权限分组 */
  createNamespacesBatch: { input: GenAuthCreateNamespacesBatchInput; result: GenAuthCreateNamespacesBatchResult; optional: false };
  /** 创建自定义操作 */
  createOperate: { input: GenAuthCreateOperateInput; result: GenAuthCreateOperateResult; optional: false };
  /** 创建组织机构 */
  createOrganization: { input: GenAuthCreateOrganizationInput; result: GenAuthCreateOrganizationResult; optional: false };
  /** 创建或修改分组 */
  createOrUpdateGroup: { input: GenAuthCreateOrUpdateGroupInput; result: GenAuthCreateOrUpdateGroupResult; optional: false };
  /** 创建权限空间 */
  createPermissionNamespace: { input: GenAuthCreatePermissionNamespaceInput; result: GenAuthCreatePermissionNamespaceResult; optional: false };
  /** 批量创建权限空间 */
  createPermissionNamespacesBatch: { input: GenAuthCreatePermissionNamespacesBatchInput; result: GenAuthCreatePermissionNamespacesBatchResult; optional: false };
  /** 创建 Pipeline 函数 */
  createPipelineFunction: { input: GenAuthCreatePipelineFunctionInput; result: GenAuthCreatePipelineFunctionResult; optional: false };
  /** 创建岗位 */
  createPost: { input: GenAuthCreatePostInput; result: GenAuthCreatePostResult; optional: false };
  /** 创建编程访问账号 */
  createProgrammaticAccessAccount: { input: GenAuthCreateProgrammaticAccessAccountInput; result: GenAuthCreateProgrammaticAccessAccountResult; optional: false };
  /** 创建公共账号 */
  createPublicAccount: { input: GenAuthCreatePublicAccountInput; result: GenAuthCreatePublicAccountResult; optional: true };
  /** 批量创建公共账号 */
  createPublicAccountsBatch: { input: GenAuthCreatePublicAccountsBatchInput; result: GenAuthCreatePublicAccountsBatchResult; optional: false };
  /** 创建资源 */
  createResource: { input: GenAuthCreateResourceInput; result: GenAuthCreateResourceResult; optional: false };
  /** 批量创建资源 */
  createResourcesBatch: { input: GenAuthCreateResourcesBatchInput; result: GenAuthCreateResourcesBatchResult; optional: false };
  /** 创建角色 */
  createRole: { input: GenAuthCreateRoleInput; result: GenAuthCreateRoleResult; optional: false };
  /** 批量创建角色 */
  createRolesBatch: { input: GenAuthCreateRolesBatchInput; result: GenAuthCreateRolesBatchResult; optional: false };
  /** 添加行 */
  createRow: { input: GenAuthCreateRowInput; result: GenAuthCreateRowResult; optional: false };
  /** 创建行关联数据 */
  createRowRelation: { input: GenAuthCreateRowRelationInput; result: GenAuthCreateRowRelationResult; optional: false };
  /** 创建字符串数据资源 */
  createStringDataResource: { input: GenAuthCreateStringDataResourceInput; result: GenAuthCreateStringDataResourceResult; optional: false };
  /** 创建同步任务 */
  createSyncTask: { input: GenAuthCreateSyncTaskInput; result: GenAuthCreateSyncTaskResult; optional: false };
  /** 创建租户 */
  createTenant: { input: GenAuthCreateTenantInput; result: GenAuthCreateTenantResult; optional: false };
  /** 创建协调管理员 */
  createTenantCooperator: { input: GenAuthCreateTenantCooperatorInput; result: GenAuthCreateTenantCooperatorResult; optional: false };
  /** 创建租户企业认证 */
  createTenantEnterpriseCertification: { input: GenAuthCreateTenantEnterpriseCertificationInput; result: GenAuthCreateTenantEnterpriseCertificationResult; optional: false };
  /** 创建租户成员 */
  createTenantUser: { input: GenAuthCreateTenantUserInput; result: GenAuthCreateTenantUserResult; optional: false };
  /** 创建树数据资源 */
  createTreeDataResource: { input: GenAuthCreateTreeDataResourceInput; result: GenAuthCreateTreeDataResourceResult; optional: false };
  /** 创建用户 */
  createUser: { input: GenAuthCreateUserInput; result: GenAuthCreateUserResult; optional: true };
  /** 批量创建用户 */
  createUsersBatch: { input: GenAuthCreateUsersBatchInput; result: GenAuthCreateUsersBatchResult; optional: false };
  /** 新增 verify 设备 */
  createVerifyDevice: { input: GenAuthCreateVerifyDeviceInput; result: GenAuthCreateVerifyDeviceResult; optional: false };
  /** 创建 Webhook */
  createWebhook: { input: GenAuthCreateWebhookInput; result: GenAuthCreateWebhookResult; optional: false };
  /** 停用全部 Session */
  deactivateAllSessions: { input: GenAuthDeactivateAllSessionsInput; result: GenAuthDeactivateAllSessionsResult; optional: false };
  /** 批量停用 Session */
  deactivateSessionsBatch: { input: GenAuthDeactivateSessionsBatchInput; result: GenAuthDeactivateSessionsBatchResult; optional: false };
  /** 定义自定义事件 */
  defineEvent: { input: GenAuthDefineEventInput; result: GenAuthDefineEventResult; optional: false };
  /** 删除协作管理员的 AK/SK */
  deleteAccessKey: { input: GenAuthDeleteAccessKeyInput; result: GenAuthDeleteAccessKeyResult; optional: false };
  /** 删除管理员自定义角色 */
  deleteAdminRoles: { input: GenAuthDeleteAdminRolesInput; result: GenAuthDeleteAdminRolesResult; optional: false };
  /** 删除管理员自定义角色 */
  deleteAdminRolesBatch: { input: GenAuthDeleteAdminRolesBatchInput; result: GenAuthDeleteAdminRolesBatchResult; optional: false };
  /** 删除应用 */
  deleteApplication: { input: GenAuthDeleteApplicationInput; result: GenAuthDeleteApplicationResult; optional: false };
  /** 删除 ASA 账号 */
  deleteAsaAccount: { input: GenAuthDeleteAsaAccountInput; result: GenAuthDeleteAsaAccountResult; optional: false };
  /** 批量删除 ASA 账号 */
  deleteAsaAccountBatch: { input: GenAuthDeleteAsaAccountBatchInput; result: GenAuthDeleteAsaAccountBatchResult; optional: false };
  /** 批量删除 ASA 账号 */
  deleteAsaAccountsBatch: { input: GenAuthDeleteAsaAccountsBatchInput; result: GenAuthDeleteAsaAccountsBatchResult; optional: false };
  /** 批量删除应用授权 */
  deleteAuth: { input: GenAuthDeleteAuthInput; result: GenAuthDeleteAuthResult; optional: false };
  /** 删除编排配置 */
  deleteAuthFlowConfig: { input: GenAuthDeleteAuthFlowConfigInput; result: GenAuthDeleteAuthFlowConfigResult; optional: true };
  /** 删除 AuthFlowFunction 函数 */
  deleteAuthFlowFunction: { input: GenAuthDeleteAuthFlowFunctionInput; result: GenAuthDeleteAuthFlowFunctionResult; optional: false };
  /** 删除 ip 名单 */
  deleteById: { input: GenAuthDeleteByIdInput; result: GenAuthDeleteByIdResult; optional: false };
  /** 批量删除常规资源授权列表 */
  deleteCommonAuthorizeBatch: { input: GenAuthDeleteCommonAuthorizeBatchInput; result: GenAuthDeleteCommonAuthorizeBatchResult; optional: true };
  /** 批量删除资源 */
  deleteCommonResourcesBatch: { input: GenAuthDeleteCommonResourcesBatchInput; result: GenAuthDeleteCommonResourcesBatchResult; optional: false };
  /** 删除自定义字段定义 */
  deleteCustomFields: { input: GenAuthDeleteCustomFieldsInput; result: GenAuthDeleteCustomFieldsResult; optional: false };
  /** 删除数据策略 */
  deleteDataPolicy: { input: GenAuthDeleteDataPolicyInput; result: GenAuthDeleteDataPolicyResult; optional: false };
  /** 删除数据资源 */
  deleteDataResource: { input: GenAuthDeleteDataResourceInput; result: GenAuthDeleteDataResourceResult; optional: false };
  /** 删除部门 */
  deleteDepartment: { input: GenAuthDeleteDepartmentInput; result: GenAuthDeleteDepartmentResult; optional: false };
  /** 删除部门和子部门 */
  deleteDepartmentAndChilds: { input: GenAuthDeleteDepartmentAndChildsInput; result: GenAuthDeleteDepartmentAndChildsResult; optional: false };
  /** 删除部门同步关联关系 */
  deleteDepartmentSyncRelations: { input: GenAuthDeleteDepartmentSyncRelationsInput; result: GenAuthDeleteDepartmentSyncRelationsResult; optional: false };
  /** 移除绑定(用户详情页) */
  deleteDevice: { input: GenAuthDeleteDeviceInput; result: GenAuthDeleteDeviceResult; optional: false };
  /** 删除树类型资源的扩展字段 */
  deleteDnef: { input: GenAuthDeleteDnefInput; result: GenAuthDeleteDnefResult; optional: false };
  /** 删除身份源 */
  deleteExtIdp: { input: GenAuthDeleteExtIdpInput; result: GenAuthDeleteExtIdpResult; optional: false };
  /** 删除身份源连接 */
  deleteExtIdpConn: { input: GenAuthDeleteExtIdpConnInput; result: GenAuthDeleteExtIdpConnResult; optional: false };
  /** 批量删除分组 */
  deleteGroupsBatch: { input: GenAuthDeleteGroupsBatchInput; result: GenAuthDeleteGroupsBatchResult; optional: false };
  /** 删除邀请名单 */
  deleteInvitationRoster: { input: GenAuthDeleteInvitationRosterInput; result: GenAuthDeleteInvitationRosterResult; optional: false };
  /** 批量删除邀请名单 */
  deleteInvitationRosterBatch: { input: GenAuthDeleteInvitationRosterBatchInput; result: GenAuthDeleteInvitationRosterBatchResult; optional: false };
  /** 批量删除名单中的受邀人 */
  deleteInvitees: { input: GenAuthDeleteInviteesInput; result: GenAuthDeleteInviteesResult; optional: false };
  /** 删除多租户管理员用户 */
  deleteMultipleTenantAdmin: { input: GenAuthDeleteMultipleTenantAdminInput; result: GenAuthDeleteMultipleTenantAdminResult; optional: true };
  /** 删除权限分组信息 */
  deleteNamespace: { input: GenAuthDeleteNamespaceInput; result: GenAuthDeleteNamespaceResult; optional: false };
  /** 批量删除权限分组 */
  deleteNamespacesBatch: { input: GenAuthDeleteNamespacesBatchInput; result: GenAuthDeleteNamespacesBatchResult; optional: false };
  /** 删除组织机构 */
  deleteOrganization: { input: GenAuthDeleteOrganizationInput; result: GenAuthDeleteOrganizationResult; optional: false };
  /** 删除权限空间 */
  deletePermissionNamespace: { input: GenAuthDeletePermissionNamespaceInput; result: GenAuthDeletePermissionNamespaceResult; optional: false };
  /** 批量删除权限空间 */
  deletePermissionNamespacesBatch: { input: GenAuthDeletePermissionNamespacesBatchInput; result: GenAuthDeletePermissionNamespacesBatchResult; optional: false };
  /** 删除 Pipeline 函数 */
  deletePipelineFunction: { input: GenAuthDeletePipelineFunctionInput; result: GenAuthDeletePipelineFunctionResult; optional: false };
  /** 删除编程访问账号 */
  deleteProgrammaticAccessAccount: { input: GenAuthDeleteProgrammaticAccessAccountInput; result: GenAuthDeleteProgrammaticAccessAccountResult; optional: false };
  /** 批量删除公共账号 */
  deletePublicAccountsBatch: { input: GenAuthDeletePublicAccountsBatchInput; result: GenAuthDeletePublicAccountsBatchResult; optional: false };
  /** 删除资源 */
  deleteResource: { input: GenAuthDeleteResourceInput; result: GenAuthDeleteResourceResult; optional: false };
  /** 批量删除资源 */
  deleteResourcesBatch: { input: GenAuthDeleteResourcesBatchInput; result: GenAuthDeleteResourcesBatchResult; optional: true };
  /** 删除风险策略 */
  deleteRiskListPolicyById: { input: GenAuthDeleteRiskListPolicyByIdInput; result: GenAuthDeleteRiskListPolicyByIdResult; optional: false };
  /** 跨权限分组（空间）删除角色 */
  deleteRoles: { input: GenAuthDeleteRolesInput; result: GenAuthDeleteRolesResult; optional: false };
  /** 单个权限分组（权限空间）内删除角色 */
  deleteRolesBatch: { input: GenAuthDeleteRolesBatchInput; result: GenAuthDeleteRolesBatchResult; optional: false };
  /** 删除租户 */
  deleteTenant: { input: GenAuthDeleteTenantInput; result: GenAuthDeleteTenantResult; optional: false };
  /** 取消设置租户管理员 */
  deleteTenantAdmin: { input: GenAuthDeleteTenantAdminInput; result: GenAuthDeleteTenantAdminResult; optional: false };
  /** 删除协调管理员 */
  deleteTenantCooperator: { input: GenAuthDeleteTenantCooperatorInput; result: GenAuthDeleteTenantCooperatorResult; optional: true };
  /** 批量移除租户成员 */
  deleteTenantUser: { input: GenAuthDeleteTenantUserInput; result: GenAuthDeleteTenantUserResult; optional: false };
  /** 删除用户名单 */
  deleteUserListById: { input: GenAuthDeleteUserListByIdInput; result: GenAuthDeleteUserListByIdResult; optional: false };
  /** 批量删除用户 */
  deleteUsersBatch: { input: GenAuthDeleteUsersBatchInput; result: GenAuthDeleteUsersBatchResult; optional: false };
  /** 删除用户同步关联关系 */
  deleteUserSyncRelations: { input: GenAuthDeleteUserSyncRelationsInput; result: GenAuthDeleteUserSyncRelationsResult; optional: false };
  /** 删除 Webhook */
  deleteWebhook: { input: GenAuthDeleteWebhookInput; result: GenAuthDeleteWebhookResult; optional: false };
  /** 删除注册白名单 */
  deleteWhitelist: { input: GenAuthDeleteWhitelistInput; result: GenAuthDeleteWhitelistResult; optional: false };
  /** 删除应用注册白名单 */
  deleteWhitelistOfApp: { input: GenAuthDeleteWhitelistOfAppInput; result: GenAuthDeleteWhitelistOfAppResult; optional: false };
  /** 主体授权详情 */
  detailAuthSubject: { input: GenAuthDetailAuthSubjectInput; result: GenAuthDetailAuthSubjectResult; optional: false };
  /** 关闭编排 */
  disabledAuthFlowApp: { input: GenAuthDisabledAuthFlowAppInput; result: GenAuthDisabledAuthFlowAppResult; optional: false };
  /** 停用设备(用户详情页) */
  disableDevice: { input: GenAuthDisableDeviceInput; result: GenAuthDisableDeviceResult; optional: false };
  /** 关闭全局多因素认证配置 */
  disableGlobalMfaSettings: { input: GenAuthDisableGlobalMfaSettingsInput; result: GenAuthDisableGlobalMfaSettingsResult; optional: false };
  /** 关闭 LDAP server 服务，关闭前必须先初始化 */
  disableLdapServer: { input: GenAuthDisableLdapServerInput; result: GenAuthDisableLdapServerResult; optional: false };
  /** 禁用编程访问账号 */
  disableProgrammaticAccessAccount: { input: GenAuthDisableProgrammaticAccessAccountInput; result: GenAuthDisableProgrammaticAccessAccountResult; optional: false };
  /** 部门模糊查询 */
  dynamicGroupSearchPart: { input: GenAuthDynamicGroupSearchPartInput; result: GenAuthDynamicGroupSearchPartResult; optional: true };
  /** 更新授权开关 */
  enabledAuth: { input: GenAuthEnabledAuthInput; result: GenAuthEnabledAuthResult; optional: false };
  /** 开启编排 */
  enabledAuthFlowApp: { input: GenAuthEnabledAuthFlowAppInput; result: GenAuthEnabledAuthFlowAppResult; optional: false };
  /** 启用设备(用户详情页) */
  enableDevice: { input: GenAuthEnableDeviceInput; result: GenAuthEnableDeviceResult; optional: false };
  /** 启用编程访问账号 */
  enableProgrammaticAccessAccount: { input: GenAuthEnableProgrammaticAccessAccountInput; result: GenAuthEnableProgrammaticAccessAccountResult; optional: false };
  /** 执行自定义操作 */
  executeOperate: { input: GenAuthExecuteOperateInput; result: GenAuthExecuteOperateResult; optional: false };
  /** 导出全部数据 */
  exportMetadata: { input: GenAuthExportMetadataInput; result: GenAuthExportMetadataResult; optional: false };
  /** 导出数据对象 */
  exportModel: { input: GenAuthExportModelInput; result: GenAuthExportModelResult; optional: false };
  /** 导出名单内受邀人 */
  exportUsers: { input: GenAuthExportUsersInput; result: GenAuthExportUsersResult; optional: false };
  /** 身份源下应用的连接详情 */
  extIdpConnApps: { input: GenAuthExtIdpConnAppsInput; result: GenAuthExtIdpConnAppsResult; optional: false };
  /** 身份源下应用的连接详情 */
  extIdpConnStateByApps: { input: GenAuthExtIdpConnStateByAppsInput; result: GenAuthExtIdpConnStateByAppsResult; optional: false };
  /** 查询通用邀请申请列表 */
  filter: { input: GenAuthFilterInput; result: GenAuthFilterResult; optional: true };
  /** 查看名单内受邀人 */
  filterUsers: { input: GenAuthFilterUsersInput; result: GenAuthFilterUsersResult; optional: false };
  /** 获取支持设备互斥生效范围的应用列表 */
  findAppLists: { input: GenAuthFindAppListsInput; result: GenAuthFindAppListsResult; optional: false };
  /** 获取 ip 列表 */
  findIpList: { input: GenAuthFindIpListInput; result: GenAuthFindIpListResult; optional: false };
  /** 最近登录应用 */
  findLastLoginAppsByDeviceIds: { input: GenAuthFindLastLoginAppsByDeviceIdsInput; result: GenAuthFindLastLoginAppsByDeviceIdsResult; optional: false };
  /** 最近登录应用 */
  findLastLoginAppsByDeviceIdsV2: { input: GenAuthFindLastLoginAppsByDeviceIdsV2Input; result: GenAuthFindLastLoginAppsByDeviceIdsV2Result; optional: false };
  /** 获取风险策略列表 */
  findRiskListPolicy: { input: GenAuthFindRiskListPolicyInput; result: GenAuthFindRiskListPolicyResult; optional: false };
  /** 获取风险名单用户列表 */
  findUserList: { input: GenAuthFindUserListInput; result: GenAuthFindUserListResult; optional: false };
  /** 生成一个邀请租户成员的链接 */
  generateInviteTenantUserLink: { input: GenAuthGenerateInviteTenantUserLinkInput; result: GenAuthGenerateInviteTenantUserLinkResult; optional: false };
  /** 生成通用邀请链接 */
  generateUniversalInvitation: { input: GenAuthGenerateUniversalInvitationInput; result: GenAuthGenerateUniversalInvitationResult; optional: true };
  /** 获取协作管理员 AK/SK 详细信息 */
  getAccessKey: { input: GenAuthGetAccessKeyInput; result: GenAuthGetAccessKeyResult; optional: false };
  /** 获取协作管理员 AK/SK 列表 */
  getAccessKeyList: { input: GenAuthGetAccessKeyListInput; result: GenAuthGetAccessKeyListResult; optional: true };
  /** 获取管理员操作日志 */
  getAdminAuditLogs: { input: GenAuthGetAdminAuditLogsInput; result: GenAuthGetAdminAuditLogsResult; optional: true };
  /** 获取所有部门列表 */
  getAllDepartments: { input: GenAuthGetAllDepartmentsInput; result: GenAuthGetAllDepartmentsResult; optional: false };
  /** 获取所有分组 */
  getAllGroups: { input: GenAuthGetAllGroupsInput; result: GenAuthGetAllGroupsResult; optional: true };
  /** 获取全部数据对象数据 */
  getAllMetadata: { input: GenAuthGetAllMetadataInput; result: GenAuthGetAllMetadataResult; optional: false };
  /** 获取全部元数据行信息 */
  getAllMetadataRow: { input: GenAuthGetAllMetadataRowInput; result: GenAuthGetAllMetadataRowResult; optional: false };
  /** 获取所有权益 */
  getAllRightsItem: { input: GenAuthGetAllRightsItemInput; result: GenAuthGetAllRightsItemResult; optional: true };
  /** 获取设备互斥生效范围配置 */
  getAllValidScopeSettings: { input: GenAuthGetAllValidScopeSettingsInput; result: GenAuthGetAllValidScopeSettingsResult; optional: true };
  /** 获取设备互斥白名单配置 */
  getAllWhiteListSettings: { input: GenAuthGetAllWhiteListSettingsInput; result: GenAuthGetAllWhiteListSettingsResult; optional: true };
  /** 获取应用详情 */
  getApplication: { input: GenAuthGetApplicationInput; result: GenAuthGetApplicationResult; optional: false };
  /** 获取应用访问控制用户列表 */
  getApplicationAccessControlUserList: { input: GenAuthGetApplicationAccessControlUserListInput; result: GenAuthGetApplicationAccessControlUserListResult; optional: false };
  /** 获取应用默认访问授权策略 */
  getApplicationPermissionStrategy: { input: GenAuthGetApplicationPermissionStrategyInput; result: GenAuthGetApplicationPermissionStrategyResult; optional: false };
  /** 获取应用密钥 */
  getApplicationSecret: { input: GenAuthGetApplicationSecretInput; result: GenAuthGetApplicationSecretResult; optional: false };
  /** 获取应用简单信息 */
  getApplicationSimpleInfo: { input: GenAuthGetApplicationSimpleInfoInput; result: GenAuthGetApplicationSimpleInfoResult; optional: false };
  /** 获取 ASA 账号 */
  getAsaAccount: { input: GenAuthGetAsaAccountInput; result: GenAuthGetAsaAccountResult; optional: false };
  /** 获取 ASA 账号分配的主体列表 */
  getAsaAccountAssignedTargets: { input: GenAuthGetAsaAccountAssignedTargetsInput; result: GenAuthGetAsaAccountAssignedTargetsResult; optional: false };
  /** 批量获取 ASA 账号 */
  getAsaAccountBatch: { input: GenAuthGetAsaAccountBatchInput; result: GenAuthGetAsaAccountBatchResult; optional: false };
  /** 批量获取 ASA 账号 */
  getAsaAccountsBatch: { input: GenAuthGetAsaAccountsBatchInput; result: GenAuthGetAsaAccountsBatchResult; optional: false };
  /** 获取主体被分配的 ASA 账号 */
  getAssignedAccount: { input: GenAuthGetAssignedAccountInput; result: GenAuthGetAssignedAccountResult; optional: false };
  /** 获取指定编排配置 */
  getAuthFlowConfig: { input: GenAuthGetAuthFlowConfigInput; result: GenAuthGetAuthFlowConfigResult; optional: false };
  /** 获取应用编排配置列表 */
  getAuthFlowConfigByAppId: { input: GenAuthGetAuthFlowConfigByAppIdInput; result: GenAuthGetAuthFlowConfigByAppIdResult; optional: false };
  /** 获取 AuthFlowFunction 函数详情 */
  getAuthFlowFunction: { input: GenAuthGetAuthFlowFunctionInput; result: GenAuthGetAuthFlowFunctionResult; optional: false };
  /** 获取某个主体被授权的资源列表 */
  getAuthorizedResources: { input: GenAuthGetAuthorizedResourcesInput; result: GenAuthGetAuthorizedResourcesResult; optional: false };
  /** 生成 LDAP Server 管理员密码 */
  getBindPwd: { input: GenAuthGetBindPwdInput; result: GenAuthGetBindPwdResult; optional: true };
  /** 获取当前编排配置 */
  getCurrentAuthFlowConfig: { input: GenAuthGetCurrentAuthFlowConfigInput; result: GenAuthGetCurrentAuthFlowConfigResult; optional: false };
  /** 获取套餐详情 */
  getCurrentPackageInfo: { input: GenAuthGetCurrentPackageInfoInput; result: GenAuthGetCurrentPackageInfoResult; optional: true };
  /** 获取用户、分组、角色、组织机构的自定义字段值 */
  getCustomData: { input: GenAuthGetCustomDataInput; result: GenAuthGetCustomDataResult; optional: false };
  /** 获取自定义字段列表 */
  getCustomFields: { input: GenAuthGetCustomFieldsInput; result: GenAuthGetCustomFieldsResult; optional: false };
  /** 获取数据策略详情 */
  getDataPolicy: { input: GenAuthGetDataPolicyInput; result: GenAuthGetDataPolicyResult; optional: false };
  /** 获取数据资源详情 */
  getDataResource: { input: GenAuthGetDataResourceInput; result: GenAuthGetDataResourceResult; optional: false };
  /** 获取部门信息 */
  getDepartment: { input: GenAuthGetDepartmentInput; result: GenAuthGetDepartmentResult; optional: true };
  /** 部门被授权的应用列表 */
  getDepartmentAllApp: { input: GenAuthGetDepartmentAllAppInput; result: GenAuthGetDepartmentAllAppResult; optional: false };
  /** 部门被授权的应用列表 */
  getDepartmentAvailableApp: { input: GenAuthGetDepartmentAvailableAppInput; result: GenAuthGetDepartmentAvailableAppResult; optional: false };
  /** 根据部门id查询部门 */
  getDepartmentById: { input: GenAuthGetDepartmentByIdInput; result: GenAuthGetDepartmentByIdResult; optional: false };
  /** 获取部门绑定的第三方同步关系 */
  getDepartmentSyncRelations: { input: GenAuthGetDepartmentSyncRelationsInput; result: GenAuthGetDepartmentSyncRelationsResult; optional: false };
  /** 获取审批详情 */
  getDetail: { input: GenAuthGetDetailInput; result: GenAuthGetDetailResult; optional: false };
  /** 获取设备状态 */
  getDeviceStatus: { input: GenAuthGetDeviceStatusInput; result: GenAuthGetDeviceStatusResult; optional: false };
  /** 查询动态分组匹配规则 */
  getDynamicGroupMatch: { input: GenAuthGetDynamicGroupMatchInput; result: GenAuthGetDynamicGroupMatchResult; optional: false };
  /** 获取第三方邮件服务配置 */
  getEmailProvider: { input: GenAuthGetEmailProviderInput; result: GenAuthGetEmailProviderResult; optional: true };
  /** 获取邮件模版列表 */
  getEmailTemplates: { input: GenAuthGetEmailTemplatesInput; result: GenAuthGetEmailTemplatesResult; optional: true };
  /** 获取外部用户拥有指定资源的权限及资源结构信息 */
  getExternalUserResourceStruct: { input: GenAuthGetExternalUserResourceStructInput; result: GenAuthGetExternalUserResourceStructResult; optional: false };
  /** 获取身份源详情 */
  getExtIdp: { input: GenAuthGetExtIdpInput; result: GenAuthGetExtIdpResult; optional: false };
  /** 获取全局多因素认证配置 */
  getGlobalMfaSettings: { input: GenAuthGetGlobalMfaSettingsInput; result: GenAuthGetGlobalMfaSettingsResult; optional: true };
  /** 获取分组详情 */
  getGroup: { input: GenAuthGetGroupInput; result: GenAuthGetGroupResult; optional: false };
  /** 获取分组被授权的资源列表 */
  getGroupAuthorizedResources: { input: GenAuthGetGroupAuthorizedResourcesInput; result: GenAuthGetGroupAuthorizedResourcesResult; optional: false };
  /** 获取公共账号分组列表 */
  getGroupsOfPublicAccount: { input: GenAuthGetGroupsOfPublicAccountInput; result: GenAuthGetGroupsOfPublicAccountResult; optional: false };
  /** 获取导入模板 */
  getImportTemplate: { input: GenAuthGetImportTemplateInput; result: GenAuthGetImportTemplateResult; optional: false };
  /** 获取邀请名单详情 */
  getInvitationRoster: { input: GenAuthGetInvitationRosterInput; result: GenAuthGetInvitationRosterResult; optional: false };
  /** 获取邀请策略邮件模板 */
  getInviteEmailTemplate: { input: GenAuthGetInviteEmailTemplateInput; result: GenAuthGetInviteEmailTemplateResult; optional: false };
  /** 获取 m2m 权限列表 */
  getM2mPermissionList: { input: GenAuthGetM2mPermissionListInput; result: GenAuthGetM2mPermissionListResult; optional: false };
  /** 获取m2m拥有某些资源的权限列表（推荐） */
  getM2mResourcePermissionList: { input: GenAuthGetM2mResourcePermissionListInput; result: GenAuthGetM2mResourcePermissionListResult; optional: false };
  /** 获取m2m拥有指定资源的权限及资源结构信息 */
  getM2mResourceStruct: { input: GenAuthGetM2mResourceStructInput; result: GenAuthGetM2mResourceStructResult; optional: false };
  /** 获取 MAU 使用记录 */
  getMauPeriodUsageHistory: { input: GenAuthGetMauPeriodUsageHistoryInput; result: GenAuthGetMauPeriodUsageHistoryResult; optional: false };
  /** 获取元数据关联群组信息 */
  getMetadataGroupList: { input: GenAuthGetMetadataGroupListInput; result: GenAuthGetMetadataGroupListResult; optional: false };
  /** 获取用户 MFA 状态 */
  getMfaStatus: { input: GenAuthGetMfaStatusInput; result: GenAuthGetMfaStatusResult; optional: false };
  /** 获取应用下用户 MFA 触发数据 */
  getMfaTriggerData: { input: GenAuthGetMfaTriggerDataInput; result: GenAuthGetMfaTriggerDataResult; optional: false };
  /** 获取数据对象详情 */
  getModel: { input: GenAuthGetModelInput; result: GenAuthGetModelResult; optional: false };
  /** 获取多租户管理员用户列表 */
  getMultipleTenantAdmin: { input: GenAuthGetMultipleTenantAdminInput; result: GenAuthGetMultipleTenantAdminResult; optional: false };
  /** 获取权限分组详情 */
  getNamespace: { input: GenAuthGetNamespaceInput; result: GenAuthGetNamespaceResult; optional: false };
  /** 批量获取权限分组详情 */
  getNamespacesBatch: { input: GenAuthGetNamespacesBatchInput; result: GenAuthGetNamespacesBatchResult; optional: false };
  /** 获取订单详情 */
  getOrderDetail: { input: GenAuthGetOrderDetailInput; result: GenAuthGetOrderDetailResult; optional: false };
  /** 获取订单支付明细 */
  getOrderPayDetail: { input: GenAuthGetOrderPayDetailInput; result: GenAuthGetOrderPayDetailResult; optional: false };
  /** 获取订单列表 */
  getOrders: { input: GenAuthGetOrdersInput; result: GenAuthGetOrdersResult; optional: true };
  /** 获取组织机构详情 */
  getOrganization: { input: GenAuthGetOrganizationInput; result: GenAuthGetOrganizationResult; optional: false };
  /** 批量获取组织机构详情 */
  getOrganizationBatch: { input: GenAuthGetOrganizationBatchInput; result: GenAuthGetOrganizationBatchResult; optional: false };
  /** 批量获取组织机构详情 */
  getOrganizationsBatch: { input: GenAuthGetOrganizationsBatchInput; result: GenAuthGetOrganizationsBatchResult; optional: false };
  /** 获取用户绑定 OTP 的秘钥 */
  getOtpSecretByUser: { input: GenAuthGetOtpSecretByUserInput; result: GenAuthGetOtpSecretByUserResult; optional: false };
  /** 获取父部门信息 */
  getParentDepartment: { input: GenAuthGetParentDepartmentInput; result: GenAuthGetParentDepartmentResult; optional: false };
  /** 获取权限空间详情 */
  getPermissionNamespace: { input: GenAuthGetPermissionNamespaceInput; result: GenAuthGetPermissionNamespaceResult; optional: false };
  /** 批量获取权限空间详情列表 */
  getPermissionNamespacesBatch: { input: GenAuthGetPermissionNamespacesBatchInput; result: GenAuthGetPermissionNamespacesBatchResult; optional: false };
  /** 获取 Pipeline 函数详情 */
  getPipelineFunction: { input: GenAuthGetPipelineFunctionInput; result: GenAuthGetPipelineFunctionResult; optional: false };
  /** 获取 Pipeline 日志 */
  getPipelineLogs: { input: GenAuthGetPipelineLogsInput; result: GenAuthGetPipelineLogsResult; optional: false };
  /** 获取邀请策略详情 */
  getPolicyDetailById: { input: GenAuthGetPolicyDetailByIdInput; result: GenAuthGetPolicyDetailByIdResult; optional: false };
  /** 获取邀请策略用户归属详情 */
  getPolicyUserAttributionDetail: { input: GenAuthGetPolicyUserAttributionDetailInput; result: GenAuthGetPolicyUserAttributionDetailResult; optional: false };
  /** 获取岗位 */
  getPost: { input: GenAuthGetPostInput; result: GenAuthGetPostResult; optional: false };
  /** 获取岗位信息 */
  getPostById: { input: GenAuthGetPostByIdInput; result: GenAuthGetPostByIdResult; optional: true };
  /** 获取公共账号的岗位 */
  getPostOfPublicUser: { input: GenAuthGetPostOfPublicUserInput; result: GenAuthGetPostOfPublicUserResult; optional: false };
  /** 获取公共账号信息 */
  getPublicAccount: { input: GenAuthGetPublicAccountInput; result: GenAuthGetPublicAccountResult; optional: false };
  /** 批量获取公共账号信息 */
  getPublicAccountBatch: { input: GenAuthGetPublicAccountBatchInput; result: GenAuthGetPublicAccountBatchResult; optional: false };
  /** 获取公共账号的部门列表 */
  getPublicAccountDepartments: { input: GenAuthGetPublicAccountDepartmentsInput; result: GenAuthGetPublicAccountDepartmentsResult; optional: false };
  /** 公共账号添加批量分组 */
  getPublicAccountOfGroups: { input: GenAuthGetPublicAccountOfGroupsInput; result: GenAuthGetPublicAccountOfGroupsResult; optional: false };
  /** 获取公共账号的角色列表 */
  getPublicAccountRoles: { input: GenAuthGetPublicAccountRolesInput; result: GenAuthGetPublicAccountRolesResult; optional: false };
  /** 获取部门的公共账号列表 */
  getPublicAccountsOfDepartment: { input: GenAuthGetPublicAccountsOfDepartmentInput; result: GenAuthGetPublicAccountsOfDepartmentResult; optional: false };
  /** 获取分组的公共账号列表 */
  getPublicAccountsOfGroup: { input: GenAuthGetPublicAccountsOfGroupInput; result: GenAuthGetPublicAccountsOfGroupResult; optional: false };
  /** 获取岗位的公共账号列表 */
  getPublicAccountsOfPost: { input: GenAuthGetPublicAccountsOfPostInput; result: GenAuthGetPublicAccountsOfPostResult; optional: false };
  /** 获取角色的公共账号列表 */
  getPublicAccountsOfRole: { input: GenAuthGetPublicAccountsOfRoleInput; result: GenAuthGetPublicAccountsOfRoleResult; optional: false };
  /** 获取用户的公共账号列表 */
  getPublicAccountsOfUser: { input: GenAuthGetPublicAccountsOfUserInput; result: GenAuthGetPublicAccountsOfUserResult; optional: false };
  /** 获取行关联数据 */
  getRelationDetails: { input: GenAuthGetRelationDetailsInput; result: GenAuthGetRelationDetailsResult; optional: true };
  /** 获取关联数据详情 */
  getRelationInfo: { input: GenAuthGetRelationInfoInput; result: GenAuthGetRelationInfoResult; optional: false };
  /** 获取行关联数据 */
  getRelationValue: { input: GenAuthGetRelationValueInput; result: GenAuthGetRelationValueResult; optional: false };
  /** 获取资源详情 */
  getResource: { input: GenAuthGetResourceInput; result: GenAuthGetResourceResult; optional: false };
  /** 获取资源被授权的主体 */
  getResourceAuthorizedTargets: { input: GenAuthGetResourceAuthorizedTargetsInput; result: GenAuthGetResourceAuthorizedTargetsResult; optional: false };
  /** 批量获取资源详情 */
  getResourcesBatch: { input: GenAuthGetResourcesBatchInput; result: GenAuthGetResourcesBatchResult; optional: false };
  /** 获取角色详情 */
  getRole: { input: GenAuthGetRoleInput; result: GenAuthGetRoleResult; optional: false };
  /** 获取角色被授权的资源列表 */
  getRoleAuthorizedResources: { input: GenAuthGetRoleAuthorizedResourcesInput; result: GenAuthGetRoleAuthorizedResourcesResult; optional: false };
  /** 获取角色下所拥有的数据策略列表 */
  getRolePolicyList: { input: GenAuthGetRolePolicyListInput; result: GenAuthGetRolePolicyListResult; optional: false };
  /** 获取数据对象行信息 */
  getRow: { input: GenAuthGetRowInput; result: GenAuthGetRowResult; optional: false };
  /** 批量获取行信息 */
  getRowBatch: { input: GenAuthGetRowBatchInput; result: GenAuthGetRowBatchResult; optional: false };
  /** 根据属性值获取数据对象行信息 */
  getRowByValue: { input: GenAuthGetRowByValueInput; result: GenAuthGetRowByValueResult; optional: false };
  /** 获取设备互斥规则配置 */
  getRuleSettings: { input: GenAuthGetRuleSettingsInput; result: GenAuthGetRuleSettingsResult; optional: true };
  /** 获取安全配置 */
  getSecuritySettings: { input: GenAuthGetSecuritySettingsInput; result: GenAuthGetSecuritySettingsResult; optional: true };
  /** 主体授权详情 */
  getSubjectAuthDetail: { input: GenAuthGetSubjectAuthDetailInput; result: GenAuthGetSubjectAuthDetailResult; optional: false };
  /** 获取同步作业详情 */
  getSyncJob: { input: GenAuthGetSyncJobInput; result: GenAuthGetSyncJobResult; optional: false };
  /** 获取同步任务详情 */
  getSyncTask: { input: GenAuthGetSyncTaskInput; result: GenAuthGetSyncTaskResult; optional: false };
  /** 获取租户详情 */
  getTenant: { input: GenAuthGetTenantInput; result: GenAuthGetTenantResult; optional: false };
  /** 获取租户详情 */
  getTenantByCode: { input: GenAuthGetTenantByCodeInput; result: GenAuthGetTenantByCodeResult; optional: false };
  /** 获取一个协调管理员 */
  getTenantCooperator: { input: GenAuthGetTenantCooperatorInput; result: GenAuthGetTenantCooperatorResult; optional: false };
  /** 获取一个协调管理员拥有的列表 */
  getTenantCooperatorMenu: { input: GenAuthGetTenantCooperatorMenuInput; result: GenAuthGetTenantCooperatorMenuResult; optional: false };
  /** 获取租户企业认证信息 */
  getTenantEnterpriseCertification: { input: GenAuthGetTenantEnterpriseCertificationInput; result: GenAuthGetTenantEnterpriseCertificationResult; optional: false };
  /** 获取租户一点点的信息 */
  getTenantLittleInfo: { input: GenAuthGetTenantLittleInfoInput; result: GenAuthGetTenantLittleInfoResult; optional: false };
  /** 获取单个租户成员 */
  getTenantUser: { input: GenAuthGetTenantUserInput; result: GenAuthGetTenantUserResult; optional: false };
  /** 获取通用邀请配置 */
  getUniversalInvitation: { input: GenAuthGetUniversalInvitationInput; result: GenAuthGetUniversalInvitationResult; optional: true };
  /** 获取用量详情 */
  getUsageInfo: { input: GenAuthGetUsageInfoInput; result: GenAuthGetUsageInfoResult; optional: true };
  /** 获取用户信息 */
  getUser: { input: GenAuthGetUserInput; result: GenAuthGetUserResult; optional: true };
  /** 获取用户可访问的应用 */
  getUserAccessibleApps: { input: GenAuthGetUserAccessibleAppsInput; result: GenAuthGetUserAccessibleAppsResult; optional: false };
  /** 获取用户行为日志 */
  getUserActionLogs: { input: GenAuthGetUserActionLogsInput; result: GenAuthGetUserActionLogsResult; optional: true };
  /** 获取设置的用户归属主部门 */
  getUserAttributionMainDepartment: { input: GenAuthGetUserAttributionMainDepartmentInput; result: GenAuthGetUserAttributionMainDepartmentResult; optional: false };
  /** 获取用户授权的应用 */
  getUserAuthorizedApps: { input: GenAuthGetUserAuthorizedAppsInput; result: GenAuthGetUserAuthorizedAppsResult; optional: false };
  /** 获取用户被授权的所有资源 */
  getUserAuthorizedResources: { input: GenAuthGetUserAuthorizedResourcesInput; result: GenAuthGetUserAuthorizedResourcesResult; optional: false };
  /** 获取用户内置字段列表 */
  getUserBaseFields: { input: GenAuthGetUserBaseFieldsInput; result: GenAuthGetUserBaseFieldsResult; optional: true };
  /** 批量获取用户信息 */
  getUserBatch: { input: GenAuthGetUserBatchInput; result: GenAuthGetUserBatchResult; optional: false };
  /** 获取用户部门列表 */
  getUserDepartments: { input: GenAuthGetUserDepartmentsInput; result: GenAuthGetUserDepartmentsResult; optional: false };
  /** 批量获取用户密码密文 */
  getUserEncryptPasswordBatch: { input: GenAuthGetUserEncryptPasswordBatchInput; result: GenAuthGetUserEncryptPasswordBatchResult; optional: false };
  /** 获取用户分组列表 */
  getUserGroups: { input: GenAuthGetUserGroupsInput; result: GenAuthGetUserGroupsResult; optional: false };
  /** 获取用户的外部身份源 */
  getUserIdentities: { input: GenAuthGetUserIdentitiesInput; result: GenAuthGetUserIdentitiesResult; optional: false };
  /** 获取用户曾经登录过的应用 */
  getUserLoggedinApps: { input: GenAuthGetUserLoggedinAppsInput; result: GenAuthGetUserLoggedinAppsResult; optional: false };
  /** 获取用户曾经登录过的身份源 */
  getUserLoggedinIdentities: { input: GenAuthGetUserLoggedinIdentitiesInput; result: GenAuthGetUserLoggedinIdentitiesResult; optional: false };
  /** 获取用户曾经登录过的身份源 */
  getUserLoggedInIdentities: { input: GenAuthGetUserLoggedInIdentitiesInput; result: GenAuthGetUserLoggedInIdentitiesResult; optional: false };
  /** 获取用户的登录历史记录 */
  getUserLoginHistory: { input: GenAuthGetUserLoginHistoryInput; result: GenAuthGetUserLoginHistoryResult; optional: false };
  /** 获取用户 MFA 绑定信息 */
  getUserMfaInfo: { input: GenAuthGetUserMfaInfoInput; result: GenAuthGetUserMfaInfoResult; optional: false };
  /** 获取用户 MFA 状态 */
  getUserMfaStatus: { input: GenAuthGetUserMfaStatusInput; result: GenAuthGetUserMfaStatusResult; optional: false };
  /** 获取用户自定义加密的密码 */
  getUserPasswordCiphertext: { input: GenAuthGetUserPasswordCiphertextInput; result: GenAuthGetUserPasswordCiphertextResult; optional: false };
  /** 获取用户权限列表 */
  getUserPermissionList: { input: GenAuthGetUserPermissionListInput; result: GenAuthGetUserPermissionListResult; optional: false };
  /** 获取用户关联岗位 */
  getUserPost: { input: GenAuthGetUserPostInput; result: GenAuthGetUserPostResult; optional: false };
  /** 获取用户关联岗位 */
  getUserPosts: { input: GenAuthGetUserPostsInput; result: GenAuthGetUserPostsResult; optional: false };
  /** 获取用户实名认证信息 */
  getUserPrincipalAuthenticationInfo: { input: GenAuthGetUserPrincipalAuthenticationInfoInput; result: GenAuthGetUserPrincipalAuthenticationInfoResult; optional: false };
  /** 获取用户拥有某些资源的权限列表（推荐） */
  getUserResourcePermissionList: { input: GenAuthGetUserResourcePermissionListInput; result: GenAuthGetUserResourcePermissionListResult; optional: false };
  /** 获取用户拥有指定资源的权限及资源结构信息 */
  getUserResourceStruct: { input: GenAuthGetUserResourceStructInput; result: GenAuthGetUserResourceStructResult; optional: false };
  /** 获取用户角色列表 */
  getUserRoles: { input: GenAuthGetUserRolesInput; result: GenAuthGetUserRolesResult; optional: false };
  /** 公共账号的用户列表 */
  getUsersOfPublicAccount: { input: GenAuthGetUsersOfPublicAccountInput; result: GenAuthGetUsersOfPublicAccountResult; optional: false };
  /** 获取用户绑定的第三方同步关系 */
  getUserSyncRelations: { input: GenAuthGetUserSyncRelationsInput; result: GenAuthGetUserSyncRelationsResult; optional: false };
  /** 获取 verify-config-app 列表 */
  getVerifyConfigApp: { input: GenAuthGetVerifyConfigAppInput; result: GenAuthGetVerifyConfigAppResult; optional: true };
  /** 获取 Webhook 详情 */
  getWebhook: { input: GenAuthGetWebhookInput; result: GenAuthGetWebhookResult; optional: false };
  /** 获取 Webhook 事件列表 */
  getWebhookEventList: { input: GenAuthGetWebhookEventListInput; result: GenAuthGetWebhookEventListResult; optional: true };
  /** 获取 Webhook 日志 */
  getWebhookLogs: { input: GenAuthGetWebhookLogsInput; result: GenAuthGetWebhookLogsResult; optional: false };
  /** 获取微信小程序、公众号 Access Token */
  getWechatMpAccessTokenInfo: { input: GenAuthGetWechatMpAccessTokenInfoInput; result: GenAuthGetWechatMpAccessTokenInfoResult; optional: false };
  /** 获取微信小程序、公众号 Access Token */
  getWeixinAccessToken: { input: GenAuthGetWeixinAccessTokenInput; result: GenAuthGetWeixinAccessTokenResult; optional: false };
  /** 判断用户是否有某个角色 */
  hasAnyRole: { input: GenAuthHasAnyRoleInput; result: GenAuthHasAnyRoleResult; optional: false };
  /** 导入数据 */
  importMetadata: { input: GenAuthImportMetadataInput; result: GenAuthImportMetadataResult; optional: false };
  /** 导入数据对象 */
  importModel: { input: GenAuthImportModelInput; result: GenAuthImportModelResult; optional: false };
  /** 导入用户的 OTP */
  importOtp: { input: GenAuthImportOtpInput; result: GenAuthImportOtpResult; optional: false };
  /** 获取导入名单受邀人的模板 */
  importTemplate: { input: GenAuthImportTemplateInput; result: GenAuthImportTemplateResult; optional: true };
  /** 导入租户 */
  importTenant: { input: GenAuthImportTenantInput; result: GenAuthImportTenantResult; optional: false };
  /** 导入租户历史 */
  importTenantHistory: { input: GenAuthImportTenantHistoryInput; result: GenAuthImportTenantHistoryResult; optional: true };
  /** 导入租户通知用户列表 */
  importTenantNotifyUser: { input: GenAuthImportTenantNotifyUserInput; result: GenAuthImportTenantNotifyUserResult; optional: true };
  /** 导入名单受邀人 */
  importUsers: { input: GenAuthImportUsersInput; result: GenAuthImportUsersResult; optional: false };
  /** 判断用户是否对某个资源的某个操作有权限 */
  isActionAllowed: { input: GenAuthIsActionAllowedInput; result: GenAuthIsActionAllowedResult; optional: false };
  /** 判断部门是否在某个部门下 */
  isDepartmentInDepartment: { input: GenAuthIsDepartmentInDepartmentInput; result: GenAuthIsDepartmentInDepartmentResult; optional: false };
  /** 判断用户是否存在 */
  isUserExists: { input: GenAuthIsUserExistsInput; result: GenAuthIsUserExistsResult; optional: true };
  /** 判断用户是否在某个部门下 */
  isUserInDepartment: { input: GenAuthIsUserInDepartmentInput; result: GenAuthIsUserInDepartmentResult; optional: false };
  /** 强制下线公共账号 */
  kickPublicAccounts: { input: GenAuthKickPublicAccountsInput; result: GenAuthKickPublicAccountsResult; optional: false };
  /** 强制下线用户 */
  kickUsers: { input: GenAuthKickUsersInput; result: GenAuthKickUsersResult; optional: false };
  /** 给用户绑定一个身份信息 */
  linkIdentity: { input: GenAuthLinkIdentityInput; result: GenAuthLinkIdentityResult; optional: false };
  /** 获取协作管理员 AK/SK 列表 */
  listAccessKey: { input: GenAuthListAccessKeyInput; result: GenAuthListAccessKeyResult; optional: true };
  /** 获取应用当前登录用户 */
  listApplicationActiveUsers: { input: GenAuthListApplicationActiveUsersInput; result: GenAuthListApplicationActiveUsersResult; optional: false };
  /** 获取应用列表 */
  listApplications: { input: GenAuthListApplicationsInput; result: GenAuthListApplicationsResult; optional: true };
  /** 应用授权列表 */
  listApplicationsAuth: { input: GenAuthListApplicationsAuthInput; result: GenAuthListApplicationsAuthResult; optional: false };
  /** 获取应用简单信息列表 */
  listApplicationSimpleInfo: { input: GenAuthListApplicationSimpleInfoInput; result: GenAuthListApplicationSimpleInfoResult; optional: true };
  /** 获取已归档的用户列表 */
  listArchivedUsers: { input: GenAuthListArchivedUsersInput; result: GenAuthListArchivedUsersResult; optional: true };
  /** 获取 ASA 账号列表 */
  listAsaAccount: { input: GenAuthListAsaAccountInput; result: GenAuthListAsaAccountResult; optional: false };
  /** 获取 ASA 账号列表 */
  listAsaAccounts: { input: GenAuthListAsaAccountsInput; result: GenAuthListAsaAccountsResult; optional: false };
  /** 应用授权列表 */
  listAuthApplication: { input: GenAuthListAuthApplicationInput; result: GenAuthListAuthApplicationResult; optional: false };
  /** 主体授权列表 */
  listAuthSubject: { input: GenAuthListAuthSubjectInput; result: GenAuthListAuthSubjectResult; optional: false };
  /** 获取子部门列表 */
  listChildrenDepartments: { input: GenAuthListChildrenDepartmentsInput; result: GenAuthListChildrenDepartmentsResult; optional: false };
  /** 常规资源授权列表 */
  listCommonAuthorize: { input: GenAuthListCommonAuthorizeInput; result: GenAuthListCommonAuthorizeResult; optional: true };
  /** 分页获取常规资源列表 */
  listCommonResource: { input: GenAuthListCommonResourceInput; result: GenAuthListCommonResourceResult; optional: true };
  /** 获取自定义字段列表 */
  listCustFields: { input: GenAuthListCustFieldsInput; result: GenAuthListCustFieldsResult; optional: true };
  /** 获取自定义字段列表 */
  listCustomFields: { input: GenAuthListCustomFieldsInput; result: GenAuthListCustomFieldsResult; optional: true };
  /** 获取数据策略列表 */
  listDataPolices: { input: GenAuthListDataPolicesInput; result: GenAuthListDataPolicesResult; optional: true };
  /** 获取数据策略列表 */
  listDataPolicies: { input: GenAuthListDataPoliciesInput; result: GenAuthListDataPoliciesResult; optional: true };
  /** 获取数据策略授权的主体列表 */
  listDataPolicyTargets: { input: GenAuthListDataPolicyTargetsInput; result: GenAuthListDataPolicyTargetsResult; optional: false };
  /** 获取数据资源列表 */
  listDataResources: { input: GenAuthListDataResourcesInput; result: GenAuthListDataResourcesResult; optional: true };
  /** 获取部门直属成员 ID 列表 */
  listDepartmentMemberIds: { input: GenAuthListDepartmentMemberIdsInput; result: GenAuthListDepartmentMemberIdsResult; optional: false };
  /** 获取部门成员列表 */
  listDepartmentMembers: { input: GenAuthListDepartmentMembersInput; result: GenAuthListDepartmentMembersResult; optional: false };
  /** 获取树类型资源的扩展字段列表 */
  listDnef: { input: GenAuthListDnefInput; result: GenAuthListDnefResult; optional: false };
  /** 根据应用 id 获取应用已启用的身份源连接列表 */
  listEnabledExtIdpConnsByApp: { input: GenAuthListEnabledExtIdpConnsByAppInput; result: GenAuthListEnabledExtIdpConnsByAppResult; optional: false };
  /** 获取事件应用列表 */
  listEventApps: { input: GenAuthListEventAppsInput; result: GenAuthListEventAppsResult; optional: true };
  /** 获取事件列表 */
  listEvents: { input: GenAuthListEventsInput; result: GenAuthListEventsResult; optional: true };
  /** 获取身份源列表 */
  listExtIdp: { input: GenAuthListExtIdpInput; result: GenAuthListExtIdpResult; optional: true };
  /** 获取身份源连接列表 */
  listExtIdpConns: { input: GenAuthListExtIdpConnsInput; result: GenAuthListExtIdpConnsResult; optional: false };
  /** 获取数据对象字段列表 */
  listField: { input: GenAuthListFieldInput; result: GenAuthListFieldResult; optional: false };
  /** 获取分组成员列表 */
  listGroupMembers: { input: GenAuthListGroupMembersInput; result: GenAuthListGroupMembersResult; optional: false };
  /** 获取分组列表 */
  listGroups: { input: GenAuthListGroupsInput; result: GenAuthListGroupsResult; optional: true };
  /** 获取邀请策略列表 */
  listInvitationPolicies: { input: GenAuthListInvitationPoliciesInput; result: GenAuthListInvitationPoliciesResult; optional: true };
  /** 获取邀请名单列表 */
  listInvitationRoster: { input: GenAuthListInvitationRosterInput; result: GenAuthListInvitationRosterResult; optional: true };
  /** 获取未关联策略的邀请名单列表 */
  listInvitationRostersByNonPolicyId: { input: GenAuthListInvitationRostersByNonPolicyIdInput; result: GenAuthListInvitationRostersByNonPolicyIdResult; optional: true };
  /** 根据策略 Id 获取邀请名单列表 */
  listInvitationRostersByPolicyId: { input: GenAuthListInvitationRostersByPolicyIdInput; result: GenAuthListInvitationRostersByPolicyIdResult; optional: false };
  /** 获取可访问的租户控制台列表 */
  listInviteTenantUserRecords: { input: GenAuthListInviteTenantUserRecordsInput; result: GenAuthListInviteTenantUserRecordsResult; optional: true };
  /** 获取可访问的租户控制台列表 */
  listInviteTennatUserRecords: { input: GenAuthListInviteTennatUserRecordsInput; result: GenAuthListInviteTennatUserRecordsResult; optional: true };
  /** 获取数据对象列表 */
  listModel: { input: GenAuthListModelInput; result: GenAuthListModelResult; optional: true };
  /** 获取多租户管理员用户列表 */
  listMultipleTenantAdmin: { input: GenAuthListMultipleTenantAdminInput; result: GenAuthListMultipleTenantAdminResult; optional: true };
  /** 获取多租户管理员用户列表 */
  listMultipleTenantAdmins: { input: GenAuthListMultipleTenantAdminsInput; result: GenAuthListMultipleTenantAdminsResult; optional: true };
  /** 分页权限分组下所有的角色列表 */
  listNamespaceRoles: { input: GenAuthListNamespaceRolesInput; result: GenAuthListNamespaceRolesResult; optional: false };
  /** 分页获取权限分组列表 */
  listNamespaces: { input: GenAuthListNamespacesInput; result: GenAuthListNamespacesResult; optional: true };
  /** 操作管理列表(分页) */
  listOperate: { input: GenAuthListOperateInput; result: GenAuthListOperateResult; optional: false };
  /** 全部操作管理列表 */
  listOperateAll: { input: GenAuthListOperateAllInput; result: GenAuthListOperateAllResult; optional: false };
  /** 获取组织机构列表 */
  listOrganizations: { input: GenAuthListOrganizationsInput; result: GenAuthListOrganizationsResult; optional: true };
  /** 分页查询权限空间下所有的角色列表 */
  listPermissionNamespaceRoles: { input: GenAuthListPermissionNamespaceRolesInput; result: GenAuthListPermissionNamespaceRolesResult; optional: false };
  /** 分页获取权限空间列表 */
  listPermissionNamespaces: { input: GenAuthListPermissionNamespacesInput; result: GenAuthListPermissionNamespacesResult; optional: true };
  /** 获取权限视图数据列表 */
  listPermissionView: { input: GenAuthListPermissionViewInput; result: GenAuthListPermissionViewResult; optional: true };
  /** 获取权限视图数据列表 */
  listPermissionViewData: { input: GenAuthListPermissionViewDataInput; result: GenAuthListPermissionViewDataResult; optional: true };
  /** 获取 Pipeline 函数列表 */
  listPipelineFunctions: { input: GenAuthListPipelineFunctionsInput; result: GenAuthListPipelineFunctionsResult; optional: true };
  /** 获取邀请策略用户归属列表 */
  listPolicyUserAttributionDetail: { input: GenAuthListPolicyUserAttributionDetailInput; result: GenAuthListPolicyUserAttributionDetailResult; optional: false };
  /** 获取编程访问账号列表 */
  listProgrammaticAccessAccounts: { input: GenAuthListProgrammaticAccessAccountsInput; result: GenAuthListProgrammaticAccessAccountsResult; optional: false };
  /** 获取/搜索公共账号列表 */
  listPublicAccounts: { input: GenAuthListPublicAccountsInput; result: GenAuthListPublicAccountsResult; optional: true };
  /** 获取策略流程配置补充信息的字段列表 */
  listRegisterExtendsFields: { input: GenAuthListRegisterExtendsFieldsInput; result: GenAuthListRegisterExtendsFieldsResult; optional: false };
  /** 分页获取资源列表 */
  listResources: { input: GenAuthListResourcesInput; result: GenAuthListResourcesResult; optional: true };
  /** 获取拥有某些资源权限的用户列表 */
  listResourceTargets: { input: GenAuthListResourceTargetsInput; result: GenAuthListResourceTargetsResult; optional: false };
  /** 获取角色下所有成员列表 */
  listRoleAllMembers: { input: GenAuthListRoleAllMembersInput; result: GenAuthListRoleAllMembersResult; optional: false };
  /** 获取角色授权列表 */
  listRoleAssignments: { input: GenAuthListRoleAssignmentsInput; result: GenAuthListRoleAssignmentsResult; optional: false };
  /** 获取角色的部门列表 */
  listRoleDepartments: { input: GenAuthListRoleDepartmentsInput; result: GenAuthListRoleDepartmentsResult; optional: false };
  /** 获取角色成员列表 */
  listRoleMembers: { input: GenAuthListRoleMembersInput; result: GenAuthListRoleMembersResult; optional: false };
  /** 获取角色列表 */
  listRoles: { input: GenAuthListRolesInput; result: GenAuthListRolesResult; optional: true };
  /** 数据对象高级搜索 */
  listRow: { input: GenAuthListRowInput; result: GenAuthListRowResult; optional: false };
  /** 获取 Session 列表 */
  listSessions: { input: GenAuthListSessionsInput; result: GenAuthListSessionsResult; optional: true };
  /** 视图详情下的 Session 列表 */
  listSessionsDetailByView: { input: GenAuthListSessionsDetailByViewInput; result: GenAuthListSessionsDetailByViewResult; optional: false };
  /** 获取数据策略简略信息列表 */
  listSimpleDataPolices: { input: GenAuthListSimpleDataPolicesInput; result: GenAuthListSimpleDataPolicesResult; optional: true };
  /** 获取数据策略简略信息列表 */
  listSimpleDataPolicies: { input: GenAuthListSimpleDataPoliciesInput; result: GenAuthListSimpleDataPoliciesResult; optional: true };
  /** 主体授权列表 */
  listSubjectAuth: { input: GenAuthListSubjectAuthInput; result: GenAuthListSubjectAuthResult; optional: false };
  /** 获取同步作业详情 */
  listSyncJobLogs: { input: GenAuthListSyncJobLogsInput; result: GenAuthListSyncJobLogsResult; optional: false };
  /** 获取同步作业详情 */
  listSyncJobs: { input: GenAuthListSyncJobsInput; result: GenAuthListSyncJobsResult; optional: false };
  /** 获取同步风险操作列表 */
  listSyncRiskOperations: { input: GenAuthListSyncRiskOperationsInput; result: GenAuthListSyncRiskOperationsResult; optional: false };
  /** 获取同步任务列表 */
  listSyncTasks: { input: GenAuthListSyncTasksInput; result: GenAuthListSyncTasksResult; optional: true };
  /** 获取租户管理员列表 */
  listTenantAdmin: { input: GenAuthListTenantAdminInput; result: GenAuthListTenantAdminResult; optional: true };
  /** 获取租户应用列表 */
  listTenantApplications: { input: GenAuthListTenantApplicationsInput; result: GenAuthListTenantApplicationsResult; optional: true };
  /** 获取协作管理员用户列表 */
  listTenantCooperators: { input: GenAuthListTenantCooperatorsInput; result: GenAuthListTenantCooperatorsResult; optional: true };
  /** 租户控制台获取身份源列表 */
  listTenantExtIdp: { input: GenAuthListTenantExtIdpInput; result: GenAuthListTenantExtIdpResult; optional: true };
  /** 获取/搜索租户列表 */
  listTenants: { input: GenAuthListTenantsInput; result: GenAuthListTenantsResult; optional: true };
  /** 获取/搜索租户成员列表 */
  listTenantUsers: { input: GenAuthListTenantUsersInput; result: GenAuthListTenantUsersResult; optional: true };
  /** 获取用户内置字段列表 */
  listUserBaseFields: { input: GenAuthListUserBaseFieldsInput; result: GenAuthListUserBaseFieldsResult; optional: true };
  /** 获取/搜索用户列表 */
  listUsers: { input: GenAuthListUsersInput; result: GenAuthListUsersResult; optional: true };
  /** 获取用户列表 */
  listUsersLegacy: { input: GenAuthListUsersLegacyInput; result: GenAuthListUsersLegacyResult; optional: true };
  /** 获取 Webhook 列表 */
  listWebhooks: { input: GenAuthListWebhooksInput; result: GenAuthListWebhooksResult; optional: true };
  /** 获取注册白名单列表 */
  listWhitelist: { input: GenAuthListWhitelistInput; result: GenAuthListWhitelistResult; optional: false };
  /** 获取应用注册白名单列表 */
  listWhitelistOfApp: { input: GenAuthListWhitelistOfAppInput; result: GenAuthListWhitelistOfAppResult; optional: false };
  /** 获取注册白名单列表 */
  listWhitelists: { input: GenAuthListWhitelistsInput; result: GenAuthListWhitelistsResult; optional: false };
  /** 获取应用注册白名单列表 */
  listWhitelistsOfApp: { input: GenAuthListWhitelistsOfAppInput; result: GenAuthListWhitelistsOfAppResult; optional: false };
  /** 获取审批日志列表 */
  logList: { input: GenAuthLogListInput; result: GenAuthLogListResult; optional: true };
  /** 跨权限分组（空间）删除角色 */
  multipleNamespaceDeleteRolesBatch: { input: GenAuthMultipleNamespaceDeleteRolesBatchInput; result: GenAuthMultipleNamespaceDeleteRolesBatchResult; optional: false };
  /** 获取代办审批列表 */
  pendList: { input: GenAuthPendListInput; result: GenAuthPendListResult; optional: true };
  /** 岗位列表 */
  postList: { input: GenAuthPostListInput; result: GenAuthPostListResult; optional: true };
  /** 岗位列表 */
  postListBatch: { input: GenAuthPostListBatchInput; result: GenAuthPostListBatchResult; optional: true };
  /** 动态分组预览 */
  previewDynamicGroup: { input: GenAuthPreviewDynamicGroupInput; result: GenAuthPreviewDynamicGroupResult; optional: true };
  /** 预览邮件模版 */
  previewEmailTemplate: { input: GenAuthPreviewEmailTemplateInput; result: GenAuthPreviewEmailTemplateResult; optional: false };
  /** 处理单个审批 */
  processApproval: { input: GenAuthProcessApprovalInput; result: GenAuthProcessApprovalResult; optional: false };
  /** 事件发布 */
  pub: { input: GenAuthPubInput; result: GenAuthPubResult; optional: false };
  /** 认证端推送自定义事件 */
  pubUserEvent: { input: GenAuthPubUserEventInput; result: GenAuthPubUserEventResult; optional: false };
  /** 获取 LDAP server 配置信息 */
  queryLdapConfigInfo: { input: GenAuthQueryLdapConfigInfoInput; result: GenAuthQueryLdapConfigInfoResult; optional: true };
  /** LDAP server 日志查询 */
  queryLdapLog: { input: GenAuthQueryLdapLogInput; result: GenAuthQueryLdapLogResult; optional: false };
  /** LDAP server 根据 DN 查询下一级 */
  queryLdapSubEntries: { input: GenAuthQueryLdapSubEntriesInput; result: GenAuthQueryLdapSubEntriesResult; optional: false };
  /** 快捷查询受邀人列表 */
  quickFilterInviteeList: { input: GenAuthQuickFilterInviteeListInput; result: GenAuthQuickFilterInviteeListResult; optional: true };
  /** 刷新应用密钥 */
  refreshApplicationSecret: { input: GenAuthRefreshApplicationSecretInput; result: GenAuthRefreshApplicationSecretResult; optional: false };
  /** 刷新编程访问账号密钥 */
  refreshProgrammaticAccessAccountSecret: { input: GenAuthRefreshProgrammaticAccessAccountSecretInput; result: GenAuthRefreshProgrammaticAccessAccountSecretResult; optional: false };
  /** 批量拒绝通用邀请的申请 */
  reject: { input: GenAuthRejectInput; result: GenAuthRejectResult; optional: false };
  /** 关联关系模糊查询 */
  relationSearch: { input: GenAuthRelationSearchInput; result: GenAuthRelationSearchResult; optional: false };
  /** 删除数据对象的字段 */
  remoteField: { input: GenAuthRemoteFieldInput; result: GenAuthRemoteFieldResult; optional: false };
  /** 移除设备互斥生效范围配置 */
  remove: { input: GenAuthRemoveInput; result: GenAuthRemoveResult; optional: false };
  /** 部门下删除成员 */
  removeDepartmentMembers: { input: GenAuthRemoveDepartmentMembersInput; result: GenAuthRemoveDepartmentMembersResult; optional: false };
  /** 批量移除分组成员 */
  removeGroupMembers: { input: GenAuthRemoveGroupMembersInput; result: GenAuthRemoveGroupMembersResult; optional: false };
  /** 删除数据对象 */
  removeModel: { input: GenAuthRemoveModelInput; result: GenAuthRemoveModelResult; optional: false };
  /** 移除自定义操作 */
  removeOperate: { input: GenAuthRemoveOperateInput; result: GenAuthRemoveOperateResult; optional: false };
  /** 删除邀请策略用户归属 */
  removePolicyUserAttribution: { input: GenAuthRemovePolicyUserAttributionInput; result: GenAuthRemovePolicyUserAttributionResult; optional: false };
  /** 批量删除邀请策略用户归属 */
  removePolicyUserAttributionsBatch: { input: GenAuthRemovePolicyUserAttributionsBatchInput; result: GenAuthRemovePolicyUserAttributionsBatchResult; optional: false };
  /** 删除岗位 */
  removePost: { input: GenAuthRemovePostInput; result: GenAuthRemovePostResult; optional: false };
  /** 删除行关联数据 */
  removeRelationValue: { input: GenAuthRemoveRelationValueInput; result: GenAuthRemoveRelationValueResult; optional: false };
  /** 删除行 */
  removeRow: { input: GenAuthRemoveRowInput; result: GenAuthRemoveRowResult; optional: false };
  /** 租户部门下删除成员 */
  removeTenantDepartmentMembers: { input: GenAuthRemoveTenantDepartmentMembersInput; result: GenAuthRemoveTenantDepartmentMembersResult; optional: false };
  /** 批量移除租户成员 */
  removeTenantUsers: { input: GenAuthRemoveTenantUsersInput; result: GenAuthRemoveTenantUsersResult; optional: false };
  /** 移除用户归属的主部门设置 */
  removeUserAttributionMainDepartment: { input: GenAuthRemoveUserAttributionMainDepartmentInput; result: GenAuthRemoveUserAttributionMainDepartmentResult; optional: false };
  /** 删除用户实名认证信息 */
  resetUserPrincipalAuthenticationInfo: { input: GenAuthResetUserPrincipalAuthenticationInfoInput; result: GenAuthResetUserPrincipalAuthenticationInfoResult; optional: false };
  /** 批量离职用户 */
  resignPublicAccountBatch: { input: GenAuthResignPublicAccountBatchInput; result: GenAuthResignPublicAccountBatchResult; optional: false };
  /** 离职用户 */
  resignUser: { input: GenAuthResignUserInput; result: GenAuthResignUserResult; optional: false };
  /** 批量离职用户 */
  resignUserBatch: { input: GenAuthResignUserBatchInput; result: GenAuthResignUserBatchResult; optional: false };
  /** 重新上传 Pipeline 函数 */
  reuploadPipelineFunction: { input: GenAuthReuploadPipelineFunctionInput; result: GenAuthReuploadPipelineFunctionResult; optional: false };
  /** 撤回邀请 */
  revertRosterInvitation: { input: GenAuthRevertRosterInvitationInput; result: GenAuthRevertRosterInvitationResult; optional: false };
  /** 撤回邀请 */
  revertRosterInvitationBatch: { input: GenAuthRevertRosterInvitationBatchInput; result: GenAuthRevertRosterInvitationBatchResult; optional: false };
  /** 审核户企业认证 */
  reviewTenantEnterpriseCertification: { input: GenAuthReviewTenantEnterpriseCertificationInput; result: GenAuthReviewTenantEnterpriseCertificationResult; optional: false };
  /** 删除应用访问授权记录 */
  revokeApplicationAccess: { input: GenAuthRevokeApplicationAccessInput; result: GenAuthRevokeApplicationAccessResult; optional: false };
  /** 删除数据策略授权 */
  revokeDataPolicy: { input: GenAuthRevokeDataPolicyInput; result: GenAuthRevokeDataPolicyResult; optional: false };
  /** 移除分配的角色 */
  revokeRole: { input: GenAuthRevokeRoleInput; result: GenAuthRevokeRoleResult; optional: false };
  /** 批量移除分配的角色 */
  revokeRoleBatch: { input: GenAuthRevokeRoleBatchInput; result: GenAuthRevokeRoleBatchResult; optional: false };
  /** 创建编排配置 */
  saveAuthFlowConfig: { input: GenAuthSaveAuthFlowConfigInput; result: GenAuthSaveAuthFlowConfigResult; optional: true };
  /** 保存设备互斥生效范围配置 */
  saveInvitationPolicies: { input: GenAuthSaveInvitationPoliciesInput; result: GenAuthSaveInvitationPoliciesResult; optional: false };
  /** 初始化/重启 LDAP server */
  saveLdapConfigInfo: { input: GenAuthSaveLdapConfigInfoInput; result: GenAuthSaveLdapConfigInfoResult; optional: false };
  /** 搜索部门下的成员 */
  searchDepartmentMembers: { input: GenAuthSearchDepartmentMembersInput; result: GenAuthSearchDepartmentMembersResult; optional: false };
  /** 搜索部门 */
  searchDepartments: { input: GenAuthSearchDepartmentsInput; result: GenAuthSearchDepartmentsResult; optional: false };
  /** 搜索部门 */
  searchDepartmentsList: { input: GenAuthSearchDepartmentsListInput; result: GenAuthSearchDepartmentsListResult; optional: false };
  /** 搜索组织机构列表 */
  searchOrganizations: { input: GenAuthSearchOrganizationsInput; result: GenAuthSearchOrganizationsResult; optional: false };
  /** 导入租户通知邮箱用户 */
  sendEmailBatch: { input: GenAuthSendEmailBatchInput; result: GenAuthSendEmailBatchResult; optional: false };
  /** 发送邀请租户用户邮件 */
  sendInviteTenantUserEmail: { input: GenAuthSendInviteTenantUserEmailInput; result: GenAuthSendInviteTenantUserEmailResult; optional: false };
  /** 根据邀请名单发送邀请 */
  sendRosterInvitation: { input: GenAuthSendRosterInvitationInput; result: GenAuthSendRosterInvitationResult; optional: false };
  /** 批量发送邀请 */
  sendRosterInvitationBatch: { input: GenAuthSendRosterInvitationBatchInput; result: GenAuthSendRosterInvitationBatchResult; optional: false };
  /** 导入租户短信通知用户 */
  sendSmsBatch: { input: GenAuthSendSmsBatchInput; result: GenAuthSendSmsBatchResult; optional: false };
  /** 发送用户忘记密码邮箱链接 */
  sendUserResetPasswordEmailLink: { input: GenAuthSendUserResetPasswordEmailLinkInput; result: GenAuthSendUserResetPasswordEmailLinkResult; optional: false };
  /** 根据用户信息发送重置密码请求 */
  sendUserResetPasswordRequest: { input: GenAuthSendUserResetPasswordRequestInput; result: GenAuthSendUserResetPasswordRequestResult; optional: false };
  /** 设置自定义字段的值 */
  setCustomData: { input: GenAuthSetCustomDataInput; result: GenAuthSetCustomDataResult; optional: false };
  /** 创建/修改自定义字段定义 */
  setCustomFields: { input: GenAuthSetCustomFieldsInput; result: GenAuthSetCustomFieldsResult; optional: false };
  /** 设置用户 MFA 状态 */
  setMfaStatus: { input: GenAuthSetMfaStatusInput; result: GenAuthSetMfaStatusResult; optional: false };
  /** 设置公共账号所在部门 */
  setPublicAccountOfDepartments: { input: GenAuthSetPublicAccountOfDepartmentsInput; result: GenAuthSetPublicAccountOfDepartmentsResult; optional: false };
  /** 设置公共账号的岗位 */
  setPublicAccountOfnPost: { input: GenAuthSetPublicAccountOfnPostInput; result: GenAuthSetPublicAccountOfnPostResult; optional: false };
  /** 设置租户管理员 */
  setTenantAdmin: { input: GenAuthSetTenantAdminInput; result: GenAuthSetTenantAdminResult; optional: false };
  /** 设置用户归属的主部门 */
  setUserAttributionMainDepartment: { input: GenAuthSetUserAttributionMainDepartmentInput; result: GenAuthSetUserAttributionMainDepartmentResult; optional: false };
  /** 修改用户内置字段配置 */
  setUserBaseFields: { input: GenAuthSetUserBaseFieldsInput; result: GenAuthSetUserBaseFieldsResult; optional: false };
  /** 设置用户所在部门 */
  setUserDepartments: { input: GenAuthSetUserDepartmentsInput; result: GenAuthSetUserDepartmentsResult; optional: false };
  /** 设置用户 MFA 绑定手机号或者邮箱 */
  setUserMfaBindSmsEmail: { input: GenAuthSetUserMfaBindSmsEmailInput; result: GenAuthSetUserMfaBindSmsEmailResult; optional: false };
  /** 用户绑定批量公共账号 */
  setuserOfPublicAccount: { input: GenAuthSetuserOfPublicAccountInput; result: GenAuthSetuserOfPublicAccountResult; optional: false };
  /** 用户设置岗位 */
  setUserPosts: { input: GenAuthSetUserPostsInput; result: GenAuthSetUserPostsResult; optional: false };
  /** 设置用户 MFA 状态 */
  setUsersMfaStatus: { input: GenAuthSetUsersMfaStatusInput; result: GenAuthSetUsersMfaStatusResult; optional: false };
  /** 获取按应用统计的 Session 列表 */
  statisticSessionsByApp: { input: GenAuthStatisticSessionsByAppInput; result: GenAuthStatisticSessionsByAppResult; optional: true };
  /** 获取按设备统计的 Session 列表 */
  statisticSessionsByDevice: { input: GenAuthStatisticSessionsByDeviceInput; result: GenAuthStatisticSessionsByDeviceResult; optional: true };
  /** 获取按用户统计的 Session 列表 */
  statisticSessionsByUser: { input: GenAuthStatisticSessionsByUserInput; result: GenAuthStatisticSessionsByUserResult; optional: true };
  /** 挂起设备(用户详情页) */
  suspendDevice: { input: GenAuthSuspendDeviceInput; result: GenAuthSuspendDeviceResult; optional: false };
  /** 切换编排配置 */
  switchAuthFlowConfig: { input: GenAuthSwitchAuthFlowConfigInput; result: GenAuthSwitchAuthFlowConfigResult; optional: false };
  /** 执行同步风险操作 */
  triggerSyncRiskOperations: { input: GenAuthTriggerSyncRiskOperationsInput; result: GenAuthTriggerSyncRiskOperationsResult; optional: false };
  /** 执行同步任务 */
  triggerSyncTask: { input: GenAuthTriggerSyncTaskInput; result: GenAuthTriggerSyncTaskResult; optional: false };
  /** 手动触发 Webhook 执行 */
  triggerWebhook: { input: GenAuthTriggerWebhookInput; result: GenAuthTriggerWebhookResult; optional: false };
  /** 取消分配 ASA 账号 */
  unassignAsaAccount: { input: GenAuthUnassignAsaAccountInput; result: GenAuthUnassignAsaAccountResult; optional: false };
  /** 解绑公共账号关联岗位 */
  unbindPublicAccountOfPost: { input: GenAuthUnbindPublicAccountOfPostInput; result: GenAuthUnbindPublicAccountOfPostResult; optional: false };
  /** 公共账号解绑用户 */
  unbindUsersPublicAccount: { input: GenAuthUnbindUsersPublicAccountInput; result: GenAuthUnbindUsersPublicAccountResult; optional: false };
  /** 解除绑定用户在身份源下的所有身份信息 */
  unlinkIdentity: { input: GenAuthUnlinkIdentityInput; result: GenAuthUnlinkIdentityResult; optional: false };
  /** 更新一个管理员 AccessKey */
  updateAccessKey: { input: GenAuthUpdateAccessKeyInput; result: GenAuthUpdateAccessKeyResult; optional: false };
  /** 更新应用 */
  updateApplication: { input: GenAuthUpdateApplicationInput; result: GenAuthUpdateApplicationResult; optional: false };
  /** 修改应用多因素认证配置 */
  updateApplicationMfaSettings: { input: GenAuthUpdateApplicationMfaSettingsInput; result: GenAuthUpdateApplicationMfaSettingsResult; optional: false };
  /** 更新应用默认访问授权策略 */
  updateApplicationPermissionStrategy: { input: GenAuthUpdateApplicationPermissionStrategyInput; result: GenAuthUpdateApplicationPermissionStrategyResult; optional: false };
  /** 更新 ASA 账号 */
  updateAsaAccount: { input: GenAuthUpdateAsaAccountInput; result: GenAuthUpdateAsaAccountResult; optional: false };
  /** 更新授权开关 */
  updateAuthEnabled: { input: GenAuthUpdateAuthEnabledInput; result: GenAuthUpdateAuthEnabledResult; optional: false };
  /** 更新编排配置 */
  updateAuthFlowConfig: { input: GenAuthUpdateAuthFlowConfigInput; result: GenAuthUpdateAuthFlowConfigResult; optional: true };
  /** 修改 AuthFlowFunction 函数 */
  updateAuthFlowFunction: { input: GenAuthUpdateAuthFlowFunctionInput; result: GenAuthUpdateAuthFlowFunctionResult; optional: false };
  /** 修改数据策略 */
  updateDataPolicy: { input: GenAuthUpdateDataPolicyInput; result: GenAuthUpdateDataPolicyResult; optional: false };
  /** 修改数据资源 */
  updateDataResource: { input: GenAuthUpdateDataResourceInput; result: GenAuthUpdateDataResourceResult; optional: false };
  /** 修改部门 */
  updateDepartment: { input: GenAuthUpdateDepartmentInput; result: GenAuthUpdateDepartmentResult; optional: false };
  /** 更新部门状态 */
  updateDepartmentStatus: { input: GenAuthUpdateDepartmentStatusInput; result: GenAuthUpdateDepartmentStatusResult; optional: false };
  /** 更新树类型资源的扩展字段 */
  updateDnef: { input: GenAuthUpdateDnefInput; result: GenAuthUpdateDnefResult; optional: false };
  /** 编辑动态分组 */
  updateDynamicGroup: { input: GenAuthUpdateDynamicGroupInput; result: GenAuthUpdateDynamicGroupResult; optional: false };
  /** 修改邮件模版 */
  updateEmailTemplate: { input: GenAuthUpdateEmailTemplateInput; result: GenAuthUpdateEmailTemplateResult; optional: false };
  /** 更新身份源配置 */
  updateExtIdp: { input: GenAuthUpdateExtIdpInput; result: GenAuthUpdateExtIdpResult; optional: false };
  /** 更新身份源连接 */
  updateExtIdpConn: { input: GenAuthUpdateExtIdpConnInput; result: GenAuthUpdateExtIdpConnResult; optional: false };
  /** 更新数据对象的字段 */
  updateField: { input: GenAuthUpdateFieldInput; result: GenAuthUpdateFieldResult; optional: false };
  /** 修改全局多因素认证配置 */
  updateGlobalMfaSettings: { input: GenAuthUpdateGlobalMfaSettingsInput; result: GenAuthUpdateGlobalMfaSettingsResult; optional: false };
  /** 修改分组 */
  updateGroup: { input: GenAuthUpdateGroupInput; result: GenAuthUpdateGroupResult; optional: false };
  /** 更新邀请策略 */
  updateInvitationPolicy: { input: GenAuthUpdateInvitationPolicyInput; result: GenAuthUpdateInvitationPolicyResult; optional: false };
  /** 更新邀请名单 */
  updateInvitationRoster: { input: GenAuthUpdateInvitationRosterInput; result: GenAuthUpdateInvitationRosterResult; optional: false };
  /** 获取邀请策略邮件模板 */
  updateInviteEmailTemplate: { input: GenAuthUpdateInviteEmailTemplateInput; result: GenAuthUpdateInviteEmailTemplateResult; optional: false };
  /** 更新 LDAP server 配置信息 */
  updateLdapConfigInfo: { input: GenAuthUpdateLdapConfigInfoInput; result: GenAuthUpdateLdapConfigInfoResult; optional: true };
  /** 更新应用登录页配置 */
  updateLoginPageConfig: { input: GenAuthUpdateLoginPageConfigInput; result: GenAuthUpdateLoginPageConfigResult; optional: false };
  /** 更新数据对象 */
  updateModel: { input: GenAuthUpdateModelInput; result: GenAuthUpdateModelResult; optional: false };
  /** 更新多租户管理员用户 */
  updateMultipleTenantAdmin: { input: GenAuthUpdateMultipleTenantAdminInput; result: GenAuthUpdateMultipleTenantAdminResult; optional: false };
  /** 修改权限分组信息 */
  updateNamespace: { input: GenAuthUpdateNamespaceInput; result: GenAuthUpdateNamespaceResult; optional: false };
  /** 更新部门状态 */
  updateNodeStatus: { input: GenAuthUpdateNodeStatusInput; result: GenAuthUpdateNodeStatusResult; optional: false };
  /** 更新操作管理 */
  updateOperate: { input: GenAuthUpdateOperateInput; result: GenAuthUpdateOperateResult; optional: false };
  /** 修改组织机构 */
  updateOrganization: { input: GenAuthUpdateOrganizationInput; result: GenAuthUpdateOrganizationResult; optional: false };
  /** 更新组织机构状态 */
  updateOrganizationStatus: { input: GenAuthUpdateOrganizationStatusInput; result: GenAuthUpdateOrganizationStatusResult; optional: false };
  /** 修改权限空间 */
  updatePermissionNamespace: { input: GenAuthUpdatePermissionNamespaceInput; result: GenAuthUpdatePermissionNamespaceResult; optional: false };
  /** 修改 Pipeline 函数 */
  updatePipelineFunction: { input: GenAuthUpdatePipelineFunctionInput; result: GenAuthUpdatePipelineFunctionResult; optional: false };
  /** 修改 Pipeline 函数顺序 */
  updatePipelineOrder: { input: GenAuthUpdatePipelineOrderInput; result: GenAuthUpdatePipelineOrderResult; optional: false };
  /** 更新岗位信息 */
  updatePost: { input: GenAuthUpdatePostInput; result: GenAuthUpdatePostResult; optional: false };
  /** 修改公共账号资料 */
  updatePublicAccount: { input: GenAuthUpdatePublicAccountInput; result: GenAuthUpdatePublicAccountResult; optional: false };
  /** 批量修改公共账号资料 */
  updatePublicAccountBatch: { input: GenAuthUpdatePublicAccountBatchInput; result: GenAuthUpdatePublicAccountBatchResult; optional: false };
  /** 更新策略流程配置补充信息 */
  updateRegisterExtendsFields: { input: GenAuthUpdateRegisterExtendsFieldsInput; result: GenAuthUpdateRegisterExtendsFieldsResult; optional: false };
  /** 修改资源 */
  updateResource: { input: GenAuthUpdateResourceInput; result: GenAuthUpdateResourceResult; optional: false };
  /** 修改角色 */
  updateRole: { input: GenAuthUpdateRoleInput; result: GenAuthUpdateRoleResult; optional: false };
  /** 更新行 */
  updateRow: { input: GenAuthUpdateRowInput; result: GenAuthUpdateRowResult; optional: false };
  /** 更新设备互斥规则配置 */
  updateRuleSettings: { input: GenAuthUpdateRuleSettingsInput; result: GenAuthUpdateRuleSettingsResult; optional: false };
  /** 修改安全配置 */
  updateSecuritySettings: { input: GenAuthUpdateSecuritySettingsInput; result: GenAuthUpdateSecuritySettingsResult; optional: true };
  /** 修改同步任务 */
  updateSyncTask: { input: GenAuthUpdateSyncTaskInput; result: GenAuthUpdateSyncTaskResult; optional: false };
  /** 更新租户数据 */
  updateTenant: { input: GenAuthUpdateTenantInput; result: GenAuthUpdateTenantResult; optional: false };
  /** 更新协调管理员 */
  updateTenantCooperator: { input: GenAuthUpdateTenantCooperatorInput; result: GenAuthUpdateTenantCooperatorResult; optional: false };
  /** 修改租户企业认证 */
  updateTenantEnterpriseCertification: { input: GenAuthUpdateTenantEnterpriseCertificationInput; result: GenAuthUpdateTenantEnterpriseCertificationResult; optional: false };
  /** 更新租户控制台扫码登录状态 */
  updateTenantQrCodeState: { input: GenAuthUpdateTenantQrCodeStateInput; result: GenAuthUpdateTenantQrCodeStateResult; optional: false };
  /** 更新租户成员 */
  updateTenantUser: { input: GenAuthUpdateTenantUserInput; result: GenAuthUpdateTenantUserResult; optional: false };
  /** 更新通用邀请配置 */
  updateUniversalInvitation: { input: GenAuthUpdateUniversalInvitationInput; result: GenAuthUpdateUniversalInvitationResult; optional: true };
  /** 修改用户资料 */
  updateUser: { input: GenAuthUpdateUserInput; result: GenAuthUpdateUserResult; optional: false };
  /** 批量修改用户资料 */
  updateUserBatch: { input: GenAuthUpdateUserBatchInput; result: GenAuthUpdateUserBatchResult; optional: false };
  /** 更新租户控制台扫码登录状态 */
  updateUserpoolTenantAppqrcodeState: { input: GenAuthUpdateUserpoolTenantAppqrcodeStateInput; result: GenAuthUpdateUserpoolTenantAppqrcodeStateResult; optional: false };
  /** 更新用户池租户配置信息 */
  updateUserpoolTenantConfig: { input: GenAuthUpdateUserpoolTenantConfigInput; result: GenAuthUpdateUserpoolTenantConfigResult; optional: false };
  /** 更新用户池租户配置信息 */
  updateUserPoolTenantConfig: { input: GenAuthUpdateUserPoolTenantConfigInput; result: GenAuthUpdateUserPoolTenantConfigResult; optional: false };
  /** 修改 Webhook 配置 */
  updateWebhook: { input: GenAuthUpdateWebhookInput; result: GenAuthUpdateWebhookResult; optional: false };
  /** 用户关联岗位 */
  userConnectionPost: { input: GenAuthUserConnectionPostInput; result: GenAuthUserConnectionPostResult; optional: false };
  /** 用户属性解密 */
  userFieldDecrypt: { input: GenAuthUserFieldDecryptInput; result: GenAuthUserFieldDecryptResult; optional: false };
  /** 获取用户池租户配置信息 */
  userpollTenantConfig: { input: GenAuthUserpollTenantConfigInput; result: GenAuthUserpollTenantConfigResult; optional: true };
  /** 获取用户池租户配置信息 */
  userpoolTenantConfig: { input: GenAuthUserpoolTenantConfigInput; result: GenAuthUserpoolTenantConfigResult; optional: true };
  /** 用户属性解密 */
  usersFieldDecrypt: { input: GenAuthUsersFieldDecryptInput; result: GenAuthUsersFieldDecryptResult; optional: false };
  /** 推送自定义事件 */
  verifyEvent: { input: GenAuthVerifyEventInput; result: GenAuthVerifyEventResult; optional: false };
}

export type GenAuthManagementMethod<K extends keyof GenAuthManagementOperations> =
  GenAuthManagementOperations[K]['optional'] extends true
    ? <T = GenAuthManagementOperations[K]['result']>(input?: GenAuthManagementOperations[K]['input'] & GenAuthAdminTokenOverrideInput, options?: GenAuthManagementRequestOptions) => Promise<QoniResponse<T>>
    : <T = GenAuthManagementOperations[K]['result']>(input: GenAuthManagementOperations[K]['input'] & GenAuthAdminTokenOverrideInput, options?: GenAuthManagementRequestOptions) => Promise<QoniResponse<T>>;

export type GenAuthManagementClient = { [K in keyof GenAuthManagementOperations]: GenAuthManagementMethod<K> };

export interface GenAuthManagementNamespaces {
  accessKeys: Pick<GenAuthManagementClient, "createAccessKey" | "deleteAccessKey" | "getAccessKey" | "getAccessKeyList" | "listAccessKey" | "updateAccessKey"> & {
    create: GenAuthManagementClient["createAccessKey"];
    delete: GenAuthManagementClient["deleteAccessKey"];
    update: GenAuthManagementClient["updateAccessKey"];
  };
  applications: Pick<GenAuthManagementClient, "assignAsaAccount" | "authorizeApplicationAccess" | "batchApplicationsAuth" | "changeUserpoolTenanExtIdpConnState" | "changeUserpoolTenantExtIdpConnState" | "checkDomainAvailable" | "copyAuthFlowConfig" | "createApplication" | "createAsaAccount" | "createAsaAccountBatch" | "createAsaAccountsBatch" | "createAuthFlowAppConfig" | "createProgrammaticAccessAccount" | "deleteApplication" | "deleteAsaAccount" | "deleteAsaAccountBatch" | "deleteAsaAccountsBatch" | "deleteAuth" | "deleteAuthFlowConfig" | "deleteProgrammaticAccessAccount" | "detailAuthSubject" | "disabledAuthFlowApp" | "disableProgrammaticAccessAccount" | "enabledAuth" | "enabledAuthFlowApp" | "enableProgrammaticAccessAccount" | "getApplication" | "getApplicationAccessControlUserList" | "getApplicationPermissionStrategy" | "getApplicationSecret" | "getApplicationSimpleInfo" | "getAsaAccount" | "getAsaAccountAssignedTargets" | "getAsaAccountBatch" | "getAsaAccountsBatch" | "getAssignedAccount" | "getAuthFlowConfig" | "getAuthFlowConfigByAppId" | "getCurrentAuthFlowConfig" | "getMfaTriggerData" | "getSubjectAuthDetail" | "listApplicationActiveUsers" | "listApplications" | "listApplicationsAuth" | "listApplicationSimpleInfo" | "listAsaAccount" | "listAsaAccounts" | "listAuthApplication" | "listAuthSubject" | "listProgrammaticAccessAccounts" | "listSubjectAuth" | "listTenantApplications" | "refreshApplicationSecret" | "refreshProgrammaticAccessAccountSecret" | "revokeApplicationAccess" | "saveAuthFlowConfig" | "switchAuthFlowConfig" | "unassignAsaAccount" | "updateApplication" | "updateApplicationMfaSettings" | "updateApplicationPermissionStrategy" | "updateAsaAccount" | "updateAuthEnabled" | "updateAuthFlowConfig" | "updateLoginPageConfig" | "updateTenantQrCodeState" | "updateUserpoolTenantAppqrcodeState" | "updateUserpoolTenantConfig" | "updateUserPoolTenantConfig" | "userpollTenantConfig" | "userpoolTenantConfig"> & {
    authorizeAccess: GenAuthManagementClient["authorizeApplicationAccess"];
    create: GenAuthManagementClient["createApplication"];
    delete: GenAuthManagementClient["deleteApplication"];
    get: GenAuthManagementClient["getApplication"];
    getSecret: GenAuthManagementClient["getApplicationSecret"];
    list: GenAuthManagementClient["listApplications"];
    refreshSecret: GenAuthManagementClient["refreshApplicationSecret"];
    revokeAccess: GenAuthManagementClient["revokeApplicationAccess"];
    update: GenAuthManagementClient["updateApplication"];
  };
  approvals: Pick<GenAuthManagementClient, "batchProcessApproval" | "closedList" | "getDetail" | "logList" | "pendList" | "processApproval"> & {
    processBatch: GenAuthManagementClient["batchProcessApproval"];
    listClosed: GenAuthManagementClient["closedList"];
    get: GenAuthManagementClient["getDetail"];
    listPending: GenAuthManagementClient["pendList"];
    process: GenAuthManagementClient["processApproval"];
  };
  auditLogs: Pick<GenAuthManagementClient, "getAdminAuditLogs" | "getUserActionLogs"> & {
    list: GenAuthManagementClient["getAdminAuditLogs"];
    listUserActions: GenAuthManagementClient["getUserActionLogs"];
  };
  billing: Pick<GenAuthManagementClient, "getAllRightsItem" | "getCurrentPackageInfo" | "getMauPeriodUsageHistory" | "getOrderDetail" | "getOrderPayDetail" | "getOrders" | "getUsageInfo"> & {

  };
  customFields: Pick<GenAuthManagementClient, "deleteCustomFields" | "getCustomData" | "getCustomFields" | "getUserBaseFields" | "listCustFields" | "listCustomFields" | "listUserBaseFields" | "setCustomData" | "setCustomFields" | "setUserBaseFields"> & {
    delete: GenAuthManagementClient["deleteCustomFields"];
    getData: GenAuthManagementClient["getCustomData"];
    get: GenAuthManagementClient["getCustomFields"];
    list: GenAuthManagementClient["listCustomFields"];
    setData: GenAuthManagementClient["setCustomData"];
    set: GenAuthManagementClient["setCustomFields"];
  };
  dataPermissions: Pick<GenAuthManagementClient, "authorizeDataPolicies" | "batchCreateDnef" | "checkDataPolicyExists" | "checkDataResourceExists" | "checkExternalUserPermission" | "checkM2mPermission" | "checkM2mSameLevelPermission" | "checkPermission" | "checkPermissionNamespaceExists" | "checkUserSameLevelPermission" | "createArrayDataResource" | "createDataPolicy" | "createDataResource" | "createDataResourceByArray" | "createDataResourceByString" | "createDataResourceByTree" | "createDnef" | "createPermissionNamespace" | "createPermissionNamespacesBatch" | "createStringDataResource" | "createTreeDataResource" | "deleteDataPolicy" | "deleteDataResource" | "deleteDnef" | "deletePermissionNamespace" | "deletePermissionNamespacesBatch" | "getDataPolicy" | "getDataResource" | "getExternalUserResourceStruct" | "getM2mPermissionList" | "getM2mResourcePermissionList" | "getM2mResourceStruct" | "getPermissionNamespace" | "getPermissionNamespacesBatch" | "getUserPermissionList" | "getUserResourcePermissionList" | "getUserResourceStruct" | "listDataPolices" | "listDataPolicies" | "listDataPolicyTargets" | "listDataResources" | "listDnef" | "listPermissionNamespaceRoles" | "listPermissionNamespaces" | "listPermissionView" | "listPermissionViewData" | "listResourceTargets" | "listSimpleDataPolices" | "listSimpleDataPolicies" | "revokeDataPolicy" | "updateDataPolicy" | "updateDataResource" | "updateDnef" | "updatePermissionNamespace"> & {

  };
  departments: Pick<GenAuthManagementClient, "addDepartmentMembers" | "createDepartment" | "createDepartmentTree" | "deleteDepartment" | "deleteDepartmentAndChilds" | "deleteDepartmentSyncRelations" | "getAllDepartments" | "getDepartment" | "getDepartmentAllApp" | "getDepartmentAvailableApp" | "getDepartmentById" | "getDepartmentSyncRelations" | "getParentDepartment" | "isDepartmentInDepartment" | "isUserInDepartment" | "listChildrenDepartments" | "listDepartmentMemberIds" | "listDepartmentMembers" | "removeDepartmentMembers" | "searchDepartmentMembers" | "searchDepartments" | "searchDepartmentsList" | "updateDepartment" | "updateDepartmentStatus" | "updateNodeStatus"> & {
    addMembers: GenAuthManagementClient["addDepartmentMembers"];
    create: GenAuthManagementClient["createDepartment"];
    delete: GenAuthManagementClient["deleteDepartment"];
    get: GenAuthManagementClient["getDepartment"];
    getById: GenAuthManagementClient["getDepartmentById"];
    getParent: GenAuthManagementClient["getParentDepartment"];
    listChildren: GenAuthManagementClient["listChildrenDepartments"];
    listMemberIds: GenAuthManagementClient["listDepartmentMemberIds"];
    listMembers: GenAuthManagementClient["listDepartmentMembers"];
    removeMembers: GenAuthManagementClient["removeDepartmentMembers"];
    update: GenAuthManagementClient["updateDepartment"];
  };
  deviceRules: Pick<GenAuthManagementClient, "findAppLists" | "getAllValidScopeSettings" | "getAllWhiteListSettings" | "getRuleSettings" | "remove" | "saveInvitationPolicies" | "updateRuleSettings"> & {

  };
  devices: Pick<GenAuthManagementClient, "addDevice" | "createDevice" | "createVerifyDevice" | "deleteDevice" | "disableDevice" | "enableDevice" | "findLastLoginAppsByDeviceIds" | "findLastLoginAppsByDeviceIdsV2" | "getDeviceStatus" | "getVerifyConfigApp" | "suspendDevice"> & {

  };
  dynamicGroups: Pick<GenAuthManagementClient, "createDynamicGroup" | "dynamicGroupSearchPart" | "getDynamicGroupMatch" | "previewDynamicGroup" | "updateDynamicGroup"> & {
    create: GenAuthManagementClient["createDynamicGroup"];
    update: GenAuthManagementClient["updateDynamicGroup"];
  };
  email: Pick<GenAuthManagementClient, "configEmailProvider" | "getEmailProvider" | "getEmailTemplates" | "previewEmailTemplate" | "updateEmailTemplate"> & {

  };
  events: Pick<GenAuthManagementClient, "createEventApp" | "defineEvent" | "listEventApps" | "listEvents" | "pub" | "pubUserEvent" | "verifyEvent"> & {

  };
  groups: Pick<GenAuthManagementClient, "addGroupMembers" | "createGroup" | "createGroupsBatch" | "createOrUpdateGroup" | "deleteGroupsBatch" | "getAllGroups" | "getGroup" | "getGroupAuthorizedResources" | "listGroupMembers" | "listGroups" | "removeGroupMembers" | "updateGroup"> & {
    addMembers: GenAuthManagementClient["addGroupMembers"];
    create: GenAuthManagementClient["createGroup"];
    deleteBatch: GenAuthManagementClient["deleteGroupsBatch"];
    get: GenAuthManagementClient["getGroup"];
    listMembers: GenAuthManagementClient["listGroupMembers"];
    list: GenAuthManagementClient["listGroups"];
    removeMembers: GenAuthManagementClient["removeGroupMembers"];
    update: GenAuthManagementClient["updateGroup"];
  };
  identityProviders: Pick<GenAuthManagementClient, "changeExtIdpConnAssociationState" | "changeExtIdpConnState" | "createExtIdp" | "createExtIdpConn" | "deleteExtIdp" | "deleteExtIdpConn" | "extIdpConnApps" | "extIdpConnStateByApps" | "getExtIdp" | "getWechatMpAccessTokenInfo" | "getWeixinAccessToken" | "listEnabledExtIdpConnsByApp" | "listExtIdp" | "listExtIdpConns" | "listTenantExtIdp" | "updateExtIdp" | "updateExtIdpConn"> & {
    create: GenAuthManagementClient["createExtIdp"];
    createConnection: GenAuthManagementClient["createExtIdpConn"];
    delete: GenAuthManagementClient["deleteExtIdp"];
    deleteConnection: GenAuthManagementClient["deleteExtIdpConn"];
    get: GenAuthManagementClient["getExtIdp"];
    list: GenAuthManagementClient["listExtIdp"];
    update: GenAuthManagementClient["updateExtIdp"];
    updateConnection: GenAuthManagementClient["updateExtIdpConn"];
  };
  invitations: Pick<GenAuthManagementClient, "addPolicyUserAttribution" | "addPolicyUserAttributionsBatch" | "approval" | "batchBindPolicy" | "batchDeleteInvitationPolicies" | "batchUnbindPolicy" | "copyInvitationPolicyById" | "createInvitationPolicy" | "createInvitationRoster" | "deleteInvitationRoster" | "deleteInvitationRosterBatch" | "deleteInvitees" | "exportUsers" | "filter" | "filterUsers" | "generateUniversalInvitation" | "getInvitationRoster" | "getInviteEmailTemplate" | "getPolicyDetailById" | "getPolicyUserAttributionDetail" | "getUniversalInvitation" | "getUserAttributionMainDepartment" | "importTemplate" | "importUsers" | "listInvitationPolicies" | "listInvitationRoster" | "listInvitationRostersByNonPolicyId" | "listInvitationRostersByPolicyId" | "listPolicyUserAttributionDetail" | "listRegisterExtendsFields" | "quickFilterInviteeList" | "reject" | "removePolicyUserAttribution" | "removePolicyUserAttributionsBatch" | "removeUserAttributionMainDepartment" | "revertRosterInvitation" | "revertRosterInvitationBatch" | "sendRosterInvitation" | "sendRosterInvitationBatch" | "setUserAttributionMainDepartment" | "updateInvitationPolicy" | "updateInvitationRoster" | "updateInviteEmailTemplate" | "updateRegisterExtendsFields" | "updateUniversalInvitation"> & {
    createPolicy: GenAuthManagementClient["createInvitationPolicy"];
    createRoster: GenAuthManagementClient["createInvitationRoster"];
    listPolicies: GenAuthManagementClient["listInvitationPolicies"];
    listRosters: GenAuthManagementClient["listInvitationRoster"];
  };
  ldap: Pick<GenAuthManagementClient, "disableLdapServer" | "getBindPwd" | "queryLdapConfigInfo" | "queryLdapLog" | "queryLdapSubEntries" | "saveLdapConfigInfo" | "updateLdapConfigInfo"> & {

  };
  metadata: Pick<GenAuthManagementClient, "capture" | "copyOperate" | "copyRowRelation" | "createField" | "createModel" | "createOperate" | "createRow" | "createRowRelation" | "executeOperate" | "exportMetadata" | "exportModel" | "getAllMetadata" | "getAllMetadataRow" | "getImportTemplate" | "getMetadataGroupList" | "getModel" | "getRelationDetails" | "getRelationInfo" | "getRelationValue" | "getRow" | "getRowBatch" | "getRowByValue" | "importMetadata" | "importModel" | "listField" | "listModel" | "listOperate" | "listOperateAll" | "listRow" | "relationSearch" | "remoteField" | "removeModel" | "removeOperate" | "removeRelationValue" | "removeRow" | "updateField" | "updateModel" | "updateOperate" | "updateRow"> & {

  };
  namespaces: Pick<GenAuthManagementClient, "createNamespace" | "createNamespacesBatch" | "deleteNamespace" | "deleteNamespacesBatch" | "getNamespace" | "getNamespacesBatch" | "listNamespaceRoles" | "listNamespaces" | "updateNamespace"> & {
    create: GenAuthManagementClient["createNamespace"];
    createBatch: GenAuthManagementClient["createNamespacesBatch"];
    delete: GenAuthManagementClient["deleteNamespace"];
    deleteBatch: GenAuthManagementClient["deleteNamespacesBatch"];
    get: GenAuthManagementClient["getNamespace"];
    getBatch: GenAuthManagementClient["getNamespacesBatch"];
    listRoles: GenAuthManagementClient["listNamespaceRoles"];
    list: GenAuthManagementClient["listNamespaces"];
    update: GenAuthManagementClient["updateNamespace"];
  };
  organizations: Pick<GenAuthManagementClient, "createOrganization" | "deleteOrganization" | "getOrganization" | "getOrganizationBatch" | "getOrganizationsBatch" | "listOrganizations" | "searchOrganizations" | "updateOrganization" | "updateOrganizationStatus"> & {
    create: GenAuthManagementClient["createOrganization"];
    delete: GenAuthManagementClient["deleteOrganization"];
    get: GenAuthManagementClient["getOrganization"];
    list: GenAuthManagementClient["listOrganizations"];
    update: GenAuthManagementClient["updateOrganization"];
  };
  permissions: Pick<GenAuthManagementClient, "authorizeResources" | "getAuthorizedResources" | "getResourceAuthorizedTargets" | "isActionAllowed"> & {
    authorize: GenAuthManagementClient["authorizeResources"];
    listResources: GenAuthManagementClient["getAuthorizedResources"];
    isAllowed: GenAuthManagementClient["isActionAllowed"];
  };
  pipelines: Pick<GenAuthManagementClient, "createAuthFlowFunction" | "createPipelineFunction" | "deleteAuthFlowFunction" | "deletePipelineFunction" | "getAuthFlowFunction" | "getPipelineFunction" | "getPipelineLogs" | "listPipelineFunctions" | "reuploadPipelineFunction" | "updateAuthFlowFunction" | "updatePipelineFunction" | "updatePipelineOrder"> & {
    create: GenAuthManagementClient["createPipelineFunction"];
    delete: GenAuthManagementClient["deletePipelineFunction"];
    get: GenAuthManagementClient["getPipelineFunction"];
    list: GenAuthManagementClient["listPipelineFunctions"];
    update: GenAuthManagementClient["updatePipelineFunction"];
  };
  policies: Pick<GenAuthManagementClient, "deleteCommonAuthorizeBatch" | "listCommonAuthorize"> & {

  };
  positions: Pick<GenAuthManagementClient, "createPost" | "getPost" | "getPostById" | "getUserPost" | "getUserPosts" | "postList" | "postListBatch" | "removePost" | "setUserPosts" | "updatePost" | "userConnectionPost"> & {
    create: GenAuthManagementClient["createPost"];
    get: GenAuthManagementClient["getPost"];
    getById: GenAuthManagementClient["getPostById"];
    listUserPosts: GenAuthManagementClient["getUserPosts"];
    list: GenAuthManagementClient["postList"];
    listBatch: GenAuthManagementClient["postListBatch"];
    delete: GenAuthManagementClient["removePost"];
    setUserPosts: GenAuthManagementClient["setUserPosts"];
    update: GenAuthManagementClient["updatePost"];
  };
  publicAccounts: Pick<GenAuthManagementClient, "bindPublicAccountOfRoles" | "bindUsersPublicAccount" | "changeIntoPublicAccount" | "createPublicAccount" | "createPublicAccountsBatch" | "deletePublicAccountsBatch" | "getGroupsOfPublicAccount" | "getPostOfPublicUser" | "getPublicAccount" | "getPublicAccountBatch" | "getPublicAccountDepartments" | "getPublicAccountOfGroups" | "getPublicAccountRoles" | "getPublicAccountsOfDepartment" | "getPublicAccountsOfGroup" | "getPublicAccountsOfPost" | "getPublicAccountsOfRole" | "getPublicAccountsOfUser" | "getUsersOfPublicAccount" | "kickPublicAccounts" | "listPublicAccounts" | "resignPublicAccountBatch" | "setPublicAccountOfDepartments" | "setPublicAccountOfnPost" | "setuserOfPublicAccount" | "unbindPublicAccountOfPost" | "unbindUsersPublicAccount" | "updatePublicAccount" | "updatePublicAccountBatch"> & {
    create: GenAuthManagementClient["createPublicAccount"];
    createBatch: GenAuthManagementClient["createPublicAccountsBatch"];
    deleteBatch: GenAuthManagementClient["deletePublicAccountsBatch"];
    get: GenAuthManagementClient["getPublicAccount"];
    getBatch: GenAuthManagementClient["getPublicAccountBatch"];
    list: GenAuthManagementClient["listPublicAccounts"];
    update: GenAuthManagementClient["updatePublicAccount"];
  };
  resources: Pick<GenAuthManagementClient, "associateTenantResource" | "batchDeleteCommonResource" | "createResource" | "createResourcesBatch" | "deleteCommonResourcesBatch" | "deleteResource" | "deleteResourcesBatch" | "getResource" | "getResourcesBatch" | "listCommonResource" | "listResources" | "updateResource"> & {
    create: GenAuthManagementClient["createResource"];
    createBatch: GenAuthManagementClient["createResourcesBatch"];
    delete: GenAuthManagementClient["deleteResource"];
    deleteBatch: GenAuthManagementClient["deleteResourcesBatch"];
    get: GenAuthManagementClient["getResource"];
    getBatch: GenAuthManagementClient["getResourcesBatch"];
    list: GenAuthManagementClient["listResources"];
    update: GenAuthManagementClient["updateResource"];
  };
  riskLists: Pick<GenAuthManagementClient, "add" | "addRiskListPolicy" | "addUser" | "deleteById" | "deleteRiskListPolicyById" | "deleteUserListById" | "findIpList" | "findRiskListPolicy" | "findUserList"> & {
    addIp: GenAuthManagementClient["add"];
    addUser: GenAuthManagementClient["addUser"];
    deleteIp: GenAuthManagementClient["deleteById"];
    deleteUser: GenAuthManagementClient["deleteUserListById"];
    listIps: GenAuthManagementClient["findIpList"];
    listUsers: GenAuthManagementClient["findUserList"];
  };
  roles: Pick<GenAuthManagementClient, "assignRole" | "assignRoleBatch" | "checkMutualExclusion" | "checkParamsNamespace" | "checkRoleMutualExclusion" | "checkRoleParams" | "createAdminRole" | "createRole" | "createRolesBatch" | "deleteAdminRoles" | "deleteAdminRolesBatch" | "deleteRoles" | "deleteRolesBatch" | "getRole" | "getRoleAuthorizedResources" | "getRolePolicyList" | "listRoleAllMembers" | "listRoleAssignments" | "listRoleDepartments" | "listRoleMembers" | "listRoles" | "multipleNamespaceDeleteRolesBatch" | "revokeRole" | "revokeRoleBatch" | "updateRole"> & {
    assign: GenAuthManagementClient["assignRole"];
    assignBatch: GenAuthManagementClient["assignRoleBatch"];
    create: GenAuthManagementClient["createRole"];
    createBatch: GenAuthManagementClient["createRolesBatch"];
    deleteBatch: GenAuthManagementClient["deleteRolesBatch"];
    get: GenAuthManagementClient["getRole"];
    listAssignments: GenAuthManagementClient["listRoleAssignments"];
    listMembers: GenAuthManagementClient["listRoleMembers"];
    list: GenAuthManagementClient["listRoles"];
    revoke: GenAuthManagementClient["revokeRole"];
    revokeBatch: GenAuthManagementClient["revokeRoleBatch"];
    update: GenAuthManagementClient["updateRole"];
  };
  security: Pick<GenAuthManagementClient, "closeGlobalMfaSettings" | "disableGlobalMfaSettings" | "getGlobalMfaSettings" | "getSecuritySettings" | "updateGlobalMfaSettings" | "updateSecuritySettings"> & {
    get: GenAuthManagementClient["getSecuritySettings"];
    update: GenAuthManagementClient["updateSecuritySettings"];
  };
  sessions: Pick<GenAuthManagementClient, "deactivateAllSessions" | "deactivateSessionsBatch" | "listSessions" | "listSessionsDetailByView" | "statisticSessionsByApp" | "statisticSessionsByDevice" | "statisticSessionsByUser"> & {
    deactivateAll: GenAuthManagementClient["deactivateAllSessions"];
    deactivateBatch: GenAuthManagementClient["deactivateSessionsBatch"];
    list: GenAuthManagementClient["listSessions"];
  };
  sync: Pick<GenAuthManagementClient, "cancelSyncRiskOperation" | "createSyncTask" | "getSyncJob" | "getSyncTask" | "listSyncJobLogs" | "listSyncJobs" | "listSyncRiskOperations" | "listSyncTasks" | "triggerSyncRiskOperations" | "triggerSyncTask" | "updateSyncTask"> & {
    create: GenAuthManagementClient["createSyncTask"];
    get: GenAuthManagementClient["getSyncTask"];
    list: GenAuthManagementClient["listSyncTasks"];
    update: GenAuthManagementClient["updateSyncTask"];
  };
  tenants: Pick<GenAuthManagementClient, "addTenantDepartmentMembers" | "addTenantUsers" | "createMultipleTenantAdmin" | "createTenant" | "createTenantCooperator" | "createTenantEnterpriseCertification" | "createTenantUser" | "deleteMultipleTenantAdmin" | "deleteTenant" | "deleteTenantAdmin" | "deleteTenantCooperator" | "deleteTenantUser" | "generateInviteTenantUserLink" | "getMultipleTenantAdmin" | "getTenant" | "getTenantByCode" | "getTenantCooperator" | "getTenantCooperatorMenu" | "getTenantEnterpriseCertification" | "getTenantLittleInfo" | "getTenantUser" | "importTenant" | "importTenantHistory" | "importTenantNotifyUser" | "listInviteTenantUserRecords" | "listInviteTennatUserRecords" | "listMultipleTenantAdmin" | "listMultipleTenantAdmins" | "listTenantAdmin" | "listTenantCooperators" | "listTenants" | "listTenantUsers" | "removeTenantDepartmentMembers" | "removeTenantUsers" | "reviewTenantEnterpriseCertification" | "sendEmailBatch" | "sendInviteTenantUserEmail" | "sendSmsBatch" | "setTenantAdmin" | "updateMultipleTenantAdmin" | "updateTenant" | "updateTenantCooperator" | "updateTenantEnterpriseCertification" | "updateTenantUser"> & {
    addUsers: GenAuthManagementClient["addTenantUsers"];
    create: GenAuthManagementClient["createTenant"];
    delete: GenAuthManagementClient["deleteTenant"];
    get: GenAuthManagementClient["getTenant"];
    list: GenAuthManagementClient["listTenants"];
    listUsers: GenAuthManagementClient["listTenantUsers"];
    removeUsers: GenAuthManagementClient["removeTenantUsers"];
    update: GenAuthManagementClient["updateTenant"];
  };
  users: Pick<GenAuthManagementClient, "batchGetUserEncryptPassword" | "checkSessionStatus" | "createUser" | "createUsersBatch" | "deleteUsersBatch" | "deleteUserSyncRelations" | "getMfaStatus" | "getOtpSecretByUser" | "getUser" | "getUserAccessibleApps" | "getUserAuthorizedApps" | "getUserAuthorizedResources" | "getUserBatch" | "getUserDepartments" | "getUserEncryptPasswordBatch" | "getUserGroups" | "getUserIdentities" | "getUserLoggedinApps" | "getUserLoggedinIdentities" | "getUserLoggedInIdentities" | "getUserLoginHistory" | "getUserMfaInfo" | "getUserMfaStatus" | "getUserPasswordCiphertext" | "getUserPrincipalAuthenticationInfo" | "getUserRoles" | "getUserSyncRelations" | "hasAnyRole" | "importOtp" | "isUserExists" | "kickUsers" | "linkIdentity" | "listArchivedUsers" | "listUsers" | "listUsersLegacy" | "resetUserPrincipalAuthenticationInfo" | "resignUser" | "resignUserBatch" | "sendUserResetPasswordEmailLink" | "sendUserResetPasswordRequest" | "setMfaStatus" | "setUserDepartments" | "setUserMfaBindSmsEmail" | "setUsersMfaStatus" | "unlinkIdentity" | "updateUser" | "updateUserBatch" | "userFieldDecrypt" | "usersFieldDecrypt"> & {
    create: GenAuthManagementClient["createUser"];
    createBatch: GenAuthManagementClient["createUsersBatch"];
    deleteBatch: GenAuthManagementClient["deleteUsersBatch"];
    get: GenAuthManagementClient["getUser"];
    listAuthorizedResources: GenAuthManagementClient["getUserAuthorizedResources"];
    getBatch: GenAuthManagementClient["getUserBatch"];
    listDepartments: GenAuthManagementClient["getUserDepartments"];
    listGroups: GenAuthManagementClient["getUserGroups"];
    listRoles: GenAuthManagementClient["getUserRoles"];
    exists: GenAuthManagementClient["isUserExists"];
    kick: GenAuthManagementClient["kickUsers"];
    list: GenAuthManagementClient["listUsers"];
    resign: GenAuthManagementClient["resignUser"];
    resignBatch: GenAuthManagementClient["resignUserBatch"];
    setDepartments: GenAuthManagementClient["setUserDepartments"];
    update: GenAuthManagementClient["updateUser"];
  };
  webhooks: Pick<GenAuthManagementClient, "createWebhook" | "deleteWebhook" | "getWebhook" | "getWebhookEventList" | "getWebhookLogs" | "listWebhooks" | "triggerWebhook" | "updateWebhook"> & {
    create: GenAuthManagementClient["createWebhook"];
    delete: GenAuthManagementClient["deleteWebhook"];
    get: GenAuthManagementClient["getWebhook"];
    list: GenAuthManagementClient["listWebhooks"];
    update: GenAuthManagementClient["updateWebhook"];
  };
  whitelist: Pick<GenAuthManagementClient, "addWhitelist" | "addWhitelistOfApp" | "deleteWhitelist" | "deleteWhitelistOfApp" | "listWhitelist" | "listWhitelistOfApp" | "listWhitelists" | "listWhitelistsOfApp"> & {

  };
}
