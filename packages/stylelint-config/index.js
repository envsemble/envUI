// Stylelint config for applications built with envUI: no styles for envUI's private markup, colors
// and stacking order from tokens, and rem for everything that follows the reader's font size, with
// px only for hairlines. See README.md.
import noPrivateClasses from './plugins/no-private-classes.js';
import { colorTokenSuggestion, stackingAdvice } from './tokens.js';

const documentation =
  'https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md';

/** Not inside `url(…)`, where a data URL can spell colors of its own image. */
const outsideUrl = String.raw`(?<!\burl\(\s*(?:"[^"]*|'[^']*|[^"')]*))`;
/** Not inside a CSS string, such as the text of `content: "rgb(1 2 3)"`. */
const outsideString = String.raw`(?<!^(?:[^"'\\]|\\.|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')*(?:"(?:[^"\\]|\\.)*|'(?:[^'\\]|\\.)*))`;
/** The start of a color function call. */
const colorFunctionStart = String.raw`(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(`;
/**
 * Arguments with a literal channel: a number, percentage or angle among the channels, before the
 * `/` of the alpha and outside nested calls. `oklch(var(--l) var(--c) var(--h))` and
 * `rgb(var(--rgb) / 50%)` take every channel from custom properties, and a relative color
 * (`hsl(from …)`) derives them from a token.
 */
const literalChannel = String.raw`(?!\s*from\b)(?:[^()/"']|\((?:[^()]|\([^()]*\))*\))*?(?<![\w.-])[+-]?(?:\d|\.\d)`;

/**
 * Color functions with literal channels, as a Stylelint regular expression; relative colors derived
 * from a token (`hsl(from …)`), channels from custom properties and colors inside `url()` or a
 * string pass. envUI's own style sheets use it too.
 */
export const rawColorFunction = `/${outsideString}${outsideUrl}${colorFunctionStart}(?=${literalChannel})/i`;

/**
 * The z-index values that pass: `auto`, the global keywords, and a custom property, also inside
 * calc(). envUI's own style sheets use the same list.
 */
export const stackingValues = [
  'auto',
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
  '/^var\\(--/',
  '/^calc\\(.*var\\(--/',
];

/**
 * Where px may appear: hairlines and offsets that must not scale with the text, such as border and
 * outline widths, focus-ring offsets and shadow offsets. Custom properties take px only when their
 * name ends in one of those: `--…-border-width`, `--…-ring-offset`, `--…-shadow`, `--…-hairline`.
 * Radii and table spacing scale, so they take rem. envUI's own style sheets use this list too, so
 * the two cannot drift apart.
 */
export const hairlineProperties = [
  '/^border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-width)?$/',
  '/^outline(?:-width|-offset)?$/',
  '/^column-rule(?:-width)?$/',
  'box-shadow',
  'text-shadow',
  'filter',
  '/^(?:-webkit-)?backdrop-filter$/',
  'stroke-width',
  'text-decoration-thickness',
  'text-underline-offset',
  '/^--[\\w-]*(?:border|outline|ring|divider|rule|stroke)-(?:width|offset)$/',
  '/^--[\\w-]*(?:shadow|hairline)$/',
];

/** A whole color function call with literal channels outside url() and strings, for the message. */
const colorCall = new RegExp(
  String.raw`${outsideString}${outsideUrl}${colorFunctionStart}(?=${literalChannel})[^()]*(?:\([^()]*\)[^()]*)*\)?`,
  'i',
);

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
      { 'z-index': stackingValues },
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
