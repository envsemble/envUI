// Stylelint for the library's and the catalogue's CSS. Existing violations of the rules that the
// token work removes are recorded in stylelint-suppressions.json; anything new fails. See
// docs/library-development.md.

/** Color functions with literal channels; relative colors derived from a token (`hsl(from …)`) pass. */
const rawColorFunction = '/\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\\((?!\\s*from\\b)/i';
const hexColor = '/#[\\da-f]{3,8}\\b/i';

/**
 * Where px may appear: hairlines and offsets that must not scale with the text, such as border and
 * outline widths, focus-ring offsets and shadow offsets, also in custom properties named for them.
 * Radii scale, so they take rem.
 */
const hairlineProperties = [
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

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-recommended'],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    // Colors come from tokens.
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-property-value-disallowed-list': { '/.*/': [rawColorFunction] },
    // Stacking order and weights come from tokens.
    'declaration-property-value-allowed-list': {
      'z-index': ['auto', '/^var\\(--/', '/^calc\\(.*var\\(--/'],
      // A range such as `100 900` is a variable font's weights in @font-face.
      'font-weight': ['inherit', 'normal', '/^var\\(--/', '/^\\d+\\s+\\d+$/'],
    },
    // px only for hairlines; everything that follows the text size uses rem. env() values and
    // fallbacks of custom properties that scripts measure are in CSS pixels.
    'unit-disallowed-list': [
      ['px'],
      { ignoreProperties: { px: hairlineProperties }, ignoreFunctions: ['env', 'var'] },
    ],
    // Reports the order of selectors for different elements, which component CSS does not rely on.
    'no-descending-specificity': null,
  },
  overrides: [
    {
      // Library components take sizes from tokens rather than literal rem values.
      files: ['packages/ui/src/styles/**/*.css'],
      rules: { 'declaration-property-unit-disallowed-list': { '/^(?!--)/': ['rem'] } },
    },
    {
      // The token definitions: literal values belong here, in custom properties.
      files: ['packages/ui/src/styles/Tokens.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'declaration-property-value-disallowed-list': {
          '/^(?!--)/': [rawColorFunction, hexColor],
        },
        'declaration-property-value-allowed-list': null,
        'declaration-property-unit-disallowed-list': null,
      },
    },
  ],
};
