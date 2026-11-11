'use client';

import { useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { isRightToLeft } from '../../internal/dom/direction.js';
import { useLatest } from '../../internal/useLatest.js';
import { moveValue, tabElement } from './tabStrip.js';

/** A pointer that moves this many pixels with its button down drags the tab rather than pressing it. */
const dragThreshold = 4;
/** Within this many pixels of the strip's edge, a drag scrolls the strip. */
const edgeZone = 24;
/** How far a drag near an edge scrolls the strip on each move, in pixels. */
const edgeScroll = 8;

/** A tab being dragged: its value, the gap it would drop into, and where the pointer is. */
export interface TabDrag {
  id: string;
  /** The gap the tab would drop into: 0 before the first tab, the count of tabs after the last. */
  gap: number;
  x: number;
  y: number;
}

/**
 * A tab dragged with a mouse or pen follows the pointer as a floating copy, and a line in the strip
 * marks where it will land; the tabs take their new order when it is let go, and Escape cancels.
 * Touch scrolls the strip instead, and its long press opens the context menu with Move left and
 * Move right.
 */
export function useTabDrag({
  list,
  items,
  onReorder,
}: {
  list: RefObject<HTMLElement | null>;
  items: readonly { value: string }[];
  onReorder: ((ids: string[]) => void) | undefined;
}) {
  const [drag, setDrag] = useState<TabDrag | null>(null);
  const latest = useLatest({ items, onReorder });

  function onItemPointerDown(event: ReactPointerEvent<HTMLElement>, id: string) {
    const strip = list.current;
    if (!onReorder || !strip || event.button !== 0 || event.pointerType === 'touch') return;
    if ((event.target as Element).closest('.env-document-tabs-close')) return;
    const startX = event.clientX;
    const startIndex = items.findIndex((item) => item.value === id);
    let moved = false;
    let gap = startIndex;
    const view = strip.ownerDocument.defaultView ?? window;
    const onMove = (move: PointerEvent) => {
      if (!moved) {
        if (Math.abs(move.clientX - startX) < dragThreshold) return;
        moved = true;
      }
      move.preventDefault();
      // Near an edge the strip scrolls, so a tab reaches places out of view.
      const box = strip.getBoundingClientRect();
      if (move.clientX < box.left + edgeZone) strip.scrollLeft -= edgeScroll;
      else if (move.clientX > box.right - edgeZone) strip.scrollLeft += edgeScroll;
      gap = nearestGap(strip, latest.current.items, move.clientX) ?? gap;
      setDrag({ id, gap, x: move.clientX, y: move.clientY });
    };
    const stop = () => {
      view.removeEventListener('pointermove', onMove);
      view.removeEventListener('pointerup', onUp);
      view.removeEventListener('pointercancel', cancel);
      view.removeEventListener('keydown', onKeyDown, true);
      setDrag(null);
    };
    const cancel = () => {
      moved = false;
      stop();
    };
    const onKeyDown = (key: globalThis.KeyboardEvent) => {
      if (key.key !== 'Escape') return;
      key.preventDefault();
      key.stopPropagation();
      cancel();
    };
    const onUp = () => {
      const dropped = moved;
      stop();
      if (!dropped) return;
      // The click that ends a drag does nothing more. It arrives with the release, if at all, so
      // the guard goes after it, and a release with no click leaves the next click alone.
      const swallow = (click: MouseEvent) => click.stopPropagation();
      view.addEventListener('click', swallow, { capture: true, once: true });
      view.setTimeout(() => view.removeEventListener('click', swallow, { capture: true }), 0);
      const { items: current, onReorder: reorder } = latest.current;
      // A gap beside the tab itself leaves it where it is.
      const index = gap > startIndex ? gap - 1 : gap;
      if (index === startIndex) return;
      reorder?.(
        moveValue(
          current.map((item) => item.value),
          id,
          index,
        ),
      );
    };
    view.addEventListener('pointermove', onMove);
    view.addEventListener('pointerup', onUp);
    view.addEventListener('pointercancel', cancel);
    view.addEventListener('keydown', onKeyDown, true);
  }

  return { drag, onItemPointerDown };
}

/**
 * The gap nearest the pointer: before the tab under it in that tab's starting half, after it in the
 * other, also beside the dragged tab itself; past the ends, the nearest tab counts. Undefined while
 * no tab is in the strip.
 */
function nearestGap(strip: HTMLElement, items: readonly { value: string }[], x: number) {
  const rtl = isRightToLeft(strip);
  let distance = Infinity;
  let gap: number | undefined;
  items.forEach((item, position) => {
    const tab = tabElement(strip, item.value)?.parentElement;
    if (!tab) return;
    const itemBox = tab.getBoundingClientRect();
    const away = x < itemBox.left ? itemBox.left - x : Math.max(0, x - itemBox.right);
    if (away >= distance) return;
    distance = away;
    const middle = itemBox.left + itemBox.width / 2;
    const startHalf = rtl ? x > middle : x < middle;
    gap = startHalf ? position : position + 1;
  });
  return gap;
}
