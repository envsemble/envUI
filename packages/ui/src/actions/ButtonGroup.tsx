import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface ButtonGroupProps extends ComponentPropsWithRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

/** Connected buttons keep their own outer corners and share the row inner radius. */
export function ButtonGroup({
  orientation = 'horizontal',
  role = 'group',
  className,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      {...props}
      role={role}
      className={classNames('env-button-group', className)}
      data-orientation={orientation}
    />
  );
}
