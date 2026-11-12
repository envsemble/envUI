'use client';

import { useEffect, type RefObject } from 'react';
import { isRightToLeft } from './direction.js';

/**
 * A vertical wheel scrolls an overflowing strip of tabs sideways. `shown` says whether the strip is
 * rendered, so the listener follows it as it comes and goes.
 */
export function useStripWheel(strip: RefObject<HTMLElement | null>, shown: boolean) {
  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0 || event.deltaY === 0 || event.ctrlKey) return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 0) return;
      const direction = isRightToLeft(element) ? -1 : 1;
      const position = element.scrollLeft * direction;
      const next = Math.min(max, Math.max(0, position + event.deltaY));
      if (next === position) return;
      event.preventDefault();
      element.scrollLeft = next * direction;
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [strip, shown]);
}
