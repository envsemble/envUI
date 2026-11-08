import { type Page } from '@playwright/test';

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
