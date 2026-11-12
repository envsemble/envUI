// The catalogue's data from the repository: the release notes, which the Docs' Changelog page
// reads when the site builds, and the outlines the skeletons of the parts that load with a page are
// drawn from.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  markdownShape,
  readChangelogOutline,
  readExampleLines,
  readTokenOutline,
} from '../../scripts/site/PartOutlines.ts';
import {
  inlinePieces,
  parseReleaseNotes,
  readReleaseNotes,
  releaseNotesProblems,
} from '../../scripts/site/ReleaseNotes.ts';
import { join } from 'node:path';
import {
  libraryChangelogFile,
  repositoryRoot,
  tokensDataFile,
} from '../../scripts/RepositoryPaths.ts';

test('the release notes hold: newest first, five highlights at most, links to sections of the Docs', () => {
  const releases = readReleaseNotes();
  assert.ok(releases.length >= 1);
  assert.ok(releases.every((release) => release.highlights.length <= 5));
});

test('the release notes checks find what is wrong', () => {
  const releases = parseReleaseNotes(`## 0.1.0 — 2026-10-10

- One.

### Breaking changes

- No link.
- [A missing section](/docs/migration#nowhere).

## 0.2.0 — Upcoming

- Two.
`);
  const problems = releaseNotesProblems(releases, { '/docs/migration': new Set(['tokens']) });
  assert.deepEqual(problems, [
    'Release 0.1.0 comes before 0.2.0; list the newest first.',
    'Release 0.1.0 has a breaking change without a link.',
    "Release 0.1.0 links to /docs/migration#nowhere, a section that page doesn't have.",
    'Release 0.2.0 is upcoming but not the newest.',
  ]);
  assert.deepEqual(inlinePieces('Use [`Row`](/docs/migration#tokens) now'), [
    { kind: 'text', text: 'Use ' },
    { kind: 'link', href: '/docs/migration#tokens', children: [{ kind: 'code', text: 'Row' }] },
    { kind: 'text', text: ' now' },
  ]);
});

test("the changelog's outline heads each release as the changelog does, over the shape of its text", () => {
  const changelog = readFileSync(libraryChangelogFile, 'utf8');
  const releases = readChangelogOutline();
  // The page shows the changelog a level lower, so each release heading is one of the contents'.
  assert.deepEqual(
    releases.map(({ heading }) => heading),
    [...changelog.matchAll(/^## (.+)$/gm)].map(([, text]) => `### ${text.trim()}`),
  );
  assert.equal(
    markdownShape(
      [
        'Some [linked](https://example.com) `code`.',
        '',
        '#### Added',
        '',
        '- One item',
        '  - Nested',
      ].join('\n'),
    ),
    ['~17', '', '#### Added', '', '- ~8', '  - ~6'].join('\n'),
  );
});

test('the token outline lists every token once, in its group, and each example its lines', () => {
  const { tokens } = JSON.parse(readFileSync(tokensDataFile, 'utf8'));
  const rows = readTokenOutline().flatMap((group) => group.rows.map(([name]) => name));
  assert.deepEqual(
    rows.toSorted(),
    tokens.map((token: { cssVariable: string }) => token.cssVariable).toSorted(),
  );
  const lines = readExampleLines();
  const source = readFileSync(
    join(repositoryRoot, 'apps/site/src/examples/loading/CardsLoading.tsx'),
    'utf8',
  );
  assert.equal(lines['loading/CardsLoading'], source.trimEnd().split('\n').length);
});
