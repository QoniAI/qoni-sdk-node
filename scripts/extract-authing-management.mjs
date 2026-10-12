/** Extract the pinned official ManagementClient contract without executing upstream code. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

export function extractAuthingManagement(root) {
  root = path.resolve(root);
  const clientPath = path.join(root, 'src/ManagementClient.ts');
  const program = ts.createProgram([clientPath], {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    strictNullChecks: true, skipLibCheck: true, noEmit: true,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(clientPath);
  if (!source) throw new Error(`Missing official ManagementClient: ${clientPath}`);
  const cls = source.statements.find(ts.isClassDeclaration);
  const queue = [], seen = new Map(), names = new Set();
  const summary = node => node.jsDoc?.flatMap(d => d.tags || []).find(t => t.tagName.text === 'summary')?.comment || node.name?.getText(source);
  const description = symbol => ts.displayPartsToString(symbol.getDocumentationComment(checker)).replaceAll('*/', '* /').replaceAll('\n', ' ');
  const optional = symbol => Boolean(symbol.flags & ts.SymbolFlags.Optional);
  const propertyType = symbol => checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration || symbol.declarations[0]);

  function modelName(type) {
    if (seen.has(type)) return seen.get(type);
    let raw = (type.aliasSymbol || type.symbol)?.name || 'Object';
    if (raw.startsWith('__')) raw = 'Object';
    const base = 'GenAuthSdk' + raw.replace(/[^\w]/g, '');
    let name = base, i = 2;
    while (names.has(name)) name = base + i++;
    names.add(name); seen.set(type, name); queue.push({ type, name });
    return name;
  }
  function wireType(type, depth = 0) {
    if (!type || depth > 30) return 'unknown';
    const f = type.flags;
    if (f & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return 'unknown';
    if (f & ts.TypeFlags.ESSymbolLike) return 'unknown';
    if (f & ts.TypeFlags.StringLiteral) return JSON.stringify(type.value);
    if (f & ts.TypeFlags.NumberLiteral) return String(type.value);
    if (f & ts.TypeFlags.BooleanLiteral) return type.intrinsicName;
    if (f & ts.TypeFlags.StringLike) return 'string';
    if (f & ts.TypeFlags.NumberLike) return 'number';
    if (f & ts.TypeFlags.BooleanLike) return 'boolean';
    if (f & ts.TypeFlags.Null) return 'null';
    if (f & ts.TypeFlags.Undefined) return 'undefined';
    if (f & ts.TypeFlags.Void) return 'void';
    if (type.isUnion()) return [...new Set(type.types.map(t => wireType(t, depth + 1)))].join(' | ');
    if (type.isIntersection()) return type.types.map(t => wireType(t, depth + 1)).join(' & ');
    if (checker.isArrayType(type)) return '(' + wireType(checker.getTypeArguments(type)[0], depth + 1) + ')[]';
    if (checker.isTupleType(type)) return '[' + checker.getTypeArguments(type).map(t => wireType(t, depth + 1)).join(', ') + ']';
    if (type.symbol?.name === 'Date') return 'string';
    if (type.symbol?.name === 'Promise') return wireType(checker.getTypeArguments(type)[0], depth + 1);
    if (type.getCallSignatures().length) return 'unknown';
    if (!checker.getPropertiesOfType(type).filter(p => !p.name.startsWith('__@')).length) {
      const index = checker.getIndexTypeOfType(type, ts.IndexKind.String);
      return index ? 'Record<string, ' + wireType(index, depth + 1) + '>' : 'Record<string, unknown>';
    }
    return modelName(type);
  }
  function kind(type) {
    const variants = type.isUnion() ? type.types.filter(t => !(t.flags & ts.TypeFlags.Undefined)) : [type];
    if (variants.every(t => t.flags & ts.TypeFlags.StringLike)) return 'string';
    if (variants.every(t => t.flags & ts.TypeFlags.NumberLike)) return 'number';
    if (variants.every(t => checker.isArrayType(t))) return 'array';
    return 'value';
  }
  const operations = [], excluded = [];
  for (const methodNode of cls.members.filter(ts.isMethodDeclaration)) {
    const name = methodNode.name.getText(source);
    if (['makeRequest', 'reconnect', 'initWebSocket', 'sub'].includes(name)) {
      excluded.push({ name, reason: name === 'makeRequest' ? 'raw transport escape hatch' : 'WebSocket event subscription, outside JSON management' });
      continue;
    }
    if (name === 'upload') {
      excluded.push({ name, reason: 'multipart file upload; official method omits the file payload' });
      continue;
    }
    const calls = [];
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(source) === 'this.httpClient.request') calls.push(node);
      ts.forEachChild(node, visit);
    }
    visit(methodNode);
    if (calls.length !== 1 || !ts.isObjectLiteralExpression(calls[0].arguments[0])) throw new Error(`Unsupported upstream request shape: ${name}`);
    const config = calls[0].arguments[0];
    const value = key => config.properties.find(p => p.name?.getText(source) === key)?.initializer;
    const url = value('url'), verb = value('method');
    if (!ts.isStringLiteral(url) || !ts.isStringLiteral(verb)) throw new Error(`Nonliteral upstream route: ${name}`);
    const query = value('params');
    const queryKeys = query && ts.isObjectLiteralExpression(query) ? query.properties.map(p => p.name.getText(source).replaceAll('"', '').replaceAll("'", '')) : [];
    const pathKeys = [...url.text.matchAll(/\{(\w+)\}/g)].map(match => match[1]);
    const defaults = {};
    const parts = methodNode.parameters.map(parameter => {
      const type = checker.getTypeAtLocation(parameter);
      if (ts.isObjectBindingPattern(parameter.name)) {
        for (const binding of parameter.name.elements) {
          if (!binding.initializer) continue;
          try { defaults[(binding.propertyName || binding.name).getText(source)] = JSON.parse(binding.initializer.getText(source)); }
          catch { throw new Error(`Nonliteral upstream default: ${name}.${binding.name.getText(source)}`); }
        }
      }
      if (ts.isObjectBindingPattern(parameter.name) || checker.getPropertiesOfType(type).length && kind(type) === 'value' && !(type.flags & ts.TypeFlags.StringLike) && !checker.isArrayType(type)) {
        return { input: wireType(type), required: checker.getPropertiesOfType(type).filter(p => !p.name.startsWith('__@') && !optional(p) && !(p.name in defaults)).map(p => ({ name: p.name, kind: kind(propertyType(p)) })) };
      }
      // Qoni uses one input object even for upstream's positional scalar arguments.
      const key = pathKeys[0] || parameter.name.getText(source);
      return { input: `{ ${JSON.stringify(key)}${parameter.questionToken || parameter.initializer ? '?' : ''}: ${wireType(type)} }`, required: parameter.questionToken || parameter.initializer ? [] : [{ name: key, kind: kind(type) }] };
    });
    const resultType = checker.getTypeAtLocation(methodNode.type);
    const result = resultType.symbol?.name === 'Promise' ? checker.getTypeArguments(resultType)[0] : resultType;
    const data = result.getProperty('data');
    operations.push({
      name, method: verb.text, path: url.text,
      input: parts.map(p => p.input).join(' & ') || 'Record<never, never>',
      output: wireType(data ? propertyType(data) : result),
      required: parts.flatMap(p => p.required),
      ...(queryKeys.length && verb.text !== 'GET' ? { queryKeys } : {}),
      ...(pathKeys.length ? { pathKeys } : {}),
      ...(Object.keys(defaults).length ? { defaults } : {}),
      summary: String(summary(methodNode)),
      source: `src/ManagementClient.ts#L${source.getLineAndCharacterOfPosition(methodNode.getStart(source)).line + 1}`,
    });
  }
  const models = [];
  for (let i = 0; i < queue.length; i++) {
    const { type, name } = queue[i];
    const fields = checker.getPropertiesOfType(type).filter(p => !p.name.startsWith('__@')).map(symbol => {
      const doc = description(symbol);
      return `${doc ? '  /** ' + doc + ' */\n' : ''}  ${JSON.stringify(symbol.name)}${optional(symbol) ? '?' : ''}: ${wireType(propertyType(symbol))};`;
    });
    const index = checker.getIndexTypeOfType(type, ts.IndexKind.String);
    if (index) fields.push('  [key: string]: ' + wireType(index) + ';');
    models.push(`export interface ${name} {\n${fields.join('\n')}\n}`);
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const commit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  return { source: { repository: 'https://github.com/Authing/authing-node-sdk', version: pkg.version, commit, license: 'MIT' }, operations, models, excluded };
}
