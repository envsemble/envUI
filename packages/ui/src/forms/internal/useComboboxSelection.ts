'use client';

import type { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useState, type RefObject } from 'react';
import type { ComboboxItem, ComboboxProps } from '../Combobox.js';
import { standIn } from './comboboxItems.js';
import { useFormReset } from './useFormReset.js';

type Selection = readonly string[] | string | null;

/**
 * A combobox's chosen value: the one it is given, or one it keeps itself, which a native form reset
 * restores to the default. Returns it as Base UI takes it, as a list of values, and the handler for
 * Base UI's value changes: it keeps a value people chose, where the field keeps its own, and reports
 * it with its options.
 */
export function useComboboxSelection<Item extends ComboboxItem>({
  multiple,
  value,
  defaultValue,
  onValueChange,
  nativeRef,
  form,
  clearable,
  popupOpen,
  changeOpen,
}: Pick<ComboboxProps<Item>, 'value' | 'defaultValue' | 'onValueChange' | 'form'> & {
  multiple: boolean;
  /** The hidden input Base UI submits, whose form resets the field. */
  nativeRef: RefObject<HTMLInputElement | null>;
  clearable: boolean;
  popupOpen: boolean;
  /** Opens or closes the popup, and says why. */
  changeOpen: (open: boolean, reason: string) => void;
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

  const selectedValues = (
    Array.isArray(selection) ? selection : selection == null ? [] : [selection]
  ) as readonly string[];

  /** Base UI's value change, with the options known by value. */
  function handleValueChange(
    next: Selection,
    details: BaseCombobox.Root.ChangeEventDetails,
    known: ReadonlyMap<string, Item>,
  ) {
    if (details.isCanceled) return;
    // Esc and emptying the text clear only a clearable single field that has a value. They keep
    // the value otherwise, and Esc never removes chips, which go one at a time or with the clear
    // button; Esc then goes on, such as to close a dialog.
    const escape = details.reason === 'escape-key';
    const clearing = escape || (!multiple && details.reason === 'input-clear');
    if (clearing && (!clearable || selectedValues.length === 0 || (multiple && escape))) {
      details.cancel();
      details.allowPropagation();
      // Emptied text shows every option to choose another; closing the popup restores the label.
      if (details.reason === 'input-clear' && !popupOpen) changeOpen(true, details.reason);
      return;
    }
    choose(next, known);
  }

  return { selection, selectedValues, handleValueChange };
}
