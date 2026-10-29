import type { RoutePage } from '../navigation/SiteRoutes';
import { loadFoundationFigures } from '../figures/foundations/FoundationFigures';
import { loadParts } from '../template/Parts';
import { loadDocument } from './PageModel';

/** Whether a page shows part names: an anatomy or variants figure, or the Docs' part names. */
const showsParts = (page: RoutePage) =>
  page.kind === 'reference' ||
  Boolean(
    page.document?.outline?.some((section) =>
      section.examples.some((example) => example.role === 'anatomy' || example.role === 'variants'),
    ),
  );

/**
 * Starts loading what a page needs before it renders, together rather than as each part asks:
 * its content, a foundation's figures and the part names. As the site starts for the page it opens
 * on, and as a link to a page is about to be followed. It settles once they have, loaded or not: a
 * failure shows where the page asks again.
 */
export function preloadPage(page: RoutePage | undefined): Promise<unknown> {
  const document = page?.document;
  if (!document) return Promise.resolve();
  return Promise.allSettled([
    loadDocument(document.id),
    page.kind === 'foundation' ? loadFoundationFigures(document.id) : undefined,
    showsParts(page) ? loadParts() : undefined,
  ]);
}
