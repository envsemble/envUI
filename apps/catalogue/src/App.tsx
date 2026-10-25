import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Column,
  EnvUIProvider,
  IconButton,
  Link,
  LinkProvider,
  Scaffold,
  Sheet,
  Text,
  Tooltip,
} from '@envsemble/envui';
import { Menu as MenuIcon } from '@envsemble/envui/icons/Menu';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';
import { findPage, type Area, type SitePage } from './navigation/DocumentationRoutes';
import { PageBoundary } from './layout/PageBoundary';
import { PageHeader } from './layout/PageHeader';
import { PageFooter } from './layout/PageFooter';
import { Overview } from './pages/Overview';
import { DevModePage } from './pages/DevMode';
import {
  ComponentPage,
  ComponentsPage,
  PatternsPage,
  FoundationPage,
  PatternPage,
} from './pages/SitePages';
import {
  ApiPage,
  ChangelogDocsPage,
  CodemodsPage,
  DocsHome,
  FoundationGuidePage,
  GuidePage,
  TokensPage,
} from './pages/DocsPages';
import { DocsNavigation, PageActions, SiteNavigation } from './navigation/DocumentationNavigation';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink } from './navigation/RouterLink';
import { docsRoute, homeRoute, inDocs, routeHref, revealSection } from './navigation/Address';
import { isSearchShortcut } from './search/SearchShortcut';
import { SearchButton } from './search/SearchButton';
import { useDocumentationRoute } from './navigation/useDocumentationRoute';
import { DisplaySettingsProvider } from './theme/DisplaySettings';
import { DocumentationSearch } from './search/DocumentationSearch';

/** What each kind of page renders. */
const pageContent: Record<SitePage['kind'], (props: { page: SitePage }) => ReactNode> = {
  home: Overview,
  components: ComponentsPage,
  patterns: PatternsPage,
  component: ComponentPage,
  pattern: PatternPage,
  foundation: FoundationPage,
  'dev-mode': DevModePage,
  'docs-home': DocsHome,
  guide: GuidePage,
  codemods: CodemodsPage,
  'docs-changelog': ChangelogDocsPage,
  tokens: TokensPage,
  'foundation-guide': FoundationGuidePage,
  api: ApiPage,
};

/** The title of a page's tab: the Site's are envUI's, the Docs' envUI Docs'. */
function documentTitle(page: SitePage | undefined, area: Area) {
  const site = area === 'docs' ? 'envUI Docs' : 'envUI';
  if (!page) return `Page not found · ${site}`;
  if (page.kind === 'home' || page.kind === 'docs-home') return site;
  return `${page.title} · ${site}`;
}

/**
 * The site: the Site, at the root, which introduces envUI, with a rail of its destinations and a
 * drawer of the chosen one's pages, and the Docs, under /docs, the developer reference with a
 * navigation of their own. The navigation holds the wordmark and search at its top, and the page
 * has the way to the other area and the Display menu at its top end.
 */
function Site() {
  const route = useDocumentationRoute();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  // A destination chosen in the navigation's sheet sends focus to the page, not back to the button.
  const choseDestination = useRef(false);
  const mainElement = useRef<HTMLElement>(null);
  // The first page loaded leaves focus at the start of the document, as any page does; a route
  // change after it moves focus to the page.
  const firstLoad = useRef(true);
  const routePath = route.split('?')[0];
  const page = findPage(routePath);
  const area: Area = page?.area ?? (inDocs(routePath) ? 'docs' : 'site');
  const title = documentTitle(page, area);
  useEffect(() => {
    // ⌘K, or Ctrl+K, opens search from anywhere, text fields included, and closes it again; an
    // editor that handles the keys itself, such as for a link, keeps them.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isSearchShortcut(event)) return;
      event.preventDefault();
      setSearchOpen((open) => !open);
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, []);
  useEffect(() => {
    document.title = title;
    if (firstLoad.current) firstLoad.current = false;
    else mainElement.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(route.split('?')[1]).get('section');
    if (section) return revealSection(section);
    mainElement.current?.scrollTo({ top: 0 });
  }, [route, title]);
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
  const Content = page && pageContent[page.kind];
  const content = Content ? (
    // The page's component is looked up among module-level components, not created here.
    // eslint-disable-next-line react-hooks/static-components
    <Content key={page.path} page={page} />
  ) : (
    <>
      <PageHeader
        title="Page not found"
        breadcrumb={area === 'docs' ? 'Docs' : 'envUI'}
        symbol={<SearchOff />}
      />
      <Column gap={7} className="docs-article">
        <Text>
          <Link href={routeHref(area === 'docs' ? docsRoute : homeRoute)}>
            {area === 'docs' ? 'Return to the Docs' : 'Return to the home page'}
          </Link>
        </Text>
      </Column>
    </>
  );
  const navigation = (inSheet: boolean) => {
    const props = {
      page,
      routePath,
      inSheet,
      // A page chosen in the sheet closes it and sends focus to the page.
      onChoose: inSheet
        ? () => {
            choseDestination.current = true;
            setNavigationOpen(false);
          }
        : undefined,
      // Search from the sheet closes it first.
      onSearch: inSheet
        ? () => {
            setNavigationOpen(false);
            openSearch();
          }
        : openSearch,
    };
    return area === 'docs' ? <DocsNavigation {...props} /> : <SiteNavigation {...props} />;
  };
  return (
    <Scaffold
      className="docs-frame"
      data-area={area}
      // The body scrolls rather than the document: the frame scrolls it to a page's top or a
      // section as routes change, and the live examples in it keep their place.
      scroll="body"
      bodyId="docs-main"
      bodyRef={mainElement}
      // The navigation is at the start of a wide window, and in a sheet that the page's menu button
      // opens in a narrower one. There is no top bar: the navigation holds the wordmark and search.
      forms={{ compact: 'none', medium: 'none' }}
      navigation={{ drawer: navigation(false) }}
    >
      {/* Below an expanded window, where the navigation is in a sheet, a small pill of the menu
          and search floats at the page's top start. */}
      <div className="docs-compact-controls">
        <div className="docs-compact-controls-bar">
          <Tooltip content="Open navigation">
            <IconButton
              icon={<MenuIcon />}
              aria-label="Open navigation"
              variant="ghost"
              onClick={() => setNavigationOpen(true)}
            />
          </Tooltip>
          <SearchButton iconOnly onClick={openSearch} />
        </div>
      </div>
      <div className="docs-main">
        <PageActions area={area} />
        <PageBoundary title={page?.title ?? 'Page not found'} route={route}>
          {content}
        </PageBoundary>
        {page && <PageNavigation page={page} />}
        <PageFooter />
      </div>
      <Sheet
        className="docs-navigation-sheet"
        side="start"
        aria-label={area === 'docs' ? 'Docs' : 'Site'}
        width={area === 'docs' ? 'min(18rem, 100%)' : 'min(22rem, 100%)'}
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
 * The site, in the page's language and the reader's stored theme, contrast and scale. Its links
 * open its pages without loading it again.
 */
export default function App() {
  return (
    <EnvUIProvider locale={pageLocale}>
      <DisplaySettingsProvider className="docs-app">
        <LinkProvider component={RouterLink}>
          <Site />
        </LinkProvider>
      </DisplaySettingsProvider>
    </EnvUIProvider>
  );
}
