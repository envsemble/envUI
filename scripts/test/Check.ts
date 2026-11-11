// `npm run check`: the fast tier, run after every change. `npm run check:affected`: the affected
// tier, run before committing or merging a branch. Both check only what the branch changed against
// its integration branch, as scripts/test/TestScope.ts selects it; `npm run verify` checks everything.
//
//   node scripts/test/Check.ts [--affected] [--base <ref>] [--files <a,b,...>] [--dry-run]
//
// --base       the branch to compare with; else ENVUI_BASE, else origin/dev
// --files      check these paths instead of the branch's changes, such as to try the selection
// --dry-run    print the selection and stop
import { parseArgs } from 'node:util';
import { isComponentTest } from './FixtureImports.ts';
import {
  changedFiles,
  selectScope,
  serversFor,
  specFile,
  specNeeds,
  unitTestFiles,
} from './TestScope.ts';
import {
  bin,
  bold,
  dim,
  parallel,
  red,
  series,
  summary,
  task,
  yellow,
  type Task,
} from './TestTasks.ts';

const started = performance.now();
const {
  values: { affected, 'dry-run': dryRun, base: baseOption, files },
} = parseArgs({
  options: {
    affected: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    base: { type: 'string' },
    files: { type: 'string' },
  },
});
const tier = affected ? 'check:affected' : 'check';

let paths: string[];
if (files) {
  paths = files.split(',').filter(Boolean);
  console.log(bold(`${tier}: ${paths.length} given files`));
} else {
  const { base, mergeBase, changes } = changedFiles({ base: baseOption });
  paths = changes.map((change) => change.path);
  console.log(
    bold(`${tier}: ${paths.length} files changed against ${base}`) +
      dim(` (merge-base ${mergeBase.slice(0, 10)}, with uncommitted and untracked files)`),
  );
}
if (!paths.length) {
  console.log('Nothing changed, so nothing to check. `npm run verify` checks everything.');
  process.exit(0);
}

const scope = selectScope(paths, { affected });
// A list of changed files too long for one command line (Windows takes about 32,000 characters)
// is checked as the whole repository instead, as a branch that moved many files needs anyway.
const tooLong = (paths: readonly string[]) =>
  paths.reduce((length, path) => length + path.length + 1, 0) > 24_000;
if (tooLong(scope.lint)) scope.whole.lint = true;
if (tooLong(scope.css)) scope.whole.css = true;
if (tooLong(scope.format)) scope.whole.format = true;
const { built: builtUnitTests, fast: fastUnitTests } = unitTestFiles();
// A changed test of the build needs the build to run.
if (paths.some((path) => builtUnitTests.includes(path))) scope.build.library = true;

// The specs, split by what they need: live development edits sources and runs alone, and a spec
// that opens what the library build renders waits for it; both run in the affected tier only.
const needs = new Map([...scope.specs.keys()].map((name) => [name, specNeeds(name)]));
const live = [...needs].filter(([, need]) => need.live).map(([name]) => name);
const browserSpecs = [...needs]
  .filter(([, need]) => !need.live && (affected || !need.library))
  .map(([name]) => name);
const deferred = affected ? [] : [...needs.keys()].filter((name) => !browserSpecs.includes(name));
// The component tests among them run in Vitest, the rest in Playwright.
const componentTests = browserSpecs.filter((name) => isComponentTest(specFile(name)));
const playwrightSpecs = browserSpecs.filter((name) => !componentTests.includes(name));
// The site build takes seconds, so the fast tier builds it when its specs open it.
const builds = {
  library: affected && scope.build.library,
  site: [...needs].some(([name, need]) => need.site && playwrightSpecs.includes(name)),
};

// What runs, and why.
const list = (items: string[]) =>
  items.length > 6
    ? `${items.slice(0, 6).join(', ')} and ${items.length - 6} more`
    : items.join(', ');
console.log(dim(`  ${list(paths)}`));
console.log(
  `  lint ${scope.whole.lint ? 'everything' : `${scope.lint.length} files`}, stylelint ${scope.whole.css ? 'everything' : `${scope.css.length} files`}, prettier ${scope.whole.format ? 'everything' : `${scope.format.length} files`}`,
);
console.log(`  typecheck: ${scope.typecheck ? 'yes, incrementally' : 'no TypeScript changed'}`);
if (scope.generated.size) console.log(`  generated files: ${[...scope.generated].join(', ')}`);
console.log(
  `  unit tests: ${fastUnitTests.length} files${builds.library ? `, and ${builtUnitTests.length} on the library build` : ''}`,
);
const shown = affected ? [...browserSpecs, ...live] : browserSpecs;
if (shown.length)
  console.log(
    `  browser specs in ${affected ? 'Chromium, and their @engines tests in Firefox and WebKit' : 'Chromium'}:\n${shown
      .map((name) => `    ${name} ${dim(`← ${[...(scope.specs.get(name) ?? [])].join('; ')}`)}`)
      .join('\n')}`,
  );
else console.log('  browser specs: none for this change');
const opened = Object.entries(builds)
  .filter(([, needed]) => needed)
  .map(([name]) => name);
if (opened.length) console.log(`  builds: ${opened.join(', ')}`);
if (deferred.length)
  console.log(
    yellow(
      `  note: ${deferred.join(', ')} edit sources or need the library build: check:affected runs them`,
    ),
  );
for (const [helper, users] of scope.helpers)
  if (!users.some((name) => scope.specs.has(name)) && users.length)
    console.log(dim(`  ${helper}: ${users.length} specs import it; check:affected runs them`));
for (const [path, count] of scope.widelyUsed)
  console.log(dim(`  ${path}: ${count} specs' fixtures use it; check:affected runs them all`));
const unmatched = scope.unmatched.filter((path) => !scope.helpers.has(path));
if (unmatched.length) console.log(dim(`  no spec for ${list(unmatched)}; verify covers it`));
console.log('');
if (dryRun) process.exit(0);

// Tasks.
const node = (script: string, ...args: string[]) => [...bin.node, script, ...args];
const staticTasks: Task[] = [];
if (scope.whole.lint)
  staticTasks.push(
    task('eslint', [...bin.eslint, '.', '--cache', '--cache-location', '.cache/eslint/']),
  );
else if (scope.lint.length)
  staticTasks.push(
    task(
      'eslint',
      [
        ...bin.eslint,
        '--cache',
        '--cache-location',
        '.cache/eslint/',
        '--no-warn-ignored',
        ...scope.lint,
      ],
      {
        detail: `${scope.lint.length} files`,
      },
    ),
  );
// Unused files, exports and dependencies (knip.jsonc), wherever code or the packages changed.
if (scope.whole.lint || scope.lint.length)
  staticTasks.push(task('lint:unused', [...bin.npm, 'run', '-s', 'lint:unused']));
if (scope.whole.css)
  staticTasks.push(
    task('stylelint', [...bin.stylelint, 'packages/ui/src/**/*.css', 'apps/site/src/**/*.css']),
  );
else if (scope.css.length)
  staticTasks.push(
    task('stylelint', [...bin.stylelint, ...scope.css], { detail: `${scope.css.length} files` }),
  );
if (scope.whole.format) staticTasks.push(task('prettier', [...bin.prettier, '--check', '.']));
else if (scope.format.length)
  staticTasks.push(
    task('prettier', [...bin.prettier, '--check', '--ignore-unknown', ...scope.format], {
      detail: `${scope.format.length} files`,
    }),
  );
if (scope.typecheck)
  for (const [name, project] of [
    ['ui', 'packages/ui/tsconfig.json'],
    ['site', 'apps/site/tsconfig.json'],
    ['types', 'tests/types/tsconfig.json'],
    ['fixture', 'tests/fixture/tsconfig.json'],
    ['component', 'tests/component/tsconfig.json'],
    ['scripts', 'scripts/tsconfig.json'],
  ])
    staticTasks.push(
      task(`tsc ${name}`, [
        ...bin.tsc,
        '-p',
        project,
        '--noEmit',
        '--incremental',
        '--tsBuildInfoFile',
        `.cache/tsc/${name}.tsbuildinfo`,
      ]),
    );
if (scope.generated.has('tokens'))
  staticTasks.push(
    task('tokens:check', node('scripts/build/GeneratePalette.ts', '--check')),
    task('tokens:check build', node('scripts/build/BuildTokens.ts', '--check')),
    task('tokens:check lint packages', node('scripts/build/SyncLintPackages.ts', '--check')),
  );
if (scope.generated.has('docs'))
  staticTasks.push(
    task('docs:check props', node('scripts/docs/ExtractProps.ts', '--check')),
    task(
      'docs:check parts',
      node(
        'scripts/docs/GenerateParts.ts',
        '--check',
        ...(baseOption ? ['--base', baseOption] : []),
      ),
    ),
    task(
      'docs:check exports',
      node(
        'scripts/docs/GenerateExports.ts',
        '--check',
        ...(baseOption ? ['--base', baseOption] : []),
      ),
    ),
    task('docs:check pages', node('scripts/docs/GenerateDocumentation.ts', '--check')),
    task('docs:check snippets', node('scripts/docs/CheckSnippets.ts')),
  );
if (scope.generated.has('icons'))
  staticTasks.push(task('icons:check', node('scripts/build/GenerateIcons.ts', '--check')));
staticTasks.push(
  task('unit tests', [...bin.node, '--test', ...fastUnitTests], {
    detail: `${fastUnitTests.length} files`,
  }),
);

// The catalogue reads the generated documentation, which is not committed.
await series([task('generate documentation', node('scripts/docs/GenerateDocumentation.ts'))]);

const browserTask = (names: string[], projects: string[], label: string) =>
  task(
    label,
    [
      ...bin.playwright,
      'test',
      ...projects.map((project) => `--project=${project}`),
      // Live development depends on the three engine projects; the run has already tested them.
      ...(projects.includes('live-development') ? ['--no-deps'] : []),
      '--reporter=dot',
      // A test that fails once under the load of three engines and passes again is reported as
      // flaky; one that fails twice fails the run.
      ...(affected ? ['--retries=1'] : ['--max-failures=5']),
      ...names.map((name) => specFile(name)),
    ],
    {
      env: { ENVUI_SERVERS: serversFor(names).join(',') || 'none' },
      detail: `${names.length} specs`,
    },
  );
// The component tests (tests/component): every test in Chromium but the accessibility scan, which
// `npm run test:a11y` runs, and in the affected tier those tagged engines in Firefox and WebKit too.
const componentTask = (names: string[], engines: boolean) =>
  task(
    engines ? 'component (Firefox, WebKit)' : 'component (Chromium)',
    [
      ...bin.vitest,
      'run',
      '--config',
      'tests/component/vitest.config.ts',
      '--reporter=dot',
      ...(engines
        ? ['--project=firefox', '--project=webkit', '--tags-filter=engines']
        : ['--project=chromium*', '--tags-filter=!a11y']),
      ...(affected ? ['--retry=1'] : ['--bail=5']),
      ...names.map((name) => specFile(name)),
    ],
    { detail: `${names.length} files` },
  );
const npmScript = (name: string) => series([task(name, [...bin.npm, 'run', '-s', name])]);
const catalogueBuilds = builds.site ? [npmScript('build:site')] : [];

if (!affected) {
  // The browser specs start once the site build they open, if any, is done.
  const browser = async () => {
    if (!playwrightSpecs.length) return;
    const built = (await Promise.all(catalogueBuilds)).flat();
    if (built.every((result) => result.ok))
      await parallel([browserTask(playwrightSpecs, ['chromium'], 'browser (Chromium)')]);
  };
  const components = async () => {
    if (componentTests.length) await parallel([componentTask(componentTests, false)]);
  };
  await Promise.all([parallel(staticTasks), browser(), components()]);
} else {
  // Phase 1: static checks, unit tests and the builds the browser specs need. The unit tests on
  // the build also write .cache/Hydration.html, which Hydration.spec.ts opens.
  await Promise.all([
    parallel(staticTasks),
    ...catalogueBuilds,
    builds.library &&
      series([
        task('build:library', node('scripts/build/BuildLibrary.ts')),
        task('unit tests on the build', [...bin.node, '--test', ...builtUnitTests], {
          detail: `${builtUnitTests.length} files`,
        }),
      ]),
  ]);
  // Phase 2: the specs in Chromium, and their @engines tests in Firefox and WebKit.
  await parallel([
    ...(playwrightSpecs.length
      ? [browserTask(playwrightSpecs, ['chromium', 'firefox', 'webkit'], 'browser (3 engines)')]
      : []),
    ...(componentTests.length
      ? [componentTask(componentTests, false), componentTask(componentTests, true)]
      : []),
  ]);
  // Live development edits sources, so it runs once nothing else reads them.
  if (live.length) await series([browserTask(live, ['live-development'], 'live development')]);
}

const ok = summary(tier, started);
if (!ok) console.log(red('Fix the failures above, then run it again.'));
else if (!affected)
  console.log(dim('Before committing or merging the branch, run `npm run check:affected`.'));
process.exit(ok ? 0 : 1);
