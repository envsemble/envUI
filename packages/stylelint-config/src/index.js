// Stylelint config for applications built with envUI: colors and stacking order from tokens,
// and rem for everything that follows the reader's font size, with px only for hairlines.
// See README.md.
import { rawColorCalls, rawColorFunction } from './colorPolicy.js';
import { colorTokenAdvice, tokens } from './tokens.js';

const documentation =
  'https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md';

/**
 * Color functions with a channel that is not a custom property, as a Stylelint regular expression
 * (colorPolicy.js). envUI's own style sheets use it too.
 */
export { rawColorFunction };

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

/** @type {import('stylelint').Config} */
export default {
  rules: {
    'color-no-hex': [
      true,
      {
        message: (hex) => `Raw color ${hex}: ${colorTokenAdvice()}`,
        url: `${documentation}#raw-colors`,
      },
    ],
    'color-named': [
      'never',
      {
        message: (name) => `Raw color ${name}: ${colorTokenAdvice()}`,
        url: `${documentation}#raw-colors`,
      },
    ],
    'declaration-property-value-disallowed-list': [
      { '/.*/': [rawColorFunction] },
      {
        message: (property, value) =>
          `Raw color ${rawColorCalls(value)[0] ?? value} in ${property}: ${colorTokenAdvice(property)}`,
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
