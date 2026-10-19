import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import {
  assetMismatch,
  fitsWorker,
  latestPatchPerMinor,
} from '../scripts/AssembleSiteVersions.mjs';

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

test('a download must match the digest GitHub lists for the asset, or else its size', () => {
  const bytes = Buffer.from('<!doctype html>');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const asset = { size: bytes.length, digest: `sha256:${sha256}` };
  assert.equal(assetMismatch(bytes, asset), undefined);
  assert.equal(
    assetMismatch(bytes, { ...asset, digest: `sha256:${sha256.toUpperCase()}` }),
    undefined,
  );
  assert.match(
    assetMismatch(Buffer.from('<!doctype html!'), asset),
    new RegExp(`^bytes with SHA-256 [0-9a-f]{64}, not ${sha256},$`),
  );
  assert.equal(assetMismatch(bytes.subarray(1), asset), `14 of 15 bytes`);
  // Without a digest, or with another algorithm's, the size decides.
  assert.equal(assetMismatch(bytes, { size: bytes.length, digest: null }), undefined);
  assert.equal(assetMismatch(bytes, { size: bytes.length, digest: 'md5:00' }), undefined);
  assert.equal(assetMismatch(bytes.subarray(1), { size: bytes.length }), '14 of 15 bytes');
});

test('a version too large for a Worker is skipped locally and fails a production build', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const release = { tag_name: 'v0.9.0' };
  const MiB = 1024 * 1024;
  assert.equal(fitsWorker(release, { size: 25 * MiB }, true), true);
  assert.equal(fitsWorker(release, { size: 26 * MiB }, false), false);
  assert.match(warn.mock.calls[0].arguments[0], /^Skipped v0\.9\.0: its envUI\.html is 26\.0 MiB/);
  assert.throws(
    () => fitsWorker(release, { size: 26 * MiB }, true),
    /^Error: Cannot archive v0\.9\.0: its envUI\.html is 26\.0 MiB, over the 25 MiB a Worker serves\./,
  );
});
