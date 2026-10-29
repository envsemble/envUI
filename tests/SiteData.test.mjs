// The catalogue's data from the repository: the release notes, which the Docs' Changelog page
// reads when the site builds.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  inlinePieces,
  parseReleaseNotes,
  readReleaseNotes,
  releaseNotesProblems,
} from '../scripts/site/ReleaseNotes.ts';

test('the release notes hold: newest first, five highlights at most, links to sections of the Docs', () => {
  const releases = readReleaseNotes();
  assert.ok(releases.length >= 4);
  assert.equal(releases.at(-1).version, '1.0.0-prerelease.0');
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
