import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Column,
  EnvUIProvider,
  IconButton,
  Link,
  LinkProvider,
  Scaffold,
  Sheet,
  TableOfContents,
  Text,
  Tooltip,
} from '@envsemble/envui';
import { IconMenu } from '@envsemble/envui/icons/Menu';
import { findPage, type Area, type RoutePage } from './navigation/SiteRoutes';
import { PageBoundary } from './layout/PageBoundary';
import { PageHeader } from './layout/PageHeader';
import { PageFooter } from './layout/PageFooter';
import { Overview } from './pages/Overview';
import {
  ComponentPage,
  ComponentsPage,
  PatternsPage,
  FoundationPage,
  FoundationsPage,
  PatternPage,
} from './pages/CataloguePages';
import {
  DocsReferencePage,
  ChangelogDocsPage,
  DocsHome,
  FoundationGuidePage,
  GuidePage,
  TokensPage,
} from './pages/DocsPages';
import {
  Brand,
  DocsNavigation,
  PageActions,
  CatalogueNavigation,
  drawerless,
} from './navigation/SiteNavigation';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink } from './navigation/RouterLink';
import {
  announceShownAddress,
  docsRoute,
  homeRoute,
  inDocs,
  revealSection,
  routeHref,
  takeShownAddress,
} from './navigation/Address';
import { isSearchShortcut } from './search/SearchShortcut';
import { SearchButton } from './search/SearchButton';
import { useSiteRoute } from './navigation/useSiteRoute';
import { DisplaySettingsProvider } from './theme/DisplaySettings';
import { SiteSearch } from './search/SiteSearch';
import { LoadingStatus } from './template/Loading';
import { restoreScroll, scrolled } from './navigation/ScrollRestoration';
import { PageSkeleton } from './template/PageSkeleton';

/** What each kind of page renders. */
const pageContent: Record<RoutePage['kind'], (props: { page: RoutePage }) => ReactNode> = {
  home: Overview,
  foundations: FoundationsPage,
  components: ComponentsPage,
  patterns: PatternsPage,
  component: ComponentPage,
  pattern: PatternPage,
  foundation: FoundationPage,
  'docs-home': DocsHome,
  guide: GuidePage,
  'docs-changelog': ChangelogDocsPage,
  tokens: TokensPage,
  'foundation-guide': FoundationGuidePage,
  reference: DocsReferencePage,
};

/** The title of a page's tab: the catalogue's are envUI's, the Docs' envUI Docs'. */
function documentTitle(page: RoutePage | undefined, area: Area) {
  const site = area === 'docs' ? 'envUI Docs' : 'envUI';
  if (!page) return `Page not found · ${site}`;
  if (page.kind === 'home' || page.kind === 'docs-home') return site;
  return `${page.title} · ${site}`;
}

/**
 * Whether a heading belongs in the page's contents: one of the page's own, not an example's, a
 * figure's or a tile's, which show components rather than the page's sections. A tile's picture is
 * inert, but a tile that shows an overlay open, such as a sheet, marks the page around it as behind
 * a popup, where the contents keep what is hidden, so its tiles' headings are left out by name. Each
 * export's props are listed under Props; the exports' part names and color properties, and the two
 * lists under Accessibility, are their sections' alone, so the contents don't repeat the exports
 * three times.
 */
const contentsHeading = (heading: HTMLElement) =>
  !heading.closest(
    '.site-live-example, .site-verdict-stage, .site-anatomy-stage, .catalogue-open-example, .catalogue-specimen, .catalogue-related-stage, .env-dialog',
  ) &&
  !(
    heading.localName === 'h3' &&
    heading.closest(
      '.docs-provides, [aria-labelledby="part-names"], [aria-labelledby="color-properties"]',
    )
  );

/**
 * The pages without contents beside them: the two homes, the catalogue's overview, a hero and a fan
 * of cards rather than sections, and the Docs' home, an index of them; and the catalogue's index
 * pages, galleries of tiles whose groups the drawer lists already, which take the width instead.
 */
const pagesWithoutContents = new Set<RoutePage['kind']>([
  'home',
  'docs-home',
  'foundations',
  'components',
  'patterns',
]);

/**
 * The page's contents beside it, in the catalogue and the Docs alike, on a window wide enough for
 * a column of them: its h2 and h3 headings, such as a component's rules under Rules or each
 * export's props under Props, with the section the reader is in marked. A link writes the section's fragment to the address, the same as a search result or a
 * copied address names it, and the route follows without scrolling again.
 */
function PageContents({ page }: { page: RoutePage }) {
  return (
    <div className="site-contents">
      <TableOfContents
        key={page.path}
        className="site-contents-list"
        container=".site-page-column"
        filter={contentsHeading}
        onClick={(event) => {
          if (event.defaultPrevented && (event.target as Element).closest('a[href^="#"]'))
            announceShownAddress();
        }}
      />
    </div>
  );
}

/**
 * The site: the catalogue, at the root, which shows envUI to people, with a rail of its
 * destinations and a drawer of the chosen one's pages, and the Docs, under /docs, the developer
 * reference with a navigation of their own; a page of either but their homes has its contents
 * beside it. The navigation holds the wordmark and search at its top, and the page has the way to
 * the same subject in the other part and the Display menu at its top end.
 */
function Shell() {
  const route = useSiteRoute();
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
  const area: Area = page?.area ?? (inDocs(routePath) ? 'docs' : 'catalogue');
  const title = documentTitle(page, area);
  const contents = page && !pagesWithoutContents.has(page.kind);
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
    // An address that a link of the page's contents wrote has shown its section already.
    if (takeShownAddress()) return;
    if (firstLoad.current) firstLoad.current = false;
    else mainElement.current?.focus({ preventScroll: true });
    // Back, Forward and a reload return to where the reader was on the page.
    const restoring = mainElement.current && restoreScroll(mainElement.current);
    if (restoring) return restoring;
    const section = new URLSearchParams(route.split('?')[1]).get('section');
    if (section) return revealSection(section);
    mainElement.current?.scrollTo({ top: 0 });
  }, [route, title]);
  // Each step of the history keeps where the reader is on its page (ScrollRestoration.ts).
  useEffect(() => {
    const main = mainElement.current;
    main?.addEventListener('scroll', scrolled, { passive: true });
    return () => main?.removeEventListener('scroll', scrolled);
  }, []);
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
      <PageHeader title="Page not found" breadcrumb={area === 'docs' ? 'Docs' : 'envUI'} />
      <Column gap={7} className="site-article">
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
      onClose: inSheet ? () => setNavigationOpen(false) : undefined,
      // Search from the sheet closes it first.
      onSearch: inSheet
        ? () => {
            setNavigationOpen(false);
            openSearch();
          }
        : openSearch,
    };
    return area === 'docs' ? <DocsNavigation {...props} /> : <CatalogueNavigation {...props} />;
  };
  return (
    <Scaffold
      className="site-frame"
      data-area={area}
      // The body scrolls rather than the document: the frame scrolls it to a page's top or a
      // section as routes change, and the live examples in it keep their place.
      scroll="body"
      bodyId="site-main"
      bodyRef={mainElement}
      // The navigation is at the start of a wide window, and in a sheet that the page's menu button
      // opens in a narrower one. There is no top bar: the navigation holds the wordmark and search.
      navigationForms={{ compact: 'none', medium: 'none' }}
      navigation={{ drawer: navigation(false) }}
    >
      {/* Below an expanded window, where the navigation is in a sheet, a small pill of the menu,
          the wordmark and search floats at the page's top start. */}
      <div className="site-compact-controls">
        <div className="site-compact-controls-bar">
          <Tooltip content="Open navigation">
            <IconButton
              icon={<IconMenu />}
              aria-label="Open navigation"
              variant="ghost"
              onClick={() => setNavigationOpen(true)}
            />
          </Tooltip>
          <Brand area={area} />
          <SearchButton iconOnly onClick={openSearch} />
        </div>
      </div>
      <div className="site-main">
        {/* A wide window's page without the drawer, where search would be, has search at its top
            start, level with the page's actions. */}
        {area === 'catalogue' && drawerless(page) && (
          <div className="site-page-search">
            <SearchButton onClick={openSearch} className="site-page-search-button" />
          </div>
        )}
        <PageActions page={page} area={area} />
        <div className="site-page-layout">
          <div className="site-page-grid" data-contents={contents || undefined}>
            <div className="site-page-column">
              <PageBoundary title={page?.title ?? 'Page not found'} route={route}>
                {/* A page's content loads with it (useDocument), which the first page and a link's
                    page wait for before they render; a page gone back to, or opened from search,
                    before it has loaded shows as a skeleton of its shape meanwhile. A boundary of
                    its own for each page, so the page before doesn't stay, hidden. */}
                <Suspense
                  key={page?.path ?? routePath}
                  fallback={page && <PageSkeleton page={page} />}
                >
                  {content}
                </Suspense>
              </PageBoundary>
              {page && <PageNavigation page={page} />}
            </div>
            {contents && <PageContents page={page} />}
          </div>
        </div>
        <PageFooter />
        {/* What the page is still loading, said once, while its parts show as skeletons. */}
        <LoadingStatus />
      </div>
      <Sheet
        className="site-navigation-sheet"
        side="start"
        aria-label={area === 'docs' ? 'Docs' : 'Catalogue'}
        width={area === 'docs' ? 'min(18rem, 100%)' : 'min(22rem, 100%)'}
        // Its close button is on the navigation's first row, beside the wordmark.
        closeButton={false}
        open={navigationOpen}
        onOpenChange={(open) => {
          if (open) choseDestination.current = false;
          setNavigationOpen(open);
        }}
        finalFocus={() => (choseDestination.current ? (mainElement.current ?? true) : true)}
      >
        {navigation(true)}
      </Sheet>
      <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} page={page} />
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
      <DisplaySettingsProvider className="site-app">
        <LinkProvider component={RouterLink}>
          <Shell />
        </LinkProvider>
      </DisplaySettingsProvider>
    </EnvUIProvider>
  );
}
