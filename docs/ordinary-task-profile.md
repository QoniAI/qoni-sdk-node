# Ordinary Task Profile / 本轮普通资料

Request `user.profile:read` and optionally `user.profile:write` in the original delegation, alongside the WebAgent scopes. They remain in the original GenAuth grant; they are not added to the WebAgent product token. The original Task source and current consent/key/field permissions jointly gate every operation.

```ts
const profile = await qoni.doAnything.profile.read({runId, token, fields: ["name", "address"]});
// Render profile.data.values only in the current user's authorized UI; do not log it.
// Only an explicitly authorised original source can save these ordinary fields.
await qoni.doAnything.profile.update({runId, token, values: {name: "Alice", address: "Road 1"}});
```

The main task can use `profile_fill` to reuse existing values and ask for only missing fields through the existing form. Skip/cancel writes nothing. Without save permission, answers are used in the current turn only. An unknown update is never automatically retried; read again to reconcile. A new request token cannot expand the Task's original source. A project admin credential cannot borrow another person's delegation.

姓名/地址等资料从原 Task 本人读取。缺失字段使用现有普通表单；跳过不保存。没有保存授权时只供本次使用。读写同时核原 grant 与当前同意、key 和字段权限，新令牌不能扩大旧 Task。提交结果未知时先重新读取，不自动重放。

Supported builtins: name, nickname, country, province, city, address, streetAddress, postalCode, company. `customData.<key>` supports visible/editable, nonencrypted primitive STRING/NUMBER/BOOLEAN definitions in the existing UDF store. Custom definitions with validation rules and other UDF types remain unavailable in this ordinary adapter. External custom user databases remain unavailable because they cannot share the GA SQL transaction.

Passwords, identity documents, payment fields, credentials, identity tokens and encrypted/desensitised custom fields are excluded. Email/phone changes retain their existing verification flow. Native Console save-only sources have no profile delegation and cannot be upgraded by this API. 本批不包含敏感代填或邮箱业务。
