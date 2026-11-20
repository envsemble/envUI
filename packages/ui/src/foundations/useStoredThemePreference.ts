'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { ThemePreference } from './themeBootstrap.js';
import type { ThemeStorageOptions } from './themeStorage.js';
import { defaultThemeStorageKey, isThemePreference } from './internal/storedPreference.js';

/** What useStoredThemePreference returns, to spread on ThemePreferenceProvider. */
export interface StoredThemePreference {
  /** The stored preference, or the default while nothing is stored. */
  preference: ThemePreference;
  /** Stores a preference. */
  onPreferenceChange: (preference: ThemePreference) => void;
}

const listeners = new Set<() => void>();
const keptWhereStorageIsBlocked = new Map<string, ThemePreference>();

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function changedInStorage(event: StorageEvent) {
  try {
    if (event.storageArea !== window.localStorage) return;
  } catch {
    return;
  }
  if (event.key === null) keptWhereStorageIsBlocked.clear();
  else keptWhereStorageIsBlocked.delete(event.key);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', changedInStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', changedInStorage);
  };
}

/**
 * Keeps the theme preference in localStorage, follows a choice made in another window of the
 * same origin, and keeps a choice for the page's life where storage is blocked. Spread what it
 * returns on ThemePreferenceProvider, and give createStoredThemeBootstrapScript the same options.
 * On the server and while the page hydrates it returns the default, as the server rendered it.
 */
export function useStoredThemePreference({
  storageKey = defaultThemeStorageKey,
  defaultPreference = 'system',
}: ThemeStorageOptions = {}): StoredThemePreference {
  const read = useCallback(() => {
    const kept = keptWhereStorageIsBlocked.get(storageKey);
    if (kept !== undefined) return kept;
    const stored = readStorage(storageKey);
    return isThemePreference(stored) ? stored : defaultPreference;
  }, [storageKey, defaultPreference]);
  const preference = useSyncExternalStore(subscribe, read, () => defaultPreference);
  const onPreferenceChange = useCallback(
    (next: ThemePreference) => {
      if (writeStorage(storageKey, next)) keptWhereStorageIsBlocked.delete(storageKey);
      else keptWhereStorageIsBlocked.set(storageKey, next);
      for (const listener of listeners) listener();
    },
    [storageKey],
  );
  return useMemo(() => ({ preference, onPreferenceChange }), [preference, onPreferenceChange]);
}
