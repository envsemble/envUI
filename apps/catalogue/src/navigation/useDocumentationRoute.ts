import { useEffect, useState } from 'react';
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
  viewChangePending = true;
  if (!replace) {
    location.hash = `/${route}`;
    return;
  }
  history.replaceState(history.state, '', `#/${route}`);
  dispatchEvent(new HashChangeEvent('hashchange'));
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
