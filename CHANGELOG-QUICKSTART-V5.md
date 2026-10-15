# Quickstart v5：Node.js SDK 变更说明

本说明覆盖本次交付分支相对 main 的完整 SDK 改动，帮助应用开发者判断升级影响。目标是把 GenAuth 身份与授权、Web Agent 任务与人工交互、GUMem 记忆接入统一调用链；不代表复杂网页任务、邮件或支付业务已经全面验收。

## 统一待解决清单

完整的跨仓库待解决问题、已有修复但待部署项、专项待验范围及明确延期事项见 [Quickstart 待解决问题与后续验收清单](https://gitlab.asix.inc/qoni/qoni-docs/-/blob/release/quickstart-v5-doc-scopes-20261010/QUICKSTART-OPEN-ITEMS.md)。本仓具体限制仍见下文。本次有效交付为八个仓库；Authing user-portal 已因归属问题排除，相关纠正及后续处理也记录在总表。

## 用户能得到什么

| 改动 | 对应用和用户的影响 |
|---|---|
| Personal Agent 创建与本人绑定 | 支持按页面示例创建 Identity 和邮箱、绑定已登录本人。只采用后端确认的 ID、邮箱和状态；请求结果未知时可按原请求标识只读追溯，避免重复创建。创建、绑定本身不授予业务权限。 |
| 正式 Agent 与企业 App 授权 | 正式 `agentId` 与企业 `agent` 审计标签分开。默认静默授权保留；首次缺少本人同意时如实返回 `needs_authorization`，不自动弹授权页或扩大权限。正式 Agent 的静默 `['*']` 由服务端取当前可授予范围的交集，交互式授权仍须列具体 Scope。 |
| 托管注册与登录 | 新增 `genauth.auth.createLoginUrl()`、`exchangeLoginCode()`，应用可将用户引导到正常注册/登录页，再在服务端兑换回调。状态由应用核对；链接和兑换码有期限且一次性使用，不自动重放。 |
| 当前任务浏览器登录与接管 | 登录发生在原任务浏览器，保存、交还和答复绑定原交互及原接管轮次。`openLogin()`、`confirmSignedIn()`、连接/刷新/交还不再借用笼统的 manage 权限。旧卡、过期卡或不匹配的轮次明确失败，不自动换一个 ID 再试。 |
| 普通问询、表单和 Profile | 增加普通表单类型与 `submit(values)`；提交前核必填项、类型、选项和有限数值。Profile 读写单独调用并核原 Task 本人及当前字段权限；回答表单不等于保存 Profile，skip/cancel 不保存。普通适配器不支持密码、卡片、证件、加密字段或邮箱/手机号验证变更。 |
| 记忆与来源 | 增加显式 `runWithMemory()` 和类型化 `recallContext()`；召回失败时不创建任务，未知提交不自动重发。保留普通 `run()` 的默认行为，以及任务的 namespace/citeSources 接口。内部 Task 客户端可在当前权限下创建固定任务 Session、追加具有稳定 ID 的消息，不能由调用方覆盖用户、令牌、路径或鉴权头。 |
| Track 与附件兼容 | Track 对齐真实 `/track/tracks` 合同，使用显式 interval/daily 调度；`runNow` 返回受理引用，不能当完成。仅查最近检查记录，不编造历史快照。没有对应服务端合同的 cron、旧字段、Track 流式/交互及旧 `readArtifacts()` 在客户端抛出明确不支持错误，不发送请求；文件附件继续走实际接口。 |
| 错误、包与示例 | 区分未发请求、已受理、业务拒绝与结果未知；新增非自动重试的任务提交未知错误。补充中英说明、可编译交付示例、包导出与真实 HTTP/类型测试，并统一有界 JSON 传输。 |

另外保留了受保护表单引用的 SDK 类型和入口，但其敏感窗口、卡片代填及工具/模型隔离尚未完成端到端平台验收。本次不以接口存在作为启用依据。

## 升级时必须调整的配置

本仓没有新增数据库、迁移文件、后台服务或必填环境变量。`QONI_ACCESS_KEY`、`QONI_SECRET_KEY` 等仍是示例由应用读取后传入的配置，凭据留在应用服务端；SDK 不负责创建部署 Secret。

- **明确任务权限。** `taskScopes` 用于创建任务时的 Web Agent 令牌交换，不进入任务 body；省略时仍只有 manage。需要接管时显式申请 `webagent.browser_use:take_control`，并在原委托与当前 App/AccessKey 策略中允许。登录还需独立的 `webagent.site_login:request`、`webagent.site_login:confirm`；读取状态与事件需 read。旧委托不会因升级而增加权限。
- **准备本人同意与能力前置。** Personal Agent 需要有效归属、审核同步的 capability、相应数据权限及本人持续同意；企业 App 的静默授权需要已有组织授权依据。App 审计标签不能代替正式 Agent 身份或邮箱授权。
- **使用匹配的 Host。** 默认入口是 Qoni Console/BFF 的运行时发现；灰度部署应显式配置 `host` 及确有需要的 `genauthHost`、`webAgentHost`、`gumemHost`，保证它们属于同一套 App、用户池和产品资源。跨域代理及回调白名单由服务端配置，不能把签名密钥下发到浏览器。
- **迁移 Track 使用方。** 移除无服务端映射的旧字段；区分 `202` 受理和检查终态。暂停/删除调度不等于取消已经运行的检查。
- **处理未知结果。** 保存原 request/idempotency key、runId、interactionId。请求超时或回执未知后先读原结果；不得盲目重建任务、重新发信或重新提交表单。

## 数据与服务依赖

SDK 自身无数据迁移。升级依赖 GenAuth/IAM 的 Agent、capability、consent 与当前授权合同，Web Agent 的持久交互 ID、当前任务登录及任务权限合同，以及 GUMem 的任务 Session、标签和来源投影。各服务的数据库迁移由对应仓库按自己的上线说明执行，不能用安装 SDK 代替。

普通 Profile、正式邮箱和敏感字段的权限各自独立。已有权限常量或类型不表示所有后端路径都已可用；调用方应处理明确的业务拒绝和不支持错误。

## 上线顺序与回退

1. 先核对后端版本、Scope 注册、App 产品绑定、回调地址和用户同意；完成对应服务迁移。等待受影响的登录/接管任务结束后，再协调 SDK 与 Web Agent 切换，避免旧 release 权限合同和新 SDK 混用。
2. 使用锁定版本或经过核对的包安装，并运行应用自身的类型检查与必要接口冒烟。**本次已测预览包为 `0.10.0-rc.20261011`；本说明不代表该包已发布到 npm，也不代表不固定版本的 `npm install @qoniai/qoni` 会安装它。** 最终 npm 发布版本需由发布流程单独确认。
3. 按最短链路核本人授权、一次任务、事件/交互、最终状态与记忆读回。确认应用能区分成功、拒绝与未知，再扩大使用。
4. 回退时恢复应用锁定的上一兼容包与匹配服务配置；先结束受影响的交互。保留已经创建的 Agent、consent、任务和请求标识，不靠重放业务或删除数据完成回退；服务端迁移回退另按各仓方案处理。

## 验证范围与未完成项

已有验证包括定向单测、类型检查、包导出/消费、独立 HTTP 与数据库接线，以及测试环境中的授权、托管登录、当前任务登录保存、交互往返、跨 Task 记忆保存/召回和 USER/App/namespace 隔离。不同证据对应各自明确的主体、数据与调用路径，并非所有参数组合一次全部通过。

原始失败与结果未知仍保留。当前受控浏览器表单自动完成协议的问题，不因确认 API 已受理或人工核清真实效果而变为自动成功。复杂邮件/CRM、跨日去重、长时运行、深度撤权竞态及敏感字段隔离交由专项验收。准备本次 MR 时已合并最新 main，合并后构建、类型检查及默认测试 1,021 项通过；没有执行 npm 发布。

## 源码附录

- 授权、托管登录与 Agent：`src/genauth.ts`、`src/scopes.ts`。
- 任务、交互与表单：`src/do-anything.ts`、`src/interactions.ts`、`src/forms.ts`、`src/run-handle.ts`。
- 记忆、内部 Task 客户端与传输：`src/memory-context.ts`、`src/task-client.ts`、`src/gumem.ts`、`src/json-transport.ts`。
- Track 与错误：`src/track.ts`、`src/errors.ts`；交付示例：`docs/delivery-examples/`。
