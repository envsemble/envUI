'use client';

import type { CSSProperties, Ref } from 'react';
import { classNames } from '../internal/classNames.js';
import { useFieldControl } from '../internal/field/useFieldControl.js';
import { TextareaControl, type TextareaControlProps } from '../internal/field/TextareaControl.js';
import { FieldFrame, FieldLabelContent } from '../internal/field/FieldFrame.js';
import { type FieldProps } from '../internal/field/fieldProps.js';

export interface TextareaProps extends TextareaControlProps, FieldProps {
  /** The native text area, so that a form library can register it and focus it. */
  ref?: Ref<HTMLTextAreaElement>;
  /** The field's class, on its root element, beside env-field, env-text-field and env-textarea. */
  className?: string;
  /** Styles of the field's root element, such as its width in a row. */
  style?: CSSProperties;
  /**
   * The field's look, as TextField's: outline or ghost.
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
  onChange,
  onValueChange,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: TextareaProps) {
  const { naming, metadata } = useFieldControl({
    ...props,
    id: suppliedId,
    label,
    description,
    error,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
  });
  const { id } = metadata;
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
      multiline
      variant={variant}
      className={classNames('env-textarea', className)}
      style={style}
    >
      <TextareaControl
        {...props}
        {...naming}
        ref={ref}
        {...metadata}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
      />
    </FieldFrame>
  );
}
