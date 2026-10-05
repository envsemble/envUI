import { type ReactNode } from 'react';
import { Error as ErrorIcon } from '../../icons/Error.js';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export interface TextFieldAppearanceProps {
  /** Outlined by default; plain shows an underline on hover or focus without a border or fill. */
  variant?: 'outlined' | 'plain';
}

/** Text controls place their label on the well; composite controls keep a separate label. */
export function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
  floatingLabel = false,
  variant = 'outlined',
}: FieldProps &
  TextFieldAppearanceProps & { id: string; children: ReactNode; floatingLabel?: boolean }) {
  return (
    <div className={floatingLabel ? 'env-form-field env-text-field' : 'env-form-field'}>
      {floatingLabel ? (
        <div className="env-text-field-well" data-variant={variant}>
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
