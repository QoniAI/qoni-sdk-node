# Quickstart v5 候选合同

这些接口从 0.9.2 起随 npm 包发布，需要配套后端；发布不代表完整业务验收，个人 Agent 编排在生产环境尚未开通。

## Personal Agent 创建与绑定

`genauth.agents.create({displayName, description?, channels: {email}, idempotencyKey?})` 的 `channels.email` 是用户选择的邮箱本地名。返回的 `id`、`email` 仅来自后端已确认的 ready/bound 回执，SDK 不生成地址或补造 ready。旧 `{displayName, idempotencyKey, mailboxLocalPart?}` 方法仍返回 provisioning 回执。

新 overload 只发一次 create。后端明确受理、返回合法 provisioningId 且状态为 creating/mail_pending 时，最多进行 20 次只读观察；120 秒总预算从初次 create 前开始，包含该请求及所有等待和观察。每次观察最多 5 秒，受剩余总预算限制，并通过 AbortSignal 取消实际传输。错误或响应未知后不会继续观察或重发 create。

失败的 `PersonalAgentCreateError` 保留原错误的 code/status/body/requestId/cause、`retryable: false` 和原 `idempotencyKey`；如果可确认，也保留 provisioningId。调用方可显式执行 `genauth.agents.get(error.recovery)`，按原 key 只读追溯。get 的 provisioningId/agentId/idempotencyKey 三种 selector 恰选一个，原 key 回查要求 `readOnly: true`。

自动 key 只保障当前调用能报告其请求身份。App 要跨进程或硬崩溃恢复，须在调用前持久保存显式 key；SDK 不建隐式文件或仅靠内存恢复，也不以 displayName 推测原请求。

`genauth.agents.bindUser({agentId, userAccessToken, relation: 'owner'})` 将当前用户 token 发给后端识别本人，验证真实 bound 回执并返回 bindingId/userId。创建、绑定均不授予任务、邮箱或其他业务权限。既有 `agents.bind({provisioningId, accessToken})` 保持兼容。

## Formal Agent 委托

默认 mode 为 silent，也可显式指定 silent 或 interactive；其他 JavaScript mode 在本地拒绝。formal agentId 必须是 UUID，不能同时使用旧 agent/agentKey 标签。silent 保留明确的目标 userId 要求；interactive 在签名前剔除 user/userId，由真实登录授权决定身份，deprecated 类型兼容不代表采用这些字段。

`scopes: ['*']` 仅接受 formal Agent 的默认或显式 silent，不能混入具体 scopes 或 products（包括空数组），不能用于旧标签或 interactive。SDK 原样发送单个星号；后端根据当前 App/凭据、capability、绑定与已有效同意等实际权限有界求交，SDK 不本地展开、缓存授权或扩大权限。要核实实际授予的具体 scopes，应调用 `genauth.introspectDelegationToken({token})`。

首次缺少有效授权依据仍可能返回 `needs_authorization`。HTTP 200 内的业务 403 与原 code/body 保持失败；SDK 不自动切换 interactive、续签、重试或替用户同意。显式 interactive 仍需用户完成真实授权，再按正式 complete 接口兑换。

## Track 与附件兼容

Track 使用实际 `/track/tracks` 合同，保留终态 `done`、409 `task_in_progress` 及真实回执；不自动重跑。未实现的 Track 流式/交互、历史快照及旧 `doAnything.readArtifacts()` 在本地抛出 `QoniUnsupportedError`，不发 HTTP。附件读取沿实际 blob 接口及既有所有者校验。

## 本地验证边界

`pnpm test` 验证既有 mock、包导出和 Task 回归。Quickstart 新增回归可单独执行：

```sh
pnpm exec vitest run --coverage=false tests/agent-provisioning.test.ts tests/personal-agent-page.test.ts tests/formal-delegation.test.ts tests/formal-agent-silent.test.ts tests/delegation-normalizer-r3.test.ts tests/formal-agent-wildcard.test.ts tests/composed-intersections.test.ts tests/profile.test.ts tests/structured-forms.test.ts tests/structured-forms-r2.test.ts tests/task-mail.test.ts tests/w11-acceptance.test.ts
pnpm typecheck
pnpm build
```

这些测试使用 mock 与独立 loopback，不读取真实凭据。它们不证明 GA wildcard 真实签发、邮箱供应商、完整网页业务或 Enterprise namespace/citeSources 记忆接线已通过；这些仍须分别验收。
