import { forwardRef } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import type { InputHTMLAttributes } from 'react';
import { classNames } from '../internal/classNames.js';
import {
  FieldFrame,
  isLabelShown,
  type FieldProps,
  type TextFieldAppearanceProps,
  type TextFieldDecorationProps,
} from './internal/FieldFrame.js';

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    FieldProps,
    TextFieldAppearanceProps,
    TextFieldDecorationProps {}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    variant,
    startIcon,
    endAction,
    compact = false,
    showLabel,
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
    >
      <input
        {...props}
        ref={ref}
        {...metadata}
        placeholder={fieldPlaceholder}
        className={classNames('env-text-input', className)}
      />
    </FieldFrame>
  );
});
