/*
 * Which module holds the view of each kind of page: PageViews.ts loads it, and the build links its
 * files in the head of each pre-rendered page of the kind (the envui-content-preload plugin in
 * vite.config.ts, and scripts/site/PrerenderSite.ts). So too the parts of pages that load on their
 * own and that the server renders in the page (PageParts.ts).
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

/**
 * The modules of the large parts of pages that load on their own, which the server renders in
 * the page (PageParts.ts), by their paths in the site app.
 */
export const partModules = {
  tokenReference: 'src/pages/TokenReference.tsx',
  changelog: 'src/pages/Changelog.tsx',
  palette: 'src/figures/foundations/ColorPalette.tsx',
} as const;

/** A part of a page that loads on its own (partModules). */
export type PagePart = keyof typeof partModules;

/**
 * The parts a page shows, by its kind and the id of its page of docs/: the token reference, the
 * changelog, and the palette of the colors guide in the Docs (DocsPages.tsx). The browser loads
 * them before it hydrates the page the server rendered them in, else React renders them again.
 */
export function partsOfPage(kind: PageKind, document: string | undefined): PagePart[] {
  if (kind === 'tokens') return ['tokenReference'];
  if (kind === 'docs-changelog') return ['changelog'];
  if (kind === 'foundation-guide' && document === 'colors') return ['palette'];
  return [];
}
