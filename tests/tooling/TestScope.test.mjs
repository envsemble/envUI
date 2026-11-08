import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  aliases,
  changedFiles,
  mergeChanges,
  parseNameStatus,
  selectScope,
  serversFor,
  specNeeds,
  specsFor,
  unitTestFiles,
} from '../../scripts/test/TestScope.ts';
import { checkoutId, checkoutPort } from '../../scripts/test/CheckoutMarker.ts';

const specs = (...paths) => [...specsFor(paths).specs.keys()].sort();

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

test('a component runs the spec of its name, or of the name its alias gives', () => {
  assert.deepEqual(specs('packages/ui/src/forms/Checkbox.tsx'), ['Checkbox']);
  assert.deepEqual(specs('packages/ui/src/styles/Table.css'), ['Table']);
  // A file in a component's folder is about that component.
  assert.ok(specs('packages/ui/src/navigation/panel-dock/Header.tsx').includes('PanelDock'));
  assert.deepEqual(specs('packages/ui/src/foundations/Theme.tsx'), [
    'ThemeContrast',
    'ThemePreference',
    'WindowClasses',
  ]);
  // Names match as written, whatever the file system: messages/table.ts is not about Table.
  assert.deepEqual(specs('packages/ui/src/foundations/messages/table.ts'), ['Messages']);
});

test('a file runs the specs whose fixtures use it, and a fixture the specs that open it', () => {
  // A component without a spec of its own runs the specs whose fixtures show it.
  assert.ok(specs('packages/ui/src/feedback/Progress.tsx').includes('Meter'));
  assert.ok(specs('packages/ui/src/layout/Page.tsx').includes('Scaffold'));
  // Through the module that imports it: Calendar is in the date picker's popup.
  assert.ok(specs('packages/ui/src/forms/Calendar.tsx').includes('DatePicker'));
  // A fixture runs the specs that open it, also through the fixtures that import it.
  assert.deepEqual(specs('tests/fixture/Comboboxes.tsx'), ['Combobox', 'Field']);
  assert.ok(specs('tests/fixture/Palette.tsx').includes('CommandPalette'));
  // An icon's name names a symbol: icons/Palette.tsx is not about CommandPalette.
  assert.ok(!specs('packages/ui/src/icons/Palette.tsx').includes('CommandPalette'));
});

test('a file many fixtures use runs the most specific few, and says how many use it', () => {
  const { specs: some, widelyUsed } = specsFor(['packages/ui/src/internal/classNames.ts']);
  assert.equal(some.size, 6);
  assert.ok(widelyUsed.get('packages/ui/src/internal/classNames.ts') > 6);
  // A file of a spec's name runs that spec alone.
  assert.deepEqual(specs('packages/ui/src/actions/Button.tsx'), ['Button']);
});

test('a shared file runs the shared set, and a file no fixture uses runs no spec', () => {
  assert.deepEqual(specs('packages/ui/src/generated/Tokens.css'), [
    'Colors',
    'Contrast',
    'Scale',
    'ThemeContrast',
  ]);
  const { specs: none, unmatched } = specsFor(['packages/ui/src/internal/resizeDetails.ts']);
  assert.equal(none.size, 0);
  assert.deepEqual(unmatched, ['packages/ui/src/internal/resizeDetails.ts']);
});

test("the catalogue's playback runs the motion specs", () => {
  for (const path of ['apps/site/src/motion/MotionStage.tsx', 'apps/site/src/motion/Autoplay.ts']) {
    const selected = specs(path);
    assert.ok(selected.includes('SiteMotion') && selected.includes('Autoplay'), path);
  }
});

test('every alias names a file and specs that exist, and adds what the imports miss', () => {
  const files = [
    ...readdirSync('packages/ui/src', { recursive: true }),
    ...readdirSync('tests/fixture', { recursive: true }),
  ].map((file) => String(file).replaceAll('\\', '/'));
  const named = (file) => {
    const name = file
      .split('/')
      .at(-1)
      .replace(/\.(?:tsx?|css|m?js|html)$/, '');
    return [name, name.replace(/e?s$/, ''), name.replace(/s$/, '')];
  };
  for (const [name, targets] of Object.entries(aliases)) {
    assert.ok(
      files.some((file) => named(file).includes(name)),
      `the alias ${name} names no file`,
    );
    for (const target of targets)
      assert.ok(existsSync(`tests/browser/${target}.spec.ts`), `${name}: no spec ${target}`);
  }
});

test('a changed spec runs itself, and a changed helper the specs that import it', () => {
  assert.deepEqual(specs('tests/browser/Tree.spec.ts'), ['Tree']);
  assert.deepEqual(specs('tests/browser/helpers/Chevron.ts'), ['Combobox', 'Select']);
  // Every spec imports Servers.ts: verify covers it.
  assert.deepEqual(specs('tests/browser/helpers/Servers.ts'), []);
});

test('a module of the documentation generator runs the specs of the site', () => {
  assert.ok([...selectScope(['scripts/docs/Validation.ts']).specs.keys()].includes('DocsPages'));
});

test('the site runs its specs and live development, with the builds they open', () => {
  const scope = selectScope(['apps/site/src/main.tsx']);
  assert.deepEqual([...scope.specs.keys()].sort(), [
    'CatalogueBanners',
    'CatalogueComponentPages',
    'CatalogueFigures',
    'CatalogueGallery',
    'CatalogueOverlays',
    'CataloguePlainLanguage',
    'CatalogueRelated',
    'CatalogueSearch',
    'CatalogueTilePlayback',
    'DocsPages',
    'LiveDevelopment',
    'SiteFailures',
    'SiteRoutes',
    'SiteShell',
  ]);
  assert.equal(scope.build.site, true);
  assert.equal(specNeeds('LiveDevelopment').live, true);
  assert.equal(specNeeds('Hydration').library, true);
  assert.equal(selectScope(['tests/browser/Hydration.spec.ts']).build.library, true);
});

test('the examples, the pages that place them and dev mode run the layout check', () => {
  assert.deepEqual(specs('docs/components/card.md'), ['LayoutCheck']);
  assert.ok(specs('apps/site/src/examples/card/ProjectSummary.tsx').includes('LayoutCheck'));
  assert.ok(specs('packages/ui/src/dev/measure.ts').includes('LayoutCheck'));
  assert.equal(specNeeds('LayoutCheck').whole, true);
});

test('static checks cover the changed files, and configuration the whole of its check', () => {
  const scope = selectScope(['packages/ui/src/forms/Checkbox.tsx', 'docs/setup.md']);
  assert.deepEqual(scope.lint, ['packages/ui/src/forms/Checkbox.tsx']);
  assert.equal(scope.typecheck, true);
  assert.ok(scope.generated.has('docs'));
  assert.equal(selectScope(['eslint.config.mjs']).whole.lint, true);
});

test('servers follow the specs that need them', () => {
  assert.deepEqual(serversFor(['Tree']), ['fixture']);
  assert.deepEqual(serversFor(['SiteShell']), ['site']);
  assert.deepEqual(serversFor(['Tree', 'SiteShell']), ['fixture', 'site']);
  assert.deepEqual(serversFor([]), []);
});

test('unit tests that read the library build are kept apart', () => {
  const { built, fast: quick } = unitTestFiles();
  for (const part of ['Contents', 'Resolution', 'Rendering'])
    assert.ok(built.includes(`tests/library/Package${part}.test.mjs`), part);
  assert.ok(quick.includes('tests/tooling/TestScope.test.mjs'));
  assert.ok(!quick.some((file) => built.includes(file)));
});

test('each checkout has its own identity and ports', () => {
  assert.equal(checkoutId('/a/checkout'), checkoutId('/a/checkout'));
  assert.notEqual(checkoutId('/a/checkout'), checkoutId('/another/checkout'));
  const id = checkoutId('/a/checkout');
  assert.equal(checkoutPort(1, id), checkoutPort(0, id) + 1);
  assert.ok(checkoutPort(0, id) >= 20000 && checkoutPort(1, id) < 38001);
});
