import { useEffect, useState } from 'react';
import { restoringScroll } from '../routes/ScrollRestoration';
import { useHydrated } from '../shared/useHydrated';

const interruptions = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

export function useRevealed(total: number) {
  const hydrated = useHydrated();
  const [revealed, setRevealed] = useState(() => {
    const addressNamesAPlace = () =>
      /[?&]section=/.test(location.search) || location.hash.length > 1;
    return !hydrated || addressNamesAPlace() || restoringScroll() ? total : 1;
  });
  useEffect(() => {
    if (revealed >= total) return;
    let timeout = 0;
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
    const revealAll = () => setRevealed(total);
    for (const event of interruptions)
      addEventListener(event, revealAll, { capture: true, passive: true });
    return () => {
      for (const event of interruptions) removeEventListener(event, revealAll, { capture: true });
    };
  }, [done, total]);
  return Math.min(revealed, total);
}
