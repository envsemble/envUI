import { useEffect, useReducer } from 'react';
import { loadModule } from './LoadBoundary';

/** A promise with the fields React's use() reads to take its value without suspending. */
type Tracked<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
};

/**
 * What `load` gives, for a part of a page that loads with it, such as its content, an example or
 * its code: loaded once under `key` and kept in `cache`, and marked settled as React's use() reads
 * a promise, so a part loaded before its first render, as a link is about to be followed, shows at
 * once rather than suspending for a moment. A load that fails is a ModuleLoadError and is kept
 * too, so renders until a retry read the same rejected promise rather than a new one each time,
 * which React would take for a promise it was never given and ask for again, on and on. A part
 * with a retry deletes it from `cache` to load it again (ModuleRegistry.ts).
 */
export function loadOnce<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>) {
  const cached = cache.get(key);
  if (cached) return cached;
  const promise: Tracked<T> = loadModule(load)();
  promise.status = 'pending';
  promise.then(
    (value) => {
      promise.status = 'fulfilled';
      promise.value = value;
    },
    (reason: unknown) => {
      promise.status = 'rejected';
      promise.reason = reason;
    },
  );
  cache.set(key, promise);
  return promise;
}

/** Whether a load from loadOnce has settled, loaded or failed. */
export const settled = (promise: Promise<unknown>) =>
  // Every load loadOnce makes is tracked.
  (promise as Tracked<unknown>).status !== 'pending';

/**
 * The value of a load from loadOnce once it has loaded, without suspending: undefined until then,
 * and for a load that failed or for no load. The component renders again when the load settles.
 * For a part whose surroundings show while it loads, such as a tile's skeleton on its stage.
 */
export function useLoaded<T>(load: Promise<T> | undefined): T | undefined {
  const [, loaded] = useReducer((count: number) => count + 1, 0);
  useEffect(() => {
    if (!load) return;
    let gone = false;
    // Also a load settled since the render: it renders again with the value.
    const settle = () => {
      if (!gone) loaded();
    };
    load.then(settle, settle);
    return () => {
      gone = true;
    };
  }, [load]);
  // Every load loadOnce makes is tracked.
  const tracked = load as Tracked<T> | undefined;
  return tracked?.status === 'fulfilled' ? tracked.value : undefined;
}
