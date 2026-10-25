import { useEffect, useRef, useState, type ReactNode } from 'react';
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
import { Menu as MenuIcon } from '@envsemble/envui/icons/Menu';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';
import { findPage, type Area, type RoutePage } from './navigation/DocumentationRoutes';
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
  DocsReferencePage,
  ChangelogDocsPage,
  CodemodsPage,
  DocsHome,
  FoundationGuidePage,
  GuidePage,
  TokensPage,
} from './pages/DocsPages';
import { DocsNavigation, PageActions, UsageNavigation } from './navigation/DocumentationNavigation';
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
import { useDocumentationRoute } from './navigation/useDocumentationRoute';
import { DisplaySettingsProvider } from './theme/DisplaySettings';
import { DocumentationSearch } from './search/DocumentationSearch';

/** What each kind of page renders. */
const pageContent: Record<RoutePage['kind'], (props: { page: RoutePage }) => ReactNode> = {
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
  reference: DocsReferencePage,
};

/** The title of a page's tab: the Usage guide's are envUI's, the Docs' envUI Docs'. */
function documentTitle(page: RoutePage | undefined, area: Area) {
  const site = area === 'docs' ? 'envUI Docs' : 'envUI';
  if (!page) return `Page not found · ${site}`;
  if (page.kind === 'home' || page.kind === 'docs-home') return site;
  return `${page.title} · ${site}`;
}

/**
 * Whether a heading belongs in the page's contents: one of the page's own, not an example's or a
 * figure's, which show components rather than the page's sections. Each export's props are listed
 * under Props; the exports' part names and color properties, and the two lists under
 * Accessibility, are their sections' alone, so the contents don't repeat the exports three times.
 */
const contentsHeading = (heading: HTMLElement) =>
  !heading.closest('.docs-live-example, .docs-open-example, .docs-specimen, .env-dialog') &&
  !(
    heading.localName === 'h3' &&
    heading.closest('.docs-provides, [aria-labelledby="parts"], [aria-labelledby="colors"]')
  );

/**
 * The page's contents beside it in the Docs, on a window wide enough for a column of them: its h2
 * and h3 headings, such as each export's props under Props, with the section the reader is in
 * marked. A link writes the section's fragment to the address, the same as a search result or a
 * copied address names it, and the route follows without scrolling again.
 */
function DocsContents({ page }: { page: RoutePage }) {
  return (
    <aside className="docs-contents">
      <TableOfContents
        key={page.path}
        className="docs-contents-list"
        container=".docs-page-column"
        filter={contentsHeading}
        onClick={(event) => {
          if (event.defaultPrevented && (event.target as Element).closest('a[href^="#"]'))
            announceShownAddress();
        }}
      />
    </aside>
  );
}

/**
 * The site: the Usage guide, at the root, which shows envUI to people, with a rail of its
 * destinations and a drawer of the chosen one's pages, and the Docs, under /docs, the developer
 * reference with a navigation of their own and each page's contents beside it. The navigation
 * holds the wordmark and search at its top, and the page has the way to the same subject in the
 * other part and the Display menu at its top end.
 */
function Shell() {
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
  const area: Area = page?.area ?? (inDocs(routePath) ? 'docs' : 'usage');
  const title = documentTitle(page, area);
  // Every page of the Docs but their home, an index of them, lists its contents beside it.
  const contents = page && area === 'docs' && page.kind !== 'docs-home';
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
    return area === 'docs' ? <DocsNavigation {...props} /> : <UsageNavigation {...props} />;
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
        <PageActions page={page} area={area} />
        <div className="docs-page-layout">
          <div className="docs-page-grid" data-contents={contents || undefined}>
            <div className="docs-page-column">
              <PageBoundary title={page?.title ?? 'Page not found'} route={route}>
                {content}
              </PageBoundary>
              {page && <PageNavigation page={page} />}
            </div>
            {contents && <DocsContents page={page} />}
          </div>
        </div>
        <PageFooter />
      </div>
      <Sheet
        className="docs-navigation-sheet"
        side="start"
        aria-label={area === 'docs' ? 'Docs' : 'Usage guide'}
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
          <Shell />
        </LinkProvider>
      </DisplaySettingsProvider>
    </EnvUIProvider>
  );
}
