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
export type ButtonProps = ButtonAppearanceProps & ActionElementProps;

export function Button({
  variant = 'primary',
  startIcon,
  endIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ActionElement
      {...props}
      className={classNames('env-button', `env-button-${variant}`, className)}
    >
      {startIcon != null && <DecorativeIcon>{startIcon}</DecorativeIcon>}
      {children}
      {endIcon != null && <DecorativeIcon>{endIcon}</DecorativeIcon>}
    </ActionElement>
  );
}

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  icon: ReactNode;
  'aria-label': string;
}

export function IconButton({ icon, className, ...props }: IconButtonProps) {
  return (
    <Button {...props} className={classNames('env-icon-button', className)}>
      <DecorativeIcon>{icon}</DecorativeIcon>
    </Button>
  );
}
