import { readFileSync } from 'node:fs';

export const tokens = JSON.parse(
  readFileSync(new URL('./data/tokens.json', import.meta.url), 'utf8'),
).tokens;

const colorRoleOfProperty = [
  { role: 'bg', property: /^(?:background|bg)/i },
  { role: 'border', property: /^(?:border|outline|column-?rule)/i },
  { role: 'fg', property: /^(?:color|fill|stroke|caret|accent|text-?decoration)/i },
];

function semanticColorFamily(role) {
  const family = new RegExp(`^--[a-z]+-color-${role}-`);
  const names = (tokens.color ?? []).filter((name) => family.test(name));
  if (names.length === 0) return undefined;
  const prefix = names[0].slice(0, names[0].indexOf(`-${role}-`) + role.length + 2);
  return { prefix, example: names.find((name) => name === `${prefix}default`) ?? names[0] };
}

const families = ['fg', 'bg', 'border'].map((role) => ({
  role,
  family: semanticColorFamily(role),
}));

function colorTokenSuggestion(property) {
  const role = property && colorRoleOfProperty.find((entry) => entry.property.test(property))?.role;
  const family = families.find((entry) => entry.role === role)?.family;
  if (family) return `such as var(${family.example}) or another var(${family.prefix}…) role`;
  const known = families.flatMap((entry) => (entry.family ? [entry.family.prefix] : []));
  if (known.length === 0) return 'from envUI';
  const list = known.map((prefix) => `var(${prefix}…)`);
  return `one of the ${list.length > 1 ? `${list.slice(0, -1).join(', ')} or ${list.at(-1)}` : list[0]} roles`;
}

export function colorTokenAdvice(property) {
  return `use an envUI color token instead, ${colorTokenSuggestion(property)}, so the color follows the theme and keeps its contrast.`;
}
