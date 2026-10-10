import { describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { Qoni, QoniError, QoniTimeoutError, QoniValidationError } from '../src';
import { genAuthCommunicationRoutes } from '../src/generated/genauth-communication-routes';

const standard = { accessKeyId: 'native-key', accessKeySecret: 'native-secret', userPoolId: 'pool' };
function harness(reply?: (url: URL, init: RequestInit, n: number) => Response | Promise<Response>, credentials: typeof standard | {accessToken:string;userPoolId:string} | undefined = standard) {
  const calls: Array<{url:URL;init:RequestInit}> = [];
  let exchanges = 0;
  const fetch = vi.fn(async (value: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(value)); calls.push({url,init});
    if (url.pathname.endsWith('/get-management-token')) return json({access_token:`native-${++exchanges}`,expires_in:3600});
    if (url.pathname.endsWith('/admin-token')) return json({accessToken:'owner',userPoolId:'pool'});
    return reply?.(url,init,calls.filter(c => !c.url.pathname.endsWith('-token')).length) ?? json({items:[]});
  }) as typeof globalThis.fetch;
  const client = new Qoni({accessKey:'qoni-key',secretKey:'qoni-secret',host:'https://qoni.test',genauthHost:'https://genauth.test',fetch,genauthCommunicationCredentials:credentials});
  return {client,calls,fetch};
}
function json(data: unknown, status = 200, headers?: Record<string,string>) { return new Response(JSON.stringify({statusCode:status,message:'OK',data}),{status,headers}); }
function fail(code: string, status = 409, retryable = false) { return new Response(JSON.stringify({statusCode:status,message:'Failed',requestId:'request-test',error:{code,retryable}}),{status}); }
const fieldValues: Record<string,unknown> = {
  personaId:'persona/with space',mailboxId:'mailbox',resourceId:'number',configId:'config',templateId:'template',administratorId:'admin',operationId:'operation',taskId:'task',accountId:'account',verificationRequestId:'verification',messageId:'message',
  displayName:'SDK',providerType:'agentmail',providerAccountKey:'account',namespaceKey:'namespace',provider:'twilio',name:'Provider',apiKey:'api-key',
  settings:{allowedDomains:['mail.example.com'],defaultDomain:'mail.example.com',capabilities:['mail.send'],countries:['US'],services:['demo'],currency:'USD',dailyLimit:'1.00',pricingVerified:false,verifiedRoutes:[]},
  credentials:{accountSid:`AC${'0'.repeat(32)}`,authToken:'test'},platformKey:'demo',externalRef:'attempt',registrationResult:'recorded',phone:'+12025550123',label:'SDK',status:'Suspended',reason:'SDK test',to:'+12025550123',subject:'Hello',text:'SDK test',body:'SDK test',
  kind:'number',spec:{country:'US'},quoteId:'quote',maxCost:{amount:'0.05',currency:'USD'},service:'demo',rules:{pattern:'([0-9]{6})'},country:'US',
  actions:[],actorId:'key',actorType:'key',personaIds:[],resourceIds:[],enabled:true,match:{fromDomains:['example.com']},extract:{kind:'code',pattern:'([0-9]{6})'},sender:'noreply@example.com',version:1,outcome:'confirmed_not_sent',evidenceRef:'evidence-reference',idempotencyKey:'stable-key',revision:3,
};
function example(route: typeof genAuthCommunicationRoutes[number]): Record<string,unknown> {
  const out: Record<string,unknown>={};
  for(const f of route.inputFields) if(f.required) out[f.name]=fieldValues[f.name]??'example';
  if(route.name==='agentMail.verifications.create') out.templateId='template';
  return out;
}
function method(client: Qoni, name: string): (input: any,options?: any)=>Promise<any> { return name.split('.').reduce((x,k)=>x[k],client.genauth as any); }

describe('GenAuth communication contract', () => {
  it('keeps generated routes and public DTOs synchronized with the reviewed snapshot',()=>{
    const checked=spawnSync(process.execPath,['scripts/gen-genauth-communication.mjs','--check'],{encoding:'utf8'});
    expect(checked.status,checked.stdout+checked.stderr).toBe(0);
  });
  it('covers all independently captured backend controller routes exactly once', () => {
    const contract=JSON.parse(readFileSync(new URL('../scripts/contracts/genauth-communication.json',import.meta.url),'utf8'));
    const key=(r:{method:string;path:string})=>`${r.method} ${r.path.replace(/\{\w+\}/g,'{}')}`;
    expect(new Set(genAuthCommunicationRoutes.map(key))).toEqual(new Set(contract.controllerRoutes.map(key)));
    expect(genAuthCommunicationRoutes).toHaveLength(111);
  });
  for(const route of genAuthCommunicationRoutes) it(`${route.name}: method/path/payload/auth/headers`,async () => {
    const h=harness(); const input=example(route);
    const res=await method(h.client,route.name)(input);
    expect(res.data).toEqual({items:[]});
    const {url,init}=h.calls.at(-1)!; const headers=new Headers(init.headers);
    expect(url.pathname).toBe(route.path.replace(/\{(\w+)\}/g,(_,key)=>encodeURIComponent(String(input[key]))));
    expect(init.method).toBe(route.method);
    const admin=route.name.includes('.admin.');
    expect(headers.get('authorization')).toBe(`Bearer ${admin?'owner':'native-1'}`);
    expect(headers.get('x-authing-userpool-id')).toBe('pool');
    expect(headers.get('if-match')).toBe(route.revision?'"3"':null);
    expect(headers.get('idempotency-key')).toBe(route.idempotency?'stable-key':null);
    if(admin&&route.method!=='GET') expect(headers.get(route.name.startsWith('agentMail.')?'x-agent-mail-admin':'x-agent-phone-admin')).toBe('1');
    const pathKeys:readonly string[]=route.pathKeys; const queryKeys:readonly string[]=route.queryKeys;
    const expected=Object.fromEntries(Object.entries(input).filter(([k])=>!pathKeys.includes(k)&&!['revision','idempotencyKey'].includes(k)));
    if(route.method==='GET') {expect(init.body).toBeUndefined();expect(Object.fromEntries(url.searchParams)).toEqual(Object.fromEntries(Object.entries(expected).map(([k,v])=>[k,String(v)])));}
    else {expect(JSON.parse(String(init.body))).toEqual(Object.fromEntries(Object.entries(expected).filter(([k])=>!queryKeys.includes(k))));}
    expect(String(init.body??'')).not.toContain('native-secret');
  });
  it('coalesces native exchanges across both modules; administration uses the separate owner token',async()=>{
    const h=harness();await Promise.all([h.client.genauth.agentMail.personas.list({}),h.client.genauth.agentPhone.numbers.list({personaId:'p'}),h.client.genauth.agentMail.admin.health.get(),h.client.genauth.agentPhone.admin.providers.list()]);
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/get-management-token'))).toHaveLength(1);
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/admin-token'))).toHaveLength(1);
    expect(JSON.parse(String(h.calls.find(c=>c.url.pathname.endsWith('/get-management-token'))?.init.body))).toEqual({accessKeyId:'native-key',accessKeySecret:'native-secret'});
  });
  it('refreshes once only after an HTTP authentication rejection, preserving write idempotency',async()=>{
    const h=harness((_url,init)=>new Headers(init.headers).get('authorization')==='Bearer native-1'?fail('UNAUTHORIZED',401):json({operationId:'op'}));
    await h.client.genauth.agentMail.mailboxes.create({personaId:'p',idempotencyKey:'same'});
    const writes=h.calls.filter(c=>c.url.pathname.endsWith('/mailboxes'));
    expect(writes).toHaveLength(2);expect(writes.map(c=>new Headers(c.init.headers).get('idempotency-key'))).toEqual(['same','same']);
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/get-management-token'))).toHaveLength(2);
  });
  it.each([[403,'FORBIDDEN'],[409,'RESULT_UNKNOWN'],[412,'PRECONDITION_FAILED'],[503,'PROVIDER_UNAVAILABLE']] as const)('does not replay HTTP %s (%s)',async(status,code)=>{
    const h=harness(()=>fail(code,status,false));
    await expect(h.client.genauth.agentPhone.numbers.send({personaId:'p',resourceId:'r',to:'+12025550123',body:'test',maxCost:{amount:'0.1',currency:'USD'},idempotencyKey:'same'})).rejects.toMatchObject({status,code,retryable:false,requestId:'request-test'});
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/sends'))).toHaveLength(1);
  });
  it('does not replay a network failure or explicit bearer credentials',async()=>{
    const h=harness(()=>{throw new TypeError('fetch failed');});
    await expect(h.client.genauth.agentMail.mailboxes.create({personaId:'p',idempotencyKey:'same'})).rejects.toMatchObject({code:'upstream.failed'});
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/mailboxes'))).toHaveLength(1);
    const explicit=harness(()=>fail('UNAUTHORIZED',401),{accessToken:'supplied',userPoolId:'pool'});
    await expect(explicit.client.genauth.agentMail.personas.list({})).rejects.toMatchObject({status:401});
    expect(explicit.calls).toHaveLength(1);
  });
  it('requires native runtime credentials but permits Qoni-only administration',async()=>{
    const h=harness(undefined,undefined); // default argument deliberately overridden below
    const client=new Qoni({accessKey:'q',secretKey:'s',host:'https://qoni.test',genauthHost:'https://genauth.test',fetch:h.fetch});
    await expect(client.genauth.agentMail.personas.list({})).rejects.toBeInstanceOf(QoniValidationError);
    expect(h.calls).toHaveLength(0);
    await client.genauth.agentPhone.admin.providers.list();expect(h.calls).toHaveLength(2);
  });
  it('supports explicit per-call tokens and bound credentials without leaking them into bodies',async()=>{
    const h=harness();await h.client.genauth.agentMail.personas.create({displayName:'demo',idempotencyKey:'same',accessToken:'override',userPoolId:'other'});
    expect(h.calls).toHaveLength(1);expect(JSON.parse(String(h.calls[0].init.body))).toEqual({displayName:'demo'});
    expect(new Headers(h.calls[0].init.headers).get('x-authing-userpool-id')).toBe('other');
    const bound=h.client.genauth.agentPhone.withCredentials({accessToken:'bound',userPoolId:'bound-pool'});
    await bound.numbers.list({personaId:'p'});expect(new Headers(h.calls.at(-1)?.init.headers).get('authorization')).toBe('Bearer bound');
    await h.client.genauth.agentMail.admin.providers.list({adminToken:'administrator',userPoolId:'admin-pool'});
    expect(new Headers(h.calls.at(-1)?.init.headers).get('authorization')).toBe('Bearer administrator');
  });
  it.each([
    ['agentMail.messages.send',{personaId:'p',mailboxId:'m',to:'a@example.com',subject:'s',text:'t'}],
    ['agentPhone.numbers.release',{personaId:'p',resourceId:'r',reason:'release',idempotencyKey:'k'}],
    ['agentPhone.numbers.send',{personaId:'p',resourceId:'r',to:'+12025550123',body:'s',maxCost:{amount:0.1,currency:'USD'},idempotencyKey:'k'}],
    ['agentMail.verifications.create',{personaId:'p',mailboxId:'m',platformKey:'demo',externalRef:'r',templateId:'t',match:{},idempotencyKey:'k'}],
    ['agentMail.personas.get',{personaId:'',accessToken:'t',userPoolId:'p'}],
    ['agentPhone.admin.providers.test',{configId:'p',revision:1.1,idempotencyKey:'k'}],
    ['agentMail.personas.list',{accessToken:'t'}],
    ['agentPhone.numbers.list',{personaId:'p',limit:101}],
    ['agentPhone.numbers.list',{personaId:'p',unknown:'secret'}],
    ['agentPhone.admin.policies.create',{actorId:'key',actorType:'key',actions:[],personaIds:[],resourceIds:[],enabled:'true'}],
  ])('rejects invalid %s locally',async(name,input)=>{
    const h=harness();await expect(method(h.client,name)(input)).rejects.toBeInstanceOf(QoniValidationError);expect(h.calls).toHaveLength(0);
  });
  it('preserves response ETag and status metadata',async()=>{
    const h=harness(()=>json({personaId:'p',revision:2},201,{ETag:'"2"','X-Request-Id':'req-header'}));
    expect((await h.client.genauth.agentMail.personas.create({displayName:'test',idempotencyKey:'key'})).meta).toMatchObject({etag:'"2"',httpStatus:201,requestId:'req-header'});
  });
  it('waits only through pending/running; returns unknown without another command',async()=>{
    const h=harness((_url,_init,n)=>json({operationId:'op',status:n===1?'pending':'unknown',pollAfterSeconds:null}));
    const res=await h.client.genauth.agentMail.operations.wait({operationId:'op'},{pollIntervalMs:1,timeoutMs:1000});
    expect(res.data.status).toBe('unknown');expect(h.calls.filter(c=>c.url.pathname.endsWith('/op'))).toHaveLength(2);
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/op')).every(c=>c.init.method==='GET')).toBe(true);
  });
  it('honors a wait deadline including an in-flight HTTP request',async()=>{
    const h=harness((_url,init)=>new Promise<Response>((_resolve,reject)=>init.signal?.addEventListener('abort',()=>reject(init.signal?.reason),{once:true})));
    await expect(h.client.genauth.agentPhone.operations.wait({personaId:'p',operationId:'op'},{timeoutMs:25})).rejects.toBeInstanceOf(QoniTimeoutError);
  });
  it('cancels an outstanding sleep and an auth wait without cancelling other callers',async()=>{
    const h=harness(()=>json({status:'waiting'})); const cancel=new AbortController();
    const waiting=h.client.genauth.agentPhone.verifications.wait({personaId:'p',taskId:'t'},{signal:cancel.signal,pollIntervalMs:10000});
    setTimeout(()=>cancel.abort(new Error('cancelled')),15);await expect(waiting).rejects.toThrow('cancelled');
    const pre=new AbortController();pre.abort(new Error('pre-aborted'));const count=h.calls.length;
    await expect(h.client.genauth.agentMail.personas.list({},{signal:pre.signal})).rejects.toThrow('pre-aborted');expect(h.calls).toHaveLength(count);
  });
  it('waits for Phone administrator operations with Qoni-only credentials',async()=>{
    const h=harness(()=>json({id:'op',status:'succeeded'}));
    const client=new Qoni({accessKey:'q',secretKey:'s',host:'https://qoni.test',genauthHost:'https://genauth.test',fetch:h.fetch});
    expect((await client.genauth.agentPhone.admin.operations.wait({operationId:'op'})).data.status).toBe('succeeded');
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/get-management-token'))).toHaveLength(0);
    expect(new Headers(h.calls.at(-1)?.init.headers).get('authorization')).toBe('Bearer owner');
  });
  it('waits for verification matched/ready/ambiguous statuses without consuming secrets',async()=>{
    const h=harness(()=>json({status:'ambiguous',candidateIds:['c1','c2']}));
    expect((await h.client.genauth.agentPhone.verifications.wait({personaId:'p',taskId:'t'})).data.status).toBe('ambiguous');
    expect(h.calls.filter(c=>c.url.pathname.endsWith('/t'))).toHaveLength(1);
  });
});
