import { useEffect, useRef, type RefObject } from 'react';
import { revealSection, takeShownAddress } from './Address';
import { showKeptSection } from './OtherPart';
import { restoreScroll, scrolled } from './ScrollRestoration';

const focusAfterPopupsReturnFocus = (main: RefObject<HTMLElement | null>) =>
  queueMicrotask(() => main.current?.focus({ preventScroll: true }));

export function usePagePlace(
  route: string,
  title: string,
  description: string,
  main: RefObject<HTMLElement | null>,
) {
  const firstLoad = useRef(true);
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    if (takeShownAddress()) return;
    const first = firstLoad.current;
    if (first) firstLoad.current = false;
    else focusAfterPopupsReturnFocus(main);
    const switched = main.current && showKeptSection(main.current, route.split('?')[0]);
    if (switched) return switched;
    const restoring = main.current && restoreScroll(main.current);
    if (restoring) return restoring;
    const section = new URLSearchParams(route.split('?')[1]).get('section');
    if (section) return revealSection(section);
    if (!first) main.current?.scrollTo({ top: 0 });
  }, [route, title, description, main]);
  useEffect(() => {
    const element = main.current;
    element?.addEventListener('scroll', scrolled, { passive: true });
    return () => element?.removeEventListener('scroll', scrolled);
  }, [main]);
}
