import { lazyPart } from '../loading/LoadedPart';
import { partModules, partsOfPage, type PagePart } from './ViewModules';
import type { RoutePage } from '../routes/SiteRoutes';

/**
 * The large parts of pages that load on their own, with the page that shows them (LoadedPart): the
 * token reference, the changelog, and the colors guide's palette, its swatches with their color
 * picker. Here rather than with the views that show them, so the site's start can load a page's
 * before it hydrates the page the server rendered them in (preloadFirstPage).
 */
export const pageParts = {
  tokenReference: lazyPart(
    () => import('./TokenReference'),
    (module) => module.TokenReference,
    partModules.tokenReference,
  ),
  changelog: lazyPart(
    () => import('./Changelog'),
    (module) => module.Changelog,
    partModules.changelog,
  ),
  palette: lazyPart(
    () => import('../figures/foundations/ColorPalette'),
    (module) => module.ColorPalette,
    partModules.palette,
  ),
} satisfies Record<PagePart, unknown>;

/** Starts loading the parts a page shows (partsOfPage). */
export const loadPageParts = (page: RoutePage) =>
  partsOfPage(page.kind, page.document?.id).map((part) => pageParts[part].load());
