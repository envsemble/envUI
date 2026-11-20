'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

/** The text the element renders, followed as it changes, while reads is true. */
export function useRenderedText(element: RefObject<HTMLElement | null>, reads: boolean) {
  const [text, setText] = useState<string | undefined>(undefined);
  useLayoutEffect(
    function followTheRenderedText() {
      const node = element.current;
      if (!reads || !node) return;
      const read = () => setText((node.textContent ?? '').replace(/\s+/g, ' ').trim());
      read();
      const observer = new MutationObserver(read);
      observer.observe(node, { childList: true, characterData: true, subtree: true });
      return () => observer.disconnect();
    },
    [reads, element],
  );
  return reads ? text : undefined;
}
