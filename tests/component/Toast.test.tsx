import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/Toast.fixture.tsx';
import { addStyle, animationsDone, box, css, keyboard, mouse, nextFrames } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.removeAttribute('dir');
});

/**
 * Fakes the notices' clock, setTimeout and Date, so a notice's timer runs only as far as the test
 * moves it, however long its steps take on a busy engine. Frames and transitions run as they do,
 * so a notice's exit plays once its timer is up.
 */
/**
 * Fakes the clock as a running one, which the test can also move on at once: past a notice's
 * duration, say.
 */
const fakeClock = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    shouldAdvanceTime: true,
  });
const stopClock = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  });
/** Waits until a condition holds, moving the stopped clock on as a running one would. */
const whileTimeRuns = <T,>(read: () => T) =>
  expect.poll(() => {
    vi.advanceTimersByTime(50);
    return read();
  });

const region = (placement = 'bottom-end') =>
  document.querySelector<HTMLElement>(`.env-toast-viewport[data-placement="${placement}"]`)!;
/** The notices at a placement, in every provider's region there. */
const notices = (placement = 'bottom-end') => [
  ...document.querySelectorAll<HTMLElement>(
    `.env-toast-viewport[data-placement="${placement}"] .env-toast`,
  ),
];
const shownNotices = (placement = 'bottom-end') =>
  notices(placement).filter((each) => !each.hasAttribute('data-limited'));
const notice = (message: string, placement = 'bottom-end') =>
  notices(placement).find((each) =>
    each.querySelector('.env-toast-message')?.textContent?.includes(message),
  ) ?? null;
const count = (message: string, placement?: string) => () =>
  notice(message, placement) === null ? 0 : 1;
/** Whether a notice is there and not leaving. */
const staying = (message: string, placement?: string) => () => {
  const element = notice(message, placement);
  return element !== null && !element.hasAttribute('data-ending-style');
};
const visible = (message: string, placement?: string) => () => {
  const element = notice(message, placement);
  return element !== null && element.checkVisibility({ visibilityProperty: true });
};
const trigger = (testId: string) => page.getByTestId(testId);
/** The middle of an element, scrolled into view first, as Playwright's click() finds it. */
const middle = (element: Element) => {
  element.scrollIntoView({ block: 'nearest' });
  const { x, y, width, height } = box(element);
  return { x: x + width / 2, y: y + height / 2 };
};
/**
 * Presses an element as Playwright's click() does: the mouse moves onto it, and presses once the
 * element is what the point hits, as a stack hovered spreads its notices apart.
 */
async function click(element: Element) {
  let point = middle(element);
  await mouse.move(point.x, point.y);
  await expect
    .poll(() => {
      point = middle(element);
      return element.contains(document.elementFromPoint(point.x, point.y));
    })
    .toBe(true);
  await mouse.click(point.x, point.y);
}
const dismiss = (element: Element) =>
  click(element.querySelector('[aria-label="Dismiss notification"]')!);
/** A notice's action button, such as Undo notice. */
const actionOf = (element: Element) =>
  [...element.querySelectorAll('button')].find(
    (button) => button.getAttribute('aria-label') !== 'Dismiss notification',
  )!;
const announcer = () => document.querySelector('.env-toast-announcer')!;

test('newest notices stay visible and older notices return independently per placement, also in right-to-left text', async () => {
  await trigger('toast-queue-bottom').click();
  await trigger('toast-queue-top').click();
  await expect.poll(() => shownNotices().length).toBe(3);
  await expect.poll(() => shownNotices('top-center').length).toBe(3);
  expect(visible('Bottom queue 1')()).toBe(false);
  await dismiss(notice('Bottom queue 4')!);
  await expect.poll(count('Bottom queue 4')).toBe(0);
  for (const index of [1, 2, 3])
    await expect.poll(visible(`Bottom queue ${index}`), { message: `${index}` }).toBe(true);
  expect(shownNotices('top-center')).toHaveLength(3);
  await dismiss(notice('Top queue 4', 'top-center')!);
  await expect.poll(count('Top queue 4', 'top-center')).toBe(0);
  for (const index of [1, 2, 3])
    await expect.poll(visible(`Top queue ${index}`, 'top-center')).toBe(true);
  await trigger('toast-clear').click();
  await expect
    .poll(() => document.querySelectorAll('.env-toast-viewport .env-toast').length)
    .toBe(0);

  // In right-to-left text the bottom-end stack sits at the left and the top stack stays centred.
  document.documentElement.setAttribute('dir', 'rtl');
  mount(fixture);
  await trigger('toast-queue-bottom').click();
  await trigger('toast-queue-top').click();
  await expect.element(region()).toHaveAccessibleName('Notifications');
  await expect.element(region('top-center')).toHaveAccessibleName('Top notifications');
  const width = innerWidth;
  await expect.poll(() => box(region()).x).toBeLessThan(width / 4);
  await expect
    .poll(() => {
      const top = box(region('top-center'));
      return Math.abs(top.x + top.width / 2 - width / 2);
    })
    .toBeLessThan(1);
  // A swipe toward the end of the line, to the left here, dismisses a notice.
  const leaving = notice('Bottom queue 4')!;
  const start = middle(leaving.querySelector('.env-toast-message')!);
  await mouse.move(start.x, start.y);
  await mouse.down();
  for (let step = 1; step <= 8; step += 1) await mouse.move(start.x - step * 15, start.y);
  await mouse.up();
  await expect.poll(count('Bottom queue 4')).toBe(0);
});

test('errors and notices with actions persist', async () => {
  fakeClock();
  await trigger('toast-error').click();
  await trigger('toast-action').click();
  vi.advanceTimersByTime(6_000);
  await expect.poll(staying('Persistent error notice')).toBe(true);
  expect(staying('Persistent action notice')()).toBe(true);
  expect(page.getByRole('alert').elements()).toHaveLength(1);
  await click(actionOf(notice('Persistent action notice')!));
  await expect.poll(() => trigger('toast-action-count').element().textContent).toBe('1');
});

test('danger notices are alerts at once and never wait behind the hidden count', async () => {
  await trigger('toast-queue-bottom').click();
  await trigger('toast-error').click();
  await expect.poll(visible('Persistent error notice')).toBe(true);
  const danger = notice('Persistent error notice')!;
  expect(danger.getAttribute('data-tone')).toBe('danger');
  expect(danger.hasAttribute('data-limited')).toBe(false);
  // It is an alert as it appears, readable without focusing the region first.
  expect(danger.getAttribute('role')).toBe('alert');
  expect(danger.hasAttribute('aria-hidden')).toBe(false);
  expect(page.getByRole('alert').elements()).toHaveLength(1);
  // The alert is announced once: no polite live region holds it, and the polite status that reads
  // the ordinary notices leaves it out.
  let live: string | null = null;
  for (let node = danger.parentElement; node && live === null; node = node.parentElement) {
    const region = node.getAttribute('aria-live');
    if (region && region !== 'off') live = region;
    else if (['status', 'log', 'alert'].includes(node.getAttribute('role') ?? '')) live = node.role;
  }
  expect(live).toBeNull();
  expect(announcer().getAttribute('role')).toBe('status');
  await expect.poll(() => announcer().textContent).toContain('Bottom queue 4');
  expect(announcer().textContent).not.toContain('Persistent error notice');
  // It takes a place of its own, so two of the four ordinary notices wait.
  await expect.poll(() => shownNotices().length).toBe(3);
  expect(region().querySelector('.env-toast-queued-count')?.textContent).toContain(
    '2 older notifications hidden',
  );
});

test('notice timers run out after five seconds by default, and pause for focus, hover and the region together', async () => {
  // Ordinary notices expire after the default five seconds.
  stopClock();
  await trigger('toast-neutral').click();
  await expect.poll(count('Neutral notice')).toBe(1);
  await mouse.move(1, 1);
  vi.advanceTimersByTime(4_000);
  expect(staying('Neutral notice')()).toBe(true);
  vi.advanceTimersByTime(1_100);
  await whileTimeRuns(count('Neutral notice')).toBe(0);

  // Visible timers pause for focus and hover together and resume after both leave.
  await trigger('toast-short').click();
  await expect.poll(count('Short notice')).toBe(1);
  const short = notice('Short notice')!;
  const close = short.querySelector<HTMLElement>('[aria-label="Dismiss notification"]')!;
  // Timer pauses follow keyboard-visible focus; establish keyboard interaction first.
  await keyboard.press('Tab');
  close.focus();
  const over = middle(short);
  await mouse.move(over.x, over.y);
  await mouse.move(1, 1);
  vi.advanceTimersByTime(800);
  expect(staying('Short notice')()).toBe(true);
  expect(document.activeElement).toBe(close);
  (trigger('toast-clear').element() as HTMLElement).focus();
  vi.advanceTimersByTime(500);
  await whileTimeRuns(count('Short notice')).toBe(0);

  // Focus in the region pauses the timers there and those of notices shown meanwhile.
  await trigger('toast-short').click();
  await keyboard.press('F6');
  await expect.element(region()).toHaveFocus();
  vi.advanceTimersByTime(800);
  expect(staying('Short notice')()).toBe(true);
  trigger('toast-short')
    .element()
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  vi.advanceTimersByTime(800);
  await expect
    .poll(
      () =>
        notices().filter(
          (each) =>
            each.textContent?.includes('Short notice') && !each.hasAttribute('data-ending-style'),
        ).length,
    )
    .toBe(2);
  (trigger('toast-clear').element() as HTMLElement).focus();
  vi.advanceTimersByTime(500);
  await whileTimeRuns(count('Short notice')).toBe(0);
});

test('Strict Mode mount effects preserve capacity after effect replay', async () => {
  await page.getByRole('button', { name: 'Mount strict toast provider' }).click();
  const active = () =>
    notices().filter(
      (each) => !each.hasAttribute('data-ending-style') && !each.hasAttribute('data-limited'),
    ).length;
  await expect.poll(active).toBe(1);
  await page.getByRole('button', { name: 'Add strict notices' }).click();
  await expect.poll(active).toBe(3);
  // Past the render in which an effect replayed twice would have dropped one.
  await nextFrames();
  expect(active()).toBe(3);
});

test('placement stacks, keyboard access, wrapped sizing and contextual action states, and the dismiss button at the touch height', async () => {
  await trigger('toast-queue-bottom').click();
  await expect.poll(() => shownNotices().length).toBe(3);
  const tops = shownNotices().map((each) => each.getBoundingClientRect().y);
  expect(tops[0]).toBeGreaterThan(tops[1]!);
  expect(tops[1]).toBeGreaterThan(tops[2]!);
  await keyboard.press('F6');
  await expect.element(region()).toHaveFocus();
  await trigger('toast-clear').click();
  await expect.poll(() => notices().length).toBe(0);
  await trigger('toast-action').click();
  await expect.poll(count('Persistent action notice')).toBe(1);
  const toast = notice('Persistent action notice')!;
  const button = actionOf(toast);
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  const base = css(button, 'background-color');
  const point = middle(button);
  await mouse.move(point.x, point.y);
  await expect.poll(() => css(button, 'background-color')).not.toBe(base);
  await page.viewport(390, 800);
  expect(toast.scrollWidth).toBeLessThanOrEqual(toast.clientWidth);
  expect(css(toast.querySelector('.env-toast-message')!, 'white-space')).toBe('normal');
  expect(toast.getBoundingClientRect().height).toBeLessThan(75);
  await trigger('toast-clear').click();
  await trigger('toast-queue-actions').click();
  await page.viewport(320, 160);
  // Cleared toasts finish their exit transition, and the new ones their entrance, before the stack
  // is measured.
  await expect
    .poll(() => region().querySelectorAll('.env-toast[data-ending-style]').length)
    .toBe(0);
  await expect.poll(() => region().hasAttribute('data-settling')).toBe(false);
  const viewport = region();
  expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  const rows = notices()
    .map((element) => {
      const row = element.getBoundingClientRect();
      const action = element.querySelector('.env-toast-action')!.getBoundingClientRect();
      return {
        top: row.top,
        bottom: row.bottom,
        actionTop: action.top,
        actionBottom: action.bottom,
      };
    })
    .sort((a, b) => a.top - b.top);
  expect(rows).toHaveLength(3);
  rows.forEach((row, index) => {
    expect(row.actionTop).toBeGreaterThanOrEqual(row.top);
    expect(row.actionBottom).toBeLessThanOrEqual(row.bottom);
    if (index) expect(row.top).toBeGreaterThanOrEqual(rows[index - 1]!.bottom);
  });

  // On a coarse pointer the dismiss button grows to the touch height, in either scale.
  await commands.emulateTouch(true);
  try {
    await page.viewport(1440, 1000);
    for (const scale of ['comfortable', 'compact'] as const) {
      mount(fixture, { scale });
      expect(matchMedia('(pointer: coarse)').matches).toBe(true);
      await trigger('toast-queue-bottom').click();
      await expect.poll(() => shownNotices().length).toBe(3);
      const close = region().querySelector('[aria-label="Dismiss notification"]')!;
      expect(close.closest('.env-theme')!.getAttribute('data-env-scale'), scale).toBe(scale);
      await expect.poll(() => css(close, 'width'), { message: scale }).toBe('44px');
      expect(css(close, 'height'), scale).toBe('44px');
    }
  } finally {
    await commands.emulateTouch(false);
  }
});

test('the hidden count sits beyond the stack: above at the bottom end, below and centered at the top center', async () => {
  await trigger('toast-queue-bottom').click();
  await trigger('toast-queue-top').click();
  for (const placement of ['bottom-end', 'top-center']) {
    const viewport = region(placement);
    await expect.poll(() => viewport.querySelector('.env-toast-queued-count')).not.toBeNull();
    const hidden = viewport.querySelector('.env-toast-queued-count')!;
    expect(hidden.classList.contains('env-badge')).toBe(true);
    expect(hidden.getAttribute('data-count')).toBe('');
    // The status announces the full meaning; the badge shows the number.
    expect(hidden.textContent).toContain('1 older notification hidden');
    expect(hidden.querySelector('[aria-hidden="true"]')?.textContent).toBe('+1');
    // Entrances and glides move the notices for a moment; poll until they settle.
    await expect
      .poll(
        () => {
          const badge = hidden.getBoundingClientRect();
          const shown = shownNotices(placement).map((each) => each.getBoundingClientRect());
          const top = Math.min(...shown.map((each) => each.top));
          const bottom = Math.max(...shown.map((each) => each.bottom));
          const center = (rect: DOMRect) => rect.left + rect.width / 2;
          return placement === 'bottom-end'
            ? badge.bottom <= top
            : badge.top >= bottom && Math.abs(center(badge) - center(shown[0]!)) < 1;
        },
        { message: placement },
      )
      .toBe(true);
  }
});

test('dismissed notices step out at once, so the stack neither grows, scrolls nor jumps, at either placement and motion', async () => {
  // A long exit keeps the leaving notices in view while the stack is measured.
  // Letter spacing gives the messages fractional widths, which a pinned notice must keep.
  addStyle(
    '.env-toast-viewport > .env-toast[data-ending-style] { transition-duration: 1.5s; } .env-toast-message { letter-spacing: 0.0137em; }',
  );
  for (const motion of ['reduce', 'no-preference'] as const)
    for (const placement of ['bottom-end', 'top-center'] as const) {
      const name = `${placement}, ${motion} motion`;
      await commands.emulateMedia({ reducedMotion: motion });
      mount(fixture);
      const top = placement === 'top-center';
      await trigger(top ? 'toast-queue-top' : 'toast-queue-bottom').click();
      const stack = () => region(placement);
      const queued = (index: number) => () =>
        notice(`${top ? 'Top' : 'Bottom'} queue ${index}`, placement);
      await expect.poll(() => shownNotices(placement).length, { message: name }).toBe(3);
      await expect
        .poll(() => stack().querySelectorAll('.env-toast[data-starting-style]').length)
        .toBe(0);
      await expect.poll(() => stack().hasAttribute('data-settling'), { message: name }).toBe(false);
      await animationsDone(stack(), true);
      const height = stack().getBoundingClientRect().height;
      const first = queued(4)()!;
      const drawn = box(first);
      // Two in a row: each steps out at once while the hidden notice takes its turn.
      await dismiss(first);
      await expect.poll(() => first.getAttribute('data-leaving'), { message: name }).toBe('');
      // Its message keeps its lines while it fades.
      expect(Math.abs(box(first).height - drawn.height), name).toBeLessThan(1);
      if (motion === 'reduce') {
        const pinned = box(first);
        expect(Math.abs(pinned.x - drawn.x), name).toBeLessThan(1);
        expect(Math.abs(pinned.y - drawn.y), name).toBeLessThan(1);
      }
      await expect
        .poll(() => queued(1)()?.checkVisibility({ visibilityProperty: true }), { message: name })
        .toBe(true);
      const third = queued(3)()!;
      await dismiss(third);
      await expect.poll(() => third.getAttribute('data-leaving'), { message: name }).toBe('');
      expect(stack().getBoundingClientRect().height, name).toBeLessThan(height + 1);
      // Meanwhile the stack does not scroll, so no scrollbar flashes.
      expect(stack().hasAttribute('data-settling'), name).toBe(true);
      expect(css(stack(), 'overflow-y'), name).toBe('visible');
      await expect.poll(() => first.isConnected, { message: name, timeout: 8_000 }).toBe(false);
      await expect.poll(() => third.isConnected, { message: name, timeout: 8_000 }).toBe(false);
      await expect.poll(() => stack().hasAttribute('data-settling'), { message: name }).toBe(false);
      expect(css(stack(), 'overflow-y'), name).toBe('auto');
    }
});

test(
  'a stack taller than the window keeps scrolling while a notice leaves',
  { tags: ['engines'] },
  async () => {
    // A long exit keeps the leaving notice in the stack while it is checked.
    addStyle('.env-toast-viewport > .env-toast[data-ending-style] { transition-duration: 4s; }');
    await page.viewport(320, 160);
    await trigger('toast-queue-actions').click();
    await expect
      .poll(() => region().querySelectorAll('.env-toast[data-starting-style]').length)
      .toBe(0);
    await expect.poll(() => region().hasAttribute('data-settling')).toBe(false);
    await expect.poll(() => region().scrollHeight > region().clientHeight).toBe(true);
    await dismiss(shownNotices()[0]!);
    // It stays a scroll container: no overflow switch, which would lose the scroll position.
    await expect.poll(() => region().querySelectorAll('.env-toast[data-leaving]').length).toBe(1);
    expect(region().hasAttribute('data-settling')).toBe(false);
    expect(css(region(), 'overflow-y')).toBe('auto');
  },
);

test('notices wait while a modal dialog is open and then show for their full duration', async () => {
  await trigger('toast-neutral').click();
  await expect.poll(visible('Neutral notice')).toBe(true);
  fakeClock();
  await trigger('toast-dialog').click();
  // The notice that was showing steps back, and one shown from the dialog waits too.
  await expect.poll(visible('Neutral notice')).toBe(false);
  await trigger('toast-from-dialog').click();
  await expect.poll(visible('Notice from a dialog')).toBe(false);
  expect(announcer().textContent).not.toContain('Notice from a dialog');
  expect(document.querySelector('.env-toast-queued-count')).toBeNull();
  // Past the default 5 s, nothing has left while it waited.
  vi.advanceTimersByTime(6_000);
  await trigger('toast-dialog-close').click();
  await expect.poll(visible('Neutral notice')).toBe(true);
  await expect.poll(visible('Notice from a dialog')).toBe(true);
  expect(announcer().textContent).toContain('Notice from a dialog');
  vi.advanceTimersByTime(6_000);
  await expect.poll(count('Notice from a dialog')).toBe(0);
});
