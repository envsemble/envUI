import { useSyncExternalStore } from 'react';
import type { LinkComponentProps } from '@envsemble/envui';
import { navigate, routeOfLink } from './Address';
import { findPage } from './SiteRoutes';
import { normalizeRoute } from './OldAddresses';
import { pageLoaded, preloadPage } from '../pages/PreloadPage';

/** The page of a route, such as components/button?section=props. */
const pageOfRoute = (route: string) => findPage(route.split('?')[0]!);

/** Starts loading what the page a link leads to needs, as a press on it is coming. */
function preload(href: string | undefined) {
  const route = href === undefined ? undefined : routeOfLink(href);
  if (route !== undefined) void preloadPage(pageOfRoute(normalizeRoute(route || 'overview')));
}

/** The latest press on a link, which a press made while an earlier page loads takes over. */
let latestPress = 0;

/**
 * The route a press on a link leads to while its page loads, before the address changes: the
 * navigation shows it as the reader's destination at once (App.tsx), so the press shows on the
 * first frame however long the page takes.
 */
let pendingRoute: string | undefined;
const pendingListeners = new Set<() => void>();
function setPendingRoute(route: string | undefined) {
  if (pendingRoute === route) return;
  pendingRoute = route;
  for (const listener of pendingListeners) listener();
}
const subscribePending = (listener: () => void) => {
  pendingListeners.add(listener);
  return () => pendingListeners.delete(listener);
};

/** The route a pressed link leads to while its page loads (setPendingRoute), if any. */
export const usePendingRoute = () =>
  useSyncExternalStore(
    subscribePending,
    () => pendingRoute,
    () => undefined,
  );

/**
 * The anchor of every envUI destination on the site, through LinkProvider. A plain press on a link
 * to one of its pages, the catalogue's or the Docs', shows the page without loading the site again; a
 * press with a modifier and a link to a file or another site behave as anchors do. An example's
 * links, which a stage keeps from navigating, stay in place. A pointer over a link, or a press
 * starting on it, starts loading what its page needs; the address and the page change together,
 * once that has loaded, rather than the address first with the page before it still shown, and
 * meanwhile the navigation shows the destination (usePendingRoute).
 */
export function RouterLink({
  onClick,
  onPointerEnter,
  onPointerDown,
  ...props
}: LinkComponentProps) {
  return (
    <a
      {...props}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === 'mouse') preload(props.href);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        preload(props.href);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if ((props.target && props.target !== '_self') || props.download !== undefined) return;
        const route = routeOfLink(props.href);
        if (route === undefined) return;
        event.preventDefault();
        const target = normalizeRoute(route || 'overview');
        const page = pageOfRoute(target);
        const press = ++latestPress;
        if (pageLoaded(page)) {
          setPendingRoute(undefined);
          navigate(target);
        } else {
          setPendingRoute(target);
          void preloadPage(page).then(() => {
            if (press !== latestPress) return;
            navigate(target);
            setPendingRoute(undefined);
          });
        }
      }}
    />
  );
}
