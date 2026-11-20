import stylelint from 'stylelint';
import { tokens } from '../tokens.js';
import { documentationUrl, reportInValue } from '../values.js';

const {
  createPlugin,
  utils: { ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-contrast-breaking-pairs';

function wholeToken(value) {
  const match = /^\s*var\(\s*(--env-color-(fg|bg)-([\w-]+?))\s*(?:,.*)?\)\s*$/is.exec(value);
  return match ? { name: match[1], role: match[2], rest: match[3] } : undefined;
}

const backgroundProperty = /^background(?:-color)?$/i;
const textProperty = /^color$/i;
const textSign = /^(?:color|font(?:-.+)?|line-height|text-.+)$/i;
const maskProperty = /^(?:-webkit-)?mask(?:-|$)/i;

const colorTokens = tokens.color ?? [];
const example = (prefix) =>
  colorTokens.find((name) => name === `${prefix}default`) ??
  colorTokens.find((name) => name.startsWith(prefix));

const fillsFor = (surface) =>
  colorTokens.filter(
    (name) =>
      name.startsWith('--env-color-bg-') &&
      name.slice('--env-color-bg-'.length).split('-').includes(surface),
  );

const messages = ruleMessages(ruleName, {
  textAsBackground: (name, property) =>
    `${name} is a text color, not a fill: write a var(--env-color-bg-…) token in ${property}, such as var(${example('--env-color-bg-')}).`,
  backgroundAsText: (name) =>
    `${name} is a fill, not a text color: write a var(--env-color-fg-…) token in color, such as var(${example('--env-color-fg-')}).`,
  wrongFill: (text, fill, surface) =>
    `${text} is made for the ${surface} fills, not ${fill}: write one of the ${surface} fills, such as var(${fillsFor(surface)[0] ?? `--env-color-bg-${surface}`}), or a text color made for ${fill}.`,
});

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  root.walkRules((node) => {
    let text;
    let fill;
    const declares = (property) =>
      node.nodes.some(
        (declaration) => declaration.type === 'decl' && property.test(declaration.prop),
      );
    const holdsText = declares(textSign) && !declares(maskProperty);
    for (const declaration of node.nodes) {
      if (declaration.type !== 'decl') continue;
      const token = wholeToken(declaration.value);
      if (!token) continue;
      const at = { start: declaration.value.indexOf(token.name), length: token.name.length };
      if (backgroundProperty.test(declaration.prop)) {
        if (token.role === 'fg') {
          if (holdsText)
            reportInValue({
              result,
              ruleName,
              declaration,
              message: messages.textAsBackground(token.name, declaration.prop),
              ...at,
            });
        } else fill = { declaration, token };
      } else if (textProperty.test(declaration.prop)) {
        if (token.role === 'bg')
          reportInValue({
            result,
            ruleName,
            declaration,
            message: messages.backgroundAsText(token.name),
            ...at,
          });
        else text = { declaration, token, ...at };
      }
    }
    const surface = text && /^on-([a-z]+)/.exec(text.token.rest)?.[1];
    if (!text || !surface || !fill) return;
    if (fill.token.rest.split('-').includes(surface)) return;
    reportInValue({
      result,
      ruleName,
      declaration: text.declaration,
      message: messages.wrongFill(text.token.name, fill.token.name, surface),
      start: text.start,
      length: text.length,
    });
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = { url: documentationUrl(ruleName.replace('/', '')) };

export default createPlugin(ruleName, rule);
