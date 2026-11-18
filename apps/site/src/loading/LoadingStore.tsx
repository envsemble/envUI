import {
  use,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const placeholderDelayMs = 240;

export const earlyPlaceholderDelayMs = 600;

const placeholderLeastShownMs = 120;

const negligibleHoldMs = 1;

const shownAt = new Map<string, number>();

const holds = new Map<string, Promise<void>>();

const noHold: Promise<void> = Object.assign(Promise.resolve(), {
  status: 'fulfilled' as const,
  value: undefined,
});

export function HoldPlaceholder({ part, children }: { part: string; children: ReactNode }) {
  const at = shownAt.get(part);
  const left = at === undefined ? 0 : at + placeholderLeastShownMs - performance.now();
  let hold = holds.get(part);
  if (!hold && at !== undefined && left <= negligibleHoldMs) shownAt.delete(part);
  if (!hold && left > negligibleHoldMs) {
    hold = new Promise<void>((resolve) => window.setTimeout(resolve, left));
    holds.set(part, hold);
  }
  use(hold ?? noHold);
  useEffect(() => {
    if (!hold || holds.get(part) !== hold) return;
    holds.delete(part);
    shownAt.delete(part);
  }, [hold, part]);
  return children;
}

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

function sinceFirstPaint() {
  const [paint] = performance.getEntriesByName('first-paint');
  return paint && performance.now() - paint.startTime;
}

export function useDelayPassed(early = false, waiting = false) {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    if (waiting) return;
    const wait = early ? earlyPlaceholderDelayMs - (sinceFirstPaint() ?? 0) : placeholderDelayMs;
    const timer = window.setTimeout(() => setPassed(true), Math.max(0, wait));
    return () => window.clearTimeout(timer);
  }, [early, waiting]);
  return passed;
}

const leftShown = new Set<string>();

export function usePlaceholderShown(what: string, part?: string, early = false, waiting = false) {
  const passed = useDelayPassed(early, waiting);
  const [followed, setFollowed] = useState(false);
  const shown = passed || followed;
  useLayoutEffect(() => {
    if (part !== undefined && leftShown.has(part)) setFollowed(true);
  }, [part]);
  useLayoutEffect(() => {
    if (!shown || part === undefined) return;
    return () => {
      leftShown.add(part);
      queueMicrotask(() => leftShown.delete(part));
    };
  }, [shown, part]);
  useEffect(() => {
    if (!shown) return;
    if (part !== undefined && !(followed && shownAt.has(part)))
      shownAt.set(part, performance.now());
    setLoading([...loading, what]);
    return () => {
      const index = loading.indexOf(what);
      setLoading(loading.filter((_, at) => at !== index));
    };
  }, [shown, followed, what, part]);
  return shown;
}

export function LoadingStatus() {
  const parts = useSyncExternalStore(
    subscribe,
    () => loading,
    () => loading,
  );
  const [label, setLabel] = useState('');
  if (parts.length && !label) setLabel(`Loading ${parts[0]}`);
  if (!parts.length && label) setLabel('');
  return (
    <span role="status" className="site-visually-hidden">
      {label}
    </span>
  );
}
