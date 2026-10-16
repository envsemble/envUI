import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=choice-controls`);
});

test('a radio takes its class and style on its root, and its ref and native props on the input', async ({
  page,
}) => {
  const input = page.getByRole('radio', { name: 'Team', exact: true });
  await expect(input).toHaveAttribute('data-testid', 'radio-input');
  await expect(input).toHaveClass('env-radio-input');
  const root = page.locator('label.env-radio', { has: input });
  await expect(root).toHaveClass('env-radio app-radio');
  await expect(root).toHaveCSS('margin-inline-start', '3px');
  await page.getByRole('button', { name: 'Read refs' }).click();
  await expect(page.getByTestId('choice-refs')).toHaveText(/INPUT:radio$/);
});

test('a group lays its radios out by orientation: side by side, or as rows', async ({ page }) => {
  const plan = page.getByRole('group', { name: 'Plan' });
  const role = page.getByRole('group', { name: 'Role' });
  await expect(plan).toHaveAttribute('data-orientation', 'horizontal');
  await expect(role).toHaveAttribute('data-orientation', 'vertical');
  await expect(plan).toHaveCSS('display', 'flex');
  await expect(role).toHaveCSS('display', 'grid');
  // A row starts with its label and description and ends with its radio.
  const viewer = role.locator('label.env-radio').first();
  await expect(viewer).toHaveAttribute('data-orientation', 'vertical');
  await expect(viewer.locator('> :last-child')).toHaveClass('env-radio-input');
  await expect(viewer.locator('.env-radio-description')).toHaveText('Reads and comments');
  await expect(page.getByRole('radio', { name: /Viewer/ })).toHaveAccessibleName(
    'Viewer Reads and comments',
  );
});

test('keyboard focus rings a radio side by side, and the whole row of a row radio', async ({
  page,
}) => {
  // Tab and the arrow keys move focus the way a keyboard user does, so the focus is visible.
  await page.getByRole('switch', { name: 'Alerts', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Team', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  const solo = page.getByRole('radio', { name: 'Solo', exact: true });
  await expect(solo).toBeFocused();
  // WebKit gives a radio focused from the keyboard no :focus-visible; elsewhere the ring shows.
  if (await solo.evaluate((input) => input.matches(':focus-visible')))
    await expect(solo).toHaveCSS('outline-style', 'solid');
  if (await solo.evaluate((input) => input.matches(':focus-visible')))
    expect(
      Number.parseFloat(await solo.evaluate((input) => getComputedStyle(input).outlineWidth)),
    ).toBe(2);
  const viewer = page.getByRole('radio', { name: /Viewer/ });
  await viewer.focus();
  await page.keyboard.press('ArrowDown');
  const editor = page.getByRole('radio', { name: /Editor/ });
  await expect(editor).toBeFocused();
  const row = page.locator('label.env-radio', { has: editor });
  if (await editor.evaluate((input) => input.matches(':focus-visible')))
    await expect(row).toHaveCSS('outline-style', 'solid');
});
