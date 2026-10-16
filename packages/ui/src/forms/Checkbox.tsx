'use client';

import { forwardRef, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import {
  useCheckedInput,
  type CheckedProps,
  type CheckboxState,
} from './internal/useCheckedInput.js';
import { Check } from '../icons/Check.js';

export type { CheckboxState } from './internal/useCheckedInput.js';
export interface CheckboxProps extends CheckedProps<CheckboxState> {
  /** The text beside the box, which names the checkbox; pressing it toggles the checkbox. */
  label?: ReactNode;
  /**
   * Whether the box is checked, unchecked or "mixed", for a parent whose children are partly
   * chosen. With `onCheckedChange` it controls the checkbox.
   */
  checked?: CheckboxState;
  /** How an uncontrolled checkbox starts, and what a form reset restores; unchecked by default. */
  defaultChecked?: CheckboxState;
  /** Called with the new state when people press the checkbox; a mixed checkbox reports true. */
  onCheckedChange?: (checked: boolean) => void;
}

/** A native checkbox inside its label, checked, unchecked or mixed. */
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
