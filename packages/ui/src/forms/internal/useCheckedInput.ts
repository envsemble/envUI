'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import { useFormReset } from '../../internal/field/useFormReset.js';

export type CheckboxState = boolean | 'mixed';
export interface CheckedProps<State extends CheckboxState> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked'
> {
  label?: ReactNode;
  checked?: State;
  defaultChecked?: State;
  onCheckedChange?: (checked: boolean) => void;
}

export function useCheckedInput<State extends CheckboxState>(
  checked: State | undefined,
  defaultChecked: State,
  onCheckedChange: ((checked: boolean) => void) | undefined,
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange'],
  formId: string | undefined,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledChecked, setUncontrolledChecked] = useState<CheckboxState>(defaultChecked);
  const checkedState = checked ?? uncontrolledChecked;
  useEffect(
    function synchronizeInput() {
      if (inputRef.current) {
        inputRef.current.indeterminate = checkedState === 'mixed';
        inputRef.current.defaultChecked = defaultChecked === true;
        inputRef.current.checked = checkedState === true;
      }
    },
    [checkedState, defaultChecked],
  );
  useFormReset(
    inputRef,
    function applyReset() {
      const input = inputRef.current;
      const resetState = checked ?? defaultChecked;
      if (checked === undefined) setUncontrolledChecked(resetState);
      if (!input) return;
      input.checked = resetState === true;
      input.indeterminate = resetState === 'mixed';
    },
    formId,
  );
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextChecked = event.currentTarget.checked;
    if (checked === undefined) setUncontrolledChecked(nextChecked);
    else event.currentTarget.indeterminate = checkedState === 'mixed';
    onChange?.(event);
    onCheckedChange?.(nextChecked);
  }
  return { inputRef, checkedState, handleChange };
}
