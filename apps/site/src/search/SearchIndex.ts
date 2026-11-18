import MiniSearch from 'minisearch';
import serializedIndex from '../generated/SearchIndex.json?raw';
import {
  indexOptions,
  nameKey,
  processTerm,
  searchIndex,
  tokenize,
  type SearchDocument,
} from '../documentation/SearchTerms';

export interface SearchResult extends Pick<
  SearchDocument,
  'id' | 'kind' | 'title' | 'owner' | 'detail' | 'page' | 'area' | 'view' | 'section'
> {
  named: boolean;
  namesProp: boolean;
}

const index = MiniSearch.loadJSON(serializedIndex, indexOptions);

const wordsOf = (text: string) => tokenize(text).map(processTerm);

const startsWords = (words: readonly string[], names: readonly string[]) =>
  words.every((word) => names.some((name) => name.startsWith(word)));

export function searchDocumentation(query: string, limit: number): SearchResult[] {
  const words = wordsOf(query);
  const key = nameKey(query);
  const results = searchIndex(index, query)
    .slice(0, limit)
    .map((result) => {
      const { kind, title, owner, match } = result;
      const names = (result.names as readonly string[] | undefined) ?? [];
      const own = wordsOf(title);
      const byName = names.includes(key) || startsWords(words, [...own, ...wordsOf(owner ?? '')]);
      const nonTextMatches = Object.entries(match).filter(([, found]) =>
        found.some((field) => field !== 'text'),
      );
      return {
        result,
        byName,
        byWholeNonTextWord: nonTextMatches.some(([term]) => words.includes(term)),
        byNonTextPrefix: nonTextMatches.length > 0,
        namesProp:
          kind === 'prop' &&
          (names.includes(key) ||
            (startsWords(words, [...own, ...wordsOf(owner ?? '')]) &&
              words.some((word) => own.some((name) => name.startsWith(word))))),
      };
    });
  const someOwnNameMatches = results.some(
    ({ result, byName }) => byName && result.kind !== 'prop' && result.kind !== 'token',
  );
  return results.map(({ result, byName, byWholeNonTextWord, byNonTextPrefix, namesProp }) => ({
    id: result.id,
    kind: result.kind,
    title: result.title,
    owner: result.owner ?? '',
    detail: result.detail,
    page: result.page,
    area: result.area,
    view: result.view,
    section: result.section,
    named:
      (byName && byNonTextPrefix) || byWholeNonTextWord || (!someOwnNameMatches && byNonTextPrefix),
    namesProp,
  }));
}
