import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { normalizeRoute } from './DocumentationRoutes';

/** The route the address names, written as it is. */
const writtenRoute = () => location.hash.replace(/^#\/?/, '');

function readRoute() {
  return normalizeRoute(writtenRoute() || 'overview');
}

/**
 * An old address, such as a page's 0.x name, is replaced in place by the route it leads to, so the
 * address bar, a new bookmark and the history show the page's own address.
 */
function correctAddress() {
  const written = writtenRoute();
  const route = normalizeRoute(written || 'overview');
  if (written && route !== written) history.replaceState(history.state, '', `#/${route}`);
}

/** Whether the next route change comes from a page's tabs, until it happens. */
let viewChangePending = false;
/** Whether the last route change came from a page's tabs, which keep focus. */
let lastChangeFromTabs = false;

/** Whether the current route was reached by moving between a page's views on its tabs. */
export const reachedFromTabs = () => lastChangeFromTabs;

/**
 * Shows another view of the page from its tabs. A view chosen is a step in the history; views
 * passed with the arrow keys replace the entry instead, so Back leaves the page rather than
 * stepping through every view on the way.
 */
export function showView(route: string, { replace }: { replace: boolean }) {
  // The address already names the view: nothing changes, so no change is pending.
  if (location.hash === `#/${route}`) return;
  viewChangePending = true;
  if (!replace) {
    location.hash = `/${route}`;
    return;
  }
  history.replaceState(history.state, '', `#/${route}`);
  dispatchEvent(new HashChangeEvent('hashchange'));
}

/** Keys that move between tabs, which select as they move. */
const movingKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);

/**
 * The props of Tabs whose views are routes, for a page's views and the overview's: a view is shown
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

/** Hash routes also work in the downloaded reference without a server. */
export function useDocumentationRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    correctAddress();
    const onHashChange = () => {
      lastChangeFromTabs = viewChangePending;
      viewChangePending = false;
      correctAddress();
      setRoute(readRoute());
    };
    addEventListener('hashchange', onHashChange);
    return () => removeEventListener('hashchange', onHashChange);
  }, []);
  return route;
}
