import { findPage, type RoutePage } from '../routes/SiteRoutes';
import { counterpartOf } from '../routes/Counterparts';
import { docsRoute } from '../routes/Address';
import type { SearchResult } from './SearchIndex';

const groups: Record<SearchResult['kind'], string> = {
  component: 'Components',
  export: 'Components',
  foundation: 'Foundations',
  guide: 'Pages',
  page: 'Pages',
  prop: 'Props',
  token: 'Tokens',
};

const areas: Record<SearchResult['area'], string> = { catalogue: 'Catalogue', docs: 'Docs' };

const suggestedRoutes = [docsRoute, 'components', 'docs/tokens'] as const;
export type SuggestedRoute = (typeof suggestedRoutes)[number];

export interface Suggestion {
  id: string;
  label: string;
  description: string;
  suggested?: SuggestedRoute;
}

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
    });
  for (const route of suggestedRoutes) {
    const suggested = findPage(route);
    if (!suggested) continue;
    suggestions.push({
      id: suggested.path,
      label: suggested.label ?? suggested.title,
      description: `${areas[suggested.area]} · ${suggested.section}`,
      suggested: route,
    });
  }
  return suggestions;
}

export function inReadersPart(route: string | undefined, page: RoutePage | undefined) {
  const target = route && !route.includes('?') ? findPage(route) : undefined;
  if (!page || !target || target.area === page.area) return route;
  return counterpartOf(target) ?? route;
}

export const resultLimit = 60;
const groupLimit = 8;

const shortGroups = new Set(['Props', 'Tokens']);
const shortLimit = 3;

const passThroughProps = new Set(['ref', 'className', 'style']);
const passedThrough = ({ kind, title }: SearchResult) =>
  kind === 'prop' && passThroughProps.has(title);

export const moreId = (group: string) => `more:${group}`;

const mentionsGroup = 'Also mentioned in';

const groupOf = (result: SearchResult, named: boolean) =>
  named && !result.named ? mentionsGroup : groups[result.kind];

export interface Group {
  name: string;
  results: SearchResult[];
  hidden: number;
}

export function groupResults(
  results: readonly SearchResult[],
  expanded: ReadonlySet<string>,
): Group[] {
  const named = results.some((result) => result.named);
  const namedComponents = results
    .filter(({ kind, named }) => named && (kind === 'component' || kind === 'export'))
    .map(({ title }) => title);
  const rankOf = ({ kind, owner }: SearchResult) => {
    const rank =
      kind === 'prop'
        ? namedComponents.findIndex((title) => title === owner || title === owner.split('.')[0])
        : -1;
    return rank === -1 ? namedComponents.length : rank;
  };
  const ordered = named
    ? [...results.filter((result) => result.named), ...results.filter((result) => !result.named)]
    : results;
  const grouped = new Map<string, SearchResult[]>();
  const byRank = (a: SearchResult, b: SearchResult) =>
    rankOf(a) - rankOf(b) ||
    Number(b.namesProp) - Number(a.namesProp) ||
    Number(passedThrough(a)) - Number(passedThrough(b));
  for (const result of [...ordered].sort(byRank)) {
    const group = groupOf(result, named);
    grouped.set(group, [...(grouped.get(group) ?? []), result]);
  }
  const tier = (name: string) => (name === mentionsGroup ? 2 : shortGroups.has(name) ? 1 : 0);
  const order = [...new Set(ordered.map((result) => groupOf(result, named)))].sort(
    (a, b) => tier(a) - tier(b),
  );
  return order.map((name) => {
    const members = grouped.get(name)!;
    const folds = shortGroups.has(name) || name === mentionsGroup;
    const limit = !folds
      ? groupLimit
      : expanded.has(name)
        ? members.length
        : name === mentionsGroup
          ? 0
          : name === groups.prop
            ? Math.min(shortLimit, members.filter((result) => result.namesProp).length)
            : shortLimit;
    const onlyOneMoreThanLimit = folds && members.length === limit + 1;
    const shown = onlyOneMoreThanLimit ? members : members.slice(0, limit);
    return { name, results: shown, hidden: folds ? members.length - shown.length : 0 };
  });
}

export interface ResultRow {
  id: string;
  label: string;
  description?: string;
  kind: SearchResult['kind'] | 'more';
}

export function resultRows(grouped: readonly Group[]): { label: string; items: ResultRow[] }[] {
  const reads = ({ title, detail }: SearchResult) => `${title} · ${detail}`;
  const readings = new Map<string, number>();
  for (const { results } of grouped)
    for (const result of results)
      readings.set(reads(result), (readings.get(reads(result)) ?? 0) + 1);
  return grouped.map(({ name, results, hidden }) => ({
    label: name,
    items: [
      ...results.map((result) => ({
        id: result.id,
        label: result.title,
        description:
          (readings.get(reads(result)) ?? 0) > 1
            ? `${areas[result.area]} · ${result.detail}`
            : result.detail,
        kind: result.kind,
      })),
      ...(hidden > 0
        ? [
            {
              id: moreId(name),
              label:
                name === mentionsGroup
                  ? `${hidden} ${hidden === 1 ? 'result' : 'results'}`
                  : `${hidden} ${results.length ? 'more ' : ''}${name.toLowerCase()}`,
              kind: 'more' as const,
            },
          ]
        : []),
    ],
  }));
}
