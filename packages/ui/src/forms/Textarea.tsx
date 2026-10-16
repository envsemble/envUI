'use client';

import { forwardRef } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import { TextareaControl, type TextareaControlProps } from './internal/TextareaControl.js';
import {
  FieldFrame,
  type FieldProps,
  type TextFieldAppearanceProps,
} from './internal/FieldFrame.js';

export interface TextareaProps extends TextareaControlProps, FieldProps {
  /**
   * The field's look, as TextField's: outlined, plain or quiet. A text area is always tall, with its
   * label resting at the top, so it has no floating variant.
   * @default 'outlined'
   */
  variant?: Exclude<TextFieldAppearanceProps['variant'], 'floating'>;
}

/**
 * A labelled text area for text over several lines: a native textarea in the text field's frame,
 * at a fixed height that scrolls and resizes from its bottom edge, or growing with its content.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    variant,
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
  return (
    <FieldFrame
      id={id}
      label={label != null ? <label htmlFor={id}>{label}</label> : null}
      hint={hint}
      error={error}
      floatingLabel
      multiline
      variant={variant}
    >
      <TextareaControl
        {...props}
        ref={ref}
        {...metadata}
        placeholder={label != null ? placeholder || ' ' : placeholder}
        className={className}
      />
    </FieldFrame>
  );
});
