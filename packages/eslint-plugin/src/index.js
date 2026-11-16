import { readFileSync } from 'node:fs';
import labelVocabulary from './rules/label-vocabulary.js';
import noFieldInListRow from './rules/no-field-in-list-row.js';
import noHtmlElements from './rules/no-html-elements.js';
import noLinkInClickableRow from './rules/no-link-in-clickable-row.js';
import noRawColors from './rules/no-raw-colors.js';
import noRawGraphics from './rules/no-raw-graphics.js';

const { name, version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

const rules = {
  'label-vocabulary': labelVocabulary,
  'no-field-in-list-row': noFieldInListRow,
  'no-html-elements': noHtmlElements,
  'no-link-in-clickable-row': noLinkInClickableRow,
  'no-raw-colors': noRawColors,
  'no-raw-graphics': noRawGraphics,
};

/** @type {import('eslint').ESLint.Plugin & { configs: Record<string, import('eslint').Linter.Config> }} */
const plugin = {
  meta: { name, version, namespace: 'envui' },
  rules,
  configs: {},
};

/** @type {import('eslint').Linter.Config} */
const recommended = {
  name: 'envui/recommended',
  files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
  plugins: { envui: plugin },
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  rules: Object.fromEntries(Object.keys(rules).map((rule) => [`envui/${rule}`, 'error'])),
};
plugin.configs.recommended = recommended;

export default plugin;
