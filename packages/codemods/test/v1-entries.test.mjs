import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1Entries from '../src/transforms/v1-entries.mjs';
import { encodings, fixtures, runTransform } from './helpers.mjs';

const moved = (name) =>
  `comes from @envsemble/envui/color in 1.0, whose libraries the application installs: import ${name} from there.`;

const reexported =
  "no longer re-exports ColorPicker, ColorPickerProps, ColorSwatch and ColorSwatchProps: they come from @envsemble/envui/color in 1.0, whose libraries the application installs. Re-export them from there too, such as export * from '@envsemble/envui/color'.";
const loaded =
  'has no ColorPicker and ColorSwatch in 1.0: load them from @envsemble/envui/color, whose libraries the application installs.';

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  // A namespace import can't be split: each use of a moved export is reported, once a line.
  'namespace.tsx': [
    `line 3: ui.ColorPickerProps ${moved('ColorPickerProps')}`,
    `line 6: ui.ColorPicker ${moved('ColorPicker')}`,
    `line 11: ui.ColorSwatch ${moved('ColorSwatch')}`,
  ],
  // A re-export of the whole entry point no longer carries the moved names.
  'barrel.tsx': [
    `line 2: export * from '@envsemble/envui' ${reexported}`,
    `line 3: export * as ui from '@envsemble/envui' ${reexported}`,
  ],
  // Nor does a module loaded at run time, in a file that names one of them.
  'dynamic.tsx': [
    `line 6: import('@envsemble/envui') ${loaded}`,
    `line 8: import('@envsemble/envui') ${loaded}`,
    `line 9: require('@envsemble/envui') ${loaded}`,
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
