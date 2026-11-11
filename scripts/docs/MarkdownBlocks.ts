// How the documentation reads and writes Markdown blocks: a table cell, a fence long enough for a
// source, a props table written by hand, and a specimen's comment.
import type { Token, Tokens } from 'marked';

export const cell = (text: unknown) =>
  String(text).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

/** First columns that name what a props table lists. */
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
/**
 * The columns that make a table one of props: a type, default or contract. A table of attributes
 * and their values, or of names and descriptions, is not.
 */
const propsTableColumns = ['type', 'types', 'contract', 'contracts', 'default', 'defaults'];

/**
 * A table that lists props by hand, such as `| Name | Contract |` or `| Option | Type |`; the
 * template generates them.
 */
export function isPropsTable(token: Token) {
  if (token.type !== 'table') return false;
  const header = (token as Tokens.Table).header.map((cell) => cell.text.trim().toLowerCase());
  return (
    propsTableNames.includes(header[0]) &&
    header.slice(1).some((cell) => propsTableColumns.includes(cell))
  );
}

/** A fence long enough for a source: three backticks, or one more than its longest run. */
export function fenceFor(source: string) {
  const longest = Math.max(0, ...[...source.matchAll(/`+/g)].map((match) => match[0].length));
  return '`'.repeat(Math.max(3, longest + 1));
}

export const specimenPattern = /^<!--\s*specimen:\s*([A-Za-z][\w]*)\s*-->\s*$/;
