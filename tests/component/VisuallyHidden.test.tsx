import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/VisuallyHidden.fixture.tsx';
import { box } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

test('assistive technology reads what it holds, in the element render gives', async () => {
  await expect.element(page.getByRole('button', { name: 'Save draft' })).toBeInTheDocument();
  await expect.element(page.getByRole('heading', { level: 2, name: 'Plan' })).toBeInTheDocument();
  expect(page.getByTestId('price').element().textContent).toBe('$12/mo per month');
});

test('it takes no room on screen and shows nothing', () => {
  const hidden = page.getByTestId('hidden').element();
  expect(box(hidden).width).toBeLessThanOrEqual(1);
  expect(box(hidden).height).toBeLessThanOrEqual(1);
  expect(getComputedStyle(hidden).clipPath).toBe('inset(50%)');
  expect(box(page.getByTestId('save')).width).toBeCloseTo(
    box(page.getByTestId('plain-save')).width,
    0,
  );
});
