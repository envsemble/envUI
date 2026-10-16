import { classNames } from '../internal/classNames.js';
import type { ActionElementProps } from '../internal/ActionElement.js';
import { Button } from './Button.js';

export type LinkProps = Extract<ActionElementProps, { href: string }> & {
  /** Underline the link; true by default, so it stands out from the text around it. */
  underline?: boolean;
};

/**
 * A destination inside running text, underlined by default. It is a native link, through the
 * LinkProvider's link component, in the text button's colors.
 */
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
