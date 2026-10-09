import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// 本地 tgz 接受检查：不 install、不访问 npm、不读取任何线上许可。
const packagePath = process.argv[2];
if (!packagePath) throw new Error("用法：node scripts/test-task-facade-package.mjs <独立本地 tgz>");
const work = await mkdtemp(join(tmpdir(), "qoni-task-packed-"));
try {
  const packageDir = join(work, "node_modules/@qoniai/qoni");
  await mkdir(packageDir, { recursive: true });
  execFileSync("tar", ["-xzf", resolve(packagePath), "--strip-components=1", "-C", packageDir]);
  const metadata = JSON.parse(await readFile(join(packageDir, "package.json"), "utf8"));
  assert.equal(metadata.name, "@qoniai/qoni");
  assert.equal(metadata.version, "0.9.0");
  assert.deepEqual(metadata.exports["."], { types: "./dist/index.d.ts", import: "./dist/index.js", require: "./dist/index.cjs" });
  const consumer = `
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { createRequire } from "node:module";
import * as esm from "@qoniai/qoni";
const cjs = createRequire(import.meta.url)("@qoniai/qoni");
const received = [];
const synthetic = "synthetic-packed-private-token";
const server = createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = JSON.parse(raw);
  received.push({ method: req.method, path: req.url, body, id: req.headers["x-request-id"], bearerCorrect: req.headers.authorization === "Bearer " + synthetic, noSignedHeaders: Object.keys(req.headers).every(key => !key.startsWith("x-authing-")) });
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ code: 0, message: "success", data: body.session_id ? { session_id: body.session_id } : { request_id: req.headers["x-request-id"], message_count: body.messages.length } }));
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const host = "http://127.0.0.1:" + server.address().port + "/package-base";
let permissionCalls = 0;
try {
  for (const packageExports of [esm, cjs]) {
    assert.equal(typeof packageExports.createTaskClient, "function");
    assert.throws(() => new packageExports.Qoni({}), /accessKey and secretKey/);
    const task = packageExports.createTaskClient({ productHosts: { gumem: host }, runId: "packed-run", tokenProvider: async (product, scopes, runId, signal) => {
      permissionCalls++;
      assert.equal(product, "gumem");
      assert.deepEqual(scopes, ["gumem.memory:write"]);
      assert.equal(runId, "packed-run");
      assert.equal(signal.aborted, false);
      return { accessToken: synthetic, expiresAt: Date.now() + 30_000 };
    } });
    assert.deepEqual(Object.keys(task), ["memory"]);
    assert.deepEqual(Object.keys(task.memory), ["createSession", "addMessages"]);
    assert.equal((await task.memory.createSession()).data.session_id, "qoni-run-packed-run");
    const added = await task.memory.addMessages({ messages: [{ id: "pi:packed-entry", role: "user", content: "获准的包测试消息" }] });
    assert.equal(added.data.message_count, 1);
    assert.equal(JSON.stringify(task).includes(synthetic), false);
    await assert.rejects(task.memory.createSession({ token: "injected" }), packageExports.QoniValidationError);
  }
  assert.equal(permissionCalls, 4);
  assert.equal(received.length, 4);
  assert.equal(received.every(row => row.method === "POST" && row.bearerCorrect && row.noSignedHeaders), true);
  assert.deepEqual(received[0].body, { user_id: "", session_id: "qoni-run-packed-run" });
  assert.equal(received[1].path, "/package-base/api/sessions/qoni-run-packed-run/messages");
  assert.equal(received[1].id, received[3].id);
  console.log(JSON.stringify({ passed: true, esm: true, cjs: true, version: "0.9.0", real_loopback_requests: received.length, current_permission_calls: permissionCalls, stable_request_id: true, ak_sk_requests: 0, secret_output: false }));
} finally {
  await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
}
`;
  await writeFile(join(work, "consumer.mjs"), consumer);
  const output = execFileSync(process.execPath, [join(work, "consumer.mjs")], { encoding: "utf8", cwd: work });
  process.stdout.write(output);
} finally { await rm(work, { recursive: true, force: true }); }
