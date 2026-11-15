import { documentationUrl, jsxName, readData, staticValue } from '../utilities.js';

/** The words a label never uses, by their lowercase spelling, with the word to write instead. */
const replaced = Object.entries(readData('vocabulary.json').words).map(([word, use]) => ({
  word: word.toLowerCase(),
  use,
}));

/** Whether an attribute holds a label: children, label, aria-label, title or a …Label. */
const isLabelAttribute = (name) =>
  ['children', 'label', 'aria-label', 'title'].includes(name) || /^[a-z]\w*Label$/.test(name);

/** The most words a label has; longer text is a sentence, which the rule leaves alone. */
const labelWords = 6;

/** A label's text without its trailing ellipsis, or undefined for text that reads as a sentence. */
function labelText(text) {
  const label = text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(?:…|\.\.\.)$/, '');
  if (!label || /[.!?:;,]/.test(label) || label.split(' ').length > labelWords) return undefined;
  return label;
}

/** The label as it would read with the replaced word written instead. */
function rewrite(label, { word, use }) {
  const rest = label.slice(word.length);
  const first = label[0] === label[0].toLowerCase() ? use[0].toLowerCase() : use[0];
  return `${first}${use.slice(1)}${rest}`;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Disallow words in labels that envUI's vocabulary replaces",
      recommended: true,
      url: documentationUrl('label-vocabulary'),
    },
    schema: [],
    messages: {
      replace: 'Write "{{rewritten}}" instead of "{{label}}".',
    },
  },
  create(context) {
    function check(node, text) {
      const label = typeof text === 'string' ? labelText(text) : undefined;
      if (!label) return;
      const lower = label.toLowerCase();
      const entry = replaced.find(({ word }) => lower === word || lower.startsWith(`${word} `));
      if (entry)
        context.report({
          node,
          messageId: 'replace',
          data: { label, rewritten: rewrite(label, entry) },
        });
    }

    return {
      JSXText(node) {
        check(node, node.value);
      },
      JSXExpressionContainer(node) {
        if (node.parent.type !== 'JSXElement' && node.parent.type !== 'JSXFragment') return;
        const { expression } = node;
        if (expression.type === 'Literal') check(node, expression.value);
        else if (expression.type === 'TemplateLiteral' && expression.expressions.length === 0)
          check(node, expression.quasis[0].value.cooked);
      },
      JSXAttribute(node) {
        if (node.value && isLabelAttribute(jsxName(node.name))) check(node, staticValue(node));
      },
    };
  },
};
