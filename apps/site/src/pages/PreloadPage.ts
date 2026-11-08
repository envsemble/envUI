import type { RoutePage } from '../navigation/SiteRoutes';
import { loadFoundationFigures } from '../figures/foundations/FoundationFigures';
import { loadDocument } from './PageContent';
import { settled } from '../loading/LoadOnce';

/** What a page needs before it renders, loading: its content and a foundation's figures. */
const loads = (page: RoutePage | undefined) => {
  const document = page?.document;
  if (!document) return [];
  return [
    loadDocument(document.id),
    ...(page.kind === 'foundation' ? [loadFoundationFigures(document.id)] : []),
  ].filter((load) => load !== undefined);
};

/**
 * Starts loading what a page needs before it renders, together rather than as each part asks:
 * its content and a foundation's figures. As the site starts for the page it opens
 * on, and as a link to a page is about to be followed. It settles once they have, loaded or not: a
 * failure shows where the page asks again.
 */
export const preloadPage = (page: RoutePage | undefined): Promise<unknown> =>
  Promise.allSettled(loads(page));

/** Whether what a page needs has loaded, or failed to, so it renders at once. */
export const pageLoaded = (page: RoutePage | undefined) => loads(page).every(settled);
