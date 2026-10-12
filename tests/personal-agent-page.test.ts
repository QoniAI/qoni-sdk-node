import {afterEach,describe,expect,it,vi} from 'vitest';
import {createServer} from 'node:http';
import {Qoni,QoniError,QoniPermissionDeniedError,QoniTimeoutError,QoniUpstreamError,QoniValidationError} from '../src';

// Mock GA wire only. Real namespace, signing, parsing, transport and cancellation remain exercised.
const P='00000000-0000-4000-8000-000000000001';
const A='00000000-0000-4000-8000-000000000002';
const B='00000000-0000-4000-8000-000000000003';
const HOST='https://mock-control.invalid';
const AGENT_ERROR_PREFIX=['eak','agent'].join('.');
const input={displayName:'Alex 的购物助理',description:'替 Alex 比价、下单，并发送订单通知',channels:{email:'alex-shopper'}};
const json=(data:unknown)=>new Response(JSON.stringify({statusCode:200,data}),{headers:{'content-type':'application/json'}});
const pending=(extra:Record<string,unknown>={})=>({provisioningId:P,state:'creating',ready:false,agentId:null,readyAt:null,unboundExpiresAt:null,boundUserId:null,boundAt:null,mailboxResourceId:null,errorCode:null,mailboxAddress:null,bindingId:null,userId:null,...extra});
const ready=(extra:Record<string,unknown>={})=>pending({state:'ready',ready:true,agentId:A,readyAt:1000,unboundExpiresAt:604801000,mailboxResourceId:'actual-resource-in-mock',mailboxAddress:'provider-observed@mock.invalid',...extra});
const bound=(extra:Record<string,unknown>={})=>ready({state:'bound',unboundExpiresAt:null,boundUserId:'actual-user-in-mock',boundAt:2000,bindingId:B,userId:'actual-user-in-mock',...extra});
type Call={path:string,method:string,body:Record<string,unknown>,headers:Headers,signal:AbortSignal};
function harness(reply:(call:Call,n:number)=>Response|Promise<Response>,timeoutMs=999999){
 const calls:Call[]=[];
 const q=new Qoni({host:HOST,accessKey:'synthetic-ak',secretKey:'synthetic-sk',timeoutMs,fetch:async(url,init)=>{
  const call={path:new URL(String(url)).pathname,method:init?.method??'GET',body:JSON.parse(String(init?.body)),headers:new Headers(init?.headers),signal:init?.signal as AbortSignal};
  calls.push(call);return reply(call,calls.length);
 }});
 return {q,calls};
}
const page=(q:Qoni,extra:Record<string,unknown>={})=>q.genauth.agents.create({...input,...extra} as any) as Promise<any>;
const fakeClock=()=>vi.useFakeTimers({toFake:['setTimeout','clearTimeout','Date','performance']});
afterEach(()=>vi.useRealTimers());

describe('Personal page create',()=>{
 it('maps only proven id/address, generates one original key and signs exactly one mutation',async()=>{
  const {q,calls}=harness(()=>json(ready()));const out=await page(q);
  expect(out.id).toBe(A);expect(out.email).toBe('provider-observed@mock.invalid');expect(out.provisioningId).toBe(P);
  expect(out.email).not.toBe('alex-shopper@mock.invalid');expect(out.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/i);
  expect(calls).toHaveLength(1);expect(calls[0].path).toBe('/api/v3/eak/agents/create');expect(calls[0].method).toBe('POST');
  expect(calls[0].body).toEqual({displayName:input.displayName,description:input.description,mailboxLocalPart:'alex-shopper',idempotencyKey:out.idempotencyKey});
  expect(calls[0].headers.get('authorization')).toMatch(/^authing synthetic-ak:/);expect(calls[0].body).not.toHaveProperty('signal');
 });
 it('keeps caller-persisted explicit key without creating another operation',async()=>{
  const {q,calls}=harness(()=>json(ready()));const out=await page(q,{idempotencyKey:'app-persisted-original'});
  expect(out.idempotencyKey).toBe('app-persisted-original');expect(calls.map(c=>c.body.idempotencyKey)).toEqual(['app-persisted-original']);
 });
 it('normalizes only GA input text rules, preserves description content and never invents an address',async()=>{
  const {q,calls}=harness(()=>json(ready()));await page(q,{displayName:'  Alex  ',description:'\u0085  x\n正文  \u3000',channels:{email:' ALEX-Shopper '}});
  expect(calls[0].body).toMatchObject({displayName:'Alex',description:'x\n正文',mailboxLocalPart:'alex-shopper'});
 });
 it('description with 80k middle spaces fails validation promptly, without HTTP',async()=>{
  const {q,calls}=harness(()=>json(ready()));const start=performance.now();
  await expect(page(q,{description:'a'+' '.repeat(80000)+'b'})).rejects.toBeInstanceOf(QoniValidationError);
  const milliseconds=performance.now()-start;expect(milliseconds).toBeLessThan(300);expect(calls).toHaveLength(0);
 },15000);
 it('long Go whitespace ends normalize linearly while BOM and internal text remain unchanged',async()=>{
  const {q,calls}=harness(()=>json(ready()));const start=performance.now();
  await page(q,{description:'\u0085'.repeat(80000)+'\ufeff正文\ufeff'+'\u3000'.repeat(80000)});
  expect(calls[0].body.description).toBe('\ufeff正文\ufeff');expect(performance.now()-start).toBeLessThan(300);expect(calls).toHaveLength(1);
 });
 it('only explicitly accepted pending receipts permit readOnly observation',async()=>{
  const {q,calls}=harness((_c,n)=>json(n===1?pending():ready()));const out=await page(q);
  expect(out.id).toBe(A);expect(calls.map(c=>c.path)).toEqual(['/api/v3/eak/agents/create','/api/v3/eak/agents/get']);
  expect(calls[1].body).toEqual({provisioningId:P,readOnly:true});expect(calls[1].signal).toBeInstanceOf(AbortSignal);
 });
 for(const [name,changes] of [
  ['missing address',{mailboxAddress:undefined}],['null address',{mailboxAddress:null}],['missing resource',{mailboxResourceId:null}],
  ['invalid formal id',{agentId:'label-not-a-uuid'}],['invalid provisioning id',{provisioningId:'not-a-uuid'}],['missing new contract',{bindingId:undefined}],
  ['address control character',{mailboxAddress:'x@mock.invalid\n'}],
  ['unbound binding id',{bindingId:B}],
 ] as const)it('does not claim ready or observe with '+name,async()=>{
  const {q,calls}=harness(()=>json(ready(changes)));const error=await page(q).catch(e=>e);
  expect(error.name).toBe('PersonalAgentCreateError');expect(error.retryable).toBe(false);expect(error.idempotencyKey).toBe(calls[0].body.idempotencyKey);expect(calls).toHaveLength(1);
 });
 for(const changes of [{state:'unknown'},{provisioningId:'bad'},{errorCode:'PROVIDER_CONFIG_REQUIRED'},{mailboxAddress:undefined}])it('pending errors or UNKNOWN never trigger observation '+JSON.stringify(changes),async()=>{
  const {q,calls}=harness(()=>json(pending(changes)));await expect(page(q)).rejects.toMatchObject({name:'PersonalAgentCreateError',retryable:false});expect(calls).toHaveLength(1);
 });
 it('retains original key/known provisioning id when later get returns a different row',async()=>{
  const {q,calls}=harness((_c,n)=>json(n===1?pending():ready({provisioningId:B})));const error=await page(q).catch(e=>e);
  expect(error.provisioningId).toBe(P);expect(error.idempotencyKey).toBe(calls[0].body.idempotencyKey);expect(calls).toHaveLength(2);
 });
 for(const phase of ['create','observation'])it('preserves wire HTTP200/business403 at '+phase+' without another request',async()=>{
  const envelope={statusCode:403,code:'eak.delegation.needs_authorization',message:'actual rejection in mock',details:{reason:'needs_authorization'},requestId:'mock-request'};
  const {q,calls}=harness((_c,n)=>phase==='observation'&&n===1?json(pending()):new Response(JSON.stringify(envelope),{status:200}));
  const error=await page(q).catch(e=>e);expect(error.name).toBe('PersonalAgentCreateError');expect(error.code).toBe(envelope.code);expect(error.status).toBe(403);
  expect(error.body).toEqual(envelope);expect(error.requestId).toBe('mock-request');expect(error.cause).toBeInstanceOf(QoniPermissionDeniedError);expect(error.cause.body).toEqual(envelope);
  expect(error.retryable).toBe(false);expect(error.recovery).toEqual({idempotencyKey:calls[0].body.idempotencyKey,readOnly:true});expect(calls).toHaveLength(phase==='create'?1:2);
 });
 it('exposes the original key on lost response and never repeats mutation or follows with get',async()=>{
  const original=new TypeError('fetch failed after synthetic commit');const {q,calls}=harness(()=>{throw original;});
  const error=await page(q).catch(e=>e);expect(error.name).toBe('PersonalAgentCreateError');expect(error.cause).toBeInstanceOf(QoniUpstreamError);
  expect(error.cause.cause).toBe(original);expect(error.idempotencyKey).toBe(calls[0].body.idempotencyKey);expect(error.provisioningId).toBeUndefined();expect(calls).toHaveLength(1);
 });
 it('malformed HTTP200 is UNKNOWN with original key and no observation',async()=>{
  const {q,calls}=harness(()=>new Response('not-json',{status:200}));const error=await page(q).catch(e=>e);
  expect(error.name).toBe('PersonalAgentCreateError');expect(error.idempotencyKey).toBe(calls[0].body.idempotencyKey);expect(calls).toHaveLength(1);
 });
 it('enforces at most 20 read-only observations, cancels timers, never recreates pending resource',async()=>{
  fakeClock();const {q,calls}=harness(()=>json(pending()));const outcome=page(q).catch(e=>e);
  await vi.advanceTimersByTimeAsync(25000);const error=await outcome;
  expect(error.name).toBe('PersonalAgentCreateError');expect(error.provisioningId).toBe(P);expect(calls.filter(c=>c.path.endsWith('/create'))).toHaveLength(1);
  expect(calls.filter(c=>c.path.endsWith('/get'))).toHaveLength(20);expect(calls.slice(1).every(c=>c.body.readOnly===true)).toBe(true);expect(vi.getTimerCount()).toBe(0);
 });
 it('aborts observation at 5 seconds through the actual signed transport',async()=>{
  fakeClock();let aborted=false;const {q,calls}=harness((c,n)=>n===1?json(pending()):new Promise((_r,reject)=>c.signal.addEventListener('abort',()=>{aborted=true;reject(c.signal.reason);},{once:true})));
  const outcome=page(q).catch(e=>e);await vi.advanceTimersByTimeAsync(4999);expect(aborted).toBe(false);expect(calls).toHaveLength(2);
  await vi.advanceTimersByTimeAsync(1);const error=await outcome;expect(aborted).toBe(true);expect(error.code).toBe('timeout');expect(error.provisioningId).toBe(P);
  expect(calls).toHaveLength(2);expect(vi.getTimerCount()).toBe(0);
 });
 it('includes initial create in 120-second total and aborts the last get at remaining 1 second',async()=>{
  fakeClock();let aborted=false;const {q,calls}=harness((c,n)=>n===1?new Promise(resolve=>setTimeout(()=>resolve(json(pending())),119000)):new Promise((_r,reject)=>c.signal.addEventListener('abort',()=>{aborted=true;reject(c.signal.reason);},{once:true})));
  const outcome=page(q).catch(e=>e);await vi.advanceTimersByTimeAsync(119999);expect(aborted).toBe(false);expect(calls).toHaveLength(2);
  await vi.advanceTimersByTimeAsync(1);const error=await outcome;expect(aborted).toBe(true);expect(error.code).toBe('timeout');expect(error.provisioningId).toBe(P);expect(calls).toHaveLength(2);expect(vi.getTimerCount()).toBe(0);
 });
 it('aborts an initial create exceeding total budget and never observes UNKNOWN',async()=>{
  fakeClock();let aborted=false;const {q,calls}=harness(c=>new Promise((_r,reject)=>c.signal.addEventListener('abort',()=>{aborted=true;reject(c.signal.reason);},{once:true})));
  const outcome=page(q).catch(e=>e);await vi.advanceTimersByTimeAsync(120000);const error=await outcome;
  expect(aborted).toBe(true);expect(error.code).toBe('timeout');expect(error.idempotencyKey).toBe(calls[0].body.idempotencyKey);expect(calls).toHaveLength(1);expect(vi.getTimerCount()).toBe(0);
 });
 it('shorter caller timeout cancels initial mutation without expanding its existing timeout',async()=>{
  fakeClock();let aborted=false;const {q,calls}=harness(c=>new Promise((_r,reject)=>c.signal.addEventListener('abort',()=>{aborted=true;reject(c.signal.reason);},{once:true})),20);
  const outcome=page(q).catch(e=>e);await vi.advanceTimersByTimeAsync(20);const error=await outcome;
  expect(aborted).toBe(true);expect(error.code).toBe('timeout');expect(error.cause).toBeInstanceOf(QoniTimeoutError);expect(calls).toHaveLength(1);expect(vi.getTimerCount()).toBe(0);
 });
 for(const extra of [{channels:{email:'x',mail:true}},{mailboxLocalPart:'x'},{channels:{email:'<placeholder>'}},{idempotencyKey:'x y'},{idempotencyKey:'x'.repeat(129)},{description:'x\0y'},{description:'\ud800'},{description:'汉'.repeat(342)}])it('invalid page shape is zero HTTP '+JSON.stringify(extra),async()=>{
  const {q,calls}=harness(()=>json(ready()));await expect(page(q,extra)).rejects.toBeInstanceOf(QoniValidationError);expect(calls).toHaveLength(0);
 });
});

describe('get selectors and bindUser',()=>{
 it('key recovery is exactly a readOnly get, no local Map or new create',async()=>{
  const {q,calls}=harness(()=>json(ready()));const receipt=await (q.genauth.agents.get as any)({idempotencyKey:'app-persisted-original',readOnly:true});
  expect(receipt.mailboxAddress).toBe('provider-observed@mock.invalid');expect(calls).toHaveLength(1);expect(calls[0].body).toEqual({idempotencyKey:'app-persisted-original',readOnly:true});
 });
 it('formal Agent selector works in a newly constructed client without provisioning mapping',async()=>{
  const {q,calls}=harness(()=>json(ready()));await (q.genauth.agents.get as any)({agentId:A,readOnly:true});expect(calls[0].body).toEqual({agentId:A,readOnly:true});expect(calls).toHaveLength(1);
 });
 it('readOnly history keeps archived boundUserId but does not invent a current user or binding receipt',async()=>{
  const {q,calls}=harness(()=>json(bound({state:'archived_external',ready:false,agentId:null,mailboxAddress:null,bindingId:null,userId:null})));
  const result=await q.genauth.agents.get({idempotencyKey:'original-history-key',readOnly:true});
  expect(result.state).toBe('archived_external');expect(result.boundUserId).toBe('actual-user-in-mock');expect(result.userId).toBeNull();expect(result.bindingId).toBeNull();expect(calls).toHaveLength(1);
 });
 for(const input of [{},{agentId:A,provisioningId:P},{agentId:A,idempotencyKey:'key'},{provisioningId:P,readOnly:'true'},{agentId:'label'},{idempotencyKey:'key',ownerUserId:'other'},{idempotencyKey:'key'},{idempotencyKey:'key',readOnly:false},{agentId:'ABCDEFAB-0000-4000-8000-000000000002',readOnly:true}])it('rejects invalid selectors before any HTTP '+JSON.stringify(input),async()=>{
  const {q,calls}=harness(()=>json(ready()));await expect((q.genauth.agents.get as any)(input)).rejects.toBeInstanceOf(QoniValidationError);expect(calls).toHaveLength(0);
 });
 it('bindUser maps only formal agentId, current token and owner once, requires actual binding receipt',async()=>{
  const {q,calls}=harness(()=>json(bound()));const result=await (q.genauth.agents as any).bindUser({agentId:A,userAccessToken:'synthetic-user-token',relation:'owner'});
  expect(result.bindingId).toBe(B);expect(result.userId).toBe('actual-user-in-mock');expect(calls).toHaveLength(1);expect(calls[0].path).toBe('/api/v3/eak/agents/bind');
  expect(calls[0].body).toEqual({agentId:A,accessToken:'synthetic-user-token',relation:'owner'});expect(calls[0].body).not.toHaveProperty('userId');
 });
 for(const extra of [{relation:'admin'},{userId:'root'},{provisioningId:P},{agentId:'audit-label'},{userAccessToken:''},{agentId:'ABCDEFAB-0000-4000-8000-000000000002'}])it('invalid bindUser is zero HTTP '+JSON.stringify(extra),async()=>{
  const {q,calls}=harness(()=>json(bound()));await expect((q.genauth.agents as any).bindUser({agentId:A,userAccessToken:'synthetic-user-token',relation:'owner',...extra})).rejects.toBeInstanceOf(QoniValidationError);expect(calls).toHaveLength(0);
 });
 for(const changes of [{bindingId:null},{bindingId:A+'.invalid'},{userId:null},{userId:'other-user'},{agentId:B},{state:'ready',boundUserId:null,boundAt:null,unboundExpiresAt:604801000}])it('bindUser never fills missing or wrong binding facts '+JSON.stringify(changes),async()=>{
  const {q,calls}=harness(()=>json(bound(changes)));await expect((q.genauth.agents as any).bindUser({agentId:A,userAccessToken:'synthetic-user-token',relation:'owner'})).rejects.toBeInstanceOf(QoniUpstreamError);expect(calls).toHaveLength(1);
 });
 it('structured GA binding denial is preserved without another POST',async()=>{
  const body={statusCode:403,code:AGENT_ERROR_PREFIX+'.person_binding_mismatch',message:'mock denial',requestId:'mock-bind-request'};
  const {q,calls}=harness(()=>new Response(JSON.stringify(body),{status:200}));const error=await (q.genauth.agents as any).bindUser({agentId:A,userAccessToken:'synthetic-user-token',relation:'owner'}).catch((e:any)=>e);
  expect(error).toBeInstanceOf(QoniPermissionDeniedError);expect(error.body).toEqual(body);expect(calls).toHaveLength(1);
 });
 for(const method of ['bindUser','get'])it('new '+method+' failure preserves original 503 facts but is non-retryable',async()=>{
  const body={statusCode:503,code:AGENT_ERROR_PREFIX+'.source_unknown',message:'mock unavailable',requestId:'mock-503',details:{original:true}};
  const {q,calls}=harness(()=>new Response(JSON.stringify(body),{status:200}));
  const promise=method==='get'?(q.genauth.agents.get as any)({agentId:A,readOnly:true}):(q.genauth.agents as any).bindUser({agentId:A,userAccessToken:'synthetic-user-token',relation:'owner'});
  const error=await promise.catch((e:any)=>e);expect(error).toBeInstanceOf(QoniUpstreamError);expect(error.retryable).toBe(false);
  expect(error.code).toBe(body.code);expect(error.status).toBe(503);expect(error.requestId).toBe('mock-503');expect(error.body).toEqual(body);expect(calls).toHaveLength(1);
 });
 it('legacy create/get/bind retain old receipt shape and old error classes, with no page polling',async()=>{
  const legacy=pending();delete (legacy as any).mailboxAddress;delete (legacy as any).bindingId;delete (legacy as any).userId;
  const {q,calls}=harness(()=>json(legacy));expect(await q.genauth.agents.create({displayName:'old',idempotencyKey:'explicit-old'})).toEqual(legacy);
  expect(await q.genauth.agents.get({provisioningId:'old-reference'})).toEqual(legacy);expect(calls).toHaveLength(2);
  await expect(q.genauth.agents.bind({provisioningId:'old-reference',accessToken:'synthetic-token'})).rejects.toBeInstanceOf(QoniUpstreamError);expect(calls).toHaveLength(3);
  const denied=harness(()=>new Response(JSON.stringify({statusCode:403,code:'original.code'}),{status:200}));
  const error=await denied.q.genauth.agents.create({displayName:'old',idempotencyKey:'explicit-old'}).catch(e=>e);expect(error).toBeInstanceOf(QoniPermissionDeniedError);expect(error.name).not.toBe('PersonalAgentCreateError');
 });
});

it('real loopback observation is cancelled: socket closes before response, exactly one create and one get',async()=>{
 let cancelled=false;const calls:Array<{path:string,body:any}>=[];
 const server=createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;calls.push({path:req.url!,body:JSON.parse(body)});
  if(req.url?.endsWith('/create')){res.setHeader('content-type','application/json');res.end(JSON.stringify({statusCode:200,data:pending()}));}
  else res.once('close',()=>{if(!res.writableEnded)cancelled=true;});
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const port=(server.address() as any).port;
 try{
  const q=new Qoni({host:'http://127.0.0.1:'+port,accessKey:'synthetic-loopback-ak',secretKey:'synthetic-loopback-sk',timeoutMs:30000});
  const error=await page(q).catch(e=>e);expect(error.name).toBe('PersonalAgentCreateError');expect(error.code).toBe('timeout');
  for(let i=0;i<50&&!cancelled;i++)await new Promise(r=>setTimeout(r,10));
  expect(cancelled).toBe(true);expect(calls.map(c=>c.path)).toEqual(['/api/v3/eak/agents/create','/api/v3/eak/agents/get']);expect(calls[1].body).toEqual({provisioningId:P,readOnly:true});
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
},8000);
