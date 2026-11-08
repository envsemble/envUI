'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { remPixels } from '../../../internal/lengths.js';
import type { PanelDockPanel } from '../Root.js';
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
  /** An element the dock's container query gives a width where it stacks. */
  probe: RefObject<HTMLElement | null>;
  panels: readonly PanelDockPanel[];
  stackBelow: string | number;
  overflow: 'scroll' | 'minimize';
  /** Renders the dock again. */
  refresh: () => void;
}) {
  // Whether the dock stacks, as its container query lays it out; undefined until the dock reads it,
  // as on the server and while hydrating, where CSS alone decides what shows.
  const [measuredStacked, setStacked] = useChangingState<boolean | undefined>(undefined);
  const stacked = measuredStacked ?? false;
  const [measurements, setMeasurements] = useState<DockMeasurements>();
  const [overflowing, setOverflowing] = useChangingState(false);
  const atRowEnd = useRef(true);
  const filled = fillCandidates(panels, stacked).length > 0;

  /** Whether the dock is narrower than stackBelow, as laid out now. */
  const stacksNow = useCallback(() => (probe.current?.offsetWidth ?? 0) > 0, [probe]);

  useLayoutEffect(() => {
    const element = root.current;
    const threshold = probe.current;
    const rowElement = row.current;
    if (!element || !threshold || !rowElement) return;
    const measure = () => {
      // A hidden dock, such as one in a hidden tab panel, has no box to measure; it keeps its
      // layout until it shows again.
      if (element.getClientRects().length === 0) return;
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
    // A dock that minimizes renders again as it resizes, once a frame however often the observer
    // reports, also where nothing it shows changed, so that its row's effect fits the panels: the
    // application's answer to a change asked there renders at once.
    let frameRequest = 0;
    const observer = new ResizeObserver(() => {
      measure();
      if (overflow !== 'minimize' || frameRequest !== 0) return;
      frameRequest = requestAnimationFrame(() => {
        frameRequest = 0;
        refresh();
      });
    });
    observer.observe(element);
    // The probe changes size as the query starts or stops stacking the dock, also where only the
    // text size changes.
    observer.observe(threshold);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRequest);
    };
    // Stacking changes the row's padding above open panels in front of a maximized one, and with it
    // their room, without resizing anything the observer watches.
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
    /** Whether the dock has yet to read its layout. */
    pending: measuredStacked === undefined,
    measurements,
    overflowing,
    setOverflowing,
    stacksNow,
    /** Follows the row's scrolling, to keep it at its end while people leave it there. */
    onRowScroll: (rowElement: HTMLElement) => {
      atRowEnd.current = isAtRowEnd(rowElement);
    },
  };
}

/**
 * A state whose setter renders only for a value other than the one it set last: setting a state to
 * the value it has can still render a component again, as measurements on every resize would.
 */
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
