'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import type { ResizeHandleProps } from './ResizeHandle.js';
import { useFormatters } from '../provider/useFormatters.js';
import { remPixels, roundToHundredth } from '../dom/lengths.js';
import type { ResizeDetails } from './resizeDetails.js';
import { useLatest } from '../useLatest.js';

/** A number that is finite, else undefined. */
const finite = (value: number | undefined) =>
  value !== undefined && Number.isFinite(value) ? value : undefined;

/** An element's width in rem, to a hundredth, as widths are kept. */
export const widthInRem = (element: Element) =>
  roundToHundredth(element.clientWidth / remPixels(element));

/**
 * The width in rem of the nearest size container around an element, the one its cqi units measure,
 * such as a Scaffold's, else the window's.
 */
export function containerWidth(element: Element) {
  for (let node = element.parentElement; node; node = node.parentElement)
    if (getComputedStyle(node).containerType !== 'normal') return widthInRem(node);
  return widthInRem(element.ownerDocument.documentElement);
}

interface Options {
  /** The width the application controls, in rem, or undefined where the component keeps it. */
  width: number | undefined;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: ((width: number, details: ResizeDetails) => void) | undefined;
  /**
   * The width to start from, in rem, until people choose one or a reset forgets it, such as one the
   * server read from where the component keeps it; the default otherwise.
   */
  keptWidth?: number;
  /**
   * Keeps the width people choose, as a change is complete, where the component keeps it; receives
   * undefined as a double click forgets it.
   */
  keep?: (width: number | undefined) => void;
  /** The largest width the room around it allows, in rem, read as a drag starts or a key moves. */
  room: (handle: HTMLElement) => number;
  /** Whether the width grows as the handle moves toward the inline start: a region at the end. */
  reverse: boolean;
  /** The width as words, from the width in the locale's digits, such as 17.5 rem. */
  widthText: (width: string) => string;
}

/**
 * The width of a region that a handle on its edge resizes, a pane's, the NavigationDrawer's or a
 * side Sheet's, in rem: the application's where it controls it, else the one people chose, else the
 * kept one, else the default, within the least and the largest width. It returns the width, the
 * props of the ResizeHandle, the same handle and keys everywhere: 1 rem a step, 5 with Shift or Page
 * Up and Page Down, Home and End to the least and the largest width, and a double click back to the
 * default; and `restore`, which takes a width read back from where it was kept as the chosen one.
 */
export function useResizableWidth({
  width: controlledWidth,
  defaultWidth: givenDefault,
  minWidth,
  maxWidth,
  onWidthChange,
  keptWidth,
  keep,
  room,
  reverse,
  widthText,
}: Options) {
  const formatters = useFormatters();
  const min = Math.max(0, minWidth);
  const max = Math.max(min, maxWidth);
  const clamp = useCallback(
    (value: number) => roundToHundredth(Math.min(max, Math.max(min, value))),
    [min, max],
  );
  // The width people chose, or 'default' once a double click forgot it, which a kept width no
  // longer overrides.
  const [chosen, setChosen] = useState<number | 'default'>();
  // A width that is no number, such as NaN from a stored value that didn't parse, is ignored: the
  // component keeps the width as if it weren't given, and a default that is none is the least.
  const controlled = finite(controlledWidth);
  const defaultWidth = finite(givenDefault) ?? min;
  const width = clamp(
    controlled ??
      (chosen === 'default' ? defaultWidth : (chosen ?? finite(keptWidth) ?? defaultWidth)),
  );

  const latest = useLatest({
    width,
    controlled,
    onWidthChange,
    keep,
    defaultWidth,
    clamp,
    widthText,
  });
  const change = useCallback(
    (next: number, { committed }: ResizeDetails) => {
      const current = latest.current;
      const value = current.clamp(next);
      if (current.controlled === undefined) {
        setChosen(value);
        if (committed) current.keep?.(value);
      }
      if (committed || value !== current.width) current.onWidthChange?.(value, { committed });
    },
    [latest],
  );
  const reset = useCallback(() => {
    const current = latest.current;
    if (current.controlled === undefined) {
      setChosen('default');
      current.keep?.(undefined);
    }
    current.onWidthChange?.(current.clamp(current.defaultWidth), { committed: true });
  }, [latest]);

  // The same props while the width and its bounds stay, so a context that passes them on does too.
  const handleProps = useMemo(
    () =>
      ({
        axis: 'inline',
        unit: 'rem',
        reverse,
        value: width,
        min,
        max,
        room,
        step: 1,
        largeStep: 5,
        onChange: change,
        valueText: (value: number) =>
          latest.current.widthText(
            formatters.number({ maximumFractionDigits: 1 }).format(roundToHundredth(value)),
          ),
        onDoubleClick: (event: MouseEvent<HTMLDivElement>) => {
          if (!event.defaultPrevented) reset();
        },
      }) satisfies Omit<ResizeHandleProps, 'label'>,
    [reverse, width, min, max, room, change, reset, latest, formatters],
  );
  /** Takes a width read back from where it was kept as the one people chose. */
  const restore = useCallback((kept: number) => setChosen(kept), []);
  return { width, handleProps, restore };
}
