// Tokens.css: plugin-css with envUI's values, one rule per theme and scale, without comments and
// without the declarations a theme rule repeats from the rules below it.
import type { Plugin } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { cssDeclarations } from './CssDeclarations.ts';
import { transform } from './CssValues.ts';
import { cssVariable, internalGroups, scaleRules, themes, type ThemeName } from './Themes.ts';

/**
 * plugin-css with no comments in its output. It writes each token's $description above the token,
 * but labels an alias it redeclares with its target's description, so `--color-select-option` would
 * read as the popup's. Descriptions stay in the token files and the token list.
 */
function withoutDescriptions(plugin: Plugin): Plugin {
  return {
    ...plugin,
    build: (options) =>
      plugin.build?.({
        ...options,
        getTransforms: (params) =>
          options.getTransforms(params).map((entry) => ({
            ...entry,
            meta: {
              ...entry.meta,
              'plugin-css': {
                ...(entry.meta?.['plugin-css'] as object | undefined),
                description: '',
              },
            },
          })),
      }),
  };
}

/**
 * The theme rules an element of each theme also matches, whose values it takes where its own rule
 * declares nothing, nearest first. A dark high-contrast element falls back to the light
 * high-contrast rule before the dark one: both have the same specificity, and the high-contrast
 * rule comes later in Tokens.css.
 */
const rulesBelow: Record<ThemeName, ThemeName[]> = {
  light: [],
  dark: ['light'],
  'light-high-contrast': ['light'],
  'dark-high-contrast': ['light-high-contrast', 'dark', 'light'],
};

/**
 * Tokens.css without the declarations of a theme rule that repeat the value an element of that
 * theme takes from the rules below it anyway, such as a dark value that is the light one. Every
 * element computes the same tokens; the token files still give each scheme and contrast all its
 * values, and the token list lists them all.
 */
export function withoutRepeatedValues(text: string) {
  const themeOf = new Map<string, ThemeName>(
    themes.flatMap((theme) => [
      ...theme.selectors.map((selector): [string, ThemeName] => [selector, theme.name]),
      ...(theme.media ? [[theme.media.selector, theme.name] as [string, ThemeName]] : []),
    ]),
  );
  const declared = Object.fromEntries(
    themes.map((theme) => [theme.name, new Map<string, string>()]),
  ) as Record<ThemeName, Map<string, string>>;
  for (const { property, value, selector } of cssDeclarations(text)) {
    const theme = selector === undefined ? undefined : themeOf.get(selector);
    if (theme && property.startsWith('--')) declared[theme].set(property, value);
  }
  const repeated = {} as Record<ThemeName, Set<string>>;
  for (const theme of themes) {
    repeated[theme.name] = new Set(
      [...declared[theme.name]]
        .filter(([property, value]) => {
          // The value below: of the nearest rule that still declares the property.
          const below = rulesBelow[theme.name]
            .filter((name) => !repeated[name]?.has(property))
            .map((name) => declared[name].get(property))
            .find((each) => each !== undefined);
          return below === value;
        })
        .map(([property]) => property),
    );
  }
  // Each theme rule, `selector {` to its `}`, without the lines of the repeated declarations.
  return text.replace(/([^\n{}]+) \{\n([^{}]*)\}/g, (rule, selector: string, body: string) => {
    const theme = themeOf.get(selector.trim());
    if (!theme) return rule;
    const kept = body
      .split('\n')
      .filter((line) => !repeated[theme].has(line.match(/^\s*(--[\w-]+):/)?.[1] ?? ''));
    return `${selector} {\n${kept.join('\n')}}`;
  });
}

/** plugin-css with Tokens.css written by withoutRepeatedValues(). */
function withoutRepeatedDeclarations(plugin: Plugin): Plugin {
  return {
    ...plugin,
    build: (options) =>
      plugin.build?.({
        ...options,
        outputFile: (filename, contents) =>
          options.outputFile(
            filename,
            filename.endsWith('.css') ? withoutRepeatedValues(String(contents)) : contents,
          ),
      }),
  };
}

const header =
  "/* Built from packages/ui/tokens by `npm run tokens:build`. The values DTCG can't express yet\n   are in ../styles/TokensHandwritten.css. */\n";
const block = (selector: string, contents: string) => `${selector} {\n  ${contents}\n}`;

/**
 * The plugin that writes generated/Tokens.css: the base set on `.env-theme`, then a rule for what each
 * scheme, contrast and scale changes, given as the token IDs each modifier context overrides.
 */
export function tokensCss({
  dark,
  high,
  scaleTokens,
}: {
  dark: string[];
  high: string[];
  scaleTokens: Record<string, string[]>;
}) {
  return withoutRepeatedDeclarations(
    withoutDescriptions(
      css({
        filename: 'generated/Tokens.css',
        // Every property takes the prefix. plugin-css also passes this the parts that an alias
        // of a composite token reads, as `type.label-fontSize`, which makeCSSVar() writes as
        // `--env-type-label-font-size`, the part's own property.
        variableName: (token) => cssVariable(token.id),
        exclude: internalGroups.map((group) => `${group}.**`),
        transform,
        permutations: [
          {
            // The base set: every token, in the light scheme at standard contrast.
            input: {},
            prepare: (contents) =>
              `${header}.env-theme {\n  color-scheme: light;\n  ${contents}\n}`,
          },
          {
            // What the dark scheme overrides, less what withoutRepeatedValues() finds repeated.
            input: { colorScheme: 'dark' },
            include: dark,
            prepare: (contents) =>
              `.env-theme[data-env-theme='dark'] {\n  color-scheme: dark;\n  ${contents}\n}`,
          },
          ...themes.flatMap(({ input, selectors, media }) =>
            media
              ? [
                  {
                    // Every token high contrast changes, in both schemes, so the dark
                    // high-contrast rule also replaces the light one's values.
                    input,
                    include: high,
                    prepare: (contents: string) =>
                      `${block(selectors.join(', '), contents)}\n@media ${media.query} {\n  ${block(media.selector, contents)}\n}`,
                  },
                ]
              : [],
          ),
          ...scaleRules.map((scale) => ({
            // Only the sizes the scale changes; colors come from the theme rules above.
            input: scale.input,
            include: scaleTokens[scale.name],
            prepare: (contents: string) =>
              scale.media
                ? `${block(scale.selector, contents)}\n@media ${scale.media.query} {\n  ${block(scale.media.selector, contents)}\n}`
                : block(scale.selector, contents),
          })),
        ],
      }),
    ),
  );
}
