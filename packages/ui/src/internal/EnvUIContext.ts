'use client';

import { createContext, useContext, useMemo } from 'react';
import type { EnvUIMessages } from '../foundations/messages/defaultMessages.js';

/** A text direction. */
export type Direction = 'ltr' | 'rtl';

/** What EnvUIProvider gives the components inside it. */
export interface EnvUIContextValue {
  /** The BCP 47 locale for formatting; undefined for the runtime's. */
  locale?: string;
  /** The text direction for keyboard and placement logic; undefined for each element's own. */
  dir?: Direction;
  /** Overrides of the built-in strings, per namespace. */
  messages: Readonly<Record<string, Readonly<Record<string, unknown>> | undefined>>;
}

/** The provider's context; outside any provider, no locale, no direction and no overrides. */
export const EnvUIContext = createContext<EnvUIContextValue>({ messages: {} });

/** The nearest EnvUIProvider's value. */
export function useEnvUI(): EnvUIContextValue {
  return useContext(EnvUIContext);
}

/**
 * A component's strings: its namespace's English defaults with the nearest EnvUIProvider's
 * overrides of that namespace on top. An explicit prop, such as closeLabel, still wins over both;
 * the component applies it. The namespace is one of envUI's, and the defaults are its module's
 * English strings, which the component imports, so the strings it doesn't use stay out of a bundle.
 *
 *   const messages = useMessages('common', common);
 */
export function useMessages<Namespace extends keyof EnvUIMessages>(
  namespace: Namespace,
  defaults: EnvUIMessages[Namespace],
): EnvUIMessages[Namespace] {
  const overrides = useContext(EnvUIContext).messages[namespace];
  return useMemo(
    () => (overrides ? { ...defaults, ...overrides } : defaults),
    [defaults, overrides],
  );
}

/**
 * The locale of the nearest EnvUIProvider, for formatting in step with envUI, or undefined where no
 * provider sets one: the runtime's locale applies then.
 */
export function useLocale(): string | undefined {
  return useContext(EnvUIContext).locale;
}
