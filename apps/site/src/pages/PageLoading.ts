import { use, useMemo, type ReactNode } from 'react';
import type { TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import type { PageKind, PageOfKind, RoutePage } from '../routes/SiteRoutes';
import { loadFoundationFigures } from '../figures/foundations/FoundationFigures';
import { reloadModule } from '../loading/LoadBoundary';
import { loadOnce, settled, useLoaded } from '../loading/LoadOnce';
import { loadDocument } from './PageContent';
import { pageParts, partsOfPage } from './PageParts';

type View<Kind extends PageKind> = (props: { page: PageOfKind<Kind> }) => ReactNode;

type Contents = (
  page: RoutePage,
  document: DocumentationEntry | undefined,
) => TableOfContentsItem[];

interface LoadedView<Kind extends PageKind> {
  View: View<Kind>;
  contents?: Contents;
}

const viewModules = {
  home: { path: 'src/pages/catalogue/Overview.tsx', load: () => import('./catalogue/Overview') },
  galleries: {
    path: 'src/pages/catalogue/CatalogueGalleries.tsx',
    load: () => import('./catalogue/CatalogueGalleries'),
  },
  catalogue: {
    path: 'src/pages/catalogue/CataloguePages.tsx',
    load: () => import('./catalogue/CataloguePages'),
  },
  docs: { path: 'src/pages/docs/DocsPages.tsx', load: () => import('./docs/DocsPages') },
};

type ViewModule = keyof typeof viewModules;

type ExportsOf<Module extends ViewModule> = Awaited<
  ReturnType<(typeof viewModules)[Module]['load']>
>;

interface ViewSource<V> {
  module: ViewModule;
  load: () => Promise<V>;
  retry: () => void;
}

function viewIn<Module extends ViewModule, V>(
  module: Module,
  pick: (exports: ExportsOf<Module>) => V,
): ViewSource<V> {
  const { path } = viewModules[module];
  const load = viewModules[module].load as () => Promise<ExportsOf<Module>>;
  let from = load;
  return {
    module,
    load: () => from().then(pick),
    retry() {
      const root = new URL(import.meta.env.BASE_URL, window.location.href).href;
      from = reloadModule(load, path, root);
    },
  };
}

const views = {
  home: viewIn('home', (module) => ({ View: module.Overview })),
  foundations: viewIn('galleries', (module) => ({ View: module.FoundationsPage })),
  components: viewIn('galleries', (module) => ({ View: module.ComponentsPage })),
  component: viewIn('catalogue', (module) => ({
    View: module.ComponentPage,
    contents: module.catalogueContents,
  })),
  foundation: viewIn('catalogue', (module) => ({
    View: module.FoundationPage,
    contents: module.catalogueContents,
  })),
  guide: viewIn('docs', (module) => ({ View: module.GuidePage, contents: module.docsContents })),
  'docs-changelog': viewIn('docs', (module) => ({
    View: module.ChangelogDocsPage,
    contents: module.docsContents,
  })),
  tokens: viewIn('docs', (module) => ({ View: module.TokensPage, contents: module.docsContents })),
  legal: viewIn('docs', (module) => ({ View: module.LegalPage, contents: module.docsContents })),
  'foundation-guide': viewIn('docs', (module) => ({
    View: module.FoundationGuidePage,
    contents: module.docsContents,
  })),
  reference: viewIn('docs', (module) => ({
    View: module.DocsReferencePage,
    contents: module.docsContents,
  })),
} satisfies { [Kind in PageKind]: ViewSource<LoadedView<Kind>> };

export function viewModuleOf(kind: PageKind) {
  const module = views[kind].module;
  return { module, path: viewModules[module].path };
}

const viewLoads = new Map<PageKind, Promise<unknown>>();

const loadPageView = (kind: PageKind) =>
  loadOnce(viewLoads, kind, views[kind].load) as Promise<LoadedView<PageKind>>;

export function retryPageView(kind: PageKind) {
  views[kind].retry();
  viewLoads.delete(kind);
}

export const usePageView = (page: RoutePage) =>
  use(loadPageView(page.kind)).View as (props: { page: RoutePage }) => ReactNode;

export function usePageContents(
  page: RoutePage | undefined,
): readonly TableOfContentsItem[] | undefined {
  const view = useLoaded(page && loadPageView(page.kind));
  const content = useLoaded(page?.document && loadDocument(page.document.id));
  return useMemo(() => {
    if (!page) return [];
    if (!view || (page.document && !content)) return undefined;
    return view.contents ? view.contents(page, content) : [];
  }, [page, view, content]);
}

const loads = (page: RoutePage | undefined) =>
  page ? [loadPageView(page.kind), ...contentLoads(page)] : [];

const contentLoads = (page: RoutePage) => {
  const document = page.document;
  if (!document) return [];
  const firstSectionFigures = document.outline?.[0]?.examples.map(({ name }) => name) ?? [];
  if (firstSectionFigures.length)
    void import('../figures/PreloadFigures')
      .then(({ preloadFigures }) => preloadFigures(document.id, firstSectionFigures))
      .catch(() => {});
  return [
    loadDocument(document.id),
    ...(page.kind === 'foundation' ? [loadFoundationFigures(document.id)] : []),
  ].filter((load) => load !== undefined);
};

export const preloadPage = (page: RoutePage | undefined): Promise<unknown> =>
  Promise.allSettled(loads(page));

export const preloadPageContent = (page: RoutePage | undefined): Promise<unknown> =>
  Promise.allSettled(page ? contentLoads(page) : []);

export const preloadFirstPage = (page: RoutePage | undefined): Promise<unknown> =>
  Promise.allSettled([
    ...loads(page),
    ...(page
      ? partsOfPage(page.kind, page.document?.id).map((part) => pageParts[part].load())
      : []),
  ]);

export const pageLoaded = (page: RoutePage | undefined) => loads(page).every(settled);
