import type { MouseEvent, ReactNode } from 'react';

/** What every destination has, whichever navigation form shows it. */
interface DestinationFields {
  /**
   * A stable key for the destination, which names a NavigationDrawer section in `expanded` and keys its
   * element; its `href`, or else its label, by default. Give one to a section whose label is
   * translated, so the open sections keep their names in every language.
   */
  id?: string;
  /**
   * The destination's name, such as Inbox: a short noun in sentence case, unique in the list. NavigationBar
   * and NavigationRail show it under the icon, so keep it to one or two short words there.
   */
  label: string;
  /**
   * A count of new things at the destination, such as unread messages: NavigationDrawer shows it at the end of
   * the item, NavigationRail and NavigationBar on the icon. 0 shows nothing, and more than 999 shows 999+. The item's
   * name says it, such as Inbox, 3 new, from messages.navigation.itemCount.
   */
  count?: number;
  /**
   * The heading of the group the destination belongs to, such as Settings. NavigationDrawer shows a heading
   * where the group changes from the destination before; NavigationRail and NavigationBar show the destinations in the
   * same order without headings. Keep a group's destinations next to each other.
   */
  group?: string;
  /**
   * The destination is the page or view shown now: it takes the current fill, fills its Material
   * Symbol and reports aria-current="page". Mark one destination of a list, from the router.
   */
  current?: boolean;
}

/** How a destination is reached: a link, or a button that runs onClick. */
type DestinationTarget =
  | {
      /**
       * The destination's address: the item is a native link, through the LinkProvider's link
       * component, so the application's router follows it.
       */
      href: string;
      /**
       * Runs as the link is followed, such as to close a sheet the navigation sits in;
       * event.preventDefault() keeps the link from being followed.
       */
      onClick?: (event: MouseEvent<HTMLElement>) => void;
    }
  | {
      href?: undefined;
      /** Shows the destination, for a view that changes without an address: the item is a button. */
      onClick: (event: MouseEvent<HTMLElement>) => void;
    };

/** The destinations nested under a destination, which NavigationDrawer shows as a section that opens. */
interface NestedDestinations {
  /**
   * The destinations under this one, such as the pages of a chapter of a guide: NavigationDrawer shows them
   * under it, indented, in a section that opens and closes, open while it holds the current
   * destination. NavigationRail and NavigationBar show only the top level, where a destination whose section holds the
   * current one takes the current fill. NavigationDrawer reads `group` at the top level only.
   */
  children?: readonly NavigationDrawerDestination[];
}

/**
 * One place in the application that NavigationBar, NavigationRail and NavigationDrawer lead to, such as Inbox. The application
 * keeps one array of them and passes the same array to each navigation form it shows.
 */
export type Destination = DestinationFields &
  DestinationTarget &
  NestedDestinations & {
    /**
     * A decorative icon for the destination, such as one of envUI's Material Symbols, which shows
     * filled while the destination is current and outlined otherwise. NavigationBar and NavigationRail show it above
     * the label; NavigationDrawer before it.
     */
    icon: ReactNode;
  };

/**
 * A destination as NavigationDrawer takes it: a Destination, whose icon NavigationDrawer may go without, such as for
 * the sections of a guide, and which may be only the heading of the destinations nested under it;
 * a list for NavigationRail or NavigationBar needs icons and a target for each destination it shows.
 */
export type NavigationDrawerDestination = DestinationFields & {
  /** A decorative icon before the label; leave it out of every destination of a list, or none. */
  icon?: ReactNode;
  /**
   * A short word at the end of the item, after the label and before any count, such as a Badge
   * that says the page is New: part of the item's name, so keep it to a word or two. An item with
   * a count is named by its label and count alone. Drawer alone shows it; Rail and Bar leave it
   * out.
   * @default none
   */
  badge?: ReactNode;
} & (
    | (DestinationTarget & NestedDestinations)
    | {
        href?: undefined;
        onClick?: undefined;
        /**
         * The destinations under this one, which has no address of its own: it is only the
         * heading of its section, a button that opens and closes it.
         */
        children: readonly NavigationDrawerDestination[];
      }
  );
