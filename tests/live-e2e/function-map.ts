/**
 * 公开函数 → 覆盖它的 live e2e 测试。**由 evidence_tools.py map 生成，勿手改。**
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
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > currentUser({ accessToken }) resolves a logged-in user",
        "line": 78,
        "endLine": 82
      }
    ]
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
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > request({ method, path }) executes a configured signed request",
        "line": 94,
        "endLine": 98
      }
    ]
  },
  {
    "id": "qoni-unstable-request",
    "name": "qoni.unstableRequest",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > unstableRequest({ method, path }) remains a working alias",
        "line": 100,
        "endLine": 104
      }
    ]
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
    "tests": [
      {
        "file": "auth-gumem.test.ts",
        "name": "live e2e: auth and GUMem > genauth.userInfo({ accessToken }) resolves the same login",
        "line": 84,
        "endLine": 88
      }
    ]
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
        "line": 81,
        "endLine": 145
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > induction attempt: no PENDING interaction with declared actions is reachable here",
        "line": 211,
        "endLine": 258
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
        "line": 523,
        "endLine": 542
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
        "line": 544,
        "endLine": 566
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
        "line": 568,
        "endLine": 583
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
        "line": 602,
        "endLine": 663
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
        "line": 81,
        "endLine": 145
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.intervene() posts an answer through the run's intervene route",
        "line": 585,
        "endLine": 600
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
        "line": 706,
        "endLine": 714
      }
    ]
  },
  {
    "id": "qoni-do-anything-api-read-artifacts",
    "name": "qoni.doAnything.api.readArtifacts",
    "tier": "GUARD_ONLY",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.readArtifacts() reaches the session artifact route and 404s an unknown id",
        "line": 674,
        "endLine": 704
      }
    ]
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
        "line": 523,
        "endLine": 542
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.readRecording() reads the session recording envelope",
        "line": 665,
        "endLine": 672
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
        "line": 740,
        "endLine": 758
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
        "line": 760,
        "endLine": 765
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
        "line": 778,
        "endLine": 806
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
        "line": 767,
        "endLine": 776
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.followUp() is accepted once the run is terminal",
        "line": 845,
        "endLine": 853
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
        "line": 855,
        "endLine": 859
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
        "line": 808,
        "endLine": 823
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
        "line": 825,
        "endLine": 843
      }
    ]
  },
  {
    "id": "qoni-track-create",
    "name": "qoni.track.create",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > track.create({ token, intent, schedule, ... }) returns a monitor monitor",
        "line": 59,
        "endLine": 63,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.get() returns the normalized monitor definition",
        "line": 65,
        "endLine": 74,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > track.attach() reconnects to the monitor",
        "line": 76,
        "endLine": 83,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.refine() is observable on monitor.events()",
        "line": 85,
        "endLine": 99,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.pause() / resume() control scheduled execution",
        "line": 101,
        "endLine": 108,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runNow() triggers an immediate tick",
        "line": 110,
        "endLine": 114,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > records a RECURRING scheduler-driven cadence to disk via event.raw",
        "line": 131,
        "endLine": 219,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runs() / monitor.run() expose tick runs read-only",
        "line": 221,
        "endLine": 231,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > escape hatch: api.getMonitor({ token, monitorId }) still speaks wire",
        "line": 235,
        "endLine": 240,
        "via": "ensureMonitor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.delete() removes the monitor",
        "line": 242,
        "endLine": 247,
        "via": "ensureMonitor()"
      }
    ]
  },
  {
    "id": "qoni-track-attach",
    "name": "qoni.track.attach",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > track.attach() reconnects to the monitor",
        "line": 76,
        "endLine": 83
      }
    ]
  },
  {
    "id": "qoni-track-api-create-monitor",
    "name": "qoni.track.api.createMonitor",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions — Track's clarification is not an Interaction > a monitor asking for input emits monitor.alignment_progress, not run.interaction",
        "line": 293,
        "endLine": 337
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.createMonitor() returns the snake_case monitor definition",
        "line": 231,
        "endLine": 254
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() answers a real alignment question and drives the monitor to active",
        "line": 355,
        "endLine": 470
      }
    ]
  },
  {
    "id": "qoni-track-api-get-monitor",
    "name": "qoni.track.api.getMonitor",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > escape hatch: api.getMonitor({ token, monitorId }) still speaks wire",
        "line": 235,
        "endLine": 240
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.getMonitor() re-reads the monitor by id",
        "line": 256,
        "endLine": 260
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() answers a real alignment question and drives the monitor to active",
        "line": 355,
        "endLine": 470
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.deleteMonitor() retires the monitor",
        "line": 472,
        "endLine": 491
      }
    ]
  },
  {
    "id": "qoni-track-api-run-now",
    "name": "qoni.track.api.runNow",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.runNow() fires an immediate tick and returns the tick record",
        "line": 280,
        "endLine": 288
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.deleteMonitor() retires the monitor",
        "line": 472,
        "endLine": 491
      }
    ]
  },
  {
    "id": "qoni-track-api-events",
    "name": "qoni.track.api.events",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions — Track's clarification is not an Interaction > a monitor asking for input emits monitor.alignment_progress, not run.interaction",
        "line": 293,
        "endLine": 337
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.events() streams the monitor's raw lifecycle envelopes",
        "line": 314,
        "endLine": 333
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() answers a real alignment question and drives the monitor to active",
        "line": 355,
        "endLine": 470
      }
    ]
  },
  {
    "id": "qoni-track-api-intervene",
    "name": "qoni.track.api.intervene",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() is refused with monitor_not_in_alignment on an active monitor",
        "line": 335,
        "endLine": 353
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() answers a real alignment question and drives the monitor to active",
        "line": 355,
        "endLine": 470
      }
    ]
  },
  {
    "id": "qoni-track-api-list-runs",
    "name": "qoni.track.api.listRuns",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.listRuns() / api.getRun() expose the tick runs at wire level",
        "line": 290,
        "endLine": 312
      }
    ]
  },
  {
    "id": "qoni-track-api-get-run",
    "name": "qoni.track.api.getRun",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.listRuns() / api.getRun() expose the tick runs at wire level",
        "line": 290,
        "endLine": 312
      }
    ]
  },
  {
    "id": "qoni-track-api-update-monitor",
    "name": "qoni.track.api.updateMonitor",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.updateMonitor() applies pause/resume through the PATCH route",
        "line": 262,
        "endLine": 278
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.events() streams the monitor's raw lifecycle envelopes",
        "line": 314,
        "endLine": 333
      }
    ]
  },
  {
    "id": "qoni-track-api-delete-monitor",
    "name": "qoni.track.api.deleteMonitor",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() answers a real alignment question and drives the monitor to active",
        "line": 355,
        "endLine": 470
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.deleteMonitor() retires the monitor",
        "line": 472,
        "endLine": 491
      }
    ]
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
        "file": "interactions.test.ts",
        "name": "live e2e: interactions — Track's clarification is not an Interaction > a monitor asking for input emits monitor.alignment_progress, not run.interaction",
        "line": 293,
        "endLine": 337
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.refine() is observable on monitor.events()",
        "line": 85,
        "endLine": 99
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > records a RECURRING scheduler-driven cadence to disk via event.raw",
        "line": 131,
        "endLine": 219
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
        "name": "live e2e: wire escape hatch — track.api > api.events() streams the monitor's raw lifecycle envelopes",
        "line": 314,
        "endLine": 333
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() answers a real alignment question and drives the monitor to active",
        "line": 355,
        "endLine": 470
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.events() streams the raw browser-harness envelopes to run.completed",
        "line": 602,
        "endLine": 663
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.events() streams the research pipeline to run.completed",
        "line": 778,
        "endLine": 806
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
        "line": 81,
        "endLine": 145
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > induction attempt: no PENDING interaction with declared actions is reachable here",
        "line": 211,
        "endLine": 258
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
        "line": 81,
        "endLine": 145
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > run.interactionHandle() wraps the backend's Interaction with matching identity",
        "line": 147,
        "endLine": 157
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > can() reports exactly the actions the backend declared",
        "line": 159,
        "endLine": 169
      },
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > every action method refuses an action the backend did not declare",
        "line": 171,
        "endLine": 209
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
        "line": 211,
        "endLine": 258
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
        "line": 706,
        "endLine": 714
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.cancel() on a settled run returns its terminal wire state",
        "line": 855,
        "endLine": 859
      }
    ]
  },
  {
    "id": "monitor-handle-get",
    "name": "MonitorHandle.get",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "query-matrix.test.ts",
        "name": "live e2e: local public Query matrix > $id [$function]",
        "line": 79,
        "endLine": 100,
        "dynamic": true,
        "via": "tokenFor()"
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.get() returns the normalized monitor definition",
        "line": 65,
        "endLine": 74
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > track.attach() reconnects to the monitor",
        "line": 76,
        "endLine": 83
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > records a RECURRING scheduler-driven cadence to disk via event.raw",
        "line": 131,
        "endLine": 219
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.get() addresses the run by id and returns the same wire envelope",
        "line": 143,
        "endLine": 150
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.createMonitor() returns the snake_case monitor definition",
        "line": 231,
        "endLine": 254
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.get() addresses the run by id",
        "line": 760,
        "endLine": 765
      }
    ]
  },
  {
    "id": "monitor-handle-pause",
    "name": "MonitorHandle.pause",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.pause() / resume() control scheduled execution",
        "line": 101,
        "endLine": 108
      }
    ]
  },
  {
    "id": "monitor-handle-resume",
    "name": "MonitorHandle.resume",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.pause() / resume() control scheduled execution",
        "line": 101,
        "endLine": 108
      }
    ]
  },
  {
    "id": "monitor-handle-refine",
    "name": "MonitorHandle.refine",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.refine() is observable on monitor.events()",
        "line": 85,
        "endLine": 99
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > records a RECURRING scheduler-driven cadence to disk via event.raw",
        "line": 131,
        "endLine": 219
      }
    ]
  },
  {
    "id": "monitor-handle-run-now",
    "name": "MonitorHandle.runNow",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runNow() triggers an immediate tick",
        "line": 110,
        "endLine": 114
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.runNow() fires an immediate tick and returns the tick record",
        "line": 280,
        "endLine": 288
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.deleteMonitor() retires the monitor",
        "line": 472,
        "endLine": 491
      }
    ]
  },
  {
    "id": "monitor-handle-events",
    "name": "MonitorHandle.events",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.refine() is observable on monitor.events()",
        "line": 85,
        "endLine": 99
      },
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > records a RECURRING scheduler-driven cadence to disk via event.raw",
        "line": 131,
        "endLine": 219
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.events() streams raw SSE envelopes through to search.results_ready",
        "line": 152,
        "endLine": 194
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.events() streams the monitor's raw lifecycle envelopes",
        "line": 314,
        "endLine": 333
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — track.api > api.intervene() answers a real alignment question and drives the monitor to active",
        "line": 355,
        "endLine": 470
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — doAnything.api > api.events() streams the raw browser-harness envelopes to run.completed",
        "line": 602,
        "endLine": 663
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.events() streams the research pipeline to run.completed",
        "line": 778,
        "endLine": 806
      }
    ]
  },
  {
    "id": "monitor-handle-interaction-handle",
    "name": "MonitorHandle.interactionHandle",
    "tier": "MOCK_ONLY",
    "tests": [],
    "noLiveTest": "仅 mock 覆盖（status=MOCK_ONLY）"
  },
  {
    "id": "monitor-handle-runs",
    "name": "MonitorHandle.runs",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runs() / monitor.run() expose tick runs read-only",
        "line": 221,
        "endLine": 231
      }
    ]
  },
  {
    "id": "monitor-handle-run",
    "name": "MonitorHandle.run",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.runs() / monitor.run() expose tick runs read-only",
        "line": 221,
        "endLine": 231
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — webSearch.api > api.run() posts the wire create body and returns the snake_case run envelope",
        "line": 121,
        "endLine": 141
      },
      {
        "file": "wire-api.test.ts",
        "name": "live e2e: wire escape hatch — deepResearch.api > api.run() posts the wire create body and returns the run envelope",
        "line": 740,
        "endLine": 758
      }
    ]
  },
  {
    "id": "monitor-handle-delete",
    "name": "MonitorHandle.delete",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "track.test.ts",
        "name": "live e2e: Track (semantic surface) > monitor.delete() removes the monitor",
        "line": 242,
        "endLine": 247
      }
    ]
  },
  {
    "id": "interaction-handle-can",
    "name": "InteractionHandle.can",
    "tier": "VERIFIED",
    "tests": [
      {
        "file": "interactions.test.ts",
        "name": "live e2e: interactions (InteractionHandle + run.interactionHandle) > can() reports exactly the actions the backend declared",
        "line": 159,
        "endLine": 169
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
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
        "line": 171,
        "endLine": 209
      }
    ]
  }
];
