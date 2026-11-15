import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import ts from 'typescript';
import { libraryEntryPoints } from './LibraryEntryPoints.ts';
import { librarySourceDirectory, repositoryRoot } from '../RepositoryPaths.ts';

export interface Snippet {
  file: string;
  line: number;
  lang: 'ts' | 'tsx';
  code: string;
}

export function extractSnippets(markdown: string, file: string): Snippet[] {
  const lines = markdown.split(/\r?\n/);
  const snippets: Snippet[] = [];
  for (let index = 0; index < lines.length; index++) {
    const open = lines[index].match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
    if (!open) continue;
    const [, indent, fence, info] = open;
    const close = new RegExp(`^ {0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`);
    let end = index + 1;
    while (end < lines.length && !close.test(lines[end])) end++;
    const [lang, ...flags] = info.trim().split(/\s+/);
    if (
      (lang === 'ts' || lang === 'tsx') &&
      !flags.some((flag) => /^(?:figure|source)=/.test(flag) || flag === 'nocheck')
    )
      snippets.push({
        file,
        line: index + 2,
        lang,
        code: lines
          .slice(index + 1, end)
          .map((line) => line.replace(new RegExp(`^ {0,${indent.length}}`), ''))
          .join('\n'),
      });
    index = end;
  }
  return snippets;
}

export function wrapSnippet(code: string): string {
  const lines = code.split('\n');
  const first = lines.findIndex((line) => line.trim() !== '');
  if (first !== -1 && /^\{/.test(lines[first])) {
    let last = lines.length - 1;
    while (lines[last].trim() === '') last--;
    lines[first] = `void (${lines[first]}`;
    lines[last] = `${lines[last].replace(/[;,]\s*$/, '')});`;
    return lines.join('\n');
  }
  const startsElement = (line: string) => /^<[A-Za-z>]/.test(line);
  const continues = (line: string) => !/^(?:[A-Za-z_$]|\/\/|\/\*)/.test(line);
  for (let start = 0; start < lines.length; start++) {
    if (!startsElement(lines[start])) continue;
    let end = start;
    while (end + 1 < lines.length && continues(lines[end + 1])) end++;
    while (lines[end].trim() === '') end--;
    lines[start] = `void (<>${lines[start]}`;
    lines[end] = `${lines[end].replace(/;\s*$/, '')}</>);`;
    start = end;
  }
  return lines.join('\n');
}

const cannotFindNameCodes = new Set([2304, 2552]);

export const reportedCodes = new Map<number, string>([
  [2305, 'an import an entry does not export'],
  [2724, 'an import an entry does not export, with a suggestion'],
  [2614, 'an import an entry does not export, but as its default'],
  [2694, 'a type a namespace does not export'],
  [2322, 'a value of the wrong type, or an unknown prop'],
  [2820, 'a value of the wrong type, with a suggestion'],
  [2345, 'an argument of the wrong type'],
  [2353, 'an unknown key of an object literal'],
  [2561, 'an unknown key of an object literal, with a suggestion'],
  [2339, 'a property that does not exist'],
  [2551, 'a property that does not exist, with a suggestion'],
  [2741, 'a required prop or key that is missing'],
  [2739, 'required props or keys that are missing'],
  [2740, 'required props or keys that are missing, and more'],
  [2769, 'no overload matches'],
  [2554, 'the wrong number of arguments'],
  [2559, 'a value with nothing in common with the type'],
  [2786, 'a value that is not a component'],
  [2746, 'children of the wrong number'],
  [2747, 'children of the wrong kind'],
]);

const preferredEntries = ['@envsemble/envui', '@envsemble/envui/markdown'];

const entries = [
  ...preferredEntries,
  ...libraryEntryPoints()
    .map(({ specifier }) => specifier)
    .filter((specifier) => !preferredEntries.includes(specifier)),
];

const reactNames = new Set([
  'Suspense',
  'Fragment',
  'startTransition',
  'ReactNode',
  'ReactElement',
  'ComponentProps',
  'CSSProperties',
  'RefObject',
]);

const hookValues = new Map([['toast', 'useToast']]);

const browserAPIs = new Set([
  'addEventListener',
  'removeEventListener',
  'cancelAnimationFrame',
  'requestAnimationFrame',
  'clearInterval',
  'clearTimeout',
  'setInterval',
  'setTimeout',
  'customElements',
  'document',
  'fetch',
  'getComputedStyle',
  'history',
  'localStorage',
  'location',
  'matchMedia',
  'navigator',
  'sessionStorage',
  'window',
]);

export const applicationComponents = new Set([
  'App',
  'Summary',
  'Activity',
  'Volume',
  'PipelineIcon',
]);

function isComponentTag(node: ts.Node): boolean {
  if (!ts.isIdentifier(node) || !/^[A-Z]/.test(node.text)) return false;
  let tag: ts.Node = node;
  while (ts.isPropertyAccessExpression(tag.parent) && tag.parent.expression === tag)
    tag = tag.parent;
  const parent = tag.parent;
  return (
    (ts.isJsxOpeningElement(parent) || ts.isJsxSelfClosingElement(parent)) && parent.tagName === tag
  );
}

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  moduleDetection: ts.ModuleDetectionKind.Force,
  customConditions: ['envui-source'],
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noImplicitAny: false,
  skipLibCheck: true,
  allowImportingTsExtensions: true,
  resolveJsonModule: true,
  noEmit: true,
  types: [],
};

const inLibrary = (fileName: string) => {
  const path = resolve(fileName).toLowerCase();
  return (
    path.startsWith(librarySourceDirectory.toLowerCase() + sep) ||
    path === librarySourceDirectory.toLowerCase()
  );
};

function declaredByEnvUI(checker: ts.TypeChecker, symbol: ts.Symbol | undefined): boolean {
  if (!symbol) return false;
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  return (target.declarations ?? []).some((declaration) =>
    inLibrary(declaration.getSourceFile().fileName),
  );
}

function typeOfEnvUI(checker: ts.TypeChecker, type: ts.Type | undefined, depth = 0): boolean {
  if (!type || depth > 3) return false;
  if (declaredByEnvUI(checker, type.aliasSymbol) || declaredByEnvUI(checker, type.getSymbol()))
    return true;
  if (type.isUnionOrIntersection())
    return type.types.some((member) => typeOfEnvUI(checker, member, depth + 1));
  return false;
}

function nodeAt(file: ts.SourceFile, start: number, length: number): ts.Node {
  let found: ts.Node = file;
  const visit = (node: ts.Node) => {
    if (node.getStart(file) <= start && start + length <= node.getEnd()) {
      found = node;
      ts.forEachChild(node, visit);
    }
  };
  ts.forEachChild(file, visit);
  return found;
}

export function aboutEnvUI(checker: ts.TypeChecker, diagnostic: ts.Diagnostic): boolean {
  const file = diagnostic.file;
  if (!file || diagnostic.start === undefined) return false;
  const propertyCodes = new Set([2339, 2551]);
  for (
    let node: ts.Node | undefined = nodeAt(file, diagnostic.start, diagnostic.length ?? 0);
    node && !ts.isSourceFile(node);
    node = node.parent
  ) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const specifier = node.moduleSpecifier;
      return (
        !!specifier && ts.isStringLiteral(specifier) && /^@envsemble\/envui\b/.test(specifier.text)
      );
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      return declaredByEnvUI(checker, checker.getSymbolAtLocation(node.tagName));
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const callee = ts.isPropertyAccessExpression(node.expression)
        ? node.expression.name
        : node.expression;
      return declaredByEnvUI(checker, checker.getSymbolAtLocation(callee));
    }
    if (
      (ts.isPropertyAccessExpression(node) || ts.isQualifiedName(node)) &&
      propertyCodes.has(diagnostic.code)
    ) {
      const object = ts.isPropertyAccessExpression(node) ? node.expression : node.left;
      return (
        declaredByEnvUI(checker, checker.getSymbolAtLocation(object)) ||
        typeOfEnvUI(checker, checker.getTypeAtLocation(object))
      );
    }
    if (ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node)) {
      const contextual = checker.getContextualType(node);
      if (contextual && typeOfEnvUI(checker, contextual)) return true;
    }
    if ((ts.isVariableDeclaration(node) || ts.isParameter(node)) && node.type) {
      let typed = false;
      const visit = (child: ts.Node) => {
        if (
          ts.isTypeReferenceNode(child) &&
          declaredByEnvUI(checker, checker.getSymbolAtLocation(child.typeName))
        )
          typed = true;
        ts.forEachChild(child, visit);
      };
      visit(node.type);
      return typed;
    }
  }
  return false;
}

function reachesEnvUI(checker: ts.TypeChecker, file: ts.SourceFile): boolean {
  let found = false;
  const visit = (node: ts.Node) => {
    if (found) return;
    if (ts.isIdentifier(node) && declaredByEnvUI(checker, checker.getSymbolAtLocation(node)))
      found = true;
    else ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

function declaredNames(file: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  const bind = (name: ts.BindingName | ts.Identifier | undefined) => {
    if (!name) return;
    if (ts.isIdentifier(name)) names.add(name.text);
    else
      for (const element of name.elements) if (!ts.isOmittedExpression(element)) bind(element.name);
  };
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isBindingElement(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node) ||
      ts.isImportSpecifier(node) ||
      ts.isNamespaceImport(node) ||
      ts.isImportClause(node) ||
      ts.isTypeParameterDeclaration(node) ||
      ts.isModuleDeclaration(node)
    )
      bind((node as { name?: ts.BindingName }).name);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return names;
}

function usedNames(file: ts.SourceFile): Map<string, ts.Identifier> {
  const used = new Map<string, ts.Identifier>();
  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node)) {
      const parent = node.parent;
      const named =
        (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        (ts.isQualifiedName(parent) && parent.right === node) ||
        (ts.isPropertyAssignment(parent) && parent.name === node) ||
        (ts.isPropertySignature(parent) && parent.name === node) ||
        (ts.isMethodDeclaration(parent) && parent.name === node) ||
        (ts.isPropertyDeclaration(parent) && parent.name === node) ||
        (ts.isJsxAttribute(parent) && parent.name === node) ||
        ts.isJsxNamespacedName(parent) ||
        (ts.isBindingElement(parent) && parent.propertyName === node) ||
        ts.isImportSpecifier(parent) ||
        ts.isExportSpecifier(parent) ||
        ts.isLabeledStatement(parent) ||
        ts.isBreakOrContinueStatement(parent);
      if (!named && !used.has(node.text)) used.set(node.text, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return used;
}

export interface Finding {
  file: string;
  line: number;
  code: number | 'parse' | 'tag';
  message: string;
}

function virtualHost(virtual: Map<string, string>) {
  const host = ts.createCompilerHost(compilerOptions, true);
  const cache = new Map<string, ts.SourceFile>();
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    const key = resolve(fileName);
    const text = virtual.get(key);
    if (text !== undefined) return ts.createSourceFile(fileName, text, languageVersion, true);
    let file = cache.get(key);
    if (!file) {
      file = getSourceFile(fileName, languageVersion, onError, shouldCreate);
      if (file) cache.set(key, file);
    }
    return file;
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (fileName) => virtual.has(resolve(fileName)) || fileExists(fileName);
  const readFile = host.readFile.bind(host);
  host.readFile = (fileName) => virtual.get(resolve(fileName)) ?? readFile(fileName);
  return host;
}

interface ImportableNames {
  exporter: Map<string, { entry: string; type: boolean }>;
  fromReact: Map<string, boolean>;
  domGlobals: Set<string>;
}

function importableNames(
  entryProgram: ts.Program,
  probe: string,
  host: ts.CompilerHost,
): ImportableNames {
  const checker = entryProgram.getTypeChecker();
  const exporter = new Map<string, { entry: string; type: boolean }>();
  for (const entry of entries) {
    const resolved = ts.resolveModuleName(entry, probe, compilerOptions, host).resolvedModule;
    const source = resolved && entryProgram.getSourceFile(resolved.resolvedFileName);
    const module = source && checker.getSymbolAtLocation(source);
    if (!module) throw new Error(`can't resolve ${entry} from the library's source`);
    for (const symbol of checker.getExportsOfModule(module)) {
      if (exporter.has(symbol.name)) continue;
      const target =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      exporter.set(symbol.name, { entry, type: !(target.flags & ts.SymbolFlags.Value) });
    }
  }
  const reactResolved = ts.resolveModuleName('react', probe, compilerOptions, host).resolvedModule;
  const reactFile = reactResolved && entryProgram.getSourceFile(reactResolved.resolvedFileName);
  const reactModule = reactFile && checker.getSymbolAtLocation(reactFile);
  const fromReact = new Map<string, boolean>();
  for (const symbol of reactModule ? checker.getExportsOfModule(reactModule) : [])
    if (/^use[A-Z]/.test(symbol.name) || reactNames.has(symbol.name))
      fromReact.set(symbol.name, !(symbol.flags & ts.SymbolFlags.Value));
  const probeFile = entryProgram.getSourceFile(probe);
  if (!probeFile) throw new Error(`the program of the entries lacks ${probe}`);
  const domGlobals = new Set(
    checker
      .getSymbolsInScope(probeFile, ts.SymbolFlags.Value)
      .filter(
        (symbol) =>
          /^[a-z]/.test(symbol.name) &&
          !browserAPIs.has(symbol.name) &&
          (symbol.declarations ?? []).some((declaration) =>
            declaration.getSourceFile().fileName.endsWith('lib.dom.d.ts'),
          ),
      )
      .map((symbol) => symbol.name),
  );
  return { exporter, fromReact, domGlobals };
}

function snippetModule(
  snippet: Snippet,
  fileName: string,
  { exporter, fromReact, domGlobals }: ImportableNames,
  root: string,
) {
  const iconModule = (name: string) => {
    const module = /^Icon(\w+)$/.exec(name)?.[1];
    return module && existsSync(join(root, 'packages/ui/src/icons', `${module}.tsx`))
      ? `@envsemble/envui/icons/${module}`
      : undefined;
  };
  const code = snippet.lang === 'tsx' ? wrapSnippet(snippet.code) : snippet.code;
  const parsed = ts.createSourceFile(fileName, code, ts.ScriptTarget.ES2022, true);
  const declared = declaredNames(parsed);
  const imports = new Map<string, Set<string>>();
  const assumed: string[] = [];
  const add = (module: string, name: string, type = false) =>
    imports.set(module, (imports.get(module) ?? new Set()).add(type ? `type ${name}` : name));
  let envUI = /['"]@envsemble\/envui[/'"]/.test(code);
  for (const [name, node] of usedNames(parsed)) {
    if (declared.has(name)) continue;
    const found = exporter.get(name);
    const hook = hookValues.get(name);
    const hookExporter = hook && exporter.get(hook);
    const icon = iconModule(name);
    if (found) add(found.entry, name, found.type);
    else if (icon) add(icon, name);
    else if (hook && hookExporter) {
      add(hookExporter.entry, hook);
      assumed.push(`${name}: ReturnType<typeof ${hook}>`);
    } else {
      if (fromReact.has(name)) add('react', name, fromReact.get(name));
      else if (domGlobals.has(name)) assumed.push(`${name}: any`);
      else if (isComponentTag(node)) envUI = true;
      continue;
    }
    envUI = true;
  }
  const prelude = [
    ...[...imports].map(
      ([module, names]) => `import { ${[...names].join(', ')} } from '${module}';`,
    ),
    ...assumed.map((declaration) => `declare const ${declaration};`),
  ].join(' ');
  return { text: `${prelude}\n${code}\n`, envUI };
}

function snippetFindings(
  snippet: Snippet,
  file: ts.SourceFile,
  program: ts.Program,
  checker: ts.TypeChecker,
) {
  const findings: Finding[] = [];
  const report = (code: Finding['code'], position: number, message: string) =>
    findings.push({
      file: snippet.file,
      line: snippet.line + file.getLineAndCharacterOfPosition(position).line - 1,
      code,
      message,
    });
  const [syntax] = program.getSyntacticDiagnostics(file);
  if (syntax) {
    report(
      'parse',
      syntax.start ?? 0,
      `${ts.flattenDiagnosticMessageText(syntax.messageText, ' ')}; the snippet is not checked until it parses`,
    );
    return findings;
  }
  for (const diagnostic of program.getSemanticDiagnostics(file)) {
    const start = diagnostic.start ?? 0;
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
    if (cannotFindNameCodes.has(diagnostic.code)) {
      const node = nodeAt(file, start, diagnostic.length ?? 0);
      const name = node.getText(file);
      if (isComponentTag(node) && !applicationComponents.has(name))
        report(
          'tag',
          start,
          `<${name}> is neither declared nor exported by envUI; a component of the application's own is listed in applicationComponents`,
        );
      continue;
    }
    if (reportedCodes.has(diagnostic.code) && aboutEnvUI(checker, diagnostic))
      report(diagnostic.code, start, message);
  }
  return findings;
}

export function checkSnippets(
  snippets: readonly Snippet[],
  root = repositoryRoot,
): { findings: Finding[]; checked: Snippet[] } {
  const virtual = new Map<string, string>();
  const host = virtualHost(virtual);
  const probe = join(root, '.snippets-probe.ts');
  virtual.set(
    probe,
    entries.map((entry, index) => `import * as e${index} from '${entry}';`).join('\n'),
  );
  const entryProgram = ts.createProgram([probe], compilerOptions, host);
  const names = importableNames(entryProgram, probe, host);
  const modules = snippets.map((snippet, index) => {
    const fileName = join(root, '.snippets', `${index}.${snippet.lang}`);
    const { text, envUI } = snippetModule(snippet, fileName, names, root);
    virtual.set(fileName, text);
    return { snippet, fileName, envUI };
  });

  const program = ts.createProgram(
    [probe, ...modules.map((module) => module.fileName)],
    compilerOptions,
    host,
    entryProgram,
  );
  const checker = program.getTypeChecker();
  const findings: Finding[] = [];
  const checked: Snippet[] = [];
  for (const { snippet, fileName, envUI } of modules) {
    const file = program.getSourceFile(fileName);
    if (!file) throw new Error(`the program of the snippets lacks ${fileName}`);
    if (!envUI && !reachesEnvUI(checker, file)) continue;
    checked.push(snippet);
    findings.push(...snippetFindings(snippet, file, program, checker));
  }
  return { findings, checked };
}

export function snippetPages(root = repositoryRoot): string[] {
  const pages: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        if (path !== 'docs/generated') walk(path);
      } else if (entry.name.endsWith('.md')) pages.push(path);
    }
  };
  walk('docs');
  pages.push('contributing/pages.md');
  return pages.sort();
}

if (import.meta.main) {
  const started = performance.now();
  const pages = snippetPages();
  const snippets = pages.flatMap((page) =>
    extractSnippets(readFileSync(join(repositoryRoot, page), 'utf8'), page),
  );
  const { findings, checked } = checkSnippets(snippets);
  for (const finding of findings)
    console.log(
      `${finding.file}:${finding.line}: ${typeof finding.code === 'number' ? `TS${finding.code}` : finding.code}: ${finding.message}`,
    );
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  const counted = `${checked.length} fences with envUI code in ${new Set(checked.map((snippet) => snippet.file)).size} pages`;
  if (findings.length) {
    console.log(
      `\n${findings.length} problems in ${counted} (${seconds} s). Fix the snippet to the current API; a fence that is pseudo-code on purpose takes \`nocheck\` after its language.`,
    );
    process.exit(1);
  }
  console.log(`The snippets agree with envUI's API: ${counted} (${seconds} s).`);
}
