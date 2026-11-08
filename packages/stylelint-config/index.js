// Stylelint config for applications built with envUI: colors and stacking order from tokens,
// and rem for everything that follows the reader's font size, with px only for hairlines.
// See README.md.
import { colorTokenSuggestion, tokens } from './tokens.js';

const documentation =
  'https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md';

/** Not inside `url(…)`, where a data URL can spell colors of its own image. */
const outsideUrl = String.raw`(?<!\burl\(\s*(?:"[^"]*|'[^']*|[^"')]*))`;
/** Not inside a CSS string, such as the text of `content: "rgb(1 2 3)"`. */
const outsideString = String.raw`(?<!^(?:[^"'\\]|\\.|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')*(?:"(?:[^"\\]|\\.)*|'(?:[^'\\]|\\.)*))`;
/** The start of a color function call. */
const colorFunctionStart = String.raw`(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(`;
/**
 * How deeply the patterns below follow nested parentheses, such as a fallback's fallback. A
 * regular expression can't recurse, so the patterns are built to this depth, which no real value
 * reaches; deeper nesting counts as raw. The ESLint plugin's no-raw-colors follows fallbacks to the
 * same depth.
 */
const nestingDepth = 8;
/** Builds a pattern `nestingDepth` levels deep, each level wrapping the one inside it. */
const nested = (innermost, wrap) =>
  Array.from({ length: nestingDepth }).reduce((inner) => wrap(inner), innermost);
/**
 * A custom property whose fallback, if it has one, is custom properties too, separated by spaces
 * or commas, each with a fallback of custom properties in turn: `var(--a, var(--b, var(--c)))`.
 * The ESLint plugin's no-raw-colors reads fallbacks the same way.
 */
const customProperty = nested(
  String.raw`var\(\s*--[\w-]+\s*\)`,
  (inner) => String.raw`var\(\s*--[\w-]+\s*(?:,[\s,]*(?:${inner}(?=[\s,)])[\s,]*)*)?\)`,
);
/** Text whose parentheses balance. */
const balanced = nested('[^()]*', (inner) => String.raw`(?:[^()]|\(${inner}\))*`);
/**
 * An alpha that keeps a color from custom properties: a literal number or percentage, such as
 * `0.5` or `50%`, or one custom property whose fallbacks are custom properties, as a channel's are.
 * The ESLint plugin's no-raw-colors reads it alike.
 */
const alpha = String.raw`\s*(?:[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?%?|${customProperty})\s*`;
/**
 * Arguments that make no raw color: a relative color derived from a token (`hsl(from …)`), or
 * channels that all come from custom properties, each a `var()` whose fallback, if any, is a
 * `var()` too, as in `oklch(var(--l) var(--c) var(--h))` or `rgb(var(--brand-rgb))`, with an
 * alpha that is a literal or a custom property, after the `/` or as the last of two or four
 * comma-separated arguments: `rgb(var(--rgb) / 50%)` and `rgba(var(--rgb), var(--alpha))` alike.
 * `color()` names its color space first.
 */
const customChannels = String.raw`(?:\s*from\b|(?:(?<=color\()\s*[a-z][\w-]*\s+)?\s*${customProperty}(?:\s+${customProperty})*\s*(?:\/${alpha})?\)|\s*${customProperty}\s*(?:,\s*${customProperty}\s*,\s*${customProperty}\s*)?(?:,${alpha})?\))`;

/**
 * Color functions with a channel that is not a custom property, as a Stylelint regular expression:
 * a number, percentage, angle, keyword such as `none`, calculation or fallback. Relative colors
 * derived from a token (`hsl(from …)`), channels from custom properties and colors inside `url()`
 * or a string pass. envUI's own style sheets use it too.
 */
export const rawColorFunction = `/${outsideString}${outsideUrl}${colorFunctionStart}(?!${customChannels})/i`;

/** envUI's stacking tokens, the custom properties of z-index layers such as `--env-z-modal`. */
const stackingTokens = Object.values(tokens)
  .flat()
  .filter((name) => /^--(?:env-)?z(?:-index)?-/.test(name))
  .sort();

/** What to do instead of a literal z-index, depending on whether envUI has stacking tokens. */
function stackingAdvice() {
  if (stackingTokens.length > 0) {
    const named = (pattern) => stackingTokens.find((name) => pattern.test(name));
    const examples = [
      [named(/-sticky$/), 'a sticky header'],
      [named(/-modal$/), 'a modal layer'],
    ].filter(([name]) => name);
    const such = examples.length
      ? examples.map(([name, use]) => `var(${name}) for ${use}`).join(' or ')
      : `var(${stackingTokens[0]})`;
    const family = stackingTokens[0].slice(0, stackingTokens[0].lastIndexOf('-') + 1);
    return `use an envUI stacking token (${family}…) instead, such as ${such}, with calc() for a step between two, so the application's layers keep one order with envUI's popups and dialogs.`;
  }
  return 'envUI has no stacking tokens yet. Avoid a literal z-index, or set it through a documented custom property of your own, such as var(--app-z-header), so the order of layers lives in one place.';
}

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

/** A whole raw color function call outside url() and strings, for the message. */
const colorCall = new RegExp(
  String.raw`${outsideString}${outsideUrl}${colorFunctionStart}(?!${customChannels})${balanced}\)?`,
  'i',
);

/** What to use instead of a raw color, with the envUI tokens for the property it is in. */
const useColorToken = (property) =>
  `use an envUI color token instead, ${colorTokenSuggestion(property)}, so the color follows the theme and keeps its contrast.`;

/** @type {import('stylelint').Config} */
export default {
  rules: {
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
