'use client';

import { useMemo, useState, type RefObject } from 'react';
import { useFormReset } from '../../internal/field/useFormReset.js';
import type { ComboboxItem } from './comboboxItems.js';
import type { ComboboxProps } from '../Combobox.js';

/** The chosen value as Base UI takes and reports it: a list of values, one value, or none. */
export type ComboboxSelection = readonly string[] | string | null;

/**
 * A combobox's chosen value: the one it is given, or one the field keeps itself, which a native
 * form reset restores to the default. Returns it as Base UI takes it (`value`, a list of values for
 * a field that takes several), the same as a list of values, and `choose`, which keeps a value
 * people chose where the field keeps its own and reports it, as one value or several, with the
 * options `known` by value.
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
  // Base UI's value type takes a mutable list, and the options known by value are rebuilt only as
  // the list changes: both once per selection.
  const { value, selectedValues } = useMemo(() => {
    if (typeof selection === 'string') return { value: selection, selectedValues: [selection] };
    if (selection === null) return { value: null, selectedValues: [] };
    const values = [...selection];
    return { value: values, selectedValues: values };
  }, [selection]);

  function choose(next: ComboboxSelection, known: ReadonlyMap<string, Item>) {
    if (!controlled) setUncontrolledValue(next);
    if (props.multiple) {
      const values = typeof next === 'string' ? [next] : [...(next ?? [])];
      props.onValueChange?.(
        values,
        values.map((chosen) => known.get(chosen) ?? { value: chosen, label: chosen }),
      );
    } else {
      const single = typeof next === 'string' ? next : null;
      props.onValueChange?.(single, single === null ? null : (known.get(single) ?? null));
    }
  }

  return { value, selectedValues, choose };
}
