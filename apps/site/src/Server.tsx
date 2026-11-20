import { prerender } from 'react-dom/static';
import { SiteRoot } from './App';
import { renderAt, routeHref } from './routes/Address';
import { documentTitle, pageDescription } from './routes/PageHead';
import { allPages, findPage, type RoutePage } from './routes/SiteRoutes';
import { normalizeRoute, oldPaths } from './routes/OldAddresses';
import { preloadFirstPage, viewModuleOf } from './pages/PageLoading';
import { pageParts, partsOfPage } from './pages/PageParts';
import { takeRenderedParts } from './loading/LoadedPart';
import { pageCodeScript, renderWithCode } from './pages/PageCode';
import { renderWithMarkdown } from './pages/PageMarkdownTrees';

const partModulesOf = (page: RoutePage) =>
  partsOfPage(page.kind, page.document?.id).map((part) => pageParts[part].modules[0]);

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

export interface RenderedPage {
  title: string;
  description: string;
  html: string;
  code?: string;
  markdown?: string;
}

async function renderAddress(path: string) {
  takeRenderedParts();
  renderAt(path);
  const errors: unknown[] = [];
  const {
    rendered: { rendered: html, code },
    markdown,
  } = await renderWithMarkdown(() =>
    renderWithCode(async () => {
      const { prelude } = await prerender(<SiteRoot />, {
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

export async function renderPage(route: string): Promise<RenderedPage> {
  const page = findPage(route);
  if (!page) throw new Error(`No page at the route ${route}`);
  await preloadFirstPage(page);
  const { html, code, markdown, parts } = await renderAddress(routeHref(route));
  const loaded = new Set<string>(partModulesOf(page));
  const unloaded = parts.filter((module) => !loaded.has(module));
  if (unloaded.length)
    throw new Error(
      `The page ${route} renders ${unloaded.join(', ')}, which partsOfPage (pages/PageParts.ts) doesn't list for it.`,
    );
  return {
    title: documentTitle(page, page.area),
    description: pageDescription(page),
    html,
    code,
    markdown,
  };
}

export async function renderNotFound(): Promise<RenderedPage> {
  const { html } = await renderAddress('/page-not-found');
  return {
    title: documentTitle(undefined, 'catalogue'),
    description: pageDescription(undefined),
    html,
  };
}

export const oldAddresses = oldPaths.map((path) => {
  const route = normalizeRoute(path);
  if (findPage(path))
    throw new Error(`/${path} is a page again: take it out of routes/OldAddresses.ts.`);
  if (!findPage(route.split('?')[0]))
    throw new Error(
      `/${path} leads to /${route}, which is no page: point it at the page that took its place in routes/OldAddresses.ts.`,
    );
  return { from: `/${path}`, to: routeHref(route) };
});
