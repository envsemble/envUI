import { expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/DescriptionList.fixture.tsx';
import { box, css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/**
 * Mounts the fixture once its text font has loaded: the values' column follows the longest label's
 * width, which changes as the font swaps in.
 */
async function open() {
  mount(fixture);
  await document.fonts.load('1em "envUI Geist"');
  await document.fonts.ready;
}

const nth = (locator: Locator, index: number) => locator.elements()[index]!;

test('puts labels beside values, and above them below 18 rem; with controls, rows are as tall as a small control', async () => {
  await open();
  const list = page.getByTestId('auto');
  const terms = list.getByRole('term');
  const definitions = list.getByRole('definition');
  const label = nth(terms, 0);
  const value = nth(definitions, 0);
  // Inline, the values line up in a column after the longest label.
  const longest = box(nth(terms, 2));
  expect(box(value).x).toBeGreaterThan(longest.x + longest.width);
  expect(box(nth(definitions, 2)).x).toBeCloseTo(box(value).x, 0);
  expect(Math.abs(box(value).y - box(label).y)).toBeLessThan(4);
  // Labels are muted.
  expect(css(label, 'color')).not.toBe(css(value, 'color'));

  await page.getByRole('button', { name: 'Narrow list' }).click();
  const above = box(label);
  await expect.poll(() => box(value).y).toBeGreaterThanOrEqual(above.y + above.height);
  expect(box(value).x).toBeCloseTo(above.x, 0);
  // A stacked list puts each label above its value at any width.
  const stacked = page.getByTestId('stacked');
  const email = box(nth(stacked.getByRole('term'), 0));
  expect(box(nth(stacked.getByRole('definition'), 0)).y).toBeGreaterThanOrEqual(
    email.y + email.height,
  );

  // With controls, a row is as tall as a small control, and the label sits on the control's line.
  const controls = page.getByTestId('controls');
  expect(box(nth(controls.getByRole('definition'), 1)).height).toBeGreaterThanOrEqual(31.5);
  const visibility = box(nth(controls.getByRole('term'), 0));
  const control = box(controls.getByRole('combobox', { name: 'Visibility' }));
  expect(
    Math.abs(visibility.y + visibility.height / 2 - (control.y + control.height / 2)),
  ).toBeLessThan(2);
});
