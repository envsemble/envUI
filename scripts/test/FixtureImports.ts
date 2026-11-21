import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import ts from 'typescript';
import { fixtureName } from '../../tests/fixture/FixtureName.ts';
import { browserTestPaths, browserTestsDirectory } from './BrowserTests.ts';

const library = 'packages/ui/src';
const fixtures = 'tests/fixture';

export interface Import {
  specifier: string;
  names: string[] | 'all';
}

const parse = (source: string) =>
  ts.createSourceFile('module.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);

export function importsOf(source: string): Import[] {
  const found: Import[] = [];
  const add = (specifier: ts.Expression | undefined, names: Import['names']) => {
    if (specifier && ts.isStringLiteralLike(specifier) && names.length)
      found.push({ specifier: specifier.text, names });
  };
  const valueNames = (elements: ts.NodeArray<ts.ImportSpecifier | ts.ExportSpecifier>) =>
    elements
      .filter((element) => !element.isTypeOnly)
      .map((element) => (element.propertyName ?? element.name).text);
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      if (clause?.isTypeOnly) return;
      add(
        node.moduleSpecifier,
        !clause || clause.name || !bindings || ts.isNamespaceImport(bindings)
          ? 'all'
          : valueNames(bindings.elements),
      );
      return;
    }
    if (ts.isExportDeclaration(node)) {
      const clause = node.exportClause;
      if (!node.isTypeOnly)
        add(
          node.moduleSpecifier,
          !clause || ts.isNamespaceExport(clause) ? 'all' : valueNames(clause.elements),
        );
      return;
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      add(node.arguments[0], 'all');
    const written = ts.isNoSubstitutionTemplateLiteral(node)
      ? node.text
      : ts.isTemplateExpression(node)
        ? [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('0')
        : undefined;
    if (written !== undefined && /\bimport\b/.test(written)) found.push(...importsOf(written));
    ts.forEachChild(node, visit);
  };
  visit(parse(source));
  return found;
}

class Sources {
  readonly root: string;
  readonly #texts = new Map<string, string | undefined>();
  readonly #exports = new Map<string, Map<string, string[]>>();
  readonly #imports = new Map<string, string[]>();

  constructor(root: string) {
    this.root = root;
  }

  text(path: string) {
    if (!this.#texts.has(path)) {
      const file = resolve(this.root, path);
      this.#texts.set(path, existsSync(file) ? readFileSync(file, 'utf8') : undefined);
    }
    return this.#texts.get(path);
  }

  relative(from: string, specifier: string) {
    const target = posix.join(posix.dirname(from), specifier.replace(/\?.*$/, ''));
    const base = target.replace(/\.js$/, '');
    return [target, `${base}.tsx`, `${base}.ts`, `${base}/index.ts`, `${base}/index.tsx`].find(
      (candidate) => /\.\w+$/.test(candidate) && this.text(candidate) !== undefined,
    );
  }

  entry(specifier: string) {
    const subpath = specifier.slice('@envsemble/envui'.length).replace(/^\//, '');
    if (!subpath) return `${library}/index.ts`;
    if (subpath.startsWith('icons/')) return `${library}/${subpath}.tsx`;
    if (subpath === 'styles.css') return `${library}/styles/index.css`;
    const path = `${library}/${subpath}.ts`;
    return this.text(path) === undefined ? undefined : path;
  }

  exportsOf(path: string): Map<string, string[]> {
    const cached = this.#exports.get(path);
    if (cached) return cached;
    const exported = new Map<string, string[]>();
    this.#exports.set(path, exported);
    const exports = (node: ts.Node) =>
      ts.canHaveModifiers(node) &&
      Boolean(ts.getModifiers(node)?.some((each) => each.kind === ts.SyntaxKind.ExportKeyword));
    for (const statement of parse(this.text(path) ?? '').statements) {
      if (ts.isVariableStatement(statement) && exports(statement)) {
        for (const declaration of statement.declarationList.declarations)
          if (ts.isIdentifier(declaration.name)) exported.set(declaration.name.text, [path]);
      } else if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement) ||
          ts.isEnumDeclaration(statement)) &&
        statement.name &&
        exports(statement)
      )
        exported.set(statement.name.text, [path]);
      else if (ts.isExportDeclaration(statement)) {
        const clause = statement.exportClause;
        if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
          if (clause && ts.isNamedExports(clause))
            for (const element of clause.elements) exported.set(element.name.text, [path]);
          continue;
        }
        const target = this.relative(path, statement.moduleSpecifier.text);
        if (!target) continue;
        if (!clause) {
          for (const [name, declared] of this.exportsOf(target))
            if (!exported.has(name)) exported.set(name, declared);
        } else if (ts.isNamespaceExport(clause)) exported.set(clause.name.text, [target]);
        else
          for (const element of clause.elements) {
            const original = (element.propertyName ?? element.name).text;
            exported.set(element.name.text, this.exportsOf(target).get(original) ?? [target]);
          }
      }
    }
    return exported;
  }

  resolve(from: string, { specifier, names }: Import): string[] {
    if (specifier.startsWith('.')) {
      const target = this.relative(from, specifier);
      return target ? [target] : [];
    }
    if (!/^@envsemble\/envui(?:\/|$)/.test(specifier)) return [];
    const entry = this.entry(specifier);
    if (!entry) return [];
    if (names === 'all' || !/\.ts$/.test(entry) || entry.startsWith(`${library}/icons/`))
      return [entry];
    const exported = this.exportsOf(entry);
    return names.flatMap((name) => exported.get(name) ?? []);
  }

  importsOf(path: string) {
    const cached = this.#imports.get(path);
    if (cached) return cached;
    const targets = [
      ...new Set(importsOf(this.text(path) ?? '').flatMap((item) => this.resolve(path, item))),
    ];
    this.#imports.set(path, targets);
    return targets;
  }
}

function fixtureFiles(root: string) {
  return new Map(
    readdirSync(resolve(root, fixtures))
      .filter((file) => file.endsWith('.fixture.tsx'))
      .map((file) => [fixtureName(file), `${fixtures}/${file}`]),
  );
}

function specRoots(sources: Sources, path: string, fixtureModules: Map<string, string>) {
  const helpers = importsOf(sources.text(path) ?? '')
    .map(({ specifier }) => specifier)
    .filter((specifier) => specifier.startsWith('../support/'))
    .map((specifier) => `${browserTestsDirectory}/${specifier.slice(3)}.ts`);
  const roots = new Set<string>();
  for (const file of [path, ...helpers]) {
    const text = sources.text(file) ?? '';
    for (const [, fixture] of text.matchAll(/[?&]fixture=([a-z][a-z-]*)/g)) {
      const module = fixtureModules.get(fixture);
      if (module) roots.add(module);
    }
    for (const [page] of text.matchAll(/\b[A-Z]\w*\.html\b/g)) {
      const html = sources.text(`${fixtures}/${page}`) ?? '';
      for (const [, script] of html.matchAll(/<script[^>]*\bsrc="\/?([^"]+)"/g))
        if (!/^main\.tsx$/.test(script)) roots.add(`${fixtures}/${script}`);
    }
    for (const item of importsOf(text))
      if (!item.specifier.startsWith('../support/'))
        for (const module of sources.resolve(file, item)) roots.add(module);
  }
  return roots;
}

function libraryModules(root: string, directory = library): string[] {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return path === `${library}/icons` ? [] : libraryModules(root, path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [path] : [];
  });
}

export function fixtureUse(root: string) {
  const sources = new Sources(root);
  const fixtureModules = fixtureFiles(root);
  const users = new Map<string, Set<string>>();
  for (const [name, path] of browserTestPaths(root)) {
    const pending = [...specRoots(sources, path, fixtureModules)];
    const seen = new Set<string>();
    for (let path = pending.pop(); path !== undefined; path = pending.pop()) {
      if (seen.has(path)) continue;
      seen.add(path);
      users.set(path, (users.get(path) ?? new Set()).add(name));
      if (path.startsWith(`${fixtures}/`) && /\.tsx?$/.test(path))
        pending.push(...sources.importsOf(path));
    }
  }
  const importers = new Map<string, string[]>();
  for (const path of libraryModules(root))
    for (const target of sources.importsOf(path))
      importers.set(target, [...(importers.get(target) ?? []), path]);
  const breadths = new Map<string, number>();
  for (const [path, names] of users)
    if (path.startsWith(`${library}/`))
      for (const name of names) breadths.set(name, (breadths.get(name) ?? 0) + 1);
  const specsOf = (path: string): string[] =>
    [...concerned(path)].sort(
      (a, b) => (breadths.get(a) ?? 0) - (breadths.get(b) ?? 0) || a.localeCompare(b),
    );
  const concerned = (path: string): Set<string> => {
    if (!path.startsWith(`${library}/`)) return users.get(path) ?? new Set();
    const found = new Set<string>();
    const pending = [path];
    const seen = new Set<string>();
    for (let module = pending.pop(); module !== undefined; module = pending.pop()) {
      if (seen.has(module)) continue;
      seen.add(module);
      const direct = users.get(module);
      if (direct?.size) for (const name of direct) found.add(name);
      else pending.push(...(importers.get(module) ?? []));
    }
    return found;
  };
  return specsOf;
}
