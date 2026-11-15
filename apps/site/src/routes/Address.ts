import { holdPlace } from './HoldPlace';
import { saveScroll } from './ScrollRestoration';

export const homeRoute = 'overview';

export const docsRoute = 'docs';

export const inDocs = (route: string) => /^docs(?:[/?]|$)/.test(route);

function splitRoute(route: string) {
  const separator = route.indexOf('?');
  return separator === -1
    ? { path: route, params: new URLSearchParams() }
    : { path: route.slice(0, separator), params: new URLSearchParams(route.slice(separator + 1)) };
}

export function routeHref(route: string): string {
  const { path, params } = splitRoute(route);
  const section = params.get('section');
  params.delete('section');
  const query = params.size ? `?${params}` : '';
  const fragment = section ? `#${encodeURIComponent(section)}` : '';
  return `${path === homeRoute ? '/' : `/${encodeURI(path)}`}${query}${fragment}`;
}

function decoded(text: string, decode: (text: string) => string) {
  try {
    return decode(text);
  } catch {
    return text;
  }
}

function routeOfLocation({ pathname, search, hash }: Pick<URL, 'pathname' | 'search' | 'hash'>) {
  const path = decoded(pathname, decodeURI).replace(/^\/+|\/+$/g, '');
  const params = new URLSearchParams(search);
  const section = hash.length > 1 ? decoded(hash.slice(1), decodeURIComponent) : '';
  if (section) params.set('section', section);
  const query = params.size ? `?${params}` : '';
  return path || !query ? `${path}${query}` : `overview${query}`;
}

let serverPath = '/';

export function renderAt(path: string) {
  serverPath = path;
}

const address = (): Pick<URL, 'pathname' | 'search' | 'hash'> =>
  typeof location === 'undefined' ? { pathname: serverPath, search: '', hash: '' } : location;

export function writtenRoute(): string {
  return routeOfLocation(address());
}

export function oldHashRoute(): string | undefined {
  const { hash } = address();
  return hash.startsWith('#/') ? hash.slice(2) : undefined;
}

function currentHref() {
  return `${location.pathname}${location.search}${location.hash}`;
}

export function routeOfLink(href: string): string | undefined {
  const url = new URL(href, location.href);
  if (url.origin !== location.origin) return undefined;
  const last = url.pathname.split('/').at(-1) ?? '';
  if (/^\/assets(?:\/|$)/.test(url.pathname) || last.includes('.')) return undefined;
  return routeOfLocation(url);
}

function focusIsUnclaimed() {
  const focused = document.activeElement;
  return (
    !focused ||
    focused === document.body ||
    focused.id === 'site-main' ||
    focused.closest('.env-command-palette') !== null
  );
}

function focusOn(element: HTMLElement) {
  if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) element.tabIndex = -1;
  element.focus({ preventScroll: true });
}

function scrollToTop(element: HTMLElement) {
  element.scrollIntoView();
  const wanted =
    (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) +
    (parseFloat(getComputedStyle(element).scrollMarginTop) || 0);
  const overshootPx = element.getBoundingClientRect().top - wanted;
  if (Math.abs(overshootPx) > 1) window.scrollBy({ top: overshootPx, behavior: 'instant' });
}

export function revealSection(id: string) {
  let hold: (() => void) | undefined;
  const reveal = (late: boolean) => {
    const element = document.getElementById(id);
    if (!element) return false;
    scrollToTop(element);
    if (!late || focusIsUnclaimed()) focusOn(element);
    const main = document.getElementById('site-main');
    if (main)
      hold = holdPlace(
        main,
        () => document.getElementById(id),
        element.getBoundingClientRect().top - main.getBoundingClientRect().top,
      );
    return true;
  };
  if (reveal(false)) return () => hold?.();
  const observer = new MutationObserver(() => {
    if (reveal(true)) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const timeout = setTimeout(() => observer.disconnect(), sectionWaitMs);
  return () => {
    observer.disconnect();
    clearTimeout(timeout);
    hold?.();
  };
}

function revealRoute(route: string) {
  const section = splitRoute(route).params.get('section');
  if (section) {
    revealSection(section);
    return;
  }
  const main = document.getElementById('site-main');
  main?.scrollTo({ top: 0 });
  if (main) focusOn(main);
}

const navigationEvent = 'envui:navigate';
const sectionWaitMs = 15_000;

let shownAddress: string | undefined;

export function announceShownAddress() {
  shownAddress = currentHref();
  dispatchEvent(new Event(navigationEvent));
}

export function takeShownAddress() {
  const shown = shownAddress !== undefined && shownAddress === currentHref();
  shownAddress = undefined;
  return shown;
}

export function navigate(route: string, { replace = false }: { replace?: boolean } = {}) {
  const href = routeHref(route);
  if (href === currentHref()) {
    revealRoute(route);
    return false;
  }
  shownAddress = undefined;
  if (!replace) saveScroll();
  history[replace ? 'replaceState' : 'pushState'](null, '', href);
  dispatchEvent(new Event(navigationEvent));
  return true;
}

export function replaceAddress(route: string) {
  const href = routeHref(route);
  if (href !== currentHref() || oldHashRoute() !== undefined)
    history.replaceState(history.state, '', href);
}

export function subscribeToAddress(listener: () => void) {
  const events = ['hashchange', 'popstate', navigationEvent];
  for (const event of events) addEventListener(event, listener);
  return () => {
    for (const event of events) removeEventListener(event, listener);
  };
}
