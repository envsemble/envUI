import MiniSearch from 'minisearch';
// Written by scripts/SearchIndex.mjs when the documentation is generated; read as text, which
// MiniSearch parses on load.
import serializedIndex from '../generated/SearchIndex.json?raw';
import { indexOptions, queryOptions } from '../../../../scripts/SearchTerms.mjs';

/** What a search finds, as scripts/SearchIndex.mjs describes it. */
export interface SearchResult {
  id: string;
  kind: 'component' | 'export' | 'prop' | 'token' | 'foundation' | 'pattern' | 'guide' | 'page';
  title: string;
  detail: string;
  /** The document id of the page it is on, such as button, or a catalogue page's, such as tokens. */
  page: string;
  /** The page's view it is in, such as props. */
  view?: string;
  /** The id of its element on the page. */
  section?: string;
}

const index = MiniSearch.loadJSON(serializedIndex, indexOptions);

/** The best matches of a query, best first. */
export function searchDocumentation(query: string, limit: number): SearchResult[] {
  return index
    .search(query, queryOptions)
    .slice(0, limit)
    .map(({ id, kind, title, detail, page, view, section }) => ({
      id,
      kind,
      title,
      detail,
      page,
      view,
      section,
    }));
}
