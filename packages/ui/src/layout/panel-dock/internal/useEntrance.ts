'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useHydrated } from '../../../internal/react/useHydrated.js';

const inPlaceFromServer = '\0server';

/**
 * Marks a panel's or tab's entrance with data-entering while it plays: when it shows, and again
 * each time it shows in another way, given by key. Server output is in place without an entrance;
 * an undefined key is a way of showing not known yet, which CSS decides meanwhile.
 */
export function useEntrance(
  element: RefObject<HTMLElement | null>,
  key: string | undefined,
  showing: boolean,
) {
  const hydrated = useHydrated();
  const shownAs = useRef<string>(undefined);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    if (key === undefined) {
      if (!hydrated) shownAs.current = inPlaceFromServer;
      return;
    }
    if (shownAs.current === key) return;
    const enters =
      showing &&
      shownAs.current !== inPlaceFromServer &&
      (shownAs.current !== undefined || hydrated);
    shownAs.current = key;
    if (enters) node.setAttribute('data-entering', '');
    else node.removeAttribute('data-entering');
  });
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const ended = (event: globalThis.AnimationEvent) => {
      const newerEntranceStillRunning = node
        .getAnimations?.()
        .some((animation) => animation.playState === 'running');
      if (event.target !== node || newerEntranceStillRunning) return;
      node.removeAttribute('data-entering');
    };
    node.addEventListener('animationend', ended);
    return () => node.removeEventListener('animationend', ended);
  }, [element]);
}
