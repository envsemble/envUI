export function reducedMotionQuery(view: Window | undefined = globalThis.window) {
  return typeof view?.matchMedia === 'function'
    ? view.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
}

export const prefersReducedMotion = (view?: Window) => reducedMotionQuery(view)?.matches ?? false;
