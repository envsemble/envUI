import { useEffect, useState } from 'react';
import { normalizeRoute } from './DocumentationRoutes';

function readRoute() {
  return normalizeRoute(location.hash.replace(/^#\/?/, '') || 'overview');
}

/** Hash routes also work in the downloaded reference without a server. */
export function useDocumentationRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    addEventListener('hashchange', onHashChange);
    return () => removeEventListener('hashchange', onHashChange);
  }, []);
  return route;
}
