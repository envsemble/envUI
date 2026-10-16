import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  buildIndex,
  changedFiles,
  exportedNames,
  markupClasses,
  mergeChanges,
  nameCandidates,
  overrides,
  ownClassPrefix,
  ownedClasses,
  parseNameStatus,
  relativeImports,
  selectScope,
  serversFor,
  stylesheetClasses,
  unitTestFiles,
} from '../scripts/TestScope.mjs';
import { checkoutId, checkoutPort } from '../scripts/CheckoutMarker.mjs';

const index = buildIndex();
const select = (...paths) => selectScope(paths, index);
const fast = (scope) => [...scope.fastSpecs.keys()].sort();
const affected = (scope) => [...scope.affectedSpecs.keys()].sort();

test('diff parsing reads statuses, renames and untracked files', () => {
  const entries = parseNameStatus(
    ['M', 'a.ts', 'A', 'b.css', 'D', 'c.md', 'R087', 'old.tsx', 'new.tsx', ''].join('\0'),
  );
  assert.deepEqual(entries, [
    { status: 'M', path: 'a.ts' },
    { status: 'A', path: 'b.css' },
    { status: 'D', path: 'c.md' },
    { status: 'R', from: 'old.tsx', path: 'new.tsx' },
  ]);
  assert.deepEqual(
    mergeChanges(entries, ['a.ts', 'z.txt']).map(({ status, path }) => `${status} ${path}`),
    ['M a.ts', 'A b.css', 'D c.md', 'R new.tsx', 'A z.txt'],
  );
  assert.deepEqual(parseNameStatus(''), []);
});

test('changed files come from the merge-base, uncommitted edits and untracked files', () => {
  const folder = mkdtempSync(join(tmpdir(), 'envui-scope-'));
  const git = (...args) =>
    execFileSync('git', args, { cwd: folder, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    git('init', '-q', '-b', 'base');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    git('config', 'commit.gpgsign', 'false');
    writeFileSync(join(folder, 'kept.ts'), 'one\n');
    writeFileSync(join(folder, 'edited.css'), 'one\n');
    git('add', '.');
    git('commit', '-q', '-m', 'base');
    git('checkout', '-q', '-b', 'work');
    writeFileSync(join(folder, 'committed.md'), 'two\n');
    git('add', '.');
    git('commit', '-q', '-m', 'work');
    // The base moves on after the branch left it; its change is not the branch's.
    git('checkout', '-q', 'base');
    writeFileSync(join(folder, 'later.ts'), 'base only\n');
    git('add', '.');
    git('commit', '-q', '-m', 'later');
    git('checkout', '-q', 'work');
    writeFileSync(join(folder, 'edited.css'), 'two\n');
    writeFileSync(join(folder, 'new.tsx'), 'untracked\n');
    const { base, changes } = changedFiles({ root: folder, base: 'base' });
    assert.equal(base, 'base');
    assert.deepEqual(
      changes.map(({ status, path }) => `${status} ${path}`),
      ['A committed.md', 'M edited.css', 'A new.tsx'],
    );
    assert.throws(() => changedFiles({ root: folder, base: 'missing' }), /None of missing exists/);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test('names, classes, imports and exports are read from sources', () => {
  assert.deepEqual(nameCandidates('Menus'), ['Menus', 'Menu']);
  assert.deepEqual(nameCandidates('Comboboxes'), ['Comboboxes', 'Combobox', 'Comboboxe']);
  assert.equal(ownClassPrefix('packages/ui/src/styles/TextField.css'), 'env-text-field');
  assert.deepEqual(
    stylesheetClasses(
      '/* .env-old */ .env-tree .env-symbol, .env-tree-row:hover { color: var(--env-x); }',
    ),
    ['env-tree', 'env-symbol', 'env-tree-row'],
  );
  // A stylesheet owns the classes named after it, not the icon it styles inside them.
  assert.deepEqual(
    ownedClasses('Tree.css', ['env-tree', 'env-symbol', 'env-tree-row'], ['env-tree', 'env-icon']),
    ['env-tree', 'env-tree-row'],
  );
  // A group stylesheet owns what no other stylesheet is named for.
  assert.deepEqual(
    ownedClasses(
      'Indicators.css',
      ['env-badge-dot', 'env-tooltip'],
      ['env-indicators', 'env-badge'],
    ),
    ['env-tooltip'],
  );
  // The source of `className={classNames('env-button', `env-button-${variant}`, …)}`.
  const markup = markupClasses(
    "className={classNames('env-button', `env-button-$" +
      "{variant}`, 'data-env-theme', '--env-gap')}",
  );
  assert.deepEqual([...markup.literal], ['env-button']);
  assert.deepEqual([...markup.prefixes], ['env-button-']);
  assert.deepEqual(
    relativeImports(
      "import { a } from './a.js';\nexport * from '../b.js';\nimport './c.css';\nconst d = import('./d.js');\nimport x from 'react';",
    ),
    ['./a.js', '../b.js', './c.css', './d.js'],
  );
  assert.deepEqual(
    exportedNames(
      'export function Button() {}\nexport const useThing = 1;\nexport { A, B as C, type D };\nexport type E = 1;',
    ).sort(),
    ['A', 'Button', 'C', 'D', 'useThing'],
  );
});

test('the overrides name specs, pages and names that exist', () => {
  for (const name of [
    ...Object.keys(overrides.specSubjects),
    ...overrides.smokeSpecs,
    ...overrides.catalogueSpecs,
    ...overrides.stylesheetSpecs,
  ])
    assert.ok(index.specs.has(name), `${name} is a spec in tests/browser`);
  for (const page of overrides.smokePages) assert.ok(index.pages.has(page), `${page} is a page`);
  for (const file of overrides.sharedLibrary)
    assert.ok(
      index.namesOfModule.has(file) || index.stylesheets.has(file),
      `${file} is a library module`,
    );
});

test('fixtures map to the files they mount', () => {
  assert.deepEqual(index.fixtureByName.get('menus'), ['tests/fixture/Menus.tsx']);
  assert.deepEqual(index.fixtureByName.get('colors'), ['tests/fixture/Colors.tsx']);
  assert.ok(index.fixtureByName.get('shell').includes('tests/fixture/Adoption.tsx'));
  assert.ok(index.specs.get('Menu.spec.ts').fixtureFiles.has('tests/fixture/Menus.tsx'));
  assert.ok(index.specs.get('Menu.spec.ts').primary.has('Menu'));
});

test('a component stylesheet runs the specs about that component', () => {
  const scope = select('packages/ui/src/styles/Menu.css');
  assert.ok(fast(scope).includes('Menu.spec.ts'));
  assert.ok(fast(scope).includes('Menubar.spec.ts'));
  // Any style sheet: the cascade layers and the forced-colors states.
  for (const spec of overrides.stylesheetSpecs) assert.ok(fast(scope).includes(spec));
  assert.ok(!fast(scope).includes('Toast.spec.ts'));
  assert.deepEqual(scope.css, ['packages/ui/src/styles/Menu.css']);
  assert.equal(scope.contrast, false);
  assert.equal(scope.typecheck, false);
  assert.ok(scope.pages.has('components/menu'));
});

test('a stylesheet named for a component reaches it through internal modules', () => {
  const scope = select('packages/ui/src/styles/TextField.css');
  assert.ok(fast(scope).includes('Forms.spec.ts'));
  assert.ok(fast(scope).includes('InputAffixes.spec.ts'));
  assert.ok(scope.pages.has('components/text-field'));
});

test('a component module runs its specs, and the modules using it in the affected tier', () => {
  const scope = select('packages/ui/src/navigation/Tree.tsx');
  assert.deepEqual(fast(scope), ['Tree.spec.ts']);
  assert.ok(affected(scope).length > 1);
  assert.equal(scope.typecheck, true);
  assert.equal(scope.build.library, true);
});

test('tokens run the contrast gate and the shared set, not every spec', () => {
  const scope = select('packages/ui/tokens/base/color.json');
  assert.equal(scope.contrast, true);
  assert.equal(scope.shared, true);
  assert.ok(scope.generated.has('tokens'));
  assert.deepEqual(fast(scope), [...overrides.smokeSpecs].sort());
  assert.ok(scope.pages.size <= overrides.smokePages.length);
});

test('a widely shared module runs the shared set', () => {
  const scope = select('packages/ui/src/internal/classNames.ts');
  assert.equal(scope.shared, true);
  assert.deepEqual(fast(scope), [...overrides.smokeSpecs].sort());
});

test('a documentation page runs no browser spec in the fast tier', () => {
  const scope = select('docs/components/button.md');
  assert.deepEqual(fast(scope), []);
  assert.ok(scope.pages.has('components/button'));
  assert.ok(scope.generated.has('docs'));
  assert.ok(affected(scope).includes('Catalogue.spec.ts'));
});

test('specs, fixtures and helpers run the specs they belong to', () => {
  assert.deepEqual(fast(select('tests/browser/Tree.spec.ts')), ['Tree.spec.ts']);
  assert.deepEqual(fast(select('tests/fixture/Menus.tsx')), ['Menu.spec.ts']);
  assert.equal(select('tests/fixture/App.tsx').shared, true);
  const contrast = select('tests/contrast/Pairs.ts');
  assert.equal(contrast.contrast, true);
  assert.ok(fast(contrast).includes('ThemeContrast.spec.ts'));
});

test('the fast tier builds the catalogue its specs open; library-build and live specs wait', () => {
  const example = select('apps/catalogue/src/examples/menu/Choices.tsx');
  assert.ok(fast(example).includes('DenseContent.spec.ts'));
  assert.ok(affected(example).includes('Catalogue.spec.ts'));
  assert.equal(example.build.site, true);
  const page = select('apps/catalogue/src/pages/Overview.tsx');
  assert.ok(fast(page).includes('Catalogue.spec.ts'));
  assert.deepEqual(page.fastBuild, { catalogue: true, site: true });
  const hydration = select('tests/browser/Hydration.spec.ts');
  assert.deepEqual(fast(hydration), []);
  assert.ok(affected(hydration).includes('Hydration.spec.ts'));
  assert.equal(hydration.build.library, true);
  assert.deepEqual(fast(select('tests/browser/LiveDevelopment.spec.ts')), []);
});

test('catalogue parts run the specs that import them or are about them', () => {
  assert.deepEqual(fast(select('apps/catalogue/src/search/DocumentationSearch.tsx')), [
    'CatalogueSearch.spec.ts',
  ]);
  assert.deepEqual(fast(select('scripts/SearchIndex.mjs')), ['CatalogueSearch.spec.ts']);
  assert.ok(
    fast(select('apps/catalogue/src/navigation/Sidebar.tsx')).includes('CatalogueSearch.spec.ts'),
  );
  // A file no spec names falls back to the catalogue's shared specs.
  assert.deepEqual(
    fast(select('apps/catalogue/src/styles/Shell.css')),
    [...overrides.catalogueSpecs].sort(),
  );
  for (const specs of Object.values(overrides.catalogueAreas))
    for (const spec of specs) assert.ok(index.specs.has(spec), `${spec} is a spec`);
});

test('lint and format take only changed files, and their configuration everything', () => {
  const scope = select('scripts/Check.mjs', 'README.md');
  assert.deepEqual(scope.lint, ['scripts/Check.mjs']);
  assert.deepEqual(scope.format, ['scripts/Check.mjs', 'README.md']);
  assert.equal(scope.whole.lint, false);
  assert.equal(select('eslint.config.mjs').whole.lint, true);
  assert.equal(select('stylelint-suppressions.json').whole.css, true);
  // A deleted file is neither linted nor formatted.
  assert.deepEqual(select('scripts/NoSuchScript.mjs').lint, []);
});

test('servers follow the specs that need them', () => {
  assert.deepEqual(serversFor(['Tree.spec.ts'], index), ['fixture']);
  assert.deepEqual(serversFor(['Catalogue.spec.ts'], index), ['catalogue']);
  assert.deepEqual(serversFor(['Tree.spec.ts', 'Spacing.spec.ts'], index).sort(), [
    'catalogue',
    'fixture',
  ]);
  assert.deepEqual(serversFor([], index), []);
});

test('unit tests that read the library build are kept apart', () => {
  const { built, fast: quick } = unitTestFiles();
  assert.ok(built.includes('tests/Package.test.mjs'));
  assert.ok(quick.includes('tests/TestScope.test.mjs'));
  assert.ok(!quick.some((file) => built.includes(file)));
});

test('each checkout has its own identity and ports', () => {
  assert.equal(checkoutId('/a/checkout'), checkoutId('/a/checkout'));
  assert.notEqual(checkoutId('/a/checkout'), checkoutId('/another/checkout'));
  const id = checkoutId('/a/checkout');
  assert.equal(checkoutPort(1, id), checkoutPort(0, id) + 1);
  assert.ok(checkoutPort(0, id) >= 20000 && checkoutPort(1, id) < 38001);
});
