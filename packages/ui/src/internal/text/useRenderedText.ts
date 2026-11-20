import { useLayoutEffect, useState, type RefObject } from 'react';
import { followRenderedText } from './labelText.js';

/** The text the element renders, followed as it changes, while reads is true. */
export function useRenderedText(element: RefObject<Element | null>, reads: boolean) {
  const [text, setText] = useState<string | undefined>(undefined);
  useLayoutEffect(
    function followTheRenderedText() {
      const node = element.current;
      if (!reads || !node) return;
      return followRenderedText(node, setText);
    },
    [reads, element],
  );
  return reads ? text : undefined;
}
