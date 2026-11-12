import { beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Forms.fixture.tsx';
import {
  addStyle,
  animationsDone,
  box,
  css,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  shown,
  stopTimers,
} from './support/Browser.ts';
import { chevronTips, expectHalfTurn, slowChevron } from './support/Chevron.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const select = (name: string) => page.getByRole('combobox', { name, exact: true });
const option = (name: string) => page.getByRole('option', { name, exact: true });
const list = () => page.getByRole('listbox');
const text = (locator: Locator) => () => locator.element().textContent;
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const isOpen = () => expect.poll(() => shown(list())).toBe(true);
const isClosed = () => expect.poll(() => list().elements().length).toBe(0);
const popup = () => document.querySelector<HTMLElement>('.env-select-popup')!;
/** The field's well around a select's trigger, with its edge. */
const well = (locator: Locator) => locator.element().closest('.env-select-control')!;
const chevron = (locator: Locator) =>
  locator.element().parentElement!.querySelector<HTMLElement>('.env-select-icon')!;

/** Waits until the open list has finished growing in. */
async function grown() {
  const open = document.querySelector('.env-popup[data-open]')!;
  await expect.poll(() => open.hasAttribute('data-starting-style')).toBe(false);
  // The transition starts in the frame after the starting style is removed.
  await nextFrames();
  await animationsDone(open);
}

/**
 * Stands in for focus() on the options, with what `focus` does instead, until `restore`: the
 * original focus, called with the element and its options, is the third argument.
 */
function patchOptionFocus(
  focus: (element: HTMLElement, options: FocusOptions | undefined, original: () => void) => void,
) {
  const original = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
    if (this.getAttribute('role') === 'option')
      focus(this, options, () => original.call(this, options));
    else original.call(this, options);
  };
  return () => {
    HTMLElement.prototype.focus = original;
  };
}

test('a list opened again while it fades out moves focus to the chosen option', async () => {
  // The exit lasts long enough that the select opens again before the closing list has gone.
  addStyle('.env-popup[data-ending-style] { transition-duration: 60s; }');
  const trigger = select('Plan');
  (trigger.element() as HTMLElement).focus();
  await keyboard.press('Space');
  await isFocused(option('Starter'));
  // Closed while it still grows in, it would leave at once.
  await grown();
  await keyboard.press('ArrowDown');
  await keyboard.press('Enter');
  await expect.poll(text(trigger)).toBe('Team');
  // Focus is back on the select as the list starts to fade, not once it has gone.
  expect(document.querySelectorAll('.env-popup[data-ending-style]')).toHaveLength(1);
  await isFocused(trigger);
  await keyboard.press('Space');
  await isFocused(option('Team'));
});

test('Select supports keyboard commit, typeahead, Escape, and native form reset, and its chevron turns as the list opens and closes', async () => {
  const trigger = select('Plan');
  expect(text(trigger)()).toBe('Starter');
  (trigger.element() as HTMLElement).focus();
  await keyboard.press('Space');
  await isOpen();
  await isFocused(option('Starter'));
  await expect.element(option('Enterprise')).toHaveAttribute('aria-disabled', 'true');
  await keyboard.press('ArrowDown');
  await keyboard.press('Enter');
  await expect.poll(text(trigger)).toBe('Team');
  await isClosed();
  await isFocused(trigger);

  await keyboard.press('Space');
  await isOpen();
  await isFocused(option('Team'));
  await keyboard.press('Home');
  await keyboard.press('Escape');
  await isClosed();
  expect(text(trigger)()).toBe('Team');
  await isFocused(trigger);
  await keyboard.press('Space');
  await isOpen();
  await isFocused(option('Team'));
  // The type-ahead's 750 ms pass only as the test moves the clock.
  stopTimers();
  await keyboard.press('s');
  await keyboard.press('Enter');
  await isClosed();
  expect(text(trigger)()).toBe('Starter');
  await isFocused(trigger);

  // A space typed within 750 ms of a letter goes on with the type-ahead rather than opening the
  // list: this moves the clock just past it.
  await passTime(800);
  vi.useRealTimers();
  await keyboard.press('Space');
  await isOpen();
  await isFocused(option('Starter'));
  await keyboard.press('ArrowDown');
  await keyboard.press('Enter');
  await isClosed();
  expect(text(trigger)()).toBe('Team');
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  await expect
    .poll(() => JSON.parse(page.getByTestId('form-values').element().textContent!).plan)
    .toBe('team');
  await page.getByRole('button', { name: 'Reset form', exact: true }).click();
  await expect.poll(text(trigger)).toBe('Starter');

  // A flip over would squash the chevron flat halfway; it turns half a circle instead.
  const icon = chevron(trigger);
  slowChevron(icon);
  await trigger.click();
  await isOpen();
  expectHalfTurn(await chevronTips(icon), 1);
  await keyboard.press('Escape');
  await isClosed();
  expectHalfTurn(await chevronTips(icon), -1);
  // With reduced motion it points the other way at once, at the style sheet's own duration.
  icon.style.removeProperty('transition-duration');
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.click();
  await isOpen();
  expect(icon.getAnimations()).toHaveLength(0);
  expect(new DOMMatrix(getComputedStyle(icon).transform).b).toBeCloseTo(-1, 2);
  await keyboard.press('Escape');
  await isClosed();
  await commands.emulateMedia({ reducedMotion: null });

  // Long options wrap in a narrow, zoomed viewport, and the list stays in it and scrolls.
  await page.viewport(320, 480);
  document.documentElement.style.fontSize = '200%';
  try {
    await trigger.click();
    await isOpen();
    const options = list().getByRole('option').elements();
    // The label follows the check-mark slot.
    for (const each of options)
      each.lastElementChild!.textContent = 'Long workspace configuration label '.repeat(3);
    for (const each of options)
      expect(each.scrollHeight).toBeLessThanOrEqual(each.clientHeight + 1);
    // Changing option content invalidates Floating UI's previous measurements.
    await expect
      .poll(() => {
        const { x, y, width, height } = box(popup());
        return x >= 0 && x + width <= 321 && y + height <= 481;
      })
      .toBe(true);
    const scroller = list().element();
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    await keyboard.press('Escape');
    await isFocused(trigger);
  } finally {
    document.documentElement.style.fontSize = '';
  }
});

test('a Select whose queued focus is lost moves focus to the highlighted option once open', async () => {
  // On a busy page, Base UI's queued move of focus to the option is now and then lost. Stand in
  // for that by ignoring the first focus call an option gets.
  let lost = false;
  const restore = patchOptionFocus((_element, _options, focus) => {
    if (lost) focus();
    lost = true;
  });
  try {
    const trigger = select('Plan');
    (trigger.element() as HTMLElement).focus();
    await keyboard.press('Space');
    await isOpen();
    await isFocused(option('Starter'));
    await keyboard.press('ArrowDown');
    await keyboard.press('Enter');
    await expect.poll(text(trigger)).toBe('Team');
  } finally {
    restore();
  }
});

test('a Select opened with the pointer leaves focus where Base UI puts it', async () => {
  // The safety net above is for keyboard opens only. Record who focuses an option, and let none
  // take focus, so focus stays on the trigger as the list opens: only Base UI may move it.
  const callers: string[] = [];
  const restore = patchOptionFocus(() => callers.push(new Error().stack ?? ''));
  try {
    const trigger = select('Plan');
    await trigger.click();
    await isOpen();
    // The safety net runs once the list has opened, when its animations finish.
    await expect.poll(() => popup().getAnimations({ subtree: true }).length).toBe(0);
    await isFocused(trigger);
    expect(callers.filter((stack) => stack.includes('Select.tsx'))).toEqual([]);
    await keyboard.press('Escape');
  } finally {
    restore();
  }
});

test(
  'a required Select participates in native constraint validation',
  { tags: ['engines'] },
  async () => {
    const nativeInput = page
      .getByTestId('required-form')
      .element()
      .querySelector<HTMLInputElement>('input[name="requiredChoice"]')!;
    await expect.poll(() => nativeInput.validity.valueMissing).toBe(true);
    const submissions = text(page.getByTestId('required-submissions'));
    await page.getByRole('button', { name: 'Submit required choice', exact: true }).click();
    expect(submissions()).toBe('0');
    const required = select('Required choice');
    await expect.element(required).toHaveAttribute('aria-required', 'true');
    await isFocused(required);
    // Dismiss the native validation bubble before interacting with the custom popup: one engine
    // consumes the first outside click while that bubble is open.
    await keyboard.press('Escape');
    await keyboard.press('ArrowDown');
    await isOpen();
    await option('Aurora').click();
    await expect.poll(() => nativeInput.value).toBe('aurora');
    await expect.poll(() => nativeInput.validity.valid).toBe(true);
    await page.getByRole('button', { name: 'Submit required choice', exact: true }).click();
    await expect.poll(submissions).toBe('1');
  },
);

test('a small Select has a small trigger, and its popup has the menus anatomy with a check mark', async () => {
  const compact = select('Compact plan');
  const standard = select('Plan');
  // The field's well, with its edge, is as tall as the control height, and at least the md height
  // while its label shows: a small one, of 2 rem, takes 2.5 rem.
  const compactBox = box(well(compact));
  expect(compactBox.height).toBeCloseTo(40, 0);
  expect(compactBox.height).toBeCloseTo(box(well(standard)).height, 0);
  // Without a visible label, a small select keeps the small height, and a smaller chevron.
  const unlabelled = select('Compact unlabelled plan');
  expect(box(well(unlabelled)).height).toBeCloseTo(32, 0);
  expect(box(chevron(unlabelled)).width).toBeLessThan(box(chevron(standard)).width);

  (compact.element() as HTMLElement).focus();
  await keyboard.press('Space');
  await isOpen();
  await expect.poll(() => popup().hasAttribute('data-starting-style')).toBe(false);
  // The popup grows in; its rows have their final size once the transition has run.
  await nextFrames();
  await animationsDone(popup());
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'var(--env-color-bg-popup)';
  popup().append(probe);
  const popupColor = getComputedStyle(probe).backgroundColor;
  probe.remove();
  // The popup's color, white and frosted at 88 % in light; its edge is there, clear, for a solid
  // popup.
  expect(popupColor).toBe('rgb(255, 255, 255)');
  expect(css(popup(), 'background-color')).toBe('color(srgb 1 1 1 / 0.88)');
  expect(Number.parseFloat(css(popup(), 'border-top-width'))).toBeGreaterThanOrEqual(1);
  expect(Number.parseFloat(css(popup(), 'border-top-left-radius'))).toBeCloseTo(20, 0);
  expect(Number.parseFloat(css(popup(), 'padding-top'))).toBeCloseTo(6, 0);
  // It opens 8 px clear of the outlined field, as every popup does, whatever the field's size, and
  // lines up with the field's edges, to the pixel the positioner rounds to.
  const triggerBox = box(well(compact));
  const popupBox = box(popup());
  expect(Math.abs(popupBox.x - triggerBox.x)).toBeLessThan(1);
  expect(Math.abs(popupBox.x + popupBox.width - (triggerBox.x + triggerBox.width))).toBeLessThan(1);
  const gap =
    popupBox.y > triggerBox.y
      ? popupBox.y - (triggerBox.y + triggerBox.height)
      : triggerBox.y - (popupBox.y + popupBox.height);
  expect(gap).toBeCloseTo(8, 0);
  const starter = option('Starter');
  const team = option('Team');
  await isFocused(starter);
  for (const each of [starter, team]) expect(box(each).height).toBeCloseTo(40, 0);
  // The selection's fill and a check mark show the selected option, and labels stay aligned.
  const check = (locator: Locator) =>
    locator.element().querySelector('.env-select-item-indicator svg');
  expect(check(starter)).not.toBeNull();
  expect(check(team)).toBeNull();
  const label = (locator: Locator) => locator.element().lastElementChild!.getBoundingClientRect();
  expect(label(team).x).toBeCloseTo(label(starter).x, 0);
  // The check ends the row, after the label.
  const indicator = box(starter.element().querySelector('.env-select-item-indicator')!);
  expect(indicator.x).toBeGreaterThanOrEqual(label(starter).right - 1);
  await keyboard.press('ArrowDown');
  await isFocused(team);
  // The highlight moves to the option the keyboard is on, a fill with no ring of its own, and
  // fades from the chosen one, which keeps the selection's fill.
  const selected = document.createElement('div');
  selected.style.backgroundColor = 'var(--env-color-bg-selected)';
  starter.element().append(selected);
  const selectedFill = getComputedStyle(selected).backgroundColor;
  selected.remove();
  await expect.poll(() => css(starter, 'background-color')).toBe(selectedFill);
  expect(css(team, 'outline-color')).toBe('rgba(0, 0, 0, 0)');
  await expect.poll(() => css(team, 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
  await keyboard.press('Enter');
  await isClosed();
  expect(text(compact)()).toBe('Team');
  await isFocused(compact);
  await page.getByRole('button', { name: 'Submit compact form', exact: true }).click();
  await expect
    .poll(() => JSON.parse(page.getByTestId('compact-values').element().textContent!))
    .toEqual({ compactPlan: 'team' });
  await compact.click();
  await isOpen();
  await expect.poll(() => check(option('Team'))).not.toBeNull();
  await keyboard.press('Escape');
  await isFocused(compact);
});

test(
  'a press outside an open list leaves focus to the press, never taking it to the select first',
  { tags: ['engines'] },
  async () => {
    addStyle('.env-popup[data-ending-style] { transition-duration: 1s; }');
    const trigger = select('Plan');
    const element = trigger.element() as HTMLElement;
    element.focus();
    await keyboard.press('Space');
    await isFocused(option('Starter'));
    await grown();
    let focusCount = 0;
    element.addEventListener('focus', () => focusCount++);
    // Beside the select, on the side away from the list: the press lands on the list's backdrop.
    const field = box(element);
    const below = box(popup()).y > field.y;
    await mouse.click(field.x + 20, below ? field.y - 60 : field.y + field.height + 20);
    await expect
      .poll(() => document.querySelectorAll('.env-popup[data-ending-style]').length)
      .toBe(1);
    expect(document.activeElement).not.toBe(element);
    expect(focusCount).toBe(0);
    // Base UI returns focus once the list has gone, once.
    await expect
      .poll(() => document.querySelectorAll('.env-popup[data-ending-style]').length)
      .toBe(0);
    expect(focusCount).toBeLessThanOrEqual(1);
  },
);
