import { documentationUrl, jsxName, walk } from '../utilities.js';

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

/** A hex color, as a whole word. */
const hexColor = /(?<![\w&-])#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?![\w-])/gi;
/** A color function with literal channels; a relative color from a token (`from …`) passes. */
const colorFunction =
  /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\((?!\s*from\b)[^()]*(?:\([^()]*\)[^()]*)*\)?/gi;

/** The raw colors in a style value, given the property it sets. */
function rawColors(text, property) {
  const value = text.replace(/url\([^)]*\)/gi, ' ');
  const found = [...value.matchAll(hexColor), ...value.matchAll(colorFunction)].map(
    (match) => match[0],
  );
  if (
    property &&
    !property.startsWith('--') &&
    colorProperty.test(property) &&
    !notColorProperty.test(property)
  )
    for (const [word] of value.matchAll(/(?<![\w-])[a-z]+(?![\w(-])/gi))
      if (namedColors.has(word.toLowerCase())) found.push(word);
  return found;
}

/** The name a style object's property sets: `color`, `backgroundColor` or `--accent`. */
function propertyName(property) {
  const { key } = property;
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (key.type === 'Literal') return String(key.value);
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0)
    return key.quasis[0].value.cooked;
  return undefined;
}

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
      rawColor:
        'Raw color {{color}} in an inline style: use an envUI color token instead, such as var(--env-color-…), so the color follows the theme and keeps its contrast.',
    },
  },
  create(context) {
    const { visitorKeys } = context.sourceCode;

    function check(node, text, property) {
      for (const color of rawColors(text, property))
        context.report({ node, messageId: 'rawColor', data: { color } });
    }

    /** Checks the strings under a style value, each with the property it sets. */
    function visit(node, property) {
      walk(node, visitorKeys, (child) => {
        if (child.type === 'Property' && child !== node) {
          visit(child.value, propertyName(child));
          return false;
        }
        if (child.type === 'Literal' && typeof child.value === 'string')
          check(child, child.value, property);
        else if (child.type === 'TemplateElement')
          check(child, child.value.cooked ?? child.value.raw, property);
        return true;
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
