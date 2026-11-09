import { createContext, use } from 'react';

/**
 * Whether the site has hydrated, which main.tsx provides: false on the server, as it pre-renders a
 * page, and in the first render of a pre-rendered page in the browser, which has to match the
 * server's; true from a render after it, which main.tsx starts as a transition once the page has
 * hydrated, so what it mounts doesn't hold up the page; and true from the first render where the
 * site renders on the client alone, as while developing or at an address with no pre-rendered page.
 */
export const Hydrated = createContext(false);

/**
 * Whether the site has hydrated (Hydrated). A part that renders only in the browser, a figure's
 * example, specimen or picture, shows its skeleton until then, so the pre-rendered page and its
 * hydration agree, and the page holds none of them.
 */
export const useHydrated = () => use(Hydrated);
