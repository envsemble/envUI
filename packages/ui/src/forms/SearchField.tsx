'use client';

import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { IconSearch } from '../icons/Search.js';
import { IconClose } from '../icons/Close.js';
import { IconButton } from '../actions/Button.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { searchField as searchFieldMessages } from '../foundations/messages/searchField.js';
import { TextField, type TextFieldProps } from './TextField.js';
import { useFormReset } from '../internal/field/useFormReset.js';

function keepEscapeFromEnclosingDialog(event: KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export interface SearchFieldProps extends Omit<
  TextFieldProps,
  'type' | 'startIcon' | 'label' | 'visibleLabel' | 'value' | 'defaultValue' | 'onValueChange'
> {
  /**
   * The field's accessible name, such as Search members: text, or any content, such as an icon
   * beside the text. It shows above the field only with showLabel; otherwise a placeholder gives the
   * visible guidance.
   */
  label: ReactNode;
  /**
   * A control at the end of the field, after the clear button, such as an IconButton that opens
   * filters, or a quiet hint such as a shortcut's Kbd; name a control with aria-label. A button that
   * sets no variant takes ghost here.
   */
  endAction?: ReactNode;
  /**
   * Show the label in the field, as TextField does. A search field leaves it out, so that it sits
   * in a toolbar with a placeholder such as Search.
   * @default false
   */
  showLabel?: boolean;
  /** The query of a controlled field; update it from onValueChange. */
  value?: string;
  /** The query an uncontrolled field starts with, and that a form reset restores. */
  defaultValue?: string;
  /**
   * Receives the next query as people type, and an empty string when the clear button or Esc
   * clears it.
   */
  onValueChange?: (value: string) => void;
  /**
   * The accessible name and tooltip of the clear button.
   * @default 'Clear search', or EnvUIProvider's messages.searchField.clear
   */
  clearLabel?: string;
  /**
   * The visible guidance while the field is empty, such as Search members. With the label hidden it
   * shows Search unless it is set.
   * @default 'Search' while the label is hidden, or EnvUIProvider's messages.searchField.placeholder
   */
  placeholder?: string;
}

/**
 * A search input with a search icon and, while it has a query, a clear button; Esc also clears.
 * Its label is hidden by default, so it sits beside buttons with a placeholder.
 */
export function SearchField({
  ref,
  label,
  value,
  defaultValue = '',
  onValueChange,
  onChange,
  clearLabel,
  showLabel = false,
  placeholder,
  disabled,
  endAction,
  style,
  ...props
}: SearchFieldProps) {
  const messages = useMessages('searchField', searchFieldMessages);
  const clearName = clearLabel ?? messages.clear;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, update, keepOwn] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  useFormReset(
    inputRef,
    function restoreDefaultQueryOverNativeReset() {
      keepOwn(defaultValue);
    },
    props.form,
  );
  const clearButton = query ? (
    <IconButton
      variant="ghost"
      icon={<IconClose />}
      aria-label={clearName}
      title={clearName}
      disabled={disabled}
      onClick={() => {
        update('');
        inputRef.current?.focus();
      }}
    />
  ) : null;
  const endActions = (clearButton ? 1 : 0) + (endAction != null ? 1 : 0);
  return (
    <TextField
      {...props}
      style={
        endActions > 1
          ? ({ '--_text-field-end-actions': endActions, ...style } as CSSProperties)
          : style
      }
      ref={mergeRefs(inputRef, ref)}
      type="search"
      label={label}
      visibleLabel={showLabel}
      placeholder={placeholder ?? (showLabel ? undefined : messages.placeholder)}
      disabled={disabled}
      value={query}
      onChange={(event) => {
        onChange?.(event);
        update(event.currentTarget.value);
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.key === 'Escape' && query && !event.defaultPrevented) {
          keepEscapeFromEnclosingDialog(event);
          update('');
        }
      }}
      startIcon={<IconSearch />}
      endAction={
        endActions > 0 ? (
          <>
            {clearButton}
            {endAction}
          </>
        ) : undefined
      }
    />
  );
}
