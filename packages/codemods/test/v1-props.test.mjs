import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1Props from '../src/transforms/v1-props.mjs';
import { encodings, fixtures, map, runTransform } from './helpers.mjs';

const props = map.props['@envsemble/envui'];
const report = (component, prop, value) => {
  const rule = props[component][prop];
  return value === undefined ? rule.report : rule.values[value].report;
};

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
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
    const result = runTransform(v1Props, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
    // A second run changes nothing more.
    assert.equal(runTransform(v1Props, fixture.path, result.output).output, result.output);
  });
}

test('v1-props keeps line endings and a byte order mark', () => {
  const [fixture] = fixtures('v1-props');
  for (const [name, encode] of encodings) {
    const result = runTransform(v1Props, fixture.path, encode(fixture.input));
    assert.equal(result.output, encode(fixture.output), name);
  }
});

test('v1-props leaves files without envUI imports alone', () => {
  const source = 'import { Select } from \'other\';\n<Select density="compact" />;\n';
  assert.equal(runTransform(v1Props, 'other.tsx', source).skipped, true);
});
