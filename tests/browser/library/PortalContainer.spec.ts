import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

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
    expect(await insidePreview(page, '.env-dialog', 'dialog-preview')).toBe(true);
    // No focus moved in, and the page neither hides behind a modal layer nor stops scrolling.
    // Base UI focuses a menu as it opens; waiting past the 500 ms in which a contained popup sends
    // that focus back (openingFocusWindow in PopupSurface.tsx) shows that it stays out.
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    // After that window, focus moved in from outside the container stays.
    const firstItem = layer.getByRole('menuitem').first();
    await firstItem.focus();
    await expect(firstItem).toBeFocused();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
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

  test('Esc on a combobox or picker field, the trigger outside the container, closes its popup @engines', async ({
    page,
  }) => {
    await page.goto(preview);
    const list = page.getByTestId('combobox-layer').getByRole('listbox');
    await expect(list).toBeVisible();
    await page.getByRole('combobox', { name: 'Owner' }).focus();
    await page.keyboard.press('Escape');
    await expect(list).toHaveCount(0);
    // Focus goes into the picker's popup as it opens, and back to the field, which Esc then
    // closes the popup from.
    const field = page.getByRole('combobox', { name: 'Due' });
    await field.click();
    const popup = page.getByTestId('picker-layer').getByRole('dialog');
    await expect(popup).toBeVisible();
    await field.focus();
    await expect(popup).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
  });

  test('a context menu opens at the pointer in the container, without hiding or locking the page @engines', async ({
    page,
  }) => {
    await page.goto(preview);
    const region = page.getByTestId('context-region');
    await region.scrollIntoViewIfNeeded();
    const box = (await region.boundingBox())!;
    await page.mouse.click(box.x + 60, box.y + 30, { button: 'right' });
    const menu = page.getByTestId('context-layer').getByRole('menu', { name: 'Document actions' });
    await expect(menu).toBeVisible();
    expect(
      await insidePreview(page, '[data-testid="context-layer"] .env-menu', 'context-preview'),
    ).toBe(true);
    // Its first row is under the pointer, as a context menu's is anywhere.
    const opened = (await menu.boundingBox())!;
    expect(Math.abs(opened.x - (box.x + 60))).toBeLessThan(12);
    expect(Math.abs(opened.y - (box.y + 30))).toBeLessThan(12);
    // The page stays in reach and keeps its scroll.
    await expect(page.getByTestId('outside')).not.toHaveAttribute('aria-hidden');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
      'hidden',
    );
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
    // As the page scrolls, the menu stays where it opened on the region, not on the window.
    const scrolled = await page.evaluate(async () => {
      const before = scrollY;
      scrollBy(0, 80);
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
      return scrollY - before;
    });
    expect(scrolled).toBeGreaterThan(40);
    const moved = (await region.boundingBox())!;
    await expect
      .poll(async () => (await menu.boundingBox())!.y - moved.y)
      .toBeCloseTo(opened.y - box.y, 0);
    // A press outside the container leaves it open; Esc on the menu closes it.
    await page.getByTestId('outside').click();
    await expect(menu).toBeVisible();
    await menu.dispatchEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    await expect(menu).toHaveCount(0);
  });

  test('a contained notice arrives and leaves with its motion, and stays under the pointer', async ({
    page,
  }) => {
    await page.goto(preview);
    const layer = page.getByTestId('layer');
    await page.getByRole('button', { name: 'Notify' }).click();
    const notice = layer.locator('.env-toast', { hasText: 'Invitation sent.' });
    await expect(notice).toBeVisible();
    // It came in from its starting style, which it no longer holds.
    await expect(notice).not.toHaveAttribute('data-starting-style');
    await expect
      .poll(() => notice.evaluate((element) => getComputedStyle(element).opacity))
      .toBe('1');
    // Under the pointer its time stops: past its 1.2 s it is still there.
    await notice.hover();
    await page.waitForTimeout(1800);
    await expect(notice).toBeVisible();
    // Once the pointer leaves, it goes, taking its ending style before it is removed.
    await layer.evaluate((element) => {
      new MutationObserver((records) => {
        if (records.some((record) => (record.target as Element).hasAttribute('data-ending-style')))
          element.dataset.ended = '';
      }).observe(element, { subtree: true, attributeFilter: ['data-ending-style'] });
    });
    await page.mouse.move(1, 1);
    await expect(notice).toHaveCount(0);
    await expect(layer).toHaveAttribute('data-ended', '');
  });

  test('F6 leaves the contained toasts alone @engines', async ({ page }) => {
    await page.goto(preview);
    await expect(page.getByTestId('layer').getByText('Changes saved.')).toBeVisible();
    await page.getByTestId('outside').focus();
    await page.keyboard.press('F6');
    await expect(page.getByTestId('outside')).toBeFocused();
  });

  test('a menubar switches menus in it, one open at a time', async ({ page }) => {
    await page.goto(preview);
    const layer = page.getByTestId('menubar-layer');
    const bar = page.getByRole('menubar', { name: 'Application menu' });
    await bar.getByRole('menuitem', { name: 'File' }).click();
    await expect(layer.getByRole('menu', { name: 'File' })).toBeVisible();
    // Another menu opening in its place closes it, though the press came from outside the layer.
    await bar.getByRole('menuitem', { name: 'Edit' }).hover();
    await expect(layer.getByRole('menu', { name: 'Edit' })).toBeVisible();
    await expect(layer.getByRole('menu', { name: 'File' })).toHaveCount(0);
  });

  test('Panes open as a sheet in it leave the page in use', async ({ page }) => {
    await page.goto(preview);
    const sheet = page.getByTestId('panes-preview').getByRole('dialog', { name: 'Details' });
    await expect(sheet).toBeVisible();
    // Not modal: nothing on the page turns inert, focus stays out and Tab leaves the sheet.
    await expect(sheet).not.toHaveAttribute('aria-modal');
    expect(await page.evaluate(() => document.querySelectorAll('[inert]').length)).toBe(0);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.getByTestId('outside').focus();
    await expect(page.getByTestId('outside')).toBeFocused();
    await sheet.getByRole('button', { name: 'Edit details' }).focus();
    await page.keyboard.press('Tab');
    await expect(sheet.getByRole('button', { name: 'Edit details' })).not.toBeFocused();
    await expect(sheet).toBeVisible();
  });
});
