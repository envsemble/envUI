'use client';

import { useContext, useEffect, useRef } from 'react';
import { ScaffoldPagesContext } from './scaffoldPages.js';

const fieldPeopleTypeIn =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const openOverlay = ['dialog', 'alertdialog', 'menu', 'listbox']
  .map((role) => `[role="${role}"]:not([data-closed])`)
  .join(', ');

function focusBelongsElsewhere(document: Document) {
  const active = document.activeElement;
  if (!active || active === document.body) return false;
  return active.closest(`${fieldPeopleTypeIn}, ${openOverlay}`) !== null;
}

/**
 * Right after a page's own title in a Scaffold: moves focus to the title when a new page's header
 * mounts after the Scaffold first showed. A title that changes on the same page leaves focus
 * alone, and focus stays in a field people type in and in an open overlay. It renders nothing
 * that takes room.
 */
export function PageTitleFocus({ enabled }: { enabled: boolean }) {
  const pages = useContext(ScaffoldPagesContext);
  const marker = useRef<HTMLSpanElement>(null);
  const enabledOnMount = useRef(enabled);
  const titleCounted = useRef(false);
  useEffect(() => {
    const title = marker.current?.previousElementSibling;
    if (!pages || titleCounted.current || !(title instanceof HTMLElement)) return;
    titleCounted.current = true;
    const pageChanged = pages.showTitle();
    if (enabledOnMount.current && pageChanged && !focusBelongsElsewhere(title.ownerDocument))
      title.focus({ preventScroll: true });
  }, [pages]);
  return <span ref={marker} hidden />;
}
