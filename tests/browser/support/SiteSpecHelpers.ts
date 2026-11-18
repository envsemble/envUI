import { type Page } from '@playwright/test';

export async function goTo(page: Page, path: string) {
  await page.evaluate((address) => {
    history.pushState(null, '', address);
    dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

export async function openSite(page: Page, url: string) {
  await page.goto(url);
  await page.locator('html[data-site-started]').waitFor({ state: 'attached' });
}
