import { createContext, use } from 'react';

/**
 * Whether the parts that render in the browser alone, a figure's example, specimen or picture, may
 * mount, which main.tsx provides: false on the server, as it pre-renders a page, and in the first
 * render of a pre-rendered page in the browser, which has to match the server's; true from a
 * render after the page has hydrated, which main.tsx starts as a transition, so what it mounts
 * doesn't hold up the page; and true from the first render where the site renders on the client
 * alone, as while developing or at an address with no pre-rendered page. It isn't the library's
 * useHydrated, which turns true in a render of its own right after the page hydrates, at once and in
 * one task: what reads that renders again then, so only what has to show the browser's state at
 * once, such as the reader's stored settings, reads it.
 */
export const FiguresMounted = createContext(false);

/**
 * Whether a part that renders only in the browser may mount (FiguresMounted): until then it shows
 * its skeleton, so the pre-rendered page and its hydration agree, and the page holds none of them.
 */
export const useFiguresMounted = () => use(FiguresMounted);
