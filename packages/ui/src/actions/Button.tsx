import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';
import { Spinner } from '../feedback/Spinner.js';

export type ButtonVariant =
  | 'primary'
  | 'important'
  | 'secondary'
  | 'outlined'
  | 'destructive'
  | 'text'
  /** For the application's chrome: the icon color, with a state layer on hover and press. */
  | 'quiet';

export interface ButtonAppearanceProps {
  variant?: ButtonVariant;
  /** Show an underline for the text variant; defaults to false. */
  underline?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /**
   * Work started by this button is running: a spinner replaces the content without changing the
   * button's size, and the button reports busy and ignores activation until pending ends.
   */
  pending?: boolean;
}
export type ButtonProps = ButtonAppearanceProps &
  ActionElementProps &
  (
    | { iconOnly?: false; icon?: never }
    | {
        iconOnly: true;
        icon: ReactNode;
        'aria-label': string;
        children?: never;
        startIcon?: never;
        endIcon?: never;
      }
  );

export function Button({
  variant = 'primary',
  underline = false,
  iconOnly = false,
  icon,
  startIcon,
  endIcon,
  pending = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const content = iconOnly ? (
    <DecorativeIcon>{icon}</DecorativeIcon>
  ) : (
    <>
      {startIcon != null && <DecorativeIcon>{startIcon}</DecorativeIcon>}
      {children}
      {endIcon != null && <DecorativeIcon>{endIcon}</DecorativeIcon>}
    </>
  );
  return (
    <ActionElement
      {...props}
      {...(pending && {
        'aria-busy': true,
        'aria-disabled': true,
        'data-pending': '',
        // Pending blocks activation, including form submission and navigation.
        onClick: (event: MouseEvent<HTMLElement>) => event.preventDefault(),
      })}
      className={classNames(
        'env-button',
        `env-button-${variant}`,
        variant === 'text' && underline && 'env-button-underlined',
        iconOnly && 'env-icon-button',
        className,
      )}
    >
      {pending ? (
        <>
          <span className="env-button-content">{content}</span>
          <Spinner size="small" className="env-button-spinner" />
        </>
      ) : (
        content
      )}
    </ActionElement>
  );
}

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  icon: ReactNode;
  'aria-label': string;
  variant?: ButtonVariant;
  pending?: boolean;
}

/** Shorthand for Button's icon-only mode, using the neutral secondary variant by default. */
export function IconButton({ variant = 'secondary', ...props }: IconButtonProps) {
  return <Button {...props} variant={variant} iconOnly />;
}
