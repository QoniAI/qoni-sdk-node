import { describe, expect, it } from 'vitest';
import { Qoni } from '../../src';
import { loadDotEnvLocal, requiredEnv } from '../helpers/env';
loadDotEnvLocal();
const live=process.env.QONI_LIVE_E2E==='1'?describe:describe.skip;
live('live communication read-only (no purchase/send/configuration)',()=>{
  const client=new Qoni({accessKey:requiredEnv('QONI_ACCESS_KEY'),secretKey:requiredEnv('QONI_SECRET_KEY'),...(process.env.QONI_HOST?{host:process.env.QONI_HOST}:{}),...(process.env.QONI_GENAUTH_HOST?{genauthHost:process.env.QONI_GENAUTH_HOST}:{}),timeoutMs:20000,
    ...(process.env.GENAUTH_ACCESS_KEY_ID&&process.env.GENAUTH_ACCESS_KEY_SECRET&&process.env.GENAUTH_USER_POOL_ID?{genauthCommunicationCredentials:{accessKeyId:process.env.GENAUTH_ACCESS_KEY_ID,accessKeySecret:process.env.GENAUTH_ACCESS_KEY_SECRET,userPoolId:process.env.GENAUTH_USER_POOL_ID}}:{})});
  it('Mail administrator provider inventory',async()=>{expect((await client.genauth.agentMail.admin.providers.list()).data.items).toBeInstanceOf(Array);});
  it('Mail administrator persona inventory',async()=>{expect((await client.genauth.agentMail.admin.personas.list()).data.items).toBeInstanceOf(Array);});
  it('Mail administrator health',async()=>{expect((await client.genauth.agentMail.admin.health.get()).data.pendingOperations).toBeTypeOf('number');});
  it('Phone administrator provider inventory',async()=>{expect((await client.genauth.agentPhone.admin.providers.list()).data.items).toBeInstanceOf(Array);});
  it('Phone administrator persona inventory',async()=>{expect((await client.genauth.agentPhone.admin.personas.list()).data.items).toBeInstanceOf(Array);});
  it('Phone administrator policy inventory',async()=>{expect((await client.genauth.agentPhone.admin.policies.list()).data.items).toBeInstanceOf(Array);});
  it.skipIf(!process.env.GENAUTH_ACCESS_KEY_ID||!process.env.GENAUTH_ACCESS_KEY_SECRET||!process.env.GENAUTH_USER_POOL_ID)('Mail native AK/SK runtime inventory',async()=>{expect((await client.genauth.agentMail.personas.list({})).data.items).toBeInstanceOf(Array);});
});
