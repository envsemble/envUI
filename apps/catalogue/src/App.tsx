import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  EnvUIProvider,
  IconButton,
  Link,
  LinkProvider,
  Scaffold,
  SearchTrigger,
  Sheet,
  Column,
  ThemeToggle,
  TopBar,
} from '@envsemble/envui';
import { Menu as MenuIcon } from '@envsemble/envui/icons/Menu';
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
import { DocumentationNavigation } from './navigation/DocumentationNavigation';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink } from './navigation/RouterLink';
import { homeRoute, routeHref, revealSection } from './navigation/Address';
import { isSearchShortcut } from './search/SearchShortcut';
import { reachedFromTabs, useDocumentationRoute } from './navigation/useDocumentationRoute';
import { DisplayMenu, DisplaySettingsProvider } from './theme/DisplaySettings';
import { DocumentationSearch } from './search/DocumentationSearch';

function Catalogue() {
  const route = useDocumentationRoute();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  // A destination chosen in the navigation's sheet sends focus to the page, not back to the button.
  const choseDestination = useRef(false);
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
    mainElement.current?.scrollTo({ top: 0 });
  }, [contentRoute, title]);
  const openSearch = () => setSearchOpen(true);
  // The navigation's sheet is for narrower windows: one wide enough for the drawer closes it.
  useEffect(() => {
    if (!navigationOpen) return;
    const wide = window.matchMedia('(width >= 52.5rem)');
    const close = () => wide.matches && setNavigationOpen(false);
    close();
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, [navigationOpen]);
  let content: ReactNode;
  if (page) content = <ReferenceContent key={page.path} page={page} view={view} search={search} />;
  else if (standalone) content = <StandalonePageContent key={standalone.path} page={standalone} />;
  else if (isOverview) content = <Overview view={overviewView} />;
  else
    content = (
      <Column gap={7} className="docs-article">
        <Link href={routeHref(homeRoute)}>Return to overview</Link>
      </Column>
    );
  const navigation = (inSheet: boolean) => (
    <DocumentationNavigation
      routePath={routePath}
      page={page}
      inSheet={inSheet}
      onSearch={() => {
        setNavigationOpen(false);
        openSearch();
      }}
      // A destination chosen in the sheet closes it and sends focus to the page.
      onChoose={
        inSheet
          ? () => {
              choseDestination.current = true;
              setNavigationOpen(false);
            }
          : undefined
      }
    />
  );
  return (
    <Scaffold
      className="docs-frame"
      bodyId="docs-main"
      bodyRef={mainElement}
      // The navigation is at the start of a wide window, and in a sheet that the top bar opens in a
      // narrower one.
      forms={{ compact: 'none', medium: 'none' }}
      navigation={{ drawer: navigation(false) }}
      topBar={
        <TopBar
          className="docs-header"
          start={
            <>
              <IconButton
                icon={<MenuIcon />}
                aria-label="Open navigation"
                variant="ghost"
                onClick={() => setNavigationOpen(true)}
              />
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
          actions={
            <>
              <SearchTrigger iconOnly onClick={openSearch} />
              <DisplayMenu iconOnly />
              <ThemeToggle variant="ghost" />
            </>
          }
        />
      }
    >
      <div className="docs-main">
        {/* The display settings and the theme, at the page's top right as it scrolls; the top bar
            of a narrower window holds them instead. */}
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
      </div>
      <Sheet
        side="start"
        aria-label="Documentation"
        width="min(18rem, 100%)"
        open={navigationOpen}
        onOpenChange={(open) => {
          if (open) choseDestination.current = false;
          setNavigationOpen(open);
        }}
        finalFocus={() => (choseDestination.current ? (mainElement.current ?? true) : true)}
      >
        {navigation(true)}
      </Sheet>
      <DocumentationSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </Scaffold>
  );
}

/** The page's language, from index.html's lang, which every example's dates and numbers follow. */
const pageLocale = (typeof document === 'undefined' ? '' : document.documentElement.lang) || 'en';

/**
 * The catalogue, in the page's language and the reader's stored theme, contrast and scale. Its
 * links open its pages without loading it again, where routes live in the address's path.
 */
export default function App() {
  return (
    <EnvUIProvider locale={pageLocale}>
      <DisplaySettingsProvider className="docs-app">
        <LinkProvider component={RouterLink}>
          <Catalogue />
        </LinkProvider>
      </DisplaySettingsProvider>
    </EnvUIProvider>
  );
}
