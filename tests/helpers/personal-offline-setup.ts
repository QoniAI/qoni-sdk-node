import {afterAll} from 'vitest';
import {appendFileSync} from 'node:fs';
afterAll(()=>{
  const counts=(globalThis as any).__personalSdkBoundary;
  if(process.env.PERSONAL_SDK_RED_NETWORK_LOG&&counts)appendFileSync(process.env.PERSONAL_SDK_RED_NETWORK_LOG,JSON.stringify(counts)+'\n',{mode:0o600});
});
