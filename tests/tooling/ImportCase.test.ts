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

const generatedIcons = 'packages/ui/src/icons/';

test('every relative import names its file in the case git records', () => {
  const wrong: string[] = [];
  for (const file of tracked) {
    if (!/\.(m?js|jsx|tsx?|css)$/.test(file) || file.startsWith(generatedIcons)) continue;
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
