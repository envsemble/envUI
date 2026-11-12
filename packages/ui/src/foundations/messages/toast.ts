import { plural } from './plural.js';

/**
 * The English defaults of the `toast` messages: ToastProvider and useToast. EnvUIProvider's
 * `messages.toast` overrides any of them.
 */
export const toast = {
  /** Names the notifications at the bottom end: the right, or the left in right-to-left text. */
  regionBottomEnd: 'Notifications',
  /** Names the notifications at the top center. */
  regionTopCenter: 'Top notifications',
  /**
   * The count of notifications waiting behind the shown ones; `countText` is the count in the
   * locale's digits.
   */
  hidden: ({ count, countText }: { count: number; countText: string }) =>
    `${countText} older ${plural(count, 'notification', 'notifications')} hidden`,
  /** A notification's dismiss button. */
  dismiss: 'Dismiss notification',
};
