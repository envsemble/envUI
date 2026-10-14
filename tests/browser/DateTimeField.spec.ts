import { test, expect, type Browser, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const dateFixture = `${fixtureUrl}/?fixture=date-time`;
/** Today is fixed, so the calendar marks the same day in every run. */
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
const focusedDate = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.date ?? null);
const wellOf = (trigger: Locator) =>
  trigger.locator('xpath=ancestor::*[contains(@class, "env-text-field-well")][1]');
/** The open calendar popup; a closing one can still fade out. */
const openPopup = (page: Page) => page.locator('.env-date-time-popup[data-open]');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(today);
  await page.goto(dateFixture);
});

test('the field shows its value in the locale and the calendar follows the date picker keys', async ({
  page,
}) => {
  const errors = collectErrors(page);
  const publish = field(page, 'Publish on light');
  await expect(publish).toHaveText('20 Oct 2026');
  await expect(publish).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(publish).toHaveAttribute('aria-expanded', 'false');
  await expect(publish).toHaveAccessibleDescription('The day the report goes out.');
  await publish.focus();
  await page.keyboard.press('ArrowDown');
  const dialog = page.getByRole('dialog', { name: 'Publish on light' });
  await expect(dialog).toBeVisible();
  await expect(publish).toHaveAttribute('aria-expanded', 'true');
  const grid = dialog.getByRole('grid', { name: 'October 2026' });
  await expect(grid).toBeVisible();
  // Focus moves to the chosen day; it is the grid's only tab stop.
  await expect.poll(() => focusedDate(page)).toBe('2026-10-20');
  await expect(grid.locator('td[tabindex="0"]')).toHaveCount(1);
  await expect(grid.locator('[data-date="2026-10-20"]')).toHaveAttribute('aria-selected', 'true');
  await expect(grid.locator('[data-date="2026-10-14"]')).toHaveAttribute('aria-current', 'date');
  await expect(grid.locator('[data-date="2026-10-20"]')).toHaveAccessibleName(
    /Tuesday,? 20 October 2026/,
  );
  // en-GB weeks start on Monday; six weeks keep the calendar's height from month to month.
  await expect(grid.getByRole('columnheader')).toHaveText([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ]);
  await expect(grid.locator('tbody tr')).toHaveCount(6);

  const steps: [string, string][] = [
    ['ArrowRight', '2026-10-21'],
    ['ArrowDown', '2026-10-28'],
    ['ArrowUp', '2026-10-21'],
    ['ArrowLeft', '2026-10-20'],
    ['Home', '2026-10-19'],
    ['End', '2026-10-25'],
    ['PageDown', '2026-11-25'],
    ['Shift+PageDown', '2027-11-25'],
    ['Shift+PageUp', '2026-11-25'],
    ['PageUp', '2026-10-25'],
  ];
  for (const [key, date] of steps) {
    await page.keyboard.press(key);
    await expect.poll(() => focusedDate(page)).toBe(date);
  }
  await expect(dialog.getByRole('grid', { name: 'October 2026' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(publish).toHaveText('25 Oct 2026');
  await expect(publish).toBeFocused();

  // Space chooses too, and Esc closes without a change.
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-25');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press(' ');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(publish).toHaveText('24 Oct 2026');
  await page.keyboard.press('Enter');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-24');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(publish).toHaveText('24 Oct 2026');
  await expect(publish).toBeFocused();
  // A month shorter than the date moves to its last day.
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-24');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-31');
  await page.keyboard.press('PageDown');
  await expect.poll(() => focusedDate(page)).toBe('2026-11-30');
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('month buttons, a pressed day, Today and the clear button change the value', async ({
  page,
}) => {
  const due = field(page, 'Due light');
  const output = page.getByTestId('date-time-due-light');
  await expect(due).toHaveText('Oct 20, 2026');
  await due.click();
  const dialog = page.getByRole('dialog', { name: 'Due light' });
  await expect(dialog).toBeVisible();
  // weekStart={0} starts the weeks on Sunday.
  await expect(dialog.getByRole('columnheader').first()).toHaveText('Sun');
  await dialog.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  await dialog.locator('[data-date="2026-11-05"]').click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(due).toHaveText('Nov 5, 2026');
  await expect
    .poll(async () => JSON.parse((await output.textContent())!))
    .toEqual({ due: '2026-11-05', changes: ['2026-11-05'] });

  await due.click();
  await expect(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Previous month', exact: true }).click();
  await dialog.getByRole('button', { name: 'Previous month', exact: true }).click();
  await expect(dialog.getByRole('grid', { name: 'September 2026' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(due).toHaveText('Oct 14, 2026');

  const clear = wellOf(due).getByRole('button', { name: 'Clear', exact: true });
  await clear.click();
  await expect(due).toHaveText('');
  await expect(due).toBeFocused();
  await expect(clear).toHaveCount(0);
  await expect
    .poll(async () => JSON.parse((await output.textContent())!))
    .toEqual({ due: null, changes: ['2026-11-05', '2026-10-14', null] });
  // Backspace on a clearable field removes its value too.
  await page.keyboard.press('Enter');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-14');
  await page.keyboard.press('Enter');
  await expect(due).toHaveText('Oct 14, 2026');
  await expect(due).toBeFocused();
  await page.keyboard.press('Backspace');
  await expect(due).toHaveText('');
});

test('with a time the calendar stays open for the time field, Now and Done', async ({ page }) => {
  const meeting = field(page, 'Meeting light');
  await expect(meeting).toHaveText('21 Oct 2026, 09:30');
  await meeting.click();
  const dialog = page.getByRole('dialog', { name: 'Meeting light' });
  await expect(dialog).toBeVisible();
  const time = dialog.getByLabel('Time', { exact: true });
  await expect(time).toHaveValue('09:30');
  await dialog.locator('[data-date="2026-10-23"]').click();
  await expect(dialog).toBeVisible();
  await expect(meeting).toHaveText('23 Oct 2026, 09:30');
  await time.fill('14:45');
  await expect(meeting).toHaveText('23 Oct 2026, 14:45');
  await dialog.getByRole('button', { name: 'Now', exact: true }).click();
  await expect(meeting).toHaveText('14 Oct 2026, 10:00');
  await expect(dialog.locator('[data-date="2026-10-14"]')).toHaveAttribute('aria-selected', 'true');
  await expect(time).toHaveValue('10:00');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(meeting).toBeFocused();

  // Clear empties the field; a day chosen next starts at the default time.
  await meeting.click();
  await dialog.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(meeting).toHaveText('');
  await meeting.click();
  await expect(dialog.getByLabel('Time', { exact: true })).toHaveValue('');
  await dialog.locator('[data-date="2026-10-22"]').click();
  await expect(meeting).toHaveText('22 Oct 2026, 09:00');
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);
});

test('min and max make the days outside them unavailable and keep values within them', async ({
  page,
}) => {
  const review = field(page, 'Review by light');
  await review.click();
  const dialog = page.getByRole('dialog', { name: 'Review by light' });
  // Without a value, focus starts on today.
  await expect.poll(() => focusedDate(page)).toBe('2026-10-14');
  const early = dialog.locator('[data-date="2026-10-09"]');
  await expect(early).toHaveAttribute('aria-disabled', 'true');
  await early.click({ force: true });
  await expect(dialog).toBeVisible();
  const previous = dialog.getByRole('button', { name: 'Previous month', exact: true });
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('PageUp');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-10');
  const next = dialog.getByRole('button', { name: 'Next month', exact: true });
  await next.click();
  await expect(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await next.click({ force: true });
  await expect(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  await expect(dialog.locator('[data-date="2026-11-16"]')).toHaveAttribute('aria-disabled', 'true');
  await dialog.locator('[data-date="2026-11-15"]').click();
  await expect(review).toHaveText('15 Nov 2026');

  // With a time, a day's default time is kept within min.
  const start = field(page, 'Compact start light');
  await start.click();
  await expect.poll(() => focusedDate(page)).toBe('2026-10-14');
  await page.keyboard.press('Enter');
  await expect(start).toHaveText('14 Oct 2026, 08:00');
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);
});

test('native forms submit the values, require a value and reset to the defaults', async ({
  page,
}) => {
  const submit = page.getByRole('button', { name: 'Submit dates light', exact: true });
  const submitted = page.getByTestId('date-time-submitted-light');
  const review = field(page, 'Review by light');
  await expect(review).toHaveAttribute('aria-required', 'true');
  await submit.click();
  // The empty required field keeps the form from submitting and takes focus.
  await expect(review).toBeFocused();
  await expect(submitted).toHaveText('');
  // Dismiss the native validation bubble first: one engine consumes the next press while it shows.
  await page.keyboard.press('Escape');
  await review.click();
  await page
    .getByRole('dialog', { name: 'Review by light' })
    .locator('[data-date="2026-10-30"]')
    .click();
  await submit.click();
  // The empty read-only field, though required, does not keep the form from submitting.
  await expect
    .poll(async () => JSON.parse((await submitted.textContent()) || '{}'))
    .toEqual({
      publish: '2026-10-20',
      meeting: '2026-10-21T09:30',
      review: '2026-10-30',
      approved: '',
    });

  const publish = field(page, 'Publish on light');
  await publish.click();
  await page
    .getByRole('dialog', { name: 'Publish on light' })
    .locator('[data-date="2026-10-27"]')
    .click();
  await expect(publish).toHaveText('27 Oct 2026');
  await page.getByRole('button', { name: 'Reset dates light', exact: true }).click();
  await expect(publish).toHaveText('20 Oct 2026');
  await expect(review).toHaveText('Choose a day');
  await expect(
    page.getByTestId('date-time-form-light').locator('input[name="review"]'),
  ).toHaveValue('');
});

test('the calendar is the Popover surface with its day colors in both themes, and compact fields line up', async ({
  page,
}) => {
  for (const theme of ['light', 'dark'] as const) {
    await field(page, `Publish on ${theme}`).click();
    const popup = openPopup(page);
    await expect(popup).toBeVisible();
    await expect(popup.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
      'data-env-theme',
      theme,
    );
    const colors = await popup.evaluate(async (element) => {
      // The popup grows in; its rows have their final size once the transition has run.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.allSettled(element.getAnimations().map(({ finished }) => finished));
      const resolve = (value: string) => {
        const probe = document.createElement('div');
        probe.style.color = value;
        element.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      };
      const style = getComputedStyle(element);
      const selected = getComputedStyle(
        element.querySelector('[aria-selected="true"] .env-calendar-day-mark')!,
      );
      const current = getComputedStyle(
        element.querySelector('[aria-current="date"] .env-calendar-day-mark')!,
      );
      return {
        popup: resolve('var(--color-popup)'),
        background: style.backgroundColor,
        border: Number.parseFloat(style.borderTopWidth),
        radius: Number.parseFloat(style.borderTopLeftRadius),
        selectedFill: selected.backgroundColor,
        selectedText: selected.color,
        selectedRole: resolve('var(--color-calendar-selected)'),
        onSelectedRole: resolve('var(--color-on-calendar-selected)'),
        todayRing: current.boxShadow,
        todayRole: resolve('var(--color-calendar-today)'),
      };
    });
    expect(colors.background).toBe(colors.popup);
    expect(colors.border).toBeGreaterThanOrEqual(1);
    expect(colors.radius).toBeGreaterThanOrEqual(24);
    expect(colors.selectedFill).toBe(colors.selectedRole);
    expect(colors.selectedText).toBe(colors.onSelectedRole);
    expect(colors.todayRing).toContain(colors.todayRole);
    await page.keyboard.press('Escape');
    await expect(openPopup(page)).toHaveCount(0);

    const toolbar = page.getByTestId(`date-time-compact-${theme}`);
    const [fieldBox, buttonBox] = await Promise.all([
      wellOf(field(page, `Compact start ${theme}`)).boundingBox(),
      toolbar.getByRole('button', { name: `Compact neighbour ${theme}` }).boundingBox(),
    ]);
    expect(fieldBox!.height).toBeCloseTo(32, 0);
    expect(buttonBox!.height).toBeCloseTo(32, 0);
  }
});

test('in a dialog Esc closes the calendar first, then the dialog', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Schedule dark', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Schedule dark' });
  const remind = dialog.getByRole('combobox', { name: 'Remind me dark', exact: true });
  await remind.click();
  const popup = openPopup(page);
  await expect(popup).toBeVisible();
  await expect(popup.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
    'data-env-theme',
    'dark',
  );
  await popup.locator('[data-date="2026-10-23"]').click();
  await expect(remind).toHaveText('23 Oct 2026, 14:00');
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(remind).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('near the bottom of the window the calendar opens above the field', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  const due = field(page, 'Due light');
  await due.evaluate((element) => {
    const top = element.getBoundingClientRect().top + scrollY;
    scrollTo(0, top - innerHeight + 80);
  });
  await due.click();
  const popup = openPopup(page);
  await expect(popup).toHaveAttribute('data-side', 'top');
  await expect(async () => {
    const [popupBox, fieldBox] = await Promise.all([popup.boundingBox(), due.boundingBox()]);
    expect(popupBox!.y).toBeGreaterThanOrEqual(0);
    expect(popupBox!.y + popupBox!.height).toBeLessThanOrEqual(fieldBox!.y + 1);
  }).toPass();
});

test('the calendar fits a phone-wide window', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await field(page, 'Meeting light').click();
  const popup = openPopup(page);
  await expect(popup).toBeVisible();
  await expect(async () => {
    const box = (await popup.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(391);
    const days = await popup
      .locator('.env-calendar-day-mark')
      .evaluateAll((marks) => marks.map((mark) => mark.getBoundingClientRect().right));
    expect(Math.max(...days)).toBeLessThanOrEqual(box.x + box.width);
  }).toPass();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

async function openOnTouchScreen(browser: Browser) {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(today);
  await page.goto(dateFixture);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  return page;
}

test('on touch screens days are touch-sized and the calendar still fits the phone', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
  const page = await openOnTouchScreen(browser);
  const meeting = field(page, 'Meeting light');
  await expect(meeting).toHaveCSS('font-size', '16px');
  await meeting.tap();
  const popup = openPopup(page);
  await expect(popup).toBeVisible();
  const geometry = await popup.evaluate(async (element) => {
    // The popup grows in; its rows have their final size once the transition has run.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.allSettled(element.getAnimations().map(({ finished }) => finished));
    const box = element.getBoundingClientRect();
    const day = element.querySelector('.env-calendar-day')!.getBoundingClientRect();
    return { left: box.left, right: box.right, day: day.height };
  });
  expect(geometry.day).toBeCloseTo(44, 0);
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(390);
  await popup.locator('[data-date="2026-10-28"]').tap();
  await expect(meeting).toHaveText('28 Oct 2026, 09:30');
  await page.context().close();
});

test('a calendar on its own chooses a day, stays within its range and follows right-to-left text', async ({
  page,
}) => {
  const calendar = page.getByTestId('calendar-light');
  const output = page.getByTestId('calendar-value-light');
  // Its aria-label names the calendar: a group around the month's grid, so two calendars showing
  // the same month stay apart.
  await expect(page.getByRole('group', { name: 'Planner light', exact: true })).toHaveAttribute(
    'data-testid',
    'calendar-light',
  );
  await expect(page.getByTestId('calendar-rtl-light')).not.toHaveAttribute('role');
  const grid = calendar.getByRole('grid', { name: 'October 2026' });
  // Every week keeps seven cells for assistive technology too, so each day stays under its weekday.
  const weeks = grid.locator('tbody tr');
  for (const week of [0, 4, 5]) await expect(weeks.nth(week).getByRole('gridcell')).toHaveCount(7);
  await expect(weeks.first().getByRole('gridcell').nth(3)).toHaveAccessibleName(
    /Thursday,? 1 October 2026/,
  );
  await grid.locator('[data-date="2026-10-22"]').click();
  await expect(output).toHaveText('2026-10-22');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-22');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(output).toHaveText('2026-10-23');
  await page.keyboard.press('PageUp');
  await page.keyboard.press('PageUp');
  // min is the first of September.
  await expect.poll(() => focusedDate(page)).toBe('2026-09-01');
  await expect(calendar.getByRole('grid', { name: 'September 2026' })).toBeVisible();
  // Tab leaves the grid for the next control, and the grid keeps one tab stop.
  await expect(calendar.locator('td[tabindex="0"]')).toHaveCount(1);

  const rtl = page.getByTestId('calendar-rtl-light');
  await rtl.locator('[data-date="2026-10-14"]').click();
  await expect(rtl.locator('[data-date="2026-10-14"] .env-calendar-day-mark')).toHaveText('١٤');
  // Left moves forward in right-to-left text, and the forward month button points left.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-15');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-13');
  const [previousBox, nextBox] = await Promise.all([
    rtl.locator('.env-calendar-previous').boundingBox(),
    rtl.locator('.env-calendar-next').boundingBox(),
  ]);
  expect(previousBox!.x).toBeGreaterThan(nextBox!.x);
});

test('disabled, read-only and invalid fields', async ({ page }) => {
  await expect(field(page, 'Disabled date light')).toBeDisabled();
  const readOnly = field(page, 'Read only date light');
  await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
  await readOnly.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(readOnly).toHaveText('20 Oct 2026');
  const invalid = field(page, 'Invalid date light');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Choose a later day.');
  // An empty field's label rests inside it, and floats once it has focus.
  const label = wellOf(invalid).locator('label');
  const resting = (await label.boundingBox())!.y;
  await invalid.focus();
  await expect.poll(async () => (await label.boundingBox())!.y).toBeLessThan(resting - 8);
});

test('a key that does not move the day leaves focus where people take it next', async ({
  page,
}) => {
  const meeting = field(page, 'Meeting light');
  await meeting.click();
  const dialog = page.getByRole('dialog', { name: 'Meeting light' });
  await expect.poll(() => focusedDate(page)).toBe('2026-10-21');
  // Home on the week's first day stays there.
  await page.keyboard.press('Home');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-19');
  await page.keyboard.press('Home');
  await page.keyboard.press('Tab');
  const time = dialog.getByLabel('Time', { exact: true });
  await expect(time).toBeFocused();
  await time.fill('10:15');
  await expect(meeting).toHaveText('21 Oct 2026, 10:15');
  await expect(time).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);

  // So do End on its last day and keys that would pass min.
  const start = field(page, 'Compact start light');
  await start.click();
  const startDialog = page.getByRole('dialog', { name: 'Compact start light' });
  await expect.poll(() => focusedDate(page)).toBe('2026-10-14');
  await page.keyboard.press('PageUp');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-14');
  await page.keyboard.press('End');
  await page.keyboard.press('End');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-18');
  await page.keyboard.press('Tab');
  const startTime = startDialog.getByLabel('Time', { exact: true });
  await expect(startTime).toBeFocused();
  await startTime.fill('08:30');
  await expect(start).toHaveText('14 Oct 2026, 08:30');
  await expect(startTime).toBeFocused();
});

test('days before 1970 keep their date and time', async ({ page }) => {
  const launch = field(page, 'Launch light');
  const output = page.getByTestId('date-time-launch-light');
  await expect(launch).toHaveText('20 Dec 1969, 09:30');
  await launch.click();
  const dialog = page.getByRole('dialog', { name: 'Launch light' });
  await expect(dialog.getByRole('grid', { name: 'December 1969' })).toBeVisible();
  await expect.poll(() => focusedDate(page)).toBe('1969-12-20');
  await expect(dialog.getByRole('columnheader').first()).toHaveText('Mon');
  await expect(dialog.locator('[data-date="1969-12-01"]')).toHaveAccessibleName(
    /Monday,? 1 December 1969/,
  );
  await dialog.locator('[data-date="1969-12-22"]').click();
  await expect(output).toHaveText('1969-12-22T09:30');
  await expect(launch).toHaveText('22 Dec 1969, 09:30');
  await dialog.getByLabel('Time', { exact: true }).fill('23:45');
  await expect(output).toHaveText('1969-12-22T23:45');
  // The months on either side of 1970 follow each other as any others do.
  await dialog.locator('[data-date="1969-12-22"]').focus();
  await page.keyboard.press('PageDown');
  await expect.poll(() => focusedDate(page)).toBe('1970-01-22');
  await page.keyboard.press('Enter');
  await expect(output).toHaveText('1970-01-22T23:45');
  await page.keyboard.press('Shift+PageUp');
  await expect.poll(() => focusedDate(page)).toBe('1969-01-22');
  await page.keyboard.press('Enter');
  await expect(output).toHaveText('1969-01-22T23:45');
  await expect(launch).toHaveText('22 Jan 1969, 23:45');
});

test('a locale with a calendar of its own names the Gregorian months the grid shows', async ({
  page,
}) => {
  const persian = page.getByTestId('calendar-persian-light');
  const expected = await page.evaluate(() => {
    const day = new Date(Date.UTC(2026, 9, 14));
    const format = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat('fa-IR', { ...options, calendar: 'gregory', timeZone: 'UTC' }).format(
        day,
      );
    return {
      month: format({ month: 'long', year: 'numeric' }),
      day: format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };
  });
  await expect(persian.getByRole('grid', { name: expected.month })).toBeVisible();
  await expect(persian.locator('[data-date="2026-10-14"]')).toHaveAccessibleName(expected.day);
  await expect(persian.locator('[data-date="2026-10-14"] .env-calendar-day-mark')).toHaveText('۱۴');
});

test('a field named by other text, and one without a label that shows its placeholder', async ({
  page,
}) => {
  const starts = field(page, 'Starts on light');
  await starts.click();
  await expect(page.getByRole('dialog', { name: 'Starts on light' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(openPopup(page)).toHaveCount(0);

  // Without a label to rest in the field, its placeholder shows.
  const ends = field(page, 'Ends light');
  const placeholder = ends.locator('.env-date-time-placeholder');
  await expect(placeholder).toHaveText('Pick an end');
  expect(
    await placeholder.evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-field-placeholder)';
      element.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      return getComputedStyle(element).color === expected;
    }),
  ).toBe(true);
});

test('a calendar opened from right-to-left text runs right to left', async ({ page }) => {
  const arabic = field(page, 'Arabic date light');
  await arabic.click();
  const popup = openPopup(page);
  await expect(popup).toHaveCSS('direction', 'rtl');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-14');
  // Left moves forward, the forward month button points left, and days run from the right.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedDate(page)).toBe('2026-10-15');
  const [previousBox, nextBox, fourteenth, fifteenth] = await Promise.all([
    popup.locator('.env-calendar-previous').boundingBox(),
    popup.locator('.env-calendar-next').boundingBox(),
    popup.locator('[data-date="2026-10-14"]').boundingBox(),
    popup.locator('[data-date="2026-10-15"]').boundingBox(),
  ]);
  expect(previousBox!.x).toBeGreaterThan(nextBox!.x);
  expect(fifteenth!.x).toBeLessThan(fourteenth!.x);
});

test('pressing the label of an open field closes its calendar, as pressing the field does', async ({
  page,
}) => {
  const publish = field(page, 'Publish on light');
  await publish.click();
  await expect(openPopup(page)).toBeVisible();
  await wellOf(publish).locator('label').click();
  await expect(openPopup(page)).toHaveCount(0);
  await expect(page.locator('.env-date-time-popup')).toHaveCount(0);
  await expect(publish).toBeFocused();
  // Closed, the label opens it.
  await wellOf(publish).locator('label').click();
  await expect(openPopup(page)).toBeVisible();
});
