'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { RowDensity } from '../../foundations/Theme.js';
import { remPixels } from '../../internal/lengths.js';

/** Rows outside the viewport kept rendered above and below it. */
const overscan = 8;
/**
 * The rows a tree renders before it has measured its viewport, such as in the server's markup: as
 * many as a tall pane shows, so the first paint is already full and measuring only adds rows.
 */
const unmeasuredRows = 24;
/** Each density's row height in rem in the comfortable scale, until a row can be measured. */
const rowRem: Record<RowDensity, number> = { xs: 1.5, sm: 1.75, md: 2.25, lg: 2.75 };
/** Pixels per rem before the tree can read the root's font size, such as on the server. */
const serverRem = 16;

/**
 * A virtualized tree's viewport: the row height, read from a row as it follows the density, the
 * scale, enlarged text and coarse pointers; the viewport's height and scroll position; and the rows
 * in view, plus overscan and the active row, which alone are in the document. The selection scrolls
 * into view as it changes, once its row is among the items and the tree has a size, for example
 * while a collapsed sidebar hides it.
 */
export function useTreeViewport({
  containerRef,
  density,
  count,
  activeIndex,
  selectedIndex,
  selectedId,
}: {
  containerRef: RefObject<HTMLElement | null>;
  density: RowDensity;
  /** How many rows the tree has. */
  count: number;
  activeIndex: number;
  /** The selected row's index, undefined while it is not among the rows. */
  selectedIndex: number | undefined;
  selectedId: string | null;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(rowRem[density] * serverRem);
  // The last selection scrolled into view; a new selection is revealed once its row is visible.
  const revealedSelection = useRef<string | null>(null);

  const hasItems = count > 0;
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => {
      setViewportHeight(element.clientHeight);
      const row = element.querySelector<HTMLElement>('.env-tree-item');
      // The layout height, exact and unaffected by transforms such as a dialog scaling in, which
      // getBoundingClientRect would include. Rows are border-box with a fixed block size.
      const height = row ? parseFloat(getComputedStyle(row).blockSize) : 0;
      if (height) setRowHeight(height);
      else setRowHeight(rowRem[density] * remPixels());
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, density, hasItems]);

  const scrollToIndex = useCallback(
    (index: number, block: 'nearest' | 'center' = 'nearest') => {
      const element = containerRef.current;
      if (!element || index < 0) return;
      const top = index * rowHeight;
      const bottom = top + rowHeight;
      const height = element.clientHeight;
      if (block === 'center' && (top < element.scrollTop || bottom > element.scrollTop + height)) {
        element.scrollTop = Math.max(0, top - (height - rowHeight) / 2);
      } else if (top < element.scrollTop) element.scrollTop = top;
      else if (bottom > element.scrollTop + height) element.scrollTop = bottom - height;
      setScrollTop(element.scrollTop);
    },
    [containerRef, rowHeight],
  );

  useLayoutEffect(() => {
    if (selectedId === null || selectedId === revealedSelection.current || viewportHeight === 0)
      return;
    if (selectedIndex === undefined) return;
    revealedSelection.current = selectedId;
    scrollToIndex(selectedIndex, 'center');
  }, [selectedId, selectedIndex, scrollToIndex, viewportHeight]);

  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const shownHeight = viewportHeight || unmeasuredRows * rowHeight;
  const last = Math.min(count - 1, Math.ceil((scrollTop + shownHeight) / rowHeight) + overscan);
  const inView = (index: number) => index >= first && index <= last;
  const indexes: number[] = [];
  for (let index = first; index <= last; index += 1) indexes.push(index);
  if (activeIndex !== -1 && !inView(activeIndex)) {
    indexes.push(activeIndex);
    indexes.sort((a, b) => a - b);
  }

  return {
    rowHeight,
    /** How many rows Page Up and Page Down move. */
    pageRows: Math.max(1, Math.floor(viewportHeight / rowHeight) - 1),
    /** The indexes of the rows in the document, in order. */
    indexes,
    /** Whether the row at an index is in view, or within the overscan. */
    inView,
    scrollToIndex,
    /** Follows the viewport's scrolling. */
    onScroll: setScrollTop,
  };
}
