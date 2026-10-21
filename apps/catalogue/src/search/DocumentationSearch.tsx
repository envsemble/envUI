import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button, CommandPalette, Column, type CommandPaletteItem } from '@envsemble/envui';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Extension } from '@envsemble/envui/icons/Extension';
import { DataObject } from '@envsemble/envui/icons/DataObject';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Category } from '@envsemble/envui/icons/Category';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Article } from '@envsemble/envui/icons/Article';
import { ViewQuilt } from '@envsemble/envui/icons/ViewQuilt';
import { routeOfDocument } from '../navigation/DocumentationRoutes';
import { navigate, routeHref } from '../navigation/Address';
import { canRetryLoad, reloadModule, reloadPage } from '../template/LoadBoundary';
import type { SearchResult } from './SearchIndex';
import { commandKey } from './SearchShortcut';

/** The search index's module, by its path in the catalogue app, as module-files.json names it. */
const indexModule = 'src/search/SearchIndex.ts';
type IndexModule = typeof import('./SearchIndex');

let loadIndexModule: () => Promise<IndexModule> = () => import('./SearchIndex');
let indexLoad: Promise<IndexModule> | undefined;

/**
 * Loads the index once, on its own file in the hosted catalogue, when search first opens. After a
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
 * Searches the documentation in envUI's CommandPalette: components by their names and aliases,
 * their props, the tokens and the foundations, patterns and guides. A result opens its page, and
 * the prop or token on it; with Ctrl or ⌘ held, in a new tab.
 */
export function DocumentationSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
        description: result.detail,
        icon: icons[result.kind],
        group: groups[result.kind],
      })),
    [results],
  );
  let emptyLabel: ReactNode;
  if (index.status === 'loading') emptyLabel = 'Loading search…';
  else if (index.status === 'failed')
    emptyLabel = (
      <Column gap={3} align="center">
        Search could not load.
        {canRetryLoad ? (
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
        )}
      </Column>
    );
  else if (query.trim()) emptyLabel = `No results for “${query.trim()}”`;
  else emptyLabel = 'Search components and their aliases, props, tokens, foundations and guides.';
  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      aria-label="Search the documentation"
      placeholder="Search components, props and tokens"
      inputValue={query}
      onInputValueChange={setQuery}
      items={items}
      emptyLabel={emptyLabel}
      hints={[
        { keys: ['Enter'], label: 'Open' },
        { keys: [commandKey, 'Enter'], label: 'Open in a new tab' },
        { keys: ['Esc'], label: 'Close' },
      ]}
      onAction={(item, { modifier }) => {
        const result = results.find(({ id }) => id === item.id);
        const route =
          result && routeOfDocument(result.page, { view: result.view, section: result.section });
        if (!route) return;
        if (modifier) window.open(new URL(routeHref(route), location.href).href, '_blank');
        // A route the address names already shows its place again and focuses it, as a fresh
        // navigation does; the palette, which then no longer holds focus, leaves it there.
        else navigate(route);
      }}
    />
  );
}
