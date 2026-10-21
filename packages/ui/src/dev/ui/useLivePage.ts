'use client';

// The page as dev mode's UI sees it, kept current: its geometry once an animation frame while it
// changes, for the 3D view, and the full readout once it settles, for the inspector.

import { useEffect, useRef, useState } from 'react';
import { isDevElement, keyOf, layoutAttribute, measure, overlaySelector } from '../measure.js';
import type { LayoutProblem, Snapshot } from '../model.js';
import { read, type Reading } from '../readout.js';

export interface LivePage {
  /** The geometry, measured at most once a frame. */
  geometry: Snapshot | null;
  /** The full measurement and its readout, once changes settle. */
  full: {
    snapshot: Snapshot;
    reading: Reading;
    problemsByKey: Map<number, LayoutProblem[]>;
  } | null;
  /** How often each node's content changed, by its key: the 3D view copies a node's surfaces again when it does. */
  versions: Map<number, number>;
}

/** How long the page must stay still before the full readout is taken, and the longest it waits. */
const settle = 180;
const longest = 700;

export function useLivePage(root: HTMLElement): LivePage {
  const [geometry, setGeometry] = useState<Snapshot | null>(null);
  const [full, setFull] = useState<LivePage['full']>(null);
  const versions = useRef(new Map<number, number>()).current;

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    let firstChange = 0;
    const geometryNow = () => {
      frame = 0;
      setGeometry(measure(root));
    };
    const fullNow = () => {
      timer = 0;
      firstChange = 0;
      const snapshot = measure(root, { inner: true });
      const reading = read(snapshot);
      const problemsByKey = new Map<number, LayoutProblem[]>();
      snapshot.nodes.forEach((node, index) => {
        if (reading.problemsByNode[index].length)
          problemsByKey.set(node.key, reading.problemsByNode[index]);
      });
      setGeometry(snapshot);
      setFull({ snapshot, reading, problemsByKey });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(geometryNow);
      const now = performance.now();
      if (!firstChange) firstChange = now;
      window.clearTimeout(timer);
      timer = window.setTimeout(fullNow, now - firstChange > longest ? 0 : settle);
    };
    /**
     * Marks the nodes an element is in as changed, so their surfaces are copied again: the
     * nearest, whose content changed, and those around it, whose other content it may have moved.
     */
    const touch = (target: Node | null) => {
      for (
        let at = target instanceof Element ? target : target?.parentElement;
        at;
        at = at.parentElement
      ) {
        if (at.hasAttribute(layoutAttribute) || at.matches(overlaySelector)) {
          const key = keyOf(at);
          versions.set(key, (versions.get(key) ?? 0) + 1);
        }
      }
    };
    const mutations = new MutationObserver((records) => {
      let relevant = false;
      for (const record of records) {
        const target =
          record.target instanceof Element ? record.target : record.target.parentElement;
        if (!target || isDevElement(target)) continue;
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
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    const onScroll = (event: Event) => {
      if (event.target instanceof Element && isDevElement(event.target)) return;
      touch(event.target instanceof Node ? event.target : null);
      schedule();
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('toggle', schedule, true);
    fullNow();
    return () => {
      mutations.disconnect();
      resize.disconnect();
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', schedule);
      document.removeEventListener('toggle', schedule, true);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [root, versions]);

  return { geometry, full, versions };
}
