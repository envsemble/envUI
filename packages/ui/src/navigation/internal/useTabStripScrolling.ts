'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { remPixels } from '../../internal/dom/lengths.js';
import { scrollBeyond, tabElement } from './tabStrip.js';
import { useStripWheel } from '../../internal/dom/useStripWheel.js';

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
    function revealWholeItemClearOfFade() {
      const strip = listRef.current;
      const tab = tabElement(strip, value)?.parentElement;
      if (!strip || !tab) return;
      const fade = parseFloat(getComputedStyle(strip).getPropertyValue('--_document-tabs-fade'));
      const fadeWidth = Number.isFinite(fade) ? fade * remPixels(strip) : 0;
      const beyond = scrollBeyond(strip);
      const stripBox = strip.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      const roomLeft = beyond.left ? fadeWidth : 0;
      const roomRight = beyond.right ? fadeWidth : 0;
      if (tabBox.left < stripBox.left + roomLeft)
        strip.scrollLeft -= stripBox.left + roomLeft - tabBox.left;
      else if (tabBox.right > stripBox.right - roomRight)
        strip.scrollLeft += tabBox.right - (stripBox.right - roomRight);
    }
    revealWholeItemClearOfFade();
    let cancelled = false;
    const afterBaseUiScrollsIt = requestAnimationFrame(revealWholeItemClearOfFade);
    void document.fonts?.ready.then(() => {
      if (!cancelled) revealWholeItemClearOfFade();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(afterBaseUiScrollsIt);
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
