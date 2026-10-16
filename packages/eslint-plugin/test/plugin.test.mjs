import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import plugin from '../src/index.js';
import {
  codemodsMapUrl,
  expectedRenames,
  exportsUrl,
  normalizeRenameMap,
  renamesUrl,
} from '../scripts/SyncRenames.mjs';
import { expectedTokens, libraryTokensUrl, tokensUrl } from '../scripts/SyncTokens.mjs';
import { colorTokenSuggestion } from '../src/tokens.js';

const read = (url) => JSON.parse(readFileSync(url, 'utf8'));
const manifest = read(new URL('../package.json', import.meta.url));
const elements = read(new URL('../src/data/elements.json', import.meta.url));
const renames = read(renamesUrl);
const snapshot = read(exportsUrl);
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const entries = [...elements.roles, ...elements.elements];
const isName = (value) => /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(value);
const oldMainNames = renames.modules['@envsemble/envui'];

test('the plugin names itself and turns every rule on in the recommended config', () => {
  assert.deepEqual(plugin.meta, {
    name: manifest.name,
    version: manifest.version,
    namespace: 'envui',
  });
  const { recommended } = plugin.configs;
  assert.equal(recommended.plugins.envui, plugin);
  assert.deepEqual(
    Object.keys(recommended.rules).sort(),
    Object.keys(plugin.rules).map((name) => `envui/${name}`),
  );
  for (const severity of Object.values(recommended.rules)) assert.equal(severity, 'error');
});

test('every rule links to its section of the README', () => {
  for (const [name, rule] of Object.entries(plugin.rules)) {
    assert.ok(rule.meta.docs.description, `${name} has a description`);
    assert.equal(
      rule.meta.docs.url,
      `https://github.com/envsemble/envUI/blob/main/packages/eslint-plugin/README.md#${name}`,
    );
    assert.match(readme, new RegExp(`^### ${name}$`, 'm'), `the README documents ${name}`);
  }
});

test('the mapping table has unique entries that name envUI 1.0 components', () => {
  const ids = entries.map((entry) => entry.id);
  assert.deepEqual(ids, [...new Set(ids)], 'ids are unique');
  const roles = elements.roles.map((entry) => entry.role);
  assert.deepEqual(roles, [...new Set(roles)], 'each role has one entry');
  for (const entry of entries) {
    assert.ok(
      Boolean(entry.role) !== Boolean(entry.element),
      `${entry.id} names a role or an element`,
    );
    assert.equal(
      entry.except !== undefined,
      entry.element === '*',
      `${entry.id}: except goes with *`,
    );
    if (entry.use === null) continue;
    assert.ok(entry.use.length > 0, `${entry.id} names a component`);
    entry.use.forEach(({ component, when }, index) => {
      assert.ok(isName(component), `${entry.id}: ${component} is a component name`);
      assert.equal(index > 0, typeof when === 'string', `${entry.id}: alternatives say when`);
      // A 0.x name that 1.0 renamed, such as Input, must not be suggested.
      const root = component.split('.')[0];
      const renamed = oldMainNames[component] ?? oldMainNames[root];
      assert.ok(
        renamed === undefined || renamed.namespace || renamed.to[0]?.startsWith(`${root}.`),
        `${entry.id}: ${component} is an old name`,
      );
    });
    for (const binding of entry.import ?? []) assert.ok(isName(binding), `${entry.id}: ${binding}`);
    for (const owner of entry.owners ?? []) assert.ok(isName(owner), `${entry.id}: ${owner}`);
    assert.equal(entry.owners !== undefined, entry.role !== undefined, `${entry.id}: owners`);
  }
});

test("the components that own a role are envUI's when the repository has its props data", () => {
  const props = new URL('../../../docs/generated/props.json', import.meta.url);
  if (!existsSync(props)) return;
  const exported = new Set(Object.keys(read(props).exports));
  for (const entry of elements.roles)
    for (const owner of entry.owners)
      assert.ok(exported.has(owner), `${entry.id}: ${owner} is not an envUI component`);
});

test('the rename map renames only what envUI 0.7 exported, to well-formed names', () => {
  for (const [entry, names] of Object.entries(renames.modules)) {
    const exported = snapshot.modules[entry];
    assert.ok(exported, `${entry} is an entry point of envUI ${snapshot.version}`);
    for (const [name, rename] of Object.entries(names)) {
      assert.ok(
        exported.values.includes(name) || exported.types.includes(name),
        `${entry} exported ${name}`,
      );
      for (const target of rename.to) {
        assert.ok(isName(target), `${name} -> ${target} is a name`);
        // A replacement must not be reached through a name that is itself gone.
        const root = target.split('.')[0];
        const gone = names[root];
        assert.ok(
          gone === undefined || gone.namespace || gone.to[0]?.startsWith(`${root}.`),
          `${name} -> ${target}: ${root} is not exported by 1.0`,
        );
      }
      // A name that became internal says what to use instead.
      if (rename.to.length === 0) assert.ok(rename.use, `${name} has a use hint`);
      if (rename.prop !== undefined)
        assert.deepEqual(
          [...new Set(Object.values(rename.values))],
          rename.to,
          `${name}: the split's values choose its replacements`,
        );
    }
  }
});

test("the rename map is the codemods' map when the repository has one", async () => {
  if (existsSync(codemodsMapUrl)) {
    assert.equal(
      readFileSync(renamesUrl, 'utf8'),
      await expectedRenames(),
      "src/data/renames.json is behind the codemods' map: run npm run sync:renames --workspace @envsemble/eslint-plugin-envui.",
    );
    assert.equal(renames.source, 'packages/codemods/src/maps/v1');
  } else assert.equal(renames.source, 'embedded');
});

test("the codemods' map is read in each shape it may take", () => {
  const snapshot = {
    modules: {
      '@envsemble/envui': {
        values: ['Input', 'Menu', 'MenuItem', 'LoadingBar', 'Row'],
        types: ['InputProps'],
      },
      '@envsemble/envui/theme-bootstrap': { values: ['defaultThemeStorageKey'], types: [] },
    },
  };
  const shapes = [
    {
      $schema: './schema.json',
      components: {
        Input: 'TextField',
        Menu: 'Menu.Root',
        MenuItem: { to: 'Menu.Item', props: { hint: 'description' } },
      },
      types: { InputProps: 'TextFieldProps' },
      internal: { LoadingBar: null },
      './theme-bootstrap': { defaultThemeStorageKey: 'internal' },
      props: { Row: { title: 'label' } },
      classes: { 'env-input': 'env-text-field' },
      values: { Button: { variant: { quiet: 'ghost' } } },
    },
    [
      { from: 'Input', to: 'TextField' },
      { from: 'InputProps', to: 'TextFieldProps' },
      { from: 'Menu', to: 'Menu.Root' },
      { old: 'MenuItem', new: 'Menu.Item' },
      { from: 'LoadingBar', to: [] },
      { from: 'defaultThemeStorageKey', to: null, module: './theme-bootstrap' },
      { from: 'env-input', to: 'env-text-field' },
      { from: 'hint', to: 'description' },
    ],
  ];
  for (const map of shapes)
    assert.deepEqual(normalizeRenameMap(map, snapshot), {
      '@envsemble/envui': {
        Input: { to: ['TextField'] },
        InputProps: { to: ['TextFieldProps'] },
        LoadingBar: { to: [] },
        Menu: { to: ['Menu.Root'] },
        MenuItem: { to: ['Menu.Item'] },
      },
      '@envsemble/envui/theme-bootstrap': { defaultThemeStorageKey: { to: [] } },
    });
});

test("the codemods' hints, splits and reused namespaces carry over", () => {
  const snapshot = {
    modules: {
      '@envsemble/envui': {
        values: ['DirectionLink', 'LoadingBar', 'Toast', 'ToastProvider'],
        types: [],
      },
    },
  };
  const map = {
    exports: { '@envsemble/envui': { ToastProvider: 'Toast.Provider' } },
    split: {
      '@envsemble/envui': {
        DirectionLink: {
          prop: 'direction',
          values: { previous: 'Pager.Previous', next: 'Pager.Next' },
        },
      },
    },
    removed: {
      '@envsemble/envui': {
        LoadingBar: { use: 'Use Progress.' },
        Toast: { use: 'Use useToast() inside Toast.Provider.' },
      },
    },
  };
  assert.deepEqual(normalizeRenameMap(map, snapshot), {
    '@envsemble/envui': {
      DirectionLink: {
        to: ['Pager.Previous', 'Pager.Next'],
        prop: 'direction',
        values: { previous: 'Pager.Previous', next: 'Pager.Next' },
      },
      LoadingBar: { to: [], use: 'Use Progress.' },
      Toast: { to: [], use: 'Use useToast() inside Toast.Provider.', namespace: true },
      ToastProvider: { to: ['Toast.Provider'] },
    },
  });
});

test('the README documents every entry of the mapping table and every renamed name', () => {
  for (const entry of entries)
    assert.ok(readme.includes(`\`${entry.id}\``), `the README lists ${entry.id}`);
  for (const names of Object.values(renames.modules))
    for (const name of Object.keys(names))
      assert.match(readme, new RegExp(`\`${name}\``), `the README lists ${name}`);
});

test("the token names are the library's when the repository has its token list", () => {
  const copy = read(tokensUrl);
  if (existsSync(libraryTokensUrl)) {
    assert.equal(
      readFileSync(tokensUrl, 'utf8'),
      expectedTokens(),
      "src/data/tokens.json is behind the library's token list: run npm run sync:tokens --workspace @envsemble/eslint-plugin-envui.",
    );
    assert.equal(copy.source, 'packages/ui/src/generated/tokens.json');
  } else assert.equal(copy.source, 'embedded');
});

test('every token the messages and the README name exists in the library', () => {
  const library = existsSync(libraryTokensUrl)
    ? read(libraryTokensUrl).tokens.map((token) => token.cssVariable)
    : Object.values(read(tokensUrl).tokens).flat();
  const messages = [
    ...Object.values(plugin.rules).flatMap((rule) => Object.values(rule.meta.messages)),
    ...['color', 'backgroundColor', 'borderColor', 'outline', 'fill', 'boxShadow', '--brand'].map(
      colorTokenSuggestion,
    ),
    colorTokenSuggestion(undefined),
  ];
  const named = [...messages, readme].flatMap((text) => [
    ...text.matchAll(/var\((--[\w-]+)(…)?/g),
    // Bare names of envUI's color and stacking tokens, such as `--env-color-fg-default`.
    ...text.matchAll(/(?<![\w-])(--(?:env-)?(?:color|z)-[\w-]*)(…)?/g),
  ]);
  assert.ok(named.length > 0, 'the messages name tokens');
  for (const [, name, family] of named) {
    if (family)
      assert.ok(
        library.some((token) => token.startsWith(name)),
        `${name}… names no envUI token`,
      );
    else assert.ok(library.includes(name), `${name} is not an envUI token`);
  }
});
