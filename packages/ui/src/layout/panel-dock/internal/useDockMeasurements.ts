'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { remPixels } from '../../../internal/dom/lengths.js';
import type { PanelDockPanel } from '../panelDockTypes.js';
import { fillCandidates, isAtRowEnd, overflows, scrollToRowEnd } from './dockLayout.js';

export interface DockMeasurements {
  /** Pixels per rem. */
  rem: number;
  /** The block size open panels have in the dock, in pixels. */
  room: number;
}

/**
 * The dock measures itself: it reads whether its container query stacks it, below stackBelow, and
 * open panels fit its height, as the tabs float over their bottom edge. A rem or em threshold
 * follows the text size. It also keeps the row at its end while people leave it there.
 */
export function useDockMeasurements({
  root,
  row,
  probe,
  panels,
  stackBelow,
  overflow,
  refresh,
}: {
  root: RefObject<HTMLElement | null>;
  row: RefObject<HTMLElement | null>;
  probe: RefObject<HTMLElement | null>;
  panels: readonly PanelDockPanel[];
  stackBelow: string | number;
  overflow: 'scroll' | 'minimize';
  refresh: () => void;
}) {
  const [stackedOnceLayoutRead, setStacked] = useChangingState<boolean | undefined>(undefined);
  const stacked = stackedOnceLayoutRead ?? false;
  const [measurements, setMeasurements] = useState<DockMeasurements>();
  const [overflowing, setOverflowing] = useChangingState(false);
  const atRowEnd = useRef(true);
  const filled = fillCandidates(panels, stacked).length > 0;

  const stacksNow = useCallback(() => (probe.current?.offsetWidth ?? 0) > 0, [probe]);

  useLayoutEffect(() => {
    const element = root.current;
    const stackingProbe = probe.current;
    const rowElement = row.current;
    if (!element || !stackingProbe || !rowElement) return;
    const measure = () => {
      const hiddenWithNoBoxToMeasure = element.getClientRects().length === 0;
      if (hiddenWithNoBoxToMeasure) return;
      const view = element.ownerDocument.defaultView;
      setStacked(stacksNow());
      const rem = remPixels(element);
      const gutter = parseFloat(view?.getComputedStyle(rowElement).paddingBlockStart ?? '') || 0;
      const room = Math.max(0, element.clientHeight - gutter);
      setMeasurements((current) =>
        current?.rem === rem && current.room === room ? current : { rem, room },
      );
      setOverflowing(overflows(rowElement));
      if (atRowEnd.current) scrollToRowEnd(rowElement);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const refitsRowAsItResizes = overflow === 'minimize';
    let refreshOnceAFrame = 0;
    const observer = new ResizeObserver(() => {
      measure();
      if (!refitsRowAsItResizes || refreshOnceAFrame !== 0) return;
      refreshOnceAFrame = requestAnimationFrame(() => {
        refreshOnceAFrame = 0;
        refresh();
      });
    });
    observer.observe(element);
    observer.observe(stackingProbe);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(refreshOnceAFrame);
    };
  }, [
    root,
    row,
    probe,
    stackBelow,
    filled,
    stacked,
    overflow,
    refresh,
    stacksNow,
    setStacked,
    setOverflowing,
  ]);

  return {
    stacked,
    pending: stackedOnceLayoutRead === undefined,
    measurements,
    overflowing,
    setOverflowing,
    stacksNow,
    onRowScroll: (rowElement: HTMLElement) => {
      atRowEnd.current = isAtRowEnd(rowElement);
    },
  };
}

function useChangingState<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const last = useRef(initial);
  const change = useCallback((next: T) => {
    if (Object.is(last.current, next)) return;
    last.current = next;
    setValue(next);
  }, []);
  return [value, change] as const;
}
