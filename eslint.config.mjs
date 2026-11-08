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
 * internal/ folder is its own: code two families use sits in the top-level internal/ (AGENTS.md).
 */
const families = readdirSync(new URL('packages/ui/src/', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !['internal', 'styles', 'assets', 'generated', 'icons'].includes(name));

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
 * Names the site declares with "preview" in them: the site's words for what it shows are example,
 * specimen, tile, figure and stage (AGENTS.md), and preview is an older name. Names it only reads,
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
    'Name it with the site’s words, example, specimen, tile, figure or stage (AGENTS.md): preview is an older name.',
}));

/**
 * A `data-*` attribute set by a conditional between `''` and `undefined`, in JSX or in an object of
 * props: a state that is on or off goes through `flag()` (AGENTS.md).
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
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: String.raw`^(\.\./)+(${families
                .filter((other) => other !== family)
                .join('|')})/([\w-]+/)*internal(/|$)`,
              message: `Another family's internal/ folder is its own: move what ${family}/ shares with it to the top-level internal/ (AGENTS.md).`,
            },
          ],
        },
      ],
    },
  })),
  {
    // The site's own code. Examples are application code, where a preview is the product's word,
    // such as a file's or the Markdown editor's.
    files: ['apps/site/src/**/*.{ts,tsx}'],
    ignores: ['apps/site/src/examples/**'],
    rules: { 'no-restricted-syntax': ['error', ...previewNames] },
  },
  {
    // The site reaches the library through its entry points, and what they don't export through
    // @envui-internal, the scripts' documentation model through @docs-model (AGENTS.md): a relative
    // path into either would break unseen when a file there moves.
    files: ['apps/site/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: String.raw`^(\.\./)+(packages/ui/src|scripts)(/|$)`,
              message:
                'Import the library from @envsemble/envui, its internals from @envui-internal/* and the documentation model from @docs-model/* (AGENTS.md).',
            },
          ],
        },
      ],
    },
  },
  {
    // Examples and templates are the code applications and agents copy, so they follow the rules
    // envUI asks of applications: envUI's components over raw elements and no raw colors.
    ...envui.configs.recommended,
    files: ['apps/site/src/examples/**/*.{ts,tsx}'],
  },
);
