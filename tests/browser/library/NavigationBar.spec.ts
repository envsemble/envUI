import { test, expect } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

test('Bar shows five destinations at most, and opens the rest from More', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  const four = scope.getByRole('navigation', { name: 'Mail bar' });
  await expect(four.getByRole('listitem')).toHaveCount(4);
  // The destinations share the bar's width.
  const widths = await four
    .getByRole('listitem')
    .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().width));
  for (const width of widths) expect(Math.abs(width - widths[0])).toBeLessThan(1);
  // Five destinations fit without More.
  const five = scope.getByRole('navigation', { name: 'Five bar' });
  await expect(five.getByRole('listitem')).toHaveCount(5);
  await expect(five.locator('.env-navigation-bar-more')).toHaveCount(0);

  const bar = scope.getByRole('navigation', { name: 'Many bar' });
  await expect(bar.getByRole('listitem')).toHaveCount(5);
  await expect(bar.locator('.env-navigation-bar-label')).toHaveText([
    'Home',
    'Inbox',
    'Drafts',
    'Sent',
    'More',
  ]);
  // More holds the current destination and counts what it holds: Labels, 4, and Archive, 1.
  const more = bar.getByRole('button', {
    name: 'More, 5 new, current page inside',
    exact: true,
  });
  await expect(more).toHaveAttribute('data-current', '');
  await expect(more).not.toHaveAttribute('aria-current');
  // Its text is its label, then its count, as its name reads them, with its icon drawn above.
  expect(await more.evaluate((element) => element.textContent)).toBe('More 5');
  const icon = (await more.locator('.env-navigation-bar-indicator').boundingBox())!;
  expect(icon.y + icon.height).toBeLessThanOrEqual(
    (await more.locator('.env-navigation-bar-label').boundingBox())!.y + 0.5,
  );
  await more.click();
  const menu = page.getByRole('menu', { name: 'More' });
  await expect(menu.getByRole('menuitem')).toHaveCount(3);
  const labels = menu.getByRole('menuitem', { name: /Labels/ });
  await expect(labels).toHaveAttribute('aria-current', 'page');
  await expect(labels).toHaveAccessibleName('Labels, 4 new');
  await expect(menu.getByRole('menuitem', { name: /Archive/ })).toHaveAttribute('href', '#archive');
  await menu.getByRole('menuitem', { name: /Trash/ }).focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();
});

test(
  'More opens from the keyboard, and the arrow keys move through its destinations',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=navigation`);
    const bar = page.getByTestId('navigation-light').getByRole('navigation', { name: 'Many bar' });
    // Tab reaches More after the four destinations before it.
    await bar.getByRole('link', { name: 'Sent', exact: true }).focus();
    await page.keyboard.press('Tab');
    const more = bar.locator('.env-navigation-bar-more');
    await expect(more).toBeFocused();
    await expect(more).toHaveAttribute('aria-haspopup', 'menu');
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'More' });
    await expect(menu).toBeVisible();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    const items = menu.getByRole('menuitem');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('End');
    await expect(items.last()).toBeFocused();
    // Enter selects a destination without href, and the menu closes.
    await page.keyboard.press('Home');
    await expect(items.first()).toHaveAccessibleName('Labels, 4 new');
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('navigation-light').getByTestId('current')).toHaveText(
      'Inbox, Labels',
    );
  },
);
