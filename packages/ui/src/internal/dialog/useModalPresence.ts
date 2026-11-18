'use client';

import { useEffect, useSyncExternalStore } from 'react';

const openModalsPerContainer = new Map<HTMLElement | undefined, number>();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Counts a modal surface open in its container while the calling component is mounted. */
export function useModalPresence(container: HTMLElement | null | undefined) {
  useEffect(() => {
    if (container === null) return;
    openModalsPerContainer.set(container, (openModalsPerContainer.get(container) ?? 0) + 1);
    notify();
    return () => {
      const count = (openModalsPerContainer.get(container) ?? 1) - 1;
      if (count > 0) openModalsPerContainer.set(container, count);
      else openModalsPerContainer.delete(container);
      notify();
    };
  }, [container]);
}

/** Whether a modal surface is open in the container. */
export function useModalOpen(container: HTMLElement | null | undefined) {
  return useSyncExternalStore(
    subscribe,
    () => container !== null && openModalsPerContainer.has(container),
    () => false,
  );
}
