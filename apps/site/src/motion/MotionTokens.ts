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
