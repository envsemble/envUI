'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { breakpointQuery, type Breakpoint } from './breakpoints.js';

export interface MediaQueryOptions {
  /**
   * What the hook returns where it can't ask the browser: on the server, and in the first render
   * that hydrates server output, so hydration meets the server's markup. Default false.
   */
  defaultValue?: boolean;
}

/** The MediaQueryList of a query, or undefined outside a browser. */
function mediaQueryList(query: string) {
  return typeof window === 'undefined' ? undefined : window.matchMedia?.(query);
}

/**
 * Whether the viewport matches a media query, such as `(prefers-reduced-motion: reduce)`, kept up to
 * date as it changes. It returns `defaultValue` on the server and while hydrating, then the browser's
 * answer; a page rendered only in the browser gets the answer in its first render. Prefer CSS
 * (`@media`, or `@container` for a component's own width) where the difference is only in styles.
 */
export function useMediaQuery(query: string, options: MediaQueryOptions = {}): boolean {
  const { defaultValue = false } = options;
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = mediaQueryList(query);
      list?.addEventListener('change', onChange);
      return () => list?.removeEventListener('change', onChange);
    },
    [query],
  );
  const read = () => mediaQueryList(query)?.matches ?? defaultValue;
  const readOnServer = () => defaultValue;
  return useSyncExternalStore(subscribe, read, readOnServer);
}

/**
 * Whether the viewport is at least as wide as a breakpoint: `useBreakpoint('md')` is true from
 * 48 rem up. As useMediaQuery, it returns `defaultValue` on the server and while hydrating.
 */
export function useBreakpoint(breakpoint: Breakpoint, options: MediaQueryOptions = {}): boolean {
  return useMediaQuery(breakpointQuery(breakpoint), options);
}
