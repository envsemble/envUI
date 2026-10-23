'use client';

import { useSyncExternalStore } from 'react';

/** The browser's EyeDropper, where it has one: Chromium-based browsers on the desktop. */
interface EyeDropperConstructor {
  new (): { open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }> };
}

const eyeDropper = () => (globalThis as { EyeDropper?: EyeDropperConstructor }).EyeDropper ?? null;

const subscribe = () => () => {};

/**
 * Opens the browser's eyedropper and resolves to the color picked as #rrggbb, or null when people
 * press Escape. The function is null where the browser has no eyedropper, and on the server and
 * the first render in the browser, so their markup is equal.
 */
export function useEyeDropper(): (() => Promise<string | null>) | null {
  const supported = useSyncExternalStore(
    subscribe,
    () => eyeDropper() !== null,
    () => false,
  );
  if (!supported) return null;
  return async () => {
    const EyeDropper = eyeDropper();
    if (!EyeDropper) return null;
    try {
      return (await new EyeDropper().open()).sRGBHex;
    } catch {
      return null;
    }
  };
}
