'use client';

import type { CSSProperties, InputHTMLAttributes, Ref } from 'react';
import { useFieldMetadata } from '../internal/field/useFieldMetadata.js';
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
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: TextFieldProps) {
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
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
        ref={ref}
        {...metadata}
        aria-describedby={describedByIds}
        className="env-text-field-input"
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
      />
    </FieldFrame>
  );
}
