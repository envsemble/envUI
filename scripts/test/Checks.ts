// The repository's static checks, each written once: `npm run <check>` runs it through this file,
// and `npm run check` (Check.ts) and `npm run verify` (Verify.ts) run its tasks beside others.
//
//   node scripts/test/Checks.ts <check> [arguments]
//
// lint, lint:css and format:check pass their arguments on to their tool, such as
// `npm run lint:css -- --suppress`; docs:check takes `--base <ref>` for its contract checks.
import { baseOption } from '../docs/ContractHistory.ts';
import { bin, series, task, type Task } from './TestTasks.ts';

const node = (script: string, ...args: string[]) => [...bin.node, script, ...args];

/** The projects tsc checks, by the name of each one's build-info file in .cache/tsc. */
const typecheckProjects = {
  ui: 'packages/ui',
  site: 'apps/site',
  scripts: 'scripts',
  types: 'tests/types',
  fixture: 'tests/fixture',
  component: 'tests/component',
  tests: 'tests',
  'eslint-plugin': 'packages/eslint-plugin',
  'stylelint-config': 'packages/stylelint-config',
};

/** The style sheets Stylelint checks when it checks them all. */
export const styleSheets = ['packages/ui/src/**/*.css', 'apps/site/src/**/*.css'];

/**
 * The catalogue's data and the site's documentation module, which are generated rather than
 * committed: the site's types and everything that renders the catalogue read them.
 */
export const generateDocumentation = task(
  'generate documentation',
  node('scripts/docs/GenerateDocumentation.ts'),
);

/** Each check's tasks; given files, a check of files checks only those. */
export const checks = {
  typecheck: (): Task[] =>
    Object.entries(typecheckProjects).map(([name, folder]) =>
      task(`typecheck ${name}`, [
        ...bin.tsc,
        '-p',
        `${folder}/tsconfig.json`,
        '--noEmit',
        '--incremental',
        '--tsBuildInfoFile',
        `.cache/tsc/${name}.tsbuildinfo`,
      ]),
    ),
  lint: (files?: readonly string[]): Task[] => [
    task(
      'lint',
      [
        ...bin.eslint,
        '--cache',
        '--cache-strategy',
        'content',
        '--cache-location',
        '.cache/eslint/',
        ...(files ? ['--no-warn-ignored', ...files] : ['.']),
      ],
      { detail: files && `${files.length} files` },
    ),
  ],
  'lint:css': (files?: readonly string[]): Task[] => [
    task('lint:css', [...bin.stylelint, ...(files ?? styleSheets)], {
      detail: files && `${files.length} files`,
    }),
  ],
  'lint:unused': (): Task[] => [
    task('lint:unused', [
      ...bin.knip,
      '--cache',
      '--cache-location',
      '.cache/knip',
      '--no-progress',
    ]),
  ],
  'format:check': (files?: readonly string[]): Task[] => [
    task(
      'format:check',
      [
        ...bin.prettier,
        '--check',
        '--cache',
        '--cache-strategy',
        'content',
        '--cache-location',
        '.cache/prettier/.prettiercache',
        ...(files ? ['--ignore-unknown', ...files] : ['.']),
      ],
      { detail: files && `${files.length} files` },
    ),
  ],
  'tokens:check': (): Task[] => [
    task('tokens:check palette', node('scripts/build/GeneratePalette.ts', '--check')),
    task('tokens:check build', node('scripts/build/BuildTokens.ts', '--check')),
    task('tokens:check lint packages', node('scripts/build/SyncLintPackages.ts', '--check')),
  ],
  'docs:check': (base?: string): Task[] => {
    const against = base ? ['--base', base] : [];
    return [
      task('docs:check props', node('scripts/docs/ExtractProps.ts', '--check')),
      task('docs:check parts', node('scripts/docs/GenerateParts.ts', '--check', ...against)),
      task('docs:check exports', node('scripts/docs/GenerateExports.ts', '--check', ...against)),
      task('docs:check pages', node('scripts/docs/GenerateDocumentation.ts', '--check')),
      task('docs:check snippets', node('scripts/docs/CheckSnippets.ts')),
    ];
  },
  'icons:check': (): Task[] => [
    task('icons:check', node('scripts/build/GenerateIcons.ts', '--check')),
  ],
};

type Check = keyof typeof checks;

if (import.meta.main) {
  const [name, ...rest] = process.argv.slice(2);
  if (!name || !(name in checks)) {
    console.error(`Name a check: ${Object.keys(checks).join(', ')}.`);
    process.exit(2);
  }
  const check = name as Check;
  // The site's types read the generated documentation module.
  const tasks =
    check === 'typecheck'
      ? [generateDocumentation, ...checks.typecheck()]
      : check === 'docs:check'
        ? checks['docs:check'](baseOption())
        : checks[check]().map((item) =>
            rest.length ? { ...item, run: [...item.run, ...rest] } : item,
          );
  const results = await series(tasks.map((item) => ({ ...item, stream: true })));
  process.exit(results.every((result) => result.ok) && results.length === tasks.length ? 0 : 1);
}
