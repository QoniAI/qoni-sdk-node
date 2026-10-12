import { describe, expect, it, vi } from 'vitest';
import { Qoni, QoniPermissionDeniedError, QoniValidationError } from '../src';
import { readFileSync } from 'node:fs';
import { genAuthManagementRoutes } from '../src/generated/genauth-management-routes';

function harness(options: { exchange?: (n: number) => unknown; reply?: (url: URL, init: RequestInit, n: number) => Response | Promise<Response> } = {}) {
  const calls: { url: URL; init: RequestInit }[] = [];
  let exchanges = 0;
  const fetchImpl = vi.fn(async (url: URL | RequestInfo, init: RequestInit = {}) => {
    const parsed = new URL(String(url));
    calls.push({ url: parsed, init });
    if (parsed.pathname.endsWith('/admin-token')) { exchanges++; return json({ data: options.exchange?.(exchanges) ?? { accessToken: `admin-${exchanges}`, userPoolId: 'pool' } }); }
    return options.reply?.(parsed, init, calls.length) ?? json({ statusCode: 200, data: { list: [], totalCount: 0 } });
  }) as unknown as typeof fetch;
  const client = new Qoni({ accessKey: 'ak_test', secretKey: 'sk_test', host: 'https://qoni.test', genauthHost: 'https://pool.genauth.test/base', gumemHost: 'https://gum.test', webAgentHost: 'https://web.test', fetch: fetchImpl });
  return { client, calls, exchangeCount: () => exchanges, fetchImpl };
}
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }); }
const body = (call: { init: RequestInit }) => JSON.parse(String(call.init.body));

describe('GenAuth management', () => {
  it('includes every JSON management method in the pinned official Authing SDK', () => {
    const upstream = JSON.parse(readFileSync(new URL('../scripts/contracts/authing-management.json', import.meta.url), 'utf8'));
    expect(upstream.source.version).toBe('4.0.2');
    expect(upstream.operations).toHaveLength(496);
    for (const operation of upstream.operations) {
      expect(genAuthManagementRoutes[operation.name as keyof typeof genAuthManagementRoutes], operation.name).toMatchObject({ method: operation.method, path: operation.path });
    }
    expect(upstream.excluded.map((entry: { name: string }) => entry.name).sort()).toEqual(['initWebSocket', 'makeRequest', 'reconnect', 'sub', 'upload']);
  });

  it('preserves official method names, defaults and explicit false/zero in the new position domain', async () => {
    const h = harness();
    await h.client.genauth.positions.list({ skipCount: false, createdAfter: 0, flatCustomData: true });
    const call = h.calls[1];
    expect(call.init.method).toBe('GET');
    expect(call.url.pathname).toBe('/base/api/v3/list-post');
    expect(Object.fromEntries(call.url.searchParams)).toEqual({ page: '1', limit: '10', flatCustomData: 'true', metadataNoFieldId: 'false', skipCount: 'false', createdAfter: '0' });
    await h.client.genauth.management.getAccessKeyList({});
    expect(h.calls[2].url.pathname).toBe('/base/api/v3/list-access-key');
  });

  it('sends approval PUT bodies and interpolates risk-list DELETE identifiers safely', async () => {
    const h = harness();
    await h.client.genauth.approvals.process({ number: 'approval-1', isAgreed: false });
    expect(h.calls[1].init.method).toBe('PUT');
    expect(h.calls[1].url.pathname).toBe('/base/api/v3/approval-process');
    expect(body(h.calls[1])).toEqual({ number: 'approval-1', isAgreed: false });
    await h.client.genauth.riskLists.deleteIp({ id: 'id/with space?' });
    expect(h.calls[2].init.method).toBe('DELETE');
    expect(h.calls[2].url.pathname).toBe('/base/api/v3/ip-list/id%2Fwith%20space%3F');
    expect(h.calls[2].url.search).toBe('');
    expect(body(h.calls[2])).toEqual({});
    await expect(h.client.genauth.management.deleteUserListById({ id: '' })).rejects.toBeInstanceOf(QoniValidationError);
    expect(h.calls).toHaveLength(3);
  });

  it('accepts the official tenant query spelling and rejects ambiguous aliases locally', async () => {
    const h = harness();
    await h.client.genauth.management.getTenantEnterpriseCertification({ tenantId: 'tenant' });
    expect(h.calls[1].url.search).toBe('?tenant_id=tenant');
    await expect(h.client.genauth.management.getTenantEnterpriseCertification({ tenantId: 'one', tenant_id: 'two' } as never)).rejects.toBeInstanceOf(QoniValidationError);
    expect(h.calls).toHaveLength(2);
  });

  it('sends new public-account and metadata DTOs to the official routes', async () => {
    const h = harness();
    await h.client.genauth.publicAccounts.list({ options: { pagination: { page: 1, limit: 2 } } });
    expect(h.calls[1].url.pathname).toBe('/base/api/v3/list-public-accounts');
    expect(body(h.calls[1])).toEqual({ options: { pagination: { page: 1, limit: 2 } } });
    await h.client.genauth.management.getRowBatch({ modelId: 'model', rowIds: ['one'] });
    expect(h.calls[2].url.pathname).toBe('/base/get-row-batch');
  });

  it('shares one in-flight AK/SK exchange across users, roles and groups, preserving auth boundaries', async () => {
    const h = harness({ exchange: () => ({ accessToken: 'management-token', userPoolId: 'pool' }) });
    await Promise.all([h.client.genauth.users.list(), h.client.genauth.roles.list(), h.client.genauth.groups.list()]);
    expect(h.exchangeCount()).toBe(1);
    expect(h.calls[0].url.origin).toBe('https://qoni.test');
    expect(h.calls[0].init.headers).toMatchObject({ authorization: expect.stringMatching(/^authing ak_test:/) });
    for (const c of h.calls.slice(1)) {
      expect(c.url.origin).toBe('https://pool.genauth.test');
      expect(c.url.pathname.startsWith('/base/api/v3/')).toBe(true);
      expect(c.init.headers).toMatchObject({ authorization: 'Bearer management-token', 'x-authing-userpool-id': 'pool' });
      expect(c.init.headers).not.toHaveProperty('x-authing-access-key-id');
    }
  });

  it('maps role assignment and resource authorization to their distinct wire contracts', async () => {
    const h = harness();
    await h.client.genauth.roles.assign({ code: 'editor', namespace: 'project', targets: [{ targetType: 'USER', targetIdentifier: 'user' }] });
    await h.client.genauth.permissions.authorize({ namespace: 'project', list: [{ targetType: 'ROLE', targetIdentifiers: ['editor'], resources: [{ code: 'document', resourceType: 'DATA', actions: ['read'] }] }] });
    expect(h.calls[1].url.pathname).toBe('/base/api/v3/assign-role');
    expect(body(h.calls[1])).toEqual({ code: 'editor', namespace: 'project', targets: [{ targetType: 'USER', targetIdentifier: 'user' }] });
    expect(h.calls[2].url.pathname).toBe('/base/api/v3/authorize-resources');
    expect(body(h.calls[2])).toMatchObject({ namespace: 'project', list: [{ targetType: 'ROLE' }] });
  });

  it('offers flat Authing names and domain shortcuts with equivalent requests', async () => {
    const h = harness();
    await h.client.genauth.management.createGroup({ code: 'team', name: 'Team' });
    await h.client.genauth.groups.create({ code: 'team', name: 'Team' });
    expect(h.calls[1].url.toString()).toBe(h.calls[2].url.toString());
    expect(body(h.calls[1])).toEqual(body(h.calls[2]));
  });

  it('splits mixed query/body DTOs and maps named query parameters', async () => {
    const h = harness();
    await h.client.genauth.applications.updateLoginPageConfig({ tenantId: 'tenant', appId: 'app', update: {} });
    expect(h.calls[1].url.searchParams.get('tenantId')).toBe('tenant');
    expect(body(h.calls[1])).toEqual({ appId: 'app', update: {} });
    await h.client.genauth.tenants.getTenantEnterpriseCertification({ tenant_id: 'tenant' });
    expect(h.calls[2].url.searchParams.get('tenant_id')).toBe('tenant');
  });

  it('serializes GET arrays as comma-separated strings and preserves false/zero values', async () => {
    const h = harness();
    await h.client.genauth.management.getUserBatch({ userIds: ['one', 'two'], withCustomData: false });
    expect(h.calls[1].url.searchParams.get('userIds')).toBe('one,two');
    expect(h.calls[1].url.searchParams.get('withCustomData')).toBe('false');
    expect(h.calls[1].init.body).toBeUndefined();
  });

  it('retains filters and nested user-list options while normalizing pagination', async () => {
    const h = harness();
    const input = { page: 2, limit: 3, keywords: 'alice', options: { withCustomData: true, pagination: { page: 9, limit: 9 } } };
    await h.client.genauth.users.list(input);
    expect(body(h.calls[1])).toEqual({ keywords: 'alice', options: { withCustomData: true, pagination: { page: 2, limit: 3 } } });
    expect(input.options.pagination).toEqual({ page: 9, limit: 9 });
  });

  it('iterates matching users across pages, preserves filters and stops without overfetching', async () => {
    const h = harness({ reply: (_, init) => {
      const input = JSON.parse(String(init.body));
      const page = input.options.pagination.page;
      expect(input.keywords).toBe('test');
      return json({ data: { totalCount: 3, list: page === 1 ? [{ userId: 'one' }, { userId: 'two' }] : [{ userId: 'three' }] } });
    } });
    const ids: string[] = [];
    for await (const user of h.client.genauth.users.iterate({ keywords: 'test', limit: 2 })) ids.push(user.userId);
    expect(ids).toEqual(['one', 'two', 'three']);
    expect(h.calls.filter(c => c.url.pathname.endsWith('/list-users'))).toHaveLength(2);
  });

  it('allows an iterator consumer to stop early without fetching the next page', async () => {
    const h = harness({ reply: () => json({ data: { totalCount: 3, list: [{ userId: 'one' }, { userId: 'two' }] } }) });
    for await (const user of h.client.genauth.users.iterate({ limit: 2 })) { expect(user.userId).toBe('one'); break; }
    expect(h.calls).toHaveLength(2);
  });

  it('does not send manual credentials in the query or body and bypasses token exchange', async () => {
    const h = harness();
    await h.client.genauth.roles.get({ code: 'role', adminToken: 'manual-token', userPoolId: 'manual-pool' });
    expect(h.exchangeCount()).toBe(0);
    expect(h.calls[0].url.search).toBe('?code=role');
    expect(h.calls[0].init.headers).toMatchObject({ authorization: 'Bearer manual-token', 'x-authing-userpool-id': 'manual-pool' });
  });

  it('fails locally for invalid identifiers, empty batch arrays and pagination', async () => {
    const h = harness();
    await expect(h.client.genauth.roles.get({ code: '' })).rejects.toBeInstanceOf(QoniValidationError);
    await expect(h.client.genauth.groups.addMembers({ code: 'team', userIds: [] })).rejects.toBeInstanceOf(QoniValidationError);
    await expect(h.client.genauth.roles.list({ page: -1 })).rejects.toBeInstanceOf(QoniValidationError);
    await expect(h.client.genauth.users.list({ limit: 0 })).rejects.toBeInstanceOf(QoniValidationError);
    expect(h.calls).toHaveLength(0);
  });

  it('rejects incomplete or ambiguous userpool overrides before network access', async () => {
    const h = harness();
    await expect(h.client.genauth.roles.list({ adminToken: 'token' })).rejects.toBeInstanceOf(QoniValidationError);
    await expect(h.client.genauth.roles.list({ userPoolId: 'another-pool' })).rejects.toBeInstanceOf(QoniValidationError);
    await expect(h.client.genauth.roles.list({ adminToken: '', userPoolId: 'pool' })).rejects.toBeInstanceOf(QoniValidationError);
    expect(h.calls).toHaveLength(0);
  });

  it('throws HTTP-200 business errors even when data is null or includes error details', async () => {
    for (const data of [null, { reason: 'missing_permission' }]) {
      const h = harness({ reply: () => json({ statusCode: 403, apiCode: 1003, message: 'Denied', requestId: 'r1', data }) });
      await expect(h.client.genauth.roles.list()).rejects.toMatchObject({ name: 'QoniPermissionDeniedError', status: 403, code: '1003', requestId: 'r1', body: { data } });
      expect(h.exchangeCount()).toBe(1);
    }
  });

  it('refreshes an automatically exchanged token once after concurrent auth rejection', async () => {
    const h = harness({ reply: async (_, init) => {
      if ((init.headers as Record<string, string>).authorization === 'Bearer admin-1') {
        await new Promise(resolve => setTimeout(resolve, 2));
        return json({ statusCode: 401, message: 'Invalid credential', data: null });
      }
      return json({ data: { list: [], totalCount: 0 } });
    } });
    await Promise.all([h.client.genauth.roles.list(), h.client.genauth.groups.list()]);
    expect(h.exchangeCount()).toBe(2);
    expect(h.calls.filter(c => (c.init.headers as Record<string, string>).authorization === 'Bearer admin-2')).toHaveLength(2);
  });

  it('does not replay writes for permissions, validation, network or server failures', async () => {
    for (const status of [400, 403, 500]) {
      const h = harness({ reply: () => json({ statusCode: status, message: 'Rejected' }) });
      await expect(h.client.genauth.roles.create({ code: 'new' })).rejects.toMatchObject({ status });
      expect(h.calls.filter(c => c.url.pathname.endsWith('/create-role'))).toHaveLength(1);
      expect(h.exchangeCount()).toBe(1);
    }
    const h = harness({ reply: () => { throw new TypeError('fetch failed'); } });
    await expect(h.client.genauth.roles.create({ code: 'new' })).rejects.toMatchObject({ name: 'QoniUpstreamError' });
    expect(h.calls).toHaveLength(2);
  });

  it('does not mistake an expired business object for a rejected management token', async () => {
    const h = harness({ reply: () => json({ statusCode: 422, code: 'role.expired', message: 'Role has expired' }) });
    await expect(h.client.genauth.roles.assign({ code: 'role', targets: [{ targetType: 'USER', targetIdentifier: 'user' }] })).rejects.toMatchObject({ code: 'role.expired' });
    expect(h.calls).toHaveLength(2);
    expect(h.exchangeCount()).toBe(1);
  });

  it('preserves explicitly chosen search fields and supplies the default custom-field subject', async () => {
    const h = harness();
    await h.client.genauth.users.list({ keywords: 'alice', options: { fuzzySearchOn: ['email'] } });
    expect(body(h.calls[1])).toEqual({ keywords: 'alice', options: { fuzzySearchOn: ['email'] } });
    await h.client.genauth.customFields.list();
    expect(h.calls[2].url.searchParams.get('targetType')).toBe('USER');
    await h.client.genauth.customFields.list({ targetType: 'ROLE' });
    expect(h.calls[3].url.searchParams.get('targetType')).toBe('ROLE');
  });

  it('does not refresh manually provided tokens or retry a second rejection', async () => {
    const h = harness({ reply: () => json({ statusCode: 401, message: 'Unauthorized' }) });
    await expect(h.client.genauth.roles.list({ adminToken: 'manual', userPoolId: 'pool' })).rejects.toMatchObject({ status: 401 });
    expect(h.exchangeCount()).toBe(0);
    const a = harness({ reply: () => json({ statusCode: 401, message: 'Unauthorized' }) });
    await expect(a.client.genauth.roles.list()).rejects.toMatchObject({ status: 401 });
    expect(a.exchangeCount()).toBe(2);
  });

  it('uses JWT exp when the server omits expiresIn', async () => {
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 10 })).toString('base64url');
    const h = harness({ exchange: n => ({ accessToken: n === 1 ? `e30.${payload}.signature` : 'fresh', userPoolId: 'pool' }) });
    await h.client.genauth.roles.list();
    await h.client.genauth.groups.list();
    expect(h.exchangeCount()).toBe(2);
  });

  it('recovers from a failed in-flight token exchange on the next call', async () => {
    const h = harness({ exchange: n => n === 1 ? {} : { accessToken: 'recovered', userPoolId: 'pool' } });
    await expect(h.client.genauth.roles.list()).rejects.toMatchObject({ status: 502 });
    await h.client.genauth.groups.list();
    expect(h.exchangeCount()).toBe(2);
  });

  it('supports cancellation before starting and while waiting on a shared token exchange', async () => {
    const h = harness();
    const signal = AbortSignal.abort(new Error('canceled'));
    await expect(h.client.genauth.roles.list({}, { signal })).rejects.toThrow('canceled');
    expect(h.calls).toHaveLength(0);
    let resolveExchange!: (v: Response) => void;
    const pending = new Promise<Response>(resolve => { resolveExchange = resolve; });
    const client = new Qoni({ accessKey: 'a', secretKey: 's', genauthHost: 'https://genauth.test', fetch: (() => pending) as typeof fetch });
    const controller = new AbortController();
    const request = client.genauth.roles.list({}, { signal: controller.signal });
    controller.abort(new Error('canceled during exchange'));
    await expect(request).rejects.toThrow('canceled during exchange');
    resolveExchange(json({ data: { accessToken: 'token', userPoolId: 'pool' } }));
  });
});
