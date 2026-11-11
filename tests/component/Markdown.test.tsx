import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Markdown.fixture.tsx';
import { css } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

test('an item with key caps in its line keeps its line, its bullet beside the keys', () => {
  const items = [...page.getByTestId('keys').element().querySelectorAll('li')].map((item) => {
    // The bullet's middle, from the item's top, sits within each key cap's height: a margin on a
    // key would push the line, and the keys, down below the bullet.
    const bullet = getComputedStyle(item, '::after');
    const middle = Number.parseFloat(bullet.top) + Number.parseFloat(bullet.height) / 2;
    const top = item.getBoundingClientRect().top;
    return [...item.querySelectorAll('.env-kbd')].every((key) => {
      const box = key.getBoundingClientRect();
      return box.top - top < middle && box.bottom - top > middle;
    });
  });
  expect(items).toEqual([true, true]);
});

test(
  'inline code in a table cell breaks only where it would overflow, not inside its word',
  { tags: ['engines'] },
  () => {
    const code = page.getByTestId('narrow').element().querySelector('td code')!;
    expect(css(code, 'overflow-wrap')).toBe('break-word');
    // The column keeps room for the whole word, which the region scrolls to show.
    expect(code.getClientRects()).toHaveLength(1);
  },
);

test('rendered again with a new renderLink, Markdown keeps its elements and uses the new one', async () => {
  const scope = page.getByTestId('rendered-again');
  const heading = scope.getByRole('heading', { name: 'Plans' }).element();
  const link = scope.getByRole('link', { name: 'the prices' });
  await expect.element(link).toHaveAttribute('data-round', '0');
  await scope.getByRole('button', { name: 'Render again' }).click();
  await expect.element(link).toHaveAttribute('data-round', '1');
  // The heading is the same element: a page's anchors, focus and scroll position survive.
  expect(heading.isConnected).toBe(true);
});
