'use client';

import { useEffect, useLayoutEffect, type RefObject } from 'react';
import { tabElement } from './tabStrip.js';
import { isRightToLeft } from '../../internal/dom/direction.js';

/**
 * How a strip of document tabs scrolls: the active tab scrolls whole into view within the strip,
 * without scrolling the page, and a vertical wheel scrolls it sideways. Tabs past an edge are clipped
 * there.
 */
export function useTabStripScrolling(
  listRef: RefObject<HTMLElement | null>,
  value: string | null,
  items: readonly unknown[],
) {
  useLayoutEffect(() => {
    function revealWholeItem() {
      const strip = listRef.current;
      const tab = tabElement(strip, value)?.parentElement;
      if (!strip || !tab) return;
      const stripBox = strip.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      if (tabBox.left < stripBox.left) strip.scrollLeft -= stripBox.left - tabBox.left;
      else if (tabBox.right > stripBox.right) strip.scrollLeft += tabBox.right - stripBox.right;
    }
    revealWholeItem();
    let cancelled = false;
    const afterBaseUiScrollsIt = requestAnimationFrame(revealWholeItem);
    void document.fonts?.ready.then(() => {
      if (!cancelled) revealWholeItem();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(afterBaseUiScrollsIt);
    };
  }, [listRef, value, items]);

  useEffect(
    function scrollSidewaysOnAVerticalWheel() {
      const element = listRef.current;
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
    },
    [listRef],
  );
}
