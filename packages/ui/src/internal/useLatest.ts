'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * A ref that always holds the value of the latest render, such as a component's callbacks, for
 * handlers and effects that run later and must not restart when the value changes. It is updated
 * after each render commits, so read it from events and effects, not during render.
 */
export function useLatest<T>(value: T) {
  const latest = useRef(value);
  useLayoutEffect(() => {
    latest.current = value;
  });
  return latest;
}
