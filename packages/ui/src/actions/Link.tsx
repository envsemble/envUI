import { classNames } from '../internal/classNames.js';
import type { ActionElementProps } from '../internal/ActionElement.js';
import { Button, type ButtonAppearanceProps } from './Button.js';

export type LinkProps = Extract<ActionElementProps, { href: string }> &
  Pick<ButtonAppearanceProps, 'underline'>;

/** Inline navigation reuses text-button colors, geometry and behavior. */
export function Link({ underline = true, className, ...props }: LinkProps) {
  return (
    <Button
      {...props}
      variant="text"
      underline={underline}
      className={classNames('env-link', className)}
    />
  );
}
