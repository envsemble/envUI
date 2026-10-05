import { forwardRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import {
  useCheckedInput,
  type CheckedProps,
  type CheckboxState,
} from './internal/useCheckedInput.js';
import { Check } from '../icons/Check.js';

export type { CheckboxState } from './internal/useCheckedInput.js';
export interface CheckboxProps extends CheckedProps<CheckboxState> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
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
      <span className="env-checkbox-box">
        <input
          {...props}
          type="checkbox"
          ref={(node) => {
            inputRef.current = node;
            setRef(ref, node);
          }}
          className={classNames('env-checkbox-control', className)}
          checked={checkedState === true}
          aria-checked={checkedState === 'mixed' ? 'mixed' : checkedState}
          onChange={handleChange}
        />
        <span className="env-checkbox-mark env-symbol" aria-hidden="true">
          <Check />
        </span>
      </span>
      {label != null && <span>{label}</span>}
    </label>
  );
});
