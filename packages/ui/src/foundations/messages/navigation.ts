/**
 * The English defaults of the `navigation` messages: Bar, Rail and Drawer. EnvUIProvider's
 * `messages.navigation` overrides any of them.
 */
export const navigation = {
  /** Names the navigation landmark where the application gives it no name of its own. */
  label: 'Main',
  /** Names a destination with a count, such as Inbox, 3 new. */
  itemCount: ({ label, count }: { label: string; count: string }) => `${label}, ${count} new`,
  /** Says a count on its own, such as 3 new, beside a destination in the Bar's More menu. */
  count: ({ count }: { count: string }) => `${count} new`,
  /** Labels the Bar's last item, which opens the destinations that don't fit in a menu. */
  more: 'More',
};

export type NavigationMessages = typeof navigation;
