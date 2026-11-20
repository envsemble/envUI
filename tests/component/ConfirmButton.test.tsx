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
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const label = (locator: Locator) => locator.element().textContent;

const doublePressGuardMs = 400;
const fixtureDisarmMs = 800;
const waitOutDoublePressGuard = () => waitOnRealTime(doublePressGuardMs + 50);

test('ConfirmButton names the consequence and runs only on a deliberate second press', async () => {
  const errors = collectErrors();
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
  await waitOutDoublePressGuard();
  await button.click();
  await expect.poll(confirmed).toBe('1');
  expect(label(button)).toBe('Remove');
  expect(status()).toBe('');

  await button.dblClick();
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  expect(confirmed()).toBe('1');
  await keyboard.press('Escape');
  await expect.poll(() => label(button)).toBe('Remove');
  (button.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await keyboard.press('Tab');
  await expect.poll(() => label(button)).toBe('Remove');
  stopTimers();
  (button.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await passTime(fixtureDisarmMs - 10);
  expect(label(button)).toBe('Remove Morgan');
  await passTime(20);
  expect(label(button)).toBe('Remove');
  vi.useRealTimers();
  expect(confirmed()).toBe('1');

  const icon = page.getByTestId('confirm-icon-button');
  await expect.element(icon).toHaveAccessibleName('Remove Morgan');
  await expect.element(icon).toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveAttribute('data-variant', 'secondary');
  const rest = box(icon);
  expect(rest.width).toBeCloseTo(36, 0);
  expect(rest.height).toBeCloseTo(36, 0);
  const corner = css(icon, 'border-top-left-radius');
  expect(Number.parseFloat(corner)).toBeGreaterThan(0);
  (icon.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.element(icon).toHaveAccessibleName('Remove');
  expect(label(icon)).toBe('Remove');
  await expect.element(icon).toHaveAttribute('data-tone', 'danger');
  await expect.element(icon).not.toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveFocus();
  expect(icon.element().querySelectorAll('.env-button-start .env-icon-symbol')).toHaveLength(1);
  expect(box(icon).width).toBeGreaterThan(rest.width + 40);
  expect(css(icon, 'border-top-left-radius')).toBe(corner);
  expect(document.querySelectorAll('.env-confirm-button-status')[1]!.textContent).toBe(
    'Remove. Press again to confirm.',
  );
  await waitOutDoublePressGuard();
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
