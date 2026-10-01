import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { classNames } from '../internal/classNames.js';
import { FieldFrame, useFieldMetadata, type FieldProps } from './internal/FieldFrame.js';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    id: suppliedId,
    className,
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
    >
      <textarea
        {...props}
        ref={ref}
        {...metadata}
        className={classNames('env-text-input', className)}
      />
    </FieldFrame>
  );
});
