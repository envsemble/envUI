import { type ReactNode } from 'react';
import { Error as ErrorIcon } from '../../icons/Error.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export interface TextFieldAppearanceProps {
  /** Outlined by default; plain shows an underline on hover or focus without a border or fill. */
  variant?: 'outlined' | 'plain';
}

export interface TextFieldDecorationProps {
  /** Decorative icon at the start of the well. */
  startIcon?: ReactNode;
  /** A control at the end of the well, such as a clear IconButton. */
  endAction?: ReactNode;
  /**
   * Match the shared control height so the field can sit beside buttons. The label stays
   * available to assistive technology but is not shown; use a placeholder for visible guidance.
   */
  compact?: boolean;
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
  startIcon,
  endAction,
  compact = false,
}: FieldProps &
  TextFieldAppearanceProps &
  TextFieldDecorationProps & { id: string; children: ReactNode; floatingLabel?: boolean }) {
  return (
    <div
      className={floatingLabel ? 'env-form-field env-text-field' : 'env-form-field'}
      data-compact={compact || undefined}
    >
      {floatingLabel ? (
        <div
          className="env-text-field-well"
          data-variant={variant}
          data-start-icon={startIcon != null || undefined}
          data-end-action={endAction != null || undefined}
        >
          {children}
          {label}
          {startIcon != null && (
            <span className="env-text-field-start">
              <DecorativeIcon>{startIcon}</DecorativeIcon>
            </span>
          )}
          {endAction != null && <span className="env-text-field-end">{endAction}</span>}
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
