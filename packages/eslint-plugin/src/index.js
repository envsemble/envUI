import { readFileSync } from 'node:fs';
import noHandRolledLayout from './rules/no-hand-rolled-layout.js';
import noHtmlElements from './rules/no-html-elements.js';
import noPrivateClasses from './rules/no-private-classes.js';
import noRawColors from './rules/no-raw-colors.js';
import noRenamedExports from './rules/no-renamed-exports.js';

const { name, version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

/** @type {import('eslint').ESLint.Plugin & { configs: Record<string, import('eslint').Linter.Config> }} */
const plugin = {
  meta: { name, version, namespace: 'envui' },
  rules: {
    'no-hand-rolled-layout': noHandRolledLayout,
    'no-html-elements': noHtmlElements,
    'no-private-classes': noPrivateClasses,
    'no-raw-colors': noRawColors,
    'no-renamed-exports': noRenamedExports,
  },
  configs: {},
};

plugin.configs.recommended = {
  name: 'envui/recommended',
  files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
  plugins: { envui: plugin },
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  rules: {
    // A warning: plain CSS layout stays allowed where a primitive can't do what it needs.
    'envui/no-hand-rolled-layout': 'warn',
    'envui/no-html-elements': 'error',
    'envui/no-private-classes': 'error',
    'envui/no-raw-colors': 'error',
    'envui/no-renamed-exports': 'error',
  },
};

export default plugin;
