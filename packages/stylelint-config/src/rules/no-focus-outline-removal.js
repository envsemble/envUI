import stylelint from 'stylelint';
import { documentationUrl, reportInValue } from '../values.js';

const {
  createPlugin,
  utils: { ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-focus-outline-removal';

/** Whether a declaration removes the outline: `outline: none`, `0` or `outline-style: none`. */
function removesOutline(declaration) {
  const property = declaration.prop.toLowerCase();
  const words = declaration.value.trim().toLowerCase().split(/\s+/);
  if (property === 'outline-style') return words.includes('none');
  if (property === 'outline') return words.includes('none') || words.join(' ') === '0';
  return false;
}

/** The properties that draw a focus indicator in the outline's place. */
const replacement =
  /^(?:box-shadow|border(?:-[a-z]+)*|background(?:-[a-z]+)*|text-decoration(?:-[a-z]+)*)$/i;

const messages = ruleMessages(ruleName, {
  rejected: (value) =>
    `outline: ${value} on :focus-visible removes the focus ring: leave envUI's focus ring, or draw another ring, such as box-shadow: 0 0 0 2px var(--env-color-border-focus).`,
});

/**
 * Whether a selector styles the focused element itself, `.item:focus-visible`, rather than
 * something inside it or a pseudo-element of it.
 */
const targetsFocused = (selector) =>
  selector
    .split(',')
    .some(
      (one) =>
        /:focus-visible(?:[:.[\w-][^\s>+~]*)?$/i.test(one.trim()) &&
        !/:focus-visible[^\s>+~]*::/i.test(one),
    );

/** Whether a rule draws a focus ring: a visible outline or a box shadow on :focus-visible. */
const drawsRing = (node) =>
  /:focus-visible/i.test(node.selector) &&
  node.nodes.some(
    (child) =>
      child.type === 'decl' &&
      ((/^outline(?:-width|-style)?$/i.test(child.prop) && !removesOutline(child)) ||
        /^box-shadow$/i.test(child.prop)),
  );

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  let ringElsewhere = false;
  root.walkRules((node) => {
    if (drawsRing(node)) ringElsewhere = true;
  });
  if (ringElsewhere) return;
  root.walkRules((node) => {
    if (!targetsFocused(node.selector)) return;
    const declarations = node.nodes.filter((child) => child.type === 'decl');
    if (declarations.some((declaration) => replacement.test(declaration.prop))) return;
    for (const declaration of declarations)
      if (removesOutline(declaration))
        reportInValue({
          result,
          ruleName,
          declaration,
          message: messages.rejected(declaration.value.trim()),
          start: 0,
          length: declaration.value.length,
        });
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = { url: documentationUrl(ruleName.replace('/', '')) };

export default createPlugin(ruleName, rule);
