---
title: Agent Mail 与 Agent Phone SDK
description: 使用 Qoni Node.js SDK 管理 Agent 邮箱、号码、通信任务和供应商配置。
status: draft
sdkCandidate: contracts/genauth-communication.json
lastReviewed: 2026-10-12
pageClass: qoni-sdk-communication
---

## 初始化

管理接口使用 Qoni 访问密钥；邮箱和短信业务接口还需配置同一用户池的 GenAuth 访问密钥。

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
| `agentMail.*`、`agentPhone.*` | 邮箱、短信、号码及验证码操作 |
| `agentMail.admin.*`、`agentPhone.admin.*` | 供应商、权限及通信资源管理 |
| `genauthCommunicationCredentials` | 原生 `{ accessKeyId, accessKeySecret, userPoolId }`，或标准 `{ accessToken, userPoolId }` |
| `genauthHost` | 可选。私有部署地址；默认通过 Qoni 运行时发现 |
| `timeoutMs` | 单次 HTTP 请求超时，默认 `30000` 毫秒 |
| 第二参数 `{ signal }` | 取消当前请求；等待方法同时取消睡眠 |

单次调用可通过 `accessToken` / `userPoolId` 指定业务凭据，通过 `adminToken` / `userPoolId` 指定管理凭据。也可以绑定凭据后复用客户端：

```ts
const mail = qoni.genauth.agentMail.withCredentials({
  accessKeyId: process.env.GENAUTH_ACCESS_KEY_ID!,
  accessKeySecret: process.env.GENAUTH_ACCESS_KEY_SECRET!,
  userPoolId: process.env.GENAUTH_USER_POOL_ID!,
})
```

## Agent 与资源

### 创建 Agent

方法：`admin.personas.create`

创建通信资源所属的 Agent。已有 Agent 时直接使用它的 `personaId`。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `displayName` | 是 | 显示名称 |
| `externalRef` | 否 | 业务系统中的关联标识 |
| `avatar` | 否 | 头像地址 |

返回 `data`：Agent 对象，包含 `personaId`、`displayName`、`status`、`revision`。

```ts
const { data: persona } = await qoni.genauth.agentMail.admin.personas.create({
  displayName: 'Communication assistant',
  externalRef: 'business-agent-001',
})
const personaId = persona.personaId
```

一个 Agent 可以拥有多个邮箱和手机号。Mail / Phone 调用传 `personaId`；身份委托调用传 `capabilities.identity.iamAgentId`。

### 查询资源

方法：`resources.list`

查看 Agent 名下的邮箱及登记的号码。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `cursor / limit` | 否 | 分页游标与每页数量 |

返回 `data`：`{ items, nextCursor }`。每项包含 `resourceId`、`type`、`address`、`source`、`status`。

```ts
const { data: resources } = await qoni.genauth.agentMail.resources.list({
  personaId,
  limit: 20,
})
console.log(resources.items)
```

`type` 为 `email` 或 `phone`。号码采购、短信和租约操作使用 `agentPhone`。

## Agent Mail：邮箱与邮件

### 查询邮箱供应商

方法：`providers.list`

查询可用于创建邮箱、收信或发信的供应商配置。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `capability` | 否 | 按能力筛选，例如 mailbox.create |
| `cursor / limit` | 否 | 分页游标与每页数量 |

返回 `data`：`{ items, nextCursor }`。配置包含 `configId`、`capabilities`、`allowedDomains`、`defaultDomain`、`acceptNewMailboxes`。

```ts
const { data: mailProviders } = await qoni.genauth.agentMail.providers.list({
  capability: 'mailbox.create',
  limit: 20,
})
const mailProvider = mailProviders.items.find(item => item.acceptNewMailboxes)
if (!mailProvider) throw new Error('No mailbox provider available')
```

### 创建邮箱

方法：`mailboxes.create`

为 Agent 创建一个邮箱。保存返回的操作 ID，随后等待创建完成。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `idempotencyKey` | 是 | 本次创建命令的唯一键；重试复用原键 |
| `providerConfigId` | 否 | 供应商配置 ID |
| `localPart / domain / displayName` | 否 | 邮箱前缀、域名和显示名称 |

返回 `data`：`{ operationId, resourceId, status, pollAfterSeconds }`。`resourceId` 用作后续的 `mailboxId`。

```ts
const { data: mailboxRequest } = await qoni.genauth.agentMail.mailboxes.create({
  personaId,
  providerConfigId: mailProvider.configId,
  displayName: 'Business assistant',
  idempotencyKey: 'mailbox-create-business-001',
})
const mailboxId = mailboxRequest.resourceId
```

请求接受后返回 HTTP `202`，此时邮箱可能仍在创建。省略供应商时，仅有唯一可用配置才会自动选择；指定域名需在配置的允许范围内。

### 查询与等待操作

方法：`operations.get` / `operations.wait`

查询邮箱创建或邮件发送的进度。`get` 查询一次；`wait` 轮询到最终状态或超时。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `operationId` | 是 | 创建或发送接口返回的操作 ID |
| `第二参数` | 否 | wait 可传 timeoutMs、pollIntervalMs、signal |

返回 `data`：操作对象，包含 `status`、`result`、`error`。状态为 `pending`、`running`、`succeeded`、`failed` 或 `unknown`。

```ts
const { data: mailboxProgress } = await qoni.genauth.agentMail.operations.get({
  operationId: mailboxRequest.operationId,
})
const { data: mailboxOperation } = await qoni.genauth.agentMail.operations.wait({
  operationId: mailboxRequest.operationId,
}, { timeoutMs: 120_000 })
if (mailboxOperation.status !== 'succeeded') {
  throw new Error(`Mailbox operation: ${mailboxOperation.status}`)
}
```

`unknown` 时继续查询原操作或通过管理侧对账，不要换幂等键再次创建或发送。等待超时不会取消服务端操作。

### 读取邮箱

方法：`mailboxes.get`

读取邮箱地址、状态与可用能力。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `mailboxId` | 是 | 邮箱资源 ID |

返回 `data`：邮箱对象，包含 `mailboxId`、`address`、`status`、`capabilities`、`revision`。

```ts
const { data: mailbox } = await qoni.genauth.agentMail.mailboxes.get({
  personaId,
  mailboxId,
})
if (mailbox.status === 'active') console.log(mailbox.address)
```

创建中的邮箱 `address` 可以为空；使用邮箱前确认 `status` 为 `active`。

### 查询邮件

方法：`messages.list`

按方向和时间范围查询邮件摘要。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / mailboxId` | 是 | Agent ID 与邮箱 ID |
| `direction` | 否 | inbound 收信；outbound 发信 |
| `after / before` | 否 | ISO 格式的时间边界 |
| `cursor / limit` | 否 | 分页游标；每页 1–100 条 |

返回 `data`：`{ items, nextCursor }`。摘要包含 `messageId`、`from`、`to`、`subject`、`contentStatus`、`deliveryStatus`。

```ts
const { data: mailMessages } = await qoni.genauth.agentMail.messages.list({
  personaId,
  mailboxId,
  direction: 'inbound',
  limit: 20,
})
console.log(mailMessages.items, mailMessages.nextCursor)
```

下一页把 `nextCursor` 传入 `cursor`。列表不包含正文。

### 读取邮件正文

方法：`messages.get`

根据邮件 ID 读取主题、正文和投递状态。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / mailboxId / messageId` | 是 | Agent、邮箱和邮件 ID |

返回 `data`：邮件详情，包含摘要字段与 `text`。`contentStatus` 为 `available` 时正文可读。

```ts
const { data: mailMessage } = await qoni.genauth.agentMail.messages.get({
  personaId,
  mailboxId,
  messageId: 'message-id',
})
if (mailMessage.contentStatus === 'available') console.log(mailMessage.text)
```

正文状态为 `pending` 时稍后再查；`expired` 或 `unavailable` 时正文可能为空。

### 发送邮件

方法：`messages.send`

从 Agent 邮箱发送一封文本邮件。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / mailboxId` | 是 | 发件 Agent 与邮箱 ID |
| `to / subject / text` | 是 | 单个收件地址、主题和正文 |
| `idempotencyKey` | 是 | 本次发送命令的唯一键 |
| `externalRef` | 否 | 业务关联标识 |

返回 `data`：异步操作 `{ operationId, resourceId, messageId?, status, pollAfterSeconds }`。

```ts
const { data: sendRequest } = await qoni.genauth.agentMail.messages.send({
  personaId,
  mailboxId,
  to: 'recipient@example.com',
  subject: 'Business notification',
  text: 'Your request is complete.',
  idempotencyKey: 'mail-send-business-001',
})
const { data: sendOperation } = await qoni.genauth.agentMail.operations.wait({
  operationId: sendRequest.operationId,
})
console.log(sendOperation.status, sendOperation.result?.deliveryStatus)
```

邮箱需具有发送能力。`succeeded` 表示供应商接受了请求；投递状态查看 `deliveryStatus`，例如 `delivered`、`bounced` 或 `rejected`。

## Agent Mail：验证码与外部账号

### 创建验证码任务

方法：`verifications.create`

创建邮件匹配与验证码提取任务，再触发目标平台发送验证码。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / mailboxId` | 是 | Agent 与邮箱 ID |
| `platformKey / externalRef` | 是 | 目标平台标识与本次业务流程标识 |
| `idempotencyKey` | 是 | 本次任务的唯一键 |
| `templateId` | 否 | 已配置模板 ID；与 match / extract 互斥 |
| `match / extract` | 否 | 不用模板时必填：匹配条件与提取规则 |
| `timeoutSeconds` | 否 | 30–600 秒，默认 180 秒 |

返回 `data`：任务对象，包含 `verificationRequestId`、`status`、`windowStart`、`expiresAt`、`result`。

```ts
const { data: mailVerification } = await qoni.genauth.agentMail.verifications.create({
  personaId,
  mailboxId,
  platformKey: 'demo-platform',
  externalRef: 'registration-attempt-001',
  match: { fromDomains: ['demo.example.com'], subjectContains: 'Verification code' },
  extract: { kind: 'code', pattern: 'Verification code[: ]*([0-9]{6})' },
  timeoutSeconds: 180,
  idempotencyKey: 'mail-verification-business-001',
})
```

`match` 至少指定 `fromAddresses` 或 `fromDomains`；正则需一个捕获组。提取链接时使用 `kind: 'link'` 并设置 `allowedLinkDomains`。任务只匹配本次时间窗口中的邮件。

### 读取与等待验证码

方法：`verifications.get` / `verifications.wait`

读取提取任务，或等待验证码、链接到达。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / mailboxId / verificationRequestId` | 是 | Agent、邮箱与验证码任务 ID |
| `第二参数` | 否 | wait 的 timeoutMs、pollIntervalMs、signal |

返回 `data`：任务对象。`matched` 时 `result` 包含 `kind`、`value`、`messageId`；有效期见 `resultAvailableUntil`。

```ts
// Trigger the target platform to send its verification email before waiting.
const { data: mailVerificationProgress } = await qoni.genauth.agentMail.verifications.get({
  personaId,
  mailboxId,
  verificationRequestId: mailVerification.verificationRequestId,
})
const { data: mailVerificationResult } = await qoni.genauth.agentMail.verifications.wait({
  personaId,
  mailboxId,
  verificationRequestId: mailVerification.verificationRequestId,
}, { timeoutMs: 190_000 })
if (mailVerificationResult.status === 'matched') {
  console.log(mailVerificationResult.result?.value)
}
```

`ambiguous` 表示匹配多个结果，需核对候选邮件；`expired` 表示任务超时。`resultExpired` 为 true 时不能继续使用旧结果。

### 取消邮件验证码任务

方法：`verifications.cancel`

取消不再需要的邮件提取任务。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / mailboxId / verificationRequestId` | 是 | Agent、邮箱与任务 ID |
| `idempotencyKey` | 是 | 取消命令的唯一键 |

返回 `data`：验证码任务对象与当前 `status`。

```ts
const { data: cancelledMailVerification } = await qoni.genauth.agentMail.verifications.cancel({
  personaId,
  mailboxId,
  verificationRequestId: 'mail-verification-to-cancel',
  idempotencyKey: 'mail-verification-cancel-001',
})
```

### 记录外部账号

方法：`externalAccounts.create`

记录 Agent 在外部平台注册的账号，以及邮箱或号码在注册、登录、找回中的用途。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / platformKey / externalRef` | 是 | Agent、平台与业务关联标识 |
| `registrationResult` | 是 | registered 已注册；recorded 仅记录 |
| `platformAccountId / username / profileUrl` | 否 | 至少设置其中一个账号标识 |
| `bindings` | 否 | 资源 ID、purposes 与 isCurrent |
| `idempotencyKey` | 是 | 本次记录命令的唯一键 |

返回 `data`：账号对象，包含 `accountId`、`bindings`、`recordStatus`、`revision`。

```ts
const { data: externalAccount } = await qoni.genauth.agentMail.externalAccounts.create({
  personaId,
  platformKey: 'demo-platform',
  externalRef: 'platform-account-001',
  username: 'business-assistant',
  registrationResult: 'registered',
  bindings: [{ resourceId: mailboxId, purposes: ['registration', 'login'], isCurrent: true }],
  idempotencyKey: 'external-account-create-001',
})
```

账号记录不存储密码。`purposes` 可选 `registration`、`login`、`recovery`、`contact`。

### 查询与更新外部账号

方法：`externalAccounts.list` / `get` / `update`

查询账号记录，更新资料或归档不再使用的账号。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `accountId` | 否 | get / update 必填 |
| `revision` | 否 | update 必填；使用当前版本 |
| `recordStatus / bindings / notes` | 否 | 账号状态、资源绑定与备注 |
| `cursor / limit` | 否 | list 的分页参数 |

返回 `data`：list 返回 `{ items, nextCursor }`；get / update 返回账号对象。

```ts
const { data: externalAccounts } = await qoni.genauth.agentMail.externalAccounts.list({ personaId, limit: 20 })
const { data: accountDetails } = await qoni.genauth.agentMail.externalAccounts.get({
  personaId, accountId: externalAccount.accountId,
})
const { data: updatedAccount } = await qoni.genauth.agentMail.externalAccounts.update({
  personaId,
  accountId: accountDetails.accountId,
  revision: accountDetails.revision,
  notes: 'Verified by business workflow',
})
```

## Agent Phone：号码与短信

### 查询供应商

方法：`admin.providers.list`

读取 Phone 供应商配置、启用状态与健康检查结果。

无业务参数。

返回 `data`：`{ items }`。包含 `id`、`provider`、`enabled`、`settings`、`health`、`revision`，不返回明文凭据。

```ts
const { data: phoneProviders } = await qoni.genauth.agentPhone.admin.providers.list()
const phoneProvider = phoneProviders.items.find(item => item.provider === 'twilio' && item.enabled)
if (!phoneProvider) throw new Error('No enabled Twilio provider')
```

### 查询候选号码

方法：`candidates.list`

在采购长期号码前查询指定国家的可选号码及能力。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / providerConfigId` | 是 | Agent 与供应商配置 ID |
| `country` | 是 | 国家代码，例如 US |

返回 `data`：`{ items }`，每项包含 `phone`、`country`、`numberType`、`smsReceive`、`smsSend`、`thirdPartyOtp`。

```ts
const { data: numberCandidates } = await qoni.genauth.agentPhone.candidates.list({
  personaId,
  providerConfigId: phoneProvider.id,
  country: 'US',
})
console.log(numberCandidates.items)
```

能力字段是字符串状态，`unknown` 不表示支持。

### 获取报价

方法：`quotes.create`

取得长期号码或一次性接码的供应商报价。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / providerConfigId` | 是 | Agent 与供应商配置 ID |
| `kind` | 是 | number 长期号码；activation 一次性接码 |
| `spec` | 是 | country；按报价类型传 phone 或 service |

返回 `data`：报价对象，包含 `id`、`kind`、`amount`、`currency`、`expiresAt`、`configRevision`。

```ts
const { data: numberQuote } = await qoni.genauth.agentPhone.quotes.create({
  personaId,
  providerConfigId: phoneProvider.id,
  kind: 'number',
  spec: { country: 'US' },
})
console.log(numberQuote.amount, numberQuote.currency, numberQuote.expiresAt)
```

报价有效期两分钟，绑定创建者与 Agent。过期后重新报价；金额是十进制字符串。

### 采购号码

方法：`numbers.acquire`

确认报价和费用上限后为 Agent 采购号码。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / quoteId` | 是 | Agent 与 number 报价 ID |
| `maxCost` | 是 | { amount, currency }；本次采购费用上限 |
| `idempotencyKey` | 是 | 采购命令的唯一键 |

返回 `data`：Phone 操作对象，`id` 为操作 ID；最终结果含资源关联信息。

```ts
const { data: acquisition } = await qoni.genauth.agentPhone.numbers.acquire({
  personaId,
  quoteId: numberQuote.id,
  maxCost: { amount: numberQuote.amount, currency: numberQuote.currency },
  idempotencyKey: 'phone-acquire-business-001',
})
```

采购会产生费用。币种必须与报价一致；`maxCost.amount` 使用最多六位小数的字符串。供应商、费用策略和采购开关需允许本次操作。

### 查询与等待号码操作

方法：`operations.get` / `operations.wait` / `operations.list`

查询采购、发送、释放或一次性接码操作的执行结果。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `operationId` | 否 | get / wait 必填；操作对象的 id |
| `第二参数` | 否 | wait 的 timeoutMs、pollIntervalMs、signal |

返回 `data`：get / wait 返回操作对象，包含 `status`、`stage`、`resourceId`、`taskId`、`errorCode`、`cost`；list 返回 `{ items }`。

```ts
const { data: phoneOperation } = await qoni.genauth.agentPhone.operations.wait({
  personaId,
  operationId: acquisition.id,
}, { timeoutMs: 120_000 })
if (phoneOperation.status !== 'succeeded' || !phoneOperation.resourceId) {
  throw new Error(`Phone operation: ${phoneOperation.status}`)
}
const resourceId = phoneOperation.resourceId
const { data: phoneProgress } = await qoni.genauth.agentPhone.operations.get({
  personaId, operationId: acquisition.id,
})
const { data: phoneOperations } = await qoni.genauth.agentPhone.operations.list({ personaId })
```

Phone 操作 ID 字段为 `id`，Mail 为 `operationId`。遇到 `unknown` 时查询原操作；不要换键重新采购或发送。

### 查询号码

方法：`numbers.list` / `numbers.get`

读取 Agent 名下的号码、短信能力和租约。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `resourceId` | 否 | get 必填；号码资源 ID |
| `q / state / page / limit` | 否 | list 的关键词、状态和分页参数 |

返回 `data`：list 返回 `{ items, total, page, limit }`；get 返回号码对象，包含 `phone`、`state`、`capabilities`、`lease`、`revision`。

```ts
const { data: numberPage } = await qoni.genauth.agentPhone.numbers.list({
  personaId, page: 1, limit: 20,
})
const { data: phoneNumber } = await qoni.genauth.agentPhone.numbers.get({ personaId, resourceId })
console.log(phoneNumber.phone, phoneNumber.capabilities, phoneNumber.lease)
```

短信操作前检查 `smsReceive` / `smsSend`；第三方验证码检查 `thirdPartyOtp`。号码和租约还需处于可用状态。

### 查询短信

方法：`numbers.messages`

读取号码收到或发出的短信摘要。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / resourceId` | 是 | Agent 与号码资源 ID |

返回 `data`：`{ items }`。摘要包含 `id`、`from`、`to`、`direction`、`status`、`contentAvailable`。

```ts
const { data: smsMessages } = await qoni.genauth.agentPhone.numbers.messages({ personaId, resourceId })
console.log(smsMessages.items)
```

列表没有正文。读取短信需要 `sms.read`；读取正文还需 `sms.content.read`。

### 读取短信正文

方法：`messages.content`

使用短信 ID 读取正文。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / messageId` | 是 | Agent 与短信 ID；不是号码资源 ID |

返回 `data`：`{ body }`。

```ts
const { data: smsContent } = await qoni.genauth.agentPhone.messages.content({
  personaId,
  messageId: 'sms-message-id',
})
console.log(smsContent.body)
```

正文具有保留期限。`contentAvailable` 为 false 或返回 `CONTENT_EXPIRED` 时，不能继续读取旧正文。

### 发送短信

方法：`numbers.send`

使用 Agent 号码向目标号码发送短信。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / resourceId` | 是 | Agent 与发件号码资源 ID |
| `to / body` | 是 | 目标号码与短信正文 |
| `maxCost` | 是 | 费用上限与币种 |
| `idempotencyKey` | 是 | 发送命令的唯一键 |

返回 `data`：Phone 操作对象。使用 `operations.wait` 查询执行结果。

```ts
const { data: smsSendOperation } = await qoni.genauth.agentPhone.numbers.send({
  personaId,
  resourceId,
  to: '+12025550123',
  body: 'Your request is complete.',
  maxCost: { amount: '0.050000', currency: 'USD' },
  idempotencyKey: 'sms-send-business-001',
})
const { data: smsSendResult } = await qoni.genauth.agentPhone.operations.wait({
  personaId, operationId: smsSendOperation.id,
})
console.log(smsSendResult.status)
```

发送会产生费用。根据供应商计价与业务预算设置 `maxCost`，并确认号码具备发送能力。

### 释放号码

方法：`numbers.release`

向供应商提交号码释放请求。释放前先处理外部账号中的登录、找回和联系绑定。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / resourceId` | 是 | Agent 与号码资源 ID |
| `reason` | 是 | 释放原因 |
| `revision` | 是 | numbers.get 返回的当前版本 |
| `idempotencyKey` | 是 | 释放命令的唯一键 |

返回 `data`：异步释放操作；随后使用 `operations.wait` 和 `numbers.get` 核对状态。

```ts
const { data: releaseOperation } = await qoni.genauth.agentPhone.numbers.release({
  personaId,
  resourceId,
  reason: 'Business workflow completed',
  revision: phoneNumber.revision,
  idempotencyKey: 'phone-release-business-001',
})
```

使用最新版本；冲突返回 `412` 时重新读取号码。采购与释放示例属于不同业务操作，按实际流程调用。

## Agent Phone：验证码

### 创建验证码任务

方法：`verifications.create`

为已有号码建立验证码接收任务，再触发目标平台发送短信。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / resourceId` | 是 | Agent 与已有号码资源 ID |
| `service` | 是 | 目标业务或平台标识 |
| `rules` | 是 | { pattern, sender? }，验证码提取规则 |
| `timeoutSeconds` | 否 | 任务等待期限，30–900 秒 |

返回 `data`：任务对象，包含 `id`、`status`、`expiresAt`、`candidateIds`、`revision`。

```ts
const { data: phoneVerification } = await qoni.genauth.agentPhone.verifications.create({
  personaId,
  resourceId,
  service: 'demo-platform',
  rules: { pattern: 'Code[: ]*([0-9]{6})' },
  timeoutSeconds: 180,
})
```

### 查询与等待验证码

方法：`verifications.list` / `get` / `wait`

查询任务进度或等待验证码到达。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `taskId` | 否 | get / wait 必填；创建任务返回的 id |
| `resourceId` | 否 | list 按号码筛选 |
| `第二参数` | 否 | wait 的 timeoutMs、pollIntervalMs、signal |

返回 `data`：list 返回 `{ items }`；get / wait 返回任务对象。

```ts
const { data: verificationList } = await qoni.genauth.agentPhone.verifications.list({ personaId, resourceId })
const { data: verificationProgress } = await qoni.genauth.agentPhone.verifications.get({
  personaId, taskId: phoneVerification.id,
})
// Trigger the target platform to send its SMS before waiting.
const { data: readyVerification } = await qoni.genauth.agentPhone.verifications.wait({
  personaId, taskId: phoneVerification.id,
}, { timeoutMs: 190_000 })
console.log(readyVerification.status)
```

`wait` 只轮询 `waiting` 状态。`ready` 后读取候选并消费；`ambiguous` 时需显式选择候选。

### 读取候选验证码

方法：`verifications.candidates`

获取任务匹配到的验证码及候选 ID。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId` | 是 | Agent 与验证码任务 ID |

返回 `data`：`{ items, expiresAt }`，候选包含 `candidateId` 与 `value`。

```ts
const { data: verificationCandidates } = await qoni.genauth.agentPhone.verifications.candidates({
  personaId, taskId: phoneVerification.id,
})
console.log(verificationCandidates.items, verificationCandidates.expiresAt)
```

读取候选还需要 `sms.content.read` 权限。多候选时先按业务上下文核对，不能直接取第一条。

### 消费验证码

方法：`verifications.consume`

确认使用一个验证码结果。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId` | 是 | Agent 与验证码任务 ID |
| `idempotencyKey` | 是 | 本次消费命令的唯一键 |
| `candidateId` | 否 | 多候选时必填；使用已核对的候选 ID |

返回 `data`：结果对象，包含 `candidateId`、`value` 及关联信息。

```ts
const { data: consumedVerification } = await qoni.genauth.agentPhone.verifications.consume({
  personaId,
  taskId: phoneVerification.id,
  candidateId: 'verified-candidate-id',
  idempotencyKey: 'phone-verification-consume-001',
})
console.log(consumedVerification.value)
```

已消费、过期、撤销或租约发生变化的结果不可再次用于新的业务命令。重试原命令复用原幂等键。

### 取消验证码任务

方法：`verifications.cancel`

撤销不再需要的验证码任务。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId` | 是 | Agent 与任务 ID |
| `revision` | 是 | 任务的当前版本 |
| `idempotencyKey` | 是 | 取消命令的唯一键 |

返回 `data`：`{ id, status: 'revoked' }`。

```ts
const { data: cancelTarget } = await qoni.genauth.agentPhone.verifications.get({
  personaId, taskId: 'verification-to-cancel',
})
const { data: cancelledVerification } = await qoni.genauth.agentPhone.verifications.cancel({
  personaId,
  taskId: cancelTarget.id,
  revision: cancelTarget.revision,
  idempotencyKey: 'phone-verification-cancel-001',
})
```

## Agent Phone：一次性接码

### 查询接码服务

方法：`catalog.list`

查询供应商在指定国家支持的平台、库存和报价。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / providerConfigId / country` | 是 | Agent、供应商配置与国家代码 |

返回 `data`：`{ items }`。每项包含 `service` 与 `offers`；offer 包含 `operator`、`count`、`amount`、`currency`。

```ts
const { data: activationProviders } = await qoni.genauth.agentPhone.admin.providers.list()
const activationProvider = activationProviders.items.find(item => item.provider === '5sim' && item.enabled)
if (!activationProvider) throw new Error('No enabled activation provider')
const { data: activationCatalog } = await qoni.genauth.agentPhone.catalog.list({
  personaId, providerConfigId: activationProvider.id, country: 'US',
})
console.log(activationCatalog.items)
```

### 创建接码任务

方法：`activations.create`

取得 activation 报价后采购一次性接码。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / quoteId` | 是 | Agent 与 activation 报价 ID |
| `maxCost` | 是 | 费用上限与报价币种 |
| `idempotencyKey` | 是 | 本次接码采购的唯一键 |

返回 `data`：Phone 操作对象。操作完成后用 `taskId` 读取接码任务。

```ts
const { data: activationQuote } = await qoni.genauth.agentPhone.quotes.create({
  personaId,
  providerConfigId: activationProvider.id,
  kind: 'activation',
  spec: { country: 'US', service: 'service-from-catalog' },
})
const { data: activationPurchase } = await qoni.genauth.agentPhone.activations.create({
  personaId,
  quoteId: activationQuote.id,
  maxCost: { amount: activationQuote.amount, currency: activationQuote.currency },
  idempotencyKey: 'activation-create-business-001',
})
const { data: activationOperation } = await qoni.genauth.agentPhone.operations.wait({
  personaId, operationId: activationPurchase.id,
})
if (activationOperation.status !== 'succeeded' || !activationOperation.taskId) {
  throw new Error(`Activation operation: ${activationOperation.status}`)
}
const activationTaskId = activationOperation.taskId
```

`service` 必须使用目录中的实际值。接码会产生费用；任务号码只在其有效期和指定业务范围内使用。

### 查询接码任务

方法：`activations.list` / `activations.get`

查询临时号码、任务进度、结果与费用状态。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId` | 是 | Agent ID |
| `taskId` | 否 | get 必填；接码任务 ID |

返回 `data`：list 返回 `{ items }`；get 返回任务对象，含 `phone`、`status`、`resultState`、`costState`、`expiresAt`、`revision`。

```ts
const { data: activations } = await qoni.genauth.agentPhone.activations.list({ personaId })
const { data: activation } = await qoni.genauth.agentPhone.activations.get({
  personaId, taskId: activationTaskId,
})
console.log(activation.phone, activation.status, activation.expiresAt)
```

取得可用号码后再触发外部平台发送验证码。采购操作完成不代表验证码已经收到。

### 查询接码短信

方法：`activations.messages`

查看接码任务收到的短信摘要。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId` | 是 | Agent 与接码任务 ID |

返回 `data`：`{ items }`，摘要字段与 `numbers.messages` 相同。

```ts
const { data: activationMessages } = await qoni.genauth.agentPhone.activations.messages({
  personaId, taskId: activationTaskId,
})
console.log(activationMessages.items)
```

正文用 `messages.content` 读取；列表中的 `id` 是短信 ID。

### 查询候选结果

方法：`activations.candidates`

读取接码任务的候选验证码。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId` | 是 | Agent 与接码任务 ID |

返回 `data`：`{ items, expiresAt }`，每个结果包含 `candidateId` 与 `value`。

```ts
const { data: activationCandidates } = await qoni.genauth.agentPhone.activations.candidates({
  personaId, taskId: activationTaskId,
})
console.log(activationCandidates.items)
```

未收到结果时按业务等待期限再次查询。多个候选时核对目标业务后显式选择，不要自动取第一条。

### 消费接码结果

方法：`activations.consume`

确认使用一个接码结果。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId / idempotencyKey` | 是 | Agent、任务 ID 与本次消费的唯一键 |
| `candidateId` | 否 | 多候选时必填；已核对的候选 ID |

返回 `data`：结果对象，包含 `candidateId`、`value` 及关联信息。

```ts
const { data: activationResult } = await qoni.genauth.agentPhone.activations.consume({
  personaId,
  taskId: activationTaskId,
  candidateId: 'verified-activation-candidate-id',
  idempotencyKey: 'activation-consume-business-001',
})
console.log(activationResult.value)
```

消费与结束任务是两个操作。消费结果后按实际业务决定是否调用 `finish`。

### 取消接码

方法：`activations.cancel`

向供应商提交取消接码请求。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId` | 是 | Agent 与接码任务 ID |
| `revision / idempotencyKey` | 是 | 当前任务版本与取消命令唯一键 |

返回 `data`：Phone 操作对象，随后通过 `operations.wait` 查询结果。

```ts
const { data: activationToCancel } = await qoni.genauth.agentPhone.activations.get({
  personaId, taskId: 'activation-to-cancel',
})
const { data: activationCancellation } = await qoni.genauth.agentPhone.activations.cancel({
  personaId,
  taskId: activationToCancel.id,
  revision: activationToCancel.revision,
  idempotencyKey: 'activation-cancel-business-001',
})
```

是否可以取消、如何结算由供应商和任务当前状态决定；提交取消不等于退款成功。

### 结束接码

方法：`activations.finish`

业务完成后向供应商提交结束任务请求。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / taskId` | 是 | Agent 与接码任务 ID |
| `revision / idempotencyKey` | 是 | 当前任务版本与结束命令唯一键 |

返回 `data`：Phone 操作对象；通过操作和任务状态核对最终结果。

```ts
const { data: activationToFinish } = await qoni.genauth.agentPhone.activations.get({
  personaId, taskId: activationTaskId,
})
const { data: activationFinish } = await qoni.genauth.agentPhone.activations.finish({
  personaId,
  taskId: activationToFinish.id,
  revision: activationToFinish.revision,
  idempotencyKey: 'activation-finish-business-001',
})
```

## Mail 管理配置

### 创建邮箱供应商

方法：`admin.providers.create`

配置邮箱供应商账号、命名空间、域名与收发能力。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name / providerType` | 是 | 配置名称；providerType 为 agentmail |
| `providerAccountKey / namespaceKey` | 是 | 供应商账号与命名空间标识 |
| `apiKey` | 是 | 供应商密钥，仅在服务端传入 |
| `settings` | 是 | allowedDomains、defaultDomain、capabilities 等 |
| `webhookSecret` | 否 | Webhook 验签密钥 |

返回 `data`：供应商配置对象，包含 `configId`、`revision`、服务开关与密钥配置状态。

```ts
const { data: configuredMailProvider } = await qoni.genauth.agentMail.admin.providers.create({
  name: 'Business mail',
  providerType: 'agentmail',
  providerAccountKey: 'business-mail-account',
  namespaceKey: 'business-agent-mail',
  apiKey: process.env.AGENTMAIL_API_KEY!,
  settings: {
    allowedDomains: ['mail.example.com'],
    defaultDomain: 'mail.example.com',
    capabilities: ['mailbox.create', 'mail.receive', 'mail.send'],
  },
})
```

域名与供应商账号使用实际已配置值。供应商标识与资源归属受不可变规则约束。

### 测试邮箱供应商

方法：`admin.providers.test`

验证供应商连通性及命名空间配置。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `configId` | 是 | 供应商配置 ID |

返回 `data`：`{ connected, namespaceVerified, createsMailbox: false }`。

```ts
const { data: mailProviderTest } = await qoni.genauth.agentMail.admin.providers.test({
  configId: configuredMailProvider.configId,
})
console.log(mailProviderTest.connected, mailProviderTest.namespaceVerified)
```

测试不创建业务邮箱。

### 更新供应商

方法：`admin.providers.update`

修改配置名称、能力与服务开关。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `configId / revision` | 是 | 配置 ID 与当前版本 |
| `name / settings` | 否 | 名称与供应商设置 |
| `acceptNewMailboxes / serviceEnabled` | 否 | 是否允许新建邮箱、是否启用服务 |

返回 `data`：更新后的供应商配置，包含新的 `revision`。

```ts
const { data: updatedMailProvider } = await qoni.genauth.agentMail.admin.providers.update({
  configId: configuredMailProvider.configId,
  revision: configuredMailProvider.revision,
  acceptNewMailboxes: true,
  serviceEnabled: true,
})
```

### 轮换供应商密钥

方法：`admin.providers.rotateCredentials`

替换供应商 API 密钥或 Webhook 验签密钥。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `configId / revision` | 是 | 配置 ID 与当前版本 |
| `apiKey / webhookSecret` | 否 | 需要轮换的密钥，至少提供一个 |

返回 `data`：更新后的配置对象，不返回明文密钥。

```ts
const { data: rotatedMailProvider } = await qoni.genauth.agentMail.admin.providers.rotateCredentials({
  configId: updatedMailProvider.configId,
  revision: updatedMailProvider.revision,
  apiKey: process.env.AGENTMAIL_NEW_API_KEY!,
})
```

### 创建提取模板

方法：`admin.templates.create`

保存可复用的邮件匹配和验证码提取规则。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name / platformKey` | 是 | 模板名称与平台标识 |
| `match / extract` | 是 | 匹配条件与提取规则 |
| `enabled` | 否 | 是否启用模板 |

返回 `data`：模板对象，包含 `id`、`matchRule`、`extractRule`、`enabled`、`version`。

```ts
const { data: mailTemplate } = await qoni.genauth.agentMail.admin.templates.create({
  name: 'Demo platform code',
  platformKey: 'demo-platform',
  match: { fromDomains: ['demo.example.com'] },
  extract: { kind: 'code', pattern: 'Code[: ]*([0-9]{6})' },
  enabled: true,
})
```

创建验证码任务时传 `templateId: mailTemplate.id`，省略 `match` / `extract`。

### 测试与更新提取模板

方法：`admin.templates.test` / `update`

用样例邮件验证规则，再更新已保存模板。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `match / extract / sender / subject / text` | 否 | test 必填：规则与样例邮件 |
| `templateId / version` | 否 | update 必填：模板 ID 与当前业务版本 |
| `name / platformKey / match / extract` | 否 | update 必填：更新后的模板配置 |

返回 `data`：test 返回 `{ status, values }`，状态为 `matched`、`ambiguous` 或 `unmatched`；update 返回模板对象。

```ts
const { data: templateTest } = await qoni.genauth.agentMail.admin.templates.test({
  match: mailTemplate.matchRule,
  extract: mailTemplate.extractRule,
  sender: 'no-reply@demo.example.com',
  subject: 'Verification code',
  text: 'Code: 123456',
})
const { data: updatedTemplate } = await qoni.genauth.agentMail.admin.templates.update({
  templateId: mailTemplate.id,
  version: mailTemplate.version,
  name: mailTemplate.name,
  platformKey: mailTemplate.platformKey,
  match: mailTemplate.matchRule,
  extract: mailTemplate.extractRule,
  enabled: true,
})
```

模板使用业务字段 `version`，不是资源的 `revision`。

### 对账未知操作

方法：`admin.operations.reconcile`

请求服务端核对供应商结果未知的创建或发送操作。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `operationId` | 是 | 原操作 ID |

返回 `data`：`{ operationId, status, reconcileScheduled: true }`。之后查询原操作。

```ts
const { data: mailReconciliation } = await qoni.genauth.agentMail.admin.operations.reconcile({
  operationId: 'unknown-mail-operation-id',
})
```

发送结果需要人工确认时，`admin.operations.resolveSend` 接收 `outcome`、`evidenceRef` 与可选 `providerMessageId`，只根据已核实的供应商证据确认。

## Phone 管理配置

### 创建号码供应商

方法：`admin.providers.create`

配置 Twilio 长期号码或 5sim 一次性接码供应商。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name / provider / credentials` | 是 | 名称、twilio 或 5sim、对应供应商凭据 |
| `settings` | 是 | 国家、服务、币种、预算、已验证的计价与操作路由 |

返回 `data`：配置对象，包含 `id`、`enabled`、`revision`、`credentialsConfigured`、`health`。

```ts
const { data: configuredPhoneProvider } = await qoni.genauth.agentPhone.admin.providers.create({
  name: 'Business Twilio',
  provider: 'twilio',
  credentials: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
  },
  settings: {
    countries: ['US'],
    services: [],
    currency: 'USD',
    dailyLimit: '10.000000',
    pricingVerified: false,
    verifiedRoutes: [],
  },
})
```

Twilio 凭据使用 `accountSid` / `authToken`；5sim 使用 `{ token }`。按供应商实际计价填写预算和费用上限，完成价格核验后再设置 `pricingVerified` 与 `verifiedRoutes`。

### 测试供应商

方法：`admin.providers.test` / `admin.operations.wait`

创建供应商健康检查任务，使用管理员凭据等待结果。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `configId / revision` | 是 | 配置 ID 与当前版本 |
| `idempotencyKey` | 是 | 健康检查命令的唯一键 |

返回 `data`：Phone 操作对象。等待后重新查询配置中的 `health`。

```ts
const { data: providerHealthOperation } = await qoni.genauth.agentPhone.admin.providers.test({
  configId: configuredPhoneProvider.id,
  revision: configuredPhoneProvider.revision,
  idempotencyKey: 'phone-provider-test-001',
})
const { data: providerHealthResult } = await qoni.genauth.agentPhone.admin.operations.wait({
  operationId: providerHealthOperation.id,
}, { timeoutMs: 120_000 })
const { data: testedPhoneProviders } = await qoni.genauth.agentPhone.admin.providers.list()
const testedPhoneProvider = testedPhoneProviders.items.find(item => item.id === configuredPhoneProvider.id)
if (!testedPhoneProvider) throw new Error('Provider configuration not found')
console.log(providerHealthResult.status, testedPhoneProvider.health)
```

健康检查与 Mail 测试不同，返回异步操作。健康结果有有效期；配置修改后旧结果失效，需重新测试。

### 更新号码供应商

方法：`admin.providers.update`

修改配置、轮换凭据或启停供应商。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `configId / revision` | 是 | 配置 ID 与当前版本 |
| `name / settings / credentials / enabled` | 否 | 需要修改的配置字段 |

返回 `data`：更新后的供应商对象与 `revision`。

```ts
const { data: updatedPhoneProvider } = await qoni.genauth.agentPhone.admin.providers.update({
  configId: testedPhoneProvider.id,
  revision: testedPhoneProvider.revision,
  name: 'Business Twilio primary',
})
```

配置变更后重新执行健康检查，再按业务需求启用。仅启用配置不会自动开放采购和发送。

### 配置访问策略

方法：`admin.policies.create` / `list` / `update`

限制管理账号或访问密钥可操作的 Agent、资源、动作与费用。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `actorId / actorType` | 是 | 主体 ID；admin 或 key |
| `personaIds / resourceIds / actions / enabled` | 是 | Agent 范围、资源范围、动作与启用状态 |
| `limits / expiresAt` | 否 | 费用限制与毫秒时间戳截止时间 |
| `policyId / revision` | 否 | update 必填；策略 ID 与当前版本 |

返回 `data`：create / update 返回策略对象与 `revision`；list 返回 `{ items }`。

```ts
const { data: phonePolicy } = await qoni.genauth.agentPhone.admin.policies.create({
  actorId: process.env.GENAUTH_ACCESS_KEY_ID!,
  actorType: 'key',
  personaIds: [personaId],
  resourceIds: [resourceId],
  actions: ['phone.read', 'sms.read', 'sms.content.read', 'verification.read', 'verification.create', 'verification.consume'],
  enabled: true,
})
const { data: phonePolicies } = await qoni.genauth.agentPhone.admin.policies.list()
const { data: updatedPhonePolicy } = await qoni.genauth.agentPhone.admin.policies.update({
  policyId: phonePolicy.id,
  revision: phonePolicy.revision,
  actorId: phonePolicy.actorId,
  actorType: phonePolicy.actorType,
  personaIds: phonePolicy.personaIds,
  resourceIds: phonePolicy.resourceIds,
  actions: phonePolicy.actions,
  enabled: false,
})
```

按实际资源与动作授权。读取验证码值需要 `sms.content.read`；采购、释放、发送、消费各有独立权限。create 与停用示例按业务需要分别调用。

### 登记与归档人工号码

方法：`admin.numbers.register` / `archive`

记录已有的人工号码，或归档不再使用的号码记录。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `personaId / phone` | 否 | register 必填；Agent ID 与号码 |
| `label` | 否 | 号码备注名称 |
| `resourceId / revision / reason` | 否 | archive 必填；资源 ID、当前版本与原因 |

返回 `data`：register 返回号码对象；archive 返回 `{ id, revision }`。

```ts
const { data: manualNumber } = await qoni.genauth.agentPhone.admin.numbers.register({
  personaId,
  phone: '+12025550124',
  label: 'Existing business contact',
})
const { data: archivedNumber } = await qoni.genauth.agentPhone.admin.numbers.archive({
  resourceId: manualNumber.id,
  revision: manualNumber.revision,
  reason: 'No longer used',
})
```

登记不代表供应商已开通短信能力；归档是记录操作，供应商号码释放使用 `numbers.release`。存在当前账号绑定时先处理绑定。

### 查询号码绑定

方法：`admin.numbers.bindings`

释放或归档前查询号码与外部账号的关联。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `resourceId` | 是 | 号码资源 ID |

返回 `data`：`{ items }`，每项包含 `accountId`、`platformKey`、`username`、`purposes`、`isCurrent`。

```ts
const { data: phoneBindings } = await qoni.genauth.agentPhone.admin.numbers.bindings({ resourceId })
console.log(phoneBindings.items)
```

### 核对未知操作

方法：`admin.operations.reconcile`

对供应商结果未知的号码、短信或接码操作提交核对。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `operationId` | 是 | 原操作 ID |
| `providerObjectId / evidenceRef` | 否 | 经核实的供应商对象 ID 与证据引用 |

返回 `data`：Phone 操作对象。随后查询同一个操作，不创建替代采购或发送。

```ts
const { data: phoneReconciliation } = await qoni.genauth.agentPhone.admin.operations.reconcile({
  operationId: 'unknown-phone-operation-id',
  evidenceRef: 'provider-support-ticket-id',
})
```

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

## 错误处理

`QoniResponse<T>` 保留 `{ data, meta }`。通信错误的 `error.code` 和 `error.retryable` 透传到 `QoniError`，并保留 HTTP 状态、请求 ID 与原始响应。

| 错误 / 状态 | 处理方式 |
| --- | --- |
| `401` / `403` | 检查标准 AK/SK、用户池、管理员身份与 Phone 策略。显式 bearer 由调用方更新 |
| `PRECONDITION_FAILED` / `412` | 读取当前对象并核对修改意图；不要直接重放旧版本 |
| `RESULT_UNKNOWN`、操作 `unknown` | 查询原操作，必要时通过管理侧对账；不要换键采购或发送 |
| `RESULT_AMBIGUOUS` | 读取候选并显式选择 `candidateId` |
| `CONTENT_EXPIRED` / `RESULT_UNAVAILABLE` | 正文或结果已经不可读取；发起新的业务流程 |
| 路由 `404` | 检查 `genauthHost` 与请求地址 |

## 方法参考

用户、组织和权限管理见 [GenAuth 管理 SDK](./genauth-management)。
