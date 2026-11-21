import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/DatePicker.fixture.tsx';
import {
  addStyle,
  animationsDone,
  box,
  collectErrors,
  css,
  keyboard,
  mouse,
  nextFrames,
  shown,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const today = new Date('2026-10-14T10:00:00');

beforeEach(() => {
  vi.setSystemTime(today);
  mount(fixture);
});

afterEach(() => {
  vi.useRealTimers();
});

const field = (name: string) => page.getByRole('combobox', { name, exact: true });
const textOf = (locator: Locator) => () => locator.element().textContent;
const focusedDate = () => (document.activeElement as HTMLElement | null)?.dataset.date ?? null;
const focusedEntry = () => {
  const wheel = document.activeElement as HTMLElement | null;
  return wheel?.getAttribute('role') === 'spinbutton'
    ? `${wheel.dataset.part}:${wheel.dataset.value}`
    : null;
};
const timeWheel = (scope: Locator, name: 'Hours' | 'Minutes') =>
  scope
    .getByRole('group', { name: 'Time', exact: true })
    .getByRole('spinbutton', { name, exact: true });
const wellOf = (trigger: Locator) =>
  trigger.element().closest<HTMLElement>('.env-text-field-control')!;
const labelOf = (trigger: Locator) =>
  trigger.element().closest('.env-text-field')!.querySelector<HTMLElement>(':scope > label')!;
const openPopup = () => document.querySelector<HTMLElement>('.env-date-picker-popup[data-open]');
const popups = () => document.querySelectorAll('.env-date-picker-popup');
const isOpen = () =>
  expect.poll(() => openPopup() !== null && shown(page.elementLocator(openPopup()!))).toBe(true);
const isClosed = () => expect.poll(openPopup).toBeNull();
const dayIn = (scope: Element | Locator, date: string) =>
  (scope instanceof Element ? scope : scope.element()).querySelector<HTMLElement>(
    `[data-date="${date}"]`,
  )!;
const focus = (target: Locator | Element) =>
  (target instanceof Element ? (target as HTMLElement) : (target.element() as HTMLElement)).focus();
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
async function press(target: Element) {
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const at = box(target);
  await mouse.click(at.x + at.width / 2, at.y + at.height / 2);
}
const output = (testId: string) => () =>
  JSON.parse(page.getByTestId(testId).element().textContent || '{}');

test('the field shows its value in the locale and the calendar follows the date picker keys', async () => {
  const errors = collectErrors();
  const publish = field('Publish on light');
  expect(textOf(publish)()).toBe('20 Oct 2026');
  await expect.element(publish).toHaveAttribute('aria-haspopup', 'dialog');
  await expect.element(publish).toHaveAttribute('aria-expanded', 'false');
  await expect.element(publish).toHaveAccessibleDescription('The day the report goes out.');
  focus(publish);
  await keyboard.press('ArrowDown');
  const dialog = page.getByRole('dialog', { name: 'Publish on light' });
  await expect.element(dialog).toBeVisible();
  await expect.element(publish).toHaveAttribute('aria-expanded', 'true');
  const grid = dialog.getByRole('grid', { name: 'October 2026' });
  await expect.element(grid).toBeVisible();
  await expect.poll(focusedDate).toBe('2026-10-20');
  expect(grid.element().querySelectorAll('td[tabindex="0"]')).toHaveLength(1);
  expect(dayIn(grid, '2026-10-20').getAttribute('aria-selected')).toBe('true');
  expect(dayIn(grid, '2026-10-14').getAttribute('aria-current')).toBe('date');
  const card = dialog.element();
  await animationsDone(card);
  const mark = (date: string) =>
    card.querySelector(`[data-date="${date}"] > .env-calendar-day-mark`)!;
  const probe = document.createElement('div');
  probe.style.color = 'var(--env-color-fg-primary)';
  card.append(probe);
  const accent = css(probe, 'color');
  probe.remove();
  const [first, second] = [mark('2026-10-13'), mark('2026-10-14')].map((each) =>
    each.getBoundingClientRect(),
  );
  expect(first!.width).toBeCloseTo(32, 0);
  expect(second!.left - first!.right).toBeGreaterThanOrEqual(-0.5);
  expect(css(mark('2026-10-14'), 'color')).toBe(accent);
  expect(css(mark('2026-10-14'), 'box-shadow')).toBe('none');
  expect(
    Math.abs(
      box(card.querySelector('.env-calendar')!).width -
        box(card.querySelector('.env-picker-popup-body')!).width,
    ),
  ).toBeLessThan(0.5);
  expect(box(card.querySelector('.env-calendar-title')!).x).toBeLessThan(
    box(card.querySelector('.env-calendar-previous')!).x,
  );
  await expect
    .element(page.elementLocator(dayIn(grid, '2026-10-20')))
    .toHaveAccessibleName(/Tuesday,? 20 October 2026/);
  const headers = grid.getByRole('columnheader').elements();
  expect(headers.map((each) => each.textContent)).toEqual([
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
    'Su',
  ]);
  expect(headers[0]!.getAttribute('abbr')).toBe('Monday');
  expect(grid.element().querySelectorAll('tbody tr')).toHaveLength(6);

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
    await keyboard.press(key);
    await expect.poll(focusedDate).toBe(date);
  }
  await expect.element(dialog.getByRole('grid', { name: 'October 2026' })).toBeVisible();
  await keyboard.press('Enter');
  await isClosed();
  await expect.poll(textOf(publish)).toBe('25 Oct 2026');
  await isFocused(publish);

  await keyboard.press('ArrowDown');
  await expect.poll(focusedDate).toBe('2026-10-25');
  await keyboard.press('ArrowLeft');
  await keyboard.press(' ');
  await isClosed();
  await expect.poll(textOf(publish)).toBe('24 Oct 2026');
  await keyboard.press('Enter');
  await expect.poll(focusedDate).toBe('2026-10-24');
  await keyboard.press('ArrowRight');
  await keyboard.press('Escape');
  await isClosed();
  expect(textOf(publish)()).toBe('24 Oct 2026');
  await isFocused(publish);
  await keyboard.press('ArrowDown');
  await expect.poll(focusedDate).toBe('2026-10-24');
  await keyboard.press('End');
  for (let step = 0; step < 6; step++) await keyboard.press('ArrowRight');
  await expect.poll(focusedDate).toBe('2026-10-31');
  await keyboard.press('PageDown');
  await expect.poll(focusedDate).toBe('2026-11-30');
  await keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('a calendar opened again while it fades out moves focus to the chosen day', async () => {
  addStyle('.env-popup[data-ending-style] { transition-duration: 60s; }');
  const grown = async () => {
    await nextFrames();
    await animationsDone(openPopup()!);
  };
  const publish = field('Publish on light');
  focus(publish);
  await keyboard.press('ArrowDown');
  await expect.poll(focusedDate).toBe('2026-10-20');
  await grown();
  await keyboard.press('ArrowLeft');
  await keyboard.press(' ');
  await expect.poll(textOf(publish)).toBe('19 Oct 2026');
  expect(document.querySelectorAll('.env-date-picker-popup[data-ending-style]')).toHaveLength(1);
  await isFocused(publish);
  await keyboard.press('Enter');
  await expect
    .poll(() => document.querySelectorAll('.env-date-picker-popup[data-open]').length)
    .toBe(1);
  await expect.poll(focusedDate).toBe('2026-10-19');
  expect(popups()).toHaveLength(1);
  await keyboard.press('ArrowRight');
  await expect.poll(focusedDate).toBe('2026-10-20');
  await grown();
  await keyboard.press('Escape');
  await isFocused(publish);
  await expect
    .poll(() => document.querySelectorAll('.env-date-picker-popup[data-ending-style]').length)
    .toBe(1);
  await keyboard.press('ArrowDown');
  await expect.poll(focusedDate).toBe('2026-10-19');
});

test('month buttons, a pressed day, Today and the clear button change the value; the label of an open field closes its calendar; a read-only field opens none and an empty one keeps its label above it with focus', async () => {
  const due = field('Due light');
  const changes = output('date-picker-due-light');
  expect(textOf(due)()).toBe('Oct 20, 2026');
  await due.click();
  const dialog = page.getByRole('dialog', { name: 'Due light' });
  await expect.element(dialog).toBeVisible();
  expect(dialog.getByRole('columnheader').elements()[0]!.textContent).toBe('Su');
  await dialog.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect.element(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  await press(dayIn(dialog, '2026-11-05'));
  await isClosed();
  await expect.poll(textOf(due)).toBe('Nov 5, 2026');
  await expect.poll(changes).toEqual({ due: '2026-11-05', changes: ['2026-11-05'] });

  await due.click();
  await expect.element(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Previous month', exact: true }).click();
  await dialog.getByRole('button', { name: 'Previous month', exact: true }).click();
  await expect.element(dialog.getByRole('grid', { name: 'September 2026' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Today', exact: true }).click();
  await isClosed();
  await expect.poll(textOf(due)).toBe('Oct 14, 2026');

  const clear = () => wellOf(due).querySelector<HTMLElement>('button[aria-label="Clear"]');
  await press(clear()!);
  await expect.poll(textOf(due)).toBe('');
  await isFocused(due);
  await expect.poll(() => clear() !== null && shown(page.elementLocator(clear()!))).toBe(false);
  await expect.poll(changes).toEqual({ due: null, changes: ['2026-11-05', '2026-10-14', null] });
  await keyboard.press('Enter');
  await expect.poll(focusedDate).toBe('2026-10-14');
  await keyboard.press('Enter');
  await expect.poll(textOf(due)).toBe('Oct 14, 2026');
  await isFocused(due);
  await keyboard.press('Backspace');
  await expect.poll(textOf(due)).toBe('');

  const publish = field('Publish on light');
  await publish.click();
  await isOpen();
  await press(labelOf(publish));
  await isClosed();
  await expect.poll(() => popups().length).toBe(0);
  await isFocused(publish);
  await press(labelOf(publish));
  await isOpen();
  await keyboard.press('Escape');
  await isClosed();

  const readOnly = field('Read only date light');
  await readOnly.click();
  await nextFrames();
  expect(page.getByRole('dialog').query()).toBeNull();
  expect(textOf(readOnly)()).toBe('20 Oct 2026');
  const label = labelOf(field('Invalid date light'));
  const resting = box(label);
  expect(resting.y + resting.height).toBeLessThanOrEqual(
    box(wellOf(field('Invalid date light'))).y,
  );
  focus(field('Invalid date light'));
  await nextFrames();
  expect(box(label)).toEqual(resting);
});

test('with a time the calendar stays open beside the time wheels, with Now and Clear', async () => {
  const meeting = field('Meeting light');
  expect(textOf(meeting)()).toBe('21 Oct 2026, 09:30');
  await meeting.click();
  const dialog = page.getByRole('dialog', { name: 'Meeting light' });
  await expect.element(dialog).toBeVisible();
  const time = dialog.getByRole('group', { name: 'Time', exact: true });
  await expect.element(timeWheel(dialog, 'Hours')).toHaveAttribute('aria-valuenow', '9');
  await expect.element(timeWheel(dialog, 'Minutes')).toHaveAttribute('aria-valuenow', '30');
  await expect
    .poll(() => {
      const calendar = box(dialog.element().querySelector('.env-calendar')!);
      const column = box(dialog.element().querySelector('.env-date-picker-time')!);
      const heights = time
        .getByRole('spinbutton')
        .elements()
        .map((wheel) => box(wheel).height);
      return (
        column.x > calendar.x + calendar.width - 1 &&
        Math.abs(column.height - calendar.height) < 1 &&
        new Set(heights).size === 1
      );
    })
    .toBe(true);
  await press(dayIn(dialog, '2026-10-23'));
  await expect.element(dialog).toBeVisible();
  await expect.poll(textOf(meeting)).toBe('23 Oct 2026, 09:30');
  focus(timeWheel(dialog, 'Hours'));
  await keyboard.type('14');
  await expect.poll(textOf(meeting)).toBe('23 Oct 2026, 14:30');
  await keyboard.press('ArrowRight');
  await keyboard.press('ArrowDown');
  await expect.poll(textOf(meeting)).toBe('23 Oct 2026, 14:45');
  await expect.element(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Now', exact: true }).click();
  await expect.poll(textOf(meeting)).toBe('14 Oct 2026, 10:00');
  expect(dayIn(dialog, '2026-10-14').getAttribute('aria-selected')).toBe('true');
  await expect.element(timeWheel(dialog, 'Hours')).toHaveAttribute('aria-valuenow', '10');
  await expect.element(timeWheel(dialog, 'Minutes')).toHaveAttribute('aria-valuenow', '0');
  expect(dialog.getByRole('button', { name: 'Done' }).query()).toBeNull();
  await keyboard.press('Escape');
  await isClosed();
  await isFocused(meeting);

  await meeting.click();
  await isOpen();
  await dialog.getByRole('button', { name: 'Clear', exact: true }).click();
  await isClosed();
  await expect.poll(textOf(meeting)).toBe('');
  await meeting.click();
  await isOpen();
  await expect.element(timeWheel(dialog, 'Hours')).toHaveAttribute('aria-valuenow', '9');
  expect(time.getByRole('spinbutton').elements()).toHaveLength(2);
  await press(dayIn(dialog, '2026-10-22'));
  await expect.poll(textOf(meeting)).toBe('22 Oct 2026, 09:00');
  await keyboard.press('Escape');
  await isClosed();
});

test('min and max make the days outside them unavailable and keep values within them', async () => {
  const review = field('Review by light');
  await review.click();
  const dialog = page.getByRole('dialog', { name: 'Review by light' });
  await expect.poll(focusedDate).toBe('2026-10-14');
  const early = dayIn(dialog, '2026-10-09');
  expect(early.getAttribute('aria-disabled')).toBe('true');
  await press(early);
  await expect.element(dialog).toBeVisible();
  const previous = dialog.getByRole('button', { name: 'Previous month', exact: true });
  await expect.element(previous).toHaveAttribute('aria-disabled', 'true');
  await keyboard.press('PageUp');
  await expect.poll(focusedDate).toBe('2026-10-10');
  const next = dialog.getByRole('button', { name: 'Next month', exact: true });
  await next.click();
  await expect.element(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  await expect.element(next).toHaveAttribute('aria-disabled', 'true');
  await next.click({ force: true });
  await expect.element(dialog.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  expect(dayIn(dialog, '2026-11-16').getAttribute('aria-disabled')).toBe('true');
  await press(dayIn(dialog, '2026-11-15'));
  await expect.poll(textOf(review)).toBe('15 Nov 2026');

  const start = field('Compact start light');
  await start.click();
  await expect.poll(focusedDate).toBe('2026-10-14');
  await keyboard.press('Enter');
  await expect.poll(textOf(start)).toBe('14 Oct 2026, 08:00');
  const startDialog = page.getByRole('dialog', { name: 'Compact start light' });
  const hourRow = (hour: number) =>
    timeWheel(startDialog, 'Hours').element().querySelector(`[data-value="${hour}"]`)!;
  expect(hourRow(7).hasAttribute('data-disabled')).toBe(true);
  expect(hourRow(8).hasAttribute('data-disabled')).toBe(false);
  await press(dayIn(startDialog, '2026-10-15'));
  await expect.poll(() => hourRow(7).hasAttribute('data-disabled')).toBe(false);
  await keyboard.press('Escape');
  await isClosed();
});

test(
  'native forms submit the values, require a value and reset to the defaults',
  { tags: ['engines'] },
  async () => {
    const submit = page.getByRole('button', { name: 'Submit dates light', exact: true });
    const submitted = output('date-picker-submitted-light');
    const review = field('Review by light');
    await expect.element(review).toHaveAttribute('aria-required', 'true');
    await submit.click();
    await isFocused(review);
    expect(page.getByTestId('date-picker-submitted-light').element().textContent).toBe('');
    await keyboard.press('Escape');
    await review.click();
    await isOpen();
    await press(dayIn(page.getByRole('dialog', { name: 'Review by light' }), '2026-10-30'));
    await submit.click();
    await expect.poll(submitted).toEqual({
      publish: '2026-10-20',
      meeting: '2026-10-21T09:30',
      review: '2026-10-30',
      approved: '',
    });

    const publish = field('Publish on light');
    await publish.click();
    await isOpen();
    await press(dayIn(page.getByRole('dialog', { name: 'Publish on light' }), '2026-10-27'));
    await expect.poll(textOf(publish)).toBe('27 Oct 2026');
    await page.getByRole('button', { name: 'Reset dates light', exact: true }).click();
    await expect.poll(textOf(publish)).toBe('20 Oct 2026');
    await expect.poll(textOf(review)).toBe('Choose a day');
    expect(
      page
        .getByTestId('date-picker-form-light')
        .element()
        .querySelector<HTMLInputElement>('input[name="review"]')!.value,
    ).toBe('');
  },
);

test('in a dialog Esc closes the calendar first, then the dialog', async () => {
  const trigger = page.getByRole('button', { name: 'Schedule dark', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Schedule dark' });
  const remind = dialog.getByRole('combobox', { name: 'Remind me dark', exact: true });
  await remind.click();
  await isOpen();
  const popup = openPopup()!;
  expect(popup.closest('[data-env-theme]')!.getAttribute('data-env-theme')).toBe('dark');
  await press(dayIn(popup, '2026-10-23'));
  await expect.poll(textOf(remind)).toBe('23 Oct 2026, 14:00');
  await keyboard.press('Escape');
  await isClosed();
  await expect.element(dialog).toBeVisible();
  await isFocused(remind);
  await keyboard.press('Escape');
  await expect.poll(() => dialog.query()).toBeNull();
  await isFocused(trigger);
});

test(
  'near the bottom of the window the calendar opens above the field',
  { tags: ['engines'] },
  async () => {
    await page.viewport(1000, 700);
    const due = field('Due light');
    const top = due.element().getBoundingClientRect().top + scrollY;
    scrollTo(0, top - innerHeight + 80);
    await due.click();
    await expect.poll(() => openPopup()?.getAttribute('data-side')).toBe('top');
    await expect
      .poll(() => {
        const popup = box(openPopup()!);
        return popup.y >= 0 && popup.y + popup.height <= box(due).y + 1;
      })
      .toBe(true);
  },
);

test('the calendar fits a phone-wide window, and on touch screens its days are touch-sized, as is the tap area of the Clear button', async () => {
  const fits = () => {
    const popup = openPopup();
    if (!popup) return false;
    const placed = box(popup);
    const days = [...popup.querySelectorAll('.env-calendar-day-mark')].map(
      (mark) => mark.getBoundingClientRect().right,
    );
    return (
      placed.x >= 0 &&
      placed.x + placed.width <= 391 &&
      Math.max(...days) <= placed.x + placed.width
    );
  };
  await page.viewport(390, 800);
  await field('Meeting light').click();
  await expect.poll(fits).toBe(true);
  expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
  await keyboard.press('Escape');
  await isClosed();

  await commands.emulateTouch(true);
  try {
    await page.viewport(390, 844);
    mount(fixture);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    const meeting = field('Meeting light');
    expect(css(meeting, 'font-size')).toBe('16px');
    const clear = page.getByRole('button', { name: 'Clear' }).first().element();
    clear.scrollIntoView({ block: 'center' });
    await animationsDone(clear);
    const clearBox = box(clear);
    expect(clearBox.height).toBeLessThan(44);
    const reaches = (offset: number) =>
      clear.contains(
        document.elementFromPoint(
          clearBox.x + clearBox.width / 2,
          clearBox.y + clearBox.height / 2 + offset,
        ),
      );
    expect([reaches(-21), reaches(21)]).toEqual([true, true]);
    const tap = async (target: Element) => {
      target.scrollIntoView({ block: 'nearest' });
      const at = box(target);
      await commands.touch('touchStart', at.x + at.width / 2, at.y + at.height / 2);
      await commands.touch('touchEnd');
    };
    await tap(meeting.element());
    await isOpen();
    const popup = openPopup()!;
    await nextFrames();
    await animationsDone(popup);
    expect(box(popup.querySelector('.env-calendar-day-mark')!).height).toBeCloseTo(44, 0);
    expect(fits()).toBe(true);
    await tap(dayIn(popup, '2026-10-28'));
    await expect.poll(textOf(meeting)).toBe('28 Oct 2026, 09:30');
  } finally {
    await commands.emulateTouch(false);
  }
});

test('a calendar on its own chooses a day, stays within its range and follows right-to-left text, as does one opened from right-to-left text', async () => {
  const calendar = page.getByTestId('calendar-light');
  const value = textOf(page.getByTestId('calendar-value-light'));
  await expect
    .element(page.getByRole('group', { name: 'Planner light', exact: true }))
    .toHaveAttribute('data-testid', 'calendar-light');
  expect(page.getByTestId('calendar-rtl-light').element().hasAttribute('role')).toBe(false);
  const grid = calendar.getByRole('grid', { name: 'October 2026' });
  const weeks = grid.element().querySelectorAll('tbody tr');
  for (const week of [0, 4, 5])
    expect(page.elementLocator(weeks[week]!).getByRole('gridcell').elements()).toHaveLength(7);
  await expect
    .element(
      page.elementLocator(page.elementLocator(weeks[0]!).getByRole('gridcell').elements()[3]!),
    )
    .toHaveAccessibleName(/Thursday,? 1 October 2026/);
  await press(dayIn(grid, '2026-10-22'));
  await expect.poll(value).toBe('2026-10-22');
  await expect.poll(focusedDate).toBe('2026-10-22');
  await keyboard.press('ArrowRight');
  await keyboard.press('Enter');
  await expect.poll(value).toBe('2026-10-23');
  await keyboard.press('PageUp');
  await keyboard.press('PageUp');
  await expect.poll(focusedDate).toBe('2026-09-01');
  await expect.element(calendar.getByRole('grid', { name: 'September 2026' })).toBeVisible();
  expect(calendar.element().querySelectorAll('td[tabindex="0"]')).toHaveLength(1);

  const rtl = page.getByTestId('calendar-rtl-light').element();
  await press(dayIn(rtl, '2026-10-14'));
  expect(dayIn(rtl, '2026-10-14').querySelector('.env-calendar-day-mark')!.textContent).toBe('١٤');
  await keyboard.press('ArrowLeft');
  await expect.poll(focusedDate).toBe('2026-10-15');
  await keyboard.press('ArrowRight');
  await keyboard.press('ArrowRight');
  await expect.poll(focusedDate).toBe('2026-10-13');
  expect(box(rtl.querySelector('.env-calendar-previous')!).x).toBeGreaterThan(
    box(rtl.querySelector('.env-calendar-next')!).x,
  );

  await field('Arabic date light').click();
  await isOpen();
  const popup = openPopup()!;
  expect(css(popup, 'direction')).toBe('rtl');
  await expect.poll(focusedDate).toBe('2026-10-14');
  await keyboard.press('ArrowLeft');
  await expect.poll(focusedDate).toBe('2026-10-15');
  expect(box(popup.querySelector('.env-calendar-previous')!).x).toBeGreaterThan(
    box(popup.querySelector('.env-calendar-next')!).x,
  );
  expect(box(dayIn(popup, '2026-10-15')).x).toBeLessThan(box(dayIn(popup, '2026-10-14')).x);
});

test(
  'a key that does not move the day leaves focus where people take it next, and days before 1970 move as any others',
  { tags: ['engines'] },
  async () => {
    const meeting = field('Meeting light');
    await meeting.click();
    const dialog = page.getByRole('dialog', { name: 'Meeting light' });
    await expect.poll(focusedDate).toBe('2026-10-21');
    await keyboard.press('Home');
    await expect.poll(focusedDate).toBe('2026-10-19');
    await keyboard.press('Home');
    await keyboard.press('Tab');
    await expect.poll(focusedEntry).toBe('hour:9');
    await keyboard.press('ArrowDown');
    await expect.poll(textOf(meeting)).toBe('21 Oct 2026, 10:30');
    await expect.poll(focusedEntry).toBe('hour:10');
    await expect.element(dialog).toBeVisible();
    await keyboard.press('Escape');
    await isClosed();

    const start = field('Compact start light');
    await start.click();
    const startDialog = page.getByRole('dialog', { name: 'Compact start light' });
    await expect.poll(focusedDate).toBe('2026-10-14');
    await keyboard.press('PageUp');
    await keyboard.press('ArrowLeft');
    await expect.poll(focusedDate).toBe('2026-10-14');
    await keyboard.press('End');
    await keyboard.press('End');
    await expect.poll(focusedDate).toBe('2026-10-18');
    await keyboard.press('Tab');
    await expect.poll(focusedEntry).toBe('hour:10');
    await keyboard.type('08');
    await expect.poll(focusedEntry).toBe('hour:8');
    await expect.poll(textOf(start)).toBe('14 Oct 2026, 08:00');
    await keyboard.press('ArrowRight');
    await keyboard.type('3');
    await expect.poll(focusedEntry).toBe('minute:30');
    await expect.poll(textOf(start)).toBe('14 Oct 2026, 08:30');
    await expect.element(startDialog).toBeVisible();
    await keyboard.press('Escape');
    await isClosed();

    const launch = field('Launch light');
    const value = textOf(page.getByTestId('date-picker-launch-light'));
    await launch.click();
    const launchDialog = page.getByRole('dialog', { name: 'Launch light' });
    await expect.element(launchDialog.getByRole('grid', { name: 'December 1969' })).toBeVisible();
    await expect.poll(focusedDate).toBe('1969-12-20');
    await press(dayIn(launchDialog, '1969-12-22'));
    await expect.poll(value).toBe('1969-12-22T09:30');
    focus(timeWheel(launchDialog, 'Hours'));
    await keyboard.press('End');
    await keyboard.press('ArrowRight');
    await keyboard.press('End');
    await expect.poll(value).toBe('1969-12-22T23:45');
    focus(dayIn(launchDialog, '1969-12-22'));
    await keyboard.press('PageDown');
    await expect.poll(focusedDate).toBe('1970-01-22');
    await keyboard.press('Enter');
    await expect.poll(value).toBe('1970-01-22T23:45');
    await keyboard.press('Shift+PageUp');
    await expect.poll(focusedDate).toBe('1969-01-22');
    await keyboard.press('Enter');
    await expect.poll(value).toBe('1969-01-22T23:45');
    await expect.poll(textOf(launch)).toBe('22 Jan 1969, 23:45');
  },
);

test(
  'keeps its minimum width in a container sized to its content, and fits a narrower one',
  { tags: ['engines'] },
  async () => {
    const toolbar = page.getByTestId('date-picker-toolbar-light');
    const toolbarField = box(toolbar.element().querySelector('.env-date-picker')!);
    const button = box(toolbar.getByRole('button', { name: 'Schedule' }));
    expect(toolbarField.width).toBeGreaterThanOrEqual(192);
    expect(
      Math.abs(toolbarField.y + toolbarField.height / 2 - (button.y + button.height / 2)),
    ).toBeLessThan(2);
    const narrow = page.getByTestId('date-picker-narrow-light');
    await expect
      .poll(() => Math.round(box(narrow.element().querySelector('.env-date-picker')!).width))
      .toBe(Math.round(box(narrow).width));
    expect(Math.round(box(narrow).width)).toBe(128);
  },
);

test("a picker's popup takes the application's presets above its calendar and a note in its footer", async () => {
  mount({ default: fixture.PickerPopupContentFixture });
  const due = field('Due');
  await due.click();
  await isOpen();
  const popup = openPopup()!;
  const tomorrow = page.getByRole('button', { name: 'Tomorrow' });
  const header = tomorrow.element().closest('.env-picker-popup-header')!;
  expect(popup.contains(header)).toBe(true);
  expect(box(header).y).toBeLessThan(box(popup.querySelector('.env-calendar')!).y);
  const note = page.getByTestId('zone-note').element();
  const footer = note.closest('.env-picker-popup-footer')!;
  expect(box(note).x).toBeGreaterThan(box(page.getByRole('button', { name: 'Today' })).x);
  expect(footer).not.toBeNull();
  expect(dayIn(popup, '2026-10-17').getAttribute('aria-disabled')).toBe('true');
  await tomorrow.click();
  await isClosed();
  await expect.poll(() => page.getByTestId('due').element().textContent).toBe('2026-10-15');
});
