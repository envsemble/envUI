import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Primitives.fixture.tsx';
import { css, keyboard, passTime, shown, stopTimers } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

// tests/fixture/Primitives.fixture.tsx mounts its toolbars among envUI's primitives.
beforeEach(() => {
  mount(fixture);
});

const focus = (element: Element) => (element as HTMLElement).focus();
/** The tooltip that shows a name, if one is in the page. */
const tooltip = (name: string) =>
  [...document.querySelectorAll('.env-tooltip')].find((each) => each.textContent?.includes(name));
const keys = (element: Element | undefined) =>
  [...(element?.querySelectorAll('.env-kbd') ?? [])].map((key) => key.textContent);

test('a toolbar is one tab stop whose arrow keys move between enabled controls, besides a button of its own', async () => {
  const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
  await expect.element(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
  focus(toolbar.getByRole('button', { name: 'Bold' }).element());
  await keyboard.press('ArrowRight');
  await expect.element(toolbar.getByRole('button', { name: 'Italic' })).toHaveFocus();
  // The disabled Underline leaves the arrow keys' path.
  await keyboard.press('ArrowRight');
  await expect.element(toolbar.getByRole('button', { name: 'Undo' })).toHaveFocus();
  // The application's own IconButton is no toolbar item: the arrows pass it.
  await keyboard.press('ArrowRight');
  await expect.element(toolbar.getByRole('link', { name: 'Help' })).toHaveFocus();
  await keyboard.press('ArrowRight');
  await expect.element(toolbar.getByRole('button', { name: 'Bold' })).toHaveFocus();

  focus(toolbar.getByRole('button', { name: 'Italic' }).element());
  await keyboard.press('ArrowRight');
  await expect.element(toolbar.getByRole('button', { name: 'Undo' })).toHaveFocus();
  focus(page.getByRole('button', { name: 'Before toolbar' }).element());
  // Tab reaches the control that holds the tab stop, then the application's own button, which
  // keeps a stop of its own, then leaves.
  const stops: string[] = [];
  for (let index = 0; index < 3; index += 1) {
    await keyboard.press('Tab');
    stops.push(
      document.activeElement?.getAttribute('aria-label') ??
        document.activeElement?.textContent ??
        '',
    );
  }
  expect(stops).toEqual(['Undo', 'Toolbar settings', 'After toolbar']);
  await keyboard.press('Shift+Tab');
  await keyboard.press('Shift+Tab');
  await expect.element(toolbar.getByRole('button', { name: 'Undo' })).toHaveFocus();
  await keyboard.press('Shift+Tab');
  await expect.element(page.getByRole('button', { name: 'Before toolbar' })).toHaveFocus();
});

test('a toolbar names its buttons by label, shows a tooltip with the shortcut and reports pressed', async () => {
  const bold = page.getByRole('button', { name: 'Bold' });
  await expect.element(bold).toHaveAttribute('aria-pressed', 'false');
  await expect.element(bold).not.toHaveAttribute('title');
  focus(bold.element());
  await expect.poll(() => keys(tooltip('Bold'))).toEqual(['Ctrl', 'B']);
  await keyboard.press('Enter');
  await expect.element(bold).toHaveAttribute('aria-pressed', 'true');
  // The selected fill eases in.
  await expect.poll(() => css(bold, 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
  // A sequence shows its keys, without the attribute.
  focus(page.getByRole('button', { name: 'Redo' }).element());
  await expect.poll(() => keys(tooltip('Redo'))).toEqual(['Ctrl', 'K', 'Ctrl', 'Z']);
});

test("a toolbar closes a button's tooltip as the root or a group disables it", async () => {
  for (const name of ['Redo', 'Strike through']) {
    const button = page.getByRole('button', { name, exact: true });
    await button.hover();
    await expect
      .poll(() => tooltip(name) !== undefined && shown(page.elementLocator(tooltip(name)!)))
      .toBe(true);
    // The toolbar turns busy without the pointer moving.
    page
      .getByRole('button', { name: 'Toggle busy' })
      .element()
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await expect.element(button).toBeDisabled();
    await expect.poll(() => tooltip(name)).toBeUndefined();
    // Enabled again, for the next case.
    page
      .getByRole('button', { name: 'Toggle busy' })
      .element()
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await expect.element(button).toBeEnabled();
  }
});

test('a toolbar opens its tooltips after tooltipDelay, at once with 0', async () => {
  // The clock stands still but for a millisecond, so a tooltip that shows came with no wait: the
  // default would wait 400 ms.
  stopTimers();
  for (const name of ['Instant button', 'Instant link']) {
    await page.getByRole('toolbar', { name: 'Instant names' }).getByLabelText(name).hover();
    await passTime(1);
    await expect
      .poll(() => tooltip(name) !== undefined && shown(page.elementLocator(tooltip(name)!)))
      .toBe(true);
  }
});
