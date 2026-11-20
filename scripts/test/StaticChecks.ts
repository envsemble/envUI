import { baseOption } from '../Git.ts';
import { bin, series, task, type Task } from './TestTasks.ts';

const node = (script: string, ...args: string[]) => [...bin.node, script, ...args];

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

export const styleSheets = ['packages/ui/src/**/*.css', 'apps/site/src/**/*.css', 'tests/**/*.css'];

export const generateDocumentation = task(
  'generate documentation',
  node('scripts/docs/GenerateDocumentation.ts'),
);

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
      task('docs:check guides', node('scripts/docs/GenerateGuideTables.ts', '--check')),
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
    console.error(
      `Usage: node scripts/test/StaticChecks.ts <check> [arguments], the check one of ${Object.keys(checks).join(', ')}. lint, lint:css and format:check pass their arguments on to their tool; docs:check takes --base <ref>.`,
    );
    process.exit(2);
  }
  const check = name as Check;
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
