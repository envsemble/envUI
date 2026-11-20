'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeFormReset } from '../../../internal/field/subscribeFormReset.js';
import { sameColor, toColor, type ColorValue } from './colorValue.js';
import { useLatest } from '../../../internal/react/useLatest.js';

export function useColorState(
  value: ColorValue | undefined,
  defaultValue: ColorValue,
  alpha: boolean,
) {
  const [own, setOwn] = useState(() => toColor(value ?? defaultValue, alpha));
  const external = value === undefined ? undefined : toColor(value, alpha);
  const applicationReplacedColor = external !== undefined && !sameColor(own, external);
  const color = applicationReplacedColor ? external : own;
  const reset = () => setOwn(toColor(defaultValue, alpha));
  return { color, setOwn, reset, controlled: value !== undefined };
}

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
    const unsubscribe = subscribeFormReset(owner, () => latest.current());
    return () => {
      document.removeEventListener(
        'reset',
        markResetBeforeFieldsRestore,
        captureBeforeFormListeners,
      );
      clearTimeout(timer);
      unsubscribe();
    };
  }, [input, form, latest]);
  return resetting;
}
