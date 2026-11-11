import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isPublished, publish, releaseState } from '../../scripts/release/Publish.ts';
import { libraryPackageFile, repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const script = join(repositoryRoot, 'scripts/release/ValidateRelease.ts');
const { version } = JSON.parse(await readFile(libraryPackageFile, 'utf8'));
const validate = (...args) =>
  execFileSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
    env: { ...process.env, GITHUB_REF_NAME: `v${version}` },
  });

test('release notes contain only the released version', () => {
  const notes = validate('--release-notes');
  assert.ok(notes.trim().length > 0);
  assert.doesNotMatch(
    notes,
    /^## /m,
    'notes must not include a version heading or another version',
  );
  assert.doesNotMatch(notes, /^# Changelog/m);
});

test('a tag that does not match the package version is rejected', () => {
  assert.throws(() =>
    execFileSync(process.execPath, [script], {
      env: { ...process.env, GITHUB_REF_NAME: 'v0.0.0-mismatch' },
      stdio: 'pipe',
    }),
  );
});

/**
 * A GitHub and a registry that answer as the arguments say, recording each command: the release is
 * `released`, a `draft` or `missing`, and `published` lists the packages the registry has.
 */
function world({ release, published = [] }) {
  const calls = [];
  const run = (command, args) => {
    calls.push(`${command} ${args.join(' ')}`);
    if (command === 'gh' && args[1] === 'view')
      return release === 'missing'
        ? { status: 1, stdout: '', stderr: 'release not found' }
        : { status: 0, stdout: release === 'draft' ? 'true\n' : 'false\n', stderr: '' };
    if (command === 'npm' && args[0] === 'view')
      return published.includes(args[1].replace(/@[^@]+$/, ''))
        ? { status: 0, stdout: '1.0.0\n', stderr: '' }
        : { status: 1, stdout: '', stderr: 'npm error code E404' };
    return { status: 0, stdout: '', stderr: '' };
  };
  return { run, calls };
}

const prerelease = { version: '1.0.0-rc.1', prerelease: true, distTag: 'rc', notes: 'Notes.\n' };
const release = (state) =>
  publish({
    release: prerelease,
    sha: 'abc123',
    run: state.run,
    notesDirectory: mkdtempSync(join(tmpdir(), 'release-test-')),
  });

test('a released version publishes nothing', () => {
  const state = world({ release: 'released' });
  assert.deepEqual(release(state), []);
  assert.deepEqual(state.calls, ['gh release view v1.0.0-rc.1 --json isDraft --jq .isDraft']);
});

test('a missing release is drafted, its packages published under the dist-tag, then published', () => {
  const state = world({ release: 'missing' });
  assert.deepEqual(release(state), [
    '@envsemble/envui',
    '@envsemble/eslint-plugin-envui',
    '@envsemble/stylelint-config-envui',
  ]);
  const commands = state.calls.map((call) => call.split(' ').slice(0, 3).join(' '));
  assert.deepEqual(commands, [
    'gh release view',
    'gh release create',
    'npm view @envsemble/envui@1.0.0-rc.1',
    'npm publish --workspace',
    'npm view @envsemble/eslint-plugin-envui@1.0.0-rc.1',
    'npm publish --workspace',
    'npm view @envsemble/stylelint-config-envui@1.0.0-rc.1',
    'npm publish --workspace',
    'gh release edit',
  ]);
  assert.match(state.calls[1], /--draft --target abc123 .* --prerelease$/);
  assert.match(state.calls[3], /--tag rc$/);
});

test('a draft left by a failed run is replaced, and only what the registry lacks is published', () => {
  const state = world({ release: 'draft', published: ['@envsemble/envui'] });
  assert.deepEqual(release(state), [
    '@envsemble/eslint-plugin-envui',
    '@envsemble/stylelint-config-envui',
  ]);
  assert.equal(state.calls[1], 'gh release delete v1.0.0-rc.1 --yes');
});

test('an answer other than "not found" stops the release', () => {
  const failing = (command) => () =>
    command === 'gh'
      ? { status: 1, stdout: '', stderr: 'HTTP 502' }
      : { status: 0, stdout: '', stderr: '' };
  assert.throws(() => releaseState('v1.0.0', failing('gh')), /HTTP 502/);
  assert.throws(
    () =>
      isPublished('@envsemble/envui', '1.0.0', () => ({ status: 1, stdout: '', stderr: 'E401' })),
    /E401/,
  );
});
