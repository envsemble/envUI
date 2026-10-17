'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from '../icons/Search.js';
import { Close } from '../icons/Close.js';
import { IconButton } from '../actions/Button.js';
import { setRef } from '../internal/setRef.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { searchField as searchFieldMessages } from '../foundations/messages/searchField.js';
import { TextField, type TextFieldProps } from './TextField.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

export interface SearchFieldProps
  extends Omit<
    TextFieldProps,
    'type' | 'startIcon' | 'endAction' | 'label' | 'value' | 'defaultValue' | 'onValueChange'
  > {
  /**
   * The field's accessible name, such as Search members. It shows as a floating label only with
   * showLabel; otherwise a placeholder gives the visible guidance.
   */
  label: string;
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
  disabled,
  ...props
}: SearchFieldProps) {
  const messages = useMessages('searchField', searchFieldMessages);
  const clearName = clearLabel ?? messages.clear;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const query = value ?? uncontrolledValue;
  // The field renders its query itself, so a form reset, which resets only the native input,
  // restores an uncontrolled field's default query here.
  useEffect(() => {
    const input = inputRef.current;
    if (!input?.form || value !== undefined) return;
    return subscribeFormReset(input.form, () => setUncontrolledValue(defaultValue));
  }, [value, defaultValue, props.form]);
  function update(next: string) {
    if (value === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  }
  return (
    <TextField
      {...props}
      ref={(node) => {
        inputRef.current = node;
        setRef(ref, node);
      }}
      type="search"
      label={label}
      showLabel={showLabel}
      disabled={disabled}
      value={query}
      onChange={(event) => {
        onChange?.(event);
        update(event.currentTarget.value);
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.key === 'Escape' && query && !event.defaultPrevented) {
          // Clearing consumes Escape, so an enclosing dialog stays open.
          event.preventDefault();
          event.stopPropagation();
          update('');
        }
      }}
      startIcon={<Search />}
      endAction={
        query ? (
          <IconButton
            variant="ghost"
            icon={<Close />}
            aria-label={clearName}
            title={clearName}
            disabled={disabled}
            onClick={() => {
              update('');
              inputRef.current?.focus();
            }}
          />
        ) : undefined
      }
    />
  );
}
