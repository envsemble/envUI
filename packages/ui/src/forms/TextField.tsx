import { forwardRef } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import type { InputHTMLAttributes } from 'react';
import { classNames } from '../internal/classNames.js';
import {
  FieldFrame,
  isLabelShown,
  type FieldProps,
  type TextFieldAffixProps,
  type TextFieldAppearanceProps,
  type TextFieldDecorationProps,
} from './internal/FieldFrame.js';

// The prefix prop replaces the native RDFa attribute of the same name.
export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'>,
    FieldProps,
    TextFieldAppearanceProps,
    TextFieldDecorationProps,
    TextFieldAffixProps {}
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hint,
    error,
    variant,
    startIcon,
    endAction,
    compact = false,
    showLabel,
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
    label != null && isLabelShown({ compact, showLabel }) ? placeholder || ' ' : placeholder;
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
      compact={compact}
      showLabel={showLabel}
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
