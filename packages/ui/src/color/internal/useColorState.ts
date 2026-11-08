'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeFormReset } from '../../forms/internal/subscribeFormReset.js';
import { sameColor, toColor, type ColorValue } from './colorValue.js';
import { useLatest } from '../../internal/useLatest.js';

/**
 * Keeps a controlled color's precision: while the application's value is the color the picker
 * last gave it, the picker keeps its own Color, which holds the hue of a gray and the exact place
 * of a drag; a value that differs, such as one the application rejected or replaced, wins.
 */
export function useColorState(
  value: ColorValue | undefined,
  defaultValue: ColorValue,
  alpha: boolean,
) {
  const [own, setOwn] = useState(() => toColor(value ?? defaultValue, alpha));
  const external = value === undefined ? undefined : toColor(value, alpha);
  const color = external && !sameColor(own, external) ? external : own;
  const reset = () => setOwn(toColor(defaultValue, alpha));
  return { color, setOwn, reset, controlled: value !== undefined };
}

/**
 * Runs `apply` after a native reset of the form the element submits with, unless it was
 * prevented, and says whether a reset is under way, while React Aria's fields restore their first
 * values, which the picker ignores.
 */
export function useFormResetOf(
  input: { current: HTMLInputElement | null },
  apply: () => void,
  form: string | undefined,
) {
  const resetting = useRef(false);
  const latest = useLatest(apply);
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner) return;
    const document = owner.ownerDocument;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Before the fields hear it: capture at the document runs before the form's own listeners.
    const mark = (event: Event) => {
      if (event.target !== owner) return;
      resetting.current = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        resetting.current = false;
      }, 0);
    };
    document.addEventListener('reset', mark, true);
    const unsubscribe = subscribeFormReset(owner, () => latest.current());
    return () => {
      document.removeEventListener('reset', mark, true);
      clearTimeout(timer);
      unsubscribe();
    };
  }, [input, form, latest]);
  return resetting;
}
