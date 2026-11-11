'use client';

import { useEffect, useRef } from 'react';
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import { useFormReset } from '../../internal/field/useFormReset.js';
import { useControllableState } from '../../internal/react/useControllableState.js';

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
  const [checkedState, setChecked, keepOwn] = useControllableState<CheckboxState, boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
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
      const resetState = keepOwn(defaultChecked);
      if (!input) return;
      input.checked = resetState === true;
      input.indeterminate = resetState === 'mixed';
    },
    formId,
  );
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextChecked = event.currentTarget.checked;
    if (checked !== undefined) event.currentTarget.indeterminate = checkedState === 'mixed';
    onChange?.(event);
    setChecked(nextChecked);
  }
  return { inputRef, checkedState, handleChange };
}
