import {
  colorFunctionNames,
  colorSpace,
  customPropertyName,
  literalAlpha,
  nestingDepth,
} from '../colorPolicy.js';
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

/** A hex color, as a whole word. An expression after it makes it a hex color built from one. */
const hexColor = /(?<![\w&-])#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?![\w\uE000-])/gi;

/**
 * A hex color built from a template's expressions: a `#` followed by expressions and hex digits,
 * at least one of them an expression, as in `#${hex}` or `#fff${alpha}`.
 */
const builtHexColor = /(?<![\w&-])#(?=[\da-f]*\uE000)[\da-f\uE000]+(?![\w-])/gi;

/** The start of a color function call. */
const colorFunctionStart = new RegExp(String.raw`(?<![\w-])(${colorFunctionNames})\(`, 'gi');

/**
 * What stands for each expression of a template literal, which is read as one value: a literal
 * channel, since the expression may compute any color. The hex patterns above name it as \uE000.
 */
const expressionStandIn = '';

/** CSS strings and url() references, whose text may spell colors that are not the style's own. */
const quotedOrUrl = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi;

/**
 * The end of the parenthesised text that starts at `open`, just after its `(`: the index of the
 * matching `)`, or the end of the text when it is unclosed.
 */
function closingParen(text, open) {
  let depth = 1;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === '(') depth += 1;
    else if (text[index] === ')' && --depth === 0) return index;
  }
  return text.length;
}

/** Splits text at a separator outside parentheses. */
function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '(') depth += 1;
    else if (text[index] === ')') depth -= 1;
    else if (depth === 0 && separator.test(text[index])) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** One `var()`, with its fallback, if it has one, as the first group. */
const customPropertyCall = new RegExp(
  String.raw`^var\(\s*${customPropertyName}\s*(?:,([\s\S]*))?\)$`,
  'i',
);

/**
 * Whether channels all come from custom properties: each one a `var()`, whose fallback, if it has
 * one, is a `var()` too, since a fallback is a color as much as the value. `depth` counts the
 * fallbacks the channels sit in.
 */
function fromCustomProperties(channels, depth = 0) {
  return splitTopLevel(channels, /[\s,]/)
    .filter((token) => token.trim())
    .every((token) => {
      const match = customPropertyCall.exec(token.trim());
      return (
        Boolean(match) &&
        (match[1] === undefined ||
          (depth < nestingDepth && fromCustomProperties(match[1], depth + 1)))
      );
    });
}

/** A whole alpha that is a literal number or percentage. */
const literalAlphaValue = new RegExp(`^${literalAlpha}$`, 'i');

/** The color space `color()` names before its channels, with the space after it. */
const leadingColorSpace = new RegExp(String.raw`^\s*${colorSpace}\s`, 'i');

/**
 * Whether a color's alpha keeps it from custom properties: a literal number or percentage, or one
 * `var()` whose fallbacks are `var()`s, as a channel's are. The Stylelint config reads it alike.
 * A template's expression stands for a literal number here, as in `rgb(var(--rgb) / ${alpha})`.
 */
function isTokenAlpha(alpha) {
  const text = alpha.trim();
  return (
    literalAlphaValue.test(text.replaceAll(expressionStandIn, '1')) ||
    (splitTopLevel(text, /[\s,]/).filter((token) => token.trim()).length === 1 &&
      fromCustomProperties(text))
  );
}

/**
 * Whether a color function's arguments make a raw color: any channel that is not a custom
 * property. A relative color derived from a token (`hsl(from …)`) passes, and so does one whose
 * channels are custom properties with an alpha that is a literal or a custom property, after the
 * `/` or as the last of two or four comma-separated arguments: `rgb(var(--rgb) / 50%)` and
 * `rgba(var(--rgb), var(--alpha))` alike.
 */
function isRawColorFunction(name, args) {
  if (/^\s*from\b/i.test(args)) return false;
  let channels = name.toLowerCase() === 'color' ? args.replace(leadingColorSpace, ' ') : args;
  let alpha;
  const slash = splitTopLevel(channels, /\//);
  if (slash.length > 1) [channels, alpha] = [slash[0], slash.slice(1).join('/')];
  else {
    const commas = splitTopLevel(channels, /,/);
    if (commas.length === 2 || commas.length === 4)
      [channels, alpha] = [commas.slice(0, -1).join(','), commas.at(-1)];
  }
  return !fromCustomProperties(channels) || (alpha !== undefined && !isTokenAlpha(alpha));
}

/** The color function calls in a value whose channels are not all custom properties. */
function rawColorFunctions(value) {
  const found = [];
  for (const match of value.matchAll(colorFunctionStart)) {
    const open = match.index + match[0].length;
    const close = closingParen(value, open);
    if (isRawColorFunction(match[1], value.slice(open, close)))
      found.push(value.slice(match.index, close + 1));
  }
  return found;
}

/** The raw colors in a style value, given the property it sets. */
function rawColors(text, property) {
  const value = text.replace(quotedOrUrl, ' ');
  const found = [
    ...[...value.matchAll(hexColor)].map((match) => match[0]),
    ...[...value.matchAll(builtHexColor)].map((match) => match[0]),
    ...rawColorFunctions(value),
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
