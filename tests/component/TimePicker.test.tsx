import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/TimePicker.fixture.tsx';
import {
  box,
  collectErrors,
  keyboard,
  mouse,
  nextFrames,
  waitOnRealTime,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-14T10:00:00') });
  mount(fixture);
});

afterEach(() => {
  vi.useRealTimers();
});

const field = (name: string) => page.getByRole('combobox', { name, exact: true });
const text = (name: string) => () => field(name).element().textContent!.replace(/\s/g, ' ');
const dialog = (name: string) => page.getByRole('dialog', { name, exact: true });
const wheel = (scope: Locator, name: string) =>
  scope.getByRole('spinbutton', { name, exact: true }).element() as HTMLElement;
const centered = (wheel: Element) => () => wheel.querySelector('[data-centered]')?.textContent;
const focusedWheel = () => {
  const active = document.activeElement;
  return active?.getAttribute('role') === 'spinbutton'
    ? `${active.getAttribute('aria-label')}=${active.getAttribute('aria-valuenow')}`
    : null;
};
const wheelNames = (scope: Locator) => () =>
  scope
    .getByRole('spinbutton')
    .elements()
    .map((each) => each.getAttribute('aria-label'));
function rowFromMiddle(wheel: Element, offset: number) {
  const rows = [...wheel.querySelectorAll('.env-time-list-row')];
  return rows[rows.findIndex((row) => row.hasAttribute('data-centered')) + offset]!;
}
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
  await expect.poll(wheelNames(time)).toEqual(['Hours', 'Minutes']);
  const hours = wheel(time, 'Hours');
  const minutes = wheel(time, 'Minutes');
  expect(hours.getAttribute('aria-valuenow')).toBe('9');
  expect(hours.getAttribute('aria-valuetext')).toBe('09');
  expect(hours.getAttribute('aria-valuemin')).toBe('0');
  expect(hours.getAttribute('aria-valuemax')).toBe('23');
  expect(minutes.getAttribute('aria-valuetext')).toBe('30');
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
  await expect.poll(focusedWheel).toBe('Hours=9');

  const steps: [string, string, string][] = [
    ['ArrowDown', 'Hours=10', '10:30'],
    ['ArrowUp', 'Hours=9', '09:30'],
    ['End', 'Hours=23', '23:30'],
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
    await click(rowFromMiddle(hours, 2));
    await expect.poll(text('Start time')).toBe('11:30');
    await expect.poll(centered(hours)).toBe('11');
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
  await expect.poll(focusedWheel).toBe('Hours=10');
  expect(minutes.getAttribute('aria-valuemax')).toBe('30');
  expect(text('Alarm')()).toBe('Choose a time');
  expect(row(hours, '7').hasAttribute('data-disabled')).toBe(true);
  await keyboard.press('Home');
  await expect.poll(text('Alarm')).toBe('8:00 AM');
  await keyboard.press('ArrowUp');
  await expect.poll(text('Alarm')).toBe('11:00 AM');
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
    await expect.element(alarm).toHaveFocus();
    expect(submitted()).toBe('');
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
    const mouseWheelNotch = 100;
    await mouse.wheel(0, mouseWheelNotch);
    await expect.poll(text('Start time')).toBe('09:45');
    await expect.poll(centered(minutes)).toBe('45');
    await mouse.wheel(0, -mouseWheelNotch);
    await mouse.wheel(0, -mouseWheelNotch);
    await expect.poll(text('Start time')).toBe('09:15');
    await expect.poll(() => minutes.hasAttribute('data-turning')).toBe(false);
    await hover(wheel(scope, 'Hours'));
    await mouse.wheel(0, -mouseWheelNotch);
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
    await mouse.move(x, y);
    await mouse.down();
    await mouse.move(x, y - 2 * row, { steps: 12 });
    await expect.poll(() => hours.hasAttribute('data-dragging')).toBe(true);
    await waitOnRealTime(150);
    await mouse.up();
    await expect.poll(text('Start time')).toBe('11:30');
    await expect.poll(() => hours.hasAttribute('data-dragging')).toBe(false);
    expect(centered(hours)()).toBe('11');
    const minuteX = middle(wheel(scope, 'Minutes')).x;
    await mouse.move(minuteX, y);
    await mouse.down();
    await mouse.move(minuteX, y + row, { steps: 8 });
    await waitOnRealTime(150);
    await mouse.up();
    await expect.poll(text('Start time')).toBe('11:15');
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
    const flingRestMs = 80;
    const letGoWhileMoving = letGo - lastMove <= flingRestMs;
    if (letGoWhileMoving) await expect.poll(hour).not.toBe('11');
    else {
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
    await click(rowFromMiddle(period, -1));
    await expect.poll(text('Reminder')).toBe('2:00 AM');
    expect(reminderOutput().reminder).toBe('02:00');
    await hover(hours);
    await mouse.wheel(0, 100);
    await hover(period);
    await mouse.wheel(0, 100);
    await expect.poll(text('Reminder')).toBe('3:00 PM');
    expect(reminderOutput().reminder).toBe('15:00');
    await expect.poll(() => hours.getAttribute('aria-valuetext')).toBe('3');
    period.focus();
    await keyboard.press('a');
    await expect.poll(text('Reminder')).toBe('3:00 AM');
    await keyboard.press('ArrowUp');
    await keyboard.press('ArrowDown');
    await expect.poll(text('Reminder')).toBe('3:00 PM');
    hours.focus();
    await keyboard.type('12');
    await expect.poll(text('Reminder')).toBe('12:00 PM');
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
  for (const frame of frames) {
    expect(frame.filled).toHaveLength(1);
    expect(frame.white).toEqual(frame.filled);
  }
  const filled = frames.map((frame) => frame.filled[0]);
  expect(filled.slice(filled.indexOf('8'))).not.toContain('9');
  const changed = frames.findIndex((frame) => frame.field === '08:30');
  expect(changed).toBeGreaterThan(0);
  expect(frames.slice(changed).every((frame) => frame.top === frames.at(-1)!.top)).toBe(true);
  expect(frames.slice(0, changed).some((frame) => frame.top !== frames.at(-1)!.top)).toBe(true);
});
