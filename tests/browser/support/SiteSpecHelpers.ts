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

/**
 * Opens an address of the site and waits until the site has started on it (main.tsx): a page the
 * build pre-rendered shows before its controls answer, so a press until then does nothing.
 */
export async function openSite(page: Page, url: string) {
  await page.goto(url);
  await page.locator('html[data-site-started]').waitFor({ state: 'attached' });
}
