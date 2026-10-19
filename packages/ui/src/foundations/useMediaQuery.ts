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

/** One MediaQueryList per query and matchMedia, which every hook reads and listens to. */
const lists = new WeakMap<Window['matchMedia'], Map<string, MediaQueryList>>();

/**
 * The MediaQueryList of a query, or undefined outside a browser. The hooks read the same list they
 * listen to: WebKit sends a list its change events against what it last answered, so an answer
 * read from another list, such as a fresh one in a render between two frames, can go back without
 * any event on the list listened to, and the hook would keep the stale answer.
 */
function mediaQueryList(query: string) {
  if (typeof window === 'undefined' || !window.matchMedia) return undefined;
  let byQuery = lists.get(window.matchMedia);
  if (!byQuery) lists.set(window.matchMedia, (byQuery = new Map()));
  let list = byQuery.get(query);
  if (!list) byQuery.set(query, (list = window.matchMedia(query)));
  return list;
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
      if (!list) return () => {};
      // Resizing asks again too, for an engine that skips a change event; React re-renders only
      // when the answer differs. React also asks again as it subscribes, so a change between the
      // render and the subscription isn't missed.
      list.addEventListener('change', onChange);
      window.addEventListener('resize', onChange);
      return () => {
        list.removeEventListener('change', onChange);
        window.removeEventListener('resize', onChange);
      };
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
