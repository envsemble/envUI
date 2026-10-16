import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface SpinnerProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * The work it stands for, such as Refreshing members, which names the spinner as a progress bar
   * for assistive technology. Leave it out where a busy control or region already says so; the
   * spinner is then hidden from assistive technology.
   */
  label?: string;
  /**
   * small, 1 rem, inside controls and beside a line of text; standard, 1.5 rem, beside a heading or
   * in a panel; or large, 3 rem, in the middle of a region whose content is on its way.
   */
  size?: 'small' | 'standard' | 'large';
}

/**
 * Work of unknown length in a small area, such as a panel that is updating: an arc in the control
 * blue that turns, and keeps turning slowly with a reduced-motion preference. With a label it is a
 * progress bar named by it; without one it is hidden from assistive technology.
 */
export function Spinner({ label, size = 'standard', className, ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={classNames('env-spinner', `env-spinner-${size}`, className)}
    >
      <svg viewBox="0 0 48 48" focusable="false">
        <circle className="env-spinner-arc" cx="24" cy="24" r="20" />
      </svg>
    </span>
  );
}
