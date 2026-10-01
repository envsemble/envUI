import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, NavigationItem, ActionGroup, IconButton, Button } from '@envsemble/envui';
import { DarkMode } from '@envsemble/envui/icons/DarkMode';
import { LightMode } from '@envsemble/envui/icons/LightMode';
import { findReferencePage, referenceViews } from './Documentation';
import { ReferenceContent } from './ReferencePage';
import { PageHeader } from './PageHeader';
import { Catalogue } from './pages/Catalogue';
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
  const comparison = Boolean(page && view === 'preview');
  const oppositeAppearance = appearance === 'light' ? 'dark' : 'light';
  const title =
    reference?.title ??
    (routePath === 'getting-started'
      ? 'Getting started'
      : routePath === 'components'
        ? 'Components'
        : routePath === 'overview'
          ? 'envUI'
          : 'Page not found');
  const contentRoute = page?.path ?? route;
  useEffect(() => {
    document.title = title === 'envUI' ? 'envUI' : `${title} · envUI`;
    mainElement.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(contentRoute.split('?')[1]).get('section');
    if (section) document.getElementById(section)?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [contentRoute, title]);
  const controls = (
    <Theme theme={comparison ? oppositeAppearance : appearance} className="docs-page-controls">
      <ActionGroup align="end">
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
    </Theme>
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
  else if (routePath === 'components')
    content = (
      <div className="docs-catalogue-page">
        <Catalogue />
      </div>
    );
  else if (isOverview) content = <Overview />;
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
        <main
          id="docs-main"
          ref={mainElement}
          tabIndex={-1}
          className={`docs-main${comparison ? ' docs-comparison' : ''}`}
        >
          {isOverview && <div className="docs-overview-controls">{controls}</div>}
          {!isOverview && !page && (
            <PageHeader title={title} breadcrumb="envUI" actions={controls} />
          )}
          {content}
          <PageNavigation
            path={page?.path ?? routePath}
            appearance={appearance}
            comparison={comparison}
            view={view}
          />
        </main>
      </div>
    </Theme>
  );
}
