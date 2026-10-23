'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Inside a sticky PageHeader: publishes the header's height as `--env-page-header-block-size` on
 * its Page, so what scrolls into view below it keeps clear of it, also where its title wraps over
 * more lines than Page.css reckons with. Until it runs, as in the server's markup, Page.css
 * reckons the height from the header's rows. It also marks the header data-scrolled while the
 * content after it has scrolled beneath it, which PageHeader.css shows with the muted fill. It
 * renders nothing that takes room.
 */
export function StickyHeaderSize() {
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const header = marker.current?.parentElement;
    if (!header) return;
    // Content scrolls beneath the header once the element after it reaches above its bottom edge.
    let frame = 0;
    const mark = () => {
      frame = 0;
      const next = header.nextElementSibling;
      const scrolled =
        next !== null &&
        next.getBoundingClientRect().top < header.getBoundingClientRect().bottom - 0.5;
      header.toggleAttribute('data-scrolled', scrolled);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(mark);
    };
    mark();
    // Scroll doesn't bubble: listening while capturing hears every element that scrolls.
    const view = header.ownerDocument.defaultView ?? window;
    header.ownerDocument.addEventListener('scroll', schedule, { capture: true, passive: true });
    view.addEventListener('resize', schedule, { passive: true });
    const page = header.parentElement;
    // Only a Page's own header publishes its height: Page marks itself as a layout.
    const publish = () =>
      page?.style.setProperty('--env-page-header-block-size', `${header.offsetHeight}px`);
    const ownPage = page?.getAttribute('data-env-layout') === 'page';
    if (ownPage) publish();
    const observer = new ResizeObserver(() => {
      if (ownPage) publish();
      schedule();
    });
    observer.observe(header);
    return () => {
      cancelAnimationFrame(frame);
      header.ownerDocument.removeEventListener('scroll', schedule, { capture: true });
      view.removeEventListener('resize', schedule);
      observer.disconnect();
      header.removeAttribute('data-scrolled');
      if (ownPage) page?.style.removeProperty('--env-page-header-block-size');
    };
  }, []);
  return <span ref={marker} hidden />;
}
