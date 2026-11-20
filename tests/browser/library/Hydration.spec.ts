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
  const relative = page.getByTestId('hydrated-relative-time');
  await expect(relative).toHaveText('in 2 Tagen');
  await expect(relative).toHaveAttribute('datetime', '2026-10-16T12:00:00.000Z');
  await expect(page.getByTestId('hydrated-live-time')).toHaveText(/^\d+ years ago$/);
  const people = page.getByRole('group', {
    name: '5 people: Alex Morgan, Sam Lee, Priya Shah, 2 more',
  });
  await people.hover();
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
  const peoplePicker = page.getByRole('combobox', { name: 'Hydrated people', exact: true });
  await expect(page.getByRole('toolbar', { name: 'Hydrated people' })).toContainText('One person');
  await peoplePicker.fill('two');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('toolbar', { name: 'Hydrated people' })).toContainText('Two people');
  const date = page.getByRole('combobox', { name: 'Hydrated date', exact: true });
  await expect(date).toHaveText('9 Mar 2026');
  await date.click();
  await page
    .getByRole('dialog', { name: 'Hydrated date' })
    .locator('[data-date="2026-03-10"]')
    .click();
  await expect(date).toHaveText('10 Mar 2026');
  const month = page
    .getByRole('group', { name: 'Hydrated calendar' })
    .getByRole('grid', { name: 'March 2026' });
  await month.locator('[data-date="2026-03-12"]').click();
  await expect(month.locator('[data-date="2026-03-12"]')).toHaveAttribute('aria-selected', 'true');
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
  await expect(page.getByRole('separator', { name: 'Hydrated kept split' })).toHaveAttribute(
    'aria-valuetext',
    '30 rem',
  );
  const split = page.getByRole('separator', { name: 'Hydrated split' });
  await expect(split).toHaveAttribute('aria-valuetext', '22.5 rem');
  await expect(split).toHaveAttribute(
    'aria-controls',
    (await page.getByRole('region', { name: 'Hydrated supporting' }).getAttribute('id'))!,
  );
  await split.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(split).toHaveAttribute('aria-valuetext', '23.5 rem');
  const color = page
    .getByRole('group', { name: 'Hydrated color', exact: true })
    .getByRole('textbox', { name: 'Hex' });
  await expect(color).toHaveValue('#1A73E8');
  await color.fill('ABCDEF');
  await color.press('Enter');
  await expect(color).toHaveValue('#ABCDEF');
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
  await expect(page.locator('.env-top-bar[data-title-bar]')).toContainText('Hydrated title');
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

test.describe('on an Apple platform', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });

  test('the shortcut modifier hydrates as Ctrl, then shows ⌘', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'platform', { get: () => 'MacIntel' });
      Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined });
    });
    await page.goto(pathToFileURL(resolve('.cache/Hydration.html')).href);
    const search = page.getByRole('button', { name: 'Hydrated search' });
    await expect(search).toHaveAttribute('aria-keyshortcuts', 'Meta+K');
    await expect(search.locator('.env-kbd')).toHaveText(['⌘', 'K']);
    await page.waitForFunction(
      () => (window as unknown as { hydrationReady?: boolean }).hydrationReady,
    );
    expect(
      await page.evaluate(
        () => (window as unknown as { hydrationErrors: string[] }).hydrationErrors,
      ),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
});

test.describe('in another language and time zone than the server', () => {
  test.use({ locale: 'de-DE', timezoneId: 'Pacific/Kiritimati' });

  test('date fields and calendars without a locale hydrate, then follow the reader', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const noonUtcIsNextMorningInKiritimati = new Date('2031-05-19T12:00:00Z');
    await page.clock.setFixedTime(noonUtcIsNextMorningInKiritimati);
    await page.goto(pathToFileURL(resolve('.cache/Hydration.html')).href);
    await expect(page.getByRole('textbox', { name: 'Hydrated input' })).toHaveValue('Server value');
    const date = page.getByRole('combobox', { name: 'Hydrated local date', exact: true });
    await expect(date).toHaveText('17.03.2026');
    const calendar = page.getByRole('group', { name: 'Hydrated local calendar' });
    const month = calendar.getByRole('grid', { name: 'März 2026' });
    await expect(month).toBeVisible();
    await expect(month.getByRole('columnheader').first()).toHaveText('Mo');
    await expect(month.locator('[data-date="2026-03-17"]')).toHaveAccessibleName(
      'Dienstag, 17. März 2026',
    );
    await expect(month.locator('[data-date="2026-03-17"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const today = page.getByRole('group', { name: 'Hydrated today' });
    await expect(today.getByRole('grid', { name: 'Mai 2031' })).toBeVisible();
    await expect(today.locator('[aria-current="date"]')).toHaveAttribute('data-date', '2031-05-20');
    await expect(today.locator('td[tabindex="0"]')).toHaveAttribute('data-date', '2031-05-20');
    const bounded = page.getByRole('group', { name: 'Hydrated bounded today' });
    await expect(bounded.getByRole('grid', { name: 'Mai 2031' })).toBeVisible();
    await expect(bounded.getByRole('button', { name: 'Next month' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    const previous = bounded.getByRole('button', { name: 'Previous month' });
    await expect(previous).not.toHaveAttribute('aria-disabled');
    await previous.click();
    await expect(bounded.getByRole('grid', { name: 'April 2031' })).toBeVisible();
    await date.click();
    await page
      .getByRole('dialog', { name: 'Hydrated local date' })
      .locator('[data-date="2026-03-18"]')
      .click();
    await expect(date).toHaveText('18.03.2026');
    expect(
      await page.evaluate(
        () => (window as unknown as { hydrationErrors: string[] }).hydrationErrors,
      ),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
});
