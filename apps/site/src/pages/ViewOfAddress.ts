/*
 * Which module holds the view of the page at an address, for index.html's script, which starts
 * loading it beside the site's own script rather than once that has arrived and run (the
 * envui-content-preload plugin in vite.config.ts). The script runs this function as it is written,
 * so it uses nothing else and nothing newer than the browsers the site supports;
 * tests/site/ViewOfAddress.test.mjs checks it names the module of every page's kind.
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
 * The view module of the page at `pathname`, such as /components/button: the Docs' under /docs, the
 * catalogue's home at the root, its galleries at a section's own address, and its pages of docs/
 * at every other address.
 */
export function viewOfAddress(pathname: string): keyof typeof viewModules {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'docs') return 'docs';
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'overview')) return 'home';
  if (segments.length === 1 && ['foundations', 'components', 'patterns'].indexOf(segments[0]) >= 0)
    return 'galleries';
  return 'catalogue';
}
