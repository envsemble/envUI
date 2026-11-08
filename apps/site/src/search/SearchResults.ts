import { findPage, type RoutePage } from '../routes/SiteRoutes';
import { counterpartOf } from '../routes/Counterparts';
import { docsRoute } from '../routes/Address';
import type { SearchResult } from './SearchIndex';

/** The groups results are shown in, by what they find. */
const groups: Record<SearchResult['kind'], string> = {
  component: 'Components',
  export: 'Components',
  foundation: 'Foundations',
  pattern: 'Patterns',
  guide: 'Pages',
  page: 'Pages',
  prop: 'Props',
  token: 'Tokens',
};

/**
 * The name of each part of the site, which a suggestion's description starts with, and a result's
 * where another result shown has the same name.
 */
const areas: Record<SearchResult['area'], string> = { catalogue: 'Catalogue', docs: 'Docs' };

/** What the empty query finds after the current page's counterpart: the start of either part. */
const suggestedRoutes = [docsRoute, 'components', 'patterns', 'docs/tokens'] as const;
export type SuggestedRoute = (typeof suggestedRoutes)[number];

/** A page search suggests before people type. Its id is the route it opens. */
export interface Suggestion {
  id: string;
  label: string;
  description: string;
  group: 'Suggested';
  /** Which of suggestedRoutes it is; none for the current page's counterpart. */
  suggested?: SuggestedRoute;
}

/**
 * What search suggests before people type: the page of the same subject in the other part, where
 * the current page has one, then the setup guide, every component, every pattern and the tokens.
 */
export function suggestionsFor(page: RoutePage | undefined): Suggestion[] {
  const counterpart = page && counterpartOf(page);
  const target = counterpart && findPage(counterpart);
  const suggestions: Suggestion[] = [];
  if (target)
    suggestions.push({
      id: target.path,
      label: target.title,
      description:
        target.area === 'docs'
          ? 'Docs · This page in code, with its props'
          : 'Catalogue · This page, with its examples and rules',
      group: 'Suggested',
    });
  for (const route of suggestedRoutes) {
    const suggested = findPage(route);
    if (!suggested) continue;
    suggestions.push({
      id: suggested.path,
      label: suggested.label ?? suggested.title,
      description: `${areas[suggested.area]} · ${suggested.section}`,
      group: 'Suggested',
      suggested: route,
    });
  }
  return suggestions;
}

/**
 * Where a result found as a whole page opens: in the part the reader is in, the Docs or the
 * catalogue, where that part has a page of the subject. A result at a place on a page, such as a
 * prop's row, opens where that place is.
 */
export function inReadersPart(route: string | undefined, page: RoutePage | undefined) {
  const target = route && !route.includes('?') ? findPage(route) : undefined;
  if (!page || !target || target.area === page.area) return route;
  return counterpartOf(target) ?? route;
}

/** Results considered, and shown in each group. */
export const resultLimit = 60;
const groupLimit = 8;

/**
 * The reference groups, long lists of like names, show their first few, then a row that shows the
 * rest of the group in place.
 */
const shortGroups = new Set(['Props', 'Tokens']);
const shortLimit = 3;

/**
 * The props most components pass to their root element, which a query for a component names along
 * with its own: they follow its own props, so "Textarea" lists sizing and variant before className.
 */
const passThroughProps = new Set(['ref', 'className', 'style']);
const passedThrough = ({ kind, title }: SearchResult) =>
  kind === 'prop' && passThroughProps.has(title);

/** The id of the row that shows the rest of a short group. */
export const moreId = (group: string) => `more:${group}`;

/**
 * The group of results that only mention the query, after those it names: one row that shows them
 * in place, so they never push what the query names out of view.
 */
const mentions = 'Also mentioned in';

/** The group a result is shown in. */
const groupOf = (result: SearchResult, named: boolean) =>
  named && !result.named ? mentions : groups[result.kind];

/** What a group shows: its results, and how many more it holds. */
export interface Group {
  name: string;
  results: SearchResult[];
  hidden: number;
}

/**
 * Results grouped by what they find: the pages, components, foundations, patterns and guides, then
 * the reference groups, props and tokens, each in the order of its best result. Within a group,
 * results keep their order, best first. Where the query names some results, by their names,
 * aliases or keywords, those come first, and results that only mention it in their text follow
 * them in a group of their own, folded into one row, so "date" lists DatePicker and the date props
 * before Table. A pattern is named by its title and aliases only, so "IconButton" lists IconButton
 * and its props rather than every pattern that uses it. The props of the components the query
 * names come first, best first, so "date" lists DatePicker's before CalendarHeatmap's startDate,
 * their pass-through props, such as className, last; then the props it names by their own name.
 * Props show where the query names some by their own name, as many as it names, up to a few;
 * else, and past those, they fold into the group's row, which shows the rest in place.
 */
export function groupResults(
  results: readonly SearchResult[],
  expanded: ReadonlySet<string>,
): Group[] {
  const named = results.some((result) => result.named);
  // The components and exports the query names, best first: their props come first, in that order.
  const found = results
    .filter(({ kind, named }) => named && (kind === 'component' || kind === 'export'))
    .map(({ title }) => title);
  const rankOf = ({ kind, owner }: SearchResult) => {
    const rank =
      kind === 'prop'
        ? found.findIndex((title) => title === owner || title === owner.split('.')[0])
        : -1;
    return rank === -1 ? found.length : rank;
  };
  const ordered = named
    ? [...results.filter((result) => result.named), ...results.filter((result) => !result.named)]
    : results;
  const grouped = new Map<string, SearchResult[]>();
  // Sorting is stable, so results of one rank keep their order: the props of the components the
  // query names, best first, then the props it names by their own name; a component's pass-through
  // props come after its own.
  const byRank = (a: SearchResult, b: SearchResult) =>
    rankOf(a) - rankOf(b) ||
    Number(b.namesProp) - Number(a.namesProp) ||
    Number(passedThrough(a)) - Number(passedThrough(b));
  for (const result of [...ordered].sort(byRank)) {
    const group = groupOf(result, named);
    grouped.set(group, [...(grouped.get(group) ?? []), result]);
  }
  // The groups in the order of their best result, the pages' before the reference groups and those
  // before the results that only mention the query.
  const tier = (name: string) => (name === mentions ? 2 : shortGroups.has(name) ? 1 : 0);
  const order = [...new Set(ordered.map((result) => groupOf(result, named)))].sort(
    (a, b) => tier(a) - tier(b),
  );
  return order.map((name) => {
    // The order lists the groups the results were put in.
    const members = grouped.get(name)!;
    const folds = shortGroups.has(name) || name === mentions;
    // Props show as many as the query names by their own name, the best first; with none, such as
    // for "Textarea", they all wait in the group's row.
    const limit = !folds
      ? groupLimit
      : expanded.has(name)
        ? members.length
        : name === mentions
          ? 0
          : name === groups.prop
            ? Math.min(shortLimit, members.filter((result) => result.namesProp).length)
            : shortLimit;
    // A short group of one more than it shows shows that one rather than a row for it.
    const shown = folds && members.length === limit + 1 ? members : members.slice(0, limit);
    return { name, results: shown, hidden: folds ? members.length - shown.length : 0 };
  });
}

/** A row of the palette: a result, by its kind, or a group's row that shows the rest of it. */
export interface ResultRow {
  id: string;
  label: string;
  description?: string;
  group: string;
  kind: SearchResult['kind'] | 'more';
}

/**
 * The palette's rows of the grouped results: each result under its group, its description what it
 * is, after the part it is in, the catalogue or the Docs, only where another result shown would
 * otherwise read the same; then, where a group holds more, the row that shows them.
 */
export function resultRows(grouped: readonly Group[]): ResultRow[] {
  const reads = ({ title, detail }: SearchResult) => `${title} · ${detail}`;
  const readings = new Map<string, number>();
  for (const { results } of grouped)
    for (const result of results)
      readings.set(reads(result), (readings.get(reads(result)) ?? 0) + 1);
  return grouped.flatMap(({ name, results, hidden }): ResultRow[] => [
    ...results.map((result) => ({
      id: result.id,
      label: result.title,
      description:
        (readings.get(reads(result)) ?? 0) > 1
          ? `${areas[result.area]} · ${result.detail}`
          : result.detail,
      group: name,
      kind: result.kind,
    })),
    ...(hidden > 0
      ? [
          {
            id: moreId(name),
            label:
              name === mentions
                ? `${hidden} ${hidden === 1 ? 'result' : 'results'}`
                : `${hidden} ${results.length ? 'more ' : ''}${name.toLowerCase()}`,
            group: name,
            kind: 'more' as const,
          },
        ]
      : []),
  ]);
}
