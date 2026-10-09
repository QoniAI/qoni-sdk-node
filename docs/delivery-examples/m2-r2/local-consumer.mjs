import assert from 'node:assert/strict';
import http from 'node:http';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Qoni, QoniTaskSubmissionUnknownError } from '@qoniai/qoni';
import { startMemoryRunOnce } from './out/memory-outcome.js';

const jwt=p=>`${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify(p)).toString('base64url')}.`;
const original=jwt({token_type:'eak_delegation_token',eak_tenant_id:'fixture-tenant'});
const product=jwt({webagent_tenant_id:'fixture-tenant',aud:'webagent'});
let origin,mode='success',taskPosts=0;
const server=http.createServer(async(req,res)=>{
 const chunks=[];for await(const c of req)chunks.push(c);const body=chunks.length?JSON.parse(Buffer.concat(chunks).toString()):undefined;
 const path=new URL(req.url,origin).pathname;
 const send=(data,status=200)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify({data}));};
 const deny=()=>{res.writeHead(403,{'content-type':'application/json'});res.end(JSON.stringify({code:'permission.denied',message:'Synthetic rejection'}));};
 if(path==='/api/v3/eak/token-exchange'){
  if(mode==='permission-denied'&&body.resource==='webagent')return deny();
  if(mode==='recall-denied'&&body.resource==='gumem')return deny();
  return send({accessToken:product,expiresIn:60});
 }
 if(path==='/api/sessions/memory-original/context')return send({context:{project_id:'project',user_id:'user-original',session_id:'memory-original',facts:'Synthetic memory',summary:'',history:[]}});
 if(path.endsWith('/do_anything/runs')&&req.method==='POST'){
  taskPosts++;
  if(mode==='lost'){req.socket.destroy();return;}
  if(mode==='timeout'){return;}
  if(mode==='rejected')return deny();
  if(mode==='invalid-success')return send({accepted:true});
  return send({run_id:'run-original',session_id:'session-original',status:'running'},202);
 }
 res.writeHead(404);res.end('{}');
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${server.address().port}`;
const qoni=new Qoni({accessKey:'synthetic-ak',secretKey:'synthetic-sk',host:origin,genauthBaseUrl:origin,gumemBaseUrl:origin,webAgentBaseUrl:origin,timeoutMs:200,sseMaxRetries:0});
const input={token:original,prompt:'Synthetic memory run',memory:{sessionId:'memory-original'},timeoutMs:800};
const results=[];
async function check(name,fn){try{const detail=await fn();results.push({name,result:'PASS',detail});}catch(e){results.push({name,result:'FAIL',error:e instanceof Error?e.message:'unclassified'});}console.log(JSON.stringify(results.at(-1)));}
try{
 await check('new_error_esm_cjs_export',async()=>{const cjs=createRequire(import.meta.url)('@qoniai/qoni');assert.equal(typeof QoniTaskSubmissionUnknownError,'function');assert.equal(typeof cjs.QoniTaskSubmissionUnknownError,'function');return {formats:2};});
 for(const [failure,phase] of [['recall-denied','recall'],['permission-denied','task_permission']]){
  await check(failure,async()=>{mode=failure;const before=taskPosts;const out=await startMemoryRunOnce(qoni,input);assert.equal(out.state,'request_failed');assert.equal(out.phase,phase);assert.equal(out.submissionUnknown,false);assert.equal(out.status,403);assert.equal(taskPosts,before);return {phase,task_posts:0};});
 }
 for(const failure of ['lost','timeout','invalid-success']){
  await check(failure,async()=>{mode=failure;const before=taskPosts;const out=await startMemoryRunOnce(qoni,input);assert.equal(out.state,'submission_unknown');assert.equal(out.code,'task.submit_unknown');assert.equal(out.phase,'task_submit');assert.equal(out.submissionUnknown,true);assert.equal(out.retryable,false);assert.equal(taskPosts,before+1);return {phase:'task_submit',task_posts:1,automatic_replay:false};});
 }
 await check('explicit_rejection_is_not_unknown',async()=>{mode='rejected';const before=taskPosts;const out=await startMemoryRunOnce(qoni,input);assert.equal(out.state,'request_failed');assert.equal(out.phase,'task_submit');assert.equal(out.submissionUnknown,false);assert.equal(out.status,403);assert.notEqual(out.code,'task.submit_unknown');assert.equal(taskPosts,before+1);return {received_status:403,submissionUnknown:false};});
 await check('successful_handle_is_not_completion',async()=>{mode='success';const out=await startMemoryRunOnce(qoni,input);assert.equal(out.state,'task_handle_returned');assert.equal(out.result.run.id,'run-original');assert.equal(out.result.memory.origin.sessionId,'memory-original');return {task_handle_returned:true};});
 await check('unknown_error_omits_raw_payload',async()=>{mode='lost';await assert.rejects(()=>qoni.doAnything.runWithMemory(input),e=>{assert.ok(e instanceof QoniTaskSubmissionUnknownError);assert.equal(e.body,undefined);assert.equal(e.cause,undefined);assert.equal(e.message,'Task submission outcome is unknown. Do not resubmit automatically; reconcile the original request with the server.');return true;});return {body:false,cause:false};});
}finally{
 server.closeAllConnections();await new Promise(r=>server.close(r));
 await writeFile(new URL('./results.json',import.meta.url),JSON.stringify({node:process.version,results,resources:{server_closed:true},boundary:'Actual package and default fetch to local TCP; synthetic backend rejection/response faults, no real product authorization.'},null,2)+'\n');
}
if(results.some(x=>x.result!=='PASS'))process.exitCode=1;
