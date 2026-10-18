import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AppShell,
  Link,
  LinkProvider,
  NavList,
  SearchTrigger,
  SidebarTrigger,
  Stack,
  ThemeToggle,
} from '@envsemble/envui';
import { EnvUILogo } from './brand/EnvUILogo';
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
import { PageFooter } from './layout/PageFooter';
import { PageChangelog } from './template/TemplateContent';
import { Overview } from './pages/Overview';
import { DocumentationSidebar } from './navigation/Sidebar';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink } from './navigation/RouterLink';
import { homeRoute, routeHref, revealSection } from './navigation/Address';
import { isSearchShortcut } from './search/SearchShortcut';
import { reachedFromTabs, useDocumentationRoute } from './navigation/useDocumentationRoute';
import { DisplayMenu, DisplaySettingsProvider } from './theme/DisplaySettings';
import { DocumentationSearch } from './search/DocumentationSearch';

/** Where the frame remembers whether the reader keeps the navigation docked or as a rail. */
const frameStorageKey = 'envui-catalogue-frame';

function Catalogue() {
  const route = useDocumentationRoute();
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
    if (!searchOpen) return;
    // The search triggers press themselves on ⌘K. While search is open they are behind it, so the
    // shortcut closes it here; an editor that handles the keys itself, such as for a link, keeps
    // them.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isSearchShortcut(event)) return;
      event.preventDefault();
      setSearchOpen(false);
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [searchOpen]);
  useEffect(() => {
    document.title = title === 'envUI' ? 'envUI' : `${title} · envUI`;
    // Moving between a page's views keeps focus on its tabs, where the reader is.
    if (reachedFromTabs()) return;
    mainElement.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(contentRoute.split('?')[1]).get('section');
    if (section) return revealSection(section);
    window.scrollTo({ top: 0 });
  }, [contentRoute, title]);
  const openSearch = () => setSearchOpen(true);
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
    <AppShell.Root persist={frameStorageKey} className="docs-frame">
      <AppShell.SkipLinks />
      {/* A phone's top bar: the navigation's drawer, the overview, search, display and theme. */}
      <AppShell.Header
        mobileOnly
        className="docs-header"
        start={
          <>
            <SidebarTrigger />
            <Link
              href={routeHref(homeRoute)}
              underline={false}
              className="docs-header-brand"
              aria-label="envUI overview"
            >
              <EnvUILogo />
            </Link>
          </>
        }
        end={
          <>
            <SearchTrigger iconOnly onClick={openSearch} />
            <DisplayMenu iconOnly />
            <ThemeToggle variant="ghost" />
          </>
        }
      />
      <DocumentationSidebar routePath={routePath} page={page} onSearch={openSearch} />
      <AppShell.Main id="docs-main" ref={mainElement} className="docs-main">
        {/* The display settings and the theme, at the page's top right as it scrolls; a phone's
            top bar holds them instead. */}
        <div className="docs-page-controls">
          <div className="docs-page-controls-bar">
            <DisplayMenu />
            <ThemeToggle variant="ghost" />
          </div>
        </div>
        <PageBoundary title={title} route={route}>
          {!isOverview && !page && !standalone && <PageHeader title={title} breadcrumb="envUI" />}
          {content}
        </PageBoundary>
        <PageNavigation
          path={contentPath}
          // The guides of Get started lead on to the guidance of the other pages, as its view does.
          view={
            (isOverview && overviewView === 'get-started') || standalone?.section === 'Get started'
              ? 'usage'
              : isOverview
                ? 'preview'
                : view
          }
        />
        {page ? (
          <PageChangelog document={page.reference} view={view} />
        ) : (
          standalone?.document && <PageChangelog document={standalone.document} />
        )}
        <PageFooter />
      </AppShell.Main>
      <DocumentationSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </AppShell.Root>
  );
}

/**
 * The catalogue, in the reader's stored theme, contrast and scale. Its links open its pages without
 * loading it again, where routes live in the address's path.
 */
export default function App() {
  return (
    <DisplaySettingsProvider className="docs-app">
      <LinkProvider component={RouterLink}>
        <Catalogue />
      </LinkProvider>
    </DisplaySettingsProvider>
  );
}
