// `npm run check`: the fast tier, run after every change. `npm run check:affected`: the affected
// tier, run before committing or merging a branch. Both check only what the branch changed against
// its integration branch, as scripts/TestScope.mjs selects it; `npm run verify` checks everything.
//
//   node scripts/Check.mjs [--affected] [--base <ref>] [--files <a,b,...>] [--dry-run] [--skip-visual]
//
// --base       the branch to compare with; else ENVUI_BASE, else origin/envui-1.0, else origin/dev
// --files      check these paths instead of the branch's changes, such as to try the selection
// --dry-run    print the selection and stop
// --skip-visual  leave the screenshots out of the affected tier (also ENVUI_SKIP_VISUAL=1), with a
//              warning; without Docker the affected tier fails, as `npm run verify` does
import { buildIndex, changedFiles, selectScope, serversFor, unitTestFiles } from './TestScope.mjs';
import {
  bin,
  bold,
  dim,
  dockerRunning,
  parallel,
  red,
  series,
  summary,
  task,
  yellow,
} from './TestTasks.mjs';

const started = performance.now();
const argv = process.argv.slice(2);
const option = (name) => {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
};
const affected = argv.includes('--affected');
const dryRun = argv.includes('--dry-run');
const skipVisual = argv.includes('--skip-visual') || process.env.ENVUI_SKIP_VISUAL === '1';
const tier = affected ? 'check:affected' : 'check';

let paths;
if (option('--files')) {
  paths = option('--files').split(',').filter(Boolean);
  console.log(bold(`${tier}: ${paths.length} given files`));
} else {
  const { base, mergeBase, changes } = changedFiles({ base: option('--base') });
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

const index = buildIndex();
const scope = selectScope(paths, index);
const { built: builtUnitTests, fast: fastUnitTests } = unitTestFiles();
// A changed test of the build needs the build to run.
if (paths.some((path) => builtUnitTests.includes(path))) scope.build.library = true;

// What runs, and why.
const list = (items) =>
  items.length > 6
    ? `${items.slice(0, 6).join(', ')} and ${items.length - 6} more`
    : items.join(', ');
const reasons = (map) =>
  [...map].map(([name, why]) => `    ${name} ${dim(`← ${[...why].join('; ')}`)}`).join('\n');
console.log(dim(`  ${list(paths)}`));
const fastSpecs = [...scope.fastSpecs.keys()];
const affectedSpecs = [...new Set([...fastSpecs, ...scope.affectedSpecs.keys()])];
const specs = affected ? affectedSpecs : fastSpecs;
const pages = [...scope.pages.keys()];
console.log(
  `  lint ${scope.whole.lint ? 'everything' : `${scope.lint.length} files`}, stylelint ${scope.whole.css ? 'everything' : `${scope.css.length} files`}, prettier ${scope.whole.format ? 'everything' : `${scope.format.length} files`}`,
);
console.log(`  typecheck: ${scope.typecheck ? 'yes, incrementally' : 'no TypeScript changed'}`);
if (scope.generated.size) console.log(`  generated files: ${[...scope.generated].join(', ')}`);
console.log(
  `  unit tests: ${fastUnitTests.length} files${affected && scope.build.library ? `, and ${builtUnitTests.length} on the library build` : ''}`,
);
if (scope.contrast) console.log('  contrast gate: tokens or shared styles changed');
if (specs.length)
  console.log(
    `  browser specs in ${affected ? 'Chromium, Firefox and WebKit' : 'Chromium'}:\n${reasons(
      new Map(
        specs.map((name) => [name, scope.affectedSpecs.get(name) ?? scope.fastSpecs.get(name)]),
      ),
    )}`,
  );
else console.log('  browser specs: none for this change');
if (!affected && specs.length && (scope.fastBuild.catalogue || scope.fastBuild.site))
  console.log(
    `  builds those specs open: ${[scope.fastBuild.catalogue && 'catalogue', scope.fastBuild.site && 'site'].filter(Boolean).join(', ')}`,
  );
if (affected) {
  const builds = Object.entries(scope.build)
    .filter(([, needed]) => needed)
    .map(([name]) => name);
  console.log(`  builds: ${builds.length ? builds.join(', ') : 'none needed'}`);
  if (pages.length)
    console.log(
      `  accessibility scan and screenshots of:\n${reasons(scope.pages)}${scope.density ? '\n    and the density specimens' : ''}`,
    );
}
for (const note of scope.notes) console.log(yellow(`  note: ${note}`));
if (scope.unmapped.length)
  console.log(dim(`  no checks beyond lint and unit tests: ${list(scope.unmapped)}`));
if (!affected && (scope.affectedSpecs.size > scope.fastSpecs.size || pages.length))
  console.log(
    dim(
      '  `npm run check:affected` adds the other engines, more specs, builds, accessibility and screenshots.',
    ),
  );
console.log('');
if (dryRun) process.exit(0);

// Tasks.
const node = (script, ...args) => [...bin.node, script, ...args];
const playwrightEnv = (names) => ({ ENVUI_SERVERS: serversFor(names, index).join(',') || 'none' });
const staticTasks = [];
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
if (scope.whole.css)
  staticTasks.push(
    task('stylelint', [
      ...bin.stylelint,
      'packages/ui/src/**/*.css',
      'apps/catalogue/src/**/*.css',
    ]),
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
    ['catalogue', 'apps/catalogue/tsconfig.json'],
    ['types', 'tests/types/tsconfig.json'],
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
    task('tokens:check', node('scripts/GeneratePalette.mjs', '--check')),
    task('tokens:check build', node('scripts/BuildTokens.mjs', '--check')),
  );
if (scope.generated.has('docs'))
  staticTasks.push(
    task('docs:check props', node('scripts/ExtractProps.mjs', '--check')),
    task('docs:check pages', node('scripts/GenerateDocumentation.mjs', '--check')),
    task('docs:check manifest', node('scripts/GenerateManifest.mjs', '--check')),
  );
if (scope.generated.has('icons'))
  staticTasks.push(task('icons:check', node('scripts/GenerateIcons.mjs', '--check')));
staticTasks.push(
  task('unit tests', [...bin.node, '--test', ...fastUnitTests], {
    detail: `${fastUnitTests.length} files`,
  }),
);

// The catalogue reads the generated documentation, which is not committed.
await series([task('generate documentation', node('scripts/GenerateDocumentation.mjs'))]);

const specFiles = (names) => names.map((name) => index.specs.get(name).file);
const browserTask = (selected, projects, label) => {
  const names =
    scope.contrast && !selected.includes('Contrast.spec.ts')
      ? [...selected, 'Contrast.spec.ts']
      : selected;
  const files = specFiles(names);
  return task(
    label,
    [
      ...bin.playwright,
      'test',
      ...projects.map((project) => `--project=${project}`),
      '--reporter=dot',
      // A test that fails once under the load of three engines and passes again is reported as
      // flaky; one that fails twice fails the run.
      ...(affected ? ['--retries=1'] : ['--max-failures=5']),
      ...files,
    ],
    { env: playwrightEnv(names), detail: `${files.length} specs` },
  );
};

if (!affected) {
  // The browser specs start once the catalogue builds they open, if any, are done.
  const builds = [
    scope.fastBuild.catalogue &&
      task('build:catalogue', [...bin.npm, 'run', '-s', 'build:catalogue']),
    scope.fastBuild.site && task('build:site', [...bin.npm, 'run', '-s', 'build:site']),
  ].filter(Boolean);
  const browser = async () => {
    if (!fastSpecs.length && !scope.contrast) return;
    const built = await parallel(builds);
    if (built.every((result) => result.ok))
      await parallel([browserTask(fastSpecs, ['chromium'], 'browser (Chromium)')]);
  };
  await Promise.all([parallel(staticTasks), browser()]);
} else {
  // Phase 1: static checks, unit tests and the builds the later phases need.
  const live = affectedSpecs.filter((name) => index.specs.get(name)?.live);
  const browserSpecs = affectedSpecs.filter((name) => !live.includes(name));
  const builds = [];
  // The unit tests on the build also write .cache/Hydration.html, which Hydration.spec.ts opens.
  if (scope.build.library)
    builds.push(
      series([
        task('build:library', node('scripts/BuildLibrary.mjs')),
        task('unit tests on the build', [...bin.node, '--test', ...builtUnitTests], {
          detail: `${builtUnitTests.length} files`,
        }),
      ]),
    );
  if (scope.build.catalogue) builds.push(npmScript('build:catalogue'));
  if (scope.build.site || (scope.a11y && pages.length)) builds.push(npmScript('build:site'));
  await Promise.all([parallel(staticTasks), ...builds]);

  // Phase 2: browser specs in every engine, the scans and the screenshots of the affected pages.
  const phase = [];
  if (browserSpecs.length || scope.contrast)
    phase.push(browserTask(browserSpecs, ['chromium', 'firefox', 'webkit'], 'browser (3 engines)'));
  if (scope.a11y && pages.length)
    phase.push(
      task('accessibility', [...bin.playwright, 'test', '--project=a11y', '--reporter=dot'], {
        env: { ENVUI_SERVERS: 'none', ENVUI_PAGES: pages.join(',') },
        detail: `${pages.length} pages`,
      }),
    );
  const visualPages = [...pages, ...(scope.density ? ['density'] : [])];
  if (scope.visual && visualPages.length) {
    if (skipVisual)
      console.log(
        yellow(
          '! Skipped the screenshots of the affected pages: --skip-visual or ENVUI_SKIP_VISUAL=1.',
        ),
      );
    else if (!(await dockerRunning()))
      phase.push(
        task('visual', [
          ...bin.node,
          '-e',
          "console.error('Docker is not running: start it, or pass --skip-visual.'); process.exit(1)",
        ]),
      );
    else
      phase.push(
        task('visual', node('scripts/VisualTests.mjs', '--reporter=dot'), {
          env: { ENVUI_PAGES: visualPages.join(',') },
          detail: `${visualPages.length} pages`,
        }),
      );
  }
  await parallel(phase);
  // Live development edits sources, so it runs once nothing else reads them.
  if (live.length) await series([browserTask(live, ['live-development'], 'live development')]);
}

function npmScript(name) {
  return series([task(name, [...bin.npm, 'run', '-s', name])]);
}

const ok = summary(tier, started);
if (!ok) console.log(red('Fix the failures above, then run it again.'));
else if (!affected)
  console.log(dim('Before committing or merging the branch, run `npm run check:affected`.'));
process.exit(ok ? 0 : 1);
