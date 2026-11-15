import type { ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';
import { DecorativeIcon } from '../../internal/icon/DecorativeIcon.js';
import { ActionElement, type ActionElementProps } from '../../internal/control/ActionElement.js';
import { SpinnerArc } from '../../internal/control/SpinnerArc.js';
import { Slot } from '../../internal/layout/Slot.js';
import type { ButtonAppearanceProps, ButtonVariant } from '../Button.js';
import { flag } from '../../internal/flag.js';
import '../../styles/Base.css';
import '../../styles/Button.css';

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
      {startIcon != null && (
        <Slot className="env-button-start-icon" element="span" layout="row" shrink="never">
          <DecorativeIcon>{startIcon}</DecorativeIcon>
        </Slot>
      )}
      {children != null && (
        <Slot className="env-button-label" element="span">
          {children}
        </Slot>
      )}
      {endIcon != null && (
        <Slot className="env-button-end-icon" element="span" layout="row" shrink="never">
          <DecorativeIcon>{endIcon}</DecorativeIcon>
        </Slot>
      )}
      {end != null && (
        <Slot className="env-button-end" element="span" layout="row" shrink="never">
          {end}
        </Slot>
      )}
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
      data-full-width={flag(fullWidth)}
      className={classNames('env-button', iconOnly && 'env-icon-button', className)}
    >
      {/* While pending, the content stays in place, transparent, and the spinner turns over it in
          the label's own color (Button.css). */}
      {pending ? (
        <>
          <span className="env-button-content">{content}</span>
          <SpinnerArc size="sm" aria-hidden className="env-button-spinner" />
        </>
      ) : (
        content
      )}
    </ActionElement>
  );
}
