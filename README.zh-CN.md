# @qoniai/qoni

[English](./README.md) | 中文

`@qoniai/qoni` 是面向 Node.js 服务端的统一 Qoni SDK，用一条清晰的调用链串起 Agent 委托授权、GenAuth 用户管理、GUMem 长期记忆、WebAgent 网页行动、Do Anything、Web Search 和 Track 监控能力。

当一个 Agent 真正开始帮用户做事时，它不能只拿一把后台密钥到处调用接口。它需要知道用户是谁、用户允许它做什么、这次授权什么时候过期、页面里发生了什么、最后每一步能不能被追溯。

`@qoniai/qoni` 解决的是两类服务端调用：运行时产品调用时，应用服务端先确认 GenAuth 用户，再通过 `delegateToken` 申请短期委托 token，之后每次 GUMem/WebAgent/Do Anything/Web Search/Track 调用都把这个 token 传入 `token` 字段；GenAuth 用户管理调用时，SDK 会用 Qoni AK/SK 换取标准 GenAuth management token，再调用 GenAuth v3 users API。

AK/SK 必须只保存在可信服务端，不能下发到浏览器、移动端、公开 CLI 配置或其他不可信运行环境。

## 为什么使用 Qoni

Qoni 把 Agent 授权模型收敛成几个稳定边界：

- 一个 SDK 入口：`new QoniAgentKit({ accessKey, secretKey })`。
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
import { QoniAgentKit } from "@qoniai/qoni";        // ESM / TypeScript
const { QoniAgentKit } = require("@qoniai/qoni");    // CommonJS
```

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
import { QoniAgentKit } from "@qoniai/qoni";

const qoni = new QoniAgentKit({
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
  onInteraction: (i) => {                 // 登录 / 澄清 / 确认 / 接管
    if (i.can("confirm_signed_in")) return i.confirmSignedIn();
    if (i.can("confirm")) return i.confirm();
  },
});
console.log(result.output);
```

`run()` 返回一个 `RunHandle`。核心事件（状态、动作、交互、完成）始终默认推送；`capture: { screenshots: true }` 开启逐步截图，并且 SDK 已经把图片解码成字节。`wait()` 把任务跑到终态，并从权威 run envelope 结算结果（成本、步数、token 用量都在 `result.raw` 上）。

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

- **Silent**（`mode: "silent"`，默认）——代表某个终端用户,所以 user **必填**：传 `user: { id: <genauthUserId> }`（推荐）或已废弃的顶层 `userId`。不传会在请求发出前本地抛 `QoniValidationError`。授权用 `products` 语法糖和/或显式 `scopes`。
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

redirectUserTo(grant.data.authorizationUrl);
```

用户访问 `authorizationUrl` 进入 Qoni Console/BFF。若用户未登录，Console/BFF 会先走 GenAuth 登录；授权确认后由 Console/BFF 统一 complete，再回跳业务 `redirectUri`，只带一次性 `code`、业务 `state`、`grant_state`/`grantId`。浏览器不会拿到 delegation token。

业务 callback handler 在服务端用 AK/SK 兑换最终 token：

```ts
const completed = await qoni.completeDelegateToken({
  grantId: String(req.query.grantId ?? req.query.grant_id),
  code: String(req.query.code),
  state: String(req.query.state),
});

await qoni.gumem.recall({
  token: completed.data.token,
  query: "研究偏好",
});
```

`completeDelegateToken` 是推荐的服务端 callback helper。`delegateAgent` 和 `completeDelegateAgent` 仍保留为 deprecated 兼容命名，但当前 callback 契约是 `{ grantId, code, state }`；旧的 `{ code, state }` complete 签名不再兼容。

## Scope 怎么选

每个 WebAgent 产品只有两个 scope：`read`（只读观察——状态、事件、产物）与 `manage`（一切改变执行状态的操作——发起、取消、应答、消息、监控的增删改）。全集共 8 个：`webagent.{do_anything, web_search, deep_research, track}:{read, manage}`。最简单的授权方式是 `products` 糖——每个产品名展开为该产品的 `read` + `manage` 一对：

```ts
await qoni.delegateToken({
  user: { id: userId },
  products: ["doAnything", "webSearch", "deepResearch", "track"],
  scopes: ["gumem.memory:read"], // 可以和细粒度 scope 并用
});
```

scope 字符串在发请求前就会本地预检：漏掉服务前缀（比如写成 `do_anything:manage` 而不是 `webagent.do_anything:manage`）会立即抛出 `QoniValidationError`，错误消息里带正确写法。

需要让授权边界直接出现在业务代码里时，使用显式 scope 字符串。

| 场景 | 推荐 scope | 用户能理解的描述 |
| --- | --- | --- |
| 读取用户记忆 | `gumem.memory:read` | Agent 可以读取与你相关的历史偏好。 |
| 创建 GUMem 会话并召回上下文 | `gumem.memory:read`, `gumem.memory:write`, `gumem.message:write` | Agent 可以为当前用户创建记忆会话、写入消息并召回上下文。 |
| 写入任务结果 | `gumem.message:write`, `gumem.action:write` | Agent 可以把本次确认过的结果写回 GUMem。 |
| 搜索公开网页 | `webagent.web_search:read`, `webagent.web_search:manage` | Agent 可以搜索公开网页并读取结果。 |
| 执行网页任务 | `webagent.do_anything:read`, `webagent.do_anything:manage` | Agent 可以执行有边界的网页任务、读取进度、停止任务，并在需要时介入控制。 |
| 创建长期监控 | `webagent.track:read`, `webagent.track:manage` | Agent 可以配置监控、读取事件、立即运行检查，并停止监控。 |

低风险能力通常可以静默授权，例如读取当前用户自己的 GUMem、写入本次会话摘要、搜索公开网页、读取普通任务结果。

高风险能力建议显式授权，例如接管浏览器、请求或确认外部站点登录、创建长期监控、提交表单、读取浏览器画面/录屏/附件/研究产物等敏感内容。

SDK 也导出了常见 GUMem 会话、写入、召回场景的 scope bundle：

```ts
QoniScopeBundles.GUMEM_SESSION_RECALL
```

## 能力示例

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

### Do Anything

```ts
const run = await qoni.doAnything.run({
  token,
  prompt: "打开 https://en.wikipedia.org/wiki/Solid-state_battery ，总结它相对锂离子电池的主要优势。",
});

const status = await run.status(); // 刷新并返回当前状态
await run.cancel("用户停止任务"); // 幂等
```

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

### Track

```ts
const monitor = await qoni.track.create({
  token,
  prompt: "每分钟监控一次比特币价格。",
});

// 新建的 monitor 先处于 `pending_clarification`（后端把意图对齐成具体规格），
// 几秒后转为 `active`（意图含糊时可能先发一个 interaction）。runNow()/refine()
// 都要求 `active`，所以先等它就绪再操作：
for await (const event of monitor.events()) {
  if (event.type === "interaction") {
    const i = monitor.interactionHandle(event.data); // 如 needs-reauth 的 site_login
    if (i.can("confirm")) await i.confirm();
    continue;
  }
  const { status } = await monitor.get();
  if (status === "active") break;
}

await monitor.runNow();                     // 立即触发一次 tick
const ticks = await monitor.runs({ limit: 10 }); // tick 产生的 run 只读列表

// 用 refine() 改定义（任意字段子集：schedule / targetUrls / extractionSchema /
// triggerDsl / stopConditionDsl / notifyChannel）。`schedule` 是
// { kind: "cron", expr } 或 { kind: "interval", intervalSeconds }。
// 自然语言意图不可 refine——要改描述请新建 monitor：
await monitor.refine({ schedule: { kind: "cron", expr: "0 9 * * *" } });
await monitor.pause();   // 停掉定时 tick 但不删除
await monitor.resume();
await monitor.delete();

// 之后可以用存下来的 id 重连：
const sameMonitor = await qoni.track.attach(monitor.id, { token });
```

### GenAuth 用户上下文与用户管理

```ts
const client = new QoniAgentKit({
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

## API 概览

### Client

```ts
const qoni = new QoniAgentKit({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
  timeoutMs: 30_000,
});
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `accessKey` | `string` | 是 | Qoni Console 创建的 access key。 |
| `secretKey` | `string` | 是 | Qoni Console 创建的 secret key。 |
| `host` | `string` | 否 | 私有化或本地部署时可选的 Qoni Console/SDK 网关覆盖地址。 |
| `fetch` | `typeof fetch` | 否 | 自定义传输实现。 |
| `timeoutMs` | `number` | 否 | 单次请求超时（连接 + 响应头），默认 `30000`。 |

> **`timeoutMs` 不会限制长任务。** 它只作用于单次一次性 HTTP 请求（委托、`status()`、单个 POST）。事件流（`events()` / `wait()`）**不受它约束**——流的响应头一到，这个单次计时器就被清掉了,所以一个跑一小时的 Deep Research 在默认 30s 客户端超时下也能正常流式。要限制等待时长用 `wait({ timeoutMs })`；不传则 `wait()` 一直等到终态。`wait()` 超时**不会停止 run**——它在服务端继续跑，可以再 `attach()` 回去。

兼容导出：

```ts
import { Qoni, QoniAgentKit } from "@qoniai/qoni";
```

### 命名空间

| 命名空间 | 方法 |
| --- | --- |
| 委托授权 | `delegateToken`, `completeDelegateToken`；兼容别名：`delegateAgent`, `completeDelegateAgent` |
| GenAuth | `userInfo`, `jwks`, `discovery`, `introspectDelegationToken`, `users.list`, `users.get`, `users.getBatch`, `users.create`, `users.createBatch`, `users.update`, `users.deleteBatch` |
| GUMem | `createSession`, `addMessages`, `recall`, `uploadResource`, `actions.record`, `actions.recall`, `actions.stream` |
| Do Anything | `run`, `attach` → `RunHandle` |
| Deep Research | `run`, `attach` → `RunHandle` |
| Web Search | `run`, `attach` → `RunHandle` |
| Track | `create`, `attach` → `MonitorHandle` |

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

```ts
interface RunResult {
  runId: string;
  status: "succeeded" | "failed" | "canceled";  // run 的交付状态
  output?: unknown;            // 最终答案 / 载荷（形状随任务而定）
  artifacts: Artifact[];       // 交付物——deepResearch 报告；其它产品为 []
  isTaskSuccessful?: boolean;  // 任务是否达成目标（与 status 不同）
  terminalReason?: string;
  raw: JsonObject;             // 完整 wire envelope——成本、步数、token 用量
}
```

每个 `Artifact` 暴露 `id`、`name?`、`mime?`、`sizeBytes?`、`createdAt?` 和 `content(): Promise<Uint8Array>`（懒加载字节）。其余方法都返回下文的 `QoniResponse<T>` 信封,`T` 是该调用的具体载荷类型（例如 `genauth.users.list` → `.data` 上的分页用户列表）。`T` 的精确形状见随包的 `.d.ts`，与后端契约一致。

`MonitorHandle`（Track）提供 `id`、`get()`、`pause()`、`resume()`、`refine(patch)`、`runNow()`、`events()`、`interactionHandle()`、`runs()`、`run(runId)`、`delete()`。`runNow()` 和 `refine()` 要求 monitor 处于 `active`——新建的 monitor 会先短暂处于 `pending_clarification`（见上方 Track 示例）。

### 交互（HITL）

当 run 需要用户参与——登录某站、回答澄清、审批计划、接管浏览器、或等待——会发出一个 `interaction` 事件，`event.data` 是带类型的 `Interaction`（用 `type` 判别：`site_login` / `clarification` / `confirmation` / `take_control` / `wait`）。把它包成句柄再调动作方法即可；每个方法会 POST 到交互 `actions[]` 里后端声明的 endpoint，不需要写死路由：

```ts
for await (const event of run.events()) {
  if (event.type === "interaction") {
    const i = run.interactionHandle(event.data);   // event.data 就是 Interaction
    if (i.type === "clarification" && i.can("answer")) await i.answer("蓝色那个按钮");
    else if (i.can("confirm")) await i.confirm();
    else if (i.can("confirm_signed_in")) await i.confirmSignedIn();
    else if (i.can("release_control")) await i.releaseControl();
  }
}
```

方法：`answer(text)`、`skip()`、`confirm()`、`reject()`、`openLogin()`、`confirmSignedIn()`、`connectControl()`、`refreshControl()`、`releaseControl()`、`retry()`、`switchProfile()`。`i.can(kind)` 判断该交互当前是否提供这个动作；调用后端没声明的方法会抛错（所以「恢复」按钮只有在真能用时才出现）。

上面用到的判别字符串也都导出成了常量，避免裸写字面量：`InteractionTypes`（`site_login` / `clarification` / `confirmation` / `take_control` / `wait`）、`InteractionStatuses`、`ActionKinds`（`i.can(...)` 的动作名）。授权 scope 同样有：`QoniScopes`（每个单独 scope）、`QoniProductScopes`（`products` 语法糖展开成的 per-product `read`+`manage` 对）、`QoniScopeBundles`（精选 bundle）。用它们代替手写字符串：

```ts
import { InteractionTypes, ActionKinds, QoniScopes } from "@qoniai/qoni";

if (i.type === InteractionTypes.Clarification && i.can(ActionKinds.answer)) {
  await i.answer("蓝色那个按钮");
}
```

### Wire 级逃生舱

与后端 HTTP 契约一一对应的低层方法保留在 `qoni.<product>.api.*` 下（如 `qoni.doAnything.api.createSession`、`qoni.deepResearch.api.followUp`、`qoni.track.api.createMonitor`）。这些方法直接镜像 wire 形状——snake_case 字段、双层 envelope 事件、run 操作统一走 `/{product}/runs/{run_id}` 单 ID 寻址——形状会随 API 演进变化，不在冻结的公开契约范围内。

原始 wire 事件类型（`run.action.started` 这种内部传输名，命名是历史遗留、也不一致）**不作为公开导出**——开发者按上面那套精选 `event.type` 匹配即可；极少数要精确 wire 的场景，`event.raw.event` 是个原始字符串，直接比对。

Browser Use、Site Login 的 scope 已预留，但产品运行时 SDK 方法导出前不作为公开方法说明。

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
//     "monitorCreated" string   —— Track monitor id
//     "triggered"      string   —— Track 变化摘要
//     "checkCompleted" boolean  —— Track:这次检查有没有发现变化
//   丰富事件 —— event.data 是个小对象:
//     "message"        { text, role }
//     "interaction"    带类型的 Interaction 对象（HITL）—— 见「交互」一节
//     "screenshot"     { pageUrl?, step? }   + 解码后的图在 event.image
//     "done"           { output, succeeded, terminalReason }
// 公共字段:runId、at(ISO 8601)、isTerminal(仅 "done" 为 true)、raw(原始 wire 事件,逃生舱)。
```

每个产品的 handle 只含自己那一套（分型）：

| 产品 | `event.type` 集合 |
|---|---|
| Do Anything | 核心:`progress` / `message` / `interaction` / `screenshot` / `done` |
| Web Search | 核心 + `resultsReady` |
| Deep Research | 核心 + `phase` / `sectionReady`（大纲审批走 `interaction`） |
| Track（`MonitorHandle`） | 核心 + `monitorCreated` / `triggered` / `checkCompleted` |

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
| `QoniValidationError` | 请求发出前的本地校验失败（scope 字符串格式错、silent 委托缺 user）。 | 按消息修正调用——消息里给出正确写法。 |
| `QoniAuthError` | AK/SK 签名被 Qoni 拒绝（凭据错误/已轮换）。 | 检查 `accessKey` / `secretKey`。 |
| `QoniPermissionDeniedError` | delegation token 缺所需 scope（403）。 | 带上缺失 scope 重新 `delegateToken`。 |
| `QoniTokenExpiredError` | delegation / 产品 token 过期。 | 重新 mint token 再试。 |
| `QoniDelegationRequiredError` | 产品调用没带 `token`，或带的是网关不接受的裸 token。 | 把 `delegation.data.token` 传给产品调用。 |
| `QoniRateLimitError` | 被限流（429）。 | 退避后重试（`retryable === true`）。 |
| `QoniTimeoutError` | 请求（或 `wait({ timeoutMs })`）超时。 | 重试；run 仍在服务端执行，可 `attach()` 回去。 |
| `QoniUpstreamError` | 下游服务失败（5xx / 上游换 token 失败）。 | `retryable` 时退避后重试。 |
| `QoniError` | 基类 / 其它 code。 | 看 `err.code`。 |

SDK **不会自动重试**。`err.retryable` 告诉你重试是否可能成功，退避由你自己实现。

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
    // 重新 mint delegation token（补上缺失 scope / 刷新过期）后重试。
  }

  if (
    error instanceof QoniRateLimitError ||
    error instanceof QoniTimeoutError ||
    error instanceof QoniUpstreamError
  ) {
    // 瞬时错误——`error.retryable` 为 true 时退避重试。
  }

  throw error;
}
```

常见首次接入错误：

| 错误 | 含义 | 下一步 |
| --- | --- | --- |
| `agent must be a string` | 当前线上 delegation API 期望 `agent` 是字符串 ID。 | 使用 `agent: "memory-agent"`，不要传对象。 |
| `eak.delegation.user_not_bound` | `userId` 不属于该 Qoni credential 绑定的 GenAuth userpool。 | 使用 `currentUser` 返回的真实用户 ID，或确认用户来自同一个绑定 userpool。 |
| `eak.genauth.userpool_binding_missing` | AK/SK 没有绑定 GenAuth userpool，`genauth.users.*` 无法换取 management token。 | 先把 Qoni credential 绑定到目标 GenAuth userpool。 |
| `eak.genauth.userpool_owner_missing` | 绑定的 GenAuth userpool 找不到可用于签发 management token 的 owner 用户。 | 修复 GenAuth userpool owner 数据或绑定。 |
| `eak.token_exchange.upstream_failed` 且包含 `unauthorized_client` 或 `grant_type is not enabled` | Delegation 已成功，但 managed delegation app 缺少 token-exchange grant，或租户绑定发生漂移。 | 先修复 managed delegation app 绑定，再调用 GUMem 或 WebAgent 产品能力。 |
| `delegation.required` | GUMem/WebAgent 调用没有传 `token`。 | 把 `delegation.data.token` 传给产品能力方法。 |
| `direct delegation token deprecated` | 应用直接把 Qoni delegation token 打到了产品服务。 | 通过 SDK 调产品能力，让 SDK 在内部完成 token exchange。 |

## 安全建议

- AK/SK 只保存在可信服务端。
- 不要把 delegation token 暴露给不可信客户端。
- 每次 Agent 行动只申请必要 scope。
- 浏览器接管、站点登录、长期监控、敏感产物访问优先使用 `interactive`。
- 在业务日志中记录 `auditId`、`requestId`、`traceId`，方便后续审计。
- 如果怀疑 AK/SK 泄露，应在 Qoni Console 中轮换密钥。

## License

MIT
