'use client';

import { useLocale } from './EnvUIContext.js';
import { useHydrated } from '../react/useHydrated.js';

/**
 * The locale the server and the first client render format with when no EnvUIProvider sets one:
 * the runtime's locale is unknown on the server, so output that depends on it waits for hydration
 * and starts from this fixed one, which keeps server and client markup equal.
 */
const defaultServerLocale = 'en-GB';

/**
 * The locale a component formats in: the `locale` it is given, else the nearest EnvUIProvider's,
 * else the runtime's once hydrated. Until then, the server and the first client render use
 * defaultServerLocale, so their markup is equal.
 */
export function useResolvedLocale(own?: string): string | undefined {
  const provided = useLocale();
  const hydrated = useHydrated();
  return own ?? provided ?? (hydrated ? undefined : defaultServerLocale);
}
