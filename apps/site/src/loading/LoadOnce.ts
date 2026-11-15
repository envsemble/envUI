import { useEffect, useReducer } from 'react';
import { loadModule } from './LoadBoundary';

type Tracked<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
};

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

export const settled = (promise: Promise<unknown>) =>
  (promise as Tracked<unknown>).status !== 'pending';

export function useLoaded<T>(load: Promise<T> | undefined): T | undefined {
  const [, loaded] = useReducer((count: number) => count + 1, 0);
  const pending = load !== undefined && !settled(load);
  useEffect(() => {
    if (!load || !pending) return;
    let gone = false;
    const settle = () => {
      if (!gone) loaded();
    };
    load.then(settle, settle);
    return () => {
      gone = true;
    };
  }, [load, pending]);
  const tracked = load as Tracked<T> | undefined;
  return tracked?.status === 'fulfilled' ? tracked.value : undefined;
}
