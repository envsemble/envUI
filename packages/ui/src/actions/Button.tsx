import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { ActionElementProps } from '../internal/ActionElement.js';
import { ButtonBase, type ButtonBaseProps } from './internal/ButtonBase.js';
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
 * buttons take neutral or danger; a secondary button is neutral. The tones nest, so the members
 * below go from the tone every variant takes to the one only primary takes: a variant typed as a
 * union of variants, such as `'primary' | 'secondary'`, type-checks with the tones all of them take.
 */
export type ButtonEmphasisProps =
  | {
      /**
       * The emphasis: primary for the main action of a view, secondary and outline for the rest,
       * ghost for an application's chrome, such as a toolbar, and text for a link-like action.
       * Without it, the button takes the variant its container gives where that variant takes its
       * tone, such as ghost in a toolbar, and else primary.
       * @default 'primary'
       */
      variant?: ButtonVariant;
      /**
       * The meaning: neutral for most actions; accent, on a primary button only, for a rare
       * consequential action, with 0.5 rem corners; danger for an action that deletes or ends
       * something. Secondary buttons are always neutral.
       * @default 'neutral'
       */
      tone?: 'neutral';
    }
  | { variant?: 'primary' | 'outline' | 'ghost' | 'text'; tone?: 'neutral' | 'danger' }
  | { variant?: 'primary'; tone?: ButtonTone };

/**
 * IconButton's designed pairs: as Button's, but without a variant it is a neutral secondary button,
 * so a tone other than neutral needs a variant that takes it.
 */
export type IconButtonEmphasisProps =
  | {
      /**
       * The emphasis, as Button's. Without it, the button takes the variant its container gives,
       * such as ghost in a toolbar, and else secondary.
       * @default 'secondary'
       */
      variant?: ButtonVariant;
      /**
       * The meaning, as Button's: accent on a primary button only, and danger on a primary,
       * outline, ghost or text one. A secondary button is always neutral.
       * @default 'neutral'
       */
      tone?: 'neutral';
    }
  | { variant: 'primary' | 'outline' | 'ghost' | 'text'; tone?: 'neutral' | 'danger' }
  | { variant: 'primary'; tone?: ButtonTone };

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
  /** Fill the width of the container, such as the actions of a narrow form stacked in a column. */
  fullWidth?: boolean;
  /** A decorative icon before the label, such as an Add icon. */
  startIcon?: ReactNode;
  /** A decorative icon after the label, such as a ChevronRight for a next step. */
  endIcon?: ReactNode;
  /**
   * Quiet content at the far end, after the label, such as the Kbd of the shortcut that does the
   * same: it takes the muted color, and in a button wider than its content, such as with
   * fullWidth, it stays at the end while the icon and label stay at the start. Keys shown here
   * take aria-hidden, and the button announces them with aria-keyshortcuts.
   */
  end?: ReactNode;
  /**
   * Work started by this button is running: a spinner replaces the content without changing the
   * button's size, and the button reports busy and ignores activation until pending ends.
   */
  pending?: boolean;
};
export type ButtonProps = ButtonAppearanceProps & ActionElementProps;

/**
 * Starts an action, or goes to a destination with href, in one of five variants and three tones,
 * with optional icons. It renders a native button or link. An icon alone is an IconButton.
 */
export function Button(props: ButtonProps) {
  return <ButtonBase {...props} fallbackVariant="primary" />;
}

/** IconButton's element: a native button, or with href a native link, as Button's. */
type IconButtonElementProps =
  | (Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> & { href?: undefined })
  | (Omit<ComponentPropsWithRef<'a'>, 'children' | 'aria-label'> & {
      /** The destination: the button is a native link, through the LinkProvider's link component. */
      href: string;
      /**
       * A disabled button cannot be pressed; a disabled link has no destination, cannot be focused
       * or followed, and reports aria-disabled.
       */
      disabled?: boolean;
    });

export type IconButtonProps = IconButtonElementProps &
  IconButtonEmphasisProps & {
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
 * A square button that shows its icon alone, named by aria-label, such as a close button with the
 * Close cross; with href, a native link. Without a variant it takes its container's, and else the
 * neutral secondary one.
 */
export function IconButton(props: IconButtonProps) {
  return <ButtonBase {...(props as ButtonBaseProps)} iconOnly fallbackVariant="secondary" />;
}
