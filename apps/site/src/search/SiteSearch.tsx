import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  CommandPalette,
  type CommandPaletteItem,
  type CommandPaletteProps,
  useModifierKey,
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
import { routeOfDocument, type RoutePage } from '../routes/SiteRoutes';
import { otherPart } from '../routes/OtherPart';
import { docsRoute, navigate, routeHref } from '../routes/Address';
import { canRetryLoad, reloadModule, reloadPage } from '../loading/LoadBoundary';
import {
  groupResults,
  inReadersPart,
  moreId,
  resultLimit,
  resultRows,
  suggestionsFor,
  type ResultRow,
  type SuggestedRoute,
} from './SearchResults';

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

const icons: Record<ResultRow['kind'], ReactNode> = {
  component: <IconWidgets />,
  export: <IconExtension />,
  foundation: <IconCategory />,
  pattern: <IconPattern />,
  guide: <IconArticle />,
  page: <IconArticle />,
  prop: <IconDataObject />,
  token: <IconPalette />,
  more: <IconExpandMore />,
};
const suggestionIcons: Record<SuggestedRoute, ReactNode> = {
  [docsRoute]: <IconArticle />,
  components: <IconWidgets />,
  patterns: <IconPattern />,
  'docs/tokens': <IconPalette />,
};

const noGroups: ReadonlySet<string> = new Set();

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
  const modifier = useModifierKey();
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
  const items = useMemo<CommandPaletteItem[]>(
    () => resultRows(grouped).map(({ kind, ...row }) => ({ ...row, icon: icons[kind] })),
    [grouped],
  );
  const suggestions = useMemo<CommandPaletteItem[]>(() => {
    const OtherPart = page && otherPart(page.area).Icon;
    return suggestionsFor(page).map(({ suggested, ...suggestion }) => ({
      ...suggestion,
      icon: suggested ? suggestionIcons[suggested] : OtherPart && <OtherPart />,
    }));
  }, [page]);
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
        { keys: [modifier.label, 'Enter'], label: 'Open in a new tab' },
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
