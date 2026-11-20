import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  CommandPalette,
  type CommandPaletteGroup,
  type CommandPaletteItem,
  type CommandPaletteProps,
  useModifierKey,
} from '@envsemble/envui';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import { IconExtension } from '@envsemble/envui/icons/Extension';
import { IconDataObject } from '@envsemble/envui/icons/DataObject';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import { IconCategory } from '@envsemble/envui/icons/Category';
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

const indexModule = 'src/search/SearchIndex.ts';
type IndexModule = typeof import('./SearchIndex');

let loadIndexModule: () => Promise<IndexModule> = () => import('./SearchIndex');
let indexLoad: Promise<IndexModule> | undefined;

function loadIndex() {
  indexLoad ??= loadIndexModule().catch((error: unknown) => {
    indexLoad = undefined;
    const root = new URL(import.meta.env.BASE_URL, window.location.href).href;
    loadIndexModule = reloadModule(loadIndexModule, indexModule, root);
    throw error;
  });
  return indexLoad;
}

export function preloadSearch() {
  void loadIndex().catch(() => {});
}

const idlePreloadTimeoutMs = 4000;
const preloadDelayWithoutIdleCallbackMs = 2000;

function preloadWhenIdle() {
  if (typeof window === 'undefined') return;
  const start = () =>
    typeof requestIdleCallback === 'function'
      ? requestIdleCallback(preloadSearch, { timeout: idlePreloadTimeoutMs })
      : window.setTimeout(preloadSearch, preloadDelayWithoutIdleCallbackMs);
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
preloadWhenIdle();

const icons: Record<ResultRow['kind'], ReactNode> = {
  component: <IconWidgets />,
  export: <IconExtension />,
  foundation: <IconCategory />,
  guide: <IconArticle />,
  page: <IconArticle />,
  prop: <IconDataObject />,
  token: <IconPalette />,
  more: <IconExpandMore />,
};
const suggestionIcons: Record<SuggestedRoute, ReactNode> = {
  [docsRoute]: <IconArticle />,
  components: <IconWidgets />,
  'docs/tokens': <IconPalette />,
};

const noGroups: ReadonlySet<string> = new Set();

type IndexState =
  | { status: 'loading' }
  | { status: 'ready'; search: IndexModule['searchDocumentation'] }
  | { status: 'failed' };

export function SiteSearch({
  open,
  onOpenChange,
  page,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: RoutePage | undefined;
}) {
  const modifier = useModifierKey();
  const [query, setQuery] = useState('');
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
  const items = useMemo<CommandPaletteGroup[]>(
    () =>
      resultRows(grouped).map((group) => ({
        ...group,
        items: group.items.map(({ kind, ...row }) => ({ ...row, icon: icons[kind] })),
      })),
    [grouped],
  );
  const suggestions = useMemo<CommandPaletteItem[]>(() => {
    const OtherPart = page && otherPart(page.area).Icon;
    return suggestionsFor(page).map(({ suggested, ...suggestion }) => ({
      ...suggestion,
      icon: suggested ? suggestionIcons[suggested] : OtherPart && <OtherPart />,
    }));
  }, [page]);
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
      emptyDescription: `Nothing matches “${query.trim()}”. Search finds components by name or alias, their props, tokens, foundations and guides.`,
    };
  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      aria-label="Search envUI"
      className="site-search"
      placeholder="Search envUI"
      inputValue={query}
      onInputValueChange={setQuery}
      items={items}
      suggestedItems={[{ label: 'Suggested', items: suggestions }]}
      loading={index.status === 'loading'}
      loadingLabel="Loading search"
      {...empty}
      hints={[
        { keys: ['Enter'], label: 'Open' },
        { keys: [modifier.label, 'Enter'], label: 'Open in a new tab' },
        { keys: ['Esc'], label: 'Close' },
      ]}
      closeOnAction={false}
      onAction={(item, { modifier }) => {
        const more = grouped.find(({ name }) => item.id === moreId(name));
        if (more) {
          setExpanded({ query, groups: new Set([...expandedGroups, more.name]) });
          return;
        }
        const result = results.find(({ id }) => id === item.id);
        const suggestedRoute = suggestions.find(({ id }) => id === item.id)?.id;
        const route = result
          ? inReadersPart(
              routeOfDocument(result.page, { view: result.view, section: result.section }),
              page,
            )
          : suggestedRoute;
        if (!route) return;
        onOpenChange(false);
        if (modifier) window.open(new URL(routeHref(route), location.href).href, '_blank');
        else navigate(route);
      }}
    />
  );
}
