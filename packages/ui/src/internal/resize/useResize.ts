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
  /** The largest size for this drag: max, or less where the room allows less. */
  max: number;
  /** Size units per pixel of pointer movement, with the axis's and the direction's sign. */
  scale: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Size units per pixel of pointer movement along the axis, read as a drag starts: a rem follows the
 * root's font size and a percent the extent of the element it is a share of. Pointer movement is in
 * screen pixels, and a scaled ancestor, as in a zoomed preview, draws the layout smaller or larger
 * than it is.
 */
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
  /** Reads the room around the handle again, which the largest value it reports follows. */
  measure: (handle: HTMLElement) => void;
} {
  const provided = useEnvUI().dir;
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);
  // A handle disabled or taken away while dragged ends the drag there, without a new size.
  useEffect(() => {
    if (!disabled || !drag.current) return;
    drag.current = null;
    setDragging(false);
  }, [disabled]);

  /** +1 where the size grows toward the end of the axis on screen, -1 where toward its start. */
  const sign = (element: Element) => {
    const rtl = axis === 'inline' && (provided ?? getComputedStyle(element).direction) === 'rtl';
    return (rtl ? -1 : 1) * (reverse ? -1 : 1);
  };
  const change = (next: number, committed: boolean, upper = max) =>
    onChange(clamp(next, min, upper), { committed });
  /** The largest size the room allows now, never under min nor over max. */
  const upperAt = (handle: HTMLElement) => {
    const allowed = room?.(handle);
    return allowed !== undefined && Number.isFinite(allowed) ? clamp(allowed, min, max) : max;
  };
  // The largest size the room allowed when last read, which the handle reports as its largest
  // value: a size beyond it shows at it.
  const [roomMax, setRoomMax] = useState<number>();
  const measure = (handle: HTMLElement) => {
    if (!room) return;
    const upper = upperAt(handle);
    setRoomMax((previous) => (previous === upper ? previous : upper));
  };

  // Where the pointer is on the content, so a box that scrolls around the handle, the page among
  // them, moves the drag as the pointer's own move would, never as far again.
  const position = (event: ReactPointerEvent<HTMLElement>) =>
    axis === 'inline'
      ? event.clientX + scrolledBy(event.currentTarget, 'x')
      : event.clientY + scrolledBy(event.currentTarget, 'y');

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (disabled || event.button !== 0 || !event.isPrimary) return;
    // Dragging selects no text and leaves focus where it is.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const perPixel = unitsPerPixel(
      event.currentTarget,
      percentOf(event.currentTarget),
      axis === 'inline',
      unit,
    );
    const upper = upperAt(event.currentTarget);
    measure(event.currentTarget);
    drag.current = {
      pointerId: event.pointerId,
      start: position(event),
      // A size beyond the room shows at the room's size, so the drag starts from there.
      startValue: Math.min(value, upper),
      max: upper,
      scale: perPixel * sign(event.currentTarget),
    };
    setDragging(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    // A button released outside the window can arrive as a move without it.
    if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) end(event);
    else
      change(
        current.startValue + (position(event) - current.start) * current.scale,
        false,
        current.max,
      );
  };
  const end = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    // A cancelled drag, such as one the browser took over for scrolling, or one whose pointer the
    // handle lost, returns to where it began.
    if (event.type === 'pointercancel' || event.type === 'lostpointercapture')
      change(current.startValue, true, current.max);
    else
      change(
        current.startValue + (position(event) - current.start) * current.scale,
        true,
        current.max,
      );
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const amount = event.shiftKey ? largeStep : step;
    const direction = sign(event.currentTarget);
    const upper = upperAt(event.currentTarget);
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

  // The values as the handle reports them: a size in rem keeps its fraction, as its text says it,
  // and the largest is what the room allows, with the size no larger.
  const reported = unit === 'rem' ? roundToHundredth : Math.round;
  const upper = Math.min(max, roomMax ?? max);
  const shown = Math.min(value, upper);
  return {
    dragging,
    measure,
    handleProps: {
      role: 'separator',
      // A handle that moves along the inline axis is a vertical line between side-by-side panes.
      'aria-orientation': axis === 'inline' ? 'vertical' : 'horizontal',
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
