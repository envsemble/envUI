import { expect } from 'vitest';

// The chevron of a Select or Combobox trigger, which turns as its popup opens and closes.

/**
 * Slows a chevron's turn, so a test can seek through it while it runs. Only the duration changes:
 * the transition, and whether reduced motion leaves it out, stay the style sheet's.
 */
export function slowChevron(icon: HTMLElement) {
  icon.style.transitionDuration = '20s';
}

/**
 * Where the chevron's tip points through its running turn, as [x, y] on the screen at eleven even
 * steps: the drawn chevron points right, so its tip follows the transform's first column. The
 * turn then finishes.
 */
export async function chevronTips(icon: Element) {
  await expect.poll(() => icon.getAnimations().length).toBe(1);
  const [turn] = icon.getAnimations();
  turn!.pause();
  const duration = Number(turn!.effect!.getComputedTiming().duration);
  const tips: [number, number][] = [];
  for (let step = 0; step <= 10; step++) {
    turn!.currentTime = (duration * step) / 10;
    const { a, b } = new DOMMatrix(getComputedStyle(icon).transform);
    tips.push([a, b]);
  }
  turn!.finish();
  return tips;
}

/**
 * Checks a half turn from pointing one way to the other along the vertical: from down (1) to up
 * (-1) or back, keeping its shape all the way, never squashed flat as a flip over is halfway.
 */
export function expectHalfTurn(tips: [number, number][], from: 1 | -1) {
  for (const [x, y] of tips) expect(Math.hypot(x, y)).toBeCloseTo(1, 2);
  expect(tips[0]![1]).toBeCloseTo(from, 2);
  expect(tips.at(-1)![1]).toBeCloseTo(-from, 2);
}
