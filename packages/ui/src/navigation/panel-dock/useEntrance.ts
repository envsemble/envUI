'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useHydrated } from '../../internal/useHydrated.js';

/**
 * Marks a panel's or tab's entrance with data-entering while it plays: when it shows, and again each
 * time it shows in another way, given by key. A reorder moves the element in the document, which
 * starts its CSS animations over; once the attribute is gone, nothing plays again. The attribute is
 * set on the element itself, so the entrance renders nothing. Server output is in place before it
 * hydrates, without an entrance.
 */
export function useEntrance(element: RefObject<HTMLElement | null>, key: string, showing: boolean) {
  const hydrated = useHydrated();
  const shownAs = useRef<string>(undefined);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node || shownAs.current === key) return;
    const enters = showing && (shownAs.current !== undefined || hydrated);
    shownAs.current = key;
    if (enters) node.setAttribute('data-entering', '');
    else node.removeAttribute('data-entering');
  });
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const ended = (event: globalThis.AnimationEvent) => {
      // An earlier animation can end late, after a new entrance began; that one keeps running.
      if (
        event.target !== node ||
        node.getAnimations?.().some((animation) => animation.playState === 'running')
      )
        return;
      node.removeAttribute('data-entering');
    };
    node.addEventListener('animationend', ended);
    return () => node.removeEventListener('animationend', ended);
  }, [element]);
}
