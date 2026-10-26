/**
 * Where a route lives in the address. A route is written as a path and a query, such as
 * `docs/components/button?section=props-Button-variant`; `section` names the element a route
 * scrolls to. The address keeps it in its path, such as `/docs/components/button#props-Button-variant`,
 * with the section as the fragment: the catalogue at the root and the Docs under /docs. The
 * fragment is the one form of a section's address that links, copied addresses, search and the
 * pages' contents share; an address that names the section in its query, `?section=…`, as earlier
 * releases wrote some, opens the same place and is rewritten to the fragment. The server answers
 * every path without a file with index.html, so a deep link and a refresh load the page.
 *
 * There is no hash routing: the site never writes a hash route, and reads routes only from the
 * path. An old hash address, `#/components/button/props?section=…`, from the offline catalogue of
 * earlier releases, such as a bookmark, is redirected once to the path address of the route it
 * named (oldHashRoute), and the route is read from the path.
 */

/** The route of the catalogue's home page, which the root address shows. */
export const homeRoute = 'overview';

/** The route of the Docs' home page, which /docs shows. */
export const docsRoute = 'docs';

/**
 * Whether a route, such as docs/components/button, is a page of the Docs rather than the catalogue.
 */
export const inDocs = (route: string) => /^docs(?:[/?]|$)/.test(route);

function splitRoute(route: string) {
  const separator = route.indexOf('?');
  return separator === -1
    ? { path: route, params: new URLSearchParams() }
    : { path: route.slice(0, separator), params: new URLSearchParams(route.slice(separator + 1)) };
}

/** The address of a route, for a link or the history. */
export function routeHref(route: string): string {
  const { path, params } = splitRoute(route);
  const section = params.get('section');
  params.delete('section');
  const query = params.size ? `?${params}` : '';
  const fragment = section ? `#${encodeURIComponent(section)}` : '';
  return `${path === homeRoute ? '/' : `/${encodeURI(path)}`}${query}${fragment}`;
}

/** Text with its percent escapes decoded, or as it is where they are malformed. */
function decoded(text: string, decode: (text: string) => string) {
  try {
    return decode(text);
  } catch {
    return text;
  }
}

/** The route of a path address: its path, its query and its fragment as the section. */
function routeOfLocation({ pathname, search, hash }: Pick<URL, 'pathname' | 'search' | 'hash'>) {
  const path = decoded(pathname, decodeURI).replace(/^\/+|\/+$/g, '');
  const params = new URLSearchParams(search);
  const section = hash.length > 1 ? decoded(hash.slice(1), decodeURIComponent) : '';
  if (section) params.set('section', section);
  const query = params.size ? `?${params}` : '';
  // The root with a query or a fragment is the overview's.
  return path || !query ? `${path}${query}` : `overview${query}`;
}

/** The route the address's path names, as it is written; empty at the root. */
export function writtenRoute(): string {
  return routeOfLocation(location);
}

/**
 * The route an old hash address names, such as components/button/props for
 * `#/components/button/props`, which the address is redirected from; undefined for any other.
 */
export function oldHashRoute(): string | undefined {
  const { hash } = location;
  return hash.startsWith('#/') ? hash.slice(2) : undefined;
}

/** The part of the address that routes are written in. */
export function currentHref() {
  return `${location.pathname}${location.search}${location.hash}`;
}

/**
 * The route of a link's destination when it is a page of the site, which then opens without
 * loading the page again: another origin, a file such as /third-party-notices.txt and the build's
 * /assets/ load as they are.
 */
export function routeOfLink(href: string): string | undefined {
  const url = new URL(href, location.href);
  if (url.origin !== location.origin) return undefined;
  const last = url.pathname.split('/').at(-1) ?? '';
  if (/^\/assets(?:\/|$)/.test(url.pathname) || last.includes('.')) return undefined;
  return routeOfLocation(url);
}

/** Whether focus is where a route change leaves it: the page, its content or the search palette. */
function focusIsUnclaimed() {
  const focused = document.activeElement;
  return (
    !focused ||
    focused === document.body ||
    focused.id === 'docs-main' ||
    focused.closest('.env-command-palette') !== null
  );
}

/** Moves focus to an element, which takes it from script alone when it takes none otherwise. */
function focusOn(element: HTMLElement) {
  if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) element.tabIndex = -1;
  element.focus({ preventScroll: true });
}

/**
 * Scrolls an element to the top of the area that scrolls, below its scroll margin. WebKit has
 * scrolled past that place on the first press on a link to a heading of the same page, so the
 * document's part of the scroll is measured and corrected; where the browser lands right, the
 * correction is nothing.
 */
function scrollToTop(element: HTMLElement) {
  element.scrollIntoView();
  const wanted =
    (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) +
    (parseFloat(getComputedStyle(element).scrollMarginTop) || 0);
  const offset = element.getBoundingClientRect().top - wanted;
  if (Math.abs(offset) > 1) window.scrollBy({ top: offset, behavior: 'instant' });
}

/**
 * Scrolls to the element a route names, such as a heading or a prop's row, and moves focus to it,
 * so reading and the keyboard go on from there, once it is there: a part of the page that loads on
 * its own, such as the token reference, renders it later. Returns the cleanup.
 */
export function revealSection(id: string) {
  const reveal = (late: boolean) => {
    const element = document.getElementById(id);
    if (!element) return false;
    scrollToTop(element);
    // A section that renders later takes focus only from where the route left it, the page's
    // content or search closing, not from wherever the reader has moved since.
    if (!late || focusIsUnclaimed()) focusOn(element);
    return true;
  };
  if (reveal(false)) return;
  const observer = new MutationObserver(() => {
    if (reveal(true)) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // A section that never comes, such as one an old address names, stops being looked for.
  const timeout = setTimeout(() => observer.disconnect(), 15_000);
  return () => {
    observer.disconnect();
    clearTimeout(timeout);
  };
}

/**
 * Shows the place a route names on the page that shows it already, as a fresh navigation to it
 * would: its section, scrolled to and focused, or else the top of the page, with focus on its
 * content.
 */
export function revealRoute(route: string) {
  const section = splitRoute(route).params.get('section');
  if (section) {
    revealSection(section);
    return;
  }
  const main = document.getElementById('docs-main');
  main?.scrollTo({ top: 0 });
  if (main) focusOn(main);
}

/** Address changes made by navigate(), which the history API does not announce. */
const navigationEvent = 'envui:navigate';

/**
 * The address a part of the page wrote and showed itself, which the route follows without showing
 * it again (announceShownAddress).
 */
let shownAddress: string | undefined;

/**
 * Announces an address a part of the page wrote in the history itself, having shown its place
 * already, such as a link of the page's contents that scrolled to its section: the route follows
 * it, so the address, Back and the next link agree, without scrolling or moving focus again.
 */
export function announceShownAddress() {
  shownAddress = currentHref();
  dispatchEvent(new Event(navigationEvent));
}

/**
 * Whether the address is one a part of the page has shown already, which a route change then
 * leaves in place; it holds for that change alone.
 */
export function takeShownAddress() {
  const shown = shownAddress !== undefined && shownAddress === currentHref();
  shownAddress = undefined;
  return shown;
}

/**
 * Shows a route: a step in the history, or in place of the current entry with replace. When the
 * address already names it, its place shows again, as revealRoute shows it, and navigate returns
 * false.
 */
export function navigate(route: string, { replace = false }: { replace?: boolean } = {}) {
  const href = routeHref(route);
  if (href === currentHref()) {
    // Choosing the place the address names already, such as a prop's row again after scrolling
    // away, shows it again.
    revealRoute(route);
    return false;
  }
  shownAddress = undefined;
  history[replace ? 'replaceState' : 'pushState'](null, '', href);
  dispatchEvent(new Event(navigationEvent));
  return true;
}

/** Replaces the address in place, without announcing it, such as an old address with its route's. */
export function replaceAddress(route: string) {
  const href = routeHref(route);
  // An old hash address of the same path, such as /#/overview at the root, is still replaced.
  if (href !== currentHref() || oldHashRoute() !== undefined)
    history.replaceState(history.state, '', href);
}

/** Calls `listener` whenever the address changes: by a link, the history or navigate(). */
export function subscribeToAddress(listener: () => void) {
  const events = ['hashchange', 'popstate', navigationEvent];
  for (const event of events) addEventListener(event, listener);
  return () => {
    for (const event of events) removeEventListener(event, listener);
  };
}
