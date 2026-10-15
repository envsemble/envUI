import { type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react';
import { Error as ErrorIcon } from '../../icons/Error.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import { classNames } from '../../internal/classNames.js';

/** The attributes and content of a text field's well, for a control that renders the well itself. */
export type FieldWellProps = ComponentPropsWithoutRef<'div'> & {
  [attribute: `data-${string}`]: string | boolean | undefined;
};

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export interface TextFieldAppearanceProps {
  /**
   * Outlined by default; plain shows an underline on hover or focus without a border or fill; quiet
   * is only its text (and icon) at rest, takes a soft fill under the pointer and while focused, and
   * clears its placeholder once focused, for a search at the top of a sidebar.
   */
  variant?: 'outlined' | 'plain' | 'quiet';
}

export interface TextFieldDecorationProps {
  /** Decorative icon at the start of the well. */
  startIcon?: ReactNode;
  /** A control at the end of the well, such as a clear IconButton. */
  endAction?: ReactNode;
  /**
   * Match the shared control height so the field can sit beside buttons. The label is hidden
   * unless showLabel is set; it stays available to assistive technology either way.
   */
  compact?: boolean;
  /**
   * Show the label inside the field, where it floats into the outline while the field has focus or
   * a value. Defaults to true, and to false for compact fields, which can use a placeholder instead.
   */
  showLabel?: boolean;
}

export interface TextFieldAffixProps {
  /** Short text in the field before the value, such as the start of an address. Not interactive. */
  prefix?: ReactNode;
  /** Short text in the field after the value, such as a unit. Not interactive. */
  suffix?: ReactNode;
}

/** Pressing the prefix or suffix places the caret in the control, at the nearer end of its value. */
function focusControl(event: MouseEvent<HTMLElement>) {
  const control = event.currentTarget.parentElement?.querySelector('input');
  if (!control || control.disabled || event.button !== 0) return;
  event.preventDefault();
  control.focus();
  const end = event.currentTarget.classList.contains('env-text-field-suffix')
    ? control.value.length
    : 0;
  try {
    control.setSelectionRange(end, end);
  } catch {
    // Some input types, such as number, have no text selection.
  }
}

/** Whether a text field shows its label: always by default, and only on request when compact. */
export function isLabelShown({ compact = false, showLabel }: TextFieldDecorationProps) {
  return showLabel ?? !compact;
}

/** The well as a plain element; composed controls render it through their own primitive. */
function renderPlainWell(props: FieldWellProps) {
  return <div {...props} />;
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
  showLabel,
  prefix,
  suffix,
  className,
  renderWell = renderPlainWell,
}: FieldProps &
  TextFieldAppearanceProps &
  TextFieldDecorationProps &
  TextFieldAffixProps & {
    id: string;
    children: ReactNode;
    floatingLabel?: boolean;
    className?: string;
    /** Renders the well, such as through a primitive that owns it; it receives the well's props. */
    renderWell?: (props: FieldWellProps) => ReactNode;
  }) {
  return (
    <div
      className={classNames(
        floatingLabel ? 'env-form-field env-text-field' : 'env-form-field',
        className,
      )}
      data-compact={compact || undefined}
      data-label-hidden={(floatingLabel && !isLabelShown({ compact, showLabel })) || undefined}
    >
      {floatingLabel ? (
        renderWell({
          className: 'env-text-field-well',
          'data-variant': variant,
          'data-start-icon': startIcon != null || undefined,
          'data-end-action': endAction != null || undefined,
          'data-prefix': prefix != null || undefined,
          'data-suffix': suffix != null || undefined,
          children: (
            <>
              {/* The control names the prefix and suffix in its description, so they are read once. */}
              {prefix != null && (
                <span
                  className="env-text-field-prefix"
                  id={`${id}-prefix`}
                  aria-hidden="true"
                  onMouseDown={focusControl}
                >
                  {prefix}
                </span>
              )}
              {children}
              {suffix != null && (
                <span
                  className="env-text-field-suffix"
                  id={`${id}-suffix`}
                  aria-hidden="true"
                  onMouseDown={focusControl}
                >
                  {suffix}
                </span>
              )}
              {label}
              {startIcon != null && (
                <span className="env-text-field-start">
                  <DecorativeIcon>{startIcon}</DecorativeIcon>
                </span>
              )}
              {endAction != null && <span className="env-text-field-end">{endAction}</span>}
            </>
          ),
        })
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
