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
   * sm, 1 rem, inside controls and beside a line of text; md, 1.5 rem, beside a heading or in a
   * panel; or lg, 3 rem, in the middle of a region whose content is on its way.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Work of unknown length in a small area, such as a panel that is updating: an arc in the control
 * blue that turns, and keeps turning slowly with a reduced-motion preference. With a label it is a
 * progress bar named by it; without one it is hidden from assistive technology. The hook
 * --env-spinner-color recolors it, such as to a button's label color.
 */
export function Spinner({ label, size = 'md', className, ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={classNames('env-spinner', className)}
      data-size={size}
    >
      {/* The drawing is decoration: the span carries the name, or hides the whole spinner. */}
      <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
        <circle className="env-spinner-arc" cx="24" cy="24" r="20" />
      </svg>
    </span>
  );
}
