import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Theme,
  NavList,
  IconButton,
  Button,
  Stack,
  Dialog,
  Link,
  EnvUILogo,
} from '@envsemble/envui';
import { Menu } from '@envsemble/envui/icons/Menu';
import { DarkMode } from '@envsemble/envui/icons/DarkMode';
import { LightMode } from '@envsemble/envui/icons/LightMode';
import { findReferencePage, overviewViews, viewFor } from './navigation/DocumentationRoutes';
import { ReferenceContent } from './pages/ReferenceContent';
import { PageBoundary } from './layout/PageBoundary';
import { PageHeader } from './layout/PageHeader';
import { Overview } from './pages/Overview';
import { Sidebar } from './navigation/Sidebar';
import { PageNavigation } from './navigation/PageNavigation';
import { reachedFromTabs, useDocumentationRoute } from './navigation/useDocumentationRoute';

/**
 * The catalogue's scale, comfortable unless the address asks for the compact one with
 * ?scale=compact before its hash, to review every page at the compact scale.
 */
const scale =
  typeof location !== 'undefined' && new URLSearchParams(location.search).get('scale') === 'compact'
    ? 'compact'
    : 'comfortable';

export default function App() {
  const route = useDocumentationRoute();
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [focusContentOnClose, setFocusContentOnClose] = useState(false);
  const mainElement = useRef<HTMLElement>(null);
  const routePath = route.split('?')[0];
  const routeSegments = routePath.split('/');
  const page = findReferencePage(routePath);
  const reference = page?.reference;
  const root = routeSegments[0];
  const view = page ? viewFor(page.reference, routeSegments[2]) : 'preview';
  const isOverview = root === 'overview';
  const overviewView =
    overviewViews.find((view) => view.id === routeSegments[1])?.id ?? 'components';
  const oppositeAppearance = appearance === 'light' ? 'dark' : 'light';
  const title = reference?.title ?? (isOverview ? 'envUI' : 'Page not found');
  const search = route.split('?')[1];
  const contentPath = page?.path ?? root;
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
    document.title = title === 'envUI' ? 'envUI' : `${title} · envUI`;
    // Moving between a page's views keeps focus on its tabs, where the reader is.
    if (reachedFromTabs()) return;
    mainElement.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(contentRoute.split('?')[1]).get('section');
    if (section) document.getElementById(section)?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [contentRoute, title]);
  let content: ReactNode;
  if (page) content = <ReferenceContent key={page.path} page={page} view={view} search={search} />;
  else if (isOverview) content = <Overview view={overviewView} />;
  else
    content = (
      <Stack gap={7} className="docs-article">
        <NavList.Item href="#/overview">Return to overview</NavList.Item>
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
          href="#/overview"
          underline={false}
          className="docs-mobile-brand"
          aria-label="envUI overview"
        >
          <EnvUILogo />
        </Link>
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
            onNavigate={() => {
              setFocusContentOnClose(true);
              setNavigationOpen(false);
            }}
          />
        </Dialog>
      </header>
      <div className="docs-shell">
        <Sidebar routePath={routePath} page={page} />
        <main id="docs-main" ref={mainElement} tabIndex={-1} className="docs-main">
          <PageBoundary title={title} route={route}>
            {!isOverview && !page && <PageHeader title={title} breadcrumb="envUI" />}
            {content}
          </PageBoundary>
          <PageNavigation
            path={contentPath}
            view={isOverview ? (overviewView === 'get-started' ? 'usage' : 'preview') : view}
          />
        </main>
      </div>
    </Theme>
  );
}
