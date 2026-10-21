'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useEnvUI } from './EnvUIContext.js';

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
  /** How far an arrow key moves it; 10 by default. */
  step?: number;
  /** How far Page Up and Page Down, and an arrow key with Shift, move it; ten steps by default. */
  largeStep?: number;
  /** The size's unit: px, % of the handle's parent element, or rem, of the root's font size. */
  unit?: 'px' | '%' | 'rem';
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
  onChange: (value: number, details: { committed: boolean }) => void;
  /** The size as words, such as 240 pixels or Narrow, for assistive technology. */
  valueText?: (value: number) => string;
  /**
   * Leaves the size as it is and takes the handle out of the tab order; a drag in progress ends
   * without a change, as when the handle goes while it is dragged.
   */
  disabled?: boolean;
}

/** The props of a resize handle element, as useResize returns them. */
export interface ResizeHandleProps {
  role: 'separator';
  'aria-orientation': 'vertical' | 'horizontal';
  'aria-valuenow': number;
  'aria-valuemin': number;
  'aria-valuemax': number;
  'aria-valuetext'?: string;
  'aria-disabled'?: true;
  tabIndex: 0 | -1;
  'data-axis': 'inline' | 'block';
  'data-dragging'?: '';
  onPointerDown(event: ReactPointerEvent<HTMLElement>): void;
  onPointerMove(event: ReactPointerEvent<HTMLElement>): void;
  onPointerUp(event: ReactPointerEvent<HTMLElement>): void;
  onPointerCancel(event: ReactPointerEvent<HTMLElement>): void;
  onLostPointerCapture(event: ReactPointerEvent<HTMLElement>): void;
  onKeyDown(event: ReactKeyboardEvent<HTMLElement>): void;
}

interface Drag {
  pointerId: number;
  start: number;
  startValue: number;
  /** Size units per pixel of pointer movement, with the axis's and the direction's sign. */
  scale: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  step = 10,
  largeStep = step * 10,
  unit = 'px',
  reverse = false,
  onChange,
  valueText,
  disabled = false,
}: ResizeOptions): { handleProps: ResizeHandleProps; dragging: boolean } {
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
  const change = (next: number, committed: boolean) =>
    onChange(clamp(next, min, max), { committed });

  const position = (event: ReactPointerEvent<HTMLElement>) =>
    axis === 'inline' ? event.clientX : event.clientY;

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (disabled || event.button !== 0 || !event.isPrimary) return;
    // Dragging selects no text and leaves focus where it is.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const parent = event.currentTarget.parentElement;
    const extent = parent ? (axis === 'inline' ? parent.clientWidth : parent.clientHeight) : 0;
    // Pointer movement is in screen pixels; a scaled ancestor, as in a zoomed preview, draws the
    // layout smaller or larger than it is.
    const box = parent?.getBoundingClientRect();
    const drawn = box ? (axis === 'inline' ? box.width : box.height) : 0;
    const laid = parent ? (axis === 'inline' ? parent.offsetWidth : parent.offsetHeight) : 0;
    const layoutPerScreen = drawn > 0 && laid > 0 ? laid / drawn : 1;
    // A rem follows the root's font size, read as the drag starts.
    const remPixels = () =>
      Number.parseFloat(getComputedStyle(event.currentTarget.ownerDocument.documentElement).fontSize) ||
      16;
    const perUnit = unit === '%' ? (extent > 0 ? 100 / extent : 0) : unit === 'rem' ? 1 / remPixels() : 1;
    const perPixel = perUnit * layoutPerScreen;
    drag.current = {
      pointerId: event.pointerId,
      start: position(event),
      startValue: value,
      scale: perPixel * sign(event.currentTarget),
    };
    setDragging(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    // A button released outside the window can arrive as a move without it.
    if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) end(event);
    else change(current.startValue + (position(event) - current.start) * current.scale, false);
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
      change(current.startValue, true);
    else change(current.startValue + (position(event) - current.start) * current.scale, true);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const amount = event.shiftKey ? largeStep : step;
    const direction = sign(event.currentTarget);
    const forward = axis === 'inline' ? 'ArrowRight' : 'ArrowDown';
    const backward = axis === 'inline' ? 'ArrowLeft' : 'ArrowUp';
    let next: number;
    if (event.key === forward) next = value + amount * direction;
    else if (event.key === backward) next = value - amount * direction;
    else if (event.key === 'PageUp') next = value + largeStep;
    else if (event.key === 'PageDown') next = value - largeStep;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    else return;
    event.preventDefault();
    change(next, true);
  };

  return {
    dragging,
    handleProps: {
      role: 'separator',
      // A handle that moves along the inline axis is a vertical line between side-by-side panes.
      'aria-orientation': axis === 'inline' ? 'vertical' : 'horizontal',
      'aria-valuenow': Math.round(value),
      'aria-valuemin': Math.round(min),
      'aria-valuemax': Math.round(max),
      ...(valueText && { 'aria-valuetext': valueText(value) }),
      ...(disabled && { 'aria-disabled': true as const }),
      tabIndex: disabled ? -1 : 0,
      'data-axis': axis,
      ...(dragging && { 'data-dragging': '' as const }),
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onLostPointerCapture: end,
      onKeyDown,
    },
  };
}
