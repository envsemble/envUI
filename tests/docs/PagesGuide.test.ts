import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { exampleFields, exampleRoles, pageSections } from '../../scripts/docs/PageStructure.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const guide = readFileSync(`${repositoryRoot}/contributing/pages.md`, 'utf8');
const lineStarting = (start: string) => {
  const line = guide.split(/\r?\n/).find((each) => each.startsWith(start));
  assert.ok(line, `contributing/pages.md has no line starting ${start}`);
  return line;
};
const codeSpans = (text: string) => [...text.matchAll(/`([^`]+)`/g)].map(([, code]) => code!);

test("the guide's sections table follows the page build's sections and their order", () => {
  const rows = guide
    .split(/\r?\n/)
    .filter((line) => /^\| [A-Z]/.test(line) && !line.startsWith('| Section'))
    .map((line) => line.split('|')[1]!.trim());
  const titles = pageSections.map((section) => section.title);
  const positions = rows.map((row) => titles.indexOf(row));
  assert.ok(!positions.includes(-1), `${rows.join(', ')}: a row is not a section of the build`);
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
    'the rows keep the order of pageSections in scripts/docs/PageStructure.ts',
  );
});

test("the guide names every example role, and every field that frames an overview's entry", () => {
  assert.deepEqual(codeSpans(lineStarting('- **Roles:**')).sort(), [...exampleRoles].sort());
  const framing = codeSpans(lineStarting("- An overview's entry takes its framing:"))
    .filter((code) => code.includes(':'))
    .map((code) => code.split(':')[0]);
  assert.deepEqual(
    framing.sort(),
    exampleFields.filter((field) => field !== 'role' && field !== 'caption').sort(),
  );
});
