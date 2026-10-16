'use client';

import { useCallback, useContext, useLayoutEffect, useState, type RefObject } from 'react';
import { EnvUIContext, type Direction } from './EnvUIContext.js';

/**
 * The text direction for a component's keyboard and placement logic: the nearest EnvUIProvider's
 * `dir`, or else the computed direction at `ref`, which follows dir attributes and CSS alike, or
 * else ltr. Reading the computed direction brings styles up to date, so it is read as the element
 * mounts, whenever `key` changes, such as as a popup opens, and through the returned function, such
 * as as the element takes focus; not at every render.
 *
 *   const [direction, readDirection] = useDirection(rootRef);
 */
export function useDirection(
  ref?: RefObject<Element | null>,
  key?: unknown,
): readonly [Direction, () => void] {
  const provided = useContext(EnvUIContext).dir;
  const [computed, setComputed] = useState<Direction>('ltr');
  const read = useCallback(() => {
    const element = ref?.current;
    if (!element) return;
    const next = getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
    setComputed((current) => (current === next ? current : next));
  }, [ref]);
  useLayoutEffect(() => {
    if (provided === undefined) read();
  }, [provided, read, key]);
  return [provided ?? computed, read] as const;
}
