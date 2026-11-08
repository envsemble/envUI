import type { Ref } from 'react';

/** Sets a ref, a callback or an object, to a value; returns a callback ref's cleanup. */
export function setRef<T>(ref: Ref<T> | undefined, value: T | null): (() => void) | void {
  if (typeof ref === 'function') return ref(value);
  if (ref) (ref as { current: T | null }).current = value;
  return undefined;
}
