import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
// The group restyles the buttons it holds, so Button's style sheet comes first.
import '../styles/Button.css';
import '../styles/ButtonGroup.css';

export interface ButtonGroupProps extends ComponentPropsWithRef<'div'> {
  /** A row of buttons, or a column in which every button is as wide as the group. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Fill the container's width, such as a sidebar's: in a row, labelled buttons share the room the
   * icon-only ones leave, which keep their square size, and a row of icon-only buttons shares it
   * evenly; in a column, every button is as wide as the group.
   */
  fullWidth?: boolean;
}

/** Connected buttons keep their own outer corners and share the row inner radius. */
export function ButtonGroup({
  orientation = 'horizontal',
  fullWidth = false,
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
      data-full-width={flag(fullWidth)}
    />
  );
}
