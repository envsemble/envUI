import { use, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

/*
 * The state behind the site's skeletons (Skeletons.tsx): when each showed, the waits that keep one
 * a moment, and what they are loading, for the page's one status.
 */

/** How long a part may take before its skeleton shows: quick loads never flash it. */
const placeholderDelay = 240;

/**
 * How long a skeleton that shows stays at least, so it never flickers: a moment, then it fades out
 * as what it stood for fades in (useArrival).
 */
const placeholderLeast = 120;

/** When each part's skeleton showed, by the part's key, while it shows. */
const shownAt = new Map<string, number>();

/** A wait for each part whose skeleton showed only a moment ago, until it has shown its least. */
const holds = new Map<string, Promise<void>>();

/**
 * Holds what a part's skeleton stands for, inside the Suspense boundary the skeleton is the
 * fallback of, until the skeleton has shown for a moment: a part that lands just after its
 * skeleton showed keeps it a little longer rather than flicker. A part whose skeleton never showed
 * renders at once.
 */
export function HoldPlaceholder({ part, children }: { part: string; children: ReactNode }) {
  const at = shownAt.get(part);
  const left = at === undefined ? 0 : at + placeholderLeast - performance.now();
  let hold = holds.get(part);
  if (!hold && at !== undefined && left <= 1) shownAt.delete(part);
  if (!hold && left > 1) {
    hold = new Promise<void>((resolve) => window.setTimeout(resolve, left));
    holds.set(part, hold);
  }
  // The render after the wait reads the same, now settled, promise, as React asks of a component
  // that suspended; the wait is forgotten once that render is committed.
  if (hold) use(hold);
  useEffect(() => {
    if (!hold || holds.get(part) !== hold) return;
    holds.delete(part);
    shownAt.delete(part);
  }, [hold, part]);
  return children;
}

/** What each skeleton that shows is loading, in the order they showed, for LoadingStatus. */
let loading: readonly string[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setLoading = (next: readonly string[]) => {
  loading = next;
  for (const listener of listeners) listener();
};

/** Whether a placeholder shows yet: once it has waited placeholderDelay. */
export function useDelayPassed() {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setPassed(true), placeholderDelay);
    return () => window.clearTimeout(timer);
  }, []);
  return passed;
}

/**
 * Whether a placeholder shows yet, as useDelayPassed says. From then until it leaves, LoadingStatus
 * counts what it is loading.
 */
export function usePlaceholderShown(what: string, part?: string) {
  const shown = useDelayPassed();
  useEffect(() => {
    if (!shown) return;
    if (part !== undefined) shownAt.set(part, performance.now());
    setLoading([...loading, what]);
    return () => {
      const index = loading.indexOf(what);
      setLoading(loading.filter((_, at) => at !== index));
    };
  }, [shown, what, part]);
  return shown;
}

/**
 * The page's one polite status of what is loading: "Loading example" as the first skeleton shows,
 * said once however many follow, and empty again once they have all loaded, which isn't read.
 */
export function LoadingStatus() {
  const parts = useSyncExternalStore(
    subscribe,
    () => loading,
    () => loading,
  );
  const [label, setLabel] = useState('');
  // The label is that of the first part of a run of loading ones, kept until they have all loaded.
  if (parts.length && !label) setLabel(`Loading ${parts[0]}`);
  if (!parts.length && label) setLabel('');
  return (
    <span role="status" className="site-visually-hidden">
      {label}
    </span>
  );
}
