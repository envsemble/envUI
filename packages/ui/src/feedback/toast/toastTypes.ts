import type { ReactNode } from 'react';

/**
 * What a notification means, which sets its fill and icon: neutral (no icon), success, info or
 * danger, for an error.
 */
export type ToastTone = 'neutral' | 'success' | 'info' | 'danger';
/**
 * Where notifications show: bottom-end stacks upward from the bottom corner at the end of the
 * line, the right in left-to-right text and the left in right-to-left text; top-center stacks
 * downward from the top of the window.
 */
export type ToastPlacement = 'bottom-end' | 'top-center';
/**
 * A button a notification offers, such as Undo, with what it runs, or a link, such as View, with
 * the address it leads to.
 */
export type ToastAction =
  | {
      /** The button's label: a short verb, such as Undo, Retry or View. */
      label: string;
      /**
       * Runs when the button is pressed. The notification stays; dismiss it from here with the id
       * that show returned, as an undo does once it has run.
       */
      onClick: () => void;
      href?: undefined;
    }
  | {
      /** The link's label: a short verb, such as View or Open. */
      label: string;
      /**
       * The address the action leads to, such as the new item's page: the action is a link,
       * through the LinkProvider's link component.
       */
      href: string;
      /** Runs as the link is followed, such as to record it. */
      onClick?: () => void;
    };
/** A notification to show with useToast().show(). */
export interface ToastNotification {
  /**
   * What happened, in a short sentence, such as Changes saved: text, or content such as the name
   * of what changed in bold or a link to it. It wraps to three lines; the full text stays in its
   * title and its announcement.
   */
  message: ReactNode;
  /**
   * The message as plain text, for its native title and its announcement, where the message's
   * text isn't it.
   * @default the message when it is a string, else the message's rendered text
   */
  textValue?: string;
  /**
   * Replaces the tone's icon before the message, such as an Avatar for a mention; null or false
   * shows none. It is decorative.
   */
  icon?: ReactNode;
  /**
   * What the notification means: neutral, success, info or danger. A danger notification persists
   * until it is dismissed, is announced at once as an alert and is never hidden behind the count
   * of older notifications.
   * @default 'neutral'
   */
  tone?: ToastTone;
  /**
   * The notification's buttons and links, such as Undo, or Undo and View, shown in the order given
   * with the main one last; they wrap onto more lines when they don't fit beside the message. A
   * notification with an action persists until it is dismissed, unless duration is set.
   */
  actions?: readonly ToastAction[];
  /**
   * Where this notification shows, bottom-end or top-center, instead of the provider's
   * defaultPlacement.
   */
  placement?: ToastPlacement;
  /**
   * Whether the notification has a dismiss button. Without one, it still closes after its
   * duration, with Esc while it has focus and with dismiss.
   * @default true
   */
  dismissible?: boolean;
  /**
   * Milliseconds the notification stays visible before it closes. The time counts only while it is
   * visible, it pauses on hover and keyboard focus, and it starts again in full when the
   * notification returns from behind the hidden count. Infinity or 0 keeps it until it is
   * dismissed; a negative number throws a RangeError.
   * @default 5000, or Infinity for danger notifications and notifications with an action
   */
  duration?: number;
}
/** Shows and dismisses the notifications of the nearest ToastProvider; useToast returns it. */
export interface ToastManager {
  /**
   * Shows a notification at once and returns its id, for dismiss. Throws a RangeError for an
   * invalid duration or placement.
   */
  show: (notification: ToastNotification) => string;
  /** Dismisses the notification with the id that show returned; a dismissed id does nothing. */
  dismiss: (id: string) => void;
  /** Dismisses every notification of the provider, in both placements. */
  clear: () => void;
}
export interface ToastProviderProps {
  /** The application, or the part of it whose components call useToast. */
  children: ReactNode;
  /**
   * Where notifications show unless show names a placement: bottom-end, stacking upward from the
   * bottom corner at the end of the line, or top-center, stacking downward from the top.
   * @default 'bottom-end'
   */
  defaultPlacement?: ToastPlacement;
  /**
   * How many notifications each placement shows at once, a positive integer. The newest stay
   * visible; older ones wait behind a count of hidden notifications and come back as newer ones
   * close. Danger notifications always show, and take their places first.
   * @default 3
   */
  limit?: number;
}
