import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { posix } from 'node:path';
import { test } from 'node:test';
import { chooseJobs, jobRules } from '../../scripts/test/ChooseJobs.ts';
import { pathRules } from '../../scripts/test/TestScope.ts';
import { specPaths } from '../../scripts/test/FixtureImports.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const jobs = (...paths: string[]) => chooseJobs(paths).jobs;

test('a site change skips the library browser tests, and a library change runs the smoke too', () => {
  assert.deepEqual(jobs('apps/site/src/App.tsx'), { library: false, site: true });
  assert.deepEqual(jobs('docs/components/button.md'), { library: false, site: true });
  assert.deepEqual(jobs('packages/ui/src/components/button/Button.tsx'), {
    library: true,
    site: true,
  });
  assert.deepEqual(jobs('tests/fixture/Button.fixture.tsx'), { library: true, site: true });
  assert.deepEqual(jobs('tests/component/Menu.test.tsx'), { library: true, site: true });
  assert.deepEqual(jobs('packages/ui/CHANGELOG.md'), { library: false, site: true });
});

test('guides, unit tests and lint configuration run no browser job', () => {
  assert.deepEqual(
    jobs('AGENTS.md', 'contributing/pages.md', 'tests/library/rules/Corners.test.ts'),
    {
      library: false,
      site: false,
    },
  );
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

test('CI runs the browser job of every spec the check tiers run for a file', () => {
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const specs = specPaths(repositoryRoot);
  const jobOf = (spec: string) =>
    specs.get(spec)?.startsWith('tests/browser/site/') ? 'site' : 'library';
  const missed: string[] = [];
  for (const file of files) {
    // The specs pathRules gives the file; its name and its fixtures' imports choose specs only for
    // the library's files, the fixtures and the specs themselves.
    const named = file.startsWith('tests/browser/site/')
      ? ['SiteSmoke']
      : /^(?:packages\/ui\/src|tests\/(?:fixture|component|browser\/library))\//.test(file)
        ? ['Button']
        : [];
    const ruled = pathRules
      .filter((rule) => rule.paths.some((glob) => posix.matchesGlob(file, glob)))
      .flatMap((rule) => rule.specs ?? []);
    const chosen = jobs(file);
    for (const spec of [...named, ...ruled])
      if (spec !== 'LiveDevelopment' && !chosen[jobOf(spec)])
        missed.push(`${file} runs ${spec} in the check tiers, but CI skips the ${jobOf(spec)} job`);
  }
  assert.deepEqual(missed, []);
});
