'use client';

// The page as dev mode's UI sees it, kept current: its geometry at most once an animation frame
// while it changes, for the 3D view, and the full measurement with its readout once it settles,
// for the inspector and the planes' surfaces.

import { useEffect, useMemo, useRef, useState } from 'react';
import { isDevElement, keyOf, layoutAttribute, measure, overlaySelector } from '../measure.js';
import type { LayoutProblem, Snapshot } from '../model.js';
import { onPartsChange } from '../parts.js';
import { read, type Reading } from '../readout.js';
import { devStats, timed } from './stats.js';

export interface LivePage {
  /** The geometry, measured at most once a frame while the page changes. */
  geometry: Snapshot | null;
  /** The full measurement and its readout, taken once changes settle. */
  full: {
    snapshot: Snapshot;
    reading: Reading;
    problemsByKey: Map<number, LayoutProblem[]>;
  } | null;
  /**
   * Whether the page has settled since it last changed: the geometry is the full measurement's.
   * The 3D view copies the planes' surfaces only then, not on every frame of a resize.
   */
  settled: boolean;
  /**
   * How often each node's content changed, by its key: the 3D view copies a node's surfaces again
   * when it does.
   */
  versions: Map<number, number>;
}

/**
 * How long the page must stay still before the full measurement is taken, and the longest it
 * waits while the page keeps changing.
 */
const settleMs = 180;
const longestMs = 1000;

export function useLivePage(root: HTMLElement): LivePage {
  const [geometry, setGeometry] = useState<Snapshot | null>(null);
  const [full, setFull] = useState<LivePage['full']>(null);
  const versions = useRef(new Map<number, number>()).current;

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    let firstChange = 0;
    const measureGeometry = () => {
      frame = 0;
      setGeometry(timed(devStats.geometry, () => measure(root)));
    };
    // Every node is watched for its size, so what resizes inside the page, such as an image that
    // loads or a column that a transition widens, is measured again too.
    const watched = new Set<Element>();
    // A watch reports each element's size once as it starts, which is no change.
    const fresh = new Set<Element>([root]);
    const measureFully = () => {
      timer = 0;
      firstChange = 0;
      cancelAnimationFrame(frame);
      frame = 0;
      const next = timed(devStats.reading, () => {
        const snapshot = measure(root, { inner: true });
        const reading = read(snapshot);
        const problemsByKey = new Map<number, LayoutProblem[]>();
        snapshot.nodes.forEach((node, index) => {
          if (reading.problemsByNode[index].length)
            problemsByKey.set(node.key, reading.problemsByNode[index]);
        });
        return { snapshot, reading, problemsByKey };
      });
      const elements = new Set<Element>(next.snapshot.elements ?? []);
      for (const element of watched)
        if (!elements.has(element)) {
          sizes.unobserve(element);
          watched.delete(element);
        }
      for (const element of elements)
        if (!watched.has(element)) {
          fresh.add(element);
          sizes.observe(element);
          watched.add(element);
        }
      setGeometry(next.snapshot);
      setFull(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measureGeometry);
      const now = performance.now();
      if (!firstChange) firstChange = now;
      window.clearTimeout(timer);
      timer = window.setTimeout(measureFully, now - firstChange > longestMs ? 0 : settleMs);
    };
    /** Whether an element is part of what dev mode shows: under the root, or in an overlay. */
    const shown = (element: Element) =>
      !isDevElement(element) && (root.contains(element) || !!element.closest(overlaySelector));
    /**
     * Marks the nodes an element is in as changed, so their surfaces are copied again: the
     * nearest, whose content changed, and, unless `nearestOnly`, those around it up to the root,
     * whose other content it may have moved.
     */
    const touch = (target: Node | null, nearestOnly = false) => {
      for (
        let at = target instanceof Element ? target : target?.parentElement;
        at && shown(at);
        at = at.parentElement
      ) {
        if (at.hasAttribute(layoutAttribute) || at.matches(overlaySelector)) {
          const key = keyOf(at);
          versions.set(key, (versions.get(key) ?? 0) + 1);
          if (nearestOnly) return;
        }
      }
    };
    const mutations = new MutationObserver((records) => {
      let relevant = false;
      for (const record of records) {
        const target =
          record.target instanceof Element ? record.target : record.target.parentElement;
        if (!target || isDevElement(target)) continue;
        // The responsive frame sets the root's size through its style; the size watch sees it.
        if (target === root && record.attributeName === 'style') continue;
        // A popup portals in beside the page; anything else outside the root isn't shown.
        if (!shown(target) && record.type !== 'childList') continue;
        relevant = true;
        touch(record.target);
      }
      if (relevant) schedule();
    });
    mutations.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    const sizes = new ResizeObserver((entries) => {
      if (entries.some((entry) => !fresh.delete(entry.target))) schedule();
    });
    sizes.observe(root);
    // A transition or an animation that ends leaves its element moved or restyled, without a
    // mutation: its node is copied again.
    const onMotionEnd = (event: Event) => {
      if (!(event.target instanceof Element) || !shown(event.target)) return;
      touch(event.target, true);
      schedule();
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Element && isDevElement(event.target)) return;
      // A scroll moves only what is in the scroller: the node it is, or the node it is in. The
      // nodes around keep their copies, and the planes inside follow their measured boxes.
      touch(event.target instanceof Node ? event.target : null, true);
      schedule();
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('transitionend', onMotionEnd, true);
    document.addEventListener('animationend', onMotionEnd, true);
    window.addEventListener('resize', schedule);
    document.addEventListener('toggle', schedule, true);
    // Descriptions arriving change no names, but the inspector shows them.
    const stopParts = onPartsChange(schedule);
    measureFully();
    return () => {
      stopParts();
      mutations.disconnect();
      sizes.disconnect();
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('transitionend', onMotionEnd, true);
      document.removeEventListener('animationend', onMotionEnd, true);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('toggle', schedule, true);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [root, versions]);

  const settled = !!full && geometry === full.snapshot;
  return useMemo(
    () => ({ geometry, full, settled, versions }),
    [geometry, full, settled, versions],
  );
}
