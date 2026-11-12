import { beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Pagination.fixture.tsx';
import { css, keyboard } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const scope = () => page.getByTestId('paginations-light');
const pager = (name: string) => scope().getByRole('navigation', { name, exact: true });
const rangeOf = (nav: Locator) => () =>
  nav.element().querySelector('.env-pagination-range')?.textContent;
const changes = () => scope().getByTestId('changes').element().textContent;
/** Presses a button even while it is unavailable, as a press that reaches it would. */
const press = (button: Locator) => (button.element() as HTMLElement).click();

/** The range text and whether each button can be pressed. */
function state(nav: Locator) {
  const available = (name: string) =>
    nav.getByRole('button', { name, exact: true }).element().getAttribute('aria-disabled') !==
    'true';
  return {
    range: rangeOf(nav)(),
    previous: available('Previous page'),
    next: available('Next page'),
  };
}

const busy = (button: Locator) => () => button.element().getAttribute('aria-busy');
/** Whether a button shows its spinner. */
const spinner = (button: Locator) => () =>
  (button.element().querySelector('.env-spinner')?.getBoundingClientRect().width ?? 0) > 0;

test('the range and the buttons follow the page, and a loading page makes both wait; a load for another reason makes both wait without a spinner', async () => {
  const nav = pager('Report pages light');
  const previous = nav.getByRole('button', { name: 'Previous page' });
  const next = nav.getByRole('button', { name: 'Next page' });
  const finish = scope().getByRole('button', { name: 'Finish loading light' });
  expect(state(nav)).toEqual({ range: '1–60 of 245', previous: false, next: true });
  // Nothing comes before the first page; the button is unavailable, yet a press reaches it.
  press(previous);
  await expect.poll(changes).toBe('');

  await next.click();
  await expect.poll(changes).toBe('2');
  // While the page loads, the button pressed shows a spinner and neither takes another press.
  await expect.poll(busy(next)).toBe('true');
  await expect.poll(spinner(next)).toBe(true);
  await expect.element(previous).toHaveAttribute('aria-disabled', 'true');
  press(next);
  press(previous);
  await expect.poll(changes).toBe('2');
  await finish.click();
  await expect.poll(rangeOf(nav)).toBe('61–120 of 245');
  await expect.poll(busy(next)).toBeNull();
  expect(state(nav)).toEqual({ range: '61–120 of 245', previous: true, next: true });
  // A load that ends forgets its button: the next load from previous spins on previous.
  await previous.click();
  await expect.poll(busy(previous)).toBe('true');
  expect(busy(next)()).toBeNull();
  await finish.click();
  await expect.poll(rangeOf(nav)).toBe('1–60 of 245');
  await expect.poll(changes).toBe('2,1');

  // These batches page without loading, so the press is forgotten at once; a refresh, a load for
  // another reason, makes both buttons wait, spinning neither.
  const batches = pager('Batches light');
  const following = batches.getByRole('button', { name: 'Next page' });
  const refresh = scope().getByRole('button', { name: 'Refresh batches light' });
  await following.click();
  await expect.poll(rangeOf(batches)).toBe('51–100');
  await refresh.click();
  await expect.element(following).toHaveAttribute('aria-disabled', 'true');
  await expect
    .element(batches.getByRole('button', { name: 'Previous page' }))
    .toHaveAttribute('aria-disabled', 'true');
  expect(batches.element().querySelectorAll('[aria-busy]')).toHaveLength(0);
  expect(batches.element().querySelectorAll('.env-spinner')).toHaveLength(0);
  await refresh.click();
  await expect.poll(() => state(batches)).toEqual({ range: '51–100', previous: true, next: true });
});

test('the keyboard pages with Enter and Space, and focus stays on the last page', async () => {
  const nav = pager('Report pages light');
  const range = rangeOf(nav);
  const previous = nav.getByRole('button', { name: 'Previous page' });
  const next = nav.getByRole('button', { name: 'Next page' });
  const finish = scope().getByRole('button', { name: 'Finish loading light' });
  // The range is announced politely as it changes.
  expect(nav.element().querySelector('.env-pagination-range')!.getAttribute('aria-live')).toBe(
    'polite',
  );
  // The first page leaves previous unavailable but focusable.
  (previous.element() as HTMLElement).focus();
  await expect.element(previous).toHaveFocus();
  await keyboard.press('Tab');
  await expect.element(next).toHaveFocus();
  expect(css(next, 'outline-style')).toBe('solid');
  for (const [key, expected] of [
    ['Enter', '61–120 of 245'],
    ['Space', '121–180 of 245'],
    ['Enter', '181–240 of 245'],
    ['Space', '241–245 of 245'],
  ] as const) {
    await keyboard.press(key);
    await expect.poll(busy(next)).toBe('true');
    await expect.element(next).toHaveFocus();
    press(finish);
    await expect.poll(range).toBe(expected);
    await expect.element(next).toHaveFocus();
  }
  // On the last page next is unavailable, and focus stays on it.
  await expect.element(next).toHaveAttribute('aria-disabled', 'true');
  await keyboard.press('Enter');
  expect(busy(next)()).toBeNull();
  await expect.element(next).toHaveFocus();
  await expect.poll(changes).toBe('2,3,4,5');
});

test('a load the application starts in an effect after the page changes spins the button pressed', async () => {
  const nav = pager('Effect pages light');
  const previous = nav.getByRole('button', { name: 'Previous page' });
  const next = nav.getByRole('button', { name: 'Next page' });
  const finish = scope().getByRole('button', { name: 'Finish effect loading light' });
  await next.click();
  // The page changes at once and its load starts in the effect that follows.
  await expect.poll(rangeOf(nav)).toBe('21–40 of 100');
  await expect.poll(busy(next)).toBe('true');
  await expect.poll(spinner(next)).toBe(true);
  await expect.element(previous).toHaveAttribute('aria-disabled', 'true');
  expect(busy(previous)()).toBeNull();
  await finish.click();
  await expect.poll(busy(next)).toBeNull();
  expect(state(nav)).toEqual({ range: '21–40 of 100', previous: true, next: true });
  // A load for another reason later spins neither button.
  await scope().getByRole('button', { name: 'Reload effect pages light' }).click();
  await expect.element(next).toHaveAttribute('aria-disabled', 'true');
  expect(nav.element().querySelectorAll('[aria-busy]')).toHaveLength(0);
  await finish.click();
  await previous.click();
  await expect.poll(busy(previous)).toBe('true');
  expect(busy(next)()).toBeNull();
});
