/*
 * The site's server entry, which scripts/site/PrerenderSite.ts builds and runs as the site builds:
 * it renders a page to the HTML of the site's root, as the browser's first render of it will be,
 * once what the page shows has loaded: its view, its content and the parts that load on their own,
 * such as the token reference. Its figures show their skeletons (useHydrated), so the page holds
 * no example or specimen. main.tsx hydrates it.
 */
import { prerender } from 'react-dom/static';
import { SiteRoot } from './App';
import { renderAt, routeHref } from './routes/Address';
import { documentTitle, pageDescription } from './routes/PageHead';
import { allPages, findPage } from './routes/SiteRoutes';
import { preloadPage } from './pages/PreloadPage';
import { viewOfKind } from './pages/ViewModules';
import { pageCodeScript, renderWithCode } from './pages/PageCode';

/**
 * Every page the site serves: its route, such as components/button (the home page's is overview),
 * its address, such as /components/button (the home page's is /), and the id of the page of docs/
 * it shows, whose content it loads, and the module of its kind's view.
 */
export const sitePages = allPages.map((page) => ({
  route: page.path,
  address: routeHref(page.path),
  document: page.document?.id,
  view: viewOfKind[page.kind],
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

/** Renders the page at `route`, such as components/button, once what it shows has loaded. */
export async function renderPage(route: string): Promise<RenderedPage> {
  const page = findPage(route);
  if (!page) throw new Error(`No page at the route ${route}`);
  // Its view and content together, which the render would otherwise wait for one after the other.
  await preloadPage(page);
  // The server has no address: it renders the route's path.
  renderAt(routeHref(route));
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
    throw new AggregateError(errors, `The page ${route} failed to render on the server`);
  return {
    title: documentTitle(page, page.area),
    description: pageDescription(page),
    html,
    code: code && pageCodeScript(code),
  };
}
