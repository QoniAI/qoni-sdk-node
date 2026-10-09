import { QoniError, QoniValidationError } from './errors';
import { checkForm, type FillFormPayload } from './forms';
import type { Interaction } from './interactions';
import type { QoniTransport } from './types';

export interface SensitiveReference {
  ref: string;
  state: 'awaiting'|'writing'|'ready'|'unknown'|'canceled'|'revoked'|'consumed'|'expired';
  /** Fixed short value deadline in epoch milliseconds; alias of value_deadline. */
  expires_at: number;
  /** Original card deadline, unchanged by value expiry. */
  card_deadline: number;
  /** GA-recorded min(card, original source/run, issue time + 300 seconds). Never slides. */
  value_deadline: number;
}
export interface SensitiveSubmitOptions { signal?: AbortSignal; persistFields?: readonly string[]; }
const prefix='qoni_sensitive_';
const refPattern=/^sref_[a-f0-9]{64}_[a-f0-9]{32}$/;
function originalToken(token:string):void {
  try {
    const text=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    if(JSON.parse(atob(text)).token_type!=='eak_delegation_token')return;
  } catch(_) {throw new QoniValidationError('Protected input requires the original Task product access token');}
  throw new QoniValidationError('Protected input requires the original Task product access token; a new exchange cannot replace its source');
}
function reference(value:SensitiveReference):SensitiveReference {
  if(!value || !refPattern.test(value.ref) || ![value.expires_at,value.card_deadline,value.value_deadline].every(Number.isSafeInteger) ||
    value.expires_at!==value.value_deadline || value.value_deadline>value.card_deadline ||
    !['awaiting','writing','ready','unknown','canceled','revoked','consumed','expired'].includes(value.state))
    throw new QoniError('Protected input response is unknown; read the original reference.',{code:'sensitive.response_unknown',submissionUnknown:true,retryable:false});
  return {ref:value.ref,state:value.state,expires_at:value.expires_at,card_deadline:value.card_deadline,value_deadline:value.value_deadline};
}
export function createSensitiveForms(transport:QoniTransport) {
  const direct=(path:string,token:string,payload:Parameters<QoniTransport['genauthJson']>[3])=>
    {originalToken(token);return transport.genauthJson<SensitiveReference>('POST',path,token,payload);};
  const api={
    prepare:async(input:{token?:string;runId:string;interactionId:string;fieldName:string;signal?:AbortSignal})=>{
      const {data}=await transport.webAgentJson<SensitiveReference>('POST',`/do_anything/runs/${encodeURIComponent(input.runId)}/sensitive/issue`,input.token,
        {body:{interaction_id:input.interactionId,field_name:input.fieldName},signal:input.signal,requiredScopes:['webagent.do_anything:manage']});
      return reference(data);
    },
    /** Trusted application UI only. Values go directly to configured GA, never an action URL. */
    intake:async(input:{token:string;ref:string;value:string;persist?:boolean;signal?:AbortSignal})=>{
      originalToken(input.token);
      if(!refPattern.test(input.ref) || typeof input.value!=='string' || !input.value.length || input.value.length>4096 || input.value.includes('\0') ||
        (input.persist!==undefined && typeof input.persist!=='boolean')) throw new QoniValidationError('Invalid protected input');
      try {
        return reference((await direct('/api/v3/eak/sensitive-input/intake',input.token,
          {body:{ref:input.ref,value:input.value,persist:input.persist??false},signal:input.signal})).data);
      } catch(error) {
        const status=error instanceof QoniError?error.status:undefined;
        const unknown=status===undefined || status>=500;
        throw new QoniError(unknown?'Protected input outcome is unknown; read the original reference and do not resubmit.':'Protected input was rejected.',
          {code:unknown?'sensitive.intake_unknown':'sensitive.input_rejected',status,submissionUnknown:unknown,retryable:false});
      }
    },
    status:async(input:{token:string;ref:string;signal?:AbortSignal})=>reference((await direct('/api/v3/eak/sensitive-input/status',input.token,
      {body:{ref:input.ref},signal:input.signal})).data),
    /** Deletes the original temporary value. UNKNOWN is not deletion proof; TTL remains fixed. */
    cancel:async(input:{token:string;ref:string;signal?:AbortSignal})=>{
      originalToken(input.token);
      try{return reference((await direct('/api/v3/eak/sensitive-input/cancel',input.token,{body:{ref:input.ref},signal:input.signal})).data);}
      catch(error){const status=error instanceof QoniError?error.status:undefined;const unknown=status===undefined||status>=500;
        throw new QoniError(unknown?'Protected cancellation outcome is unknown; read the original reference.':'Protected cancellation was rejected.',
          {code:unknown?'sensitive.cancel_unknown':'sensitive.input_rejected',status,submissionUnknown:unknown,retryable:false});}
    },
  };
  return {...api,
    /** Collect on trusted UI; one intake per provided field, then one nonsecret original-card reply. */
    submit:async(input:{token:string;runId:string;interaction:Interaction;values:Record<string,unknown>}&SensitiveSubmitOptions):Promise<void>=>{
      originalToken(input.token);
      const card=input.interaction;
      if(card.type!=='fill_form' || !card.actions.some(a=>a.kind==='submit')) throw new QoniValidationError('Current fill_form submit action required');
      const fields=(card.payload as FillFormPayload).fields;
      const protectedFields=fields.filter(f=>f.name.startsWith(prefix));
      if(!protectedFields.length || !input.values || typeof input.values!=='object' || Array.isArray(input.values) ||
        Object.keys(input.values).some(k=>!fields.some(f=>f.name===k)) ||
        input.persistFields?.some(k=>!protectedFields.some(f=>f.name===k))) throw new QoniValidationError('Current protected fields required');
      const ordinary=fields.filter(f=>!f.name.startsWith(prefix));
      const reply=Object.fromEntries(Object.entries(input.values).filter(([name])=>!name.startsWith(prefix)));
      if(ordinary.length)checkForm(ordinary,reply);
      for(const f of protectedFields) {
        if(f.type!=='text' || (f.required && !Object.hasOwn(input.values,f.name))) throw new QoniValidationError('Invalid protected field');
        if(Object.hasOwn(input.values,f.name) && (typeof input.values[f.name]!=='string' || !(input.values[f.name] as string).length || (input.values[f.name] as string).length>4096 || (input.values[f.name] as string).includes('\0')))
          throw new QoniValidationError('Invalid protected input');
      }
      for(const f of protectedFields) {
        if(!Object.hasOwn(input.values,f.name))continue;
        const issued=await api.prepare({token:input.token,runId:input.runId,interactionId:card.id,fieldName:f.name,signal:input.signal});
        if(issued.state!=='awaiting')throw new QoniError('Original protected input already has state; read its reference.',{code:'sensitive.input_closed',retryable:false});
        const accepted=await api.intake({token:input.token,ref:issued.ref,value:input.values[f.name] as string,persist:input.persistFields?.includes(f.name),signal:input.signal});
        if(accepted.ref!==issued.ref || accepted.expires_at!==issued.expires_at || accepted.card_deadline!==issued.card_deadline || accepted.value_deadline!==issued.value_deadline || accepted.state!=='ready')throw new QoniError('Protected input outcome is unknown.',{code:'sensitive.response_unknown',submissionUnknown:true,retryable:false});
        reply[f.name]=accepted.ref;
      }
      try{await transport.webAgentJson('POST',`/do_anything/runs/${encodeURIComponent(input.runId)}/interactions/${encodeURIComponent(card.id)}/submit`,input.token,
        {body:{values:reply},signal:input.signal,requiredScopes:['webagent.do_anything:manage']});}
      catch(error){const status=error instanceof QoniError?error.status:undefined;const unknown=status===undefined||status>=500;
        throw new QoniError(unknown?'Protected reference reply outcome is unknown; read the original Task and reference.':'Protected reference reply was rejected.',
          {code:unknown?'sensitive.reply_unknown':'sensitive.reply_rejected',status,submissionUnknown:unknown,retryable:false});}
    },
  };
}
