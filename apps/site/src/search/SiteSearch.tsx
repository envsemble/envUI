import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  CommandPalette,
  type CommandPaletteItem,
  type CommandPaletteProps,
} from '@envsemble/envui';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import { IconExtension } from '@envsemble/envui/icons/Extension';
import { IconDataObject } from '@envsemble/envui/icons/DataObject';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import { IconCategory } from '@envsemble/envui/icons/Category';
import { IconPattern } from '@envsemble/envui/icons/Pattern';
import { IconArticle } from '@envsemble/envui/icons/Article';
import { IconError } from '@envsemble/envui/icons/Error';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { counterpartOf, findPage, routeOfDocument, type RoutePage } from '../navigation/SiteRoutes';
import { otherPart } from '../navigation/OtherPart';
import { docsRoute, navigate, routeHref } from '../navigation/Address';
import { canRetryLoad, reloadModule, reloadPage } from '../loading/LoadBoundary';
import type { SearchResult } from './SearchIndex';
import { commandKey } from './SearchShortcut';

/** The search index's module, by its path in the site app, as module-files.json names it. */
const indexModule = 'src/search/SearchIndex.ts';
type IndexModule = typeof import('./SearchIndex');

let loadIndexModule: () => Promise<IndexModule> = () => import('./SearchIndex');
let indexLoad: Promise<IndexModule> | undefined;

/**
 * Loads the index once, on its own file in the hosted site, when search first opens or before
 * (preloadSearch). After a failure, the next load asks for it again, under a new address in
 * development.
 */
function loadIndex() {
  indexLoad ??= loadIndexModule().catch((error: unknown) => {
    indexLoad = undefined;
    const root = new URL(import.meta.env.BASE_URL, window.location.href).href;
    loadIndexModule = reloadModule(loadIndexModule, indexModule, root);
    throw error;
  });
  return indexLoad;
}

/**
 * Loads the index ahead of search opening, so its results are there as people type: once the page
 * is idle, and as a pointer or focus reaches the search button (SearchButton.tsx). The index is
 * parsed as it loads, which takes a moment, so not on a key of the shortcut, where it would hold up
 * the palette opening.
 */
export function preloadSearch() {
  void loadIndex().catch(() => {});
}

/** Loads the index once the page has been idle a while after it started. */
function preloadWhenIdle() {
  if (typeof window === 'undefined') return;
  const start = () =>
    typeof requestIdleCallback === 'function'
      ? requestIdleCallback(preloadSearch, { timeout: 4000 })
      : window.setTimeout(preloadSearch, 2000);
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
preloadWhenIdle();

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
const icons: Record<SearchResult['kind'], ReactNode> = {
  component: <IconWidgets />,
  export: <IconExtension />,
  foundation: <IconCategory />,
  pattern: <IconPattern />,
  guide: <IconArticle />,
  page: <IconArticle />,
  prop: <IconDataObject />,
  token: <IconPalette />,
};
/**
 * The name of each part of the site, which a suggestion's description starts with, and a result's
 * where another result shown has the same name.
 */
const areas: Record<SearchResult['area'], string> = { catalogue: 'Catalogue', docs: 'Docs' };

/** What the empty query finds: the start of either part, and the setup guide. */
const suggestedRoutes = [
  { route: docsRoute, icon: <IconArticle /> },
  { route: 'components', icon: <IconWidgets /> },
  { route: 'patterns', icon: <IconPattern /> },
  { route: 'docs/tokens', icon: <IconPalette /> },
];

/**
 * What search suggests before people type: the page of the same subject in the other part, where
 * the current page has one, then the setup guide, every component, every pattern and the tokens.
 * Each suggestion's id is the route it opens.
 */
function suggestionsFor(page: RoutePage | undefined): CommandPaletteItem[] {
  const counterpart = page && counterpartOf(page);
  const target = counterpart && findPage(counterpart);
  const suggestions: CommandPaletteItem[] = [];
  if (target) {
    const { Icon } = otherPart(page.area);
    suggestions.push({
      id: target.path,
      label: target.title,
      description:
        target.area === 'docs'
          ? 'Docs · This page in code, with its props'
          : 'Catalogue · This page, with its examples and rules',
      icon: <Icon />,
      group: 'Suggested',
    });
  }
  for (const { route, icon } of suggestedRoutes) {
    const suggested = findPage(route);
    if (!suggested) continue;
    suggestions.push({
      id: suggested.path,
      label: suggested.label ?? suggested.title,
      description: `${areas[suggested.area]} · ${suggested.section}`,
      icon,
      group: 'Suggested',
    });
  }
  return suggestions;
}

/**
 * Where a result found as a whole page opens: in the part the reader is in, the Docs or the
 * catalogue, where that part has a page of the subject. A result at a place on a page, such as a
 * prop's row, opens where that place is.
 */
function inReadersPart(route: string | undefined, page: RoutePage | undefined) {
  const target = route && !route.includes('?') ? findPage(route) : undefined;
  if (!page || !target || target.area === page.area) return route;
  return counterpartOf(target) ?? route;
}

/** Results considered, and shown in each group. */
const resultLimit = 60;
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
const moreId = (group: string) => `more:${group}`;

/**
 * The group of results that only mention the query, after those it names: one row that shows them
 * in place, so they never push what the query names out of view.
 */
const mentions = 'Also mentioned in';

/** The group a result is shown in. */
const groupOf = (result: SearchResult, named: boolean) =>
  named && !result.named ? mentions : groups[result.kind];

/** What a group shows: its results, and how many more it holds. */
interface Group {
  name: string;
  results: SearchResult[];
  hidden: number;
}

const noGroups: ReadonlySet<string> = new Set();

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
function groupResults(results: readonly SearchResult[], expanded: ReadonlySet<string>): Group[] {
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

type IndexState =
  | { status: 'loading' }
  | { status: 'ready'; search: IndexModule['searchDocumentation'] }
  | { status: 'failed' };

/**
 * Searches the catalogue and the Docs in envUI's CommandPalette: components by their names and aliases,
 * their props, the tokens and the foundations, patterns and guides, each page once. A result opens
 * its page, in the part the reader is in where both show it, and the prop or token on it; with Ctrl or ⌘ held, in a new tab. Before people type, it suggests a few pages, the current page's counterpart first.
 */
export function SiteSearch({
  open,
  onOpenChange,
  page,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The page the reader is on, whose counterpart search suggests. */
  page: RoutePage | undefined;
}) {
  const [query, setQuery] = useState('');
  // The short groups shown whole, for the query they were expanded for.
  const [expanded, setExpanded] = useState({ query: '', groups: noGroups });
  const expandedGroups = expanded.query === query ? expanded.groups : noGroups;
  const [index, setIndex] = useState<IndexState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open || index.status === 'ready') return;
    let current = true;
    loadIndex().then(
      (module) => current && setIndex({ status: 'ready', search: module.searchDocumentation }),
      () => current && setIndex({ status: 'failed' }),
    );
    return () => {
      current = false;
    };
  }, [open, index.status, attempt]);
  const grouped = useMemo(
    () =>
      index.status === 'ready' && query.trim()
        ? groupResults(index.search(query, resultLimit), expandedGroups)
        : [],
    [index, query, expandedGroups],
  );
  const results = useMemo(() => grouped.flatMap((group) => group.results), [grouped]);
  const items = useMemo<CommandPaletteItem[]>(() => {
    // What a result is, after the part it is in, the catalogue or the Docs, only where another
    // result shown would otherwise read the same.
    const reads = ({ title, detail }: SearchResult) => `${title} · ${detail}`;
    const readings = new Map<string, number>();
    for (const result of results)
      readings.set(reads(result), (readings.get(reads(result)) ?? 0) + 1);
    return grouped.flatMap(({ name, results: members, hidden }) => [
      ...members.map((result) => ({
        id: result.id,
        label: result.title,
        description:
          readings.get(reads(result))! > 1
            ? `${areas[result.area]} · ${result.detail}`
            : result.detail,
        icon: icons[result.kind],
        group: name,
      })),
      ...(hidden > 0
        ? [
            {
              id: moreId(name),
              label:
                name === mentions
                  ? `${hidden} ${hidden === 1 ? 'result' : 'results'}`
                  : `${hidden} ${members.length ? 'more ' : ''}${name.toLowerCase()}`,
              icon: <IconExpandMore />,
              group: name,
            },
          ]
        : []),
    ]);
  }, [grouped, results]);
  const suggestions = useMemo(() => suggestionsFor(page), [page]);
  // Before people type, the suggestions show. While the index loads, the palette says so; after it
  // fails, why, with the way on; and when a query finds nothing, what search finds.
  let empty: Pick<CommandPaletteProps, 'emptyIcon' | 'emptyLabel' | 'emptyDescription'>;
  if (index.status === 'loading') empty = {};
  else if (index.status === 'failed')
    empty = {
      emptyIcon: <IconError />,
      emptyLabel: 'Search could not load',
      emptyDescription: canRetryLoad ? (
        <Button
          variant="text"
          onClick={() => {
            setIndex({ status: 'loading' });
            setAttempt((count) => count + 1);
          }}
        >
          Try again
        </Button>
      ) : (
        <Button variant="text" onClick={() => void reloadPage([indexModule])}>
          Reload the page
        </Button>
      ),
    };
  else
    empty = {
      emptyDescription: `Nothing matches “${query.trim()}”. Search finds components by name or alias, their props, tokens, foundations, patterns and guides.`,
    };
  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      aria-label="Search envUI"
      className="site-search"
      placeholder="Search components, props and tokens"
      inputValue={query}
      onInputValueChange={setQuery}
      items={items}
      suggestedItems={suggestions}
      loading={index.status === 'loading'}
      loadingLabel="Loading search"
      {...empty}
      hints={[
        { keys: ['Enter'], label: 'Open' },
        { keys: [commandKey, 'Enter'], label: 'Open in a new tab' },
        { keys: ['Esc'], label: 'Close' },
      ]}
      // A result closes the palette as it opens; the row that shows the rest of a group keeps it
      // open.
      closeOnAction={false}
      onAction={(item, { modifier }) => {
        const more = grouped.find(({ name }) => item.id === moreId(name));
        if (more) {
          setExpanded({ query, groups: new Set([...expandedGroups, more.name]) });
          return;
        }
        const result = results.find(({ id }) => id === item.id);
        // A suggestion's id is its route.
        const route = result
          ? inReadersPart(
              routeOfDocument(result.page, { view: result.view, section: result.section }),
              page,
            )
          : suggestions.find(({ id }) => id === item.id)?.id;
        if (!route) return;
        onOpenChange(false);
        if (modifier) window.open(new URL(routeHref(route), location.href).href, '_blank');
        // A route the address names already shows its place again and focuses it, as a fresh
        // navigation does; the palette, which then no longer holds focus, leaves it there.
        else navigate(route);
      }}
    />
  );
}
