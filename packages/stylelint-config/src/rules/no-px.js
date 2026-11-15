import stylelint from 'stylelint';
import { scaleProperty } from './no-off-scale-values.js';
import { documentationUrl, numbers, propertyMatcher, reportInValue } from '../values.js';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-px';

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

const isHairlineProperty = propertyMatcher(hairlineProperties);

/** The base size a rem stands for, the browser's default font size. */
const rootSize = 16;

/** A length in px as rem, such as `1.5rem` for `24px`. */
const asRem = (px) => {
  const rem = Number((px / rootSize).toFixed(4));
  return rem === 0 ? '0' : `${rem}rem`;
};

/** The px lengths of a value outside `var()` fallbacks and `env()`, which are in CSS pixels. */
const pxLengths = (value) =>
  numbers(value).filter(
    ({ unit, functions }) =>
      unit === 'px' && !functions.some((name) => name === 'var' || name === 'env'),
  );

/** A hairline, 1px or less, keeps px: a fix to rem would blur it. */
const isHairline = ({ value }) => Math.abs(value) <= 1;

/** The value with its px lengths, hairlines apart, written in rem. */
function remValue(value) {
  let fixed = '';
  let last = 0;
  for (const length of pxLengths(value)) {
    if (isHairline(length)) continue;
    fixed += value.slice(last, length.index) + asRem(length.value);
    last = length.index + length.text.length;
  }
  return fixed + value.slice(last);
}

const messages = ruleMessages(ruleName, {
  rejected: (px, rem) =>
    `${px}: write ${rem} instead, so the size follows the reader's font size; px is only for hairlines: border and outline widths, focus-ring offsets and shadow offsets.`,
  hairline: (px) =>
    `${px}: draw a hairline with a border, an outline or a box-shadow, where px passes; px is only for border and outline widths, focus-ring offsets and shadow offsets.`,
});

/** The at-rules whose conditions measure lengths. */
const conditionRules = /^(?:media|container|custom-media)$/i;

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  root.walkDecls((declaration) => {
    const property = declaration.prop;
    if (isHairlineProperty(property) || scaleProperty.test(property)) return;
    for (const length of pxLengths(declaration.value))
      reportInValue({
        result,
        ruleName,
        declaration,
        message: isHairline(length)
          ? messages.hairline(length.text)
          : messages.rejected(length.text, asRem(length.value)),
        start: length.index,
        length: length.text.length,
        fix: isHairline(length)
          ? undefined
          : () => {
              declaration.value = remValue(declaration.value);
            },
      });
  });
  root.walkAtRules(conditionRules, (atRule) => {
    const offset = 1 + atRule.name.length + (atRule.raws.afterName ?? ' ').length;
    for (const length of pxLengths(atRule.params)) {
      const index = offset + length.index;
      report({
        result,
        ruleName,
        node: atRule,
        message: messages.rejected(length.text, asRem(length.value)),
        index,
        endIndex: index + length.text.length,
        fix: () => {
          atRule.params = remValue(atRule.params);
        },
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = { url: documentationUrl(ruleName.replace('/', '')), fixable: true };

export default createPlugin(ruleName, rule);
