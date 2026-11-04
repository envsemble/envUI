import { readFileSync } from 'node:fs';
import noHtmlElements from './rules/no-html-elements.js';
import noInlineLayout from './rules/no-inline-layout.js';
import noRawColors from './rules/no-raw-colors.js';
import noRawGraphics from './rules/no-raw-graphics.js';

const { name, version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

/** @type {import('eslint').ESLint.Plugin & { configs: Record<string, import('eslint').Linter.Config> }} */
const plugin = {
  meta: { name, version, namespace: 'envui' },
  rules: {
    'no-html-elements': noHtmlElements,
    'no-inline-layout': noInlineLayout,
    'no-raw-colors': noRawColors,
    'no-raw-graphics': noRawGraphics,
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
    // A warning: plain CSS layout stays allowed where a primitive can't do what it needs.
    'envui/no-inline-layout': 'warn',
    'envui/no-raw-colors': 'error',
    'envui/no-raw-graphics': 'error',
  },
};

export default plugin;
