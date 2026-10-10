---
title: Agent Mail 与 Agent Phone SDK
description: 使用 Qoni Node.js SDK 管理 Agent 邮箱、号码、通信任务和供应商配置。
status: draft
sdkCandidate: contracts/genauth-communication.json
lastReviewed: 2026-10-10
---

# Agent Mail 与 Agent Phone SDK

本页说明如何使用 `qoni.genauth.agentMail` 和 `qoni.genauth.agentPhone` 管理通信资源、收取验证码并查询异步操作。

::: warning 待发布接口
本页对应本地 Qoni SDK 通信扩展。截至 2026-10-10，npm 发布版 `@qoniai/qoni@0.9.0` 尚未包含这些接口；示例需要包含通信扩展的 SDK 构建。服务端也必须部署对应模块，SDK 不会自动启用供应商、采购或发送开关。
:::

两个 Namespace 提供 111 个 HTTP 方法：Mail 运行侧 20 个、管理侧 25 个，Phone 运行侧 26 个、管理侧 40 个。另提供凭据绑定和限时等待方法。完整参数类型和路由见 [通信方法索引](./genauth-communication-api)。

## 前置条件与初始化

在可信 Node.js 服务端使用。准备 Qoni AK/SK、同一用户池的原生 GenAuth AK/SK，以及已部署的 Mail/Phone 模块。Phone 运行侧的访问密钥还需要满足管理员配置的 persona、资源、动作和费用策略。

```ts
import { Qoni } from '@qoniai/qoni'

const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
  genauthCommunicationCredentials: {
    accessKeyId: process.env.GENAUTH_ACCESS_KEY_ID!,
    accessKeySecret: process.env.GENAUTH_ACCESS_KEY_SECRET!,
    userPoolId: process.env.GENAUTH_USER_POOL_ID!,
  },
})
```

| 入口 / 选项 | 说明 |
| --- | --- |
| `agentMail.*`、`agentPhone.*` | 运行侧。原生 GenAuth AK/SK 自动兑换标准 management bearer，并共享缓存与并发兑换 |
| `agentMail.admin.*`、`agentPhone.admin.*` | 管理侧。复用 Qoni 的管理员 token 兑换，SDK 自动添加管理确认请求头 |
| `genauthCommunicationCredentials` | 原生 `{ accessKeyId, accessKeySecret, userPoolId }`，或标准 `{ accessToken, userPoolId }` |
| `genauthHost` | 可选。私有部署地址；默认通过 Qoni 运行时发现 |
| `timeoutMs` | 单次 HTTP 请求超时，默认 `30000` 毫秒 |
| 第二参数 `{ signal }` | 取消当前请求；等待方法同时取消睡眠 |

Qoni 兑换的管理员 token 与标准访问密钥 token 具有不同身份。仅配置 Qoni AK/SK 可以调用管理侧；运行侧缺少原生凭据时会在本地报错。管理侧用 `adminToken` / `userPoolId` 同时覆盖凭据；运行侧用 `accessToken` / `userPoolId` 同时覆盖。显式 bearer 不会自动刷新。

也可以为某个 Namespace 绑定一次原生凭据，再复用这个客户端：

```ts
const mail = qoni.genauth.agentMail.withCredentials({
  accessKeyId: process.env.GENAUTH_ACCESS_KEY_ID!,
  accessKeySecret: process.env.GENAUTH_ACCESS_KEY_SECRET!,
  userPoolId: process.env.GENAUTH_USER_POOL_ID!,
})
```

绑定客户端与原客户端各自缓存凭据。构造函数中的通信凭据让 Mail 和 Phone 共用一个运行 token 缓存。原生密钥失效后的 `401` 最多刷新并重试一次；权限、版本冲突、网络错误和供应商错误不会重放写操作。

## 身份与通信资源

通信 `personaId` 标识独立拟人身份，与委托流程中的 `agentId` 无关。邮箱和号码属于 persona，创建通信资源不会修改用户登录邮箱或登录手机号。

```ts
const { data: persona } = await qoni.genauth.agentMail.admin.personas.create({
  displayName: 'Communication assistant',
  externalRef: 'business-persona-001',
})

const { data: resources } = await qoni.genauth.agentMail.resources.list({
  personaId: persona.personaId,
  limit: 20,
})
```

Mail 的 `resources.registerPhone` 只登记号码记录。Phone 的 `admin.numbers.register` 登记人工号码；人工记录不代表供应商已开通短信能力。供应商采购、短信发送和租约管理使用 Phone 方法。

## `agentMail.*`

### 创建邮箱与等待结果

```ts
const { data: mailboxRequest } = await qoni.genauth.agentMail.mailboxes.create({
  personaId: persona.personaId,
  idempotencyKey: 'mailbox-create-business-001',
})

const { data: mailboxOperation } = await qoni.genauth.agentMail.operations.wait({
  operationId: mailboxRequest.operationId,
}, { timeoutMs: 120_000 })

if (mailboxOperation.status !== 'succeeded') {
  throw new Error(`Mailbox operation: ${mailboxOperation.status}`)
}

const { data: mailbox } = await qoni.genauth.agentMail.mailboxes.get({
  personaId: persona.personaId,
  mailboxId: mailboxRequest.resourceId,
})
```

`mailboxes.create` 返回 HTTP `202` 的 `{ operationId, resourceId, status, pollAfterSeconds }`，不表示邮箱已经创建完成。省略 `providerConfigId` 时服务端仅在存在唯一可用配置时自动选择；多供应商时显式指定。`mailboxes.get` 的 `mailboxId` 与资源 ID 相同。

### 列出、读取与发送邮件

```ts
const { data: messages } = await qoni.genauth.agentMail.messages.list({
  personaId: persona.personaId,
  mailboxId: mailbox.mailboxId,
  direction: 'inbound',
  limit: 20,
})

const { data: sendRequest } = await qoni.genauth.agentMail.messages.send({
  personaId: persona.personaId,
  mailboxId: mailbox.mailboxId,
  to: 'recipient@example.com',
  subject: 'Business notification',
  text: 'Your request is complete.',
  idempotencyKey: 'mail-send-business-001',
})
```

列表返回邮件摘要。正文通过 `messages.get({ personaId, mailboxId, messageId })` 读取，并检查 `contentStatus`。`to` 是单个邮箱地址；发送接收 HTTP `202` 后继续查原操作。操作 `succeeded` 表示供应商已接受请求，最终投递结果查看 `deliveryStatus`；不要将其视为收件人已收到。

### 邮箱验证码

先创建提取任务，再触发下游平台发送验证码。任务只匹配本次时间窗口中的消息。

```ts
const { data: verification } = await qoni.genauth.agentMail.verifications.create({
  personaId: persona.personaId,
  mailboxId: mailbox.mailboxId,
  platformKey: 'demo-platform',
  externalRef: 'registration-attempt-001',
  match: { fromDomains: ['demo.example.com'], subjectContains: 'Verification code' },
  extract: { kind: 'code', pattern: 'Verification code[: ]*([0-9]{6})' },
  timeoutSeconds: 180,
  idempotencyKey: 'mail-verification-business-001',
})

// Trigger the external platform to send its code here, then wait for this task.
const { data: mailResult } = await qoni.genauth.agentMail.verifications.wait({
  personaId: persona.personaId,
  mailboxId: mailbox.mailboxId,
  verificationRequestId: verification.verificationRequestId,
}, { timeoutMs: 190_000 })
```

`templateId` 与 `match` / `extract` 互斥。`match` 至少指定 `fromAddresses` 或 `fromDomains`；受限正则要求一个捕获组。提取链接时使用 `kind: 'link'`，同时配置 `allowedLinkDomains`。`matched` 后查看 `result` 和 `resultAvailableUntil`；`ambiguous` 表示多个结果，调用方必须处理歧义。任务超时 30–600 秒，默认 180 秒。

### 外部账号与管理侧

`externalAccounts.create/list/get/update` 记录平台注册结果和资源绑定，不存储密码。更新账号或 persona 传当前 `revision`，SDK 转换为带引号的 `If-Match`。

管理侧提供供应商配置与密钥轮换、连通性测试、提取模板、persona 状态和删除任务，以及操作对账、发送结果确认、事件、审计和健康查询。模板更新使用业务字段 `version`，不使用 `revision`。删除采用异步任务；`delete_mailboxes` 模式需要确认当前全部 `mailboxIds`。Phone 资源或旧 Agent Identity 的未解决状态可能阻止删除，SDK 会保留服务端错误码。

## `agentPhone.*`

### 报价与采购号码

采购会产生供应商费用。先查询候选号码、取得报价，并使用该报价的币种与费用上限提交采购。

```ts
const { data: phoneProviders } = await qoni.genauth.agentPhone.admin.providers.list()
const phoneProvider = phoneProviders.items.find(p => p.provider === 'twilio' && p.enabled)
if (!phoneProvider) throw new Error('No enabled Twilio provider')

const { data: quote } = await qoni.genauth.agentPhone.quotes.create({
  personaId: persona.personaId,
  providerConfigId: phoneProvider.id,
  kind: 'number',
  spec: { country: 'US' },
})

const { data: acquisition } = await qoni.genauth.agentPhone.numbers.acquire({
  personaId: persona.personaId,
  quoteId: quote.id,
  maxCost: { amount: quote.amount, currency: quote.currency },
  idempotencyKey: 'phone-acquire-business-001',
})

const { data: phoneOperation } = await qoni.genauth.agentPhone.operations.wait({
  personaId: persona.personaId,
  operationId: acquisition.id,
}, { timeoutMs: 120_000 })

if (phoneOperation.status !== 'succeeded') {
  throw new Error(`Phone operation: ${phoneOperation.status}`)
}
```

报价有效期两分钟，绑定创建者与 persona。`maxCost.amount` 是最多六位小数的十进制字符串，避免浮点金额误差。供应商价格未验证、健康检查过期、费用策略不满足或采购开关关闭时由服务端拒绝；SDK 不会自动提高费用上限或重购。

### 短信与号码释放

| 方法 | 主要参数 | 结果 |
| --- | --- | --- |
| `numbers.list/get` | `personaId`；详情还需 `resourceId` | 号码、能力与租约状态 |
| `numbers.messages` | `personaId`、`resourceId` | 短信摘要；无正文 |
| `messages.content` | `personaId`、`messageId` | `{ body }`；正文可过期 |
| `numbers.send` | `personaId`、`resourceId`、`to`、`body`、`maxCost`、`idempotencyKey` | 异步操作；可能产生费用 |
| `numbers.release` | `personaId`、`resourceId`、`reason`、`revision`、`idempotencyKey` | 异步释放操作 |

先检查号码的 `capabilities` 和租约状态。`smsReceive` / `smsSend` / `thirdPartyOtp` 是字符串能力状态，`unknown` 不表示支持。释放必须使用最新版本；当前登录、找回或联系绑定可能阻止释放或归档。

### 验证码任务与一次性接码

`verifications.create` 为已有号码建立验证码任务，使用 `rules: { pattern, sender? }`，时间范围 30–900 秒。`verifications.wait` 只等待 `waiting` 状态，返回 `ready`、`ambiguous` 或其他最终状态；读取候选结果还需要 `sms.content.read`。

`activations.create` 使用 `kind: 'activation'` 的报价创建一次性接码任务。使用 `activations.get/messages/candidates` 查看状态、短信与候选验证码。`cancel` / `finish` 需要当前 `revision` 和 `idempotencyKey`；`consume` 需要稳定幂等键，存在多个结果时还需 `candidateId`。消费结果返回 `{ candidateId, value, messageId, ... }`；已消费、过期、撤销或租约变化的结果不可重新使用。

Phone 管理侧还提供供应商创建、更新、健康测试、人工号码登记与归档、资源绑定查询、权限策略和操作对账。配置更新会使旧健康结果失效，启用配置前重新执行 `providers.test`。管理侧的 `quotes.create` 也必须传 `personaId`；部分管理列表支持可选 persona 筛选。供应商账号与资源归属受服务端不可变规则约束。

Phone 管理侧的 `admin.operations.wait` 与 `admin.verifications.wait` 复用管理员凭据，可直接等待供应商健康检查等管理任务，无需运行侧原生密钥。

## 幂等、版本、分页与等待

| 参数 / 返回字段 | 行为 |
| --- | --- |
| `idempotencyKey` | 放入 `Idempotency-Key` 请求头，不进入业务 JSON。对同一业务命令保存并复用同一键；参数改变应作为新命令处理 |
| `revision` | 正整数，映射为 `If-Match: "N"`；`412` 后重新读取并由业务决定是否再修改 |
| `meta.etag` | 保留服务端带引号的 ETag；`meta.httpStatus` 保留通信接口 HTTP 状态 |
| Mail 列表 | `{ items, nextCursor }`，下一页用 `cursor`；`limit` 1–100 |
| Phone 号码列表 | `{ items, total, page, limit }`；其他列表通常是至多 100 条的 `{ items }` |
| `operations.wait` / `verifications.wait` | 默认总超时 120 秒、最短轮询间隔 1 秒；尊重 Mail 的 `pollAfterSeconds`。通过第二参数配置 `timeoutMs`、`pollIntervalMs`、`signal` |

等待方法只做 GET。到达未知、失败或需业务处理的状态时直接返回原响应；总超时抛出 `QoniTimeoutError`，不会取消服务端操作。继续查询原 `operationId`；Phone 操作对象的 ID 字段名是 `id`，Mail 是 `operationId`。

## 检查结果与错误处理

`QoniResponse<T>` 保留 `{ data, meta }`。通信错误的 `error.code` 和 `error.retryable` 透传到 `QoniError`，并保留 HTTP 状态、请求 ID 与原始响应。

| 错误 / 状态 | 处理方式 |
| --- | --- |
| `401` / `403` | 检查标准 AK/SK、用户池、管理员身份与 Phone 策略。显式 bearer 由调用方更新 |
| `PRECONDITION_FAILED` / `412` | 读取当前对象并核对修改意图；不要直接重放旧版本 |
| `RESULT_UNKNOWN`、操作 `unknown` | 查询原操作，必要时通过管理侧对账；不要换键采购或发送 |
| `RESULT_AMBIGUOUS` | 读取候选并显式选择 `candidateId` |
| `CONTENT_EXPIRED` / `RESULT_UNAVAILABLE` | 正文或结果已经不可读取；发起新的业务流程 |
| 路由 `404` | 检查 `genauthHost` 与服务端模块部署；不能通过 SDK 安装启用后端路由 |

## 下一步

参阅 [通信方法索引](./genauth-communication-api) 查找完整输入类型、结果类型和 HTTP 路由。用户、组织和权限管理见 [GenAuth 管理 SDK](./genauth-management)。
