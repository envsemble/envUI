'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import type { ResizeOptions } from './useResize.js';
import { useFormatters } from '../provider/useFormatters.js';
import { remPixels, roundToHundredth } from '../dom/lengths.js';
import type { ResizeDetails } from './resizeDetails.js';
import { useLatest } from '../useLatest.js';

const finiteOrUndefined = (value: number | undefined) =>
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

export interface ResizableWidthOptions {
  /** The width the application controls, in rem, or undefined where the component keeps it. */
  width: number | undefined;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: ((width: number, details: ResizeDetails) => void) | undefined;
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
 * default, within the least and the largest width. It returns the width and the props of the
 * ResizeHandle, the same handle and keys everywhere: 1 rem a step, 5 with Shift or Page Up and Page
 * Down, Home and End to the least and the largest width, and a double click back to the default.
 */
export function useResizableWidth({
  width: controlledWidth,
  defaultWidth: givenDefault,
  minWidth,
  maxWidth,
  onWidthChange,
  room,
  reverse,
  widthText,
}: ResizableWidthOptions) {
  const formatters = useFormatters();
  const min = Math.max(0, minWidth);
  const max = Math.max(min, maxWidth);
  const clamp = useCallback(
    (value: number) => roundToHundredth(Math.min(max, Math.max(min, value))),
    [min, max],
  );
  const [chosen, setChosen] = useState<number>();
  const controlled = finiteOrUndefined(controlledWidth);
  const defaultWidth = finiteOrUndefined(givenDefault) ?? min;
  const width = clamp(controlled ?? chosen ?? defaultWidth);

  const latest = useLatest({
    width,
    controlled,
    onWidthChange,
    defaultWidth,
    clamp,
    widthText,
  });
  const change = useCallback(
    (next: number, { committed }: ResizeDetails) => {
      const current = latest.current;
      const value = current.clamp(next);
      if (current.controlled === undefined) setChosen(value);
      if (committed || value !== current.width) current.onWidthChange?.(value, { committed });
    },
    [latest],
  );
  const reset = useCallback(() => {
    const current = latest.current;
    if (current.controlled === undefined) setChosen(undefined);
    current.onWidthChange?.(current.clamp(current.defaultWidth), { committed: true });
  }, [latest]);

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
          const disabled = event.currentTarget.getAttribute('aria-disabled') === 'true';
          if (!event.defaultPrevented && !disabled) reset();
        },
      }) satisfies ResizeOptions & {
        onDoubleClick: (event: MouseEvent<HTMLDivElement>) => void;
      },
    [reverse, width, min, max, room, change, reset, latest, formatters],
  );
  return { width, handleProps };
}
