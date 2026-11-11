import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Stacking.fixture.tsx';
import { box, keyboard, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

/** Whether nothing between an element and the root makes a stacking context of its own. */
function inRootContext(node: Element) {
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
}

const zIndex = (element: Element) => Number(getComputedStyle(element).zIndex);
/** The layer, by its class, that holds an element. */
const layerOf = (element: Element, className: string) => element.closest(`.${className}`)!;

test(
  'a menu and a tooltip open over a modal dialog, above the notices layer',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    await page.getByRole('button', { name: 'Open the layered dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Layered dialog' });
    await expect.element(dialog).toBeVisible();
    const backdrop = [...document.querySelectorAll('.env-dialog-backdrop')].find((each) => {
      const { width, height } = each.getBoundingClientRect();
      return width > 0 && height > 0;
    })!;
    const dialogLayer = layerOf(dialog.element(), 'env-dialog-positioner');

    // A menu inside the dialog: its items are what a press over them reaches.
    await dialog.getByRole('button', { name: 'Actions' }).click();
    const menu = page.getByRole('menu', { name: 'Dialog actions' });
    await expect.element(menu).toBeVisible();
    const menuLayer = layerOf(menu.element(), 'env-menu-positioner');
    for (const layer of [backdrop, dialogLayer, menuLayer]) expect(inRootContext(layer)).toBe(true);
    expect(zIndex(backdrop)).toBeLessThan(zIndex(dialogLayer));
    expect(zIndex(dialogLayer)).toBeLessThan(zIndex(menuLayer));
    const item = box(menu.getByRole('menuitem', { name: 'Archive' }));
    expect(
      document
        .elementFromPoint(item.x + item.width / 2, item.y + item.height / 2)
        ?.closest('[role="menuitem"]')?.textContent,
    ).toBe('Archive');
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);
    await expect.element(dialog).toBeVisible();

    // A notice shown from the dialog waits until it closes (Toast's tests cover that), but its
    // layer still stacks over the dialog's.
    await dialog.getByRole('button', { name: 'Show a notice' }).click();
    const notice = page.getByText('Saved over the dialog');
    await expect.poll(() => notice.query()).not.toBeNull();
    await expect.poll(() => shown(notice)).toBe(false);
    const toastLayer = layerOf(notice.element(), 'env-toast-viewport');
    expect(inRootContext(toastLayer)).toBe(true);
    expect(zIndex(toastLayer)).toBeGreaterThan(zIndex(dialogLayer));

    // A tooltip in the dialog stacks over the dialog and the notice.
    await dialog.getByRole('button', { name: 'Hover for a tooltip' }).hover();
    const tooltip = page.getByText('Explains the control');
    await expect.element(tooltip).toBeVisible();
    const tooltipLayer = layerOf(tooltip.element(), 'env-tooltip-positioner');
    expect(inRootContext(tooltipLayer)).toBe(true);
    expect(zIndex(tooltipLayer)).toBeGreaterThan(zIndex(toastLayer));
    expect(zIndex(tooltipLayer)).toBeGreaterThan(zIndex(dialogLayer));
  },
);
