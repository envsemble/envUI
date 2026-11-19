import stylelint from 'stylelint';
import { isHairline, offsetProperty, scaleProperty } from './no-off-scale-values.js';
import { documentationUrl, numbers, propertyMatcher, reportInValue } from '../values.js';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-px';

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

const browserDefaultFontSize = 16;

const asRem = (px) => {
  const rem = Number((px / browserDefaultFontSize).toFixed(4));
  return rem === 0 ? '0' : `${rem}rem`;
};

const pxLengths = (value) =>
  numbers(value).filter(
    ({ unit, functions }) =>
      unit === 'px' && !functions.some((name) => name === 'var' || name === 'env'),
  );

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

const conditionRules = /^(?:media|container|custom-media)$/i;

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  root.walkDecls((declaration) => {
    const property = declaration.prop;
    if (isHairlineProperty(property) || scaleProperty.test(property)) return;
    const offset = offsetProperty.test(property);
    for (const length of pxLengths(declaration.value)) {
      if (offset && isHairline(length)) continue;
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
    }
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
