'use client';

// A handle of dev mode's responsive frame: a slider for the width the page is laid out at, on an
// edge of the frame, which floats in the 3D view. Dragging it follows the pointer along the edge
// as the frame is seen, at any turn of the view; the arrow keys step it. Like a colour plane, it
// is a control of its own that no envUI component draws.

import { useEffect, useRef } from 'react';
import { windowClasses } from '../units.js';

/** The narrowest and widest the frame lays the page out at, in rem. */
export const frameMin = 15;
export const frameMax = 120;
/** How close to a window class boundary, in screen px, a dragged handle snaps to it. */
const snapDistance = 8;

export interface FrameHandleProps {
  edge: 'start' | 'end';
  /** The page's width now, in px. */
  width: number;
  /** The width the frame sets, in px, or null where the page has its real width. */
  set: number | null;
  rootPx: number;
  /** The width in words, such as 22rem · 352px · compact. */
  text: string;
  onWidthChange: (width: number | null) => void;
}

/**
 * One edge's handle. It finds the other in its parent, by class, to know how the frame's width runs
 * on screen.
 */
export function FrameHandle({ edge, width, set, rootPx, text, onWidthChange }: FrameHandleProps) {
  const drag = useRef<{
    x: number;
    y: number;
    /** The direction from the start handle to the end one on screen, and scene px per screen px. */
    ux: number;
    uy: number;
    perPx: number;
    width: number;
  } | null>(null);
  const next = useRef<number | null>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const clamp = (px: number) =>
    Math.round(Math.min(frameMax * rootPx, Math.max(frameMin * rootPx, px)));
  /** Sets the width at most once an animation frame, so dragging stays smooth. */
  const request = (px: number) => {
    next.current = px;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (next.current !== null) onWidthChange(next.current);
    });
  };
  return (
    <div
      className="env-dev-frame-handle"
      data-edge={edge}
      role="slider"
      tabIndex={0}
      aria-label={`Page width, ${edge === 'start' ? 'left' : 'right'} edge`}
      aria-orientation="horizontal"
      aria-valuemin={frameMin * rootPx}
      aria-valuemax={frameMax * rootPx}
      aria-valuenow={Math.round(width)}
      aria-valuetext={text}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.stopPropagation();
        const handles =
          event.currentTarget.parentElement!.querySelectorAll<HTMLElement>('.env-dev-frame-handle');
        const centre = (element: HTMLElement) => {
          const box = element.getBoundingClientRect();
          return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        };
        const start = centre(handles[0]);
        const end = centre(handles[1]);
        const span = Math.hypot(end.x - start.x, end.y - start.y);
        // Seen edge-on, the edges can't be told apart, and nothing is dragged.
        if (span < 8) return;
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          ux: (end.x - start.x) / span,
          uy: (end.y - start.y) / span,
          perPx: width / span,
          width,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current) return;
        const along =
          (event.clientX - current.x) * current.ux + (event.clientY - current.y) * current.uy;
        // The model stays centred, so each edge moves half as far as the width changes.
        const change = 2 * along * current.perPx * (edge === 'end' ? 1 : -1);
        let px = clamp(current.width + change);
        const snap = windowClasses
          .map((windowClass) => windowClass.from * rootPx)
          .find((boundary) => boundary && Math.abs(boundary - px) < snapDistance * current.perPx);
        if (snap) px = snap;
        request(px);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onDoubleClick={() => onWidthChange(null)}
      onKeyDown={(event) => {
        const step = (event.shiftKey ? 5 : 1) * rootPx;
        const change =
          event.key === 'ArrowRight' || event.key === 'ArrowUp'
            ? step
            : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
              ? -step
              : 0;
        if (!change) return;
        event.preventDefault();
        // From the width last set, which the page may not have been measured at yet.
        onWidthChange(clamp((set ?? width) + change));
      }}
    />
  );
}
