import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  CommandPalette,
  type CommandPaletteItem,
  type CommandPaletteProps,
} from '@envsemble/envui';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Extension } from '@envsemble/envui/icons/Extension';
import { DataObject } from '@envsemble/envui/icons/DataObject';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Category } from '@envsemble/envui/icons/Category';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Article } from '@envsemble/envui/icons/Article';
import { Error as ErrorIcon } from '@envsemble/envui/icons/Error';
import { counterpartOf, findPage, routeOfDocument, type RoutePage } from '../navigation/SiteRoutes';
import { otherPart } from '../navigation/OtherPart';
import { navigate, routeHref } from '../navigation/Address';
import { canRetryLoad, reloadModule, reloadPage } from '../template/LoadBoundary';
import type { SearchResult } from './SearchIndex';
import { commandKey } from './SearchShortcut';
import { Loading } from '../template/Loading';

/** The search index's module, by its path in the site app, as module-files.json names it. */
const indexModule = 'src/search/SearchIndex.ts';
type IndexModule = typeof import('./SearchIndex');

let loadIndexModule: () => Promise<IndexModule> = () => import('./SearchIndex');
let indexLoad: Promise<IndexModule> | undefined;

/**
 * Loads the index once, on its own file in the hosted site, when search first opens. After a
 * failure, the next load asks for it again, under a new address in development.
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
  component: <Widgets />,
  export: <Extension />,
  foundation: <Category />,
  pattern: <Pattern />,
  guide: <Article />,
  page: <Article />,
  prop: <DataObject />,
  token: <Palette />,
};
/** The name of each part of the site, which a result's description starts with. */
const areas: Record<SearchResult['area'], string> = { catalogue: 'Catalogue', docs: 'Docs' };

/** What the empty query finds: the start of either part, and the setup guide. */
const suggestedRoutes = [
  { route: 'docs/setup', icon: <Article /> },
  { route: 'components', icon: <Widgets /> },
  { route: 'patterns', icon: <Pattern /> },
  { route: 'docs/tokens', icon: <Palette /> },
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

/** Results considered, and shown in each group. */
const resultLimit = 60;
const groupLimit = 8;

/**
 * Results grouped by what they find, groups in the order of their best result. Within a group,
 * results keep their order, best first.
 */
function groupResults(results: readonly SearchResult[]) {
  const grouped = new Map<string, SearchResult[]>();
  for (const result of results) {
    const group = groups[result.kind];
    const members = grouped.get(group) ?? [];
    if (members.length < groupLimit) members.push(result);
    grouped.set(group, members);
  }
  return [...grouped.values()].flat();
}

type IndexState =
  | { status: 'loading' }
  | { status: 'ready'; search: IndexModule['searchDocumentation'] }
  | { status: 'failed' };

/**
 * Searches the catalogue and the Docs in envUI's CommandPalette: components by their names and aliases,
 * their props, the tokens and the foundations, patterns and guides, each result saying which area
 * it is in. A result opens its page, and the prop or token on it; with Ctrl or ⌘ held, in a new
 * tab. Before people type, it suggests a few pages, the current page's counterpart first.
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
  const results = useMemo(
    () =>
      index.status === 'ready' && query.trim()
        ? groupResults(index.search(query, resultLimit))
        : [],
    [index, query],
  );
  const items = useMemo<CommandPaletteItem[]>(
    () =>
      results.map((result) => ({
        id: result.id,
        label: result.title,
        // Which part the result is in, the catalogue or the Docs, then what it is.
        description: `${areas[result.area]} · ${result.detail}`,
        icon: icons[result.kind],
        group: groups[result.kind],
      })),
    [results],
  );
  const suggestions = useMemo(() => suggestionsFor(page), [page]);
  // Before people type, the suggestions show. A query shows, while the index loads, the loading
  // state; after it fails, why, with the way on; and when it finds nothing, what search finds.
  let empty: Pick<CommandPaletteProps, 'emptyIcon' | 'emptyLabel' | 'emptyDescription'>;
  if (index.status === 'loading')
    empty = { emptyIcon: null, emptyLabel: <Loading what="search" />, emptyDescription: null };
  else if (index.status === 'failed')
    empty = {
      emptyIcon: <ErrorIcon />,
      emptyLabel: 'Search could not load',
      emptyDescription: canRetryLoad ? (
        <Button
          variant="secondary"
          onClick={() => {
            setIndex({ status: 'loading' });
            setAttempt((count) => count + 1);
          }}
        >
          Try again
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => void reloadPage([indexModule])}>
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
      placeholder="Search components, props and tokens"
      inputValue={query}
      onInputValueChange={setQuery}
      items={items}
      defaultItems={suggestions}
      {...empty}
      hints={[
        { keys: ['Enter'], label: 'Open' },
        { keys: [commandKey, 'Enter'], label: 'Open in a new tab' },
        { keys: ['Esc'], label: 'Close' },
      ]}
      onAction={(item, { modifier }) => {
        const result = results.find(({ id }) => id === item.id);
        // A suggestion's id is its route.
        const route = result
          ? routeOfDocument(result.page, { view: result.view, section: result.section })
          : suggestions.find(({ id }) => id === item.id)?.id;
        if (!route) return;
        if (modifier) window.open(new URL(routeHref(route), location.href).href, '_blank');
        // A route the address names already shows its place again and focuses it, as a fresh
        // navigation does; the palette, which then no longer holds focus, leaves it there.
        else navigate(route);
      }}
    />
  );
}
