'use client';

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useEnvUI } from '../provider/EnvUIContext.js';
import { remPixels, roundToHundredth } from '../dom/lengths.js';
import type { ResizeDetails } from './resizeDetails.js';
import { scrolledBy } from '../dom/scrolledBy.js';
import { flag } from '../flag.js';

export interface ResizeOptions {
  /**
   * The axis the handle moves along: inline, across a row of panes, such as a sidebar's edge, or
   * block, up and down, such as a docked panel's top edge.
   */
  axis: 'inline' | 'block';
  /** The size the handle controls, in `unit`. */
  value: number;
  /** The smallest size. */
  min: number;
  /** The largest size. */
  max: number;
  /**
   * The largest size the room allows, in `unit`, read from the handle as a drag starts or a key
   * moves it: where it is under `max`, the drag starts at it and goes no further.
   */
  room?: (handle: HTMLElement) => number;
  /** How far an arrow key moves it; 10 by default. */
  step?: number;
  /** How far Page Up and Page Down, and an arrow key with Shift, move it; ten steps by default. */
  largeStep?: number;
  /** The size's unit: px, % of `percentOf`, or rem, of the root's font size. */
  unit?: 'px' | '%' | 'rem';
  /**
   * The element a size in % is a share of, such as a column's table: the handle's parent element by
   * default.
   */
  percentOf?: (handle: HTMLElement) => HTMLElement | null;
  /**
   * Whether the size grows toward the start of the axis: a panel docked at the bottom grows up as
   * its top edge moves up, and a pane at the inline end grows as its start edge moves toward the
   * start. The text direction is applied on top, so the inline start is the right in RTL.
   */
  reverse?: boolean;
  /**
   * Receives each new size, clamped to min and max: while dragging with committed false, and once
   * more with committed true as the drag ends or a key moves it. A cancelled drag ends at the size
   * it began with.
   */
  onChange: (value: number, details: ResizeDetails) => void;
  /** The size as words, such as 240 pixels or Narrow, for assistive technology. */
  valueText?: (value: number) => string;
  /**
   * Leaves the size as it is and takes the handle out of the tab order; a drag in progress ends
   * without a change, as when the handle goes while it is dragged.
   */
  disabled?: boolean;
}

/** The props of a resize handle element, as useResize returns them. */
export interface ResizeHandleElementProps {
  role: 'separator';
  'aria-orientation': 'vertical' | 'horizontal';
  'aria-valuenow': number;
  'aria-valuemin': number;
  'aria-valuemax': number;
  'aria-valuetext'?: string;
  'aria-disabled'?: true;
  tabIndex: 0 | -1;
  'data-axis': 'inline' | 'block';
  'data-resizing'?: '';
  onPointerDown(event: ReactPointerEvent<HTMLElement>): void;
  onPointerMove(event: ReactPointerEvent<HTMLElement>): void;
  onPointerUp(event: ReactPointerEvent<HTMLElement>): void;
  onPointerCancel(event: ReactPointerEvent<HTMLElement>): void;
  onLostPointerCapture(event: ReactPointerEvent<HTMLElement>): void;
  onKeyDown(event: ReactKeyboardEvent<HTMLElement>): void;
  onFocus?(event: ReactFocusEvent<HTMLElement>): void;
}

interface Drag {
  pointerId: number;
  start: number;
  startValue: number;
  maxForThisDrag: number;
  signedUnitsPerPixel: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function unitsPerPixel(
  handle: HTMLElement,
  container: HTMLElement | null,
  inline: boolean,
  unit: NonNullable<ResizeOptions['unit']>,
) {
  let perLayoutPixel = 1;
  if (unit === 'rem') perLayoutPixel = 1 / remPixels(handle);
  else if (unit === '%') {
    const extent = container ? (inline ? container.clientWidth : container.clientHeight) : 0;
    perLayoutPixel = extent > 0 ? 100 / extent : 0;
  }
  if (!container) return perLayoutPixel;
  const box = container.getBoundingClientRect();
  const drawn = inline ? box.width : box.height;
  const laid = inline ? container.offsetWidth : container.offsetHeight;
  return drawn > 0 && laid > 0 ? (perLayoutPixel * laid) / drawn : perLayoutPixel;
}

/**
 * One implementation of a window splitter's handle (the APG window splitter pattern): a focusable
 * separator that the pointer drags, with pointer capture, and the keyboard moves with the arrow
 * keys, Page Up and Page Down, Home and End. Arrow keys and pointer movement follow the text
 * direction, the EnvUIProvider's or the handle's own.
 */
export function useResize({
  axis,
  value,
  min,
  max,
  room,
  step = 10,
  largeStep = step * 10,
  unit = 'px',
  percentOf = (handle) => handle.parentElement,
  reverse = false,
  onChange,
  valueText,
  disabled = false,
}: ResizeOptions): {
  handleProps: ResizeHandleElementProps;
  dragging: boolean;
  measureRoomTheLargestValueFollows: (handle: HTMLElement) => void;
} {
  const provided = useEnvUI().dir;
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);
  useEffect(
    function endDragWithoutNewSizeOnceDisabled() {
      if (!disabled || !drag.current) return;
      drag.current = null;
      setDragging(false);
    },
    [disabled],
  );

  const growthSign = (element: Element) => {
    const rtl = axis === 'inline' && (provided ?? getComputedStyle(element).direction) === 'rtl';
    return (rtl ? -1 : 1) * (reverse ? -1 : 1);
  };
  const change = (next: number, committed: boolean, upper = max) =>
    onChange(clamp(next, min, upper), { committed });
  const largestRoomAllows = (handle: HTMLElement) => {
    const allowed = room?.(handle);
    return allowed !== undefined && Number.isFinite(allowed) ? clamp(allowed, min, max) : max;
  };
  const [roomMaxWhenLastRead, setRoomMax] = useState<number>();
  const measure = (handle: HTMLElement) => {
    if (!room) return;
    const upper = largestRoomAllows(handle);
    setRoomMax((previous) => (previous === upper ? previous : upper));
  };

  const pointerOnScrolledContent = (event: ReactPointerEvent<HTMLElement>) =>
    axis === 'inline'
      ? event.clientX + scrolledBy(event.currentTarget, 'x')
      : event.clientY + scrolledBy(event.currentTarget, 'y');

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (disabled || event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const perPixel = unitsPerPixel(
      event.currentTarget,
      percentOf(event.currentTarget),
      axis === 'inline',
      unit,
    );
    const upper = largestRoomAllows(event.currentTarget);
    measure(event.currentTarget);
    drag.current = {
      pointerId: event.pointerId,
      start: pointerOnScrolledContent(event),
      startValue: Math.min(value, upper),
      maxForThisDrag: upper,
      signedUnitsPerPixel: perPixel * growthSign(event.currentTarget),
    };
    setDragging(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const releasedOutsideWindow = event.pointerType === 'mouse' && (event.buttons & 1) === 0;
    if (releasedOutsideWindow) end(event);
    else
      change(
        current.startValue +
          (pointerOnScrolledContent(event) - current.start) * current.signedUnitsPerPixel,
        false,
        current.maxForThisDrag,
      );
  };
  const end = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    const cancelled = event.type === 'pointercancel' || event.type === 'lostpointercapture';
    if (cancelled) change(current.startValue, true, current.maxForThisDrag);
    else
      change(
        current.startValue +
          (pointerOnScrolledContent(event) - current.start) * current.signedUnitsPerPixel,
        true,
        current.maxForThisDrag,
      );
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const amount = event.shiftKey ? largeStep : step;
    const direction = growthSign(event.currentTarget);
    const upper = largestRoomAllows(event.currentTarget);
    measure(event.currentTarget);
    const from = Math.min(value, upper);
    const forward = axis === 'inline' ? 'ArrowRight' : 'ArrowDown';
    const backward = axis === 'inline' ? 'ArrowLeft' : 'ArrowUp';
    let next: number;
    if (event.key === forward) next = from + amount * direction;
    else if (event.key === backward) next = from - amount * direction;
    else if (event.key === 'PageUp') next = from + largeStep;
    else if (event.key === 'PageDown') next = from - largeStep;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = upper;
    else return;
    event.preventDefault();
    change(next, true, upper);
  };

  const reported = unit === 'rem' ? roundToHundredth : Math.round;
  const upper = Math.min(max, roomMaxWhenLastRead ?? max);
  const shown = Math.min(value, upper);
  const splitsSideBySide = axis === 'inline';
  return {
    dragging,
    measureRoomTheLargestValueFollows: measure,
    handleProps: {
      role: 'separator',
      'aria-orientation': splitsSideBySide ? 'vertical' : 'horizontal',
      'aria-valuenow': reported(shown),
      'aria-valuemin': reported(min),
      'aria-valuemax': reported(upper),
      ...(valueText && { 'aria-valuetext': valueText(shown) }),
      ...(disabled && { 'aria-disabled': true as const }),
      tabIndex: disabled ? -1 : 0,
      'data-axis': axis,
      'data-resizing': flag(dragging),
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onLostPointerCapture: end,
      onKeyDown,
      ...(room && {
        onFocus: (event: ReactFocusEvent<HTMLElement>) => measure(event.currentTarget),
      }),
    },
  };
}
