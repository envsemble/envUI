'use client';

import { useRef, type RefObject } from 'react';
import { readScrollPositions, type ScrollPosition } from './dockLayout.js';

/**
 * A panel that moves or changes where it shows keeps its scroll positions, which the browser resets
 * to the start as it lays the boxes out afresh. They are read before an update that moves panels, as
 * when they reorder, or changes where they show: during render, like focus, before the update is
 * committed. The function returned puts them back; call it as the update is committed, before the
 * panels' content runs its own effects, so content that scrolls itself in the same update, such as
 * a chat showing a new message or going back to its start, keeps the position it chose.
 */
export function useScrollPreservation(row: RefObject<HTMLElement | null>, layout: string) {
  const previousLayout = useRef(layout);
  const scrollsBefore = useRef<ScrollPosition[]>([]);
  if (layout !== previousLayout.current && row.current)
    scrollsBefore.current = readScrollPositions(row.current);

  return function restoreScrollPositions() {
    if (previousLayout.current === layout) return;
    previousLayout.current = layout;
    const positions = scrollsBefore.current;
    scrollsBefore.current = [];
    for (const { element, top, left } of positions) {
      if (!element.isConnected) continue;
      if (element.scrollTop === 0 && top !== 0) element.scrollTop = top;
      if (element.scrollLeft === 0 && left !== 0) element.scrollLeft = left;
    }
  };
}
