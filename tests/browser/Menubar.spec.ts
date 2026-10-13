import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const menubarFixture = `${fixtureUrl}/?fixture=menubar`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

function menubar(page: Page) {
  return page.getByRole('menubar', { name: 'Application menu' });
}

function trigger(page: Page, name: string) {
  return menubar(page).getByRole('menuitem', { name, exact: true });
}

test('menubar menus open below their trigger and switch on hover and with the arrow keys', async ({
  page,
  browserName,
}) => {
  const errors = collectErrors(page);
  await page.goto(menubarFixture);
  const file = trigger(page, 'File');
  const before = (await file.boundingBox())!;
  const overflow = await page.evaluate(() => getComputedStyle(document.documentElement).overflow);
  await file.click();
  const fileMenu = page.getByRole('menu', { name: 'File' });
  await expect(fileMenu).toBeVisible();
  await expect(fileMenu).toHaveAttribute('data-density', 'compact');
  await expect(file).toHaveAttribute('aria-expanded', 'true');
  await expect(file).toHaveAttribute('data-popup-open', '');
  // Compact text triggers sit tightly in a row.
  expect(before.height).toBeCloseTo(32, 0);
  const edit = trigger(page, 'Edit');
  const editBox = (await edit.boundingBox())!;
  expect(editBox.x - (before.x + before.width)).toBeLessThanOrEqual(4);
  // Below the trigger, aligned to its start, with a small offset.
  await expect
    .poll(async () => {
      const menu = (await fileMenu.boundingBox())!;
      return [Math.round(menu.x - before.x), Math.round(menu.y - (before.y + before.height))];
    })
    .toEqual([0, 4]);
  // Opening a menu neither locks scrolling nor moves the page.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
    overflow,
  );
  expect((await file.boundingBox())!.x).toBe(before.x);
  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));

  // Once a menu is open, hovering another trigger switches to its menu. The pointer moves in steps,
  // as a person's does.
  await page.mouse.move(editBox.x + 2, editBox.y + editBox.height / 2, { steps: 4 });
  await page.mouse.move(editBox.x + editBox.width / 2, editBox.y + editBox.height / 2, {
    steps: 4,
  });
  const editMenu = page.getByRole('menu', { name: 'Edit' });
  await expect(editMenu).toBeVisible();
  await expect(fileMenu).toBeHidden();
  // The arrow keys move between menus. Base UI opens the next menu as its trigger takes keyboard
  // focus (:focus-visible), which one engine does not report for synthesized keys; there the test
  // checks that focus moves to the next trigger.
  await expect(editMenu.getByRole('menuitem', { name: 'Select all' })).toBeVisible();
  await editMenu.getByRole('menuitem', { name: 'Select all' }).focus();
  await page.keyboard.press('ArrowRight');
  const viewMenu = page.getByRole('menu', { name: 'View' });
  if (browserName === 'firefox') {
    await expect(trigger(page, 'View')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(edit).toBeFocused();
    expect(errors).toEqual([]);
    return;
  }
  await expect(viewMenu).toBeVisible();
  await expect(editMenu).toBeHidden();
  await expect(page.getByTestId('menubar-state')).toHaveText('wrap view open');
  await page.keyboard.press('ArrowLeft');
  await expect(editMenu).toBeVisible();
  await expect(viewMenu).toBeHidden();
  await expect(page.getByTestId('menubar-state')).toHaveText('wrap view closed');
  await page.keyboard.press('Escape');
  await expect(editMenu).toBeHidden();
  await expect(edit).toBeFocused();
  expect(errors).toEqual([]);
});

test('a disabled menubar menu does not open', async ({ page }) => {
  await page.goto(menubarFixture);
  const help = trigger(page, 'Help');
  await expect(help).toHaveAttribute('data-disabled', '');
  await help.click({ force: true });
  await expect(page.getByRole('menu', { name: 'Help' })).toHaveCount(0);
});

test('commands act on the field that had focus, and focus returns to it', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(menubarFixture);
  const note = page.getByRole('textbox', { name: 'Note' });
  const log = page.getByTestId('menubar-log');
  const selection = () =>
    note.evaluate((field: HTMLTextAreaElement) => [field.selectionStart, field.selectionEnd]);
  await note.click();
  await note.evaluate((field: HTMLTextAreaElement) => field.setSelectionRange(0, 0));
  // With the pointer.
  await trigger(page, 'Edit').click();
  await expect(log).toHaveText('Edit opened after Note');
  await page
    .getByRole('menu', { name: 'Edit' })
    .getByRole('menuitem', { name: 'Select all' })
    .click();
  await expect(note).toBeFocused();
  expect(await selection()).toEqual([0, 'Quarterly report draft'.length]);
  await expect(log).toContainText('Select all');

  // With the keyboard: Alt and the access key, then Enter.
  await note.evaluate((field: HTMLTextAreaElement) => field.setSelectionRange(0, 0));
  await page.keyboard.press('Alt+KeyE');
  const editMenu = page.getByRole('menu', { name: 'Edit' });
  await expect(editMenu.getByRole('menuitem', { name: 'Select all' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(editMenu).toBeHidden();
  await expect(note).toBeFocused();
  expect(await selection()).toEqual([0, 'Quarterly report draft'.length]);
  // An item runs before its menu closes.
  await expect(log).toHaveText(
    Array(2).fill('Edit opened after Note\nSelect all\nEdit closed after Note').join('\n'),
  );

  // A command in a submenu returns focus too.
  await page.keyboard.press('Alt+KeyF');
  const fileMenu = page.getByRole('menu', { name: 'File' });
  await expect(fileMenu.getByRole('menuitem', { name: 'New note' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(fileMenu.getByRole('menuitem', { name: 'Open recent' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  const recent = page.getByRole('menu', { name: 'Open recent' });
  await expect(recent.getByRole('menuitem', { name: 'Quarterly report' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(recent).toBeHidden();
  await expect(fileMenu).toBeHidden();
  await expect(note).toBeFocused();
  await expect(log).toContainText('Open Quarterly report');

  // Pressing into the field while a menu is open closes the menu and leaves focus in the field.
  await trigger(page, 'Edit').click();
  await expect(page.getByRole('menu', { name: 'Edit' })).toBeVisible();
  await note.click();
  await expect(page.getByRole('menu', { name: 'Edit' })).toBeHidden();
  await expect(note).toBeFocused();
  expect(errors).toEqual([]);
});

test.describe('Access keys', () => {
  test('Alt underlines access keys and Alt with a letter opens that menu', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(menubarFixture);
    const note = page.getByRole('textbox', { name: 'Note' });
    await note.click();
    await expect(trigger(page, 'File')).toHaveAttribute('aria-keyshortcuts', 'Alt+F');
    const underline = menubar(page).locator('.env-menubar-access-key').first();
    await expect(underline).toHaveText('F');
    const decoration = () =>
      underline.evaluate((element) => getComputedStyle(element).textDecorationLine);
    expect(await decoration()).toBe('none');
    await page.keyboard.down('Alt');
    await expect(menubar(page)).toHaveAttribute('data-access-keys-shown', '');
    expect(await decoration()).toBe('underline');
    await page.keyboard.press('KeyF');
    const fileMenu = page.getByRole('menu', { name: 'File' });
    await expect(fileMenu.getByRole('menuitem', { name: 'New note' })).toBeFocused();
    await page.keyboard.up('Alt');
    // Releasing Alt after another key keeps the menu open.
    await expect(fileMenu).toBeVisible();
    // Escape closes the menu onto its trigger; Escape again returns to the field.
    await page.keyboard.press('Escape');
    await expect(fileMenu).toBeHidden();
    await expect(trigger(page, 'File')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(note).toBeFocused();
    await expect(menubar(page)).not.toHaveAttribute('data-access-keys-shown');
    expect(errors).toEqual([]);
  });

  test('Alt alone moves focus to the menubar and back', async ({ page }) => {
    await page.goto(menubarFixture);
    const note = page.getByRole('textbox', { name: 'Note' });
    await note.click();
    await page.keyboard.press('Alt');
    await expect(trigger(page, 'File')).toBeFocused();
    await expect(menubar(page)).toHaveAttribute('data-access-keys-shown', '');
    await page.keyboard.press('Alt');
    await expect(note).toBeFocused();
    await expect(menubar(page)).not.toHaveAttribute('data-access-keys-shown');
    // From the menubar, the arrow keys move between triggers and a menu's letter opens it.
    await page.keyboard.press('Alt');
    await expect(trigger(page, 'File')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(trigger(page, 'Edit')).toBeFocused();
    await page.keyboard.press('v');
    await expect(page.getByRole('menu', { name: 'View' })).toBeVisible();
    await expect(
      page.getByRole('menu', { name: 'View' }).getByRole('menuitemcheckbox', { name: 'Word wrap' }),
    ).toBeFocused();
    // Alt alone also leaves an open menu for the field.
    await page.keyboard.press('Alt');
    await expect(note).toBeFocused();
    await expect(page.getByRole('menu', { name: 'View' })).toBeHidden();
  });

  test('other Alt combinations and unclaimed letters stay with the page', async ({ page }) => {
    await page.goto(menubarFixture);
    const note = page.getByRole('textbox', { name: 'Note' });
    const keys = page.getByTestId('menubar-keys');
    await note.click();
    await page.keyboard.press('Alt+KeyQ');
    await expect(keys).toHaveText('KeyQ free');
    await page.keyboard.press('Control+Alt+KeyE');
    await expect(keys).toHaveText('KeyE free');
    await page.keyboard.press('Alt+Shift+KeyF');
    await expect(keys).toHaveText('KeyF free');
    // A disabled menu's letter opens nothing.
    await page.keyboard.press('Alt+KeyH');
    await expect(keys).toHaveText('KeyH free');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(note).toBeFocused();
  });
});
