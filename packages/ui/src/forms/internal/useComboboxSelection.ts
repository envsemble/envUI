'use client';

import { useState, type RefObject } from 'react';
import { useFormReset } from './useFormReset.js';

/**
 * A combobox's chosen value: the one it is given, or one it keeps itself, which a native form reset
 * restores to the default. Returns it as Base UI takes it, and as a list of values.
 */
export function useComboboxSelection({
  multiple,
  value,
  defaultValue,
  nativeRef,
  form,
}: {
  multiple: boolean;
  value: readonly string[] | string | null | undefined;
  defaultValue: readonly string[] | string | null | undefined;
  /** The hidden input Base UI submits, whose form resets the field. */
  nativeRef: RefObject<HTMLInputElement | null>;
  form: string | undefined;
}) {
  const defaultSelection = multiple
    ? [...((defaultValue as readonly string[] | undefined) ?? [])]
    : ((defaultValue as string | null | undefined) ?? null);
  const [uncontrolledValue, setUncontrolledValue] = useState<readonly string[] | string | null>(
    defaultSelection,
  );
  const controlled = value !== undefined;
  const selection = controlled ? (multiple ? value : (value ?? null)) : uncontrolledValue;

  useFormReset(
    nativeRef,
    function applyReset() {
      if (!controlled) setUncontrolledValue(defaultSelection);
    },
    form,
  );

  return {
    selection,
    selectedValues: (Array.isArray(selection)
      ? selection
      : selection == null
        ? []
        : [selection]) as readonly string[],
    /** Keeps a value people chose, where the field keeps its own. */
    keep: (next: readonly string[] | string | null) => {
      if (!controlled) setUncontrolledValue(next);
    },
  };
}
