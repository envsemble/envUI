import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1Entries from '../src/transforms/v1-entries.mjs';
import { encodings, fixtures, runTransform } from './helpers.mjs';

const moved = (name) =>
  `comes from @envsemble/envui/color in 1.0, whose libraries the application installs: import ${name} from there.`;

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  // A namespace import can't be split: each use of a moved export is reported, once a line.
  'namespace.tsx': [
    `line 3: ui.ColorPickerProps ${moved('ColorPickerProps')}`,
    `line 6: ui.ColorPicker ${moved('ColorPicker')}`,
    `line 11: ui.ColorSwatch ${moved('ColorSwatch')}`,
  ],
};

for (const fixture of fixtures('v1-entries')) {
  test(`v1-entries: ${fixture.name}`, () => {
    const result = runTransform(v1Entries, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
    // A second run changes nothing more, and reports again what it could not move.
    const again = runTransform(v1Entries, fixture.path, result.output);
    assert.equal(again.output, result.output);
    assert.deepEqual(again.reports, result.reports);
  });
}

test('v1-entries keeps line endings and a byte order mark', () => {
  const fixture = fixtures('v1-entries').find(({ name }) => name === 'imports.tsx');
  for (const [name, encode] of encodings) {
    const result = runTransform(v1Entries, fixture.path, encode(fixture.input));
    assert.equal(result.output, encode(fixture.output), name);
  }
});

test('v1-entries leaves files without envUI imports alone', () => {
  const source = "import { ColorPicker } from 'other';\n<ColorPicker />;\n";
  assert.equal(runTransform(v1Entries, 'other.tsx', source).skipped, true);
});
