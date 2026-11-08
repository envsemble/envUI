'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * The modal surfaces open in each portal container: Dialog, Sheet, ConfirmDialog and
 * CommandPalette count themselves through their backdrop while it is mounted, so toasts in the same
 * container wait until the last one has closed rather than covering its actions. The document's body
 * is the undefined container.
 */
const open = new Map<HTMLElement | undefined, number>();
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
    // A container that is still mounting holds no overlays yet.
    if (container === null) return;
    open.set(container, (open.get(container) ?? 0) + 1);
    notify();
    return () => {
      const count = (open.get(container) ?? 1) - 1;
      if (count > 0) open.set(container, count);
      else open.delete(container);
      notify();
    };
  }, [container]);
}

/** Whether a modal surface is open in the container. */
export function useModalOpen(container: HTMLElement | null | undefined) {
  return useSyncExternalStore(
    subscribe,
    () => container !== null && open.has(container),
    () => false,
  );
}
