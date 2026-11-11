// Which browser specs a source file concerns, by what their fixtures import. A spec opens fixtures,
// `?fixture=<name>` of tests/fixture/App.tsx, which is `<Name>.fixture.tsx`, or a page such as
// ForcedColors.html, or renders library source it writes out (`import { Table } from '@envsemble/envui'`); each fixture imports library
// components by name, and those import the modules and style sheets they draw with, all read with
// the TypeScript parser, so how an import is written doesn't change what it finds. TestScope.ts
// selects specs with it; tests/tooling/TestScope.test.mjs covers it.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import ts from 'typescript';
import { fixtureName } from '../../tests/fixture/FixtureName.ts';

const library = 'packages/ui/src';
const fixtures = 'tests/fixture';
/** The browser specs' folder: the library's in library/, the site's in site/, helpers in support/. */
const specs = 'tests/browser';
/**
 * The folders of specs, with the ending of their files: Playwright's browser specs, and the
 * library's component tests, which Vitest mounts in the browser (tests/component).
 */
const specFolders = [
  [`${specs}/library`, '.spec.ts'],
  [`${specs}/site`, '.spec.ts'],
  ['tests/component', '.test.tsx'],
] as const;

/** An import of a module: its specifier and the names it imports, or all of them. */
export interface Import {
  specifier: string;
  names: string[] | 'all';
}

/** A module's syntax tree, parsed as TSX so fixtures, specs and library modules all read. */
const parse = (source: string) =>
  ts.createSourceFile('module.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);

/**
 * The imports of a module's source, and of the modules it writes out in template literals to
 * render, as a spec does: static imports, re-exports and `import()`, with what is imported only
 * as a type left out.
 */
export function importsOf(source: string): Import[] {
  const found: Import[] = [];
  const add = (specifier: ts.Expression | undefined, names: Import['names']) => {
    if (specifier && ts.isStringLiteralLike(specifier) && names.length)
      found.push({ specifier: specifier.text, names });
  };
  /** The names a list imports or re-exports, by their name in the module that declares them. */
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
    // A module a spec writes out to render, its expressions standing in as values.
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

/** Reads the repository's sources once, by path from the root. */
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

  /** The file a relative specifier names from a module, as `./Button.js` names `Button.tsx`. */
  relative(from: string, specifier: string) {
    const target = posix.join(posix.dirname(from), specifier.replace(/\?.*$/, ''));
    const base = target.replace(/\.js$/, '');
    return [target, `${base}.tsx`, `${base}.ts`, `${base}/index.ts`, `${base}/index.tsx`].find(
      (candidate) => /\.\w+$/.test(candidate) && this.text(candidate) !== undefined,
    );
  }

  /** The library module an import of the package names: an entry point, or an icon. */
  entry(specifier: string) {
    const subpath = specifier.slice('@envsemble/envui'.length).replace(/^\//, '');
    if (!subpath) return `${library}/index.ts`;
    if (subpath.startsWith('icons/')) return `${library}/${subpath}.tsx`;
    if (subpath === 'styles.css') return `${library}/styles/index.css`;
    const path = `${library}/${subpath}.ts`;
    return this.text(path) === undefined ? undefined : path;
  }

  /**
   * The names a library module exports, each with the modules that declare it: its own
   * declarations, and those it re-exports, followed to where they are declared.
   */
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
          // `export { a, b as c }` of the module's own names.
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

  /** The files an import names: the module, or for the package's entry the modules declaring the names. */
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

  /** The files a module imports. */
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

/** The fixture module each `?fixture=<name>` of App.tsx mounts: `<Name>.fixture.tsx`. */
function fixtureFiles(root: string) {
  return new Map(
    readdirSync(resolve(root, fixtures))
      .filter((file) => file.endsWith('.fixture.tsx'))
      .map((file) => [fixtureName(file), `${fixtures}/${file}`]),
  );
}

/** The modules a spec opens or renders, by what its source and the helpers it imports name. */
function specRoots(sources: Sources, path: string, fixtureModules: Map<string, string>) {
  const helpers = importsOf(sources.text(path) ?? '')
    .map(({ specifier }) => specifier)
    .filter((specifier) => specifier.startsWith('../support/'))
    .map((specifier) => `${specs}/${specifier.slice(3)}.ts`);
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
    // Imports of the fixture's modules and of the library, also those of source it writes out to
    // render, as a module in a template string.
    for (const item of importsOf(text))
      if (!item.specifier.startsWith('../support/'))
        for (const module of sources.resolve(file, item)) roots.add(module);
  }
  return roots;
}

/**
 * Every spec's path from the root, by its name: tests/browser/library/<Name>.spec.ts or site/, or
 * the component test tests/component/<Name>.test.tsx.
 */
export function specPaths(root: string) {
  const paths = new Map<string, string>();
  for (const [folder, ending] of specFolders) {
    const directory = resolve(root, folder);
    if (!existsSync(directory)) continue;
    for (const file of readdirSync(directory))
      if (file.endsWith(ending)) paths.set(file.slice(0, -ending.length), `${folder}/${file}`);
  }
  return paths;
}

/** Whether a spec's file is a component test, which Vitest runs, rather than a Playwright spec. */
export const isComponentTest = (path: string) => path.endsWith('.test.tsx');

/** The library's modules, by path from the root, the generated icons left out. */
function libraryModules(root: string, directory = library): string[] {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return path === `${library}/icons` ? [] : libraryModules(root, path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [path] : [];
  });
}

/**
 * The browser specs a changed file concerns, by what their fixtures use. A fixture module concerns
 * the specs that open it. A library file concerns the specs whose fixtures use it by name, or
 * where none does, those that use the nearest modules that import it: Button's for its style
 * sheet, and for a private helper, the components built on it.
 */
export function fixtureUse(root: string) {
  const sources = new Sources(root);
  const fixtureModules = fixtureFiles(root);
  const users = new Map<string, Set<string>>();
  for (const [name, path] of specPaths(root)) {
    const pending = [...specRoots(sources, path, fixtureModules)];
    const seen = new Set<string>();
    for (let path = pending.pop(); path !== undefined; path = pending.pop()) {
      if (seen.has(path)) continue;
      seen.add(path);
      users.set(path, (users.get(path) ?? new Set()).add(name));
      // A fixture module leads on to what it imports; a library module is used where it is named.
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
  /** The specs a file concerns, the most specific first: those whose fixtures use the fewest modules. */
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
