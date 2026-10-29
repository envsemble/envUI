'use client';

import type { CSSProperties, Ref } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import { TextareaControl, type TextareaControlProps } from './internal/TextareaControl.js';
import { FieldFrame, type FieldProps } from './internal/FieldFrame.js';

export interface TextareaProps extends TextareaControlProps, FieldProps {
  /** The native text area, so that a form library can register it and focus it. */
  ref?: Ref<HTMLTextAreaElement>;
  /** The field's class, on its root element, beside env-field and env-text-field. */
  className?: string;
  /** Styles of the field's root element, such as its width in a row. */
  style?: CSSProperties;
  /**
   * The field's look, as TextField's: outline or ghost. A text area is always tall, with
   * its label resting at the top, so it has no floating variant.
   * @default 'outline'
   */
  variant?: 'outline' | 'ghost';
  /** Receives the text as people type, after the native onChange. */
  onValueChange?: (value: string) => void;
}

/**
 * A labelled text area for text over several lines: a native textarea in the text field's frame,
 * at a fixed height that scrolls and resizes from its bottom edge, or growing with its content.
 */
export function Textarea({
  ref,
  label,
  description,
  error,
  variant,
  id: suppliedId,
  className,
  style,
  placeholder,
  onChange,
  onValueChange,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: TextareaProps) {
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  return (
    <FieldFrame
      id={id}
      label={
        label != null ? (
          <label htmlFor={id} className="env-text-field-label">
            {label}
          </label>
        ) : null
      }
      description={description}
      error={error}
      floatingLabel
      multiline
      variant={variant}
      className={className}
      style={style}
    >
      <TextareaControl
        {...props}
        ref={ref}
        {...metadata}
        placeholder={label != null ? placeholder || ' ' : placeholder}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
      />
    </FieldFrame>
  );
}
