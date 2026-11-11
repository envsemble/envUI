import { expect, test, vi } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import {
  box,
  collectErrors,
  css,
  keyboard,
  passTime,
  stopTimers,
  waitOnRealTime,
} from './Browser.ts';
import { mount } from './Mount.tsx';

const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const label = (locator: Locator) => locator.element().textContent;

/**
 * Waits out ConfirmButton's guard against a double press, 400 ms, as a deliberate press does: the
 * guard compares the presses' own times, which no stopped clock moves.
 */
const pastTheGuard = () => waitOnRealTime(450);

test('ConfirmButton names the consequence and runs only on a deliberate second press', async () => {
  const errors = collectErrors();
  // The fixture's buttons disarm after 800 ms.
  mount(adoption);
  const button = page.getByTestId('confirm-button');
  const confirmed = text('confirmed');
  const status = () => document.querySelector('.env-confirm-button-status')!.textContent;
  expect(label(button)).toBe('Remove');
  await expect.element(button).toHaveAttribute('data-variant', 'outline');

  await button.click();
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await expect.element(button).toHaveAttribute('data-tone', 'danger');
  expect(status()).toBe('Remove Morgan. Press again to confirm.');
  await pastTheGuard();
  await button.click();
  await expect.poll(confirmed).toBe('1');
  expect(label(button)).toBe('Remove');
  expect(status()).toBe('');

  // A double click only arms it.
  await button.dblClick();
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  expect(confirmed()).toBe('1');
  // Escape, leaving the button and waiting all disarm it.
  await keyboard.press('Escape');
  await expect.poll(() => label(button)).toBe('Remove');
  (button.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await keyboard.press('Tab');
  await expect.poll(() => label(button)).toBe('Remove');
  // The fixture's 800 ms pass only as the test moves the clock.
  stopTimers();
  (button.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await passTime(790);
  expect(label(button)).toBe('Remove Morgan');
  await passTime(20);
  expect(label(button)).toBe('Remove');
  vi.useRealTimers();
  expect(confirmed()).toBe('1');

  // An icon-only ConfirmButton is round at rest and names the consequence when armed.
  const icon = page.getByTestId('confirm-icon-button');
  await expect.element(icon).toHaveAccessibleName('Remove Morgan');
  await expect.element(icon).toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveAttribute('data-variant', 'secondary');
  // The adoption fixture takes the default scale, compact under the fine pointer of the tests.
  const rest = box(icon);
  expect(rest.width).toBeCloseTo(36, 0);
  expect(rest.height).toBeCloseTo(36, 0);
  // Round like IconButton: the corners take at least half the height.
  expect(Number.parseFloat(css(icon, 'border-top-left-radius'))).toBeGreaterThanOrEqual(18);
  // Keyboard arming keeps focus on the button while it grows to name the consequence.
  (icon.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.element(icon).toHaveAccessibleName('Remove');
  expect(label(icon)).toBe('Remove');
  await expect.element(icon).toHaveAttribute('data-tone', 'danger');
  await expect.element(icon).not.toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveFocus();
  expect(icon.element().querySelectorAll('.env-icon')).toHaveLength(1);
  expect(box(icon).width).toBeGreaterThan(rest.width + 40);
  expect(document.querySelectorAll('.env-confirm-button-status')[1]!.textContent).toBe(
    'Remove. Press again to confirm.',
  );
  await pastTheGuard();
  await keyboard.press('Enter');
  await expect.poll(confirmed).toBe('2');
  await expect.element(icon).toHaveAccessibleName('Remove Morgan');
  await expect.element(icon).toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveFocus();
  await icon.click();
  await expect.poll(() => label(icon)).toBe('Remove');
  await keyboard.press('Escape');
  await expect.element(icon).toHaveClass(/env-icon-button/);
  expect(confirmed()).toBe('2');
  expect(errors).toEqual([]);
});
