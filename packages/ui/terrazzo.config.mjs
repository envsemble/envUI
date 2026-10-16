// Terrazzo builds envUI's tokens (packages/ui/tokens, DTCG 2025.10 with a resolver) into
// src/styles/Tokens.css and the generated token modules in src/generated. Run it through
// `npm run tokens:build`, which formats the output with Prettier; `npm run tokens:check` fails when
// the committed output is stale. `npx tz check --config packages/ui/terrazzo.config.mjs` only lints
// the tokens. See docs/library-development.md.
import { existsSync, readFileSync } from 'node:fs';
import { RECOMMENDED_CONFIG } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { converter, formatHex } from 'culori';

/** The token sources, and where the build writes; a test can build other tokens elsewhere. */
export const defaultTokensDirectory = new URL('./tokens/', import.meta.url);
export const defaultOutDir = new URL('./src/', import.meta.url);
const resolverIn = (directory) => new URL('envui.resolver.json', directory);

/** The vendor key of envUI's `$extensions`. */
const extension = 'com.envsemble.envui';

/** The CSS custom property of a token: its path joined with hyphens, as Tokens.css names it. */
export const cssVariable = (id) => `--${id.split('.').join('-')}`;

/**
 * Token groups that are build input only: the primitive palette, and the high-contrast values of
 * each scheme that contrast/high.tokens.json points the roles at. Neither becomes CSS; tokens that
 * alias them carry the resolved value instead.
 */
export const internalGroups = ['palette', 'contrast-high'];
const internal = (id) => internalGroups.includes(id.split('.')[0]);

/** The semantic color roles: every one is designed for both schemes and both contrasts. */
const semantic = (id) => /^color\.(bg|fg|border)\./.test(id);

/**
 * The themes the tokens build into, each a resolver input, with the CSS rules that apply it. The
 * high-contrast themes also apply under `prefers-contrast: more` unless the boundary opts out with
 * data-env-contrast='standard'.
 */
export const themes = [
  {
    name: 'light',
    input: { colorScheme: 'light', contrast: 'standard' },
    selectors: ['.env-theme'],
  },
  {
    name: 'dark',
    input: { colorScheme: 'dark', contrast: 'standard' },
    selectors: [".env-theme[data-env-theme='dark']"],
  },
  {
    name: 'light-high-contrast',
    input: { colorScheme: 'light', contrast: 'high' },
    selectors: [".env-theme[data-env-contrast='high']"],
    media: {
      query: '(prefers-contrast: more)',
      selector: ".env-theme:not([data-env-contrast='standard'])",
    },
  },
  {
    name: 'dark-high-contrast',
    input: { colorScheme: 'dark', contrast: 'high' },
    selectors: [".env-theme[data-env-theme='dark'][data-env-contrast='high']"],
    media: {
      query: '(prefers-contrast: more)',
      selector: ".env-theme[data-env-theme='dark']:not([data-env-contrast='standard'])",
    },
  },
];

/** IDs of the tokens a source document declares. */
function declaredTokens(document, path = [], ids = []) {
  for (const [key, value] of Object.entries(document)) {
    if (key.startsWith('$') && key !== '$root') continue;
    if (!value || typeof value !== 'object') continue;
    if ('$value' in value) ids.push([...path, key].filter((part) => part !== '$root').join('.'));
    else declaredTokens(value, [...path, key], ids);
  }
  return ids;
}

/** IDs of the tokens one context of a resolver modifier overrides, read from its sources. */
export function contextTokens(modifier, context, tokensDirectory = defaultTokensDirectory) {
  const resolverFile = resolverIn(tokensDirectory);
  const resolver = JSON.parse(readFileSync(resolverFile, 'utf8'));
  const sources = resolver.modifiers[modifier].contexts[context];
  return sources.flatMap((source) =>
    declaredTokens(JSON.parse(readFileSync(new URL(source.$ref, resolverFile), 'utf8'))),
  );
}

const toRgb = converter('rgb');
const channel = (value) => Math.round(Math.min(1, Math.max(0, value)) * 255);
const round = (value, digits) => Number(value.toFixed(digits));

/**
 * A DTCG color as CSS: opaque colors as their sRGB hex, translucent ones as rgb() with the exact
 * alpha, so the browser, the contrast gate and the generated modules all see the same 8-bit values.
 */
export function cssColor(color) {
  const alpha = color.alpha ?? 1;
  if (alpha === 0) return 'transparent';
  const space = { oklch: 'oklch', srgb: 'rgb', hsl: 'hsl' }[color.colorSpace];
  if (!space) throw new Error(`Unsupported color space ${color.colorSpace}.`);
  const [a, b, c] = color.components;
  const parsed =
    space === 'oklch'
      ? { mode: 'oklch', l: a, c: b, h: c }
      : space === 'hsl'
        ? { mode: 'hsl', h: a, s: b / 100, l: c / 100 }
        : { mode: 'rgb', r: a, g: b, b: c };
  const rgb = toRgb(parsed);
  if (alpha === 1) return color.hex ?? formatHex(rgb);
  return `rgb(${channel(rgb.r)} ${channel(rgb.g)} ${channel(rgb.b)} / ${round(alpha, 4)})`;
}

const length = ({ value, unit }) => (value === 0 ? '0' : `${value}${unit}`);

/**
 * CSS values: colors as cssColor() writes them, shadows with those colors, a zero length as `0`,
 * font names in single quotes, and numbers marked with a CSS unit (percentages). A token that
 * aliases another public token is written as var(), plugin-css's default; one that aliases the
 * palette or a high-contrast value carries the resolved value, because those never become CSS.
 */
function transform(token) {
  if (token.aliasChain?.length && !internal(token.aliasChain[0])) return undefined;
  const value = token.$value;
  switch (token.$type) {
    case 'color':
      return cssColor(value);
    case 'shadow':
      return (Array.isArray(value) ? value : [value])
        .map((layer) =>
          [
            ...(layer.inset ? ['inset'] : []),
            length(layer.offsetX),
            length(layer.offsetY),
            length(layer.blur),
            length(layer.spread),
            cssColor(layer.color),
          ].join(' '),
        )
        .join(', ');
    case 'dimension':
      return value.value === 0 ? '0' : undefined;
    case 'fontFamily':
      // Single quotes, as Prettier writes them, so the CSS and the modules carry the same text.
      return value.map((name) => (/^[a-z-]+$/.test(name) ? name : `'${name}'`)).join(', ');
    case 'number': {
      const unit = token.$extensions?.[extension]?.cssUnit;
      return unit ? `${value}${unit}` : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * plugin-css with no comments in its output. It writes each token's $description above the token,
 * but labels an alias it redeclares with its target's description, so `--color-select-option` would
 * read as the popup's. Descriptions stay in the token files and the generated token modules.
 */
function withoutDescriptions(plugin) {
  return {
    ...plugin,
    build: (options) =>
      plugin.build({
        ...options,
        getTransforms: (params) =>
          options.getTransforms(params).map((entry) => ({
            ...entry,
            meta: {
              ...entry.meta,
              'plugin-css': { ...entry.meta?.['plugin-css'], description: '' },
            },
          })),
      }),
  };
}

/**
 * `envui/color-schemes`: every semantic color is declared in the dark scheme, so dark is designed
 * rather than inherited, and every other color outside the palette is an alias, which follows its
 * target into each scheme. (core/required-modes reads only the legacy `$extensions.mode`, so with a
 * resolver it sees no modes on any token.)
 */
const colorSchemesRule = {
  meta: { docs: { description: 'Every semantic color has a dark value; other colors alias.' } },
  create({ tokens, options, report }) {
    const dark = new Set(options.dark);
    for (const token of Object.values(tokens)) {
      if (token.$type !== 'color' || internal(token.id)) continue;
      if (semantic(token.id) && !dark.has(token.id))
        report({
          message: `${token.id} has no dark value: add one to color-scheme/dark.tokens.json.`,
        });
      else if (!semantic(token.id) && !token.aliasOf && token.id.startsWith('color.'))
        report({ message: `${token.id} is a color outside the roles: alias a semantic role.` });
    }
  },
};

/**
 * `envui/high-contrast`: contrast/high.tokens.json points roles at `contrast-high.*`, which both
 * schemes must define, and the two schemes define the same high-contrast values.
 */
const highContrastRule = {
  meta: { docs: { description: 'Both schemes define every high-contrast value.' } },
  create({ options, report }) {
    const light = new Set(options.light);
    const dark = new Set(options.dark);
    for (const id of light)
      if (!dark.has(id))
        report({
          message: `${id} has no dark value: add it to color-scheme/dark-contrast-high.tokens.json.`,
        });
    for (const id of dark)
      if (!light.has(id))
        report({ message: `${id} has no light value: add it to base/contrast-high.tokens.json.` });
    for (const [id, target] of Object.entries(options.pointers))
      if (target.startsWith('contrast-high.') && !light.has(target))
        report({ message: `${id} points at ${target}, which no scheme defines.` });
  },
};

/** `envui/unique-css-names`: no two tokens become the same custom property. */
const uniqueNamesRule = {
  meta: { docs: { description: 'Every token has its own CSS custom property.' } },
  create({ tokens, report }) {
    const seen = new Map();
    for (const id of Object.keys(tokens)) {
      if (internal(id)) continue;
      const name = cssVariable(id);
      if (seen.has(name)) report({ message: `${id} and ${seen.get(name)} both become ${name}.` });
      seen.set(name, id);
    }
  },
};

/**
 * The declarations of a style sheet, each with its property, its value, the preludes of the
 * at-rules around it (outermost first) and the selector of its rule, with whitespace collapsed.
 * Comments are dropped; quoted strings and parentheses are read whole, so a `;` or a brace inside
 * them ends nothing. Nested style rules are not read apart: a declaration takes the innermost
 * selector.
 */
export function cssDeclarations(css) {
  const declarations = [];
  const blocks = [];
  let text = '';
  let quote = null;
  let depth = 0;
  const end = () => {
    const match = text.match(/^\s*(--[\w-]+|-?[A-Za-z][\w-]*)\s*:([\s\S]*)$/);
    if (match && blocks.length > 0)
      declarations.push({
        property: match[1],
        value: match[2].trim(),
        atRules: blocks.filter((block) => block.atRule).map((block) => block.prelude),
        selector: blocks.findLast((block) => !block.atRule)?.prelude,
      });
    text = '';
  };
  for (const character of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (quote) {
      if (character === quote) quote = null;
      text += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      text += character;
    } else if (character === '(' || (character === ')' && depth > 0) || depth > 0) {
      depth += character === '(' ? 1 : character === ')' ? -1 : 0;
      text += character;
    } else if (character === '{') {
      const prelude = text.trim().replace(/\s+/g, ' ');
      blocks.push({ prelude, atRule: prelude.startsWith('@') });
      text = '';
    } else if (character === '}') {
      end();
      blocks.pop();
    } else if (character === ';') end();
    else text += character;
  }
  return declarations;
}

/**
 * The media queries under which TokensHandwritten.css may change a token's value: the touch sizes
 * under a coarse pointer, which the resolver has no modifier for. Only these: a token's value in
 * another condition, such as `prefers-contrast: more`, belongs in the tokens, where the generated
 * modules see it, and a declaration under any other at-rule (`@layer`, `@supports`, `@container`,
 * another media query or a list of them) can apply in every theme, so it replaces the token.
 */
export const conditionalMediaQueries = ['(pointer: coarse)'];

const compact = (text) => text.replace(/\s+/g, '').toLowerCase();
const conditional = new Set(conditionalMediaQueries.map((query) => compact(`@media ${query}`)));

/**
 * The custom properties a style sheet declares that replace a token wherever they apply: every
 * declaration, in any rule, except under a media query of conditionalMediaQueries.
 */
export function overridingCustomProperties(css) {
  return new Set(
    cssDeclarations(css)
      .filter(({ property }) => property.startsWith('--'))
      .filter(({ atRules }) => !atRules.some((prelude) => conditional.has(compact(prelude))))
      .map(({ property }) => property),
  );
}

/**
 * Fails the build when two tokens would declare one custom property, or when TokensHandwritten.css
 * declares one of the tokens' outside conditionalMediaQueries: Tokens.css would keep only the last
 * declaration, and TokensHandwritten.css, which loads after it, would silently replace the token.
 * A composite token, such as typography, also declares a property per part,
 * `--type-body-font-size`.
 */
function checkCustomProperties(list, handwrittenFile) {
  const owners = new Map();
  for (const token of list) {
    const parts = Object.values(token.values).find(
      ({ css }) => css && typeof css === 'object',
    )?.css;
    const names = [
      token.cssVariable,
      ...Object.keys(parts ?? {}).map((part) => `${token.cssVariable}-${part}`),
    ];
    for (const name of names) {
      if (owners.has(name))
        throw new Error(
          `${owners.get(name)} and ${token.id} both become ${name}: rename one of them.`,
        );
      owners.set(name, token.id);
    }
  }
  if (!existsSync(handwrittenFile)) return;
  for (const name of overridingCustomProperties(readFileSync(handwrittenFile, 'utf8')))
    if (owners.has(name))
      throw new Error(
        `TokensHandwritten.css declares ${name}, which the token ${owners.get(name)} becomes: move the hand-written value into the token, or give one of them another name.`,
      );
}

/**
 * envUI's own plugin: the lint rules, and the generated token modules, a typed TypeScript module, a
 * JSON token list for the docs, and the migration map from the 0.7 custom properties to the roles.
 * The modules carry each token's value in every theme, as the browser resolves Tokens.css alone:
 * TokensHandwritten.css can change a few of them under a condition, such as the touch sizes of
 * --control-height and --title-bar-height under a coarse pointer, and those values are not in them.
 */
function envui({ removedFile, handwrittenFile }) {
  return {
    name: 'envui',
    lint: () => ({
      'envui/color-schemes': colorSchemesRule,
      'envui/high-contrast': highContrastRule,
      'envui/unique-css-names': uniqueNamesRule,
    }),
    build({ getTransforms, outputFile, resolver, tokens }) {
      const modifiers = resolver.source.resolutionOrder
        .filter((item) => item.type === 'modifier')
        .map((item) => ({
          name: item.name,
          description: item.description,
          contexts: Object.keys(item.contexts),
          default: item.default,
        }));
      // Tokens.css declares the base set, then each theme's overrides on top of its scheme's; var()
      // resolves in the element's own theme, as in the browser.
      const declared = Object.fromEntries(
        themes.map((theme) => [
          theme.name,
          new Map(
            getTransforms({ format: 'css', input: theme.input }).map((entry) => [
              entry.localID,
              entry.value,
            ]),
          ),
        ]),
      );
      const fallback = { dark: ['light'], 'light-high-contrast': ['light'] };
      fallback['dark-high-contrast'] = ['dark', 'light'];
      const cssValue = (theme, name) =>
        [theme, ...(fallback[theme] ?? [])]
          .map((layer) => declared[layer].get(name))
          .find((value) => value !== undefined);
      // A composite token, such as typography, has a CSS value per part: { 'font-size': … }.
      const resolveValue = (theme, value) => {
        if (value && typeof value === 'object')
          return Object.fromEntries(
            Object.entries(value).map(([part, partValue]) => [
              part,
              resolveValue(theme, partValue),
            ]),
          );
        const alias = typeof value === 'string' ? value.match(/^var\((--[\w-]+)\)$/) : null;
        return alias ? resolve(theme, alias[1]) : value;
      };
      const resolve = (theme, name) => resolveValue(theme, cssValue(theme, name));
      const ids = Object.keys(tokens)
        .filter((id) => !internal(id))
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
      const applied = Object.fromEntries(
        themes.map((theme) => [theme.name, resolver.apply(theme.input)]),
      );
      const list = ids.map((id) => {
        const name = cssVariable(id);
        const values = {};
        for (const theme of themes) {
          const token = applied[theme.name][id];
          const aliasOf = token.aliasChain?.find((target) => !internal(target));
          values[theme.name] = {
            css: cssValue(theme.name, name),
            resolved: resolve(theme.name, name),
            ...(aliasOf && { aliasOf }),
            ...(token.$description &&
              token.$description !== tokens[id].$description && {
                description: token.$description,
              }),
          };
        }
        return {
          id,
          cssVariable: name,
          type: tokens[id].$type,
          ...(tokens[id].$description && { description: tokens[id].$description }),
          ...(tokens[id].$deprecated && { deprecated: tokens[id].$deprecated }),
          ...(tokens[id].$extensions?.[extension]?.legacy && { legacy: true }),
          values,
        };
      });
      checkCustomProperties(list, handwrittenFile);
      const header =
        'Generated from packages/ui/tokens by `npm run tokens:build`. Do not edit: change the tokens and rebuild.';
      outputFile(
        'generated/tokens.json',
        JSON.stringify({ $comment: header, modifiers, themes, tokens: list }),
      );

      // The 0.7 names: each legacy token's role per theme, and the removed ones.
      const removed = JSON.parse(readFileSync(removedFile, 'utf8')).removed;
      const migration = {};
      for (const token of list.filter((entry) => entry.legacy)) {
        const roles = Object.fromEntries(
          themes.map((theme) => [theme.name, token.values[theme.name].aliasOf ?? null]),
        );
        const distinct = [...new Set(Object.values(roles))];
        const component = tokens[token.id].$extensions?.[extension]?.component;
        // A fixed color, such as the avatar's, aliases the palette itself: no role replaces it.
        const primitive = distinct[0] === null && tokens[token.id].aliasOf;
        migration[token.cssVariable] = {
          ...(primitive
            ? { primitive }
            : distinct.length === 1
              ? { token: distinct[0], cssVariable: cssVariable(distinct[0]) }
              : { tokens: roles }),
          ...(component && { component }),
        };
      }
      for (const [name, entry] of Object.entries(removed)) {
        if (migration[name]) throw new Error(`${name} is listed as removed but still exists.`);
        migration[name] = { removed: true, ...entry };
      }
      outputFile(
        'generated/token-migration.json',
        JSON.stringify({
          $comment: `${header} Maps each 0.7 custom property to the token that replaces it: one role, a role per theme for component tokens, or removed with its replacement.`,
          names: Object.fromEntries(
            Object.entries(migration).sort(([a], [b]) => a.localeCompare(b)),
          ),
        }),
      );

      let module = `// ${header}\n// Internal for now: the package neither exports nor ships it yet.\n\n`;
      module += `/** The themes Tokens.css builds: each color scheme at standard and high contrast. */\n`;
      module += `export const themes = ${JSON.stringify(themes.map((theme) => theme.name))} as const;\n`;
      module += `export type ThemeName = (typeof themes)[number];\n\n`;
      module += `/** A token's CSS value: one value, or a value per part of a composite token such as typography. */\nexport type TokenValue = string | Readonly<Record<string, string>>;\n\n`;
      module += `export interface TokenDefinition {\n  /** The CSS custom property that carries the token. */\n  cssVariable: \`--\${string}\`;\n  /** The DTCG type. */\n  type: string;\n  /**\n   * The value Tokens.css gives in each theme, with aliases resolved. Conditions that\n   * TokensHandwritten.css adds, such as the touch sizes under a coarse pointer, are not in it.\n   */\n  values: Readonly<Record<ThemeName, TokenValue>>;\n}\n\n`;
      module += `/** Every token, by its DTCG path. */\n`;
      module += `export const tokens = {\n`;
      for (const token of list) {
        if (token.description) module += `  /** ${token.description.replaceAll('*/', '*\\/')} */\n`;
        const values = Object.fromEntries(
          themes.map((theme) => [theme.name, token.values[theme.name].resolved]),
        );
        module += `  ${JSON.stringify(token.id)}: { cssVariable: ${JSON.stringify(token.cssVariable)}, type: ${JSON.stringify(token.type)}, values: ${JSON.stringify(values)} },\n`;
      }
      module += `} as const satisfies Record<string, TokenDefinition>;\n\n`;
      module += `export type TokenId = keyof typeof tokens;\n`;
      module += `export type TokenCssVariable = (typeof tokens)[TokenId]['cssVariable'];\n`;
      outputFile('generated/tokens.ts', module);
    },
  };
}

/** A fresh config, so a long-running build (the catalogue's dev server) reads the tokens anew. */
export function createConfig({
  tokensDirectory = defaultTokensDirectory,
  outDir = defaultOutDir,
} = {}) {
  const resolverFile = resolverIn(tokensDirectory);
  const source = (path) => JSON.parse(readFileSync(new URL(path, tokensDirectory), 'utf8'));
  const dark = contextTokens('colorScheme', 'dark', tokensDirectory);
  const high = contextTokens('contrast', 'high', tokensDirectory);
  const highSource = source('contrast/high.tokens.json');
  const pointers = {};
  (function collect(node, path) {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$') && key !== '$root') continue;
      if (!value || typeof value !== 'object') continue;
      const next = key === '$root' ? path : [...path, key];
      if ('$value' in value) {
        if (typeof value.$value === 'string') pointers[next.join('.')] = value.$value.slice(1, -1);
      } else collect(value, next);
    }
  })(highSource, []);
  const header =
    "/* Built from packages/ui/tokens by `npm run tokens:build`. The values DTCG can't express yet\n   are in TokensHandwritten.css. */\n";
  const block = (selector, contents) => `${selector} {\n  ${contents}\n}`;
  return {
    tokens: [resolverFile],
    outDir,
    plugins: [
      withoutDescriptions(
        css({
          filename: 'styles/Tokens.css',
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
              // Only what the dark scheme overrides, so the dark rule declares what it always did.
              input: { colorScheme: 'dark' },
              include: dark,
              prepare: (contents) =>
                `.env-theme[data-env-theme='dark'] {\n  color-scheme: dark;\n  ${contents}\n}`,
            },
            ...themes
              .filter((theme) => theme.media)
              .map((theme) => ({
                // Every token high contrast changes, in both schemes, so the dark high-contrast rule
                // also replaces the light one's values.
                input: theme.input,
                include: high,
                prepare: (contents) =>
                  `${block(theme.selectors.join(', '), contents)}\n@media ${theme.media.query} {\n  ${block(theme.media.selector, contents)}\n}`,
              })),
          ],
        }),
      ),
      envui({
        removedFile: new URL('removed-tokens.json', tokensDirectory),
        handwrittenFile: new URL('styles/TokensHandwritten.css', outDir),
      }),
    ],
    lint: {
      build: { enabled: true },
      rules: {
        // The value checks for every DTCG type, as Terrazzo recommends; names must be kebab-case.
        ...RECOMMENDED_CONFIG,
        'core/consistent-naming': ['error', { format: 'kebab-case' }],
        'envui/color-schemes': ['error', { dark }],
        'envui/high-contrast': [
          'error',
          {
            light: declaredTokens(source('base/contrast-high.tokens.json')),
            dark: declaredTokens(source('color-scheme/dark-contrast-high.tokens.json')),
            pointers,
          },
        ],
        'envui/unique-css-names': ['error', {}],
      },
    },
  };
}

export default createConfig();
