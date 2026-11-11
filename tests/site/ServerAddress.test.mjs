// The address where a server renders the site, as the build pre-renders each page: there is no
// location, and the route is the one of the path it renders (renderAt, routes/Address.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { importSource } from '../support/ImportSource.mjs';

const { allPages, renderAt, routeHref, oldHashRoute, currentRoute } = await importSource(
  'ServerAddress',
  [
    "export { allPages } from './apps/site/src/routes/SiteRoutes.ts';",
    "export { renderAt, routeHref, oldHashRoute } from './apps/site/src/routes/Address.ts';",
    "export { currentRoute } from './apps/site/src/routes/useSiteRoute.ts';",
  ],
);

test('on the server, the route is the one of the path it renders', () => {
  assert.equal(typeof location, 'undefined');
  for (const page of allPages) {
    renderAt(routeHref(page.path));
    assert.equal(currentRoute(), page.path, routeHref(page.path));
    assert.equal(oldHashRoute(), undefined);
  }
});
