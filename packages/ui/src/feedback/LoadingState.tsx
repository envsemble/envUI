import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface LoadingStateProps extends ComponentPropsWithRef<'div'> {
  /**
   * What is loading, such as Loading project, which names the region for assistive technology; an
   * aria-label overrides it.
   */
  label?: string;
}

/**
 * A region of placeholders for content that is loading, such as Skeletons in the shape of a card: a
 * status named by label and marked busy, which stacks its children 0.5 rem apart.
 */
export function LoadingState({
  label = 'Loading',
  className,
  children,
  ...props
}: LoadingStateProps) {
  return (
    <div
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? label}
      aria-busy="true"
      className={classNames('env-loading-state', className)}
    >
      {children}
    </div>
  );
}
