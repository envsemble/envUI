// envUI's own lint rules for the tokens, which Terrazzo runs before every build.
import type { LintRule } from '@terrazzo/parser';
import { cssVariable, isInternal, isSemanticColor, prefix } from './Themes.ts';

/**
 * `envui/color-schemes`: every semantic color is declared in the dark scheme, so dark is designed
 * rather than inherited, and every other color outside the palette is an alias, which follows its
 * target into each scheme. (core/required-modes reads only the legacy `$extensions.mode`, so with a
 * resolver it sees no modes on any token.)
 */
const colorSchemesRule: LintRule<never, { dark: string[] }> = {
  meta: { docs: { description: 'Every semantic color has a dark value; other colors alias.' } },
  defaultOptions: { dark: [] },
  create({ tokens, options, report }) {
    const dark = new Set(options.dark);
    for (const token of Object.values(tokens)) {
      if (token.$type !== 'color' || isInternal(token.id)) continue;
      if (isSemanticColor(token.id) && !dark.has(token.id))
        report({
          message: `${token.id} has no dark value: add one to color-scheme/dark.tokens.json.`,
        });
      else if (!isSemanticColor(token.id) && !token.aliasOf && token.id.startsWith('color.'))
        report({ message: `${token.id} is a color outside the roles: alias a semantic role.` });
    }
  },
};

/**
 * `envui/high-contrast`: contrast/high.tokens.json points roles at `contrast-high.*`, which both
 * schemes must define, and the two schemes define the same high-contrast values.
 */
const highContrastRule: LintRule<
  never,
  { light: string[]; dark: string[]; pointers: Record<string, string> }
> = {
  meta: { docs: { description: 'Both schemes define every high-contrast value.' } },
  defaultOptions: { light: [], dark: [], pointers: {} },
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
const uniqueNamesRule: LintRule<never> = {
  meta: { docs: { description: 'Every token has its own CSS custom property, its path.' } },
  defaultOptions: {},
  create({ tokens, report }) {
    const seen = new Map<string, string>();
    for (const id of Object.keys(tokens)) {
      if (isInternal(id)) continue;
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
const declaredOnceRule: LintRule<never, { duplicates: string[] }> = {
  meta: { docs: { description: 'A set or context declares each token in one file.' } },
  defaultOptions: { duplicates: [] },
  create({ options, report }) {
    for (const message of options.duplicates) report({ message });
  },
};

export const lintRules = {
  'envui/declared-once': declaredOnceRule,
  'envui/color-schemes': colorSchemesRule,
  'envui/high-contrast': highContrastRule,
  'envui/unique-css-names': uniqueNamesRule,
};
