/**
 * The English defaults of the `navList` messages: NavList. EnvUIProvider's `messages.navList`
 * overrides any of them.
 */
export const navList = {
  /** Names an icon-only item with a count, such as Inbox, 3 new. */
  itemCount: ({ label, count }: { label: string; count: string }) => `${label}, ${count} new`,
};

export type NavListMessages = typeof navList;
