'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { RowDensity } from '../../../foundations/Theme.js';
import { remPixels } from '../../../internal/dom/lengths.js';
import '../../../styles/Base.css';
import '../../../styles/Tree.css';

const overscanRows = 8;
const rowsBeforeViewportIsMeasured = 24;
const comfortableRowRem: Record<RowDensity, number> = { xs: 1.5, sm: 1.75, md: 2.25, lg: 2.75 };
const pixelsPerRemOnServer = 16;

export interface TreeViewportOptions {
  containerRef: RefObject<HTMLElement | null>;
  density: RowDensity;
  /** How many rows the tree has. */
  count: number;
  activeIndex: number;
  /** The selected row's index, undefined while it is not among the rows. */
  selectedIndex: number | undefined;
  selectedId: string | null;
}

export interface TreeViewport {
  rowHeight: number;
  /** How many rows Page Up and Page Down move. */
  pageRows: number;
  /** The indexes of the rows in the document, in order. */
  indexes: number[];
  /** Whether the row at an index is in view, or within the overscan. */
  inView: (index: number) => boolean;
  scrollToIndex: (index: number, block?: 'nearest' | 'center') => void;
  /** Follows the viewport's scrolling. */
  onScroll: (scrollTop: number) => void;
}

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
}: TreeViewportOptions): TreeViewport {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(comfortableRowRem[density] * pixelsPerRemOnServer);
  const revealedSelection = useRef<string | null>(null);

  const hasItems = count > 0;
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => {
      setViewportHeight(element.clientHeight);
      const row = element.querySelector<HTMLElement>('.env-tree-item');
      const layoutHeightIgnoringTransforms = row ? parseFloat(getComputedStyle(row).blockSize) : 0;
      if (layoutHeightIgnoringTransforms) setRowHeight(layoutHeightIgnoringTransforms);
      else setRowHeight(comfortableRowRem[density] * remPixels());
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

  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscanRows);
  const shownHeight = viewportHeight || rowsBeforeViewportIsMeasured * rowHeight;
  const last = Math.min(count - 1, Math.ceil((scrollTop + shownHeight) / rowHeight) + overscanRows);
  const inView = (index: number) => index >= first && index <= last;
  const indexes: number[] = [];
  for (let index = first; index <= last; index += 1) indexes.push(index);
  if (activeIndex !== -1 && !inView(activeIndex)) {
    indexes.push(activeIndex);
    indexes.sort((a, b) => a - b);
  }

  return {
    rowHeight,
    pageRows: Math.max(1, Math.floor(viewportHeight / rowHeight) - 1),
    indexes,
    inView,
    scrollToIndex,
    onScroll: setScrollTop,
  };
}
