// The envUI tokens a lint package's messages suggest, read from data/tokens.json beside this file.
// scripts/build/SyncLintPackages.ts copies this file into the ESLint plugin and the Stylelint config,
// each with its own data/tokens.json from the library's generated token list, so each package
// works on its own once installed.
import { readFileSync } from 'node:fs';

/** envUI's public tokens by DTCG type. */
export const tokens = JSON.parse(
  readFileSync(new URL('./data/tokens.json', import.meta.url), 'utf8'),
).tokens;

/** The semantic color roles a property's color plays: text, background or boundary. */
const roleOfProperty = [
  { role: 'bg', property: /^(?:background|bg)/i },
  { role: 'border', property: /^(?:border|outline|column-?rule)/i },
  { role: 'fg', property: /^(?:color|fill|stroke|caret|accent|text-?decoration)/i },
];

/**
 * One family of semantic color tokens, such as the text colors: the prefix its custom properties
 * share (`--env-color-fg-`) and its default token, or undefined when envUI has no such tokens.
 */
function colorFamily(role) {
  // The role follows the color group directly, as in --env-color-bg-.
  const family = new RegExp(`^--[a-z]+-color-${role}-`);
  const names = (tokens.color ?? []).filter((name) => family.test(name));
  if (names.length === 0) return undefined;
  const prefix = names[0].slice(0, names[0].indexOf(`-${role}-`) + role.length + 2);
  return { prefix, example: names.find((name) => name === `${prefix}default`) ?? names[0] };
}

const families = ['fg', 'bg', 'border'].map((role) => ({ role, family: colorFamily(role) }));

/**
 * The envUI color tokens to suggest in place of a raw color in a property: for a property with a
 * known role, its default token and the family it belongs to; otherwise every family.
 */
function colorTokenSuggestion(property) {
  const role = property && roleOfProperty.find((entry) => entry.property.test(property))?.role;
  const family = families.find((entry) => entry.role === role)?.family;
  if (family) return `such as var(${family.example}) or another var(${family.prefix}…) role`;
  const known = families.flatMap((entry) => (entry.family ? [entry.family.prefix] : []));
  if (known.length === 0) return 'from envUI';
  const list = known.map((prefix) => `var(${prefix}…)`);
  return `one of the ${list.length > 1 ? `${list.slice(0, -1).join(', ')} or ${list.at(-1)}` : list[0]} roles`;
}

/** What to use instead of a raw color, with the envUI tokens for the property it is in. */
export function colorTokenAdvice(property) {
  return `use an envUI color token instead, ${colorTokenSuggestion(property)}, so the color follows the theme and keeps its contrast.`;
}
