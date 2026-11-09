import assert from 'node:assert/strict';
import { test } from 'node:test';
import { importSource } from '../support/ImportSource.mjs';

const { allPages } = await importSource('SiteRoutes', 'apps/site/src/routes/SiteRoutes.ts');
const { routeHref } = await importSource('Address', 'apps/site/src/routes/Address.ts');
const { viewOfAddress, viewOfKind } = await importSource(
  'ViewOfAddress',
  'apps/site/src/pages/ViewOfAddress.ts',
);

test("index.html's script preloads the view module of every page's kind from its address", () => {
  for (const page of allPages) {
    const href = routeHref(page.path);
    assert.equal(viewOfAddress(href), viewOfKind[page.kind], `${href}, a ${page.kind} page`);
  }
});
