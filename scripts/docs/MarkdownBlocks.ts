import type { Token, Tokens } from 'marked';

export const cell = (text: unknown) =>
  String(text).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

const propsTableNames = [
  'prop',
  'props',
  'name',
  'property',
  'properties',
  'option',
  'options',
  'attribute',
  'attributes',
  'parameter',
  'parameters',
  'argument',
  'arguments',
  'field',
  'fields',
];
const propsTableColumns = ['type', 'types', 'contract', 'contracts', 'default', 'defaults'];

export function isPropsTable(token: Token) {
  if (token.type !== 'table') return false;
  const header = (token as Tokens.Table).header.map((cell) => cell.text.trim().toLowerCase());
  return (
    propsTableNames.includes(header[0]) &&
    header.slice(1).some((cell) => propsTableColumns.includes(cell))
  );
}

export function fenceFor(source: string) {
  const longest = Math.max(0, ...[...source.matchAll(/`+/g)].map((match) => match[0].length));
  return '`'.repeat(Math.max(3, longest + 1));
}

export const specimenPattern = /^<!--\s*specimen:\s*([A-Za-z][\w]*)\s*-->\s*$/;
