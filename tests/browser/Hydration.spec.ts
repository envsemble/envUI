import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

test('public components hydrate server output without recoverable errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(pathToFileURL(resolve('.cache/Hydration.html')).href);
  await expect(page.getByRole('textbox', { name: 'Hydrated input' })).toHaveValue('Server value');
  await page.getByRole('textbox', { name: 'Hydrated input' }).fill('Client value');
  await expect(page.locator('output:not(.env-slider-value)')).toHaveText('Client value');
  // The newer components come before the notice below, which leaves after five seconds.
  // The server wrote this time in English; once hydrated, the browser's German replaces it.
  const relative = page.getByTestId('hydrated-relative-time');
  await expect(relative).toHaveText('in 2 Tagen');
  await expect(relative).toHaveAttribute('datetime', '2026-10-16T12:00:00.000Z');
  await expect(page.getByTestId('hydrated-live-time')).toHaveText(/^\d+ years ago$/);
  const people = page.getByRole('group', {
    name: '5 people: Alex Morgan, Sam Lee, Priya Shah, 2 more',
  });
  await people.getByRole('button', { name: 'Sam Lee' }).click();
  await expect(page.getByTestId('hydrated-person')).toHaveText('Sam Lee');
  await expect(people.locator('.env-avatar-group-overflow')).toHaveText('+3');
  await expect(page.getByRole('button', { name: 'Hydrated copy' })).toBeVisible();
  const pages = page.getByRole('navigation', { name: 'Hydrated pages' });
  await expect(pages.locator('.env-pagination-range')).toHaveText('1–10 of 30');
  await pages.getByRole('button', { name: 'Next page' }).click();
  await expect(pages.locator('.env-pagination-range')).toHaveText('11–20 of 30');
  const amount = page.getByRole('textbox', { name: 'Hydrated amount' });
  await expect(amount).toHaveAccessibleDescription('€ per month');
  await amount.fill('15');
  await expect(amount).toHaveValue('15');
  const level = page.getByRole('slider', { name: 'Hydrated level' });
  await expect(level).toHaveAttribute('aria-valuetext', '40%');
  await level.focus();
  await page.keyboard.press('ArrowRight');
  await expect(level).toHaveAttribute('aria-valuenow', '41');
  await expect(page.locator('output.env-slider-value')).toHaveText('41%');
  const people = page.getByRole('combobox', { name: 'Hydrated people', exact: true });
  await expect(page.getByRole('toolbar', { name: 'Hydrated people' })).toContainText('One person');
  await people.fill('two');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('toolbar', { name: 'Hydrated people' })).toContainText('Two people');
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Hydrated files' }).click();
  const picker = await chooser;
  await picker.setFiles({ name: 'hydrated.txt', mimeType: 'text/plain', buffer: Buffer.from('a') });
  await expect(page.getByText('hydrated.txt', { exact: true })).toBeVisible();
  const table = page.getByRole('table', { name: 'Hydrated table' });
  const name = table.getByRole('columnheader', { name: 'Hydrated name', exact: true });
  await expect(name).toHaveAttribute('aria-sort', 'ascending');
  await table.getByRole('button', { name: 'Hydrated name sort descending' }).click();
  await expect(name).toHaveAttribute('aria-sort', 'descending');
  const handle = table.getByRole('separator', { name: 'Resize Hydrated name' });
  await expect(handle).toHaveAttribute('aria-valuenow', '60');
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '61');
  await expect(table.getByRole('row', { name: /Quarterly report/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('log', { name: 'Hydrated conversation' })).toContainText(
    'Hydrated answer',
  );
  const composer = page.getByRole('textbox', { name: 'Hydrated composer' });
  await expect(composer).toHaveAccessibleDescription('Hydrated composer footer');
  await composer.fill('Hydrated message');
  await composer.press('Enter');
  const conversation = page.getByRole('log', { name: 'Hydrated conversation' });
  await expect(conversation.getByRole('article')).toHaveCount(2);
  await expect(conversation.getByRole('article').last()).toHaveText('Hydrated message');
  await expect(composer).toHaveValue('');
  const split = page.getByRole('separator', { name: 'Hydrated split' });
  await expect(split).toHaveAttribute('aria-valuenow', '50');
  await split.focus();
  await page.keyboard.press('ArrowRight');
  await expect(split).toHaveAttribute('aria-valuenow', '52');
  // The server renders the dock's panels and chips; the client then measures and resizes them.
  const docked = page.getByRole('region', { name: 'Hydrated notes' });
  await expect(docked.getByRole('heading', { level: 3, name: 'Hydrated notes' })).toBeVisible();
  const chips = page.getByRole('list', { name: 'Hydrated chips' });
  await expect(
    chips.getByRole('button', { name: 'Show Hydrated budget' }),
  ).toHaveAccessibleDescription('Hydrated changes');
  await expect(chips.getByRole('button', { name: 'Discard Hydrated budget' })).toBeVisible();
  const dockHandle = docked.getByRole('separator', { name: 'Height of Hydrated notes' });
  await expect(dockHandle).toHaveAttribute('aria-valuenow', /\d+/);
  const dockDraft = docked.getByRole('textbox', { name: 'Hydrated notes draft' });
  await dockDraft.fill('Hydrated draft');
  await docked.getByRole('button', { name: 'Minimize' }).click();
  await chips.getByRole('button', { name: 'Show Hydrated notes' }).click();
  await expect(dockDraft).toHaveValue('Hydrated draft');
  await expect(page.getByRole('group', { name: 'Hydrated stats' })).toHaveText(
    'Hydrated stat128+12%Last 30 days',
  );
  const activity = page.getByRole('grid', { name: 'Hydrated activity' });
  await expect(activity.getByRole('gridcell')).toHaveCount(31);
  const peak = activity.getByRole('gridcell', { name: 'Mon 9 Mar 2026: 1,200' });
  await peak.focus();
  await page.keyboard.press('ArrowRight');
  await expect(activity.getByRole('gridcell', { name: 'Mon 16 Mar 2026: 7' })).toBeFocused();
  await expect(page.locator('.env-heatmap-tooltip')).toHaveText('Mon 16 Mar 2026: 7');
  const color = page.getByRole('textbox', { name: 'Hydrated color HEX' });
  await expect(color).toHaveValue('#1a73e8');
  await color.fill('ABCDEF');
  await expect(color).toHaveValue('#abcdef');
  await expect(page.getByRole('checkbox', { name: 'Hydrated choice' })).toHaveJSProperty(
    'indeterminate',
    true,
  );
  await page.getByRole('checkbox', { name: 'Hydrated choice' }).click();
  await expect(page.getByRole('checkbox', { name: 'Hydrated choice' })).toBeChecked();
  await page.getByRole('combobox', { name: 'Hydrated select' }).click();
  await page.getByRole('option', { name: 'Two', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Hydrated select' })).toContainText('Two');
  await page.getByRole('button', { name: 'Open hydrated dialog' }).click();
  await expect(page.getByRole('dialog', { name: 'Hydrated dialog' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Notify', exact: true }).click();
  await expect(page.locator('.env-toast-viewport .env-toast')).toContainText('Hydrated notice');
  await page.getByRole('radio', { name: 'Done' }).click();
  await expect(page.getByRole('radio', { name: 'Done' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('tab', { name: 'Two.md' }).click();
  await expect(page.getByRole('tab', { name: 'Two.md' })).toHaveAttribute('aria-selected', 'true');
  const file = page.getByRole('menuitem', { name: 'File', exact: true });
  await expect(page.locator('.env-title-bar')).toContainText('Hydrated title');
  await file.click();
  const fileMenu = page.getByRole('menu', { name: 'File' });
  await expect(fileMenu.getByRole('menuitem', { name: 'Hydrated new' })).toBeVisible();
  await fileMenu.getByRole('menuitem', { name: 'Hydrated recent' }).hover();
  await expect(page.getByRole('menuitem', { name: 'Hydrated report' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(fileMenu).toBeHidden();
  await page.getByRole('combobox', { name: 'Hydrated compact select' }).click();
  await page.getByRole('option', { name: 'Two', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Hydrated compact select' })).toContainText(
    'Two',
  );
  const row = page.getByRole('treeitem', { name: 'Hydrated document 2', exact: true });
  await row.click();
  await expect(row).toHaveAttribute('aria-selected', 'true');
  expect(
    await page.evaluate(() => (window as unknown as { hydrationErrors: string[] }).hydrationErrors),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
