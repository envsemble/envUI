'use client';

import type { ComponentPropsWithoutRef, CSSProperties, MouseEvent, ReactNode, Ref } from 'react';
import * as Field from '../../forms/Field.js';
import { ControlDefaults } from '../control/ControlDefaults.js';
import { Slot } from '../layout/Slot.js';
import { classNames } from '../classNames.js';
import { fieldPartIds } from './useFieldControl.js';
import { flag } from '../flag.js';
import type {
  FieldAffixProps,
  FieldAppearanceProps,
  FieldDecorationProps,
  FieldProps,
  FieldSizeProps,
} from './fieldProps.js';
import '../../styles/Base.css';
import '../../styles/TextField.css';

/** The attributes and content of a text field's control box, for a control that renders it itself. */
export type FieldControlBoxProps = ComponentPropsWithoutRef<'div'> & {
  [attribute: `data-${string}`]: string | boolean | undefined;
};

function placeCaretAtNearerEnd(event: MouseEvent<HTMLElement>) {
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
    return;
  }
}

function isLabelShown({ visibleLabel }: FieldDecorationProps) {
  return visibleLabel ?? true;
}

/** A field's label as the application gives it, inside the label element its field renders. */
export function FieldLabelContent({ children }: { children: ReactNode }) {
  return (
    <Slot className="env-field-label-content" element="span">
      {children}
    </Slot>
  );
}

function renderPlainControlBox(props: FieldControlBoxProps) {
  return <div {...props} />;
}

export interface FieldFrameOwnProps {
  id: string;
  children: ReactNode;
  /** The control sits in a text field's box, with its icon, affixes and actions. */
  controlBox?: boolean;
  /** A text area, which is tall. */
  multiline?: boolean;
  /** The owner's root class, beside env-field. */
  className?: string;
  /** The root's style, from the owner's style prop. */
  style?: CSSProperties;
  /** The root element. */
  rootRef?: Ref<HTMLDivElement>;
  /** Renders the control box, such as through a primitive that owns it; it receives its props. */
  renderControlBox?: (props: FieldControlBoxProps) => ReactNode;
}

/**
 * The frame of envUI's own fields, built from Field's parts: Field.Root around the label above the
 * control, the control, Field.Description and Field.Error. Text controls (controlBox) sit in a box
 * with their icon, affixes and actions.
 */
export function FieldFrame({
  id,
  label,
  description,
  error,
  children,
  controlBox = false,
  variant = 'outline',
  start,
  endAction,
  visibleLabel,
  size,
  multiline = false,
  prefix,
  suffix,
  className,
  style,
  rootRef,
  renderControlBox = renderPlainControlBox,
}: FieldProps &
  FieldAppearanceProps &
  FieldDecorationProps &
  FieldSizeProps &
  FieldAffixProps &
  FieldFrameOwnProps) {
  const ids = fieldPartIds(id);
  return (
    <Field.Root
      ref={rootRef}
      className={classNames(controlBox ? 'env-text-field' : undefined, className)}
      style={style}
      invalid={error != null || undefined}
      data-size={controlBox ? size : undefined}
      data-tall={flag(controlBox && multiline)}
      data-label-hidden={flag(controlBox && !isLabelShown({ visibleLabel }))}
    >
      {label}
      {controlBox
        ? renderControlBox({
            className: 'env-text-field-control',
            'data-variant': variant,
            'data-start': flag(start != null),
            'data-end-action': flag(endAction != null),
            'data-prefix': flag(prefix != null),
            'data-suffix': flag(suffix != null),
            children: (
              <>
                {start != null && (
                  <Slot
                    className="env-text-field-start"
                    element="span"
                    layout="row"
                    shrink="never"
                    aria-hidden
                  >
                    {start}
                  </Slot>
                )}
                {prefix != null && (
                  <span
                    className="env-text-field-prefix"
                    id={ids.prefix}
                    aria-hidden="true"
                    onMouseDown={placeCaretAtNearerEnd}
                  >
                    {prefix}
                  </span>
                )}
                {children}
                {suffix != null && (
                  <span
                    className="env-text-field-suffix"
                    id={ids.suffix}
                    aria-hidden="true"
                    onMouseDown={placeCaretAtNearerEnd}
                  >
                    {suffix}
                  </span>
                )}
                {endAction != null && (
                  <span className="env-text-field-end">
                    <Slot
                      className="env-text-field-end-action"
                      element="span"
                      layout="row"
                      shrink="never"
                    >
                      <ControlDefaults variant="ghost">{endAction}</ControlDefaults>
                    </Slot>
                  </span>
                )}
              </>
            ),
          })
        : children}
      {description != null && (
        <Field.Description id={ids.description} render={<div />}>
          <Slot className="env-field-description-content">{description}</Slot>
        </Field.Description>
      )}
      {error != null && <Field.Error id={ids.error}>{error}</Field.Error>}
    </Field.Root>
  );
}
