// What envUI's lint packages count as a raw color function: one pattern, which the Stylelint config
// hands to its declaration-property-value-disallowed-list rule, since a built-in rule takes only a
// pattern, and which the ESLint plugin's no-raw-colors runs on inline style values through
// rawColorCalls. Hex and named colors each package matches in its own way. scripts/build/
// SyncLintPackages.ts copies this file into both packages beside tokens.js, so each works on its own
// once installed.

/** The CSS color functions whose channels must come from custom properties, as alternatives. */
const colorFunctionNames = 'rgba?|hsla?|hwb|lab|lch|oklab|oklch|color';

/** A custom property's name, such as `--env-color-fg-default`, as a pattern. */
const customPropertyName = String.raw`--[\w-]+`;

/**
 * What the ESLint plugin puts in a template literal's text for each expression: a private-use
 * character no style sheet holds. The expression may compute any color, so it counts as a literal
 * channel, and as a digit of a literal alpha, as in `rgb(var(--rgb) / ${alpha})`.
 */
export const expressionStandIn = '';

/**
 * An alpha that is a literal number or percentage, such as `0.5`, `.5`, `1e-1` or `50%`, as a
 * pattern, a template's expression standing for a digit.
 */
const digit = String.raw`[\d${expressionStandIn}]`;
const literalAlpha = String.raw`[+-]?(?:${digit}+(?:\.${digit}*)?|\.${digit}+)(?:e[+-]?${digit}+)?%?`;

/** The color space `color()` names before its channels, such as `display-p3`, as a pattern. */
const colorSpace = String.raw`[a-z][\w-]*`;

/**
 * How many levels of `var()` fallbacks are followed, a fallback's fallback being the second. A
 * regular expression can't recurse, so the pattern is built to this depth, which no real value
 * reaches; deeper nesting counts as raw.
 */
const nestingDepth = 8;

/** Not inside `url(…)`, where a data URL can spell colors of its own image. */
const outsideUrl = String.raw`(?<!\burl\(\s*(?:"[^"]*|'[^']*|[^"')]*))`;
/** Not inside a CSS string, such as the text of `content: "rgb(1 2 3)"`. */
const outsideString = String.raw`(?<!^(?:[^"'\\]|\\.|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')*(?:"(?:[^"\\]|\\.)*|'(?:[^'\\]|\\.)*))`;
/** The start of a color function call. */
const colorFunctionStart = String.raw`(?<![\w-])(?:${colorFunctionNames})\(`;

/**
 * A custom property whose fallback, if it has one, is custom properties too, separated by spaces
 * or commas, each with a fallback of custom properties in turn: `var(--a, var(--b, var(--c)))`,
 * built `nestingDepth` levels deep, each level wrapping the one inside it.
 */
const customProperty = Array.from({ length: nestingDepth }).reduce(
  (inner) =>
    String.raw`var\(\s*${customPropertyName}\s*(?:,[\s,]*(?:${inner}(?=[\s,)])[\s,]*)*)?\)`,
  String.raw`var\(\s*${customPropertyName}\s*\)`,
);

/**
 * An alpha that keeps a color from custom properties: a literal number or percentage, or one
 * custom property whose fallbacks are custom properties, as a channel's are.
 */
const alpha = String.raw`\s*(?:${literalAlpha}|${customProperty})\s*`;

/**
 * Arguments that make no raw color: a relative color derived from a token (`hsl(from …)`), or
 * channels that all come from custom properties, each a `var()` whose fallback, if any, is a
 * `var()` too, as in `oklch(var(--l) var(--c) var(--h))` or `rgb(var(--brand-rgb))`, with an
 * alpha that is a literal or a custom property, after the `/` or as the last of two or four
 * comma-separated arguments: `rgb(var(--rgb) / 50%)` and `rgba(var(--rgb), var(--alpha))` alike.
 * `color()` names its color space first.
 */
const customChannels = String.raw`(?:\s*from\b|(?:(?<=color\()\s*${colorSpace}\s+)?\s*${customProperty}(?:\s+${customProperty})*\s*(?:\/${alpha})?\)|\s*${customProperty}\s*(?:,\s*${customProperty}\s*,\s*${customProperty}\s*)?(?:,${alpha})?\))`;

/** The start of a color function call with a channel or alpha that is not from custom properties. */
const rawColorCallStart = String.raw`${outsideString}${outsideUrl}${colorFunctionStart}(?!${customChannels})`;

/**
 * Color functions with a channel that is not a custom property, as a Stylelint regular expression:
 * a number, percentage, angle, keyword such as `none`, calculation or fallback. Relative colors
 * derived from a token (`hsl(from …)`), channels from custom properties and colors inside `url()`
 * or a string pass.
 */
export const rawColorFunction = `/${rawColorCallStart}/i`;

const rawColorCallStarts = new RegExp(rawColorCallStart, 'gi');

/**
 * The raw color function calls in a value, each from its name to its matching `)`, or to the
 * value's end when it is unclosed.
 */
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
