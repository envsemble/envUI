import { lazyPart } from '../loading/LoadedPart';
import type { PageKind } from '../routes/SiteRoutes';
/**
 * The large parts of pages that load on their own, with the page that shows them (LoadedPart): the
 * token reference, the changelog, and the colors guide's palette, its swatches with their color
 * picker. Here rather than with the views that show them, so the site's start can load a page's
 * before it hydrates the page the server rendered them in (preloadFirstPage). Each names its
 * module's path in the site app beside its import, as the views do (PageLoading.ts).
 */
export const pageParts = {
  tokenReference: lazyPart(
    () => import('./docs/TokenReference'),
    (module) => module.TokenReference,
    'src/pages/docs/TokenReference.tsx',
  ),
  changelog: lazyPart(
    () => import('./docs/Changelog'),
    (module) => module.Changelog,
    'src/pages/docs/Changelog.tsx',
  ),
  palette: lazyPart(
    () => import('../figures/foundations/ColorPalette'),
    (module) => module.ColorPalette,
    'src/figures/foundations/ColorPalette.tsx',
  ),
};

/**
 * The parts a page shows, by its kind and the id of its page of docs/: the token reference, the
 * changelog, and the palette of the colors guide in the Docs (DocsPages.tsx). The browser loads
 * them before it hydrates the page the server rendered them in, else React renders them again.
 */
export function partsOfPage(
  kind: PageKind,
  document: string | undefined,
): (keyof typeof pageParts)[] {
  if (kind === 'tokens') return ['tokenReference'];
  if (kind === 'docs-changelog') return ['changelog'];
  if (kind === 'foundation-guide' && document === 'colors') return ['palette'];
  return [];
}
