import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1Render from '../src/transforms/v1-render.mjs';
import { encodings, fixtures, runTransform } from './helpers.mjs';

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  'as.tsx': [
    "line 11: Text's as is gone in 1.0: pass the element to render instead, such as render={<h2 />}.",
    "line 12: Text's as is gone in 1.0, and the element already sets render: remove it.",
  ],
  'spread.tsx': [
    'line 5: Text\'s as="h2" is render={<h2 />} now, and the element spreads props too: check they set neither as nor render.',
  ],
};

for (const fixture of fixtures('v1-render')) {
  test(`v1-render: ${fixture.name}`, () => {
    const result = runTransform(v1Render, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
    // A second run changes nothing more, and reports again what it could not move.
    const again = runTransform(v1Render, fixture.path, result.output);
    assert.equal(again.output, result.output);
    assert.deepEqual(
      again.reports,
      result.reports.filter((report) => !report.includes(' now, ')),
    );
  });
}

test('v1-render keeps line endings and a byte order mark', () => {
  const [fixture] = fixtures('v1-render');
  for (const [name, encode] of encodings) {
    const result = runTransform(v1Render, fixture.path, encode(fixture.input));
    assert.equal(result.output, encode(fixture.output), name);
  }
});

test('v1-render leaves files without envUI imports alone', () => {
  const source = 'import { Text } from \'other\';\n<Text as="h2" />;\n';
  assert.equal(runTransform(v1Render, 'other.tsx', source).skipped, true);
});
