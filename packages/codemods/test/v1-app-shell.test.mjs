import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1AppShell from '../src/transforms/v1-app-shell.mjs';
import * as v1Structure from '../src/transforms/v1-structure.mjs';
import { encodings, fixtures, map, runTransform } from './helpers.mjs';

const appShell = map.structure['@envsemble/envui']['AppShell.Root'];

for (const fixture of fixtures('v1-app-shell')) {
  test(`v1-app-shell: ${fixture.name}`, () => {
    const result = runTransform(v1AppShell, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, fixture.reports);
    // A second run changes nothing more, and reports only what it could not rewrite.
    const again = runTransform(v1AppShell, fixture.path, result.output);
    assert.equal(again.output, result.output);
    assert.deepEqual(
      again.reports,
      result.reports.filter(
        (report) => report.endsWith(appShell.report) || report.includes('closeNarrowSidebar is'),
      ),
    );
  });
}

test('v1-app-shell keeps line endings and a byte order mark', () => {
  const [fixture] = fixtures('v1-app-shell').filter(({ name }) => name === 'split.tsx');
  // Tab indentation is left out: recast reprints the import list it adds to with spaces.
  for (const [how, encode] of encodings.filter(([name]) => name !== 'tab indentation')) {
    const result = runTransform(v1AppShell, fixture.path, encode(fixture.input));
    assert.equal(result.output, encode(fixture.output), how);
  }
});

test('v1-structure leaves the entries v1-app-shell rewrites to it', () => {
  const [fixture] = fixtures('v1-app-shell').filter(({ name }) => name === 'split.tsx');
  const result = runTransform(v1Structure, fixture.path, fixture.input);
  assert.equal(result.skipped, true);
  assert.deepEqual(result.reports, []);
});
