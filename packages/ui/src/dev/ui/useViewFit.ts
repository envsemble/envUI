'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { Snapshot } from '../model.js';
import { angles, fitted, type Angle, type useCamera } from './camera.js';
import type { FrameSize } from './Frame.js';

export function useViewFit({
  snapshot,
  snapshotRef,
  view,
  camera,
  onFrameChange,
}: {
  snapshot: Snapshot | null;
  snapshotRef: RefObject<Snapshot | null>;
  view: RefObject<HTMLDivElement | null>;
  camera: ReturnType<typeof useCamera>;
  onFrameChange: (frame: FrameSize) => void;
}) {
  const [angle, setAngle] = useState<Angle | null>('tilted');

  const cameraFittingTheWholePageAt = useCallback(
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
      const target = cameraFittingTheWholePageAt(angles[next]);
      if (!target) return;
      camera.glideTo(target);
      setAngle(next);
    },
    [camera, cameraFittingTheWholePageAt],
  );

  const fittedTheFirstMeasurement = useRef(false);
  const sizeBeforeResponsiveChange = useRef<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    if (!snapshot) return;
    const box = snapshot.root.box;
    const measuredAtTheNewResponsiveSize =
      sizeBeforeResponsiveChange.current !== null &&
      (sizeBeforeResponsiveChange.current.w !== box.w ||
        sizeBeforeResponsiveChange.current.h !== box.h);
    if (!fittedTheFirstMeasurement.current) {
      fittedTheFirstMeasurement.current = true;
      const target = cameraFittingTheWholePageAt(angles.tilted);
      if (target) camera.set(target);
    } else if (measuredAtTheNewResponsiveSize) {
      sizeBeforeResponsiveChange.current = null;
      const target = cameraFittingTheWholePageAt(camera.camera.current);
      if (target) camera.glideTo(target);
    }
  }, [snapshot, camera, cameraFittingTheWholePageAt]);

  const changeFrameFromMenu = useCallback(
    (next: FrameSize) => {
      const box = snapshotRef.current?.root.box;
      sizeBeforeResponsiveChange.current = box ? { w: box.w, h: box.h } : null;
      onFrameChange(next);
    },
    [snapshotRef, onFrameChange],
  );

  return { angle, setAngle, turnTo, changeFrameFromMenu };
}
