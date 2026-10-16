'use client';

import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState } from 'react';
import type { FieldsetHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

interface RadioContextValue {
  value: string | undefined;
  defaultValue: string | undefined;
  name: string;
  form: string | undefined;
  required: boolean;
  disabled: boolean;
  variant: 'inline' | 'rows';
  select: (value: string) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  variant?: 'inline' | 'rows';
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
    label,
    value,
    defaultValue,
    onValueChange,
    name: suppliedName,
    required = false,
    disabled = false,
    variant = 'inline',
    className,
    children,
    ...props
  },
  ref,
) {
  const id = useId();
  const name = suppliedName ?? id;
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selectedValue = value ?? uncontrolledValue;
  useEffect(
    function subscribeToFormReset() {
      const fieldset = fieldsetRef.current;
      const form = fieldset?.form;
      if (!fieldset || !form) return;
      return subscribeFormReset(form, function applyReset() {
        const resetValue = value ?? defaultValue;
        if (value === undefined) setUncontrolledValue(resetValue);
        for (const input of fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
          if (input.name === name) input.checked = input.value === resetValue;
        }
      });
    },
    [value, defaultValue, name, props.form],
  );
  function select(nextValue: string) {
    if (value === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  }
  return (
    <RadioContext.Provider
      value={{
        value: selectedValue,
        defaultValue,
        name,
        form: props.form,
        required,
        disabled,
        variant,
        select,
      }}
    >
      <fieldset
        {...props}
        ref={(node) => {
          fieldsetRef.current = node;
          setRef(ref, node);
        }}
        disabled={disabled}
        className={classNames(
          'env-radio-options',
          variant === 'rows' ? 'env-connected-rows' : undefined,
          variant === 'inline' ? 'env-radio-inline' : undefined,
          className,
        )}
      >
        {label != null && <legend>{label}</legend>}
        {children}
      </fieldset>
    </RadioContext.Provider>
  );
});

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'name' | 'checked' | 'defaultChecked' | 'value'
  > {
  value: string;
  label: ReactNode;
  detail?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, detail, className, onChange, disabled, required, form, ...props },
  ref,
) {
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
      className={classNames('env-radio-control', className)}
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
      {detail != null && <small className="env-radio-detail">{detail}</small>}
    </span>
  );
  return group.variant === 'rows' ? (
    <label className="env-radio-option env-connected-row">
      {labelContent}
      {radioInput}
    </label>
  ) : (
    <label className="env-choice-control">
      {radioInput}
      {labelContent}
    </label>
  );
});
