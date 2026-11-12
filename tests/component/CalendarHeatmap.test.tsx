import { beforeEach, expect, onTestFinished, test, vi } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/CalendarHeatmap.fixture.tsx';
import { box, css, keyboard, mouse, nextFrames, passTime, stopTimers } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const grid = () => page.getByRole('grid', { name: 'Activity light' });
const dayOn = (date: string, within = grid()) =>
  within.element().querySelector<HTMLElement>(`td[data-date="${date}"]`)!;
const tabStops = () => grid().element().querySelectorAll<HTMLElement>('td[tabindex="0"]');
const update = () => page.getByRole('button', { name: 'Update light' });
const tooltip = () => document.querySelector<HTMLElement>('.env-calendar-heatmap-tooltip');
const positioners = () => document.querySelectorAll<HTMLElement>('.env-tooltip-positioner');
const tooltipText = () => tooltip()?.textContent ?? null;
const focusedName = () => document.activeElement?.getAttribute('aria-label');
const nameOf = (day: HTMLElement) => day.getAttribute('aria-label')!;
/** Moves the pointer to the middle of an element, as Playwright's hover does. */
async function pointAt(target: Element) {
  const at = box(target);
  await mouse.move(at.x + at.width / 2, at.y + at.height / 2);
}
/** Focuses the last day from the keyboard, as Shift+Tab from the button after the grid does. */
async function focusFromKeyboard() {
  (update().element() as HTMLElement).focus();
  await keyboard.press('Shift+Tab');
}
/** Moves the pointer straight up from a day onto its tooltip. */
async function moveOntoTooltip(day: HTMLElement) {
  const from = box(day);
  const to = box(tooltip()!);
  await mouse.move(from.x + from.width / 2, to.y + to.height / 2, { steps: 12 });
  await nextFrames();
}

test('arrow keys move by day and week, Home and End along the weekday, Page Up and Down to the ends of the week, Ctrl+Home and End the range, and Escape hides the value', async () => {
  await focusFromKeyboard();
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await expect.poll(tooltipText).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await keyboard.press('ArrowLeft');
  expect(focusedName()).toMatch(/^Sat,? 3 Oct 2026: \d+$/);
  await keyboard.press('ArrowUp');
  expect(focusedName()).toMatch(/^Fri,? 2 Oct 2026: \d+$/);
  await expect.poll(tooltipText).toBe(focusedName());
  await keyboard.press('ArrowDown');
  await keyboard.press('ArrowRight');
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  // The range ends here: further steps stay put.
  await keyboard.press('ArrowRight');
  await keyboard.press('ArrowDown');
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await keyboard.press('Home');
  expect(focusedName()).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await keyboard.press('ArrowUp');
  expect(focusedName()).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await keyboard.press('End');
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  // Only the focused day is a tab stop.
  expect(tabStops()).toHaveLength(1);
  expect(nameOf(tabStops()[0]!)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await keyboard.press('Escape');
  await expect.poll(() => positioners().length).toBe(0);
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  // Leaving the grid hides the value; returning shows it again.
  await keyboard.press('Tab');
  await expect.poll(() => positioners().length).toBe(0);
  await keyboard.press('Shift+Tab');
  await expect.poll(tooltipText).toMatch(/^Sat,? 10 Oct 2026: 0$/);

  dayOn('2026-10-07').focus();
  expect(focusedName()).toMatch(/^Wed,? 7 Oct 2026: \d+$/);
  // Home and End keep the weekday: the first week holds only the first day, so Home goes to the
  // Wednesday of the second week.
  await keyboard.press('Home');
  expect(focusedName()).toMatch(/^Wed,? 15 Oct 2025: \d+$/);
  await keyboard.press('End');
  expect(focusedName()).toMatch(/^Wed,? 7 Oct 2026: \d+$/);
  await keyboard.press('PageUp');
  expect(focusedName()).toMatch(/^Sun,? 4 Oct 2026: \d+$/);
  await keyboard.press('PageDown');
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await keyboard.press('Control+Home');
  expect(focusedName()).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  // The range starts on the last day of its first week, so Page Up stays there.
  await keyboard.press('PageUp');
  expect(focusedName()).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await keyboard.press('PageDown');
  expect(focusedName()).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await keyboard.press('Control+End');
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  expect(tabStops()).toHaveLength(1);
});

test('one tooltip follows the pointer across days and leaves with it', async () => {
  const first = dayOn('2026-06-01');
  const second = dayOn('2026-06-08');
  await pointAt(first);
  await expect.poll(tooltipText).toBe(nameOf(first));
  // The tooltip sits above its day.
  const tip = box(positioners()[0]!);
  const cell = box(first);
  expect(tip.y + tip.height).toBeLessThanOrEqual(cell.y + 1);
  expect(Math.abs(tip.x + tip.width / 2 - (cell.x + cell.width / 2))).toBeLessThan(2);
  await pointAt(second);
  await expect.poll(tooltipText).toBe(nameOf(second));
  expect(positioners()).toHaveLength(1);
  await mouse.move(5, 5);
  await expect.poll(() => positioners().length).toBe(0);
});

test('people can move the pointer onto the tooltip of a hovered or clicked day to read it, and it stays while the pointer rests on it as focus leaves the days', async () => {
  // A day in the middle of its week, with days above it, and a Sunday in the top row.
  for (const date of ['2026-06-03', '2026-06-07']) {
    const day = dayOn(date);
    await pointAt(day);
    await expect.poll(tooltipText).toBe(nameOf(day));
    expect(css(positioners()[0]!, 'pointer-events')).not.toBe('none');
    // Straight up from the day, the pointer crosses only the gap between days to reach it, and
    // the tooltip stays past its close delay.
    const to = box(tooltip()!);
    stopTimers();
    await moveOntoTooltip(day);
    await passTime(600);
    expect(tooltipText()).toBe(nameOf(day));
    vi.useRealTimers();
    // Leaving the tooltip for anything but the days closes it.
    await mouse.move(to.x - 40, to.y - 60, { steps: 4 });
    await expect.poll(() => positioners().length).toBe(0);
  }

  // A day clicked with the mouse shows a tooltip the pointer can move onto.
  const day = dayOn('2026-06-03');
  await pointAt(day);
  await expect.poll(tooltipText).toBe(nameOf(day));
  await page.elementLocator(day).click();
  await expect.element(page.elementLocator(day)).toHaveFocus();
  expect(css(positioners()[0]!, 'pointer-events')).not.toBe('none');
  await moveOntoTooltip(day);
  expect(tooltipText()).toBe(nameOf(day));

  // A tooltip the pointer rests on stays when focus leaves the days: on a fresh mount.
  await pointAt(update().element());
  await expect.poll(() => positioners().length).toBe(0);
  mount(fixture);
  await focusFromKeyboard();
  await expect.poll(tooltipText).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  const rested = dayOn('2026-06-03');
  await pointAt(rested);
  await expect.poll(tooltipText).toBe(nameOf(rested));
  await moveOntoTooltip(rested);
  await keyboard.press('Tab');
  await expect.element(update()).toHaveFocus();
  await nextFrames();
  expect(positioners()[0]!.hasAttribute('data-open')).toBe(true);
  expect(tooltipText()).toBe(nameOf(rested));
  // The pointer leaves the tooltip for a point React doesn't render, for which React gives the
  // window as the related target, and the tooltip goes.
  const outside = document.createElement('div');
  outside.style.cssText =
    'position: fixed; inset: auto 0 0 auto; inline-size: 2rem; block-size: 2rem';
  document.body.append(outside);
  onTestFinished(() => outside.remove());
  await pointAt(outside);
  await expect.poll(() => positioners().length).toBe(0);
});

test('a press released outside the days leaves keyboard focus its own tooltip', async () => {
  // The tooltip marks that focus opened it, and its positioner then takes no pointer.
  await focusFromKeyboard();
  await expect.poll(() => tooltip()?.hasAttribute('data-focus-opened')).toBe(true);
  // A press on the focused day moves no focus; it ends outside the grid.
  await pointAt(tabStops()[0]!);
  await mouse.down();
  await mouse.move(5, 5, { steps: 4 });
  await mouse.up();
  // Focus that comes back from the keyboard opens a tooltip that takes no pointer.
  await keyboard.press('Tab');
  await expect.element(update()).toHaveFocus();
  await keyboard.press('Shift+Tab');
  await expect.poll(() => tooltip()?.hasAttribute('data-focus-opened')).toBe(true);
  expect(css(positioners()[0]!, 'pointer-events')).toBe('none');
});

test('a year renders updates and focus moves within a frame', async () => {
  // Times on a fresh mount. Another browser busy beside this one can stall a single run past the
  // budget, so the best of up to three runs counts: a slow update is slow in every run.
  const measure = async () => {
    mount(fixture);
    const scope = page.getByTestId('calendar-heatmap-light').element();
    const cell = scope.querySelector('td[data-date="2026-10-10"]')!;
    const button = update().element() as HTMLElement;
    // A click renders synchronously, so the attribute changes before the observer reports it.
    const updated = await new Promise<number>((resolve) => {
      const start = performance.now();
      const observer = new MutationObserver(() => {
        observer.disconnect();
        resolve(performance.now() - start);
      });
      observer.observe(cell, { attributes: true });
      button.click();
    });
    const days = [...scope.querySelectorAll<HTMLElement>('td[data-day]')].slice(100, 140);
    const start = performance.now();
    for (const each of days) each.focus();
    return { update: updated, focus: (performance.now() - start) / days.length };
  };
  let timings = await measure();
  for (let run = 1; run < 3 && (timings.update >= 100 || timings.focus >= 16); run++) {
    const next = await measure();
    timings = {
      update: Math.min(timings.update, next.update),
      focus: Math.min(timings.focus, next.focus),
    };
  }
  expect(timings.update).toBeLessThan(100);
  expect(timings.focus).toBeLessThan(16);
  // Moving across forty days left a single tooltip.
  await expect.poll(() => positioners().length).toBe(1);
});

test(
  'a narrow container scrolls the weeks, starting at the most recent',
  { tags: ['engines'] },
  async () => {
    await page.viewport(360, 900);
    mount(fixture);
    const heatmap = page.getByTestId('calendar-heatmap-year-light');
    const scroller = heatmap.element().querySelector<HTMLElement>('.env-calendar-heatmap-scroll')!;
    // It starts and stays at the end while the weeks settle, such as when the web font loads: the
    // scroller is a reversed row, whose scroll origin is its end, so no script scrolls it.
    await expect
      .poll(() => ({
        scrolls: scroller.scrollWidth > scroller.clientWidth,
        atEnd: Math.abs(scroller.scrollLeft) < 2,
        reversed: getComputedStyle(scroller).flexDirection,
      }))
      .toEqual({ scrolls: true, atEnd: true, reversed: 'row-reverse' });
    const frame = box(scroller);
    const last = box(dayOn('2026-10-10', heatmap));
    expect(last.x + last.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
    expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
    // Home scrolls the first week into view: WebKit scrolls to the focused day a moment later.
    heatmap.element().querySelector<HTMLElement>('td[tabindex="0"]')!.focus();
    await keyboard.press('Home');
    await expect
      .poll(() => box(dayOn('2025-10-11', heatmap)).x)
      .toBeGreaterThanOrEqual(frame.x - 1);
  },
);

test('right-to-left heatmaps run the weeks from the right and turn the arrow keys', async () => {
  const heatmap = page.getByTestId('calendar-heatmap-year-light');
  heatmap.element().setAttribute('dir', 'rtl');
  expect(box(dayOn('2026-06-08', heatmap)).x).toBeLessThan(box(dayOn('2026-06-01', heatmap)).x);
  dayOn('2026-06-01', heatmap).focus();
  await keyboard.press('ArrowLeft');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2026-06-08');
});

test('on a coarse pointer a tap shows the value of the day, and the days grow', async () => {
  await commands.emulateTouch(true);
  try {
    // Mounted afresh on the touch screen, as a page loads on one.
    mount(fixture);
    const cell = dayOn('2026-06-01');
    expect(css(cell, 'width')).toBe('20px');
    // Days are 24 px apart in both directions, the minimum target size with its spacing. Both are
    // measured at once, as the weeks may still scroll to the most recent while the font loads.
    const day = box(cell);
    expect(box(dayOn('2026-06-02')).y - day.y).toBeGreaterThan(23.99);
    expect(box(dayOn('2026-06-08')).x - day.x).toBeGreaterThan(23.99);
    cell.scrollIntoView({ block: 'center', inline: 'center' });
    const tap = async (target: Element) => {
      const at = box(target);
      await commands.touch('touchStart', at.x + at.width / 2, at.y + at.height / 2);
      await commands.touch('touchEnd');
    };
    await tap(cell);
    await expect.poll(tooltipText).toBe(nameOf(cell));
    await tap(update().element());
    await expect.poll(() => positioners().length).toBe(0);
  } finally {
    await commands.emulateTouch(false);
  }
});

test('a tooltip opened by focus leaves with the pointer and never blocks a press', async () => {
  await focusFromKeyboard();
  await expect.poll(tooltipText).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  // The tooltip takes no pointer: a press where it shows reaches what lies under it.
  expect(css(positioners()[0]!, 'pointer-events')).toBe('none');
  const tip = box(tooltip()!);
  expect(
    document
      .elementFromPoint(tip.x + tip.width / 2, tip.y + tip.height / 2)
      ?.closest('.env-tooltip-positioner') ?? null,
  ).toBeNull();
  // Moving the pointer elsewhere on the page closes it; the day keeps focus.
  await mouse.move(5, 5);
  await mouse.move(60, 40);
  await expect.poll(() => positioners().length).toBe(0);
  expect(focusedName()).toMatch(/^Sat,? 10 Oct 2026: 0$/);

  // Hovering the days and then leaving them closes it too, also while a day has keyboard focus.
  await keyboard.press('ArrowLeft');
  await expect.poll(tooltipText).toBe(focusedName());
  const day = dayOn('2026-06-01');
  await pointAt(day);
  await expect.poll(tooltipText).toBe(nameOf(day));
  await pointAt(update().element());
  await expect.poll(() => positioners().length).toBe(0);
  expect(document.activeElement).toBe(tabStops()[0]);
});

test('Escape hides the tooltip of a heatmap in a dialog and keeps the dialog open', async () => {
  await page.getByRole('button', { name: 'Open activity light' }).click();
  const dialog = page.getByRole('dialog', { name: 'Activity details light' });
  await expect.element(dialog).toBeVisible();
  const inDialog = dialog.getByRole('grid', { name: 'Activity in a dialog light' });
  inDialog.element().querySelector<HTMLElement>('td[tabindex="0"]')!.focus();
  await expect.poll(() => tooltip() !== null).toBe(true);
  await keyboard.press('Escape');
  await expect.poll(tooltip).toBeNull();
  await expect.element(dialog).toBeVisible();
  // With no tooltip to hide, Escape closes the dialog as usual.
  await keyboard.press('Escape');
  await expect.poll(() => dialog.query()).toBeNull();
});
