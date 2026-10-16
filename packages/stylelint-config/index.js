// Stylelint config for applications built with envUI: no styles for envUI's private markup, colors
// and stacking order from tokens, and rem for everything that follows the reader's font size, with
// px only for hairlines. See README.md.
import noPrivateClasses from './plugins/no-private-classes.js';
import { colorTokenSuggestion, stackingAdvice } from './tokens.js';

const documentation =
  'https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md';

/** Color functions with literal channels; relative colors derived from a token (`hsl(from …)`) pass. */
const rawColorFunction =
  '/(?<![\\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\\((?!\\s*from\\b)/i';

/**
 * Where px may appear: hairlines and offsets that must not scale with the text, such as border and
 * outline widths, focus-ring offsets and shadow offsets, also in custom properties named for them.
 * Radii scale, so they take rem.
 */
export const hairlineProperties = [
  '/^border(?!.*radius)/',
  '/^outline/',
  '/^column-rule/',
  'box-shadow',
  'text-shadow',
  'filter',
  'text-decoration-thickness',
  'text-underline-offset',
  '/^--.*(?:border|outline|ring|shadow|divider|hairline|stroke)/',
];

/** A whole color function call, for the message. */
const colorCall =
  /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*(?:\([^()]*\)[^()]*)*\)?/i;

/** What to use instead of a raw color, with the envUI tokens for the property it is in. */
const useColorToken = (property) =>
  `use an envUI color token instead, ${colorTokenSuggestion(property)}, so the color follows the theme and keeps its contrast.`;

/** @type {import('stylelint').Config} */
export default {
  plugins: [noPrivateClasses],
  rules: {
    'envui/no-private-classes': [
      true,
      { allow: ['env-theme'], url: `${documentation}#envuino-private-classes` },
    ],
    'color-no-hex': [
      true,
      {
        message: (hex) => `Raw color ${hex}: ${useColorToken()}`,
        url: `${documentation}#raw-colors`,
      },
    ],
    'color-named': [
      'never',
      {
        message: (name) => `Raw color ${name}: ${useColorToken()}`,
        url: `${documentation}#raw-colors`,
      },
    ],
    'declaration-property-value-disallowed-list': [
      { '/.*/': [rawColorFunction] },
      {
        message: (property, value) =>
          `Raw color ${value.match(colorCall)?.[0] ?? value} in ${property}: ${useColorToken(property)}`,
        url: `${documentation}#raw-colors`,
      },
    ],
    'declaration-property-value-allowed-list': [
      { 'z-index': ['auto', '/^var\\(--/', '/^calc\\(.*var\\(--/'] },
      {
        message: (property, value) => `Literal ${property} ${value}: ${stackingAdvice()}`,
        url: `${documentation}#stacking-order`,
      },
    ],
    'unit-disallowed-list': [
      ['px'],
      {
        ignoreProperties: { px: hairlineProperties },
        // env() values and custom property fallbacks that scripts measure are in CSS pixels.
        ignoreFunctions: ['env', 'var'],
        message: (unit) =>
          `Use rem instead of ${unit}, so the size follows the reader's font size; px is only for hairlines: border and outline widths, focus-ring offsets and shadow offsets.`,
        url: `${documentation}#units`,
      },
    ],
  },
};
