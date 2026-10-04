import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, NavigationItem, IconButton, Button } from '@envsemble/envui';
import { DarkMode } from '@envsemble/envui/icons/DarkMode';
import { LightMode } from '@envsemble/envui/icons/LightMode';
import { findReferencePage, referenceViews, overviewViews } from './Documentation';
import { ReferenceContent } from './ReferencePage';
import { PageHeader } from './PageHeader';
import { Overview } from './pages/Overview';
import { Sidebar } from './navigation/Sidebar';
import { PageNavigation } from './navigation/PageNavigation';
import { useDocumentationRoute } from './navigation/useDocumentationRoute';

export default function App() {
  const route = useDocumentationRoute();
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const mainElement = useRef<HTMLElement>(null);
  const routePath = route.split('?')[0];
  const routeSegments = routePath.split('/');
  const page = findReferencePage(routePath);
  const reference = page?.reference;
  const root = routeSegments[0];
  const view =
    referenceViews.find((view) => view.id === routeSegments[page ? 2 : 1])?.id ?? 'preview';
  const isOverview = root === 'overview';
  const overviewView =
    overviewViews.find((view) => view.id === routeSegments[1])?.id ?? 'components';
  const oppositeAppearance = appearance === 'light' ? 'dark' : 'light';
  const title = reference?.title ?? (isOverview ? 'envUI' : 'Page not found');
  const search = route.split('?')[1];
  const contentPath = page?.path ?? root;
  const contentRoute = `${contentPath}${search ? `?${search}` : ''}`;
  useEffect(() => {
    document.title = title === 'envUI' ? 'envUI' : `${title} · envUI`;
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
      <div className="docs-article">
        <NavigationItem href="#/overview">Return to overview</NavigationItem>
      </div>
    );
  return (
    <Theme theme={appearance} className="docs-app">
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
      <div className="docs-shell">
        <Sidebar routePath={routePath} page={page} />
        <main id="docs-main" ref={mainElement} tabIndex={-1} className="docs-main">
          {!isOverview && !page && <PageHeader title={title} breadcrumb="envUI" />}
          {content}
          <PageNavigation
            path={contentPath}
            view={isOverview ? (overviewView === 'get-started' ? 'usage' : 'preview') : view}
          />
        </main>
      </div>
    </Theme>
  );
}
