import { expressionStandIn, rawColorCalls } from '../colorPolicy.js';
import { colorTokenAdvice } from '../tokens.js';
import { documentationUrl, jsxName, propertyName, walk } from '../utilities.js';

const namedColors = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet ' +
    'brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan ' +
    'darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta ' +
    'darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue ' +
    'darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey ' +
    'dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray ' +
    'green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush ' +
    'lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray ' +
    'lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon ' +
    'mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue ' +
    'mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin ' +
    'navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen ' +
    'paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple ' +
    'rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna ' +
    'silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle ' +
    'tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
  ).split(' '),
);

const colorProperty =
  /color|background|border|outline|fill|stroke|shadow|caret|accent|decoration|column-?rule|scrollbar|flood|lighting/i;
const notColorProperty =
  /radius|width|style|clip|origin|position|size|repeat|attachment|blend|offset|collapse|spacing/i;

const hexColor = /(?<![\w&-])#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?![\w\uE000-])/gi;

const builtHexColor = /(?<![\w&-])#(?=[\da-f]*\uE000)[\da-f\uE000]+(?![\w-])/gi;

const quotedOrUrl = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi;

function rawColors(text, property) {
  const value = text.replace(quotedOrUrl, ' ');
  const found = [
    ...[...value.matchAll(hexColor)].map((match) => match[0]),
    ...[...value.matchAll(builtHexColor)].map((match) => match[0]),
    ...rawColorCalls(value),
  ];
  if (
    property &&
    !property.startsWith('--') &&
    colorProperty.test(property) &&
    !notColorProperty.test(property)
  )
    for (const [word] of value.matchAll(/(?<![\w-])[a-z]+(?![\w(-])/gi))
      if (namedColors.has(word.toLowerCase())) found.push(word);
  return found.map((color) => color.replaceAll(expressionStandIn, `\${…}`));
}

const isStringLiteral = (node) => node.type === 'Literal' && typeof node.value === 'string';

const templateText = (node) =>
  node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join(expressionStandIn);

const concatenated = (node) =>
  node.type === 'BinaryExpression' && node.operator === '+'
    ? [...concatenated(node.left), ...concatenated(node.right)]
    : [node];

const isConcatenation = (node) =>
  node.type === 'BinaryExpression' &&
  node.operator === '+' &&
  concatenated(node).some(
    (operand) => isStringLiteral(operand) || operand.type === 'TemplateLiteral',
  );

const operandText = (operand) =>
  isStringLiteral(operand)
    ? operand.value
    : operand.type === 'TemplateLiteral'
      ? templateText(operand)
      : expressionStandIn;

const selectorMethods = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
  'getElementById',
]);

const isSelectorCall = (node) =>
  (node.type === 'CallExpression' || node.type === 'NewExpression') &&
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.property.type === 'Identifier' &&
  selectorMethods.has(node.callee.property.name);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow literal colors in inline styles, which belong to envUI color tokens',
      recommended: true,
      url: documentationUrl('no-raw-colors'),
    },
    schema: [],
    messages: {
      rawColor: 'Raw color {{color}} in an inline style: {{advice}}',
    },
  },
  create(context) {
    const { visitorKeys } = context.sourceCode;

    function check(node, text, property) {
      for (const color of rawColors(text, property))
        context.report({
          node,
          messageId: 'rawColor',
          data: { color, advice: colorTokenAdvice(property) },
        });
    }

    function visit(node, property) {
      walk(node, visitorKeys, (child) => {
        if (child.type === 'Property' && child !== node) {
          visit(child.value, propertyName(child));
          return false;
        }
        if (child.type === 'MemberExpression') {
          visit(child.object, property);
          return false;
        }
        if (isSelectorCall(child)) {
          visit(child.callee, property);
          return false;
        }
        if (child.type === 'Literal' && typeof child.value === 'string')
          check(child, child.value, property);
        else if (child.type === 'TemplateLiteral') check(child, templateText(child), property);
        else if (isConcatenation(child)) {
          const operands = concatenated(child);
          check(child, operands.map(operandText).join(''), property);
          for (const operand of operands)
            if (operand.type === 'TemplateLiteral')
              for (const expression of operand.expressions) visit(expression, property);
            else if (!isStringLiteral(operand)) visit(operand, property);
          return false;
        }
        return child.type !== 'TemplateElement';
      });
    }

    return {
      JSXAttribute(node) {
        if (jsxName(node.name) === 'style' && node.value?.type === 'JSXExpressionContainer')
          visit(node.value.expression, undefined);
      },
    };
  },
};
