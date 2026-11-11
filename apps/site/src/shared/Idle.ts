/*
 * Work the site does when the page has nothing else to do, such as rendering the tiles ahead of
 * the view (figures/useNear.ts) or sampling a figure far from the view (motion/WidthSweep.tsx), and
 * the box such work watches the view in.
 */

/** What an idle moment has left: its time to spend, in ms. */
export interface IdleTime {
  timeRemaining: () => number;
}

/** How long a moment counts as idle where the browser can't tell (Safari), in ms. */
const assumedIdle = 12;

/**
 * Runs `step` in the page's next idle moment, or as a task once a second has passed without one,
 * and passes it the time that moment has left. Returns the cancel.
 */
export function onIdle(step: (time: IdleTime) => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(step, { timeout: 1000 });
    return () => cancelIdleCallback(handle);
  }
  const timer = window.setTimeout(() => {
    const start = performance.now();
    step({ timeRemaining: () => Math.max(0, start + assumedIdle - performance.now()) });
  }, 50);
  return () => window.clearTimeout(timer);
}

/**
 * The box an element scrolls in, such as the scaffold's body the page scrolls inside, or none where
 * it scrolls with the document.
 */
export function scrollerOf(element: Element) {
  for (let node = element.parentElement; node; node = node.parentElement)
    if (/auto|scroll|overlay/.test(getComputedStyle(node).overflowY)) return node;
  return null;
}
