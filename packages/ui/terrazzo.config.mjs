// Terrazzo builds envUI's tokens (packages/ui/tokens, DTCG 2025.10 with a resolver) into
// src/styles/Tokens.css and the generated token modules in src/generated. Run it through
// `npm run tokens:build`, which formats the output with Prettier; `npm run tokens:check` fails when
// the committed output is stale. `npx tz check --config packages/ui/terrazzo.config.mjs` only lints
// the tokens. See AGENTS.md.
import { existsSync, readFileSync } from 'node:fs';
import { RECOMMENDED_CONFIG } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { makeCSSVar, transformCSSValue } from '@terrazzo/token-tools/css';
import { converter, formatHex } from 'culori';

/** The token sources, and where the build writes; a test can build other tokens elsewhere. */
export const defaultTokensDirectory = new URL('./tokens/', import.meta.url);
export const defaultOutDir = new URL('./src/', import.meta.url);
const resolverIn = (directory) => new URL('envui.resolver.json', directory);

/** The vendor key of envUI's `$extensions`. */
const extension = 'com.envsemble.envui';

/** The prefix of every custom property envUI defines: its tokens and its components' own. */
export const prefix = 'env';

/**
 * The CSS custom property of a token, as plugin-css writes it in Tokens.css, in a var() that
 * aliases it, and for each part of a composite token (`--env-type-body-font-size`): makeCSSVar()
 * keeps letters and digits, joins the words with hyphens, lowercases them and puts the `env`
 * prefix first. The lint rule envui/unique-css-names makes it the token's path joined with
 * hyphens after the prefix, `color.fg.muted` as `--env-color-fg-muted`.
 */
export const cssVariable = (id) => makeCSSVar(id, { prefix });

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
 * The app scales, each a context of the resolver's scale modifier. Comfortable is the base set;
 * every other scale builds as a rule of its own, `.env-theme[data-env-scale='compact']`, which
 * declares only the tokens it changes. Scales change sizes, never colors, so they combine with every
 * theme. Compact is also the `system` scale, the default, where the primary pointer is fine: every
 * boundary but a comfortable one takes it under `pointer: fine`, as high contrast applies under
 * `prefers-contrast: more`, so the server and the first paint agree without measuring anything.
 */
export const scales = [
  { name: 'comfortable', input: { scale: 'comfortable' } },
  {
    name: 'compact',
    input: { scale: 'compact' },
    selector: ".env-theme[data-env-scale='compact']",
    media: {
      query: '(pointer: fine)',
      selector: ".env-theme:not([data-env-scale='comfortable'])",
    },
  },
];

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

/**
 * The tokens that two sources of the same set, or of the same modifier context, declare, as
 * messages: the resolver merges the sources in order, so the last would silently replace the
 * first. A context overriding the base set, as the dark scheme and high contrast do, is how themes
 * work and is not reported.
 */
export function duplicateTokens(tokensDirectory = defaultTokensDirectory) {
  const resolverFile = resolverIn(tokensDirectory);
  const resolver = JSON.parse(readFileSync(resolverFile, 'utf8'));
  const groups = [
    ...Object.entries(resolver.sets ?? {}).map(([name, set]) => [`the ${name} set`, set.sources]),
    ...Object.entries(resolver.modifiers ?? {}).flatMap(([modifier, { contexts }]) =>
      Object.entries(contexts).map(([context, sources]) => [
        `the ${context} context of ${modifier}`,
        sources,
      ]),
    ),
  ];
  const messages = [];
  for (const [where, sources] of groups) {
    const files = new Map();
    for (const [index, source] of sources.entries()) {
      // A source is a file, or tokens written inline; a reference to a set is that set's sources.
      if (source.$ref?.startsWith('#')) continue;
      const name = source.$ref?.replace(/^\.\//, '') ?? `inline source ${index + 1}`;
      const document = source.$ref
        ? JSON.parse(readFileSync(new URL(source.$ref, resolverFile), 'utf8'))
        : source;
      for (const id of declaredTokens(document)) files.set(id, [...(files.get(id) ?? []), name]);
    }
    for (const [id, names] of files)
      if (names.length > 1)
        messages.push(
          `${id} is declared in both ${names.join(' and ')}, which ${where} merges: declare it once.`,
        );
  }
  return messages;
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
 * A typography token's parts, as plugin-css writes them, with the line height in em where the
 * token's `$extensions` ask for it (`lineHeightUnit: 'em'`): the font shorthands of the type roles
 * keep the line height of their own size, also in descendants with another font size.
 */
function typography(token, options) {
  const parts = transformCSSValue(token, options);
  const unit = token.$extensions?.[extension]?.lineHeightUnit;
  if (!unit || typeof parts?.['line-height'] !== 'string') return parts;
  if (!/^\d+(?:\.\d+)?$/.test(parts['line-height'])) return parts;
  return { ...parts, 'line-height': `${parts['line-height']}${unit}` };
}

/**
 * CSS values: colors as cssColor() writes them, shadows with those colors, a zero length as `0`,
 * font names in single quotes, and numbers marked with a CSS unit (percentages). A token that
 * aliases another public token is written as var(), plugin-css's default; one that aliases the
 * palette or a high-contrast value carries the resolved value, because those never become CSS.
 */
function transform(token, options) {
  if (token.aliasChain?.length && !internal(token.aliasChain[0])) return undefined;
  const value = token.$value;
  switch (token.$type) {
    case 'typography':
      return typography(token, options);
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
 * The theme rules an element of each theme also matches, whose values it takes where its own rule
 * declares nothing, nearest first. A dark high-contrast element falls back to the light
 * high-contrast rule before the dark one: both have the same specificity, and the high-contrast
 * rule comes later in Tokens.css.
 */
const rulesBelow = {
  light: [],
  dark: ['light'],
  'light-high-contrast': ['light'],
  'dark-high-contrast': ['light-high-contrast', 'dark', 'light'],
};

/**
 * Tokens.css without the declarations of a theme rule that repeat the value an element of that
 * theme takes from the rules below it anyway, such as a dark value that is the light one. Every
 * element computes the same tokens; the token files still give each scheme and contrast all its
 * values, and the generated modules list them all.
 */
export function withoutRepeatedValues(css) {
  const themeOf = new Map(
    themes.flatMap((theme) => [
      ...theme.selectors.map((selector) => [selector, theme.name]),
      ...(theme.media ? [[theme.media.selector, theme.name]] : []),
    ]),
  );
  const declared = Object.fromEntries(themes.map((theme) => [theme.name, new Map()]));
  for (const { property, value, selector } of cssDeclarations(css)) {
    const theme = themeOf.get(selector);
    if (theme && property.startsWith('--')) declared[theme].set(property, value);
  }
  const repeated = {};
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
  return css.replace(/([^\n{}]+) \{\n([^{}]*)\}/g, (rule, selector, body) => {
    const theme = themeOf.get(selector.trim());
    if (!theme) return rule;
    const kept = body
      .split('\n')
      .filter((line) => !repeated[theme].has(line.match(/^\s*(--[\w-]+):/)?.[1]));
    return `${selector} {\n${kept.join('\n')}}`;
  });
}

/** plugin-css with Tokens.css written by withoutRepeatedValues(). */
function withoutRepeatedDeclarations(plugin) {
  return {
    ...plugin,
    build: (options) =>
      plugin.build({
        ...options,
        outputFile: (filename, contents) =>
          options.outputFile(
            filename,
            filename.endsWith('.css') ? withoutRepeatedValues(contents) : contents,
          ),
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

/**
 * `envui/unique-css-names`: no two tokens become the same custom property, compared as Tokens.css
 * writes them, and a token's path spells its property after the prefix: `space.4+` would be
 * written `--env-space-4`, where space.4 already is.
 */
const uniqueNamesRule = {
  meta: { docs: { description: 'Every token has its own CSS custom property, its path.' } },
  create({ tokens, report }) {
    const seen = new Map();
    for (const id of Object.keys(tokens)) {
      if (internal(id)) continue;
      const name = cssVariable(id);
      const spelled = `--${prefix}-${id.split('.').join('-')}`;
      if (name !== spelled)
        report({
          message: `${id} becomes ${name}, not ${spelled}: name tokens with lowercase letters, digits and hyphens.`,
        });
      if (seen.has(name)) report({ message: `${id} and ${seen.get(name)} both become ${name}.` });
      seen.set(name, id);
    }
  },
};

/**
 * `envui/declared-once`: each token is declared in one source file of its set or modifier context,
 * as duplicateTokens() reads them from the resolver.
 */
const declaredOnceRule = {
  meta: { docs: { description: 'A set or context declares each token in one file.' } },
  create({ options, report }) {
    for (const message of options.duplicates) report({ message });
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
    // A theme can give a composite token parts that the others don't, so take them from every one.
    const parts = new Set(
      Object.values(token.values).flatMap(({ css }) =>
        css && typeof css === 'object' ? Object.keys(css) : [],
      ),
    );
    const names = [token.cssVariable, ...[...parts].map((part) => `${token.cssVariable}-${part}`)];
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
 * The public tokens TokensHandwritten.css declares, from tokens/handwritten.json, as entries of the
 * token list: each with its value as the style sheet declares it on the theme boundary, with the
 * tokens it reads resolved in every theme. Fails on a listed token the style sheet doesn't declare.
 */
function handwrittenTokens(listFile, cssFile, resolve) {
  if (!existsSync(listFile)) return [];
  const listed = JSON.parse(readFileSync(listFile, 'utf8'));
  const css = existsSync(cssFile)
    ? readFileSync(cssFile, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    : '';
  return Object.entries(listed)
    .filter(([id]) => !id.startsWith('$'))
    .map(([id, { type, description }]) => {
      const name = cssVariable(id);
      const declared = css
        .match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1]
        .replace(/\s+/g, ' ')
        .trim();
      if (!declared)
        throw new Error(
          `tokens/handwritten.json lists ${id}, but TokensHandwritten.css declares no ${name}.`,
        );
      const values = Object.fromEntries(
        themes.map((theme) => [
          theme.name,
          {
            css: declared,
            resolved: declared.replace(/var\((--[\w-]+)\)/g, (_, used) =>
              resolve(theme.name, used),
            ),
          },
        ]),
      );
      return { id, cssVariable: name, type, description, handwritten: true, values };
    });
}

/**
 * envUI's own plugin: the lint rules, and the generated token modules, a typed TypeScript module and
 * a JSON token list for the docs.
 * The modules carry each token's value in every theme, as the browser resolves Tokens.css alone:
 * TokensHandwritten.css can change a few of them under a condition, such as the touch sizes of
 * --control-height and --title-bar-height under a coarse pointer, and those values are not in them.
 */
function envui({ handwrittenFile, handwrittenList }) {
  return {
    name: 'envui',
    lint: () => ({
      'envui/declared-once': declaredOnceRule,
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
      // resolves in the element's own theme, as in the browser. Each part of a composite token is
      // a custom property of its own, which a token that aliases it reads.
      const declared = Object.fromEntries(
        themes.map((theme) => {
          const values = new Map();
          for (const { localID, value } of getTransforms({ format: 'css', input: theme.input })) {
            values.set(localID, value);
            if (value && typeof value === 'object')
              for (const [part, partValue] of Object.entries(value))
                values.set(`${localID}-${part}`, partValue);
          }
          return [theme.name, values];
        }),
      );
      // Each scale but comfortable declares only what it changes, over the light theme's values.
      for (const scale of scales.filter((each) => each.selector)) {
        const values = new Map();
        for (const { localID, value } of getTransforms({ format: 'css', input: scale.input })) {
          values.set(localID, value);
          if (value && typeof value === 'object')
            for (const [part, partValue] of Object.entries(value))
              values.set(`${localID}-${part}`, partValue);
        }
        declared[scale.name] = values;
      }
      const fallback = { dark: ['light'], 'light-high-contrast': ['light'] };
      fallback['dark-high-contrast'] = ['dark', 'light'];
      for (const scale of scales.filter((each) => each.selector)) fallback[scale.name] = ['light'];
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
        if (alias) return resolve(theme, alias[1]);
        // A shorthand, such as a type role's font, reads its parts.
        return typeof value === 'string'
          ? value.replace(/var\((--[\w-]+)\)/g, (_, name) => resolve(theme, name))
          : value;
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
        // The value under each scale but comfortable, where that scale changes the token.
        const scaled = {};
        for (const scale of scales.filter((each) => each.selector)) {
          if (!declared[scale.name].has(name)) continue;
          scaled[scale.name] = {
            css: cssValue(scale.name, name),
            resolved: resolve(scale.name, name),
          };
        }
        return {
          id,
          cssVariable: name,
          type: tokens[id].$type,
          ...(tokens[id].$description && { description: tokens[id].$description }),
          ...(tokens[id].$deprecated && { deprecated: tokens[id].$deprecated }),
          ...(tokens[id].$extensions?.[extension]?.component && {
            component: tokens[id].$extensions[extension].component,
          }),
          values,
          ...(Object.keys(scaled).length > 0 && { scales: scaled }),
        };
      });
      checkCustomProperties(list, handwrittenFile);
      list.push(...handwrittenTokens(handwrittenList, handwrittenFile, resolve));
      list.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
      const header =
        'Generated from packages/ui/tokens by `npm run tokens:build`. Do not edit: change the tokens and rebuild.';
      outputFile(
        'generated/tokens.json',
        JSON.stringify({
          $comment: header,
          modifiers,
          themes,
          scales: scales.map(({ name, selector }) => ({ name, ...(selector && { selector }) })),
          tokens: list,
        }),
      );

      let module = `// ${header}\n// Internal for now: the package neither exports nor ships it yet.\n\n`;
      module += `/** The themes Tokens.css builds: each color scheme at standard and high contrast. */\n`;
      module += `export const themes = ${JSON.stringify(themes.map((theme) => theme.name))} as const;\n`;
      module += `export type ThemeName = (typeof themes)[number];\n\n`;
      module += `/** The app scales: comfortable, the base values, and compact. */\n`;
      module += `export const scales = ${JSON.stringify(scales.map((scale) => scale.name))} as const;\n`;
      module += `export type ScaleName = (typeof scales)[number];\n\n`;
      module += `/** A token's CSS value: one value, or a value per part of a composite token such as typography. */\nexport type TokenValue = string | Readonly<Record<string, string>>;\n\n`;
      module += `export interface TokenDefinition {\n  /** The CSS custom property that carries the token. */\n  cssVariable: \`--\${string}\`;\n  /** The DTCG type. */\n  type: string;\n  /**\n   * The value Tokens.css gives in each theme, with aliases resolved. Conditions that\n   * TokensHandwritten.css adds, such as the touch sizes under a coarse pointer, are not in it.\n   */\n  values: Readonly<Record<ThemeName, TokenValue>>;\n  /** The value under each scale that changes the token, such as compact; comfortable is values. */\n  scales?: Readonly<Partial<Record<ScaleName, TokenValue>>>;\n}\n\n`;
      module += `/** Every token, by its DTCG path. */\n`;
      module += `export const tokens = {\n`;
      for (const token of list) {
        if (token.description) module += `  /** ${token.description.replaceAll('*/', '*\\/')} */\n`;
        const values = Object.fromEntries(
          themes.map((theme) => [theme.name, token.values[theme.name].resolved]),
        );
        const scaled = token.scales
          ? `, scales: ${JSON.stringify(Object.fromEntries(Object.entries(token.scales).map(([scale, value]) => [scale, value.resolved])))}`
          : '';
        module += `  ${JSON.stringify(token.id)}: { cssVariable: ${JSON.stringify(token.cssVariable)}, type: ${JSON.stringify(token.type)}, values: ${JSON.stringify(values)}${scaled} },\n`;
      }
      module += `} as const satisfies Record<string, TokenDefinition>;\n\n`;
      module += `export type TokenId = keyof typeof tokens;\n`;
      module += `export type TokenCssVariable = (typeof tokens)[TokenId]['cssVariable'];\n`;
      outputFile('generated/tokens.ts', module);
    },
  };
}

/** A fresh config, so a long-running build (the site's dev server) reads the tokens anew. */
export function createConfig({
  tokensDirectory = defaultTokensDirectory,
  outDir = defaultOutDir,
} = {}) {
  const resolverFile = resolverIn(tokensDirectory);
  const source = (path) => JSON.parse(readFileSync(new URL(path, tokensDirectory), 'utf8'));
  const dark = contextTokens('colorScheme', 'dark', tokensDirectory);
  const high = contextTokens('contrast', 'high', tokensDirectory);
  const scaleTokens = Object.fromEntries(
    scales
      .filter((scale) => scale.selector)
      .map((scale) => [scale.name, contextTokens('scale', scale.name, tokensDirectory)]),
  );
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
      withoutRepeatedDeclarations(
        withoutDescriptions(
          css({
            filename: 'styles/Tokens.css',
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
              ...themes
                .filter((theme) => theme.media)
                .map((theme) => ({
                  // Every token high contrast changes, in both schemes, so the dark high-contrast
                  // rule also replaces the light one's values.
                  input: theme.input,
                  include: high,
                  prepare: (contents) =>
                    `${block(theme.selectors.join(', '), contents)}\n@media ${theme.media.query} {\n  ${block(theme.media.selector, contents)}\n}`,
                })),
              ...scales
                .filter((scale) => scale.selector)
                .map((scale) => ({
                  // Only the sizes the scale changes; colors come from the theme rules above.
                  input: scale.input,
                  include: scaleTokens[scale.name],
                  prepare: (contents) =>
                    scale.media
                      ? `${block(scale.selector, contents)}\n@media ${scale.media.query} {\n  ${block(scale.media.selector, contents)}\n}`
                      : block(scale.selector, contents),
                })),
            ],
          }),
        ),
      ),
      envui({
        handwrittenFile: new URL('styles/TokensHandwritten.css', outDir),
        handwrittenList: new URL('handwritten.json', tokensDirectory),
      }),
    ],
    lint: {
      build: { enabled: true },
      rules: {
        // The value checks for every DTCG type, as Terrazzo recommends; names must be kebab-case.
        ...RECOMMENDED_CONFIG,
        'core/consistent-naming': ['error', { format: 'kebab-case' }],
        'envui/declared-once': ['error', { duplicates: duplicateTokens(tokensDirectory) }],
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
