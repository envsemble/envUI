import type { Ref, RefCallback } from 'react';

/** Sets a ref, a callback or an object, to a value; returns a callback ref's cleanup. */
export function setRef<T>(ref: Ref<T> | undefined, value: T | null): (() => void) | void {
  if (typeof ref === 'function') return ref(value);
  if (ref) ref.current = value;
  return undefined;
}

/**
 * One callback ref that sets each of these refs, such as a component's own and the one it is
 * given. Its cleanup runs each callback ref's cleanup, and sets the others back to null.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => setRef(ref, node));
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (typeof cleanup === 'function') cleanup();
        else setRef(ref, null);
      });
    };
  };
}
