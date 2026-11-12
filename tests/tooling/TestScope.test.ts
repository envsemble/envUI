import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
  aliases,
  changedFiles,
  fixtureBudget,
  mergeChanges,
  parseNameStatus,
  pathRules,
  selectScope,
  serversFor,
  specFile,
  specNeeds,
  specsFor,
  unitTestFiles,
} from '../../scripts/test/TestScope.ts';
import { checkoutId, checkoutPort } from '../../scripts/test/CheckoutMarker.ts';
import { fixtureUse, importsOf } from '../../scripts/test/FixtureImports.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

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
    assert.throws(() => changedFiles({ root: folder, base: 'missing' }), /missing doesn't exist/);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test('a component runs the spec of its name, or of the name its alias gives', () => {
  assert.deepEqual(specs('packages/ui/src/forms/Checkbox.tsx'), ['Checkbox']);
  assert.deepEqual(specs('packages/ui/src/styles/Table.css'), ['Table']);
  // A file in a component's folder is about that component.
  assert.ok(specs('packages/ui/src/layout/panel-dock/panelDockTypes.ts').includes('PanelDock'));
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
  assert.ok(specs('packages/ui/src/feedback/Progress.tsx').includes('Messages'));
  assert.ok(specs('packages/ui/src/layout/Page.tsx').includes('Panes'));
  // Through the module that imports it: Calendar is in the date picker's popup.
  assert.ok(specs('packages/ui/src/forms/Calendar.tsx').includes('DatePicker'));
  // A fixture runs the specs that open it, also through the fixtures that import it.
  assert.deepEqual(specs('tests/fixture/Combobox.fixture.tsx'), ['Combobox', 'Field']);
  assert.ok(specs('tests/fixture/CommandPalette.fixture.tsx').includes('CommandPalette'));
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

test('the affected tier runs every spec a file or helper concerns', () => {
  const path = 'packages/ui/src/internal/classNames.ts';
  const fast = specsFor([path]);
  const affected = specsFor([path], { affected: true });
  assert.equal(affected.widelyUsed.size, 0);
  assert.equal(affected.specs.size, fast.widelyUsed.get(path));
  // Nearly every spec imports Servers.ts, and the affected tier runs each that does.
  const helper = specsFor(['tests/browser/support/Servers.ts'], { affected: true });
  assert.equal(helper.specs.size, helper.helpers.get('tests/browser/support/Servers.ts').length);
  assert.ok(helper.specs.size > globSync('tests/browser/{library,site}/*.spec.ts').length / 2);
});

test('imports are read from the syntax, types, comments and strings left out', () => {
  const source = `
    // import { Table } from '@envsemble/envui';
    import type { Page } from '@playwright/test';
    import {
      type ButtonProps,
      Button as Action,
      Card,
    } from '@envsemble/envui';
    import Default, { Menu } from './Menus';
    import './Fixture.css';
    export { Dialog } from '../library';
    export type { Theme } from '../theme';
    export * from './everything';
    const text = "import { Tree } from '@envsemble/envui'";
    const lazy = () => import('./Lazy');
    await render(\`import { Table } from '@envsemble/envui';
      export const element = \${'x'};\`);
  `;
  assert.deepEqual(importsOf(source), [
    { specifier: '@envsemble/envui', names: ['Button', 'Card'] },
    { specifier: './Menus', names: 'all' },
    { specifier: './Fixture.css', names: 'all' },
    { specifier: '../library', names: ['Dialog'] },
    { specifier: './everything', names: 'all' },
    { specifier: './Lazy', names: 'all' },
    { specifier: '@envsemble/envui', names: ['Table'] },
  ]);
});

test("a fixture's specs follow what its imports mean, however they are written", () => {
  const checkout = (files) => {
    const root = mkdtempSync(join(tmpdir(), 'envui-imports-'));
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text.join('\n'));
    }
    return root;
  };
  // Each file a list of lines.
  const common = {
    'packages/ui/src/actions/Button.tsx': [
      "import '../styles/Button.css';",
      'export function Button() {}',
    ],
    'packages/ui/src/styles/Button.css': ['.env-button {}'],
    'tests/browser/library/Button.spec.ts': [
      "test('x', ({ page }) => page.goto('/?fixture=button'));",
    ],
    'tests/browser/library/Table.spec.ts': ["// import { Button } from '@envsemble/envui';"],
  };
  const plain = checkout({
    ...common,
    'packages/ui/src/index.ts': ["export { Button } from './actions/Button.js';"],
    'tests/fixture/Button.fixture.tsx': [
      "import { Button } from '@envsemble/envui';",
      'export default Button;',
    ],
  });
  const rewritten = checkout({
    ...common,
    'packages/ui/src/index.ts': ["export * from './actions/Button.js';"],
    'tests/fixture/Button.fixture.tsx': [
      'import {',
      '  type Button as Kind,',
      '  Button as Action,',
      "} from '@envsemble/envui';",
      'export default Action;',
    ],
  });
  try {
    for (const root of [plain, rewritten]) {
      const specsOf = fixtureUse(root);
      assert.deepEqual(specsOf('packages/ui/src/styles/Button.css'), ['Button'], root);
      assert.deepEqual(specsOf('tests/fixture/Button.fixture.tsx'), ['Button'], root);
    }
  } finally {
    rmSync(plain, { recursive: true, force: true });
    rmSync(rewritten, { recursive: true, force: true });
  }
});

test('every path a rule names exists, and every spec it runs', () => {
  const skipped = (name) => name === 'node_modules' || name === '.git' || name === 'dist';
  for (const { paths, specs: names = [] } of pathRules) {
    for (const glob of paths)
      assert.ok(globSync(glob, { exclude: skipped }).length, `${glob} names no file`);
    for (const name of names) assert.ok(existsSync(specFile(name)), `no spec ${name}`);
  }
});

test('a shared file runs the shared set, and a file no fixture uses runs no spec', () => {
  assert.deepEqual(specs('packages/ui/src/generated/Tokens.css'), [
    'Colors',
    'Contrast',
    'Scale',
    'ThemeContrast',
  ]);
  const { specs: none, unmatched } = specsFor(['packages/ui/src/foundations/headingLevel.ts']);
  assert.equal(none.size, 0);
  assert.deepEqual(unmatched, ['packages/ui/src/foundations/headingLevel.ts']);
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
  // What the fixtures' imports find for a file, as the fast tier runs it: the most specific few.
  const found = fixtureUse(repositoryRoot);
  const redundant: string[] = [];
  for (const [name, targets] of Object.entries(aliases)) {
    assert.ok(
      files.some((file) => named(file).includes(name)),
      `the alias ${name} names no file`,
    );
    for (const target of targets)
      assert.ok(existsSync(specFile(target)), `${name}: no spec ${target}`);
    const modules = files
      .filter(
        (file) =>
          file
            .split('/')
            .at(-1)
            ?.replace(/\.(?:tsx?|css)$/, '') === name,
      )
      .map((file) => `packages/ui/src/${file}`);
    const imported = new Set(modules.flatMap((path) => found(path).slice(0, fixtureBudget)));
    if (modules.length && targets.every((target) => imported.has(target))) redundant.push(name);
  }
  assert.deepEqual(redundant, [], 'The imports find these aliases’ specs: remove the aliases.');
});

test("a spec is in the library's or the site's folder, or a component test", () => {
  assert.equal(specFile('Hydration'), 'tests/browser/library/Hydration.spec.ts');
  assert.equal(specFile('Button'), 'tests/component/Button.test.tsx');
  assert.equal(specFile('SiteSmoke'), 'tests/browser/site/SiteSmoke.spec.ts');
});

test('a changed spec runs itself, and a changed helper the specs that import it', () => {
  assert.deepEqual(specs('tests/component/Tree.test.tsx'), ['Tree']);
  assert.deepEqual(specs('tests/component/support/Chevron.ts'), ['Select']);
  assert.deepEqual(specs('tests/browser/support/HostedSite.ts'), ['SiteFailures']);
});

test('a module of the documentation generator runs the specs of the site', () => {
  assert.ok([...selectScope(['scripts/docs/PageReader.ts']).specs.keys()].includes('SiteSmoke'));
});

test('the site runs its specs and live development, with the builds they open', () => {
  const scope = selectScope(['apps/site/src/main.tsx']);
  assert.deepEqual([...scope.specs.keys()].sort(), [
    'LiveDevelopment',
    'SiteFailures',
    'SitePrerender',
    'SiteSmoke',
  ]);
  assert.equal(scope.build.site, true);
  assert.equal(specNeeds('LiveDevelopment').live, true);
  assert.equal(specNeeds('Hydration').library, true);
  assert.equal(selectScope(['tests/browser/library/Hydration.spec.ts']).build.library, true);
});

test('static checks cover the changed files, and configuration the whole of its check', () => {
  const scope = selectScope(['packages/ui/src/forms/Checkbox.tsx', 'docs/setup.md']);
  assert.deepEqual(scope.lint, ['packages/ui/src/forms/Checkbox.tsx']);
  assert.equal(scope.typecheck, true);
  assert.ok(scope.generated.has('docs'));
  assert.equal(selectScope(['eslint.config.mjs']).whole.lint, true);
});

test('servers follow the specs that need them', () => {
  // A library spec that opens the fixture page, in a checkout of its own.
  const root = mkdtempSync(join(tmpdir(), 'envui-servers-'));
  try {
    mkdirSync(join(root, 'tests/browser/library'), { recursive: true });
    writeFileSync(
      join(root, 'tests/browser/library/Widget.spec.ts'),
      "import { fixtureUrl } from '../support/Servers';",
    );
    assert.deepEqual(serversFor(['Widget'], root), ['fixture']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  // A component test needs none.
  assert.deepEqual(serversFor(['Tree']), []);
  assert.deepEqual(serversFor(['SiteSmoke']), ['site-build']);
  assert.deepEqual(serversFor(['SiteFailures']), ['site']);
  assert.deepEqual(serversFor(['SiteSmoke', 'SiteFailures']), ['site', 'site-build']);
  assert.deepEqual(serversFor([]), []);
});

test('unit tests that read the library build are kept apart', () => {
  const { built, fast: quick } = unitTestFiles();
  for (const part of ['Contents', 'Resolution', 'Rendering'])
    assert.ok(built.includes(`tests/library/package/Package${part}.test.ts`), part);
  assert.ok(quick.includes('tests/tooling/TestScope.test.ts'));
  assert.ok(!quick.some((file) => built.includes(file)));
});

test('each checkout has its own identity and ports', () => {
  assert.equal(checkoutId('/a/checkout'), checkoutId('/a/checkout'));
  assert.notEqual(checkoutId('/a/checkout'), checkoutId('/another/checkout'));
  const id = checkoutId('/a/checkout');
  assert.equal(checkoutPort(1, id), checkoutPort(0, id) + 1);
  assert.ok(checkoutPort(0, id) >= 20000 && checkoutPort(1, id) < 38001);
});
