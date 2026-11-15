import { useEffect, useState } from 'react';
import { normalizeRoute } from './OldAddresses';
import { oldHashRoute, replaceAddress, subscribeToAddress, writtenRoute } from './Address';

export function currentRoute() {
  return normalizeRoute(writtenRoute() || 'overview');
}

function correctAddress() {
  const written = oldHashRoute() ?? writtenRoute();
  if (written) replaceAddress(normalizeRoute(written));
}

export function useSiteRoute() {
  const [route, setRoute] = useState(() => {
    if (oldHashRoute() !== undefined) correctAddress();
    return currentRoute();
  });
  useEffect(() => {
    correctAddress();
    setRoute(currentRoute());
    return subscribeToAddress(() => {
      correctAddress();
      setRoute(currentRoute());
    });
  }, []);
  return route;
}
