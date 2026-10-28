import { type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** Helpers the specs of the site share. */

export const version = JSON.parse(readFileSync('packages/ui/package.json', 'utf8')).version;

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
