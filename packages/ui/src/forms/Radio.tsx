'use client';

import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
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
import { setRef } from '../internal/setRef.js';
import { useFormReset } from './internal/useFormReset.js';
import { fieldMessageIds } from './internal/useFieldMetadata.js';
import '../styles/Base.css';
import '../styles/Radio.css';
import '../styles/ConnectedRows.css';

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
   * names the group for assistive technology; without it, use aria-label or aria-labelledby.
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
   * How the options are laid out: horizontal, radios before their labels side by side that wrap
   * onto more lines; or vertical, connected selectable rows that fill the width, with the label and
   * description at the start and the radio at the end, for options that need explaining.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /** Disable every option of the group; a disabled group can't be focused or changed. */
  disabled?: boolean;
}

/**
 * A set of options to choose exactly one from: a native fieldset whose legend names the group, with
 * Radio options inline or as selectable rows.
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
  orientation = 'horizontal',
  className,
  children,
  ...props
}: RadioGroupProps) {
  const id = useId();
  const name = suppliedName ?? id;
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  // null is none while controlled, as undefined leaves the group to itself.
  const value = controlledValue === null ? undefined : controlledValue;
  const controlled = controlledValue !== undefined;
  const selectedValue = controlled ? value : uncontrolledValue;
  const ids = fieldMessageIds(id);
  const describedBy =
    [
      props['aria-describedby'],
      description != null ? ids.description : undefined,
      error != null ? ids.error : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  useFormReset(
    fieldsetRef,
    function applyReset() {
      const resetValue = controlled ? value : defaultValue;
      if (!controlled) setUncontrolledValue(resetValue);
      const fieldset = fieldsetRef.current;
      for (const input of fieldset?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ??
        []) {
        if (input.name === name) input.checked = input.value === resetValue;
      }
    },
    props.form,
  );
  function select(nextValue: string) {
    if (!controlled) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  }
  const fieldset = (
    <fieldset
      {...props}
      ref={(node) => {
        fieldsetRef.current = node;
        setRef(ref, node);
      }}
      disabled={disabled}
      aria-describedby={describedBy}
      data-orientation={orientation}
      className={classNames(
        'env-radio-group',
        orientation === 'vertical' ? 'env-connected-rows' : undefined,
        className,
      )}
    />
  );
  const content = (
    <>
      {label != null && <legend>{label}</legend>}
      {children}
      {description != null && (
        <small id={ids.description} className="env-radio-group-description">
          {description}
        </small>
      )}
      {/* The error looks as a field's does, the error icon before the message (Radio.css); a
          fieldset has no Field.Root for Field.Error to join. */}
      {error != null && (
        <Row align="start" gap={2} id={ids.error} className="env-radio-group-error">
          <IconError aria-hidden="true" focusable="false" />
          <span>{error}</span>
        </Row>
      )}
    </>
  );
  return (
    <RadioContext.Provider
      value={{
        value: selectedValue,
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
  /** The option's visible name, such as Private; pressing it chooses the option. */
  label: ReactNode;
  /**
   * A short, muted line under the label that helps people choose, such as Only the people you
   * invite. It is part of the option's label, so it is read with its name.
   */
  description?: ReactNode;
}

/** One option of a RadioGroup: a native radio input with its label, and an optional description. */
export function Radio({
  ref,
  value,
  label,
  description,
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
  const radioInput = (
    <input
      {...props}
      ref={(node) => {
        inputRef.current = node;
        setRef(ref, node);
      }}
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
  const labelContent = (
    <span>
      {label}
      {description != null && <small className="env-radio-description">{description}</small>}
    </span>
  );
  const vertical = group.orientation === 'vertical';
  return (
    <label
      className={classNames('env-radio', vertical ? 'env-connected-row' : undefined, className)}
      style={style}
      data-orientation={group.orientation}
    >
      {vertical ? labelContent : radioInput}
      {vertical ? radioInput : labelContent}
    </label>
  );
}
