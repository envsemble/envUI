'use client';

import { createContext, useContext, useEffect, useId, useRef } from 'react';
import type {
  CSSProperties,
  FieldsetHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import { IconError } from '../icons/Error.js';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../layout/Layout.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { useFormReset } from '../internal/field/useFormReset.js';
import { fieldMessageIds } from '../internal/field/useFieldMetadata.js';
import { Slot } from '../internal/layout/Slot.js';
import { useRowControlNaming } from '../internal/field/rowControl.js';
import { idRefs } from '../internal/dom/idRefs.js';
import '../styles/Base.css';
import '../styles/Radio.css';

function FieldsetErrorLikeFieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Row align="start" gap={2} id={id} className="env-radio-group-error">
      <IconError aria-hidden="true" focusable="false" />
      <span>{children}</span>
    </Row>
  );
}

interface RadioContextValue {
  value: string | undefined;
  defaultValue: string | undefined;
  name: string;
  form: string | undefined;
  required: boolean;
  disabled: boolean;
  orientation: 'horizontal' | 'vertical';
  select: (value: string) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** The group's fieldset. */
  ref?: Ref<HTMLFieldSetElement>;
  /**
   * The group's visible name, such as Visibility, as the fieldset's legend above the options. It
   * names the group for assistive technology. Without it, a List.Item whose control it is names
   * it, or name it with aria-label or aria-labelledby.
   */
  label?: ReactNode;
  /**
   * The value of the chosen option in a controlled group, or null for none; update it from
   * onValueChange.
   */
  value?: string | null;
  /**
   * The value of the option an uncontrolled group starts with; a native form reset returns to it.
   * Without value or defaultValue, no option is chosen until people choose one.
   */
  defaultValue?: string;
  /** Receives the value of the option people choose. */
  onValueChange?: (value: string) => void;
  /**
   * Lasting guidance under the options, such as what the choice changes, linked to the group as its
   * description.
   */
  description?: ReactNode;
  /**
   * A message under the options that says how to correct the choice, such as for a required group
   * left empty; it joins the group's description, after the description.
   */
  error?: ReactNode;
  /**
   * The name every radio of the group submits its value under. Set it in a form; without it the
   * group takes a unique generated name, so its radios still work as one group.
   */
  name?: string;
  /** Require a choice before the form submits, through native constraint validation. */
  required?: boolean;
  /**
   * How the options are laid out: vertical, one radio under the other, each before its label with
   * its description under the label; or horizontal, side by side, wrapping onto more lines, for two
   * or three short options.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
  /** Disable every option of the group; a disabled group can't be focused or changed. */
  disabled?: boolean;
}

/**
 * A set of up to five options to choose exactly one from, all in view: a native fieldset whose
 * legend names the group, with its Radio options one under the other, or side by side.
 */
export function RadioGroup({
  ref,
  label,
  value: controlledValue,
  defaultValue,
  onValueChange,
  description,
  error,
  name: suppliedName,
  required = false,
  disabled = false,
  orientation = 'vertical',
  className,
  children,
  ...props
}: RadioGroupProps) {
  const id = useId();
  const name = suppliedName ?? id;
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [selectedValue, select, keepOwn] = useControllableState({
    value: controlledValue,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const ids = fieldMessageIds(id);
  const naming = useRowControlNaming({ label, ...props });
  const describedBy = idRefs(
    naming['aria-describedby'] ?? props['aria-describedby'],
    description != null ? ids.description : undefined,
    error != null ? ids.error : undefined,
  );
  useFormReset(
    fieldsetRef,
    function applyReset() {
      const resetValue = keepOwn(defaultValue ?? null);
      const fieldset = fieldsetRef.current;
      for (const input of fieldset?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ??
        []) {
        if (input.name === name) input.checked = input.value === resetValue;
      }
    },
    props.form,
  );
  const fieldset = (
    <fieldset
      {...props}
      {...naming}
      ref={mergeRefs(fieldsetRef, ref)}
      disabled={disabled}
      aria-describedby={describedBy}
      data-orientation={orientation}
      className={classNames('env-radio-group', className)}
    />
  );
  const content = (
    <>
      {label != null && (
        <legend>
          <Slot className="env-radio-group-label" element="span">
            {label}
          </Slot>
        </legend>
      )}
      {children}
      {description != null && (
        <small id={ids.description} className="env-radio-group-description">
          <Slot className="env-radio-group-description-content" element="span">
            {description}
          </Slot>
        </small>
      )}
      {error != null && (
        <FieldsetErrorLikeFieldError id={ids.error}>{error}</FieldsetErrorLikeFieldError>
      )}
    </>
  );
  return (
    <RadioContext.Provider
      value={{
        value: selectedValue ?? undefined,
        defaultValue,
        name,
        form: props.form,
        required,
        disabled,
        orientation,
        select,
      }}
    >
      {orientation === 'horizontal' ? (
        <Row wrap render={fieldset}>
          {content}
        </Row>
      ) : (
        <Grid render={fieldset}>{content}</Grid>
      )}
    </RadioContext.Provider>
  );
}

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'name' | 'checked' | 'defaultChecked' | 'value'
> {
  /**
   * The native radio input, so that a form library can register it and focus it; the other native
   * props reach it too.
   */
  ref?: Ref<HTMLInputElement>;
  /** The option's class, on its root element, the label around the radio and the text. */
  className?: string;
  /** Styles of the root element. */
  style?: CSSProperties;
  /** The value the group reports and a form submits when this option is chosen. */
  value: string;
  /**
   * The option's visible name, such as Private; pressing it chooses the option. Without it, a
   * List.Item whose control it is names it, such as a plan's row with its price and features, or
   * name it with aria-label or aria-labelledby, such as a radio in a table's cell.
   */
  label?: ReactNode;
  /**
   * A short, muted line under the label that helps people choose, such as Only the people you
   * invite. It is part of the option's label, so it is read with its name.
   */
  description?: ReactNode;
  /**
   * Where the label sits beside the radio: end, after it, or start, before it, such as in an inline
   * row whose label leads; the native label still names the radio.
   * @default 'end'
   */
  labelPlacement?: 'end' | 'start';
}

/** One option of a RadioGroup: a native radio input with its label, and an optional description. */
export function Radio({
  ref,
  value,
  label,
  description,
  labelPlacement = 'end',
  className,
  style,
  onChange,
  disabled,
  required,
  form,
  ...props
}: RadioProps) {
  const group = useContext(RadioContext);
  const inputRef = useRef<HTMLInputElement>(null);
  if (!group) throw new Error('Radio must be rendered inside RadioGroup.');
  const { defaultValue: groupDefaultValue, value: groupValue } = group;
  useEffect(
    function synchronizeDefaultChecked() {
      if (inputRef.current) {
        inputRef.current.defaultChecked = groupDefaultValue === value;
        inputRef.current.checked = groupValue === value;
      }
    },
    [groupDefaultValue, groupValue, value],
  );
  const naming = useRowControlNaming({ label, ...props });
  const radioInput = (
    <input
      {...props}
      {...naming}
      ref={mergeRefs(inputRef, ref)}
      type="radio"
      className="env-radio-input"
      value={value}
      name={group.name}
      form={form ?? group.form}
      required={required ?? group.required}
      disabled={disabled || group.disabled}
      checked={group.value === value}
      onChange={(event) => {
        onChange?.(event);
        if (event.currentTarget.checked) group.select(value);
      }}
    />
  );
  const labelContent = label != null && (
    <span>
      <Slot className="env-radio-label" element="span">
        {label}
      </Slot>
      {description != null && (
        <small className="env-radio-description">
          <Slot className="env-radio-description-content" element="span">
            {description}
          </Slot>
        </small>
      )}
    </span>
  );
  return (
    <label
      className={classNames('env-radio', className)}
      style={style}
      data-orientation={group.orientation}
      data-label-placement={labelPlacement === 'start' ? 'start' : undefined}
    >
      <span className="env-radio-control">{radioInput}</span>
      {labelContent}
    </label>
  );
}
