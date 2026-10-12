import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Qoni, QoniError } from '../../src';
import { loadDotEnvLocal, requiredEnv } from '../helpers/env';

loadDotEnvLocal();
const live = process.env.QONI_LIVE_E2E === '1' ? describe : describe.skip;
const prefix = `qsdk-${Date.now().toString(36)}-${randomUUID().slice(0, 4)}`;

live('live GenAuth management (isolated fixtures)', () => {
  let client: Qoni;
  let userId: string;
  let batchIds: string[] = [];
  const namespace = `${prefix}-ns`;
  const customFieldKey = `${prefix.replaceAll('-', '_')}_tag`;
  const cleanup: Array<{ label: string; remove: () => Promise<unknown> }> = [];
  const track = (label: string, remove: () => Promise<unknown>) => cleanup.push({ label, remove });
  const has = (value: unknown, text: string) => expect(JSON.stringify(value)).toContain(text);

  beforeAll(async () => {
    client = new Qoni({
      accessKey: requiredEnv('QONI_ACCESS_KEY'), secretKey: requiredEnv('QONI_SECRET_KEY'),
      ...(process.env.QONI_HOST ? { host: process.env.QONI_HOST } : {}),
      ...(process.env.QONI_GENAUTH_HOST ? { genauthHost: process.env.QONI_GENAUTH_HOST } : {}),
      timeoutMs: 20000,
    });
    const created = await client.genauth.users.create({ username: `${prefix}-user`, password: `Qoni!${randomUUID()}Aa1` });
    userId = created.data.userId;
    expect(userId).toBeTruthy();
    track('user', async () => {
      await client.genauth.users.deleteBatch({ userIds: [userId] });
      await expect(client.genauth.users.get({ userId })).rejects.toMatchObject({ status: 404 });
    });
    await client.genauth.namespaces.create({ code: namespace, name: 'SDK test namespace' });
    track('namespace', () => client.genauth.namespaces.delete({ code: namespace }));
  });

  afterAll(async () => {
    const failures: string[] = [];
    if (userId) {
      try { await client.genauth.users.resignUser({ userId }); }
      catch (e) { failures.push(`resign fixture user: ${e instanceof QoniError ? `${e.status}/${e.code}` : 'failed'}`); }
    }
    for (const entry of cleanup.reverse()) {
      try { await entry.remove(); }
      catch (e) { failures.push(`${entry.label}: ${e instanceof QoniError ? `${e.status}/${e.code}` : 'cleanup failed'}`); }
    }
    if (failures.length) throw new Error(`Test fixture cleanup incomplete: ${failures.join('; ')}`);
  });

  it('users: create/get/update/plain pagination and comma-separated batch lookup', async () => {
    expect((await client.genauth.users.get({ userId })).data.userId).toBe(userId);
    await client.genauth.users.update({ userId, nickname: `${prefix}-updated` });
    expect((await client.genauth.management.getUser({ userId })).data.nickname).toBe(`${prefix}-updated`);
    const listed = await client.genauth.users.list({ page: 1, limit: 50 });
    has(listed.data, userId);
    const batch = await client.genauth.users.getBatch({ userIds: [userId] });
    has(batch.data, userId);
    const iterated: string[] = [];
    for await (const user of client.genauth.users.iterate({ limit: 1 })) {
      iterated.push(user.userId);
      if (user.userId === userId) break;
    }
    expect(iterated).toContain(userId);
  });

  it('users: bulk creation and multi-ID lookup', async () => {
    const created = await client.genauth.users.createBatch({ users: [
      { username: `${prefix}-batch1`, password: `Qoni!${randomUUID()}Aa1` },
      { username: `${prefix}-batch2`, password: `Qoni!${randomUUID()}Aa1` },
    ] });
    const ids = created.data.map(user => user.userId);
    batchIds = ids;
    expect(ids).toHaveLength(2);
    track('batch users', () => client.genauth.users.deleteBatch({ userIds: ids }));
    const found = await client.genauth.management.getUserBatch({ userIds: ids });
    for (const id of ids) has(found.data, id);
    expect(new Set(ids).size).toBe(2);
  });

  it('user keyword search must find the newly created fixture', async () => {
    await expect.poll(async () => (await client.genauth.users.list({ keywords: `${prefix}-user`, page: 1, limit: 1 })).data.list.map(user => user.userId), { timeout: 15000, interval: 1000 }).toContain(userId);
  });

  it('user advanced-filter pagination must find both batch fixtures', async () => {
    await expect.poll(async () => (await client.genauth.users.list({ advancedFilter: [{ field: 'id', operator: 'IN', value: batchIds }] })).data.totalCount, { timeout: 15000, interval: 1000 }).toBe(2);
    const iterated: string[] = [];
    for await (const user of client.genauth.users.iterate({ advancedFilter: [{ field: 'id', operator: 'IN', value: batchIds }], limit: 1 })) iterated.push(user.userId);
    expect(new Set(iterated)).toEqual(new Set(batchIds));
  });

  it('roles: CRUD, assign/revoke and member lookup', async () => {
    const code = `${prefix}-role`;
    await client.genauth.roles.create({ namespace, code, name: 'SDK test role' });
    track('role', () => client.genauth.roles.deleteBatch({ namespace, codeList: [code] }));
    expect((await client.genauth.roles.get({ namespace, code })).data.code).toBe(code);
    await client.genauth.roles.update({ namespace, code, name: `${prefix}-role-updated` });
    expect((await client.genauth.roles.get({ namespace, code })).data.name).toBe(`${prefix}-role-updated`);
    has((await client.genauth.roles.list({ namespace, keywords: prefix })).data, code);
    await client.genauth.roles.assign({ namespace, code, targets: [{ targetType: 'USER', targetIdentifier: userId }] });
    has((await client.genauth.roles.listMembers({ namespace, code })).data, userId);
    await client.genauth.roles.revoke({ namespace, code, targets: [{ targetType: 'USER', targetIdentifier: userId }] });
    expect(JSON.stringify((await client.genauth.roles.listMembers({ namespace, code })).data)).not.toContain(userId);
  });

  it('groups: CRUD and add/remove membership', async () => {
    const code = `${prefix}-group`;
    await client.genauth.groups.create({ code, name: 'SDK test group' });
    track('group', () => client.genauth.groups.deleteBatch({ codeList: [code] }));
    expect((await client.genauth.groups.get({ code })).data.code).toBe(code);
    await client.genauth.groups.update({ code, name: `${prefix}-group-updated` });
    expect((await client.genauth.groups.get({ code })).data.name).toBe(`${prefix}-group-updated`);
    await client.genauth.groups.addMembers({ code, userIds: [userId] });
    has((await client.genauth.groups.listMembers({ code })).data, userId);
    await client.genauth.groups.removeMembers({ code, userIds: [userId] });
    expect(JSON.stringify((await client.genauth.groups.listMembers({ code })).data)).not.toContain(userId);
  });

  it('organizations/departments: CRUD, hierarchy and membership', async () => {
    const organizationCode = `${prefix}-org`;
    const org = await client.genauth.organizations.create({ organizationCode, organizationName: 'SDK test organization' });
    track('organization', () => client.genauth.organizations.delete({ organizationCode }));
    expect(org.data.organizationCode).toBe(organizationCode);
    expect((await client.genauth.organizations.get({ organizationCode })).data.organizationCode).toBe(organizationCode);
    await client.genauth.organizations.update({ organizationCode, organizationName: `${prefix}-org-updated` });
    expect((await client.genauth.organizations.get({ organizationCode })).data.organizationName).toBe(`${prefix}-org-updated`);
    const department = await client.genauth.departments.create({ organizationCode, parentDepartmentId: 'root', name: 'SDK test department' });
    const departmentId = department.data.departmentId;
    expect(departmentId).toBeTruthy();
    track('department', () => client.genauth.departments.delete({ organizationCode, departmentId }));
    const ref = { organizationCode, departmentId };
    expect((await client.genauth.departments.get(ref)).data.departmentId).toBe(departmentId);
    await client.genauth.departments.update({ ...ref, name: `${prefix}-dept-updated` });
    has((await client.genauth.departments.listChildren({ organizationCode, departmentId: 'root' })).data, departmentId);
    await client.genauth.departments.addMembers({ organizationCode, departmentId: 'root', userIds: [userId] });
    await client.genauth.departments.addMembers({ ...ref, userIds: [userId] });
    has((await client.genauth.departments.listMembers(ref)).data, userId);
    await client.genauth.departments.removeMembers({ ...ref, userIds: [userId] });
    expect(JSON.stringify((await client.genauth.departments.listMembers(ref)).data)).not.toContain(userId);
  });

  it('namespaces/resources: CRUD and user permission grant/check', async () => {

    const code = 'documents';
    await client.genauth.resources.create({ namespace, code, type: 'API', apiIdentifier: '/qoni-sdk-test/documents', name: 'SDK test resource', actions: [{ name: `${code}:read`, description: 'Read' }] });
    track('resource', () => client.genauth.resources.delete({ namespace, code }));
    expect((await client.genauth.resources.get({ namespace, code })).data.code).toBe(code);
    await client.genauth.resources.update({ namespace, code, apiIdentifier: '/qoni-sdk-test/documents', description: `${prefix}-resource-updated` });
    expect((await client.genauth.resources.get({ namespace, code })).data.description).toBe(`${prefix}-resource-updated`);
    await client.genauth.permissions.authorize({ namespace, list: [{ targetType: 'USER', targetIdentifiers: [userId], resources: [{ code: `${code}:*`, resourceType: 'API', actions: [`${code}:read`] }] }] });
    const allowed = await client.genauth.permissions.isAllowed({ namespace, userId, action: `${code}:read`, resource: `${code}:one` });
    expect(allowed.data.allowed).toBe(true);
    has((await client.genauth.permissions.listResources({ namespace, targetType: 'USER', targetIdentifier: userId })).data, code);
  });

  it('applications: create/get/update and isolated deletion', async () => {
    const app = await client.genauth.applications.create({ appName: 'SDK test application', appIdentifier: `${prefix}-app`, appType: 'web', defaultProtocol: 'oidc', redirectUris: ['http://localhost:12345/callback'] });
    const appId = app.data.appId;
    expect(appId).toBeTruthy();
    track('application', () => client.genauth.applications.delete({ appId }));
    expect((await client.genauth.applications.get({ appId })).data.appId).toBe(appId);
    await client.genauth.applications.update({ appId, appName: `${prefix}-app-updated` });
    expect((await client.genauth.applications.get({ appId })).data.appName).toBe(`${prefix}-app-updated`);
  });

  it('custom fields: create/update definition and read/write user custom data', async () => {
    const key = customFieldKey;
    await client.genauth.customFields.setCustomFields({ list: [{ targetType: 'USER', key, dataType: 'STRING', label: 'SDK test tag' }] });
    track('custom field', () => client.genauth.customFields.deleteCustomFields({ list: [{ targetType: 'USER', key }] }));
    await client.genauth.customFields.setCustomData({ targetType: 'USER', targetIdentifier: userId, list: [{ key, value: 'sdk-value' }] });
    has((await client.genauth.customFields.getCustomData({ targetType: 'USER', targetIdentifier: userId })).data, 'sdk-value');
    await client.genauth.customFields.setCustomFields({ list: [{ targetType: 'USER', key, dataType: 'STRING', label: 'SDK test tag updated' }] });
    has((await client.genauth.customFields.listCustomFields()).data, key);
    has((await client.genauth.management.listCustFields({ targetType: 'USER', dataType: 'STRING', limit: 50 })).data, key);
  });

  it('official custom-field keyword search must find the created field', async () => {
    has((await client.genauth.management.listCustFields({ targetType: 'USER', dataType: 'STRING', keyword: customFieldKey })).data, customFieldKey);
  });

  it('returns a typed business error for a manual invalid management token', async () => {
    try {
      await client.genauth.roles.list({ adminToken: 'invalid-sdk-test-token', userPoolId: 'invalid-sdk-test-pool' });
      throw new Error('Invalid management token unexpectedly succeeded');
    } catch (e) {
      expect(e).toBeInstanceOf(QoniError);
      expect((e as QoniError).status).toBeGreaterThanOrEqual(400);
    }
  });

  it('official SDK positions: isolated create/get/update/delete', async () => {
    const code = `${prefix}-post`;
    await client.genauth.positions.create({ code, name: 'SDK test position' });
    track('position', () => client.genauth.positions.delete({ code }));
    expect((await client.genauth.positions.get({ code })).data.code).toBe(code);
    await client.genauth.positions.update({ code, name: `${prefix}-post-updated` });
    expect((await client.genauth.positions.get({ code })).data.name).toBe(`${prefix}-post-updated`);
    has((await client.genauth.positions.list({ keywords: code })).data, code);
  });

  const reads = [
    ['official publicAccounts.list', () => client.genauth.publicAccounts.list()],
    ['identityProviders.list', () => client.genauth.identityProviders.list()],
    ['sessions.list', () => client.genauth.sessions.list({ page: 1, limit: 1 })],
    ['customFields.listCustomFields', () => client.genauth.customFields.listCustomFields()],
    ['dataPermissions.listDataResources', () => client.genauth.dataPermissions.listDataResources()],
    ['tenants.list', () => client.genauth.tenants.list({ page: 1, limit: 1 })],
    ['webhooks.listWebhooks', () => client.genauth.webhooks.listWebhooks()],
    ['sync.listSyncTasks', () => client.genauth.sync.listSyncTasks()],
    ['pipelines.listPipelineFunctions', () => client.genauth.pipelines.listPipelineFunctions()],
    ['security.getSecuritySettings', () => client.genauth.security.getSecuritySettings()],
    ['auditLogs.getAdminAuditLogs', () => client.genauth.auditLogs.getAdminAuditLogs({ pagination: { page: 1, limit: 1 } })],
    ['auditLogs.getUserActionLogs', () => client.genauth.auditLogs.getUserActionLogs({ pagination: { page: 1, limit: 1 } })],
  ] as const;
  it.each(reads)('real management read: %s', async (_, call) => {
    const result = await call();
    expect(result.data).toBeDefined();
  });
});
