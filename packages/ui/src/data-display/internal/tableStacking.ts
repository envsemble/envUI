'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { observeResize } from '../../internal/dom/observeResize.js';
import { useLatest } from '../../internal/react/useLatest.js';

export function useStackingAsTheContainerQueryLaidItOut(
  region: RefObject<HTMLElement | null>,
  table: RefObject<HTMLElement | null>,
  enabled: boolean,
  stackBelow: string | number,
) {
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const element = region.current;
    const grid = table.current;
    if (!enabled || !element || !grid) {
      setStacked(false);
      return;
    }
    const read = () => {
      const hiddenRegionLaysNothingOut = element.getClientRects().length === 0;
      if (hiddenRegionLaysNothingOut) return;
      setStacked(getComputedStyle(grid).getPropertyValue('--_table-stacked').trim() === '1');
    };
    read();
    return observeResize([element, grid], read);
  }, [region, table, enabled, stackBelow]);
  return enabled && stacked;
}

/**
 * Reports whether a layout stacks to its handler before paint, so an application can show the
 * stacked layout's own controls at once. Only a call to a handler moves the reported state on, so a
 * handler added later learns the current state, and a layout that leaves while stacked reports
 * that it no longer stacks.
 */
export function useStackedReport(
  stacked: boolean,
  onStackedChange: ((stacked: boolean) => void) | undefined,
) {
  const reported = useRef(false);
  const handler = useLatest(onStackedChange);
  useLayoutEffect(() => {
    if (!onStackedChange) {
      reported.current = false;
      return;
    }
    if (stacked === reported.current) return;
    reported.current = stacked;
    onStackedChange(stacked);
  }, [stacked, onStackedChange]);
  useLayoutEffect(
    () => () => {
      if (!reported.current) return;
      reported.current = false;
      handler.current?.(false);
    },
    [handler],
  );
}
