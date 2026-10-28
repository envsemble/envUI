import { expect, type Locator } from '@playwright/test';

// The chevron of a Select or Combobox trigger, which flips as its popup opens and closes.

/**
 * Slows a chevron's flip, so a test can seek through it while it runs. Only the duration changes:
 * the transition, and whether reduced motion leaves it out, stay the style sheet's.
 */
export async function slowChevron(icon: Locator) {
  await icon.evaluate((element: HTMLElement) => {
    element.style.transitionDuration = '20s';
  });
}

/**
 * Where the chevron's tip points through its running flip, as [x, y] on the screen at eleven even
 * steps: the drawn chevron points right, so its tip follows the transform's first column. The
 * flip then finishes.
 */
export async function chevronTips(icon: Locator) {
  await expect.poll(() => icon.evaluate((element) => element.getAnimations().length)).toBe(1);
  return icon.evaluate((element) => {
    const [flip] = element.getAnimations();
    flip.pause();
    const duration = Number(flip.effect!.getComputedTiming().duration);
    const tips: [number, number][] = [];
    for (let step = 0; step <= 10; step++) {
      flip.currentTime = (duration * step) / 10;
      const { a, b } = new DOMMatrix(getComputedStyle(element).transform);
      tips.push([a, b]);
    }
    flip.finish();
    return tips;
  });
}

/**
 * Checks a flip from pointing one way to the other along the vertical: from down (1) to up (-1)
 * or back, never leaning sideways on the way, as a half turn does through pointing right.
 */
export function expectVerticalFlip(tips: [number, number][], from: 1 | -1) {
  for (const [x] of tips) expect(Math.abs(x)).toBeLessThan(0.01);
  expect(tips[0][1]).toBeCloseTo(from, 2);
  expect(tips.at(-1)![1]).toBeCloseTo(-from, 2);
}
