import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import plugin from '../src/index.js';
import { lintPackages, staleFiles } from '../../../scripts/build/SyncLintPackages.ts';
import { colorTokenSuggestion } from '../src/tokens.js';

const read = (url) => JSON.parse(readFileSync(url, 'utf8'));
const manifest = read(new URL('../package.json', import.meta.url));
const elements = read(new URL('../src/data/elements.json', import.meta.url));
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const entries = [...elements.roles, ...elements.elements];
const isName = (value) => /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(value);

test('the plugin names itself and turns every rule on in the recommended config, the layout rule as a warning', () => {
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
  for (const [rule, severity] of Object.entries(recommended.rules))
    assert.equal(severity, rule === 'envui/no-inline-layout' ? 'warn' : 'error', rule);
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
    });
    for (const binding of entry.import ?? []) assert.ok(isName(binding), `${entry.id}: ${binding}`);
    for (const owner of entry.owners ?? []) assert.ok(isName(owner), `${entry.id}: ${owner}`);
    assert.equal(entry.owners !== undefined, entry.role !== undefined, `${entry.id}: owners`);
  }
});

test("the components that own a role, and those suggested, are envUI's when the repository has its props data", () => {
  const props = new URL('../../../docs/generated/props.json', import.meta.url);
  if (!existsSync(props)) return;
  const exported = new Set(Object.keys(read(props).exports));
  for (const entry of elements.roles)
    for (const owner of entry.owners)
      assert.ok(exported.has(owner), `${entry.id}: ${owner} is not an envUI component`);
  for (const entry of entries)
    for (const { component } of entry.use ?? [])
      assert.ok(
        exported.has(component) || exported.has(component.split('.')[0]),
        `${entry.id}: ${component} is not an envUI component`,
      );
});

test("the token names and their helper are the repository's, copied", () => {
  const directory = lintPackages[manifest.name];
  assert.deepEqual(
    staleFiles().filter((path) => path.startsWith(`${directory}/`)),
    [],
    'Run npm run tokens:build.',
  );
});

test('every token the messages and the README name exists in the library', () => {
  const library = read(new URL('../../ui/src/generated/tokens.json', import.meta.url)).tokens.map(
    (token) => token.cssVariable,
  );
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
