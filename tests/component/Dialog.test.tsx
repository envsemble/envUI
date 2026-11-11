import { expect, test } from 'vitest';
import { cdp, page, server, type Locator } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as dialogs from '../fixture/Dialog.fixture.tsx';
import * as popovers from '../fixture/Popover.fixture.tsx';
import { box, css, keyboard, mouse, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
const noDialogs = () => expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
/** The theme of the nearest themed ancestor of an element. */
const themeOf = (locator: Locator) =>
  locator.element().closest('[data-env-theme]')?.getAttribute('data-env-theme');

test('popovers size to their content, from 12 rem up to their width, and stay in a narrow window', async () => {
  mount(popovers);
  const scope = page.getByTestId('popover-light');
  await scope.getByRole('button', { name: 'Details light' }).click();
  const details = page.getByRole('dialog', { name: 'Document details' });
  await isShown(details);
  // A title and a short line: narrower than md's 20 rem, never under 12 rem.
  const short = box(details).width;
  expect(short).toBeGreaterThanOrEqual(192);
  expect(short).toBeLessThan(320);
  await keyboard.press('Escape');
  await isHidden(details);
  await page.viewport(300, 700);
  await scope.getByRole('button', { name: 'Rename light' }).click();
  const form = page.getByRole('dialog', { name: 'Rename light' });
  await isShown(form);
  await expect
    .poll(() => {
      const { x, width } = box(form);
      return x >= 0 && x + width <= 300;
    })
    .toBe(true);
});

test('dialogs open wide for heavy content and near the top for search-like tasks', async () => {
  mount(dialogs);
  await page.getByRole('button', { name: 'Open wide dialog' }).click();
  const wide = page.getByRole('dialog', { name: 'Wide details' });
  await isShown(wide);
  await expect.poll(() => box(wide).width).toBeCloseTo(44 * 16, 0);
  await keyboard.press('Escape');
  await isHidden(wide);

  await page.getByRole('button', { name: 'Open top dialog' }).click();
  const top = page.getByRole('dialog', { name: 'Search plans' });
  await isShown(top);
  await isShown(top.getByRole('button', { name: 'Close' }));
  await expect.poll(() => box(top).y).toBeLessThan(Math.min(innerHeight * 0.12, 96) + 8);
  await expect.poll(() => box(top).width).toBeCloseTo(28 * 16, 0);
});

/** Opens a dialog from its trigger and waits for it to show. */
async function open(trigger: string, title: string) {
  await page.getByRole('button', { name: trigger }).click();
  const panel = page.getByRole('dialog', { name: title });
  await isShown(panel);
  return panel;
}

async function close() {
  await keyboard.press('Escape');
  await noDialogs();
}

test('right panels keep their width beside the page and fill a narrow window', async () => {
  mount(dialogs);
  for (const [viewport, standard, wide] of [
    [1440, 24 * 16, 44 * 16],
    [600, 24 * 16, 600],
    [390, 390, 390],
  ] as const) {
    await page.viewport(viewport, 800);
    const panel = await open('Open panel', 'Report details');
    await expect.poll(() => box(panel).width).toBeCloseTo(standard, 0);
    // Once it has slid in, the panel ends at the window's edge.
    await expect.poll(() => box(panel).x + box(panel).width).toBeCloseTo(viewport, 0);
    await close();
    const widePanel = await open('Open wide panel', 'Wide report details');
    await expect.poll(() => box(widePanel).width).toBeCloseTo(wide, 0);
    await close();
  }
  // Across the whole width, the panel needs no border at its start.
  const phonePanel = await open('Open panel', 'Report details');
  expect(css(phonePanel, 'border-left-width')).toBe('0px');
});

test('a panel across the whole width keeps clear of the safe areas on both sides', async (context) => {
  // Only one engine emulates safe-area insets.
  if (server.browser !== 'chromium') context.skip();
  mount(dialogs);
  const session = cdp();
  await session.send('Emulation.setSafeAreaInsetsOverride', {
    insets: { top: 0, left: 44, bottom: 21, right: 44 },
  });
  try {
    for (const [viewport, trigger, title] of [
      [390, 'Open panel', 'Report details'],
      [600, 'Open wide panel', 'Wide report details'],
    ] as const) {
      await page.viewport(viewport, 800);
      const panel = await open(trigger, title);
      await expect.poll(() => box(panel).width).toBeCloseTo(viewport, 0);
      expect(css(panel, 'padding-left')).toBe('44px');
      expect(css(panel, 'padding-right')).toBe('44px');
      await close();
    }
  } finally {
    await session.send('Emulation.setSafeAreaInsetsOverride', { insets: {} });
  }
});

test(
  'Dialog traps and restores focus, its nested Select retains the dark theme, and its actions close it',
  { tags: ['engines'] },
  async () => {
    mount(dialogs);
    const trigger = page.getByRole('button', { name: 'Open dark dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Dark theme dialog', exact: true });
    await isShown(dialog);
    await expect
      .element(dialog)
      .toHaveAccessibleDescription('A nested theme retained in a portal.');
    await expect.poll(() => themeOf(dialog)).toBe('dark');
    const firstField = dialog.getByRole('textbox', { name: 'Dialog first field', exact: true });
    await expect.element(firstField).toHaveFocus();
    await keyboard.press('Shift+Tab');
    await expect
      .element(dialog.getByRole('button', { name: 'Save dialog', exact: true }))
      .toHaveFocus();
    await keyboard.press('Tab');
    await expect.element(firstField).toHaveFocus();

    await dialog.getByRole('combobox', { name: 'Dialog choice', exact: true }).click();
    const option = page.getByRole('option', { name: 'Boreal', exact: true });
    await isShown(option);
    await expect.poll(() => themeOf(option)).toBe('dark');
    await keyboard.press('Escape');
    await expect.poll(() => page.getByRole('listbox').elements().length).toBe(0);
    expect(shown(dialog)).toBe(true);
    await keyboard.press('Escape');
    await noDialogs();
    await expect.poll(() => page.getByTestId('dialog-status').element().textContent).toBe('closed');
    await expect.element(trigger).toHaveFocus();

    // Its dismissal action and a controlled action close it and return focus.
    for (const action of ['Cancel', 'Save dialog']) {
      await trigger.click();
      await page.getByRole('dialog').getByRole('button', { name: action, exact: true }).click();
      await noDialogs();
      await expect.element(trigger).toHaveFocus();
    }
  },
);

test('a pending Dialog cannot be dismissed until the work finishes', async () => {
  mount(adoption);
  await page.getByRole('button', { name: 'Open pending dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Save project' });
  await dialog.getByRole('button', { name: 'Toggle pending' }).click();
  // The built-in close button and a DialogClose turn off, and the last action shows the work.
  await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect.element(dialog.getByRole('button', { name: 'Discard' })).toBeDisabled();
  await expect
    .element(dialog.getByRole('button', { name: 'Save' }))
    .toHaveAttribute('aria-busy', 'true');
  await keyboard.press('Escape');
  await mouse.click(5, 5);
  // Past the frames a dismissal would take.
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(shown(dialog)).toBe(true);
  await dialog.getByRole('button', { name: 'Toggle pending' }).click();
  await expect.element(dialog.getByRole('button', { name: 'Discard' })).toBeEnabled();
  await expect
    .element(dialog.getByRole('button', { name: 'Save' }))
    .not.toHaveAttribute('aria-busy');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect.poll(() => dialog.elements().length).toBe(0);
});
