import { readFileSync } from 'node:fs';
import noHtmlElements from './rules/no-html-elements.js';
import noRawColors from './rules/no-raw-colors.js';
import noRenamedExports from './rules/no-renamed-exports.js';

const { name, version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

/** @type {import('eslint').ESLint.Plugin & { configs: Record<string, import('eslint').Linter.Config> }} */
const plugin = {
  meta: { name, version, namespace: 'envui' },
  rules: {
    'no-html-elements': noHtmlElements,
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
    'envui/no-html-elements': 'error',
    'envui/no-raw-colors': 'error',
    'envui/no-renamed-exports': 'error',
  },
};

export default plugin;
