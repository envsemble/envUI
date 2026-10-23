import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { normalizeRoute } from './DocumentationRoutes';
import { navigate, replaceAddress, subscribeToAddress, writtenRoute } from './Address';

function readRoute() {
  return normalizeRoute(writtenRoute() || 'overview');
}

/** The route the address names now, such as components/button/props?section=props-Button-variant. */
export const currentRoute = readRoute;

/** The query of the current route, such as a page's `section`. */
export function currentRouteQuery() {
  return new URLSearchParams(readRoute().split('?')[1] ?? '');
}

/**
 * An old address, such as a page's 0.x name, a view pages had before the Site and the Docs split, or
 * a hash route of the offline catalogue, is replaced in place by the address of the route it leads
 * to, so the address bar, a new bookmark and the history show the page's own address. The root
 * address stays as it is.
 */
function correctAddress() {
  const written = writtenRoute();
  if (written) replaceAddress(normalizeRoute(written));
}

/** Whether the next route change comes from a page's tabs, until it happens. */
let viewChangePending = false;
/** Whether the last route change came from a page's tabs, which keep focus. */
let lastChangeFromTabs = false;

/** Whether the current route was reached by moving between a page's views on its tabs. */
export const reachedFromTabs = () => lastChangeFromTabs;

/**
 * Shows another view of a page from its tabs, such as a skill on the agent skills page. A view
 * chosen is a step in the history; views passed with the arrow keys replace the entry instead, so
 * Back leaves the page rather than stepping through every view on the way.
 */
export function showView(route: string, { replace }: { replace: boolean }) {
  viewChangePending = true;
  // The address already names the view: nothing changes, so no change is pending.
  if (!navigate(route, { replace })) viewChangePending = false;
}

/** Keys that move between tabs, which select as they move. */
const movingKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);

/**
 * The props of Tabs whose views are routes, such as the agent skills page's: a view is shown
 * with showView, so focus stays on the tabs, and one reached with the arrow keys replaces the
 * history entry rather than adding one. `routeOf` gives the route of a tab's value.
 */
export function useViewTabs(routeOf: (value: string) => string) {
  // Whether the view changes because the arrow keys moved through this tab list, not a press.
  const moving = useRef(false);
  return {
    onKeyDownCapture(event: KeyboardEvent<HTMLElement>) {
      // Only keys in this Tabs' own list move between its tabs; a panel's keys, or a nested
      // Tabs' list, don't.
      const list = (event.target as Element).closest('[role="tablist"]');
      moving.current =
        movingKeys.has(event.key) &&
        list !== null &&
        list.closest('.env-tabs') === event.currentTarget;
    },
    onPointerDownCapture() {
      moving.current = false;
    },
    onValueChange(next: string | null) {
      if (next) showView(routeOf(next), { replace: moving.current });
    },
  };
}

/** The current route, from the address's path. */
export function useDocumentationRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    correctAddress();
    // An address that changed before this effect, such as an old one corrected, is read again.
    setRoute(readRoute());
    return subscribeToAddress(() => {
      lastChangeFromTabs = viewChangePending;
      viewChangePending = false;
      correctAddress();
      setRoute(readRoute());
    });
  }, []);
  return route;
}
