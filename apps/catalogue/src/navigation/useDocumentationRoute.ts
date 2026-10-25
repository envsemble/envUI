import { useEffect, useState } from 'react';
import { normalizeRoute } from './DocumentationRoutes';
import { oldHashRoute, replaceAddress, subscribeToAddress, writtenRoute } from './Address';

function readRoute() {
  return normalizeRoute(writtenRoute() || 'overview');
}

/** The route the address names now, such as components/button/props?section=props-Button-variant. */
export const currentRoute = readRoute;

/**
 * An old address, such as a page's 0.x name or a view pages had before the catalogue and the Docs
 * split, is replaced in place by the address of the route it leads to, so the address bar, a new
 * bookmark and the history show the page's own address. An old hash address of the offline
 * catalogue, such as a bookmark, is redirected the same way, once, to the path of the route it
 * named: routes are then read from the path alone. The root address stays as it is.
 */
function correctAddress() {
  const written = oldHashRoute() ?? writtenRoute();
  if (written) replaceAddress(normalizeRoute(written));
}

/** The current route, from the address's path. */
export function useDocumentationRoute() {
  // An old hash address is redirected before the first render, which reads the path.
  const [route, setRoute] = useState(() => {
    if (oldHashRoute() !== undefined) correctAddress();
    return readRoute();
  });
  useEffect(() => {
    correctAddress();
    // An address that changed before this effect, such as an old one corrected, is read again.
    setRoute(readRoute());
    return subscribeToAddress(() => {
      correctAddress();
      setRoute(readRoute());
    });
  }, []);
  return route;
}
