import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { classNames } from '../internal/classNames.js';
import {
  FieldFrame,
  useFieldMetadata,
  type FieldProps,
  type TextFieldAppearanceProps,
} from './internal/FieldFrame.js';

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    FieldProps,
    TextFieldAppearanceProps {}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
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
      variant={variant}
    >
      <input
        {...props}
        ref={ref}
        {...metadata}
        placeholder={label != null ? placeholder || ' ' : placeholder}
        className={classNames('env-text-input', className)}
      />
    </FieldFrame>
  );
});
