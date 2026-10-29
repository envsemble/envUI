import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';
import '../../styles/Base.css';
import '../../styles/Spinner.css';

export interface SpinnerArcProps extends ComponentPropsWithRef<'span'> {
  /** As Spinner's: sm, md or lg. */
  size?: 'sm' | 'md' | 'lg';
  /** What follows the arc, such as the label a Spinner shows with showLabel. */
  children?: ReactNode;
}

/**
 * Spinner's element and its turning arc, without the label it can show: a busy Button renders
 * it, so its bundle holds no label code. Alone, with nothing after the arc, it is marked
 * data-label-hidden, so it takes the arc's own look and color rather than a labelled status line's.
 */
export function SpinnerArc({ size = 'md', className, children, ...props }: SpinnerArcProps) {
  return (
    <span
      data-label-hidden={children == null ? '' : undefined}
      {...props}
      className={classNames('env-spinner', className)}
      data-size={size}
    >
      {/* The drawing is decoration: the span carries the name, or hides the whole spinner. */}
      <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
        <circle className="env-spinner-arc" cx="24" cy="24" r="20" />
      </svg>
      {children}
    </span>
  );
}
