import {afterAll, describe, expect, it} from 'vitest';
import {createServer} from 'node:http';
import {writeFileSync} from 'node:fs';
import {Qoni,QoniError,QoniTaskSubmissionUnknownError} from '../src';

const jwt=(payload:unknown)=>`${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.synthetic`;
const original=jwt({token_type:'eak_delegation_token',sub:'user-original'});
const wa=jwt({aud:'webagent',webagent_tenant_id:'project-original'});
const gum=jwt({aud:'gumem',sub:'user-original'});
const evidence:unknown[]=[];
type Call={method:string,path:string,query:string,body:Record<string,unknown>};
async function fixture(mode:string, body:(q:Qoni,calls:Call[],ctl:AbortController)=>Promise<void>, contextExtra:Record<string,unknown>={}){
  const calls:Call[]=[];const ctl=new AbortController();let origin='';
  const server=createServer(async(req,res)=>{
    let raw='';for await(const c of req)raw+=c;
    const u=new URL(req.url!,origin),b=raw?JSON.parse(raw):{};
    calls.push({method:req.method!,path:u.pathname,query:u.search,body:b});
    const send=(data:unknown,status=200)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify({data}));};
    if(u.pathname.endsWith('/token-exchange')){
      if(b.resource==='webagent'&&mode==='permission-cancel'){ctl.abort(Error('synthetic private cancellation'));return;}
      return send({accessToken:b.resource==='gumem'?gum:wa});
    }
    if(u.pathname.endsWith('/context'))return send({context:{project_id:'gum-original',user_id:'user-original',session_id:'memory-original',facts:'',summary:'',history:[],...contextExtra}});
    if(u.pathname.endsWith('/do_anything/runs')&&req.method==='POST'){
      if(mode==='lost'){req.socket.destroy();return;}
      if(mode==='timeout'||mode==='overall-timeout')return;
      if(mode==='cancel'||mode==='ordinary-cancel'){ctl.abort(Error('synthetic-private-reason'));return;}
      if(mode==='rejected'){res.writeHead(409,{'content-type':'application/json'});res.end(JSON.stringify({code:'request_payload_conflict',message:'Original key payload conflict'}));return;}
      return send({id:'run-original',session_id:'session-original'},202);
    }
    if(u.pathname.endsWith('/requests/original-key'))return send({id:'run-original',session_id:'session-original'});
    if(u.pathname.endsWith('/runs/run-original/trace'))return send({run_id:'run-original',session_id:'session-original',external_result:'unknown',operations:[],operations_state:'unavailable'});
    res.writeHead(404);res.end('{}');
  });
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  const addr=server.address();if(!addr||typeof addr==='string')throw Error('fixture address');
  origin=`http://127.0.0.1:${addr.port}`;
  const q=new Qoni({accessKey:'synthetic-ak',secretKey:'synthetic-sk',host:origin,gumemHost:origin,webAgentHost:origin,timeoutMs:mode==='overall-timeout'?2000:500,sseMaxRetries:0});
  try{await body(q,calls,ctl);evidence.push({mode,result:'PASS',calls});}
  catch(e){evidence.push({mode,result:'FAIL',calls,error:e instanceof Error?e.message:'unknown'});throw e;}
  finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
}
const input=(ctl:AbortController)=>({token:original,prompt:'Synthetic instruction',requestId:'original-key',signal:ctl.signal,
  session:{sessionId:'session-original'},memory:{sessionId:'memory-original'},timeoutMs:2000});
const posts=(c:Call[])=>c.filter(x=>x.method==='POST'&&x.path.endsWith('/do_anything/runs'));
function exactBody(c:Call[]){expect(posts(c)).toHaveLength(1);expect(posts(c)[0].body).toEqual({instructions:'Synthetic instruction',request_id:'original-key',session_id:'session-original'});}
function unknown(e:unknown){expect(e).toBeInstanceOf(QoniTaskSubmissionUnknownError);expect(e).toMatchObject({phase:'task_submit',code:'task.submit_unknown',submissionUnknown:true,retryable:false});expect((e as QoniError).body).toBeUndefined();expect((e as Error).cause).toBeUndefined();}
describe('M2 + W11 composed actual HTTP crosspoints',()=>{
  it.each(['lost','timeout','overall-timeout','cancel'])('%s after one keyed POST retains unknown contract and original-key readback',async mode=>fixture(mode,async(q,c,ctl)=>{
    const params=input(ctl);if(mode==='overall-timeout')params.timeoutMs=600;
    unknown(await q.doAnything.runWithMemory(params).catch(e=>e));exactBody(c);
    expect(c.filter(x=>x.path.endsWith('/token-exchange'))).toHaveLength(2);
    // Cancellation affects only the submitting call; reconciliation is a new read
    // of the same exact caller key, never a second POST or an inferred new key.
    const receipt=await q.doAnything.api.getRequest<{id:string}>({token:wa,requestId:params.requestId,sessionId:params.session.sessionId});
    expect(receipt.data.id).toBe('run-original');
    const trace=await q.doAnything.api.getTrace({token:wa,runId:receipt.data.id});
    expect(trace.data.run_id).toBe('run-original');expect(trace.data.external_result).toBe('unknown');exactBody(c);
    expect(c.slice(-2).map(x=>[x.method,x.path,x.query])).toEqual([
      ['GET','/api/v1/projects/project-original/do_anything/requests/original-key','?session_id=session-original'],
      ['GET','/api/v1/projects/project-original/do_anything/runs/run-original/trace',''],
    ]);
  }));
  it('pre-aborted signal reaches no auth, recall or Task',async()=>fixture('pre-cancel',async(q,c,ctl)=>{
    ctl.abort(Error('synthetic reason'));await expect(q.doAnything.runWithMemory(input(ctl))).rejects.toMatchObject({phase:'recall',code:'request.aborted',submissionUnknown:false});expect(c).toEqual([]);
  }));
  it('permission-stage abort prevents Task dispatch',async()=>fixture('permission-cancel',async(q,c,ctl)=>{
    await expect(q.doAnything.runWithMemory(input(ctl))).rejects.toMatchObject({phase:'task_permission',code:'request.aborted',submissionUnknown:false});expect(posts(c)).toHaveLength(0);
  }));
  it('explicit keyed Task rejection is preserved rather than unknown',async()=>fixture('rejected',async(q,c,ctl)=>{
    await expect(q.doAnything.runWithMemory(input(ctl))).rejects.toMatchObject({status:409,code:'request_payload_conflict',phase:'task_submit',submissionUnknown:false});exactBody(c);
  }));
  it('successful handle retains keyed follow-up and exposes no internal signal on wire',async()=>fixture('success',async(q,c,ctl)=>{
    const out=await q.doAnything.runWithMemory(input(ctl));expect(out.run.id).toBe('run-original');expect(out.memory.items).toEqual([]);exactBody(c);ctl.abort();expect(posts(c)).toHaveLength(1);
  }));
  it('conflicting request aliases fail before Task POST',async()=>fixture('aliases',async(q,c,ctl)=>{
    await expect(q.doAnything.runWithMemory({...input(ctl),request_id:'different'})).rejects.toMatchObject({phase:'task_permission',submissionUnknown:false});expect(posts(c)).toHaveLength(0);
  }));
  it('ordinary run still forwards signal and key with one POST',async()=>fixture('ordinary-cancel',async(q,c,ctl)=>{
    const {memory,timeoutMs,...ordinary}=input(ctl);
    const e=await q.doAnything.run(ordinary).catch(e=>e);expect(e).toBe(ctl.signal.reason);expect(e.phase).toBeUndefined();exactBody(c);expect(c.some(x=>x.path.endsWith('/context'))).toBe(false);
  }));
  it('wire createRun retains preaborted signal without serializing it',async()=>fixture('create-preabort',async(q,c,ctl)=>{
    ctl.abort(Error('stop'));await expect(q.doAnything.api.createRun({token:wa,instructions:'Synthetic instruction',requestId:'original-key',signal:ctl.signal})).rejects.toBe(ctl.signal.reason);expect(c).toEqual([]);
  }));
  it('request/trace read signals abort without a write or fetch',async()=>fixture('read-preabort',async(q,c,ctl)=>{
    ctl.abort(Error('stop'));await expect(q.doAnything.api.getRequest({token:wa,requestId:'original-key',signal:ctl.signal})).rejects.toBe(ctl.signal.reason);
    await expect(q.doAnything.api.getTrace({token:wa,runId:'run-original',signal:ctl.signal})).rejects.toBe(ctl.signal.reason);expect(c).toEqual([]);
  }));
});
const record=(i:number,text:string)=>({record_id:`record-${i}`,engine:'semantic',kind:'facts',content:text,source_status:'available',sources:Array.from({length:7},(_,j)=>({source_kind:'raw_input',source_id:`raw-${i}-${j}`,session_id:`source-session-${i}`,message_id:`message-${i}-${j}`,created_at:'2026-10-09T00:00:00Z',source_url:'https://example.invalid/'+String(i)+'/'+String(j)+'/'+('x'.repeat(180))}))});
describe('A1 r2 content/source budget × memory Task submission',()=>{
  for(const maxContextBytes of [8192,16384]){
    const maxItems=maxContextBytes===8192?12:32;
    const texts=Array.from({length:10},(_,i)=>`CONTENT-${i} ordinary confirmed preference`);
    const typed={facts:texts.join('\n'),memory_records:texts.map((t,i)=>record(i,t)),memory_records_coverage:{facts:true,summary:true}};
    it(`retains all 10 content items before source metadata at ${maxContextBytes} bytes`,async()=>fixture(`a1-content-${maxContextBytes}`,async(q,c,ctl)=>{
      const out=await q.doAnything.runWithMemory({...input(ctl),memory:{sessionId:'memory-original',maxItems,maxContextBytes}});
      expect(out.memory.items).toHaveLength(10);expect(out.memory.items.map(x=>x.text)).toEqual(texts);
      expect(out.memory.items.map(x=>x.recordId)).toEqual(texts.map((_,i)=>`record-${i}`));
      expect(Buffer.byteLength(out.memory.referenceText)).toBeLessThanOrEqual(maxContextBytes);
      for(const [i,item] of out.memory.items.entries()){
        expect([0,7]).toContain(item.sources.length);
        expect(item.sourceStatus).toBe(item.sources.length?'record_id':'unavailable');
        for(const source of item.sources)expect(source.id.startsWith(`raw-${i}-`)).toBe(true);
      }
      expect(posts(c)).toHaveLength(1);expect(posts(c)[0].body.request_id).toBe('original-key');
      expect(posts(c)[0].body.instructions).toBe('Synthetic instruction\n\n'+out.memory.referenceText);
      expect('signal' in posts(c)[0].body).toBe(false);
    },typed));
    it(`source-enriched POST lost receipt stays one unknown submission at ${maxContextBytes} bytes`,async()=>fixture('lost',async(q,c,ctl)=>{
      unknown(await q.doAnything.runWithMemory({...input(ctl),memory:{sessionId:'memory-original',maxItems,maxContextBytes}}).catch(e=>e));
      expect(posts(c)).toHaveLength(1);for(const t of texts)expect(posts(c)[0].body.instructions).toContain(t);
      expect(posts(c)[0].body.request_id).toBe('original-key');
    },typed));
  }
  it('missing coverage retains complete legacy section without borrowing a typed source',async()=>fixture('a1-incomplete',async(q,c,ctl)=>{
    const out=await q.doAnything.runWithMemory(input(ctl));expect(out.memory.items).toHaveLength(1);
    expect(out.memory.items[0]).toEqual({kind:'facts',text:'LEGACY-A\nLEGACY-B',sources:[],sourceStatus:'unavailable'});expect(out.memory.truncated).toBe(true);
    expect(posts(c)[0].body.instructions).toContain('LEGACY-B');
  },{facts:'LEGACY-A\nLEGACY-B',memory_records:[record(1,'LEGACY-A')]}));
  it('same text in distinct records keeps distinct source identity',async()=>fixture('a1-identical-text',async(q,c,ctl)=>{
    const out=await q.doAnything.runWithMemory(input(ctl));expect(out.memory.items).toHaveLength(2);
    expect(out.memory.items.map(x=>x.recordId)).toEqual(['record-1','record-2']);
    expect(out.memory.items.map(x=>x.sources[0].id)).toEqual(['raw-1-0','raw-2-0']);expect(posts(c)).toHaveLength(1);
  },{facts:'same\nsame',memory_records:[record(1,'same'),record(2,'same')],memory_records_coverage:{facts:true,summary:true}}));
});
afterAll(()=>{const output=process.env.QONI_COMPOSITION_EVIDENCE_PATH;if(output)writeFileSync(output,JSON.stringify({boundary:'Real default-fetch loopback HTTP; synthetic auth and receipts. No real GA/GUM/WA persistence or cloud.',cases:evidence,servers_closed:true},null,2)+'\n');});
