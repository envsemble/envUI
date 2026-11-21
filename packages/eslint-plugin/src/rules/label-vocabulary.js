import { documentationUrl, jsxName, readData, staticValue } from '../utilities.js';

const replaced = Object.entries(readData('vocabulary.json').words).map(([word, use]) => ({
  word: word.toLowerCase(),
  use,
}));

const isLabelAttribute = (name) =>
  ['children', 'label', 'aria-label'].includes(name) || /^[a-z]\w*Label$/.test(name);

const actionComponents = new Set([
  'Button',
  'IconButton',
  'ConfirmButton',
  'CopyButton',
  'Link',
  'Menu.Item',
]);

const isAction = (openingElement) => actionComponents.has(jsxName(openingElement.name));

const isActionChild = (node) =>
  node.parent.type === 'JSXElement' && isAction(node.parent.openingElement);

const mostWordsInALabel = 6;

function labelText(text) {
  const label = text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(?:…|\.\.\.)$/, '');
  if (!label || /[.!?:;,]/.test(label) || label.split(' ').length > mostWordsInALabel)
    return undefined;
  return label;
}

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
      recommended: false,
      url: documentationUrl('label-vocabulary'),
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            description:
              'Words the application keeps as labels, such as Clone or Retry in a developer tool, in any case.',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ allow: [] }],
    messages: {
      replace: 'Write "{{rewritten}}" instead of "{{label}}".',
    },
  },
  create(context) {
    const [{ allow }] = context.options;
    const kept = new Set(allow.map((word) => word.trim().replace(/\s+/g, ' ').toLowerCase()));

    function check(node, text) {
      const label = typeof text === 'string' ? labelText(text) : undefined;
      if (!label) return;
      const lower = label.toLowerCase();
      if (kept.has(lower)) return;
      const entry = replaced.find(({ word }) => lower === word);
      if (entry)
        context.report({
          node,
          messageId: 'replace',
          data: { label, rewritten: rewrite(label, entry) },
        });
    }

    return {
      JSXText(node) {
        if (isActionChild(node)) check(node, node.value);
      },
      JSXExpressionContainer(node) {
        if (!isActionChild(node)) return;
        const { expression } = node;
        if (expression.type === 'Literal') check(node, expression.value);
        else if (expression.type === 'TemplateLiteral' && expression.expressions.length === 0)
          check(node, expression.quasis[0].value.cooked);
      },
      JSXAttribute(node) {
        if (node.value && isAction(node.parent) && isLabelAttribute(jsxName(node.name)))
          check(node, staticValue(node));
      },
    };
  },
};
