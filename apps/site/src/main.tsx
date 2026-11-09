import { startTransition, useEffect, useState, type ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { SiteRoot } from './App';
// After App: its envUI components bring envUI's style sheets, which declare the order of the env
// cascade layers that the site's style sheets build on.
import './styles/index.css';
import { findPage } from './routes/SiteRoutes';
import { currentRoute } from './routes/useSiteRoute';
import { oldHashRoute } from './routes/Address';
import { preloadFirstPage } from './pages/PreloadPage';
import { Hydrated } from './loading/useHydrated';
import { givePageCode } from './pages/PageCode';

// index.html holds the root, which the build pre-renders for each page, naming the page's route
// (scripts/site/PrerenderSite.ts).
const container = document.getElementById('root')!;
const page = findPage(currentRoute().split('?')[0]);
// The site renders once what the page it opens on needs has loaded, which started as it did, so
// its first paint has the whole page rather than the frame and then the page; a pre-rendered page
// hydrates without suspending.
const opening = preloadFirstPage(page);
// The page pre-rendered for the address hydrates. While developing, at an old hash address, and at
// an address the build has no page for, which the host answers with Page not found (404.html),
// such as an old address that leads to another page, the site renders on the client alone.
const prerendered = container.dataset.sitePage;
const hydrates =
  prerendered !== undefined && oldHashRoute() === undefined && page?.path === prerendered;

/**
 * The site as it starts. Once a pre-rendered page has hydrated, the parts that render in the
 * browser alone, such as its figures, mount (Hydrated), in a transition, which yields to the
 * browser as it goes rather than holding up the page in one long task. Rendering on the client
 * alone, they mount at once. It marks the document once the site has started, after every part's
 * effects, with `data-site-started`: before it, a press on a pre-rendered control has no handler
 * yet, which the browser tests wait for (SiteSpecHelpers.ts). It renders no element, so the
 * hydrated tree is the server's.
 */
function Started({ hydrating, children }: { hydrating: boolean; children: ReactNode }) {
  const [hydrated, setHydrated] = useState(!hydrating);
  useEffect(() => {
    document.documentElement.setAttribute('data-site-started', '');
    startTransition(() => setHydrated(true));
  }, []);
  return <Hydrated value={hydrated}>{children}</Hydrated>;
}

void opening.then(() => {
  // The head hides a page it can't tell is the address's (PrerenderSite.ts): an old address, or
  // one with no page of its own, whose page renders here in place of it. It shows before the
  // site's effects run, which scroll to and focus the section an address names.
  document.documentElement.removeAttribute('data-site-unrendered');
  const site = (
    <Started hydrating={hydrates}>
      <SiteRoot />
    </Started>
  );
  if (hydrates) {
    // Its code blocks hydrate highlighted, as the server rendered them.
    givePageCode();
    // As a transition, which yields to the browser as it goes, as the page shows already.
    startTransition(() => {
      hydrateRoot(container, site, {
        // A page whose first render differs from its pre-rendered HTML renders again on the
        // client, which the browser tests watch the console for (SitePrerender.spec.ts).
        onRecoverableError(error) {
          // eslint-disable-next-line no-console -- a mismatch is a bug the browser tests catch here
          console.error('The pre-rendered page did not hydrate:', error);
        },
      });
    });
  } else {
    container.replaceChildren();
    createRoot(container).render(site);
  }
});

// Those modules serve the start alone: a change to them, such as the documentation's while
// developing, updates the pages that use them in place rather than loading the site again.
import.meta.hot?.accept(
  ['./routes/SiteRoutes', './routes/useSiteRoute', './pages/PreloadPage'],
  () => {},
);
