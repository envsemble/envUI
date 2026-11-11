// ESLint for the library, the catalogue, tests and scripts. Formatting belongs to Prettier and
// styles to Stylelint; this config only reports likely bugs.
import envui from '@envsemble/eslint-plugin-envui';
import js from '@eslint/js';
import { readdirSync } from 'node:fs';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * The library's families, the folders of packages/ui/src that hold components. A family's
 * internal/ folder is its own: code two families use sits in the top-level internal/ (packages/ui/AGENTS.md).
 */
const families = readdirSync(new URL('packages/ui/src/', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !['internal', 'styles', 'assets', 'generated', 'icons'].includes(name));

/** An import of another family's internal/ folder, which a module of `family` may not make. */
const otherFamiliesInternals = (family) => ({
  regex: String.raw`^(\.\./)+(${families
    .filter((other) => other !== family)
    .join('|')})/([\w-]+/)*internal(/|$)`,
  message: `Another family's internal/ folder is its own: move what ${family}/ shares with it to the top-level internal/ (packages/ui/AGENTS.md).`,
});

/**
 * Folders of a family's internal/ that only the modules listed with them may import, besides each
 * other: the Markdown editor's editing, links and preview are its own.
 */
const privateFolders = { 'content/internal/markdown': ['content/MarkdownEditor.tsx'] };

/** Browser globals that are easy to use by accident in place of a local, such as `event`. */
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

/**
 * The site reaches the library through its entry points, and what they don't export through
 * @envui-internal, the scripts' documentation model through @docs-model (apps/site/AGENTS.md): a
 * relative path into either would break unseen when a file there moves.
 */
const siteImports = {
  regex: String.raw`^(\.\./)+(packages/ui/src|scripts)(/|$)`,
  message:
    'Import the library from @envsemble/envui, its internals from @envui-internal/* and the documentation model from @docs-model/* (apps/site/AGENTS.md).',
};

/**
 * The folders of apps/site/src from the top down: a folder imports only the folders after it, so
 * imports between them run one way (apps/site/AGENTS.md). A rule per depth of file, as a relative
 * path to another folder starts with one ../ for each folder the file is in.
 */
const siteFolders = [
  'navigation',
  'pages',
  'banner',
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
];
const siteFolderOrder = siteFolders.slice(1).flatMap((folder, index) =>
  [1, 2, 3].map((depth) => ({
    files: [`apps/site/src/${folder}/${'*/'.repeat(depth - 1)}*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            siteImports,
            {
              regex: String.raw`^(\.\./){${depth}}(${siteFolders.slice(0, index + 1).join('|')})(/|$)`,
              message: `${folder}/ imports only the folders after it in apps/site/AGENTS.md's order: move what both use into ${folder}/ or below it.`,
            },
          ],
        },
      ],
    },
  })),
);

/**
 * The site measures sizes through its one measuring loop, remeasure (apps/site/src/shared/
 * Remeasure.ts), which owns the site's only ResizeObserver.
 */
const siteResizeObserver = {
  selector: "NewExpression[callee.name='ResizeObserver']",
  message:
    'Measure through remeasure (apps/site/src/shared/Remeasure.ts), the site’s one measuring loop.',
};

/**
 * Names the site declares with "preview" in them: the site's words for what it shows are example,
 * specimen, tile, figure and stage (apps/site/AGENTS.md), and preview is an older name. Names it only reads,
 * such as a library prop or an example's import, are left to where they are declared.
 */
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
    'Name it with the site’s words, example, specimen, tile, figure or stage (apps/site/AGENTS.md): preview is an older name.',
}));

/**
 * A `data-*` attribute set by a conditional between `''` and `undefined`, in JSX or in an object of
 * props: a state that is on or off goes through `flag()` (packages/ui/AGENTS.md).
 */
const emptyOrUndefined = `ConditionalExpression:matches([consequent.value=''][alternate.name='undefined'], [consequent.name='undefined'][alternate.value=''])`;
const inlineFlags = [
  `JSXAttribute[name.name=/^data-/] > JSXExpressionContainer > ${emptyOrUndefined}`,
  `Property[key.value=/^data-/] > ${emptyOrUndefined}`,
].map((selector) => ({
  selector,
  message: 'Set a state attribute that is on or off with flag() (src/internal/flag.ts).',
}));

export default defineConfig(
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '.cache/**',
    // Local state of `wrangler dev`.
    '.wrangler/**',
    'test-results/**',
    'playwright-report/**',
    // Generated from pinned inputs by scripts; edit the generator instead.
    'packages/ui/src/icons/**',
    'apps/site/src/brand/EnvUILogo.tsx',
    'apps/site/src/generated/**',
    // Packaged copies of the documentation.
    'packages/ui/docs/**',
  ]),
  {
    files: ['**/*.{ts,tsx,mjs,js,cjs}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      // Correctness rules beyond the recommended sets; each is clean on the current code.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'array-callback-return': 'error',
      'no-constructor-return': 'error',
      'no-restricted-globals': ['error', ...confusingBrowserGlobals],
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      // Public `*Props` interfaces that extend one base type are deliberate, documented names.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      // A leading underscore marks a binding kept on purpose, such as `node: _node` to keep a prop
      // out of a spread.
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
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // The plugin's React Compiler rules that report bugs whether or not the compiler runs.
      // envUI is not compiled with React Compiler, so the rules that only report what the compiler
      // cannot optimize (refs, set-state-in-effect, purity, use-memo, preserve-manual-memoization,
      // incompatible-library, unsupported-syntax, config, gating) stay off.
      'react-hooks/error-boundaries': 'error',
      'react-hooks/globals': 'error',
      'react-hooks/immutability': 'error',
      'react-hooks/set-state-in-render': 'error',
      'react-hooks/static-components': 'error',
    },
  },
  {
    // Shipped code: no logging, and nothing that a strict Content Security Policy blocks.
    files: ['packages/ui/src/**', 'apps/site/src/**'],
    rules: {
      'no-console': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...inlineFlags] },
  },
  ...families.map((family) => ({
    files: [`packages/ui/src/${family}/**/*.{ts,tsx}`],
    rules: { 'no-restricted-imports': ['error', { patterns: [otherFamiliesInternals(family)] }] },
  })),
  ...Object.entries(privateFolders).map(([folder, allowed]) => {
    const [family, ...rest] = folder.split('/');
    const name = rest.at(-1);
    return {
      files: [`packages/ui/src/${family}/**/*.{ts,tsx}`],
      ignores: [
        `packages/ui/src/${folder}/**`,
        ...allowed.map((module) => `packages/ui/src/${module}`),
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              otherFamiliesInternals(family),
              {
                regex: String.raw`(^|/)${rest.join('/')}(/|$)|^\./${name}(/|$)`,
                message: `${folder}/ is private to ${allowed.join(', ')}: build on its public API (eslint.config.mjs, privateFolders).`,
              },
            ],
          },
        ],
      },
    };
  }),
  {
    // The site's own code. Examples are application code, where a preview is the product's word,
    // such as a file's or the Markdown editor's, and where a ResizeObserver is the application's.
    files: ['apps/site/src/**/*.{ts,tsx}'],
    ignores: ['apps/site/src/examples/**'],
    rules: { 'no-restricted-syntax': ['error', ...previewNames, siteResizeObserver] },
  },
  {
    // The measuring loop is the one place in the site that creates a ResizeObserver.
    files: ['apps/site/src/shared/Remeasure.ts'],
    rules: { 'no-restricted-syntax': ['error', ...previewNames] },
  },
  {
    files: ['apps/site/src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [siteImports] }] },
  },
  ...siteFolderOrder,
  {
    // Examples and templates are the code applications and agents copy, so they follow the rules
    // envUI asks of applications: envUI's components over raw elements and no raw colors.
    ...envui.configs.recommended,
    files: ['apps/site/src/examples/**/*.{ts,tsx}'],
  },
);
