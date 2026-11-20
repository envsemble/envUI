'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useFormReset } from '../../../internal/field/useFormReset.js';

/**
 * useFormReset, and whether the owning form is resetting: true from its reset event, while the
 * browser restores the native fields, until onReset runs, so a change the restore reports is told
 * apart from one people make.
 */
export function useFormResetting(
  element: RefObject<{ form: HTMLFormElement | null } | null>,
  onReset: () => void,
  form: string | undefined,
) {
  const resetting = useRef(false);
  useFormReset(element, onReset, form);
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
    return () => {
      document.removeEventListener(
        'reset',
        markResetBeforeFieldsRestore,
        captureBeforeFormListeners,
      );
      clearTimeout(timer);
    };
  }, [element, form]);
  return resetting;
}
