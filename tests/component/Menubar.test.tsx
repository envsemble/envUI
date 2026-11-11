import { beforeEach, expect, test } from 'vitest';
import { page, server, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Menubar.fixture.tsx';
import { addStyle, box, collectErrors, keyboard, mouse, nextFrames, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

let errors: string[] = [];

beforeEach(() => {
  errors = collectErrors();
});

const menubar = () => page.getByRole('menubar', { name: 'Application menu' });
const trigger = (name: string) => menubar().getByRole('menuitem', { name, exact: true });
const menu = (name: string) => page.getByRole('menu', { name, exact: true });
const note = () => page.getByRole('textbox', { name: 'Note' });
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const accessKeysShown = () => menubar().element().hasAttribute('data-access-keys-shown');
const noMenus = () => expect.poll(() => page.getByRole('menu').elements().length).toBe(0);

/**
 * Moves focus to a menu item once the menu holds focus: a menu takes focus as it opens, which would
 * otherwise race with the move.
 */
async function focusItem(menu: Locator, item: Locator) {
  await expect.poll(() => menu.query()?.contains(document.activeElement)).toBe(true);
  (item.element() as HTMLElement).focus();
  await isFocused(item);
}

/** The note's selection, from its start to its end. */
const selection = () => {
  const field = note().element() as HTMLTextAreaElement;
  return [field.selectionStart, field.selectionEnd];
};
const unselect = () => (note().element() as HTMLTextAreaElement).setSelectionRange(0, 0);

test('menubar menus open below their trigger and switch on hover and with the arrow keys', async () => {
  mount(fixture);
  const file = trigger('File');
  const before = box(file);
  const overflow = getComputedStyle(document.documentElement).overflow;
  await file.click();
  const fileMenu = menu('File');
  await isShown(fileMenu);
  await expect.element(file).toHaveAttribute('aria-expanded', 'true');
  await expect.element(file).toHaveAttribute('data-popup-open', '');
  // Small text triggers sit tightly in a row.
  expect(before.height).toBeCloseTo(32, 0);
  const edit = trigger('Edit');
  const editBox = box(edit);
  expect(editBox.x - (before.x + before.width)).toBeLessThanOrEqual(4);
  // Below the trigger, aligned to its start, with a small offset.
  await expect
    .poll(() => {
      const popup = box(fileMenu);
      return [Math.round(popup.x - before.x), Math.round(popup.y - (before.y + before.height))];
    })
    .toEqual([0, 4]);
  // Opening a menu neither locks scrolling nor moves the page.
  expect(getComputedStyle(document.documentElement).overflow).toBe(overflow);
  expect(box(file).x).toBe(before.x);
  await mouse.wheel(0, 200);
  await expect.poll(() => window.scrollY).toBeGreaterThan(0);
  window.scrollTo(0, 0);

  // Once a menu is open, hovering another trigger switches to its menu. The pointer moves in steps,
  // as a person's does.
  await mouse.move(editBox.x + 2, editBox.y + editBox.height / 2, { steps: 4 });
  await mouse.move(editBox.x + editBox.width / 2, editBox.y + editBox.height / 2, { steps: 4 });
  const editMenu = menu('Edit');
  await isShown(editMenu);
  await isHidden(fileMenu);
  // The arrow keys move between menus. Base UI opens the next menu as its trigger takes keyboard
  // focus (:focus-visible), which one engine does not report for synthesized keys; there the test
  // checks that focus moves to the next trigger.
  const selectAll = editMenu.getByRole('menuitem', { name: 'Select all' });
  await isShown(selectAll);
  await focusItem(editMenu, selectAll);
  await keyboard.press('ArrowRight');
  const viewMenu = menu('View');
  if (server.browser === 'firefox') {
    await isFocused(trigger('View'));
    await keyboard.press('ArrowLeft');
    await isFocused(edit);
    expect(errors).toEqual([]);
    return;
  }
  await isShown(viewMenu);
  await isHidden(editMenu);
  await expect.poll(text('menubar-state')).toBe('wrap view open');
  await keyboard.press('ArrowLeft');
  await isShown(editMenu);
  await isHidden(viewMenu);
  await expect.poll(text('menubar-state')).toBe('wrap view closed');
  await keyboard.press('Escape');
  await isHidden(editMenu);
  await isFocused(edit);
  expect(errors).toEqual([]);
});

test('a menubar menu with defaultOpen starts open and then closes as usual', async () => {
  mount(fixture, { search: 'open' });
  const edit = trigger('Edit');
  const editMenu = menu('Edit');
  await isShown(editMenu);
  await expect.element(edit).toHaveAttribute('aria-expanded', 'true');
  await isShown(editMenu.getByRole('menuitem', { name: 'Select all' }));
  // Uncontrolled, it closes on Escape and opens again from its trigger.
  await expect.poll(() => editMenu.query()?.contains(document.activeElement)).toBe(true);
  await keyboard.press('Escape');
  await expect.poll(() => editMenu.elements().length).toBe(0);
  await expect.element(edit).toHaveAttribute('aria-expanded', 'false');
  await edit.click();
  await isShown(editMenu);
  // A disabled menu does not open.
  const help = trigger('Help');
  await expect.element(help).toHaveAttribute('data-disabled', '');
  await keyboard.press('Escape');
  await help.click({ force: true });
  expect(menu('Help').elements()).toHaveLength(0);
  expect(errors).toEqual([]);
});

test(
  'commands act on the field that had focus, and focus returns to it',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    const log = text('menubar-log');
    await note().click();
    unselect();
    // With the pointer.
    await trigger('Edit').click();
    await expect.poll(log).toBe('Edit opened after Note');
    await menu('Edit').getByRole('menuitem', { name: 'Select all' }).click();
    await isFocused(note());
    expect(selection()).toEqual([0, 'Quarterly report draft'.length]);
    await expect.poll(log).toContain('Select all');

    // With the keyboard: Alt and the access key, then Enter. The pointer rests away from the menus,
    // where it cannot hover their items as they appear.
    await mouse.move(1, 999);
    unselect();
    await keyboard.press('Alt+KeyE');
    const editMenu = menu('Edit');
    await isFocused(editMenu.getByRole('menuitem', { name: 'Select all' }));
    await keyboard.press('Enter');
    await isHidden(editMenu);
    await isFocused(note());
    expect(selection()).toEqual([0, 'Quarterly report draft'.length]);
    // An item runs before its menu closes.
    await expect
      .poll(log)
      .toBe(Array(2).fill('Edit opened after Note\nSelect all\nEdit closed after Note').join('\n'));

    // A command in a submenu returns focus too.
    await keyboard.press('Alt+KeyF');
    const fileMenu = menu('File');
    await isFocused(fileMenu.getByRole('menuitem', { name: 'New note' }));
    await keyboard.press('ArrowDown');
    await isFocused(fileMenu.getByRole('menuitem', { name: 'Open recent' }));
    await keyboard.press('ArrowRight');
    const recent = menu('Open recent');
    await isFocused(recent.getByRole('menuitem', { name: 'Quarterly report' }));
    await keyboard.press('Enter');
    await isHidden(recent);
    await isHidden(fileMenu);
    await isFocused(note());
    await expect.poll(log).toContain('Open Quarterly report');

    // Pressing into the field while a menu is open closes the menu and leaves focus in the field.
    await trigger('Edit').click();
    await isShown(menu('Edit'));
    await note().click();
    await isHidden(menu('Edit'));
    await isFocused(note());
    expect(errors).toEqual([]);
  },
);

test(
  'a command gives focus back to the field as its menu starts to fade',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    addStyle('.env-popup[data-ending-style] { transition-duration: 60s; }');
    await note().click();
    await mouse.move(1, 999);
    await keyboard.press('Alt+KeyE');
    const editMenu = menu('Edit');
    await isFocused(editMenu.getByRole('menuitem', { name: 'Select all' }));
    // Closed while it still grows in, it would leave at once.
    await expect.element(editMenu).not.toHaveAttribute('data-starting-style');
    await nextFrames();
    await Promise.allSettled(
      editMenu
        .element()
        .getAnimations()
        .map(({ finished }) => finished),
    );
    await keyboard.press('Enter');
    // Its finalFocus, the field, takes focus while the menu still fades out.
    await expect.element(editMenu).toHaveAttribute('data-ending-style');
    await isFocused(note());
  },
);

test('a click elsewhere lets focus go when nothing had focus before the menu', async () => {
  mount(fixture);
  await trigger('File').click();
  const fileMenu = menu('File');
  await isShown(fileMenu);
  await page.getByText('Line 5', { exact: true }).click();
  await isHidden(fileMenu);
  await expect.element(trigger('File')).not.toHaveFocus();
  // Space or a menu's letter then opens nothing.
  await keyboard.press('Space');
  await keyboard.press('f');
  await noMenus();
});

test(
  'Alt underlines access keys and Alt with a letter opens that menu',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    await note().click();
    await expect.element(trigger('File')).toHaveAttribute('aria-keyshortcuts', 'Alt+F');
    const underline = menubar().element().querySelector('.env-menubar-access-key')!;
    expect(underline.textContent).toBe('F');
    const decoration = () => getComputedStyle(underline).textDecorationLine;
    expect(decoration()).toBe('none');
    await keyboard.down('Alt');
    await expect.poll(accessKeysShown).toBe(true);
    expect(decoration()).toBe('underline');
    await keyboard.press('KeyF');
    const fileMenu = menu('File');
    await isFocused(fileMenu.getByRole('menuitem', { name: 'New note' }));
    await keyboard.up('Alt');
    // Releasing Alt after another key keeps the menu open.
    expect(shown(fileMenu)).toBe(true);
    // Escape closes the menu onto its trigger; Escape again returns to the field.
    await keyboard.press('Escape');
    await isHidden(fileMenu);
    await isFocused(trigger('File'));
    await keyboard.press('Escape');
    await isFocused(note());
    expect(accessKeysShown()).toBe(false);
    expect(errors).toEqual([]);
  },
);

test('Alt alone moves focus to the menubar and back', { tags: ['engines'] }, async () => {
  mount(fixture);
  await note().click();
  await keyboard.press('Alt');
  await isFocused(trigger('File'));
  expect(accessKeysShown()).toBe(true);
  await keyboard.press('Alt');
  await isFocused(note());
  expect(accessKeysShown()).toBe(false);
  // From the menubar, the arrow keys move between triggers and a menu's letter opens it.
  await keyboard.press('Alt');
  await isFocused(trigger('File'));
  await keyboard.press('ArrowRight');
  await isFocused(trigger('Edit'));
  await keyboard.press('v');
  await isShown(menu('View'));
  await isFocused(menu('View').getByRole('menuitemcheckbox', { name: 'Word wrap' }));
  // Alt alone also leaves an open menu for the field.
  await keyboard.press('Alt');
  await isFocused(note());
  await isHidden(menu('View'));
});

test(
  'the access key hint ends with another key or when the window loses focus',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    await note().click();
    await keyboard.down('Alt');
    await expect.poll(accessKeysShown).toBe(true);
    // Alt+Space opens the window's own menu, which may keep the release of Alt from the page.
    await keyboard.press('Space');
    await expect.poll(accessKeysShown).toBe(false);
    await keyboard.up('Alt');
    await isFocused(note());
    await keyboard.down('Alt');
    await expect.poll(accessKeysShown).toBe(true);
    window.dispatchEvent(new Event('blur'));
    await expect.poll(accessKeysShown).toBe(false);
    // Releasing Alt after the window lost focus does not move focus to the menubar.
    await keyboard.up('Alt');
    await isFocused(note());
  },
);

test(
  'other Alt combinations and unclaimed letters stay with the page',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    const keys = text('menubar-keys');
    await note().click();
    await keyboard.press('Alt+KeyQ');
    await expect.poll(keys).toBe('KeyQ free');
    await keyboard.press('Control+Alt+KeyE');
    await expect.poll(keys).toBe('KeyE free');
    await keyboard.press('Alt+Shift+KeyF');
    await expect.poll(keys).toBe('KeyF free');
    // A disabled menu's letter opens nothing.
    await keyboard.press('Alt+KeyH');
    await expect.poll(keys).toBe('KeyH free');
    await noMenus();
    await isFocused(note());
  },
);

test(
  'a menubar in an inert region takes no access keys from outside it',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    await note().click();
    // As behind a modal dialog: the menubar is inert, and the note outside it has focus.
    menubar().element().setAttribute('inert', '');
    await keyboard.down('Alt');
    // Just past the update holding Alt would make.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(accessKeysShown()).toBe(false);
    await keyboard.press('KeyF');
    await keyboard.up('Alt');
    await noMenus();
    await isFocused(note());
  },
);
