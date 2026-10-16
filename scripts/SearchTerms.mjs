// How envUI's documentation search reads text: shared by the index the build writes
// (SearchIndex.mjs) and the catalogue that loads and queries it, so both split and fold words alike.
// It runs in Node and in the browser, so it imports nothing.

/** The fields of a search document that are indexed, by weight at query time. */
export const searchFields = ['title', 'aliases', 'keywords', 'text'];

/** The fields a result carries, to show and open it without the documents themselves. */
export const storeFields = ['kind', 'title', 'detail', 'page', 'view', 'section'];

/**
 * Splits text into words: at anything but a letter or digit, so `--color-fg-muted` and
 * `Menu.Item` split, and also at the humps of a camel-case word, which stays whole as well, so
 * `startIcon` is found by "startIcon", "start icon" and "icon".
 */
export function tokenize(text) {
  const words = [];
  for (const word of text.split(/[^\p{L}\p{N}]+/u)) {
    if (!word) continue;
    words.push(word);
    const humps = word.split(/(?<=[\p{Ll}\p{N}])(?=\p{Lu})|(?<=\p{Lu})(?=\p{Lu}\p{Ll})/u);
    if (humps.length > 1) words.push(...humps);
  }
  return words;
}

/** Folds a word for matching: lowercase, without accents. */
export function processTerm(term) {
  return term.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Options of the MiniSearch index, the same when it is written and when it is loaded. */
export const indexOptions = {
  fields: searchFields,
  storeFields,
  tokenize,
  processTerm,
};

/** How much a match counts by what it finds: a page before the exports, props and tokens on it. */
const kindBoost = { export: 1.5, prop: 1, token: 1 };

/**
 * How a query matches: every word must match, as the start of a word as people type, and longer
 * words also with a typo. Names count most, then aliases and other names, then text; pages count
 * three times as much as the parts they document. A page's long list of aliases counts nearly as
 * much as a prop's short name (BM25's `b`, which discounts long fields, is low).
 */
export const queryOptions = {
  combineWith: 'AND',
  prefix: true,
  fuzzy: (term) => (term.length > 5 ? 0.2 : false),
  boost: { title: 6, aliases: 4, keywords: 2, text: 1 },
  boostDocument: (_id, _term, stored) => kindBoost[stored?.kind] ?? 3,
  bm25: { k: 1.2, b: 0.3, d: 0.5 },
};
