import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * The text direction at an element, for primitives whose keyboard and placement follow it, such as
 * moving between chips with the arrow keys. It follows dir attributes and CSS alike.
 */
export function useTextDirection(ref: RefObject<Element | null>) {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const next = getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
    setDirection((current) => (current === next ? current : next));
  });
  return direction;
}
