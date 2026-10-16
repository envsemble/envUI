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

/**
 * Shows another route without a new history entry, as moving between a page's views with the arrow
 * keys does: Back then leaves the page rather than stepping through every view passed on the way.
 */
export function replaceRoute(route: string) {
  history.replaceState(history.state, '', `#/${route}`);
  dispatchEvent(new HashChangeEvent('hashchange'));
}

/** Hash routes also work in the downloaded reference without a server. */
export function useDocumentationRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    correctAddress();
    const onHashChange = () => {
      correctAddress();
      setRoute(readRoute());
    };
    addEventListener('hashchange', onHashChange);
    return () => removeEventListener('hashchange', onHashChange);
  }, []);
  return route;
}
