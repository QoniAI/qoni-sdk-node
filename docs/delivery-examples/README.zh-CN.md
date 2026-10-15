# 候选 SDK 示例

这些示例说明如何使用候选 SDK，并区分等待中、登录态已保存、写入结果未知与业务成功。它们针对**未发布本地候选包**；npm 发布包即使同样显示 0.9.0，也不代表包含这些能力。[English](./README.md)

## 前置条件

需要 Node.js 18+、fetch、此次集成指定的候选 tarball，以及独立可写的示例目录。正式应用的 AK/SK 和用户 token 留在可信服务端。示例函数接受已有 `Qoni` client，导入文件本身不会发请求。

本地 consumer 只使用合成凭据与临时 loopback HTTP 服务，不连接真实 GenAuth、Web Agent、GUMem、浏览器或邮件供应商。HTTP 回包是后端替身；验证的是 SDK 用法，不是生产鉴权或后端业务验收。

## 本地运行

把本示例目录的内容复制到 SDK 工作区之外的新可写目录。安装**此次指定候选包**，不要安装未固定的 npm 包：

```bash
npm install --ignore-scripts /absolute/path/to/reviewed-qoni-candidate.tgz
npm run smoke
```

示例 private package 同时安装 TypeScript 与 Node 类型。`smoke` 用实际安装包的公开 DTS 编译五个 `.ts` 文件，检查 ESM/CommonJS imports，再执行 loopback consumer。结果写入 `local-results.json`：12 项须全部 PASS，`resources.server_closed` 须为 true。夹具不发真实邮件、不购买。

## 逐个接入函数

| 文件 | 完成什么 | 应用负责什么 |
| --- | --- | --- |
| [hosted-login.ts](./hosted-login.ts) | 生成托管登录 URL，校验 state 后仅兑换一次 code | 提供绑定原浏览器会话、可原子匹配并消费 state 的存储；登记精确 redirect URI；返回 token 留在服务端，不写日志。 |
| [interactions.ts](./interactions.ts) | 保留原登录/接管句柄，提交声明的普通表单字段 | 传当前 run 的 `onInteraction` 句柄，只展示给原用户；保留原 ID，错误后不换卡、不自动重试。 |
| [profile-memory.ts](./profile-memory.ts) | 原 Task 本人的普通资料读写，显式选择记忆召回 | 只取得原始所需 scope 与当前用户许可。Profile/recall 从 `.data` 读；`runWithMemory` 直接返回 `{run,memory}`。 |
| [agents.ts](./agents.ts) | 创建、读回并绑定同一个 Agent 编排回执 | create 前保存完整原请求/idempotencyKey，收到后保存 provisioningId；仅 `state: ready, ready: true` 时用当前本人 accessToken 绑定。 |
| [failure-handling.ts](./failure-handling.ts) | 查询已知 run、停止本地等待、仅输出不含秘密的错误分类 | 同意变更走已支持的用户权限界面；本地 abort 不是服务端取消回执，这里不发明 SDK revoke 方法。 |

`signInOnOriginalCard` 等待你的 UI callback，然后在同一个 handle 上调用 `confirmSignedIn()`。后端明确声明 `current_task` 时，SDK 保持原 L/C，只做一次保存/交还/回复。示例返回 `awaiting_agent_verification`，不代表网页已经登录；不要先调用已弃用的 `login.confirm()`。后端声明旧策略时，SDK 仍保留相应历史登录流程。

`submitOrdinaryForm` 接收按原 `payload.fields` 渲染的值：字段名和 option value 不改，数字仍为 number，地址为对象。普通表单不会写 Profile。Profile 字段以[实际白名单](../ordinary-task-profile.md)为准；支付/卡片、敏感值及手机号/邮箱验证不在普通适配器内。

`startWithMemory` 要求原委托同时覆盖 GUM read 和 Do Anything manage；普通 `run()` 不会召回。召回失败阻止创建 Task；Task POST 开始后再超时，可能已经写入。统一候选可消费配套 A1 r2 后端完整覆盖的逐记录来源；缺覆盖证明时保留无来源 legacy facts/summary。字节预算先保正文，省略的整组来源标为 unavailable 并设置 `truncated`；空 `sources` 不能补成猜测的引用；历史记录里的 URL 不等于事实来源已核验。

Agent 编排是候选 API，后端业务验证尚未完成。`creating`/`mail_pending`、`ready: false` 不代表绑定成功或供应商验收。公开 provisioning state 没有 `unknown`，但丢失回包和错误仍可使结果未知。保留原 key/回执，已知原 ID 时用 `get` 读回，不换新 key 创建替代对象。可选邮箱编排也不意味着存在公开 mail-send SDK 方法或已支持外部供应商。

## 失败与下一步

所有示例都不自动重试 POST；`error.retryable` 不能证明写入已回滚。hosted code 兑换未知须重新开始登录；已知 Profile/run/provisioning 写入按各自原对象查询。旧接管 ID 的 409 保持失败。新增权限须取得明确同意；用户缩窄或撤销后不能重新扩大原授权。

这些示例不证明凭据/浏览器/供应商可连续等待一小时，也不证明开放 browser/bash/harness 的通用动作批准或敏感值隔离。接入正式应用前核对配套后端前置条件；已发布版本与本次候选应分开；typed 来源字段需要匹配的后端投影。
