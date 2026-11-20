import { parseArgs } from 'node:util';
import { checks, generateDocumentation } from './Checks.ts';
import { isComponentTest } from './FixtureImports.ts';
import {
  changedFiles,
  selectScope,
  serversFor,
  specFile,
  specNeeds,
  unitTestFiles,
} from './TestScope.ts';
import { bin, parallel, series, summary, task, type Task } from './TestTasks.ts';
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

const scope = selectScope(paths, { affected });
const windowsCommandLineRoomForPaths = 24_000;
const tooLong = (paths: readonly string[]) =>
  paths.reduce((length, path) => length + path.length + 1, 0) > windowsCommandLineRoomForPaths;
if (tooLong(scope.lint)) scope.whole.lint = true;
if (tooLong(scope.css)) scope.whole.css = true;
if (tooLong(scope.format)) scope.whole.format = true;
const { built: builtUnitTests, fast: fastUnitTests } = unitTestFiles();
if (paths.some((path) => builtUnitTests.includes(path))) scope.build.library = true;

const needs = new Map([...scope.specs.keys()].map((name) => [name, specNeeds(name)]));
const live = [...needs].filter(([, need]) => need.live).map(([name]) => name);
const browserSpecs = [...needs]
  .filter(([, need]) => !need.live && (affected || !need.library))
  .map(([name]) => name);
const deferred = affected ? [] : [...needs.keys()].filter((name) => !browserSpecs.includes(name));
const componentTests = browserSpecs.filter((name) => isComponentTest(specFile(name)));
const playwrightSpecs = browserSpecs.filter((name) => !componentTests.includes(name));
const builds = {
  library: affected && scope.build.library,
  site: [...needs].some(([name, need]) => need.site && playwrightSpecs.includes(name)),
};

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

const node = (script: string, ...args: string[]) => [...bin.node, script, ...args];
const staticTasks: Task[] = [
  ...(scope.whole.lint ? checks.lint() : scope.lint.length ? checks.lint(scope.lint) : []),
  ...(scope.whole.lint || scope.lint.length ? checks['lint:unused']() : []),
  ...(scope.whole.css
    ? checks['lint:css']()
    : scope.css.length
      ? checks['lint:css'](scope.css)
      : []),
  ...(scope.whole.format
    ? checks['format:check']()
    : scope.format.length
      ? checks['format:check'](scope.format)
      : []),
  ...(scope.typecheck ? checks.typecheck() : []),
  ...(scope.generated.has('tokens') ? checks['tokens:check']() : []),
  ...(scope.generated.has('docs') ? checks['docs:check'](baseOption) : []),
  ...(scope.generated.has('icons') ? checks['icons:check']() : []),
];
staticTasks.push(
  task('unit tests', [...bin.node, '--test', ...fastUnitTests], {
    detail: `${fastUnitTests.length} files`,
  }),
);

await series([generateDocumentation]);

const browserTask = (names: string[], projects: string[], label: string) =>
  task(
    label,
    [
      ...bin.playwright,
      'test',
      ...projects.map((project) => `--project=${project}`),
      ...(projects.includes('live-development') ? ['--no-deps'] : []),
      '--reporter=dot',
      ...(affected ? ['--retries=1'] : ['--max-failures=5']),
      ...names.map((name) => specFile(name)),
    ],
    {
      env: { ENVUI_SERVERS: serversFor(names).join(',') || 'none' },
      detail: `${names.length} specs`,
    },
  );
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
        task('build:library', node('scripts/build/BuildLibrary.ts')),
        task('unit tests on the build', [...bin.node, '--test', ...builtUnitTests], {
          detail: `${builtUnitTests.length} files`,
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
