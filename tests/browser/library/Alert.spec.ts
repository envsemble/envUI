import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/** tests/fixture/Primitives.tsx, which mounts an Alert with its dismiss button among envUI's primitives. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=primitives`);
  await expect(page.getByTestId('close-buttons')).toBeVisible();
}

test.describe('Close buttons', () => {
  test.describe('on a coarse pointer', () => {
    // A touch screen is a coarse pointer in every engine.
    test.use({ hasTouch: true });
    test('reaches the touch size with its hit area', async ({ page }) => {
      await open(page);
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
      const area = await page
        .getByTestId('close-buttons')
        .locator('.env-alert-dismiss')
        .evaluate((element) => {
          const before = getComputedStyle(element, '::before');
          const box = element.getBoundingClientRect();
          return {
            height: box.height + -2 * parseFloat(before.top),
            width: box.width + -2 * parseFloat(before.left),
          };
        });
      expect(area.height).toBeGreaterThanOrEqual(44);
      expect(area.width).toBeGreaterThanOrEqual(44);
    });
  });
});
