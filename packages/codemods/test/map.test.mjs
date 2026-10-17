import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
  entriesOf,
  loadMap,
  mapFragments,
  mapSections,
  readMap,
  renameClass,
  validateMap,
} from '../src/map.mjs';
import { map } from './helpers.mjs';

const name = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const part = /^[A-Za-z_$][A-Za-z0-9_$]*\.[A-Za-z_$][A-Za-z0-9_$]*$/;
const className = /^env-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

test('the v1 map is well-formed', () => {
  assert.deepEqual(validateMap(map), []);
});

test('the v1 map has the expected sections', () => {
  for (const section of ['exports', 'split', 'removed', 'classes', 'classesWithin', 'docs'])
    assert.ok(isObject(map[section]), section);
  assert.equal(map.package, '@envsemble/envui');
  assert.match(map.version, /^1\.0\.0/);
});

test('every export maps an old name to a different new name or Namespace.Part', () => {
  for (const [entry, names] of entriesOf(map.exports)) {
    assert.match(entry, /^@envsemble\/envui(\/[a-z-]+)?$/);
    const renamed = entriesOf(names);
    assert.ok(renamed.length > 0, entry);
    const old = new Set(renamed.map(([from]) => from));
    for (const [from, to] of renamed) {
      assert.match(from, name, `${entry} ${from}`);
      assert.equal(typeof to, 'string', `${entry} ${from}`);
      assert.ok(name.test(to) || part.test(to), `${entry} ${from}: ${to}`);
      assert.notEqual(from, to, `${entry} ${from}`);
      if (name.test(to)) assert.ok(!old.has(to), `${entry} ${from}: ${to} is renamed again`);
    }
  }
});

test('every split names its prop and maps each value to a part', () => {
  for (const [entry, names] of entriesOf(map.split)) {
    for (const [from, rule] of entriesOf(names)) {
      assert.match(from, name, `${entry} ${from}`);
      assert.match(rule.prop, name, `${entry} ${from}`);
      const values = entriesOf(rule.values);
      assert.ok(values.length > 1, `${entry} ${from}`);
      for (const [value, to] of values) assert.match(to, part, `${entry} ${from} ${value}`);
      assert.ok(!Object.hasOwn(map.exports[entry] ?? {}, from), `${from} is also renamed`);
    }
  }
});

test('every removed export says what to use instead', () => {
  for (const [entry, names] of entriesOf(map.removed)) {
    for (const [from, rule] of entriesOf(names)) {
      assert.match(from, name, `${entry} ${from}`);
      assert.equal(typeof rule.use, 'string', `${entry} ${from}`);
      assert.ok(rule.use.length > 20, `${entry} ${from}`);
      if (rule.value !== undefined) assert.equal(typeof rule.value, 'string', `${entry} ${from}`);
      assert.ok(!Object.hasOwn(map.exports[entry] ?? {}, from), `${from} is also renamed`);
    }
  }
  assert.equal(
    map.removed['@envsemble/envui/theme-bootstrap'].defaultThemeStorageKey.value,
    'env-theme',
  );
});

test('every class entry renames an env- class to another, and no rename chains', () => {
  const { classes } = loadMap();
  for (const [from, to] of entriesOf(map.classes)) {
    assert.match(from, className, from);
    assert.match(to, className, `${from}: ${to}`);
    assert.notEqual(from, to, from);
    assert.equal(renameClass(from, classes), to, from);
    assert.equal(renameClass(to, classes), to, `${from}: ${to} is renamed again`);
    assert.equal(renameClass(`${to}-part`, classes), `${to}-part`, `${from}: ${to}-part`);
  }
});

test('every docs entry maps a page slug to another', () => {
  for (const [from, to] of entriesOf(map.docs)) {
    assert.match(from, /^[a-z0-9]+(-[a-z0-9]+)*$/, from);
    assert.match(to, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${from}: ${to}`);
    assert.notEqual(from, to, from);
  }
});

test('validateMap reports malformed maps', () => {
  const problems = (value) => validateMap(value).join('\n');
  assert.match(problems([]), /JSON object/);
  assert.match(problems({ exports: { x: { Input: 'Input' } } }), /maps to itself/);
  assert.match(problems({ exports: { x: { Input: 'Text Field' } } }), /Namespace\.Part/);
  assert.match(problems({ exports: { x: { A: 'B', B: 'C' } } }), /itself renamed/);
  assert.match(problems({ split: { x: { Link: { prop: 'direction' } } } }), /needs "values"/);
  assert.match(
    problems({ split: { x: { Link: { prop: 'direction', values: { next: 'Next' } } } } }),
    /Namespace\.Part/,
  );
  const props = (rule) => problems({ props: { x: { Field: { className: rule } } } });
  assert.equal(props({ report: "Field's className now goes to the root element." }), '');
  assert.match(props({}), /needs a "report"/);
  assert.match(props({ report: 'Moved.', current: ['a'] }), /report-only rule/);
  assert.match(props({ report: 'Moved.', values: {} }), /needs "values"/);
  assert.match(problems({ removed: { x: { Bar: {} } } }), /"use" hint/);
  assert.match(
    problems({ exports: { x: { A: 'B' } }, removed: { x: { A: { use: 'C' } } } }),
    /both/,
  );
  assert.match(problems({ classes: { 'env-a': 'Env-B' } }), /env- class name/);
  assert.match(problems({ classes: { 'env-a': 'env-b', 'env-b': 'env-c' } }), /renames again/);
  assert.match(problems({ docs: { a: 'a' } }), /maps to itself/);
  assert.match(problems({ classesWithin: { 'env-a': { 'env-b': 'B' } } }), /env- class name/);
  assert.match(
    problems({ classes: { 'env-c': 'env-d' }, classesWithin: { 'env-a': { 'env-b': 'env-c' } } }),
    /classes renames again/,
  );
  assert.match(problems({ classReports: { 'env-a': {} } }), /needs a "report"/);
  assert.match(
    problems({ classes: { 'env-a': 'env-b' }, classReports: { 'env-a': { report: 'Use x.' } } }),
    /also renamed/,
  );
  assert.match(
    problems({
      classes: { 'env-a': 'env-b' },
      classReports: { 'env-c': { within: 'env-a', report: 'Use x.' } },
    }),
    /1\.0 names/,
  );
});

test('a reported class is kept by the class renames that a shorter entry would make', () => {
  const { classes, classReports } = loadMap();
  assert.equal(
    renameClass('env-organization-menu-radio-dot', classes),
    'env-organization-menu-radio-dot',
  );
  assert.equal(
    renameClass('env-organization-menu-option', classes),
    'env-organization-switcher-option',
  );
  assert.ok(classReports.some((rule) => rule.within === 'env-document-tabs-tab'));
});

test('a class inside an ancestor takes its own name in the ancestor selector', () => {
  const { classesWithin } = loadMap();
  assert.deepEqual(classesWithin, [
    { ancestor: 'env-diff-count', from: 'env-counter-label', to: 'env-diff-stat-label' },
    { ancestor: 'env-combobox', from: 'env-dropdown-options', to: 'env-combobox-popup' },
    { ancestor: 'env-combobox', from: 'env-dropdown-list', to: 'env-combobox-list' },
  ]);
});

test('loadMap reports a map it cannot read or that is malformed', () => {
  const directory = mkdtempSync(join(tmpdir(), 'envui-codemods-map-'));
  try {
    assert.throws(() => loadMap(join(directory, 'missing.json')), /Cannot read the rename map/);
    const malformed = join(directory, 'malformed.json');
    writeFileSync(malformed, JSON.stringify({ classes: { 'env-a': 'env-a' } }));
    assert.throws(() => loadMap(malformed), /malformed:\n- classes: env-a maps to itself/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('readMap merges a folder of fragments, one folder per section', () => {
  const directory = mkdtempSync(join(tmpdir(), 'envui-codemods-folder-'));
  const write = (file, value) => {
    mkdirSync(join(directory, dirname(file)), { recursive: true });
    writeFileSync(join(directory, file), JSON.stringify(value));
  };
  try {
    write('map.json', { version: '1.0.0', sections: { props: 'Props.', classes: 'Classes.' } });
    write('props/Button.json', {
      $comment: 'A fragment may say what it covers.',
      '@envsemble/envui': { Button: { variant: { report: 'r', values: { a: {} } } } },
    });
    write('props/Text.json', {
      '@envsemble/envui': { Text: { tone: { report: 'r', values: { a: {} } } } },
    });
    write('classes/Button.json', { 'env-a': 'env-b' });
    // An empty fragment holds a family's place in a section before it has entries.
    write('props/Card.json', { '@envsemble/envui': {} });
    write('classes/Card.json', {});
    assert.deepEqual(readMap(directory), {
      version: '1.0.0',
      props: {
        $comment: 'Props.',
        '@envsemble/envui': {
          Button: { variant: { report: 'r', values: { a: {} } } },
          Text: { tone: { report: 'r', values: { a: {} } } },
        },
      },
      classes: { $comment: 'Classes.', 'env-a': 'env-b' },
    });
    assert.deepEqual(loadMap(directory).classes, [{ from: 'env-a', to: 'env-b' }]);
    // Two fragments may not set the same name, and a folder must be a section.
    write('classes/Other.json', { 'env-a': 'env-c' });
    assert.throws(
      () => readMap(directory),
      /sets classes > env-a in both classes\/Button\.json and classes\/Other\.json/,
    );
    rmSync(join(directory, 'classes/Other.json'));
    write('colours/Button.json', {});
    assert.throws(() => readMap(directory), /has a folder colours, which is no section/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the bundled map is a folder whose fragments each hold one family of one section', () => {
  for (const fragment of mapFragments()) {
    const [section, file] = fragment.split('/');
    assert.ok(mapSections.includes(section), fragment);
    assert.match(file, /^[A-Z][A-Za-z]*\.json$/, fragment);
  }
});

test('loadMap lists the namespaces each entry point has in 1.0', () => {
  const library = loadMap().entries.get('@envsemble/envui');
  const targets = [
    ...entriesOf(map.exports['@envsemble/envui']).map(([, to]) => to),
    ...entriesOf(map.split['@envsemble/envui']).flatMap(([, rule]) => Object.values(rule.values)),
  ];
  const namespaces = new Set(
    targets.filter((to) => to.includes('.')).map((to) => to.split('.')[0]),
  );
  assert.deepEqual([...library.namespaces].sort(), [...namespaces].sort());
  for (const namespace of ['Menu', 'Pager', 'Toast']) assert.ok(namespaces.has(namespace));
  assert.deepEqual(library.renames.get('MenuItem'), {
    to: 'Menu.Item',
    namespace: 'Menu',
    part: 'Item',
  });
  assert.deepEqual(library.renames.get('Input'), { to: 'TextField' });
});
