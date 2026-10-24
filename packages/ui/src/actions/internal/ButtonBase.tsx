import type { ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import { ActionElement, type ActionElementProps } from '../../internal/ActionElement.js';
import { SpinnerIndicator } from '../../feedback/internal/SpinnerIndicator.js';
import type { ButtonAppearanceProps, ButtonVariant } from '../Button.js';

export type ButtonBaseProps = ButtonAppearanceProps &
  ActionElementProps & {
    /** Its icon alone, in a square button that keeps its size: IconButton's form. */
    iconOnly?: boolean;
    /** The icon of the icon-only form. */
    icon?: ReactNode;
    /** The variant it takes where neither it nor its container sets one. */
    fallbackVariant: ButtonVariant;
  };

/**
 * What Button and IconButton render, as one component: a button that turns from one form into the
 * other, as ConfirmButton does when it arms, keeps its element and so its focus.
 */
export function ButtonBase({
  variant,
  tone,
  underline = false,
  size,
  fullWidth = false,
  iconOnly = false,
  icon,
  startIcon,
  endIcon,
  end,
  pending = false,
  fallbackVariant,
  className,
  children,
  ...props
}: ButtonBaseProps) {
  const content = iconOnly ? (
    <DecorativeIcon>{icon}</DecorativeIcon>
  ) : (
    <>
      {startIcon != null && <DecorativeIcon>{startIcon}</DecorativeIcon>}
      {children}
      {endIcon != null && <DecorativeIcon>{endIcon}</DecorativeIcon>}
      {end != null && <span className="env-button-end">{end}</span>}
    </>
  );
  return (
    <ActionElement
      {...props}
      pending={pending}
      emphasis={{
        variant,
        fallbackVariant,
        tone,
        size,
        underline,
      }}
      data-full-width={fullWidth || undefined}
      className={classNames('env-button', iconOnly && 'env-icon-button', className)}
    >
      {pending ? (
        <>
          <span className="env-button-content">{content}</span>
          <SpinnerIndicator size="sm" aria-hidden className="env-button-spinner" />
        </>
      ) : (
        content
      )}
    </ActionElement>
  );
}
