import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/MonthPicker.fixture.tsx';
import { box, collectErrors, css, keyboard, mouse } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  // Today is fixed, so this month is the same in every run; timers run as they do.
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-14T10:00:00') });
  mount(fixture);
});

afterEach(() => {
  vi.useRealTimers();
});

const field = (name: string) => page.getByRole('combobox', { name, exact: true });
const text = (name: string) => () => field(name).element().textContent;
const focusedMonth = () => (document.activeElement as HTMLElement | null)?.dataset.month ?? null;
/** The open popup; a closing one can still fade out. */
const openPopup = () => document.querySelector<HTMLElement>('.env-date-picker-popup[data-open]');
const month = (value: string) =>
  openPopup()!.querySelector<HTMLElement>(`[data-month="${value}"]`)!;
/** Presses an element at its center, as a person's mouse does. */
async function click(element: Element) {
  const { x, y, width, height } = box(element);
  await mouse.click(x + width / 2, y + height / 2);
}
const isClosed = () => expect.poll(openPopup).toBeNull();
const isFocused = (name: string) => expect.element(field(name)).toHaveFocus();
const dialog = (name: string) => page.getByRole('dialog', { name });
const button = (dialogName: string, name: string) =>
  dialog(dialogName).getByRole('button', { name, exact: true });
const grid = (dialogName: string, year: string) =>
  dialog(dialogName).getByRole('grid', { name: year });

test('the field shows its month in the locale and the grid follows the calendar keys, right to left too', async () => {
  const errors = collectErrors();
  const report = field('Report month');
  expect(text('Report month')()).toBe('October 2026');
  await expect.element(report).toHaveAttribute('aria-haspopup', 'dialog');
  await expect.element(report).toHaveAccessibleDescription('The month the report covers.');
  (report.element() as HTMLElement).focus();
  await keyboard.press('ArrowDown');
  const year = grid('Report month', '2026');
  await expect.element(year).toBeVisible();
  // A year of months in four rows of three, each named by its month and year.
  expect(year.getByRole('row').elements()).toHaveLength(4);
  expect(year.getByRole('row').first().getByRole('gridcell').elements()).toHaveLength(3);
  await expect.element(month('2026-01')).toHaveAccessibleName('January 2026');
  expect(month('2026-01').textContent).toBe('Jan');
  // en-GB names September Sept among its three-letter months: the grid keeps them of one length.
  expect(month('2026-09').textContent).toBe('Sep');
  await expect.element(month('2026-09')).toHaveAccessibleName('September 2026');
  // Focus moves to the chosen month, the grid's only tab stop; this month is marked.
  await expect.poll(focusedMonth).toBe('2026-10');
  expect(year.element().querySelectorAll('td[tabindex="0"]')).toHaveLength(1);
  expect(month('2026-10').getAttribute('aria-selected')).toBe('true');
  expect(month('2026-10').getAttribute('aria-current')).toBe('date');

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
  for (const [key, value] of steps) {
    await keyboard.press(key);
    await expect.poll(focusedMonth, { message: key }).toBe(value);
  }
  await expect.element(grid('Report month', '2027')).toBeVisible();
  await keyboard.press('Enter');
  await isClosed();
  expect(text('Report month')()).toBe('March 2027');
  await isFocused('Report month');

  // Space chooses too, and Esc closes without a change.
  await keyboard.press('ArrowDown');
  await expect.poll(focusedMonth).toBe('2027-03');
  await keyboard.press('ArrowLeft');
  await keyboard.press(' ');
  await isClosed();
  expect(text('Report month')()).toBe('February 2027');
  await keyboard.press('Enter');
  await expect.poll(focusedMonth).toBe('2027-02');
  await keyboard.press('ArrowRight');
  await keyboard.press('Escape');
  await isClosed();
  expect(text('Report month')()).toBe('February 2027');
  expect(errors).toEqual([]);

  // Locales name the months, and right-to-left grids run right to left.
  expect(text('Short month')()).toBe('Oct 26');
  expect(text('Monat')()).toBe('Mai 2026');
  await field('Arabic month').click();
  await expect.poll(openPopup).not.toBeNull();
  expect(css(openPopup()!, 'direction')).toBe('rtl');
  await expect.poll(focusedMonth).toBe('2026-10');
  // Left moves forward, and months run from the right.
  await keyboard.press('ArrowLeft');
  await expect.poll(focusedMonth).toBe('2026-11');
  expect(box(month('2026-11')).x).toBeLessThan(box(month('2026-10')).x);
});

test('year buttons, a pressed month, This month and the clear button change the value', async () => {
  const billing = field('Billing');
  expect(text('Billing')()).toBe('March 2026');
  await billing.click();
  await button('Billing', 'Next year').click();
  await expect.element(grid('Billing', '2027')).toBeVisible();
  await click(month('2027-06'));
  await isClosed();
  expect(text('Billing')()).toBe('June 2027');
  await billing.click();
  await button('Billing', 'Previous year').click();
  await button('Billing', 'Previous year').click();
  await expect.element(grid('Billing', '2025')).toBeVisible();
  await button('Billing', 'This month').click();
  await isClosed();
  expect(text('Billing')()).toBe('October 2026');
  await billing.click();
  await button('Billing', 'Clear').click();
  await expect.poll(text('Billing')).toBe('');
  await expect
    .poll(() => JSON.parse(page.getByTestId('month-picker-billing').element().textContent!))
    .toEqual({ billing: null, changes: ['2027-06', '2026-10', null] });

  const report = field('Report month');
  const well = report.element().closest('.env-text-field-control')!;
  await click(well.querySelector('button[aria-label="Clear"]')!);
  await expect.poll(text('Report month')).toBe('');
  await isFocused('Report month');
  // Backspace on a clearable field removes its value too.
  await keyboard.press('Enter');
  await expect.poll(focusedMonth).toBe('2026-10');
  await keyboard.press('Enter');
  await expect.poll(text('Report month')).toBe('October 2026');
  await isFocused('Report month');
  await keyboard.press('Backspace');
  await expect.poll(text('Report month')).toBe('');
});

test('min and max make the months outside them unavailable', async () => {
  await field('Budget month').click();
  // Without a value, focus starts on this month.
  await expect.poll(focusedMonth).toBe('2026-10');
  const early = month('2026-03');
  expect(early.getAttribute('aria-disabled')).toBe('true');
  await click(early);
  await expect.element(dialog('Budget month')).toBeVisible();
  const previous = button('Budget month', 'Previous year');
  await expect.element(previous).toHaveAttribute('aria-disabled', 'true');
  await keyboard.press('PageUp');
  await expect.poll(focusedMonth).toBe('2026-04');
  await keyboard.press('ArrowLeft');
  await expect.poll(focusedMonth).toBe('2026-04');
  const next = button('Budget month', 'Next year');
  await next.click();
  await expect.element(grid('Budget month', '2027')).toBeVisible();
  await expect.element(next).toHaveAttribute('aria-disabled', 'true');
  expect(month('2027-04').getAttribute('aria-disabled')).toBe('true');
  await click(month('2027-03'));
  await expect.poll(text('Budget month')).toBe('March 2027');
});

test(
  'native forms submit the values, require a value and reset to the defaults',
  { tags: ['engines'] },
  async () => {
    const submit = page.getByRole('button', { name: 'Submit months', exact: true });
    const submitted = () => page.getByTestId('month-picker-submitted').element().textContent;
    const budget = field('Budget month');
    await expect.element(budget).toHaveAttribute('aria-required', 'true');
    await submit.click();
    // The empty required field keeps the form from submitting and takes focus.
    await isFocused('Budget month');
    expect(submitted()).toBe('');
    // Dismiss the native validation bubble first: one engine consumes the next press while it
    // shows.
    await keyboard.press('Escape');
    await budget.click();
    await expect.poll(openPopup).not.toBeNull();
    await click(month('2026-12'));
    await submit.click();
    await expect
      .poll(() => JSON.parse(submitted() || '{}'))
      .toEqual({ report: '2026-10', budget: '2026-12', closed: '' });

    await field('Report month').click();
    await expect.poll(openPopup).not.toBeNull();
    await click(month('2026-07'));
    await expect.poll(text('Report month')).toBe('July 2026');
    await page.getByRole('button', { name: 'Reset months', exact: true }).click();
    await expect.poll(text('Report month')).toBe('October 2026');
    expect(text('Budget month')()).toBe('Choose a month');

    // A read-only field doesn't open.
    await field('Read only month').click();
    await new Promise(requestAnimationFrame);
    expect(page.getByRole('dialog').elements()).toHaveLength(0);
    expect(text('Read only month')()).toBe('October 2026');
  },
);
