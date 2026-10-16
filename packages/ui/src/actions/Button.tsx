import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';
import { Spinner } from '../feedback/Spinner.js';
import type { ControlSize } from '../foundations/Theme.js';

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
  /**
   * The emphasis: primary for the main action of a view, important for a rare consequential one,
   * secondary and outlined for the rest, destructive for an action that deletes or ends something,
   * text for a link-like action and quiet for an application's chrome, such as a toolbar.
   */
  variant?: ButtonVariant;
  /** Show an underline for the text variant; defaults to false. */
  underline?: boolean;
  /**
   * The height, as on every control: sm, md or lg in the current scale, such as sm for an action
   * in a table cell or lg for the main call to action of a page. Without it, the button takes the
   * control height of its container, md unless the container sets another. A button beside a
   * field takes the field's size.
   */
  size?: ControlSize;
  /** A decorative icon before the label, such as an Add icon. */
  startIcon?: ReactNode;
  /** A decorative icon after the label, such as a ChevronRight for a next step. */
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
        /** Show only icon, in a square button that keeps its size; name it with aria-label. */
        iconOnly: true;
        /** The icon of an icon-only button. */
        icon: ReactNode;
        /** The action's name, such as Delete draft, for an icon-only button. */
        'aria-label': string;
        children?: never;
        startIcon?: never;
        endIcon?: never;
      }
  );

/**
 * Starts an action, or goes to a destination with href, in one of seven emphases, with optional
 * icons; icon-only with iconOnly. It renders a native button or link.
 */
export function Button({
  variant = 'primary',
  underline = false,
  size,
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
      pending={pending}
      data-size={size}
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
  /** The icon, such as Settings. */
  icon: ReactNode;
  /** The action's name, which assistive technology announces, such as Open settings. */
  'aria-label': string;
  /** As Button's; secondary by default. */
  variant?: ButtonVariant;
  /** As Button's: a spinner replaces the icon while the work runs. */
  pending?: boolean;
  /** As Button's: the height, and the width, of the square button. */
  size?: ControlSize;
}

/** Shorthand for Button's icon-only mode, using the neutral secondary variant by default. */
export function IconButton({ variant = 'secondary', ...props }: IconButtonProps) {
  return <Button {...props} variant={variant} iconOnly />;
}
