'use client';

import { useEffect, useRef, type PointerEvent, type RefObject } from 'react';
import { prefersReducedMotion } from '../../internal/motion/reducedMotion.js';
import type { useWheelTurn } from './useWheelTurn.js';
import { centredRow, wheelMetrics } from './wheelRows.js';

/**
 * A wheel event of at least this many pixels is one notch of a mouse wheel, which turns the wheel
 * by one row; smaller ones, from a touchpad, turn it by as far as they scroll.
 */
const notchPixels = 50;
/** A notch of a wheel that scrolls by lines, as Firefox reports one. */
const notchLines = 3;
/** A mouse that moves this many pixels with its button down drags the wheel rather than pressing a row. */
const dragThreshold = 4;
/**
 * A drag let go while moving flings the wheel on by its speed, in pixels a millisecond, over this
 * many milliseconds, before it eases into the nearest row; one held still first stops where it is.
 */
const flingMs = 160;
/** A drag held still for this long before it is let go flings nothing. */
const flingRestMs = 80;
/** How much of a drag's speed the latest move sets; the rest is the speed so far. */
const speedSmoothing = 0.6;

/** A mouse dragging the wheel, from the press of its button until it is let go. */
export interface WheelDrag {
  pointer: number;
  startY: number;
  y: number;
  time: number;
  speed: number;
  moved: boolean;
}

/**
 * A mouse turns a time wheel as a finger does, and its wheel a row a notch. Dragging, the rows
 * follow the pointer while its button is down, and let go, the wheel glides on by the drag's speed
 * and eases into the nearest row; a press that doesn't move still presses a row. Touch keeps the
 * browser's own scrolling. Returns the wheel element's pointer handlers.
 */
export function useWheelGestures({
  wheelRef,
  dragRef,
  turning,
  loop,
  count,
  copies,
}: {
  wheelRef: RefObject<HTMLDivElement | null>;
  dragRef: RefObject<WheelDrag | null>;
  turning: ReturnType<typeof useWheelTurn>;
  loop: boolean;
  count: number;
  copies: number;
}) {
  // A touchpad's scrolling not yet turned into a whole row, in pixels.
  const wheelRest = useRef(0);
  // A drag just let go, whose click presses no row.
  const dragged = useRef(false);

  function handleDragMove(event: PointerEvent<HTMLDivElement>) {
    const state = dragRef.current;
    const wheel = event.currentTarget;
    if (!state || event.pointerId !== state.pointer) return;
    if (!(event.buttons & 1)) {
      endDrag(event);
      return;
    }
    if (!state.moved) {
      if (Math.abs(event.clientY - state.startY) < dragThreshold) return;
      state.moved = true;
      wheel.setPointerCapture(event.pointerId);
      // Snapping stays off while the rows follow the pointer, as it would pull them back to a row.
      wheel.dataset.dragging = '';
      turning.holdSettling();
    }
    const moved = event.clientY - state.y;
    const elapsed = Math.max(event.timeStamp - state.time, 1);
    // The speed, smoothed over the last few moves, so one uneven move doesn't set the fling.
    state.speed = speedSmoothing * (moved / elapsed) + (1 - speedSmoothing) * state.speed;
    state.y = event.clientY;
    state.time = event.timeStamp;
    wheel.scrollTop -= moved;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const state = dragRef.current;
    const wheel = event.currentTarget;
    if (!state || event.pointerId !== state.pointer) return;
    dragRef.current = null;
    if (!state.moved) return;
    dragged.current = true;
    if (wheel.hasPointerCapture(event.pointerId)) wheel.releasePointerCapture(event.pointerId);
    delete wheel.dataset.dragging;
    const speed = event.timeStamp - state.time > flingRestMs ? 0 : state.speed;
    const fling = prefersReducedMotion() ? 0 : speed * flingMs;
    turning.turnTo(wheel, centredRow(wheel, loop, wheel.scrollTop - fling));
  }

  // A mouse wheel turns the wheel a row a notch, and a touchpad as far as it scrolls, easing into
  // place rather than scrolling as fast as a page. The listener is added outside React, whose wheel
  // listeners are passive and can't keep the browser from scrolling on its own.
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    function handleWheel(event: WheelEvent) {
      // Zooming, and scrolling sideways, are left to the browser.
      if (!wheel || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      const { row } = wheelMetrics(wheel);
      let rows: number;
      if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
        rows =
          Math.sign(event.deltaY) * Math.max(1, Math.round(Math.abs(event.deltaY) / notchLines));
        wheelRest.current = 0;
      } else if (Math.abs(event.deltaY) >= notchPixels) {
        rows = Math.sign(event.deltaY);
        wheelRest.current = 0;
      } else {
        wheelRest.current += event.deltaY;
        rows = Math.trunc(wheelRest.current / row);
        wheelRest.current -= rows * row;
      }
      if (!rows) return;
      turning.turnTo(wheel, turning.heading(wheel) + rows);
    }
    wheel.addEventListener('wheel', handleWheel, { passive: false });
    return () => wheel.removeEventListener('wheel', handleWheel);
    // The handler measures the wheel as it runs; it needs adding again only for other rows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, copies]);

  return {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      turning.interrupt(event.currentTarget);
      dragged.current = false;
      if (event.pointerType === 'mouse' && event.button === 0)
        dragRef.current = {
          pointer: event.pointerId,
          startY: event.clientY,
          y: event.clientY,
          time: event.timeStamp,
          speed: 0,
          moved: false,
        };
    },
    onPointerMove: handleDragMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
    // The click that ends a drag presses no row.
    onClickCapture: (event: { stopPropagation: () => void }) => {
      if (!dragged.current) return;
      dragged.current = false;
      event.stopPropagation();
    },
  };
}
