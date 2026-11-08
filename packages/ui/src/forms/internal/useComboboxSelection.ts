'use client';

import { useMemo, useState, type RefObject } from 'react';
import { useFormReset } from '../../internal/field/useFormReset.js';
import type { ComboboxItem } from './comboboxItems.js';
import type { ComboboxProps } from '../Combobox.js';

/** The chosen value as Base UI takes it: a list of values, one value, or none. */
export type ComboboxSelection = readonly string[] | string | null;

/**
 * A combobox's chosen value: the one it is given, or one the field keeps itself, which a native
 * form reset restores to the default; as Base UI takes it, a list of values for a field that takes
 * several. Returns it, the same as a list of values, and a function that keeps a new one where the
 * field keeps its own.
 */
export function useComboboxSelection<Item extends ComboboxItem>(
  props: ComboboxProps<Item>,
  nativeRef: RefObject<HTMLInputElement | null>,
) {
  const defaultSelection: ComboboxSelection = props.multiple
    ? [...(props.defaultValue ?? [])]
    : (props.defaultValue ?? null);
  const [uncontrolledValue, setUncontrolledValue] = useState<ComboboxSelection>(defaultSelection);
  const controlled = props.value !== undefined;
  const selection: ComboboxSelection = props.value === undefined ? uncontrolledValue : props.value;
  useFormReset(
    nativeRef,
    function applyReset() {
      if (!controlled) setUncontrolledValue(defaultSelection);
    },
    props.form,
  );
  // One array per selection, so the options known by value are rebuilt only when it changes.
  const selectedValues = useMemo(
    () => (typeof selection === 'string' ? [selection] : (selection ?? [])),
    [selection],
  );

  function keep(next: ComboboxSelection) {
    if (!controlled) setUncontrolledValue(next);
  }

  return { selection, selectedValues, keep };
}
