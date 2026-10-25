/**
 * The English defaults of the `navigation` messages: Bar, Rail and Drawer. EnvUIProvider's
 * `messages.navigation` overrides any of them.
 */
export const navigation = {
  /** Names the navigation landmark where the application gives it no name of its own. */
  label: 'Main',
  /** Names a destination with a count, such as Inbox, 3 new. */
  itemCount: ({ label, count }: { label: string; count: string }) => `${label}, ${count} new`,
  /** Labels the Bar's last item, which opens the destinations that don't fit in a menu. */
  more: 'More',
  /**
   * Names the Bar's More item while its menu holds the current destination, after its name with any
   * count, such as More, 5 new, current page inside.
   */
  moreCurrent: ({ name }: { name: string }) => `${name}, current page inside`,
  /**
   * Names the button beside a Drawer destination that opens and closes the destinations nested
   * under it, such as Guides contents; its aria-expanded says whether they show.
   */
  contents: ({ label }: { label: string }) => `${label} contents`,
  /** Names the handle that resizes a resizable Drawer. */
  resize: 'Resize navigation',
  /** The resize handle's value: the Drawer's width in rem, such as 17.5 rem, in the locale's digits. */
  width: ({ width }: { width: string }) => `${width} rem`,
};

export type NavigationMessages = typeof navigation;
