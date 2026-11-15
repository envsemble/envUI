const colorFunctionNames = 'rgba?|hsla?|hwb|lab|lch|oklab|oklch|color';

const customPropertyName = String.raw`--[\w-]+`;

export const expressionStandIn = '';

const digitOrExpression = String.raw`[\d${expressionStandIn}]`;
const literalAlpha = String.raw`[+-]?(?:${digitOrExpression}+(?:\.${digitOrExpression}*)?|\.${digitOrExpression}+)(?:e[+-]?${digitOrExpression}+)?%?`;

const colorSpaceName = String.raw`[a-z][\w-]*`;

const deepestFollowedVarFallback = 8;

const outsideUrl = String.raw`(?<!\burl\(\s*(?:"[^"]*|'[^']*|[^"')]*))`;
const outsideString = String.raw`(?<!^(?:[^"'\\]|\\.|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')*(?:"(?:[^"\\]|\\.)*|'(?:[^'\\]|\\.)*))`;
const colorFunctionStart = String.raw`(?<![\w-])(?:${colorFunctionNames})\(`;

const customPropertyWithCustomFallbacks = Array.from({ length: deepestFollowedVarFallback }).reduce(
  (inner) =>
    String.raw`var\(\s*${customPropertyName}\s*(?:,[\s,]*(?:${inner}(?=[\s,)])[\s,]*)*)?\)`,
  String.raw`var\(\s*${customPropertyName}\s*\)`,
);

const literalOrCustomAlpha = String.raw`\s*(?:${literalAlpha}|${customPropertyWithCustomFallbacks})\s*`;

const relativeColorFromToken = String.raw`\s*from\b`;
const spaceSeparatedCustomChannels = String.raw`(?:(?<=color\()\s*${colorSpaceName}\s+)?\s*${customPropertyWithCustomFallbacks}(?:\s+${customPropertyWithCustomFallbacks})*\s*(?:\/${literalOrCustomAlpha})?\)`;
const commaSeparatedCustomChannels = String.raw`\s*${customPropertyWithCustomFallbacks}\s*(?:,\s*${customPropertyWithCustomFallbacks}\s*,\s*${customPropertyWithCustomFallbacks}\s*)?(?:,${literalOrCustomAlpha})?\)`;
const colorFromCustomProperties = `(?:${relativeColorFromToken}|${spaceSeparatedCustomChannels}|${commaSeparatedCustomChannels})`;

const rawColorCallStart = String.raw`${outsideString}${outsideUrl}${colorFunctionStart}(?!${colorFromCustomProperties})`;

export const rawColorFunction = `/${rawColorCallStart}/i`;

const rawColorCallStarts = new RegExp(rawColorCallStart, 'gi');

export function rawColorCalls(value) {
  const calls = [];
  for (const start of value.matchAll(rawColorCallStarts)) {
    let depth = 1;
    let end = start.index + start[0].length;
    for (; end < value.length && depth > 0; end += 1)
      if (value[end] === '(') depth += 1;
      else if (value[end] === ')') depth -= 1;
    calls.push(value.slice(start.index, end));
  }
  return calls;
}
