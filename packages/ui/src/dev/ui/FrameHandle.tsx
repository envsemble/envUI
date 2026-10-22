'use client';

// The handles of dev mode's responsive frame, on its side edges, its bottom edge and its bottom
// corners. The frame floats in the 3D view; dragging a handle follows the pointer along the frame
// as it is seen, at any turn of the view, and the arrow keys step an edge's handle. Like a colour
// plane, it is a control of its own that no envUI component draws.

import { useEffect, useRef, type HTMLAttributes, type KeyboardEvent } from 'react';
import { windowClasses } from '../units.js';

/** The smallest and largest the frame lays the page out at, in rem. */
export const frameMin = 15;
export const frameMax = 120;
/** How close to a window class boundary, in screen px, a dragged width snaps to it. */
const snapDistance = 8;

/** The size the frame sets, in px, each null where the page keeps its own, and its device. */
export interface FrameSize {
  width: number | null;
  height: number | null;
  /** The device the size came from, or null for a free frame. */
  device: string | null;
}

/** The page at its own size: no frame set. */
export const realSize: FrameSize = { width: null, height: null, device: null };

export type FrameEdge = 'start' | 'end' | 'bottom' | 'bottom-start' | 'bottom-end';

/** Which way each handle moves the width and the height: -1 shrinks as it moves right or down. */
const directions: Record<FrameEdge, { x: -1 | 0 | 1; y: 0 | 1 }> = {
  start: { x: -1, y: 0 },
  end: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  'bottom-start': { x: -1, y: 1 },
  'bottom-end': { x: 1, y: 1 },
};

const names: Record<FrameEdge, string> = {
  start: 'Page width, left edge',
  end: 'Page width, right edge',
  bottom: 'Page height, bottom edge',
  'bottom-start': 'Page size, bottom left corner',
  'bottom-end': 'Page size, bottom right corner',
};

export interface FrameHandleProps {
  edge: FrameEdge;
  /** The page's size now, in px. */
  width: number;
  height: number;
  /** The size the frame sets. */
  size: FrameSize;
  rootPx: number;
  /** The size in words, such as 393×852px · compact. */
  text: string;
  onSizeChange: (size: FrameSize) => void;
}

/** A point's centre on screen. */
function centre(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/**
 * One handle. It finds the side and bottom handles in its parent, by their edge, to know how the
 * frame's width and height run on screen. An edge's handle is a slider for its size; a corner's
 * moves both, with the pointer only, the edges giving the keyboard the same.
 */
export function FrameHandle({
  edge,
  width,
  height,
  size,
  rootPx,
  text,
  onSizeChange,
}: FrameHandleProps) {
  const direction = directions[edge];
  const vertical = edge === 'bottom';
  const corner = direction.x !== 0 && direction.y !== 0;
  const drag = useRef<{
    x: number;
    y: number;
    /** Along the width and along the height on screen, and scene px per screen px each way. */
    across: { x: number; y: number; perPx: number };
    down: { x: number; y: number; perPx: number };
    width: number;
    height: number;
  } | null>(null);
  const next = useRef<FrameSize | null>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const clamp = (px: number) =>
    Math.round(Math.min(frameMax * rootPx, Math.max(frameMin * rootPx, px)));
  /** Sets the size at most once an animation frame, so dragging stays smooth. */
  const request = (wanted: FrameSize) => {
    next.current = wanted;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (next.current) onSizeChange(next.current);
    });
  };
  const pointer: HTMLAttributes<HTMLDivElement> = {
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      const parent = event.currentTarget.parentElement!;
      const handle = (name: FrameEdge) =>
        centre(parent.querySelector(`.env-dev-frame-handle[data-edge="${name}"]`)!);
      const start = handle('start');
      const end = handle('end');
      const middle = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      const bottom = handle('bottom');
      const axis = (from: { x: number; y: number }, to: { x: number; y: number }, px: number) => {
        const span = Math.hypot(to.x - from.x, to.y - from.y);
        return { x: (to.x - from.x) / span, y: (to.y - from.y) / span, perPx: px / span, span };
      };
      const across = axis(start, end, width);
      const down = axis(middle, bottom, height / 2);
      // Seen edge-on, a side can't be told from the other, and nothing is dragged that way.
      if ((direction.x && across.span < 8) || (direction.y && down.span < 4)) return;
      drag.current = { x: event.clientX, y: event.clientY, across, down, width, height };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const current = drag.current;
      if (!current) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      const along = (axis: { x: number; y: number }) => dx * axis.x + dy * axis.y;
      // The model stays centred, so each edge moves half as far as the size changes.
      let nextWidth = size.width;
      if (direction.x) {
        nextWidth = clamp(
          current.width + 2 * along(current.across) * current.across.perPx * direction.x,
        );
        const snap = windowClasses
          .map((windowClass) => windowClass.from * rootPx)
          .find(
            (boundary) =>
              boundary && Math.abs(boundary - nextWidth!) < snapDistance * current.across.perPx,
          );
        if (snap) nextWidth = snap;
      }
      const nextHeight = direction.y
        ? clamp(current.height + 2 * along(current.down) * current.down.perPx)
        : size.height;
      // A dragged frame is a free one, whatever device it came from.
      request({ width: nextWidth, height: nextHeight, device: null });
    },
    onPointerUp: () => {
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
    onDoubleClick: () => onSizeChange(realSize),
  };
  // A corner moves both edges with the pointer; the edges' handles give the keyboard the same.
  if (corner)
    return <div className="env-dev-frame-handle" data-edge={edge} aria-hidden {...pointer} />;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = (event.shiftKey ? 5 : 1) * rootPx;
    const change =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? step
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? -step
          : 0;
    if (!change) return;
    event.preventDefault();
    // From the size last set, which the page may not have been measured at yet.
    onSizeChange(
      vertical
        ? { ...size, height: clamp((size.height ?? height) + change), device: null }
        : { ...size, width: clamp((size.width ?? width) + change), device: null },
    );
  };
  return (
    <div
      className="env-dev-frame-handle"
      data-edge={edge}
      role="slider"
      tabIndex={0}
      aria-label={names[edge]}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-valuemin={frameMin * rootPx}
      aria-valuemax={frameMax * rootPx}
      aria-valuenow={Math.round(vertical ? height : width)}
      aria-valuetext={text}
      {...pointer}
      onKeyDown={onKeyDown}
    />
  );
}
