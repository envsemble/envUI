import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/TimePicker.fixture.tsx';
import { box, collectErrors, keyboard, mouse, nextFrames, waitOnRealTime } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  // The clock is fixed, so Now and the time the wheels start at without a value stay the same;
  // timers run as they do.
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-14T10:00:00') });
  mount(fixture);
});

afterEach(() => {
  vi.useRealTimers();
});

const field = (name: string) => page.getByRole('combobox', { name, exact: true });
/** What a field shows, its spaces plain, such as the narrow one before PM. */
const text = (name: string) => () => field(name).element().textContent!.replace(/\s/g, ' ');
const dialog = (name: string) => page.getByRole('dialog', { name, exact: true });
const wheel = (scope: Locator, name: string) =>
  scope.getByRole('spinbutton', { name, exact: true }).element() as HTMLElement;
const centered = (wheel: Element) => () => wheel.querySelector('[data-centered]')?.textContent;
/** The focused wheel as its name and value, such as Hours=9. */
const focusedWheel = () => {
  const active = document.activeElement;
  return active?.getAttribute('role') === 'spinbutton'
    ? `${active.getAttribute('aria-label')}=${active.getAttribute('aria-valuenow')}`
    : null;
};
/** The names of a popup's wheels, in order. */
const wheelNames = (scope: Locator) => () =>
  scope
    .getByRole('spinbutton')
    .elements()
    .map((each) => each.getAttribute('aria-label'));
/** The row a number of rows below (or above) a wheel's middle row. */
function rowFromMiddle(wheel: Element, offset: number) {
  const rows = [...wheel.querySelectorAll('.env-time-list-row')];
  return rows[rows.findIndex((row) => row.hasAttribute('data-centered')) + offset]!;
}
/** The open popup; a closing one can still fade out. */
const openPopup = () => document.querySelector('.env-date-picker-popup[data-open]');
const isClosed = () => expect.poll(openPopup).toBeNull();
const reminderOutput = () =>
  JSON.parse(page.getByTestId('time-picker-reminder').element().textContent!);
const middle = (element: Element) => {
  const { x, y, width, height } = box(element);
  return { x: x + width / 2, y: y + height / 2 };
};
async function click(element: Element) {
  const { x, y } = middle(element);
  await mouse.click(x, y);
}
async function hover(element: Element) {
  const { x, y } = middle(element);
  await mouse.move(x, y);
}

test('the field shows its time in the locale and each wheel follows the spinbutton keys', async () => {
  const errors = collectErrors();
  const start = field('Start time');
  expect(text('Start time')()).toBe('09:30');
  await expect.element(start).toHaveAttribute('aria-haspopup', 'dialog');
  await expect.element(start).toHaveAccessibleDescription('When the shift begins.');
  (start.element() as HTMLElement).focus();
  await keyboard.press('ArrowDown');
  const time = dialog('Start time').getByRole('group', { name: 'Start time' });
  // A 24-hour clock has hours and minutes, and no day period.
  await expect.poll(wheelNames(time)).toEqual(['Hours', 'Minutes']);
  const hours = wheel(time, 'Hours');
  const minutes = wheel(time, 'Minutes');
  expect(hours.getAttribute('aria-valuenow')).toBe('9');
  expect(hours.getAttribute('aria-valuetext')).toBe('09');
  expect(hours.getAttribute('aria-valuemin')).toBe('0');
  expect(hours.getAttribute('aria-valuemax')).toBe('23');
  expect(minutes.getAttribute('aria-valuetext')).toBe('30');
  // The values sit on one line, in the middle of their wheels.
  expect(centered(hours)()).toBe('09');
  await expect
    .poll(() => {
      const hour = box(hours.querySelector('[data-centered]')!);
      const minute = box(minutes.querySelector('[data-centered]')!);
      const column = box(hours);
      return (
        Math.abs(hour.y - minute.y) < 1 &&
        Math.abs(hour.y + hour.height / 2 - (column.y + column.height / 2)) < 1
      );
    })
    .toBe(true);
  // Focus moves to the first wheel; each wheel is one tab stop.
  await expect.poll(focusedWheel).toBe('Hours=9');

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
    await keyboard.press(key);
    await expect.poll(focusedWheel, { message: key }).toBe(focused);
    await expect.poll(text('Start time'), { message: key }).toBe(shown);
  }
  // Digits name an hour.
  await keyboard.type('14');
  await expect.poll(text('Start time')).toBe('14:00');
  await expect.poll(centered(hours)).toBe('14');
  await expect.element(dialog('Start time')).toBeVisible();
  await keyboard.press('Escape');
  await isClosed();
  expect(text('Start time')()).toBe('14:00');
  await expect.element(start).toHaveFocus();
  expect(errors).toEqual([]);
});

test(
  'a wheel turned or a row pressed settles its middle row as the value',
  { tags: ['engines'] },
  async () => {
    await field('Start time').click();
    const scope = dialog('Start time');
    const hours = wheel(scope, 'Hours');
    await expect.poll(centered(hours)).toBe('09');
    // A row below the middle turns to it and becomes the value.
    await click(rowFromMiddle(hours, 2));
    await expect.poll(text('Start time')).toBe('11:30');
    await expect.poll(centered(hours)).toBe('11');
    // Turning the wheel by a row moves the value by one. Minutes every 15 are fewer than the rows
    // the wheel shows, so it shows each once and ends at 45 rather than looping; the keys still
    // wrap around.
    const minutes = wheel(scope, 'Minutes');
    expect(minutes.querySelectorAll('.env-time-list-row')).toHaveLength(4);
    await hover(minutes);
    const row = minutes.querySelector('[data-centered]')!.clientHeight;
    await mouse.wheel(0, row);
    await expect.poll(text('Start time')).toBe('11:45');
    await mouse.wheel(0, row);
    await expect.poll(centered(minutes)).toBe('45');
    expect(text('Start time')()).toBe('11:45');
    minutes.focus();
    await keyboard.press('ArrowDown');
    await expect.poll(text('Start time')).toBe('11:00');
    await expect.poll(centered(minutes)).toBe('00');
  },
);

test('min and max make the values outside them unavailable', async () => {
  await field('Alarm').click();
  const scope = dialog('Alarm');
  const hours = wheel(scope, 'Hours');
  const minutes = wheel(scope, 'Minutes');
  const row = (wheel: Element, value: string) => wheel.querySelector(`[data-value="${value}"]`)!;
  // Without a value, the wheels start at the clock's time and choose nothing until turned.
  await expect.poll(focusedWheel).toBe('Hours=10');
  expect(minutes.getAttribute('aria-valuemax')).toBe('30');
  expect(text('Alarm')()).toBe('Choose a time');
  expect(row(hours, '7').hasAttribute('data-disabled')).toBe(true);
  // Steps pass over unavailable hours: Home is the first available, 8 AM.
  await keyboard.press('Home');
  await expect.poll(text('Alarm')).toBe('8:00 AM');
  await keyboard.press('ArrowUp');
  await expect.poll(text('Alarm')).toBe('11:00 AM');
  // In the afternoon, a time is kept within max, and the later values are unavailable.
  await keyboard.press('ArrowRight');
  await keyboard.press('ArrowRight');
  await keyboard.press('p');
  await expect.poll(text('Alarm')).toBe('6:00 PM');
  await expect.poll(() => row(hours, '7').hasAttribute('data-disabled')).toBe(true);
  expect(row(hours, '6').hasAttribute('data-disabled')).toBe(false);
  expect(row(minutes, '30').hasAttribute('data-disabled')).toBe(true);
});

test('Now and Clear change the value, as on the date picker', async () => {
  await field('Reminder').click();
  const scope = dialog('Reminder');
  await expect
    .poll(() =>
      scope
        .getByRole('button')
        .elements()
        .map((each) => each.textContent),
    )
    .toEqual(['Now', 'Clear']);
  await scope.getByRole('button', { name: 'Now', exact: true }).click();
  await expect.poll(text('Reminder')).toBe('10:00 AM');
  expect(wheel(scope, 'AM/PM').getAttribute('aria-valuetext')).toBe('AM');
  await expect.element(scope).toBeVisible();
  await scope.getByRole('button', { name: 'Clear', exact: true }).click();
  await isClosed();
  expect(text('Reminder')()).toBe('');
  await expect.poll(reminderOutput).toEqual({ reminder: null, changes: ['10:00', null] });

  const start = field('Start time');
  const well = start.element().closest('.env-text-field-control')!;
  await click(well.querySelector('button[aria-label="Clear"]')!);
  await expect.poll(text('Start time')).toBe('');
  await expect.element(start).toHaveFocus();
  await expect.poll(() => well.querySelector('button[aria-label="Clear"]')).toBeNull();
});

test(
  'native forms submit the values, require a value and reset to the defaults',
  { tags: ['engines'] },
  async () => {
    const submit = page.getByRole('button', { name: 'Submit times', exact: true });
    const submitted = () => page.getByTestId('time-picker-submitted').element().textContent;
    const alarm = field('Alarm');
    await expect.element(alarm).toHaveAttribute('aria-required', 'true');
    await submit.click();
    // The empty required field keeps the form from submitting and takes focus.
    await expect.element(alarm).toHaveFocus();
    expect(submitted()).toBe('');
    // Dismiss the native validation bubble first: one engine consumes the next press while it
    // shows.
    await keyboard.press('Escape');
    await alarm.click();
    await expect.poll(focusedWheel).toBe('Hours=10');
    await keyboard.press('Home');
    await keyboard.press('ArrowRight');
    await keyboard.press('ArrowDown');
    await expect.poll(text('Alarm')).toBe('8:30 AM');
    await keyboard.press('Escape');
    await isClosed();
    await submit.click();
    await expect
      .poll(() => JSON.parse(submitted() || '{}'))
      .toEqual({ start: '09:30', alarm: '08:30', locked: '' });

    await field('Start time').click();
    await expect.poll(focusedWheel).toBe('Hours=9');
    await keyboard.type('11');
    await expect.poll(text('Start time')).toBe('11:30');
    await keyboard.press('Escape');
    await isClosed();
    await page.getByRole('button', { name: 'Reset times', exact: true }).click();
    await expect.poll(text('Start time')).toBe('09:30');
    expect(text('Alarm')()).toBe('Choose a time');
    const form = page.getByTestId('time-picker-form').element();
    expect(form.querySelector<HTMLInputElement>('input[name="alarm"]')!.value).toBe('');

    // A read-only field doesn't open: a popup would be in the page by the next frames.
    await field('Read only time').click();
    await nextFrames();
    expect(page.getByRole('dialog').elements()).toHaveLength(0);
    expect(text('Read only time')()).toBe('12:00');
  },
);

test(
  'a mouse wheel turns a wheel a row a notch, and quick notches add up to one calm turn',
  { tags: ['engines'] },
  async () => {
    await field('Start time').click();
    const scope = dialog('Start time');
    const minutes = wheel(scope, 'Minutes');
    await expect.poll(focusedWheel).toBe('Hours=9');
    await hover(minutes);
    // A notch of a mouse wheel, 100 pixels, is one row, not as far as a page would scroll.
    await mouse.wheel(0, 100);
    await expect.poll(text('Start time')).toBe('09:45');
    await expect.poll(centered(minutes)).toBe('45');
    // Notches in quick succession turn on together, a row each, and settle once.
    await mouse.wheel(0, -100);
    await mouse.wheel(0, -100);
    await expect.poll(text('Start time')).toBe('09:15');
    await expect.poll(() => minutes.hasAttribute('data-turning')).toBe(false);
    await hover(wheel(scope, 'Hours'));
    await mouse.wheel(0, -100);
    await expect.poll(text('Start time')).toBe('08:15');
  },
);

test(
  'a mouse drags a wheel as a finger does, and a quick drag let go glides on',
  { tags: ['engines'] },
  async () => {
    await field('Start time').click();
    const scope = dialog('Start time');
    const hours = wheel(scope, 'Hours');
    await expect.poll(focusedWheel).toBe('Hours=9');
    const row = hours.querySelector<HTMLElement>('.env-time-list-row')!.offsetHeight;
    const { x, y } = middle(hours);
    // Dragged up two rows and held still before it is let go, the wheel stops two hours on.
    await mouse.move(x, y);
    await mouse.down();
    await mouse.move(x, y - 2 * row, { steps: 12 });
    await expect.poll(() => hours.hasAttribute('data-dragging')).toBe(true);
    await waitOnRealTime(150);
    await mouse.up();
    await expect.poll(text('Start time')).toBe('11:30');
    await expect.poll(() => hours.hasAttribute('data-dragging')).toBe(false);
    // The click that ends the drag pressed no row.
    expect(centered(hours)()).toBe('11');
    // Down a row on the minutes, which don't loop.
    const minuteX = middle(wheel(scope, 'Minutes')).x;
    await mouse.move(minuteX, y);
    await mouse.down();
    await mouse.move(minuteX, y + row, { steps: 8 });
    await waitOnRealTime(150);
    await mouse.up();
    await expect.poll(text('Start time')).toBe('11:15');
    // A quick drag let go while moving glides on past where the pointer stopped: 12 px down, too
    // little to turn a row, turns the hours. How far it glides follows the moves' timing, which
    // each engine and a busy machine stamp differently: 3 px a move glides at least half a row at
    // a move every 16 ms, and short of a whole turn back to 11 at a move a millisecond, the
    // fastest the gestures count (useTimeWheelGestures.ts). Let go later than a glide allows
    // (flingRestMs there), as a busy machine may, it is a drag held still: it stays on 11.
    let lastMove = 0;
    let letGo = 0;
    const onMove = (event: PointerEvent) => void (lastMove = event.timeStamp);
    const onUp = (event: PointerEvent) => void (letGo = event.timeStamp);
    hours.addEventListener('pointermove', onMove);
    hours.addEventListener('pointerup', onUp);
    await commands.mouseFling(x, y, x, y + 12, 4);
    hours.removeEventListener('pointermove', onMove);
    hours.removeEventListener('pointerup', onUp);
    const hour = () => hours.getAttribute('aria-valuenow');
    if (letGo - lastMove <= 80) await expect.poll(hour).not.toBe('11');
    else {
      // The wheel may start to ease a frame after it is let go.
      await nextFrames();
      await expect.poll(() => hours.hasAttribute('data-turning')).toBe(false);
      expect(hour()).toBe('11');
    }
  },
);

test(
  'switching between AM and PM keeps the hour and minutes and moves the time by 12 hours',
  { tags: ['engines'] },
  async () => {
    expect(text('Reminder')()).toBe('2:00 PM');
    await field('Reminder').click();
    const scope = dialog('Reminder');
    const period = wheel(scope, 'AM/PM');
    const hours = wheel(scope, 'Hours');
    await expect.poll(focusedWheel).toBe('Hours=2');
    // Pressing AM keeps 2:00.
    await click(rowFromMiddle(period, -1));
    await expect.poll(text('Reminder')).toBe('2:00 AM');
    expect(reminderOutput().reminder).toBe('02:00');
    // A turn of the hours still settling doesn't undo AM or PM chosen meanwhile, nor the other way.
    await hover(hours);
    await mouse.wheel(0, 100);
    await hover(period);
    await mouse.wheel(0, 100);
    await expect.poll(text('Reminder')).toBe('3:00 PM');
    expect(reminderOutput().reminder).toBe('15:00');
    await expect.poll(() => hours.getAttribute('aria-valuetext')).toBe('3');
    // The keys keep it too: a names the morning on the day-period wheel.
    period.focus();
    await keyboard.press('a');
    await expect.poll(text('Reminder')).toBe('3:00 AM');
    // The day periods don't wrap around: Up from AM chooses nothing, which the changes show.
    await keyboard.press('ArrowUp');
    await keyboard.press('ArrowDown');
    await expect.poll(text('Reminder')).toBe('3:00 PM');
    // On a 12-hour clock, 12 names the first hour of the half.
    hours.focus();
    await keyboard.type('12');
    await expect.poll(text('Reminder')).toBe('12:00 PM');
    // Each choice reached the application once.
    await expect.poll(reminderOutput).toEqual({
      reminder: '12:00',
      changes: ['02:00', '03:00', '15:00', '03:00', '15:00', '12:00'],
    });
  },
);

test('while a wheel turns, only the row on the fill takes its colors, and the field waits for it to settle', async () => {
  await field('Start time').click();
  const hours = wheel(dialog('Start time'), 'Hours');
  await expect.poll(() => hours.getAttribute('aria-valuenow')).toBe('9');
  await expect.poll(focusedWheel).toBe('Hours=9');
  // Each frame of the turn: the rows whose text has the fill's color, the rows on the fill, the
  // wheel's position and the field's value.
  const frames: { white: string[]; filled: string[]; top: number; field: string }[] = [];
  const trigger = field('Start time').element();
  const sampled = new Promise<void>((resolve) => {
    const started = performance.now();
    const sample = () => {
      const rows = [...hours.querySelectorAll<HTMLElement>('.env-time-list-row')];
      const label = (row: HTMLElement) => row.dataset.value!;
      frames.push({
        white: rows
          .filter((row) => getComputedStyle(row).color === 'rgb(255, 255, 255)')
          .map(label),
        filled: rows
          .filter((row) => getComputedStyle(row).backgroundColor !== 'rgba(0, 0, 0, 0)')
          .map(label),
        top: hours.scrollTop,
        field: trigger.textContent ?? '',
      });
      if (performance.now() - started < 1500) requestAnimationFrame(sample);
      else resolve();
    };
    requestAnimationFrame(sample);
  });
  await click(rowFromMiddle(hours, -1));
  await expect.poll(text('Start time')).toBe('08:30');
  await sampled;
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
