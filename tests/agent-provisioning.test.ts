import {describe,expect,it} from 'vitest';
import {Qoni,QoniUpstreamError,QoniValidationError} from '../src';
const receipt=(overrides:Record<string,unknown>={})=>({provisioningId:'original',state:'creating',ready:false,agentId:null,readyAt:null,unboundExpiresAt:null,boundUserId:null,boundAt:null,mailboxResourceId:null,errorCode:null,...overrides});
function harness(data:unknown){const calls:any[]=[];const q=new Qoni({accessKey:'fixture-ak',secretKey:'fixture-sk',host:'http://127.0.0.1:1234',fetch:async(url,init)=>{calls.push({url:String(url),body:JSON.parse(String(init?.body)),headers:init?.headers});return new Response(JSON.stringify({statusCode:200,data}),{headers:{'content-type':'application/json'}});}});return {q,calls};}
describe('M3 formal personal Agent signed wrappers',()=>{
 it('keeps create/get/bind, the approved bindUser entry and activate (0.10.0)',()=>{expect(Object.keys(harness({}).q.genauth.agents).sort()).toEqual(['activate','bind','bindUser','create','get']);});
 it('one signed POST preserves original request fields and pending receipt',async()=>{const {q,calls}=harness(receipt({privateKey:'must-not-escape'}));const result=await q.genauth.agents.create({displayName:'助手',mailboxLocalPart:'assistant',idempotencyKey:'one-key'});expect(result).toEqual(receipt());expect(calls).toHaveLength(1);expect(calls[0].url).toBe('http://127.0.0.1:1234/api/v3/eak/agents/create');expect(calls[0].body).toEqual({displayName:'助手',mailboxLocalPart:'assistant',idempotencyKey:'one-key'});expect(calls[0].headers.authorization).toMatch(/^authing fixture-ak:/);});
 it('query uses only original provisioning reference',async()=>{const {q,calls}=harness(receipt({state:'compensated'}));expect((await q.genauth.agents.get({provisioningId:'original'})).state).toBe('compensated');expect(calls[0].body).toEqual({provisioningId:'original'});});
 it('binding requires actual bound receipt and never treats ready as bound',async()=>{const {q,calls}=harness(receipt({state:'ready',ready:true,agentId:'iam-id',readyAt:1000,unboundExpiresAt:604801000}));await expect(q.genauth.agents.bind({provisioningId:'original',accessToken:'RAM-user-token'})).rejects.toBeInstanceOf(QoniUpstreamError);expect(calls).toHaveLength(1);});
 it('bound receipt follows IAM clearing the unbound deadline',async()=>{const data=receipt({state:'bound',ready:true,agentId:'iam-id',readyAt:1000,unboundExpiresAt:null,boundUserId:'alice',boundAt:2000});const {q,calls}=harness(data);expect(await q.genauth.agents.bind({provisioningId:'original',accessToken:'RAM-user-token'})).toEqual(data);expect(calls[0].body).toEqual({provisioningId:'original',accessToken:'RAM-user-token'});});
 it.each([
  receipt({state:'ready',ready:true,agentId:'iam-id'}),
  receipt({state:'ready',ready:true,agentId:'iam-id',readyAt:1000,unboundExpiresAt:604801001}),
  receipt({state:'bound',ready:true,agentId:'iam-id',readyAt:1000,unboundExpiresAt:604801000,boundUserId:'alice',boundAt:2000}),
  receipt({state:'creating',ready:true}),
  receipt({state:'unknown'}),
 ])('rejects inconsistent upstream facts without retry',async(data)=>{const {q,calls}=harness(data);await expect(q.genauth.agents.get({provisioningId:'original'})).rejects.toBeInstanceOf(QoniUpstreamError);expect(calls).toHaveLength(1);});
 it('no extra owner/token fields are accepted before signing',async()=>{const {q,calls}=harness(receipt());await expect(q.genauth.agents.create({displayName:'A',idempotencyKey:'x',ownerUserId:'attacker'} as any)).rejects.toBeInstanceOf(QoniValidationError);expect(calls).toHaveLength(0);});
 it('lost response is thrown without replaying a resource-creating POST',async()=>{let count=0;const q=new Qoni({accessKey:'ak',secretKey:'sk',host:'http://127.0.0.1:1234',fetch:async()=>{count++;throw new Error('synthetic committed-response loss');}});await expect(q.genauth.agents.create({displayName:'A',idempotencyKey:'original'})).rejects.toThrow();expect(count).toBe(1);});
});
