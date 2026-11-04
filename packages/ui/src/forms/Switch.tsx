'use client';

import type { CSSProperties, ReactNode, Ref } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { useCheckedInput, type CheckedProps } from './internal/useCheckedInput.js';
import '../styles/Base.css';
import '../styles/Switch.css';

export interface SwitchProps extends CheckedProps<boolean> {
  /**
   * The native checkbox with the switch role, so that a form library can register it and focus it;
   * the other native props, such as name, reach it too.
   */
  ref?: Ref<HTMLInputElement>;
  /** The switch's class, on its root element, the label around the track and the text. */
  className?: string;
  /** Styles of the root element. */
  style?: CSSProperties;
  /**
   * The setting the switch turns on or off, such as Show completed tasks, beside the track. It names
   * the switch, stays the same in both states, and pressing it toggles the switch too. Without it,
   * name the switch with aria-label or aria-labelledby.
   */
  label?: ReactNode;
  /**
   * A short, muted line under the label, such as what the option changes. It is part of the
   * switch's label, so it is read with its name.
   */
  description?: ReactNode;
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
export function Switch({
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
}: SwitchProps) {
  const { inputRef, checkedState, handleChange } = useCheckedInput(
    checked,
    defaultChecked,
    onCheckedChange,
    onChange,
    props.form,
  );
  return (
    <label className={classNames('env-switch', className)} style={style}>
      <input
        {...props}
        type="checkbox"
        role="switch"
        ref={(node) => {
          inputRef.current = node;
          setRef(ref, node);
        }}
        className="env-switch-input"
        checked={checkedState === true}
        aria-checked={checkedState === true}
        onChange={handleChange}
      />
      {label != null && (
        <span className="env-switch-label">
          {label}
          {description != null && <small className="env-switch-description">{description}</small>}
        </span>
      )}
    </label>
  );
}
