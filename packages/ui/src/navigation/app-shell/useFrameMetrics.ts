'use client';

import { useLayoutEffect } from 'react';

/** The headers of the frames in each document whose document scrolls, with their heights. */
const documentHeaders = new WeakMap<Document, Map<HTMLElement, number>>();

/** Writes the tallest header of a document's frames, which its scroll padding follows. */
function publish(page: Document) {
  const heights = documentHeaders.get(page);
  const root = page.documentElement;
  if (!heights?.size) root.style.removeProperty('--env-frame-header-block-size');
  else
    root.style.setProperty('--env-frame-header-block-size', `${Math.max(...heights.values())}px`);
}

/**
 * Publishes the header of a frame whose document scrolls under it on the document element, as
 * --env-frame-header-block-size, so the document's scroll padding keeps focused elements and
 * anchor targets below it, and content portaled out of the frame can read it. Inside the frame the
 * same property comes from CSS; only this namespaced property is written on <html>.
 */
export function useFrameMetrics(header: HTMLElement | null) {
  useLayoutEffect(() => {
    if (!header) return;
    const page = header.ownerDocument;
    let heights = documentHeaders.get(page);
    if (!heights) documentHeaders.set(page, (heights = new Map()));
    const frameHeaders = heights;
    const update = () => {
      // A header without a box, hidden or taken out of the document, measures 0.
      frameHeaders.set(header, header.offsetHeight);
      publish(page);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(header);
    return () => {
      observer?.disconnect();
      frameHeaders.delete(header);
      publish(page);
    };
  }, [header]);
}
