import { Suspense, useRef, useState } from 'react';
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
import { findPage, type Area, type RoutePage } from './routes/SiteRoutes';
import { PageBoundary } from './banner/PageBoundary';
import { retryDocument } from './pages/PageContent';
import { SiteBanner } from './banner/SiteBanner';
import { ContentsItems, PageContents } from './banner/PageContents';
import { PageFooter } from './banner/PageFooter';
import { retryPageView, usePageContents, usePageView } from './pages/PageViews';
import { preloadPage } from './pages/PreloadPage';
import { Brand } from './brand/Brand';
import { DocsNavigation, CatalogueNavigation } from './navigation/SiteNavigation';
import { drawerless } from './navigation/CatalogueDestinations';
import { PageActions } from './navigation/PageActions';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink, usePendingRoute } from './navigation/RouterLink';
import { RouteProgress } from './navigation/RouteProgress';
import { docsRoute, homeRoute, inDocs, routeHref } from './routes/Address';
import { usePagePlace } from './routes/usePagePlace';
import { documentTitle, pageDescription } from './routes/PageHead';
import { useSheetClosesWhenWide } from './navigation/useSheetClosesWhenWide';
import { useSearchShortcut } from './search/useSearchShortcut';
import { SearchButton } from './search/SearchButton';
import { useSiteRoute } from './routes/useSiteRoute';
import { DisplaySettingsProvider } from './display/DisplaySettings';
import { SiteSearch } from './search/SiteSearch';
import { PaletteCustomizationProvider } from './display/PaletteCustomization';
import { LoadingStatus } from './loading/LoadingStore';
import { PageSkeleton } from './pages/PageSkeleton';

/** A page, as its kind's view renders it, which loads with the first page of its kind. */
function PageView({ page }: { page: RoutePage }) {
  // What it needs starts loading together, as when a link to it is followed, also where it renders
  // without that, such as a page gone back to.
  void preloadPage(page);
  const View = usePageView(page);
  // The view is one of the pages' module-level components, loaded once and kept, not created here.
  // eslint-disable-next-line react-hooks/static-components
  return <View page={page} />;
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
  const items = usePageContents(contents ? page : undefined);
  return (
    <div className="site-page-layout">
      <div className="site-page-grid" data-contents={contents || undefined}>
        <div className="site-page-column">
          <ContentsItems value={contents ? items : undefined}>
            <PageBoundary
              title={page?.title ?? 'Page not found'}
              route={route}
              onRetry={() => {
                if (!page) return;
                retryPageView(page.kind);
                if (page.document) retryDocument(page.document.id);
              }}
            >
              {/* A page's content loads with it (useDocument), which the first page and a link's
                page wait for before they render; a page gone back to, or opened from search,
                before it has loaded shows as a skeleton of its shape meanwhile. A boundary of
                its own for each page, so the page before doesn't stay, hidden. */}
              <Suspense
                key={page?.path ?? routePath}
                fallback={page && <PageSkeleton page={page} />}
              >
                {page ? <PageView key={page.path} page={page} /> : <PageNotFound area={area} />}
              </Suspense>
            </PageBoundary>
          </ContentsItems>
          {page && <PageNavigation page={page} />}
        </div>
        {contents && page && <PageContents path={page.path} items={items} />}
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
  const routePath = route.split('?')[0];
  const page = findPage(routePath);
  const area: Area = page?.area ?? (inDocs(routePath) ? 'docs' : 'catalogue');
  const contents = Boolean(page && !pagesWithoutContents.has(page.kind));
  useSearchShortcut(setSearchOpen);
  usePagePlace(route, documentTitle(page, area), pageDescription(page), mainElement);
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
function App() {
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

/**
 * The site's root, which main.tsx hydrates or renders and the server pre-renders (Server.tsx):
 * the site, with the palette the Docs' color editor customizes.
 */
export function SiteRoot() {
  return (
    <PaletteCustomizationProvider>
      <App />
    </PaletteCustomizationProvider>
  );
}
