/**
 * The English defaults of the `pager` messages: Pager. EnvUIProvider's `messages.pager` overrides
 * any of them.
 */
export const pager = {
  /** Names the navigation. */
  label: 'Previous and next content',
  /** The caption above the previous link. */
  previous: 'Previous',
  /** The caption above the next link. */
  next: 'Up next',
};

export type PagerMessages = typeof pager;
