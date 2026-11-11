'use client';

import { useCallback, useState } from 'react';
import { useLatest } from '../useLatest.js';

/**
 * A value the component's owner may control: `value` while it is given, else the component's own,
 * which starts at `defaultValue`. Only `undefined` leaves the value to the component; `null` is a
 * value the owner gives, such as no selection.
 *
 * Returns the value shown; `change`, which keeps a value people chose where the component keeps
 * its own and reports it to `onChange` either way (what people choose may leave out the owner's
 * none, as a radio group's options do), the same function across renders for contexts and effects
 * that hold it; and `keepOwn`, which keeps a value where the component keeps its own without
 * reporting it, such as its default after a form reset, and returns the value then shown; it
 * changes as `value` does, and may run during render.
 */
export function useControllableState<
  Value,
  Chosen extends Value = Value,
  Details extends unknown[] = [],
>({
  value,
  defaultValue,
  onChange,
}: {
  value: Value | undefined;
  defaultValue: Value;
  onChange: ((value: Chosen, ...details: Details) => void) | undefined;
}) {
  const [own, setOwn] = useState(defaultValue);
  const controlled = value !== undefined;
  const latest = useLatest({ controlled, onChange });
  const change = useCallback(
    (next: Chosen, ...details: Details) => {
      if (!latest.current.controlled) setOwn(next);
      latest.current.onChange?.(next, ...details);
    },
    [latest],
  );
  const keepOwn = useCallback(
    (next: Value): Value => {
      if (controlled) return value;
      setOwn(next);
      return next;
    },
    [controlled, value],
  );
  return [controlled ? value : own, change, keepOwn] as const;
}
