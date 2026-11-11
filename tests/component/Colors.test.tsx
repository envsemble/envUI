import { beforeEach, expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/Colors.fixture.tsx';
import { css, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  mount(fixture);
});

/** The computed color a custom property resolves to inside an element. */
function tokenColor(element: Element, token: string) {
  const probe = document.createElement('span');
  probe.style.backgroundColor = `var(${token})`;
  element.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

test('a nested Theme that overrides the semantic tokens recolors its area alone', async () => {
  const inside = page.getByTestId('override-inside');
  const outside = page.getByTestId('override-outside');
  const fill = (locator: typeof inside) => () => css(locator, 'background-color');
  await expect.poll(fill(inside)).toBe('rgb(23, 111, 53)');
  expect(css(page.getByTestId('override-switch'), 'background-color')).toBe('rgb(23, 111, 53)');
  // The area keeps every state: its own hover and pressed tokens apply.
  await inside.hover();
  await expect.poll(fill(inside)).toBe('rgb(17, 90, 42)');
  await mouse.down();
  await expect.poll(fill(inside)).toBe('rgb(11, 69, 32)');
  await mouse.up();
  await mouse.move(0, 0);
  // Outside the area, the theme's own brand color stays.
  const brand = tokenColor(outside.element(), '--env-color-bg-primary-emphasis');
  expect(brand).not.toBe('rgb(23, 111, 53)');
  expect(css(outside, 'background-color')).toBe(brand);
});
