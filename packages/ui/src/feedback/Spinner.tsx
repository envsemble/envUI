import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface SpinnerProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Accessible name. Omit it when a busy control or region already announces the work. */
  label?: string;
  /** small 1 rem (inside controls), standard 1.5 rem (default) or large 3 rem. */
  size?: 'small' | 'standard' | 'large';
}

/** Ongoing work of unknown length in a small area, such as a button or a panel that is updating. */
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
