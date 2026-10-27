# @qoniai/qoni

[English](./README.md) | 中文

`@qoniai/qoni` 是面向 Node.js 服务端的统一 Qoni SDK，用一条清晰的调用链串起 Agent 委托授权、GenAuth 用户管理、GUMem 长期记忆、WebAgent 网页行动、Do Anything、Web Search 和 Track 监控能力。

当一个 Agent 真正开始帮用户做事时，它不能只拿一把后台密钥到处调用接口。它需要知道用户是谁、用户允许它做什么、这次授权什么时候过期、页面里发生了什么、最后每一步能不能被追溯。

`@qoniai/qoni` 解决的是两类服务端调用：运行时产品调用时，应用服务端先确认 GenAuth 用户，再通过 `delegateToken` 申请短期委托 token，之后每次 GUMem/WebAgent/Do Anything/Web Search/Track 调用都把这个 token 传入 `token` 字段；GenAuth 用户管理调用时，SDK 会用 Qoni AK/SK 换取标准 GenAuth management token，再调用 GenAuth v3 users API。

AK/SK 必须只保存在可信服务端，不能下发到浏览器、移动端、公开 CLI 配置或其他不可信运行环境。

## 为什么使用 Qoni

Qoni 把 Agent 授权模型收敛成几个稳定边界：

- 一个 SDK 入口：`new Qoni({ accessKey, secretKey })`。
- 一条发现路径：`host` 可在私有化或本地部署中覆盖 Qoni Console/SDK 网关，SDK 通过 `/api/v3/eak/runtime-config` 获取 GenAuth、GUMem、WebAgent 等运行时地址。
- 一个授权入口：调用 `delegateToken`；silent 模式直接返回 `data.token`，interactive 模式返回授权 URL，之后由业务服务端完成兑换。
- 一条管理面路径：调用 `genauth.users.*`，SDK 会先用 AK/SK 换取 GenAuth management token，再调用 GenAuth v3 users API。
- 一组能力命名空间：`genauth`、`gumem`、`webSearch`、`doAnything`、`track`。
- 一组可读的 scope 字符串：让最小授权边界直接出现在业务代码里。
- 一致的错误和审计字段：`requestId`、`traceId`、`auditId`、`retryable`。

公开 npm 包和 JavaScript API 使用 Qoni 品牌。当前服务端协议尚未迁移，
因此内部签名路由继续使用 `/api/v3/eak/*`，delegation token claim 继续使用
`eak_delegation_token`，服务端返回的 `eak.*` 错误码也保持原样透传。业务代码
不应改写 `eak_tenant_id` 等现有 wire claim，只应使用公开的 Qoni API，不要
自行拼装这些内部 wire 值。

## 安装

```bash
npm install @qoniai/qoni
# 或
pnpm add @qoniai/qoni
# 或
yarn add @qoniai/qoni
```

运行要求：

- Node.js 18 或更高版本。
- 服务端运行环境提供 `fetch`。
- 在 Qoni Console 创建的 `accessKey` 与 `secretKey`。
- silent 运行时产品调用需要一个来自该 Qoni credential 绑定 GenAuth userpool 的真实用户 ID。Smoke 测试可以通过 `QONI_USER_ID` 传入，或调用 `qoni.resolveAnyBoundUser()` 取绑定 userpool 里的第一个用户；业务代码中应通过 `currentUser` 或服务端已有登录态解析。interactive 委托创建时可以不传 `user` 或 `userId`，因为 Qoni Console/BFF 会在授权过程中处理 GenAuth 登录。
- `genauth.users.*` 管理面调用不需要 `QONI_USER_ID`。SDK 会用 AK/SK 向 Qoni 换取 GenAuth management token。
- 可选的 `host`，用于私有化或本地部署；托管版 Qoni 通常保持未传。

正常初始化 SDK 时不需要传 `tenantId`。Qoni AK/SK 已经在服务端绑定了租户和应用边界。

包同时发布 ESM 和 CommonJS 两套构建（都带 TypeScript 类型），两种引入方式都可用：

```ts
import { Qoni } from "@qoniai/qoni";        // ESM / TypeScript
const { Qoni } = require("@qoniai/qoni");    // CommonJS
```

> **需要配套后端：** 下文的托管登录、current_task、普通表单/Profile、运行前记忆和个人 Agent 编排从 0.9.2 起包含在 npm 包中，需要配套的 Qoni 后端；个人 Agent 编排在生产环境尚未开通。见[可编译示例](./docs/delivery-examples/README.zh-CN.md)。

本候选的 Personal Agent、formal 委托、wildcard 与错误恢复边界见 [Quickstart v5 合同](./docs/quickstart-v5-contract.md)。该合同给出本分支的实际候选版本。
> 本统一本地候选已组合这些接口、修订的记忆错误合同、原键回执读取和 A1 r2 记忆投影。仍未发布；请使用其固定归档/DTS 及配套后端合同。

## AI Skill

`@qoniai/qoni` 不应该只给人读文档，也应该让 AI 工具能直接理解 SDK 的能力边界。可以通过 Skill 让 Codex、Claude Code 或内部 Agent 按同一套授权模型调用 Qoni。

安装 Qoni Skill：

```bash
npx skills add https://github.com/QONIAI/qoni-sdk-node --skill qoni-sdk
```

如果只想安装到 Claude Code，可以指定 Agent：

```bash
npx skills add https://github.com/QONIAI/qoni-sdk-node --agent claude-code --skill qoni-sdk
```

npm 包中包含 `skills/` 目录，但推荐仍使用上面的 GitHub 仓库安装命令，这样 AI 工具可以读取仓库内的 Skill 元数据。

## 最短调用链

先在可信服务端初始化 SDK。AK/SK 只留在服务端，管理面调用和运行时产品委托都复用这一个 SDK 实例。

```ts
import fs from "node:fs";
import { Qoni } from "@qoniai/qoni";

const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
});
```

### GenAuth 用户管理

`genauth.users.*` 属于管理面能力，不需要 `QONI_USER_ID` 或 `delegateToken`。SDK 会在内部签名请求 `POST /api/v3/eak/genauth/admin-token`，请求体是 `{}`，拿到 GenAuth management token 和 `userPoolId` 后再调用 GenAuth v3 users API。

```ts
const users = await qoni.genauth.users.list({
  page: 1,
  limit: 20,
});

console.log("GenAuth users:", users.data);

const created = await qoni.genauth.users.create<{ userId: string }>({
  username: `sdk-demo-${Date.now()}`,
  password: process.env.GENAUTH_DEMO_USER_PASSWORD!,
});

const profile = await qoni.genauth.users.get<{ userId: string }>({
  userId: created.data.userId,
});

await qoni.genauth.users.update({
  userId: profile.data.userId,
  nickname: "SDK demo user",
});

// Smoke 测试结束后可以清理测试用户：
// await qoni.genauth.users.deleteBatch({ userIds: [profile.data.userId] });
```

### GenAuth 管理功能

`qoni.genauth` 现在提供 **35 个命名空间、591 个管理方法**，以 [Authing 官方 Node SDK 4.0.2](https://github.com/Authing/authing-node-sdk) 为参考，覆盖其全部 496 个 JSON 管理方法，并保留 GenAuth 扩展及兼容名称。除用户、角色、组织、应用和资源授权外，还包括岗位、公共账号、邀请、元数据、审批和风险名单。所有方法复用 Qoni AK/SK 管理 Token 交换，具备 TypeScript 参数及返回类型，并支持取消请求；实际部署的功能开关和权限仍决定接口可用性。

```ts
await qoni.genauth.groups.create({ code: "engineering", name: "工程团队" });
await qoni.genauth.groups.addMembers({ code: "engineering", userIds: ["USER_ID"] });

// 沿用 Authing v3 方法名称的调用入口：
const roles = await qoni.genauth.management.listRoles({ namespace: "project", page: 1, limit: 20 });

// 自动逐页读取；break 后不会请求下一页：
for await (const user of qoni.genauth.users.iterate({ limit: 50 })) {
  console.log(user.userId);
}
```

[使用指南](./docs/genauth-management.md) · [完整 API 清单](./docs/genauth-management-api.md)。角色需属于已存在的权限分组；删除用户仍需遵循 GenAuth 的在职与离职规则。

### 运行时产品委托

GUMem、WebAgent、Do Anything、Web Search、Track 是代表终端用户执行的运行时产品能力。silent 委托需要一个来自 Qoni credential 绑定 userpool 的真实 GenAuth 用户 ID，再使用 `delegateToken` 返回的 token。

```ts
const userId = process.env.QONI_USER_ID!;
if (!userId) {
  throw new Error("QONI_USER_ID 必须是 credential 绑定 userpool 下的真实 GenAuth 用户 ID");
}

// `products` 是按产品授权的糖；`agent` 可以不传，默认 "sdk"。
const { token } = (
  await qoni.delegateToken({
    user: { id: userId },
    products: ["doAnything"],
  })
).data;

const run = await qoni.doAnything.run({
  token, // 入口传一次，句柄随后持有——句柄方法不再传 token
  prompt: "打开 https://en.wikipedia.org/wiki/Singapore ，总结新加坡的关键信息（首都、人口、货币）。",
  capture: { screenshots: true },
});

const result = await run.wait({
  onScreenshot: (img, i) => fs.writeFileSync(`step-${i}.jpg`, img.bytes),
  onInteraction: (i) => {                 // site_login / take_control / ask_user / confirmation
    if (i.can("confirm_signed_in")) return i.confirmSignedIn();
    if (i.can("confirm")) return i.confirm();
  },
});
console.log(result.output);
```

此公开网页示例只申请产品的 `read` + `manage`。使用下文浏览器接管处理函数前，为该 run 申请 token 时需显式加入 `scopes: [QoniScopes.BROWSER_USE_TAKE_CONTROL]`，在 AccessKey 策略中允许该权限，并取得用户同意。站点登录处理函数另外需要 `QoniScopes.SITE_LOGIN_REQUEST` 和 `QoniScopes.SITE_LOGIN_CONFIRM`。这些权限应通过交互式委托取得；`products` 简写不包含它们。

创建可能发起人类接管的任务时，给 `doAnything.run()` 传入 `taskScopes: [QoniScopes.BROWSER_USE_TAKE_CONTROL]`；`api.createRun()` 和 `runWithMemory()` 也支持此参数。任务需要站点登录权限时，再明确加入对应的 `SITE_LOGIN_*`。SDK 始终包含 manage；省略 `taskScopes` 时只申请 manage。原委托与当前权限策略必须已经允许所列 Scope。只接受 SDK 已知的具体 Web Agent Scope，不接受通配符。直接传入的产品 Token 保持原样，此参数不能给它扩权。0.9.2 起提供。


`run()` 返回一个 `RunHandle`。核心事件（状态、动作、交互、完成）始终默认推送；`capture: { screenshots: true }` 开启逐步截图，并且 SDK 已经把图片解码成字节。`wait()` 把任务跑到终态，并从权威 run envelope 结算结果（成本、步数、token 用量都在 `result.raw` 上）。

无论是否开启 capture，不可解码或空的截图 data URI 都不会中断 `wait()`，也不会触发 `onScreenshot`。有可读消息时按既有契约降级为 progress；`onWireEvent` 始终保留原始 payload，包括没有 progress 文本的帧。

需要逐步控制时，直接消费事件流，`switch (event.type)` 用 `QoniEventTypes` 常量匹配。每个产品的 handle 按产品分型（`qoni.deepResearch.run()` 出来是 `RunHandle<DeepResearchEvent>`），TS 里写错产品的事件会编译报错、补全只列本产品的。内部细节（supervisor 编排、子 agent 点击/输入、telemetry）统一折叠成 `QoniEventTypes.Progress`；匹配到 `case` 后 `event.data` 就是该类型的固定形状。原始 wire 类型不导出。

```ts
import { QoniEventTypes } from "@qoniai/qoni";

const run = await qoni.deepResearch.run({ token, prompt: "欧盟电池回收行业 2026 年现状" }); // RunHandle<DeepResearchEvent>

for await (const event of run.events()) {
  switch (event.type) {
    case QoniEventTypes.Progress:      console.log(event.data); break; // data 直接就是那句话(string)
    case QoniEventTypes.Phase:         console.log(event.data); break; // data 直接就是阶段名(string)
    case QoniEventTypes.SectionReady:  console.log(event.data); break; // data 直接就是章节标题(string)
    case QoniEventTypes.Message:       console.log(event.data.text); break; // 丰富 → { text, role }
    case QoniEventTypes.Interaction: {                                      // 丰富 → 带类型的 Interaction 对象
      const i = run.interactionHandle(event.data);                         // 例如大纲审批的 confirmation
      if (i.can("confirm")) await i.confirm();
      break;
    }
    case QoniEventTypes.Done:          console.log(event.data.output); break; // 丰富 → 终态
    // case QoniEventTypes.ResultsReady —— Web Search 才有，写这里 TS 编译报错
  }
  // event.runId / event.at / event.isTerminal / event.raw（逃生舱）
}
// 迭代器在终态（QoniEventTypes.Done）事件后自动结束。
// 注:分型的编译期拦截是 TS 的能力;纯 JS 没类型检查,写错产品事件不报错、只是不触发。

await run.cancel("用户停止任务"); // 幂等——对已结束的 run 调用也不会抛错
const followUp = await qoni.doAnything.run({
  token,
  prompt: "再打开马来西亚的维基百科页面，把它的人口和新加坡做个对比。",
  session: run.sessionRef, // 复用同一个浏览器会话
});
const reattached = await qoni.doAnything.attach(run.id, { token }); // 仅凭 run id 重连
```

这里的关键点不是方法有多少，而是每一步都有边界：Agent 只能做 token 里 scope 允许的事情，授权过期后不能继续执行，后端可以通过 `auditId` 追溯这次行为。

## 授权模型

### Runtime Discovery

`host` 指向 Qoni Console/SDK 网关，不直接指向 GenAuth、GUMem 或 WebAgent。托管版集成通常不传 `host`；私有化和本地部署可以传入自己的网关地址。

SDK 会签名请求：

```text
GET /api/v3/eak/runtime-config
```

该路径是与当前服务端保持兼容的内部协议边界，不代表公开 SDK 品牌或
JavaScript 命名空间。

返回值提供 Qoni runtime、GenAuth、GUMem、WebAgent 等服务地址。普通业务代码不需要分别配置这些产品 URL。

### 服务端 AK/SK

`accessKey` 和 `secretKey` 表示 Qoni Console 中已经配置好的租户和应用边界。SDK 只在可信服务端用它们签名 Qoni 请求，包括委托授权和产品 token exchange。

### delegateToken

silent 模式下，`delegateToken` 绑定四件事：

- 当前用户 ID。
- Agent ID。
- 本次请求的 scopes。
- token 过期时间与审计上下文。

silent 产品能力方法传入 `token: delegation.data.token`。如果这个 token 是 Qoni delegation token，SDK 会在内部换成 GUMem 或 WebAgent 所需的产品 access token，再调用下游服务。

**入参形态。** `delegateToken` 用 `mode` 判别：

- **Silent**（`mode: "silent"`，默认）——代表某个终端用户,所以 user **必填**：传 `user: { id: <genauthUserId> }`（推荐）或顶层 `userId`。不传会在请求发出前本地抛 `QoniValidationError`。授权用 `products` 语法糖和/或显式 `scopes`。
- **Interactive**（`mode: "interactive"`）——传 `redirectUri`、`state`、`agent`、`scopes`，**不传** user（Qoni Console 在授权时解析登录）。返回 `data.authorizationUrl` 而非 token；在服务端用 `completeDelegateToken({ grantId, code, state })` 完成。

`agent` 可选，默认 `"sdk"`。

```ts
const delegation = await qoni.delegateToken({
  userId,
  agent: "research-assistant",
  scopes: ["gumem.memory:read"],
  mode: "silent",
});

await qoni.gumem.recall({
  token: delegation.data.token,
  query: "研究偏好",
});
```

interactive 模式下，业务服务端仍然先调用 `delegateToken`，但这一步不会拿到 token：

```ts
const grant = await qoni.delegateToken({
  mode: "interactive",
  redirectUri: "https://app.example.com/qoni/callback",
  state: "business-csrf-state",
  agent: "research-assistant",
  scopes: ["gumem.memory:read", "webagent.do_anything:manage"],
});

// 回调不会带回 grantId：按 grantState 保存 grantId 和业务 state
await savePendingGrant(grant.data.grantState, {
  grantId: grant.data.grantId,
  businessState: "business-csrf-state",
});
redirectUserTo(grant.data.authorizationUrl);
```

用户访问 `authorizationUrl` 进入 Qoni Console/BFF。若用户未登录，Console/BFF 会先走 GenAuth 登录；授权确认后由 Console/BFF 统一 complete，再回跳业务 `redirectUri`，只带一次性 `code`、业务 `state` 和 `grant_state`，**不带 `grantId`**，需要按 `grant_state` 找回创建请求时保存的记录。浏览器不会拿到 delegation token。

业务 callback handler 在服务端用 AK/SK 兑换最终 token：

```ts
const pending = await loadPendingGrant(String(req.query.grant_state));
// 业务 state 原样回到回调里，和保存的值比对，防止回调被伪造或串用
if (!pending || req.query.state !== pending.businessState) throw new Error("Invalid delegation callback");

const completed = await qoni.completeDelegateToken({
  grantId: pending.grantId,
  code: req.query.code,
  state: String(req.query.grant_state), // 传 grant_state，不是业务 state
});

await qoni.gumem.recall({
  token: completed.data.token,
  query: "研究偏好",
});
```

`completeDelegateToken` 是推荐的服务端 callback helper。顶层 `qoni.delegateAgent` 和 `qoni.completeDelegateAgent` 仍保留为 deprecated 兼容命名，但当前 callback 契约是 `{ grantId, code, state }`；旧的 `{ code, state }` complete 签名不再兼容。

### 不持 AccessKey 的 App（0.10.1）

一个平台服务很多 App 时，AccessKey 只放在平台自己的服务端，每个 App 只拿到「正在用它的这个人」的令牌。App 用令牌跑 WebAgent，始终接触不到 AccessKey。

在持有 AccessKey 的服务端，先用平台自己的登录态确认是这个人，再：

```ts
const grant = await qoni.webAgentGrant({
  userId, // 绑定在这个工作空间的用户池里的用户
  products: ["doAnything"],
  scopes: ["webagent.site_login:request", "webagent.site_login:confirm", "webagent.browser_use:take_control"],
});
// grant: { token, expiresAt, webAgentHost, userId, scopes }，交给 App
```

委托是静默的：不弹授权页，这个人必须已经是工作空间用户池里的用户。令牌只代表这一个人，只带申请的 WebAgent 权限（AccessKey 的权限策略要允许），在 `expiresAt` 之前有效（约 14 天），到期前重新发即可。令牌发起的每次任务都计入工作空间的额度。

在 App 里用 `webAgentHost` 建客户端，不填 AccessKey：

```ts
const app = new Qoni({ webAgentHost: grant.webAgentHost });
const run = await app.doAnything.run({ token: grant.token, prompt: "帮我找下周五去东京的航班" });
await app.workspace.credits({ token: grant.token });
```

这样的客户端可以用这张令牌调用 `doAnything`、`webSearch`、`deepResearch`、`track`、`proactive`、`notifications` 和 `workspace`。需要 AccessKey 的操作（委托、换令牌、GenAuth 管理、GUMem）会在发请求前直接抛 `QoniValidationError`。任务里要登录网站或接管浏览器时，和其他令牌一样，由这个人在实时画面里完成。

## 原始委托写法（0.8.0 起）

```ts
const grant = await qoni.genauth.delegateAgent({
  userId: process.env.QONI_USER_ID!, // 当前用户的 GenAuth ID
  agentKey: "email-assistant", // Agent 审计标签，兼容 agent 参数
  scopes: [
    "webagent.do_anything:read", // 读取任务状态、事件和产物
    "webagent.do_anything:manage", // 启动、取消任务和提交普通交互响应；不含浏览器接管
  ],
  expiresIn: "15m", // 签名前转换为 900 秒
});
console.log(grant.grantId, grant.auditId);
```

此入口直接返回 grant；顶层 `delegateToken` 仍返回 `QoniResponse`，token 在
`response.data.token` 中。交互式模式直接返回授权请求；用户同意后，在服务端回调
用 `completeDelegateToken()` 兑换 token。`agentKey`、`userId` 分别兼容 `agent`、
`user.id`；同时提供两个 Agent 标签时必须一致，顶层 `userId` 保持原有的优先级。
有效期支持整数秒或整数 `s/m/h/d` 时长，
范围为 60–86400 秒。这些新增能力已随 `@qoniai/qoni@0.8.0` 发布到 npm。

旧版 `mailbox.*`、`web.search`、`web.extract` scope 和 `deniedScopes` 不受支持，SDK 会拒绝，不会将它们
扩展成更宽的产品权限。产品 scope 不限制发送、删除邮件；任务描述不能代替禁止策略。

## Scope 怎么选

每个 WebAgent 产品有两个产品 scope：`read`（状态、事件、产物）与 `manage`（发起、取消、普通交互应答、消息、监控的增删改）。产品 `manage` 不包含浏览器连接、刷新和交还。产品 scope 共 8 个：`webagent.{do_anything, web_search, deep_research, track}:{read, manage}`。浏览器接管另外需要 `QoniScopes.BROWSER_USE_TAKE_CONTROL`（`webagent.browser_use:take_control`）；交互式站点登录需要 `QoniScopes.SITE_LOGIN_REQUEST` 和 `QoniScopes.SITE_LOGIN_CONFIRM`。这些独立权限必须在 `scopes` 中显式申请。`products` 简写只会将每个产品名展开为该产品的 `read` + `manage` 一对：

```ts
await qoni.delegateToken({
  user: { id: userId },
  products: ["doAnything", "webSearch", "deepResearch", "track"],
  scopes: ["gumem.memory:read"], // 可以和细粒度 scope 并用
});
```

scope 字符串在发请求前就会本地预检：漏掉服务前缀（比如写成 `do_anything:manage` 而不是 `webagent.do_anything:manage`）会立即抛出 `QoniValidationError`，错误消息里带正确写法；短写法有歧义时列出全部候选（`profile:read` → `gumem.profile:read` 或 `user.profile:read`）。

浏览器接管、站点登录、用户 Profile、支付和 Agent 邮箱的 scope（`QoniScopes.BROWSER_USE_TAKE_CONTROL`、`SITE_LOGIN_*`、`USER_PROFILE_READ`、`USER_PROFILE_WRITE`、`USER_PAYMENT_USE`、`AGENT_MAIL_READ`、`AGENT_MAIL_SEND`）不属于任何产品组合：需要在 `scopes` 中显式申请，并在 AccessKey 权限策略中允许。对应 Console 变更已加入独立的浏览器接管和站点登录策略；申请新委托前，确认 GenAuth 和 Console 已支持这些权限。用户 Profile、支付和 Agent 邮箱这几个常量只是 scope 名称：申请它们本身不会让任务获得 Profile、支付或邮箱能力。

需要让授权边界直接出现在业务代码里时，使用显式 scope 字符串。

| 场景 | 推荐 scope | 用户能理解的描述 |
| --- | --- | --- |
| 读取用户记忆 | `gumem.memory:read` | Agent 可以读取与你相关的历史偏好。 |
| 创建 GUMem 会话并召回上下文 | `gumem.memory:read`, `gumem.memory:write`, `gumem.message:write` | Agent 可以为当前用户创建记忆会话、写入消息并召回上下文。 |
| 写入任务结果 | `gumem.message:write`, `gumem.action:write` | Agent 可以把本次确认过的结果写回 GUMem。 |
| 搜索公开网页 | `webagent.web_search:read`, `webagent.web_search:manage` | Agent 可以搜索公开网页并读取结果。 |
| 执行网页任务 | `webagent.do_anything:read`, `webagent.do_anything:manage` | Agent 可以执行有边界的网页任务、读取进度、停止任务和响应普通交互；浏览器接管需要独立权限。 |
| 创建长期监控 | `webagent.track:read`, `webagent.track:manage` | Agent 可以配置监控、读取事件、立即运行检查，并停止监控。 |
| 在任务中登录网站 | `webagent.site_login:request`, `webagent.site_login:confirm` | 用户在实时浏览器里亲自登录，登录状态保存后供之后的任务复用。 |
| 用户接管浏览器 | `webagent.browser_use:take_control` | 用户连接、刷新和交还当前浏览器。需要显式申请，产品 manage 不包含此项。 |
| 使用用户 Profile | `user.profile:read`, `user.profile:write` | 普通 Task 适配器只读写获准的姓名、地址及支持的未加密基本类型自定义字段；手机号/邮箱验证、支付/卡片及其他敏感资料不在范围内。 |
| 用用户保存的卡支付 | `user.payment:use` | 用户允许一笔支付后，替用户填入已保存的信用卡。 |
| 使用 Agent 自己的邮箱 | `agent.mail:read`, `agent.mail:send` | Agent 可以读取发到自己邮箱的邮件（例如验证码），并用它发送邮件。 |

接管使用 `QoniScopes.BROWSER_USE_TAKE_CONTROL`，不包含在 `products` 简写中。升级到对应后端时，AccessKey 策略和用户委托都需明确包含此权限；旧 `webagent.do_anything:control`、`webagent.deep_research:control`、`webagent.browser:control` 不会自动转换。刷新和交还也要求该权限。此权限适配不代表旧卡校验或登录态可靠保存已完成。

### 浏览器接管权限迁移

这是尚未发布的破坏性变更，需要协调切换：旧 Web Agent 的交还接口要求产品 `manage`，新 SDK 交还时只申请 `webagent.browser_use:take_control`；新 Web Agent 则拒绝用 `manage` 代替独立接管权限。逐端顺序升级不能保证已有接管会话零中断。

1. 先准备 GenAuth 权限登记和 Console 的 **WebAgent 浏览器接管**、**WebAgent 网站登录**策略。按实际需要更新 AccessKey 允许列表；网站登录策略包含 `webagent.site_login:request` 和 `webagent.site_login:confirm`。
2. 显式申请 `QoniScopes.BROWSER_USE_TAKE_CONTROL`，通过交互式委托重新取得用户同意。需要登录时再加入登录权限；不得因更新 AccessKey 策略或续签现有委托，自动给用户原授权增加权限。
3. 在维护窗口停止接入新的接管任务，用旧版本完成或排空已有接管会话，再协调切换 Web Agent 与 SDK；不得增加 `manage` 兼容放行。
4. 验收新同意权限下的连接、刷新和交还，并验证缺少该权限或只有旧 control 权限的委托被拒。新 Console 会单独列出所选策略未覆盖的权限，包括旧权限、未知权限和不完整的策略权限组合，默认保留，只有勾选“保存时移除这些权限”才会删除；保存后核对 AccessKey 允许列表。保留旧 control 不会获得 `webagent.browser_use:take_control`，调用方仍需迁移到独立接管权限。

部署与发布仍须 Owner 另行明确指令；本迁移说明不授权部署或发布。

### 原始浏览器接管调用

完成策略和用户同意迁移后，`doAnything.api.intervene()` 接收 `interactionId`（wire 别名 `interaction_id`）。刷新和交还必须带上该接管轮次开始时保存的 ID。只有没有活动接管 marker 的首次主动 `take_control` 可以省略；重新连接已有轮次必须准确匹配 ID。新 Web Agent 的 take/refresh 响应会返回 `interaction_id`，应保存该原始响应字段，不从 URL 推导，也不查询新卡来替换。

```ts
import type { DoAnythingControlResponse } from "@qoniai/qoni";

// 仅用于没有活动接管轮次时，用户主动发起的首次接管。
const first = await qoni.doAnything.api.intervene<DoAnythingControlResponse>({
  token, runId: run.id, kind: "take_control",
});
const interactionId = first.data.interaction_id;
if (!interactionId) throw new Error("后端未返回本轮接管 ID；停止操作并完成迁移");

// 该轮 URL 需要刷新时：
await qoni.doAnything.api.intervene({ token, runId: run.id, kind: "refresh_control_url", interactionId });
// 用户交还该轮浏览器时：
await qoni.doAnything.api.intervene({ token, runId: run.id, kind: "release_control", interactionId });
```

ID 缺失、已结束/过期或不匹配时，Web Agent 在副作用前返回 HTTP 409。SDK 原样抛出拒绝，不读取当前 ID 或换 ID 自动重试。界面应让旧窗口失效，用户基于新收到的交互另发动作；旧 `ControlSession` 和 handle 仍绑定原卡。卡片方法继续使用声明动作路径中的 ID。`requestId` 是输入问题编号，不是接管轮次 ID。双别名不同值或显式非字符串/空 ID 会在 HTTP 前抛出 `QoniValidationError`；省略 ID 仍透传给服务端执行与状态有关的校验。

低风险能力通常可以静默授权，例如读取当前用户自己的 GUMem、写入本次会话摘要、搜索公开网页、读取普通任务结果。

高风险能力建议显式授权，例如接管浏览器、请求或确认外部站点登录、创建长期监控、提交表单、读取浏览器画面/录屏/附件/研究产物等敏感内容。

原始 `answer_input_request` 和 `skip_input_request` 调用必须用 `requestId`（wire 为 `input_request_id`）指向当前待处理的问题。Web Agent 会核对持久化的问题、等待状态、期限及声明动作，旧卡或未声明动作返回 409；SDK 不替换 ID 或重试。确认和登录交互应使用其声明的方法，不能将普通 answer/skip 当作批准或登录成功。

本次后端变更中，卡片 `connect_control` 返回 pending 接管轮次。OBO/API key 调用方不能通过传 `surface: "console_inline"` 将其变为 active Console 连接；交还这样的 pending 轮次仍会保留登录/凭据问询。下文未发布的任务登录策略通过声明的 `open_login` 和 `confirm_signed_in` 完成可靠保存、交还和回复，仅有 connect 的卡片不能代替这套流程。真实登录仍由 Agent 核验；部署须 Owner 另行指令。

SDK 也导出了常见 GUMem 会话、写入、召回场景的 scope bundle：

```ts
QoniScopeBundles.GUMEM_SESSION_RECALL
```

## 能力示例

### 内部 Pi 宿主记忆入口（Unreleased）

本地构建新增 `createTaskClient`，供现有 Pi 宿主使用。应用层 Quickstart 继续使用
DoAnything 与交互，不直接调用记忆或 Profile。新 task facade 归档必须显式选用，
现有 current_task 联调冻结包仍是独立输入。

```ts
import { createTaskClient } from "@qoniai/qoni";

const task = createTaskClient({
  productHosts: { gumem: trustedHosts.gumem },
  runId: trustedRunId,
  tokenProvider: getCurrentRunPermission,
});
await task.memory.createSession();
await task.memory.addMessages({
  messages: [{ id: `${piSessionId}:${entry.id}`, role: entry.role, content: entry.content }],
});
```

宿主传入可信服务地址、稳定 run ID 和
`getCurrentRunPermission(product, requiredScopes, runId, signal)`。provider 每次请求
核对当前许可，返回 `{ accessToken, expiresAt }`；到期时间是 Unix 毫秒，必须为未来有限值。
入口不需要 AK/SK，只暴露 `memory.createSession` 与 `memory.addMessages`，绑定
`qoni-run-<runId>`。run ID 完整保留，最多 55 个 Unicode 字符，拒绝路径分隔符；
run 与消息 ID 都拒绝 C0/C1 控制字符和 DEL。消息必须包含稳定非空 `id`、GUM 字符串
`role`（非空）和字符串 `content`。role/content 必须是完整 Unicode，合法 pair、空白、换行
与空 content 原样保留。类型和运行期都拒绝身份、token、header、path 等覆盖。
全批同步校验通过即绑定 ID；同一客户端已提交过的 ID（包括尚未发出的批次）不能改
content/role。provider 拒绝或 HTTP 发出前超时也保留绑定，原内容可显式重试；坏批次不绑定 ID。

`timeoutMs` 默认 30 秒，覆盖 provider、HTTP 和响应 body；每次调用的 `signal` 可取消所有阶段。
服务地址只接受 HTTPS，隔离夹具允许 loopback HTTP；保留 base path，拒绝跟随重定向。
每次请求重新取得当前许可，没有 POST 自动重试。不可变有序批次使用稳定的内部
`X-Request-ID` 复用现有 usage outbox 去重；改组或重叠批次不代表完整 exactly-once。
返回沿用 `QoniResponse`，只含 Session 字段或 `{ request_id, message_count }`；typed Qoni
errors 不包含 provider/HTTP 原始私密正文。

方法限制不等于资源服务器鉴权。G6/WA 可信 token 来源、GUM run/session 资源限制、Pi 持久
游标/恢复、真实 Pi/E2B 与离线验收仍是依赖；provider/loopback 测试不能证明后台可靠记忆。

### GUMem

```ts
await qoni.gumem.createSession({
  token,
  userId,
  sessionId: "daily-assistant",
  title: "日常助手记忆",
});

// 你的业务已经向用户收集并确认了这条偏好。
const confirmedPreference =
  "请保持每日计划建议简洁，只给出下一步行动。";

await qoni.gumem.addMessages({
  token,
  sessionId: "daily-assistant",
  messages: [
    {
      role: "user",
      content: confirmedPreference,
    },
    {
      role: "assistant",
      content: `已保存用户确认的偏好：${confirmedPreference}`,
    },
  ],
});

const context = await qoni.gumem.recall({
  token,
  sessionId: "daily-assistant",
  query: "这个用户下一个任务需要考虑哪些已经确认的偏好？",
  details: true,
});

// 将 context.data 传给你自己的助手回复生成、任务规划或产品逻辑。
// SDK 示例到这里结束，因为应用编排由你的业务决定。
```

**待发布的召回映射变更：** `metadataFilters` 会放入 `recall_config.metadata_filters`。顶层及嵌套 camel/snake 别名只有在重复值相同时才合并，冲突会在 HTTP 前抛出 `QoniValidationError`。过滤值仅允许字符串、有限数字或布尔值；null、对象和数组会被拒绝。`project_id`、`group_id`、`user_id`、`thread_id`、`session_id`、`scope`、`expired_at`、`validity` 及其归一后的别名是系统保留字段。其他召回配置键保持原样透传。这只保护 SDK 调用，不表示服务端隔离已修复或跨任务召回已验收。

### 召回后启动任务（待发布）

通过 `runWithMemory` 明确选择在 Do Anything 创建 Task 前召回有限记忆。
沿用同一原 delegation token，它须具有 `gumem.memory:read` 和
`webagent.do_anything:manage`；两资源分别走既有交换。只有 WA 产品权限的
JWT 无法取得 GUM 读取权限。

```ts
const { run, memory } = await qoni.doAnything.runWithMemory({
  token: delegationToken,
  prompt: "参考我已确认的偏好，规划下一次旅行。",
  memory: {
    sessionId: "daily-assistant", // 已有 GUM Session，不是 WA Session ID
    query: "已确认的旅行偏好",
    metadataFilters: { namespace: "travel" },
    maxItems: 12,
    maxContextBytes: 8192,
  },
  timeoutMs: 30_000,
  // signal: abortController.signal,
});
console.log(run.id, memory.items, memory.truncated);

// 应用自行拼装输入时，可以只获取受限上下文：
const { data: context } = await qoni.gumem.recallContext({
  token: delegationToken,
  sessionId: "daily-assistant",
  query: "已确认的旅行偏好",
});
```

原 `run()` 行为不变，零记忆保持原 prompt。召回失败、无效响应、超时或提交前
取消都会阻止 Task POST；默认整段期限为 30 秒，允许 1..60000ms，写请求不自动
重试。`runWithMemory` 错误通过 `phase`（`recall`、`task_permission`、
`task_submit`）和 `submissionUnknown` 区分阶段。Task POST 已派发后，超时、
断连、取消或无法使用的成功响应会抛出 `QoniTaskSubmissionUnknownError`：
`code: "task.submit_unknown"`、`phase: "task_submit"`、
`submissionUnknown: true`、`retryable: false`，不附带原始 cause 或请求正文。
应先核对原请求的服务端结果，不能盲目重发。未派发 POST 时
`submissionUnknown` 为 `false`；调用者取消返回安全的 `request.aborted`，
不原样返回任意 signal reason。HTTP 4xx 响应及成功 HTTP 响应内的明确业务拒绝保留原类型、code、status 和 retryable；已派发后的真实 HTTP 5xx 均为提交未知且不可自动重提。
进入 fetch 后，即使连接被拒绝也保守判为未知；这不证明服务端已收到或创建 Task，也不允许自动重试。
这里的取消不会撤销已经创建的 Task。

`recallContext()` 返回 `QoniResponse<MemoryContext>`；从 `.data` 读取
`origin`、typed `items`、受限
`referenceText` 和 `truncated`。默认 12 条 / 8192 UTF8 字节；允许 1..32 条 /
512..16384 字节。只将 facts、summary 和 user/assistant 历史正文作为引用资料；
不拼入 working memory、`formatted_context`、工具通道或任意 metadata，省略
授权形态的值。引用资料不授予权限或批准；引用格式不构成模型 prompt 注入保证。

历史来源保留实际 message `id`、GUM `sessionId`；若实际 `metadata.source_url`
已有受限安全 HTTP(S) 值，则按原字符串放入可选 `url`。这是调用方已存的消息来源，
不是事实可信性证明。不得按正文匹配链接，`resource_urls` 保留媒体资源用途。
配套 A1 r2 后端投影可使 facts/summary 带 `recordId`、`engine` 和
`raw_input` 来源（`id`、`sessionId`、`messageId`、`createdAt`、可选原存储
`url`），对应 `sourceStatus: "record_id"`。`memory_records_coverage` 确认完整
覆盖后，typed 记录才可替换非空 legacy 段；缺少覆盖证明时保留完整 legacy 段，
`sources: []`、`sourceStatus: "unavailable"`，不按相同正文归属来源。
条数/字节预算先保正文，来源整组保留或整组省略；身份、来源或正文有损失时
`truncated` 为 true。旧后端仍可返回无来源 facts/summary。既有
project/user/scope=user 语义路径保持，原存储缺 URL 不能靠响应字段修复。本地 GA/HTTP/PG/Qdrant 证据不
外推为托管向量、抽取 worker、Pi/云或生产验收；原 GUM 有效期过滤限制单列。

上述标记仅用于修订候选的 `runWithMemory`；普通 `run()` 和旧包可能没有这些字段，
缺字段绝不意味着写入可以安全重发。见[修订记忆错误示例](./docs/delivery-examples/m2-r2/README.zh-CN.md)。

### Do Anything

```ts
const run = await qoni.doAnything.run({
  token,
  prompt: "打开 https://en.wikipedia.org/wiki/Solid-state_battery ，总结它相对锂离子电池的主要优势。",
  browserProxy: {
    proxyId: "sg-static", // 服务端代理注册表 ID；这里绝不传凭据
    mode: "scoped",       // off | all | scoped
    region: "ap-southeast-1",
  },
});

const status = await run.status(); // 刷新并返回当前状态
await run.cancel("用户停止任务"); // 幂等
```

`browserProxy` 只影响新建的 Browserbase 会话。`region` 选择 Browserbase
计算区域，注册代理决定网络出口。SDK 只接受代理 ID、模式和区域；代理账号密码由
运维人员在 OpsConsole 管理。

### 个人 Agent：对话、浏览器和电脑（0.10.0）

每个对话（一个 Do Anything session）都有自己的一台电脑。下面所有方法都传这个人的委托 `token`；
读要 `webagent.do_anything:read`，改要 `webagent.do_anything:manage`。

**任务进行中**，事件流告诉你该显示什么：

```ts
await run.wait({
  onEvent(event) {
    switch (event.type) {
      case QoniEventTypes.Message:   // 流式回答：同一个 id，text 是到目前为止的全文，delta 是新增的一段
        ui.upsertBubble(event.data.id, event.data.text, { done: event.data.done, final: event.data.final });
        if (event.data.done && event.data.stopReason && !/^tool/i.test(event.data.stopReason)) ui.settled();
        break;
      case QoniEventTypes.Browsers:  // 现在开着的所有浏览器：主 Agent 的在前，然后是每个子 agent 的
        ui.showScreens(event.data);  // [{ id, label, url, status, activity, need, userInControl, startedAt }]
        break;
    }
  },
});
```

`url` 是浏览器可操作的实时画面，直接放进 iframe。子 agent 的 `need` 不为空时，它在等人
（`login`：在那块屏上登录；`help`：照 `prompt` 做）；处理完用
`browsers.control({ token, sessionId, browserId, action: "done" })`（也可 `take` / `release` / `skip`）。

实时画面默认是电脑桌面缩小后的样子。在人自己动手的那块画面（登录、`need`）里，给地址加上 `&fit=1`（放在 `#` 前面）：
这块画面开着时，浏览器按它的形状排版，手机竖着拿就是铺满的手机版网页；画面关掉，浏览器回到原来的大小。
画面开着时 Agent 也在这个形状下干活，所以只是看 Agent 干活的画面别加。

**任何时候**，不用开任务：

```ts
const { doAnything } = qoni;
await doAnything.sessions.list({ token });                     // 对话列表，新的在前
await doAnything.sessions.credits({ token, sessionId });       // 每次任务花了多少
await doAnything.browsers.list({ token, sessionId });          // 现在开着的浏览器（电脑休眠时为空）

await doAnything.files.list({ token, sessionId, path: "workspace", depth: 2 });
// → { source: "live" | "saved" | null, items: [{ path, name, type, sizeBytes, modifiedAt }], savedAt }
const bytes = await doAnything.files.read({ token, sessionId, path: "workspace/outputs/report.md" });
for await (const change of doAnything.files.watch({ token, sessionId, signal })) {
  // { type: "created" | "changed" | "removed", path }，约 2 秒内送到；电脑休眠时结束
}
await doAnything.files.upload({ token, sessionId, path: "workspace/uploads/brief.pdf", content: bytes });
await doAnything.files.move({ token, sessionId, from: "a.md", to: "notes/a.md" });
await doAnything.files.mkdir({ token, sessionId, path: "notes" });
await doAnything.files.delete({ token, sessionId, path: "notes/old.md" });
await doAnything.files.listAll({ token });                     // 每个对话保存下来的文件

await qoni.workspace.credits({ token });                       // { available: 123 } 整数 Credits，不计费时为 null
qoni.workspace.billingUrl({ token });                          // 控制台直接打开「充值」的地址（{ section: "plan" } 打开套餐）
await qoni.proactive.list({ token });                          // Agent 约好的回访
await qoni.notifications.list({ token });                      // { items, unread }；需要 webagent.track:read
```

看文件不会唤醒休眠的电脑：答案来自每轮结束后保存的那份（`source: "saved"`）。改文件会唤醒它，
空闲后它会自己再休眠。路径都相对电脑的家目录，隐藏的运行时状态一律拒绝；上传不会覆盖已有文件
（409 `workspace_file_exists`）。任务失败时 `RunResult.failureReason` 说明原因，
`insufficient_credits` 表示该充值了。Agent 要发它自己写的邮件时，确认卡带着
`interaction.payload.mail`（`{ to, subject, text }`），就是要发出去的那封。

### Web Search

```ts
const search = await qoni.webSearch.run({
  token,
  prompt: "欧盟电池回收法规 2026",
  maxResultsPerQuery: 5,
});

const result = await search.wait();
console.log(result.output); // 搜索结果
```

### Deep Research

```ts
const research = await qoni.deepResearch.run({
  token,
  prompt: "欧盟电池回收行业 2026 年现状",
  depth: "standard", // light | standard | deep —— 调研深度，主要的旋钮
  limits: { maxDurationMinutes: 120 }, // 墙钟上限，跑超自动终止
});

const report = await research.wait();
for (const artifact of report.artifacts) {
  fs.writeFileSync(artifact.name ?? artifact.id, await artifact.content());
}

// 追问：起一个继承前序上下文的新 run。
const followUp = await qoni.deepResearch.run({
  token,
  prompt: "再对比一下 2025 年的数据。",
  session: research.sessionRef,
});
```

`doAnything.api.readArtifacts()` 及导出类型 `DoAnythingSnapshot`、`SnapshotImage`、
`SnapshotAction` 已 deprecated：该结构化快照契约从未有后端路径或字段来源。
方法本地抛 `QoniUnsupportedError(code: "unsupported.operation")`，零 HTTP。
文件请用 `qoni.doAnything.artifacts({ token, runId })` / `api.listArtifacts()`，下载用 `artifact.content()` /
`api.artifactDownloadUrl()`；图片请开启 `capture: { screenshots: true }` 并读取
screenshot events。文本文件不是 snapshot，真实文件 artifacts API 保持。

### Track

Track 使用真实 `/track/tracks`。`prompt` 原样映射到 `instructions`，目标 URL
请明确写在描述中。必须显式指定 schedule：整数 600–2592000 秒 interval，或带
时区的 daily。daily 在目标时间前 0–30 分钟启动，不保证整点启动。

```ts
import type { MonitorSchedule } from "@qoniai/qoni";

const monitor = await qoni.track.create({
  token,
  prompt: "监控 https://example.com/policy 并报告变化。",
  title: "政策变化",
  schedule: { kind: "interval", intervalSeconds: 3600 },
}); // create 立即启动 first_look 首次检查
const initial = await monitor.get();
const firstRunId = initial.lastTaskId; // 只捕获一次原始首检 ID
if (typeof firstRunId !== "string" || !firstRunId) throw new Error("缺少初始 lastTaskId");
const sameMonitor = await qoni.track.attach(monitor.id, { token });

async function waitForCheck(runId: string) {
  const deadline = Date.now() + 300_000;
  do {
    const check = await monitor.run(runId); // 在最近 50 条中按原始 ID 精确查找
    if (["done", "failed", "expired", "canceled"].includes(String(check.status))) {
      if (check.status !== "done") throw new Error(`检查 ${runId} ${String(check.status)}：${String(check.failure ?? "")}`);
      return check;
    }
    await new Promise(resolve => setTimeout(resolve, Math.min(1000, Math.max(0, deadline - Date.now()))));
  } while (Date.now() < deadline);
  throw new Error(`检查 ${runId} 超时`);
}

try {
  await monitor.pause(); // 停止未来调度，已经启动的首检继续
  await waitForCheck(firstRunId);
  await monitor.refine({ schedule: initial.schedule as MonitorSchedule }); // 本次已校验的已知输入可 roundtrip
  await monitor.refine({ schedule: { kind: "daily", at: "09:00", tz: "Asia/Singapore" } });
  const task = await monitor.runNow(); // 调度暂停时，显式手动执行一次
  const check = await waitForCheck(task.runId); // 202 接受不等于完成
  const checks = await monitor.runs({ limit: 10, offset: 0 });
  await monitor.resume();
} finally {
  await monitor.delete(); // 软删除；仍在运行的检查继续
}
```

create 会立即启动一次 `first_look` 首检。只捕获一次初始 `lastTaskId`，等待
同一个首检结束，再显式调用一次 runNow。并发启动其他任务仍可能导致 409，SDK
原样抛出，不隐式重试。pause 只暂停未来调度，已经启动的检查继续。

Track check.status 为 `running/done/failed/expired/canceled`，成功终态是 **done**，
原样保留，区别于单次 RunResult.status 的 succeeded。读回已知 wire schedule 形状
时不重新套用 SDK 写入边界或 Intl 时区校验；未知/不完整形状原样保留。写入仍严格
校验，请选择支持的输入，不要把任意服务端 schedule 强制 cast 后重写。

`runs()` 查询后端最近 50 条 checks，再在本地应用 limit/offset；`run(id)` 只在
同一窗口按精确 run_id 查找，未找到抛本地 `QoniError(code: "not_found")`（没有 HTTP status）并说明范围；Track 本身不存在是后端 404 `track_not_found`。
检查保留真实 status/outcome/headline/answer/failure，不补造 extracted、diffs 或
snapshotId。早前任务仍在运行时，`runNow()` 会原样抛后端 409 `task_in_progress`；
成功只返回真实任务引用，完成与否需要再读 checks。

| 保留的方法或输入 | 当前行为 |
| --- | --- |
| `track.create`、`attach`、`MonitorHandle.get` | 创建/读取真实 Track；get 转换已知 schedule 形状，未知形状原样保留。 |
| `MonitorHandle.pause`、`resume` | PATCH status 为 paused / active；pause 不停已启动的检查。 |
| `MonitorHandle.refine` | 仅修改 title/schedule；改 prompt/instructions/intent 需新建 Track。 |
| `MonitorHandle.runNow` | POST run_now，返回真实任务引用。 |
| `MonitorHandle.runs`、`run` | 仅以 Track read scope 读取最近检查，不回退到 DoAnything。 |
| `MonitorHandle.delete` | DELETE204 软删除停止调度，不取消正在运行的任务。 |
| `track.api.createMonitor`、`getMonitor` | 保留旧方法名；真实字段为 instructions/title，wire schedule 为 `{ every_seconds: N }` 或 `{ daily_at: "HH:MM", tz }`。 |
| `track.api.updateMonitor` | PATCH 真实 title/instructions/schedule/status；低层可改 instructions，高层 refine 不允许。 |
| `track.api.runNow`、`deleteMonitor` | 真实 run_now / DELETE；wire 任务引用 / 空 204。 |
| `track.api.listRuns`、`getRun` | 原始 checks，本地分页，精确查找最近 50 条。 |
| `MonitorHandle.events`、`track.api.events`（0.10.0） | 读 Track 自己会话的事件流 `/do_anything/sessions/{session_id}/events`，每次检查一个 run。 |
| `interactionHandle`、`intervene` | deprecated，无后端路径，本地 QoniUnsupportedError，零 HTTP/零 token exchange。 |
| `targetUrls`、`extractionSchema`、`triggerDsl`、`stopConditionDsl`、`notifyChannel`（含 snake_case 别名）、旧 `url` | 无对应字段，本地 QoniUnsupportedError；URL 需明确写入 prompt。 |
| cron schedule | deprecated，本地明确拒绝并给出 daily 替代，不默默转换任意 cron。 |

无 schedule、非法 interval/时间/时区/分页等输入在 HTTP 前抛 `QoniValidationError`。
旧类型导出与 cron 分支保留并标记 deprecated；值为 undefined 的可选键保持省略行为，有值的不支持字段仍拒绝；unsupported 负例不算能力正例。

### 原 Task 本人的普通 Profile（待发布）

`doAnything.profile.read({ runId, token, fields })` 和
`doAnything.profile.update({ runId, token, values })` 返回 `QoniResponse<OrdinaryTaskProfile>`，
结果从 `.data.values`、`.data.missing`、`.data.writable_fields`、`.data.field_types` 读取。
原委托除了所需 Web Agent scopes，还需明确申请 `user.profile:read`；确实需要保存时才申请
`user.profile:write`。新 token 不能扩大旧 Task 的原授权。这是原 Task 本人的普通资料，
不等同管理员用户管理或浏览器登录态。

字段以[实际白名单与写入限制](./docs/ordinary-task-profile.md)为准。写入结果未知时按原 run 读回，
不自动重放 update；普通表单 submit 本身不会保存 Profile。

### GenAuth 用户上下文与用户管理

```ts
const client = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
});

const profile = await client.genauth.userInfo({
  accessToken: process.env.GENAUTH_ACCESS_TOKEN!,
});

const users = await client.genauth.users.list({
  page: 1,
  limit: 20,
});

const created = await client.genauth.users.create({
  username: "sdk-demo-user",
  password: process.env.GENAUTH_DEMO_USER_PASSWORD!,
});
```

`currentUser`、`genauth.userInfo` 使用 GenAuth access token 读取已登录用户身份。`genauth.users.*` 也属于管理面能力，但业务代码仍然用 Qoni AK/SK 初始化 SDK：SDK 会签名请求 `POST /api/v3/eak/genauth/admin-token`，请求体是空 JSON `{}`，拿到标准 GenAuth management token 和 `userPoolId`，再携带 `Authorization: Bearer ...` 与 `x-authing-userpool-id` 调用 GenAuth v3 用户管理 API。这里不传 `resource`、`actions`、`expiresIn` 或 `QONI_USER_ID`。GUMem/WebAgent/Track 等运行时能力才使用 `delegateToken` 返回的 token。

### GenAuth 用户注册与登录（Unreleased）

把用户送到 Qoni 托管的 GenAuth 注册/登录页，回调时在服务端用授权码换取用户与登录态。AccessKey 需要在 Qoni Console 绑定已登记的业务 App；业务 App 及其 client secret、PKCE verifier 和 nonce 只在服务端，不出现在 URL 里。

```ts
// 1. 发起：state 存进你自己的会话，再把浏览器重定向过去。
const state = crypto.randomUUID();
session.loginState = state;
const { url, expiresAt } = await qoni.genauth.auth.createLoginUrl({
  redirectUri: "https://app.example.com/auth/callback", // 业务 App 已登记的回调（精确匹配）
  state,
  screen: "signup", // 可选，默认 "login"
});
res.redirect(url);

// 2. 回调：先自己核对 state——SDK 不替你校验。
if (typeof req.query.state !== "string" || !session.loginState ||
    req.query.state !== session.loginState || req.query.error !== undefined ||
    typeof req.query.code !== "string" || !req.query.code) return res.status(400).end();
// 多副本应用须使用原浏览器会话内的原子匹配/消费存储，见可编译 hosted-login 示例。
// 同一 state/code 不得兑换两次。
delete session.loginState;
const login = await qoni.genauth.auth.exchangeLoginCode({
  code: req.query.code,
  redirectUri: "https://app.example.com/auth/callback",
});
// login.user: { id, email?, phone?, name?, isNewUser }
// login.accessToken / login.idToken / login.expiresIn
```

- `expiresAt` 是创建 URL 时在服务端固定的截止时间（600 秒）。重开或刷新页面、二次认证、新浏览器会话都不会延长；过期后页面显示错误，或回调带 `error=access_denied`。
- 一个 URL 最多完成一次，一个授权码最多兑换一次。兑换失败、超时或响应丢失后，授权码不能再用：请重新调用 `createLoginUrl`。SDK 不会自动重试这两个调用。
- `isNewUser` 由 GenAuth 按本次登录中实际发生的注册判定：只有账号就是在完成这次登录的同一个托管页窗口里注册的，才为 `true`（同一浏览器会话、业务 App、用户池和最终用户；刷新页面、二次认证或在该窗口里重新登录后仍成立）。在另一个窗口登录同一账号、复用已有会话或已有账号都为 `false`。如果服务端无法把本浏览器会话里的注册对应到某个窗口，回调会带 `error=access_denied`，不会猜测。
- 错误统一抛出带类型的 `QoniError`：GA 业务失败是 HTTP 200 加错误信封（例如 `eak.hosted_login.code_invalid`、`eak.hosted_login.binding_mismatch`、`eak.credential.binding_mismatch`、`eak.hosted_login.business_app_unbound`，服务端未配置托管登录时为 `eak.hosted_login.unavailable`），SDK 会抛错而不是返回数据。用 `login.accessToken` 调 `genauth.userInfo` 可再次读取同一用户。

## API 概览

### Client

```ts
const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
  timeoutMs: 30_000,
});
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `accessKey` | `string` | 是（传 `webAgentHost` 时不需要） | Qoni Console 创建的 access key。 |
| `secretKey` | `string` | 是（传 `webAgentHost` 时不需要） | Qoni Console 创建的 secret key。 |
| `webAgentHost` | `string` | 否 | WebAgent 的地址。不持 AccessKey 的 App 不填 Key，改传 `webAgentGrant` 返回的 `grant.webAgentHost`（0.10.1）。 |
| `host` | `string` | 否 | 私有化或本地部署时可选的 Qoni Console/SDK 网关覆盖地址。 |
| `fetch` | `typeof fetch` | 否 | 自定义传输实现。 |
| `timeoutMs` | `number` | 否 | 单次请求超时（一次性请求覆盖连接、响应头及响应体；成功建立的 SSE 仅覆盖到响应头），默认 `30000`。 |

> **`timeoutMs` 不会限制长任务。** 它只作用于单次一次性 HTTP 请求（委托、`status()`、单个 POST）。事件流（`events()` / `wait()`）**不受它约束**——流的响应头一到，这个单次计时器就被清掉了,所以一个跑一小时的 Deep Research 在默认 30s 客户端超时下也能正常流式。要限制等待时长用 `wait({ timeoutMs })`；不传则 `wait()` 一直等到终态。`wait()` 超时**不会停止 run**——它在服务端继续跑，可以再 `attach()` 回去。

### 命名空间

| 命名空间 | 方法 |
| --- | --- |
| 委托授权 | `delegateToken`, `completeDelegateToken`；兼容别名：`delegateAgent`, `completeDelegateAgent` |
| GenAuth | `userInfo`, `jwks`, `discovery`, `introspectDelegationToken`, `auth.createLoginUrl`, `auth.exchangeLoginCode`, `agents.create/get/bind`（待发布）, `agents.activate`（0.10.0）, `users.list`, `users.get`, `users.getBatch`, `users.create`, `users.createBatch`, `users.update`, `users.deleteBatch` |
| GUMem | `createSession`, `addMessages`, `recall`, `recallContext`, `uploadResource`, `actions.record`, `actions.recall`, `actions.stream` |
| Do Anything | `run`, `attach` → `RunHandle`；显式 `runWithMemory`；`profile.read/update`（待发布）；`sessions.list/get/credits`、`browsers.list/control`、`files.list/read/watch/upload/move/mkdir/delete/listAll`（0.10.0） |
| Deep Research | `run`, `attach` → `RunHandle` |
| Web Search | `run`, `attach` → `RunHandle` |
| Track | `create`, `attach` → `MonitorHandle`；`list`（0.10.0） |
| Proactive（0.10.0） | `create`、`list`、`get`、`cancel`、`runNow` |
| Notifications（0.10.0） | `list`、`markRead` |
| Workspace（0.10.0） | `credits` |

三个任务型产品共用同一个句柄形态：

```ts
run.id
run.sessionRef                          // 传回 run({ session }) 复用会话
await run.status()                      // 刷新并返回当前状态
run.events({ onWireEvent?, onReconnect?, ...opts }) // 语义事件 + 可选原始遥测
await run.wait({ timeoutMs?, onEvent?, onWireEvent?, onReconnect?, onInteraction?, onScreenshot? })
run.interactionHandle(interaction)      // 带类型的 HITL 句柄（见下方「交互」）
await run.cancel(reason?)               // 幂等
```

`await run.wait(...)` 结算成一个 `RunResult`：

必须由 run-detail 响应确认终态。详情读取错误原样抛出，`wait()` 不会用 SSE 完成事件替代权威结果。
详情仍为非终态或缺少终态信息时，抛出可重试的 `upstream.failed`；可通过 `status()` 或重新 `attach()` 恢复。

`timeoutMs` 与 `signal` 会结束详情、交付物读取及 `onEvent`、`onWireEvent`、`onInteraction`、
`onScreenshot` 返回的 Promise 的等待，但不能抢占同步 JavaScript，也不能停止回调内部已启动的工作。
`onReconnect` 是同步遥测通知：返回值不被等待，返回的 Promise 的 rejection 也不被处理，因此不要传 async
回调；同步抛错会向上传播。重连退避等待仍可被 signal 或 wait 超时中断。

详情/交付物列表 GET 会接收 wait signal：wait 中止或超时时会中止请求、取消并释放响应体 reader。
客户端单次请求计时器也覆盖完整 JSON/NDJSON、二进制响应体及 HTTP 错误体读取。即使自定义 fetch 忽略
abort，SDK 也会取消其迟到响应体，不恢复结算或启动后续 run 请求；自定义传输须遵守 `RequestInit.signal`
才能停止其内部网络工作。停止 wait 既不会取消服务端 run，也不会创建替代任务；需要停止原 run 时须显式调用 `cancel()`。

```ts
interface RunResult {
  runId: string;
  status: "succeeded" | "failed" | "canceled";  // run 的交付状态
  output?: unknown;            // 最终答案 / 载荷（形状随任务而定）
  artifacts: Artifact[];       // 持久化 DoAnything 文件 / deepResearch 报告
  isTaskSuccessful?: boolean;  // 任务是否达成目标（与 status 不同）
  terminalReason?: string;
  failureReason?: RunFailureReason; // 失败原因，如 "insufficient_credits"（0.10.0）
  failureDetail?: string;
  raw: JsonObject;             // 完整 wire envelope——成本、步数、token 用量
}
```

每个 `Artifact` 暴露 `id`、`name?`、`mime?`、`sizeBytes?`、`createdAt?` 和 `content(): Promise<Uint8Array>`（懒加载字节）。其余方法都返回下文的 `QoniResponse<T>` 信封,`T` 是该调用的具体载荷类型（例如 `genauth.users.list` → `.data` 上的分页用户列表）。`T` 的精确形状见随包的 `.d.ts`，与后端契约一致。

`MonitorHandle`（Track）提供 `id`、`get()`、`pause()`、`resume()`、`refine(patch)`、`runNow()`、`runs()`、`run(runId)`、`delete()` 和 `events()`：Track 的检查实时进行中的事件——每次检查是这个 Track 自己会话里的一次 run，以它的 `done` 结束；流跨检查持续，直到你 abort（另需 `webagent.do_anything:read`）。deprecated 的 `interactionHandle()` 本地拒绝。

### 交互（HITL）

run 需要用户出手时会暂停，并发出一个 `interaction` 事件，`event.data` 是带类型的 `Interaction`。交互按「需要用户做什么」分类，和具体业务无关，所以一个处理函数就能覆盖所有任务：

| `type` | 用户要做的事 | 方法 |
| --- | --- | --- |
| `site_login` | 在实时浏览器里亲自登录某个网站 | `openLogin()`、`confirmSignedIn()` |
| `take_control` | 亲手操作浏览器（验证码、两步验证等） | `connectControl()`、`refreshControl()`、`releaseControl()` |
| `fill_form`（Unreleased）| 补全当前任务的普通字段 | `submit(values)`、`skip()` |
| `ask_user` | 回答一个问题，答案结构由 `answerType` / `options` 描述 | `answer()`、`skip()` |
| `confirmation` | 允许或拒绝一个操作 | `confirm()`、`reject()` |
| `wait` | 不需要做决定：系统在等待（限流、外部事件） | `retry()` |

本阶段未发布的 Pi 结构化问询与普通表单仅通过主代理入口提供；子代理遇到无法透传的结构化参数会明确拒绝。

`Interaction` 是按 `type` 分布的联合类型，`switch (request.type)` 之后每个分支里的 `request.payload` 会自动收窄。每个方法都 POST 到交互 `actions[]` 里后端声明的 endpoint，不需要写死路由：

本段处理函数所用 run 的 token，需要在准备 AccessKey 策略并取得用户同意后，申请 `products: ["doAnything"]` 并显式加入 `scopes: [QoniScopes.BROWSER_USE_TAKE_CONTROL, QoniScopes.SITE_LOGIN_REQUEST, QoniScopes.SITE_LOGIN_CONFIRM]`；产品权限提供 DoAnything manage，任务不需要登录时去掉登录权限。只有 `products: ["doAnything"]` 不能授权 `connectControl()`、`refreshControl()` 或 `releaseControl()`。切换版本前先按上文完成迁移。

任务创建时还须传 `taskScopes: [QoniScopes.BROWSER_USE_TAKE_CONTROL]`，只有委托 Token 含接管 Scope 仍不足以让任务发起接管。刷新控制地址不能扩大旧任务创建时固定的权限。

```ts
import type { InteractionHandle } from "@qoniai/qoni";

const handled = new Set<string>();

async function handleInteraction(handle: InteractionHandle) {
  const request = handle.interaction;
  // 创建、状态更新和断线回放都会回调：每个待处理的交互只处理一次
  if (request.status !== "pending" || handled.has(request.id)) return;
  handled.add(request.id);

  switch (request.type) {
    case "site_login": {
      const login = await handle.openLogin();   // 打开受控登录浏览器，返回实时画面 login.liveUrl
      await showToUser(login.liveUrl);          // 用户点「我已登录」后返回
      await handle.confirmSignedIn();           // 保存登录状态，Agent 复查后继续
      break;
    }
    case "take_control": {
      // 服务端提供开始接管时，connectControl() 返回签名后的控制地址
      const control = handle.can("connect_control") ? await handle.connectControl() : undefined;
      await showToUser(control?.liveUrl ?? request.payload.liveUrl);
      await handle.releaseControl();            // 把浏览器交还给 Agent
      break;
    }
    case "ask_user":                            // payload：{ question, answerType, options? }
      await handle.answer(await askUser(request.payload));
      break;
    case "confirmation":                        // payload：{ summary }
      if (await approve(request.payload.summary)) await handle.confirm();
      else await handle.reject();
      break;
  }
}

const result = await run.wait({ onInteraction: handleInteraction });
```

按每张交互卡的声明动作和当前状态处理；待回答的问题可以与接管轮次同时存在。SDK/OBO 的 pending 轮次与 Console active 轮次交还都不回答登录/凭据问询（current_task 下二者都是 `site_login` 卡）；登录问询只能由 `confirmSignedIn()` 可靠保存后结束、用户显式调用卡片声明的 `skip()` 或过期结束。仅历史遗留的 `secure_input` 卡在 Console active 交还时收到“请复查”答复，这也不证明登录或保存成功。澄清和确认永不自动作答。同一个交互在每次状态变化和断线回放时都会再次回调，`id` 和 `type` 始终不变——界面卡片请按 `request.id` 更新。带有新内容的更新会替换卡片（例如接管变成 `active` 时带来新的 `liveUrl`）；后端用空壳结束交互时，卡片保留原来的 `payload`。直接以 `active` 出现的 `take_control` 是用户自己发起的接管（例如在 Console 里），界面提供接管入口时再展示它。方法：`answer(value)`、`skip()`、`confirm()`、`reject()`、`openLogin({ siteId?, profileId? })`、`confirmSignedIn()`、`connectControl()`、`refreshControl()`、`releaseControl()`、`retry()`、`switchProfile()`。`connectControl()` 和 `refreshControl()` 返回 `{ liveUrl, expiresAt?, status?, raw }`，其中 `liveUrl` 是供用户打开的浏览器接管地址。`handle.can(kind)` 判断该交互当前是否提供这个动作；调用后端没声明的方法会抛错（所以「恢复」按钮只有在真能用时才出现）。

确认卡记录的是本张卡的决定，不能证明开放 browser/bash/harness 的所有最终动作都已强制批准。
普通表单不提供支付秘密录入或敏感值隔离通道。

### 普通表单（Unreleased）

`fill_form` 只收集当前任务需要的普通资料。按导出的 `FormField` 和 `payload.fields` 渲染控件；卡片声明 `submit` 时调用 `handle.submit(values)`。键名保持原 `field.name`，单选用 option `value`，数字保留 number，地址为 `{ line1, line2?, city?, region?, postalCode?, country? }`。必填文本/地址须非空；可选文本允许空字符串，`0` 合法。未知字段、错误类型/选项、NUL、非有限数在本地和后端当前持久卡上重复校验。

```ts
if (handle.interaction.type === "fill_form" && handle.can("submit")) {
  await handle.submit({ count: 0, method: "ship", address: { line1: "合成测试地址" } });
}
```

这里不写 Profile；敏感字段、payment_card 和 `profileField` 写入尚未接通。账号密码仍走浏览器登录/接管。需要配套 W4 后端；最终 W6 合成与供应商验收另行完成。

**`ask_user` 的回答是结构化的。** `answer()` 接收与 `payload.answerType` 对应的值：`text` → 字符串，`number` → 数字，`boolean` → 布尔，`single_choice` → 一个 `options[].value`，`multiple_choice` → 选项 value 数组；不匹配时在发送前就抛出 `QoniValidationError`。线上协议里这个类型仍叫 `clarification`，SDK 统一呈现为 `ask_user`（候选项是 `{ value, label }`）。

**登录只需两次 SDK 调用。** `openLogin()` 的 `siteId` 取自 `payload.sites[].siteId`，只列出一个站点时可以省略；`liveUrl` 仅展示给当前用户。用户登录完成后调用 `confirmSignedIn()`。

**未发布的 `current_task` 策略**要求后端在同一 DoAnything run 和原登录问题 L 上声明 open/confirm 接口。open 使用当前任务已有浏览器，不跳转或新开浏览器；`login.sessionId` 是固定控制轮次 C，与 `raw.control_interaction_id` 相同，`raw.browser_session_id` 才是浏览器 ID。open 申请 SITE_LOGIN_REQUEST＋BROWSER_USE_TAKE_CONTROL；confirm 申请 SITE_LOGIN_CONFIRM＋BROWSER_USE_TAKE_CONTROL＋DO_ANYTHING_MANAGE。先在 AccessKey 中允许这些策略并取得用户显式同意，再按上文协调迁移；manage 不能代替登录或接管权限。

SDK 在原声明接口发送一次 `{login_session_id:C}`，完成可靠保存、交还 C 和回复 L，不调用 Profile confirm，不另发二次 recheck。已弃用的 `login.confirm()` 共用这一次请求，返回 `state: "saved"、active: false、probeResult: "agent_pending"`，原响应保留在 `raw`。saved 只表示可靠保存，Agent 仍须核验页面再继续。mode 缺失/未知或 L/C 不符时失败关闭；没有成功 open 就 confirm 会在本地拒绝。409（包括 `no_pending_login`）保持失败，不自动换 ID 或重开。503 保存错误、超时/响应丢失和 `site_login.invalid_response` 保留原 L/C，允许显式重试；成功响应丢失后，只认后端精确的保存历史回执。

旧 `/profiles/login` 策略保持单 request/confirm scope、先 Profile 保存再通知 Agent 复查，以及既有 `active/probeResult` 和旧 `no_pending_login` 可复查语义。两种策略沿用 shared slot、并发共享与替换保护，旧结果不能确认新轮次。同一 RunHandle/MonitorHandle 的句柄共享会话，重新 `attach()` 的 RunHandle 不共享。应用继续使用 `openLogin()` → `confirmSignedIn()`，无需先调用 `login.confirm()`。

上面用到的判别字符串也都导出成了常量，避免裸写字面量：`InteractionTypes`（`SiteLogin` / `TakeControl` / `AskUser` / `Confirmation` / `Wait`；已弃用的 `Clarification` 现在等于 `AskUser`）、`InteractionStatuses`、`ActionKinds`（`handle.can(...)` 的动作名）。授权 scope 同样有：`QoniScopes`（每个单独 scope）、`QoniProductScopes`（`products` 语法糖展开成的 per-product `read`+`manage` 对）、`QoniScopeBundles`（精选 bundle）。用它们代替手写字符串：

```ts
import { InteractionTypes, ActionKinds, QoniScopes } from "@qoniai/qoni";

if (handle.type === InteractionTypes.AskUser && handle.can(ActionKinds.answer)) {
  await handle.answer("蓝色那个按钮");
}
```

### Wire 级逃生舱

可支持的低层方法保留在 `qoni.<product>.api.*` 下（如 `qoni.doAnything.api.createSession`、`qoni.deepResearch.api.followUp`、`qoni.track.api.createMonitor`）。这些方法直接镜像 wire 形状——snake_case 字段、双层 envelope 事件、run 操作统一走 `/{product}/runs/{run_id}` 单 ID 寻址——形状会随 API 演进变化，不在冻结的公开契约范围内。

原始 wire 事件类型（`run.action.started` 这种内部传输名，命名是历史遗留、也不一致）**不作为公开导出**——开发者按上面那套精选 `event.type` 匹配即可；极少数要精确 wire 的场景，`event.raw.event` 是个原始字符串，直接比对。

`QoniScopes.BROWSER_USE_TAKE_CONTROL` 用于前述浏览器接管交互方法和原始 take/refresh/release 调用。Site Login 的 scope（`QoniScopes.SITE_LOGIN_REQUEST`、`QoniScopes.SITE_LOGIN_CONFIRM`）用于运行交互上的 `InteractionHandle.openLogin()` 和 `confirmSignedIn()`。

### 返回结构

大部分 SDK 方法返回：

```ts
type QoniResponse<T> = {
  data: T;
  meta: {
    requestId?: string;
    traceId?: string;
    auditId?: string;
    service?: "qoni" | "genauth" | "gumem" | "webagent";
  };
};
```

句柄事件流（`run.events()`、`monitor.events()`）产出判别联合 `RunEvent`——匹配 `event.type` 后 `event.data` 就是该类型的固定形状：

```ts
// event.type → event.data：
//   简单事件 —— event.data 直接就是那个值(不用记字段名):
//     "progress"       string   —— 一句话进度
//     "phase"          string   —— Deep Research 阶段名
//     "sectionReady"   string   —— Deep Research 章节标题
//     "resultsReady"   number   —— Web Search 结果数
//     "monitorCreated" string   —— deprecated 的旧 monitor wire 类型
//     "triggered"      string   —— deprecated 的旧 monitor wire 类型
//     "checkCompleted" boolean  —— deprecated 的旧 monitor wire 类型
//   丰富事件 —— event.data 是个小对象:
//     "message"        { id, role, text, delta, done, final, stopReason? } —— 流式回答的各段共用一个 id
//     "browsers"       AgentBrowser[] —— 现在开着的所有浏览器（0.10.0）
//     "interaction"    带类型的 Interaction 对象（HITL）—— 见「交互」一节
//     "screenshot"     { pageUrl?, step? }   + 解码后的图在 event.image
//     "browserLiveUrlChanged" { liveUrl, supportsLivePump, forceViewerReload, providerSessionId? }
//     "done"           { output, succeeded, terminalReason }
// 公共字段:runId、at(ISO 8601)、isTerminal(仅 "done" 为 true)、raw(原始 wire 事件,逃生舱)。
```

每个产品的 handle 只含自己那一套（分型）：

| 产品 | `event.type` 集合 |
|---|---|
| Do Anything | 核心:`progress` / `message` / `interaction` / `screenshot` / `browserLiveUrlChanged` / `browsers` / `done` |
| Web Search | 核心 + `resultsReady` |
| Deep Research | 核心 + `phase` / `sectionReady`（大纲审批走 `interaction`） |
| Track（`MonitorHandle`） | `events()` 给出每次检查的核心事件（0.10.0），检查结束是该检查 `runId` 的 `done`，流不会因此结束。 |

展示实时浏览器时，监听 `browserLiveUrlChanged`，用 `event.data.liveUrl` 更新预览地址。任务执行期间可能切换标签页，因此不能只使用第一次收到的地址。`forceViewerReload` 为 true 时重载已有预览。live URL 可访问浏览器画面，不要写入公开日志。

断线会带 `Last-Event-ID` 自动重连续传；迭代器在终态事件后自动结束。
需要完整审计/可观测性证据时，`onWireEvent` 会在语义归一化和过滤之前收到每一个原始 SSE 帧；
`onReconnect` 会收到重试次数和最后事件 id。应用逻辑继续使用稳定的 `RunEvent`，原始回调只用于证据与诊断。

Wire 级流式方法（`qoni.<product>.api.events`）返回 `AsyncIterable<QoniEvent<T>>`：

```ts
type QoniEvent<T = unknown> = {
  id?: string;
  event?: string;
  data: T;
};
```

## 错误处理

所有 SDK 错误都继承自 `QoniError`，并尽量暴露 `code`、`status`、`requestId`、`traceId`、`auditId`、`retryable` 和原始响应 `body`。`code` 的类型是 `QoniErrorCode`（已知 SDK / 后端 code 加 `(string & {})`），既有字面量自动补全、可对已知集做 `switch (err.code)` 穷尽处理，又兼容后端新增的 code。

所有错误类都已导出，可用 `instanceof` 匹配：

| 类 | 触发时机 | 典型处理 |
| --- | --- | --- |
| `QoniUnsupportedError` | 保留表面没有后端操作（code: `unsupported.operation`），零 HTTP。 | 使用错误提示中的真实替代能力。 |
| `QoniValidationError` | 请求发出前的本地校验失败（scope 字符串格式错、silent 委托缺 user）。 | 按消息修正调用——消息里给出正确写法。 |
| `QoniAuthError` | AK/SK 签名被 Qoni 拒绝（凭据错误/已轮换）。 | 检查 `accessKey` / `secretKey`。 |
| `QoniPermissionDeniedError` | AccessKey 或 delegation token 缺少所需 scope（403）。 | 检查 AccessKey 权限策略，并在 `delegateToken` 中申请所需 scope。 |
| `QoniConsentRequiredError`（0.10.0） | 这个人没同意过、撤回了同意，或 Agent 现在要的比同意的多（它也是 `QoniPermissionDeniedError`；`code` 保留服务端原因）。 | 再走一次 `delegateToken({ mode: "interactive", … })` 授权页。 |
| `QoniTokenExpiredError` | delegation / 产品 token 过期。 | 仅恢复当前仍获准的访问；不能扩大旧 grant 或重放结果未知的写入。 |
| `QoniDelegationRequiredError` | 产品调用没带 `token`，或带的是网关不接受的裸 token。 | 把 `delegation.data.token` 传给产品调用。 |
| `QoniRateLimitError` | 被限流（429）。 | 安全读取可退避；写入结果未知时先按原操作对账。 |
| `QoniTimeoutError` | 请求（或 `wait({ timeoutMs })`）超时。 | 已有 run 可 `attach()` 或查状态；创建超时可能已提交，不能自动创建替代任务。 |
| `QoniTaskSubmissionUnknownError`（修订候选） | `runWithMemory` 已派发 Task POST，但没有明确结果。 | `task.submit_unknown`、`submissionUnknown: true`、`retryable: false`；核对原请求，不自动重发。 |
| `QoniUpstreamError` | 下游服务失败（5xx / 上游换 token 失败）。 | 先核对原写入结果；`retryable` 不能证明副作用已回滚。 |
| `QoniError` | 基类 / 其它 code。 | 看 `err.code`。 |

JSON 请求**不会自动重试**；`err.retryable` 表示错误类别，不是写入重放许可，SSE 重连另算。
202/`ready: false` 只是受理或等待，不能写成完成。保留原 run/provisioning/operation ID，
有查询接口时读回原操作；缺少回执、404 或时间经过都不能证明首次写入没有副作用。

用户在已支持的权限管理界面缩窄或撤销同意后，停止安排需要已移除 scope 的调用，并尊重后端拒绝。
不能静默重建更宽 grant、换用户/App 或刷新出额外权限；本候选没有 `genauth.consents.revoke()` SDK 方法。
停止本地等待也不等于停止服务端 Task 或证明外部操作已停止。见[失败处理示例](./docs/delivery-examples/README.zh-CN.md)。

```ts
import {
  QoniDelegationRequiredError,
  QoniPermissionDeniedError,
  QoniRateLimitError,
  QoniTimeoutError,
  QoniTokenExpiredError,
  QoniUpstreamError,
} from "@qoniai/qoni";

try {
  await qoni.webSearch.run({ token, prompt: "Qoni SDK" });
} catch (error) {
  if (
    error instanceof QoniPermissionDeniedError ||
    error instanceof QoniTokenExpiredError ||
    error instanceof QoniDelegationRequiredError
  ) {
    // 停止本次操作。确需新增权限时取得用户明确同意；不能静默扩大原 Task/grant。
  }

  if (
    error instanceof QoniRateLimitError ||
    error instanceof QoniTimeoutError ||
    error instanceof QoniUpstreamError
  ) {
    // 不在这里重复创建 run 或重放写入。已知 ID 时查询原操作；否则保留结果未知。
  }

  throw error;
}
```

常见首次接入错误：

| 错误 | 含义 | 下一步 |
| --- | --- | --- |
| `agent must be a string` | 当前线上 delegation API 期望 `agent` 是字符串 ID。 | 使用 `agent: "memory-agent"`，不要传对象。 |
| `eak.delegation.user_not_bound` | `userId` 不属于该 Qoni credential 绑定的 GenAuth userpool。 | 使用 `currentUser` 返回的真实用户 ID，或确认用户来自同一个绑定 userpool。 |
| `eak.delegation.no_allowed_scopes` | AccessKey 没有启用任何权限 scope。 | 在 Qoni Console 的 Permission scope 设置中启用本次调用所需的策略。 |
| `eak.genauth.userpool_binding_missing` | AK/SK 没有绑定 GenAuth userpool，`genauth.users.*` 无法换取 management token。 | 先把 Qoni credential 绑定到目标 GenAuth userpool。 |
| `eak.genauth.userpool_owner_missing` | 绑定的 GenAuth userpool 找不到可用于签发 management token 的 owner 用户。 | 修复 GenAuth userpool owner 数据或绑定。 |
| `eak.token_exchange.upstream_failed` 且包含 `unauthorized_client` 或 `grant_type is not enabled` | Delegation 已成功，但 managed delegation app 缺少 token-exchange grant，或租户绑定发生漂移。 | 先修复 managed delegation app 绑定，再调用 GUMem 或 WebAgent 产品能力。 |
| `delegation.required` | GUMem/WebAgent 调用没有传 `token`。 | 把 `delegation.data.token` 传给产品能力方法。 |
| `direct delegation token deprecated` | 应用直接把 Qoni delegation token 打到了产品服务。 | 通过 SDK 调产品能力，让 SDK 在内部完成 token exchange。 |

## 安全建议

- AK/SK 只保存在可信服务端。
- 不要把 delegation token 暴露给不可信客户端。
- 每次 Agent 行动只申请必要 scope。
- SDK 的产品方法每次调用前都会重新兑换 delegation token，因此 AccessKey 的 scope
  变更会在下一次 SDK 调用前重新校验。已经在 SDK 外取得的产品 token 仍会持续有效至过期。
- 浏览器接管、站点登录、长期监控、敏感产物访问优先使用 `interactive`。
- 在业务日志中记录 `auditId`、`requestId`、`traceId`，方便后续审计。
- 如果怀疑 AK/SK 泄露，应在 Qoni Console 中轮换密钥。

## License

MIT

## Do Anything file artifacts

After `wait()`, `result.artifacts` contains this run's persisted files, including when using `attach()` after reconnecting. Screenshots and recordings remain on their dedicated APIs. Temporary S3 URLs expire 900 seconds after signing; do not put them in public logs. Refreshing a link requires a valid delegation token with `webagent.do_anything:read`. Stored files remain subject to project retention.

```ts
const result = await run.wait();
for (const artifact of result.artifacts) {
  let url = artifact.downloadUrl;
  url = await artifact.refreshDownloadUrl?.();
  const data = await artifact.content(); // Uint8Array, authenticated download
}
const artifacts = await client.doAnything.artifacts({ token, runId: run.id });
```

Wire methods: `client.doAnything.api.listArtifacts(...)` and `artifactDownloadUrl(...)`.

## Agent Mail 与 Agent Phone

本地通信扩展提供 `qoni.genauth.agentMail` 和 `qoni.genauth.agentPhone` 的运行侧与管理侧 API。运行侧通过 `genauthCommunicationCredentials` 配置原生 GenAuth 凭据；管理侧复用 Qoni 的兑换流程。详见 [通信指南](docs/genauth-communication.md) 与 [方法索引](docs/genauth-communication-api.md)。

## 本地 Agent 整合扩展

整合分支增加 `qoni.genauth.auth.createLoginUrl` / `exchangeLoginCode` 与
`qoni.genauth.agents.create` / `get` / `bind` / `bindUser`，并保留原有管理、
Agent Mail 和 Agent Phone 接口。这些新增内容尚未发布到 npm。登录回调必须先核对
App 保存的 `state`，再兑换一次性 code。Personal 邮箱委托必须指定真实 IAM
`agentId`，审计标签不能证明邮箱归属。创建可能仍处于 pending；结果未知时只能使用
原 provisioning 引用或幂等键核对，不能重新创建资源。

Personal Quickstart 的邮箱创建流程与统一 Agent 管理的可选能力模型分别保留。
统一管理中身份、邮箱、手机号均可选，一个 Agent 可以拥有多个邮箱和手机号。
绑定 Personal 身份不会签发凭据，也不会自动打通 IAM token 调用原生 Mail/Phone API。

### 个人 Agent 编排与可选邮箱（待发布）

此候选接口可用于本地集成；后端业务验证仍未完成，示例不代表外部邮箱供应商已经支持或验收通过。

新建的 Agent 要先审核并同步能力，这个人才能在授权页同意（0.10.0）：

```ts
await qoni.genauth.agents.activate({ agentId, userId: person.genauthUserId, audience: app.appIdentifier, dataPolicyIds });
```

它把数据策略授权给这个人，起草、提交并批准 Agent 的能力申请，给 Agent 本地凭据并同步权限，然后等到 GenAuth 报告同步完成。每一步写入都带由 Agent 和步骤决定的幂等键，重复调用是安全的；已经激活的 Agent 立即返回。

`genauth.agents.create/get/bind` 使用现有 Qoni 签名传输。首次创建前保存 `idempotencyKey` 与完整请求，重试沿用它们。`ready: false` 是持久受理或恢复状态，不能当作成功，也不要换键创建替代 Agent。申请邮箱时，须原 Mail operation 成功、邮箱资源 active、IAM 确认 ready 才返回 `ready: true`。

```ts
const request = { displayName: "我的助手", mailboxLocalPart: "my-assistant", idempotencyKey: savedRequestKey };
let result = await qoni.genauth.agents.create(request);
// 保存 provisioningId；稍后恢复同一次创建。
result = await qoni.genauth.agents.get({ provisioningId: result.provisioningId });
if (result.state === "ready" && result.ready) {
  result = await qoni.genauth.agents.bind({ provisioningId: result.provisioningId, accessToken: currentUserAccessToken });
}
```

绑定只接受当前本人合法 GenAuth 用户 token，并核验池与 App；不接受浏览器声明的 owner ID。整体 ready 后从未绑定满七天才回收，绑定成功清除未绑定截止。明确失败及时补偿，未知供应商结果继续按原操作对账。查看 `state/errorCode` 处理等待和错误；SDK 不自动重放未知写入。用户 token 与管理密钥留在可信应用服务端，不写日志。能力默认关闭，需要配置编排、现有 Mail worker 与 IAM 服务认证。

延长任务时长配置不代表凭据、浏览器和供应商都能连续等待一小时。确认卡和普通表单也不能证明开放 browser/bash/harness 通道已强制批准或隔离秘密；这些完整业务保证仍未成立。

### 恢复 Do Anything 受理回执

此 W11 增量接口需要部署匹配的 Web Agent 受理 API。每次提交保留稳定的
`requestId` 和原请求内容；SDK 不会自动重试写请求。

```ts
const requestId = "checkout-task-20261009-001";
const run = await qoni.doAnything.run({ token, prompt, requestId });
// 创建回执丢失时只读原键，不创建新任务猜测结果。
const receipt = await qoni.doAnything.api.getRequest<{ id: string }>({ token, requestId });
const trace = await qoni.doAnything.api.getTrace({ token, runId: receipt.data.id });
```

`getRequest` 返回原 run envelope；TypeScript 读取字段时传相应响应泛型。
后继任务查询必须同时传原 `sessionId`。键按服务器认证的项目、用户、App/凭据、
Agent 和初始/后继会话隔离。同键但规范请求内容不同返回
`409 request_payload_conflict`。`409 request_in_progress` 或未找到回执不能证明
提交未发生；先读原键。如果原请求从未到达服务器，查询可能持续返回 404。
你可以在相同认证身份域下，显式使用**同一 requestId 和完全相同的请求内容**
重新提交任务受理，后继请求也必须保留原 sessionId。已受理时返回原 Task；
不要生成新键来猜测结果。SDK 不自动重试 POST，这也不授权重做结果未知的
外部操作。取消或过期不会释放键。

再次调用 `runWithMemory` 会重新召回记忆，可能改变实际 `instructions`，因此结果未知时应优先使用原请求键及读回的 run ID 调用 `api.getRequest`/`api.getTrace` 核对，不要把重新召回后的内容当作原 payload 重提。

使用受理键的任务保留 Task/Event 回执，硬删除其会话会返回
`409 request_receipt_retained`，仍可取消任务。若需彻底删除内容又保留去重，
必须另行确定持久保留模型；运维直接清库不在此保证内。

追溯仅返回原身份引用与安全状态，缺失的 grant、同意或操作依据保持缺失。
任务完成不等于外部操作已确认：`external_result: "unknown"` 需要去原网页或
服务核对。API 去重不保证网页订单、邮件绝不重复，追溯引用也不是批准凭据。

### 受保护表单输入（本地候选）

可信应用 UI 可对当前 `fill_form` 调用 `run.interactionHandle(card).submitSensitive(values)`；受保护文本字段命名为 `qoni_sensitive_<customData key>`。须使用创建该 Task 的原 Web Agent 产品 access token，delegation token 或重新换取的 token 不能替换原来源。SDK 将每个受保护值直接发送到已配置的 GenAuth，仅将不透明引用写入原 Web Agent 回复。普通 `submit()` 拒绝这些字段。不要从模型或开放浏览器工具调用此 API。

需要明确恢复步骤时，使用 `qoni.doAnything.forms.prepare({ token, runId, interactionId, fieldName })`，再调用 `intake({ token, ref, value })`、`status({ token, ref })` 或 `cancel({ token, ref })`。Prepare 保留原引用和期限，不授权再次提交值。持久化还要求服务端允许的非安全码定义 `cardNumber`，以及显式 `persist: true`（或 `submitSensitive` 的 `persistFields`）、当前 UDF 写权限和现有 AES 配置。其他或语义不明的自定义 key 均只允许瞬态保存；调用方的标签或类型不能授予持久化权限。CVC/CVV 始终只在瞬态缓存中，禁止持久化，也不生成摘要。缺少或不支持的 UDF 配置失败关闭。

直提、取消或引用回复结果未知时，错误含 `submissionUnknown: true`、`retryable: false`；不自动重试 POST，这些错误不保留原始响应体。丢失回包后读取原引用/Task。显式取消仅在收到确认后才证明临时值已删除。GA 撤销拒绝取用，下一次已认证访问尝试清理，固定 Redis TTL 则独立回收；这不表示撤销瞬间物理抹除，也不证明部署环境的备份隔离。原卡期限 `card_deadline` 保持不变，包括默认一小时。GenAuth 只在 issue 时记录一次 `value_deadline`，取原卡期限、原 run/source 期限与签发时刻加五分钟的最早值；`expires_at` 是同值兼容字段。三个字段均为 epoch 毫秒。值可先过期，原卡仍保持等待。只有未过期的 `awaiting` 引用接受一次直提；`writing`、`unknown`、`consumed`、`expired` 均不能在同卡重提或替换。Prepare/status 不滑动期限、不生成替代引用。读回 `ready` 仅表示原 intake 的 SQL 提交已确认且 Redis ready 转换已完成，不授权再次 POST。目标平台的隔离未获证据前，生产敏感 release 继续禁用；本候选不宣称自动代填、付款或外部投递完成。
