import MiniSearch from 'minisearch';
// Written by scripts/site/SearchIndex.ts when the documentation is generated; read as text, which
// MiniSearch parses on load.
import serializedIndex from '../generated/SearchIndex.json?raw';
import { indexOptions, nameKey, processTerm, searchIndex, tokenize } from '@docs-model/SearchTerms';

/** What a search finds, as scripts/site/SearchIndex.ts describes it. */
export interface SearchResult {
  id: string;
  kind: 'component' | 'export' | 'prop' | 'token' | 'foundation' | 'pattern' | 'guide' | 'page';
  title: string;
  /** The export a prop belongs to, such as Button or Table.Root; empty for anything else. */
  owner: string;
  detail: string;
  /** The document id of the page it is on, such as button, or a site page's, such as tokens. */
  page: string;
  /** The part that shows it: the catalogue, or the Docs. */
  area: 'catalogue' | 'docs';
  /** The page's view it is in, such as props. */
  view?: string;
  /** The id of its element on the page. */
  section?: string;
  /**
   * Whether the query matched what it is called, its name, aliases or keywords, not only its text;
   * for a pattern, its name or aliases, as its keywords are the components it composes, which a
   * query for one of them doesn't mean. An alias that only starts with the query, as Checkbox's
   * select all does "sel", names a result only where no result's own name starts with it.
   */
  named: boolean;
  /**
   * For a prop, whether the query names the prop itself, its own name and not only its export's,
   * as "sel" names Table.Row's selected but not Select's open.
   */
  namesProp: boolean;
}

const index = MiniSearch.loadJSON(serializedIndex, indexOptions);

/** The words of a name, folded, as a query's are. */
const wordsOf = (text: string) => tokenize(text).map(processTerm);

/** Whether every word of a query starts a word of one of the names. */
const startsWords = (words: readonly string[], names: readonly string[]) =>
  words.every((word) => names.some((name) => name.startsWith(word)));

/** The best matches of a query, best first. */
export function searchDocumentation(query: string, limit: number): SearchResult[] {
  const words = wordsOf(query);
  const key = nameKey(query);
  const results = searchIndex(index, query)
    .slice(0, limit)
    .map((result) => {
      const { kind, title, owner, match } = result;
      const names = (result.names as readonly string[] | undefined) ?? [];
      const own = wordsOf(title);
      // Named by what it is called: its own name, or its export's, starts with the query.
      const byName = names.includes(key) || startsWords(words, [...own, ...wordsOf(owner ?? '')]);
      // Named by a field other than its text, as an alias or keyword: whole words of the query.
      const fields = Object.entries(match).filter(([, found]) =>
        found.some((field) => field !== 'text' && (kind !== 'pattern' || field !== 'keywords')),
      );
      return {
        result,
        byName,
        byWhole: fields.some(([term]) => words.includes(term)),
        byPrefix: fields.length > 0,
        namesProp:
          kind === 'prop' &&
          (names.includes(key) ||
            (startsWords(words, [...own, ...wordsOf(owner ?? '')]) &&
              words.some((word) => own.some((name) => name.startsWith(word))))),
      };
    });
  // An alias the query only starts names a result only where no page's or export's own name does.
  const ownNamed = results.some(
    ({ result, byName }) => byName && result.kind !== 'prop' && result.kind !== 'token',
  );
  return results.map(({ result, byName, byWhole, byPrefix, namesProp }) => ({
    id: result.id,
    kind: result.kind,
    title: result.title,
    owner: result.owner ?? '',
    detail: result.detail,
    page: result.page,
    area: result.area,
    view: result.view,
    section: result.section,
    named: (byName && byPrefix) || byWhole || (!ownNamed && byPrefix),
    namesProp,
  }));
}
