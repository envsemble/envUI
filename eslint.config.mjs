import envui from '@envsemble/eslint-plugin-envui';
import js from '@eslint/js';
import { readdirSync } from 'node:fs';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { repositoryPlugin } from './scripts/lint/NoComments.ts';

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

const siteImports = {
  regex: String.raw`^(\.\./)+(packages/ui/src|scripts)(/|$)`,
  message:
    'Import the library from @envsemble/envui and its internals from @envui-internal/*; the site imports nothing of scripts/.',
};

const siteInternals = {
  'content/internal/codeHighlighting':
    'The highlighter that makes the code tokens a pre-rendered page hands the library.',
  'content/internal/givenCodeTokens':
    'The pre-rendered page’s code tokens, handed to the library’s components before they hydrate.',
  'content/internal/givenMarkdownTrees':
    'The pre-rendered page’s Markdown trees, handed to the library’s components before they hydrate.',
  'internal/provider/LinkComponentContext':
    'The link component an application gives the library, which the site’s own links follow.',
  'internal/dom/paints': 'What a box paints, which the fit centres a picture on.',
  'internal/motion/motionTokens':
    'How a motion token is read and eased, as the library’s own motion reads it.',
  'styles/SegmentedControl.css':
    'The look of the Design/Code switch, whose segments are links rather than the radios SegmentedControl renders.',
};
const siteInternalImports = {
  regex: String.raw`^@envui-internal/(?!(${Object.keys(siteInternals).join('|')})$)`,
  message:
    'The site imports only the library internals listed in eslint.config.mjs (siteInternals): keep a small helper of its own in apps/site/src/shared/, or list the module with its reason.',
};

const siteFolders = [
  'navigation',
  'pages',
  'frame',
  'search',
  'brand',
  'template',
  'specimens',
  'figures',
  'markdown',
  'tiles',
  'motion',
  'fit',
  'routes',
  'loading',
  'display',
  'examples',
  'shared',
  'generated',
  'documentation',
];
const folderDepths = [1, 2, 3];
const siteFolderOrder = siteFolders.slice(1).flatMap((folder, index) =>
  folderDepths.map((depth) => ({
    files: [`apps/site/src/${folder}/${'*/'.repeat(depth - 1)}*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            siteImports,
            siteInternalImports,
            {
              regex: String.raw`^(\.\./){${depth}}(${siteFolders.slice(0, index + 1).join('|')})(/|$)`,
              message: `${folder}/ imports only the folders after it in siteFolders, in eslint.config.mjs: move what both use into ${folder}/ or below it.`,
            },
          ],
        },
      ],
    },
  })),
);

const siteResizeObserver = {
  selector: "NewExpression[callee.name='ResizeObserver']",
  message:
    'Measure through remeasure (apps/site/src/shared/Remeasure.ts), the site’s one measuring loop.',
};

const previewNames = [
  'VariableDeclarator > Identifier.id',
  'FunctionDeclaration > Identifier.id',
  'ClassDeclaration > Identifier.id',
  'TSTypeAliasDeclaration > Identifier.id',
  'TSInterfaceDeclaration > Identifier.id',
  'TSPropertySignature > Identifier.key',
  'MethodDefinition > Identifier.key',
  'PropertyDefinition > Identifier.key',
  'ObjectExpression > Property > Identifier.key',
  ':function > Identifier.params',
].map((declared) => ({
  selector: `${declared}[name=/preview/i]`,
  message:
    'Name it with the site’s words, example, specimen, tile, figure or stage: preview is an older name.',
}));

const emptyOrUndefined = `ConditionalExpression:matches([consequent.value=''][alternate.name='undefined'], [consequent.name='undefined'][alternate.value=''])`;
const inlineFlags = [
  `JSXAttribute[name.name=/^data-/] > JSXExpressionContainer > ${emptyOrUndefined}`,
  `Property[key.value=/^data-/] > ${emptyOrUndefined}`,
].map((selector) => ({
  selector,
  message: 'Set a state attribute that is on or off with flag() (src/internal/flag.ts).',
}));

const ownStateFromDefault = {
  selector: "CallExpression[callee.name='useState'] Identifier[name=/^default[A-Z]/]",
  message:
    'Keep a value that has a default prop in useControllableState (src/internal/react/useControllableState.ts), not in a useState of its own.',
};

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
    plugins: { repository: repositoryPlugin },
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
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...inlineFlags, ownStateFromDefault] },
  },
  {
    files: [
      'packages/ui/src/internal/react/useControllableState.ts',
      'packages/ui/src/forms/color/internal/useColorState.ts',
    ],
    rules: { 'no-restricted-syntax': ['error', ...inlineFlags] },
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
  {
    files: ['apps/site/src/**/*.{ts,tsx}'],
    ignores: ['apps/site/src/examples/**'],
    rules: { 'no-restricted-syntax': ['error', ...previewNames, siteResizeObserver] },
  },
  {
    files: ['apps/site/src/shared/Remeasure.ts'],
    rules: { 'no-restricted-syntax': ['error', ...previewNames] },
  },
  {
    files: ['apps/site/src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [siteImports, siteInternalImports] }] },
  },
  ...siteFolderOrder,
  {
    ...envui.configs.strict,
    files: ['apps/site/src/examples/**/*.{ts,tsx}'],
  },
);
