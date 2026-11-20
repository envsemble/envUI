'use client';

import { useLayoutEffect, useRef } from 'react';
import { observeResize } from '../../internal/dom/observeResize.js';

const subpixelTolerance = 0.5;

/**
 * Inside a sticky PageHeader: publishes the header's height as `--_page-header-block-size` on its
 * Page, which Page.css estimates until it runs, and marks the header data-scrolled while the
 * content after it has scrolled beneath it. It renders nothing that takes room.
 */
export function StickyHeaderSize() {
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const header = marker.current?.parentElement;
    if (!header) return;
    let frame = 0;
    const mark = () => {
      frame = 0;
      const next = header.nextElementSibling;
      const contentScrolledBeneath =
        next !== null &&
        next.getBoundingClientRect().top <
          header.getBoundingClientRect().bottom - subpixelTolerance;
      header.toggleAttribute('data-scrolled', contentScrolledBeneath);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(mark);
    };
    mark();
    const view = header.ownerDocument.defaultView ?? window;
    const hearEveryElementThatScrolls = { capture: true, passive: true };
    header.ownerDocument.addEventListener('scroll', schedule, hearEveryElementThatScrolls);
    view.addEventListener('resize', schedule, { passive: true });
    const page = header.parentElement;
    const publish = () =>
      page?.style.setProperty('--_page-header-block-size', `${header.offsetHeight}px`);
    const isPagesOwnHeader = page?.getAttribute('data-env-layout') === 'page';
    if (isPagesOwnHeader) publish();
    const stopObserving = observeResize(header, () => {
      if (isPagesOwnHeader) publish();
      schedule();
    });
    return () => {
      cancelAnimationFrame(frame);
      header.ownerDocument.removeEventListener('scroll', schedule, { capture: true });
      view.removeEventListener('resize', schedule);
      stopObserving();
      header.removeAttribute('data-scrolled');
      if (isPagesOwnHeader) page?.style.removeProperty('--_page-header-block-size');
    };
  }, []);
  return <span ref={marker} hidden />;
}
