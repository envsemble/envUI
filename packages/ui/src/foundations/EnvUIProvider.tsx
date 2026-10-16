'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useContext, useMemo, type ReactNode } from 'react';
import { EnvUIContext, useLocale, type Direction } from '../internal/EnvUIContext.js';
import type { EnvUIMessages, EnvUIMessagesInput } from './messages/defaultMessages.js';

export type { EnvUIMessages, EnvUIMessagesInput };

export interface EnvUIProviderProps {
  /**
   * The BCP 47 locale envUI formats numbers, dates and relative times in, and reads plural rules,
   * collation and the week's first day from, such as de-CH. Without it, the runtime's locale, from
   * the browser once the page has hydrated.
   */
  locale?: string;
  /**
   * Overrides of envUI's built-in English strings, per namespace, such as
   * `{ common: { close: 'Schließen' }, toast: { hidden: ({ count }) => t('hidden', { count }) } }`.
   * A message is a string, or a function of the values it names. Nested providers merge per
   * namespace, the inner winning; a component's own label prop, such as closeLabel, wins over both.
   */
  messages?: EnvUIMessagesInput;
  /**
   * The text direction for keyboard and placement logic, such as which arrow key moves forward and
   * which side a popup's start is. Without it, each component reads the direction at its element,
   * from dir attributes and CSS. It doesn't set the dir attribute: set that on the page or region.
   */
  dir?: Direction;
  children?: ReactNode;
}

/** Merges inner overrides over outer ones, namespace by namespace. */
function mergeMessages(
  outer: Readonly<Record<string, Readonly<Record<string, unknown>> | undefined>>,
  inner: EnvUIMessagesInput | undefined,
) {
  if (!inner) return outer;
  const merged: Record<string, Readonly<Record<string, unknown>> | undefined> = { ...outer };
  for (const [namespace, overrides] of Object.entries(inner))
    if (overrides) merged[namespace] = { ...outer[namespace], ...overrides };
  return merged;
}

/**
 * Sets the locale, the strings and the text direction of the envUI components inside it. envUI works
 * without it, in English, in the runtime's locale and in each element's direction; an application
 * that translates or formats for its people wraps itself, or a region, in one.
 */
export function EnvUIProvider({ locale, messages, dir, children }: EnvUIProviderProps) {
  const outer = useContext(EnvUIContext);
  const value = useMemo(
    () => ({
      locale: locale ?? outer.locale,
      dir: dir ?? outer.dir,
      messages: mergeMessages(outer.messages, messages),
    }),
    [locale, dir, messages, outer],
  );
  const provided = <EnvUIContext value={value}>{children}</EnvUIContext>;
  return dir ? <DirectionProvider direction={dir}>{provided}</DirectionProvider> : provided;
}

export { useLocale };
