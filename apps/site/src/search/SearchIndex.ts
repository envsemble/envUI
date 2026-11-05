import MiniSearch from 'minisearch';
// Written by scripts/site/SearchIndex.ts when the documentation is generated; read as text, which
// MiniSearch parses on load.
import serializedIndex from '../generated/SearchIndex.json?raw';
import { indexOptions, searchIndex } from '../shared/SearchTerms';

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
   * query for one of them doesn't mean.
   */
  named: boolean;
}

const index = MiniSearch.loadJSON(serializedIndex, indexOptions);

/** The best matches of a query, best first. */
export function searchDocumentation(query: string, limit: number): SearchResult[] {
  return searchIndex(index, query)
    .slice(0, limit)
    .map(({ id, kind, title, owner, detail, page, area, view, section, match }) => ({
      id,
      kind,
      title,
      owner: owner ?? '',
      detail,
      page,
      area,
      view,
      section,
      named: Object.values(match).some((fields) =>
        fields.some((field) => field !== 'text' && (kind !== 'pattern' || field !== 'keywords')),
      ),
    }));
}
