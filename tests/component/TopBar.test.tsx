import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/TopBar.fixture.tsx';
import { box, css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/** Whether an element and its ancestors up to the bar leave what overflows it visible. */
function unclipped(element: Element, bar: Element) {
  for (let node: Element | null = element; node && node !== bar; node = node.parentElement)
    if (getComputedStyle(node).overflowX !== 'visible') return false;
  return true;
}

test('centers its center content in the bar, and clips no content but a title given as text', async () => {
  mount(fixture);
  const centered = page.getByTestId('centered');
  const bar = box(centered);
  const ask = centered.getByRole('button', { name: 'Ask anything…' });
  const middle = box(ask);
  expect(middle.x + middle.width / 2).toBeCloseTo(bar.x + bar.width / 2, 0);
  expect(
    box(centered.getByText('Northwind')).x + box(centered.getByText('Northwind')).width,
  ).toBeLessThan(middle.x);
  expect(box(centered.getByRole('button', { name: 'Search' })).x).toBeGreaterThan(
    middle.x + middle.width,
  );
  expect(unclipped(ask.element(), centered.element())).toBe(true);

  const long = page.getByTestId('long-title');
  const text = long.element().querySelector('.env-top-bar-title-text')!;
  expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
  expect(css(text, 'text-overflow')).toBe('ellipsis');
  expect(box(text).x + box(text).width).toBeLessThanOrEqual(
    box(long.getByRole('button', { name: 'Account' })).x,
  );

  const buttonTitle = page.getByTestId('button-title');
  const title = buttonTitle.getByRole('button', { name: 'Website refresh' });
  expect(unclipped(title.element(), buttonTitle.element())).toBe(true);
  (title.element() as HTMLElement).focus();
  expect(css(title, 'outline-style')).not.toBe('none');
});
