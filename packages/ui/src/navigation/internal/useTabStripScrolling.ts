'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { remPixels } from '../../internal/dom/lengths.js';
import { scrollBeyond, tabElement } from './tabStrip.js';
import { useStripWheel } from '../../internal/useStripWheel.js';

/**
 * How a strip of document tabs scrolls: the active tab scrolls into view within the strip, without
 * scrolling the page; a vertical wheel scrolls it sideways; and tabs that run past an edge fade out
 * toward it, so the strip shows it scrolls. Returns the edges that fade.
 */
export function useTabStripScrolling(
  listRef: RefObject<HTMLElement | null>,
  value: string | null,
  items: readonly unknown[],
) {
  useLayoutEffect(() => {
    function reveal() {
      const strip = listRef.current;
      const tab = tabElement(strip, value)?.parentElement;
      if (!strip || !tab) return;
      // The tab clears the fade at the edge it comes in from, so none of it is faded. Only an edge
      // with more to scroll past it has a fade: at the strip's ends there is no room to leave.
      const fade = parseFloat(getComputedStyle(strip).getPropertyValue('--env-document-tabs-fade'));
      const room = Number.isFinite(fade) ? fade * remPixels(strip) : 0;
      const beyond = scrollBeyond(strip);
      const stripBox = strip.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      const roomLeft = beyond.left ? room : 0;
      const roomRight = beyond.right ? room : 0;
      if (tabBox.left < stripBox.left + roomLeft)
        strip.scrollLeft -= stripBox.left + roomLeft - tabBox.left;
      else if (tabBox.right > stripBox.right - roomRight)
        strip.scrollLeft += tabBox.right - (stripBox.right - roomRight);
    }
    reveal();
    // Base UI also scrolls the active tab into view, and the labels may still widen as the font
    // loads: the whole item, close button included, is revealed again once both have settled.
    let cancelled = false;
    const frame = requestAnimationFrame(reveal);
    void document.fonts?.ready.then(() => {
      if (!cancelled) reveal();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [listRef, value, items]);

  useStripWheel(listRef, true);

  const [fades, setFades] = useState({ left: false, right: false });
  useEffect(() => {
    const strip = listRef.current;
    if (!strip) return;
    const update = () => {
      const { left, right } = scrollBeyond(strip);
      setFades((current) =>
        current.left === left && current.right === right ? current : { left, right },
      );
    };
    update();
    strip.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    for (const child of strip.children) observer.observe(child);
    return () => {
      strip.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [listRef, items]);
  return fades;
}
