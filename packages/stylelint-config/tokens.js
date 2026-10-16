// The envUI tokens the config's messages suggest, read from data/tokens.json, which
// scripts/SyncTokens.mjs copies from the library's generated token list before every pack.
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
  const names = (tokens.color ?? []).filter((name) => name.includes(`-${role}-`));
  if (names.length === 0) return undefined;
  const prefix = names[0].slice(0, names[0].indexOf(`-${role}-`) + role.length + 2);
  return { prefix, example: names.find((name) => name === `${prefix}default`) ?? names[0] };
}

const families = ['fg', 'bg', 'border'].map((role) => ({ role, family: colorFamily(role) }));

/**
 * The envUI color tokens to suggest in place of a raw color in a property: for a property with a
 * known role, its default token and the family it belongs to; otherwise every family.
 */
export function colorTokenSuggestion(property) {
  const role = property && roleOfProperty.find((entry) => entry.property.test(property))?.role;
  const family = families.find((entry) => entry.role === role)?.family;
  if (family) return `such as var(${family.example}) or another var(${family.prefix}…) role`;
  const known = families.filter((entry) => entry.family).map((entry) => entry.family.prefix);
  if (known.length === 0) return 'from envUI';
  const list = known.map((prefix) => `var(${prefix}…)`);
  return `one of the ${list.length > 1 ? `${list.slice(0, -1).join(', ')} or ${list.at(-1)}` : list[0]} roles`;
}

/** envUI's stacking tokens, the custom properties of z-index layers such as `--z-modal`. */
export const stackingTokens = Object.values(tokens)
  .flat()
  .filter((name) => /^--(?:env-)?z(?:-index)?-/.test(name))
  .sort();

/** What to do instead of a literal z-index, depending on whether envUI has stacking tokens. */
export function stackingAdvice() {
  if (stackingTokens.length > 0) {
    const example = stackingTokens.find((name) => /modal|dialog/.test(name)) ?? stackingTokens[0];
    return `use a stacking token from envUI instead, such as var(${example}), so layers keep one order with envUI's popups and dialogs.`;
  }
  return 'envUI has no stacking tokens yet. Avoid a literal z-index, or set it through a documented custom property of your own, such as var(--app-z-header), so the order of layers lives in one place.';
}
