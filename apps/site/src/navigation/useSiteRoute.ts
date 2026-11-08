import { useEffect, useState } from 'react';
import { normalizeRoute } from './OldAddresses';
import { oldHashRoute, replaceAddress, subscribeToAddress, writtenRoute } from './Address';

function readRoute() {
  return normalizeRoute(writtenRoute() || 'overview');
}

/** The route the address names now, such as components/button/props?section=props-Button-variant. */
export const currentRoute = readRoute;

/**
 * An old address, such as a page's old name or a view pages had before the catalogue and the Docs
 * split, is replaced in place by the address of the route it leads to, so the address bar, a new
 * bookmark and the history show the page's own address. An old hash address of the offline
 * catalogue, such as a bookmark, is redirected the same way, once, to the path of the route it
 * named: routes are then read from the path alone. The root address stays as it is.
 */
function correctAddress() {
  const written = oldHashRoute() ?? writtenRoute();
  if (written) replaceAddress(normalizeRoute(written));
}

/**
 * The current route, from the address's path. A new route renders at once: a link changes the
 * address once its page has what it needs (RouterLink); a page that hasn't, such as one gone back
 * to that hasn't loaded, shows a skeleton of its shape until its content has (App.tsx).
 */
export function useSiteRoute() {
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
