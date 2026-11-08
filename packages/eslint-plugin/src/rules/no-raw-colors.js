import { expressionStandIn, rawColorCalls } from '../colorPolicy.js';
import { colorTokenAdvice } from '../tokens.js';
import { documentationUrl, jsxName, propertyName, walk } from '../utilities.js';

/** The CSS named colors (CSS Color 4), besides transparent and currentcolor. */
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

/** Style properties whose values can name a color by keyword, such as `border: '1px solid red'`. */
const colorProperty =
  /color|background|border|outline|fill|stroke|shadow|caret|accent|decoration|column-?rule|scrollbar|flood|lighting/i;
const notColorProperty =
  /radius|width|style|clip|origin|position|size|repeat|attachment|blend|offset|collapse|spacing/i;

/**
 * A hex color, as a whole word. An expression after it makes it a hex color built from one; the hex
 * patterns name a template's expression as , colorPolicy.js's expressionStandIn.
 */
const hexColor = /(?<![\w&-])#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?![\w\uE000-])/gi;

/**
 * A hex color built from a template's expressions: a `#` followed by expressions and hex digits,
 * at least one of them an expression, as in `#${hex}` or `#fff${alpha}`.
 */
const builtHexColor = /(?<![\w&-])#(?=[\da-f]*\uE000)[\da-f\uE000]+(?![\w-])/gi;

/** CSS strings and url() references, whose text may spell colors that are not the style's own. */
const quotedOrUrl = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi;

/** The raw colors in a style value, given the property it sets. */
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

/** A template literal's text, with a stand-in for each expression. */
const templateText = (node) =>
  node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join(expressionStandIn);

/** The operands of a chain of `+`: `'#' + hex + 'cc'` is `'#'`, `hex` and `'cc'`. */
const concatenated = (node) =>
  node.type === 'BinaryExpression' && node.operator === '+'
    ? [...concatenated(node.left), ...concatenated(node.right)]
    : [node];

/** Whether a `+` chain joins strings, as one of its operands shows, rather than adding numbers. */
const isConcatenation = (node) =>
  node.type === 'BinaryExpression' &&
  node.operator === '+' &&
  concatenated(node).some(
    (operand) => isStringLiteral(operand) || operand.type === 'TemplateLiteral',
  );

/** An operand's part of a concatenated string, with a stand-in for what an expression computes. */
const operandText = (operand) =>
  isStringLiteral(operand)
    ? operand.value
    : operand.type === 'TemplateLiteral'
      ? templateText(operand)
      : expressionStandIn;

/** The DOM methods whose string arguments are selectors or ids, such as `#main`, not colors. */
const selectorMethods = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
  'getElementById',
]);

/** Whether a node calls a DOM lookup by selector, as in `document.querySelector('#fff')`. */
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

    /**
     * Checks the strings under a style value, each with the property it sets, through calls too:
     * darken('#123', 0.1) and mergeStyles(base, { color: 'red' }) are read. Strings that only
     * choose a value are not the value: a member's key, as in styles[`#${id}`], and the selector a
     * DOM lookup is given, as in pick(document.querySelector(`#${id}`)).
     */
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
        // A template literal is one value: `rgb(${r} 0 0)` and `url('${a}') #fff` are read whole,
        // and the strings and colors in its expressions on their own.
        else if (child.type === 'TemplateLiteral') check(child, templateText(child), property);
        // So is a concatenation of strings, as in '#' + hex, and its other operands on their own.
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
