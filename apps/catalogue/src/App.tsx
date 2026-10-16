import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActionGroup,
  NavList,
  IconButton,
  Button,
  Stack,
  Dialog,
  Link,
  LinkProvider,
  EnvUILogo,
  Theme,
} from '@envsemble/envui';
import { Menu } from '@envsemble/envui/icons/Menu';
import { DarkMode } from '@envsemble/envui/icons/DarkMode';
import { LightMode } from '@envsemble/envui/icons/LightMode';
import { Search } from '@envsemble/envui/icons/Search';
import {
  findReferencePage,
  findStandalonePage,
  overviewViews,
  viewFor,
} from './navigation/DocumentationRoutes';
import { ReferenceContent } from './pages/ReferenceContent';
import { StandalonePageContent } from './pages/StandalonePages';
import { PageBoundary } from './layout/PageBoundary';
import { PageHeader } from './layout/PageHeader';
import { Overview } from './pages/Overview';
import { Sidebar } from './navigation/Sidebar';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink } from './navigation/RouterLink';
import { homeRoute, routeHref } from './navigation/Address';
import { reachedFromTabs, useDocumentationRoute } from './navigation/useDocumentationRoute';
import { DocumentationSearch } from './search/DocumentationSearch';

/** Whether a key press asks for search: Ctrl+K, or ⌘K on Apple keyboards. */
const searchShortcut = (event: KeyboardEvent) =>
  (event.ctrlKey || event.metaKey) &&
  !event.altKey &&
  !event.shiftKey &&
  event.key.toLowerCase() === 'k';

/**
 * Scrolls to the element a route names, such as a prop's row, once it is there: a part of the page
 * that loads on its own, such as the token reference, renders it later. Returns the cleanup.
 */
function revealSection(id: string) {
  const reveal = () => {
    const element = document.getElementById(id);
    element?.scrollIntoView();
    return element !== null;
  };
  if (reveal()) return;
  const observer = new MutationObserver(() => {
    if (reveal()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // A section that never comes, such as one an old address names, stops being looked for.
  const timeout = setTimeout(() => observer.disconnect(), 15_000);
  return () => {
    observer.disconnect();
    clearTimeout(timeout);
  };
}

/**
 * The catalogue's scale, comfortable unless the address asks for the compact one with
 * ?scale=compact before its hash, to review every page at the compact scale.
 */
const scale =
  typeof location !== 'undefined' && new URLSearchParams(location.search).get('scale') === 'compact'
    ? 'compact'
    : 'comfortable';

function Catalogue() {
  const route = useDocumentationRoute();
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const oppositeAppearance = appearance === 'light' ? 'dark' : 'light';
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [focusContentOnClose, setFocusContentOnClose] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mainElement = useRef<HTMLElement>(null);
  const routePath = route.split('?')[0];
  const routeSegments = routePath.split('/');
  const page = findReferencePage(routePath);
  const standalone = page ? undefined : findStandalonePage(routePath);
  const reference = page?.reference;
  const root = routeSegments[0];
  const view = page ? viewFor(page.reference, routeSegments[2]) : 'preview';
  const isOverview = root === 'overview';
  const overviewView =
    overviewViews.find((view) => view.id === routeSegments[1])?.id ?? 'components';
  const title = reference?.title ?? standalone?.title ?? (isOverview ? 'envUI' : 'Page not found');
  const search = route.split('?')[1];
  const contentPath = page?.path ?? standalone?.path ?? root;
  const contentRoute = `${contentPath}${search ? `?${search}` : ''}`;
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 48rem)');
    const closeOnDesktop = () => {
      if (desktop.matches) {
        setFocusContentOnClose(true);
        setNavigationOpen(false);
      }
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    // An editor that handles the keys itself, such as for a link, keeps them.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !searchShortcut(event)) return;
      event.preventDefault();
      setSearchOpen((open) => !open);
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, []);
  useEffect(() => {
    document.title = title === 'envUI' ? 'envUI' : `${title} · envUI`;
    // Moving between a page's views keeps focus on its tabs, where the reader is.
    if (reachedFromTabs()) return;
    mainElement.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(contentRoute.split('?')[1]).get('section');
    if (section) return revealSection(section);
    window.scrollTo({ top: 0 });
  }, [contentRoute, title]);
  const openSearch = () => {
    setNavigationOpen(false);
    setSearchOpen(true);
  };
  let content: ReactNode;
  if (page) content = <ReferenceContent key={page.path} page={page} view={view} search={search} />;
  else if (standalone) content = <StandalonePageContent key={standalone.path} page={standalone} />;
  else if (isOverview) content = <Overview view={overviewView} />;
  else
    content = (
      <Stack gap={7} className="docs-article">
        <NavList.Item href={routeHref(homeRoute)}>Return to overview</NavList.Item>
      </Stack>
    );
  return (
    <Theme theme={appearance} scale={scale} className="docs-app">
      <Button
        variant="outlined"
        className="docs-skip"
        href="#docs-main"
        onClick={(e) => {
          e.preventDefault();
          mainElement.current?.focus();
        }}
      >
        Skip to content
      </Button>
      <IconButton
        className="docs-theme-toggle"
        icon={appearance === 'light' ? <DarkMode /> : <LightMode />}
        aria-label={`Switch to ${oppositeAppearance} theme`}
        title={`Switch to ${oppositeAppearance} theme`}
        onClick={() => setAppearance(oppositeAppearance)}
      />
      <header className="docs-mobile-header">
        <Link
          href={routeHref(homeRoute)}
          underline={false}
          className="docs-mobile-brand"
          aria-label="envUI overview"
        >
          <EnvUILogo />
        </Link>
        <ActionGroup align="end" className="docs-mobile-actions">
          <IconButton
            variant="secondary"
            icon={<Search />}
            aria-label="Search"
            aria-keyshortcuts="Control+K Meta+K"
            title="Search"
            onClick={openSearch}
          />
          <Dialog
            open={navigationOpen}
            onOpenChange={(open) => {
              if (open) setFocusContentOnClose(false);
              setNavigationOpen(open);
            }}
            title="Documentation"
            placement="right"
            finalFocus={focusContentOnClose ? mainElement : undefined}
            trigger={
              <Button variant="secondary" startIcon={<Menu />}>
                Open navigation
              </Button>
            }
          >
            <Sidebar
              routePath={routePath}
              page={page}
              panel
              onSearch={openSearch}
              onNavigate={() => {
                setFocusContentOnClose(true);
                setNavigationOpen(false);
              }}
            />
          </Dialog>
        </ActionGroup>
      </header>
      <div className="docs-shell">
        <Sidebar routePath={routePath} page={page} onSearch={openSearch} />
        <main id="docs-main" ref={mainElement} tabIndex={-1} className="docs-main">
          <PageBoundary title={title} route={route}>
            {!isOverview && !page && !standalone && <PageHeader title={title} breadcrumb="envUI" />}
            {content}
          </PageBoundary>
          <PageNavigation
            path={contentPath}
            // The guides of Get started lead on to the guidance of the other pages, as its view does.
            view={
              (isOverview && overviewView === 'get-started') ||
              standalone?.section === 'Get started'
                ? 'usage'
                : isOverview
                  ? 'preview'
                  : view
            }
          />
        </main>
      </div>
      <DocumentationSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </Theme>
  );
}

/**
 * The catalogue. Its links open its pages without loading it again, where routes live in the
 * address's path.
 */
export default function App() {
  return (
    <LinkProvider component={RouterLink}>
      <Catalogue />
    </LinkProvider>
  );
}
