---
title: GenAuth 管理 SDK
description: 初始化 SDK，管理用户、用户组、组织、角色、权限、应用和自定义字段。
status: draft
sdkCandidate: contracts/genauth-management.json
lastReviewed: 2026-10-12
pageClass: qoni-sdk-management
---

## 初始化

```ts
import { Qoni } from '@qoniai/qoni'

const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
})
```

使用绑定目标 GenAuth 用户池的 Qoni 访问密钥，在服务端调用。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `accessKey` | `string` | 是 | Qoni 访问密钥 |
| `secretKey` | `string` | 是 | Qoni 访问密钥 Secret |
| `host` | `string` | 否 | 私有部署的 Qoni 服务地址 |
| `genauthHost` | `string` | 否 | 指定 GenAuth 服务地址 |
| `timeoutMs` | `number` | 否 | 请求超时，单位毫秒，默认 `30000` |
| `fetch` | `typeof fetch` | 否 | 自定义 HTTP transport |

## 用户管理

```ts
const { data: user } = await qoni.genauth.users.create({
  username: 'sdk-example-user',
  name: 'Example user',
})

const { data: userDetails } = await qoni.genauth.users.get({ userId: user.userId })
await qoni.genauth.users.update({ userId: user.userId, nickname: 'Alice' })
const { data: userBatch } = await qoni.genauth.users.getBatch({ userIds: [user.userId] })
```

| 方法 | 功能 | 主要参数 | `data` |
| --- | --- | --- | --- |
| `users.create` | 创建用户 | username / email / phone；name、password 等可选 | 用户对象 |
| `users.get` | 读取用户 | userId | 用户对象 |
| `users.getBatch` | 批量读取用户 | userIds: string[] | 用户数组 |
| `users.update` | 更新用户 | userId 与需要更新的字段 | 更新后的用户 |
| `users.createBatch` | 批量创建用户 | list: 用户参数数组 | 用户数组 |
| `users.deleteBatch` | 批量删除用户 | userIds: string[] | 删除结果 |

创建时至少设置用户名、邮箱或手机号。删除在职用户前，先按业务流程通过 `users.resign({ userId })` 设置离职状态。

## 用户查询与分页

```ts
const { data: userPage } = await qoni.genauth.users.list({
  page: 1,
  limit: 20,
  keywords: 'alice',
  options: { fuzzySearchOn: ['username', 'email'] },
})
console.log(userPage.list, userPage.totalCount)

for await (const item of qoni.genauth.users.iterate({ limit: 50 })) {
  console.log(item.userId)
}
```

| 方法 | 功能 | 主要参数 | `data` |
| --- | --- | --- | --- |
| `users.list` | 分页查询用户 | page、limit、keywords、options | { list, totalCount } |
| `users.iterate` | 逐个遍历用户 | page 默认 1，limit 默认 50、范围 1–50 | `AsyncIterable<User>` |

`page` 从 1 开始。`keywords` 用于关键字筛选，`options.fuzzySearchOn` 指定匹配字段。无需筛选时省略这两个参数。`iterate` 中使用 `break` 停止遍历。

## 用户组

```ts
const { data: group } = await qoni.genauth.groups.create({
  code: 'engineering',
  name: 'Engineering',
})
await qoni.genauth.groups.addMembers({ code: group.code, userIds: [user.userId] })
const { data: groupPage } = await qoni.genauth.groups.list({ page: 1, limit: 20 })
```

| 方法 | 功能 | 主要参数 | `data` |
| --- | --- | --- | --- |
| `groups.create` | 创建用户组 | code、name | 用户组对象 |
| `groups.get` | 读取用户组 | code | 用户组对象 |
| `groups.list` | 查询用户组 | page、limit | { list, totalCount } |
| `groups.update` | 更新用户组 | code 与更新字段 | 用户组对象 |
| `groups.addMembers` | 添加成员 | code、userIds | 操作结果 |

## 组织与部门

```ts
await qoni.genauth.organizations.create({
  organizationCode: 'company',
  organizationName: 'Example company',
})
const { data: department } = await qoni.genauth.departments.create({
  organizationCode: 'company',
  parentDepartmentId: 'root',
  name: 'Engineering',
  code: 'engineering',
})
await qoni.genauth.departments.addMembers({
  organizationCode: 'company',
  departmentId: department.departmentId,
  userIds: [user.userId],
})
```

| 方法 | 功能 | 主要参数 | `data` |
| --- | --- | --- | --- |
| `organizations.create` | 创建组织 | organizationCode、organizationName | 组织对象 |
| `organizations.get` | 读取组织 | organizationCode | 组织对象 |
| `organizations.list` | 查询组织 | page、limit | 组织列表 |
| `organizations.update` | 更新组织 | organizationCode 与更新字段 | 组织对象 |
| `departments.create` | 创建部门 | organizationCode、parentDepartmentId、name | 部门对象 |
| `departments.get` | 读取部门 | organizationCode、departmentId 或 departmentCode | 部门对象 |
| `departments.update` | 更新部门 | organizationCode、departmentId 与更新字段 | 部门对象 |
| `departments.addMembers` | 添加部门成员 | organizationCode、departmentId、userIds | 操作结果 |

根部门的 `parentDepartmentId` 使用 `root`；其他部门使用实际父部门 ID。

## 角色、资源与授权

```ts
await qoni.genauth.namespaces.create({ code: 'project', name: 'Project' })
await qoni.genauth.roles.create({ namespace: 'project', code: 'reader', name: 'Reader' })
await qoni.genauth.roles.assign({
  namespace: 'project',
  code: 'reader',
  targets: [{ targetType: 'USER', targetIdentifier: user.userId }],
})
await qoni.genauth.resources.create({
  namespace: 'project', code: 'documents', type: 'API',
  apiIdentifier: '/documents',
  actions: [{ name: 'documents:read', description: 'Read documents' }],
})
await qoni.genauth.permissions.authorize({
  namespace: 'project',
  list: [{
    targetType: 'ROLE', targetIdentifiers: ['reader'],
    resources: [{ code: 'documents:*', resourceType: 'API', actions: ['documents:read'] }],
  }],
})
const { data: permission } = await qoni.genauth.permissions.isAllowed({
  namespace: 'project', userId: user.userId,
  resource: 'documents:123', action: 'documents:read',
})
console.log(permission.allowed)
```

| 方法 | 功能 | 主要参数 | `data` |
| --- | --- | --- | --- |
| `namespaces.create` | 创建权限空间 | code、name | 权限空间对象 |
| `roles.create` | 创建角色 | namespace、code、name | 角色对象 |
| `roles.list` | 查询角色 | namespace、page、limit | { list, totalCount } |
| `roles.assign` | 分配角色 | namespace、code、targets | 操作结果 |
| `resources.create` | 定义资源及动作 | namespace、code、type、actions；API 资源使用 apiIdentifier | 资源对象 |
| `permissions.authorize` | 授予资源权限 | namespace、list | 操作结果 |
| `permissions.isAllowed` | 判断用户权限 | namespace、userId、resource、action | { allowed } |

角色、资源和授权使用同一 `namespace`。创建资源用 `type`，授权资源项用 `resourceType`。

## 应用管理

```ts
const { data: application } = await qoni.genauth.applications.create({
  appName: 'Example app',
  appIdentifier: 'example-app',
  appType: 'web',
  defaultProtocol: 'oidc',
  redirectUris: ['https://app.example.com/callback'],
})
const { data: appDetails } = await qoni.genauth.applications.get({ appId: application.appId })
const { data: appPage } = await qoni.genauth.applications.list({ page: 1, limit: 20 })
```

| 方法 | 功能 | 主要参数 | `data` |
| --- | --- | --- | --- |
| `applications.create` | 创建应用 | appName；自建应用传 appIdentifier，可设置 appType、defaultProtocol、redirectUris | 应用创建结果 |
| `applications.get` | 读取应用配置 | appId | 应用对象 |
| `applications.list` | 分页查询应用 | page、limit、keywords | 应用列表 |
| `applications.update` | 更新应用配置 | appId 与更新字段 | 应用对象 |
| `applications.delete` | 删除应用 | appId | 操作结果 |

## 自定义字段

```ts
await qoni.genauth.customFields.set({
  list: [{ targetType: 'USER', key: 'costCenter', label: 'Cost center', dataType: 'STRING' }],
})
await qoni.genauth.customFields.setData({
  targetType: 'USER', targetIdentifier: user.userId,
  list: [{ key: 'costCenter', value: 'engineering' }],
})
const { data: fieldValues } = await qoni.genauth.customFields.getData({
  targetType: 'USER', targetIdentifier: user.userId,
})
```

| 方法 | 功能 | 主要参数 | `data` |
| --- | --- | --- | --- |
| `customFields.list` | 查询字段定义 | targetType，默认 USER | 字段定义列表 |
| `customFields.set` | 创建或更新字段定义 | list: { targetType, key, label, dataType }[] | 操作结果 |
| `customFields.setData` | 设置对象字段值 | targetType、targetIdentifier、list | 操作结果 |
| `customFields.getData` | 读取对象字段值 | targetType、targetIdentifier | 字段数据 |

先定义字段，再写入字段值。已有字段的 `dataType` 不能修改；角色字段需要传所属 `namespace`。

## 其他管理功能

| 入口 | 功能 |
| --- | --- |
| `tenants` | 租户与租户成员 |
| `identityProviders` | 外部身份源与连接配置 |
| `dataPermissions / policies` | 数据资源、策略及数据授权 |
| `auditLogs / sessions` | 管理审计与用户会话 |
| `security / whitelist / riskLists` | MFA、安全设置及访问名单 |
| `webhooks / events` | Webhook 配置与事件 |
| `sync / pipelines` | 账号同步及认证流程 |
| `accessKeys` | 访问密钥管理 |
| `positions / dynamicGroups` | 岗位与动态用户组 |
| `devices / deviceRules` | 设备及设备规则 |
| `publicAccounts / invitations` | 公共账号及邀请 |
| `approvals / ldap` | 审批与 LDAP 配置 |
| `metadata / email / billing` | 元数据、邮件及计费配置 |

以上入口均位于 `qoni.genauth` 下。具体方法、参数与返回类型见 [管理方法参考](./genauth-management-api)。

## 返回值与请求取消

```ts
const controller = new AbortController()
const { data: rolePage, meta } = await qoni.genauth.roles.list(
  { namespace: 'project', page: 1, limit: 20 },
  { signal: controller.signal },
)
console.log(rolePage.list, meta.requestId)
```

方法返回 `Promise<QoniResponse<T>>`：`data` 为业务结果，`meta.requestId` 为请求标识。第二参数传 `{ signal }`，调用 `controller.abort()` 取消请求。`users.iterate` 返回 `AsyncIterable`。

## 使用已有管理 Token

```ts
const { data: roleList } = await qoni.genauth.roles.list({
  namespace: 'project',
  adminToken: process.env.GENAUTH_MANAGEMENT_TOKEN!,
  userPoolId: process.env.GENAUTH_USER_POOL_ID!,
})
```

`adminToken` 与 `userPoolId` 必须同时传入。显式传入的 Token 过期后由调用方更新。

## 错误处理

```ts
import { QoniError } from '@qoniai/qoni'

try {
  await qoni.genauth.users.get({ userId: '<user-id>' })
} catch (error) {
  if (error instanceof QoniError) {
    console.error(error.code, error.message, error.requestId)
  }
  throw error
}
```

| 错误 | 处理方式 |
| --- | --- |
| `QoniValidationError` | 检查必填参数与字段类型 |
| `401` / `403` | 检查凭据、用户池绑定及管理权限 |
| `404` | 检查对象 ID 与所属用户池 |
| `409` | 处理对象状态冲突或标识重复 |
| `QoniTimeoutError` | 重试写操作前先查询原操作结果 |
| 其他 `QoniError` | 查看 `code`、`message`、`requestId`、`body` |
