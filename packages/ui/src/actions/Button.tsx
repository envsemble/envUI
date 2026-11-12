import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { ActionElementProps } from '../internal/control/ActionElement.js';
import type { ControlTone, ControlVariant } from '../internal/control/ControlDefaults.js';
import { ButtonBase, type ButtonBaseProps } from './internal/ButtonBase.js';
import type { ControlSize } from '../foundations/Theme.js';

/**
 * A button's emphasis: primary for the main action of a view, secondary and outline for the rest,
 * ghost for an application's chrome, such as a toolbar, and text for a link-like action.
 */
export type ButtonVariant = ControlVariant;

/**
 * A button's meaning: neutral for most actions, accent for a rare consequential one that must stand
 * out, and danger for an action that deletes or ends something.
 */
export type ButtonTone = ControlTone;

/**
 * The designed pairs of variant and tone: a primary button takes any tone; outline, ghost and text
 * buttons take neutral or danger; a secondary button is neutral. The tones nest, so the members
 * below go from the tone every variant takes to the one only primary takes: a variant typed as a
 * union of variants, such as `'primary' | 'secondary'`, type-checks with the tones all of them take.
 */
export type ButtonEmphasisProps =
  | {
      /**
       * The emphasis, primary for a group's main action; without it, the container's, such as ghost
       * in a toolbar, and else primary.
       * @default 'primary'
       */
      variant?: ButtonVariant;
      /**
       * The meaning: neutral for most actions, danger for one that deletes or ends something, and
       * accent, on a primary only, for a main action that must stand apart from the brand blue.
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
       * The meaning, as Button's.
       * @default 'neutral'
       */
      tone?: 'neutral';
    }
  | { variant: 'primary' | 'outline' | 'ghost' | 'text'; tone?: 'neutral' | 'danger' }
  | { variant: 'primary'; tone?: ButtonTone };

export type ButtonAppearanceProps = ButtonEmphasisProps & {
  /**
   * Show an underline for the text variant.
   * @default false
   */
  underline?: boolean;
  /** The control height, sm, md or lg; without it, the container's, and else md. */
  size?: ControlSize;
  /**
   * Fill the width of the container, such as the actions of a narrow form stacked in a column.
   * @default false
   */
  fullWidth?: boolean;
  /** A decorative icon before the label, such as IconAdd. */
  startIcon?: ReactNode;
  /** A decorative icon after the label, such as a ChevronRight for a next step. */
  endIcon?: ReactNode;
  /**
   * Quiet content at the far end, such as a shortcut's Kbd, with aria-hidden on its keys and
   * aria-keyshortcuts on the button.
   */
  end?: ReactNode;
  /**
   * Its work is running: a spinner turns over it, it keeps its width and name, and presses do
   * nothing.
   * @default false
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
       * @default false
       */
      disabled?: boolean;
    });

/** The button needs a name: aria-label, or aria-labelledby where visible text names it. */
type IconButtonName =
  | {
      /** The action's name, which assistive technology announces, such as Open settings. */
      'aria-label': string;
      /** The id of visible text that names the action; this or aria-label. */
      'aria-labelledby'?: string;
    }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type IconButtonProps = IconButtonElementProps &
  IconButtonEmphasisProps &
  IconButtonName & {
    /** The icon, such as Settings. */
    icon: ReactNode;
    /**
     * As Button's: a spinner replaces the icon while the work runs.
     * @default false
     */
    pending?: boolean;
    /** As Button's: the height, and the width, of the square button. */
    size?: ControlSize;
  };

/**
 * A square button that shows its icon alone, named by aria-label or aria-labelledby, such as a
 * close button with the Close cross; with href, a native link. Without a variant it takes its
 * container's, and else the neutral secondary one.
 */
export function IconButton(props: IconButtonProps) {
  return <ButtonBase {...(props as ButtonBaseProps)} iconOnly fallbackVariant="secondary" />;
}
