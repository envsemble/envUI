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
import { allPages, findPage, type RoutePage } from './routes/SiteRoutes';
import { normalizeRoute, oldPaths } from './routes/OldAddresses';
import { pageParts, partsOfPage, preloadFirstPage, viewModuleOf } from './pages/PageLoading';
import { takeRenderedParts } from './loading/LoadedPart';
import { pageCodeScript, renderWithCode } from './pages/PageCode';
import { renderWithMarkdown } from './pages/PageMarkdownTrees';

/** The paths in the site app of the modules of the parts a page shows (partsOfPage). */
const partModulesOf = (page: RoutePage) =>
  partsOfPage(page.kind, page.document?.id).map((part) => pageParts[part].modules[0]);

/**
 * Every page the site serves: its route, such as components/button (the home page's is overview),
 * its address, such as /components/button (the home page's is /), the id of the page of docs/ it
 * shows, whose content it loads, the name of the module of its kind's view, such as catalogue, and
 * the paths of the modules it loads before it hydrates: its view's, and those of the parts of it
 * that load on their own (partsOfPage).
 */
export const sitePages = allPages.map((page) => {
  const view = viewModuleOf(page.kind);
  return {
    route: page.path,
    address: routeHref(page.path),
    document: page.document?.id,
    view: view.module,
    modules: [view.path, ...partModulesOf(page)],
  };
});

/**
 * A page pre-rendered: its tab's title and description, the HTML of the site's root, the element
 * that carries the tokens of its code, highlighted as it rendered (pages/PageCode.ts), and the one
 * that carries the trees of its Markdown, parsed as it rendered (pages/PageMarkdownTrees.ts).
 */
export interface RenderedPage {
  title: string;
  description: string;
  html: string;
  code?: string;
  markdown?: string;
}

/** Renders the site's root at `path`, such as /components/button, as the browser would first. */
async function renderAddress(path: string) {
  takeRenderedParts();
  // The server has no address: it renders the path.
  renderAt(path);
  // React renders a part that throws on the client alone, after a fallback; a page with one would
  // not hydrate as it is, so it fails the build instead.
  const errors: unknown[] = [];
  const {
    rendered: { rendered: html, code },
    markdown,
  } = await renderWithMarkdown(() =>
    renderWithCode(async () => {
      const { prelude } = await prerender(<SiteRoot />, {
        // The whole page in its place, rather than parts of it moved there by a script as they
        // load.
        progressiveChunkSize: Number.POSITIVE_INFINITY,
        onError(error) {
          errors.push(error);
        },
      });
      return new Response(prelude).text();
    }),
  );
  if (errors.length)
    throw new AggregateError(errors, `The page at ${path} failed to render on the server`);
  return { html, code: code && pageCodeScript(code), markdown, parts: takeRenderedParts() };
}

/** Renders the page at `route`, such as components/button, once what it shows has loaded. */
export async function renderPage(route: string): Promise<RenderedPage> {
  const page = findPage(route);
  if (!page) throw new Error(`No page at the route ${route}`);
  // Its view, content and parts together, which the render would otherwise wait for one after the
  // other, as the browser loads them before it hydrates the page.
  await preloadFirstPage(page);
  const { html, code, markdown, parts } = await renderAddress(routeHref(route));
  // A part the browser doesn't load before it hydrates would render again there, with its skeleton.
  const loaded = new Set<string>(partModulesOf(page));
  const unloaded = parts.filter((module) => !loaded.has(module));
  if (unloaded.length)
    throw new Error(
      `The page ${route} renders ${unloaded.join(', ')}, which partsOfPage (pages/PageLoading.ts) doesn't list for it.`,
    );
  return {
    title: documentTitle(page, page.area),
    description: pageDescription(page),
    html,
    code,
    markdown,
  };
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
