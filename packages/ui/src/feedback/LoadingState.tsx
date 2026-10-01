import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface LoadingStateProps extends ComponentPropsWithRef<'div'> {
  label?: string;
}

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
