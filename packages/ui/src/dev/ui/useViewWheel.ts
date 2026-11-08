'use client';

import { useEffect, type RefObject } from 'react';
import type { Snapshot } from '../model.js';
import type { useCamera } from './camera.js';
import { glideScrollBy, scrollerAt, wheelDelta } from './wheel.js';

/** How much one unit of the wheel's delta zooms, on a log scale: a notch of 100 zooms a tenth. */
const zoomPerDelta = 0.00095;
/** The largest delta one wheel event counts, so a fast notch zooms no more than a slow one. */
const largestDelta = 100;

/**
 * The 3D view's wheel: it scrolls the page's scroller under the pointer, in the root, gliding as
 * the browser's smooth scrolling does, and the planes follow; Ctrl+wheel, or the wheel where nothing
 * scrolls, zooms toward the pointer. The snapshot and the hovered plane are read from their refs, so
 * the wheel renders nothing.
 */
export function useViewWheel({
  view,
  root,
  camera,
  snapshot,
  hovered,
  measured,
}: {
  view: RefObject<HTMLElement | null>;
  /** The element dev mode shows; the wheel scrolls nothing around it. */
  root: HTMLElement;
  camera: ReturnType<typeof useCamera>;
  snapshot: RefObject<Snapshot | null>;
  /** The key of the plane under the pointer. */
  hovered: RefObject<number | null>;
  /** Whether the page is measured, which mounts the view's planes. */
  measured: boolean;
}) {
  useEffect(() => {
    const element = view.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if ((event.target as Element).closest('.env-dev-float')) return;
      event.preventDefault();
      const { dx, dy } = wheelDelta(event);
      const key = hovered.current;
      const current = snapshot.current;
      const node =
        key === null ? undefined : current?.nodes.find((candidate) => candidate.key === key);
      const target = node ? current?.elements?.[node.index] : undefined;
      const scroller =
        !event.ctrlKey && !event.metaKey && target ? scrollerAt(target, root, dx, dy) : null;
      if (scroller === 'end') return;
      if (scroller) {
        glideScrollBy(scroller, dx, dy);
        return;
      }
      const room = element.getBoundingClientRect();
      // A touchpad's small turns zoom as little as they turn.
      const delta = Math.max(-largestDelta, Math.min(largestDelta, dy || dx));
      camera.zoomToward(
        Math.exp(-delta * zoomPerDelta),
        event.clientX - room.left - room.width / 2,
        event.clientY - room.top - room.height / 2,
      );
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [view, root, camera, snapshot, hovered, measured]);
}
