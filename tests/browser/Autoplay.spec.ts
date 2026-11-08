import { test, expect, type Page } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { displayStorageKeys } from '../../apps/site/src/theme/DisplayStorage';

/*
 * Tiles that play by themselves where the reader can't hover (apps/site/src/motion/Autoplay.ts):
 * on a phone, the gallery's tile in the middle of the viewport plays once scrolling settles, one at
 * a time on the whole page, and none where the animations are paused or reduced motion is preferred.
 */

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

/** The names of the tiles playing now. */
const playing = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-playing]')].map(
      (stage) =>
        stage.closest('li')?.querySelector('.catalogue-gallery-link, .catalogue-related-link')
          ?.textContent,
    ),
  );

/** Whether one tile plays now, another than the one named. */
const playingOtherThan = async (page: Page, name: string | null | undefined) => {
  const names = await playing(page);
  return names.length === 1 && names[0] !== name;
};

/** Counts, from now on, the most tiles that ever play at once. */
const watchMost = (page: Page) =>
  page.evaluate(() => {
    const record = window as unknown as { mostPlaying: number };
    record.mostPlaying = 0;
    const count = () => {
      record.mostPlaying = Math.max(
        record.mostPlaying,
        document.querySelectorAll('[data-playing]').length,
      );
    };
    new MutationObserver(count).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-playing'],
    });
  });

/** Scrolls the page by a finger's flick, in steps, as touch scrolling does. */
async function flick(page: Page, distance: number) {
  for (let step = 0; step < 6; step++) {
    await page.mouse.wheel(0, distance / 6);
    await page.waitForTimeout(16);
  }
}

test('on a touch screen, the tile in the middle plays, one at a time, and the next as the reader scrolls', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components`);
  await expect.poll(() => playing(page)).toHaveLength(1);
  await watchMost(page);
  const first = (await playing(page))[0];
  await flick(page, 600);
  await expect.poll(() => playingOtherThan(page, first)).toBe(true);
  const second = (await playing(page))[0];
  await flick(page, 600);
  await expect.poll(() => playingOtherThan(page, second)).toBe(true);
  expect(
    await page.evaluate(() => (window as unknown as { mostPlaying: number }).mostPlaying),
  ).toBe(1);
  // Related's tiles at a page's end take part too, one at a time.
  await page.goto(`${siteDevUrl}/components/button`);
  await page.locator('.catalogue-related-tile').first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.catalogue-related [data-playing]').count()).toBe(1);
});

test('on a touch screen the galleries and Related are one card to a row, so the one in the middle plays', async ({
  page,
}) => {
  // A phone either way up and a tablet: never two cards side by side, which would leave none in
  // the middle of the view to play.
  const viewports = [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 820, height: 1180 },
  ];
  const columns = (route: string) =>
    page
      .locator('.catalogue-gallery-grid, .catalogue-related-tiles')
      .evaluateAll(
        (grids, route) =>
          grids.map(
            (grid) => `${route}: ${getComputedStyle(grid).gridTemplateColumns.split(' ').length}`,
          ),
        route,
      );
  for (const route of ['patterns', 'components/button', 'components']) {
    await page.goto(`${siteDevUrl}/${route}`);
    if (route === 'components/button')
      await page.locator('.catalogue-related').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await columns(route)).length).toBeGreaterThan(0);
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const count of await columns(route))
        expect(count, `${viewport.width}`).toBe(`${route}: 1`);
    }
  }
  // The card brought to the middle of the view is the one that plays, at every size.
  for (const [index, viewport] of viewports.entries()) {
    await page.setViewportSize(viewport);
    const card = page.locator('.catalogue-gallery-tile').nth(3 + index * 2);
    await card.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    const name = await card.locator('.catalogue-gallery-link').textContent();
    await expect.poll(() => playing(page)).toEqual([name]);
  }
});

test('nothing plays by itself where the animations are paused', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'paused'), displayStorageKeys.motion);
  await page.goto(`${siteDevUrl}/components`);
  await expect(page.locator('.catalogue-gallery-tile').first()).toBeVisible();
  await flick(page, 600);
  // Just past the time a tile waits for scrolling to settle, with time to start.
  await page.waitForTimeout(800);
  expect(await playing(page)).toEqual([]);
});

test('nothing plays by itself where reduced motion is preferred, though the animations play', async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, 'playing'),
    displayStorageKeys.motion,
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${siteDevUrl}/components`);
  await expect(page.locator('.catalogue-gallery-tile').first()).toBeVisible();
  await flick(page, 600);
  // Just past the time a tile waits for scrolling to settle, with time to start.
  await page.waitForTimeout(800);
  expect(await playing(page)).toEqual([]);
  // Without the preference, the tile in the middle plays.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => playing(page)).toHaveLength(1);
});
