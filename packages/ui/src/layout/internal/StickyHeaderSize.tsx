'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Inside a sticky PageHeader: publishes the header's height as `--env-page-header-block-size` on
 * its Page, so what scrolls into view below it keeps clear of it, also where its title wraps over
 * more lines than Page.css reckons with. Until it runs, as in the server's markup, Page.css
 * reckons the height from the header's rows. It renders nothing that takes room.
 */
export function StickyHeaderSize() {
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const header = marker.current?.parentElement;
    const page = header?.parentElement;
    // Only a Page's own header: Page marks itself as a layout.
    if (!header || page?.getAttribute('data-env-layout') !== 'page') return;
    const publish = () =>
      page.style.setProperty('--env-page-header-block-size', `${header.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => {
      observer.disconnect();
      page.style.removeProperty('--env-page-header-block-size');
    };
  }, []);
  return <span ref={marker} hidden />;
}
