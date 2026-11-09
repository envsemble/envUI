/*
 * Which module holds the view of each kind of page: PageViews.ts loads it, and the build links its
 * files in the head of each pre-rendered page of the kind (the envui-content-preload plugin in
 * vite.config.ts, and scripts/site/PrerenderSite.ts).
 */
import type { PageKind } from '../routes/SiteRoutes.ts';

/** The modules of the pages' views, by their paths in the site app (PageViews.ts). */
export const viewModules = {
  home: 'src/pages/Overview.tsx',
  galleries: 'src/pages/CatalogueGalleries.tsx',
  catalogue: 'src/pages/CataloguePages.tsx',
  docs: 'src/pages/DocsPages.tsx',
} as const;

/** The module of each kind of page's view, which PageViews.ts loads it from. */
export const viewOfKind: { [Kind in PageKind]: keyof typeof viewModules } = {
  home: 'home',
  foundations: 'galleries',
  components: 'galleries',
  patterns: 'galleries',
  component: 'catalogue',
  pattern: 'catalogue',
  foundation: 'catalogue',
  guide: 'docs',
  'docs-changelog': 'docs',
  tokens: 'docs',
  'foundation-guide': 'docs',
  reference: 'docs',
};
