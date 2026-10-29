'use client';

import type { CSSProperties, ReactNode, Ref } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import {
  useCheckedInput,
  type CheckedProps,
  type CheckboxState,
} from './internal/useCheckedInput.js';
import { IconCheck } from '../icons/Check.js';
import '../styles/Base.css';
import '../styles/Checkbox.css';

export type { CheckboxState } from './internal/useCheckedInput.js';
export interface CheckboxProps extends CheckedProps<CheckboxState> {
  /**
   * The native checkbox, so that a form library can register it and focus it; the other native
   * props, such as name and required, reach it too.
   */
  ref?: Ref<HTMLInputElement>;
  /** The checkbox's class, on its root element, the label around the box and the text. */
  className?: string;
  /** Styles of the root element. */
  style?: CSSProperties;
  /** The text beside the box, which names the checkbox; pressing it toggles the checkbox. */
  label?: ReactNode;
  /**
   * A short, muted line under the label, such as what the option changes. It is part of the
   * checkbox's label, so it is read with its name.
   */
  description?: ReactNode;
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
export function Checkbox({
  ref,
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  className,
  style,
  ...props
}: CheckboxProps) {
  const { inputRef, checkedState, handleChange } = useCheckedInput(
    checked,
    defaultChecked,
    onCheckedChange,
    onChange,
    props.form,
  );
  return (
    <label className={classNames('env-checkbox', className)} style={style}>
      <span className="env-checkbox-box">
        <input
          {...props}
          type="checkbox"
          ref={(node) => {
            inputRef.current = node;
            setRef(ref, node);
          }}
          className="env-checkbox-input"
          checked={checkedState === true}
          aria-checked={checkedState === 'mixed' ? 'mixed' : checkedState}
          onChange={handleChange}
        />
        <span className="env-checkbox-indicator env-icon" aria-hidden="true">
          <IconCheck />
        </span>
      </span>
      {label != null && (
        <span className="env-checkbox-label">
          {label}
          {description != null && <small className="env-checkbox-description">{description}</small>}
        </span>
      )}
    </label>
  );
}
