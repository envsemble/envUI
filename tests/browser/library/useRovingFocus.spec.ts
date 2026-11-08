import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/** tests/fixture/Primitives.tsx, which mounts a grid and a list that move focus with useRovingFocus among envUI's primitives. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=primitives`);
  await expect(page.getByTestId('roving-list')).toBeVisible();
}

test.describe('useRovingFocus', () => {
  test('moves through a grid by rows and columns, skipping disabled cells', async ({ page }) => {
    await open(page);
    const grid = page.getByRole('grid', { name: 'Days ltr' });
    const cell = (name: string) => grid.getByRole('gridcell', { name, exact: true });
    await expect(cell('1')).toHaveAttribute('tabindex', '0');
    await cell('1').focus();
    await page.keyboard.press('ArrowDown');
    await expect(cell('8')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(cell('4')).toBeFocused();
    // Day 5 is disabled: the move skips to day 6.
    await page.keyboard.press('ArrowRight');
    await expect(cell('6')).toBeFocused();
    await page.keyboard.press('End');
    await expect(cell('7')).toBeFocused();
    await page.keyboard.press('Control+End');
    await expect(cell('14')).toBeFocused();
    await expect(cell('14')).toHaveAttribute('tabindex', '0');
    await expect(cell('1')).toHaveAttribute('tabindex', '-1');
  });

  test('moves to an item as its name is typed', async ({ page }) => {
    await open(page);
    const list = page.getByTestId('roving-list');
    await list.getByRole('option', { name: 'Alex Morgan' }).focus();
    await page.keyboard.type('sa');
    await expect(list.getByRole('option', { name: 'Sam Lee' })).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect(list.getByRole('option', { name: 'Samir Haddad' })).toBeFocused();
  });
});
