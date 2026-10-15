import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Qoni, QoniError, QoniTimeoutError } from '@qoniai/qoni';
import * as login from './out/hosted-login.js';
import * as interactions from './out/interactions.js';
import * as profileMemory from './out/profile-memory.js';
import * as agents from './out/agents.js';
import * as failures from './out/failure-handling.js';

const installedCjs = createRequire(import.meta.url).resolve('@qoniai/qoni');
const installedEsm = new URL('./index.js', pathToFileURL(installedCjs));
const installedDist = {
 esmSha256: createHash('sha256').update(await readFile(installedEsm)).digest('hex'),
 cjsSha256: createHash('sha256').update(await readFile(installedCjs)).digest('hex'),
};
const calls=[],results=[];
let profileName='Synthetic', profileWrites=0, taskCreates=0, agentCreates=0, binds=0;
let dropExchange=false,dropProfile=false,dropTask=false,dropAgent=false,memoryDenied=false,writeDenied=false;
const jwt=p=>`${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify(p)).toString('base64url')}.`;
const token=jwt({token_type:'eak_delegation_token',eak_tenant_id:'fixture-tenant'});
const productToken=jwt({webagent_tenant_id:'fixture-tenant',aud:'webagent'});
const receipt=state=>({provisioningId:'provision-original',state,ready:['ready','bound'].includes(state),
 agentId:['ready','bound'].includes(state)?'agent-original':null,readyAt:['ready','bound'].includes(state)?1000:null,
 unboundExpiresAt:state==='ready'?604801000:null,boundUserId:state==='bound'?'user-original':null,
 boundAt:state==='bound'?2000:null,mailboxResourceId:null,errorCode:null});
let agentState='creating',origin;
const server=http.createServer(async(req,res)=>{
 try {
  const chunks=[];for await(const c of req)chunks.push(c);
  const body=chunks.length?JSON.parse(Buffer.concat(chunks).toString()):undefined;
  const path=new URL(req.url,origin).pathname;calls.push({path,method:req.method,body});
  const send=(data,status=200)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify({data}));};
  const deny=()=>{res.writeHead(403,{'content-type':'application/json'});res.end(JSON.stringify({code:'delegation.forbidden',message:'Denied by fixture'}));};
  if(path==='/api/v3/eak/token-exchange'){
   if((memoryDenied&&body.resource==='gumem')||(writeDenied&&body.scopes.includes('webagent.do_anything:manage')))return deny();
   return send({accessToken:productToken,expiresIn:60});
  }
  if(path.endsWith('/auth/login-url'))return send({url:origin+'/synthetic-login',expiresAt:new Date(Date.now()+60000).toISOString()});
  if(path.endsWith('/auth/exchange-login-code')){
   if(dropExchange){dropExchange=false;req.socket.destroy();return;}
   return send({user:{id:'user-original',isNewUser:false},accessToken:'synthetic-user-token',idToken:'synthetic-id-token',expiresIn:60});
  }
  if(path.endsWith('/profile/read'))return send({values:{name:profileName},missing:['address'],writable_fields:['name'],field_types:{name:'STRING',address:'STRING'}});
  if(path.endsWith('/profile/update')){
   profileWrites++;profileName=body.values.name;
   if(dropProfile){dropProfile=false;req.socket.destroy();return;}
   return send({values:{name:profileName},missing:[],writable_fields:['name'],field_types:{name:'STRING'}});
  }
  if(path==='/api/sessions/memory-original/context')return send({context:{project_id:'project',user_id:'user-original',session_id:'memory-original',facts:'Synthetic preference',summary:'',history:[{id:'message-original',role:'user',content:'Synthetic history',metadata:{source_url:'https://example.invalid/source'}}]}});
  if(path.endsWith('/do_anything/runs')&&req.method==='POST'){
   taskCreates++;if(dropTask){dropTask=false;req.socket.destroy();return;}
   return send({run_id:'run-original',session_id:'session-original',status:'running'},202);
  }
  if(path.endsWith('/runs/run-original')&&req.method==='GET')return send({run_id:'run-original',session_id:'session-original',status:'waiting'});
  if(path.endsWith('/interactions/login-original/open_login'))return send({login_mode:'current_task',profile_id:'profile-original',site_id:'example.invalid',session_id:'control-original',interaction_id:'login-original',control_interaction_id:'control-original',browser_session_id:'browser-original',live_url:origin+'/synthetic-live',expires_at:new Date(Date.now()+60000).toISOString()});
  if(path.endsWith('/interactions/login-original/confirm_signed_in'))return send({login_mode:'current_task',saved:true,interaction_id:'login-original',session_id:'control-original',state:'saved',verification:'agent_pending'});
  if(path.endsWith('/interactions/form-original/submit'))return send({accepted:true});
  if(path.endsWith('/intervene')){
   res.writeHead(409,{'content-type':'application/json'});res.end(JSON.stringify({code:'interaction.conflict',message:'Original control is stale'}));return;
  }
  if(path==='/api/v3/eak/agents/create'){
   agentCreates++;if(dropAgent){dropAgent=false;req.socket.destroy();return;}
   return send(receipt('creating'),202);
  }
  if(path==='/api/v3/eak/agents/get')return send(receipt(agentState));
  if(path==='/api/v3/eak/agents/bind'){binds++;return send(receipt('bound'));}
  res.writeHead(404);res.end('{}');
 }catch{res.writeHead(500);res.end('{}');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;
const qoni=new Qoni({accessKey:'synthetic-ak',secretKey:'synthetic-sk',host:origin,
 genauthBaseUrl:origin,gumemBaseUrl:origin,webAgentBaseUrl:origin,timeoutMs:1500,sseMaxRetries:0});
const count=path=>calls.filter(c=>c.path.endsWith(path)).length;
const store=()=>{const values=new Map();return {save:async a=>{values.set(a.state,a);},consume:async state=>{const a=values.get(state);values.delete(state);return a;}};};
const attemptState=()=>calls.filter(c=>c.path.endsWith('/auth/login-url')).at(-1).body.state;
async function check(name,fn){try{const detail=await fn();results.push({name,result:'PASS',detail});}catch(error){results.push({name,result:'FAIL',error:error instanceof Error?error.message:'unclassified'});}console.log(JSON.stringify(results.at(-1)));}
try{
 await check('esm_cjs_public_surface',async()=>{
  const cjs=createRequire(import.meta.url)('@qoniai/qoni');const c=new cjs.Qoni({accessKey:'synthetic-ak',secretKey:'synthetic-sk',host:origin});
  for(const candidate of [qoni,c])for(const f of [candidate.genauth.agents.create,candidate.genauth.agents.get,candidate.genauth.agents.bind,candidate.genauth.auth.createLoginUrl,candidate.doAnything.profile.read,candidate.doAnything.runWithMemory,candidate.gumem.recallContext])assert.equal(typeof f,'function');
  return {formats:['ESM','CJS'],methods:7};
 });
 await check('hosted_state_and_single_exchange',async()=>{
  const s=store();await login.beginHostedLogin(qoni,s,origin+'/callback');const state=attemptState();let before=count('/auth/exchange-login-code');
  await assert.rejects(()=>login.finishHostedLogin(qoni,s,{state:'wrong',code:'synthetic-code'}));assert.equal(count('/auth/exchange-login-code'),before);
  const session=await login.finishHostedLogin(qoni,s,{state,code:'synthetic-code'});assert.equal(session.user.id,'user-original');assert.equal(session.user.isNewUser,false);
  await assert.rejects(()=>login.finishHostedLogin(qoni,s,{state,code:'synthetic-code'}));assert.equal(count('/auth/exchange-login-code'),before+1);
  return {bad_state_posts:0,exchange_posts:1,replay_posts:0};
 });
 await check('hosted_unknown_not_replayed',async()=>{
  const s=store();await login.beginHostedLogin(qoni,s,origin+'/callback');const state=attemptState();const before=count('/auth/exchange-login-code');dropExchange=true;
  await assert.rejects(()=>login.finishHostedLogin(qoni,s,{state,code:'synthetic-lost-code'}));
  await assert.rejects(()=>login.finishHostedLogin(qoni,s,{state,code:'synthetic-lost-code'}));assert.equal(count('/auth/exchange-login-code'),before+1);
  return {unknown_exchange_posts:1};
 });
 await check('current_task_original_L_C',async()=>{
  const run=await qoni.doAnything.attach('run-original',{token});const base='/do_anything/runs/run-original/interactions/login-original';
  const handle=run.interactionHandle({id:'login-original',type:'site_login',status:'pending',createdAt:new Date().toISOString(),title:'Synthetic sign in',payload:{sites:[{siteId:'example.invalid',displayName:'Synthetic',loginUrl:'https://example.invalid'}]},actions:[{kind:'open_login',label:'Open',method:'POST',endpoint:base+'/open_login'},{kind:'confirm_signed_in',label:'Confirm',method:'POST',endpoint:base+'/confirm_signed_in'}]});
  const before=count('/confirm_signed_in');const result=await interactions.signInOnOriginalCard(handle,async url=>assert.equal(url,origin+'/synthetic-live'));
  assert.equal(result.interactionId,'login-original');assert.equal(result.state,'awaiting_agent_verification');assert.equal(count('/confirm_signed_in'),before+1);
  const confirm=calls.findLast(c=>c.path.endsWith('/confirm_signed_in'));assert.deepEqual(confirm.body,{login_session_id:'control-original'});
  assert.equal(calls.some(c=>c.path.includes('/profiles/')),false);
  return {confirm_posts:1,original_L:'login-original',original_C:'control-original',verified_signin:false};
 });
 await check('stale_control_no_id_substitution',async()=>{
  const before=count('/intervene');await assert.rejects(()=>interactions.releaseOriginalControl(qoni,token,'run-original','old-control'),e=>e instanceof QoniError&&e.status===409);
  assert.equal(count('/intervene'),before+1);assert.equal(calls.findLast(c=>c.path.endsWith('/intervene')).body.interaction_id,'old-control');return {posts:1,status:409};
 });
 await check('ordinary_form_exact_values',async()=>{
  const run=await qoni.doAnything.attach('run-original',{token});const handle=run.interactionHandle({id:'form-original',type:'fill_form',status:'pending',createdAt:new Date().toISOString(),title:'Synthetic form',payload:{title:'Synthetic',fields:[{name:'count',label:'Count',type:'number',required:true},{name:'method',label:'Method',type:'select',options:[{value:'ship',label:'Ship'}],required:true},{name:'address',label:'Address',type:'address',required:true}]},actions:[{kind:'submit',label:'Submit',method:'POST',endpoint:'/do_anything/runs/run-original/interactions/form-original/submit'}]});
  const before=count('/submit');await assert.rejects(()=>interactions.submitOrdinaryForm(handle,{count:'0',method:'ship',address:{line1:'Synthetic'}}));assert.equal(count('/submit'),before);
  await interactions.submitOrdinaryForm(handle,{count:0,method:'ship',address:{line1:'Synthetic',city:'Singapore'}});assert.equal(count('/submit'),before+1);assert.equal(calls.findLast(c=>c.path.endsWith('/submit')).body.values.count,0);
  return {bad_input_posts:0,valid_posts:1};
 });
 await check('profile_unknown_readback_and_denied_consent',async()=>{
  const p=await profileMemory.readOriginalUserProfile(qoni,token,'run-original');assert.equal(p.values.name,'Synthetic');assert.deepEqual(p.writable_fields,['name']);
  const before=profileWrites;dropProfile=true;await assert.rejects(()=>profileMemory.saveExplicitOrdinaryName(qoni,token,'run-original','Saved synthetic'));assert.equal(profileWrites,before+1);
  const reread=await profileMemory.readOriginalUserProfile(qoni,token,'run-original');assert.equal(reread.values.name,'Saved synthetic');assert.equal(profileWrites,before+1);
  writeDenied=true;await assert.rejects(()=>profileMemory.saveExplicitOrdinaryName(qoni,token,'run-original','Forbidden synthetic'),e=>e instanceof QoniError&&e.status===403);writeDenied=false;
  assert.equal(profileWrites,before+1);return {unknown_write_posts:1,explicit_readback:true,denied_write_posts:0};
 });
 await check('memory_envelope_opt_in_and_denied_recall',async()=>{
  const m=await profileMemory.recallForDisplay(qoni,token,'memory-original');assert.equal(m.origin.sessionId,'memory-original');assert.deepEqual(m.items[0].sources,[]);assert.equal(m.items[0].sourceStatus,'unavailable');
  const before=count('/context');await qoni.doAnything.run({token,prompt:'Ordinary synthetic run'});assert.equal(count('/context'),before);
  const combined=await profileMemory.startWithMemory(qoni,token,'memory-original');assert.equal(combined.run.id,'run-original');assert.equal(combined.memory.origin.sessionId,'memory-original');assert.equal(count('/context'),before+1);
  const taskBefore=taskCreates;memoryDenied=true;await assert.rejects(()=>profileMemory.startWithMemory(qoni,token,'memory-original'));memoryDenied=false;assert.equal(taskCreates,taskBefore);
  return {ordinary_run_recall_posts:0,opt_in_recall_posts:1,denied_recall_task_posts:0};
 });
 await check('unknown_task_creation_no_replay',async()=>{
  const before=taskCreates;dropTask=true;await assert.rejects(()=>profileMemory.startWithMemory(qoni,token,'memory-original'));assert.equal(taskCreates,before+1);return {unknown_task_posts:1};
 });
 await check('agents_pending_read_ready_bind',async()=>{
  const request={displayName:'Synthetic assistant',idempotencyKey:'persisted-original-key'};
  const created=await agents.createPersonalAgent(qoni,request);assert.equal(agents.provisioningProgress(created),'pending');const before=binds;
  await assert.rejects(()=>agents.bindReadyPersonalAgent(qoni,created,'synthetic-user-token'));assert.equal(binds,before);
  agentState='mail_pending';const pending=await agents.readOriginalProvisioning(qoni,created.provisioningId);assert.equal(agents.provisioningProgress(pending),'pending');
  agentState='ready';const ready=await agents.readOriginalProvisioning(qoni,created.provisioningId);assert.equal(agents.provisioningProgress(ready),'ready_to_bind');
  const bound=await agents.bindReadyPersonalAgent(qoni,ready,'synthetic-user-token');assert.equal(agents.provisioningProgress(bound),'bound');assert.equal(binds,before+1);
  assert.equal(calls.findLast(c=>c.path.endsWith('/agents/get')).body.provisioningId,created.provisioningId);
  return {pending_not_success:true,bind_posts:1,same_provisioning_id:true};
 });
 await check('agents_unknown_does_not_replace_key',async()=>{
  const before=agentCreates;dropAgent=true;await assert.rejects(()=>agents.createPersonalAgent(qoni,{displayName:'Synthetic assistant',idempotencyKey:'persisted-uncertain-key'}));assert.equal(agentCreates,before+1);assert.equal(calls.findLast(c=>c.path.endsWith('/agents/create')).body.idempotencyKey,'persisted-uncertain-key');return {create_posts:1};
 });
 await check('failure_and_consent_handlers_do_not_write',async()=>{
  const before=calls.length;const ctl=new AbortController();failures.stopLocalWaitingAfterConsentChange(ctl);assert.equal(ctl.signal.aborted,true);
  const safe=failures.errorCategory(new QoniTimeoutError('synthetic private detail',{retryable:true,body:{token:'synthetic-private'}}));assert.equal(safe.retryable,true);assert.equal('body'in safe,false);assert.equal('message'in safe,false);assert.equal(calls.length,before);assert.equal('consents'in qoni.genauth,false);
  const writes=calls.filter(c=>c.method==='POST').length;await failures.readKnownRun(qoni,token,'run-original');assert.equal(calls.filter(c=>c.method==='POST'&&!c.path.endsWith('/token-exchange')).length,writes-calls.slice(0,before).filter(c=>c.path.endsWith('/token-exchange')).length);
  return {local_abort_is_not_server_cancel:true,automatic_posts:0};
 });
}finally{
 server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
 await writeFile(new URL('./local-results.json',import.meta.url),JSON.stringify({candidate:'installed local candidate; see npm install receipt',installedDist,node:process.version,cases:results,requests:calls.map(c=>({method:c.method,path:c.path})),resources:{server_closed:true},boundary:'Default fetch over real loopback TCP; synthetic backend responses/auth checks. No real GA/WA/GUM/PG/browser/provider.'},null,2)+'\n');
}
if(results.some(r=>r.result!=='PASS'))process.exitCode=1;
