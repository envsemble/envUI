import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/ValidateRelease.mjs', import.meta.url));
const { version } = JSON.parse(
  await readFile(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
);
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
