import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';
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
import { IconMenu } from '@envsemble/envui/icons/Menu';
import {
  findPage,
  type Area,
  type PageKind,
  type PageOfKind,
  type RoutePage,
} from './navigation/SiteRoutes';
import { PageBoundary } from './layout/PageBoundary';
import { SiteBanner } from './layout/SiteBanner';
import { HasContents, PageContents } from './layout/PageContents';
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
import { RouterLink, usePendingRoute } from './navigation/RouterLink';
import { RouteProgress } from './navigation/RouteProgress';
import {
  docsRoute,
  homeRoute,
  inDocs,
  revealSection,
  routeHref,
  takeShownAddress,
} from './navigation/Address';
import { showKeptSection } from './navigation/OtherPart';
import { isSearchShortcut } from './search/SearchShortcut';
import { SearchButton } from './search/SearchButton';
import { useSiteRoute } from './navigation/useSiteRoute';
import { DisplaySettingsProvider } from './theme/DisplaySettings';
import { SiteSearch } from './search/SiteSearch';
import { LoadingStatus } from './template/Loading';
import { restoreScroll, scrolled } from './navigation/ScrollRestoration';
import { PageSkeleton } from './template/PageSkeleton';

/** What each kind of page renders. */
const pageContent: { [Kind in PageKind]: (props: { page: PageOfKind<Kind> }) => ReactNode } = {
  home: Overview,
  foundations: FoundationsPage,
  components: ComponentsPage,
  patterns: PatternsPage,
  component: ComponentPage,
  pattern: PatternPage,
  foundation: FoundationPage,
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
  if (page.kind === 'home' || page.path === docsRoute) return site;
  return `${page.title} · ${site}`;
}

/**
 * The pages without contents beside them: the catalogue's overview, a hero and a fan of cards
 * rather than sections, and its index pages, galleries of tiles whose groups the drawer lists
 * already, which take the width instead.
 */
const pagesWithoutContents = new Set<RoutePage['kind']>([
  'home',
  'foundations',
  'components',
  'patterns',
]);

/**
 * ⌘K, or Ctrl+K, opens search from anywhere, text fields included, and closes it again; an editor
 * that handles the keys itself, such as for a link, keeps them.
 */
function useSearchShortcut(setSearchOpen: Dispatch<SetStateAction<boolean>>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isSearchShortcut(event)) return;
      event.preventDefault();
      setSearchOpen((open) => !open);
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [setSearchOpen]);
}

/**
 * Titles the tab after the page and, as the route changes, moves focus to the page and shows where
 * the reader goes on it: the section the Design and Code switch kept, where they were on a page
 * gone back to, the section the address names, else the page's top. Each step of the history keeps
 * where the reader is on its page (ScrollRestoration.ts).
 */
function usePagePlace(route: string, title: string, main: RefObject<HTMLElement | null>) {
  // The first page loaded leaves focus at the start of the document, as any page does; a route
  // change after it moves focus to the page.
  const firstLoad = useRef(true);
  useEffect(() => {
    document.title = title;
    // An address that a link of the page's contents wrote has shown its section already.
    if (takeShownAddress()) return;
    if (firstLoad.current) firstLoad.current = false;
    // After the microtasks of the commit, in which a popup of the page that left hands the focus
    // back to what it was opened from, so the page keeps it.
    else queueMicrotask(() => main.current?.focus({ preventScroll: true }));
    // The Design and Code switch keeps the reader's section where the page it shows has it too,
    // and names it in the address; elsewhere the page opens at its top.
    const switched = main.current && showKeptSection(main.current, route.split('?')[0]!);
    if (switched) return switched;
    // Back, Forward and a reload return to where the reader was on the page.
    const restoring = main.current && restoreScroll(main.current);
    if (restoring) return restoring;
    const section = new URLSearchParams(route.split('?')[1]).get('section');
    if (section) return revealSection(section);
    main.current?.scrollTo({ top: 0 });
  }, [route, title, main]);
  useEffect(() => {
    const element = main.current;
    element?.addEventListener('scroll', scrolled, { passive: true });
    return () => element?.removeEventListener('scroll', scrolled);
  }, [main]);
}

/** The navigation's sheet is for narrower windows: one wide enough for the drawer closes it. */
function useSheetClosesWhenWide(open: boolean, setOpen: (open: boolean) => void) {
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia('(width >= 52.5rem)');
    const close = () => wide.matches && setOpen(false);
    close();
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, [open, setOpen]);
}

/** The page at an address that names none, with a way back to its part's home. */
function PageNotFound({ area }: { area: Area }) {
  return (
    <>
      <SiteBanner title="Page not found" breadcrumb={area === 'docs' ? 'Docs' : 'envUI'} />
      <Column gap={7} className="site-article">
        <Text>
          <Link href={routeHref(area === 'docs' ? docsRoute : homeRoute)}>
            {area === 'docs' ? 'Return to the Docs' : 'Return to the home page'}
          </Link>
        </Text>
      </Column>
    </>
  );
}

/**
 * Below an expanded window, where the navigation is in a sheet, a small pill of the menu, the
 * wordmark and search floats at the page's top start.
 */
function CompactControls({
  area,
  onOpenNavigation,
  onSearch,
}: {
  area: Area;
  onOpenNavigation: () => void;
  onSearch: () => void;
}) {
  return (
    <div className="site-compact-controls">
      <div className="site-compact-controls-bar">
        <Tooltip content="Open navigation">
          <IconButton
            icon={<IconMenu />}
            aria-label="Open navigation"
            variant="ghost"
            onClick={onOpenNavigation}
          />
        </Tooltip>
        <Brand area={area} />
        <SearchButton iconOnly onClick={onSearch} />
      </div>
    </div>
  );
}

/**
 * The page's column: the page, in a boundary of its own and shown as a skeleton of its shape while
 * it loads, then the pager, with its contents beside it where it has them.
 */
function PageColumns({
  page,
  area,
  route,
  routePath,
  contents,
}: {
  page: RoutePage | undefined;
  area: Area;
  route: string;
  routePath: string;
  contents: boolean;
}) {
  // The page's component, looked up among module-level components, not created here. Each
  // kind's takes that kind's page (pageContent), which TypeScript can't follow
  // through the lookup.
  const Content = page && (pageContent[page.kind] as (props: { page: RoutePage }) => ReactNode);
  return (
    <div className="site-page-layout">
      <div className="site-page-grid" data-contents={contents || undefined}>
        <div className="site-page-column">
          <HasContents value={contents}>
            <PageBoundary title={page?.title ?? 'Page not found'} route={route}>
              {/* A page's content loads with it (useDocument), which the first page and a link's
                page wait for before they render; a page gone back to, or opened from search,
                before it has loaded shows as a skeleton of its shape meanwhile. A boundary of
                its own for each page, so the page before doesn't stay, hidden. */}
              <Suspense
                key={page?.path ?? routePath}
                fallback={page && <PageSkeleton page={page} />}
              >
                {Content ? <Content key={page.path} page={page} /> : <PageNotFound area={area} />}
              </Suspense>
            </PageBoundary>
          </HasContents>
          {page && <PageNavigation page={page} />}
        </div>
        {contents && page && <PageContents page={page} />}
      </div>
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
  const routePath = route.split('?')[0]!;
  const page = findPage(routePath);
  const area: Area = page?.area ?? (inDocs(routePath) ? 'docs' : 'catalogue');
  const contents = Boolean(page && !pagesWithoutContents.has(page.kind));
  useSearchShortcut(setSearchOpen);
  usePagePlace(route, documentTitle(page, area), mainElement);
  useSheetClosesWhenWide(navigationOpen, setNavigationOpen);
  const openSearch = () => setSearchOpen(true);
  // A pressed link's destination shows in the navigation at once, while its page loads.
  const pendingPath = usePendingRoute()?.split('?')[0];
  const navigation = (inSheet: boolean) => {
    const props = {
      page,
      routePath: pendingPath ?? routePath,
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
      <CompactControls
        area={area}
        onOpenNavigation={() => setNavigationOpen(true)}
        onSearch={openSearch}
      />
      <div className="site-main">
        {/* A wide window's page without the drawer, where search would be, has search at its top
            start, level with the page's actions. */}
        {area === 'catalogue' && drawerless(page) && (
          <div className="site-page-search">
            <SearchButton onClick={openSearch} className="site-page-search-button" />
          </div>
        )}
        <PageActions page={page} area={area} />
        <PageColumns
          page={page}
          area={area}
          route={route}
          routePath={routePath}
          contents={contents}
        />
        <PageFooter />
        {/* What the page is still loading, said once, while its parts show as skeletons. */}
        <LoadingStatus />
        {/* A link's page that takes a moment to load shows a bar along the window's top. */}
        <RouteProgress />
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
