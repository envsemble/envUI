import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const accountMenus = `${fixtureUrl}/?fixture=account-menus`;

test.describe('AccountMenu', () => {
  test('opens by keyboard, and its theme submenu stores the choice through the provider', async ({
    page,
  }) => {
    await page.goto(accountMenus);
    await page.evaluate(() => localStorage.removeItem('fixture-account-theme'));
    await page.reload();
    const stored = page.getByTestId('bound-theme');
    await expect(stored).toHaveText(/^system /);

    const trigger = page.getByTestId('bound').getByRole('button', { name: 'Alex Morgan' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'Account' });
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // The header says who is signed in; it is no item.
    await expect(menu).toContainText('alex@example.com');
    // Opened by keyboard, focus starts on the first item.
    await expect(menu.getByRole('menuitem').first()).toHaveText('Account settings');
    await expect(menu.getByRole('menuitem').first()).toBeFocused();

    // Down to the theme row, which opens its submenu to the right.
    await page.keyboard.press('ArrowDown');
    const themeRow = menu.getByRole('menuitem', { name: 'Theme' });
    await expect(themeRow).toBeFocused();
    await page.keyboard.press('ArrowRight');
    const themes = page.getByRole('menu', { name: 'Theme' });
    await expect(themes).toBeVisible();
    await expect(themes.getByRole('menuitemradio')).toHaveText(['System', 'Light', 'Dark']);
    await expect(themes.getByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(themes.getByRole('menuitemradio', { name: 'System' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    // The menu stays open, so people see the theme change.
    await expect(themes.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(themes).toBeVisible();
    await expect(stored).toHaveText('dark dark');
    expect(await page.evaluate(() => localStorage.getItem('fixture-account-theme'))).toBe('dark');

    // ← closes only the submenu; Escape the menu, and focus returns to the avatar.
    await page.keyboard.press('ArrowLeft');
    await expect(themes).toBeHidden();
    await expect(themeRow).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    // The provider keeps the choice across a reload.
    await page.reload();
    await expect(stored).toHaveText('dark dark');
  });

  test('switches organizations from its submenu, which names the active one', async ({ page }) => {
    await page.goto(accountMenus);
    const log = page.getByTestId('account-log');
    await page.getByTestId('bound').getByRole('button', { name: 'Alex Morgan' }).click();
    const menu = page.getByRole('menu', { name: 'Account' });
    const row = menu.getByRole('menuitem', { name: /^Organization/ });
    await expect(row).toContainText('Northwind');
    await row.hover();
    const organizations = page.getByRole('menu', { name: 'Organization' });
    await expect(organizations.getByRole('menuitemradio')).toHaveText([
      /Northwind\s*Owner/,
      /Contoso\s*Member/,
    ]);
    await organizations.getByRole('menuitemradio', { name: /Contoso/ }).click();
    await expect(menu).toBeHidden();
    await expect(log).toHaveText(/contoso/);

    await page.getByTestId('bound').getByRole('button', { name: 'Alex Morgan' }).click();
    await menu.getByRole('menuitem', { name: /^Organization/ }).hover();
    await expect(organizations.getByRole('menuitemradio', { name: /Contoso/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await organizations.getByRole('menuitem', { name: 'Create organization' }).click();
    await expect(log).toHaveText(/^create /);
  });

  test('a theme the application stores follows value and onValueChange', async ({ page }) => {
    await page.goto(accountMenus);
    const trigger = page.getByTestId('controlled').getByRole('button', { name: 'Sam Lee' });
    await trigger.click();
    const menu = page.getByRole('menu', { name: "Sam's account" });
    await menu.getByRole('menuitem', { name: 'Theme' }).hover();
    const themes = page.getByRole('menu', { name: 'Theme' });
    await expect(themes.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await themes.getByRole('menuitemradio', { name: 'Light' }).click();
    // closeOnClick closes the menu after the choice.
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('account-log')).toHaveText(/light$/);
    // The provider's preference is untouched.
    await expect(page.getByTestId('bound-theme')).not.toHaveText(/^light/);
  });

  test('its automatic trigger is a row in an expanded sidebar and the avatar elsewhere', async ({
    page,
  }) => {
    await page.goto(accountMenus);
    const row = page.getByTestId('sidebar').getByRole('button');
    await expect(row).toHaveAccessibleName('Priya Shah priya@example.com');
    await expect(row).toHaveClass(/env-account-menu-trigger/);
    // The row fills its container.
    const container = (await page.getByTestId('sidebar').boundingBox())!;
    expect((await row.boundingBox())!.width).toBeCloseTo(container.width, 0);

    const rail = page.getByTestId('rail').getByRole('button', { name: 'Priya Shah' });
    await expect(rail).toHaveClass(/env-avatar-button/);
    await expect(page.getByTestId('bound').getByRole('button')).toHaveClass(/env-avatar-button/);

    // In a rail, the menu opens at the inline end.
    await rail.click();
    const menu = page.getByRole('menu', { name: 'Rail account' });
    await expect(menu).toBeVisible();
    const railBox = (await rail.boundingBox())!;
    expect((await menu.boundingBox())!.x).toBeGreaterThan(railBox.x + railBox.width - 1);
  });

  test('in right-to-left text the theme submenu opens to the left', async ({ page }) => {
    await page.goto(accountMenus);
    await page.getByTestId('rtl').getByRole('button', { name: 'Alex Morgan' }).click();
    const menu = page.getByRole('menu', { name: 'RTL account' });
    const row = menu.getByRole('menuitem', { name: 'Theme' });
    await row.focus();
    // The arrow toward the inline end opens it: ← in right-to-left text.
    await page.keyboard.press('ArrowLeft');
    const themes = page.getByRole('menu', { name: 'Theme' });
    await expect(themes).toBeVisible();
    const rowBox = (await row.boundingBox())!;
    const themesBox = (await themes.boundingBox())!;
    expect(themesBox.x + themesBox.width).toBeLessThan(rowBox.x + 1);
  });
});
