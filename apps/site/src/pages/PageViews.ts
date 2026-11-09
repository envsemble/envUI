import { use, useMemo, type ReactNode } from 'react';
import type { TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '@docs-model/DocumentationTypes';
import type { PageKind, PageOfKind, RoutePage } from '../routes/SiteRoutes';
import { reloadModule } from '../loading/LoadBoundary';
import { loadOnce, useLoaded } from '../loading/LoadOnce';
import { viewModules, viewOfKind } from './ViewModules';
import { loadDocument } from './PageContent';

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

/** Where a view comes from, and how to ask for it again after a failure. */
interface ViewSource<V> {
  load: () => Promise<V>;
  retry: () => void;
}

/**
 * The view of a kind of page that `pick` takes from the module `load` imports, the kind's module
 * (viewOfKind); after a failure, in development, the module is asked for again under a new URL
 * (reloadModule).
 */
function viewIn<Module, V>(
  kind: PageKind,
  load: () => Promise<Module>,
  pick: (loaded: Module) => V,
): ViewSource<V> {
  const module = viewModules[viewOfKind[kind]];
  let from = load;
  return {
    load: () => from().then(pick),
    retry() {
      const root = new URL(import.meta.env.BASE_URL, window.location.href).href;
      from = reloadModule(load, module, root);
    },
  };
}

/** The modules of the site's pages: its home, its galleries, its pages of docs/ and the Docs'. */
const overview = () => import('./Overview');
const galleries = () => import('./CatalogueGalleries');
const cataloguePages = () => import('./CataloguePages');
const docsPages = () => import('./DocsPages');

/**
 * Each kind of page's view, in the module of its part of the site. Each module loads with the
 * first page of its kinds (preloadPage), which index.html starts loading for the page the address
 * names, so the site's start carries none of them, and a page only its own part's.
 */
const views = {
  home: viewIn('home', overview, (module) => ({ View: module.Overview })),
  foundations: viewIn('foundations', galleries, (module) => ({ View: module.FoundationsPage })),
  components: viewIn('components', galleries, (module) => ({ View: module.ComponentsPage })),
  patterns: viewIn('patterns', galleries, (module) => ({ View: module.PatternsPage })),
  component: viewIn('component', cataloguePages, (module) => ({
    View: module.ComponentPage,
    contents: module.catalogueContents,
  })),
  pattern: viewIn('pattern', cataloguePages, (module) => ({
    View: module.PatternPage,
    contents: module.catalogueContents,
  })),
  foundation: viewIn('foundation', cataloguePages, (module) => ({
    View: module.FoundationPage,
    contents: module.catalogueContents,
  })),
  guide: viewIn('guide', docsPages, (module) => ({
    View: module.GuidePage,
    contents: module.docsContents,
  })),
  'docs-changelog': viewIn('docs-changelog', docsPages, (module) => ({
    View: module.ChangelogDocsPage,
    contents: module.docsContents,
  })),
  tokens: viewIn('tokens', docsPages, (module) => ({
    View: module.TokensPage,
    contents: module.docsContents,
  })),
  'foundation-guide': viewIn('foundation-guide', docsPages, (module) => ({
    View: module.FoundationGuidePage,
    contents: module.docsContents,
  })),
  reference: viewIn('reference', docsPages, (module) => ({
    View: module.DocsReferencePage,
    contents: module.docsContents,
  })),
} satisfies { [Kind in PageKind]: ViewSource<LoadedView<Kind>> };

const loads = new Map<PageKind, Promise<unknown>>();

/** A kind of page's view, loaded once and kept (loadOnce): as the site starts, and before a link's page. */
export const loadPageView = (kind: PageKind) => loadOnce(loads, kind, views[kind].load);

/** Drops a kind's view that failed to load, so that its next render loads it again. */
export function retryPageView(kind: PageKind) {
  views[kind].retry();
  loads.delete(kind);
}

/** A page's view, suspending the page until it has loaded. */
export const usePageView = (page: RoutePage) =>
  // Each kind's view takes that kind's page, which TypeScript can't follow through the lookup.
  (use(loadPageView(page.kind)) as LoadedView<PageKind>).View as (props: {
    page: RoutePage;
  }) => ReactNode;

/**
 * The sections a page shows, which its contents list, from its view's module and its content
 * (Contents): without suspending, so the contents beside the page never hold it up; none until
 * both have loaded, which the first page and a followed link's have before they render, the
 * pre-rendered page as it hydrates included, so its first render lists them as the server did.
 */
export function usePageContents(page: RoutePage | undefined): readonly TableOfContentsItem[] {
  const view = useLoaded(page && (loadPageView(page.kind) as Promise<LoadedView<PageKind>>));
  const content = useLoaded(page?.document && loadDocument(page.document.id));
  return useMemo(
    () =>
      !page || !view?.contents || (page.document && !content) ? [] : view.contents(page, content),
    [page, view, content],
  );
}
