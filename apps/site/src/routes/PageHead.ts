import type { Area, RoutePage } from './SiteRoutes';
import { siteDescription } from './SiteDescription';
import { docsRoute } from './Address';

/** The title of a page's tab: the catalogue's are envUI's, the Docs' envUI Docs'. */
export function documentTitle(page: RoutePage | undefined, area: Area) {
  const site = area === 'docs' ? 'envUI Docs' : 'envUI';
  if (!page) return `Page not found · ${site}`;
  if (page.kind === 'home' || page.path === docsRoute) return site;
  return `${page.title} · ${site}`;
}

/**
 * The description of a page, which its pre-rendered head carries and the site sets as it opens
 * the page: its summary, or else what the site is.
 */
export const pageDescription = (page: RoutePage | undefined) => page?.summary ?? siteDescription;
