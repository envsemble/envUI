'use client';

import { useMemo, type RefObject } from 'react';
import { useFormReset } from '../../internal/field/useFormReset.js';
import { useControllableState } from '../../internal/react/useControllableState.js';
import type { ComboboxItem } from './comboboxItems.js';
import type { ComboboxProps } from '../Combobox.js';

export type ComboboxSelection = readonly string[] | string | null;

export function useComboboxSelection<Item extends ComboboxItem>(
  props: ComboboxProps<Item>,
  nativeRef: RefObject<HTMLInputElement | null>,
) {
  const defaultSelection: ComboboxSelection = props.multiple
    ? [...(props.defaultValue ?? [])]
    : (props.defaultValue ?? null);
  const [selection, choose, keepOwn] = useControllableState({
    value: props.value,
    defaultValue: defaultSelection,
    onChange: (next: ComboboxSelection, known: ReadonlyMap<string, Item>) => {
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
    },
  });
  useFormReset(nativeRef, () => keepOwn(defaultSelection), props.form);
  const { value, selectedValues } = useMemo(() => {
    if (typeof selection === 'string') return { value: selection, selectedValues: [selection] };
    if (selection === null) return { value: null, selectedValues: [] };
    const mutableListOncePerSelectionForBaseUi = [...selection];
    return {
      value: mutableListOncePerSelectionForBaseUi,
      selectedValues: mutableListOncePerSelectionForBaseUi,
    };
  }, [selection]);

  return { value, selectedValues, choose };
}
