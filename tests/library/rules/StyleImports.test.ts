import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, posix, relative, sep } from 'node:path';
import { test } from 'node:test';
import { libraryEntryPoints } from '../../../scripts/docs/LibraryEntryPoints.ts';
import { analyze, cssSelectors } from './composition/Analysis.ts';
import { librarySourceDirectory } from '../../../scripts/RepositoryPaths.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const sourceRoot = librarySourceDirectory;
const stylesRoot = join(sourceRoot, 'styles');
const styleSheet = (name) => readFileSync(join(stylesRoot, name), 'utf8');

function walk(directory, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (path !== stylesRoot && entry.name !== 'assets') walk(path, found);
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) found.push(path);
  }
  return found;
}
const modules = walk(sourceRoot)
  .map((path) => relative(sourceRoot, path).split(sep).join('/'))
  .filter((module) => !module.startsWith('icons/') || module === 'icons/index.ts');
const known = new Set(modules);
const resolveImport = (from, specifier) => {
  const target = posix.normalize(posix.join(posix.dirname(from), specifier)).replace(/\.js$/, '');
  return [`${target}.tsx`, `${target}.ts`, `${target}/index.ts`, `${target}/index.tsx`].find(
    (candidate) => known.has(candidate),
  );
};

const requests = new Map();
const lazyRequests = new Map();
for (const module of modules) {
  const text = readFileSync(join(sourceRoot, module), 'utf8');
  const file = ts.createSourceFile(module, text, ts.ScriptTarget.Latest, true);
  const lazy = [];
  const findLazy = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      const target = resolveImport(module, node.arguments[0].text);
      if (target) lazy.push(target);
    }
    ts.forEachChild(node, findLazy);
  };
  findLazy(file);
  lazyRequests.set(module, lazy);
  const list: ({ sheet: string } | { module: string })[] = [];
  for (const statement of file.statements) {
    let specifier;
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.isTypeOnly) continue;
      specifier = statement.moduleSpecifier.text;
    } else if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      !statement.isTypeOnly
    )
      specifier = statement.moduleSpecifier.text;
    else continue;
    const sheet = /^(?:\.\.?\/)+styles\/(\w+\.css)$/.exec(specifier)?.[1];
    if (sheet) list.push({ sheet });
    else if (specifier.startsWith('.')) {
      const target = resolveImport(module, specifier);
      if (target) list.push({ module: target });
    }
  }
  requests.set(module, list);
}

function emits(list, seen = new Set(), out = []) {
  for (const request of list) {
    if (request.sheet) {
      if (!out.includes(request.sheet)) out.push(request.sheet);
    } else if (!seen.has(request.module)) {
      seen.add(request.module);
      emits(requests.get(request.module), seen, out);
    }
  }
  return out;
}

function guaranteedBefore() {
  const barrels = new Set([
    ...libraryEntryPoints().map(({ file }) => relative(sourceRoot, file).split(sep).join('/')),
    'icons/index.ts',
  ]);
  const importers = new Map(modules.map((module) => [module, []]));
  for (const module of modules) {
    requests.get(module).forEach((request, index) => {
      if (request.module) importers.get(request.module).push([module, index]);
    });
    for (const target of lazyRequests.get(module))
      importers.get(target).push([module, requests.get(module).length]);
  }
  const first = (module) =>
    barrels.has(module) ||
    importers.get(module).length === 0 ||
    importers.get(module).some(([importer]) => barrels.has(importer));
  const prior = (module, index) => emits(requests.get(module).slice(0, index), new Set([module]));
  const everySheet = readdirSync(stylesRoot).filter((name) => name.endsWith('.css'));
  const before = new Map(
    modules.map((module) => [module, new Set(first(module) ? [] : everySheet)]),
  );
  for (let changed = true; changed;) {
    changed = false;
    for (const module of modules) {
      if (first(module)) continue;
      const current = before.get(module);
      for (const [importer, index] of importers.get(module)) {
        const there = new Set([...before.get(importer), ...prior(importer, index)]);
        for (const sheet of current)
          if (!there.has(sheet)) {
            current.delete(sheet);
            changed = true;
          }
      }
    }
  }
  const result = new Map();
  for (const module of modules)
    requests.get(module).forEach((request, index) => {
      if (!request.sheet) return;
      const there = new Set([...before.get(module), ...prior(module, index)]);
      const current = result.get(request.sheet);
      result.set(
        request.sheet,
        current ? new Set([...current].filter((sheet) => there.has(sheet))) : there,
      );
    });
  return result;
}

test('a module imports the base, then its own style sheets, after the modules it builds on', () => {
  const problems: string[] = [];
  for (const module of modules) {
    const list = requests.get(module);
    const sheets = list.filter((request) => request.sheet).map((request) => request.sheet);
    if (sheets.length === 0) continue;
    if (sheets[0] !== 'Base.css') problems.push(`${module} imports ${sheets[0]} before Base.css`);
    const firstSheet = list.findIndex((request) => request.sheet);
    if (list.slice(firstSheet).some((request) => request.module))
      problems.push(`${module} imports a module after a style sheet`);
  }
  assert.deepEqual(problems, []);
});

test('every style sheet a module imports is one index.css loads', () => {
  const index = styleSheet('index.css');
  const listed = new Set(
    [...index.matchAll(/^@import '\.\/([\w.]+)';$/gm)].map(([, name]) => name),
  );
  const imported = new Set(
    [...requests.values()].flat().flatMap((request) => (request.sheet ? [request.sheet] : [])),
  );
  assert.deepEqual(
    [...imported].filter((sheet) => !listed.has(sheet)),
    [],
  );
});

test('a module that renders a class brings the style sheets that style it', () => {
  const { componentOf, components, ownerOf } = analyze().ownership;
  const rules = JSON.parse(
    readFileSync(new URL('./composition/Rules.json', import.meta.url), 'utf8'),
  );
  const sheetsWithoutComponent = new Set(Object.keys(rules.classes.stylesheetsWithoutComponent));
  const ownSheet = (name, sheet) =>
    sheetsWithoutComponent.has(sheet) ||
    sheet ===
      `${name.slice('env-'.length).replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase())}.css`;
  const rendersForTheOwnerThatBringsItsSheet = {
    'forms/internal/PickerPopup.tsx': ['env-time-picker-popup'],
  };
  const rendersNothing = (module) =>
    module.startsWith('dev/') ||
    [
      'foundations/themeStorage.ts',
      'internal/theme/themeRoot.ts',
      'foundations/internal/storedPreference.ts',
      'content/internal/useCodeContrast.ts',
    ].includes(module);
  const base = [...styleSheet('Base.css').matchAll(/^@import '\.\/([\w.]+)'/gm)].map(
    ([, name]) => name,
  );
  const styling = new Map();
  for (const name of readdirSync(stylesRoot).filter((file) => file.endsWith('.css')))
    for (const { selector } of cssSelectors(styleSheet(name))) {
      const first = /\.(env-[a-z0-9]+(?:-[a-z0-9]+)*)/.exec(selector)?.[1];
      if (!first) continue;
      if (!styling.has(first)) styling.set(first, new Set());
      styling.get(first).add(name);
    }
  const problems: string[] = [];
  for (const module of modules) {
    if (rendersNothing(module)) continue;
    const brought = new Set(emits([{ module }]));
    if (brought.has('Base.css')) for (const part of base) brought.add(part);
    const owner = componentOf.get(module);
    const text = readFileSync(join(sourceRoot, module), 'utf8');
    for (const name of new Set(text.match(/(?<![\w-])env-[a-z0-9]+(?:-[a-z0-9]+)*(?![\w-])/g))) {
      const classOwner = ownerOf(name);
      if (classOwner !== owner && classOwner !== 'shared') continue;
      if (rendersForTheOwnerThatBringsItsSheet[module]?.includes(name)) continue;
      const missing = [...(styling.get(name) ?? [])].filter(
        (sheet) =>
          !brought.has(sheet) &&
          (classOwner === 'shared'
            ? ownSheet(name, sheet)
            : components.get(classOwner).styles.has(sheet)),
      );
      if (missing.length) problems.push(`${module} renders ${name} without ${missing.join(', ')}`);
    }
  }
  assert.deepEqual(problems, []);
});

test('style sheets whose rules tie come in index.css order in every bundle', () => {
  const ties = [
    ['Button.css', 'Alert.css'],
    ['Button.css', 'ButtonGroup.css'],
    ['Button.css', 'ColorSwatch.css'],
    ['Button.css', 'Combobox.css'],
    ['Button.css', 'Composer.css'],
    ['Button.css', 'DocumentTabs.css'],
    ['Button.css', 'List.css'],
    ['Button.css', 'PickerPopup.css'],
    ['Button.css', 'Scaffold.css'],
    ['Button.css', 'Toast.css'],
    ['Button.css', 'Toolbar.css'],
    ['ListRow.css', 'Combobox.css'],
    ['ListRow.css', 'CommandPalette.css'],
    ['ListRow.css', 'Select.css'],
    ['PickerPopup.css', 'TimePicker.css'],
    ['Popup.css', 'Menu.css'],
    ['Popup.css', 'Tooltip.css'],
    ['Text.css', 'PageHeader.css'],
    ['TextField.css', 'Combobox.css'],
    ['TextField.css', 'DatePicker.css'],
  ];
  const index = [...styleSheet('index.css').matchAll(/^@import '\.\/([\w.]+)';$/gm)].map(
    ([, name]) => name,
  );
  const before = guaranteedBefore();
  const problems: string[] = [];
  for (const [earlier, later] of ties) {
    assert.ok(index.indexOf(earlier) < index.indexOf(later), `${earlier} precedes ${later}`);
    if (!before.get(later)?.has(earlier))
      problems.push(`a bundle may put ${later} before ${earlier}`);
  }
  for (const [sheet, earlier] of before)
    if (sheet !== 'Base.css' && !earlier.has('Base.css'))
      problems.push(`a bundle may put ${sheet} before Base.css`);
  assert.deepEqual(problems, []);
});

test("Skeleton.css's rules win their ties whatever the order", () => {
  const css = styleSheet('Skeleton.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [
    ...css.matchAll(/(?:^|[;{}])\s*([^;{}@]*\[data-env-skeleton\][^;{}]*)\{/g),
  ].map(([, selector]) => selector.replace(/\s+/g, ' ').trim());
  assert.ok(selectors.length > 5);
  const bare = selectors.filter(
    (selector) =>
      !/^:where\(\[data-env-skeleton\]\)/.test(selector) &&
      !/^\[data-env-skeleton\]:not\(env-none\)/.test(selector),
  );
  assert.deepEqual(bare, []);
});
