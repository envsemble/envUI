'use client';

// The 3D view's camera: how the scene is turned, zoomed and panned. It moves the scene's
// transform directly, without a render, so dragging, the wheel and the glide to an angle stay
// smooth whatever the page's size.

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { prefersReducedMotion } from '../../internal/reducedMotion.js';

export interface Camera {
  /** The turn about the horizontal and the vertical axis, in degrees. */
  rx: number;
  ry: number;
  zoom: number;
  /** The pan, in screen px. */
  px: number;
  py: number;
}

export type Angle = 'tilted' | 'front' | 'top' | 'left' | 'right';

/** The angles the view turns to, by the side of the page they look from. */
export const angles: Record<Angle, { label: string; rx: number; ry: number }> = {
  tilted: { label: 'Tilted', rx: 38, ry: -22 },
  front: { label: 'Front', rx: 0, ry: 0 },
  top: { label: 'Top', rx: -70, ry: 0 },
  left: { label: 'Left', rx: 0, ry: 70 },
  right: { label: 'Right', rx: 0, ry: -70 },
};

/** The zoom the camera keeps between. */
const zoomRange = { least: 0.05, most: 6 };
const clampZoom = (zoom: number) => Math.max(zoomRange.least, Math.min(zoomRange.most, zoom));

const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

/**
 * The camera of a scene, which it moves by writing its transform: put the `scene` ref on the
 * scene's element. `lift` is how high the planes reach, which the scene is centred on. The view
 * renders as rarely as it can: the camera is a ref, and its moves never render.
 */
export function useCamera(lift: number) {
  const scene = useRef<HTMLDivElement>(null);
  const camera = useRef<Camera>({ ...angles.tilted, zoom: 0.6, px: 0, py: 0 });
  const glide = useRef<{ to: Camera; frame: number } | null>(null);
  const liftRef = useRef(lift);
  liftRef.current = lift;

  /** Writes the camera into the scene's transform. */
  const apply = useCallback(() => {
    const element = scene.current;
    if (!element) return;
    const { rx, ry, zoom, px, py } = camera.current;
    element.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px) scale(${zoom}) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${-liftRef.current / 2}px)`;
    // The frame's handles and label keep their size on screen at any zoom.
    element.style.setProperty('--env-dev-zoom', String(zoom));
  }, []);
  // The planes' height changes with the levels shown and their spacing.
  useLayoutEffect(apply, [apply, lift]);

  /** Ends a glide where it is, so a drag or the wheel takes the camera from there. */
  const stop = useCallback(() => {
    if (!glide.current) return;
    cancelAnimationFrame(glide.current.frame);
    glide.current = null;
  }, []);

  /** Puts the camera somewhere at once. */
  const set = useCallback(
    (next: Camera) => {
      stop();
      camera.current = next;
      apply();
    },
    [apply, stop],
  );

  /**
   * Moves the camera somewhere over `duration` ms, easing out; at once with a reduced-motion
   * preference. A glide that comes while one runs starts from where the camera is.
   */
  const glideTo = useCallback(
    (to: Camera, duration = 240) => {
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
        apply();
        if (progress < 1 && glide.current) glide.current.frame = requestAnimationFrame(step);
        else glide.current = null;
      };
      glide.current = { to, frame: requestAnimationFrame(step) };
    },
    [apply, set, stop],
  );

  /** Where the camera is going: the end of its glide, else where it is. */
  const destination = useCallback(() => glide.current?.to ?? camera.current, []);

  /**
   * Zooms by a factor toward a point of the view, in px from its centre, gliding: wheel turns that
   * come quickly add up.
   */
  const zoomToward = useCallback(
    (factor: number, x: number, y: number) => {
      const from = destination();
      const zoom = clampZoom(from.zoom * factor);
      const k = zoom / from.zoom;
      glideTo({ ...from, zoom, px: x - (x - from.px) * k, py: y - (y - from.py) * k }, 120);
    },
    [destination, glideTo],
  );

  return useMemo(
    () => ({ scene, camera, set, glideTo, stop, zoomToward }),
    [set, glideTo, stop, zoomToward],
  );
}

/** The camera that fits a page of a size into a view of a size, at an angle, centred. */
export function fitted(
  angle: { rx: number; ry: number },
  page: { w: number; h: number },
  view: { width: number; height: number },
): Camera {
  const zoom = Math.min(view.width / Math.max(page.w, 1), view.height / Math.max(page.h, 1)) * 0.7;
  return { rx: angle.rx, ry: angle.ry, zoom: clampZoom(zoom), px: 0, py: 0 };
}

/**
 * Turning and panning by dragging the view, and a click that selects: a drag starts once the
 * pointer moves 4 px, and Shift or the middle button pans.
 */
export function useOrbit(
  camera: ReturnType<typeof useCamera>,
  {
    onDragChange,
    onTurn,
    onClick,
  }: {
    /** Called as a drag starts and ends. */
    onDragChange: (dragging: boolean) => void;
    /** Called as a drag starts turning the view, which leaves the angle it was at. */
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
    /** Whether a drag is moving the camera, rather than a click on its way. */
    moving: () => drag.current?.moved ?? false,
    down(event: ReactPointerEvent<HTMLDivElement>) {
      if (event.button !== 0 && event.button !== 1) return;
      if (event.button === 1) event.preventDefault();
      camera.stop();
      // A selection left across the view, such as after Ctrl+A, goes: pressed on, the browser would
      // drag it rather than let the view turn.
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) selection.removeAllRanges();
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        start: camera.camera.current,
        pan: event.shiftKey || event.button === 1,
        moved: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    move(event: ReactPointerEvent<HTMLDivElement>) {
      const current = drag.current;
      if (!current) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.moved && Math.hypot(dx, dy) < 4) return;
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
              ry: start.ry + dx * 0.3,
              rx: Math.max(-90, Math.min(90, start.rx - dy * 0.3)),
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
