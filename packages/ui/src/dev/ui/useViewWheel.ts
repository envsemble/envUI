'use client';

import { useEffect, type RefObject } from 'react';
import type { Snapshot } from '../model.js';
import type { useCamera } from './camera.js';
import { glideScrollBy, scrollerAt, wheelDelta } from './wheel.js';

const zoomPerDelta = 0.00095;
const largestDeltaPerEvent = 100;

export function useViewWheel({
  view,
  root,
  camera,
  snapshot,
  hovered,
  planesMounted,
}: {
  view: RefObject<HTMLElement | null>;
  root: HTMLElement;
  camera: ReturnType<typeof useCamera>;
  snapshot: RefObject<Snapshot | null>;
  hovered: RefObject<number | null>;
  planesMounted: boolean;
}) {
  useEffect(() => {
    const element = view.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      const overFloatingPanel = (event.target as Element).closest('.env-dev-float');
      if (overFloatingPanel) return;
      event.preventDefault();
      const { dx, dy } = wheelDelta(event);
      const key = hovered.current;
      const current = snapshot.current;
      const node =
        key === null ? undefined : current?.nodes.find((candidate) => candidate.key === key);
      const target = node ? current?.elements?.[node.index] : undefined;
      const zoomRequested = event.ctrlKey || event.metaKey;
      const scroller = !zoomRequested && target ? scrollerAt(target, root, dx, dy) : null;
      if (scroller === 'end') return;
      if (scroller) {
        glideScrollBy(scroller, dx, dy);
        return;
      }
      const room = element.getBoundingClientRect();
      const delta = Math.max(-largestDeltaPerEvent, Math.min(largestDeltaPerEvent, dy || dx));
      camera.zoomToward(
        Math.exp(-delta * zoomPerDelta),
        event.clientX - room.left - room.width / 2,
        event.clientY - room.top - room.height / 2,
      );
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [view, root, camera, snapshot, hovered, planesMounted]);
}
