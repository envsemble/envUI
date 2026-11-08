/**
 * The motion tokens as script reads them, so motion a component runs from script follows what an
 * application sets on its Theme, as its style sheets do: a duration token of 0s turns it off.
 */

export type MotionDuration = 'fast' | 'medium' | 'slow';
export type MotionEasing = 'ease' | 'ease-enter' | 'ease-exit';

/**
 * A CSS time, such as `0.24s` or `240ms`, in milliseconds; 0 for anything else.
 *
 * @internal Exported for tests/library/MotionTokens.test.mjs.
 */
export function parseTime(value: string): number {
  const time = value.trim();
  const amount = Number.parseFloat(time);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (time.endsWith('ms')) return amount;
  return time.endsWith('s') ? amount * 1000 : 0;
}

/**
 * The longest of an element's transitions or animations, its delay included, in milliseconds: 0
 * where they all take 0s, as with motion tokens of 0s, when an end event may never come.
 */
export function motionTime(element: Element, kind: 'transition' | 'animation'): number {
  const style = getComputedStyle(element);
  const times = (list: string) => list.split(',').map(parseTime);
  const delays = times(kind === 'transition' ? style.transitionDelay : style.animationDelay);
  const durations = times(
    kind === 'transition' ? style.transitionDuration : style.animationDuration,
  );
  return Math.max(0, ...durations.map((duration, index) => duration + (delays[index] ?? 0)));
}

/**
 * The duration token `--env-motion-duration-<name>` on `element`, in milliseconds: 0 where it is
 * 0s or unset, such as outside a Theme or without style sheets, where nothing should animate.
 */
export function motionDuration(element: Element, name: MotionDuration): number {
  return parseTime(getComputedStyle(element).getPropertyValue(`--env-motion-duration-${name}`));
}

/** The easing token `--env-motion-<name>` on `element`, as a CSS easing; `ease` where it is unset. */
export function motionEasing(element: Element, name: MotionEasing): string {
  return getComputedStyle(element).getPropertyValue(`--env-motion-${name}`).trim() || 'ease';
}

/**
 * A CSS easing as a function of progress, for motion drawn frame by frame: `cubic-bezier()` and
 * `linear`, and the keywords; any other easing reads as the standard `ease`.
 */
export function easingFunction(easing: string): (progress: number) => number {
  const keywords: Record<string, readonly [number, number, number, number]> = {
    ease: [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1],
  };
  const value = easing.trim();
  if (value === 'linear') return (progress) => clamp(progress);
  const match = /^cubic-bezier\(([^)]*)\)$/.exec(value);
  const points = match?.[1]!.split(',').map(Number.parseFloat);
  const [x1, y1, x2, y2] =
    points?.length === 4 && points.every(Number.isFinite)
      ? points
      : (keywords[value] ?? keywords.ease!);
  return (progress) => bezier(clamp(progress), x1!, y1!, x2!, y2!);
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** The curve's y where its x is `x`, found by halving: x grows with t on every CSS curve. */
function bezier(x: number, x1: number, y1: number, x2: number, y2: number) {
  if (x <= 0 || x >= 1) return x;
  const at = (t: number, a: number, b: number) =>
    3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  let low = 0;
  let high = 1;
  let t = x;
  for (let step = 0; step < 30; step += 1) {
    t = (low + high) / 2;
    if (at(t, x1, x2) < x) low = t;
    else high = t;
  }
  return at(t, y1, y2);
}
