'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useRef, type ComponentPropsWithoutRef, type Ref, type RefObject } from 'react';
import { setRef } from '../../internal/setRef.js';

/**
 * A Combobox's text input. Focusing it while it shows the chosen option's label selects the label,
 * so typing replaces it with a query; a press keeps that selection rather than placing the caret.
 */
export function ComboboxInput({
  ref,
  inputRef,
  chosenLabel,
  ...inputProps
}: ComponentPropsWithoutRef<typeof BaseCombobox.Input> & {
  /** The application's ref to the input. */
  ref: Ref<HTMLInputElement> | undefined;
  /** The field's own ref to the input. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** The label that focus selects: a single, editable field's chosen option's, else undefined. */
  chosenLabel: string | undefined;
}) {
  // Whether the press now under way focused the input, rather than finding it focused.
  const pressFocus = useRef(false);
  const showsLabel = (input: HTMLInputElement) =>
    chosenLabel !== undefined && input.value === chosenLabel;

  return (
    <BaseCombobox.Input
      {...inputProps}
      ref={(node: HTMLInputElement | null) => {
        inputRef.current = node;
        setRef(ref, node);
      }}
      onPointerDown={(event) => {
        inputProps.onPointerDown?.(event);
        pressFocus.current =
          event.currentTarget.ownerDocument.activeElement !== event.currentTarget;
      }}
      onFocus={(event) => {
        inputProps.onFocus?.(event);
        if (showsLabel(event.currentTarget)) event.currentTarget.select();
      }}
      onMouseUp={(event) => {
        inputProps.onMouseUp?.(event);
        if (pressFocus.current && showsLabel(event.currentTarget)) event.preventDefault();
        pressFocus.current = false;
      }}
      className="env-text-field-input env-combobox-input"
    />
  );
}
