import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

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
    all.findIndex((row) => row.hasAttribute('data-centered')),
  );
  return rows.nth(middle + offset);
}
const wellOf = (trigger: Locator) =>
  trigger.locator('xpath=ancestor::*[contains(@class, "env-text-field-control")][1]');
/** The open popup; a closing one can still fade out. */
const openPopup = (page: Page) => page.locator('.env-date-picker-popup[data-open]');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(today);
  await page.goto(`${fixtureUrl}/?fixture=time-picker`);
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
  await expect(hours.locator('[data-centered]')).toHaveText('09');
  await expect(async () => {
    const [hour, minute, box] = await Promise.all([
      hours.locator('[data-centered]').boundingBox(),
      minutes.locator('[data-centered]').boundingBox(),
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
  await expect(hours.locator('[data-centered]')).toHaveText('14');
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
    await expect(hours.locator('[data-centered]')).toHaveText('09');
    // A row below the middle turns to it and becomes the value.
    await (await rowFromMiddle(hours, 2)).click();
    await expect(start).toHaveText('11:30');
    await expect(hours.locator('[data-centered]')).toHaveText('11');
    // Turning the wheel by a row moves the value by one. Minutes every 15 are fewer than the rows
    // the wheel shows, so it shows each once and ends at 45 rather than looping; the keys still
    // wrap around.
    const minutes = wheel(dialog, 'Minutes');
    await expect(minutes.locator('.env-time-list-row')).toHaveCount(4);
    await minutes.hover();
    const row = await minutes
      .locator('[data-centered]')
      .evaluate((element) => element.clientHeight);
    await page.mouse.wheel(0, row);
    await expect(start).toHaveText('11:45');
    await page.mouse.wheel(0, row);
    await expect(minutes.locator('[data-centered]')).toHaveText('45');
    await expect(start).toHaveText('11:45');
    await minutes.focus();
    await page.keyboard.press('ArrowDown');
    await expect(start).toHaveText('11:00');
    await expect(minutes.locator('[data-centered]')).toHaveText('00');
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

test('hourCycle sets the clock whatever the locale writes', async ({ page }) => {
  // en-US on the 24-hour clock: 18:45, with hours from 00 to 23 and no AM/PM wheel.
  const rota = field(page, 'Rota');
  await expect(rota).toHaveText('18:45');
  await rota.focus();
  await page.keyboard.press('ArrowDown');
  const dialog = page.getByRole('dialog', { name: 'Rota' });
  await expect.poll(() => wheelNames(dialog)).toEqual(['Hours', 'Minutes']);
  const hours = wheel(dialog, 'Hours');
  await expect(hours).toHaveAttribute('aria-valuetext', '18');
  await expect(hours).toHaveAttribute('aria-valuemin', '0');
  await expect(hours).toHaveAttribute('aria-valuemax', '23');
  await expect(hours.locator('[data-centered]')).toHaveText('18');
  await expect.poll(() => focusedWheel(page)).toBe('Hours=18');
  await page.keyboard.press('End');
  await expect(rota).toHaveText('23:45');
  await page.keyboard.press('ArrowDown');
  await expect(rota).toHaveText('00:45');
  await page.keyboard.type('7');
  await expect(rota).toHaveText('07:45');
  await page.keyboard.press('Escape');

  // en-GB on the 12-hour clock, as it writes one: 06:45 pm, with its day periods.
  const twelve = field(page, 'Twelve-hour');
  await expect(twelve).toHaveText(/^06:45\spm$/i);
  await twelve.click();
  const twelveDialog = page.getByRole('dialog', { name: 'Twelve-hour' });
  await expect.poll(() => wheelNames(twelveDialog)).toEqual(['Hours', 'Minutes', 'AM/PM']);
  await expect(wheel(twelveDialog, 'Hours')).toHaveAttribute('aria-valuetext', '06');
  await expect.poll(() => focusedWheel(page)).toBe('Hours=6');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('a');
  await expect(twelve).toHaveText(/^06:45\sam$/i);
  await page.keyboard.press('Escape');

  // A date and a time takes it too.
  const shift = field(page, 'Shift start');
  await expect(shift).toHaveText('Oct 21, 2026, 18:00');
  await shift.click();
  const shiftDialog = page.getByRole('dialog', { name: 'Shift start' });
  await expect.poll(() => wheelNames(shiftDialog)).toEqual(['Hours', 'Minutes']);
  await expect(wheel(shiftDialog, 'Hours')).toHaveAttribute('aria-valuetext', '18');
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

test(
  'a mouse wheel turns a wheel a row a notch, and quick notches add up to one calm turn',
  { tag: '@engines' },
  async ({ page }) => {
    const start = field(page, 'Start time');
    await start.click();
    const dialog = page.getByRole('dialog', { name: 'Start time' });
    const minutes = wheel(dialog, 'Minutes');
    await minutes.hover();
    // A notch of a mouse wheel, 100 pixels, is one row, not as far as a page would scroll.
    await page.mouse.wheel(0, 100);
    await expect(start).toHaveText('09:45');
    await expect(minutes.locator('[data-centered]')).toHaveText('45');
    // Notches in quick succession turn on together, a row each, and settle once.
    await page.mouse.wheel(0, -100);
    await page.mouse.wheel(0, -100);
    await expect(start).toHaveText('09:15');
    await expect(minutes).not.toHaveAttribute('data-turning');
    await wheel(dialog, 'Hours').hover();
    await page.mouse.wheel(0, -100);
    await expect(start).toHaveText('08:15');
  },
);

test(
  'a mouse drags a wheel as a finger does, and a quick drag let go glides on',
  { tag: '@engines' },
  async ({ page }) => {
    const start = field(page, 'Start time');
    await start.click();
    const dialog = page.getByRole('dialog', { name: 'Start time' });
    const hours = wheel(dialog, 'Hours');
    const box = (await hours.boundingBox())!;
    const row = await hours
      .locator('.env-time-list-row')
      .first()
      .evaluate((each) => (each as HTMLElement).offsetHeight);
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
    // Dragged up two rows and held still before it is let go, the wheel stops two hours on.
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y - 2 * row, { steps: 12 });
    await expect(hours).toHaveAttribute('data-dragging');
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(start).toHaveText('11:30');
    await expect(hours).not.toHaveAttribute('data-dragging');
    // The click that ends the drag pressed no row.
    await expect(hours.locator('[data-centered]')).toHaveText('11');
    // Down a row on the minutes, which don't loop.
    const minutes = wheel(dialog, 'Minutes');
    const minuteBox = (await minutes.boundingBox())!;
    const minuteX = minuteBox.x + minuteBox.width / 2;
    await page.mouse.move(minuteX, y);
    await page.mouse.down();
    await page.mouse.move(minuteX, y + row, { steps: 8 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(start).toHaveText('11:15');
    // A quick drag let go while moving glides on past where the pointer stopped.
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + row, { steps: 2 });
    await page.mouse.up();
    await expect(hours).not.toHaveAttribute('data-turning');
    const hour = Number(await hours.getAttribute('aria-valuenow'));
    expect(hour).toBeLessThan(10);
  },
);

test(
  'switching between AM and PM keeps the hour and minutes and moves the time by 12 hours',
  { tag: '@engines' },
  async ({ page }) => {
    const reminder = field(page, 'Reminder');
    const output = page.getByTestId('time-picker-reminder');
    await expect(reminder).toHaveText(/^2:00\sPM$/);
    await reminder.click();
    const dialog = page.getByRole('dialog', { name: 'Reminder' });
    const period = wheel(dialog, 'AM/PM');
    // Pressing AM keeps 2:00.
    await (await rowFromMiddle(period, -1)).click();
    await expect(reminder).toHaveText(/^2:00\sAM$/);
    await expect(output).toContainText('"reminder":"02:00"');
    // A turn of the hours still settling doesn't undo AM or PM chosen meanwhile, nor the other way.
    await wheel(dialog, 'Hours').hover();
    await page.mouse.wheel(0, 100);
    await period.hover();
    await page.mouse.wheel(0, 100);
    await expect(reminder).toHaveText(/^3:00\sPM$/);
    await expect(output).toContainText('"reminder":"15:00"');
    await expect(wheel(dialog, 'Hours')).toHaveAttribute('aria-valuetext', '3');
    // The keys keep it too.
    await period.focus();
    await page.keyboard.press('a');
    await expect(reminder).toHaveText(/^3:00\sAM$/);
    await page.keyboard.press('ArrowDown');
    await expect(reminder).toHaveText(/^3:00\sPM$/);
    // Each choice reached the application once.
    await expect(output).toHaveText(
      JSON.stringify({ reminder: '15:00', changes: ['02:00', '03:00', '15:00', '03:00', '15:00'] }),
    );
  },
);

test('while a wheel turns, only the row on the fill takes its colors, and the field waits for it to settle', async ({
  page,
}) => {
  const start = field(page, 'Start time');
  await start.click();
  const hours = wheel(page.getByRole('dialog', { name: 'Start time' }), 'Hours');
  await expect(hours).toHaveAttribute('aria-valuenow', '9');
  // Each frame of the turn: the rows whose text has the fill's color, the rows on the fill, the
  // wheel's position and the field's value.
  await hours.evaluate((column) => {
    const frames: { white: string[]; filled: string[]; top: number; field: string }[] = [];
    (window as unknown as { frames_: typeof frames }).frames_ = frames;
    const trigger = document.querySelector('[role="combobox"]')!;
    const started = performance.now();
    const sample = () => {
      const rows = [...column.querySelectorAll<HTMLElement>('.env-time-list-row')];
      const label = (row: HTMLElement) => row.dataset.value!;
      frames.push({
        white: rows
          .filter((row) => getComputedStyle(row).color === 'rgb(255, 255, 255)')
          .map(label),
        filled: rows
          .filter((row) => getComputedStyle(row).backgroundColor !== 'rgba(0, 0, 0, 0)')
          .map(label),
        top: column.scrollTop,
        field: trigger.textContent ?? '',
      });
      if (performance.now() - started < 1500) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await (await rowFromMiddle(hours, -1)).click();
  await expect(start).toHaveText('08:30');
  await page.waitForTimeout(1600);
  const frames = await page.evaluate(
    () =>
      (
        window as unknown as {
          frames_: { white: string[]; filled: string[]; top: number; field: string }[];
        }
      ).frames_,
  );
  // One row is on the fill in every frame, and it alone has the fill's text color: 9 until the
  // click, then 8 as the wheel turns to it, never flickering back.
  for (const frame of frames) {
    expect(frame.filled).toHaveLength(1);
    expect(frame.white).toEqual(frame.filled);
  }
  const filled = frames.map((frame) => frame.filled[0]);
  expect(filled.slice(filled.indexOf('8'))).not.toContain('9');
  // The field shows 8:30 only once the wheel has come to rest.
  const changed = frames.findIndex((frame) => frame.field === '08:30');
  expect(changed).toBeGreaterThan(0);
  expect(frames.slice(changed).every((frame) => frame.top === frames.at(-1)!.top)).toBe(true);
  expect(frames.slice(0, changed).some((frame) => frame.top !== frames.at(-1)!.top)).toBe(true);
});

/** Each popup action's label and the number of lines it takes. */
const actionLines = (popup: Locator) =>
  popup.locator('.env-date-picker-actions .env-button').evaluateAll((buttons) =>
    buttons.map((button) => {
      const range = document.createRange();
      range.selectNodeContents(button);
      const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
      return `${button.textContent}:${tops.size}`;
    }),
  );

test('Now and Clear keep their labels on one line, also on a phone', async ({ page }) => {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await field(page, 'Start time').click();
    await expect.poll(() => actionLines(openPopup(page))).toEqual(['Now:1', 'Clear:1']);
    await page.keyboard.press('Escape');
    await expect(openPopup(page)).toHaveCount(0);
  }
});
