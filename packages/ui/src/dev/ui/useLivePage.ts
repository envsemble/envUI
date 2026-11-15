'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { isDevElement, layoutAttribute } from '../elements.js';
import { keyOf, measure } from '../measure.js';
import { overlayCandidateSelector } from '../overlays.js';
import type { LayoutProblem, Snapshot } from '../model.js';
import { onPartsChange } from '../parts.js';
import { read, type Reading } from '../readout.js';
import { devStats, timed } from './stats.js';

export interface LivePage {
  geometry: Snapshot | null;
  full: {
    snapshot: Snapshot;
    reading: Reading;
    problemsByKey: Map<number, LayoutProblem[]>;
  } | null;
  settled: boolean;
  versions: Map<number, number>;
}

const stillnessBeforeFullMeasurementMs = 180;
const longestWaitWhileChangingMs = 1000;

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
    const nodesWatchedForSize = new Set<Element>();
    const awaitingFirstSizeReport = new Set<Element>([root]);
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
      for (const element of nodesWatchedForSize)
        if (!elements.has(element)) {
          sizes.unobserve(element);
          nodesWatchedForSize.delete(element);
        }
      for (const element of elements)
        if (!nodesWatchedForSize.has(element)) {
          awaitingFirstSizeReport.add(element);
          sizes.observe(element);
          nodesWatchedForSize.add(element);
        }
      setGeometry(next.snapshot);
      setFull(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measureGeometry);
      const now = performance.now();
      if (!firstChange) firstChange = now;
      window.clearTimeout(timer);
      timer = window.setTimeout(
        measureFully,
        now - firstChange > longestWaitWhileChangingMs ? 0 : stillnessBeforeFullMeasurementMs,
      );
    };
    const isShownByDevMode = (element: Element) =>
      !isDevElement(element) &&
      (root.contains(element) || !!element.closest(overlayCandidateSelector));
    const markContentChanged = (target: Node | null, nearestNodeOnly = false) => {
      for (
        let at = target instanceof Element ? target : target?.parentElement;
        at && isShownByDevMode(at);
        at = at.parentElement
      ) {
        if (at.hasAttribute(layoutAttribute) || at.matches(overlayCandidateSelector)) {
          const key = keyOf(at);
          versions.set(key, (versions.get(key) ?? 0) + 1);
          if (nearestNodeOnly) return;
        }
      }
    };
    const mutations = new MutationObserver((records) => {
      let relevant = false;
      for (const record of records) {
        const target =
          record.target instanceof Element ? record.target : record.target.parentElement;
        if (!target || isDevElement(target)) continue;
        const responsiveFrameResizingRoot = target === root && record.attributeName === 'style';
        if (responsiveFrameResizingRoot) continue;
        const mayBeAPopupPortallingIn = record.type === 'childList';
        if (!isShownByDevMode(target) && !mayBeAPopupPortallingIn) continue;
        relevant = true;
        markContentChanged(record.target);
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
      if (entries.some((entry) => !awaitingFirstSizeReport.delete(entry.target))) schedule();
    });
    sizes.observe(root);
    const onMotionEnd = (event: Event) => {
      if (!(event.target instanceof Element) || !isShownByDevMode(event.target)) return;
      markContentChanged(event.target, true);
      schedule();
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Element && isDevElement(event.target)) return;
      markContentChanged(event.target instanceof Node ? event.target : null, true);
      schedule();
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('transitionend', onMotionEnd, true);
    document.addEventListener('animationend', onMotionEnd, true);
    window.addEventListener('resize', schedule);
    document.addEventListener('toggle', schedule, true);
    const stopRefreshingOnDescriptions = onPartsChange(schedule);
    measureFully();
    return () => {
      stopRefreshingOnDescriptions();
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
