import { startTransition, useEffect, useState, type ReactNode } from 'react';
import { FiguresMounted } from './useFiguresMounted';

/**
 * The site as it starts. Once a pre-rendered page has hydrated, the parts that render in the
 * browser alone, such as its figures, mount (FiguresMounted), in a transition, which yields to the
 * browser as it goes rather than holding up the page in one long task. Rendering on the client
 * alone, they mount at once. It marks the document once the site has started, after every part's
 * effects, with `data-site-started`: before it, a press on a pre-rendered control has no handler
 * yet, which the browser tests wait for (SiteSpecHelpers.ts). It renders no element, so the
 * hydrated tree is the server's.
 *
 * It is a module of its own, so main.tsx declares no component and isn't a Fast Refresh module,
 * which imports itself to read its exports: a page that loads while the server makes a hot update
 * would get that import at the update's address, run main.tsx twice and render the site twice.
 */
export function Started({ hydrating, children }: { hydrating: boolean; children: ReactNode }) {
  const [hydrated, setHydrated] = useState(!hydrating);
  useEffect(() => {
    document.documentElement.setAttribute('data-site-started', '');
    startTransition(() => setHydrated(true));
  }, []);
  return <FiguresMounted value={hydrated}>{children}</FiguresMounted>;
}
