import assert from 'node:assert/strict';
import { posix } from 'node:path';
import { test } from 'node:test';
import { compileGlob, compileGlobs } from '../../scripts/test/Globs.ts';

const globs = [
  'packages/ui/**',
  'packages/ui/src/**/*.{ts,tsx}',
  '**/package.json',
  'scripts/build/LintPackage*.js',
  'tests/{library,site}/**',
  'apps/site/*.{html,ts,json}',
  '.github/**',
  'scripts/*.ts',
];
const paths = [
  'packages/ui/src/actions/Button.tsx',
  'packages/ui/src/index.ts',
  'packages/ui/src/styles/Button.css',
  'packages/ui/.hidden',
  'packages/ui/package.json',
  'package.json',
  'scripts/build/LintPackageTokens.js',
  'scripts/build/LintPackage.x.js',
  'tests/library/rules/Layers.test.ts',
  'tests/sites/Other.test.ts',
  'apps/site/index.html',
  'apps/site/src/main.tsx',
  '.github/workflows/ci.yml',
  'scripts/Git.ts',
  'scripts/test/Check.ts',
  'docs/.draft.md',
];

test('a compiled glob matches what path.matchesGlob matches, dot segments included', () => {
  for (const glob of globs) {
    const matches = compileGlob(glob);
    for (const path of paths)
      assert.equal(matches(path), posix.matchesGlob(path, glob), `${glob} on ${path}`);
  }
});

test('compiled globs match a path any of them matches', () => {
  const matches = compileGlobs(['scripts/*.ts', 'docs/**']);
  assert.equal(matches('scripts/Git.ts'), true);
  assert.equal(matches('docs/setup.md'), true);
  assert.equal(matches('scripts/test/Check.ts'), false);
});
