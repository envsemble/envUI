import type { Plugin } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { cssDeclarations } from './CssDeclarations.ts';
import { transform } from './CssValues.ts';
import { cssVariable, internalGroups, scaleRules, themes, type ThemeName } from './Themes.ts';

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

const rulesBelow: Record<ThemeName, ThemeName[]> = {
  light: [],
  dark: ['light'],
  'light-high-contrast': ['light'],
  'dark-high-contrast': ['light-high-contrast', 'dark', 'light'],
};

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
          const below = rulesBelow[theme.name]
            .filter((name) => !repeated[name]?.has(property))
            .map((name) => declared[name].get(property))
            .find((each) => each !== undefined);
          return below === value;
        })
        .map(([property]) => property),
    );
  }
  return text.replace(/([^\n{}]+) \{\n([^{}]*)\}/g, (rule, selector: string, body: string) => {
    const theme = themeOf.get(selector.trim());
    if (!theme) return rule;
    const kept = body
      .split('\n')
      .filter((line) => !repeated[theme].has(line.match(/^\s*(--[\w-]+):/)?.[1] ?? ''));
    return `${selector} {\n${kept.join('\n')}}`;
  });
}

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
        variableName: (token) => cssVariable(token.id),
        exclude: internalGroups.map((group) => `${group}.**`),
        transform,
        permutations: [
          {
            input: {},
            prepare: (contents) =>
              `${header}.env-theme {\n  color-scheme: light;\n  ${contents}\n}`,
          },
          {
            input: { colorScheme: 'dark' },
            include: dark,
            prepare: (contents) =>
              `.env-theme[data-env-theme='dark'] {\n  color-scheme: dark;\n  ${contents}\n}`,
          },
          ...themes.flatMap(({ input, selectors, media }) =>
            media
              ? [
                  {
                    input,
                    include: high,
                    prepare: (contents: string) =>
                      `${block(selectors.join(', '), contents)}\n@media ${media.query} {\n  ${block(media.selector, contents)}\n}`,
                  },
                ]
              : [],
          ),
          ...scaleRules.map((scale) => ({
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
