'use client';

import {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';
import { EnvUIContext, type Direction } from './EnvUIContext.js';
import { useMergedRefs } from '../react/useMergedRefs.js';
import { computedDirection } from '../dom/direction.js';

/**
 * The text direction for a component's keyboard and placement logic: the nearest EnvUIProvider's
 * `dir`, or else the computed direction at `ref`, which follows dir attributes and CSS alike, or
 * else ltr. Reading the computed direction brings styles up to date, so it is read as the element
 * mounts, whenever `key` changes, such as as a popup opens, whenever a dir attribute in the
 * document changes, and through the returned function, such as as the element takes focus; not at
 * every render.
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
    const next = computedDirection(element);
    setComputed((current) => (current === next ? current : next));
  }, [ref]);
  useLayoutEffect(() => {
    if (provided !== undefined) return;
    read();
    const document = ref?.current?.ownerDocument;
    if (!document || typeof MutationObserver === 'undefined') return;
    const turnArrowKeysBeforeNextKeyPress = () => flushSync(read);
    const observer = new MutationObserver(turnArrowKeysBeforeNextKeyPress);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
      subtree: true,
    });
    return () => observer.disconnect();
  }, [provided, read, key, ref]);
  return [provided ?? computed, read] as const;
}

/**
 * The direction for a Base UI root whose arrow keys follow it, such as a toolbar's or a tab list's:
 * Base UI reads only its own DirectionProvider, which says ltr unless told. Give the root `ref`
 * and `onFocus`, and wrap it in `<DirectionProvider direction={direction}>`; the direction is the
 * provider's `dir`, else the root's computed direction, read as it mounts and as focus enters it.
 * `forwardedRef` is the component's own ref prop, which the returned ref sets too.
 *
 *   const scope = useDirectionScope(ref);
 *   <DirectionProvider direction={scope.direction}>
 *     <BaseToolbar.Root ref={scope.ref} onFocus={(event) => { scope.onFocus(); onFocus?.(event); }} />
 *   </DirectionProvider>
 */
export function useDirectionScope<T extends Element>(forwardedRef?: Ref<T>) {
  const elementRef = useRef<T | null>(null);
  const [direction, read] = useDirection(elementRef);
  const ref = useMergedRefs(elementRef, forwardedRef);
  return { direction, ref, onFocus: read } as const;
}
