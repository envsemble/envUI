'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { Snapshot } from '../model.js';
import { angles, fitted, type Angle, type useCamera } from './camera.js';
import type { FrameSize } from './Frame.js';

/**
 * Fitting the page into the 3D view: the angle the view is at, which the View dropdown marks until
 * a drag turns it, a function that turns the view to an angle with the whole page in view, and the
 * Responsive dropdown's frame change, after which the view fits the page again. The first
 * measurement fits the page too; dragging the frame keeps the camera where it is.
 */
export function useViewFit({
  snapshot,
  snapshotRef,
  view,
  camera,
  onFrameChange,
}: {
  snapshot: Snapshot | null;
  /** The latest snapshot, for callbacks that stay the same across measurements. */
  snapshotRef: RefObject<Snapshot | null>;
  view: RefObject<HTMLDivElement | null>;
  camera: ReturnType<typeof useCamera>;
  onFrameChange: (frame: FrameSize) => void;
}) {
  const [angle, setAngle] = useState<Angle | null>('tilted');

  /** The camera that shows the whole page at an angle, centred in the view. */
  const fittedAt = useCallback(
    (at: { rx: number; ry: number }) => {
      const current = snapshotRef.current;
      const room = view.current?.getBoundingClientRect();
      if (!current || !room) return null;
      return fitted(at, current.root.box, room);
    },
    [snapshotRef, view],
  );

  const turnTo = useCallback(
    (next: Angle) => {
      const target = fittedAt(angles[next]);
      if (!target) return;
      camera.glideTo(target);
      setAngle(next);
    },
    [camera, fittedAt],
  );

  // A new size from the Responsive dropdown refits the view once the page is measured at it, at
  // the angle the view is at.
  const fittedOnce = useRef(false);
  const refitFrom = useRef<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    if (!snapshot) return;
    const box = snapshot.root.box;
    if (!fittedOnce.current) {
      fittedOnce.current = true;
      const target = fittedAt(angles.tilted);
      if (target) camera.set(target);
    } else if (
      refitFrom.current &&
      (refitFrom.current.w !== box.w || refitFrom.current.h !== box.h)
    ) {
      refitFrom.current = null;
      const target = fittedAt(camera.camera.current);
      if (target) camera.glideTo(target);
    }
  }, [snapshot, camera, fittedAt]);

  const changeFrameFromMenu = useCallback(
    (next: FrameSize) => {
      const box = snapshotRef.current?.root.box;
      refitFrom.current = box ? { w: box.w, h: box.h } : null;
      onFrameChange(next);
    },
    [snapshotRef, onFrameChange],
  );

  return { angle, setAngle, turnTo, changeFrameFromMenu };
}
