import { startTransition } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { SiteRoot } from './App';
import './styles/index.css';
import { findPage } from './routes/SiteRoutes';
import { currentRoute } from './routes/useSiteRoute';
import { oldHashRoute } from './routes/Address';
import { preloadFirstPage } from './pages/PageLoading';
import { Started } from './loading/Started';
import { givePageCode } from './pages/PageCode';
import { givePageMarkdown } from './pages/PageMarkdownTrees';

const container = document.getElementById('root')!;
const page = findPage(currentRoute().split('?')[0]);
const opening = preloadFirstPage(page);
const prerenderedRoute = container.dataset.sitePage;
const hydrates =
  prerenderedRoute !== undefined && oldHashRoute() === undefined && page?.path === prerenderedRoute;

void opening.then(() => {
  document.documentElement.removeAttribute('data-site-unrendered');
  const site = (
    <Started hydrating={hydrates}>
      <SiteRoot />
    </Started>
  );
  if (hydrates) {
    givePageCode();
    givePageMarkdown();
    startTransition(() => {
      hydrateRoot(container, site, {
        onRecoverableError(error) {
          // eslint-disable-next-line no-console
          console.error('The pre-rendered page did not hydrate:', error);
        },
      });
    });
  } else {
    container.replaceChildren();
    createRoot(container).render(site);
  }
});

import.meta.hot?.accept(
  ['./routes/SiteRoutes', './routes/useSiteRoute', './pages/PageLoading'],
  () => {},
);
