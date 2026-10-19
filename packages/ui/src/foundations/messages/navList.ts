/**
 * The English defaults of the `navList` messages: NavList. EnvUIProvider's `messages.navList`
 * overrides any of them.
 */
export const navList = {
  /** Names an icon-only item with a count, such as Inbox, 3 new. */
  itemCount: ({ label, count }: { label: string; count: string }) => `${label}, ${count} new`,
  /**
   * Names an item with end content that is no bare count, such as Inbox, 4 unread from a
   * CounterBadge's aria-label, or Labs, Beta from a Badge.
   */
  itemEnd: ({ label, end }: { label: string; end: string }) => `${label}, ${end}`,
};

export type NavListMessages = typeof navList;
