'use client';

import { useSyncExternalStore } from 'react';

interface ChromiumOnlyEyeDropper {
  new (): { open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }> };
}

const browserEyeDropper = () =>
  (globalThis as { EyeDropper?: ChromiumOnlyEyeDropper }).EyeDropper ?? null;

const supportNeverChanges = () => () => {};
const unsupportedWhileHydrating = () => false;

export function useEyeDropper(): (() => Promise<string | null>) | null {
  const supported = useSyncExternalStore(
    supportNeverChanges,
    () => browserEyeDropper() !== null,
    unsupportedWhileHydrating,
  );
  if (!supported) return null;
  return async () => {
    const EyeDropper = browserEyeDropper();
    if (!EyeDropper) return null;
    try {
      return (await new EyeDropper().open()).sRGBHex;
    } catch {
      return null;
    }
  };
}
