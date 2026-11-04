import type { ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import { ActionElement, type ActionElementProps } from '../../internal/ActionElement.js';
import { SpinnerArc } from '../../feedback/internal/SpinnerArc.js';
import { textRuns } from '../../internal/textRuns.js';
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
  const spinner = <SpinnerArc size="sm" aria-hidden className="env-button-spinner" />;
  // While pending, a start icon gives its place to the spinner; without one, the spinner stands
  // before the label, which keeps its place (Button.css). Either way it stays out of the subdued
  // content, in the label's own color.
  const pendingIcon = pending && !iconOnly && startIcon != null;
  const content = iconOnly ? (
    <DecorativeIcon>{icon}</DecorativeIcon>
  ) : (
    <>
      {startIcon != null && !pendingIcon && <DecorativeIcon>{startIcon}</DecorativeIcon>}
      {/* Words and a number in their line, such as Show 12 tasks, stay one line of text, which the
          button's gap would otherwise space out. */}
      {textRuns(children, 'env-button-text')}
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
      data-full-width={flag(fullWidth)}
      className={classNames('env-button', iconOnly && 'env-icon-button', className)}
    >
      {pending ? (
        <>
          {pendingIcon ? <DecorativeIcon>{spinner}</DecorativeIcon> : !iconOnly && spinner}
          <span className="env-button-content">{content}</span>
          {iconOnly && spinner}
        </>
      ) : (
        content
      )}
    </ActionElement>
  );
}
