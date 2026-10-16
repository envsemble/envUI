import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latestPatchPerMinor } from '../scripts/AssembleSiteVersions.mjs';

const release = (tag_name, { assets = ['envUI.html'], ...flags } = {}) => ({
  tag_name,
  draft: false,
  prerelease: false,
  published_at: '2026-10-15T17:03:00Z',
  assets: assets.map((name, id) => ({ id, name, size: 1 })),
  ...flags,
});

test('the hosted archive keeps the newest patch of each released minor, newest first', (t) => {
  t.mock.method(console, 'warn', () => {});
  const chosen = latestPatchPerMinor([
    release('v0.6.1'),
    release('v0.7.0'),
    release('v0.6.2', { assets: ['notes.txt'] }),
    release('v0.6.0'),
    release('v1.0.0-next.1', { prerelease: true }),
    release('v0.8.0', { draft: true }),
    release('v1.0.0', { prerelease: true }),
    release('nightly'),
    release('v1.10.0'),
    release('v1.9.3'),
  ]);
  assert.deepEqual(
    chosen.map(({ version, path }) => `${version} ${path}`),
    ['1.10.0 /v1.10/', '1.9.3 /v1.9/', '0.7.0 /v0.7/', '0.6.1 /v0.6/'],
  );
});
