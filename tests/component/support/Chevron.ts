import { expect } from 'vitest';

export function slowChevron(icon: HTMLElement) {
  icon.style.transitionDuration = '20s';
}

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

export function expectHalfTurn(tips: [number, number][], from: 1 | -1) {
  for (const [x, y] of tips) expect(Math.hypot(x, y)).toBeCloseTo(1, 2);
  expect(tips[0]![1]).toBeCloseTo(from, 2);
  expect(tips.at(-1)![1]).toBeCloseTo(-from, 2);
}
