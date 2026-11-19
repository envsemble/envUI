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

test("on touch, a picker's Clear button takes a 44 px tap and keeps its size", async () => {
  await commands.emulateTouch(true);
  await page.viewport(390, 844);
  mount(fixture);
  expect(matchMedia('(pointer: coarse)').matches).toBe(true);
  const clear = page.getByRole('button', { name: 'Clear' }).element();
  await animationsDone(clear);
  expect(clear.getBoundingClientRect().height).toBeLessThan(touchTarget);
  expect(reach(clear)).toBe(true);
});
