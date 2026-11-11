import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { posix } from 'node:path';
import { test } from 'node:test';
import { chooseJobs, jobRules } from '../../scripts/test/ChooseJobs.ts';

const jobs = (...paths) => chooseJobs(paths).jobs;

test('a site change skips the library browser tests, and a library change runs the smoke too', () => {
  assert.deepEqual(jobs('apps/site/src/App.tsx'), { library: false, site: true });
  assert.deepEqual(jobs('docs/components/button.md'), { library: false, site: true });
  assert.deepEqual(jobs('packages/ui/src/components/button/Button.tsx'), {
    library: true,
    site: true,
  });
  assert.deepEqual(jobs('tests/fixture/Button.fixture.tsx'), { library: true, site: true });
  assert.deepEqual(jobs('packages/ui/CHANGELOG.md'), { library: false, site: true });
});

test('guides, unit tests and lint configuration run no browser job', () => {
  assert.deepEqual(jobs('AGENTS.md', 'contributing/pages.md', 'tests/library/Corners.test.mjs'), {
    library: false,
    site: false,
  });
  assert.deepEqual(jobs('packages/eslint-plugin/src/index.js', 'eslint.config.mjs'), {
    library: false,
    site: false,
  });
});

test('tooling, a path no rule names and a full run run everything', () => {
  const everything = { library: true, site: true };
  assert.deepEqual(jobs('package-lock.json'), everything);
  assert.deepEqual(jobs('.github/workflows/ci.yml'), everything);
  assert.deepEqual(jobs('scripts/test/ServeBuild.ts'), everything);
  assert.deepEqual(jobs('a-new-folder/file.ts'), everything);
  assert.match(chooseJobs(['a-new-folder/file.ts']).reasons.join('\n'), /no rule names it/);
  assert.deepEqual(chooseJobs(undefined).jobs, everything);
  assert.deepEqual(jobs(), { library: false, site: false });
});

test('every tracked file is placed by a rule, and every rule places a tracked file', () => {
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const unplaced = files.filter(
    (file) => !jobRules.some((rule) => rule.paths.some((glob) => posix.matchesGlob(file, glob))),
  );
  assert.deepEqual(unplaced, []);
  const unused = jobRules
    .flatMap((rule) => rule.paths)
    .filter((glob) => !files.some((file) => posix.matchesGlob(file, glob)));
  assert.deepEqual(unused, []);
});
