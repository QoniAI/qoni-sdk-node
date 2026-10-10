import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const doc=fs.readFileSync(path.join(root,'docs/genauth-communication.md'),'utf8');
const blocks=[...doc.matchAll(/```ts\n([\s\S]*?)```/g)].map(m=>m[1]);
const file=path.join(root,'tests/__communication_examples.ts');
const content=blocks.join('\n').replace("from '@qoniai/qoni'","from '../src'");
const options={strict:true,noEmit:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,skipLibCheck:true};
const host=ts.createCompilerHost(options);
const read=host.readFile.bind(host),exists=host.fileExists.bind(host);
host.readFile=f=>f===file?content:read(f);host.fileExists=f=>f===file||exists(f);
const program=ts.createProgram([file],options,host);
const errors=ts.getPreEmitDiagnostics(program);
if(errors.length) {console.error(ts.formatDiagnosticsWithColorAndContext(errors,{getCurrentDirectory:()=>root,getCanonicalFileName:f=>f,getNewLine:()=> '\n'}));process.exitCode=1;}
else console.log(`Communication examples: ${blocks.length} TypeScript blocks checked against current SDK`);
