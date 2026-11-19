import { afterEach, expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/TouchTargets.fixture.tsx';
import { animationsDone } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

afterEach(async () => {
  await commands.emulateTouch(false);
});

const touchTarget = 44;

function reach(target: Element) {
  const { x, y, width, height } = target.getBoundingClientRect();
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const edge = touchTarget / 2 - 1;
  return [
    [centerX, centerY - edge],
    [centerX, centerY + edge],
  ].every(([pointX, pointY]) => target.contains(document.elementFromPoint(pointX!, pointY!)));
}

test('on touch, breadcrumb links, contents links and a picker's Clear button take a 44 px tap, and keep their size under a mouse', async () => {
  mount(fixture);
  const links = () => [
    page.getByRole('link', { name: 'Workspace' }).element(),
    page.getByRole('link', { name: 'Create a workspace' }).element(),
  ];
  const mouseHeights = links().map((link) => link.getBoundingClientRect().height);
  expect(mouseHeights.every((height) => height < touchTarget)).toBe(true);
  expect(links().map(reach)).toEqual([false, false]);
  await commands.emulateTouch(true);
  await page.viewport(390, 844);
  mount(fixture);
  expect(matchMedia('(pointer: coarse)').matches).toBe(true);
  expect(links().map(reach)).toEqual([true, true]);
  const clear = page.getByRole('button', { name: 'Clear' }).element();
  await animationsDone(clear);
  expect(clear.getBoundingClientRect().height).toBeLessThan(touchTarget);
  expect(reach(clear)).toBe(true);
});
