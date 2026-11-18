import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Text.fixture.tsx';
import { box, css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

test('tabularNumbers gives every digit the same width; text without it keeps the font’s own', async () => {
  mount(fixture);
  await document.fonts.ready;
  const ones = page.getByTestId('tabular-ones');
  expect(css(ones, 'font-variant-numeric')).toBe('tabular-nums');
  expect(css(page.getByTestId('proportional'), 'font-variant-numeric')).toBe('normal');
  expect(box(ones).width).toBeCloseTo(box(page.getByTestId('tabular-eights')).width, 1);
});
