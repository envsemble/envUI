'use client';

import { useState, type RefObject } from 'react';
import type { ComboboxItem, ComboboxProps } from '../Combobox.js';
import { standIn } from './comboboxItems.js';
import { useFormReset } from './useFormReset.js';

type Selection = readonly string[] | string | null;

/**
 * A combobox's chosen value: the one it is given, or one it keeps itself, which a native form reset
 * restores to the default. Returns it as Base UI takes it, as a list of values, and a function that
 * takes a value people chose: it keeps it, where the field keeps its own, and reports it with its
 * options.
 */
export function useComboboxSelection<Item extends ComboboxItem>({
  multiple,
  value,
  defaultValue,
  onValueChange,
  nativeRef,
  form,
}: Pick<ComboboxProps<Item>, 'value' | 'defaultValue' | 'onValueChange' | 'form'> & {
  multiple: boolean;
  /** The hidden input Base UI submits, whose form resets the field. */
  nativeRef: RefObject<HTMLInputElement | null>;
}) {
  const defaultSelection: Selection = multiple
    ? [...((defaultValue as readonly string[] | undefined) ?? [])]
    : ((defaultValue as string | null | undefined) ?? null);
  const [uncontrolledValue, setUncontrolledValue] = useState<Selection>(defaultSelection);
  const controlled = value !== undefined;
  const selection = controlled ? (multiple ? value : (value ?? null)) : uncontrolledValue;

  useFormReset(
    nativeRef,
    function applyReset() {
      if (!controlled) setUncontrolledValue(defaultSelection);
    },
    form,
  );

  /** Keeps and reports a value people chose, with the options known by value. */
  function choose(next: Selection, known: ReadonlyMap<string, Item>) {
    if (!controlled) setUncontrolledValue(next);
    // The props are a union on multiple, which the field has already told apart.
    if (multiple) {
      const values = [...((next as readonly string[] | null) ?? [])];
      (onValueChange as ((value: string[], items: Item[]) => void) | undefined)?.(
        values,
        values.map((selected) => known.get(selected) ?? standIn<Item>(selected)),
      );
    } else {
      const single = (next as string | null) ?? null;
      (onValueChange as ((value: string | null, item: Item | null) => void) | undefined)?.(
        single,
        single == null ? null : (known.get(single) ?? null),
      );
    }
  }

  return {
    selection,
    selectedValues: (Array.isArray(selection)
      ? selection
      : selection == null
        ? []
        : [selection]) as readonly string[],
    choose,
  };
}
