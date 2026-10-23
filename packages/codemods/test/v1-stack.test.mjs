import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1Stack from '../src/transforms/v1-stack.mjs';
import { encodings, fixtures, runTransform } from './helpers.mjs';

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  // A local type takes the name Column, so the primitive is imported under an alias; a spread may
  // set direction, a column's wrap goes, a direction that is an expression stays, and so does a use
  // of Stack as a value, which keeps the import.
  'reports.tsx': [
    'line 1: StackProps is gone in 1.0: use RowProps or ColumnProps.',
    'line 8: the file uses the name Column for something else, so Column is imported as EnvColumn.',
    'line 8: Stack is a Column now, and the element spreads props too: check they set no direction, and no wrap on a Column.',
    'line 9: Stack is gone in 1.0, and its direction is an expression: write a Row for direction="row" and a Column for a column.',
    'line 10: a Column has no wrap, which a column of a Stack never needed: it goes.',
    'line 15: Stack is gone in 1.0: use Row or Column.',
  ],
};

/** The reports a second run gives: what stays as it is, reported again. */
const reportsAgain = {
  'reports.tsx': [
    'line 1: StackProps is gone in 1.0: use RowProps or ColumnProps.',
    'line 9: Stack is gone in 1.0, and its direction is an expression: write a Row for direction="row" and a Column for a column.',
    'line 15: Stack is gone in 1.0: use Row or Column.',
  ],
};

for (const fixture of fixtures('v1-stack')) {
  test(`v1-stack: ${fixture.name}`, () => {
    const result = runTransform(v1Stack, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
    // A second run changes nothing more, and reports again what it could not move.
    const again = runTransform(v1Stack, fixture.path, result.output);
    assert.equal(again.output, result.output);
    assert.deepEqual(again.reports, reportsAgain[fixture.name] ?? []);
  });
}

test('v1-stack keeps line endings, tabs and a byte order mark', () => {
  for (const fixture of fixtures('v1-stack').filter(({ name }) => name !== 'reports.tsx'))
    for (const [name, encode] of encodings) {
      const result = runTransform(v1Stack, fixture.path, encode(fixture.input));
      assert.equal(result.output, encode(fixture.output), `${fixture.name}, ${name}`);
    }
});

test('v1-stack leaves files without envUI imports alone', () => {
  const source = 'import { Stack } from \'other\';\n<Stack direction="row" />;\n';
  assert.equal(runTransform(v1Stack, 'other.tsx', source).skipped, true);
});
