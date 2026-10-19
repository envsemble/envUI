/**
 * The English defaults of the `relativeTime` messages: RelativeTime and formatRelativeTime.
 * EnvUIProvider's `messages.relativeTime` overrides any of them.
 */
export const relativeTime = {
  /** A moment that has just passed, where Intl would say now. */
  now: 'just now',
};

export type RelativeTimeMessages = typeof relativeTime;
