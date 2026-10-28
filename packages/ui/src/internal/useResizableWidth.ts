'use client';

import { useCallback, useRef, useState, type MouseEvent } from 'react';
import type { ResizeHandleProps } from './ResizeHandle.js';
import { useFormatters } from './useFormatters.js';
import { remPixels, roundToHundredth } from './lengths.js';

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
  onWidthChange: ((width: number, details: { committed: boolean }) => void) | undefined;
  /** The largest width the room around it allows, in rem, read as a drag starts or a key moves. */
  room: (handle: HTMLElement) => number;
  /** Whether the width grows as the handle moves toward the inline start: a region at the end. */
  reverse: boolean;
  /** The width as words, from the width in the locale's digits, such as 17.5 rem. */
  widthText: (width: string) => string;
}

/**
 * The width of a region that a handle on its inner edge resizes, the Drawer's or a side Sheet's,
 * in rem: the application's where it controls it, else the one people chose, else the default,
 * within the least and the largest width. It returns the width and the props of the ResizeHandle,
 * the same handle and keys as Panes.Divider: 1 rem a step, 5 with Shift or Page Up and Page Down,
 * Home and End to the least and the largest width, and a double click back to the default.
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
}: Options) {
  const formatters = useFormatters();
  const min = Math.max(0, minWidth);
  const max = Math.max(min, maxWidth);
  const clamp = useCallback(
    (value: number) => roundToHundredth(Math.min(max, Math.max(min, value))),
    [min, max],
  );
  const [chosen, setChosen] = useState<number>();
  // A width that is no number, such as NaN from a stored value that didn't parse, is ignored: the
  // component keeps the width as if it weren't given, and a default that is none is the least.
  const controlled = finite(controlledWidth);
  const defaultWidth = finite(givenDefault) ?? min;
  const width = clamp(controlled ?? chosen ?? defaultWidth);

  const latest = useRef({ width, controlled, onWidthChange, defaultWidth, clamp });
  latest.current = { width, controlled, onWidthChange, defaultWidth, clamp };
  const change = useCallback((next: number, committed: boolean) => {
    const current = latest.current;
    const value = current.clamp(next);
    if (current.controlled === undefined) setChosen(value);
    if (committed || value !== current.width) current.onWidthChange?.(value, { committed });
  }, []);
  const reset = useCallback(() => {
    const current = latest.current;
    if (current.controlled === undefined) setChosen(undefined);
    current.onWidthChange?.(current.clamp(current.defaultWidth), { committed: true });
  }, []);

  const handleProps = {
    axis: 'inline',
    unit: 'rem',
    reverse,
    value: width,
    min,
    max,
    room,
    step: 1,
    largeStep: 5,
    onChange: (value: number, { committed }: { committed: boolean }) => change(value, committed),
    valueText: (value: number) =>
      widthText(formatters.number({ maximumFractionDigits: 1 }).format(roundToHundredth(value))),
    onDoubleClick: (event: MouseEvent<HTMLDivElement>) => {
      if (!event.defaultPrevented) reset();
    },
  } satisfies Omit<ResizeHandleProps, 'label'>;
  return { width, handleProps };
}
