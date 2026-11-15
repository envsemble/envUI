import { rawColorCalls, rawColorFunction } from './colorPolicy.js';
import noContrastBreakingPairs from './rules/no-contrast-breaking-pairs.js';
import noFocusOutlineRemoval from './rules/no-focus-outline-removal.js';
import noOffScaleValues from './rules/no-off-scale-values.js';
import noPx, { hairlineProperties } from './rules/no-px.js';
import noUnknownCustomProperties from './rules/no-unknown-custom-properties.js';
import { colorTokenAdvice, tokens } from './tokens.js';

const documentation =
  'https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md';

export { rawColorFunction };

export { hairlineProperties };

const stackingTokens = Object.values(tokens)
  .flat()
  .filter((name) => /^--(?:env-)?z(?:-index)?-/.test(name))
  .sort();

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

/** @type {import('stylelint').Config} */
export default {
  plugins: [
    noPx,
    noOffScaleValues,
    noUnknownCustomProperties,
    noContrastBreakingPairs,
    noFocusOutlineRemoval,
  ],
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
    'envui/no-px': true,
    'envui/no-off-scale-values': true,
    'envui/no-unknown-custom-properties': true,
    'envui/no-contrast-breaking-pairs': true,
    'envui/no-focus-outline-removal': true,
  },
};
