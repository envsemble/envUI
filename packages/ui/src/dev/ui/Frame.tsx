'use client';

import { useEffect, useRef, type HTMLAttributes, type KeyboardEvent } from 'react';
import { Text } from '../../foundations/Text.js';
import { roundToHundredth } from '../../internal/dom/lengths.js';
import { windowClasses } from '../units.js';
import { windowClassOfRem } from '../../foundations/windowClasses.js';

const frameMinRem = 15;
const frameMaxRem = 120;
const snapDistanceScreenPx = 8;

export interface FrameSize {
  width: number | null;
  height: number | null;
  device: string | null;
}

export const pageOwnSize: FrameSize = { width: null, height: null, device: null };

const centredSizeChangePerEdgeMove = 2;

type FrameEdge = 'start' | 'end' | 'bottom' | 'bottom-start' | 'bottom-end';

const sizeChangePerHandleMove: Record<FrameEdge, { x: -1 | 0 | 1; y: 0 | 1 }> = {
  start: { x: -1, y: 0 },
  end: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  'bottom-start': { x: -1, y: 1 },
  'bottom-end': { x: 1, y: 1 },
};

const handleNames: Record<FrameEdge, string> = {
  start: 'Page width, left edge',
  end: 'Page width, right edge',
  bottom: 'Page height, bottom edge',
  'bottom-start': 'Page size, bottom left corner',
  'bottom-end': 'Page size, bottom right corner',
};

interface FrameHandleProps {
  edge: FrameEdge;
  width: number;
  height: number;
  size: FrameSize;
  rootPx: number;
  sizeText: string;
  onSizeChange: (size: FrameSize) => void;
}

function screenCentreOf(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function FrameHandle({
  edge,
  width,
  height,
  size,
  rootPx,
  sizeText,
  onSizeChange,
}: FrameHandleProps) {
  const direction = sizeChangePerHandleMove[edge];
  const vertical = edge === 'bottom';
  const cornerTakesThePointerOnly = direction.x !== 0 && direction.y !== 0;
  const drag = useRef<{
    x: number;
    y: number;
    across: { x: number; y: number; scenePxPerScreenPx: number };
    down: { x: number; y: number; scenePxPerScreenPx: number };
    width: number;
    height: number;
  } | null>(null);
  const next = useRef<FrameSize | null>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const clamp = (px: number) =>
    Math.round(Math.min(frameMaxRem * rootPx, Math.max(frameMinRem * rootPx, px)));
  const setSizeOncePerFrame = (wanted: FrameSize) => {
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
        screenCentreOf(parent.querySelector(`.env-dev-frame-handle[data-edge="${name}"]`)!);
      const start = handle('start');
      const end = handle('end');
      const middle = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      const bottom = handle('bottom');
      const axis = (from: { x: number; y: number }, to: { x: number; y: number }, px: number) => {
        const span = Math.hypot(to.x - from.x, to.y - from.y);
        return {
          x: (to.x - from.x) / span,
          y: (to.y - from.y) / span,
          scenePxPerScreenPx: px / span,
          span,
        };
      };
      const across = axis(start, end, width);
      const down = axis(middle, bottom, height / 2);
      const seenEdgeOn = (direction.x && across.span < 8) || (direction.y && down.span < 4);
      if (seenEdgeOn) return;
      drag.current = { x: event.clientX, y: event.clientY, across, down, width, height };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const current = drag.current;
      if (!current) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      const along = (axis: { x: number; y: number }) => dx * axis.x + dy * axis.y;
      let nextWidth = size.width;
      if (direction.x) {
        nextWidth = clamp(
          current.width +
            centredSizeChangePerEdgeMove *
              along(current.across) *
              current.across.scenePxPerScreenPx *
              direction.x,
        );
        const snap = windowClasses
          .map((windowClass) => windowClass.from * rootPx)
          .find(
            (boundary) =>
              boundary &&
              Math.abs(boundary - nextWidth!) <
                snapDistanceScreenPx * current.across.scenePxPerScreenPx,
          );
        if (snap) nextWidth = snap;
      }
      const nextHeight = direction.y
        ? clamp(
            current.height +
              centredSizeChangePerEdgeMove * along(current.down) * current.down.scenePxPerScreenPx,
          )
        : size.height;
      setSizeOncePerFrame({ width: nextWidth, height: nextHeight, device: null });
    },
    onPointerUp: () => {
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
  };
  if (cornerTakesThePointerOnly)
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
    const lastSetHeight = size.height ?? height;
    const lastSetWidth = size.width ?? width;
    onSizeChange(
      vertical
        ? { ...size, height: clamp(lastSetHeight + change), device: null }
        : { ...size, width: clamp(lastSetWidth + change), device: null },
    );
  };
  return (
    <div
      className="env-dev-frame-handle"
      data-edge={edge}
      role="slider"
      tabIndex={0}
      aria-label={handleNames[edge]}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-valuemin={frameMinRem * rootPx}
      aria-valuemax={frameMaxRem * rootPx}
      aria-valuenow={Math.round(vertical ? height : width)}
      aria-valuetext={sizeText}
      {...pointer}
      onKeyDown={onKeyDown}
    />
  );
}

const frameEdges: FrameEdge[] = ['start', 'end', 'bottom', 'bottom-start', 'bottom-end'];

export function Frame({
  width,
  height,
  z,
  size,
  rootPx,
  onSizeChange,
}: {
  width: number;
  height: number;
  z: number;
  size: FrameSize;
  rootPx: number;
  onSizeChange: (size: FrameSize) => void;
}) {
  const windowClass = windowClassOfRem(width / rootPx);
  const sizeText = [
    size.device,
    `${Math.round(width)}×${Math.round(height)}px`,
    `${roundToHundredth(width / rootPx)}×${roundToHundredth(height / rootPx)}rem`,
    windowClass,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="env-dev-frame" style={{ transform: `translateZ(${z}px)` }}>
      <Text variant="body-sm" emphasis="default" className="env-dev-frame-label">
        {sizeText}
      </Text>
      {frameEdges.map((edge) => (
        <FrameHandle
          key={edge}
          edge={edge}
          width={width}
          height={height}
          size={size}
          rootPx={rootPx}
          sizeText={sizeText}
          onSizeChange={onSizeChange}
        />
      ))}
    </div>
  );
}
