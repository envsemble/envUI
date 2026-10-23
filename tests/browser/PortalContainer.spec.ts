import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const preview = `${fixtureUrl}/?fixture=portal-containers`;

/** Whether a locator's box lies inside the preview region's. */
async function insidePreview(page: Page, selector: string, preview = 'preview') {
  return page.evaluate(
    ([selector, preview]) => {
      const region = document.querySelector(`[data-testid="${preview}"]`)!.getBoundingClientRect();
      const box = document.querySelector(selector)!.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.left >= region.left - 1 &&
        box.right <= region.right + 1 &&
        box.top >= region.top - 1 &&
        box.bottom <= region.bottom + 1
      );
    },
    [selector, preview] as const,
  );
}

test.describe('PortalContainer, contained', () => {
  test('overlays open in the container, without locking the page or taking focus @engines', async ({
    page,
  }) => {
    await page.goto(preview);
    const layer = page.getByTestId('layer');
    await expect(layer.getByRole('menu', { name: 'Actions' })).toBeVisible();
    await expect(layer.getByRole('tooltip')).toHaveText('Refresh members');
    await expect(
      page.getByTestId('dialog-layer').getByRole('dialog', { name: 'Rename project' }),
    ).toBeVisible();
    await expect(layer.getByText('Changes saved.')).toBeVisible();
    for (const selector of ['.env-menu', '.env-tooltip', '.env-toast'])
      expect(await insidePreview(page, selector), selector).toBe(true);
    expect(await insidePreview(page, '.env-dialog-popup', 'dialog-preview')).toBe(true);
    // No focus moved in, and the page neither hides behind a modal layer nor stops scrolling.
    // Base UI focuses a menu as it opens; waiting past the 500 ms in which a contained popup sends
    // that focus back shows that it stays out.
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await expect(page.locator('[data-testid="outside"]')).not.toHaveAttribute('aria-hidden');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
      'hidden',
    );
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test('a press or Esc outside keeps them open, and the trigger closes its popup @engines', async ({
    page,
  }) => {
    await page.goto(preview);
    const layer = page.getByTestId('layer');
    const menu = layer.getByRole('menu', { name: 'Actions' });
    await expect(menu).toBeVisible();
    await page.getByTestId('outside').click();
    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();
    await expect(layer.getByRole('tooltip')).toBeVisible();
    const dialogLayer = page.getByTestId('dialog-layer');
    await expect(dialogLayer.getByRole('dialog', { name: 'Rename project' })).toBeVisible();
    // The dialog's own Cancel closes it, as anywhere; a press in another preview leaves the menu.
    await dialogLayer.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialogLayer.getByRole('dialog')).toHaveCount(0);
    await expect(menu).toBeVisible();
    // The menu's trigger, outside its container, closes it.
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(menu).toHaveCount(0);
    // The tooltip closes as the pointer leaves its control.
    await page.getByRole('button', { name: 'Refresh members' }).hover();
    await page.mouse.move(1, 1);
    await expect(layer.getByRole('tooltip')).toHaveCount(0);
  });

  test('F6 leaves the contained toasts alone @engines', async ({ page }) => {
    await page.goto(preview);
    await expect(page.getByTestId('layer').getByText('Changes saved.')).toBeVisible();
    await page.getByTestId('outside').focus();
    await page.keyboard.press('F6');
    await expect(page.getByTestId('outside')).toBeFocused();
  });
});
