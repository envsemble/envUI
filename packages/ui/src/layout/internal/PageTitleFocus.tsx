'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

function scaffoldPages() {
  let scaffoldMounted = false;
  let titleShown = false;
  return {
    mount() {
      scaffoldMounted = true;
    },
    showTitle() {
      const replacesAnotherPage = scaffoldMounted && titleShown;
      titleShown = true;
      return replacesAnotherPage;
    },
  };
}

type ScaffoldPages = ReturnType<typeof scaffoldPages>;

export const ScaffoldPagesContext = createContext<ScaffoldPages | null>(null);

/** What a Scaffold knows of its pages: whether it has mounted, and whether a page's title showed. */
export function useScaffoldPages() {
  const [pages] = useState(scaffoldPages);
  useEffect(() => pages.mount(), [pages]);
  return pages;
}

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
 * Right after a page's own title in a Scaffold: moves focus to the title when the page changes
 * after the Scaffold first showed, as a new title mounts or the title's text changes. Focus stays
 * in a field people type in and in an open overlay. It renders nothing that takes room.
 */
export function PageTitleFocus({ enabled }: { enabled: boolean }) {
  const pages = useContext(ScaffoldPagesContext);
  const marker = useRef<HTMLSpanElement>(null);
  const shownText = useRef<string | null>(null);
  useEffect(() => {
    const title = marker.current?.previousElementSibling;
    if (!pages || !(title instanceof HTMLElement)) return;
    const text = title.textContent ?? '';
    if (shownText.current === text) return;
    shownText.current = text;
    const pageChanged = pages.showTitle();
    if (enabled && pageChanged && !focusBelongsElsewhere(title.ownerDocument))
      title.focus({ preventScroll: true });
  });
  return <span ref={marker} hidden />;
}
