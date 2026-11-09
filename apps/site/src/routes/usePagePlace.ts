import { useEffect, useRef, type RefObject } from 'react';
import { revealSection, takeShownAddress } from './Address';
import { showKeptSection } from './OtherPart';
import { restoreScroll, scrolled } from './ScrollRestoration';

/**
 * Titles the tab after the page, describes it in the head and, as the route changes, moves focus to
 * the page and shows where the reader goes on it: the section the Design and Code switch kept,
 * where they were on a page gone back to, the section the address names, else the page's top. Each
 * step of the history keeps where the reader is on its page (ScrollRestoration.ts).
 */
export function usePagePlace(
  route: string,
  title: string,
  description: string,
  main: RefObject<HTMLElement | null>,
) {
  // The first page loaded leaves focus at the start of the document, as any page does; a route
  // change after it moves focus to the page.
  const firstLoad = useRef(true);
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    // An address that a link of the page's contents wrote has shown its section already.
    if (takeShownAddress()) return;
    if (firstLoad.current) firstLoad.current = false;
    // After the microtasks of the commit, in which a popup of the page that left hands the focus
    // back to what it was opened from, so the page keeps it.
    else queueMicrotask(() => main.current?.focus({ preventScroll: true }));
    // The Design and Code switch keeps the reader's section where the page it shows has it too,
    // and names it in the address; elsewhere the page opens at its top.
    const switched = main.current && showKeptSection(main.current, route.split('?')[0]);
    if (switched) return switched;
    // Back, Forward and a reload return to where the reader was on the page.
    const restoring = main.current && restoreScroll(main.current);
    if (restoring) return restoring;
    const section = new URLSearchParams(route.split('?')[1]).get('section');
    if (section) return revealSection(section);
    main.current?.scrollTo({ top: 0 });
  }, [route, title, description, main]);
  useEffect(() => {
    const element = main.current;
    element?.addEventListener('scroll', scrolled, { passive: true });
    return () => element?.removeEventListener('scroll', scrolled);
  }, [main]);
}
