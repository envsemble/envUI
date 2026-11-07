/**
 * A motion token's duration in milliseconds, as the page's root sets it, such as
 * `--env-motion-duration-fast`, for a timer that waits for a transition the site starts: the
 * token's own value, so a theme that changes it changes the wait with it.
 */
export function motionDuration(speed: 'fast' | 'medium' | 'slow') {
  if (typeof document === 'undefined') return 0;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--env-motion-duration-${speed}`)
    .trim();
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.endsWith('ms') ? amount : amount * 1000;
}

/** Whether the reader asks for less motion. */
export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Each easing token's designed curve, for where the page's root sets none. */
const designedEases = {
  ease: [0.45, 0, 0.2, 1],
  'ease-enter': [0.05, 0.7, 0.1, 1],
  'ease-exit': [0.4, 0, 1, 1],
} as const;

type Ease = keyof typeof designedEases;

/** The curves CSS names by a keyword, which an easing token may be set to as well. */
const keywordEases: Record<string, readonly number[]> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
};

/** An easing token's value as the page's root sets it, such as `--env-motion-ease`; '' unset. */
const easeValue = (name: Ease) =>
  typeof document === 'undefined'
    ? ''
    : getComputedStyle(document.documentElement).getPropertyValue(`--env-motion-${name}`).trim();

/**
 * The control points of an easing token's curve: its `cubic-bezier()` or the curve its keyword
 * names, such as `linear` or `ease-out`; the designed curve for anything else.
 */
function easePoints(name: Ease): readonly number[] {
  const value = easeValue(name);
  const points = /^cubic-bezier\(([^)]+)\)$/.exec(value)?.[1]?.split(',').map(Number);
  if (points?.length === 4 && points.every(Number.isFinite)) return points;
  return keywordEases[value] ?? designedEases[name];
}

/**
 * An easing token as CSS, for an animation the site starts from script, such as `element.animate`:
 * the token's own value, any CSS easing, such as `linear` or `steps(4)`, so a theme that changes it
 * changes the animation with it; the designed curve where it is unset or no easing.
 */
export function motionEase(name: Ease = 'ease') {
  const value = easeValue(name);
  if (value && typeof CSS !== 'undefined' && CSS.supports('animation-timing-function', value))
    return value;
  return `cubic-bezier(${designedEases[name].join(', ')})`;
}

/**
 * An easing token as a function from the share of the time gone, 0 to 1, to the share of the way,
 * for motion the site steps itself frame by frame: the cubic Bézier curve the token sets or its
 * keyword names; for another easing, such as `steps()`, the designed curve.
 */
export function motionEasing(name: Ease = 'ease'): (time: number) => number {
  const [x1, y1, x2, y2] = easePoints(name) as [number, number, number, number];
  const along = (t: number, a: number, b: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  const slope = (t: number, a: number, b: number) =>
    3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t ** 2;
  return (time) => {
    if (time <= 0) return 0;
    if (time >= 1) return 1;
    // The curve's parameter at this time: Newton's steps, then halving where they stall.
    let t = time;
    for (let step = 0; step < 6; step++) {
      const error = along(t, x1, x2) - time;
      const rate = slope(t, x1, x2);
      if (Math.abs(error) < 1e-5) return along(t, y1, y2);
      if (Math.abs(rate) < 1e-6) break;
      t = Math.min(1, Math.max(0, t - error / rate));
    }
    let [low, high] = [0, 1];
    t = time;
    for (let step = 0; step < 24; step++) {
      if (along(t, x1, x2) < time) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return along(t, y1, y2);
  };
}
