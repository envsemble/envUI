'use client';

import type { CSSProperties, InputHTMLAttributes, Ref } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import {
  FieldFrame,
  isLabelShown,
  type FieldProps,
  type FieldSizeProps,
  type TextFieldAffixProps,
  type TextFieldAppearanceProps,
  type TextFieldDecorationProps,
} from './internal/FieldFrame.js';

// The prefix prop replaces the native RDFa attribute of the same name, and size the native width in
// characters: a field's width comes from its layout.
export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'>,
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
}

/**
 * A labelled single-line text input: a native input with a floating label, a description and an
 * error, at the control height in an outline or ghost look, or taller as the floating and underline
 * variants, with an optional start icon, end action, prefix and suffix.
 */
export function TextField({
  ref,
  label,
  description,
  error,
  variant,
  startIcon,
  endAction,
  showLabel,
  size,
  prefix,
  suffix,
  id: suppliedId,
  className,
  style,
  placeholder,
  onChange,
  onValueChange,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: TextFieldProps) {
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  // The prefix and suffix are read with the field, before its description and error.
  const describedByIds =
    [
      prefix != null && `${id}-prefix`,
      suffix != null && `${id}-suffix`,
      metadata['aria-describedby'],
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  // A floating label needs a blank placeholder to detect the empty state; hidden labels leave it.
  const fieldPlaceholder =
    label != null && isLabelShown({ showLabel }) ? placeholder || ' ' : placeholder;
  return (
    <FieldFrame
      id={id}
      label={label != null ? <label htmlFor={id}>{label}</label> : null}
      description={description}
      error={error}
      floatingLabel
      variant={variant}
      startIcon={startIcon}
      endAction={endAction}
      showLabel={showLabel}
      size={size}
      prefix={prefix}
      suffix={suffix}
      className={className}
      style={style}
    >
      <input
        {...props}
        ref={ref}
        {...metadata}
        aria-describedby={describedByIds}
        placeholder={fieldPlaceholder}
        className="env-text-field-input"
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
      />
    </FieldFrame>
  );
}
