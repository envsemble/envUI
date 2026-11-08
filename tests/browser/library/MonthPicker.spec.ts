import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/** Today is fixed, so this month is the same in every run. */
const today = new Date('2026-10-14T10:00:00');

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  return errors;
}

const field = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const focusedMonth = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.month ?? null);
const wellOf = (trigger: Locator) =>
  trigger.locator('xpath=ancestor::*[contains(@class, "env-text-field-control")][1]');
/** The open popup; a closing one can still fade out. */
const openPopup = (page: Page) => page.locator('.env-date-picker-popup[data-open]');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(today);
  await page.goto(`${fixtureUrl}/?fixture=month-pickers`);
});

test('the field shows its month in the locale and the grid follows the calendar keys', async ({
  page,
}) => {
  const errors = collectErrors(page);
  const report = field(page, 'Report month');
  await expect(report).toHaveText('October 2026');
  await expect(report).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(report).toHaveAccessibleDescription('The month the report covers.');
  await report.focus();
  await page.keyboard.press('ArrowDown');
  const dialog = page.getByRole('dialog', { name: 'Report month' });
  const grid = dialog.getByRole('grid', { name: '2026' });
  await expect(grid).toBeVisible();
  // A year of months in four rows of three, each named by its month and year.
  await expect(grid.getByRole('row')).toHaveCount(4);
  await expect(grid.getByRole('row').first().getByRole('gridcell')).toHaveCount(3);
  await expect(grid.locator('[data-month="2026-01"]')).toHaveAccessibleName('January 2026');
  await expect(grid.locator('[data-month="2026-01"]')).toHaveText('Jan');
  // en-GB names September Sept among its three-letter months: the grid keeps them of one length.
  await expect(grid.locator('[data-month="2026-09"]')).toHaveText('Sep');
  await expect(grid.locator('[data-month="2026-09"]')).toHaveAccessibleName('September 2026');
  // Focus moves to the chosen month, the grid's only tab stop; this month is marked.
  await expect.poll(() => focusedMonth(page)).toBe('2026-10');
  await expect(grid.locator('td[tabindex="0"]')).toHaveCount(1);
  await expect(grid.locator('[data-month="2026-10"]')).toHaveAttribute('aria-selected', 'true');
  await expect(grid.locator('[data-month="2026-10"]')).toHaveAttribute('aria-current', 'date');

  const steps: [string, string][] = [
    ['ArrowRight', '2026-11'],
    ['ArrowRight', '2026-12'],
    // On past the year's end, into the next year.
    ['ArrowRight', '2027-01'],
    ['ArrowLeft', '2026-12'],
    ['ArrowUp', '2026-09'],
    ['ArrowDown', '2026-12'],
    ['Home', '2026-10'],
    ['End', '2026-12'],
    ['PageDown', '2027-12'],
    ['PageUp', '2026-12'],
    ['ArrowDown', '2027-03'],
  ];
  for (const [key, month] of steps) {
    await page.keyboard.press(key);
    await expect.poll(() => focusedMonth(page)).toBe(month);
  }
  await expect(dialog.getByRole('grid', { name: '2027' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(report).toHaveText('March 2027');
  await expect(report).toBeFocused();

  // Space chooses too, and Esc closes without a change.
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedMonth(page)).toBe('2027-03');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press(' ');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(report).toHaveText('February 2027');
  await page.keyboard.press('Enter');
  await expect.poll(() => focusedMonth(page)).toBe('2027-02');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(report).toHaveText('February 2027');
  expect(errors).toEqual([]);
});

test('year buttons, a pressed month, This month and the clear button change the value', async ({
  page,
}) => {
  const billing = field(page, 'Billing');
  const output = page.getByTestId('month-picker-billing');
  await expect(billing).toHaveText('March 2026');
  await billing.click();
  const dialog = page.getByRole('dialog', { name: 'Billing' });
  await dialog.getByRole('button', { name: 'Next year', exact: true }).click();
  await expect(dialog.getByRole('grid', { name: '2027' })).toBeVisible();
  await dialog.locator('[data-month="2027-06"]').click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(billing).toHaveText('June 2027');
  await billing.click();
  await dialog.getByRole('button', { name: 'Previous year', exact: true }).click();
  await dialog.getByRole('button', { name: 'Previous year', exact: true }).click();
  await expect(dialog.getByRole('grid', { name: '2025' })).toBeVisible();
  await dialog.getByRole('button', { name: 'This month', exact: true }).click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(billing).toHaveText('October 2026');
  await billing.click();
  await dialog.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(billing).toHaveText('');
  await expect
    .poll(async () => JSON.parse((await output.textContent())!))
    .toEqual({ billing: null, changes: ['2027-06', '2026-10', null] });

  const report = field(page, 'Report month');
  const clear = wellOf(report).getByRole('button', { name: 'Clear', exact: true });
  await clear.click();
  await expect(report).toHaveText('');
  await expect(report).toBeFocused();
  // Backspace on a clearable field removes its value too.
  await page.keyboard.press('Enter');
  await expect.poll(() => focusedMonth(page)).toBe('2026-10');
  await page.keyboard.press('Enter');
  await expect(report).toHaveText('October 2026');
  await expect(report).toBeFocused();
  await page.keyboard.press('Backspace');
  await expect(report).toHaveText('');
});

test('min and max make the months outside them unavailable', async ({ page }) => {
  const budget = field(page, 'Budget month');
  await budget.click();
  const dialog = page.getByRole('dialog', { name: 'Budget month' });
  // Without a value, focus starts on this month.
  await expect.poll(() => focusedMonth(page)).toBe('2026-10');
  const early = dialog.locator('[data-month="2026-03"]');
  await expect(early).toHaveAttribute('aria-disabled', 'true');
  await early.click({ force: true });
  await expect(dialog).toBeVisible();
  const previous = dialog.getByRole('button', { name: 'Previous year', exact: true });
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('PageUp');
  await expect.poll(() => focusedMonth(page)).toBe('2026-04');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedMonth(page)).toBe('2026-04');
  const next = dialog.getByRole('button', { name: 'Next year', exact: true });
  await next.click();
  await expect(dialog.getByRole('grid', { name: '2027' })).toBeVisible();
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect(dialog.locator('[data-month="2027-04"]')).toHaveAttribute('aria-disabled', 'true');
  await dialog.locator('[data-month="2027-03"]').click();
  await expect(budget).toHaveText('March 2027');
});

test(
  'native forms submit the values, require a value and reset to the defaults',
  { tag: '@engines' },
  async ({ page }) => {
    const submit = page.getByRole('button', { name: 'Submit months', exact: true });
    const submitted = page.getByTestId('month-picker-submitted');
    const budget = field(page, 'Budget month');
    await expect(budget).toHaveAttribute('aria-required', 'true');
    await submit.click();
    // The empty required field keeps the form from submitting and takes focus.
    await expect(budget).toBeFocused();
    await expect(submitted).toHaveText('');
    // Dismiss the native validation bubble first: one engine consumes the next press while it shows.
    await page.keyboard.press('Escape');
    await budget.click();
    await page
      .getByRole('dialog', { name: 'Budget month' })
      .locator('[data-month="2026-12"]')
      .click();
    await submit.click();
    await expect
      .poll(async () => JSON.parse((await submitted.textContent()) || '{}'))
      .toEqual({ report: '2026-10', budget: '2026-12', closed: '' });

    const report = field(page, 'Report month');
    await report.click();
    await page
      .getByRole('dialog', { name: 'Report month' })
      .locator('[data-month="2026-07"]')
      .click();
    await expect(report).toHaveText('July 2026');
    await page.getByRole('button', { name: 'Reset months', exact: true }).click();
    await expect(report).toHaveText('October 2026');
    await expect(budget).toHaveText('Choose a month');
  },
);

test('locales name the months, and right-to-left grids run right to left', async ({ page }) => {
  await expect(field(page, 'Short month')).toHaveText('Oct 26');
  await expect(field(page, 'Monat')).toHaveText('Mai 2026');
  const arabic = field(page, 'Arabic month');
  await arabic.click();
  const popup = openPopup(page);
  await expect(popup).toHaveCSS('direction', 'rtl');
  await expect.poll(() => focusedMonth(page)).toBe('2026-10');
  // Left moves forward, and months run from the right.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedMonth(page)).toBe('2026-11');
  const [october, november] = await Promise.all([
    popup.locator('[data-month="2026-10"]').boundingBox(),
    popup.locator('[data-month="2026-11"]').boundingBox(),
  ]);
  expect(november!.x).toBeLessThan(october!.x);
});

test('disabled, read-only and invalid fields', async ({ page }) => {
  await expect(field(page, 'Disabled month')).toBeDisabled();
  const readOnly = field(page, 'Read only month');
  await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
  await readOnly.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(readOnly).toHaveText('October 2026');
  const invalid = field(page, 'Invalid month');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Choose a later month.');
});

test('the actions under the months keep their labels on one line, also on a phone', async ({
  page,
}) => {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('combobox', { name: 'Report month', exact: true }).click();
    const popup = page.locator('.env-date-picker-popup[data-open]');
    await expect
      .poll(() =>
        popup.locator('.env-date-picker-actions .env-button').evaluateAll((buttons) =>
          buttons.map((button) => {
            const range = document.createRange();
            range.selectNodeContents(button);
            const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
            return `${button.textContent}:${tops.size}`;
          }),
        ),
      )
      .toEqual(['This month:1', 'Clear:1']);
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
  }
});
