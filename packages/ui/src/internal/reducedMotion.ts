/** The reduced-motion media query of `view`, or null where it has none, as on the server. */
export function reducedMotionQuery(view: Window | undefined = globalThis.window) {
  return typeof view?.matchMedia === 'function'
    ? view.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
}

/** Whether the reader asks for reduced motion; false where the window can't tell. */
export const prefersReducedMotion = (view?: Window) => reducedMotionQuery(view)?.matches ?? false;
