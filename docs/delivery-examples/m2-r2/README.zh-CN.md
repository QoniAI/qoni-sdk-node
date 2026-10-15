# 修订的记忆任务错误处理

[memory-outcome.ts](./memory-outcome.ts) 仅适用于导出 `QoniTaskSubmissionUnknownError`、`QoniMemoryRunPhase` 和 `QoniError.phase/submissionUnknown` 的修订候选包。[English](./README.md)

上级示例与本错误示例可使用同一统一本地候选包；此前分别固定的归档保持为历史输入。新增错误合同不改变 `runWithMemory` 输入与成功时的 `{run,memory}` 返回，也不改普通 `run()` 的错误。

`startMemoryRunOnce` 最多提交一次。`task_handle_returned` 只表示拿到句柄，不是 Task 已完成。`submission_unknown` 表示进入过实际 Task fetch、但没有明确结果；保留原请求，不自动创建替代任务，有条件时向服务端核对，不能宣称 Task 一定已创建。

`request_failed` 保留 SDK 的 code/status、phase 和 retryable；该标记不是写入重放许可。`recall`、`task_permission` 且 `submissionUnknown: false` 表示未派发 Task POST；明确服务端拒绝也可能是 `task_submit` 加 false。helper 不记录 body/cause/原始错误消息。

在独立 consumer 目录安装修订本地包，用实际公开 DTS 编译。不要手写声明补齐缺失类型，也不要假定原 0.9.0 候选或 npm 包已有新类。后端与云验证另计。

把本子目录复制到独立可写 consumer 目录，再运行：

```bash
npm install --ignore-scripts /absolute/path/to/reviewed-m2-corrected-candidate.tgz
npm run smoke
```

本地 consumer 只用合成 loopback 回包，检查九项：新类 ESM/CJS 导出、召回拒绝、权限拒绝、回包丢失、超时、无可用成功结果、明确 Task 拒绝、成功返回句柄、错误不附原始数据。`results.json` 须九项全部 PASS 且 server 已关闭。这组与上级目录的 12 项原候选用例分开。
