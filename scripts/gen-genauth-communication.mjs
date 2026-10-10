import fs from 'node:fs';
import ts from 'typescript';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'scripts/contracts/genauth-communication.json'), 'utf8'));
const normalize = r => `${r.method} ${r.path.replace(/\{\w+\}/g, '{}')}`;
const expected = new Set(snapshot.controllerRoutes.map(normalize));
const actual = new Set(snapshot.routes.map(normalize));
if (actual.size !== snapshot.routes.length || expected.size !== actual.size || [...expected].some(k => !actual.has(k))) throw Error('Communication SDK/controller route coverage differs');
const source = process.argv.includes('--source-dir') ? process.argv[process.argv.indexOf('--source-dir') + 1] : undefined;
if (source) for (const [file, hash] of Object.entries(snapshot.sourceFiles)) {
  if (crypto.createHash('sha256').update(fs.readFileSync(path.join(source, file))).digest('hex') !== hash) throw Error(`Contract drift: ${file}`);
}
const schemas = snapshot.schemas;
const ref = s => `GenAuthMail${s.split('/').at(-1)}`;
function type(s) {
  if (typeof s === 'string') return s;
  if (!s) return 'unknown';
  let out;
  if (s.$ref) out = ref(s.$ref);
  else if (s.allOf) out = s.allOf.map(type).join(' & ');
  else if (s.enum) out = s.enum.map(v => JSON.stringify(v)).join(' | ');
  else if (s.properties || s.type === 'object') {
    out = `{ ${Object.entries(s.properties ?? {}).map(([k,v]) => `${JSON.stringify(k)}${s.required?.includes(k) ? '' : '?'}: ${type(v)};`).join(' ')} }`;
    if (!s.properties && s.additionalProperties !== false) out = 'Record<string, unknown>';
    if (s.oneOf || s.anyOf) out += ' & (' + (s.oneOf ?? s.anyOf).map(v => {
      const branch = { ...v, type: 'object', properties: { ...v.properties }, required: v.required ?? [] };
      for (const k of v.required ?? []) branch.properties[k] ??= s.properties?.[k] ?? {};
      for (const k of v.not?.required ?? v.not?.anyOf?.flatMap(x => x.required ?? []) ?? []) branch.properties[k] = {type:'never'};
      return type(branch);
    }).join(' | ') + ')';
  } else if (s.type === 'array') out = `(${type(s.items)})[]`;
  else out = { string:'string', integer:'number', number:'number', boolean:'boolean', never:'never' }[s.type] ?? 'unknown';
  return s.nullable ? `(${out}) | null` : out;
}
const named = n => n.split('.').map(k => k[0].toUpperCase()+k.slice(1)).join('');
let types = "// Generated from scripts/contracts/genauth-communication.json. Do not edit.\nimport type { QoniResponse } from '../types';\n";
const custom = fs.readFileSync(path.join(root,'src/genauth-communication-types.ts'),'utf8');
const imported = [...custom.matchAll(/export (?:type|interface) (GenAuth\w+)/g)].map(m=>m[1]);
types += `import type { ${imported.join(', ')} } from '../genauth-communication-types';\n`;
for (const [n,s] of Object.entries(schemas)) types += `export type GenAuthMail${n} = ${type(s)};\n`;
const trees={agentMail:{},agentPhone:{}};
for (const r of snapshot.routes) {
  const tn=named(r.name); const auth=r.name.includes('.admin.')?'GenAuthCommunicationAdminInput':'GenAuthCommunicationAuthInput';
  r.pathKeys=[...r.path.matchAll(/\{(\w+)\}/g)].map(m=>m[1]);
  r.requiredPathKeys=r.pathKeys;
  const schema=r.bodySchema?schemas[r.bodySchema]:undefined;
  r.requiredBodyKeys=schema?.required ?? [];
  types+=`export type GenAuth${tn}Input = (${type(r.input)}) & ${auth}${r.idempotency?' & { idempotencyKey: string }':''}${r.revision?' & { revision: number }':''};\n`;
  types+=`export type GenAuth${tn}Result = ${type(r.result)};\n`;
  let tree=trees; const parts=r.name.split('.'); for (const part of parts.slice(0,-1)) tree=tree[part]??={};
  const optional=!r.revision&&!r.idempotency&&!r.pathKeys.length && (typeof r.input==='object' ? !(r.input.required?.length || r.input.allOf?.some(s=>s.required?.length || s.$ref)) : r.input==='{}'||r.input==='GenAuthCursorInput'||r.method==='GET'&&!/\b\w+\s*:/.test(r.input));
  tree[parts.at(-1)]=`(input${optional?'?':''}: GenAuth${tn}Input, options?: GenAuthCommunicationRequestOptions) => Promise<QoniResponse<GenAuth${tn}Result>>`;
}
function treeType(t) {return '{\n'+Object.entries(t).map(([n,v])=>`${n}: ${typeof v==='string'?v:treeType(v)};`).join('\n')+'\n}';}
types+='export interface GenAuthCommunicationClient '+treeType(trees)+'\n';
const typeFile=path.join(root,'src/generated/genauth-communication-types.ts');
// Inspect the public input types to enforce missing/unknown fields for JS callers too.
if(process.argv.includes('--check')) { if(fs.readFileSync(typeFile,'utf8')!==types) throw Error('Stale communication types'); } else fs.writeFileSync(typeFile,types);
const program=ts.createProgram([typeFile],{strict:true,target:ts.ScriptTarget.ES2022,moduleResolution:ts.ModuleResolutionKind.Bundler,module:ts.ModuleKind.ESNext,skipLibCheck:true});
const checker=program.getTypeChecker();
const declarations=program.getSourceFile(typeFile).statements.filter(ts.isTypeAliasDeclaration);
for(const r of snapshot.routes) {
 const decl=declarations.find(d=>d.name.text===`GenAuth${named(r.name)}Input`);
 const inputType=checker.getTypeAtLocation(decl);
 r.inputFields=checker.getPropertiesOfType(inputType).map(symbol=>{
   const t=checker.getTypeOfSymbolAtLocation(symbol,decl);
   const parts=(t.isUnion()?t.types:[t]).filter(v=>!(v.flags & ts.TypeFlags.Undefined));
   const kind=parts.every(v=>v.flags & ts.TypeFlags.StringLike)?'string':parts.every(v=>v.flags & ts.TypeFlags.NumberLike)?'number':parts.every(v=>v.flags & ts.TypeFlags.BooleanLike)?'boolean':parts.every(v=>checker.isArrayType(v))?'array':parts.every(v=>v.flags & ts.TypeFlags.Object)?'object':undefined;
   return {name:symbol.name,required:!(symbol.flags & ts.SymbolFlags.Optional),...(kind?{kind}:{})};
 });
}
const files={'src/generated/genauth-communication-types.ts':types,'src/generated/genauth-communication-routes.ts':`// Generated from reviewed server contracts. Do not edit.\nexport const genAuthCommunicationRoutes = ${JSON.stringify(snapshot.routes.map(({name,method,path,queryKeys,pathKeys,idempotency,revision,inputFields})=>({name,method,path,queryKeys,pathKeys,idempotency,revision,inputFields})),null,2)} as const;\n`};
for(const [name,body] of Object.entries(files)) {
 const file=path.join(root,name);
 if(process.argv.includes('--check')) {if(fs.readFileSync(file,'utf8')!==body) throw Error(`Stale generated file: ${name}`);}
 else fs.writeFileSync(file,body);
}
console.log(`Communication contract: ${snapshot.routes.length} methods; all controller routes covered`);
