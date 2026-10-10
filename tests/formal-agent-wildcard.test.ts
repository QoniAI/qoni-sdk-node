import {describe,it,expect} from 'vitest';
import {createHmac} from 'node:crypto';
import {Qoni,QoniError,QoniPermissionDeniedError,QoniValidationError} from '../src';
const agentId='01234567-89ab-4cde-8f01-23456789abcd';
const host='https://control.synthetic.invalid',path='/api/v3/eak/delegations';
const granted={statusCode:200,data:{mode:'silent',tokenType:'Bearer',token:'synthetic-token',expiresIn:1800,grantId:'synthetic-grant',auditId:'synthetic-audit'}};
const denial={statusCode:403,code:'eak.delegation.needs_authorization',message:'Delegation consent rejected: needs_authorization',details:{reason:'needs_authorization'},requestId:'synthetic-request'};
function harness(payload:unknown=granted){
 const calls:{url:string;method:string|undefined;raw:string;body:any;headers:Headers}[]=[];
 const qoni=new Qoni({host,accessKey:'synthetic-ak',secretKey:'synthetic-sk',fetch:async(url,init)=>{
  const raw=String(init?.body);calls.push({url:String(url),method:init?.method,raw,body:JSON.parse(raw),headers:new Headers(init?.headers)});
  return new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json'}});
 }});return{qoni,calls};
}
describe('formal Agent singleton wildcard is a server-side intent, never SDK expansion',()=>{
 for(const mode of [undefined,'silent'] as const){
  const label=mode===undefined?'default':'explicit';
  it(label+' sends star once without discovery/products/labels',async()=>{
   const {qoni,calls}=harness();const input=Object.freeze({agentId,userId:'synthetic-user',scopes:Object.freeze(['*']),expiresIn:'30m',...(mode?{mode}:{})});
   const result=await qoni.genauth.delegateAgent(input);expect(result).toMatchObject({mode:'silent',token:'synthetic-token',grantId:'synthetic-grant'});
   expect(calls).toHaveLength(1);expect(calls[0]).toMatchObject({url:host+path,method:'POST',body:{agentId,userId:'synthetic-user',scopes:['*'],expiresIn:1800,...(mode?{mode}:{})}});
   expect(Object.keys(calls[0].body).sort()).toEqual(mode?['agentId','expiresIn','mode','scopes','userId']:['agentId','expiresIn','scopes','userId']);
   expect(input.scopes).toEqual(['*']);
   const headers=calls[0].headers,canonical=[...headers.keys()].filter(k=>k.startsWith('x-authing-')||k==='date').sort().map(k=>`${k}:${headers.get(k)!.replace(/[\t\n\r\f]/g,' ').trim()}\n`).join('');
   const resource=path+`?agentId=${agentId}&expiresIn=1800${mode?'&mode=silent':''}&scopes=["*"]&userId=synthetic-user`;
   const signature=createHmac('sha1','synthetic-sk').update('POST\n'+canonical+resource,'utf8').digest('base64');
   expect(headers.get('authorization')?.endsWith(':'+signature)).toBe(true);
  });
  it(label+' HTTP200/business403 preserves code/body and never starts authorization or retries',async()=>{
   const {qoni,calls}=harness(denial);let resolved:any;
   const error=await qoni.genauth.delegateAgent({agentId,userId:'synthetic-user',scopes:['*'],...(mode?{mode}:{})}).then(value=>{resolved=value;}).catch(e=>e);
   expect(error).toBeInstanceOf(QoniPermissionDeniedError);expect(error).toMatchObject({status:403,code:denial.code,message:denial.message,body:denial,requestId:denial.requestId,retryable:false});
   expect(resolved).toBeUndefined();expect(calls).toHaveLength(1);expect(calls[0].url).toBe(host+path);expect(calls[0].body.scopes).toEqual(['*']);
   for(const key of ['token','authorizationUrl','delegateAgentToken']){expect(Object.hasOwn(error,key)).toBe(false);expect(Object.hasOwn(error.body,key)).toBe(false);}
  });
 }
 it('does not cache or expand scopes across caller-initiated requests',async()=>{
  const {qoni,calls}=harness();for(let i=0;i<2;i++)await qoni.genauth.delegateAgent({agentId,userId:'synthetic-user',scopes:['*']});
  expect(calls.map(c=>c.url)).toEqual([host+path,host+path]);expect(calls.map(c=>c.body.scopes)).toEqual([['*'],['*']]);
 });
 it.each([
  ['mixed concrete',{scopes:['*','agent.mail:read']}],['duplicate sentinel',{scopes:['*','*']}],['star products',{scopes:['*'],products:['mail']}],['star empty products',{scopes:['*'],products:[]}],
  ['nested pattern',{scopes:['agent.*:read']}],['nested scope array',{scopes:[['*']]}],['invalid JS mode',{scopes:['*'],mode:'interactve'}],
  ['interactive star',{scopes:['*'],mode:'interactive',redirectUri:'https://app.synthetic.invalid/callback',state:'D'}],
  ['label star',{agentId:undefined,agent:'legacy-label',scopes:['*']}],['automatic SDK label star',{agentId:undefined,scopes:['*']}],
  ['UUID plus label',{agent:'legacy-label',scopes:['*']}],['non UUID',{agentId:'legacy-label',scopes:['*']}],['missing silent user',{userId:undefined,scopes:['*']}],
 ])('%s is a clear local validation error with zero HTTP',async(_name,overrides)=>{
  const {qoni,calls}=harness();const error=await qoni.genauth.delegateAgent({agentId,userId:'synthetic-user',...overrides} as any).catch(e=>e);
  expect(error).toBeInstanceOf(QoniValidationError);expect(calls).toHaveLength(0);
 });
});
