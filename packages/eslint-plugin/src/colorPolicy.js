// Generated from scripts/build/LintPackageColorPolicy.js by npm run tokens:build; edit that file.
// What envUI's lint packages count as a raw color. The ESLint plugin's no-raw-colors and the
// Stylelint config match colors each in their own way, the plugin by parsing a value and the config
// with regular expressions, from these same parts. scripts/build/SyncLintPackages.ts copies this
// file into both packages beside tokens.js, so each works on its own once installed.

/** The CSS color functions whose channels must come from custom properties, as alternatives. */
export const colorFunctionNames = 'rgba?|hsla?|hwb|lab|lch|oklab|oklch|color';

/** A custom property's name, such as `--env-color-fg-default`, as a pattern. */
export const customPropertyName = String.raw`--[\w-]+`;

/**
 * An alpha that is a literal number or percentage, such as `0.5`, `.5`, `1e-1` or `50%`, as a
 * pattern. Any other alpha keeps a color from custom properties only as one `var()` whose
 * fallbacks are `var()`s, as a channel's are.
 */
export const literalAlpha = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?%?`;

/** The color space `color()` names before its channels, such as `display-p3`, as a pattern. */
export const colorSpace = String.raw`[a-z][\w-]*`;

/**
 * How many levels of `var()` fallbacks are followed, a fallback's fallback being the second. A
 * regular expression can't recurse, so the Stylelint config's patterns are built to this depth,
 * which no real value reaches; deeper nesting counts as raw in both packages.
 */
export const nestingDepth = 8;
