'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useLatest } from '../react/useLatest.js';
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
  const resetting = useRef(false);
  const reset = useLatest(onReset);
  useEffect(() => {
    const owner = element.current?.form;
    if (!owner) return;
    const document = owner.ownerDocument;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const captureBeforeFormListeners = true;
    const markResetBeforeFieldsRestore = (event: Event) => {
      if (event.target !== owner) return;
      resetting.current = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        resetting.current = false;
      }, 0);
    };
    document.addEventListener('reset', markResetBeforeFieldsRestore, captureBeforeFormListeners);
    const unsubscribe = subscribeFormReset(owner, () => reset.current());
    return () => {
      document.removeEventListener(
        'reset',
        markResetBeforeFieldsRestore,
        captureBeforeFormListeners,
      );
      clearTimeout(timer);
      unsubscribe();
    };
  }, [element, reset, form]);
  return resetting;
}
