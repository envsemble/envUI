import { use, type ReactNode } from 'react';
import type { PageKind, PageOfKind, RoutePage } from '../routes/SiteRoutes';
import { reloadModule } from '../loading/LoadBoundary';
import { loadOnce } from '../loading/LoadOnce';
import { viewModules, viewOfKind } from './ViewModules';

/** What a kind of page renders, given its page. */
type View<Kind extends PageKind> = (props: { page: PageOfKind<Kind> }) => ReactNode;

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
  home: viewIn('home', overview, (module) => module.Overview),
  foundations: viewIn('foundations', galleries, (module) => module.FoundationsPage),
  components: viewIn('components', galleries, (module) => module.ComponentsPage),
  patterns: viewIn('patterns', galleries, (module) => module.PatternsPage),
  component: viewIn('component', cataloguePages, (module) => module.ComponentPage),
  pattern: viewIn('pattern', cataloguePages, (module) => module.PatternPage),
  foundation: viewIn('foundation', cataloguePages, (module) => module.FoundationPage),
  guide: viewIn('guide', docsPages, (module) => module.GuidePage),
  'docs-changelog': viewIn('docs-changelog', docsPages, (module) => module.ChangelogDocsPage),
  tokens: viewIn('tokens', docsPages, (module) => module.TokensPage),
  'foundation-guide': viewIn('foundation-guide', docsPages, (module) => module.FoundationGuidePage),
  reference: viewIn('reference', docsPages, (module) => module.DocsReferencePage),
} satisfies { [Kind in PageKind]: ViewSource<View<Kind>> };

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
  use(loadPageView(page.kind)) as (props: { page: RoutePage }) => ReactNode;
