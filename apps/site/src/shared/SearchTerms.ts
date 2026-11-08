// How envUI's documentation search reads text: shared by the index the build writes
// (SearchIndex.ts) and the catalogue that loads and queries it, so both split and fold words alike.
// It runs in Node and in the browser, so it imports nothing but types.
import type MiniSearch from 'minisearch';
import type { Options, SearchOptions, SearchResult } from 'minisearch';

/** The fields of a search document that are indexed, by weight at query time. */
const searchFields: string[] = ['title', 'owner', 'aliases', 'keywords', 'text'];

/** The fields a result carries, to show and open it without the documents themselves. */
const storeFields: string[] = [
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

/**
 * Splits text into words: at anything but a letter or digit, so `--env-color-fg-muted` and
 * `Menu.Item` split, and also at the humps of a camel-case word, which stays whole as well, so
 * `startIcon` is found by "startIcon", "start icon" and "icon".
 */
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

/** Folds a word for matching: lowercase, without accents. */
export function processTerm(term: string): string {
  return term.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Options of the MiniSearch index, the same when it is written and when it is loaded. */
export const indexOptions: Options = {
  fields: searchFields,
  storeFields,
  tokenize,
  processTerm,
};

/** The fields a result stores that its boost reads. */
interface StoredResult {
  kind?: string;
  title?: string;
  owner?: string;
  names?: readonly string[];
}

/** How much a match counts by what it finds: a page before the exports, props and tokens on it. */
const kindBoost: Record<string, number> = { export: 1.5, prop: 1, token: 1 };

/** How much more a result counts whose whole name, or alias, the query is; a prop's name alone counts a fifth. */
const exactBoost = 20;

/**
 * A name as a query compares with it: its words folded and joined by single spaces, so Button.variant,
 * "Button variant" and "button  variant" read alike, and --env-color-fg-muted is "env color fg muted".
 */
export function nameKey(text: string): string {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(processTerm)
    .join(' ');
}

/** A title folded, as it is and written out at its humps: CopyButton is copybutton and copy button. */
const ownNames = (title: string) => [
  nameKey(title),
  nameKey(title.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')),
];

/** Whether a title starts with the query, its words run together: DatePicker with "date" or "date pi". */
const startsName = (title: string, key: string) =>
  nameKey(title).replaceAll(' ', '').startsWith(key.replaceAll(' ', ''));

/**
 * How a query matches: every word must match, as the start of a word as people type, and longer
 * words also with a typo. Names count most, then the export a prop belongs to, aliases and other
 * names, then text; pages count three times as much as the parts they document. A page's long list
 * of aliases counts nearly as much as a prop's short name (BM25's `b`, which discounts long fields,
 * is low). A result whose whole name the query is comes first: an export or page by its name, such
 * as IconButton or useToast, a prop by its export and its name, Button.variant or "Button variant",
 * and a token by its custom property.
 */
export function queryOptionsFor(query: string): SearchOptions {
  const key = nameKey(query);
  return {
    combineWith: 'AND',
    prefix: true,
    fuzzy: (term: string) => (term.length >= 5 ? 0.2 : false),
    boost: { title: 6, owner: 3, aliases: 4, keywords: 2, text: 1 },
    boostDocument: (_id: unknown, _term: string, stored?: StoredResult) => {
      const kind = kindBoost[stored?.kind ?? ''] ?? 3;
      if (key === '') return kind;
      // The query is the result's own name, such as useToast, or that name written out, copy
      // button for CopyButton, which counts more than a page's alias of the same words, such as
      // the Toast page's useToast or the Button page's copy button.
      if (!stored?.owner && ownNames(stored?.title ?? '').includes(key))
        return kind * exactBoost * 3;
      // A name that starts with the query, as DatePicker does "date", counts as much as an alias
      // the query is, so a page named for it comes before one that only lists it, RelativeTime.
      if (!stored?.owner && startsName(stored?.title ?? '', key)) return kind * exactBoost;
      // The query is another of the result's whole names: an alias, or Button.variant.
      if (stored?.names?.includes(key)) return kind * exactBoost;
      // Many exports share a prop's name, such as variant, so it counts less on its own, and
      // never as much as a page whose alias the query is, such as modal for Dialog.
      if (stored?.owner && nameKey(stored.title ?? '') === key) return kind * (exactBoost / 5);
      return kind;
    },
    bm25: { k: 1.2, b: 0.3, d: 0.5 },
  };
}

/** The kinds of result that are a page, which a query names by its title. */
const pageKinds = new Set(['component', 'pattern', 'foundation', 'guide', 'page']);

/** Whether a query's word matched a result's title. */
const titleMatched = (result: SearchResult) =>
  Object.values(result.match).some((fields) => fields.includes('title'));

/**
 * Whether a query names a result: the query is one of its whole names, such as an alias, or every
 * word of it starts a word of the result's name or its owner's, as "date pi" does DatePicker's and
 * "button variant" Button.variant's.
 */
function named(result: SearchResult, words: readonly string[], key: string) {
  if ((result.names as readonly string[] | undefined)?.includes(key)) return true;
  const own = tokenize(`${result.title ?? ''} ${result.owner ?? ''}`).map(processTerm);
  return words.every((word) => own.some((term) => term.startsWith(word)));
}

/**
 * Searches the index with a query: every word must match (queryOptionsFor). Where a query of
 * several words names no result that way, as "primary button" names none, finding the Navigation
 * pattern by its aliases but not Button, whose page never says primary, the pages and exports whose
 * title holds any of its words come first, best first, then what matched every word.
 */
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
