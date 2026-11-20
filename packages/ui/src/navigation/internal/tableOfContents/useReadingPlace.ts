'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { reducedMotionQuery } from '../../../internal/motion/reducedMotion.js';
import { currentSection, readingPosition } from './readingPosition.js';
import { readSections } from './sectionScroll.js';
import { createWaveDrawer } from './waveDrawer.js';

export interface ChosenByLink {
  id: string;
  settled: boolean;
}

export const scrollPauseThatEndsLinkScrollMs = 150;

export function useReadingPlace({
  ids,
  root,
  shape,
  chosenByLink,
}: {
  ids: string;
  root: RefObject<HTMLDivElement | null>;
  shape: RefObject<SVGSVGElement | null>;
  chosenByLink: RefObject<ChosenByLink | null>;
}) {
  const [current, setCurrent] = useState<string>();
  const settle = useRef(0);
  const measureOnNextFrame = useRef<() => void>(() => {});
  const settleLater = useCallback(
    (delay: number) => {
      clearTimeout(settle.current);
      const choice = chosenByLink.current;
      if (!choice) return;
      settle.current = window.setTimeout(() => {
        choice.settled = true;
        measureOnNextFrame.current();
      }, delay);
    },
    [chosenByLink],
  );
  useEffect(() => () => clearTimeout(settle.current), []);

  useEffect(
    function trackCurrentSectionAndDrawReadersPlace() {
      if (ids === '') {
        setCurrent(undefined);
        return;
      }
      const sectionIds = ids.split('\n');
      const first = document.getElementById(sectionIds[0]);
      const doc = first?.ownerDocument ?? document;
      let frame = 0;

      const drawer = createWaveDrawer(
        () => root.current,
        () => shape.current,
        reducedMotionQuery(),
      );
      const update = () => {
        frame = 0;
        const choice = chosenByLink.current;
        if (choice?.settled) {
          setCurrent(choice.id);
          drawer.wave(sectionIds.indexOf(choice.id));
          return;
        }
        const elements = sectionIds
          .map((id) => doc.getElementById(id))
          .filter((element): element is HTMLElement => element !== null);
        if (elements.length === 0) {
          setCurrent(undefined);
          drawer.wave(null);
          return;
        }
        const { sections, view } = readSections(elements, doc);
        let next = currentSection(sections, view);
        let position = readingPosition(sections, view);
        if (choice) {
          const chosenIndex = sectionIds.indexOf(choice.id);
          if (position > chosenIndex) position = chosenIndex;
          if (next && sectionIds.indexOf(next) > chosenIndex) next = choice.id;
        }
        setCurrent(next);
        drawer.wave(position);
      };
      const schedule = () => {
        if (frame === 0) frame = requestAnimationFrame(update);
      };
      const onScroll = (event: Event) => {
        const target = event.target;
        const sectionLookedUpAfresh = doc.getElementById(sectionIds[0]);
        const movesNoSection =
          target instanceof Element &&
          sectionLookedUpAfresh &&
          !target.contains(sectionLookedUpAfresh);
        if (movesNoSection) return;
        const choice = chosenByLink.current;
        const scrollALinkStarted = choice && !choice.settled;
        if (scrollALinkStarted) {
          settleLater(scrollPauseThatEndsLinkScrollMs);
          schedule();
          return;
        }
        chosenByLink.current = null;
        schedule();
      };
      const onResize = () => schedule();
      measureOnNextFrame.current = schedule;
      schedule();
      doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
      window.addEventListener('resize', onResize);
      const resizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize);
      if (first?.parentElement) resizes?.observe(first.parentElement);
      const body = root.current;
      const entriesMovedByWrapOrFont =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(drawer.remeasure);
      if (body) entriesMovedByWrapOrFont?.observe(body);
      body?.addEventListener('pointerover', drawer.onPointerOver);
      body?.addEventListener('pointerleave', drawer.onPointerLeave);
      return () => {
        cancelAnimationFrame(frame);
        drawer.stop();
        doc.removeEventListener('scroll', onScroll, { capture: true });
        window.removeEventListener('resize', onResize);
        resizes?.disconnect();
        entriesMovedByWrapOrFont?.disconnect();
        body?.removeEventListener('pointerover', drawer.onPointerOver);
        body?.removeEventListener('pointerleave', drawer.onPointerLeave);
      };
    },
    [ids, root, shape, chosenByLink, settleLater],
  );

  return { current, settleLater };
}
