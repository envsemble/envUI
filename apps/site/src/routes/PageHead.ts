import type { Area, RoutePage } from './SiteRoutes';
import { siteDescription } from './SiteDescription';
import { docsRoute } from './Address';

export function documentTitle(page: RoutePage | undefined, area: Area) {
  const site = area === 'docs' ? 'envUI Docs' : 'envUI';
  if (!page) return `Page not found · ${site}`;
  if (page.kind === 'home' || page.path === docsRoute) return site;
  return `${page.title} · ${site}`;
}

export const pageDescription = (page: RoutePage | undefined) => page?.summary ?? siteDescription;
