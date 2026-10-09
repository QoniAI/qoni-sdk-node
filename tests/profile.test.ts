import {describe,it,expect,vi} from 'vitest';
import {createDoAnythingNamespace} from '../src/do-anything';
describe('ordinary task profile',()=>{
 it('uses the run endpoint without caller user or pool authority',async()=>{
  const wire=vi.fn().mockResolvedValue({values:{name:'Alice'},missing:[],writable_fields:['name']});
  const api:any=createDoAnythingNamespace({webAgentJson:wire} as any);
  const result=await api.profile.read({runId:'run-a',token:'private',fields:['name']});
  expect(result.values).toEqual({name:'Alice'});
  expect(wire).toHaveBeenCalledWith('POST','/do_anything/runs/run-a/profile/read','private',{body:{fields:['name']},requiredScopes:['webagent.do_anything:read']});
 });
 it('updates only the explicit supplied fields and never retries an unknown response',async()=>{
  const wire=vi.fn().mockRejectedValue(new Error('unknown_commit'));
  const api:any=createDoAnythingNamespace({webAgentJson:wire} as any);
  await expect(api.profile.update({runId:'r',token:'t',values:{address:'Road'}})).rejects.toThrow('unknown_commit');
  expect(wire).toHaveBeenCalledTimes(1);
 });
});
