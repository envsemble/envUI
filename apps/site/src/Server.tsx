/*
 * The site's server entry, which scripts/site/PrerenderSite.ts builds and runs as the site builds:
 * it renders a page to the HTML of the site's root, as the browser's first render of it will be,
 * once what the page shows has loaded: its view, its content and the parts that load on their own,
 * such as the token reference. Its figures show their skeletons (useFiguresMounted), so the page holds
 * no example or specimen. main.tsx hydrates it.
 */
import { prerender } from 'react-dom/static';
import { SiteRoot } from './App';
import { renderAt, routeHref } from './routes/Address';
import { documentTitle, pageDescription } from './routes/PageHead';
import { allPages, findPage } from './routes/SiteRoutes';
import { normalizeRoute, oldPaths } from './routes/OldAddresses';
import { preloadFirstPage } from './pages/PreloadPage';
import { partModules, partsOfPage, viewOfKind } from './pages/ViewModules';
import { takeRenderedParts } from './loading/LoadedPart';
import { pageCodeScript, renderWithCode } from './pages/PageCode';

/**
 * Every page the site serves: its route, such as components/button (the home page's is overview),
 * its address, such as /components/button (the home page's is /), and the id of the page of docs/
 * it shows, whose content it loads, the module of its kind's view, and the parts of it that load
 * on their own (partsOfPage), which it loads before it hydrates.
 */
export const sitePages = allPages.map((page) => ({
  route: page.path,
  address: routeHref(page.path),
  document: page.document?.id,
  view: viewOfKind[page.kind],
  parts: partsOfPage(page.kind, page.document?.id),
}));

/**
 * A page pre-rendered: its tab's title and description, the HTML of the site's root, and the
 * element that carries the tokens of its code, highlighted as it rendered (pages/PageCode.ts).
 */
export interface RenderedPage {
  title: string;
  description: string;
  html: string;
  code?: string;
}

/** Renders the site's root at `path`, such as /components/button, as the browser would first. */
async function renderAddress(path: string) {
  takeRenderedParts();
  // The server has no address: it renders the path.
  renderAt(path);
  // React renders a part that throws on the client alone, after a fallback; a page with one would
  // not hydrate as it is, so it fails the build instead.
  const errors: unknown[] = [];
  const { rendered: html, code } = await renderWithCode(async () => {
    const { prelude } = await prerender(<SiteRoot />, {
      // The whole page in its place, rather than parts of it moved there by a script as they load.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
      onError(error) {
        errors.push(error);
      },
    });
    return new Response(prelude).text();
  });
  if (errors.length)
    throw new AggregateError(errors, `The page at ${path} failed to render on the server`);
  return { html, code: code && pageCodeScript(code), parts: takeRenderedParts() };
}

/** Renders the page at `route`, such as components/button, once what it shows has loaded. */
export async function renderPage(route: string): Promise<RenderedPage> {
  const page = findPage(route);
  if (!page) throw new Error(`No page at the route ${route}`);
  // Its view, content and parts together, which the render would otherwise wait for one after the
  // other, as the browser loads them before it hydrates the page.
  await preloadFirstPage(page);
  const { html, code, parts } = await renderAddress(routeHref(route));
  // A part the browser doesn't load before it hydrates would render again there, with its skeleton.
  const loaded = new Set<string>(
    partsOfPage(page.kind, page.document?.id).map((part) => partModules[part]),
  );
  const unloaded = parts.filter((module) => !loaded.has(module));
  if (unloaded.length)
    throw new Error(
      `The page ${route} renders ${unloaded.join(', ')}, which partsOfPage (pages/ViewModules.ts) doesn't list for it.`,
    );
  return { title: documentTitle(page, page.area), description: pageDescription(page), html, code };
}

/**
 * The page the host answers an address with no page with (404.html): Page not found, which the
 * browser renders again at an old address that leads to a page (normalizeRoute).
 */
export async function renderNotFound(): Promise<RenderedPage> {
  const { html } = await renderAddress('/page-not-found');
  return {
    title: documentTitle(undefined, 'catalogue'),
    description: pageDescription(undefined),
    html,
  };
}

/**
 * The old addresses the host redirects (oldPaths), each with the address of the page it leads to,
 * such as /components/buttons to /components/button.
 */
export const oldAddresses = oldPaths.flatMap((path) => {
  const route = normalizeRoute(path);
  if (findPage(path) || !findPage(route.split('?')[0])) return [];
  return [{ from: `/${path}`, to: routeHref(route) }];
});
