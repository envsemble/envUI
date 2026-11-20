import { useMemo, type Ref } from 'react';
import { mergeRefs } from './setRef.js';

/** mergeRefs of two refs, the same callback while both refs stay the same. */
export function useMergedRefs<T>(first: Ref<T> | undefined, second: Ref<T> | undefined) {
  return useMemo(() => mergeRefs(first, second), [first, second]);
}
