---
title: 通信 SDK 方法索引
description: Agent Mail 与 Agent Phone 的输入、结果类型和 HTTP 路由。
status: draft
sdkCandidate: contracts/genauth-communication.json
lastReviewed: 2026-10-10
---

# 通信 SDK 方法索引

本页列出邮箱、号码、验证码任务、供应商及管理配置的 SDK 方法、类型和 HTTP 路由。

::: warning 待发布接口
npm 发布版 `@qoniai/qoni@0.9.0` 尚未包含这些本地 SDK 扩展。使用包含扩展的构建，并部署对应服务端模块。
:::

所有方法接收一个具名输入对象，第二参数可选 `{ signal }`，返回 `Promise<QoniResponse<Result>>`。下列 Input / Result 类型均由 `@qoniai/qoni` 导出。凭据、流程和错误处理见 [通信 SDK 指南](./genauth-communication)。

## Mail 运行侧

方法数: 20. 使用原生 GenAuth 凭据，或成对传入 `accessToken` / `userPoolId`。

| 方法 | 必填输入 | Input / Result 类型 | HTTP 路由 |
| --- | --- | --- | --- |
| `qoni.genauth.agentMail.personas.create` | `displayName`, `idempotencyKey` | `GenAuthAgentMailPersonasCreateInput` / `GenAuthAgentMailPersonasCreateResult` | `POST /api/v3/agent-personas` |
| `qoni.genauth.agentMail.personas.list` | — | `GenAuthAgentMailPersonasListInput` / `GenAuthAgentMailPersonasListResult` | `GET /api/v3/agent-personas` |
| `qoni.genauth.agentMail.personas.get` | `personaId` | `GenAuthAgentMailPersonasGetInput` / `GenAuthAgentMailPersonasGetResult` | `GET /api/v3/agent-personas/{personaId}` |
| `qoni.genauth.agentMail.personas.update` | `personaId`, `revision` | `GenAuthAgentMailPersonasUpdateInput` / `GenAuthAgentMailPersonasUpdateResult` | `PATCH /api/v3/agent-personas/{personaId}` |
| `qoni.genauth.agentMail.providers.list` | — | `GenAuthAgentMailProvidersListInput` / `GenAuthAgentMailProvidersListResult` | `GET /api/v3/agent-personas/provider-configs` |
| `qoni.genauth.agentMail.resources.list` | `personaId` | `GenAuthAgentMailResourcesListInput` / `GenAuthAgentMailResourcesListResult` | `GET /api/v3/agent-personas/{personaId}/resources` |
| `qoni.genauth.agentMail.resources.registerPhone` | `personaId`, `phone`, `idempotencyKey` | `GenAuthAgentMailResourcesRegisterPhoneInput` / `GenAuthAgentMailResourcesRegisterPhoneResult` | `POST /api/v3/agent-personas/{personaId}/phone-resources` |
| `qoni.genauth.agentMail.mailboxes.create` | `personaId`, `idempotencyKey` | `GenAuthAgentMailMailboxesCreateInput` / `GenAuthAgentMailMailboxesCreateResult` | `POST /api/v3/agent-personas/{personaId}/mailboxes` |
| `qoni.genauth.agentMail.mailboxes.get` | `personaId`, `mailboxId` | `GenAuthAgentMailMailboxesGetInput` / `GenAuthAgentMailMailboxesGetResult` | `GET /api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}` |
| `qoni.genauth.agentMail.operations.get` | `operationId` | `GenAuthAgentMailOperationsGetInput` / `GenAuthAgentMailOperationsGetResult` | `GET /api/v3/agent-personas/operations/{operationId}` |
| `qoni.genauth.agentMail.messages.list` | `personaId`, `mailboxId` | `GenAuthAgentMailMessagesListInput` / `GenAuthAgentMailMessagesListResult` | `GET /api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/messages` |
| `qoni.genauth.agentMail.messages.send` | `personaId`, `mailboxId`, `to`, `subject`, `text`, `idempotencyKey` | `GenAuthAgentMailMessagesSendInput` / `GenAuthAgentMailMessagesSendResult` | `POST /api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/messages` |
| `qoni.genauth.agentMail.messages.get` | `personaId`, `mailboxId`, `messageId` | `GenAuthAgentMailMessagesGetInput` / `GenAuthAgentMailMessagesGetResult` | `GET /api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/messages/{messageId}` |
| `qoni.genauth.agentMail.verifications.create` | `personaId`, `mailboxId`, `platformKey`, `externalRef`, `idempotencyKey` | `GenAuthAgentMailVerificationsCreateInput` / `GenAuthAgentMailVerificationsCreateResult` | `POST /api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/verification-requests` |
| `qoni.genauth.agentMail.verifications.get` | `personaId`, `mailboxId`, `verificationRequestId` | `GenAuthAgentMailVerificationsGetInput` / `GenAuthAgentMailVerificationsGetResult` | `GET /api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/verification-requests/{verificationRequestId}` |
| `qoni.genauth.agentMail.verifications.cancel` | `personaId`, `mailboxId`, `verificationRequestId`, `idempotencyKey` | `GenAuthAgentMailVerificationsCancelInput` / `GenAuthAgentMailVerificationsCancelResult` | `POST /api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/verification-requests/{verificationRequestId}/cancel` |
| `qoni.genauth.agentMail.externalAccounts.create` | `personaId`, `platformKey`, `externalRef`, `registrationResult`, `idempotencyKey` | `GenAuthAgentMailExternalAccountsCreateInput` / `GenAuthAgentMailExternalAccountsCreateResult` | `POST /api/v3/agent-personas/{personaId}/external-accounts` |
| `qoni.genauth.agentMail.externalAccounts.list` | `personaId` | `GenAuthAgentMailExternalAccountsListInput` / `GenAuthAgentMailExternalAccountsListResult` | `GET /api/v3/agent-personas/{personaId}/external-accounts` |
| `qoni.genauth.agentMail.externalAccounts.get` | `personaId`, `accountId` | `GenAuthAgentMailExternalAccountsGetInput` / `GenAuthAgentMailExternalAccountsGetResult` | `GET /api/v3/agent-personas/{personaId}/external-accounts/{accountId}` |
| `qoni.genauth.agentMail.externalAccounts.update` | `personaId`, `accountId`, `revision` | `GenAuthAgentMailExternalAccountsUpdateInput` / `GenAuthAgentMailExternalAccountsUpdateResult` | `PATCH /api/v3/agent-personas/{personaId}/external-accounts/{accountId}` |

## Mail 管理侧

方法数: 25. 使用 Qoni 管理员凭据，或成对传入 `adminToken` / `userPoolId`。

| 方法 | 必填输入 | Input / Result 类型 | HTTP 路由 |
| --- | --- | --- | --- |
| `qoni.genauth.agentMail.admin.providers.list` | — | `GenAuthAgentMailAdminProvidersListInput` / `GenAuthAgentMailAdminProvidersListResult` | `GET /api/v3/agent-mail/admin/provider-configs` |
| `qoni.genauth.agentMail.admin.templates.list` | — | `GenAuthAgentMailAdminTemplatesListInput` / `GenAuthAgentMailAdminTemplatesListResult` | `GET /api/v3/agent-mail/admin/templates` |
| `qoni.genauth.agentMail.admin.personas.list` | — | `GenAuthAgentMailAdminPersonasListInput` / `GenAuthAgentMailAdminPersonasListResult` | `GET /api/v3/agent-mail/admin/personas` |
| `qoni.genauth.agentMail.admin.retainedPersonas.list` | — | `GenAuthAgentMailAdminRetainedPersonasListInput` / `GenAuthAgentMailAdminRetainedPersonasListResult` | `GET /api/v3/agent-mail/admin/retained-personas` |
| `qoni.genauth.agentMail.admin.deletionJobs.list` | — | `GenAuthAgentMailAdminDeletionJobsListInput` / `GenAuthAgentMailAdminDeletionJobsListResult` | `GET /api/v3/agent-mail/admin/deletion-jobs` |
| `qoni.genauth.agentMail.admin.operations.list` | — | `GenAuthAgentMailAdminOperationsListInput` / `GenAuthAgentMailAdminOperationsListResult` | `GET /api/v3/agent-mail/admin/operations` |
| `qoni.genauth.agentMail.admin.events.list` | — | `GenAuthAgentMailAdminEventsListInput` / `GenAuthAgentMailAdminEventsListResult` | `GET /api/v3/agent-mail/admin/events` |
| `qoni.genauth.agentMail.admin.audit.list` | — | `GenAuthAgentMailAdminAuditListInput` / `GenAuthAgentMailAdminAuditListResult` | `GET /api/v3/agent-mail/admin/audit` |
| `qoni.genauth.agentMail.admin.providers.create` | `name`, `providerType`, `providerAccountKey`, `namespaceKey`, `settings`, `apiKey` | `GenAuthAgentMailAdminProvidersCreateInput` / `GenAuthAgentMailAdminProvidersCreateResult` | `POST /api/v3/agent-mail/admin/provider-configs` |
| `qoni.genauth.agentMail.admin.providers.update` | `configId`, `revision` | `GenAuthAgentMailAdminProvidersUpdateInput` / `GenAuthAgentMailAdminProvidersUpdateResult` | `PATCH /api/v3/agent-mail/admin/provider-configs/{configId}` |
| `qoni.genauth.agentMail.admin.providers.rotateCredentials` | `configId`, `revision` | `GenAuthAgentMailAdminProvidersRotateCredentialsInput` / `GenAuthAgentMailAdminProvidersRotateCredentialsResult` | `POST /api/v3/agent-mail/admin/provider-configs/{configId}/credentials` |
| `qoni.genauth.agentMail.admin.providers.test` | `configId` | `GenAuthAgentMailAdminProvidersTestInput` / `GenAuthAgentMailAdminProvidersTestResult` | `POST /api/v3/agent-mail/admin/provider-configs/{configId}/test` |
| `qoni.genauth.agentMail.admin.templates.create` | `name`, `platformKey`, `match`, `extract` | `GenAuthAgentMailAdminTemplatesCreateInput` / `GenAuthAgentMailAdminTemplatesCreateResult` | `POST /api/v3/agent-mail/admin/templates` |
| `qoni.genauth.agentMail.admin.templates.update` | `name`, `platformKey`, `match`, `extract`, `version`, `templateId` | `GenAuthAgentMailAdminTemplatesUpdateInput` / `GenAuthAgentMailAdminTemplatesUpdateResult` | `PATCH /api/v3/agent-mail/admin/templates/{templateId}` |
| `qoni.genauth.agentMail.admin.templates.test` | `match`, `extract`, `sender`, `subject`, `text` | `GenAuthAgentMailAdminTemplatesTestInput` / `GenAuthAgentMailAdminTemplatesTestResult` | `POST /api/v3/agent-mail/admin/templates/test` |
| `qoni.genauth.agentMail.admin.personas.create` | `displayName` | `GenAuthAgentMailAdminPersonasCreateInput` / `GenAuthAgentMailAdminPersonasCreateResult` | `POST /api/v3/agent-mail/admin/personas` |
| `qoni.genauth.agentMail.admin.personas.get` | `personaId` | `GenAuthAgentMailAdminPersonasGetInput` / `GenAuthAgentMailAdminPersonasGetResult` | `GET /api/v3/agent-mail/admin/personas/{personaId}` |
| `qoni.genauth.agentMail.admin.personas.registerPhone` | `phone`, `personaId` | `GenAuthAgentMailAdminPersonasRegisterPhoneInput` / `GenAuthAgentMailAdminPersonasRegisterPhoneResult` | `POST /api/v3/agent-mail/admin/personas/{personaId}/phone-resources` |
| `qoni.genauth.agentMail.admin.personas.createExternalAccount` | `platformKey`, `externalRef`, `registrationResult`, `personaId` | `GenAuthAgentMailAdminPersonasCreateExternalAccountInput` / `GenAuthAgentMailAdminPersonasCreateExternalAccountResult` | `POST /api/v3/agent-mail/admin/personas/{personaId}/external-accounts` |
| `qoni.genauth.agentMail.admin.personas.setStatus` | `personaId`, `status`, `reason`, `revision` | `GenAuthAgentMailAdminPersonasSetStatusInput` / `GenAuthAgentMailAdminPersonasSetStatusResult` | `POST /api/v3/agent-mail/admin/personas/{personaId}/status` |
| `qoni.genauth.agentMail.admin.personas.delete` | `personaId`, `reason`, `revision` | `GenAuthAgentMailAdminPersonasDeleteInput` / `GenAuthAgentMailAdminPersonasDeleteResult` | `POST /api/v3/agent-mail/admin/personas/{personaId}/deletion-jobs` |
| `qoni.genauth.agentMail.admin.administrators.setPermissions` | `administratorId`, `actions` | `GenAuthAgentMailAdminAdministratorsSetPermissionsInput` / `GenAuthAgentMailAdminAdministratorsSetPermissionsResult` | `POST /api/v3/agent-mail/admin/administrators/{administratorId}/permissions` |
| `qoni.genauth.agentMail.admin.operations.reconcile` | `operationId` | `GenAuthAgentMailAdminOperationsReconcileInput` / `GenAuthAgentMailAdminOperationsReconcileResult` | `POST /api/v3/agent-mail/admin/operations/{operationId}/reconcile` |
| `qoni.genauth.agentMail.admin.operations.resolveSend` | `operationId`, `outcome`, `evidenceRef` | `GenAuthAgentMailAdminOperationsResolveSendInput` / `GenAuthAgentMailAdminOperationsResolveSendResult` | `POST /api/v3/agent-mail/admin/operations/{operationId}/resolve-send` |
| `qoni.genauth.agentMail.admin.health.get` | — | `GenAuthAgentMailAdminHealthGetInput` / `GenAuthAgentMailAdminHealthGetResult` | `GET /api/v3/agent-mail/admin/health` |

## Phone 运行侧

方法数: 26. 使用原生 GenAuth 凭据，或成对传入 `accessToken` / `userPoolId`。

| 方法 | 必填输入 | Input / Result 类型 | HTTP 路由 |
| --- | --- | --- | --- |
| `qoni.genauth.agentPhone.numbers.list` | `personaId` | `GenAuthAgentPhoneNumbersListInput` / `GenAuthAgentPhoneNumbersListResult` | `GET /api/v3/agent-phone/personas/{personaId}/numbers` |
| `qoni.genauth.agentPhone.numbers.get` | `resourceId`, `personaId` | `GenAuthAgentPhoneNumbersGetInput` / `GenAuthAgentPhoneNumbersGetResult` | `GET /api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}` |
| `qoni.genauth.agentPhone.numbers.messages` | `resourceId`, `personaId` | `GenAuthAgentPhoneNumbersMessagesInput` / `GenAuthAgentPhoneNumbersMessagesResult` | `GET /api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}/messages` |
| `qoni.genauth.agentPhone.numbers.send` | `resourceId`, `to`, `body`, `maxCost`, `personaId`, `idempotencyKey` | `GenAuthAgentPhoneNumbersSendInput` / `GenAuthAgentPhoneNumbersSendResult` | `POST /api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}/sends` |
| `qoni.genauth.agentPhone.numbers.release` | `resourceId`, `reason`, `personaId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneNumbersReleaseInput` / `GenAuthAgentPhoneNumbersReleaseResult` | `POST /api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}/releases` |
| `qoni.genauth.agentPhone.candidates.list` | `providerConfigId`, `country`, `personaId` | `GenAuthAgentPhoneCandidatesListInput` / `GenAuthAgentPhoneCandidatesListResult` | `GET /api/v3/agent-phone/personas/{personaId}/candidates` |
| `qoni.genauth.agentPhone.catalog.list` | `providerConfigId`, `country`, `personaId` | `GenAuthAgentPhoneCatalogListInput` / `GenAuthAgentPhoneCatalogListResult` | `GET /api/v3/agent-phone/personas/{personaId}/catalog` |
| `qoni.genauth.agentPhone.quotes.create` | `kind`, `providerConfigId`, `spec`, `personaId` | `GenAuthAgentPhoneQuotesCreateInput` / `GenAuthAgentPhoneQuotesCreateResult` | `POST /api/v3/agent-phone/personas/{personaId}/quotes` |
| `qoni.genauth.agentPhone.numbers.acquire` | `quoteId`, `maxCost`, `personaId`, `idempotencyKey` | `GenAuthAgentPhoneNumbersAcquireInput` / `GenAuthAgentPhoneNumbersAcquireResult` | `POST /api/v3/agent-phone/personas/{personaId}/number-acquisitions` |
| `qoni.genauth.agentPhone.activations.create` | `quoteId`, `maxCost`, `personaId`, `idempotencyKey` | `GenAuthAgentPhoneActivationsCreateInput` / `GenAuthAgentPhoneActivationsCreateResult` | `POST /api/v3/agent-phone/personas/{personaId}/activations` |
| `qoni.genauth.agentPhone.activations.list` | `personaId` | `GenAuthAgentPhoneActivationsListInput` / `GenAuthAgentPhoneActivationsListResult` | `GET /api/v3/agent-phone/personas/{personaId}/activations` |
| `qoni.genauth.agentPhone.activations.get` | `taskId`, `personaId` | `GenAuthAgentPhoneActivationsGetInput` / `GenAuthAgentPhoneActivationsGetResult` | `GET /api/v3/agent-phone/personas/{personaId}/activations/{taskId}` |
| `qoni.genauth.agentPhone.activations.messages` | `taskId`, `personaId` | `GenAuthAgentPhoneActivationsMessagesInput` / `GenAuthAgentPhoneActivationsMessagesResult` | `GET /api/v3/agent-phone/personas/{personaId}/activations/{taskId}/messages` |
| `qoni.genauth.agentPhone.messages.content` | `messageId`, `personaId` | `GenAuthAgentPhoneMessagesContentInput` / `GenAuthAgentPhoneMessagesContentResult` | `GET /api/v3/agent-phone/personas/{personaId}/messages/{messageId}/content` |
| `qoni.genauth.agentPhone.verifications.create` | `resourceId`, `service`, `rules`, `personaId` | `GenAuthAgentPhoneVerificationsCreateInput` / `GenAuthAgentPhoneVerificationsCreateResult` | `POST /api/v3/agent-phone/personas/{personaId}/verifications` |
| `qoni.genauth.agentPhone.verifications.list` | `personaId` | `GenAuthAgentPhoneVerificationsListInput` / `GenAuthAgentPhoneVerificationsListResult` | `GET /api/v3/agent-phone/personas/{personaId}/verifications` |
| `qoni.genauth.agentPhone.verifications.get` | `taskId`, `personaId` | `GenAuthAgentPhoneVerificationsGetInput` / `GenAuthAgentPhoneVerificationsGetResult` | `GET /api/v3/agent-phone/personas/{personaId}/verifications/{taskId}` |
| `qoni.genauth.agentPhone.operations.list` | `personaId` | `GenAuthAgentPhoneOperationsListInput` / `GenAuthAgentPhoneOperationsListResult` | `GET /api/v3/agent-phone/personas/{personaId}/operations` |
| `qoni.genauth.agentPhone.operations.get` | `operationId`, `personaId` | `GenAuthAgentPhoneOperationsGetInput` / `GenAuthAgentPhoneOperationsGetResult` | `GET /api/v3/agent-phone/personas/{personaId}/operations/{operationId}` |
| `qoni.genauth.agentPhone.verifications.candidates` | `taskId`, `personaId` | `GenAuthAgentPhoneVerificationsCandidatesInput` / `GenAuthAgentPhoneVerificationsCandidatesResult` | `GET /api/v3/agent-phone/personas/{personaId}/verifications/{taskId}/candidates` |
| `qoni.genauth.agentPhone.verifications.cancel` | `taskId`, `personaId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneVerificationsCancelInput` / `GenAuthAgentPhoneVerificationsCancelResult` | `POST /api/v3/agent-phone/personas/{personaId}/verifications/{taskId}/cancel` |
| `qoni.genauth.agentPhone.verifications.consume` | `taskId`, `personaId`, `idempotencyKey` | `GenAuthAgentPhoneVerificationsConsumeInput` / `GenAuthAgentPhoneVerificationsConsumeResult` | `POST /api/v3/agent-phone/personas/{personaId}/verifications/{taskId}/consume` |
| `qoni.genauth.agentPhone.activations.candidates` | `taskId`, `personaId` | `GenAuthAgentPhoneActivationsCandidatesInput` / `GenAuthAgentPhoneActivationsCandidatesResult` | `GET /api/v3/agent-phone/personas/{personaId}/activations/{taskId}/candidates` |
| `qoni.genauth.agentPhone.activations.cancel` | `taskId`, `personaId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneActivationsCancelInput` / `GenAuthAgentPhoneActivationsCancelResult` | `POST /api/v3/agent-phone/personas/{personaId}/activations/{taskId}/cancel` |
| `qoni.genauth.agentPhone.activations.finish` | `taskId`, `personaId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneActivationsFinishInput` / `GenAuthAgentPhoneActivationsFinishResult` | `POST /api/v3/agent-phone/personas/{personaId}/activations/{taskId}/finish` |
| `qoni.genauth.agentPhone.activations.consume` | `taskId`, `personaId`, `idempotencyKey` | `GenAuthAgentPhoneActivationsConsumeInput` / `GenAuthAgentPhoneActivationsConsumeResult` | `POST /api/v3/agent-phone/personas/{personaId}/activations/{taskId}/consume` |

## Phone 管理侧

方法数: 40. 使用 Qoni 管理员凭据，或成对传入 `adminToken` / `userPoolId`。

| 方法 | 必填输入 | Input / Result 类型 | HTTP 路由 |
| --- | --- | --- | --- |
| `qoni.genauth.agentPhone.admin.numbers.list` | — | `GenAuthAgentPhoneAdminNumbersListInput` / `GenAuthAgentPhoneAdminNumbersListResult` | `GET /api/v3/agent-phone/admin/numbers` |
| `qoni.genauth.agentPhone.admin.numbers.get` | `resourceId` | `GenAuthAgentPhoneAdminNumbersGetInput` / `GenAuthAgentPhoneAdminNumbersGetResult` | `GET /api/v3/agent-phone/admin/numbers/{resourceId}` |
| `qoni.genauth.agentPhone.admin.numbers.messages` | `resourceId` | `GenAuthAgentPhoneAdminNumbersMessagesInput` / `GenAuthAgentPhoneAdminNumbersMessagesResult` | `GET /api/v3/agent-phone/admin/numbers/{resourceId}/messages` |
| `qoni.genauth.agentPhone.admin.numbers.send` | `resourceId`, `to`, `body`, `maxCost`, `idempotencyKey` | `GenAuthAgentPhoneAdminNumbersSendInput` / `GenAuthAgentPhoneAdminNumbersSendResult` | `POST /api/v3/agent-phone/admin/numbers/{resourceId}/sends` |
| `qoni.genauth.agentPhone.admin.numbers.release` | `resourceId`, `reason`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneAdminNumbersReleaseInput` / `GenAuthAgentPhoneAdminNumbersReleaseResult` | `POST /api/v3/agent-phone/admin/numbers/{resourceId}/releases` |
| `qoni.genauth.agentPhone.admin.candidates.list` | `providerConfigId`, `country` | `GenAuthAgentPhoneAdminCandidatesListInput` / `GenAuthAgentPhoneAdminCandidatesListResult` | `GET /api/v3/agent-phone/admin/candidates` |
| `qoni.genauth.agentPhone.admin.catalog.list` | `providerConfigId`, `country` | `GenAuthAgentPhoneAdminCatalogListInput` / `GenAuthAgentPhoneAdminCatalogListResult` | `GET /api/v3/agent-phone/admin/catalog` |
| `qoni.genauth.agentPhone.admin.quotes.create` | `kind`, `providerConfigId`, `spec`, `personaId` | `GenAuthAgentPhoneAdminQuotesCreateInput` / `GenAuthAgentPhoneAdminQuotesCreateResult` | `POST /api/v3/agent-phone/admin/quotes` |
| `qoni.genauth.agentPhone.admin.numbers.acquire` | `quoteId`, `maxCost`, `idempotencyKey` | `GenAuthAgentPhoneAdminNumbersAcquireInput` / `GenAuthAgentPhoneAdminNumbersAcquireResult` | `POST /api/v3/agent-phone/admin/number-acquisitions` |
| `qoni.genauth.agentPhone.admin.activations.create` | `quoteId`, `maxCost`, `idempotencyKey` | `GenAuthAgentPhoneAdminActivationsCreateInput` / `GenAuthAgentPhoneAdminActivationsCreateResult` | `POST /api/v3/agent-phone/admin/activations` |
| `qoni.genauth.agentPhone.admin.activations.list` | — | `GenAuthAgentPhoneAdminActivationsListInput` / `GenAuthAgentPhoneAdminActivationsListResult` | `GET /api/v3/agent-phone/admin/activations` |
| `qoni.genauth.agentPhone.admin.activations.get` | `taskId` | `GenAuthAgentPhoneAdminActivationsGetInput` / `GenAuthAgentPhoneAdminActivationsGetResult` | `GET /api/v3/agent-phone/admin/activations/{taskId}` |
| `qoni.genauth.agentPhone.admin.activations.messages` | `taskId` | `GenAuthAgentPhoneAdminActivationsMessagesInput` / `GenAuthAgentPhoneAdminActivationsMessagesResult` | `GET /api/v3/agent-phone/admin/activations/{taskId}/messages` |
| `qoni.genauth.agentPhone.admin.messages.content` | `messageId` | `GenAuthAgentPhoneAdminMessagesContentInput` / `GenAuthAgentPhoneAdminMessagesContentResult` | `GET /api/v3/agent-phone/admin/messages/{messageId}/content` |
| `qoni.genauth.agentPhone.admin.verifications.create` | `resourceId`, `service`, `rules` | `GenAuthAgentPhoneAdminVerificationsCreateInput` / `GenAuthAgentPhoneAdminVerificationsCreateResult` | `POST /api/v3/agent-phone/admin/verifications` |
| `qoni.genauth.agentPhone.admin.verifications.list` | — | `GenAuthAgentPhoneAdminVerificationsListInput` / `GenAuthAgentPhoneAdminVerificationsListResult` | `GET /api/v3/agent-phone/admin/verifications` |
| `qoni.genauth.agentPhone.admin.verifications.get` | `taskId` | `GenAuthAgentPhoneAdminVerificationsGetInput` / `GenAuthAgentPhoneAdminVerificationsGetResult` | `GET /api/v3/agent-phone/admin/verifications/{taskId}` |
| `qoni.genauth.agentPhone.admin.operations.list` | — | `GenAuthAgentPhoneAdminOperationsListInput` / `GenAuthAgentPhoneAdminOperationsListResult` | `GET /api/v3/agent-phone/admin/operations` |
| `qoni.genauth.agentPhone.admin.operations.get` | `operationId` | `GenAuthAgentPhoneAdminOperationsGetInput` / `GenAuthAgentPhoneAdminOperationsGetResult` | `GET /api/v3/agent-phone/admin/operations/{operationId}` |
| `qoni.genauth.agentPhone.admin.verifications.candidates` | `taskId` | `GenAuthAgentPhoneAdminVerificationsCandidatesInput` / `GenAuthAgentPhoneAdminVerificationsCandidatesResult` | `GET /api/v3/agent-phone/admin/verifications/{taskId}/candidates` |
| `qoni.genauth.agentPhone.admin.verifications.cancel` | `taskId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneAdminVerificationsCancelInput` / `GenAuthAgentPhoneAdminVerificationsCancelResult` | `POST /api/v3/agent-phone/admin/verifications/{taskId}/cancel` |
| `qoni.genauth.agentPhone.admin.verifications.consume` | `taskId`, `idempotencyKey` | `GenAuthAgentPhoneAdminVerificationsConsumeInput` / `GenAuthAgentPhoneAdminVerificationsConsumeResult` | `POST /api/v3/agent-phone/admin/verifications/{taskId}/consume` |
| `qoni.genauth.agentPhone.admin.activations.candidates` | `taskId` | `GenAuthAgentPhoneAdminActivationsCandidatesInput` / `GenAuthAgentPhoneAdminActivationsCandidatesResult` | `GET /api/v3/agent-phone/admin/activations/{taskId}/candidates` |
| `qoni.genauth.agentPhone.admin.activations.cancel` | `taskId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneAdminActivationsCancelInput` / `GenAuthAgentPhoneAdminActivationsCancelResult` | `POST /api/v3/agent-phone/admin/activations/{taskId}/cancel` |
| `qoni.genauth.agentPhone.admin.activations.finish` | `taskId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneAdminActivationsFinishInput` / `GenAuthAgentPhoneAdminActivationsFinishResult` | `POST /api/v3/agent-phone/admin/activations/{taskId}/finish` |
| `qoni.genauth.agentPhone.admin.activations.consume` | `taskId`, `idempotencyKey` | `GenAuthAgentPhoneAdminActivationsConsumeInput` / `GenAuthAgentPhoneAdminActivationsConsumeResult` | `POST /api/v3/agent-phone/admin/activations/{taskId}/consume` |
| `qoni.genauth.agentPhone.admin.personas.list` | — | `GenAuthAgentPhoneAdminPersonasListInput` / `GenAuthAgentPhoneAdminPersonasListResult` | `GET /api/v3/agent-phone/admin/personas` |
| `qoni.genauth.agentPhone.admin.personas.create` | `displayName` | `GenAuthAgentPhoneAdminPersonasCreateInput` / `GenAuthAgentPhoneAdminPersonasCreateResult` | `POST /api/v3/agent-phone/admin/personas` |
| `qoni.genauth.agentPhone.admin.providers.list` | — | `GenAuthAgentPhoneAdminProvidersListInput` / `GenAuthAgentPhoneAdminProvidersListResult` | `GET /api/v3/agent-phone/admin/providers` |
| `qoni.genauth.agentPhone.admin.providers.create` | `name`, `settings`, `provider`, `credentials` | `GenAuthAgentPhoneAdminProvidersCreateInput` / `GenAuthAgentPhoneAdminProvidersCreateResult` | `POST /api/v3/agent-phone/admin/providers` |
| `qoni.genauth.agentPhone.admin.providers.update` | `configId`, `revision` | `GenAuthAgentPhoneAdminProvidersUpdateInput` / `GenAuthAgentPhoneAdminProvidersUpdateResult` | `PATCH /api/v3/agent-phone/admin/providers/{configId}` |
| `qoni.genauth.agentPhone.admin.providers.test` | `configId`, `idempotencyKey`, `revision` | `GenAuthAgentPhoneAdminProvidersTestInput` / `GenAuthAgentPhoneAdminProvidersTestResult` | `POST /api/v3/agent-phone/admin/providers/{configId}/test` |
| `qoni.genauth.agentPhone.admin.numbers.register` | `personaId`, `phone` | `GenAuthAgentPhoneAdminNumbersRegisterInput` / `GenAuthAgentPhoneAdminNumbersRegisterResult` | `POST /api/v3/agent-phone/admin/numbers/manual` |
| `qoni.genauth.agentPhone.admin.numbers.update` | `resourceId`, `label`, `revision` | `GenAuthAgentPhoneAdminNumbersUpdateInput` / `GenAuthAgentPhoneAdminNumbersUpdateResult` | `PATCH /api/v3/agent-phone/admin/numbers/{resourceId}` |
| `qoni.genauth.agentPhone.admin.numbers.archive` | `resourceId`, `reason`, `revision` | `GenAuthAgentPhoneAdminNumbersArchiveInput` / `GenAuthAgentPhoneAdminNumbersArchiveResult` | `POST /api/v3/agent-phone/admin/numbers/{resourceId}/archive` |
| `qoni.genauth.agentPhone.admin.numbers.bindings` | `resourceId` | `GenAuthAgentPhoneAdminNumbersBindingsInput` / `GenAuthAgentPhoneAdminNumbersBindingsResult` | `GET /api/v3/agent-phone/admin/numbers/{resourceId}/bindings` |
| `qoni.genauth.agentPhone.admin.operations.reconcile` | `operationId` | `GenAuthAgentPhoneAdminOperationsReconcileInput` / `GenAuthAgentPhoneAdminOperationsReconcileResult` | `POST /api/v3/agent-phone/admin/operations/{operationId}/reconcile` |
| `qoni.genauth.agentPhone.admin.policies.list` | — | `GenAuthAgentPhoneAdminPoliciesListInput` / `GenAuthAgentPhoneAdminPoliciesListResult` | `GET /api/v3/agent-phone/admin/policies` |
| `qoni.genauth.agentPhone.admin.policies.create` | `actorId`, `actorType`, `personaIds`, `resourceIds`, `actions`, `enabled` | `GenAuthAgentPhoneAdminPoliciesCreateInput` / `GenAuthAgentPhoneAdminPoliciesCreateResult` | `POST /api/v3/agent-phone/admin/policies` |
| `qoni.genauth.agentPhone.admin.policies.update` | `policyId`, `actorId`, `actorType`, `personaIds`, `resourceIds`, `actions`, `enabled`, `revision` | `GenAuthAgentPhoneAdminPoliciesUpdateInput` / `GenAuthAgentPhoneAdminPoliciesUpdateResult` | `PATCH /api/v3/agent-phone/admin/policies/{policyId}` |

## 辅助方法与参数规则

| 辅助方法 | 输入 | 结果 / 行为 |
| --- | --- | --- |
| `qoni.genauth.agentMail.withCredentials` | `GenAuthCommunicationCredentials` | 绑定独立运行凭据的 Namespace 客户端 |
| `qoni.genauth.agentMail.operations.wait` | `GenAuthAgentMailOperationsGetInput`; `GenAuthCommunicationWaitOptions` | 与 get 相同的响应；限时 GET 轮询 |
| `qoni.genauth.agentMail.verifications.wait` | `GenAuthAgentMailVerificationsGetInput`; `GenAuthCommunicationWaitOptions` | 与 get 相同的响应；限时 GET 轮询 |
| `qoni.genauth.agentPhone.withCredentials` | `GenAuthCommunicationCredentials` | 绑定独立运行凭据的 Namespace 客户端 |
| `qoni.genauth.agentPhone.operations.wait` | `GenAuthAgentPhoneOperationsGetInput`; `GenAuthCommunicationWaitOptions` | 与 get 相同的响应；限时 GET 轮询 |
| `qoni.genauth.agentPhone.verifications.wait` | `GenAuthAgentPhoneVerificationsGetInput`; `GenAuthCommunicationWaitOptions` | 与 get 相同的响应；限时 GET 轮询 |
| `qoni.genauth.agentPhone.admin.operations.wait` | `GenAuthAgentPhoneAdminOperationsGetInput`; `GenAuthCommunicationWaitOptions` | 管理员身份 GET 轮询 |
| `qoni.genauth.agentPhone.admin.verifications.wait` | `GenAuthAgentPhoneAdminVerificationsGetInput`; `GenAuthCommunicationWaitOptions` | 管理员身份 GET 轮询 |

各方法的必填幂等键与版本号已列在表中。SDK 将 `idempotencyKey` 放入 `Idempotency-Key`，将 `revision` 转成带引号的 `If-Match`，并从业务 JSON 移除凭据、路径和请求头字段。路径参数进行 URL 编码；未设置的可选字段省略。

Mail 列表使用 cursor；Phone 号码使用 page/limit。Mail 日期时间是 ISO 字符串，Phone 任务与租约时间是毫秒时间戳。完整 DTO 字段通过导出的 TypeScript 类型查看。

契约来源: GenAuth `3d5dd6ef34`, 2026-10-10. 通信目录独立于 591 个方法名的 Authing 管理目录。
