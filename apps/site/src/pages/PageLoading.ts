/*
 * What a page loads, and when: its kind's view, its content (PageContent.ts), the large parts of it
 * that load on their own (PageParts.ts) and a foundation's figures. Each module of a view or a part
 * is named once, with its path in the site app beside its import, which stays literal so the
 * bundler gives it a file of its own: the server reports a page's modules by those paths
 * (Server.tsx), and the build links each pre-rendered page's files by them
 * (scripts/site/PagePreloads.ts, PrerenderSite.ts).
 *
 * The views take their content and parts from those two modules, never from this one, which
 * imports the views: through a cycle, an edit of the documentation would reload the development
 * server's page rather than update it in place.
 */
import { use, useMemo, type ReactNode } from 'react';
import type { TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import type { PageKind, PageOfKind, RoutePage } from '../routes/SiteRoutes';
import { loadFoundationFigures } from '../figures/foundations/FoundationFigures';
import { reloadModule } from '../loading/LoadBoundary';
import { loadOnce, settled, useLoaded } from '../loading/LoadOnce';
import { loadDocument } from './PageContent';
import { pageParts, partsOfPage } from './PageParts';

/** What a kind of page renders, given its page. */
type View<Kind extends PageKind> = (props: { page: PageOfKind<Kind> }) => ReactNode;

/**
 * The sections a kind of page shows, given its page and its content, as its view renders their
 * headings: what the page's contents list, from the first render on, the server's included.
 */
type Contents = (
  page: RoutePage,
  document: DocumentationEntry | undefined,
) => TableOfContentsItem[];

/** A kind of page's view, and the sections it shows where the page has contents beside it. */
interface LoadedView<Kind extends PageKind> {
  View: View<Kind>;
  contents?: Contents;
}

/**
 * The modules of the views of the site's pages, its home, its galleries, its pages of docs/ and
 * the Docs': each loads with the first page of its kinds (preloadPage), which index.html starts
 * loading for the page the address names, so the site's start carries none of them, and a page
 * only its own part's.
 */
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

/** What a view's module exports. */
type ExportsOf<Module extends ViewModule> = Awaited<
  ReturnType<(typeof viewModules)[Module]['load']>
>;

/** Where a view comes from, and how to ask for it again after a failure. */
interface ViewSource<V> {
  module: ViewModule;
  load: () => Promise<V>;
  retry: () => void;
}

/**
 * The view of a kind of page that `pick` takes from `module`, a module of viewModules; after a
 * failure, in development, the module is asked for again under a new URL (reloadModule).
 */
function viewIn<Module extends ViewModule, V>(
  module: Module,
  pick: (exports: ExportsOf<Module>) => V,
): ViewSource<V> {
  const { path } = viewModules[module];
  // The module's import gives its exports, which TypeScript can't follow through the lookup.
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

/** Each kind of page's view, from the module of its part of the site. */
const views = {
  home: viewIn('home', (module) => ({ View: module.Overview })),
  foundations: viewIn('galleries', (module) => ({ View: module.FoundationsPage })),
  components: viewIn('galleries', (module) => ({ View: module.ComponentsPage })),
  patterns: viewIn('galleries', (module) => ({ View: module.PatternsPage })),
  component: viewIn('catalogue', (module) => ({
    View: module.ComponentPage,
    contents: module.catalogueContents,
  })),
  pattern: viewIn('catalogue', (module) => ({
    View: module.PatternPage,
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
  'foundation-guide': viewIn('docs', (module) => ({
    View: module.FoundationGuidePage,
    contents: module.docsContents,
  })),
  reference: viewIn('docs', (module) => ({
    View: module.DocsReferencePage,
    contents: module.docsContents,
  })),
} satisfies { [Kind in PageKind]: ViewSource<LoadedView<Kind>> };

/**
 * The module of a kind of page's view, by its name, such as catalogue, and its path in the site
 * app, for the server to report what a page loads.
 */
export function viewModuleOf(kind: PageKind) {
  const module = views[kind].module;
  return { module, path: viewModules[module].path };
}

const viewLoads = new Map<PageKind, Promise<unknown>>();

/** A kind of page's view, loaded once and kept (loadOnce): as the site starts, and before a link's page. */
const loadPageView = (kind: PageKind) =>
  // Each kind's view takes that kind's page, which TypeScript can't follow through the lookup.
  loadOnce(viewLoads, kind, views[kind].load) as Promise<LoadedView<PageKind>>;

/** Drops a kind's view that failed to load, so that its next render loads it again. */
export function retryPageView(kind: PageKind) {
  views[kind].retry();
  viewLoads.delete(kind);
}

/** A page's view, suspending the page until it has loaded. */
export const usePageView = (page: RoutePage) =>
  // A page of the kind the view was loaded for, which TypeScript can't follow either.
  use(loadPageView(page.kind)).View as (props: { page: RoutePage }) => ReactNode;

/**
 * The sections a page shows, which its contents list, from its view's module and its content
 * (Contents): without suspending, so the contents beside the page never hold it up; none until
 * both have loaded, which the first page and a followed link's have before they render, the
 * pre-rendered page as it hydrates included, so its first render lists them as the server did.
 */
export function usePageContents(page: RoutePage | undefined): readonly TableOfContentsItem[] {
  const view = useLoaded(page && loadPageView(page.kind));
  const content = useLoaded(page?.document && loadDocument(page.document.id));
  return useMemo(
    () =>
      !page || !view?.contents || (page.document && !content) ? [] : view.contents(page, content),
    [page, view, content],
  );
}

/**
 * What a page needs before it renders, loading: its kind's view, and its content and a
 * foundation's figures.
 */
const loads = (page: RoutePage | undefined) =>
  page ? [loadPageView(page.kind), ...contentLoads(page)] : [];

/**
 * What a page shows that is its own: its content and a foundation's figures. The files of the
 * figures of its first section, which it opens on, start loading too, beside its content rather
 * than once that has arrived and the page renders; the page doesn't wait for them, as each figure
 * holds its place while its file loads.
 */
const contentLoads = (page: RoutePage) => {
  const document = page.document;
  if (!document) return [];
  const first = document.outline?.[0]?.examples.map(({ name }) => name) ?? [];
  // Through a module of its own, as the figures' registries come with the views that show them
  // rather than with the site's start.
  if (first.length)
    void import('../figures/PreloadFigures')
      .then(({ preloadFigures }) => preloadFigures(document.id, first))
      .catch(() => {});
  return [
    loadDocument(document.id),
    ...(page.kind === 'foundation' ? [loadFoundationFigures(document.id)] : []),
  ].filter((load) => load !== undefined);
};

/**
 * Starts loading what a page needs before it renders, together rather than as each part asks:
 * its kind's view, its content and a foundation's figures. As the site starts for the page it opens
 * on, and as a link to a page is about to be followed. It settles once they have, loaded or not: a
 * failure shows where the page asks again.
 */
export const preloadPage = (page: RoutePage | undefined): Promise<unknown> =>
  Promise.allSettled(loads(page));

/**
 * Starts loading what a page shows that is its own, its content and a foundation's figures, but
 * not its kind's view: for a page that may come next, small files, where the view of another kind
 * than the page's own would be a large one.
 */
export const preloadPageContent = (page: RoutePage | undefined): Promise<unknown> =>
  Promise.allSettled(page ? contentLoads(page) : []);

/**
 * Starts loading what the page the site opens on needs, as preloadPage does, and also the parts of
 * it that load on their own, such as the token reference (pageParts): the server renders them in
 * the page, and the browser hydrates them in place, so it has to have them first, as it does the
 * page's view and content, else React renders them again with their skeletons. A link's page shows
 * their skeletons while they load.
 */
export const preloadFirstPage = (page: RoutePage | undefined): Promise<unknown> =>
  Promise.allSettled([
    ...loads(page),
    ...(page
      ? partsOfPage(page.kind, page.document?.id).map((part) => pageParts[part].load())
      : []),
  ]);

/** Whether what a page needs has loaded, or failed to, so it renders at once. */
export const pageLoaded = (page: RoutePage | undefined) => loads(page).every(settled);
