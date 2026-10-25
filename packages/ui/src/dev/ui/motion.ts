// Whether dev mode's own motion, such as the view gliding to an angle, should be skipped.

let query: MediaQueryList | null = null;

/** Whether the reader prefers reduced motion; then the view and the wheel move at once. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  query ??= window.matchMedia('(prefers-reduced-motion: reduce)');
  return query.matches;
}
