# GenAuth / Authing management

GenAuth uses the Authing v3 management API contract. The SDK exposes 591 JSON management methods in 35 namespaces, with generated TypeScript inputs, results and enum values. The primary reference is the [official Authing Node SDK 4.0.2](https://github.com/Authing/authing-node-sdk/tree/cc9f6ed7e0f41542d94d2634fb4fa8a35a622a86): all 496 JSON methods are included, alongside 95 GenAuth extension/compatibility names. Each deployment still enforces its own permissions, entitlements and business rules.

The pinned upstream snapshot is in `scripts/contracts/authing-management.json`. The generator uses official method names, HTTP verbs, routes, DTOs and defaults. Checked GenAuth server contracts supplement older optional fields and query/body bindings where the official SDK differs from the deployed service. The original convenience methods remain usable; callers need not supply fields such as group descriptions or department metadata just because upstream types mark them required. Upstream models have the `GenAuthSdk` prefix; GenAuth extension models retain the `GenAuth` prefix. The [upstream MIT notice](./authing-sdk-LICENSE.txt) is included in the package.

```ts
import { Qoni } from '@qoniai/qoni';

const qoni = new Qoni({
  accessKey: process.env.QONI_ACCESS_KEY!,
  secretKey: process.env.QONI_SECRET_KEY!,
});

const { data: users } = await qoni.genauth.users.list({ page: 1, limit: 20 });
const { data: user } = await qoni.genauth.users.get({ userId: users.list[0].userId });
```

All management calls use the credential-bound userpool. They do not need a user access token, a delegated token or `QONI_USER_ID`. The SDK discovers GenAuth through Qoni runtime configuration, exchanges AK/SK for a management token, caches it and coalesces concurrent exchanges. It reads token expiry from `expiresIn` or JWT `exp` and refreshes once on an authentication rejection. Permission errors, business errors, timeouts and network failures never automatically replay writes.

## Domain namespaces and Authing method names

Use a domain shortcut, or keep the Authing v3 endpoint name when migrating existing code. Both call the same management endpoint:

```ts
await qoni.genauth.groups.create({ code: 'engineering', name: 'Engineering' });
// Equivalent alternative; do not run both to create the same group:
// await qoni.genauth.management.createGroup({ code: 'engineering', name: 'Engineering' });

await qoni.genauth.groups.addMembers({ code: 'engineering', userIds: ['USER_ID'] });
```

Namespaces: `users`, `roles`, `groups`, `organizations`, `departments`, `applications`, `namespaces`, `resources`, `permissions`, `policies`, `dataPermissions`, `tenants`, `identityProviders`, `customFields`, `auditLogs`, `sessions`, `security`, `webhooks`, `sync`, `pipelines`, `dynamicGroups`, `accessKeys`, `whitelist`, `positions`, `publicAccounts`, `invitations`, `metadata`, `email`, `billing`, `events`, `riskLists`, `deviceRules`, `devices`, `approvals`, `ldap`.

```ts
const posts = await qoni.genauth.positions.list({ keywords: 'engineer' });
// Official method spelling is also available:
// await qoni.genauth.management.postList({ keywords: 'engineer' });
const accounts = await qoni.genauth.publicAccounts.list({
  options: { pagination: { page: 1, limit: 10 } },
});
```

All methods take one input object. Official positional scalar methods use a named property, e.g. `management.deleteById({ id })`; the SDK encodes the identifier into the route and removes it from query/body. PUT approval methods preserve their request bodies. `management.getTenantEnterpriseCertification` accepts official `tenantId` and GenAuth `tenant_id`, mapping both to the deployed query key; conflicting values fail locally.

See [the complete API catalog](./genauth-management-api.md) for exact methods and aliases. Existing `users.list/get/getBatch/create/createBatch/update/deleteBatch` helpers remain available. Legacy GraphQL/v2 APIs and internal APIs are not included. The official `makeRequest` raw transport helper, `sub/initWebSocket/reconnect` WebSocket helpers and multipart `upload` are outside this JSON management surface; the official upload implementation does not send a file payload, so it is not exposed as a working JSON method.

## Roles and resources

A role or resource belongs to an existing permission namespace. Supply it explicitly if the userpool has no `default` namespace. Create application identifiers and namespace codes within the server's length limits (namespace codes and application identifiers should be at most 32 characters).

```ts
await qoni.genauth.namespaces.create({ code: 'project', name: 'Project' });
await qoni.genauth.roles.create({ namespace: 'project', code: 'reader', name: 'Reader' });
await qoni.genauth.roles.assign({
  namespace: 'project',
  code: 'reader',
  targets: [{ targetType: 'USER', targetIdentifier: 'USER_ID' }],
});
await qoni.genauth.resources.create({
  namespace: 'project', code: 'documents', type: 'API', apiIdentifier: '/documents',
  actions: [{ name: 'documents:read', description: 'Read documents' }],
});
await qoni.genauth.permissions.authorize({
  namespace: 'project',
  list: [{
    targetType: 'ROLE', targetIdentifiers: ['reader'],
    resources: [{ code: 'documents:*', resourceType: 'API', actions: ['documents:read'] }],
  }],
});
const { data } = await qoni.genauth.permissions.isAllowed({
  namespace: 'project', userId: 'USER_ID', resource: 'documents:123', action: 'documents:read',
});
console.log(data.allowed);
```

`resources.create` uses `type`; resource grants use `resourceType`. Resource actions use the full `resourceCode:action` format, such as `documents:read`. TypeScript highlights this distinction. Newer GenAuth permission configurations require API resources with `apiIdentifier`; the example works with that configuration. Server permission checks remain authoritative.

## Pagination and search

`users.list` accepts top-level `page` and `limit` and maps them into `options.pagination`, preserving other options. The flat `management.listUsers` method accepts the Authing DTO directly (`options.pagination`). Other list endpoints use their own typed pagination fields.

Keyword and advanced-filter queries use the GenAuth search provider. The SDK preserves server search semantics; set `options.fuzzySearchOn` to select the fields to search:

```ts
const result = await qoni.genauth.users.list({
  keywords: 'alice', page: 1, limit: 20,
  options: { fuzzySearchOn: ['username', 'email'] },
});

for await (const user of qoni.genauth.users.iterate({
  keywords: 'alice', limit: 50,
  options: { fuzzySearchOn: ['username'] },
})) {
  console.log(user.userId);
  // Breaking here prevents the next page from being requested.
}
```

`users.iterate` streams pages with a limit of 1–50. Filtered user queries depend on the server search index; a new user may be available through `get` before search has indexed it. Lists are not transactional snapshots; concurrent user changes may affect page contents. Batch methods accept arrays according to their DTOs; GET arrays are serialized using Authing's comma-separated query format.

Custom-field lists with `keyword` also use the server search provider, whereas lists without a keyword use the database. Check that the deployment's search provider supports and indexes these queries; the SDK surfaces upstream failures rather than silently replacing server filtering with a local scan.

## Responses, errors and cancellation

Methods return `QoniResponse<Result>`: business data is under `data`, while request identifiers remain under `meta`. Custom result generics are supported for private extensions.

```ts
import { QoniError } from '@qoniai/qoni';

try {
  const controller = new AbortController();
  const result = await qoni.genauth.roles.list({ namespace: 'project' }, { signal: controller.signal });
  console.log(result.data.list);
} catch (error) {
  if (error instanceof QoniError) {
    console.error(error.status, error.code, error.requestId, error.message);
  }
  throw error;
}
```

HTTP 200 with an error `statusCode` throws a typed `QoniError`, even if the response includes `data`. Numeric Authing `apiCode` values are preserved as strings in `error.code`; the original response remains in `error.body`.

`customFields.list` and `listUserBaseFields` default `targetType` to `USER`; specify it to query another supported subject. `customFields.set` requires `dataType` when creating or updating a definition; changing an existing field type is not supported.

Business rules are not bypassed. For example, an employed user cannot be deleted, and a user cannot be removed from their last department. Use the explicit `users.resign({ userId })` lifecycle operation only when departure is intended, then delete if needed. The SDK never resigns users automatically.

## Explicit management-token override

Every method accepts `adminToken` and `userPoolId` together. These go into headers rather than the business payload. Explicit tokens are not refreshed by the SDK. Configure `genauthHost` if the target GenAuth server differs from the discovered one.

```ts
await qoni.genauth.roles.list({
  namespace: 'project',
  adminToken: process.env.GENAUTH_MANAGEMENT_TOKEN!,
  userPoolId: process.env.GENAUTH_USERPOOL_ID!,
});
```

The access-key `eakBinding` property and legacy access-key type discriminator are server wire identifiers and retain their original spelling.

## Verification and regeneration

```sh
pnpm typecheck
pnpm test
pnpm test:e2e:genauth
GENAUTH_SOURCE_DIR=/path/to/genauth pnpm gen:genauth-management
GENAUTH_SOURCE_DIR=/path/to/genauth node scripts/gen-genauth-management.mjs --check
# Refresh the pinned contract after reviewing a newer official SDK checkout:
AUTHING_SDK_SOURCE_DIR=/path/to/authing-node-sdk pnpm gen:genauth-management
```

Live tests read `.env.local` (`QONI_ACCESS_KEY`, `QONI_SECRET_KEY`, optional `QONI_HOST` / `QONI_GENAUTH_HOST`). They create only uniquely named fixtures, exercise management writes and relationships, and clean those fixtures. Cleanup failures fail the suite. Use a dedicated test userpool. Live tests cover representative workflows; the generated contract catalog is not a claim that every operation has been exercised on every deployment.
