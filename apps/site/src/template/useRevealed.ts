import { useEffect, useState } from 'react';
import { restoringScroll } from '../navigation/ScrollRestoration';

/** What the reader does that shows the rest at once: scrolling, pressing or typing. */
const interruptions = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

/**
 * How many of a long page's `total` parts show: the first at once, then one more after each paint.
 * Its start shows sooner, and each part renders in a task of its own rather than the whole page in
 * one, so the page answers input meanwhile. Not as a transition, which a figure playing its motion
 * would keep interrupting. An address that names a place on the
 * page, such as ?section=accessibility or #changelog, and a step back or forward to where the
 * reader was (ScrollRestoration.ts) show every part at once, so the place is there to scroll to.
 * So does the reader scrolling, pressing or typing before the last has shown, such as to follow a
 * link of the page's contents: the parts above where they go are then whole before they get there,
 * and don't move it as they arrive.
 */
export function useRevealed(total: number) {
  const [revealed, setRevealed] = useState(() =>
    /[?&]section=/.test(location.search) || location.hash.length > 1 || restoringScroll()
      ? total
      : 1,
  );
  useEffect(() => {
    if (revealed >= total) return;
    let timeout = 0;
    // After the frame that paints the parts shown so far.
    const frame = requestAnimationFrame(() => {
      timeout = window.setTimeout(() => setRevealed((count) => count + 1));
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [revealed, total]);
  const done = revealed >= total;
  useEffect(() => {
    if (done) return;
    const all = () => setRevealed(total);
    for (const event of interruptions)
      addEventListener(event, all, { capture: true, passive: true });
    return () => {
      for (const event of interruptions) removeEventListener(event, all, { capture: true });
    };
  }, [done, total]);
  return Math.min(revealed, total);
}
