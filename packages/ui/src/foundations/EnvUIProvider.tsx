'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useContext, useMemo, useState, type ReactNode } from 'react';
import { EnvUIContext, useLocale, type Direction } from '../internal/EnvUIContext.js';
import type { EnvUIMessages, EnvUIMessagesInput } from './messages/defaultMessages.js';
import '../styles/Base.css';

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
   * `{ dialog: { close: 'Schließen' }, toast: { hidden: ({ count }) => t('hidden', { count }) } }`.
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
  /** The application, or the part of it that takes these messages, locale and direction. */
  children?: ReactNode;
}

/** Whether two overrides have the same namespaces, each with the same messages. */
function sameMessages(a: EnvUIMessagesInput | undefined, b: EnvUIMessagesInput | undefined) {
  if (a === b) return true;
  if (!a || !b) return false;
  const shallow = (x: object | undefined, y: object | undefined) => {
    if (x === y) return true;
    if (!x || !y) return false;
    const keys = Object.keys(x);
    return (
      keys.length === Object.keys(y).length &&
      keys.every((key) => Object.is(x[key as keyof typeof x], y[key as keyof typeof y]))
    );
  };
  const namespaces = Object.keys(a) as (keyof EnvUIMessagesInput)[];
  return (
    namespaces.length === Object.keys(b).length &&
    namespaces.every((namespace) => shallow(a[namespace], b[namespace]))
  );
}

/**
 * The overrides as last given with the same messages: an object written inline in the provider's
 * props is a new one at each render, which would give every component inside a new context value.
 */
function useStableMessages(messages: EnvUIMessagesInput | undefined) {
  const [stable, setStable] = useState(messages);
  if (stable === messages || sameMessages(stable, messages)) return stable;
  setStable(messages);
  return messages;
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
export function EnvUIProvider({ locale, messages: given, dir, children }: EnvUIProviderProps) {
  const outer = useContext(EnvUIContext);
  const messages = useStableMessages(given);
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
