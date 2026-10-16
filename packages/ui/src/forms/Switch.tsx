'use client';

import { forwardRef, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { useCheckedInput, type CheckedProps } from './internal/useCheckedInput.js';

export interface SwitchProps extends CheckedProps<boolean> {
  /**
   * The setting the switch turns on or off, such as Show completed tasks, beside the track. It names
   * the switch, stays the same in both states, and pressing it toggles the switch too. Without it,
   * name the switch with aria-label or aria-labelledby.
   */
  label?: ReactNode;
  /** Whether a controlled switch is on; update it from onCheckedChange. */
  checked?: boolean;
  /** Whether an uncontrolled switch starts on; a native form reset returns it to this state. */
  defaultChecked?: boolean;
  /** Receives the new state each time people turn the switch on or off. */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * An on/off setting that takes effect at once: a native checkbox with the switch role, drawn as a
 * track and a thumb, with its label beside it.
 */
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
