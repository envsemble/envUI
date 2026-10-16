/**
 * Where a route lives in the address. A route is written as a path and a query, such as
 * `components/button/props?section=props-Button-variant`; `section` names the element a route
 * scrolls to.
 *
 * - The hosted catalogue, and the development server, keep routes in the address's path, such as
 *   `/components/button/props#props-Button-variant`, with the section as the fragment. The server
 *   answers every path without a file with index.html, so a deep link and a refresh load the page.
 * - The offline catalogue keeps them in the hash, `#/components/button/props?section=…`. A file
 *   opened from disk, or an archived version in its folder of the hosted site, has no server that
 *   answers another path with it, so a path route could not be refreshed or shared.
 *
 * The hosted catalogue also opens the hash addresses of the offline one and of earlier releases,
 * and replaces them with the path address of the same route.
 */

/** Whether routes live in the path; Vite defines the constant, and Node tests leave it out. */
export const pathRoutes = typeof __ENVUI_PATH_ROUTES__ !== 'undefined' && __ENVUI_PATH_ROUTES__;

/** The route the overview opens at, which the hosted catalogue's root address shows. */
export const homeRoute = 'overview/components';

function splitRoute(route: string) {
  const separator = route.indexOf('?');
  return separator === -1
    ? { path: route, params: new URLSearchParams() }
    : { path: route.slice(0, separator), params: new URLSearchParams(route.slice(separator + 1)) };
}

/** The address of a route, for a link or the history. */
export function routeHref(route: string): string {
  if (!pathRoutes) return `#/${route}`;
  const { path, params } = splitRoute(route);
  const section = params.get('section');
  params.delete('section');
  const query = params.size ? `?${params}` : '';
  const fragment = section ? `#${encodeURIComponent(section)}` : '';
  return `${path === homeRoute ? '/' : `/${encodeURI(path)}`}${query}${fragment}`;
}

/** The route of a path address: its path, its query and its fragment as the section. */
function routeOfLocation({ pathname, search, hash }: Pick<URL, 'pathname' | 'search' | 'hash'>) {
  const path = decodeURI(pathname).replace(/^\/+|\/+$/g, '');
  const params = new URLSearchParams(search);
  const section = hash.length > 1 ? decodeURIComponent(hash.slice(1)) : '';
  if (section) params.set('section', section);
  const query = params.size ? `?${params}` : '';
  // The root with a query or a fragment is the overview's.
  return path || !query ? `${path}${query}` : `overview${query}`;
}

/** The route the address names, as it is written; empty at the root. */
export function writtenRoute(): string {
  const { hash } = location;
  if (!pathRoutes) return hash.replace(/^#\/?/, '');
  // A hash route, from the offline catalogue or an old bookmark, names the route itself.
  if (hash.startsWith('#/')) return hash.slice(2);
  return routeOfLocation(location);
}

/** The part of the address that routes are written in. */
export function currentHref() {
  return pathRoutes ? `${location.pathname}${location.search}${location.hash}` : location.hash;
}

/**
 * The route of a link's destination when it is a page of this catalogue, which then opens without
 * loading the page again: another origin, a file such as /versions.json, an archived version under
 * /v1.2/ and the build's /assets/ load as they are.
 */
export function routeOfLink(href: string): string | undefined {
  const url = new URL(href, location.href);
  if (url.origin !== location.origin) return undefined;
  // A hash route, written as #/route, opens that route.
  if (url.hash.startsWith('#/')) return url.hash.slice(2);
  const last = url.pathname.split('/').at(-1) ?? '';
  if (/^\/(?:assets|v\d+\.\d+)(?:\/|$)/.test(url.pathname) || last.includes('.')) return undefined;
  return routeOfLocation(url);
}

/** Address changes made by navigate(), which the history API does not announce. */
const navigationEvent = 'envui:navigate';

/**
 * Shows a route: a step in the history, or in place of the current entry with replace. Nothing
 * happens when the address already names it.
 */
export function navigate(route: string, { replace = false }: { replace?: boolean } = {}) {
  const href = routeHref(route);
  if (href === currentHref()) return false;
  if (pathRoutes) history[replace ? 'replaceState' : 'pushState'](null, '', href);
  else if (replace) history.replaceState(history.state, '', href);
  else {
    location.hash = href;
    return true;
  }
  dispatchEvent(new Event(navigationEvent));
  return true;
}

/** Replaces the address in place, without announcing it, such as an old address with its route's. */
export function replaceAddress(route: string) {
  const href = routeHref(route);
  if (href !== currentHref()) history.replaceState(history.state, '', href);
}

/** Calls `listener` whenever the address changes: by a link, the history or navigate(). */
export function subscribeToAddress(listener: () => void) {
  const events = ['hashchange', 'popstate', navigationEvent];
  for (const event of events) addEventListener(event, listener);
  return () => {
    for (const event of events) removeEventListener(event, listener);
  };
}
