'use client';

import { useEffect, type RefObject } from 'react';
import { useLatest } from '../../internal/useLatest.js';
import { subscribeFormReset } from './subscribeFormReset.js';

/**
 * Calls onReset once the browser has reset the form that owns the element, so a field restores
 * what the browser doesn't, such as the value it keeps itself. onReset reads the latest render's
 * props; `form`, the form attribute, finds the owner again as it changes.
 */
export function useFormReset(
  element: RefObject<{ form: HTMLFormElement | null } | null>,
  onReset: () => void,
  form: string | undefined,
) {
  const reset = useLatest(onReset);
  useEffect(() => {
    const owner = element.current?.form;
    if (!owner) return;
    return subscribeFormReset(owner, () => reset.current());
  }, [element, reset, form]);
}
