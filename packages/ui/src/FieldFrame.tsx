import { useId, type AriaAttributes, type ReactNode } from 'react';

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

export function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="env-form-field">
      {label}
      {children}
      {hint != null && <small id={`${id}-hint`}>{hint}</small>}
      {error != null && <small id={`${id}-error`}>{error}</small>}
    </div>
  );
}
