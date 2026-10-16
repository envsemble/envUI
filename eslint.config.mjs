// ESLint for the library, the catalogue, tests and scripts. Formatting belongs to Prettier and
// styles to Stylelint; this config only reports likely bugs.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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

export default defineConfig(
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '.cache/**',
    'test-results/**',
    'playwright-report/**',
    // Generated from pinned inputs by scripts; edit the generator instead.
    'packages/ui/src/icons/**',
    'packages/ui/src/EnvUILogo.tsx',
    'apps/catalogue/src/generated/**',
    // Packaged copies of the README, skills and documentation.
    'packages/ui/docs/**',
    'packages/ui/skills/**',
    // Codemod fixtures: inputs and expected outputs, compared byte for byte.
    'packages/codemods/test/fixtures/**',
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
    files: ['packages/ui/src/**', 'apps/catalogue/src/**'],
    rules: {
      'no-console': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
);
