import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix } from 'node:path';
import { test } from 'node:test';
import { burnInFiles, chooseJobs, jobRules } from '../../scripts/test/ChooseJobs.ts';
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

test('the burn-in repeats the browser test files a change adds or edits, and nothing else', () => {
  assert.deepEqual(
    burnInFiles([
      'tests/component/Menu.test.tsx',
      'tests/browser/site/SiteSmoke.spec.ts',
      'tests/browser/library/Hydration.spec.ts',
      'tests/component/Menu.test.tsx',
      // The component a test covers, its fixture and helpers, and the accessibility scan, which
      // CI's Chromium jobs leave to `npm run test:a11y`.
      'packages/ui/src/navigation/menu/Menu.tsx',
      'tests/fixture/Menu.fixture.tsx',
      'tests/component/support/Browser.ts',
      'tests/browser/support/Servers.ts',
      'tests/component/Accessibility.test.tsx',
      'tests/library/source/Menu.test.ts',
    ]),
    [
      'tests/browser/library/Hydration.spec.ts',
      'tests/browser/site/SiteSmoke.spec.ts',
      'tests/component/Menu.test.tsx',
    ],
  );
  assert.deepEqual(burnInFiles([]), []);
});

test('the choice prints a line for each job, whose job CI skips only when it says false', () => {
  const folder = mkdtempSync(join(tmpdir(), 'envui-jobs-'));
  const script = join(repositoryRoot, 'scripts/test/ChooseJobs.ts');
  const choose = (...args: string[]) =>
    Object.fromEntries(
      execFileSync(process.execPath, [script, ...args], { encoding: 'utf8', stdio: 'pipe' })
        .trim()
        .split('\n')
        .map((line) => line.split(/=(.*)/s, 2)),
    );
  try {
    const changed = join(folder, 'changed');
    const kept = join(folder, 'kept');
    writeFileSync(changed, 'tests/component/Menu.test.tsx\ntests/component/Tabs.test.tsx\n');
    writeFileSync(kept, 'tests/component/Menu.test.tsx\n');
    assert.deepEqual(choose('--paths', changed, '--kept', kept), {
      library: 'true',
      site: 'true',
      'burn-in': 'true',
      'burn-in-files': 'tests/component/Menu.test.tsx',
    });
    // A change that deletes its test file, and a full run, burn in nothing.
    writeFileSync(kept, '');
    assert.equal(choose('--paths', changed, '--kept', kept)['burn-in'], 'false');
    assert.deepEqual(choose('--full'), {
      library: 'true',
      site: 'true',
      'burn-in': 'false',
      'burn-in-files': '',
    });
    // Each boolean line names a job of the CI workflow that its CI job waits for.
    const workflow = readFileSync(join(repositoryRoot, '.github/workflows/ci.yml'), 'utf8');
    const needs = /^ {4}needs: \[(.*)\]$/m.exec(workflow.slice(workflow.indexOf('\n  ci:')))?.[1];
    for (const [job, value] of Object.entries(choose('--full')))
      if (value === 'true' || value === 'false') {
        assert.match(workflow, new RegExp(`^  ${job}:$`, 'm'), `ci.yml has no job ${job}`);
        assert.ok(needs?.split(', ').includes(job), `CI's needs leave out ${job}`);
      }
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
