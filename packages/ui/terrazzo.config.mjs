// Terrazzo builds envUI's tokens (packages/ui/tokens, DTCG 2025.10 with a resolver) into
// src/styles/Tokens.css and the generated token modules in src/generated. Run it through
// `npm run tokens:build`, which formats the output with Prettier; `npm run tokens:check` fails when
// the committed output is stale. `npx tz check --config packages/ui/terrazzo.config.mjs` only lints
// the tokens. See docs/library-development.md.
import { readFileSync } from 'node:fs';
import { RECOMMENDED_CONFIG } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';

const resolverFile = new URL('./tokens/envui.resolver.json', import.meta.url);

/** The vendor key of envUI's `$extensions`. */
const extension = 'com.envsemble.envui';

/** The CSS custom property of a token: its path joined with hyphens, as Tokens.css names it. */
export const cssVariable = (id) => `--${id.split('.').join('-')}`;

/**
 * Colors without a dark value, which therefore look the same in both color schemes today. Each is
 * either meant to stay fixed (toasts, the avatar, the white of labels on solid fills) or has not
 * been designed for dark yet; the palette step gives every one a dark value and empties this list.
 */
export const singleSchemeColors = [
  'color.accent',
  'color.avatar',
  'color.avatar-figure',
  'color.canvas-dark',
  'color.destructive-action',
  'color.neutral-fill',
  'color.on-accent',
  'color.on-avatar',
  'color.on-destructive-action',
  'color.on-toast',
  'color.toast-error',
  'color.toast-info',
  'color.toast-neutral',
  'color.toast-success',
  'color.white',
];

/** IDs of the tokens a source document declares. */
function declaredTokens(document, path = [], ids = []) {
  for (const [key, value] of Object.entries(document)) {
    if (key.startsWith('$') || !value || typeof value !== 'object') continue;
    if ('$value' in value) ids.push([...path, key].join('.'));
    else declaredTokens(value, [...path, key], ids);
  }
  return ids;
}

/** IDs of the tokens one context of a resolver modifier overrides, read from its sources. */
export function contextTokens(modifier, context) {
  const resolver = JSON.parse(readFileSync(resolverFile, 'utf8'));
  const sources = resolver.modifiers[modifier].contexts[context];
  return sources.flatMap((source) =>
    declaredTokens(JSON.parse(readFileSync(new URL(source.$ref, resolverFile), 'utf8'))),
  );
}

/**
 * CSS values that keep today's text exactly: HSL colors with their authored channels (Terrazzo's
 * own serializer rounds them to five digits), a zero length as `0`, font names in single quotes,
 * and numbers marked with a CSS unit (the percentages of color-mix() weights and opacities).
 * Everything else, aliases included, takes plugin-css's default, which writes an alias as var().
 */
function transform(token) {
  if (token.aliasOf) return undefined;
  const value = token.$value;
  switch (token.$type) {
    case 'color':
      if (value.colorSpace !== 'hsl' || (value.alpha ?? 1) !== 1) return undefined;
      return `hsl(${value.components[0]} ${value.components[1]}% ${value.components[2]}%)`;
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
 * `envui/color-schemes`: every color has a dark value, or is listed in singleSchemeColors. It is
 * core/required-modes for a resolver: that rule reads only the legacy `$extensions.mode`, so with a
 * resolver it sees no modes on any token. An alias needs no dark value of its own, because it
 * follows its target into the dark scheme.
 */
const colorSchemesRule = {
  meta: { docs: { description: 'Every color has a dark value, or is listed as single-scheme.' } },
  create({ tokens, options, report }) {
    const dark = new Set(options.dark);
    const allowed = new Set(options.allow);
    for (const id of allowed) {
      if (tokens[id]?.$type !== 'color')
        report({ message: `${id} is listed in singleSchemeColors but is no color token.` });
      else if (dark.has(id))
        report({ message: `${id} has a dark value now: remove it from singleSchemeColors.` });
    }
    for (const token of Object.values(tokens)) {
      if (token.$type !== 'color' || token.aliasOf || dark.has(token.id) || allowed.has(token.id))
        continue;
      report({
        message: `${token.id} has no dark value: add one to color-scheme/dark.tokens.json.`,
      });
    }
  },
};

/**
 * envUI's own plugin: the color-scheme lint rule, and the generated token modules, a typed
 * TypeScript module and a JSON token list for the docs. Both carry each token's value in every color
 * scheme, as the browser resolves Tokens.css.
 */
function envui() {
  return {
    name: 'envui',
    lint: () => ({ 'envui/color-schemes': colorSchemesRule }),
    build({ getTransforms, outputFile, resolver, tokens }) {
      const modifiers = resolver.source.resolutionOrder
        .filter((item) => item.type === 'modifier')
        .map((item) => ({
          name: item.name,
          description: item.description,
          contexts: Object.keys(item.contexts),
          default: item.default,
        }));
      const schemes = modifiers.find((modifier) => modifier.name === 'colorScheme').contexts;
      // Tokens.css declares the base set, then each scheme's overrides; var() resolves in the
      // element's own scheme, as in the browser.
      const declared = Object.fromEntries(
        schemes.map((scheme) => [
          scheme,
          new Map(
            getTransforms({ format: 'css', input: { colorScheme: scheme } }).map((entry) => [
              entry.localID,
              entry.value,
            ]),
          ),
        ]),
      );
      const [baseScheme] = schemes;
      const cssValue = (scheme, name) =>
        declared[scheme].get(name) ?? declared[baseScheme].get(name);
      const resolve = (scheme, name) => {
        const value = cssValue(scheme, name);
        const alias = value?.match(/^var\((--[\w-]+)\)$/);
        return alias ? resolve(scheme, alias[1]) : value;
      };
      const ids = Object.keys(tokens).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
      const list = ids.map((id) => {
        const name = cssVariable(id);
        const values = {};
        for (const scheme of schemes) {
          const token = resolver.apply({ colorScheme: scheme })[id];
          values[scheme] = {
            css: cssValue(scheme, name),
            resolved: resolve(scheme, name),
            ...(token.aliasChain?.[0] && { aliasOf: token.aliasChain[0] }),
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
          values,
        };
      });
      const header =
        'Generated from packages/ui/tokens by `npm run tokens:build`. Do not edit: change the tokens and rebuild.';
      outputFile(
        'generated/tokens.json',
        JSON.stringify({ $comment: header, modifiers, tokens: list }),
      );
      let module = `// ${header}\n// Internal for now: the package does not export it yet.\n\n`;
      module += `/** The contexts of the colorScheme modifier; the first is the default. */\n`;
      module += `export const colorSchemes = ${JSON.stringify(schemes)} as const;\n`;
      module += `export type ColorScheme = (typeof colorSchemes)[number];\n\n`;
      module += `export interface TokenDefinition {\n  /** The CSS custom property that carries the token. */\n  cssVariable: \`--\${string}\`;\n  /** The DTCG type. */\n  type: string;\n  /** The CSS value in each color scheme, with aliases resolved. */\n  values: Readonly<Record<ColorScheme, string>>;\n}\n\n`;
      module += `/** Every token, by its DTCG path. */\n`;
      module += `export const tokens = {\n`;
      for (const token of list) {
        if (token.description) module += `  /** ${token.description.replaceAll('*/', '*\\/')} */\n`;
        const values = Object.fromEntries(
          schemes.map((scheme) => [scheme, token.values[scheme].resolved]),
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
export function createConfig() {
  const dark = contextTokens('colorScheme', 'dark');
  const header =
    "/* Built from packages/ui/tokens by `npm run tokens:build`. The values DTCG can't express yet\n   are in TokensHandwritten.css. */\n";
  return {
    tokens: [resolverFile],
    outDir: new URL('./src/', import.meta.url),
    plugins: [
      withoutDescriptions(
        css({
          filename: 'styles/Tokens.css',
          variableName: (token) => cssVariable(token.id),
          transform,
          permutations: [
            {
              // The base set: every token, in the light scheme.
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
          ],
        }),
      ),
      envui(),
    ],
    lint: {
      build: { enabled: true },
      rules: {
        // The value checks for every DTCG type, as Terrazzo recommends; names must be kebab-case.
        ...RECOMMENDED_CONFIG,
        'core/consistent-naming': ['error', { format: 'kebab-case' }],
        'envui/color-schemes': ['error', { dark, allow: singleSchemeColors }],
      },
    },
  };
}

export default createConfig();
