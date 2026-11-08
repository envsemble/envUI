// Which browser specs reach a source file through their fixtures' imports. A spec opens fixtures,
// `?fixture=<name>` of tests/fixture/App.tsx or a page such as RichText.html, or renders library
// source it writes out (`import { Table } from '@envsemble/envui'`); each fixture imports library
// components by name, and those import the modules and style sheets they draw with. A changed
// file reaches the specs whose fixtures import it, however indirectly. TestScope.ts selects specs
// with it; tests/TestScope.test.mjs covers it.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';

const library = 'packages/ui/src';
const fixtures = 'tests/fixture';
const specs = 'tests/browser';

/** An import of a module: its specifier and the names it imports, or all of them. */
interface Import {
  specifier: string;
  names: string[] | 'all';
}

/** The imports of a module's source, `import type` and `export type` left out. */
function importsOf(source: string): Import[] {
  const found: Import[] = [];
  const statement =
    /\b(?:import|export)\s+(?!type\b)([^'";]*?)\s*\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(?\s*['"]([^'"]+)['"]/g;
  for (const [, clause, specifier, bare] of source.matchAll(statement)) {
    if (bare) {
      found.push({ specifier: bare, names: 'all' });
      continue;
    }
    const named = /\{([^}]*)\}/.exec(clause!)?.[1];
    const names =
      named === undefined || /\*/.test(clause!)
        ? 'all'
        : named
            .split(',')
            .map((name) =>
              name
                .trim()
                .replace(/^type\s+/, '')
                .split(/\s+as\s+/)[0]!
                .trim(),
            )
            .filter(Boolean);
    found.push({ specifier: specifier!, names });
  }
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
    const source = this.text(path) ?? '';
    const own =
      /\bexport\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|interface|type|enum)\s+(\w+)/g;
    for (const [, name] of source.matchAll(own)) exported.set(name!, [path]);
    for (const [, local] of source.matchAll(/\bexport\s*\{([^}]*)\}\s*;/g))
      for (const name of local!.split(','))
        if (name.trim())
          exported.set(
            name
              .trim()
              .split(/\s+as\s+/)
              .at(-1)!,
            [path],
          );
    for (const [, clause, specifier] of source.matchAll(
      /\bexport\s+(?:type\s+)?(\*(?:\s+as\s+\w+)?|\{[^}]*\})\s*from\s*['"]([^'"]+)['"]/g,
    )) {
      const target = this.relative(path, specifier!);
      if (!target) continue;
      const namespace = /^\*\s+as\s+(\w+)/.exec(clause!)?.[1];
      if (namespace) exported.set(namespace, [target]);
      else if (clause === '*') {
        for (const [name, declared] of this.exportsOf(target))
          if (!exported.has(name)) exported.set(name, declared);
      } else
        for (const name of clause!.slice(1, -1).split(',')) {
          const [original, alias] = name
            .trim()
            .replace(/^type\s+/, '')
            .split(/\s+as\s+/);
          if (original)
            exported.set(alias ?? original, this.exportsOf(target).get(original) ?? [target]);
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

  /** Every file a module reaches through its imports, itself included. */
  closure(starts: readonly string[]) {
    const found = new Set<string>();
    const pending = [...starts];
    while (pending.length) {
      const path = pending.pop()!;
      if (found.has(path)) continue;
      found.add(path);
      // A file's style sheet imports nothing a spec sees on its own.
      if (/\.(?:tsx?|m?js)$/.test(path)) pending.push(...this.importsOf(path));
    }
    return found;
  }
}

/**
 * The fixture modules each name of App.tsx renders, `?fixture=<name>`: the components the code
 * that name selects uses, by the modules App.tsx imports them from.
 */
function appFixtures(sources: Sources) {
  const appFile = `${fixtures}/App.tsx`;
  const text = sources.text(appFile) ?? '';
  const imported = new Map<string, string[]>();
  for (const item of importsOf(text))
    if (item.names !== 'all')
      for (const name of item.names)
        imported.set(name, sources.resolve(appFile, { ...item, names: [name] }));
  const byName = new Map<string, Set<string>>();
  const add = (name: string, code: string) => {
    const modules = byName.get(name) ?? new Set<string>();
    for (const [identifier] of code.matchAll(/\b[A-Z]\w*/g))
      for (const module of imported.get(identifier) ?? []) modules.add(module);
    byName.set(name, modules);
  };
  // The fixtures mounted on their own, `name: Component` in standaloneFixtures.
  const standalone = /\bconst standaloneFixtures\b[^{]*\{([\s\S]*?)\n\};/.exec(text)?.[1] ?? '';
  for (const [, quoted, plain, component] of standalone.matchAll(
    /(?:'([a-z][a-z-]*)'|\b([a-z]\w*)):\s*(\w+)/g,
  ))
    add((quoted ?? plain)!, component!);
  // The rest, `fixture === 'name'` or `includes('name')` in App: each name's code runs from where
  // it is named to where the next one is.
  const app = text.slice(Math.max(0, text.indexOf('export default function App')));
  const marks = [...app.matchAll(/(?:includes\(|fixture === )'([a-z][a-z-]*)'/g)];
  marks.forEach((mark, index) =>
    add(mark[1]!, app.slice(mark.index, marks[index + 1]?.index ?? app.length)),
  );
  return byName;
}

/** The modules a spec opens or renders, by what its source and the helpers it imports name. */
function specRoots(sources: Sources, name: string, fixtureModules: Map<string, Set<string>>) {
  const path = `${specs}/${name}.spec.ts`;
  const helpers = importsOf(sources.text(path) ?? '')
    .map(({ specifier }) => specifier)
    .filter((specifier) => specifier.startsWith('./helpers/'))
    .map((specifier) => `${specs}/${specifier.slice(2)}.ts`);
  const roots = new Set<string>();
  for (const file of [path, ...helpers]) {
    const text = sources.text(file) ?? '';
    for (const [, fixture] of text.matchAll(/[?&]fixture=([a-z][a-z-]*)/g))
      for (const module of fixtureModules.get(fixture!) ?? []) roots.add(module);
    for (const [page] of text.matchAll(/\b[A-Z]\w*\.html\b/g)) {
      const html = sources.text(`${fixtures}/${page}`) ?? '';
      for (const [, script] of html.matchAll(/<script[^>]*\bsrc="\/?([^"]+)"/g))
        if (!/^main\.tsx$/.test(script!)) roots.add(`${fixtures}/${script}`);
    }
    // Imports of the fixture's modules and of the library, also those of source it writes out to
    // render, as a module in a template string.
    for (const item of importsOf(text))
      if (!item.specifier.startsWith('./helpers/'))
        for (const module of sources.resolve(file, item)) roots.add(module);
  }
  return roots;
}

/** Every spec's name, from tests/browser/<Name>.spec.ts. */
function specNames(root: string) {
  const directory = resolve(root, specs);
  return existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.endsWith('.spec.ts'))
        .map((file) => file.slice(0, -'.spec.ts'.length))
    : [];
}

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
  const fixtureModules = appFixtures(sources);
  const users = new Map<string, Set<string>>();
  for (const name of specNames(root)) {
    const pending = [...specRoots(sources, name, fixtureModules)];
    const seen = new Set<string>();
    while (pending.length) {
      const path = pending.pop()!;
      if (seen.has(path)) continue;
      seen.add(path);
      if (!users.has(path)) users.set(path, new Set());
      users.get(path)!.add(name);
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
    while (pending.length) {
      const module = pending.pop()!;
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
