import { forwardRef, useRef, useState } from 'react';
import { Search } from '../icons/Search.js';
import { Close } from '../icons/Close.js';
import { IconButton } from '../actions/Button.js';
import { setRef } from '../internal/setRef.js';
import { Input, type InputProps } from './Input.js';

export interface SearchFieldProps
  extends Omit<
    InputProps,
    'type' | 'startIcon' | 'endAction' | 'label' | 'value' | 'defaultValue'
  > {
  /** Accessible name; shown as a floating label unless the field is compact. */
  label: string;
  value?: string;
  defaultValue?: string;
  /** Receives the next query, including an empty string when cleared. */
  onValueChange?: (value: string) => void;
  /** Accessible name of the clear action; defaults to "Clear search". */
  clearLabel?: string;
}

/** A search input with a leading icon and a clear action; compact by default to sit beside buttons. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    label,
    value,
    defaultValue = '',
    onValueChange,
    onChange,
    clearLabel = 'Clear search',
    compact = true,
    disabled,
    ...props
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const query = value ?? uncontrolledValue;
  function update(next: string) {
    if (value === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  }
  return (
    <Input
      {...props}
      ref={(node) => {
        inputRef.current = node;
        setRef(ref, node);
      }}
      type="search"
      label={label}
      compact={compact}
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
            variant="text"
            icon={<Close />}
            aria-label={clearLabel}
            title={clearLabel}
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
});
