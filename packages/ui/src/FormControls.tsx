import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState } from 'react';
import type {
  ChangeEvent,
  FieldsetHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { Check } from './icons/Check.js';
import { FieldFrame, useFieldMetadata, type FieldProps } from './FieldFrame.js';
import { setRef, subscribeFormReset } from './FormUtilities.js';

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}
export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldProps {}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    id: suppliedId,
    className,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    ...props
  },
  ref,
) {
  const metadata = useFieldMetadata(suppliedId, hint, error, describedBy, invalid);
  const { id } = metadata;
  return (
    <FieldFrame
      id={id}
      label={label != null ? <label htmlFor={id}>{label}</label> : null}
      hint={hint}
      error={error}
    >
      <input {...props} ref={ref} {...metadata} className={classes('env-text-input', className)} />
    </FieldFrame>
  );
});
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    id: suppliedId,
    className,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    ...props
  },
  ref,
) {
  const metadata = useFieldMetadata(suppliedId, hint, error, describedBy, invalid);
  const { id } = metadata;
  return (
    <FieldFrame
      id={id}
      label={label != null ? <label htmlFor={id}>{label}</label> : null}
      hint={hint}
      error={error}
    >
      <textarea
        {...props}
        ref={ref}
        {...metadata}
        className={classes('env-text-input', className)}
      />
    </FieldFrame>
  );
});

export type CheckboxState = boolean | 'mixed';
interface CheckedProps<State extends CheckboxState>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked'> {
  label?: ReactNode;
  checked?: State;
  defaultChecked?: State;
  onCheckedChange?: (checked: boolean) => void;
}
export interface CheckboxProps extends CheckedProps<CheckboxState> {}
export interface SwitchProps extends CheckedProps<boolean> {}

function useCheckedInput<State extends CheckboxState>(
  checked: State | undefined,
  defaultChecked: State,
  onCheckedChange: ((checked: boolean) => void) | undefined,
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange'],
  formId: string | undefined,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = useState<CheckboxState>(defaultChecked);
  const state = checked ?? uncontrolled;
  useEffect(
    function synchronizeInput() {
      if (inputRef.current) {
        inputRef.current.indeterminate = state === 'mixed';
        inputRef.current.defaultChecked = defaultChecked === true;
        inputRef.current.checked = state === true;
      }
    },
    [state, defaultChecked],
  );
  useEffect(
    function subscribeToFormReset() {
      const input = inputRef.current;
      const form = input?.form;
      if (!input || !form) return;
      return subscribeFormReset(form, function applyReset() {
        const resetState = checked ?? defaultChecked;
        if (checked === undefined) setUncontrolled(resetState);
        input.checked = resetState === true;
        input.indeterminate = resetState === 'mixed';
      });
    },
    [checked, defaultChecked, formId],
  );
  function change(event: ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.checked;
    if (checked === undefined) setUncontrolled(next);
    else event.currentTarget.indeterminate = state === 'mixed';
    onChange?.(event);
    onCheckedChange?.(next);
  }
  return { inputRef, state, change };
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, checked, defaultChecked = false, onCheckedChange, onChange, className, ...props },
  ref,
) {
  const { inputRef, state, change } = useCheckedInput(
    checked,
    defaultChecked,
    onCheckedChange,
    onChange,
    props.form,
  );
  return (
    <label className="env-choice-control">
      <span className="env-checkbox-box">
        <input
          {...props}
          type="checkbox"
          ref={(node) => {
            inputRef.current = node;
            setRef(ref, node);
          }}
          className={classes('env-checkbox-control', className)}
          checked={state === true}
          aria-checked={state === 'mixed' ? 'mixed' : state}
          onChange={change}
        />
        <span className="env-checkbox-mark env-symbol" aria-hidden="true">
          <Check />
        </span>
      </span>
      {label != null && <span>{label}</span>}
    </label>
  );
});
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, checked, defaultChecked = false, onCheckedChange, onChange, className, ...props },
  ref,
) {
  const { inputRef, state, change } = useCheckedInput(
    checked,
    defaultChecked,
    onCheckedChange,
    onChange,
    props.form,
  );
  return (
    <label className="env-choice-control">
      <input
        {...props}
        type="checkbox"
        role="switch"
        ref={(node) => {
          inputRef.current = node;
          setRef(ref, node);
        }}
        className={classes('env-switch-control', className)}
        checked={state === true}
        aria-checked={state === true}
        onChange={change}
      />
      {label != null && <span>{label}</span>}
    </label>
  );
});

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
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = value ?? uncontrolled;
  useEffect(
    function subscribeToFormReset() {
      const fieldset = fieldsetRef.current;
      const form = fieldset?.form;
      if (!fieldset || !form) return;
      return subscribeFormReset(form, function applyReset() {
        const resetValue = value ?? defaultValue;
        if (value === undefined) setUncontrolled(resetValue);
        for (const input of fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
          if (input.name === name) input.checked = input.value === resetValue;
        }
      });
    },
    [value, defaultValue, name, props.form],
  );
  function select(next: string) {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }
  return (
    <RadioContext.Provider
      value={{
        value: selected,
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
        className={classes(
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
  useEffect(
    function synchronizeDefaultChecked() {
      if (inputRef.current) {
        inputRef.current.defaultChecked = group!.defaultValue === value;
        inputRef.current.checked = group!.value === value;
      }
    },
    [group.defaultValue, group.value, value],
  );
  const control = (
    <input
      {...props}
      ref={(node) => {
        inputRef.current = node;
        setRef(ref, node);
      }}
      type="radio"
      className={classes('env-radio-control', className)}
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
  const copy = (
    <span>
      {label}
      {detail != null && <small className="env-radio-detail">{detail}</small>}
    </span>
  );
  return group.variant === 'rows' ? (
    <label className="env-radio-option env-connected-row">
      {copy}
      {control}
    </label>
  ) : (
    <label className="env-choice-control">
      {control}
      {copy}
    </label>
  );
});
