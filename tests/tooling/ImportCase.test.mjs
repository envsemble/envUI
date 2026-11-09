// A relative import names its file with the file's own case. Windows and macOS find a file whose
// name is written in another case, such as ImportSource.mjs with a lowercase first letter, and
// Linux doesn't, so a rename that misses an import passes locally and fails on CI. The tracked
// files' paths, as git records them, are the truth on every system.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const tracked = execFileSync('git', ['ls-files'], { cwd: repositoryRoot, encoding: 'utf8' })
  .trim()
  .split('\n');
const exactly = new Set(tracked);
const byLowerCase = new Map(tracked.map((path) => [path.toLowerCase(), path]));

/** What an import without its extension may name, as the bundlers and TypeScript resolve it. */
const endings = [
  '',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.jsx',
  '.css',
  '/index.ts',
  '/index.tsx',
  '/index.js',
];

/** Generated from pinned inputs: thousands of files that import only their own neighbours. */
const skipped = 'packages/ui/src/icons/';

test('every relative import names its file in the case git records', () => {
  const wrong = [];
  for (const file of tracked) {
    if (!/\.(m?js|jsx|tsx?|css)$/.test(file) || file.startsWith(skipped)) continue;
    const text = readFileSync(join(repositoryRoot, file), 'utf8');
    for (const [, specifier] of text.matchAll(
      /(?:from|import|@import)\s*\(?\s*['"](\.{1,2}\/[^'"?]+)/g,
    )) {
      const base = posix.normalize(posix.join(posix.dirname(file), specifier));
      const candidates = endings.flatMap((ending) => [
        base + ending,
        base.replace(/\.js$/, '') + ending,
      ]);
      if (candidates.some((path) => exactly.has(path))) continue;
      const other = candidates.map((path) => byLowerCase.get(path.toLowerCase())).find(Boolean);
      if (other) wrong.push(`${file}: '${specifier}' is ${other}`);
    }
  }
  assert.deepEqual(wrong, []);
});
