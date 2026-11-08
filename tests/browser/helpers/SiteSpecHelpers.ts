import { type Locator, type Page } from '@playwright/test';

/** Helpers the specs of the site share. */

/**
 * Opens a route of the site without loading it again, as a link in it does: the address changes
 * and the site shows the route's page.
 */
export async function goTo(page: Page, path: string) {
  await page.evaluate((address) => {
    history.pushState(null, '', address);
    dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

/**
 * Brings a gallery tile wholly into view, in the middle of the window: a large tile only partly in
 * view counts as visible to scrollIntoViewIfNeeded, and a pointer aimed at its edge would miss it.
 */
export const showTile = (tile: Locator) =>
  tile.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
