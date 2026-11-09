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

/**
 * Opens an address of the site and waits until the site has started on it (main.tsx): a page the
 * build pre-rendered shows before its controls answer, so a press until then does nothing.
 */
export async function openSite(page: Page, url: string) {
  await page.goto(url);
  await page.locator('html[data-site-started]').waitFor({ state: 'attached' });
}

/**
 * Renders every figure of a page the build pre-rendered, which each renders only once it nears
 * the view (figures/useSubjectShown.ts): scrolls to each skeleton still in its place in turn until
 * every part on show has loaded, then back to the page's top. A skeleton out of sight, such as in a
 * closed disclosure, waits until it is shown.
 */
export async function showFigures(page: Page) {
  const next = () =>
    page.evaluate(() => {
      const skeleton = [...document.querySelectorAll('.site-loading:not([data-test-shown])')].find(
        (element) => element.getClientRects().length > 0,
      );
      if (!skeleton) return false;
      skeleton.setAttribute('data-test-shown', '');
      // The body scrolls, by itself: a stage's stand-ins keep a part inside it from scrolling the
      // page (motion/BrowserStandIns.ts).
      const body = document.getElementById('site-main')!;
      const box = skeleton.getBoundingClientRect();
      const view = body.getBoundingClientRect();
      body.scrollBy({ top: box.top + box.height / 2 - (view.top + view.height / 2) });
      return true;
    });
  while (await next())
    await page.locator('.site-loading[data-test-shown]').first().waitFor({ state: 'detached' });
  await page.locator('#site-main').evaluate((element) => element.scrollTo(0, 0));
}
