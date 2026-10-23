import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button,
  Column,
  EnvUIProvider,
  IconButton,
  Link,
  LinkProvider,
  Scaffold,
  SearchTrigger,
  Sheet,
  Text,
  TopBar,
} from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Menu as MenuIcon } from '@envsemble/envui/icons/Menu';
import { MenuBook } from '@envsemble/envui/icons/MenuBook';
import { EnvUILogo } from './brand/EnvUILogo';
import { findPage, type Area, type SitePage } from './navigation/DocumentationRoutes';
import { PageBoundary } from './layout/PageBoundary';
import { PageHeader } from './layout/PageHeader';
import { PageFooter } from './layout/PageFooter';
import { Overview } from './pages/Overview';
import {
  BenchmarkPage,
  ChangelogPage,
  ComponentPage,
  ComponentsPage,
  FoundationPage,
  GetStartedPage,
  PatternPage,
} from './pages/SitePages';
import {
  ApiPage,
  CodemodsPage,
  DocsHome,
  FoundationGuidePage,
  GuidePage,
  SkillsPage,
  TokensPage,
} from './pages/DocsPages';
import { DocsNavigation, SiteNavigation } from './navigation/DocumentationNavigation';
import { PageNavigation } from './navigation/PageNavigation';
import { RouterLink } from './navigation/RouterLink';
import { docsRoute, homeRoute, inDocs, routeHref, revealSection } from './navigation/Address';
import { isSearchShortcut } from './search/SearchShortcut';
import { reachedFromTabs, useDocumentationRoute } from './navigation/useDocumentationRoute';
import { DisplayMenu, DisplaySettingsProvider } from './theme/DisplaySettings';
import { DocumentationSearch } from './search/DocumentationSearch';

/** What each kind of page renders. */
const pageContent: Record<SitePage['kind'], (props: { page: SitePage }) => ReactNode> = {
  home: Overview,
  'get-started': GetStartedPage,
  components: ComponentsPage,
  component: ComponentPage,
  pattern: PatternPage,
  foundation: FoundationPage,
  benchmark: BenchmarkPage,
  changelog: ChangelogPage,
  'docs-home': DocsHome,
  guide: GuidePage,
  codemods: CodemodsPage,
  skills: SkillsPage,
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
 * navigation of their own. Each has a top bar with search, the Display menu and a link to the
 * other.
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
    document.title = title;
    // Moving between a page's views, such as the agent skills, keeps focus on its tabs.
    if (reachedFromTabs()) return;
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
      <PageHeader title="Page not found" breadcrumb={area === 'docs' ? 'Docs' : 'envUI'} />
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
      // The top bar runs across, above the navigation, as a website's does.
      topBarSpan="full"
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
                className="docs-menu-button"
                onClick={() => setNavigationOpen(true)}
              />
              <Link
                href={routeHref(area === 'docs' ? docsRoute : homeRoute)}
                underline={false}
                className="docs-header-brand"
                aria-label={area === 'docs' ? 'envUI Docs home' : 'envUI home'}
              >
                <EnvUILogo />
                {area === 'docs' && (
                  <span className="docs-header-area" aria-hidden="true">
                    Docs
                  </span>
                )}
              </Link>
            </>
          }
          actions={
            <>
              {/* The full trigger from an expanded window, its icon below; the wrappers take no box. */}
              <span className="docs-wide-only">
                <SearchTrigger onClick={openSearch} />
              </span>
              <span className="docs-narrow-only">
                <SearchTrigger iconOnly onClick={openSearch} />
              </span>
              {area === 'docs' ? (
                <Button variant="ghost" href={routeHref(homeRoute)} startIcon={<ArrowBack />}>
                  Site
                </Button>
              ) : (
                <Button variant="ghost" href={routeHref(docsRoute)} startIcon={<MenuBook />}>
                  Docs
                </Button>
              )}
              <span className="docs-wide-only">
                <DisplayMenu />
              </span>
              <span className="docs-narrow-only">
                <DisplayMenu iconOnly />
              </span>
            </>
          }
        />
      }
    >
      <div className="docs-main">
        <PageBoundary title={page?.title ?? 'Page not found'} route={route}>
          {content}
        </PageBoundary>
        {page && <PageNavigation page={page} />}
        <PageFooter />
      </div>
      <Sheet
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
