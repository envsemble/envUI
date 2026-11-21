import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Direction.fixture.tsx';
import { keyboard } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const focus = (element: Element) => (element as HTMLElement).focus();

test("the arrow keys turn as soon as the region's dir changes, with focus inside", async () => {
  const region = page.getByTestId('direction-switch');
  const toolbar = region.getByRole('toolbar', { name: 'Switching' });
  focus(toolbar.getByRole('button', { name: 'First' }).element());
  region.element().setAttribute('dir', 'rtl');
  await keyboard.press('ArrowLeft');
  await expect.element(toolbar.getByRole('button', { name: 'Second' })).toHaveFocus();
});

test("a toolbar's direction stays with its keyboard, not the parts inside it", () => {
  const outside = page.getByTestId('base-direction-outside').element().textContent;
  expect(page.getByTestId('base-direction-inside').element().textContent).toBe(outside);
});

test('in a right-to-left region the arrow keys follow the direction from the attribute and from the provider', async () => {
  for (const source of ['attribute', 'provider']) {
    const region = page.getByTestId(`direction-${source}`);
    const handle = region.getByRole('separator', { name: 'Resize pane' });
    focus(handle.element());
    await keyboard.press('ArrowLeft');
    await expect.element(handle).toHaveAttribute('aria-valuenow', '210');
    const swatches = region.getByRole('listbox', { name: 'Swatches' }).getByRole('option');
    focus(swatches.nth(0).element());
    await keyboard.press('ArrowLeft');
    await expect.element(swatches.nth(1)).toHaveFocus();
    await keyboard.press('ArrowRight');
    await expect.element(swatches.nth(0)).toHaveFocus();
    const toolbar = region.getByRole('toolbar', { name: 'Formatting' });
    focus(toolbar.getByRole('button', { name: 'Bold' }).element());
    await keyboard.press('ArrowLeft');
    await expect.element(toolbar.getByRole('button', { name: 'Italic' })).toHaveFocus();
    await keyboard.press('ArrowRight');
    await expect.element(toolbar.getByRole('button', { name: 'Bold' })).toHaveFocus();
    const view = region.getByRole('radiogroup', { name: 'View' });
    focus(view.getByRole('radio', { name: 'List' }).element());
    await keyboard.press('ArrowLeft');
    await expect.element(view.getByRole('radio', { name: 'Board' })).toHaveFocus();
    const menubar = region.getByRole('menubar', { name: 'Application' });
    focus(menubar.getByRole('menuitem', { name: 'File' }).element());
    await keyboard.press('ArrowLeft');
    await expect.element(menubar.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  }
});
