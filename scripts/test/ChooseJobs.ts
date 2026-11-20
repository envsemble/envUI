import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { parseArgs } from 'node:util';

export type Job = 'library' | 'site';

export const jobRules: { paths: string[]; jobs: Job[] | 'all' }[] = [
  {
    paths: [
      'package.json',
      'package-lock.json',
      '**/package.json',
      '**/tsconfig.json',
      'playwright.config.ts',
      'scripts/*.ts',
      'scripts/test/**',
      'scripts/build/**',
      '.github/**',
    ],
    jobs: 'all',
  },
  {
    paths: [
      'LICENSE',
      'AGENTS.md',
      'CONTRIBUTING.md',
      'contributing/**',
      'packages/{eslint-plugin,stylelint-config}/**',
    ],
    jobs: [],
  },
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
  { paths: ['tests/browser/support/**'], jobs: ['library', 'site'] },
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
  {
    paths: [
      'tests/{library,site,docs,tooling,support,types,lint}/**',
      'scripts/measure/**',
      'scripts/lint/**',
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

export const burnInFiles = (kept: readonly string[]) =>
  [
    ...new Set(
      kept.filter((path) =>
        /^(?:tests\/component\/(?!Accessibility\.)[\w-]+\.test\.tsx|tests\/browser\/(?:library|site)\/[\w-]+\.spec\.ts)$/.test(
          path,
        ),
      ),
    ),
  ].sort();

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      paths: { type: 'string' },
      kept: { type: 'string' },
      full: { type: 'boolean', default: false },
    },
  });
  const read = (file: string | undefined) =>
    values.full || !values.paths || !file
      ? undefined
      : readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  const paths = read(values.paths);
  const { jobs, reasons } = chooseJobs(paths);
  const repeated = burnInFiles(read(values.kept) ?? []);
  console.error(
    paths ? `${paths.length} changed paths.` : 'Everything runs.',
    ...reasons.map((reason) => `\n  ${reason}`),
    `\nburn-in: ${repeated.join(', ') || 'no browser test file added or edited'}`,
  );
  for (const [job, runs] of Object.entries(jobs)) console.log(`${job}=${runs}`);
  console.log(`burn-in=${repeated.length > 0}`);
  console.log(`burn-in-files=${repeated.join(' ')}`);
}
