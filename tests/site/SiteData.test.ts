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
  parseReleaseNotes,
  readReleaseNotes,
  releaseNotesProblems,
} from '../../scripts/site/ReleaseNotes.ts';
import { inlinePieces } from '../../apps/site/src/documentation/InlinePieces.ts';
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
- [A missing section](/docs/changelog#nowhere).

## 0.2.0 — Upcoming

- Two.
`);
  const problems = releaseNotesProblems(releases, { '/docs/changelog': new Set(['tokens']) });
  assert.deepEqual(problems, [
    'Release 0.1.0 comes before 0.2.0; list the newest first.',
    'Release 0.1.0 has a breaking change without a link.',
    "Release 0.1.0 links to /docs/changelog#nowhere, a section that page doesn't have.",
    'Release 0.2.0 is upcoming but not the newest.',
  ]);
  assert.deepEqual(inlinePieces('Use [`Row`](/docs/changelog#tokens) now'), [
    { kind: 'text', text: 'Use ' },
    { kind: 'link', href: '/docs/changelog#tokens', children: [{ kind: 'code', text: 'Row' }] },
    { kind: 'text', text: ' now' },
  ]);
});

test('inline text links only to the web and to the site, and shows any other link as its words', () => {
  const linkOf = (href: string) => inlinePieces(`See [the page](${href}).`)[1];
  assert.equal(linkOf('https://developer.mozilla.org/').kind, 'link');
  assert.equal(linkOf('/docs/changelog').kind, 'link');
  for (const href of ['javascript:alert(1)', 'data:text/html,hi', '//example.com', 'mailto:a@b'])
    assert.deepEqual(linkOf(href), { kind: 'text', text: 'the page' }, href);
});

test("the changelog's outline heads each release as the changelog does, over the shape of its text", () => {
  const changelog = readFileSync(libraryChangelogFile, 'utf8');
  const releases = readChangelogOutline();
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
    join(repositoryRoot, 'apps/site/src/examples/accordion/FrequentQuestions.tsx'),
    'utf8',
  );
  assert.equal(lines['accordion/FrequentQuestions'], source.trimEnd().split('\n').length);
});
