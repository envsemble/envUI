import { Suspense, useRef, useState } from 'react';
import { Column, EnvUIProvider, Link, LinkProvider, Scaffold, Sheet, Text } from '@envsemble/envui';
import { findPage, type Area, type RoutePage } from './routes/SiteRoutes';
import { PageBoundary } from './frame/PageBoundary';
import { SiteBanner } from './frame/SiteBanner';
import { contentsWorthListing, PageContents } from './frame/PageContents';
import { PageFooter } from './frame/PageFooter';
import { retryDocument } from './pages/PageContent';
import { preloadPage, retryPageView, usePageContents, usePageView } from './pages/PageLoading';
import { DocsNavigation, CatalogueNavigation } from './navigation/SiteNavigation';
import { TopBar } from './navigation/TopBar';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink, usePendingRoute } from './navigation/RouterLink';
import { RouteProgress } from './navigation/RouteProgress';
import { docsRoute, homeRoute, inDocs, routeHref } from './routes/Address';
import { usePagePlace } from './routes/usePagePlace';
import { documentTitle, pageDescription } from './routes/PageHead';
import { useSheetClosesWhenWide } from './navigation/useSheetClosesWhenWide';
import { SearchShortcut } from './search/SearchShortcut';
import { useSiteRoute } from './routes/useSiteRoute';
import { DisplaySettingsProvider } from './display/DisplaySettings';
import { SiteSearch } from './search/SiteSearch';
import { PaletteCustomizationProvider } from './display/PaletteCustomization';
import { LoadingStatus } from './loading/LoadingStore';
import { PageSkeleton } from './pages/PageSkeleton';
import { useFiguresMounted } from './loading/useFiguresMounted';

function PageView({ page }: { page: RoutePage }) {
  void preloadPage(page);
  const View = usePageView(page);
  // eslint-disable-next-line react-hooks/static-components
  return <View page={page} />;
}

const pagesWithoutContents = new Set<RoutePage['kind']>(['home', 'foundations', 'components']);

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
  const listed = contents && contentsWorthListing(items);
  const [prerenderedPath, setPrerenderedPath] = useState(
    useFiguresMounted() ? undefined : routePath,
  );
  if (prerenderedPath !== undefined && prerenderedPath !== routePath) setPrerenderedPath(undefined);
  const prerenderedPageHydratesWithFrame = prerenderedPath === routePath;
  const view = page ? <PageView key={page.path} page={page} /> : <PageNotFound area={area} />;
  return (
    <div className="site-page-layout">
      <div className="site-page-grid" data-contents={contents || undefined}>
        <div className="site-page-column">
          <PageBoundary
            title={page?.title ?? 'Page not found'}
            route={route}
            onRetry={() => {
              if (!page) return;
              retryPageView(page.kind);
              if (page.document) retryDocument(page.document.id);
              setPrerenderedPath(undefined);
            }}
          >
            {prerenderedPageHydratesWithFrame ? (
              view
            ) : (
              <Suspense
                key={page?.path ?? routePath}
                fallback={page && <PageSkeleton page={page} />}
              >
                {view}
              </Suspense>
            )}
          </PageBoundary>
          {page && <PageNavigation page={page} />}
        </div>
        {listed && page && <PageContents path={page.path} items={items ?? []} />}
      </div>
    </div>
  );
}

function Shell() {
  const route = useSiteRoute();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const choseDestination = useRef(false);
  const mainElement = useRef<HTMLElement>(null);
  const routePath = route.split('?')[0];
  const page = findPage(routePath);
  const area: Area = page?.area ?? (inDocs(routePath) ? 'docs' : 'catalogue');
  const contents = Boolean(page && !pagesWithoutContents.has(page.kind));
  usePagePlace(route, documentTitle(page, area), pageDescription(page), mainElement);
  useSheetClosesWhenWide(navigationOpen, setNavigationOpen);
  const openSearch = () => setSearchOpen(true);
  const pendingPath = usePendingRoute()?.split('?')[0];
  const navigation = (inSheet: boolean) => {
    const props = {
      page,
      routePath: pendingPath ?? routePath,
      inSheet,
      onChoose: inSheet
        ? () => {
            choseDestination.current = true;
            setNavigationOpen(false);
          }
        : undefined,
      onClose: inSheet ? () => setNavigationOpen(false) : undefined,
      onSearch: () => {
        setNavigationOpen(false);
        openSearch();
      },
    };
    return area === 'docs' ? <DocsNavigation {...props} /> : <CatalogueNavigation {...props} />;
  };
  return (
    <Scaffold
      className="site-frame"
      data-area={area}
      scroll="body"
      bodyId="site-main"
      bodyRef={mainElement}
      navigationForms={{ compact: 'none', medium: 'none' }}
      navigation={{ drawer: navigation(false) }}
    >
      <div className="site-main">
        <TopBar
          page={page}
          area={area}
          onOpenNavigation={() => setNavigationOpen(true)}
          onSearch={openSearch}
        />
        <PageColumns
          page={page}
          area={area}
          route={route}
          routePath={routePath}
          contents={contents}
        />
        <PageFooter />
        <LoadingStatus />
        <RouteProgress />
      </div>
      <Sheet
        className="site-navigation-sheet"
        side="start"
        aria-label={area === 'docs' ? 'Docs' : 'Catalogue'}
        width={area === 'docs' ? 'min(18rem, 100%)' : 'min(22rem, 100%)'}
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
      <SearchShortcut setSearchOpen={setSearchOpen} />
    </Scaffold>
  );
}

const pageLocale = (typeof document === 'undefined' ? '' : document.documentElement.lang) || 'en';

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

export function SiteRoot() {
  return (
    <PaletteCustomizationProvider>
      <App />
    </PaletteCustomizationProvider>
  );
}
