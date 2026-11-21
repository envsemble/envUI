import { beforeEach, expect, test } from 'vitest';
import { page, server, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Menubar.fixture.tsx';
import {
  addStyle,
  box,
  collectErrors,
  keyboard,
  mouse,
  nextFrames,
  shown,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

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

async function focusItem(menu: Locator, item: Locator) {
  await expect.poll(() => menu.query()?.contains(document.activeElement)).toBe(true);
  (item.element() as HTMLElement).focus();
  await isFocused(item);
}

const noteSelection = () => {
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
  expect(before.height).toBeCloseTo(32, 0);
  const edit = trigger('Edit');
  const editBox = box(edit);
  expect(editBox.x - (before.x + before.width)).toBeLessThanOrEqual(4);
  await expect
    .poll(() => {
      const popup = box(fileMenu);
      return [Math.round(popup.x - before.x), Math.round(popup.y - (before.y + before.height))];
    })
    .toEqual([0, 4]);
  expect(getComputedStyle(document.documentElement).overflow).toBe(overflow);
  expect(box(file).x).toBe(before.x);
  await mouse.wheel(0, 200);
  await expect.poll(() => window.scrollY).toBeGreaterThan(0);
  window.scrollTo(0, 0);

  await mouse.move(editBox.x + 2, editBox.y + editBox.height / 2, { steps: 4 });
  await mouse.move(editBox.x + editBox.width / 2, editBox.y + editBox.height / 2, { steps: 4 });
  const editMenu = menu('Edit');
  await isShown(editMenu);
  await isHidden(fileMenu);
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
  await expect.poll(() => editMenu.query()?.contains(document.activeElement)).toBe(true);
  await keyboard.press('Escape');
  await expect.poll(() => editMenu.elements().length).toBe(0);
  await expect.element(edit).toHaveAttribute('aria-expanded', 'false');
  await edit.click();
  await isShown(editMenu);
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
    await trigger('Edit').click();
    await expect.poll(log).toBe('Edit opened after Note');
    await menu('Edit').getByRole('menuitem', { name: 'Select all' }).click();
    await isFocused(note());
    expect(noteSelection()).toEqual([0, 'Quarterly report draft'.length]);
    await expect.poll(log).toContain('Select all');

    await mouse.move(1, 999);
    unselect();
    await keyboard.press('Alt+KeyE');
    const editMenu = menu('Edit');
    await isFocused(editMenu.getByRole('menuitem', { name: 'Select all' }));
    await keyboard.press('Enter');
    await isHidden(editMenu);
    await isFocused(note());
    expect(noteSelection()).toEqual([0, 'Quarterly report draft'.length]);
    await expect
      .poll(log)
      .toBe(Array(2).fill('Edit opened after Note\nSelect all\nEdit closed after Note').join('\n'));

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
    await expect.element(editMenu).not.toHaveAttribute('data-starting-style');
    await nextFrames();
    await Promise.allSettled(
      editMenu
        .element()
        .getAnimations()
        .map(({ finished }) => finished),
    );
    await keyboard.press('Enter');
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
    expect(shown(fileMenu)).toBe(true);
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
  await keyboard.press('Alt');
  await isFocused(trigger('File'));
  await keyboard.press('ArrowRight');
  await isFocused(trigger('Edit'));
  await keyboard.press('v');
  await isShown(menu('View'));
  await isFocused(menu('View').getByRole('menuitemcheckbox', { name: 'Word wrap' }));
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
    await keyboard.press('Space');
    await expect.poll(accessKeysShown).toBe(false);
    await keyboard.up('Alt');
    await isFocused(note());
    await keyboard.down('Alt');
    await expect.poll(accessKeysShown).toBe(true);
    window.dispatchEvent(new Event('blur'));
    await expect.poll(accessKeysShown).toBe(false);
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
    menubar().element().setAttribute('inert', '');
    await keyboard.down('Alt');
    await nextFrames();
    expect(accessKeysShown()).toBe(false);
    await keyboard.press('KeyF');
    await keyboard.up('Alt');
    await noMenus();
    await isFocused(note());
  },
);

test("a trigger takes its own attributes, and an icon beside its label keeps the access key's underline", async () => {
  mount({ default: fixture.RichTriggerFixture });
  const files = page
    .getByRole('menubar', { name: 'Editor menu' })
    .getByRole('menuitem', { name: 'Files' });
  await expect.element(files).toHaveAttribute('data-testid', 'files-trigger');
  expect(files.element().classList.contains('fixture-files-trigger')).toBe(true);
  expect(files.element().classList.contains('env-menubar-trigger')).toBe(true);
  expect(files.element().querySelector('.env-menubar-access-key')?.textContent).toBe('F');
  await expect.element(files).toHaveAttribute('aria-keyshortcuts', 'Alt+F');
  (files.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await isShown(page.getByRole('menu', { name: 'Files' }));
});

test('the access key is underlined inside elements that wrap the label, and both triggers take one kind of attributes', async () => {
  mount({ default: fixture.RichTriggerFixture });
  const selection = page.getByTestId('selection-trigger');
  const underline = selection.element().querySelector('.env-menubar-access-key')!;
  expect(underline.textContent).toBe('c');
  expect(underline.closest('.fixture-wrapped-label')).not.toBeNull();
  expect(selection.element().textContent).toBe('Selection');
  await expect.element(selection).toHaveAttribute('aria-keyshortcuts', 'Alt+C');
  (selection.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await isShown(page.getByRole('menu', { name: 'Selection' }));
  await expect.element(page.getByTestId('expand-trigger')).toHaveClass(/env-menu-submenu-trigger/);
});
