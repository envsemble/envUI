import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/** tests/fixture/Primitives.tsx, which mounts popups on a PopupSurface in each direction among envUI's primitives. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=primitives`);
  await expect(page.getByRole('button', { name: 'Open ltr' })).toBeVisible();
}

test.describe('PopupSurface', () => {
  test('carries the theme into the portal and the direction at its trigger', async ({ page }) => {
    await open(page);
    for (const dir of ['ltr', 'rtl'] as const) {
      await page.getByRole('button', { name: `Open ${dir}` }).click();
      const popup = page.getByTestId(`popup-${dir}`);
      await expect(popup).toBeVisible();
      await expect(popup).toHaveClass(/env-popup/);
      await expect(popup).toHaveAttribute('data-elevation', '2');
      await expect(popup).toHaveAttribute('data-width', 'md');
      const theme = popup.locator('xpath=ancestor::*[contains(@class, "env-popup-theme")]');
      await expect(theme).toHaveAttribute('data-env-theme', 'light');
      expect(await popup.evaluate((element) => getComputedStyle(element).direction)).toBe(dir);
      await page.keyboard.press('Escape');
      await expect(popup).toBeHidden();
    }
  });

  test('takes the direction at its trigger while focus is elsewhere', async ({ page }) => {
    await open(page);
    // Focus stays in a left-to-right region while code opens the right-to-left popup.
    await page.getByRole('button', { name: 'Open ltr' }).focus();
    await page.getByRole('button', { name: 'Open rtl' }).dispatchEvent('click');
    const popup = page.getByTestId('popup-rtl');
    await expect(popup).toBeVisible();
    expect(await popup.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl');
  });

  test('mounts its popup once as it reads the direction', async ({ page }) => {
    await open(page);
    // A popup remounted after opening returns focus to where it was, and a menu closes as it opens.
    await page.evaluate(() => {
      const record = window as unknown as { popupsRemoved: number };
      record.popupsRemoved = 0;
      new MutationObserver((mutations) => {
        for (const mutation of mutations)
          for (const node of mutation.removedNodes)
            if (node instanceof Element && node.querySelector('[data-testid="popup-ltr"]'))
              record.popupsRemoved += 1;
      }).observe(document.body, { childList: true, subtree: true });
    });
    await page.getByRole('button', { name: 'Open ltr' }).click();
    await expect(page.getByTestId('popup-ltr')).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as { popupsRemoved: number }).popupsRemoved),
    ).toBe(0);
  });
});
