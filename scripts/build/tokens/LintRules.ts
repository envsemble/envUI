import type { LintRule } from '@terrazzo/parser';
import { cssVariable, isInternal, isSemanticColor, prefix } from './Themes.ts';

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
        report({
          message: `${id} has no light value: add it to base/light-contrast-high.tokens.json.`,
        });
    for (const [id, target] of Object.entries(options.pointers))
      if (target.startsWith('contrast-high.') && !light.has(target))
        report({ message: `${id} points at ${target}, which no scheme defines.` });
  },
};

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
