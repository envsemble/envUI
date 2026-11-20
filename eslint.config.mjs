import js from '@eslint/js';
import { readdirSync } from 'node:fs';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { siteConfigs } from './apps/site/eslint.rules.mjs';
import { noCommentsPlugin } from './scripts/lint/NoComments.ts';

const commentFreeFiles = [
  'scripts/**',
  'tests/**',
  'packages/eslint-plugin/**',
  'packages/stylelint-config/**',
  'packages/ui/src/**',
  'apps/site/**',
  '*.{js,mjs,cjs,ts}',
];
const publicApiWithDocComments = '^packages/ui/src/(?!icons/|generated/)';

const families = readdirSync(new URL('packages/ui/src/', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !['internal', 'styles', 'assets', 'generated', 'icons'].includes(name));

const otherFamiliesInternals = (family) => ({
  regex: String.raw`^(\.\./)+(${families
    .filter((other) => other !== family)
    .join('|')})/([\w-]+/)*internal(/|$)`,
  message: `Another family's internal/ folder is its own: move what ${family}/ shares with it to the top-level internal/.`,
});

const providerLocale = {
  regex: String.raw`(^|/)EnvUIContext\.js$`,
  importNames: ['useLocale'],
  message:
    'Format in useResolvedLocale (src/internal/provider/locale.ts), which keeps the server’s locale until hydration. The provider’s own locale is for a module that hands it to a library that handles hydration itself, listed in providerLocaleReaders in eslint.config.mjs.',
};
const providerLocaleReaders = [
  'foundations/EnvUIProvider.tsx',
  'internal/provider/locale.ts',
  'data-display/Meter.tsx',
  'feedback/Progress.tsx',
  'forms/Slider.tsx',
  'forms/Combobox.tsx',
  'actions/CommandPalette.tsx',
].map((path) => `packages/ui/src/${path}`);

const confusingBrowserGlobals = [
  'close',
  'closed',
  'event',
  'find',
  'length',
  'name',
  'opener',
  'origin',
  'parent',
  'print',
  'self',
  'status',
  'stop',
  'top',
];

const emptyOrUndefined = `ConditionalExpression:matches([consequent.value=''][alternate.name='undefined'], [consequent.name='undefined'][alternate.value=''])`;
const inlineFlags = [
  `JSXAttribute[name.name=/^data-/] > JSXExpressionContainer > ${emptyOrUndefined}`,
  `Property[key.value=/^data-/] > ${emptyOrUndefined}`,
].map((selector) => ({
  selector,
  message: 'Set a state attribute that is on or off with flag() (src/internal/flag.ts).',
}));

const inlinePixels = {
  selector:
    "LogicalExpression[operator='||'][right.value=0] > CallExpression.left:matches([callee.name='parseFloat'], [callee.property.name='parseFloat'])",
  message: 'Read a computed length with pixelsOf() (src/internal/dom/lengths.ts).',
};

const ownStateFromDefault = {
  selector: "CallExpression[callee.name='useState'] Identifier[name=/^default[A-Z]/]",
  message:
    'Keep a value that has a default prop in useControllableState (src/internal/react/useControllableState.ts), not in a useState of its own.',
};

const pathsFromRepositoryPaths = {
  selector: String.raw`Literal[value=/^(?:\.{1,2}\/)*(?:packages\/ui\/src\/styles\/?|docs\/generated\/(?:parts|props|exports)\.json)$/]`,
  message:
    'Take the path from scripts/RepositoryPaths.ts (styleSheetsDirectory, partsFile, propsFile, exportsFile), and repositoryPath() for its repository-relative form.',
};

const noFixedSleeps = [
  "NewExpression[callee.name='Promise'] CallExpression[callee.name='setTimeout']",
  "CallExpression[callee.property.name='waitForTimeout']",
].map((selector) => ({
  selector,
  message:
    "Wait for a condition (expect.poll, a locator's state), or stop the page's timers (stopTimers, passTime); waitOnRealTime in tests/component/support/Browser.ts is the one wait on real time.",
}));

const buildOutput = ['**/dist/**', '**/node_modules/**', '.cache/**'];
const wranglerDevState = ['.wrangler/**'];
const testReports = ['test-results/**', 'playwright-report/**'];
const generatedByScripts = [
  'packages/ui/src/icons/**',
  'apps/site/src/brand/EnvUILogo.tsx',
  'apps/site/src/generated/**',
];
const packagedDocumentation = ['packages/ui/docs/**'];

const correctnessBeyondRecommended = {
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'array-callback-return': 'error',
  'no-constructor-return': 'error',
  'no-restricted-globals': ['error', ...confusingBrowserGlobals],
  'no-self-compare': 'error',
  'no-template-curly-in-string': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unreachable-loop': 'error',
};
const propsInterfacesExtendingOneBase = {
  '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
};
const underscoreKeepsABinding = {
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
};
const directivesWithoutReasons = {
  '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': false }],
};

const reactCompilerRulesThatReportBugsWithoutTheCompiler = {
  'react-hooks/error-boundaries': 'error',
  'react-hooks/globals': 'error',
  'react-hooks/immutability': 'error',
  'react-hooks/set-state-in-render': 'error',
  'react-hooks/static-components': 'error',
};

const strictContentSecurityPolicy = {
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
};

export default defineConfig(
  globalIgnores([
    ...buildOutput,
    ...wranglerDevState,
    ...testReports,
    ...generatedByScripts,
    ...packagedDocumentation,
  ]),
  {
    files: ['**/*.{ts,tsx,mjs,js,cjs}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      ...correctnessBeyondRecommended,
      ...propsInterfacesExtendingOneBase,
      ...underscoreKeepsABinding,
      ...directivesWithoutReasons,
    },
  },
  {
    files: commentFreeFiles,
    plugins: { repository: noCommentsPlugin },
    rules: { 'repository/no-comments': ['error', { publicApi: publicApiWithDocComments }] },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      ...reactCompilerRulesThatReportBugsWithoutTheCompiler,
    },
  },
  {
    files: ['packages/ui/src/**', 'apps/site/src/**'],
    rules: { 'no-console': 'error', ...strictContentSecurityPolicy },
  },
  {
    files: ['scripts/**', 'tests/**', 'packages/*/test/**', '*.{js,mjs,ts}'],
    ignores: ['scripts/RepositoryPaths.ts'],
    rules: { 'no-restricted-syntax': ['error', pathsFromRepositoryPaths] },
  },
  {
    files: ['tests/{component,browser,accessibility,visual}/**/*.{ts,tsx}'],
    ignores: ['tests/component/support/Browser.ts'],
    rules: { 'no-restricted-syntax': ['error', pathsFromRepositoryPaths, ...noFixedSleeps] },
  },
  {
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...inlineFlags, inlinePixels, ownStateFromDefault],
    },
  },
  {
    files: [
      'packages/ui/src/internal/react/useControllableState.ts',
      'packages/ui/src/forms/color/internal/useColorFollowingValue.ts',
    ],
    rules: { 'no-restricted-syntax': ['error', ...inlineFlags, inlinePixels] },
  },
  ...families.map((family) => ({
    files: [`packages/ui/src/${family}/**/*.{ts,tsx}`],
    ignores: providerLocaleReaders,
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [otherFamiliesInternals(family), providerLocale] },
      ],
    },
  })),
  ...families.flatMap((family) => {
    const readers = providerLocaleReaders.filter((path) =>
      path.startsWith(`packages/ui/src/${family}/`),
    );
    return readers.length
      ? [
          {
            files: readers,
            rules: {
              'no-restricted-imports': ['error', { patterns: [otherFamiliesInternals(family)] }],
            },
          },
        ]
      : [];
  }),
  {
    files: ['packages/ui/src/internal/**/*.{ts,tsx}'],
    ignores: providerLocaleReaders,
    rules: { 'no-restricted-imports': ['error', { patterns: [providerLocale] }] },
  },
  ...siteConfigs,
);
