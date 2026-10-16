import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';
import { Spinner } from '../feedback/Spinner.js';
import type { ControlSize } from '../foundations/Theme.js';

/**
 * A button's emphasis: primary for the main action of a view, secondary and outline for the rest,
 * ghost for an application's chrome, such as a toolbar, and text for a link-like action.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';

/**
 * A button's meaning: neutral for most actions, accent for a rare consequential one that must stand
 * out, and danger for an action that deletes or ends something.
 */
export type ButtonTone = 'neutral' | 'accent' | 'danger';

/**
 * The designed pairs of variant and tone: a primary button takes any tone; outline, ghost and text
 * buttons take neutral or danger; a secondary button is neutral.
 */
export type ButtonEmphasisProps =
  | {
      /**
       * The emphasis: primary for the main action of a view, secondary and outline for the rest,
       * ghost for an application's chrome, such as a toolbar, and text for a link-like action.
       * Without it, the button takes the variant its container gives, such as ghost in a toolbar,
       * and else primary (secondary for IconButton).
       */
      variant?: 'primary';
      /**
       * The meaning: neutral for most actions; accent, on a primary button only, for a rare
       * consequential action, with 0.5 rem corners; danger for an action that deletes or ends
       * something. Secondary buttons are always neutral.
       * @default 'neutral'
       */
      tone?: ButtonTone;
    }
  | { variant: 'outline' | 'ghost' | 'text'; tone?: 'neutral' | 'danger' }
  | { variant: 'secondary'; tone?: 'neutral' };

export type ButtonAppearanceProps = ButtonEmphasisProps & {
  /** Show an underline for the text variant; defaults to false. */
  underline?: boolean;
  /**
   * The height, as on every control: sm, md or lg in the current scale, such as sm for an action
   * in a table cell or lg for the main call to action of a page. Without it, the button takes the
   * control height of its container, md unless the container sets another. A button beside a
   * field takes the field's size.
   */
  size?: ControlSize;
  /**
   * Fill the width of the container, such as the actions of a narrow form stacked in a column.
   * An icon-only button keeps its square size.
   */
  fullWidth?: boolean;
  /** A decorative icon before the label, such as an Add icon. */
  startIcon?: ReactNode;
  /** A decorative icon after the label, such as a ChevronRight for a next step. */
  endIcon?: ReactNode;
  /**
   * Work started by this button is running: a spinner replaces the content without changing the
   * button's size, and the button reports busy and ignores activation until pending ends.
   */
  pending?: boolean;
};
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
 * Starts an action, or goes to a destination with href, in one of five variants and three tones,
 * with optional icons; icon-only with iconOnly. It renders a native button or link.
 */
export function Button(props: ButtonProps) {
  return renderButton(props, 'primary');
}

/** Button with the variant it takes where neither it nor its container sets one. */
function renderButton(
  {
    variant,
    tone,
    underline = false,
    size,
    fullWidth = false,
    iconOnly = false,
    icon,
    startIcon,
    endIcon,
    pending = false,
    className,
    children,
    ...props
  }: ButtonProps,
  fallbackVariant: ButtonVariant,
) {
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
          <Spinner size="small" className="env-button-spinner" />
        </>
      ) : (
        content
      )}
    </ActionElement>
  );
}

export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> &
  ButtonEmphasisProps & {
    /** The icon, such as Settings. */
    icon: ReactNode;
    /** The action's name, which assistive technology announces, such as Open settings. */
    'aria-label': string;
    /** As Button's: a spinner replaces the icon while the work runs. */
    pending?: boolean;
    /** As Button's: the height, and the width, of the square button. */
    size?: ControlSize;
  };

/**
 * Shorthand for Button's icon-only mode. Without a variant it takes its container's, and else the
 * neutral secondary one.
 */
export function IconButton(props: IconButtonProps) {
  return renderButton({ ...props, iconOnly: true } as ButtonProps, 'secondary');
}
