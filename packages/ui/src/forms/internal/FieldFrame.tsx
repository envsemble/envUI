import { useId, type AriaAttributes, type ReactNode } from 'react';
import { Error as ErrorIcon } from '../../icons/Error.js';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

/** Keep accessible field metadata identical across native and composed controls. */
export function useFieldMetadata(
  suppliedId: string | undefined,
  hint: ReactNode,
  error: ReactNode,
  describedBy: string | undefined,
  invalid: AriaAttributes['aria-invalid'],
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return {
    id,
    'aria-describedby':
      [
        describedBy,
        hint != null ? `${id}-hint` : undefined,
        error != null ? `${id}-error` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    'aria-invalid': error != null ? true : invalid,
  };
}

/** Text controls place their label on the well; composite controls keep a separate label. */
export function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
  floatingLabel = false,
}: FieldProps & { id: string; children: ReactNode; floatingLabel?: boolean }) {
  return (
    <div className={floatingLabel ? 'env-form-field env-text-field' : 'env-form-field'}>
      {floatingLabel ? (
        <div className="env-text-field-well">
          {children}
          {label}
        </div>
      ) : (
        <>
          {label}
          {children}
        </>
      )}
      {hint != null && (
        <small className="env-field-hint" id={`${id}-hint`}>
          {hint}
        </small>
      )}
      {error != null && (
        <small className="env-field-error" id={`${id}-error`}>
          <ErrorIcon aria-hidden="true" focusable="false" />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
}
