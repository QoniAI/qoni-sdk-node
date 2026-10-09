import { expect, it } from 'vitest';
import { Qoni } from '../src';
const token = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify({aud:'webagent',webagent_tenant_id:'project-one'})).toString('base64url')}.`;
function client(reply: (path:string,init?:RequestInit)=>Response|Promise<Response>) {
  return new Qoni({accessKey:'test-ak',secretKey:'test-sk',host:'http://127.0.0.1:9000',webAgentBaseUrl:'http://127.0.0.1:9000',fetch:(async (url,init)=>reply(String(url),init)) as typeof fetch});
}
it('maps stable requestId and does not repeat a write after lost acknowledgement',async()=>{
  const calls:RequestInit[]=[];
  const q=client(async (_url,init)=>{calls.push(init!);throw new TypeError('response lost');});
  await expect(q.doAnything.run({token,prompt:'hello',requestId:'request-one'})).rejects.toThrow();
  expect(calls).toHaveLength(1);
  expect(JSON.parse(String(calls[0].body))).toEqual({instructions:'hello',request_id:'request-one'});
});
it('reads the exact original key/session and trace without creating a task',async()=>{
  const calls:{path:string,method:string}[]=[];
  const q=client(async(path,init)=>{calls.push({path,method:init?.method||'GET'});return new Response(JSON.stringify({id:'run-original',session_id:'session-original'}));});
  await q.doAnything.api.getRequest({token,requestId:'request-one',sessionId:'session-original'});
  await q.doAnything.api.getTrace({token,runId:'run-original'});
  expect(calls).toEqual([
    {path:'http://127.0.0.1:9000/api/v1/projects/project-one/do_anything/requests/request-one?session_id=session-original',method:'GET'},
    {path:'http://127.0.0.1:9000/api/v1/projects/project-one/do_anything/runs/run-original/trace',method:'GET'},
  ]);
});
it('rejects conflicting request aliases without HTTP',async()=>{
  let calls=0;const q=client(async()=>{calls++;return new Response('{}');});
  await expect(q.doAnything.api.createRun({token,instructions:'hello',requestId:'a',request_id:'b'})).rejects.toThrow();
  expect(calls).toBe(0);
});
