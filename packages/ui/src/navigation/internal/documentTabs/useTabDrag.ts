'use client';

import { useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { isRightToLeft } from '../../../internal/dom/direction.js';
import { dragThreshold } from '../../../internal/dom/lengths.js';
import { useLatest } from '../../../internal/useLatest.js';
import { moveValue, tabElement } from './tabStrip.js';

const edgeScrollZonePx = 24;
const edgeScrollStepPx = 8;

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
 * Pressing a tab doesn't focus it, so a drag never selects it: a press let go without moving focuses
 * the tab, which selects it, as a click does.
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
    const tab = tabElement(strip, id);
    if (tab && !tab.contains(strip.ownerDocument.activeElement)) event.preventDefault();
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
      const box = strip.getBoundingClientRect();
      if (move.clientX < box.left + edgeScrollZonePx) strip.scrollLeft -= edgeScrollStepPx;
      else if (move.clientX > box.right - edgeScrollZonePx) strip.scrollLeft += edgeScrollStepPx;
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
      if (!dropped) {
        tab?.focus({ focusVisible: false });
        return;
      }
      const swallowClickThatEndsDrag = (click: MouseEvent) => click.stopPropagation();
      view.addEventListener('click', swallowClickThatEndsDrag, { capture: true, once: true });
      view.setTimeout(
        () => view.removeEventListener('click', swallowClickThatEndsDrag, { capture: true }),
        0,
      );
      const { items: current, onReorder: reorder } = latest.current;
      const index = gap > startIndex ? gap - 1 : gap;
      const droppedBesideItself = index === startIndex;
      if (droppedBesideItself) return;
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
