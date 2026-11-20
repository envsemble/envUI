'use client';

import { useRef, type CSSProperties, type InputHTMLAttributes, type Ref } from 'react';
import { useFieldMetadata } from '../internal/field/useFieldMetadata.js';
import { useRowControlNaming } from '../internal/field/RowControl.js';
import {
  FieldFrame,
  FieldLabelContent,
  type FieldProps,
  type FieldSizeProps,
  type TextFieldAffixProps,
  type TextFieldAppearanceProps,
  type TextFieldDecorationProps,
} from '../internal/field/FieldFrame.js';

/** A text field's look: outline or ghost. */
export type { FieldVariant as TextFieldVariant } from '../internal/field/FieldFrame.js';
import '../styles/Base.css';
import '../styles/TextField.css';

type NativeAttributesTheFieldRedefines = 'prefix' | 'size';

export interface TextFieldProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, NativeAttributesTheFieldRedefines>,
    FieldProps,
    TextFieldAppearanceProps,
    TextFieldDecorationProps,
    FieldSizeProps,
    TextFieldAffixProps {
  /** The native input, so that a form library can register it and focus it. */
  ref?: Ref<HTMLInputElement>;
  /** The field's class, on its root element, beside env-field and env-text-field. */
  className?: string;
  /** Styles of the field's root element, such as its width in a row. */
  style?: CSSProperties;
  /** Receives the value as people type, after the native onChange. */
  onValueChange?: (value: string) => void;
  /**
   * Receives the value once people finish editing it: on Enter, and when the field loses focus
   * with a value that changed since. With it, Esc puts back the value last committed. Return false
   * to reject the value, such as a port out of range: it stays in the field for people to correct,
   * and Esc still puts back the last value accepted. Use it for a setting that applies at once,
   * such as a port, rather than on every key.
   */
  onValueCommitted?: (value: string) => boolean | void;
}

function typeValue(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * A labelled single-line text input: a native input with its label above it, a description and an
 * error, at the control height in an outline or ghost look, with an optional start icon, end
 * action, prefix and suffix.
 */
export function TextField({
  ref,
  label,
  description,
  error,
  variant,
  startIcon,
  endAction,
  visibleLabel,
  size,
  prefix,
  suffix,
  id: suppliedId,
  className,
  style,
  onChange,
  onValueChange,
  onValueCommitted,
  onFocus,
  onBlur,
  onKeyDown,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: TextFieldProps) {
  const naming = useRowControlNaming({ label, ...props, 'aria-describedby': describedBy });
  const metadata = useFieldMetadata(
    suppliedId,
    description,
    error,
    naming['aria-describedby'] ?? describedBy,
    invalid,
  );
  const committed = useRef<string | null>(null);
  const rejected = useRef<string | null>(null);
  const commit = (input: HTMLInputElement) => {
    if (!onValueCommitted || input.value === committed.current) return;
    const value = input.value;
    if (onValueCommitted(value) === false) {
      rejected.current = value;
      return;
    }
    committed.current = value;
    rejected.current = null;
  };
  const { id } = metadata;
  const describedByIds =
    [
      prefix != null && `${id}-prefix`,
      suffix != null && `${id}-suffix`,
      metadata['aria-describedby'],
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <FieldFrame
      id={id}
      label={
        label != null ? (
          <label htmlFor={id} className="env-text-field-label">
            <FieldLabelContent>{label}</FieldLabelContent>
          </label>
        ) : null
      }
      description={description}
      error={error}
      controlBox
      variant={variant}
      startIcon={startIcon}
      endAction={endAction}
      visibleLabel={visibleLabel}
      size={size}
      prefix={prefix}
      suffix={suffix}
      className={className}
      style={style}
    >
      <input
        {...props}
        {...naming}
        ref={ref}
        {...metadata}
        aria-describedby={describedByIds}
        className="env-text-field-input"
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (event.currentTarget.value !== rejected.current) {
            committed.current = event.currentTarget.value;
          }
        }}
        onBlur={(event) => {
          onBlur?.(event);
          commit(event.currentTarget);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!onValueCommitted || event.defaultPrevented || event.nativeEvent.isComposing) return;
          const input = event.currentTarget;
          if (event.key === 'Enter') commit(input);
          if (
            event.key === 'Escape' &&
            committed.current !== null &&
            input.value !== committed.current
          ) {
            event.preventDefault();
            event.stopPropagation();
            typeValue(input, committed.current);
          }
        }}
      />
    </FieldFrame>
  );
}
