import type MiniSearch from 'minisearch';
import type { Options, SearchOptions, SearchResult } from 'minisearch';

export type SearchKind =
  'component' | 'export' | 'prop' | 'token' | 'foundation' | 'guide' | 'page';

export interface SearchDocument {
  id: string;
  kind: SearchKind;
  title: string;
  detail: string;
  aliases: string;
  keywords: string;
  owner: string;
  text: string;
  page: string;
  area: 'catalogue' | 'docs';
  view?: 'props' | 'usage';
  section?: string;
}

const searchFields: (keyof SearchDocument)[] = ['title', 'owner', 'aliases', 'keywords', 'text'];

const storeFields: (keyof SearchDocument | 'names')[] = [
  'kind',
  'title',
  'owner',
  'names',
  'detail',
  'page',
  'area',
  'view',
  'section',
];

export function tokenize(text: string): string[] {
  const words: string[] = [];
  for (const word of text.split(/[^\p{L}\p{N}]+/u)) {
    if (!word) continue;
    words.push(word);
    const humps = word.split(/(?<=[\p{Ll}\p{N}])(?=\p{Lu})|(?<=\p{Lu})(?=\p{Lu}\p{Ll})/u);
    if (humps.length > 1) words.push(...humps);
  }
  return words;
}

export function processTerm(term: string): string {
  return term.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export const indexOptions: Options = {
  fields: searchFields,
  storeFields,
  tokenize,
  processTerm,
};

interface StoredResult {
  kind?: string;
  title?: string;
  owner?: string;
  names?: readonly string[];
}

const kindBoost: Record<string, number> = { export: 1.5, prop: 1, token: 1 };

const exactBoost = 20;
const pageKindBoost = 3;
const ownNameBoostFactor = 3;
const propNameAloneBoost = exactBoost / 5;
const fuzzyMinTermLength = 5;
const fuzzyEditDistanceRatio = 0.2;

export function nameKey(text: string): string {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(processTerm)
    .join(' ');
}

const ownNames = (title: string) => [
  nameKey(title),
  nameKey(title.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')),
];

const startsName = (title: string, key: string) =>
  nameKey(title).replaceAll(' ', '').startsWith(key.replaceAll(' ', ''));

export function queryOptionsFor(query: string): SearchOptions {
  const key = nameKey(query);
  return {
    combineWith: 'AND',
    prefix: true,
    fuzzy: (term: string) => (term.length >= fuzzyMinTermLength ? fuzzyEditDistanceRatio : false),
    boost: { title: 6, owner: 3, aliases: 4, keywords: 2, text: 1 },
    boostDocument: (_id: unknown, _term: string, stored?: StoredResult) => {
      const kind = kindBoost[stored?.kind ?? ''] ?? pageKindBoost;
      if (key === '') return kind;
      if (!stored?.owner && ownNames(stored?.title ?? '').includes(key))
        return kind * exactBoost * ownNameBoostFactor;
      if (!stored?.owner && startsName(stored?.title ?? '', key)) return kind * exactBoost;
      if (stored?.names?.includes(key)) return kind * exactBoost;
      if (stored?.owner && nameKey(stored.title ?? '') === key) return kind * propNameAloneBoost;
      return kind;
    },
    bm25: { k: 1.2, b: 0.3, d: 0.5 },
  };
}

const pageKinds = new Set(['component', 'foundation', 'guide', 'page']);

const titleMatched = (result: SearchResult) =>
  Object.values(result.match).some((fields) => fields.includes('title'));

function named(result: SearchResult, words: readonly string[], key: string) {
  if ((result.names as readonly string[] | undefined)?.includes(key)) return true;
  const own = tokenize(`${result.title ?? ''} ${result.owner ?? ''}`).map(processTerm);
  return words.every((word) => own.some((term) => term.startsWith(word)));
}

export function searchIndex(index: MiniSearch, query: string): SearchResult[] {
  const options = queryOptionsFor(query);
  const strict = index.search(query, options);
  const words = tokenize(query).map(processTerm);
  const key = nameKey(query);
  if (words.length < 2 || strict.some((result) => named(result, words, key))) return strict;
  const titled = index
    .search(query, { ...options, combineWith: 'OR' })
    .filter(
      (result) => (pageKinds.has(result.kind) || result.kind === 'export') && titleMatched(result),
    );
  const first = new Set(titled.map(({ id }) => id));
  return [...titled, ...strict.filter(({ id }) => !first.has(id))];
}
