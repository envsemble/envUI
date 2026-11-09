import { useSyncExternalStore } from 'react';

/** The flag never changes once read on the client, so there is nothing to subscribe to. */
const subscribe = () => () => {};

/**
 * Whether the site has hydrated: false on the server, as it pre-renders a page, and in the first
 * render of a pre-rendered page in the browser, which has to match the server's; true from the
 * render after, and from the first render where the site renders on the client alone, as while
 * developing or at an address with no pre-rendered page (main.tsx). A part that renders only in
 * the browser, a figure's example, specimen or picture, shows its skeleton until then, so the
 * pre-rendered page and its hydration agree, and the page holds none of them.
 */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
