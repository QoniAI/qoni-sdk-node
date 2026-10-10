/** Generate the public management contract from the GenAuth NestJS controllers/DTOs. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
import { extractAuthingManagement } from './extract-authing-management.mjs';

const snapshotPath = 'scripts/contracts/authing-management.json';
if (process.env.AUTHING_SDK_SOURCE_DIR) {
  const snapshot = JSON.stringify(extractAuthingManagement(process.env.AUTHING_SDK_SOURCE_DIR), null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(snapshotPath, 'utf8') !== snapshot) throw new Error('Official Authing contract differs from the pinned snapshot');
  } else {
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.writeFileSync(snapshotPath, snapshot);
  }
}
const upstream = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

const root = path.resolve(process.env.GENAUTH_SOURCE_DIR || '../genauth');
const base = path.join(root, 'src/modules/api/v3/management');
const folders = new Set(['users','roles','groups','organizations','applications','access-control','data-permission','custom-fields','ext-idp','tenant','audit-logs','security','session-management','webhook','sync-center','dynamic-group','pipeline','access-key','whitelist']);
const groups = { 'data-permission':'dataPermissions','custom-fields':'customFields','ext-idp':'identityProviders',tenant:'tenants','audit-logs':'auditLogs','session-management':'sessions',webhook:'webhooks','sync-center':'sync','dynamic-group':'dynamicGroups',pipeline:'pipelines','access-key':'accessKeys'};
const aliases = {
  positions: { postList: 'list', postListBatch: 'listBatch', getPost: 'get', getPostById: 'getById', createPost: 'create', updatePost: 'update', removePost: 'delete', getUserPosts: 'listUserPosts', setUserPosts: 'setUserPosts' },
  publicAccounts: { listPublicAccounts: 'list', getPublicAccount: 'get', getPublicAccountBatch: 'getBatch', createPublicAccount: 'create', createPublicAccountsBatch: 'createBatch', updatePublicAccount: 'update', deletePublicAccountsBatch: 'deleteBatch' },
  invitations: { listInvitationPolicies: 'listPolicies', createInvitationPolicy: 'createPolicy', listInvitationRoster: 'listRosters', createInvitationRoster: 'createRoster' },
  approvals: { getDetail: 'get', pendList: 'listPending', closedList: 'listClosed', processApproval: 'process', batchProcessApproval: 'processBatch' },
  riskLists: { findIpList: 'listIps', add: 'addIp', deleteById: 'deleteIp', findUserList: 'listUsers', addUser: 'addUser', deleteUserListById: 'deleteUser' },
  users: {listUsers:'list',getUser:'get',getUserBatch:'getBatch',createUser:'create',createUsersBatch:'createBatch',updateUser:'update',deleteUsersBatch:'deleteBatch',getUserRoles:'listRoles',getUserGroups:'listGroups',getUserDepartments:'listDepartments',getUserAuthorizedResources:'listAuthorizedResources',resignUser:'resign',resignUserBatch:'resignBatch',kickUsers:'kick',isUserExists:'exists',setUserDepartments:'setDepartments'},
  roles: {createRole:'create',getRole:'get',listRoles:'list',updateRole:'update',createRolesBatch:'createBatch',deleteRolesBatch:'deleteBatch',assignRole:'assign',revokeRole:'revoke',assignRoleBatch:'assignBatch',revokeRoleBatch:'revokeBatch',listRoleMembers:'listMembers',listRoleAssignments:'listAssignments'},
  groups: {createGroup:'create',getGroup:'get',listGroups:'list',updateGroup:'update',deleteGroupsBatch:'deleteBatch',addGroupMembers:'addMembers',removeGroupMembers:'removeMembers',listGroupMembers:'listMembers'},
  organizations: {createOrganization:'create',getOrganization:'get',listOrganizations:'list',updateOrganization:'update',deleteOrganization:'delete'},
  departments: {createDepartment:'create',getDepartment:'get',getDepartmentById:'getById',updateDepartment:'update',deleteDepartment:'delete',listDepartmentMembers:'listMembers',listDepartmentMemberIds:'listMemberIds',listChildrenDepartments:'listChildren',addDepartmentMembers:'addMembers',removeDepartmentMembers:'removeMembers',getParentDepartment:'getParent'},
  applications: {createApplication:'create',getApplication:'get',listApplications:'list',updateApplication:'update',deleteApplication:'delete',getApplicationSecret:'getSecret',refreshApplicationSecret:'refreshSecret',authorizeApplicationAccess:'authorizeAccess',revokeApplicationAccess:'revokeAccess'},
  namespaces: {createNamespace:'create',getNamespace:'get',listNamespaces:'list',updateNamespace:'update',deleteNamespace:'delete',createNamespacesBatch:'createBatch',deleteNamespacesBatch:'deleteBatch',getNamespacesBatch:'getBatch',listNamespaceRoles:'listRoles'},
  resources: {createResource:'create',getResource:'get',listResources:'list',updateResource:'update',deleteResource:'delete',createResourcesBatch:'createBatch',deleteResourcesBatch:'deleteBatch',getResourcesBatch:'getBatch'},
  policies: {createPolicy:'create',getPolicy:'get',listPolicies:'list',updatePolicy:'update',deletePoliciesBatch:'deleteBatch'},
  permissions: {authorizeResources:'authorize',getAuthorizedResources:'listResources',getAuthorizedTargets:'listTargets',isActionAllowed:'isAllowed'},
  tenants: {createTenant:'create',getTenant:'get',listTenants:'list',updateTenant:'update',deleteTenant:'delete',listTenantUsers:'listUsers',addTenantUsers:'addUsers',removeTenantUsers:'removeUsers'},
  identityProviders: {createExtIdp:'create',getExtIdp:'get',listExtIdp:'list',updateExtIdp:'update',deleteExtIdp:'delete',createExtIdpConn:'createConnection',updateExtIdpConn:'updateConnection',deleteExtIdpConn:'deleteConnection'},
  sessions: {listSessions:'list',deactivateSessionsBatch:'deactivateBatch',deactivateAllSessions:'deactivateAll'},
  dynamicGroups: {createDynamicGroup:'create',getDynamicGroup:'get',listDynamicGroups:'list',updateDynamicGroup:'update',deleteDynamicGroup:'delete'},
  customFields: {listCustomFields:'list',getCustomFields:'get',setCustomFields:'set',deleteCustomFields:'delete',getCustomData:'getData',setCustomData:'setData'},
  auditLogs: {getAdminAuditLogs:'list',getUserActionLogs:'listUserActions'},
  security: {getSecuritySettings:'get',updateSecuritySettings:'update'},
  webhooks: {listWebhooks:'list',createWebhook:'create',getWebhook:'get',updateWebhook:'update',deleteWebhook:'delete'},
  sync: {listSyncTasks:'list',createSyncTask:'create',getSyncTask:'get',updateSyncTask:'update',deleteSyncTask:'delete'},
  pipelines: {listPipelineFunctions:'list',createPipelineFunction:'create',getPipelineFunction:'get',updatePipelineFunction:'update',deletePipelineFunction:'delete'},
  accessKeys: {createAccessKey:'create',listAccessKeys:'list',deleteAccessKey:'delete',updateAccessKey:'update'},
};
function walk(p) {return fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]);}
const files = walk(base).filter(f=>f.endsWith('.controller.ts') && folders.has(path.relative(base,f).split(path.sep)[0]) && !f.includes('.internal.')).sort();
const config=ts.readConfigFile(path.join(root,'tsconfig.json'),ts.sys.readFile);
if(config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText,'\n'));
const options=ts.parseJsonConfigFileContent(config.config,ts.sys,root).options;
const program=ts.createProgram(files,{...options,noEmit:true,skipLibCheck:true});
const checker=program.getTypeChecker();
const decorators=n=>(n&&ts.canHaveDecorators(n)?ts.getDecorators(n)||[]:[]).map(x=>x.expression);
const named=(n,name)=>decorators(n).find(x=>(ts.isCallExpression(x)?x.expression:x).getText()===name);
const objectValue=(call,key)=>call&&ts.isCallExpression(call)&&call.arguments[0]&&ts.isObjectLiteralExpression(call.arguments[0])?call.arguments[0].properties.find(p=>p.name?.getText()===key)?.initializer:undefined;
const docs=n=>{const d=objectValue(named(n,'ApiProperty'),'description')||objectValue(named(n,'ApiOperation'),'summary');return d&&ts.isStringLiteralLike(d)?d.text:undefined;};
const optional=s=>{const d=s.valueDeclaration||s.declarations?.[0];if(s.name==='dataType'&&d?.parent?.name?.getText()==='SetCustomFieldDto')return false;return Boolean(s.flags&ts.SymbolFlags.Optional)||Boolean(d?.initializer)||Boolean(d&&(named(d,'IsOptional')||named(d,'ValidateIf')));};
const queue=[], seen=new Map(), names=new Set();
function modelName(type) {if(seen.has(type))return seen.get(type);let raw=(type.aliasSymbol||type.symbol)?.name||'Object';if(raw.startsWith('__')||raw==='Type')raw='Object';const baseName='GenAuth'+raw.replace(/[^\w]/g,'');let name=baseName;let i=2;while(names.has(name))name=baseName+i++;names.add(name);seen.set(type,name);queue.push({type,name});return name;}
function wireType(type,depth=0) {
  if(!type||depth>30)return 'unknown';
  const f=type.flags;
  if(f&(ts.TypeFlags.Any|ts.TypeFlags.Unknown))return 'unknown';
  if(f&ts.TypeFlags.ESSymbolLike)return 'unknown';
  if(f&ts.TypeFlags.Never)return 'never';
  if(f&ts.TypeFlags.StringLiteral)return JSON.stringify(type.value);
  if(f&ts.TypeFlags.NumberLiteral)return String(type.value);
  if(f&ts.TypeFlags.BooleanLiteral)return type.intrinsicName;
  if(f&ts.TypeFlags.StringLike)return 'string';
  if(f&ts.TypeFlags.NumberLike)return 'number';
  if(f&ts.TypeFlags.BooleanLike)return 'boolean';
  if(f&ts.TypeFlags.Null)return 'null';
  if(f&ts.TypeFlags.Undefined)return 'undefined';
  if(f&ts.TypeFlags.Void)return 'void';
  if(type.isUnion())return [...new Set(type.types.map(x=>wireType(x,depth+1)))].join(' | ');
  if(type.isIntersection())return type.types.map(x=>wireType(x,depth+1)).join(' & ');
  if(checker.isArrayType(type))return '('+wireType(checker.getTypeArguments(type)[0],depth+1)+')[]';
  if(checker.isTupleType(type))return '['+checker.getTypeArguments(type).map(x=>wireType(x,depth+1)).join(', ')+']';
  const name=type.symbol?.name;
  if(name==='Date'||name==='String')return 'string';
  if(name==='Number')return 'number';
  if(name==='Boolean')return 'boolean';
  if(name==='Object')return 'Record<string, unknown>';
  if(name==='Function')return 'unknown';
  if(name==='Promise')return wireType(checker.getTypeArguments(type)[0],depth+1);
  if(type.getCallSignatures().length)return 'unknown';
  const props=checker.getPropertiesOfType(type).filter(p=>!p.name.startsWith('__@')&&!p.getDeclarations()?.some(ts.isMethodDeclaration));
  if(!props.length) {const index=checker.getIndexTypeOfType(type,ts.IndexKind.String);return index?'Record<string, '+wireType(index,depth+1)+'>':'Record<string, unknown>';}
  return modelName(type);
}
function propertyType(p) {const d=p.valueDeclaration||p.declarations?.[0];const type=checker.getTypeOfSymbolAtLocation(p,d);if(['page','limit'].includes(p.name)&&(type.flags&ts.TypeFlags.StringLike))return checker.getNumberType();return p.name==='description'&&(type.flags&ts.TypeFlags.StringLiteral)?checker.getStringType():type;}
function requiredFields(type) {
  return checker.getPropertiesOfType(type).filter(p=>!p.name.startsWith('__@')&&!optional(p)).map(p=>{
    const t=propertyType(p),d=p.valueDeclaration||p.declarations?.[0];
    const kind=t.flags&ts.TypeFlags.StringLike?'string':t.flags&ts.TypeFlags.NumberLike?'number':checker.isArrayType(t)?'array':'value';
    const arrayMin=named(d,'ArrayMinSize');
    return {name:p.name,kind,...(arrayMin?.arguments?.[0]&&ts.isNumericLiteral(arrayMin.arguments[0])?{minItems:Number(arrayMin.arguments[0].text)}:{})};
  });
}
const ops=[];
for(const file of files) {
  const sf=program.getSourceFile(file);
  for(const c of sf.statements.filter(ts.isClassDeclaration)) {
    const controller=named(c,'Controller');const prefix=controller?.arguments?.[0];
    if(prefix&&ts.isStringLiteral(prefix)&&prefix.text)continue;
    for(const m of c.members.filter(ts.isMethodDeclaration)) {
      const route=decorators(m).find(x=>ts.isCallExpression(x)&&['Get','Post','Delete','Patch'].includes(x.expression.getText()));
      if(!route||!ts.isStringLiteral(route.arguments[0])||!named(m,'ApiOperation')||named(m,'ApiExcludeEndpoint'))continue;
      const endpoint=route.arguments[0].text;
      if(!endpoint.startsWith('/api/v3/')||endpoint.includes(':')||m.parameters.some(p=>['UploadedFile','UploadedFiles','Param','Res'].some(x=>named(p,x))))continue;
      const method=route.expression.getText().toUpperCase();
      let name=endpoint.slice('/api/v3/'.length).replace(/[-/]([a-z])/g,(_,s)=>s.toUpperCase());
      if (endpoint === '/api/v3/list-users' && method === 'GET') name = 'listUsersLegacy';
      const parameter=m.parameters.find(p=>named(p,'Body')||named(p,'Query'));
      const inputType=parameter?checker.getTypeAtLocation(parameter):undefined;
      let output;
      const response=objectValue(named(m,'ApiOkResponse'),'type');
      if(response) {
        const symbol=checker.getSymbolAtLocation(response);
        const real=symbol&&(symbol.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(symbol):symbol);
        const responseType=real?checker.getDeclaredTypeOfSymbol(real):undefined;
        const data=responseType?.getProperty('data');
        if(data)output=propertyType(data);
      }
      if(!output&&m.type)output=checker.getTypeAtLocation(m.type);
      const folder=path.relative(base,file).split(path.sep)[0];
      let group=groups[folder]||folder;
      if(folder==='organizations'&&file.endsWith('departments.controller.ts'))group='departments';
      if(folder==='access-control')group={'namespace.controller.ts':'namespaces','resource.controller.ts':'resources','policy.controller.ts':'policies','access-control.controller.ts':'permissions'}[path.basename(file)];
      if(!group||ops.some(o=>o.name===name))throw new Error('Duplicate or ungrouped operation: '+name);
      const parameters=m.parameters.filter(p=>named(p,'Body')||named(p,'Query'));
      const parts=parameters.map(p=>{const d=named(p,'Body')||named(p,'Query');const key=d.arguments[0]&&ts.isStringLiteral(d.arguments[0])?d.arguments[0].text:undefined;const type=checker.getTypeAtLocation(p);return {p,type,key,query:Boolean(named(p,'Query'))};});
      const input=parts.length?parts.map(({p,type,key})=>key?'{ '+JSON.stringify(key)+(p.initializer||p.questionToken?'?':'')+': '+wireType(type)+' }':wireType(type)).join(' & '):'Record<never, never>';
      const required=parts.flatMap(({p,type,key})=>key?p.initializer||p.questionToken?[]:[{name:key,kind:'value'}]:requiredFields(type));
      const queryKeys=method==='GET'?[]:parts.filter(p=>p.query).flatMap(p=>p.key?[p.key]:checker.getPropertiesOfType(p.type).map(s=>s.name));
      ops.push({name,method,path:endpoint,namespace:group,alias:aliases[group]?.[name],...(queryKeys.length?{queryKeys}:{}),required,input,output:wireType(output),summary:docs(m)||name,source:path.relative(root,file).replaceAll(path.sep,'/')});
    }
  }
}
function latestNamespace(operation) {
  const { name, path: endpoint } = operation;
  if (endpoint.includes('metadata') || name === 'getRowBatch') return 'metadata';
  if (/public-account|public-accounts/.test(endpoint)) return 'publicAccounts';
  if (/invitation|invitee/.test(endpoint)) return 'invitations';
  if (/post/.test(endpoint)) return 'positions';
  if (/email/.test(endpoint)) return 'email';
  if (/package-info|usage-info|mau-period|rights-items|orders|order-detail|order-pay/.test(endpoint)) return 'billing';
  if (/device-exclusive/.test(endpoint)) return 'deviceRules';
  if (/device|verify-config-app/.test(endpoint)) return 'devices';
  if (/ip-list|user-list|risk-list-policy/.test(endpoint)) return 'riskLists';
  if (/approval/.test(endpoint)) return 'approvals';
  if (/ldap/.test(endpoint)) return 'ldap';
  if (/event/i.test(endpoint)) return 'events';
  throw new Error('Ungrouped official Authing operation: ' + name);
}
for (const official of upstream.operations) {
  const sameEndpoint = ops.find(o => o.path === official.path && o.method === official.method);
  const sameName = ops.find(o => o.name === official.name);
  if (sameName && sameName !== sameEndpoint) throw new Error('Conflicting official Authing method: ' + official.name);
  const namespace = sameEndpoint?.namespace || latestNamespace(official);
  const merged = {
    ...official, namespace,
    // Accept the official DTO and the proven GenAuth DTO when deployed contracts differ.
    ...(sameName ? { input: `(${official.input}) | (${sameName.input})` } : {}),
    ...((sameName?.alias || aliases[namespace]?.[official.name]) ? { alias: sameName?.alias || aliases[namespace][official.name] } : {}),
    // Preserve checked GenAuth server constraints and mixed query/body bindings.
    ...(sameEndpoint ? { required: sameEndpoint.required, ...(sameEndpoint.queryKeys ? { queryKeys: sameEndpoint.queryKeys } : {}) } : {}),
    ...(official.name === 'getTenantEnterpriseCertification' ? { queryAliases: { tenantId: 'tenant_id' } } : {}),
    origin: 'authing-sdk',
  };
  if (sameName) Object.assign(sameName, merged);
  else ops.push(merged);
}
ops.sort((a,b)=>a.name.localeCompare(b.name));
let definitions=[];
for(let i=0;i<queue.length;i++) {
  const {type,name}=queue[i];const properties=checker.getPropertiesOfType(type).filter(p=>!p.name.startsWith('__@')&&!p.getDeclarations()?.some(ts.isMethodDeclaration));
  const lines=properties.map(p=>{const d=p.valueDeclaration||p.declarations?.[0];const description=docs(d);return `${description?'  /** '+description.replaceAll('*/','* /').replaceAll('\n',' ')+' */\n':''}  ${JSON.stringify(p.name)}${optional(p)?'?':''}: ${wireType(propertyType(p))};`;});
  const index=checker.getIndexTypeOfType(type,ts.IndexKind.String);if(index)lines.push('  [key: string]: '+wireType(index)+';');
  definitions.push(`export interface ${name} {\n${lines.join('\n')}\n}`);
}
definitions.push(...upstream.models);
const header=`// Generated from Authing/authing-node-sdk ${upstream.source.version} (${upstream.source.commit}) and GenAuth extensions.\n// Upstream contract copyright (c) 2019-present Authing; MIT, see docs/authing-sdk-LICENSE.txt.\n// Do not edit by hand. Authing wire names are intentionally preserved.\n`;
const typeFile=header+`import type { QoniResponse } from '../types';\nimport type { GenAuthAdminTokenOverrideInput, GenAuthManagementRequestOptions } from '../genauth-management';\n\n`+definitions.join('\n\n')+'\n\n'+ops.map(o=>`/** ${o.summary} */\nexport type GenAuth${o.name[0].toUpperCase()+o.name.slice(1)}Input = ${o.input};\nexport type GenAuth${o.name[0].toUpperCase()+o.name.slice(1)}Result = ${o.output};`).join('\n\n')+`\n\nexport interface GenAuthManagementOperations {\n`+ops.map(o=>{const n='GenAuth'+o.name[0].toUpperCase()+o.name.slice(1);return `  /** ${o.summary} */\n  ${o.name}: { input: ${n}Input; result: ${n}Result; optional: ${o.required.length===0} };`;}).join('\n')+`\n}\n\nexport type GenAuthManagementMethod<K extends keyof GenAuthManagementOperations> =\n  GenAuthManagementOperations[K]['optional'] extends true\n    ? <T = GenAuthManagementOperations[K]['result']>(input?: GenAuthManagementOperations[K]['input'] & GenAuthAdminTokenOverrideInput, options?: GenAuthManagementRequestOptions) => Promise<QoniResponse<T>>\n    : <T = GenAuthManagementOperations[K]['result']>(input: GenAuthManagementOperations[K]['input'] & GenAuthAdminTokenOverrideInput, options?: GenAuthManagementRequestOptions) => Promise<QoniResponse<T>>;\n\nexport type GenAuthManagementClient = { [K in keyof GenAuthManagementOperations]: GenAuthManagementMethod<K> };\n\nexport interface GenAuthManagementNamespaces {\n`+[...new Set(ops.map(o=>o.namespace))].sort().map(g=>`  ${g}: Pick<GenAuthManagementClient, ${ops.filter(o=>o.namespace===g).map(o=>JSON.stringify(o.name)).join(' | ')}> & {\n`+ops.filter(o=>o.namespace===g&&o.alias).map(o=>`    ${o.alias}: GenAuthManagementClient[${JSON.stringify(o.name)}];`).join('\n')+`\n  };`).join('\n')+`\n}\n`;
const routeFile=header+`export const genAuthManagementRoutes = `+JSON.stringify(Object.fromEntries(ops.map(({name,method,path,namespace,alias,required,queryKeys,pathKeys,queryAliases,defaults})=>[name,{method,path,namespace,...(alias?{alias}:{}),...(queryKeys?{queryKeys}:{}),...(pathKeys?{pathKeys}:{}),...(queryAliases?{queryAliases}:{}),...(defaults?{defaults}:{}),required}])),null,2)+' as const;\n';
const catalog=`# GenAuth management API catalog\n\nGenerated primarily from [Authing/authing-node-sdk ${upstream.source.version}](${upstream.source.repository}/tree/${upstream.source.commit}), with checked GenAuth server extensions. ${ops.length} JSON management methods across ${new Set(ops.map(o=>o.namespace)).size} namespaces: all ${upstream.operations.length} official JSON methods plus ${ops.length-upstream.operations.length} GenAuth extension/compatibility names. Actual deployment support, feature gates and entitlement checks can vary. Multiple method names can map to the same endpoint.\n\nCall the flat Authing-compatible names through \`qoni.genauth.management\`, or use the domain namespaces. Methods accept one input object and use the Qoni management-token exchange, returning \`{ data, meta }\`. The upstream MIT notice is in [authing-sdk-LICENSE.txt](./authing-sdk-LICENSE.txt).\n\n| Namespace | Method | Alias | HTTP | Path | Contract origin | Description |\n| --- | --- | --- | --- | --- | --- | --- |\n`+ops.map(o=>`| ${o.namespace} | ${o.name} | ${o.alias||''} | ${o.method} | ${o.path} | ${o.origin||'genauth-extension'} | ${o.summary.replaceAll('|',' / ').replaceAll('\n',' ')} |`).join('\n')+'\n\n## Official helpers outside the JSON surface\n\n| Method | Reason |\n| --- | --- |\n'+upstream.excluded.map(o=>`| ${o.name} | ${o.reason} |`).join('\n')+'\n';
for(const [file,content] of [['src/generated/genauth-management-types.ts',typeFile],['src/generated/genauth-management-routes.ts',routeFile],['docs/genauth-management-api.md',catalog]]) {
  if(process.argv.includes('--check')) {
    const actual = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (actual !== content) {
      const expectedLines = content.split('\n'), actualLines = actual.split('\n');
      const line = expectedLines.findIndex((value, i) => value !== actualLines[i]);
      throw new Error(`Generated contract differs: ${file}:${line + 1}\nexpected: ${expectedLines[line]}\nactual: ${actualLines[line]}`);
    }
  }else fs.writeFileSync(file,content);
}
console.log(JSON.stringify({operations:ops.length,namespaces:[...new Set(ops.map(o=>o.namespace))].sort(),models:definitions.length,contractHash:crypto.createHash('sha256').update(typeFile+routeFile).digest('hex')}));
