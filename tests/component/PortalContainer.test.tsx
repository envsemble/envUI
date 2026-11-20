import { describe, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/PortalContainer.fixture.tsx';
import {
  box,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  shown,
  stopTimers,
  waitOnRealTime,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

function insidePreview(selector: string, preview = 'preview') {
  const region = page.getByTestId(preview).element().getBoundingClientRect();
  const found = document.querySelector(selector)!.getBoundingClientRect();
  return (
    found.width > 0 &&
    found.left >= region.left - 1 &&
    found.right <= region.right + 1 &&
    found.top >= region.top - 1 &&
    found.bottom <= region.bottom + 1
  );
}

const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isGone = (locator: Locator) => expect.poll(() => locator.elements().length).toBe(0);
const toasts = (layer: Locator, text?: string) =>
  [...layer.element().querySelectorAll('.env-toast')].filter(
    (toast) => text === undefined || toast.textContent?.includes(text),
  );

const pastContainedOpeningFocusWindow = 600;

describe('PortalContainer, contained', () => {
  test(
    'first in the file, as the module loads once: a contained notice shown before its code has loaded arrives once it has',
    { tags: ['once'] },
    async () => {
      await commands.holdModule('ContainedToastRoot');
      try {
        mount(fixture);
        const layer = page.getByTestId('layer');
        await commands.moduleRequested('ContainedToastRoot');
        await isShown(layer.getByRole('menu', { name: 'Actions' }));
        expect(toasts(layer)).toHaveLength(0);
        await commands.releaseModule('ContainedToastRoot');
        await isShown(layer.getByText('Changes saved.'));
        await page.getByRole('button', { name: 'Notify' }).click();
        await expect.poll(() => toasts(layer, 'Invitation sent.')).toHaveLength(1);
      } finally {
        await commands.unrouteModule('ContainedToastRoot');
      }
    },
  );

  test(
    'overlays open in the container, without locking the page or taking focus',
    { tags: ['engines'] },
    async () => {
      mount(fixture);
      const layer = page.getByTestId('layer');
      await isShown(layer.getByRole('menu', { name: 'Actions' }));
      await expect
        .poll(() => layer.getByRole('tooltip').query()?.textContent)
        .toBe('Refresh members');
      await isShown(
        page.getByTestId('dialog-layer').getByRole('dialog', { name: 'Rename project' }),
      );
      await isShown(layer.getByText('Changes saved.'));
      for (const selector of ['.env-menu', '.env-tooltip', '.env-toast'])
        expect(insidePreview(selector), selector).toBe(true);
      expect(insidePreview('.env-dialog', 'dialog-preview')).toBe(true);
      await waitOnRealTime(pastContainedOpeningFocusWindow);
      expect(document.activeElement).toBe(document.body);
      const firstItem = layer.getByRole('menuitem').elements()[0] as HTMLElement;
      firstItem.focus();
      await expect.element(page.elementLocator(firstItem)).toHaveFocus();
      firstItem.blur();
      await expect.element(page.getByTestId('outside')).not.toHaveAttribute('aria-hidden');
      expect(getComputedStyle(document.documentElement).overflow).not.toBe('hidden');
      const outside = box(page.getByTestId('outside'));
      await mouse.move(outside.x + 4, outside.y + 4);
      await mouse.wheel(0, 400);
      await expect.poll(() => scrollY).toBeGreaterThan(0);
    },
  );

  test(
    'a press or Esc outside keeps them open, and the trigger closes its popup',
    { tags: ['engines'] },
    async () => {
      mount(fixture);
      const layer = page.getByTestId('layer');
      const menu = layer.getByRole('menu', { name: 'Actions' });
      await isShown(menu);
      await page.getByTestId('outside').click();
      await keyboard.press('Escape');
      await isShown(menu);
      await isShown(layer.getByRole('tooltip'));
      const dialogLayer = page.getByTestId('dialog-layer');
      await isShown(dialogLayer.getByRole('dialog', { name: 'Rename project' }));
      await dialogLayer.getByRole('button', { name: 'Cancel' }).click();
      await isGone(dialogLayer.getByRole('dialog'));
      expect(shown(menu)).toBe(true);
      await page.getByRole('button', { name: 'Actions' }).click();
      await isGone(menu);
      await page.getByRole('button', { name: 'Refresh members' }).hover();
      await mouse.move(1, 1);
      await isGone(layer.getByRole('tooltip'));
    },
  );

  test(
    'Esc on a combobox or picker field, the trigger outside the container, closes its popup',
    { tags: ['engines'] },
    async () => {
      mount(fixture);
      const list = page.getByTestId('combobox-layer').getByRole('listbox');
      await isShown(list);
      (page.getByRole('combobox', { name: 'Owner' }).element() as HTMLElement).focus();
      await keyboard.press('Escape');
      await isGone(list);
      const field = page.getByRole('combobox', { name: 'Due' });
      await field.click();
      const popup = page.getByTestId('picker-layer').getByRole('dialog');
      await isShown(popup);
      (field.element() as HTMLElement).focus();
      expect(shown(popup)).toBe(true);
      await keyboard.press('Escape');
      await isGone(popup);
    },
  );

  test(
    'a context menu opens at the pointer in the container, without hiding or locking the page',
    { tags: ['engines'] },
    async () => {
      mount(fixture);
      const region = page.getByTestId('context-region');
      region.element().scrollIntoView({ block: 'nearest' });
      const regionBox = box(region);
      await mouse.click(regionBox.x + 60, regionBox.y + 30, { button: 'right' });
      const menu = page
        .getByTestId('context-layer')
        .getByRole('menu', { name: 'Document actions' });
      await isShown(menu);
      expect(insidePreview('[data-testid="context-layer"] .env-menu', 'context-preview')).toBe(
        true,
      );
      const opened = box(menu);
      expect(Math.abs(opened.x - (regionBox.x + 60))).toBeLessThan(12);
      expect(Math.abs(opened.y - (regionBox.y + 30))).toBeLessThan(12);
      await expect.element(page.getByTestId('outside')).not.toHaveAttribute('aria-hidden');
      expect(getComputedStyle(document.documentElement).overflow).not.toBe('hidden');
      expect(getComputedStyle(document.body).overflow).not.toBe('hidden');
      const before = scrollY;
      scrollBy(0, 80);
      await nextFrames();
      expect(scrollY - before).toBeGreaterThan(40);
      const moved = box(region);
      await expect.poll(() => box(menu).y - moved.y).toBeCloseTo(opened.y - regionBox.y, 0);
      await page.getByTestId('outside').click();
      expect(shown(menu)).toBe(true);
      menu
        .element()
        .dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
        );
      await isGone(menu);
    },
  );

  test('a contained notice arrives and leaves with its motion, and stays under the pointer', async () => {
    mount(fixture);
    const layer = page.getByTestId('layer');
    stopTimers('Date');
    await page.getByRole('button', { name: 'Notify' }).click();
    await expect.poll(() => toasts(layer, 'Invitation sent.')).toHaveLength(1);
    const notice = page.elementLocator(toasts(layer, 'Invitation sent.')[0]!);
    await expect.element(notice).not.toHaveAttribute('data-starting-style');
    await expect.poll(() => getComputedStyle(notice.element()).opacity).toBe('1');
    await notice.hover();
    await passTime(1800);
    expect(notice.element().isConnected).toBe(true);
    let ended = false;
    const observer = new MutationObserver((records) => {
      if (records.some((record) => (record.target as Element).hasAttribute('data-ending-style')))
        ended = true;
    });
    observer.observe(layer.element(), { subtree: true, attributeFilter: ['data-ending-style'] });
    try {
      await mouse.move(1, 1);
      await expect
        .poll(async () => {
          await passTime(100);
          return toasts(layer, 'Invitation sent.');
        })
        .toHaveLength(0);
      expect(ended).toBe(true);
    } finally {
      observer.disconnect();
    }
  });

  test('F6 leaves the contained toasts alone', { tags: ['engines'] }, async () => {
    mount(fixture);
    const layer = page.getByTestId('layer');
    await isShown(layer.getByText('Changes saved.'));
    (page.getByTestId('outside').element() as HTMLElement).focus();
    let prevented: boolean | undefined;
    window.addEventListener(
      'keydown',
      (event) => setTimeout(() => (prevented = event.defaultPrevented)),
      { once: true },
    );
    await keyboard.press('F6');
    await expect.poll(() => prevented).toBe(false);
    expect(layer.element().querySelector(':focus')).toBeNull();
  });

  test('a menubar switches menus in it, one open at a time', async () => {
    mount(fixture);
    const layer = page.getByTestId('menubar-layer');
    const bar = page.getByRole('menubar', { name: 'Application menu' });
    await bar.getByRole('menuitem', { name: 'File' }).click();
    await isShown(layer.getByRole('menu', { name: 'File' }));
    await bar.getByRole('menuitem', { name: 'Edit' }).hover();
    await isShown(layer.getByRole('menu', { name: 'Edit' }));
    await isGone(layer.getByRole('menu', { name: 'File' }));
  });
});
