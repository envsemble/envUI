import { useLayoutEffect, useState, type RefObject } from 'react';
import { observeResize } from '../dom/observeResize.js';

/**
 * Whether the element's label is cut short, wider than the room it has, as CutLabelTooltip's `cut`
 * takes it: measured once laid out and again as it resizes, while measures is true.
 */
export function useCutShort(element: RefObject<HTMLElement | null>, measures = true) {
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const node = element.current;
    if (!measures || !node) {
      setCut(false);
      return;
    }
    return observeResize(node, () => setCut(node.scrollWidth > node.clientWidth));
  }, [element, measures]);
  return cut;
}
