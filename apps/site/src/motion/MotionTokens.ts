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

/** The control points of an easing token, as the page's root sets it, such as `--env-motion-ease`. */
function easePoints(name: Ease): readonly number[] {
  const value =
    typeof document === 'undefined'
      ? ''
      : getComputedStyle(document.documentElement).getPropertyValue(`--env-motion-${name}`);
  const points = /cubic-bezier\(([^)]+)\)/.exec(value)?.[1]?.split(',').map(Number);
  return points?.length === 4 && points.every(Number.isFinite) ? points : designedEases[name];
}

/**
 * An easing token as CSS, for an animation the site starts from script, such as `element.animate`:
 * the token's own curve, so a theme that changes it changes the animation with it.
 */
export const motionEase = (name: Ease = 'ease') => `cubic-bezier(${easePoints(name).join(', ')})`;

/**
 * An easing token as a function from the share of the time gone, 0 to 1, to the share of the way,
 * for motion the site steps itself frame by frame: the cubic Bézier curve the token names.
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
