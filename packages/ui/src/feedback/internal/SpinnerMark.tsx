import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';

export interface SpinnerMarkProps extends ComponentPropsWithRef<'span'> {
  /** As Spinner's: sm, md or lg. */
  size?: 'sm' | 'md' | 'lg';
  /** What follows the mark, such as the label a Spinner shows with showLabel. */
  children?: ReactNode;
}

/**
 * Spinner's element and its drawing, envUI's mark, without the label it can show: a busy Button
 * renders it, so its bundle holds no label code.
 */
export function SpinnerMark({ size = 'md', className, children, ...props }: SpinnerMarkProps) {
  return (
    <span {...props} className={classNames('env-spinner', className)} data-size={size}>
      {/* The drawing is decoration: the span carries the name, or hides the whole spinner. The
          mark's four shapes, in the order they take the color: the pill at the top left, the
          circle at the top right, the pill at the bottom right and the circle at the bottom left. */}
      <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
        <rect className="env-spinner-shape" x="0" y="7" width="29.5" height="15.5" rx="7.75" />
        <circle className="env-spinner-shape" cx="40.25" cy="14.75" r="7.75" />
        <rect
          className="env-spinner-shape"
          x="18.5"
          y="25.5"
          width="29.5"
          height="15.5"
          rx="7.75"
        />
        <circle className="env-spinner-shape" cx="7.75" cy="33.25" r="7.75" />
      </svg>
      {children}
    </span>
  );
}
