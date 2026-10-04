import { classNames } from '../internal/classNames.js';
import type { ActionElementProps } from './ActionElement.js';
import { Button, type ButtonAppearanceProps } from './Button.js';

export type LinkProps = Extract<ActionElementProps, { href: string }> &
  Pick<ButtonAppearanceProps, 'underline'>;

/** Inline navigation shares text-button colors, focus and disabled behavior. */
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
