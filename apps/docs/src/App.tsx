import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, NavigationItem, ActionGroup, IconButton, Button } from '@envsemble/envui';
import { DarkMode } from '@envsemble/envui/icons/DarkMode';
import { LightMode } from '@envsemble/envui/icons/LightMode';
import { findReferencePage, referenceViews } from './Documentation';
import { ReferenceContent } from './ReferencePage';
import { PageHeader } from './PageHeader';
import { GettingStarted } from './pages/GettingStarted';
import { Overview } from './pages/Overview';
import { Sidebar } from './navigation/Sidebar';
import { PageNavigation } from './navigation/PageNavigation';
import { useDocumentationRoute } from './navigation/useDocumentationRoute';

export default function App() {
  const route = useDocumentationRoute();
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [resetVersion, setResetVersion] = useState(0);
  const mainElement = useRef<HTMLElement>(null);
  const routePath = route.split('?')[0];
  const routeSegments = routePath.split('/');
  const page = findReferencePage(routePath);
  const reference = page?.reference;
  const view = referenceViews.find((view) => view.id === routeSegments[2])?.id ?? 'preview';
  const isOverview = routePath === 'overview';
  const oppositeAppearance = appearance === 'light' ? 'dark' : 'light';
  const title =
    reference?.title ??
    (routePath === 'getting-started'
      ? 'Getting started'
      : routePath === 'overview'
        ? 'envUI'
        : 'Page not found');
  const contentRoute = page
    ? `${page.path}${route.includes('?') ? `?${route.split('?')[1]}` : ''}`
    : route;
  useEffect(() => {
    document.title = title === 'envUI' ? 'envUI' : `${title} · envUI`;
    mainElement.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(contentRoute.split('?')[1]).get('section');
    if (section) document.getElementById(section)?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [contentRoute, title]);
  const controls = (
    <ActionGroup align="end" className="docs-page-controls">
      {page?.section === 'Components' && view === 'preview' && (
        <Button
          variant="secondary"
          onClick={() => setResetVersion((currentVersion) => currentVersion + 1)}
        >
          Reset examples
        </Button>
      )}
      <IconButton
        icon={appearance === 'light' ? <DarkMode /> : <LightMode />}
        aria-label={`Switch to ${oppositeAppearance} theme`}
        title={`Switch to ${oppositeAppearance} theme`}
        onClick={() => setAppearance(oppositeAppearance)}
      />
    </ActionGroup>
  );
  let content: ReactNode;
  if (page)
    content = (
      <ReferenceContent
        key={page.path}
        page={page}
        view={view}
        resetVersion={resetVersion}
        actions={controls}
      />
    );
  else if (routePath === 'getting-started') content = <GettingStarted />;
  else if (isOverview) content = <Overview actions={controls} />;
  else
    content = (
      <div className="docs-article">
        <NavigationItem href="#/overview">Return to overview</NavigationItem>
      </div>
    );
  return (
    <Theme theme={appearance} className="docs-app">
      <a
        className="docs-skip"
        href="#docs-main"
        onClick={(e) => {
          e.preventDefault();
          mainElement.current?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="docs-shell">
        <Sidebar routePath={routePath} page={page} />
        <main id="docs-main" ref={mainElement} tabIndex={-1} className="docs-main">
          {!isOverview && !page && (
            <PageHeader title={title} breadcrumb="envUI" actions={controls} />
          )}
          {content}
          <PageNavigation path={page?.path ?? routePath} view={view} />
        </main>
      </div>
    </Theme>
  );
}
