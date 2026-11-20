import type { ReactElement, ReactNode } from 'react';
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
    iconOnly?: boolean;
    icon?: ReactNode;
    fallbackVariant: ButtonVariant;
    render?: ReactElement;
  };

export function ButtonBase({
  variant,
  tone,
  underline = false,
  size,
  fullWidth = false,
  iconOnly = false,
  icon,
  start,
  end,
  pending = false,
  fallbackVariant,
  className,
  children,
  ...props
}: ButtonBaseProps) {
  const content = iconOnly ? (
    <Slot className="env-button-icon" element="span" layout="row" shrink="never">
      <DecorativeIcon>{icon}</DecorativeIcon>
    </Slot>
  ) : (
    <>
      {start != null && (
        <Slot className="env-button-start" element="span" layout="row" shrink="never" aria-hidden>
          {start}
        </Slot>
      )}
      {children != null && (
        <Slot className="env-button-label" element="span">
          {children}
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
