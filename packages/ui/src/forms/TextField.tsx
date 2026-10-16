'use client';

import { forwardRef } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import type { InputHTMLAttributes } from 'react';
import { classNames } from '../internal/classNames.js';
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
    TextFieldAffixProps {}

/**
 * A labelled single-line text input: a native input with a floating label, a hint and an error, at
 * the control height in an outlined or quiet look, or taller as the floating and plain variants,
 * with an optional start icon, end action, prefix and suffix.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hint,
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
    placeholder,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    ...props
  },
  ref,
) {
  const metadata = useFieldMetadata(suppliedId, hint, error, describedBy, invalid);
  const { id } = metadata;
  // The prefix and suffix are read with the field, before its hint and error.
  const description =
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
      hint={hint}
      error={error}
      floatingLabel
      variant={variant}
      startIcon={startIcon}
      endAction={endAction}
      showLabel={showLabel}
      size={size}
      prefix={prefix}
      suffix={suffix}
    >
      <input
        {...props}
        ref={ref}
        {...metadata}
        aria-describedby={description}
        placeholder={fieldPlaceholder}
        className={classNames('env-text-input', className)}
      />
    </FieldFrame>
  );
});
