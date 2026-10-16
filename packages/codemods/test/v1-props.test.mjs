import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1Props from '../src/transforms/v1-props.mjs';
import { encodings, fixtures, map, packageDirectory, runTransform } from './helpers.mjs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const props = map.props['@envsemble/envui'];
const report = (component, prop, value) => {
  const rule = props[component][prop];
  return value === undefined ? rule.report : rule.values[value].report;
};

/** The fixtures that run with a map of the tests' own, for sections the v1 map has no entries in. */
const maps = { 'calls.tsx': join(packageDirectory, 'test/maps/calls.json') };
const callsMap = JSON.parse(readFileSync(maps['calls.tsx'], 'utf8')).calls['@envsemble/envui'];

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  'calls.tsx': [
    `line 10: useToast().show takes an object the codemod can't read: ${callsMap['useToast().show'].variant.report} ${callsMap['useToast().show'].placement.report}`,
  ],
  'emphasis.tsx': [
    `line 14: Button's variant has a value the codemod can't move: ${report('Button', 'variant')}`,
    `line 20: Text's tone is emphasis now, with a value the codemod can't check: ${report('Text', 'tone')}`,
  ],
  'density.tsx': [
    `line 5: Surface's density: ${report('Surface', 'density', 'compact')}`,
    `line 10: Table.Root's density has a value the codemod can't move: ${report('Table.Root', 'density')}`,
  ],
  'fields.tsx': [
    `line 7: TextField's compact: ${report('TextField', 'compact', 'true')}`,
    `line 8: TextField's compact: ${report('TextField', 'compact', 'true')}`,
    `line 9: TextField's compact: ${report('TextField', 'compact', 'false')}`,
    `line 12: Combobox's density: ${report('Combobox', 'density', 'standard')}`,
  ],
};

for (const fixture of fixtures('v1-props')) {
  test(`v1-props: ${fixture.name}`, () => {
    const options = maps[fixture.name] ? { map: maps[fixture.name] } : {};
    const result = runTransform(v1Props, fixture.path, fixture.input, options);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
    // A second run changes nothing more, and reports only the values it could not move before.
    const again = runTransform(v1Props, fixture.path, result.output, options);
    assert.equal(again.output, result.output);
    assert.deepEqual(
      again.reports,
      result.reports.filter(
        (report) => report.includes("can't move") || report.includes("can't read"),
      ),
    );
  });
}

test('v1-props reads calls from a map folder, as the bundled map stores them', () => {
  const fixture = fixtures('v1-props').find(({ name }) => name === 'calls.tsx');
  const fromFile = runTransform(v1Props, fixture.path, fixture.input, { map: maps['calls.tsx'] });
  const fromFolder = runTransform(v1Props, fixture.path, fixture.input, {
    map: join(packageDirectory, 'test/maps/calls-folder'),
  });
  assert.equal(fromFolder.output, fixture.output);
  assert.deepEqual(fromFolder.reports, fromFile.reports);
});

test('v1-props keeps line endings and a byte order mark', () => {
  const fixture = fixtures('v1-props').find(({ name }) => name === 'density.tsx');
  for (const [name, encode] of encodings) {
    const result = runTransform(v1Props, fixture.path, encode(fixture.input));
    assert.equal(result.output, encode(fixture.output), name);
  }
});

test('v1-props leaves files without envUI imports alone', () => {
  const source = 'import { Select } from \'other\';\n<Select density="compact" />;\n';
  assert.equal(runTransform(v1Props, 'other.tsx', source).skipped, true);
});
