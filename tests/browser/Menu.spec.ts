import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const menusFixture = `${fixtureUrl}/?fixture=menus`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('ContextMenu', () => {
  for (const theme of ['light', 'dark']) {
    test(`right click opens the menu for the clicked row in the ${theme} theme`, async ({
      page,
    }) => {
      const errors = collectErrors(page);
      await page.goto(menusFixture);
      const area = page.getByTestId(`context-area-${theme}`);
      const row = area.getByRole('button', { name: 'Beta' });
      await row.scrollIntoViewIfNeeded();
      const rowBox = (await row.boundingBox())!;
      await row.locator('span').click({ button: 'right' });
      const menu = page.getByRole('menu', { name: 'Document actions' });
      await expect(menu).toBeVisible();
      await expect(menu.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
        'data-env-theme',
        theme,
      );
      // The menu opens at the pointer; near the viewport edge it shifts to stay visible.
      const menuBox = (await menu.boundingBox())!;
      const pointerY = rowBox.y + rowBox.height / 2;
      expect(pointerY).toBeGreaterThanOrEqual(menuBox.y - 16);
      expect(pointerY).toBeLessThanOrEqual(menuBox.y + menuBox.height + 16);
      expect(Math.abs(menuBox.x - (rowBox.x + rowBox.width / 2))).toBeLessThan(16);

      const rename = menu.getByRole('menuitem', { name: 'Rename Beta' });
      await expect(rename).toHaveAttribute('aria-keyshortcuts', 'F2');
      const side = menu.getByRole('menuitem', { name: 'Open to the side' });
      await expect(side).toHaveAccessibleDescription('Opens beside the current document');

      await page.keyboard.press('ArrowDown');
      await expect(rename).toHaveAttribute('data-highlighted', '');
      await page.keyboard.press('ArrowDown');
      await expect(side).toHaveAttribute('data-highlighted', '');
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();

      await area.getByText('Empty space').click({ button: 'right' });
      await page.getByRole('menuitem', { name: 'New document' }).click();
      await expect(page.getByTestId(`menu-log-${theme}`)).toHaveText('New document');
      expect(errors).toEqual([]);
    });
  }

  test('the keyboard opens the menu at the focused element and activates items', async ({
    page,
  }) => {
    await page.goto(menusFixture);
    const area = page.getByTestId('context-area-light');
    const row = area.getByRole('button', { name: 'Gamma' });
    // The open menu is modal, so the row is measured first.
    await row.scrollIntoViewIfNeeded();
    const rowBox = (await row.boundingBox())!;
    await row.focus();
    await page.keyboard.press('Shift+F10');
    const menu = page.getByRole('menu', { name: 'Document actions' });
    await expect(menu).toBeVisible();
    const menuBox = (await menu.boundingBox())!;
    expect(menuBox.y).toBeGreaterThanOrEqual(rowBox.y + rowBox.height - 1);
    expect(menuBox.y).toBeLessThan(rowBox.y + rowBox.height + 24);
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Rename Gamma' })).toHaveAttribute(
      'data-highlighted',
      '',
    );
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-log-light')).toHaveText('Rename Gamma');
    await expect(row).toBeFocused();

    await page.keyboard.press('ContextMenu');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Rename Gamma' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(row).toBeFocused();
  });

  test('a controlled context menu opens at a supplied point', async ({ page }) => {
    await page.goto(menusFixture);
    const scope = page.getByTestId('menus-light');
    const button = scope.getByRole('button', { name: 'Open at the button' });
    const buttonBox = (await button.boundingBox())!;
    await button.click();
    const menu = page.getByRole('menu', { name: 'Programmatic actions' });
    await expect(menu).toBeVisible();
    const menuBox = (await menu.boundingBox())!;
    expect(Math.abs(menuBox.x - buttonBox.x)).toBeLessThan(8);
    expect(Math.abs(menuBox.y - (buttonBox.y + buttonBox.height + 4))).toBeLessThan(8);
    await menu.getByRole('menuitem', { name: 'Programmatic action' }).click();
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-log-light')).toHaveText('Programmatic action');
  });
});

test('menu groups, radio and checkbox items keep their choice', async ({ page }) => {
  await page.goto(menusFixture);
  const scope = page.getByTestId('menus-light');
  const state = page.getByTestId('menu-state-light');
  await scope.getByRole('button', { name: 'View options' }).click();
  const menu = page.getByRole('menu', { name: 'View options' });
  await expect(menu.getByRole('group', { name: 'Sort by' })).toBeVisible();
  await expect(menu.getByRole('group', { name: 'Display' })).toBeVisible();
  const name = menu.getByRole('menuitemradio', { name: 'Name' });
  const date = menu.getByRole('menuitemradio', { name: 'Date' });
  await expect(name).toHaveAttribute('aria-checked', 'true');
  await expect(date).toHaveAccessibleDescription('Most recently changed first');
  await date.click();
  await expect(menu).toBeHidden();
  await expect(state).toHaveText('date hidden concealed');

  await scope.getByRole('button', { name: 'View options' }).click();
  await expect(menu.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  const hidden = menu.getByRole('menuitemcheckbox', { name: 'Show hidden files' });
  await hidden.click();
  // Checkbox items keep the menu open, so several options can change.
  await expect(menu).toBeVisible();
  await expect(hidden).toHaveAttribute('aria-checked', 'true');
  await expect(state).toHaveText('date hidden shown');
  await expect(menu.getByRole('menuitem', { name: 'Command palette' })).toHaveAttribute(
    'aria-keyshortcuts',
    'Control+Shift+P',
  );
  // The hint shows as keys.
  await expect(
    menu
      .getByRole('menuitem', { name: 'Command palette' })
      .locator('.env-menu-item-shortcut kbd.env-kbd'),
  ).toHaveText(['Ctrl', 'Shift', 'P']);
  // The plus key keeps its name, and a sequence shows its keys without claiming a single shortcut.
  const zoom = menu.getByRole('menuitem', { name: 'Zoom in' });
  await expect(zoom).toHaveAttribute('aria-keyshortcuts', 'Control+Plus');
  await expect(zoom.locator('kbd.env-kbd')).toHaveText(['Ctrl', '+']);
  const sequence = menu.getByRole('menuitem', { name: 'Keyboard shortcuts' });
  await expect(sequence).not.toHaveAttribute('aria-keyshortcuts');
  await expect(sequence.locator('kbd.env-kbd')).toHaveText(['Ctrl', 'K', 'Ctrl', 'S']);
  const plusSequence = menu.getByRole('menuitem', { name: 'Zoom sequence' });
  await expect(plusSequence).not.toHaveAttribute('aria-keyshortcuts');
  await expect(plusSequence.locator('kbd.env-kbd')).toHaveText(['Ctrl', 'Shift', '+', 'Ctrl', 'K']);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});
