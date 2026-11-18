import { lazyPart } from '../loading/LoadedPart';
import type { PageKind } from '../routes/SiteRoutes';
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

export function partsOfPage(
  kind: PageKind,
  document: string | undefined,
): (keyof typeof pageParts)[] {
  if (kind === 'tokens') return ['tokenReference'];
  if (kind === 'docs-changelog') return ['changelog'];
  if (kind === 'foundation-guide' && document === 'colors') return ['palette'];
  return [];
}
