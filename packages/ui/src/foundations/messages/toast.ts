import { plural } from './plural.js';

/**
 * The English defaults of the `toast` messages: Toast.Provider and useToast. EnvUIProvider's
 * `messages.toast` overrides any of them.
 */
export const toast = {
  /** Names the notifications at the bottom end: the right, or the left in right-to-left text. */
  regionBottomEnd: 'Notifications',
  /** Names the notifications at the top center. */
  regionTopCenter: 'Top notifications',
  /** The count of notifications waiting behind the shown ones. */
  hidden: ({ count }: { count: number }) =>
    `${count} older ${plural(count, 'notification', 'notifications')} hidden`,
  /** A notification's dismiss button. */
  dismiss: 'Dismiss notification',
};

export type ToastMessages = typeof toast;
