import { documentationUrl, jsxName, stringParts } from '../utilities.js';

/** DOM and test-runner methods whose first argument is a CSS selector. */
const selectorMethods = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
  'locator',
]);
/** `element.classList` methods whose arguments are class names. */
const classListMethods = new Set(['add', 'remove', 'toggle', 'contains', 'replace']);
/** Tags of CSS-in-JS template literals that hold style sheets. */
const styleTags = new Set(['css', 'injectGlobal', 'createGlobalStyle', 'global']);

/**
 * envUI classes in a class list: words that start with `env-`, and `.env-` selectors inside a word,
 * as in a utility class's arbitrary variant such as `[&_.env-button]:p-2`.
 */
function classListNames(text) {
  const names = [];
  for (const word of text.split(/\s+/))
    for (const match of word.matchAll(/(?:^|\.)(env-[\w-]*)/g)) names.push(match[1]);
  return names;
}

/** envUI classes a CSS selector or style sheet selects: `.env-…` and `[class*="env-…"]`. */
function selectorNames(text) {
  const names = [];
  for (const match of text.matchAll(
    /\.(env-[\w-]*)|\[\s*class\s*[~|^$*]?=\s*["']?\s*(env-[\w-]*)/g,
  ))
    names.push(match[1] ?? match[2]);
  return names;
}

/** Whether a node tags a CSS-in-JS `styled` template: styled.div, styled(Card), styled.div.attrs(). */
function isStyledTag(tag) {
  if (tag.type === 'MemberExpression')
    return (
      isStyledTag(tag.object) || (tag.object.type === 'Identifier' && tag.object.name === 'styled')
    );
  if (tag.type === 'CallExpression') return isStyledTag(tag.callee);
  return tag.type === 'Identifier' && tag.name === 'styled';
}

/** The name of the method a call invokes, such as `querySelector` in `document.querySelector()`. */
function methodName(callee) {
  return callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier'
    ? callee.property.name
    : undefined;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: "Disallow envUI's private `env-` classes in class names and selectors",
      recommended: true,
      url: documentationUrl('no-private-classes'),
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            description:
              'envUI classes that may be used, such as the documented `env-theme` boundary.',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
          attributes: {
            description: 'JSX attributes that hold class names.',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
          functions: {
            description: 'Functions whose arguments are class names, such as clsx.',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      {
        allow: ['env-theme'],
        attributes: ['className', 'class'],
        functions: ['clsx', 'cx', 'classnames', 'classNames', 'cn', 'twMerge', 'twJoin'],
      },
    ],
    messages: {
      className:
        '{{name}} is a private envUI class: its name and styles can change in any envUI release. Use the component and its props instead, and put your own class on your own element for anything else.',
      selector:
        "{{name}} selects envUI's private markup, which can change in any envUI release. Find the element by its role or label, or through a ref or a data attribute you own.",
      stylesheet:
        "{{name}} styles envUI's private markup, which can change in any envUI release. Use the component's props and envUI's tokens, or style a class of your own.",
    },
  },
  create(context) {
    const [{ allow, attributes, functions }] = context.options;
    const allowed = new Set(allow);
    const { visitorKeys } = context.sourceCode;
    const classFunctions = new Set(functions);
    // A CSS module's class lookup, styles['env-x'], names a local class rather than envUI's.
    const skip = (node) =>
      node.type === 'MemberExpression' && node.computed && node.property.type === 'Literal';
    const insideClassAttribute = (node) =>
      context.sourceCode
        .getAncestors(node)
        .some(
          (ancestor) =>
            ancestor.type === 'JSXAttribute' && attributes.includes(jsxName(ancestor.name)),
        );

    function check(node, find, messageId) {
      const parts =
        node.type === 'JSXText'
          ? [{ node, text: node.value, open: false }]
          : stringParts(node, visitorKeys, { skip });
      for (const part of parts) {
        const names = find(part.text);
        names.forEach((name, index) => {
          if (allowed.has(name)) return;
          const unfinished = part.open && index === names.length - 1 && part.text.endsWith(name);
          context.report({
            node: part.node,
            messageId,
            data: { name: unfinished ? `${name}…` : name },
          });
        });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.value && attributes.includes(jsxName(node.name)))
          check(node.value, classListNames, 'className');
      },
      CallExpression(node) {
        const { callee } = node;
        if (callee.type === 'Identifier' && classFunctions.has(callee.name)) {
          if (!insideClassAttribute(node))
            for (const argument of node.arguments) check(argument, classListNames, 'className');
          return;
        }
        const method = methodName(callee);
        if (method === undefined || node.arguments.length === 0) return;
        if (selectorMethods.has(method)) check(node.arguments[0], selectorNames, 'selector');
        else if (method === 'getElementsByClassName')
          check(node.arguments[0], classListNames, 'selector');
        else if (classListMethods.has(method) && methodName(callee.object) === 'classList')
          for (const argument of node.arguments) check(argument, classListNames, 'className');
      },
      TaggedTemplateExpression(node) {
        const { tag } = node;
        if ((tag.type === 'Identifier' && styleTags.has(tag.name)) || isStyledTag(tag))
          check(node.quasi, selectorNames, 'stylesheet');
      },
      JSXElement(node) {
        if (jsxName(node.openingElement.name) !== 'style') return;
        for (const child of node.children)
          if (child.type === 'JSXExpressionContainer' || child.type === 'JSXText')
            check(child, selectorNames, 'stylesheet');
      },
    };
  },
};
