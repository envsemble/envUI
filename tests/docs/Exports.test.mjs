// The record of the entry points' exports, docs/generated/exports.json: what counts as a change of
// the public API, and which changesets record it.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { changedExports } from '../../scripts/docs/GenerateExports.ts';

const changeset = (bump, text) => `---\n'@envsemble/envui': ${bump}\n---\n\n${text}\n`;
const before = { '@envsemble/envui': { Button: 'function', ButtonProps: 'interface' } };

test('an export that goes, or changes its kind, needs a major changeset that names it', () => {
  const after = { '@envsemble/envui': { ButtonProps: 'type' } };
  const labels = (changesets) =>
    changedExports(before, after, changesets).map(({ label, recorded }) => [label, recorded]);
  assert.deepEqual(labels([]), [
    ['@envsemble/envui: Button (function, gone)', false],
    ['@envsemble/envui: ButtonProps (interface, now type)', false],
  ]);
  assert.deepEqual(labels([changeset('minor', 'Removes `Button` and `ButtonProps`.')]), [
    ['@envsemble/envui: Button (function, gone)', false],
    ['@envsemble/envui: ButtonProps (interface, now type)', false],
  ]);
  // A name is named whole: ButtonProps doesn't name Button.
  assert.deepEqual(labels([changeset('major', 'ButtonProps is a type.')]), [
    ['@envsemble/envui: Button (function, gone)', false],
    ['@envsemble/envui: ButtonProps (interface, now type)', true],
  ]);
});

test('an added export needs a changeset of the library, and an unchanged record none', () => {
  const after = { '@envsemble/envui': { ...before['@envsemble/envui'], Chip: 'function' } };
  assert.deepEqual(changedExports(before, before), []);
  assert.deepEqual(changedExports(before, after), [
    { label: '@envsemble/envui: Chip (function, added)', recorded: false },
  ]);
  assert.equal(changedExports(before, after, [changeset('minor', 'A Chip.')])[0].recorded, true);
  const lintOnly = `---\n'@envsemble/eslint-plugin-envui': minor\n---\n\nA rule.\n`;
  assert.equal(changedExports(before, after, [lintOnly])[0].recorded, false);
});
