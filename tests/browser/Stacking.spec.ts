import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=stacking`;

/** Whether nothing between an element and the root makes a stacking context of its own. */
function inRootContext(element: Locator) {
  return element.evaluate((node) => {
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (
        (style.position !== 'static' && style.zIndex !== 'auto') ||
        style.opacity !== '1' ||
        style.transform !== 'none' ||
        style.filter !== 'none' ||
        style.isolation === 'isolate' ||
        /\b(?:paint|layout|strict|content)\b/.test(style.contain)
      )
        return false;
    }
    return true;
  });
}

const zIndex = (element: Locator) =>
  element.evaluate((node) => Number(getComputedStyle(node).zIndex));

test(
  'a menu, a notice and a tooltip open over a modal dialog',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(fixture);
    await page.getByRole('button', { name: 'Open the layered dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Layered dialog' });
    await expect(dialog).toBeVisible();
    const backdrop = page.locator('.env-dialog-backdrop').filter({ visible: true });
    const dialogLayer = page.locator('.env-dialog-positioner').filter({ has: dialog });

    // A menu inside the dialog: its items are what a press over them reaches.
    await dialog.getByRole('button', { name: 'Actions' }).click();
    const menu = page.getByRole('menu', { name: 'Dialog actions' });
    await expect(menu).toBeVisible();
    const menuLayer = page.locator('.env-menu-positioner').filter({ has: menu });
    for (const layer of [backdrop, dialogLayer, menuLayer])
      expect(await inRootContext(layer)).toBe(true);
    expect(await zIndex(backdrop)).toBeLessThan(await zIndex(dialogLayer));
    expect(await zIndex(dialogLayer)).toBeLessThan(await zIndex(menuLayer));
    const item = menu.getByRole('menuitem', { name: 'Archive' });
    const box = (await item.boundingBox())!;
    expect(
      await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest('[role="menuitem"]')?.textContent,
        { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      ),
    ).toBe('Archive');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(dialog).toBeVisible();

    // A notice shown from the dialog stacks over it.
    await dialog.getByRole('button', { name: 'Show a notice' }).click();
    const notice = page.locator('.env-toast-message', { hasText: 'Saved over the dialog' });
    await expect(notice).toBeVisible();
    const toastLayer = page.locator('.env-toast-viewport').filter({ has: notice });
    expect(await inRootContext(toastLayer)).toBe(true);
    expect(await zIndex(toastLayer)).toBeGreaterThan(await zIndex(dialogLayer));

    // A tooltip in the dialog stacks over the dialog and the notice.
    await dialog.getByRole('button', { name: 'Hover for a tooltip' }).hover();
    const tooltip = page.getByText('Explains the control');
    await expect(tooltip).toBeVisible();
    const tooltipLayer = page.locator('.env-tooltip-positioner').filter({ has: tooltip });
    expect(await inRootContext(tooltipLayer)).toBe(true);
    expect(await zIndex(tooltipLayer)).toBeGreaterThan(await zIndex(toastLayer));
    expect(await zIndex(tooltipLayer)).toBeGreaterThan(await zIndex(dialogLayer));
  },
);
