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
const well = (locator: Locator) => locator.element().closest('.env-select-control')!;
const chevron = (locator: Locator) =>
  locator.element().parentElement!.querySelector<HTMLElement>('.env-select-icon')!;

async function grown() {
  const open = document.querySelector('.env-popup[data-open]')!;
  await expect.poll(() => open.hasAttribute('data-starting-style')).toBe(false);
  await nextFrames();
  await animationsDone(open);
}

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
  const exitOutlastingReopen = '.env-popup[data-ending-style] { transition-duration: 60s; }';
  addStyle(exitOutlastingReopen);
  const trigger = select('Plan');
  (trigger.element() as HTMLElement).focus();
  await keyboard.press('Space');
  await isFocused(option('Starter'));
  await grown();
  await keyboard.press('ArrowDown');
  await keyboard.press('Enter');
  await expect.poll(text(trigger)).toBe('Team');
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
  stopTimers();
  await keyboard.press('s');
  await keyboard.press('Enter');
  await isClosed();
  expect(text(trigger)()).toBe('Starter');
  await isFocused(trigger);

  const justPastTypeAhead = 800;
  await passTime(justPastTypeAhead);
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

  const icon = chevron(trigger);
  slowChevron(icon);
  await trigger.click();
  await isOpen();
  expectHalfTurn(await chevronTips(icon), 1);
  await keyboard.press('Escape');
  await isClosed();
  expectHalfTurn(await chevronTips(icon), -1);
  icon.style.removeProperty('transition-duration');
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.click();
  await isOpen();
  expect(icon.getAnimations()).toHaveLength(0);
  expect(new DOMMatrix(getComputedStyle(icon).transform).b).toBeCloseTo(-1, 2);
  await keyboard.press('Escape');
  await isClosed();
  await commands.emulateMedia({ reducedMotion: null });

  await page.viewport(320, 480);
  document.documentElement.style.fontSize = '200%';
  try {
    await trigger.click();
    await isOpen();
    const options = list().getByRole('option').elements();
    for (const each of options)
      each.lastElementChild!.textContent = 'Long workspace configuration label '.repeat(3);
    for (const each of options)
      expect(each.scrollHeight).toBeLessThanOrEqual(each.clientHeight + 1);
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
  let firstFocusLost = false;
  const restore = patchOptionFocus((_element, _options, focus) => {
    if (firstFocusLost) focus();
    firstFocusLost = true;
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
  const callers: string[] = [];
  const restore = patchOptionFocus(() => callers.push(new Error().stack ?? ''));
  try {
    const trigger = select('Plan');
    await trigger.click();
    await isOpen();
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
    await keyboard.press('Escape');
    nativeInput.focus();
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
  expect(box(well(compact)).height).toBeCloseTo(32, 0);
  expect(box(well(standard)).height).toBeCloseTo(40, 0);
  const unlabelled = select('Compact unlabelled plan');
  expect(box(well(unlabelled)).height).toBeCloseTo(32, 0);
  expect(box(chevron(unlabelled)).width).toBeLessThan(box(chevron(standard)).width);

  (compact.element() as HTMLElement).focus();
  await keyboard.press('Space');
  await isOpen();
  await expect.poll(() => popup().hasAttribute('data-starting-style')).toBe(false);
  await nextFrames();
  await animationsDone(popup());
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'var(--env-color-bg-popup)';
  popup().append(probe);
  const popupColor = getComputedStyle(probe).backgroundColor;
  probe.remove();
  expect(popupColor).toBe('rgb(255, 255, 255)');
  expect(css(popup(), 'background-color')).toBe('color(srgb 1 1 1 / 0.88)');
  expect(Number.parseFloat(css(popup(), 'border-top-width'))).toBeGreaterThanOrEqual(1);
  expect(Number.parseFloat(css(popup(), 'border-top-left-radius'))).toBeCloseTo(20, 0);
  expect(Number.parseFloat(css(popup(), 'padding-top'))).toBeCloseTo(6, 0);
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
  const check = (locator: Locator) =>
    locator.element().querySelector('.env-select-item-indicator svg');
  expect(check(starter)).not.toBeNull();
  expect(check(team)).toBeNull();
  const label = (locator: Locator) => locator.element().lastElementChild!.getBoundingClientRect();
  expect(label(team).x).toBeCloseTo(label(starter).x, 0);
  const indicator = box(starter.element().querySelector('.env-select-item-indicator')!);
  expect(indicator.x).toBeGreaterThanOrEqual(label(starter).right - 1);
  await keyboard.press('ArrowDown');
  await isFocused(team);
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
    element.scrollIntoView({ block: 'center' });
    element.focus();
    await keyboard.press('Space');
    await isFocused(option('Starter'));
    await grown();
    let focusCount = 0;
    element.addEventListener('focus', () => focusCount++);
    const field = box(element);
    const below = box(popup()).y > field.y;
    await mouse.click(field.x + 20, below ? field.y - 60 : field.y + field.height + 20);
    await expect
      .poll(() => document.querySelectorAll('.env-popup[data-ending-style]').length)
      .toBe(1);
    expect(document.activeElement).not.toBe(element);
    expect(focusCount).toBe(0);
    await expect
      .poll(() => document.querySelectorAll('.env-popup[data-ending-style]').length)
      .toBe(0);
    expect(focusCount).toBeLessThanOrEqual(1);
  },
);

test('options take start and end content and groups, and the trigger shows the chosen start', async () => {
  mount({ default: fixture.SelectContentFixture });
  const trigger = select('Status');
  await expect.poll(text(trigger)).toBe('Active');
  const chosenStart = trigger.element().querySelector('.env-select-value-start')!;
  expect(chosenStart.getAttribute('aria-hidden')).toBe('true');
  expect(box(chosenStart).x).toBeLessThan(
    box(trigger.element().querySelector('.env-select-value')!).x,
  );
  await trigger.click();
  await isOpen();
  await expect.element(page.getByRole('group', { name: 'Open' })).toBeVisible();
  await expect.element(page.getByRole('group', { name: 'Closed' })).toBeVisible();
  const active = option('Active 3');
  await expect.element(active).toBeVisible();
  const row = active.element();
  expect(box(row.querySelector('[data-testid="dot-green"]')!).width).toBeCloseTo(8, 0);
  expect(row.querySelector('.env-list-row-start')!.getAttribute('aria-hidden')).toBe('true');
  const paused = page.getByTestId('paused');
  await expect.element(paused).toHaveRole('option');
  await expect.element(paused).toHaveAttribute('title', 'On hold');
  await expect.element(paused).toHaveClass('fixture-paused');
  await expect.element(paused).toHaveClass('env-select-item');
  await keyboard.press('ArrowDown');
  await keyboard.press('Enter');
  await isClosed();
  await expect.poll(text(trigger)).toBe('Paused');
  await expect
    .poll(() => trigger.element().querySelector('[data-testid="dot-orange"]'))
    .not.toBeNull();
});
