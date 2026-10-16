import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import * as v1Names from '../src/transforms/v1-names.mjs';
import { applyTransform, encodings, fixtures, map, runTransform } from './helpers.mjs';

const library = '@envsemble/envui';
const bootstrap = '@envsemble/envui/theme-bootstrap';
const use = (name, entry = library) => map.removed[entry][name].use;
const pager = 'use Pager.Previous or Pager.Next, which take no direction prop.';
const removedFrom = (line, names) =>
  names.map((name) => `line ${line}: ${name} is no longer exported by ${library}: ${use(name)}`);

const ambiguous = (line, action) =>
  `line ${line}: ${action}, so it stays as it is: useTheme() is { theme, contrast } in 1.0; where it is read as the color scheme, read its .theme.`;
const unfollowed = (line, how) =>
  `line ${line}: loads ${library} with ${how}, which the codemod does not follow: change the 0.x names used through it by hand, and read .theme from a useTheme() call read as the color scheme.`;

const expectError = (line, comment) =>
  `line ${line}: dropped // @ts-expect-error -- ${comment}, which expected an error from the 0.x names: TypeScript fails on a @ts-expect-error with no error below it.`;

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  'comments.tsx': [expectError(4, "the 0.x types lack the item's hint.")],
  'local-exports.tsx': [
    'line 3: exports Menu, which is the Menu namespace in 1.0; the old component is Menu.Root.',
    'line 3: exports MenuItem, which is Menu.Item in 1.0 and cannot be exported by its old name: export the Menu namespace or a constant instead.',
  ],
  'namespace-destructuring.tsx': [
    'line 5: destructures Root and Item from Menu, which is the Menu namespace in 1.0, and stays as it is; the 0.x component is Menu.Root.',
    'line 6: destructures Cell from ui.Table, which is the Table namespace in 1.0, and stays as it is; the 0.x component is ui.Table.Root.',
    'line 8: destructures Head from Table, which is the Table namespace in 1.0, and stays as it is; the 0.x component is Table.Root.',
  ],
  'namespace-import-destructuring.tsx': [
    'line 15: destructures Menu from ui, which is Menu.Root in 1.0: rename it by hand.',
    `line 15: destructures Toast from ui, which ${library} no longer exports: ${use('Toast')}`,
    'line 25: destructures Input from ui, which is TextField in 1.0: rename it by hand.',
  ],
  'namespace-import.tsx': [
    'line 8: destructures DirectionLinks from ui, which is Pager.Root in 1.0: rename it by hand.',
    'line 19: ui.DirectionLink has a dynamic, spread or missing direction and stays as it is: use ui.Pager.Previous or ui.Pager.Next, which take no direction prop.',
    `line 21: ui.LoadingBar is no longer exported by ${library}: ${use('LoadingBar')}`,
  ],
  'pager-dynamic.tsx': [
    `line 9: DirectionLink has a dynamic, spread or missing direction and stays as it is: ${pager}`,
    `line 11: DirectionLink has a dynamic, spread or missing direction and stays as it is: ${pager}`,
    `line 17: DirectionLink is used outside JSX and stays as it is: ${pager}`,
  ],
  're-exports.ts': [
    'line 2: re-exports MenuItem, which is Menu.Item in 1.0 and cannot be re-exported by its old name: re-export the Menu namespace instead.',
    'line 2: re-exports Menu, which is the Menu namespace in 1.0; the old component is Menu.Root.',
    'line 2: re-exports DirectionLink, which 1.0 splits into Pager.Previous and Pager.Next: re-export their namespace instead.',
    `line 2: re-exports LoadingBar, which ${library} no longer exports: ${use('LoadingBar')}`,
    'line 3: re-exports MenuItemProps, which is Menu.ItemProps in 1.0 and cannot be re-exported by its old name: re-export the Menu namespace instead.',
  ],
  'removed.tsx': [
    ...removedFrom(1, ['getInitials', 'LoadingBar', 'useLinkComponent', 'useSidebarCompact']),
    ...removedFrom(2, ['LoadingBarProps', 'MenuDensity', 'SurfaceDensity', 'ToastProps']),
  ],
  'shadowing-namespace.tsx': [
    'line 20: a local Menu shadows the import here: wrote EnvMenu.Item, with Menu also imported as EnvMenu.',
    'line 21: a local TextField shadows the import here: wrote EnvTextField, with TextField also imported as EnvTextField.',
    'line 23: a local Pager shadows the import here: wrote EnvPager.Next, with Pager also imported as EnvPager.',
    'line 41: a local Menu shadows the import here: wrote EnvMenu.ItemProps, with Menu also imported as EnvMenu.',
  ],
  'specifier-comments.tsx': [
    'line 7: dropped /* The body of the members table. */, which was on TableBody, removed from this import.',
    'line 8: dropped /* The old name. */, which was on Input, removed from this import.',
    expectError(10, 'not exported by the installed 1.0'),
    expectError(13, 'not exported by the installed 1.0'),
  ],
  'expect-error-unchanged.tsx': [
    'line 2: dropped // @ts-expect-error -- Sidebar is not exported by the installed version, which expected an error from the 0.x names or from Sidebar, which stays: TypeScript fails on a @ts-expect-error with no error below it, so put it back if Sidebar still has the error.',
  ],
  'literal-keys.tsx': [
    `line 5: ui.LoadingBar is no longer exported by ${library}: ${use('LoadingBar')}`,
    'line 6: ui[…] reads an export by a name computed at run time, which is not changed: if it can name an export that 1.0 renames, rename it by hand.',
    'line 7: destructures Notice from ui, which is Alert in 1.0: rename it by hand.',
  ],
  're-export-expect-error.ts': [
    expectError(2, 'not exported by the installed 0.x'),
    'line 4: dropped // @ts-expect-error -- not exported by the installed 0.x, which expected an error from the 0.x names or from Button, which stays: TypeScript fails on a @ts-expect-error with no error below it, so put it back if Button still has the error.',
  ],
  'theme-bootstrap-directive.ts': [
    'line 3: dropped // eslint-disable-next-line envui/no-renamed-exports -- until the 1.0 upgrade, which applied to the import that was removed.',
  ],
  'theme-bootstrap-export.ts': [
    `line 7: defaultThemeStorageKey is no longer exported by ${bootstrap}: ${use('defaultThemeStorageKey', bootstrap)}`,
    `line 8: re-exports defaultThemeStorageKey, which ${bootstrap} no longer exports: ${use('defaultThemeStorageKey', bootstrap)}`,
  ],
  'use-theme-ambiguous.tsx': [
    ambiguous(7, 'returns useTheme()'),
    ambiguous(10, 'returns useTheme()'),
    ambiguous(13, 'passes useTheme() as the value of <SchemeContext>'),
    ambiguous(18, 'passes t, which holds useTheme(), as the value of <SchemeContext.Provider>'),
    ambiguous(23, 'returns t, which holds useTheme()'),
  ],
  'use-theme-require.ts': [unfollowed(1, 'require()')],
  'use-theme-unfollowed.tsx': [
    'line 4: destructures useTheme from ui, whose call is { theme, contrast } in 1.0 rather than the color scheme: read .theme by hand where a call is read as the color scheme.',
    unfollowed(9, 'require()'),
    unfollowed(14, 'import()'),
  ],
  'toast-manual.tsx': [
    ...removedFrom(2, ['ToastProps']),
    `line 7: Toast is no longer exported as a component by ${library}: ${use('Toast')}`,
    `line 12: Toast is no longer exported as a component by ${library}: ${use('Toast')}`,
  ],
};

const cases = fixtures('v1-names');

test('every v1-names fixture with expected reports exists', () => {
  const names = new Set(cases.map(({ name }) => name));
  for (const name of Object.keys(reports)) assert.ok(names.has(name), name);
});

for (const fixture of cases) {
  test(`v1-names: ${fixture.name}`, () => {
    const result = runTransform(v1Names, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
  });

  test(`v1-names is idempotent: ${fixture.name}`, () => {
    assert.equal(runTransform(v1Names, fixture.path, fixture.output).output, fixture.output);
  });

  test(`v1-names through jscodeshift's applyTransform: ${fixture.name}`, () => {
    // applyTransform trims, and gives '' for a file the transform skips.
    const output = applyTransform(v1Names, {}, { path: fixture.path, source: fixture.input });
    assert.equal(output || fixture.input.trim(), fixture.output.trim());
  });

  // Files saved on Windows: CRLF line endings, a byte order mark, or both.
  for (const [variant, encode] of encodings)
    test(`v1-names with ${variant}: ${fixture.name}`, () => {
      const result = runTransform(v1Names, fixture.path, encode(fixture.input));
      assert.equal(result.output, encode(fixture.output));
    });
}

test('v1-names renames every export in the map', () => {
  for (const [from, to] of Object.entries(map.exports[library])) {
    if (from.startsWith('$')) continue;
    const [namespace, part] = to.split('.');
    const input = `import { ${from} } from '${library}';\n\nexport const value = ${from};\n`;
    const expected = `import { ${namespace} } from '${library}';\n\nexport const value = ${to};\n`;
    assert.equal(runTransform(v1Names, 'file.ts', input).output, expected, from);
    if (part) assert.equal(runTransform(v1Names, 'file.ts', expected).output, expected, from);
  }
});

test('v1-names turns each value of a split prop into its part', () => {
  for (const [from, rule] of Object.entries(map.split[library])) {
    if (from.startsWith('$')) continue;
    for (const [value, to] of Object.entries(rule.values)) {
      const input = `import { ${from} } from '${library}';\n\nexport const link = <${from} ${rule.prop}="${value}" href="/" />;\n`;
      const expected = `import { ${to.split('.')[0]} } from '${library}';\n\nexport const link = <${to} href="/" />;\n`;
      assert.equal(runTransform(v1Names, 'file.tsx', input).output, expected, value);
    }
  }
});

test('v1-names skips files that import nothing it renames', () => {
  for (const source of [
    "import { Menu } from '@envsemble/envui/icons/Menu';\n\nexport const icon = <Menu />;\n",
    "import { useState } from 'react';\n\nexport const state = useState;\n",
  ])
    assert.equal(runTransform(v1Names, 'icon.tsx', source).skipped, true, source);
});

test('v1-names reads another map through the map option', () => {
  const directory = mkdtempSync(join(tmpdir(), 'envui-codemods-map-'));
  try {
    const path = join(directory, 'map.json');
    writeFileSync(path, JSON.stringify({ exports: { [library]: { Notice: 'Alert' } } }));
    const input = `import { Input, Notice } from '${library}';\n\nexport const parts = [Input, Notice];\n`;
    assert.equal(
      runTransform(v1Names, 'file.ts', input, { map: path }).output,
      `import { Input, Alert } from '${library}';\n\nexport const parts = [Input, Alert];\n`,
    );
    const malformed = join(directory, 'malformed.json');
    writeFileSync(malformed, JSON.stringify({ exports: { [library]: { Notice: 'Notice' } } }));
    assert.throws(
      () => runTransform(v1Names, 'file.ts', input, { map: malformed }),
      /maps to itself/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
