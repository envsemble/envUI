'use client';

import { type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react';
import { Error as ErrorIcon } from '../../icons/Error.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import { classNames } from '../../internal/classNames.js';
import type { ControlSize } from '../../foundations/Theme.js';

/** The attributes and content of a text field's well, for a control that renders the well itself. */
export type FieldWellProps = ComponentPropsWithoutRef<'div'> & {
  [attribute: `data-${string}`]: string | boolean | undefined;
};

export interface FieldProps {
  /**
   * The field's visible name, such as Project name; it also names the control for assistive
   * technology.
   */
  label?: ReactNode;
  /**
   * Lasting guidance under the field, such as a format or a limit, linked to the control as its
   * description.
   */
  hint?: ReactNode;
  /**
   * A message under the field that says how to correct the value. While it is set, the control is
   * invalid (aria-invalid) and the message joins its description, after the hint.
   */
  error?: ReactNode;
}

export interface TextFieldAppearanceProps {
  /**
   * The field's look: outlined, with a thin border, at the control height; floating, an outlined
   * field 3.5 rem tall whose label rests inside and floats into the outline, for long forms on a
   * page; plain, as tall, with no border or fill and an underline on hover and focus; or quiet,
   * only its text and start icon at rest, with a soft fill under the pointer and while focused and
   * a placeholder that clears on focus, for a search at the top of a sidebar or a list.
   * @default 'outlined'
   */
  variant?: 'outlined' | 'floating' | 'plain' | 'quiet';
}

export interface FieldSizeProps {
  /**
   * The height, as on every control: sm, md or lg in the current scale. Without it, the field takes
   * the control height of its container, md unless the container sets another, as a table cell
   * does. A button beside a field takes the field's size. Floating and plain fields have their own
   * height.
   */
  size?: ControlSize;
}

export interface TextFieldDecorationProps {
  /** A decorative icon at the start of the field, such as Search or Mail. */
  startIcon?: ReactNode;
  /**
   * A control at the end of the field, such as a text IconButton that reveals or copies the value;
   * name it with aria-label.
   */
  endAction?: ReactNode;
  /**
   * Show the label in the field, where it rests while the field is empty and floats into the
   * outline while the field has focus or a value. Set false for a field whose purpose is clear
   * without it, such as a search in a toolbar: the label still names the field for assistive
   * technology, and a placeholder gives the visible guidance.
   * @default true
   */
  showLabel?: boolean;
}

export interface TextFieldAffixProps {
  /**
   * Short, non-interactive text before the value, such as the start of an address. It is not part
   * of the value; it shows once the field has focus or a value and is read after the label.
   */
  prefix?: ReactNode;
  /**
   * Short, non-interactive text after the value, such as a unit. It is not part of the value; it
   * shows once the field has focus or a value and is read after the label.
   */
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

/** Whether a text field shows its label: unless showLabel is false. */
export function isLabelShown({ showLabel }: TextFieldDecorationProps) {
  return showLabel ?? true;
}

/** Whether a field is tall: its label sits above the value rather than at the control height. */
export function isTallField(variant: TextFieldAppearanceProps['variant'], multiline = false) {
  return multiline || variant === 'floating' || variant === 'plain';
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
  showLabel,
  size,
  multiline = false,
  prefix,
  suffix,
  className,
  renderWell = renderPlainWell,
}: FieldProps &
  TextFieldAppearanceProps &
  TextFieldDecorationProps &
  FieldSizeProps &
  TextFieldAffixProps & {
    id: string;
    children: ReactNode;
    floatingLabel?: boolean;
    /** A text area, which is tall whatever its variant. */
    multiline?: boolean;
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
      data-size={floatingLabel ? size : undefined}
      data-tall={(floatingLabel && isTallField(variant, multiline)) || undefined}
      data-label-hidden={(floatingLabel && !isLabelShown({ showLabel })) || undefined}
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
