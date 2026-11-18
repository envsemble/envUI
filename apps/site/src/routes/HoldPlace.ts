const interruptions = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

const settleDelayMs = 500;
const maxHoldMs = 8000;

export function holdPlace(main: HTMLElement, element: () => HTMLElement | null, offsetPx: number) {
  const start = performance.now();
  let settledSince: number | undefined;
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const event of interruptions) removeEventListener(event, stop, true);
  };
  const step = () => {
    const target = element();
    if (target) {
      const scrollByPx =
        target.getBoundingClientRect().top - main.getBoundingClientRect().top - offsetPx;
      if (Math.abs(scrollByPx) >= 1) main.scrollBy({ top: scrollByPx, behavior: 'instant' });
    }
    const now = performance.now();
    if (main.querySelector('.site-loading')) settledSince = undefined;
    else settledSince ??= now;
    if (
      now - start > maxHoldMs ||
      (settledSince !== undefined && now - settledSince > settleDelayMs)
    )
      return stop();
    frame = requestAnimationFrame(step);
  };
  for (const event of interruptions) addEventListener(event, stop, true);
  step();
  return stop;
}
