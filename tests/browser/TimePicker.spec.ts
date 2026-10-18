import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

/** The clock is fixed, so Now and the time the wheels start at without a value stay the same. */
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
const wheel = (scope: Locator, name: string) =>
  scope.getByRole('spinbutton', { name, exact: true });
/** The focused wheel as its name and value, such as Hours=9. */
const focusedWheel = (page: Page) =>
  page.evaluate(() => {
    const active = document.activeElement;
    return active?.getAttribute('role') === 'spinbutton'
      ? `${active.getAttribute('aria-label')}=${active.getAttribute('aria-valuenow')}`
      : null;
  });
/** The names of a popup's wheels, in order. */
const wheelNames = (scope: Locator) =>
  scope.getByRole('spinbutton').evaluateAll((wheels) => wheels.map((each) => each.ariaLabel));
/** The row a number of rows below (or above) a wheel's middle row. */
async function rowFromMiddle(spinbutton: Locator, offset: number) {
  const rows = spinbutton.locator('.env-time-list-row');
  const middle = await rows.evaluateAll((all) =>
    all.findIndex((row) => row.hasAttribute('data-centred')),
  );
  return rows.nth(middle + offset);
}
const wellOf = (trigger: Locator) =>
  trigger.locator('xpath=ancestor::*[contains(@class, "env-text-field-control")][1]');
/** The open popup; a closing one can still fade out. */
const openPopup = (page: Page) => page.locator('.env-date-picker-popup[data-open]');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(today);
  await page.goto(`${fixtureUrl}/?fixture=time-pickers`);
});

test('the field shows its time in the locale and each wheel follows the spinbutton keys', async ({
  page,
}) => {
  const errors = collectErrors(page);
  const start = field(page, 'Start time');
  await expect(start).toHaveText('09:30');
  await expect(start).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(start).toHaveAccessibleDescription('When the shift begins.');
  await start.focus();
  await page.keyboard.press('ArrowDown');
  const dialog = page.getByRole('dialog', { name: 'Start time' });
  const time = dialog.getByRole('group', { name: 'Start time' });
  // A 24-hour clock has hours and minutes, and no day period.
  await expect.poll(() => wheelNames(time)).toEqual(['Hours', 'Minutes']);
  const hours = wheel(time, 'Hours');
  const minutes = wheel(time, 'Minutes');
  await expect(hours).toHaveAttribute('aria-valuenow', '9');
  await expect(hours).toHaveAttribute('aria-valuetext', '09');
  await expect(hours).toHaveAttribute('aria-valuemin', '0');
  await expect(hours).toHaveAttribute('aria-valuemax', '23');
  await expect(minutes).toHaveAttribute('aria-valuetext', '30');
  // The values sit on one line, in the middle of their wheels.
  await expect(hours.locator('[data-centred]')).toHaveText('09');
  await expect(async () => {
    const [hour, minute, box] = await Promise.all([
      hours.locator('[data-centred]').boundingBox(),
      minutes.locator('[data-centred]').boundingBox(),
      hours.boundingBox(),
    ]);
    expect(Math.abs(hour!.y - minute!.y)).toBeLessThan(1);
    expect(Math.abs(hour!.y + hour!.height / 2 - (box!.y + box!.height / 2))).toBeLessThan(1);
  }).toPass();
  // Focus moves to the first wheel; each wheel is one tab stop.
  await expect.poll(() => focusedWheel(page)).toBe('Hours=9');

  // A step chooses the whole time at once, and the popup stays open.
  const steps: [string, string, string][] = [
    ['ArrowDown', 'Hours=10', '10:30'],
    ['ArrowUp', 'Hours=9', '09:30'],
    ['End', 'Hours=23', '23:30'],
    // Hours and minutes wrap around.
    ['ArrowDown', 'Hours=0', '00:30'],
    ['PageDown', 'Hours=5', '05:30'],
    ['PageUp', 'Hours=0', '00:30'],
    ['ArrowRight', 'Minutes=30', '00:30'],
    ['ArrowDown', 'Minutes=45', '00:45'],
    ['ArrowDown', 'Minutes=0', '00:00'],
    ['Home', 'Minutes=0', '00:00'],
    ['ArrowRight', 'Minutes=0', '00:00'],
    ['ArrowLeft', 'Hours=0', '00:00'],
  ];
  for (const [key, focused, shown] of steps) {
    await page.keyboard.press(key);
    await expect.poll(() => focusedWheel(page)).toBe(focused);
    await expect(start).toHaveText(shown);
  }
  // Digits name an hour.
  await page.keyboard.type('14');
  await expect(start).toHaveText('14:00');
  await expect(hours.locator('[data-centred]')).toHaveText('14');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(start).toHaveText('14:00');
  await expect(start).toBeFocused();
  expect(errors).toEqual([]);
});

test(
  'a wheel turned or a row pressed settles its middle row as the value',
  { tag: '@engines' },
  async ({ page }) => {
    const start = field(page, 'Start time');
    await start.click();
    const dialog = page.getByRole('dialog', { name: 'Start time' });
    const hours = wheel(dialog, 'Hours');
    await expect(hours.locator('[data-centred]')).toHaveText('09');
    // A row below the middle turns to it and becomes the value.
    await (await rowFromMiddle(hours, 2)).click();
    await expect(start).toHaveText('11:30');
    await expect(hours.locator('[data-centred]')).toHaveText('11');
    // Turning the wheel by a row moves the value by one; it loops on past the hour.
    const minutes = wheel(dialog, 'Minutes');
    await minutes.hover();
    const row = await minutes.locator('[data-centred]').evaluate((element) => element.clientHeight);
    await page.mouse.wheel(0, row);
    await expect(start).toHaveText('11:45');
    await page.mouse.wheel(0, row);
    await expect(start).toHaveText('11:00');
    await expect(minutes.locator('[data-centred]')).toHaveText('00');
  },
);

test('a 12-hour locale adds its day periods, in the order it writes them', async ({ page }) => {
  const reminder = field(page, 'Reminder');
  await expect(reminder).toHaveText(/^2:00\sPM$/);
  await reminder.click();
  const dialog = page.getByRole('dialog', { name: 'Reminder' });
  await expect.poll(() => wheelNames(dialog)).toEqual(['Hours', 'Minutes', 'AM/PM']);
  await expect(wheel(dialog, 'Hours')).toHaveAttribute('aria-valuetext', '2');
  await expect(wheel(dialog, 'AM/PM')).toHaveAttribute('aria-valuetext', 'PM');
  await expect.poll(() => focusedWheel(page)).toBe('Hours=2');
  // On a 12-hour clock, 12 names the first hour of the half.
  await page.keyboard.type('12');
  await expect(reminder).toHaveText(/^12:00\sPM$/);
  // A names the morning on the day-period wheel.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => focusedWheel(page)).toBe('AM/PM=1');
  await page.keyboard.press('a');
  await expect(reminder).toHaveText(/^12:00\sAM$/);
  // The day periods don't wrap around.
  await page.keyboard.press('ArrowUp');
  await expect(reminder).toHaveText(/^12:00\sAM$/);
  await page.keyboard.press('Escape');

  // Korean writes the day period first, and so do its wheels; German has a 24-hour clock.
  await field(page, 'Korean time').click();
  const korean = page.getByRole('dialog', { name: 'Korean time' });
  await expect.poll(() => wheelNames(korean)).toEqual(['AM/PM', 'Hours', 'Minutes']);
  await page.keyboard.press('Escape');
  await expect(field(page, 'Abfahrt')).toHaveText('18:45');
});

test('a minute between the steps keeps its own row in order', async ({ page }) => {
  const checkIn = field(page, 'Check in');
  await expect(checkIn).toHaveText('10:07');
  await checkIn.click();
  const dialog = page.getByRole('dialog', { name: 'Check in' });
  const minutes = wheel(dialog, 'Minutes');
  await expect(minutes).toHaveAttribute('aria-valuetext', '07');
  await expect(await rowFromMiddle(minutes, -1)).toHaveText('05');
  await expect(await rowFromMiddle(minutes, 1)).toHaveText('10');
  await minutes.focus();
  await page.keyboard.press('ArrowDown');
  await expect(checkIn).toHaveText('10:10');
});

test('min and max make the values outside them unavailable', async ({ page }) => {
  const alarm = field(page, 'Alarm');
  await alarm.click();
  const dialog = page.getByRole('dialog', { name: 'Alarm' });
  const hours = wheel(dialog, 'Hours');
  const minutes = wheel(dialog, 'Minutes');
  // Without a value, the wheels start at the clock's time and choose nothing until turned.
  await expect.poll(() => focusedWheel(page)).toBe('Hours=10');
  await expect(minutes).toHaveAttribute('aria-valuemax', '30');
  await expect(alarm).toHaveText('Choose a time');
  await expect(hours.locator('[data-value="7"]').first()).toHaveAttribute('data-disabled');
  // Steps pass over unavailable hours: Home is the first available, 8 AM.
  await page.keyboard.press('Home');
  await expect(alarm).toHaveText(/^8:00\sAM$/);
  await page.keyboard.press('ArrowUp');
  await expect(alarm).toHaveText(/^11:00\sAM$/);
  // In the afternoon, a time is kept within max, and the later values are unavailable.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('p');
  await expect(alarm).toHaveText(/^6:00\sPM$/);
  await expect(hours.locator('[data-value="7"]').first()).toHaveAttribute('data-disabled');
  await expect(hours.locator('[data-value="6"]').first()).not.toHaveAttribute('data-disabled');
  await expect(minutes.locator('[data-value="30"]').first()).toHaveAttribute('data-disabled');
});

test('Now and Clear change the value, as on the date picker', async ({ page }) => {
  const reminder = field(page, 'Reminder');
  const output = page.getByTestId('time-picker-reminder');
  await reminder.click();
  const dialog = page.getByRole('dialog', { name: 'Reminder' });
  await expect(dialog.getByRole('button')).toHaveText(['Now', 'Clear']);
  await dialog.getByRole('button', { name: 'Now', exact: true }).click();
  await expect(reminder).toHaveText(/^10:00\sAM$/);
  await expect(wheel(dialog, 'AM/PM')).toHaveAttribute('aria-valuetext', 'AM');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(reminder).toHaveText('');
  await expect
    .poll(async () => JSON.parse((await output.textContent())!))
    .toEqual({ reminder: null, changes: ['10:00', null] });

  const start = field(page, 'Start time');
  const clear = wellOf(start).getByRole('button', { name: 'Clear', exact: true });
  await clear.click();
  await expect(start).toHaveText('');
  await expect(start).toBeFocused();
  await expect(clear).toHaveCount(0);
});

test(
  'native forms submit the values, require a value and reset to the defaults',
  { tag: '@engines' },
  async ({ page }) => {
    const submit = page.getByRole('button', { name: 'Submit times', exact: true });
    const submitted = page.getByTestId('time-picker-submitted');
    const alarm = field(page, 'Alarm');
    await expect(alarm).toHaveAttribute('aria-required', 'true');
    await submit.click();
    // The empty required field keeps the form from submitting and takes focus.
    await expect(alarm).toBeFocused();
    await expect(submitted).toHaveText('');
    // Dismiss the native validation bubble first: one engine consumes the next press while it shows.
    await page.keyboard.press('Escape');
    await alarm.click();
    await expect.poll(() => focusedWheel(page)).toBe('Hours=10');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await expect(alarm).toHaveText(/^8:30\sAM$/);
    await page.keyboard.press('Escape');
    await submit.click();
    await expect
      .poll(async () => JSON.parse((await submitted.textContent()) || '{}'))
      .toEqual({ start: '09:30', alarm: '08:30', locked: '' });

    const start = field(page, 'Start time');
    await start.click();
    await expect.poll(() => focusedWheel(page)).toBe('Hours=9');
    await page.keyboard.type('11');
    await expect(start).toHaveText('11:30');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Reset times', exact: true }).click();
    await expect(start).toHaveText('09:30');
    await expect(alarm).toHaveText('Choose a time');
    await expect(page.getByTestId('time-picker-form').locator('input[name="alarm"]')).toHaveValue(
      '',
    );
  },
);

test('disabled, read-only and invalid fields', async ({ page }) => {
  await expect(field(page, 'Disabled time')).toBeDisabled();
  const readOnly = field(page, 'Read only time');
  await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
  await readOnly.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(readOnly).toHaveText('12:00');
  const invalid = field(page, 'Invalid time');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Choose a later time.');
});
