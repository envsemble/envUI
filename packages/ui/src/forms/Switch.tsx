import { forwardRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { useCheckedInput, type CheckedProps } from './internal/useCheckedInput.js';

export interface SwitchProps extends CheckedProps<boolean> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, checked, defaultChecked = false, onCheckedChange, onChange, className, ...props },
  ref,
) {
  const { inputRef, checkedState, handleChange } = useCheckedInput(
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
        className={classNames('env-switch-control', className)}
        checked={checkedState === true}
        aria-checked={checkedState === true}
        onChange={handleChange}
      />
      {label != null && <span>{label}</span>}
    </label>
  );
});
