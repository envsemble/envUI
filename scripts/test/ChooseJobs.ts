// Chooses the browser jobs CI runs for a change (.github/actions/choose-jobs): the library's browser
// tests and the site's smoke. The static checks, the build and the unit tests always run; they take
// a couple of minutes and read nearly every file, the guides included.
//
//   node scripts/test/ChooseJobs.ts [--paths <file>] [--full]
//
// --paths names a file listing the changed paths, one to a line; without it, or with --full,
// everything runs. It prints `library=` and `site=` lines for $GITHUB_OUTPUT, and why on stderr.
// A path no rule names runs everything, so a new folder is tested until a rule places it. It reads
// only Node's own modules: the job that runs it installs nothing.
import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { parseArgs } from 'node:util';

/** A job a path can run. */
export type Job = 'library' | 'site';

/**
 * What a changed path runs, the first rule whose glob matches it deciding; `all` runs every job.
 * The library's change runs the site's smoke too, as the site renders the library.
 */
export const jobRules: { paths: string[]; jobs: Job[] | 'all' }[] = [
  // The tooling every job runs on: its dependencies, the browser tests' configuration and servers,
  // the builds, and CI itself.
  {
    paths: [
      'package.json',
      'package-lock.json',
      '**/package.json',
      '**/tsconfig.json',
      'playwright.config.ts',
      'scripts/RepositoryPaths.ts',
      'scripts/test/**',
      'scripts/build/**',
      '.github/**',
    ],
    jobs: 'all',
  },
  // Guides read by Prettier and the unit tests alone. The packaged README, the changelogs and the
  // pages in docs/ are the site's content, below.
  {
    paths: [
      'AGENTS.md',
      'CONTRIBUTING.md',
      'contributing/**',
      'packages/*/AGENTS.md',
      'apps/site/AGENTS.md',
      'packages/{eslint-plugin,stylelint-config}/**',
    ],
    jobs: [],
  },
  // The library's Markdown is the site's content too.
  { paths: ['packages/ui/**/*.md'], jobs: ['site'] },
  {
    paths: [
      'packages/ui/**',
      'tests/component/**',
      'tests/browser/library/**',
      'tests/fixture/**',
      'tests/contrast/**',
    ],
    jobs: ['library', 'site'],
  },
  { paths: ['tests/browser/helpers/**'], jobs: ['library', 'site'] },
  {
    paths: [
      'apps/site/**',
      'docs/**',
      '.changeset/**',
      'README.md',
      'assets/**',
      'scripts/site/**',
      'scripts/docs/**',
      'scripts/release/**',
      'wrangler.jsonc',
      'tests/browser/site/**',
    ],
    jobs: ['site'],
  },
  // Unit tests, the full check's own suites, and the configuration of the static checks.
  {
    paths: [
      'tests/*/*.test.mjs',
      'tests/{support,types,lint,rsc,docs,composition,graphic}/**',
      'tests/{accessibility,visual}/**',
      'eslint.config.mjs',
      'stylelint.config.mjs',
      'stylelint-suppressions.json',
      'knip.jsonc',
      '.prettierrc.json',
      '.prettierignore',
      '.gitattributes',
      '.gitignore',
      '.betterleaksignore',
    ],
    jobs: [],
  },
];

/** The jobs a change runs, and the path that decided each, or why everything runs. */
export function chooseJobs(paths: readonly string[] | undefined) {
  const jobs = { library: false, site: false };
  const reasons: string[] = [];
  if (!paths) return { jobs: { library: true, site: true }, reasons: ['a full run'] };
  for (const path of paths) {
    const rule = jobRules.find((each) => each.paths.some((glob) => posix.matchesGlob(path, glob)));
    const runs: Job[] = !rule || rule.jobs === 'all' ? ['library', 'site'] : rule.jobs;
    for (const job of runs)
      if (!jobs[job]) {
        jobs[job] = true;
        reasons.push(`${job}: ${path}${rule ? '' : ' (no rule names it)'}`);
      }
  }
  return { jobs, reasons };
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: { paths: { type: 'string' }, full: { type: 'boolean', default: false } },
  });
  const paths =
    values.full || !values.paths
      ? undefined
      : readFileSync(values.paths, 'utf8').split(/\r?\n/).filter(Boolean);
  const { jobs, reasons } = chooseJobs(paths);
  console.error(
    paths ? `${paths.length} changed paths.` : 'Everything runs.',
    ...reasons.map((reason) => `\n  ${reason}`),
  );
  for (const [job, runs] of Object.entries(jobs)) console.log(`${job}=${runs}`);
}
