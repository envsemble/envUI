'use client';

import { useEffect, useRef, type PointerEvent, type RefObject } from 'react';
import { dragThreshold } from '../../internal/dom/lengths.js';
import { prefersReducedMotion } from '../../internal/motion/reducedMotion.js';
import type { useTimeWheelTurn } from './useTimeWheelTurn.js';
import { centredRow, wheelMetrics } from './timeWheelRows.js';

const mouseNotchMinPixels = 50;
const linesPerNotchAsFirefoxReportsThem = 3;
const flingDurationMs = 160;
const stillnessThatStopsAFlingMs = 80;
const latestMoveShareOfSpeed = 0.6;

export interface TimeWheelDrag {
  pointer: number;
  startY: number;
  y: number;
  time: number;
  speed: number;
  moved: boolean;
}

function resumeSnappingOnlyOnceTheTurnHoldsItOff(wheel: HTMLElement) {
  delete wheel.dataset.dragging;
}

export function useTimeWheelGestures({
  wheelRef,
  dragRef,
  turning,
  loop,
  count,
  copies,
}: {
  wheelRef: RefObject<HTMLDivElement | null>;
  dragRef: RefObject<TimeWheelDrag | null>;
  turning: ReturnType<typeof useTimeWheelTurn>;
  loop: boolean;
  count: number;
  copies: number;
}) {
  const touchpadPixelsShortOfARow = useRef(0);
  const dragJustEnded = useRef(false);

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
      wheel.dataset.dragging = '';
      turning.holdSettling();
    }
    const moved = event.clientY - state.y;
    const elapsed = Math.max(event.timeStamp - state.time, 1);
    state.speed =
      latestMoveShareOfSpeed * (moved / elapsed) + (1 - latestMoveShareOfSpeed) * state.speed;
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
    dragJustEnded.current = true;
    if (wheel.hasPointerCapture(event.pointerId)) wheel.releasePointerCapture(event.pointerId);
    const speed = event.timeStamp - state.time > stillnessThatStopsAFlingMs ? 0 : state.speed;
    const fling = prefersReducedMotion() ? 0 : speed * flingDurationMs;
    turning.turnTo(wheel, centredRow(wheel, loop, wheel.scrollTop - fling));
    resumeSnappingOnlyOnceTheTurnHoldsItOff(wheel);
  }

  useEffect(
    function listenForWheelNonPassively() {
      const wheel = wheelRef.current;
      if (!wheel) return;
      function handleWheel(event: WheelEvent) {
        const zoomingOrScrollingSideways =
          event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX);
        if (!wheel || zoomingOrScrollingSideways) return;
        event.preventDefault();
        const { row } = wheelMetrics(wheel);
        let rows: number;
        const scrollsByLines = event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL;
        const mouseNotch = Math.abs(event.deltaY) >= mouseNotchMinPixels;
        if (scrollsByLines) {
          rows =
            Math.sign(event.deltaY) *
            Math.max(1, Math.round(Math.abs(event.deltaY) / linesPerNotchAsFirefoxReportsThem));
          touchpadPixelsShortOfARow.current = 0;
        } else if (mouseNotch) {
          rows = Math.sign(event.deltaY);
          touchpadPixelsShortOfARow.current = 0;
        } else {
          touchpadPixelsShortOfARow.current += event.deltaY;
          rows = Math.trunc(touchpadPixelsShortOfARow.current / row);
          touchpadPixelsShortOfARow.current -= rows * row;
        }
        if (!rows) return;
        turning.turnTo(wheel, turning.heading(wheel) + rows);
      }
      wheel.addEventListener('wheel', handleWheel, { passive: false });
      return () => wheel.removeEventListener('wheel', handleWheel);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, copies],
  );

  return {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      turning.interrupt(event.currentTarget);
      dragJustEnded.current = false;
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
    onClickCapture: (event: { stopPropagation: () => void }) => {
      if (!dragJustEnded.current) return;
      dragJustEnded.current = false;
      event.stopPropagation();
    },
  };
}
