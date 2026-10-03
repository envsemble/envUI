import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { ActionElement, type ActionElementProps } from './ActionElement.js';

export type ButtonVariant = 'primary' | 'important' | 'secondary' | 'outlined' | 'destructive';

export interface ButtonAppearanceProps {
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
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
  iconOnly = false,
  icon,
  startIcon,
  endIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ActionElement
      {...props}
      className={classNames(
        'env-button',
        `env-button-${variant}`,
        iconOnly && 'env-icon-button',
        className,
      )}
    >
      {iconOnly ? (
        <DecorativeIcon>{icon}</DecorativeIcon>
      ) : (
        <>
          {startIcon != null && <DecorativeIcon>{startIcon}</DecorativeIcon>}
          {children}
          {endIcon != null && <DecorativeIcon>{endIcon}</DecorativeIcon>}
        </>
      )}
    </ActionElement>
  );
}

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  icon: ReactNode;
  'aria-label': string;
  variant?: ButtonVariant;
}

/** Shorthand for Button's icon-only mode, using the neutral secondary variant by default. */
export function IconButton({ variant = 'secondary', ...props }: IconButtonProps) {
  return <Button {...props} variant={variant} iconOnly />;
}
