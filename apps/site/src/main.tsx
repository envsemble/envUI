import { useEffect, type ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { SiteRoot } from './App';
// After App: its envUI components bring envUI's style sheets, which declare the order of the env
// cascade layers that the site's style sheets build on.
import './styles/index.css';
import { findPage } from './routes/SiteRoutes';
import { currentRoute } from './routes/useSiteRoute';
import { oldHashRoute } from './routes/Address';
import { applyFigureStyles, preloadPage } from './pages/PreloadPage';

// index.html holds the root, which the build pre-renders for each page, naming the page's route
// (scripts/site/PrerenderSite.ts).
const container = document.getElementById('root')!;
const page = findPage(currentRoute().split('?')[0]);
// The site renders once what the page it opens on needs has loaded, which started as it did, so
// its first paint has the whole page rather than the frame and then the page; a pre-rendered page
// hydrates without suspending.
const opening = preloadPage(page);
// After the view's sheets, which preloadPage linked.
applyFigureStyles();
// The page pre-rendered for the address hydrates. While developing, and at an address the build
// has no page for, which the host answers with the home page's file, such as an old address that
// leads to another page, the site renders on the client alone.
const prerendered = container.dataset.sitePage;
const hydrates =
  prerendered !== undefined && oldHashRoute() === undefined && page?.path === prerendered;

/**
 * Marks the document once the site has rendered or hydrated, after every part's effects, with
 * `data-site-started`: before it, a press on a pre-rendered control has no handler yet, which the
 * browser tests wait for (SiteSpecHelpers.ts). A page the head hid as it isn't the address's
 * (PrerenderSite.ts) shows again. It renders no element, so the hydrated tree is the server's.
 */
function Started({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.removeAttribute('data-site-unrendered');
    document.documentElement.setAttribute('data-site-started', '');
  }, []);
  return children;
}

void opening.then(() => {
  const site = (
    <Started>
      <SiteRoot />
    </Started>
  );
  if (hydrates)
    hydrateRoot(container, site, {
      // A page whose first render differs from its pre-rendered HTML renders again on the client,
      // which the browser tests watch the console for (SitePrerender.spec.ts).
      onRecoverableError(error) {
        // eslint-disable-next-line no-console -- a mismatch is a bug the browser tests catch here
        console.error('The pre-rendered page did not hydrate:', error);
      },
    });
  else {
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
