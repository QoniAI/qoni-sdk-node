/**
 * 公开函数 → 覆盖它的 live e2e 测试。**本轮按 TypeScript AST 刷新测试位置，保留非 Track 历史层级。**
 *
 * 这里不做任何字符串猜测：每条 `tests[]` 都来自 coverage-map.json 的调用点
 * （文件:行号）反查出的那个 `it(...)` 块，`name` 就是 vitest
 * `expect.getState().currentTestName` 会给出的 `describe > it` 全名，
 * 所以录制到的每条 HTTP 记录都能机器化地 join 回函数。
 *
 * `tests/live-evidence.test.ts` 会断言：
 *   1. catalog 里的 94 个函数一个不漏地出现在这里；
 *   2. 每条 test 引用都能在 tests/live-e2e/*.test.ts 里解析到同名的 describe > it；
 *   3. 只有显式声明 `noLiveTest` 的条目允许没有测试。
 */

export interface FunctionTestRef {
  /** live e2e 文件名（不含路径）。 */
  file: string;
  /** vitest currentTestName：describe > it。 */
  name: string;
  /** it(...) 块在文件里的起止行，供片段抽取核对。 */
  line: number;
  endLine: number;
  /** it.each 之类的动态标题：运行时名字会带参数，join 时按前缀匹配。 */
  dynamic?: boolean;
  /**
   * 调用点不在 it 体内、而在 describe 作用域的共享辅助函数里时，记下是哪个辅助
   * 函数（例如 `ensureRun()`）。该 it 块的源码里确实调用了它，可核对。
   */
  via?: string;
}

export interface FunctionMapEntry {
  id: string;
  name: string;
  tier: string;
  tests: FunctionTestRef[];
  /** 没有 live 测试时必须写明原因，否则完整性断言失败。 */
  noLiveTest?: string;
}

export const FUNCTION_TEST_MAP: readonly FunctionMapEntry[] = [
  {
    "id": "qoni-delegate-token",
    "name": "qoni.delegateToken",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > delegateAgent() (deprecated alias) mints the same silent token as delegateToken()",
        "line": 77,
        "endLine": 91
      },
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > qoni.delegateToken() / qoni.delegateAgent() mint working credentials",
        "line": 93,
        "endLine": 116
      },
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > delegateToken({ mode: 'interactive' }) returns a real authorization grant",
        "line": 118,
        "endLine": 146
      },
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > completeDelegateToken() and its aliases reach the exchange route and are refused without a human-approved code",
        "line": 148,
        "endLine": 207
      }
    ]
  },
  {
    "id": "qoni-delegate-agent",
    "name": "qoni.delegateAgent",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > delegateAgent() (deprecated alias) mints the same silent token as delegateToken()",
        "line": 77,
        "endLine": 91
      },
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > qoni.delegateToken() / qoni.delegateAgent() mint working credentials",
        "line": 93,
        "endLine": 116
      }
    ]
  },
  {
    "id": "qoni-complete-delegate-token",
    "name": "qoni.completeDelegateToken",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > completeDelegateToken() and its aliases reach the exchange route and are refused without a human-approved code",
        "line": 148,
        "endLine": 207
      }
    ]
  },
  {
    "id": "qoni-complete-delegate-agent",
    "name": "qoni.completeDelegateAgent",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > completeDelegateToken() and its aliases reach the exchange route and are refused without a human-approved code",
        "line": 148,
        "endLine": 207
      }
    ]
  },
  {
    "id": "qoni-current-user",
    "name": "qoni.currentUser",
    "tier": "VERIFIED",
    "tests": [],
    "noLiveTest": "Historical Track/snapshot live reference retired; no current live test mapped to this function."
  },
  {
    "id": "qoni-resolve-any-bound-user",
    "name": "qoni.resolveAnyBoundUser",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > resolveAnyBoundUser() resolves a real userpool member",
        "line": 90,
        "endLine": 92
      }
    ]
  },
  {
    "id": "qoni-request",
    "name": "qoni.request",
    "tier": "VERIFIED",
    "tests": [],
    "noLiveTest": "Historical Track/snapshot live reference retired; no current live test mapped to this function."
  },
  {
    "id": "qoni-unstable-request",
    "name": "qoni.unstableRequest",
    "tier": "VERIFIED",
    "tests": [],
    "noLiveTest": "Historical Track/snapshot live reference retired; no current live test mapped to this function."
  },
  {
    "id": "qoni-qoni-delegate-token",
    "name": "qoni.qoni.delegateToken",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > qoni.delegateToken() / qoni.delegateAgent() mint working credentials",
        "line": 93,
        "endLine": 116
      }
    ]
  },
  {
    "id": "qoni-qoni-delegate-agent",
    "name": "qoni.qoni.delegateAgent",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > qoni.delegateToken() / qoni.delegateAgent() mint working credentials",
        "line": 93,
        "endLine": 116
      }
    ]
  },
  {
    "id": "qoni-qoni-complete-delegate-token",
    "name": "qoni.qoni.completeDelegateToken",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > completeDelegateToken() and its aliases reach the exchange route and are refused without a human-approved code",
        "line": 148,
        "endLine": 207
      }
    ]
  },
  {
    "id": "qoni-qoni-complete-delegate-agent",
    "name": "qoni.qoni.completeDelegateAgent",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > completeDelegateToken() and its aliases reach the exchange route and are refused without a human-approved code",
        "line": 148,
        "endLine": 207
      }
    ]
  },
  {
    "id": "qoni-genauth-user-info",
    "name": "qoni.genauth.userInfo",
    "tier": "VERIFIED",
    "tests": [],
    "noLiveTest": "Historical Track/snapshot live reference retired; no current live test mapped to this function."
  },
  {
    "id": "qoni-genauth-jwks",
    "name": "qoni.genauth.jwks",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > genauth.jwks() exposes signing keys",
        "line": 63,
        "endLine": 67
      }
    ]
  },
  {
    "id": "qoni-genauth-discovery",
    "name": "qoni.genauth.discovery",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > genauth.discovery() exposes an OpenID configuration",
        "line": 57,
        "endLine": 61
      }
    ]
  },
  {
    "id": "qoni-genauth-introspect-delegation-token",
    "name": "qoni.genauth.introspectDelegationToken",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > genauth.introspectDelegationToken({ token }) recognizes the delegated token",
        "line": 69,
        "endLine": 76
      }
    ]
  },
  {
    "id": "qoni-genauth-users-list",
    "name": "qoni.genauth.users.list",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.list({ page, limit })",
        "line": 42,
        "endLine": 45
      }
    ]
  },
  {
    "id": "qoni-genauth-users-get",
    "name": "qoni.genauth.users.get",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.get({ userId })",
        "line": 47,
        "endLine": 50
      },
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.create({ username, password })",
        "line": 57,
        "endLine": 61
      },
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.createBatch({ users })",
        "line": 63,
        "endLine": 71
      },
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.update({ userId, nickname })",
        "line": 73,
        "endLine": 82
      },
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.deleteBatch({ userIds })",
        "line": 84,
        "endLine": 94
      }
    ]
  },
  {
    "id": "qoni-genauth-users-get-batch",
    "name": "qoni.genauth.users.getBatch",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.getBatch({ userIds })",
        "line": 52,
        "endLine": 55
      }
    ]
  },
  {
    "id": "qoni-genauth-users-create",
    "name": "qoni.genauth.users.create",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.create({ username, password })",
        "line": 57,
        "endLine": 61,
        "via": "ensureCreatedUser()"
      },
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.update({ userId, nickname })",
        "line": 73,
        "endLine": 82,
        "via": "ensureCreatedUser()"
      },
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.deleteBatch({ userIds })",
        "line": 84,
        "endLine": 94
      }
    ]
  },
  {
    "id": "qoni-genauth-users-create-batch",
    "name": "qoni.genauth.users.createBatch",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.createBatch({ users })",
        "line": 63,
        "endLine": 71
      }
    ]
  },
  {
    "id": "qoni-genauth-users-update",
    "name": "qoni.genauth.users.update",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.update({ userId, nickname })",
        "line": 73,
        "endLine": 82
      }
    ]
  },
  {
    "id": "qoni-genauth-users-delete-batch",
    "name": "qoni.genauth.users.deleteBatch",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "genauth-users.test.ts",
        "name": "live e2e: GenAuth users > genauth.users.deleteBatch({ userIds })",
        "line": 84,
        "endLine": 94
      }
    ]
  },
  {
    "id": "qoni-gumem-create-session",
    "name": "qoni.gumem.createSession",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.createSession({ userId, sessionId, title, metadata })",
        "line": 106,
        "endLine": 109,
        "via": "ensureSession()"
      },
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.addMessages({ sync, messages })",
        "line": 111,
        "endLine": 122,
        "via": "ensureSession()"
      },
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.recall({ query, details, recallConfig, metadataFilters })",
        "line": 124,
        "endLine": 137,
        "via": "ensureSession()"
      },
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.uploadResource({ file, filename, contentType })",
        "line": 139,
        "endLine": 153,
        "via": "ensureSession()"
      },
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.actions.record({ user_id, session_id, event_type, timestamp, content })",
        "line": 155,
        "endLine": 167,
        "via": "ensureSession()"
      }
    ]
  },
  {
    "id": "qoni-gumem-add-messages",
    "name": "qoni.gumem.addMessages",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.addMessages({ sync, messages })",
        "line": 111,
        "endLine": 122
      }
    ]
  },
  {
    "id": "qoni-gumem-recall",
    "name": "qoni.gumem.recall",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.recall({ query, details, recallConfig, metadataFilters })",
        "line": 124,
        "endLine": 137
      }
    ]
  },
  {
    "id": "qoni-gumem-upload-resource",
    "name": "qoni.gumem.uploadResource",
    "tier": "BLOCKED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.uploadResource({ file, filename, contentType })",
        "line": 139,
        "endLine": 153
      }
    ]
  },
  {
    "id": "qoni-gumem-actions-record",
    "name": "qoni.gumem.actions.record",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.actions.record({ user_id, session_id, event_type, timestamp, content })",
        "line": 155,
        "endLine": 167
      }
    ]
  },
  {
    "id": "qoni-gumem-actions-recall",
    "name": "qoni.gumem.actions.recall",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.actions.recall({ user_id, query })",
        "line": 169,
        "endLine": 177
      }
    ]
  },
  {
    "id": "qoni-gumem-actions-stream",
    "name": "qoni.gumem.actions.stream",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > gumem.actions.stream({ user_id, limit })",
        "line": 179,
        "endLine": 183
      }
    ]
  },
  {
    "id": "qoni-do-anything-run",
    "name": "qoni.doAnything.run",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > doAnything.run({ token, prompt, ...configuredInput }) returns a run",
        "line": 140,
        "endLine": 145,
        "via": "ensureRun()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.status() refreshes the run without re-passing token or ids",
        "line": 147,
        "endLine": 153,
        "via": "ensureRun()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.events() yields normalized semantic events",
        "line": 155,
        "endLine": 163,
        "via": "ensureRun()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 187,
        "endLine": 195,
        "via": "ensureRun()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > doAnything.attach() reconnects to the run by id alone",
        "line": 197,
        "endLine": 206,
        "via": "ensureRun()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > escape hatch: api.getRun / api.readRecording still speak wire",
        "line": 212,
        "endLine": 224,
        "via": "ensureRun()"
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > a real backend interaction reaches run.wait({ onInteraction }) as an InteractionHandle",
        "line": 80,
        "endLine": 144
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > induction attempt: no PENDING interaction with declared actions is reachable here",
        "line": 210,
        "endLine": 257
      }
    ]
  },
  {
    "id": "qoni-do-anything-attach",
    "name": "qoni.doAnything.attach",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > doAnything.attach() reconnects to the run by id alone",
        "line": 197,
        "endLine": 206
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-create-session",
    "name": "qoni.doAnything.api.createSession",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.createSession() creates a do_anything session shell",
        "line": 314,
        "endLine": 333
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-create-run",
    "name": "qoni.doAnything.api.createRun",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.createRun() creates the run and its session in one call",
        "line": 335,
        "endLine": 357
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-get-run",
    "name": "qoni.doAnything.api.getRun",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > escape hatch: api.getRun / api.readRecording still speak wire",
        "line": 212,
        "endLine": 224
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.getRun() addresses the run by run_id alone",
        "line": 359,
        "endLine": 374
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-events",
    "name": "qoni.doAnything.api.events",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.events() streams the raw browser-harness envelopes to run.completed",
        "line": 393,
        "endLine": 454
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-intervene",
    "name": "qoni.doAnything.api.intervene",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > a real backend interaction reaches run.wait({ onInteraction }) as an InteractionHandle",
        "line": 80,
        "endLine": 144
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.intervene() posts an answer through the run's intervene route",
        "line": 376,
        "endLine": 391
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-cancel",
    "name": "qoni.doAnything.api.cancel",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.cancel() on a settled run returns its terminal wire state",
        "line": 468,
        "endLine": 476
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-read-artifacts",
    "name": "qoni.doAnything.api.readArtifacts",
    "tier": "GUARD_ONLY",
    "tests": [],
    "noLiveTest": "Deprecated unsupported surface: local QoniUnsupportedError with zero HTTP. No backend route/source and no positive live capability coverage; see gray-track-contract.test.ts."
  },
  {
    "id": "qoni-do-anything-api-read-recording",
    "name": "qoni.doAnything.api.readRecording",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.wait() returns configured domain evidence, raw events and screenshots on disk",
        "line": 165,
        "endLine": 185,
        "via": "ensureResult()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 187,
        "endLine": 195,
        "via": "ensureResult()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > escape hatch: api.getRun / api.readRecording still speak wire",
        "line": 212,
        "endLine": 224
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.createSession() creates a do_anything session shell",
        "line": 314,
        "endLine": 333
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.readRecording() reads the session recording envelope",
        "line": 456,
        "endLine": 463
      }
    ]
  },
  {
    "id": "qoni-web-search-run",
    "name": "qoni.webSearch.run",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > webSearch.run({ token, query, maxResultsPerQuery, siteWhitelist }) returns a run",
        "line": 103,
        "endLine": 107,
        "via": "ensureRun()"
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.status() refreshes the run without re-passing token or id",
        "line": 109,
        "endLine": 115,
        "via": "ensureRun()"
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > webSearch.attach() reconnects to the run",
        "line": 117,
        "endLine": 123,
        "via": "ensureRun()"
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.events() yields normalized semantic events",
        "line": 125,
        "endLine": 132,
        "via": "ensureRun()"
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 168,
        "endLine": 176,
        "via": "ensureRun()"
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > escape hatch: api.get({ token, runId }) still speaks wire",
        "line": 180,
        "endLine": 186,
        "via": "ensureRun()"
      }
    ]
  },
  {
    "id": "qoni-web-search-attach",
    "name": "qoni.webSearch.attach",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > webSearch.attach() reconnects to the run",
        "line": 117,
        "endLine": 123
      }
    ]
  },
  {
    "id": "qoni-web-search-api-run",
    "name": "qoni.webSearch.api.run",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.run() posts the wire create body and returns the snake_case run envelope",
        "line": 121,
        "endLine": 141
      }
    ]
  },
  {
    "id": "qoni-web-search-api-get",
    "name": "qoni.webSearch.api.get",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "delegation.test.ts",
        "name": "live e2e: delegation (silent, interactive, and the qoni.* aliases) > qoni.delegateToken() / qoni.delegateAgent() mint working credentials",
        "line": 93,
        "endLine": 116
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > escape hatch: api.get({ token, runId }) still speaks wire",
        "line": 180,
        "endLine": 186
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.get() addresses the run by id and returns the same wire envelope",
        "line": 143,
        "endLine": 150
      }
    ]
  },
  {
    "id": "qoni-web-search-api-events",
    "name": "qoni.webSearch.api.events",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.events() streams raw SSE envelopes through to search.results_ready",
        "line": 152,
        "endLine": 194
      }
    ]
  },
  {
    "id": "qoni-web-search-api-cancel",
    "name": "qoni.webSearch.api.cancel",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.cancel() on a settled run returns its terminal wire state",
        "line": 196,
        "endLine": 204
      }
    ]
  },
  {
    "id": "qoni-deep-research-run",
    "name": "qoni.deepResearch.run",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > deepResearch.run({ token, topic, depth, limits, ... }) returns a run",
        "line": 92,
        "endLine": 96,
        "via": "ensureRun()"
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.status() refreshes the run without re-passing token or id",
        "line": 98,
        "endLine": 104,
        "via": "ensureRun()"
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > deepResearch.attach() reconnects to the run",
        "line": 106,
        "endLine": 112,
        "via": "ensureRun()"
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.events() yields normalized semantic events",
        "line": 114,
        "endLine": 121,
        "via": "ensureRun()"
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 151,
        "endLine": 159,
        "via": "ensureRun()"
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > escape hatch: api.get / api.feedback still speak wire",
        "line": 165,
        "endLine": 177,
        "via": "ensureRun()"
      }
    ]
  },
  {
    "id": "qoni-deep-research-attach",
    "name": "qoni.deepResearch.attach",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > deepResearch.attach() reconnects to the run",
        "line": 106,
        "endLine": 112
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-run",
    "name": "qoni.deepResearch.api.run",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.run() posts the wire create body and returns the run envelope",
        "line": 502,
        "endLine": 520
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-get",
    "name": "qoni.deepResearch.api.get",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > escape hatch: api.get / api.feedback still speak wire",
        "line": 165,
        "endLine": 177
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.get() addresses the run by id",
        "line": 522,
        "endLine": 527
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-events",
    "name": "qoni.deepResearch.api.events",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.events() streams the research pipeline to run.completed",
        "line": 540,
        "endLine": 568
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-follow-up",
    "name": "qoni.deepResearch.api.followUp",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.followUp() is refused with task_in_progress while the run is live",
        "line": 529,
        "endLine": 538
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.followUp() is accepted once the run is terminal",
        "line": 607,
        "endLine": 615
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-cancel",
    "name": "qoni.deepResearch.api.cancel",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.cancel() on a settled run returns its terminal wire state",
        "line": 617,
        "endLine": 621
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-feedback",
    "name": "qoni.deepResearch.api.feedback",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > escape hatch: api.get / api.feedback still speak wire",
        "line": 165,
        "endLine": 177
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-list-artifacts",
    "name": "qoni.deepResearch.api.listArtifacts",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.listArtifacts() lists the report deliverables",
        "line": 570,
        "endLine": 585
      }
    ]
  },
  {
    "id": "qoni-deep-research-api-get-artifact",
    "name": "qoni.deepResearch.api.getArtifact",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.getArtifact() reads a single artifact by id",
        "line": 587,
        "endLine": 605
      }
    ]
  },
  {
    "id": "qoni-track-create",
    "name": "qoni.track.create",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > track.create returns an active Track from explicit prompt/schedule",
        "line": 39,
        "endLine": 47
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-attach",
    "name": "qoni.track.attach",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > track.attach reconnects to the real Track",
        "line": 54,
        "endLine": 57
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-api-create-monitor",
    "name": "qoni.track.api.createMonitor",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.createMonitor creates a real Track with instructions and a wire schedule",
        "line": 240,
        "endLine": 255
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-api-get-monitor",
    "name": "qoni.track.api.getMonitor",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.getMonitor reads the real Track by id",
        "line": 256,
        "endLine": 258
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-api-run-now",
    "name": "qoni.track.api.runNow",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.runNow returns only a real task reference and waits for its exact check",
        "line": 264,
        "endLine": 270
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-api-events",
    "name": "qoni.track.api.events",
    "tier": "GUARD_ONLY",
    "tests": [],
    "noLiveTest": "Deprecated unsupported surface: local QoniUnsupportedError with zero HTTP. No backend route/source and no positive live capability coverage; see gray-track-contract.test.ts."
  },
  {
    "id": "qoni-track-api-intervene",
    "name": "qoni.track.api.intervene",
    "tier": "GUARD_ONLY",
    "tests": [],
    "noLiveTest": "Deprecated unsupported surface: local QoniUnsupportedError with zero HTTP. No backend route/source and no positive live capability coverage; see gray-track-contract.test.ts."
  },
  {
    "id": "qoni-track-api-list-runs",
    "name": "qoni.track.api.listRuns",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.listRuns and getRun return recent checks without snapshot fields",
        "line": 271,
        "endLine": 277
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-api-get-run",
    "name": "qoni.track.api.getRun",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.listRuns and getRun return recent checks without snapshot fields",
        "line": 271,
        "endLine": 277
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-api-update-monitor",
    "name": "qoni.track.api.updateMonitor",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.updateMonitor PATCHes real paused and active statuses",
        "line": 259,
        "endLine": 263
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "qoni-track-api-delete-monitor",
    "name": "qoni.track.api.deleteMonitor",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.deleteMonitor accepts empty 204 and the deleted Track reads as 404",
        "line": 278,
        "endLine": 281
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "run-handle-status",
    "name": "RunHandle.status",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.status() refreshes the run without re-passing token or id",
        "line": 98,
        "endLine": 104
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > deepResearch.attach() reconnects to the run",
        "line": 106,
        "endLine": 112
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.status() refreshes the run without re-passing token or ids",
        "line": 147,
        "endLine": 153
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.wait() returns configured domain evidence, raw events and screenshots on disk",
        "line": 165,
        "endLine": 185,
        "via": "ensureResult()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 187,
        "endLine": 195,
        "via": "ensureResult()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > doAnything.attach() reconnects to the run by id alone",
        "line": 197,
        "endLine": 206
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.status() refreshes the run without re-passing token or id",
        "line": 109,
        "endLine": 115
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > webSearch.attach() reconnects to the run",
        "line": 117,
        "endLine": 123
      }
    ]
  },
  {
    "id": "run-handle-events",
    "name": "RunHandle.events",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.events() yields normalized semantic events",
        "line": 114,
        "endLine": 121
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.events() yields normalized semantic events",
        "line": 155,
        "endLine": 163
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.events() yields normalized semantic events",
        "line": 125,
        "endLine": 132
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.events() streams raw SSE envelopes through to search.results_ready",
        "line": 152,
        "endLine": 194
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.events() streams the raw browser-harness envelopes to run.completed",
        "line": 393,
        "endLine": 454
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.events() streams the research pipeline to run.completed",
        "line": 540,
        "endLine": 568
      }
    ]
  },
  {
    "id": "run-handle-wait",
    "name": "RunHandle.wait",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.wait() settles with a real cited report",
        "line": 123,
        "endLine": 149,
        "via": "ensureResult()"
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 151,
        "endLine": 159,
        "via": "ensureResult()"
      },
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > escape hatch: api.get / api.feedback still speak wire",
        "line": 165,
        "endLine": 177,
        "via": "ensureResult()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.wait() returns configured domain evidence, raw events and screenshots on disk",
        "line": 165,
        "endLine": 185,
        "via": "ensureResult()"
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 187,
        "endLine": 195,
        "via": "ensureResult()"
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > a real backend interaction reaches run.wait({ onInteraction }) as an InteractionHandle",
        "line": 80,
        "endLine": 144
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > induction attempt: no PENDING interaction with declared actions is reachable here",
        "line": 210,
        "endLine": 257
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.wait() settles with on-whitelist results and records the raw stream",
        "line": 134,
        "endLine": 166,
        "via": "ensureResult()"
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 168,
        "endLine": 176,
        "via": "ensureResult()"
      }
    ]
  },
  {
    "id": "run-handle-interaction-handle",
    "name": "RunHandle.interactionHandle",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > a real backend interaction reaches run.wait({ onInteraction }) as an InteractionHandle",
        "line": 80,
        "endLine": 144
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > run.interactionHandle() wraps the backend's Interaction with matching identity",
        "line": 146,
        "endLine": 156
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > can() reports exactly the actions the backend declared",
        "line": 158,
        "endLine": 168
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "run-handle-cancel",
    "name": "RunHandle.cancel",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "deep-research.test.ts",
        "name": "live e2e: Deep Research (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 151,
        "endLine": 159
      },
      {
        "file": "do-anything.test.ts",
        "name": "live e2e: Do Anything (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 187,
        "endLine": 195
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > induction attempt: no PENDING interaction with declared actions is reachable here",
        "line": 210,
        "endLine": 257
      },
      {
        "file": "web-search.test.ts",
        "name": "live e2e: Web Search (semantic surface) > run.cancel() is idempotent on a settled run",
        "line": 168,
        "endLine": 176
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.cancel() on a settled run returns its terminal wire state",
        "line": 196,
        "endLine": 204
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.cancel() on a settled run returns its terminal wire state",
        "line": 468,
        "endLine": 476
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.cancel() on a settled run returns its terminal wire state",
        "line": 617,
        "endLine": 621
      }
    ]
  },
  {
    "id": "monitor-handle-get",
    "name": "MonitorHandle.get",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.get returns real instructions and a roundtrippable schedule",
        "line": 48,
        "endLine": 53
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "monitor-handle-pause",
    "name": "MonitorHandle.pause",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.pause and resume persist the actual statuses",
        "line": 63,
        "endLine": 68
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "monitor-handle-resume",
    "name": "MonitorHandle.resume",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.pause and resume persist the actual statuses",
        "line": 63,
        "endLine": 68
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "monitor-handle-refine",
    "name": "MonitorHandle.refine",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.refine updates title and preserves instructions",
        "line": 58,
        "endLine": 62
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "monitor-handle-run-now",
    "name": "MonitorHandle.runNow",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runNow returns a task reference whose exact check reaches a successful terminal state",
        "line": 69,
        "endLine": 77
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "monitor-handle-events",
    "name": "MonitorHandle.events",
    "tier": "GUARD_ONLY",
    "tests": [],
    "noLiveTest": "Deprecated unsupported surface: local QoniUnsupportedError with zero HTTP. No backend route/source and no positive live capability coverage; see gray-track-contract.test.ts."
  },
  {
    "id": "monitor-handle-interaction-handle",
    "name": "MonitorHandle.interactionHandle",
    "tier": "GUARD_ONLY",
    "tests": [],
    "noLiveTest": "Deprecated unsupported surface: local QoniUnsupportedError with zero HTTP. No backend route/source and no positive live capability coverage; see gray-track-contract.test.ts."
  },
  {
    "id": "monitor-handle-runs",
    "name": "MonitorHandle.runs",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runs and run read only real recent check fields",
        "line": 78,
        "endLine": 84
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "monitor-handle-run",
    "name": "MonitorHandle.run",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runs and run read only real recent check fields",
        "line": 78,
        "endLine": 84
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "monitor-handle-delete",
    "name": "MonitorHandle.delete",
    "tier": "MOCK_ONLY",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.delete soft-deletes and later reads return not found",
        "line": 90,
        "endLine": 93
      }
    ],
    "noLiveTest": "Current WA 596310a3 mapping verified against local HTTP fixtures only; these updated live tests have not run. Historical monitor live results do not verify this contract."
  },
  {
    "id": "interaction-handle-can",
    "name": "InteractionHandle.can",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > can() reports exactly the actions the backend declared",
        "line": 158,
        "endLine": 168
      }
    ]
  },
  {
    "id": "interaction-handle-answer",
    "name": "InteractionHandle.answer",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-skip",
    "name": "InteractionHandle.skip",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-confirm",
    "name": "InteractionHandle.confirm",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-reject",
    "name": "InteractionHandle.reject",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-open-login",
    "name": "InteractionHandle.openLogin",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-confirm-signed-in",
    "name": "InteractionHandle.confirmSignedIn",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-connect-control",
    "name": "InteractionHandle.connectControl",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-refresh-control",
    "name": "InteractionHandle.refreshControl",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-release-control",
    "name": "InteractionHandle.releaseControl",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-retry",
    "name": "InteractionHandle.retry",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  },
  {
    "id": "interaction-handle-switch-profile",
    "name": "InteractionHandle.switchProfile",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 170,
        "endLine": 208
      }
    ]
  }
];
