import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Direction.fixture.tsx';
import { keyboard } from './Browser.ts';
import { mount } from './Mount.tsx';

// The direction check: components whose keyboard or placement follows the text direction read it
// from EnvUIProvider's dir, or else from the dir at their element. tests/fixture/Direction.fixture.tsx
// mounts them in RTL both ways; as each batch moves a component onto useDirection, it adds it.

beforeEach(() => {
  mount(fixture);
});

const focus = (element: Element) => (element as HTMLElement).focus();

test("the arrow keys turn as soon as the region's dir changes, with focus inside", async () => {
  const region = page.getByTestId('direction-switch');
  const toolbar = region.getByRole('toolbar', { name: 'Switching' });
  focus(toolbar.getByRole('button', { name: 'First' }).element());
  region.element().setAttribute('dir', 'rtl');
  // The first key press after the change already moves the right-to-left way.
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
    const grid = region.getByRole('grid');
    focus(grid.getByRole('gridcell', { name: '1', exact: true }).element());
    await keyboard.press('ArrowLeft');
    await expect.element(grid.getByRole('gridcell', { name: '2', exact: true })).toHaveFocus();
    // Base UI's toolbar knows only its own direction provider: Toolbar.Root tells it. In LTR,
    // ArrowLeft from the first button would loop to the last.
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
    const tabs = region.getByRole('tablist', { name: 'Sections' });
    focus(tabs.getByRole('tab', { name: 'Overview' }).element());
    await keyboard.press('ArrowLeft');
    await expect.element(tabs.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    const menubar = region.getByRole('menubar', { name: 'Application' });
    focus(menubar.getByRole('menuitem', { name: 'File' }).element());
    await keyboard.press('ArrowLeft');
    await expect.element(menubar.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  }
});
