import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

/**
 * The text direction at an element, for primitives whose keyboard and placement follow it, such as
 * moving between chips with the arrow keys. It follows dir attributes and CSS alike. Reading it
 * makes the browser bring styles up to date, so it is read as the element mounts, whenever `key`
 * changes, such as as a popup opens or closes, and through the returned function, such as as the
 * element takes focus; not at every render, which would restyle the page as people type.
 */
export function useTextDirection(ref: RefObject<Element | null>, key?: unknown) {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const read = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const next = getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
    setDirection((current) => (current === next ? current : next));
  }, [ref]);
  useLayoutEffect(read, [read, key]);
  return [direction, read] as const;
}
