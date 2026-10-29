import { startTransition, useEffect, useState } from 'react';

/**
 * How many of a long page's `total` parts show: the first at once, then one more after each paint,
 * as a transition. Its start shows sooner, and each part commits in a task of its own rather than
 * the whole page in one, so the page answers input meanwhile. An address that names a place on the
 * page, such as ?section=accessibility or #changelog, shows every part at once, so the place is
 * where the page scrolls it to.
 */
export function useRevealed(total: number) {
  const [revealed, setRevealed] = useState(() =>
    /[?&]section=/.test(location.search) || location.hash.length > 1 ? total : 1,
  );
  useEffect(() => {
    if (revealed >= total) return;
    let timeout = 0;
    // After the frame that paints the parts shown so far.
    const frame = requestAnimationFrame(() => {
      timeout = window.setTimeout(() => startTransition(() => setRevealed((count) => count + 1)));
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [revealed, total]);
  return Math.min(revealed, total);
}
