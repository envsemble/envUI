import { parseArgs } from 'node:util';
import { planCheck } from './CheckPlan.ts';
import { generateDocumentation } from './StaticChecks.ts';
import { changedFiles, serversFor, specFile } from './TestScope.ts';
import {
  bin,
  componentTestCommand,
  parallel,
  playwrightCommand,
  series,
  summary,
  task,
} from './TestTasks.ts';
import { bold, dim, red, yellow } from '../Terminal.ts';

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

const {
  scope,
  staticTasks,
  unitTests,
  browserSpecs,
  componentTests,
  playwrightSpecs,
  live,
  deferred,
  builds,
} = planCheck(paths, { affected, base: baseOption });

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
  `  unit tests: ${unitTests.fast.length} files${builds.library ? `, and ${unitTests.built.length} on the library build` : ''}`,
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

await series([generateDocumentation]);

const browserTask = (names: string[], projects: string[], label: string) =>
  task(
    label,
    playwrightCommand(projects, [
      ...(projects.includes('live-development') ? ['--no-deps'] : []),
      '--reporter=dot',
      ...(affected ? ['--retries=1'] : ['--max-failures=5']),
      ...names.map((name) => specFile(name)),
    ]),
    {
      env: { ENVUI_SERVERS: serversFor(names).join(',') || 'none' },
      detail: `${names.length} specs`,
    },
  );
const componentTask = (names: string[], engines: boolean) =>
  task(
    engines ? 'component (Firefox, WebKit)' : 'component (Chromium)',
    componentTestCommand(engines ? 'engines' : 'chromium', [
      '--reporter=dot',
      ...(affected ? ['--retry=1'] : ['--bail=5']),
      ...names.map((name) => specFile(name)),
    ]),
    { detail: `${names.length} files` },
  );
const npmScript = (name: string) => series([task(name, [...bin.npm, 'run', '-s', name])]);
const catalogueBuilds = builds.site ? [npmScript('build:site')] : [];

if (!affected) {
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
  await Promise.all([
    parallel(staticTasks),
    ...catalogueBuilds,
    builds.library &&
      series([
        task('build:library', [...bin.node, 'scripts/build/BuildLibrary.ts']),
        task('unit tests on the build', [...bin.node, '--test', ...unitTests.built], {
          detail: `${unitTests.built.length} files`,
        }),
      ]),
  ]);
  await parallel([
    ...(playwrightSpecs.length
      ? [browserTask(playwrightSpecs, ['chromium', 'firefox', 'webkit'], 'browser (3 engines)')]
      : []),
    ...(componentTests.length
      ? [componentTask(componentTests, false), componentTask(componentTests, true)]
      : []),
  ]);
  if (live.length) await series([browserTask(live, ['live-development'], 'live development')]);
}

const ok = summary(tier, started);
if (!ok) console.log(red('Fix the failures above, then run it again.'));
else if (!affected)
  console.log(dim('Before committing or merging the branch, run `npm run check:affected`.'));
process.exit(ok ? 0 : 1);
