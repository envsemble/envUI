'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { prefersReducedMotion } from '../../internal/motion/reducedMotion.js';

export interface Camera {
  rx: number;
  ry: number;
  zoom: number;
  px: number;
  py: number;
}

export type Angle = 'tilted' | 'front' | 'top' | 'left' | 'right';

export const angles: Record<Angle, { label: string; rx: number; ry: number }> = {
  tilted: { label: 'Tilted', rx: 38, ry: -22 },
  front: { label: 'Front', rx: 0, ry: 0 },
  top: { label: 'Top', rx: -70, ry: 0 },
  left: { label: 'Left', rx: 0, ry: 70 },
  right: { label: 'Right', rx: 0, ry: -70 },
};

const zoomLimits = { least: 0.05, most: 6 };
const clampZoom = (zoom: number) => Math.max(zoomLimits.least, Math.min(zoomLimits.most, zoom));

const defaultGlideMs = 240;
const wheelZoomGlideMs = 120;
const pageShareOfFittedView = 0.7;
const dragThresholdPx = 4;
const degreesPerDraggedPx = 0.3;

const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

export function useCamera(lift: number) {
  const scene = useRef<HTMLDivElement>(null);
  const camera = useRef<Camera>({ ...angles.tilted, zoom: 0.6, px: 0, py: 0 });
  const glide = useRef<{ to: Camera; frame: number } | null>(null);
  const liftRef = useRef(lift);
  liftRef.current = lift;

  const writeCameraToSceneTransform = useCallback(() => {
    const element = scene.current;
    if (!element) return;
    const { rx, ry, zoom, px, py } = camera.current;
    element.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px) scale(${zoom}) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${-liftRef.current / 2}px)`;
    element.style.setProperty('--_dev-zoom', String(zoom));
  }, []);
  useLayoutEffect(writeCameraToSceneTransform, [writeCameraToSceneTransform, lift]);

  const stop = useCallback(() => {
    if (!glide.current) return;
    cancelAnimationFrame(glide.current.frame);
    glide.current = null;
  }, []);

  const set = useCallback(
    (next: Camera) => {
      stop();
      camera.current = next;
      writeCameraToSceneTransform();
    },
    [writeCameraToSceneTransform, stop],
  );

  const glideTo = useCallback(
    (to: Camera, duration = defaultGlideMs) => {
      if (prefersReducedMotion()) return set(to);
      stop();
      const from = camera.current;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - progress) ** 3;
        camera.current =
          progress === 1
            ? to
            : {
                rx: mix(from.rx, to.rx, eased),
                ry: mix(from.ry, to.ry, eased),
                zoom: mix(from.zoom, to.zoom, eased),
                px: mix(from.px, to.px, eased),
                py: mix(from.py, to.py, eased),
              };
        writeCameraToSceneTransform();
        if (progress < 1 && glide.current) glide.current.frame = requestAnimationFrame(step);
        else glide.current = null;
      };
      glide.current = { to, frame: requestAnimationFrame(step) };
    },
    [writeCameraToSceneTransform, set, stop],
  );

  const destination = useCallback(() => glide.current?.to ?? camera.current, []);

  const zoomToward = useCallback(
    (factor: number, x: number, y: number) => {
      const from = destination();
      const zoom = clampZoom(from.zoom * factor);
      const zoomRatio = zoom / from.zoom;
      glideTo(
        { ...from, zoom, px: x - (x - from.px) * zoomRatio, py: y - (y - from.py) * zoomRatio },
        wheelZoomGlideMs,
      );
    },
    [destination, glideTo],
  );

  return useMemo(
    () => ({ scene, camera, set, glideTo, stop, zoomToward }),
    [set, glideTo, stop, zoomToward],
  );
}

export function fitted(
  angle: { rx: number; ry: number },
  page: { w: number; h: number },
  view: { width: number; height: number },
): Camera {
  const zoom =
    Math.min(view.width / Math.max(page.w, 1), view.height / Math.max(page.h, 1)) *
    pageShareOfFittedView;
  return { rx: angle.rx, ry: angle.ry, zoom: clampZoom(zoom), px: 0, py: 0 };
}

export function useOrbit(
  camera: ReturnType<typeof useCamera>,
  {
    onDragChange,
    onTurn,
    onClick,
  }: {
    onDragChange: (dragging: boolean) => void;
    onTurn: () => void;
    onClick: () => void;
  },
) {
  const drag = useRef<{
    x: number;
    y: number;
    start: Camera;
    pan: boolean;
    moved: boolean;
  } | null>(null);
  return {
    moving: () => drag.current?.moved ?? false,
    down(event: ReactPointerEvent<HTMLDivElement>) {
      const middleButton = event.button === 1;
      if (event.button !== 0 && !middleButton) return;
      if (middleButton) event.preventDefault();
      camera.stop();
      const selectionTheBrowserWouldDragInstead = window.getSelection();
      if (selectionTheBrowserWouldDragInstead && !selectionTheBrowserWouldDragInstead.isCollapsed)
        selectionTheBrowserWouldDragInstead.removeAllRanges();
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        start: camera.camera.current,
        pan: event.shiftKey || middleButton,
        moved: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    move(event: ReactPointerEvent<HTMLDivElement>) {
      const current = drag.current;
      if (!current) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.moved && Math.hypot(dx, dy) < dragThresholdPx) return;
      if (!current.moved) {
        onDragChange(true);
        if (!current.pan) onTurn();
      }
      current.moved = true;
      const start = current.start;
      camera.set(
        current.pan
          ? { ...start, px: start.px + dx, py: start.py + dy }
          : {
              ...start,
              ry: start.ry + dx * degreesPerDraggedPx,
              rx: Math.max(-90, Math.min(90, start.rx - dy * degreesPerDraggedPx)),
            },
      );
    },
    up() {
      const current = drag.current;
      drag.current = null;
      if (!current) return;
      if (current.moved) onDragChange(false);
      else onClick();
    },
  };
}
