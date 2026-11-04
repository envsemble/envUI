/** What the reader does that takes their place over from the page: scrolling, pressing or typing. */
const interruptions = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

/** How long the page has had nothing loading before the place is let go, in ms. */
const settleFor = 500;
/** The longest a place is held, in ms. */
const holdAtMost = 8000;

/**
 * Holds an element `offset` pixels below the top of the body that scrolls, `main`, while the parts
 * of the page around it load: the place the page opened at, such as a section an address names or
 * where the reader was before going back, stays in view as figures above it land at heights their
 * skeletons didn't keep. A browser with scroll anchoring keeps most of it; one without, such as
 * Safari, keeps none. The place is let go once nothing has loaded for a moment, or as the reader
 * scrolls, presses or types. Returns the cleanup.
 */
export function holdPlace(main: HTMLElement, element: () => HTMLElement | null, offset: number) {
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
      const by = target.getBoundingClientRect().top - main.getBoundingClientRect().top - offset;
      if (Math.abs(by) >= 1) main.scrollBy({ top: by, behavior: 'instant' });
    }
    const now = performance.now();
    if (main.querySelector('.site-loading')) settledSince = undefined;
    else settledSince ??= now;
    if (now - start > holdAtMost || (settledSince !== undefined && now - settledSince > settleFor))
      return stop();
    frame = requestAnimationFrame(step);
  };
  for (const event of interruptions) addEventListener(event, stop, true);
  step();
  return stop;
}
